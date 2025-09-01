import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Edit, Save, X, Eye, Calendar, User, FileText, MapPin, Wrench, Fuel, Package, Loader2 } from 'lucide-react';
import { OrdemServico, StatusOS, MaterialSolicitado } from '@/types/ordem-servico';
import { atualizarStatusOS, validarDadosOS } from '@/data/mock-ordem-servico';
import { useBombeiros } from '@/hooks/useBombeiros';

interface OSViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  os: OrdemServico | null;
  onSave?: (os: OrdemServico) => void;
  readOnly?: boolean;
}

const OSViewModal: React.FC<OSViewModalProps> = ({ isOpen, onClose, os, onSave, readOnly = false }) => {
  const { bombeiros, isLoading: loadingBombeiros } = useBombeiros();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<OrdemServico | null>(null);

  useEffect(() => {
    if (os) {
      setFormData({ ...os });
    }
  }, [os]);

  if (!os || !formData) return null;

  const handleInputChange = (field: keyof OrdemServico, value: any) => {
    setFormData(prev => prev ? { ...prev, [field]: value } : null);
  };

  const handleSave = () => {
    if (formData && onSave) {
      // Validar dados antes de salvar
      const validacao = validarDadosOS(formData);
      if (!validacao.valido) {
        alert(`Erro de validação: ${validacao.erros.join(', ')}`);
        return;
      }
      
      const osAtualizada = {
        ...formData,
        updated_at: new Date().toISOString()
      };
      
      onSave(osAtualizada);
      setIsEditing(false);
    }
  };

  const getStatusColor = (status: StatusOS) => {
    switch (status) {
      case 'Pendente': return 'bg-yellow-100 text-yellow-800';
      case 'Em Andamento': return 'bg-blue-100 text-blue-800';
      case 'Concluído': return 'bg-green-100 text-green-800';
      case 'Cancelado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'Estrutural': return <MapPin className="h-4 w-4" />;
      case 'Viatura': return <Wrench className="h-4 w-4" />;
      case 'Equipamento': return <Package className="h-4 w-4" />;
      case 'Combustível': return <Fuel className="h-4 w-4" />;
      case 'Materiais': return <Package className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const renderCamposEspecificos = () => {
    switch (formData.tipo_chamado) {
      case 'Estrutural':
        return (
          <div className="space-y-4">
            <div>
              <Label>Local da Instalação</Label>
              {isEditing ? (
                <Input
                  value={(formData as any).local_instalacao || ''}
                  onChange={(e) => handleInputChange('local_instalacao' as any, e.target.value)}
                />
              ) : (
                <p className="text-sm text-gray-600 mt-1">{(formData as any).local_instalacao || 'Não informado'}</p>
              )}
            </div>
            <div>
              <Label>Tipo de Estrutura</Label>
              {isEditing ? (
                <Select 
                  value={(formData as any).tipo_estrutura || ''} 
                  onValueChange={(value) => handleInputChange('tipo_estrutura' as any, value)}
                >
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
              ) : (
                <p className="text-sm text-gray-600 mt-1">{(formData as any).tipo_estrutura || 'Não informado'}</p>
              )}
            </div>
          </div>
        );

      case 'Viatura':
        return (
          <div className="space-y-4">
            <div>
              <Label>Identificação do Veículo</Label>
              {isEditing ? (
                <Input
                  value={(formData as any).veiculo_identificacao || ''}
                  onChange={(e) => handleInputChange('veiculo_identificacao' as any, e.target.value)}
                />
              ) : (
                <p className="text-sm text-gray-600 mt-1">{(formData as any).veiculo_identificacao || 'Não informado'}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Tipo de Veículo</Label>
                {isEditing ? (
                  <Select 
                    value={(formData as any).tipo_veiculo || ''} 
                    onValueChange={(value) => handleInputChange('tipo_veiculo' as any, value)}
                  >
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
                ) : (
                  <p className="text-sm text-gray-600 mt-1">{(formData as any).tipo_veiculo || 'Não informado'}</p>
                )}
              </div>
              <div>
                <Label>Quilometragem Atual</Label>
                {isEditing ? (
                  <Input
                    type="number"
                    value={(formData as any).quilometragem_atual || 0}
                    onChange={(e) => handleInputChange('quilometragem_atual' as any, parseInt(e.target.value) || 0)}
                  />
                ) : (
                  <p className="text-sm text-gray-600 mt-1">{(formData as any).quilometragem_atual || 0} km</p>
                )}
              </div>
            </div>
            <div>
              <Label>Tipo de Manutenção</Label>
              {isEditing ? (
                <Select 
                  value={(formData as any).tipo_manutencao || ''} 
                  onValueChange={(value) => handleInputChange('tipo_manutencao' as any, value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Preventiva">Preventiva</SelectItem>
                    <SelectItem value="Corretiva">Corretiva</SelectItem>
                    <SelectItem value="Emergencial">Emergencial</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm text-gray-600 mt-1">{(formData as any).tipo_manutencao || 'Não informado'}</p>
              )}
            </div>
          </div>
        );

      case 'Equipamento':
        return (
          <div className="space-y-4">
            <div>
              <Label>Identificação do Equipamento</Label>
              {isEditing ? (
                <Input
                  value={(formData as any).equipamento_identificacao || ''}
                  onChange={(e) => handleInputChange('equipamento_identificacao' as any, e.target.value)}
                />
              ) : (
                <p className="text-sm text-gray-600 mt-1">{(formData as any).equipamento_identificacao || 'Não informado'}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Número de Série</Label>
                {isEditing ? (
                  <Input
                    value={(formData as any).numero_serie || ''}
                    onChange={(e) => handleInputChange('numero_serie' as any, e.target.value)}
                  />
                ) : (
                  <p className="text-sm text-gray-600 mt-1">{(formData as any).numero_serie || 'Não informado'}</p>
                )}
              </div>
              <div>
                <Label>Modelo</Label>
                {isEditing ? (
                  <Input
                    value={(formData as any).modelo || ''}
                    onChange={(e) => handleInputChange('modelo' as any, e.target.value)}
                  />
                ) : (
                  <p className="text-sm text-gray-600 mt-1">{(formData as any).modelo || 'Não informado'}</p>
                )}
              </div>
            </div>
            <div>
              <Label>Fabricante</Label>
              {isEditing ? (
                <Input
                  value={(formData as any).fabricante || ''}
                  onChange={(e) => handleInputChange('fabricante' as any, e.target.value)}
                />
              ) : (
                <p className="text-sm text-gray-600 mt-1">{(formData as any).fabricante || 'Não informado'}</p>
              )}
            </div>
            <div>
              <Label>Localização do Equipamento</Label>
              {isEditing ? (
                <Input
                  value={(formData as any).localizacao_equipamento || ''}
                  onChange={(e) => handleInputChange('localizacao_equipamento' as any, e.target.value)}
                />
              ) : (
                <p className="text-sm text-gray-600 mt-1">{(formData as any).localizacao_equipamento || 'Não informado'}</p>
              )}
            </div>
          </div>
        );

      case 'Combustível':
        return (
          <div className="space-y-4">
            <div>
              <Label>Identificação do Veículo</Label>
              {isEditing ? (
                <Input
                  value={(formData as any).veiculo_identificacao || ''}
                  onChange={(e) => handleInputChange('veiculo_identificacao' as any, e.target.value)}
                />
              ) : (
                <p className="text-sm text-gray-600 mt-1">{(formData as any).veiculo_identificacao || 'Não informado'}</p>
              )}
            </div>
            <div>
              <Label>Tipo de Combustível</Label>
              {isEditing ? (
                <Select 
                  value={(formData as any).tipo_combustivel || ''} 
                  onValueChange={(value) => handleInputChange('tipo_combustivel' as any, value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Gasolina">Gasolina</SelectItem>
                    <SelectItem value="Diesel">Diesel</SelectItem>
                    <SelectItem value="Etanol">Etanol</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm text-gray-600 mt-1">{(formData as any).tipo_combustivel || 'Não informado'}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Quantidade Solicitada (%)</Label>
                {isEditing ? (
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={(formData as any).quantidade_solicitada || 0}
                    onChange={(e) => handleInputChange('quantidade_solicitada' as any, parseInt(e.target.value) || 0)}
                  />
                ) : (
                  <p className="text-sm text-gray-600 mt-1">{(formData as any).quantidade_solicitada || 0}%</p>
                )}
              </div>
              <div>
                <Label>Quantidade Atual (%)</Label>
                {isEditing ? (
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={(formData as any).quantidade_atual || 0}
                    onChange={(e) => handleInputChange('quantidade_atual' as any, parseInt(e.target.value) || 0)}
                  />
                ) : (
                  <p className="text-sm text-gray-600 mt-1">{(formData as any).quantidade_atual || 0}%</p>
                )}
              </div>
            </div>

          </div>
        );

      case 'Materiais':
        const materiais = (formData as any).lista_materiais || [];
        return (
          <div className="space-y-4">
            <div>
              <Label>Justificativa</Label>
              {isEditing ? (
                <Textarea
                  value={(formData as any).justificativa || ''}
                  onChange={(e) => handleInputChange('justificativa' as any, e.target.value)}
                  rows={3}
                />
              ) : (
                <p className="text-sm text-gray-600 mt-1">{(formData as any).justificativa || 'Não informado'}</p>
              )}
            </div>
            
            <div>
              <Label>Lista de Materiais</Label>
              <div className="mt-2 space-y-2">
                {materiais.length > 0 ? (
                  materiais.map((material: MaterialSolicitado, index: number) => (
                    <Card key={material.id} className="p-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Material:</span> {material.nome_material}
                        </div>
                        <div>
                          <span className="font-medium">Quantidade:</span> {material.quantidade} {material.unidade}
                        </div>
                        {material.especificacao && (
                          <div className="col-span-2">
                            <span className="font-medium">Especificação:</span> {material.especificacao}
                          </div>
                        )}

                      </div>
                    </Card>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">Nenhum material especificado</p>
                )}
              </div>
            </div>
            

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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getTipoIcon(formData.tipo_chamado)}
              <div>
                <DialogTitle>OS #{formData.numero_chamado}</DialogTitle>
                <p className="text-sm text-gray-500 mt-1">{formData.tipo_chamado}</p>
              </div>
            </div>
            <Badge className={getStatusColor(formData.status)}>
              {formData.status}
            </Badge>
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Informações Básicas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Informações Básicas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <div>
                    <Label className="text-xs text-gray-500">Data de Solicitação</Label>
                    <p className="text-sm">{formData.data_solicitacao}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <div>
                    <Label className="text-xs text-gray-500">Solicitante</Label>
                    {isEditing ? (
                      <Select
                        value={formData.nome_solicitante}
                        onValueChange={(value) => handleInputChange('nome_solicitante', value)}
                      >
                        <SelectTrigger className="h-8">
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
                    ) : (
                      <p className="text-sm">{formData.nome_solicitante}</p>
                    )}
                  </div>
                </div>
              </div>
              
              <div>
                <Label>Descrição</Label>
                {isEditing ? (
                  <Textarea
                    value={formData.descricao}
                    onChange={(e) => handleInputChange('descricao', e.target.value)}
                    rows={3}
                  />
                ) : (
                  <p className="text-sm text-gray-600 mt-1">{formData.descricao}</p>
                )}
              </div>
              
              {isEditing && (
                <div>
                  <Label>Status</Label>
                  <Select value={formData.status} onValueChange={(value: StatusOS) => handleInputChange('status', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pendente">Pendente</SelectItem>
                      <SelectItem value="Em Andamento">Em Andamento</SelectItem>
                      <SelectItem value="Aguardando Aprovação">Aguardando Aprovação</SelectItem>
                      <SelectItem value="Concluído">Concluído</SelectItem>
                      <SelectItem value="Cancelado">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Separator />
          
          {/* Campos Específicos */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                {getTipoIcon(formData.tipo_chamado)}
                Detalhes Específicos - {formData.tipo_chamado}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderCamposEspecificos()}
            </CardContent>
          </Card>
          
          {/* Observações */}
          {(formData as any).observacoes_manutencao && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Observações da Manutenção</CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <Textarea
                    value={(formData as any).observacoes_manutencao || ''}
                    onChange={(e) => handleInputChange('observacoes_manutencao' as any, e.target.value)}
                    rows={3}
                  />
                ) : (
                  <p className="text-sm text-gray-600">{(formData as any).observacoes_manutencao}</p>
                )}
              </CardContent>
            </Card>
          )}
          
          {/* Botões */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
                <Button onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Alterações
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={onClose}>
                  Fechar
                </Button>
                {!readOnly && onSave && (
                  <Button onClick={() => setIsEditing(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OSViewModal;