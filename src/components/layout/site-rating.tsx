
'use client';

import { Star } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { addCommunityRating } from '@/lib/data';
import { useAuth } from '@/context/auth-context';

export default function SiteRating() {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasRated, setHasRated] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
        const rated = localStorage.getItem(`rated_${user.id}`);
        if(rated) {
            setHasRated(true);
            setRating(parseInt(rated, 10));
        }
    }
  }, [user]);

  const handleRating = async (newRating: number) => {
    if (!user) {
        toast({ title: "Please login to rate", variant: "destructive"});
        return;
    }
    if (hasRated || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await addCommunityRating(newRating, user.id);
      setRating(newRating);
      setHasRated(true);
      localStorage.setItem(`rated_${user.id}`, newRating.toString());
      toast({ title: `You rated ${newRating} stars. Thanks!` });
    } catch (error: any) {
      toast({ title: "Error submitting rating", description: error.message, variant: "destructive"});
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 text-sm text-muted-foreground">
        <p className="font-medium">Rate our website</p>
        <div 
            className="flex items-center gap-1"
            onMouseLeave={() => setHoverRating(0)}
        >
            {[...Array(5)].map((_, index) => {
            const ratingValue = index + 1;
            return (
                <Star
                    key={ratingValue}
                    className={cn(
                        'h-5 w-5 cursor-pointer transition-all',
                        hasRated ? 'text-yellow-500/50 fill-yellow-500/50' : 'hover:text-yellow-500 hover:fill-yellow-500',
                        ratingValue <= (hoverRating || rating)
                        ? 'text-yellow-500 fill-yellow-500'
                        : 'text-muted-foreground/50'
                    )}
                    onClick={() => handleRating(ratingValue)}
                    onMouseEnter={() => !hasRated && setHoverRating(ratingValue)}
                />
            );
            })}
        </div>
    </div>
  );
}
