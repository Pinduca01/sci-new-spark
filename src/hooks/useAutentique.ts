import { useState, useEffect } from 'react';

interface AssinaturaData {
  documento: File;
  signatarios: {
    nome: string;
    email: string;
    cpf?: string;
  }[];
}

interface AssinaturaResponse {
  success: boolean;
  documentoId?: string;
  linkAssinatura?: string;
  error?: string;
}

interface DocumentStatus {
  id: string;
  name: string;
  status: 'pending' | 'signed' | 'rejected' | 'completed';
  signatures_count: number;
  signed_count: number;
  rejected_count: number;
  created_at: string;
  updated_at: string;
  signatures: {
    public_id: string;
    name: string;
    email: string;
    cpf?: string;
    action: string;
    viewed: string | null;
    signed: string | null;
    rejected: string | null;
  }[];
  files: {
    original: string;
    signed: string;
  };
}

// Configurar URL da API baseada no ambiente
const getAutentiqueApiUrl = () => {
  const isDevelopment = import.meta.env.DEV;
  const baseUrl = import.meta.env.VITE_AUTENTIQUE_API_URL || 'https://api.autentique.com.br/v2/graphql';
  
  // Em desenvolvimento, usar o proxy para evitar problemas de CORS
  if (isDevelopment) {
    return '/api/autentique/v2/graphql';
  }
  
  return baseUrl;
};

// Detectar se deve usar modo mock (desenvolvimento sem API key ou com falha de conectividade)
const shouldUseMockMode = (() => {
  const isDevelopment = import.meta.env.DEV;
  const hasApiKey = !!import.meta.env.VITE_AUTENTIQUE_API_KEY;
  
  // Em desenvolvimento, usar mock se não tiver API key ou se a API não estiver acessível
  return isDevelopment && (!hasApiKey || import.meta.env.VITE_USE_MOCK_AUTENTIQUE === 'true');
})();

const AUTENTIQUE_API_URL = getAutentiqueApiUrl();
const AUTENTIQUE_API_KEY = import.meta.env.VITE_AUTENTIQUE_API_KEY;

// Funções mock para desenvolvimento
const mockAutentiqueAPI = {
  async criarDocumento(data: AssinaturaData): Promise<AssinaturaResponse> {
    console.log('🔧 [MODO DESENVOLVIMENTO] Simulando criação de documento:', data.documento.name);
    
    // Simular delay da API
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const documentoId = `mock_doc_${Date.now()}`;
    const linkAssinatura = `https://app.autentique.com.br/assinar/${documentoId}`;
    
    console.log('✅ [MODO DESENVOLVIMENTO] Documento criado com sucesso:', {
      documentoId,
      linkAssinatura,
      signatarios: data.signatarios.length
    });
    
    return {
      success: true,
      documentoId,
      linkAssinatura
    };
  },
  
  async consultarStatus(documentoId: string): Promise<DocumentStatus> {
    console.log('🔧 [MODO DESENVOLVIMENTO] Consultando status do documento:', documentoId);
    
    // Simular delay da API
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const mockStatus: DocumentStatus = {
      id: documentoId,
      name: 'Verificação TP - Documento Mock',
      status: 'pending',
      signatures_count: 1,
      signed_count: 0,
      rejected_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      signatures: [
        {
          public_id: 'mock_sig_123',
          name: 'Responsável Técnico',
          email: 'responsavel@exemplo.com',
          action: 'SIGN',
          viewed: null,
          signed: null,
          rejected: null
        }
      ],
      files: {
        original: '',
        signed: ''
      }
    };
    
    console.log('✅ [MODO DESENVOLVIMENTO] Status consultado:', mockStatus.status);
    return mockStatus;
  },
  
  async assinarDocumento(documentoId: string): Promise<boolean> {
    console.log('🔧 [MODO DESENVOLVIMENTO] Simulando assinatura do documento:', documentoId);
    
    // Simular delay da API
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('✅ [MODO DESENVOLVIMENTO] Documento assinado com sucesso');
    return true;
  },
  
  async testarConexao(): Promise<boolean> {
    console.log('🔧 [MODO DESENVOLVIMENTO] Simulando teste de conexão');
    
    // Simular delay da API
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log('✅ [MODO DESENVOLVIMENTO] Conexão simulada com sucesso');
    return true;
  }
};

export const useAutentique = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const useMock = shouldUseMockMode;
  
  // Log do modo atual
  useEffect(() => {
    if (useMock) {
      console.log('🔧 [MODO DESENVOLVIMENTO] Usando API Autentique simulada');
    }
  }, [useMock]);

  const makeGraphQLRequest = async (query: string, variables?: any) => {
    try {
      console.log('Fazendo requisição para:', AUTENTIQUE_API_URL);
      console.log('API Key configurada:', !!AUTENTIQUE_API_KEY);
      console.log('Tentando conectar com a API Autentique...');
      
      // Verificar se estamos em desenvolvimento
      const isDevelopment = import.meta.env.DEV;
      console.log('Modo desenvolvimento:', isDevelopment);
      
      const requestOptions: RequestInit = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AUTENTIQUE_API_KEY}`,
          'Accept': 'application/json',
          'User-Agent': 'SCI-Spark-App/1.0',
        },
        body: JSON.stringify({
          query,
          variables,
        }),
      };
      
      // Em desenvolvimento, adicionar configurações para CORS
      if (isDevelopment) {
        requestOptions.mode = 'cors';
        requestOptions.credentials = 'omit';
      }
      
      console.log('Configurações da requisição:', {
        url: AUTENTIQUE_API_URL,
        method: requestOptions.method,
        headers: requestOptions.headers,
        mode: requestOptions.mode
      });

      const response = await fetch(AUTENTIQUE_API_URL, requestOptions);

      console.log('Status da resposta:', response.status);
      console.log('Headers da resposta:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erro na resposta:', errorText);
        throw new Error(`Erro HTTP! Status: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      
      if (result.errors) {
        console.error('Erros GraphQL:', result.errors);
        throw new Error(result.errors[0]?.message || 'Erro GraphQL');
      }

      return result.data;
    } catch (error) {
      console.error('Erro na requisição GraphQL:', error);
      
      if (error instanceof TypeError) {
        if (error.message.includes('Failed to fetch')) {
          console.error('Erro de conectividade detectado. Possíveis causas:');
          console.error('1. Problema de CORS - A API Autentique pode não permitir requisições do localhost');
          console.error('2. Firewall ou proxy bloqueando a conexão');
          console.error('3. API Autentique temporariamente indisponível');
          console.error('4. Problema de rede local');
          throw new Error('Erro de conectividade: A API Autentique não está acessível. Isso pode ser um problema de CORS em desenvolvimento.');
        }
        if (error.message.includes('NetworkError')) {
          throw new Error('Erro de rede: Verifique sua conexão com a internet.');
        }
      }
      
      throw error;
    }
  };

  // Função alternativa para testar conectividade usando diferentes métodos
  const testarConectividadeAlternativa = async (): Promise<boolean> => {
    try {
      // Primeiro, tentar uma requisição simples sem GraphQL
      console.log('Testando conectividade básica com a API Autentique...');
      console.log('URL sendo testada:', AUTENTIQUE_API_URL);
      
      // Testar diretamente com a API da Autentique (sem proxy)
      console.log('Testando diretamente com a API da Autentique');
      const testResponse = await fetch(AUTENTIQUE_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AUTENTIQUE_API_KEY}`,
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          query: 'query { __typename }'
        })
      });
      
      console.log('Resposta do teste direto:', testResponse.status);
      console.log('Headers da resposta:', Object.fromEntries(testResponse.headers.entries()));
      
      if (!testResponse.ok) {
        const errorText = await testResponse.text();
        console.error('Erro na resposta do teste:', errorText);
      }
      
      return testResponse.status < 500; // Aceitar até erros de cliente (4xx)
    } catch (error) {
      console.error('Erro no teste de conectividade alternativa:', error);
      return false;
    }
  };

  const testarConexao = async (): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      // Usar mock em desenvolvimento
      if (useMock) {
        const result = await mockAutentiqueAPI.testarConexao();
        return result;
      }
      
      // Primeiro testar conectividade básica
      const conectividadeBasica = await testarConectividadeAlternativa();
      console.log('Conectividade básica:', conectividadeBasica);
      
      const query = `
        query {
          __typename
        }
      `;
      
      await makeGraphQLRequest(query);
      console.log('Conexão com API Autentique: OK');
      return true;
    } catch (error) {
      console.error('Falha na conexão com API Autentique:', error);
      setError('Falha na conexão com a API Autentique');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const criarDocumento = async (data: AssinaturaData): Promise<AssinaturaResponse> => {
    setLoading(true);
    setError(null);
    
    try {
      // Usar mock em desenvolvimento
      if (useMock) {
        const result = await mockAutentiqueAPI.criarDocumento(data);
        return result;
      }
      
      // Testar conexão primeiro
      const conexaoOk = await testarConexao();
      if (!conexaoOk) {
        setError('Não foi possível conectar com a API Autentique. Verifique sua conexão e configurações.');
        setLoading(false);
        return { success: false, error: 'Falha na conexão com API Autentique' };
      }

      // Se não tiver API key configurada, usa modo simulado
      if (!AUTENTIQUE_API_KEY) {
        console.warn('API Key da Autentique não configurada. Usando modo simulado.');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const documentoId = `doc_${Date.now()}`;
        const linkAssinatura = `https://app.autentique.com.br/assinar/${documentoId}`;

        return {
          success: true,
          documentoId,
          linkAssinatura
        };
      }

      // Primeiro, fazer upload do arquivo
      const formData = new FormData();
      formData.append('file', data.documento);
      
      // Criar documento via GraphQL
      const createDocumentMutation = `
        mutation CreateDocument($document: CreateDocumentInput!) {
          createDocument(document: $document) {
            id
            name
            signatures {
              public_id
              name
              email
              link {
                short_link
              }
            }
          }
        }
      `;

      const documentInput = {
        name: data.documento.name,
        signers: data.signatarios.map(signatario => {
          const signer: any = {
            name: signatario.nome,
            email: signatario.email,
            action: 'SIGN'
          };
          if (signatario.cpf) {
            signer.cpf = signatario.cpf;
          }
          return signer;
        })
      };

      const result = await makeGraphQLRequest(createDocumentMutation, {
        document: documentInput
      });

      const documento = result.createDocument;
      const primeiroSignatario = documento.signatures[0];

      return {
        success: true,
        documentoId: documento.id,
        linkAssinatura: primeiroSignatario?.link?.short_link
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setLoading(false);
    }
  };

  const consultarStatus = async (documentoId: string): Promise<DocumentStatus> => {
    try {
      // Usar mock em desenvolvimento
      if (useMock) {
        const result = await mockAutentiqueAPI.consultarStatus(documentoId);
        return result;
      }
      
      // Se não tiver API key configurada, usa modo simulado
      if (!AUTENTIQUE_API_KEY) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        return {
          id: documentoId,
          name: 'Documento Simulado',
          status: 'pending',
          signatures_count: 1,
          signed_count: 0,
          rejected_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          signatures: [
            {
              public_id: 'sig_123',
              name: 'João Silva',
              email: 'joao@exemplo.com',
              action: 'SIGN',
              viewed: null,
              signed: null,
              rejected: null
            }
          ],
          files: {
            original: '',
            signed: ''
          }
        };
      }

      const documentQuery = `
        query GetDocument($id: ID!) {
          document(id: $id) {
            id
            name
            signatures_count
            signed_count
            rejected_count
            created_at
            updated_at
            signatures {
              public_id
              name
              email
              cpf
              action
              viewed
              signed
              rejected
            }
            files {
              original
              signed
            }
          }
        }
      `;

      const result = await makeGraphQLRequest(documentQuery, { id: documentoId });
      const documento = result.document;

      // Determinar status baseado nas assinaturas
      let status: DocumentStatus['status'] = 'pending';
      if (documento.rejected_count > 0) {
        status = 'rejected';
      } else if (documento.signed_count === documento.signatures_count) {
        status = 'completed';
      } else if (documento.signed_count > 0) {
        status = 'signed';
      }

      return {
        ...documento,
        status
      };
    } catch (err) {
      throw new Error('Erro ao consultar status do documento');
    }
  };

  const assinarDocumento = async (documentoId: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      // Usar mock em desenvolvimento
      if (useMock) {
        const result = await mockAutentiqueAPI.assinarDocumento(documentoId);
        return result;
      }
      
      // Se não tiver API key configurada, usa modo simulado
      if (!AUTENTIQUE_API_KEY) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        return true;
      }

      const signDocumentMutation = `
        mutation SignDocument($id: ID!) {
          signDocument(id: $id) {
            id
            signed_count
          }
        }
      `;

      await makeGraphQLRequest(signDocumentMutation, { id: documentoId });
      return true;
    } catch (err) {
      throw new Error('Erro ao assinar documento');
    }
  };

  return {
    criarDocumento,
    consultarStatus,
    assinarDocumento,
    testarConexao,
    loading,
    error
  };
};

// Função auxiliar para converter arquivo para base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove o prefixo "data:application/pdf;base64," ou similar
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
};