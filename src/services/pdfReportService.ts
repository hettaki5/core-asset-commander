// src/services/pdfReportService.ts - FIXED JSPDF IMPORT
// Import jsPDF using require to avoid module resolution issues
import jsPDF from "jspdf";
import type { LocalAssetDto } from "./localAssetService";

export interface ReportConfig {
  companyName: string;
  companyLogo?: string;
  companyAddress: string;
  reportTitle: string;
  reportSubtitle?: string;
  headerColor: string;
  accentColor: string;
}

export class PDFReportService {
  private defaultConfig: ReportConfig = {
    companyName: "Your Company",
    companyAddress: "Your Company Address\nCity, Country",
    reportTitle: "ASSET REPORT",
    reportSubtitle: "Detailed Asset Information",
    headerColor: "#1DB584", // Teal color similar to invoice
    accentColor: "#1DB584",
  };

  private doc: any; // Use any to avoid type issues
  private pageWidth: number;
  private pageHeight: number;
  private margin: number = 20;
  private currentY: number = 0;

  constructor(config?: Partial<ReportConfig>) {
    this.defaultConfig = { ...this.defaultConfig, ...config };
    this.doc = new jsPDF();
    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
  }

  private addNewPage(): void {
    this.doc.addPage();
    this.currentY = this.margin;
  }

  private checkPageBreak(requiredHeight: number): void {
    if (this.currentY + requiredHeight > this.pageHeight - this.margin) {
      this.addNewPage();
    }
  }

  private drawHeader(): void {
    const headerHeight = 60;

    // Header background
    this.doc.setFillColor(this.defaultConfig.headerColor);
    this.doc.rect(0, 0, this.pageWidth, headerHeight, "F");

    // Company name and report title
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(24);
    this.doc.setFont("helvetica", "bold");
    this.doc.text(this.defaultConfig.reportTitle, this.margin, 25);

    if (this.defaultConfig.reportSubtitle) {
      this.doc.setFontSize(12);
      this.doc.setFont("helvetica", "normal");
      this.doc.text(this.defaultConfig.reportSubtitle, this.margin, 35);
    }

    // Company info on the right
    this.doc.setFontSize(14);
    this.doc.setFont("helvetica", "bold");
    const companyNameWidth = this.doc.getTextWidth(
      this.defaultConfig.companyName
    );
    this.doc.text(
      this.defaultConfig.companyName,
      this.pageWidth - this.margin - companyNameWidth,
      25
    );

    this.doc.setFontSize(10);
    this.doc.setFont("helvetica", "normal");
    const addressLines = this.defaultConfig.companyAddress.split("\n");
    addressLines.forEach((line, index) => {
      const lineWidth = this.doc.getTextWidth(line);
      this.doc.text(
        line,
        this.pageWidth - this.margin - lineWidth,
        35 + index * 5
      );
    });

    this.currentY = headerHeight + 10;
  }

  private drawAssetInfo(asset: LocalAssetDto): void {
    this.doc.setTextColor(0, 0, 0);

    // Asset Information Section
    this.doc.setFillColor(240, 240, 240);
    this.doc.rect(
      this.margin,
      this.currentY,
      this.pageWidth - 2 * this.margin,
      40,
      "F"
    );

    this.doc.setFontSize(16);
    this.doc.setFont("helvetica", "bold");
    this.doc.text("Asset Information", this.margin + 5, this.currentY + 15);

    this.currentY += 50;

    // Asset details in two columns
    const leftColumn = this.margin + 5;
    const rightColumn = this.pageWidth / 2 + 10;

    this.doc.setFontSize(10);
    this.doc.setFont("helvetica", "bold");

    // Left column
    this.doc.text("Asset Name:", leftColumn, this.currentY);
    this.doc.setFont("helvetica", "normal");
    this.doc.text(asset.name, leftColumn + 25, this.currentY);

    this.doc.setFont("helvetica", "bold");
    this.doc.text("Reference:", leftColumn, this.currentY + 10);
    this.doc.setFont("helvetica", "normal");
    this.doc.text(asset.reference || "-", leftColumn + 25, this.currentY + 10);

    this.doc.setFont("helvetica", "bold");
    this.doc.text("Type:", leftColumn, this.currentY + 20);
    this.doc.setFont("helvetica", "normal");
    this.doc.text(asset.type, leftColumn + 25, this.currentY + 20);

    // Right column
    this.doc.setFont("helvetica", "bold");
    this.doc.text("Status:", rightColumn, this.currentY);
    this.doc.setFont("helvetica", "normal");
    this.doc.text(
      this.getStatusLabel(asset.status),
      rightColumn + 25,
      this.currentY
    );

    this.doc.setFont("helvetica", "bold");
    this.doc.text("Created By:", rightColumn, this.currentY + 10);
    this.doc.setFont("helvetica", "normal");
    this.doc.text(asset.createdBy, rightColumn + 25, this.currentY + 10);

    this.doc.setFont("helvetica", "bold");
    this.doc.text("Created Date:", rightColumn, this.currentY + 20);
    this.doc.setFont("helvetica", "normal");
    this.doc.text(
      new Date(asset.createdAt).toLocaleDateString("fr-FR"),
      rightColumn + 25,
      this.currentY + 20
    );

    this.currentY += 40;

    // Description if available
    if (asset.description) {
      this.doc.setFont("helvetica", "bold");
      this.doc.text("Description:", leftColumn, this.currentY);
      this.currentY += 10;

      this.doc.setFont("helvetica", "normal");
      const descriptionLines = this.doc.splitTextToSize(
        asset.description,
        this.pageWidth - 2 * this.margin - 10
      );
      this.doc.text(descriptionLines, leftColumn, this.currentY);
      this.currentY += descriptionLines.length * 5 + 10;
    }
  }

  private drawFormData(asset: LocalAssetDto): void {
    if (!asset.formData || !asset.formData.sections) return;

    this.currentY += 10;

    asset.formData.sections.forEach((section, sectionIndex) => {
      this.checkPageBreak(30);

      // Section header
      this.doc.setFillColor(this.defaultConfig.accentColor);
      this.doc.rect(
        this.margin,
        this.currentY,
        this.pageWidth - 2 * this.margin,
        20,
        "F"
      );

      this.doc.setTextColor(255, 255, 255);
      this.doc.setFontSize(12);
      this.doc.setFont("helvetica", "bold");
      this.doc.text(section.name, this.margin + 5, this.currentY + 13);

      this.currentY += 30;
      this.doc.setTextColor(0, 0, 0);

      // Section fields
      section.fields.forEach((field, fieldIndex) => {
        this.checkPageBreak(20);

        this.doc.setFontSize(10);
        this.doc.setFont("helvetica", "bold");
        this.doc.text(`${field.name}:`, this.margin + 5, this.currentY);

        if (field.type === "image" && Array.isArray(field.value)) {
          this.currentY += 10;
          this.drawImages(field.value as string[]);
        } else {
          this.doc.setFont("helvetica", "normal");
          const value = field.value || "-";
          const valueText = Array.isArray(value)
            ? value.join(", ")
            : String(value);

          if (valueText.length > 80) {
            const lines = this.doc.splitTextToSize(
              valueText,
              this.pageWidth - 2 * this.margin - 40
            );
            this.doc.text(lines, this.margin + 35, this.currentY);
            this.currentY += lines.length * 5 + 5;
          } else {
            this.doc.text(valueText, this.margin + 35, this.currentY);
            this.currentY += 15;
          }
        }
      });

      this.currentY += 10;
    });
  }

  private drawImages(imageUrls: string[]): void {
    if (!imageUrls || imageUrls.length === 0) return;

    const maxImagesPerRow = 3;
    const imageWidth = 40;
    const imageHeight = 30;
    const imageSpacing = 10;

    imageUrls.forEach((imageUrl, index) => {
      if (index % maxImagesPerRow === 0 && index > 0) {
        this.currentY += imageHeight + 10;
        this.checkPageBreak(imageHeight + 20);
      }

      const x =
        this.margin +
        35 +
        (index % maxImagesPerRow) * (imageWidth + imageSpacing);

      try {
        // Draw a placeholder rectangle for images
        this.doc.setDrawColor(200, 200, 200);
        this.doc.setFillColor(245, 245, 245);
        this.doc.rect(x, this.currentY, imageWidth, imageHeight, "FD");

        // Add image label
        this.doc.setFontSize(8);
        this.doc.setTextColor(100, 100, 100);
        this.doc.text(
          `Image ${index + 1}`,
          x + 2,
          this.currentY + imageHeight - 2
        );

        // If it's a base64 image, try to add it
        if (imageUrl.startsWith("data:image/")) {
          try {
            this.doc.addImage(
              imageUrl,
              "JPEG",
              x,
              this.currentY,
              imageWidth,
              imageHeight
            );
          } catch (error) {
            console.warn("Failed to add image to PDF:", error);
          }
        }
      } catch (error) {
        console.warn("Error drawing image:", error);
      }
    });

    this.currentY += imageHeight + 15;
  }

  private drawFooter(): void {
    const footerY = this.pageHeight - 30;

    this.doc.setFillColor(this.defaultConfig.headerColor);
    this.doc.rect(0, footerY, this.pageWidth, 30, "F");

    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(10);
    this.doc.setFont("helvetica", "normal");

    const date = new Date().toLocaleDateString("fr-FR");
    const time = new Date().toLocaleTimeString("fr-FR");
    const footerText = `Generated on ${date} at ${time}`;

    this.doc.text(footerText, this.margin, footerY + 15);

    // Page number
    const pageNum = this.doc.getCurrentPageInfo().pageNumber;
    const pageText = `Page ${pageNum}`;
    const pageTextWidth = this.doc.getTextWidth(pageText);
    this.doc.text(
      pageText,
      this.pageWidth - this.margin - pageTextWidth,
      footerY + 15
    );
  }

  private getStatusLabel(status: string): string {
    switch (status) {
      case "PENDING_VALIDATION":
        return "Soumis";
      case "APPROVED":
        return "Approuvé";
      case "REJECTED":
        return "Rejeté";
      default:
        return status;
    }
  }

  public generateAssetReport(
    asset: LocalAssetDto,
    config?: Partial<ReportConfig>
  ): void {
    if (config) {
      this.defaultConfig = { ...this.defaultConfig, ...config };
    }

    // Draw header
    this.drawHeader();

    // Draw asset information
    this.drawAssetInfo(asset);

    // Draw form data
    this.drawFormData(asset);

    // Draw footer on all pages
    const totalPages = this.doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      this.doc.setPage(i);
      this.drawFooter();
    }

    // Generate filename and download
    const filename = `Asset_Report_${
      asset.reference || asset.name.replace(/[^a-zA-Z0-9]/g, "_")
    }_${new Date().toISOString().split("T")[0]}.pdf`;
    this.doc.save(filename);
  }
}

export const pdfReportService = new PDFReportService();
