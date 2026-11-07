import { formatEther, parseEther } from "viem";
import { Invoice, InvoiceStatus } from "@/types/invoice";

/**
 * Format wallet address to shortened form (e.g. 0x1234...abcd)
 */
export function formatAddress(address?: string): string {
  if (!address) return "";
  if (address.length <= 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Format wei amount to formatted BOT string
 */
export function formatCryptoAmount(amount?: bigint, decimals = 4): string {
  if (amount === undefined || amount === null) return "0.00";
  try {
    const etherStr = formatEther(amount);
    const num = parseFloat(etherStr);
    if (isNaN(num)) return "0.00";
    if (num === 0) return "0.00";
    if (num < 0.0001) return "< 0.0001";
    return num.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: decimals,
    });
  } catch {
    return "0.00";
  }
}

/**
 * Safely parse user input decimal string to Wei bigint
 */
export function parseCryptoAmount(value: string): bigint {
  const cleanValue = value.trim();
  if (!cleanValue || isNaN(Number(cleanValue)) || Number(cleanValue) <= 0) {
    throw new Error("Please enter a valid positive amount");
  }
  return parseEther(cleanValue);
}

/**
 * Format timestamp (seconds) into human-readable date
 */
export function formatDate(timestamp?: bigint | number): string {
  if (!timestamp) return "-";
  const num = typeof timestamp === "bigint" ? Number(timestamp) : timestamp;
  const date = new Date(num * 1000);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Format timestamp (seconds) into human-readable date & time
 */
export function formatDateTime(timestamp?: bigint | number): string {
  if (!timestamp) return "-";
  const num = typeof timestamp === "bigint" ? Number(timestamp) : timestamp;
  const date = new Date(num * 1000);
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Check if invoice is overdue (Unpaid and due date < current time)
 */
export function isInvoiceOverdue(invoice: Invoice): boolean {
  if (invoice.status !== InvoiceStatus.Unpaid) return false;
  const now = Math.floor(Date.now() / 1000);
  return Number(invoice.dueDate) < now;
}

/**
 * Compute invoice status display details
 */
export function getInvoiceStatusDisplay(invoice: Invoice): {
  label: string;
  badgeClass: string;
  color: string;
} {
  if (invoice.status === InvoiceStatus.Paid) {
    return {
      label: "Paid",
      badgeClass: "bg-emerald-950/70 text-emerald-400 border border-emerald-800/60",
      color: "#10b981",
    };
  }

  if (invoice.status === InvoiceStatus.Cancelled) {
    return {
      label: "Cancelled",
      badgeClass: "bg-zinc-800/80 text-zinc-400 border border-zinc-700/60",
      color: "#71717a",
    };
  }

  // Unpaid - check if overdue
  if (isInvoiceOverdue(invoice)) {
    return {
      label: "Overdue",
      badgeClass: "bg-amber-950/70 text-amber-400 border border-amber-800/60",
      color: "#f59e0b",
    };
  }

  return {
    label: "Unpaid",
    badgeClass: "bg-purple-950/70 text-purple-300 border border-purple-800/60",
    color: "#a855f7",
  };
}

