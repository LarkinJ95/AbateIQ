'use client';

import { Header } from '@/components/header';
import { useUser, useAuth } from '@/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
    const { user } = useUser();
    const auth = useAuth();
    const { toast } = useToast();
    const router = useRouter();

    const handleLogout = async () => {
        try {
            await signOut(auth);
            toast({
                title: 'Logged Out',
                description: 'You have been successfully logged out.',
            });
            router.push('/login');
        } catch (error: any) {
            toast({
                title: 'Logout Failed',
                description: error.message || 'An error occurred during logout.',
                variant: 'destructive',
            });
        }
    };

    return (
        <div className="flex min-h-screen w-full flex-col">
            <Header title="Settings" />
            <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">My Profile</CardTitle>
                        <CardDescription>Manage your account details.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input id="name" value={user?.displayName || 'Not set'} disabled />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" value={user?.email || 'Not set'} disabled />
                        </div>
                    </CardContent>
                </Card>

                 <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Account Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Button variant="destructive" onClick={handleLogout}>Log Out</Button>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
