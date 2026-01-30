import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Report, UserSettings, PlanType } from '../types';
import { LanguageCode, getTranslations, Translations } from '../i18n/translations';

interface AppContextType {
  reports: Report[];
  settings: UserSettings;
  t: Translations;
  addReport: (report: Report) => void;
  updateReport: (id: string, updates: Partial<Report>) => void;
  deleteReport: (id: string) => void;
  togglePin: (id: string) => void;
  updateSettings: (settings: Partial<UserSettings>) => void;
  pdfExportsThisMonth: number;
  incrementPdfExports: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY_REPORTS = 'repolog_reports';
const STORAGE_KEY_SETTINGS = 'repolog_settings';
const STORAGE_KEY_PDF_EXPORTS = 'repolog_pdf_exports';

const defaultSettings: UserSettings = {
  language: 'en',
  includeLocation: false,
  plan: 'free',
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [reports, setReports] = useState<Report[]>([]);
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [pdfExportsThisMonth, setPdfExportsThisMonth] = useState(0);

  // Load data from localStorage
  useEffect(() => {
    const loadData = () => {
      try {
        const savedReports = localStorage.getItem(STORAGE_KEY_REPORTS);
        if (savedReports) {
          const parsed = JSON.parse(savedReports);
          // Convert date strings back to Date objects
          const reportsWithDates = parsed.map((r: any) => ({
            ...r,
            createdAt: new Date(r.createdAt),
            photos: r.photos.map((p: any) => ({
              ...p,
              capturedAt: new Date(p.capturedAt),
            })),
          }));
          setReports(reportsWithDates);
        }

        const savedSettings = localStorage.getItem(STORAGE_KEY_SETTINGS);
        if (savedSettings) {
          setSettings(JSON.parse(savedSettings));
        }

        const savedExports = localStorage.getItem(STORAGE_KEY_PDF_EXPORTS);
        if (savedExports) {
          const { count, month } = JSON.parse(savedExports);
          const currentMonth = new Date().getMonth();
          // Reset if different month
          if (month === currentMonth) {
            setPdfExportsThisMonth(count);
          } else {
            setPdfExportsThisMonth(0);
            localStorage.setItem(STORAGE_KEY_PDF_EXPORTS, JSON.stringify({ count: 0, month: currentMonth }));
          }
        }
      } catch (error) {
        console.error('Failed to load data from localStorage:', error);
      }
    };

    loadData();
  }, []);

  // Save reports to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_REPORTS, JSON.stringify(reports));
    } catch (error) {
      console.error('Failed to save reports:', error);
    }
  }, [reports]);

  // Save settings to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }, [settings]);

  const addReport = (report: Report) => {
    setReports((prev) => [report, ...prev]);
  };

  const updateReport = (id: string, updates: Partial<Report>) => {
    setReports((prev) =>
      prev.map((report) => (report.id === id ? { ...report, ...updates } : report))
    );
  };

  const deleteReport = (id: string) => {
    setReports((prev) => prev.filter((report) => report.id !== id));
  };

  const togglePin = (id: string) => {
    setReports((prev) =>
      prev.map((report) =>
        report.id === id ? { ...report, isPinned: !report.isPinned } : report
      )
    );
  };

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const incrementPdfExports = () => {
    const newCount = pdfExportsThisMonth + 1;
    setPdfExportsThisMonth(newCount);
    const currentMonth = new Date().getMonth();
    localStorage.setItem(STORAGE_KEY_PDF_EXPORTS, JSON.stringify({ count: newCount, month: currentMonth }));
  };

  const t = getTranslations(settings.language as LanguageCode);

  return (
    <AppContext.Provider
      value={{
        reports,
        settings,
        t,
        addReport,
        updateReport,
        deleteReport,
        togglePin,
        updateSettings,
        pdfExportsThisMonth,
        incrementPdfExports,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
