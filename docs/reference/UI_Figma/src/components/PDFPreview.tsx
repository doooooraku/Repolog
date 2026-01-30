import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { Report, LayoutType, FREE_MAX_PDF_EXPORTS, PHOTO_WARNING_THRESHOLD } from '../types';
import { ArrowLeft, Download } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { toast } from 'sonner';
import { generatePDFWithHtml2pdf } from '../utils/pdfGeneratorNew';
import { formatCoordinates } from '../utils/geocoding';

interface PDFPreviewProps {
  report: Report;
  onBack: () => void;
}

export const PDFPreview: React.FC<PDFPreviewProps> = ({ report, onBack }) => {
  const { t, settings, updateReport, pdfExportsThisMonth, incrementPdfExports } = useApp();
  const [layout, setLayout] = useState<LayoutType>('standard');
  const [showProModal, setShowProModal] = useState(false);
  const [showPhotoWarningModal, setShowPhotoWarningModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [pdfProgress, setPdfProgress] = useState(0);

  const handleExport = async () => {
    // Check if layout is Pro-only and user is on Free plan
    if (layout === 'large' && settings.plan === 'free') {
      setShowProModal(true);
      return;
    }

    // Check monthly export limit for Free plan
    if (settings.plan === 'free' && pdfExportsThisMonth >= FREE_MAX_PDF_EXPORTS) {
      toast.error(`Free plan limit: ${FREE_MAX_PDF_EXPORTS} PDFs per month`);
      return;
    }

    // Check photo count warning
    if (report.photos.length > PHOTO_WARNING_THRESHOLD) {
      setShowPhotoWarningModal(true);
      return;
    }

    await generatePDFFile();
  };

  const generatePDFFile = async () => {
    setIsGenerating(true);
    setPdfProgress(0);
    
    try {
      // html2pdf.js を使用してPDFを生成
      const pdfBlob = await generatePDFWithHtml2pdf(
        report,
        layout,
        settings,
        t,
        (progress) => setPdfProgress(progress)  // 進捗コールバック
      );
      
      // Create download link
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      
      // Generate filename
      const dateStr = new Date(report.createdAt)
        .toISOString()
        .replace(/[-:]/g, '')
        .slice(0, 15)
        .replace('T', '_');
      const siteName = report.siteName.replace(/[^a-zA-Z0-9ぁ-んァ-ヶー一-龯]/g, '_');
      a.download = `${dateStr}_${siteName}_Repolog.pdf`;
      
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Update report and increment counter
      updateReport(report.id, { pdfGenerated: true });
      incrementPdfExports();
      
      toast.success('PDF exported successfully');
      onBack();
    } catch (error) {
      console.error('PDF generation failed:', error);
      toast.error('Failed to generate PDF: ' + (error as Error).message);
    } finally {
      setIsGenerating(false);
      setPdfProgress(0);
    }
  };

  const handleProModalUseStandard = () => {
    setShowProModal(false);
    setLayout('standard');
    // Automatically trigger export with standard layout
    setTimeout(() => handleExport(), 100);
  };

  const handlePhotoWarningContinue = () => {
    setShowPhotoWarningModal(false);
    generatePDFFile();
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* AppBar */}
      <header className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold">{t.pdfPreview}</h1>
        </div>
      </header>

      {/* Layout Selection */}
      <div className="bg-white border-b px-4 py-3">
        <div className="flex gap-2">
          <Button
            variant={layout === 'standard' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setLayout('standard')}
            className="flex-1"
          >
            {t.layoutStandard}
          </Button>
          <Button
            variant={layout === 'large' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setLayout('large')}
            className="flex-1"
          >
            {t.layoutLarge}
            {settings.plan === 'free' && (
              <span className="ml-1 text-xs bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded">
                Pro
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-2xl mx-auto bg-white rounded-lg border shadow-sm p-6">
          <h2 className="text-xl font-bold mb-4">{t.reportTitle}</h2>
          
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-3 gap-2">
              <span className="font-semibold">{t.site}:</span>
              <span className="col-span-2">{report.siteName}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="font-semibold">{t.createdAt}:</span>
              <span className="col-span-2">
                {(() => {
                  const d = new Date(report.createdAt);
                  const dateStr = d.toLocaleDateString('en-CA');
                  const timeStr = d.toLocaleTimeString('en-GB', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false,
                  });
                  return `${dateStr} ${timeStr}`;
                })()}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="font-semibold">{t.location}:</span>
              <span className="col-span-2">
                {report.location ? (
                  <>
                    {report.location.address && (
                      <>
                        {report.location.address}
                        <br />
                      </>
                    )}
                    {formatCoordinates(report.location.lat, report.location.lng)}
                  </>
                ) : (
                  '-'
                )}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="font-semibold">{t.weather}:</span>
              <span className="col-span-2">
                {report.weather === 'sunny' && t.sunny}
                {report.weather === 'cloudy' && t.cloudy}
                {report.weather === 'rainy' && t.rainy}
                {report.weather === 'snowy' && t.snowy}
                {report.weather === 'none' && t.noWeather}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="font-semibold">{t.photoCount}:</span>
              <span className="col-span-2">
                {report.photos.length} {t.photoCount}
              </span>
            </div>
          </div>

          {report.comment && (
            <div className="mt-6">
              <h3 className="font-semibold mb-2">{t.comment}</h3>
              <p className="text-sm whitespace-pre-wrap text-gray-700">
                {report.comment}
              </p>
            </div>
          )}

          {report.photos.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold mb-3">{t.photos}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {report.photos.slice(0, 4).map((photo, index) => (
                  <div key={photo.id} className="relative">
                    <img
                      src={photo.uri}
                      alt={`Photo ${index + 1}`}
                      className="w-full aspect-[4/3] object-cover rounded-xl border shadow-sm"
                    />
                    <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full">
                      {t.photoLabel} {index + 1}
                    </div>
                  </div>
                ))}
              </div>
              {report.photos.length > 4 && (
                <p className="text-sm text-gray-500 mt-3">
                  +{report.photos.length - 4} more photos
                </p>
              )}
            </div>
          )}

          {settings.plan === 'free' && (
            <div className="mt-6 text-xs text-gray-400 text-right">
              {t.watermark}
            </div>
          )}
        </div>
      </div>

      {/* Export Button */}
      <div className="bg-white border-t px-4 py-4">
        <Button
          className="w-full"
          size="lg"
          onClick={handleExport}
          disabled={isGenerating}
        >
          <Download className="w-4 h-4 mr-2" />
          {isGenerating ? `${t.loading} ${pdfProgress}%` : t.exportPDF}
        </Button>
        
        {/* Progress Bar */}
        {isGenerating && pdfProgress > 0 && (
          <div className="mt-3">
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-blue-600 h-2 transition-all duration-300"
                style={{ width: `${pdfProgress}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 text-center mt-1">
              {t.generatingPDF} {pdfProgress}%
            </p>
          </div>
        )}
        
        {settings.plan === 'free' && !isGenerating && (
          <p className="text-xs text-gray-500 text-center mt-2">
            {pdfExportsThisMonth} / {FREE_MAX_PDF_EXPORTS} PDFs this month
          </p>
        )}
      </div>

      {/* Pro Only Modal */}
      <Dialog open={showProModal} onOpenChange={setShowProModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.proOnlyFeature}</DialogTitle>
            <DialogDescription>{t.proOnlyLayoutMessage}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={handleProModalUseStandard} className="flex-1">
              {t.useStandardLayout}
            </Button>
            <Button onClick={() => toast.info('Upgrade feature coming soon')} className="flex-1">
              {t.upgradeNow}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Photo Warning Modal */}
      <Dialog open={showPhotoWarningModal} onOpenChange={setShowPhotoWarningModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.tooManyPhotosTitle}</DialogTitle>
            <DialogDescription>{t.tooManyPhotosMessage}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setShowPhotoWarningModal(false)} className="flex-1">
              {t.goBack}
            </Button>
            <Button onClick={handlePhotoWarningContinue} className="flex-1">
              {t.continueAnyway}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
