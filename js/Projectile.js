// Projectile 클래스
class Projectile {
    constructor(x, y, directionX, directionY, playerStats = null) {
        this.x = x;
        this.y = y;
        this.radius = CONFIG.PROJECTILE_RADIUS;
        this.speed = CONFIG.PROJECTILE_SPEED;
        
        // 스프라이트 이미지
        this.spriteImage = new Image();
        this.spriteImage.src = 'img/basic.png';
        this.spriteLoaded = false;
        this.spriteImage.onload = () => {
            this.spriteLoaded = true;
        };
        this.spriteImage.onerror = () => {
            console.error('Failed to load projectile sprite:', this.spriteImage.src);
            this.spriteLoaded = false;
        };
        
        // 회전 애니메이션
        this.rotation = 0;
        this.rotationSpeed = 0.2; // 회전 속도 (라디안/프레임)
        
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
        
        // 회전 업데이트
        this.rotation += this.rotationSpeed;
        
        // 이동 거리 계산
        const moveDistance = Math.sqrt(this.velocityX * this.velocityX + this.velocityY * this.velocityY);
        this.distanceTraveled += moveDistance;
    }

    draw(ctx) {
        // 스프라이트 이미지가 로드되었으면 스프라이트 그리기 (회전)
        if (this.spriteLoaded) {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
            
            // 이미지 크기 (투사체 반지름의 2배)
            const imageSize = this.radius * 2;
            
            ctx.drawImage(
                this.spriteImage,
                -imageSize / 2, -imageSize / 2,
                imageSize, imageSize
            );
            ctx.restore();
        } else {
            // 이미지가 로드되지 않았으면 기본 원 그리기 (치명타는 빨간색)
            ctx.fillStyle = this.isCrit ? '#ff0000' : '#ffff00';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fill();
            
            // 투사체 테두리
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1;
            ctx.stroke();
        }
        
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

