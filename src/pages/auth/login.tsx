import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginWithEmail, signupWithEmail } from "../../lib/auth-helpers";
import { createUserProfile, checkUsernameAvailability } from "../../lib/firestore-helpers";
import { Button } from "../../components/ui/button";
import { UserPlus, LogIn, Check, AlertCircle } from "lucide-react";

// ==================== Reusable Components ====================

interface AuthInputProps {
    id: string;
    type: string;
    placeholder: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    autoComplete?: string;
}

const AuthInput = ({ id, type, placeholder, value, onChange, autoComplete }: AuthInputProps) => (
    <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        className="w-full h-9 px-2 rounded-md bg-input/30 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
    />
);

interface CheckboxProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label: string;
}

const Checkbox = ({ checked, onChange, label }: CheckboxProps) => (
    <label className="flex items-center gap-2 cursor-pointer select-none text-sm text-muted-foreground">
        <div
            role="checkbox"
            aria-checked={checked}
            tabIndex={0}
            onClick={() => onChange(!checked)}
            onKeyDown={(e) => e.key === "Enter" && onChange(!checked)}
            className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${checked ? "bg-primary border-primary" : "border-border bg-input"}`}
        >
            {checked && <Check size={12} className="text-primary-foreground" />}
        </div>
        <span onClick={() => onChange(!checked)}>{label}</span>
    </label>
);

interface ErrorMessageProps {
    message: string;
}

const ErrorMessage = ({ message }: ErrorMessageProps) => (
    <div className="flex items-center gap-2 text-destructive text-sm">
        <span>{message}</span>
    </div>
);

// ==================== Form Components ====================

const RegisterForm = ({ onSuccess }: { onSuccess: () => void }) => {
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
            // Check availability first
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
                <AuthInput id="reg-username" type="text" placeholder="username" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" />
                <AuthInput id="reg-email" type="email" placeholder="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
                <AuthInput id="reg-verify-email" type="email" placeholder="verify email" value={verifyEmail} onChange={(e) => setVerifyEmail(e.target.value)} autoComplete="off" />
                <AuthInput id="reg-password" type="password" placeholder="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
                <AuthInput id="reg-verify-password" type="password" placeholder="verify password" value={verifyPassword} onChange={(e) => setVerifyPassword(e.target.value)} autoComplete="new-password" />

                {error && <ErrorMessage message={error} />}

                <Button type="submit" variant="secondary" className="mt-2 w-full" disabled={loading}>
                    <UserPlus size={16} />
                    <span>{loading ? "signing up..." : "sign up"}</span>
                </Button>
            </form>
        </div>
    );
};

const LoginForm = ({ onSuccess }: { onSuccess: () => void }) => {
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
                <AuthInput id="login-email" type="email" placeholder="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
                <AuthInput id="login-password" type="password" placeholder="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />

                <Checkbox checked={rememberMe} onChange={setRememberMe} label="remember me" />

                {error && <ErrorMessage message={error} />}

                <Button type="submit" className="mt-2 w-full" disabled={loading}>
                    <LogIn size={16} />
                    <span>{loading ? "signing in..." : "sign in"}</span>
                </Button>
            </form>
        </div>
    );
};

// ==================== Main Page ====================

export const Login = () => {
    const navigate = useNavigate();

    const handleSuccess = () => {
        navigate("/");
    };

    return (
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-2 selection:bg-primary/30 selection:text-primary-foreground">
            <div className="grid gap-8 grid-cols-1 md:grid-cols-9 items-start justify-items-center w-full max-w-7xl">
                <div className="w-full  md:col-start-1 md:col-end-3">
                    <RegisterForm onSuccess={handleSuccess} />
                </div>
                <div className="w-full  md:col-start-7 md:col-end-9">
                    <LoginForm onSuccess={handleSuccess} />
                </div>
            </div>
        </div>
    );
};
