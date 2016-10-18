//Camera position data
var initCamR = 16;
var initCamTh = 90*PI/180;
var initCamPh = 0;
var camR = initCamR, camPh = initCamPh, camTh = initCamTh;
var eye = vec3(0.0, camR*cos(camTh), camR*sin(camTh));
var at = vec3(0.0,0.0,0.0);
var up = vec3(0.0, cos(camTh-PI/2), sin(camTh+PI));
var flip_flag = 1;
var PI = 3.14159;

//Prevents gimbal lock when the polar angle (camTh) is outside the
// range of 0 to PI
function correct_th()
{
	if (camTh < 0)
	{
		camTh *= -1;
		camPh += PI;
		flip();
	}
	else if (camTh > PI)
	{
		camTh = 2*PI-camTh;
		camPh -= PI;
		flip();
	}
	update();
}

//Resets all view parameters to their initial values.
// -Returns camera to its initial position
// -Disables and resets all rotation/spinning/scrolling
function reset_view()
{
	flip_flag = 1;
	camR = initCamR;
	camPh = initCamPh;
	camTh = initCamTh;
	eye = vec3(0.0, camR*cos(camTh), camR*sin(camTh));
	at = vec3(0.0,0.0,0.0);
	up = vec3(0.0, cos(camTh-PI/2), sin(camTh+PI));
	
	theta = [0.0,0.0];

}

//Sets the arguments for lookAt()
function eyeAtUp()
{
	eye = vec3(camR*sin(camTh)*sin(camPh),camR*cos(camTh),camR*sin(camTh)*cos(camPh));
	var uTh = camTh-flip_flag*PI/2;
	var uPh = camPh;
	if (uTh < 0)
	{
		uTh = -uTh;
		uPh += PI;
	}
	else if (uTh > PI)
	{
		uTh = 2*PI-uTh;
		uPh -= PI;
	}
	up = vec3(sin(uTh)*sin(uPh),cos(uTh),sin(uTh)*cos(uPh));
	//at = vec3(0.0,0.0,0.0);
}

function update()
{
	if (camPh < 0)
		camPh += 2*PI;
	else if (camPh >= 2*PI)
		camPh -= 2*PI;
}

//Mutators
function setCamR(input)
{
	camR = input;
}

function changeCamR(delta)
{
	camR += delta;
}

function setCamTh(input)
{
	camTh = input;
}

function changeCamTh(delta)
{
	camTh += delta;
}

function setCamPh(input)
{
	camPh = input;
}

function changeCamPh(delta)
{
	camPh += delta;
}

function setEye(input)
{
	eye = input;
}

function setUp(input)
{
	up = input;
}

function setAt(input)
{
	at = input;
}

function flip()
{
	flip_flag *= -1;
}

//Accessors
function getCamR()
{
	return camR;
}

function getCamTh()
{
	return camTh;
}

function getCamPh()
{
	return camPh;
}

function getFlip()
{
	return flip_flag;
}

function getEye()
{
	return eye;
}

function getUp()
{
	return up;
}

function getAt()
{
	return at;
}