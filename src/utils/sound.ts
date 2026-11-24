import { useStore } from '@/store/useStore';

let audioCtx: AudioContext | null = null;
let lastPlayTime = 0;

/** Retrieves or initializes the lazy singleton AudioContext */
function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioCtxClass) {
      audioCtx = new AudioCtxClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export type SoundType = 'click' | 'pop' | 'success' | 'error' | 'neutral';

/**
 * Synthesizes short, crisp, pleasant sound effects via Web Audio API.
 * Requires 0 external audio assets and operates 100% offline with zero latency.
 */
export function playClickSound(type: SoundType = 'click') {
  try {
    const isEnabled = useStore.getState().soundEnabled;
    if (!isEnabled) return;

    const nowMs = performance.now();
    // Prevent duplicate triggers if pointerdown and click fire together
    if ((type === 'click' || type === 'neutral') && nowMs - lastPlayTime < 35) return;
    lastPlayTime = nowMs;

    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    if (type === 'click' || type === 'neutral') {
      // Tactile, crisp wooden/mechanical micro-click
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // Subtle pitch variation for an organic, responsive feel
      const baseFreq = 820 + (Math.random() * 50 - 25);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.038);

      gain.gain.setValueAtTime(0.24, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.038);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.04);
    } else if (type === 'pop') {
      // Soft bubble pop
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.05);

      gain.gain.setValueAtTime(0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.055);
    } else if (type === 'success') {
      // Cheerful two-tone positive chime
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'sine';

      osc1.frequency.setValueAtTime(523.25, now); // C5
      osc1.frequency.setValueAtTime(659.25, now + 0.06); // E5
      osc2.frequency.setValueAtTime(1046.5, now + 0.06); // C6

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc1.stop(now + 0.18);
      osc2.start(now + 0.06);
      osc2.stop(now + 0.18);
    } else if (type === 'error') {
      // Gentle, non-punishing low feedback thud
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.08);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.085);
    }
  } catch {
    // Gracefully handle browser sound restrictions
  }
}

/**
 * Installs a global click listener that plays a click sound on every pointerdown
 * interaction across all buttons, cards, links, tabs, sliders, and canvas elements.
 */
export function initGlobalClickSound(): () => void {
  if (typeof window === 'undefined') return () => {};

  const handlePointerDown = () => {
    playClickSound('click');
  };

  window.addEventListener('pointerdown', handlePointerDown, { capture: true, passive: true });

  return () => {
    window.removeEventListener('pointerdown', handlePointerDown, { capture: true });
  };
}

export const playFeedbackSound = playClickSound;

