const SUPABASE_URL = 'https://xlztivnrsjybcalbkgwv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhsenRpdm5yc2p5YmNhbGJrZ3d2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY4MzYzNjYsImV4cCI6MjA3MjQxMjM2Nn0.H34W0F9Pkzw020g3WIzMLVIeLQOtQpPttv1k1OnIcTM';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const userEmailSpan = document.getElementById('user-email');
const totalBalanceP = document.getElementById('total-balance');
const totalIncomeP = document.getElementById('total-income');
const totalExpenseP = document.getElementById('total-expense');
const transactionsList = document.getElementById('transactions-list');
const budgetsList = document.getElementById('budgets-list');
const expenseChartCanvas = document.getElementById('expenseChart');
const fixedEntriesList = document.getElementById('fixed-entries-list');
const familyMembersList = document.getElementById('family-members-list');
const billsList = document.getElementById('bills-list');
const savingsBoxesList = document.getElementById('savings-boxes-list');

const showAddBudgetButton = document.getElementById('show-add-budget-form-button');
const addBudgetForm = document.getElementById('add-budget-form');
const budgetFormContainer = document.getElementById('budget-form-container');
const cancelBudgetButton = document.getElementById('cancel-budget-button');

const showAddTransactionButton = document.getElementById('show-add-transaction-form-button');
const addTransactionForm = document.getElementById('add-transaction-form');
const transactionFormContainer = document.getElementById('transaction-form-container');
const cancelTransactionButton = document.getElementById('cancel-transaction-button');
const transactionMemberSelect = document.getElementById('transaction-member-id');

const showFixedEntryButton = document.getElementById('show-add-fixed-entry-form-button');
const addFixedEntryForm = document.getElementById('add-fixed-entry-form');
const fixedEntryFormContainer = document.getElementById('fixed-entry-form-container');
const cancelFixedEntryButton = document.getElementById('cancel-fixed-entry-button');

const showAddFamilyMemberButton = document.getElementById('show-add-family-member-form-button');
const addFamilyMemberForm = document.getElementById('add-family-member-form');
const familyMemberFormContainer = document.getElementById('family-member-form-container');
const cancelFamilyMemberButton = document.getElementById('cancel-family-member-button');

const showAddBillButton = document.getElementById('show-add-bill-form-button');
const addBillForm = document.getElementById('add-bill-form');
const billFormContainer = document.getElementById('bill-form-container');
const cancelBillButton = document.getElementById('cancel-bill-button');

const showAddSavingsBoxButton = document.getElementById('show-add-savings-box-form-button');
const addSavingsBoxForm = document.getElementById('add-savings-box-form');
const savingsBoxFormContainer = document.getElementById('savings-box-form-container');
const cancelSavingsBoxButton = document.getElementById('cancel-savings-box-button');

const logoutButton = document.getElementById('logout-button');

const transferModalContainer = document.getElementById('transfer-modal-container');
const transferForm = document.getElementById('transfer-form');
const transferAmountInput = document.getElementById('transfer-amount');
const cancelTransferButton = document.getElementById('cancel-transfer-button');
const transferModalTitle = document.getElementById('transfer-modal-title');
let currentTransferBoxId = null;

// FUNÇÕES DE TRATAMENTO DE FORMULÁRIOS E AÇÕES (DECLARADAS ANTES DE SEREM USADAS)
async function handleAddBudget(event) {
    event.preventDefault();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { alert('Você precisa estar logado.'); return; }
    const name = addBudgetForm['budget-name'].value;
    const amount = parseFloat(addBudgetForm['budget-amount'].value);
    const category = addBudgetForm['budget-category'].value;
    const { error } = await supabase.from('budgets').insert([{ name, amount, category, user_id: session.user.id }]);
    if (error) { alert('Erro ao adicionar orçamento: ' + error.message); } 
    else { alert('Orçamento adicionado!'); addBudgetForm.reset(); budgetFormContainer.style.display = 'none'; await fetchAndRenderBudgets(); }
}

async function handleAddTransaction(event) {
    event.preventDefault();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { alert('Você precisa estar logado.'); return; }
    const description = addTransactionForm['transaction-description'].value;
    const amount = parseFloat(addTransactionForm['transaction-amount'].value);
    const type = addTransactionForm['transaction-type'].value;
    const category = addTransactionForm['transaction-category'].value;
    const memberId = transactionMemberSelect.value;
    const { error } = await supabase.from('transactions').insert([{ user_id: session.user.id, description, amount, type, category, member_id: memberId }]);
    if (error) { alert('Erro ao adicionar transação: ' + error.message); }
    else { alert('Transação adicionada!'); addTransactionForm.reset(); transactionFormContainer.style.display = 'none'; await fetchAndRenderDashboard(); }
}

async function handleAddFixedEntry(event) {
    event.preventDefault();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { alert('Você precisa estar logado.'); return; }
    const description = addFixedEntryForm['fixed-entry-description'].value;
    const amount = parseFloat(addFixedEntryForm['fixed-entry-amount'].value);
    const type = addFixedEntryForm['fixed-entry-type'].value;
    const category = addFixedEntryForm['fixed-entry-category'].value;
    const frequency = addFixedEntryForm['fixed-entry-frequency'].value;
    const startDate = addFixedEntryForm['fixed-entry-start-date'].value;
    const { error } = await supabase.from('fixed_entries').insert([{ user_id: session.user.id, description, amount, type, category, frequency, start_date: startDate }]);
    if (error) { alert('Erro ao adicionar: ' + error.message); } 
    else { alert('Lançamento fixo adicionado!'); fixedEntryFormContainer.style.display = 'none'; addFixedEntryForm.reset(); await fetchAndRenderFixedEntries(); }
}

async function handleEditFixedEntry(event) { const entryId = event.target.dataset.id; alert(`Editar lançamento com ID: ${entryId}`); }
async function handleToggleFixedEntry(event) {
    const entryId = event.target.dataset.id;
    const currentStatus = event.target.dataset.status === 'true';
    const { error } = await supabase.from('fixed_entries').update({ is_active: !currentStatus }).eq('id', entryId);
    if (error) { alert('Erro ao atualizar status: ' + error.message); }
    else { await fetchAndRenderFixedEntries(); }
}
async function handleDeleteFixedEntry(event) {
    const entryId = event.target.dataset.id;
    if (confirm('Tem certeza que deseja excluir?')) {
        const { error } = await supabase.from('fixed_entries').delete().eq('id', entryId);
        if (error) { alert('Erro ao excluir: ' + error.message); }
        else { await fetchAndRenderFixedEntries(); }
    }
}

async function handleAddFamilyMember(event) {
    event.preventDefault();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { alert('Você precisa estar logado.'); return; }
    const name = addFamilyMemberForm['family-member-name'].value;
    const relation = addFamilyMemberForm['family-member-relation'].value;
    const { error } = await supabase.from('family_members').insert([{ user_id: session.user.id, name, relation }]);
    if (error) { alert('Erro ao adicionar membro: ' + error.message); } 
    else { alert('Membro adicionado!'); familyMemberFormContainer.style.display = 'none'; addFamilyMemberForm.reset(); await fetchAndRenderFamilyMembers(); }
}

async function handleDeleteFamilyMember(event) {
    const memberId = event.target.dataset.id;
    if (confirm('Tem certeza que deseja excluir este membro da família?')) {
        const { error } = await supabase.from('family_members').delete().eq('id', memberId);
        if (error) { alert('Erro ao excluir membro: ' + error.message); } 
        else { alert('Membro excluído com sucesso!'); await fetchAndRenderFamilyMembers(); }
    }
}

async function handleAddBill(event) {
    event.preventDefault();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { alert('Você precisa estar logado.'); return; }
    const description = addBillForm['bill-description'].value;
    const amount = parseFloat(addBillForm['bill-amount'].value);
    const dueDate = addBillForm['bill-due-date'].value;
    const type = addBillForm['bill-type'].value;
    const { error } = await supabase.from('bills').insert([{ user_id: session.user.id, description, amount, due_date: dueDate, type }]);
    if (error) { alert('Erro ao adicionar conta: ' + error.message); }
    else { alert('Conta adicionada!'); addBillForm.reset(); billFormContainer.style.display = 'none'; await fetchAndRenderBills(); }
}

async function handleToggleBillPaid(event) {
    const billId = event.target.dataset.id;
    
    const { data: bill, error: fetchError } = await supabase
        .from('bills')
        .select('*')
        .eq('id', billId)
        .single();
    
    if (fetchError || !bill) { alert('Erro ao encontrar a conta para pagamento.'); return; }

    const { error: updateError } = await supabase
        .from('bills')
        .update({ is_paid: true })
        .eq('id', billId);

    if (updateError) { alert('Erro ao marcar a conta como paga: ' + updateError.message); return; }

    const { data: { session } } = await supabase.auth.getSession();
    const transactionType = bill.type === 'payable' ? 'expense' : 'income';
    const transactionDescription = `Pagamento: ${bill.description}`;
    const { error: transactionError } = await supabase
        .from('transactions')
        .insert([{ user_id: session.user.id, description: transactionDescription, amount: bill.amount, type: transactionType, category: 'Contas' }]);

    if (transactionError) { alert('A conta foi marcada como paga, mas houve um erro ao registrar a transação.'); } 
    else { alert('Conta paga e transação registrada com sucesso!'); }
    
    await fetchAndRenderDashboard();
}

async function handleAddSavingsBox(event) {
    event.preventDefault();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { alert('Você precisa estar logado.'); return; }
    const name = addSavingsBoxForm['savings-box-name'].value;
    const targetAmount = parseFloat(addSavingsBoxForm['savings-box-target-amount'].value);
    const { error } = await supabase.from('savings_boxes').insert([{ user_id: session.user.id, name, target_amount: targetAmount }]);
    if (error) { alert('Erro ao criar caixinha: ' + error.message); }
    else { alert('Caixinha criada!'); addSavingsBoxForm.reset(); savingsBoxFormContainer.style.display = 'none'; await fetchAndRenderSavingsBoxes(); }
}

async function showTransferModal(event) {
    const boxId = event.target.dataset.id;
    const boxName = event.target.dataset.name;

    transferModalTitle.textContent = `Transferir para ${boxName}`;
    currentTransferBoxId = boxId;
    transferModalContainer.style.display = 'flex';
}

async function handleTransferSubmit(event) {
    event.preventDefault();
    const transferAmount = parseFloat(transferAmountInput.value);

    if (isNaN(transferAmount) || transferAmount <= 0) { alert('Por favor, insira um valor válido.'); return; }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { alert('Você precisa estar logado para fazer transferências.'); return; }

    const { data: savingsBox, error: fetchError } = await supabase
        .from('savings_boxes')
        .select('*')
        .eq('id', currentTransferBoxId)
        .single();
    
    if (fetchError || !savingsBox) { alert('Erro ao encontrar a caixinha.'); return; }
    
    const newAmount = savingsBox.current_amount + transferAmount;
    const { error: updateError } = await supabase
        .from('savings_boxes')
        .update({ current_amount: newAmount })
        .eq('id', currentTransferBoxId);

    if (updateError) { alert('Erro ao atualizar a caixinha.'); return; }
    
    const transactionDescription = `Transferência para: ${savingsBox.name}`;
    const { error: transactionError } = await supabase
        .from('transactions')
        .insert([{ user_id: session.user.id, description: transactionDescription, amount: transferAmount, type: 'expense', category: 'Poupança' }]);

    if (transactionError) { alert('A transferência foi feita, mas houve um erro ao registrar a transação.'); } 
    else { alert('Transferência realizada com sucesso!'); }
    
    transferModalContainer.style.display = 'none';
    transferForm.reset();
    currentTransferBoxId = null;
    await fetchAndRenderDashboard();
}

async function handleDeleteSavingsBox(event) {
    const boxId = event.target.dataset.id;
    if (confirm('Tem certeza que deseja excluir esta caixinha de poupança?')) {
        const { error } = await supabase
            .from('savings_boxes')
            .delete()
            .eq('id', boxId);

        if (error) { alert('Erro ao excluir caixinha: ' + error.message); } 
        else { alert('Caixinha excluída com sucesso!'); await fetchAndRenderSavingsBoxes(); }
    }
}

// FUNÇÕES DE BUSCA E RENDERIZAÇÃO
async function fetchAndRenderBudgets() {
    const { data: budgets, error } = await supabase.from('budgets').select('*').order('created_at', { ascending: false });
    if (error) { console.error('Erro ao buscar orçamentos:', error.message); budgetsList.innerHTML = '<li>Erro ao carregar os orçamentos.</li>'; return; }
    if (budgets.length === 0) { budgetsList.innerHTML = '<li>Nenhum orçamento encontrado.</li>'; } 
    else {
        const budgetsHtml = budgets.map(budget => `<li class="budget-item"><div class="budget-info"><span class="budget-name">${budget.name}</span><span class="budget-category">${budget.category}</span></div><div class="budget-amount">R$ ${budget.amount.toFixed(2)}</div></li>`).join('');
        budgetsList.innerHTML = budgetsHtml;
    }
}

async function fetchAndRenderFixedEntries() {
    const { data: fixedEntries, error } = await supabase.from('fixed_entries').select('*').order('created_at', { ascending: false });
    if (error) { console.error('Erro ao buscar lançamentos fixos:', error.message); fixedEntriesList.innerHTML = '<li>Erro ao carregar.</li>'; return; }
    const fixedEntriesHtml = fixedEntries.map(entry => `<li class="${entry.is_active ? '' : 'paused'}"><div class="entry-info"><span class="description">${entry.description}</span><span class="category">${entry.category}</span></div><div class="entry-actions"><button class="edit-btn" data-id="${entry.id}">Editar</button><button class="toggle-btn" data-id="${entry.id}" data-status="${entry.is_active}">${entry.is_active ? 'Pausar' : 'Ativar'}</button><button class="delete-btn" data-id="${entry.id}">Excluir</button></div></li>`).join('');
    fixedEntriesList.innerHTML = fixedEntriesHtml || '<li>Nenhum lançamento fixo encontrado.</li>';
    document.querySelectorAll('#fixed-entries-list .edit-btn').forEach(btn => btn.addEventListener('click', handleEditFixedEntry));
    document.querySelectorAll('#fixed-entries-list .toggle-btn').forEach(btn => btn.addEventListener('click', handleToggleFixedEntry));
    document.querySelectorAll('#fixed-entries-list .delete-btn').forEach(btn => btn.addEventListener('click', handleDeleteFixedEntry));
}

async function fetchAndRenderFamilyMembers() {
    const { data: familyMembers, error } = await supabase.from('family_members').select('*').order('created_at', { ascending: false });
    if (error) { console.error('Erro ao buscar membros:', error.message); familyMembersList.innerHTML = '<li>Erro ao carregar.</li>'; return; }
    
    const membersHtml = familyMembers.map(member => `
        <li>
            <span>${member.name} (${member.relation})</span>
            <button class="delete-btn" data-id="${member.id}">Excluir</button>
        </li>
    `).join('');
    familyMembersList.innerHTML = membersHtml || '<li>Nenhum membro adicionado.</li>';
    
    document.querySelectorAll('#family-members-list .delete-btn').forEach(btn => {
        btn.addEventListener('click', handleDeleteFamilyMember);
    });
}

async function populateFamilyMembersSelect() {
    const { data: familyMembers, error } = await supabase.from('family_members').select('*');
    if (error) { console.error('Erro ao buscar membros para o seletor:', error.message); return; }
    transactionMemberSelect.innerHTML = `<option value="" disabled selected>Quem gastou?</option>`;
    const userOption = document.createElement('option');
    userOption.value = supabase.auth.user().id;
    userOption.textContent = 'Eu';
    transactionMemberSelect.appendChild(userOption);
    familyMembers.forEach(member => {
        const option = document.createElement('option');
        option.value = member.id;
        option.textContent = member.name;
        transactionMemberSelect.appendChild(option);
    });
}

async function fetchAndRenderBills() {
    const { data: bills, error } = await supabase.from('bills').select('*').order('due_date', { ascending: true });
    if (error) { console.error('Erro ao buscar contas:', error.message); billsList.innerHTML = '<li>Erro ao carregar.</li>'; return; }
    const billsHtml = bills.map(bill => {
        const isOverdue = !bill.is_paid && new Date(bill.due_date) < new Date();
        return `<li class="${bill.is_paid ? 'paid' : (isOverdue ? 'overdue' : '')}"><div class="bill-info"><span class="description">${bill.description}</span><span class="details">Vencimento: ${new Date(bill.due_date).toLocaleDateString()}</span></div><div class="bill-amount">${bill.type === 'payable' ? '-' : '+'}$${bill.amount.toFixed(2)}</div><div class="bill-actions">${!bill.is_paid ? `<button class="pay-btn" data-id="${bill.id}">Pagar</button>` : '<span>Pago</span>'}</div></li>`;
    }).join('');
    billsList.innerHTML = billsHtml || '<li>Nenhuma conta encontrada.</li>';
    document.querySelectorAll('.pay-btn').forEach(btn => btn.addEventListener('click', handleToggleBillPaid));
}

async function fetchAndRenderSavingsBoxes() {
    const { data: savingsBoxes, error } = await supabase.from('savings_boxes').select('*').order('created_at', { ascending: false });
    if (error) { console.error('Erro ao buscar caixinhas:', error.message); savingsBoxesList.innerHTML = '<li>Erro ao carregar.</li>'; return; }
    const boxesHtml = savingsBoxes.map(box => {
        const progress = (box.current_amount / box.target_amount) * 100;
        return `
            <li>
                <div class="box-info">
                    <span class="box-name">${box.name}</span>
                    <span class="box-progress-text">${progress.toFixed(0)}%</span>
                </div>
                <div class="progress-bar-container">
                    <div class="progress-bar" style="width: ${progress}%"></div>
                </div>
                <div class="box-amounts">
                    <span class="current-amount">R$ ${box.current_amount.toFixed(2)}</span> / <span class="target-amount">R$ ${box.target_amount.toFixed(2)}</span>
                </div>
                <div class="box-actions">
                    <button class="transfer-btn" data-id="${box.id}" data-name="${box.name}">Transferir</button>
                    <button class="delete-btn" data-id="${box.id}">Excluir</button>
                </div>
            </li>
        `;
    }).join('');
    savingsBoxesList.innerHTML = boxesHtml || '<li>Nenhuma caixinha de poupança encontrada.</li>';
    document.querySelectorAll('#savings-boxes-list .transfer-btn').forEach(btn => btn.addEventListener('click', showTransferModal));
    document.querySelectorAll('#savings-boxes-list .delete-btn').forEach(btn => btn.addEventListener('click', handleDeleteSavingsBox));
}

// FUNÇÃO PRINCIPAL DE BUSCA E RENDERIZAÇÃO
async function fetchAndRenderDashboard() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { return; }
    userEmailSpan.textContent = session.user.email;
    const { data: transactions, error } = await supabase.from('transactions').select('*').order('created_at', { ascending: false });
    if (error) { console.error('Erro ao buscar transações:', error.message); transactionsList.innerHTML = '<li>Erro ao carregar as transações.</li>'; return; }

    let totalIncome = 0; let totalExpense = 0; const categories = {};
    transactions.forEach(t => {
        if (t.type === 'income') { totalIncome += t.amount; }
        else if (t.type === 'expense') { totalExpense += t.amount; if (!categories[t.category]) { categories[t.category] = 0; } categories[t.category] += t.amount; }
    });
    const totalBalance = totalIncome - totalExpense;
    totalBalanceP.textContent = `R$ ${totalBalance.toFixed(2)}`;
    totalIncomeP.textContent = `R$ ${totalIncome.toFixed(2)}`;
    totalExpenseP.textContent = `R$ ${totalExpense.toFixed(2)}`;
    const transactionsHtml = transactions.map(t => `<li class="${t.type}"><div class="transaction-info"><span class="description">${t.description}</span><span class="category">${t.category}</span></div><span class="amount">${t.type === 'expense' ? '-' : '+'}$${t.amount.toFixed(2)}</span></li>`).join('');
    transactionsList.innerHTML = transactionsHtml || '<li>Nenhuma transação encontrada.</li>';

    await fetchAndRenderBudgets();
    await fetchAndRenderFixedEntries();
    await fetchAndRenderFamilyMembers();
    await fetchAndRenderBills();
    await fetchAndRenderSavingsBoxes();
    
    if (window.expenseChartInstance) { window.expenseChartInstance.destroy(); }
    const ctx = expenseChartCanvas.getContext('2d');
    window.expenseChartInstance = new Chart(ctx, {
        type: 'pie', data: { labels: Object.keys(categories), datasets: [{ data: Object.values(categories), backgroundColor: ['#007aff', '#ff9500', '#5856d6', '#34c759', '#ff3b30'], }] },
        options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
    });
}

// FUNÇÃO PRINCIPAL DE AUTENTICAÇÃO E INICIALIZAÇÃO
async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { window.location.href = '/index.html'; }
    else { await fetchAndRenderDashboard(); }
}

document.addEventListener('DOMContentLoaded', async () => {
    checkAuth();

    showAddBudgetButton.addEventListener('click', () => { budgetFormContainer.style.display = 'flex'; });
    cancelBudgetButton.addEventListener('click', () => { budgetFormContainer.style.display = 'none'; });
    addBudgetForm.addEventListener('submit', handleAddBudget);

    showAddTransactionButton.addEventListener('click', () => { populateFamilyMembersSelect(); transactionFormContainer.style.display = 'flex'; });
    cancelTransactionButton.addEventListener('click', () => { transactionFormContainer.style.display = 'none'; });
    addTransactionForm.addEventListener('submit', handleAddTransaction);

    showFixedEntryButton.addEventListener('click', () => { fixedEntryFormContainer.style.display = 'flex'; });
    cancelFixedEntryButton.addEventListener('click', () => { fixedEntryFormContainer.style.display = 'none'; });
    addFixedEntryForm.addEventListener('submit', handleAddFixedEntry);
    
    showAddFamilyMemberButton.addEventListener('click', () => { familyMemberFormContainer.style.display = 'flex'; });
    cancelFamilyMemberButton.addEventListener('click', () => { familyMemberFormContainer.style.display = 'none'; });
    addFamilyMemberForm.addEventListener('submit', handleAddFamilyMember);

    showAddBillButton.addEventListener('click', () => { billFormContainer.style.display = 'flex'; });
    cancelBillButton.addEventListener('click', () => { billFormContainer.style.display = 'none'; });
    addBillForm.addEventListener('submit', handleAddBill);

    showAddSavingsBoxButton.addEventListener('click', () => { savingsBoxFormContainer.style.display = 'flex'; });
    cancelSavingsBoxButton.addEventListener('click', () => { savingsBoxFormContainer.style.display = 'none'; });
    addSavingsBoxForm.addEventListener('submit', handleAddSavingsBox);

    transferForm.addEventListener('submit', handleTransferSubmit);
    cancelTransferButton.addEventListener('click', () => {
        transferModalContainer.style.display = 'none';
        transferForm.reset();
    });

    logoutButton.addEventListener('click', async () => { await supabase.auth.signOut(); window.location.href = '/index.html'; });
});