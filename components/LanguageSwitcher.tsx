import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';

const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  const buttonStyle = 'px-3 py-1 text-sm font-bold rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400';
  const activeStyle = 'bg-indigo-600 text-white shadow-md';
  const inactiveStyle = 'bg-gray-700 hover:bg-gray-600 text-gray-300';

  return (
    <div className="flex items-center bg-gray-800 rounded-lg p-1">
      <button
        onClick={() => setLanguage('en')}
        className={`${buttonStyle} ${language === 'en' ? activeStyle : inactiveStyle}`}
        aria-pressed={language === 'en'}
      >
        EN
      </button>
      <button
        onClick={() => setLanguage('sw')}
        className={`${buttonStyle} ${language === 'sw' ? activeStyle : inactiveStyle}`}
        aria-pressed={language === 'sw'}
      >
        SW
      </button>
    </div>
  );
};

export default LanguageSwitcher;
