import { useState } from 'react';
import { AppProvider } from './contexts/AppContext';
import { Home } from './components/Home';
import { ReportEditor } from './components/ReportEditor';
import { PDFPreview } from './components/PDFPreview';
import { Settings } from './components/Settings';
import { Report } from './types';
import { Toaster } from './components/ui/sonner';

type Screen = 'home' | 'reportEditor' | 'pdfPreview' | 'settings';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const handleNewReport = () => {
    setSelectedReport(null);
    setCurrentScreen('reportEditor');
  };

  const handleEditReport = (report: Report) => {
    setSelectedReport(report);
    setCurrentScreen('reportEditor');
  };

  const handleOpenPDFPreview = (report: Report) => {
    setSelectedReport(report);
    setCurrentScreen('pdfPreview');
  };

  const handleOpenSettings = () => {
    setCurrentScreen('settings');
  };

  const handleBack = () => {
    setCurrentScreen('home');
    setSelectedReport(null);
  };

  return (
    <AppProvider>
      <div className="h-screen w-full overflow-hidden">
        {currentScreen === 'home' && (
          <Home
            onNewReport={handleNewReport}
            onEditReport={handleEditReport}
            onOpenSettings={handleOpenSettings}
          />
        )}
        
        {currentScreen === 'reportEditor' && (
          <ReportEditor
            report={selectedReport}
            onBack={handleBack}
            onOpenPDFPreview={handleOpenPDFPreview}
          />
        )}
        
        {currentScreen === 'pdfPreview' && selectedReport && (
          <PDFPreview
            report={selectedReport}
            onBack={handleBack}
          />
        )}
        
        {currentScreen === 'settings' && (
          <Settings onBack={handleBack} />
        )}
        
        <Toaster />
      </div>
    </AppProvider>
  );
}
