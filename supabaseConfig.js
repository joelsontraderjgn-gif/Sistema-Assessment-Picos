// Configuração do Supabase
// npm install @supabase/supabase-js

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://gqsdxkaarwyayrqftjfo.supabase.co';
const SUPABASE_KEY = 'sb_publishable_DKnA4UiciAU_7y2xs-iwQg_mvE6hh9_';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Funções de autenticação
export async function loginUser(email, password) {
    try {
        // Buscar usuário no banco
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        if (error || !data) {
            return { success: false, error: 'Usuário não encontrado' };
        }

        // Verificar senha (em produção, use hash)
        if (data.password !== password) {
            return { success: false, error: 'Senha incorreta' };
        }

        localStorage.setItem('loggedInUser', email);
        localStorage.setItem('userId', data.id);
        
        return { success: true, user: data };
    } catch (error) {
        console.error('Login error:', error);
        return { success: false, error: error.message };
    }
}

export async function logoutUser() {
    localStorage.removeItem('loggedInUser');
    localStorage.removeItem('userId');
}

// Funções de Assessments
export async function getAssessments() {
    try {
        const userId = localStorage.getItem('userId');
        
        const { data, error } = await supabase
            .from('assessments')
            .select('*')
            .eq('user_id', userId)
            .is('deleted_at', null)
            .order('data_limite', { ascending: true });

        if (error) throw error;
        
        return data || [];
    } catch (error) {
        console.error('Erro ao buscar assessments:', error);
        return [];
    }
}

export async function createAssessment(assessment) {
    try {
        const userId = localStorage.getItem('userId');
        
        const { data, error } = await supabase
            .from('assessments')
            .insert([{
                ...assessment,
                user_id: userId,
                created_at: new Date().toISOString()
            }])
            .select();

        if (error) throw error;
        
        // Registrar no histórico
        await addHistory(data[0].id, 'CREATE', null, assessment);
        
        return { success: true, data: data[0] };
    } catch (error) {
        console.error('Erro ao criar assessment:', error);
        return { success: false, error: error.message };
    }
}

export async function updateAssessment(id, updates) {
    try {
        // Buscar valores antigos
        const { data: oldData } = await supabase
            .from('assessments')
            .select('*')
            .eq('id', id)
            .single();

        const { data, error } = await supabase
            .from('assessments')
            .update({
                ...updates,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select();

        if (error) throw error;
        
        // Registrar no histórico
        await addHistory(id, 'UPDATE', oldData, updates);
        
        return { success: true, data: data[0] };
    } catch (error) {
        console.error('Erro ao atualizar assessment:', error);
        return { success: false, error: error.message };
    }
}

export async function deleteAssessment(id) {
    try {
        // Soft delete - marcar como deletado
        const { data, error } = await supabase
            .from('assessments')
            .update({ 
                deleted_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select();

        if (error) throw error;
        
        // Registrar no histórico
        await addHistory(id, 'DELETE', { id }, null);
        
        return { success: true };
    } catch (error) {
        console.error('Erro ao deletar assessment:', error);
        return { success: false, error: error.message };
    }
}

export async function getCompletedAssessments() {
    try {
        const userId = localStorage.getItem('userId');
        
        const { data, error } = await supabase
            .from('assessments')
            .select('*')
            .eq('user_id', userId)
            .eq('status', 'Concluído')
            .is('deleted_at', null);

        if (error) throw error;
        
        return data || [];
    } catch (error) {
        console.error('Erro ao buscar concluídos:', error);
        return [];
    }
}

export async function getOverdueAssessments() {
    try {
        const userId = localStorage.getItem('userId');
        
        const { data, error } = await supabase
            .from('assessments')
            .select('*')
            .eq('user_id', userId)
            .eq('status', 'Atrasado')
            .is('deleted_at', null);

        if (error) throw error;
        
        return data || [];
    } catch (error) {
        console.error('Erro ao buscar atrasados:', error);
        return [];
    }
}

export async function getAssessmentsBySetor(setor) {
    try {
        const userId = localStorage.getItem('userId');
        
        const { data, error } = await supabase
            .from('assessments')
            .select('*')
            .eq('user_id', userId)
            .eq('setor', setor)
            .is('deleted_at', null);

        if (error) throw error;
        
        return data || [];
    } catch (error) {
        console.error('Erro ao buscar por setor:', error);
        return [];
    }
}

export async function searchAssessments(query) {
    try {
        const userId = localStorage.getItem('userId');
        
        const { data, error } = await supabase
            .from('assessments')
            .select('*')
            .eq('user_id', userId)
            .is('deleted_at', null)
            .or(`nome.ilike.%${query}%,setor.ilike.%${query}%,responsavel.ilike.%${query}%`);

        if (error) throw error;
        
        return data || [];
    } catch (error) {
        console.error('Erro ao buscar assessments:', error);
        return [];
    }
}

// Funções de Auditoria
export async function addHistory(assessmentId, action, oldValues, newValues) {
    try {
        const userId = localStorage.getItem('userId');
        
        await supabase
            .from('assessment_history')
            .insert([{
                assessment_id: assessmentId,
                user_id: userId,
                action,
                old_values: oldValues,
                new_values: newValues,
                created_at: new Date().toISOString()
            }]);
    } catch (error) {
        console.error('Erro ao registrar histórico:', error);
    }
}

export async function getAssessmentHistory(assessmentId) {
    try {
        const { data, error } = await supabase
            .from('assessment_history')
            .select('*')
            .eq('assessment_id', assessmentId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        
        return data || [];
    } catch (error) {
        console.error('Erro ao buscar histórico:', error);
        return [];
    }
}

// Função para sincronizar dados locais com Supabase
export async function syncDataWithSupabase() {
    try {
        // Buscar dados pendentes do localStorage
        const pendingSync = JSON.parse(localStorage.getItem('pendingSync') || '[]');
        
        for (let item of pendingSync) {
            try {
                if (item.type === 'create') {
                    await createAssessment(item.data);
                } else if (item.type === 'update') {
                    await updateAssessment(item.id, item.data);
                } else if (item.type === 'delete') {
                    await deleteAssessment(item.id);
                }
            } catch (error) {
                console.error('Erro ao sincronizar item:', error);
            }
        }
        
        // Limpar fila de sincronização
        localStorage.removeItem('pendingSync');
        
        return { success: true };
    } catch (error) {
        console.error('Erro ao sincronizar:', error);
        return { success: false, error: error.message };
    }
}

// Real-time subscription para atualizações
export function subscribeToAssessments(userId, callback) {
    const subscription = supabase
        .from(`assessments:user_id=eq.${userId}`)
        .on('*', payload => {
            callback(payload);
        })
        .subscribe();

    return subscription;
}
