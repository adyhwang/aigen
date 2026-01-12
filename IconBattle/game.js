let currentUploadPlayer = null;
let currentSearchPlayer = null;
let iconIdCounter = 0;
let battleIcons = {
    player1: [],
    player2: []
};
let battleStats = {
    player1: { kills: 0 },
    player2: { kills: 0 }
};

let battleInfoDragging = false;
let battleInfoOffset = { x: 0, y: 0 };
let victorySoundPlayed = false;

let autoAddRandomEnabled = false;
let autoDeployEnabled = false;
let autoDeployTimer = null;
let lastPlayerDefeated = null;

let formationPositions = [];

let gamePaused = false;
let gameSpeed = 1;
const gameSpeeds = [1, 1.5, 2, 3, 4, 5];

const MAX_BATTLE_INFO_ITEMS = 500;

const audioContext = new (window.AudioContext || window.webkitAudioContext)();

function playSound(type) {
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    switch(type) {
        case 'attack':
            oscillator.type = 'square';
            oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.1);
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.1);
            break;
            
        case 'hit':
            oscillator.type = 'sawtooth';
            oscillator.frequency.setValueAtTime(150, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(50, audioContext.currentTime + 0.15);
            gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.15);
            break;
            
        case 'kill':
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.1);
            oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.3);
            gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.3);
            break;
            
        case 'death':
            oscillator.type = 'triangle';
            oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(50, audioContext.currentTime + 0.5);
            gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.5);
            break;
            
        case 'dodge':
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.1);
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.1);
            break;
            
        case 'cooldown':
            oscillator.type = 'square';
            oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.2);
            gainNode.gain.setValueAtTime(0.08, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.2);
            break;
            
        case 'explosion':
            oscillator.type = 'sawtooth';
            oscillator.frequency.setValueAtTime(100, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(30, audioContext.currentTime + 0.3);
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.3);
            break;
            
        case 'lightning':
            oscillator.type = 'sawtooth';
            oscillator.frequency.setValueAtTime(2000, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.15);
            oscillator.frequency.setValueAtTime(1500, audioContext.currentTime + 0.2);
            oscillator.frequency.exponentialRampToValueAtTime(50, audioContext.currentTime + 0.35);
            gainNode.gain.setValueAtTime(0.25, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.35);
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.35);
            break;
            
        case 'fire':
            oscillator.type = 'sawtooth';
            oscillator.frequency.setValueAtTime(80, audioContext.currentTime);
            oscillator.frequency.setValueAtTime(120, audioContext.currentTime + 0.1);
            oscillator.frequency.setValueAtTime(90, audioContext.currentTime + 0.2);
            oscillator.frequency.setValueAtTime(110, audioContext.currentTime + 0.3);
            oscillator.frequency.exponentialRampToValueAtTime(60, audioContext.currentTime + 0.5);
            gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.5);
            break;
            
        case 'victory':
            const victoryOsc = audioContext.createOscillator();
            const victoryGain = audioContext.createGain();
            victoryOsc.connect(victoryGain);
            victoryGain.connect(audioContext.destination);
            
            victoryOsc.type = 'sine';
            victoryOsc.frequency.setValueAtTime(523.25, audioContext.currentTime);
            victoryOsc.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.15);
            victoryOsc.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.3);
            victoryOsc.frequency.setValueAtTime(1046.50, audioContext.currentTime + 0.45);
            
            victoryGain.gain.setValueAtTime(0.15, audioContext.currentTime);
            victoryGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.6);
            
            victoryOsc.start();
            victoryOsc.stop(audioContext.currentTime + 0.6);
            break;
            
        case 'heal':
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(659.25, audioContext.currentTime + 0.2);
            oscillator.frequency.exponentialRampToValueAtTime(783.99, audioContext.currentTime + 0.4);
            gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.4);
            break;
            
        case 'ice':
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.2);
            oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.4);
            gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.5);
            break;
            
        case 'buff':
            oscillator.type = 'square';
            oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.1);
            oscillator.frequency.exponentialRampToValueAtTime(900, audioContext.currentTime + 0.2);
            gainNode.gain.setValueAtTime(0.12, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.3);
            break;
    }
}



const weapons = [
    { emoji: '⚔️', name: '剑', attack: 10, type: 'melee', range: 100, attackSpeed: 500, maxCharges: 999, cooldownTime: 0, defaultDirection: 'top', effectType: 'slash' },
    { emoji: '🗡️', name: '匕首', attack: 8, type: 'melee', range: 80, attackSpeed: 400, maxCharges: 999, cooldownTime: 0, defaultDirection: 'right', effectType: 'stab' },
    { emoji: '🪓', name: '斧头', attack: 15, type: 'melee', range: 90, attackSpeed: 750, maxCharges: 999, cooldownTime: 0, defaultDirection: 'left', effectType: 'chop' },
    { emoji: '🔨', name: '锤子', attack: 18, type: 'melee', range: 70, attackSpeed: 850, maxCharges: 999, cooldownTime: 0, defaultDirection: 'left', effectType: 'smash' },
    { emoji: '🔱', name: '三叉戟', attack: 12, type: 'melee', range: 110, attackSpeed: 600, maxCharges: 999, cooldownTime: 0, defaultDirection: 'top', effectType: 'pierce' },
    { emoji: '⛏️', name: '镐子', attack: 9, type: 'melee', range: 75, attackSpeed: 650, maxCharges: 999, cooldownTime: 0, defaultDirection: 'left', effectType: 'dig' },
    { emoji: '🧱', name: '砖头', attack: 14, type: 'melee', range: 85, attackSpeed: 700, maxCharges: 999, cooldownTime: 0, defaultDirection: 'right', effectType: 'smash' },
    { emoji: '🦴', name: '骨棒', attack: 11, type: 'melee', range: 95, attackSpeed: 600, maxCharges: 999, cooldownTime: 0, defaultDirection: 'top', effectType: 'stab' },
    { emoji: '🔪', name: '菜刀', attack: 13, type: 'melee', range: 80, attackSpeed: 500, maxCharges: 999, cooldownTime: 0, defaultDirection: 'right', effectType: 'slash' },
    { emoji: '🏏', name: '板球拍', attack: 12, type: 'melee', range: 100, attackSpeed: 650, maxCharges: 999, cooldownTime: 0, defaultDirection: 'left', effectType: 'smash' },
    { emoji: '🏹', name: '弓箭', attack: 7, type: 'ranged', range: 300, attackSpeed: 700, maxCharges: 1, cooldownTime: 1000, defaultDirection: 'right', effectType: 'arrow' },
    { emoji: '🔫', name: '枪', attack: 20, type: 'ranged', range: 350, attackSpeed: 550, maxCharges: 6, cooldownTime: 3000, defaultDirection: 'left', effectType: 'bullet' },
    { emoji: '🏐', name: '排球', attack: 7, type: 'ranged', range: 280, attackSpeed: 600, maxCharges: 3, cooldownTime: 1500, defaultDirection: 'right', knockbackDistance: 40, effectType: 'arrow' },
    { emoji: '💣', name: '炸弹', attack: 25, type: 'aoe', range: 200, attackSpeed: 1000, maxCharges: 3, cooldownTime: 2000, defaultDirection: 'right', aoeRadius: 150, effectType: 'explosion' },
    { emoji: '⚡', name: '闪电', attack: 30, type: 'ranged', range: 250, attackSpeed: 800, maxCharges: 2, cooldownTime: 3000, defaultDirection: 'top', ignoreDefense: true, effectType: 'lightning' },
    { emoji: '🔥', name: '火', attack: 15, type: 'ranged', range: 180, attackSpeed: 500, maxCharges: 2, cooldownTime: 4000, defaultDirection: 'top', burnDuration: 5000, burnInterval: 500, effectType: 'fire' },
    { emoji: '🧊', name: '冰冻', attack: 7, type: 'aoe', range: 220, attackSpeed: 900, maxCharges: 1, cooldownTime: 2500, defaultDirection: 'right', aoeRadius: 120, freezeDuration: 1500, effectType: 'ice' },
    { emoji: '🍼', name: '奶瓶', heal: 18, type: 'heal', range: 200, attackSpeed: 1200, maxCharges: 4, cooldownTime: 2000, defaultDirection: 'top', effectType: 'heal' },
    { emoji: '💊', name: '药丸', heal: 25, type: 'heal', range: 150, attackSpeed: 1000, maxCharges: 3, cooldownTime: 3000, defaultDirection: 'top', effectType: 'heal' },
    { emoji: '💉', name: '兴奋剂', attack: 0, type: 'buff', range: 150, attackSpeed: 800, maxCharges: 1, cooldownTime: 3000, defaultDirection: 'top', buffDuration: 3000, buffMultiplier: 2.8, effectType: 'buff' }
];

function generateRandomStats() {
    return {
        health: Math.floor(Math.random() * 50) + 100,
        maxHealth: 0,
        attack: Math.floor(Math.random() * 20) + 10,
        defense: Math.floor(Math.random() * 10) + 5,
        armor: Math.floor(Math.random() * 5) + 1,
        speed: Math.floor(Math.random() * 3) + 1
    };
}

function triggerUpload(player) {
    currentUploadPlayer = player;
    document.getElementById('fileInput').click();
}

function handleFileSelect(event) {
    const files = event.target.files;
    if (files.length > 0 && currentUploadPlayer) {
        Array.from(files).forEach(file => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const name = file.name.replace(/\.[^/.]+$/, '');
                    addIconToReadyZone(currentUploadPlayer, e.target.result, name);
                };
                reader.readAsDataURL(file);
            }
        });
    }
    event.target.value = '';
}

function handleDrop(event, player) {
    event.preventDefault();
    event.stopPropagation();
    
    const readyContent = document.getElementById(`player${player}ReadyContent`);
    readyContent.classList.remove('drag-over');
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
        Array.from(files).forEach(file => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const name = file.name.replace(/\.[^/.]+$/, '');
                    addIconToReadyZone(player, e.target.result, name);
                };
                reader.readAsDataURL(file);
            }
        });
    }
}

function handleDragOver(event) {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.classList.add('drag-over');
}

function handleDragLeave(event) {
    event.currentTarget.classList.remove('drag-over');
}

function addIconToReadyZone(player, imageUrl, name = '') {
    const readyContent = document.getElementById(`player${player}ReadyContent`);
    const dropHint = readyContent.querySelector('.drop-hint');
    if (dropHint) {
        dropHint.style.display = 'none';
    }
    
    const iconItem = document.createElement('div');
    iconItem.className = 'icon-item';
    iconItem.draggable = true;
    iconItem.dataset.player = player;
    iconItem.dataset.iconId = iconIdCounter++;
    iconItem.dataset.name = name;
    
    const img = document.createElement('img');
    img.src = imageUrl;
    iconItem.appendChild(img);
    
    iconItem.addEventListener('dragstart', handleIconDragStart);
    iconItem.addEventListener('dragend', handleIconDragEnd);
    
    iconItem.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const rect = iconItem.getBoundingClientRect();
        
        const clone = iconItem.cloneNode(true);
        clone.style.position = 'fixed';
        clone.style.left = `${rect.left}px`;
        clone.style.top = `${rect.top}px`;
        clone.style.width = `${rect.width}px`;
        clone.style.height = `${rect.height}px`;
        clone.style.zIndex = '9999';
        clone.style.opacity = '0.8';
        clone.style.pointerEvents = 'none';
        clone.id = 'touch-drag-clone';
        document.body.appendChild(clone);
        
        const offsetX = touch.clientX - rect.left;
        const offsetY = touch.clientY - rect.top;
        
        function onTouchMove(e) {
            e.preventDefault();
            const touch = e.touches[0];
            clone.style.left = `${touch.clientX - offsetX}px`;
            clone.style.top = `${touch.clientY - offsetY}px`;
        }
        
        function onTouchEnd(e) {
            e.preventDefault();
            const touch = e.changedTouches[0];
            const battleArea = document.getElementById('battleArea');
            const battleRect = battleArea.getBoundingClientRect();
            
            if (touch.clientX >= battleRect.left && touch.clientX <= battleRect.right &&
                touch.clientY >= battleRect.top && touch.clientY <= battleRect.bottom) {
                const x = touch.clientX - battleRect.left - 40;
                const y = touch.clientY - battleRect.top - 40;
                
                const battleIcon = createBattleIcon(imageUrl, player, x, y, name);
                battleArea.appendChild(battleIcon);
                
                updateBattleStats();
                
                iconItem.remove();
            }
            
            clone.remove();
            document.removeEventListener('touchmove', onTouchMove);
            document.removeEventListener('touchend', onTouchEnd);
        }
        
        document.addEventListener('touchmove', onTouchMove, { passive: false });
        document.addEventListener('touchend', onTouchEnd);
    });
    
    readyContent.appendChild(iconItem);
}

function addRandomIcons(player, count = 7) {
    const indices = Array.from({ length: defaultIcons.length }, (_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    const selectedIndices = indices.slice(0, count);
    selectedIndices.forEach(index => {
        const iconData = defaultIcons[index];
        addIconToReadyZone(player, iconData.icon, iconData.name);
    });
}

function handleIconDragStart(event) {
    const iconItem = event.currentTarget;
    event.dataTransfer.setData('text/plain', iconItem.dataset.iconId);
    event.dataTransfer.setData('player', iconItem.dataset.player);
    event.dataTransfer.setData('imageUrl', iconItem.querySelector('img').src);
    iconItem.classList.add('dragging');
}

function handleIconDragEnd(event) {
    event.currentTarget.classList.remove('dragging');
}

function openSearchModal(player) {
    currentSearchPlayer = player;
    const modal = document.getElementById('searchModal');
    modal.classList.add('active');
    document.getElementById('searchInput').value = '';
    document.getElementById('onlineSearch').checked = false;
    displayDefaultIcons();
    document.getElementById('searchInput').focus();
}

function closeSearchModal() {
    const modal = document.getElementById('searchModal');
    modal.classList.remove('active');
    currentSearchPlayer = null;
}

function handleOnlineSearchChange() {
    const searchQuery = document.getElementById('searchInput').value.trim();
    if (searchQuery) {
        searchIcons();
    } else {
        const onlineSearch = document.getElementById('onlineSearch').checked;
        if (onlineSearch) {
            searchIcons();
        } else {
            displayDefaultIcons();
        }
    }
}

function displayDefaultIcons() {
    const resultsContainer = document.getElementById('searchResults');
    resultsContainer.innerHTML = '';
    
    defaultIcons.forEach(icon => {
        const resultItem = document.createElement('div');
        resultItem.className = 'search-result-item';
        resultItem.title = icon.name;
        
        const img = document.createElement('img');
        img.src = icon.icon;
        resultItem.appendChild(img);
        
        const label = document.createElement('div');
        label.className = 'search-result-label';
        label.textContent = icon.name;
        resultItem.appendChild(label);
        
        resultItem.addEventListener('click', () => {
            addIconToReadyZone(currentSearchPlayer, icon.icon, icon.name);
            showBubbleTooltip(resultItem, '已添加到待命区域');
        });
        
        resultsContainer.appendChild(resultItem);
    });
}

function handleSearchKeyPress(event) {
    if (event.key === 'Enter') {
        searchIcons();
    }
}

async function searchIcons() {
    const searchQuery = document.getElementById('searchInput').value.trim();
    const onlineSearch = document.getElementById('onlineSearch').checked;
    
    const resultsContainer = document.getElementById('searchResults');
    
    if (!searchQuery) {
        if (!onlineSearch) {
            displayDefaultIcons();
            return;
        }
        resultsContainer.innerHTML = '<div class="no-results">请输入关键词搜索</div>';
        return;
    }
    
    resultsContainer.innerHTML = '<div class="loading">搜索中...</div>';
    
    let results = [];
    
    if (!onlineSearch) {
        const matchedDefaultIcons = defaultIcons.filter(icon => 
            icon.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
        
        matchedDefaultIcons.forEach(icon => {
            results.push({
                type: 'default',
                name: icon.name,
                iconUrl: icon.icon,
                source: 'default'
            });
        });
    }
    
    if (onlineSearch) {
        try {
            const apiUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(searchQuery)}&country=cn&entity=software&limit=18`;                        
            const response = await fetch(apiUrl);
            const data = await response.json();
            console.log('iTunes Search API响应:', data);
            
            if (data.results && data.results.length > 0) {
                data.results.slice(0, 18).forEach(item => {
                    const trackName = item.trackName || 'Unknown';
                    const spaceIndex = trackName.indexOf(' ');
                    const dashIndex = trackName.indexOf('-');
                    let name = trackName;
                    
                    if (spaceIndex !== -1 || dashIndex !== -1) {
                        const splitIndex = spaceIndex !== -1 && dashIndex !== -1 
                            ? Math.min(spaceIndex, dashIndex) 
                            : (spaceIndex !== -1 ? spaceIndex : dashIndex);
                        name = trackName.substring(0, splitIndex);
                    }
                    
                    results.push({
                        type: 'itunes',
                        name: name,
                        iconUrl: item.artworkUrl512,
                        source: 'itunes'
                    });
                });
            }
        } catch (error) {
            console.error('获取iTunes API数据失败:', error);
        }
    }
    
    resultsContainer.innerHTML = '';
    
    if (results.length > 0) {
        results.forEach(result => {
            const resultItem = document.createElement('div');
            resultItem.className = 'search-result-item';
            resultItem.title = result.name;
            
            const img = document.createElement('img');
            img.src = result.iconUrl;
            resultItem.appendChild(img);
            
            const label = document.createElement('div');
            label.className = 'search-result-label';
            label.textContent = result.name;
            resultItem.appendChild(label);
            
            resultItem.addEventListener('click', () => {
                addIconToReadyZone(currentSearchPlayer, result.iconUrl, result.name);
                showBubbleTooltip(resultItem, '已添加到待命区域');
            });
            
            resultsContainer.appendChild(resultItem);
        });
    } else {
        resultsContainer.innerHTML = '<div class="no-results">未找到相关图标</div>';
    }
}

function showBubbleTooltip(element, message) {
    const rect = element.getBoundingClientRect();
    
    const bubble = document.createElement('div');
    bubble.className = 'bubble-tooltip';
    bubble.textContent = message;
    bubble.style.left = `${rect.left + rect.width / 2}px`;
    bubble.style.top = `${rect.top - 40}px`;
    bubble.style.transform = 'translateX(-50%)';
    
    document.body.appendChild(bubble);
    
    setTimeout(() => {
        bubble.classList.add('fade-out');
        setTimeout(() => {
            bubble.remove();
        }, 300);
    }, 1500);
}

function createBattleIcon(iconUrl, player, x, y, name = '') {
    const stats = generateRandomStats();
    stats.maxHealth = stats.health;
    
    const battleIcon = document.createElement('div');
    battleIcon.className = `battle-icon player${player}`;
    battleIcon.style.left = `${x}px`;
    battleIcon.style.top = `${y}px`;
    battleIcon.dataset.player = player;
    battleIcon.dataset.iconId = iconIdCounter++;
    battleIcon.dataset.name = name;
    
    const healthBar = document.createElement('div');
    healthBar.className = 'health-bar';
    const healthBarFill = document.createElement('div');
    healthBarFill.className = 'health-bar-fill';
    healthBarFill.style.width = '100%';
    healthBar.appendChild(healthBarFill);
    battleIcon.appendChild(healthBar);
    
    const head = document.createElement('div');
    head.className = 'head';
    const headImg = document.createElement('img');
    headImg.src = iconUrl;
    head.appendChild(headImg);
    
    const levelBadge = document.createElement('div');
    levelBadge.className = 'level-badge level-1';
    levelBadge.textContent = '1';
    head.appendChild(levelBadge);
    
    battleIcon.appendChild(head);
    
    const bodyShapes = ['circle', 'ellipse', 'rectangle'];
    const bodyShape = bodyShapes[Math.floor(Math.random() * bodyShapes.length)];
    
    const body = document.createElement('div');
    body.className = `body ${bodyShape}`;
    battleIcon.appendChild(body);
    
    const armLeft = document.createElement('div');
    armLeft.className = 'arm left';
    battleIcon.appendChild(armLeft);
    
    const armRight = document.createElement('div');
    armRight.className = 'arm right';
    battleIcon.appendChild(armRight);
    
    const legLeft = document.createElement('div');
    legLeft.className = 'leg left';
    battleIcon.appendChild(legLeft);
    
    const legRight = document.createElement('div');
    legRight.className = 'leg right';
    battleIcon.appendChild(legRight);
    
    const weapon = document.createElement('div');
    weapon.className = 'weapon';
    const weaponData = weapons[Math.floor(Math.random() * weapons.length)];
    weapon.textContent = weaponData.emoji;
    weapon.dataset.defaultDirection = weaponData.defaultDirection;
    
    if (player === 1) {
        weapon.style.right = '-30px';
        weapon.style.left = 'auto';
    } else {
        weapon.style.left = '-30px';
        weapon.style.right = 'auto';
    }
    
    battleIcon.appendChild(weapon);
    
    const statsDisplay = document.createElement('div');
    statsDisplay.className = 'stats-display';
    statsDisplay.innerHTML = `ATK:${stats.attack} DEF:${stats.defense}`;
    battleIcon.appendChild(statsDisplay);
    
    const iconData = {
        element: battleIcon,
        stats: stats,
        player: player,
        x: x,
        y: y,
        targetX: x,
        targetY: y,
        isAttacking: false,
        isDead: false,
        hasBeenKilled: false,
        weapon: weaponData,
        currentCharges: weaponData.maxCharges,
        isOnCooldown: false,
        cooldownEndTime: 0,
        name: name,
        lastHealTime: 0,
        lastTarget: null,
        targetChangeTime: 0,
        isStunned: false,
        stunEndTime: 0,
        isFrozen: false,
        freezeEndTime: 0,
        isKnockedBack: false,
        knockbackTargetX: x,
        knockbackTargetY: y,
        isBuffed: false,
        buffEndTime: 0,
        originalStats: null,
        level: 1,
        killCount: 0
    };
    
    battleIcons[`player${player}`].push(iconData);
    
    const iconsList = document.getElementById(`player${player}IconsList`);
    const iconListItem = document.createElement('div');
    iconListItem.className = 'battle-icon-item';
    iconListItem.id = `icon-list-item-${iconIdCounter - 1}`;
    iconListItem.innerHTML = `
        <span class="icon-name">${name || '未知图标'}(Lv1)${weaponData.emoji}</span>
        <span class="icon-health">${stats.health}/${stats.maxHealth}</span>
    `;
    iconsList.appendChild(iconListItem);
    iconData.listItem = iconListItem;
    
    battleIcon.addEventListener('mousedown', (e) => {
        if (iconData.isDead) return;
        
        e.preventDefault();
        const startX = e.clientX;
        const startY = e.clientY;
        const initialX = iconData.x;
        const initialY = iconData.y;
        
        function onMouseMove(e) {
            const battleArea = document.getElementById('battleArea');
            const rect = battleArea.getBoundingClientRect();
            
            const newX = initialX + (e.clientX - startX);
            const newY = initialY + (e.clientY - startY);
            
            iconData.x = Math.max(50, Math.min(rect.width - 50, newX));
            iconData.y = Math.max(50, Math.min(rect.height - 50, newY));
            iconData.targetX = iconData.x;
            iconData.targetY = iconData.y;
            
            iconData.element.style.left = `${iconData.x}px`;
            iconData.element.style.top = `${iconData.y}px`;
        }
        
        function onMouseUp() {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        }
        
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    });
    
    battleIcon.addEventListener('touchstart', (e) => {
        if (iconData.isDead) return;
        
        e.preventDefault();
        const touch = e.touches[0];
        const startX = touch.clientX;
        const startY = touch.clientY;
        const initialX = iconData.x;
        const initialY = iconData.y;
        
        function onTouchMove(e) {
            e.preventDefault();
            const touch = e.touches[0];
            const battleArea = document.getElementById('battleArea');
            const rect = battleArea.getBoundingClientRect();
            
            const newX = initialX + (touch.clientX - startX);
            const newY = initialY + (touch.clientY - startY);
            
            iconData.x = Math.max(50, Math.min(rect.width - 50, newX));
            iconData.y = Math.max(50, Math.min(rect.height - 50, newY));
            iconData.targetX = iconData.x;
            iconData.targetY = iconData.y;
            
            iconData.element.style.left = `${iconData.x}px`;
            iconData.element.style.top = `${iconData.y}px`;
        }
        
        function onTouchEnd() {
            document.removeEventListener('touchmove', onTouchMove);
            document.removeEventListener('touchend', onTouchEnd);
        }
        
        document.addEventListener('touchmove', onTouchMove, { passive: false });
        document.addEventListener('touchend', onTouchEnd);
    });
    
    return battleIcon;
}

function checkLevelUp(iconData) {
    const killsPerLevel = 3;
    const maxLevel = 6;
    const statIncreasePercent = 0.3;
    
    if (iconData.killCount % killsPerLevel === 0 && iconData.level < maxLevel) {
        iconData.level++;
        
        const statMultiplier = 1 + statIncreasePercent;
        
        iconData.stats.attack = Math.round(iconData.stats.attack * statMultiplier);
        iconData.stats.defense = Math.round(iconData.stats.defense * statMultiplier);
        iconData.stats.speed = Math.round(iconData.stats.speed * statMultiplier);
        iconData.stats.maxHealth = Math.round(iconData.stats.maxHealth * statMultiplier * 1.1);
        iconData.stats.health = Math.round(iconData.stats.maxHealth * 0.3);
        
        const levelBadge = iconData.element.querySelector('.level-badge');
        if (levelBadge) {
            levelBadge.className = `level-badge level-${iconData.level}`;
            levelBadge.textContent = iconData.level;
        }
        
        if (iconData.listItem) {
            const nameSpan = iconData.listItem.querySelector('.icon-name');
            if (nameSpan) {
                const currentText = nameSpan.textContent;
                const match = currentText.match(/^(.+?)\(Lv\d+\)(.+)$/);
                if (match) {
                    const baseName = match[1];
                    const weaponEmoji = match[2];
                    nameSpan.textContent = `${baseName}(Lv${iconData.level})${weaponEmoji}`;
                }
            }
        }
        
        updateHealthBar(iconData);
        
        playSound('levelup');
        
        const levelUpText = document.createElement('div');
        levelUpText.className = 'levelup-text';
        levelUpText.textContent = `Lv${iconData.level}!`;
        iconData.element.appendChild(levelUpText);
        
        setTimeout(() => {
            levelUpText.remove();
        }, 1000);
    }
}

function updateHealthBar(iconData) {
    const healthBarFill = iconData.element.querySelector('.health-bar-fill');
    const healthPercent = (iconData.stats.health / iconData.stats.maxHealth) * 100;
    healthBarFill.style.width = `${Math.max(0, healthPercent)}%`;
    
    const statsDisplay = iconData.element.querySelector('.stats-display');
    statsDisplay.innerHTML = `ATK:${iconData.stats.attack} DEF:${iconData.stats.defense}`;
    
    if (iconData.listItem) {
        const healthText = iconData.listItem.querySelector('.icon-health');
        healthText.textContent = `${Math.max(0, iconData.stats.health)}/${iconData.stats.maxHealth}`;
    }
}

function showDamageText(iconData, damage, damageType = 'normal') {
    const damageText = document.createElement('div');
    damageText.className = 'damage-text';
    
    switch(damageType) {
        case 'slash':
            damageText.classList.add('slash-damage');
            break;
        case 'stab':
            damageText.classList.add('stab-damage');
            break;
        case 'chop':
            damageText.classList.add('chop-damage');
            break;
        case 'smash':
            damageText.classList.add('smash-damage');
            break;
        case 'pierce':
            damageText.classList.add('pierce-damage');
            break;
        case 'dig':
            damageText.classList.add('dig-damage');
            break;
        case 'arrow':
            damageText.classList.add('arrow-damage');
            break;
        case 'bullet':
            damageText.classList.add('bullet-damage');
            break;
        case 'lightning':
            damageText.classList.add('lightning-damage');
            break;
        case 'fire':
            damageText.classList.add('fire-damage');
            break;
        case 'explosion':
            damageText.classList.add('explosion-damage');
            break;
    }
    
    damageText.textContent = `-${damage}`;
    damageText.style.left = '50%';
    damageText.style.top = '0';
    damageText.style.transform = 'translateX(-50%)';
    iconData.element.appendChild(damageText);
    
    setTimeout(() => {
        damageText.remove();
    }, 1000);
}

function showHealText(iconData, healAmount) {
    const healText = document.createElement('div');
    healText.className = 'heal-text';
    healText.textContent = `+${healAmount}`;
    healText.style.left = '50%';
    healText.style.top = '0';
    healText.style.transform = 'translateX(-50%)';
    iconData.element.appendChild(healText);
    
    setTimeout(() => {
        healText.remove();
    }, 1000);
}

function addHealBattleInfo(attacker, target, healAmount) {
    const battleInfo = document.getElementById('battleInfo');
    const infoItem = document.createElement('div');
    infoItem.className = `battle-info-item player-${attacker.player}`;
    infoItem.dataset.player = attacker.player;
    infoItem.dataset.action = 'heal';
    
    const attackerName = attacker.name || '未知图标';
    const targetName = target.name || '未知图标';
    const attackerLevel = attacker.level || 1;
    const targetLevel = target.level || 1;
    infoItem.innerHTML = `<span class="heal-message">玩家${attacker.player}：<span class="attacker">${attackerName}(Lv${attackerLevel})</span><span class="weapon">${attacker.weapon.emoji || attacker.weapon.name}</span>治疗<span class="target">${targetName}(Lv${targetLevel})</span>，恢复 ${healAmount} 点生命</span>`;
    battleInfo.appendChild(infoItem);
    battleInfo.scrollTop = battleInfo.scrollHeight;
    
    while (battleInfo.children.length > MAX_BATTLE_INFO_ITEMS) {
        battleInfo.removeChild(battleInfo.firstChild);
    }
    
    applyFilters();
}

function showWeaponEffect(attacker, defender, effectType) {
    const battleArea = document.getElementById('battleArea');
    const effect = document.createElement('div');
    effect.className = 'weapon-effect';
    
    const centerX = (attacker.x + defender.x) / 2;
    const centerY = (attacker.y + defender.y) / 2;
    
    const effectX = defender.x + 40;
    const effectY = defender.y + 40;
    
    switch(effectType) {
        case 'slash':
            effect.classList.add('slash-effect');
            effect.style.left = `${effectX}px`;
            effect.style.top = `${effectY}px`;
            break;
        case 'stab':
            effect.classList.add('stab-effect');
            effect.style.left = `${effectX}px`;
            effect.style.top = `${effectY}px`;
            break;
        case 'chop':
            effect.classList.add('chop-effect');
            effect.style.left = `${effectX}px`;
            effect.style.top = `${effectY}px`;
            break;
        case 'smash':
            effect.classList.add('smash-effect');
            effect.style.left = `${effectX}px`;
            effect.style.top = `${effectY}px`;
            break;
        case 'pierce':
            effect.classList.add('pierce-effect');
            effect.style.left = `${effectX}px`;
            effect.style.top = `${effectY}px`;
            break;
        case 'dig':
            effect.classList.add('dig-effect');
            effect.style.left = `${effectX}px`;
            effect.style.top = `${effectY}px`;
            break;
        case 'arrow':
            effect.classList.add('arrow-effect');
            effect.style.left = `${effectX}px`;
            effect.style.top = `${effectY}px`;
            break;
        case 'bullet':
            effect.classList.add('bullet-effect');
            effect.style.left = `${effectX}px`;
            effect.style.top = `${effectY}px`;
            break;
        case 'lightning':
            effect.classList.add('lightning-single-effect');
            effect.style.left = `${effectX}px`;
            effect.style.top = `${effectY}px`;
            break;
        case 'fire':
            effect.classList.add('fire-single-effect');
            effect.style.left = `${effectX}px`;
            effect.style.top = `${effectY}px`;
            break;
        case 'heal':
            effect.classList.add('heal-effect');
            effect.style.left = `${effectX}px`;
            effect.style.top = `${effectY}px`;
            break;
        case 'buff':
            effect.classList.add('buff-effect');
            effect.style.left = `${effectX}px`;
            effect.style.top = `${effectY}px`;
            break;
        default:
            effect.classList.add('default-effect');
            effect.style.left = `${effectX}px`;
            effect.style.top = `${effectY}px`;
    }
    
    battleArea.appendChild(effect);
    
    setTimeout(() => {
        effect.remove();
    }, 500);
}

function addBattleInfo(attacker, defender, damage) {
    const battleInfo = document.getElementById('battleInfo');
    const infoItem = document.createElement('div');
    infoItem.className = 'battle-info-item';
    infoItem.dataset.player = attacker.player;
    infoItem.dataset.action = 'attack';
    
    const attackerName = attacker.name || '未知图标';
    const defenderName = defender.name || '未知图标';
    const weaponName = attacker.weapon.emoji || attacker.weapon.name;
    const attackerLevel = attacker.level || 1;
    const defenderLevel = defender.level || 1;
    
    if (damage === 0) {
        infoItem.innerHTML = `<span class="player">玩家${attacker.player}</span>：<span class="attacker">${attackerName}(Lv${attackerLevel})</span><span class="weapon">${weaponName}</span>攻击<span class="target">${defenderName}(Lv${defenderLevel})</span>，被闪避`;
    } else {
        infoItem.innerHTML = `<span class="player">玩家${attacker.player}</span>：<span class="attacker">${attackerName}(Lv${attackerLevel})</span><span class="weapon">${weaponName}</span>攻击<span class="target">${defenderName}(Lv${defenderLevel})</span>，伤害值 <span class="damage">${damage}</span>`;
    }
    
    battleInfo.appendChild(infoItem);
    battleInfo.scrollTop = battleInfo.scrollHeight;
    
    while (battleInfo.children.length > MAX_BATTLE_INFO_ITEMS) {
        battleInfo.removeChild(battleInfo.firstChild);
    }
    
    applyFilters();
}

function calculateDamage(attacker, defender) {
    const baseDamage = attacker.stats.attack + attacker.weapon.attack;
    const defense = defender.stats.defense;
    const armor = defender.stats.armor;
    const randomFactor = Math.random() * 0.4 + 0.8;
    
    const dodgeChance = defender.stats.speed * 0.03;
    const isDodged = Math.random() < dodgeChance;
    
    if (isDodged) {
        return 0;
    }
    
    const damage = Math.max(1, Math.floor((baseDamage - defense / 2) * randomFactor / armor));
    return damage;
}

function attack(attacker, defender) {
    if (attacker.isDead || attacker.isAttacking || attacker.isOnCooldown || attacker.isFrozen) return;
    
    if (attacker.weapon.type === 'heal') {
        if (defender && defender.isDead) return;
    } else {
        if (defender && defender.isDead) return;
    }
    
    attacker.isAttacking = true;
    attacker.element.classList.add('attacking');
    playSound('attack');
    
    const weapon = attacker.element.querySelector('.weapon');
    const defaultDirection = weapon.dataset.defaultDirection;
    
    let target = defender;
    
    if (attacker.weapon.type === 'heal') {
        if (!target || target.player !== attacker.player) {
            const allies = battleIcons[`player${attacker.player}`].filter(ally => !ally.isDead && ally !== attacker && ally.stats.health < ally.stats.maxHealth);
            
            if (allies.length > 0) {
                allies.sort((a, b) => (a.stats.health / a.stats.maxHealth) - (b.stats.health / b.stats.maxHealth));
                target = allies[0];
            }
            
            if (!target) {
                attacker.isAttacking = false;
                return;
            }
        }
    }
    
    const dx = target.x - attacker.x;
    
    if (dx > 0) {
        attacker.element.classList.remove('facing-left');
        attacker.element.classList.add('facing-right');
        
        weapon.style.right = '-30px';
        weapon.style.left = 'auto';
        
        if (defaultDirection === 'top') {
            weapon.style.transform = 'rotate(90deg)';
        } else if (defaultDirection === 'right') {
            weapon.style.transform = 'scaleX(1)';
        } else if (defaultDirection === 'left') {
            weapon.style.transform = 'scaleX(-1)';
        }
    } else if (dx < 0) {
        attacker.element.classList.remove('facing-right');
        attacker.element.classList.add('facing-left');
        
        weapon.style.left = '-30px';
        weapon.style.right = 'auto';
        
        if (defaultDirection === 'top') {
            weapon.style.transform = 'rotate(-90deg)';
        } else if (defaultDirection === 'right') {
            weapon.style.transform = 'scaleX(-1)';
        } else if (defaultDirection === 'left') {
            weapon.style.transform = 'scaleX(1)';
        }
    }
    
    setTimeout(() => {
        if (attacker.isDead || target.isDead) {
            attacker.isAttacking = false;
            return;
        }
        
        attacker.element.classList.remove('attacking');
        
        if (attacker.weapon.type === 'buff') {
            if (!target || target.player !== attacker.player) {
                const allies = battleIcons[`player${attacker.player}`].filter(ally => !ally.isDead && ally !== attacker && ally.weapon.type !== 'heal');
                
                if (allies.length > 0) {
                    allies.sort((a, b) => {
                        const statsA = a.stats.attack + a.stats.defense + a.stats.speed;
                        const statsB = b.stats.attack + b.stats.defense + b.stats.speed;
                        return statsB - statsA;
                    });
                    target = allies[0];
                }
                
                if (!target) {
                    const enemies = battleIcons[`player${attacker.player === 1 ? 2 : 1}`].filter(e => !e.isDead);
                    if (enemies.length > 0) {
                        enemies.sort((a, b) => {
                            const distA = Math.sqrt((a.x - attacker.x) ** 2 + (a.y - attacker.y) ** 2);
                            const distB = Math.sqrt((b.x - attacker.x) ** 2 + (b.y - attacker.y) ** 2);
                            return distA - distB;
                        });
                        target = enemies[0];
                    }
                }
                
                if (!target) {
                    attacker.isAttacking = false;
                    return;
                }
            }
            
            if (target.player === attacker.player) {
                applyBuff(attacker, target);
            } else {
                const damage = calculateDamage(attacker, target);
                addBattleInfo(attacker, target, damage);
                
                playSound('hit');
                target.stats.health -= damage;
                
                target.element.classList.add('hit');
                showDamageText(target, damage, 'normal');
                
                setTimeout(() => {
                    target.element.classList.remove('hit');
                }, 300);
                
                updateHealthBar(target);
                
                if (target.stats.health <= 0 && !target.hasBeenKilled) {
                    playSound('kill');
                    playSound('death');
                    target.isDead = true;
                    target.hasBeenKilled = true;
                    target.element.classList.add('dead');
                    target.element.classList.remove('moving');
                    target.element.classList.remove('attacking');
                    
                    if (target.listItem) {
                        target.listItem.classList.add('dead');
                        target.listItem.querySelector('.icon-health').textContent = `0/${target.stats.maxHealth}`;
                    }
                    
                    battleStats[`player${attacker.player}`].kills++;
                    updateBattleStats();
                }
            }
        } else if (attacker.weapon.type === 'heal') {
            if (target.player === attacker.player) {
                const healAmount = attacker.weapon.heal || 18;
                const actualHeal = Math.min(healAmount, target.stats.maxHealth - target.stats.health);
                
                if (actualHeal > 0) {
                    playSound('heal');
                    target.stats.health += actualHeal;
                    
                    target.element.classList.add('healed');
                    showHealText(target, actualHeal);
                    showWeaponEffect(attacker, target, attacker.weapon.effectType);
                    
                    setTimeout(() => {
                        target.element.classList.remove('healed');
                    }, 300);
                    
                    updateHealthBar(target);
                    
                    addHealBattleInfo(attacker, target, actualHeal);
                }
            } else {
                const baseDamage = attacker.stats.attack;
                const defense = target.stats.defense;
                const armor = target.stats.armor;
                const randomFactor = Math.random() * 0.4 + 0.8;
                
                const dodgeChance = target.stats.speed * 0.03;
                const isDodged = Math.random() < dodgeChance;
                
                const damage = isDodged ? 0 : Math.max(1, Math.floor((baseDamage - defense / 2) * randomFactor / armor));
                
                addBattleInfo(attacker, target, damage);
                
                if (damage === 0) {
                    playSound('dodge');
                    const dodgeText = document.createElement('div');
                    dodgeText.className = 'dodge-text';
                    dodgeText.textContent = '闪避!';
                    dodgeText.style.left = '50%';
                    dodgeText.style.top = '0';
                    dodgeText.style.transform = 'translateX(-50%)';
                    target.element.appendChild(dodgeText);
                    
                    setTimeout(() => {
                        dodgeText.remove();
                    }, 1000);
                } else {
                    playSound('hit');
                    target.stats.health -= damage;
                    
                    target.element.classList.add('hit');
                    showDamageText(target, damage, 'normal');
                    
                    setTimeout(() => {
                        target.element.classList.remove('hit');
                    }, 300);
                    
                    updateHealthBar(target);
                }
            }
        } else if (attacker.weapon.type === 'aoe') {
            applyAOEDamage(attacker, target);
        } else {
            const damage = attacker.weapon.ignoreDefense ? 
                Math.max(1, attacker.stats.attack + attacker.weapon.attack) :
                calculateDamage(attacker, target);
            
            addBattleInfo(attacker, target, damage);
            
            if (damage === 0) {
                playSound('dodge');
                const dodgeText = document.createElement('div');
                dodgeText.className = 'dodge-text';
                dodgeText.textContent = '闪避!';
                dodgeText.style.left = '50%';
                dodgeText.style.top = '0';
                dodgeText.style.transform = 'translateX(-50%)';
                target.element.appendChild(dodgeText);
                
                setTimeout(() => {
                    dodgeText.remove();
                }, 1000);
            } else {
                playSound('hit');
                target.stats.health -= damage;
                
                target.element.classList.add('hit');
                showDamageText(target, damage, attacker.weapon.effectType);
                showWeaponEffect(attacker, target, attacker.weapon.effectType);
                
                setTimeout(() => {
                    target.element.classList.remove('hit');
                }, 300);
                
                updateHealthBar(target);
                
                if (attacker.weapon.effectType === 'fire') {
                    applyBurnEffect(target, attacker, damage);
                }
                
                if (attacker.weapon.knockbackDistance) {
                    applyKnockback(attacker, target, attacker.weapon.knockbackDistance);
                }
            }
        }
        
        attacker.currentCharges--;
        
        if (attacker.currentCharges <= 0 && attacker.weapon.cooldownTime > 0) {
            playSound('cooldown');
            attacker.isOnCooldown = true;
            const actualCooldownTime = attacker.weapon.cooldownTime / gameSpeed;
            attacker.cooldownEndTime = Date.now() + actualCooldownTime;
            
            const cooldownText = document.createElement('div');
            cooldownText.className = 'cooldown-text';
            cooldownText.textContent = '冷却中!';
            cooldownText.style.left = '50%';
            cooldownText.style.top = '0';
            cooldownText.style.transform = 'translateX(-50%)';
            attacker.element.appendChild(cooldownText);
            
            setTimeout(() => {
                cooldownText.remove();
            }, 1000);
            
            setTimeout(() => {
                attacker.isOnCooldown = false;
                attacker.currentCharges = attacker.weapon.maxCharges;
            }, actualCooldownTime);
        }
        
        updateBattleStats();
        
        if (attacker.weapon.type !== 'heal' && target.stats.health <= 0 && !target.hasBeenKilled) {
            playSound('kill');
            playSound('death');
            target.isDead = true;
            target.hasBeenKilled = true;
            target.element.classList.add('dead');
            target.element.classList.remove('moving');
            target.element.classList.remove('attacking');
            
            if (target.listItem) {
                target.listItem.classList.add('dead');
                target.listItem.querySelector('.icon-health').textContent = `0/${target.stats.maxHealth}`;
            }
            
            battleStats[`player${attacker.player}`].kills++;
            updateBattleStats();
            
            attacker.killCount++;
            checkLevelUp(attacker);
            
            const attackerName = attacker.name || '未知图标';
            const targetName = target.name || '未知图标';
            const weaponName = attacker.weapon.emoji || attacker.weapon.name;
            const attackerLevel = attacker.level || 1;
            const targetLevel = target.level || 1;
            const battleInfo = document.getElementById('battleInfo');
            const infoItem = document.createElement('div');
            infoItem.className = 'battle-info-item';
            infoItem.dataset.player = attacker.player;
            infoItem.dataset.action = 'kill';
            infoItem.innerHTML = `<span class="kill-message">玩家${attacker.player}：<span class="attacker">${attackerName}(Lv${attackerLevel})</span><span class="weapon">${weaponName}</span>击杀了<span class="target">${targetName}(Lv${targetLevel})</span></span>`;
            battleInfo.appendChild(infoItem);
            battleInfo.scrollTop = battleInfo.scrollHeight;
            
            while (battleInfo.children.length > MAX_BATTLE_INFO_ITEMS) {
                battleInfo.removeChild(battleInfo.firstChild);
            }
            
            applyFilters();
            
            setTimeout(() => {
                removeBattleIcon(target);
            }, 5000);
        }
        
        attacker.isAttacking = false;
    }, attacker.weapon.attackSpeed / gameSpeed);
}

function applyAOEDamage(attacker, target) {
    const aoeRadius = attacker.weapon.aoeRadius || 150;
    const targetPlayer = attacker.player === 1 ? 2 : 1;
    const enemies = battleIcons[`player${targetPlayer}`];
    
    const explosionX = target.x;
    const explosionY = target.y;
    
    const attackerName = attacker.name || '未知图标';
    const attackerLevel = attacker.level || 1;
    const battleInfo = document.getElementById('battleInfo');
    
    if (attacker.weapon.emoji === '⚡') {
        playSound('lightning');
        showLightningEffect(explosionX, explosionY, aoeRadius);
        
        const infoItem = document.createElement('div');
        infoItem.className = 'battle-info-item';
        infoItem.dataset.player = attacker.player;
        infoItem.dataset.action = 'special';
        infoItem.innerHTML = `<span class="special-message">玩家${attacker.player}：<span class="attacker">${attackerName}(Lv${attackerLevel})</span>使用<span class="weapon">⚡</span>释放了闪电攻击，范围${aoeRadius}</span>`;
        battleInfo.appendChild(infoItem);
        battleInfo.scrollTop = battleInfo.scrollHeight;
        
        while (battleInfo.children.length > MAX_BATTLE_INFO_ITEMS) {
            battleInfo.removeChild(battleInfo.firstChild);
        }
        
        applyFilters();
    } else if (attacker.weapon.emoji === '🔥') {
        playSound('fire');
        showFireEffect(explosionX, explosionY, aoeRadius);
        
        const infoItem = document.createElement('div');
        infoItem.className = 'battle-info-item';
        infoItem.dataset.player = attacker.player;
        infoItem.dataset.action = 'special';
        infoItem.innerHTML = `<span class="special-message">玩家${attacker.player}：<span class="attacker">${attackerName}(Lv${attackerLevel})</span>使用<span class="weapon">🔥</span>释放了火焰攻击，范围${aoeRadius}</span>`;
        battleInfo.appendChild(infoItem);
        battleInfo.scrollTop = battleInfo.scrollHeight;
        
        while (battleInfo.children.length > MAX_BATTLE_INFO_ITEMS) {
            battleInfo.removeChild(battleInfo.firstChild);
        }
        
        applyFilters();
    } else if (attacker.weapon.emoji === '🧊') {
        playSound('ice');
        showIceEffect(explosionX, explosionY, aoeRadius);
        
        const infoItem = document.createElement('div');
        infoItem.className = 'battle-info-item';
        infoItem.dataset.player = attacker.player;
        infoItem.dataset.action = 'special';
        infoItem.innerHTML = `<span class="special-message">玩家${attacker.player}：<span class="attacker">${attackerName}(Lv${attackerLevel})</span>使用<span class="weapon">🧊</span>释放了冰冻攻击，范围${aoeRadius}</span>`;
        battleInfo.appendChild(infoItem);
        battleInfo.scrollTop = battleInfo.scrollHeight;
        
        while (battleInfo.children.length > MAX_BATTLE_INFO_ITEMS) {
            battleInfo.removeChild(battleInfo.firstChild);
        }
        
        applyFilters();
    } else {
        playSound('explosion');
        showAOEExplosion(explosionX, explosionY, aoeRadius);
        
        const infoItem = document.createElement('div');
        infoItem.className = 'battle-info-item';
        infoItem.dataset.player = attacker.player;
        infoItem.dataset.action = 'special';
        infoItem.innerHTML = `<span class="special-message">玩家${attacker.player}：<span class="attacker">${attackerName}(Lv${attackerLevel})</span>使用<span class="weapon">💣</span>释放了爆炸攻击，范围${aoeRadius}</span>`;
        battleInfo.appendChild(infoItem);
        battleInfo.scrollTop = battleInfo.scrollHeight;
        
        while (battleInfo.children.length > MAX_BATTLE_INFO_ITEMS) {
            battleInfo.removeChild(battleInfo.firstChild);
        }
        
        applyFilters();
    }
    
    if (attacker.weapon.emoji === '⚡' || attacker.weapon.emoji === '🔥') {
        const damage = attacker.weapon.ignoreDefense ? 
            Math.max(1, attacker.stats.attack + attacker.weapon.attack) :
            calculateDamage(attacker, target);
        
        addBattleInfo(attacker, target, damage);
        
        if (damage > 0) {
            playSound('hit');
            target.stats.health -= damage;
            
            target.element.classList.add('hit');
            showDamageText(target, damage, attacker.weapon.effectType);
            showWeaponEffect(attacker, target, attacker.weapon.effectType);
            
            setTimeout(() => {
                target.element.classList.remove('hit');
            }, 300);
            
            updateHealthBar(target);
            
            if (attacker.weapon.emoji === '🔥') {
                applyBurnEffect(target, attacker, damage);
            }
            
            if (target.stats.health <= 0 && !target.hasBeenKilled) {
                playSound('kill');
                playSound('death');
                target.isDead = true;
                target.hasBeenKilled = true;
                target.element.classList.add('dead');
                target.element.classList.remove('moving');
                target.element.classList.remove('attacking');
                
                if (target.listItem) {
                    target.listItem.classList.add('dead');
                    target.listItem.querySelector('.icon-health').textContent = `0/${target.stats.maxHealth}`;
                }
                
                battleStats[`player${attacker.player}`].kills++;
                updateBattleStats();
                
                attacker.killCount++;
                checkLevelUp(attacker);
                
                const attackerName = attacker.name || '未知图标';
                const enemyName = target.name || '未知图标';
                const weaponName = attacker.weapon.emoji || attacker.weapon.name;
                const attackerLevel = attacker.level || 1;
                const enemyLevel = target.level || 1;
                const battleInfo = document.getElementById('battleInfo');
                const infoItem = document.createElement('div');
                infoItem.className = 'battle-info-item';
                infoItem.dataset.player = attacker.player;
                infoItem.dataset.action = 'kill';
                infoItem.innerHTML = `<span class="kill-message">玩家${attacker.player}：<span class="attacker">${attackerName}(Lv${attackerLevel})</span><span class="weapon">${weaponName}</span>击杀了<span class="target">${enemyName}(Lv${enemyLevel})</span></span>`;
                battleInfo.appendChild(infoItem);
                battleInfo.scrollTop = battleInfo.scrollHeight;
                
                while (battleInfo.children.length > MAX_BATTLE_INFO_ITEMS) {
                    battleInfo.removeChild(battleInfo.firstChild);
                }
                
                applyFilters();
                
                setTimeout(() => {
                    removeBattleIcon(target);
                }, 5000);
            }
        }
    } else {
        enemies.forEach(enemy => {
            if (enemy.isDead) return;
            
            const dx = enemy.x - explosionX;
            const dy = enemy.y - explosionY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance <= aoeRadius) {
                const damage = calculateDamage(attacker, enemy);
                
                addBattleInfo(attacker, enemy, damage);
                
                if (damage > 0) {
                    playSound('hit');
                    enemy.stats.health -= damage;
                    
                    enemy.element.classList.add('hit');
                    showDamageText(enemy, damage, attacker.weapon.effectType);
                    
                    setTimeout(() => {
                        enemy.element.classList.remove('hit');
                    }, 300);
                    
                    updateHealthBar(enemy);
                    
                    if (attacker.weapon.freezeDuration) {
                        applyFreeze(enemy, attacker.weapon.freezeDuration);
                    }
                    
                    if (enemy.stats.health <= 0 && !enemy.hasBeenKilled) {
                        playSound('kill');
                        playSound('death');
                        enemy.isDead = true;
                        enemy.hasBeenKilled = true;
                        enemy.element.classList.add('dead');
                        
                        if (enemy.listItem) {
                            enemy.listItem.classList.add('dead');
                            enemy.listItem.querySelector('.icon-health').textContent = `0/${enemy.stats.maxHealth}`;
                        }
                        
                        battleStats[`player${attacker.player}`].kills++;
                        updateBattleStats();
                        
                        const attackerName = attacker.name || '未知图标';
                        const enemyName = enemy.name || '未知图标';
                        const weaponName = attacker.weapon.emoji || attacker.weapon.name;
                        const attackerLevel = attacker.level || 1;
                        const enemyLevel = enemy.level || 1;
                        const battleInfo = document.getElementById('battleInfo');
                        const infoItem = document.createElement('div');
                        infoItem.className = 'battle-info-item';
                        infoItem.dataset.player = attacker.player;
                        infoItem.dataset.action = 'kill';
                        infoItem.innerHTML = `<span class="kill-message">玩家${attacker.player}：<span class="attacker">${attackerName}(Lv${attackerLevel})</span><span class="weapon">${weaponName}</span>击杀了<span class="target">${enemyName}(Lv${enemyLevel})</span></span>`;
                        battleInfo.appendChild(infoItem);
                        battleInfo.scrollTop = battleInfo.scrollHeight;
                        
                        while (battleInfo.children.length > MAX_BATTLE_INFO_ITEMS) {
                            battleInfo.removeChild(battleInfo.firstChild);
                        }
                        
                        applyFilters();
                        
                        setTimeout(() => {
                            removeBattleIcon(enemy);
                        }, 5000);
                    }
                }
            }
        });
    }
}

function showAOEExplosion(x, y, radius) {
    const battleArea = document.getElementById('battleArea');
    const explosion = document.createElement('div');
    explosion.className = 'aoe-explosion';
    explosion.style.left = `${x - radius}px`;
    explosion.style.top = `${y - radius}px`;
    explosion.style.width = `${radius * 2}px`;
    explosion.style.height = `${radius * 2}px`;
    battleArea.appendChild(explosion);
    
    setTimeout(() => {
        explosion.remove();
    }, 500);
}

function showLightningEffect(x, y, radius) {
    const battleArea = document.getElementById('battleArea');
    const lightning = document.createElement('div');
    lightning.className = 'lightning-effect';
    lightning.style.left = `${x - radius}px`;
    lightning.style.top = `${y - radius}px`;
    lightning.style.width = `${radius * 2}px`;
    lightning.style.height = `${radius * 2}px`;
    battleArea.appendChild(lightning);
    
    const numBolts = 5;
    for (let i = 0; i < numBolts; i++) {
        setTimeout(() => {
            const bolt = document.createElement('div');
            bolt.className = 'lightning-bolt';
            bolt.style.left = `${Math.random() * radius * 2}px`;
            bolt.style.top = `${Math.random() * radius * 2}px`;
            bolt.style.height = `${Math.random() * 50 + 30}px`;
            bolt.style.transform = `rotate(${Math.random() * 360}deg)`;
            lightning.appendChild(bolt);
            
            setTimeout(() => {
                bolt.remove();
            }, 200);
        }, i * 50);
    }
    
    setTimeout(() => {
        lightning.remove();
    }, 500);
}

function showFireEffect(x, y, radius) {
    const battleArea = document.getElementById('battleArea');
    const fire = document.createElement('div');
    fire.className = 'fire-effect';
    fire.style.left = `${x - radius}px`;
    fire.style.top = `${y - radius}px`;
    fire.style.width = `${radius * 2}px`;
    fire.style.height = `${radius * 2}px`;
    battleArea.appendChild(fire);
    
    const numFlames = 8;
    for (let i = 0; i < numFlames; i++) {
        setTimeout(() => {
            const flame = document.createElement('div');
            flame.className = 'flame';
            flame.style.left = `${Math.random() * radius * 2}px`;
            flame.style.top = `${Math.random() * radius * 2}px`;
            flame.style.width = `${Math.random() * 30 + 20}px`;
            flame.style.height = `${Math.random() * 30 + 20}px`;
            flame.style.transform = `rotate(${Math.random() * 360}deg)`;
            fire.appendChild(flame);
            
            setTimeout(() => {
                flame.remove();
            }, 300);
        }, i * 60);
    }
    
    setTimeout(() => {
        fire.remove();
    }, 500);
}

function applyBurnEffect(target, attacker, damage) {
    if (target.isBurning) return;
    
    target.isBurning = true;
    const burnDamage = Math.max(1, Math.floor(damage / 2));
    const burnInterval = (attacker.weapon.burnInterval || 500) / gameSpeed;
    const burnDuration = (attacker.weapon.burnDuration || 2000) / gameSpeed;
    const numTicks = Math.floor(burnDuration / burnInterval);
    let currentTick = 0;
    let lastTickTime = performance.now();
    
    const attackerName = attacker.name || '未知图标';
    const targetName = target.name || '未知图标';
    const attackerLevel = attacker.level || 1;
    const targetLevel = target.level || 1;
    const battleInfo = document.getElementById('battleInfo');
    const infoItem = document.createElement('div');
    infoItem.className = 'battle-info-item';
    infoItem.dataset.player = attacker.player;
    infoItem.dataset.action = 'special';
    infoItem.innerHTML = `<span class="special-message">玩家${attacker.player}：<span class="attacker">${attackerName}(Lv${attackerLevel})</span>用<span class="weapon">${attacker.weapon.emoji}</span>对<span class="target">${targetName}(Lv${targetLevel})</span>施加了燃烧效果，每${Math.round(burnInterval)}毫秒造成${burnDamage}点伤害</span>`;
    battleInfo.appendChild(infoItem);
    battleInfo.scrollTop = battleInfo.scrollHeight;
    
    while (battleInfo.children.length > MAX_BATTLE_INFO_ITEMS) {
        battleInfo.removeChild(battleInfo.firstChild);
    }
    
    applyFilters();
    
    function burnTick(currentTime) {
        if (target.isDead || currentTick >= numTicks) {
            target.isBurning = false;
            return;
        }
        
        if (currentTime - lastTickTime >= burnInterval) {
            target.stats.health -= burnDamage;
            showDamageText(target, burnDamage, 'fire');
            updateHealthBar(target);
            
            if (target.stats.health <= 0 && !target.hasBeenKilled) {
                playSound('kill');
                playSound('death');
                target.isDead = true;
                target.hasBeenKilled = true;
                target.element.classList.add('dead');
                target.element.classList.remove('moving');
                target.element.classList.remove('attacking');
                
                if (target.listItem) {
                    target.listItem.classList.add('dead');
                    target.listItem.querySelector('.icon-health').textContent = `0/${target.stats.maxHealth}`;
                }
                
                battleStats[`player${attacker.player}`].kills++;
                updateBattleStats();
                
                attacker.killCount++;
                checkLevelUp(attacker);
                
                const attackerName = attacker.name || '未知图标';
                const enemyName = target.name || '未知图标';
                const weaponName = attacker.weapon.emoji || attacker.weapon.name;
                const attackerLevel = attacker.level || 1;
                const enemyLevel = target.level || 1;
                const battleInfo = document.getElementById('battleInfo');
                const infoItem = document.createElement('div');
                infoItem.className = `battle-info-item player-${attacker.player}`;
                infoItem.dataset.player = attacker.player;
                infoItem.dataset.action = 'kill';
                infoItem.innerHTML = `<span class="kill-message">玩家${attacker.player}：<span class="attacker">${attackerName}(Lv${attackerLevel})</span><span class="weapon">${weaponName}</span>击杀了<span class="target">${enemyName}(Lv${enemyLevel})</span></span>`;
                battleInfo.appendChild(infoItem);
                battleInfo.scrollTop = battleInfo.scrollHeight;
                
                while (battleInfo.children.length > MAX_BATTLE_INFO_ITEMS) {
                    battleInfo.removeChild(battleInfo.firstChild);
                }
                
                applyFilters();
                
                setTimeout(() => {
                    removeBattleIcon(target);
                }, 5000);
                
                target.isBurning = false;
                return;
            }
            
            lastTickTime = currentTime;
            currentTick++;
        }
        
        requestAnimationFrame(burnTick);
    }
    
    requestAnimationFrame(burnTick);
}

function applyKnockback(attacker, target, distance) {
    if (target.isDead || target.isKnockedBack) return;
    
    const dx = target.x - attacker.x;
    const dy = target.y - attacker.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    
    if (length === 0) return;
    
    const normalizedX = dx / length;
    const normalizedY = dy / length;
    
    target.knockbackTargetX = target.x + normalizedX * distance;
    target.knockbackTargetY = target.y + normalizedY * distance;
    target.isKnockedBack = true;
    
    const battleArea = document.getElementById('battleArea');
    const areaRect = battleArea.getBoundingClientRect();
    const maxX = areaRect.width - 80;
    const maxY = areaRect.height - 80;
    
    target.knockbackTargetX = Math.max(0, Math.min(maxX, target.knockbackTargetX));
    target.knockbackTargetY = Math.max(0, Math.min(maxY, target.knockbackTargetY));
    
    target.element.classList.add('knocked-back');
    
    const startTime = performance.now();
    const duration = 300;
    const startX = target.x;
    const startY = target.y;
    
    function animateKnockback(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        
        target.x = startX + (target.knockbackTargetX - startX) * easeProgress;
        target.y = startY + (target.knockbackTargetY - startY) * easeProgress;
        
        target.element.style.left = `${target.x}px`;
        target.element.style.top = `${target.y}px`;
        
        if (progress < 1) {
            requestAnimationFrame(animateKnockback);
        } else {
            target.isKnockedBack = false;
            target.element.classList.remove('knocked-back');
        }
    }
    
    requestAnimationFrame(animateKnockback);
}

function applyStun(target, duration) {
    if (target.isDead || target.isStunned) return;
    
    target.isStunned = true;
    const actualDuration = duration / gameSpeed;
    target.stunEndTime = Date.now() + actualDuration;
    
    target.element.classList.add('stunned');
    
    const stunText = document.createElement('div');
    stunText.className = 'stun-text';
    stunText.textContent = '眩晕!';
    stunText.style.left = '50%';
    stunText.style.top = '0';
    stunText.style.transform = 'translateX(-50%)';
    target.element.appendChild(stunText);
    
    setTimeout(() => {
        stunText.remove();
    }, 1000);
    
    setTimeout(() => {
        if (!target.isDead) {
            target.isStunned = false;
            target.element.classList.remove('stunned');
        }
    }, actualDuration);
}

function applyFreeze(target, duration) {
    if (target.isDead || target.isFrozen) return;
    
    target.isFrozen = true;
    const actualDuration = duration / gameSpeed;
    target.freezeEndTime = Date.now() + actualDuration;
    
    target.element.classList.add('frozen');
    
    const freezeText = document.createElement('div');
    freezeText.className = 'freeze-text';
    freezeText.textContent = '冰冻!';
    freezeText.style.left = '50%';
    freezeText.style.top = '0';
    freezeText.style.transform = 'translateX(-50%)';
    target.element.appendChild(freezeText);
    
    setTimeout(() => {
        freezeText.remove();
    }, 1000);
    
    const targetName = target.name || '未知图标';
    const targetLevel = target.level || 1;
    const battleInfo = document.getElementById('battleInfo');
    const infoItem = document.createElement('div');
    infoItem.className = 'battle-info-item';
    infoItem.dataset.player = target.player;
    infoItem.dataset.action = 'special';
    infoItem.innerHTML = `<span class="special-message">玩家${target.player}：<span class="target">${targetName}(Lv${targetLevel})</span>被冰冻了，持续${Math.round(actualDuration)}毫秒</span>`;
    battleInfo.appendChild(infoItem);
    battleInfo.scrollTop = battleInfo.scrollHeight;
    
    while (battleInfo.children.length > MAX_BATTLE_INFO_ITEMS) {
        battleInfo.removeChild(battleInfo.firstChild);
    }
    
    applyFilters();
    
    setTimeout(() => {
        if (!target.isDead) {
            target.isFrozen = false;
            target.element.classList.remove('frozen');
        }
    }, actualDuration);
}

function applyBuff(attacker, target) {
    if (target.isDead || target.isBuffed) return;
    
    const buffDuration = (attacker.weapon.buffDuration || 3000) / gameSpeed;
    const buffMultiplier = attacker.weapon.buffMultiplier || 1.8;
    
    target.originalStats = {
        attack: target.stats.attack,
        defense: target.stats.defense,
        speed: target.stats.speed
    };
    
    target.stats.attack = Math.floor(target.stats.attack * buffMultiplier);
    target.stats.defense = Math.floor(target.stats.defense * buffMultiplier);
    target.stats.speed = Math.floor(target.stats.speed * buffMultiplier);
    
    target.isBuffed = true;
    target.buffEndTime = Date.now() + buffDuration;
    
    target.element.classList.add('buffed');
    
    playSound('buff');
    
    const buffText = document.createElement('div');
    buffText.className = 'buff-text';
    buffText.textContent = '兴奋!';
    buffText.style.left = '50%';
    buffText.style.top = '0';
    buffText.style.transform = 'translateX(-50%)';
    target.element.appendChild(buffText);
    
    setTimeout(() => {
        buffText.remove();
    }, 1000);
    
    showBuffEffect(target.x + 40, target.y + 40, 60);
    
    const attackerName = attacker.name || '未知图标';
    const targetName = target.name || '未知图标';
    const attackerLevel = attacker.level || 1;
    const targetLevel = target.level || 1;
    const battleInfo = document.getElementById('battleInfo');
    const infoItem = document.createElement('div');
    infoItem.className = 'battle-info-item';
    infoItem.innerHTML = `<span class="special-message">玩家${attacker.player}：<span class="attacker">${attackerName}(Lv${attackerLevel})</span><span class="weapon">💉</span>给<span class="target">${targetName}(Lv${targetLevel})</span>使用了兴奋剂</span>`;
    battleInfo.appendChild(infoItem);
    
    if (battleInfo.children.length > MAX_BATTLE_INFO_ITEMS) {
        battleInfo.removeChild(battleInfo.firstChild);
    }
    
    battleInfo.scrollTop = battleInfo.scrollHeight;
}

function showSoundWaveEffect(x, y, radius) {
    const battleArea = document.getElementById('battleArea');
    const soundWave = document.createElement('div');
    soundWave.className = 'sound-wave-effect';
    soundWave.style.left = `${x - radius}px`;
    soundWave.style.top = `${y - radius}px`;
    soundWave.style.width = `${radius * 2}px`;
    soundWave.style.height = `${radius * 2}px`;
    battleArea.appendChild(soundWave);
    
    const numRings = 3;
    for (let i = 0; i < numRings; i++) {
        setTimeout(() => {
            const ring = document.createElement('div');
            ring.className = 'sound-wave-ring';
            ring.style.left = '50%';
            ring.style.top = '50%';
            ring.style.transform = 'translate(-50%, -50%)';
            ring.style.width = '0px';
            ring.style.height = '0px';
            soundWave.appendChild(ring);
            
            const ringStartTime = performance.now();
            const ringDuration = 400;
            
            function animateRing(currentTime) {
                const elapsed = currentTime - ringStartTime;
                const progress = Math.min(elapsed / ringDuration, 1);
                
                const currentRadius = radius * progress;
                ring.style.width = `${currentRadius * 2}px`;
                ring.style.height = `${currentRadius * 2}px`;
                ring.style.opacity = 1 - progress;
                
                if (progress < 1) {
                    requestAnimationFrame(animateRing);
                } else {
                    ring.remove();
                }
            }
            
            requestAnimationFrame(animateRing);
        }, i * 100);
    }
    
    setTimeout(() => {
        soundWave.remove();
    }, 600);
}

function showIceEffect(x, y, radius) {
    const battleArea = document.getElementById('battleArea');
    const iceEffect = document.createElement('div');
    iceEffect.className = 'ice-effect';
    iceEffect.style.left = `${x - radius}px`;
    iceEffect.style.top = `${y - radius}px`;
    iceEffect.style.width = `${radius * 2}px`;
    iceEffect.style.height = `${radius * 2}px`;
    battleArea.appendChild(iceEffect);
    
    const numRings = 4;
    for (let i = 0; i < numRings; i++) {
        setTimeout(() => {
            const ring = document.createElement('div');
            ring.className = 'ice-ring';
            ring.style.left = '50%';
            ring.style.top = '50%';
            ring.style.transform = 'translate(-50%, -50%)';
            ring.style.width = '0px';
            ring.style.height = '0px';
            iceEffect.appendChild(ring);
            
            const ringStartTime = performance.now();
            const ringDuration = 500;
            
            function animateRing(currentTime) {
                const elapsed = currentTime - ringStartTime;
                const progress = Math.min(elapsed / ringDuration, 1);
                
                const currentRadius = radius * progress;
                ring.style.width = `${currentRadius * 2}px`;
                ring.style.height = `${currentRadius * 2}px`;
                ring.style.opacity = 1 - progress;
                
                if (progress < 1) {
                    requestAnimationFrame(animateRing);
                } else {
                    ring.remove();
                }
            }
            
            requestAnimationFrame(animateRing);
        }, i * 80);
    }
    
    const iceParticles = document.createElement('div');
    iceParticles.className = 'ice-particles';
    iceParticles.style.left = '50%';
    iceParticles.style.top = '50%';
    iceParticles.style.transform = 'translate(-50%, -50%)';
    iceEffect.appendChild(iceParticles);
    
    for (let i = 0; i < 12; i++) {
        const particle = document.createElement('div');
        particle.className = 'ice-particle';
        const angle = (i / 12) * Math.PI * 2;
        const distance = radius * 0.8;
        const startX = Math.cos(angle) * distance;
        const startY = Math.sin(angle) * distance;
        
        particle.style.left = `${50 + startX}%`;
        particle.style.top = `${50 + startY}%`;
        particle.style.transform = 'translate(-50%, -50%)';
        iceParticles.appendChild(particle);
    }
    
    setTimeout(() => {
        iceEffect.remove();
    }, 800);
}

function showBuffEffect(x, y, radius) {
    const battleArea = document.getElementById('battleArea');
    const buffEffect = document.createElement('div');
    buffEffect.className = 'buff-effect';
    buffEffect.style.left = `${x - radius}px`;
    buffEffect.style.top = `${y - radius}px`;
    buffEffect.style.width = `${radius * 2}px`;
    buffEffect.style.height = `${radius * 2}px`;
    battleArea.appendChild(buffEffect);
    
    const numRings = 4;
    for (let i = 0; i < numRings; i++) {
        setTimeout(() => {
            const ring = document.createElement('div');
            ring.className = 'buff-ring';
            ring.style.left = '50%';
            ring.style.top = '50%';
            ring.style.transform = 'translate(-50%, -50%)';
            ring.style.width = '0px';
            ring.style.height = '0px';
            buffEffect.appendChild(ring);
            
            const ringStartTime = performance.now();
            const ringDuration = 500;
            
            function animateRing(currentTime) {
                const elapsed = currentTime - ringStartTime;
                const progress = Math.min(elapsed / ringDuration, 1);
                
                const currentRadius = radius * progress;
                ring.style.width = `${currentRadius * 2}px`;
                ring.style.height = `${currentRadius * 2}px`;
                ring.style.opacity = 1 - progress;
                
                if (progress < 1) {
                    requestAnimationFrame(animateRing);
                } else {
                    ring.remove();
                }
            }
            
            requestAnimationFrame(animateRing);
        }, i * 80);
    }
    
    const buffParticles = document.createElement('div');
    buffParticles.className = 'buff-particles';
    buffParticles.style.left = '50%';
    buffParticles.style.top = '50%';
    buffParticles.style.transform = 'translate(-50%, -50%)';
    buffEffect.appendChild(buffParticles);
    
    for (let i = 0; i < 12; i++) {
        const particle = document.createElement('div');
        particle.className = 'buff-particle';
        const angle = (i / 12) * Math.PI * 2;
        const distance = radius * 0.8;
        const startX = Math.cos(angle) * distance;
        const startY = Math.sin(angle) * distance;
        
        particle.style.left = `${50 + startX}%`;
        particle.style.top = `${50 + startY}%`;
        particle.style.transform = 'translate(-50%, -50%)';
        buffParticles.appendChild(particle);
    }
    
    setTimeout(() => {
        buffEffect.remove();
    }, 800);
}

function moveTowardsTarget(iconData) {
    if (iconData.isDead || iconData.isFrozen) return;
    
    const dx = iconData.targetX - iconData.x;
    const dy = iconData.targetY - iconData.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > 5) {
        const speed = iconData.stats.speed * gameSpeed;
        const moveX = (dx / distance) * speed;
        const moveY = (dy / distance) * speed;
        
        iconData.x += moveX;
        iconData.y += moveY;
        
        iconData.element.style.left = `${iconData.x}px`;
        iconData.element.style.top = `${iconData.y}px`;
        
        iconData.element.classList.add('moving');
        
        const weapon = iconData.element.querySelector('.weapon');
        const defaultDirection = weapon.dataset.defaultDirection;
        
        if (moveX > 0) {
            iconData.element.classList.remove('facing-left');
            iconData.element.classList.add('facing-right');
            
            weapon.style.right = '-30px';
            weapon.style.left = 'auto';
            
            if (defaultDirection === 'top') {
                weapon.style.transform = 'rotate(90deg)';
            } else if (defaultDirection === 'right') {
                weapon.style.transform = 'scaleX(1)';
            } else if (defaultDirection === 'left') {
                weapon.style.transform = 'scaleX(-1)';
            }
        } else if (moveX < 0) {
            iconData.element.classList.remove('facing-right');
            iconData.element.classList.add('facing-left');
            
            weapon.style.left = '-30px';
            weapon.style.right = 'auto';
            
            if (defaultDirection === 'top') {
                weapon.style.transform = 'rotate(-90deg)';
            } else if (defaultDirection === 'right') {
                weapon.style.transform = 'scaleX(-1)';
            } else if (defaultDirection === 'left') {
                weapon.style.transform = 'scaleX(1)';
            }
        }
    } else {
        iconData.element.classList.remove('moving');
    }
}

function updateBattleStats() {
    document.getElementById('player1Kills').textContent = battleStats.player1.kills;
    
    const player1CurrentHealth = battleIcons.player1
        .filter(icon => !icon.isDead)
        .reduce((sum, icon) => sum + Math.max(0, icon.stats.health), 0);
    document.getElementById('player1Health').textContent = player1CurrentHealth;
    
    const player1TotalAttack = battleIcons.player1
        .filter(icon => !icon.isDead)
        .reduce((sum, icon) => sum + (icon.stats.attack || 0) + (icon.weapon.attack || 0), 0);
    document.getElementById('player1Attack').textContent = player1TotalAttack;
    
    document.getElementById('player2Kills').textContent = battleStats.player2.kills;
    
    const player2CurrentHealth = battleIcons.player2
        .filter(icon => !icon.isDead)
        .reduce((sum, icon) => sum + Math.max(0, icon.stats.health), 0);
    document.getElementById('player2Health').textContent = player2CurrentHealth;
    
    const player2TotalAttack = battleIcons.player2
        .filter(icon => !icon.isDead)
        .reduce((sum, icon) => sum + (icon.stats.attack || 0) + (icon.weapon.attack || 0), 0);
    document.getElementById('player2Attack').textContent = player2TotalAttack;
}

function initBattleInfoDrag() {
    const battleInfoWrapper = document.querySelector('.battle-info-wrapper');
    
    battleInfoWrapper.addEventListener('mousedown', (e) => {
        if (e.target.classList.contains('filter-tab')) return;
        
        battleInfoDragging = true;
        const rect = battleInfoWrapper.getBoundingClientRect();
        battleInfoOffset.x = e.clientX - rect.left;
        battleInfoOffset.y = e.clientY - rect.top;
        battleInfoWrapper.style.transform = 'none';
    });
    
    document.addEventListener('mousemove', (e) => {
        if (!battleInfoDragging) return;
        
        const battleArea = document.getElementById('battleArea');
        const battleAreaRect = battleArea.getBoundingClientRect();
        
        let newX = e.clientX - battleAreaRect.left - battleInfoOffset.x;
        let newY = e.clientY - battleAreaRect.top - battleInfoOffset.y;
        
        const maxX = battleAreaRect.width - battleInfoWrapper.offsetWidth;
        const maxY = battleAreaRect.height - battleInfoWrapper.offsetHeight;
        
        newX = Math.max(0, Math.min(newX, maxX));
        newY = Math.max(0, Math.min(newY, maxY));
        
        battleInfoWrapper.style.left = `${newX}px`;
        battleInfoWrapper.style.top = `${newY}px`;
    });
    
    document.addEventListener('mouseup', () => {
        battleInfoDragging = false;
    });
}

function removeBattleIcon(iconData) {
    const playerIcons = battleIcons[`player${iconData.player}`];
    const index = playerIcons.indexOf(iconData);
    
    if (index > -1) {
        playerIcons.splice(index, 1);
        iconData.element.remove();
    }
    
    if (iconData.listItem) {
        iconData.listItem.remove();
    }
}

function findNearestEnemy(iconData) {
    const enemyPlayer = iconData.player === 1 ? 2 : 1;
    const enemies = battleIcons[`player${enemyPlayer}`].filter(e => !e.isDead);
    
    if (enemies.length === 0) return null;
    
    let nearest = enemies[0];
    let minDistance = Infinity;
    
    enemies.forEach(enemy => {
        const dx = enemy.x - iconData.x;
        const dy = enemy.y - iconData.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < minDistance) {
            minDistance = distance;
            nearest = enemy;
        }
    });
    
    return nearest;
}

function gameLoop() {
    if (gamePaused) {
        requestAnimationFrame(gameLoop);
        return;
    }
    
    const player1Alive = battleIcons.player1.filter(icon => !icon.isDead).length;
    const player2Alive = battleIcons.player2.filter(icon => !icon.isDead).length;
    
    autoAddRandomIconsIfNeeded();
    
    const battleArea = document.getElementById('battleArea');
    const battleAreaRect = battleArea.getBoundingClientRect();
    const currentTime = Date.now();
    
    [...battleIcons.player1, ...battleIcons.player2].forEach(iconData => {
        if (iconData.isBuffed && currentTime >= iconData.buffEndTime) {
            if (iconData.originalStats) {
                iconData.stats.attack = iconData.originalStats.attack;
                iconData.stats.defense = iconData.originalStats.defense;
                iconData.stats.speed = iconData.originalStats.speed;
                iconData.originalStats = null;
            }
            iconData.isBuffed = false;
            iconData.element.classList.remove('buffed');
        }
    });
    
    battleIcons.player1.forEach(iconData => {
        if (iconData.isDead || iconData.stats.health >= iconData.stats.maxHealth) return;
        
        const isInTerritory = iconData.x < battleAreaRect.width / 2;
        if (isInTerritory && currentTime - iconData.lastHealTime >= 500 / gameSpeed) {
            iconData.stats.health = Math.min(iconData.stats.maxHealth, iconData.stats.health + 1);
            iconData.lastHealTime = currentTime;
            updateHealthBar(iconData);
        }
    });
    
    battleIcons.player2.forEach(iconData => {
        if (iconData.isDead || iconData.stats.health >= iconData.stats.maxHealth) return;
        
        const isInTerritory = iconData.x >= battleAreaRect.width / 2;
        if (isInTerritory && currentTime - iconData.lastHealTime >= 1000 / gameSpeed) {
            iconData.stats.health = Math.min(iconData.stats.maxHealth, iconData.stats.health + 1);
            iconData.lastHealTime = currentTime;
            updateHealthBar(iconData);
        }
    });
    
    let isVictory = (player1Alive === 0 && player2Alive > 0) || (player2Alive === 0 && player1Alive > 0);
    let winner = 0;
    
    if (isVictory) {
        winner = player1Alive > 0 ? 1 : 2;
        
        if (!victorySoundPlayed) {
            playSound('victory');
            victorySoundPlayed = true;
            
            const defeatedPlayer = player1Alive === 0 ? 1 : 2;
            startAutoDeployTimer(defeatedPlayer);
            
            formationPositions = calculateFormationPositions(winner);
            
            const winnerIcons = battleIcons[`player${winner}`].filter(icon => !icon.isDead && icon.weapon.type !== 'heal');
            winnerIcons.forEach((iconData, index) => {
                if (index < formationPositions.length) {
                    iconData.isOnCooldown = false;
                    iconData.currentCharges = iconData.weapon.maxCharges;
                    iconData.targetX = formationPositions[index].x;
                    iconData.targetY = formationPositions[index].y;
                }
            });
            
            battleIcons[`player${winner}`].forEach((iconData, index) => {
                if (!iconData.isDead && iconData.weapon.type === 'heal') {
                    iconData.isOnCooldown = false;
                    iconData.currentCharges = iconData.weapon.maxCharges;
                }
            });
        }
    } else {
        victorySoundPlayed = false;
        cancelAutoDeployTimer();
    }
    
    if (isVictory) {
        const winnerIcons = battleIcons[`player${winner}`].filter(icon => !icon.isDead && icon.weapon.type !== 'heal');
        
        battleIcons.player1.forEach(iconData => {
            if (iconData.isDead) return;
            
            if (iconData.weapon.type === 'heal') {
                handleHealerBehavior(iconData);
            } else if (iconData.weapon.type === 'buff') {
                handleBuffBehavior(iconData);
            } else {
                moveTowardsTarget(iconData);
            }
        });
        
        battleIcons.player2.forEach(iconData => {
            if (iconData.isDead) return;
            
            if (iconData.weapon.type === 'heal') {
                handleHealerBehavior(iconData);
            } else if (iconData.weapon.type === 'buff') {
                handleBuffBehavior(iconData);
            } else {
                moveTowardsTarget(iconData);
            }
        });
    } else {
        battleIcons.player1.forEach(iconData => {
            if (iconData.isDead) return;
            
            if (iconData.weapon.type === 'heal') {
                handleHealerBehavior(iconData);
            } else if (iconData.weapon.type === 'buff') {
                handleBuffBehavior(iconData);
            } else {
                const enemy = findNearestEnemy(iconData);
                if (enemy) {
                    const dx = enemy.x - iconData.x;
                    const dy = enemy.y - iconData.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < iconData.weapon.range) {
                        attack(iconData, enemy);
                    } else {
                        iconData.targetX = enemy.x - (iconData.weapon.type === 'melee' ? 50 : 0);
                        iconData.targetY = enemy.y;
                        moveTowardsTarget(iconData);
                    }
                }
            }
        });
        
        battleIcons.player2.forEach(iconData => {
            if (iconData.isDead) return;
            
            if (iconData.weapon.type === 'heal') {
                handleHealerBehavior(iconData);
            } else if (iconData.weapon.type === 'buff') {
                handleBuffBehavior(iconData);
            } else {
                const enemy = findNearestEnemy(iconData);
                if (enemy) {
                    const dx = enemy.x - iconData.x;
                    const dy = enemy.y - iconData.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < iconData.weapon.range) {
                        attack(iconData, enemy);
                    } else {
                        iconData.targetX = enemy.x + (iconData.weapon.type === 'melee' ? 50 : 0);
                        iconData.targetY = enemy.y;
                        moveTowardsTarget(iconData);
                    }
                }
            }
        });
    }
    
    requestAnimationFrame(gameLoop);
}

function handleHealerBehavior(iconData) {
    const allies = battleIcons[`player${iconData.player}`].filter(ally => !ally.isDead && ally !== iconData);
    const enemyPlayer = iconData.player === 1 ? 2 : 1;
    const enemies = battleIcons[`player${enemyPlayer}`].filter(e => !e.isDead);
    
    const battleArea = document.getElementById('battleArea');
    const rect = battleArea.getBoundingClientRect();
    
    const injuredAllies = allies.filter(ally => ally.stats.health < ally.stats.maxHealth * 0.9);
    
    if (injuredAllies.length > 0) {
        injuredAllies.sort((a, b) => {
            const healthPercentA = a.stats.health / a.stats.maxHealth;
            const healthPercentB = b.stats.health / b.stats.maxHealth;
            return healthPercentA - healthPercentB;
        });
        
        const target = injuredAllies[0];
        const dx = target.x - iconData.x;
        const dy = target.y - iconData.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance <= iconData.weapon.range) {
            if (!iconData.isAttacking && !iconData.isOnCooldown) {
                attack(iconData, target);
            }
        } else {
            iconData.targetX = target.x;
            iconData.targetY = target.y;
            moveTowardsTarget(iconData);
        }
        return;
    }
    
    if (allies.length > 0) {
        const nonHealerAllies = allies.filter(ally => ally.weapon.type !== 'heal');
        
        if (nonHealerAllies.length > 0) {
            nonHealerAllies.sort((a, b) => {
                const distA = Math.sqrt(Math.pow(a.x - iconData.x, 2) + Math.pow(a.y - iconData.y, 2));
                const distB = Math.sqrt(Math.pow(b.x - iconData.x, 2) + Math.pow(b.y - iconData.y, 2));
                return distA - distB;
            });
            
            const target = nonHealerAllies[0];
            const dx = target.x - iconData.x;
            const dy = target.y - iconData.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const followDistance = 80;
            
            if (distance > followDistance) {
                iconData.targetX = target.x;
                iconData.targetY = target.y;
                moveTowardsTarget(iconData);
            } else if (distance < followDistance * 0.4) {
                const angle = Math.atan2(dy, dx);
                const offsetX = Math.cos(angle) * (followDistance * 0.6);
                const offsetY = Math.sin(angle) * (followDistance * 0.6);
                iconData.targetX = target.x - offsetX;
                iconData.targetY = target.y - offsetY;
                moveTowardsTarget(iconData);
            }
        } else {
            const target = allies[0];
            const dx = target.x - iconData.x;
            const dy = target.y - iconData.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const followDistance = 80;
            
            if (distance > followDistance) {
                iconData.targetX = target.x;
                iconData.targetY = target.y;
                moveTowardsTarget(iconData);
            } else if (distance < followDistance * 0.4) {
                const angle = Math.atan2(dy, dx);
                const offsetX = Math.cos(angle) * (followDistance * 0.6);
                const offsetY = Math.sin(angle) * (followDistance * 0.6);
                iconData.targetX = target.x - offsetX;
                iconData.targetY = target.y - offsetY;
                moveTowardsTarget(iconData);
            }
        }
        return;
    }
    
    if (enemies.length > 0) {
        enemies.sort((a, b) => {
            const distA = Math.sqrt(Math.pow(a.x - iconData.x, 2) + Math.pow(a.y - iconData.y, 2));
            const distB = Math.sqrt(Math.pow(b.x - iconData.x, 2) + Math.pow(b.y - iconData.y, 2));
            return distA - distB;
        });
        
        const target = enemies[0];
        const dx = target.x - iconData.x;
        const dy = target.y - iconData.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const attackRange = 60;
        
        if (distance > attackRange) {
            iconData.targetX = target.x;
            iconData.targetY = target.y;
            moveTowardsTarget(iconData);
        } else {
            attack(iconData, target);
        }
        return;
    }
    
    const centerX = iconData.player === 1 ? rect.width * 0.25 : rect.width * 0.75;
    const centerY = rect.height * 0.5;
    iconData.targetX = centerX;
    iconData.targetY = centerY;
    moveTowardsTarget(iconData);
}

function handleBuffBehavior(iconData) {
    const allies = battleIcons[`player${iconData.player}`].filter(ally => !ally.isDead && ally !== iconData);
    const enemyPlayer = iconData.player === 1 ? 2 : 1;
    const enemies = battleIcons[`player${enemyPlayer}`].filter(e => !e.isDead);
    
    const battleArea = document.getElementById('battleArea');
    const rect = battleArea.getBoundingClientRect();
    
    const nonHealerAllies = allies.filter(ally => ally.weapon.type !== 'heal');
    
    if (nonHealerAllies.length > 0) {
        nonHealerAllies.sort((a, b) => {
            const statsA = a.stats.attack + a.stats.defense + a.stats.speed;
            const statsB = b.stats.attack + b.stats.defense + b.stats.speed;
            return statsB - statsA;
        });
        
        const target = nonHealerAllies[0];
        const dx = target.x - iconData.x;
        const dy = target.y - iconData.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance <= iconData.weapon.range) {
            if (!iconData.isAttacking && !iconData.isOnCooldown) {
                attack(iconData, target);
            }
        }
        
        const safeDistance = 120;
        const minDistance = 60;
        
        if (distance > safeDistance) {
            iconData.targetX = target.x;
            iconData.targetY = target.y;
            moveTowardsTarget(iconData);
        } else if (distance < minDistance) {
            const angle = Math.atan2(dy, dx);
            const offsetX = Math.cos(angle) * minDistance;
            const offsetY = Math.sin(angle) * minDistance;
            iconData.targetX = target.x - offsetX;
            iconData.targetY = target.y - offsetY;
            moveTowardsTarget(iconData);
        }
        return;
    }
    
    if (enemies.length > 0) {
        enemies.sort((a, b) => {
            const distA = Math.sqrt(Math.pow(a.x - iconData.x, 2) + Math.pow(a.y - iconData.y, 2));
            const distB = Math.sqrt(Math.pow(b.x - iconData.x, 2) + Math.pow(b.y - iconData.y, 2));
            return distA - distB;
        });
        
        const target = enemies[0];
        const dx = target.x - iconData.x;
        const dy = target.y - iconData.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < iconData.weapon.range) {
            if (!iconData.isAttacking && !iconData.isOnCooldown) {
                attack(iconData, target);
            }
        } else {
            iconData.targetX = target.x;
            iconData.targetY = target.y;
            moveTowardsTarget(iconData);
        }
        return;
    }
    
    const centerX = iconData.player === 1 ? rect.width * 0.25 : rect.width * 0.75;
    const centerY = rect.height * 0.5;
    iconData.targetX = centerX;
    iconData.targetY = centerY;
    moveTowardsTarget(iconData);
}

function setupBattleZoneDrop() {
    const battleArea = document.getElementById('battleArea');
    
    battleArea.addEventListener('dragover', (event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    });
    
    battleArea.addEventListener('drop', (event) => {
        event.preventDefault();
        event.stopPropagation();
        
        const iconId = event.dataTransfer.getData('text/plain');
        const player = parseInt(event.dataTransfer.getData('player'));
        const iconUrl = event.dataTransfer.getData('imageUrl');        
        
        
        if (iconId && player && iconUrl) {
            const iconItem = document.querySelector(`.icon-item[data-icon-id="${iconId}"]`);
            if (iconItem) {
                const rect = battleArea.getBoundingClientRect();
                const x = event.clientX - rect.left - 40;
                const y = event.clientY - rect.top - 40;
                const name = iconItem.dataset.name || '';
                
                const battleIcon = createBattleIcon(iconUrl, player, x, y, name);
                battleArea.appendChild(battleIcon);
                
                updateBattleStats();
                
                iconItem.remove();
            }
        }
    });
}

function deployAllIcons(player) {
    const readyContent = document.getElementById(`player${player}ReadyContent`);
    const iconItems = readyContent.querySelectorAll('.icon-item');
    const battleArea = document.getElementById('battleArea');
    const battleAreaRect = battleArea.getBoundingClientRect();
    
    const maxIconsPerColumn = 6;
    const columnSpacing = 80;
    const rowSpacing = 80;
    const padding = 40;
    
    const numColumns = Math.ceil(iconItems.length / maxIconsPerColumn);
    const totalWidth = (numColumns - 1) * columnSpacing;
    
    let centerX;
    if (player === 1) {
        centerX = battleAreaRect.width / 8;
    } else {
        centerX = battleAreaRect.width * 7 / 8;
    }
    
    const startX = centerX - totalWidth / 2;
    
    iconItems.forEach((iconItem, index) => {
        const iconUrl = iconItem.querySelector('img').src;
        const name = iconItem.dataset.name || '';
        
        const columnIndex = Math.floor(index / maxIconsPerColumn);
        const rowIndex = index % maxIconsPerColumn;
        
        const x = startX + columnIndex * columnSpacing;
        
        const iconsInColumn = Math.min(maxIconsPerColumn, iconItems.length - columnIndex * maxIconsPerColumn);
        const totalColumnHeight = (iconsInColumn - 1) * rowSpacing;
        const startY = (battleAreaRect.height - totalColumnHeight) / 2;
        const y = startY + rowIndex * rowSpacing;
        
        const battleIcon = createBattleIcon(iconUrl, player, x, y, name);
        battleArea.appendChild(battleIcon);
        
        updateBattleStats();
        
        iconItem.remove();
    });
    
    const dropHint = readyContent.querySelector('.drop-hint');
    if (dropHint) {
        dropHint.style.display = 'flex';
    }
}

function init() {
    setupBattleZoneDrop();
    gameLoop();
    initBattleInfoDrag();
    initFilterTabs();
    
    addRandomIcons(1, 7);
    addRandomIcons(2, 7);
    
    const readyContents = document.querySelectorAll('.ready-content');
    readyContents.forEach(content => {
        content.addEventListener('dragleave', handleDragLeave);
    });
    
    document.addEventListener('click', (event) => {
        const modal = document.getElementById('searchModal');
        if (event.target === modal) {
            closeSearchModal();
        }
        
        const optionsContainer = document.querySelector('.options-container');
        const optionsDropdown = document.getElementById('optionsDropdown');
        if (!event.target.closest('.options-container') && optionsDropdown.classList.contains('show')) {
            optionsDropdown.classList.remove('show');
        }
    });
}

function toggleOptions() {
    const optionsDropdown = document.getElementById('optionsDropdown');
    optionsDropdown.classList.toggle('show');
}

function toggleAutoAddRandom() {
    autoAddRandomEnabled = document.getElementById('autoAddRandom').checked;
}

function toggleAutoDeploy() {
    autoDeployEnabled = document.getElementById('autoDeploy').checked;
}

function toggleHideReadyArea() {
    const hideReadyArea = document.getElementById('hideReadyArea').checked;
    const readyArea = document.getElementById('readyarea');
    
    if (hideReadyArea) {
        readyArea.classList.add('hidden');
    } else {
        readyArea.classList.remove('hidden');
    }
}

function toggleHideBattleInfo() {
    const hideBattleInfo = document.getElementById('hideBattleInfo').checked;
    const battleInfoWrapper = document.getElementById('battleInfoWrapper');
    
    if (hideBattleInfo) {
        battleInfoWrapper.classList.add('hidden');
    } else {
        battleInfoWrapper.classList.remove('hidden');
    }
}

function toggleHideStats() {
    const hideStats = document.getElementById('hideStats').checked;
    const player1Stats = document.getElementById('player1Stats');
    const player2Stats = document.getElementById('player2Stats');
    
    if (hideStats) {
        player1Stats.classList.add('hidden');
        player2Stats.classList.add('hidden');
    } else {
        player1Stats.classList.remove('hidden');
        player2Stats.classList.remove('hidden');
    }
}

function togglePauseGame() {
    gamePaused = document.getElementById('pauseGame').checked;
}

function toggleFullscreen() {
    const fullscreenCheckbox = document.getElementById('fullscreenMode');
    
    if (fullscreenCheckbox.checked) {
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen();
        } else if (document.documentElement.webkitRequestFullscreen) {
            document.documentElement.webkitRequestFullscreen();
        } else if (document.documentElement.msRequestFullscreen) {
            document.documentElement.msRequestFullscreen();
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }
}

document.addEventListener('fullscreenchange', handleFullscreenChange);
document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
document.addEventListener('msfullscreenchange', handleFullscreenChange);

function handleFullscreenChange() {
    const fullscreenCheckbox = document.getElementById('fullscreenMode');
    const isFullscreen = document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement;
    fullscreenCheckbox.checked = !!isFullscreen;
}

function toggleGameSpeed() {
    const currentIndex = gameSpeeds.indexOf(gameSpeed);
    const nextIndex = (currentIndex + 1) % gameSpeeds.length;
    gameSpeed = gameSpeeds[nextIndex];
    
    const gameSpeedElement = document.getElementById('gameSpeed');
    gameSpeedElement.textContent = `${gameSpeed}x倍速`;
    
    if (gameSpeed === 1) {
        gameSpeedElement.classList.remove('fast');
    } else {
        gameSpeedElement.classList.add('fast');
    }
}

function checkReadyZoneEmpty(player) {
    const readyContent = document.getElementById(`player${player}ReadyContent`);
    const iconItems = readyContent.querySelectorAll('.icon-item');
    return iconItems.length === 0;
}

function autoAddRandomIconsIfNeeded() {
    if (!autoAddRandomEnabled) return;
    
    [1, 2].forEach(player => {
        if (checkReadyZoneEmpty(player)) {
            addRandomIcons(player, 7);
        }
    });
}

function startAutoDeployTimer(player) {
    if (!autoDeployEnabled) return;
    
    if (autoDeployTimer) {
        clearTimeout(autoDeployTimer);
    }
    
    lastPlayerDefeated = player;
    
    autoDeployTimer = setTimeout(() => {
        const readyContent = document.getElementById(`player${player}ReadyContent`);
        const iconItems = readyContent.querySelectorAll('.icon-item');
        
        if (iconItems.length > 0) {
            deployAllIcons(player);
        }
        
        autoDeployTimer = null;
    }, 10000 / gameSpeed);
}

function cancelAutoDeployTimer() {
    if (autoDeployTimer) {
        clearTimeout(autoDeployTimer);
        autoDeployTimer = null;
    }
}

let currentPlayerFilter = 'all';
let currentActionFilter = 'all';

function initFilterTabs() {
    const filterTabs = document.querySelectorAll('.filter-tab');
    filterTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const filterType = tab.dataset.filter;
            const filterValue = tab.dataset.value;
            
            const sameTypeTabs = document.querySelectorAll(`.filter-tab[data-filter="${filterType}"]`);
            sameTypeTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            if (filterType === 'player') {
                currentPlayerFilter = filterValue;
            } else if (filterType === 'action') {
                currentActionFilter = filterValue;
            }
            
            applyFilters();
        });
    });
}

function calculateFormationPositions(player) {
    const battleArea = document.getElementById('battleArea');
    const rect = battleArea.getBoundingClientRect();
    const icons = battleIcons[`player${player}`].filter(icon => !icon.isDead && icon.weapon.type !== 'heal');
    
    if (icons.length === 0) return [];
    
    const positions = [];
    const iconSize = 80;
    const spacing = 10;
    const cols = Math.ceil(Math.sqrt(icons.length));
    const rows = Math.ceil(icons.length / cols);
    
    const formationWidth = cols * (iconSize + spacing) - spacing;
    const formationHeight = rows * (iconSize + spacing) - spacing;
    
    const centerY = rect.height / 2;
    
    let startX;
    if (player === 1) {
        startX = rect.width * 0.3 - formationWidth / 2 + iconSize / 2;
    } else {
        startX = rect.width * 0.7 - formationWidth / 2 + iconSize / 2;
    }
    
    const startY = centerY - formationHeight / 2 + iconSize / 2;
    
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const index = row * cols + col;
            if (index >= icons.length) break;
            
            positions.push({
                x: startX + col * (iconSize + spacing),
                y: startY + row * (iconSize + spacing)
            });
        }
    }
    
    return positions;
}

function applyFilters() {
    const battleInfoItems = document.querySelectorAll('.battle-info-item');
    battleInfoItems.forEach(item => {
        const itemPlayer = item.dataset.player;
        const itemAction = item.dataset.action;
        
        let showItem = true;
        
        if (currentPlayerFilter !== 'all' && itemPlayer !== currentPlayerFilter) {
            showItem = false;
        }
        
        if (currentActionFilter !== 'all') {
            if (currentActionFilter === 'special') {
                if (itemAction === 'attack' || itemAction === 'heal' || itemAction === 'kill') {
                    showItem = false;
                }
            } else {
                if (itemAction !== currentActionFilter) {
                    showItem = false;
                }
            }
        }
        
        if (showItem) {
            item.classList.remove('hidden');
        } else {
            item.classList.add('hidden');
        }
    });
}

window.addEventListener('load', init);