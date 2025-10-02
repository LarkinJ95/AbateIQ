
'use client';

import { useState, useRef } from 'react';
import { Header } from '@/components/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { Upload } from 'lucide-react';

export default function AdminSettingsPage() {
    const { toast } = useToast();
    const [companyName, setCompanyName] = useState('AbateIQ');
    const [logo, setLogo] = useState<string | null>(null);
    const logoInputRef = useRef<HTMLInputElement>(null);

    const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setLogo(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = () => {
        // In a real app, you would save these to a database.
        // For this prototype, we'll just show a toast.
        localStorage.setItem('companyName', companyName);
        if (logo) {
            localStorage.setItem('companyLogo', logo);
        }

        toast({
            title: 'Settings Saved',
            description: 'Your white-label settings have been updated.',
        });

        // Force a reload to see changes in the sidebar. This is a temporary solution.
        window.location.reload();
    };

    return (
        <div className="flex min-h-screen w-full flex-col">
            <Header title="Admin Center" />
            <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">White-Label Settings</CardTitle>
                        <CardDescription>
                            Customize the application with your own branding. Changes will be reflected after saving.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="companyName">Company Name</Label>
                            <Input 
                                id="companyName" 
                                value={companyName} 
                                onChange={(e) => setCompanyName(e.target.value)}
                                placeholder="Your Company Inc."
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="companyLogo">Company Logo</Label>
                            <div className="flex items-center gap-4">
                                <div className="w-20 h-20 border rounded-md flex items-center justify-center bg-muted">
                                    {logo ? (
                                        <Image src={logo} alt="Company Logo" width={80} height={80} className="object-contain" />
                                    ) : (
                                       <span className="text-xs text-muted-foreground">Preview</span>
                                    )}
                                </div>
                                <Input 
                                    id="companyLogo" 
                                    type="file" 
                                    ref={logoInputRef} 
                                    onChange={handleLogoChange}
                                    accept="image/png, image/jpeg, image/svg+xml"
                                    className="hidden"
                                />
                                <Button type="button" variant="outline" onClick={() => logoInputRef.current?.click()}>
                                    <Upload className="mr-2 h-4 w-4" />
                                    Upload Logo
                                </Button>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Recommended: SVG or PNG with a transparent background.
                            </p>
                        </div>

                        <Button onClick={handleSave}>Save Changes</Button>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
