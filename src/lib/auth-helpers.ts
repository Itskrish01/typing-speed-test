import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    setPersistence,
    browserLocalPersistence,
    browserSessionPersistence,
    updateProfile,
    type AuthError
} from "firebase/auth";
import { auth } from "../config/firebase";

/**
 * Maps Firebase auth error codes to user-friendly messages.
 */
const getAuthErrorMessage = (code: string): string => {
    const errorMessages: Record<string, string> = {
        'auth/email-already-in-use': 'This email is already registered.',
        'auth/invalid-email': 'Please enter a valid email address.',
        'auth/operation-not-allowed': 'Email/password accounts are not enabled.',
        'auth/weak-password': 'Password should be at least 6 characters.',
        'auth/user-disabled': 'This account has been disabled.',
        'auth/user-not-found': 'No account found with this email.',
        'auth/wrong-password': 'Incorrect password.',
        'auth/invalid-credential': 'Invalid email or password.',
        'auth/too-many-requests': 'Too many attempts. Please try again later.',
    };
    return errorMessages[code] || 'An unexpected error occurred. Please try again.';
};

export const loginWithEmail = async (email: string, password: string, rememberMe: boolean = false) => {
    try {
        // Set persistence based on Remember Me
        await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return { user: userCredential.user, error: null };
    } catch (error) {
        const authError = error as AuthError;
        return { user: null, error: getAuthErrorMessage(authError.code) };
    }
};

export const signupWithEmail = async (email: string, password: string, username: string) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // Update the user's display name with the username
        await updateProfile(userCredential.user, { displayName: username });
        return { user: userCredential.user, error: null };
    } catch (error) {
        const authError = error as AuthError;
        return { user: null, error: getAuthErrorMessage(authError.code) };
    }
};

export const logoutUser = async () => {
    try {
        await signOut(auth);
        return { error: null };
    } catch (error) {
        const authError = error as AuthError;
        return { error: getAuthErrorMessage(authError.code) };
    }
};
