
import { useCallback, useRef } from 'react';

// This hook uses the Web Audio API to synthesize sounds in the browser,
// removing the need for external audio files and fixing playback errors.

type PlaneSoundNodes = {
  oscillators: OscillatorNode[];
  gainNode: GainNode;
  lfo?: OscillatorNode;
  filter?: BiquadFilterNode;
};

type DrainSoundNodes = {
  noiseSource: AudioBufferSourceNode;
  filterNode: BiquadFilterNode;
  gainNode: GainNode;
};


const useSound = () => {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const playerPlaneSoundNodesRef = useRef<PlaneSoundNodes | null>(null);
  const shadowPlaneSoundNodesRef = useRef<PlaneSoundNodes | null>(null);
  const drainSoundNodesRef = useRef<DrainSoundNodes | null>(null);

  // Initialize AudioContext lazily on the first sound play.
  // This is necessary because browsers require user interaction to start audio.
  const getAudioContext = useCallback(() => {
    if (window && !audioCtxRef.current) {
        try {
            audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        } catch (e) {
            console.error("Web Audio API is not supported in this browser.");
            return null;
        }
    }
    return audioCtxRef.current;
  }, []);


  const playTakeoff = useCallback(() => {
    const audioCtx = getAudioContext();
    if (!audioCtx) return;
    const now = audioCtx.currentTime;

    // --- Thruster Pitch ---
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(100, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.8);
    
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.15, now + 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);

    // --- Noise Whoosh ---
    const bufferSize = audioCtx.sampleRate * 1;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
    }
    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;
    
    const noiseFilter = audioCtx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.setValueAtTime(400, now);
    noiseFilter.frequency.exponentialRampToValueAtTime(5000, now + 0.6);

    const noiseGain = audioCtx.createGain();
    noiseGain.gain.setValueAtTime(0, now);
    noiseGain.gain.linearRampToValueAtTime(0.2, now + 0.05);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 1);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(audioCtx.destination);

    osc.start(now);
    osc.stop(now + 0.8);
    noise.start(now);
    noise.stop(now + 1);
  }, [getAudioContext]);

  const playDing = useCallback(() => {
    const audioCtx = getAudioContext();
    if (!audioCtx) return;
    const now = audioCtx.currentTime;
    
    // A more rewarding, two-tone "success" chime
    const freqs = [987.77, 1318.51]; // B5, E6 - a pleasant interval
    freqs.forEach((freq, i) => {
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        osc.type = 'triangle'; // Softer, more bell-like
        osc.frequency.setValueAtTime(freq, now);
        
        const startTime = now + i * 0.06;
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.25, startTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.4);

        osc.start(startTime);
        osc.stop(startTime + 0.5);
    });
  }, [getAudioContext]);
  
  const playExplosion = useCallback(() => {
    const audioCtx = getAudioContext();
    if (!audioCtx) return;
    const now = audioCtx.currentTime;

    // --- Low-frequency Thump ---
    const thumpOsc = audioCtx.createOscillator();
    const thumpGain = audioCtx.createGain();
    thumpOsc.connect(thumpGain);
    thumpGain.connect(audioCtx.destination);
    
    thumpOsc.type = 'sine';
    thumpOsc.frequency.setValueAtTime(120, now);
    thumpOsc.frequency.exponentialRampToValueAtTime(40, now + 0.2);
    
    thumpGain.gain.setValueAtTime(0.5, now);
    thumpGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);

    // --- Noise Burst ---
    const bufferSize = audioCtx.sampleRate * 0.5;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) { output[i] = Math.random() * 2 - 1; }
    const whiteNoise = audioCtx.createBufferSource();
    whiteNoise.buffer = buffer;
    
    const noiseGain = audioCtx.createGain();
    noiseGain.gain.setValueAtTime(0.3, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
    
    const filter = audioCtx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(4000, now);
    filter.frequency.exponentialRampToValueAtTime(100, now + 0.35);

    whiteNoise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(audioCtx.destination);
    
    thumpOsc.start(now);
    thumpOsc.stop(now + 0.2);
    whiteNoise.start(now);
    whiteNoise.stop(now + 0.5);
  }, [getAudioContext]);
  
  const playBetPlaced = useCallback(() => {
    const audioCtx = getAudioContext();
    if (!audioCtx) return;
    const now = audioCtx.currentTime;

    // A more digital, UI "confirm" blip
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    osc.type = 'square';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.1);
    
    gainNode.gain.setValueAtTime(0.15, now);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);

    osc.start(now);
    osc.stop(now + 0.15);
  }, [getAudioContext]);
  
  const playQuickBet = useCallback(() => {
    const audioCtx = getAudioContext();
    if (!audioCtx) return;
    const now = audioCtx.currentTime;

    // A very short, sharp "tick" for quick UI feedback
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1200, now);
    
    gainNode.gain.setValueAtTime(0.1, now);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);

    osc.start(now);
    osc.stop(now + 0.05);
  }, [getAudioContext]);
  
  const playMissionStart = useCallback(() => {
    const audioCtx = getAudioContext();
    if (!audioCtx) return;

    // More atmospheric chord with softer envelopes
    const notes = [261.63, 329.63, 392.00]; // C4, E4, G4
    const startTime = audioCtx.currentTime;

    notes.forEach((note, i) => {
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        osc.type = 'sine';
        osc.frequency.value = note;
        
        const noteStartTime = startTime + i * 0.08;
        gainNode.gain.setValueAtTime(0, noteStartTime);
        gainNode.gain.linearRampToValueAtTime(0.2, noteStartTime + 0.1); // Slower attack
        gainNode.gain.exponentialRampToValueAtTime(0.0001, noteStartTime + 0.5); // Longer release

        osc.start(noteStartTime);
        osc.stop(noteStartTime + 0.5);
    });
  }, [getAudioContext]);


  const startPlayerPlaneSound = useCallback(() => {
    const audioCtx = getAudioContext();
    if (!audioCtx || playerPlaneSoundNodesRef.current) return;

    // Richer, more stable hum using triangle waves
    const freqs = [110, 110 * 1.5]; // A2, E3
    const oscillators = freqs.map(freq => {
        const osc = audioCtx.createOscillator();
        osc.type = 'triangle'; // Fuller sound than sine
        osc.frequency.value = freq;
        return osc;
    });

    const gainNode = audioCtx.createGain();
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.035, audioCtx.currentTime + 0.5);

    oscillators.forEach(osc => {
      osc.connect(gainNode);
      osc.start();
    });
    gainNode.connect(audioCtx.destination);
    
    playerPlaneSoundNodesRef.current = { oscillators, gainNode };
  }, [getAudioContext]);

  const stopPlayerPlaneSound = useCallback(() => {
    const audioCtx = getAudioContext();
    if (!audioCtx || !playerPlaneSoundNodesRef.current) return;

    const { oscillators, gainNode } = playerPlaneSoundNodesRef.current;
    
    gainNode.gain.cancelScheduledValues(audioCtx.currentTime);
    gainNode.gain.setValueAtTime(gainNode.gain.value, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.3);

    oscillators.forEach(osc => osc.stop(audioCtx.currentTime + 0.3));
    
    playerPlaneSoundNodesRef.current = null;
  }, [getAudioContext]);

  const startShadowPlaneSound = useCallback(() => {
    const audioCtx = getAudioContext();
    if (!audioCtx || shadowPlaneSoundNodesRef.current) return;

    // More menacing, rumbly growl
    const freqs = [60, 60.5];
    const oscillators = freqs.map(freq => {
        const osc = audioCtx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.value = freq;
        return osc;
    });
    
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 800; // Cut off harsh high frequencies

    const gainNode = audioCtx.createGain();
    const lfo = audioCtx.createOscillator();
    const lfoGain = audioCtx.createGain();

    lfo.type = 'sine';
    lfo.frequency.value = 8; // Faster, more agitated vibrato
    lfoGain.gain.value = 2.5; // More depth
    
    lfo.connect(lfoGain);
    
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.03, audioCtx.currentTime + 0.5);

    oscillators.forEach(osc => {
      lfoGain.connect(osc.frequency);
      osc.connect(filter);
      osc.start();
    });
    filter.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    lfo.start();

    shadowPlaneSoundNodesRef.current = { oscillators, gainNode, lfo, filter };
  }, [getAudioContext]);

  const stopShadowPlaneSound = useCallback(() => {
    const audioCtx = getAudioContext();
    if (!audioCtx || !shadowPlaneSoundNodesRef.current) return;

    const { oscillators, gainNode, lfo } = shadowPlaneSoundNodesRef.current;
    
    gainNode.gain.cancelScheduledValues(audioCtx.currentTime);
    gainNode.gain.setValueAtTime(gainNode.gain.value, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.3);
    
    oscillators.forEach(osc => osc.stop(audioCtx.currentTime + 0.3));
    lfo?.stop(audioCtx.currentTime + 0.3);
    
    shadowPlaneSoundNodesRef.current = null;
  }, [getAudioContext]);

  const startDrainSound = useCallback(() => {
    const audioCtx = getAudioContext();
    if (!audioCtx || drainSoundNodesRef.current) return;

    const bufferSize = audioCtx.sampleRate * 2;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) { output[i] = Math.random() * 2 - 1; }
    const noiseSource = audioCtx.createBufferSource();
    noiseSource.buffer = buffer;
    noiseSource.loop = true;

    const filterNode = audioCtx.createBiquadFilter();
    filterNode.type = 'bandpass';
    filterNode.Q.value = 35; // Sharper resonance for a more piercing whine
    filterNode.frequency.value = 300;

    const gainNode = audioCtx.createGain();
    gainNode.gain.value = 0;

    noiseSource.connect(filterNode);
    filterNode.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    noiseSource.start();

    drainSoundNodesRef.current = { noiseSource, filterNode, gainNode };
  }, [getAudioContext]);
  
  const updateDrainSound = useCallback((drainPercentage: number) => {
    const audioCtx = getAudioContext();
    if (!audioCtx || !drainSoundNodesRef.current) return;

    const { gainNode, filterNode } = drainSoundNodesRef.current;
    const clampedDrain = Math.max(0, Math.min(1, drainPercentage));
    
    // Volume increases with drain.
    const targetVolume = clampedDrain * 0.18;
    gainNode.gain.linearRampToValueAtTime(targetVolume, audioCtx.currentTime + 0.05);

    // Pitch rises dramatically to increase tension over a wider range.
    const targetFrequency = 300 + Math.pow(clampedDrain, 2) * 4000;
    filterNode.frequency.linearRampToValueAtTime(targetFrequency, audioCtx.currentTime + 0.05);

  }, [getAudioContext]);

  const stopDrainSound = useCallback(() => {
    const audioCtx = getAudioContext();
    if (!audioCtx || !drainSoundNodesRef.current) return;
    
    const { gainNode, noiseSource } = drainSoundNodesRef.current;
    
    gainNode.gain.cancelScheduledValues(audioCtx.currentTime);
    gainNode.gain.setValueAtTime(gainNode.gain.value, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.3);
    
    noiseSource.stop(audioCtx.currentTime + 0.3);
    
    drainSoundNodesRef.current = null;
  }, [getAudioContext]);


  return { 
    playTakeoff, 
    playDing, 
    playExplosion,
    startPlayerPlaneSound,
    stopPlayerPlaneSound,
    startShadowPlaneSound,
    stopShadowPlaneSound,
    playBetPlaced,
    playQuickBet,
    playMissionStart,
    startDrainSound,
    updateDrainSound,
    stopDrainSound,
  };
};

export default useSound;
