import { useRef, useEffect, useState } from "react";
import { cn } from "../../lib/utils";
import { MousePointer } from "lucide-react";

interface TypingAreaProps {
    text: string;
    userInput: string;
    isFocused: boolean;
    isReady: boolean;
    onFocus?: () => void;
    className?: string;
}

export const TypingArea = ({
    text,
    userInput,
    isFocused,
    isReady,
    onFocus,
    className
}: TypingAreaProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [caretStyle, setCaretStyle] = useState<React.CSSProperties>({ display: 'none' });

    // Smooth Caret Logic
    useEffect(() => {
        const updateCaretPosition = () => {
            if (!containerRef.current) return;

            const currentIndex = userInput.length;
            // Find the character element for the current index
            const currentChar = containerRef.current.querySelector(`[data-index="${currentIndex}"]`) as HTMLElement;

            if (currentChar) {
                const containerRect = containerRef.current.getBoundingClientRect();
                const charRect = currentChar.getBoundingClientRect();

                setCaretStyle({
                    transform: `translate(${charRect.left - containerRect.left}px, ${charRect.top - containerRect.top}px)`,
                    width: `${charRect.width}px`, // BLOCK CURSOR: Width matches character
                    height: `${charRect.height}px`,
                    opacity: 1,
                    display: 'block'
                });
            } else if (userInput.length === text.length && text.length > 0) {
                // End of text handling - place after last char
                // For block cursor at end, we might default to a standard width or width of last char
                const lastChar = containerRef.current.querySelector(`[data-index="${text.length - 1}"]`) as HTMLElement;
                if (lastChar) {
                    const containerRect = containerRef.current.getBoundingClientRect();
                    const charRect = lastChar.getBoundingClientRect();

                    setCaretStyle({
                        transform: `translate(${charRect.right - containerRect.left}px, ${charRect.top - containerRect.top}px)`,
                        width: `${charRect.width}px`, // Keep width of last char for consistency
                        height: `${charRect.height}px`,
                        opacity: 1,
                        display: 'block'
                    });
                }
            }
        };

        // Update strictly after render
        requestAnimationFrame(updateCaretPosition);

        // Also update on resize
        window.addEventListener('resize', updateCaretPosition);
        return () => window.removeEventListener('resize', updateCaretPosition);
    }, [userInput, text, isReady, isFocused]);

    // Smart Overlay Logic
    const showOverlay = !isFocused && isReady;

    // Caret visibility: Show if focused OR (ready and no input yet implies start)
    const showCaret = (isFocused || (isReady && userInput.length === 0)) && !showOverlay;

    return (
        <div className="relative w-full min-h-[150px] sm:min-h-[200px]">
            {/* Focus Prompt Overlay */}
            {showOverlay && (
                <div
                    className="absolute inset-0 z-30 cursor-pointer flex items-center justify-center bg-background/50 backdrop-blur-[2px]"
                    onClick={(e) => {
                        e.stopPropagation();
                        onFocus?.();
                    }}
                >
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <MousePointer className="w-4 h-4" />
                        <span className="text-lg font-mono font-bold">Click here or press any key to focus</span>
                    </div>
                </div>
            )}

            {/* Typing Container */}
            <div
                ref={containerRef}
                className={cn(
                    "relative text-xl sm:text-2xl md:text-3xl leading-relaxed tracking-wide font-medium text-muted-foreground wrap-break-word whitespace-pre-wrap select-none transition-all duration-300 font-roboto-mono",
                    showOverlay && "blur-sm opacity-40",
                    className
                )}
            >
                {/* Smooth Caret - Block Style */}
                <div
                    className={cn(
                        "absolute bg-secondary rounded-sm z-0 transition-all duration-150 ease-out", // Added opacity/50 to seeing text through if needed, or z-0 to be behind
                        showCaret ? "opacity-100" : "opacity-0",
                        isReady && userInput.length === 0 && "" // Pulse initially
                    )}
                    style={{
                        ...caretStyle,
                        transitionProperty: 'transform, height, width, opacity',
                    }}
                />

                {/* Text Content */}
                {text.split("").map((char, index) => {
                    let status = "untyped";
                    if (index < userInput.length) {
                        status = userInput[index] === char ? "correct" : "incorrect";
                    }

                    // Determine if this is the current character under the caret
                    const isCurrent = index === userInput.length;

                    return (
                        <span
                            key={index}
                            data-index={index}
                            className={cn(
                                "relative transition-colors duration-100 z-10", // Ensure text is above caret
                                status === "correct" && "text-chart-2",
                                status === "incorrect" && "text-destructive border-b-2 border-destructive bg-destructive/10",
                                isCurrent && showCaret && "text-foreground" // Highlight current char text color for contrast if needed
                            )}
                        >
                            {char}
                        </span>
                    );
                })}
            </div>
        </div>
    );
};
