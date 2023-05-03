// 场景二：游戏结束
const end = {
	key: 'end',
	preload: function () {
		
	},
	create: function () {
		const gameover = this.add.text(config.width / 2, 0, `GAME OVER`, {
			color: '#ff0',
			fontFamily: 'Tahoma',
			fontSize: 40,
			resolution: 2
		}).setOrigin(0.5, 0.5)
		
		this.restart = this.add.text(config.width / 2, 400, 'restart', {
			color: '#fff',
			fontFamily: 'Tahoma',
			fontSize: 40,
			resolution: 2
		}).setOrigin(0.5, 0.5).setInteractive()
			.on('pointerdown',() => {
				// 场景切换
				score = 0
				this.scene.start('main')
			}, this )
			.on('pointerover', () => {
				this.restart.alpha  = 0.5
			}, )
			.on('pointerout', () => {
				this.restart.alpha  = 1
			})
		
		this.add.text(config.width / 2, 200, `SCORE: ${score}`, {
			color: '#fff',
			fontFamily: 'Tahoma',
			fontSize: 40,
			resolution: 2
		}).setOrigin(0.5, 0.5)
		
		// 设置切换到end场景时的动画
		this.tweens.add({
			targets: gameover,
			y: 100,
			ease: 'Bounce.easeOut',
			duration: 1000,
			repeat: 0,
			yoyo: false
		})
	},
	update: function () {
		
	}
}