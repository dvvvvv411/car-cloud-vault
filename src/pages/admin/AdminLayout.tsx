import { Outlet, NavLink } from "react-router-dom";
import { LayoutDashboard, Car, MessageSquare, Users, LogOut, Menu, Palette, UserPlus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useState } from "react";

const navItems = [
  { title: 'Dashboard', url: '/admin', icon: LayoutDashboard },
  { title: 'Positionen', url: '/admin/positionen', icon: Car },
  { title: 'Branding', url: '/admin/branding', icon: Palette },
  { title: 'Anfragen', url: '/admin/anfragen', icon: MessageSquare },
  { title: 'Leads', url: '/admin/leads', icon: UserPlus },
  { title: 'Benutzer', url: '/admin/benutzer', icon: Users },
];

export default function AdminLayout() {
  const { user, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
  };

  const SidebarNav = () => (
    <div className="flex flex-col h-full">
      <div className="flex-1">
        <SidebarGroup>
          <SidebarGroupLabel className="text-foreground">Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end={item.url === '/admin'}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                          isActive 
                            ? 'bg-primary/10 text-primary font-medium' 
                            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                        }`
                      }
                      onClick={() => setMobileOpen(false)}
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </div>
      
      <div className="p-4 border-t">
        <div className="mb-3 text-sm text-muted-foreground">
          {user?.email}
        </div>
        <Button 
          onClick={handleLogout} 
          variant="outline" 
          className="w-full justify-start"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Abmelden
        </Button>
      </div>
    </div>
  );

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        {/* Desktop Sidebar */}
        <Sidebar className="hidden md:flex border-r">
          <SidebarContent>
            <div className="p-4 border-b">
              <h1 className="text-xl font-bold text-foreground">Admin Panel</h1>
            </div>
            <SidebarNav />
          </SidebarContent>
        </Sidebar>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="h-16 border-b bg-card flex items-center justify-between px-4">
            {/* Mobile Menu */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <div className="p-4 border-b">
                  <h1 className="text-xl font-bold text-foreground">Admin Panel</h1>
                </div>
                <SidebarNav />
              </SheetContent>
            </Sheet>

            <SidebarTrigger className="hidden md:flex" />

            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground hidden sm:inline">
                {user?.email}
              </span>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 p-6 bg-muted/30">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
