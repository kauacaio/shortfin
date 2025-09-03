// member-login.js

const SUPABASE_URL = 'https://xlztivnrsjybcalbkgwv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhsenRpdm5yc2p5YmNhbGJrZ3d2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY4MzYzNjYsImV4cCI6MjA3MjQxMjM2Nn0.H34W0F9Pkzw020g3WIzMLVIeLQOtQpPttv1k1OnIcTM';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const memberNameSpan = document.getElementById('member-name');
const familyStatusCard = document.querySelector('.family-status-card');
const familyStatusTitle = document.getElementById('family-status-title');
const familyStatusMessage = document.getElementById('family-status-message');
const memberExpenseChartCanvas = document.getElementById('memberExpenseChart');
const memberTransactionsList = document.getElementById('member-transactions-list');
const addTransactionForm = document.getElementById('add-transaction-form');
const logoutButton = document.getElementById('logout-button');
const showTransactionFormButton = document.getElementById('show-add-transaction-form-button');
const cancelTransactionButton = document.getElementById('cancel-transaction-button');

let memberId = localStorage.getItem('member_id');
let memberName = localStorage.getItem('member_name');

// FUNÇÕES DE BUSCA E RENDERIZAÇÃO
async function getFamilyBalance(userId) {
    const { data: transactions, error } = await supabase
        .from('transactions')
        .select('amount, type')
        .eq('user_id', userId);
    
    if (error) {
        console.error('Erro ao buscar saldo da família:', error.message);
        return { balance: 0, status: 'error' };
    }
    
    let totalIncome = 0;
    let totalExpense = 0;
    transactions.forEach(t => {
        if (t.type === 'income') totalIncome += t.amount;
        else if (t.type === 'expense') totalExpense += t.amount;
    });

    const balance = totalIncome - totalExpense;
    let status = 'ok';
    if (balance < 0) status = 'red';
    else if (balance < 500) status = 'yellow';

    return { balance, status };
}

async function renderMemberDashboard() {
    if (!memberId || !memberName) {
        window.location.href = '/member-login.html';
        return;
    }
    
    memberNameSpan.textContent = memberName;

    const { data: memberData, error: memberError } = await supabase
        .from('family_members')
        .select('user_id')
        .eq('id', memberId)
        .single();
        
    if (memberError) {
        console.error('Erro ao buscar dados do membro:', memberError.message);
        return;
    }
    const userId = memberData.user_id;

    const { balance, status } = await getFamilyBalance(userId);
    if (status === 'red') {
        familyStatusMessage.textContent = 'O Saldo da família está no vermelho!';
        familyStatusCard.style.backgroundColor = '#f8d7da';
        familyStatusCard.style.borderColor = '#d9534f';
    } else if (status === 'yellow') {
        familyStatusMessage.textContent = 'Atenção com os gastos da família.';
        familyStatusCard.style.backgroundColor = '#fff3cd';
        familyStatusCard.style.borderColor = '#ffc107';
    } else {
        familyStatusMessage.textContent = 'O Saldo da família está em dia!';
        familyStatusCard.style.backgroundColor = '#d4edda';
        familyStatusCard.style.borderColor = '#28a745';
    }

    const { data: transactions, error: transactionError } = await supabase
        .from('transactions')
        .select('*')
        .eq('member_id', memberId)
        .order('created_at', { ascending: false });

    if (transactionError) {
        memberTransactionsList.innerHTML = '<li>Erro ao carregar transações.</li>';
        return;
    }

    const categories = {};
    let myTotalExpenses = 0;
    transactions.forEach(t => {
        if (t.type === 'expense') {
            if (!categories[t.category]) categories[t.category] = 0;
            categories[t.category] += t.amount;
            myTotalExpenses += t.amount;
        }
    });

    const transactionsHtml = transactions.map(t => `<li class="${t.type}"><div class="transaction-info"><span class="description">${t.description}</span><span class="category">${t.category}</span></div><span class="amount">${t.type === 'expense' ? '-' : '+'}$${t.amount.toFixed(2)}</span></li>`).join('');
    memberTransactionsList.innerHTML = transactionsHtml || '<li>Nenhuma transação encontrada.</li>';

    if (window.memberExpenseChartInstance) { window.memberExpenseChartInstance.destroy(); }
    const ctx = memberExpenseChartCanvas.getContext('2d');
    window.memberExpenseChartInstance = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: Object.keys(categories),
            datasets: [{
                data: Object.values(categories),
                backgroundColor: ['#007aff', '#ff9500', '#34c759', '#ff3b30', '#5856d6'],
            }]
        }
    });
}

// FUNÇÕES DE TRATAMENTO DE FORMULÁRIOS E AÇÕES
async function handleAddTransaction(event) {
    event.preventDefault();
    const description = addTransactionForm['transaction-description'].value;
    const amount = parseFloat(addTransactionForm['transaction-amount'].value);
    const type = 'expense';
    const category = addTransactionForm['transaction-category'].value;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { alert('Erro de autenticação.'); return; }
    
    const { error } = await supabase.from('transactions').insert([{
        user_id: session.user.id,
        member_id: memberId,
        description,
        amount,
        type,
        category
    }]);

    if (error) {
        alert('Erro ao adicionar transação: ' + error.message);
    } else {
        alert('Transação adicionada com sucesso!');
        addTransactionForm.reset();
        renderMemberDashboard();
    }
}

// LÓGICA DE AUTENTICAÇÃO E EVENTOS
document.addEventListener('DOMContentLoaded', async () => {
    if (!memberId) {
        window.location.href = '/member-login.html';
        return;
    }

    await renderMemberDashboard();
    
    showTransactionFormButton.addEventListener('click', () => {
        addTransactionForm.style.display = 'block';
    });
    
    cancelTransactionButton.addEventListener('click', () => {
        addTransactionForm.style.display = 'none';
    });

    addTransactionForm.addEventListener('submit', handleAddTransaction);

    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('member_id');
        localStorage.removeItem('member_name');
        window.location.href = '/member-login.html';
    });
});