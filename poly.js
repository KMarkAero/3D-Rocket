var polygons = [];

function poly()
{
	var pts = _argumentsToArray( arguments );
	
	if (pts.length < 2)
		throw "poly(): Polygons must contain at least 2 points"
	
	var result = [pts.length];
	for (var k=0;k < pts.length;k++)
		result.push(pts[k]);
	return result;
}