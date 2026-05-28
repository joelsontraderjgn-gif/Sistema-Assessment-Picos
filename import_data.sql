-- Script para importar dados existentes de assessments_data.json para Supabase
-- Execute APÓS ter criado as tabelas com database.sql

-- 1. Primeiro, pegar o ID do usuário padrão
WITH user_id AS (
  SELECT id FROM public.users 
  WHERE email = 'mateusvictorsantos02@gmail.com'
  LIMIT 1
)

-- 2. Inserir os dados de assessments
INSERT INTO public.assessments 
(nome, setor, responsavel, data_inicio, data_limite, status, observacoes, evidencia, prioridade, dias_restantes, user_id)
VALUES
-- Substitua pelos valores reais do seu assessments_data.json
-- Formato: (nome, setor, responsavel, data_inicio, data_limite, status, observacoes, evidencia, prioridade, dias_restantes)

('Auditoria Interna 2026', 'Administrativo', 'João Silva', '2026-01-15', '2026-06-30', 'Em andamento', 'Avaliação de processos', 'Relatório_Jan.pdf', 'Alta', 33, (SELECT id FROM user_id)),
('Compliance Assessment', 'Trade', 'Maria Santos', '2026-02-01', '2026-05-31', 'Atrasado', 'Verificação de conformidade', '', 'Alta', -3, (SELECT id FROM user_id)),
('Avaliação de RH', 'RH', 'Pedro Costa', '2026-03-01', '2026-06-15', 'Próximo do prazo', 'Análise de folha de pagamento', 'Planilha_RH.xlsx', 'Média', 18, (SELECT id FROM user_id)),
('Assessment Comodato', 'ASSESSMENT COMODATO', 'Ana Paula', '2026-02-15', '2026-07-15', 'Não iniciado', '', '', 'Média', 78, (SELECT id FROM user_id)),
('Inspeção de Armazém', 'ASSESSMENTE ARMAZÉM', 'Ricardo Lima', '2026-01-01', '2026-05-15', 'Atrasado', 'Verificação de estoque', 'Fotos_Armazem.jpg', 'Alta', -13, (SELECT id FROM user_id)),
('Avaliação Comercial', 'Comercial', 'Fernanda Oliveira', '2026-03-15', '2026-06-30', 'Em andamento', 'Análise de vendas', '', 'Média', 33, (SELECT id FROM user_id)),
('Revisão Distribuição', 'Distribuição', 'Carlos Mendes', '2026-02-01', '2026-05-20', 'Atrasado', 'Eficiência logística', 'Relatorio_Dist.pdf', 'Alta', -8, (SELECT id FROM user_id)),
('Inspeção de Frota', 'Frota', 'Bruno Alves', '2026-01-20', '2026-06-20', 'Próximo do prazo', 'Manutenção de veículos', 'Planilha_Frota.xlsx', 'Média', 23, (SELECT id FROM user_id)),
('Avaliação SHE', 'SHE', 'Lucia Ferreira', '2026-03-01', '2026-07-31', 'Em andamento', 'Segurança e higiene', '', 'Alta', 64, (SELECT id FROM user_id)),
('Auditoria Financeira', 'Administrativo', 'Roberto Souza', '2026-01-10', '2026-05-10', 'Concluído', 'Revisão de contas', 'Auditoria_Final.pdf', 'Alta', 0, (SELECT id FROM user_id))
ON CONFLICT DO NOTHING;

-- Verificar dados inseridos
SELECT COUNT(*) as total_assessments FROM public.assessments;
