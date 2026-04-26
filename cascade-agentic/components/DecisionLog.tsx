'use client';

import type { ReactNode } from 'react';
import { Decision, ActionLog } from '@/types';
import { Zap, Mail, Calendar, Sheet, ArrowRight, User, Bot } from 'lucide-react';

interface DecisionLogProps {
  decisions: Decision[];
  actions?: ActionLog[];
}

function timeAgo(date: unknown): string {
  try {
    const d = date instanceof Date ? date : new Date(typeof date === 'object' && date !== null && 'seconds' in date ? (date as Record<string, unknown>).seconds as number * 1000 : date as string | number);
    const diff = Math.floor((Date.now() - d.getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch { 
    return 'recently'; 
  }
}

function actionBadge(label: string, simulated: boolean, icon: ReactNode) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono ${
      simulated
        ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
        : 'bg-green-500/10 text-green-400 border border-green-500/20'
    }`}>
      {icon}
      {label}
      {simulated && <span className="text-yellow-500/70">[sim]</span>}
    </span>
  );
}

function getActionLabel(action: string): { label: string; color: string, bg: string } {
  switch (action) {
    case 'reroute': return { label: '🔀 REROUTED', color: 'text-cyan', bg: 'bg-cyan/10 border-cyan/20' };
    case 'escalate': return { label: '⚠ ESCALATED', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' };
    case 'accept_delay': return { label: '📡 MONITORED', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' };
    case 'expedite': return { label: '🚀 EXPEDITED', color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' };
    default: return { label: action.toUpperCase(), color: 'text-muted', bg: 'bg-white/5 border-white/10' };
  }
}

export default function DecisionLog({ decisions, actions = [] }: DecisionLogProps) {
  const hasData = decisions.length > 0;

  return (
    <div className="bg-surface border border-white/10 rounded-2xl p-6 max-h-[700px] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/10 rounded-lg border border-purple-500/20">
            <Zap className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Agent Decision Log</h2>
            <p className="text-xs text-muted font-mono">Autonomous actions via MCP integrations</p>
          </div>
        </div>
        <span className="px-3 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-full text-xs font-mono">
          {decisions.length} decisions
        </span>
      </div>

      {/* MCP Status Row */}
      <div className="grid grid-cols-3 gap-2 mb-4 shrink-0">
        {[
          { name: 'Gmail', icon: <Mail className="w-3 h-3" />, count: decisions.filter(d => d.mcpActions?.gmailSent).length },
          { name: 'Calendar', icon: <Calendar className="w-3 h-3" />, count: decisions.filter(d => d.mcpActions?.calendarUpdated).length },
          { name: 'Sheets', icon: <Sheet className="w-3 h-3" />, count: decisions.filter(d => d.mcpActions?.sheetLogged).length },
        ].map(m => (
          <div key={m.name} className="bg-black/30 border border-white/5 rounded-xl p-3 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1 text-muted">{m.icon}<span className="text-xs">{m.name}</span></div>
            <div className="text-lg font-black text-white">{m.count}</div>
            <div className="text-xs text-muted">MCP calls</div>
          </div>
        ))}
      </div>

      {/* Decisions List */}
      <div className="overflow-y-auto flex-1 space-y-3 pr-1">
        {!hasData ? (
          <div className="text-center py-16 text-muted">
            <Bot className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No decisions yet. Trigger an agent cycle to see actions.</p>
          </div>
        ) : (
          decisions.map((d, i) => {
            const { label, color, bg } = getActionLabel(d.action);
            const isAgent = d.executedBy === 'agent';
            return (
              <div
                key={d.id || i}
                className={`border rounded-xl p-4 fade-up ${bg} transition-all hover:border-white/20`}
              >
                {/* Top row */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-black font-mono ${color}`}>{label}</span>
                    <span className="text-xs text-muted font-mono">{d.shipmentId}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {isAgent ? (
                      <span className="flex items-center gap-1 text-xs text-purple-400 font-mono">
                        <Bot className="w-3 h-3" /> agent
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-muted font-mono">
                        <User className="w-3 h-3" /> human
                      </span>
                    )}
                    <span className="text-xs text-muted">{timeAgo(d.executedAt)}</span>
                  </div>
                </div>

                {/* Route change */}
                {d.details?.oldRoute && d.details?.newRoute && (
                  <div className="flex items-center gap-2 text-xs text-muted mb-2 font-mono">
                    <span className="line-through opacity-50">{d.details.oldRoute}</span>
                    <ArrowRight className="w-3 h-3 shrink-0" />
                    <span className="text-white">{d.details.newRoute}</span>
                    {d.details.savedPenalty && (
                      <span className="ml-auto text-green-400">+${d.details.savedPenalty} saved</span>
                    )}
                  </div>
                )}

                {/* Reasoning */}
                {d.reasoning && (
                  <p className="text-xs text-muted mb-2 italic leading-relaxed line-clamp-2">
                    "{d.reasoning}"
                  </p>
                )}

                {/* MCP Actions */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {d.mcpActions?.gmailSent && actionBadge('Gmail', !!d.mcpActions.gmailSimulated, <Mail className="w-3 h-3" />)}
                  {d.mcpActions?.calendarUpdated && actionBadge('Calendar', !!d.mcpActions.calendarSimulated, <Calendar className="w-3 h-3" />)}
                  {d.mcpActions?.sheetLogged && actionBadge('Sheets', !!d.mcpActions.sheetSimulated, <Sheet className="w-3 h-3" />)}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
