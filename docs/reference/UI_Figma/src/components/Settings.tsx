import React from 'react';
import { useApp } from '../contexts/AppContext';
import { ArrowLeft, Crown } from 'lucide-react';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { toast } from 'sonner';

interface SettingsProps {
  onBack: () => void;
}

const languages = [
  { code: 'en', name: 'English' },
  { code: 'ja', name: '日本語' },
  { code: 'fr', name: 'Français' },
  { code: 'es', name: 'Español' },
  { code: 'de', name: 'Deutsch' },
  { code: 'it', name: 'Italiano' },
  { code: 'pt', name: 'Português' },
  { code: 'ru', name: 'Русский' },
  { code: 'zhHans', name: '简体中文' },
  { code: 'zhHant', name: '繁體中文' },
  { code: 'ko', name: '한국어' },
  { code: 'th', name: 'ไทย' },
  { code: 'id', name: 'Bahasa Indonesia' },
  { code: 'vi', name: 'Tiếng Việt' },
  { code: 'hi', name: 'हिन्दी' },
  { code: 'tr', name: 'Türkçe' },
  { code: 'nl', name: 'Nederlands' },
  { code: 'pl', name: 'Polski' },
  { code: 'sv', name: 'Svenska' },
];

export const Settings: React.FC<SettingsProps> = ({ onBack }) => {
  const { t, settings, updateSettings } = useApp();

  const handleExport = () => {
    // Export all data as JSON
    const data = {
      reports: localStorage.getItem('repolog_reports'),
      settings: localStorage.getItem('repolog_settings'),
      exportDate: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `repolog_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Backup exported');
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);
          
          if (data.reports) {
            localStorage.setItem('repolog_reports', data.reports);
          }
          if (data.settings) {
            localStorage.setItem('repolog_settings', data.settings);
          }
          
          toast.success('Backup imported. Please reload the page.');
          setTimeout(() => window.location.reload(), 2000);
        } catch (error) {
          toast.error('Failed to import backup');
        }
      };
      reader.readAsText(file);
    };

    input.click();
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* AppBar */}
      <header className="bg-white border-b px-4 py-3 flex items-center">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-lg font-semibold ml-3">{t.settings}</h1>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-2xl mx-auto space-y-4">
          {/* General Settings */}
          <Card>
            <CardHeader>
              <CardTitle>{t.general}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Language */}
              <div className="space-y-2">
                <Label>{t.language}</Label>
                <Select
                  value={settings.language}
                  onValueChange={(value) => updateSettings({ language: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Location Toggle */}
              <div className="flex items-center justify-between">
                <Label>{t.includeLocationInPDF}</Label>
                <Switch
                  checked={settings.includeLocation}
                  onCheckedChange={(checked) => updateSettings({ includeLocation: checked })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Plan Settings */}
          <Card>
            <CardHeader>
              <CardTitle>{t.plan}</CardTitle>
              <CardDescription>
                {t.currentPlan}: <Badge variant={settings.plan === 'pro' ? 'default' : 'secondary'}>
                  {settings.plan === 'pro' ? t.proPlan : t.freePlan}
                </Badge>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {settings.plan === 'free' ? (
                <>
                  <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Crown className="w-5 h-5 text-yellow-600 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-yellow-900 mb-1">
                          Upgrade to Pro
                        </h3>
                        <ul className="text-sm text-yellow-800 space-y-1">
                          <li>• Unlimited photos per report</li>
                          <li>• Unlimited PDF exports</li>
                          <li>• Large layout (1 photo/page)</li>
                          <li>• No watermark</li>
                          <li>• No ads</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <Button 
                    className="w-full" 
                    onClick={() => {
                      // Demo: upgrade to pro
                      updateSettings({ plan: 'pro' });
                      toast.success('Upgraded to Pro (Demo)');
                    }}
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    {t.upgradeToPro}
                  </Button>
                  <p className="text-xs text-center text-gray-500">
                    $1.99/month • $19.99/year • $39.99 lifetime
                  </p>
                </>
              ) : (
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4 text-center">
                  <Crown className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <p className="font-semibold text-blue-900">
                    You're on Pro Plan
                  </p>
                  <p className="text-sm text-blue-700 mt-1">
                    Thank you for your support!
                  </p>
                </div>
              )}
              
              <Button variant="outline" className="w-full" onClick={() => toast.info('Restore feature coming soon')}>
                {t.restorePurchases}
              </Button>
            </CardContent>
          </Card>

          {/* Backup */}
          <Card>
            <CardHeader>
              <CardTitle>{t.backup}</CardTitle>

            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full" onClick={handleExport}>
                {t.exportBackup}
              </Button>
              <Button variant="outline" className="w-full" onClick={handleImport}>
                {t.importBackup}
              </Button>
            </CardContent>
          </Card>

          {/* About */}
          <Card>
            <CardHeader>
              <CardTitle>{t.about}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="ghost" className="w-full justify-start" onClick={() => toast.info('Coming soon')}>
                {t.privacyPolicy}
              </Button>
              <Button variant="ghost" className="w-full justify-start" onClick={() => toast.info('Coming soon')}>
                {t.termsOfService}
              </Button>
              <Separator className="my-2" />
              <div className="text-sm text-gray-500 text-center">
                Repolog v1.0.0
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
