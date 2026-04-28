'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  where,
} from 'firebase/firestore';
import { Shield, Play } from 'lucide-react';
import { db } from '@/lib/firebase';
import { DashboardStats, Prediction, Shipment } from '@/types';
import StatsCards from '@/components/StatsCards';
import AlertDashboard from '@/components/AlertDashboard';
import ShipmentMap from '@/components/ShipmentMap';
import AgentActivityFeed from '@/components/AgentActivityFeed';
import AudioInterface from '@/components/AudioInterface';

interface DecisionFeedItem {
  id: string;
  shipmentId?: string;
  action?: string;
  executedBy?: string;
  executedAt?: unknown;
  details?: {
    reason?: string;
    oldRoute?: string;
    newRoute?: string;
    costImpact?: number;
    savedPenalty?: number;
  };
  mcpActions?: {
    gmailSent?: boolean;
    calendarUpdated?: boolean;
    sheetLogged?: boolean;
  };
  demoMode?: boolean;
}

function toDate(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === 'object' && value !== null) {
    const timestamp = value as { toDate?: () => Date; seconds?: number };
    if (typeof timestamp.toDate === 'function') return timestamp.toDate();
    if (typeof timestamp.seconds === 'number') return new Date(timestamp.seconds * 1000);
    return null;
  }
  if (typeof value !== 'string' && typeof value !== 'number') return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export default function Dashboard() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [decisions, setDecisions] = useState<DecisionFeedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [runStatus, setRunStatus] = useState('');
  const [agentRunning, setAgentRunning] = useState(false);

  // Auto-trigger agent monitoring every 5 minutes
  useEffect(() => {
    const runAgent = async () => {
      try {
        const response = await fetch('/api/agent/monitor', { method: 'POST' });
        const data = await response.json();
        if (data.success) {
          console.log('Agent cycle completed:', data);
        }
      } catch (error) {
        console.error('Agent monitoring failed:', error);
      }
    };

    // Run immediately on mount
    runAgent();

    // Then every 5 minutes
    const interval = setInterval(runAgent, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const shipmentsQuery = query(
      collection(db, 'shipments'),
      where('status', 'in', ['active', 'at_risk', 'rerouted']),
      limit(1000)
    );
    const predictionsQuery = query(
      collection(db, 'predictions'),
      orderBy('predictionTime', 'desc'),
      limit(1000)
    );
    const decisionsQuery = query(
      collection(db, 'decisions'),
      orderBy('executedAt', 'desc'),
      limit(80)
    );

    const unsubShipments = onSnapshot(shipmentsQuery, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ ...(doc.data() as Shipment), id: doc.id }));
      setShipments(data);
      setIsLoading(false);
    });

    const unsubPredictions = onSnapshot(predictionsQuery, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ ...(doc.data() as Prediction), id: doc.id }));
      setPredictions(data);
    });

    const unsubDecisions = onSnapshot(decisionsQuery, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ ...(doc.data() as DecisionFeedItem), id: doc.id }));
      setDecisions(data);
    });

    return () => {
      unsubShipments();
      unsubPredictions();
      unsubDecisions();
    };
  }, []);

  const latestPredictions = useMemo(() => {
    const map = new Map<string, Prediction>();
    for (const prediction of predictions) {
      if (!prediction.shipmentId || map.has(prediction.shipmentId)) continue;
      map.set(prediction.shipmentId, prediction);
    }
    return Array.from(map.values());
  }, [predictions]);

  const stats: DashboardStats = useMemo(() => {
    const totalShipments = shipments.length;
    const activeShipments = shipments.filter((shipment) => shipment.status === 'active').length;
    const atRiskShipments = shipments.filter((shipment) => shipment.status === 'at_risk').length;
    const reroutedShipments = new Set(
      decisions
        .filter((d) => d.action === 'auto_reroute')
        .map((d) => d.shipmentId)
    ).size;
    const avgDisruptionProbability =
      latestPredictions.length > 0
        ? latestPredictions.reduce((sum, prediction) => sum + prediction.disruptionProbability, 0) /
          latestPredictions.length
        : 0;
    const totalValueAtRisk = shipments
      .filter((shipment) => shipment.status === 'at_risk' || shipment.status === 'rerouted')
      .reduce((sum, shipment) => sum + (shipment.valueUsd || 0), 0);

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    // Count unique shipments rerouted today, not total reroute actions
    const autonomousActionsToday = new Set(
      decisions
        .filter((decision) => {
          const executedAt = toDate(decision.executedAt);
          return (
            decision.executedBy === 'CASCADE_AGENT' &&
            decision.action === 'auto_reroute' &&
            executedAt !== null &&
            executedAt >= todayStart
          );
        })
        .map((d) => d.shipmentId)
    ).size;

    return {
      totalShipments,
      activeShipments,
      atRiskShipments,
      reroutedShipments,
      avgDisruptionProbability,
      totalValueAtRisk,
      autonomousActionsToday,
    };
  }, [decisions, latestPredictions, shipments]);

  async function triggerAgentNow() {
    setAgentRunning(true);
    try {
      const response = await fetch('/api/agent/monitor', { method: 'POST' });
      const payload = await response.json();
      if (!response.ok || !payload.success) {
        throw new Error(payload.error || 'Agent run failed');
      }
      setRunStatus(`Agent executed: ${payload.autoExecuted} auto actions, ${payload.escalated} escalations, ${payload.processed} processed.`);
    } catch (error) {
      setRunStatus(`Manual trigger failed: ${String(error)}`);
    } finally {
      setAgentRunning(false);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-obsidian flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-cyan font-mono text-lg">CASCADE INITIALIZING...</p>
          <p className="text-muted text-sm mt-2">Connecting to Firestore listeners</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-obsidian text-white font-sans">
      <header className="border-b border-white/10 bg-surface/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-screen-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-lg bg-cyan/10 border border-cyan/30">
              <Shield className="w-7 h-7 text-cyan" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white">
                CASCADE <span className="text-cyan">AGENT</span>
              </h1>
              <p className="text-xs text-muted font-mono">Firestore-first UI · Cloud Functions orchestrator</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={triggerAgentNow}
              disabled={agentRunning}
              className={`px-3 py-2 rounded-lg text-xs font-semibold border ${
                agentRunning
                  ? 'bg-purple-800/30 text-purple-300 border-purple-600/50 cursor-wait'
                  : 'bg-purple-600 text-white border-purple-400/50 hover:bg-purple-500'
              }`}
            >
              <span className="inline-flex items-center gap-1">
                <Play className="w-3 h-3" />
                {agentRunning ? 'Running…' : 'Run Agent Now'}
              </span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-screen-2xl mx-auto px-6 py-8 space-y-8">
        {runStatus && (
          <div className="text-xs bg-white/5 border border-white/10 rounded-lg px-3 py-2">{runStatus}</div>
        )}

        <StatsCards stats={stats} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AudioInterface />
          <AgentActivityFeed decisions={decisions} />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <AlertDashboard shipments={shipments} predictions={latestPredictions} />
          <ShipmentMap shipments={shipments} predictions={latestPredictions} />
        </div>
      </main>
    </div>
  );
}
