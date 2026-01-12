import { useState } from "react";
import { UserPlus, User } from "lucide-react";
import { signupWithEmail, createGuestAccount } from "@/lib/auth-helpers";
import { createUserProfile, checkUsernameAvailability } from "@/lib/firestore-helpers";
import { Button } from "@/components/ui/button";
import { AuthInput } from "./auth-input";
import { ErrorMessage } from "@/components/common";

interface RegisterFormProps {
    onSuccess: () => void;
}

export const RegisterForm = ({ onSuccess }: RegisterFormProps) => {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [verifyEmail, setVerifyEmail] = useState("");
    const [password, setPassword] = useState("");
    const [verifyPassword, setVerifyPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!username.trim()) {
            setError("Username is required.");
            return;
        }
        if (email !== verifyEmail) {
            setError("Emails do not match.");
            return;
        }
        if (password !== verifyPassword) {
            setError("Passwords do not match.");
            return;
        }
        if (password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }

        setLoading(true);

        try {
            const isAvailable = await checkUsernameAvailability(username);

            if (!isAvailable) {
                setError("Username is already taken.");
                setLoading(false);
                return;
            }

            const { user, error: authError } = await signupWithEmail(email, password, username);

            if (authError) {
                setError(authError);
                setLoading(false);
            } else if (user) {
                await createUserProfile(user, username);
                onSuccess();
            }
        } catch (err) {
            console.error(err);
            setError("Failed to register. Please try again.");
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-5 px-2 rounded-xl w-full max-w-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
                <UserPlus size={18} />
                <span className="text-sm font-medium">register</span>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <AuthInput
                    id="reg-username"
                    type="text"
                    placeholder="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="username"
                />
                <AuthInput
                    id="reg-email"
                    type="email"
                    placeholder="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                />
                <AuthInput
                    id="reg-verify-email"
                    type="email"
                    placeholder="verify email"
                    value={verifyEmail}
                    onChange={(e) => setVerifyEmail(e.target.value)}
                    autoComplete="off"
                />
                <AuthInput
                    id="reg-password"
                    type="password"
                    placeholder="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                />
                <AuthInput
                    id="reg-verify-password"
                    type="password"
                    placeholder="verify password"
                    value={verifyPassword}
                    onChange={(e) => setVerifyPassword(e.target.value)}
                    autoComplete="new-password"
                />

                {error && <ErrorMessage message={error} />}

                <Button type="submit" variant="secondary" className="mt-2 w-full" disabled={loading}>
                    <UserPlus size={16} />
                    <span>{loading ? "signing up..." : "sign up"}</span>
                </Button>

                <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-border"></span>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                    </div>
                </div>

                <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={async () => {
                        setLoading(true);
                        const { error } = await createGuestAccount();
                        if (error) {
                            setError(error);
                            setLoading(false);
                        } else {
                            onSuccess();
                        }
                    }}
                    disabled={loading}
                >
                    <User size={16} />
                    <span>continue as guest</span>
                </Button>
            </form>
        </div>
    );
};
