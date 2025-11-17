// 게임 설정
const CONFIG = {
    CANVAS_WIDTH: 1200,
    CANVAS_HEIGHT: 800,
    WORLD_WIDTH: 5000,  // 게임 월드 크기
    WORLD_HEIGHT: 5000,
    FPS: 60,
    // 적 스폰 설정
    ENEMY_SPAWN_INTERVAL: 1000, // 1초마다 스폰 (기본값)
    ENEMY_SPAWN_COUNT: 2, // 한 번에 스폰되는 적 수
    ENEMY_BASE_SPEED: 2, // 기본 속도
    ENEMY_BASE_HEALTH: 10, // 기본 체력
    ENEMY_BASE_RADIUS: 12, // 기본 반지름
    MAX_ENEMIES: 200, // 최대 적 수 (성능 고려)
    // 난이도 조절 설정
    SPAWN_INTERVAL_DECREASE: 50, // 30초마다 스폰 간격 감소량 (밀리초)
    HEALTH_INCREASE: 2, // 1분마다 적 체력 증가량
    SPAWN_INTERVAL_MIN: 300, // 최소 스폰 간격 (밀리초)
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

