var mouseDown = false;
var mouse_initX = 0;
var mouse_initY = 0;
//Checks whether the left mouse button is down
window.onmousedown = function(e)
{
	if (e.button === 0)
	{
		mouseDown = true;
		mouse_initX = e.clientX;
		mouse_initY = e.clientY;
	}
}

//Checks if the left mouse button has been released
window.onmouseup = function(e)
{
	if (e.button === 0)
		mouseDown = false;
}

//Prevents gimbal lock when the polar angle (camTh) is outside the
// range of 0 to PI
function correct_th()
{
	if (getCamTh() < 0)
	{
		setCamTh(-getCamTh());
		changeCamPh(PI);
		flip();
	}
	else if (getCamTh() > PI)
	{
		setCamTh(2*PI-getCamTh());
		changeCamPh(-PI);
		flip();
	}
}

//Allows the user to click and drag to change the cube view
window.onmousemove = function(e)
{
	if (mouseDown)
	{
		var dx = e.clientX - mouse_initX;
		var dy = e.clientY - mouse_initY;
		
		changeCamPh(-getFlip()*dx*PI/180/5);
		changeCamTh(-getFlip()*dy*PI/180/5);
		correct_th();
		mouse_initX = e.clientX;
		mouse_initY = e.clientY;
	}
}
/*
var cur_scroll = 0;
window.onscroll = function(e)
{
	var delta = cur_scroll - document.body.scrollTop;
	cur_scroll = document.body.scrollTop;
	var camR = getCamR();
	if (camR <= 3 && delta < 0)
		return;
	else if (camR > 100 && delta > 0)
		return;
	else
		changeCamR(delta);
}*/

//Handles all keyboard input (key-down events).
window.onkeydown = function(event)
{
	code = event.keyCode;
	switch(code)
	{
		case 38: //Up Arrow
		  if (getCamR() > 3)
			  changeCamR(-1);
		  break;
			  
		case 40: //Down Arrow
		  if (getCamR() < 100)
			  changeCamR(1);
		  break;
			  
		case 37: //Left Arrow
		  break;
			  
		case 39: //Right Arrow
		  break;
			  
		default:
		  switch(String.fromCharCode(code))
		  {
			  case ' ': //Reset view
			    reset_view();
				break;
		  }
		  break;
	}
};
