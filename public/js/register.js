// register.js

// Substitua com suas credenciais do Supabase
const SUPABASE_URL = 'https://xlztivnrsjybcalbkgwv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhsenRpdm5yc2p5YmNhbGJrZ3d2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY4MzYzNjYsImV4cCI6MjA3MjQxMjM2Nn0.H34W0F9Pkzw020g3WIzMLVIeLQOtQpPttv1k1OnIcTM';



const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const registerForm = document.getElementById('register-form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const messageElement = document.getElementById('message');
const marketingTitle = document.getElementById('marketing-title');
const marketingText = document.getElementById('marketing-text');
const marketingSection = document.querySelector('.marketing-section');

const motivationalPhrases = [
    { title: "Sua jornada financeira começa aqui.", text: "O controle das suas finanças está a um passo de distância." },
    { title: "Definir o futuro. Agora.", text: "Com o ShortFIN, você constrói o futuro que sempre sonhou." },
    { title: "Dinheiro não precisa ser complicado.", text: "Nossa missão é descomplicar sua vida financeira." },
    { title: "Poupe mais, viva melhor.", text: "Cada gasto inteligente é um passo em direção aos seus sonhos." }
];

let phraseIndex = 0;

function updateMarketingPhrase() {
    marketingTitle.textContent = motivationalPhrases[phraseIndex].title;
    marketingText.textContent = motivationalPhrases[phraseIndex].text;
    phraseIndex = (phraseIndex + 1) % motivationalPhrases.length;
}

// Event listeners para tornar a tela reativa
emailInput.addEventListener('focus', updateMarketingPhrase);
passwordInput.addEventListener('focus', updateMarketingPhrase);

registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = emailInput.value;
    const password = passwordInput.value;

    const { error } = await supabase.auth.signUp({
        email,
        password,
    });

    if (error) {
        displayMessage('Erro no cadastro: ' + error.message, true);
    } else {
        marketingSection.classList.add('final-message');
        marketingSection.innerHTML = `
            <div class="final-content">
                <h2 class="final-title">Obrigado!</h2>
                <p><span class="symbol">💰</span><br>Você escolheu o caminho simples.</p>
            </div>
        `;
        displayMessage('Cadastro bem-sucedido! Verifique seu e-mail para confirmar.', false);
        registerForm.reset();
    }
});