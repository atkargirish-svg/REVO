'use client';

import { PageTransitionWrapper } from '@/components/page-transition-wrapper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ProfileForm from '@/components/user/profile-form';
import { useAuth } from '@/context/auth-context';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProfilePage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
        <PageTransitionWrapper className="container py-10">
            <div className="mx-auto max-w-2xl">
                <div className="space-y-4">
                    <Skeleton className="h-8 w-1/2" />
                    <Skeleton className="h-4 w-3/4" />
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-1/3" />
                            <Skeleton className="h-4 w-2/3" />
                        </CardHeader>
                        <CardContent className="space-y-8">
                           <div className="space-y-4">
                             <Skeleton className="h-20 w-full" />
                           </div>
                           <div className="space-y-4">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                           </div>
                            <Skeleton className="h-12 w-full" />
                        </CardContent>
                    </Card>
                </div>
            </div>
      </PageTransitionWrapper>
    );
  }

  if (!user) {
    return (
      <PageTransitionWrapper className="container py-10">
        <div className="text-center">
            <h1 className="text-2xl font-bold">Please log in</h1>
            <p className="text-muted-foreground">You need to be logged in to view your profile.</p>
        </div>
      </PageTransitionWrapper>
    );
  }

  return (
    <PageTransitionWrapper className="container py-10">
      <div className="mx-auto max-w-2xl">
         <div className="text-center mb-8">
            <h1 className="text-4xl font-bold font-headline">Your Profile</h1>
            <p className="text-lg text-muted-foreground mt-2">Update your information and view your saved items.</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">Personal Information</CardTitle>
            <CardDescription>Update your profile and choose an avatar.</CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileForm user={user} />
          </CardContent>
        </Card>
      </div>
    </PageTransitionWrapper>
  );
}
