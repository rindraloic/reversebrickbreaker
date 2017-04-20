function Game(){
  let canvas, ctx, width, height;
	let barre, score;
	let tableauxBricks = [];
	let tableauxBalls = [];
	let combo = "";
	let nbCombo = 0;
	let spawnInterval=500;
	let timeoutTable=[];
	let alpha=1;
	let dX=0;
	let interval = setInterval(function () {
				alpha = alpha - 0.05; // decrease opacity (fade out)
				dX+=2;
			}, 50);
	let comboX,comboY;
  let gameState = {
	load:0,
    running: 1,
    pause: 2,
    over: 3
  };
	let killer=0;
  let currentGameState=gameState.load ;
 
  let bossBallCount=0;
  let ballSpawnedBeforeBoss=10;
  let ballSpawned=0;
  let bossCount=0;
  
  let level=1;
  
  let sound = new Howl({
  urls: ['res/audio/boss.wav'],
  onload: function() { 
	 start();
  }
});
  
  //BALLS
  function addBall(){
		let x = canvas.width/2; 
		let diffX=canvas.width/2 - 20;
		let y = (canvas.height-310);
		let vx=1;
		if(Math.random()<0.5)vx=-1;
		if(Math.random()<0.5)x+=diffX;
		else x-=diffX;
		let b = new Ball(x, y, 8, "white", vx,4);
		tableauxBalls.push(b);
		ballSpawned++;
		if(ballSpawned<ballSpawnedBeforeBoss){
			timeoutTable.push(setTimeout(addBall,spawnInterval));
		}
		else {
			//addBonus();
			timeoutTable.push(setTimeout(spawnMultipleLeft,500));
			ballSpawned=0;
			if(currentGameState=gameState.running)sound.play();
		}
	}
	function addBonus(){
		let x = canvas.width/2; 
		let y = (canvas.height-310);
		let vx=1;
		if(Math.random()<0.5)vx=-1;
		let b = new Ball(x, y, 8, "white", vx,4,true,true);
		tableauxBalls.push(b);
		
	}
	function spawnMultipleLeft(){
		let x = canvas.width/2; 
		let diffX=canvas.width/2 - 20;
		x-=diffX;
		let y = (canvas.height-310);
		let vx=1;
		vx+=bossBallCount*0.15;
		let b = new Ball(x, y, 8, "white", vx,4,true);
		tableauxBalls.push(b);
		bossBallCount++;
		if(bossBallCount<10)timeoutTable.push(setTimeout(spawnMultipleLeft,50));
		if(bossBallCount==10) {
			bossCount++;
			bossBallCount=0;
			if(bossCount<level)timeoutTable.push(setTimeout(spawnMultipleRight,500));
			else {
				spawnInterval-=50;
				timeoutTable.push(setTimeout(addBall,spawnInterval));
				level++;
				bossCount=0;
				sound.stop();
			}
		}
	}
	function spawnMultipleRight(){
		let x = canvas.width/2; 
		let diffX=canvas.width/2 - 20;
		x+=diffX;
		let y = (canvas.height-310);
		let vx=-1;
		vx-=bossBallCount*0.15;
		let b = new Ball(x, y, 8, "white", vx,4,true);
		tableauxBalls.push(b);
		bossBallCount++;
		if(bossBallCount<10)timeoutTable.push(setTimeout(spawnMultipleRight,50));
		if(bossBallCount==10) {
			bossCount++;
			bossBallCount=0;
			if(bossCount<level)timeoutTable.push(setTimeout(spawnMultipleLeft,500));
			else {
				spawnInterval-=50;
				timeoutTable.push(setTimeout(addBall,spawnInterval));
				level++;
				bossCount=0;
				sound.stop();
			}
		}
	}
  function dessinerEtDeplacerLesBalles() {  
		tableauxBalls.forEach(function(b, index, tab) {
			b.move();
			b.draw(ctx);
			testCollisionBallMurs(b);
			testCollisionBallBrick(b);
			testBallGoThroughHole(b);
			//if(level>2)	testCollisionEntreBalles(b);
	  });
	}

  //BRICKS
  function drawBricks() {
		tableauxBricks.forEach(function(b, index, tab) {
			b.draw(ctx);
		});
	}
  function createBricks(){
		let couleur = ["#4fc3f7", "#29b6f6", "#03a9f4", "#039be5", "#0288d1", "#0277bd","#01579b"];
		let nbligne = 7;
		let espace = 4;
		let ncol = 8;
		let y = 50;
		let largeur = 20;
		let longueur = canvas.width/ncol-espace;
		for(let i = 0; i < nbligne; i++) {
			let x = 0;
			for(let o=0 ; o < ncol;o++){
				let brique = new Rect(x+1, y, longueur,largeur ,couleur[i], 0, 0);
				tableauxBricks.push(brique);
				x = x+canvas.width/ncol;
			}
			y = y+largeur+espace;
		}
	}

  //COLLISIONS
  function circRectsOverlap(x0, y0, w0, h0, cx, cy, r) {
    let testX=cx;
    let testY=cy;
    if (testX < x0) testX=x0;
    if (testX > (x0+w0)) testX=(x0+w0);
    if (testY < y0) testY=y0;
    if (testY > (y0+h0)) testY=(y0+h0);
    return (((cx-testX)*(cx-testX)+(cy-testY)*(cy-testY))< r*r);
  }
	function collisionCircle(x1,y1,r1,x2,y2,r2){
		var dx=x1-x2;
		var dy=y1-y2;
		return ((dx*dx+dy*dy)<(r1+r2)*(r1+r2));
	}
  function testCollisionBallMurs(b) {
		if(((b.x + b.rayon) > canvas.width) || (b.x  < 0)) {
			b.vx = -b.vx;
		}
		if (b.y < 0) {
			b.vy = -b.vy;
			currentGameState = gameState.over;
		}
		if((b.y + 2*b.rayon) > canvas.height){
			nbCombo++;
			combo = "x"+nbCombo;
			
			score = score+100 +nbCombo*10;
			disappear(b);
		}
	}
  function testCollisionBallBrick(b) {
		for(let i = 0; i < tableauxBricks.length; i++) {
			let collision = circRectsOverlap(tableauxBricks[i].x, tableauxBricks[i].y, tableauxBricks[i].longueur, tableauxBricks[i].largeur, b.x, b.y, b.rayon)
			if (collision == true){
				startDoubleExplosion(tableauxBricks[i].x,tableauxBricks[i].y,tableauxBricks[i].couleur);
				tableauxBricks.splice(i,1);
				if(tableauxBricks.length==0)currentGameState=gameState.over;
				if(b.hitBeforeBreak==0){disappear(b);}
				b.vy = -b.vy;
				break;
			}
		}
  }
  function testBallGoThroughHole(b) {
		if(barre.y==(b.rayon+b.y)){
			if(!((barre.x<(b.rayon+b.x))&&((barre.x+barre.longueur)>(b.x+b.rayon)))){
				b.vy = -b.vy;
				nbCombo=0;
				combo = "";
				b.hitBeforeBreak--;
				b.changeColor();
			}	
			else{
				alpha=1;
				dX=0;
				comboX=b.x;
				comboY=b.y;
				if(b.isBonus){
					nbCombo++;
					combo="x"+nbCombo;
					createBonusExplosion(b.x,b.y);
					//Kill all balls if bonus caught
					while(tableauxBalls.length>0){
							for(let i = 0; i < tableauxBalls.length; i++) {
								score+=100;
								tableauxBalls.splice(i,1);  
							}
					}
				}
			}	
		}
	}
	function testCollisionEntreBalles(ball){
		tableauxBalls.forEach(function(b, index, tab) {
			if(collisionCircle(ball.x,ball.y,ball.rayon,b.x,b.y,b.rayon)){
				//ball.vx = -ball.vx;
				ball.vy = -ball.vy;
				//b.vx = -b.vx;
				b.vy = -b.vy;
			}
	  });
	}
  //GAME
  function move(evt){
		let rect = canvas.getBoundingClientRect();
		let mx = evt.clientX - rect.left;
		barre.setX(mx);
	}
  function mainLoop(time) {
		ctx.clearRect(0, 0, width, height);
		measureFPS(time);
		if(tableauxBricks.length == 0) currentGameState = gameState.over;
		let fontSize = 20;
		switch (currentGameState) {
			case gameState.running:
				
				barre.draw(ctx); 
				dessinerEtDeplacerLesBalles();
				fontSize = 20;
				//score
				ctx.font = fontSize + 'px Courier bold';
				ctx.fillStyle = 'white';
				ctx.fillText("SCORE : "+score,10,30);
				fontSize = 20;
				//level
				ctx.font = fontSize + 'px Courier bold';
				ctx.fillStyle = 'white';
				ctx.fillText("Level  "+level,300,30);
				
				//combo
				ctx.fillStyle = "rgba(255, 235, 59, " + alpha + ")";
				ctx.font = '35px Courier BOLD';
				ctx.fillText(combo,comboX,comboY-dX);
				
				
				// number of ms since last frame draw
				delta = timer(time);
			   
				drawBricks();
				if(Math.random()<0.005){
					addBonus();
				}
				// Move and draw particles
				updateAndDrawParticules(delta,ctx);
				
				break;
			case gameState.over:
				fontSize = 50;
				ctx.font = fontSize + 'px Courier BOLD';
				ctx.fillStyle = '#ffa71d';
				ctx.fillText("GAME OVER",50,height/2);
				
				fontSize = 20;
				ctx.font = fontSize + 'px Courier BOLD';
				ctx.fillStyle = 'white';
				ctx.fillText("SCORE Final: "+score,125,height/2+50);

				fontSize = 15;
				ctx.font = fontSize + 'px Courier BOLD';
				ctx.fillStyle = 'white';
				ctx.fillText("Appuyez sur la touche N pour recommencer",width/6,height/2+100);

				gameOver();
				break;
			case gameState.pause:
				fontSize = 50;
				ctx.font = fontSize + 'px Courier BOLD';
				ctx.fillStyle = 'white';
				ctx.fillText("PAUSE",130,height/2);
					
				break;
		}

		requestAnimationFrame(mainLoop);
	}	
  function disappear(b){
	  for(let i = 0; i < tableauxBalls.length; i++) {
			if(b.x == tableauxBalls[i].x){ 
			tableauxBalls.splice(i,1);  }
		}
	}
  function start() {
	    if(currentGameState!=gameState.running&&currentGameState!=gameState.pause){
			canvas = document.querySelector("#myCanvas");
			width = canvas.width;
			height = canvas.height; 
			ctx = canvas.getContext('2d');
			barre = new Barre(canvas.width/2, canvas.height-70, 80, 10, 0, 0);
			barre.draw(ctx);		
			initGame();
			setTimeout(addBall,spawnInterval);
			currentGameState = gameState.running;
			addEcouteurs(this);
			//fadeOut("BONJOUR",ctx);
			requestAnimationFrame(mainLoop);
	    }
	}
	function restart(){
		if(currentGameState==gameState.over){
			canvas = document.querySelector("#myCanvas");
			width = canvas.width;
			height = canvas.height; 
			ctx = canvas.getContext('2d');
			barre = new Barre(canvas.width/2, canvas.height-70, 80, 10, 0, 0);
			barre.draw(ctx);		
			initGame();
			setTimeout(addBall,spawnInterval);
			currentGameState = gameState.running;
		}
	}
	function initGame(){
		score = 0;
		level=1;
		tableauxBricks = [];
		tableauxBalls = [];
		combo = "";
		nbCombo = 0;
		spawnInterval=1500;
		bossBallCount=0;
		ballSpawnedBeforeBoss=15;
		ballSpawned=0;
		bossCount=0;
		initFPS();
		createBricks();
	}
  function pause(display){
		if (currentGameState == gameState.running || display != null){
			currentGameState = gameState.pause;
		}
		else currentGameState = gameState.running;
	}
  function gameOver(){
		tableauxBalls = [];
		tableauxBriques = [];
		timeoutTable.forEach(function(b, index, tab) {
			clearTimeout(b);
			timeoutTable.splice(index,1);
		});
		
	}

  return {
		move:move,
		start:start,
		pause:pause,
		restart:restart
	}
}