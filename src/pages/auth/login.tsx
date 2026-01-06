import { useNavigate } from "react-router-dom";
import { RegisterForm, LoginForm } from "@/components/forms";

export const Login = () => {
    const navigate = useNavigate();

    const handleSuccess = () => {
        navigate("/");
    };

    return (
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-2 selection:bg-primary/30 selection:text-primary-foreground">
            <div className="grid gap-8 grid-cols-1 md:grid-cols-9 items-start justify-items-center w-full max-w-7xl">
                <div className="w-full md:col-start-1 md:col-end-3">
                    <RegisterForm onSuccess={handleSuccess} />
                </div>
                <div className="w-full md:col-start-7 md:col-end-9">
                    <LoginForm onSuccess={handleSuccess} />
                </div>
            </div>
        </div>
    );
};
