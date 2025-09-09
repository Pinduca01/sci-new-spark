import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Save, X, Loader2 } from 'lucide-react';
import { TipoOS, OrdemServico, MaterialSolicitado, OrdemServicoBase, OSEstrutural, OSViatura, OSEquipamento, OSCombustivel, OSMateriais } from '@/types/ordem-servico';
import { gerarProximoNumeroOS, validarDadosOS } from '@/data/mock-ordem-servico';
import { useBombeiros } from '@/hooks/useBombeiros';

interface OSCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  tipoInicial?: TipoOS;
  onSave: (os: Partial<OrdemServico>) => void;
}

const OSCreateModal: React.FC<OSCreateModalProps> = ({ isOpen, onClose, tipoInicial, onSave }) => {
  const { bombeiros, isLoading: loadingBombeiros } = useBombeiros();
  useEffect(() => {
    if (isOpen) {
      const numeroOS = gerarProximoNumeroOS();
      setFormData(prev => ({
        ...prev,
        numero_chamado: numeroOS,
        cod_id: parseInt(numeroOS.split('-')[2]) || 0,
        tipo_chamado: tipoInicial || 'Estrutural',
        data_solicitacao: new Date().toLocaleDateString('pt-BR')
      }));
    }
  }, [isOpen, tipoInicial]);
  // Tipo para o formulário que inclui todos os campos possíveis
  type FormDataType = Partial<OrdemServicoBase> & {
    local_instalacao?: string;
    tipo_estrutura?: string;
    veiculo_identificacao?: string;
    tipo_veiculo?: 'CCI' | 'CRS' | 'CCI RT' | 'CA';
    quilometragem_atual?: number;
    tipo_manutencao?: 'Preventiva' | 'Corretiva' | 'Emergencial' | 'Calibração';
    equipamento_identificacao?: string;
    numero_serie?: string;
    modelo?: string;
    fabricante?: string;
    localizacao_equipamento?: string;
    tipo_combustivel?: 'Gasolina' | 'Diesel' | 'Etanol';
    quantidade_solicitada?: number;
    quantidade_atual?: number;
    urgencia?: 'Baixa' | 'Média' | 'Alta' | 'Crítica';
    lista_materiais?: MaterialSolicitado[];
    justificativa?: string;
  };

  const [formData, setFormData] = useState<FormDataType>({
    numero_chamado: '',
    cod_id: 0,
    tipo_chamado: tipoInicial || 'Estrutural' as TipoOS,
    nome_solicitante: '',
    descricao: '',
    data_solicitacao: new Date().toLocaleDateString('pt-BR'),
    status: 'Pendente',
    // Campos específicos
    local_instalacao: '',
    veiculo_identificacao: '',
    equipamento_identificacao: '',
    tipo_combustivel: 'Diesel' as const,
    quantidade_solicitada: 0,
    urgencia: 'Média' as const,
    justificativa: '',
    // Campos adicionais
    tipo_estrutura: '',
    tipo_veiculo: 'CCI' as const,
    quilometragem_atual: 0,
    tipo_manutencao: 'Corretiva' as const,
    numero_serie: '',
    modelo: '',
    fabricante: '',
    localizacao_equipamento: '',
    quantidade_atual: 0,
    item_operacional: 'SIM'
  });

  const [materiais, setMateriais] = useState<MaterialSolicitado[]>([{
    id: '1',
    nome_material: '',
    quantidade: 1,
    unidade: 'Unidades',
    especificacao: ''
  }]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddMaterial = () => {
    const novoMaterial: MaterialSolicitado = {
      id: (materiais.length + 1).toString(),
      nome_material: '',
      quantidade: 1,
      unidade: 'Unidades',
      especificacao: ''
    };
    setMateriais([...materiais, novoMaterial]);
  };

  const handleRemoveMaterial = (id: string) => {
    setMateriais(materiais.filter(m => m.id !== id));
  };

  const handleMaterialChange = (id: string, field: keyof MaterialSolicitado, value: any) => {
    setMateriais(materiais.map(m => 
      m.id === id ? { ...m, [field]: value } : m
    ));
  };

  const handleSave = () => {
    // Validação usando a função do sistema
    const validacao = validarDadosOS(formData);
    
    if (!validacao.valido) {
      alert('Erros encontrados:\n' + validacao.erros.join('\n'));
      return;
    }

    // Criar objeto baseado no tipo de chamado
    let novaOS: Partial<OrdemServico>;
    
    const baseData = {
      cod_id: formData.cod_id || 0,
      numero_chamado: formData.numero_chamado || '',
      data_solicitacao: formData.data_solicitacao || '',
      nome_solicitante: formData.nome_solicitante || '',
      descricao: formData.descricao || '',
      status: formData.status || 'Pendente' as const,
      item_operacional: formData.item_operacional || 'NÃO' as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      observacoes_manutencao: formData.observacoes_manutencao
    };

    switch (formData.tipo_chamado) {
      case 'Estrutural':
        novaOS = {
          ...baseData,
          tipo_chamado: 'Estrutural' as const,
          local_instalacao: formData.local_instalacao || '',
          tipo_estrutura: formData.tipo_estrutura,
          urgencia: formData.urgencia
        } as Partial<OSEstrutural>;
        break;
        
      case 'Viatura':
        novaOS = {
          ...baseData,
          tipo_chamado: 'Viatura' as const,
          veiculo_identificacao: formData.veiculo_identificacao || '',
          tipo_veiculo: formData.tipo_veiculo,
          quilometragem_atual: formData.quilometragem_atual,
          tipo_manutencao: formData.tipo_manutencao
        } as Partial<OSViatura>;
        break;
        
      case 'Equipamento':
        novaOS = {
          ...baseData,
          tipo_chamado: 'Equipamento' as const,
          equipamento_identificacao: formData.equipamento_identificacao || '',
          numero_serie: formData.numero_serie,
          modelo: formData.modelo,
          fabricante: formData.fabricante,
          localizacao_equipamento: formData.localizacao_equipamento,
          tipo_manutencao: formData.tipo_manutencao
        } as Partial<OSEquipamento>;
        break;
        
      case 'Combustível':
        novaOS = {
          ...baseData,
          tipo_chamado: 'Combustível' as const,
          veiculo_identificacao: formData.veiculo_identificacao || '',
          tipo_combustivel: formData.tipo_combustivel || 'Diesel',
          quantidade_solicitada: formData.quantidade_solicitada || 0,
          quantidade_atual: formData.quantidade_atual,
          urgencia: formData.urgencia || 'Média'
        } as Partial<OSCombustivel>;
        break;
        
      case 'Materiais':
        novaOS = {
          ...baseData,
          tipo_chamado: 'Materiais' as const,
          lista_materiais: materiais.filter(m => m.nome_material.trim() !== ''),
          justificativa: formData.justificativa || ''
        } as Partial<OSMateriais>;
        break;
        
      default:
        novaOS = { ...baseData, tipo_chamado: formData.tipo_chamado } as Partial<OrdemServico>;
    }

    onSave(novaOS);
    onClose();
  };

  const renderFormularioEspecifico = () => {
    switch (formData.tipo_chamado) {
      case 'Estrutural':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="local_instalacao">Local da Instalação *</Label>
              <Input
                id="local_instalacao"
                value={formData.local_instalacao}
                onChange={(e) => handleInputChange('local_instalacao', e.target.value)}
                placeholder="Ex: Sala de Briefing, Pátio de Viaturas"
              />
            </div>
            <div>
              <Label htmlFor="tipo_estrutura">Tipo de Estrutura</Label>
              <Select value={formData.tipo_estrutura} onValueChange={(value) => handleInputChange('tipo_estrutura', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Parede">Parede</SelectItem>
                  <SelectItem value="Teto">Teto</SelectItem>
                  <SelectItem value="Piso">Piso</SelectItem>
                  <SelectItem value="Iluminação">Iluminação</SelectItem>
                  <SelectItem value="Hidráulica">Hidráulica</SelectItem>
                  <SelectItem value="Elétrica">Elétrica</SelectItem>
                  <SelectItem value="Ar Condicionado">Ar Condicionado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="urgencia">Urgência</Label>
              <Select value={formData.urgencia} onValueChange={(value) => handleInputChange('urgencia', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Baixa">Baixa</SelectItem>
                  <SelectItem value="Média">Média</SelectItem>
                  <SelectItem value="Alta">Alta</SelectItem>
                  <SelectItem value="Crítica">Crítica</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'Viatura':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="veiculo_identificacao">Identificação do Veículo *</Label>
              <Input
                id="veiculo_identificacao"
                value={formData.veiculo_identificacao}
                onChange={(e) => handleInputChange('veiculo_identificacao', e.target.value)}
                placeholder="Ex: PANTHER 01 - CCI 01"
              />
            </div>
            <div>
              <Label htmlFor="tipo_veiculo">Tipo de Veículo</Label>
              <Select value={formData.tipo_veiculo} onValueChange={(value) => handleInputChange('tipo_veiculo', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CCI">CCI - Carro Contra Incêndio</SelectItem>
                  <SelectItem value="CRS">CRS - Carro de Salvamento e Resgate</SelectItem>
                  <SelectItem value="CCI RT">CCI RT - Carro Contra Incêndio Reserva Técnica</SelectItem>
                  <SelectItem value="CA">CA - Carro de Apoio</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="quilometragem_atual">Quilometragem Atual</Label>
              <Input
                id="quilometragem_atual"
                type="number"
                value={formData.quilometragem_atual}
                onChange={(e) => handleInputChange('quilometragem_atual', parseInt(e.target.value) || 0)}
              />
            </div>
            <div>
              <Label htmlFor="tipo_manutencao">Tipo de Manutenção</Label>
              <Select value={formData.tipo_manutencao} onValueChange={(value) => handleInputChange('tipo_manutencao', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Preventiva">Preventiva</SelectItem>
                  <SelectItem value="Corretiva">Corretiva</SelectItem>
                  <SelectItem value="Emergencial">Emergencial</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'Equipamento':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="equipamento_identificacao">Identificação do Equipamento *</Label>
              <Input
                id="equipamento_identificacao"
                value={formData.equipamento_identificacao}
                onChange={(e) => handleInputChange('equipamento_identificacao', e.target.value)}
                placeholder="Ex: Desencarcerador, Mangueira 2.5"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="numero_serie">Número de Série</Label>
                <Input
                  id="numero_serie"
                  value={formData.numero_serie}
                  onChange={(e) => handleInputChange('numero_serie', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="modelo">Modelo</Label>
                <Input
                  id="modelo"
                  value={formData.modelo}
                  onChange={(e) => handleInputChange('modelo', e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="fabricante">Fabricante</Label>
              <Input
                id="fabricante"
                value={formData.fabricante}
                onChange={(e) => handleInputChange('fabricante', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="localizacao_equipamento">Localização do Equipamento</Label>
              <Input
                id="localizacao_equipamento"
                value={formData.localizacao_equipamento}
                onChange={(e) => handleInputChange('localizacao_equipamento', e.target.value)}
                placeholder="Ex: CRS - Compartimento 3"
              />
            </div>
          </div>
        );

      case 'Combustível':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="veiculo_identificacao">Identificação do Veículo *</Label>
              <Input
                id="veiculo_identificacao"
                value={formData.veiculo_identificacao}
                onChange={(e) => handleInputChange('veiculo_identificacao', e.target.value)}
                placeholder="Ex: CCI RT 02"
              />
            </div>
            <div>
              <Label htmlFor="tipo_combustivel">Tipo de Combustível</Label>
              <Select value={formData.tipo_combustivel} onValueChange={(value) => handleInputChange('tipo_combustivel', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Gasolina">Gasolina</SelectItem>
                  <SelectItem value="Diesel">Diesel</SelectItem>
                  <SelectItem value="Etanol">Etanol</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="quantidade_solicitada">Quantidade Solicitada (%) *</Label>
                <Input
                  id="quantidade_solicitada"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.quantidade_solicitada}
                  onChange={(e) => handleInputChange('quantidade_solicitada', parseInt(e.target.value) || 0)}
                  placeholder="Ex: 80"
                />
              </div>
              <div>
                <Label htmlFor="quantidade_atual">Quantidade Atual (%)</Label>
                <Input
                  id="quantidade_atual"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.quantidade_atual}
                  onChange={(e) => handleInputChange('quantidade_atual', parseInt(e.target.value) || 0)}
                  placeholder="Ex: 25"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="urgencia">Urgência</Label>
              <Select value={formData.urgencia} onValueChange={(value) => handleInputChange('urgencia', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Baixa">Baixa</SelectItem>
                  <SelectItem value="Média">Média</SelectItem>
                  <SelectItem value="Alta">Alta</SelectItem>
                  <SelectItem value="Crítica">Crítica</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'Materiais':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="justificativa">Justificativa *</Label>
              <Textarea
                id="justificativa"
                value={formData.justificativa}
                onChange={(e) => handleInputChange('justificativa', e.target.value)}
                placeholder="Justifique a necessidade dos materiais"
              />
            </div>
            
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">Lista de Materiais</CardTitle>
                  <Button onClick={handleAddMaterial} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Material
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {materiais.map((material, index) => (
                  <div key={material.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <Badge variant="outline">Material {index + 1}</Badge>
                      {materiais.length > 1 && (
                        <Button 
                          onClick={() => handleRemoveMaterial(material.id)}
                          size="sm" 
                          variant="destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Nome do Material *</Label>
                        <Input
                          value={material.nome_material}
                          onChange={(e) => handleMaterialChange(material.id, 'nome_material', e.target.value)}
                          placeholder="Ex: Óleo Motor 15W40"
                        />
                      </div>
                      <div>
                        <Label>Especificação</Label>
                        <Input
                          value={material.especificacao}
                          onChange={(e) => handleMaterialChange(material.id, 'especificacao', e.target.value)}
                          placeholder="Detalhes técnicos"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Quantidade *</Label>
                        <Input
                          type="number"
                          value={material.quantidade}
                          onChange={(e) => handleMaterialChange(material.id, 'quantidade', parseInt(e.target.value) || 1)}
                        />
                      </div>
                      <div>
                        <Label>Unidade</Label>
                        <Select 
                          value={material.unidade} 
                          onValueChange={(value) => handleMaterialChange(material.id, 'unidade', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Unidades">Unidades</SelectItem>
                            <SelectItem value="Litros">Litros</SelectItem>
                            <SelectItem value="Metros">Metros</SelectItem>
                            <SelectItem value="Quilos">Quilos</SelectItem>
                            <SelectItem value="Jogos">Jogos</SelectItem>
                            <SelectItem value="Pacotes">Pacotes</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
            

          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Nova Ordem de Serviço
            {formData.numero_chamado && (
              <Badge variant="outline" className="ml-2">
                {formData.numero_chamado}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Campos Básicos */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tipo_chamado">Tipo de Chamado *</Label>
              <Select value={formData.tipo_chamado} onValueChange={(value: TipoOS) => handleInputChange('tipo_chamado', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Estrutural">Estrutural</SelectItem>
                  <SelectItem value="Viatura">Viatura</SelectItem>
                  <SelectItem value="Equipamento">Equipamento</SelectItem>
                  <SelectItem value="Combustível">Combustível</SelectItem>
                  <SelectItem value="Materiais">Materiais</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="nome_solicitante">Nome do Solicitante *</Label>
              <Select
                value={formData.nome_solicitante}
                onValueChange={(value) => handleInputChange('nome_solicitante', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o bombeiro solicitante" />
                </SelectTrigger>
                <SelectContent>
                  {loadingBombeiros ? (
                    <SelectItem value="" disabled>
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Carregando bombeiros...
                      </div>
                    </SelectItem>
                  ) : (
                    bombeiros.map((bombeiro) => (
                      <SelectItem key={bombeiro.id} value={bombeiro.nome}>
                        {bombeiro.nome} - {bombeiro.funcao}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label htmlFor="descricao">Descrição do Problema/Necessidade *</Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => handleInputChange('descricao', e.target.value)}
              placeholder="Descreva detalhadamente o problema ou necessidade"
              rows={3}
            />
          </div>
          
          {/* Formulário Específico por Tipo */}
          {renderFormularioEspecifico()}
          
          {/* Botões */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Salvar OS
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OSCreateModal;