import React, { useState } from 'react';
import { History, ClipboardPlus, Factory, Truck, Search, Eye } from 'lucide-react';
import { ActivityRecord, ActivityType, Order, Partner } from '../../types';

interface ActivityHistoryScreenProps {
  activities: ActivityRecord[];
  orders: Order[];
  partners: Partner[];
  onSelectOrder: (orderId: string) => void;
}

export const ActivityHistoryScreen: React.FC<ActivityHistoryScreenProps> = ({
  activities,
  orders,
  partners,
  onSelectOrder,
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = activities.filter((act) => {
    const matchesType = filterType === 'all' || act.activity_type === filterType;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      q === '' ||
      act.description.toLowerCase().includes(q) ||
      act.related_order_id.toLowerCase().includes(q) ||
      act.recorded_by.toLowerCase().includes(q);

    return matchesType && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white border border-[#D9E0E8] rounded-xl p-6 shadow-xs">
        <h1 className="text-2xl md:text-3xl font-bold text-[#1E293B]">Riwayat Aktivitas</h1>
        <p className="text-sm md:text-base text-[#526174] mt-1">
          Lihat catatan transaksi pemesanan, hasil produksi, dan pengiriman operasional secara transparan.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-[#D9E0E8] rounded-xl p-4 md:p-6 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari aktivitas, nomor pesanan, atau petugas..."
              className="w-full h-[52px] pl-11 pr-4 bg-[#F8FAFC] border border-[#D9E0E8] rounded-lg text-base text-[#1E293B] focus-beesha outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto">
            {[
              { id: 'all', label: 'Semua Aktivitas' },
              { id: 'pesanan', label: 'Pemesanan' },
              { id: 'produksi', label: 'Produksi' },
              { id: 'pengiriman', label: 'Pengiriman' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id)}
                className={`h-11 px-4 rounded-lg text-xs md:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                  filterType === tab.id
                    ? 'bg-[#1B365D] text-white shadow-xs'
                    : 'bg-[#F2F4F7] text-[#526174] hover:bg-[#e2e7ef]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="text-xs text-[#526174]">
          Menampilkan <strong className="text-[#1E293B]">{filtered.length}</strong> catatan aktivitas
        </div>
      </div>

      {/* Activity List Cards */}
      <div className="bg-white border border-[#D9E0E8] rounded-xl shadow-xs divide-y divide-[#D9E0E8] overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-[#526174]">
            <p className="font-semibold text-base text-[#1E293B]">Tidak ada catatan aktivitas ditemukan.</p>
            <p className="text-xs mt-1">Coba gunakan kata kunci atau pilihan filter yang berbeda.</p>
          </div>
        ) : (
          filtered.map((act) => {
            const order = orders.find((o) => o.order_id === act.related_order_id);
            const partner = order
              ? partners.find((p) => p.partner_id === order.partner_id)
              : null;

            return (
              <div
                key={act.activity_id}
                className="p-5 hover:bg-[#F8FAFC] transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      act.activity_type === 'pesanan'
                        ? 'bg-blue-100 text-[#0077C8]'
                        : act.activity_type === 'produksi'
                        ? 'bg-indigo-100 text-[#1B365D]'
                        : 'bg-emerald-100 text-[#18794E]'
                    }`}
                  >
                    {act.activity_type === 'pesanan' && <ClipboardPlus className="w-5 h-5" />}
                    {act.activity_type === 'produksi' && <Factory className="w-5 h-5" />}
                    {act.activity_type === 'pengiriman' && <Truck className="w-5 h-5" />}
                  </div>

                  <div className="min-w-0">
                    <p className="text-base font-semibold text-[#1E293B] leading-snug">
                      {act.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#526174] mt-1.5">
                      <span>
                        Ref:{' '}
                        <strong className="font-mono text-[#0077C8]">{act.related_order_id}</strong>
                      </span>
                      {partner && <span>· Mitra: {partner.partner_name}</span>}
                      <span>· Petugas: {act.recorded_by}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end md:self-auto shrink-0">
                  <span className="text-xs font-medium text-[#526174]">{act.timestamp}</span>
                  <button
                    onClick={() => onSelectOrder(act.related_order_id)}
                    className="px-3 py-1.5 bg-white hover:bg-blue-50 text-[#0077C8] border border-[#D9E0E8] rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Lihat Pesanan</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
