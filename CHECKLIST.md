# 🎯 CHECKLIST INSTALAÇÃO SUPABASE

## 📋 VERIFICAR ARQUIVOS CRIADOS

```
✅ database.sql              - Script SQL para criar banco
✅ supabaseIntegration.js    - Funções Supabase (PRINCIPAL)
✅ testeSupabase.js          - Testes automáticos
✅ supabaseConfig.js         - Alternativa com npm
✅ import_data.sql           - Importar dados antigos
✅ package.json              - Dependências
✅ README_SUPABASE.md        - Leia PRIMEIRO
✅ SETUP_COMPLETO.md         - Guia passo-a-passo
✅ GUIA_SUPABASE.md          - Detalhes técnicos
✅ SUPABASE_RESUMO.md        - Quick reference
✅ CHECKLIST.md              - Este arquivo
```

---

## ⏱️ TEMPO ESTIMADO: 20 MINUTOS

```
Fase 1 (5 min)  : Criar banco Supabase
Fase 2 (5 min)  : Adicionar CDN no HTML  
Fase 3 (7 min)  : Atualizar script.js
Fase 4 (3 min)  : Testar tudo
─────────────────────────────
TOTAL          : 20 minutos
```

---

## 🚀 PASSO 1: CRIAR BANCO (5 MIN)

### 📍 Localização: https://app.supabase.com

```
☐ Faça login com sua conta
☐ Clique no projeto "gqsdxkaarwyayrqftjfo"
☐ Vá em "SQL Editor" (lado esquerdo)
☐ Clique em "+ New Query"
☐ Abra o arquivo "database.sql"
☐ Copie TODO o conteúdo
☐ Cole na área de query do Supabase
☐ Clique em "Run" (Ctrl+Enter)
☐ Espere a mensagem "Query executed successfully"
☐ Vá em "Tables" e veja 3 tabelas criadas:
   ☐ users (1 registro)
   ☐ assessments (10 registros)
   ☐ assessment_history (vazia)
```

**✅ RESULTADO:** Banco criado e dados pré-carregados

---

## 🔗 PASSO 2: ADICIONAR SUPABASE NO HTML (5 MIN)

### 📍 Arquivo: index.html

```html
<!-- Localize no final do arquivo a seção de scripts -->
<!-- Procure por: </body> -->
<!-- Você deve ver: <script src="script.js"></script> -->

<!-- ADICIONE ESTAS 2 LINHAS ANTES: -->

<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="supabaseIntegration.js"></script>
<script src="script.js"></script>
</body>
```

### ✅ CHECKLIST:
```
☐ Arquivo supabaseIntegration.js está na pasta do projeto
☐ Adicionado as 2 linhas de script ANTES de script.js
☐ Salvar arquivo
☐ Recarregar navegador (F5)
☐ Abrir console (F12) - não deve ter erro sobre supabase
```

**✅ RESULTADO:** Supabase carregado no navegador

---

## 🔧 PASSO 3: ATUALIZAR script.js (7 MIN)

### 📍 Arquivo: script.js

Precisa alterar 7 funções. **Siga EXATAMENTE o arquivo SETUP_COMPLETO.md**

```javascript
☐ handleLogin() - Chamar loginUserSupabase()
☐ loadAssessments() - Chamar getAssessmentsFromSupabase()  
☐ saveAssessments() - Deixar vazia (obsoleta)
☐ handleSaveAssessment() - Usar createAssessmentSupabase()
☐ handleUpdateAssessment() - Usar updateAssessmentSupabase()
☐ handleDeleteAssessment() - Usar deleteAssessmentSupabase()
☐ handleLogout() - Chamar logoutUserSupabase()
```

### ⚠️ IMPORTANTE:
```
☐ NÃO deletar nenhuma linha, apenas SUBSTITUIR
☐ Adicionar "async" nas funções
☐ Adicionar "await" nas chamadas
☐ Manter a mesma lógica de validação
☐ Testar após CADA alteração
```

**✅ RESULTADO:** Script conectado com Supabase

---

## 🧪 PASSO 4: TESTAR TUDO (3 MIN)

### Teste no Navegador

```
☐ Recarregar página (F5)
☐ Verificar console (F12) - não deve ter erros vermelhos
☐ Tentar fazer login com:
   Email: mateusvictorsantos02@gmail.com
   Senha: Mateus-2007
☐ Se login OK → Dashboard deve carregar
☐ Dashboard deve mostrar 10 assessments
```

### Teste no Console (F12)

```javascript
// Copie e execute isto no console:

executarTodosTestes();

// Resultado esperado:
// ✅ 8/8 testes passaram (100%)
// ✅ Integração Supabase funcionando 100%!
```

### Testes Manuais

```
☐ Clique em "Novo Assessment"
☐ Preencha os campos
☐ Clique em "Salvar"
☐ Resultado: Deve salvar com sucesso
☐ Recarregue a página (F5)
☐ O novo assessment deve estar lá
☐ Abra Supabase Dashboard > Tables > assessments
☐ Deve ter um novo registro
```

**✅ RESULTADO:** Sistema 100% funcional

---

## 🎉 PRONTO!

Se todos os ☑️ estão marcados, seu sistema está **ONLINE no Supabase**!

```
┌─────────────────────────────────────────┐
│   ✨ SISTEMA HEINEKEN ASSESSMENTS ✨   │
│                                         │
│   ✅ Login funcionando                 │
│   ✅ Dados sincronizando com Supabase  │
│   ✅ CRUD completo                     │
│   ✅ Acessível de qualquer dispositivo │
│   ✅ Pronto para produção               │
└─────────────────────────────────────────┘
```

---

## 📞 SE TIVER PROBLEMA

### ❌ "supabase is not defined"
```
☐ Verifique se supabaseIntegration.js está na pasta
☐ Verifique se as 2 linhas de script foram adicionadas
☐ Verifique a ordem: CDN ANTES de supabaseIntegration.js ANTES de script.js
☐ Recarregue com Ctrl+Shift+R (cache limpo)
```

### ❌ "Erro ao fazer login"
```
☐ Verifique email: mateusvictorsantos02@gmail.com
☐ Verifique senha: Mateus-2007
☐ Abra console (F12) e veja a mensagem exata de erro
☐ Verifique se database.sql foi executado com sucesso
```

### ❌ "Nenhum dado aparece"
```
☐ Faça login novamente
☐ Abra console e execute:
   const userId = localStorage.getItem('userId');
   console.log('User ID:', userId);
☐ Se userid for "null", o login falhou
☐ Se tiver um UUID, é problema de permissões no Supabase
```

### ❌ "Erro ao salvar novo assessment"
```
☐ Verifique se userId está no localStorage
☐ Abra console (F12) e procure pela mensagem de erro completa
☐ Verifique no Supabase se as políticas RLS foram criadas
☐ Tente em modo anônimo (sem login)
```

---

## 📖 DOCUMENTAÇÃO

### Primeira Leitura:
1. **README_SUPABASE.md** - Visão geral
2. **SETUP_COMPLETO.md** - Passo-a-passo

### Consultar Quando Precisar:
- **GUIA_SUPABASE.md** - Detalhes técnicos
- **SUPABASE_RESUMO.md** - Quick reference
- **testeSupabase.js** - Testes automáticos

---

## 🎁 BÔNUS: COMANDOS ÚTEIS

```javascript
// Copie e execute no console (F12):

// Ver todas as funções disponíveis
window.loginUserSupabase
window.getAssessmentsFromSupabase
window.createAssessmentSupabase
// ... etc

// Testar login
loginUserSupabase('mateusvictorsantos02@gmail.com', 'Mateus-2007')

// Ver assessments do usuário
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

// Ver histórico de ações
getAssessmentHistorySupabase(1)

// Sincronizar dados offline
syncDataWithSupabase()
```

---

## 🚀 PRÓXIMOS PASSOS

Depois que estiver tudo funcionando:

```
☐ Testar em mobile (celular)
☐ Testar em outro navegador
☐ Criar múltiplos usuários
☐ Testar relatórios e filtros
☐ Testar exportação Excel/PDF
☐ Fazer backup dos dados
☐ Documentar endpoints de API
☐ Deploy para produção
```

---

## ✅ ASSINATURA DE CONCLUSÃO

Quando completar tudo:

```
Data: __/__/__
Nome: _______________
Status: ✅ SUPABASE INSTALADO COM SUCESSO!
```

---

**Dúvidas? Abra o console (F12) e execute:**
```javascript
executarTodosTestes();
```

**Sucesso! 🎉**

