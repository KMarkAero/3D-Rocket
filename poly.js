function triangle(p1,p2,p3)
{
	this.p = [p1, p2, p3];
	this.length = triLen;
}

function triLen()
{
	return 3
}

function line(p1,p2)
{
	this.p = [p1, p2];
	this.length = lineLen;
}

function lineLen()
{
	return 2;
}

function gen_pts_norms(polys)
{
	var plen = polys.length;
	var points = [];
	var normals = [];
	for (var k=0;k < plen;k++)
	{
		var cur = polys[k];
		if (cur.length() == 2)
		{
			points.push(cur.p[0],cur.p[1]);
			normals.push(vec4(1.0,0.0,0.0,0.0));
			normals.push(vec4(1.0,0.0,0.0,0.0));
		}
		else if (cur.length() == 3)
		{
			points.push(cur.p[0]);
			points.push(cur.p[1]);
			points.push(cur.p[2]);
			var nrm = cross(subtract(cur.p[1],cur.p[0]),subtract(cur.p[2],cur.p[0]));
			nrm = vec4(normalize(nrm));
			normals.push(nrm,nrm,nrm);
		}
		else
			throw "gen_pts_norms(polys): polygons may not have more than 3 points"
	}
	return [points,normals];
}

function pmult(scaleMat,polys,index,count)
{
	for (var k=index;k < index+count;k++)
	{
		for (var n=1;n < polys[k][0];n++)
			polys[k][n] = mult(scaleMat,polys[k][n]);
	}
}

function mat_mult(mat,vec)
{
	
}