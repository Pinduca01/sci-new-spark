# Documentação Técnica - Ajuste da Tabela Exercícios EPI/EPR

## 1. Visão Geral da Solução

Em vez de criar uma nova tabela, esta abordagem modifica a estrutura atual da tabela `exercicios_epi` para armazenar dados individuais de cada bombeiro como registros separados, mantendo a simplicidade e evitando complexidade de relacionamentos.

## 2. Estrutura Atual vs Nova Estrutura

### 2.1 Estrutura Atual
```sql
CREATE TABLE exercicios_epi (
  id UUID PRIMARY KEY,
  data DATE NOT NULL,
  equipe TEXT NOT NULL,
  chefe_equipe TEXT NOT NULL,
  tipo_epi TEXT NOT NULL,
  tempo_vestimento INTEGER NOT NULL, -- tempo agregado
  status TEXT NOT NULL,
  bombeiros TEXT[] NOT NULL, -- array de nomes
  observacoes TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### 2.2 Nova Estrutura Proposta (Tabela Única Modificada)
```sql
CREATE TABLE exercicios_epi (
  id UUID PRIMARY KEY,
  exercicio_grupo_id UUID, -- ID para agrupar bombeiros do mesmo exercício
  data DATE NOT NULL,
  hora TIME,
  identificacao_local TEXT,
  equipe TEXT NOT NULL,
  chefe_equipe TEXT NOT NULL,
  tipo_epi TEXT NOT NULL,
  status TEXT NOT NULL,
  observacoes TEXT,
  -- Dados individuais do bombeiro
  bombeiro_id UUID REFERENCES bombeiros(id),
  bombeiro_nome TEXT NOT NULL,
  bombeiro_funcao TEXT NOT NULL,
  tempo_calca_bota INTEGER, -- em segundos
  tempo_tp_completo INTEGER, -- em segundos
  tempo_epr_tp_completo INTEGER, -- em segundos
  tempo_epr_sem_tp INTEGER, -- em segundos
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

## 3. Script de Migração

### 3.1 Backup e Preparação
```sql
-- 1. Criar backup da tabela atual
CREATE TABLE exercicios_epi_backup AS 
SELECT * FROM exercicios_epi;

-- 2. Verificar dados existentes
SELECT COUNT(*) as total_exercicios FROM exercicios_epi;
```

### 3.2 Modificação da Estrutura
```sql
-- 3. Adicionar novos campos
ALTER TABLE exercicios_epi ADD COLUMN IF NOT EXISTS exercicio_grupo_id UUID;
ALTER TABLE exercicios_epi ADD COLUMN IF NOT EXISTS hora TIME;
ALTER TABLE exercicios_epi ADD COLUMN IF NOT EXISTS identificacao_local TEXT;
ALTER TABLE exercicios_epi ADD COLUMN IF NOT EXISTS bombeiro_id UUID REFERENCES bombeiros(id);
ALTER TABLE exercicios_epi ADD COLUMN IF NOT EXISTS bombeiro_nome TEXT;
ALTER TABLE exercicios_epi ADD COLUMN IF NOT EXISTS bombeiro_funcao TEXT;
ALTER TABLE exercicios_epi ADD COLUMN IF NOT EXISTS tempo_calca_bota INTEGER;
ALTER TABLE exercicios_epi ADD COLUMN IF NOT EXISTS tempo_tp_completo INTEGER;
ALTER TABLE exercicios_epi ADD COLUMN IF NOT EXISTS tempo_epr_tp_completo INTEGER;
ALTER TABLE exercicios_epi ADD COLUMN IF NOT EXISTS tempo_epr_sem_tp INTEGER;

-- 4. Migrar dados existentes
-- Criar registros individuais para cada bombeiro
INSERT INTO exercicios_epi (
  exercicio_grupo_id,
  data,
  equipe,
  chefe_equipe,
  tipo_epi,
  status,
  observacoes,
  bombeiro_nome,
  bombeiro_funcao,
  created_at,
  updated_at
)
SELECT 
  e.id as exercicio_grupo_id, -- Usar ID original como grupo
  e.data,
  e.equipe,
  e.chefe_equipe,
  e.tipo_epi,
  e.status,
  e.observacoes,
  unnest(e.bombeiros) as bombeiro_nome,
  'Função não especificada' as bombeiro_funcao,
  e.created_at,
  e.updated_at
FROM exercicios_epi_backup e
WHERE array_length(e.bombeiros, 1) > 0;

-- 5. Remover registros antigos (manter apenas os novos individuais)
DELETE FROM exercicios_epi 
WHERE exercicio_grupo_id IS NULL;

-- 6. Remover campos obsoletos
ALTER TABLE exercicios_epi DROP COLUMN IF EXISTS bombeiros;
ALTER TABLE exercicios_epi DROP COLUMN IF EXISTS tempo_vestimento;

-- 7. Tornar campos obrigatórios
ALTER TABLE exercicios_epi ALTER COLUMN bombeiro_nome SET NOT NULL;
ALTER TABLE exercicios_epi ALTER COLUMN bombeiro_funcao SET NOT NULL;
```

### 3.3 Índices e Performance
```sql
-- Criar índices para consultas eficientes
CREATE INDEX IF NOT EXISTS idx_exercicios_epi_grupo_id ON exercicios_epi(exercicio_grupo_id);
CREATE INDEX IF NOT EXISTS idx_exercicios_epi_data ON exercicios_epi(data);
CREATE INDEX IF NOT EXISTS idx_exercicios_epi_equipe ON exercicios_epi(equipe);
CREATE INDEX IF NOT EXISTS idx_exercicios_epi_bombeiro_nome ON exercicios_epi(bombeiro_nome);
CREATE INDEX IF NOT EXISTS idx_exercicios_epi_bombeiro_id ON exercicios_epi(bombeiro_id);
```

## 4. Interfaces TypeScript Atualizadas

### 4.1 Interface Principal
```typescript
// Estrutura individual (cada registro representa um bombeiro)
export interface ExercicioEPIIndividual {
  id: string;
  exercicio_grupo_id: string; // Agrupa bombeiros do mesmo exercício
  data: string;
  hora?: string;
  identificacao_local?: string;
  equipe: 'Alfa' | 'Bravo' | 'Charlie' | 'Delta';
  chefe_equipe: string;
  tipo_epi: 'EPI' | 'EPR';
  status: 'Pendente' | 'Em Andamento' | 'Concluído' | 'Cancelado';
  observacoes?: string;
  // Dados do bombeiro
  bombeiro_id?: string;
  bombeiro_nome: string;
  bombeiro_funcao: string;
  tempo_calca_bota?: number;
  tempo_tp_completo?: number;
  tempo_epr_tp_completo?: number;
  tempo_epr_sem_tp?: number;
  created_at: string;
  updated_at: string;
}

// Interface agrupada para visualização
export interface ExercicioEPIAgrupado {
  exercicio_grupo_id: string;
  data: string;
  hora?: string;
  identificacao_local?: string;
  equipe: 'Alfa' | 'Bravo' | 'Charlie' | 'Delta';
  chefe_equipe: string;
  tipo_epi: 'EPI' | 'EPR';
  status: 'Pendente' | 'Em Andamento' | 'Concluído' | 'Cancelado';
  observacoes?: string;
  bombeiros: {
    id: string;
    bombeiro_id?: string;
    bombeiro_nome: string;
    bombeiro_funcao: string;
    tempo_calca_bota?: number;
    tempo_tp_completo?: number;
    tempo_epr_tp_completo?: number;
    tempo_epr_sem_tp?: number;
  }[];
  created_at: string;
  updated_at: string;
}
```

## 5. Hooks Atualizados

### 5.1 Hook para Buscar Exercícios
```typescript
export const useExerciciosEPI = () => {
  return useQuery({
    queryKey: ['exercicios-epi'],
    queryFn: async (): Promise<ExercicioEPIAgrupado[]> => {
      const { data, error } = await supabase
        .from('exercicios_epi')
        .select('*')
        .order('data', { ascending: false })
        .order('bombeiro_nome', { ascending: true });
      
      if (error) throw error;
      
      // Agrupar por exercicio_grupo_id
      const exerciciosAgrupados = data.reduce((acc, item) => {
        const grupoId = item.exercicio_grupo_id;
        
        if (!acc[grupoId]) {
          acc[grupoId] = {
            exercicio_grupo_id: grupoId,
            data: item.data,
            hora: item.hora,
            identificacao_local: item.identificacao_local,
            equipe: item.equipe,
            chefe_equipe: item.chefe_equipe,
            tipo_epi: item.tipo_epi,
            status: item.status,
            observacoes: item.observacoes,
            created_at: item.created_at,
            updated_at: item.updated_at,
            bombeiros: []
          };
        }
        
        acc[grupoId].bombeiros.push({
          id: item.id,
          bombeiro_id: item.bombeiro_id,
          bombeiro_nome: item.bombeiro_nome,
          bombeiro_funcao: item.bombeiro_funcao,
          tempo_calca_bota: item.tempo_calca_bota,
          tempo_tp_completo: item.tempo_tp_completo,
          tempo_epr_tp_completo: item.tempo_epr_tp_completo,
          tempo_epr_sem_tp: item.tempo_epr_sem_tp
        });
        
        return acc;
      }, {} as Record<string, ExercicioEPIAgrupado>);
      
      return Object.values(exerciciosAgrupados);
    }
  });
};
```

### 5.2 Hook para Criar Exercício
```typescript
export const useCreateExercicioEPI = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (exercicio: CreateExercicioEPI) => {
      const exercicioGrupoId = crypto.randomUUID();
      
      // Criar um registro para cada bombeiro
      const registros = exercicio.bombeiros.map(bombeiro => ({
        exercicio_grupo_id: exercicioGrupoId,
        data: exercicio.data,
        hora: exercicio.hora,
        identificacao_local: exercicio.identificacao_local,
        equipe: exercicio.equipe,
        chefe_equipe: exercicio.chefe_equipe,
        tipo_epi: exercicio.tipo_epi,
        status: exercicio.status || 'Concluído',
        observacoes: exercicio.observacoes,
        bombeiro_id: bombeiro.bombeiro_id,
        bombeiro_nome: bombeiro.bombeiro_nome,
        bombeiro_funcao: bombeiro.bombeiro_funcao,
        tempo_calca_bota: bombeiro.tempo_calca_bota,
        tempo_tp_completo: bombeiro.tempo_tp_completo,
        tempo_epr_tp_completo: bombeiro.tempo_epr_tp_completo,
        tempo_epr_sem_tp: bombeiro.tempo_epr_sem_tp
      }));
      
      const { data, error } = await supabase
        .from('exercicios_epi')
        .insert(registros)
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercicios-epi'] });
    }
  });
};
```

### 5.3 Hook para Atualizar Exercício
```typescript
export const useUpdateExercicioEPI = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ exercicioGrupoId, updates }: {
      exercicioGrupoId: string;
      updates: UpdateExercicioEPI;
    }) => {
      // 1. Remover registros existentes do grupo
      const { error: deleteError } = await supabase
        .from('exercicios_epi')
        .delete()
        .eq('exercicio_grupo_id', exercicioGrupoId);
      
      if (deleteError) throw deleteError;
      
      // 2. Inserir novos registros
      if (updates.bombeiros && updates.bombeiros.length > 0) {
        const registros = updates.bombeiros.map(bombeiro => ({
          exercicio_grupo_id: exercicioGrupoId,
          data: updates.data,
          hora: updates.hora,
          identificacao_local: updates.identificacao_local,
          equipe: updates.equipe,
          chefe_equipe: updates.chefe_equipe,
          tipo_epi: updates.tipo_epi,
          status: updates.status,
          observacoes: updates.observacoes,
          bombeiro_id: bombeiro.bombeiro_id,
          bombeiro_nome: bombeiro.bombeiro_nome,
          bombeiro_funcao: bombeiro.bombeiro_funcao,
          tempo_calca_bota: bombeiro.tempo_calca_bota,
          tempo_tp_completo: bombeiro.tempo_tp_completo,
          tempo_epr_tp_completo: bombeiro.tempo_epr_tp_completo,
          tempo_epr_sem_tp: bombeiro.tempo_epr_sem_tp
        }));
        
        const { data, error } = await supabase
          .from('exercicios_epi')
          .insert(registros)
          .select();
        
        if (error) throw error;
        return data;
      }
      
      return [];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercicios-epi'] });
    }
  });
};
```

## 6. Modificações no Modal

### 6.1 Função handleSave Atualizada
```typescript
const handleSave = async () => {
  setLoading(true);
  
  try {
    // Converter bombeiros do formato do modal para o formato do banco
    const bombeirosFormatados = bombeiros.map(bombeiro => {
      const bombeiroCadastrado = bombeirosCadastrados.find(
        b => b.nome === bombeiro.nome
      );
      
      return {
        bombeiro_id: bombeiroCadastrado?.id,
        bombeiro_nome: bombeiro.nome,
        bombeiro_funcao: bombeiro.funcao,
        tempo_calca_bota: timeToSeconds(bombeiro.calcaBota),
        tempo_tp_completo: timeToSeconds(bombeiro.tpCompleto),
        tempo_epr_tp_completo: timeToSeconds(bombeiro.eprTpCompleto),
        tempo_epr_sem_tp: timeToSeconds(bombeiro.eprSemTp)
      };
    });
    
    const exercicioData = {
      data,
      hora,
      identificacao_local: identificacaoLocal,
      equipe,
      chefe_equipe: chefeEquipe,
      tipo_epi: "EPI" as const,
      status: "Concluído" as const,
      observacoes,
      bombeiros: bombeirosFormatados
    };

    if (exercicioParaEdicao) {
      // Atualizar exercício existente
      await updateExercicio({
        exercicioGrupoId: exercicioParaEdicao.exercicio_grupo_id,
        updates: exercicioData
      });
    } else {
      // Criar novo exercício
      await createExercicio(exercicioData);
    }
    
    toast({
      title: exercicioParaEdicao ? "Exercício atualizado" : "Exercício criado",
      description: "Dados salvos com sucesso.",
    });
    
    onOpenChange(false);
  } catch (error) {
    console.error('Erro ao salvar exercício:', error);
    toast({
      title: "Erro",
      description: "Erro ao salvar exercício.",
      variant: "destructive",
    });
  } finally {
    setLoading(false);
  }
};
```

## 7. Componente de Visualização

### 7.1 ExercicioEPIVisualizacao Atualizado
```typescript
const ExercicioEPIVisualizacao = ({ exercicio, open, onOpenChange }) => {
  if (!exercicio) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Cabeçalho */}
        <div className="mb-4">
          <h2>Exercício de {exercicio.tipo_epi}</h2>
          <p>Data: {exercicio.data} {exercicio.hora && `- Hora: ${exercicio.hora}`}</p>
          {exercicio.identificacao_local && (
            <p>Local: {exercicio.identificacao_local}</p>
          )}
          <p>Equipe: {exercicio.equipe}</p>
          <p>Chefe: {exercicio.chefe_equipe}</p>
        </div>

        {/* Tabela de bombeiros */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2">Nome</th>
                <th className="border p-2">Função</th>
                <th className="border p-2">Calça + Bota</th>
                <th className="border p-2">TP Completo</th>
                <th className="border p-2">EPR + TP Completo</th>
                <th className="border p-2">EPR sem TP</th>
              </tr>
            </thead>
            <tbody>
              {exercicio.bombeiros?.map((bombeiro) => (
                <tr key={bombeiro.id}>
                  <td className="border p-2">{bombeiro.bombeiro_nome}</td>
                  <td className="border p-2">{bombeiro.bombeiro_funcao}</td>
                  <td className="border p-2 text-center">
                    {secondsToTime(bombeiro.tempo_calca_bota)}
                  </td>
                  <td className="border p-2 text-center">
                    {secondsToTime(bombeiro.tempo_tp_completo)}
                  </td>
                  <td className="border p-2 text-center">
                    {secondsToTime(bombeiro.tempo_epr_tp_completo)}
                  </td>
                  <td className="border p-2 text-center">
                    {secondsToTime(bombeiro.tempo_epr_sem_tp)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Observações */}
        {exercicio.observacoes && (
          <div className="mt-4">
            <h3 className="font-semibold">Observações:</h3>
            <p className="mt-2">{exercicio.observacoes}</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
```

## 8. Vantagens desta Abordagem

### 8.1 Simplicidade
- **Uma única tabela**: Não há necessidade de JOINs complexos
- **Estrutura simples**: Fácil de entender e manter
- **Migração direta**: Transformação dos dados existentes

### 8.2 Performance
- **Consultas diretas**: Sem necessidade de relacionamentos
- **Índices eficientes**: Busca rápida por grupo ou bombeiro
- **Menos complexidade**: Operações CRUD mais simples

### 8.3 Flexibilidade
- **Dados individuais**: Cada bombeiro tem seu registro
- **Consultas granulares**: Busca por bombeiro específico
- **Relatórios detalhados**: Análise individual e por grupo

## 9. Considerações

### 9.1 Redundância de Dados
- Dados do exercício são repetidos para cada bombeiro
- Pode ser mitigado com views ou consultas agrupadas
- Trade-off aceitável pela simplicidade

### 9.2 Integridade
- Usar `exercicio_grupo_id` para manter consistência
- Validações no frontend para garantir dados corretos
- Triggers podem ser adicionados se necessário

### 9.3 Migração
- Backup obrigatório antes da execução
- Teste em ambiente de desenvolvimento
- Validação dos dados migrados

Esta abordagem mantém a simplicidade da estrutura atual enquanto permite o armazenamento individual de dados por bombeiro, atendendo aos requisitos sem adicionar complexidade desnecessária.
