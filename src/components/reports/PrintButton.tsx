'use client';

interface PrintButtonProps {
  printAreaId: string;
  title?: string;
  disabled?: boolean;
  className?: string;
}

export default function PrintButton({
  printAreaId,
  title = 'تقرير',
  disabled = false,
  className = ''
}: PrintButtonProps) {
  
  const handlePrint = () => {
    const printArea = document.getElementById(printAreaId);
    if (!printArea) return;

    // Create print window
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) return;

    // Get current styles
    const styles = Array.from(document.styleSheets)
      .map(styleSheet => {
        try {
          return Array.from(styleSheet.cssRules)
            .map(rule => rule.cssText)
            .join('\n');
        } catch {
          return '';
        }
      })
      .join('\n');

    // Write print document
    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>${title}</title>
        <style>
          ${styles}
          
          /* Print-specific styles */
          @page {
            size: A4;
            margin: 15mm;
          }
          
          @media print {
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              direction: rtl;
              background: white !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            
            /* Hide non-essential elements */
            button, .no-print {
              display: none !important;
            }
            
            /* Table styles for print */
            table {
              width: 100%;
              border-collapse: collapse;
              font-size: 10pt;
            }
            
            th, td {
              border: 1px solid #ddd;
              padding: 6px 8px;
              text-align: center;
            }
            
            th {
              background-color: #6366f1 !important;
              color: white !important;
              font-weight: bold;
            }
            
            tr:nth-child(even) {
              background-color: #f9fafb;
            }
            
            /* Header styling */
            .print-header {
              text-align: center;
              margin-bottom: 20px;
              padding-bottom: 10px;
              border-bottom: 2px solid #6366f1;
            }
            
            .print-header h1 {
              font-size: 18pt;
              color: #1f2937;
              margin: 0;
            }
            
            .print-header p {
              font-size: 10pt;
              color: #6b7280;
              margin: 5px 0 0 0;
            }
          }
        </style>
      </head>
      <body>
        <div class="print-header">
          <h1>منصة شموخ - ${title}</h1>
          <p>تاريخ الطباعة: ${new Date().toLocaleDateString('ar-SA')}</p>
        </div>
        ${printArea.innerHTML}
      </body>
      </html>
    `);

    printWindow.document.close();
    
    // Wait for content to load then print
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    };
  };

  return (
    <button
      onClick={handlePrint}
      disabled={disabled}
      className={`
        px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white
        rounded-lg font-medium transition-colors duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        flex items-center gap-2
        ${className}
      `.trim()}
      aria-label="طباعة التقرير"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
      </svg>
      <span>طباعة</span>
    </button>
  );
}
