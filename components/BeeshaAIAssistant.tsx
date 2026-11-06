"use client";

import React, { useState } from 'react';
import { X, Bot, Send, Sparkles, Loader2, Copy, Check } from 'lucide-react';
import { Order, ProductionRecord, DeliveryRecord, Partner, Product } from '../types';
import { generateBeeshaAIResponse } from '../utils/operations';

interface BeeshaAIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  productionRecords: ProductionRecord[];
  deliveryRecords: DeliveryRecord[];
  partners: Partner[];
  products: Product[];
  onNavigateToScreen?: (screen: any) => void;
}

interface Message {
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export const BeeshaAIAssistant: React.FC<BeeshaAIAssistantProps> = ({
  isOpen,
  onClose,
  orders,
  productionRecords,
  deliveryRecords,
  partners,
  products,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'assistant',
      text: 'Halo! Saya **Beesha Assistant**, asisten informasi operasional PHM Group didukung oleh Google Gemini AI. Anda dapat menanyakan ringkasan pesanan aktif, capaian pengiriman, status produksi, atau solusi kendala operasional manufaktur.',
      timestamp: 'Baru saja',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const quickQuestions = [
    'Berapa pesanan yang masih aktif?',
    'Berapa jumlah barang yang sudah dikirim?',
    'Pesanan mana yang belum selesai?',
    'Apakah ada peringatan yang perlu ditindaklanjuti?',
  ];

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleSend = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userPrompt = text.trim();
    const userMsg: Message = {
      sender: 'user',
      text: userPrompt,
      timestamp: 'Sekarang',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    // Siapkan ringkasan data operasional sebagai konteks untuk Gemini
    const ordersContext = orders.map(o => {
      const partner = partners.find(p => p.partner_id === o.partner_id)?.partner_name || o.partner_id;
      const product = products.find(p => p.product_id === o.product_id)?.product_name || o.product_id;
      return `[ID: ${o.order_id}, PO: ${o.po_number}, Mitra: ${partner}, Produk: ${product}, Target: ${o.quantity_ordered} pcs, Jatuh Tempo: ${o.due_date}, Status: ${o.order_status}]`;
    }).join('\n');

    const systemInstruction = `Anda adalah Beesha Assistant, asisten AI resmi untuk Sistem Informasi Operasional PT Putra Hatim Mandiri (PHM Group).
Tugas Anda adalah membantu admin operasional menjawab pertanyaan seputar pesanan, produksi, pengiriman, dan status operasional manufaktur.
Berikut data operasional terkini di sistem:
${ordersContext}

Gunakan gaya bahasa profesional, ringkas, akurat, dan berbahasa Indonesia santun. Gunakan format poin jika menjelaskan data numerik.`;

    try {
      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userPrompt,
          systemInstruction,
        }),
      });

      if (!res.ok) {
        throw new Error('Gagal memanggil Gemini API');
      }

      const data = await res.json();
      const reply = data.text || generateBeeshaAIResponse(
        userPrompt,
        orders,
        productionRecords,
        deliveryRecords,
        partners,
        products
      );

      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: reply,
          timestamp: 'Sekarang',
        },
      ]);
    } catch {
      // Fallback mulus ke kalkulasi operasional lokal jika offline atau API limit
      const fallbackReply = generateBeeshaAIResponse(
        userPrompt,
        orders,
        productionRecords,
        deliveryRecords,
        partners,
        products
      );

      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: fallbackReply,
          timestamp: 'Sekarang',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
      />

      {/* Slide-in Assistant Panel */}
      <div className="fixed inset-y-0 right-0 w-full sm:w-[420px] bg-white shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="h-[72px] bg-[#1B365D] text-white px-5 flex items-center justify-between border-b border-[#24426f]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#0077C8] flex items-center justify-center text-white">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-base text-white">Bantuan Beesha</div>
              <div className="text-xs text-blue-200">Asisten Operasional AI PHM Group</div>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Tutup Bantuan"
            className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-[#24426f] text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notice */}
        <div className="px-4 py-2 bg-blue-50 border-b border-blue-100 text-xs text-[#0B63A8] flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 shrink-0 text-[#0077C8]" />
            <span>Terhubung ke Gemini AI & data sistem terkini</span>
          </div>
          <span className="text-[10px] bg-blue-100 px-1.5 py-0.5 rounded font-medium">Online</span>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex flex-col group ${
                m.sender === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`max-w-[88%] p-3.5 rounded-xl text-sm leading-relaxed relative ${
                  m.sender === 'user'
                    ? 'bg-[#0077C8] text-white rounded-br-none shadow-xs'
                    : 'bg-[#F2F4F7] text-[#1E293B] border border-[#D9E0E8] rounded-bl-none shadow-xs'
                }`}
              >
                <div className="whitespace-pre-line">
                  {m.text}
                </div>
                {m.sender === 'assistant' && (
                  <button
                    onClick={() => handleCopy(m.text, idx)}
                    title="Salin teks"
                    className="absolute -bottom-2.5 right-2 opacity-0 group-hover:opacity-100 p-1 bg-white border border-[#D9E0E8] rounded text-[#526174] hover:text-[#0077C8] shadow-xs transition-opacity cursor-pointer"
                  >
                    {copiedIndex === idx ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  </button>
                )}
              </div>
              <span className="text-[10px] text-[#526174] mt-1 px-1">{m.timestamp}</span>
            </div>
          ))}

          {isLoading && (
            <div className="flex flex-col items-start">
              <div className="p-3.5 rounded-xl rounded-bl-none bg-[#F2F4F7] border border-[#D9E0E8] text-sm text-[#526174] flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-[#0077C8]" />
                <span>Beesha sedang menganalisis data...</span>
              </div>
            </div>
          )}
        </div>

        {/* Quick Suggestion Pills */}
        <div className="p-3 bg-[#F8FAFC] border-t border-[#D9E0E8] space-y-1.5">
          <p className="text-[11px] font-semibold text-[#526174]">Pertanyaan Operasional Cepat:</p>
          <div className="flex flex-wrap gap-1.5">
            {quickQuestions.map((q, i) => (
              <button
                key={i}
                disabled={isLoading}
                onClick={() => handleSend(q)}
                className="text-xs bg-white hover:bg-blue-50 text-[#1E293B] hover:text-[#0077C8] border border-[#D9E0E8] rounded-md px-2.5 py-1 text-left transition-colors cursor-pointer disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-[#D9E0E8] bg-white flex items-center gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend(inputValue);
            }}
            disabled={isLoading}
            placeholder="Tanyakan status pesanan, produksi, atau pengiriman..."
            className="flex-1 h-11 px-3.5 bg-[#F8FAFC] border border-[#D9E0E8] rounded-lg text-sm text-[#1E293B] focus-beesha outline-none disabled:opacity-50"
          />
          <button
            onClick={() => handleSend(inputValue)}
            disabled={!inputValue.trim() || isLoading}
            className="w-11 h-11 bg-[#0077C8] hover:bg-[#0069b2] disabled:bg-slate-300 text-white rounded-lg flex items-center justify-center shrink-0 cursor-pointer shadow-xs focus-beesha transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
