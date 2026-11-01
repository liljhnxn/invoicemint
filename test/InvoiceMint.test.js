const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("InvoiceMint Contract", function () {
  let invoiceMint;
  let owner, alice, bob;

  beforeEach(async function () {
    [owner, alice, bob] = await ethers.getSigners();
    const InvoiceMint = await ethers.getContractFactory("InvoiceMint");
    invoiceMint = await InvoiceMint.deploy();
    await invoiceMint.waitForDeployment();
  });

  describe("Invoice Creation", function () {
    it("should create an invoice successfully", async function () {
      const currentTime = await time.latest();
      const dueDate = currentTime + 86400; // +1 day
      const amount = ethers.parseEther("1.5");

      const tx = await invoiceMint.createInvoice(
        "Acme Corp",
        "Frontend Web3 Development",
        amount,
        dueDate
      );
      await tx.wait();

      // Check count
      expect(await invoiceMint.getInvoiceCount(owner.address)).to.equal(1);

      // Check getInvoice
      const invoice = await invoiceMint.getInvoice(1);
      expect(invoice.id).to.equal(1);
      expect(invoice.customerName).to.equal("Acme Corp");
      expect(invoice.description).to.equal("Frontend Web3 Development");
      expect(invoice.amount).to.equal(amount);
      expect(invoice.dueDate).to.equal(dueDate);
      expect(invoice.issuer).to.equal(owner.address);
      expect(invoice.status).to.equal(0); // Unpaid
      expect(invoice.isActive).to.equal(true);

      // Check event
      await expect(
        invoiceMint.createInvoice(
          "Stark Industries",
          "Smart Contract Audit",
          amount,
          dueDate
        )
      )
        .to.emit(invoiceMint, "InvoiceCreated")
        .withArgs(2, owner.address, "Stark Industries", amount, dueDate, (await time.latest()) + 1);
    });

    it("should revert if amount is zero", async function () {
      const currentTime = await time.latest();
      const dueDate = currentTime + 86400;

      await expect(
        invoiceMint.createInvoice("Acme Corp", "Design", 0, dueDate)
      ).to.be.revertedWithCustomError(invoiceMint, "InvalidAmount");
    });

    it("should revert if customer name is empty", async function () {
      const currentTime = await time.latest();
      const dueDate = currentTime + 86400;

      await expect(
        invoiceMint.createInvoice("", "Design", ethers.parseEther("1"), dueDate)
      ).to.be.revertedWithCustomError(invoiceMint, "EmptyCustomerName");
    });

    it("should revert if description is empty", async function () {
      const currentTime = await time.latest();
      const dueDate = currentTime + 86400;

      await expect(
        invoiceMint.createInvoice("Acme Corp", "", ethers.parseEther("1"), dueDate)
      ).to.be.revertedWithCustomError(invoiceMint, "EmptyDescription");
    });

    it("should revert if due date is in the past", async function () {
      const currentTime = await time.latest();
      const pastDueDate = currentTime - 100;

      await expect(
        invoiceMint.createInvoice("Acme Corp", "Design", ethers.parseEther("1"), pastDueDate)
      ).to.be.revertedWithCustomError(invoiceMint, "DueDateInPast");
    });
  });

  describe("Mark as Paid", function () {
    let invoiceId;
    let dueDate;

    beforeEach(async function () {
      const currentTime = await time.latest();
      dueDate = currentTime + 86400;
      const tx = await invoiceMint.createInvoice(
        "Client A",
        "Logo Design",
        ethers.parseEther("0.5"),
        dueDate
      );
      await tx.wait();
      invoiceId = 1;
    });

    it("should allow issuer to mark an invoice as paid", async function () {
      await expect(invoiceMint.markAsPaid(invoiceId))
        .to.emit(invoiceMint, "InvoicePaid");

      const invoice = await invoiceMint.getInvoice(invoiceId);
      expect(invoice.status).to.equal(1); // Paid
    });

    it("should prevent non-issuer from marking invoice as paid", async function () {
      await expect(
        invoiceMint.connect(alice).markAsPaid(invoiceId)
      ).to.be.revertedWithCustomError(invoiceMint, "NotInvoiceIssuer");
    });

    it("should prevent marking already paid invoice as paid again", async function () {
      await invoiceMint.markAsPaid(invoiceId);
      await expect(
        invoiceMint.markAsPaid(invoiceId)
      ).to.be.revertedWithCustomError(invoiceMint, "InvoiceNotUnpaid");
    });

    it("should prevent marking a cancelled invoice as paid", async function () {
      await invoiceMint.cancelInvoice(invoiceId);
      await expect(
        invoiceMint.markAsPaid(invoiceId)
      ).to.be.revertedWithCustomError(invoiceMint, "InvoiceAlreadyCancelled");
    });
  });

  describe("Cancel Invoice", function () {
    let invoiceId;

    beforeEach(async function () {
      const currentTime = await time.latest();
      const dueDate = currentTime + 86400;
      await invoiceMint.createInvoice(
        "Client B",
        "SEO Consulting",
        ethers.parseEther("2"),
        dueDate
      );
      invoiceId = 1;
    });

    it("should allow issuer to cancel an unpaid invoice", async function () {
      await expect(invoiceMint.cancelInvoice(invoiceId))
        .to.emit(invoiceMint, "InvoiceCancelled");

      const invoice = await invoiceMint.getInvoice(invoiceId);
      expect(invoice.status).to.equal(2); // Cancelled
      expect(invoice.isActive).to.equal(false);
    });

    it("should prevent non-issuer from cancelling invoice", async function () {
      await expect(
        invoiceMint.connect(bob).cancelInvoice(invoiceId)
      ).to.be.revertedWithCustomError(invoiceMint, "NotInvoiceIssuer");
    });

    it("should prevent cancelling a paid invoice", async function () {
      await invoiceMint.markAsPaid(invoiceId);
      await expect(
        invoiceMint.cancelInvoice(invoiceId)
      ).to.be.revertedWithCustomError(invoiceMint, "InvoiceNotUnpaid");
    });
  });

  describe("Querying Invoices", function () {
    it("should return invoices belonging to caller via getMyInvoices", async function () {
      const currentTime = await time.latest();
      const dueDate = currentTime + 86400;

      // Owner creates 2 invoices
      await invoiceMint.createInvoice("Client 1", "Work 1", ethers.parseEther("1"), dueDate);
      await invoiceMint.createInvoice("Client 2", "Work 2", ethers.parseEther("2"), dueDate);

      // Alice creates 1 invoice
      await invoiceMint.connect(alice).createInvoice("Client 3", "Work 3", ethers.parseEther("3"), dueDate);

      const ownerInvoices = await invoiceMint.getMyInvoices();
      expect(ownerInvoices.length).to.equal(2);
      expect(ownerInvoices[0].customerName).to.equal("Client 1");
      expect(ownerInvoices[1].customerName).to.equal("Client 2");

      const aliceInvoices = await invoiceMint.connect(alice).getMyInvoices();
      expect(aliceInvoices.length).to.equal(1);
      expect(aliceInvoices[0].customerName).to.equal("Client 3");

      const bobInvoices = await invoiceMint.connect(bob).getMyInvoices();
      expect(bobInvoices.length).to.equal(0);
    });

    it("should revert getInvoice for non-existent invoice", async function () {
      await expect(invoiceMint.getInvoice(999)).to.be.revertedWithCustomError(
        invoiceMint,
        "InvoiceNotFound"
      );
    });
  });
});

