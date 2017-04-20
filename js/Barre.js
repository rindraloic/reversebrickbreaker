class Barre extends Rect{
	constructor(x, y, longueur, largeur, vx, vy) {
		super(x, y, longueur, largeur, "#404040", vx, vy);
		this.duration=2500;
		this.originalLongueur=longueur;
	}
	
	draw(ctx){
		super.draw(ctx);
		ctx.save(); 
		if (this.longueur < canvas.width){
			ctx.fillStyle = "white";
			ctx.fillRect(0, this.y, this.x, this.largeur);
			ctx.fillRect(this.x+this.longueur, this.y, canvas.width-this.x-this.longueur, this.largeur);
		}
		ctx.restore();
		
	}
	
	setX (newX){
		if (newX+this.longueur <= canvas.width && newX >= 0){
			this.x = newX;
		}
	}
	extend(){
		this.longueur=150;
		setTimeout(function(){this.longueur=this.originalLongueur;console.log('backtonormal')},this.duration);
	}
	reduce(){
		this.largeur=50;
	}
	
}
