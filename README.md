# cpDelayNetworks
<p align="left">
  <img width="460" height="460" src="https://github.com/composingcap/cpDelayNetworks/blob/master/icon.png">
</p>

A collection of Max abstractions that can both be used to build and that do build feedback delay systems. The modules are are follows:

## cp.grainFlow~
A sample acurate granular synthisis engine that outputs grains to seperate multichannel tracks that can be easily bussed.  There are several abstractions that do things for the user such as create a live granulator and a network of granulators of n size.

## cp.wgMesh~ 
Generates a feedback delay network in the shape of a wave guide mesh. It has built in functions to build both rectangular and polar meshes.  More features will be added to make it easier to manupulate delay pairs and perhaps more options for mesh shapes. 

## cp.multitap~
A fairly normal multitap delay which allows the user to set n taps. It is useful for creating early reflections or comb-like sounds with an FIR approach. 
