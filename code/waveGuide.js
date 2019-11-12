/*

*/

outlets = 4;

function makeCartMesh(length, width){
	outlet(0, ["a", 'clear']);
	outlet(0, ["flip", 'clear']);
	//Deternine number of delay lines and scattering junctions
	var perimeter = (length+width)*2
	var innerDelays = 2*(2*width*length-width-length);
	
	outlet(1, ["nDelays", innerDelays + perimeter]);
	outlet(1, ["nJunctions", length*width]); 
	outlet(1, ["nWalls", perimeter]);
	outlet(1, "go");
	
	
	var xDelays = (length-1)*width;
	var yDelays = (width-1)*length;
	
	var junctions = [];
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
				
			//post(i + " : " + delayReads + " || " + delayWrites + "\n");
			
			setA4(i, delayReads[0],delayReads[1],delayReads[2],delayReads[3], 0.5);
			
			outlet(0, ["flip", delayReads[0], delayWrites[0], 1]);
			outlet(0, ["flip", delayReads[1], delayWrites[1], 1]);
			outlet(0, ["flip", delayReads[2], delayWrites[2], 1]);
			outlet(0, ["flip", delayReads[3], delayWrites[3], 1]);
			
			 
			
		}
		}
		
		
		cartMeshDt(length, width, 50, 50, 100, 0.9, 1.1, 0.8, 1.2);
		
		outlet(3, "bang");
	
	}
	
	
function setA4(junction, left, right, top, bottom, coef){
	outlet(0, ["a", left, junction, coef]);
	outlet(0, ["a", right, junction, coef]);
	outlet(0, ["a", top, junction, coef]);
	outlet(0, ["a", bottom, junction, coef]);
	}
	



function cartMeshDt(length, width, centerDelay, deviation, wallDelay, wallPosL, wallPosR, wallPosT, wallPosB){
	//Do inner delays...
	var innerDelays = (2*width*length-width-length)/2;
	
	for (var i = 0; i < innerDelays; i++){
		
		var deltaCenter = Math.abs(i-innerDelays/2)/(innerDelays/2);	
		
		var dt = centerDelay+deviation*deltaCenter;
		
		outlet(2, ["delayTimes", i, dt]);
		outlet(2, ["delayTimes", i+innerDelays, dt]);
		outlet(2, ["delayTimes", i+innerDelays*2, dt]);
		outlet(2, ["delayTimes", i+innerDelays*3, dt]);
		
		}
	
	for (var i = 0; i< length; i++){
		var dt = wallDelay*wallPosL;
		outlet(2, ["delayTimes", i, dt]);
		
		var dt = wallDelay*wallPosR;
		outlet(2, ["delayTimes", i+length, dt]);
		
		}
	for (var i = 0; i<width; i++){
		
		var dt = wallDelay*wallPosB;
		outlet(2, ["delayTimes", i+length*2, dt]);
		
		var dt = wallDelay*wallPosT;
		outlet(2, ["delayTimes", i+length*2+width, dt]);
		
		}

	
	
	}
	
function makePolarMesh(out, around){
	
	outlet(0, ["a", 'clear']);
	outlet(0, ["flip", 'clear']);
	//Deternine number of delay lines and scattering junctions
	var nWalls = around;
	var outDelays = around*out;
	var aroundDelays = around*out;
	
	outlet(1, ["nDelays", nWalls + outDelays*2+aroundDelays*2]);
	outlet(1, ["nJunctions", 1+ out*around]); 
	outlet(1, ["nWalls", nWalls]);
	outlet(1, "go");
	
	//For the inner junction...
	for (var i = 0; i < around; i++){
		outlet(0, ["a", around*2+i, 0, 1/around*2]);
		outlet(0, ["flip", around*2+i, i, 1]);
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
			outlet(0, ["flip", delayReads[0], delayWrites[0],1]);
			outlet(0, ["flip", delayReads[1], delayWrites[1],1]);
			outlet(0, ["flip", delayReads[2], delayWrites[2],1]);
			outlet(0, ["flip", delayReads[3], delayWrites[3],1]);
			
			//post(i + " : " + delayReads + " || " + delayWrites + "\n");
			
			

			}	
	}
	polarMeshDt(out, around, 50, 50, 25, 60, 70);
}

function polarMeshDt(out, around, outDt, outDev, aroundDt, aroundDev, wallDt){
	var nWalls = around;
	var outDelays = around*out;
	var aroundDelays = around*out;
	
	for (var o = 0; o<out; o++){
		for (var a = 0; a < around; a++){
			i = a+o*around;
			
		
			outlet(2, ["delayTimes", i, outDt + o*outDev]);
			outlet(2, ["delayTimes", i+outDelays, outDt + o*outDev]);
			
			outlet(2, ["delayTimes", i+outDelays*2, aroundDt + o * aroundDev]);
			outlet(2, ["delayTimes", i+outDelays*2+aroundDelays, aroundDt + o * aroundDev]);	
					
			
			}
		
		}
	for (var w =0; w < nWalls; w++){
		
		outlet(2, ["delayTimes", outDelays*2+aroundDelays*2, wallDt]);
		}
	
	}