/**
 * Gerencia a seleção de modos de jogo
 * @param {string} url - O destino da página do modo selecionado
 */
function selectMode(url) {
    // Adiciona uma pequena animação de feedback antes de redirecionar
    const activeElement = document.activeElement;
    
    if (activeElement && activeElement.classList.contains('play-button')) {
        activeElement.innerText = "Carregando...";
        activeElement.style.opacity = "0.7";
    }

    // Simula um pequeno delay para o efeito visual de clique
    setTimeout(() => {
        console.log(`Navegando para: ${url}`);
        window.location.href = url;
    }, 300);
}

// Log para confirmar que o script foi carregado
document.addEventListener('DOMContentLoaded', () => {
    console.log('Menu de Seleção de Modos pronto.');
});