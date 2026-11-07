"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from "wagmi";
import { botchainMainnet } from "@/config/chain";
import { INVOICE_MINT_ADDRESS } from "@/config/contract";
import { formatAddress } from "@/lib/utils";
import { Wallet, LogOut, AlertTriangle, ChevronDown, Copy, Check, ExternalLink, FileCode } from "lucide-react";

export function Navbar() {
  const { address, isConnected, isConnecting } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  const [copied, setCopied] = useState(false);
  const [copiedContract, setCopiedContract] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const isWrongNetwork = isConnected && chainId !== botchainMainnet.id;

  const handleCopy = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyContract = () => {
    navigator.clipboard.writeText(INVOICE_MINT_ADDRESS);
    setCopiedContract(true);
    setTimeout(() => setCopiedContract(false), 2000);
  };

  const handleConnect = () => {
    const metaMaskConnector =
      connectors.find((c) => c.id === "injected" || c.name.toLowerCase().includes("metamask")) ||
      connectors[0];
    if (metaMaskConnector) {
      connect({ connector: metaMaskConnector });
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b border-zinc-800/80 bg-[#0d0f12]/95 backdrop-blur-md no-print">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 h-20">
        {/* Brand & Tagline */}
        <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-emerald-600 text-white shadow-md shadow-purple-950/40">
              <span className="font-bold text-lg tracking-tight">IM</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold tracking-tight text-zinc-100">
                Invoice<span className="text-purple-400">Mint</span>
              </span>
            </div>
          </div>
          <span className="text-xs font-medium text-zinc-400 hidden sm:inline-block border-l border-zinc-800 pl-3">
            Create invoices. Keep every record.
          </span>
        </div>

        {/* Navigation & Ecosystem Links */}
        <div className="flex items-center gap-2.5">
          {/* Main BOT Chain Website Link with Logo in Front */}
          <a
            href="https://botchain.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden lg:flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/70 px-3 py-1.5 text-xs font-medium text-zinc-200 hover:text-emerald-300 hover:border-emerald-800/60 hover:bg-zinc-850 transition-all shadow-sm group"
            title="Visit official BOT Chain Website"
          >
            <div className="relative h-4 w-4 rounded overflow-hidden shrink-0">
              <Image
                src="/botchain-logo.png"
                alt="BOT Chain Logo"
                width={16}
                height={16}
                className="object-contain"
              />
            </div>
            <span>BOT Chain Website</span>
            <ExternalLink className="h-3 w-3 text-zinc-500 group-hover:text-emerald-400" />
          </a>

          {/* BOT Chain Explorer Link with Logo in Front */}
          <a
            href="https://scan.botchain.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/70 px-3 py-1.5 text-xs font-medium text-zinc-200 hover:text-emerald-300 hover:border-emerald-800/60 hover:bg-zinc-850 transition-all shadow-sm group"
            title="Open BOT Chain Explorer"
          >
            <div className="relative h-4 w-4 rounded overflow-hidden shrink-0">
              <Image
                src="/botchain-logo.png"
                alt="BOT Chain Logo"
                width={16}
                height={16}
                className="object-contain"
              />
            </div>
            <span>BOT Chain Explorer</span>
            <ExternalLink className="h-3 w-3 text-zinc-500 group-hover:text-emerald-400" />
          </a>

          {/* Verified Mainnet Contract Address Pill on Interface */}
          <div className="hidden xl:flex items-center gap-1.5 rounded-xl border border-purple-900/50 bg-purple-950/30 px-2.5 py-1.5 text-xs">
            <FileCode className="h-3.5 w-3.5 text-purple-400" />
            <span className="text-zinc-400 text-[11px]">Contract:</span>
            <a
              href={`https://scan.botchain.ai/address/${INVOICE_MINT_ADDRESS}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-purple-300 hover:text-purple-200 hover:underline"
              title={`View contract ${INVOICE_MINT_ADDRESS} on BOT Chain Explorer`}
            >
              {formatAddress(INVOICE_MINT_ADDRESS)}
            </a>
            <button
              onClick={handleCopyContract}
              title="Copy Contract Address"
              className="text-zinc-400 hover:text-zinc-200 p-0.5 rounded transition-colors"
            >
              {copiedContract ? (
                <Check className="h-3 w-3 text-emerald-400" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </button>
          </div>

          {/* Network Indicator / Switcher */}
          {isConnected && (
            <>
              {isWrongNetwork ? (
                <button
                  onClick={() => switchChain({ chainId: botchainMainnet.id })}
                  className="flex items-center gap-1.5 rounded-lg border border-amber-600/50 bg-amber-950/40 px-3 py-1.5 text-xs font-medium text-amber-300 hover:bg-amber-900/50 transition-colors"
                >
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                  <span>Switch to BOT Chain</span>
                </button>
              ) : (
                <a
                  href="https://scan.botchain.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden sm:flex items-center gap-1.5 rounded-lg border border-emerald-900/40 bg-emerald-950/30 px-2.5 py-1.5 text-xs text-emerald-400 hover:bg-emerald-950/50 transition-colors"
                  title="Connected to BOT Chain (Chain ID: 677)"
                >
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>BOT Chain (677)</span>
                </a>
              )}
            </>
          )}

          {/* Wallet Button */}
          {!isConnected ? (
            <button
              onClick={handleConnect}
              disabled={isConnecting}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-700 via-purple-600 to-emerald-600 px-4 py-2.5 text-sm font-semibold text-zinc-100 hover:opacity-95 shadow-md shadow-purple-950/40 transition-all active:scale-[0.98] disabled:opacity-60"
            >
              <Wallet className="h-4 w-4" />
              <span>{isConnecting ? "Connecting..." : "Connect MetaMask"}</span>
            </button>
          ) : (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/90 px-3.5 py-2 text-sm text-zinc-200 hover:border-zinc-700 hover:bg-zinc-850 transition-all"
              >
                <div className="h-6 w-6 rounded-full bg-purple-950 border border-purple-600/40 flex items-center justify-center text-[10px] font-bold text-purple-300">
                  {address?.slice(2, 4).toUpperCase()}
                </div>
                <span className="font-mono text-xs text-zinc-300">
                  {formatAddress(address)}
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />
              </button>

              {dropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-64 rounded-xl border border-zinc-800 bg-[#14161c] p-2 shadow-xl shadow-black/60 z-50 animate-in fade-in slide-in-from-top-1 duration-150"
                  onMouseLeave={() => setDropdownOpen(false)}
                >
                  <div className="px-3 py-2 border-b border-zinc-800/80">
                    <p className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
                      Connected Wallet
                    </p>
                    <p className="text-xs font-mono text-zinc-200 mt-0.5 truncate">
                      {address}
                    </p>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={handleCopy}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-zinc-300 hover:bg-zinc-800/80 transition-colors"
                    >
                      {copied ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied Wallet</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5 text-zinc-400" />
                          <span>Copy Wallet Address</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={handleCopyContract}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-zinc-300 hover:bg-zinc-800/80 transition-colors"
                    >
                      {copiedContract ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied Contract</span>
                        </>
                      ) : (
                        <>
                          <FileCode className="h-3.5 w-3.5 text-purple-400" />
                          <span>Copy Mainnet Contract</span>
                        </>
                      )}
                    </button>

                    <a
                      href={`https://scan.botchain.ai/address/${address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-zinc-300 hover:bg-zinc-800/80 transition-colors"
                    >
                      <div className="relative h-3.5 w-3.5 rounded overflow-hidden shrink-0">
                        <Image
                          src="/botchain-logo.png"
                          alt="BOT Chain Logo"
                          width={14}
                          height={14}
                          className="object-contain"
                        />
                      </div>
                      <span>View Address on Explorer</span>
                    </a>

                    <a
                      href={`https://scan.botchain.ai/address/${INVOICE_MINT_ADDRESS}#code`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-purple-300 hover:bg-zinc-800/80 transition-colors"
                    >
                      <div className="relative h-3.5 w-3.5 rounded overflow-hidden shrink-0">
                        <Image
                          src="/botchain-logo.png"
                          alt="BOT Chain Logo"
                          width={14}
                          height={14}
                          className="object-contain"
                        />
                      </div>
                      <span>View Contract on Explorer</span>
                    </a>

                    <a
                      href="https://botchain.ai"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-zinc-300 hover:bg-zinc-800/80 transition-colors"
                    >
                      <div className="relative h-3.5 w-3.5 rounded overflow-hidden shrink-0">
                        <Image
                          src="/botchain-logo.png"
                          alt="BOT Chain Logo"
                          width={14}
                          height={14}
                          className="object-contain"
                        />
                      </div>
                      <span>BOT Chain Website</span>
                    </a>
                  </div>

                  <div className="border-t border-zinc-800/80 pt-1">
                    <button
                      onClick={() => {
                        disconnect();
                        setDropdownOpen(false);
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-rose-400 hover:bg-rose-950/30 transition-colors"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>Disconnect</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
