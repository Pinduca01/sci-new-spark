import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, MoreHorizontal, Users, UserCheck, Calendar, AlertTriangle, Eye, Edit, Trash2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { DocumentUpload } from '@/components/DocumentUpload';
import { BombeiroDetailsModal } from '@/components/BombeiroDetailsModal';
import { BombeiroEditModal } from '@/components/BombeiroEditModal';
import { BombeiroDocumentsModal } from '@/components/BombeiroDocumentsModal';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Bombeiro {
  id: string;
  nome: string;
  matricula?: string;
  email: string;
  telefone: string;
  telefone_sos?: string;
  funcao: string;
  funcao_completa: string;
  equipe?: string;
  status: string;
  turno: string;
  ferista?: boolean;
  data_admissao: string;
  data_curso_habilitacao?: string;
  data_vencimento_credenciamento?: string;
  proxima_atualizacao?: string;
  data_aso?: string;
  data_vencimento_cve?: string;
  documentos_certificados?: string[];
  created_at: string;
  updated_at: string;
}

const ControlePessoal: React.FC = () => {
  const [bombeiros, setBombeiros] = useState<Bombeiro[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [funcaoFilter, setFuncaoFilter] = useState('todas');
  const [equipeFilter, setEquipeFilter] = useState('todas');
  const [feristaFilter, setFeristaFilter] = useState('todos');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDocumentsModalOpen, setIsDocumentsModalOpen] = useState(false);
  const [selectedBombeiro, setSelectedBombeiro] = useState<Bombeiro | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    nome: '',
    matricula: '',
    email: '',
    telefone: '',
    telefone_sos: '',
    funcao: '',
    funcao_completa: '',
    equipe: 'Alfa',
    status: 'ativo',
    turno: '',
    ferista: false,
    data_admissao: '',
    data_curso_habilitacao: '',
    data_vencimento_credenciamento: '',
    proxima_atualizacao: '',
    data_aso: '',
        data_vencimento_cve: '',
    documentos_certificados: [] as string[],
  });

  useEffect(() => {
    console.log('ControlePessoal useEffect running...');
    fetchBombeiros();
  }, []);

  const fetchBombeiros = async () => {
    console.log('Fetching bombeiros...');
    try {
      const { data, error } = await supabase
        .from('bombeiros')
        .select('*')
        .order('nome');

      if (error) throw error;
      console.log('Bombeiros loaded:', data);
      setBombeiros(data || []);
    } catch (error) {
      console.error('Erro ao buscar bombeiros:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados dos bombeiros.",
        variant: "destructive",
      });
    }
  };

  const filteredPersonnel = bombeiros.filter(person => {
    const matchesSearch = person.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         person.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (person.matricula && person.matricula.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'todos' || person.status === statusFilter;
    const matchesFuncao = funcaoFilter === 'todas' || person.funcao === funcaoFilter;
    const matchesEquipe = equipeFilter === 'todas' || person.equipe === equipeFilter;
    const matchesFerista = feristaFilter === 'todos' || 
                          (feristaFilter === 'sim' && person.ferista) ||
                          (feristaFilter === 'nao' && !person.ferista);

    return matchesSearch && matchesStatus && matchesFuncao && matchesEquipe && matchesFerista;
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'ativo': return 'bg-green-100 text-green-800 border-green-200';
      case 'ferias': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'licenca_medica': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'afastamento': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getFuncaoIcon = (funcao: string) => {
    return UserCheck;
  };

  const formatDate = (date: string | null) => {
    if (!date) return '-';
    return format(new Date(date), 'dd/MM/yyyy', { locale: ptBR });
  };

  const handleAddPersonnel = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('Iniciando cadastro de bombeiro:', formData);
      
      // Validar campos obrigatórios
      if (!formData.nome || !formData.email || !formData.telefone || !formData.funcao || !formData.turno || !formData.data_admissao) {
        throw new Error('Preencha todos os campos obrigatórios');
      }

      // Generate avatar from name
      const names = formData.nome.trim().split(' ').filter(name => name.length > 0);
      const avatar = names.length >= 2 
        ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
        : formData.nome.trim().substring(0, 2).toUpperCase();

      const bombeiroData = {
        nome: formData.nome,
        matricula: formData.matricula || null,
        email: formData.email,
        telefone: formData.telefone,
        telefone_sos: formData.telefone_sos || null,
        funcao: formData.funcao,
        funcao_completa: formData.funcao_completa,
        equipe: formData.equipe,
        status: formData.status,
        turno: formData.turno,
        ferista: formData.ferista,
        data_admissao: formData.data_admissao,
        data_curso_habilitacao: formData.data_curso_habilitacao || null,
        data_vencimento_credenciamento: formData.data_vencimento_credenciamento || null,
        proxima_atualizacao: formData.proxima_atualizacao || null,
        data_aso: formData.data_aso || null,
        data_vencimento_cve: formData.data_vencimento_cve || null,
        documentos_certificados: formData.documentos_certificados.length > 0 ? formData.documentos_certificados : null,
        user_id: crypto.randomUUID(),
        avatar,
      };

      console.log('Dados a serem inseridos:', bombeiroData);

      const { data, error } = await supabase
        .from('bombeiros')
        .insert([bombeiroData]);

      if (error) {
        console.error('Erro do Supabase:', error);
        throw error;
      }

      console.log('Bombeiro inserido com sucesso:', data);

      toast({
        title: "Sucesso",
        description: "Bombeiro adicionado com sucesso.",
      });

      setIsDialogOpen(false);
      setFormData({
        nome: '',
        matricula: '',
        email: '',
        telefone: '',
        telefone_sos: '',
        funcao: '',
        funcao_completa: '',
        equipe: 'Alfa',
        status: 'ativo',
        turno: '',
        ferista: false,
        data_admissao: '',
        data_curso_habilitacao: '',
        data_vencimento_credenciamento: '',
        proxima_atualizacao: '',
        data_aso: '',
        data_vencimento_cve: '',
        documentos_certificados: [],
      });
      fetchBombeiros();
    } catch (error) {
      console.error('Erro ao adicionar bombeiro:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao adicionar bombeiro.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBombeiro = async (id: string) => {
    try {
      const { error } = await supabase
        .from('bombeiros')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Bombeiro removido com sucesso.",
      });

      fetchBombeiros();
    } catch (error) {
      console.error('Erro ao remover bombeiro:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover bombeiro.",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Auto-complete funcao_completa based on funcao
      if (field === 'funcao') {
        newData.funcao_completa = value === 'GS' ? 'Gerente de Seção (GS)' :
                                  value === 'BA-CE' ? 'Chefe de Equipe (BA-CE)' :
                                  value === 'BA-LR' ? 'Líder de Resgate (BA-LR)' :
                                  value === 'BA-MC' ? 'Motorista Condutor (BA-MC)' :
                                  value === 'BA-2' ? 'Bombeiro de Aeródromo (BA-2)' : value;
      }
      
      return newData;
    });
  };

  const totalPessoal = bombeiros.length;
  const pessoalAtivo = bombeiros.filter(p => p.status === 'ativo').length;
  const pessoalFerias = bombeiros.filter(p => p.status === 'ferias').length;
  const feristas = bombeiros.filter(p => p.ferista).length;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Controle de Pessoal</h1>
          <p className="text-muted-foreground">
            Gerencie o pessoal do Corpo de Bombeiros
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Bombeiro
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Adicionar Novo Bombeiro</DialogTitle>
              <DialogDescription>
                Preencha as informações do novo bombeiro.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddPersonnel} className="space-y-6">
              {/* Dados Pessoais */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Dados Pessoais</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nome">Nome Completo *</Label>
                    <Input
                      id="nome"
                      value={formData.nome}
                      onChange={(e) => handleInputChange('nome', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="matricula">Matrícula</Label>
                    <Input
                      id="matricula"
                      value={formData.matricula}
                      onChange={(e) => handleInputChange('matricula', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">E-mail *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="telefone">Telefone *</Label>
                    <Input
                      id="telefone"
                      value={formData.telefone}
                      onChange={(e) => handleInputChange('telefone', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="telefone_sos">Telefone SOS</Label>
                    <Input
                      id="telefone_sos"
                      value={formData.telefone_sos}
                      onChange={(e) => handleInputChange('telefone_sos', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Dados Funcionais */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Dados Funcionais</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="funcao">Função *</Label>
                    <Select
                      value={formData.funcao}
                      onValueChange={(value) => handleInputChange('funcao', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a função" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GS">GS - Gerente de Seção</SelectItem>
                        <SelectItem value="BA-CE">BA-CE - Chefe de Equipe</SelectItem>
                        <SelectItem value="BA-LR">BA-LR - Líder de Resgate</SelectItem>
                        <SelectItem value="BA-MC">BA-MC - Motorista Condutor</SelectItem>
                        <SelectItem value="BA-2">BA-2 - Bombeiro de Aeródromo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="equipe">Equipe</Label>
                    <Select
                      value={formData.equipe}
                      onValueChange={(value) => handleInputChange('equipe', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a equipe" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Alfa">Alfa</SelectItem>
                        <SelectItem value="Bravo">Bravo</SelectItem>
                        <SelectItem value="Charlie">Charlie</SelectItem>
                        <SelectItem value="Delta">Delta</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="status">Status *</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => handleInputChange('status', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ativo">Ativo</SelectItem>
                        <SelectItem value="ferias">Férias</SelectItem>
                        <SelectItem value="licenca_medica">Licença Médica</SelectItem>
                        <SelectItem value="afastamento">Afastamento</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="turno">Turno *</Label>
                    <Select
                      value={formData.turno}
                      onValueChange={(value) => handleInputChange('turno', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o turno" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manha">Manhã</SelectItem>
                        <SelectItem value="tarde">Tarde</SelectItem>
                        <SelectItem value="noite">Noite</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {formData.funcao === 'BA-MC' && (
                    <div>
                      <Label htmlFor="data_vencimento_cve">Data Vencimento CVE</Label>
                      <Input
                        id="data_vencimento_cve"
                        type="date"
                        value={formData.data_vencimento_cve}
                        onChange={(e) => handleInputChange('data_vencimento_cve', e.target.value)}
                      />
                    </div>
                  )}
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="ferista"
                      checked={formData.ferista}
                      onCheckedChange={(checked) => handleInputChange('ferista', checked)}
                    />
                    <Label htmlFor="ferista">Ferista</Label>
                  </div>
                </div>
              </div>

              {/* Datas de Documentação */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Datas de Documentação</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="data_admissao">Data de Admissão *</Label>
                    <Input
                      id="data_admissao"
                      type="date"
                      value={formData.data_admissao}
                      onChange={(e) => handleInputChange('data_admissao', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="data_curso_habilitacao">Data do Curso de Habilitação - CBA-2</Label>
                    <Input
                      id="data_curso_habilitacao"
                      type="date"
                      value={formData.data_curso_habilitacao}
                      onChange={(e) => handleInputChange('data_curso_habilitacao', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="data_vencimento_credenciamento">Vencimento Credenciamento</Label>
                    <Input
                      id="data_vencimento_credenciamento"
                      type="date"
                      value={formData.data_vencimento_credenciamento}
                      onChange={(e) => handleInputChange('data_vencimento_credenciamento', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="proxima_atualizacao">Próxima Atualização</Label>
                    <Input
                      id="proxima_atualizacao"
                      type="date"
                      value={formData.proxima_atualizacao}
                      onChange={(e) => handleInputChange('proxima_atualizacao', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="data_aso">Data ASO</Label>
                    <Input
                      id="data_aso"
                      type="date"
                      value={formData.data_aso}
                      onChange={(e) => handleInputChange('data_aso', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Documentos */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Documentos e Certificados</h3>
                <DocumentUpload
                  existingDocs={formData.documentos_certificados}
                  onDocumentsChange={(docs) => handleInputChange('documentos_certificados', docs)}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Adicionando...' : 'Adicionar Bombeiro'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Colaboradores</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPessoal}</div>
            <p className="text-xs text-muted-foreground">Bombeiros cadastrados</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pessoal Ativo</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pessoalAtivo}</div>
            <p className="text-xs text-muted-foreground">Em serviço ativo</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Férias</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pessoalFerias}</div>
            <p className="text-xs text-muted-foreground">Em período de férias</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Feristas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{feristas}</div>
            <p className="text-xs text-muted-foreground">Bombeiros feristas</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros e Busca</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, e-mail ou matrícula..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos Status</SelectItem>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="ferias">Férias</SelectItem>
                  <SelectItem value="licenca_medica">Licença Médica</SelectItem>
                  <SelectItem value="afastamento">Afastamento</SelectItem>
                </SelectContent>
              </Select>

              <Select value={funcaoFilter} onValueChange={setFuncaoFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Função" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas Funções</SelectItem>
                  <SelectItem value="GS">GS</SelectItem>
                  <SelectItem value="BA-CE">BA-CE</SelectItem>
                  <SelectItem value="BA-LR">BA-LR</SelectItem>
                  <SelectItem value="BA-MC">BA-MC</SelectItem>
                  <SelectItem value="BA-2">BA-2</SelectItem>
                </SelectContent>
              </Select>

              <Select value={equipeFilter} onValueChange={setEquipeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Equipe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas Equipes</SelectItem>
                  <SelectItem value="Alfa">Alfa</SelectItem>
                  <SelectItem value="Bravo">Bravo</SelectItem>
                  <SelectItem value="Charlie">Charlie</SelectItem>
                  <SelectItem value="Delta">Delta</SelectItem>
                </SelectContent>
              </Select>

              <Select value={feristaFilter} onValueChange={setFeristaFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Ferista" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="sim">Feristas</SelectItem>
                  <SelectItem value="nao">Não Feristas</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={() => {
                setSearchTerm('');
                setStatusFilter('todos');
                setFuncaoFilter('todas');
                setEquipeFilter('todas');
                setFeristaFilter('todos');
              }}>
                <Filter className="h-4 w-4 mr-2" />
                Limpar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personnel Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Pessoal ({filteredPersonnel.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border/40 hover:bg-transparent">
                  <TableHead className="h-8 px-2 text-xs font-medium text-muted-foreground">Nome</TableHead>
                  <TableHead className="h-8 px-2 text-xs font-medium text-muted-foreground">Matrícula</TableHead>
                  <TableHead className="h-8 px-2 text-xs font-medium text-muted-foreground">Função</TableHead>
                  <TableHead className="h-8 px-2 text-xs font-medium text-muted-foreground">Equipe</TableHead>
                  <TableHead className="h-8 px-2 text-xs font-medium text-muted-foreground">Status</TableHead>
                  <TableHead className="h-8 px-2 text-xs font-medium text-muted-foreground">Contato</TableHead>
                  <TableHead className="h-8 px-2 text-xs font-medium text-muted-foreground">Admissão</TableHead>
                  <TableHead className="h-8 px-2 text-xs font-medium text-muted-foreground text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPersonnel.map((person) => {
                  const IconComponent = getFuncaoIcon(person.funcao);
                  return (
                    <TableRow key={person.id} className="border-b border-border/20 hover:bg-muted/30 transition-colors">
                      <TableCell className="py-2 px-2">
                        <div className="flex items-center space-x-2">
                          <div className="flex-shrink-0">
                            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                              <IconComponent className="h-3 w-3 text-primary" />
                            </div>
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center space-x-1">
                              <p className="text-xs font-medium text-foreground truncate">{person.nome}</p>
                              {person.ferista && (
                                <Badge className="bg-orange-100 text-orange-800 border-orange-200 text-[10px] px-1 py-0">
                                  F
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-2 px-2 text-xs text-muted-foreground">
                        {person.matricula || '-'}
                      </TableCell>
                      <TableCell className="py-2 px-2">
                        <Badge variant="outline" className="text-[10px] px-1 py-0">
                          {person.funcao}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-2 px-2 text-xs text-muted-foreground">
                        {person.equipe || '-'}
                      </TableCell>
                      <TableCell className="py-2 px-2">
                        <Badge className={`${getStatusColor(person.status)} text-[10px] px-1 py-0`}>
                          {person.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-2 px-2">
                        <div className="space-y-0.5">
                          <p className="text-xs text-foreground">{person.telefone}</p>
                          <p className="text-[10px] text-muted-foreground truncate max-w-[120px]">{person.email}</p>
                        </div>
                      </TableCell>
                      <TableCell className="py-2 px-2 text-xs text-muted-foreground">
                        {formatDate(person.data_admissao)}
                      </TableCell>
                      <TableCell className="py-2 px-2 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-6 w-6 p-0">
                              <span className="sr-only">Abrir menu</span>
                              <MoreHorizontal className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedBombeiro(person);
                                setIsDetailsModalOpen(true);
                              }}
                            >
                              <Eye className="mr-2 h-3 w-3" />
                              Ver detalhes
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedBombeiro(person);
                                setIsEditModalOpen(true);
                              }}
                            >
                              <Edit className="mr-2 h-3 w-3" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedBombeiro(person);
                                setIsDocumentsModalOpen(true);
                              }}
                            >
                              <FileText className="mr-2 h-3 w-3" />
                              Ver documentos
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem
                                  onSelect={(e) => e.preventDefault()}
                                  className="text-destructive focus:text-destructive"
                                >
                                  <Trash2 className="mr-2 h-3 w-3" />
                                  Remover
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Confirmar remoção</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Tem certeza que deseja remover {person.nome}? Esta ação não pode ser desfeita.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteBombeiro(person.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Remover
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          {filteredPersonnel.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Nenhum bombeiro encontrado.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <BombeiroDetailsModal
        bombeiro={selectedBombeiro}
        open={isDetailsModalOpen}
        onOpenChange={setIsDetailsModalOpen}
      />

      <BombeiroEditModal
        bombeiro={selectedBombeiro}
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        onSuccess={fetchBombeiros}
      />

      <BombeiroDocumentsModal
        bombeiro={selectedBombeiro}
        open={isDocumentsModalOpen}
        onOpenChange={setIsDocumentsModalOpen}
      />
    </div>
  );
};

export default ControlePessoal;