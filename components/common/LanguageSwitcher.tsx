import React, { useState, useRef, useEffect } from 'react';
import { useLanguage, supportedLanguages } from '../../contexts/LanguageContext';
import { LanguageIcon } from '../icons/FeatureIcons';

interface LanguageSwitcherProps {
  isScrolled?: boolean; // For landing page transparent header
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ isScrolled }) => {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedLanguage = supportedLanguages.find(l => l.code === language);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-2 font-semibold transition-colors px-3 py-2 rounded-md ${
            isScrolled
            ? 'text-brand-text-light hover:text-brand-text'
            : 'text-white hover:bg-white/10'
        }`}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <LanguageIcon className="w-5 h-5" />
        <span className="hidden sm:inline">{selectedLanguage?.code.toUpperCase()}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 ring-1 ring-black ring-opacity-5">
          {supportedLanguages.map(lang => (
            <button
              key={lang.code}
              onClick={() => {
                setLanguage(lang.code);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2 text-sm ${language === lang.code ? 'bg-brand-gray font-semibold text-brand-text' : 'text-gray-700'} hover:bg-brand-gray`}
            >
              {lang.native} / {lang.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
