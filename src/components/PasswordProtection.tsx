import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Lock, Loader2 } from 'lucide-react';
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
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password === '123') {
      setError('');
      setIsLoading(true);
      
      setTimeout(() => {
        onSuccess();
      }, 500);
    } else {
      setError('Falsches Passwort. Bitte versuchen Sie es erneut.');
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg animate-fade-in rounded-3xl shadow-xl">
        <CardHeader className="text-center space-y-6 pt-8 pb-4">
          <div className="flex justify-center">
            <img 
              src={branding?.kanzlei_logo_url || kbsLogo} 
              alt="Kanzlei Logo" 
              className="h-24 object-contain mb-2"
            />
          </div>
          <CardTitle className="text-3xl font-bold">Geschützter Bereich</CardTitle>
          <CardDescription className="text-base">
            Bitte geben Sie das Passwort aus Ihrer E-Mail ein, um den geschützten Seiteninhalt einzusehen.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
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
                className="pl-10 h-12 rounded-full"
                autoFocus
                disabled={isLoading}
              />
            </div>
            {error && (
              <p className="text-sm text-destructive animate-fade-in">
                {error}
              </p>
            )}
            <Button type="submit" className="w-full h-12 rounded-full text-base font-semibold" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Lädt...
                </>
              ) : (
                'Zugang erhalten'
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t">
            <p className="text-sm text-muted-foreground text-center leading-relaxed">
              Diese Seite enthält vertrauliche Informationen und ist durch ein Passwort geschützt. 
              Der Zugang ist ausschließlich für autorisierte Empfänger bestimmt.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
