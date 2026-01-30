import { PageTransitionWrapper } from "@/components/page-transition-wrapper";
import { getUsers, getProducts } from "@/lib/data";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminDashboardClient from "@/components/admin/admin-dashboard-client";

export default async function AdminDashboardPage() {
    const users = await getUsers();
    const products = await getProducts();

    return (
        <PageTransitionWrapper className="container py-10">
            <div className="mb-8">
                <h1 className="text-3xl font-bold font-headline">Admin Dashboard</h1>
                <p className="text-muted-foreground">Platform-wide management and oversight.</p>
            </div>
            
            <Tabs defaultValue="products">
                <TabsList>
                    <TabsTrigger value="products">All Products</TabsTrigger>
                    <TabsTrigger value="users">All Users</TabsTrigger>
                </TabsList>
                <TabsContent value="products">
                    <AdminDashboardClient initialProducts={products} initialUsers={users} tab="products" />
                </TabsContent>
                <TabsContent value="users">
                    <AdminDashboardClient initialProducts={products} initialUsers={users} tab="users" />
                </TabsContent>
            </Tabs>
        </PageTransitionWrapper>
    )
}
