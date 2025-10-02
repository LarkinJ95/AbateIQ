
'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth, useUser, initiateEmailSignUp } from '@/firebase';
import { ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { Logo } from '@/components/logo';

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // One-time super user creation
    const createSuperUser = async () => {
        if (auth) {
            try {
                // This is a special, one-time operation.
                await createUserWithEmailAndPassword(auth, "jlarkin@bierlein.com", "Larkin0!");
                toast({
                    title: 'Super User Created',
                    description: 'The user jlarkin@bierlein.com has been created.',
                });
            } catch (error: any) {
                if (error.code === 'auth/email-already-in-use') {
                    // This is expected if the user already exists. We can ignore it.
                } else {
                     toast({
                        title: 'Super User Creation Failed',
                        description: error.message,
                        variant: 'destructive',
                    });
                }
            }
        }
    };
    createSuperUser();
  }, [auth, toast]);

  useEffect(() => {
    if (user && !isUserLoading) {
      router.push('/dashboard');
    }
  }, [user, isUserLoading, router]);

  const handleSignUp = async () => {
    setIsLoading(true);
    // Non-blocking sign-up. The onAuthStateChanged listener will handle success/redirect.
    initiateEmailSignUp(auth, email, password);
    // We don't await. A timeout is used to reset loading state in case of silent failures.
    setTimeout(() => setIsLoading(false), 5000);
  };
  
    if (isUserLoading || user) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <ShieldAlert className="h-12 w-12 text-primary" />
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <Logo className="w-48 h-auto mx-auto mb-4" />
          <CardTitle className="text-2xl font-headline">Create an Account</CardTitle>
          <CardDescription>
            Enter your email and password to get started.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button className="w-full" onClick={handleSignUp} disabled={isLoading}>
            {isLoading ? 'Creating Account...' : 'Sign Up'}
          </Button>
          <div className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="underline hover:text-primary">
              Sign in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
