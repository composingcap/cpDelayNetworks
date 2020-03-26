outlets = 5;
var meshType= "cartesian";
var length = 0;
var width = 0;
var out = 0;
var around = 0;
var delaysByJunction; 
var walls = 0;
var coefs = [];
var innerDelays;
var outDelays;
var aroundDelays;

var lengthOffset;
var jDelays;
var jDelayOffset;
var cartMeshMode = "new";
var xDelayLines;
var yDelayLines;

 
function makeCartMesh(l, w){
	outlet(2,"clearInfo");
	meshType= "cartesian";
	length = l;
	width = w;

	//Deternine number of delay lines and scattering junctions
	var perimeter = (length+width)*2
	innerDelays = 2*(2*width*length-width-length);
	
	outlet(1, ["nDelays", innerDelays + perimeter]);
	outlet(1, ["nJunctions", length*width]); 
	outlet(1, ["nWalls", perimeter]);
	outlet(1, ["meshMode", meshType]);
	outlet(1, ["dimentions", length, width]);
	outlet(1, "go");
	walls = perimeter;
	setTimeout(setCartMeshCoef,50);

	}
	function setCartMeshCoef(){
	var xDelays = (length-1)*width;
	var yDelays = (width-1)*length;
	coefs = [];
	for(var y =0; y < width; y++){
		for(var x=0; x<length; x++){
			var i = x+y*length;
			var xAddress = x + y*(length-1);
			var yAddress = 2*xDelays + y + x* (width - 1);
			//ordering innerLeft, innerRight, innterTop, innerBottom
			//leftWallIn, leftWallOut, ect...
			var delayReads = [0,0,0,0];
			var delayWrites = [0,0,0,0];
			
			//Left and Right
			
			if (x == 0){
				//Walls read and write from the same delay
				delayReads[0] = innerDelays + y;
				delayWrites[0] = xAddress; //Write to the right	
				
				delayReads[1] = xDelays + xAddress;
				delayWrites[1] = innerDelays + y;
				
				
				}
				
			else if (x == length-1){
				delayReads[0] = xAddress - 1;
				delayWrites[0] = innerDelays  + y + width; //Right Wall
				
				delayReads[1] = innerDelays + y + width;
				delayWrites[1] = xDelays + xAddress - 1;				
				}
				
				
			else{
				//Other delays read and write to oppisite sides
				delayReads[0] = xAddress - 1;
				delayWrites[0] = xAddress;
				
				delayReads[1] = xDelays + xAddress;
				delayWrites[1] = xDelays + xAddress - 1;
				}
				
			if (y ==0){
				
				delayReads[2] = innerDelays + x + width*2 + length;
				delayWrites[2] = yAddress;
				
				delayReads[3] = yAddress + yDelays;
				delayWrites[3] = innerDelays + x + width*2 + length;
				
				}
				
			else if (y == width-1){
				delayReads[2] = yAddress-1;
				delayWrites[2] = innerDelays + x + width*2;
				
				delayReads[3] = innerDelays + x + width*2;
				delayWrites[3] = yAddress + yDelays;
				
				}
			
			else{
				
				delayReads[2] = yAddress-1;
				delayWrites[2] = yAddress;
				
				delayReads[3] = yAddress+ yDelays;
				delayWrites[3] = yAddress - 1 + yDelays;
				
				}
				
			
			setA4(i, delayReads[0],delayReads[1],delayReads[2],delayReads[3], 0.5);
			

			coefs.push(["flip", delayReads[0], delayWrites[0], 1]);
			coefs.push(["flip", delayReads[1], delayWrites[1], 1]);
			coefs.push(["flip", delayReads[2], delayWrites[2], 1]);
			coefs.push(["flip", delayReads[3], delayWrites[3], 1]);
			
			 
			
		}
		}
		
		
		
		cartMeshDt(50, 50, 100, 0.9, 1.1, 0.8, 1.2);
		sendCoefs();
		outlet(3, "bang");
		outlet(2,"getInfo");

	
	}
	
	
function setA4(junction, left, right, top, bottom, coef){
	
	coefs.push(["a", left, junction, coef]);
	coefs.push(["a", right, junction, coef]);
	coefs.push(["a", top, junction, coef]);
	coefs.push(["a", bottom, junction, coef]);
	}
	

function setCartMeshMode(mode){
	cartMeshMode = mode;
	}


function cartMeshDt(centerDelay, deviation, wallDelay, wallPosL, wallPosR, wallPosT, wallPosB){
	//Do inner delays...
	outlet(2, ["dyByJunction", "clear"])
	jDelays = Math.floor((2*width*length-width-length)/2);
	xDelayLines = (width-1)*length;
	yDelayLines = (length-1) * width;
	outlet(1, ["xDelayLines", xDelayLines]);
	outlet(1, ["yDelayLines", yDelayLines]);
	outlet(1, ["junctionDelays", xDelayLines+yDelayLines]);

	outlet(2, ["delayTimes", "clear"]);
	
	
	if (cartMeshMode === "old"){
		for (var i = 0; i < jDelays; i++){
		
		var deltaCenter = Math.abs(i-jDelays/2)/(jDelays/2);	
		
		var dt = centerDelay+deviation*deltaCenter;
		
		outlet(2, ["delayTimes", i, dt]);
		outlet(2, ["delayTimes", i+jDelays, dt]);
		outlet(2, ["delayTimes", i+jDelays*2, dt]);
		outlet(2, ["delayTimes", i+jDelays*3, dt]);
		dtByJunction("junction", i, dt);
		
		}
	jDelayOffset = jDelays*4;
	
	var dtL = wallDelay*wallPosL;
	var dtR = wallDelay*wallPosR;
	var dtT = wallDelay*wallPosT;
	var dtB = wallDelay*wallPosB;
	
	dtByJunction("wall", "left", dtL);
	dtByJunction("wall", "right", dtR);
	dtByJunction("wall", "top", dtT);
	dtByJunction("wall", "bottom", dtB);

	for (var i = jDelayOffset; i< jDelayOffset+length; i++){
		
		outlet(2, ["delayTimes", i, dtL]);
				
		
		outlet(2, ["delayTimes", i+length, dtR]);
		}
		lengthOffset = jDelayOffset+length*2;
	for (var i = lengthOffset ; i<lengthOffset+width; i++){
		
		
		outlet(2, ["delayTimes", i, dtT]);
		
		
		outlet(2, ["delayTimes", i+width, dtB]);
		
		}

		}
		
		else if (cartMeshMode === "new"){
			for (var i = 0; i < xDelayLines; i++){
		
				var deltaCenter = Math.abs(i-jDelays/2)/(jDelays/2);	
		
				var dt = centerDelay+deviation*deltaCenter;
		
				outlet(2, ["delayTimes", i, dt]);
				outlet(2, ["delayTimes", i+xDelayLines, dt]);
				dtByJunction("junction", i, dt);
		
		}
			for (var i=xDelayLines; i < xDelayLines+yDelayLines; i++){
				
				outlet(2, ["delayTimes", i, dt]);
				outlet(2, ["delayTimes", i+yDelayLines, dt]);
				dtByJunction("junction", i, dt);
				
				}
			jDelayOffset = (xDelayLines+yDelayLines)*2;
	
			var dtL = wallDelay*wallPosL;
			var dtR = wallDelay*wallPosR;
			var dtT = wallDelay*wallPosT;
			var dtB = wallDelay*wallPosB;
	
			dtByJunction("wall", "left", dtL);
			dtByJunction("wall", "right", dtR);
			dtByJunction("wall", "top", dtT);
			dtByJunction("wall", "bottom", dtB);

			for (var i = jDelayOffset; i< jDelayOffset+length; i++){
		
				outlet(2, ["delayTimes", i, dtL]);
				
		
				outlet(2, ["delayTimes", i+length, dtR]);
				}
				lengthOffset = jDelayOffset+length*2;
			for (var i = lengthOffset ; i<lengthOffset+width; i++){
		
		
				outlet(2, ["delayTimes", i, dtT]);
		
		
				outlet(2, ["delayTimes", i+width, dtB]);
		
				}
									
			}
			
	
		outlet(2, ["delayTimes", "sort", -1, -1]);
		outlet(2, ["delayTimes", "dump"]);
	
	
	}

function setDelayByJunction(){

	var args = arrayfromargs(arguments);
	
	var jToSet = Math.floor(args.length/3);
	//	post("number of junsctions to set... " + jToSet + "\n");
		
		for(m = 0; m < jToSet; m++){
			
			
			var type = args[0+m*3]
			var i = args[1+m*3];
			var dt = args[2+m*3];
			//post("mesh: "+ meshType+ " type: " + type +", i: " + i + ", dt: "+ dt +"\n"); 
	if(meshType === "cartesian"){
		

			

	
		//post(cartMeshMode + "\n");
		if(cartMeshMode == "old"){
		if (type == "junction"){
			dtByJunction("junction", i, dt);
			outlet(2, ["delayTimes", i, dt]);
			outlet(2, ["delayTimes", i+jDelays, dt]);
			outlet(2, ["delayTimes", i+jDelays*2, dt]);
			outlet(2, ["delayTimes", i+jDelays*3, dt]);
			
			
			}
		else if (type == "wall"){
			var side = i;
			if (side == "left"){
				dtByJunction("wall", "left", dt);
				for (var i = jDelayOffset; i< jDelayOffset+length; i++){
						outlet(2, ["delayTimes", i, dt]);
					}
				}
			else if (side == "right"){
				dtByJunction("wall", "right", dt);
				for (var i = jDelayOffset; i< jDelayOffset+length; i++){
						outlet(2, ["delayTimes", i+length, dt]);
					}
				}
			else if (side == "top"){
				dtByJunction("wall", "top", dt);
				for (var i = lengthOffset ; i<lengthOffset+width; i++){		
		
					outlet(2, ["delayTimes", i, dt]);
					}
				}
			else if (side == "bottom"){
				dtByJunction("wall", "bottom", dt);
				for (var i = lengthOffset ; i<lengthOffset+width; i++){		
		
					outlet(2, ["delayTimes", i+width, dt]);
					}
				}
			
			}
			}		
	else if (cartMeshMode == "new"){
			
			if (type == "junction"){
				if (i < xDelayLines){
					//post("junction "+ i + " is xLine \n");
				outlet(2, ["delayTimes", i, dt]);
				outlet(2, ["delayTimes", i+xDelayLines, dt]);
				dtByJunction("junction", i, dt);
				}
				else{
					//post("junction "+ i + " is yLine \n");
					outlet(2, ["delayTimes", i, dt]);
					outlet(2, ["delayTimes", i+yDelayLines, dt]);
					dtByJunction("junction", i, dt);
					}
				}
			else if (type == "wall"){
			var side = i;
			if (side == "left"){
				dtByJunction("wall", "left", dt);
				for (var i = jDelayOffset; i< jDelayOffset+length; i++){
						outlet(2, ["delayTimes", i, dt]);
					}
				}
			else if (side == "right"){
				dtByJunction("wall", "right", dt);
				for (var i = jDelayOffset; i< jDelayOffset+length; i++){
						outlet(2, ["delayTimes", i+length, dt]);
					}
				}
			else if (side == "top"){
				dtByJunction("wall", "top", dt);
				for (var i = lengthOffset ; i<lengthOffset+width; i++){		
		
					outlet(2, ["delayTimes", i, dt]);
					}
				}
			else if (side == "bottom"){
				dtByJunction("wall", "bottom", dt);
				for (var i = lengthOffset ; i<lengthOffset+width; i++){		
		
					outlet(2, ["delayTimes", i+width, dt]);
					}
				}
		
		}
	}
	}
	else if (meshType === "polar"){
		if (type == "junction"){	
			//post(outDelays +"\n");
	if (i < outDelays){
			outlet(2, ["delayTimes", i, dt]);
			outlet(2, ["delayTimes", i+outDelays, dt]);
			dtByJunction("junction", i, dt);
			}
	else{		
			outlet(2, ["delayTimes", i, dt]);
			outlet(2, ["delayTimes", i+aroundDelays, dt]);
			dtByJunction("junction", i, dt);	
			}
			}
	else if (type == "wall"){
		outlet(2, ["delayTimes", outDelays*2+aroundDelays*2+i, dt]);
		dtByJunction("wall", i, dt);
			}
		}
		

		}
	outlet(2, ["delayTimes", "sort", -1, -1]);
	outlet(2, ["delayTimes", "dump"]);
	outlet(2,"getInfo");
	
	}
	
function makePolarMesh(o, a){
	outlet(2,"clearInfo");
	meshType= "polar";
	out = o;
	around = a;
	//outlet(0, ["a", 'clear']);
	//outlet(0, ["flip", 'clear']);
	//Deternine number of delay lines and scattering junctions
	var nWalls = around;
	outDelays = around*out;
	aroundDelays = around*out;
	
	outlet(1, ["junctionDelays", around*out*2]);
	
	outlet(1, ["meshMode", meshType]);
	outlet(1, ["nDelays", nWalls + outDelays*2+aroundDelays*2]);
	outlet(1, ["nJunctions", 1+ out*around]); 
	outlet(1, ["nWalls", nWalls]);
	outlet(1, ["dimentions", out, around]);
	outlet(1, "go");
	walls = around; 
	
	setTimeout(setPolarMeshCoef, 50);
	}
	
	
	function setPolarMeshCoef(){
	coefs = [];

	//For the inner junction...
	for (var i = 0; i < around; i++){
		//outlet(0, ["a", around*2+i, 0, 1/around*2]);
		//outlet(0, ["flip", around*2+i, i, 1]);
		
		coefs.push(["a", around*2+i, 0, 1/around*2]);
		coefs.push(["flip", around*2+i, i, 1]);
	}
	
	//For the rest, go around then out;
	for (var o = 0; o < out; o++){
		for(var a=0; a<around; a++){
			var i = o*around + a + 1;
			var delayReads= [0,0,0,0];
			var delayWrites = [0,0,0,0];
			
			delayReads[0] = i-1;
			delayWrites[0] = i-1 + around;
			
			delayReads[1] = outDelays + around + i - 1;
			delayWrites[1] = outDelays + i - 1;
			
			delayReads[2] = outDelays*2 + (around + a -1)%around + o* around;
			delayWrites[2] = outDelays*2+(around + a)%around + o * around;
			
			delayReads[3] = outDelays*2 + aroundDelays + (around + i)%around+ o * around ;
			delayWrites[3] = outDelays*2 + aroundDelays + (around + i-1)%around + o * around;
			
			if (o == out-1){
				delayReads[1] = outDelays*2+aroundDelays*2+a;
				delayWrites[0] = outDelays*2+aroundDelays*2+a;
				}
				
			setA4(i, delayReads[2], delayReads[3], delayReads[0], delayReads[1], 0.5);
			//outlet(0, ["flip", delayReads[0], delayWrites[0],1]);
			//outlet(0, ["flip", delayReads[1], delayWrites[1],1]);
			//outlet(0, ["flip", delayReads[2], delayWrites[2],1]);
			//outlet(0, ["flip", delayReads[3], delayWrites[3],1]);
			
			coefs.push(["flip", delayReads[0], delayWrites[0],1]);
			coefs.push(["flip", delayReads[1], delayWrites[1],1]);
			coefs.push(["flip", delayReads[2], delayWrites[2],1]);
			coefs.push(["flip", delayReads[3], delayWrites[3],1]);
			
			
			//post(i + " : " + delayReads + " || " + delayWrites + "\n");
			
			

			}	
	}
	

	polarMeshDt(50, 50, 25, 60, 70);
	sendCoefs();
	outlet(3, "bang");
	outlet(2,"getInfo");
}

function polarMeshDt(outDt, outDev, aroundDt, aroundDev, wallDt){
	outlet(2, ["dyByJunction", "clear"])
	outlet(2, ["delayTimes", "clear"]);
	var nWalls = around;
	var outDelays = around*out;
	var aroundDelays = around*out;
	
	
	for (var o = 0; o<out; o++){
		for (var a = 0; a < around; a++){
			i = a+o*around;		
			var dt =outDt + o*outDev;
			outlet(2, ["delayTimes", i, dt]);
			outlet(2, ["delayTimes", i+outDelays, dt]);
			dtByJunction("junction", i, dt);
			
			dt = aroundDt + o * aroundDev
			outlet(2, ["delayTimes", i+outDelays*2, dt]);
			outlet(2, ["delayTimes", i+outDelays*2+aroundDelays, dt]);
			dtByJunction("junction", i+outDelays, dt);						
			
			}
		
		}
	for (var w =0; w < nWalls; w++){
		
		outlet(2, ["delayTimes", outDelays*2+aroundDelays*2+w, wallDt]);
		dtByJunction("wall", w, wallDt);
		}
	outlet(2, ["delayTimes", "sort", -1, -1]);	
	outlet(2, ["delayTimes", "dump"]);
	
	}
	
function setDelayParams(){
	var args = arrayfromargs();
	if (meshType === "cartesian"){		
		cartMeshDt(args[0], args[1], args[2], args[3], args[4], args[5], args[6]);
		}
	else if (meshType === "polar"){
		polarMeshDt(args[0], args[1], args[2], args[3], args[4]);
		}
	}
	
function setDelayByAddress(address, dt){
	if (meshType == "cartesian"){
		//Delays are parsed in pairs of length and width then walls.  They start from the top left
		lDelays = (length-1)*width;
		wDelays = (width-1)*length;
		if (address < lDelays){
			outlet(2, ["delayTimes", address, dt]);
			outlet(2, ["delayTimes", address+lDelays, dt]);
			}
		else if (address < (lDelays + wDelays)){
			outlet(2, ["delayTimes", address+lDelays, dt]);
			outlet(2, ["delayTimes", address+wDelays+lDelays, dt]);
			}
		else if (address < (lDelays + wDelays + walls)){
			outlet(2, ["delayTimes", address+lDelays+wDelays, dt]);
			}
		else{
			error("delay address: " + address + " does not exist");
			}
		
		}
	else if (meshType == "polar"){
		oDelays = around*out;
		aDelays = around*out;
		if (address < oDelays){
			outlet(2, ["delayTimes", address, dt]);
			outlet(2, ["delayTimes", address+oDelays, dt]);
			}
		else if (address < aDelays+oDelays){
			outlet(2, ["delayTimes", address+oDelays, dt]);
			outlet(2, ["delayTimes", address+oDelays+aDelays, dt]);
			}
		else if (address < aDelays+oDelays+walls){
			outlet(2, ["delayTimes", address+oDelays+aDelays, dt]);
			} 
		else{
			error("delay address: " + address + " does not exist");
			}
		}
	
	}
	
	function getDelayIndices(){
		
			if (meshType == "cartesian"){
				
		var lDelays = (length-1)*width;
		var wDelays = (width-1)*length;
		for (var address = 0; address < lDelays+wDelays+walls; address++){
		if (address < lDelays){
			outlet(4, ["delayIndex", "length", address, address, address+lDelays]);
			}
		else if (address < (lDelays + wDelays)){
			outlet(4, ["delayIndex", "width", address, address+lDelays,address+lDelays+oDelays]);
			}
		else if (address < (lDelays + wDelays + walls)){
			outlet(4, ["delayIndex", "wall", address, address+lDelays+oDelays]);
			}
			}

		
		}
	else if (meshType == "polar"){
		var oDelays = around*out;
		var aDelays = around*out;
		for (var address = 0; address < oDelays+aDelays+walls; address++){
		if (address < oDelays){			
			outlet(4, ["delayIndex", "out", address, address, address+oDelays]);
			}
		else if (address < aDelays+oDelays){
			outlet(4, ["delayIndex", "around", address, address+oDelays, address+oDelays+aDelays]);
			}
		else if (address < aDelays+oDelays+walls){
			outlet(4, ["delayIndex", "wall", address, address+oDelays+aDelays]);
			} 
		}
		
		}
		}
		
function sendCoefs(){
	var nCoefs = coefs.length;
	outlet(0, ["a", 'clear']);
	outlet(0, ["flip", 'clear']);
	
	for (var i = 0; i < nCoefs; i++){
		//post(coefs[i] + "\n");
		outlet(0, coefs[i]);
		}
	
	}
	
function setTimeout(task, timeout){
	//timeout function from Jouge Suarex
    this.allowExecution = false;
    
    var tsk = new Task(function (){
            
        if(this.allowExecution){
            
            task();
            
            arguments.callee.task.cancel();
        }
            
        this.allowExecution = true;
            
    }, this);
        
    tsk.interval = timeout;
    tsk.repeat(2);
}

function dtByJunction(type,i,dt){
	outlet(2,["dtByJunction", type, i, dt]);
	}