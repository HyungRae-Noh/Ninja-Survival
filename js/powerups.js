// 파워업 시스템
class PowerupSystem {
    constructor(player) {
        this.player = player;
    }

    // 파워업 최대 레벨 정의
    getMaxLevel(powerupId) {
        const maxLevels = {
            // 기본 파워업
            'attack_damage': 10,
            'attack_speed': 10,
            'projectile_count': 10,
            'penetration': 5,
            'crit_chance': 10,
            'crit_damage': 10,
            'max_health': 10,
            'damage_reduction': 10,
            'move_speed': 5,
            'exp_gain': 10,
            'orb_collection_range': 5,
            // 불 오라 증강
            'fire_aura_radius': 5,
            'fire_aura_pulse': 5,
            'fire_aura_dot': 5,
            // 수리검 호위 증강
            'shuriken_count': 3,
            'shuriken_speed': 5,
            // 중독 증강
            'poison_stacks': 5,
            'poison_spread': 5,
            'poison_enhance': 5,
            // 분신술 증강
            'shadow_clone_count': 5,
            'shadow_clone_pull': 3,
            'shadow_clone_cooldown': 5,
            // 천둥의 심판 증강
            'thunder_cooldown': 5,
            'thunder_chain': 5,
            'thunder_overload': 5,
            // 바다의 포효 증강
            'wave_amplify': 5,
            'wave_freeze': 3,
            // 기폭찰 증강
            'explosive_tag_cooldown': 5,
            // 호카게의 가호 증강
            'hokage_shield_stack': 3
        };
        return maxLevels[powerupId] || null; // null이면 소모성 파워업
    }

    // 파워업이 최대 레벨에 도달했는지 확인
    isMaxLevel(powerupId) {
        const currentLevel = this.player.powerupLevels[powerupId] || 0;
        const maxLevel = this.getMaxLevel(powerupId);
        // maxLevel이 null이면 소모성 파워업 (이미 선택했으면 true)
        if (maxLevel === null) {
            return currentLevel > 0;
        }
        return currentLevel >= maxLevel;
    }

    // 레벨에 따른 증가량 계산 (문서 기준: 점진적으로 증가)
    getPowerupIncrease(powerupId) {
        const currentLevel = this.player.powerupLevels[powerupId] || 0;
        const maxLevel = this.getMaxLevel(powerupId);
        
        // 각 파워업별 증가량 정의 (레벨당 증가량)
        const increasesPerLevel = {
            'attack_damage': 0.1,        // 레벨당 10%, 최대 100%
            'attack_speed': 0.1,          // 레벨당 10%, 최대 100%
            'crit_chance': 0.1,           // 레벨당 10%, 최대 100%
            'crit_damage': 0.15,          // 레벨당 15%, 최대 300% (1.5 + 1.5 = 3.0)
            'max_health': 0.1,            // 레벨당 10%, 최대 100%
            'damage_reduction': 0.05,     // 레벨당 5%, 최대 50%
            'move_speed': 0.1,            // 레벨당 10%, 최대 50% (레벨 5까지)
            'exp_gain': 0.1,              // 레벨당 10%, 최대 100% (2배)
            'orb_collection_range': 0.1  // 레벨당 10%, 최대 50% (레벨 5까지)
        };
        
        const increasePerLevel = increasesPerLevel[powerupId] || 0.1;
        return increasePerLevel;
    }

    // 파워업 데이터 정의
    getPowerupPool() {
        return [
            // 공격 관련
            {
                id: 'attack_damage',
                name: '피해량 증가 (Might)',
                description: () => {
                    const level = this.player.powerupLevels['attack_damage'] || 0;
                    const increase = this.getPowerupIncrease('attack_damage');
                    const totalIncrease = increase * level; // 현재 레벨의 누적 효과
                    const maxLevel = this.getMaxLevel('attack_damage');
                    if (level >= maxLevel) {
                        return `최대 레벨 달성! 공격력 +100%`;
                    }
                    const currentText = level > 0 ? ` (현재: +${Math.round(totalIncrease * 100)}%)` : '';
                    return `공격력 +${Math.round(increase * 100)}%${currentText}`;
                },
                icon: '⚔️',
                apply: () => {
                    const increase = this.getPowerupIncrease('attack_damage');
                    this.player.stats.attackDamage += increase;
                    // 최대 2.0 (100% 증가) 제한
                    if (this.player.stats.attackDamage > 2.0) {
                        this.player.stats.attackDamage = 2.0;
                    }
                }
            },
            {
                id: 'attack_speed',
                name: '공격 속도 증가 (Cooldown)',
                description: () => {
                    const level = this.player.powerupLevels['attack_speed'] || 0;
                    const increase = this.getPowerupIncrease('attack_speed');
                    const totalIncrease = increase * level; // 현재 레벨의 누적 효과
                    const maxLevel = this.getMaxLevel('attack_speed');
                    if (level >= maxLevel) {
                        return `최대 레벨 달성! 공격 속도 +100%`;
                    }
                    const currentText = level > 0 ? ` (현재: +${Math.round(totalIncrease * 100)}%)` : '';
                    return `공격 속도 +${Math.round(increase * 100)}%${currentText}`;
                },
                icon: '💨',
                apply: () => {
                    const increase = this.getPowerupIncrease('attack_speed');
                    this.player.stats.attackSpeed += increase;
                    // 최대 2.0 (100% 증가) 제한
                    if (this.player.stats.attackSpeed > 2.0) {
                        this.player.stats.attackSpeed = 2.0;
                    }
                }
            },
            {
                id: 'projectile_count',
                name: '투사체 수 증가 (Amount)',
                description: () => {
                    const level = this.player.powerupLevels['projectile_count'] || 0;
                    const maxLevel = this.getMaxLevel('projectile_count');
                    if (level >= maxLevel) {
                        return `최대 레벨 달성! 투사체 10개`;
                    }
                    const currentText = level > 0 ? ` (현재: ${level + 1}개)` : '';
                    return `투사체 개수 +1${currentText}`;
                },
                icon: '🎯',
                apply: () => {
                    this.player.stats.projectileCount += 1;
                    // 최대 10개 제한
                    if (this.player.stats.projectileCount > 10) {
                        this.player.stats.projectileCount = 10;
                    }
                }
            },
            {
                id: 'penetration',
                name: '투사체 관통 수 증가',
                description: () => {
                    const level = this.player.powerupLevels['penetration'] || 0;
                    const maxLevel = this.getMaxLevel('penetration');
                    if (level >= maxLevel) {
                        return `최대 레벨 달성! 관통 수 5명`;
                    }
                    const currentText = level > 0 ? ` (현재: ${level + 1}명)` : '';
                    return `관통 수 +1${currentText}`;
                },
                icon: '🔷',
                apply: () => {
                    this.player.stats.penetration += 1;
                    // 최대 5명 제한
                    if (this.player.stats.penetration > 5) {
                        this.player.stats.penetration = 5;
                    }
                }
            },
            {
                id: 'crit_chance',
                name: '치명타 확률 증가',
                description: () => {
                    const level = this.player.powerupLevels['crit_chance'] || 0;
                    const increase = this.getPowerupIncrease('crit_chance');
                    const totalIncrease = increase * level; // 현재 레벨의 누적 효과
                    const maxLevel = this.getMaxLevel('crit_chance');
                    if (level >= maxLevel) {
                        return `최대 레벨 달성! 치명타 확률 100%`;
                    }
                    const currentText = level > 0 ? ` (현재: ${Math.round(totalIncrease * 100)}%)` : '';
                    return `치명타 확률 +${Math.round(increase * 100)}%${currentText}`;
                },
                icon: '💥',
                apply: () => {
                    const increase = this.getPowerupIncrease('crit_chance');
                    this.player.stats.critChance += increase;
                    // 최대 1.0 (100%) 제한
                    if (this.player.stats.critChance > 1.0) {
                        this.player.stats.critChance = 1.0;
                    }
                }
            },
            {
                id: 'crit_damage',
                name: '치명타 데미지 증가',
                description: () => {
                    const level = this.player.powerupLevels['crit_damage'] || 0;
                    const increase = this.getPowerupIncrease('crit_damage');
                    const baseCritDamage = 1.5; // 기본 치명타 데미지 150%
                    const totalIncrease = baseCritDamage + (increase * level); // 현재 레벨의 누적 효과
                    const maxLevel = this.getMaxLevel('crit_damage');
                    if (level >= maxLevel) {
                        return `최대 레벨 달성! 치명타 데미지 300%`;
                    }
                    const currentText = level > 0 ? ` (현재: ${Math.round(totalIncrease * 100)}%)` : ` (기본: ${Math.round(baseCritDamage * 100)}%)`;
                    return `치명타 데미지 +${Math.round(increase * 100)}%${currentText}`;
                },
                icon: '🔥',
                apply: () => {
                    const increase = this.getPowerupIncrease('crit_damage');
                    this.player.stats.critDamage += increase;
                    // 최대 3.0 (300%) 제한
                    if (this.player.stats.critDamage > 3.0) {
                        this.player.stats.critDamage = 3.0;
                    }
                }
            },
            // 이동 관련
            {
                id: 'move_speed',
                name: '이동 속도 증가 (Move Speed)',
                description: () => {
                    const level = this.player.powerupLevels['move_speed'] || 0;
                    const increase = this.getPowerupIncrease('move_speed');
                    const totalIncrease = increase * level; // 현재 레벨의 누적 효과
                    const maxLevel = this.getMaxLevel('move_speed');
                    if (level >= maxLevel) {
                        return `최대 레벨 달성! 이동 속도 +50%`;
                    }
                    const currentText = level > 0 ? ` (현재: +${Math.round(totalIncrease * 100)}%)` : '';
                    return `이동 속도 +${Math.round(increase * 100)}%${currentText}`;
                },
                icon: '👟',
                apply: () => {
                    const increase = this.getPowerupIncrease('move_speed');
                    this.player.stats.moveSpeed += increase;
                    // 최대 1.5 (50% 증가) 제한
                    if (this.player.stats.moveSpeed > 1.5) {
                        this.player.stats.moveSpeed = 1.5;
                    }
                }
            },
            // 성장 관련
            {
                id: 'exp_gain',
                name: '경험치 획득량 증가',
                description: () => {
                    const level = this.player.powerupLevels['exp_gain'] || 0;
                    const increase = this.getPowerupIncrease('exp_gain');
                    const totalIncrease = increase * level; // 현재 레벨의 누적 효과
                    const maxLevel = this.getMaxLevel('exp_gain');
                    if (level >= maxLevel) {
                        return `최대 레벨 달성! 경험치 획득량 2배`;
                    }
                    const currentText = level > 0 ? ` (현재: ${Math.round(totalIncrease * 100)}%)` : '';
                    return `경험치 획득량 +${Math.round(increase * 100)}%${currentText}`;
                },
                icon: '⭐',
                apply: () => {
                    const increase = this.getPowerupIncrease('exp_gain');
                    this.player.stats.expGain += increase;
                    // 최대 2.0 (100% 증가, 즉 2배) 제한
                    if (this.player.stats.expGain > 2.0) {
                        this.player.stats.expGain = 2.0;
                    }
                }
            },
            {
                id: 'orb_collection_range',
                name: '자석 (Magnet)',
                description: () => {
                    const level = this.player.powerupLevels['orb_collection_range'] || 0;
                    const increase = this.getPowerupIncrease('orb_collection_range');
                    const totalIncrease = increase * level; // 현재 레벨의 누적 효과
                    const maxLevel = this.getMaxLevel('orb_collection_range');
                    if (level >= maxLevel) {
                        return `최대 레벨 달성! 오브 흡수 범위 +50%`;
                    }
                    const currentText = level > 0 ? ` (현재: +${Math.round(totalIncrease * 100)}%)` : '';
                    return `오브 흡수 범위 +${Math.round(increase * 100)}%${currentText}`;
                },
                icon: '🧲',
                apply: () => {
                    const increase = this.getPowerupIncrease('orb_collection_range');
                    this.player.stats.orbCollectionRange += increase;
                    // 최대 1.5 (50% 증가) 제한
                    if (this.player.stats.orbCollectionRange > 1.5) {
                        this.player.stats.orbCollectionRange = 1.5;
                    }
                }
            },
            // 방어/체력 관련
            {
                id: 'max_health',
                name: '최대 체력 증가 (Max Health)',
                description: () => {
                    const level = this.player.powerupLevels['max_health'] || 0;
                    const increase = this.getPowerupIncrease('max_health');
                    const totalIncrease = increase * level; // 현재 레벨의 누적 효과
                    const maxLevel = this.getMaxLevel('max_health');
                    if (level >= maxLevel) {
                        return `최대 레벨 달성! 최대 체력 +100%`;
                    }
                    const currentText = level > 0 ? ` (현재: +${Math.round(totalIncrease * 100)}%)` : '';
                    return `최대 체력 +${Math.round(increase * 100)}%${currentText}`;
                },
                icon: '❤️',
                apply: () => {
                    const oldMaxHealth = this.player.maxHealth;
                    const increase = this.getPowerupIncrease('max_health');
                    this.player.stats.maxHealth += increase;
                    // 최대 2.0 (100% 증가) 제한
                    if (this.player.stats.maxHealth > 2.0) {
                        this.player.stats.maxHealth = 2.0;
                    }
                    this.player.maxHealth = Math.floor(100 * this.player.stats.maxHealth);
                    // 체력 비율 유지
                    const healthPercent = this.player.health / oldMaxHealth;
                    this.player.health = Math.floor(this.player.maxHealth * healthPercent);
                }
            },
            {
                id: 'damage_reduction',
                name: '받는 피해 감소 (%)',
                description: () => {
                    const level = this.player.powerupLevels['damage_reduction'] || 0;
                    const increase = this.getPowerupIncrease('damage_reduction');
                    const totalIncrease = increase * level; // 현재 레벨의 누적 효과
                    const maxLevel = this.getMaxLevel('damage_reduction');
                    if (level >= maxLevel) {
                        return `최대 레벨 달성! 받는 피해 감소 50%`;
                    }
                    const currentText = level > 0 ? ` (현재: ${Math.round(totalIncrease * 100)}%)` : '';
                    return `받는 피해 -${Math.round(increase * 100)}%${currentText}`;
                },
                icon: '🛡️',
                apply: () => {
                    const increase = this.getPowerupIncrease('damage_reduction');
                    this.player.stats.damageReduction += increase;
                    // 최대 0.5 (50%) 제한
                    if (this.player.stats.damageReduction > 0.5) {
                        this.player.stats.damageReduction = 0.5;
                    }
                }
            },
            {
                id: 'heal_half',
                name: '체력 절반 회복',
                description: '최대 체력의 50%를 즉시 회복',
                icon: '💚',
                apply: () => {
                    const healAmount = Math.floor(this.player.maxHealth * 0.5);
                    this.player.health = Math.min(this.player.maxHealth, this.player.health + healAmount);
                }
            },
            {
                id: 'heal_full',
                name: '체력 전부 회복',
                description: '최대 체력까지 완전 회복',
                icon: '💖',
                apply: () => {
                    this.player.health = this.player.maxHealth;
                }
            }
        ];
    }

    // 일반 파워업 풀 (체력 회복 제외)
    getNormalPowerupPool() {
        return this.getPowerupPool().filter(powerup => 
            powerup.id !== 'heal_half' && powerup.id !== 'heal_full'
        );
    }

    // 체력 회복 파워업 풀
    getHealPowerupPool() {
        return this.getPowerupPool().filter(powerup => 
            powerup.id === 'heal_half' || powerup.id === 'heal_full'
        );
    }

    // 특수 파워업 풀 (10레벨 이상)
    getSpecialPowerupPool() {
        return [
            // 소환/보조
            {
                id: 'shadow_clone',
                name: '분신술 (Shadow Clone)',
                description: '플레이어의 느리고 투명한 분신을 소환합니다. 소환수는 플레이어 위치 기반 가장 가까운 적을 추적하여 자폭하여 적에게 피해를 입힙니다.',
                icon: '👤',
                apply: () => {
                    this.player.stats.shadowCloneActive = true;
                    this.player.stats.shadowCloneCount = 1;
                    this.player.stats.shadowCloneCooldown = 5000; // 5초
                    this.player.stats.shadowClonePullRange = 0; // 기본값 0 (증강으로 활성화)
                }
            },
            // 광역/랜덤
            {
                id: 'thunder_judgment',
                name: '천둥의 심판 (Judgment of Thunder)',
                description: '주기적으로 플레이어 주변의 랜덤한 위치에 번개가 떨어져 광역 피해를 줍니다.',
                icon: '⚡',
                apply: () => {
                    this.player.stats.thunderActive = true;
                    this.player.stats.thunderCooldown = 3000; // 3초
                    this.player.stats.thunderDamage = 10;
                    this.player.stats.thunderRadius = 60;
                    this.player.stats.thunderChainChance = 0.25; // 25%
                    this.player.stats.thunderCritChance = 0.05; // 5%
                }
            },
            // 방향성/CC
            {
                id: 'wave_roar',
                name: '바다의 포효 (Roar of the Sea)',
                description: '플레이어가 바라보는 방향으로 강력한 파도 투사체를 발사하여 넓은 지역에 피해를 줍니다. 관통 능력이 있습니다.',
                icon: '🌊',
                apply: () => {
                    this.player.stats.waveActive = true;
                    this.player.stats.waveCooldown = 2000; // 2초
                    this.player.stats.waveDamage = 15;
                    this.player.stats.waveRange = 500;
                    this.player.stats.waveWidth = 80;
                    this.player.stats.waveFreezeChance = 0; // 기본값 0 (증강으로 활성화)
                }
            },
            // 근접/폭발
            {
                id: 'fire_aura',
                name: '🔥 불 오라 (Fire Aura)',
                description: '플레이어 주변에 지속적으로 데미지를 주는 화염 오라 생성.',
                icon: '🔥',
                apply: () => {
                    this.player.stats.fireAuraActive = true;
                    this.player.stats.fireAuraDamage = 3;
                    this.player.stats.fireAuraRadius = 50;
                }
            },
            // 방어/회전
            {
                id: 'shuriken_guard',
                name: '🌀 수리검 호위 (Shuriken Escort)',
                description: '플레이어 주변을 도는 투사체 생성.',
                icon: '🌀',
                apply: () => {
                    this.player.stats.shurikenActive = true;
                    this.player.stats.shurikenCount = 1;
                    this.player.stats.shurikenRotationSpeed = 1.0;
                }
            },
            // 지속 피해
            {
                id: 'poison',
                name: '🧪 중독 (Poison)',
                description: '적에게 스택형 도트 데미지(중독) 부여.',
                icon: '🧪',
                apply: () => {
                    this.player.stats.poisonActive = true;
                    this.player.stats.poisonMaxStacks = 1;
                    this.player.stats.poisonDamage = 2;
                    this.player.stats.poisonDuration = 3000;
                }
            },
            // 자원 파밍
            {
                id: 'greed_aura',
                name: '수확기 (Aura of Greed)',
                description: '영구적으로 저주(Curse) 10%를 부여하여 난이도를 높이는 대신, 골드 획득량을 증가시킵니다.',
                icon: '💰',
                apply: () => {
                    this.player.stats.greedActive = true;
                    this.player.stats.curse = 0.1; // 10% 저주
                    this.player.stats.goldGain = 1.5; // 골드 획득량 1.5배
                }
            },
            // 무기 복제
            {
                id: 'explosive_tag',
                name: '기폭찰 (Explosive Tag)',
                description: '플레이어가 주기적으로 폭발성을 띄는 기폭찰을 발사합니다.',
                icon: '💣',
                apply: () => {
                    this.player.stats.explosiveTagActive = true;
                    this.player.stats.explosiveTagCooldown = 10000; // 10초
                    this.player.stats.explosiveTagDamage = 20;
                    this.player.stats.explosiveTagRadius = 40;
                    this.player.stats.explosiveTagBackward = false; // 기본값 false (증강으로 활성화)
                }
            },
            // 물리/방어
            {
                id: 'hokage_blessing',
                name: '호카게의 가호 (Hokage\'s Blessing)',
                description: '플레이어 주변 영역에 물리 충돌 영역을 생성하여 적들을 넉백시키고 이동 속도를 감소시킵니다.',
                icon: '🛡️',
                apply: () => {
                    this.player.stats.hokageActive = true;
                    this.player.stats.hokageRadius = 80;
                    this.player.stats.hokageKnockback = 5;
                    this.player.stats.hokageSlow = 0.3; // 30% 감소
                    this.player.stats.hokageShieldStackChance = 0; // 기본값 0 (증강으로 활성화)
                }
            }
        ];
    }

    // 불 오라 증강 파워업 풀
    getFireAuraAugmentPool() {
        return [
            {
                id: 'fire_aura_radius',
                name: '화염 반경 확대',
                description: () => {
                    const level = this.player.powerupLevels['fire_aura_radius'] || 0;
                    const increase = 0.2; // 고정 증가량
                    return `오라 범위 +${Math.round(increase * 100)}%`;
                },
                icon: '📏',
                apply: () => {
                    const increase = 0.2;
                    this.player.stats.fireAuraRadiusMultiplier += increase;
                }
            },
            {
                id: 'fire_aura_dot',
                name: '화염 도트 강화',
                description: '오라에 닿은 적에게 3초간 화상 부여 (오라 공격력의 40%, 이동속도 -10%)',
                icon: '💥',
                apply: () => {
                    this.player.stats.fireAuraDotEnabled = true;
                }
            },
            {
                id: 'fire_aura_pulse',
                name: '지옥불 맥동',
                description: '5초마다 화염 오라가 폭발하여 큰 AoE 데미지 (오라 데미지 × 300%)',
                icon: '💣',
                apply: () => {
                    this.player.stats.fireAuraPulseEnabled = true;
                    this.player.stats.fireAuraPulseTimer = 0;
                }
            }
        ];
    }

    // 수리검 호위 증강 파워업 풀
    getShurikenAugmentPool() {
        return [
            {
                id: 'shuriken_count',
                name: '회전 수리검 +1',
                description: '회전하는 수리검 개수 +1',
                icon: '🌀',
                apply: () => {
                    this.player.stats.shurikenCount += 1;
                }
            },
            {
                id: 'shuriken_speed',
                name: '회전 속도 증가',
                description: () => {
                    const increase = 0.3; // 고정 증가량
                    return `수리검 회전 속도 +${Math.round(increase * 100)}%`;
                },
                icon: '⚡',
                apply: () => {
                    const increase = 0.3;
                    this.player.stats.shurikenRotationSpeed += increase;
                }
            },
            {
                id: 'shuriken_penetration',
                name: '강화 수리검 (관통 부여)',
                description: '수리검이 적을 관통 (관통 시 데미지 60%)',
                icon: '🔷',
                apply: () => {
                    this.player.stats.shurikenPenetration = true;
                }
            }
        ];
    }

    // 중독 증강 파워업 풀
    getPoisonAugmentPool() {
        return [
            {
                id: 'poison_stacks',
                name: '중독 중첩 증가',
                description: () => {
                    const currentMax = this.player.stats.poisonMaxStacks;
                    const maxLevel = this.getMaxLevel('poison_stacks');
                    const level = this.player.powerupLevels['poison_stacks'] || 0;
                    if (level >= maxLevel) {
                        return `최대 레벨 달성! 최대 3중첩`;
                    }
                    return `중독이 1회 더 중첩 가능 (최대 ${Math.min(currentMax + 1, 3)}중첩)`;
                },
                icon: '📈',
                apply: () => {
                    this.player.stats.poisonMaxStacks += 1;
                    // 최대 3중첩 제한
                    if (this.player.stats.poisonMaxStacks > 3) {
                        this.player.stats.poisonMaxStacks = 3;
                    }
                }
            },
            {
                id: 'poison_spread',
                name: '중독 확산',
                description: () => {
                    const level = this.player.powerupLevels['poison_spread'] || 0;
                    const maxLevel = this.getMaxLevel('poison_spread');
                    if (level >= maxLevel) {
                        return `최대 레벨 달성! 중독 확산 확률 50%`;
                    }
                    const spreadChance = 0.1 * (level + 1); // 레벨당 10%
                    return `중독된 적이 사망할 때 주변 적에게 ${Math.round(spreadChance * 100)}% 효과로 전염`;
                },
                icon: '💨',
                apply: () => {
                    // 중독 확산은 이미 활성화되어 있으면 레벨만 증가
                    if (!this.player.stats.poisonSpread) {
                        this.player.stats.poisonSpread = true;
                    }
                }
            },
            {
                id: 'poison_enhance',
                name: '독성 강화',
                description: () => {
                    const level = this.player.powerupLevels['poison_enhance'] || 0;
                    const increase = 0.4; // 고정 증가량
                    const maxLevel = this.getMaxLevel('poison_enhance');
                    if (level >= maxLevel) {
                        return `최대 레벨 달성! 중독 데미지 +200%, 지속 시간 +5초`;
                    }
                    return `중독 데미지 +${Math.round(increase * 100)}%, 지속 시간 +1초`;
                },
                icon: '💀',
                apply: () => {
                    const increase = 0.4;
                    this.player.stats.poisonDamage += this.player.stats.poisonDamage * increase;
                    this.player.stats.poisonDuration += 1000; // +1초
                }
            }
        ];
    }

    // 분신술 증강 파워업 풀
    getShadowCloneAugmentPool() {
        return [
            {
                id: 'shadow_clone_count',
                name: '다중그림자 분신술',
                description: () => {
                    const level = this.player.powerupLevels['shadow_clone_count'] || 0;
                    const maxLevel = this.getMaxLevel('shadow_clone_count');
                    if (level >= maxLevel) {
                        return `최대 레벨 달성! 최대 분신 개수: 6기`;
                    }
                    const currentCount = this.player.stats.shadowCloneCount || 1;
                    return `분신 개수 +1 (현재: ${currentCount}기)`;
                },
                icon: '👥',
                apply: () => {
                    this.player.stats.shadowCloneCount += 1;
                    // 최대 6기 제한
                    if (this.player.stats.shadowCloneCount > 6) {
                        this.player.stats.shadowCloneCount = 6;
                    }
                }
            },
            {
                id: 'shadow_clone_pull',
                name: '폭발은 예술이야!',
                description: () => {
                    const level = this.player.powerupLevels['shadow_clone_pull'] || 0;
                    const maxLevel = this.getMaxLevel('shadow_clone_pull');
                    if (level >= maxLevel) {
                        return `최대 레벨 달성! 끌어당기는 범위 100px`;
                    }
                    const pullRange = 50 + (level * 16.67); // 기본 50px, 레벨당 약 16.67px
                    return `소환수 주변 범위 내의 적들을 끌어당김 (범위: ${Math.round(pullRange)}px)`;
                },
                icon: '🌀',
                apply: () => {
                    const level = this.player.powerupLevels['shadow_clone_pull'] || 0;
                    this.player.stats.shadowClonePullRange = 50 + (level * 16.67); // 기본 50px
                    // 최대 100px 제한
                    if (this.player.stats.shadowClonePullRange > 100) {
                        this.player.stats.shadowClonePullRange = 100;
                    }
                }
            },
            {
                id: 'shadow_clone_cooldown',
                name: '차크라 부스트',
                description: () => {
                    const level = this.player.powerupLevels['shadow_clone_cooldown'] || 0;
                    const maxLevel = this.getMaxLevel('shadow_clone_cooldown');
                    if (level >= maxLevel) {
                        return `최대 레벨 달성! 쿨타임 감소 30%`;
                    }
                    const cooldownReduction = 0.06 * (level + 1); // 레벨당 6%
                    return `분신 리젠 쿨타임 감소 ${Math.round(cooldownReduction * 100)}%`;
                },
                icon: '⚡',
                apply: () => {
                    const level = this.player.powerupLevels['shadow_clone_cooldown'] || 0;
                    const reduction = 0.06; // 레벨당 6%
                    const totalReduction = 1.0 - (reduction * (level + 1));
                    // 최대 30% 감소 (0.7배)
                    const finalReduction = Math.max(0.7, totalReduction);
                    this.player.stats.shadowCloneCooldown = 5000 * finalReduction;
                }
            }
        ];
    }

    // 천둥의 심판 증강 파워업 풀
    getThunderAugmentPool() {
        return [
            {
                id: 'thunder_cooldown',
                name: '정전기',
                description: () => {
                    const level = this.player.powerupLevels['thunder_cooldown'] || 0;
                    const maxLevel = this.getMaxLevel('thunder_cooldown');
                    if (level >= maxLevel) {
                        return `최대 레벨 달성! 쿨타임 감소 30%, 적 이동속도 감소`;
                    }
                    const cooldownReduction = 0.06 * (level + 1); // 레벨당 6%
                    return `번개 쿨타임 감소 ${Math.round(cooldownReduction * 100)}%, 명중 시 적 이동속도 감소`;
                },
                icon: '⚡',
                apply: () => {
                    const level = this.player.powerupLevels['thunder_cooldown'] || 0;
                    const reduction = 0.06; // 레벨당 6%
                    const totalReduction = 1.0 - (reduction * (level + 1));
                    const finalReduction = Math.max(0.7, totalReduction); // 최대 30% 감소
                    this.player.stats.thunderCooldown = 3000 * finalReduction;
                    this.player.stats.thunderSlowEnabled = true;
                }
            },
            {
                id: 'thunder_chain',
                name: '연쇄 전도',
                description: () => {
                    const level = this.player.powerupLevels['thunder_chain'] || 0;
                    const maxLevel = this.getMaxLevel('thunder_chain');
                    if (level >= maxLevel) {
                        return `최대 레벨 달성! 연쇄 확률 50%`;
                    }
                    const chainChance = 0.25 + (0.05 * level); // 기본 25%, 레벨당 5%
                    return `번개가 적에게 명중하면 ${Math.round(chainChance * 100)}% 확률로 가까운 적 1~2개체에게 전이`;
                },
                icon: '🔗',
                apply: () => {
                    const level = this.player.powerupLevels['thunder_chain'] || 0;
                    this.player.stats.thunderChainChance = 0.25 + (0.05 * level);
                    // 최대 50% 제한
                    if (this.player.stats.thunderChainChance > 0.5) {
                        this.player.stats.thunderChainChance = 0.5;
                    }
                }
            },
            {
                id: 'thunder_overload',
                name: '과부하 충전',
                description: () => {
                    const level = this.player.powerupLevels['thunder_overload'] || 0;
                    const maxLevel = this.getMaxLevel('thunder_overload');
                    if (level >= maxLevel) {
                        return `최대 레벨 달성! 치명타 확률 20%, 경험치 오브 드랍`;
                    }
                    const critChance = 0.05 + (0.03 * level); // 기본 5%, 레벨당 3%
                    return `번개 치명타 확률 ${Math.round(critChance * 100)}%, 낮은 확률로 경험치 오브 생성`;
                },
                icon: '💥',
                apply: () => {
                    const level = this.player.powerupLevels['thunder_overload'] || 0;
                    this.player.stats.thunderCritChance = 0.05 + (0.03 * level);
                    // 최대 20% 제한
                    if (this.player.stats.thunderCritChance > 0.2) {
                        this.player.stats.thunderCritChance = 0.2;
                    }
                    this.player.stats.thunderExpDropEnabled = true;
                }
            }
        ];
    }

    // 바다의 포효 증강 파워업 풀
    getWaveAugmentPool() {
        return [
            {
                id: 'wave_amplify',
                name: '대해일 증폭',
                description: () => {
                    const level = this.player.powerupLevels['wave_amplify'] || 0;
                    const maxLevel = this.getMaxLevel('wave_amplify');
                    if (level >= maxLevel) {
                        return `최대 레벨 달성! 사거리 증가 30%`;
                    }
                    const rangeIncrease = 0.06 * (level + 1); // 레벨당 6%
                    return `파도 공격 범위와 사거리 증가 ${Math.round(rangeIncrease * 100)}%`;
                },
                icon: '🌊',
                apply: () => {
                    const level = this.player.powerupLevels['wave_amplify'] || 0;
                    const increase = 0.06; // 레벨당 6%
                    const totalIncrease = 1.0 + (increase * (level + 1));
                    const finalIncrease = Math.min(1.3, totalIncrease); // 최대 30% 증가
                    this.player.stats.waveRange = 500 * finalIncrease;
                    this.player.stats.waveWidth = 80 * finalIncrease;
                }
            },
            {
                id: 'wave_freeze',
                name: '심해의 냉기',
                description: () => {
                    const level = this.player.powerupLevels['wave_freeze'] || 0;
                    const maxLevel = this.getMaxLevel('wave_freeze');
                    if (level >= maxLevel) {
                        return `최대 레벨 달성! 이동속도 감소 50%, 얼어붙음 확률 5%`;
                    }
                    const slowAmount = 0.1 + (0.133 * level); // 레벨당 약 13.3%
                    return `파도에 맞은 적 이동속도 감소 ${Math.round(slowAmount * 100)}%, 낮은 확률로 얼어붙음`;
                },
                icon: '❄️',
                apply: () => {
                    const level = this.player.powerupLevels['wave_freeze'] || 0;
                    this.player.stats.waveSlowAmount = 0.1 + (0.133 * level);
                    // 최대 50% 감소 제한
                    if (this.player.stats.waveSlowAmount > 0.5) {
                        this.player.stats.waveSlowAmount = 0.5;
                    }
                    this.player.stats.waveFreezeChance = 0.05; // 5% 확률
                }
            },
            {
                id: 'wave_current',
                name: '조류 가속',
                description: '파도가 3기 이상의 적에게 명중할 때마다 플레이어의 이동 속도가 일정 시간 증가.',
                icon: '💨',
                apply: () => {
                    this.player.stats.waveSpeedBoostEnabled = true;
                    this.player.stats.waveSpeedBoostAmount = 0.05; // 5% 증가
                    this.player.stats.waveSpeedBoostDuration = 2000; // 2초
                }
            }
        ];
    }

    // 수확기 증강 파워업 풀
    getGreedAugmentPool() {
        return [
            {
                id: 'greed_growth',
                name: '성장 가속',
                description: '저주로 인해 생성된 적 처치 시 경험치 추가 획득.',
                icon: '📈',
                apply: () => {
                    this.player.stats.greedExpBonusEnabled = true;
                    this.player.stats.greedExpBonus = 1.5; // 1.5배 경험치
                }
            },
            {
                id: 'greed_gold_fever',
                name: '금화 폭발',
                description: '치명타 발생 시 미니 골드 피버 발동 (자원 파밍과 공격 빌드 연계).',
                icon: '💎',
                apply: () => {
                    this.player.stats.greedGoldFeverEnabled = true;
                    this.player.stats.greedGoldFeverMultiplier = 2.0; // 2배 골드
                }
            }
        ];
    }

    // 기폭찰 증강 파워업 풀
    getExplosiveTagAugmentPool() {
        return [
            {
                id: 'explosive_tag_double',
                name: '이중 발사',
                description: '복제 투사체가 후방으로도 발사되어 전방위 공격 가능.',
                icon: '💥',
                apply: () => {
                    this.player.stats.explosiveTagBackward = true;
                }
            },
            {
                id: 'explosive_tag_cooldown',
                name: '차크라 제어',
                description: () => {
                    const level = this.player.powerupLevels['explosive_tag_cooldown'] || 0;
                    const maxLevel = this.getMaxLevel('explosive_tag_cooldown');
                    if (level >= maxLevel) {
                        return `최대 레벨 달성! 발사 주기 5초`;
                    }
                    const cooldownReduction = 1000 * (level + 1); // 레벨당 1초 감소
                    const newCooldown = 10000 - cooldownReduction;
                    return `기폭찰 발사 주기 감소 (현재: ${newCooldown / 1000}초)`;
                },
                icon: '⚡',
                apply: () => {
                    const level = this.player.powerupLevels['explosive_tag_cooldown'] || 0;
                    const reduction = 1000 * (level + 1); // 레벨당 1초
                    const newCooldown = 10000 - reduction;
                    // 최소 5초 제한
                    this.player.stats.explosiveTagCooldown = Math.max(5000, newCooldown);
                }
            }
        ];
    }

    // 호카게의 가호 증강 파워업 풀
    getHokageAugmentPool() {
        return [
            {
                id: 'hokage_shield_stack',
                name: '방어 스택 충전',
                description: () => {
                    const level = this.player.powerupLevels['hokage_shield_stack'] || 0;
                    const maxLevel = this.getMaxLevel('hokage_shield_stack');
                    if (level >= maxLevel) {
                        return `최대 레벨 달성! 보호막 획득 확률 30%`;
                    }
                    const stackChance = 0.1 * (level + 1); // 레벨당 10%
                    return `공격 받을 때마다 ${Math.round(stackChance * 100)}% 확률로 일회용 보호막 스택 획득`;
                },
                icon: '🛡️',
                apply: () => {
                    const level = this.player.powerupLevels['hokage_shield_stack'] || 0;
                    this.player.stats.hokageShieldStackChance = 0.1 * (level + 1);
                    // 최대 30% 제한
                    if (this.player.stats.hokageShieldStackChance > 0.3) {
                        this.player.stats.hokageShieldStackChance = 0.3;
                    }
                }
            }
        ];
    }
}

