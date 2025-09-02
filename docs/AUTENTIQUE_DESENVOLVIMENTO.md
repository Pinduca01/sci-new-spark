# Desenvolvimento com API Autentique

## Problema Identificado

A API Autentique não permite requisições CORS de `localhost` em desenvolvimento, retornando erro `403 Forbidden` mesmo com chave de API válida. Isso impede o desenvolvimento e testes locais da funcionalidade de assinatura digital.

## Solução Implementada

Foi implementado um sistema de **modo mock** que detecta automaticamente o ambiente de desenvolvimento e usa dados simulados quando necessário.

### Como Funciona

O sistema verifica automaticamente:
1. Se está em ambiente de desenvolvimento (`import.meta.env.DEV`)
2. Se não há chave de API configurada (`VITE_AUTENTIQUE_API_KEY`)
3. Se o modo mock foi forçado (`VITE_USE_MOCK_AUTENTIQUE=true`)

Quando qualquer uma dessas condições é verdadeira, o sistema usa dados simulados ao invés de fazer requisições reais para a API.

### Configuração

#### Arquivo .env

```bash
# Para usar dados reais (quando disponível)
VITE_AUTENTIQUE_API_KEY=sua_chave_api_aqui
VITE_USE_MOCK_AUTENTIQUE=false

# Para forçar modo mock (recomendado em desenvolvimento)
VITE_USE_MOCK_AUTENTIQUE=true
```

### Funcionalidades Simuladas

#### 1. Teste de Conexão
- Simula uma conexão bem-sucedida
- Delay de 500ms para realismo
- Logs informativos no console

#### 2. Criação de Documento
- Gera ID único para o documento
- Simula link de assinatura
- Delay de 1.5s para realismo
- Logs detalhados do processo

#### 3. Consulta de Status
- Retorna status "pending" por padrão
- Simula estrutura completa do documento
- Inclui dados do signatário
- Delay de 800ms

#### 4. Assinatura de Documento
- Simula processo de assinatura
- Delay de 2s para realismo
- Retorna sucesso sempre

### Logs de Desenvolvimento

O sistema inclui logs informativos que ajudam a identificar quando o modo mock está ativo:

```
🔧 [MODO DESENVOLVIMENTO] Usando API Autentique simulada
🔧 [MODO DESENVOLVIMENTO] Simulando criação de documento: documento.pdf
✅ [MODO DESENVOLVIMENTO] Documento criado com sucesso
```

### Transição para Produção

Em produção, o sistema automaticamente:
1. Detecta que não está em modo de desenvolvimento
2. Usa a API real da Autentique
3. Requer chave de API válida
4. Remove todos os logs de desenvolvimento

### Vantagens

- ✅ **Desenvolvimento sem bloqueios**: Permite desenvolver e testar localmente
- ✅ **Transição automática**: Funciona em produção sem modificações
- ✅ **Dados realistas**: Simula respostas reais da API
- ✅ **Logs informativos**: Facilita debugging e desenvolvimento
- ✅ **Configurável**: Pode ser ativado/desativado via variável de ambiente

### Limitações

- ⚠️ **Dados simulados**: Não reflete o comportamento real da API em todos os cenários
- ⚠️ **Teste em produção necessário**: Validação final deve ser feita em ambiente real
- ⚠️ **Sincronização manual**: Mudanças na API real precisam ser refletidas no mock

### Recomendações

1. **Desenvolvimento**: Use sempre `VITE_USE_MOCK_AUTENTIQUE=true`
2. **Testes locais**: Valide toda a interface com dados mockados
3. **Staging**: Teste com API real antes do deploy
4. **Produção**: Configure chave de API válida
5. **Monitoramento**: Acompanhe logs para identificar problemas

### Troubleshooting

#### Problema: Mock não está ativando
**Solução**: Verifique se `VITE_USE_MOCK_AUTENTIQUE=true` no arquivo .env

#### Problema: Ainda tentando usar API real
**Solução**: Reinicie o servidor de desenvolvimento após alterar .env

#### Problema: Logs não aparecem
**Solução**: Abra o console do navegador (F12 → Console)

#### Problema: Funcionalidade não funciona em produção
**Solução**: Configure `VITE_AUTENTIQUE_API_KEY` com chave válida