function gameKeyPressed(evt) {
  switch(evt.key) {
    case 'n' :
//	  location.reload();
      theGame.restart();
      break;
	case ' ' :
      theGame.pause();
      break;
  }
}
function handleVisibilityChange() {
  if (document.hidden) {
    theGame.pause();
  } else  {
    theGame.pause();
  }
}
	
function addEcouteurs() {
  canvas.addEventListener('mousemove', theGame.move);
  window.addEventListener('keydown', gameKeyPressed);		
  document.addEventListener("visibilitychange", handleVisibilityChange, false);
}  