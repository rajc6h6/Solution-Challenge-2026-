'use client';

import { DashboardStats } from '@/types';
import { Package, AlertTriangle, RotateCw, Zap, TrendingUp, DollarSign, Activity } from 'lucide-react';

interface StatsCardsProps {
  stats: DashboardStats;
}

export default function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      label: 'Total Fleet',
      value: stats.totalShipments.toLocaleString(),
      sub: `${stats.activeShipments} active`,
      icon: <Package className="w-5 h-5" />,
      color: 'text-cyan',
      bg: 'bg-cyan/10 border-cyan/20',
      accent: '#00d4ff',
    },
    {
      label: 'At Risk',
      value: stats.atRiskShipments.toLocaleString(),
      sub: `${((stats.atRiskShipments / Math.max(1, stats.totalShipments)) * 100).toFixed(1)}% of fleet`,
      icon: <AlertTriangle className="w-5 h-5" />,
      color: 'text-red-400',
      bg: 'bg-red-500/10 border-red-500/20',
      accent: '#ef4444',
    },
    {
      label: 'Auto-Rerouted',
      value: stats.reroutedShipments.toLocaleString(),
      sub: 'by CASCADE agent',
      icon: <RotateCw className="w-5 h-5" />,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10 border-purple-500/20',
      accent: '#a855f7',
    },
    {
      label: 'Agent Actions',
      value: stats.autonomousActionsToday.toLocaleString(),
      sub: 'autonomous today',
      icon: <Zap className="w-5 h-5" />,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/20',
      accent: '#f59e0b',
    },
    {
      label: 'Avg Risk',
      value: `${(stats.avgDisruptionProbability * 100).toFixed(1)}%`,
      sub: 'disruption probability',
      icon: <Activity className="w-5 h-5" />,
      color: stats.avgDisruptionProbability > 0.5 ? 'text-red-400' : 'text-green-400',
      bg: stats.avgDisruptionProbability > 0.5 ? 'bg-red-500/10 border-red-500/20' : 'bg-green-500/10 border-green-500/20',
      accent: stats.avgDisruptionProbability > 0.5 ? '#ef4444' : '#10b981',
    },
    {
      label: 'Value at Risk',
      value: `$${(stats.totalValueAtRisk / 1000000).toFixed(1)}M`,
      sub: 'at-risk shipments',
      icon: <DollarSign className="w-5 h-5" />,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/20',
      accent: '#f59e0b',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`${card.bg} border rounded-2xl p-4 fade-up hover:scale-[1.02] transition-transform`}
        >
          <div className={`${card.color} mb-3`}>{card.icon}</div>
          <div className={`text-2xl font-black ${card.color} mb-1`}>{card.value}</div>
          <div className="text-xs font-semibold text-white">{card.label}</div>
          <div className="text-xs text-muted mt-0.5">{card.sub}</div>
        </div>
      ))}
    </div>
  );
}
