'use client';

import { Shipment, Prediction } from '@/types';
import { AlertTriangle, TrendingUp, Clock, ChevronRight } from 'lucide-react';

interface AlertDashboardProps {
  shipments: Shipment[];
  predictions: Prediction[];
}

function getRiskBar(prob: number) {
  const color = prob >= 0.7 ? 'bg-red-500' : prob >= 0.4 ? 'bg-amber-500' : 'bg-green-500';
  return (
    <div className="w-full bg-white/5 rounded-full h-1.5 mt-1">
      <div
        className={`h-1.5 rounded-full transition-all duration-700 ${color}`}
        style={{ width: `${prob * 100}%` }}
      />
    </div>
  );
}

export default function AlertDashboard({ shipments, predictions }: AlertDashboardProps) {
  // Build prediction map
  const predMap = new Map<string, Prediction>();
  predictions.forEach(p => { if (!predMap.has(p.shipmentId)) predMap.set(p.shipmentId, p); });

  // Get shipments enriched with prediction, merged in too (from API enriched format)
  const enriched = shipments
    .map(s => {
      const pred = predMap.get(s.shipmentId) || null;
      return { shipment: s, prediction: pred };
    })
    .filter((x): x is { shipment: Shipment; prediction: Prediction } => x.prediction !== null && x.prediction.disruptionProbability >= 0.35)
    .sort((a, b) => (b.prediction?.disruptionProbability || 0) - (a.prediction?.disruptionProbability || 0))
    .slice(0, 15);

  return (
    <div className="bg-surface border border-white/10 rounded-2xl p-6 max-h-[700px] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-500/10 rounded-lg border border-red-500/20">
            <AlertTriangle className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">High-Risk Alerts</h2>
            <p className="text-xs text-muted font-mono">Real-time disruption monitoring</p>
          </div>
        </div>
        <span className="px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full text-xs font-mono">
          {enriched.filter(x => (x.prediction?.disruptionProbability || 0) >= 0.7).length} critical
        </span>
      </div>

      {/* List */}
      <div className="overflow-y-auto flex-1 space-y-3 pr-1">
        {enriched.length === 0 ? (
          <div className="text-center py-16 text-muted">
            <TrendingUp className="w-10 h-10 mx-auto mb-3 text-green-500 opacity-50" />
            <p className="text-sm">No high-risk shipments detected</p>
            <p className="text-xs mt-1">Trigger an agent cycle to generate predictions</p>
          </div>
        ) : (
          enriched.map(({ shipment, prediction }, i) => {
            const prob = prediction?.disruptionProbability || 0;
            const riskColor = prob >= 0.7 ? 'text-red-400 bg-red-500/10 border-red-500/30'
              : prob >= 0.4 ? 'text-amber-400 bg-amber-500/10 border-amber-500/30'
              : 'text-green-400 bg-green-500/10 border-green-500/30';
            const riskLabel = prob >= 0.7 ? 'HIGH' : prob >= 0.4 ? 'MED' : 'LOW';

            return (
              <div
                key={shipment.shipmentId || i}
                className="border border-white/8 rounded-xl p-4 hover:border-white/20 hover:bg-white/2 transition-all fade-up group"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-white font-mono">{shipment.shipmentId}</span>
                      {shipment.customerPriority === 'critical' && (
                        <span className="px-1.5 py-0.5 bg-red-500/20 text-red-400 text-xs rounded font-bold">CRITICAL</span>
                      )}
                      {shipment.status === 'rerouted' && (
                        <span className="px-1.5 py-0.5 bg-cyan/10 text-cyan text-xs rounded font-mono">rerouted</span>
                      )}
                    </div>
                    <p className="text-xs text-muted mt-0.5">
                      {shipment.origin?.city} → {shipment.destination?.city}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-lg text-xs font-black border ${riskColor}`}>
                    {riskLabel}
                  </span>
                </div>

                {/* Risk probability bar */}
                <div className="mb-3">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted">Disruption Probability</span>
                    <span className={prob >= 0.7 ? 'text-red-400' : prob >= 0.4 ? 'text-amber-400' : 'text-green-400'}>
                      {(prob * 100).toFixed(1)}%
                    </span>
                  </div>
                  {getRiskBar(prob)}
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div>
                    <p className="text-muted">Delay</p>
                    <p className="font-bold text-white">{prediction?.expectedDelayMinutes || 0}min</p>
                  </div>
                  <div>
                    <p className="text-muted">Weather Sev.</p>
                    <p className="font-bold text-white">{prediction?.weatherSeverity?.toFixed(1) || '—'}/10</p>
                  </div>
                  <div>
                    <p className="text-muted">Value</p>
                    <p className="font-bold text-white">${((shipment.valueUsd || 0) / 1000).toFixed(0)}k</p>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between mt-3 text-xs text-muted">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {shipment.carrier}</span>
                  <span className="flex items-center gap-1 group-hover:text-cyan transition-colors">
                    {prediction?.confidenceScore ? `${(prediction.confidenceScore * 100).toFixed(0)}% confidence` : ''}
                    <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
