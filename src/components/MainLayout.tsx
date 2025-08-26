
import { useEffect, useState } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { NotificationCenter } from "@/components/NotificationCenter";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserProfileMenu } from "@/components/UserProfileMenu";
import { HeaderBreadcrumb } from "@/components/HeaderBreadcrumb";
import { GlobalSearch } from "@/components/GlobalSearch";
import { User, Session } from '@supabase/supabase-js';
import { Card, CardContent } from "@/components/ui/card";
import { Search, Command } from "lucide-react";
import { Button } from "@/components/ui/button";

const MainLayout = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  
  const { toast } = useToast();
  const navigate = useNavigate();

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (!session?.user) {
          navigate('/login');
        } else {
          // Fetch user profile when authenticated
          setTimeout(() => {
            fetchUserProfile(session.user.id);
          }, 0);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (!session?.user) {
        navigate('/login');
      } else {
        fetchUserProfile(session.user.id);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen abstract-bg flex items-center justify-center">
        <Card className="glass-card">
          <CardContent className="p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Carregando...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full abstract-bg">
        <AppSidebar userRole={profile?.role} />
        
        <div className="flex-1 flex flex-col relative z-50">
          {/* Enhanced Compact Header */}
          <header className="border-b border-border/50 backdrop-blur-sm bg-background/80 relative z-50">
            {/* Single Header Bar - Compact Design */}
            <div className="flex items-center justify-between px-4 py-2 min-h-[60px]">
              {/* Left Section */}
              <div className="flex items-center space-x-3">
                <SidebarTrigger className="lg:hidden" />
                
                {/* Breadcrumb */}
                <div className="hidden sm:block">
                  <HeaderBreadcrumb />
                </div>
              </div>

              {/* Center Section - Search */}
              <div className="flex-1 max-w-md mx-4">
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-muted-foreground h-9 bg-background/60 hover:bg-background/80"
                  onClick={() => setSearchOpen(true)}
                >
                  <Search className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Buscar...</span>
                  <span className="sm:hidden">Buscar</span>
                  <kbd className="pointer-events-none ml-auto hidden md:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                    <Command className="h-3 w-3" />K
                  </kbd>
                </Button>
              </div>

              {/* Right Section */}
              <div className="flex items-center space-x-1">
                {/* Theme Toggle */}
                <ThemeToggle />
                
                {/* Notifications */}
                <NotificationCenter />
                
                {/* User Profile Menu */}
                <div className="hidden md:block">
                  <UserProfileMenu user={user} profile={profile} />
                </div>
              </div>
            </div>

            {/* Mobile Breadcrumb */}
            <div className="px-4 pb-2 sm:hidden">
              <HeaderBreadcrumb />
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 relative z-50" style={{ pointerEvents: 'auto' }}>
            <Outlet />
          </main>
        </div>
      </div>

      {/* Global Search Dialog */}
      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </SidebarProvider>
  );
};

export default MainLayout;
