// 场景一：游戏主场景

let gameOver = false
let score = 0
let sessionId = null
const main = {
    key: 'main',
    /**
     * 预先载入游戏素材，图片、音效、影片、文字、插件等
     */
    preload: function () {
        this.load.image('sky', 'assets/sky.png');
        this.load.image('ground', 'assets/platform.png');
        this.load.image('star', 'assets/star.png');
        this.load.image('bomb', 'assets/bomb.png');
        this.load.spritesheet('dude',
            'assets/dude.png',
            { frameWidth: 32, frameHeight: 48 }
        )
    },
    /**
     * 游戏素材放入画面中，注册事件，设定动画效果等
     */
    create: function () {

        // 场景添加天空
        this.add.image(400, 300, 'sky')
        // 增加静态物理组，不会受到重力影响，发生碰撞时也不会移动，如墙壁等
        this.platforms = this.physics.add.staticGroup()
        // 创建成员：地面，缩放为2，刷新静态碰撞区
        this.platforms.create(400, 568, 'ground').setScale(2).refreshBody()
        this.platforms.create(600, 400, 'ground')
        this.platforms.create(50, 250, 'ground')
        this.platforms.create(750, 220, 'ground')

        // 加入游戏角色，100 450位置
        this.player = this.physics.add.sprite(100, 450, 'dude')
            // 反弹值0～1
            .setBounce(0.2)
            // 是否和【游戏世界】发生碰撞，注：不是静态物理组，与物理组的碰撞需要设置【碰撞器】
            .setCollideWorldBounds(true)


        // 设置角色动画
        const leftAnim = this.anims.create({
            key: 'left',
            // 此动画的所有帧，当前设置了0～3帧
            // 即： 
            //   {key: 'dude', frame: 0},
            //   {key: 'dude', frame: 1},
            //   {key: 'dude', frame: 2},
            //   {key: 'dude', frame: 3}
            frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
            // 帧率
            frameRate: 10,
            // 重复次数，不断重复
            repeat: -1
        })

        const turnAnim = this.anims.create({
            key: 'turn',
            frames: [{ key: 'dude', frame: 4 }],
            frameRate: 20
        })

        const rightAnim = this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
            frameRate: 10,
            repeat: -1
        })
        // 设置角色和静态物理组的碰撞器，可以检测是否发生碰撞，以及分离两者和交换两者的速度（没懂这什么意思）
        this.physics.add.collider(this.player, this.platforms)

        // 创建键盘控制器，在update里监听
        this.cursors = this.input.keyboard.createCursorKeys()

        // 增加星星物理组
        this.stars = this.physics.add.group({
            key: 'star',
            // 重复11次，共12颗
            repeat: 11,
            // 初始位置，后每x新增70，增加一颗
            setXY: { x: 12, y: 0, stepX: 70 }
        })

        this.stars.children.iterate(function (child) {
            // 设定每个星星反弹值，0为不反弹，1为完全反弹，可以理解为反弹的能量损耗
            child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8))
        })
        // 设置星星和静态物理组的碰撞器
        this.physics.add.collider(this.stars, this.platforms)
        // 检测物理组是否重合
        this.physics.add.overlap(this.player, this.stars, collectStar, null, this)

        // 设置记分板
        this.scoreText = this.add.text(16, 16, `Score: ${score}`, {
            color: '#fff',
            resolution: 2,
            fontFamily: 'Tahoma'
        })

        // 设置炸弹
        this.bombs = this.physics.add.group()
        this.physics.add.collider(this.bombs, this.platforms)
        this.physics.add.collider(this.player, this.bombs, hitBomb, null, this)
        // 监听 WebSocket 消息事件
        socket.onmessage = (event) => {
            // console.log(`WebSocket received message: ${event.data}`);
            const data = JSON.parse(event.data)
            // 发送消息到 WebSocket 服务器
            // sendMsg('PLAYER_JOINED', sessionId)
            if (data.event === 'LOGIN_RESULT') {
                console.log('LOGIN SUCCESS!');
                // 设置sessionId
                sessionId = data.sessionId
            }
            if (data.event === 'PLAYER_JOINED') {
                console.log('PLAYER_JOINED');

                if (!onlinePlayers[data.sessionId]) {
                    onlinePlayers[data.sessionId] = new OnlinePlayer({
                        scene: this,
                        platforms: this.platforms,
                        playerId: data.sessionId,
                        x: data.data.x,
                        y: data.data.y,
                        anims: [leftAnim, rightAnim, turnAnim]
                    });
                }
            }
            if (data.event === 'PLAYER_MOVED') {
                // If player isn't registered in this scene
                if (!onlinePlayers[data.sessionId]?.scene) {
                    onlinePlayers[data.sessionId] = new OnlinePlayer({
                        scene: this,
                        playerId: data.sessionId,
                        x: data.x,
                        y: data.y,
                        // todo
                        anims: [leftAnim, rightAnim, turnAnim]
                    });
                }
                // Start animation and set sprite position
                onlinePlayers[data.sessionId]?.isWalking(data.data.position, data.data.x, data.data.y);
            }
            if (data.event === 'PLAYER_MOVEMENT_ENDED') {
                // If player isn't registered in this scene
                if (!onlinePlayers[data.sessionId]?.scene) {
                    onlinePlayers[data.sessionId] = new OnlinePlayer({
                        scene: this,
                        playerId: data.sessionId,
                        x: data.x,
                        y: data.y,
                        // todo
                        anims: [leftAnim, rightAnim, turnAnim]
                    });
                }
                // Start animation and set sprite position
                onlinePlayers[data.sessionId]?.stopWalking();
            }
        };
        sendMsg('LOGIN', null)
    },
    /**
     * 按照帧率，每秒执行update函数60次
     */
    update: function () {
        // 游戏结束则不执行
        if (gameOver) return

        let position
        if (this.cursors.left.isDown) {
            // 设置速度
            this.player.setVelocityX(-160)
            // 播放之前设置的动画
            this.player.anims.play('left', true)
            position = 'left'
            // 发布位置
            sendMsg(
                'PLAYER_MOVED',
                sessionId,
                {
                    x: this.player.x,
                    y: this.player.y,
                    position
                }
            )
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(160)

            this.player.anims.play('right', true)
            position = 'right'
            // 发布位置
            sendMsg(
                'PLAYER_MOVED',
                sessionId,
                {
                    x: this.player.x,
                    y: this.player.y,
                    position
                }
            )
        } else {
            this.player.setVelocityX(0)

            this.player.anims.play('turn')
        }
        // 键盘按“上”，且角色底部有物理接触
        if (this.cursors.up.isDown && this.player.body.touching.down) {
            this.player.setVelocityY(-330)
        }

        // 松开左右键
        if (Phaser.Input.Keyboard.JustUp(this.cursors.left) === true || Phaser.Input.Keyboard.JustUp(this.cursors.right) === true) {
            sendMsg(
                'PLAYER_MOVEMENT_ENDED',
                sessionId
            )
        }

    }
}

function collectStar(player, star) {
    // 隐藏星星
    // 是否取消碰撞，是否隐藏
    star.disableBody(true, true)
    score += 10
    this.scoreText.setText(`Score: ${score}`)

    // 星星收集完成后，重置星星，创建炸弹：
    // 统计还存活的星星，若数量为0
    if (this.stars.countActive(true) === 0) {
        this.stars.children.iterate(function (child) {
            // 重置星星，参数：是否重置、x坐标、y坐标、是否显示
            child.enableBody(true, child.x, 0, true, true);
        })

        const x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);
        // 创建炸弹
        const bomb = this.bombs.create(x, 16, 'bomb');
        bomb.setBounce(1);
        bomb.setCollideWorldBounds(true);
        bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
    }
}

function hitBomb(player, bomb) {
    // 暂停物理系统
    this.physics.pause()
    // 改变角色颜色
    player.setTint(0xff0000)
    player.anims.play('turn')
    // gameOver = true
    setTimeout(() => {
        // 场景切换
        this.scene.start('end')
    }, 2000)
}

