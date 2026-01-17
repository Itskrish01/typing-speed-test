/**
 * Anti-Cheat Detection Logic
 */

export interface Keystroke {
    key: string;
    timestamp: number; // Must use performance.now()
}

// QWERTY-specific Biomechanics
const FAST_DIGRAPHS = new Set([
    'th', 'he', 'in', 'er', 'an', 're', 'on', 'at', 'en', 'nd', 'ti', 'es', 'or', 'te', 'of', 'ed'
]);

// Same-finger or long-stretch pairs on QWERTY
const SLOW_DIGRAPHS = new Set([
    'za', 'qx', 'qz', 'zw', 'wx', 'xq', 'xz', 'zq', 'xv', 'bx', 'kj', 'vp', 'qy', 'mj', 'fz'
]);

export const calculateCheatRiskScore = (keystrokes: Keystroke[]): number => {
    // 1. Safety Check: Need significant data to be statistically relevant
    if (keystrokes.length < 50) return 0;

    let score = 0;
    const intervals: number[] = [];
    const digraphs: { pair: string; interval: number }[] = [];

    // --- Step A: Data Processing ---
    for (let i = 1; i < keystrokes.length; i++) {
        const delta = keystrokes[i].timestamp - keystrokes[i - 1].timestamp;

        // Filter: Ignore "thinking pauses" (>300ms) for SD calc
        // Real typing flow usually happens under 300ms per key
        if (delta < 2000) {
            // Only push "flow" typing for SD, otherwise you measure thinking time, not typing mechanics
            if (delta < 500) intervals.push(delta);

            const pair = (keystrokes[i - 1].key + keystrokes[i].key).toLowerCase();
            digraphs.push({ pair, interval: delta });
        }
    }

    if (intervals.length < 20) return 0;

    // --- Step B: Calculate WPM (Approximate) ---
    // Average time per char * 5 chars per word
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const estimatedWPM = 60000 / (avgInterval * 5);

    // --- Step C: Standard Deviation (The "Dumb Bot" Filter) ---
    const mean = avgInterval;
    const variance = intervals.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / intervals.length;
    const sd = Math.sqrt(variance);

    // Human SD usually scales with speed, but < 15ms is extremely rare
    if (sd < 8) score += 1.0;       // Almost definitely a macro
    else if (sd < 15) score += 0.6; // High suspicion

    // --- Step D: Digraph Latency (The "Smart Bot" Filter) ---
    // SPEED GATE: Only check biomechanics if they are typing fast enough (> 45 WPM).
    // Slow typists (hunt-and-peck) have uniform speed due to search time.
    if (estimatedWPM > 45) {
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

        // Ensure we have enough sample data for BOTH categories
        if (fastCount >= 5 && slowCount >= 3) {
            const avgFast = fastSum / fastCount;
            const avgSlow = slowSum / slowCount;
            const ratio = avgSlow / avgFast;

            // Strict checking for fast typists
            if (ratio < 1.10) score += 0.7; // Suspiciously uniform
            else if (ratio < 1.20) score += 0.3; // Mild suspicion
        }
    }

    return Math.min(1.0, score);
};