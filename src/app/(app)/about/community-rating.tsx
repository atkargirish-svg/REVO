
'use client';
import { useState, useEffect } from 'react';
import { getCommunityRating } from '@/lib/data';
import { Card } from '@/components/ui/card';
import { Star } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function CommunityRating() {
  const [rating, setRating] = useState(0);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRating = async () => {
      setLoading(true);
      const { average, count } = await getCommunityRating();
      setRating(average);
      setCount(count);
      setLoading(false);
    };
    fetchRating();
  }, []);

  if (loading) {
    return (
        <Card className="bg-card/80 p-6 text-center animate-border-glow">
            <h2 className="text-2xl font-bold font-headline mb-4">Our Community Rating</h2>
            <Skeleton className="h-8 w-32 mx-auto mb-2" />
            <Skeleton className="h-6 w-24 mx-auto mb-2" />
            <Skeleton className="h-4 w-28 mx-auto" />
      </Card>
    )
  }

  return (
    <Card className="bg-card/80 p-6 text-center animate-border-glow">
      <h2 className="text-2xl font-bold font-headline mb-4">Our Community Rating</h2>
      <div className="flex justify-center items-center gap-2 text-yellow-500 mb-2">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className={`h-8 w-8 transition-colors ${i < Math.round(rating) ? 'fill-current' : 'fill-muted stroke-muted-foreground'}`} />
        ))}
      </div>
      <p className="text-xl font-semibold">{rating.toFixed(1)} out of 5</p>
      <p className="text-sm text-muted-foreground">Based on {count} ratings</p>
    </Card>
  );
}
