import { useState } from 'react';
import { useChecklistTemplates } from '@/hooks/useChecklistTemplates';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Plus, Search, Edit, Copy, Trash2, Eye, CheckCircle2, XCircle } from 'lucide-react';
import { TemplateEditor } from './TemplateEditor';
import { TemplateDetails } from './TemplateDetails';

export const TemplatesList = () => {
  const { templates, isLoading, deleteTemplate, toggleStatus, duplicateTemplate } = useChecklistTemplates();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState<string>('all');
  const [filterCategoria, setFilterCategoria] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [editorOpen, setEditorOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);

  const filteredTemplates = templates?.filter((template) => {
    const matchesSearch = template.nome.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTipo = filterTipo === 'all' || template.tipo_viatura === filterTipo;
    const matchesCategoria = filterCategoria === 'all' || template.categoria === filterCategoria;
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'ativo' && template.ativo) || 
      (filterStatus === 'inativo' && !template.ativo);
    
    return matchesSearch && matchesTipo && matchesCategoria && matchesStatus;
  });

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

  const getTipoIcon = (tipo: string) => {
    const icons: Record<string, string> = {
      'BA-2': '🚑',
      'BA-MC': '🚒',
      'Almoxarifado': '📦',
      'Equipamentos': '🧰',
    };
    return icons[tipo] || '📋';
  };

  const handleEdit = (id: string) => {
    setSelectedTemplateId(id);
    setEditorOpen(true);
  };

  const handleView = (id: string) => {
    setSelectedTemplateId(id);
    setDetailsOpen(true);
  };

  const handleDelete = (id: string) => {
    setTemplateToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (templateToDelete) {
      deleteTemplate(templateToDelete);
      setDeleteDialogOpen(false);
      setTemplateToDelete(null);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Carregando templates...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Templates de Checklist</h2>
          <p className="text-muted-foreground">Gerencie os modelos de checklist do sistema</p>
        </div>
        <Button onClick={() => { setSelectedTemplateId(null); setEditorOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Template
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar template..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select value={filterTipo} onValueChange={setFilterTipo}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Tipos</SelectItem>
                <SelectItem value="BA-2">BA-2</SelectItem>
                <SelectItem value="BA-MC">BA-MC</SelectItem>
                <SelectItem value="Almoxarifado">Almoxarifado</SelectItem>
                <SelectItem value="Equipamentos">Equipamentos</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterCategoria} onValueChange={setFilterCategoria}>
              <SelectTrigger>
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas Categorias</SelectItem>
                <SelectItem value="viatura">Viatura</SelectItem>
                <SelectItem value="medico">Médico</SelectItem>
                <SelectItem value="seguranca">Segurança</SelectItem>
                <SelectItem value="estoque">Estoque</SelectItem>
                <SelectItem value="geral">Geral</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos Status</SelectItem>
                <SelectItem value="ativo">Ativos</SelectItem>
                <SelectItem value="inativo">Inativos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Grid de Templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates?.map((template) => (
          <Card key={template.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{getTipoIcon(template.tipo_viatura)}</span>
                  <div>
                    <CardTitle className="text-lg">{template.nome}</CardTitle>
                    <CardDescription className="text-xs">{template.tipo_viatura}</CardDescription>
                  </div>
                </div>
                {template.ativo ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className={getCategoriaColor(template.categoria)}>
                    {template.categoria}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {template.itens?.length || 0} itens
                  </span>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleView(template.id)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleEdit(template.id)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => duplicateTemplate(template.id)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleDelete(template.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <Button
                  size="sm"
                  variant={template.ativo ? "secondary" : "default"}
                  className="w-full"
                  onClick={() => toggleStatus({ id: template.id, ativo: !template.ativo })}
                >
                  {template.ativo ? 'Desativar' : 'Ativar'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTemplates?.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64">
            <p className="text-muted-foreground mb-4">Nenhum template encontrado</p>
            <Button onClick={() => { setSelectedTemplateId(null); setEditorOpen(true); }}>
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeiro Template
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Modais */}
      <TemplateEditor
        open={editorOpen}
        onOpenChange={setEditorOpen}
        templateId={selectedTemplateId}
      />

      <TemplateDetails
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        templateId={selectedTemplateId}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este template? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
