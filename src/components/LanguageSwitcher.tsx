import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown } from 'lucide-react';
import { TR } from 'country-flag-icons/react/3x2';
import { GB } from 'country-flag-icons/react/3x2';
import { DE } from 'country-flag-icons/react/3x2';
import { FR } from 'country-flag-icons/react/3x2';
import { ES } from 'country-flag-icons/react/3x2';
import { SA } from 'country-flag-icons/react/3x2';

const languages = [
  { code: 'tr', name: 'Türkçe', Flag: TR },
  { code: 'en', name: 'English', Flag: GB },
  { code: 'de', name: 'Deutsch', Flag: DE },
  { code: 'fr', name: 'Français', Flag: FR },
  { code: 'es', name: 'Español', Flag: ES },
  { code: 'ar', name: 'العربية', Flag: SA }
];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code);
    localStorage.setItem('language', code);
    setIsOpen(false);
  };

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];
  const CurrentFlag = currentLanguage.Flag;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-gray-50 transition-all group"
      >
        <div className="relative">
          <CurrentFlag className="w-6 h-4 rounded-sm shadow-sm ring-1 ring-black/5" />
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 py-1 z-20 overflow-hidden">
            {languages.map((lang) => {
              const LangFlag = lang.Flag;
              const isActive = i18n.language === lang.code;
              return (
                <button
                  key={lang.code}
                  onClick={() => changeLanguage(lang.code)}
                  className={`w-full px-3 py-2.5 text-left transition-colors flex items-center gap-3 ${
                    isActive 
                      ? 'bg-blue-50 text-blue-900' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <LangFlag className="w-6 h-4 rounded-sm shadow-sm ring-1 ring-black/5 flex-shrink-0" />
                  <span className={`text-sm flex-1 ${isActive ? 'font-medium' : ''}`}>
                    {lang.name}
                  </span>
                  {isActive && (
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}


