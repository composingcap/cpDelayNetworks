function generatepolyio(chansIn, chansOut, connectIn, inposX, inposY, connectOut, outposX, outposY){
	p = this.patcher;
	
	inPack = p.getnamed("inPack");
	p.remove(inPack);
	inPack = p.newdefault(inposX, inposY+50, "mc.pack~",chansIn);
	inPack.setattr("varname", "inPack");
	p.connect(inPack,0,  p.getnamed(connectIn), 0);
	
	for (var i = 0 ; i < 64; i++){
		p.remove(p.getnamed("in_"+i));
		
		}
	
	for (var i = 0 ; i < chansIn; i++){
			input = p.newdefault(inposX+i*20, inposY, "in~",i+1);
			input.setattr("varname", "in_"+i);
			p.connect(input, 0, inPack, i);

		
		}
		
	outUnpack = p.getnamed("outUnpack");
	p.remove(outUnpack);
	outUnpack = p.newdefault(outposX, outposY, "mc.unpack~",chansOut);
	outUnpack.setattr("varname", "outUnpack");
	p.connect(p.getnamed(connectOut), 0, outUnpack, 0);
	
		for (var i = 0 ; i < 64; i++){
		p.remove(p.getnamed("out_"+i));
		
		}
	
	for (var i = 0 ; i < chansOut; i++){
			output = p.newdefault(outposX+i*20, outposY+50, "out~",i+1);
			output.setattr("varname", "out_"+i);
			p.connect(outUnpack, i, output, 0);

		
		}
	
	}