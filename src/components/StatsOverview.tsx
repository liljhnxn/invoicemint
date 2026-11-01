"use client";

import React from "react";
import { Invoice, InvoiceStatus } from "@/types/invoice";
import { formatCryptoAmount } from "@/lib/utils";
import { FileText, CheckCircle2, Clock, Coins, AlertCircle } from "lucide-react";

interface StatsOverviewProps {
  invoices: Invoice[];
  isLoading?: boolean;
}

export function StatsOverview({ invoices, isLoading }: StatsOverviewProps) {
  const totalCount = invoices.length;
  const paidInvoices = invoices.filter((i) => i.status === InvoiceStatus.Paid);
  const unpaidInvoices = invoices.filter((i) => i.status === InvoiceStatus.Unpaid);

  const totalInvoicedAmount = invoices.reduce((acc, curr) => acc + curr.amount, 0n);
  const outstandingAmount = unpaidInvoices.reduce((acc, curr) => acc + curr.amount, 0n);

  const stats = [
    {
      label: "Total Invoices",
      value: isLoading ? "..." : totalCount.toString(),
      subtext: "Recorded on-chain",
      icon: FileText,
      iconColor: "text-zinc-400",
      iconBg: "bg-zinc-800/60 border-zinc-700/50",
    },
    {
      label: "Paid Invoices",
      value: isLoading ? "..." : paidInvoices.length.toString(),
      subtext: `${totalCount > 0 ? Math.round((paidInvoices.length / totalCount) * 100) : 0}% settlement`,
      icon: CheckCircle2,
      iconColor: "text-emerald-400",
      iconBg: "bg-emerald-950/50 border-emerald-800/50",
    },
    {
      label: "Unpaid Invoices",
      value: isLoading ? "..." : unpaidInvoices.length.toString(),
      subtext: "Awaiting settlement",
      icon: Clock,
      iconColor: "text-purple-400",
      iconBg: "bg-purple-950/50 border-purple-800/50",
    },
    {
      label: "Total Invoiced",
      value: isLoading ? "..." : `${formatCryptoAmount(totalInvoicedAmount)} BHR`,
      subtext: "Gross invoice volume",
      icon: Coins,
      iconColor: "text-emerald-400",
      iconBg: "bg-emerald-950/40 border-emerald-800/50",
    },
    {
      label: "Outstanding Amount",
      value: isLoading ? "..." : `${formatCryptoAmount(outstandingAmount)} BHR`,
      subtext: "Pending collection",
      icon: AlertCircle,
      iconColor: "text-amber-400",
      iconBg: "bg-amber-950/40 border-amber-800/50",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
      {stats.map((item, index) => {
        const Icon = item.icon;
        return (
          <div
            key={index}
            className="group relative rounded-2xl border border-zinc-800/80 bg-[#121419] p-4.5 transition-all hover:border-zinc-700 hover:bg-[#15171f] shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-400">
                {item.label}
              </span>
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-xl border ${item.iconBg}`}
              >
                <Icon className={`h-4 w-4 ${item.iconColor}`} />
              </div>
            </div>

            <div className="mt-3">
              <div className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-100 font-mono">
                {item.value}
              </div>
              <p className="mt-1 text-[11px] text-zinc-400">
                {item.subtext}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

