import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { updateUserSoundPreference } from '@/lib/firestore-helpers';

export type SoundType = 'off' | 'click' | 'typewriter' | 'hitmarker' | 'rubber' | 'pop' | 'error';

const SOUND_TYPES: Exclude<SoundType, 'off'>[] = ['click', 'typewriter', 'hitmarker', 'rubber', 'pop'];
const DEFAULT_VOLUME = 0.5; // Lowered volume as requested

interface SoundContextType {
    currentSound: SoundType;
    setSound: (sound: SoundType) => void;
    play: () => void;
    playError: () => void;
    previewSound: (sound: SoundType) => void;
    muted: boolean;
    toggleMute: () => void;
    sounds: SoundType[];
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export const SoundProvider = ({ children }: { children: React.ReactNode }) => {
    const { user } = useAuth();
    const [currentSound, setCurrentSound] = useState<SoundType>('off');
    const [muted, setMuted] = useState<boolean>(false);

    const audioContextRef = useRef<AudioContext | null>(null);
    const audioBuffersRef = useRef<Record<string, AudioBuffer[]>>({});
    const gainNodeRef = useRef<GainNode | null>(null);

    // Initialize AudioContext
    useEffect(() => {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
            const ctx = new AudioContextClass();
            const gainNode = ctx.createGain();
            gainNode.gain.value = DEFAULT_VOLUME;
            gainNode.connect(ctx.destination);

            audioContextRef.current = ctx;
            gainNodeRef.current = gainNode;
        }
    }, []);

    // Load preferences (Sound Type & Mute)
    useEffect(() => {
        // Sound Type
        const storedSound = localStorage.getItem('soundPreference') as SoundType;
        if (storedSound && (storedSound === 'off' || SOUND_TYPES.includes(storedSound as any))) {
            setCurrentSound(storedSound);
        }

        // Mute State (Local only)
        const storedMute = localStorage.getItem('soundMuted');
        if (storedMute !== null) {
            setMuted(storedMute === 'true');
        }

        if (user) {
            import('@/lib/firestore-helpers').then(({ getUserProfile }) => {
                getUserProfile(user.uid).then(profile => {
                    const pref = profile?.soundPreference as SoundType;
                    if (pref && (pref === 'off' || SOUND_TYPES.includes(pref as any))) {
                        setCurrentSound(pref);
                        localStorage.setItem('soundPreference', pref);
                    }
                });
            });
        }
    }, [user]);

    // Preload sounds
    const loadSounds = useCallback(async (type: SoundType) => {
        if (type === 'off' || !audioContextRef.current) return;
        if (audioBuffersRef.current[type] && audioBuffersRef.current[type].length > 0) return;

        const buffers: AudioBuffer[] = [];
        const MAX_VARIATIONS = 20;

        for (let i = 1; i <= MAX_VARIATIONS; i++) {
            const path = `/sounds/${type}_${i}.wav`;
            try {
                const response = await fetch(path);
                if (!response.ok) {
                    if (i === 1) break;
                    break;
                }
                const arrayBuffer = await response.arrayBuffer();
                const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
                buffers.push(audioBuffer);
            } catch (error) {
                console.warn(`Stopped loading variations for ${type} at index ${i}`, error);
                break;
            }
        }

        if (buffers.length > 0) {
            audioBuffersRef.current[type] = buffers;
        }
    }, []);

    useEffect(() => {
        loadSounds(currentSound);
        if (currentSound !== 'off') {
            loadSounds('error');
        }
    }, [currentSound, loadSounds]);

    const playSound = useCallback((type: SoundType) => {
        if (muted || type === 'off' || !audioContextRef.current || !gainNodeRef.current) return;

        const buffers = audioBuffersRef.current[type];
        if (!buffers || buffers.length === 0) return;

        if (audioContextRef.current.state === 'suspended') {
            audioContextRef.current.resume().catch(() => { });
        }

        const randomBuffer = buffers[Math.floor(Math.random() * buffers.length)];
        const source = audioContextRef.current.createBufferSource();
        source.buffer = randomBuffer;

        source.connect(gainNodeRef.current);
        source.start(0);
    }, [muted]);

    const playError = useCallback(() => {
        playSound('error');
    }, [playSound]);

    const play = useCallback(() => {
        playSound(currentSound);
    }, [playSound, currentSound]);

    const previewSound = useCallback(async (type: SoundType) => {
        if (type === 'off') return;

        // Ensure sound is loaded before playing
        await loadSounds(type);

        // We bypass the 'muted' check for preview? Or respect it?
        // User request: "preview on selecting... so user know what... they gonna hear"
        // If muted, they won't hear it. But usually preview forces sound.
        // Let's use internal playSound logic which respects mute.
        // If user wants to hear it, they should unmute.
        // However, we need to pass the type explicitly.

        playSound(type);
    }, [loadSounds, playSound]);

    const setSound = useCallback(async (newSound: SoundType) => {
        setCurrentSound(newSound);
        localStorage.setItem('soundPreference', newSound);
        if (user) {
            await updateUserSoundPreference(user.uid, newSound);
        }
        loadSounds(newSound);
    }, [user, loadSounds]);

    const toggleMute = useCallback(() => {
        setMuted(prev => {
            const newValue = !prev;
            localStorage.setItem('soundMuted', String(newValue));
            return newValue;
        });
    }, []);

    const sounds = ['off', ...SOUND_TYPES] as SoundType[];

    return (
        <SoundContext.Provider value={{ currentSound, setSound, play, playError, previewSound, muted, toggleMute, sounds }}>
            {children}
        </SoundContext.Provider>
    );
};

export const useTypingSound = () => {
    const context = useContext(SoundContext);
    if (context === undefined) {
        throw new Error("useTypingSound must be used within a SoundProvider");
    }
    return context;
};
