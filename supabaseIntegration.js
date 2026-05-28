// Configuração do Supabase - Versão CDN (sem npm)
// Adicionar no index.html antes do script.js:
// <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

const SUPABASE_URL = 'https://gqsdxkaarwyayrqftjfo.supabase.co';
const SUPABASE_KEY = 'sb_publishable_DKnA4UiciAU_7y2xs-iwQg_mvE6hh9_';

// Inicializar cliente Supabase
let supabaseClient = null;

async function initSupabaseClient() {
    try {
        if (!window.supabase) {
            throw new Error('Biblioteca Supabase não carregada. Aguarde alguns segundos e tente novamente.');
        }
        
        const { createClient } = window.supabase;
        supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);
        console.log('✅ Cliente Supabase inicializado com sucesso');
        return true;
    } catch (error) {
        console.error('❌ Erro ao inicializar Supabase:', error);
        return false;
    }
}

// Chamar inicialização automaticamente
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSupabaseClient);
} else {
    initSupabaseClient();
}

// ====== FUNÇÕES DE AUTENTICAÇÃO ======
async function loginUserSupabase(email, password) {
    try {
        if (!supabaseClient) {
            await initSupabaseClient();
            if (!supabaseClient) {
                return { success: false, error: 'Falha ao conectar com Supabase' };
            }
        }

        console.log('🔐 Tentando fazer login para:', email);
        
        // Buscar usuário no banco
        const { data, error } = await supabaseClient
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        if (error) {
            console.error('❌ Erro ao buscar usuário:', error);
            return { success: false, error: `Erro ao buscar usuário: ${error.message || error}` };
        }

        if (!data) {
            return { success: false, error: 'Usuário não encontrado' };
        }

        // Verificar senha (em produção, use hash bcrypt)
        if (data.password !== password) {
            return { success: false, error: 'Senha incorreta' };
        }

        // Salvar dados de login
        localStorage.setItem('loggedInUser', email);
        localStorage.setItem('userId', data.id);
        
        console.log('✅ Login bem-sucedido para:', email);
        return { success: true, user: data };
    } catch (error) {
        console.error('❌ Erro durante login:', error);
        return { success: false, error: `Erro de autenticação: ${error.message}` };
    }
}

async function logoutUserSupabase() {
    localStorage.removeItem('loggedInUser');
    localStorage.removeItem('userId');
}

// ====== FUNÇÕES DE ASSESSMENTS ======
async function getAssessmentsFromSupabase() {
    try {
        if (!supabaseClient) {
            await initSupabaseClient();
            if (!supabaseClient) {
                throw new Error('Cliente Supabase não inicializado');
            }
        }

        const userId = localStorage.getItem('userId');
        if (!userId) {
            console.warn('⚠️ Usuário não autenticado');
            return [];
        }
        
        console.log('📥 Carregando assessments para usuário:', userId);
        
        const { data, error } = await supabaseClient
            .from('assessments')
            .select('*')
            .eq('user_id', userId)
            .is('deleted_at', null)
            .order('data_limite', { ascending: true });

        if (error) {
            console.error('❌ Erro ao buscar assessments:', error);
            throw error;
        }
        
        console.log('✅ Assessments carregados:', data?.length || 0);
        
        // Normalizar dados (calcular dias_restantes)
        return (data || []).map(item => ({
            ...item,
            dias_restantes: calculateDaysRemaining(item.data_limite)
        }));
    } catch (error) {
        console.error('❌ Erro ao buscar assessments:', error);
        return [];
    }
}

async function createAssessmentSupabase(assessment) {
    try {
        if (!supabaseClient) {
            await initSupabaseClient();
        }

        const userId = localStorage.getItem('userId');
        if (!userId) return { success: false, error: 'Usuário não autenticado' };
        
        const dias_restantes = calculateDaysRemaining(assessment.data_limite);
        const status = dias_restantes < 0 ? 'Atrasado' : assessment.status;
        
        console.log('➕ Criando novo assessment:', assessment.nome);
        
        const { data, error } = await supabaseClient
            .from('assessments')
            .insert([{
                nome: assessment.nome,
                setor: assessment.setor,
                responsavel: assessment.responsavel,
                data_inicio: assessment.data_inicio,
                data_limite: assessment.data_limite,
                status: status,
                observacoes: assessment.observacoes || '',
                evidencia: assessment.evidencia || '',
                prioridade: assessment.prioridade || 'Média',
                dias_restantes: dias_restantes,
                user_id: userId
            }])
            .select();

        if (error) {
            console.error('❌ Erro ao criar assessment:', error);
            throw error;
        }
        
        // Registrar no histórico
        await addHistorySupabase(data[0].id, 'CREATE', null, assessment);
        
        console.log('✅ Assessment criado:', data[0]);
        return { success: true, data: data[0] };
    } catch (error) {
        console.error('❌ Erro ao criar assessment:', error);
        return { success: false, error: error.message };
    }
}

async function updateAssessmentSupabase(id, updates) {
    try {
        if (!supabaseClient) {
            await initSupabaseClient();
        }

        console.log('✏️ Atualizando assessment ID:', id);
        
        // Buscar dados antigos
        const { data: oldData } = await supabaseClient
            .from('assessments')
            .select('*')
            .eq('id', id)
            .single();

        // Calcular dias restantes e status automaticamente
        const dias_restantes = updates.data_limite ? 
            calculateDaysRemaining(updates.data_limite) : 
            oldData?.dias_restantes;
        
        const status = dias_restantes < 0 && updates.status !== 'Concluído' ? 
            'Atrasado' : (updates.status || oldData?.status);

        const { data, error } = await supabaseClient
            .from('assessments')
            .update({
                ...updates,
                status: status,
                dias_restantes: dias_restantes,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select();

        if (error) {
            console.error('❌ Erro ao atualizar assessment:', error);
            throw error;
        }
        
        // Registrar no histórico
        await addHistorySupabase(id, 'UPDATE', oldData, updates);
        
        console.log('✅ Assessment atualizado:', data[0]);
        return { success: true, data: data[0] };
    } catch (error) {
        console.error('❌ Erro ao atualizar assessment:', error);
        return { success: false, error: error.message };
    }
}

async function deleteAssessmentSupabase(id) {
    try {
        if (!supabaseClient) {
            await initSupabaseClient();
        }

        console.log('🗑️ Deletando assessment ID:', id);
        
        // Soft delete - marcar como deletado
        const { data, error } = await supabaseClient
            .from('assessments')
            .update({ 
                deleted_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select();

        if (error) {
            console.error('❌ Erro ao deletar assessment:', error);
            throw error;
        }
        
        // Registrar no histórico
        await addHistorySupabase(id, 'DELETE', { id }, null);
        
        console.log('✅ Assessment deletado');
        return { success: true };
    } catch (error) {
        console.error('❌ Erro ao deletar assessment:', error);
        return { success: false, error: error.message };
    }
}

// ====== FUNÇÕES DE RELATÓRIO ======
async function getReportFilteredItemsSupabase(setor, status, reportType) {
    try {
        if (!supabaseClient) {
            await initSupabaseClient();
        }

        const userId = localStorage.getItem('userId');
        if (!userId) return [];
        
        let query = supabaseClient
            .from('assessments')
            .select('*')
            .eq('user_id', userId)
            .is('deleted_at', null);

        // Filtrar por setor
        if (setor && setor !== 'Todos') {
            query = query.eq('setor', setor);
        }

        // Filtrar por tipo de relatório
        if (reportType === 'atrasados') {
            query = query.eq('status', 'Atrasado');
        } else if (reportType === 'proximosPrazo') {
            query = query.eq('status', 'Próximo do prazo');
        } else if (reportType === 'concluidos') {
            query = query.eq('status', 'Concluído');
        }

        // Filtrar por status genérico
        if (status && status !== 'Todos' && reportType === 'todos') {
            query = query.eq('status', status);
        }

        const { data, error } = await query.order('data_limite', { ascending: true });

        if (error) {
            console.error('❌ Erro ao buscar filtrados:', error);
            throw error;
        }
        
        return data || [];
    } catch (error) {
        console.error('❌ Erro ao buscar filtrados:', error);
        return [];
    }
}

async function getCompletedAssessmentsSupabase() {
    try {
        if (!supabaseClient) {
            await initSupabaseClient();
        }

        const userId = localStorage.getItem('userId');
        if (!userId) return [];
        
        const { data, error } = await supabaseClient
            .from('assessments')
            .select('*')
            .eq('user_id', userId)
            .eq('status', 'Concluído')
            .is('deleted_at', null);

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('❌ Erro ao buscar concluídos:', error);
        return [];
    }
}

async function getOverdueAssessmentsSupabase() {
    try {
        if (!supabaseClient) {
            await initSupabaseClient();
        }

        const userId = localStorage.getItem('userId');
        if (!userId) return [];
        
        const { data, error } = await supabaseClient
            .from('assessments')
            .select('*')
            .eq('user_id', userId)
            .eq('status', 'Atrasado')
            .is('deleted_at', null);

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('❌ Erro ao buscar atrasados:', error);
        return [];
    }
}

// ====== FUNÇÕES DE AUDITORIA ======
async function addHistorySupabase(assessmentId, action, oldValues, newValues) {
    try {
        if (!supabaseClient) {
            await initSupabaseClient();
        }

        const userId = localStorage.getItem('userId');
        
        await supabaseClient
            .from('assessment_history')
            .insert([{
                assessment_id: assessmentId,
                user_id: userId,
                action: action,
                old_values: oldValues,
                new_values: newValues,
                created_at: new Date().toISOString()
            }]);
    } catch (error) {
        console.error('❌ Erro ao registrar histórico:', error);
    }
}

async function getAssessmentHistorySupabase(assessmentId) {
    try {
        if (!supabaseClient) {
            await initSupabaseClient();
        }

        const { data, error } = await supabaseClient
            .from('assessment_history')
            .select('*')
            .eq('assessment_id', assessmentId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('❌ Erro ao buscar histórico:', error);
        return [];
    }
}

// ====== FUNÇÃO DE SINCRONIZAÇÃO ======
async function syncDataWithSupabase() {
    try {
        if (!supabaseClient) {
            await initSupabaseClient();
        }

        // Verificar se há dados pendentes no localStorage
        const pendingSync = JSON.parse(localStorage.getItem('pendingSync') || '[]');
        
        for (let item of pendingSync) {
            try {
                if (item.type === 'create') {
                    await createAssessmentSupabase(item.data);
                } else if (item.type === 'update') {
                    await updateAssessmentSupabase(item.id, item.data);
                } else if (item.type === 'delete') {
                    await deleteAssessmentSupabase(item.id);
                }
            } catch (error) {
                console.error('❌ Erro ao sincronizar item:', error);
            }
        }
        
        // Limpar fila de sincronização
        localStorage.removeItem('pendingSync');
        
        return { success: true };
    } catch (error) {
        console.error('❌ Erro ao sincronizar:', error);
        return { success: false, error: error.message };
    }
}

// ====== UTILITÁRIOS ======
function calculateDaysRemaining(dataLimite) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const limite = new Date(dataLimite);
    limite.setHours(0, 0, 0, 0);
    
    const diffTime = limite - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Real-time subscription
function subscribeToAssessmentsSupabase(callback) {
    const userId = localStorage.getItem('userId');
    if (!userId) return null;

    if (!supabaseClient) {
        console.warn('⚠️ Cliente Supabase não inicializado para subscription');
        return null;
    }

    try {
        const subscription = supabaseClient
            .channel(`assessments:${userId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'assessments',
                    filter: `user_id=eq.${userId}`
                },
                (payload) => {
                    console.log('🔄 Real-time update:', payload);
                    callback(payload);
                }
            )
            .subscribe();

        return subscription;
    } catch (error) {
        console.error('❌ Erro ao configurar subscription:', error);
        return null;
    }
}

