// member-login.js

const SUPABASE_URL = 'https://xlztivnrsjybcalbkgwv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhsenRpdm5yc2p5YmNhbGJrZ3d2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY4MzYzNjYsImV4cCI6MjA3MjQxMjM2Nn0.H34W0F9Pkzw020g3WIzMLVIeLQOtQpPttv1k1OnIcTM';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const memberLoginForm = document.getElementById('member-login-form');
const messageP = document.getElementById('message');

memberLoginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    messageP.textContent = '';

    const memberName = memberLoginForm['member-name'].value;
    const accessCode = memberLoginForm['member-access-code'].value;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        messageP.textContent = 'Você não está logado como responsável. Por favor, faça login como responsável primeiro.';
        return;
    }

    // Busca o membro da família
    const { data: member, error: memberError } = await supabase
        .from('family_members')
        .select('id')
        .eq('user_id', session.user.id)
        .eq('name', memberName)
        .single();
        
    if (memberError || !member) {
        messageP.textContent = 'Nome do membro incorreto ou não encontrado.';
        return;
    }

    // Verifica o código de acesso
    const { data: accessData, error: accessError } = await supabase
        .from('member_access')
        .select('*')
        .eq('member_id', member.id)
        .eq('access_code', accessCode)
        .single();

    if (accessError || !accessData) {
        messageP.textContent = 'Código de acesso incorreto.';
        return;
    }

    // Se tudo estiver correto, armazena o ID do membro na sessão e redireciona
    localStorage.setItem('member_id', member.id);
    localStorage.setItem('member_name', memberName);
    window.location.href = '/member-dashboard.html';
});