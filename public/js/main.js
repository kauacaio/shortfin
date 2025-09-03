// main.js

// Substitua com suas credenciais do Supabase
const SUPABASE_URL = 'https://xlztivnrsjybcalbkgwv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhsenRpdm5yc2p5YmNhbGJrZ3d2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY4MzYzNjYsImV4cCI6MjA3MjQxMjM2Nn0.H34W0F9Pkzw020g3WIzMLVIeLQOtQpPttv1k1OnIcTM';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const loginForm = document.getElementById('login-form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const messageElement = document.getElementById('message');
const marketingTitle = document.getElementById('marketing-title');
const marketingText = document.getElementById('marketing-text');

// Array de frases de boas-vindas
const welcomePhrases = [
    { title: "Parabéns, você está no lugar certo.", text: "Com a gente, a simplicidade transforma suas finanças." },
    { title: "Seu futuro financeiro começa agora.", text: "Acesse para ver seus progressos e planejar seus próximos passos." },
    { title: "Bem-vindo de volta!", text: "Sua história financeira está esperando por você." }
];

let phraseIndex = 0;

function updateMarketingPhrase() {
    marketingTitle.textContent = welcomePhrases[phraseIndex].title;
    marketingText.textContent = welcomePhrases[phraseIndex].text;
    phraseIndex = (phraseIndex + 1) % welcomePhrases.length;
}

// Event listeners para tornar a tela reativa
emailInput.addEventListener('focus', updateMarketingPhrase);
passwordInput.addEventListener('focus', updateMarketingPhrase);

function displayMessage(text, isError = false) {
    messageElement.textContent = text;
    messageElement.style.color = isError ? 'red' : 'green';
}

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = emailInput.value;
    const password = passwordInput.value;

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        displayMessage('Erro no login: ' + error.message, true);
    } else {
        displayMessage('Login bem-sucedido! Redirecionando...', false);
        window.location.href = '/dashboard.html';
    }
});