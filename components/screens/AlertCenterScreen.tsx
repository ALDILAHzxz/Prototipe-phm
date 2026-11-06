import React, { useState } from 'react';
import { AlertTriangle, Clock, CheckCircle2, ArrowRight, ShieldAlert, AlertCircle } from 'lucide-react';
import { AlertItem, AlertSeverity } from '../../types';

interface AlertCenterScreenProps {
  alerts: AlertItem[];
  onSelectOrder: (orderId: string) => void;
}

export const AlertCenterScreen: React.FC<AlertCenterScreenProps> = ({ alerts, onSelectOrder }) => {
  const [activeTab, setActiveTab] = useState<string>('all');

  const filteredAlerts = alerts.filter((a) => {
    if (activeTab === 'all') return true;
    return a.severity === activeTab;
  });

  const getSeverityBadge = (severity: AlertSeverity) => {
    switch (severity) {
      case 'terlambat':
        return (
          <span className="px-2.5 py-1 rounded text-xs font-bold bg-red-50 text-[#B42318] border border-red-200">
            Terlambat
          </span>
        );
      case 'mendekati':
        return (
          <span className="px-2.5 py-1 rounded text-xs font-bold bg-amber-50 text-[#B54708] border border-amber-200">
            Mendekati Tenggat
          </span>
        );
      case 'tindakan':
        return (
          <span className="px-2.5 py-1 rounded text-xs font-bold bg-blue-50 text-[#0B63A8] border border-blue-200">
            Perlu Tindakan
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded text-xs font-bold bg-slate-50 text-[#526174] border border-slate-200">
            Informasi
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white border border-[#D9E0E8] rounded-xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-[#B54708]" />
            <h1 className="text-2xl md:text-3xl font-bold text-[#1E293B]">Pusat Peringatan</h1>
          </div>
          <p className="text-sm md:text-base text-[#526174] mt-1">
            Lihat pekerjaan dan pesanan yang memerlukan perhatian operasional segera.
          </p>
        </div>

        <div className="text-xs text-[#526174] bg-[#F8FAFC] border border-[#D9E0E8] px-3.5 py-2 rounded-lg self-start sm:self-auto">
          Total Peringatan: <strong className="text-[#1E293B]">{alerts.length} item</strong>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'all', label: 'Semua Peringatan' },
          { id: 'terlambat', label: 'Terlambat' },
          { id: 'mendekati', label: 'Mendekati Tenggat' },
          { id: 'tindakan', label: 'Perlu Tindakan' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`h-11 px-4 rounded-lg text-xs md:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
              activeTab === tab.id
                ? 'bg-[#1B365D] text-white shadow-xs'
                : 'bg-white border border-[#D9E0E8] text-[#526174] hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Alert Cards Grid (120-160px height, 20-24px padding per Section 14) */}
      {filteredAlerts.length === 0 ? (
        <div className="bg-white border border-[#D9E0E8] rounded-xl p-12 text-center shadow-xs">
          <CheckCircle2 className="w-12 h-12 text-[#18794E] mx-auto mb-3" />
          <h3 className="text-lg font-bold text-[#1E293B]">Tidak ada peringatan saat ini</h3>
          <p className="text-sm text-[#526174] mt-1 max-w-md mx-auto">
            Semua pesanan berada dalam rentang jadwal yang aman dan tidak ada keterlambatan pengiriman.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredAlerts.map((alt) => (
            <div
              key={alt.id}
              className="bg-white border border-[#D9E0E8] hover:border-[#0077C8] rounded-xl p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  {getSeverityBadge(alt.severity)}
                  <span className="font-mono text-xs font-bold text-[#1B365D]">{alt.order_id}</span>
                </div>

                <h3 className="text-base md:text-lg font-bold text-[#1E293B] leading-tight">
                  {alt.title}
                </h3>
                <p className="text-xs text-[#526174] mt-1">Mitra: {alt.partner_name}</p>

                <p className="text-xs md:text-sm text-[#1E293B] mt-2.5 leading-relaxed bg-[#F8FAFC] p-3 rounded-lg border border-[#D9E0E8]">
                  {alt.description}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-[#D9E0E8] flex items-center justify-between">
                <div className="text-xs text-[#526174]">
                  Batas Tenggat: <strong className="text-[#1E293B]">{alt.due_date}</strong>
                </div>

                <button
                  onClick={() => onSelectOrder(alt.order_id)}
                  className="px-4 py-2 bg-[#0077C8] hover:bg-[#0069b2] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer focus-beesha shadow-2xs"
                >
                  <span>Tindak Lanjuti</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
