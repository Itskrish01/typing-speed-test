import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import {
    calculateWPM,
    calculateAccuracy,
    getRandomPassage,
    isNewHighScore as checkNewHighScore,
    isFirstTest as checkFirstTest,
} from '../lib/typing-utils';
import {
    type StoredBest,
    type Difficulty,
    EMPTY_PERSONAL_BESTS
} from '../lib/game-types';
import { countCorrectChars } from '../lib/game-helpers';
import { fireConfetti, fireBaseline } from '../lib/confetti';

// Types
export type Mode = 'timed' | 'passage';
export type Category = 'words' | 'quotes' | 'lyrics' | 'code';
export type Language = 'javascript' | 'python' | 'java' | 'c++' | 'c#' | 'sql' | 'html' | 'css';
export type GameStatus = 'ready' | 'active' | 'finished';

interface GameState {
    // Configuration
    difficulty: Difficulty;
    mode: Mode;
    category: Category;
    language: Language;
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
    timedDuration: number;

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

    setCategory: (category: Category) => void;
    setLanguage: (language: Language) => void;
    setFocused: (focused: boolean) => void;
    setCustomText: (text: string) => void;
    setTimedDuration: (duration: number) => void;

    // Game Flow
    initGame: () => void;
    finishGame: () => void;
    resetGame: () => void;

    // Input
    handleInput: (value: string) => void;

    // Timer
    tick: () => void;

    // Persistence
    // Persistence
    setPersonalBests: (bests: Record<Difficulty, StoredBest | null>) => void;
}

type GameStore = GameState & GameActions;

const DEFAULT_TIME = 60;
const DEFAULT_DURATION = 60;

const initialState: GameState = {
    difficulty: 'hard',
    mode: 'passage',
    category: 'words',
    language: 'javascript',
    customText: '',
    status: 'ready',
    isFocused: true,
    startTime: null,
    endTime: null,
    text: '',
    userInput: '',
    timeLeft: DEFAULT_TIME,
    initialTime: DEFAULT_TIME,
    timedDuration: DEFAULT_DURATION,
    timerCount: 0,
    wpm: 0,
    accuracy: 100,
    errorCount: 0,
    errorIndices: new Set(),
    personalBests: { ...EMPTY_PERSONAL_BESTS },
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

    setTimedDuration: (duration) => {
        set({ timedDuration: duration });
        if (get().mode === 'timed') {
            get().initGame();
        }
    },

    setMode: (mode) => {
        const { timedDuration } = get();
        const initialTime = mode === 'timed' ? timedDuration : 0;
        set({ mode, initialTime, timeLeft: initialTime });
        get().initGame();
    },

    setCategory: (category) => {
        set({ category });
        get().initGame();
    },

    setLanguage: (language) => {
        set({ language });
        get().initGame();
    },

    setCustomText: (text) => {
        set({ customText: text, difficulty: 'custom', mode: 'passage' });
        get().initGame();
    },

    setFocused: (isFocused) => {
        set({ isFocused });
    },

    setPersonalBests: (bests) => {
        set({ personalBests: bests });
    },

    initGame: () => {
        const { difficulty, mode, category, customText } = get();
        let newText = "";

        if (difficulty === 'custom' && customText) {
            newText = customText;
        } else {
            // Safe cast as we know difficulty isn't custom here
            newText = getRandomPassage(difficulty as 'easy' | 'medium' | 'hard', category, get().language);
        }

        const initialTime = mode === 'timed' ? get().timedDuration : 0;

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

            const correctChars = countCorrectChars(value, text);
            const accuracy = calculateAccuracy(value.length - currentErrorCount, value.length);

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

        const correctChars = countCorrectChars(userInput, text);
        const finalWpm = calculateWPM(correctChars, timeElapsed);

        const totalIndicesTyped = userInput.length;
        const finalAccuracy = calculateAccuracy(totalIndicesTyped - errorIndices.size, totalIndicesTyped);

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
        category: state.category,
        setDifficulty: state.setDifficulty,
        setMode: state.setMode,
        setCategory: state.setCategory,
        language: state.language,
        setLanguage: state.setLanguage,
        setCustomText: state.setCustomText,
        timedDuration: state.timedDuration,
        setTimedDuration: state.setTimedDuration,
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
        setPersonalBests: state.setPersonalBests, // Updated name
        setFocused: state.setFocused,
    }))
);
