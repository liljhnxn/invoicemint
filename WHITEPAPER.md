# InvoiceMint Whitepaper

**Decentralized Invoicing & Immutable Settlement Accounting on Botchain**  
*Tagline: Create invoices. Keep every record.*  
*Version: 2.0.0 — November 2026 (Botchain Mainnet)*  

---

## 1. Executive Summary

Freelancers, independent software engineers, DAOs, and digital agencies operating in the global digital economy increasingly demand verifiable, tamper-resistant financial records. Traditional Web2 invoicing software (e.g., QuickBooks, FreshBooks, Stripe Invoicing) relies on centralized databases, charges recurring subscription fees, creates vendor lock-in, and introduces single points of data failure.

**InvoiceMint** is a decentralized, serverless Web3 invoicing application deployed natively on **Botchain Mainnet (Chain ID 677)**. InvoiceMint allows any wallet address to mint verifiable invoice records directly onto the blockchain, maintain immutable lifecycle tracking (Unpaid, Paid, Cancelled), and export print-ready PDF invoices without relying on centralized databases, third-party user accounts, or financial intermediaries.

---

## 2. Problem Statement

1. **Centralized Data Silos & Vendor Lock-In:**  
   Centralized invoicing tools hold transaction records behind paywalled accounts. If an account is suspended or a SaaS provider discontinues service, billing history is compromised.
2. **Subscription Fatigue for Freelancers & SMBs:**  
   Small teams and gig-economy workers must pay \$15–\$50/month simply to generate invoices, regardless of billing volume.
3. **Disputes and Lack of Shared Truth:**  
   Traditional PDF or email invoices can easily be forged or altered. Without an immutable timestamped ledger, resolving invoice issuance dates and agreed settlement terms can lead to client friction.
4. **Privacy Leaks on Public Blockchains:**  
   Many early Web3 billing attempts required full customer personally identifiable information (PII)—exposing personal phone numbers, physical addresses, and banking routes on public chains.

---

## 3. The InvoiceMint Solution

InvoiceMint bridges professional business invoicing with decentralized ledger integrity:

- **100% On-Chain Records:** Every invoice identifier, customer label, item description, amount, due date, and status change is minted to Botchain via smart contracts.
- **Serverless & Non-Custodial:** There are no backend databases, user credentials, or API keys. The frontend communicates directly with the Botchain RPC via `wagmi` and `viem`.
- **Status-Driven Accounting (No Token Rent-Seeking):** The protocol separates recordkeeping from fund transfers. Marking an invoice "Paid" represents an immutable cryptographic acknowledgement by the issuer without enforcing protocol fees or token taxes.
- **Privacy-Preserving Metadata:** Uses customer aliases or business names rather than personal data, eliminating PII exposure on the public ledger.
- **Instant Client-Ready Exports:** Browser-native print stylesheet renders high-contrast, clean PDF invoices for off-chain accounting and tax filing.

---

## 4. Technical Architecture

### 4.1 System Topology

```
┌────────────────────────────────────────────────────────┐
│                   User Interface                       │
│    Next.js 14 (App Router) + Tailwind CSS + wagmi      │
└───────────────────────────┬────────────────────────────┘
                            │ (JSON-RPC over HTTPS)
                            ▼
┌────────────────────────────────────────────────────────┐
│               Botchain Mainnet (Chain ID 677)          │
│           RPC Endpoint: https://rpc.botchain.ai        │
│                                                        │
│   ┌────────────────────────────────────────────────┐   │
│   │           InvoiceMint Smart Contract           │   │
│   │   0x1648E054CAF65ee30304649e253E68D9648Addd6  │   │
│   │                                                │   │
│   │  • createInvoice()      • markAsPaid()         │   │
│   │  • cancelInvoice()      • getMyInvoices()      │   │
│   │  • getInvoice()         • getInvoiceCount()    │   │
│   └────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────┘
```

### 4.2 Smart Contract Architecture (`InvoiceMint.sol`)

The `InvoiceMint` smart contract is written in Solidity `^0.8.20` with optimizer enabled (200 runs).

#### Data Model
```solidity
enum InvoiceStatus {
    Unpaid,
    Paid,
    Cancelled
}

struct Invoice {
    uint256 id;
    string customerName;
    string description;
    uint256 amount;
    uint256 dueDate;
    address issuer;
    uint256 createdAt;
    InvoiceStatus status;
    bool isActive;
}
```

#### State Machine & Security Invariants
- **Access Control:** Only the `issuer` address that minted the invoice can execute `markAsPaid` or `cancelInvoice`.
- **Lifecycle Integrity:**
  - Invoices are created in `Unpaid` status.
  - Only `Unpaid` invoices can transition to `Paid` or `Cancelled`.
  - Cancelled invoices cannot be marked as paid.
  - Paid invoices cannot be cancelled.
- **Input Validation:**
  - Amount must be strictly greater than zero (`amount > 0`).
  - Text fields cannot be empty strings.
  - Due date must be strictly in the future (`dueDate > block.timestamp`).
- **Gas Efficiency:** Leverages indexed events (`InvoiceCreated`, `InvoicePaid`, `InvoiceCancelled`) for efficient indexing and off-chain caching without redundant contract storage.

---

## 5. Mainnet Deployment & Verification

- **Network:** Botchain Mainnet
- **Chain ID:** `677`
- **Native Currency:** `BOT` (18 decimals, 150M total supply)
- **RPC URL:** `https://rpc.botchain.ai`
- **Contract Address:** [`0x1648E054CAF65ee30304649e253E68D9648Addd6`](https://scan.botchain.ai/address/0x1648E054CAF65ee30304649e253E68D9648Addd6#code)
- **Explorer:** [BotchainScan Verified Contract](https://scan.botchain.ai/address/0x1648E054CAF65ee30304649e253E68D9648Addd6#code)
- **Compiler:** Solidity `v0.8.20`
- **Deployment Gas Cost:** 0.0182 BOT

---

## 6. Tokenomics & Business Model

InvoiceMint operates as a **public-good utility dApp**:
- **Zero Platform Fees:** Users only pay standard Botchain network gas fees (fractions of a cent in BOT).
- **No Token Gate:** Anyone with a Web3 wallet can immediately issue invoices.
- **Future Commercial Layer (Optional):** Future enterprise features (multi-currency escrow, automated split payments, recurring invoice streams) can be added as modular add-ons without restricting core invoicing access.

---

## 7. Roadmap

### Phase 1: Core Deployment & Mainnet Launch (Completed ✅)
- [x] Solidity smart contract deployed and verified on Botchain Mainnet (Chain ID 677).
- [x] Responsive Next.js 14 frontend with dark charcoal UI.
- [x] MetaMask wallet integration via wagmi v2.
- [x] Real-time dashboard statistics and status filtering.
- [x] Print-to-PDF invoice export view.

### Phase 2: Ecosystem Integration (In Progress)
- [x] Verified on BotchainScan.
- [ ] IPFS/Arweave backup for extended attachments.
- [ ] Shareable public invoice view link (client read-only page).

### Phase 3: Advanced Settlement
- [ ] Optional direct crypto payment integration (settle invoice on-chain with automatic receipt).
- [ ] Multi-token invoicing support (USDT, USDC, BOT).
- [ ] CSV / Accounting software export (Xero / QuickBooks compatible).

---

## 8. Conclusion

InvoiceMint demonstrates how blockchain infrastructure can solve foundational real-world business problems simply and efficiently. By leveraging Botchain's fast, low-cost execution, InvoiceMint provides independent workers and businesses with permanent, self-sovereign financial recordkeeping.
