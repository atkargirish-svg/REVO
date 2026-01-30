
import Link from 'next/link';
import type { User } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowRight, Package } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TopSellerCardProps {
  seller: User;
  rank: number;
  productCount: number;
}

export default function TopSellerCard({ seller, rank, productCount }: TopSellerCardProps) {
  const sellerAvatarUrl = seller.avatar;

  const rankColors = [
    'border-yellow-400 bg-yellow-500/10 hover:bg-yellow-500/20', // 1st
    'border-slate-400 bg-slate-500/10 hover:bg-slate-500/20',   // 2nd
    'border-amber-600 bg-amber-700/10 hover:bg-amber-700/20',  // 3rd
  ];

  return (
    <Card className={cn("transition-all duration-300", rank <= 3 ? rankColors[rank - 1] : 'hover:border-primary/50 hover:bg-primary/5')}>
      <Link href={`/sellers/${seller.id}`} className="flex items-center gap-4 p-4 group">
        <div className={cn(
            "flex items-center justify-center h-12 w-12 rounded-lg text-2xl font-bold",
             rank === 1 && "text-yellow-400",
             rank === 2 && "text-slate-400",
             rank === 3 && "text-amber-600",
             rank > 3 && "text-muted-foreground"
            )}
        >
          #{rank}
        </div>
        <Avatar className="h-14 w-14 border-2 border-muted">
          {sellerAvatarUrl && <AvatarImage src={sellerAvatarUrl} alt={seller.company} />}
          <AvatarFallback className="text-xl">{seller.company.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <p className="font-bold text-lg group-hover:text-primary">{seller.company}</p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Package className="h-4 w-4" />
            <span>{productCount} {productCount > 1 ? 'streams' : 'stream'} listed</span>
          </div>
        </div>
        <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
      </Link>
    </Card>
  );
}
