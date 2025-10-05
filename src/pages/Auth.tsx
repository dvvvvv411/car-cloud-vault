import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { loginSchema } from '@/lib/validation/authSchema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Loader2, Mail, Lock } from 'lucide-react';
import kbsLogo from '@/assets/kbs_blue.png';

const Auth = () => {
  const navigate = useNavigate();
  const { user, role, signIn, loading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user && role) {
      if (role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    }
  }, [user, role, authLoading, navigate]);

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleLogin = async (values: z.infer<typeof loginSchema>) => {
    setIsLoading(true);
    
    const { error } = await signIn(values.email, values.password);
    
    if (error) {
      toast({
        title: 'Fehler beim Anmelden',
        description: error.message === 'Invalid login credentials'
          ? 'E-Mail oder Passwort ist falsch'
          : error.message,
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }

    // Navigation happens automatically via useEffect
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg animate-fade-in rounded-3xl shadow-xl">
        <CardHeader className="text-center space-y-6 pt-8 pb-4">
          <div className="flex justify-center">
            <img src={kbsLogo} alt="KBS Logo" className="h-24 object-contain mb-2" />
          </div>
          <CardTitle className="text-3xl font-bold">Geschützter Bereich</CardTitle>
          <CardDescription className="text-base">
            Bitte melden Sie sich mit Ihren Admin-Zugangsdaten an.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-6">
            <div className="space-y-2">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="E-Mail-Adresse"
                  className="h-12 pl-12 rounded-full"
                  {...loginForm.register('email')}
                  disabled={isLoading}
                />
              </div>
              {loginForm.formState.errors.email && (
                <p className="text-sm text-destructive px-4">
                  {loginForm.formState.errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="Passwort"
                  className="h-12 pl-12 rounded-full"
                  {...loginForm.register('password')}
                  disabled={isLoading}
                />
              </div>
              {loginForm.formState.errors.password && (
                <p className="text-sm text-destructive px-4">
                  {loginForm.formState.errors.password.message}
                </p>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 rounded-full text-base font-semibold" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Wird angemeldet...
                </>
              ) : (
                'Anmelden'
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t">
            <p className="text-sm text-muted-foreground text-center leading-relaxed">
              Admin-Login für autorisierte Benutzer.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
