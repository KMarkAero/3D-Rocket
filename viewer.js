var PI = 3.14159;
var sin = Math.sin;
var cos = Math.cos;
function sind(ang) { return Math.sin(radians(ang)); }
function cosd(ang) { return Math.cos(radians(ang)); }
function round(num, place) { return Math.round(num/place)*place; }

var gl;
var canvas;

var BODY_CLR = [
	vec4( 0.0,0.6,0.4,1.0 ), //Ambient
	vec4( 0.0,0.3,0.2,1.0 ), //Diffuse
	vec4( 1.0,1.0,0.0,1.0 )  //Specular
];

var GRND_CLR = [
	vec4( 0.5,0.6,0.4,1.0 ), //Ambient
	vec4( 0.5,0.6,0.4,1.0 ), //Diffuse
	vec4( 0.1,0.1,0.1,1.0 )  //Specular
];

var bg = vec4( 0.0, 0.6, 0.8, 1.0 ); //Background color

var index = [0];
var nPts = [];
var polygons = [];
var nLinePts = 0;

//Projection matrix data
var near = 0.3;
var far = 250.0;
var fovy = 45.0;
var dfov = 5.0;
var aspectRatio;
var o_left;
var o_right;
var o_bot = 10.0;
var o_top = -10.0;

//Lighting Data
var lightPos = vec4(-6.0, 4.0, 0.0, 1.0);
var light = [
	vec4( 1.0,1.0,1.0,1.0 ),
	vec4( 1.0,0.9,0.9,1.0 ),
	vec4( 0.5,0.4,0.4,1.0 )
];

//Data which will be passed to the shaders
var vLightPosLoc;
var vAmbLoc, vDifLoc, vSpcLoc;
var fTexLoc;
var modelViewMatrix, perspectiveMatrix, orthogonalMatrix;
var modelViewMatrixLoc, perspectiveMatrixLoc, orthogonalMatrixLoc, normalMatrixLoc;//, lightingMatrixLoc;
var vProjectionTypeLoc;
var PERSP = 10, ORTHO = 20;

//Initializes WebGL, creates the geometry, and sets up buffers and uniform variables.
window.onload = function init()
{
	///////////////////////////////////////////////////////////////
	// Prepare Geometry - EDIT HERE
	
	//Example: addGeo(geo***(args),"choose-identifier");
	addGeo(geoSphere(6),"SPHERE");
	addGeo(geoCyl(64),"CYL");
	addGeo(geoCone(64),"CONE");
	addGeo(geoFin(1.2,0.6,0.05),"FIN");
	addGeo(geoAxes(),"AXES");
	addGeo(geoGround(),"GROUND");
	addGeo(geoCube(),"CUBE");
	addGeo(geoSphere(3),"SMOKE");
	
	//Create the array which stores the offsets of the points/normals arrays
	[points, normals] = gen_pts_norms();
	
	// Prepare Geometry
	///////////////////////////////////////////////////////////////
	// Configure WebGL - Do Not Edit
	
    canvas = document.getElementById( "gl-canvas" );
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
	
    gl.viewport( 0, 0, canvas.width, canvas.height );
	
	//Background Color
    gl.clearColor( bg[0], bg[1], bg[2], bg[3] );
	
	gl.enable( gl.DEPTH_TEST );  //Activate z-buffer
	aspectRatio = canvas.width/canvas.height;
    //Load shaders
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
	
	// Configure WebGL
	///////////////////////////////////////////////////////////////
	// Geometry Buffers: Set Up and Bind the Buffers - Do Not Edit
	
    var nBuffer = gl.createBuffer();
	gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer );
	gl.bufferData( gl.ARRAY_BUFFER, flatten(normals), gl.STATIC_DRAW );
	
	var vNorm = gl.getAttribLocation( program, "vNorm" );
	gl.vertexAttribPointer( vNorm, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNorm );
	
	//Load the vertex and normal data into the GPU
    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );
	
    //Associate shader variables with the data buffers
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
	
	// Geometry Buffers
	///////////////////////////////////////////////////////////////
	// Uniforms: Get locations of uniform variables
	
	modelViewMatrixLoc = getULoc( program, "modelViewMatrix" );
	normalMatrixLoc = getULoc( program, "normalMatrix" );
	perspectiveMatrixLoc = getULoc(program, "perspectiveMatrix");
	orthogonalMatrixLoc = getULoc(program, "orthogonalMatrix");
	//lightingMatrixLoc = getULoc( program, "lightingMatrix" );
	vLightPosLoc = getULoc(program, "vLightPos");
	vAmbLoc = getULoc(program, "vAmb");
	vDifLoc = getULoc(program, "vDif");
	vSpcLoc = getULoc(program, "vSpc");
	fTexLoc = getULoc(program, "fTex");
	vProjectionTypeLoc = getULoc(program, "vProjectionType");
	
	// Send Projection Matrices
	o_left = aspectRatio*o_top;
	o_right = aspectRatio*o_bot;
	perspectiveMatrix = perspective(fovy,aspectRatio,near,far);
	gl.uniformMatrix4fv(perspectiveMatrixLoc,false,flatten(perspectiveMatrix));
	orthogonalMatrix = ortho(o_left,o_right,o_top,o_bot,near,far);
	gl.uniformMatrix4fv(orthogonalMatrixLoc,false,flatten(orthogonalMatrix));
	
	document.getElementById("Ignition").onclick = function(){firing = true;};
	
	//Render the first frame
    window.requestAnimFrame(render);
	
	// Uniforms and Projection Matrix
	///////////////////////////////////////////////////////////////
};

function getULoc(program, varName)
{
	return gl.getUniformLocation(program, varName)
}

///////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////
// DRAW FUNCTIONS
// These functions set up the position/orientation of each instance of a particular geometry.
// Loaded geometries may be used more than once or not at all, and they can be independently 
// stretched, moved, or rotated.  Each time a new instance of a geometry is desired, a function
// should be added here.

//Sends the matrix information down the pipeline.
function drawRocket(L, D, x, y, z, c_l)
{
	//Moves the cyl to its position in space.
	var instMatrix = mult(modelViewMatrix,translate(x, y, z));
	//Rotates the cyl by the proper amount.
	//instanceMatrix = mult(instanceMatrix,rotate(0,[1.0,0.0,0.0]));
	//Scales the cube by the current scale factor.
	var cylMatrix = mult(instMatrix,scale( D, L, D ));
	var coneMatrix = mult(instMatrix,scale( D, c_l, D ));
	
	var clr = BODY_CLR;
	
	//Sends the transformation matrix to the shaders.
	gl.uniform4fv(vAmbLoc,flatten(mult(clr[0],light[0])));
	gl.uniform4fv(vDifLoc,flatten(mult(clr[1],light[1])));
	gl.uniform4fv(vSpcLoc,flatten(mult(clr[2],light[2])));
	
	gl.uniform1i(vProjectionTypeLoc, PERSP);
	
	//Send the cylinder down the pipeline
	gl.uniformMatrix4fv(modelViewMatrixLoc,false,flatten(cylMatrix));
	gl.uniformMatrix3fv(normalMatrixLoc,false,flatten(normalFromModel(cylMatrix)));
	gl.drawArrays( gl.TRIANGLES, getInd("CYL"), getNPts("CYL"));
	
	//Send the cone with same lighting but different scaling
	gl.uniformMatrix4fv(modelViewMatrixLoc,false,flatten(coneMatrix));
	gl.uniformMatrix3fv(normalMatrixLoc,false,flatten(normalFromModel(coneMatrix)));
	gl.drawArrays( gl.TRIANGLES, getInd("CONE"), getNPts("CONE"));
	
	drawFins(D,x,y-6.8,z);
	drawTAMS(D,x,y-5.0,z,3,D/2,1.5);
	if (firing)
		drawExhaust(x,y-L,z,D/2,1.0,D/4,0.5);
}

function drawTAMS(D,x,y,z,l,d,c_l)
{
	var clr = BODY_CLR;
	
	//Sends the transformation matrix to the shaders.
	gl.uniform4fv(vAmbLoc,flatten(mult(clr[0],light[0])));
	gl.uniform4fv(vDifLoc,flatten(mult(clr[1],light[1])));
	gl.uniform4fv(vSpcLoc,flatten(mult(clr[2],light[2])));
	
	gl.uniform1i(vProjectionTypeLoc, PERSP);
	
	for (var k=0;k < 3;k++)
	{
		//Moves the cyl to its position in space.
		var instMatrix = mult(modelViewMatrix,translate(x+(D+d)/2*cos(2*PI*k/3+PI/3), y, z+(D+d)/2*sin(2*PI*k/3+PI/3)));
		//Rotates the cyl by the proper amount.
		//instanceMatrix = mult(instanceMatrix,rotate(0,[1.0,0.0,0.0]));
		//Scales the cube by the current scale factor.
		var cylMatrix = mult(instMatrix,scale( d, l, d ));
		var coneMatrix = mult(instMatrix,scale( d, c_l, d ));

		gl.uniformMatrix4fv(modelViewMatrixLoc,false,flatten(cylMatrix));
		gl.uniformMatrix3fv(normalMatrixLoc,false,flatten(normalFromModel(cylMatrix)));
		gl.drawArrays( gl.TRIANGLES, getInd("CYL"), getNPts("CYL"));
		
		gl.uniformMatrix4fv(modelViewMatrixLoc,false,flatten(coneMatrix));
		gl.uniformMatrix3fv(normalMatrixLoc,false,flatten(normalFromModel(coneMatrix)));
		gl.drawArrays( gl.TRIANGLES, getInd("CONE"), getNPts("CONE"));
	}
}

function drawFins(D, x, y, z)
{
	//Lighting info is the same for each fin
	var clr = BODY_CLR;
	
	gl.uniform4fv(vAmbLoc,flatten(mult(clr[0],light[0])));
	gl.uniform4fv(vDifLoc,flatten(mult(clr[1],light[1])));
	gl.uniform4fv(vSpcLoc,flatten(mult(clr[2],light[2])));
	
	gl.uniform1i(vProjectionTypeLoc, PERSP);
	
	//Position/Rotation info changes per fin
	for (var k=0;k < 3;k++)
	{
		var xx = x+D/2*cos(2*PI*k/3);
		var zz = z+D/2*sin(2*PI*k/3);
		var instanceMatrix = mult(modelViewMatrix,translate(xx, y, zz));
		//Rotates the cyl by the proper amount.
		instanceMatrix = mult(instanceMatrix,rotate(-120*k,[0.0,1.0,0.0]));
	
		gl.uniformMatrix4fv(modelViewMatrixLoc,false,flatten(instanceMatrix));
		gl.uniformMatrix3fv(normalMatrixLoc,false,flatten(normalFromModel(instanceMatrix)));

		gl.drawArrays( gl.TRIANGLES, getInd("FIN"), getNPts("FIN"));
	}
}

function drawLine(x, y, z)
{
	//Moves the line to its position in space.
	var instanceMatrix = mult(modelViewMatrix,translate(x, y, z));
	//Rotates the line by the proper amount.
	//instanceMatrix = mult(instanceMatrix,rotate(90,[1.0,0.0,0.0]));
	//Scales the line by the current scale factor.
	//instanceMatrix = mult(instanceMatrix,scale( 1.0, 1.0, 6.0));
	
	var clr = [
		vec4(1.0,1.0,1.0,1.0),
		vec4(1.0,1.0,1.0,1.0),
		vec4(1.0,1.0,1.0,1.0)
	];
	
	gl.uniform1i(vProjectionTypeLoc, PERSP);
	
	//Sends the transformation matrix to the shaders.
	gl.uniform4fv(vAmbLoc,flatten(mult(clr[0],light[0])));
	gl.uniform4fv(vDifLoc,flatten(mult(clr[1],light[1])));
	gl.uniform4fv(vSpcLoc,flatten(mult(clr[2],light[2])));
	gl.uniformMatrix4fv(modelViewMatrixLoc,false,flatten(instanceMatrix));
	gl.uniformMatrix3fv(normalMatrixLoc,false,flatten(normalFromModel(instanceMatrix)));
	
	gl.drawArrays( gl.LINES, index[4], nPts[4]);
}

function drawAxes()
{
	//Moves the line to its position in space.
	var instanceMatrix = translate(0.9*o_left, -0.9*o_bot, -10.0);//translate(-0.9*canvas.width/2, 0.9*canvas.height/2, -10.0);
	//Rotates the line by the proper amount.
	var th_ang = PI/2-getFlip()*getCamTh();
	var ph_ang = -getCamPh();
	if (getFlip() < 0)
		ph_ang -= PI;
	instanceMatrix = mult(instanceMatrix,rotate(degrees(th_ang),[cosd(getCamPh()),0.0,-sind(getCamPh())]));
	instanceMatrix = mult(instanceMatrix,rotate(degrees(ph_ang),[0.0,1.0,0.0]));

	//Scales the line by the current scale factor.
	//instanceMatrix = mult(instanceMatrix,scale( 1.0, 1.0, 6.0));
	
	var clrs = [
		vec4(1.0,0.0,0.0,1.0),
		vec4(0.0,1.0,0.0,1.0),
		vec4(0.0,0.0,1.0,1.0)
	];
	
	gl.uniform1i(vProjectionTypeLoc, ORTHO);
	
	gl.uniformMatrix4fv(modelViewMatrixLoc,false,flatten(instanceMatrix));
	gl.uniformMatrix3fv(normalMatrixLoc,false,flatten(normalFromModel(instanceMatrix)));

	//Sends the transformation matrix to the shaders.
	for (var k=0;k < 3;k++)
	{
		gl.uniform4fv(vAmbLoc,flatten(clrs[k]));
		//gl.uniform4fv(vDifLoc,flatten(red));
		//gl.uniform4fv(vSpcLoc,flatten(red));

		gl.drawArrays( gl.LINES, getInd("AXES")+k*2, 2);
	}
}

function drawSphere(x, y, z)
{
	//Moves the sphere to its position in space.
	var instanceMatrix = mult(modelViewMatrix,translate(x, y, z));
	//Scales the sphere by the current scale factor.
	instanceMatrix = mult(instanceMatrix,scale( 1.0, 1.0, 1.0));
	
	gl.uniform4fv(vAmbLoc,flatten(mult(vec4(0.5, 0.5, 0.5, 1.0),vec4(1.0,1.0,1.0,1.0))));
	gl.uniform4fv(vDifLoc,[0.5,0.5,0.5,1.0]);
	gl.uniform4fv(vSpcLoc,[0.5,0.5,0.5,1.0]);
	
	gl.uniformMatrix4fv(modelViewMatrixLoc,false,flatten(instanceMatrix));
	gl.uniformMatrix3fv(normalMatrixLoc,false,flatten(normalFromModel(instanceMatrix)));
	
	gl.uniform1i(vProjectionTypeLoc, PERSP);
	
	gl.drawArrays( gl.TRIANGLES, getInd("SPHERE"), getNPts("SPHERE"));
}

function drawCube(x, y, z)
{
	//Moves the sphere to its position in space.
	var instanceMatrix = mult(modelViewMatrix,translate(x, y, z));
	//Scales the sphere by the current scale factor.
	instanceMatrix = mult(instanceMatrix,scale( 1.0, 1.0, 1.0));
	
	var clr = [
		vec4( 0.5,0.3,0.3,1.0 ), //Ambient
		vec4( 0.2,0.1,0.1,1.0 ), //Diffuse
		vec4( 1.0,1.0,1.0,1.0 )  //Specular
	];
	
	gl.uniform4fv(vAmbLoc,flatten(mult(clr[0],light[0])));
	gl.uniform4fv(vDifLoc,flatten(mult(clr[1],light[1])));
	gl.uniform4fv(vSpcLoc,flatten(mult(clr[2],light[2])));
	
	gl.uniformMatrix4fv(modelViewMatrixLoc,false,flatten(instanceMatrix));
	gl.uniformMatrix3fv(normalMatrixLoc,false,flatten(normalFromModel(instanceMatrix)));
	
	gl.uniform1i(vProjectionTypeLoc, PERSP);
	
	gl.drawArrays( gl.TRIANGLES, getInd("CUBE"), getNPts("CUBE"));
}

function drawExhaust(x, y, z, D, L, d, l)
{
	var flame_clr = [
		vec4( 1.0,1.0,0.6,1.0 ), //Ambient
		vec4( 0.5,0.5,0.3,1.0 ), //Diffuse
		vec4( 1.0,1.0,1.0,1.0 )  //Specular
	];
	gl.uniform4fv(vAmbLoc,flatten(mult(flame_clr[0],light[0])));
	gl.uniform4fv(vDifLoc,flatten(mult(flame_clr[1],light[1])));
	gl.uniform4fv(vSpcLoc,flatten(mult(flame_clr[2],light[2])));
		
	gl.uniform1i(vProjectionTypeLoc, PERSP);
	
	//Moves the sphere to its position in space.
	var instanceMatrix = mult(modelViewMatrix,translate(x, y, z));
	//Rotates the sphere by the proper amount.
	instanceMatrix = mult(instanceMatrix,rotate(180,[1.0,0.0,0.0]));
	//Scales the sphere by the current scale factor.
	instanceMatrix = mult(instanceMatrix,scale( D, L, D ));
	
	gl.uniformMatrix4fv(modelViewMatrixLoc,false,flatten(instanceMatrix));
	gl.uniformMatrix3fv(normalMatrixLoc,false,flatten(normalFromModel(instanceMatrix)));
	
	gl.drawArrays( gl.TRIANGLES, getInd("CONE"), getNPts("CONE"));
	
	for (var k=0;k < 3;k++)
	{
		instanceMatrix = mult(modelViewMatrix,translate(x+(D+d)*cos(2*PI*k/3+PI/3), y, z+(D+d)*sin(2*PI*k/3+PI/3)));
		instanceMatrix = mult(instanceMatrix,rotate(180,[1.0,0.0,0.0]));
		instanceMatrix = mult(instanceMatrix,scale( d, l, d ));
		
		gl.uniformMatrix4fv(modelViewMatrixLoc,false,flatten(instanceMatrix));
		gl.uniformMatrix3fv(normalMatrixLoc,false,flatten(normalFromModel(instanceMatrix)));
		
		gl.drawArrays( gl.TRIANGLES, getInd("CONE"), getNPts("CONE"));
	}
	/*
	var dust_clr = [
		vec4( 0.4,0.4,0.4,1.0 ), //Ambient
		vec4( 0.0,0.0,0.0,1.0 ), //Diffuse
		vec4( 0.0,0.0,0.0,1.0 )  //Specular
	];
	gl.uniform4fv(vAmbLoc,flatten(mult(dust_clr[0],light[0])));
	gl.uniform4fv(vDifLoc,flatten(mult(dust_clr[1],light[1])));
	gl.uniform4fv(vSpcLoc,flatten(mult(dust_clr[2],light[2])));
	
	//Moves the sphere to its position in space.
	var instanceMatrix = mult(modelViewMatrix,translate(x, y-1, z));
	//Scales the sphere by the current scale factor.
	instanceMatrix = mult(instanceMatrix,scale( 0.1,0.1,0.1 ));
	
	gl.uniformMatrix4fv(modelViewMatrixLoc,false,flatten(instanceMatrix));
	gl.uniformMatrix3fv(normalMatrixLoc,false,flatten(normalFromModel(instanceMatrix)));
	
	gl.drawArrays( gl.TRIANGLES, getInd("SMOKE"), getNPts("SMOKE"));*/
}

function drawGround()
{
	//Moves the sphere to its position in space.
	var instanceMatrix = mult(modelViewMatrix,translate(0, -5.5, 0));
	//Scales the sphere by the current scale factor.
	instanceMatrix = mult(instanceMatrix,scale( 10.0, 1.0, 10.0));
	
	var clr = GRND_CLR;
	
	gl.uniform4fv(vAmbLoc,flatten(mult(clr[0],light[0])));
	gl.uniform4fv(vDifLoc,flatten(mult(clr[1],light[1])));
	gl.uniform4fv(vSpcLoc,flatten(mult(clr[2],light[2])));
	
	gl.uniformMatrix4fv(modelViewMatrixLoc,false,flatten(instanceMatrix));
	gl.uniformMatrix3fv(normalMatrixLoc,false,flatten(normalFromModel(instanceMatrix)));
	
	gl.uniform1i(vProjectionTypeLoc, PERSP);
	
	gl.drawArrays( gl.TRIANGLES, getInd("GROUND"), getNPts("GROUND"));
}

// END OF DRAW FUNCTIONS
///////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////

var firing = false;
var fire_timer = 4.0;
// This function can be used to update the window as time passes
function step_time(dT)
{
	prev_time += dT;
	
	if (firing)
	{
		vel += acc*dT;
		fire_timer -= dT;
		if (fire_timer <= 0.0)
			firing = false;
	}
	alt += vel*dT;
	//if (vel > 0.0)
	//	vel -= vel*vel/500;
}

var acc = 20.0;
var vel = 0.0;
var alt = 0.0;
var prev_time = 0.0;
//Prepares the camera transformation matrix, calls all the "draw" functions,
// and renders the frame.
function render(cur_time) 
{
	//Clears color and depth (z- ) buffers
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

	//Animates the cubes and texture maps
	step_time((cur_time-prev_time)/1000);
	prev_time = cur_time;
	
	//Sets up the model-view matrix for the camera
	eyeAtUp();
	modelViewMatrix = lookAt(getEye(),getAt(),getUp());
	
	//Send Lighting Data
	//gl.uniformMatrix4fv(lightingMatrixLoc, false, flatten(modelViewMatrix));
	// (A lighting matrix is necessary only if the lights are not in the same
	//  reference frame as the geometry. A light fixed to the viewer's location,
	//  for example, would not be transformed (multiplied) by the modelViewMatrix.)
	gl.uniform4fv(vLightPosLoc,mult(modelViewMatrix,lightPos));
	
	gl.uniform1i(fTexLoc,-1);
	
	//Draws the geometry
	drawRocket(8, 1.0, 2.0, 3.0+alt, 0.0, 2.5);
	drawSphere(lightPos[0], lightPos[1], lightPos[2]);
	drawSphere(0.0, 0.0, -2.0);
	drawAxes();
	drawCube(-2.0,3.0,0.0);
	//drawGround();
	//drawLine(0.0,0.0,0.0);
	
	//Renders the frame
	window.requestAnimFrame(render);
}
