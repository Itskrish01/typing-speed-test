export const calculateWPM = (correctChars: number, timeElapsed: number): number => {
    if (timeElapsed <= 0) return 0;
    const words = correctChars / 5;
    const minutes = timeElapsed / 60;
    return Math.round(words / minutes);
};

import { QUOTES, LYRICS, CODE_SNIPPETS } from './data';

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
    "program", "syntax", "value", "method", "variable", "network", "server",
    "client", "browser", "script", "update", "function", "object", "array",
    "string", "number", "boolean", "design", "style", "layout", "format",
    "pixel", "color", "image", "audio", "video", "render", "state", "props",
    "hook", "effect", "action", "store", "global", "local", "memory", "data",
    "cloud", "build", "deploy", "debug", "error", "warning", "trace", "stack",
    "queue", "list", "map", "set", "graph", "tree", "node", "root", "leaf",
    "search", "sort", "merge", "split", "slice", "splice", "join", "concat",
    "match", "test", "case", "suite", "bench", "mark", "tool", "chain", "core",
    "utils", "helper", "class", "module", "import", "export", "default", "const",
    "let", "var", "async", "await", "promise", "yield", "return", "throw", "catch",
    "try", "while", "break", "switch", "binary", "system", "kernel", "shell"
];

const HARD_WORDS = [
    "synchronization", "asynchronous", "multithreading", "concurrency", "parallelism",
    "polymorphism", "encapsulation", "inheritance", "abstraction", "implementation",
    "dependency", "injection", "middleware", "authentication", "authorization",
    "encryption", "decryption", "cryptography", "blockchain", "decentralized",
    "distributed", "system", "architecture", "infrastructure", "deployment",
    "orchestration", "virtualization", "containerization", "microservices", "serverless",
    "scalability", "reliability", "availability", "maintainability", "testability",
    "observability", "metrics", "analytics", "visualization", "optimization",
    "performance", "latency", "throughput", "bandwidth", "protocol", "interface",
    "declaration", "definition", "expression", "statement", "identifier", "literal",
    "operator", "precedence", "associativity", "evaluation", "compilation",
    "interpretation", "execution", "runtime", "environment", "framework", "library",
    "component", "directive", "decorator", "annotation", "configuration", "manifest",
    "specification", "standardization", "normalization", "serialization", "deserialization",
    "idempotency", "immutability", "referential", "transparency", "functional"
];

const WORD_COUNTS = {
    easy: 15,
    medium: 25,
    hard: 30
};

export const getRandomPassage = (difficulty: 'easy' | 'medium' | 'hard', category: 'words' | 'quotes' | 'lyrics' | 'code' = 'words'): string => {
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
        const randomIndex = Math.floor(Math.random() * CODE_SNIPPETS.length);
        return CODE_SNIPPETS[randomIndex];
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
