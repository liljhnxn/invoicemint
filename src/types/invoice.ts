export enum InvoiceStatus {
  Unpaid = 0,
  Paid = 1,
  Cancelled = 2,
}

export interface Invoice {
  id: bigint;
  customerName: string;
  description: string;
  amount: bigint;
  dueDate: bigint;
  issuer: `0x${string}`;
  createdAt: bigint;
  status: InvoiceStatus;
  isActive: boolean;
}

export type InvoiceFilterType = "all" | "paid" | "unpaid" | "cancelled" | "overdue";

