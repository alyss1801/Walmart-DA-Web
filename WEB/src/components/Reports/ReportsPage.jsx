import React, { useState, useRef } from 'react';
import { FileText, Download, Loader2, CheckCircle, FileDown, Calendar, BarChart3, TrendingUp, Users, Store } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// ============================================================
// DASHBOARD PREVIEW CARD
// ============================================================
const DashboardPreviewCard = ({ dashboard, isSelected, onSelect, onExport, isExporting }) => {
  return (
    <div 
      className={`bg-white rounded-xl border-2 transition-all duration-200 overflow-hidden cursor-pointer
        ${isSelected ? 'border-walmart-blue shadow-lg' : 'border-gray-200 hover:border-gray-300'}`}
      onClick={() => onSelect(dashboard.id)}
    >
      {/* Preview Image */}
      <div className={`h-40 bg-gradient-to-br ${dashboard.gradient} p-4 relative`}>
        <dashboard.icon className="w-12 h-12 text-white/80 absolute bottom-4 right-4" />
        <div className="absolute top-3 left-3 bg-white/20 backdrop-blur-sm px-2 py-1 rounded text-xs text-white">
          {dashboard.type}
        </div>
      </div>
      
      {/* Info */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-800">{dashboard.name}</h3>
        <p className="text-sm text-gray-500 mt-1">{dashboard.description}</p>
        
        <div className="flex items-center justify-between mt-4">
          <span className="text-xs text-gray-400">
            <Calendar className="w-3 h-3 inline mr-1" />
            {dashboard.dateRange}
          </span>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onExport(dashboard);
            }}
            disabled={isExporting}
            className="flex items-center gap-1 px-3 py-1.5 bg-walmart-blue text-white text-xs rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isExporting ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Download className="w-3 h-3" />
            )}
            Export PDF
          </button>
        </div>
      </div>
      
      {/* Selection indicator */}
      {isSelected && (
        <div className="bg-walmart-blue text-white text-xs py-2 text-center">
          <CheckCircle className="w-3 h-3 inline mr-1" />
          Selected for batch export
        </div>
      )}
    </div>
  );
};

// ============================================================
// MAIN REPORTS PAGE
// ============================================================
const ReportsPage = () => {
  const [selectedDashboards, setSelectedDashboards] = useState([]);
  const [isExporting, setIsExporting] = useState(false);
  const [exportingId, setExportingId] = useState(null);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportStatus, setExportStatus] = useState('');

  const dashboards = [
    {
      id: 'revenue-trend',
      name: 'Revenue Trend Analysis',
      description: 'Monthly revenue trends, weather impact, holiday sales analysis',
      type: 'Analytics',
      dateRange: '2024 - 2025',
      gradient: 'from-purple-500 to-indigo-600',
      icon: TrendingUp,
      path: '/'
    },
    {
      id: 'customer-segmentation',
      name: 'Customer Segmentation',
      description: 'Age groups, payment methods, customer behavior patterns',
      type: 'Segmentation',
      dateRange: '2024 - 2025',
      gradient: 'from-blue-500 to-cyan-600',
      icon: Users,
      path: '/segmentation'
    },
    {
      id: 'store-performance',
      name: 'Store Performance',
      description: 'Economic factors impact, unemployment vs sales correlation',
      type: 'Performance',
      dateRange: '2010 - 2012',
      gradient: 'from-green-500 to-teal-600',
      icon: Store,
      path: '/store-performance'
    }
  ];

  // Toggle dashboard selection
  const handleSelect = (id) => {
    setSelectedDashboards(prev => 
      prev.includes(id) 
        ? prev.filter(d => d !== id)
        : [...prev, id]
    );
  };

  // Export single dashboard to PDF
  const exportToPDF = async (dashboard) => {
    setExportingId(dashboard.id);
    setExportStatus(`Preparing ${dashboard.name}...`);

    try {
      // Navigate to dashboard and capture
      const dashboardElement = document.querySelector('main');
      
      if (!dashboardElement) {
        throw new Error('Dashboard element not found');
      }

      // Store current scroll position
      const scrollPos = window.scrollY;
      window.scrollTo(0, 0);

      setExportStatus('Capturing dashboard...');
      await new Promise(resolve => setTimeout(resolve, 500));

      // Capture the dashboard
      const canvas = await html2canvas(dashboardElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#f9fafb'
      });

      setExportStatus('Generating PDF...');

      // Create PDF
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // Add header
      pdf.setFillColor(0, 113, 206); // Walmart blue
      pdf.rect(0, 0, 210, 20, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(14);
      pdf.text(dashboard.name, 10, 13);
      pdf.setFontSize(8);
      pdf.text(`Generated: ${new Date().toLocaleString()}`, 150, 13);

      // Add dashboard image
      let heightLeft = imgHeight;
      let position = 25;

      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= (pageHeight - position);

      // Add more pages if needed
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Add footer
      const pageCount = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFillColor(240, 240, 240);
        pdf.rect(0, 287, 210, 10, 'F');
        pdf.setTextColor(100, 100, 100);
        pdf.setFontSize(8);
        pdf.text(`Page ${i} of ${pageCount}`, 100, 293, { align: 'center' });
        pdf.text('Walmart Analytics Dashboard', 10, 293);
      }

      // Download
      pdf.save(`${dashboard.id}-report-${Date.now()}.pdf`);
      
      setExportStatus('Export complete!');
      
      // Restore scroll
      window.scrollTo(0, scrollPos);

    } catch (error) {
      console.error('Export error:', error);
      setExportStatus('Export failed. Please try again.');
    }

    setTimeout(() => {
      setExportingId(null);
      setExportStatus('');
    }, 2000);
  };

  // Export selected dashboards
  const exportSelected = async () => {
    if (selectedDashboards.length === 0) return;
    
    setIsExporting(true);
    setExportProgress(0);

    for (let i = 0; i < selectedDashboards.length; i++) {
      const dashboard = dashboards.find(d => d.id === selectedDashboards[i]);
      if (dashboard) {
        setExportStatus(`Exporting ${dashboard.name}...`);
        await exportToPDF(dashboard);
        setExportProgress(((i + 1) / selectedDashboards.length) * 100);
      }
    }

    setIsExporting(false);
    setSelectedDashboards([]);
    setExportStatus('All exports complete!');
    
    setTimeout(() => setExportStatus(''), 3000);
  };

  // Quick export current view
  const exportCurrentView = async () => {
    setExportingId('current');
    setExportStatus('Capturing current view...');

    try {
      const mainContent = document.querySelector('main');
      
      if (!mainContent) {
        // If on reports page, create a simple PDF
        const pdf = new jsPDF('p', 'mm', 'a4');
        
        // Header
        pdf.setFillColor(0, 113, 206);
        pdf.rect(0, 0, 210, 25, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(18);
        pdf.text('Walmart Analytics - Reports Summary', 10, 16);
        
        // Content
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(12);
        let y = 40;
        
        dashboards.forEach((d, i) => {
          pdf.setFontSize(14);
          pdf.setTextColor(0, 113, 206);
          pdf.text(`${i + 1}. ${d.name}`, 15, y);
          
          pdf.setFontSize(10);
          pdf.setTextColor(100, 100, 100);
          pdf.text(d.description, 20, y + 7);
          pdf.text(`Date Range: ${d.dateRange}`, 20, y + 14);
          
          y += 30;
        });
        
        // Footer
        pdf.setFontSize(8);
        pdf.setTextColor(150, 150, 150);
        pdf.text(`Generated: ${new Date().toLocaleString()}`, 10, 285);
        
        pdf.save(`walmart-reports-summary-${Date.now()}.pdf`);
        setExportStatus('Summary exported!');
      } else {
        const canvas = await html2canvas(mainContent, {
          scale: 2,
          useCORS: true,
          logging: false
        });

        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgWidth = 210;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, imgWidth, imgHeight);
        pdf.save(`walmart-report-${Date.now()}.pdf`);
        setExportStatus('Export complete!');
      }
    } catch (error) {
      console.error('Export error:', error);
      setExportStatus('Export failed');
    }

    setTimeout(() => {
      setExportingId(null);
      setExportStatus('');
    }, 2000);
  };

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FileText className="w-7 h-7 text-walmart-blue" />
            Reports & Export
          </h1>
          <p className="text-gray-500 mt-1">Export dashboards as PDF reports</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Quick export button */}
          <button
            onClick={exportCurrentView}
            disabled={exportingId === 'current'}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            {exportingId === 'current' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FileDown className="w-4 h-4" />
            )}
            Export Summary
          </button>

          {/* Batch export button */}
          {selectedDashboards.length > 0 && (
            <button
              onClick={exportSelected}
              disabled={isExporting}
              className="flex items-center gap-2 px-4 py-2 bg-walmart-blue text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isExporting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              Export {selectedDashboards.length} Selected
            </button>
          )}
        </div>
      </div>

      {/* Export status bar */}
      {exportStatus && (
        <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-3">
          {isExporting || exportingId ? (
            <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
          ) : (
            <CheckCircle className="w-5 h-5 text-green-600" />
          )}
          <span className="text-sm text-blue-800">{exportStatus}</span>
          {isExporting && exportProgress > 0 && (
            <div className="flex-1 max-w-xs">
              <div className="h-2 bg-blue-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-walmart-blue transition-all duration-300"
                  style={{ width: `${exportProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-semibold text-yellow-800 mb-2">📋 How to export:</h3>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• Click on a dashboard card to select it for batch export</li>
          <li>• Click "Export PDF" button on individual cards for single export</li>
          <li>• Use "Export Summary" for a quick overview PDF</li>
          <li>• <strong>Tip:</strong> Navigate to a dashboard first, then use browser's print (Ctrl+P) for best quality</li>
        </ul>
      </div>

      {/* Dashboard grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dashboards.map(dashboard => (
          <DashboardPreviewCard
            key={dashboard.id}
            dashboard={dashboard}
            isSelected={selectedDashboards.includes(dashboard.id)}
            onSelect={handleSelect}
            onExport={exportToPDF}
            isExporting={exportingId === dashboard.id}
          />
        ))}
      </div>

      {/* Additional info */}
      <div className="mt-8 bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-walmart-blue" />
          Export Options
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-700">PDF Export</h4>
            <p className="text-sm text-gray-500 mt-1">High-quality PDF suitable for printing and presentations</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-700">Batch Export</h4>
            <p className="text-sm text-gray-500 mt-1">Select multiple dashboards and export all at once</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-700">Scheduled Reports</h4>
            <p className="text-sm text-gray-500 mt-1">Coming soon: Automated daily/weekly reports via email</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
