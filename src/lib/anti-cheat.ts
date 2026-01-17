/**
 * Anti-Cheat Detection Logic
 * Analyzes keystroke dynamics to detect bot behavior.
 */

export interface Keystroke {
    key: string;
    timestamp: number;
}

// Common fast digraphs (easy to type pairs)
const FAST_DIGRAPHS = new Set([
    'th', 'he', 'in', 'er', 'an', 're', 'on', 'at', 'en', 'nd', 'ti', 'es', 'or', 'te', 'of', 'ed'
]);

// Common slow digraphs (awkward/rare pairs)
const SLOW_DIGRAPHS = new Set([
    'za', 'qx', 'qz', 'zw', 'wx', 'xq', 'xz', 'zq', 'xv', 'bx', 'kj', 'vp', 'qy', 'mj', 'fz'
]);

export const calculateCheatRiskScore = (keystrokes: Keystroke[]): number => {
    // Need a reasonable amount of data
    if (keystrokes.length < 30) return 0;

    let score = 0;
    const intervals: number[] = [];
    const digraphs: { pair: string; interval: number }[] = [];

    // 1. Calculate Intervals & Extract Digraphs
    for (let i = 1; i < keystrokes.length; i++) {
        const delta = keystrokes[i].timestamp - keystrokes[i - 1].timestamp;

        // Filter out massive pauses (distractions/thinking) which skew SD
        if (delta < 2000) {
            intervals.push(delta);

            const pair = (keystrokes[i - 1].key + keystrokes[i].key).toLowerCase();
            digraphs.push({ pair, interval: delta });
        }
    }

    if (intervals.length < 10) return 0;

    // 2. Standard Deviation (SD) Check
    const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const variance = intervals.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / intervals.length;
    const sd = Math.sqrt(variance);

    if (sd < 10) {
        score += 1.0; // Almost practically impossible for human
    } else if (sd < 20) {
        score += 0.5; // Highly suspicious
    }

    // 3. Digraph Latency Analysis
    let fastSum = 0, fastCount = 0;
    let slowSum = 0, slowCount = 0;

    digraphs.forEach(d => {
        if (FAST_DIGRAPHS.has(d.pair)) {
            fastSum += d.interval;
            fastCount++;
        } else if (SLOW_DIGRAPHS.has(d.pair)) {
            slowSum += d.interval;
            slowCount++;
        }
    });

    if (fastCount > 5 && slowCount > 2) {
        const avgFast = fastSum / fastCount;
        const avgSlow = slowSum / slowCount;
        const ratio = avgSlow / avgFast;

        // Humans typically have Ratio > 1.25 (Slow pairs take longer)
        // Bots typically have Ratio ~ 1.0 (Uniform speed)

        if (ratio < 1.05) {
            score += 0.8; // Very robotic uniformity
        } else if (ratio < 1.15) {
            score += 0.4; // Suspicious
        }
    }

    return Math.min(1.0, score);
};
