'use client';

import { PageTransitionWrapper } from "@/components/page-transition-wrapper";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle, Package, PackageCheck, Recycle, Loader2, FileCheck2, Download, AlertCircle, ExternalLink } from "lucide-react";
import SellerDashboardClient from "@/components/dashboard/seller-dashboard-client";
import { useAuth } from '@/context/auth-context';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useData } from "@/context/data-context";
import { updateProductStatus } from "@/lib/data";

const StatCard = ({ icon, title, value, isLoading }: { icon: React.ReactNode, title: string, value: number, isLoading: boolean }) => {
    if (isLoading) {
        return (
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-6 w-6" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-8 w-10" />
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                {icon}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
            </CardContent>
        </Card>
    )
};

export default function DashboardPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { userProducts: products, loading: isPending, refetchData } = useData();

  const handleStatusChange = async (productId: string, isSold: boolean) => {
    const newStatus = isSold ? 'sold' : 'available';
    
    try {
      await updateProductStatus(productId, newStatus);
      toast({
        title: "Status Updated",
        description: `Stream marked as ${newStatus}.`,
      });
      refetchData();
    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Update Failed",
            description: error.message || "Could not update stream status.",
        });
    }
  }

  const totalProducts = products.length;
  const activeListings = products.filter(p => !p.isSold).length;
  const productsSold = totalProducts - activeListings;
  const isProfileComplete = user && user.companyDescription && user.location;

  return (
    <PageTransitionWrapper className="container py-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
            <h1 className="text-3xl font-bold font-headline">My Waste Streams</h1>
            <p className="text-muted-foreground">Manage your active and diverted waste stream listings.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/add-product">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Waste Stream
          </Link>
        </Button>
      </div>
      
        <div className="grid gap-4 md:grid-cols-3 mb-8">
            <StatCard 
                title="Total Listings" 
                value={totalProducts} 
                icon={<Package className="h-4 w-4 text-muted-foreground"/>}
                isLoading={isPending}
            />
            <StatCard 
                title="Active Streams" 
                value={activeListings} 
                icon={<Recycle className="h-4 w-4 text-muted-foreground"/>}
                isLoading={isPending}
            />
            <StatCard 
                title="Streams Diverted" 
                value={productsSold} 
                icon={<PackageCheck className="h-4 w-4 text-muted-foreground"/>}
                isLoading={isPending}
            />
        </div>

        <div className="mb-8">
            <h2 className="text-2xl font-bold font-headline mb-4">Regulatory Compliance</h2>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileCheck2 className="h-5 w-5 text-muted-foreground" />
                        Auto-Compliance
                    </CardTitle>
                    <CardDescription>Stay audit-ready with automatically generated compliance documents.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-2">
                    <div>
                        <div className="flex justify-between items-center">
                            <p className="text-sm font-medium">Audit Readiness</p>
                            <p className="font-bold text-green-500">100%</p>
                        </div>
                        <Progress value={100} className="h-2 mt-1" />
                    </div>
                    {isProfileComplete ? (
                        <Button asChild className="w-full">
                            <Link href="/certificate" target="_blank">
                                <Download className="mr-2 h-4 w-4" />
                                Download Pollution Control Certificate (PDF)
                            </Link>
                        </Button>
                    ) : (
                        <Alert variant="default" className="border-primary/20 bg-primary/5 text-primary-foreground">
                            <AlertCircle className="h-4 w-4 text-primary" />
                            <AlertTitle className="text-primary">Profile Incomplete</AlertTitle>
                            <AlertDescription className="text-primary/80">
                                Please complete your profile to generate compliance documents.
                                <Button asChild variant="link" className="p-0 h-auto mt-1 text-primary">
                                    <Link href="/profile">
                                        Go to Profile <ExternalLink className="ml-1 h-3 w-3" />
                                    </Link>
                                </Button>
                            </AlertDescription>
                        </Alert>
                    )}
                </CardContent>
            </Card>
        </div>

        <div>
            <h2 className="text-2xl font-bold font-headline mb-4">Your Listings</h2>
            {isPending ? (
                 <div className="rounded-md border">
                    <div className="w-full text-center p-8">
                        <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
                        <p className="mt-4 text-muted-foreground">Loading your waste streams...</p>
                    </div>
                </div>
            ) : (
                <SellerDashboardClient 
                    products={products}
                    onProductDelete={refetchData}
                    onStatusChange={handleStatusChange}
                />
            )}
        </div>

    </PageTransitionWrapper>
  );
}
