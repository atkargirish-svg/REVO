import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bot, CheckCircle, Percent, Target } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import type { Product } from "@/lib/types";
import { appraiseWaste } from "@/ai/flows/appraise-waste-flow";
import { PlaceHolderImages } from "@/lib/placeholder-images";

// This function converts a URL to a data URI
async function urlToDataUri(url: string) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);
        const blob = await response.blob();
        const buffer = Buffer.from(await blob.arrayBuffer());
        return `data:${blob.type};base64,${buffer.toString('base64')}`;
    } catch (error) {
        console.error("Error converting URL to Data URI:", error);
        return null;
    }
}

interface AIAppraisalProps {
    product: Product;
}

export async function AIAppraisal({ product }: AIAppraisalProps) {
    
    const isUrl = product.imageId.startsWith('http');
    const image = isUrl ? null : PlaceHolderImages.find(img => img.id === product.imageId);
    const imageUrl = isUrl ? product.imageId : image?.imageUrl;

    if (!imageUrl) {
         return (
            <Card className="bg-destructive/10 border-destructive/20">
                 <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Bot className="h-6 w-6 text-destructive"/> AI Appraisal Failed</CardTitle>
                    <CardDescription>No image found for analysis.</CardDescription>
                </CardHeader>
            </Card>
        )
    }

    const photoDataUri = await urlToDataUri(imageUrl);

    if (!photoDataUri) {
         return (
            <Card className="bg-destructive/10 border-destructive/20">
                 <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Bot className="h-6 w-6 text-destructive"/> AI Appraisal Failed</CardTitle>
                    <CardDescription>Could not load image for analysis.</CardDescription>
                </CardHeader>
            </Card>
        )
    }

    const appraisal = await appraiseWaste({
        productName: product.name,
        description: product.description,
        category: product.category,
        photoDataUri: photoDataUri,
    }).catch(err => {
        console.error("AI Appraisal failed:", err);
        return null; // Ensure promise resolves to null on error
    });

    if (!appraisal) {
        return (
            <Card className="bg-destructive/10 border-destructive/20">
                 <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Bot className="h-6 w-6 text-destructive"/> AI Appraisal Failed</CardTitle>
                    <CardDescription>Could not generate an AI appraisal for this item. The model may be offline. Please try again later.</CardDescription>
                </CardHeader>
            </Card>
        )
    }

    return (
        <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Bot className="h-6 w-6 text-primary"/> AI Appraisal</CardTitle>
                <CardDescription>Live analysis of this waste stream by REVO.</CardDescription>
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
                    <Badge variant="secondary" className="text-xl bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 border-green-300/50">
                        {appraisal.recyclabilityScore}%
                    </Badge>
                </div>

                <div className="space-y-2 p-3 rounded-md bg-background/50">
                    <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-muted-foreground"/>
                        <p className="font-semibold">Quality Report</p>
                    </div>
                    <div className="prose prose-sm dark:prose-invert text-muted-foreground pl-8 text-sm">
                        <ReactMarkdown>{appraisal.qualityReport}</ReactMarkdown>
                    </div>
                </div>

                <div className="space-y-2 p-3 rounded-md bg-background/50">
                    <div className="flex items-center gap-3">
                        <Target className="h-5 w-5 text-muted-foreground"/>
                        <p className="font-semibold">Ideal Buyer Profile</p>
                    </div>
                    <p className="text-muted-foreground pl-8 text-sm">{appraisal.idealBuyerProfile}</p>
                </div>
            </CardContent>
        </Card>
    );
}
