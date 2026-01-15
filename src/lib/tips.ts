export const TYPING_TIPS = [
    "Focus on accuracy first. Speed is a byproduct of precision.",
    "Keep your posture straight and your wrists elevated.",
    "Don't look at the keyboard. Trust your muscle memory.",
    "Type at a steady rhythm. Consistency builds speed.",
    "Take regular breaks to avoid fatigue and strain.",
    "Return your fingers to the home row after each reach.",
    "Practice specific key combinations that slow you down.",
    "Relax your hands. Tension slows you down.",
    "Use both Shift keys to avoid stretching your hands.",
    "Breathe naturally. Holding your breath increases tension.",
    "Accuracy > Speed. 100% accuracy at 50 WPM is better than 90% at 80 WPM.",
    "Visualise the keyboard layout in your mind.",
    "Use the same finger for the same key every time.",
    "Slow down for difficult words and speed up for easy ones.",
    "Consistent practice for 15 minutes is better than one long session.",
    "Read ahead slightly to prepare for upcoming words.",
    "Don't rush backspacing. Ctrl+Backspace deletes whole words.",
    "Keep your fingernails trimmed for better tactile feedback.",
    "Find a comfortable keyboard that suits your hand size.",
    "Challenge yourself with difficult texts occasionally."
];

export const getRandomTip = (): string => {
    return TYPING_TIPS[Math.floor(Math.random() * TYPING_TIPS.length)];
};
