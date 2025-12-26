import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import {
    calculateWPM,
    calculateAccuracy,
    getRandomPassage
} from '../lib/typing-utils';
import {
    getStoredBest,
    getAllStoredBests,
    setStoredBest,
    isNewHighScore as checkNewHighScore,
    isFirstTest as checkFirstTest,
    type StoredBest,
    type Difficulty
} from '../lib/storage';
import { fireConfetti, fireBaseline } from '../lib/confetti';

// Types
export type Mode = 'timed' | 'passage';
export type GameStatus = 'ready' | 'active' | 'finished';

interface GameState {
    // Configuration
    difficulty: Difficulty;
    mode: Mode;
    customText: string;

    // Game Status
    status: GameStatus;
    isFocused: boolean;
    startTime: number | null;
    endTime: number | null;

    // Text & Input
    text: string;
    userInput: string;

    // Timer
    timeLeft: number;
    timerCount: number;
    initialTime: number;

    // Stats
    wpm: number;
    accuracy: number;
    errorCount: number;
    errorIndices: Set<number>;

    // Personal Bests (Map of difficulty -> best)
    personalBests: Record<Difficulty, StoredBest | null>;

    // Result Flags
    wasNewHighScore: boolean;
    wasFirstTest: boolean;
    previousBestWpm: number | null;
}

interface GameActions {
    // Configuration
    setDifficulty: (difficulty: Difficulty) => void;
    setMode: (mode: Mode) => void;
    setFocused: (focused: boolean) => void;
    setCustomText: (text: string) => void;

    // Game Flow
    initGame: () => void;
    finishGame: () => void;
    resetGame: () => void;

    // Input
    handleInput: (value: string) => void;

    // Timer
    tick: () => void;

    // Persistence
    loadPersonalBests: () => void;
}

type GameStore = GameState & GameActions;

const DEFAULT_TIME = 60;

const initialState: GameState = {
    difficulty: 'hard',
    mode: 'passage',
    customText: '',
    status: 'ready',
    isFocused: true,
    startTime: null,
    endTime: null,
    text: '',
    userInput: '',
    timeLeft: DEFAULT_TIME,
    initialTime: DEFAULT_TIME,
    timerCount: 0,
    wpm: 0,
    accuracy: 100,
    errorCount: 0,
    errorIndices: new Set(),
    personalBests: {
        easy: null,
        medium: null,
        hard: null,
        custom: null
    },
    wasNewHighScore: false,
    wasFirstTest: false,
    previousBestWpm: null,
};

export const useGameStore = create<GameStore>((set, get) => ({
    ...initialState,

    setDifficulty: (difficulty) => {
        set({ difficulty });
        get().initGame();
    },

    setMode: (mode) => {
        const initialTime = mode === 'timed' ? DEFAULT_TIME : 0;
        set({ mode, initialTime, timeLeft: initialTime });
        get().initGame();
    },

    setCustomText: (text) => {
        set({ customText: text, difficulty: 'custom', mode: 'passage' });
        get().initGame();
    },

    setFocused: (isFocused) => {
        set({ isFocused });
    },

    loadPersonalBests: () => {
        const bests = getAllStoredBests();
        set({ personalBests: bests });
    },

    initGame: () => {
        const { difficulty, mode, customText } = get();
        let newText = "";

        if (difficulty === 'custom' && customText) {
            newText = customText;
        } else {
            // Safe cast as we know difficulty isn't custom here
            newText = getRandomPassage(difficulty as 'easy' | 'medium' | 'hard');
        }

        const initialTime = mode === 'timed' ? DEFAULT_TIME : 0;

        set({
            text: newText,
            userInput: '',
            status: 'ready',
            startTime: null,
            endTime: null,
            timeLeft: initialTime,
            initialTime,
            timerCount: 0,
            wpm: 0,
            accuracy: 100,
            errorCount: 0,
            errorIndices: new Set(),
            wasNewHighScore: false,
            wasFirstTest: false,
            previousBestWpm: null,
        });
    },

    handleInput: (value) => {
        const { status, text, userInput, errorIndices, startTime } = get();

        if (status === 'finished') return;

        let currentStartTime = startTime;
        if (status === 'ready' && value.length === 1) {
            currentStartTime = Date.now();
            set({ status: 'active', startTime: currentStartTime });
        }

        const newErrorIndices = new Set(errorIndices);

        if (value.length > userInput.length) {
            const charIndex = value.length - 1;
            if (charIndex < text.length && value[charIndex] !== text[charIndex]) {
                newErrorIndices.add(charIndex);
            }
        }

        const currentErrorCount = newErrorIndices.size;
        set({ userInput: value, errorIndices: newErrorIndices, errorCount: currentErrorCount });

        if (currentStartTime && value.length > 0) {
            const now = Date.now();
            const timeElapsed = Math.max((now - currentStartTime) / 1000, 0.5);

            const correctChars = value.split('').filter((char, i) => char === text[i]).length;
            const accuracy = value.length > 0
                ? Math.round(((value.length - currentErrorCount) / value.length) * 100)
                : 100;

            const newWpm = calculateWPM(correctChars, timeElapsed);
            set({ wpm: newWpm, accuracy });
        }

        if (value.length >= text.length) {
            get().finishGame();
        }
    },

    tick: () => {
        const { mode, status } = get();
        if (status !== 'active') return;

        set(state => ({
            timerCount: state.timerCount + 1,
            timeLeft: mode === 'timed' ? state.timeLeft - 1 : state.timeLeft + 1
        }));

        if (mode === 'timed' && get().timeLeft <= 0) {
            get().finishGame();
        }
    },

    finishGame: () => {
        const { text, userInput, difficulty, mode, errorIndices, startTime, personalBests } = get();
        const endTime = Date.now();
        set({ endTime });

        let timeElapsed = 0;
        if (startTime) {
            timeElapsed = (endTime - startTime) / 1000;
        }

        const correctChars = userInput.split('').filter((char, i) => char === text[i]).length;
        const finalWpm = calculateWPM(correctChars, timeElapsed);

        const totalIndicesTyped = userInput.length;
        const finalAccuracy = totalIndicesTyped > 0
            ? Math.round(((totalIndicesTyped - errorIndices.size) / totalIndicesTyped) * 100)
            : 100;

        let isNewHigh = false;
        let isFirst = false;
        const currentBest = personalBests[difficulty];

        // Only update Best if Passage Mode
        if (difficulty !== 'custom' && mode === 'passage') {
            isFirst = checkFirstTest(currentBest);
            isNewHigh = checkNewHighScore(finalWpm, currentBest);

            if (isNewHigh) {
                const newBest: StoredBest = {
                    wpm: finalWpm,
                    accuracy: finalAccuracy,
                    date: new Date().toISOString()
                };
                setStoredBest(difficulty, newBest);
                // Update local state map
                set(state => ({
                    personalBests: {
                        ...state.personalBests,
                        [difficulty]: newBest
                    }
                }));

                if (isFirst) {
                    fireBaseline();
                } else {
                    fireConfetti();
                }
            }
        }

        set({
            status: 'finished',
            wpm: finalWpm,
            accuracy: finalAccuracy,
            timerCount: Math.round(timeElapsed),
            wasFirstTest: isFirst && mode === 'passage',
            wasNewHighScore: !isFirst && isNewHigh && mode === 'passage',
            previousBestWpm: currentBest?.wpm || null,
        });
    },

    resetGame: () => {
        get().initGame();
    },
}));

export const useGameConfig = () => useGameStore(
    useShallow(state => ({
        difficulty: state.difficulty,
        mode: state.mode,
        setDifficulty: state.setDifficulty,
        setMode: state.setMode,
        setCustomText: state.setCustomText,
    }))
);

export const useGameStatus = () => useGameStore(
    useShallow(state => ({
        status: state.status,
        isReady: state.status === 'ready',
        isActive: state.status === 'active',
        isFinished: state.status === 'finished',
        isFocused: state.isFocused,
    }))
);

export const useGameText = () => useGameStore(
    useShallow(state => ({
        text: state.text,
        userInput: state.userInput,
    }))
);

export const useGameStats = () => useGameStore(
    useShallow(state => ({
        wpm: state.wpm,
        accuracy: state.accuracy,
        timeLeft: state.timeLeft,
    }))
);

export const useGameResultData = () => useGameStore(
    useShallow(state => ({
        wpm: state.wpm,
        accuracy: state.accuracy,
        errorCount: state.errorCount,
        timerCount: state.timerCount,
        text: state.text,
        userInput: state.userInput,
        mode: state.mode,
        initialTime: state.initialTime,
        wasNewHighScore: state.wasNewHighScore,
        wasFirstTest: state.wasFirstTest,
        previousBestWpm: state.previousBestWpm,
    }))
);

export const usePersonalBests = () => useGameStore(
    useShallow(state => state.personalBests)
);

export const useGameActions = () => useGameStore(
    useShallow(state => ({
        initGame: state.initGame,
        resetGame: state.resetGame,
        handleInput: state.handleInput,
        tick: state.tick,
        loadPersonalBests: state.loadPersonalBests, // Updated name
        setFocused: state.setFocused,
    }))
);
