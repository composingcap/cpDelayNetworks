/*

Early reflections gui

*/

this.inlets = 1;
this.outlets = 1;
this.inspector=1;


var taps = [0];
var domain = 1000;
var erLength = 500;
var predelay = 50;
var amps = [];
var feedbacks = [0]
var planeWidth = 0.02;
var hoverIndex = -1;
var width;
var height;
var aspectx;
var tapPositions = []; 
var clickY = 0;
var newTap = 0;
var newTapPos = [];
var autoScale = 0;
var clicked = 0;

var lineColor = [0,0,0,1];
var newLineColor = [0,0,0,0.5];
var backgroundColor = [1,1,1,1];
var selectionColor = [1,0,0,1];
var continuousOutput = 1;
var feedbackColor = [0.75,0.75,0.75,1];
var feedbackWidth= 0.25;

declareattribute("domain","getattr_domain", "setattr_domain", 1);
declareattribute("x","getattr_taps", "setattr_taps", 1);
declareattribute("z","getattr_feedbacks", "setattr_feedbacks", 1);

declareattribute("y","getattr_amps", "setattr_amps", 1);
declareattribute("autoScale","getattr_autoScale", "setattr_autoScale", 1);

declareattribute("lineColor","getattr_lineColor", "setattr_lineColor", 1);
declareattribute("newLineColor","getattr_newLineColor", "setattr_newLineColor", 1);
declareattribute("backgroundColor","getattr_backgroundColor", "setattr_backgroundColor", 1);
declareattribute("selectionColor","getattr_selectionColor", "setattr_selectionColor", 1);
declareattribute("continuousOutput","getattr_continuousOutput", "setattr_continuousOutput", 1);

function loadbang(){
draw();
output();
}

function _autoScale(){
	var maxTap = taps.reduce(function(a, b) {
    return Math.max(a, b)});
	
	domain = maxTap*1.05;
	
	}

function draw(){
	sketch.default2d();
	width = this.box.rect[2] - this.box.rect[0];
	height = this.box.rect[3] - this.box.rect[1];
	aspectx = width/height;
	
	if (autoScale){
		_autoScale();
		
		}

	
	with (sketch){
	glclearcolor(backgroundColor);
	glclear();	
	tapPositions = [];
	var newAmps = [];
	for(var i = 0; i < taps.length; i++){
	var tapX = aspectx*(-1 + ((taps[i]))/domain*2+planeWidth*0.5)
	var ampIndex = clamp(i, 0, amps.length-1);
	var thisAmp = clamp(amps[ampIndex],0,1);	
	newAmps.push(thisAmp);
	if (i < feedbacks.length){

		var fb = feedbacks[i];
		}
	else{
		var fb = 0;
		feedbacks.push(fb);
		}
	if (fb != 0){
	moveto(tapX, -1);
	glcolor(feedbackColor);
	plane(feedbackWidth*Math.abs(fb),2);
	}			

	if (hoverIndex == i){
		glcolor(selectionColor);
		moveto(clamp((taps[i]/domain*2-1)*aspectx+0.1,-aspectx,0.82*aspectx), clamp(amps[i]*2-1,-1,0.8));
		//text(Math.round(taps[i],2) + " ms");
		text("("+parseInt(taps[i]*100)/100 + " , " + parseInt(amps[i]*100)/100+")" );

		}
	else{
		glcolor(lineColor);
		}
	tapPositions.push(tapX);
	moveto(tapX, -1);
	
	plane(planeWidth,1*thisAmp*2);

	
	}
		if (newTap){
		glcolor(newLineColor);
		moveto(newTapPos[0], -1);
		plane(planeWidth,newTapPos[1]);
		moveto(clamp(newTapPos[0]+0.1,-aspectx,aspectx*0.82), clamp(newTapPos[1]-1,-1,0.8));
		text(Math.round((newTapPos[0]/aspectx+1)/2*domain,2));
		}
	
	}
	amps = newAmps;
	
	if (continuousOutput){
	output();
	}
	}

function onidle(x,y,but,cmd,shift,capslock,option,ctrl){
	if (clicked){
		clicked = 0;
		if (!continuousOutput){
			output();
			}
		}
	if (!shift){
		newTap = 0; 
	var hoverScore = 1000;
	hoverIndex = -1;
	var mousePosX = x/width*2-1; 
	for(var i = 0; i < taps.length; i++){
		
		var mouseDistance= Math.abs(mousePosX*aspectx - tapPositions[i]);
		
		if (mouseDistance < 0.025 && mouseDistance < hoverScore){
			hoverScore = mouseDistance;
			hoverIndex = i;		
			
		}		
	}



	}
	else if (hoverIndex == -1){
		
		newTap = 1; 
		newTapPos = [(x/width*2-1)*aspectx, 2-y/height*2];			
			}
			
	
		
	draw();	
	refresh();

	}
	
function onidleout(){
	newTap = 0;
	hoverIndex = -1;
	draw();
	refresh();
	if (!continuousOutput){
		output();
			}	
	}
	
function onclick(x, y, button, modifier1, shift, capslock, option, modifier2){
	clicked = 1;	
	if (hoverIndex >= 0){
		if (!modifier2){
			moveTap(x,y);
			}
		else{
			removeTap();
				}			
			}
		else if(newTap==1){
				addTap(x,y);
				}
	}
function ondrag(x,y,but,cmd,shift,capslock,option,ctrl){
	if (hoverIndex >= 0){
		if (option){
			changeFeedback(x,y);			
			}
		else{
			moveTap(x,y);
			}
			
			
						
			}
		
		
	}

function removeTap(){
	if (hoverIndex >= 0){
		taps.splice(hoverIndex,1);
		amps.splice(hoverIndex,1);
		rescaleTaps();
		draw();
		refresh();
		hoverIndex = -1;
		}
	
	}
	
function moveTap(x,y){
			if (hoverIndex >= 0){
			taps[hoverIndex] = (x/width)*domain+planeWidth/2;			
			amps[hoverIndex] = 1-(y/height);
			
			draw();
			refresh();
			rescaleTaps();
			}
	}
	
function changeFeedback(x,y){
		if (hoverIndex >= 0){
			var tapPos = taps[hoverIndex]/domain;
			mousePos= 1-((y/height+1)*0.5);
			
			feedbacks[hoverIndex] = Math.pow(clamp(mousePos,0,1),2);
			draw();
			refresh();
			}
	}
function setPredelay(ms){
	predelay = ms;
 	var minTap = taps.reduce(function(a, b) {
    return Math.min(a, b);
	});
	var tapDif = minTap-predelay;
	
	for( var i = 0; i < taps.length; i++){
		taps[i] -= tapDif;
		}
	draw();
	refresh();
	
	}
	
function setLength(ms){
	erLength = ms;
 	var minTap = taps.reduce(function(a, b) {
    return Math.min(a, b);
	});
	var maxTap = taps.reduce(function(a, b) {
    return Math.max(a, b);
	});
	var tapLen = maxTap-minTap;
	var tapLenRatio = ms/tapLen;
	
	for( var i = 0; i < taps.length; i++){
		taps[i] *= tapLenRatio;
		}
	draw();
	refresh();
	
	}
	
function addTap(x,y){
			taps.push(x/width*domain);			
			amps.push(1-(y/height));
		
			draw();
			refresh();
			rescaleTaps();

	}
function output(){
	var ampArray = ["y"];
	var tapArray = ["x"];
	var fbArray = ["z"];
	for(var i = 0; i < taps.length; i++){
	var ampIndex = clamp(i, 0, amps.length-1);
	var thisAmp = amps[ampIndex];
	ampArray.push(thisAmp);
	var thisTap = taps[i];
	tapArray.push(thisTap);
	var thisFb = feedbacks[i];
	fbArray.push(thisFb);
	
		}
		outlet(0, fbArray);
		outlet(0, ampArray);
		outlet(0, tapArray);
		
		notifyclients();		
		getattr_taps();
		getattr_amps();
	
	}


function rescaleTaps(){

	}

function onresize(w,h){	
	
	draw();
	refresh();
	}
onresize.local=1;	



function setattr_domain(n){
     domain = n;
     draw();
	refresh();
}

function getattr_domain(){
     return domain;
}

function setattr_taps(){
     taps = arrayfromargs(arguments);
     draw();
	refresh();
	if (!continuousOutput){
		output();
		}
}

function getattr_taps(){
     return taps;
}

function setattr_amps(){
     amps = arrayfromargs(arguments);
     draw();
	refresh();
		if (!continuousOutput){
		output();
		}
}


function getattr_feedbacks(){
     return feedbacks;
}

function setattr_feedbacks(){
     feedbacks = arrayfromargs(arguments);
     draw();
	refresh();
		if (!continuousOutput){
		output();
		}
}


function getattr_amps(){
     return amps;
}

function setattr_autoScale(){
     autoScale = arrayfromargs(arguments);
	draw();
	refresh();

}

function getattr_autoScale(){
    return autoScale;
}

function setattr_lineColor(){
     lineColor = arrayfromargs(arguments);
	draw();
	refresh();

}

function getattr_lineColor(){
    return lineColor;
}

function setattr_newLineColor(){
     newLineColor = arrayfromargs(arguments);
	draw();
	refresh();

}

function getattr_newLineColor(){
    return newLineColor;
}

function setattr_backgroundColor(){
     backgroundColor = arrayfromargs(arguments);
	draw();
	refresh();

}

function getattr_backgroundColor(){
    return backgroundColor;
}

function setattr_selectionColor(){
     selectionColor = arrayfromargs(arguments);
	draw();
	refresh();

}

function getattr_selectionColor(){
    return selectionColor;
}

function setattr_continuousOutput(n){
     continuousOutput = n;
	draw();
	refresh();
	//post(continuousOutput);

}


function getattr_continuousOutput(){
    return continuousOutput;
}


function clamp(num, min, maximum) {
  return num <= min ? min : num >= maximum ? maximum : num;
}

function scaleValue( value, r1, r2 ) { 
    return ( value - r1[ 0 ] ) * ( r2[ 1 ] - r2[ 0 ] ) / ( r1[ 1 ] - r1[ 0 ] ) + r2[ 0 ];
}

function clear(){
	amps = [];
	taps = [];
	feedbacks = [];
	
	}
	
function bang(){
	draw();
	}