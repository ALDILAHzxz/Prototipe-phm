import React, { useState } from 'react';
import {
  ClipboardPlus,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  ArrowLeft,
  Building2,
  Calendar,
  Layers,
  FileCheck,
} from 'lucide-react';
import { Partner, Product, Order } from '../../types';
import { validateOrderInput } from '../../utils/operations';

interface NewOrderFormProps {
  partners: Partner[];
  products: Product[];
  nextOrderNumber: number;
  onSaveOrder: (newOrder: Order) => void;
  onCancel: () => void;
  onViewOrderDetail: (orderId: string) => void;
}

export const NewOrderForm: React.FC<NewOrderFormProps> = ({
  partners,
  products,
  nextOrderNumber,
  onSaveOrder,
  onCancel,
  onViewOrderDetail,
}) => {
  const generatedOrderId = `DEMO-ORD-${String(nextOrderNumber).padStart(3, '0')}`;

  const [partnerId, setPartnerId] = useState('');
  const [poNumber, setPoNumber] = useState('');
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('2026-11-20');
  const [picMitra, setPicMitra] = useState('');
  const [notes, setNotes] = useState('');
  const [showOptionalFields, setShowOptionalFields] = useState(false);

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  // Confirmation Modal state
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  // Success Receipt state
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);

  const selectedPartner = partners.find((p) => p.partner_id === partnerId);
  const selectedProduct = products.find((p) => p.product_id === productId);

  // When partner is picked, auto-suggest PIC
  const handlePartnerChange = (pId: string) => {
    setPartnerId(pId);
    if (errors.partner_id) setErrors((prev) => ({ ...prev, partner_id: '' }));
    const p = partners.find((item) => item.partner_id === pId);
    if (p && !picMitra) {
      setPicMitra(p.pic_name);
    }
  };

  const handlePreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateOrderInput({
      partner_id: partnerId,
      po_number: poNumber,
      product_id: productId,
      quantity_ordered: Number(quantity),
      due_date: dueDate,
    });

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});
    setShowConfirmModal(true);
  };

  const handleFinalSubmit = () => {
    const newOrder: Order = {
      order_id: generatedOrderId,
      partner_id: partnerId,
      po_number: poNumber.trim(),
      product_id: productId,
      quantity_ordered: Number(quantity),
      order_date: '2026-11-06',
      due_date: dueDate,
      order_status: 'baru',
      pic_mitra: picMitra.trim() || undefined,
      notes: notes.trim() || undefined,
      created_by: 'Siti Rahma (Admin Pesanan)',
    };

    onSaveOrder(newOrder);
    setCreatedOrder(newOrder);
    setShowConfirmModal(false);
    setIsSuccess(true);
  };

  // SUCCESS CONFIRMATION RECEIPT SCREEN (Section 9.5 & 10)
  if (isSuccess && createdOrder) {
    return (
      <div className="max-w-2xl mx-auto py-8 animate-in zoom-in-95 duration-200">
        <div className="bg-white border border-[#D9E0E8] rounded-xl p-8 shadow-sm text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-[#18794E] flex items-center justify-center mx-auto mb-4 border border-emerald-200">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <h2 className="text-2xl font-bold text-[#1E293B]">Pesanan Berhasil Dicatat</h2>
          <p className="text-base text-[#526174] mt-1.5">
            Nomor Pesanan: <strong className="font-mono text-[#0077C8] text-lg">{createdOrder.order_id}</strong>
          </p>

          <div className="mt-6 p-5 rounded-xl bg-[#F8FAFC] border border-[#D9E0E8] text-left space-y-3">
            <h4 className="text-xs font-bold uppercase text-[#526174] tracking-wider">
              Tanda Bukti Pencatatan Pesanan
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-xs text-[#526174]">Nama Mitra:</span>
                <p className="font-semibold text-[#1E293B]">{selectedPartner?.partner_name}</p>
              </div>
              <div>
                <span className="text-xs text-[#526174]">Nomor PO Mitra:</span>
                <p className="font-semibold text-[#1E293B]">{createdOrder.po_number}</p>
              </div>
              <div>
                <span className="text-xs text-[#526174]">Nama Barang:</span>
                <p className="font-semibold text-[#1E293B]">{selectedProduct?.product_name}</p>
              </div>
              <div>
                <span className="text-xs text-[#526174]">Jumlah Pesanan:</span>
                <p className="font-bold text-base text-[#1E293B] tabular-nums">
                  {createdOrder.quantity_ordered.toLocaleString('id-ID')} pcs
                </p>
              </div>
              <div>
                <span className="text-xs text-[#526174]">Target Pengiriman:</span>
                <p className="font-semibold text-[#1E293B]">{createdOrder.due_date}</p>
              </div>
              <div>
                <span className="text-xs text-[#526174]">Status Awal:</span>
                <p className="font-semibold text-[#0B63A8]">Pesanan Baru (Antrean Produksi)</p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => onViewOrderDetail(createdOrder.order_id)}
              className="h-[52px] px-6 bg-[#0077C8] hover:bg-[#0069b2] text-white font-semibold text-base rounded-[10px] flex items-center justify-center gap-2 cursor-pointer shadow-xs focus-beesha"
            >
              <span>Lihat Detail Pesanan</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onCancel}
              className="h-[52px] px-6 bg-white hover:bg-slate-50 text-[#1B365D] border border-[#1B365D] font-semibold text-base rounded-[10px] cursor-pointer"
            >
              Kembali ke Beranda
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
            <h1 className="text-2xl md:text-3xl font-bold text-[#1E293B]">Catat Pesanan Baru</h1>
          </div>
          <p className="text-sm md:text-base text-[#526174] mt-1 ml-9">
            Masukkan data pesanan yang diterima dari mitra perusahaan secara teliti.
          </p>
        </div>
        <div className="hidden sm:block text-right">
          <span className="text-xs text-[#526174]">ID Pesanan Sistem:</span>
          <p className="font-mono font-bold text-base text-[#1B365D]">{generatedOrderId}</p>
        </div>
      </div>

      {/* Main Layout: Form Card (720px) + Informational Summary (300px) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
        {/* Form Container (8 cols) */}
        <div className="lg:col-span-8 bg-white border border-[#D9E0E8] rounded-xl p-6 md:p-8 shadow-xs">
          <form onSubmit={handlePreSubmit} className="space-y-6">
            {/* Field 1: Nama Mitra */}
            <div>
              <label htmlFor="partner-select" className="block text-base font-semibold text-[#1E293B] mb-2">
                Nama Mitra Perusahaan <span className="text-[#B42318]">*</span>
              </label>
              <select
                id="partner-select"
                value={partnerId}
                onChange={(e) => handlePartnerChange(e.target.value)}
                className={`w-full h-[56px] px-4 bg-[#F8FAFC] border rounded-lg text-base text-[#1E293B] focus-beesha outline-none cursor-pointer ${
                  errors.partner_id ? 'border-[#B42318] bg-red-50/20' : 'border-[#D9E0E8]'
                }`}
              >
                <option value="">-- Pilih Nama Mitra --</option>
                {partners.map((p) => (
                  <option key={p.partner_id} value={p.partner_id}>
                    {p.partner_name} ({p.city})
                  </option>
                ))}
              </select>
              {errors.partner_id ? (
                <p className="text-xs text-[#B42318] mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errors.partner_id}</span>
                </p>
              ) : (
                <p className="text-xs text-[#526174] mt-1.5">
                  Pilih mitra terdaftar dari direktori PHM Group.
                </p>
              )}
            </div>

            {/* Field 2: Nomor PO Mitra */}
            <div>
              <label htmlFor="po-number" className="block text-base font-semibold text-[#1E293B] mb-2">
                Nomor PO Mitra <span className="text-[#B42318]">*</span>
              </label>
              <input
                id="po-number"
                type="text"
                value={poNumber}
                onChange={(e) => {
                  setPoNumber(e.target.value);
                  if (errors.po_number) setErrors((prev) => ({ ...prev, po_number: '' }));
                }}
                placeholder="Contoh: PO-2026-001"
                className={`w-full h-[56px] px-4 bg-[#F8FAFC] border rounded-lg text-base text-[#1E293B] focus-beesha outline-none font-medium ${
                  errors.po_number ? 'border-[#B42318] bg-red-50/20' : 'border-[#D9E0E8]'
                }`}
              />
              {errors.po_number ? (
                <p className="text-xs text-[#B42318] mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errors.po_number}</span>
                </p>
              ) : (
                <p className="text-xs text-[#526174] mt-1.5">
                  Masukkan nomor pesanan resmi yang tercantum pada dokumen Purchase Order mitra.
                </p>
              )}
            </div>

            {/* Field 3: Nama Barang / Part */}
            <div>
              <label htmlFor="product-select" className="block text-base font-semibold text-[#1E293B] mb-2">
                Nama Barang / Part <span className="text-[#B42318]">*</span>
              </label>
              <select
                id="product-select"
                value={productId}
                onChange={(e) => {
                  setProductId(e.target.value);
                  if (errors.product_id) setErrors((prev) => ({ ...prev, product_id: '' }));
                }}
                className={`w-full h-[56px] px-4 bg-[#F8FAFC] border rounded-lg text-base text-[#1E293B] focus-beesha outline-none cursor-pointer ${
                  errors.product_id ? 'border-[#B42318] bg-red-50/20' : 'border-[#D9E0E8]'
                }`}
              >
                <option value="">-- Pilih Barang yang Dipesan --</option>
                {products.map((prd) => (
                  <option key={prd.product_id} value={prd.product_id}>
                    {prd.product_name} — Kode: {prd.product_code}
                  </option>
                ))}
              </select>
              {errors.product_id ? (
                <p className="text-xs text-[#B42318] mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errors.product_id}</span>
                </p>
              ) : (
                <p className="text-xs text-[#526174] mt-1.5">
                  Produk part manufaktur dengan cetak biru terverifikasi.
                </p>
              )}
            </div>

            {/* Two-Column: Jumlah Pesanan & Target Pengiriman */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Field 4: Jumlah Pesanan */}
              <div>
                <label htmlFor="order-qty" className="block text-base font-semibold text-[#1E293B] mb-2">
                  Jumlah Pesanan <span className="text-[#B42318]">*</span>
                </label>
                <div className="relative">
                  <input
                    id="order-qty"
                    type="number"
                    min="1"
                    step="1"
                    value={quantity}
                    onChange={(e) => {
                      setQuantity(e.target.value);
                      if (errors.quantity_ordered)
                        setErrors((prev) => ({ ...prev, quantity_ordered: '' }));
                    }}
                    placeholder="Masukkan jumlah unit"
                    className={`w-full h-[56px] pl-4 pr-14 bg-[#F8FAFC] border rounded-lg text-base text-[#1E293B] font-semibold tabular-nums focus-beesha outline-none ${
                      errors.quantity_ordered ? 'border-[#B42318] bg-red-50/20' : 'border-[#D9E0E8]'
                    }`}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#526174] pointer-events-none">
                    pcs
                  </span>
                </div>
                {errors.quantity_ordered ? (
                  <p className="text-xs text-[#B42318] mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errors.quantity_ordered}</span>
                  </p>
                ) : (
                  <p className="text-xs text-[#526174] mt-1.5">Satuan standar: pcs (pieces).</p>
                )}
              </div>

              {/* Field 5: Target Pengiriman */}
              <div>
                <label htmlFor="due-date" className="block text-base font-semibold text-[#1E293B] mb-2">
                  Target Pengiriman <span className="text-[#B42318]">*</span>
                </label>
                <input
                  id="due-date"
                  type="date"
                  value={dueDate}
                  onChange={(e) => {
                    setDueDate(e.target.value);
                    if (errors.due_date) setErrors((prev) => ({ ...prev, due_date: '' }));
                  }}
                  className={`w-full h-[56px] px-4 bg-[#F8FAFC] border rounded-lg text-base text-[#1E293B] focus-beesha outline-none ${
                    errors.due_date ? 'border-[#B42318] bg-red-50/20' : 'border-[#D9E0E8]'
                  }`}
                />
                {errors.due_date ? (
                  <p className="text-xs text-[#B42318] mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errors.due_date}</span>
                  </p>
                ) : (
                  <p className="text-xs text-[#526174] mt-1.5">Batas waktu serah terima barang ke mitra.</p>
                )}
              </div>
            </div>

            {/* Optional Collapsed Section: Informasi Tambahan */}
            <div className="pt-2 border-t border-[#D9E0E8]">
              <button
                type="button"
                onClick={() => setShowOptionalFields(!showOptionalFields)}
                className="flex items-center gap-2 text-sm font-semibold text-[#0077C8] hover:underline cursor-pointer"
              >
                {showOptionalFields ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                <span>{showOptionalFields ? 'Sembunyikan Informasi Tambahan' : 'Tambah Catatan & PIC Mitra (Opsional)'}</span>
              </button>

              {showOptionalFields && (
                <div className="mt-4 space-y-4 p-4 rounded-lg bg-[#F8FAFC] border border-[#D9E0E8] animate-in fade-in duration-200">
                  <div>
                    <label className="block text-sm font-semibold text-[#1E293B] mb-1">
                      Nama PIC Mitra
                    </label>
                    <input
                      type="text"
                      value={picMitra}
                      onChange={(e) => setPicMitra(e.target.value)}
                      placeholder="Nama penanggung jawab dari mitra"
                      className="w-full h-12 px-4 bg-white border border-[#D9E0E8] rounded-lg text-sm text-[#1E293B] focus-beesha outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#1E293B] mb-1">
                      Catatan Pesanan Khusus
                    </label>
                    <textarea
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Contoh: Pengiriman dibagi dua batch atau permintaan packing kayu"
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
                className="w-full sm:w-auto min-w-[180px] h-[52px] px-8 bg-[#0077C8] hover:bg-[#0069b2] active:bg-[#005a99] text-white font-semibold text-base rounded-[10px] shadow-xs cursor-pointer transition-colors focus-beesha"
              >
                Simpan Pesanan
              </button>
            </div>
          </form>
        </div>

        {/* Informational Summary Card (4 cols) */}
        <div className="lg:col-span-4 bg-white border border-[#D9E0E8] rounded-xl p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-[#D9E0E8]">
            <FileCheck className="w-5 h-5 text-[#0077C8]" />
            <h3 className="text-lg font-bold text-[#1E293B]">Informasi Pencatatan</h3>
          </div>

          <div className="space-y-3 text-sm">
            <div>
              <span className="text-xs text-[#526174]">No. Pencatatan Otomatis:</span>
              <p className="font-mono font-bold text-base text-[#1B365D]">{generatedOrderId}</p>
            </div>
            <div>
              <span className="text-xs text-[#526174]">Tanggal Input Sistem:</span>
              <p className="font-semibold text-[#1E293B]">06 November 2026</p>
            </div>
            <div>
              <span className="text-xs text-[#526174]">Petugas Admin:</span>
              <p className="font-semibold text-[#1E293B]">Siti Rahma (Admin Pesanan)</p>
            </div>
            {selectedProduct && (
              <div className="p-3 rounded-lg bg-blue-50/60 border border-blue-200">
                <span className="text-xs font-semibold text-[#0077C8]">Lead Time Standar:</span>
                <p className="text-xs text-[#1E293B] mt-0.5">
                  {selectedProduct.standard_lead_time_days} hari kerja produksi
                </p>
                <p className="text-[11px] text-[#526174] mt-1">{selectedProduct.specification}</p>
              </div>
            )}
          </div>

          <div className="p-4 rounded-lg bg-[#F8FAFC] border border-[#D9E0E8] text-xs text-[#526174] leading-relaxed">
            💡 <strong>Panduan Usability:</strong> Setelah Anda menyimpan pesanan ini, pesanan akan langsung tersedia pada formulir <strong>Catat Hasil Produksi</strong> dan <strong>Catat Pengiriman</strong> tanpa perlu mengetik ulang nomor dan nama mitra.
          </div>
        </div>
      </div>

      {/* Confirmation Modal (Section 9.5) */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-[#D9E0E8] max-w-lg w-full p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <h3 className="text-xl font-bold text-[#1E293B]">Konfirmasi Simpan Pesanan</h3>
            <p className="text-sm text-[#526174] mt-1">
              Apakah data pesanan berikut sudah benar dan sesuai dengan dokumen PO mitra?
            </p>

            <div className="mt-5 p-4 rounded-lg bg-[#F8FAFC] border border-[#D9E0E8] space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-[#526174]">Mitra:</span>
                <span className="font-semibold text-[#1E293B]">{selectedPartner?.partner_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#526174]">Nomor PO:</span>
                <span className="font-semibold text-[#1E293B]">{poNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#526174]">Nama Barang:</span>
                <span className="font-semibold text-[#1E293B]">{selectedProduct?.product_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#526174]">Jumlah Pesanan:</span>
                <span className="font-bold text-[#0077C8] tabular-nums">{quantity} pcs</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#526174]">Target Pengiriman:</span>
                <span className="font-semibold text-[#1E293B]">{dueDate}</span>
              </div>
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
                Ya, Simpan Pesanan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
