"use client";

import React, { useState } from "react";
import { useAccount, useReadContract } from "wagmi";
import { Navbar } from "@/components/Navbar";
import { StatsOverview } from "@/components/StatsOverview";
import { InvoiceList } from "@/components/InvoiceList";
import { CreateInvoiceModal } from "@/components/CreateInvoiceModal";
import { InvoiceDetailModal } from "@/components/InvoiceDetailModal";
import { INVOICE_MINT_ADDRESS, INVOICE_MINT_ABI } from "@/config/contract";
import { Invoice, InvoiceStatus } from "@/types/invoice";
import {
  Plus,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  FileCheck2,
  Lock,
  ExternalLink,
  Globe,
  Search,
  CheckCircle2,
} from "lucide-react";

export default function Home() {
  const { address, isConnected } = useAccount();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // Read all invoices issued by connected wallet directly from smart contract
  const {
    data: rawInvoices,
    isLoading,
    isRefetching,
    refetch,
  } = useReadContract({
    address: INVOICE_MINT_ADDRESS,
    abi: INVOICE_MINT_ABI,
    functionName: "getMyInvoices",
    account: address,
    query: {
      enabled: isConnected && !!address,
    },
  });

  // Map contract response to typed Invoice array
  const invoices: Invoice[] = React.useMemo(() => {
    if (!rawInvoices || !Array.isArray(rawInvoices)) return [];
    return rawInvoices.map((item: any) => ({
      id: BigInt(item.id),
      customerName: item.customerName,
      description: item.description,
      amount: BigInt(item.amount),
      dueDate: BigInt(item.dueDate),
      issuer: item.issuer,
      createdAt: BigInt(item.createdAt),
      status: Number(item.status) as InvoiceStatus,
      isActive: Boolean(item.isActive),
    }));
  }, [rawInvoices]);

  const handleRefresh = () => {
    refetch();
  };

  return (
    <div className="min-h-screen bg-[#0c0d11] text-zinc-100 flex flex-col">
      <Navbar />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {!isConnected ? (
          // Disconnected Hero State
          <div className="py-16 sm:py-24 text-center max-w-2xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-800/50 bg-purple-950/40 px-4 py-1.5 text-xs font-medium text-purple-300">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Web3 On-Chain Invoicing on BOT Chain</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-100">
              Create invoices. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-purple-300 to-emerald-400">
                Keep every record.
              </span>
            </h1>

            <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
              InvoiceMint provides verifiable, immutable invoicing for freelancers, developers,
              and businesses. Your invoices exist permanently on-chain without centralized databases or intermediaries.
            </p>

            {/* Feature highlights */}
            <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
              <div className="rounded-2xl border border-zinc-800/80 bg-[#121419] p-4.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-950/70 border border-purple-800/50 text-purple-400 mb-3">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <h3 className="text-xs font-semibold text-zinc-200">100% On-Chain</h3>
                <p className="text-[11px] text-zinc-400 mt-1">
                  Every invoice ID, customer label, and amount is minted directly to BOT Chain.
                </p>
              </div>

              <div className="rounded-2xl border border-zinc-800/80 bg-[#121419] p-4.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-950/70 border border-emerald-800/50 text-emerald-400 mb-3">
                  <FileCheck2 className="h-4 w-4" />
                </div>
                <h3 className="text-xs font-semibold text-zinc-200">Print & PDF Export</h3>
                <p className="text-[11px] text-zinc-400 mt-1">
                  Generate professional printable receipts and export crisp PDF invoices with one click.
                </p>
              </div>

              <div className="rounded-2xl border border-zinc-800/80 bg-[#121419] p-4.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-800 border border-zinc-700/60 text-zinc-300 mb-3">
                  <Lock className="h-4 w-4" />
                </div>
                <h3 className="text-xs font-semibold text-zinc-200">Self-Sovereign</h3>
                <p className="text-[11px] text-zinc-400 mt-1">
                  No databases, third-party trackers, or API locks. Only your wallet manages your records.
                </p>
              </div>
            </div>

            <div className="pt-6">
              <p className="text-xs text-zinc-400">
                Connect your MetaMask wallet above to begin creating and tracking invoices on BOT Chain.
              </p>
            </div>
          </div>
        ) : (
          // Connected State
          <>
            {/* Dashboard Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-zinc-100 flex items-center gap-2">
                  <span>Invoice Dashboard</span>
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Manage and track invoices issued from your connected wallet on BOT Chain
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={handleRefresh}
                  disabled={isLoading || isRefetching}
                  title="Refresh on-chain data"
                  className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-[#14161c] px-3.5 py-2 text-xs font-medium text-zinc-300 hover:border-zinc-700 hover:bg-zinc-850 hover:text-zinc-100 transition-all disabled:opacity-50"
                >
                  <RefreshCw
                    className={`h-3.5 w-3.5 ${
                      isLoading || isRefetching ? "animate-spin text-purple-400" : "text-zinc-400"
                    }`}
                  />
                  <span className="hidden sm:inline">Refresh</span>
                </button>

                <button
                  onClick={() => setIsCreateOpen(true)}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-700 via-purple-600 to-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-purple-950/40 hover:opacity-95 transition-all active:scale-[0.98]"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create Invoice</span>
                </button>
              </div>
            </div>

            {/* Dashboard Statistics */}
            <StatsOverview invoices={invoices} isLoading={isLoading} />

            {/* Invoice List & Filters */}
            <div className="pt-2">
              <InvoiceList
                invoices={invoices}
                isLoading={isLoading}
                onRefresh={handleRefresh}
                onViewInvoice={(invoice) => setSelectedInvoice(invoice)}
              />
            </div>
          </>
        )}

        {/* BOT Chain Ecosystem Card Section */}
        <section className="pt-8 no-print">
          <div className="rounded-2xl border border-zinc-800/90 bg-gradient-to-br from-[#12141a] via-[#101217] to-[#0c0d12] p-6 sm:p-8 shadow-lg">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              {/* BOT Chain Info & Logo */}
              <div className="space-y-2">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-purple-600 font-bold text-white text-sm shadow-md">
                    BOT
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                      <span>Powered by BOT Chain</span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-950/70 border border-emerald-800/60 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>Chain ID 677</span>
                      </span>
                    </h3>
                    <p className="text-xs text-zinc-400">
                      High-performance, secure decentralized execution layer for Web3 billing & accounting
                    </p>
                  </div>
                </div>
              </div>

              {/* Ecosystem Action Links */}
              <div className="flex flex-wrap items-center gap-3">
                <a
                  href="https://botchain.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800/80 px-4 py-2.5 text-xs font-semibold text-zinc-100 hover:bg-zinc-700 hover:text-white hover:border-zinc-600 transition-all shadow-sm"
                >
                  <Globe className="h-3.5 w-3.5 text-emerald-400" />
                  <span>BOT Chain Website</span>
                  <ExternalLink className="h-3 w-3 text-zinc-400" />
                </a>

                <a
                  href="https://scan.botchain.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-xl border border-emerald-800/70 bg-emerald-950/40 px-4 py-2.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-900/60 hover:text-emerald-200 transition-all shadow-sm"
                >
                  <Search className="h-3.5 w-3.5 text-emerald-400" />
                  <span>BOT Chain Explorer</span>
                  <ExternalLink className="h-3 w-3 text-emerald-400" />
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-850 bg-[#090a0d] py-8 text-xs text-zinc-500 no-print">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-emerald-600 text-[10px] font-bold text-white">
                IM
              </div>
              <span className="font-semibold text-zinc-200">InvoiceMint</span>
              <span className="text-zinc-600">•</span>
              <span className="text-zinc-400">Create invoices. Keep every record.</span>
            </div>

            {/* Required Links in Footer */}
            <div className="flex flex-wrap items-center gap-5 text-xs">
              <a
                href="https://botchain.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-400 hover:text-emerald-400 transition-colors flex items-center gap-1"
              >
                <span>BOT Chain Website</span>
                <ExternalLink className="h-3 w-3 text-zinc-500" />
              </a>
              <span className="text-zinc-700">•</span>
              <a
                href="https://scan.botchain.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-400 hover:text-emerald-400 transition-colors flex items-center gap-1"
              >
                <span>BOT Chain Explorer</span>
                <ExternalLink className="h-3 w-3 text-zinc-500" />
              </a>
              <span className="text-zinc-700">•</span>
              <a
                href={`https://scan.botchain.ai/address/${INVOICE_MINT_ADDRESS}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1"
              >
                <span>Verified Contract</span>
                <ExternalLink className="h-3 w-3 text-purple-400" />
              </a>
            </div>
          </div>

          <div className="pt-2 border-t border-zinc-850/60 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-zinc-500">
            <span>Decentralized Web3 Invoicing Application on BOT Chain (Chain ID: 677).</span>
            <span>All records are stored immutably on the public ledger.</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <CreateInvoiceModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={handleRefresh}
      />

      <InvoiceDetailModal
        invoice={selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
      />
    </div>
  );
}
