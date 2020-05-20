/*

matrix ui with number values

*/

inlets = 1;
outlets = 2;
inspector = 1;
setinletassist(0, "list in the format [col,row,val]");
setoutletassist(0, "Messages formated for matrix~");

//Attribute functions
declareattribute("columbs","getattr_ncols", "setattr_ncols", 1);
declareattribute("rows","getattr_nrows", "setattr_nrows", 1);
declareattribute("Accent color (rgb)",	"getattr_accentColor", "setattr_accentColor", "color");
declareattribute("contraints (min,max)",	"getattr_contraints", "setattr_contraints", 1);
declareattribute("flipped matrix output","getattr_flippedOut", "setattr_flippedOut", 0);
//Global vars
var ncols=8;
var nrows=2;
var width= 5;
var height= 5;
var squareSide = 100;
var margine = 0;
var RedrawEnable = 0;
var vbrgb = [.75,.75,.75,1];
var vmrgb = [0.9,0.5,0.5,0.75];
var vfrgb = [0,0,0,1];
var myFontSize= 5;
var boxX = width*0.5
var boxY = height*0.5
var cursorX;
var cursorY;
var selected = [-1,-1];
var thisVal;
var hover=[-1,-1];
var yFlag = 0;
var xFlag = 0;
var boxAspect = [16,7];
var boxMargins= [2,2];
var canvasMargins=[5,1];
var constraints = ["-inf", "inf"];

var lastY = 0;
var lastX = 0;
var lastDelta = 0;
var boxBounds ;
var state;
var shiftFlag = 0;
var keyboardFlag = 0;
var KeyboardError = 1;
var activeTextColor= [0,0,0,1];
var inactiveTextColor= [0,0,0,0.5];
var accentColor= [1.,1.,0]
var flippedOut = 0;



//initialize
function setMatrix(){
     boxBounds = new Array(ncols);
     state = new Array(ncols);
     for (var col = 0; col<ncols; col++){
          state[col] = new Array(nrows)
          boxBounds[col] = new Array(nrows)
          for (var row = 0; row <nrows; row++){
          state[col][row] = 0.0;
          boxBounds[col][row] = new Array(4);
          }
     }
}
setMatrix();

//Scetch

mgraphics.init();





draw();
refresh();

function loadbang()
{
	redrawoff();
	RedrawEnable = 1;
}
function redrawoff()
{
	RedrawEnable = 0;
}

function redrawon()
{
	RedrawEnable = 1;
	draw();
}


function draw(){
     if (! RedrawEnable)
          return
     mgraphics.redraw();

}
function paint(){
     width = this.box.rect[2] - this.box.rect[0];
     height = this.box.rect[3] - this.box.rect[1];
     var colstep= (boxAspect[0]+boxMargins[0]);
     var rowstep= (boxAspect[1]+boxMargins[1]);
     scaler = (width-2*canvasMargins[0])/(colstep*ncols-boxMargins[0]);

     longSide = Math.max(width,height*2);








     with (mgraphics){
          select_font_face("Futura", "normal", "normal");

          set_font_size(myFontSize*scaler);








          for (var col = 0; col<ncols; col++){
               for (var row = 0; row < nrows; row++){
                    thisWidth=(col)*colstep*scaler+canvasMargins[0];
                    thisHeight= (row+1)*rowstep*scaler;
                    myVal = state[col][row];

                    boxBounds[col][row][0]= thisWidth;
                    boxBounds[col][row][1]= thisHeight;
                    boxBounds[col][row][2]= boxAspect[0]*scaler;
                    boxBounds[col][row][3]= -boxAspect[1]*scaler;

                    rectangle(boxBounds[col][row][0],boxBounds[col][row][1],boxBounds[col][row][2],boxBounds[col][row][3]);


                    if((hover[0]==col)||(hover[1]==row)){
                         if ((hover[0]==col)&&(hover[1]==row)) set_source_rgba(accentColor[0],accentColor[1],accentColor[2], 0.75);
                         else set_source_rgba(accentColor[0],accentColor[1],accentColor[2],0.25);
                         fill();

                    }
                    if(myVal !== 0) set_source_rgba(activeTextColor[0],activeTextColor[1],activeTextColor[2],activeTextColor[3]);
                    else{ set_source_rgba(inactiveTextColor[0],inactiveTextColor[1],inactiveTextColor[2],inactiveTextColor[3]);
                    }
                    set_line_width(2);
                    stroke();
                    move_to(thisWidth+1.5*scaler,thisHeight-boxAspect[1]*0.2*scaler ,0.0);

                         var myText = String(Number(Math.round(myVal+'e3')+'e-3'));
                         var thisFontSize = myFontSize;
                         set_font_size(myFontSize*scaler);
                         var textSize = text_measure(myText);
                         while((textSize[0]>(boxBounds[col][row][2]-3*scaler))){
                              thisFontSize = thisFontSize-0.01;
                              set_font_size(thisFontSize*scaler);
                              textSize = text_measure(myText)
                         }
                         //post(thisFontSize, "\n");
                         show_text(myText);

                    //circle(0.7/Math.max(nrows,ncols));

               }
          }

     }



}

function list(col,row,val){
     state[col][row]= val;
     draw();
     refresh();
     notifyclients();
     outputdata();
}

function set (col,row,val){
     state[col][row]= val;
     draw();
     refresh();
     notifyclients();
     //outputdata();
}

function boxposition()
{
	p = this.patcher;

	boxX = p.wind.location[0]+ box.rect[0];
	boxY = p.wind.location[1]+ box.rect[1];

}
boxposition.local = 1;

draw.local= 1;


function cursor(c)
{
	if (c)
		max.showcursor();
	else
		max.hidecursor();
}
cursor.local = 1;

function onclick(x,y,but,cmd,shift,capslock,option,ctrl)
{
     if (but){
          cursor(1);
     }

     boxposition();
     cursorX= boxX+x+17;
     cursorY= boxY+y+17;




     	LastY = y;

          /*
          for (var col = 0; col < ncols; col++){
               for (var row = 0; row < nrows; row++){

                    if ((x>boxBounds[col][row][0]) && (x<(boxBounds[col][row][0]+boxBounds[col][row][2]))){
                         if ((y < boxBounds[col][row][1]) && (y>boxBounds[col][row][1]+boxBounds[col][row][3])){
                              selected = [col,row];


                              thisVal = state[selected[0]][selected[1]];
                              lastY = y;
                              draw();
                         	refresh();
                              outputdata();

                         	notifyclients();
                         }
                    }
               }
          } */
          if ((selected[0]) != -1){
               cursor(0);
               selected= [hover[0],hover[1]];
               thisVal = state[selected[0]][selected[1]];

               if (option){
                    state[selected[0]][selected[1]]= 0;


          }
          lastY = y;
          draw();
          refresh();
          outputdata();
          notifyclients();
     }

}

onclick.local = 1; // private

var frame =  0;
var lastDelta = 0;

function ondrag(x,y,but,cmd,shift,capslock,option,ctrl){
     if (selected[0] == -1) cursor(1);
     else if (but == 0){
          selected = [-1,-1];
          thisVal = 0;

          cursor(1);
     }
     else{
          cursor(0);
          var delta = 0;
          if (frame != 0){

          delta = y - lastY

          thisVal = thisVal+ -delta*(0.01+0.2*shift+1*ctrl);

          if (constraints[0] != "-inf"){
               if (thisVal < constraints[0]) thisVal = constraints[0];
          }
          if (constraints[1] != "inf"){
               if (thisVal > constraints[1]) thisVal = constraints[1];
          }

     state[selected[0]][selected[1]] = thisVal;

     }

          frame += 1
          if (frame > 1){
               max.pupdate(cursorX,cursorY);
               y = cursorY;
               frame = 0;

          }

          lastY = y;
          lastDelta = delta;


          draw();
     	refresh();
     	notifyclients();
          outputdata();


     }

}
ondrag.local = 1

function onidle(x,y,but,cmd,shift,capslock,option,ctrl)
{
     for (var col = 0; col < ncols; col++){
          for (var row = 0; row < nrows; row++){
               if ((x>boxBounds[col][row][0]) && (x<(boxBounds[col][row][0]+boxBounds[col][row][2]))){
                    if ((y < boxBounds[col][row][1]) && (y>boxBounds[col][row][1]+boxBounds[col][row][3])){
                         hover = [col,row];
                         selected = [col,row];
                         if (shift){
                              shiftFlag = 1;


                         }
                         else {
                              shiftFlag = 0;
                         }
                         draw();
                         refresh();
                         return

                    }
               }
          }
          selected = [-1,-1];
     }
     //hover = [-1,-1];
     if (shift){
          shiftFlag = 1;
          refresh();

     }
     else {
          shiftFlag = 0;
          refresh();

     }
     draw();
     refresh();

}
onidle.local=1;

function onidleout(){
          hover = [-1,-1];
          draw();
     	refresh();
}
onidleout.local=1;
/*
function KeyboardInput() //From EJ
{
	if (keyboardFlag) {
		if (this.patcher.locked) {
			if (KeyboardError) {

				unselect();

				// si d'autres objets ej.numbox-keyboard traînent, il ne doivent pas recevoir les touches du clavier
				messnamed("ej.numbox-keyboard", "stop");

				keyboard = this.patcher.newdefault(-100, -100, "ej.numbox-keyboard.maxpat");
				// ça serait bien d'éviter le nommage...
				// create "unique" name
				var TempName = "num-";
				var TempDate = new Date();
				TempName += TempDate.getUTCDay();
				TempName += TempDate.getUTCHours();
				TempName += TempDate.getUTCMinutes();
				TempName += TempDate.getUTCSeconds();
				TempName += TempDate.getUTCMilliseconds();

				keyboard.varname = TempName;
				this.patcher.script("hide", TempName);	// hidden ne marche pas car c'est un subpatcher :-(

				if (keyboard.maxclass == "bogus") {
					ejies.error(this, "check the installation: ej.numbox-keyboard.maxpat is missing");
					KeyboardError = 0;
					return;
				}

KeyboardInput.local = 1;
*/
function outputdata(){
     for (var col = 0; col<ncols; col++){
          for (var row = 0; row <nrows; row++){
	if(!flippedOut){
               outlet(0, col, row, state[col][row]);
}
else{
	outlet(0, row, col, state[col][row]);
	}
          }
     }
}



//Attribute Callbacks



function getattr_ncols(){
     return ncols;
}
function setattr_ncols(){
     ncols = arguments[0];
     setMatrix();
}

function getattr_nrows(){
     return nrows;
}
function setattr_nrows(){
     nrows = arguments[0];
     setMatrix();
}

function getattr_contraints(){
     return constraints;
}
function setattr_contraints(){
     if (arguments === null) constraints = ["-inf", "inf"];
     else constraints = [arguments[0],arguments[1]];


}

function setattr_accentColor(r,g,b){
     accentColor= [r,g,b];
}
function getattr_accentColor(){
     return accentColor;
}

function getattr_flippedOut(){
     return flippedOut;
}
function setattr_flippedOut(n){
     flippedOut = n;
     outputdata();
}

function getvalueof()
{
     var arrayForPattr= [].concat.apply([], state);
	return arrayForPattr;
}

function setvalueof(){
     arrayForPattr = arguments;
     setMatrix();
     var i = 0;
     for (var col = 0; col < ncols; col++){
          for (var row=0; row<nrows;row++){
		
               state[col][row] = arrayForPattr[i];
               i++;
          }
     }
     draw();
     refresh();
     notifyclients();
     outputdata();
}

function clear(){
     setMatrix();
     draw();
     refresh();
     notifyclients();
     outputdata();
}
