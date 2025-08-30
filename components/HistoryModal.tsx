import React from 'react';
import type { DetailedHistoryItem } from '../types';
import { useTranslation } from '../i18n/useTranslation';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: DetailedHistoryItem[];
  onClear: () => void;
}

const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, onClose, history, onClear }) => {
  const { t } = useTranslation();

  if (!isOpen) {
    return null;
  }

  return (
    <div 
        className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="history-modal-title"
    >
      <div 
        className="bg-gray-900 border border-indigo-500/50 rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col animate-fade-in"
        onClick={e => e.stopPropagation()}
      >
        <header className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 id="history-modal-title" className="text-xl font-bold text-cyan-300">{t('historyModalTitle')}</h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-white transition-colors"
            aria-label={t('closeButton')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        <main className="p-4 overflow-y-auto flex-grow">
          {history.length === 0 ? (
            <div className="text-center text-gray-500 py-12">
              {t('noDetailedHistory')}
            </div>
          ) : (
            <div className="space-y-2">
              {history.map(item => (
                <div key={item.id} className="grid grid-cols-4 gap-2 items-center bg-gray-800/50 p-3 rounded-lg text-center text-sm sm:text-base">
                  <div>
                    <div className="text-xs text-gray-400">{t('historyTableBet')}</div>
                    <div className="font-semibold">{item.betAmount.toFixed(2)}</div>
                  </div>
                   <div>
                    <div className="text-xs text-gray-400">{t('historyTableCashedOut')}</div>
                    <div className="font-semibold">{item.cashedOutAt ? `${item.cashedOutAt.toFixed(2)}x` : '-'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">{t('historyTableCrash')}</div>
                    <div className="font-semibold text-red-400">{item.crashMultiplier.toFixed(2)}x</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">{t('historyTableProfit')}</div>
                    <div className={`font-bold ${item.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {item.profit.toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>

        <footer className="p-4 border-t border-gray-700 text-right">
            {history.length > 0 && (
                <button 
                    onClick={onClear} 
                    className="px-4 py-2 text-sm font-semibold bg-red-800 hover:bg-red-700 text-white rounded-md transition-colors"
                >
                    {t('clearHistoryButton')}
                </button>
            )}
        </footer>
      </div>
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default HistoryModal;
