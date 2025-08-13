import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { DocumentUpload } from './DocumentUpload';
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
  data_vencimento_cve?: string;
  proxima_atualizacao?: string;
  data_aso?: string;
  cve?: string;
  documentos_certificados?: string[];
}

interface BombeiroDetailsModalProps {
  bombeiro: Bombeiro | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const BombeiroDetailsModal: React.FC<BombeiroDetailsModalProps> = ({
  bombeiro,
  open,
  onOpenChange,
}) => {
  if (!bombeiro) return null;

  const formatDate = (date: string | null) => {
    if (!date) return 'Não informado';
    return format(new Date(date), 'dd/MM/yyyy', { locale: ptBR });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'ativo': return 'bg-green-100 text-green-800 border-green-200';
      case 'ferias': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'licenca_medica': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'afastamento': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Detalhes do Bombeiro</span>
            {bombeiro.ferista && (
              <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                FERISTA
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Dados Pessoais */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Dados Pessoais</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Nome</label>
                <p className="text-sm">{bombeiro.nome}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Matrícula</label>
                <p className="text-sm">{bombeiro.matricula || 'Não informado'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">E-mail</label>
                <p className="text-sm">{bombeiro.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Telefone</label>
                <p className="text-sm">{bombeiro.telefone}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Telefone SOS</label>
                <p className="text-sm">{bombeiro.telefone_sos || 'Não informado'}</p>
              </div>
            </div>
          </div>

          {/* Dados Funcionais */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Dados Funcionais</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Função</label>
                <p className="text-sm">{bombeiro.funcao_completa}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Equipe</label>
                <p className="text-sm">{bombeiro.equipe || 'Não informado'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <Badge className={getStatusColor(bombeiro.status)}>
                  {bombeiro.status.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Turno</label>
                <p className="text-sm">{bombeiro.turno}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Data de Admissão</label>
                <p className="text-sm">{formatDate(bombeiro.data_admissao)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">CVE</label>
                <p className="text-sm">{bombeiro.cve || 'Não informado'}</p>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Certificações e Datas */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Certificações e Datas Importantes</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Curso Habilitação</label>
              <p className="text-sm">{formatDate(bombeiro.data_curso_habilitacao)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Vencimento Credenciamento</label>
              <p className="text-sm">{formatDate(bombeiro.data_vencimento_credenciamento)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Vencimento CVE</label>
              <p className="text-sm">{formatDate(bombeiro.data_vencimento_cve)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Próxima Atualização</label>
              <p className="text-sm">{formatDate(bombeiro.proxima_atualizacao)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Data ASO</label>
              <p className="text-sm">{formatDate(bombeiro.data_aso)}</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Documentos */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Documentos e Certificados</h3>
          <DocumentUpload
            bombeiroId={bombeiro.id}
            existingDocs={bombeiro.documentos_certificados || []}
            onDocumentsChange={() => {}}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};