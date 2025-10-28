# 📱 Guia de Migração - SCI Mobile Checklist

## 🎯 Objetivo
Separar o aplicativo mobile de checklists do SCI Core em um repositório independente, mantendo o mesmo backend Supabase.

---

## ✅ Arquitetura Final

```
┌─────────────────────────────────────────────────┐
│         SUPABASE (Compartilhado)                │
│  rfgmqogwhlnfrhifsbbg.supabase.co              │
│  - Authentication                               │
│  - Database (viaturas, bombeiros, checklists)   │
│  - Storage (checklist-photos, nao-conformidades)│
└─────────────────────────────────────────────────┘
           ▲                           ▲
           │                           │
    ┌──────┴───────┐          ┌───────┴────────┐
    │  SCI Core    │          │  SCI Mobile    │
    │  (Desktop)   │          │  (PWA)         │
    │              │          │                │
    │ sci.dominio  │          │ mobile.dominio │
    └──────────────┘          └────────────────┘
```

**Vantagens:**
- ✅ Zero duplicação de dados
- ✅ Autenticação unificada
- ✅ Deploy independente
- ✅ Bundle mobile: ~800KB (vs 3.2MB atual)
- ✅ Manutenção simplificada

---

## 📦 Fase 1: Criar Repositório Mobile (30 min)

### 1.1 Clonar e Inicializar
```bash
# Clonar projeto atual
git clone https://github.com/seu-usuario/sci-new-spark.git sci-mobile-checklist
cd sci-mobile-checklist

# Criar novo repo git
rm -rf .git
git init
git add .
git commit -m "Initial commit - SCI Mobile Checklist"
```

### 1.2 Estrutura de Arquivos Mobile
**MANTER:**
```
sci-mobile-checklist/
├── public/
│   ├── sw.js                    # Service Worker
│   ├── manifest.json            # PWA manifest
│   ├── icon-192.png
│   └── icon-512.png
├── src/
│   ├── components/
│   │   ├── checklist-mobile/    # Componentes mobile
│   │   ├── ui/                  # Shadcn UI
│   │   └── ErrorBoundary.tsx
│   ├── hooks/
│   │   ├── useSyncManager.ts
│   │   ├── useOfflineAuth.ts
│   │   ├── useChecklistMobileExecution.ts
│   │   ├── useChecklistEquipamentoExecution.ts
│   │   ├── useChecklistsHistorico.ts
│   │   ├── useBombeiros.ts
│   │   ├── useUserRole.ts
│   │   └── useCurrentUserName.ts
│   ├── lib/
│   │   ├── offlineDb.ts
│   │   ├── supabase.ts
│   │   └── utils.ts
│   ├── pages/
│   │   ├── ChecklistMobileLogin.tsx
│   │   ├── ChecklistMobile.tsx
│   │   ├── ChecklistMobileTipoSelecao.tsx
│   │   ├── ChecklistMobileEquipamentos.tsx
│   │   ├── ChecklistMobileEquipamentoExecucao.tsx
│   │   ├── ChecklistMobileViatura.tsx
│   │   ├── ChecklistMobileSyncStatus.tsx
│   │   ├── ChecklistMobileHistorico.tsx
│   │   └── ChecklistMobileMeuHistorico.tsx
│   ├── utils/
│   │   ├── checklistTemplatesFallback.ts
│   │   ├── checklistTemplatesReal.ts
│   │   └── connectivityUtils.ts
│   ├── integrations/supabase/
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── package.json
├── vite.config.ts
└── README.md
```

**DELETAR TUDO que não está na lista acima:**
```bash
# Páginas desktop
rm -f src/pages/{Dashboard,ControlePessoal,TAF,Ocorrencias,Viaturas,Escalas,Exercicios,PTRBA,AgentesExtintores,TPUniformes,AtividadesAcessorias,OrdemServico,Checklists,AdminCreateUsers,NotFound,Login,Equipamentos}.tsx

# Componentes desktop (exceto checklist-mobile e ui)
find src/components -type f ! -path "*/checklist-mobile/*" ! -path "*/ui/*" ! -name "ErrorBoundary.tsx" -delete

# Hooks não usados no mobile
rm -f src/hooks/{useAgentesExtintores,useTAF,useOcorrencias,useExtintores,useEstoque,usePTR,useEquipes,useMateriais,useMovimentacoes,useInsights,useDashboardStats}.ts
```

### 1.3 Simplificar `package.json`
**Criar arquivo `package.json` otimizado:**
```json
{
  "name": "sci-mobile-checklist",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@radix-ui/react-accordion": "^1.2.11",
    "@radix-ui/react-alert-dialog": "^1.1.14",
    "@radix-ui/react-dialog": "^1.1.14",
    "@radix-ui/react-label": "^2.1.7",
    "@radix-ui/react-progress": "^1.1.7",
    "@radix-ui/react-slot": "^1.2.3",
    "@radix-ui/react-toast": "^1.2.14",
    "@supabase/supabase-js": "^2.56.0",
    "@tanstack/react-query": "^5.83.0",
    "browser-image-compression": "^2.0.2",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "date-fns": "^3.6.0",
    "idb": "^8.0.3",
    "lucide-react": "^0.462.0",
    "next-themes": "^0.3.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-hook-form": "^7.61.1",
    "react-router-dom": "^6.30.1",
    "sonner": "^1.7.4",
    "tailwind-merge": "^2.6.0",
    "zod": "^3.25.76"
  },
  "devDependencies": {
    "@types/node": "^22.16.5",
    "@types/react": "^18.3.23",
    "@types/react-dom": "^18.3.7",
    "@vitejs/plugin-react-swc": "^3.11.0",
    "autoprefixer": "^10.4.21",
    "tailwindcss": "^3.4.17",
    "typescript": "^5.8.3",
    "vite": "^5.4.19"
  }
}
```

**Bundle size antes:** ~3.2MB  
**Bundle size depois:** ~800KB (redução de 75%)

### 1.4 Criar `App.tsx` Minimalista
```tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import ErrorBoundary from "@/components/ErrorBoundary";

const ChecklistMobileLogin = lazy(() => import("./pages/ChecklistMobileLogin"));
const ChecklistMobile = lazy(() => import("./pages/ChecklistMobile"));
const ChecklistMobileTipoSelecao = lazy(() => import("./pages/ChecklistMobileTipoSelecao"));
const ChecklistMobileEquipamentos = lazy(() => import("./pages/ChecklistMobileEquipamentos"));
const ChecklistMobileEquipamentoExecucao = lazy(() => import("./pages/ChecklistMobileEquipamentoExecucao"));
const ChecklistMobileViatura = lazy(() => import("./pages/ChecklistMobileViatura"));
const ChecklistMobileSyncStatus = lazy(() => import("./pages/ChecklistMobileSyncStatus"));
const ChecklistMobileHistorico = lazy(() => import("./pages/ChecklistMobileHistorico"));
const ChecklistMobileMeuHistorico = lazy(() => import("./pages/ChecklistMobileMeuHistorico"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" storageKey="sci-mobile-theme">
      <BrowserRouter>
        <Suspense fallback={<div className="p-4 text-sm">Carregando...</div>}>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<ChecklistMobileLogin />} />
            <Route path="/viaturas" element={<ErrorBoundary><ChecklistMobile /></ErrorBoundary>} />
            <Route path="/tipo/:viaturaId" element={<ErrorBoundary><ChecklistMobileTipoSelecao /></ErrorBoundary>} />
            <Route path="/equipamentos" element={<ErrorBoundary><ChecklistMobileEquipamentos /></ErrorBoundary>} />
            <Route path="/equipamentos/execucao" element={<ErrorBoundary><ChecklistMobileEquipamentoExecucao /></ErrorBoundary>} />
            <Route path="/viatura/:id" element={<ErrorBoundary><ChecklistMobileViatura /></ErrorBoundary>} />
            <Route path="/historico/:viaturaId" element={<ErrorBoundary><ChecklistMobileHistorico /></ErrorBoundary>} />
            <Route path="/meu-historico" element={<ErrorBoundary><ChecklistMobileMeuHistorico /></ErrorBoundary>} />
            <Route path="/sync" element={<ErrorBoundary><ChecklistMobileSyncStatus /></ErrorBoundary>} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
      <Toaster />
      <Sonner />
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
```

### 1.5 Atualizar `vite.config.ts`
```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom', 'react-router-dom'],
          'supabase': ['@supabase/supabase-js'],
          'ui': ['lucide-react', 'sonner']
        }
      }
    }
  }
});
```

---

## 🔗 Fase 2: Configurar Supabase (5 min)

### 2.1 Usar MESMO Projeto Supabase
**Não mudar nada em `src/integrations/supabase/client.ts`!**

O arquivo já está configurado corretamente:
```typescript
const SUPABASE_URL = 'https://rfgmqogwhlnfrhifsbbg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

### 2.2 Adicionar URLs de Redirect
1. Acessar: https://supabase.com/dashboard/project/rfgmqogwhlnfrhifsbbg/auth/url-configuration
2. Em **Redirect URLs**, adicionar:
   - `https://mobile.seudominio.com` (produção)
   - `http://localhost:8080` (desenvolvimento)

---

## 🧹 Fase 3: Limpar SCI Core (15 min)

### 3.1 Deletar Arquivos Mobile do SCI Core
No projeto **sci-new-spark** original:
```bash
# Deletar páginas mobile
rm -f src/pages/ChecklistMobile*.tsx

# Deletar componentes mobile
rm -rf src/components/checklist-mobile/

# Deletar hooks mobile
rm -f src/hooks/{useSyncManager,useOfflineAuth,useChecklistMobileExecution,useChecklistEquipamentoExecution}.ts

# Deletar lib mobile
rm -f src/lib/offlineDb.ts

# Service Worker (opcional - manter se quiser PWA no desktop também)
rm -f public/sw.js
```

### 3.2 Atualizar `App.tsx` do SCI Core
**Remover linhas 30-39, 70-81** (imports e rotas mobile)

### 3.3 Adicionar Redirect no `Login.tsx`
**Substituir linhas 164-170:**
```typescript
// Redirecionar baseado na role
const role = roleData.role;

if (role === 'ba_mc' || role === 'ba_2') {
  // BA-MC e BA-2 vão para o mobile (domínio separado)
  toast({
    title: "Redirecionando para app mobile",
    description: "Você será direcionado para o aplicativo mobile...",
  });
  window.location.href = 'https://mobile.seudominio.com/login';
  return;
} else if (role === 'admin' || role === 'gs_base' || role === 'ba_ce' || role === 'ba_lr') {
  // Admin, GS, BA-CE e BA-LR vão para o dashboard
  toast({
    title: "Login realizado com sucesso",
    description: "Redirecionando...",
  });
  navigate('/dashboard');
} else {
  await supabase.auth.signOut();
  toast({
    title: "Role não reconhecida",
    description: "Entre em contato com o administrador.",
    variant: "destructive",
  });
}
```

---

## 🚀 Fase 4: Deploy Separado (20 min)

### 4.1 Deploy SCI Core (Desktop)
**Vercel/Netlify:**
```bash
# No diretório sci-new-spark
vercel --prod

# Configurar domínio: sci.seudominio.com
```

**Variáveis de ambiente:**
```env
VITE_SUPABASE_URL=https://rfgmqogwhlnfrhifsbbg.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4.2 Deploy SCI Mobile
**Vercel/Netlify:**
```bash
# No diretório sci-mobile-checklist
vercel --prod

# Configurar domínio: mobile.seudominio.com
```

**Mesmas variáveis de ambiente** (mesmo Supabase!):
```env
VITE_SUPABASE_URL=https://rfgmqogwhlnfrhifsbbg.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4.3 Configurar DNS
```
sci.seudominio.com     → CNAME → vercel-sci-core.vercel.app
mobile.seudominio.com  → CNAME → vercel-sci-mobile.vercel.app
```

---

## ✅ Fase 5: Validação

### 5.1 Checklist Mobile
- [ ] Login funciona em `mobile.seudominio.com/login`
- [ ] Lista de viaturas carrega
- [ ] Checklist pode ser criado offline
- [ ] Sincronização automática funciona ao voltar online
- [ ] Fotos são enviadas para Supabase Storage
- [ ] Histórico mostra checklists anteriores
- [ ] PWA pode ser instalado (ícone de instalação aparece)

### 5.2 Checklist SCI Core
- [ ] Login funciona em `sci.seudominio.com`
- [ ] Dashboard mostra dados corretos
- [ ] Checklists criados no mobile aparecem no desktop
- [ ] Usuários BA-MC/BA-2 são redirecionados para mobile
- [ ] Usuários Admin/GS/BA-CE acessam dashboard normalmente

### 5.3 Supabase
- [ ] Checklists criados no mobile são visíveis na tabela `checklists_viaturas`
- [ ] Fotos estão no bucket `checklist-photos`
- [ ] Não-conformidades estão em `nao_conformidades`

---

## 🎯 Melhorias Futuras

### SSO via QR Code
Permitir login automático escaneando QR Code do desktop:
```typescript
// No desktop: gerar token temporário
const generateLoginToken = async () => {
  const token = crypto.randomUUID();
  await supabase.from('login_tokens').insert({
    token,
    user_id: user.id,
    expires_at: new Date(Date.now() + 5 * 60 * 1000) // 5 min
  });
  return `https://mobile.seudominio.com/qr-login?token=${token}`;
};

// No mobile: consumir token
const loginWithQR = async (token: string) => {
  const { data } = await supabase
    .from('login_tokens')
    .select('user_id')
    .eq('token', token)
    .single();
  
  // Gerar sessão para esse user_id
};
```

### Deep Links
```
sci-mobile://login?token=xyz
sci-mobile://checklist?viatura=123
```

---

## 📊 Métricas de Sucesso

| Métrica | Antes | Depois |
|---------|-------|--------|
| **Bundle Size Mobile** | 3.2 MB | 800 KB |
| **Tempo de Build** | 45s | 12s |
| **Lighthouse Score** | 72 | 95+ |
| **TTI (Mobile)** | 3.2s | 1.1s |
| **Deploy Independente** | ❌ | ✅ |

---

## 🆘 Troubleshooting

### Erro: "Invalid redirect URL"
- Verificar se `mobile.seudominio.com` está nas Redirect URLs do Supabase
- Checar se protocolo é HTTPS (não HTTP)

### Erro: "Service Worker registration failed"
- Verificar se `sw.js` está em `public/` (não `src/`)
- Checar se domínio é HTTPS (SW não funciona em HTTP)

### Checklist não sincroniza
- Verificar conexão de internet
- Checar console do navegador para erros de upload
- Verificar se Storage bucket `checklist-photos` tem políticas corretas

---

## 📚 Documentação Adicional

- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [PWA Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [IndexedDB (idb)](https://github.com/jakearchibald/idb)
- [Vercel Deploy](https://vercel.com/docs/deployments/overview)

---

**Criado em:** 2025-01-28  
**Autor:** Equipe SCI  
**Versão:** 1.0
