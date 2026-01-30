import Link from 'next/link';
import type { User } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowRight, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProducerCardProps {
  user: User;
}

export default function ProducerCard({ user }: ProducerCardProps) {
  const userAvatarUrl = user.avatar;

  return (
    <Card className="h-full transition-all duration-300 hover:border-primary/50 hover:bg-primary/5 hover:shadow-md">
      <Link href={`/sellers/${user.id}`} className="flex items-center gap-4 p-4 group">
        <Avatar className="h-14 w-14 border-2 border-muted">
          {userAvatarUrl && <AvatarImage src={userAvatarUrl} alt={user.company} />}
          <AvatarFallback className="text-xl">{user.company.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-lg truncate group-hover:text-primary">{user.company}</p>
          {user.location && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="truncate">{user.location}</span>
            </div>
          )}
        </div>
        <ArrowRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
      </Link>
    </Card>
  );
}
