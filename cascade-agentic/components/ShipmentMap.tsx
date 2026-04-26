'use client';

import { Shipment, Prediction } from '@/types';
import { MapPin, Navigation, X } from 'lucide-react';
import { useState } from 'react';

interface ShipmentMapProps {
  shipments: Shipment[];
  predictions: Prediction[];
}

export default function ShipmentMap({ shipments, predictions }: ShipmentMapProps) {
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);

  const getPrediction = (shipmentId: string): Prediction | undefined => {
    return predictions.find(p => p.shipmentId === shipmentId);
  };

  const getRiskColor = (probability: number): string => {
    if (probability > 0.7) return '#ef4444';
    if (probability > 0.4) return '#f59e0b';
    return '#10b981';
  };

  const getStatusColor = (status: string): string => {
    if (status === 'at_risk') return 'text-red-400';
    if (status === 'rerouted') return 'text-cyan-400';
    return 'text-green-400';
  };

  return (
    <div className="bg-surface/50 border border-white/10 rounded-xl shadow-2xl p-6 backdrop-blur-sm">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-cyan-500/20 rounded-lg">
          <MapPin className="w-6 h-6 text-cyan-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Shipment Map</h2>
          <p className="text-xs text-cyan-300">Real-time fleet tracking</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {shipments.slice(0, 12).map(shipment => {
          const prediction = getPrediction(shipment.shipmentId);
          const riskColor = prediction ? getRiskColor(prediction.disruptionProbability) : '#6b7280';

          return (
            <div
              key={shipment.shipmentId}
              className="border-2 rounded-lg p-4 hover:shadow-xl hover:scale-105 transition-all cursor-pointer bg-white/5 backdrop-blur-sm"
              style={{ borderColor: riskColor }}
              onClick={() => setSelectedShipment(shipment)}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-bold text-sm text-white">{shipment.shipmentId}</h3>
                  <p className="text-xs text-cyan-300">{shipment.carrier}</p>
                </div>
                <div
                  className="w-3 h-3 rounded-full animate-pulse"
                  style={{ backgroundColor: riskColor }}
                ></div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center space-x-2">
                  <Navigation className="w-3 h-3 text-cyan-400" />
                  <span className="text-white">{shipment.origin.city}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-3 h-3 text-purple-400" />
                  <span className="text-white">{shipment.destination.city}</span>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-white/10">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted">Status</span>
                  <span className={`font-semibold ${getStatusColor(shipment.status)}`}>
                    {shipment.status.toUpperCase()}
                  </span>
                </div>
                {prediction && (
                  <div className="flex items-center justify-between text-xs mt-1">
                    <span className="text-muted">Risk</span>
                    <span className="font-semibold text-white">
                      {(prediction.disruptionProbability * 100).toFixed(0)}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {selectedShipment && (
        <div className="mt-6 p-6 bg-gradient-to-br from-cyan-900/30 to-purple-900/30 rounded-xl border border-cyan-500/30 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-xl text-white">{selectedShipment.shipmentId}</h3>
            <button
              onClick={() => setSelectedShipment(null)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-cyan-400" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-white/5 p-3 rounded-lg">
              <p className="text-cyan-300 text-xs mb-1">Origin</p>
              <p className="font-semibold text-white">{selectedShipment.origin.city}</p>
              <p className="text-xs text-muted mt-1">
                {selectedShipment.origin.lat.toFixed(4)}, {selectedShipment.origin.lon.toFixed(4)}
              </p>
            </div>
            <div className="bg-white/5 p-3 rounded-lg">
              <p className="text-purple-300 text-xs mb-1">Destination</p>
              <p className="font-semibold text-white">{selectedShipment.destination.city}</p>
              <p className="text-xs text-muted mt-1">
                {selectedShipment.destination.lat.toFixed(4)}, {selectedShipment.destination.lon.toFixed(4)}
              </p>
            </div>
            <div className="bg-white/5 p-3 rounded-lg">
              <p className="text-cyan-300 text-xs mb-1">Carrier</p>
              <p className="font-semibold text-white">{selectedShipment.carrier}</p>
            </div>
            <div className="bg-white/5 p-3 rounded-lg">
              <p className="text-cyan-300 text-xs mb-1">Route</p>
              <p className="font-semibold text-white">{selectedShipment.currentRoute}</p>
            </div>
            <div className="bg-white/5 p-3 rounded-lg">
              <p className="text-cyan-300 text-xs mb-1">Priority</p>
              <p className="font-semibold text-white uppercase">{selectedShipment.customerPriority}</p>
            </div>
            <div className="bg-white/5 p-3 rounded-lg">
              <p className="text-cyan-300 text-xs mb-1">Value</p>
              <p className="font-semibold text-white">${selectedShipment.valueUsd.toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}

      <p className="text-xs text-cyan-400/60 mt-6 text-center italic">
        Note: Full Google Maps integration available in production deployment
      </p>
    </div>
  );
}
