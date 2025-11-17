// 파워업 시스템
class PowerupSystem {
    constructor(player) {
        this.player = player;
    }

    // 레벨에 따른 증가량 계산 (20레벨까지, 점진적으로 증가)
    getPowerupIncrease(baseIncrease, powerupId) {
        const currentLevel = this.player.powerupLevels[powerupId] || 0;
        // 레벨이 높아질수록 증가량 증가 (레벨 1: 100%, 레벨 20: 최대 200%)
        // 지수적 증가로 더 강력한 성장
        const maxLevel = 20;
        // 레벨이 높아질수록 증가량이 증가 (레벨 0: 1.0, 레벨 20: 2.0)
        const increaseFactor = 1.0 + (currentLevel / maxLevel); // 선형 증가: 1.0 ~ 2.0
        const finalIncrease = baseIncrease * increaseFactor;
        return finalIncrease;
    }

    // 파워업 데이터 정의
    getPowerupPool() {
        return [
            // 공격 관련
            {
                id: 'attack_damage',
                name: '투사체 공격력 증가',
                description: () => {
                    const level = this.player.powerupLevels['attack_damage'] || 0;
                    const increase = this.getPowerupIncrease(0.2, 'attack_damage');
                    return `투사체 데미지 +${Math.round(increase * 100)}%`;
                },
                icon: '⚔️',
                apply: () => {
                    const increase = this.getPowerupIncrease(0.2, 'attack_damage');
                    this.player.stats.attackDamage += increase;
                }
            },
            {
                id: 'attack_speed',
                name: '투사체 공격속도 증가',
                description: () => {
                    const level = this.player.powerupLevels['attack_speed'] || 0;
                    const increase = this.getPowerupIncrease(0.15, 'attack_speed');
                    return `공격 간격 -${Math.round(increase * 100)}%`;
                },
                icon: '💨',
                apply: () => {
                    const increase = this.getPowerupIncrease(0.15, 'attack_speed');
                    this.player.stats.attackSpeed += increase;
                }
            },
            {
                id: 'penetration',
                name: '투사체 관통 수 증가',
                description: '관통 수 +1',
                icon: '🔷',
                apply: () => {
                    this.player.stats.penetration += 1;
                }
            },
            {
                id: 'projectile_count',
                name: '투사체 개수 증가',
                description: '한번에 나가는 투사체 +1개',
                icon: '🎯',
                apply: () => {
                    this.player.stats.projectileCount += 1;
                }
            },
            {
                id: 'crit_chance',
                name: '치명타 확률 증가',
                description: () => {
                    const increase = this.getPowerupIncrease(0.05, 'crit_chance');
                    return `치명타 확률 +${Math.round(increase * 100)}%`;
                },
                icon: '💥',
                apply: () => {
                    const increase = this.getPowerupIncrease(0.05, 'crit_chance');
                    this.player.stats.critChance += increase;
                }
            },
            {
                id: 'crit_damage',
                name: '치명타 데미지 증가',
                description: () => {
                    const increase = this.getPowerupIncrease(0.25, 'crit_damage');
                    return `치명타 데미지 +${Math.round(increase * 100)}%`;
                },
                icon: '🔥',
                apply: () => {
                    const increase = this.getPowerupIncrease(0.25, 'crit_damage');
                    this.player.stats.critDamage += increase;
                }
            },
            // 이동 관련
            {
                id: 'move_speed',
                name: '이동 속도 증가',
                description: () => {
                    const increase = this.getPowerupIncrease(0.15, 'move_speed');
                    return `이동 속도 +${Math.round(increase * 100)}%`;
                },
                icon: '👟',
                apply: () => {
                    const increase = this.getPowerupIncrease(0.15, 'move_speed');
                    this.player.stats.moveSpeed += increase;
                }
            },
            // 성장 관련
            {
                id: 'exp_gain',
                name: '경험치 획득량 증가',
                description: () => {
                    const increase = this.getPowerupIncrease(0.25, 'exp_gain');
                    return `경험치 획득량 +${Math.round(increase * 100)}%`;
                },
                icon: '⭐',
                apply: () => {
                    const increase = this.getPowerupIncrease(0.25, 'exp_gain');
                    this.player.stats.expGain += increase;
                }
            },
            {
                id: 'orb_collection_range',
                name: '오브 흡수 범위 증가',
                description: () => {
                    const increase = this.getPowerupIncrease(0.3, 'orb_collection_range');
                    return `오브 흡수 범위 +${Math.round(increase * 100)}%`;
                },
                icon: '🧲',
                apply: () => {
                    const increase = this.getPowerupIncrease(0.3, 'orb_collection_range');
                    this.player.stats.orbCollectionRange += increase;
                }
            },
            // 방어/체력 관련
            {
                id: 'max_health',
                name: '최대 체력 증가',
                description: () => {
                    const increase = this.getPowerupIncrease(0.2, 'max_health');
                    return `최대 체력 +${Math.round(increase * 100)}%`;
                },
                icon: '❤️',
                apply: () => {
                    const oldMaxHealth = this.player.maxHealth;
                    const increase = this.getPowerupIncrease(0.2, 'max_health');
                    this.player.stats.maxHealth += increase;
                    this.player.maxHealth = Math.floor(100 * this.player.stats.maxHealth);
                    // 체력 비율 유지
                    const healthPercent = this.player.health / oldMaxHealth;
                    this.player.health = Math.floor(this.player.maxHealth * healthPercent);
                }
            },
            {
                id: 'damage_reduction',
                name: '받는 피해 감소',
                description: () => {
                    const increase = this.getPowerupIncrease(0.1, 'damage_reduction');
                    return `받는 피해 -${Math.round(increase * 100)}%`;
                },
                icon: '🛡️',
                apply: () => {
                    const increase = this.getPowerupIncrease(0.1, 'damage_reduction');
                    this.player.stats.damageReduction += increase;
                }
            },
            {
                id: 'heal_half',
                name: '체력 절반 회복',
                description: '최대 체력의 50% 회복',
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
            {
                id: 'fire_aura',
                name: '🔥 불 오라',
                description: '플레이어 주변에 지속적으로 데미지를 주는 근접형 빌드',
                icon: '🔥',
                apply: () => {
                    this.player.stats.fireAuraActive = true;
                    this.player.stats.fireAuraDamage = 3;
                    this.player.stats.fireAuraRadius = 50;
                }
            },
            {
                id: 'shuriken_guard',
                name: '🌀 수리검 호위',
                description: '플레이어 주변을 도는 투사체 기반의 방어·근접 공격 빌드',
                icon: '🌀',
                apply: () => {
                    this.player.stats.shurikenActive = true;
                    this.player.stats.shurikenCount = 1;
                    this.player.stats.shurikenRotationSpeed = 1.0;
                }
            },
            {
                id: 'poison',
                name: '🧪 중독',
                description: '적에게 도트 데미지(중독) 부여하는 지속 피해 기반의 고효율 스택형 빌드',
                icon: '🧪',
                apply: () => {
                    this.player.stats.poisonActive = true;
                    this.player.stats.poisonMaxStacks = 1;
                    this.player.stats.poisonDamage = 2;
                    this.player.stats.poisonDuration = 3000;
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
                    const increase = this.getPowerupIncrease(0.2, 'fire_aura_radius');
                    return `오라 범위 +${Math.round(increase * 100)}%`;
                },
                icon: '📏',
                apply: () => {
                    const increase = this.getPowerupIncrease(0.2, 'fire_aura_radius');
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
                    const increase = this.getPowerupIncrease(0.3, 'shuriken_speed');
                    return `수리검 회전 속도 +${Math.round(increase * 100)}%`;
                },
                icon: '⚡',
                apply: () => {
                    const increase = this.getPowerupIncrease(0.3, 'shuriken_speed');
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
                    return `중독이 1회 더 중첩 가능 (최대 ${currentMax + 1}중첩)`;
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
                description: '중독된 적이 사망할 때 주변 적에게 50% 효과로 전염',
                icon: '💨',
                apply: () => {
                    this.player.stats.poisonSpread = true;
                }
            },
            {
                id: 'poison_enhance',
                name: '독성 강화',
                description: () => {
                    const increase = this.getPowerupIncrease(0.4, 'poison_enhance');
                    return `중독 데미지 +${Math.round(increase * 100)}%, 지속 시간 +1초`;
                },
                icon: '💀',
                apply: () => {
                    const increase = this.getPowerupIncrease(0.4, 'poison_enhance');
                    this.player.stats.poisonDamage += this.player.stats.poisonDamage * increase;
                    this.player.stats.poisonDuration += 1000; // +1초
                }
            }
        ];
    }
}

