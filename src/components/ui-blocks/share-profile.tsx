import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Copy,
    Check,
    Twitter,
    Facebook,
    Linkedin,
    Share2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ShareProfileProps {
    url: string;
    className?: string;
}

export const ShareProfile = ({ url, className }: ShareProfileProps) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy text: ", err);
        }
    };

    const shareText = "Check out my typing speed stats!";
    const encodedUrl = encodeURIComponent(url);
    const encodedText = encodeURIComponent(shareText);

    const socialLinks = [
        {
            name: "Twitter",
            icon: Twitter,
            href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`,
            color: "hover:text-[#1DA1F2]"
        },
        {
            name: "Facebook",
            icon: Facebook,
            href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
            color: "hover:text-[#4267B2]"
        },
        {
            name: "LinkedIn",
            icon: Linkedin,
            href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
            color: "hover:text-[#0077b5]"
        }
    ];

    return (
        <div className={cn("flex flex-col gap-3 p-4 bg-secondary/10 rounded-xl border border-border/50", className)}>
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Share2 className="w-4 h-4" />
                <span>Share your profile</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 flex items-center gap-2 bg-background/50 border border-border rounded-lg px-3 py-2 transition-colors focus-within:ring-1 focus-within:ring-primary/20">
                    <span className="text-xs text-muted-foreground truncate flex-1 font-mono select-all">
                        {url}
                    </span>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 shrink-0 hover:bg-background"
                        onClick={handleCopy}
                        title="Copy to clipboard"
                    >
                        {copied ? (
                            <Check className="w-3.5 h-3.5 text-green-500" />
                        ) : (
                            <Copy className="w-3.5 h-3.5" />
                        )}
                    </Button>
                </div>

                <div className="flex items-center gap-2 justify-end sm:justify-start">
                    {socialLinks.map((social) => (
                        <a
                            key={social.name}
                            href={social.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={cn(
                                "p-2 rounded-lg bg-background/50 border border-border hover:bg-background transition-all hover:scale-105 active:scale-95",
                                social.color
                            )}
                            title={`Share on ${social.name}`}
                        >
                            <social.icon className="w-4 h-4" />
                        </a>
                    ))}
                </div>
            </div>
        </div>
    );
};
