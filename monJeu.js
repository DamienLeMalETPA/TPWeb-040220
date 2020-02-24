var config = {
	type: Phaser.AUTO,
	width: 800,
	height: 600,
physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: true
        }
    },
scene: {
		init: init,
		preload: preload,
		create: create,
		update: update
	}
};

var game = new Phaser.Game(config);
var score = 0;
var saut = 2;
var dash = 1;
var press = 0;
var pv;
var maxPv;
var munition = 0;
var badir = 0;

function init(){
 	var platforms;
	var player;
	var cursors;
	var stars;
	var scoreText;
	var ptText;
	var bomb;
}

function preload(){
	this.load.image('background','assets/Taiga-Asset-Pack_vnitti/PNG/Background.png');	
	this.load.image('fond','assets/Taiga-Asset-Pack_vnitti/PNG/Middleground.png');
	this.load.spritesheet('diamant','assets/Kings and Pigs/Sprites/12-Live_and_Coins/Big_Diamond_Idle (18x14).png',{frameWidth: 18, frameHeight: 14});
	this.load.image('mun','assets/Kings and Pigs/Sprites/08-Box/Idle.png');
	this.load.image('sol','assets/platform.png');
	this.load.image('bomb','assets/Kings and Pigs/Sprites/09-Bomb/Bomb_Off.png');
	this.load.spritesheet('perso','assets/free-pixel-art-tiny-hero-sprites/1 Pink_Monster/Pink_Monster_Idle_4.png',{frameWidth: 32, frameHeight: 32});
	this.load.spritesheet('mechant','assets/free-pixel-art-tiny-hero-sprites/3 Dude_Monster/Dude_Monster_Walk_6.png',{frameWidth: 32, frameHeight: 32});
	this.load.image('pv_red','assets/health-red.png');
	this.load.image('pv_green','assets/health-green.png');
}

function create(){
	this.add.image(400,300,'background').setScale(3);

	platforms = this.physics.add.staticGroup();
	platforms.create(0,550,'sol').setOrigin(0,0).setScale(2).refreshBody();
	platforms.create(228,550,'sol').setOrigin(0,0).setScale(2).refreshBody();
	platforms.create(456,550,'sol').setOrigin(0,0).setScale(2).refreshBody();
	platforms.create(684,550,'sol').setOrigin(0,0).setScale(2).refreshBody();
	platforms.create(600,400,'sol');
	platforms.create(50,250,'sol');
	
	player = this.physics.add.sprite(100,450,'perso');
	player.setCollideWorldBounds(true);
	player.setBounce(0.2);
	player.body.setGravityY(000);
	this.physics.add.collider(player,platforms);
	player.pv = 100;
	player.maxPv = 100;

	baddy = this.physics.add.sprite(100,450,'mechant');
	baddy.setCollideWorldBounds(true);
	this.physics.add.collider(baddy,platforms);
	this.physics.add.collider(player,baddy,getHit,null,this);

	cursors = this.input.keyboard.createCursorKeys(); 
	
	this.anims.create({
		key:'right',
		frames: this.anims.generateFrameNumbers('mechant', {start: 0, end: 6}),
		frameRate: 10,
		repeat: -1
	});

	this.anims.create({
		key:'left',
		frames: this.anims.generateFrameNumbers('perso', {start: 0, end: 3}),
		frameRate: 10,
		repeat: -1
	});
	
	this.anims.create({
		key:'stop',
		frames: [{key: 'perso', frame:4}],
		frameRate: 20
	});
	
	stars = this.physics.add.group({
		key: 'diamant',
		repeat:11,
		setXY: {x:12,y:0,stepX:70}
	});

	amo = this.physics.add.group();
	this.physics.add.collider(amo,platforms);
	this.physics.add.overlap(player,amo,collectAmo,null,this);
	
	pvGreen = this.physics.add.staticGroup();
	pvGreen.create(680,80,'pv_green');

	pvRed = this.physics.add.staticGroup();

	this.physics.add.collider(stars,platforms);
	this.physics.add.overlap(player,stars,collectStar,null,this);

	scoreText = this.add.text(16,16, 'score: 0', {fontSize: '32px', fill:'#000'});
	munText = this.add.text(16,60, 'Munitions: 0', {fontSize: '32px', fill:'#000'});
	ptText = this.add.text(600,16, 'Vie : 100', {fontSize: '32px', fill:'#000'});
	bombs = this.physics.add.group();
	this.physics.add.collider(bombs,platforms);
	this.physics.add.collider(bombs,bombs);
	this.physics.add.overlap(player,bombs, hitBomb, null, this);
	this.physics.add.overlap(bombs,amo,bombAmo,null,this);
}

function update(){
	if (badir == 0){
		baddy.setVelocityX(-300);
		baddy.anims.play('right', true);
		baddy.setFlipX(true);
	}else{
		baddy.setVelocityX(300);
		baddy.anims.play('right', true);
		baddy.setFlipX(false);
	}
	if (baddy.x <= 20){
		badir = 1;
	}
	if (baddy.x >= 780){
		badir = 0;
	}
	if (cursors.down.isDown && dash == 1){
		dash = 0;
		if (cursors.left.isDown){
			player.x -= 100;
		}else{
			player.x += 100;
		}
	}
	if(cursors.left.isDown){
		player.anims.play('left', true);
		player.setVelocityX(-300);
		player.setFlipX(true);
	}else if(cursors.right.isDown){
		player.setVelocityX(300);
		player.anims.play('left', true);
		player.setFlipX(false);
	}else{
		player.anims.play('stop', true);
		player.setVelocityX(0);
	}
	if(cursors.up.isDown && saut > 0 && press == 1){
		player.setVelocityY(-230);
		saut -= 1;
		press -= 1;
		if (saut == 1) {
            player.setVelocityY(-260);
        }
        if (saut == 0) {
            player.setVelocityY(-260);
        }
	}
	if(cursors.up.isUp){
		press = 1;
	}
	 if (cursors.up.isUp && player.body.touching.down) {
		saut = 2;
	}
	if (player.body.touching.down && cursors.down.isUp) {
		dash = 1;
	}
	if (player.pv <= 0){
		this.physics.pause();
		player.setTint(0xff0000);
		player.anims.play('turn');
		gameOver=true;
	}
}

function hitBomb(player, bomb){
	bomb.disableBody(true,true);
	createBomb();
	score -= 10;
	scoreText.setText('score: '+score);
	player.pv = player.pv - 10;
	ptText.setText('Vie : '+player.pv);
	pvRed.create(560 + (100 - player.pv) * 2,70,'pv_red').setScale(0.1,1).setOrigin(0,0);
}
function collectStar(player, star){
	star.disableBody(true,true);
	score += 10;
	scoreText.setText('score: '+score);
	if(stars.countActive(true)===0){
		stars.children.iterate(function(child){
			child.enableBody(true,child.x,0, true, true);
		});
		createBomb();
		createAmo();
	}
}
function createBomb(){
	var x = (player.x < 400) ? 
			Phaser.Math.Between(400,800):
			Phaser.Math.Between(0,400);
		var bomb = bombs.create(x, 16, 'bomb');
		var g = Phaser.Math.Between(-500,500)
		bomb.body.setGravityX(g);
		bomb.setBounce(1);
		bomb.setCollideWorldBounds(true);
		bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
}
function createAmo(){
	var x = Phaser.Math.Between(0,800);
	amos = amo.create(x, 5, 'mun');
	amos.setGravityY(250);
}
function collectAmo(player, amo){
	amo.disableBody(true,true);
	munition += 2;
	munText.setText('Munitions: '+munition);
}
function bombAmo(bomb, amo){
	amo.disableBody(true,true);
}
function getHit(){
	player.y -= 40;
	player.setVelocityY(-260);
	score -= 10;
	scoreText.setText('score: '+score);
	player.pv = player.pv - 10;
	ptText.setText('Vie : '+player.pv);
	pvRed.create(560 + (100 - player.pv) * 2,70,'pv_red').setScale(0.1,1).setOrigin(0,0);
}