import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Bot, CheckCircle, Percent, Target } from "lucide-react";
import { Skeleton } from "../ui/skeleton";

export function AIAppraisalSkeleton() {
    return (
        <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Bot className="h-6 w-6 text-primary"/> AI Appraisal</CardTitle>
                <CardDescription>Our AI is analyzing this waste stream...</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="flex items-center justify-between p-3 rounded-md bg-background/50">
                    <div className="flex items-center gap-3">
                        <Percent className="h-5 w-5 text-muted-foreground"/>
                        <div>
                            <p className="font-semibold">Recyclability Score</p>
                             <p className="text-sm text-muted-foreground">Estimated based on material & condition</p>
                        </div>
                    </div>
                    <Skeleton className="h-8 w-16" />
                </div>
                 <div className="space-y-2 p-3 rounded-md bg-background/50">
                    <div className="flex items-center gap-3">
                       <CheckCircle className="h-5 w-5 text-muted-foreground"/>
                       <p className="font-semibold">Quality Report</p>
                    </div>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                </div>
                 <div className="space-y-2 p-3 rounded-md bg-background/50">
                     <div className="flex items-center gap-3">
                        <Target className="h-5 w-5 text-muted-foreground"/>
                        <p className="font-semibold">Ideal Buyer Profile</p>
                     </div>
                    <Skeleton className="h-4 w-1/2" />
                </div>
            </CardContent>
        </Card>
    )
}
