import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

/**
 * Renders an HTML string into a multi-page A4 PDF and returns base64-encoded content.
 */
export async function generatePDFFromHTML(htmlString) {
  // Parse the full HTML document to extract styles + body content
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, "text/html");

  // Collect inline <style> blocks from <head>
  const styleText = Array.from(doc.querySelectorAll("style"))
    .map((s) => s.textContent)
    .join("\n");

  // Build a hidden container at A4 width (794px ≈ 210mm at 96dpi)
  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.left = "-9999px";
  container.style.top = "0";
  container.style.width = "794px";
  container.style.background = "#ffffff";
  container.style.padding = "0";

  if (styleText) {
    const style = document.createElement("style");
    style.textContent = styleText;
    container.appendChild(style);
  }

  const bodyDiv = document.createElement("div");
  bodyDiv.innerHTML = doc.body.innerHTML;
  container.appendChild(bodyDiv);

  document.body.appendChild(container);

  try {
    // Allow layout + fonts to settle
    await new Promise((r) => setTimeout(r, 300));

    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    if (imgHeight <= pdfHeight) {
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
    } else {
      // Multi-page: slice the tall image across pages
      let heightLeft = imgHeight;
      let position = 0;
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
      while (heightLeft > 0) {
        position -= pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }
    }

    // Convert to base64 string
    const arrayBuffer = pdf.output("arraybuffer");
    const bytes = new Uint8Array(arrayBuffer);
    let binary = "";
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  } finally {
    document.body.removeChild(container);
  }
}