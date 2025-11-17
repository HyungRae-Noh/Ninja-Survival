// 게임 설정
const CONFIG = {
    CANVAS_WIDTH: 1200,
    CANVAS_HEIGHT: 800,
    WORLD_WIDTH: 5000,  // 게임 월드 크기
    WORLD_HEIGHT: 5000,
    FPS: 60,
    // 적 스폰 설정
    ENEMY_SPAWN_INTERVAL: 1000, // 1초마다 스폰
    ENEMY_SPAWN_COUNT: 2, // 한 번에 스폰되는 적 수
    ENEMY_BASE_SPEED: 2, // 기본 속도
    ENEMY_BASE_HEALTH: 10, // 기본 체력
    ENEMY_BASE_RADIUS: 12, // 기본 반지름
    // 충돌 설정
    PLAYER_INVINCIBLE_TIME: 1000, // 무적 시간 (밀리초)
    // 투사체 설정
    PROJECTILE_SPEED: 8, // 투사체 속도
    PROJECTILE_RADIUS: 5, // 투사체 반지름
    PROJECTILE_DAMAGE: 5, // 투사체 데미지
    PROJECTILE_ATTACK_INTERVAL: 1000, // 공격 간격 (밀리초)
    PROJECTILE_RANGE: 2000, // 투사체 사거리
    // 경험치 설정
    EXP_ORB_RADIUS: 8, // 경험치 오브 반지름
    EXP_ORB_SPEED: 4, // 경험치 오브 속도
    EXP_ORB_COLLECT_RANGE: 30, // 경험치 수집 범위
    EXP_BASE_VALUE: 5 // 기본 경험치 값
};

// Player 클래스
class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 15;
        this.speed = 5;
        this.maxHealth = 100;
        this.health = this.maxHealth;
        this.level = 1;
        this.exp = 0;
        this.expToNext = 10;
        
        // 파워업 스탯 (기본값)
        this.stats = {
            // 공격 관련
            attackDamage: 1.0,          // 공격력 배수
            attackSpeed: 1.0,           // 공격 속도 배수
            penetration: 0,              // 관통 수 (정수)
            projectileCount: 1,         // 한번에 나가는 투사체 개수
            critChance: 0.0,            // 치명타 확률 (0.0 ~ 1.0)
            critDamage: 1.5,             // 치명타 데미지 배수 (기본 150%)
            // 이동 관련
            moveSpeed: 1.0,              // 이동 속도 배수
            // 성장 관련
            expGain: 1.0,               // 경험치 획득량 배수
            orbCollectionRange: 1.0,    // 오브 흡수 범위 배수
            // 방어/체력 관련
            maxHealth: 1.0,             // 최대 체력 배수
            damageReduction: 0.0        // 받는 피해 감소 % (0.0 ~ 1.0)
        };
        
        // 파워업 레벨 추적
        this.powerupLevels = {};
        
        // 입력 상태
        this.keys = {
            up: false,
            down: false,
            left: false,
            right: false
        };
    }

    update() {
        // 이동 처리
        let dx = 0;
        let dy = 0;

        if (this.keys.up) dy -= 1;
        if (this.keys.down) dy += 1;
        if (this.keys.left) dx -= 1;
        if (this.keys.right) dx += 1;

        // 대각선 이동 정규화
        if (dx !== 0 && dy !== 0) {
            dx *= 0.707; // 1/√2
            dy *= 0.707;
        }

        // 위치 업데이트 (파워업 적용)
        this.x += dx * this.speed * this.stats.moveSpeed;
        this.y += dy * this.speed * this.stats.moveSpeed;

        // 월드 경계 제한
        this.x = Math.max(this.radius, Math.min(CONFIG.WORLD_WIDTH - this.radius, this.x));
        this.y = Math.max(this.radius, Math.min(CONFIG.WORLD_HEIGHT - this.radius, this.y));
    }

    draw(ctx) {
        // 플레이어 원 그리기
        ctx.fillStyle = '#44ff44';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // 플레이어 테두리
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // 플레이어 중심점
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Enemy 클래스
class Enemy {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = CONFIG.ENEMY_BASE_RADIUS;
        this.speed = CONFIG.ENEMY_BASE_SPEED;
        this.maxHealth = CONFIG.ENEMY_BASE_HEALTH;
        this.health = this.maxHealth;
        this.color = '#ff4444'; // 빨간색
    }

    update(playerX, playerY) {
        // 플레이어를 향한 방향 벡터 계산
        const dx = playerX - this.x;
        const dy = playerY - this.y;
        
        // 거리 계산
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // 정규화 (거리로 나누어 단위 벡터로 만듦)
        if (distance > 0) {
            const normalizedX = dx / distance;
            const normalizedY = dy / distance;
            
            // 속도 적용하여 이동
            this.x += normalizedX * this.speed;
            this.y += normalizedY * this.speed;
        }
    }

    draw(ctx) {
        // 적 원 그리기
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // 적 테두리
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // 체력바 (선택사항)
        const barWidth = this.radius * 2;
        const barHeight = 4;
        const barX = this.x - barWidth / 2;
        const barY = this.y - this.radius - 8;
        
        // 배경
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        
        // 체력
        const healthPercent = this.health / this.maxHealth;
        ctx.fillStyle = healthPercent > 0.5 ? '#44ff44' : healthPercent > 0.25 ? '#ffaa00' : '#ff4444';
        ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);
    }

    // 충돌 감지 (원형)
    checkCollision(otherX, otherY, otherRadius) {
        const dx = this.x - otherX;
        const dy = this.y - otherY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < (this.radius + otherRadius);
    }
}

// Projectile 클래스
class Projectile {
    constructor(x, y, directionX, directionY, playerStats = null) {
        this.x = x;
        this.y = y;
        this.radius = CONFIG.PROJECTILE_RADIUS;
        this.speed = CONFIG.PROJECTILE_SPEED;
        
        // 치명타 계산
        const isCrit = playerStats && Math.random() < playerStats.critChance;
        const baseDamage = CONFIG.PROJECTILE_DAMAGE * (playerStats?.attackDamage || 1.0);
        this.damage = isCrit ? baseDamage * (playerStats?.critDamage || 1.5) : baseDamage;
        this.isCrit = isCrit;
        
        // 관통 수
        this.penetration = playerStats?.penetration || 0;
        this.penetratedEnemies = []; // 이미 관통한 적들
        
        // 방향 벡터 정규화
        const distance = Math.sqrt(directionX * directionX + directionY * directionY);
        if (distance > 0) {
            this.velocityX = (directionX / distance) * this.speed;
            this.velocityY = (directionY / distance) * this.speed;
        } else {
            this.velocityX = 0;
            this.velocityY = 0;
        }
        
        // 사거리 추적
        this.distanceTraveled = 0;
        this.maxDistance = CONFIG.PROJECTILE_RANGE;
    }

    update() {
        // 위치 업데이트
        this.x += this.velocityX;
        this.y += this.velocityY;
        
        // 이동 거리 계산
        const moveDistance = Math.sqrt(this.velocityX * this.velocityX + this.velocityY * this.velocityY);
        this.distanceTraveled += moveDistance;
    }

    draw(ctx) {
        // 투사체 그리기 (치명타는 빨간색)
        ctx.fillStyle = this.isCrit ? '#ff0000' : '#ffff00';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // 투사체 테두리
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // 치명타 표시
        if (this.isCrit) {
            ctx.fillStyle = '#fff';
            ctx.font = '10px Arial';
            ctx.fillText('CRIT!', this.x - 15, this.y - this.radius - 5);
        }
    }

    // 충돌 감지
    checkCollision(otherX, otherY, otherRadius) {
        const dx = this.x - otherX;
        const dy = this.y - otherY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < (this.radius + otherRadius);
    }

    // 사거리 초과 체크
    isOutOfRange() {
        return this.distanceTraveled >= this.maxDistance;
    }
}

// ExperienceOrb 클래스
class ExperienceOrb {
    constructor(x, y, expValue) {
        this.x = x;
        this.y = y;
        this.radius = CONFIG.EXP_ORB_RADIUS;
        this.expValue = expValue;
        this.speed = CONFIG.EXP_ORB_SPEED;
        this.collected = false;
        this.isAttracted = false; // 자석 효과로 끌려가는 중인지
    }

    update(playerX, playerY, effectiveCollectionRange = CONFIG.EXP_ORB_COLLECT_RANGE) {
        if (this.collected) return;
        
        // 플레이어와의 거리 계산
        const dx = playerX - this.x;
        const dy = playerY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // 오브 흡수 범위 내에 있는지 체크
        if (distance < effectiveCollectionRange && !this.isAttracted) {
            // 범위 내에 들어오면 자석 효과 시작
            this.isAttracted = true;
        }
        
        // 자석 효과로 끌려가는 중이면 플레이어를 향해 이동
        if (this.isAttracted && distance > 0) {
            const normalizedX = dx / distance;
            const normalizedY = dy / distance;
            
            // 가까워질수록 빠르게 이동 (거리에 비례하여 가속)
            const speedMultiplier = 1 + (effectiveCollectionRange - distance) / effectiveCollectionRange;
            const attractionSpeed = this.speed * speedMultiplier;
            
            this.x += normalizedX * attractionSpeed;
            this.y += normalizedY * attractionSpeed;
        }
    }

    draw(ctx) {
        if (this.collected) return;

        // 경험치 오브 그리기 (녹색 원)
        ctx.fillStyle = '#44ff44';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // 테두리
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // 중심점
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
        ctx.fill();
    }

    // 충돌 감지 (플레이어와의 거리)
    checkCollection(playerX, playerY, playerRadius) {
        const dx = this.x - playerX;
        const dy = this.y - playerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < (this.radius + playerRadius);
    }
}

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

        // 처치 수
        this.kills = 0;

        // 레벨업 관련
        this.levelUpOptions = []; // 현재 레벨업 옵션

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
        
        // 적 배열 초기화
        this.enemies = [];
        this.lastSpawnTime = 0;
        this.spawnTimer = 0;
        
        // 투사체 배열 초기화
        this.projectiles = [];
        this.attackTimer = 0;
        
        // 경험치 오브 배열 초기화
        this.experienceOrbs = [];
        
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

        // 플레이어 업데이트
        this.player.update();
        
        // 무적 시간 업데이트
        if (this.player.invincible) {
            this.player.invincibleTimer -= deltaTime;
            if (this.player.invincibleTimer <= 0) {
                this.player.invincible = false;
            }
        }
        
        // 적 스폰
        this.spawnTimer += deltaTime;
        if (this.spawnTimer >= CONFIG.ENEMY_SPAWN_INTERVAL) {
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
        
        // 경험치 오브 업데이트
        const effectiveCollectionRange = CONFIG.EXP_ORB_COLLECT_RANGE * this.player.stats.orbCollectionRange;
        
        for (let i = this.experienceOrbs.length - 1; i >= 0; i--) {
            const orb = this.experienceOrbs[i];
            orb.update(this.player.x, this.player.y, effectiveCollectionRange);
            
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
                
                // 레벨업 체크
                this.checkLevelUp();
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
                        // 경험치 오브 생성
                        this.createExperienceOrb(enemy.x, enemy.y);
                        
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
            enemy.update(this.player.x, this.player.y);
            
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
            
            // 적 생성
            const enemy = new Enemy(x, y);
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

    createExperienceOrb(x, y) {
        const expValue = CONFIG.EXP_BASE_VALUE;
        const orb = new ExperienceOrb(x, y, expValue);
        this.experienceOrbs.push(orb);
    }

    checkLevelUp() {
        // 경험치가 충분하면 레벨업
        while (this.player.exp >= this.player.expToNext) {
            this.player.exp -= this.player.expToNext;
            this.player.level++;
            this.player.expToNext = Math.floor(10 * Math.pow(1.2, this.player.level - 1)); // 레벨에 따라 증가
            
            // 레벨업 화면 표시
            this.showLevelUpScreen();
        }
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

    showLevelUpScreen() {
        // 게임 일시정지
        this.state = 'levelup';
        
        // 플레이어 키 입력 상태 초기화 (자동 이동 방지)
        this.player.keys.up = false;
        this.player.keys.down = false;
        this.player.keys.left = false;
        this.player.keys.right = false;
        
        // 3가지 랜덤 파워업 선택 (풀레벨(20레벨) 파워업 제외)
        const allPowerups = this.getPowerupPool();
        // 레벨이 20 미만인 파워업만 필터링
        const availablePowerups = allPowerups.filter(powerup => {
            const currentLevel = this.player.powerupLevels[powerup.id] || 0;
            return currentLevel < 20; // 20레벨 미만만 선택 가능
        });
        
        this.levelUpOptions = [];
        const selected = new Set();
        
        // 사용 가능한 파워업이 3개 미만이면 모두 표시
        const maxOptions = Math.min(3, availablePowerups.length);
        
        while (this.levelUpOptions.length < maxOptions && selected.size < availablePowerups.length) {
            const randomIndex = Math.floor(Math.random() * availablePowerups.length);
            if (!selected.has(randomIndex)) {
                selected.add(randomIndex);
                this.levelUpOptions.push(availablePowerups[randomIndex]);
            }
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
            
            // 배경 그리드 (선택사항, 시각적 참고용)
            this.drawGrid();
            
            // 경험치 오브 렌더링
            for (const orb of this.experienceOrbs) {
                orb.draw(this.ctx);
            }
            
            // 투사체 렌더링
            for (const projectile of this.projectiles) {
                projectile.draw(this.ctx);
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

