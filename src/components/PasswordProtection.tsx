import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';
import kbsLogo from '@/assets/kbs_blue.png';

interface PasswordProtectionProps {
  onSuccess: () => void;
  branding?: {
    kanzlei_logo_url?: string;
  };
  slug?: string;
}

export const PasswordProtection = ({ onSuccess, branding, slug }: PasswordProtectionProps) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password === '123') {
      setError('');
      onSuccess();
    } else {
      setError('Falsches Passwort. Bitte versuchen Sie es erneut.');
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md animate-fade-in">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <img 
              src={branding?.kanzlei_logo_url || kbsLogo} 
              alt="Kanzlei Logo" 
              className="h-16 object-contain"
            />
          </div>
          <CardTitle className="text-2xl">Geschützter Bereich</CardTitle>
          <CardDescription>
            Bitte geben Sie das Passwort aus Ihrer E-Mail ein
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="password"
                placeholder="Passwort eingeben"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                className="pl-10"
                autoFocus
              />
            </div>
            {error && (
              <p className="text-sm text-destructive animate-fade-in">
                {error}
              </p>
            )}
            <Button type="submit" className="w-full">
              Zugang erhalten
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
