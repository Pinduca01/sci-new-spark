import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { MoreVertical } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useUserRole } from "@/hooks/useUserRole";

interface Viatura {
  id: string;
  nome_viatura: string;
  prefixo: string;
  modelo: string;
  tipo: string;
  status: string;
  observacoes: string | null;
}

interface ViaturasGridProps {
  viaturas: Viatura[];
  onSelectViatura: (viatura: Viatura) => void;
  onViaturasUpdate: () => void;
  onEditViatura: (viatura: Viatura) => void;
}

export const ViaturasGrid = ({ viaturas, onSelectViatura, onViaturasUpdate, onEditViatura }: ViaturasGridProps) => {
  const { isAdmin } = useUserRole();
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viatureToDelete, setViatureToDelete] = useState<string | null>(null);

  const handleDeleteClick = (id: string) => {
    setViatureToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!viatureToDelete) return;

    try {
      const { error } = await supabase
        .from('viaturas')
        .delete()
        .eq('id', viatureToDelete);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Viatura excluída com sucesso!",
      });

      onViaturasUpdate();
    } catch (error) {
      console.error('Erro ao excluir viatura:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir viatura. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setViatureToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setViatureToDelete(null);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'ativo': return 'bg-green-500';
      case 'manutencao': return 'bg-yellow-500';
      case 'inativo': return 'bg-red-500';
      default: return 'bg-muted';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {viaturas.map((viatura) => (
        <Card key={viatura.id} className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold">
              {viatura.prefixo}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge 
                className={`${getStatusColor(viatura.status)} text-white`}
              >
                {viatura.status}
              </Badge>
              {isAdmin && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEditViatura(viatura)}>
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleDeleteClick(viatura.id)}
                      className="text-red-600"
                    >
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </CardHeader>
          <CardContent onClick={() => onSelectViatura(viatura)}>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Nome:</span>
                <span className="font-medium">{viatura.nome_viatura}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Modelo:</span>
                <span className="font-medium">{viatura.modelo}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Tipo:</span>
                <span className="font-medium">{viatura.tipo}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta viatura? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelDelete}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
