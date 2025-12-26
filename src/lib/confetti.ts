import confetti from 'canvas-confetti';

export const fireConfetti = (): void => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;

    const randomInRange = (min: number, max: number): number => {
        return Math.random() * (max - min) + min;
    };

    const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
            clearInterval(interval);
            return;
        }

        const particleCount = 50 * (timeLeft / duration);

        confetti({
            particleCount,
            startVelocity: 30,
            spread: 360,
            origin: {
                x: randomInRange(0.1, 0.3),
                y: Math.random() - 0.2
            },
            colors: ['#22c55e', '#eab308', '#3b82f6', '#f43f5e', '#8b5cf6']
        });

        confetti({
            particleCount,
            startVelocity: 30,
            spread: 360,
            origin: {
                x: randomInRange(0.7, 0.9),
                y: Math.random() - 0.2
            },
            colors: ['#22c55e', '#eab308', '#3b82f6', '#f43f5e', '#8b5cf6']
        });
    }, 250);
};

export const fireBaseline = (): void => {
    confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#22c55e', '#16a34a', '#15803d']
    });
};
