function geoCyl(nPanels)
{
	var polygons = [];
	for (var k=0;k < nPanels;k++)
	{
		var x = cos(2*PI*k/nPanels)/2;
		var xx = cos(2*PI*(k+1)/nPanels)/2;
		var z = sin(2*PI*k/nPanels)/2;
		var zz = sin(2*PI*(k+1)/nPanels)/2;
		var a = vec4(x,0.0,z,1.0);
		var b = vec4(x,-1.0,z,1.0);
		var c = vec4(xx,0.0,zz,1.0);
		var d = vec4(xx,-1.0,zz,1.0);
		polygons = polygons.concat([new triangle(a,b,c), new triangle(c,b,d)]);
	}
	return polygons;
}

function geoCone(nPanels)
{
	var polygons = [];
	for (var k=0;k < nPanels;k++)
	{
		var x = cos(2*PI*k/nPanels)/2;
		var xx = cos(2*PI*(k+1)/nPanels)/2;
		var z = sin(2*PI*k/nPanels)/2;
		var zz = sin(2*PI*(k+1)/nPanels)/2;
		var a = vec4(xx,0.0,zz,1.0);
		var b = vec4(0.0,1.0,0.0,1.0);
		var c = vec4(x,0.0,z,1.0);
		polygons = polygons.concat(new triangle(a,b,c));
	}
	return polygons;
}

function geoFin(chord,span,thickness)
{
	var polygons = [];
	//Leading Edge
	var le1 = vec4(0.0,0.0,thickness/2,1.0);
	var le2 = vec4(0.0,0.0,-thickness/2,1.0);
	var le3 = vec4(span,-chord,-thickness/2,1.0);
	var le4 = vec4(span,-chord,thickness/2,1.0);
	
	//Trailing Edge
	var te1 = vec4(0.0,-chord,-thickness/2,1.0);
	var te2 = vec4(0.0,-chord,thickness/2,1.0);
	var te3 = vec4(span,-chord,thickness/2,1.0);
	var te4 = vec4(span,-chord,-thickness/2,1.0);
	
	//Main Surfaces
	var sa1 = vec4(0.0,0.0,thickness/2,1.0);
	var sa2 = vec4(span,-chord,thickness/2,1.0);
	var sa3 = vec4(0.0,-chord,thickness/2,1.0);
	var sb1 = vec4(0.0,0.0,-thickness/2,1.0);
	var sb2 = vec4(0.0,-chord,-thickness/2,1.0);
	var sb3 = vec4(span,-chord,-thickness/2,1.0);
	
	return [
		new triangle(le1,le2,le3),
		new triangle(le1,le3,le4),
		new triangle(te1,te2,te3),
		new triangle(te1,te3,te4),
		new triangle(sa1,sa2,sa3),
		new triangle(sb1,sb2,sb3)
	];
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

function divTri(a, b, c, count)
{
	var polygons = [];
	if (count > 0)
	{
		var ab = normalize(mix(a, b, 0.5), true);
		var ac = normalize(mix(a, c, 0.5), true);
		var bc = normalize(mix(b, c, 0.5), true);
		
		polygons = polygons.concat(divTri(a, ab, ac, count - 1));
		polygons = polygons.concat(divTri(ab, b, bc, count - 1));
		polygons = polygons.concat(divTri(bc, c, ac, count - 1));
		polygons = polygons.concat(divTri(ab, bc, ac, count - 1));
		return polygons;
	}
	else
		return new triangle(a, b, c);
}

function geoSphere(subdivisions)
{
	var polygons = [];
	
	var va = vec4(0.0, 0.0, -1.0, 1);
	var vb = vec4(0.0, 0.942809, 0.333333, 1);
	var vc = vec4(-0.816497, -0.471405, 0.333333, 1);
	var vd = vec4(0.816497, -0.471405, 0.333333, 1);

	polygons = polygons.concat(divTri(va, vb, vc, subdivisions));
	polygons = polygons.concat(divTri(vd, vc, vb, subdivisions));
	polygons = polygons.concat(divTri(va, vd, vb, subdivisions));
	polygons = polygons.concat(divTri(va, vc, vd, subdivisions));
	return polygons;
}

