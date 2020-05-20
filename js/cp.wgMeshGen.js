outlets = 2;
var meshType= "cartesian";

var delaysByJunction; 
var walls = 0;
var innerDelays;
var outDelays;
var aroundDelays;

var lengthOffset;
var jDelays;
var jDelayOffset;
var xDelayLines;
var yDelayLines;
 
var meshDict = Dict(jsarguments[1]);

function setMeshParams(){
	setCoefsByDict();	
	setDelaysByDict();	
	}

function meshCoef(){
		
		var meshType = meshDict.get("meshType");
		
		if (meshType == "cartesian") setCartMeshCoef();
		else if (meshType == "polar") setPolarMeshCoef();

		
		}	
	
			
function dictionary(dictName){


	meshDict.clone(dictName);
	
	outlet(0, ["scripting", "go"]);
	
	
	}


function makeCartMesh(l, w){
	meshDict.clear();
	walls = (l+w)*2
	innerDelays = 2*(2*w*l-w-l);
	
	meshDict.replace("meshType", "cartesian");
	meshDict.replace("dimentions", [l, w]);

	meshDict.replace("nDelays", innerDelays + walls);
	meshDict.replace("junctionDelays", innerDelays/2);
	meshDict.replace("wallDelays", walls);
	
	meshDict.replace("nJunctions", l*w);
	meshDict.replace("nWalls", walls);


	outlet(0, ["scripting", "go"]);
	
	cartMeshDt(100, 51.25, 250, 1, 1, 1, 1);
	meshCoef();
	}
	
	

	function setCartMeshCoef(){
	var length = meshDict.get("dimentions[0]");
	var width = meshDict.get("dimentions[1]");

	var xDelays = (length-1)*width;
	var yDelays = (width-1)*length;
	
	meshDict.replace("xDelays", xDelays);
	meshDict.replace("yDelays", yDelays);
	
	var coefs = [];
	
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
				
			
			setA4(coefs, i, delayReads[0],delayReads[1],delayReads[2],delayReads[3], 0.5);
			

			coefs.push(["flip", delayReads[0], delayWrites[0], 1]);
			coefs.push(["flip", delayReads[1], delayWrites[1], 1]);
			coefs.push(["flip", delayReads[2], delayWrites[2], 1]);
			coefs.push(["flip", delayReads[3], delayWrites[3], 1]);
			
			 
			
		}
		}
		
	
		dumpCoefsToDict(coefs);
		
	
	}
	
	
function setA4(coefs, junction, left, right, top, bottom, coef){
	
	coefs.push(["a", left, junction, coef]);
	coefs.push(["a", right, junction, coef]);
	coefs.push(["a", top, junction, coef]);
	coefs.push(["a", bottom, junction, coef]);
	}
	

function cartMeshDt(centerDelay, deviation, wallDelay, wallPosL, wallPosR, wallPosT, wallPosB){
	//Do inner delays...
	var length = meshDict.get("dimentions[0]");
	var width = meshDict.get("dimentions[1]");
	jDelays = Math.floor((2*width*length-width-length)/2);
	xDelayLines = (width-1)*length;
	yDelayLines = (length-1) * width;
	outlet(0, ["scripting", "xDelayLines", xDelayLines]);
	outlet(0, ["scripting", "yDelayLines", yDelayLines]);
	outlet(0, ["scripting", "junctionDelays", xDelayLines+yDelayLines]);


			for (var i = 0; i < xDelayLines; i++){
		
				var deltaCenter = Math.abs(i-jDelays/2)/(jDelays/2);	
		
				var dt = centerDelay+deviation*deltaCenter;

				dtByJunction("junction", i, dt);
		
		}
			for (var i=xDelayLines; i < xDelayLines+yDelayLines; i++){
				
				dtByJunction("junction", i, dt);
				
				}
			jDelayOffset = (xDelayLines+yDelayLines)*2;
	
			var dtL = wallDelay*wallPosL;
			var dtR = wallDelay*wallPosR;
			var dtT = wallDelay*wallPosT;
			var dtB = wallDelay*wallPosB;
	
			dtByJunction("wall", "0", dtL);
			dtByJunction("wall", "1", dtR);
			dtByJunction("wall", "2", dtT);
			dtByJunction("wall", "3", dtB);
			

									
	
	
	}

function setDelay(){
	
	var delayArray = arrayfromargs(arguments);

	setDelayByJunction(delayArray);

	
	}
	
	function setDelayByJunction(delayArray){

	
	var jToSet = Math.floor(delayArray.length/3);
	
			for(m = 0; m < jToSet; m++){	
							
			
			var type = delayArray[0+m*3]
			var i = delayArray[1+m*3];
			if (i != "left" || i != "right" || i != " top" || i != "bottom"){
				i = parseInt(i);
				}
				else{
					}
			var dt = delayArray[2+m*3];
			setDtByJunction(type, i, dt)
				
				}
	
	outlet(1, "done");
	
	}


function setDtByJunction(type, i, dt){
	
	//post(type + " " + i + " " + dt + "\n");
	
	var width = meshDict.get("dimentions[0]")
	var length = meshDict.get("dimentions[1]")

	//	post("number of junsctions to set... " + jToSet + "\n");


			//post("mesh: "+ meshType+ " type: " + type +", i: " + i + ", dt: "+ dt +"\n"); 
	if(meshType === "cartesian"){	
		
		var xDelays = meshDict.get("xDelays");
		var yDelays = meshDict.get("yDelays");	
			
			if (type == "junction"){
				if (i < xDelays){
				//	post("junction "+ i + " is xLine \n");
				outlet(0,["delay",i, dt]);
				outlet(0,["delay",i+xDelays, dt]);
				dtByJunction("junction", i, dt);
				}
				else{
					//post("junction "+ i + " is yLine \n");
					outlet(0,["delay",i+xDelays, dt]);
					outlet(0,["delay",i+xDelays+yDelays, dt]);
					dtByJunction("junction", i, dt);
					
					}
				}
			else if (type == "wall"){
			var wallOffset = xDelays*2+yDelays*2;
			var lengthOffset = wallOffset + length*2;
			var side = i;
			dtByJunction("wall", side, dt);
			if (side == 0){
				
				for (var i = wallOffset; i< wallOffset+length; i++){
						outlet(0,["delay",i, dt]);
					}
				}
			else if (side == 1){
				for (var i = wallOffset; i< wallOffset+length; i++){
						outlet(0,["delay",i+length, dt]);
					}
				}
			else if (side == 2){
				for (var i = lengthOffset ; i<lengthOffset+width; i++){		
					outlet(0,["delay",i+length, dt]);
					}
				}
			else if (side == 3){
				for (var i = lengthOffset ; i<lengthOffset+width; i++){		
					outlet(0,["delay",i+width, dt]);
					}
				}
		
		}
	}
	else if (meshType === "polar"){
		var outDelays = meshDict.get("outDelays");
		var aroundDelays = meshDict.get("aroundDelays");
		if (type == "junction"){	
			//post(outDelays +"\n");
	if (i < outDelays){
			outlet(0,["delay",i, dt]);
			outlet(0,["delay",i+outDelays, dt]);
			dtByJunction("junction", i, dt);

			}
	else{	
			outlet(0,["delay",i+outDelays, dt]);
			outlet(0,["delay",i+outDelays+aroundDelays, dt]);
			dtByJunction("junction", i, dt);	
			}
			}
	else if (type == "wall"){
		outlet(0,["delay",outDelays*2+aroundDelays*2+i, dt]);
		dtByJunction("wall", i, dt);
			}
		}


	}
	
function makePolarMesh(o, a){
	meshDict.clear()
	meshType= "polar";
	var out = o;
	var around = a;

	var nWalls = around;
	var outDelays = around*out;
	var aroundDelays = around*out;
	walls = around; 
	
	meshDict.replace("junctionDelays", out*around*2);
	meshDict.replace("outDelays", outDelays);	
	meshDict.replace("aroundDelays", aroundDelays);
	meshDict.replace("meshType", meshType);
	meshDict.replace("nDelays", nWalls + outDelays*2+aroundDelays*2);
	meshDict.replace("nJunctions", 1+ out*around); 
	meshDict.replace("nWalls", nWalls);
	meshDict.replace("dimentions", out, around);
	
	
	polarMeshDt(100,36,12,13, 75);
	meshCoef();
	
	outlet(0, ["scripting", "go"]);

	}
	
	
	function setPolarMeshCoef(){
	coefs = [];
	var out = meshDict.get("dimentions[0]");
	var around = meshDict.get("dimentions[1]");
	var outDelays = around*out;
	var aroundDelays = around*out;

	//For the inner junction...
	for (var i = 0; i < around; i++){

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
				
			setA4(coefs, i, delayReads[2], delayReads[3], delayReads[0], delayReads[1], 0.5);

			
			coefs.push(["flip", delayReads[0], delayWrites[0],1]);
			coefs.push(["flip", delayReads[1], delayWrites[1],1]);
			coefs.push(["flip", delayReads[2], delayWrites[2],1]);
			coefs.push(["flip", delayReads[3], delayWrites[3],1]);
			
			//post("i: " + i + " delayReads: " + delayReads + " delayWrites: " + delayWrites + "/n");

			}	
	}
	dumpCoefsToDict(coefs);

}

function polarMeshDt(outDt, outDev, aroundDt, aroundDev, wallDt){
	
	var out = meshDict.get("dimentions[0]");
	var around = meshDict.get("dimentions[1]");

	var nWalls = around;
	var outDelays = around*out;
	var aroundDelays = around*out;
	
	
	for (var o = 0; o<out; o++){
		for (var a = 0; a < around; a++){
			i = a+o*around;		
			var dt =outDt + o*outDev;

			dtByJunction("junction", i, dt);
			
			dt = aroundDt + o * aroundDev

			dtByJunction("junction", i+outDelays, dt);						
			
			}
		
		}
	for (var w =0; w < nWalls; w++){
		
		dtByJunction("wall", w, wallDt);
		}
	
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
	meshDict.replace("dt::"+type+"::"+i, dt);
	}
	
function generateMeshFromDict(){
	
	
	}
	
function dumpCoefsToDict(coefs){
	
	meshDict.replace("coefs", "cleared");
	
	for (var c = 0; c <coefs.length; c++){
		
		meshDict.replace("coefs::"+c, coefs[c]);
		
		}
	
	}
	
function setDelaysByDict(){
	var junctions = meshDict.get("dt::junction");
	var jKeys = junctions.getkeys();
	var walls = meshDict.get("dt::wall");
	var wKeys = walls.getkeys();
	
	var delayArray = [];
	
	for (var k = 0; k < jKeys.length; k++){
		
		delayArray.push("junction", jKeys[k], junctions.get(jKeys[k]));
		
		}
		
	for (var k = 0; k < wKeys.length; k++){
		
		delayArray.push("wall", wKeys[k], walls.get(wKeys[k]));
		
		}
		
	setDelayByJunction(delayArray);
	
	
	
	}

function setCoefsByDict(){

	meshKeys = meshDict.get("coefs").getkeys();
	if (Array.isArray(meshKeys)){
		outlet(0, ["a", 'clear']);
		outlet(0, ["flip", 'clear']);
	
	for (var k = 0; k < meshKeys.length; k++){

		outlet(0, flatten(["coefs", meshDict.get("coefs"+"::"+meshKeys[k])]));
		}
		
		}
	
	}
	
function flatten(arr) {
  return arr.reduce(function (flat, toFlatten) {
    return flat.concat(Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten);
  }, []);
}