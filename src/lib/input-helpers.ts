/**
 * Input restriction utilities for typing test
 * Prevents bulk deletion (select-all, delete past current word)
 * 
 * Rule: Once a space is typed, it locks everything before and including that space.
 * Users can only delete characters typed after the last space.
 */

/**
 * Gets the position right after the last space (locked boundary).
 * Everything before this position (including the space) is locked.
 * If no space exists, returns 0 (first word - can delete freely).
 */
export function getLockedBoundary(input: string): number {
    const lastSpaceIndex = input.lastIndexOf(' ');
    return lastSpaceIndex === -1 ? 0 : lastSpaceIndex + 1;
}

/**
 * Alias for getLockedBoundary - returns minimum allowed length after deletion.
 */
export function getMinAllowedLength(input: string): number {
    return getLockedBoundary(input);
}

/**
 * Checks if a backspace operation should be allowed.
 * Returns true only if there are deletable characters in the current word.
 */
export function canDeleteCharacter(input: string): boolean {
    const lockedBoundary = getLockedBoundary(input);
    return input.length > lockedBoundary;
}

/**
 * Restricts the new input value to prevent bulk deletion.
 * Ensures user can only delete within their current word (after last space).
 */
export function restrictDeletion(oldValue: string, newValue: string): string {
    // If not a deletion (same length or adding), allow freely
    if (newValue.length >= oldValue.length) {
        return newValue;
    }

    // Calculate the locked boundary (position after last space)
    const lockedBoundary = getLockedBoundary(oldValue);

    // If trying to delete into locked area, clamp to boundary
    if (newValue.length < lockedBoundary) {
        return oldValue.slice(0, lockedBoundary);
    }

    return newValue;
}
