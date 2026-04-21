/**
 * 1. CONFIGURAÇÕES E ESTADOS GLOBAIS
 */
const config = {
    difficulty: 16,
    theme: 'naruto',
    isRandomTheme: false,
    isRandomDiff: false
};

let flippedCards = [];
let matchedCount = 0;
let moves = 0;
let isPaused = false;
let canClick = true;
let selectedWP = null;
let parallaxEnabled = false;

// Novas variáveis de estado para o Player
let isShuffle = false;
let shuffleQueue = [];

// Novos estados para efeitos sonoros
let isSFXMuted = false;

// Novos estados para efeitos sonoros
const sfxAcerto = new Audio('sounds/acerto.wav');
const sfxClick = new Audio('sounds/click.wav');

const themes = ["naruto", "jujutsu", "kimetsu"];
const difficulties = [16, 32, 60];

// Paletas de Cores e Presets
const colorPalette = ["#FF4ECD", "#FF7A00", "#00FFC6", "#39FF14", "#FFD60A", "#E63946", "#00F5FF", "#00FF87", "#52B788", "#FF00C8"];
const bgPalette = ["#0B0F2A", "#1B0F0A", "#041C24", "#0D0D0D", "#0A0F1F", "#0B090A", "#051014", "#0A0A0A", "#081C15", "#05010A"];
const outlinePalette = ["#00F5D4", "#FFD166", "#3A86FF", "#C77DFF", "#ff5e00", "#6A00FF", "#e00665", "#FF0054", "#FFD166", "#00D9FF"];

const presets = [
    { name: 'Sky', bg: '#0f172a', accent: '#38bdf8', outline: '#334155' },
    { name: 'Purple', bg: '#1a1a2e', accent: '#a855f7', outline: '#4c1d95' },
    { name: 'Matrix', bg: '#050505', accent: '#22c55e', outline: '#064e3b' },
    { name: 'Sunset', bg: '#1c1917', accent: '#f97316', outline: '#78350f' },
    { name: 'Rose', bg: '#170a0d', accent: '#ec4899', outline: '#831843' },
    { name: 'Emerald', bg: '#022c22', accent: '#10b981', outline: '#065f46' },
    { name: 'Carbon', bg: '#171717', accent: '#64748b', outline: '#334155' },
    { name: 'Indigo', bg: '#1e1b4b', accent: '#6366f1', outline: '#3730a3' },
    { name: 'Crimson', bg: '#2d0a0a', accent: '#ef4444', outline: '#7f1d1d' },
    { name: 'Gold', bg: '#1a1401', accent: '#eab308', outline: '#713f12' }
];

/**
 * 2. INICIALIZAÇÃO E UI CORE
 */
document.addEventListener('DOMContentLoaded', () => {
    generateColorGrids(); 
    loadSavedTheme(); 
    initWallpaperLogic(); 
    setupThemeListeners();
    loadPlaylist();
    setupPlayerListeners();
    initSidebarLogic();

    requestAnimationFrame(() => {
        document.body.classList.remove('no-transition');
    });
});

function closeAllPanels() {
    const wp = document.getElementById('wallpaper-panel');
    const th = document.getElementById('theme-panel');
    const mu = document.getElementById('music-panel');
    if (wp) wp.classList.remove('open');
    if (th) th.classList.remove('open');
    if (mu) mu.classList.remove('show');
}

/**
 * 3. LÓGICA DO JOGO
 */
function startGame() {
    const tSelect = document.getElementById('game-theme').value;
    const dSelect = document.getElementById('game-difficulty').value;
    config.isRandomTheme = (tSelect === 'random');
    config.isRandomDiff = (dSelect === 'random');
    applySettingsAndStart(tSelect, dSelect);
}

function applySettingsAndStart(tSelect, dSelect) {
    config.theme = (tSelect === 'random') ? themes[Math.floor(Math.random() * themes.length)] : tSelect;
    config.difficulty = (dSelect === 'random') ? difficulties[Math.floor(Math.random() * difficulties.length)] : parseInt(dSelect);

    document.getElementById('current-theme').innerText = config.theme.toUpperCase();
    
    // Atualizado: 64 alterado para 56
    const diffNames = { 16: "FÁCIL", 32: "MÉDIO", 60: "DIFÍCIL" }; 
    document.getElementById('current-difficulty').innerText = diffNames[config.difficulty] || "MÉDIO";

    document.getElementById('menu-screen').classList.remove('active');
    document.getElementById('game-screen').classList.add('active');
    
    if (window.resetFabPosition) window.resetFabPosition();
    initBoard();
}

function initBoard() {
    moves = 0; matchedCount = 0; flippedCards = []; canClick = true;
    document.getElementById('moves').innerText = "0";
    const board = document.getElementById('game-board');
    board.innerHTML = '';
    
    // Vincula a dificuldade atual ao elemento HTML do tabuleiro
    // Isso permite que o CSS mude o tamanho das cartas via #game-board[data-diff="16"]
    board.dataset.diff = config.difficulty; 

    const isMobile = window.innerWidth <= 600;
    
    // Lógica de Grid:
    if (isMobile) {
        board.style.gridTemplateColumns = `repeat(4, 1fr)`;
    } else {
        if (config.difficulty === 60) {
            board.style.gridTemplateColumns = `repeat(10, 1fr)`;
        } else if (config.difficulty === 32) {
            board.style.gridTemplateColumns = `repeat(8, 1fr)`;
        } else {
            board.style.gridTemplateColumns = `repeat(4, 1fr)`;
        }
    }

    let allIcons = Array.from({length: 32}, (_, i) => `${i+1}.jpg`);
    
    // Seleção dinâmica de ícones baseada na dificuldade configurada
    let selectedIcons = allIcons.sort(() => 0.5 - Math.random()).slice(0, config.difficulty / 2);
    let gameIcons = [...selectedIcons, ...selectedIcons].sort(() => 0.5 - Math.random());

    gameIcons.forEach(file => {
        const card = document.createElement('div');
        card.className = 'card';
        card.dataset.icon = file;
        card.onclick = () => flipCard(card);
        card.innerHTML = `
            <div class="card-back">?</div>
            <div class="card-front"><img src="assets/temas/${config.theme}/${file}"></div>
        `;
        board.appendChild(card);
    });
}

function flipCard(card) {
    if (!canClick || isPaused || card.classList.contains('flipped') || card.classList.contains('matched')) return;

    card.classList.add('flipped');
    flippedCards.push(card);

    // Se for a PRIMEIRA carta do par, sempre toca o clique
    if (flippedCards.length === 1) {
        if (!isSFXMuted) {
            sfxClick.currentTime = 0;
            sfxClick.play();
        }
    }

    if (flippedCards.length === 2) {
        canClick = false; 
        moves++;
        document.getElementById('moves').innerText = moves;
        
        if (flippedCards[0].dataset.icon === flippedCards[1].dataset.icon) {
            // SEGUNDA CARTA É PAR: Toca apenas o acerto (chamado dentro de handleMatch)
            handleMatch();
        } else {
            // SEGUNDA CARTA NÃO É PAR: Toca o clique normal
            if (!isSFXMuted) {
                sfxClick.currentTime = 0;
                sfxClick.play();
            }
            handleMiss();
        }
    }
}

function handleMatch() {
    // Toca o som de acerto (substituindo o clique na segunda carta)
    if (!isSFXMuted) {
        sfxAcerto.currentTime = 0;
        sfxAcerto.play();
    }
    flippedCards.forEach(c => c.classList.add('matched'));
    matchedCount += 2;
    flippedCards = [];
    if (matchedCount === config.difficulty) {
        setTimeout(() => {
            const nextT = config.isRandomTheme ? 'random' : config.theme;
            const nextD = config.isRandomDiff ? 'random' : config.difficulty.toString();
            applySettingsAndStart(nextT, nextD);
        }, 1000);
    } else {
        canClick = true;
    }
}

function handleMiss() {
    setTimeout(() => {
        flippedCards.forEach(c => c.classList.remove('flipped'));
        flippedCards = [];
        canClick = true;
    }, 800);
}

function toggleSFX() {
    isSFXMuted = !isSFXMuted;
    const btn = document.getElementById('sfx-toggle-btn');
    const label = btn.nextElementSibling; // Pega o .tool-label
    
    btn.innerHTML = isSFXMuted ? '🔇' : '🔊';
    label.innerText = isSFXMuted ? 'SFX OFF' : 'SFX ON';
    
    // Feedback visual opcional
    btn.style.borderColor = isSFXMuted ? '#ef4444' : 'var(--accent)';
}

/**
 * 4. AJUDA, MODAL E PAUSA
 */
function useHelp() {
    if (!canClick || isPaused) return;
    canClick = false;
    const allCards = document.querySelectorAll('.card:not(.matched)');
    allCards.forEach(card => card.classList.add('flipped'));
    setTimeout(() => {
        allCards.forEach(card => {
            if (!flippedCards.includes(card)) card.classList.remove('flipped');
        });
        canClick = true;
    }, 4000);
}

function togglePause() {
    isPaused = !isPaused;
    if(isPaused) {
        showModal("PAUSADO", "<p>O jogo está em espera.</p>", [
            { text: "RETOMAR", click: "togglePause()" },
            { 
                text: "SAIR", 
                click: () => { 
                    // 1. Esconde o overlay de pausa
                    document.getElementById('overlay').style.display = 'none';
                    isPaused = false;

                    // 2. Alterna as telas sem recarregar a página
                    document.getElementById('game-screen').classList.remove('active');
                    document.getElementById('menu-screen').classList.add('active');

                    // 3. Reseta o FAB (opcional, se você tiver a função)
                    if(window.resetFabPosition) window.resetFabPosition();

                    // Nota: NÃO usamos location.reload() aqui para a música não parar.
                } 
            }
        ]);
    } else {
        document.getElementById('overlay').style.display = 'none';
    }
}

function showModal(title, content, buttons) {
    document.getElementById('overlay').style.display = 'flex';
    document.getElementById('modal-title').innerText = title;
    document.getElementById('modal-content').innerHTML = content;
    const container = document.getElementById('dynamic-buttons');
    container.innerHTML = '';
    buttons.forEach(b => {
        const btn = document.createElement('button');
        btn.innerText = b.text;
        btn.onclick = typeof b.click === 'string' ? new Function(b.click) : b.click;
        container.appendChild(btn);
    });
}

/**
 * 5. PERSONALIZAÇÃO E RESET DE CORES (RECUPERADO)
 */
function resetTheme() {
    localStorage.removeItem('memoryMasterTheme');
    const defaults = {
        '--bg-color': '#0f172a',
        '--accent': '#38bdf8',
        '--outline-color': '#334155',
        '--text': '#f1f5f9'
    };
    for (const [variable, value] of Object.entries(defaults)) {
        document.documentElement.style.setProperty(variable, value);
    }
    // Remove a marcação de ativo dos ícones de cores
    document.querySelectorAll('.color-dot').forEach(d => d.classList.remove('active'));
    console.log("Tema resetado.");
}

function generateColorGrids() {
    const list = [
        { id: 'grid-accent', colors: colorPalette, var: '--accent' },
        { id: 'grid-bg', colors: bgPalette, var: '--bg-color' },
        { id: 'grid-outline', colors: outlinePalette, var: '--outline-color' }
    ];
    list.forEach(item => {
        const container = document.getElementById(item.id);
        if(!container) return;
        item.colors.forEach(color => {
            const dot = document.createElement('div');
            dot.className = 'color-dot';
            dot.style.backgroundColor = color;
            dot.onclick = () => {
                document.documentElement.style.setProperty(item.var, color);
                container.querySelectorAll('.color-dot').forEach(d => d.classList.remove('active'));
                dot.classList.add('active');
                saveTheme();
            };
            container.appendChild(dot);
        });
    });
    generatePresets();
}

function generatePresets() {
    const container = document.getElementById('grid-presets');
    if(!container) return;
    presets.forEach(p => {
        const btn = document.createElement('div');
        btn.className = 'preset-btn';
        btn.style.backgroundColor = p.accent;
        btn.onclick = () => {
            document.documentElement.style.setProperty('--bg-color', p.bg);
            document.documentElement.style.setProperty('--accent', p.accent);
            document.documentElement.style.setProperty('--outline-color', p.outline);
            document.querySelectorAll('.color-dot').forEach(d => d.classList.remove('active'));
            saveTheme();
        };
        container.appendChild(btn);
    });
}

function saveTheme() {
    const theme = {
        '--accent': document.documentElement.style.getPropertyValue('--accent'),
        '--bg-color': document.documentElement.style.getPropertyValue('--bg-color'),
        '--outline-color': document.documentElement.style.getPropertyValue('--outline-color'),
        '--text': document.documentElement.style.getPropertyValue('--text') || '#f1f5f9'
    };
    localStorage.setItem('memoryMasterTheme', JSON.stringify(theme));
}

function loadSavedTheme() {
    const saved = JSON.parse(localStorage.getItem('memoryMasterTheme'));
    if(saved) Object.entries(saved).forEach(([k,v]) => document.documentElement.style.setProperty(k,v));
}

function setupThemeListeners() {
    const tp = document.getElementById('theme-panel');
    const resetBtn = document.querySelector('.reset-theme');
    if (resetBtn) resetBtn.onclick = resetTheme;

    document.getElementById('theme-toggle').onclick = (e) => {
        e.stopPropagation();
        const wasOpen = tp.classList.contains('open');
        closeAllPanels();
        if(!wasOpen) tp.classList.add('open');
    };
}

/**
 * 6. WALLPAPER E EFEITOS (VERSÃO OTIMIZADA MOBILE + PC)
 */
function initWallpaperLogic() {
    const wpFiles = ['background/wpp1.jpg', 'background/wpp2.jpg', 'background/wpp3.jpg', 'background/wpp4.jpg', 'background/wpp5.jpg', 'background/wpp6.jpg'];
    const wpPanel = document.getElementById('wallpaper-panel');
    const wpBackground = document.getElementById('wallpaper-background');
    const wpGrid = document.getElementById('wallpaper-options');

    // Gerar opções de Wallpaper
    wpFiles.forEach(path => {
        const div = document.createElement('div');
        div.className = 'wp-option';
        div.style.backgroundImage = `url(${path})`;
        div.onclick = (e) => {
            e.stopPropagation();
            selectedWP = path;
            wpBackground.style.backgroundImage = `url(${path})`;
            wpBackground.style.opacity = '1';
            document.querySelectorAll('.wp-option').forEach(opt => opt.classList.remove('active'));
            div.classList.add('active');
            localStorage.setItem('selectedWallpaper', path);
        };
        wpGrid.appendChild(div);
    });

    // Função interna para lidar com o Parallax (Giroscópio ou Mouse)
    const handleParallax = (e) => {
        if (!parallaxEnabled || !selectedWP) return;

        let moveX = 0;
        let moveY = 0;

        // Lógica para Mobile (Giroscópio)
        if (e.type === 'deviceorientation') {
            // Gamma: inclinação lateral | Beta: inclinação frente/trás
            moveX = e.gamma / 1.5; 
            moveY = (e.beta - 45) / 1.5; // Compensação de 45° (ângulo natural de segurar o celular)
        } 
        // Lógica para PC (Mouse)
        else if (e.type === 'mousemove') {
            moveX = (window.innerWidth / 2 - e.pageX) / 40;
            moveY = (window.innerHeight / 2 - e.pageY) / 40;
        }

        wpBackground.style.transform = `translate(${moveX}px, ${moveY}px)`;
    };

    // Configurar Ativação/Desativação do modo Parallax
    const setMode = (isParallax) => {
        parallaxEnabled = isParallax;
        localStorage.setItem('parallaxEnabled', isParallax);
        document.getElementById('btn-static')?.classList.toggle('active', !isParallax);
        document.getElementById('btn-parallax')?.classList.toggle('active', isParallax);
        
        // Remove listeners antigos antes de aplicar novos
        window.removeEventListener('mousemove', handleParallax);
        window.removeEventListener('deviceorientation', handleParallax);

        if (!isParallax) {
            wpBackground.style.transform = 'translate(0,0)';
        } else {
            // Verifica se é mobile para usar giroscópio
            if (window.DeviceOrientationEvent && 'ontouchstart' in window) {
                // Solicitação de permissão específica para iOS 13+
                if (typeof DeviceOrientationEvent.requestPermission === 'function') {
                    DeviceOrientationEvent.requestPermission()
                        .then(response => { if (response == 'granted') window.addEventListener('deviceorientation', handleParallax); })
                        .catch(console.error);
                } else {
                    window.addEventListener('deviceorientation', handleParallax);
                }
            } else {
                // Caso contrário, usa o mouse (PC)
                window.addEventListener('mousemove', handleParallax);
            }
        }
    };

    // Listeners de UI
    document.getElementById('btn-static').onclick = () => setMode(false);
    document.getElementById('btn-parallax').onclick = () => setMode(true);
    
    document.getElementById('wallpaper-toggle').onclick = (e) => {
        e.stopPropagation();
        const wasOpen = wpPanel.classList.contains('open');
        closeAllPanels();
        if(!wasOpen) wpPanel.classList.add('open');
    };

    document.querySelector('.reset-wallpaper').onclick = () => {
        selectedWP = null;
        wpBackground.style.opacity = '0';
        wpBackground.style.backgroundImage = 'none';
        document.querySelectorAll('.wp-option').forEach(opt => opt.classList.remove('active'));
        localStorage.removeItem('selectedWallpaper');
        window.removeEventListener('mousemove', handleParallax);
        window.removeEventListener('deviceorientation', handleParallax);
    };

    // Ajuste automático ao girar o aparelho (Horizontal/Vertical)
    window.addEventListener('orientationchange', () => {
        setTimeout(() => {
            wpBackground.style.transform = 'translate(0,0)';
        }, 200);
    });

    // Carregamento Inicial
    const savedWP = localStorage.getItem('selectedWallpaper');
    if(savedWP) { 
        selectedWP = savedWP; 
        wpBackground.style.backgroundImage = `url(${savedWP})`; 
        wpBackground.style.opacity = '1'; 
    }
    
    // Inicia o modo salvo (Parallax ou Estático)
    setMode(localStorage.getItem('parallaxEnabled') === 'true');
}

/**
 * 7. PLAYER DE MÚSICA
 */
const openings = [
    { name: "Skyward Oath", src: "musicas/opening/opening1.mp3" },
    { name: "Ashes of Eldoria", src: "musicas/opening/opening2.mp3" },
    { name: "Moonlit", src: "musicas/opening/opening3.mp3" },
    { name: "The Moon", src: "musicas/opening/opening4.mp3" },
    { name: "Overall", src: "musicas/opening/opening5.mp3" },
    { name: "Skyforge Over Cliffs", src: "musicas/opening/opening6.mp3" },
    { name: "Dragonfall", src: "musicas/opening/opening7.mp3" },
    { name: "Map of Skyfire", src: "musicas/opening/opening8.mp3" },
    { name: "Overture", src: "musicas/opening/opening9.mp3" },
    { name: "Dragon Gate", src: "musicas/opening/opening10.mp3" }
];

const endings = [
    { name: "Anytime Anywhere (Frieren)", src: "musicas/ending/ending1.mp3" },
    { name: "Akuma no Ko (Attack on Titan)", src: "musicas/ending/ending2.mp3" },
    { name: "Lost in Paradise (Jujutsu)", src: "musicas/ending/ending3.mp3" },
    { name: "Wind (Naruto)", src: "musicas/ending/ending4.mp3" },
    { name: "Orange (Haikyuu!!)", src: "musicas/ending/ending5.mp3" },
    { name: "Moonwater Motif", src: "musicas/ending/ending6.mp3" },
    { name: "Greenwood Oath", src: "musicas/ending/ending7.mp3" },
    { name: "Pale Harp Morning", src: "musicas/ending/ending8.mp3" },
    { name: "Mist Veil Highlands", src: "musicas/ending/ending9.mp3" },
    { name: "Stone of Dusk", src: "musicas/ending/ending10.mp3" }
];

let currentCategory = 'opening', currentTrackIndex = 0, isPlaying = false, isLooping = false;
const audio = document.getElementById('main-audio');

function setupPlayerListeners() {
    const mp = document.getElementById('music-panel');
    const sBtn = document.getElementById('shuffle-btn');
    const lBtn = document.getElementById('loop-btn');
    const audio = document.getElementById('main-audio');

    // Toggle do painel
    document.getElementById('player-toggle').onclick = (e) => {
        e.stopPropagation();
        const wasShow = mp.classList.contains('show');
        closeAllPanels();
        if(!wasShow) mp.classList.add('show');
    };

    // Lógica do Shuffle
    sBtn.onclick = function(e) {
        e.stopPropagation();
        isShuffle = !isShuffle;
        
        if(isShuffle) {
            isLooping = false;
            audio.loop = false;
            lBtn.classList.remove('active');
            lBtn.querySelector('.status').innerText = 'OFF';
            createShuffleQueue();
        }
        
        this.classList.toggle('active', isShuffle);
        this.querySelector('.status').innerText = isShuffle ? 'ON' : 'OFF';
    };

    // Lógica do Loop
    lBtn.onclick = function(e) {
        e.stopPropagation();
        isLooping = !isLooping;
        
        if(isLooping) {
            isShuffle = false;
            sBtn.classList.remove('active');
            sBtn.querySelector('.status').innerText = 'OFF';
        }
        
        audio.loop = isLooping;
        this.classList.toggle('active', isLooping);
        this.querySelector('.status').innerText = isLooping ? 'ON' : 'OFF';
    };

    document.getElementById('play-pause-btn').onclick = togglePlay;
    document.getElementById('next-btn').onclick = nextTrack;
    document.getElementById('prev-btn').onclick = prevTrack;
    document.getElementById('volume-slider').oninput = (e) => audio.volume = e.target.value;
    
    document.getElementById('mute-btn').onclick = function(e) {
        e.stopPropagation();
        audio.muted = !audio.muted;
        this.innerText = audio.muted ? '🔇' : '🔊';
    };
    audio.onended = () => { if(!isLooping) nextTrack(); };
}

function createShuffleQueue() {
    const allTracks = [];
    openings.forEach((s, i) => allTracks.push({cat: 'opening', index: i}));
    endings.forEach((s, i) => allTracks.push({cat: 'ending', index: i}));
    
    for (let i = allTracks.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allTracks[i], allTracks[j]] = [allTracks[j], allTracks[i]];
    }
    shuffleQueue = allTracks;
}

function loadPlaylist() {
    const list = document.getElementById('track-list');
    list.innerHTML = '';
    const songs = (currentCategory === 'opening') ? openings : endings;
    const currentAudioSrc = audio.src ? audio.src.split('/').pop() : "";

    songs.forEach((s, i) => {
        const li = document.createElement('li');
        li.innerText = s.name;
        const songFileName = s.src.split('/').pop();
        if (currentAudioSrc === songFileName) {
            li.classList.add('playing');
        }
        
        li.onclick = (e) => {
            e.stopPropagation();
            playTrack(i);
        };
        list.appendChild(li);
    });
}

function switchTab(cat) {
    currentCategory = cat;
    if (window.event) window.event.stopPropagation();

    document.querySelectorAll('.tab-btn').forEach(btn => {
        if (btn.getAttribute('onclick').includes(cat)) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    loadPlaylist();
}

function playTrack(i) {
    const songs = (currentCategory === 'opening') ? openings : endings;
    currentTrackIndex = i;
    
    audio.src = songs[i].src;
    document.getElementById('track-name').innerText = songs[i].name;
    audio.play();
    isPlaying = true;
    updateUI();
}

function togglePlay() {
    if(!audio.src) { playTrack(0); return; }
    audio.paused ? audio.play() : audio.pause();
    isPlaying = !audio.paused;
    updateUI();
}

function nextTrack() {
    if (isShuffle) {
        if (shuffleQueue.length === 0) createShuffleQueue();
        
        let next = shuffleQueue.shift();
        if (next.cat === currentCategory && next.index === currentTrackIndex && shuffleQueue.length > 0) {
            shuffleQueue.push(next);
            next = shuffleQueue.shift();
        }
        
        currentCategory = next.cat;
        currentTrackIndex = next.index;
        updateTabsUI();
    } else {
        // Ajustado para 10 músicas
        currentTrackIndex = (currentTrackIndex + 1) % 10;
    }
    playTrack(currentTrackIndex);
}

function prevTrack() {
    // Ajustado para 10 músicas
    currentTrackIndex = (currentTrackIndex - 1 + 10) % 10;
    playTrack(currentTrackIndex);
}

function updateUI() {
    document.getElementById('play-pause-btn').innerText = isPlaying ? '⏸' : '▶';
    loadPlaylist();
}

function updateTabsUI() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        if (btn.getAttribute('onclick').includes(currentCategory)) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

/**
 * 8. SIDEBAR E FAB
 */
function initSidebarLogic() {
    const fab = document.getElementById('fab-main'), sidebar = document.getElementById('sidebar-tools');
    let idleTimer;

    const startIdle = () => {
        clearTimeout(idleTimer);
        if (sidebar.classList.contains('open') || !document.getElementById('game-screen').classList.contains('active')) return;
        idleTimer = setTimeout(() => fab.classList.add('minimized'), 3000);
    };

    fab.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = sidebar.classList.toggle('open');
        fab.classList.toggle('active');
        if(!isOpen) { closeAllPanels(); startIdle(); } 
        else { fab.classList.remove('minimized'); }
    });

    document.addEventListener('click', (e) => {
        const wp = document.getElementById('wallpaper-panel');
        const th = document.getElementById('theme-panel');
        const mu = document.getElementById('music-panel');
        
        if (!sidebar.contains(e.target) && !fab.contains(e.target) && 
            (!wp || !wp.contains(e.target)) && (!th || !th.contains(e.target)) && (!mu || !mu.contains(e.target))) {
            sidebar.classList.remove('open');
            fab.classList.remove('active');
            closeAllPanels();
            startIdle();
        }
    });

    startIdle();
}

/**
 * Navegação de volta para a tela de Seleção de Modos
 */
function voltarParaSelecao() {

   window.location.href = "../index.html";
}