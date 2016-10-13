var PI = 3.14159;
var sin = Math.sin;
var cos = Math.cos;

var gl;

var BODY_CLR = [
	vec4( 0.0,0.6,0.4,1.0 ), //Ambient
	vec4( 0.0,0.6,0.4,1.0 ), //Diffuse
	vec4( 0.0,0.1,0.05,1.0 )  //Specular
];

var theta = [0.0, 0.0];

var index = [];
var polygons = [];

//Projection matrix data
var near = 0.3;
var far = 250.0;
var fovy = 45.0;
var dfov = 5.0;
var aspectRatio;

//Lighting Data
var lightPos = vec4(-6.0, 4.0, 0.0, 1.0);
var light = [
	vec4( 1.0,1.0,1.0,1.0 ),
	vec4( 1.0,0.9,0.9,1.0 ),
	vec4( 1.0,0.9,0.9,1.0 )
];

//Data which will be passed to the shaders
var vLightPosLoc, vShadingTypeLoc, fShadingTypeLoc;
var vAmbLoc, vDifLoc, vSpcLoc;
var fAmbLoc, fDifLoc, fSpcLoc;
var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc, normalMatrixLoc, lightingMatrixLoc;
var FLAT = 0, GOURAUD = 1, PHONG = 2;

//Initializes WebGL, sets up buffers and uniform variables.
window.onload = function init()
{
    var canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //Configure WebGL
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.0, 0.8, 1.0, 1.0 );
	
	//Activate z-buffer
	gl.enable( gl.DEPTH_TEST );
	
	aspectRatio = canvas.width/canvas.height;

    //Load shaders
    
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
	
	//Prepare vertices
	/*index = [
		geoCyl(),
		geoSphere(4,false)
	];
	geoLine();*/
	polygons.push(new triangle(vec4(0.0,0.0,0.0,1.0),vec4(0.0,1.0,0.0,1.0),vec4(1.0,0.0,0.0,1.0)));
	polygons.push(new triangle(vec4(0.0,0.0,0.0,1.0),vec4(0.0,0.0,1.0,1.0),vec4(0.0,1.0,0.0,1.0)));
	polygons.push(new triangle(vec4(0.0,0.0,1.0,1.0),vec4(1.0,0.0,0.0,1.0),vec4(0.0,1.0,0.0,1.0)));
	polygons.push(new triangle(vec4(0.0,0.0,0.0,1.0),vec4(1.0,0.0,0.0,1.0),vec4(0.0,0.0,1.0,1.0)));

	var genResult = gen_pts_norms(polygons);
	points = genResult[0];
	normals = genResult[1];
	
	for (var k=3;k < 6;k++)
		polygons.push(new line(points[k],add(points[k],normals[k])));
	
	genResult = gen_pts_norms(polygons);
	points = genResult[0];
	normals = genResult[1];
	
    var nBuffer = gl.createBuffer();
	gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer );
	gl.bufferData( gl.ARRAY_BUFFER, flatten(getNormals()), gl.STATIC_DRAW );
	
	var vNorm = gl.getAttribLocation( program, "vNorm" );
	gl.vertexAttribPointer( vNorm, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNorm );
	
	//Load the vertex and normal data into the GPU
    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(getPoints()), gl.STATIC_DRAW );
	
    //Associate shader variables with the data buffers
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
	
	//Get location of uniform variables
	modelViewMatrixLoc = getULoc( program, "modelViewMatrix" );
	projectionMatrixLoc = getULoc(program, "projectionMatrix");
	lightingMatrixLoc = getULoc( program, "lightingMatrix" );
	vLightPosLoc = getULoc(program, "vLightPos");
	vAmbLoc = getULoc(program, "vAmb");
	fAmbLoc = getULoc(program, "fAmb");
	vDifLoc = getULoc(program, "vDif");
	fDifLoc = getULoc(program, "fDif");
	vSpcLoc = getULoc(program, "vSpc");
	fSpcLoc = getULoc(program, "fSpc");
	vShadingTypeLoc = getULoc(program, "vShadingType");
	fShadingTypeLoc = getULoc(program, "fShadingType");
	
	//Calculate and send projection matrix
	projectionMatrix = perspective(fovy,aspectRatio,near,far);
	gl.uniformMatrix4fv(projectionMatrixLoc,false,flatten(projectionMatrix)); 
	
	//Render the first frame
    window.requestAnimFrame(render);
};

function getULoc(program, varName)
{
	return gl.getUniformLocation(program, varName)
}

//
function step_time(dT)
{

}

//Sends the matrix and texture map
// information down the pipeline.
function drawCyl(x, y, z)
{
	//Moves the cyl to its position in space.
	var instanceMatrix = mult(modelViewMatrix,translate(x, y, z));
	//Rotates the cyl by the proper amount.
	instanceMatrix = mult(instanceMatrix,rotate(90,[1.0,0.0,0.0]));
	//Scales the cube by the current scale factor.
	instanceMatrix = mult(instanceMatrix,scale( 1.0, 1.0, 6.0));
	
	var clr = BODY_CLR;
	
	//Sends the transformation matrix to the shaders.
	gl.uniform4fv(vAmbLoc,flatten(mult(clr[0],light[0])));
	gl.uniform4fv(vDifLoc,flatten(mult(clr[1],light[1])));
	gl.uniform4fv(vSpcLoc,flatten(mult(clr[2],light[2])));
	gl.uniformMatrix4fv(modelViewMatrixLoc,false,flatten(instanceMatrix));
	
	shading = FLAT;
	
	gl.uniform1i(vShadingTypeLoc, shading);
	gl.uniform1i(fShadingTypeLoc, shading);
	gl.drawArrays( gl.TRIANGLES, 0, index[0]);
}

function drawLine(x, y, z)
{
	//Moves the line to its position in space.
	var instanceMatrix = mult(modelViewMatrix,translate(x, y, z));
	//Rotates the line by the proper amount.
	instanceMatrix = mult(instanceMatrix,rotate(90,[1.0,0.0,0.0]));
	//Scales the line by the current scale factor.
	instanceMatrix = mult(instanceMatrix,scale( 1.0, 1.0, 6.0));
	
	var clr = [
		vec4(1.0,1.0,1.0,1.0),
		vec4(1.0,1.0,1.0,1.0),
		vec4(1.0,1.0,1.0,1.0)
	];
	
	//Sends the transformation matrix to the shaders.
	gl.uniform4fv(vAmbLoc,flatten(mult(clr[0],light[0])));
	gl.uniform4fv(vDifLoc,flatten(mult(clr[1],light[1])));
	gl.uniform4fv(vSpcLoc,flatten(mult(clr[2],light[2])));
	gl.uniformMatrix4fv(modelViewMatrixLoc,false,flatten(instanceMatrix));
	
	shading = FLAT;
	
	gl.uniform1i(vShadingTypeLoc, shading);
	gl.uniform1i(fShadingTypeLoc, shading);
	gl.drawArrays( gl.LINES, 12, 6);
}

function drawSphere()
{
	//Moves the sphere to its position in space.
	var instanceMatrix = mult(modelViewMatrix,translate(lightPos[0], lightPos[1], lightPos[2]));
	//Scales the sphere by the current scale factor.
	instanceMatrix = mult(instanceMatrix,scale( 1.0, 1.0, 1.0));
	
	gl.uniform4fv(vAmbLoc,flatten(mult(vec4(0.5, 0.5, 0.5, 1.0),vec4(1.0,1.0,1.0,1.0))));
	gl.uniform4fv(vDifLoc,[0.0,0.0,0.0,1.0]);
	gl.uniform4fv(vSpcLoc,[0.0,0.0,0.0,1.0]);
	
	gl.uniformMatrix4fv(modelViewMatrixLoc,false,flatten(instanceMatrix));
	
	gl.uniform1i(vShadingTypeLoc, shading);
	gl.uniform1i(fShadingTypeLoc, shading);
	gl.drawArrays( gl.TRIANGLES, index[0], index[1]);
}

function drawTri()
{
	//Moves the cyl to its position in space.
	var instanceMatrix = mult(modelViewMatrix,translate(0.0,0.0,0.0));
	//Rotates the cyl by the proper amount.
	instanceMatrix = mult(instanceMatrix,rotate(90,[1.0,0.0,0.0]));
	//Scales the cube by the current scale factor.
	//instanceMatrix = mult(instanceMatrix,scale( 1.0, 1.0, 6.0));

	//polygons = pmult(scale( 1.0, 1.0, 6.0),polygons,0,4);
	//var genResult = gen_pts_norms(polygons);
	//points = genResult[0];
	//normals = genResult[1];
	
	var clr = BODY_CLR;
	
	//Sends the transformation matrix to the shaders.
	gl.uniform4fv(vAmbLoc,flatten(mult(clr[0],light[0])));
	gl.uniform4fv(vDifLoc,flatten(mult(clr[1],light[1])));
	gl.uniform4fv(vSpcLoc,flatten(mult(clr[2],light[2])));
	gl.uniformMatrix4fv(modelViewMatrixLoc,false,flatten(instanceMatrix));
	
	shading = FLAT;
	
	gl.uniform1i(vShadingTypeLoc, shading);
	gl.uniform1i(fShadingTypeLoc, shading);
	gl.drawArrays( gl.TRIANGLES, 0, 12);
}

var prev_time = 0.0;
//Prepares the camera transformation matrix, calls all the "draw" functions,
// and renders the frame.
function render(cur_time) 
{
	//Clears color and depth (z- ) buffers
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

	//Animates the cubes and texture maps
	//step_time((cur_time-prev_time)/1000);
	//prev_time = cur_time;
	
	//Sets up the model-view matrix for the camera
	setEye(vec3(getCamR()*sin(getCamTh())*sin(getCamPh()),getCamR()*cos(getCamTh()),getCamR()*sin(getCamTh())*cos(getCamPh())));
	var uTh = getCamTh()-getFlip()*PI/2;
	var uPh = getCamPh();
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
	setUp(vec3(sin(uTh)*sin(uPh),cos(uTh),sin(uTh)*cos(uPh)));
	modelViewMatrix = lookAt(getEye(),getAt(),getUp());
	
	//Send Lighting Data
	gl.uniformMatrix4fv(lightingMatrixLoc, false, flatten(modelViewMatrix));
	gl.uniform4fv(vLightPosLoc,lightPos);
	
	//Draws the cyl
	//drawCyl(0.0, 0.0, 0.0);
	//drawSphere();
	drawLine(0.0,0.0,0.0);
	drawTri();
	
	//Renders the frame
	window.requestAnimFrame(render);
}
