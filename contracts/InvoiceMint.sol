// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title InvoiceMint
 * @dev Lightweight decentralized invoicing contract for freelancers, developers, and businesses.
 * Tagline: Create invoices. Keep every record.
 */
contract InvoiceMint {
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

    uint256 private _nextInvoiceId;

    // Mapping from invoice ID to Invoice
    mapping(uint256 => Invoice) private _invoices;

    // Mapping from issuer address to their invoice IDs
    mapping(address => uint256[]) private _issuerInvoiceIds;

    // Events
    event InvoiceCreated(
        uint256 indexed invoiceId,
        address indexed issuer,
        string customerName,
        uint256 amount,
        uint256 dueDate,
        uint256 createdAt
    );

    event InvoicePaid(
        uint256 indexed invoiceId,
        address indexed issuer,
        uint256 paidAt
    );

    event InvoiceCancelled(
        uint256 indexed invoiceId,
        address indexed issuer,
        uint256 cancelledAt
    );

    // Custom Errors
    error InvalidAmount();
    error EmptyCustomerName();
    error EmptyDescription();
    error DueDateInPast();
    error InvoiceNotFound();
    error NotInvoiceIssuer();
    error InvoiceNotUnpaid();
    error InvoiceAlreadyCancelled();

    modifier onlyIssuer(uint256 invoiceId) {
        if (_invoices[invoiceId].issuer == address(0)) {
            revert InvoiceNotFound();
        }
        if (_invoices[invoiceId].issuer != msg.sender) {
            revert NotInvoiceIssuer();
        }
        _;
    }

    /**
     * @notice Create a new on-chain invoice.
     * @param customerName Customer name or business label
     * @param description Product or service description
     * @param amount Invoice amount (in smallest unit / wei)
     * @param dueDate Due date timestamp (must be in the future)
     * @return invoiceId The generated unique invoice ID
     */
    function createInvoice(
        string calldata customerName,
        string calldata description,
        uint256 amount,
        uint256 dueDate
    ) external returns (uint256) {
        if (amount == 0) revert InvalidAmount();
        if (bytes(customerName).length == 0) revert EmptyCustomerName();
        if (bytes(description).length == 0) revert EmptyDescription();
        if (dueDate <= block.timestamp) revert DueDateInPast();

        _nextInvoiceId++;
        uint256 invoiceId = _nextInvoiceId;

        _invoices[invoiceId] = Invoice({
            id: invoiceId,
            customerName: customerName,
            description: description,
            amount: amount,
            dueDate: dueDate,
            issuer: msg.sender,
            createdAt: block.timestamp,
            status: InvoiceStatus.Unpaid,
            isActive: true
        });

        _issuerInvoiceIds[msg.sender].push(invoiceId);

        emit InvoiceCreated(
            invoiceId,
            msg.sender,
            customerName,
            amount,
            dueDate,
            block.timestamp
        );

        return invoiceId;
    }

    /**
     * @notice Mark an unpaid invoice as paid. Does not transfer funds.
     * @param invoiceId ID of the invoice to mark as paid
     */
    function markAsPaid(uint256 invoiceId) external onlyIssuer(invoiceId) {
        Invoice storage invoice = _invoices[invoiceId];

        if (invoice.status == InvoiceStatus.Cancelled) {
            revert InvoiceAlreadyCancelled();
        }
        if (invoice.status != InvoiceStatus.Unpaid) {
            revert InvoiceNotUnpaid();
        }

        invoice.status = InvoiceStatus.Paid;

        emit InvoicePaid(invoiceId, msg.sender, block.timestamp);
    }

    /**
     * @notice Cancel an unpaid invoice.
     * @param invoiceId ID of the invoice to cancel
     */
    function cancelInvoice(uint256 invoiceId) external onlyIssuer(invoiceId) {
        Invoice storage invoice = _invoices[invoiceId];

        if (invoice.status != InvoiceStatus.Unpaid) {
            revert InvoiceNotUnpaid();
        }

        invoice.status = InvoiceStatus.Cancelled;
        invoice.isActive = false;

        emit InvoiceCancelled(invoiceId, msg.sender, block.timestamp);
    }

    /**
     * @notice Retrieve an individual invoice by ID.
     * @param invoiceId The ID of the invoice
     */
    function getInvoice(uint256 invoiceId) external view returns (Invoice memory) {
        Invoice memory invoice = _invoices[invoiceId];
        if (invoice.issuer == address(0)) {
            revert InvoiceNotFound();
        }
        return invoice;
    }

    /**
     * @notice Retrieve all invoices issued by the caller.
     */
    function getMyInvoices() external view returns (Invoice[] memory) {
        uint256[] storage ids = _issuerInvoiceIds[msg.sender];
        uint256 count = ids.length;
        Invoice[] memory myInvoices = new Invoice[](count);

        for (uint256 i = 0; i < count; i++) {
            myInvoices[i] = _invoices[ids[i]];
        }

        return myInvoices;
    }

    /**
     * @notice Return the number of invoices issued by a specific wallet.
     * @param issuer Wallet address of the issuer
     */
    function getInvoiceCount(address issuer) external view returns (uint256) {
        return _issuerInvoiceIds[issuer].length;
    }
}

