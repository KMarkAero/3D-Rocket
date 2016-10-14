function triangle(p1,p2,p3)
{
	this.p = [p1, p2, p3];
	this.polyLen = 3;
	return 3;
}

function line(p1,p2)
{
	this.p = [p1, p2];
	this.polyLen = 2;
	return 2;
}

function get_nPts(polygons)
{
	var cntr = 0;
	for (var k=0;k < polygons.length;k++)
		cntr += polygons[k].polyLen;
	return cntr;
}

function gen_pts_norms(polys)
{
	var plen = polys.length;
	var points = [];
	var normals = [];
	for (var k=0;k < plen;k++)
	{
		var cur = polys[k];
		if (cur.polyLen == 2)
		{
			points.push(cur.p[0],cur.p[1]);
			normals.push(vec4(1.0,0.0,0.0,0.0));
			normals.push(vec4(1.0,0.0,0.0,0.0));
		}
		else if (cur.polyLen == 3)
		{
			points.push(cur.p[0]);
			points.push(cur.p[1]);
			points.push(cur.p[2]);
			var nrm = cross(subtract(cur.p[2],cur.p[0]),subtract(cur.p[1],cur.p[0]));
			nrm = vec4(normalize(nrm));
			nrm[3] = 0.0;
			normals.push(nrm,nrm,nrm);
		}
		else
			throw "gen_pts_norms(polys): polygons may not have more than 3 points"
	}
	return [points,normals];
}

/*var out_cntr = 0;
			if (out_cntr == 1)
			{
				console.log(cur.p[0]);
				console.log(cur.p[1]);
				console.log(cur.p[2]);
				console.log(subtract(cur.p[1],cur.p[0]));
				console.log(subtract(cur.p[2],cur.p[0]));
				console.log(nrm);
				console.log(vec4(normalize(nrm)));
			}
			out_cntr++;
			*/