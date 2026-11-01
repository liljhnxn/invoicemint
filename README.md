# InvoiceMint

> **Tagline:** Create invoices. Keep every record.

InvoiceMint is a lightweight, decentralized Web3 invoicing application built for freelancers, independent developers, and small businesses. Users connect their MetaMask wallet, issue invoices recorded directly on-chain, track payment and settlement statuses, and export clean, printable invoice records as PDF without any third-party database or intermediary.

---

## 🌟 Key Features

- **100% On-Chain Records**: Invoices, customer business labels, descriptions, amounts, and statuses are permanently logged on the blockchain.
- **Botchain Testnet Native**: Configured out-of-the-box for Botchain Testnet (Chain ID `968`).
- **Dashboard Analytics**: Real-time overview of total invoices, settled (paid) invoices, outstanding invoices, gross invoiced volume, and pending collections.
- **Smart Status Management**: Mark invoices as paid or cancel unpaid invoices directly via smart contract transactions.
- **Filter & Search**: Instant filtering by status (*All*, *Paid*, *Unpaid*, *Cancelled*, *Overdue*) and text search.
- **Print & PDF Export**: Professional, clean print layout tailored for browser print-to-PDF (`window.print()`).
- **Privacy Conscious**: Designed specifically to record business/customer labels without storing personal emails, phone numbers, or private addresses on the public ledger.
- **Zero Centralized Backend**: No external database, user accounts, authentication servers, or tracking cookies.

---

## ⛓️ Blockchain Configuration (Botchain Testnet)

| Parameter | Value |
| :--- | :--- |
| **Network Name** | Botchain Testnet |
| **Chain ID** | `968` |
| **Currency Symbol** | `BHR` |
| **RPC URL** | `https://rpc.bohr.life` |
| **Block Explorer** | [https://scan.bohr.life](https://scan.bohr.life) |

---

## 🛠️ Tech Stack

- **Smart Contract**: Solidity (`^0.8.20`), Hardhat, Ethers.js
- **Frontend Framework**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS (dark charcoal theme, muted purple & emerald accents)
- **Web3 Connectivity**: wagmi v2, viem, @tanstack/react-query
- **Icons**: Lucide React

---

## 📄 Smart Contract Overview (`InvoiceMint.sol`)

The `InvoiceMint` contract handles the complete invoice lifecycle:

### Core Functions

- `createInvoice(string customerName, string description, uint256 amount, uint256 dueDate)`: Creates and records a new invoice. Returns the unique `invoiceId`.
- `markAsPaid(uint256 invoiceId)`: Updates an unpaid invoice status to `Paid`. *(Note: Does not transfer funds; represents on-chain settlement record).*
- `cancelInvoice(uint256 invoiceId)`: Cancels an unpaid invoice and marks it inactive.
- `getMyInvoices()`: Returns all invoices issued by the caller address.
- `getInvoice(uint256 invoiceId)`: Retrieves full details of a specific invoice.
- `getInvoiceCount(address issuer)`: Returns total invoices issued by a given address.

### Security & Validations

- Only the invoice issuer can mark an invoice as paid or cancel it.
- Reverts if invoice amount is zero.
- Reverts if customer name or description is empty.
- Reverts if due date is not in the future.
- Cancelled invoices cannot be marked as paid.
- Paid or cancelled invoices cannot be cancelled again.
- Emits `InvoiceCreated`, `InvoicePaid`, and `InvoiceCancelled` events.

---

## 🚀 Getting Started

### 1. Prerequisites

- [Node.js](https://nodejs.org/) (v18+ or v20+)
- [MetaMask](https://metamask.io/) browser extension

### 2. Installation

Clone or open the repository, then install dependencies:

```bash
npm install
```

### 3. Environment Variables

Create a `.env.local` file in the root directory (refer to `.env.example`):

```bash
# Botchain Testnet Details
NEXT_PUBLIC_CHAIN_ID=968
NEXT_PUBLIC_RPC_URL=https://rpc.bohr.life
NEXT_PUBLIC_EXPLORER_URL=https://scan.bohr.life

# Deployed Contract Address
NEXT_PUBLIC_INVOICEMINT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3

# Optional: Deployer private key for Botchain deployment
PRIVATE_KEY=
```

### 4. Run Smart Contract Tests

Verify contract functionality with automated Hardhat tests:

```bash
npm test
```

### 5. Deploy the Smart Contract

To deploy locally:
```bash
npm run deploy:local
```

To deploy to Botchain Testnet:
1. Ensure your `PRIVATE_KEY` has testnet BHR.
2. Run:
```bash
npm run deploy:botchain
```
The script will output the deployed contract address and automatically save it to `src/config/deployment.json`.

### 6. Run the Next.js Frontend

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

### 7. Production Build

To verify and create an optimized production build:

```bash
npm run build
```

---

## 🔒 Privacy & Public Ledger Notice

All data submitted to the `InvoiceMint` smart contract is stored publicly on the blockchain. 

- **Do not** submit sensitive customer information such as residential addresses, personal phone numbers, emails, or bank account details.
- **Do** use customer company names, business aliases, or client identifiers.

---

## 📜 License

MIT License. Designed and crafted with precision for decentralized billing.

