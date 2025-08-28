import React, { createContext, useState, useContext, useMemo, useCallback } from 'react';
import { availableLanguages } from './index';
import type { Language } from './index';

// By embedding the translations directly, we avoid issues with JSON module imports
// and the 'assert' syntax, ensuring maximum browser compatibility without async loading.
const enTranslations = {
  "welcomeTitle": "Welcome to Shadow Flight",
  "welcomeSubtitle": "Your high-stakes mission briefing.",
  "objectiveTitle": "OBJECTIVE",
  "objectiveText": "Your goal is to cash out with the highest multiplier possible before the enemy \"shadow\" plane crashes your mission. Winning requires skill, nerve, and a bit of luck.",
  "howToPlayTitle": "HOW TO PLAY",
  "howToPlayStep1": "Place Your Bet:",
  "howToPlayStep1Text": "Set your bet for the upcoming round.",
  "howToPlayStep2": "Watch the Flight:",
  "howToPlayStep2Text": "The plane flies upwards as the multiplier increases.",
  "howToPlayStep3": "Beware the Shadow:",
  "howToPlayStep3Text": "A red shadow plane pursues you. The closer it gets, the more it drains your potential payout!",
  "howToPlayStep4": "Cash Out to Win:",
  "howToPlayStep4Text": "Click \"Cash Out\" to secure your winnings before the shadow catches you and ends the round.",
  "newMechanicsTitle": "NEW MECHANICS",
  "mechanicAdaptive": "Adaptive Challenge:",
  "mechanicAdaptiveText": "The game adapts to your performance. The \"Challenge Level\" indicator shows the current intensity.",
  "mechanicSafeZones": "Safe Zones:",
  "mechanicSafeZonesText": "Occasionally, a \"Safe Zone\" round will occur, giving you a rare chance for a much higher payout!",
  "mechanicFair": "Fair & Volatile:",
  "mechanicFairText": "The game targets a theoretical ~{rtp}% Return-to-Player (RTP). Most rounds crash early, but rare, massive multipliers are possible.",
  "beginMissionButton": "Begin Mission",
  "creatorCredit": "A game by Salmin Habibu",
  "lastCrashes": "Last crashes:",
  "noHistory": "No history yet.",
  "awaitingMission": "AWAITING MISSION BRIEF...",
  "connectingCommand": "Connecting to command...",
  "missionBriefing": "MISSION BRIEFING",
  "takeoffIn": "Takeoff in",
  "crashed": "CRASHED!",
  "payout": "Payout:",
  "safeZone": "SAFE ZONE",
  "betAmount": "Bet Amount",
  "placeBetButton": "Place Bet",
  "cashOutButton": "Cash Out",
  "cashedOut": "Cashed Out!",
  "getReady": "Get Ready...",
  "roundOver": "Round Over",
  "balance": "Balance:",
  "challenge": "Challenge:",
  "challengeLow": "Low",
  "challengeNormal": "Normal",
  "challengeHigh": "High",
  "challengeIntense": "Intense",
  "footerDisclaimer": "Disclaimer: This is a simulation game for entertainment purposes only. No real money is involved.",
  "footerCreator": "Shadow Flight - Created by Salmin Habibu",
  "footerRtp": "Theoretical RTP: ~{rtp}%",
  "missions": [
    "Callsign: Ghost-7. Objective: Io Relay. Status: Anomalous energy signature detected. Pushing the core.",
    "Callsign: Viper-1. Target: Ganymede Station. Status: Shadow vessel on an intercept course. Engaging thrusters.",
    "Callsign: Nomad-3. Destination: Titan's Veil. Status: Entering asteroid cluster. Evasive maneuvers.",
    "Callsign: Warlock-9. Objective: Europa's Core. Status: Unidentified craft closing fast. Maximum power.",
    "Callsign: Eagle-4. Target: Mars Outpost Omega. Status: Hostile lock-on detected. Time to fly."
  ],
  "manualBet": "Manual",
  "autoBet": "Auto",
  "startAutoBetButton": "Start Auto-Bet",
  "stopAutoBetButton": "Stop Auto-Bet",
  "roundsLeft": "{count} rounds left",
  "numberOfRounds": "Number of Rounds",
  "stopOnProfit": "Stop on Profit >=",
  "stopOnLoss": "Stop on Loss >=",
  "optionalPlaceholder": "Optional"
};

const swTranslations = {
  "welcomeTitle": "Karibu Kwenye Shadow Flight",
  "welcomeSubtitle": "Maelezo yako ya misheni ya hatari.",
  "objectiveTitle": "LENGO",
  "objectiveText": "Lengo lako ni kutoa pesa na kizidisho cha juu zaidi kabla ya ndege ya adui \"kivuli\" kuharibu misheni yako. Kushinda kunahitaji ujuzi, ujasiri, na bahati kidogo.",
  "howToPlayTitle": "JINSI YA KUCHEZA",
  "howToPlayStep1": "Weka Dau Lako:",
  "howToPlayStep1Text": "Weka dau lako kwa ajili ya raundi inayokuja.",
  "howToPlayStep2": "Tazama Ndege:",
  "howToPlayStep2Text": "Ndege inapanda juu huku kizidisho kikiongezeka.",
  "howToPlayStep3": "Jihadhari na Kivuli:",
  "howToPlayStep3Text": "Ndege nyekundu ya kivuli inakufukuza. Kadiri inavyokaribia, ndivyo inavyopunguza malipo yako!",
  "howToPlayStep4": "Toa Pesa Ushinde:",
  "howToPlayStep4Text": "Bofya \"Toa Pesa\" ili kupata ushindi wako kabla ya kivuli kukukamata na kumaliza raundi.",
  "newMechanicsTitle": "MBINU MPYA",
  "mechanicAdaptive": "Changamoto Inayojibadilisha:",
  "mechanicAdaptiveText": "Mchezo unajibadilisha kulingana na uchezaji wako. Kiashiria cha \"Kiwango cha Changamoto\" kinaonyesha ukali wa sasa.",
  "mechanicSafeZones": "Maeneo Salama:",
  "mechanicSafeZonesText": "Mara kwa mara, raundi ya \"Eneo Salama\" itatokea, ikikupa nafasi adimu ya malipo makubwa zaidi!",
  "mechanicFair": "Haki na Tete:",
  "mechanicFairText": "Mchezo unalenga kinadharia ~{rtp}% ya Marejesho kwa Mchezaji (RTP). Raundi nyingi huanguka mapema, lakini vizidisho vikubwa na adimu vinawezekana.",
  "beginMissionButton": "Anza Misheni",
  "creatorCredit": "Mchezo na Salmin Habibu",
  "lastCrashes": "Ajali za mwisho:",
  "noHistory": "Hakuna historia bado.",
  "awaitingMission": "INASUBIRI MAAGIZO YA MISHENI...",
  "connectingCommand": "Inaunganisha na kituo...",
  "missionBriefing": "MAELEZO YA MISHENI",
  "takeoffIn": "Inapaa baada ya",
  "crashed": "IMEANGUKA!",
  "payout": "Malipo:",
  "safeZone": "ENEO SALAMA",
  "betAmount": "Kiasi cha Dau",
  "placeBetButton": "Weka Dau",
  "cashOutButton": "Toa Pesa",
  "cashedOut": "Umetoa Pesa!",
  "getReady": "Jitayarishe...",
  "roundOver": "Raundi Imeisha",
  "balance": "Salio:",
  "challenge": "Changamoto:",
  "challengeLow": "Chini",
  "challengeNormal": "Kawaida",
  "challengeHigh": "Juu",
  "challengeIntense": "Kali",
  "footerDisclaimer": "Kanusho: Huu ni mchezo wa kuiga kwa madhumuni ya burudani tu. Hakuna pesa halisi inayohusika.",
  "footerCreator": "Shadow Flight - Imeundwa na Salmin Habibu",
  "footerRtp": "RTP ya Kinadharia: ~{rtp}%",
  "missions": [
    "Jina la wito: Ghost-7. Lengo: Io Relay. Hali: Nishati isiyo ya kawaida imegunduliwa. Inasukuma kiini.",
    "Jina la wito: Viper-1. Lengo: Kituo cha Ganymede. Hali: Chombo cha kivuli kiko kwenye mkondo wa kukatiza. Inawasha virushio.",
    "Jina la wito: Nomad-3. Mwisho: Pazia la Titan. Hali: Inaingia kwenye nguzo ya asteroidi. Miondoko ya kukwepa.",
    "Jina la wito: Warlock-9. Lengo: Kiini cha Europa. Hali: Chombo kisichojulikana kinakaribia haraka. Nguvu ya juu.",
    "Jina la wito: Eagle-4. Lengo: Kituo cha Mars Omega. Hali: Kufungwa kwa adui kumegunduliwa. Wakati wa kuruka."
  ],
  "manualBet": "Mwongozo",
  "autoBet": "Otomatiki",
  "startAutoBetButton": "Anza Dau Otomatiki",
  "stopAutoBetButton": "Simamisha Dau Otomatiki",
  "roundsLeft": "Raundi {count} zimesalia",
  "numberOfRounds": "Idadi ya Raundi",
  "stopOnProfit": "Simamisha kwa faida >=",
  "stopOnLoss": "Simamisha kwa hasara >=",
  "optionalPlaceholder": "Hiari"
};

// Create a map of language codes to their translation modules. This bundles the translations with the app.
const translationsData = {
  en: enTranslations,
  sw: swTranslations,
};

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  translations: any; // It will never be null now
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const getInitialLanguage = (): Language => {
    // Check localStorage for a saved language preference.
    const storedLang = localStorage.getItem('language') as Language;
    if (storedLang && availableLanguages.includes(storedLang)) {
      return storedLang;
    }
    // Fallback to the user's browser language if supported.
    const browserLang = navigator.language.split('-')[0] as Language;
    return availableLanguages.includes(browserLang) ? browserLang : 'en';
  };

  const [language, _setLanguage] = useState<Language>(getInitialLanguage);

  // The translations are now directly selected from the imported object map.
  // This is synchronous and requires no fetching.
  const translations = translationsData[language];
  
  // Persist language changes to localStorage.
  const setLanguage = useCallback((lang: Language) => {
    localStorage.setItem('language', lang);
    _setLanguage(lang);
  }, []);

  const value = useMemo(() => ({
    language,
    setLanguage,
    translations,
  }), [language, setLanguage, translations]);
  
  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
