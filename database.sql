-- Script SQL para criar as tabelas no Supabase
-- Copie e cole no SQL Editor do Supabase

-- Criar tabela de usuários
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar tabela de assessments
CREATE TABLE public.assessments (
  id BIGSERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  setor VARCHAR(255) NOT NULL,
  responsavel VARCHAR(255),
  data_inicio DATE NOT NULL,
  data_limite DATE NOT NULL,
  status VARCHAR(50) DEFAULT 'Não iniciado',
  observacoes TEXT,
  evidencia TEXT,
  prioridade VARCHAR(50) DEFAULT 'Média',
  dias_restantes INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE
);

-- Criar tabela de histórico/auditoria
CREATE TABLE public.assessment_history (
  id BIGSERIAL PRIMARY KEY,
  assessment_id BIGINT REFERENCES public.assessments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  action VARCHAR(50) NOT NULL,
  old_values JSONB,
  new_values JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar índices para melhor performance
CREATE INDEX idx_assessments_setor ON public.assessments(setor);
CREATE INDEX idx_assessments_status ON public.assessments(status);
CREATE INDEX idx_assessments_user_id ON public.assessments(user_id);
CREATE INDEX idx_assessments_deleted_at ON public.assessments(deleted_at);
CREATE INDEX idx_assessment_history_assessment_id ON public.assessment_history(assessment_id);
CREATE INDEX idx_assessment_history_user_id ON public.assessment_history(user_id);

-- Inserir usuário padrão
INSERT INTO public.users (email, password, name) 
VALUES ('mateusvictorsantos02@gmail.com', 'Mateus-2007', 'Mateus Victor');

-- Dados de exemplo (assessments)
INSERT INTO public.assessments (nome, setor, responsavel, data_inicio, data_limite, status, observacoes, evidencia, prioridade, dias_restantes)
VALUES 
('Auditoria Interna 2026', 'Administrativo', 'João Silva', '2026-01-15', '2026-06-30', 'Em andamento', 'Avaliação de processos', 'Relatório_Jan.pdf', 'Alta', 33),
('Compliance Assessment', 'Trade', 'Maria Santos', '2026-02-01', '2026-05-31', 'Atrasado', 'Verificação de conformidade', '', 'Alta', -3),
('Avaliação de RH', 'RH', 'Pedro Costa', '2026-03-01', '2026-06-15', 'Próximo do prazo', 'Análise de folha de pagamento', 'Planilha_RH.xlsx', 'Média', 18),
('Assessment Comodato', 'ASSESSMENT COMODATO', 'Ana Paula', '2026-02-15', '2026-07-15', 'Não iniciado', '', '', 'Média', 78),
('Inspeção de Armazém', 'ASSESSMENTE ARMAZÉM', 'Ricardo Lima', '2026-01-01', '2026-05-15', 'Atrasado', 'Verificação de estoque', 'Fotos_Armazem.jpg', 'Alta', -13),
('Avaliação Comercial', 'Comercial', 'Fernanda Oliveira', '2026-03-15', '2026-06-30', 'Em andamento', 'Análise de vendas', '', 'Média', 33),
('Revisão Distribuição', 'Distribuição', 'Carlos Mendes', '2026-02-01', '2026-05-20', 'Atrasado', 'Eficiência logística', 'Relatorio_Dist.pdf', 'Alta', -8),
('Inspeção de Frota', 'Frota', 'Bruno Alves', '2026-01-20', '2026-06-20', 'Próximo do prazo', 'Manutenção de veículos', 'Planilha_Frota.xlsx', 'Média', 23),
('Avaliação SHE', 'SHE', 'Lucia Ferreira', '2026-03-01', '2026-07-31', 'Em andamento', 'Segurança e higiene', '', 'Alta', 64),
('Auditoria Financeira', 'Administrativo', 'Roberto Souza', '2026-01-10', '2026-05-10', 'Concluído', 'Revisão de contas', 'Auditoria_Final.pdf', 'Alta', 0);

-- Criar política de Row Level Security (RLS)
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_history ENABLE ROW LEVEL SECURITY;

-- Policy para assessments - usuário vê seus próprios registros
CREATE POLICY "Users can see their own assessments"
ON public.assessments FOR SELECT
USING (auth.uid() = user_id OR auth.role() = 'authenticated');

CREATE POLICY "Users can insert their own assessments"
ON public.assessments FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own assessments"
ON public.assessments FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own assessments"
ON public.assessments FOR DELETE
USING (auth.uid() = user_id);

-- Policy para users
CREATE POLICY "Users can see their own data"
ON public.users FOR SELECT
USING (auth.uid() = id OR auth.role() = 'authenticated');

-- Policy para history
CREATE POLICY "Users can see assessment history"
ON public.assessment_history FOR SELECT
USING (auth.uid() IN (
  SELECT user_id FROM public.assessments WHERE id = assessment_history.assessment_id
) OR auth.role() = 'authenticated');
