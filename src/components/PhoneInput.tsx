'use client';

import PhoneInputWithCountry from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { useLocale } from 'next-intl';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  required?: boolean;
  error?: string;
}

export default function PhoneInput({ value, onChange, label, required, error }: PhoneInputProps) {
  const locale = useLocale();
  
  // Dile göre varsayılan ülke
  const getDefaultCountry = () => {
    switch (locale) {
      case 'tr': return 'TR';
      case 'de': return 'DE';
      case 'fr': return 'FR';
      case 'es': return 'ES';
      case 'ar': return 'SA';
      default: return 'TR';
    }
  };

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <PhoneInputWithCountry
        international
        defaultCountry={getDefaultCountry()}
        value={value}
        onChange={(val) => onChange(val || '')}
        className="phone-input-custom"
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      <style>{`
        .phone-input-custom {
          display: flex;
          align-items: stretch;
          gap: 0.5rem;
        }
        .phone-input-custom .PhoneInputCountry {
          display: flex;
          align-items: center;
          padding: 0 1rem;
          border: 1px solid #d1d5db;
          border-radius: 0.75rem;
          background: white;
          transition: all 0.2s;
        }
        .phone-input-custom .PhoneInputCountry:hover {
          border-color: #9ca3af;
        }
        .phone-input-custom .PhoneInputCountry:focus-within {
          border-color: #1e3a8a;
          box-shadow: 0 0 0 3px rgba(30, 58, 138, 0.1);
        }
        .phone-input-custom .PhoneInputInput {
          flex: 1;
          padding: 0.875rem 1rem;
          border: 1px solid #d1d5db;
          border-radius: 0.75rem;
          font-size: 1rem;
          transition: all 0.2s;
          background: white;
        }
        .phone-input-custom .PhoneInputInput:hover {
          border-color: #9ca3af;
        }
        .phone-input-custom .PhoneInputInput:focus {
          outline: none;
          border-color: #1e3a8a;
          box-shadow: 0 0 0 3px rgba(30, 58, 138, 0.1);
        }
        .phone-input-custom .PhoneInputCountrySelect {
          padding: 0.25rem;
          border: none;
          background: transparent;
          cursor: pointer;
          font-size: 0.875rem;
        }
        .phone-input-custom .PhoneInputCountrySelect:focus {
          outline: none;
        }
        .phone-input-custom .PhoneInputCountryIcon {
          width: 1.75rem;
          height: 1.25rem;
          margin-right: 0.5rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          border-radius: 0.125rem;
        }
        .phone-input-custom .PhoneInputCountrySelectArrow {
          width: 0.5rem;
          height: 0.5rem;
          margin-left: 0.25rem;
          opacity: 0.5;
        }
      `}</style>
    </div>
  );
}

