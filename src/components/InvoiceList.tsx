"use client";

import React, { useState } from "react";
import { Invoice, InvoiceFilterType, InvoiceStatus } from "@/types/invoice";
import {
  formatCryptoAmount,
  formatDate,
  getInvoiceStatusDisplay,
  isInvoiceOverdue,
} from "@/lib/utils";
import {
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { INVOICE_MINT_ADDRESS, INVOICE_MINT_ABI } from "@/config/contract";
import {
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  FileQuestion,
  Loader2,
  Calendar,
  AlertCircle,
} from "lucide-react";

interface InvoiceListProps {
  invoices: Invoice[];
  isLoading: boolean;
  onRefresh: () => void;
  onViewInvoice: (invoice: Invoice) => void;
}

export function InvoiceList({
  invoices,
  isLoading,
  onRefresh,
  onViewInvoice,
}: InvoiceListProps) {
  const [activeFilter, setActiveFilter] = useState<InvoiceFilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeActionId, setActiveActionId] = useState<bigint | null>(null);
  const [actionType, setActionType] = useState<"paid" | "cancel" | null>(null);

  const { data: hash, writeContract, isPending: isWritePending, error: writeError, reset } =
    useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash });

  React.useEffect(() => {
    if (isConfirmed) {
      onRefresh();
      setActiveActionId(null);
      setActionType(null);
      reset();
    }
  }, [isConfirmed, onRefresh, reset]);

  const handleMarkAsPaid = (invoiceId: bigint) => {
    setActiveActionId(invoiceId);
    setActionType("paid");
    writeContract({
      address: INVOICE_MINT_ADDRESS,
      abi: INVOICE_MINT_ABI,
      functionName: "markAsPaid",
      args: [invoiceId],
    });
  };

  const handleCancel = (invoiceId: bigint) => {
    if (
      !window.confirm(
        `Are you sure you want to cancel invoice #${invoiceId}? This action cannot be undone.`
      )
    ) {
      return;
    }
    setActiveActionId(invoiceId);
    setActionType("cancel");
    writeContract({
      address: INVOICE_MINT_ADDRESS,
      abi: INVOICE_MINT_ABI,
      functionName: "cancelInvoice",
      args: [invoiceId],
    });
  };

  // Filter & Search
  const filteredInvoices = invoices.filter((inv) => {
    // Filter by tab
    if (activeFilter === "paid" && inv.status !== InvoiceStatus.Paid) return false;
    if (activeFilter === "unpaid" && inv.status !== InvoiceStatus.Unpaid) return false;
    if (activeFilter === "cancelled" && inv.status !== InvoiceStatus.Cancelled) return false;
    if (activeFilter === "overdue" && !isInvoiceOverdue(inv)) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesCustomer = inv.customerName.toLowerCase().includes(q);
      const matchesDesc = inv.description.toLowerCase().includes(q);
      const matchesId = inv.id.toString().includes(q);
      return matchesCustomer || matchesDesc || matchesId;
    }

    return true;
  });

  const filterTabs: { id: InvoiceFilterType; label: string; count?: number }[] = [
    { id: "all", label: "All Invoices", count: invoices.length },
    {
      id: "unpaid",
      label: "Unpaid",
      count: invoices.filter((i) => i.status === InvoiceStatus.Unpaid).length,
    },
    {
      id: "paid",
      label: "Paid",
      count: invoices.filter((i) => i.status === InvoiceStatus.Paid).length,
    },
    {
      id: "overdue",
      label: "Overdue",
      count: invoices.filter((i) => isInvoiceOverdue(i)).length,
    },
    {
      id: "cancelled",
      label: "Cancelled",
      count: invoices.filter((i) => i.status === InvoiceStatus.Cancelled).length,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Search & Tabs Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-[#14161b] border border-zinc-800/80">
          {filterTabs.map((tab) => {
            const isActive = activeFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? "bg-purple-950/80 text-purple-300 border border-purple-800/60 shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${
                      isActive ? "bg-purple-900/60 text-purple-200" : "bg-zinc-800 text-zinc-400"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-500" />
          <input
            type="text"
            placeholder="Search customer, ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-zinc-800 bg-[#14161b] pl-9 pr-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50 transition-all"
          />
        </div>
      </div>

      {/* Write Error Banner */}
      {writeError && (
        <div className="flex items-center gap-2 rounded-xl bg-rose-950/40 border border-rose-800/60 p-3 text-xs text-rose-300">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
          <span>{writeError.message.slice(0, 180)}</span>
        </div>
      )}

      {/* Invoice Table / Cards */}
      <div className="rounded-2xl border border-zinc-800/80 bg-[#121419] overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="py-20 text-center flex flex-col items-center justify-center">
            <Loader2 className="h-7 w-7 text-purple-500 animate-spin mb-3" />
            <p className="text-sm font-medium text-zinc-300">Loading on-chain records...</p>
            <p className="text-xs text-zinc-500 mt-1">Connecting to Botchain Testnet</p>
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="py-16 text-center flex flex-col items-center justify-center px-4">
            <div className="h-12 w-12 rounded-2xl bg-zinc-850 border border-zinc-800 flex items-center justify-center text-zinc-500 mb-3">
              <FileQuestion className="h-6 w-6" />
            </div>
            <h4 className="text-sm font-semibold text-zinc-200">No invoices found</h4>
            <p className="text-xs text-zinc-400 max-w-sm mt-1">
              {searchQuery
                ? `No invoices match "${searchQuery}". Try adjusting your search query.`
                : activeFilter !== "all"
                ? `You have no ${activeFilter} invoices recorded right now.`
                : "You haven't minted any invoices yet. Click 'Create Invoice' to record your first on-chain invoice."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#161820] text-zinc-400 uppercase tracking-wider font-medium text-[11px] border-b border-zinc-800/80">
                <tr>
                  <th className="py-3.5 px-4 font-medium">Invoice ID</th>
                  <th className="py-3.5 px-4 font-medium">Customer</th>
                  <th className="py-3.5 px-4 font-medium">Description</th>
                  <th className="py-3.5 px-4 font-medium">Amount</th>
                  <th className="py-3.5 px-4 font-medium">Created / Due</th>
                  <th className="py-3.5 px-4 font-medium">Status</th>
                  <th className="py-3.5 px-4 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {filteredInvoices.map((inv) => {
                  const statusDisplay = getInvoiceStatusDisplay(inv);
                  const isActionLoading =
                    (isWritePending || isConfirming) && activeActionId === inv.id;
                  const isUnpaid = inv.status === InvoiceStatus.Unpaid;

                  return (
                    <tr
                      key={inv.id.toString()}
                      className="hover:bg-zinc-850/40 transition-colors group"
                    >
                      {/* ID */}
                      <td className="py-4 px-4 font-mono font-medium text-purple-300">
                        #{inv.id.toString().padStart(4, "0")}
                      </td>

                      {/* Customer */}
                      <td className="py-4 px-4 font-medium text-zinc-100">
                        {inv.customerName}
                      </td>

                      {/* Description */}
                      <td className="py-4 px-4 text-zinc-400 max-w-[220px] truncate">
                        {inv.description}
                      </td>

                      {/* Amount */}
                      <td className="py-4 px-4 font-mono font-semibold text-emerald-400 whitespace-nowrap">
                        {formatCryptoAmount(inv.amount)} BHR
                      </td>

                      {/* Dates */}
                      <td className="py-4 px-4 text-zinc-400 whitespace-nowrap">
                        <div className="text-zinc-300">{formatDate(inv.createdAt)}</div>
                        <div className="text-[11px] text-zinc-400 flex items-center gap-1 mt-0.5">
                          <Clock className="h-3 w-3 text-zinc-400" />
                          <span>Due: {formatDate(inv.dueDate)}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${statusDisplay.badgeClass}`}
                        >
                          {statusDisplay.label}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View details */}
                          <button
                            onClick={() => onViewInvoice(inv)}
                            title="View Invoice Details"
                            className="flex items-center gap-1 rounded-lg border border-zinc-750 bg-zinc-800/80 px-2.5 py-1 text-xs text-zinc-300 hover:bg-zinc-700 hover:text-white transition-all shadow-sm"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span>View</span>
                          </button>

                          {/* Mark as paid */}
                          {isUnpaid && (
                            <button
                              onClick={() => handleMarkAsPaid(inv.id)}
                              disabled={isWritePending || isConfirming}
                              title="Mark as Paid"
                              className="flex items-center gap-1 rounded-lg border border-emerald-800/60 bg-emerald-950/60 px-2.5 py-1 text-xs font-medium text-emerald-300 hover:bg-emerald-900/70 hover:text-emerald-200 transition-all shadow-sm disabled:opacity-50"
                            >
                              {isActionLoading && actionType === "paid" ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                              )}
                              <span>Mark Paid</span>
                            </button>
                          )}

                          {/* Cancel invoice */}
                          {isUnpaid && (
                            <button
                              onClick={() => handleCancel(inv.id)}
                              disabled={isWritePending || isConfirming}
                              title="Cancel Invoice"
                              className="flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900/60 px-2.5 py-1 text-xs font-medium text-zinc-400 hover:bg-rose-950/40 hover:text-rose-300 hover:border-rose-900/50 transition-all shadow-sm disabled:opacity-50"
                            >
                              {isActionLoading && actionType === "cancel" ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin text-rose-400" />
                              ) : (
                                <XCircle className="h-3.5 w-3.5 text-zinc-400" />
                              )}
                              <span>Cancel</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

