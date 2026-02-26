import PDFDocument from "pdfkit";

/**
 * Generates a professional 80G-style PDF tax receipt for a donation.
 * Returns a PDFDocument stream that can be piped to the HTTP response.
 * @param {Object} donation - Mongoose Donation document
 */
export const generateReceiptPDF = (donation) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });

    const RED = "#DC2626";
    const DARK = "#1E293B";
    const GRAY = "#64748B";
    const LIGHT_GRAY = "#F1F5F9";
    const WHITE = "#FFFFFF";

    const formatDate = (date) =>
        new Date(date).toLocaleDateString("en-IN", {
            year: "numeric", month: "long", day: "numeric",
        });

    const formatAmount = (amount) =>
        new Intl.NumberFormat("en-IN", {
            style: "currency", currency: "INR", minimumFractionDigits: 0,
        }).format(amount);

    // ── RED HEADER BAND ──────────────────────────────────────────────
    doc.rect(0, 0, 595, 120).fill(RED);

    // Organization Name
    doc.fillColor(WHITE).fontSize(26).font("Helvetica-Bold")
        .text("BloodConnect", 50, 35);

    doc.fillColor("rgba(255,255,255,0.75)").fontSize(11).font("Helvetica")
        .text("Connecting Life • Saving Lives", 50, 65);

    // RECEIPT label on right
    doc.fillColor(WHITE).fontSize(10).font("Helvetica")
        .text("OFFICIAL TAX RECEIPT", 400, 35, { align: "right", width: 145 });
    doc.fontSize(22).font("Helvetica-Bold")
        .text(donation.receiptNumber || "BC-RECEIPT", 400, 50, { align: "right", width: 145 });
    doc.fontSize(9).font("Helvetica")
        .fillColor("rgba(255,255,255,0.8)")
        .text(`Date: ${formatDate(donation.createdAt || new Date())}`, 400, 80, { align: "right", width: 145 });

    // ── SUBHEADER ────────────────────────────────────────────────────
    doc.rect(0, 120, 595, 36).fill(LIGHT_GRAY);
    doc.fillColor(DARK).fontSize(12).font("Helvetica-Bold")
        .text("Donation Receipt — Section 80G Eligible", 50, 133);

    // ── DONOR DETAILS BOX ────────────────────────────────────────────
    doc.rect(50, 180, 495, 130).fill("#F8FAFC").stroke("#E2E8F0");

    doc.fillColor(RED).fontSize(9).font("Helvetica-Bold")
        .text("DONOR INFORMATION", 65, 193);

    const details = [
        ["Donor Name", donation.donorName || "Anonymous"],
        ["Email Address", donation.donorEmail || "Not provided"],
        ["Contact", donation.donorPhone || "Not provided"],
        ["Donor ID", donation.userId?.toString() || "Guest"],
    ];

    details.forEach(([label, value], i) => {
        const y = 210 + i * 22;
        doc.fillColor(GRAY).fontSize(9).font("Helvetica").text(label, 65, y);
        doc.fillColor(DARK).fontSize(9).font("Helvetica-Bold").text(value, 220, y);
    });

    // ── DONATION DETAILS BOX ─────────────────────────────────────────
    doc.rect(50, 330, 495, 140).fill("#F8FAFC").stroke("#E2E8F0");

    doc.fillColor(RED).fontSize(9).font("Helvetica-Bold")
        .text("TRANSACTION DETAILS", 65, 343);

    const txDetails = [
        ["Order ID", donation.orderId],
        ["Payment ID", donation.paymentId || "—"],
        ["Payment Date", formatDate(donation.updatedAt || donation.createdAt || new Date())],
        ["Payment Mode", "Online — Razorpay"],
        ["Status", "✅ Successful"],
    ];

    txDetails.forEach(([label, value], i) => {
        const y = 360 + i * 22;
        doc.fillColor(GRAY).fontSize(9).font("Helvetica").text(label, 65, y);
        doc.fillColor(DARK).fontSize(9).font("Helvetica-Bold").text(value, 220, y);
    });

    // ── AMOUNT HIGHLIGHT ─────────────────────────────────────────────
    doc.rect(50, 490, 495, 70).fill(RED);
    doc.fillColor(WHITE).fontSize(13).font("Helvetica")
        .text("Total Donation Amount", 65, 507);
    doc.fontSize(24).font("Helvetica-Bold")
        .text(formatAmount(donation.amount), 65, 504, { align: "right", width: 465 });

    // ── LEGAL / DECLARATION ──────────────────────────────────────────
    doc.rect(50, 580, 495, 80).fill(LIGHT_GRAY).stroke("#E2E8F0");

    doc.fillColor(GRAY).fontSize(8).font("Helvetica")
        .text(
            "This receipt is issued under Section 80G of the Income Tax Act, 1961. BloodConnect is a registered non-profit initiative committed to saving lives through voluntary blood donation. This donation amount is eligible for tax deduction as per applicable Indian tax laws. Please retain this document for your tax records.",
            65, 592, { width: 465, lineGap: 3 }
        );

    // ── FOOTER ───────────────────────────────────────────────────────
    doc.rect(0, 720, 595, 122).fill(DARK);
    doc.fillColor(WHITE).fontSize(10).font("Helvetica-Bold")
        .text("BloodConnect", 50, 735);
    doc.fillColor("rgba(255,255,255,0.6)").fontSize(8).font("Helvetica")
        .text("support@bloodconnect.in  |  www.bloodconnect.in", 50, 752);

    doc.fillColor("rgba(255,255,255,0.4)").fontSize(7)
        .text(
            "This is a system-generated receipt and does not require a physical signature.",
            50, 780, { width: 495, align: "center" }
        );

    doc.end();
    return doc;
};
