// Shuriken 클래스 (회전하는 수리검)
class Shuriken {
    constructor(playerX, playerY, angle, index, totalCount) {
        this.playerX = playerX;
        this.playerY = playerY;
        this.angle = angle; // 초기 각도
        this.index = index; // 수리검 인덱스
        this.totalCount = totalCount; // 전체 수리검 개수
        this.radius = 60; // 플레이어로부터의 거리
        this.rotationSpeed = 0.05; // 회전 속도 (라디안/프레임)
        this.damage = 5; // 기본 데미지
        this.size = 15; // 수리검 크기
        this.penetration = false; // 관통 여부
        this.penetratedEnemies = []; // 이미 관통한 적들
        this.lastHitTime = 0; // 마지막 타격 시간 (같은 적을 연속으로 타격하지 않도록)
        this.hitCooldown = 200; // 타격 쿨다운 (밀리초)
    }

    update(playerX, playerY, rotationSpeedMultiplier = 1.0) {
        // 플레이어 위치 업데이트
        this.playerX = playerX;
        this.playerY = playerY;
        
        // 회전 각도 업데이트
        this.angle += this.rotationSpeed * rotationSpeedMultiplier;
        
        // 수리검 위치 계산 (플레이어 주변 원형 궤도)
        const spacing = (Math.PI * 2) / this.totalCount; // 수리검 간 각도 간격
        const currentAngle = this.angle + (spacing * this.index);
        this.x = this.playerX + Math.cos(currentAngle) * this.radius;
        this.y = this.playerY + Math.sin(currentAngle) * this.radius;
    }

    draw(ctx) {
        // 수리검 그리기 (십자 모양)
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle * 2); // 회전 애니메이션
        
        ctx.fillStyle = '#00aaff';
        ctx.strokeStyle = '#0066ff';
        ctx.lineWidth = 2;
        
        // 십자 모양 수리검
        ctx.beginPath();
        // 가로선
        ctx.moveTo(-this.size, 0);
        ctx.lineTo(this.size, 0);
        // 세로선
        ctx.moveTo(0, -this.size);
        ctx.lineTo(0, this.size);
        // 대각선 1
        ctx.moveTo(-this.size * 0.7, -this.size * 0.7);
        ctx.lineTo(this.size * 0.7, this.size * 0.7);
        // 대각선 2
        ctx.moveTo(this.size * 0.7, -this.size * 0.7);
        ctx.lineTo(-this.size * 0.7, this.size * 0.7);
        ctx.stroke();
        
        // 중심점
        ctx.fillStyle = '#00aaff';
        ctx.beginPath();
        ctx.arc(0, 0, 2, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }

    // 충돌 감지
    checkCollision(otherX, otherY, otherRadius) {
        const dx = this.x - otherX;
        const dy = this.y - otherY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < (this.size + otherRadius);
    }
}

