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

function count_nPts(polygons)
{
	var cntr = 0;
	for (var k=0;k < polygons.length;k++)
		cntr += polygons[k].polyLen;
	return cntr;
}

function gen_pts_norms()
{
	var polys = getPolys();
	var points = [];
	var normals = [];
	for (var k=0;k < polys.length;k++)
	{
		var cur = polys[k];
		if (cur.polyLen == 2)
		{
			points.push(cur.p[0],cur.p[1]);
			normals.push(vec4(0.0,0.0,0.0,0.0));
			normals.push(vec4(0.0,0.0,0.0,0.0));
		}
		else if (cur.polyLen == 3)
		{
			points.push(cur.p[0]);
			points.push(cur.p[1]);
			points.push(cur.p[2]);
			var nrm = cross(subtract(cur.p[1],cur.p[0]),subtract(cur.p[2],cur.p[0]));
			nrm = vec4(normalize(nrm));
			nrm[3] = 0.0;
			normals.push(nrm,nrm,nrm);
		}
		else
			throw "gen_pts_norms(): polygons may not have more than 3 points"
	}
	return [points,normals];
}

var objects = [];
function obj(polygons, identifier, pts_index)
{
	this.id = identifier;
	this.poly = polygons;
	this.nPts = count_nPts(polygons);
	this.index = pts_index;
}

//Get the object index from its string identifier
//  If the identifier does not exist, return -1
function IDtoInd(ID)
{
	for (var k=0;k < objects.length;k++)
	{
		if (ID == objects[k].id)
			return k;
	}
	return -1;
}

function getNPts(ID) { return objects[IDtoInd(ID)].nPts; }
function getInd(ID) { return objects[IDtoInd(ID)].index; }

function addGeo(geometry, identifier)
{
	if (IDtoInd(identifier) != -1)
		throw "addGeo(): cannot add because identifier already exists";
	
	var ind = 0;
	if (objects.length != 0)
		ind = objects[objects.length-1].index + objects[objects.length-1].nPts;
	
	objects.push(new obj(geometry, identifier, ind));
}

function getPolys()
{
	var polys = [];
	for (var k=0;k < objects.length;k++)
		polys = polys.concat(objects[k].poly);

	return polys;
}