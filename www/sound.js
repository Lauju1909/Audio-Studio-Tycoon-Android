/**
 * Audio Studio Tycoon - Sound and Audio Shim (sound.js)
 * Provides compatibility for Sound/Audio references, aliasing to AudioEngine.
 */

if (typeof AudioEngine !== 'undefined') {
  window.Sound = AudioEngine;
} else if (typeof TycoonAudioEngine !== 'undefined') {
  window.AudioEngine = new TycoonAudioEngine();
  window.Sound = window.AudioEngine;
}
