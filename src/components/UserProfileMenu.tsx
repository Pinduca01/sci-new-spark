
import React from 'react';
import { User, Settings, LogOut, Shield, Mail } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface UserProfileMenuProps {
  user: any;
  profile: any;
}

export const UserProfileMenu: React.FC<UserProfileMenuProps> = ({ user, profile }) => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast({
          title: "Erro ao sair",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Logout realizado com sucesso",
          description: "Até a próxima!",
        });
        navigate('/login');
      }
    } catch (error) {
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro durante o logout.",
        variant: "destructive",
      });
    }
  };

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'supervisor':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'supervisor':
        return 'Supervisor';
      default:
        return 'Usuário';
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-full justify-start space-x-2 px-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={profile?.avatar_url} alt="Avatar" />
            <AvatarFallback className="bg-primary/10 text-primary font-medium">
              {getInitials(user?.email || 'SCI')}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex flex-col items-start text-left flex-1 min-w-0">
            <p className="text-sm font-medium truncate max-w-32">
              {profile?.nome || user?.email?.split('@')[0]}
            </p>
            <Badge variant="outline" className={`text-xs ${getRoleColor(profile?.role || 'user')}`}>
              {getRoleLabel(profile?.role || 'user')}
            </Badge>
          </div>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={profile?.avatar_url} alt="Avatar" />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {getInitials(user?.email || 'SCI')}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <p className="text-sm font-medium">
                  {profile?.nome || 'Usuário'}
                </p>
                <Badge variant="outline" className={`text-xs w-fit ${getRoleColor(profile?.role || 'user')}`}>
                  {getRoleLabel(profile?.role || 'user')}
                </Badge>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <Mail className="h-3 w-3" />
              <span className="truncate">{user?.email}</span>
            </div>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem className="cursor-pointer">
          <User className="mr-2 h-4 w-4" />
          <span>Meu Perfil</span>
        </DropdownMenuItem>
        
        {profile?.role === 'admin' && (
          <DropdownMenuItem className="cursor-pointer" onClick={() => navigate('/configuracoes')}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Configurações</span>
          </DropdownMenuItem>
        )}
        
        <DropdownMenuItem className="cursor-pointer">
          <Shield className="mr-2 h-4 w-4" />
          <span>Privacidade</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          className="cursor-pointer text-destructive focus:text-destructive" 
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
