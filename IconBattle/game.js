// 当前上传玩家
let currentUploadPlayer = null;
// 当前搜索玩家
let currentSearchPlayer = null;
// 图标ID计数器，用于为每个图标生成唯一ID
let iconIdCounter = 0;
// 战斗图标集合，按玩家分组
let battleIcons = {
    player1: [],  // 玩家1的战斗图标数组
    player2: []   // 玩家2的战斗图标数组
};
// 战斗统计数据，记录击杀数
let battleStats = {
    player1: { kills: 0 },  // 玩家1的击杀数
    player2: { kills: 0 }   // 玩家2的击杀数
};

// 战斗图标大小范围
const iconSizes = [0.2, 1.4];
// 战斗图标默认大小
let iconSize = 0.8;

// 战斗信息面板是否正在拖动
let battleInfoDragging = false;
// 战斗信息面板拖动时的偏移量
let battleInfoOffset = { x: 0, y: 0 };
// 胜利音效是否已经播放
let victorySoundPlayed = false;

// 是否启用自动添加随机图标
let autoAddRandomEnabled = false;
// 是否启用自动部署功能
let autoDeployEnabled = false;
// 自动部署计时器
let autoDeployTimer = null;
// 最后被击败的玩家
let lastPlayerDefeated = null;

// 阵型位置数组
let formationPositions = [];

// 游戏是否暂停
let gamePaused = false;
// 游戏速度倍数
let gameSpeed = 1;
// 可用的游戏速度选项
const gameSpeeds = [1, 1.5, 2, 3, 4, 5];

// 是否启用小队战斗模式
let squadBattleMode = false;
// 小队队长信息
let squadLeaders = {
    player1: null,  // 玩家1的小队队长
    player2: null   // 玩家2的小队队长
};

// 战斗图标详情面板相关变量
let currentDetailPanel = null;  // 当前显示的详情面板元素
let currentIconData = null;     // 当前详情面板对应的图标数据
let detailPanelUpdateInterval = null;

let battleAreaElement = null;
let battleAreaRect = null;
let lastBattleAreaCheckTime = 0;
const BATTLE_AREA_CHECK_INTERVAL = 1000;

let player1BattleZoneElement = null;
let player2BattleZoneElement = null;
let battleInfoElement = null;

let developerMode = false;  // 是否启用开发者模式
let specialButtonClickCount = 0;  // 特殊按钮点击次数，用于激活开发者模式
let developerPanel = null;  // 开发者面板元素
let developerPanelDragging = false;  // 开发者面板是否正在拖动
let developerPanelOffset = { x: 0, y: 0 };  // 开发者面板拖动时的偏移量

// 战斗信息面板最多显示的条目数
const MAX_BATTLE_INFO_ITEMS = 500;

// 音频上下文，用于播放游戏音效
const audioContext = new (window.AudioContext || window.webkitAudioContext());

// 游戏核心配置对象
const GAME_CONFIG = {
    // 升级系统配置
    upgrade: {
        killsPerLevel: 3,           // 升级所需的击杀数
        maxLevel: 6,               // 最大等级
        statIncreasePercent: 0.3   // 每次升级属性增加的百分比
    },
    // 动画效果配置
    animation: {
        attackDuration: 500,       // 攻击动画持续时间（毫秒）
        effectDuration: 300,       // 特效持续时间（毫秒）
        tooltipDuration: 2000      // 提示框显示时间（毫秒）
    },
    // 随机属性范围配置
    randomStats: {
        health: { min: 100, max: 150 },   // 生命值范围
        attack: { min: 10, max: 30 },      // 攻击力范围
        defense: { min: 5, max: 15 },      // 防御力范围
        armor: { min: 1, max: 4 },         // 护甲值范围
        speed: { min: 1, max: 4 }          // 速度值范围
    },
    // 移动系统配置
    movement: {
        arrivalThreshold: 5,            // 到达目标的阈值（像素）
        squadFollowDistance: 200,       // 小队跟随距离（像素）
        squadMonitorRange: 800,         // 小队监控范围（像素）
        boundaryMargin: 50,             // 边界边距（像素，乘以iconSize）
        meleeApproachOffset: 50,        // 近战接近目标的偏移距离（像素，乘以iconSize）
        healerSafeDistance: 120,        // 治疗者安全距离（像素，乘以iconSize）
        healerMinDistance: 60,          // 治疗者最小距离（像素，乘以iconSize）
        buffAttackRange: 60,            // 增益武器攻击距离（像素，乘以iconSize）
        retreatDistance: 150,           // 撤退距离（像素，乘以iconSize）
        effectOffset: 40                // 特效位置偏移（像素，乘以iconSize）
    },
    // 时间相关配置
    timing: {
        clickDelay: 300,                      // 点击延迟（毫秒）
        shortDelay: 500,                      // 短延迟（毫秒）
        mediumDelay: 1000,                    // 中等延迟（毫秒）
        longDelay: 1500,                      // 长延迟（毫秒）
        veryLongDelay: 3000,                  // 很长延迟（毫秒）
        extraLongDelay: 5000,                 // 极长延迟（毫秒）
        ringDuration: 500,                    // 光环持续时间（毫秒）
        ringDurationShort: 400,               // 短光环持续时间（毫秒）
        territoryHealIntervalPlayer1: 500,    // 玩家1领地治疗间隔（毫秒）
        territoryHealIntervalPlayer2: 1000    // 玩家2领地治疗间隔（毫秒）
    },
    // UI界面配置
    ui: {
        explosionZIndex: 1000,          // 爆炸效果的z-index层级
        developerPanelWidth: 400        // 开发者面板宽度（像素）
    },
    // 战斗数值配置
    combat: {
        damage: {
            randomMin: 0.8,              // 伤害随机浮动最小值
            randomMax: 1.2,              // 伤害随机浮动最大值
            defenseFactor: 0.5,          // 防御减免系数（防御值×该系数从伤害中扣除）
            aoeEdgeDamageFactor: 0.5,    // AOE边缘伤害比例（中心100%，边缘该比例）
            levelUpHealPercent: 0.3,     // 升级回血百分比
            levelUpMaxHealthBonus: 1.1,  // 升级最大生命值额外加成倍数
            minDamage: 1,                // 最小伤害值
            baseCritRate: 0.05,          // 基础暴击率
            baseCritDamage: 1.5,         // 基础暴击伤害倍率
            baseLifeSteal: 0             // 基础吸血比例
        },
        dodge: {
            speedFactor: 0.03            // 闪避概率系数（速度值×该系数=闪避率）
        },
        burn: {
            damageFactor: 0.5,           // 燃烧每次跳伤害占初始伤害的比例
            defaultDuration: 2000,       // 默认燃烧持续时间（毫秒）
            defaultInterval: 500         // 默认燃烧跳伤害间隔（毫秒）
        },
        weaponDefaults: {
            aoeRadius: 150,              // 默认AOE半径
            healAmount: 18,              // 默认治疗量
            attack: 120,                 // 默认攻击力
            chargeSpeed: 300,            // 默认冲锋速度
            deathExplosionMultiplier: 0.85 // 默认死亡自爆伤害倍率
        },
        buff: {
            defaultDuration: 3000,       // 默认buff持续时间（毫秒）
            defaultMultiplier: 1.8       // 默认buff属性倍率
        },
        squad: {
            meleeIdealRangeVsMelee: 0.7,  // 近战对近战的理想射程比例
            meleeIdealRangeVsRanged: 0.7, // 近战对远程的理想射程比例
            rangedIdealRangeVsMelee: 0.85,// 远程对近战的理想射程比例
            rangedIdealRangeVsRanged: 0.7,// 远程对远程的理想射程比例
            aoeIdealRangeVsMelee: 0.8,    // AOE对近战的理想射程比例
            aoeIdealRangeVsRanged: 0.65,  // AOE对远程的理想射程比例
            retreatHealthThreshold: 0.6,  // 后撤触发血量阈值
            retreatCloseRangeFactor: 0.4, // 后撤贴脸距离比例
            retreatDistance: 150,         // 后撤距离（像素）
            supportPriorityHealPercent: 0.75 // 辅助治疗触发血量阈值
        },
        ai: {
            types: ['aggressive', 'balanced', 'defensive'],
            aggressive: {
                targetPriority: 'lowestHealth',  // 目标优先级：最低血量
                approachBias: 1.2,               // 接近倾向系数（越大越主动接近）
                retreatThreshold: 0.2,           // 后撤血量阈值
                attackAggression: 1.1            // 攻击激进程度
            },
            balanced: {
                targetPriority: 'nearest',       // 目标优先级：最近
                approachBias: 1.0,               // 接近倾向系数
                retreatThreshold: 0.4,           // 后撤血量阈值
                attackAggression: 1.0            // 攻击激进程度
            },
            defensive: {
                targetPriority: 'nearest',       // 目标优先级：最近
                approachBias: 0.8,               // 接近倾向系数
                retreatThreshold: 0.6,           // 后撤血量阈值
                attackAggression: 0.9            // 攻击激进程度
            },
            weaponTypeBias: {
                melee: { aggressive: 0.5, balanced: 0.3, defensive: 0.2 },
                ranged: { aggressive: 0.2, balanced: 0.4, defensive: 0.4 },
                aoe: { aggressive: 0.3, balanced: 0.5, defensive: 0.2 },
                heal: { aggressive: 0.1, balanced: 0.3, defensive: 0.6 },
                buff: { aggressive: 0.2, balanced: 0.5, defensive: 0.3 }
            }
        }
    },
    // 武器配置列表
    weapons: [
        { emoji: '⚔️', name: '剑', attack: 9, type: 'melee', range: 100, attackSpeed: 500, maxCharges: 999, cooldownTime: 0, defaultDirection: 'top', effectType: 'slash' },
        { emoji: '🗡️', name: '匕首', attack: 8, type: 'melee', range: 80, attackSpeed: 450, maxCharges: 999, cooldownTime: 0, defaultDirection: 'right', effectType: 'stab' },
        { emoji: '🪓', name: '斧头', attack: 14, type: 'melee', range: 90, attackSpeed: 750, maxCharges: 999, cooldownTime: 0, defaultDirection: 'left', effectType: 'chop' },
        { emoji: '🔨', name: '锤子', attack: 16, type: 'melee', range: 70, attackSpeed: 800, maxCharges: 999, cooldownTime: 0, defaultDirection: 'left', effectType: 'smash' },
        { emoji: '🔱', name: '三叉戟', attack: 11, type: 'melee', range: 110, attackSpeed: 600, maxCharges: 999, cooldownTime: 0, defaultDirection: 'top', effectType: 'pierce' },
        { emoji: '⛏️', name: '镐子', attack: 10, type: 'melee', range: 75, attackSpeed: 600, maxCharges: 999, cooldownTime: 0, defaultDirection: 'left', effectType: 'dig' },
        { emoji: '🧱', name: '砖头', attack: 12, type: 'melee', range: 85, attackSpeed: 650, maxCharges: 999, cooldownTime: 0, defaultDirection: 'right', effectType: 'smash' },
        { emoji: '🦴', name: '骨棒', attack: 11, type: 'melee', range: 95, attackSpeed: 550, maxCharges: 999, cooldownTime: 0, defaultDirection: 'top', effectType: 'stab' },
        { emoji: '🔪', name: '菜刀', attack: 11, type: 'melee', range: 80, attackSpeed: 550, maxCharges: 999, cooldownTime: 0, defaultDirection: 'right', effectType: 'slash' },
        { emoji: '🏏', name: '板球拍', attack: 12, type: 'melee', range: 100, attackSpeed: 650, maxCharges: 999, cooldownTime: 0, defaultDirection: 'left', effectType: 'smash' },
        { emoji: '🏹', name: '弓箭', attack: 9, type: 'ranged', range: 250, attackSpeed: 600, maxCharges: 1, cooldownTime: 1000, defaultDirection: 'right', effectType: 'arrow' },
        { emoji: '🔫', name: '枪', attack: 15, type: 'ranged', range: 300, attackSpeed: 600, maxCharges: 6, cooldownTime: 3000, defaultDirection: 'left', effectType: 'bullet' },
        { emoji: '🏐', name: '排球', attack: 9, type: 'ranged', range: 150, attackSpeed: 500, maxCharges: 3, cooldownTime: 1500, defaultDirection: 'right', knockbackDistance: 40, effectType: 'arrow' },
        { emoji: '💣', name: '炸弹', attack: 20, type: 'aoe', range: 180, attackSpeed: 900, maxCharges: 2, cooldownTime: 2500, defaultDirection: 'right', aoeRadius: 120, effectType: 'explosion' },
        { emoji: '⚡', name: '闪电', attack: 14, type: 'ranged', range: 170, attackSpeed: 700, maxCharges: 2, cooldownTime: 3000, defaultDirection: 'top', ignoreDefense: true, effectType: 'lightning' },
        { emoji: '🔥', name: '火', attack: 12, type: 'ranged', range: 180, attackSpeed: 600, maxCharges: 2, cooldownTime: 4000, defaultDirection: 'top', burnDuration: 5000, burnInterval: 500, effectType: 'fire' },
        { emoji: '🧊', name: '冰冻', attack: 10, type: 'aoe', range: 220, attackSpeed: 700, maxCharges: 1, cooldownTime: 2500, defaultDirection: 'right', aoeRadius: 120, freezeDuration: 1500, effectType: 'ice' },
        { emoji: '🍼', name: '奶瓶', attack: 1, heal: 20, type: 'heal', range: 220, attackSpeed: 1200, maxCharges: 4, cooldownTime: 2000, defaultDirection: 'top', effectType: 'heal' },
        { emoji: '💊', name: '药丸', attack: 1, heal: 28, type: 'heal', range: 200, attackSpeed: 1000, maxCharges: 3, cooldownTime: 3000, defaultDirection: 'top', effectType: 'heal' },
        { emoji: '💉', name: '兴奋剂', attack: 1, type: 'buff', range: 150, attackSpeed: 800, maxCharges: 1, cooldownTime: 3000, defaultDirection: 'top', buffDuration: 3500, buffMultiplier: 3.0, effectType: 'buff' },
        { emoji: '🚀', name: '自爆火箭', attack: 180, type: 'melee', range: 20, attackSpeed: 500, maxCharges: 1, cooldownTime: 0, defaultDirection: 'right', aoeRadius: 150, chargeSpeed: 300, deathExplosionMultiplier: 0.50, isSelfDestruct: true, effectType: 'explosion' }
    ]
};

const WEAPON_BEHAVIORS = {
    heal: {
        update: function(iconData, context) {
            handleHealerBehavior(iconData);
        }
    },
    buff: {
        update: function(iconData, context) {
            handleBuffBehavior(iconData);
        }
    },
    selfDestruct: {
        update: function(iconData, context) {
            handleRocketCharge(iconData);
        }
    },
    combat: {
        update: function(iconData, context) {
            const { isVictory, squadBattleMode } = context;
            
            if (squadBattleMode) {
                if (squadLeaders[`player${iconData.player}`] === iconData) {
                    handleSquadLeaderBehavior(iconData);
                } else {
                    handleSquadMemberBehavior(iconData);
                }
            } else {
                if (isVictory) {
                    moveTowardsTarget(iconData);
                } else {
                    const enemyPlayer = iconData.player === 1 ? 2 : 1;
                    const enemies = battleIcons[`player${enemyPlayer}`].filter(e => !e.isDead);
                    const aiConfig = getAIConfig(iconData.aiType);
                    
                    if (shouldRetreatByAI(iconData, enemies)) {
                        const retreatPos = findRetreatPosition(iconData, enemies);
                        iconData.targetX = retreatPos.x;
                        iconData.targetY = retreatPos.y;
                        moveTowardsTarget(iconData);
                    } else {
                        const enemy = findTargetByAI(iconData);
                        if (enemy) {
                            const distance = getDistanceBetween(iconData, enemy);
                            const effectiveRange = iconData.weapon.range * iconSize;
                            const meleeOffset = (iconData.weapon.type === 'melee' ? GAME_CONFIG.movement.meleeApproachOffset * iconSize : 0);
                            const approachOffset = meleeOffset * aiConfig.approachBias;
                            
                            if (distance < effectiveRange) {
                                attack(iconData, enemy);
                            } else {
                                iconData.targetX = enemy.x + (iconData.player === 2 ? approachOffset : -approachOffset);
                                iconData.targetY = enemy.y;
                                moveTowardsTarget(iconData);
                            }
                        }
                    }
                }
            }
        }
    }
};

function getWeaponBehavior(iconData) {
    if (iconData.weapon.isSelfDestruct) {
        return WEAPON_BEHAVIORS.selfDestruct;
    }
    if (iconData.weapon.type === 'heal') {
        return WEAPON_BEHAVIORS.heal;
    }
    if (iconData.weapon.type === 'buff') {
        return WEAPON_BEHAVIORS.buff;
    }
    return WEAPON_BEHAVIORS.combat;
}

// 播放游戏音效
// @param {string} type - 音效类型，如'attack'、'hit'、'kill'等
function playSound(type) {
    // 如果音频上下文被暂停，恢复它
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
    
    // 创建振荡器和增益节点
    const oscillator = audioContext.createOscillator();  // 振荡器，用于生成音频
    const gainNode = audioContext.createGain();        // 增益节点，用于控制音量
    
    // 连接音频节点
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // 根据音效类型设置不同的音频参数
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

function generateRandomStats() {
    return {
        health: Math.floor(Math.random() * (GAME_CONFIG.randomStats.health.max - GAME_CONFIG.randomStats.health.min)) + GAME_CONFIG.randomStats.health.min,
        maxHealth: 0,
        attack: Math.floor(Math.random() * (GAME_CONFIG.randomStats.attack.max - GAME_CONFIG.randomStats.attack.min)) + GAME_CONFIG.randomStats.attack.min,
        defense: Math.floor(Math.random() * (GAME_CONFIG.randomStats.defense.max - GAME_CONFIG.randomStats.defense.min)) + GAME_CONFIG.randomStats.defense.min,
        armor: Math.floor(Math.random() * (GAME_CONFIG.randomStats.armor.max - GAME_CONFIG.randomStats.armor.min)) + GAME_CONFIG.randomStats.armor.min,
        speed: Math.floor(Math.random() * (GAME_CONFIG.randomStats.speed.max - GAME_CONFIG.randomStats.speed.min)) + GAME_CONFIG.randomStats.speed.min,
        critRate: GAME_CONFIG.combat.damage.baseCritRate + Math.random() * 0.1,
        critDamage: GAME_CONFIG.combat.damage.baseCritDamage + Math.random() * 0.5,
        lifeSteal: GAME_CONFIG.combat.damage.baseLifeSteal + Math.random() * 0.05
    };
}

function assignAIType(weaponType) {
    const bias = GAME_CONFIG.combat.ai.weaponTypeBias[weaponType] || 
                 GAME_CONFIG.combat.ai.weaponTypeBias['melee'];
    
    const rand = Math.random();
    let cumulative = 0;
    
    for (const type of GAME_CONFIG.combat.ai.types) {
        cumulative += bias[type] || 0;
        if (rand <= cumulative) {
            return type;
        }
    }
    
    return 'balanced';
}

function getAIConfig(aiType) {
    return GAME_CONFIG.combat.ai[aiType] || GAME_CONFIG.combat.ai.balanced;
}

function triggerUpload(player) {
    currentUploadPlayer = player;
    document.getElementById('fileInput').click();
}

// 处理文件选择事件
// @param {Event} event - 文件选择事件对象
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
    iconItem.dataset.level = 1;
    
    const defaultIconSize = 0.8;
    const readyBaseSize = 70;
    const readyIconSize = readyBaseSize * (iconSize / defaultIconSize);
    iconItem.style.width = `${readyIconSize}px`;
    iconItem.style.height = `${readyIconSize}px`;
    
    const randomWeaponIndex = Math.floor(Math.random() * GAME_CONFIG.weapons.length);
    iconItem.dataset.assignedWeaponIndex = randomWeaponIndex;
    
    const img = document.createElement('img');
    img.src = imageUrl;
    iconItem.appendChild(img);
    
    const weaponEmoji = document.createElement('div');
    weaponEmoji.className = 'icon-weapon-emoji';
    weaponEmoji.textContent = GAME_CONFIG.weapons[randomWeaponIndex].emoji;
    iconItem.appendChild(weaponEmoji);
    
    const levelBadge = document.createElement('div');
    levelBadge.className = 'icon-level-badge';
    levelBadge.textContent = 'Lv1';
    iconItem.appendChild(levelBadge);
    
    iconItem.addEventListener('dragstart', handleIconDragStart);
    iconItem.addEventListener('dragend', handleIconDragEnd);
    
    let clickTimeout = null;
    let clickCount = 0;
    let isTouchAction = false;
    
    iconItem.addEventListener('click', (e) => {
        if (isTouchAction) {
            isTouchAction = false;
            return;
        }
        
        clickCount++;
        
        if (clickCount === 1) {
            clickTimeout = setTimeout(() => {
                if (clickCount === 1) {
                    const battleArea = document.getElementById('battleArea');
                    const battleZone = document.getElementById(`player${player}BattleZone`);
                    
                    const centerX = battleZone.offsetLeft + battleZone.offsetWidth / 2;
                    const centerY = battleZone.offsetTop + battleZone.offsetHeight / 2;
                    
                    let assignedWeapon = null;
                    if (iconItem.dataset.assignedWeaponIndex !== undefined) {
                        assignedWeapon = GAME_CONFIG.weapons[parseInt(iconItem.dataset.assignedWeaponIndex)];
                    }
                    
                    const level = parseInt(iconItem.dataset.level) || 1;
                    
                    const battleIcon = createBattleIcon(imageUrl, player, centerX, centerY, name, assignedWeapon, level);
                    battleArea.appendChild(battleIcon);
                    
                    updateBattleStats();
                    
                    iconItem.remove();
                }
                clickCount = 0;
                clickTimeout = null;
            }, GAME_CONFIG.timing.clickDelay);
        } else if (clickCount === 2) {
            if (clickTimeout) {
                clearTimeout(clickTimeout);
                clickTimeout = null;
            }
            iconItem.remove();
            clickCount = 0;
        }
    });
    
    let touchTimeout = null;
    let touchCount = 0;
    let lastTouchTime = 0;
    let touchStartX = 0;
    let touchStartY = 0;
    let isDragging = false;
    
    iconItem.addEventListener('touchstart', (e) => {
        e.preventDefault();
        isTouchAction = true;
        
        const touch = e.touches[0];
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
        isDragging = false;
        
        const currentTime = Date.now();
        if (currentTime - lastTouchTime < GAME_CONFIG.timing.clickDelay) {
            touchCount++;
        } else {
            touchCount = 1;
        }
        lastTouchTime = currentTime;
        
        if (touchTimeout) {
            clearTimeout(touchTimeout);
        }
        
        touchTimeout = setTimeout(() => {
            if (touchCount === 1 && !isDragging) {
                const battleArea = document.getElementById('battleArea');
                const battleZone = document.getElementById(`player${player}BattleZone`);
                
                const centerX = battleZone.offsetLeft + battleZone.offsetWidth / 2;
                const centerY = battleZone.offsetTop + battleZone.offsetHeight / 2;
                
                let assignedWeapon = null;
                if (iconItem.dataset.assignedWeaponIndex !== undefined) {
                    assignedWeapon = GAME_CONFIG.weapons[parseInt(iconItem.dataset.assignedWeaponIndex)];
                }
                
                const level = parseInt(iconItem.dataset.level) || 1;
                
                const battleIcon = createBattleIcon(imageUrl, player, centerX, centerY, name, assignedWeapon, level);
                battleArea.appendChild(battleIcon);
                
                updateBattleStats();
                
                iconItem.remove();
            } else if (touchCount >= 2 && !isDragging) {
                iconItem.remove();
            }
            touchCount = 0;
            touchTimeout = null;
        }, GAME_CONFIG.timing.clickDelay);
        
        const rect = iconItem.getBoundingClientRect();
        
        const clone = iconItem.cloneNode(true);
        clone.style.position = 'fixed';
        clone.style.left = `${rect.left}px`;
        clone.style.top = `${rect.top}px`;
        clone.style.width = `${rect.width}px`;
        clone.style.height = `${rect.height}px`;
        clone.style.zIndex = '100';
        clone.style.opacity = '0.8';
        clone.style.pointerEvents = 'none';
        clone.id = 'touch-drag-clone';
        document.body.appendChild(clone);
        
        const offsetX = touch.clientX - rect.left;
        const offsetY = touch.clientY - rect.top;
        
        function onTouchMove(e) {
            const touch = e.touches[0];
            const moveDistance = Math.sqrt(
                Math.pow(touch.clientX - touchStartX, 2) + 
                Math.pow(touch.clientY - touchStartY, 2)
            );
            
            if (moveDistance > 10) {
                isDragging = true;
            }
            
            clone.style.left = `${touch.clientX - offsetX}px`;
            clone.style.top = `${touch.clientY - offsetY}px`;
        }
        
        function onTouchEnd(e) {
            const touch = e.changedTouches[0];
            const battleArea = document.getElementById('battleArea');
            const battleRect = battleArea.getBoundingClientRect();
            
            if (isDragging) {
                if (touchTimeout) {
                    clearTimeout(touchTimeout);
                    touchTimeout = null;
                }
                
                if (touch.clientX >= battleRect.left && touch.clientX <= battleRect.right &&
                    touch.clientY >= battleRect.top && touch.clientY <= battleRect.bottom) {
                    const x = touch.clientX - battleRect.left - 40;
                    const y = touch.clientY - battleRect.top - 40;
                    
                    let assignedWeapon = null;
                    if (iconItem.dataset.assignedWeaponIndex !== undefined) {
                        assignedWeapon = GAME_CONFIG.weapons[parseInt(iconItem.dataset.assignedWeaponIndex)];
                    }
                    
                    const level = parseInt(iconItem.dataset.level) || 1;
                    
                    const battleIcon = createBattleIcon(imageUrl, player, x, y, name, assignedWeapon, level);
                    battleArea.appendChild(battleIcon);
                    
                    updateBattleStats();
                    
                    iconItem.remove();
                }
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
        }, GAME_CONFIG.timing.shortDelay);
    }, GAME_CONFIG.timing.longDelay);
}

function createBattleIcon(iconUrl, player, x, y, name = '', assignedWeapon = null, level = 1) {
    const stats = generateRandomStats();
    stats.maxHealth = stats.health;
    
    const battleIcon = document.createElement('div');
    battleIcon.className = `battle-icon player${player}`;
    battleIcon.style.left = `${x}px`;
    battleIcon.style.top = `${y}px`;
    battleIcon.style.zIndex = Math.floor(y);
    battleIcon.dataset.player = player;
    battleIcon.dataset.iconId = iconIdCounter++;
    battleIcon.dataset.name = name;
    battleIcon.style.transform = `scale(${iconSize})`;
    battleIcon.style.setProperty('--icon-size', iconSize);
    
    // 计算脚的精确位置，用于死亡动画的旋转支点
    // 主图标高度80px，腿底部在主图标底部下方40px
    // 实际观察调整：增加10px偏移让旋转支点更靠近地面
    const footPositionFromTop = 80 + 40 + 10; // 130px
    const scaledFootPosition = footPositionFromTop * iconSize;
    battleIcon.style.setProperty('--foot-position', scaledFootPosition);
    
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
    
    const weaponWrapper = document.createElement('div');
    weaponWrapper.className = 'weapon-wrapper';
    
    const weaponInner = document.createElement('div');
    weaponInner.className = 'weapon-inner';
    
    const weaponData = assignedWeapon || GAME_CONFIG.weapons[Math.floor(Math.random() * GAME_CONFIG.weapons.length)];
    weaponInner.textContent = weaponData.emoji;
    weaponInner.dataset.type = weaponData.type;
    weaponInner.dataset.effect = weaponData.effectType;
    weaponWrapper.dataset.defaultDirection = weaponData.defaultDirection;
    
    if (player === 1) {
        weaponWrapper.style.right = `${-30 * iconSize}px`;
        weaponWrapper.style.left = 'auto';
    } else {
        weaponWrapper.style.left = `${-30 * iconSize}px`;
        weaponWrapper.style.right = 'auto';
    }
    
    weaponWrapper.appendChild(weaponInner);
    battleIcon.appendChild(weaponWrapper);
    
    const statsDisplay = document.createElement('div');
    statsDisplay.className = 'stats-display';
    const totalAttack = (stats.attack || 0) + (weaponData.attack || 0);
    statsDisplay.innerHTML = `AT:${totalAttack} DE:${stats.defense} AR:${stats.armor}`;
    battleIcon.appendChild(statsDisplay);
    
    const iconData = {
        element: battleIcon,
        healthBarFill: healthBarFill,
        statsDisplay: statsDisplay,
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
        aiType: assignAIType(weaponData.type),
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
        kills: 0,
        isCharging: false,
        chargeTarget: null,
        chargeStartTime: 0
    };
    
    if (level > 1) {
        for (let i = 1; i < level; i++) {
            LevelUp(iconData);
        }
    }
    
    battleIcons[`player${player}`].push(iconData);
    
    const iconsList = document.getElementById(`player${player}IconsList`);
    const iconListItem = document.createElement('div');
    iconListItem.className = 'battle-icon-item';
    iconListItem.id = `icon-list-item-${iconIdCounter - 1}`;
    iconListItem.innerHTML = `
        <span class="icon-name">${name || '未知图标'}(Lv${level})${weaponData.emoji}</span>
        <span class="icon-health">${stats.health}/${stats.maxHealth}</span>
    `;
    
    // 添加点击事件监听器，显示详情面板
    iconListItem.addEventListener('click', () => {
        showIconDetailPanel(iconData, player);
    });
    
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
            
            iconData.x = Math.max(GAME_CONFIG.movement.boundaryMargin * iconSize, Math.min(rect.width - GAME_CONFIG.movement.boundaryMargin * iconSize, newX));
            iconData.y = Math.max(GAME_CONFIG.movement.boundaryMargin * iconSize, Math.min(rect.height - GAME_CONFIG.movement.boundaryMargin * iconSize, newY));
            iconData.targetX = iconData.x;
            iconData.targetY = iconData.y;
            
            iconData.element.style.left = `${iconData.x}px`;
            iconData.element.style.top = `${iconData.y}px`;
            iconData.element.style.zIndex = Math.floor(iconData.y);
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
            
            iconData.x = Math.max(GAME_CONFIG.movement.boundaryMargin * iconSize, Math.min(rect.width - GAME_CONFIG.movement.boundaryMargin * iconSize, newX));
            iconData.y = Math.max(GAME_CONFIG.movement.boundaryMargin * iconSize, Math.min(rect.height - GAME_CONFIG.movement.boundaryMargin * iconSize, newY));
            iconData.targetX = iconData.x;
            iconData.targetY = iconData.y;
            
            iconData.element.style.left = `${iconData.x}px`;
            iconData.element.style.top = `${iconData.y}px`;
            iconData.element.style.zIndex = Math.floor(iconData.y);
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
    if (iconData.kills % GAME_CONFIG.upgrade.killsPerLevel === 0 && iconData.level < GAME_CONFIG.upgrade.maxLevel) {
        LevelUp(iconData);
    }
}

function LevelUp(iconData) {
    iconData.level++;
    
    const statMultiplier = 1 + GAME_CONFIG.upgrade.statIncreasePercent;
    
    iconData.stats.attack = Math.round(iconData.stats.attack * statMultiplier);
    iconData.stats.defense = Math.round(iconData.stats.defense * statMultiplier);
    iconData.stats.speed = Math.round(iconData.stats.speed * statMultiplier);
    iconData.stats.maxHealth = Math.round(iconData.stats.maxHealth * statMultiplier * GAME_CONFIG.combat.damage.levelUpMaxHealthBonus);
    iconData.stats.health = Math.min(iconData.stats.health + Math.round(iconData.stats.maxHealth * GAME_CONFIG.combat.damage.levelUpHealPercent), iconData.stats.maxHealth);
    
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
    }, GAME_CONFIG.timing.mediumDelay);
}

// 准备攻击 - 处理攻击前的通用逻辑
function prepareAttack(attacker, target) {
    attacker.isAttacking = true;
    attacker.element.classList.add('attacking');
    playSound('attack');
    
    const weaponWrapper = attacker.element.querySelector('.weapon-wrapper');
    const defaultDirection = weaponWrapper.dataset.defaultDirection;
    
    const dx = target.x - attacker.x;
    
    if (dx > 0) {
        attacker.element.classList.remove('facing-left');
        attacker.element.classList.add('facing-right');
        
        weaponWrapper.style.right = '-30px';
        weaponWrapper.style.left = 'auto';
        
        if (defaultDirection === 'top') {
            weaponWrapper.style.transform = 'rotate(90deg)';
        } else if (defaultDirection === 'right') {
            weaponWrapper.style.transform = 'scaleX(1)';
        } else if (defaultDirection === 'left') {
            weaponWrapper.style.transform = 'scaleX(-1)';
        }
    } else if (dx < 0) {
        attacker.element.classList.remove('facing-right');
        attacker.element.classList.add('facing-left');
        
        weaponWrapper.style.left = '-30px';
        weaponWrapper.style.right = 'auto';
        
        if (defaultDirection === 'top') {
            weaponWrapper.style.transform = 'rotate(-90deg)';
        } else if (defaultDirection === 'right') {
            weaponWrapper.style.transform = 'scaleX(-1)';
        } else if (defaultDirection === 'left') {
            weaponWrapper.style.transform = 'scaleX(1)';
        }
    }
}

// 计算带防御的伤害值
// @param {Object} attacker - 攻击者对象，包含攻击力等属性
// @param {Object} target - 目标对象，包含防御力和护甲等属性
// @returns {Object} - 包含伤害值和是否闪避的对象
// @property {number} damage - 计算出的伤害值
// @property {boolean} isDodged - 目标是否闪避了攻击
function calculateDamageWithDefense(attacker, target) {
    const totalAttack = attacker.stats.attack + (attacker.weapon.attack || 0);
    const baseDamage = totalAttack;
    const defense = target.stats.defense;
    const armor = target.stats.armor;
    const { randomMin, randomMax, defenseFactor } = GAME_CONFIG.combat.damage;
    const randomFactor = Math.random() * (randomMax - randomMin) + randomMin;
    
    const dodgeChance = target.stats.speed * GAME_CONFIG.combat.dodge.speedFactor;
    const isDodged = Math.random() < dodgeChance;
    
    let isCrit = false;
    let critMultiplier = 1;
    
    if (!isDodged) {
        const critRate = attacker.stats.critRate || GAME_CONFIG.combat.damage.baseCritRate;
        isCrit = Math.random() < critRate;
        if (isCrit) {
            critMultiplier = attacker.stats.critDamage || GAME_CONFIG.combat.damage.baseCritDamage;
        }
    }
    
    const damage = isDodged ? 0 : Math.max(GAME_CONFIG.combat.damage.minDamage, Math.floor((baseDamage - defense * defenseFactor) * randomFactor * critMultiplier / armor));
    
    return { damage, isDodged, isCrit };
}

// 应用伤害效果
// @param {Object} attacker - 攻击者对象
// @param {Object} target - 目标对象
// @param {number} damage - 伤害值
// @param {string} effectType - 伤害效果类型，如'normal'、'slash'、'stab'等
function applyDamageEffects(attacker, target, damage, effectType = 'normal', isCrit = false) {
    if (damage === 0) {
        playSound('dodge');
        createEffectText(target.element, '闪避!', '#00ffff', 'dodge').show();
    } else {
        playSound('hit');
        target.stats.health -= damage;
        
        target.element.classList.add('hit');
        
        if (isCrit) {
            createEffectText(target.element, `暴击!${damage}`, '#ffd700', 'crit').show();
        } else {
            showDamageText(target, damage, effectType);
        }
        
        if (effectType) {
            showWeaponEffect(attacker, target, effectType);
        }
        
        const lifeSteal = attacker.stats.lifeSteal || 0;
        if (lifeSteal > 0 && attacker.stats.health < attacker.stats.maxHealth) {
            const healAmount = Math.floor(damage * lifeSteal);
            if (healAmount > 0) {
                attacker.stats.health = Math.min(attacker.stats.maxHealth, attacker.stats.health + healAmount);
                updateHealthBar(attacker);
                showHealText(attacker, healAmount);
            }
        }
        
        setTimeout(() => {
            target.element.classList.remove('hit');
        }, GAME_CONFIG.timing.shortDelay);
        
        updateHealthBar(target);
    }
}

// 处理目标死亡
function handleTargetDeath(attacker, target) {
    if (target.stats.health <= 0 && !target.hasBeenKilled) {
        playSound('kill');
        playSound('death');
        target.isDead = true;
        target.hasBeenKilled = true;
        
        // 确定倒地方向：根据攻击者位置
        target.element.classList.add('dead');
        if (attacker.x < target.x) {
            // 攻击者在左侧，目标向右倒
            target.element.classList.add('fall-right');
        } else {
            // 攻击者在右侧，目标向左倒
            target.element.classList.add('fall-left');
        }
        target.element.classList.remove('moving');
        target.element.classList.remove('attacking');
        target.element.classList.remove('facing-right');
        target.element.classList.remove('facing-left');
        
        if (target.listItem) {
            target.listItem.classList.add('dead');
            target.listItem.querySelector('.icon-health').textContent = `0/${target.stats.maxHealth}`;
        }
        
        attacker.kills++;
        battleStats[`player${attacker.player}`].kills++;
        
        // 记录击杀信息，使击杀tab有数据
        addBattleInfo(attacker, target, 0, 'kill');
        
        // 检查升级
        checkLevelUp(attacker);
        
        // 自爆火箭死亡时触发被动自爆
        if (target.weapon.isSelfDestruct) {
            triggerDeathExplosion(target);
        }
        
        EventBus.emit(GameEvents.ICON_DIED, { target, attacker });
        EventBus.emit(GameEvents.ICON_KILLED, { killer: attacker, victim: target });
        
        // 延迟移除死亡的战斗图标
        setTimeout(() => {
            removeBattleIcon(target);
        }, GAME_CONFIG.timing.extraLongDelay);
    }
}
// 更新血条
function updateHealthBar(iconData) {
    const healthBarFill = iconData.element.querySelector('.health-bar-fill');
    const healthPercent = (iconData.stats.health / iconData.stats.maxHealth) * 100;
    healthBarFill.style.width = `${Math.max(0, healthPercent)}%`;
    
    const currentHealth = iconData.stats.health;
    let healthColor;
    
    if (currentHealth >= 750) {
        healthColor = '#ffd700';
    } else if (currentHealth >= 500) {
        healthColor = '#44ff44';
    } else if (currentHealth >= 250) {
        healthColor = '#4dffff';
    } else {
        healthColor = '#ff4444';
    }
    
    healthBarFill.style.background = healthColor;
    
    const statsDisplay = iconData.element.querySelector('.stats-display');
    statsDisplay.innerHTML = `AT:${iconData.stats.attack} DE:${iconData.stats.defense} AR:${iconData.stats.armor}`;
    
    if (iconData.listItem) {
        const healthText = iconData.listItem.querySelector('.icon-health');
        healthText.textContent = `${Math.max(0, iconData.stats.health)}/${iconData.stats.maxHealth}`;
    }
}

// 特效文字管理类
class EffectText {
    constructor() {
        this.element = null;
        this.parentElement = null;
        this._timer = null;
    }
    
    init(parentElement, text, color = '#ffffff', type = 'normal') {
        this.parentElement = parentElement;
        
        if (!this.element) {
            this.element = document.createElement('div');
            this.element.className = 'effect-text';
        }
        
        this.element.className = 'effect-text';
        this.element.classList.add(`${type}-text`);
        this.element.textContent = text;
        this.element.style.left = '50%';
        this.element.style.top = '0';
        this.element.style.transform = 'translateX(-50%)';
        this.element.style.color = color;
        this.element.style.display = '';
        
        return this;
    }
    
    show() {
        if (!this.parentElement || !this.element) return this;
        
        this.parentElement.appendChild(this.element);
        
        if (this._timer) {
            clearTimeout(this._timer);
        }
        this._timer = setTimeout(() => {
            this.remove();
        }, GAME_CONFIG.timing.mediumDelay);
        
        return this;
    }
    
    remove() {
        if (this._timer) {
            clearTimeout(this._timer);
            this._timer = null;
        }
        
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
        
        EffectTextPool.return(this);
    }
}

const EffectTextPool = {
    pool: [],
    maxSize: 50,
    
    get: function() {
        if (this.pool.length > 0) {
            return this.pool.pop();
        }
        return new EffectText();
    },
    
    return: function(effectText) {
        if (this.pool.length < this.maxSize) {
            if (effectText.element) {
                effectText.element.className = 'effect-text';
                effectText.element.style.display = 'none';
            }
            effectText.parentElement = null;
            this.pool.push(effectText);
        }
    }
};

function createEffectText(parentElement, text, color, type) {
    const effectText = EffectTextPool.get();
    effectText.init(parentElement, text, color, type);
    return effectText;
}

function showDamageText(iconData, damage, damageType = 'normal') {
    // 设置不同伤害类型的颜色
    const damageColors = {
        'slash': '#ff6b6b',
        'stab': '#e74c3c',
        'chop': '#c0392b',
        'smash': '#8e44ad',
        'pierce': '#3498db',
        'dig': '#7f8c8d',
        'arrow': '#2ecc71',
        'bullet': '#f39c12',
        'lightning': '#f1c40f',
        'fire': '#e74c3c',
        'explosion': '#e67e22',
        'normal': '#ffffff'
    };
    
    const color = damageColors[damageType] || damageColors['normal'];
    
    // 使用EffectText类创建伤害文字
    createEffectText(iconData.element, `-${damage}`, color, 'damage').show();
}

function showHealText(iconData, healAmount) {
    // 使用EffectText类创建治疗文字，使用绿色
    createEffectText(iconData.element, `+${healAmount}`, '#2ecc71', 'heal').show();
}

function addHealBattleInfo(attacker, target, healAmount) {
    addBattleInfo(attacker, target, healAmount, 'heal');
}

function showWeaponEffect(attacker, defender, effectType) {
    if (!effectType) return;
    
    const battleArea = document.getElementById('battleArea');
    
    // 根据效果类型选择特效实现
    switch(effectType) {
        case 'slash':
            createSlashEffect(attacker, defender, battleArea);
            break;
        case 'stab':
            createStabEffect(attacker, defender, battleArea);
            break;
        case 'chop':
            createChopEffect(attacker, defender, battleArea);
            break;
        case 'smash':
            createSmashEffect(attacker, defender, battleArea);
            break;
        case 'pierce':
            createPierceEffect(attacker, defender, battleArea);
            break;
        case 'dig':
            createDigEffect(attacker, defender, battleArea);
            break;
        case 'arrow':
            createArrowEffect(attacker, defender, battleArea);
            break;
        case 'bullet':
            createBulletEffect(attacker, defender, battleArea);
            break;
        case 'lightning':
            createLightningSingleEffect(attacker, defender, battleArea);
            break;
        case 'fire':
            createFireSingleEffect(attacker, defender, battleArea);
            break;
        case 'heal':
            createHealEffect(attacker, defender, battleArea);
            break;
        case 'buff':
            createBuffEffect(attacker, defender, battleArea);
            break;
        default:
            createDefaultEffect(attacker, defender, battleArea);
    }
}

// 武器特效函数库
function createBaseEffect(attacker, defender, battleArea, className, options = {}) {
    const effect = document.createElement('div');
    effect.className = `weapon-effect ${className}`;
    
    const effectX = defender.x + 40;
    const effectY = defender.y + 40;
    
    effect.style.left = `${effectX}px`;
    effect.style.top = `${effectY}px`;
    effect.style.setProperty('--icon-size', iconSize);
    
    if (options.opacity) effect.style.opacity = options.opacity;
    if (options.color) effect.style.color = options.color;
    if (options.backgroundColor) effect.style.backgroundColor = options.backgroundColor;
    
    battleArea.appendChild(effect);
    
    const removeDelay = options.removeDelay || GAME_CONFIG.timing.shortDelay;
    setTimeout(() => {
        effect.remove();
    }, removeDelay);
    
    return effect;
}

function createSlashEffect(attacker, defender, battleArea) {
    const effect = createBaseEffect(attacker, defender, battleArea, 'slash-effect');
    
    // 添加额外的视觉效果
    const slash1 = document.createElement('div');
    slash1.className = 'slash-part';
    slash1.style.transform = 'rotate(45deg)';
    
    const slash2 = document.createElement('div');
    slash2.className = 'slash-part';
    slash2.style.transform = 'rotate(-45deg)';
    
    effect.appendChild(slash1);
    effect.appendChild(slash2);
}

function createStabEffect(attacker, defender, battleArea) {
    createBaseEffect(attacker, defender, battleArea, 'stab-effect');
}

function createChopEffect(attacker, defender, battleArea) {
    createBaseEffect(attacker, defender, battleArea, 'chop-effect');
}

function createSmashEffect(attacker, defender, battleArea) {
    createBaseEffect(attacker, defender, battleArea, 'smash-effect', { removeDelay: GAME_CONFIG.timing.mediumDelay });
    
    const isPortrait = window.matchMedia('(orientation: portrait)').matches;
    const shakeAnimation = isPortrait ? 'shake-portrait' : 'shake';
    defender.element.style.animation = `${shakeAnimation} 0.5s ease-in-out`;
    setTimeout(() => {
        defender.element.style.animation = '';
    }, 500);
}

function createPierceEffect(attacker, defender, battleArea) {
    createBaseEffect(attacker, defender, battleArea, 'pierce-effect');
}

function createDigEffect(attacker, defender, battleArea) {
    createBaseEffect(attacker, defender, battleArea, 'dig-effect');
}

function createArrowEffect(attacker, defender, battleArea) {
    createBaseEffect(attacker, defender, battleArea, 'arrow-effect');
}

function createBulletEffect(attacker, defender, battleArea) {
    createBaseEffect(attacker, defender, battleArea, 'bullet-effect');
}

function createLightningSingleEffect(attacker, defender, battleArea) {
    const effect = createBaseEffect(attacker, defender, battleArea, 'lightning-single-effect', { removeDelay: GAME_CONFIG.timing.mediumDelay });
    
    for (let i = 0; i < 3; i++) {
        setTimeout(() => {
            const branch = document.createElement('div');
            branch.className = 'lightning-branch';
            branch.style.left = `${Math.random() * 40 - 20}px`;
            branch.style.top = `${Math.random() * 40 - 20}px`;
            branch.style.transform = `rotate(${Math.random() * 90 - 45}deg)`;
            effect.appendChild(branch);
        }, i * 50);
    }
}

function createFireSingleEffect(attacker, defender, battleArea) {
    const effect = createBaseEffect(attacker, defender, battleArea, 'fire-single-effect', { removeDelay: GAME_CONFIG.timing.mediumDelay });
    
    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            const particle = document.createElement('div');
            particle.className = 'fire-particle';
            particle.style.left = `${Math.random() * 40 - 20}px`;
            particle.style.top = `${Math.random() * 40 - 20}px`;
            particle.style.transform = `scale(${0.5 + Math.random() * 0.5})`;
            particle.style.animationDelay = `${i * 100}ms`;
            effect.appendChild(particle);
        }, i * 30);
    }
}

function createHealEffect(attacker, defender, battleArea) {
    const effect = createBaseEffect(attacker, defender, battleArea, 'heal-effect', { removeDelay: GAME_CONFIG.timing.mediumDelay });
    
    for (let i = 0; i < 8; i++) {
        setTimeout(() => {
            const particle = document.createElement('div');
            particle.className = 'heal-particle';
            particle.style.left = `${Math.random() * 40 - 20}px`;
            particle.style.top = `${Math.random() * 40 - 20}px`;
            particle.style.transform = `scale(${0.4 + Math.random() * 0.6}) rotate(${Math.random() * 360}deg)`;
            particle.textContent = '✦';
            particle.style.animationDelay = `${i * 60}ms`;
            effect.appendChild(particle);
        }, i * 40);
    }
}

function createBuffEffect(attacker, defender, battleArea) {
    const effect = createBaseEffect(attacker, defender, battleArea, 'buff-single-effect', { removeDelay: GAME_CONFIG.timing.mediumDelay });
    
    for (let i = 0; i < 4; i++) {
        setTimeout(() => {
            const glow = document.createElement('div');
            glow.className = 'buff-single-glow';
            glow.style.left = '0';
            glow.style.top = '0';
            glow.style.width = '100%';
            glow.style.height = '100%';
            glow.style.animationDelay = `${i * 150}ms`;
            effect.appendChild(glow);
        }, i * 80);
    }
}

function createDefaultEffect(attacker, defender, battleArea) {
    createBaseEffect(attacker, defender, battleArea, 'default-effect');
}

function addBattleInfo(attacker, defender, value, actionType = 'attack') {
    if (!battleInfoElement) {
        battleInfoElement = document.getElementById('battleInfo');
    }
    const battleInfo = battleInfoElement;
    const infoItem = document.createElement('div');
    infoItem.className = 'battle-info-item';
    infoItem.dataset.player = attacker.player;
    infoItem.dataset.action = actionType;
    
    const attackerName = attacker.name || '未知图标';
    const weaponName = attacker.weapon.emoji || attacker.weapon.name;
    const attackerLevel = attacker.level || 1;
    
    if (actionType === '开始冲锋') {
        const defenderName = defender?.name || '未知图标';
        const defenderLevel = defender?.level || 1;
        infoItem.innerHTML = `<span class="player">玩家${attacker.player}</span>：<span class="attacker">${attackerName}(Lv${attackerLevel})</span><span class="weapon">${weaponName}</span>开始冲锋<span class="target">${defenderName}(Lv${defenderLevel})</span>`;
    } else if (actionType === '自爆伤害') {
        const defenderName = defender?.name || '未知图标';
        const defenderLevel = defender?.level || 1;
        infoItem.innerHTML = `<span class="player">玩家${attacker.player}</span>：<span class="attacker">${attackerName}(Lv${attackerLevel})</span><span class="weapon">${weaponName}</span>自爆伤害<span class="target">${defenderName}(Lv${defenderLevel})</span>，伤害值 <span class="damage">${value}</span>`;
    } else if (actionType === '自爆死亡') {
        infoItem.innerHTML = `<span class="player">玩家${attacker.player}</span>：<span class="attacker">${attackerName}(Lv${attackerLevel})</span><span class="weapon">${weaponName}</span>自爆死亡`;
    } else if (actionType.includes('血量全满')) {
        infoItem.innerHTML = `<span class="player">玩家${attacker.player}</span>：<span class="attacker">${attackerName}</span><span class="weapon">${weaponName}</span>${actionType}`;
    } else if (actionType === 'kill') {
        const defenderName = defender?.name || '未知图标';
        const defenderLevel = defender?.level || 1;
        infoItem.innerHTML = `<span class="player">玩家${attacker.player}</span>：<span class="attacker">${attackerName}(Lv${attackerLevel})</span><span class="weapon">${weaponName}</span>击杀<span class="target">${defenderName}(Lv${defenderLevel})</span>`;
    } else if (actionType === 'heal') {
        // 治疗事件
        const defenderName = defender?.name || '未知图标';
        const defenderLevel = defender?.level || 1;
        infoItem.innerHTML = `<span class="heal-message">玩家${attacker.player}：<span class="attacker">${attackerName}(Lv${attackerLevel})</span><span class="weapon">${weaponName}</span>治疗<span class="target">${defenderName}(Lv${defenderLevel})</span>，恢复 ${value} 点生命</span>`;
    } else if (actionType === 'lightning' || actionType === 'fire' || actionType === 'ice' || actionType === 'explosion') {
        // AOE攻击事件
        const aoeRadius = attacker.weapon.aoeRadius || GAME_CONFIG.combat.weaponDefaults.aoeRadius;
        const weaponEmoji = attacker.weapon.emoji || '💣';
        const attackName = {
            'lightning': '闪电攻击',
            'fire': '火焰攻击',
            'ice': '冰冻攻击',
            'explosion': '爆炸攻击'
        }[actionType];
        infoItem.innerHTML = `<span class="special-message">玩家${attacker.player}：<span class="attacker">${attackerName}(Lv${attackerLevel})</span>使用<span class="weapon">${weaponEmoji}</span>释放了${attackName}，范围${aoeRadius}</span>`;
    } else if (actionType === 'burn') {
        // 燃烧效果事件
        const burnDamage = Math.max(GAME_CONFIG.combat.damage.minDamage, Math.floor(value * GAME_CONFIG.combat.burn.damageFactor));
        const burnInterval = (attacker.weapon.burnInterval || GAME_CONFIG.combat.burn.defaultInterval) / gameSpeed;
        const defenderName = defender?.name || '未知图标';
        const defenderLevel = defender?.level || 1;
        infoItem.innerHTML = `<span class="special-message">玩家${attacker.player}：<span class="attacker">${attackerName}(Lv${attackerLevel})</span>用<span class="weapon">${weaponName}</span>对<span class="target">${defenderName}(Lv${defenderLevel})</span>施加了燃烧效果，每${Math.round(burnInterval)}毫秒造成${burnDamage}点伤害</span>`;
    } else if (actionType === 'freeze') {
        // 冰冻效果事件
        const actualDuration = value / gameSpeed;
        const defenderName = defender?.name || '未知图标';
        const defenderLevel = defender?.level || 1;
        infoItem.innerHTML = `<span class="special-message">玩家${attacker.player}：<span class="attacker">${attackerName}(Lv${attackerLevel})</span>用<span class="weapon">${weaponName}</span>冰冻了<span class="target">${defenderName}(Lv${defenderLevel})</span>，持续${Math.round(actualDuration)}毫秒</span>`;
    } else if (actionType === 'buff') {
        // 兴奋剂效果事件
        const defenderName = defender?.name || '未知图标';
        const defenderLevel = defender?.level || 1;
        infoItem.innerHTML = `<span class="special-message">玩家${attacker.player}：<span class="attacker">${attackerName}(Lv${attackerLevel})</span><span class="weapon">💉</span>给<span class="target">${defenderName}(Lv${defenderLevel})</span>使用了兴奋剂</span>`;
    } else if (actionType === 'join') {
        // 图标加入战斗事件
        const oldWeapon = defender; // 这里defender参数实际是oldWeapon
        const newWeapon = value; // 这里value参数实际是newWeapon
        infoItem.innerHTML = `<span class="special-message">玩家${attacker.player}：<span class="attacker">${attackerName}(Lv${attackerLevel})</span>从<span class="weapon">${oldWeapon.emoji}</span>切换为<span class="weapon">${newWeapon.emoji}</span>加入战斗！</span>`;
    } else {
        const defenderName = defender?.name || '未知图标';
        const defenderLevel = defender?.level || 1;
        
        if (value === 0) {
            infoItem.innerHTML = `<span class="player">玩家${attacker.player}</span>：<span class="attacker">${attackerName}(Lv${attackerLevel})</span><span class="weapon">${weaponName}</span>攻击<span class="target">${defenderName}(Lv${defenderLevel})</span>，被闪避`;
        } else {
            infoItem.innerHTML = `<span class="player">玩家${attacker.player}</span>：<span class="attacker">${attackerName}(Lv${attackerLevel})</span><span class="weapon">${weaponName}</span>攻击<span class="target">${defenderName}(Lv${defenderLevel})</span>，伤害值 <span class="damage">${value}</span>`;
        }
    }
    
    battleInfo.appendChild(infoItem);
    battleInfo.scrollTop = battleInfo.scrollHeight;
    
    while (battleInfo.children.length > MAX_BATTLE_INFO_ITEMS) {
        battleInfo.removeChild(battleInfo.firstChild);
    }
    
    const itemPlayer = String(infoItem.dataset.player);
    const itemAction = infoItem.dataset.action;
    
    let showItem = true;
    
    if (currentPlayerFilter !== 'all' && itemPlayer !== currentPlayerFilter) {
        showItem = false;
    }
    
    if (currentActionFilter !== 'all') {
        if (currentActionFilter === 'special') {
            // 其他tab应该显示除了攻击、治疗和击杀以外的所有事件
            const excludedActions = ['attack', 'heal', 'kill'];
            if (excludedActions.includes(itemAction)) {
                showItem = false;
            }
        } else {
            if (itemAction !== currentActionFilter) {
                showItem = false;
            }
        }
    }
    
    if (showItem) {
        infoItem.classList.remove('hidden');
    } else {
        infoItem.classList.add('hidden');
    }
}

// 计算伤害值（简化版，仅返回伤害值）
// @param {Object} attacker - 攻击者对象，包含攻击力等属性
// @param {Object} defender - 防御者对象，包含防御力和护甲等属性
// @returns {number} - 计算出的伤害值
function calculateDamage(attacker, defender) {
    const baseDamage = attacker.stats.attack + (attacker.weapon.attack || 0);
    const defense = defender.stats.defense;
    const armor = defender.stats.armor;
    const { randomMin, randomMax, defenseFactor } = GAME_CONFIG.combat.damage;
    const randomFactor = Math.random() * (randomMax - randomMin) + randomMin;
    
    const dodgeChance = defender.stats.speed * GAME_CONFIG.combat.dodge.speedFactor;
    const isDodged = Math.random() < dodgeChance;
    
    if (isDodged) {
        return 0;
    }
    
    const damage = Math.max(GAME_CONFIG.combat.damage.minDamage, Math.floor((baseDamage - defense * defenseFactor) * randomFactor / armor));
    return damage;
}

// 选择攻击目标
// @param {Object} attacker - 攻击者对象
// @param {Object} defender - 防御者对象（可选，用于指定初始攻击目标）
// @param {Object} options - 目标选择配置选项
// @param {boolean} options.allyTargeting - 是否允许选择队友作为目标
// @param {function} options.allyFilter - 筛选队友的函数
// @param {function} options.allySort - 排序队友的函数
// @param {boolean} options.allowEnemyFallback - 当没有合适的队友时，是否允许选择敌人作为备选
// @returns {Object|null} - 选中的目标对象，如果没有找到合适的目标则返回null
function selectTarget(attacker, defender, options = {}) {
    let target = defender;
    
    // 过滤死亡目标
    if (target && target.isDead) {
        return null;
    }
    
    // 如果需要选择队友且目标不是有效队友
    if (options.allyTargeting && (!target || target.player !== attacker.player)) {
        const allies = battleIcons[`player${attacker.player}`].filter(ally => 
            !ally.isDead && 
            (attacker.weapon.type === 'heal' || ally !== attacker) &&  // 治疗武器允许治疗自己
            (options.allyFilter ? options.allyFilter(ally) : true)
        );
        
        if (allies.length > 0) {
            // 应用排序
            if (options.allySort) {
                allies.sort(options.allySort);
            }
            target = allies[0];
        }
        
        // 如果没有找到队友且需要选择敌人作为备选
        if (!target && options.allowEnemyFallback) {
            const enemies = battleIcons[`player${attacker.player === 1 ? 2 : 1}`].filter(e => !e.isDead);
            if (enemies.length > 0) {
                // 按距离排序敌人
                enemies.sort((a, b) => {
                    const distA = Math.sqrt((a.x - attacker.x) ** 2 + (a.y - attacker.y) ** 2);
                    const distB = Math.sqrt((b.x - attacker.x) ** 2 + (b.y - attacker.y) ** 2);
                    return distA - distB;
                });
                target = enemies[0];
            }
        }
    }
    
    return target;
}

// 执行攻击动作
// @param {Object} attacker - 攻击者对象
// @param {Object} defender - 防御者对象（可选，用于指定攻击目标）
function attack(attacker, defender) {
    // 检查攻击者是否可以攻击
    if (attacker.isDead || attacker.isAttacking || attacker.isOnCooldown || attacker.isFrozen) return;
    
    // 选择攻击目标
    // 根据武器类型设置不同的目标选择策略
    let target = selectTarget(attacker, defender, {
        allyTargeting: attacker.weapon.type === 'heal' || attacker.weapon.type === 'buff',  // 治疗和增益武器可以攻击队友
        allyFilter: attacker.weapon.type === 'heal' ? 
            (ally) => ally.stats.health < ally.stats.maxHealth :  // 治疗武器只选择生命值未满的队友
            (ally) => ['melee', 'ranged', 'aoe'].includes(ally.weapon.type),  // 增益武器只选择战斗型队友
        allySort: attacker.weapon.type === 'heal' ? 
            // 治疗武器优先选择生命值比例最低的队友
            (a, b) => (a.stats.health / a.stats.maxHealth) - (b.stats.health / b.stats.maxHealth) : 
            // 增益武器优先选择综合属性最高的队友
            (a, b) => {
                const statsA = a.stats.attack + (a.stats.defense || 0) + (a.stats.armor || 0) + a.stats.speed;
                const statsB = b.stats.attack + (b.stats.defense || 0) + (b.stats.armor || 0) + b.stats.speed;
                return statsB - statsA;
            },
        allowEnemyFallback: attacker.weapon.type === 'buff'  // 增益武器在没有队友时可以攻击敌人
    });
    
    // 如果没有找到目标，结束攻击
    if (!target) {
        attacker.isAttacking = false;
        return;
    }
    
    // 准备攻击（设置方向、播放动画）
    prepareAttack(attacker, target);
    
    // 攻击动画结束后执行实际攻击逻辑
    setTimeout(() => {
        // 检查攻击者或目标是否已死亡
        if (attacker.isDead || target.isDead) {
            attacker.isAttacking = false;
            return;
        }
        
        // 移除攻击动画类
        attacker.element.classList.remove('attacking');
        
        // 根据武器类型执行不同的攻击逻辑
        // 处理增益型武器
        if (attacker.weapon.type === 'buff') {
            
            // 如果目标是队友，施加增益效果
            if (target.player === attacker.player) {
                applyBuff(attacker, target);
            } else {
                // 如果目标是敌人，造成伤害
                const { damage } = calculateDamageWithDefense(attacker, target);
                
                addBattleInfo(attacker, target, damage);
                
                // 应用伤害效果
                applyDamageEffects(attacker, target, damage, 'normal');
                
                // 处理目标死亡
                handleTargetDeath(attacker, target);
            }
        } 
        // 处理治疗型武器
        else if (attacker.weapon.type === 'heal') {
            // 如果目标是队友，进行治疗
            if (target.player === attacker.player) {
                // 计算治疗量，使用武器的治疗值或默认值
                const healAmount = attacker.weapon.heal || GAME_CONFIG.combat.weaponDefaults.healAmount;
                // 计算实际治疗量，不超过最大生命值
                const actualHeal = Math.min(healAmount, target.stats.maxHealth - target.stats.health);
                
                if (actualHeal > 0) {
                    // 播放治疗音效
                    playSound('heal');
                    // 增加目标生命值
                    target.stats.health += actualHeal;
                    
                    // 添加治疗动画类
                    target.element.classList.add('healed');
                    // 显示治疗数值
                    showHealText(target, actualHeal);
                    // 显示武器特效
                    showWeaponEffect(attacker, target, attacker.weapon.effectType);
                    
                    // 移除治疗动画类
                    setTimeout(() => {
                        target.element.classList.remove('healed');
                    }, GAME_CONFIG.timing.shortDelay);
                    
                    // 更新血条
                    updateHealthBar(target);
                    
                    // 添加治疗战斗信息
                    addHealBattleInfo(attacker, target, actualHeal);
                }
            } else {
                // 计算伤害
                const { damage, isCrit } = calculateDamageWithDefense(attacker, target);
                
                addBattleInfo(attacker, target, damage);
                
                // 应用伤害效果
                applyDamageEffects(attacker, target, damage, 'normal', isCrit);
            }
        } else if (attacker.weapon.type === 'aoe') {
            applyAOEDamage(attacker, target);
        } else {
            let damage, isCrit = false;
            if (attacker.weapon.ignoreDefense) {
                damage = Math.max(GAME_CONFIG.combat.damage.minDamage, attacker.stats.attack + (attacker.weapon.attack || 0));
            } else {
                const result = calculateDamageWithDefense(attacker, target);
                damage = result.damage;
                isCrit = result.isCrit;
            }
            
            addBattleInfo(attacker, target, damage);
            
            // 应用伤害效果
            applyDamageEffects(attacker, target, damage, attacker.weapon.effectType, isCrit);
            
            // 处理目标死亡
            handleTargetDeath(attacker, target);
            
            // 处理特殊效果
            if (attacker.weapon.effectType === 'fire') {
                applyBurnEffect(target, attacker, damage);
            }
            
            if (attacker.weapon.knockbackDistance) {
                applyKnockback(attacker, target, attacker.weapon.knockbackDistance);
            }
        }
        
        // 消耗弹药
        attacker.currentCharges--;
        
        // 处理武器冷却
        if (attacker.currentCharges <= 0 && attacker.weapon.cooldownTime > 0) {
            playSound('cooldown');  // 播放冷却音效
            attacker.isOnCooldown = true;  // 设置冷却状态
            const actualCooldownTime = attacker.weapon.cooldownTime / gameSpeed;  // 根据游戏速度调整冷却时间
            attacker.cooldownEndTime = Date.now() + actualCooldownTime;  // 记录冷却结束时间
            
            // 显示冷却文本
            const cooldownText = document.createElement('div');
            cooldownText.className = 'cooldown-text';
            cooldownText.textContent = '冷却中!';
            cooldownText.style.left = '50%';
            cooldownText.style.top = '0';
            cooldownText.style.transform = 'translateX(-50%)';
            attacker.element.appendChild(cooldownText);
            
            // 移除冷却文本
            setTimeout(() => {
                cooldownText.remove();
            }, GAME_CONFIG.timing.mediumDelay);
            
            // 冷却结束后恢复弹药和状态
            setTimeout(() => {
                attacker.isOnCooldown = false;
                attacker.currentCharges = attacker.weapon.maxCharges;
            }, actualCooldownTime);
        }
        
        // 更新战斗统计数据
        updateBattleStats();
        
        // 处理目标死亡
        if (target.stats.health <= 0 && !target.hasBeenKilled) {
            playSound('kill');  // 播放击杀音效
            playSound('death');  // 播放死亡音效
            target.isDead = true;  // 设置目标为死亡状态
            target.hasBeenKilled = true;  // 标记目标已被击杀
            
            // 确定倒地方向：根据攻击者位置
            target.element.classList.add('dead');
            if (attacker.x < target.x) {
                // 攻击者在左侧，目标向右倒
                target.element.classList.add('fall-right');
            } else {
                // 攻击者在右侧，目标向左倒
                target.element.classList.add('fall-left');
            }
            target.element.classList.remove('moving');  // 移除移动类
            target.element.classList.remove('attacking');  // 移除攻击类
            target.element.classList.remove('facing-right');
            target.element.classList.remove('facing-left');
            
            // 更新列表项状态
            if (target.listItem) {
                target.listItem.classList.add('dead');
                target.listItem.querySelector('.icon-health').textContent = `0/${target.stats.maxHealth}`;
            }
            
            // 更新战斗统计
            battleStats[`player${attacker.player}`].kills++;  // 增加玩家击杀数
            updateBattleStats();  // 更新战斗统计面板
            
            // 增加攻击者个人击杀数并检查升级
            attacker.kills++;
            checkLevelUp(attacker);
            
            // 添加击杀记录到战斗信息面板
            addBattleInfo(attacker, target, 0, 'kill');
            
            // 自爆火箭死亡时触发被动自爆
            if (target.weapon.isSelfDestruct) {
                triggerDeathExplosion(target);
            }
            
            // 延迟移除死亡的战斗图标
            setTimeout(() => {
                removeBattleIcon(target);
            }, GAME_CONFIG.timing.extraLongDelay);
        }
        
        attacker.isAttacking = false;  // 结束攻击状态
    }, (attacker.weapon.attackSpeed || GAME_CONFIG.animation.attackDuration) / gameSpeed);
}

function applyAOEDamage(attacker, target) {
    const aoeRadius = (attacker.weapon.aoeRadius || GAME_CONFIG.combat.weaponDefaults.aoeRadius) * iconSize;
    const targetPlayer = attacker.player === 1 ? 2 : 1;
    const enemies = battleIcons[`player${targetPlayer}`];
    
    const explosionX = target.x;
    const explosionY = target.y;
    
    if (attacker.weapon.emoji && attacker.weapon.emoji === '⚡') {
        playSound('lightning');
        showLightningEffect(explosionX, explosionY, aoeRadius);        
        addBattleInfo(attacker, target, 0, 'lightning');
    } else if (attacker.weapon.emoji && attacker.weapon.emoji === '🔥') {
        playSound('fire');
        showFireEffect(explosionX, explosionY, aoeRadius);
        addBattleInfo(attacker, target, 0, 'fire');
    } else if (attacker.weapon.emoji && attacker.weapon.emoji === '🧊') {
        playSound('ice');
        showIceEffect(explosionX, explosionY, aoeRadius);
        addBattleInfo(attacker, target, 0, 'ice');
    } else {
        playSound('explosion');
        showAOEExplosion(explosionX, explosionY, aoeRadius);
        addBattleInfo(attacker, target, 0, 'explosion');
    }
    
    if ((attacker.weapon.emoji && attacker.weapon.emoji === '⚡') || (attacker.weapon.emoji && attacker.weapon.emoji === '🔥')) {
        const damage = attacker.weapon.ignoreDefense ? 
            Math.max(GAME_CONFIG.combat.damage.minDamage, attacker.stats.attack + attacker.weapon.attack) :
            calculateDamage(attacker, target);
        
        addBattleInfo(attacker, target, damage);
        applyDamageEffects(attacker, target, damage, attacker.weapon.effectType);
        
        // 处理火焰效果
        if (attacker.weapon.emoji && attacker.weapon.emoji === '🔥') {
            applyBurnEffect(target, attacker, damage);
        }
        
        // 使用handleTargetDeath处理目标死亡
        handleTargetDeath(attacker, target);
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
                    // 使用applyDamageEffects处理伤害效果
                    applyDamageEffects(attacker, enemy, damage, attacker.weapon.effectType);
                    
                    if (attacker.weapon.freezeDuration) {
                    applyFreeze(attacker, enemy, attacker.weapon.freezeDuration);
                }
                    
                    // 使用handleTargetDeath处理目标死亡
                    handleTargetDeath(attacker, enemy);
                    
                }
            }
        });
    }
}

function showAOEExplosion(x, y, radius) {
    const battleArea = document.getElementById('battleArea');
    const explosion = document.createElement('div');
    explosion.className = 'aoe-explosion';
    const effectRadius = radius * 0.7;
    explosion.style.left = `${x + 40 - effectRadius}px`;
    explosion.style.top = `${y + 40 - effectRadius}px`;
    explosion.style.width = `${effectRadius * 2}px`;
    explosion.style.height = `${effectRadius * 2}px`;
    explosion.style.setProperty('--icon-size', iconSize);
    battleArea.appendChild(explosion);
    
    setTimeout(() => {
        explosion.remove();
    }, GAME_CONFIG.timing.shortDelay);
}

function showLightningEffect(x, y, radius) {
    const battleArea = document.getElementById('battleArea');
    const lightning = document.createElement('div');
    lightning.className = 'lightning-effect';
    const effectRadius = radius * 0.7;
    lightning.style.left = `${x + 40 - effectRadius}px`;
    lightning.style.top = `${y + 40 - effectRadius}px`;
    lightning.style.width = `${effectRadius * 2}px`;
    lightning.style.height = `${effectRadius * 2}px`;
    lightning.style.setProperty('--icon-size', iconSize);
    battleArea.appendChild(lightning);
    
    const numBolts = 5;
    for (let i = 0; i < numBolts; i++) {
        setTimeout(() => {
            const bolt = document.createElement('div');
            bolt.className = 'lightning-bolt';
            bolt.style.left = `${Math.random() * effectRadius * 2}px`;
            bolt.style.top = `${Math.random() * effectRadius * 2}px`;
            bolt.style.height = `${Math.random() * 50 + 30}px`;
            bolt.style.transform = `rotate(${Math.random() * 360}deg)`;
            lightning.appendChild(bolt);
            
            setTimeout(() => {
                bolt.remove();
            }, GAME_CONFIG.animation.effectDuration);
        }, i * 50);
    }
    
    setTimeout(() => {
        lightning.remove();
    }, GAME_CONFIG.timing.shortDelay);
}

function showFireEffect(x, y, radius) {
    const battleArea = document.getElementById('battleArea');
    const fire = document.createElement('div');
    fire.className = 'fire-effect';
    const effectRadius = radius * 0.7;
    fire.style.left = `${x + 40 - effectRadius}px`;
    fire.style.top = `${y + 40 - effectRadius}px`;
    fire.style.width = `${effectRadius * 2}px`;
    fire.style.height = `${effectRadius * 2}px`;
    fire.style.setProperty('--icon-size', iconSize);
    battleArea.appendChild(fire);
    
    const numFlames = 8;
    for (let i = 0; i < numFlames; i++) {
        setTimeout(() => {
            const flame = document.createElement('div');
            flame.className = 'flame';
            flame.style.left = `${Math.random() * effectRadius * 2}px`;
            flame.style.top = `${Math.random() * effectRadius * 2}px`;
            flame.style.width = `${Math.random() * 30 + 20}px`;
            flame.style.height = `${Math.random() * 30 + 20}px`;
            flame.style.transform = `rotate(${Math.random() * 360}deg)`;
            fire.appendChild(flame);
            
            setTimeout(() => {
                flame.remove();
            }, GAME_CONFIG.timing.shortDelay);
        }, i * 60);
    }
    
    setTimeout(() => {
        fire.remove();
    }, GAME_CONFIG.timing.shortDelay);
}

function applyBurnEffect(target, attacker, damage) {
    if (target.isBurning) return;
    
    target.isBurning = true;
    const burnDamage = Math.max(GAME_CONFIG.combat.damage.minDamage, Math.floor(damage * GAME_CONFIG.combat.burn.damageFactor));
    const burnInterval = (attacker.weapon.burnInterval || GAME_CONFIG.combat.burn.defaultInterval) / gameSpeed;
    const burnDuration = (attacker.weapon.burnDuration || GAME_CONFIG.combat.burn.defaultDuration) / gameSpeed;
    const numTicks = Math.floor(burnDuration / burnInterval);
    let currentTick = 0;
    let lastTickTime = performance.now();
    
    // 使用addBattleInfo记录燃烧效果
    addBattleInfo(attacker, target, damage, 'burn');
    
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
                
                // 确定倒地方向：根据攻击者位置
                target.element.classList.add('dead');
                if (attacker.x < target.x) {
                    // 攻击者在左侧，目标向右倒
                    target.element.classList.add('fall-right');
                } else {
                    // 攻击者在右侧，目标向左倒
                    target.element.classList.add('fall-left');
                }
                target.element.classList.remove('moving');
                target.element.classList.remove('attacking');
                target.element.classList.remove('facing-right');
                target.element.classList.remove('facing-left');
                
                if (target.listItem) {
                    target.listItem.classList.add('dead');
                    target.listItem.querySelector('.icon-health').textContent = `0/${target.stats.maxHealth}`;
                }
                
                battleStats[`player${attacker.player}`].kills++;
                updateBattleStats();
                
                attacker.kills++;
                checkLevelUp(attacker);
                
                // 使用addBattleInfo记录燃烧击杀
                addBattleInfo(attacker, target, 0, 'kill');
                
                // 自爆火箭死亡时触发被动自爆
                if (target.weapon.isSelfDestruct) {
                    triggerDeathExplosion(target);
                }
                
                setTimeout(() => {
                    removeBattleIcon(target);
                }, GAME_CONFIG.timing.extraLongDelay);
                
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
    
    const effectiveDistance = distance * iconSize;
    const dx = target.x - attacker.x;
    const dy = target.y - attacker.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    
    if (length === 0) return;
    
    const normalizedX = dx / length;
    const normalizedY = dy / length;
    
    target.knockbackTargetX = target.x + normalizedX * effectiveDistance;
    target.knockbackTargetY = target.y + normalizedY * effectiveDistance;
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
        target.element.style.zIndex = Math.floor(target.y);
        
        if (progress < 1) {
            requestAnimationFrame(animateKnockback);
        } else {
            target.isKnockedBack = false;
            target.element.classList.remove('knocked-back');
        }
    }
    
    requestAnimationFrame(animateKnockback);
}

function applyFreeze(attacker, target, duration) {
    if (target.isDead || target.isFrozen) return;
    
    target.isFrozen = true;
    const actualDuration = duration / gameSpeed;
    target.freezeEndTime = Date.now() + actualDuration;
    
    target.element.classList.add('frozen');
    
    // 使用EffectText类创建冰冻文字，使用蓝色
    createEffectText(target.element, '冰冻!', '#3498db', 'freeze').show();
    
    // 使用addBattleInfo记录冰冻效果
    addBattleInfo(attacker, target, duration, 'freeze');
    
    setTimeout(() => {
        if (!target.isDead) {
            target.isFrozen = false;
            target.element.classList.remove('frozen');
        }
    }, actualDuration);
}

function applyBuff(attacker, target) {
    if (target.isDead || target.isBuffed) return;
    
    const buffDuration = (attacker.weapon.buffDuration || GAME_CONFIG.combat.buff.defaultDuration) / gameSpeed;
    const buffMultiplier = attacker.weapon.buffMultiplier || GAME_CONFIG.combat.buff.defaultMultiplier;
    
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
    
    // 使用EffectText类创建兴奋文字，使用黄色
    createEffectText(target.element, '兴奋!', '#f1c40f', 'buff').show();
    
    showBuffEffect(target.x + 40, target.y + 40, 60 * iconSize);
    
    // 使用addBattleInfo记录兴奋剂效果
    addBattleInfo(attacker, target, 0, 'buff');
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
            const ringDuration = GAME_CONFIG.timing.ringDurationShort;
            
            function animateRing(currentTime) {
                const elapsed = currentTime - ringStartTime;
                const progress = Math.min(elapsed / ringDuration, 1);
                
                const currentRadius = radius * progress;
                ring.style.width = `${currentRadius * 2}px`;
                ring.style.height = `${currentRadius * 2}px`;
                ring.style.opacity = 1 - progress;
                ring.style.transform = 'translate(-50%, -50%)';
                
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
    const effectRadius = radius * 0.7;
    iceEffect.style.left = `${x + 40 - effectRadius}px`;
    iceEffect.style.top = `${y + 40 - effectRadius}px`;
    iceEffect.style.width = `${effectRadius * 2}px`;
    iceEffect.style.height = `${effectRadius * 2}px`;
    iceEffect.style.setProperty('--icon-size', iconSize);
    iceEffect.style.setProperty('--ice-radius', effectRadius);
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
            const ringDuration = GAME_CONFIG.timing.ringDuration;
            
            function animateRing(currentTime) {
                const elapsed = currentTime - ringStartTime;
                const progress = Math.min(elapsed / ringDuration, 1);
                
                const currentRadius = effectRadius * progress;
                ring.style.width = `${currentRadius * 2}px`;
                ring.style.height = `${currentRadius * 2}px`;
                ring.style.opacity = 1 - progress;
                ring.style.transform = 'translate(-50%, -50%)';
                
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
        const distance = effectRadius * 0.8;
        const startX = Math.cos(angle) * distance;
        const startY = Math.sin(angle) * distance;
        
        particle.style.left = `${50 + startX}%`;
        particle.style.top = `${50 + startY}%`;
        particle.style.transform = `translate(-50%, -50%) scale(${iconSize})`;
        iceParticles.appendChild(particle);
    }
    
    setTimeout(() => {
        iceEffect.remove();
    }, GAME_CONFIG.timing.ringDuration + GAME_CONFIG.timing.mediumDelay);
}

function showBuffEffect(x, y, radius) {
    const battleArea = document.getElementById('battleArea');
    const buffEffect = document.createElement('div');
    buffEffect.className = 'buff-effect';
    buffEffect.style.left = `${x - radius}px`;
    buffEffect.style.top = `${y - radius}px`;
    buffEffect.style.width = `${radius * 2}px`;
    buffEffect.style.height = `${radius * 2}px`;
    buffEffect.style.setProperty('--icon-size', iconSize);
    buffEffect.style.setProperty('--buff-radius', radius);
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
            const ringDuration = GAME_CONFIG.timing.ringDuration;
            
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
        particle.style.transform = `translate(-50%, -50%) scale(${iconSize})`;
        buffParticles.appendChild(particle);
    }
    
    setTimeout(() => {
        buffEffect.remove();
    }, 800);
}

// 移动战斗图标向目标位置
// @param {Object} iconData - 战斗图标数据对象，包含位置、目标位置、速度等信息
function clampIconPosition(iconData) {
    if (!battleAreaElement) {
        battleAreaElement = document.getElementById('battleArea');
    }
    if (!battleAreaElement) return;
    
    const rect = battleAreaElement.getBoundingClientRect();
    const margin = GAME_CONFIG.movement.boundaryMargin * iconSize;
    
    const maxX = rect.width - margin;
    const maxY = rect.height - margin;
    
    iconData.x = Math.max(margin, Math.min(maxX, iconData.x));
    iconData.y = Math.max(margin, Math.min(maxY, iconData.y));
    
    if (iconData.targetX !== undefined) {
        iconData.targetX = Math.max(margin, Math.min(maxX, iconData.targetX));
    }
    if (iconData.targetY !== undefined) {
        iconData.targetY = Math.max(margin, Math.min(maxY, iconData.targetY));
    }
    
    iconData.element.style.left = `${iconData.x}px`;
    iconData.element.style.top = `${iconData.y}px`;
    iconData.element.style.zIndex = Math.floor(iconData.y);
}

function clampAllIconsToBounds() {
    [...battleIcons.player1, ...battleIcons.player2].forEach(iconData => {
        if (!iconData.isDead) {
            clampIconPosition(iconData);
        }
    });
}

function moveTowardsTarget(iconData) {
    if (iconData.isDead || iconData.isFrozen) return;
    
    const dx = iconData.targetX - iconData.x;
    const dy = iconData.targetY - iconData.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > GAME_CONFIG.movement.arrivalThreshold * iconSize) {
        let speed = iconData.stats.speed * gameSpeed;
        
        if (squadBattleMode) {
            const members = getSquadMembers(iconData.player);
            const minSpeed = Math.min(...members.map(m => m.stats.speed));
            
            if (iconData.stats.speed > minSpeed) {
                const speedRatio = minSpeed / iconData.stats.speed;
                speed = speed * speedRatio;
            }
        }
        
        const moveX = (dx / distance) * speed;
        const moveY = (dy / distance) * speed;
        
        iconData.x += moveX;
        iconData.y += moveY;
        
        clampIconPosition(iconData);
        
        iconData.element.classList.add('moving');
        
        const weaponWrapper = iconData.element.querySelector('.weapon-wrapper');
        const defaultDirection = weaponWrapper.dataset.defaultDirection;
        
        if (moveX > 0) {
            iconData.element.classList.remove('facing-left');
            iconData.element.classList.add('facing-right');
            
            weaponWrapper.style.right = '-30px';
            weaponWrapper.style.left = 'auto';
            
            if (defaultDirection === 'top') {
                weaponWrapper.style.transform = 'rotate(90deg)';
            } else if (defaultDirection === 'right') {
                weaponWrapper.style.transform = 'scaleX(1)';
            } else if (defaultDirection === 'left') {
                weaponWrapper.style.transform = 'scaleX(-1)';
            }
        } else if (moveX < 0) {
            iconData.element.classList.remove('facing-right');
            iconData.element.classList.add('facing-left');
            
            weaponWrapper.style.left = '-30px';
            weaponWrapper.style.right = 'auto';
            
            if (defaultDirection === 'top') {
                weaponWrapper.style.transform = 'rotate(-90deg)';
            } else if (defaultDirection === 'right') {
                weaponWrapper.style.transform = 'scaleX(-1)';
            } else if (defaultDirection === 'left') {
                weaponWrapper.style.transform = 'scaleX(1)';
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
    
    const player1TotalDefense = battleIcons.player1
        .filter(icon => !icon.isDead)
        .reduce((sum, icon) => sum + (icon.stats.defense || 0) + (icon.stats.armor || 0), 0);
    document.getElementById('player1Defense').textContent = player1TotalDefense;
    
    document.getElementById('player2Kills').textContent = battleStats.player2.kills;
    
    const player2CurrentHealth = battleIcons.player2
        .filter(icon => !icon.isDead)
        .reduce((sum, icon) => sum + Math.max(0, icon.stats.health), 0);
    document.getElementById('player2Health').textContent = player2CurrentHealth;
    
    const player2TotalAttack = battleIcons.player2
        .filter(icon => !icon.isDead)
        .reduce((sum, icon) => sum + (icon.stats.attack || 0) + (icon.weapon.attack || 0), 0);
    document.getElementById('player2Attack').textContent = player2TotalAttack;
    
    const player2TotalDefense = battleIcons.player2
        .filter(icon => !icon.isDead)
        .reduce((sum, icon) => sum + (icon.stats.defense || 0) + (icon.stats.armor || 0), 0);
    document.getElementById('player2Defense').textContent = player2TotalDefense;
    
    updateIconsStatsPanel();
}

function initBattleInfoDrag() {
    const battleInfoWrapper = document.querySelector('.battle-info-wrapper');
    
    // 检查是否为横屏模式，如果是则不启用拖动
    const isLandscape = window.matchMedia('(orientation: landscape)').matches;
    if (isLandscape) {
        return;
    }
    
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
    if (!iconData || !iconData.element) return;
    
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

function getDistance(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
}

function getDistanceSq(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return dx * dx + dy * dy;
}

function getDistanceBetween(a, b) {
    return getDistance(a.x, a.y, b.x, b.y);
}

function getDistanceSqBetween(a, b) {
    return getDistanceSq(a.x, a.y, b.x, b.y);
}

const EventBus = {
    events: {},
    
    on: function(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
        return () => this.off(event, callback);
    },
    
    off: function(event, callback) {
        if (!this.events[event]) return;
        this.events[event] = this.events[event].filter(cb => cb !== callback);
    },
    
    emit: function(event, data) {
        if (!this.events[event]) return;
        this.events[event].forEach(callback => {
            try {
                callback(data);
            } catch (e) {
                console.error(`EventBus error in ${event}:`, e);
            }
        });
    }
};

const GameEvents = {
    ICON_DAMAGED: 'icon:damaged',
    ICON_DIED: 'icon:died',
    ICON_KILLED: 'icon:killed',
    ICON_LEVEL_UP: 'icon:levelUp',
    ICON_HEALED: 'icon:healed',
    ICON_BUFFED: 'icon:buffed',
    ATTACK_LANDED: 'attack:landed',
    BATTLE_START: 'battle:start',
    BATTLE_END: 'battle:end'
};

function findNearestEnemy(iconData) {
    const enemyPlayer = iconData.player === 1 ? 2 : 1;
    const enemies = battleIcons[`player${enemyPlayer}`].filter(e => !e.isDead);
    
    if (enemies.length === 0) return null;
    
    let nearest = enemies[0];
    let minDistanceSq = Infinity;
    
    enemies.forEach(enemy => {
        const distSq = getDistanceSqBetween(iconData, enemy);
        
        if (distSq < minDistanceSq) {
            minDistanceSq = distSq;
            nearest = enemy;
        }
    });
    
    return nearest;
}

function findTargetByAI(iconData) {
    const enemyPlayer = iconData.player === 1 ? 2 : 1;
    const enemies = battleIcons[`player${enemyPlayer}`].filter(e => !e.isDead);
    
    if (enemies.length === 0) return null;
    
    const aiConfig = getAIConfig(iconData.aiType);
    
    if (aiConfig.targetPriority === 'lowestHealth') {
        enemies.sort((a, b) => {
            const healthPercentA = a.stats.health / a.stats.maxHealth;
            const healthPercentB = b.stats.health / b.stats.maxHealth;
            return healthPercentA - healthPercentB;
        });
    } else {
        enemies.sort((a, b) => {
            return getDistanceSqBetween(iconData, a) - getDistanceSqBetween(iconData, b);
        });
    }
    
    return enemies[0];
}

function shouldRetreatByAI(iconData, enemies) {
    const aiConfig = getAIConfig(iconData.aiType);
    const healthPercent = iconData.stats.health / iconData.stats.maxHealth;
    
    if (healthPercent > aiConfig.retreatThreshold) {
        return false;
    }
    
    if (enemies.length === 0) {
        return false;
    }
    
    const effectiveRange = iconData.weapon.range * iconSize;
    const nearbyEnemies = enemies.filter(e => getDistanceBetween(iconData, e) < effectiveRange * 1.5);
    
    return nearbyEnemies.length > 0;
}

function territoryHealForPlayer(player, currentTime) {
    const battleZone = player === 1 ? player1BattleZoneElement : player2BattleZoneElement;
    const zoneRect = battleZone.getBoundingClientRect();
    const battleAreaRect = battleAreaElement.getBoundingClientRect();
    const healIntervalKey = player === 1 ? 'territoryHealIntervalPlayer1' : 'territoryHealIntervalPlayer2';
    
    battleIcons[`player${player}`].forEach(iconData => {
        if (iconData.isDead || iconData.stats.health >= iconData.stats.maxHealth) return;
        
        const isInTerritory = 
            iconData.x >= zoneRect.left - battleAreaRect.left &&
            iconData.x <= zoneRect.right - battleAreaRect.left &&
            iconData.y >= zoneRect.top - battleAreaRect.top &&
            iconData.y <= zoneRect.bottom - battleAreaRect.top;
        
        if (isInTerritory && currentTime - iconData.lastHealTime >= GAME_CONFIG.timing[healIntervalKey] / gameSpeed) {
            iconData.stats.health = Math.min(iconData.stats.maxHealth, iconData.stats.health + 1);
            iconData.lastHealTime = currentTime;
            updateHealthBar(iconData);
        }
    });
}

function updateIconBehavior(iconData, isVictory) {
    if (iconData.isDead) return;
    
    const behavior = getWeaponBehavior(iconData);
    behavior.update(iconData, { isVictory, squadBattleMode });
}

// 游戏主循环函数，负责驱动游戏的所有更新逻辑
// 使用requestAnimationFrame实现平滑的游戏更新
const TARGET_FPS = 60;
const FIXED_TIMESTEP = 1000 / TARGET_FPS;
let lastFrameTime = 0;
let accumulator = 0;
const MAX_ACCUMULATOR = 1000 / 10;

function gameLoop(timestamp) {
    if (!lastFrameTime) {
        lastFrameTime = timestamp;
    }
    
    let frameTime = timestamp - lastFrameTime;
    lastFrameTime = timestamp;
    
    if (frameTime > MAX_ACCUMULATOR) {
        frameTime = MAX_ACCUMULATOR;
    }
    
    if (!gamePaused) {
        accumulator += frameTime;
        
        while (accumulator >= FIXED_TIMESTEP) {
            updateGame(FIXED_TIMESTEP);
            accumulator -= FIXED_TIMESTEP;
        }
    }
    
    requestAnimationFrame(gameLoop);
}

function updateGame(deltaTime) {
    const player1Alive = battleIcons.player1.filter(icon => !icon.isDead).length;
    const player2Alive = battleIcons.player2.filter(icon => !icon.isDead).length;
    
    autoAddRandomIconsIfNeeded();
    
    if (!battleAreaElement) {
        battleAreaElement = document.getElementById('battleArea');
    }
    
    const currentTime = Date.now();
    if (currentTime - lastBattleAreaCheckTime >= BATTLE_AREA_CHECK_INTERVAL || !battleAreaRect) {
        battleAreaRect = battleAreaElement.getBoundingClientRect();
        lastBattleAreaCheckTime = currentTime;
    }
    
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
    
    territoryHealForPlayer(1, currentTime);
    territoryHealForPlayer(2, currentTime);
    
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
    
    if (squadBattleMode) {
        updateSquadLeaders();
    } else {
        [1, 2].forEach(player => {
            convertNonBattleToBattle(player);
        });
    }
    
    [...battleIcons.player1, ...battleIcons.player2].forEach(iconData => {
        updateIconBehavior(iconData, isVictory);
    });
    
    clampAllIconsToBounds();
}

function handleHealerBehavior(iconData) {
    const allies = battleIcons[`player${iconData.player}`].filter(ally => !ally.isDead);
    const enemyPlayer = iconData.player === 1 ? 2 : 1;
    const enemies = battleIcons[`player${enemyPlayer}`].filter(e => !e.isDead);
    
    const rect = battleAreaRect;
    
    const injuredAllies = allies.filter(ally => ally.stats.health < ally.stats.maxHealth);
    
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
        const effectiveRange = iconData.weapon.range * iconSize;
        
        if (distance <= effectiveRange) {
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
        const combatAllies = allies.filter(ally => ally.weapon.type !== 'heal' && ally.weapon.type !== 'buff');
        
        if (combatAllies.length > 0) {
            combatAllies.sort((a, b) => {
                const distA = Math.sqrt(Math.pow(a.x - iconData.x, 2) + Math.pow(a.y - iconData.y, 2));
                const distB = Math.sqrt(Math.pow(b.x - iconData.x, 2) + Math.pow(b.y - iconData.y, 2));
                return distA - distB;
            });
            
            const target = combatAllies[0];
            const dx = target.x - iconData.x;
            const dy = target.y - iconData.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const followDistance = 80 * iconSize;
            
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
            const followDistance = 80 * iconSize;
            
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
        const attackRange = GAME_CONFIG.movement.buffAttackRange * iconSize;
        
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
    
    const rect = battleAreaRect;
    
    const combatAllies = allies.filter(ally => ally.weapon.type !== 'heal' && ally.weapon.type !== 'buff');
    
    if (combatAllies.length > 0) {
        combatAllies.sort((a, b) => {
            const statsA = a.stats.attack + (a.stats.defense || 0) + (a.stats.armor || 0) + a.stats.speed;
            const statsB = b.stats.attack + (b.stats.defense || 0) + (b.stats.armor || 0) + b.stats.speed;
            return statsB - statsA;
        });
        
        const target = combatAllies[0];
        const dx = target.x - iconData.x;
        const dy = target.y - iconData.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const effectiveRange = iconData.weapon.range * iconSize;
        
        if (distance <= effectiveRange) {
            if (!iconData.isAttacking && !iconData.isOnCooldown) {
                attack(iconData, target);
            }
        }
        
        const safeDistance = GAME_CONFIG.movement.healerSafeDistance * iconSize;
        const minDistance = GAME_CONFIG.movement.healerMinDistance * iconSize;
        
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
        const effectiveRange = iconData.weapon.range * iconSize;
        
        if (distance < effectiveRange) {
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
                
                let assignedWeapon = null;
                if (iconItem.dataset.assignedWeaponIndex !== undefined) {
                    assignedWeapon = GAME_CONFIG.weapons[parseInt(iconItem.dataset.assignedWeaponIndex)];
                }
                
                const level = parseInt(iconItem.dataset.level) || 1;
                
                const battleIcon = createBattleIcon(iconUrl, player, x, y, name, assignedWeapon, level);
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
    
    const battleZone = document.getElementById(`player${player}BattleZone`);
    
    const columnSpacing = 80 * iconSize;
    const rowSpacing = 80 * iconSize;
    const padding = 40 * iconSize;
    
    const totalIcons = iconItems.length;
    const sideLength = Math.ceil(Math.sqrt(totalIcons));
    
    const numColumns = sideLength;
    const numRows = Math.ceil(totalIcons / numColumns);
    
    const totalWidth = (numColumns - 1) * columnSpacing;
    const totalHeight = (numRows - 1) * rowSpacing;
    
    const centerX = battleZone.offsetLeft + battleZone.offsetWidth / 2;
    const centerY = battleZone.offsetTop + battleZone.offsetHeight / 2;
    
    const startX = Math.max(padding, Math.min(centerX - totalWidth / 2, battleZone.offsetLeft + battleZone.offsetWidth - totalWidth - padding));
    const startY = Math.max(padding, Math.min(centerY - totalHeight / 2, battleZone.offsetTop + battleZone.offsetHeight - totalHeight - padding));
    
    iconItems.forEach((iconItem, index) => {
        const iconUrl = iconItem.querySelector('img').src;
        const name = iconItem.dataset.name || '';
        
        const columnIndex = index % numColumns;
        const rowIndex = Math.floor(index / numColumns);
        
        const x = startX + columnIndex * columnSpacing;
        const y = startY + rowIndex * rowSpacing;
        
        let assignedWeapon = null;
        if (iconItem.dataset.assignedWeaponIndex !== undefined) {
            assignedWeapon = GAME_CONFIG.weapons[parseInt(iconItem.dataset.assignedWeaponIndex)];
        }
        
        const level = parseInt(iconItem.dataset.level) || 1;
        
        const battleIcon = createBattleIcon(iconUrl, player, x, y, name, assignedWeapon, level);
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
    battleAreaElement = document.getElementById('battleArea');
    player1BattleZoneElement = document.getElementById('player1BattleZone');
    player2BattleZoneElement = document.getElementById('player2BattleZone');
    battleInfoElement = document.getElementById('battleInfo');
    
    setupBattleZoneDrop();
    requestAnimationFrame(gameLoop);
    initBattleInfoDrag();
    
    // 初始化滑块控件的最小值和最大值
    const [minSize, maxSize] = iconSizes;
    
    // 更新桌面端滑块控件
    const desktopSlider = document.getElementById('iconSizeSlider');
    if (desktopSlider) {
        desktopSlider.min = minSize;
        desktopSlider.max = maxSize;
    }
    
    // 更新移动端滑块控件
    const mobileSlider = document.querySelector('.options-panel #iconSizeSlider');
    if (mobileSlider) {
        mobileSlider.min = minSize;
        mobileSlider.max = maxSize;
    }
    initFilterTabs();
    setupMobileOptimizations();
    setupMobileTabs();
    
    addRandomIcons(1, 7);
    addRandomIcons(2, 7);
    
    const readyContents = document.querySelectorAll('.ready-content');
    readyContents.forEach(content => {
        content.addEventListener('dragleave', handleDragLeave);
    });
    
    // 竖屏模式下初始化后直接显示待命区
    const isPortrait = window.matchMedia('(orientation: portrait)').matches;
    if (isPortrait) {
        showReadyAreaPanel();
    }
    
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

    // 初始化后自动勾选三个选项
    const squadCheckbox = document.getElementById('squadBattleMode');
    if (squadCheckbox) {
        squadCheckbox.checked = true;
        toggleSquadBattleMode();
    }

    const autoAddCheckbox = document.getElementById('autoAddRandom');
    if (autoAddCheckbox) {
        autoAddCheckbox.checked = true;
        toggleAutoAddRandom();
    }

    const autoDeployCheckbox = document.getElementById('autoDeploy');
    if (autoDeployCheckbox) {
        autoDeployCheckbox.checked = true;
        toggleAutoDeploy();
    }
    
    initEventSubscriptions();
    
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            battleAreaRect = null;
            clampAllIconsToBounds();
            updateOptionsDropdownHeight();
        }, 100);
    });
}

function initEventSubscriptions() {
    EventBus.on(GameEvents.ICON_DIED, (data) => {
        if (data.target.weapon.isSelfDestruct) {
            triggerDeathExplosion(data.target);
        }
    });
}

function updateOptionsDropdownHeight() {
    const optionsDropdown = document.getElementById('optionsDropdown');
    const optionsContainer = document.querySelector('.options-container');
    const btnOptions = document.querySelector('.btn-options');
    
    if (!optionsDropdown || !optionsDropdown.classList.contains('show') || !optionsContainer || !btnOptions) {
        return;
    }
    
    const containerRect = optionsContainer.getBoundingClientRect();
    const buttonRect = btnOptions.getBoundingClientRect();
    
    const isPortrait = window.matchMedia('(orientation: portrait)').matches;
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    
    const headerHeight = 60;
    const mobileTabsHeight = 60;
    
    let availableHeight;
    
    if (isMobile && isPortrait) {
        const distanceToBottom = window.innerHeight - containerRect.bottom - mobileTabsHeight;
        availableHeight = Math.max(200, Math.min(distanceToBottom - 20, window.innerHeight - 150));
        optionsDropdown.style.bottom = 'auto';
        optionsDropdown.style.top = `${buttonRect.height + 10}px`;
    } else {
        const distanceToTop = containerRect.top - headerHeight;
        availableHeight = Math.max(200, Math.min(distanceToTop - 20, window.innerHeight - 120));
        optionsDropdown.style.bottom = `${buttonRect.height + 10}px`;
        optionsDropdown.style.top = 'auto';
    }
    
    optionsDropdown.style.maxHeight = `${availableHeight}px`;
}

function toggleOptions() {
    const optionsDropdown = document.getElementById('optionsDropdown');
    
    if (optionsDropdown.classList.contains('show')) {
        optionsDropdown.classList.remove('show');
        optionsDropdown.style.maxHeight = '';
        optionsDropdown.style.bottom = '';
        optionsDropdown.style.top = '';
        return;
    }
    
    optionsDropdown.classList.add('show');
    updateOptionsDropdownHeight();
    
    setTimeout(() => {
        optionsDropdown.scrollTop = 0;
    }, 0);
}

function showDeveloperModeMessage() {
    const battleInfo = document.getElementById('battleInfo');
    const message = document.createElement('div');
    message.className = 'developer-mode-message';
    message.innerHTML = '🚀 开发者模式已激活！';
    message.style.cssText = `
        background: rgba(255, 215, 0, 0.9);
        color: #fff;
        padding: 10px 20px;
        border-radius: 5px;
        margin: 10px 0;
        text-align: center;
        font-weight: bold;
        animation: fadeIn 0.5s ease-in;
    `;
    battleInfo.insertBefore(message, battleInfo.firstChild);
    
    // 3秒后移除消息
    setTimeout(() => {
        message.remove();
    }, GAME_CONFIG.timing.veryLongDelay);
}

function createDeveloperPanel() {
    if (window.developerPanel) return;
    
    const developerPanel = document.createElement('div');
    developerPanel.className = 'developer-panel';
    developerPanel.id = 'developerPanel';
    
    // 设置初始位置（屏幕中心）
    const battleArea = document.getElementById('battleArea');
    const battleAreaRect = battleArea.getBoundingClientRect();
    const initialLeft = (battleAreaRect.width - GAME_CONFIG.ui.developerPanelWidth) / 2;
    const initialTop = (battleAreaRect.height - 200) / 2;
    
    developerPanel.style.left = `${initialLeft}px`;
    developerPanel.style.top = `${initialTop}px`;
    
    // 创建面板头部
    const header = document.createElement('div');
    header.className = 'developer-panel-header';
    header.innerHTML = `
        <span class="developer-panel-title">🛠️ 开发者面板</span>
        <button class="developer-panel-close" onclick="closeDeveloperPanel()">×</button>
    `;
    developerPanel.appendChild(header);
    
    // 创建面板内容
    const content = document.createElement('div');
    content.className = 'developer-panel-content';
    
    // 创建武器网格
    const weaponsGrid = document.createElement('div');
    weaponsGrid.className = 'weapons-grid';
    
    // 添加所有武器emoji
    GAME_CONFIG.weapons.forEach(weapon => {
        const weaponEmoji = document.createElement('div');
        weaponEmoji.className = 'weapon-emoji';
        weaponEmoji.textContent = weapon.emoji || '';
        weaponEmoji.title = `${weapon.name} (${weapon.type})`;
        weaponEmoji.draggable = true;
        weaponEmoji.dataset.weaponIndex = GAME_CONFIG.weapons.indexOf(weapon);
        
        // 添加拖拽事件
        weaponEmoji.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', weaponEmoji.dataset.weaponIndex);
            e.dataTransfer.setData('weapon-emoji', weapon.emoji || '');
            e.dataTransfer.setData('weapon-name', weapon.name);
            weaponEmoji.classList.add('dragging');
        });
        
        weaponEmoji.addEventListener('dragend', () => {
            weaponEmoji.classList.remove('dragging');
        });
        
        // 添加触摸拖拽事件
        let touchDragData = null;
        
        weaponEmoji.addEventListener('touchstart', (e) => {
            const touch = e.touches[0];
            touchDragData = {
                element: weaponEmoji.cloneNode(true),
                startX: touch.clientX,
                startY: touch.clientY,
                offsetX: touch.clientX - weaponEmoji.getBoundingClientRect().left,
                offsetY: touch.clientY - weaponEmoji.getBoundingClientRect().top
            };
            
            touchDragData.element.style.position = 'fixed';
            touchDragData.element.style.zIndex = '9999';
            touchDragData.element.style.pointerEvents = 'none';
            touchDragData.element.style.opacity = '0.8';
            touchDragData.element.classList.add('dragging');
            
            document.body.appendChild(touchDragData.element);
            
            e.preventDefault();
        }, { passive: false });
        
        weaponEmoji.addEventListener('touchmove', (e) => {
            if (!touchDragData) return;
            
            const touch = e.touches[0];
            const newLeft = touch.clientX - touchDragData.offsetX;
            const newTop = touch.clientY - touchDragData.offsetY;
            
            touchDragData.element.style.left = `${newLeft}px`;
            touchDragData.element.style.top = `${newTop}px`;
            
            e.preventDefault();
        }, { passive: false });
        
        weaponEmoji.addEventListener('touchend', (e) => {
            if (!touchDragData) return;
            
            touchDragData.element.remove();
            weaponEmoji.classList.remove('dragging');
            
            const touch = e.changedTouches[0];
            const dropTarget = document.elementFromPoint(touch.clientX, touch.clientY);
            
            if (dropTarget) {
                const iconItem = dropTarget.closest('.icon-item');
                if (iconItem) {
                    const weaponIndex = parseInt(weaponEmoji.dataset.weaponIndex);
                    const weapon = GAME_CONFIG.weapons[weaponIndex];
                    
                    if (weapon) {
                        const existingWeapon = iconItem.querySelector('.icon-weapon-emoji');
                        if (existingWeapon) {
                            existingWeapon.textContent = weapon.emoji;
                        }
                        
                        iconItem.dataset.assignedWeaponIndex = weaponIndex;
                    }
                }
            }
            
            touchDragData = null;
        });
        
        weaponsGrid.appendChild(weaponEmoji);
    });
    
    // 添加升级emoji
    const levelUpEmoji = document.createElement('div');
    levelUpEmoji.className = 'weapon-emoji';
    levelUpEmoji.textContent = '⏫️';
    levelUpEmoji.title = '升级 (拖拽到待命区图标升一级)';
    levelUpEmoji.draggable = true;
    levelUpEmoji.dataset.isLevelUp = 'true';
    
    // 添加拖拽事件
    levelUpEmoji.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('is-level-up', 'true');
        levelUpEmoji.classList.add('dragging');
    });
    
    levelUpEmoji.addEventListener('dragend', () => {
        levelUpEmoji.classList.remove('dragging');
    });
    
    // 添加触摸拖拽事件
    let levelUpTouchDragData = null;
    
    levelUpEmoji.addEventListener('touchstart', (e) => {
        const touch = e.touches[0];
        levelUpTouchDragData = {
            element: levelUpEmoji.cloneNode(true),
            startX: touch.clientX,
            startY: touch.clientY,
            offsetX: touch.clientX - levelUpEmoji.getBoundingClientRect().left,
            offsetY: touch.clientY - levelUpEmoji.getBoundingClientRect().top
        };
        
        levelUpTouchDragData.element.style.position = 'fixed';
        levelUpTouchDragData.element.style.zIndex = '9999';
        levelUpTouchDragData.element.style.pointerEvents = 'none';
        levelUpTouchDragData.element.style.opacity = '0.8';
        levelUpTouchDragData.element.classList.add('dragging');
        
        document.body.appendChild(levelUpTouchDragData.element);
        
        e.preventDefault();
    }, { passive: false });
    
    levelUpEmoji.addEventListener('touchmove', (e) => {
        if (!levelUpTouchDragData) return;
        
        const touch = e.touches[0];
        const newLeft = touch.clientX - levelUpTouchDragData.offsetX;
        const newTop = touch.clientY - levelUpTouchDragData.offsetY;
        
        levelUpTouchDragData.element.style.left = `${newLeft}px`;
        levelUpTouchDragData.element.style.top = `${newTop}px`;
        
        e.preventDefault();
    }, { passive: false });
    
    levelUpEmoji.addEventListener('touchend', (e) => {
        if (!levelUpTouchDragData) return;
        
        levelUpTouchDragData.element.remove();
        levelUpEmoji.classList.remove('dragging');
        
        const touch = e.changedTouches[0];
        const dropTarget = document.elementFromPoint(touch.clientX, touch.clientY);
        
        if (dropTarget) {
            const iconItem = dropTarget.closest('.icon-item');
            if (iconItem) {
                let currentLevel = parseInt(iconItem.dataset.level) || 1;
                if (currentLevel < GAME_CONFIG.upgrade.maxLevel) {
                    currentLevel++;
                    iconItem.dataset.level = currentLevel;
                    
                    const levelBadge = iconItem.querySelector('.icon-level-badge');
                    if (levelBadge) {
                        levelBadge.textContent = `Lv${currentLevel}`;
                    }
                }
            }
        }
        
        levelUpTouchDragData = null;
    });
    
    weaponsGrid.appendChild(levelUpEmoji);
    
    content.appendChild(weaponsGrid);
    
    // 创建调试按钮
    const debugButtons = document.createElement('div');
    debugButtons.className = 'debug-buttons';
    
    const debugButtonsData = [
        { text: '1P血量全满', action: () => healAllPlayer(1) },
        { text: '2P血量全满', action: () => healAllPlayer(2) }
    ];
    
    debugButtonsData.forEach(btn => {
        const button = document.createElement('button');
        button.className = 'debug-btn';
        button.textContent = btn.text;
        button.onclick = btn.action;
        debugButtons.appendChild(button);
    });
    
    content.appendChild(debugButtons);
    developerPanel.appendChild(content);
    
    // 添加到文档
    document.body.appendChild(developerPanel);
    
    // 保存引用
    window.developerPanel = developerPanel;
    
    // 添加面板拖拽功能
    setupDeveloperPanelDrag();
    
    // 添加武器emoji拖拽到待命区的功能
    setupWeaponDropToReadyZone();
}

function closeDeveloperPanel() {
    if (window.developerPanel) {
        window.developerPanel.remove();
        window.developerPanel = null;
    }
}

function setupDeveloperPanelDrag() {
    const panel = document.getElementById('developerPanel');
    if (!panel) return;
    
    const header = panel.querySelector('.developer-panel-header');
    if (!header) return;
    
    header.addEventListener('mousedown', (e) => {
        if (e.target.classList.contains('developer-panel-close')) return;
        
        developerPanelDragging = true;
        developerPanelOffset.x = e.clientX - panel.offsetLeft;
        developerPanelOffset.y = e.clientY - panel.offsetTop;
        
        header.style.cursor = 'grabbing';
    });
    
    header.addEventListener('touchstart', (e) => {
        if (e.target.classList.contains('developer-panel-close')) return;
        
        developerPanelDragging = true;
        const touch = e.touches[0];
        developerPanelOffset.x = touch.clientX - panel.offsetLeft;
        developerPanelOffset.y = touch.clientY - panel.offsetTop;
        
        header.style.cursor = 'grabbing';
        e.preventDefault();
    }, { passive: false });
    
    document.addEventListener('mousemove', (e) => {
        if (!developerPanelDragging) return;
        
        const newLeft = e.clientX - developerPanelOffset.x;
        const newTop = e.clientY - developerPanelOffset.y;
        
        panel.style.left = `${newLeft}px`;
        panel.style.top = `${newTop}px`;
    });
    
    document.addEventListener('touchmove', (e) => {
        if (!developerPanelDragging) return;
        
        const touch = e.touches[0];
        const newLeft = touch.clientX - developerPanelOffset.x;
        const newTop = touch.clientY - developerPanelOffset.y;
        
        panel.style.left = `${newLeft}px`;
        panel.style.top = `${newTop}px`;
        e.preventDefault();
    }, { passive: false });
    
    document.addEventListener('mouseup', () => {
        developerPanelDragging = false;
        if (header) {
            header.style.cursor = 'move';
        }
    });
    
    document.addEventListener('touchend', () => {
        developerPanelDragging = false;
        if (header) {
            header.style.cursor = 'move';
        }
    });
}

function setupWeaponDropToReadyZone() {
    const readyContent1 = document.getElementById('player1ReadyContent');
    const readyContent2 = document.getElementById('player2ReadyContent');
    
    [readyContent1, readyContent2].forEach((readyContent, playerIndex) => {
        if (!readyContent) return;
        
        readyContent.addEventListener('dragover', (e) => {
            e.preventDefault();
            readyContent.style.background = 'rgba(255, 215, 0, 0.2)';
        });
        
        readyContent.addEventListener('dragleave', () => {
            readyContent.style.background = '';
        });
        
        readyContent.addEventListener('drop', (e) => {
            e.preventDefault();
            readyContent.style.background = '';
            
            const weaponIndex = e.dataTransfer.getData('text/plain');
            const weaponEmoji = e.dataTransfer.getData('weapon-emoji');
            const weaponName = e.dataTransfer.getData('weapon-name');
            const isLevelUp = e.dataTransfer.getData('is-level-up');
            
            // 找到被拖放到的图标
            const targetElement = e.target;
            const iconItem = targetElement.closest('.icon-item');
            
            if (!iconItem) return;
            
            // 处理升级emoji
            if (isLevelUp === 'true') {
                let currentLevel = parseInt(iconItem.dataset.level) || 1;
                if (currentLevel < GAME_CONFIG.upgrade.maxLevel) {
                    currentLevel++;
                    iconItem.dataset.level = currentLevel;
                    
                    const levelBadge = iconItem.querySelector('.icon-level-badge');
                    if (levelBadge) {
                        levelBadge.textContent = `Lv${currentLevel}`;
                    }
                }
                return;
            }
            
            if (weaponIndex === '' || !GAME_CONFIG.weapons[weaponIndex]) return;
            
            const weapon = GAME_CONFIG.weapons[weaponIndex];
            const player = playerIndex + 1;
            
            // 更新武器emoji显示
            const existingWeapon = iconItem.querySelector('.icon-weapon-emoji');
            if (existingWeapon) {
                existingWeapon.textContent = weaponEmoji;
            }
            
            // 保存武器信息到iconItem
            iconItem.dataset.assignedWeaponIndex = weaponIndex;
        });
    });
}

function healAllPlayer(player) {
    const playerIcons = battleIcons[`player${player}`];
    playerIcons.forEach(iconData => {
        if (iconData.isDead) return;
        
        iconData.stats.health = iconData.stats.maxHealth;
        updateHealthBar(iconData);
    });
    
    addBattleInfo({ player: player, name: '开发者', weapon: { emoji: '💊', name: '药丸' } }, null, 0, `${player}P血量全满`);
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

function toggleSquadBattleMode() {
    squadBattleMode = document.getElementById('squadBattleMode').checked;
    
    if (squadBattleMode) {
        selectSquadLeaders();
    } else {
        clearSquadLeaders();
    }
}

function isBattleIcon(iconData) {
    return iconData.weapon.type === 'melee' || iconData.weapon.type === 'ranged' || iconData.weapon.type === 'aoe';
}

function isSquadMember(iconData) {
    return iconData.weapon.type === 'melee' || iconData.weapon.type === 'ranged' || iconData.weapon.type === 'aoe';
}

function canBeSquadLeader(iconData) {
    return (iconData.weapon.type === 'melee' || iconData.weapon.type === 'ranged' || iconData.weapon.type === 'aoe') && !iconData.weapon.isSelfDestruct;
}

function selectSquadLeaders() {
    [1, 2].forEach(player => {
        const battleIconsList = battleIcons[`player${player}`].filter(icon => !icon.isDead && canBeSquadLeader(icon));
        
        if (battleIconsList.length > 0) {
            battleIconsList.sort((a, b) => {
                const statsA = a.stats.attack + (a.stats.defense || 0) + (a.stats.armor || 0) + a.stats.speed;
                const statsB = b.stats.attack + (b.stats.defense || 0) + (b.stats.armor || 0) + b.stats.speed;
                if (statsA !== statsB) {
                    return statsB - statsA;
                }
                return battleIconsList.indexOf(a) - battleIconsList.indexOf(b);
            });
            
            const newLeader = battleIconsList[0];
            
            if (squadLeaders[`player${player}`] && squadLeaders[`player${player}`] !== newLeader) {
                const oldLeader = squadLeaders[`player${player}`];
                const armLeft = oldLeader.element.querySelector('.arm.left');
                const armRight = oldLeader.element.querySelector('.arm.right');
                armLeft.style.backgroundColor = '';
                armRight.style.backgroundColor = '';
                oldLeader.element.classList.remove('squad-leader');
            }
            
            squadLeaders[`player${player}`] = newLeader;
            
            const armLeft = newLeader.element.querySelector('.arm.left');
            const armRight = newLeader.element.querySelector('.arm.right');
            armLeft.style.backgroundColor = '#ffd700';
            armRight.style.backgroundColor = '#ffd700';
            newLeader.element.classList.add('squad-leader');
        }
    });
}

function clearSquadLeaders() {
    [1, 2].forEach(player => {
        if (squadLeaders[`player${player}`]) {
            const leader = squadLeaders[`player${player}`];
            const armLeft = leader.element.querySelector('.arm.left');
            const armRight = leader.element.querySelector('.arm.right');
            armLeft.style.backgroundColor = '';
            armRight.style.backgroundColor = '';
            leader.element.classList.remove('squad-leader');
            squadLeaders[`player${player}`] = null;
        }
    });
}

function updateSquadLeaders() {
    [1, 2].forEach(player => {
        const currentLeader = squadLeaders[`player${player}`];
        
        if (currentLeader && (currentLeader.isDead || !isBattleIcon(currentLeader))) {
            const armLeft = currentLeader.element.querySelector('.arm.left');
            const armRight = currentLeader.element.querySelector('.arm.right');
            armLeft.style.backgroundColor = '';
            armRight.style.backgroundColor = '';
            currentLeader.element.classList.remove('squad-leader');
            squadLeaders[`player${player}`] = null;
        }
        
        if (!squadLeaders[`player${player}`]) {
            selectSquadLeaders();
        }
        
        convertNonBattleToBattle(player);
        
        if (!squadLeaders[`player${player}`]) {
            selectSquadLeaders();
        }
    });
}

function convertNonBattleToBattle(player) {
    const aliveIcons = battleIcons[`player${player}`].filter(icon => !icon.isDead);
    const battleIconsList = aliveIcons.filter(icon => isBattleIcon(icon));
    
    if (battleIconsList.length === 0 && aliveIcons.length > 0) {
        const randomIcon = aliveIcons[Math.floor(Math.random() * aliveIcons.length)];
        const brickWeapon = GAME_CONFIG.weapons.find(w => w.name === '砖头');
        
        if (brickWeapon) {
            const oldWeapon = randomIcon.weapon;
            randomIcon.weapon = brickWeapon;
            randomIcon.currentCharges = brickWeapon.maxCharges;
            
            const weaponInner = randomIcon.element.querySelector('.weapon-inner');
            weaponInner.textContent = brickWeapon.emoji;
            weaponInner.dataset.type = brickWeapon.type;
            weaponInner.dataset.effect = brickWeapon.effectType;
            
            const statsDisplay = randomIcon.element.querySelector('.stats-display');
            const totalAttack = (randomIcon.stats.attack || 0) + (brickWeapon.attack || 0);
            statsDisplay.innerHTML = `AT:${totalAttack} DE:${randomIcon.stats.defense} AR:${randomIcon.stats.armor}`;
            
            // 使用addBattleInfo记录图标加入战斗
            addBattleInfo(randomIcon, oldWeapon, brickWeapon, 'join');
        }
    }
}

function getSquadMembers(player) {
    const leader = squadLeaders[`player${player}`];
    if (!leader) return [];
    
    return battleIcons[`player${player}`].filter(icon => !icon.isDead && icon !== leader);
}

function calculateSquadFormation(leader, members) {
    const formation = [];
    const memberCount = members.length;
    
    if (memberCount === 0) return formation;
    
    const meleeMembers = [];
    const rangedMembers = [];
    const aoeMembers = [];
    const supportMembers = [];
    
    members.forEach((member, index) => {
        const type = member.weapon.type;
        if (type === 'melee') {
            meleeMembers.push({ member, index });
        } else if (type === 'ranged') {
            rangedMembers.push({ member, index });
        } else if (type === 'aoe') {
            aoeMembers.push({ member, index });
        } else {
            supportMembers.push({ member, index });
        }
    });
    
    const frontRowSpacing = 90 * iconSize;
    const backRowSpacing = 100 * iconSize;
    const rowDistance = 80 * iconSize;
    
    const totalFront = meleeMembers.length + aoeMembers.length;
    const totalBack = rangedMembers.length;
    const totalSupport = supportMembers.length;
    
    const frontStartX = leader.x - (totalFront - 1) * frontRowSpacing / 2;
    const backStartX = leader.x - (totalBack - 1) * backRowSpacing / 2;
    const supportStartX = leader.x - (totalSupport - 1) * backRowSpacing / 2;
    
    let frontIndex = 0;
    let backIndex = 0;
    let supportIndex = 0;
    
    const formationMap = new Map();
    
    meleeMembers.forEach(item => {
        formationMap.set(item.index, {
            x: frontStartX + frontIndex * frontRowSpacing,
            y: leader.y - rowDistance * 0.6
        });
        frontIndex++;
    });
    
    aoeMembers.forEach(item => {
        formationMap.set(item.index, {
            x: frontStartX + frontIndex * frontRowSpacing,
            y: leader.y - rowDistance * 0.3
        });
        frontIndex++;
    });
    
    rangedMembers.forEach(item => {
        formationMap.set(item.index, {
            x: backStartX + backIndex * backRowSpacing,
            y: leader.y + rowDistance * 0.5
        });
        backIndex++;
    });
    
    supportMembers.forEach(item => {
        formationMap.set(item.index, {
            x: supportStartX + supportIndex * backRowSpacing,
            y: leader.y + rowDistance * 1.2
        });
        supportIndex++;
    });
    
    for (let i = 0; i < memberCount; i++) {
        if (formationMap.has(i)) {
            formation.push(formationMap.get(i));
        } else {
            formation.push({ x: leader.x, y: leader.y });
        }
    }
    
    return formation;
}

function getMonitorRange(memberCount) {
    const baseRange = 500;
    const additionalRange = Math.floor(memberCount / 8) * 50;
    return baseRange + additionalRange;
}

function getSquadTargetPriority(enemy, squadMembers) {
    let priority = 0;
    
    if (enemy.weapon.type === 'ranged' || enemy.weapon.type === 'aoe') {
        priority += 30;
    }
    
    if (enemy.weapon.type === 'heal' || enemy.weapon.type === 'buff') {
        priority += 40;
    }
    
    const healthPercent = enemy.stats.health / enemy.stats.maxHealth;
    priority += Math.floor((1 - healthPercent) * 50);
    
    const totalAttack = squadMembers.reduce((sum, m) => sum + m.stats.attack + m.weapon.attack, 0);
    if (totalAttack > enemy.stats.health + enemy.stats.armor + enemy.stats.defense) {
        priority += 25;
    }
    
    return priority;
}

function findSquadFocusTarget(iconData, enemies) {
    const squadMembers = [...getSquadMembers(iconData.player), iconData];
    const player = iconData.player;
    const enemyPlayer = player === 1 ? 2 : 1;
    
    let bestTarget = null;
    let bestScore = -Infinity;
    
    enemies.forEach(enemy => {
        if (enemy.isDead) return;
        
        const dx = enemy.x - iconData.x;
        const dy = enemy.y - iconData.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        const effectiveRange = iconData.weapon.range * iconSize;
        if (distance > effectiveRange * 2.5) return;
        
        const priority = getSquadTargetPriority(enemy, squadMembers);
        const distancePenalty = distance / (effectiveRange * 2);
        const score = priority - distancePenalty * 20;
        
        if (score > bestScore) {
            bestScore = score;
            bestTarget = enemy;
        }
    });
    
    return bestTarget;
}

function getIdealAttackDistance(attacker, target) {
    const weaponRange = attacker.weapon.range * iconSize;
    const targetIsMelee = target.weapon.type === 'melee';
    
    if (attacker.weapon.type === 'melee') {
        return weaponRange * 0.7;
    } else if (attacker.weapon.type === 'ranged') {
        if (targetIsMelee) {
            return weaponRange * 0.85;
        }
        return weaponRange * 0.7;
    } else if (attacker.weapon.type === 'aoe') {
        if (targetIsMelee) {
            return weaponRange * 0.8;
        }
        return weaponRange * 0.65;
    }
    return weaponRange * 0.7;
}

function shouldRetreat(iconData, enemies) {
    if (iconData.weapon.type === 'melee') return false;
    
    const healthPercent = iconData.stats.health / iconData.stats.maxHealth;
    if (healthPercent > 0.6) return false;
    
    const effectiveRange = iconData.weapon.range * iconSize;
    
    for (const enemy of enemies) {
        if (enemy.isDead) continue;
        if (enemy.weapon.type !== 'melee') continue;
        
        const dx = enemy.x - iconData.x;
        const dy = enemy.y - iconData.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < effectiveRange * 0.4) {
            return true;
        }
    }
    
    return false;
}

function findRetreatPosition(iconData, enemies) {
    let awayX = 0;
    let awayY = 0;
    let count = 0;
    
    for (const enemy of enemies) {
        if (enemy.isDead) continue;
        if (enemy.weapon.type !== 'melee') continue;
        
        const dx = iconData.x - enemy.x;
        const dy = iconData.y - enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
            awayX += dx / distance;
            awayY += dy / distance;
            count++;
        }
    }
    
    if (count === 0) {
        const battleZone = document.getElementById(`player${iconData.player}BattleZone`);
        const zoneRect = battleZone.getBoundingClientRect();
        const battleArea = document.getElementById('battleArea');
        const areaRect = battleArea.getBoundingClientRect();
        const centerX = zoneRect.left - areaRect.left + zoneRect.width / 2;
        const centerY = zoneRect.top - areaRect.top + zoneRect.height / 2;
        return { x: centerX, y: centerY };
    }
    
    const magnitude = Math.sqrt(awayX * awayX + awayY * awayY);
    if (magnitude > 0) {
        awayX /= magnitude;
        awayY /= magnitude;
    }
    
    const retreatDistance = GAME_CONFIG.movement.retreatDistance * iconSize;
    return {
        x: iconData.x + awayX * retreatDistance,
        y: iconData.y + awayY * retreatDistance
    };
}

function checkAllMembersInRange(leader, members, range) {
    for (const member of members) {
        const dx = member.x - leader.x;
        const dy = member.y - leader.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > range) {
            return false;
        }
    }
    return true;
}

function handleSquadLeaderBehavior(iconData) {
    const members = getSquadMembers(iconData.player);
    const monitorRange = getMonitorRange(members.length);
    
    const enemyPlayer = iconData.player === 1 ? 2 : 1;
    const enemies = battleIcons[`player${enemyPlayer}`].filter(e => !e.isDead);
    
    const battleArea = document.getElementById('battleArea');
    const battleZone = document.getElementById(`player${iconData.player}BattleZone`);
    const rect = battleArea.getBoundingClientRect();
    
    if (enemies.length > 0) {
        const effectiveRange = iconData.weapon.range * iconSize;
        const focusTarget = findSquadFocusTarget(iconData, enemies);
        
        if (focusTarget) {
            const dx = focusTarget.x - iconData.x;
            const dy = focusTarget.y - iconData.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const idealDistance = getIdealAttackDistance(iconData, focusTarget);
            
            if (distance <= effectiveRange) {
                attack(iconData, focusTarget);
                
                if (iconData.weapon.type !== 'melee' && distance < idealDistance * 0.6) {
                    iconData.targetX = iconData.x - dx * 0.3;
                    iconData.targetY = iconData.y - dy * 0.3;
                    moveTowardsTarget(iconData);
                }
            } else {
                if (checkAllMembersInRange(iconData, members, monitorRange)) {
                    const approachDist = idealDistance;
                    const ratio = (distance - approachDist) / distance;
                    iconData.targetX = iconData.x + dx * ratio;
                    iconData.targetY = iconData.y + dy * ratio;
                    moveTowardsTarget(iconData);
                }
            }
        } else {
            enemies.sort((a, b) => {
                const distA = Math.sqrt((a.x - iconData.x) ** 2 + (a.y - iconData.y) ** 2);
                const distB = Math.sqrt((b.x - iconData.x) ** 2 + (b.y - iconData.y) ** 2);
                return distA - distB;
            });
            const target = enemies[0];
            
            if (checkAllMembersInRange(iconData, members, monitorRange)) {
                const idealDist = getIdealAttackDistance(iconData, target);
                const dx = target.x - iconData.x;
                const dy = target.y - iconData.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const ratio = Math.max(0, (dist - idealDist) / dist);
                iconData.targetX = iconData.x + dx * ratio;
                iconData.targetY = iconData.y + dy * ratio;
                moveTowardsTarget(iconData);
            }
        }
    } else {
        const territoryCenterX = battleZone.offsetLeft + battleZone.offsetWidth / 2;
        const territoryCenterY = battleZone.offsetTop + battleZone.offsetHeight / 2;
        
        if (checkAllMembersInRange(iconData, members, monitorRange)) {
            iconData.targetX = territoryCenterX;
            iconData.targetY = territoryCenterY;
            moveTowardsTarget(iconData);
        }
    }
}

function handleSquadMemberBehavior(iconData) {
    const leader = squadLeaders[`player${iconData.player}`];
    if (!leader) {
        const enemy = findNearestEnemy(iconData);
        if (enemy) {
            const dx = enemy.x - iconData.x;
            const dy = enemy.y - iconData.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const effectiveRange = iconData.weapon.range * iconSize;
            
            if (distance < effectiveRange) {
                attack(iconData, enemy);
            } else {
                const idealDist = getIdealAttackDistance(iconData, enemy);
                const ratio = Math.max(0, (distance - idealDist) / distance);
                iconData.targetX = iconData.x + dx * ratio;
                iconData.targetY = iconData.y + dy * ratio;
                moveTowardsTarget(iconData);
            }
        }
        return;
    }
    
    const enemyPlayer = iconData.player === 1 ? 2 : 1;
    const enemies = battleIcons[`player${enemyPlayer}`].filter(e => !e.isDead);
    
    const weaponType = iconData.weapon.type;
    const effectiveRange = iconData.weapon.range * iconSize;
    const members = getSquadMembers(iconData.player);
    const monitorRange = getMonitorRange(members.length);
    
    if (weaponType === 'heal' || weaponType === 'buff') {
        handleSupportBehavior(iconData, leader, enemies, members, monitorRange);
        return;
    }
    
    let nearestEnemyDistance = Infinity;
    if (enemies.length > 0) {
        enemies.forEach(enemy => {
            const dist = Math.sqrt((enemy.x - iconData.x) ** 2 + (enemy.y - iconData.y) ** 2);
            if (dist < nearestEnemyDistance) {
                nearestEnemyDistance = dist;
            }
        });
    }
    
    const battleEngageRange = monitorRange * 0.7;
    
    if (nearestEnemyDistance < battleEngageRange && enemies.length > 0) {
        if (shouldRetreat(iconData, enemies)) {
            const retreatPos = findRetreatPosition(iconData, enemies);
            iconData.targetX = retreatPos.x;
            iconData.targetY = retreatPos.y;
            moveTowardsTarget(iconData);
            return;
        }
        
        const focusTarget = findSquadFocusTarget(iconData, enemies);
        
        if (focusTarget) {
            const dx = focusTarget.x - iconData.x;
            const dy = focusTarget.y - iconData.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const idealDistance = getIdealAttackDistance(iconData, focusTarget);
            
            if (distance <= effectiveRange) {
                attack(iconData, focusTarget);
                
                if (weaponType !== 'melee' && distance < idealDistance * 0.5) {
                    iconData.targetX = iconData.x - dx * 0.25;
                    iconData.targetY = iconData.y - dy * 0.25;
                    moveTowardsTarget(iconData);
                }
            } else {
                const approachDist = idealDistance;
                const ratio = Math.max(0, (distance - approachDist) / distance);
                iconData.targetX = iconData.x + dx * ratio;
                iconData.targetY = iconData.y + dy * ratio;
                moveTowardsTarget(iconData);
            }
        } else {
            enemies.sort((a, b) => {
                const distA = Math.sqrt((a.x - iconData.x) ** 2 + (a.y - iconData.y) ** 2);
                const distB = Math.sqrt((b.x - iconData.x) ** 2 + (b.y - iconData.y) ** 2);
                return distA - distB;
            });
            const target = enemies[0];
            const dx = target.x - iconData.x;
            const dy = target.y - iconData.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const idealDist = getIdealAttackDistance(iconData, target);
            const ratio = Math.max(0, (dist - idealDist) / dist);
            iconData.targetX = iconData.x + dx * ratio;
            iconData.targetY = iconData.y + dy * ratio;
            moveTowardsTarget(iconData);
        }
    } else {
        const formation = calculateSquadFormation(leader, members);
        const memberIndex = members.indexOf(iconData);
        
        if (memberIndex >= 0 && memberIndex < formation.length) {
            const targetPos = formation[memberIndex];
            const dx = targetPos.x - iconData.x;
            const dy = targetPos.y - iconData.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > GAME_CONFIG.movement.arrivalThreshold * iconSize * 2) {
                iconData.targetX = targetPos.x;
                iconData.targetY = targetPos.y;
                moveTowardsTarget(iconData);
            }
        }
    }
}

function handleSupportBehavior(iconData, leader, enemies, members, monitorRange) {
    const player = iconData.player;
    const allAllies = [...members, leader].filter(m => !m.isDead && m !== iconData);
    const healRange = iconData.weapon.range * iconSize;
    
    let targetAlly = null;
    let lowestHealthPercent = 1;
    
    allAllies.forEach(ally => {
        const dx = ally.x - iconData.x;
        const dy = ally.y - iconData.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < healRange * 1.5) {
            const healthPercent = ally.stats.health / ally.stats.maxHealth;
            if (healthPercent < lowestHealthPercent && healthPercent < 0.9) {
                lowestHealthPercent = healthPercent;
                targetAlly = ally;
            }
        }
    });
    
    const hasLowHealthAlly = targetAlly && lowestHealthPercent < 0.75;
    
    if (hasLowHealthAlly && iconData.weapon.type === 'heal') {
        const dx = targetAlly.x - iconData.x;
        const dy = targetAlly.y - iconData.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < healRange) {
            attack(iconData, targetAlly);
        } else {
            iconData.targetX = targetAlly.x;
            iconData.targetY = targetAlly.y;
            moveTowardsTarget(iconData);
        }
        return;
    }
    
    if (iconData.weapon.type === 'buff') {
        let bestBuffTarget = null;
        let bestBuffScore = -Infinity;
        
        allAllies.forEach(ally => {
            const dx = ally.x - iconData.x;
            const dy = ally.y - iconData.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < healRange * 1.5) {
                const hasBuff = ally.buffActive;
                const attackPower = ally.stats.attack + ally.weapon.attack;
                const score = attackPower * (hasBuff ? 0.3 : 1);
                
                if (score > bestBuffScore) {
                    bestBuffScore = score;
                    bestBuffTarget = ally;
                }
            }
        });
        
        if (bestBuffTarget && !bestBuffTarget.buffActive) {
            const dx = bestBuffTarget.x - iconData.x;
            const dy = bestBuffTarget.y - iconData.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < healRange) {
                attack(iconData, bestBuffTarget);
                return;
            }
        }
    }
    
    const nearestEnemyDist = enemies.reduce((min, e) => {
        const d = Math.sqrt((e.x - iconData.x) ** 2 + (e.y - iconData.y) ** 2);
        return Math.min(min, d);
    }, Infinity);
    
    const safeDistance = 300 * iconSize;
    
    if (nearestEnemyDist < safeDistance && enemies.some(e => e.weapon.type === 'melee')) {
        const retreatPos = findRetreatPosition(iconData, enemies);
        iconData.targetX = retreatPos.x;
        iconData.targetY = retreatPos.y;
        moveTowardsTarget(iconData);
        return;
    }
    
    const formation = calculateSquadFormation(leader, members);
    const memberIndex = members.indexOf(iconData);
    
    if (memberIndex >= 0 && memberIndex < formation.length) {
        const targetPos = formation[memberIndex];
        const dx = targetPos.x - iconData.x;
        const dy = targetPos.y - iconData.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > GAME_CONFIG.movement.arrivalThreshold * iconSize * 2) {
            iconData.targetX = targetPos.x;
            iconData.targetY = targetPos.y;
            moveTowardsTarget(iconData);
        }
    }
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
    if(gameSpeed!=1)
        {gameSpeedElement.textContent = `⏩︎${gameSpeed}x倍速`;}
    else{
        gameSpeedElement.textContent = `${gameSpeed}x倍速`;
    }
    
    if (gameSpeed === 1) {
        gameSpeedElement.classList.remove('fast');
    } else {
        gameSpeedElement.classList.add('fast');
    }
}

function updateIconSize(value) {
    const [minSize, maxSize] = iconSizes;
    iconSize = Math.min(maxSize, Math.max(minSize, parseFloat(value)));
    
    const allIcons = document.querySelectorAll('.battle-icon');
    allIcons.forEach(icon => {
        icon.style.transform = `scale(${iconSize})`;
        icon.style.setProperty('--icon-size', iconSize);
    });
    
    const defaultIconSize = 0.8;
    const readyBaseSize = 70;
    const readyIconSize = readyBaseSize * (iconSize / defaultIconSize);
    
    const allReadyIcons = document.querySelectorAll('.icon-item');
    allReadyIcons.forEach(icon => {
        icon.style.width = `${readyIconSize}px`;
        icon.style.height = `${readyIconSize}px`;
    });
    
    const mobileIconSlider = document.querySelector('.options-panel #iconSizeSlider');
    if (mobileIconSlider) {
        mobileIconSlider.value = value;
    }
    
    const desktopIconSlider = document.getElementById('iconSizeSlider');
    if (desktopIconSlider) {
        desktopIconSlider.value = value;
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
            
            // 检查是否点击"其他"按钮
            if (filterType === 'action' && filterValue === 'special') {
                specialButtonClickCount++;
                
                // 检查是否达到5次点击
                if (specialButtonClickCount >= 5) {
                    if (!developerMode) {
                        // 首次激活开发者模式
                        developerMode = true;
                        showDeveloperModeMessage();
                    } else if (!window.developerPanel) {
                        // 开发者模式已激活，但面板已关闭，重新创建
                        console.log('重新创建开发者面板');
                    }
                    createDeveloperPanel();
                    specialButtonClickCount = 0;
                }
            }
            
            const sameTypeTabs = document.querySelectorAll(`.filter-tab[data-filter="${filterType}"]`);
            sameTypeTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            if (filterType === 'player') {
                currentPlayerFilter = filterValue;
            } else if (filterType === 'action') {
                currentActionFilter = filterValue;
            }
            
            applyFilters();
            
            // 点击任意tab按钮列表都要滚动到最后
            const battleInfo = document.getElementById('battleInfo');
            if (battleInfo) {
                battleInfo.scrollTop = battleInfo.scrollHeight;
            }
        });
    });
}

function calculateFormationPositions(player) {
    const battleArea = document.getElementById('battleArea');
    const battleZone = document.getElementById(`player${player}BattleZone`);
    const rect = battleArea.getBoundingClientRect();
    const icons = battleIcons[`player${player}`].filter(icon => !icon.isDead && icon.weapon.type !== 'heal');
    
    if (icons.length === 0) return [];
    
    const positions = [];
    const baseIconSize = 80;
    const iconSpacing = baseIconSize * iconSize;
    const spacing = 10 * iconSize;
    const cols = Math.ceil(Math.sqrt(icons.length));
    const rows = Math.ceil(icons.length / cols);
    
    const formationWidth = cols * (iconSpacing + spacing) - spacing;
    const formationHeight = rows * (iconSpacing + spacing) - spacing;
    
    const territoryCenterX = battleZone.offsetLeft + battleZone.offsetWidth / 2;
    const territoryCenterY = battleZone.offsetTop + battleZone.offsetHeight / 2;
    
    const startX = territoryCenterX - formationWidth / 2 + iconSpacing / 2;
    const startY = territoryCenterY - formationHeight / 2 + iconSpacing / 2;
    
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const index = row * cols + col;
            if (index >= icons.length) break;
            
            positions.push({
                x: startX + col * (iconSpacing + spacing),
                y: startY + row * (iconSpacing + spacing)
            });
        }
    }
    
    return positions;
}

function applyFilters() {
    const battleInfoItems = document.querySelectorAll('.battle-info-item');
    battleInfoItems.forEach(item => {
        // 获取数据属性值，并确保player值为字符串类型
        const itemPlayer = String(item.dataset.player);
        const itemAction = item.dataset.action;
        
        let showItem = true;
        
        // 确保player过滤使用相同的数据类型比较
        if (currentPlayerFilter !== 'all' && itemPlayer !== currentPlayerFilter) {
            showItem = false;
        }
        
        if (currentActionFilter !== 'all') {
            if (currentActionFilter === 'special') {
                // 其他tab应该显示除了攻击、治疗和击杀以外的所有事件
                const excludedActions = ['attack', 'heal', 'kill'];
                if (excludedActions.includes(itemAction)) {
                    showItem = false;
                }
            } else {
                // 普通事件过滤，确保精确匹配
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

// 战斗图标详情面板函数
function showIconDetailPanel(iconData, player) {
    // 关闭已有的详情面板
    if (currentDetailPanel) {
        closeIconDetailPanel();
    }
    
    // 创建详情面板
    const detailPanel = document.createElement('div');
    detailPanel.className = `icon-detail-panel player${player}`;
    
    // 获取图标列表容器
    const iconsList = document.getElementById(`player${player}IconsList`);
    
    // 设置面板位置
    iconsList.appendChild(detailPanel);
    
    // 填充面板内容
    detailPanel.innerHTML = `
        <div class="icon-detail-left"></div>
        <div class="icon-detail-right">
            <div class="detail-item">
                <span class="detail-label">名称:</span>
                <span class="detail-value" id="detail-name">${iconData.name || '未知图标'}(#${iconData.element.dataset.iconId})</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">等级:</span>
                <span class="detail-value" id="detail-level">${iconData.level}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">生命值:</span>
                <span class="detail-value health" id="detail-health">${iconData.stats.health}/${iconData.stats.maxHealth}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">攻击力:</span>
                <span class="detail-value attack" id="detail-attack">${iconData.stats.attack + iconData.weapon.attack}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">防御力:</span>
                <span class="detail-value defense" id="detail-defense">${iconData.stats.defense}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">速度:</span>
                <span class="detail-value speed" id="detail-speed">${iconData.stats.speed}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">护甲:</span>
                <span class="detail-value armor" id="detail-armor">${iconData.stats.armor}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">武器:</span>
                <span class="detail-value weapon" id="detail-weapon">${iconData.weapon.name}(${weaponTypeToChinese(iconData.weapon.type)})</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">击杀数:</span>
                <span class="detail-value kills" id="detail-kills">${iconData.kills}</span>
            </div>
        </div>
    `;
    
    // 添加战斗图标到面板左侧
    const detailLeft = detailPanel.querySelector('.icon-detail-left');
    const battleIconClone = iconData.element.cloneNode(true);
    detailLeft.appendChild(battleIconClone);
    
    // 更新当前面板和图标数据
    currentDetailPanel = detailPanel;
    currentIconData = iconData;
    
    // 设置实时更新定时器
    if (detailPanelUpdateInterval) {
        clearInterval(detailPanelUpdateInterval);
    }
    detailPanelUpdateInterval = setInterval(() => {
        updateIconDetailPanel(iconData);
    }, 100);
    
    // 添加点击外部关闭面板的事件监听器
    document.addEventListener('click', handleClickOutsideDetailPanel);
}

function updateIconDetailPanel(iconData) {
    if (!currentDetailPanel) return;
    
    // 更新各项数据
    currentDetailPanel.querySelector('#detail-name').textContent = `${iconData.name || '未知图标'}(#${iconData.element.dataset.iconId})`;
    currentDetailPanel.querySelector('#detail-level').textContent = iconData.level;
    currentDetailPanel.querySelector('#detail-health').textContent = `${iconData.stats.health}/${iconData.stats.maxHealth}`;
    currentDetailPanel.querySelector('#detail-attack').textContent = iconData.stats.attack + iconData.weapon.attack;
    currentDetailPanel.querySelector('#detail-defense').textContent = iconData.stats.defense;
    currentDetailPanel.querySelector('#detail-speed').textContent = iconData.stats.speed;
    currentDetailPanel.querySelector('#detail-armor').textContent = iconData.stats.armor;
    currentDetailPanel.querySelector('#detail-weapon').textContent = `${iconData.weapon.name}(${weaponTypeToChinese(iconData.weapon.type)})`;
    currentDetailPanel.querySelector('#detail-kills').textContent = iconData.kills;
    
    // 更新左侧战斗图标状态
    const detailLeft = currentDetailPanel.querySelector('.icon-detail-left');
    if (detailLeft) {
        const copyIcon = detailLeft.querySelector('.battle-icon');
        if (copyIcon) {
            // 更新生命值条
            const copyHealthBar = copyIcon.querySelector('.health-bar-fill');
            const originalHealthBar = iconData.element.querySelector('.health-bar-fill');
            if (copyHealthBar && originalHealthBar) {
                copyHealthBar.style.width = originalHealthBar.style.width;
                copyHealthBar.style.backgroundColor = originalHealthBar.style.backgroundColor;
            }
            
            // 更新等级徽章
            const copyLevelBadge = copyIcon.querySelector('.level-badge');
            const originalLevelBadge = iconData.element.querySelector('.level-badge');
            if (copyLevelBadge && originalLevelBadge) {
                copyLevelBadge.textContent = originalLevelBadge.textContent;
                copyLevelBadge.className = originalLevelBadge.className;
            }
            
            // 更新死亡状态
            if (iconData.isDead && !copyIcon.classList.contains('dead')) {
                copyIcon.classList.add('dead');
            } else if (!iconData.isDead && copyIcon.classList.contains('dead')) {
                copyIcon.classList.remove('dead');
            }
            
            // 更新攻击状态
            if (iconData.isAttacking && !copyIcon.classList.contains('attacking')) {
                copyIcon.classList.add('attacking');
            } else if (!iconData.isAttacking && copyIcon.classList.contains('attacking')) {
                copyIcon.classList.remove('attacking');
            }
            
            // 更新其他可能的状态类
            const statusClasses = ['stunned', 'frozen', 'buffed', 'knocked-back'];
            statusClasses.forEach(status => {
                if (iconData[`is${status.charAt(0).toUpperCase() + status.slice(1)}`]) {
                    copyIcon.classList.add(status);
                } else {
                    copyIcon.classList.remove(status);
                }
            });
        }
    }
}

// 关闭战斗图标详情面板函数
function closeIconDetailPanel() {
    if (!currentDetailPanel) return;
    
    // 清除更新定时器
    if (detailPanelUpdateInterval) {
        clearInterval(detailPanelUpdateInterval);
        detailPanelUpdateInterval = null;
    }
    
    // 移除点击外部关闭面板的事件监听器
    document.removeEventListener('click', handleClickOutsideDetailPanel);
    
    // 移除面板
    currentDetailPanel.remove();
    
    // 重置当前面板和图标数据
    currentDetailPanel = null;
    currentIconData = null;
}

function handleClickOutsideDetailPanel(event) {
    if (currentDetailPanel && !currentDetailPanel.contains(event.target)) {
        // 检查点击的是否是战斗图标列表项
        const iconListItem = event.target.closest('.battle-icon-item');
        if (!iconListItem) {
            closeIconDetailPanel();
        }
    }
}

// 武器类型转换为中文
function weaponTypeToChinese(type) {
    const typeMap = {
        'melee': '近战',
        'ranged': '远程',
        'aoe': '范围伤害',
        'heal': '治疗',
        'buff': 'buff'
    };
    return typeMap[type] || type;
}

// 自爆火箭目标优先级算法
function findRocketTarget(iconData) {
    const enemyPlayer = iconData.player === 1 ? 2 : 1;
    const enemies = battleIcons[`player${enemyPlayer}`].filter(e => !e.isDead);
    
    if (enemies.length === 0) return null;
    
    // 按优先级分类敌人
    const healers = enemies.filter(e => e.weapon.type === 'heal');
    const leaders = enemies.filter(e => squadLeaders[`player${enemyPlayer}`] === e);
    const others = enemies.filter(e => e.weapon.type !== 'heal' && squadLeaders[`player${enemyPlayer}`] !== e);
    
    // 计算每个类别的最近目标
    let target = null;
    let minDistance = Infinity;
    
    // 优先级1：治疗者
    if (healers.length > 0) {
        healers.forEach(enemy => {
            const distance = Math.sqrt((enemy.x - iconData.x) ** 2 + (enemy.y - iconData.y) ** 2);
            if (distance < minDistance) {
                minDistance = distance;
                target = enemy;
            }
        });
        return target;
    }
    
    // 优先级2：队长
    if (leaders.length > 0) {
        leaders.forEach(enemy => {
            const distance = Math.sqrt((enemy.x - iconData.x) ** 2 + (enemy.y - iconData.y) ** 2);
            if (distance < minDistance) {
                minDistance = distance;
                target = enemy;
            }
        });
        return target;
    }
    
    // 优先级3：其他目标
    others.forEach(enemy => {
        const distance = Math.sqrt((enemy.x - iconData.x) ** 2 + (enemy.y - iconData.y) ** 2);
        if (distance < minDistance) {
            minDistance = distance;
            target = enemy;
        }
    });
    
    return target;
}

// 处理自爆火箭冲锋行为
function handleRocketCharge(iconData) {
    if (iconData.isDead || iconData.isFrozen || iconData.isStunned) return;
    
    const currentTime = Date.now();
    
    // 如果没有在冲锋，寻找目标
    if (!iconData.isCharging) {
        let target;
        
        if (squadBattleMode) {
            // 小队模式：检查是否是队员
            const leader = squadLeaders[`player${iconData.player}`];
            
            if (leader && leader !== iconData) {
                // 是队员，先跟随队长移动
                const dx = leader.x - iconData.x;
                const dy = leader.y - iconData.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                // 保持与队长的距离
                if (distance > GAME_CONFIG.movement.squadFollowDistance / iconSize) {
                    iconData.targetX = leader.x;
                    iconData.targetY = leader.y;
                    moveTowardsTarget(iconData);
                }
                
                // 同时监控400范围内的敌方目标
                const enemyPlayer = iconData.player === 1 ? 2 : 1;
                const enemiesInRange = battleIcons[`player${enemyPlayer}`].filter(e => {
                    if (e.isDead) return false;
                    const dist = Math.sqrt((e.x - iconData.x) ** 2 + (e.y - iconData.y) ** 2);
                    return dist <= GAME_CONFIG.movement.squadMonitorRange / iconSize;
                });
                
                if (enemiesInRange.length > 0) {
                    target = findRocketTarget(iconData);
                }
            } else if (leader === iconData) {
                // 是队长，先执行队长行为（带领小队移动）
                const members = getSquadMembers(iconData.player);
                const monitorRange = getMonitorRange(members.length);
                
                const enemyPlayer = iconData.player === 1 ? 2 : 1;
                const enemies = battleIcons[`player${enemyPlayer}`].filter(e => !e.isDead);
                
                const battleArea = document.getElementById('battleArea');
                const rect = battleArea.getBoundingClientRect();
                
                if (enemies.length > 0) {
                    const enemiesInRange = enemies.filter(enemy => {
                        const dx = enemy.x - iconData.x;
                        const dy = enemy.y - iconData.y;
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        return distance < GAME_CONFIG.movement.squadMonitorRange / iconSize;
                    });
                    
                    if (enemiesInRange.length > 0) {
                        // 有敌人在400范围内，发起冲锋
                        target = findRocketTarget(iconData);
                    } else {
                        // 没有敌人在范围内，带领小队向最近的敌人移动
                        enemies.sort((a, b) => {
                            const distA = Math.sqrt((a.x - iconData.x) ** 2 + (a.y - iconData.y) ** 2);
                            const distB = Math.sqrt((b.x - iconData.x) ** 2 + (b.y - iconData.y) ** 2);
                            return distA - distB;
                        });
                        
                        const nearestEnemy = enemies[0];
                        if (checkAllMembersInRange(iconData, members, monitorRange)) {
                            iconData.targetX = nearestEnemy.x;
                            iconData.targetY = nearestEnemy.y;
                            moveTowardsTarget(iconData);
                        }
                    }
                } else {
                    // 没有敌人，向战场中心移动
                    const centerX = iconData.player === 1 ? rect.width * 0.25 : rect.width * 0.75;
                    const centerY = rect.height * 0.5;
                    
                    if (checkAllMembersInRange(iconData, members, monitorRange)) {
                        iconData.targetX = centerX;
                        iconData.targetY = centerY;
                        moveTowardsTarget(iconData);
                    }
                }
            } else {
                // 没有队长，直接寻找目标
                target = findRocketTarget(iconData);
            }
        } else {
            // 普通模式：直接向目标发起冲锋
            target = findRocketTarget(iconData);
        }
        
        if (target) {
            iconData.isCharging = true;
            iconData.chargeTarget = target;
            iconData.chargeStartTime = currentTime;
            
            // 记录开始冲锋的战斗信息
            addBattleInfo(iconData, target, 0, '开始冲锋');
        }
    }
    
    // 如果正在冲锋，执行冲锋逻辑
    if (iconData.isCharging && iconData.chargeTarget) {
        const target = iconData.chargeTarget;
        
        // 检查目标是否死亡
        if (target.isDead) {
            // 目标死亡，重新寻找目标
            const newTarget = findRocketTarget(iconData);
            if (newTarget) {
                iconData.chargeTarget = newTarget;
            } else {
                iconData.isCharging = false;
                iconData.chargeTarget = null;
            }
            return;
        }
        
        // 计算到目标的距离
        const dx = target.x - iconData.x;
        const dy = target.y - iconData.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // 检查是否达到自爆范围
        const effectiveRange = iconData.weapon.range * iconSize;
        if (distance <= effectiveRange) {
            // 执行自爆
            executeRocketExplosion(iconData);
            return;
        }
        
        // 以冲锋速度向目标移动
        const chargeSpeed = iconData.weapon.chargeSpeed || GAME_CONFIG.combat.weaponDefaults.chargeSpeed;
        const moveX = (dx / distance) * chargeSpeed * (FIXED_TIMESTEP / 1000) * gameSpeed;
        const moveY = (dy / distance) * chargeSpeed * (FIXED_TIMESTEP / 1000) * gameSpeed;
        
        iconData.x += moveX;
        iconData.y += moveY;
        
        clampIconPosition(iconData);
        
        // 更新朝向
        const weaponWrapper = iconData.element.querySelector('.weapon-wrapper');
        const defaultDirection = weaponWrapper.dataset.defaultDirection;
        
        if (moveX > 0) {
            iconData.element.classList.remove('facing-left');
            iconData.element.classList.add('facing-right');
            
            weaponWrapper.style.right = '-30px';
            weaponWrapper.style.left = 'auto';
            
            if (defaultDirection === 'top') {
                weaponWrapper.style.transform = 'rotate(90deg)';
            } else if (defaultDirection === 'right') {
                weaponWrapper.style.transform = 'scaleX(1)';
            } else if (defaultDirection === 'left') {
                weaponWrapper.style.transform = 'scaleX(-1)';
            }
        } else if (moveX < 0) {
            iconData.element.classList.remove('facing-right');
            iconData.element.classList.add('facing-left');
            
            weaponWrapper.style.left = '-30px';
            weaponWrapper.style.right = 'auto';
            
            if (defaultDirection === 'top') {
                weaponWrapper.style.transform = 'rotate(-90deg)';
            } else if (defaultDirection === 'right') {
                weaponWrapper.style.transform = 'scaleX(-1)';
            } else if (defaultDirection === 'left') {
                weaponWrapper.style.transform = 'scaleX(1)';
            }
        }
        
        iconData.element.classList.add('moving');
    }
}

// 自爆火箭死亡时被动自爆
function triggerDeathExplosion(iconData) {
    const enemyPlayer = iconData.player === 1 ? 2 : 1;
    const enemies = battleIcons[`player${enemyPlayer}`].filter(e => !e.isDead);
    const aoeRadius = (iconData.weapon.aoeRadius || GAME_CONFIG.combat.weaponDefaults.aoeRadius) * iconSize;
    const damageMultiplier = iconData.weapon.deathExplosionMultiplier || GAME_CONFIG.combat.weaponDefaults.deathExplosionMultiplier;
    
    enemies.forEach(enemy => {
        const distance = Math.sqrt((enemy.x - iconData.x) ** 2 + (enemy.y - iconData.y) ** 2);
        if (distance <= aoeRadius) {
            const distanceFactor = 1 - (distance / aoeRadius) * (1 - GAME_CONFIG.combat.damage.aoeEdgeDamageFactor);
            const baseDamage = (iconData.stats.attack + iconData.weapon.attack) * damageMultiplier;
            const damageBeforeDefense = Math.floor(baseDamage * distanceFactor);
            
            const defense = enemy.stats.defense;
            const armor = enemy.stats.armor;
            const { randomMin, randomMax, defenseFactor } = GAME_CONFIG.combat.damage;
            const randomFactor = Math.random() * (randomMax - randomMin) + randomMin;
            const actualDamage = Math.max(GAME_CONFIG.combat.damage.minDamage, Math.floor((damageBeforeDefense - defense * defenseFactor) * randomFactor / armor));
            
            enemy.stats.health -= actualDamage;
            
            addBattleInfo(iconData, enemy, actualDamage, '死亡自爆');
            
            if (enemy.stats.health <= 0 && !enemy.hasBeenKilled) {
                enemy.stats.health = 0;
                enemy.isDead = true;
                enemy.hasBeenKilled = true;
                
                enemy.element.classList.add('dead');
                if (iconData.x < enemy.x) {
                    enemy.element.classList.add('fall-right');
                } else {
                    enemy.element.classList.add('fall-left');
                }
                enemy.element.classList.remove('moving');
                enemy.element.classList.remove('attacking');
                enemy.element.classList.remove('facing-right');
                enemy.element.classList.remove('facing-left');
                playSound('death');
                
                if (enemy.listItem) {
                    enemy.listItem.classList.add('dead');
                    enemy.listItem.querySelector('.icon-health').textContent = `0/${enemy.stats.maxHealth}`;
                }
                
                iconData.kills++;
                battleStats[`player${iconData.player}`].kills++;
                updateBattleStats();
                
                addBattleInfo(iconData, enemy, actualDamage, 'kill');
                
                updateHealthBar(enemy);
                
                // 自爆火箭被击杀时触发死亡自爆（链式爆炸）
                if (enemy.weapon.isSelfDestruct) {
                    triggerDeathExplosion(enemy);
                }
                
                setTimeout(() => {
                    removeBattleIcon(enemy);
                }, GAME_CONFIG.timing.shortDelay);
            } else if (!enemy.isDead) {
                updateHealthBar(enemy);
                playSound('hit');
                enemy.element.classList.add('hit');
                setTimeout(() => {
                    enemy.element.classList.remove('hit');
                }, GAME_CONFIG.animation.effectDuration);
            }
        }
    });
    
    showExplosionEffect(iconData.x, iconData.y, aoeRadius * 0.7);
    
    addBattleInfo(iconData, null, 0, '死亡自爆');
}

// 执行自爆效果和AOE伤害
function executeRocketExplosion(iconData) {
    if (iconData.isDead) return;
    
    const enemyPlayer = iconData.player === 1 ? 2 : 1;
    const enemies = battleIcons[`player${enemyPlayer}`].filter(e => !e.isDead);
    const aoeRadius = (iconData.weapon.aoeRadius || GAME_CONFIG.combat.weaponDefaults.aoeRadius) * iconSize;
    const damage = iconData.weapon.attack || GAME_CONFIG.combat.weaponDefaults.attack;
    
    // 对AOE范围内的所有敌人造成伤害
    enemies.forEach(enemy => {
        const distance = Math.sqrt((enemy.x - iconData.x) ** 2 + (enemy.y - iconData.y) ** 2);
        if (distance <= aoeRadius) {
            // 计算伤害（距离越近伤害越高）
            const distanceFactor = 1 - (distance / aoeRadius) * (1 - GAME_CONFIG.combat.damage.aoeEdgeDamageFactor);
            
            // 自爆伤害计算：
            // 1. 基础伤害 = 攻击力 + 武器攻击力
            // 2. 距离因子 = 1 - (距离 / 爆炸半径) * (1 - 边缘伤害比例)
            //    - 中心（距离=0）：因子 = 1（100%伤害）
            //    - 边缘（距离=aoeRadius）：因子 = 边缘伤害比例
            // 3. 最终伤害 = 基础伤害 * 距离因子
            // 4. 考虑防御和护甲
            const baseDamage = iconData.stats.attack + iconData.weapon.attack;
            const damageBeforeDefense = Math.floor(baseDamage * distanceFactor);
            
            // 应用防御和护甲
            const defense = enemy.stats.defense;
            const armor = enemy.stats.armor;
            const { randomMin, randomMax, defenseFactor } = GAME_CONFIG.combat.damage;
            const randomFactor = Math.random() * (randomMax - randomMin) + randomMin;
            const actualDamage = Math.max(GAME_CONFIG.combat.damage.minDamage, Math.floor((damageBeforeDefense - defense * defenseFactor) * randomFactor / armor));
            
            enemy.stats.health -= actualDamage;
            
            // 记录自爆造成的伤害
            addBattleInfo(iconData, enemy, actualDamage, '自爆伤害');
            
            // 检查是否死亡
            if (enemy.stats.health <= 0 && !enemy.hasBeenKilled) {
                enemy.stats.health = 0;
                enemy.isDead = true;
                enemy.hasBeenKilled = true;
                
                // 确定倒地方向：根据攻击者（自爆者）位置
                enemy.element.classList.add('dead');
                if (iconData.x < enemy.x) {
                    // 攻击者在左侧，目标向右倒
                    enemy.element.classList.add('fall-right');
                } else {
                    // 攻击者在右侧，目标向左倒
                    enemy.element.classList.add('fall-left');
                }
                enemy.element.classList.remove('moving');
                enemy.element.classList.remove('attacking');
                enemy.element.classList.remove('facing-right');
                enemy.element.classList.remove('facing-left');
                playSound('death');
                
                if (enemy.listItem) {
                    enemy.listItem.classList.add('dead');
                    enemy.listItem.querySelector('.icon-health').textContent = `0/${enemy.stats.maxHealth}`;
                }
                
                // 更新击杀数
                iconData.kills++;
                battleStats[`player${iconData.player}`].kills++;
                updateBattleStats();
                
                // 记录击杀信息
                addBattleInfo(iconData, enemy, actualDamage, 'kill');
                
                // 更新生命值条
                updateHealthBar(enemy);
                
                // 自爆火箭被击杀时触发死亡自爆（链式爆炸）
                if (enemy.weapon.isSelfDestruct) {
                    triggerDeathExplosion(enemy);
                }
                
                // 延迟销毁图标元素
                setTimeout(() => {
                    removeBattleIcon(enemy);
                }, GAME_CONFIG.timing.shortDelay);
            } else if (!enemy.isDead) {
                // 更新生命值条
                updateHealthBar(enemy);
                
                // 播放受击音效
                playSound('hit');
                
                // 显示受击效果
                enemy.element.classList.add('hit');
                setTimeout(() => {
                    enemy.element.classList.remove('hit');
                }, GAME_CONFIG.animation.effectDuration);
            }
        }
    });
    
    // 显示自爆效果
    showExplosionEffect(iconData.x, iconData.y, aoeRadius);
    
    // 自爆后死亡
    iconData.stats.health = 0;
    iconData.isDead = true;
    
    // 自爆者默认向右倒
    iconData.element.classList.add('dead');
    iconData.element.classList.add('fall-right');
    iconData.element.classList.remove('moving');
    iconData.element.classList.remove('attacking');
    iconData.element.classList.remove('facing-right');
    iconData.element.classList.remove('facing-left');
    
    iconData.isCharging = false;
    iconData.chargeTarget = null;
    
    // 记录自爆后死亡信息
    addBattleInfo(iconData, null, 0, '自爆死亡');
    
    // 播放死亡音效
    playSound('death');
    
    // 更新生命值条
    updateHealthBar(iconData);
    
    // 更新战斗统计
    updateBattleStats();
    
    // 延迟销毁图标元素，让玩家看到死亡效果
    setTimeout(() => {
        removeBattleIcon(iconData);
    }, GAME_CONFIG.timing.shortDelay);
}

// 显示自爆爆炸效果
function showExplosionEffect(x, y, radius) {
    const battleArea = document.getElementById('battleArea');
    
    const centerX = x + 40;
    const centerY = y + 40;
    const effectRadius = radius * 0.7;
    
    const explosion = document.createElement('div');
    explosion.className = 'explosion-effect';
    explosion.style.position = 'absolute';
    explosion.style.left = `${centerX}px`;
    explosion.style.top = `${centerY}px`;
    explosion.style.width = `${effectRadius * 2}px`;
    explosion.style.height = `${effectRadius * 2}px`;
    explosion.style.borderRadius = '50%';
    explosion.style.background = 'radial-gradient(circle, rgba(255, 100, 0, 0.8) 0%, rgba(255, 50, 0, 0.5) 50%, transparent 100%)';
    explosion.style.transform = 'translate(-50%, -50%)';
    explosion.style.pointerEvents = 'none';
    explosion.style.zIndex = GAME_CONFIG.ui.explosionZIndex;
    explosion.style.animation = 'explosion 0.5s ease-out forwards';
    
    battleArea.appendChild(explosion);
    
    const ring = document.createElement('div');
    ring.className = 'explosion-ring';
    ring.style.position = 'absolute';
    ring.style.left = `${centerX}px`;
    ring.style.top = `${centerY}px`;
    ring.style.width = '20px';
    ring.style.height = '20px';
    ring.style.borderRadius = '50%';
    ring.style.border = '3px solid rgba(255, 200, 0, 0.8)';
    ring.style.transform = 'translate(-50%, -50%)';
    ring.style.pointerEvents = 'none';
    ring.style.zIndex = GAME_CONFIG.ui.explosionZIndex + 1;
    ring.style.setProperty('--icon-size', iconSize);
    ring.style.setProperty('--ring-radius', effectRadius / 10);
    ring.style.animation = 'ring-expand 0.5s ease-out forwards';
    
    battleArea.appendChild(ring);
    
    // 添加CSS动画
    if (!document.getElementById('explosion-animations')) {
        const style = document.createElement('style');
        style.id = 'explosion-animations';
        style.textContent = `
            @keyframes explosion {
                0% {
                    transform: translate(-50%, -50%) scale(0);
                    opacity: 1;
                }
                50% {
                    transform: translate(-50%, -50%) scale(1.2);
                    opacity: 0.8;
                }
                100% {
                    transform: translate(-50%, -50%) scale(1);
                    opacity: 0;
                }
            }
            
            @keyframes ring-expand {
                0% {
                    transform: translate(-50%, -50%) scale(1);
                    opacity: 1;
                    border-width: 3px;
                }
                100% {
                    transform: translate(-50%, -50%) scale(var(--ring-radius, 1));
                    opacity: 0;
                    border-width: 1px;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    // 移除效果元素
    setTimeout(() => {
        explosion.remove();
        ring.remove();
    }, 500);
}

let activeMobilePanel = null;
let isMobileDevice = false;

function detectMobileDevice() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const mobileKeywords = ['android', 'webos', 'iphone', 'ipad', 'ipod', 'blackberry', 'windows phone', 'mobile'];
    isMobileDevice = mobileKeywords.some(keyword => 
        userAgent.toLowerCase().includes(keyword)
    ) || (window.matchMedia && window.matchMedia('(pointer: coarse)').matches);
    
    if (isMobileDevice) {
        document.body.classList.add('mobile-device');
    }
    
    return isMobileDevice;
}

function preventZoomOnDoubleTap() {
    let lastTouchEnd = 0;
    document.addEventListener('touchend', (e) => {
        const now = Date.now();
        if (now - lastTouchEnd <= 300) {
            e.preventDefault();
        }
        lastTouchEnd = now;
    }, { passive: false });
}

function setupMobileOptimizations() {
    if (!detectMobileDevice()) return;
    
    preventZoomOnDoubleTap();
    
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            if (typeof clampAllIconsToBounds === 'function') {
                clampAllIconsToBounds();
            }
        }, 100);
    });
    
    document.addEventListener('touchmove', (e) => {
        if (e.target.closest('.battle-info') || 
            e.target.closest('.ready-content') ||
            e.target.closest('.search-results') ||
            e.target.closest('.weapon-config-form') ||
            e.target.closest('.combat-config-form')) {
            e.stopPropagation();
        }
    }, { passive: false });
}

function setupMobileTabs() {
    const mobileTabs = document.getElementById('mobileTabs');
    if (!mobileTabs) return;
    
    const tabs = mobileTabs.querySelectorAll('.mobile-tab');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            handleTabClick(tab);
        });
        
        tab.addEventListener('touchstart', (e) => {
            e.preventDefault();
            handleTabClick(tab);
        }, { passive: false });
    });
    
    document.addEventListener('click', (e) => {
        if (activeMobilePanel && !e.target.closest('.mobile-tabs')) {
            if (activeMobilePanel === 'readyarea') {
                if (!e.target.closest('.ready-close-btn')) {
                    return;
                }
                hideAllPanels();
            } else {
                if (!e.target.closest('.battle-info-wrapper') && !e.target.closest('.icons-stats-panel') && !e.target.closest('.ready-area') && !e.target.closest('.options-panel')) {
                    hideAllPanels();
                }
            }
        }
    });
    
    document.addEventListener('touchstart', (e) => {
        if (activeMobilePanel && !e.target.closest('.mobile-tabs')) {
            if (activeMobilePanel === 'readyarea') {
                if (!e.target.closest('.ready-close-btn')) {
                    return;
                }
                hideAllPanels();
            } else {
                if (!e.target.closest('.battle-info-wrapper') && !e.target.closest('.icons-stats-panel') && !e.target.closest('.ready-area') && !e.target.closest('.options-panel')) {
                    hideAllPanels();
                }
            }
        }
    }, { passive: false });
}

function handleTabClick(tab) {
    const panelId = tab.dataset.panel;
    
    hideAllPanels();
    
    tab.classList.add('active');
    
    switch(panelId) {
        case 'battleInfo':
            showBattleInfoPanel();
            break;
        case 'iconsStats':
            showIconsStatsPanel();
            break;
        case 'readyarea':
            showReadyAreaPanel();
            break;
        case 'options':
            showOptionsPanel();
            break;
    }
}

function hideAllPanels() {
    const battleInfoWrapper = document.getElementById('battleInfoWrapper');
    const readyArea = document.getElementById('readyarea');
    const mobileTabs = document.getElementById('mobileTabs');
    
    if (battleInfoWrapper) {
        battleInfoWrapper.classList.remove('show');
    }
    
    if (readyArea) {
        readyArea.classList.remove('show');
        const closeBtn = readyArea.querySelector('.ready-close-btn');
        if (closeBtn) {
            closeBtn.remove();
        }
    }
    
    removeIconsStatsPanel();
    removeOptionsPanel();
    
    if (mobileTabs) {
        const tabs = mobileTabs.querySelectorAll('.mobile-tab');
        tabs.forEach(tab => tab.classList.remove('active'));
    }
    
    activeMobilePanel = null;
}

function showBattleInfoPanel() {
    const battleInfoWrapper = document.getElementById('battleInfoWrapper');
    if (battleInfoWrapper) {
        battleInfoWrapper.classList.add('show');
        activeMobilePanel = 'battleInfo';
    }
}

function showIconsStatsPanel() {
    removeIconsStatsPanel();
    
    const player1Stats = document.getElementById('player1Stats');
    const player2Stats = document.getElementById('player2Stats');
    
    if (!player1Stats || !player2Stats) return;
    
    const panel = document.createElement('div');
    panel.className = 'icons-stats-panel';
    
    const player1Column = document.createElement('div');
    player1Column.className = 'icons-stats-column';
    
    const player1Title = document.createElement('h3');
    player1Title.textContent = '玩家1状态';
    player1Column.appendChild(player1Title);
    
    const player1Content = document.createElement('div');
    player1Content.className = 'icons-stats-content';
    player1Content.innerHTML = player1Stats.innerHTML;
    player1Column.appendChild(player1Content);
    
    const player2Column = document.createElement('div');
    player2Column.className = 'icons-stats-column';
    
    const player2Title = document.createElement('h3');
    player2Title.textContent = '玩家2状态';
    player2Column.appendChild(player2Title);
    
    const player2Content = document.createElement('div');
    player2Content.className = 'icons-stats-content';
    player2Content.innerHTML = player2Stats.innerHTML;
    player2Column.appendChild(player2Content);
    
    panel.appendChild(player1Column);
    panel.appendChild(player2Column);
    
    document.body.appendChild(panel);
    panel.classList.add('show');
    
    activeMobilePanel = 'iconsStats';
    
    updateIconsStatsPanel();
}

function updateIconsStatsPanel() {
    const panel = document.querySelector('.icons-stats-panel');
    if (!panel) return;
    
    const player1Stats = document.getElementById('player1Stats');
    const player2Stats = document.getElementById('player2Stats');
    
    if (!player1Stats || !player2Stats) return;
    
    const player1Column = panel.querySelector('.icons-stats-column:nth-child(1) .icons-stats-content');
    const player2Column = panel.querySelector('.icons-stats-column:nth-child(2) .icons-stats-content');
    
    if (player1Column) {
        player1Column.innerHTML = player1Stats.innerHTML;
    }
    
    if (player2Column) {
        player2Column.innerHTML = player2Stats.innerHTML;
    }
}

function removeIconsStatsPanel() {
    const iconsStatsPanel = document.querySelector('.icons-stats-panel');
    if (iconsStatsPanel) {
        iconsStatsPanel.remove();
    }
}

function showPlayerStatsPanel(player) {
    removePlayerStatsPanels();
    
    const statsInfo = document.getElementById(`player${player}Stats`);
    if (!statsInfo) return;
    
    const panel = document.createElement('div');
    panel.className = `player${player}-stats-panel`;
    panel.innerHTML = statsInfo.innerHTML;
    
    document.body.appendChild(panel);
    panel.classList.add('show');
    
    activeMobilePanel = `player${player}Stats`;
}

function removePlayerStatsPanels() {
    const player1Panel = document.querySelector('.player1-stats-panel');
    const player2Panel = document.querySelector('.player2-stats-panel');
    
    if (player1Panel) {
        player1Panel.remove();
    }
    
    if (player2Panel) {
        player2Panel.remove();
    }
}

function showReadyAreaPanel() {
    const readyArea = document.getElementById('readyarea');
    if (readyArea) {
        readyArea.classList.add('show');
        activeMobilePanel = 'readyarea';
        
        const closeBtn = document.createElement('button');
        closeBtn.className = 'ready-close-btn';
        closeBtn.innerHTML = '&times;';
        closeBtn.onclick = (e) => {
            e.stopPropagation();
            readyArea.classList.remove('show');
            activeMobilePanel = null;
        };
        
        readyArea.appendChild(closeBtn);
    }
}

function showOptionsPanel() {
    removeOptionsPanel();
    
    const optionsDropdown = document.getElementById('optionsDropdown');
    if (!optionsDropdown) return;
    
    const panel = document.createElement('div');
    panel.className = 'options-panel';
    panel.innerHTML = optionsDropdown.innerHTML;
    
    document.body.appendChild(panel);
    panel.classList.add('show');
    
    activeMobilePanel = 'options';
    
    // 重新绑定所有选项的事件
    const squadBattleModeCheckbox = panel.querySelector('#squadBattleMode');
    if (squadBattleModeCheckbox) {
        squadBattleModeCheckbox.checked = document.getElementById('squadBattleMode').checked;
        squadBattleModeCheckbox.onchange = function() {
            squadBattleMode = this.checked;
            document.getElementById('squadBattleMode').checked = this.checked;
            if (squadBattleMode) {
                selectSquadLeaders();
            } else {
                clearSquadLeaders();
            }
        };
    }
    
    const autoAddRandomCheckbox = panel.querySelector('#autoAddRandom');
    if (autoAddRandomCheckbox) {
        autoAddRandomCheckbox.checked = document.getElementById('autoAddRandom').checked;
        autoAddRandomCheckbox.onchange = function() {
            autoAddRandomEnabled = this.checked;
            document.getElementById('autoAddRandom').checked = this.checked;
        };
    }
    
    const autoDeployCheckbox = panel.querySelector('#autoDeploy');
    if (autoDeployCheckbox) {
        autoDeployCheckbox.checked = document.getElementById('autoDeploy').checked;
        autoDeployCheckbox.onchange = function() {
            autoDeployEnabled = this.checked;
            document.getElementById('autoDeploy').checked = this.checked;
        };
    }
    
    const hideBattleInfoCheckbox = panel.querySelector('#hideBattleInfo');
    if (hideBattleInfoCheckbox) {
        hideBattleInfoCheckbox.checked = document.getElementById('hideBattleInfo').checked;
        hideBattleInfoCheckbox.onchange = function() {
            const hideBattleInfo = this.checked;
            const battleInfoWrapper = document.getElementById('battleInfoWrapper');
            document.getElementById('hideBattleInfo').checked = this.checked;
            if (hideBattleInfo) {
                battleInfoWrapper.classList.add('hidden');
            } else {
                battleInfoWrapper.classList.remove('hidden');
            }
        };
    }
    
    const hideStatsCheckbox = panel.querySelector('#hideStats');
    if (hideStatsCheckbox) {
        hideStatsCheckbox.checked = document.getElementById('hideStats').checked;
        hideStatsCheckbox.onchange = function() {
            const hideStats = this.checked;
            const player1Stats = document.getElementById('player1Stats');
            const player2Stats = document.getElementById('player2Stats');
            document.getElementById('hideStats').checked = this.checked;
            if (hideStats) {
                player1Stats.classList.add('hidden');
                player2Stats.classList.add('hidden');
            } else {
                player1Stats.classList.remove('hidden');
                player2Stats.classList.remove('hidden');
            }
        };
    }
    
    const hideReadyAreaCheckbox = panel.querySelector('#hideReadyArea');
    if (hideReadyAreaCheckbox) {
        hideReadyAreaCheckbox.checked = document.getElementById('hideReadyArea').checked;
        hideReadyAreaCheckbox.onchange = function() {
            const hideReadyArea = this.checked;
            const readyArea = document.getElementById('readyarea');
            document.getElementById('hideReadyArea').checked = this.checked;
            if (hideReadyArea) {
                readyArea.classList.add('hidden');
            } else {
                readyArea.classList.remove('hidden');
            }
        };
    }
    
    const pauseGameCheckbox = panel.querySelector('#pauseGame');
    if (pauseGameCheckbox) {
        pauseGameCheckbox.checked = document.getElementById('pauseGame').checked;
        pauseGameCheckbox.onchange = function() {
            gamePaused = this.checked;
            document.getElementById('pauseGame').checked = this.checked;
        };
    }
    
    const fullscreenModeCheckbox = panel.querySelector('#fullscreenMode');
    if (fullscreenModeCheckbox) {
        fullscreenModeCheckbox.checked = document.getElementById('fullscreenMode').checked;
        fullscreenModeCheckbox.onchange = function() {
            document.getElementById('fullscreenMode').checked = this.checked;
            if (this.checked) {
                document.documentElement.requestFullscreen().catch(err => console.log(err));
            } else {
                if (document.fullscreenElement) {
                    document.exitFullscreen();
                }
            }
        };
    }
    
    const gameSpeedLabel = panel.querySelector('#gameSpeed');
    if (gameSpeedLabel) {
        gameSpeedLabel.textContent = document.getElementById('gameSpeed').textContent;
        gameSpeedLabel.parentElement.onclick = function() {
            const currentIndex = gameSpeeds.indexOf(gameSpeed);
            const nextIndex = (currentIndex + 1) % gameSpeeds.length;
            gameSpeed = gameSpeeds[nextIndex];
            
            const gameSpeedElement = this.querySelector('#gameSpeed');
            const originalGameSpeedElement = document.getElementById('gameSpeed');
            
            if(gameSpeed != 1) {
                gameSpeedElement.textContent = `⏩︎${gameSpeed}x倍速`;
                originalGameSpeedElement.textContent = `⏩︎${gameSpeed}x倍速`;
            } else {
                gameSpeedElement.textContent = `${gameSpeed}x倍速`;
                originalGameSpeedElement.textContent = `${gameSpeed}x倍速`;
            }
            
            if (gameSpeed === 1) {
                gameSpeedElement.classList.remove('fast');
                originalGameSpeedElement.classList.remove('fast');
            } else {
                gameSpeedElement.classList.add('fast');
                originalGameSpeedElement.classList.add('fast');
            }
        };
    }
    
    const iconSizeSlider = panel.querySelector('#iconSizeSlider');
    if (iconSizeSlider) {
        iconSizeSlider.value = iconSize;
        iconSizeSlider.oninput = function() {
            updateIconSize(this.value);
            document.getElementById('iconSizeSlider').value = this.value;
        };
    }
}

function removeOptionsPanel() {
    const optionsPanel = document.querySelector('.options-panel');
    if (optionsPanel) {
        optionsPanel.remove();
    }
}

const DEFAULT_WEAPONS_CONFIG = JSON.parse(JSON.stringify(GAME_CONFIG.weapons));
const DEFAULT_COMBAT_CONFIG = JSON.parse(JSON.stringify(GAME_CONFIG.combat));

const WEAPON_FIELD_META = {
    name: { label: '武器名称', type: 'text', desc: '' },
    emoji: { label: '表情图标', type: 'text', desc: '' },
    attack: { label: '攻击力', type: 'number', desc: '基础攻击伤害', min: 0 },
    type: { label: '武器类型', type: 'select', desc: '', options: ['melee', 'ranged', 'aoe', 'heal', 'buff'] },
    range: { label: '攻击范围', type: 'number', desc: '像素', min: 1 },
    attackSpeed: { label: '攻击速度', type: 'number', desc: '毫秒/次', min: 100 },
    maxCharges: { label: '弹夹容量', type: 'number', desc: '每次装填弹药数', min: 1 },
    cooldownTime: { label: '换弹时间', type: 'number', desc: '毫秒', min: 0 },
    heal: { label: '治疗量', type: 'number', desc: '治疗武器专用', min: 0 },
    aoeRadius: { label: 'AOE半径', type: 'number', desc: 'AOE武器专用', min: 0 },
    knockbackDistance: { label: '击退距离', type: 'number', desc: '像素', min: 0 },
    ignoreDefense: { label: '无视防御', type: 'checkbox', desc: '伤害不计算防御' },
    burnDuration: { label: '燃烧持续', type: 'number', desc: '毫秒', min: 0 },
    burnInterval: { label: '燃烧间隔', type: 'number', desc: '毫秒', min: 100 },
    freezeDuration: { label: '冰冻持续', type: 'number', desc: '毫秒', min: 0 },
    buffDuration: { label: '增益持续', type: 'number', desc: '毫秒', min: 0 },
    buffMultiplier: { label: '增益倍率', type: 'number', desc: '属性倍率', min: 0, step: 0.1 },
    chargeSpeed: { label: '冲锋速度', type: 'number', desc: '自爆武器专用', min: 0 },
    deathExplosionMultiplier: { label: '死亡自爆倍率', type: 'number', desc: '死亡时爆炸伤害比例', min: 0, step: 0.05 },
    isSelfDestruct: { label: '是否自爆', type: 'checkbox', desc: '武器是否为自爆类型' },
    defaultDirection: { label: '默认朝向', type: 'select', desc: '', options: ['top', 'bottom', 'left', 'right'] },
    effectType: { label: '特效类型', type: 'select', desc: '', options: ['slash', 'stab', 'chop', 'smash', 'pierce', 'dig', 'arrow', 'bullet', 'explosion', 'lightning', 'fire', 'ice', 'heal', 'buff'] }
};

function getCombatFieldMeta() {
    return {
        'damage.randomMin': { label: '伤害随机最小', type: 'number', desc: '伤害浮动下限', min: 0.1, step: 0.05, section: '伤害系统' },
        'damage.randomMax': { label: '伤害随机最大', type: 'number', desc: '伤害浮动上限', min: 0.1, step: 0.05, section: '伤害系统' },
        'damage.defenseFactor': { label: '防御减免系数', type: 'number', desc: '防御值×该系数=减伤', min: 0, step: 0.05, section: '伤害系统' },
        'damage.aoeEdgeDamageFactor': { label: 'AOE边缘伤害', type: 'number', desc: 'AOE边缘伤害比例', min: 0, step: 0.05, section: '伤害系统' },
        'damage.levelUpHealPercent': { label: '升级回血比例', type: 'number', desc: '升级时回血百分比', min: 0, step: 0.05, section: '伤害系统' },
        'damage.levelUpMaxHealthBonus': { label: '升级生命加成', type: 'number', desc: '升级最大生命倍率', min: 1, step: 0.05, section: '伤害系统' },
        'damage.minDamage': { label: '最小伤害', type: 'number', desc: '最低伤害值', min: 1, section: '伤害系统' },
        'dodge.speedFactor': { label: '闪避系数', type: 'number', desc: '速度×该系数=闪避率', min: 0, step: 0.005, section: '闪避系统' },
        'burn.damageFactor': { label: '燃烧伤害比例', type: 'number', desc: '每次跳伤害占初始伤害比例', min: 0, step: 0.05, section: '燃烧DOT' },
        'burn.defaultDuration': { label: '燃烧默认持续', type: 'number', desc: '毫秒', min: 0, section: '燃烧DOT' },
        'burn.defaultInterval': { label: '燃烧默认间隔', type: 'number', desc: '毫秒', min: 100, section: '燃烧DOT' },
        'weaponDefaults.aoeRadius': { label: '默认AOE半径', type: 'number', desc: '像素', min: 0, section: '武器默认值' },
        'weaponDefaults.healAmount': { label: '默认治疗量', type: 'number', desc: '', min: 0, section: '武器默认值' },
        'weaponDefaults.attack': { label: '默认攻击力', type: 'number', desc: '', min: 0, section: '武器默认值' },
        'weaponDefaults.chargeSpeed': { label: '默认冲锋速度', type: 'number', desc: '', min: 0, section: '武器默认值' },
        'weaponDefaults.deathExplosionMultiplier': { label: '默认死亡自爆倍率', type: 'number', desc: '', min: 0, step: 0.05, section: '武器默认值' },
        'buff.defaultDuration': { label: '默认增益持续', type: 'number', desc: '毫秒', min: 0, section: '增益系统' },
        'buff.defaultMultiplier': { label: '默认增益倍率', type: 'number', desc: '', min: 0, step: 0.1, section: '增益系统' },
        'squad.meleeIdealRangeVsMelee': { label: '近战vs近战', type: 'number', desc: '理想射程比例', min: 0, step: 0.05, section: '小队战斗' },
        'squad.meleeIdealRangeVsRanged': { label: '近战vs远程', type: 'number', desc: '理想射程比例', min: 0, step: 0.05, section: '小队战斗' },
        'squad.rangedIdealRangeVsMelee': { label: '远程vs近战', type: 'number', desc: '理想射程比例', min: 0, step: 0.05, section: '小队战斗' },
        'squad.rangedIdealRangeVsRanged': { label: '远程vs远程', type: 'number', desc: '理想射程比例', min: 0, step: 0.05, section: '小队战斗' },
        'squad.aoeIdealRangeVsMelee': { label: 'AOEvs近战', type: 'number', desc: '理想射程比例', min: 0, step: 0.05, section: '小队战斗' },
        'squad.aoeIdealRangeVsRanged': { label: 'AOEvs远程', type: 'number', desc: '理想射程比例', min: 0, step: 0.05, section: '小队战斗' },
        'squad.retreatHealthThreshold': { label: '后撤血量阈值', type: 'number', desc: '低于该比例后撤', min: 0, step: 0.05, section: '小队战斗' },
        'squad.retreatCloseRangeFactor': { label: '后撤贴脸比例', type: 'number', desc: '', min: 0, step: 0.05, section: '小队战斗' },
        'squad.retreatDistance': { label: '后撤距离', type: 'number', desc: '像素', min: 0, section: '小队战斗' },
        'squad.supportPriorityHealPercent': { label: '辅助治疗阈值', type: 'number', desc: '低于该比例优先治疗', min: 0, step: 0.05, section: '小队战斗' }
    };
}

function openConfigModal() {
    const modal = document.getElementById('configModal');
    if (modal) {
        modal.classList.add('active');
        initWeaponSelect();
        renderCombatConfig();
    }
}

function closeConfigModal() {
    const modal = document.getElementById('configModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

function switchConfigTab(tabName) {
    document.querySelectorAll('.config-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.tab === tabName);
    });
    document.getElementById('weaponsConfig').style.display = tabName === 'weapons' ? 'flex' : 'none';
    document.getElementById('combatConfig').style.display = tabName === 'combat' ? 'flex' : 'none';
}

function initWeaponSelect() {
    const select = document.getElementById('weaponSelect');
    select.innerHTML = '';
    GAME_CONFIG.weapons.forEach((weapon, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = `${weapon.emoji} ${weapon.name}`;
        select.appendChild(option);
    });
    if (GAME_CONFIG.weapons.length > 0) {
        selectWeaponConfig(0);
    }
}

function selectWeaponConfig(index) {
    const weapon = GAME_CONFIG.weapons[index];
    const form = document.getElementById('weaponConfigForm');
    form.innerHTML = '';
    
    const fields = Object.keys(WEAPON_FIELD_META);
    fields.forEach(field => {
        if (!(field in weapon) && field !== 'heal' && field !== 'aoeRadius' && field !== 'knockbackDistance' 
            && field !== 'ignoreDefense' && field !== 'burnDuration' && field !== 'burnInterval'
            && field !== 'freezeDuration' && field !== 'buffDuration' && field !== 'buffMultiplier'
            && field !== 'chargeSpeed' && field !== 'deathExplosionMultiplier' && field !== 'isSelfDestruct') {
            return;
        }
        
        const meta = WEAPON_FIELD_META[field];
        const value = weapon[field] !== undefined ? weapon[field] : (meta.type === 'checkbox' ? false : 0);
        
        const fieldDiv = document.createElement('div');
        fieldDiv.className = 'config-field';
        
        const label = document.createElement('label');
        label.innerHTML = `${meta.label}${meta.desc ? `<span class="field-desc">(${meta.desc})</span>` : ''}`;
        fieldDiv.appendChild(label);
        
        let input;
        if (meta.type === 'select') {
            input = document.createElement('select');
            meta.options.forEach(opt => {
                const option = document.createElement('option');
                option.value = opt;
                option.textContent = opt;
                if (value === opt) option.selected = true;
                input.appendChild(option);
            });
        } else if (meta.type === 'checkbox') {
            input = document.createElement('input');
            input.type = 'checkbox';
            input.checked = value;
        } else {
            input = document.createElement('input');
            input.type = meta.type;
            input.value = value;
            if (meta.min !== undefined) input.min = meta.min;
            if (meta.max !== undefined) input.max = meta.max;
            if (meta.step !== undefined) input.step = meta.step;
        }
        
        input.dataset.field = field;
        input.dataset.weaponIndex = index;
        input.addEventListener('change', (e) => onWeaponFieldChange(e, index, field));
        fieldDiv.appendChild(input);
        form.appendChild(fieldDiv);
    });
}

function onWeaponFieldChange(e, index, field) {
    const weapon = GAME_CONFIG.weapons[index];
    const meta = WEAPON_FIELD_META[field];
    
    if (meta.type === 'checkbox') {
        weapon[field] = e.target.checked;
    } else if (meta.type === 'number') {
        weapon[field] = parseFloat(e.target.value) || 0;
    } else {
        weapon[field] = e.target.value;
    }
    
    updateWeaponInBattle(index);
}

function updateWeaponInBattle(index) {
    const weapon = GAME_CONFIG.weapons[index];
    ['player1', 'player2'].forEach(playerKey => {
        battleIcons[playerKey].forEach(icon => {
            if (icon.weapon.name === weapon.name) {
                icon.weapon = { ...weapon };
            }
        });
    });
}

function renderCombatConfig() {
    const form = document.getElementById('combatConfigForm');
    form.innerHTML = '';
    
    const metaMap = getCombatFieldMeta();
    let currentSection = '';
    
    Object.keys(metaMap).forEach(path => {
        const meta = metaMap[path];
        
        if (meta.section && meta.section !== currentSection) {
            currentSection = meta.section;
            const sectionTitle = document.createElement('div');
            sectionTitle.className = 'config-section-title';
            sectionTitle.textContent = currentSection;
            form.appendChild(sectionTitle);
        }
        
        const value = getNestedValue(GAME_CONFIG.combat, path);
        
        const fieldDiv = document.createElement('div');
        fieldDiv.className = 'config-field';
        
        const label = document.createElement('label');
        label.innerHTML = `${meta.label}${meta.desc ? `<span class="field-desc">(${meta.desc})</span>` : ''}`;
        fieldDiv.appendChild(label);
        
        const input = document.createElement('input');
        input.type = meta.type;
        input.value = value;
        if (meta.min !== undefined) input.min = meta.min;
        if (meta.max !== undefined) input.max = meta.max;
        if (meta.step !== undefined) input.step = meta.step;
        
        input.dataset.path = path;
        input.addEventListener('change', (e) => onCombatFieldChange(e, path));
        fieldDiv.appendChild(input);
        form.appendChild(fieldDiv);
    });
}

function getNestedValue(obj, path) {
    return path.split('.').reduce((o, key) => o[key], obj);
}

function setNestedValue(obj, path, value) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    const target = keys.reduce((o, key) => o[key], obj);
    target[lastKey] = value;
}

function onCombatFieldChange(e, path) {
    const value = parseFloat(e.target.value) || 0;
    setNestedValue(GAME_CONFIG.combat, path, value);
}

function saveConfig() {
    try {
        localStorage.setItem('iconBattle_weaponsConfig', JSON.stringify(GAME_CONFIG.weapons));
        localStorage.setItem('iconBattle_combatConfig', JSON.stringify(GAME_CONFIG.combat));
        
        showConfigToast('配置已保存！');
        closeConfigModal();
    } catch (e) {
        showConfigToast('保存失败：' + e.message);
    }
}

function resetConfig() {
    if (!confirm('确定要重置所有配置为默认值吗？')) return;
    
    GAME_CONFIG.weapons = JSON.parse(JSON.stringify(DEFAULT_WEAPONS_CONFIG));
    GAME_CONFIG.combat = JSON.parse(JSON.stringify(DEFAULT_COMBAT_CONFIG));
    
    localStorage.removeItem('iconBattle_weaponsConfig');
    localStorage.removeItem('iconBattle_combatConfig');
    
    initWeaponSelect();
    renderCombatConfig();
    
    ['player1', 'player2'].forEach(playerKey => {
        battleIcons[playerKey].forEach(icon => {
            const defaultWeapon = DEFAULT_WEAPONS_CONFIG.find(w => w.name === icon.weapon.name);
            if (defaultWeapon) {
                icon.weapon = { ...defaultWeapon };
            }
        });
    });
    
    showConfigToast('已重置为默认配置');
}

function loadSavedConfig() {
    try {
        const savedWeapons = localStorage.getItem('iconBattle_weaponsConfig');
        const savedCombat = localStorage.getItem('iconBattle_combatConfig');
        
        if (savedWeapons) {
            const parsedWeapons = JSON.parse(savedWeapons);
            GAME_CONFIG.weapons = GAME_CONFIG.weapons.map((defaultWeapon, index) => {
                if (parsedWeapons[index]) {
                    return { ...defaultWeapon, ...parsedWeapons[index] };
                }
                return defaultWeapon;
            });
        }
        if (savedCombat) {
            const parsedCombat = JSON.parse(savedCombat);
            GAME_CONFIG.combat = deepMerge(GAME_CONFIG.combat, parsedCombat);
        }
    } catch (e) {
        console.warn('加载保存的配置失败:', e);
    }
}

function deepMerge(target, source) {
    const result = { ...target };
    for (const key in source) {
        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
            result[key] = deepMerge(result[key] || {}, source[key]);
        } else {
            result[key] = source[key];
        }
    }
    return result;
}

function showConfigToast(message) {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0,0,0,0.9);
        color: #fff;
        padding: 15px 30px;
        border-radius: 10px;
        z-index: 9999;
        font-size: 16px;
        animation: fadeInOut 2s ease forwards;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => toast.remove(), 2000);
}

loadSavedConfig();

window.addEventListener('load', init);