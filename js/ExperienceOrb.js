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
        
        // 스프라이트 이미지 (1행 4열)
        this.spriteImage = new Image();
        this.spriteImage.src = 'img/Exp.png';
        this.spriteLoaded = false;
        this.spriteImage.onload = () => {
            this.spriteLoaded = true;
        };
        this.spriteImage.onerror = () => {
            console.error('Failed to load experience orb sprite:', this.spriteImage.src);
            this.spriteLoaded = false;
        };
        
        // 애니메이션 설정 (1행 4열)
        this.frameWidth = 0; // 이미지 로드 후 계산
        this.frameHeight = 0; // 이미지 로드 후 계산
        this.framesPerRow = 4; // 4열
        this.currentFrame = 0;
        this.animationTimer = 0;
        this.animationSpeed = 100; // 밀리초 (빠른 회전)
    }

    update(playerX, playerY, effectiveCollectionRange = CONFIG.EXP_ORB_COLLECT_RANGE, deltaTime = 0) {
        if (this.collected) return;
        
        // 이미지 로드 후 프레임 크기 계산
        if (this.spriteLoaded && this.frameWidth === 0 && this.spriteImage.width > 0) {
            this.frameWidth = this.spriteImage.width / this.framesPerRow;
            this.frameHeight = this.spriteImage.height;
        }
        
        // 애니메이션 업데이트 (360도 회전)
        this.animationTimer += deltaTime;
        if (this.animationTimer >= this.animationSpeed) {
            this.currentFrame = (this.currentFrame + 1) % this.framesPerRow;
            this.animationTimer = 0;
        }
        
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

        // 스프라이트 이미지가 로드되었으면 스프라이트 그리기
        if (this.spriteLoaded && this.frameWidth > 0) {
            const frameX = this.currentFrame * this.frameWidth;
            const frameY = 0; // 1행이므로 y는 0
            
            const imageSize = this.radius * 2;
            
            ctx.drawImage(
                this.spriteImage,
                frameX, frameY, this.frameWidth, this.frameHeight,
                this.x - imageSize / 2, this.y - imageSize / 2,
                imageSize, imageSize
            );
        } else {
            // 이미지가 로드되지 않았으면 기본 원 그리기
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
    }

    // 충돌 감지 (플레이어와의 거리)
    checkCollection(playerX, playerY, playerRadius) {
        const dx = this.x - playerX;
        const dy = this.y - playerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < (this.radius + playerRadius);
    }
}

