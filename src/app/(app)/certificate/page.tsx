'use client';

import { useAuth } from '@/context/auth-context';
import { PageTransitionWrapper } from '@/components/page-transition-wrapper';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Printer, Award, ShieldCheck } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';

const OfficialSeal = () => (
    <div className="relative h-32 w-32">
        <svg viewBox="0 0 100 100" className="absolute inset-0">
            <circle cx="50" cy="50" r="48" fill="none" stroke="hsl(var(--primary))" strokeWidth="2"/>
            <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--primary))" strokeWidth="1" strokeDasharray="3 2"/>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-primary">
            <Award className="h-12 w-12" />
            <p className="text-xs font-bold mt-1 tracking-wider">VERIFIED</p>
        </div>
    </div>
);


export default function CertificatePage() {
    const { user, loading } = useAuth();
    
    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <PageTransitionWrapper className="container py-10">
                 <div className="max-w-4xl mx-auto p-8 bg-card border rounded-lg shadow-lg">
                    <Skeleton className="h-10 w-3/4 mx-auto" />
                    <Skeleton className="h-6 w-1/2 mx-auto mt-4" />
                    <Separator className="my-8" />
                    <Skeleton className="h-5 w-1/3 mb-4" />
                    <Skeleton className="h-20 w-full mb-8" />
                    <div className="flex justify-between items-center">
                        <div className="w-1/3">
                            <Skeleton className="h-5 w-full mb-2" />
                            <Skeleton className="h-12 w-full" />
                        </div>
                        <Skeleton className="h-32 w-32 rounded-full" />
                        <div className="w-1/3">
                            <Skeleton className="h-5 w-full mb-2" />
                            <Skeleton className="h-12 w-full" />
                        </div>
                    </div>
                </div>
            </PageTransitionWrapper>
        )
    }

    if (!user) {
        return (
             <PageTransitionWrapper className="container py-10 text-center">
                <h1 className="text-2xl font-bold">Access Denied</h1>
                <p className="text-muted-foreground">Please log in to view your certificate.</p>
                <Button asChild className="mt-4"><Link href="/login">Login</Link></Button>
            </PageTransitionWrapper>
        )
    }

    if (!user.company || !user.companyDescription || !user.location) {
        return (
             <PageTransitionWrapper className="container py-10 text-center">
                <h1 className="text-2xl font-bold">Profile Incomplete</h1>
                <p className="text-muted-foreground">Please complete your company name, description, and location in your profile to generate a certificate.</p>
                <Button asChild className="mt-4"><Link href="/profile">Complete Profile</Link></Button>
            </PageTransitionWrapper>
        )
    }

    const certificateId = `REVO-${new Date().getFullYear()}-${user.id.substring(0, 8).toUpperCase()}`;
    const issueDate = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

    return (
        <PageTransitionWrapper className="bg-background py-10 print:bg-white print:py-0">
            <div id="certificate-print-area" className="max-w-4xl mx-auto p-4 sm:p-8 bg-card border-2 border-primary/20 rounded-lg shadow-2xl font-serif text-foreground print:shadow-none print:border-none print:rounded-none">
                <div className="text-center p-4 border-b-4 border-double border-primary/50">
                    <ShieldCheck className="h-12 w-12 mx-auto text-primary" />
                    <h1 className="text-4xl font-bold font-headline mt-2 text-primary">Certificate of Environmental Compliance</h1>
                    <p className="text-lg text-muted-foreground">Form-12: Authorization for Waste Diversion</p>
                </div>
                
                <div className="my-10 text-center space-y-4">
                    <p className="text-lg">This is to certify that</p>
                    <h2 className="text-3xl font-bold tracking-wider">{user.company}</h2>
                    <p className="text-lg">located at <span className="font-semibold">{user.location}</span></p>
                    <p className="text-lg">
                        has successfully diverted industrial waste from landfills through the REVO platform during the fiscal year {new Date().getFullYear()}.
                    </p>
                </div>

                <div className="p-6 bg-muted/50 rounded-lg text-center">
                     <p className="text-base">
                        This entity has demonstrated a commitment to the circular economy by ensuring its industrial byproducts are responsibly recycled and repurposed, in accordance with the guidelines set by the State Pollution Control Board.
                    </p>
                </div>
                
                <div className="mt-12 flex justify-around items-end text-center">
                    <div className="w-1/3">
                        <p className="font-sans font-bold text-2xl italic signature">A. K. Sharma</p>
                        <Separator className="my-2" />
                        <p className="font-semibold">Director</p>
                        <p className="text-sm text-muted-foreground">State Pollution Control Board</p>
                    </div>

                    <OfficialSeal />
                    
                    <div className="w-1/3">
                        <p className="font-sans font-bold text-2xl italic signature">R. Verma</p>
                        <Separator className="my-2" />
                        <p className="font-semibold">Chief Executive Officer</p>
                        <p className="text-sm text-muted-foreground">REVO</p>
                    </div>
                </div>

                 <div className="mt-12 pt-6 border-t border-dashed text-sm text-muted-foreground flex justify-between">
                    <div>
                        <p><span className="font-semibold">Certificate ID:</span> {certificateId}</p>
                    </div>
                     <div>
                        <p><span className="font-semibold">Date of Issue:</span> {issueDate}</p>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto mt-8 text-center print:hidden">
                <Button size="lg" onClick={handlePrint}>
                    <Printer className="mr-2 h-5 w-5" />
                    Print / Download as PDF
                </Button>
            </div>
        </PageTransitionWrapper>
    );
}
