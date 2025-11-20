// Enemy 클래스
class Enemy {
    constructor(x, y, type = 'normal', customHealth = null) {
        this.x = x;
        this.y = y;
        this.type = type; // 'normal', 'fast', 'strong'
        
        // 타입별 스탯 설정
        switch(type) {
            case 'fast':
                this.radius = CONFIG.ENEMY_BASE_RADIUS * 0.8; // 작은 크기
                this.speed = CONFIG.ENEMY_BASE_SPEED * 1.5; // 빠른 속도
                this.maxHealth = customHealth || Math.floor(CONFIG.ENEMY_BASE_HEALTH * 0.5); // 낮은 체력
                this.color = '#ffaa00'; // 주황색
                this.expValue = CONFIG.EXP_BASE_VALUE; // 경험치 비율은 normal과 동일
                this.orbDropCount = 3; // 오브 3개 드랍
                break;
            case 'strong':
                this.radius = CONFIG.ENEMY_BASE_RADIUS * 1.2; // 큰 크기
                this.speed = CONFIG.ENEMY_BASE_SPEED * 0.7; // 느린 속도
                this.maxHealth = customHealth || Math.floor(CONFIG.ENEMY_BASE_HEALTH * 4); // 높은 체력
                this.color = '#8b0000'; // 진한 빨간색
                this.expValue = CONFIG.EXP_BASE_VALUE; // 경험치 비율은 normal과 동일
                this.orbDropCount = 10; // 오브 10개 드랍
                break;
            case 'normal':
            default:
                this.radius = CONFIG.ENEMY_BASE_RADIUS;
                this.speed = CONFIG.ENEMY_BASE_SPEED;
                this.maxHealth = customHealth || CONFIG.ENEMY_BASE_HEALTH;
                this.color = '#ff4444'; // 빨간색
                this.expValue = CONFIG.EXP_BASE_VALUE;
                this.orbDropCount = 1; // 오브 1개 드랍
                break;
        }
        
        this.health = this.maxHealth;
        
        // 스프라이트 애니메이션 (타입별로 다른 이미지)
        this.spriteImage = new Image();
        this.spriteLoaded = false;
        
        if (type === 'fast') {
            this.spriteImage.src = 'img/fast_sprite.png';
        } else if (type === 'strong') {
            this.spriteImage.src = 'img/Strong_sprite.png';
        } else {
            // normal 타입
            this.spriteImage.src = 'img/normal_sprite.png';
        }
        
        this.spriteImage.onload = () => {
            this.spriteLoaded = true;
            console.log(`${type} enemy sprite loaded`);
        };
        this.spriteImage.onerror = () => {
            console.error(`Failed to load ${type} enemy sprite:`, this.spriteImage.src);
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
        
        // 화상 상태
        this.burned = false;           // 화상 상태 여부
        this.burnTimer = 0;            // 화상 지속 시간 (밀리초)
        this.burnDamage = 0;           // 화상 데미지 (1초당)
        this.burnSpeedDebuff = 0.1;    // 이동속도 감소 (10%)
        this.burnDamageAccumulator = 0; // 화상 데미지 누적기 (밀리초)
        this.burnDamageInterval = 1000; // 화상 데미지 간격 (1초)
        
        // 중독 상태
        this.poisoned = false;         // 중독 상태 여부
        this.poisonStacks = 0;         // 중독 중첩 수
        this.poisonTimer = 0;          // 중독 지속 시간 (밀리초)
        this.poisonDamage = 0;        // 중독 데미지 (1초당, 중첩당)
        this.poisonDamageAccumulator = 0; // 중독 데미지 누적기 (밀리초)
        this.poisonDamageInterval = 1000; // 중독 데미지 간격 (1초)
        this.poisonBaseDuration = 3000; // 기본 중독 지속 시간 (3초)
        
        // 이동속도 감소 상태
        this.slowTimer = 0;            // 이동속도 감소 지속 시간 (밀리초)
        this.slowAmount = 0;           // 이동속도 감소량 (0.0 ~ 1.0)
        
        // 얼어붙음 상태
        this.frozen = false;           // 얼어붙음 상태 여부
        this.frozenTimer = 0;          // 얼어붙음 지속 시간 (밀리초)
    }

    update(playerX, playerY, deltaTime = 0) {
        // 화상 상태 업데이트
        if (this.burned) {
            this.burnTimer -= deltaTime;
            this.burnDamageAccumulator += deltaTime;
            
            // 화상 데미지 적용 (1초마다)
            if (this.burnDamageAccumulator >= this.burnDamageInterval) {
                this.health -= this.burnDamage;
                this.burnDamageAccumulator = 0;
            }
            
            // 화상 지속 시간 종료
            if (this.burnTimer <= 0) {
                this.burned = false;
                this.burnTimer = 0;
                this.burnDamage = 0;
                this.burnDamageAccumulator = 0;
            }
        }
        
        // 중독 상태 업데이트
        if (this.poisoned && this.poisonStacks > 0) {
            this.poisonTimer -= deltaTime;
            this.poisonDamageAccumulator += deltaTime;
            
            // 중독 데미지 적용 (1초마다, 중첩 수만큼)
            if (this.poisonDamageAccumulator >= this.poisonDamageInterval) {
                const totalPoisonDamage = this.poisonDamage * this.poisonStacks;
                this.health -= totalPoisonDamage;
                this.poisonDamageAccumulator = 0;
            }
            
            // 중독 지속 시간 종료
            if (this.poisonTimer <= 0) {
                this.poisoned = false;
                this.poisonStacks = 0;
                this.poisonTimer = 0;
                this.poisonDamage = 0;
                this.poisonDamageAccumulator = 0;
            }
        }
        
        // 이동속도 감소 상태 업데이트
        if (this.slowTimer > 0) {
            this.slowTimer -= deltaTime;
            if (this.slowTimer <= 0) {
                this.slowTimer = 0;
                this.slowAmount = 0;
            }
        }
        
        // 얼어붙음 상태 업데이트
        if (this.frozen) {
            this.frozenTimer -= deltaTime;
            if (this.frozenTimer <= 0) {
                this.frozen = false;
                this.frozenTimer = 0;
            }
        }
        
        // 플레이어를 향한 방향 벡터 계산
        const dx = playerX - this.x;
        const dy = playerY - this.y;
        
        // 거리 계산
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // 정규화 (거리로 나누어 단위 벡터로 만듦)
        if (distance > 0) {
            const normalizedX = dx / distance;
            const normalizedY = dy / distance;
            
            // 방향 결정 (플레이어를 향하는 방향)
            if (Math.abs(dy) > Math.abs(dx)) {
                // 위/아래 방향이 더 큼
                this.direction = dy < 0 ? 1 : 0; // 위: 1, 아래: 0
            } else {
                // 왼쪽/오른쪽 방향이 더 큼
                this.direction = dx < 0 ? 2 : 3; // 왼쪽: 2, 오른쪽: 3
            }
            
            // 속도 적용 (화상, 이동속도 감소, 얼어붙음 적용)
            let speedMultiplier = 1.0;
            if (this.burned) speedMultiplier *= (1 - this.burnSpeedDebuff);
            if (this.slowTimer > 0 && this.slowAmount > 0) speedMultiplier *= (1 - this.slowAmount);
            if (this.frozen) speedMultiplier = 0; // 얼어붙으면 이동 불가
            
            const currentSpeed = this.speed * speedMultiplier;
            this.x += normalizedX * currentSpeed;
            this.y += normalizedY * currentSpeed;
            
            // 애니메이션 업데이트
            this.animationTimer += deltaTime;
            if (this.animationTimer >= this.animationSpeed) {
                this.currentFrame = (this.currentFrame + 1) % this.framesPerCol;
                this.animationTimer = 0;
            }
        }
    }

    draw(ctx) {
        // 화상 효과 (불꽃 파티클)
        if (this.burned) {
            ctx.fillStyle = 'rgba(255, 100, 0, 0.6)';
            ctx.beginPath();
            ctx.arc(this.x, this.y - this.radius - 5, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(this.x - 3, this.y - this.radius - 3, 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(this.x + 3, this.y - this.radius - 3, 2, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // 중독 효과 (보라색 파티클)
        if (this.poisoned && this.poisonStacks > 0) {
            ctx.fillStyle = 'rgba(128, 0, 128, 0.7)';
            for (let i = 0; i < this.poisonStacks; i++) {
                ctx.beginPath();
                ctx.arc(this.x + (i - (this.poisonStacks - 1) / 2) * 4, this.y - this.radius - 8, 2, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        // 얼어붙음 효과 (파란색 테두리)
        if (this.frozen) {
            ctx.strokeStyle = 'rgba(100, 200, 255, 0.8)';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius + 2, 0, Math.PI * 2);
            ctx.stroke();
        }
        
        // 스프라이트 이미지가 로드되었으면 스프라이트 그리기
        if (this.spriteLoaded && this.spriteImage) {
            const frameX = this.direction; // 열 (0: 아래, 1: 위, 2: 왼쪽, 3: 오른쪽)
            const frameY = this.currentFrame; // 행 (애니메이션 프레임)
            
            const sourceX = frameX * this.frameWidth;
            const sourceY = frameY * this.frameHeight;
            
            // Strong 타입은 1.5배 크게 표시
            const sizeMultiplier = this.type === 'strong' ? 1.5 : 1.0;
            const drawSize = this.radius * 2 * sizeMultiplier;
            
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.drawImage(
                this.spriteImage,
                sourceX, sourceY, this.frameWidth, this.frameHeight,
                -drawSize / 2, -drawSize / 2, drawSize, drawSize
            );
            ctx.restore();
        } else {
            // 이미지가 로드되지 않았으면 기본 원 그리기
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fill();
            
            // 적 테두리
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
        
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

