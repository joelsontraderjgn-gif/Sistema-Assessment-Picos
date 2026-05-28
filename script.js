/* ============================================
   SISTEMA DE GERENCIAMENTO DE ASSESSMENTS
   JavaScript Puro - Lógica Completa
   ============================================ */

// ============================================
// DADOS E ESTADO
// ============================================
let assessments = [];
let currentPage = 1;
const itemsPerPage = 10;
let filteredAssessments = [];
let editingId = null;
let loggedInUser = null;
let isAppInitialized = false;

const validLogin = {
    email: 'mateusvictorsantos02@gmail.com',
    password: 'Mateus-2007'
};

function checkLoginState() {
    const storedUser = localStorage.getItem('loggedInUser');
    if (storedUser === validLogin.email) {
        loggedInUser = storedUser;
        hideLoginScreen();
        displayLoggedUser();
        loadAssessments();
    } else {
        localStorage.removeItem('loggedInUser');
        showLoginScreen();
    }
}

function showLoginScreen() {
    document.getElementById('loginScreen')?.classList.add('active');
    document.querySelector('.app-container')?.classList.add('hidden');
}

function hideLoginScreen() {
    document.getElementById('loginScreen')?.classList.remove('active');
    document.querySelector('.app-container')?.classList.remove('hidden');
}

function displayLoggedUser() {
    // Email removido conforme solicitado
}

function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('loginEmail')?.value.trim();
    const password = document.getElementById('loginPassword')?.value.trim();

    if (!email) {
        showToast('Informe seu email antes de entrar.', 'warning');
        return;
    }
    if (!password) {
        showToast('Informe a senha antes de entrar.', 'warning');
        return;
    }

    if (email.toLowerCase() !== validLogin.email || password !== validLogin.password) {
        showToast('Email ou senha incorretos. Use suas credenciais válidas.', 'error');
        return;
    }

    loggedInUser = email;
    localStorage.setItem('loggedInUser', email);
    hideLoginScreen();
    displayLoggedUser();
    loadAssessments();
}

function logoutUser() {
    localStorage.removeItem('loggedInUser');
    loggedInUser = null;
    showLoginScreen();
}

// Carregar dados do localStorage ou usar dados padrão
function loadAssessments() {
    const stored = localStorage.getItem('assessments');
    if (stored) {
        try {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length > 0) {
                assessments = parsed;
                normalizeAssessments();
                saveAssessments();
                initializeApp();
                return;
            }
        } catch (error) {
            console.warn('LocalStorage com dados inválidos, carregando defaults.', error);
        }
    }

    // Carregar dados da planilha extraída se não houver dados válidos no localStorage
    fetch('./assessments_data.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP ${response.status} - ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            assessments = Array.isArray(data) ? data : [];
            normalizeAssessments();
            saveAssessments();
            initializeApp();
        })
        .catch(error => {
            console.error('Erro ao carregar dados:', error);
            showToast(`Erro ao carregar dados dos assessments: ${error.message}`, 'error');
            assessments = [];
            initializeApp();
        });
}

function normalizeAssessments() {
    assessments.forEach(a => {
        a.dias_restantes = calculateDaysRemaining(a.data_limite);
        if (a.dias_restantes < 0 && a.status !== 'Concluído') {
            a.status = 'Atrasado';
        }
    });
}

function saveAssessments() {
    localStorage.setItem('assessments', JSON.stringify(assessments));
}

// ============================================
// INICIALIZAÇÃO
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    checkLoginState();
});

function initializeApp() {
    updateDashboard();
    populateSectorFilters();
    renderAssessmentsTable();
    setupCharts();
}

function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const page = item.dataset.page;
            navigateTo(page);
        });
    });

    // Menu toggle
    const menuToggle = document.getElementById('menuToggle');
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            document.querySelector('.sidebar').classList.toggle('active');
        });
    }

    // Modal
    const modal = document.getElementById('assessmentModal');
    const newBtn = document.getElementById('newAssessmentBtn');
    const closeBtn = document.getElementById('closeModal');
    const cancelBtn = document.getElementById('cancelBtn');
    const form = document.getElementById('assessmentForm');

    if (newBtn) {
        newBtn.addEventListener('click', () => {
            editingId = null;
            document.getElementById('modalTitle').textContent = 'Novo Assessment';
            form.reset();
            modal.classList.add('active');
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.classList.remove('active');
        });
    }

    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            modal.classList.remove('active');
        });
    }

    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }

    // Filters
    const searchInput = document.getElementById('searchInput');
    const sectorFilter = document.getElementById('sectorFilter');
    const statusFilter = document.getElementById('statusFilter');

    if (searchInput) {
        searchInput.addEventListener('input', applyFilters);
    }
    if (sectorFilter) {
        sectorFilter.addEventListener('change', applyFilters);
    }
    if (statusFilter) {
        statusFilter.addEventListener('change', applyFilters);
    }

    // Login
    const loginForm = document.getElementById('loginForm');
    const logoutBtn = document.getElementById('logoutBtn');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logoutUser);
    }

    // Import
    const uploadBtn = document.getElementById('uploadBtn');
    const csvFile = document.getElementById('csvFile');
    const downloadPdfBtn = document.getElementById('downloadPdfBtn');
    const downloadExcelBtn = document.getElementById('downloadExcelBtn');

    if (uploadBtn) {
        uploadBtn.addEventListener('click', () => {
            csvFile.click();
        });
    }

    if (csvFile) {
        csvFile.addEventListener('change', handleCSVUpload);
    }

    if (downloadPdfBtn) {
        downloadPdfBtn.addEventListener('click', () => exportToPDF(getReportFilteredItems()));
    }

    if (downloadExcelBtn) {
        downloadExcelBtn.addEventListener('click', () => exportToExcel(getReportFilteredItems()));
    }

    const reportSectorFilter = document.getElementById('reportSectorFilter');
    const reportStatusFilter = document.getElementById('reportStatusFilter');
    const reportTypeFilter = document.getElementById('reportTypeFilter');

    if (reportSectorFilter) {
        reportSectorFilter.addEventListener('change', () => {
            renderReportTable();
            updateReportMetrics();
        });
    }
    if (reportStatusFilter) {
        reportStatusFilter.addEventListener('change', () => {
            renderReportTable();
            updateReportMetrics();
        });
    }
    if (reportTypeFilter) {
        reportTypeFilter.addEventListener('change', () => {
            renderReportTable();
            updateReportMetrics();
        });
    }

    // Modal close on outside click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });
}

// ============================================
// NAVEGAÇÃO
// ============================================
function navigateTo(page) {
    // Atualizar nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.page === page) {
            item.classList.add('active');
        }
    });

    // Atualizar páginas
    document.querySelectorAll('.page').forEach(p => {
        p.classList.remove('active');
    });

    const pageElement = document.getElementById(`${page}-page`);
    if (pageElement) {
        pageElement.classList.add('active');
    }

    // Atualizar título
    const titles = {
        dashboard: 'Dashboard',
        assessments: 'Gerenciamento de Assessments',
        import: 'Importar Assessments',
        relatorios: 'Relatórios'
    };

    document.querySelector('.page-title').textContent = titles[page] || 'Dashboard';

    // Fechar sidebar em mobile
    document.querySelector('.sidebar').classList.remove('active');

    // Renderizar conteúdo específico
    if (page === 'assessments') {
        renderAssessmentsTable();
    } else if (page === 'relatorios') {
        renderReports();
    }
}

// ============================================
// DASHBOARD
// ============================================
function updateDashboard() {
    normalizeAssessments();
    saveAssessments();

    const total = assessments.length;
    const completed = assessments.filter(a => a.status === 'Concluído').length;
    const pending = assessments.filter(a => a.status !== 'Concluído' && a.status !== 'Atrasado').length;
    const overdue = assessments.filter(a => a.status === 'Atrasado').length;

    document.getElementById('totalAssessments').textContent = total;
    document.getElementById('completedAssessments').textContent = completed;
    document.getElementById('pendingAssessments').textContent = pending;
    document.getElementById('overdueAssessments').textContent = overdue;

    // Atualizar lista de recentes
    updateRecentList();
}

function updateRecentList() {
    const recentList = document.getElementById('recentList');
    if (!recentList) return;

    const upcoming = assessments
        .filter(a => a.dias_restantes >= 0 && a.dias_restantes <= 7)
        .sort((a, b) => a.dias_restantes - b.dias_restantes)
        .slice(0, 5);

    recentList.innerHTML = upcoming.map(item => `
        <div class="recent-item">
            <div class="recent-item-info">
                <div class="recent-item-name">${item.nome}</div>
                <div class="recent-item-sector">${item.setor}</div>
            </div>
            <div class="recent-item-deadline">${item.dias_restantes} dias</div>
        </div>
    `).join('');

    if (upcoming.length === 0) {
        recentList.innerHTML = '<div style="text-align: center; color: #999; padding: 20px;">Nenhum assessment próximo do vencimento</div>';
    }
}

// ============================================
// TABELA DE ASSESSMENTS
// ============================================
function renderAssessmentsTable() {
    applyFilters();
}

function applyFilters() {
    const search = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const sector = document.getElementById('sectorFilter')?.value || '';
    const status = document.getElementById('statusFilter')?.value || '';

    filteredAssessments = assessments.filter(a => {
        const matchSearch = !search || 
            a.nome.toLowerCase().includes(search) || 
            a.setor.toLowerCase().includes(search) ||
            a.responsavel.toLowerCase().includes(search);
        
        const matchSector = !sector || a.setor === sector;
        const matchStatus = !status || a.status === status;

        return matchSearch && matchSector && matchStatus;
    });

    currentPage = 1;
    renderTable();
    renderPagination();
}

function renderTable() {
    const tbody = document.getElementById('assessmentsTableBody');
    if (!tbody) return;

    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pageItems = filteredAssessments.slice(start, end);

    tbody.innerHTML = pageItems.map(item => `
        <tr>
            <td data-label="Nome"><strong>${item.nome}</strong></td>
            <td data-label="Setor">${item.setor}</td>
            <td data-label="Responsável">${item.responsavel || '-'}</td>
            <td data-label="Prazo">${formatDate(item.data_limite)}</td>
            <td data-label="Dias Restantes">
                <span style="color: ${getColorByDays(item.dias_restantes)}; font-weight: 600;">
                    ${item.dias_restantes} dias
                </span>
            </td>
            <td data-label="Status">
                <span class="status-badge ${getStatusClass(item.status)}">
                    ${item.status}
                </span>
            </td>
            <td data-label="Evidência">
                <span class="evidence-status ${item.evidencia ? 'enviada' : 'pendente'}">
                    ${item.evidencia ? '✓ Enviada' : '✗ Pendente'}
                </span>
            </td>
            <td data-label="Ações" class="action-buttons">
                ${item.status === 'Não iniciado' ? `<button class="btn btn-sm btn-primary" onclick="updateAssessmentStatus(${item.id}, 'Em andamento')" title="Iniciar">▶</button>` : ''}
                ${item.status !== 'Concluído' && item.status !== 'Atrasado' ? `<button class="btn btn-sm btn-secondary" onclick="updateAssessmentStatus(${item.id}, 'Concluído')" title="Concluir">✅</button>` : ''}
                <button class="btn btn-sm btn-icon-only" onclick="editAssessment(${item.id})" title="Editar">✎</button>
                <button class="btn btn-sm btn-icon-only btn-danger" onclick="deleteAssessment(${item.id})" title="Deletar">🗑</button>
            </td>
        </tr>
    `).join('');

    if (pageItems.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 20px; color: #999;">Nenhum assessment encontrado</td></tr>';
    }
}

function renderPagination() {
    const pagination = document.getElementById('pagination');
    if (!pagination) return;

    const totalPages = Math.ceil(filteredAssessments.length / itemsPerPage);
    let html = '';

    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }

    for (let i = 1; i <= totalPages; i++) {
        html += `
            <button class="${i === currentPage ? 'active' : ''}" onclick="goToPage(${i})">
                ${i}
            </button>
        `;
    }

    pagination.innerHTML = html;
}

function goToPage(page) {
    currentPage = page;
    renderTable();
    renderPagination();
    document.querySelector('.table-container').scrollIntoView({ behavior: 'smooth' });
}

// ============================================
// CRUD OPERATIONS
// ============================================
function handleFormSubmit(e) {
    e.preventDefault();

    const formData = {
        nome: document.getElementById('assessmentName').value,
        setor: document.getElementById('assessmentSector').value,
        responsavel: document.getElementById('assessmentResponsavel').value,
        data_inicio: document.getElementById('assessmentStartDate').value,
        data_limite: document.getElementById('assessmentDeadline').value,
        status: document.getElementById('assessmentStatus').value,
        observacoes: document.getElementById('assessmentObservacoes').value,
        evidencia: document.getElementById('assessmentEvidence').value,
        prioridade: document.getElementById('assessmentPriority').value
    };

    if (editingId) {
        // Atualizar
        const index = assessments.findIndex(a => a.id === editingId);
        if (index !== -1) {
            assessments[index] = { ...assessments[index], ...formData };
            showToast('Assessment atualizado com sucesso', 'success');
        }
    } else {
        // Criar novo
        const newId = Math.max(...assessments.map(a => a.id), 0) + 1;
        const newAssessment = {
            id: newId,
            ...formData,
            dias_restantes: calculateDaysRemaining(formData.data_limite)
        };
        assessments.push(newAssessment);
        showToast('Assessment criado com sucesso', 'success');
    }

    saveAssessments();
    updateDashboard();
    renderAssessmentsTable();
    document.getElementById('assessmentModal').classList.remove('active');
}

function editAssessment(id) {
    const assessment = assessments.find(a => a.id === id);
    if (!assessment) return;

    editingId = id;
    document.getElementById('modalTitle').textContent = 'Editar Assessment';
    document.getElementById('assessmentName').value = assessment.nome;
    document.getElementById('assessmentSector').value = assessment.setor;
    document.getElementById('assessmentResponsavel').value = assessment.responsavel;
    document.getElementById('assessmentStartDate').value = assessment.data_inicio;
    document.getElementById('assessmentDeadline').value = assessment.data_limite;
    document.getElementById('assessmentStatus').value = assessment.status;
    document.getElementById('assessmentObservacoes').value = assessment.observacoes;
    document.getElementById('assessmentEvidence').value = assessment.evidencia;
    document.getElementById('assessmentPriority').value = assessment.prioridade;

    document.getElementById('assessmentModal').classList.add('active');
}

function deleteAssessment(id) {
    if (confirm('Tem certeza que deseja deletar este assessment?')) {
        assessments = assessments.filter(a => a.id !== id);
        saveAssessments();
        updateDashboard();
        renderAssessmentsTable();
        showToast('Assessment deletado com sucesso', 'success');
    }
}

function updateAssessmentStatus(id, status) {
    const assessment = assessments.find(a => a.id === id);
    if (!assessment) return;

    assessment.status = status;
    assessment.dias_restantes = calculateDaysRemaining(assessment.data_limite);
    if (status === 'Concluído') {
        assessment.evidencia = assessment.evidencia || 'Concluído diretamente';
    }

    saveAssessments();
    updateDashboard();
    renderAssessmentsTable();
    showToast(`Assessment marcado como ${status}`, 'success');
}

// ============================================
// IMPORTAÇÃO CSV
// ============================================
function handleCSVUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const csv = event.target.result;
            const lines = csv.split('\n');
            const headers = lines[0].split(',').map(h => h.trim());
            const preview = [];

            for (let i = 1; i < Math.min(lines.length, 6); i++) {
                const values = lines[i].split(',').map(v => v.trim());
                if (values[0]) {
                    preview.push({
                        nome: values[0],
                        setor: values[1] || '',
                        responsavel: values[2] || '',
                        data_limite: values[3] || '',
                        status: values[4] || 'Não iniciado'
                    });
                }
            }

            showImportPreview(preview, csv);
        } catch (error) {
            showToast('Erro ao processar arquivo CSV', 'error');
        }
    };
    reader.readAsText(file);
}

function showImportPreview(preview, csv) {
    const previewDiv = document.getElementById('importPreview');
    if (!previewDiv) return;

    previewDiv.innerHTML = `
        <div style="background-color: white; border-radius: 8px; padding: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
            <h3 style="margin-bottom: 15px; color: #111;">Prévia dos Dados</h3>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                <thead>
                    <tr style="background-color: #004d26; color: white;">
                        <th style="padding: 10px; text-align: left;">Nome</th>
                        <th style="padding: 10px; text-align: left;">Setor</th>
                        <th style="padding: 10px; text-align: left;">Responsável</th>
                        <th style="padding: 10px; text-align: left;">Prazo</th>
                    </tr>
                </thead>
                <tbody>
                    ${preview.map(item => `
                        <tr style="border-bottom: 1px solid #eee;">
                            <td style="padding: 10px;">${item.nome}</td>
                            <td style="padding: 10px;">${item.setor}</td>
                            <td style="padding: 10px;">${item.responsavel}</td>
                            <td style="padding: 10px;">${item.data_limite}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            <button class="btn btn-primary" onclick="confirmImport('${btoa(csv)}')">
                Importar ${preview.length} Assessments
            </button>
        </div>
    `;
}

function confirmImport(csvBase64) {
    const csv = atob(csvBase64);
    const lines = csv.split('\n');
    let imported = 0;

    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        if (values[0]) {
            const newId = Math.max(...assessments.map(a => a.id), 0) + 1;
            assessments.push({
                id: newId,
                nome: values[0],
                setor: values[1] || '',
                responsavel: values[2] || '',
                data_inicio: '',
                data_limite: values[3] || '',
                status: values[4] || 'Não iniciado',
                observacoes: '',
                evidencia: '',
                prioridade: 'Normal',
                dias_restantes: calculateDaysRemaining(values[3])
            });
            imported++;
        }
    }

    saveAssessments();
    updateDashboard();
    renderAssessmentsTable();
    document.getElementById('importPreview').innerHTML = '';
    document.getElementById('csvFile').value = '';
    showToast(`${imported} assessments importados com sucesso`, 'success');
}

// ============================================
// RELATÓRIOS
// ============================================
function renderReports() {
    normalizeAssessments();
    renderSectorSummary();
    renderStatusSummary();
    renderAssigneeSummary();
    populateReportFilters();
    renderReportTable();
    updateReportMetrics();
}

function renderAssigneeSummary() {
    const summary = document.getElementById('assigneeSummary');
    if (!summary) return;

    const assignees = {
        'Comercial': 'Enzo Analista',
        'Frota': 'José Anayron',
        'Armazém': 'José Anayron',
        'Distribuição': 'José Analayron',
        'Rh': 'Nathália Cury',
        'SHE': 'Nathália Cury',
        'Assessment Comodato': 'Sem Responsável',
        'Trade': 'Sem Responsável',
        'ADM': 'Sem Responsável'
    };

    summary.innerHTML = Object.entries(assignees).map(([sector, owner]) => `
        <div class="report-item">
            <div class="report-item-label">${sector}</div>
            <div class="report-item-value">${owner}</div>
        </div>
    `).join('');
}

function populateReportFilters() {
    const reportSectorFilter = document.getElementById('reportSectorFilter');
    if (!reportSectorFilter) return;

    const sectors = [...new Set(assessments.map(a => a.setor))].sort();
    reportSectorFilter.innerHTML = '<option value="">Todos os Setores</option>';
    sectors.forEach(sector => {
        const option = document.createElement('option');
        option.value = sector;
        option.textContent = sector;
        reportSectorFilter.appendChild(option);
    });
}

function getReportFilteredItems() {
    const sector = document.getElementById('reportSectorFilter')?.value || '';
    const status = document.getElementById('reportStatusFilter')?.value || '';
    const type = document.getElementById('reportTypeFilter')?.value || 'all';

    return assessments.filter(a => {
        const matchSector = !sector || a.setor === sector;
        const matchStatus = !status || a.status === status;
        const isOverdue = a.dias_restantes < 0;
        const isDueSoon = a.dias_restantes >= 0 && a.dias_restantes <= 7;
        const matchType = type === 'all' || (type === 'overdue' && isOverdue) || (type === 'dueSoon' && isDueSoon);
        return matchSector && matchStatus && matchType;
    });
}

function renderReportTable() {
    const tbody = document.getElementById('reportTableBody');
    if (!tbody) return;

    const items = getReportFilteredItems();
    tbody.innerHTML = items.map(item => `
        <tr>
            <td data-label="Nome"><strong>${item.nome}</strong></td>
            <td data-label="Setor">${item.setor}</td>
            <td data-label="Responsável">${item.responsavel || '-'}</td>
            <td data-label="Prazo">${formatDate(item.data_limite)}</td>
            <td data-label="Dias Restantes"><span style="color: ${getColorByDays(item.dias_restantes)}; font-weight: 600;">${item.dias_restantes} dias</span></td>
            <td data-label="Status"><span class="status-badge ${getStatusClass(item.status)}">${item.status}</span></td>
            <td data-label="Motivo">${getReportReason(item)}</td>
        </tr>
    `).join('');
    if (items.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px; color: #999;">Nenhum item corresponde aos filtros selecionados.</td></tr>';
    }
}

function updateReportMetrics() {
    const overdueCount = assessments.filter(a => a.dias_restantes < 0).length;
    const dueSoonCount = assessments.filter(a => a.dias_restantes >= 0 && a.dias_restantes <= 7).length;
    const visibleCount = getReportFilteredItems().length;

    document.getElementById('reportOverdueCount').textContent = overdueCount;
    document.getElementById('reportDueSoonCount').textContent = dueSoonCount;
    document.getElementById('reportVisibleCount').textContent = visibleCount;
}

function getReportReason(item) {
    if (item.status === 'Atrasado') {
        return item.observacoes ? item.observacoes : 'Atraso por não atendimento do prazo';
    }
    if (item.dias_restantes <= 7) {
        return item.observacoes ? item.observacoes : 'Prazo próximo, atenção necessária';
    }
    return item.observacoes || '-';
}

function renderSectorSummary() {
    const summary = document.getElementById('sectorSummary');
    if (!summary) return;

    const sectors = {};
    assessments.forEach(a => {
        if (!sectors[a.setor]) {
            sectors[a.setor] = { total: 0, completed: 0, pending: 0, overdue: 0 };
        }
        sectors[a.setor].total++;
        if (a.status === 'Concluído') sectors[a.setor].completed++;
        else if (a.status === 'Atrasado') sectors[a.setor].overdue++;
        else sectors[a.setor].pending++;
    });

    summary.innerHTML = Object.entries(sectors).map(([sector, data]) => `
        <div class="report-item">
            <div>
                <div class="report-item-label">${sector}</div>
                <div style="font-size: 12px; color: #666; margin-top: 4px;">
                    ${data.completed}/${data.total} concluídos
                </div>
            </div>
            <div class="report-item-value">${data.total}</div>
        </div>
    `).join('');
}

function renderStatusSummary() {
    const summary = document.getElementById('statusSummary');
    if (!summary) return;

    const statuses = {};
    assessments.forEach(a => {
        statuses[a.status] = (statuses[a.status] || 0) + 1;
    });

    summary.innerHTML = Object.entries(statuses).map(([status, count]) => `
        <div class="report-item">
            <div class="report-item-label">${status}</div>
            <div class="report-item-value">${count}</div>
        </div>
    `).join('');
}

// ============================================
// GRÁFICOS
// ============================================
function setupCharts() {
    drawStatusChart();
    drawSectorChart();
}

window.addEventListener('resize', debounce(() => {
    setupCharts();
}, 250));

function drawStatusChart() {
    const canvas = document.getElementById('statusChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const statuses = {};
    
    assessments.forEach(a => {
        statuses[a.status] = (statuses[a.status] || 0) + 1;
    });

    const labels = Object.keys(statuses);
    const data = Object.values(statuses);
    const colors = [
        '#9e9e9e',
        '#2196f3',
        '#ff9800',
        '#4caf50',
        '#f44336'
    ];

    drawPieChart(ctx, labels, data, colors);
}

function drawSectorChart() {
    const canvas = document.getElementById('sectorChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const sectors = {};
    
    assessments.forEach(a => {
        sectors[a.setor] = (sectors[a.setor] || 0) + 1;
    });

    const labels = Object.keys(sectors);
    const data = Object.values(sectors);
    const colors = [
        '#008200',
        '#00a300',
        '#004d26',
        '#2196f3',
        '#ff9800',
        '#f44336',
        '#4caf50',
        '#9c27b0',
        '#00bcd4'
    ];

    drawBarChart(ctx, labels, data, colors);
}

function drawPieChart(ctx, labels, data, colors) {
    resizeCanvas(ctx.canvas);
    const width = ctx.canvas.width / ctx.canvas.ratio;
    const height = ctx.canvas.height / ctx.canvas.ratio;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 30;

    const total = data.reduce((a, b) => a + b, 0);
    if (!total) {
        ctx.fillStyle = '#f5f5f5';
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = '#333';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Sem dados para exibir', centerX, centerY);
        return;
    }

    let currentAngle = -Math.PI / 2;
    data.forEach((value, i) => {
        const sliceAngle = (value / total) * 2 * Math.PI;
        ctx.fillStyle = colors[i % colors.length];
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
        ctx.closePath();
        ctx.fill();

        const labelAngle = currentAngle + sliceAngle / 2;
        const labelX = centerX + Math.cos(labelAngle) * (radius * 0.65);
        const labelY = centerY + Math.sin(labelAngle) * (radius * 0.65);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        if (value > 0) {
            ctx.fillText(value, labelX, labelY);
        }

        currentAngle += sliceAngle;
    });

    ctx.textAlign = 'left';
    ctx.font = '12px Arial';
    labels.forEach((label, i) => {
        const legendX = width - 150;
        const legendY = 30 + i * 20;
        ctx.fillStyle = colors[i % colors.length];
        ctx.fillRect(legendX, legendY - 10, 12, 12);
        ctx.fillStyle = '#333';
        ctx.fillText(`${label} (${data[i]})`, legendX + 18, legendY);
    });
}

function drawBarChart(ctx, labels, data, colors) {
    resizeCanvas(ctx.canvas);
    const width = ctx.canvas.width / ctx.canvas.ratio;
    const height = ctx.canvas.height / ctx.canvas.ratio;
    const padding = 40;
    const availableWidth = width - padding * 2;
    const availableHeight = height - padding * 2;

    if (!labels.length) {
        ctx.fillStyle = '#f8fafb';
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = '#333';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Sem dados para exibir', width / 2, height / 2);
        return;
    }

    const labelArea = 60;
    const chartHeight = height - padding * 2 - labelArea;
    const barWidth = availableWidth / labels.length * 0.7;
    const maxValue = Math.max(...data, 1);
    const scale = chartHeight / maxValue;

    ctx.fillStyle = '#f8fafb';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = '#d1d5db';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding - labelArea);
    ctx.lineTo(width - padding, height - padding - labelArea);
    ctx.stroke();

    data.forEach((value, i) => {
        const x = padding + i * (availableWidth / labels.length) + (availableWidth / labels.length - barWidth) / 2;
        const barHeight = Math.max(2, value * scale);
        const y = height - padding - labelArea - barHeight;

        ctx.fillStyle = colors[i % colors.length];
        ctx.fillRect(x, y, barWidth, barHeight);

        ctx.fillStyle = '#333';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(value, x + barWidth / 2, y - 8);

        ctx.font = '11px Arial';
        ctx.textBaseline = 'top';
        drawRotatedText(ctx, labels[i], x + barWidth / 2, height - padding - labelArea + 8, 40);
    });
}

function drawRotatedText(ctx, text, x, y, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = words[0] || '';

    for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const width = ctx.measureText(`${currentLine} ${word}`).width;
        if (width < maxWidth) {
            currentLine += ` ${word}`;
        } else {
            lines.push(currentLine);
            currentLine = word;
        }
    }
    lines.push(currentLine);

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(-Math.PI / 4);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#333';
    lines.forEach((line, index) => {
        ctx.fillText(line, 0, index * 14);
    });
    ctx.restore();
}

function resizeCanvas(canvas) {
    const ratio = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (canvas.ratio === ratio && canvas.width === width * ratio && canvas.height === height * ratio) return;
    canvas.ratio = ratio;
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    const ctx = canvas.getContext('2d');
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function debounce(fn, delay) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => fn(...args), delay);
    };
}

// ============================================
// UTILITÁRIOS
// ============================================
function populateSectorFilters() {
    const sectorFilter = document.getElementById('sectorFilter');
    const sectorSelect = document.getElementById('assessmentSector');

    if (!sectorFilter && !sectorSelect) return;

    const sectors = [...new Set(assessments.map(a => a.setor))].sort();

    if (sectorFilter) {
        sectorFilter.innerHTML = '<option value="">Todos os Setores</option>';
        sectors.forEach(sector => {
            const option = document.createElement('option');
            option.value = sector;
            option.textContent = sector;
            sectorFilter.appendChild(option);
        });
    }

    if (sectorSelect) {
        sectorSelect.innerHTML = '<option value="">Selecione um setor</option>';
        sectors.forEach(sector => {
            const option = document.createElement('option');
            option.value = sector;
            option.textContent = sector;
            sectorSelect.appendChild(option);
        });
    }
}

function formatDate(dateStr) {
    if (!dateStr) return '-';
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('pt-BR');
}

function calculateDaysRemaining(dateStr) {
    if (!dateStr) return 0;
    const deadline = new Date(dateStr + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = deadline - today;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function getStatusClass(status) {
    const classMap = {
        'Não iniciado': 'nao-iniciado',
        'Em andamento': 'em-andamento',
        'Aguardando evidência': 'aguardando',
        'Concluído': 'concluido',
        'Atrasado': 'atrasado'
    };
    return classMap[status] || 'nao-iniciado';
}

function getColorByDays(days) {
    if (days < 0) return '#f44336'; // Vermelho - Atrasado
    if (days <= 2) return '#ff9800'; // Laranja - Crítico
    if (days <= 7) return '#ffc107'; // Amarelo - Próximo
    return '#4caf50'; // Verde - OK
}

function exportToExcel(data = assessments) {
    const headers = ['Nome', 'Setor', 'Responsável', 'Prazo', 'Dias Restantes', 'Status', 'Evidência', 'Prioridade'];
    const rows = data.map(a => [
        a.nome,
        a.setor,
        a.responsavel || '-',
        formatDate(a.data_limite),
        a.dias_restantes,
        a.status,
        a.evidencia || 'Não informada',
        a.prioridade || 'Normal'
    ]);

    const table = [headers, ...rows].map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('');
    const html = `<table>${table}</table>`;
    const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio_assessments_${new Date().toISOString().split('T')[0]}.xls`;
    a.click();
    URL.revokeObjectURL(url);
}

function exportToPDF(data = assessments) {
    if (!window.jspdf || !window.jspdf.jsPDF) {
        showToast('Biblioteca PDF não carregada.', 'error');
        return;
    }

    const doc = new window.jspdf.jsPDF({ orientation: 'landscape' });
    doc.setFontSize(18);
    doc.text('Relatório de Assessments', 14, 20);
    doc.setFontSize(12);

    const today = new Date().toLocaleDateString('pt-BR');
    doc.text(`Data: ${today}`, 14, 28);
    doc.text(`Total de items: ${data.length}`, 14, 36);

    const summary = [
        ['Status', 'Quantidade'],
        ...Object.entries(data.reduce((acc, item) => {
            acc[item.status] = (acc[item.status] || 0) + 1;
            return acc;
        }, {}))
    ];

    let y = 48;
    summary.forEach((line) => {
        doc.text(`${line[0]}: ${line[1]}`, 14, y);
        y += 8;
    });

    y += 6;
    doc.text('Lista de items:', 14, y);
    y += 8;

    data.slice(0, 30).forEach((item, index) => {
        const row = `${index + 1}. ${item.nome} | ${item.setor} | ${item.status}`;
        if (y > 270) {
            doc.addPage();
            y = 20;
        }
        doc.text(row, 14, y);
        y += 8;
    });

    doc.save(`relatorio_assessments_${new Date().toISOString().split('T')[0]}.pdf`);
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ'
    };

    toast.innerHTML = `
        <span class="toast-icon">${icons[type]}</span>
        <span class="toast-message">${message}</span>
        <button class="toast-close" onclick="this.parentElement.remove()">✕</button>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 4000);
}

// ============================================
// EXPORTAR DADOS
// ============================================
function exportToCSV() {
    const headers = ['Nome', 'Setor', 'Responsável', 'Prazo', 'Status', 'Observações'];
    const rows = assessments.map(a => [
        a.nome,
        a.setor,
        a.responsavel,
        a.data_limite,
        a.status,
        a.observacoes
    ]);

    let csv = headers.join(',') + '\n';
    rows.forEach(row => {
        csv += row.map(cell => `"${cell}"`).join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `assessments_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
}
