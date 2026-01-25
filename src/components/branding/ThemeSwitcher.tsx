'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Languages, Palette } from 'lucide-react';
import type { Locale } from '@/lib/i18n';
import { locales } from '@/lib/i18n';

export interface BrandingConfig {
  logo?: string;
  primaryColor?: string;
  secondaryColor?: string;
  locale?: Locale;
  customDomain?: string;
}

interface ThemeSwitcherProps {
  onConfigChange?: (config: BrandingConfig) => void;
  showColorPicker?: boolean;
  showLanguageSwitcher?: boolean;
}

export function ThemeSwitcher({
  onConfigChange,
  showColorPicker = true,
  showLanguageSwitcher = true,
}: ThemeSwitcherProps) {
  const [config, setConfig] = useState<BrandingConfig>({
    primaryColor: '#2563EB',
    secondaryColor: '#7C3AED',
    locale: 'zh',
  });

  useEffect(() => {
    // 从localStorage读取配置
    const savedConfig = localStorage.getItem('branding_config');
    if (savedConfig) {
      const parsed = JSON.parse(savedConfig);
      setConfig(parsed);
      applyBranding(parsed);
    }
  }, []);

  const updateConfig = (updates: Partial<BrandingConfig>) => {
    const newConfig = { ...config, ...updates };
    setConfig(newConfig);
    localStorage.setItem('branding_config', JSON.stringify(newConfig));
    applyBranding(newConfig);
    onConfigChange?.(newConfig);
  };

  const applyBranding = (branding: BrandingConfig) => {
    if (branding.primaryColor) {
      document.documentElement.style.setProperty('--brand-primary', branding.primaryColor);
    }
    if (branding.secondaryColor) {
      document.documentElement.style.setProperty('--brand-secondary', branding.secondaryColor);
    }
  };

  const handleColorChange = (type: 'primary' | 'secondary', color: string) => {
    updateConfig({ [`${type}Color`]: color });
  };

  const handleLocaleChange = (locale: Locale) => {
    updateConfig({ locale });
    localStorage.setItem('locale', locale);
    window.location.reload();
  };

  return (
    <div className="flex items-center gap-2">
      {showLanguageSwitcher && (
        <Select value={config.locale} onValueChange={(value: Locale) => handleLocaleChange(value)}>
          <SelectTrigger className="w-[140px]">
            <Languages className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {locales.map((locale) => (
              <SelectItem key={locale} value={locale}>
                {locale === 'zh' ? '中文' : 'English'}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {showColorPicker && (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Palette className="w-4 h-4 text-gray-400" />
            <input
              type="color"
              value={config.primaryColor || '#2563EB'}
              onChange={(e) => handleColorChange('primary', e.target.value)}
              className="w-8 h-8 rounded cursor-pointer border-0"
              title="主题色"
            />
            <input
              type="color"
              value={config.secondaryColor || '#7C3AED'}
              onChange={(e) => handleColorChange('secondary', e.target.value)}
              className="w-8 h-8 rounded cursor-pointer border-0"
              title="辅助色"
            />
          </div>
        </div>
      )}
    </div>
  );
}
