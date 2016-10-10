//Per texture data
var fTexName = ["texture0", "texture1"];
var MIPMAP = 0, NRSNBR = 1;
var imgFilter = [NRSNBR, MIPMAP];

//Creates a texture map from an image
function texConfig(image, imgID, program)
{
    var tex = gl.createTexture();
	gl.activeTexture(gl.TEXTURE0+imgID);
    gl.bindTexture(gl.TEXTURE_2D, tex);
	
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
	
	//Apply the proper filtering
	if (imgFilter[imgID] == MIPMAP)
	{
		gl.generateMipmap(gl.TEXTURE_2D);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, 
						gl.LINEAR_MIPMAP_LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	}
	else
	{
	    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	}
    
    gl.uniform1i(gl.getUniformLocation(program, fTexName[imgID]), imgID);
	
}

