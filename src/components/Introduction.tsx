
import React from 'react';
import { THEORETICAL_RTP } from '../constants';

interface IntroductionProps {
  onStartGame: () => void;
}

const Introduction: React.FC<IntroductionProps> = ({ onStartGame }) => {
  return (
    <div className="w-full max-w-2xl mx-auto bg-black bg-opacity-40 rounded-xl border border-indigo-500/30 p-6 sm:p-8 text-center animate-fade-in">
      <h1 className="text-3xl sm:text-4xl font-bold text-cyan-300 drop-shadow-[0_0_8px_rgba(100,200,255,0.8)]">Welcome to Shadow Flight</h1>
      <p className="text-indigo-200 mt-2">Your high-stakes mission briefing.</p>
      
      <div className="text-left mt-8 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-white mb-2">OBJECTIVE</h2>
          <p className="text-gray-300">Your goal is to cash out with the highest multiplier possible before the enemy "shadow" plane catches you. Winning requires skill, nerve, and a bit of luck.</p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-white mb-2">HOW TO PLAY</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-300">
            <li><span className="font-semibold text-white">Place Your Bet:</span> Set your bet for the upcoming round.</li>
            <li><span className="font-semibold text-white">Watch the Flight:</span> The plane flies upwards as the multiplier increases.</li>
            <li><span className="font-semibold text-white">Beware the Shadow:</span> A red shadow plane gives chase with unpredictable speed. If it catches you, you lose your bet.</li>
            <li><span className="font-semibold text-white">Cash Out to Win:</span> Click "Cash Out" to lock in your winnings (Bet x Multiplier).</li>
          </ol>
        </div>

        <div>
            <h2 className="text-xl font-bold text-white mb-2">NEW MECHANICS</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
                <li><span className="font-semibold text-yellow-400">Adaptive Challenge:</span> The game adapts to your performance. The "Challenge Level" indicator shows the current intensity.</li>
                <li><span className="font-semibold text-green-400">Safe Zones:</span> Occasionally, a "Safe Zone" round will occur, giving you a rare chance for a much higher payout!</li>
                 <li><span className="font-semibold text-cyan-400">Fair & Volatile:</span> The game targets a theoretical ~{THEORETICAL_RTP}% Return-to-Player (RTP). Most rounds crash early, but rare, massive multipliers are possible.</li>
            </ul>
        </div>
      </div>
      
      <button 
        onClick={onStartGame}
        className="mt-10 w-full md:w-auto px-10 py-4 text-xl font-bold bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-700 transition-all duration-200 rounded-lg shadow-lg transform active:scale-95"
      >
        Begin Mission
      </button>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Introduction;
