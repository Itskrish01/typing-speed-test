import { useState } from "react";
import { LogIn, User } from "lucide-react";
import { loginWithEmail, createGuestAccount } from "@/lib/auth-helpers";
import { Button } from "@/components/ui/button";
import { AuthInput } from "./auth-input";
import { Checkbox } from "./checkbox";
import { ErrorMessage } from "@/components/common";

interface LoginFormProps {
    onSuccess: () => void;
}

export const LoginForm = ({ onSuccess }: LoginFormProps) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const { error: authError } = await loginWithEmail(email, password, rememberMe);

        if (authError) {
            setError(authError);
            setLoading(false);
        } else {
            onSuccess();
        }
    };

    return (
        <div className="flex flex-col gap-5 px-2 w-full max-w-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
                <LogIn size={18} />
                <span className="text-sm font-medium">login</span>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <AuthInput
                    id="login-email"
                    type="email"
                    placeholder="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                />
                <AuthInput
                    id="login-password"
                    type="password"
                    placeholder="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                />

                <Checkbox checked={rememberMe} onChange={setRememberMe} label="remember me" />

                {error && <ErrorMessage message={error} />}

                <Button type="submit" className="mt-2 w-full" disabled={loading}>
                    <LogIn size={16} />
                    <span>{loading ? "signing in..." : "sign in"}</span>
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
