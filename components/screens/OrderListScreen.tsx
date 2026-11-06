import React, { useState, useMemo } from 'react';
import { Search, Plus, Eye, Filter, ArrowUpDown } from 'lucide-react';
import { Order, Partner, Product, ProductionRecord, DeliveryRecord, OrderStatus } from '../../types';
import { calculateSingleOrderProgress } from '../../utils/operations';

interface OrderListScreenProps {
  orders: Order[];
  partners: Partner[];
  products: Product[];
  productionRecords: ProductionRecord[];
  deliveryRecords: DeliveryRecord[];
  onAddNewOrder: () => void;
  onSelectOrder: (orderId: string) => void;
}

export const OrderListScreen: React.FC<OrderListScreenProps> = ({
  orders,
  partners,
  products,
  productionRecords,
  deliveryRecords,
  onAddNewOrder,
  onSelectOrder,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const partner = partners.find((p) => p.partner_id === order.partner_id);
      const product = products.find((p) => p.product_id === order.product_id);
      const partnerName = partner ? partner.partner_name.toLowerCase() : '';
      const productName = product ? product.product_name.toLowerCase() : '';
      const orderId = order.order_id.toLowerCase();
      const poNum = order.po_number.toLowerCase();
      const q = searchQuery.toLowerCase().trim();

      const matchesSearch =
        q === '' ||
        orderId.includes(q) ||
        poNum.includes(q) ||
        partnerName.includes(q) ||
        productName.includes(q);

      const progress = calculateSingleOrderProgress(order, productionRecords, deliveryRecords);
      const currentStatus = progress.computedStatus;

      const matchesFilter =
        statusFilter === 'all' || currentStatus === statusFilter;

      return matchesSearch && matchesFilter;
    });
  }, [orders, partners, products, productionRecords, deliveryRecords, searchQuery, statusFilter]);

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'baru':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-[#0B63A8] border border-blue-200">
            Pesanan Baru
          </span>
        );
      case 'dalam_produksi':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-[#B54708] border border-amber-200">
            Dalam Produksi
          </span>
        );
      case 'terkirim_sebagian':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            Terkirim Sebagian
          </span>
        );
      case 'selesai':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-[#18794E] border border-emerald-200">
            Selesai Lengkap
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header with Title and Primary Action */}
      <div className="bg-white border border-[#D9E0E8] rounded-xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#1E293B]">Pemesanan Mitra</h1>
          <p className="text-sm md:text-base text-[#526174] mt-1">
            Kelola dan pantau seluruh pesanan yang diterima dari mitra perusahaan.
          </p>
        </div>

        <button
          onClick={onAddNewOrder}
          className="h-[52px] px-6 bg-[#0077C8] hover:bg-[#0069b2] active:bg-[#005a99] text-white font-semibold text-base rounded-[10px] flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors self-start sm:self-auto focus-beesha"
        >
          <Plus className="w-5 h-5" />
          <span>Tambah Pesanan</span>
        </button>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white border border-[#D9E0E8] rounded-xl p-4 md:p-6 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Field */}
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nomor pesanan, PO mitra, atau nama barang..."
              className="w-full h-[52px] pl-11 pr-4 bg-[#F8FAFC] border border-[#D9E0E8] focus:border-[#0077C8] rounded-lg text-base text-[#1E293B] focus-beesha outline-none transition-colors"
            />
          </div>

          {/* Status Filter Segmented Controls */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {[
              { id: 'all', label: 'Semua' },
              { id: 'baru', label: 'Baru' },
              { id: 'dalam_produksi', label: 'Dalam Produksi' },
              { id: 'terkirim_sebagian', label: 'Terkirim Sebagian' },
              { id: 'selesai', label: 'Selesai' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`h-11 px-3.5 md:px-4 rounded-lg text-xs md:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                  statusFilter === tab.id
                    ? 'bg-[#1B365D] text-white shadow-xs'
                    : 'bg-[#F2F4F7] text-[#526174] hover:bg-[#e2e7ef] hover:text-[#1E293B]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results count text */}
        <div className="text-xs md:text-sm text-[#526174] flex justify-between items-center pt-2">
          <span>
            Menampilkan <strong className="text-[#1E293B]">{filteredOrders.length}</strong> pesanan
          </span>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs font-semibold text-[#0077C8] hover:underline"
            >
              Hapus pencarian
            </button>
          )}
        </div>
      </div>

      {/* Table on Desktop / Stacked Cards on Mobile */}
      <div className="bg-white border border-[#D9E0E8] rounded-xl shadow-xs overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="py-16 text-center px-4">
            <p className="text-lg font-bold text-[#1E293B]">Tidak ada data pesanan yang cocok</p>
            <p className="text-sm text-[#526174] mt-1 max-w-md mx-auto">
              Periksa kembali kata kunci pencarian atau ganti filter status untuk melihat pesanan lainnya.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
              }}
              className="mt-4 px-4 py-2 bg-[#F2F4F7] text-[#1B365D] font-semibold text-sm rounded-lg hover:bg-slate-200 transition-colors"
            >
              Reset Filter
            </button>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="h-[52px] bg-[#F8FAFC] border-b border-[#D9E0E8] text-xs font-semibold text-[#526174] uppercase tracking-wider">
                    <th className="px-6 py-3">No. Pesanan / PO</th>
                    <th className="px-6 py-3">Nama Mitra</th>
                    <th className="px-6 py-3">Nama Barang</th>
                    <th className="px-6 py-3 text-right">Target Dipesan</th>
                    <th className="px-6 py-3">Jatuh Tempo</th>
                    <th className="px-6 py-3 text-center">Status</th>
                    <th className="px-6 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D9E0E8] text-sm">
                  {filteredOrders.map((order) => {
                    const partner = partners.find((p) => p.partner_id === order.partner_id);
                    const product = products.find((p) => p.product_id === order.product_id);
                    const progress = calculateSingleOrderProgress(
                      order,
                      productionRecords,
                      deliveryRecords
                    );

                    return (
                      <tr
                        key={order.order_id}
                        className="min-h-[64px] hover:bg-[#F8FAFC] transition-colors"
                      >
                        <td className="px-6 py-4">
                          <p className="font-bold text-[#1B365D] font-mono">{order.order_id}</p>
                          <p className="text-xs text-[#526174] mt-0.5">{order.po_number}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-semibold text-[#1E293B]">
                            {partner ? partner.partner_name : 'Mitra'}
                          </p>
                          <p className="text-xs text-[#526174] mt-0.5">{partner?.city}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-medium text-[#1E293B]">
                            {product ? product.product_name : 'Barang'}
                          </p>
                          <p className="text-xs text-[#526174] font-mono mt-0.5">
                            {product?.product_code}
                          </p>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="font-bold text-base text-[#1E293B] tabular-nums">
                            {order.quantity_ordered.toLocaleString('id-ID')}
                          </span>{' '}
                          <span className="text-xs text-[#526174]">pcs</span>
                          <div className="text-[11px] text-[#526174] mt-0.5">
                            Kirim: {progress.totalShipped} pcs
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-medium text-[#1E293B]">{order.due_date}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {getStatusBadge(progress.computedStatus)}
                        </td>
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <button
                            onClick={() => onSelectOrder(order.order_id)}
                            className="px-3.5 py-2 bg-white hover:bg-blue-50 text-[#0077C8] border border-[#D9E0E8] hover:border-[#0077C8] rounded-lg font-semibold text-xs transition-colors cursor-pointer inline-flex items-center gap-1.5 focus-beesha"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Lihat Detail</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Stacked Card View */}
            <div className="md:hidden divide-y divide-[#D9E0E8]">
              {filteredOrders.map((order) => {
                const partner = partners.find((p) => p.partner_id === order.partner_id);
                const product = products.find((p) => p.product_id === order.product_id);
                const progress = calculateSingleOrderProgress(
                  order,
                  productionRecords,
                  deliveryRecords
                );

                return (
                  <div key={order.order_id} className="p-4 space-y-3">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <span className="font-mono font-bold text-base text-[#1B365D]">
                          {order.order_id}
                        </span>
                        <p className="text-xs text-[#526174]">{order.po_number}</p>
                      </div>
                      {getStatusBadge(progress.computedStatus)}
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs text-[#526174]">Mitra:</p>
                      <p className="text-sm font-bold text-[#1E293B]">
                        {partner ? partner.partner_name : 'Mitra'}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs text-[#526174]">Barang / Part:</p>
                      <p className="text-sm font-medium text-[#1E293B]">
                        {product ? product.product_name : 'Barang'} ({product?.product_code})
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-[#F8FAFC] border border-[#D9E0E8]">
                      <div>
                        <p className="text-xs text-[#526174]">Target Pesanan:</p>
                        <p className="text-base font-bold text-[#1E293B] tabular-nums">
                          {order.quantity_ordered} pcs
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-[#526174]">Jatuh Tempo:</p>
                        <p className="text-sm font-semibold text-[#1E293B]">{order.due_date}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => onSelectOrder(order.order_id)}
                      className="w-full h-11 bg-white hover:bg-blue-50 text-[#0077C8] border border-[#D9E0E8] rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Lihat Detail & Progres</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
