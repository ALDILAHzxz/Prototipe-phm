"use client";

import React, { useEffect, useRef, useState } from 'react';
import { X, Send, Loader2, Bot, Calculator, ChevronDown, ChevronUp, Sparkles, MessageSquare } from 'lucide-react';
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
  const [showSuggestions, setShowSuggestions] = useState(true);
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
    setShowSuggestions(false);
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

      <div className="absolute inset-y-0 right-0 w-full sm:w-[480px] bg-surface shadow-2xl flex flex-col border-l border-line">
        <div className="h-16 bg-navy text-white px-5 flex items-center justify-between shrink-0 shadow-xs">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center text-white font-bold text-sm">
              <Bot className="w-5 h-5" />
            </span>
            <div>
              <h2 id="judul-tanya-beesha" className="font-bold text-lg leading-tight">
                Tanya Beesha
              </h2>
              <span className="text-xs text-white/75 font-normal">Asisten Analitik Operasional PHM</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-3 flex items-center gap-1.5 rounded-field hover:bg-navy-strong text-[15px] font-semibold cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" aria-hidden />
            Tutup
          </button>
        </div>

        <div className="px-4 py-2.5 bg-subtle border-b border-line text-[14px] text-ink" role="status">
          {aiConfigured === null && 'Memeriksa ketersediaan Gemini AI…'}
          {aiConfigured === true && (
            <span className="text-navy dark:text-[#8CCBFF] font-medium">Jawaban dianalisis oleh Gemini AI dari data di aplikasi ini.</span>
          )}
          {aiConfigured === false && (
            <span className="text-ink">Gemini AI belum terpasang. Jawaban dihitung otomatis dari data aplikasi lokal.</span>
          )}
          <span className="block text-xs text-ink-muted mt-0.5">Simulasi prototipe · Belum terhubung ke server live BHEESA/INDIGO.</span>
        </div>

        {/* Conversation Area with max space */}
        <div ref={listRef} className="flex-1 overflow-y-auto p-4 md:p-5 space-y-4" aria-live="polite">
          {messages.length === 0 && (
            <div className="p-4 rounded-card bg-subtle border border-line text-center my-6 space-y-2">
              <div className="w-12 h-12 rounded-full bg-brand-soft text-brand mx-auto flex items-center justify-center">
                <MessageSquare className="w-6 h-6" />
              </div>
              <p className="text-base font-semibold text-ink">Ada yang bisa dibantu?</p>
              <p className="text-sm text-ink-muted max-w-xs mx-auto">
                Tanyakan ringkasan pesanan aktif, target produksi hari ini, atau pengiriman barang yang sudah siap.
              </p>
            </div>
          )}
          {messages.map((m, idx) => (
            <div key={idx} className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}>
              <div
                className={`max-w-[88%] p-4 rounded-2xl text-[16px] leading-[1.55] whitespace-pre-line shadow-xs ${
                  m.sender === 'user'
                    ? 'bg-brand text-white rounded-tr-xs'
                    : 'bg-subtle text-ink border border-line rounded-tl-xs'
                }`}
              >
                {m.text}
              </div>
              {m.sender === 'assistant' && (
                <span className="mt-1 text-xs text-ink-muted flex items-center gap-1.5 px-1">
                  {m.source === 'gemini' ? (
                    <>
                      <Bot className="w-3.5 h-3.5 text-brand" aria-hidden /> Sumber: Gemini AI
                    </>
                  ) : (
                    <>
                      <Calculator className="w-3.5 h-3.5 text-navy dark:text-[#8CCBFF]" aria-hidden /> Sumber: Hitungan Otomatis Lokal
                      {m.note && ` (${m.note})`}
                    </>
                  )}
                </span>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="p-3.5 rounded-2xl bg-subtle border border-line inline-flex items-center gap-2.5 text-[15px] text-ink">
              <Loader2 className="w-4 h-4 animate-spin text-brand" aria-hidden /> Sedang menyiapkan analisis data…
            </div>
          )}
        </div>

        {/* Collapsible Recommended Questions (Pertanyaan Cepat) */}
        <div className="bg-subtle border-t border-line transition-all duration-200">
          <div className="px-4 py-2.5 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-ink-muted flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-brand" /> Pertanyaan Cepat
            </span>
            <button
              type="button"
              onClick={() => setShowSuggestions((prev) => !prev)}
              className="text-xs font-semibold text-brand hover:text-brand-strong px-2 py-1 rounded hover:bg-brand-soft flex items-center gap-1 cursor-pointer transition-colors"
            >
              {showSuggestions ? (
                <>
                  <span>Sembunyikan</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </>
              ) : (
                <>
                  <span>Tampilkan</span>
                  <ChevronUp className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
          {showSuggestions && (
            <div className="px-4 pb-3 pt-1 flex flex-wrap gap-2 transition-all duration-200">
              {quickQuestions.map((q) => (
                <button
                  key={q}
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleSend(q)}
                  className="min-h-[40px] text-[14px] bg-surface hover:bg-brand-soft hover:border-brand/40 text-ink border border-line-field rounded-field px-3 py-1.5 text-left cursor-pointer transition-colors shadow-xs disabled:opacity-50"
                >
                  {q}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Input Message Composer */}
        <form
          className="p-3.5 border-t border-line bg-surface flex items-center gap-2"
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
            placeholder="Tanyakan status pesanan, produksi, kirim…"
            className="flex-1 min-h-[52px] px-4 bg-surface border border-line-field rounded-field text-base outline-none focus:border-brand focus:ring-2 focus:ring-brand/30 disabled:opacity-60 shadow-xs"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="interactive-button min-h-[52px] px-5 bg-brand hover:bg-brand-strong disabled:opacity-50 text-white rounded-field flex items-center gap-2 font-semibold cursor-pointer shadow-xs disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" aria-hidden />
            <span>Kirim</span>
          </button>
        </form>
      </div>
    </div>
  );
};
