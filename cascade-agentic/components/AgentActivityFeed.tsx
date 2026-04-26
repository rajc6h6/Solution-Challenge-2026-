'use client';

import { useMemo } from 'react';

interface DecisionItem {
  id: string;
  shipmentId?: string;
  action?: string;
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

function formatAgo(value: unknown): string {
  const date = toDate(value);
  if (!date) return 'just now';
  const diff = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return date.toLocaleString();
}

export default function AgentActivityFeed({ decisions }: { decisions: DecisionItem[] }) {
  const ordered = useMemo(
    () =>
      [...decisions].sort((a, b) => {
        const ad = toDate(a.executedAt)?.getTime() ?? 0;
        const bd = toDate(b.executedAt)?.getTime() ?? 0;
        return bd - ad;
      }),
    [decisions]
  );

  return (
    <div className="bg-surface/50 border border-white/10 rounded-lg shadow-lg p-4">
      <h2 className="text-lg font-bold mb-4 text-white">🤖 CASCADE Agent Activity (Live)</h2>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {ordered.length === 0 && (
          <div className="text-sm text-muted">
            No autonomous actions yet. Trigger the agent run function or wait for the scheduler.
          </div>
        )}

        {ordered.map((decision) => (
          <div key={decision.id} className="border-l-4 border-green-500 bg-green-500/10 p-3 rounded">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-sm text-white">✅ Auto-executed: {decision.action || 'action'}</p>
                <p className="text-xs text-cyan">Shipment: {decision.shipmentId || 'unknown'}</p>
                {decision.details?.reason && (
                  <p className="text-xs text-muted mt-1">{decision.details.reason}</p>
                )}
                {decision.details?.oldRoute && decision.details?.newRoute && (
                  <p className="text-xs text-muted mt-1">
                    {decision.details.oldRoute} → {decision.details.newRoute}
                  </p>
                )}
              </div>
              <span className="text-xs text-muted">{formatAgo(decision.executedAt)}</span>
            </div>

            <div className="mt-2 flex gap-2 text-xs flex-wrap">
              {decision.mcpActions?.gmailSent && (
                <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded">📧 Driver notified</span>
              )}
              {decision.mcpActions?.calendarUpdated && (
                <span className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded">📅 Calendar updated</span>
              )}
              {decision.mcpActions?.sheetLogged && (
                <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded">📊 Logged to Sheets</span>
              )}
            </div>

            {decision.demoMode && (
              <p className="text-xs text-muted mt-2 italic">
                Demo mode: Actions simulated (production would execute via MCPs).
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
