import deploymentData from "./deployment.json";

export const INVOICE_MINT_ADDRESS = (
  process.env.NEXT_PUBLIC_INVOICEMINT_ADDRESS ||
  (deploymentData as { address?: string })?.address ||
  "0x1648E054CAF65ee30304649e253E68D9648Addd6"
) as `0x${string}`;

export const INVOICE_MINT_ABI = [
  {
    type: "function",
    name: "createInvoice",
    stateMutability: "nonpayable",
    inputs: [
      { name: "customerName", type: "string" },
      { name: "description", type: "string" },
      { name: "amount", type: "uint256" },
      { name: "dueDate", type: "uint256" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "markAsPaid",
    stateMutability: "nonpayable",
    inputs: [{ name: "invoiceId", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "cancelInvoice",
    stateMutability: "nonpayable",
    inputs: [{ name: "invoiceId", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "getInvoice",
    stateMutability: "view",
    inputs: [{ name: "invoiceId", type: "uint256" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "id", type: "uint256" },
          { name: "customerName", type: "string" },
          { name: "description", type: "string" },
          { name: "amount", type: "uint256" },
          { name: "dueDate", type: "uint256" },
          { name: "issuer", type: "address" },
          { name: "createdAt", type: "uint256" },
          { name: "status", type: "uint8" },
          { name: "isActive", type: "bool" },
        ],
      },
    ],
  },
  {
    type: "function",
    name: "getMyInvoices",
    stateMutability: "view",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        components: [
          { name: "id", type: "uint256" },
          { name: "customerName", type: "string" },
          { name: "description", type: "string" },
          { name: "amount", type: "uint256" },
          { name: "dueDate", type: "uint256" },
          { name: "issuer", type: "address" },
          { name: "createdAt", type: "uint256" },
          { name: "status", type: "uint8" },
          { name: "isActive", type: "bool" },
        ],
      },
    ],
  },
  {
    type: "function",
    name: "getInvoiceCount",
    stateMutability: "view",
    inputs: [{ name: "issuer", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "event",
    name: "InvoiceCreated",
    inputs: [
      { indexed: true, name: "invoiceId", type: "uint256" },
      { indexed: true, name: "issuer", type: "address" },
      { indexed: false, name: "customerName", type: "string" },
      { indexed: false, name: "amount", type: "uint256" },
      { indexed: false, name: "dueDate", type: "uint256" },
      { indexed: false, name: "createdAt", type: "uint256" },
    ],
  },
  {
    type: "event",
    name: "InvoicePaid",
    inputs: [
      { indexed: true, name: "invoiceId", type: "uint256" },
      { indexed: true, name: "issuer", type: "address" },
      { indexed: false, name: "paidAt", type: "uint256" },
    ],
  },
  {
    type: "event",
    name: "InvoiceCancelled",
    inputs: [
      { indexed: true, name: "invoiceId", type: "uint256" },
      { indexed: true, name: "issuer", type: "address" },
      { indexed: false, name: "cancelledAt", type: "uint256" },
    ],
  },
] as const;

