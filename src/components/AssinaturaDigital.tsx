
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { FileText, Upload, CheckCircle, Clock, AlertCircle, ExternalLink, Users, FileCheck, Download } from 'lucide-react';
import { useAutentique } from '@/hooks/useAutentique';
import { generateTPVerificacaoPDF } from './TPVerificacaoPDFGenerator';
import { useToast } from '@/hooks/use-toast';

interface AssinaturaDigitalProps {
  onAssinaturaConcluida?: (dados: {
    documentoId: string;
    linkAssinatura: string;
    status: string;
    assinaturaBase64?: string;
  }) => void;
  documento?: File;
  signatarios?: {
    nome: string;
    email: string;
  }[];
  documentoId?: string; // Para consultar status de documento existente
  // Dados da verificação TP para geração de PDF
  verificacaoData?: {
    data_verificacao: string;
    local_contrato: string;
    ba_ce_nome: string;
    responsavel_nome: string;
    equipe_id: string;
    integrantes: string[];
    checklist: Array<{
      item: string;
      conforme: 'S' | 'N';
      observacoes?: string;
    }>;
  };
}

export const AssinaturaDigital: React.FC<AssinaturaDigitalProps> = ({
  onAssinaturaConcluida,
  documento,
  signatarios = [],
  documentoId: documentoIdProp,
  verificacaoData
}) => {
  const { toast } = useToast();
  const [arquivoSelecionado, setArquivoSelecionado] = useState<File | null>(documento || null);
  const [statusAssinatura, setStatusAssinatura] = useState<'pendente' | 'enviado' | 'assinado' | 'rejeitado' | 'erro'>('pendente');
  const [linkAssinatura, setLinkAssinatura] = useState<string>('');
  const [documentoId, setDocumentoId] = useState<string>(documentoIdProp || '');
  const [mensagemErro, setMensagemErro] = useState<string>('');
  const [statusDetalhado, setStatusDetalhado] = useState<any>(null);
  const [progresso, setProgresso] = useState<number>(0);
  const [signatariosEditaveis, setSignatariosEditaveis] = useState(signatarios);
  
  const { criarDocumento, consultarStatus, assinarDocumento, testarConexao, loading, error } = useAutentique();
  const [testingConnection, setTestingConnection] = useState(false);

  // Função para consultar status do documento
  const handleConsultarStatus = useCallback(async () => {
    if (!documentoId) return;

    try {
      const status = await consultarStatus(documentoId);
      setStatusDetalhado(status);
      
      // Calcular progresso baseado nas assinaturas
      const progressoCalculado = status.signatures_count > 0 
        ? Math.round((status.signed_count / status.signatures_count) * 100)
        : 0;
      setProgresso(Math.max(50, progressoCalculado)); // Mínimo 50% se já foi enviado
      
      // Atualizar status baseado no resultado
      if (status.status === 'completed') {
        setStatusAssinatura('assinado');
        setProgresso(100);
        onAssinaturaConcluida?.({
          documentoId,
          linkAssinatura,
          status: 'assinado',
          assinaturaBase64: status.files?.signed
        });
      } else if (status.status === 'rejected') {
        setStatusAssinatura('rejeitado');
      } else if (status.signed_count > 0) {
        // Parcialmente assinado
        setStatusAssinatura('enviado');
      }
    } catch (err) {
      console.error('Erro ao consultar status:', err);
      setMensagemErro('Erro ao consultar status do documento');
    }
  }, [documentoId, consultarStatus, onAssinaturaConcluida]);

  // Sincronizar signatários editáveis com as props
  useEffect(() => {
    setSignatariosEditaveis(signatarios);
  }, [signatarios]);

  // Consultar status automaticamente se já tiver documentoId
  useEffect(() => {
    if (documentoIdProp) {
      handleConsultarStatus();
    }
  }, [documentoIdProp, handleConsultarStatus]);

  // Polling para verificar status periodicamente
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (documentoId && statusAssinatura === 'enviado') {
      interval = setInterval(() => {
        handleConsultarStatus();
      }, 30000); // Verifica a cada 30 segundos
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [documentoId, statusAssinatura, handleConsultarStatus]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validar tipo de arquivo
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        setMensagemErro('Tipo de arquivo não suportado. Use PDF, DOC ou DOCX.');
        return;
      }
      
      // Validar tamanho (máximo 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setMensagemErro('Arquivo muito grande. Tamanho máximo: 10MB.');
        return;
      }
      
      setArquivoSelecionado(file);
      setMensagemErro('');
    }
  };

  const handleEnviarParaAssinatura = async () => {
    if (!arquivoSelecionado) {
      setMensagemErro('Por favor, selecione um arquivo para assinatura.');
      return;
    }

    if (signatariosEditaveis.length === 0) {
      setMensagemErro('É necessário ter pelo menos um signatário.');
      return;
    }

    // Validar emails dos signatários
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const emailsInvalidos = signatariosEditaveis.filter(s => !emailRegex.test(s.email));
    if (emailsInvalidos.length > 0) {
      setMensagemErro('Alguns emails dos signatários são inválidos. Verifique se todos os emails estão no formato correto (ex: usuario@dominio.com).');
      return;
    }

    try {
      setMensagemErro('');
      setStatusAssinatura('enviado');
      setProgresso(25);
      
      const resultado = await criarDocumento({
        documento: arquivoSelecionado,
        signatarios: signatariosEditaveis
      });

      if (resultado.success && resultado.documentoId && resultado.linkAssinatura) {
        setDocumentoId(resultado.documentoId);
        setLinkAssinatura(resultado.linkAssinatura);
        setStatusAssinatura('enviado');
        setProgresso(50);
        
        // Notificar o componente pai
        onAssinaturaConcluida?.({
          documentoId: resultado.documentoId,
          linkAssinatura: resultado.linkAssinatura,
          status: 'enviado'
        });
        
        // Consultar status inicial
        setTimeout(() => handleConsultarStatus(), 2000);
      } else {
        throw new Error(resultado.error || 'Erro ao criar documento');
      }
    } catch (err) {
      setStatusAssinatura('erro');
      setProgresso(0);
      setMensagemErro(err instanceof Error ? err.message : 'Erro desconhecido');
    }
  };



  const handleAssinarDocumento = async () => {
    if (!documentoId) return;
    
    try {
      setMensagemErro('');
      const sucesso = await assinarDocumento(documentoId);
      
      if (sucesso) {
        // Consultar status atualizado
        setTimeout(() => handleConsultarStatus(), 1000);
      }
    } catch (err) {
      setMensagemErro(err instanceof Error ? err.message : 'Erro ao assinar documento');
    }
  };

  const handleExportarPDF = async () => {
    if (!verificacaoData) {
      toast({
        title: "Erro",
        description: "Dados da verificação não disponíveis para exportação.",
        variant: "destructive"
      });
      return;
    }

    try {
      setMensagemErro('');
      const pdfBlob = await generateTPVerificacaoPDF(verificacaoData);
      
      // Converter blob para File para usar no fluxo de assinatura
      const pdfFile = new File([pdfBlob], `Verificacao_TP_${verificacaoData.data_verificacao.replace(/-/g, '')}.pdf`, {
        type: 'application/pdf'
      });
      
      setArquivoSelecionado(pdfFile);
      
      toast({
        title: "PDF Gerado",
        description: "PDF da verificação TP foi gerado com sucesso e está pronto para assinatura."
      });
      
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast({
        title: "Erro",
        description: "Erro ao gerar PDF da verificação. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const handleTestarConexao = async () => {
    setTestingConnection(true);
    setMensagemErro('');
    
    try {
      const conexaoOk = await testarConexao();
      
      if (conexaoOk) {
        toast({
          title: "Conexão OK",
          description: "Conexão com a API Autentique estabelecida com sucesso."
        });
      } else {
        toast({
          title: "Falha na Conexão",
          description: "Não foi possível conectar com a API Autentique. Verifique o console para mais detalhes.",
          variant: "destructive"
        });
      }
    } catch (error) {
      setMensagemErro(error instanceof Error ? error.message : 'Erro ao testar conexão');
      toast({
        title: "Erro de Conexão",
        description: "Erro ao testar conexão com a API Autentique.",
        variant: "destructive"
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const handleEditarSignatario = (index: number, campo: 'nome' | 'email', valor: string) => {
    const novosSignatarios = [...signatariosEditaveis];
    novosSignatarios[index] = { ...novosSignatarios[index], [campo]: valor };
    setSignatariosEditaveis(novosSignatarios);
  };

  const handleAdicionarSignatario = () => {
    setSignatariosEditaveis([...signatariosEditaveis, { nome: '', email: '' }]);
  };

  const handleRemoverSignatario = (index: number) => {
    const novosSignatarios = signatariosEditaveis.filter((_, i) => i !== index);
    setSignatariosEditaveis(novosSignatarios);
  };

  const getStatusBadge = () => {
    switch (statusAssinatura) {
      case 'pendente':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pendente</Badge>;
      case 'enviado':
        return <Badge variant="default"><Upload className="w-3 h-3 mr-1" />Enviado para Assinatura</Badge>;
      case 'assinado':
        return <Badge variant="default" className="bg-green-500 hover:bg-green-600"><CheckCircle className="w-3 h-3 mr-1" />Assinado</Badge>;
      case 'rejeitado':
        return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />Rejeitado</Badge>;
      case 'erro':
        return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />Erro</Badge>;
      default:
        return null;
    }
  };

  const getStatusColor = () => {
    switch (statusAssinatura) {
      case 'assinado': return 'bg-green-500';
      case 'enviado': return 'bg-blue-500';
      case 'rejeitado': return 'bg-red-500';
      case 'erro': return 'bg-red-500';
      default: return 'bg-gray-300';
    }
  };



  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Assinatura Digital
        </CardTitle>
        <CardDescription>
          Envie documentos para assinatura digital usando a plataforma Autentique
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status da Assinatura */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Status:</span>
          {getStatusBadge()}
        </div>

        {/* Barra de Progresso */}
        {statusAssinatura !== 'pendente' && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progresso</span>
              <span>{progresso}%</span>
            </div>
            <Progress value={progresso} className="h-2" />
          </div>
        )}

        <Separator />

        {/* Exportar PDF ou Upload de Arquivo */}
        {statusAssinatura === 'pendente' && (
          <div className="space-y-2">
            {verificacaoData ? (
              // Modo de exportação de PDF da verificação TP
              <div className="space-y-3">
                <Label>Documento para Assinatura</Label>
                {!arquivoSelecionado ? (
                  <Button
                    onClick={handleExportarPDF}
                    disabled={loading}
                    className="w-full flex items-center gap-2"
                    variant="outline"
                  >
                    <Download className="w-4 h-4" />
                    {loading ? 'Gerando PDF...' : 'Exportar PDF da Verificação'}
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 bg-green-50 border border-green-200 rounded">
                      <FileCheck className="w-4 h-4 text-green-600" />
                      <span className="text-green-800">PDF gerado: {arquivoSelecionado.name}</span>
                      <span className="text-green-600">({(arquivoSelecionado.size / 1024 / 1024).toFixed(2)} MB)</span>
                    </div>
                    <Button
                      onClick={handleExportarPDF}
                      disabled={loading}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Gerar Novo PDF
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              // Modo tradicional de upload de arquivo
              <div>
                <Label htmlFor="arquivo-assinatura">Documento para Assinatura</Label>
                <Input
                  id="arquivo-assinatura"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  disabled={loading}
                />
                {arquivoSelecionado && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                    <FileCheck className="w-4 h-4" />
                    <span>Arquivo selecionado: {arquivoSelecionado.name}</span>
                    <span>({(arquivoSelecionado.size / 1024 / 1024).toFixed(2)} MB)</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Signatários */}
        {signatariosEditaveis.length > 0 && (
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Signatários ({signatariosEditaveis.length})
            </Label>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {signatariosEditaveis.map((signatario, index) => (
                <div key={index} className="p-3 bg-muted rounded border">
                  {statusAssinatura === 'pendente' ? (
                    // Modo de edição
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Input
                          placeholder="Nome do signatário"
                          value={signatario.nome}
                          onChange={(e) => handleEditarSignatario(index, 'nome', e.target.value)}
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoverSignatario(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          Remover
                        </Button>
                      </div>
                      <Input
                        placeholder="Email do signatário"
                        type="email"
                        value={signatario.email}
                        onChange={(e) => handleEditarSignatario(index, 'email', e.target.value)}
                      />

                    </div>
                  ) : (
                    // Modo de visualização
                    <div className="flex items-center justify-between">
                      <div>
                        <strong>{signatario.nome}</strong>
                        <div className="text-xs text-muted-foreground">{signatario.email}</div>
                      </div>
                      {statusDetalhado?.signatures?.[index] && (
                        <Badge variant={statusDetalhado.signatures[index].signed ? 'default' : 'secondary'} className="text-xs">
                          {statusDetalhado.signatures[index].signed ? 'Assinado' : 'Pendente'}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
            {statusAssinatura === 'pendente' && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAdicionarSignatario}
                className="w-full"
              >
                Adicionar Signatário
              </Button>
            )}
          </div>
        )}



        {/* Link de Assinatura */}
        {linkAssinatura && (statusAssinatura === 'enviado' || statusAssinatura === 'assinado') && (
          <div className="space-y-2">
            <Label>Link para Assinatura</Label>
            <div className="flex items-center gap-2">
              <Input value={linkAssinatura} readOnly className="flex-1" />
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(linkAssinatura, '_blank')}
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Botões de Ação */}
        <div className="space-y-2">
          {/* Botão de Teste de Conexão */}
          <Button 
            onClick={handleTestarConexao}
            disabled={testingConnection}
            variant="outline"
            className="w-full"
          >
            {testingConnection ? 'Testando Conexão...' : 'Testar Conexão API'}
          </Button>
          
          <div className="flex gap-2">
            {statusAssinatura === 'pendente' && (
              <Button 
                onClick={handleEnviarParaAssinatura}
                disabled={loading || !arquivoSelecionado || signatarios.length === 0}
                className="flex-1"
              >
                {loading ? 'Enviando...' : 'Enviar para Assinatura'}
              </Button>
            )}
          
          {statusAssinatura === 'enviado' && (
            <>
              <Button 
                variant="outline"
                onClick={handleConsultarStatus}
                disabled={loading}
              >
                {loading ? 'Consultando...' : 'Atualizar Status'}
              </Button>
              
              {/* Botão para assinar (apenas em modo simulado) */}
              {!import.meta.env.VITE_AUTENTIQUE_API_KEY && (
                <Button 
                  onClick={handleAssinarDocumento}
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {loading ? 'Assinando...' : 'Simular Assinatura'}
                </Button>
              )}
            </>
          )}
          
            {statusAssinatura === 'assinado' && statusDetalhado?.files?.signed && (
              <Button 
                variant="outline"
                onClick={() => window.open(statusDetalhado.files.signed, '_blank')}
                className="flex-1"
              >
                <FileText className="w-4 h-4 mr-2" />
                Baixar Documento Assinado
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
