import { useEffect, useState } from 'react';
import { useChecklistTemplates, type ChecklistTemplate } from '@/hooks/useChecklistTemplates';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Clock, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TemplateDetailsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templateId: string | null;
}

export const TemplateDetails = ({ open, onOpenChange, templateId }: TemplateDetailsProps) => {
  const { fetchTemplateById } = useChecklistTemplates();
  const [template, setTemplate] = useState<ChecklistTemplate | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (templateId && open) {
      loadTemplate();
    }
  }, [templateId, open]);

  const loadTemplate = async () => {
    if (!templateId) return;
    setLoading(true);
    try {
      const data = await fetchTemplateById(templateId);
      setTemplate(data);
    } catch (error) {
      console.error('Erro ao carregar template:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!template && !loading) return null;

  const itensObrigatorios = template?.itens?.filter((item) => item.obrigatorio).length || 0;
  const itensPorTipo = template?.itens?.reduce((acc, item) => {
    acc[item.tipo] = (acc[item.tipo] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const getCategoriaColor = (categoria: string) => {
    const colors: Record<string, string> = {
      viatura: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      medico: 'bg-red-500/10 text-red-500 border-red-500/20',
      seguranca: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
      estoque: 'bg-green-500/10 text-green-500 border-green-500/20',
      geral: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
    };
    return colors[categoria] || colors.geral;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            {template?.nome}
          </DialogTitle>
          <DialogDescription>
            Detalhes completos do template de checklist
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            Carregando...
          </div>
        ) : (
          <div className="space-y-6">
            {/* Informações Gerais */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Informações Gerais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Tipo de Viatura</p>
                    <p className="font-medium">{template?.tipo_viatura}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Categoria</p>
                    <Badge variant="outline" className={getCategoriaColor(template?.categoria || '')}>
                      {template?.categoria}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <div className="flex items-center gap-2">
                      {template?.ativo ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                          <span>Ativo</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 text-red-500" />
                          <span>Inativo</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Data de Criação</p>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>
                        {template?.created_at &&
                          format(new Date(template.created_at), "dd 'de' MMM 'de' yyyy", { locale: ptBR })}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Estatísticas */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Estatísticas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-primary">{template?.itens?.length || 0}</p>
                    <p className="text-sm text-muted-foreground">Total de Itens</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-green-500">{itensObrigatorios}</p>
                    <p className="text-sm text-muted-foreground">Obrigatórios</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-blue-500">{itensPorTipo['verificacao'] || 0}</p>
                    <p className="text-sm text-muted-foreground">Verificações</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-purple-500">
                      {(itensPorTipo['contagem'] || 0) + (itensPorTipo['medida'] || 0)}
                    </p>
                    <p className="text-sm text-muted-foreground">Medições</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lista de Itens */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Itens do Checklist</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {template?.itens?.map((item, index) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-muted-foreground w-8">
                          {index + 1}.
                        </span>
                        <div>
                          <p className="font-medium">
                            {item.item}
                            {item.obrigatorio && <span className="text-red-500 ml-1">*</span>}
                          </p>
                          {item.categoria && (
                            <p className="text-xs text-muted-foreground">
                              Categoria: {item.categoria}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {item.tipo}
                        </Badge>
                        {item.unidade && (
                          <Badge variant="outline" className="text-xs">
                            {item.unidade}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Ações */}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Fechar
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
