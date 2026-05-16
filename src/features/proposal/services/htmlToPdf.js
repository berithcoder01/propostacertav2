// htmlToPdf.js
// Converts an HTML string to a PDF blob using an iframe + html-to-image + jsPDF
export const htmlToPdf = async (htmlString, filename) => {
  if (!window.jspdf || !window.htmlToImage) {
    alert('Erro: Bibliotecas de PDF não carregadas. Verifique sua conexão e recarregue a página.');
    console.error('jsPDF or html-to-image not loaded.');
    return null;
  }

  let iframe = null;

  try {
    // Create an off-screen but visible iframe (html-to-image needs the element to be visible)
    iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.left = '0';
    iframe.style.top = '0';
    iframe.style.width = '794px';   // A4 at 96dpi
    iframe.style.height = '1123px'; // A4 at 96dpi
    iframe.style.zIndex = '-9999';
    iframe.style.border = 'none';
    iframe.style.opacity = '0.01'; // Must be > 0 for html-to-image to capture it
    iframe.style.pointerEvents = 'none';
    document.body.appendChild(iframe);

    // Write the HTML into the iframe
    iframe.contentDocument.open();
    iframe.contentDocument.write(htmlString);
    iframe.contentDocument.close();

    // Wait for fonts and images to load inside the iframe
    await new Promise(resolve => setTimeout(resolve, 600));

    const iframeBody = iframe.contentDocument.body;

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
    const pdfW = pdf.internal.pageSize.getWidth();
    const pdfH = pdf.internal.pageSize.getHeight();

    const dataUrl = await window.htmlToImage.toJpeg(iframeBody, {
      quality: 0.95,
      pixelRatio: 2.0,
      backgroundColor: '#ffffff',
      cacheBust: true,
    });

    const imgProps = pdf.getImageProperties(dataUrl);
    const totalImgH = (imgProps.height * pdfW) / imgProps.width;

    const margin = 0; // Templates already have their own padding
    const printableH = pdfH;
    let pages = [];

    if (totalImgH <= printableH) {
      pages.push({ startY: 0, endY: totalImgH });
    } else {
      let y = 0;
      while (y < totalImgH) {
        pages.push({ startY: y, endY: Math.min(y + printableH, totalImgH) });
        y += printableH;
      }
    }

    // Render pages
    for (let i = 0; i < pages.length; i++) {
      if (i > 0) pdf.addPage();
      const page = pages[i];
      const drawY = margin - page.startY;
      pdf.addImage(dataUrl, 'JPEG', 0, drawY, pdfW, totalImgH, undefined, 'FAST');

      // Mask overflow at bottom of each page
      const contentH = page.endY - page.startY;
      if (margin + contentH < pdfH) {
        pdf.setFillColor(255, 255, 255);
        pdf.rect(0, margin + contentH, pdfW, pdfH - (margin + contentH), 'F');
      }
    }

    const blob = pdf.output('blob');
    return blob;

  } catch (error) {
    alert('Erro ao gerar PDF: ' + error.message);
    console.error('Erro no htmlToPdf:', error);
    return null;
  } finally {
    if (iframe && document.body.contains(iframe)) {
      document.body.removeChild(iframe);
    }
  }
};