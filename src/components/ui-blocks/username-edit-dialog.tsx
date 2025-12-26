import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { checkUsernameAvailability, updateUsername } from "../../lib/firestore-helpers";
import { Loader2, Check, X } from "lucide-react";
import { toast } from "sonner";

interface UsernameEditDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    currentUsername: string;
    userId: string;
    onSuccess: (newUsername: string) => void;
}

export const UsernameEditDialog = ({
    open,
    onOpenChange,
    currentUsername,
    userId,
    onSuccess
}: UsernameEditDialogProps) => {
    const [username, setUsername] = useState(currentUsername);
    const [loading, setLoading] = useState(false);
    const [checking, setChecking] = useState(false);
    const [available, setAvailable] = useState<boolean | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Debounce check for availability
    useEffect(() => {
        if (username === currentUsername) {
            setAvailable(null);
            return;
        }
        if (username.length < 3) {
            setAvailable(null);
            return;
        }

        const timer = setTimeout(async () => {
            setChecking(true);
            try {
                const isFree = await checkUsernameAvailability(username);
                setAvailable(isFree);
            } catch (err) {
                console.error(err);
                setAvailable(null);
            } finally {
                setChecking(false);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [username, currentUsername]);

    const handleSave = async () => {
        if (!available && username !== currentUsername) {
            setError("Username is not available");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await updateUsername(userId, username);
            toast.success("Username updated successfully");
            onSuccess(username);
            onOpenChange(false);
        } catch (err: any) {
            setError(err.message || "Failed to update username");
            toast.error("Failed to update username");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Username</DialogTitle>
                    <DialogDescription>
                        Choose a unique username for your profile. This will be used for your public profile link.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="username" className="text-right">
                            Username
                        </Label>
                        <div className="col-span-3 relative">
                            <Input
                                id="username"
                                value={username}
                                onChange={(e) => {
                                    setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''));
                                    setAvailable(null);
                                    setError(null);
                                }}
                                className={`pr-10 ${available === true ? "border-green-500/50 focus-visible:ring-green-500/30" : available === false ? "border-red-500/50 focus-visible:ring-red-500/30" : ""}`}
                                placeholder="username"
                                minLength={3}
                                maxLength={20}
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                {checking ? (
                                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                ) : available === true ? (
                                    <Check className="h-4 w-4 text-green-500" />
                                ) : available === false ? (
                                    <X className="h-4 w-4 text-red-500" />
                                ) : null}
                            </div>
                        </div>
                    </div>
                    {error && (
                        <div className="text-sm text-red-500 text-center font-medium">
                            {error}
                        </div>
                    )}
                    {available === true && (
                        <div className="text-xs text-green-500 text-right">
                            Username is available
                        </div>
                    )}
                    {available === false && (
                        <div className="text-xs text-red-500 text-right">
                            Username is taken
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        onClick={handleSave}
                        disabled={loading || (username !== currentUsername && !available) || username.length < 3}
                    >
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
