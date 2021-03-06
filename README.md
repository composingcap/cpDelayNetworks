# cpDelayNetworks
<p align="left">
  <img width="460" height="460" src="https://github.com/composingcap/cpDelayNetworks/blob/master/icon.png">
</p>

<b>Place this folder in you max 8 packages folder.  This must be used in max 8 due to the use of the mc wrapper</b>

<i>Note: the docs for the modules are in progress. The maxref file for the mesh is out of date and help files for cp.grainFlow.live~ and cp.grainFlow.network~ are in need of a major update. </i>

A collection of Max abstractions that can both be used to build and that do build feedback delay systems. The modules are are follows:

## cp.wgMesh~ 
Generates a feedback delay network in the shape of a wave guide mesh. It has built in functions to build both rectangular and polar meshes.  More features will be added to make it easier to manupulate delay pairs and perhaps more options for mesh shapes. 

## cp.multitap~
A fairly normal multitap delay which allows the user to set n taps. It is useful for creating early reflections or comb-like sounds with an FIR approach. 
