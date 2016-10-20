# KMarkAero-3D_Rocket

Rocket Viewer
------------

v0.0: Code from CS-174A Assignment 3

v0.1: Can generate a rough rocket shape (cylinder, cone, fins)
	- Uses flat shading with framework for smooth shadings
	BUGS: Normals are not handled correctly, resulting in problems
	shading certain surfaces
	
v0.2: Partial implementation of polygon data structure

v0.5: Initial kinks ironed out- foundation mostly complete
	- Operational implementation of polygon data structure (may
	  add a way to traverse facets around each vertex in the future)
	- Geometry/polygon generation is now well organized
	- Normal vectors are generated automatically from polygon data
	- Normal vectors are transformed properly even with non-uniform 
	  scaling
	  
v0.5.1: Removed unnecessary files from directory, updated readme

v0.5.2: General cleanup
	- Added comments to viewer.js
	- Reorganized code in viewer.js
	- Moved modelView calculation to camera.js
	
v0.6: Added TAMS
	- Next: Will look into particles or similar for exhaust, and skyboxes

v0.6.1: More geometry, new projection option
	- Added ground 
	- Added orthogonal projection matrix
		(Efficiency wise, need to check if better to pass both at beginning and select one vs
		 only ever passing one, but doing it for every structure)
		 
v0.6.3: Added "flame exhaust" and put on timer
	- The rocket "fires" from t = 2.0 s to t = 6.0 s
	
v0.7: Added launch button and animation
	- The launch button triggers the flame and motion

Development and testing done on a Windows 10 PC with Edge.
