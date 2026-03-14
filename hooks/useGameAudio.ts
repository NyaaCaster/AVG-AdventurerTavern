
import { useRef, useEffect } from 'react';
import { GameSettings, SceneId } from '../types';
import { SCENE_BGM, BATTLE_BGM } from '../data/resources/audioResources';
import { resolveImgPath } from '../utils/imagePath';

export const useGameAudio = (
  currentSceneId: SceneId, 
  settings: GameSettings,
  isInBattle: boolean = false
) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const fadeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Volume effect
  useEffect(() => {
    if (audioRef.current && !fadeIntervalRef.current) {
        audioRef.current.volume = settings.isMuted ? 0 : Math.max(0, Math.min(1, settings.masterVolume / 100));
    }
  }, [settings.masterVolume, settings.isMuted]);

  // BGM Switching & Fading
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const bgmFile = isInBattle ? BATTLE_BGM : SCENE_BGM[currentSceneId];
    const targetSrc = bgmFile ? resolveImgPath(bgmFile) : "";
    const maxVolume = settings.isMuted ? 0 : Math.max(0, Math.min(1, settings.masterVolume / 100));

    if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current);
        fadeIntervalRef.current = null;
    }

    // If same track, ensure volume is correct
    if (audio.src === targetSrc) {
        if (!audio.paused && audio.volume < maxVolume) {
             const stepTime = 50;
             const stepVol = maxVolume / 10; 
             fadeIntervalRef.current = setInterval(() => {
                 if (audio.volume >= maxVolume - 0.01) {
                     audio.volume = maxVolume;
                     if(fadeIntervalRef.current) { clearInterval(fadeIntervalRef.current); fadeIntervalRef.current = null; }
                 } else {
                     audio.volume = Math.min(maxVolume, audio.volume + stepVol);
                 }
             }, stepTime);
        } else if (!audio.paused) {
            audio.volume = maxVolume;
        }
        return;
    }

    const FADE_OUT_DURATION = 800;
    const FADE_IN_DURATION = 1500;
    const STEP_INTERVAL = 50;

    const startFadeIn = () => {
        if (!targetSrc) {
            audio.pause();
            audio.src = "";
            return;
        }
        
        audio.src = targetSrc;
        audio.volume = 0;
        audio.play().catch(err => console.warn("BGM Playback Error:", err));

        const steps = FADE_IN_DURATION / STEP_INTERVAL;
        const volStep = maxVolume / steps;

        fadeIntervalRef.current = setInterval(() => {
            if (audio.volume >= maxVolume - 0.01) {
                audio.volume = maxVolume;
                if(fadeIntervalRef.current) { clearInterval(fadeIntervalRef.current); fadeIntervalRef.current = null; }
            } else {
                audio.volume = Math.min(maxVolume, audio.volume + volStep);
            }
        }, STEP_INTERVAL);
    };

    if (!audio.paused && audio.src && audio.volume > 0) {
        const steps = FADE_OUT_DURATION / STEP_INTERVAL;
        const volStep = audio.volume / steps;

        fadeIntervalRef.current = setInterval(() => {
            if (audio.volume <= 0.01) {
                audio.volume = 0;
                if(fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
                startFadeIn();
            } else {
                audio.volume = Math.max(0, audio.volume - volStep);
            }
        }, STEP_INTERVAL);
    } else {
        startFadeIn();
    }

  }, [currentSceneId, isInBattle]);

  return audioRef;
};
