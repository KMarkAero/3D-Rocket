//Camera position data
var initCamR = 16;
var initCamTh = 90*PI/180;
var initCamPh = 0;
var camR = initCamR, camPh = initCamPh, camTh = initCamTh;
var eye = vec3(0.0, camR*cos(camTh), camR*sin(camTh));
var at = vec3(0.0,0.0,0.0);
var up = vec3(0.0, cos(camTh-PI/2), sin(camTh+PI));
var flip_flag = 1;

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