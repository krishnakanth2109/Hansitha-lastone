import { toast } from 'sonner';
import { cookieStorage } from './cookieStorage';

// Get voice preference from cookies (defaults to true)
const isVoiceEnabled = () => {
  const stored = cookieStorage.getItem('voice-enabled');
  return stored !== 'false'; // if undefined or "true", return true
};

// Speak message using Web Speech API
function speak(message: string) {
  if (!('speechSynthesis' in window)) return;
  if (speechSynthesis.speaking || speechSynthesis.pending) {
    speechSynthesis.cancel();
  }

  const utterance = new SpeechSynthesisUtterance(message);
  utterance.lang = 'en-US'; // or 'en-IN' if you prefer Indian English
  speechSynthesis.speak(utterance);
}

// Toast + Voice wrapper
export const toastWithVoice = {
  success: (msg: string, options = {}) => {
    if (isVoiceEnabled()) speak(msg);
    toast.success(msg, options);
  },
  error: (msg: string, options = {}) => {
    if (isVoiceEnabled()) speak(msg);
    toast.error(msg, options);
  },
  info: (msg: string, options = {}) => {
    if (isVoiceEnabled()) speak(msg);
    toast(msg, options);
  },
  warning: (msg: string, options = {}) => {
    if (isVoiceEnabled()) speak(msg);
    // sonner doesn't have toast.warning by default — fallback:
    if ((toast as any).warning) {
      (toast as any).warning(msg, options);
    } else {
      toast(msg, options);
    }
  },
};
