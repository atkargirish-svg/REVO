'use client';

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { FileText, Loader2 } from "lucide-react";
import { useState, useTransition } from "react";

export function SmartContractButton() {
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();

    const handleClick = () => {
        startTransition(() => {
            // Simulate an API call
            setTimeout(() => {
                toast({
                    title: "Smart Contract Initiated",
                    description: "A notification has been sent to both parties to confirm the deal.",
                });
            }, 1000);
        });
    };

    return (
        <Button 
            size="lg" 
            className="w-full bg-accent text-accent-foreground hover:bg-accent/90 animate-pulse-glow"
            onClick={handleClick}
            disabled={isPending}
        >
            {isPending ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
                <FileText className="mr-2 h-5 w-5" />
            )}
            Auto-Execute Smart Contract
        </Button>
    );
}
