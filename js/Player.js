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
        
        // 스프라이트 애니메이션
        this.spriteImage = new Image();
        this.spriteImage.src = 'img/Player_sprite.png';
        this.spriteLoaded = false;
        this.spriteImage.onload = () => {
            this.spriteLoaded = true;
            console.log('Player sprite loaded');
        };
        this.spriteImage.onerror = () => {
            console.error('Failed to load player sprite:', this.spriteImage.src);
            this.spriteLoaded = false;
        };
        
        // 애니메이션 설정
        this.frameWidth = 16;
        this.frameHeight = 16;
        this.framesPerRow = 4;
        this.framesPerCol = 4;
        this.currentFrame = 0;
        this.animationTimer = 0;
        this.animationSpeed = 200; // 밀리초
        this.direction = 0; // 0: 아래, 1: 위, 2: 왼쪽, 3: 오른쪽
        this.lastDirection = 0; // 마지막 이동 방향
        
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
            damageReduction: 0.0,        // 받는 피해 감소 % (0.0 ~ 1.0)
            // 불 오라 관련
            fireAuraActive: false,      // 불 오라 활성화 여부
            fireAuraDamage: 3,          // 불 오라 기본 데미지
            fireAuraRadius: 50,          // 불 오라 기본 반경
            fireAuraRadiusMultiplier: 1.0, // 불 오라 반경 배수
            fireAuraDotEnabled: false,   // 화상 도트 활성화 여부
            fireAuraDotDamage: 0,       // 화상 도트 데미지 (오라 데미지의 40%)
            fireAuraPulseEnabled: false, // 지옥불 맥동 활성화 여부
            fireAuraPulseTimer: 0,      // 지옥불 맥동 타이머
            fireAuraPulseInterval: 5000,  // 지옥불 맥동 간격 (5초)
            fireAuraLastDamageTime: 0,    // 마지막 불 오라 데미지 적용 시간
            // 수리검 호위 관련
            shurikenActive: false,         // 수리검 호위 활성화 여부
            shurikenCount: 1,             // 수리검 개수
            shurikenRotationSpeed: 1.0,   // 수리검 회전 속도 배수
            shurikenPenetration: false,    // 수리검 관통 여부
            // 중독 관련
            poisonActive: false,           // 중독 활성화 여부
            poisonMaxStacks: 1,           // 최대 중독 중첩 수
            poisonDamage: 2,              // 중독 기본 데미지 (1초당, 중첩당)
            poisonDuration: 3000,         // 중독 기본 지속 시간 (3초)
            poisonSpread: false            // 중독 확산 활성화 여부
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

    update(deltaTime = 0) {
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

        // 방향 결정 (우선순위: 위/아래 > 왼쪽/오른쪽)
        if (dy < 0) {
            this.direction = 1; // 위
        } else if (dy > 0) {
            this.direction = 0; // 아래
        } else if (dx < 0) {
            this.direction = 2; // 왼쪽
        } else if (dx > 0) {
            this.direction = 3; // 오른쪽
        }
        
        // 이동 중이면 마지막 방향 저장
        if (dx !== 0 || dy !== 0) {
            this.lastDirection = this.direction;
        }

        // 위치 업데이트 (파워업 적용)
        this.x += dx * this.speed * this.stats.moveSpeed;
        this.y += dy * this.speed * this.stats.moveSpeed;

        // 월드 경계 제한
        this.x = Math.max(this.radius, Math.min(CONFIG.WORLD_WIDTH - this.radius, this.x));
        this.y = Math.max(this.radius, Math.min(CONFIG.WORLD_HEIGHT - this.radius, this.y));
        
        // 애니메이션 업데이트 (이동 중일 때만)
        if (dx !== 0 || dy !== 0) {
            this.animationTimer += deltaTime;
            if (this.animationTimer >= this.animationSpeed) {
                this.currentFrame = (this.currentFrame + 1) % this.framesPerCol;
                this.animationTimer = 0;
            }
        } else {
            // 정지 시 첫 번째 프레임으로
            this.currentFrame = 0;
        }
    }

    draw(ctx) {
        // 불 오라 그리기
        if (this.stats.fireAuraActive) {
            const auraRadius = this.stats.fireAuraRadius * this.stats.fireAuraRadiusMultiplier;
            
            // 불 오라 그라데이션
            const gradient = ctx.createRadialGradient(
                this.x, this.y, 0,
                this.x, this.y, auraRadius
            );
            gradient.addColorStop(0, 'rgba(255, 100, 0, 0.8)');
            gradient.addColorStop(0.5, 'rgba(255, 50, 0, 0.4)');
            gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(this.x, this.y, auraRadius, 0, Math.PI * 2);
            ctx.fill();
            
            // 불 오라 테두리
            ctx.strokeStyle = 'rgba(255, 150, 0, 0.6)';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
        
        // 스프라이트 이미지가 로드되었으면 스프라이트 그리기
        if (this.spriteLoaded) {
            const direction = this.lastDirection; // 마지막 방향 사용
            const frameX = direction; // 열 (0: 아래, 1: 위, 2: 왼쪽, 3: 오른쪽)
            const frameY = this.currentFrame; // 행 (애니메이션 프레임)
            
            const sourceX = frameX * this.frameWidth;
            const sourceY = frameY * this.frameHeight;
            
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.drawImage(
                this.spriteImage,
                sourceX, sourceY, this.frameWidth, this.frameHeight,
                -this.radius, -this.radius, this.radius * 2, this.radius * 2
            );
            ctx.restore();
        } else {
            // 이미지가 로드되지 않았으면 기본 원 그리기
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
}

