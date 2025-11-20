// Game 클래스
class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = CONFIG.CANVAS_WIDTH;
        this.canvas.height = CONFIG.CANVAS_HEIGHT;

        // 게임 상태
        this.state = 'start'; // start, playing, levelup, gameover
        this.lastTime = 0;
        this.deltaTime = 0;

        // 카메라 오프셋 (플레이어를 화면 중앙에 유지)
        this.camera = {
            x: 0,
            y: 0
        };

        // 플레이어 생성 (월드 중앙)
        this.player = new Player(
            CONFIG.WORLD_WIDTH / 2,
            CONFIG.WORLD_HEIGHT / 2
        );

        // 파워업 시스템 초기화
        this.powerupSystem = new PowerupSystem(this.player);

        // 적 배열
        this.enemies = [];
        this.lastSpawnTime = 0;
        this.spawnTimer = 0;

        // 투사체 배열
        this.projectiles = [];
        this.attackTimer = 0;

        // 경험치 오브 배열
        this.experienceOrbs = [];

        // 무적 시간
        this.player.invincible = false;
        this.player.invincibleTimer = 0;

        // 게임 시간 추적
        this.gameStartTime = 0;
        this.gameTime = 0; // 밀리초 단위

        // 난이도 조절
        this.currentSpawnInterval = CONFIG.ENEMY_SPAWN_INTERVAL;
        this.currentEnemyHealth = CONFIG.ENEMY_BASE_HEALTH;
        this.lastSpawnIntervalUpdate = 0; // 마지막 스폰 간격 업데이트 시간
        this.lastHealthUpdate = 0; // 마지막 체력 업데이트 시간

        // 처치 수
        this.kills = 0;

        // 레벨업 관련
        this.levelUpOptions = []; // 현재 레벨업 옵션

        // 불 오라 폭발 효과
        this.fireAuraPulseEffects = []; // 폭발 효과 배열

        // 수리검 호위 배열
        this.shurikens = []; // 수리검 배열

        // 분신술 관련
        this.shadowClones = []; // 분신 배열
        this.shadowCloneTimer = 0; // 분신 리젠 타이머

        // 천둥의 심판 관련
        this.thunderTimer = 0; // 천둥 타이머
        this.thunderEffects = []; // 천둥 효과 배열

        // 바다의 포효 관련
        this.waveTimer = 0; // 파도 발사 타이머
        this.waves = []; // 파도 투사체 배열
        this.waveSpeedBoostTimer = 0; // 이동속도 증가 타이머

        // 기폭찰 관련
        this.explosiveTagTimer = 0; // 기폭찰 발사 타이머
        this.explosiveTags = []; // 기폭찰 배열
        this.explosiveExplosions = []; // 기폭찰 폭발 효과 배열

        // 호카게의 가호 관련
        this.hokageTimer = 0; // 호카게의 가호 넉백 타이머

        // 배경 이미지
        this.backgroundImage = new Image();
        this.backgroundImage.src = 'img/background.png';
        this.backgroundLoaded = false;
        this.backgroundImage.onload = () => {
            this.backgroundLoaded = true;
            console.log('Background image loaded');
        };
        this.backgroundImage.onerror = () => {
            console.error('Failed to load background image:', this.backgroundImage.src);
            this.backgroundLoaded = false;
        };

        // 이벤트 리스너 설정
        this.setupEventListeners();
        
        // 게임 루프 시작
        this.gameLoop(0);
    }

    setupEventListeners() {
        // 키보드 입력 (window에 등록하여 포커스 문제 해결)
        window.addEventListener('keydown', (e) => this.handleKeyDown(e));
        window.addEventListener('keyup', (e) => this.handleKeyUp(e));

        // 시작 버튼
        document.getElementById('btn-start').addEventListener('click', () => {
            this.startGame();
        });

        // 재시작 버튼
        document.getElementById('btn-restart').addEventListener('click', () => {
            this.restartGame();
        });
    }

    handleKeyDown(e) {
        // 레벨업 화면에서 키 입력 처리
        if (this.state === 'levelup') {
            const key = e.key;
            if (key === '1' || key === '2' || key === '3') {
                const index = parseInt(key) - 1;
                this.selectPowerup(index);
                e.preventDefault();
                return;
            }
        }
        
        if (this.state !== 'playing') return;

        const key = e.key.toLowerCase();
        const keyCode = e.key;
        const code = e.code; // 물리적 키 코드 (예: 'KeyW', 'KeyA' 등)

        // WASD 키 처리 (여러 방법으로 체크)
        if (key === 'w' || keyCode === 'ArrowUp' || code === 'KeyW' || code === 'ArrowUp') {
            this.player.keys.up = true;
            e.preventDefault();
            e.stopPropagation();
        }
        if (key === 's' || keyCode === 'ArrowDown' || code === 'KeyS' || code === 'ArrowDown') {
            this.player.keys.down = true;
            e.preventDefault();
            e.stopPropagation();
        }
        if (key === 'a' || keyCode === 'ArrowLeft' || code === 'KeyA' || code === 'ArrowLeft') {
            this.player.keys.left = true;
            e.preventDefault();
            e.stopPropagation();
        }
        if (key === 'd' || keyCode === 'ArrowRight' || code === 'KeyD' || code === 'ArrowRight') {
            this.player.keys.right = true;
            e.preventDefault();
            e.stopPropagation();
        }
    }

    handleKeyUp(e) {
        if (this.state !== 'playing') return;

        const key = e.key.toLowerCase();
        const keyCode = e.key;
        const code = e.code; // 물리적 키 코드 (예: 'KeyW', 'KeyA' 등)

        // WASD 키 처리 (여러 방법으로 체크)
        if (key === 'w' || keyCode === 'ArrowUp' || code === 'KeyW' || code === 'ArrowUp') {
            this.player.keys.up = false;
            e.preventDefault();
            e.stopPropagation();
        }
        if (key === 's' || keyCode === 'ArrowDown' || code === 'KeyS' || code === 'ArrowDown') {
            this.player.keys.down = false;
            e.preventDefault();
            e.stopPropagation();
        }
        if (key === 'a' || keyCode === 'ArrowLeft' || code === 'KeyA' || code === 'ArrowLeft') {
            this.player.keys.left = false;
            e.preventDefault();
            e.stopPropagation();
        }
        if (key === 'd' || keyCode === 'ArrowRight' || code === 'KeyD' || code === 'ArrowRight') {
            this.player.keys.right = false;
            e.preventDefault();
            e.stopPropagation();
        }
    }

    startGame() {
        this.state = 'playing';
        document.getElementById('start-screen').style.display = 'none';
        
        // 플레이어 초기화 (월드 중앙)
        this.player = new Player(
            CONFIG.WORLD_WIDTH / 2,
            CONFIG.WORLD_HEIGHT / 2
        );
        this.player.invincible = false;
        this.player.invincibleTimer = 0;
        this.player.powerupLevels = {}; // 파워업 레벨 초기화
        
        // 파워업 시스템 재초기화
        this.powerupSystem = new PowerupSystem(this.player);
        
        // 적 배열 초기화
        this.enemies = [];
        this.lastSpawnTime = 0;
        this.spawnTimer = 0;
        
        // 투사체 배열 초기화
        this.projectiles = [];
        this.attackTimer = 0;
        
        // 경험치 오브 배열 초기화
        this.experienceOrbs = [];
        
        // 불 오라 폭발 효과 초기화
        this.fireAuraPulseEffects = [];
        
        // 수리검 호위 초기화
        this.shurikens = [];
        
        // 분신술 초기화
        this.shadowClones = [];
        this.shadowCloneTimer = 0;
        
        // 천둥의 심판 초기화
        this.thunderTimer = 0;
        this.thunderEffects = [];
        
        // 바다의 포효 초기화
        this.waveTimer = 0;
        this.waves = [];
        this.waveSpeedBoostTimer = 0;
        
        // 기폭찰 초기화
        this.explosiveTagTimer = 0;
        this.explosiveTags = [];
        this.explosiveExplosions = [];
        
        // 호카게의 가호 초기화
        this.hokageTimer = 0;
        
        // 처치 수 초기화
        this.kills = 0;
        
        // 게임 시간 초기화
        this.gameStartTime = Date.now();
        this.gameTime = 0;
        
        // 카메라 초기화
        this.camera.x = 0;
        this.camera.y = 0;
    }

    restartGame() {
        this.startGame();
        document.getElementById('gameover-screen').style.display = 'none';
    }

    update(deltaTime) {
        if (this.state !== 'playing') return;

        // 게임 시간 업데이트
        this.gameTime = Date.now() - this.gameStartTime;

        // 난이도 조절 업데이트
        this.updateDifficulty();

        // 플레이어 업데이트
        this.player.update(this.deltaTime);
        
        // 무적 시간 업데이트
        if (this.player.invincible) {
            this.player.invincibleTimer -= deltaTime;
            if (this.player.invincibleTimer <= 0) {
                this.player.invincible = false;
            }
        }
        
        // 적 스폰 (최대 적 수 제한)
        this.spawnTimer += deltaTime;
        if (this.spawnTimer >= this.currentSpawnInterval && this.enemies.length < CONFIG.MAX_ENEMIES) {
            this.spawnEnemies();
            this.spawnTimer = 0;
        }
        
        // 자동 공격 (파워업 적용)
        const attackInterval = CONFIG.PROJECTILE_ATTACK_INTERVAL / this.player.stats.attackSpeed;
        this.attackTimer += deltaTime;
        if (this.attackTimer >= attackInterval) {
            this.attack();
            this.attackTimer = 0;
        }
        
        // 불 오라 효과 처리
        this.updateFireAura(deltaTime);
        
        // 불 오라 폭발 효과 업데이트
        this.updateFireAuraPulseEffects(deltaTime);
        
        // 수리검 호위 업데이트
        this.updateShurikens(deltaTime);
        
        // 분신술 업데이트
        this.updateShadowClones(deltaTime);
        
        // 천둥의 심판 업데이트
        this.updateThunder(deltaTime);
        
        // 바다의 포효 업데이트
        this.updateWaves(deltaTime);
        
        // 기폭찰 업데이트
        this.updateExplosiveTags(deltaTime);
        
        // 호카게의 가호 업데이트
        this.updateHokageBlessing(deltaTime);
        
        // 천둥 효과 업데이트
        if (this.thunderEffects) {
            for (let i = this.thunderEffects.length - 1; i >= 0; i--) {
                const effect = this.thunderEffects[i];
                effect.duration -= deltaTime;
                if (effect.duration <= 0) {
                    this.thunderEffects.splice(i, 1);
                }
            }
        }
        
        // 조류 가속 효과 적용
        if (this.waveSpeedBoostTimer > 0) {
            this.waveSpeedBoostTimer -= deltaTime;
            if (this.waveSpeedBoostTimer <= 0) {
                this.waveSpeedBoostTimer = 0;
                this.player.waveSpeedBoostActive = false;
            }
        } else {
            this.player.waveSpeedBoostActive = false;
        }
        
        // 투사체 업데이트
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const projectile = this.projectiles[i];
            projectile.update();
            
            // 사거리 초과 또는 화면 밖 체크
            const projectileScreenX = projectile.x - this.camera.x;
            const projectileScreenY = projectile.y - this.camera.y;
            const margin = 100;
            
            if (projectile.isOutOfRange() || 
                projectileScreenX < -margin || projectileScreenX > CONFIG.CANVAS_WIDTH + margin ||
                projectileScreenY < -margin || projectileScreenY > CONFIG.CANVAS_HEIGHT + margin) {
                this.projectiles.splice(i, 1);
            }
        }
        
        // 경험치 오브 업데이트 (레벨업 화면이 아닐 때만)
        if (this.state === 'playing') {
            const effectiveCollectionRange = CONFIG.EXP_ORB_COLLECT_RANGE * this.player.stats.orbCollectionRange;
            
            for (let i = this.experienceOrbs.length - 1; i >= 0; i--) {
                // 레벨업 화면이 표시되면 오브 수집 중단
                if (this.state !== 'playing') {
                    break;
                }
                
                const orb = this.experienceOrbs[i];
                orb.update(this.player.x, this.player.y, effectiveCollectionRange, deltaTime);
                
                // 플레이어와 직접 충돌 체크 (오브가 플레이어에 닿았을 때만 수집)
                const dx = orb.x - this.player.x;
                const dy = orb.y - this.player.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < (orb.radius + this.player.radius)) {
                    // 경험치 획득량 적용
                    const expGained = Math.floor(orb.expValue * this.player.stats.expGain);
                    this.player.exp += expGained;
                    this.experienceOrbs.splice(i, 1);
                    
                    // HUD 즉시 업데이트
                    this.updateHUD();
                    
                    // 레벨업 체크 (상태 확인 후)
                    if (this.state === 'playing') {
                        this.checkLevelUp();
                        // 레벨업이 발생했으면 나머지 오브 수집 중단
                        if (this.state !== 'playing') {
                            break;
                        }
                    }
                }
            }
        }
        
        // 투사체-적 충돌 체크
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const projectile = this.projectiles[i];
            let shouldRemove = false;
            
            for (let j = this.enemies.length - 1; j >= 0; j--) {
                const enemy = this.enemies[j];
                
                // 이미 관통한 적은 건너뛰기
                if (projectile.penetratedEnemies.includes(enemy)) {
                    continue;
                }
                
                if (projectile.checkCollision(enemy.x, enemy.y, enemy.radius)) {
                    // 데미지 적용
                    enemy.health -= projectile.damage;
                    
                    // 중독 효과 적용
                    if (this.player.stats.poisonActive) {
                        this.applyPoison(enemy);
                    }
                    
                    // 관통 처리
                    if (projectile.penetration > 0) {
                        projectile.penetratedEnemies.push(enemy);
                        projectile.penetration--;
                    } else {
                        // 관통 수가 없으면 투사체 제거
                        shouldRemove = true;
                    }
                    
                    // 적 사망 체크
                    if (enemy.health <= 0) {
                        // 중독 확산 처리
                        if (this.player.stats.poisonSpread && enemy.poisoned && enemy.poisonStacks > 0) {
                            this.spreadPoison(enemy.x, enemy.y);
                        }
                        
                        // 경험치 오브 생성 (적의 orbDropCount만큼 생성)
                        this.createExperienceOrbs(enemy.x, enemy.y, enemy.orbDropCount, enemy.expValue);
                        
                        // 처치 수 증가
                        this.kills++;
                        
                        // 적 제거
                        this.enemies.splice(j, 1);
                    }
                    
                    // 관통 수가 없으면 더 이상 체크하지 않음
                    if (shouldRemove) {
                        break;
                    }
                }
            }
            
            // 투사체 제거
            if (shouldRemove) {
                this.projectiles.splice(i, 1);
            }
        }
        
        // 적 업데이트
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            enemy.update(this.player.x, this.player.y, deltaTime);
            
            // 플레이어와 충돌 감지
            if (!this.player.invincible && enemy.checkCollision(this.player.x, this.player.y, this.player.radius)) {
                // 받는 피해 감소 적용
                const baseDamage = 10;
                const damageReduction = this.player.stats.damageReduction;
                const finalDamage = Math.floor(baseDamage * (1 - damageReduction));
                
                // 플레이어 데미지
                this.player.health -= finalDamage;
                this.player.invincible = true;
                this.player.invincibleTimer = CONFIG.PLAYER_INVINCIBLE_TIME;
                
                // 체력이 0 이하면 게임 오버
                if (this.player.health <= 0) {
                    this.player.health = 0;
                    this.gameOver();
                }
            }
            
            // 화면 밖 적 제거 (카메라 기준)
            const enemyScreenX = enemy.x - this.camera.x;
            const enemyScreenY = enemy.y - this.camera.y;
            const margin = 200; // 여유 공간
            
            if (enemyScreenX < -margin || enemyScreenX > CONFIG.CANVAS_WIDTH + margin ||
                enemyScreenY < -margin || enemyScreenY > CONFIG.CANVAS_HEIGHT + margin) {
                this.enemies.splice(i, 1);
            }
        }
        
        // 카메라 업데이트 (플레이어를 화면 중앙에 유지)
        this.camera.x = this.player.x - CONFIG.CANVAS_WIDTH / 2;
        this.camera.y = this.player.y - CONFIG.CANVAS_HEIGHT / 2;
        
        // 카메라 경계 제한 (월드 경계를 넘지 않도록)
        this.camera.x = Math.max(0, Math.min(CONFIG.WORLD_WIDTH - CONFIG.CANVAS_WIDTH, this.camera.x));
        this.camera.y = Math.max(0, Math.min(CONFIG.WORLD_HEIGHT - CONFIG.CANVAS_HEIGHT, this.camera.y));
    }

    // 난이도 조절 업데이트
    updateDifficulty() {
        const gameTimeSeconds = Math.floor(this.gameTime / 1000);
        
        // 30초마다 스폰 간격 감소
        const spawnIntervalUpdateInterval = 30; // 30초
        const spawnIntervalUpdates = Math.floor(gameTimeSeconds / spawnIntervalUpdateInterval);
        
        if (spawnIntervalUpdates > this.lastSpawnIntervalUpdate) {
            this.currentSpawnInterval = Math.max(
                CONFIG.SPAWN_INTERVAL_MIN,
                CONFIG.ENEMY_SPAWN_INTERVAL - (spawnIntervalUpdates * CONFIG.SPAWN_INTERVAL_DECREASE)
            );
            this.lastSpawnIntervalUpdate = spawnIntervalUpdates;
        }
        
        // 1분마다 적 체력 증가
        const healthUpdateInterval = 60; // 60초 (1분)
        const healthUpdates = Math.floor(gameTimeSeconds / healthUpdateInterval);
        
        if (healthUpdates > this.lastHealthUpdate) {
            this.currentEnemyHealth = CONFIG.ENEMY_BASE_HEALTH + (healthUpdates * CONFIG.HEALTH_INCREASE);
            this.lastHealthUpdate = healthUpdates;
        }
    }

    spawnEnemies() {
        // 화면 가장자리에서 스폰 (카메라 기준)
        const spawnCount = CONFIG.ENEMY_SPAWN_COUNT;
        
        for (let i = 0; i < spawnCount; i++) {
            // 카메라 기준 화면 가장자리 위치 계산
            const side = Math.floor(Math.random() * 4); // 0: 위, 1: 오른쪽, 2: 아래, 3: 왼쪽
            let x, y;
            
            switch(side) {
                case 0: // 위
                    x = this.camera.x + Math.random() * CONFIG.CANVAS_WIDTH;
                    y = this.camera.y - 50;
                    break;
                case 1: // 오른쪽
                    x = this.camera.x + CONFIG.CANVAS_WIDTH + 50;
                    y = this.camera.y + Math.random() * CONFIG.CANVAS_HEIGHT;
                    break;
                case 2: // 아래
                    x = this.camera.x + Math.random() * CONFIG.CANVAS_WIDTH;
                    y = this.camera.y + CONFIG.CANVAS_HEIGHT + 50;
                    break;
                case 3: // 왼쪽
                    x = this.camera.x - 50;
                    y = this.camera.y + Math.random() * CONFIG.CANVAS_HEIGHT;
                    break;
            }
            
            // 월드 경계 체크
            x = Math.max(0, Math.min(CONFIG.WORLD_WIDTH, x));
            y = Math.max(0, Math.min(CONFIG.WORLD_HEIGHT, y));
            
            // 적 타입 랜덤 선택 (일반 70%, 빠른 20%, 강한 10%)
            const rand = Math.random();
            let enemyType = 'normal';
            if (rand < 0.1) {
                enemyType = 'strong';
            } else if (rand < 0.3) {
                enemyType = 'fast';
            }
            
            // 적 생성 (난이도에 따른 체력 적용)
            const enemy = new Enemy(x, y, enemyType, this.currentEnemyHealth);
            this.enemies.push(enemy);
        }
    }

    attack() {
        // 가장 가까운 적 찾기
        let closestEnemy = null;
        let closestDistance = Infinity;
        
        for (const enemy of this.enemies) {
            const dx = enemy.x - this.player.x;
            const dy = enemy.y - this.player.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < closestDistance) {
                closestDistance = distance;
                closestEnemy = enemy;
            }
        }
        
        // 적이 있으면 투사체 발사
        if (closestEnemy) {
            const dx = closestEnemy.x - this.player.x;
            const dy = closestEnemy.y - this.player.y;
            const angle = Math.atan2(dy, dx);
            
            // 투사체 개수만큼 발사
            const projectileCount = this.player.stats.projectileCount;
            
            if (projectileCount === 1) {
                // 단일 투사체
                const projectile = new Projectile(
                    this.player.x,
                    this.player.y,
                    dx,
                    dy,
                    this.player.stats
                );
                this.projectiles.push(projectile);
            } else {
                // 여러 투사체 (각도 분산)
                const spreadAngle = Math.PI / 6; // 30도 분산
                const angleStep = spreadAngle / (projectileCount - 1);
                const startAngle = angle - spreadAngle / 2;
                
                for (let i = 0; i < projectileCount; i++) {
                    const currentAngle = startAngle + angleStep * i;
                    const dirX = Math.cos(currentAngle);
                    const dirY = Math.sin(currentAngle);
                    
                    const projectile = new Projectile(
                        this.player.x,
                        this.player.y,
                        dirX,
                        dirY,
                        this.player.stats
                    );
                    this.projectiles.push(projectile);
                }
            }
        }
    }

    createExperienceOrb(x, y, expValue = null) {
        const finalExpValue = expValue || CONFIG.EXP_BASE_VALUE;
        const orb = new ExperienceOrb(x, y, finalExpValue);
        this.experienceOrbs.push(orb);
    }

    // 여러 개의 경험치 오브 생성 (위치를 약간 분산)
    createExperienceOrbs(x, y, count, expValue = null) {
        const finalExpValue = expValue || CONFIG.EXP_BASE_VALUE;
        const spreadRadius = 15; // 오브 분산 반경
        
        for (let i = 0; i < count; i++) {
            // 원형으로 분산 배치
            const angle = (Math.PI * 2 / count) * i;
            const offsetX = Math.cos(angle) * spreadRadius * (Math.random() * 0.5 + 0.5);
            const offsetY = Math.sin(angle) * spreadRadius * (Math.random() * 0.5 + 0.5);
            
            const orb = new ExperienceOrb(x + offsetX, y + offsetY, finalExpValue);
            this.experienceOrbs.push(orb);
        }
    }

    // 불 오라 효과 업데이트
    updateFireAura(deltaTime) {
        if (!this.player.stats.fireAuraActive) return;

        const auraRadius = this.player.stats.fireAuraRadius * this.player.stats.fireAuraRadiusMultiplier;
        const auraDamage = this.player.stats.fireAuraDamage;
        const fireAuraDamageInterval = 500; // 0.5초마다 데미지
        const lastDamageTime = this.player.stats.fireAuraLastDamageTime || 0;
        const currentTime = Date.now();

        // 지옥불 맥동 타이머 업데이트
        if (this.player.stats.fireAuraPulseEnabled) {
            this.player.stats.fireAuraPulseTimer += deltaTime;
            
            if (this.player.stats.fireAuraPulseTimer >= this.player.stats.fireAuraPulseInterval) {
                // 폭발 효과
                this.fireAuraPulse();
                this.player.stats.fireAuraPulseTimer = 0;
            }
        }

        // 불 오라 데미지 적용 (0.5초마다)
        if (currentTime - lastDamageTime >= fireAuraDamageInterval) {
            for (let i = this.enemies.length - 1; i >= 0; i--) {
                const enemy = this.enemies[i];
                const dx = enemy.x - this.player.x;
                const dy = enemy.y - this.player.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const effectiveRadius = auraRadius + enemy.radius;

                // 불 오라 범위 내에 있는 적에게 데미지
                if (distance < effectiveRadius) {
                    enemy.health -= auraDamage;

                    // 화상 도트 효과 적용
                    if (this.player.stats.fireAuraDotEnabled) {
                        enemy.burned = true;
                        enemy.burnTimer = 3000; // 3초
                        // 화상 도트 데미지는 오라 데미지의 40% (1초당)
                        enemy.burnDamage = this.player.stats.fireAuraDamage * 0.4;
                        enemy.burnDamageAccumulator = 0; // 누적기 초기화
                    }

                    // 적 사망 체크
                    if (enemy.health <= 0) {
                        // 중독 확산 처리
                        if (this.player.stats.poisonSpread && enemy.poisoned && enemy.poisonStacks > 0) {
                            this.spreadPoison(enemy.x, enemy.y);
                        }
                        
                        // 경험치 오브 생성 (적의 orbDropCount만큼 생성)
                        this.createExperienceOrbs(enemy.x, enemy.y, enemy.orbDropCount, enemy.expValue);
                        this.kills++;
                        this.enemies.splice(i, 1);
                    }
                }
            }
            this.player.stats.fireAuraLastDamageTime = currentTime;
        }
    }

    // 불 오라 폭발 효과 업데이트
    updateFireAuraPulseEffects(deltaTime) {
        for (let i = this.fireAuraPulseEffects.length - 1; i >= 0; i--) {
            const effect = this.fireAuraPulseEffects[i];
            effect.duration -= deltaTime;
            
            // 효과 크기 증가
            const progress = 1 - (effect.duration / 500);
            effect.radius = effect.maxRadius * progress;
            effect.alpha = 1.0 - progress;
            
            // 효과 종료
            if (effect.duration <= 0) {
                this.fireAuraPulseEffects.splice(i, 1);
            }
        }
    }

    // 중독 효과 적용
    applyPoison(enemy) {
        if (!this.player.stats.poisonActive) return;
        
        const maxStacks = this.player.stats.poisonMaxStacks;
        const poisonDamage = this.player.stats.poisonDamage;
        const poisonDuration = this.player.stats.poisonDuration;
        
        // 중독 중첩 증가 (최대 중첩 수까지)
        if (enemy.poisonStacks < maxStacks) {
            enemy.poisonStacks += 1;
        }
        
        // 중독 상태 활성화
        enemy.poisoned = true;
        enemy.poisonTimer = poisonDuration;
        enemy.poisonDamage = poisonDamage;
        enemy.poisonDamageAccumulator = 0;
    }

    // 중독 확산
    spreadPoison(centerX, centerY) {
        const spreadRadius = 80; // 확산 범위
        const spreadDamage = this.player.stats.poisonDamage * 0.5; // 50% 데미지
        const spreadDuration = this.player.stats.poisonDuration;
        const spreadStacks = 1; // 확산 시 1중첩만 부여
        
        for (const enemy of this.enemies) {
            const dx = enemy.x - centerX;
            const dy = enemy.y - centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // 확산 범위 내의 적에게 중독 부여
            if (distance <= spreadRadius) {
                // 중독 중첩 증가 (최대 중첩 수까지)
                if (enemy.poisonStacks < this.player.stats.poisonMaxStacks) {
                    enemy.poisonStacks += spreadStacks;
                }
                
                // 중독 상태 활성화
                enemy.poisoned = true;
                enemy.poisonTimer = spreadDuration;
                enemy.poisonDamage = spreadDamage;
                enemy.poisonDamageAccumulator = 0;
            }
        }
    }

    // 수리검 호위 업데이트
    updateShurikens(deltaTime) {
        if (!this.player.stats.shurikenActive) {
            this.shurikens = [];
            return;
        }

        const shurikenCount = this.player.stats.shurikenCount;
        const rotationSpeedMultiplier = this.player.stats.shurikenRotationSpeed;

        // 수리검 개수 조정
        while (this.shurikens.length < shurikenCount) {
            const angle = (Math.PI * 2 / shurikenCount) * this.shurikens.length;
            const shuriken = new Shuriken(
                this.player.x,
                this.player.y,
                angle,
                this.shurikens.length,
                shurikenCount
            );
            shuriken.damage = 5;
            shuriken.penetration = this.player.stats.shurikenPenetration;
            this.shurikens.push(shuriken);
        }

        // 수리검 개수가 줄어들면 제거
        while (this.shurikens.length > shurikenCount) {
            this.shurikens.pop();
        }

        // 수리검 업데이트
        for (const shuriken of this.shurikens) {
            shuriken.update(this.player.x, this.player.y, rotationSpeedMultiplier);
            shuriken.totalCount = shurikenCount; // 개수 업데이트
            shuriken.penetration = this.player.stats.shurikenPenetration; // 관통 상태 업데이트
        }

        // 수리검-적 충돌 체크
        const currentTime = Date.now();
        for (const shuriken of this.shurikens) {
            for (let j = this.enemies.length - 1; j >= 0; j--) {
                const enemy = this.enemies[j];

                // 이미 관통한 적은 건너뛰기
                if (shuriken.penetration && shuriken.penetratedEnemies.includes(enemy)) {
                    continue;
                }

                // 타격 쿨다운 체크
                if (currentTime - shuriken.lastHitTime < shuriken.hitCooldown) {
                    continue;
                }

                if (shuriken.checkCollision(enemy.x, enemy.y, enemy.radius)) {
                    // 데미지 계산 (관통 시 60% 데미지)
                    const damage = shuriken.penetration ? shuriken.damage * 0.6 : shuriken.damage;
                    enemy.health -= damage;

                    // 관통 처리
                    if (shuriken.penetration) {
                        shuriken.penetratedEnemies.push(enemy);
                    }

                    // 타격 시간 업데이트
                    shuriken.lastHitTime = currentTime;

                    // 적 사망 체크
                    if (enemy.health <= 0) {
                        // 중독 확산 처리
                        if (this.player.stats.poisonSpread && enemy.poisoned && enemy.poisonStacks > 0) {
                            this.spreadPoison(enemy.x, enemy.y);
                        }
                        
                        // 관통한 적 목록에서 제거
                        if (shuriken.penetration) {
                            const index = shuriken.penetratedEnemies.indexOf(enemy);
                            if (index > -1) {
                                shuriken.penetratedEnemies.splice(index, 1);
                            }
                        }

                        // 경험치 오브 생성 (적의 orbDropCount만큼 생성)
                        this.createExperienceOrbs(enemy.x, enemy.y, enemy.orbDropCount, enemy.expValue);
                        this.kills++;
                        this.enemies.splice(j, 1);
                    }

                    // 관통이 없으면 한 적만 타격
                    if (!shuriken.penetration) {
                        break;
                    }
                }
            }
        }
    }

    // 지옥불 맥동 폭발 효과
    fireAuraPulse() {
        const auraRadius = this.player.stats.fireAuraRadius * this.player.stats.fireAuraRadiusMultiplier;
        const pulseRadius = auraRadius * 1.5; // 폭발 범위는 오라 범위의 1.5배
        const pulseDamage = this.player.stats.fireAuraDamage * 3; // 오라 데미지 × 300%

        // 폭발 효과 추가
        this.fireAuraPulseEffects.push({
            x: this.player.x,
            y: this.player.y,
            radius: 0,
            maxRadius: pulseRadius,
            alpha: 1.0,
            duration: 500 // 0.5초 동안 표시
        });

        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            const dx = enemy.x - this.player.x;
            const dy = enemy.y - this.player.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const effectiveRadius = pulseRadius + enemy.radius;

            // 폭발 범위 내에 있는 적에게 데미지
            if (distance < effectiveRadius) {
                enemy.health -= pulseDamage;

                // 적 사망 체크
                if (enemy.health <= 0) {
                    // 중독 확산 처리
                    if (this.player.stats.poisonSpread && enemy.poisoned && enemy.poisonStacks > 0) {
                        this.spreadPoison(enemy.x, enemy.y);
                    }
                    
                    // 경험치 오브 생성 (적의 orbDropCount만큼 생성)
                    this.createExperienceOrbs(enemy.x, enemy.y, enemy.orbDropCount, enemy.expValue);
                    this.kills++;
                    this.enemies.splice(i, 1);
                }
            }
        }
    }

    // 분신술 업데이트
    updateShadowClones(deltaTime) {
        if (!this.player.stats.shadowCloneActive) {
            this.shadowClones = [];
            return;
        }

        const maxClones = this.player.stats.shadowCloneCount || 1;
        const cooldown = this.player.stats.shadowCloneCooldown || 5000;

        // 분신 리젠 타이머 업데이트
        this.shadowCloneTimer += deltaTime;
        if (this.shadowCloneTimer >= cooldown && this.shadowClones.length < maxClones) {
            // 새로운 분신 생성
            this.shadowClones.push({
                x: this.player.x,
                y: this.player.y,
                targetX: this.player.x,
                targetY: this.player.y,
                speed: 2, // 느린 속도
                alpha: 0.5, // 투명
                damage: 15,
                radius: 20,
                pullRange: this.player.stats.shadowClonePullRange || 0,
                exploded: false
            });
            this.shadowCloneTimer = 0;
        }

        // 분신 업데이트
        for (let i = this.shadowClones.length - 1; i >= 0; i--) {
            const clone = this.shadowClones[i];
            
            if (clone.exploded) {
                this.shadowClones.splice(i, 1);
                continue;
            }

            // 가장 가까운 적 찾기
            let closestEnemy = null;
            let closestDistance = Infinity;
            
            for (const enemy of this.enemies) {
                const dx = enemy.x - clone.x;
                const dy = enemy.y - clone.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestEnemy = enemy;
                }
            }

            if (closestEnemy) {
                // 적을 향해 이동
                const dx = closestEnemy.x - clone.x;
                const dy = closestEnemy.y - clone.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance > 0) {
                    clone.x += (dx / distance) * clone.speed;
                    clone.y += (dy / distance) * clone.speed;
                }

                // 적과 충돌 체크 (자폭)
                if (distance < (clone.radius + closestEnemy.radius)) {
                    // 데미지 적용
                    closestEnemy.health -= clone.damage;
                    
                    // 끌어당기기 효과
                    if (clone.pullRange > 0) {
                        for (const enemy of this.enemies) {
                            const edx = enemy.x - clone.x;
                            const edy = enemy.y - clone.y;
                            const edist = Math.sqrt(edx * edx + edy * edy);
                            
                            if (edist <= clone.pullRange && enemy !== closestEnemy) {
                                const pullStrength = 0.3;
                                enemy.x += (edx / edist) * pullStrength;
                                enemy.y += (edy / edist) * pullStrength;
                            }
                        }
                    }

                    // 적 사망 체크
                    if (closestEnemy.health <= 0) {
                        this.createExperienceOrbs(closestEnemy.x, closestEnemy.y, closestEnemy.orbDropCount, closestEnemy.expValue);
                        this.kills++;
                        const index = this.enemies.indexOf(closestEnemy);
                        if (index > -1) this.enemies.splice(index, 1);
                    }

                    clone.exploded = true;
                }
            } else {
                // 적이 없으면 플레이어 위치로 이동
                const dx = this.player.x - clone.x;
                const dy = this.player.y - clone.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance > 0) {
                    clone.x += (dx / distance) * clone.speed;
                    clone.y += (dy / distance) * clone.speed;
                }
            }
        }
    }

    // 천둥의 심판 업데이트
    updateThunder(deltaTime) {
        if (!this.player.stats.thunderActive) return;

        this.thunderTimer += deltaTime;
        const cooldown = this.player.stats.thunderCooldown || 3000;

        if (this.thunderTimer >= cooldown) {
            // 플레이어 주변 랜덤 위치에 번개 떨어뜨리기
            const angle = Math.random() * Math.PI * 2;
            const distance = 100 + Math.random() * 200; // 100~300px 거리
            const thunderX = this.player.x + Math.cos(angle) * distance;
            const thunderY = this.player.y + Math.sin(angle) * distance;

            // 번개 효과 생성
            this.strikeThunder(thunderX, thunderY);
            this.thunderTimer = 0;
        }
    }

    // 번개 떨어뜨리기
    strikeThunder(x, y) {
        const damage = this.player.stats.thunderDamage || 10;
        const radius = this.player.stats.thunderRadius || 60;
        const critChance = this.player.stats.thunderCritChance || 0.05;
        const isCrit = Math.random() < critChance;
        const finalDamage = isCrit ? damage * 2 : damage; // 치명타 시 2배

        // 번개 효과 (시각적)
        this.thunderEffects = this.thunderEffects || [];
        this.thunderEffects.push({
            x: x,
            y: y,
            radius: 0,
            maxRadius: radius,
            alpha: 1.0,
            duration: 300,
            maxDuration: 300
        });

        // 범위 내 적에게 데미지
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            const dx = enemy.x - x;
            const dy = enemy.y - y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < radius + enemy.radius) {
                enemy.health -= finalDamage;

                // 이동속도 감소
                if (this.player.stats.thunderSlowEnabled) {
                    enemy.slowTimer = 1000; // 1초간 감소
                    enemy.slowAmount = 0.5; // 50% 감소
                }

                // 연쇄 전도
                if (this.player.stats.thunderChainChance > 0 && Math.random() < this.player.stats.thunderChainChance) {
                    // 가까운 다른 적 찾기
                    let chainTarget = null;
                    let chainDistance = Infinity;
                    
                    for (const otherEnemy of this.enemies) {
                        if (otherEnemy === enemy) continue;
                        const cdx = otherEnemy.x - enemy.x;
                        const cdy = otherEnemy.y - enemy.y;
                        const cdist = Math.sqrt(cdx * cdx + cdy * cdy);
                        
                        if (cdist < chainDistance && cdist < 150) {
                            chainDistance = cdist;
                            chainTarget = otherEnemy;
                        }
                    }

                    if (chainTarget) {
                        chainTarget.health -= finalDamage * 0.5; // 50% 데미지
                    }
                }

                // 적 사망 체크
                if (enemy.health <= 0) {
                    // 경험치 오브 드랍 (과부하 충전)
                    if (this.player.stats.thunderExpDropEnabled && Math.random() < 0.3) {
                        const orbCount = 1 + Math.floor(Math.random() * 3); // 1~3개
                        this.createExperienceOrbs(enemy.x, enemy.y, orbCount, 5);
                    } else {
                        this.createExperienceOrbs(enemy.x, enemy.y, enemy.orbDropCount, enemy.expValue);
                    }
                    this.kills++;
                    this.enemies.splice(i, 1);
                }
            }
        }
    }

    // 바다의 포효 업데이트
    updateWaves(deltaTime) {
        if (!this.player.stats.waveActive) {
            this.waves = [];
            return;
        }

        this.waveTimer += deltaTime;
        const cooldown = this.player.stats.waveCooldown || 2000;

        if (this.waveTimer >= cooldown) {
            // 플레이어가 바라보는 방향으로 파도 발사
            const direction = this.player.lastDirection; // 0: 아래, 1: 위, 2: 왼쪽, 3: 오른쪽
            let dirX = 0, dirY = 0;
            
            switch(direction) {
                case 0: dirY = 1; break; // 아래
                case 1: dirY = -1; break; // 위
                case 2: dirX = -1; break; // 왼쪽
                case 3: dirX = 1; break; // 오른쪽
            }

            this.waves.push({
                x: this.player.x,
                y: this.player.y,
                dirX: dirX,
                dirY: dirY,
                speed: 6,
                range: this.player.stats.waveRange || 500,
                width: this.player.stats.waveWidth || 80,
                damage: this.player.stats.waveDamage || 15,
                distanceTraveled: 0,
                penetratedEnemies: []
            });

            this.waveTimer = 0;
        }

        // 파도 업데이트
        for (let i = this.waves.length - 1; i >= 0; i--) {
            const wave = this.waves[i];
            
            wave.x += wave.dirX * wave.speed;
            wave.y += wave.dirY * wave.speed;
            wave.distanceTraveled += wave.speed;

            // 사거리 초과 체크
            if (wave.distanceTraveled >= wave.range) {
                this.waves.splice(i, 1);
                continue;
            }

            // 적과 충돌 체크
            let hitCount = 0;
            for (let j = this.enemies.length - 1; j >= 0; j--) {
                const enemy = this.enemies[j];
                
                if (wave.penetratedEnemies.includes(enemy)) continue;

                const dx = enemy.x - wave.x;
                const dy = enemy.y - wave.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                // 파도 폭 내에 있는지 체크
                if (distance < wave.width / 2 + enemy.radius) {
                    enemy.health -= wave.damage;
                    wave.penetratedEnemies.push(enemy);
                    hitCount++;

                    // 이동속도 감소 및 얼어붙음
                    if (this.player.stats.waveSlowAmount > 0) {
                        enemy.slowTimer = 2000; // 2초간
                        enemy.slowAmount = this.player.stats.waveSlowAmount;
                        
                        if (this.player.stats.waveFreezeChance > 0 && Math.random() < this.player.stats.waveFreezeChance) {
                            enemy.frozen = true;
                            enemy.frozenTimer = 1000; // 1초간
                        }
                    }

                    // 조류 가속 (3기 이상 명중 시)
                    if (hitCount >= 3 && this.player.stats.waveSpeedBoostEnabled) {
                        this.waveSpeedBoostTimer = this.player.stats.waveSpeedBoostDuration || 2000;
                        this.player.waveSpeedBoostActive = true;
                        this.player.waveSpeedBoostAmount = this.player.stats.waveSpeedBoostAmount || 0.05;
                    }

                    // 적 사망 체크
                    if (enemy.health <= 0) {
                        this.createExperienceOrbs(enemy.x, enemy.y, enemy.orbDropCount, enemy.expValue);
                        this.kills++;
                        this.enemies.splice(j, 1);
                    }
                }
            }
        }
    }

    // 기폭찰 업데이트
    updateExplosiveTags(deltaTime) {
        if (!this.player.stats.explosiveTagActive) {
            this.explosiveTags = [];
            return;
        }

        this.explosiveTagTimer += deltaTime;
        const cooldown = this.player.stats.explosiveTagCooldown || 10000;

        if (this.explosiveTagTimer >= cooldown) {
            // 가장 가까운 적 방향으로 기폭찰 발사
            let targetX = this.player.x + 100;
            let targetY = this.player.y;
            
            let closestEnemy = null;
            let closestDistance = Infinity;
            
            for (const enemy of this.enemies) {
                const dx = enemy.x - this.player.x;
                const dy = enemy.y - this.player.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestEnemy = enemy;
                }
            }

            if (closestEnemy) {
                targetX = closestEnemy.x;
                targetY = closestEnemy.y;
            }

            const dx = targetX - this.player.x;
            const dy = targetY - this.player.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const dirX = distance > 0 ? dx / distance : 0;
            const dirY = distance > 0 ? dy / distance : 0;

            this.explosiveTags.push({
                x: this.player.x,
                y: this.player.y,
                dirX: dirX,
                dirY: dirY,
                speed: 5,
                damage: this.player.stats.explosiveTagDamage || 20,
                radius: this.player.stats.explosiveTagRadius || 40,
                distanceTraveled: 0,
                maxDistance: 400
            });

            // 후방 발사 (이중 발사 증강)
            if (this.player.stats.explosiveTagBackward) {
                this.explosiveTags.push({
                    x: this.player.x,
                    y: this.player.y,
                    dirX: -dirX,
                    dirY: -dirY,
                    speed: 5,
                    damage: this.player.stats.explosiveTagDamage || 20,
                    radius: this.player.stats.explosiveTagRadius || 40,
                    distanceTraveled: 0,
                    maxDistance: 400
                });
            }

            this.explosiveTagTimer = 0;
        }

        // 기폭찰 업데이트
        for (let i = this.explosiveTags.length - 1; i >= 0; i--) {
            const tag = this.explosiveTags[i];
            
            tag.x += tag.dirX * tag.speed;
            tag.y += tag.dirY * tag.speed;
            tag.distanceTraveled += tag.speed;

            // 사거리 초과 또는 적 충돌 시 폭발
            let shouldExplode = tag.distanceTraveled >= tag.maxDistance;

            for (const enemy of this.enemies) {
                const dx = enemy.x - tag.x;
                const dy = enemy.y - tag.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < tag.radius + enemy.radius) {
                    shouldExplode = true;
                    break;
                }
            }

            if (shouldExplode) {
                // 폭발 효과
                this.explosiveExplosions.push({
                    x: tag.x,
                    y: tag.y,
                    radius: 0,
                    maxRadius: tag.radius,
                    alpha: 1.0,
                    duration: 400
                });

                // 범위 내 적에게 데미지
                for (let j = this.enemies.length - 1; j >= 0; j--) {
                    const enemy = this.enemies[j];
                    const dx = enemy.x - tag.x;
                    const dy = enemy.y - tag.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < tag.radius + enemy.radius) {
                        enemy.health -= tag.damage;

                        if (enemy.health <= 0) {
                            this.createExperienceOrbs(enemy.x, enemy.y, enemy.orbDropCount, enemy.expValue);
                            this.kills++;
                            this.enemies.splice(j, 1);
                        }
                    }
                }

                this.explosiveTags.splice(i, 1);
            }
        }

        // 폭발 효과 업데이트
        if (this.explosiveExplosions) {
            for (let i = this.explosiveExplosions.length - 1; i >= 0; i--) {
                const explosion = this.explosiveExplosions[i];
                explosion.duration -= deltaTime;
                explosion.radius = explosion.maxRadius * (1 - explosion.duration / 400);
                explosion.alpha = explosion.duration / 400;

                if (explosion.duration <= 0) {
                    this.explosiveExplosions.splice(i, 1);
                }
            }
        }
    }

    // 호카게의 가호 업데이트
    updateHokageBlessing(deltaTime) {
        if (!this.player.stats.hokageActive) return;

        const radius = this.player.stats.hokageRadius || 80;
        const knockback = this.player.stats.hokageKnockback || 5;
        const slow = this.player.stats.hokageSlow || 0.3;
        const cooldown = 25000; // 25초 쿨타임

        // 타이머 업데이트
        this.hokageTimer += deltaTime;

        // 25초마다 넉백 발동
        if (this.hokageTimer >= cooldown) {
            // 플레이어 주변의 적 넉백
            for (const enemy of this.enemies) {
                const dx = enemy.x - this.player.x;
                const dy = enemy.y - this.player.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < radius + enemy.radius) {
                    // 넉백
                    if (distance > 0) {
                        const knockbackX = (dx / distance) * knockback;
                        const knockbackY = (dy / distance) * knockback;
                        enemy.x += knockbackX;
                        enemy.y += knockbackY;
                    }

                    // 이동속도 감소
                    enemy.slowTimer = 2000; // 2초간 적용
                    enemy.slowAmount = slow;
                }
            }

            // 타이머 리셋
            this.hokageTimer = 0;
        }
    }

    checkLevelUp() {
        // 경험치가 충분하면 레벨업 (한 번에 하나씩만 레벨업)
        if (this.player.exp >= this.player.expToNext && this.state === 'playing') {
            this.player.exp -= this.player.expToNext;
            this.player.level++;
            // 경험치 요구량 조정: 레벨이 높아질수록 더 많이 필요 (1.15배씩 증가)
            this.player.expToNext = Math.floor(10 * Math.pow(1.15, this.player.level - 1));
            
            // 경험치 요구량이 0이 되는 것을 방지
            if (this.player.expToNext <= 0) {
                this.player.expToNext = 1;
            }
            
            // 레벨업 화면 표시
            this.showLevelUpScreen();
        }
    }

    showLevelUpScreen() {
        // 게임 일시정지
        this.state = 'levelup';
        
        // 플레이어 키 입력 상태 초기화 (자동 이동 방지)
        this.player.keys.up = false;
        this.player.keys.down = false;
        this.player.keys.left = false;
        this.player.keys.right = false;
        
        // 특수 파워업 활성화 여부 확인
        const hasFireAura = this.player.stats.fireAuraActive;
        const hasShuriken = this.player.stats.shurikenActive;
        const hasPoison = this.player.stats.poisonActive;
        const hasShadowClone = this.player.stats.shadowCloneActive;
        const hasThunder = this.player.stats.thunderActive;
        const hasWave = this.player.stats.waveActive;
        const hasGreed = this.player.stats.greedActive;
        const hasExplosiveTag = this.player.stats.explosiveTagActive;
        const hasHokage = this.player.stats.hokageActive;
        
        // 일반 파워업과 체력 회복 파워업 분리
        const allNormalPowerups = this.powerupSystem.getNormalPowerupPool();
        const allHealPowerups = this.powerupSystem.getHealPowerupPool();
        
        // 특수 파워업 풀 (10레벨 이상, 이미 선택된 특수 파워업은 제외)
        const allSpecialPowerups = this.player.level >= 10
            ? this.powerupSystem.getSpecialPowerupPool() 
            : [];
        const availableSpecialPowerups = allSpecialPowerups.filter(powerup => {
            // 이미 선택된 특수 파워업은 제외
            if (powerup.id === 'fire_aura' && hasFireAura) return false;
            if (powerup.id === 'shuriken_guard' && hasShuriken) return false;
            if (powerup.id === 'poison' && hasPoison) return false;
            if (powerup.id === 'shadow_clone' && hasShadowClone) return false;
            if (powerup.id === 'thunder_judgment' && hasThunder) return false;
            if (powerup.id === 'wave_roar' && hasWave) return false;
            if (powerup.id === 'greed_aura' && hasGreed) return false;
            if (powerup.id === 'explosive_tag' && hasExplosiveTag) return false;
            if (powerup.id === 'hokage_blessing' && hasHokage) return false;
            return true;
        });
        
        // 증강 파워업 풀 (해당 특수 파워업이 활성화된 경우에만 가져옴)
        const allFireAuraAugments = hasFireAura 
            ? this.powerupSystem.getFireAuraAugmentPool() 
            : [];
        const allShurikenAugments = hasShuriken 
            ? this.powerupSystem.getShurikenAugmentPool() 
            : [];
        const allPoisonAugments = hasPoison 
            ? this.powerupSystem.getPoisonAugmentPool() 
            : [];
        const allShadowCloneAugments = hasShadowClone
            ? this.powerupSystem.getShadowCloneAugmentPool()
            : [];
        const allThunderAugments = hasThunder
            ? this.powerupSystem.getThunderAugmentPool()
            : [];
        const allWaveAugments = hasWave
            ? this.powerupSystem.getWaveAugmentPool()
            : [];
        const allGreedAugments = hasGreed
            ? this.powerupSystem.getGreedAugmentPool()
            : [];
        const allExplosiveTagAugments = hasExplosiveTag
            ? this.powerupSystem.getExplosiveTagAugmentPool()
            : [];
        const allHokageAugments = hasHokage
            ? this.powerupSystem.getHokageAugmentPool()
            : [];
        
        // 최대 레벨에 도달하지 않은 파워업만 필터링
        const availableNormalPowerups = allNormalPowerups.filter(powerup => {
            return !this.powerupSystem.isMaxLevel(powerup.id);
        });
        
        const availableHealPowerups = allHealPowerups.filter(powerup => {
            // 체력 회복은 소모성 파워업이므로 항상 사용 가능 (확률로만 제어)
            return true;
        });
        
        const availableFireAuraAugments = allFireAuraAugments.filter(powerup => {
            return !this.powerupSystem.isMaxLevel(powerup.id);
        });
        
        const availableShurikenAugments = allShurikenAugments.filter(powerup => {
            return !this.powerupSystem.isMaxLevel(powerup.id);
        });
        
        const availablePoisonAugments = allPoisonAugments.filter(powerup => {
            return !this.powerupSystem.isMaxLevel(powerup.id);
        });
        
        const availableShadowCloneAugments = allShadowCloneAugments.filter(powerup => {
            return !this.powerupSystem.isMaxLevel(powerup.id);
        });
        
        const availableThunderAugments = allThunderAugments.filter(powerup => {
            return !this.powerupSystem.isMaxLevel(powerup.id);
        });
        
        const availableWaveAugments = allWaveAugments.filter(powerup => {
            return !this.powerupSystem.isMaxLevel(powerup.id);
        });
        
        const availableGreedAugments = allGreedAugments.filter(powerup => {
            return !this.powerupSystem.isMaxLevel(powerup.id);
        });
        
        const availableExplosiveTagAugments = allExplosiveTagAugments.filter(powerup => {
            return !this.powerupSystem.isMaxLevel(powerup.id);
        });
        
        const availableHokageAugments = allHokageAugments.filter(powerup => {
            return !this.powerupSystem.isMaxLevel(powerup.id);
        });
        
        this.levelUpOptions = [];
        const selectedIds = new Set();
        
        // 모든 증강 파워업 풀을 하나로 합침 (모든 특수 파워업 증강이 함께 선택될 수 있도록)
        const allAugmentPowerups = [
            ...availableFireAuraAugments,
            ...availableShurikenAugments,
            ...availablePoisonAugments,
            ...availableShadowCloneAugments,
            ...availableThunderAugments,
            ...availableWaveAugments,
            ...availableGreedAugments,
            ...availableExplosiveTagAugments,
            ...availableHokageAugments
        ];
        
        // 3개의 파워업 선택
        const maxOptions = 3;
        const healHalfChance = 0.10; // 체력 절반 회복 확률 10% (각 카드당 독립 시행)
        const healFullChance = 0.05; // 체력 전부 회복 확률 5% (각 카드당 독립 시행)
        const augmentChance = 0.25; // 증강 파워업 확률 25%
        const specialPowerupChance = 0.25; // 특수 파워업 확률 25% (10레벨 이상)
        
        while (this.levelUpOptions.length < maxOptions) {
            let poolToUse;
            let useSpecial = false;
            
            // 특수 파워업 우선 체크 (10레벨 이상, 선택되지 않은 특수 파워업만)
            if (availableSpecialPowerups.length > 0 && Math.random() < specialPowerupChance) {
                poolToUse = availableSpecialPowerups;
                useSpecial = true;
            }
            // 증강 파워업 체크 (모든 활성화된 특수 파워업의 증강이 함께 선택될 수 있음)
            else if (allAugmentPowerups.length > 0 && Math.random() < augmentChance) {
                poolToUse = allAugmentPowerups;
            }
            // 체력 회복 파워업 확률 체크 (각 카드당 독립 시행)
            else if (availableHealPowerups.length > 0) {
                const rand = Math.random();
                // 체력 전부 회복이 더 희귀하므로 먼저 체크
                if (rand < healFullChance) {
                    poolToUse = availableHealPowerups.filter(p => p.id === 'heal_full');
                } else if (rand < healFullChance + healHalfChance) {
                    poolToUse = availableHealPowerups.filter(p => p.id === 'heal_half');
                } else {
                    poolToUse = availableNormalPowerups;
                }
                // 필터링 결과가 비어있으면 일반 파워업으로
                if (poolToUse.length === 0) {
                    poolToUse = availableNormalPowerups;
                }
            } else {
                poolToUse = availableNormalPowerups;
            }
            
            // 선택되지 않은 파워업만 필터링
            const unselectedPowerups = poolToUse.filter(p => !selectedIds.has(p.id));
            
            // 사용 가능한 파워업이 없으면 다른 풀에서 선택
            if (unselectedPowerups.length === 0) {
                // 우선순위: 특수 파워업 > 모든 증강 파워업 > 일반 파워업 > 체력 회복
                if (availableSpecialPowerups.length > 0 && !useSpecial) {
                    const unselected = availableSpecialPowerups.filter(p => !selectedIds.has(p.id));
                    if (unselected.length > 0) {
                        poolToUse = availableSpecialPowerups;
                    } else {
                        poolToUse = allAugmentPowerups.filter(p => !selectedIds.has(p.id));
                    }
                } else if (allAugmentPowerups.length > 0) {
                    const unselected = allAugmentPowerups.filter(p => !selectedIds.has(p.id));
                    if (unselected.length > 0) {
                        poolToUse = allAugmentPowerups;
                    } else {
                        poolToUse = availableNormalPowerups.filter(p => !selectedIds.has(p.id));
                    }
                } else {
                    const otherPool = poolToUse === availableNormalPowerups ? availableHealPowerups : availableNormalPowerups;
                    const otherUnselected = otherPool.filter(p => !selectedIds.has(p.id));
                    if (otherUnselected.length > 0) {
                        poolToUse = otherPool;
                    } else {
                        // 모든 파워업을 선택했으면 종료
                        break;
                    }
                }
            } else {
                poolToUse = unselectedPowerups;
            }
            
            if (poolToUse.length === 0) break; // 사용 가능한 파워업이 없으면 종료
            
            // 랜덤 선택
            const randomIndex = Math.floor(Math.random() * poolToUse.length);
            const selectedPowerup = poolToUse[randomIndex];
            
            // 선택된 파워업 추가
            selectedIds.add(selectedPowerup.id);
            this.levelUpOptions.push(selectedPowerup);
        }
        
        // UI 업데이트
        this.renderLevelUpOptions();
        
        // 레벨업 화면 표시
        document.getElementById('levelup-screen').style.display = 'flex';
    }

    renderLevelUpOptions() {
        const container = document.getElementById('powerup-options');
        container.innerHTML = '';
        
        this.levelUpOptions.forEach((option, index) => {
            const card = document.createElement('div');
            card.className = 'powerup-card';
            card.dataset.index = index;
            
            // 현재 파워업 레벨 가져오기
            const currentLevel = this.player.powerupLevels[option.id] || 0;
            const levelText = currentLevel > 0 ? `<div class="powerup-level">Level ${currentLevel}</div>` : '';
            
            // description이 함수인 경우 호출
            const descriptionText = typeof option.description === 'function' 
                ? option.description() 
                : option.description;
            
            card.innerHTML = `
                <div class="powerup-icon">${option.icon}</div>
                <div class="powerup-name">${option.name}</div>
                <div class="powerup-description">${descriptionText}</div>
                ${levelText}
                <div class="powerup-key">${index + 1}번 키</div>
            `;
            
            card.addEventListener('click', () => this.selectPowerup(index));
            container.appendChild(card);
        });
    }

    selectPowerup(index) {
        if (index < 0 || index >= this.levelUpOptions.length) return;
        
        const selectedPowerup = this.levelUpOptions[index];
        
        // 파워업 적용
        selectedPowerup.apply();
        
        // 파워업 레벨 증가
        if (!this.player.powerupLevels[selectedPowerup.id]) {
            this.player.powerupLevels[selectedPowerup.id] = 0;
        }
        this.player.powerupLevels[selectedPowerup.id]++;
        
        // 플레이어 키 입력 상태 초기화 (자동 이동 방지)
        this.player.keys.up = false;
        this.player.keys.down = false;
        this.player.keys.left = false;
        this.player.keys.right = false;
        
        // HUD 업데이트
        this.updateHUD();
        
        // 레벨업 화면 숨김
        document.getElementById('levelup-screen').style.display = 'none';
        
        // 게임 재개
        this.state = 'playing';
    }

    gameOver() {
        this.state = 'gameover';
        
        // 최종 통계 표시
        const finalTime = this.formatTime(this.gameTime);
        document.getElementById('final-time').textContent = finalTime;
        document.getElementById('final-level').textContent = this.player.level;
        document.getElementById('final-kills').textContent = this.kills;
        
        // 게임 오버 화면 표시
        document.getElementById('gameover-screen').style.display = 'flex';
    }

    formatTime(milliseconds) {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    render() {
        // 화면 클리어
        this.ctx.fillStyle = '#0f0f1e';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        if (this.state === 'playing') {
            // 카메라 변환 적용
            this.ctx.save();
            this.ctx.translate(-this.camera.x, -this.camera.y);
            
            // 배경 이미지 그리기
            if (this.backgroundLoaded) {
                // 배경 이미지를 타일링하여 전체 월드를 채움
                const bgWidth = this.backgroundImage.width || 100;
                const bgHeight = this.backgroundImage.height || 100;
                
                // 카메라 위치에 맞춰 배경 타일링
                const startX = Math.floor(this.camera.x / bgWidth) * bgWidth;
                const startY = Math.floor(this.camera.y / bgHeight) * bgHeight;
                const endX = this.camera.x + CONFIG.CANVAS_WIDTH + bgWidth;
                const endY = this.camera.y + CONFIG.CANVAS_HEIGHT + bgHeight;
                
                for (let x = startX; x < endX; x += bgWidth) {
                    for (let y = startY; y < endY; y += bgHeight) {
                        this.ctx.drawImage(this.backgroundImage, x, y, bgWidth, bgHeight);
                    }
                }
            } else {
                // 배경 이미지가 로드되지 않았으면 기본 배경색 사용
                this.ctx.fillStyle = '#0f0f1e';
                this.ctx.fillRect(this.camera.x, this.camera.y, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
            }
            
            // 경험치 오브 렌더링
            for (const orb of this.experienceOrbs) {
                orb.draw(this.ctx);
            }
            
            // 투사체 렌더링
            for (const projectile of this.projectiles) {
                projectile.draw(this.ctx);
            }
            
            // 수리검 호위 렌더링
            for (const shuriken of this.shurikens) {
                shuriken.draw(this.ctx);
            }
            
            // 분신술 렌더링
            if (this.shadowClones) {
                for (const clone of this.shadowClones) {
                    if (!clone.exploded) {
                        this.ctx.save();
                        this.ctx.globalAlpha = clone.alpha;
                        this.ctx.fillStyle = '#888888';
                        this.ctx.beginPath();
                        this.ctx.arc(clone.x, clone.y, clone.radius, 0, Math.PI * 2);
                        this.ctx.fill();
                        this.ctx.restore();
                    }
                }
            }
            
            // 천둥의 심판 렌더링
            if (this.thunderEffects) {
                for (const effect of this.thunderEffects) {
                    const progress = 1 - (effect.duration / effect.maxDuration);
                    effect.radius = effect.maxRadius * progress;
                    effect.alpha = 1.0 - progress;

                    this.ctx.save();
                    this.ctx.globalAlpha = effect.alpha;
                    const gradient = this.ctx.createRadialGradient(
                        effect.x, effect.y, 0,
                        effect.x, effect.y, effect.radius
                    );
                    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
                    gradient.addColorStop(0.5, 'rgba(200, 200, 255, 0.8)');
                    gradient.addColorStop(1, 'rgba(100, 100, 255, 0)');
                    this.ctx.fillStyle = gradient;
                    this.ctx.beginPath();
                    this.ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2);
                    this.ctx.fill();
                    this.ctx.restore();
                }
            }
            
            // 바다의 포효 렌더링
            if (this.waves) {
                for (const wave of this.waves) {
                    this.ctx.save();
                    const gradient = this.ctx.createLinearGradient(
                        wave.x - wave.width / 2, wave.y,
                        wave.x + wave.width / 2, wave.y
                    );
                    gradient.addColorStop(0, 'rgba(100, 150, 255, 0.3)');
                    gradient.addColorStop(0.5, 'rgba(50, 100, 255, 0.6)');
                    gradient.addColorStop(1, 'rgba(100, 150, 255, 0.3)');
                    this.ctx.fillStyle = gradient;
                    this.ctx.beginPath();
                    this.ctx.ellipse(wave.x, wave.y, wave.width / 2, 20, 0, 0, Math.PI * 2);
                    this.ctx.fill();
                    this.ctx.restore();
                }
            }
            
            // 기폭찰 렌더링
            if (this.explosiveTags) {
                for (const tag of this.explosiveTags) {
                    this.ctx.save();
                    this.ctx.fillStyle = '#ff6600';
                    this.ctx.beginPath();
                    this.ctx.arc(tag.x, tag.y, 8, 0, Math.PI * 2);
                    this.ctx.fill();
                    this.ctx.strokeStyle = '#ff0000';
                    this.ctx.lineWidth = 2;
                    this.ctx.stroke();
                    this.ctx.restore();
                }
            }
            
            // 기폭찰 폭발 효과 렌더링
            if (this.explosiveExplosions) {
                for (const explosion of this.explosiveExplosions) {
                    const gradient = this.ctx.createRadialGradient(
                        explosion.x, explosion.y, 0,
                        explosion.x, explosion.y, explosion.radius
                    );
                    gradient.addColorStop(0, `rgba(255, 200, 0, ${explosion.alpha})`);
                    gradient.addColorStop(0.5, `rgba(255, 100, 0, ${explosion.alpha * 0.6})`);
                    gradient.addColorStop(1, `rgba(255, 0, 0, 0)`);
                    
                    this.ctx.fillStyle = gradient;
                    this.ctx.beginPath();
                    this.ctx.arc(explosion.x, explosion.y, explosion.radius, 0, Math.PI * 2);
                    this.ctx.fill();
                }
            }
            
            // 호카게의 가호 렌더링
            if (this.player.stats.hokageActive) {
                const radius = this.player.stats.hokageRadius || 80;
                this.ctx.save();
                this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
                this.ctx.lineWidth = 2;
                this.ctx.setLineDash([5, 5]);
                this.ctx.beginPath();
                this.ctx.arc(this.player.x, this.player.y, radius, 0, Math.PI * 2);
                this.ctx.stroke();
                this.ctx.restore();
            }
            
            // 불 오라 폭발 효과 렌더링
            for (const effect of this.fireAuraPulseEffects) {
                const gradient = this.ctx.createRadialGradient(
                    effect.x, effect.y, 0,
                    effect.x, effect.y, effect.radius
                );
                gradient.addColorStop(0, `rgba(255, 200, 0, ${effect.alpha})`);
                gradient.addColorStop(0.5, `rgba(255, 100, 0, ${effect.alpha * 0.6})`);
                gradient.addColorStop(1, `rgba(255, 0, 0, 0)`);
                
                this.ctx.fillStyle = gradient;
                this.ctx.beginPath();
                this.ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2);
                this.ctx.fill();
                
                // 폭발 테두리
                this.ctx.strokeStyle = `rgba(255, 255, 0, ${effect.alpha})`;
                this.ctx.lineWidth = 3;
                this.ctx.stroke();
            }
            
            // 적 렌더링
            for (const enemy of this.enemies) {
                enemy.draw(this.ctx);
            }
            
            // 플레이어 렌더링 (무적 시 깜빡임 효과)
            if (!this.player.invincible || Math.floor(Date.now() / 100) % 2 === 0) {
                this.player.draw(this.ctx);
            }
            
            // 카메라 변환 복원
            this.ctx.restore();
        }

        // HUD 업데이트
        this.updateHUD();
    }
    
    drawGrid() {
        // 그리드 그리기 (선택사항)
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        this.ctx.lineWidth = 1;
        
        const gridSize = 100;
        const startX = Math.floor(this.camera.x / gridSize) * gridSize;
        const startY = Math.floor(this.camera.y / gridSize) * gridSize;
        const endX = this.camera.x + CONFIG.CANVAS_WIDTH;
        const endY = this.camera.y + CONFIG.CANVAS_HEIGHT;
        
        // 수직선
        for (let x = startX; x <= endX; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, startY);
            this.ctx.lineTo(x, endY);
            this.ctx.stroke();
        }
        
        // 수평선
        for (let y = startY; y <= endY; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(startX, y);
            this.ctx.lineTo(endX, y);
            this.ctx.stroke();
        }
    }

    updateHUD() {
        // 레벨 표시
        document.getElementById('level').textContent = this.player.level;
        
        // 체력바 업데이트
        const healthPercent = (this.player.health / this.player.maxHealth) * 100;
        document.getElementById('health-bar').style.width = healthPercent + '%';
        
        // 경험치바 업데이트
        const expPercent = (this.player.exp / this.player.expToNext) * 100;
        document.getElementById('exp-bar').style.width = expPercent + '%';
        
        // 생존 시간 표시
        if (this.state === 'playing') {
            const survivalTime = this.formatTime(this.gameTime);
            document.getElementById('survival-time').textContent = survivalTime;
        }
        
        // 처치 수 표시
        document.getElementById('kills').textContent = this.kills;
    }

    gameLoop(currentTime) {
        // Delta time 계산
        this.deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        // 게임 업데이트 및 렌더링
        this.update(this.deltaTime);
        this.render();

        // 다음 프레임 요청
        requestAnimationFrame((time) => this.gameLoop(time));
    }
}

// 게임 시작
window.addEventListener('DOMContentLoaded', () => {
    new Game();
});

