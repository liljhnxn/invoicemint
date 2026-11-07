"use client";

import React from "react";
import { Invoice } from "@/types/invoice";
import {
  formatAddress,
  formatCryptoAmount,
  formatDate,
  formatDateTime,
  getInvoiceStatusDisplay,
} from "@/lib/utils";
import { X, Printer, ExternalLink, Calendar, User, FileText, Wallet, Hash } from "lucide-react";

interface InvoiceDetailModalProps {
  invoice: Invoice | null;
  onClose: () => void;
}

export function InvoiceDetailModal({ invoice, onClose }: InvoiceDetailModalProps) {
  if (!invoice) return null;

  const statusDisplay = getInvoiceStatusDisplay(invoice);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 printable-invoice-container">
      <div className="relative w-full max-w-2xl rounded-2xl border border-zinc-800 bg-[#121419] p-6 sm:p-8 shadow-2xl shadow-black/80 printable-invoice-card">
        {/* Controls Bar (hidden during print) */}
        <div className="flex items-center justify-between pb-6 border-b border-zinc-800/80 no-print">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-400">
              Invoice Details
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-800/80 px-3.5 py-1.5 text-xs font-medium text-zinc-200 hover:bg-zinc-700 hover:text-white transition-all shadow-sm active:scale-95"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="rounded-xl p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Header */}
        <div className="pt-6 sm:pt-4 flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b border-zinc-800/80 printable-header">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-700 text-white font-bold text-base shadow-sm">
                IM
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-zinc-100">
                  Invoice<span className="text-purple-400">Mint</span>
                </span>
                <p className="text-[11px] text-zinc-400 printable-text-muted">
                  Create invoices. Keep every record.
                </p>
              </div>
            </div>
            <div className="mt-4 space-y-1 text-xs text-zinc-400 printable-text-muted">
              <div className="flex items-center gap-1.5">
                <Wallet className="h-3.5 w-3.5 text-zinc-400" />
                <span>Issuer: </span>
                <span className="font-mono text-zinc-300">{formatAddress(invoice.issuer)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span>Network: Botchain Mainnet (Chain ID 677)</span>
              </div>
            </div>
          </div>

          <div className="sm:text-right space-y-1.5">
            <div className="inline-block">
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ${statusDisplay.badgeClass}`}
              >
                {statusDisplay.label}
              </span>
            </div>
            <div className="text-sm font-mono font-medium text-zinc-300">
              Invoice #{invoice.id.toString().padStart(4, "0")}
            </div>
            <div className="text-xs text-zinc-400 printable-text-muted">
              Issued: {formatDate(invoice.createdAt)}
            </div>
            <div className="text-xs text-zinc-400 printable-text-muted">
              Due: {formatDate(invoice.dueDate)}
            </div>
          </div>
        </div>

        {/* Billed To / Details */}
        <div className="py-6 grid grid-cols-1 sm:grid-cols-2 gap-6 border-b border-zinc-800/80">
          <div>
            <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-400 printable-text-muted">
              Billed To
            </span>
            <div className="mt-1 text-base font-semibold text-zinc-100">
              {invoice.customerName}
            </div>
            <div className="mt-1 text-xs text-zinc-400 printable-text-muted">
              Decentralized On-Chain Customer Record
            </div>
          </div>

          <div className="sm:text-right">
            <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-400 printable-text-muted">
              Total Amount Due
            </span>
            <div className="mt-1 text-2xl font-bold font-mono text-emerald-400">
              {formatCryptoAmount(invoice.amount)} BOT
            </div>
            <div className="text-[11px] text-zinc-400 printable-text-muted">
              Native Currency on Botchain
            </div>
          </div>
        </div>

        {/* Line Item Table */}
        <div className="py-6 border-b border-zinc-800/80">
          <table className="w-full text-left text-xs printable-table">
            <thead>
              <tr className="border-b border-zinc-800/80 text-[11px] font-medium uppercase tracking-wider text-zinc-400 printable-text-muted">
                <th className="pb-3 font-medium">Service / Product Description</th>
                <th className="pb-3 text-right font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-4 text-zinc-200 text-sm whitespace-pre-wrap leading-relaxed">
                  {invoice.description}
                </td>
                <td className="py-4 text-right font-mono text-sm text-zinc-100 font-semibold align-top">
                  {formatCryptoAmount(invoice.amount)} BOT
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Summary Footer */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400 printable-text-muted">
          <div>
            <p>Recorded on-chain via InvoiceMint smart contract.</p>
            <p className="text-[11px] text-zinc-400">
              Status changes are immutable proofs logged on Botchain.
            </p>
          </div>

          <div className="no-print">
            <a
              href={`https://scan.botchain.ai/address/${invoice.issuer}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 transition-colors"
            >
              <span>View Issuer on BotchainScan</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

