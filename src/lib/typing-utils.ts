import { type StoredBest } from './game-types';
export const calculateWPM = (correctChars: number, timeElapsed: number): number => {
    if (timeElapsed <= 0) return 0;
    const words = correctChars / 5;
    const minutes = timeElapsed / 60;
    return Math.round(words / minutes);
};

import { QUOTES, LYRICS, CODE_KEYWORDS } from './data';
export type Language = 'javascript' | 'python' | 'java' | 'c++' | 'c#' | 'sql' | 'html' | 'css';

export const calculateAccuracy = (correctChars: number, totalChars: number): number => {
    if (totalChars === 0) return 100;
    return Math.round((correctChars / totalChars) * 100);
};

export const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const EASY_WORDS = [
    "the", "be", "to", "of", "and", "a", "in", "that", "have", "it",
    "for", "not", "on", "with", "he", "as", "you", "do", "at", "this",
    "but", "his", "by", "from", "they", "we", "say", "her", "she", "or",
    "an", "will", "my", "one", "all", "would", "there", "their", "what",
    "so", "up", "out", "if", "about", "who", "get", "which", "go", "me",
    "when", "make", "can", "like", "time", "no", "just", "him", "know",
    "take", "people", "into", "year", "your", "good", "some", "could",
    "them", "see", "other", "than", "then", "now", "look", "only", "come",
    "its", "over", "think", "also", "back", "after", "use", "two", "how",
    "our", "work", "first", "well", "way", "even", "new", "want", "because"
];

const MEDIUM_WORDS = [
    "about", "above", "across", "action", "almost", "alone", "along", "already",
    "always", "amount", "answer", "anyone", "appear", "around", "arrive", "artist",
    "aspect", "assume", "attack", "author", "become", "before", "behind", "better",
    "between", "beyond", "billion", "bottle", "bottom", "bought", "branch", "breath",
    "bridge", "bright", "broken", "budget", "burden", "bureau", "button", "camera",
    "campaign", "cancer", "cannot", "carbon", "career", "castle", "casual", "caught",
    "center", "chance", "change", "charge", "choice", "choose", "church", "circle",
    "client", "closed", "closer", "coffee", "column", "combat", "coming", "common",
    "company", "compare", "concept", "concern", "concert", "corner", "costume", "cottage"
];

const HARD_WORDS = [
    "absolutely", "according", "activity", "actually", "addition", "administration",
    "adventure", "advertising", "afternoon", "agreement", "agriculture", "although",
    "analysis", "announce", "anything", "anywhere", "apartment", "apparent", "appearance",
    "approach", "appropriate", "approval", "argument", "arrangement", "association",
    "atmosphere", "attitude", "audience", "authority", "available", "background",
    "beautiful", "beginning", "behavior", "believe", "birthday", "boundary", "breakfast",
    "breathing", "building", "business", "calculate", "capacity", "category", "certainly",
    "campaign", "candidate", "capacity", "carefully", "category", "celebrate", "century",
    "ceremony", "chairman", "champion", "changing", "chemical", "children", "civilian",
    "clothing", "collapse", "colleague", "collect", "collection", "college", "combination",
    "commercial", "commission", "commitment", "committee", "communicate", "community",
    "comparison", "competition", "complaint", "complete", "completely", "complex", "computer"
];

const WORD_COUNTS = {
    easy: 15,
    medium: 25,
    hard: 30
};

export const getRandomPassage = (difficulty: 'easy' | 'medium' | 'hard', category: 'words' | 'quotes' | 'lyrics' | 'code' = 'words', language: Language = 'javascript'): string => {
    let wordList: string[] = [];
    let count = 0;

    if (category === 'quotes') {
        const randomIndex = Math.floor(Math.random() * QUOTES.length);
        return QUOTES[randomIndex];
    }

    if (category === 'lyrics') {
        const randomIndex = Math.floor(Math.random() * LYRICS.length);
        return LYRICS[randomIndex];
    }

    if (category === 'code') {
        const keywords = CODE_KEYWORDS[language] || CODE_KEYWORDS['javascript'];
        const numKeywords = 20; // Generate 20 random keywords
        const selectedKeywords: string[] = [];
        for (let i = 0; i < numKeywords; i++) {
            const randomIndex = Math.floor(Math.random() * keywords.length);
            selectedKeywords.push(keywords[randomIndex]);
        }
        return selectedKeywords.join(" ");
    }


    switch (difficulty) {
        case 'easy':
            wordList = EASY_WORDS;
            count = WORD_COUNTS.easy;
            break;
        case 'medium':
            wordList = MEDIUM_WORDS;
            count = WORD_COUNTS.medium;
            break;
        case 'hard':
            wordList = HARD_WORDS;
            count = WORD_COUNTS.hard;
            break;
        default:
            wordList = EASY_WORDS;
            count = 10;
    }

    const words: string[] = [];
    for (let i = 0; i < count; i++) {
        const randomIndex = Math.floor(Math.random() * wordList.length);
        words.push(wordList[randomIndex]);
    }

    return words.join(" ");
};


export const isNewHighScore = (wpm: number, currentBest: StoredBest | null): boolean => {
    if (!currentBest) return true;
    return wpm > currentBest.wpm;
};

export const isFirstTest = (currentBest: StoredBest | null): boolean => {
    return currentBest === null;
};
