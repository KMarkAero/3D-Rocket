//The arrays to be rendered
var points = [];
var normals = [];

function getPoints()
{
	return points;
}

function getNormals()
{
	return normals;
}

var cyl_vert = [ ];
var nCylPts = 16;
for (var k=0;k < nCylPts*2;k+=2)
{
	ptx = sin(k*PI/nCylPts);
	pty = cos(k*PI/nCylPts);
	cyl_vert[k] = vec4( ptx, pty, -0.5, 1.0 );
	cyl_vert[k+1] = vec4( ptx, pty, 0.5, 1.0 );
}

//Populate the points and normals arrays
function quad(a, b, c, d)
{
    points.push(a); 
	normals.push(vec4(a[0],a[1],0,0));
    points.push(b); 
	normals.push(vec4(b[0],b[1],0,0));
    points.push(c); 
	normals.push(vec4(c[0],c[1],0,0));
    points.push(a); 
	normals.push(vec4(a[0],a[1],0,0));
	points.push(c); 
	normals.push(vec4(c[0],c[1],0,0));
    points.push(d); 
	normals.push(vec4(d[0],d[1],0,0));
}

function geoFins()
{
	var cntr = 0;
	for (var k=0;k < 3;k++)
	{
		var a = vec4( cos(k*2*PI/3), sin(k*2*PI/3), 0.5, 1.0 )
		var b = vec4( 2*cos(k*2*PI/3), 2*sin(k*2*PI/3), 0.5, 1.0 )
		var c = vec4( cos(k*2*PI/3), sin(k*2*PI/3), 0.15, 1.0 )
		points.push(a);
		points.push(b);
		points.push(c);
		points.push(a);
		points.push(b);
		points.push(c);
		var nrm = vec4(normalize(cross(subtract(b,a),subtract(c,a))));
		nrm[3] = 0.0;
		normals.push(nrm);
		normals.push(nrm);
		normals.push(nrm);
		nrm = vec4(-nrm[0],-nrm[1],-nrm[2],0.0);
		normals.push(nrm);
		normals.push(nrm);
		normals.push(nrm);
		cntr += 6;
	}
	return cntr;
}

var linePts = [];

function geoLine()
{
	for (var k=0;k < 12;k++)
	{
		points.push(linePts[k]);
		normals.push(vec4(1.0,0.0,0.0,0.0));
	}
}

//Generate cylinder
function geoCyl()
{
	var cntr = 0;
	for (var k=0;k < nCylPts*2-2;k += 2)
	{
		quad( cyl_vert[k+3], cyl_vert[k+1], cyl_vert[k], cyl_vert[k+2] )
		cntr += 6;
		//Generate a Nose Cone Panel
		var a = cyl_vert[k];
		var b = vec4(0.0,0.0,-1.0,1.0);
		var c = cyl_vert[k+2];
		points.push(a);
		points.push(b);
		points.push(c);
		var nrm = vec4(normalize(cross(subtract(c,a),subtract(b,a))));
		nrm[3] = 0.0;
		normals.push(nrm);
		normals.push(nrm);
		normals.push(nrm);
		cntr += 3;
	}
	quad( cyl_vert[1], cyl_vert[nCylPts*2-1], cyl_vert[nCylPts*2-2], cyl_vert[0] )
	var a = cyl_vert[nCylPts*2-2];
	var b = vec4(0.0,0.0,-1.0,1.0);
	var c = cyl_vert[0];
	points.push(a);
	points.push(b);
	points.push(c);
	
	var nrm = vec4(normalize(cross(subtract(c,a),subtract(b,a))));
	nrm[3] = 0.0;
	normals.push(nrm);
	normals.push(nrm);
	normals.push(nrm);
	cntr += 9;
	linePts.push(a,b,b,c,c,a);
	linePts.push(a,add(a,nrm));
	linePts.push(b,add(b,nrm));
	linePts.push(c,add(c,nrm));
	
	return cntr + geoFins();
}

function triangle(a, b, c, smooth_normals)
{
	var n = normalize(cross(subtract(c,a), subtract(b,a)));
	n = vec4(n,0.0);
	
	points.push(a);
	points.push(b);
	points.push(c);
	
	if (smooth_normals)
	{
		normals.push(vec4(a[0],a[1],a[2],0.0));
		normals.push(vec4(b[0],b[1],b[2],0.0));
		normals.push(vec4(c[0],c[1],c[2],0.0));
	}
	else
	{
		for(var k=0;k < 3;k++)
			normals.push(n);
	}

	return 3;
}

function avg(a, b, c)
{
	if (a.length != b.length || b.length != c.length)
		return;
	var x = (a[0]+b[0]+c[0])/3;
	var y = (a[1]+b[1]+c[1])/3;
	var z = (a[2]+b[2]+c[2])/3;
	if (a.length == 4)
	{
		var w = (a[3]+b[3]+c[3])/3;
		return vec4(x,y,z,w);
	}
	return vec3(x,y,z);
}

function divTri(a, b, c, count, smooth_normals)
{
	if (count > 0)
	{
		var ab = normalize(mix(a, b, 0.5), true);
		var ac = normalize(mix(a, c, 0.5), true);
		var bc = normalize(mix(b, c, 0.5), true);
		var cntr = 0;
		
		cntr += divTri(a, ab, ac, count - 1, smooth_normals);
		cntr += divTri(ab, b, bc, count - 1, smooth_normals);
		cntr += divTri(bc, c, ac, count - 1, smooth_normals);
		cntr += divTri(ab, bc, ac, count - 1, smooth_normals);
		return cntr;
	}
	else
		return triangle(a, b, c, smooth_normals);
}

function geoSphere(subdivisions, smooth_normals)
{
	var va = vec4(0.0, 0.0, -1.0, 1);
	var vb = vec4(0.0, 0.942809, 0.333333, 1);
	var vc = vec4(-0.816497, -0.471405, 0.333333, 1);
	var vd = vec4(0.816497, -0.471405, 0.333333, 1);
	var cntr = 0;

	cntr += divTri(va, vb, vc, subdivisions, smooth_normals);
	cntr += divTri(vd, vc, vb, subdivisions, smooth_normals);
	cntr += divTri(va, vd, vb, subdivisions, smooth_normals);
	cntr += divTri(va, vc, vd, subdivisions, smooth_normals);
	return cntr;
}
