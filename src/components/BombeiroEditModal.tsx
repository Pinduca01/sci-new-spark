import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { DocumentUpload } from './DocumentUpload';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  data_curso_cve?: string;
  documentos_certificados?: string[];
}

interface BombeiroEditModalProps {
  bombeiro: Bombeiro | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const BombeiroEditModal: React.FC<BombeiroEditModalProps> = ({
  bombeiro,
  open,
  onOpenChange,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<Partial<Bombeiro>>({});
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (bombeiro) {
      setFormData(bombeiro);
    }
  }, [bombeiro]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bombeiro) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('bombeiros')
        .update(formData)
        .eq('id', bombeiro.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Dados do bombeiro atualizados com sucesso.",
      });

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao atualizar:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar os dados do bombeiro.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!bombeiro) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Bombeiro</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dados Pessoais */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Dados Pessoais</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nome">Nome Completo *</Label>
                <Input
                  id="nome"
                  value={formData.nome || ''}
                  onChange={(e) => handleInputChange('nome', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="matricula">Matrícula</Label>
                <Input
                  id="matricula"
                  value={formData.matricula || ''}
                  onChange={(e) => handleInputChange('matricula', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="email">E-mail *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="telefone">Telefone *</Label>
                <Input
                  id="telefone"
                  value={formData.telefone || ''}
                  onChange={(e) => handleInputChange('telefone', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="telefone_sos">Telefone SOS</Label>
                <Input
                  id="telefone_sos"
                  value={formData.telefone_sos || ''}
                  onChange={(e) => handleInputChange('telefone_sos', e.target.value)}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Dados Funcionais */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Dados Funcionais</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="funcao">Função *</Label>
                <Select
                  value={formData.funcao || ''}
                  onValueChange={(value) => {
                    handleInputChange('funcao', value);
                    const funcaoCompleta = value === 'GS' ? 'Gerente de Seção (GS)' :
                                          value === 'BA-CE' ? 'Chefe de Equipe (BA-CE)' :
                                          value === 'BA-LR' ? 'Líder de Resgate (BA-LR)' :
                                          value === 'BA-MC' ? 'Motorista Condutor (BA-MC)' :
                                          value === 'BA-2' ? 'Bombeiro de Aeródromo (BA-2)' : value;
                    handleInputChange('funcao_completa', funcaoCompleta);
                  }}
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
                  value={formData.equipe || ''}
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
                  value={formData.status || ''}
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
                  value={formData.turno || ''}
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
                  <Label htmlFor="data_curso_cve">Data do Curso CVE</Label>
                  <Input
                    id="data_curso_cve"
                    type="date"
                    value={formData.data_curso_cve || ''}
                    onChange={(e) => handleInputChange('data_curso_cve', e.target.value)}
                  />
                </div>
              )}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="ferista"
                  checked={formData.ferista || false}
                  onCheckedChange={(checked) => handleInputChange('ferista', checked)}
                />
                <Label htmlFor="ferista">Ferista</Label>
              </div>
            </div>
          </div>

          <Separator />

          {/* Datas Importantes */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Datas Importantes</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="data_admissao">Data de Admissão *</Label>
                <Input
                  id="data_admissao"
                  type="date"
                  value={formData.data_admissao || ''}
                  onChange={(e) => handleInputChange('data_admissao', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="data_curso_habilitacao">Data do Curso de Habilitação - CBA-2</Label>
                <Input
                  id="data_curso_habilitacao"
                  type="date"
                  value={formData.data_curso_habilitacao || ''}
                  onChange={(e) => handleInputChange('data_curso_habilitacao', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="data_vencimento_credenciamento">Vencimento Credenciamento</Label>
                <Input
                  id="data_vencimento_credenciamento"
                  type="date"
                  value={formData.data_vencimento_credenciamento || ''}
                  onChange={(e) => handleInputChange('data_vencimento_credenciamento', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="proxima_atualizacao">Próxima Atualização</Label>
                <Input
                  id="proxima_atualizacao"
                  type="date"
                  value={formData.proxima_atualizacao || ''}
                  onChange={(e) => handleInputChange('proxima_atualizacao', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="data_aso">Data ASO</Label>
                <Input
                  id="data_aso"
                  type="date"
                  value={formData.data_aso || ''}
                  onChange={(e) => handleInputChange('data_aso', e.target.value)}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Documentos */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Documentos e Certificados</h3>
            <DocumentUpload
              bombeiroId={formData.id}
              existingDocs={formData.documentos_certificados || []}
              onDocumentsChange={(docs) => handleInputChange('documentos_certificados', docs)}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};