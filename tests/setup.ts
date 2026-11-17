import '@testing-library/jest-dom';
import 'fake-indexeddb/auto';

// Mock Web Audio API if needed in tests
if (typeof window !== 'undefined') {
  if (!HTMLCanvasElement.prototype.getContext) {
    (HTMLCanvasElement.prototype as unknown as { getContext: () => unknown }).getContext = () => null;
  }

  window.AudioContext = window.AudioContext || (class AudioContext {
    createGain() {
      return {
        connect: () => {},
        gain: { value: 1, setValueAtTime: () => {} }
      };
    }
    createOscillator() {
      return {
        connect: () => {},
        start: () => {},
        stop: () => {},
        frequency: { setValueAtTime: () => {} }
      };
    }
  } as unknown as typeof AudioContext);
}
