/**
 * BANCO DE DADOS DE TEXTOS PARA OS MODAIS SIMPLES
 */
const gameInstructions = {
    livre: {
        title: "MODO LIVRE",
        content: `
            <div class="modal-inner-content">
                <p>NESTE MODO, VOCÊ PODE JOGAR SEM QUALQUER TIPO DE PRESSÃO, NÃO HÁ LIMITE DE TEMPO, PERMITINDO QUE VOCÊ EXPLORE O JOGO COM CALMA,</p>
                <p>IDEAL PARA INICIANTES, OU APENAS PRA QUEM DESEJA MATAR O TEMPO! TREINE SUAS HABILIDADES E MELHORE SUA CONCENTRAÇÃO</p>
                <div class="info-banner" style="border-color: var(--green); color: var(--green); margin-top: 15px;">
                | SEM CRONÔMETRO | OPÇÃO DE AJUDA ILIMITADO | SEM SISTEMA DE PONTOS |
                </div>
            </div>
        `
    },
    crono: {
        title: "MODO CRONOMETRADO",
        content: `
            <div class="modal-inner-content">
                <p>AQUI, O TEMPO SERÁ SEU MAIOR DESAFIO! COMPLETE O PUZZLE O MAIS RAPIDO POSSÍVEL E BATA SEU RECORDE.</p>
                <p>RACIOCÍNIO RÁPIDO E TOMADAS DE DECISÃO SÃO A CHAVE PARA NÃO DESPERDIÇAR UM SEGUNDO SEQUER</p>
                <div class="info-banner" style="border-color: var(--green); color: var(--green); margin-top: 15px;">
                  | COM CRONÔMETRO | OPÇÃO DE AJUDA LIMITADO (3X) | RANKING PESSOAL (MELHOR TEMPO) | SEM SISTEMA DE PONTOS |
                 </div>
            </div>
        `
    }
};

// Captura de Elementos
const modal = document.getElementById("infoModal");
const modalBody = document.getElementById("modalBody");
const viewMain = document.getElementById("view-main");
const viewChallenges = document.getElementById("view-challenges");

/**
 * 1. NAVEGAÇÃO ENTRE TELAS (TRANSITA PARA O MODO DESAFIOS)
 */
function showChallenges() {
    viewMain.style.display = "none";
    viewChallenges.style.display = "block";
    window.scrollTo(0, 0); // Volta ao topo da página
}

function backToMain() {
    viewChallenges.style.display = "none";
    viewMain.style.display = "block";
    window.scrollTo(0, 0);
}

/**
 * 2. CONTROLE DO MODAL (LIVRE E CRONOMETRADO)
 */
function openModal(mode) {
    const data = gameInstructions[mode];
    if (data) {
        modalBody.innerHTML = `
            <h2 style="color: var(--cyan); margin-bottom: 1.5rem; letter-spacing: 2px;">${data.title}</h2>
            ${data.content}
        `;
        modal.style.display = "flex";
        document.body.style.overflow = "hidden"; // Trava o scroll do fundo
    }
}

function closeModal() {
    modal.style.display = "none";
    document.body.style.overflow = "auto"; // Libera o scroll
}

/**
 * 3. FUNÇÃO DOS ACCORDIONS (DENTRO DE DESAFIOS)
 */
function toggleSection(sectionId) {
    const section = document.getElementById(sectionId);
    const body = section.querySelector('.mode-body');
    const indicator = section.querySelector('.toggle-indicator');
    
    // Verifica se está visível
    const isVisible = body.style.display === "block";
    
    // Fecha todos os outros antes de abrir o atual (Opcional - Estilo Sanfona)
    document.querySelectorAll('.mode-body').forEach(b => b.style.display = "none");
    document.querySelectorAll('.toggle-indicator').forEach(i => i.classList.remove('active'));

    // Alterna o atual
    if (!isVisible) {
        body.style.display = "block";
        if (indicator) indicator.classList.add('active');
    }
}

/**
 * 4. EVENTOS DE FECHAMENTO
 */
// Fechar ao clicar fora do modal
window.onclick = (event) => { 
    if (event.target == modal) closeModal(); 
};

// Fechar com a tecla ESC
document.addEventListener('keydown', (e) => { 
    if (e.key === 'Escape') {
        closeModal();
        // Se estiver na tela de desafios, o ESC também pode voltar (opcional)
        if (viewChallenges.style.display === "block") backToMain();
    }
});