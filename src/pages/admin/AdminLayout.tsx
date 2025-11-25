import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, Car, MessageSquare, Users, LogOut, Menu, Palette, UserPlus, KeyRound, Phone, Mail } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useState, useEffect } from "react";
import { ChangePasswordDialog } from "@/components/admin/ChangePasswordDialog";

const INQUIRY_ONLY_USER_ID = '8d7a682d-5d5e-43ff-8b73-513464eb16fc';
const KALTAQUISE_ONLY_USER_ID = 'd173101f-803b-4531-8ff3-722be030b267';
const ADMIN_EMAIL = 'admin@admin.de';

const navItems = [
  { title: 'Dashboard', url: '/admin', icon: LayoutDashboard },
  { title: 'Positionen', url: '/admin/positionen', icon: Car },
  { title: 'Fahrzeuge', url: '/admin/fahrzeuge', icon: Car },
  { title: 'Branding', url: '/admin/branding', icon: Palette },
  { title: 'Emails', url: '/admin/emails', icon: Mail },
  { title: 'Anfragen', url: '/admin/anfragen', icon: MessageSquare },
  { title: 'Leads', url: '/admin/leads', icon: UserPlus },
  { title: 'Kaltaquise', url: '/admin/kaltaquise', icon: Phone },
  { title: 'Benutzer', url: '/admin/benutzer', icon: Users },
];

export default function AdminLayout() {
  const { user, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  const isInquiryOnlyUser = user?.id === INQUIRY_ONLY_USER_ID;
  const isKaltaquiseOnlyUser = user?.id === KALTAQUISE_ONLY_USER_ID;
  const isAdmin = user?.email === ADMIN_EMAIL;
  const visibleNavItems = isInquiryOnlyUser 
    ? navItems.filter(item => item.url === '/admin/anfragen')
    : isKaltaquiseOnlyUser
    ? navItems.filter(item => item.url === '/admin/kaltaquise')
    : navItems;

  useEffect(() => {
    if (isInquiryOnlyUser && location.pathname === '/admin') {
      navigate('/admin/anfragen', { replace: true });
    } else if (isKaltaquiseOnlyUser && location.pathname === '/admin') {
      navigate('/admin/kaltaquise', { replace: true });
    }
  }, [isInquiryOnlyUser, isKaltaquiseOnlyUser, location.pathname, navigate]);

  const handleLogout = async () => {
    await signOut();
  };

  const SidebarNav = () => (
    <div className="flex flex-col h-full">
      <div className="flex-1 py-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs text-muted-foreground/70 uppercase tracking-wider px-4 mb-2">Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1 px-2">
              {visibleNavItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end={item.url === '/admin'}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                          isActive 
                            ? 'bg-primary/10 text-primary font-medium shadow-sm' 
                            : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                        }`
                      }
                      onClick={() => setMobileOpen(false)}
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      <span className="text-sm font-medium">{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </div>
      
      <div className="p-4 border-t border-border/40 bg-muted/20">
        <div className="mb-3 px-2 py-1.5 rounded-lg bg-background/60 text-xs text-muted-foreground truncate">
          {user?.email}
        </div>
        {(isAdmin || isKaltaquiseOnlyUser) && (
          <Button 
            onClick={() => setPasswordDialogOpen(true)}
            variant="outline" 
            className="w-full justify-start mb-2 hover:bg-accent transition-all duration-200"
          >
            <KeyRound className="mr-2 h-4 w-4" />
            <span className="text-sm">Passwort ändern</span>
          </Button>
        )}
        <Button 
          onClick={handleLogout} 
          variant="outline" 
          className="w-full justify-start hover:bg-destructive hover:text-destructive-foreground transition-all duration-200"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span className="text-sm">Abmelden</span>
        </Button>
      </div>
    </div>
  );

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-background to-muted/20">
        {/* Desktop Sidebar */}
        <Sidebar className="hidden md:flex border-r border-border/40 bg-card/50 backdrop-blur-sm">
          <SidebarContent>
            <div className="p-6 border-b border-border/40">
              <h1 className="text-xl font-bold text-foreground tracking-tight">Admin Panel</h1>
              <p className="text-xs text-muted-foreground mt-1">Verwaltungszentrale</p>
            </div>
            <SidebarNav />
          </SidebarContent>
        </Sidebar>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="h-16 border-b border-border/40 bg-card/50 backdrop-blur-sm flex items-center justify-between px-6 shadow-sm">
            {/* Mobile Menu */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon" className="hover:bg-muted/50">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <div className="p-6 border-b border-border/40">
                  <h1 className="text-xl font-bold text-foreground tracking-tight">Admin Panel</h1>
                  <p className="text-xs text-muted-foreground mt-1">Verwaltungszentrale</p>
                </div>
                <SidebarNav />
              </SheetContent>
            </Sheet>

            <SidebarTrigger className="hidden md:flex hover:bg-muted/50 transition-colors" />

            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground hidden sm:inline font-medium">
                {user?.email}
              </span>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 p-8 bg-transparent overflow-auto">
            <div className="max-w-[2000px] mx-auto">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
      <ChangePasswordDialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen} />
    </SidebarProvider>
  );
}
