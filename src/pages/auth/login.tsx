import { useNavigate } from "react-router-dom";
import { RegisterForm, LoginForm } from "@/components/forms";

export const Login = () => {
    const navigate = useNavigate();

    const handleSuccess = () => {
        navigate("/");
    };

    return (
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 selection:bg-primary/30 selection:text-primary-foreground">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-0 items-start justify-items-center w-full max-w-6xl">
                <div className="w-full max-w-xs lg:justify-self-start">
                    <RegisterForm onSuccess={handleSuccess} />
                </div>
                <div className="hidden lg:block" /> {/* Empty middle column for gap */}
                <div className="w-full max-w-xs lg:justify-self-end">
                    <LoginForm onSuccess={handleSuccess} />
                </div>
            </div>
        </div>
    );
};
