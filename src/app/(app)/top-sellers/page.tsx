'use client';

import { useState, useEffect } from 'react';
import { PageTransitionWrapper } from '@/components/page-transition-wrapper';
import { Input } from '@/components/ui/input';
import { Search, Building } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollAnimation } from '@/components/scroll-animation';
import { useData } from '@/context/data-context';
import type { User } from '@/lib/types';
import ProducerCard from '@/components/user/top-seller-card';

export default function ProducersDirectoryPage() {
  const { users, loading: isPending } = useData();
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Start with only users who have a complete profile
    let tempUsers = users.filter(u => u.companyDescription && u.location);

    if (searchTerm) {
      tempUsers = tempUsers.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.location && u.location.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    setFilteredUsers(tempUsers);
  }, [searchTerm, users]);

  return (
    <PageTransitionWrapper className="container py-10">
      <div className="flex flex-col gap-6 mb-8">
        <div className='text-center'>
            <Building className="mx-auto h-12 w-12 text-primary" />
            <h1 className="mt-4 text-4xl sm:text-5xl font-extrabold tracking-tight font-headline">Producers Directory</h1>
            <p className="mt-2 text-lg text-muted-foreground">Find and connect with waste producers and recyclers on our platform.</p>
        </div>
        <div className="relative max-w-lg mx-auto w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
                placeholder="Search by company name, contact, or location..."
                className="pl-10 h-11"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
      </div>


      {isPending ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="p-4 space-y-3 rounded-lg bg-card border flex items-center gap-4">
                    <Skeleton className="h-14 w-14 rounded-full" />
                    <div className="space-y-2 flex-1">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </div>
                </div>
            ))}
        </div>
      ) : filteredUsers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user, index) => (
            !user.isAdmin && (
              <ScrollAnimation key={user.id} animation="zoom-in" delay={index * 50}>
                  <ProducerCard user={user} />
              </ScrollAnimation>
            )
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-muted-foreground text-lg">No producers found matching your criteria.</p>
        </div>
      )}
    </PageTransitionWrapper>
  );
}
