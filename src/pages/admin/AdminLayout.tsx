import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, Car, MessageSquare, Users, LogOut, Menu, Palette, UserPlus, KeyRound, Phone, Eye, Landmark, Send } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useState, useEffect } from "react";
import { ChangePasswordDialog } from "@/components/admin/ChangePasswordDialog";

const INQUIRY_ONLY_USER_ID = '8d7a682d-5d5e-43ff-8b73-513464eb16fc';
const KALTAQUISE_ONLY_USER_ID = 'd173101f-803b-4531-8ff3-722be030b267';
const AMTSGERICHT_ONLY_USER_ID = '32a4a326-41b8-4dc6-be0d-f3defa261c8d';
const ADMIN_EMAIL = 'admin@admin.de';

type NavItem = { title: string; url: string; icon: typeof LayoutDashboard };
type NavGroup = { label: string | null; items: NavItem[] };

const navGroups: NavGroup[] = [
  {
    label: null,
    items: [
      { title: 'Dashboard', url: '/admin', icon: LayoutDashboard },
    ],
  },
  {
    label: 'Betrieb',
    items: [
      { title: 'Anfragen', url: '/admin/anfragen', icon: MessageSquare },
      { title: 'Amtsgericht', url: '/admin/amtsgericht', icon: Landmark },
      { title: 'Kaltaquise', url: '/admin/kaltaquise', icon: Phone },
      { title: 'Leads', url: '/admin/leads', icon: UserPlus },
    ],
  },
  {
    label: 'Einstellungen',
    items: [
      { title: 'Branding', url: '/admin/branding', icon: Palette },
      { title: 'Positionen', url: '/admin/positionen', icon: Car },
      { title: 'Fahrzeuge', url: '/admin/fahrzeuge', icon: Car },
      { title: 'Benutzer', url: '/admin/benutzer', icon: Users },
      { title: 'Preview', url: '/admin/preview', icon: Eye },
      { title: 'Telegram', url: '/admin/telegram', icon: Send },
    ],
  },
];

export default function AdminLayout() {
  const { user, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  const isInquiryOnlyUser = user?.id === INQUIRY_ONLY_USER_ID;
  const isKaltaquiseOnlyUser = user?.id === KALTAQUISE_ONLY_USER_ID;
  const isAmtsgerichtOnlyUser = user?.id === AMTSGERICHT_ONLY_USER_ID;
  const isAdmin = user?.email === ADMIN_EMAIL;
  const filterUrls = (urls: string[]) =>
    navGroups
      .map((g) => ({ ...g, items: g.items.filter((i) => urls.includes(i.url)) }))
      .filter((g) => g.items.length > 0);

  const visibleNavGroups = isAmtsgerichtOnlyUser
    ? filterUrls(['/admin/amtsgericht'])
    : isInquiryOnlyUser
    ? filterUrls(['/admin/anfragen', '/admin/amtsgericht'])
    : isKaltaquiseOnlyUser
    ? filterUrls(['/admin/kaltaquise'])
    : navGroups;

  useEffect(() => {
    if (isAmtsgerichtOnlyUser && location.pathname === '/admin') {
      navigate('/admin/amtsgericht', { replace: true });
    } else if (isInquiryOnlyUser && location.pathname === '/admin') {
      navigate('/admin/anfragen', { replace: true });
    } else if (isKaltaquiseOnlyUser && location.pathname === '/admin') {
      navigate('/admin/kaltaquise', { replace: true });
    }
  }, [isAmtsgerichtOnlyUser, isInquiryOnlyUser, isKaltaquiseOnlyUser, location.pathname, navigate]);

  const handleLogout = async () => {
    await signOut();
  };

  const SidebarNav = () => (
    <div className="flex flex-col h-full">
      <div className="flex-1 py-3">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] text-muted-foreground/70 uppercase tracking-[0.12em] font-semibold px-5 mb-2">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-0.5 px-3">
              {visibleNavItems.map((item, idx) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === '/admin'}
                      className={({ isActive }) =>
                        `group relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 animate-slide-in-left ${
                          isActive
                            ? 'bg-gradient-to-r from-primary/10 to-primary/5 text-primary font-semibold'
                            : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                        }`
                      }
                      style={{ animationDelay: `${idx * 30}ms` }}
                      onClick={() => setMobileOpen(false)}
                    >
                      {({ isActive }) => (
                        <>
                          {isActive && (
                            <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-primary shadow-[0_0_12px_hsl(var(--primary)/0.5)]" />
                          )}
                          <item.icon className={`h-[18px] w-[18px] flex-shrink-0 transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                          <span className="text-sm">{item.title}</span>
                        </>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </div>

      <div className="p-4 border-t border-border/40 bg-muted/20 backdrop-blur-sm">
        <div className="mb-3 flex items-center gap-2.5 px-2.5 py-2 rounded-xl bg-background/80 border border-border/40">
          <div className="h-7 w-7 rounded-full bg-gradient-to-br from-primary to-primary/70 text-primary-foreground flex items-center justify-center text-xs font-semibold flex-shrink-0">
            {(user?.email || '?').charAt(0).toUpperCase()}
          </div>
          <div className="text-xs text-muted-foreground truncate flex-1">
            {user?.email}
          </div>
        </div>
        {(isAdmin || isKaltaquiseOnlyUser || isAmtsgerichtOnlyUser) && (
          <Button
            onClick={() => setPasswordDialogOpen(true)}
            variant="outline"
            className="w-full justify-start mb-2 rounded-xl hover:bg-accent hover:border-primary/30 transition-all duration-200"
          >
            <KeyRound className="mr-2 h-4 w-4" />
            <span className="text-sm">Passwort ändern</span>
          </Button>
        )}
        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full justify-start rounded-xl hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-all duration-200"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span className="text-sm">Abmelden</span>
        </Button>
      </div>
    </div>
  );

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full admin-bg">
        {/* Desktop Sidebar */}
        <Sidebar className="hidden md:flex border-r border-border/40 bg-card/80 backdrop-blur-xl">
          <SidebarContent>
            <div className="px-6 py-5 border-b border-border/40">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground flex items-center justify-center shadow-[0_4px_12px_-2px_hsl(var(--primary)/0.4)]">
                  <LayoutDashboard className="h-[18px] w-[18px]" />
                </div>
                <div>
                  <h1 className="text-base font-bold text-foreground tracking-tight leading-tight">Admin Panel</h1>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">Verwaltungszentrale</p>
                </div>
              </div>
            </div>
            <SidebarNav />
          </SidebarContent>
        </Sidebar>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="h-16 border-b border-border/40 bg-card/70 backdrop-blur-xl flex items-center justify-between px-6 sticky top-0 z-30">
            {/* Mobile Menu */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon" className="rounded-xl hover:bg-muted/50">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <div className="px-6 py-5 border-b border-border/40">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground flex items-center justify-center shadow-[0_4px_12px_-2px_hsl(var(--primary)/0.4)]">
                      <LayoutDashboard className="h-[18px] w-[18px]" />
                    </div>
                    <div>
                      <h1 className="text-base font-bold text-foreground tracking-tight leading-tight">Admin Panel</h1>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">Verwaltungszentrale</p>
                    </div>
                  </div>
                </div>
                <SidebarNav />
              </SheetContent>
            </Sheet>

            <SidebarTrigger className="hidden md:flex rounded-xl hover:bg-muted/50 transition-colors" />

            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground hidden sm:inline font-medium">
                {user?.email}
              </span>
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-primary/70 text-primary-foreground flex items-center justify-center text-xs font-semibold shadow-[0_2px_8px_-2px_hsl(var(--primary)/0.4)]">
                {(user?.email || '?').charAt(0).toUpperCase()}
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 p-6 md:p-8 bg-transparent overflow-auto">
            <div className="max-w-[2000px] mx-auto animate-fade-in">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
      <ChangePasswordDialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen} />
    </SidebarProvider>
  );
}
