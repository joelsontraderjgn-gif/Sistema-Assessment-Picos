# Guia de Integração com Supabase 🚀

## 1️⃣ SETUP DO SUPABASE

### Credenciais Fornecidas:
- **URL**: https://gqsdxkaarwyayrqftjfo.supabase.co
- **Publishable Key**: sb_publishable_DKnA4UiciAU_7y2xs-iwQg_mvE6hh9_
- **Host DB**: db.gqsdxkaarwyayrqftjfo.supabase.co
- **Port**: 5432
- **Database**: postgres
- **User**: postgres
- **Password**: Mateusvictor-2007

### Conexão via PostgreSQL:
```
postgresql://postgres:Mateusvictor-2007@db.gqsdxkaarwyayrqftjfo.supabase.co:5432/postgres
```

---

## 2️⃣ CRIAR TABELAS NO SUPABASE

### Passo 1: Acessar o Supabase
1. Acesse https://app.supabase.com
2. Faça login ou crie conta
3. Clique no seu projeto
4. Vá para **SQL Editor** (lado esquerdo)

### Passo 2: Executar SQL
1. Clique em **+ New Query**
2. Cole todo o conteúdo do arquivo `database.sql`
3. Clique em **Run** (Ctrl+Enter)

Isso criará:
- ✅ Tabela `users` (login)
- ✅ Tabela `assessments` (dados principais)
- ✅ Tabela `assessment_history` (auditoria)
- ✅ Índices para performance
- ✅ Políticas de segurança (RLS)
- ✅ Usuário padrão: `mateusvictorsantos02@gmail.com / Mateus-2007`

---

## 3️⃣ ATUALIZAR O HTML (index.html)

Adicione a biblioteca do Supabase **antes** do script.js:

```html
<!-- Adicione ANTES de <script src="script.js"></script> -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="supabaseIntegration.js"></script>
```

Ficará assim:
```html
<body>
    ...seu HTML...

    <!-- Scripts -->
    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
    <script src="supabaseIntegration.js"></script>
    <script src="script.js"></script>
</body>
</html>
```

---

## 4️⃣ MODIFICAR O script.js

### Substituir funções de LOGIN:

**ANTES (localStorage apenas):**
```javascript
function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    if (email === 'mateusvictorsantos02@gmail.com' && password === 'Mateus-2007') {
        loggedInUser = email;
        localStorage.setItem('loggedInUser', email);
        hideLoginScreen();
    }
}
```

**DEPOIS (com Supabase):**
```javascript
async function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    const result = await loginUserSupabase(email, password);
    if (result.success) {
        loggedInUser = email;
        hideLoginScreen();
        // Recarregar assessments do Supabase
        assessments = await getAssessmentsFromSupabase();
        renderDashboard();
    } else {
        alert('Erro: ' + result.error);
    }
}
```

---

## 5️⃣ MODIFICAR FUNÇÕES DE ASSESSMENTS

### Substituir `loadAssessments()`:

**ANTES:**
```javascript
function loadAssessments() {
    let assessmentsCopy = [];
    let stored = localStorage.getItem('assessments_data');
    
    if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
            assessmentsCopy = parsed;
        }
    }
    
    if (assessmentsCopy.length === 0) {
        fetch('assessments_data.json')
            .then(res => res.json())
            .then(data => {
                assessmentsCopy = Array.isArray(data) ? data : [];
                assessments = normalizeAssessments(assessmentsCopy);
                renderDashboard();
            });
    } else {
        assessments = normalizeAssessments(assessmentsCopy);
    }
}
```

**DEPOIS:**
```javascript
async function loadAssessments() {
    try {
        assessments = await getAssessmentsFromSupabase();
        renderDashboard();
    } catch (error) {
        console.error('Erro ao carregar assessments:', error);
        // Fallback para arquivo local se offline
        fetch('assessments_data.json')
            .then(res => res.json())
            .then(data => {
                assessments = normalizeAssessments(data);
                renderDashboard();
            });
    }
}
```

---

## 6️⃣ SUBSTITUIR OPERAÇÕES CRUD

### CREATE - Ao salvar novo assessment:
```javascript
// ANTES
saveAssessments();

// DEPOIS
const result = await createAssessmentSupabase(newAssessment);
if (result.success) {
    assessments = await getAssessmentsFromSupabase();
    renderAssessments();
    alert('Assessment criado com sucesso!');
}
```

### UPDATE - Ao editar:
```javascript
// ANTES
assessments[editingIndex] = updatedData;
saveAssessments();

// DEPOIS
const result = await updateAssessmentSupabase(updatedData.id, updatedData);
if (result.success) {
    assessments = await getAssessmentsFromSupabase();
    renderAssessments();
    alert('Assessment atualizado!');
}
```

### DELETE - Ao remover:
```javascript
// ANTES
assessments.splice(index, 1);
saveAssessments();

// DEPOIS
const result = await deleteAssessmentSupabase(id);
if (result.success) {
    assessments = await getAssessmentsFromSupabase();
    renderAssessments();
    alert('Assessment removido!');
}
```

---

## 7️⃣ SUBSTITUIR FUNÇÕES DE RELATÓRIO

### Filtros no relatório:
```javascript
// ANTES
function getReportFilteredItems(setor, status, reportType) {
    return assessments.filter(item => {
        // lógica com assessments local
    });
}

// DEPOIS
async function getReportFilteredItems(setor, status, reportType) {
    return await getReportFilteredItemsSupabase(setor, status, reportType);
}
```

### Métricas do dashboard:
```javascript
// ANTES
const completed = assessments.filter(a => a.status === 'Concluído').length;
const overdue = assessments.filter(a => a.status === 'Atrasado').length;

// DEPOIS
const completed = (await getCompletedAssessmentsSupabase()).length;
const overdue = (await getOverdueAssessmentsSupabase()).length;
```

---

## 8️⃣ LOGOUT

```javascript
function handleLogout() {
    logoutUserSupabase();
    document.getElementById('loginScreen').classList.add('active');
    document.querySelector('.app-container').classList.add('hidden');
    assessments = [];
}
```

---

## 9️⃣ VERIFICAR LOGIN NA PÁGINA INICIAL

Modifique `checkLoginState()`:

```javascript
function checkLoginState() {
    const loggedUser = localStorage.getItem('loggedInUser');
    const userId = localStorage.getItem('userId');
    
    if (loggedUser && userId) {
        loggedInUser = loggedUser;
        hideLoginScreen();
        loadAssessments();
    }
}
```

---

## 🔟 SINCRONIZAÇÃO OFFLINE (Opcional)

Para suportar modo offline:

```javascript
// Quando criar/editar/deletar OFFLINE
if (!navigator.onLine) {
    const pending = JSON.parse(localStorage.getItem('pendingSync') || '[]');
    pending.push({ type: 'create', data: assessment });
    localStorage.setItem('pendingSync', JSON.stringify(pending));
}

// Quando voltar online
window.addEventListener('online', async () => {
    await syncDataWithSupabase();
    assessments = await getAssessmentsFromSupabase();
    renderDashboard();
});
```

---

## 📊 REAL-TIME UPDATES (Opcional)

Adicionar live updates quando alguém muda os dados:

```javascript
// Na função loadAssessments()
const subscription = subscribeToAssessmentsSupabase((payload) => {
    console.log('Dados atualizados em tempo real:', payload);
    loadAssessments(); // Recarregar
});
```

---

## ✅ CHECKLIST FINAL

- [ ] Arquivo `database.sql` executado no Supabase SQL Editor
- [ ] `supabaseIntegration.js` adicionado ao projeto
- [ ] CDN do Supabase adicionado no `index.html`
- [ ] Funções de login atualizadas
- [ ] Funções de CRUD atualizadas
- [ ] Testes realizados:
  - [ ] Login funciona
  - [ ] Criar novo assessment salva no Supabase
  - [ ] Editar atualiza no Supabase
  - [ ] Deletar remove do Supabase
  - [ ] Relatórios filtram do Supabase
  - [ ] Dados persistem ao recarregar página
  - [ ] Funciona em outro navegador/dispositivo

---

## 🆘 TROUBLESHOOTING

### "Erro: supabase is not defined"
- Verifique se a CDN foi adicionada **antes** de `supabaseIntegration.js`

### "Unauthorized" ao salvar
- Verif se `user_id` está sendo salvo corretamente no localStorage

### Dados não aparecem
- Abra **DevTools > Console** e procure por erros
- Verifique se as tabelas foram criadas (vá em Supabase Dashboard > Tables)

### Senha incorreta no login
- Default: `mateusvictorsantos02@gmail.com / Mateus-2007`
- Pode ser alterada diretamente no Supabase (Table `users`)

---

## 📞 PRÓXIMAS MELHORIAS

- [ ] Hash de senhas com bcrypt
- [ ] Autenticação via email verification
- [ ] Backup automático
- [ ] Permissões por usuário (admin, gerente, visualizador)
- [ ] Exportação com dados remotos
- [ ] Notificações em tempo real

