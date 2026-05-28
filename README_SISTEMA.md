# 🍺 Sistema de Gerenciamento de Assessments Heineken

Um sistema web corporativo premium para gerenciamento centralizado de assessments, desenvolvido com **HTML, CSS e JavaScript puros** (Vanilla JS), sem frameworks externos.

## 📋 Visão Geral

O sistema foi desenvolvido para eliminar controles "boca a boca" e centralizar todas as informações de assessments corporativos em um único painel administrativo inteligente. Inspirado visualmente na identidade da marca Heineken, oferece uma interface moderna, elegante e tecnológica.

### Características Principais

- **Dashboard Inteligente** - Visualização em tempo real de estatísticas e alertas
- **Tabela Dinâmica** - Filtros avançados, busca e paginação
- **CRUD Completo** - Criar, ler, atualizar e deletar assessments
- **Gráficos Interativos** - Visualizações usando Canvas puro
- **Importação CSV** - Importar dados em lote de planilhas
- **Sistema de Alertas** - Notificações automáticas por status
- **Relatórios** - Resumos por setor e distribuição de status
- **LocalStorage** - Persistência de dados no navegador
- **Responsividade** - Funciona perfeitamente em desktop, tablet e mobile

## 🎨 Design & Identidade Visual

### Paleta de Cores
- **Verde Heineken**: `#008200` - Cor principal
- **Verde Escuro**: `#004d26` - Acentos e gradientes
- **Preto**: `#111111` - Texto e elementos
- **Branco**: `#ffffff` - Fundo e contraste
- **Vermelho**: `#d6001c` - Alertas e destaque

### Características de Design
- Gradientes elegantes verde-escuro
- Sombras suaves e profundidade
- Animações fluidas e transições
- Cards corporativos com efeitos hover
- Sidebar escura com navegação intuitiva
- Ícones emoji para interface limpa

## 📁 Estrutura de Arquivos

```
heineken-assessments/
├── client/
│   └── public/
│       ├── index.html              # Estrutura HTML
│       ├── styles.css              # Estilos CSS
│       ├── script.js               # Lógica JavaScript
│       └── assessments_data.json   # Dados iniciais
└── README_SISTEMA.md               # Esta documentação
```

## 🚀 Como Usar

### Acessar o Sistema

1. Abra o navegador e acesse: `http://localhost:3000/public/index.html`
2. O sistema carregará automaticamente com 82 assessments de exemplo

### Dashboard

O dashboard exibe:
- **Total de Assessments** - Quantidade total de registros
- **Concluídos** - Assessments finalizados
- **Pendentes** - Assessments em andamento
- **Atrasados** - Assessments vencidos

Gráficos interativos mostram:
- Distribuição por status (Gráfico de Pizza)
- Distribuição por setor (Gráfico de Barras)

### Gerenciamento de Assessments

#### Criar Novo Assessment
1. Clique em **"+ Novo Assessment"**
2. Preencha os campos do formulário
3. Clique em **"Salvar"**

#### Editar Assessment
1. Clique no ícone **✎** (editar) na linha do assessment
2. Modifique os dados
3. Clique em **"Salvar"**

#### Deletar Assessment
1. Clique no ícone **🗑** (deletar) na linha do assessment
2. Confirme a exclusão

### Filtros e Busca

- **Busca por Nome**: Digite o código ou nome do assessment
- **Filtro por Setor**: Selecione um setor específico
- **Filtro por Status**: Filtre por status do assessment
- **Paginação**: Navegue entre páginas de resultados

### Importar Dados

1. Acesse a aba **"Importar CSV"**
2. Clique em **"Selecionar Arquivo"**
3. Escolha um arquivo CSV com a estrutura:
   ```
   Nome,Setor,Responsável,Data Limite,Status
   ADM01,Administrativo,João Silva,2026-05-31,Não iniciado
   ```
4. Visualize a prévia dos dados
5. Clique em **"Importar"**

### Relatórios

A aba **"Relatórios"** exibe:
- **Resumo por Setor** - Total de assessments por setor
- **Distribuição de Status** - Quantidade por status

## 📊 Status dos Assessments

| Status | Cor | Significado |
|--------|-----|-------------|
| Não iniciado | Cinza | Ainda não foi iniciado |
| Em andamento | Azul | Está sendo executado |
| Aguardando evidência | Laranja | Aguardando documentação |
| Concluído | Verde | Finalizado com sucesso |
| Atrasado | Vermelho | Passou do prazo |

## 🎯 Sistema de Alertas de Prazo

O sistema calcula automaticamente os dias restantes e exibe cores:

| Dias Restantes | Cor | Alerta |
|----------------|-----|--------|
| < 0 | 🔴 Vermelho | Atrasado |
| 0-2 | 🟠 Laranja | Crítico |
| 3-7 | 🟡 Amarelo | Próximo do prazo |
| > 7 | 🟢 Verde | Dentro do prazo |

## 💾 Persistência de Dados

Os dados são armazenados automaticamente no **LocalStorage** do navegador. Isso significa:

- ✅ Os dados persistem entre sessões
- ✅ Não é necessário servidor de banco de dados
- ✅ Funciona offline
- ⚠️ Dados são perdidos se o cache do navegador for limpo

### Exportar Dados

Para fazer backup dos dados:
1. Abra o console do navegador (F12)
2. Execute: `exportToCSV()`
3. Um arquivo CSV será baixado

## 🔧 Funcionalidades Técnicas

### JavaScript Puro (Vanilla JS)

- **CRUD Completo** - Criar, ler, atualizar, deletar
- **Modais** - Sem dependências externas
- **Filtros Dinâmicos** - Busca em tempo real
- **Gráficos Canvas** - Visualizações nativas
- **LocalStorage** - Persistência de dados
- **Importação CSV** - Parsing de arquivos
- **Notificações Toast** - Feedback visual
- **Animações** - Transições suaves

### CSS Puro

- **Variáveis CSS** - Temas e cores centralizadas
- **Grid e Flexbox** - Layouts responsivos
- **Animações** - Efeitos suaves
- **Media Queries** - Responsividade
- **Gradientes** - Design premium
- **Sombras** - Profundidade visual

### HTML Semântico

- **Estrutura Limpa** - Código bem organizado
- **Acessibilidade** - Labels e atributos adequados
- **Formulários** - Validação básica
- **Canvas** - Gráficos nativos

## 📱 Responsividade

O sistema é totalmente responsivo:

- **Desktop** (1024px+) - Layout completo com sidebar
- **Tablet** (768px-1023px) - Sidebar colapsável
- **Mobile** (< 768px) - Sidebar em drawer, layout adaptado

## 🔐 Segurança

- Dados armazenados localmente (sem envio para servidor)
- Sem dependências externas que possam ser comprometidas
- Código JavaScript puro e auditável
- Validação básica de entrada

## 📈 Dados Inclusos

O sistema vem pré-carregado com **82 assessments** de 9 setores:

| Setor | Quantidade |
|-------|-----------|
| Administrativo | 8 |
| Trade | 7 |
| RH | 8 |
| Comodato | 3 |
| Armazém | 10 |
| Comercial | 28 |
| Distribuição | 6 |
| Frota | 5 |
| SHE | 7 |

## 🎓 Como Estender o Sistema

### Adicionar Novo Campo

1. Edite `index.html` - Adicione input no formulário
2. Edite `script.js` - Adicione campo ao objeto assessment
3. Edite `styles.css` - Estilize o novo campo

### Adicionar Novo Setor

1. Edite `assessments_data.json` - Adicione assessments
2. Os setores são carregados dinamicamente dos dados

### Customizar Cores

1. Edite `styles.css` - Modifique as variáveis CSS no `:root`
2. Todas as cores são centralizadas para fácil customização

## 🐛 Troubleshooting

### Dados não aparecem
- Verifique se `assessments_data.json` está no mesmo diretório
- Limpe o cache do navegador (Ctrl+Shift+Delete)
- Verifique o console do navegador (F12) para erros

### Gráficos não aparecem
- Verifique se o navegador suporta Canvas
- Tente atualizar a página (F5)
- Verifique o console para mensagens de erro

### Filtros não funcionam
- Verifique se há dados carregados
- Tente limpar o LocalStorage: `localStorage.clear()`
- Recarregue a página

## 📞 Suporte

Para reportar bugs ou sugerir melhorias, verifique:
1. Console do navegador (F12) para mensagens de erro
2. Estrutura dos dados CSV importados
3. Compatibilidade do navegador (Chrome, Firefox, Safari, Edge)

## 📄 Licença

Sistema desenvolvido para uso interno corporativo Heineken.

---

**Desenvolvido com ❤️ em HTML, CSS e JavaScript Puro**

*Última atualização: Maio 2026*
