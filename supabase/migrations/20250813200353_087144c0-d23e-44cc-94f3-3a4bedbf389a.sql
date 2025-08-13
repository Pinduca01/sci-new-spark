-- Create bombeiros table
CREATE TABLE public.bombeiros (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  telefone TEXT NOT NULL,
  funcao TEXT NOT NULL CHECK (funcao IN ('GS', 'BA-CE', 'BA-LR', 'BA-MC', 'BA-2')),
  funcao_completa TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'ferias', 'afastado', 'inativo')),
  turno TEXT NOT NULL CHECK (turno IN ('Diurno', 'Noturno')),
  data_admissao DATE NOT NULL,
  avatar TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.bombeiros ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Bombeiros viewable by authenticated users" 
ON public.bombeiros 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Bombeiros can be inserted by authenticated users" 
ON public.bombeiros 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Bombeiros can be updated by authenticated users" 
ON public.bombeiros 
FOR UPDATE 
TO authenticated
USING (true);

CREATE POLICY "Bombeiros can be deleted by authenticated users" 
ON public.bombeiros 
FOR DELETE 
TO authenticated
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_bombeiros_updated_at
BEFORE UPDATE ON public.bombeiros
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert 30 fictional bombeiros
INSERT INTO public.bombeiros (user_id, nome, email, telefone, funcao, funcao_completa, status, turno, data_admissao, avatar) VALUES
(gen_random_uuid(), 'João Silva Santos', 'joao.santos@aeroporto.gov.br', '(11) 99999-0001', 'GS', 'Gerente de Seção', 'ativo', 'Diurno', '2020-01-15', 'JS'),
(gen_random_uuid(), 'Maria Oliveira Costa', 'maria.costa@aeroporto.gov.br', '(11) 99999-0002', 'BA-CE', 'Chefe de Equipe', 'ativo', 'Noturno', '2021-03-10', 'MC'),
(gen_random_uuid(), 'Carlos Roberto Lima', 'carlos.lima@aeroporto.gov.br', '(11) 99999-0003', 'BA-LR', 'Líder de Resgate', 'ativo', 'Diurno', '2019-07-22', 'CL'),
(gen_random_uuid(), 'Ana Paula Ferreira', 'ana.ferreira@aeroporto.gov.br', '(11) 99999-0004', 'BA-MC', 'Motorista Condutor', 'ativo', 'Diurno', '2022-05-08', 'AF'),
(gen_random_uuid(), 'Pedro Henrique Souza', 'pedro.souza@aeroporto.gov.br', '(11) 99999-0005', 'BA-2', 'Bombeiro de Aeródromo', 'ativo', 'Noturno', '2023-01-20', 'PS'),
(gen_random_uuid(), 'Luciana Santos Rocha', 'luciana.rocha@aeroporto.gov.br', '(11) 99999-0006', 'BA-2', 'Bombeiro de Aeródromo', 'ferias', 'Diurno', '2023-08-15', 'LR'),
(gen_random_uuid(), 'Roberto Carlos Almeida', 'roberto.almeida@aeroporto.gov.br', '(11) 99999-0007', 'BA-2', 'Bombeiro de Aeródromo', 'ativo', 'Noturno', '2022-11-12', 'RA'),
(gen_random_uuid(), 'Fernanda Lima Pereira', 'fernanda.pereira@aeroporto.gov.br', '(11) 99999-0008', 'BA-MC', 'Motorista Condutor', 'ativo', 'Diurno', '2021-09-05', 'FP'),
(gen_random_uuid(), 'Marcos Antonio Silva', 'marcos.silva@aeroporto.gov.br', '(11) 99999-0009', 'BA-LR', 'Líder de Resgate', 'ativo', 'Noturno', '2020-06-18', 'MS'),
(gen_random_uuid(), 'Juliana Rodrigues Costa', 'juliana.costa@aeroporto.gov.br', '(11) 99999-0010', 'BA-2', 'Bombeiro de Aeródromo', 'ativo', 'Diurno', '2023-02-28', 'JC'),
(gen_random_uuid(), 'Ricardo Mendes Oliveira', 'ricardo.oliveira@aeroporto.gov.br', '(11) 99999-0011', 'BA-CE', 'Chefe de Equipe', 'ativo', 'Noturno', '2019-12-03', 'RO'),
(gen_random_uuid(), 'Patrícia Alves Santos', 'patricia.santos@aeroporto.gov.br', '(11) 99999-0012', 'BA-2', 'Bombeiro de Aeródromo', 'ativo', 'Diurno', '2022-04-14', 'PA'),
(gen_random_uuid(), 'Bruno Cardoso Lima', 'bruno.lima@aeroporto.gov.br', '(11) 99999-0013', 'BA-MC', 'Motorista Condutor', 'afastado', 'Noturno', '2021-07-21', 'BL'),
(gen_random_uuid(), 'Carla Ribeiro Ferreira', 'carla.ferreira@aeroporto.gov.br', '(11) 99999-0014', 'BA-2', 'Bombeiro de Aeródromo', 'ativo', 'Diurno', '2023-05-09', 'CF'),
(gen_random_uuid(), 'Diego Santos Rocha', 'diego.rocha@aeroporto.gov.br', '(11) 99999-0015', 'BA-LR', 'Líder de Resgate', 'ativo', 'Noturno', '2020-10-30', 'DR'),
(gen_random_uuid(), 'Elisangela Costa Almeida', 'elisangela.almeida@aeroporto.gov.br', '(11) 99999-0016', 'BA-2', 'Bombeiro de Aeródromo', 'ativo', 'Diurno', '2022-01-17', 'EA'),
(gen_random_uuid(), 'Felipe Rodrigues Silva', 'felipe.silva@aeroporto.gov.br', '(11) 99999-0017', 'BA-MC', 'Motorista Condutor', 'ativo', 'Noturno', '2021-11-25', 'FS'),
(gen_random_uuid(), 'Gabriela Lima Santos', 'gabriela.santos@aeroporto.gov.br', '(11) 99999-0018', 'BA-2', 'Bombeiro de Aeródromo', 'ferias', 'Diurno', '2023-03-12', 'GS'),
(gen_random_uuid(), 'Henrique Alves Costa', 'henrique.costa@aeroporto.gov.br', '(11) 99999-0019', 'BA-CE', 'Chefe de Equipe', 'ativo', 'Noturno', '2019-08-14', 'HC'),
(gen_random_uuid(), 'Isabela Ferreira Lima', 'isabela.lima@aeroporto.gov.br', '(11) 99999-0020', 'BA-2', 'Bombeiro de Aeródromo', 'ativo', 'Diurno', '2022-12-06', 'IL'),
(gen_random_uuid(), 'José Carlos Oliveira', 'jose.oliveira@aeroporto.gov.br', '(11) 99999-0021', 'BA-LR', 'Líder de Resgate', 'ativo', 'Noturno', '2020-04-22', 'JO'),
(gen_random_uuid(), 'Karina Santos Pereira', 'karina.pereira@aeroporto.gov.br', '(11) 99999-0022', 'BA-2', 'Bombeiro de Aeródromo', 'ativo', 'Diurno', '2023-07-19', 'KP'),
(gen_random_uuid(), 'Leonardo Rocha Silva', 'leonardo.silva@aeroporto.gov.br', '(11) 99999-0023', 'BA-MC', 'Motorista Condutor', 'ativo', 'Noturno', '2021-05-11', 'LS'),
(gen_random_uuid(), 'Mariana Costa Almeida', 'mariana.almeida@aeroporto.gov.br', '(11) 99999-0024', 'BA-2', 'Bombeiro de Aeródromo', 'ativo', 'Diurno', '2022-08-03', 'MA'),
(gen_random_uuid(), 'Nicolau Lima Ferreira', 'nicolau.ferreira@aeroporto.gov.br', '(11) 99999-0025', 'BA-LR', 'Líder de Resgate', 'ativo', 'Noturno', '2019-11-28', 'NF'),
(gen_random_uuid(), 'Olivia Santos Costa', 'olivia.costa@aeroporto.gov.br', '(11) 99999-0026', 'BA-2', 'Bombeiro de Aeródromo', 'ativo', 'Diurno', '2023-04-15', 'OC'),
(gen_random_uuid(), 'Paulo Henrique Rocha', 'paulo.rocha@aeroporto.gov.br', '(11) 99999-0027', 'BA-CE', 'Chefe de Equipe', 'ativo', 'Noturno', '2020-02-10', 'PR'),
(gen_random_uuid(), 'Queila Almeida Silva', 'queila.silva@aeroporto.gov.br', '(11) 99999-0028', 'BA-2', 'Bombeiro de Aeródromo', 'afastado', 'Diurno', '2022-06-07', 'QS'),
(gen_random_uuid(), 'Rodrigo Ferreira Lima', 'rodrigo.lima@aeroporto.gov.br', '(11) 99999-0029', 'BA-MC', 'Motorista Condutor', 'ativo', 'Noturno', '2021-12-20', 'RL'),
(gen_random_uuid(), 'Sabrina Costa Santos', 'sabrina.santos@aeroporto.gov.br', '(11) 99999-0030', 'BA-2', 'Bombeiro de Aeródromo', 'ativo', 'Diurno', '2023-06-13', 'SS');