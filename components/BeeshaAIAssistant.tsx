"use client";

import React, { useEffect, useRef, useState } from 'react';
import { X, Send, Loader2, Bot, Calculator } from 'lucide-react';
import { Order, ProductionRecord, DeliveryRecord, Partner, Product } from '../types';
import { calculateSingleOrderProgress, generateBeeshaAIResponse, getVerificationStatus } from '../utils/operations';
import { ORDER_STATUS_LABEL } from './ui/StatusBadge';
import { todayISODate } from '../lib/format';

interface BeeshaAIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  productionRecords: ProductionRecord[];
  deliveryRecords: DeliveryRecord[];
  partners: Partner[];
  products: Product[];
}

type AnswerSource = 'gemini' | 'hitung_lokal';

interface Message {
  sender: 'user' | 'assistant';
  text: string;
  source?: AnswerSource;
  note?: string;
}

/**
 * Panel tanya-jawab. Jawaban diberi label sumber secara jujur:
 * - "Gemini AI" bila server memiliki kunci Gemini dan panggilan berhasil;
 * - "Hitungan otomatis" bila AI tidak tersedia (jawaban dihitung dari data aplikasi).
 * Ini BUKAN integrasi BHEESA.
 */
export const BeeshaAIAssistant: React.FC<BeeshaAIAssistantProps> = ({
  isOpen,
  onClose,
  orders,
  productionRecords,
  deliveryRecords,
  partners,
  products,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [aiConfigured, setAiConfigured] = useState<boolean | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    inputRef.current?.focus();
    fetch('/api/gemini')
      .then((r) => r.json())
      .then((d) => setAiConfigured(!!d.configured))
      .catch(() => setAiConfigured(false));
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages, isLoading]);

  if (!isOpen) return null;

  const quickQuestions = [
    'Berapa pesanan yang masih aktif?',
    'Berapa barang yang sudah dikirim?',
    'Pesanan mana yang belum selesai?',
    'Ada pesanan yang terlambat?',
  ];

  const buildContext = () => {
    const lines = orders.map((o) => {
      const p = calculateSingleOrderProgress(o, productionRecords, deliveryRecords);
      const partner = partners.find((x) => x.partner_id === o.partner_id)?.partner_name ?? o.partner_id;
      const product = products.find((x) => x.product_id === o.product_id)?.product_name ?? o.product_id;
      const pendingCheck = [...productionRecords, ...deliveryRecords].filter(
        (r) => r.order_id === o.order_id && getVerificationStatus(r) !== 'terverifikasi'
      ).length;
      return `[${o.order_id}] PO ${o.po_number}; mitra ${partner}; barang ${product}; rencana ${o.quantity_ordered} pcs; diproduksi ${p.totalProduced}; dikirim ${p.totalShipped}; tenggat ${o.due_date}; status ${ORDER_STATUS_LABEL[p.computedStatus]}; catatan belum diperiksa ${pendingCheck}`;
    });
    return `Anda membantu staf PT Putra Hatim Mandiri memahami data operasional di aplikasi prototipe BEESHA.
Tanggal hari ini: ${todayISODate()}.
Data di bawah adalah DATA CONTOH/PROTOTIPE yang tersimpan di perangkat pengguna, bukan data resmi INDIGO.
"Rencana" = jumlah dipesan; "diproduksi"/"dikirim" = realisasi tercatat (sebagian mungkin belum diperiksa supervisor).
Jawab singkat, dalam bahasa Indonesia sederhana. Jangan mengarang angka di luar data ini; bila data tidak cukup, katakan tidak tahu.

${lines.join('\n')}`;
  };

  const handleSend = async (text: string) => {
    const prompt = text.trim();
    if (!prompt || isLoading) return;
    setMessages((prev) => [...prev, { sender: 'user', text: prompt }]);
    setInputValue('');
    setIsLoading(true);

    const local = () =>
      generateBeeshaAIResponse(prompt, orders, productionRecords, deliveryRecords, partners, products);

    try {
      if (aiConfigured === false) throw new Error('not_configured');
      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, systemInstruction: buildContext() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.text) throw new Error(data.code || 'failed');
      setMessages((prev) => [...prev, { sender: 'assistant', text: data.text, source: 'gemini' }]);
    } catch (e) {
      const notConfigured = (e as Error).message === 'not_configured';
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: local(),
          source: 'hitung_lokal',
          note: notConfigured ? 'Gemini AI belum dipasang di server.' : 'Gemini AI sedang tidak dapat dihubungi.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-labelledby="judul-tanya-beesha">
      <div onClick={onClose} className="absolute inset-0 bg-ink/60" aria-hidden />

      <div className="absolute inset-y-0 right-0 w-full sm:w-[460px] bg-surface shadow-2xl flex flex-col">
        <div className="h-16 bg-navy text-white px-4 flex items-center justify-between shrink-0">
          <h2 id="judul-tanya-beesha" className="font-bold text-lg">
            Tanya Beesha
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[48px] px-3 flex items-center gap-2 rounded-field hover:bg-navy-strong text-base font-semibold cursor-pointer"
          >
            <X className="w-5 h-5" aria-hidden />
            Tutup
          </button>
        </div>

        <div className="px-4 py-3 bg-subtle border-b border-line text-[15px] text-ink" role="status">
          {aiConfigured === null && 'Memeriksa ketersediaan Gemini AI…'}
          {aiConfigured === true && 'Jawaban dibuat oleh Gemini AI dari data di aplikasi ini. Periksa kembali angka penting.'}
          {aiConfigured === false &&
            'Gemini AI belum terhubung. Jawaban dihitung otomatis dari data aplikasi untuk pertanyaan umum.'}
          <span className="block text-sm text-ink-muted mt-1">Belum terhubung ke AI BHEESA.</span>
        </div>

        <div ref={listRef} className="flex-1 overflow-y-auto p-4 space-y-4" aria-live="polite">
          {messages.length === 0 && (
            <p className="text-base text-ink-muted">
              Tanyakan ringkasan pesanan, produksi, atau pengiriman. Pilih salah satu pertanyaan di bawah untuk mulai.
            </p>
          )}
          {messages.map((m, idx) => (
            <div key={idx} className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}>
              <div
                className={`max-w-[90%] p-3.5 rounded-card text-base leading-relaxed whitespace-pre-line ${
                  m.sender === 'user' ? 'bg-brand text-white' : 'bg-subtle text-ink border border-line'
                }`}
              >
                {m.text}
              </div>
              {m.sender === 'assistant' && (
                <span className="mt-1 text-sm text-ink-muted flex items-center gap-1.5">
                  {m.source === 'gemini' ? (
                    <>
                      <Bot className="w-4 h-4" aria-hidden /> Sumber: Gemini AI
                    </>
                  ) : (
                    <>
                      <Calculator className="w-4 h-4" aria-hidden /> Sumber: hitungan otomatis aplikasi
                      {m.note && ` (${m.note})`}
                    </>
                  )}
                </span>
              )}
            </div>
          ))}
          {isLoading && (
            <p className="flex items-center gap-2 text-base text-ink-muted">
              <Loader2 className="w-5 h-5 animate-spin" aria-hidden /> Sedang menyiapkan jawaban…
            </p>
          )}
        </div>

        <div className="p-3 bg-subtle border-t border-line">
          <p className="text-sm font-semibold text-ink-muted mb-2">Pertanyaan cepat</p>
          <div className="flex flex-wrap gap-2">
            {quickQuestions.map((q) => (
              <button
                key={q}
                type="button"
                disabled={isLoading}
                onClick={() => handleSend(q)}
                className="min-h-[44px] text-[15px] bg-surface hover:bg-brand-soft text-ink border border-line-field rounded-field px-3 text-left cursor-pointer disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        <form
          className="p-3 border-t border-line bg-surface flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(inputValue);
          }}
        >
          <label htmlFor="tanya-input" className="sr-only">
            Tulis pertanyaan
          </label>
          <input
            id="tanya-input"
            ref={inputRef}
            type="text"
            value={inputValue}
            maxLength={1000}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isLoading}
            placeholder="Tulis pertanyaan…"
            className="flex-1 min-h-[52px] px-4 bg-surface border border-line-field rounded-field text-base outline-none focus:border-brand focus:ring-2 focus:ring-brand/30 disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="min-h-[52px] px-4 bg-brand hover:bg-brand-strong disabled:opacity-50 text-white rounded-field flex items-center gap-2 font-semibold cursor-pointer"
          >
            <Send className="w-5 h-5" aria-hidden />
            Kirim
          </button>
        </form>
      </div>
    </div>
  );
};
