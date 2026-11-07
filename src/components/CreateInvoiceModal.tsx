"use client";

import React, { useState } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { INVOICE_MINT_ADDRESS, INVOICE_MINT_ABI } from "@/config/contract";
import { parseCryptoAmount } from "@/lib/utils";
import { X, Plus, AlertCircle, Loader2, Sparkles, CheckCircle2, ShieldAlert } from "lucide-react";

interface CreateInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateInvoiceModal({ isOpen, onClose, onSuccess }: CreateInvoiceModalProps) {
  const [customerName, setCustomerName] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDateStr, setDueDateStr] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const { data: hash, writeContract, isPending, error: writeError, reset } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  // Calculate default min due date (tomorrow)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDateStr = tomorrow.toISOString().split("T")[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!customerName.trim()) {
      setFormError("Please enter a customer or business name.");
      return;
    }
    if (!description.trim()) {
      setFormError("Please enter a description for the service or product.");
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      setFormError("Invoice amount must be greater than 0.");
      return;
    }
    if (!dueDateStr) {
      setFormError("Please select a due date.");
      return;
    }

    const selectedDueDate = new Date(dueDateStr);
    // Set to end of the chosen day in local time
    selectedDueDate.setHours(23, 59, 59, 999);
    const dueDateTimestamp = Math.floor(selectedDueDate.getTime() / 1000);

    const currentTimestamp = Math.floor(Date.now() / 1000);
    if (dueDateTimestamp <= currentTimestamp) {
      setFormError("Due date must be in the future.");
      return;
    }

    try {
      const parsedAmount = parseCryptoAmount(amount);

      writeContract({
        address: INVOICE_MINT_ADDRESS,
        abi: INVOICE_MINT_ABI,
        functionName: "createInvoice",
        args: [customerName.trim(), description.trim(), parsedAmount, BigInt(dueDateTimestamp)],
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to format invoice amount";
      setFormError(message);
    }
  };

  const handleClose = () => {
    if (isPending || isConfirming) return;
    setCustomerName("");
    setDescription("");
    setAmount("");
    setDueDateStr("");
    setFormError(null);
    reset();
    onClose();
  };

  React.useEffect(() => {
    if (isConfirmed) {
      const timer = setTimeout(() => {
        onSuccess();
        handleClose();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isConfirmed, onSuccess]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 no-print">
      <div className="relative w-full max-w-lg rounded-2xl border border-zinc-800 bg-[#121419] p-6 shadow-2xl shadow-black/80">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-950/80 border border-purple-800/60 text-purple-400">
              <Plus className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-zinc-100">Create New Invoice</h3>
              <p className="text-xs text-zinc-400">Record an immutable invoice on Botchain</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isPending || isConfirming}
            className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        {isConfirmed ? (
          <div className="py-10 text-center flex flex-col items-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-950 border border-emerald-700/60 text-emerald-400 mb-4 animate-bounce">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h4 className="text-lg font-bold text-zinc-100">Invoice Minted On-Chain!</h4>
            <p className="text-xs text-zinc-400 mt-1">
              Your invoice record has been permanently written to Botchain Mainnet.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            {/* Privacy Disclaimer Banner */}
            <div className="flex items-start gap-2 rounded-xl bg-purple-950/30 border border-purple-900/40 p-3 text-xs text-purple-200/80">
              <ShieldAlert className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />
              <span>
                On-chain data is public. Use customer business names or aliases only. Do not enter personal emails, phone numbers, or physical addresses.
              </span>
            </div>

            {/* Customer Name */}
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Customer Name / Business Label *
              </label>
              <input
                type="text"
                placeholder="e.g. Acme Studio or Web3 Labs"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                disabled={isPending || isConfirming}
                maxLength={80}
                required
                className="w-full rounded-xl border border-zinc-800 bg-[#16181f] px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50 transition-all disabled:opacity-60"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Service or Product Description *
              </label>
              <textarea
                placeholder="e.g. Smart contract audit and frontend integration"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isPending || isConfirming}
                rows={3}
                maxLength={300}
                required
                className="w-full rounded-xl border border-zinc-800 bg-[#16181f] px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50 transition-all disabled:opacity-60 resize-none"
              />
            </div>

            {/* Amount & Due Date Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Amount (BOT) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="any"
                    min="0.000001"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    disabled={isPending || isConfirming}
                    required
                    className="w-full rounded-xl border border-zinc-800 bg-[#16181f] px-3.5 py-2.5 pr-12 text-sm text-zinc-100 font-mono placeholder-zinc-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50 transition-all disabled:opacity-60"
                  />
                  <span className="absolute right-3.5 top-2.5 text-xs font-mono text-zinc-400">
                    BOT
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Due Date *
                </label>
                <input
                  type="date"
                  min={minDateStr}
                  value={dueDateStr}
                  onChange={(e) => setDueDateStr(e.target.value)}
                  disabled={isPending || isConfirming}
                  required
                  className="w-full rounded-xl border border-zinc-800 bg-[#16181f] px-3.5 py-2.5 text-sm text-zinc-100 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50 transition-all disabled:opacity-60 [color-scheme:dark]"
                />
              </div>
            </div>

            {/* Error Display */}
            {(formError || writeError) && (
              <div className="flex items-start gap-2 rounded-xl bg-rose-950/40 border border-rose-800/60 p-3 text-xs text-rose-300">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
                <span className="break-words">
                  {formError || writeError?.message?.slice(0, 160) || "Transaction failed."}
                </span>
              </div>
            )}

            {/* Actions */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleClose}
                disabled={isPending || isConfirming}
                className="rounded-xl border border-zinc-800 px-4 py-2.5 text-xs font-medium text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isPending || isConfirming}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-700 via-purple-600 to-emerald-600 px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-purple-950/40 hover:opacity-95 transition-all active:scale-[0.98] disabled:opacity-60"
              >
                {isPending || isConfirming ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>{isPending ? "Confirm in MetaMask..." : "Minting on Botchain..."}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Create Invoice</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

