class OnlinePlayer extends Phaser.GameObjects.Sprite {
    constructor(config) {
        super(config.scene, config.x, config.y, config.playerId);
        // 将精灵加入到场景中
        this.scene.add.existing(this);
        // 启用角色的物理引擎，用于设置速度、重量、弹性系数、摩擦系数等物理属性
        this.scene.physics.world.enableBody(this);
        // 设置和物理系统的碰撞
        // this.scene.physics.add.collider(this, config.platforms);
        // 加载角色的纹理图像，并缩放
        // this.setTexture("dude").setScale(1.9, 2.1);
        this.setTexture("dude")

        // Player Offset
        // this.body.setOffset(0, 24);

        // Display playerId above player
        this.playerNickname = this.scene.add.text((this.x - 40), (this.y - 25), config.playerId)
        // this.body.setCollideWorldBounds(true)
        // 将动画对象与精灵对象绑定
        config.anims.forEach(anim => {
            this.anims.load(anim);
        }) 
    }

    isWalking(position, x, y) {
        this.anims.play(position, true);
        this.setPosition(x, y);

        this.playerNickname.x = this.x - 40;
        this.playerNickname.y = this.y - 25;
    }

    stopWalking() {
        this.anims.play('turn')
    }
}