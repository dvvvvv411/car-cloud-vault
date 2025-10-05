import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut, Car, MessageSquare, Users } from 'lucide-react';
import kbsLogo from '@/assets/kbs_blue.png';

const Admin = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary-dark to-background">
      {/* Header */}
      <header className="glass-card sticky top-0 z-50 border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src={kbsLogo} alt="KBS Logo" className="h-10" />
              <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
            </div>
            <Button variant="outline" onClick={handleLogout} className="gap-2">
              <LogOut className="h-4 w-4" />
              Abmelden
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Card */}
        <Card className="glass-card mb-8 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Willkommen zurück!</CardTitle>
            <CardDescription className="text-white/70">
              Angemeldet als: {user?.email}
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Vehicles Management Card */}
          <Card className="glass-card border-white/10 hover:border-white/20 transition-all cursor-pointer">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-primary/20">
                  <Car className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-white">Fahrzeuge</CardTitle>
                  <CardDescription className="text-white/70">
                    Fahrzeuge verwalten
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-white/60 text-sm">
                Hinzufügen, bearbeiten und löschen von Fahrzeugen
              </p>
            </CardContent>
          </Card>

          {/* Inquiries Card */}
          <Card className="glass-card border-white/10 hover:border-white/20 transition-all cursor-pointer">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-primary/20">
                  <MessageSquare className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-white">Anfragen</CardTitle>
                  <CardDescription className="text-white/70">
                    Anfragen ansehen
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-white/60 text-sm">
                Kundenanfragen verwalten und beantworten
              </p>
            </CardContent>
          </Card>

          {/* Users Management Card */}
          <Card className="glass-card border-white/10 hover:border-white/20 transition-all cursor-pointer">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-primary/20">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-white">Benutzer</CardTitle>
                  <CardDescription className="text-white/70">
                    Benutzer verwalten
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-white/60 text-sm">
                Benutzerrollen und Berechtigungen verwalten
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Info Box */}
        <Card className="glass-card mt-8 border-white/10">
          <CardContent className="pt-6">
            <p className="text-white/70 text-center">
              Dies ist ein Platzhalter-Dashboard. Weitere Funktionen folgen in Kürze.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Admin;
