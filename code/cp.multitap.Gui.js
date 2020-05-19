/*

Early reflections gui

*/

var taps = [100, 125, 2437, 2345];
var domain = 1000;
var erLength = 500;
var predelay = 50;
var amps = [1, 0.75, 0.7, 0.5, 0.25, 0.1];
var planeWidth = 0.015;
var hoverIndex = -1;
var width;
var height;
var aspectx;
var tapPositions = []; 
var clickY = 0;
var newTap = 0;
var newTapPos = [];


declareattribute("domain","getattr_domain", "setattr_domain", 1);
declareattribute("taps","getattr_taps", "setattr_taps", 1);
declareattribute("delayAmps","getattr_amps", "setattr_amps", 1);

function loadbang(){
draw();
output();
}


function draw(){
	sketch.default2d();
	width = this.box.rect[2] - this.box.rect[0];
	height = this.box.rect[3] - this.box.rect[1];
	aspectx = width/height;


	
	with (sketch){
	//glclearcolor(1, 1, 1, 1);
	glclear();	
	tapPositions = [];
	var newAmps = [];
	for(var i = 0; i < taps.length; i++){
		
	var ampIndex = clamp(i, 0, amps.length-1);
	var thisAmp = amps[ampIndex];
	newAmps.push(thisAmp);
	if (hoverIndex == i){
		glcolor(1,0,0,1);
		moveto(clamp((taps[i]/domain*2-1)*aspectx+0.1,-aspectx,0.82*aspectx), clamp(amps[i]*2-1,-1,0.8));
		text(Math.round(taps[i],2) + " ms");
		}
	else{
		glcolor(0,0,0,1);
		}
	var tapX = aspectx*(-1 + ((taps[i]))/domain*2+planeWidth*0.5)
	tapPositions.push(tapX);
	moveto(tapX, -1);
	
	plane(planeWidth,1*thisAmp*2);
	
	}
		if (newTap){
		glcolor(0,0,0,0.5);
		moveto(newTapPos[0], -1);
		plane(planeWidth,newTapPos[1]);
		moveto(clamp(newTapPos[0]+0.1,-aspectx,aspectx*0.82), clamp(newTapPos[1]-1,-1,0.8));
		text(Math.round((newTapPos[0]/aspectx+1)/2*domain,2) + " ms");
		}
	
	}
	amps = newAmps;
	

	output();
	}

function onidle(x,y,but,cmd,shift,capslock,option,ctrl){
	
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
	}
	
function onclick(x, y, button, modifier1, shift, capslock, option, modifier2){	
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
	
			moveTap(x,y);
						
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
			taps[hoverIndex] = (x/width)*domain;			
			amps[hoverIndex] = 1-(y/height);
			
			draw();
			refresh();
			rescaleTaps();
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
	var ampArray = ["delayAmps"];
	var tapArray = ["taps"];
	for(var i = 0; i < taps.length; i++){
	var ampIndex = clamp(i, 0, amps.length-1);
	var thisAmp = amps[ampIndex];
	ampArray.push(thisAmp);
	var thisTap = taps[i];
	tapArray.push(thisTap);
	
		}
		
		outlet(0, ampArray);
		outlet(0, tapArray);
		
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
	output();
}

function getattr_domain(){
     return domain;
}

function setattr_taps(){
     taps = arrayfromargs(arguments);
     draw();
	refresh();
	output();
}

function getattr_taps(){
     return taps;
}

function setattr_amps(){
     amps = arrayfromargs(arguments);
     draw();
	refresh();
	output();
}

function getattr_amps(){
     return amps;
}

function clamp(num, min, maximum) {
  return num <= min ? min : num >= maximum ? maximum : num;
}

function scaleValue( value, r1, r2 ) { 
    return ( value - r1[ 0 ] ) * ( r2[ 1 ] - r2[ 0 ] ) / ( r1[ 1 ] - r1[ 0 ] ) + r2[ 0 ];
}