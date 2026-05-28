// Teste de Integração Supabase
// Abra o console do navegador (F12) e execute estes testes

console.log('=== TESTE DE INTEGRAÇÃO SUPABASE ===\n');

// ✅ Teste 1: Verificar se Supabase está carregado
async function testeSupabaseCarregado() {
    console.log('📦 Teste 1: Supabase Carregado?');
    if (typeof supabase !== 'undefined') {
        console.log('✅ Supabase carregado com sucesso');
        console.log(`   URL: ${SUPABASE_URL}`);
        return true;
    } else {
        console.error('❌ Supabase NÃO carregado. Verifique se a CDN foi adicionada no HTML');
        return false;
    }
}

// ✅ Teste 2: Verificar conexão com banco
async function testeConexao() {
    console.log('\n🔌 Teste 2: Conexão com Supabase?');
    try {
        const { data, error } = await supabase
            .from('users')
            .select('count', { count: 'exact', head: true });
        
        if (error) throw error;
        console.log('✅ Conexão bem-sucedida');
        return true;
    } catch (error) {
        console.error('❌ Erro de conexão:', error.message);
        return false;
    }
}

// ✅ Teste 3: Listar usuários
async function testeListarUsuarios() {
    console.log('\n👥 Teste 3: Usuários no banco?');
    try {
        const { data, error } = await supabase
            .from('users')
            .select('*');
        
        if (error) throw error;
        console.log(`✅ ${data.length} usuário(s) encontrado(s):`);
        data.forEach(user => {
            console.log(`   - ${user.email} (${user.name})`);
        });
        return true;
    } catch (error) {
        console.error('❌ Erro ao listar usuários:', error.message);
        return false;
    }
}

// ✅ Teste 4: Listar assessments
async function testeListarAssessments() {
    console.log('\n📋 Teste 4: Assessments no banco?');
    try {
        const { data, error } = await supabase
            .from('assessments')
            .select('*', { count: 'exact' });
        
        if (error) throw error;
        console.log(`✅ ${data.length} assessment(s) encontrado(s)`);
        if (data.length > 0) {
            console.log('   Primeiros 3:');
            data.slice(0, 3).forEach(item => {
                console.log(`   - ${item.nome} (${item.setor}) - Status: ${item.status}`);
            });
        }
        return true;
    } catch (error) {
        console.error('❌ Erro ao listar assessments:', error.message);
        return false;
    }
}

// ✅ Teste 5: Testar funções de integração
async function testeFuncoes() {
    console.log('\n⚙️ Teste 5: Funções supabaseIntegration.js?');
    
    const funcoes = [
        'loginUserSupabase',
        'logoutUserSupabase',
        'getAssessmentsFromSupabase',
        'createAssessmentSupabase',
        'updateAssessmentSupabase',
        'deleteAssessmentSupabase',
        'getReportFilteredItemsSupabase',
        'subscribeToAssessmentsSupabase'
    ];
    
    let disponaveis = 0;
    for (let func of funcoes) {
        if (typeof window[func] === 'function') {
            console.log(`✅ ${func}`);
            disponaveis++;
        } else {
            console.error(`❌ ${func} NÃO encontrada`);
        }
    }
    
    console.log(`\n   ${disponaveis}/${funcoes.length} funções disponíveis`);
    return disponaveis === funcoes.length;
}

// ✅ Teste 6: Testar login
async function testeLogin() {
    console.log('\n🔐 Teste 6: Login com credenciais padrão?');
    try {
        const result = await loginUserSupabase('mateusvictorsantos02@gmail.com', 'Mateus-2007');
        
        if (result.success) {
            console.log('✅ Login bem-sucedido');
            console.log(`   Email: ${result.user.email}`);
            console.log(`   ID: ${result.user.id}`);
            console.log(`   localStorage.userId: ${localStorage.getItem('userId')}`);
            return true;
        } else {
            console.error('❌ Login falhou:', result.error);
            return false;
        }
    } catch (error) {
        console.error('❌ Erro ao fazer login:', error.message);
        return false;
    }
}

// ✅ Teste 7: Buscar assessments após login
async function testeBuscarAssessments() {
    console.log('\n📥 Teste 7: Buscar assessments do usuário?');
    try {
        const data = await getAssessmentsFromSupabase();
        console.log(`✅ ${data.length} assessment(s) do usuário`);
        if (data.length > 0) {
            console.log('   Primeiros 2:');
            data.slice(0, 2).forEach(item => {
                console.log(`   - ${item.nome} | Dias restantes: ${item.dias_restantes}`);
            });
        }
        return true;
    } catch (error) {
        console.error('❌ Erro ao buscar:', error.message);
        return false;
    }
}

// ✅ Teste 8: Testar criação de novo assessment
async function testeCriarAssessment() {
    console.log('\n➕ Teste 8: Criar novo assessment?');
    try {
        const novoAssessment = {
            nome: 'Teste Integração - ' + new Date().toLocaleTimeString(),
            setor: 'Administrativo',
            responsavel: 'Testador',
            data_inicio: '2026-05-28',
            data_limite: '2026-06-28',
            status: 'Não iniciado',
            observacoes: 'Criado via teste de integração',
            evidencia: '',
            prioridade: 'Média'
        };
        
        const result = await createAssessmentSupabase(novoAssessment);
        
        if (result.success) {
            console.log('✅ Assessment criado com sucesso');
            console.log(`   ID: ${result.data.id}`);
            console.log(`   Nome: ${result.data.nome}`);
            return true;
        } else {
            console.error('❌ Erro ao criar:', result.error);
            return false;
        }
    } catch (error) {
        console.error('❌ Erro:', error.message);
        return false;
    }
}

// Executar todos os testes
async function executarTodosTestes() {
    console.clear();
    console.log('%c🧪 SUITE DE TESTES - INTEGRAÇÃO SUPABASE', 'font-size: 16px; font-weight: bold; color: #008200;');
    console.log('Iniciado em:', new Date().toLocaleString());
    console.log('═'.repeat(50));
    
    const resultados = [];
    
    // Testes básicos
    resultados.push(await testeSupabaseCarregado());
    if (!resultados[0]) {
        console.error('\n❌ Supabase não carregado. Abra na mesma aba os últimos testes.');
        return;
    }
    
    resultados.push(await testeConexao());
    if (!resultados[1]) {
        console.error('\n❌ Sem conexão. Verifique URL e Key.');
        return;
    }
    
    resultados.push(await testeListarUsuarios());
    resultados.push(await testeListarAssessments());
    resultados.push(await testeFuncoes());
    resultados.push(await testeLogin());
    resultados.push(await testeBuscarAssessments());
    resultados.push(await testeCriarAssessment());
    
    // Resumo
    console.log('\n' + '═'.repeat(50));
    const passados = resultados.filter(r => r).length;
    const total = resultados.length;
    const percentual = Math.round((passados / total) * 100);
    
    console.log(`\n%c📊 RESULTADO: ${passados}/${total} testes passaram (${percentual}%)`, 
                passados === total ? 'color: green; font-weight: bold;' : 'color: orange; font-weight: bold;');
    
    if (passados === total) {
        console.log('%c✅ Integração Supabase funcionando 100%!', 'color: green; font-weight: bold; font-size: 14px;');
    } else {
        console.log('%c⚠️  Verifique os erros acima', 'color: red; font-weight: bold; font-size: 14px;');
    }
}

// Executar
executarTodosTestes().catch(console.error);

// ======== COMANDOS MANUAIS PARA CONSOLE ========

console.log('\n\n%c💡 Comandos úteis para testar manualmente:', 'font-weight: bold; font-size: 12px;');
console.log(`
// Fazer login
loginUserSupabase('mateusvictorsantos02@gmail.com', 'Mateus-2007')

// Buscar assessments
getAssessmentsFromSupabase()

// Criar novo assessment
createAssessmentSupabase({
  nome: 'Teste',
  setor: 'Trade',
  responsavel: 'Você',
  data_inicio: '2026-05-28',
  data_limite: '2026-06-28',
  status: 'Não iniciado'
})

// Atualizar assessment (precisa do ID)
updateAssessmentSupabase(1, { status: 'Em andamento' })

// Deletar assessment
deleteAssessmentSupabase(1)

// Filtros de relatório
getReportFilteredItemsSupabase('Trade', '', 'atrasados')

// Ver histórico
getAssessmentHistorySupabase(1)
`);
