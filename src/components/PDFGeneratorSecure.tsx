
import React from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import DOMPurify from 'dompurify';
import { Button } from '@/components/ui/button';
import { Download, FileText } from 'lucide-react';

interface PDFGeneratorSecureProps {
  elementId: string;
  filename: string;
  title?: string;
  className?: string;
}

const PDFGeneratorSecure: React.FC<PDFGeneratorSecureProps> = ({
  elementId,
  filename,
  title = 'Gerar PDF',
  className = ''
}) => {
  const [isGenerating, setIsGenerating] = React.useState(false);

  const sanitizeFilename = (name: string): string => {
    // Remove dangerous characters and limit length
    return name
      .replace(/[^a-zA-Z0-9_\-\.]/g, '_')
      .substring(0, 100);
  };

  const generatePDF = async () => {
    try {
      setIsGenerating(true);
      
      const element = document.getElementById(elementId);
      if (!element) {
        throw new Error('Elemento não encontrado');
      }

      // Create a safe copy of the element to avoid XSS
      const clonedElement = element.cloneNode(true) as HTMLElement;
      
      // Sanitize all text content to prevent XSS
      const textNodes = document.createTreeWalker(
        clonedElement,
        NodeFilter.SHOW_TEXT,
        null
      );

      const nodesToSanitize: Text[] = [];
      let currentNode = textNodes.nextNode();
      
      while (currentNode) {
        if (currentNode.nodeType === Node.TEXT_NODE) {
          nodesToSanitize.push(currentNode as Text);
        }
        currentNode = textNodes.nextNode();
      }

      // Sanitize text content
      nodesToSanitize.forEach(node => {
        if (node.textContent) {
          node.textContent = DOMPurify.sanitize(node.textContent, { 
            ALLOWED_TAGS: [],
            ALLOWED_ATTR: [] 
          });
        }
      });

      // Create temporary container for rendering
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.top = '-9999px';
      tempContainer.style.width = element.offsetWidth + 'px';
      tempContainer.appendChild(clonedElement);
      document.body.appendChild(tempContainer);

      try {
        const canvas = await html2canvas(clonedElement, {
          scale: 2,
          useCORS: true,
          allowTaint: false,
          backgroundColor: '#ffffff',
          logging: false
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        
        const imgWidth = 190;
        const pageHeight = pdf.internal.pageSize.height;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 10;

        // Add first page
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight - 20;

        // Add additional pages if needed
        while (heightLeft >= 0) {
          position = heightLeft - imgHeight + 10;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }

        // Sanitize filename
        const safeFilename = sanitizeFilename(filename);
        pdf.save(`${safeFilename}.pdf`);
        
      } finally {
        // Clean up temporary container
        document.body.removeChild(tempContainer);
      }

    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      // Don't expose internal errors to user
      alert('Erro ao gerar PDF. Tente novamente.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button 
      onClick={generatePDF}
      disabled={isGenerating}
      className={className}
      variant="outline"
    >
      {isGenerating ? (
        <FileText className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <Download className="w-4 h-4 mr-2" />
      )}
      {isGenerating ? 'Gerando...' : title}
    </Button>
  );
};

export default PDFGeneratorSecure;
