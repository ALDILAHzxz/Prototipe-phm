import React, { useState, useEffect } from 'react';
import {
  Truck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  FileCheck2,
  AlertTriangle,
} from 'lucide-react';
import { Order, Partner, Product, ProductionRecord, DeliveryRecord } from '../../types';
import { calculateSingleOrderProgress, validateDeliveryInput } from '../../utils/operations';

interface DeliveryFormProps {
  orders: Order[];
  partners: Partner[];
  products: Product[];
  productionRecords: ProductionRecord[];
  deliveryRecords: DeliveryRecord[];
  preSelectedOrderId?: string;
  onSaveDelivery: (record: DeliveryRecord) => void;
  onCancel: () => void;
  onViewOrderDetail: (orderId: string) => void;
}

export const DeliveryForm: React.FC<DeliveryFormProps> = ({
  orders,
  partners,
  products,
  productionRecords,
  deliveryRecords,
  preSelectedOrderId,
  onSaveDelivery,
  onCancel,
  onViewOrderDetail,
}) => {
  const [selectedOrderId, setSelectedOrderId] = useState<string>(preSelectedOrderId || '');
  const [shippedQty, setShippedQty] = useState<string>('');
  const [deliveryNote, setDeliveryNote] = useState<string>(
    `SJ-PHM-2026-00${Math.floor(45 + Math.random() * 50)}`
  );
  const [notes, setNotes] = useState<string>('');
  const [showOptional, setShowOptional] = useState<boolean>(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [savedDelivery, setSavedDelivery] = useState<DeliveryRecord | null>(null);

  useEffect(() => {
    if (preSelectedOrderId) {
      setSelectedOrderId(preSelectedOrderId);
    }
  }, [preSelectedOrderId]);

  const selectedOrder = orders.find((o) => o.order_id === selectedOrderId);
  const selectedPartner = selectedOrder
    ? partners.find((p) => p.partner_id === selectedOrder.partner_id)
    : null;
  const selectedProduct = selectedOrder
    ? products.find((p) => p.product_id === selectedOrder.product_id)
    : null;

  const orderProgress = selectedOrder
    ? calculateSingleOrderProgress(selectedOrder, productionRecords, deliveryRecords)
    : null;

  const handlePreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setWarningMessage(null);

    const validation = validateDeliveryInput(
      selectedOrderId,
      Number(shippedQty),
      orderProgress || undefined
    );

    if (!validation.isValid) {
      setErrorMessage(validation.error || 'Periksa kembali data pengiriman.');
      return;
    }

    if (validation.warning) {
      setWarningMessage(validation.warning);
    }

    setShowConfirmModal(true);
  };

  const handleFinalSubmit = () => {
    const recordId = deliveryNote.trim() || `SJ-PHM-2026-${Date.now().toString().slice(-4)}`;
    const newRecord: DeliveryRecord = {
      delivery_id: recordId,
      order_id: selectedOrderId,
      quantity_shipped: Number(shippedQty),
      shipped_at: '2026-11-06 10:45',
      delivery_note: recordId,
      recorded_by: 'Budi Santoso (Petugas Pengiriman)',
      notes: notes.trim() || undefined,
    };

    onSaveDelivery(newRecord);
    setSavedDelivery(newRecord);
    setShowConfirmModal(false);
    setIsSuccess(true);
  };

  // SUCCESS CONFIRMATION RECEIPT
  if (isSuccess && savedDelivery && selectedOrder) {
    return (
      <div className="max-w-2xl mx-auto py-8 animate-in zoom-in-95 duration-200">
        <div className="bg-white border border-[#D9E0E8] rounded-xl p-8 shadow-sm text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-[#18794E] flex items-center justify-center mx-auto mb-4 border border-emerald-200">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <h2 className="text-2xl font-bold text-[#1E293B]">Pengiriman Berhasil Dicatat</h2>
          <p className="text-sm md:text-base text-[#526174] mt-1.5">
            Informasi pengiriman pada pesanan <strong className="font-mono text-[#0077C8]">{selectedOrder.order_id}</strong> telah diperbarui dalam data simulasi BEESHA.
          </p>

          <div className="mt-6 p-5 rounded-xl bg-[#F8FAFC] border border-[#D9E0E8] text-left space-y-3">
            <h4 className="text-xs font-bold uppercase text-[#526174] tracking-wider">
              Tanda Bukti Surat Jalan Pengiriman
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-xs text-[#526174]">No. Surat Jalan:</span>
                <p className="font-mono font-semibold text-[#1E293B]">{savedDelivery.delivery_id}</p>
              </div>
              <div>
                <span className="text-xs text-[#526174]">Mitra Penerima:</span>
                <p className="font-semibold text-[#1E293B]">{selectedPartner?.partner_name}</p>
              </div>
              <div>
                <span className="text-xs text-[#526174]">Barang / Part:</span>
                <p className="font-semibold text-[#1E293B]">{selectedProduct?.product_name}</p>
              </div>
              <div>
                <span className="text-xs text-[#526174]">Jumlah Dikirim:</span>
                <p className="font-bold text-base text-[#18794E] tabular-nums">
                  {savedDelivery.quantity_shipped.toLocaleString('id-ID')} pcs
                </p>
              </div>
              <div>
                <span className="text-xs text-[#526174]">Petugas Ekspedisi:</span>
                <p className="font-semibold text-[#1E293B]">{savedDelivery.recorded_by}</p>
              </div>
              <div>
                <span className="text-xs text-[#526174]">Waktu Keberangkatan:</span>
                <p className="font-semibold text-[#1E293B]">{savedDelivery.shipped_at} WIB</p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => {
                setIsSuccess(false);
                setShippedQty('');
                setNotes('');
                setDeliveryNote(`SJ-PHM-2026-00${Math.floor(50 + Math.random() * 50)}`);
                setSavedDelivery(null);
              }}
              className="h-[52px] px-6 bg-[#0077C8] hover:bg-[#0069b2] text-white font-semibold text-base rounded-[10px] flex items-center justify-center gap-2 cursor-pointer shadow-xs focus-beesha"
            >
              <span>Catat Pengiriman Lagi</span>
              <Truck className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewOrderDetail(selectedOrder.order_id)}
              className="h-[52px] px-6 bg-white hover:bg-slate-50 text-[#1B365D] border border-[#1B365D] font-semibold text-base rounded-[10px] cursor-pointer"
            >
              Lihat Detail Pesanan
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white border border-[#D9E0E8] rounded-xl p-6 shadow-xs flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <button
              onClick={onCancel}
              className="p-1.5 hover:bg-slate-100 rounded-lg text-[#526174] transition-colors"
              title="Kembali"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl md:text-3xl font-bold text-[#1E293B]">Catat Pengiriman Barang</h1>
          </div>
          <p className="text-sm md:text-base text-[#526174] mt-1 ml-9">
            Pilih pesanan dan catat barang yang sudah dikirim kepada mitra.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
        {/* Form Container (8 cols) */}
        <div className="lg:col-span-8 bg-white border border-[#D9E0E8] rounded-xl p-6 md:p-8 shadow-xs">
          <form onSubmit={handlePreSubmit} className="space-y-6">
            {/* Field 1: Pilih Pesanan */}
            <div>
              <label htmlFor="delivery-order-select" className="block text-base font-semibold text-[#1E293B] mb-2">
                Pilih Pesanan untuk Dikirim <span className="text-[#B42318]">*</span>
              </label>
              <select
                id="delivery-order-select"
                value={selectedOrderId}
                onChange={(e) => {
                  setSelectedOrderId(e.target.value);
                  setErrorMessage(null);
                }}
                className={`w-full h-[56px] px-4 bg-[#F8FAFC] border rounded-lg text-base text-[#1E293B] focus-beesha outline-none cursor-pointer ${
                  errorMessage && !selectedOrderId ? 'border-[#B42318] bg-red-50/20' : 'border-[#D9E0E8]'
                }`}
              >
                <option value="">-- Pilih Nomor Pesanan atau Mitra --</option>
                {orders.map((o) => {
                  const p = partners.find((pt) => pt.partner_id === o.partner_id);
                  const prd = products.find((prod) => prod.product_id === o.product_id);
                  const prog = calculateSingleOrderProgress(o, productionRecords, deliveryRecords);
                  return (
                    <option key={o.order_id} value={o.order_id}>
                      {o.order_id} — {p?.partner_name} ({prd?.product_name} - Sisa kirim: {prog.remainingDelivery} pcs)
                    </option>
                  );
                })}
              </select>
              <p className="text-xs text-[#526174] mt-1.5">
                Pilih pesanan yang memiliki barang siap kirim.
              </p>
            </div>

            {/* Order Summary Card (Section 11.3) */}
            {selectedOrder && orderProgress && (
              <div className="p-5 rounded-xl bg-[#F8FAFC] border border-[#D9E0E8] space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-[#D9E0E8]">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#1B365D]">
                    Ringkasan Progres Pesanan
                  </h4>
                  <span className="text-xs font-mono font-medium text-[#526174]">
                    Mitra: {selectedPartner?.partner_name}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                  <div className="p-3 bg-white rounded-lg border border-[#D9E0E8]">
                    <span className="text-xs text-[#526174]">Dipesan</span>
                    <p className="text-lg font-bold text-[#1E293B] tabular-nums mt-0.5">
                      {orderProgress.totalOrdered} pcs
                    </p>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-[#D9E0E8]">
                    <span className="text-xs text-[#526174]">Diproduksi</span>
                    <p className="text-lg font-bold text-[#0077C8] tabular-nums mt-0.5">
                      {orderProgress.totalProduced} pcs
                    </p>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-[#D9E0E8]">
                    <span className="text-xs text-[#526174]">Sudah Dikirim</span>
                    <p className="text-lg font-bold text-[#18794E] tabular-nums mt-0.5">
                      {orderProgress.totalShipped} pcs
                    </p>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-[#D9E0E8]">
                    <span className="text-xs text-[#526174]">Sisa Pengiriman</span>
                    <p className="text-lg font-bold text-[#B54708] tabular-nums mt-0.5">
                      {orderProgress.remainingDelivery} pcs
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Field 2: Jumlah Dikirim */}
            <div>
              <label htmlFor="shipped-qty" className="block text-base font-semibold text-[#1E293B] mb-2">
                Jumlah Barang yang Dikirim <span className="text-[#B42318]">*</span>
              </label>
              <div className="relative">
                <input
                  id="shipped-qty"
                  type="number"
                  min="1"
                  step="1"
                  value={shippedQty}
                  onChange={(e) => {
                    setShippedQty(e.target.value);
                    setErrorMessage(null);
                  }}
                  placeholder="Masukkan jumlah unit dikirim"
                  className="w-full h-[56px] pl-4 pr-14 bg-[#F8FAFC] border border-[#D9E0E8] focus:border-[#0077C8] rounded-lg text-lg text-[#1E293B] font-bold tabular-nums focus-beesha outline-none"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-base font-semibold text-[#526174] pointer-events-none">
                  pcs
                </span>
              </div>
              <p className="text-xs text-[#526174] mt-1.5">
                Pastikan kuantitas fisik telah dihitung saat dimuat ke armada truk ekspedisi.
              </p>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-sm text-[#B42318] flex items-center gap-2">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Optional Collapsed Section */}
            <div className="pt-2 border-t border-[#D9E0E8]">
              <button
                type="button"
                onClick={() => setShowOptional(!showOptional)}
                className="flex items-center gap-2 text-sm font-semibold text-[#0077C8] hover:underline cursor-pointer"
              >
                {showOptional ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                <span>{showOptional ? 'Sembunyikan Informasi Ekspedisi' : 'Tambah Surat Jalan & Armada (Opsional)'}</span>
              </button>

              {showOptional && (
                <div className="mt-4 space-y-4 p-4 rounded-lg bg-[#F8FAFC] border border-[#D9E0E8] animate-in fade-in duration-200">
                  <div>
                    <label className="block text-sm font-semibold text-[#1E293B] mb-1">
                      Nomor Surat Jalan (Surat Pengantar Ekspedisi)
                    </label>
                    <input
                      type="text"
                      value={deliveryNote}
                      onChange={(e) => setDeliveryNote(e.target.value)}
                      placeholder="Contoh: SJ-PHM-2026-0045"
                      className="w-full h-12 px-4 bg-white border border-[#D9E0E8] rounded-lg text-sm text-[#1E293B] font-mono focus-beesha outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#1E293B] mb-1">
                      Catatan Pengiriman / Armada
                    </label>
                    <textarea
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Contoh: Truk Colt Diesel B 9812 PHM, sopir Pak Yanto"
                      className="w-full p-3 bg-white border border-[#D9E0E8] rounded-lg text-sm text-[#1E293B] focus-beesha outline-none resize-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div className="pt-6 border-t border-[#D9E0E8] flex flex-col sm:flex-row items-center justify-end gap-4">
              <button
                type="button"
                onClick={onCancel}
                className="w-full sm:w-auto h-[52px] px-6 bg-white hover:bg-slate-50 text-[#1B365D] border border-[#1B365D] font-semibold text-base rounded-[10px] cursor-pointer transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                className="w-full sm:w-auto min-w-[200px] h-[52px] px-8 bg-[#0077C8] hover:bg-[#0069b2] active:bg-[#005a99] text-white font-semibold text-base rounded-[10px] shadow-xs cursor-pointer transition-colors focus-beesha"
              >
                Simpan Pengiriman
              </button>
            </div>
          </form>
        </div>

        {/* Informational Side Card (4 cols) */}
        <div className="lg:col-span-4 bg-white border border-[#D9E0E8] rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#D9E0E8]">
            <Truck className="w-5 h-5 text-[#0077C8]" />
            <h3 className="text-lg font-bold text-[#1E293B]">Informasi Pengiriman</h3>
          </div>

          <div className="space-y-3 text-sm">
            <div>
              <span className="text-xs text-[#526174]">Tanggal Keberangkatan:</span>
              <p className="font-semibold text-[#1E293B]">06 November 2026, 10:45 WIB</p>
            </div>
            <div>
              <span className="text-xs text-[#526174]">Petugas Logistik:</span>
              <p className="font-semibold text-[#1E293B]">Budi Santoso (Petugas Pengiriman)</p>
            </div>
            <div>
              <span className="text-xs text-[#526174]">Gudang Asal:</span>
              <p className="font-semibold text-[#1E293B]">Gudang Barang Jadi PHM Cikarang</p>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-[#F8FAFC] border border-[#D9E0E8] text-xs text-[#526174] leading-relaxed">
            📦 <strong>Kaidah Validasi:</strong> Sistem mencegah pengiriman melebihi sisa pesanan belum terkirim. Jika sisa pesanan terpenuhi penuh, status pesanan otomatis berganti menjadi <em>Selesai</em>.
          </div>
        </div>
      </div>

      {/* Confirmation Modal (Section 11.4) */}
      {showConfirmModal && selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-[#D9E0E8] max-w-lg w-full p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <h3 className="text-xl font-bold text-[#1E293B]">Konfirmasi Pengiriman Barang</h3>
            <p className="text-sm text-[#526174] mt-1">
              Pastikan jumlah fisik barang yang dikirim sudah diverifikasi dengan benar:
            </p>

            <div className="mt-5 p-4 rounded-lg bg-[#F8FAFC] border border-[#D9E0E8] space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-[#526174]">Pesanan:</span>
                <span className="font-mono font-bold text-[#1B365D]">{selectedOrder.order_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#526174]">Mitra Penerima:</span>
                <span className="font-semibold text-[#1E293B]">{selectedPartner?.partner_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#526174]">Barang / Part:</span>
                <span className="font-semibold text-[#1E293B]">{selectedProduct?.product_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#526174]">Jumlah Dikirim:</span>
                <span className="font-bold text-base text-[#18794E] tabular-nums">
                  {shippedQty} pcs
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#526174]">Surat Jalan:</span>
                <span className="font-mono font-medium text-[#1E293B]">{deliveryNote}</span>
              </div>

              {warningMessage && (
                <div className="mt-2 p-2.5 rounded bg-amber-50 border border-amber-200 text-xs text-[#B54708] flex items-start gap-1.5">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{warningMessage}</span>
                </div>
              )}
            </div>

            <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="h-12 px-5 bg-white hover:bg-slate-50 text-[#1B365D] border border-[#D9E0E8] font-semibold text-sm rounded-lg cursor-pointer"
              >
                Periksa Kembali
              </button>
              <button
                type="button"
                onClick={handleFinalSubmit}
                className="h-12 px-6 bg-[#0077C8] hover:bg-[#0069b2] text-white font-semibold text-sm rounded-lg shadow-xs cursor-pointer focus-beesha"
              >
                Ya, Simpan Pengiriman
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
