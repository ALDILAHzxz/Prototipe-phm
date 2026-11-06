import React, { useState, useEffect } from 'react';
import {
  Factory,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Layers,
  FileSpreadsheet,
  AlertTriangle,
} from 'lucide-react';
import { Order, Partner, Product, ProductionRecord, DeliveryRecord } from '../../types';
import { calculateSingleOrderProgress, validateProductionInput } from '../../utils/operations';

interface ProductionFormProps {
  orders: Order[];
  partners: Partner[];
  products: Product[];
  productionRecords: ProductionRecord[];
  deliveryRecords: DeliveryRecord[];
  preSelectedOrderId?: string;
  onSaveProduction: (record: ProductionRecord) => void;
  onCancel: () => void;
  onViewOrderDetail: (orderId: string) => void;
}

export const ProductionForm: React.FC<ProductionFormProps> = ({
  orders,
  partners,
  products,
  productionRecords,
  deliveryRecords,
  preSelectedOrderId,
  onSaveProduction,
  onCancel,
  onViewOrderDetail,
}) => {
  const [selectedOrderId, setSelectedOrderId] = useState<string>(preSelectedOrderId || '');
  const [completedQty, setCompletedQty] = useState<string>('');
  const [rejectQty, setRejectQty] = useState<string>('0');
  const [notes, setNotes] = useState<string>('');
  const [showOptional, setShowOptional] = useState<boolean>(false);

  // Modal and state feedback
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [savedRecord, setSavedRecord] = useState<ProductionRecord | null>(null);

  // Sync if preSelectedOrderId changes
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

    const validation = validateProductionInput(
      selectedOrderId,
      Number(completedQty),
      orderProgress || undefined
    );

    if (!validation.isValid) {
      setErrorMessage(validation.error || 'Periksa kembali data yang dimasukkan.');
      return;
    }

    if (validation.warning) {
      setWarningMessage(validation.warning);
    }

    setShowConfirmModal(true);
  };

  const handleFinalSubmit = () => {
    const recordId = `PRD-REC-${Date.now().toString().slice(-4)}`;
    const newRecord: ProductionRecord = {
      production_id: recordId,
      order_id: selectedOrderId,
      quantity_completed: Number(completedQty),
      reported_at: '2026-11-06 09:30',
      recorded_by: 'Joko Sutopo (Operator Lini 1)',
      reject_qty: Number(rejectQty) > 0 ? Number(rejectQty) : undefined,
      notes: notes.trim() || undefined,
    };

    onSaveProduction(newRecord);
    setSavedRecord(newRecord);
    setShowConfirmModal(false);
    setIsSuccess(true);
  };

  // SUCCESS CONFIRMATION RECEIPT
  if (isSuccess && savedRecord && selectedOrder) {
    return (
      <div className="max-w-2xl mx-auto py-8 animate-in zoom-in-95 duration-200">
        <div className="bg-white border border-[#D9E0E8] rounded-xl p-8 shadow-sm text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-[#18794E] flex items-center justify-center mx-auto mb-4 border border-emerald-200">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <h2 className="text-2xl font-bold text-[#1E293B]">Hasil Produksi Berhasil Dicatat</h2>
          <p className="text-sm md:text-base text-[#526174] mt-1.5">
            Jumlah produksi pada pesanan <strong className="font-mono text-[#0077C8]">{selectedOrder.order_id}</strong> telah diperbarui dalam data simulasi BEESHA.
          </p>

          <div className="mt-6 p-5 rounded-xl bg-[#F8FAFC] border border-[#D9E0E8] text-left space-y-3">
            <h4 className="text-xs font-bold uppercase text-[#526174] tracking-wider">
              Ringkasan Bukti Laporan Produksi
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-xs text-[#526174]">No. Dokumen:</span>
                <p className="font-mono font-semibold text-[#1E293B]">{savedRecord.production_id}</p>
              </div>
              <div>
                <span className="text-xs text-[#526174]">Pesanan:</span>
                <p className="font-semibold text-[#1E293B]">{selectedOrder.order_id} ({selectedPartner?.partner_name})</p>
              </div>
              <div>
                <span className="text-xs text-[#526174]">Barang / Part:</span>
                <p className="font-semibold text-[#1E293B]">{selectedProduct?.product_name}</p>
              </div>
              <div>
                <span className="text-xs text-[#526174]">Jumlah Ditambahkan:</span>
                <p className="font-bold text-base text-[#0077C8] tabular-nums">
                  +{savedRecord.quantity_completed.toLocaleString('id-ID')} pcs
                </p>
              </div>
              <div>
                <span className="text-xs text-[#526174]">Operator Pelapor:</span>
                <p className="font-semibold text-[#1E293B]">{savedRecord.recorded_by}</p>
              </div>
              <div>
                <span className="text-xs text-[#526174]">Waktu Input:</span>
                <p className="font-semibold text-[#1E293B]">{savedRecord.reported_at}</p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => {
                setIsSuccess(false);
                setCompletedQty('');
                setRejectQty('0');
                setNotes('');
                setSavedRecord(null);
              }}
              className="h-[52px] px-6 bg-[#0077C8] hover:bg-[#0069b2] text-white font-semibold text-base rounded-[10px] flex items-center justify-center gap-2 cursor-pointer shadow-xs focus-beesha"
            >
              <span>Catat Produksi Lagi</span>
              <Factory className="w-4 h-4" />
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
            <h1 className="text-2xl md:text-3xl font-bold text-[#1E293B]">Catat Hasil Produksi</h1>
          </div>
          <p className="text-sm md:text-base text-[#526174] mt-1 ml-9">
            Pilih pesanan, lalu masukkan jumlah barang yang selesai diproduksi.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
        {/* Form Container (8 cols) */}
        <div className="lg:col-span-8 bg-white border border-[#D9E0E8] rounded-xl p-6 md:p-8 shadow-xs">
          <form onSubmit={handlePreSubmit} className="space-y-6">
            {/* Field 1: Pilih Pesanan */}
            <div>
              <label htmlFor="order-selector" className="block text-base font-semibold text-[#1E293B] mb-2">
                Pilih Pesanan yang Selesai Dibuat <span className="text-[#B42318]">*</span>
              </label>
              <select
                id="order-selector"
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
                      {o.order_id} — {p?.partner_name} ({prd?.product_name} - Sisa target: {prog.remainingProduction} pcs)
                    </option>
                  );
                })}
              </select>
              <p className="text-xs text-[#526174] mt-1.5">
                Operator tidak perlu mengetik ulang nama mitra atau spesifikasi part.
              </p>
            </div>

            {/* Read-Only Selected Order Summary Card (Section 10.2) */}
            {selectedOrder && orderProgress && (
              <div className="p-5 rounded-xl bg-blue-50/50 border border-blue-200 space-y-3 animate-in fade-in duration-150">
                <div className="flex justify-between items-center pb-2 border-b border-blue-200/60">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#0077C8]">
                    Ringkasan Pesanan Terpilih
                  </span>
                  <span className="text-xs font-mono font-semibold text-[#1B365D]">
                    {selectedOrder.po_number}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                  <div>
                    <span className="text-xs text-[#526174]">Nama Mitra:</span>
                    <p className="font-semibold text-[#1E293B]">{selectedPartner?.partner_name}</p>
                  </div>
                  <div>
                    <span className="text-xs text-[#526174]">Nama Barang / Part:</span>
                    <p className="font-semibold text-[#1E293B]">{selectedProduct?.product_name}</p>
                  </div>
                  <div>
                    <span className="text-xs text-[#526174]">Total Dipesan:</span>
                    <p className="font-bold text-base text-[#1E293B] tabular-nums">
                      {orderProgress.totalOrdered.toLocaleString('id-ID')} pcs
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-[#526174]">Total Tercatat Selesai:</span>
                    <p className="font-bold text-base text-[#0077C8] tabular-nums">
                      {orderProgress.totalProduced.toLocaleString('id-ID')} pcs ({orderProgress.productionPercentage}%)
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-[#526174]">Sisa Target Produksi:</span>
                    <p className="font-bold text-base text-[#B54708] tabular-nums">
                      {orderProgress.remainingProduction.toLocaleString('id-ID')} pcs
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-[#526174]">Batas Jatuh Tempo:</span>
                    <p className="font-semibold text-[#1E293B]">{selectedOrder.due_date}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Field 2: Jumlah Selesai Diproduksi */}
            <div>
              <label htmlFor="completed-qty" className="block text-base font-semibold text-[#1E293B] mb-2">
                Jumlah Selesai Diproduksi <span className="text-[#B42318]">*</span>
              </label>
              <div className="relative">
                <input
                  id="completed-qty"
                  type="number"
                  min="1"
                  step="1"
                  value={completedQty}
                  onChange={(e) => {
                    setCompletedQty(e.target.value);
                    setErrorMessage(null);
                  }}
                  placeholder="Masukkan jumlah unit selesai"
                  className="w-full h-[56px] pl-4 pr-14 bg-[#F8FAFC] border border-[#D9E0E8] focus:border-[#0077C8] rounded-lg text-lg text-[#1E293B] font-bold tabular-nums focus-beesha outline-none"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-base font-semibold text-[#526174] pointer-events-none">
                  pcs
                </span>
              </div>
              <p className="text-xs text-[#526174] mt-1.5">
                Masukkan hanya unit barang yang telah lolos QC inspeksi awal.
              </p>
            </div>

            {/* Error & Warning Messages */}
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
                <span>{showOptional ? 'Sembunyikan Catatan Produksi' : 'Tambah Catatan & Unit Reject (Opsional)'}</span>
              </button>

              {showOptional && (
                <div className="mt-4 space-y-4 p-4 rounded-lg bg-[#F8FAFC] border border-[#D9E0E8] animate-in fade-in duration-200">
                  <div>
                    <label className="block text-sm font-semibold text-[#1E293B] mb-1">
                      Jumlah Produk Tidak Sesuai (Reject / Scrap)
                    </label>
                    <div className="relative max-w-xs">
                      <input
                        type="number"
                        min="0"
                        value={rejectQty}
                        onChange={(e) => setRejectQty(e.target.value)}
                        className="w-full h-11 pl-3 pr-12 bg-white border border-[#D9E0E8] rounded-lg text-sm text-[#1E293B] tabular-nums focus-beesha outline-none"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#526174]">
                        pcs
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#1E293B] mb-1">
                      Catatan Lini Produksi / Shift Mesin
                    </label>
                    <textarea
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Contoh: Shift pagi mesin stamping aman, ganti mata potong jam 14:00"
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
                Simpan Hasil Produksi
              </button>
            </div>
          </form>
        </div>

        {/* Informational Side Card (4 cols) */}
        <div className="lg:col-span-4 bg-white border border-[#D9E0E8] rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#D9E0E8]">
            <Factory className="w-5 h-5 text-[#0077C8]" />
            <h3 className="text-lg font-bold text-[#1E293B]">Informasi Pelaporan</h3>
          </div>

          <div className="space-y-3 text-sm">
            <div>
              <span className="text-xs text-[#526174]">Waktu Pelaporan Otomatis:</span>
              <p className="font-semibold text-[#1E293B]">06 November 2026, 09:30 WIB</p>
            </div>
            <div>
              <span className="text-xs text-[#526174]">Operator Bertugas:</span>
              <p className="font-semibold text-[#1E293B]">Joko Sutopo (Operator Lini 1)</p>
            </div>
            <div>
              <span className="text-xs text-[#526174]">Lini Perakitan:</span>
              <p className="font-semibold text-[#1E293B]">Plant A — Stamping & Presisi</p>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-[#F8FAFC] border border-[#D9E0E8] text-xs text-[#526174] leading-relaxed">
            🔍 <strong>Kaidah Operasional:</strong> Setiap penambahan unit produksi akan otomatis mengakumulasi progres pesanan dan mengubah status menjadi <em>Dalam Produksi</em> jika sebelumnya berstatus Baru.
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-[#D9E0E8] max-w-lg w-full p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <h3 className="text-xl font-bold text-[#1E293B]">Konfirmasi Hasil Produksi</h3>
            <p className="text-sm text-[#526174] mt-1">
              Pastikan jumlah fisik barang jadi telah sesuai dengan data laporan berikut:
            </p>

            <div className="mt-5 p-4 rounded-lg bg-[#F8FAFC] border border-[#D9E0E8] space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-[#526174]">No. Pesanan:</span>
                <span className="font-mono font-bold text-[#1B365D]">{selectedOrder.order_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#526174]">Mitra:</span>
                <span className="font-semibold text-[#1E293B]">{selectedPartner?.partner_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#526174]">Nama Barang:</span>
                <span className="font-semibold text-[#1E293B]">{selectedProduct?.product_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#526174]">Jumlah Ditambahkan:</span>
                <span className="font-bold text-base text-[#0077C8] tabular-nums">
                  +{completedQty} pcs
                </span>
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
                Ya, Simpan Produksi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
