function AE3D_Export(thisObj) {

	var self = this;

	self.RET = '\r';
	self.ABOUT = 'AE3D Export, v1.16 (2008)' + '\n' +
				'exports the selected layers and cameras within' + '\n' +
				'the work area to Maya, 3ds Max, or Lightwave.' + '\n\n' +
				'by Ryan Gilmore (www.urbanspaceman.net)'+ '\n\n' +
				'with coding help from Nab (www.nabscripts.com)' + '\n' +
				'and others on the AE Enhancers forum (www.aenhancers.com)';
	self.APP_VERSION = parseFloat(app.version);
	self.FILE_FOLDER = '~/Desktop';
	self.FILE_NAME = 'Untitled.ma';
	self.FILE_PATH = self.FILE_FOLDER + '/' + self.FILE_NAME;
	self.FILE_PATH_SET = false;
	self.RADIOBUTTON_ON = 1;
	self.WORLD_CENTER = [0, 0,0];
	self.WORLD_SCALE = [1, 0.0254, 1];
	self.RATIO = [0.8592, 0.9, 0.9481481, 1.0, 1.0186, 1.0667, 1.2, 1.333, 1.4222, 1.5, 1.8962962, 2];
	// [0]D2 NTSC, [1]D1 NTSC, [2]D4 Stan, [3]SQUARE, [4]D2 PAL, [5]D1 PAL, [6]D1 NTSC wide, [7]HDV, [8]D1 PAL wide, [9]DVCPROHD, [10]D4 Ana, [11]Ana2:1
	self.ORIGINAL_ASPECT = 1;
	self.HEIGHT = ''; // set dynamically
	self.WIDTH = ''; // set dynamically
	self.MAYA_FB_H = 1;
	self.FPS_NAME = ['ntsc', 'pal', 'film', 'game', 'show', 'ntscf', 'palf'];
	self.LAYER_TYPE = 'Layer';
	self.LAYER_WAS_2D = false;
	self.LAYER_IS_ANIMATED = [false, false, false, false, false, false, false, false, false, false];
	self.LAYER_ORIG_NAMES = [];
	self.LAYER_NAMES = [];
	self.LAYER_NAME_MATCH = false;
	self.LAYER_NAME_TOO_LONG = false;
	self.LAYER_NAME = ''; // set dynamically
	self.SHORT_LAYER_NAME = ''; // set dynamically
	self.SCENE_STRING = ''; // set dynamically
	self.LAYER_KEYS_STRING = ''; // set dynamically
	self.SAFE_DUR = 180; // 3 minutes
	self.SAFE_DUR_WNG = 'Warning. The composition work area exceeds ' + self.SAFE_DUR + ' seconds. Do you want to continue ?';

	//UI
	self.MAIN_WINDOW = null;
	self.OPTIONS_WINDOW = null;
	self.USER_OPTIONS = {
		originShift: true,
		scaleSlider: -3,
		extraMayaCams: false
	}

	// Private

	function radiansToDegrees(r){
		return r * (180 / Math.PI);
	}
	function degreesToRadians(d){
		return d * ( Math.PI / 180 );
	}
	function removeForbiddenCharacters(str) {
		FirstChar = str.charAt(0);
		if (FirstChar>'0' && FirstChar<'9') {str='L' + str};
		return str.replace(/[^a-zA-Z0-9]+/g,'');
	}
	function addSuffixIfMissing (Str){
		if (Str.indexOf('.') == -1)
		{
			var suffix = '';
			if (self.RADIOBUTTON_ON == 1)			{suffix='.ma'}
			else if (self.RADIOBUTTON_ON == 2)	{suffix='.ms'}
			else {suffix='.lws'};
			Str = Str + suffix;
		}
		return (Str);
	}
	function storeOriginalLayerNames (selLayers){
		for (var i = 0; i<selLayers.length; i++)
		{
			var layer = selLayers[i];
			self.LAYER_ORIG_NAMES[i] = layer.name;
		}
	}
	function checkForBadLayerNames (selLayers){
		// shorten long names
		for (var i = 0; i<selLayers.length; i++)
		{
			var layer = selLayers[i];
			if (layer.name.length > 15)
			{
				layer.name = layer.name.substring(0, 15);
				self.LAYER_NAME_TOO_LONG = true;
			}
		}
		// get rid of duplicate names
		var NumMatches = 0;
		for (var i = 0; i<selLayers.length; i++)
		{
			var layer = selLayers[i];
			self.LAYER_NAMES[i] = layer.name;
		}
		for (var i = 0; i<selLayers.length; i++)
		{
			var heroLayer = self.LAYER_NAMES[i];
			for (j = 0;j<selLayers.length;j++)
			{
				if (heroLayer == self.LAYER_NAMES[j]) {NumMatches += 1}
			}
		}
		if (NumMatches > selLayers.length)
		{
			self.LAYER_NAME_MATCH = true;
			for (var i = 0; i<selLayers.length; i++)
			{
				selLayers[i].name = selLayers[i].name + 'CC' + (i+1);
			}
		}
	}
	function restoreLayerNames (selLayers){
		if (self.LAYER_NAME_MATCH == true || self.LAYER_NAME_TOO_LONG == true)
		{
			for (var i = 0; i<selLayers.length; i++)
			{
				selLayers[i].name = self.LAYER_ORIG_NAMES[i] ;
			}
		}
	}
	function getTotalFrames(comp){
		return Math.round((comp.workAreaDuration / comp.frameDuration));
	}
	function getFrameAspect(){
		return (Math.round(self.WIDTH * self.ORIGINAL_ASPECT)) / self.HEIGHT;
	}
	function getPreciseCompPAR(comp){
		var compPAR;
		switch (comp.pixelAspect)
		{
			case 0.86:
			compPAR = self.RATIO[0];
			break;
			case 0.9:
			compPAR = self.RATIO[1];
			break;
			case 0.95:
			compPAR = self.RATIO[2];
			break;
			case 1.0:
			compPAR = self.RATIO[3];
			break;
			case 1.02:
			compPAR = self.RATIO[4];
			break;
			case 1.07:
			compPAR = self.RATIO[5];
			break;
			case 1.2:
			compPAR = self.RATIO[6];
			break;
			case 1.33:
			compPAR = self.RATIO[7];
			break;
			case 1.42:
			compPAR = self.RATIO[8];
			break;
			case 1.5:
			compPAR = self.RATIO[9];
			break;
			case 1.9:
			compPAR = self.RATIO[10];
			break;
			case 2:
			compPAR = self.RATIO[11];
			break;
			default:
			compPAR = comp.pixelAspect;
			break;
		}
		return compPAR
	}
	function getFPSName(comp){
		var fpsName;
		switch (comp.frameRate)
		{
			case 30:
			fpsName = self.FPS_NAME[0];
			break;
			case 25:
			fpsName = self.FPS_NAME[1];
			break;
			case 24:
			fpsName = self.FPS_NAME[2];
			break;
			case 15:
			fpsName = self.FPS_NAME[3];
			break;
			case 48:
			fpsName = self.FPS_NAME[4];
			break;
			case 60:
			fpsName = self.FPS_NAME[5];
			break;
			case 50:
			fpsName = self.FPS_NAME[6];
			break;
			default:
			fpsName = self.FPS_NAME[0];
			break;
		}
		return fpsName;
	}
	function getFLenOrFOVorZFacFromZoom(comp, zoomVal){
		var compPAR = getPreciseCompPAR(comp);
		var frameAspect = getFrameAspect();
		var hFOV = Math.atan((0.5 * comp.width * compPAR) / zoomVal);
		if (self.RADIOBUTTON_ON == 1) // focal length (Maya)
		{
			var mayaFB = frameAspect * self.MAYA_FB_H;
			return 25.4 * ((0.5 * mayaFB) / Math.tan(hFOV));
		}
		else if (self.RADIOBUTTON_ON == 2)  // fov (MAX)
		{
			return 2 * radiansToDegrees(hFOV);
		}
		else if (self.RADIOBUTTON_ON == 3) // zoom factor (Lightwave)
		{
			return frameAspect / Math.tan(hFOV);
		}
	}
	function nonSquareToSquare (comp){
		if (self.ORIGINAL_ASPECT != 1)
		{
			var WorldCenterNull = comp.layers.addNull(comp.duration);
			WorldCenterNull.name = 'WorldCenter';
			WorldCenterNull.startTime = 0;
			for (i = 2;i<=comp.numLayers;i++)
			{
				if (comp.layer(i).parent == null)
				{
					comp.layer(i).parent = WorldCenterNull;
				}
			}
			var squareWidth = Math.round( self.WIDTH * self.ORIGINAL_ASPECT );
			comp.width = squareWidth;
			comp.pixelAspect = 1;
			WorldCenterNull.position.setValue([squareWidth/2, comp.height/2]);
		}
	}
	function squareToNonSquare (comp){
		if (self.ORIGINAL_ASPECT != 1)
		{
			comp.layer('WorldCenter').position.setValue([self.WIDTH/2, comp.height/2]);
			comp.pixelAspect = self.ORIGINAL_ASPECT;
			comp.width = self.WIDTH;
			comp.layer('WorldCenter').remove();
		}
	}
	function checkLayerType(layer){
		if (layer.zoom != null)
		{
			self.LAYER_TYPE='Camera';
		}
		else if (layer.property('Intensity') != null)
		{
			self.LAYER_TYPE='Light';
		}
		else
		{
			self.LAYER_TYPE='Layer';
			if (layer.threeDLayer == false)
			{
				layer.threeDLayer = true;
				self.LAYER_WAS_2D = true;
			}
		}
	}
	function DataContainer(){
		var data = new Object();
		data.xpos = ''; // Maya and Lightwave, one parameter at a time
		data.ypos = '';
		data.zpos = '';
		data.xscal = '';
		data.yscal = '';
		data.zscal = '';
		data.xrot = '';
		data.yrot = '';
		data.zrot = '';
		data.flen = '';
		data.keys = ''; // Max, all paramerters one frame at a time
		return data;
	}
	function collectValueAtCurrentTime_ZYX_Camera (comp, layerCopy, layerCopyParent, t){
		var temp_xpos = layerCopyParent.position.valueAtTime(t, false)[0];
		var temp_ypos = layerCopyParent.position.valueAtTime(t, false)[1];
		var temp_zpos = layerCopyParent.position.valueAtTime(t, false)[2];
		var temp_xscal = 100;
		var temp_yscal = 100;
		var temp_zscal = 100;
		var temp_xrot = layerCopy.rotationX.valueAtTime(t, false);
		var temp_yrot = layerCopy.orientation.valueAtTime(t, false)[1];
		var temp_zrot = layerCopyParent.rotationZ.valueAtTime(t, false);
		var temp_flen = getFLenOrFOVorZFacFromZoom(comp, layerCopy.zoom.valueAtTime(t, false) / (layerCopyParent.scale.valueAtTime(t, false)[0]/100) );
		return [temp_xpos, temp_ypos, temp_zpos, temp_xscal, temp_yscal, temp_zscal, temp_xrot, temp_yrot, temp_zrot, temp_flen];
	}
	function collectValueAtCurrentTime_ZYX_Layer (comp, layerCopy, layerCopyParent, t){
		var temp_xpos = layerCopyParent.position.valueAtTime(t, false)[0];
		var temp_ypos = layerCopyParent.position.valueAtTime(t, false)[1];
		var temp_zpos = layerCopyParent.position.valueAtTime(t, false)[2];
		var temp_xscal = layerCopy.scale.valueAtTime(t, false)[0];
		var temp_yscal = layerCopy.scale.valueAtTime(t, false)[1];
		var temp_zscal = layerCopy.scale.valueAtTime(t, false)[2];
		var temp_xrot = layerCopy.rotationX.valueAtTime(t, false);
		var temp_yrot = layerCopy.orientation.valueAtTime(t, false)[1];
		var temp_zrot = layerCopyParent.rotationZ.valueAtTime(t, false);
		var temp_flen = '';
		return [temp_xpos, temp_ypos, temp_zpos, temp_xscal, temp_yscal, temp_zscal, temp_xrot, temp_yrot, temp_zrot, temp_flen];
	}
	function collectValueAtCurrentTime_YXZ_Camera (comp, layerCopy, layerCopyParent, t){
		var temp_xpos = layerCopyParent.position.valueAtTime(t, false)[0];
		var temp_ypos = layerCopyParent.position.valueAtTime(t, false)[1];
		var temp_zpos = layerCopyParent.position.valueAtTime(t, false)[2];
		var temp_xscal = 100;
		var temp_yscal = 100;
		var temp_zscal = 100;
		var temp_xrot = layerCopy.rotationX.valueAtTime(t, false);
		var temp_yrot = layerCopy.orientation.valueAtTime(t, false)[1];
		var temp_zrot = layerCopy.rotationZ.valueAtTime(t, false);
		var temp_flen = getFLenOrFOVorZFacFromZoom(comp, layerCopy.zoom.valueAtTime(t, false) / (layerCopyParent.scale.valueAtTime(t, false)[0]/100) );
		return [temp_xpos, temp_ypos, temp_zpos, temp_xscal, temp_yscal, temp_zscal, temp_xrot, temp_yrot, temp_zrot, temp_flen];
	}
	function collectValueAtCurrentTime_YXZ_Layer (comp, layerCopy, layerCopyParent, t){
		var temp_xpos = layerCopyParent.position.valueAtTime(t, false)[0];
		var temp_ypos = layerCopyParent.position.valueAtTime(t, false)[1];
		var temp_zpos = layerCopyParent.position.valueAtTime(t, false)[2];
		var temp_xscal = layerCopy.scale.valueAtTime(t, false)[0];
		var temp_yscal = layerCopy.scale.valueAtTime(t, false)[1];
		var temp_zscal = layerCopy.scale.valueAtTime(t, false)[2];
		var temp_xrot = layerCopy.rotationX.valueAtTime(t, false);
		var temp_yrot = layerCopy.orientation.valueAtTime(t, false)[1];
		var temp_zrot = layerCopy.rotationZ.valueAtTime(t, false);
		var temp_flen = '';
		return [temp_xpos, temp_ypos, temp_zpos, temp_xscal, temp_yscal, temp_zscal, temp_xrot, temp_yrot, temp_zrot, temp_flen];
	}
	function storeValueAtCurrentTime_Maya (data, frameCounter, layerState, worldScale){
		if (self.LAYER_IS_ANIMATED[0] == true || frameCounter == 1) {data.xpos += frameCounter + ' ' + (layerState[0] - self.WORLD_CENTER[0]) * worldScale + ' ';};
		if (self.LAYER_IS_ANIMATED[1] == true || frameCounter == 1) {data.ypos += frameCounter + ' ' + (-(layerState[1] - self.WORLD_CENTER[1])) * worldScale + ' ';};
		if (self.LAYER_IS_ANIMATED[2] == true || frameCounter == 1) {data.zpos += frameCounter + ' ' + (-layerState[2]) * worldScale + ' ';};
		// if (self.LAYER_IS_ANIMATED[3] == true || frameCounter == 1) {data.xscal += frameCounter + ' ' + layerState[3]*0.572957782866373 + ' ';};
		// if (self.LAYER_IS_ANIMATED[4] == true || frameCounter == 1) {data.yscal += frameCounter + ' ' + layerState[4]*0.572957782866373 + ' ';};
		// if (self.LAYER_IS_ANIMATED[5] == true || frameCounter == 1) {data.zscal += frameCounter + ' ' + layerState[5]*0.572957782866373 + ' ';};
		if (self.LAYER_IS_ANIMATED[3] == true || frameCounter == 1) {data.xscal += frameCounter + ' ' + 1 + ' ';};
		if (self.LAYER_IS_ANIMATED[4] == true || frameCounter == 1) {data.yscal += frameCounter + ' ' + 1 + ' ';};
		if (self.LAYER_IS_ANIMATED[5] == true || frameCounter == 1) {data.zscal += frameCounter + ' ' + 1 + ' ';};
		if (self.LAYER_IS_ANIMATED[6] == true || frameCounter == 1) {data.xrot += frameCounter + ' ' + layerState[6] + ' ';};
		if (self.LAYER_IS_ANIMATED[7] == true || frameCounter == 1) {data.yrot += frameCounter + ' ' + (-layerState[7]) + ' ';};
		if (self.LAYER_IS_ANIMATED[8] == true || frameCounter == 1) {data.zrot += frameCounter + ' ' + (-layerState[8]) + ' '; };
		if (self.LAYER_IS_ANIMATED[9] == true || frameCounter == 1) {data.flen += frameCounter + ' ' + layerState[9] + ' ';};
	}
	function storeValueAtCurrentTime_Max (data, frameCounter, layerState, worldScale){
		var xpos = (layerState[0] - self.WORLD_CENTER[0]) * worldScale;
		var ypos = (-(layerState[1] - self.WORLD_CENTER[1])) * worldScale;
		var zpos = -layerState[2] * worldScale;
		var xscal = layerState[3] / 100;
		var yscal = layerState[4] / 100;
		var zscal = layerState[5] / 100;
		var xrot = layerState[6];
		var yrot = -layerState[7];
		var zrot = -layerState[8];
		var fov = layerState[9];
		var positionLine = '';
		var scaleLine = '';
		var rotationXLine = '';
		var rotationYLine = '';
		var rotationZLine = '';
		var fovLine = '';
		if (self.LAYER_IS_ANIMATED[0] == true || frameCounter == 1) {positionLine = 'at time ' + (frameCounter-1) + ' ' + self.SHORT_LAYER_NAME + '.pos = [' + xpos + ',' + ypos + ',' + zpos+ ']' + '\n'};
		if (self.LAYER_IS_ANIMATED[3] == true || frameCounter == 1) {scaleLine = 'at time ' + (frameCounter-1) + ' ' + self.SHORT_LAYER_NAME + '.scale = [' + xscal + ',' + yscal + ',' + zscal + ']' + '\n' + '\n';};
		if (self.LAYER_IS_ANIMATED[6] == true || frameCounter == 1) {rotationXLine = 'at time ' + (frameCounter-1) + ' ' + self.SHORT_LAYER_NAME + '.rotation.x_rotation = ' + xrot + '\n'};
		if (self.LAYER_IS_ANIMATED[7] == true || frameCounter == 1) {rotationYLine = 'at time ' + (frameCounter-1) + ' ' + self.SHORT_LAYER_NAME + '.rotation.y_rotation = ' + yrot + '\n'};
		if (self.LAYER_IS_ANIMATED[8] == true || frameCounter == 1) {rotationZLine = 'at time ' + (frameCounter-1) + ' ' + self.SHORT_LAYER_NAME + '.rotation.z_rotation = ' + zrot + '\n'};
		if (self.LAYER_IS_ANIMATED[9] == true || frameCounter == 1) {fovLine = 'at time ' + (frameCounter-1) + ' ' + self.SHORT_LAYER_NAME + '.fov = ' + fov + '\n' + '\n';};
		if (self.LAYER_TYPE == 'Camera')
		{
			data.keys += positionLine +
			rotationXLine +
			rotationZLine +
			rotationYLine +
			fovLine 			;
		}
		else // if Light or Layer
		{
			data.keys += positionLine +
			rotationXLine +
			rotationZLine +
			rotationYLine +
			scaleLine 		;
		}
	}
	function storeValueAtCurrentTime_Lightwave (comp, data, frameCounter, layerState, worldScale, t){
		var curTime = t - comp.workAreaStart;
		if (self.LAYER_IS_ANIMATED[0] == true || frameCounter == 1) {data.xpos += '  Key ' + (layerState[0] - self.WORLD_CENTER[0]) * worldScale + ' ' + curTime + ' 3 0 0 0 0 0 0' + '\n';};
		if (self.LAYER_IS_ANIMATED[1] == true || frameCounter == 1) {data.ypos += '  Key ' + (-((layerState[1] - self.WORLD_CENTER[1]) * worldScale)) + ' ' + curTime + ' 3 0 0 0 0 0 0' + '\n';};
		if (self.LAYER_IS_ANIMATED[2] == true || frameCounter == 1) {data.zpos += '  Key ' + layerState[2]  * worldScale + ' ' + curTime + ' 3 0 0 0 0 0 0' + '\n';};
		if (self.LAYER_IS_ANIMATED[3] == true || frameCounter == 1) {data.xscal += '  Key ' + layerState[3]  / 100 + ' ' + curTime + ' 3 0 0 0 0 0 0' + '\n';};
		if (self.LAYER_IS_ANIMATED[4] == true || frameCounter == 1) {data.yscal += '  Key ' + layerState[4] 	/ 100 + ' ' + curTime + ' 3 0 0 0 0 0 0' + '\n';};
		if (self.LAYER_IS_ANIMATED[5] == true || frameCounter == 1) {data.zscal += '  Key ' + layerState[5]	/ 100 + ' ' + curTime + ' 3 0 0 0 0 0 0' + '\n';};
		if (self.LAYER_IS_ANIMATED[6] == true || frameCounter == 1) {data.xrot += '  Key ' + (-(degreesToRadians(layerState[6]))) + ' ' + curTime + ' 3 0 0 0 0 0 0' + '\n';};
		if (self.LAYER_IS_ANIMATED[7] == true || frameCounter == 1) {data.yrot += '  Key ' + degreesToRadians(layerState[7]) + ' ' + curTime + ' 3 0 0 0 0 0 0' + '\n';};
		if (self.LAYER_IS_ANIMATED[8] == true || frameCounter == 1) {data.zrot += '  Key ' + (-(degreesToRadians(layerState[8]))) + ' ' + curTime + ' 3 0 0 0 0 0 0' + '\n';};
		if (self.LAYER_IS_ANIMATED[9] == true || frameCounter == 1) {data.flen += '  Key ' + layerState[9] + ' ' + curTime + ' 0 0 0 0 0 0 0' + '\n';};
	}
	function checkChannelsForAnimation(layer){
		if (self.LAYER_TYPE == 'Camera')
		{
			if (layer.position.isTimeVarying == true) {self.LAYER_IS_ANIMATED[0] = true;self.LAYER_IS_ANIMATED[1] = true;self.LAYER_IS_ANIMATED[2] = true;};
			if (layer.orientation.isTimeVarying == true) {self.LAYER_IS_ANIMATED[6] = true;self.LAYER_IS_ANIMATED[7] = true;self.LAYER_IS_ANIMATED[8] = true;};
			if (layer.rotationX.isTimeVarying == true) {self.LAYER_IS_ANIMATED[6] = true;self.LAYER_IS_ANIMATED[7] = true;self.LAYER_IS_ANIMATED[8] = true;};
			if (layer.rotationY.isTimeVarying == true) {self.LAYER_IS_ANIMATED[6] = true;self.LAYER_IS_ANIMATED[7] = true;self.LAYER_IS_ANIMATED[8] = true;};
			if (layer.rotation.isTimeVarying == true) {self.LAYER_IS_ANIMATED[6] = true;self.LAYER_IS_ANIMATED[7] = true;self.LAYER_IS_ANIMATED[8] = true;};
			if (layer.zoom.isTimeVarying == true) {self.LAYER_IS_ANIMATED[9] = true;};
			if (layer.pointOfInterest != null)
			{
				self.LAYER_IS_ANIMATED[6] = true; self.LAYER_IS_ANIMATED[7] = true; self.LAYER_IS_ANIMATED[8] = true;
			}
		}
		else if (self.LAYER_TYPE == 'Light')
		{
			if (layer.position != null)
			{
				if (layer.position.isTimeVarying == true) {self.LAYER_IS_ANIMATED[0] = true;self.LAYER_IS_ANIMATED[1] = true;self.LAYER_IS_ANIMATED[2] = true;};
			}
			if (layer.orientation != null)
			{
				if (layer.orientation.isTimeVarying == true) {self.LAYER_IS_ANIMATED[6] = true;self.LAYER_IS_ANIMATED[7] = true;self.LAYER_IS_ANIMATED[8] = true;};
				if (layer.rotationX.isTimeVarying == true) {self.LAYER_IS_ANIMATED[6] = true;self.LAYER_IS_ANIMATED[7] = true;self.LAYER_IS_ANIMATED[8] = true;};
				if (layer.rotationY.isTimeVarying == true) {self.LAYER_IS_ANIMATED[6] = true;self.LAYER_IS_ANIMATED[7] = true;self.LAYER_IS_ANIMATED[8] = true;};
				if (layer.rotation.isTimeVarying == true) {self.LAYER_IS_ANIMATED[6] = true;self.LAYER_IS_ANIMATED[7] = true;self.LAYER_IS_ANIMATED[8] = true;};
			}
			if (layer.pointOfInterest != null)
			{
				self.LAYER_IS_ANIMATED[6] = true; self.LAYER_IS_ANIMATED[7] = true; self.LAYER_IS_ANIMATED[8] = true;
			}
		}
		else if (self.LAYER_TYPE == 'Layer')
		{
			if (layer.position.isTimeVarying == true) {self.LAYER_IS_ANIMATED[0] = true;self.LAYER_IS_ANIMATED[1] = true;self.LAYER_IS_ANIMATED[2] = true;};
			if (layer.scale.isTimeVarying == true) {self.LAYER_IS_ANIMATED[3] = true;self.LAYER_IS_ANIMATED[4] = true;self.LAYER_IS_ANIMATED[5] = true;};
			if (layer.orientation.isTimeVarying == true) {self.LAYER_IS_ANIMATED[6] = true;self.LAYER_IS_ANIMATED[7] = true;self.LAYER_IS_ANIMATED[8] = true;};
			if (layer.rotationX.isTimeVarying == true) {self.LAYER_IS_ANIMATED[6] = true;self.LAYER_IS_ANIMATED[7] = true;self.LAYER_IS_ANIMATED[8] = true;};
			if (layer.rotationY.isTimeVarying == true) {self.LAYER_IS_ANIMATED[6] = true;self.LAYER_IS_ANIMATED[7] = true;self.LAYER_IS_ANIMATED[8] = true;};
			if (layer.rotation.isTimeVarying == true) {self.LAYER_IS_ANIMATED[6] = true;self.LAYER_IS_ANIMATED[7] = true;self.LAYER_IS_ANIMATED[8] = true;};
		}
	}
	function AssumeLayerIsAnimated(layer){
		if (layer.parent.name == 'WorldCenter') // doesn't count if the parent is this, so consider it unparented
		{
			checkChannelsForAnimation(layer);
		}
		else // since its parented, assume all layers are animated
		{
			for (var j = 0;j<=9;j++)
			{
				self.LAYER_IS_ANIMATED[j] = true;
			}
		}
	}
	function checkForAnimation(layer){
		if (layer.parent != null) // if it has a parent
		{
			AssumeLayerIsAnimated(layer);
		}
		else
		{
			checkChannelsForAnimation(layer);
		}
	}
	function resetComposition (comp, layer){
		for (var m = 0; m <= 9; m++)
		{
			self.LAYER_IS_ANIMATED[m] = false;
		}
		if (self.LAYER_WAS_2D == true)
		{
			layer.threeDLayer = false;
			self.LAYER_WAS_2D = false;
		}
		comp.layer(self.SHORT_LAYER_NAME + '_copy').remove(); 			// remove the cooked layer
		comp.layer(self.SHORT_LAYER_NAME + '_copy_parent').remove(); 	// remove the cooked layer's parent
	}
	function totalFramesByChannel(totalFrames){
		var totalFramesArray = [];
		for (var n = 0; n <= 9; n++) {
			if (self.LAYER_IS_ANIMATED[n] == false) {
				totalFramesArray[n] = 2
			} else {
				totalFramesArray[n] = totalFrames
			};
		}
		return totalFramesArray;
	}
	function getData(comp, data){ // grabs the data of each frame and stores it in a set of strings
		var worldScale = self.WORLD_SCALE[self.RADIOBUTTON_ON-1] * ( Math.pow(10, self.USER_OPTIONS['scaleSlider']) );
		var layerCopyParent = comp.layer(self.SHORT_LAYER_NAME + '_copy_parent');
		var layerCopy = comp.layer(self.SHORT_LAYER_NAME + '_copy');
		var totalFrames = getTotalFrames(comp);
		var frameCounter = 1;
		// origin shift
		if (self.USER_OPTIONS['originShift'] == true)
		{
			self.WORLD_CENTER = [comp.width/2, comp.height/2, 0];
		}
		else
		{
			self.WORLD_CENTER = [0, 0,0];
		}
		// warning
		if (comp.workAreaDuration > self.SAFE_DUR)
		{
			if (!confirm(self.SAFE_DUR_WNG, true, 'AE3D EXPORT'))
			{
				return false;
			}
		}
		// process layer
		if (self.RADIOBUTTON_ON == 1) // Maya
		{
			if (self.LAYER_TYPE == 'Camera')
			{
				for (var t = comp.workAreaStart; t < comp.workAreaStart + comp.workAreaDuration; t += comp.frameDuration)
				{
					clearOutput();
					self.MAIN_WINDOW.progress.text='Processing "' + self.LAYER_NAME + '" : ' + Math.round(((frameCounter/totalFrames)*100)-1) + ' %';
					var layerState = collectValueAtCurrentTime_ZYX_Camera (comp, layerCopy, layerCopyParent, t);
					storeValueAtCurrentTime_Maya (data, frameCounter, layerState, worldScale);
					frameCounter++;
				}
			}
			else // layer or light
			{
				for (var t = comp.workAreaStart; t < comp.workAreaStart + comp.workAreaDuration; t += comp.frameDuration)
				{
					clearOutput();
					self.MAIN_WINDOW.progress.text='Processing "' + self.LAYER_NAME + '" : ' + Math.round(((frameCounter/totalFrames)*100)-1) + ' %';
					var layerState = collectValueAtCurrentTime_ZYX_Layer (comp, layerCopy, layerCopyParent, t);
					storeValueAtCurrentTime_Maya (data, frameCounter, layerState, worldScale);
					frameCounter++;
				}
			}
		}
		else if (self.RADIOBUTTON_ON == 2) // Max
		{
			if (self.LAYER_TYPE == 'Camera')
			{
				for (var t = comp.workAreaStart; t < comp.workAreaStart + comp.workAreaDuration; t += comp.frameDuration)
				{
					clearOutput();
					self.MAIN_WINDOW.progress.text='Processing "' + self.LAYER_NAME + '" : ' + Math.round(((frameCounter/totalFrames)*100)-1) + ' %';
					var layerState = collectValueAtCurrentTime_ZYX_Camera (comp, layerCopy, layerCopyParent, t);
					storeValueAtCurrentTime_Max (data, frameCounter, layerState, worldScale);
					frameCounter++;
				}
			}
			else // layer or light
			{
				for (var t = comp.workAreaStart; t < comp.workAreaStart + comp.workAreaDuration; t += comp.frameDuration)
				{
					clearOutput();
					self.MAIN_WINDOW.progress.text='Processing "' + self.LAYER_NAME + '" : ' + Math.round(((frameCounter/totalFrames)*100)-1) + ' %';
					var layerState = collectValueAtCurrentTime_ZYX_Layer (comp, layerCopy, layerCopyParent, t)
					storeValueAtCurrentTime_Max (data, frameCounter, layerState, worldScale);
					frameCounter++;
				}
			}
		}
		else if (self.RADIOBUTTON_ON == 3) // Lightwave
		{
			if (self.LAYER_TYPE == 'Camera')
			{
				for (var t = comp.workAreaStart; t < comp.workAreaStart + comp.workAreaDuration; t += comp.frameDuration)
				{
					clearOutput();
					self.MAIN_WINDOW.progress.text='Processing "' + self.LAYER_NAME + '" : ' + Math.round(((frameCounter/totalFrames)*100)-1) + ' %';
					var layerState = collectValueAtCurrentTime_YXZ_Camera (comp, layerCopy, layerCopyParent, t);
					storeValueAtCurrentTime_Lightwave (comp, data, frameCounter, layerState, worldScale, t);
					frameCounter++;
				}
			}
			else // layer or light
			{
				for (var t = comp.workAreaStart; t < comp.workAreaStart + comp.workAreaDuration; t += comp.frameDuration)
				{
					clearOutput();
					self.MAIN_WINDOW.progress.text='Processing "' + self.LAYER_NAME + '" : ' + Math.round(((frameCounter/totalFrames)*100)-1) + ' %';
					var layerState = collectValueAtCurrentTime_YXZ_Layer (comp, layerCopy, layerCopyParent, t);
					storeValueAtCurrentTime_Lightwave (comp, data, frameCounter, layerState, worldScale, t);
					frameCounter++;
				}
			}
		}
		clearOutput();
	}
	function writeHeader(comp) {
		var worldScale = self.WORLD_SCALE[self.RADIOBUTTON_ON-1] * ( Math.pow(10, self.USER_OPTIONS['scaleSlider']) );
		var totalFrames =   getTotalFrames(comp);
		var frameAspect =   getFrameAspect();
		var fpsName =   getFPSName(comp);
		var mayaFB =   frameAspect * self.MAYA_FB_H;
		if (self.RADIOBUTTON_ON == 1) // MAYA
		{
			self.SCENE_STRING = '//Maya ASCII 6.0 scene' + '\n' +
			'//Name: ' + self.FILE_NAME + '\n' +
			'//Last modified: ' + (new Date()).toString() + '\n' +
			'requires maya "6.0";' + '\n' +
			'currentUnit -l meter -a degree -t ' + fpsName + ';' + '\n' +
			'' + '\n' ;
			if (self.USER_OPTIONS['extraMayaCams'] == true)
			{
				self.SCENE_STRING += 'createNode transform -s -n "persp";' + '\n' +
				'	setAttr ".v" yes;' + '\n' +
				'	setAttr ".s" -type "double3" 1 1 1 ;' + '\n' +
				'	setAttr ".t" -type "double3" ' + 5000*worldScale + ' ' + 3000*worldScale + ' ' + 5000*worldScale + ' ;'+ '\n' +
				'	setAttr ".r" -type "double3" -28 45 0 ;' + '\n' +
				'createNode camera -s -n "perspShape" -p "persp";' + '\n' +
				'	setAttr -k off ".v" no;' + '\n' +
				'	setAttr ".rnd" no;' + '\n' +
				'	setAttr ".fl" 35;' + '\n' +
				'	setAttr ".ncp" 1;' + '\n' +
				'	setAttr ".fcp" ' + 40000*worldScale + ';' + '\n' +
				'	setAttr ".coi" 822 ;' + '\n' +
				'	setAttr ".imn" -type "string" "persp";' + '\n' +
				'	setAttr ".den" -type "string" "persp_depth";' + '\n' +
				'	setAttr ".man" -type "string" "persp_mask";' + '\n' +
				'	setAttr ".hc" -type "string" "viewSet -p %camera";' + '\n' +
				'' + '\n' +
				'createNode transform -n "front";' + '\n' +
				'	setAttr ".t" -type "double3" 0 0 '+10000*worldScale+' ;' + '\n' +
				'createNode camera -s -n "frontShape" -p "front";' + '\n' +
				'	setAttr -k off ".v" no;' + '\n' +
				'	setAttr ".rnd" no;' + '\n' +
				'	setAttr ".coi" 100 ;' + '\n' +
				'	setAttr ".imn" -type "string" "front";' + '\n' +
				'	setAttr ".den" -type "string" "front_depth";' + '\n' +
				'	setAttr ".man" -type "string" "front_mask";' + '\n' +
				'	setAttr ".hc" -type "string" "viewSet -f %camera";' + '\n' +
				'   setAttr ".o" yes;' + '\n' +
				'   setAttr ".ow" 30;' + '\n' +
				'' + '\n' +
				'createNode transform -n "top";' + '\n' +
				'	setAttr ".t" -type "double3" 0 ' + 10000*worldScale + ' 0 ;' + '\n' +
				'	setAttr ".r" -type "double3" -90 0 0 ;' + '\n' +
				'createNode camera -s -n "topShape" -p "top";' + '\n' +
				'	setAttr -k off ".v" no;' + '\n' +
				'	setAttr ".rnd" no;' + '\n' +
				'	setAttr ".coi" 100 ;' + '\n' +
				'	setAttr ".imn" -type "string" "top";' + '\n' +
				'	setAttr ".den" -type "string" "top_depth";' + '\n' +
				'	setAttr ".man" -type "string" "top_mask";' + '\n' +
				'	setAttr ".hc" -type "string" "viewSet -t %camera";' + '\n' +
				'   setAttr ".o" yes;' + '\n' +
				'   setAttr ".ow" 30;' + '\n' +
				'' + '\n' +
				'createNode transform -n "side";' + '\n' +
				'	setAttr ".t" -type "double3" ' + 10000*worldScale + ' 0 0 ;' + '\n' +
				'	setAttr ".r" -type "double3" 0 90 0 ;' + '\n' +
				'createNode camera -s -n "sideShape" -p "side";' + '\n' +
				'	setAttr -k off ".v" no;' + '\n' +
				'	setAttr ".rnd" no;' + '\n' +
				'	setAttr ".coi" 100 ;' + '\n' +
				'	setAttr ".imn" -type "string" "side";' + '\n' +
				'	setAttr ".den" -type "string" "side_depth";' + '\n' +
				'	setAttr ".man" -type "string" "side_mask";' + '\n' +
				'	setAttr ".hc" -type "string" "viewSet -s %camera";' + '\n' +
				'   setAttr ".o" yes;' + '\n' +
				'   setAttr ".ow" 30;' + '\n' +
				'' + '\n' ;
			}
		}
		else if (self.RADIOBUTTON_ON == 2) // MAX
		{
			self.SCENE_STRING = 'global frameRate = ' + Math.round(comp.frameRate*100)/100 + '\n' +
			'' + '\n' +
			'renderPixelAspect = ' + self.ORIGINAL_ASPECT + '\n' +
			'renderWidth = ' + self.WIDTH + '\n' +
			'renderHeight = ' + self.HEIGHT + '\n' +
			'ticksPerFrame = (4800/frameRate)' + '\n' +
			'' + '\n' ;
		}
		else if (self.RADIOBUTTON_ON == 3) // Lightwave
		{
			self.SCENE_STRING = 'LWSC' + '\n' +
			'3' + '\n' +
			'' + '\n' +
			'RenderRangeType 0' + '\n' +
			'FirstFrame 1' + '\n' +
			'LastFrame ' + (totalFrames-1) + '\n' +
			'FrameStep 1' + '\n' +
			'RenderRangeArbitrary 1-60' + '\n' +
			'PreviewFirstFrame 0' + '\n' +
			'PreviewLastFrame ' + (totalFrames-1) + '\n' +
			'PreviewFrameStep 1' + '\n' +
			'CurrentFrame 0' + '\n' +
			'FramesPerSecond ' + Math.round(comp.frameRate*100)/100 + '\n' +
			'' + '\n' +
			'AmbientColor 1 1 1' + '\n' +
			'AmbientIntensity 0.05' + '\n' +
			'' + '\n' +
			'LightColor 1 1 1' + '\n' +
			'LightIntensity 1' + '\n' +
			'AffectCaustics 1' + '\n' +
			'LightType 0' + '\n' +
			'ShadowType 1' + '\n' +
			'ShadowColor 0 0 0' + '\n' +
			'' + '\n' ;
		}
	}
	function writeThisLayerIntoScene(comp, data) {
		var totalFrames = getTotalFrames(comp);
		var totalFramesBC = totalFramesByChannel(totalFrames);
		var frameAspect = getFrameAspect();
		var fpsName = getFPSName(comp);
		var mayaFB = frameAspect * self.MAYA_FB_H;
		if (self.RADIOBUTTON_ON == 1) // MAYA
		{
			if (self.LAYER_TYPE == 'Camera')
			{
				self.SCENE_STRING += 'createNode transform -n "' + self.SHORT_LAYER_NAME + '";' + '\n' +
				'    setAttr ".s" -type "double3" 100 100 100 ;' + '\n' +
				'createNode camera -n "' + self.SHORT_LAYER_NAME + 'Shape" -p "' + self.SHORT_LAYER_NAME + '";' + '\n' +
				'    setAttr -k off ".v";' + '\n' +
				'    setAttr ".rnd" yes;' + '\n' +
				'    setAttr ".ow" 10.0;' + '\n' +
				'    setAttr ".dof" no;' + '\n' +
				// '    setAttr ".s" no;' + '\n' + // causes error in maya
				// '    setAttr ".eo" 1.0;' + '\n' + // causes error in maya
				'    setAttr ".ff" 1;' + '\n' +
				'    setAttr ".cap" -type "double2" ' + mayaFB + ' ' + self.MAYA_FB_H + ';' + '\n' +
				'    setAttr ".fcp" 40000;' + '\n' +
				'    setAttr ".col" -type "float3" 0.0 0.0 0.0 ;' + '\n' +
				'    setAttr ".imn" -type "string" "' + self.SHORT_LAYER_NAME + '";' + '\n' +
				'    setAttr ".den" -type "string" "' + self.SHORT_LAYER_NAME + '_Depth";' + '\n' +
				'    setAttr ".man" -type "string" "' + self.SHORT_LAYER_NAME + '_Mask";' + '\n' +
				'' + '\n' +
				'createNode animCurveTL -n "' + self.SHORT_LAYER_NAME + '_TranslateX";' + '\n' +
				'    setAttr ".tan" 9;' + '\n' +
				'    setAttr ".wgt" no;' + '\n' +
				'    setAttr -s ' + totalFramesBC[0] + ' ".ktv[1:' + totalFramesBC[0] + ']" ' + data.xpos + ';' + '\n' +
				'' + '\n' +
				'createNode animCurveTL -n "' + self.SHORT_LAYER_NAME + '_TranslateY";' + '\n' +
				'    setAttr ".tan" 9;' + '\n' +
				'    setAttr ".wgt" no;' + '\n' +
				'    setAttr -s ' + totalFramesBC[1] + ' ".ktv[1:' + totalFramesBC[1] + ']" ' + data.ypos + ';' + '\n' +
				'' + '\n' +
				'createNode animCurveTL -n "' + self.SHORT_LAYER_NAME + '_TranslateZ";' + '\n' +
				'    setAttr ".tan" 9;' + '\n' +
				'    setAttr ".wgt" no;' + '\n' +
				'    setAttr -s ' + totalFramesBC[2] + ' ".ktv[1:' + totalFramesBC[2] + ']" ' + data.zpos + ';' + '\n' +
				'' + '\n' +
				'createNode animCurveTA -n "' + self.SHORT_LAYER_NAME + '_RotateX";' + '\n' +
				'    setAttr ".tan" 9;' + '\n' +
				'    setAttr ".wgt" no;' + '\n' +
				'    setAttr -s ' + totalFramesBC[6] + ' ".ktv[1:' + totalFramesBC[6] + ']" ' + data.xrot + ';' + '\n' +
				'' + '\n' +
				'createNode animCurveTA -n "' + self.SHORT_LAYER_NAME + '_RotateY";' + '\n' +
				'    setAttr ".tan" 9;' + '\n' +
				'    setAttr ".wgt" no;' + '\n' +
				'    setAttr -s ' + totalFramesBC[7] + ' ".ktv[1:' + totalFramesBC[7] + ']" ' + data.yrot + ';' + '\n' +
				'' + '\n' +
				'createNode animCurveTA -n "' + self.SHORT_LAYER_NAME + '_RotateZ";' + '\n' +
				'    setAttr ".tan" 9;' + '\n' +
				'    setAttr ".wgt" no;' + '\n' +
				'    setAttr -s ' + totalFramesBC[8] + ' ".ktv[1:' + totalFramesBC[8] + ']" ' + data.zrot + ';' + '\n' +
				'' + '\n' +
				'createNode animCurveTU -n "' + self.SHORT_LAYER_NAME + 'Shape_FocalLength";' + '\n' +
				'    setAttr ".tan" 9;' + '\n' +
				'    setAttr ".wgt" no;' + '\n' +
				'    setAttr -s ' + totalFramesBC[9] + ' ".ktv[1:' + totalFramesBC[9] + ']" ' + data.flen + ';' + '\n' +
				'' + '\n' +
				'connectAttr "' + self.SHORT_LAYER_NAME + '_TranslateX.o" "' + self.SHORT_LAYER_NAME + '.tx";' + '\n' +
				'connectAttr "' + self.SHORT_LAYER_NAME + '_TranslateY.o" "' + self.SHORT_LAYER_NAME + '.ty";' + '\n' +
				'connectAttr "' + self.SHORT_LAYER_NAME + '_TranslateZ.o" "' + self.SHORT_LAYER_NAME + '.tz";' + '\n' +
				'' + '\n' +
				'connectAttr "' + self.SHORT_LAYER_NAME + '_RotateX.o" "' + self.SHORT_LAYER_NAME + '.rx";' + '\n' +
				'connectAttr "' + self.SHORT_LAYER_NAME + '_RotateY.o" "' + self.SHORT_LAYER_NAME + '.ry";' + '\n' +
				'connectAttr "' + self.SHORT_LAYER_NAME + '_RotateZ.o" "' + self.SHORT_LAYER_NAME + '.rz";' + '\n' +
				'' + '\n' +
				'connectAttr "' + self.SHORT_LAYER_NAME + 'Shape_FocalLength.o""' + self.SHORT_LAYER_NAME + 'Shape.fl";' + '\n' +
				'' + '\n' ;
			}
			else // light or layer
			{
				self.SCENE_STRING += 'createNode transform -n "' + self.SHORT_LAYER_NAME + '";' + '\n' +
				'createNode locator -n "' + self.SHORT_LAYER_NAME + 'Shape" -p "' + self.SHORT_LAYER_NAME + '";' + '\n' +
				'    setAttr -k off ".v";' + '\n' +
				'' + '\n' +
				'createNode animCurveTL -n "' + self.SHORT_LAYER_NAME + '_TranslateX";' + '\n' +
				'    setAttr ".tan" 9;' + '\n' +
				'    setAttr ".wgt" no;' + '\n' +
				'    setAttr -s ' + totalFramesBC[0] + ' ".ktv[1:' + totalFramesBC[0] + ']" ' + data.xpos + ';' + '\n' +
				'' + '\n' +
				'createNode animCurveTL -n "' + self.SHORT_LAYER_NAME + '_TranslateY";' + '\n' +
				'    setAttr ".tan" 9;' + '\n' +
				'    setAttr ".wgt" no;' + '\n' +
				'    setAttr -s ' + totalFramesBC[1] + ' ".ktv[1:' + totalFramesBC[1] + ']" ' + data.ypos + ';' + '\n' +
				'' + '\n' +
				'createNode animCurveTL -n "' + self.SHORT_LAYER_NAME + '_TranslateZ";' + '\n' +
				'    setAttr ".tan" 9;' + '\n' +
				'    setAttr ".wgt" no;' + '\n' +
				'    setAttr -s ' + totalFramesBC[2] + ' ".ktv[1:' + totalFramesBC[2] + ']" ' + data.zpos + ';' + '\n' +
				'' + '\n' +
				'createNode animCurveTA -n "' + self.SHORT_LAYER_NAME + '_RotateX";' + '\n' +
				'    setAttr ".tan" 9;' + '\n' +
				'    setAttr ".wgt" no;' + '\n' +
				'    setAttr -s ' + totalFramesBC[6] + ' ".ktv[1:' + totalFramesBC[6] + ']" ' + data.xrot + ';' + '\n' +
				'' + '\n' +
				'createNode animCurveTA -n "' + self.SHORT_LAYER_NAME + '_RotateY";' + '\n' +
				'    setAttr ".tan" 9;' + '\n' +
				'    setAttr ".wgt" no;' + '\n' +
				'    setAttr -s ' + totalFramesBC[7] + ' ".ktv[1:' + totalFramesBC[7] + ']" ' + data.yrot + ';' + '\n' +
				'' + '\n' +
				'createNode animCurveTA -n "' + self.SHORT_LAYER_NAME + '_RotateZ";' + '\n' +
				'    setAttr ".tan" 9;' + '\n' +
				'    setAttr ".wgt" no;' + '\n' +
				'    setAttr -s ' + totalFramesBC[8] + ' ".ktv[1:' + totalFramesBC[8] + ']" ' + data.zrot + ';' + '\n' +
				'' + '\n' +
				'createNode animCurveTA -n "' + self.SHORT_LAYER_NAME + '_ScaleX";' + '\n' +
				'    setAttr ".tan" 9;' + '\n' +
				'    setAttr ".wgt" no;' + '\n' +
				'    setAttr -s ' + totalFramesBC[3] + ' ".ktv[1:' + totalFramesBC[3] + ']" ' + data.xscal + ';' + '\n' +
				'' + '\n' +
				'createNode animCurveTA -n "' + self.SHORT_LAYER_NAME + '_ScaleY";' + '\n' +
				'    setAttr ".tan" 9;' + '\n' +
				'    setAttr ".wgt" no;' + '\n' +
				'    setAttr -s ' + totalFramesBC[4] + ' ".ktv[1:' + totalFramesBC[4] + ']" ' + data.yscal + ';' + '\n' +
				'' + '\n' +
				'createNode animCurveTA -n "' + self.SHORT_LAYER_NAME + '_ScaleZ";' + '\n' +
				'    setAttr ".tan" 9;' + '\n' +
				'    setAttr ".wgt" no;' + '\n' +
				'    setAttr -s ' + totalFramesBC[5] + ' ".ktv[1:' + totalFramesBC[5] + ']" ' + data.zscal + ';' + '\n' +
				'' + '\n' +
				'connectAttr "' + self.SHORT_LAYER_NAME + '_TranslateX.o" "' + self.SHORT_LAYER_NAME + '.tx";' + '\n' +
				'connectAttr "' + self.SHORT_LAYER_NAME + '_TranslateY.o" "' + self.SHORT_LAYER_NAME + '.ty";' + '\n' +
				'connectAttr "' + self.SHORT_LAYER_NAME + '_TranslateZ.o" "' + self.SHORT_LAYER_NAME + '.tz";' + '\n' +
				'' + '\n' +
				'connectAttr "' + self.SHORT_LAYER_NAME + '_RotateX.o" "' + self.SHORT_LAYER_NAME + '.rx";' + '\n' +
				'connectAttr "' + self.SHORT_LAYER_NAME + '_RotateY.o" "' + self.SHORT_LAYER_NAME + '.ry";' + '\n' +
				'connectAttr "' + self.SHORT_LAYER_NAME + '_RotateZ.o" "' + self.SHORT_LAYER_NAME + '.rz";' + '\n' +
				'' + '\n' +
				'connectAttr "' + self.SHORT_LAYER_NAME + '_ScaleX.o" "' + self.SHORT_LAYER_NAME + '.sx";' + '\n' +
				'connectAttr "' + self.SHORT_LAYER_NAME + '_ScaleY.o" "' + self.SHORT_LAYER_NAME + '.sy";' + '\n' +
				'connectAttr "' + self.SHORT_LAYER_NAME + '_ScaleZ.o" "' + self.SHORT_LAYER_NAME + '.sz";' + '\n' +
				'' + '\n' ;
			}
		}
		else if (self.RADIOBUTTON_ON == 2) // MAX
		{
			if (self.LAYER_TYPE == 'Camera')
			{
				self.SCENE_STRING += self.SHORT_LAYER_NAME + ' = freecamera name:"' + self.SHORT_LAYER_NAME + '"' + '\n' +
				'set animate on' + '\n' +
				'' + '\n' +
				data.keys + '\n' ;
			}
			else // light or layer
			{
				self.SCENE_STRING += self.SHORT_LAYER_NAME + ' = Dummy()' + '\n' +
				self.SHORT_LAYER_NAME + '.name = "' + self.SHORT_LAYER_NAME + '"' + '\n' +
				'set animate on' + '\n' +
				'' + '\n' +
				data.keys + '\n' ;
			}
		}
		else if (self.RADIOBUTTON_ON == 3) // Lightwave
		{
			if (self.LAYER_TYPE == 'Camera')
			{
				self.SCENE_STRING += 'AddCamera' + '\n' +
				'CameraName ' + self.SHORT_LAYER_NAME + '\n' +
				'ShowCamera 1 2' + '\n' +
				'CameraMotion' + '\n' +
				'NumChannels 6' + '\n' +
				'Channel 0' + '\n' +
				'{ Envelope' + '\n' +
				'  ' + totalFramesBC[0]																						+ '\n' +
				data.xpos +
				'  Behaviors 1 1' + '\n' +
				'}' + '\n' +
				'Channel 1' + '\n' +
				'{ Envelope' + '\n' +
				'  ' + totalFramesBC[1]																						+ '\n' +
				data.ypos +
				'  Behaviors 1 1' + '\n' +
				'}' + '\n' +
				'Channel 2' + '\n' +
				'{ Envelope' + '\n' +
				'  ' + totalFramesBC[2]																						+ '\n' +
				data.zpos +
				'  Behaviors 1 1' + '\n' +
				'}' + '\n' +
				'Channel 3' + '\n' +
				'{ Envelope' + '\n' +
				'  ' + totalFramesBC[6]																						+ '\n' +
				data.yrot +
				'  Behaviors 1 1' + '\n' +
				'}' + '\n' +
				'Channel 4' + '\n' +
				'{ Envelope' + '\n' +
				'  ' + totalFramesBC[7]																						+ '\n' +
				data.xrot +
				'  Behaviors 1 1' + '\n' +
				'}' + '\n' +
				'Channel 5' + '\n' +
				'{ Envelope' + '\n' +
				'  ' + totalFramesBC[8]																						+ '\n' +
				data.zrot +
				'  Behaviors 1 1' + '\n' +
				'}' + '\n' +
				'' + '\n' +
				'ZoomFactor (envelope)' + '\n' +
				'{ Envelope' + '\n' +
				'  ' + totalFramesBC[9]																						+ '\n' +
				data.flen +
				'  Behaviors 1 1' + '\n' +
				'}' + '\n' +
				'ResolutionMultiplier 1.0' + '\n' +
				'FrameSize ' + self.WIDTH + ' ' + self.HEIGHT + '\n' +
				'PixelAspect ' + self.ORIGINAL_ASPECT + '\n' +
				'MaskPosition 0 0 ' + self.WIDTH + ' ' + self.HEIGHT + '\n' +
				'MotionBlur 0' + '\n' +
				'FieldRendering 0' + '\n' +
				'' + '\n' +
				'ApertureHeight 0.015' + '\n' +
				'Antialiasing 0' + '\n' +
				'AntiAliasingLevel -1' + '\n' +
				'ReconstructionFilter 0' + '\n' +
				'AdaptiveSampling 0' + '\n' +
				'' + '\n' ;
			}
			else // light or layer
			{
				self.SCENE_STRING += 'AddNullObject <' + self.SHORT_LAYER_NAME + '>' + '\n' +
				'ShowObject 7 3' + '\n' +
				'ObjectMotion' + '\n' +
				'NumChannels 9' + '\n' +
				'Channel 0' + '\n' +
				'{ Envelope' + '\n' +
				'  ' + totalFramesBC[0]																						+ '\n' +
				data.xpos +
				'  Behaviors 1 1' + '\n' +
				'}' + '\n' +
				'Channel 1' + '\n' +
				'{ Envelope' + '\n' +
				'  ' + totalFramesBC[1]																						+ '\n' +
				data.ypos +
				'  Behaviors 1 1' + '\n' +
				'}' + '\n' +
				'Channel 2' + '\n' +
				'{ Envelope' + '\n' +
				'  ' + totalFramesBC[2]																						+ '\n' +
				data.zpos +
				'  Behaviors 1 1' + '\n' +
				'}' + '\n' +
				'Channel 3' + '\n' +
				'{ Envelope' + '\n' +
				'  ' + totalFramesBC[6]																						+ '\n' +
				data.yrot +
				'  Behaviors 1 1' + '\n' +
				'}' + '\n' +
				'Channel 4' + '\n' +
				'{ Envelope' + '\n' +
				'  ' + totalFramesBC[7]																						+ '\n' +
				data.xrot +
				'  Behaviors 1 1' + '\n' +
				'}' + '\n' +
				'Channel 5' + '\n' +
				'{ Envelope' + '\n' +
				'  ' + totalFramesBC[8]																						+ '\n' +
				data.zrot +
				'  Behaviors 1 1' + '\n' +
				'}' + '\n' +
				'Channel 6' + '\n' +
				'{ Envelope' + '\n' +
				'  ' + totalFramesBC[3]																						+ '\n' +
				data.xscal +
				'  Behaviors 1 1' + '\n' +
				'}' + '\n' +
				'Channel 7' + '\n' +
				'{ Envelope' + '\n' +
				'  ' + totalFramesBC[4]																						+ '\n' +
				data.yscal +
				'  Behaviors 1 1' + '\n' +
				'}' + '\n' +
				'Channel 8' + '\n' +
				'{ Envelope' + '\n' +
				'  ' + totalFramesBC[5]																						+ '\n' +
				data.zscal +
				'  Behaviors 1 1' + '\n' +
				'}' + '\n' ;
			}
		}
	}
	function writeFooter(comp) {
		var totalFrames =   getTotalFrames(comp);
		var frameAspect =   getFrameAspect();
		if (self.RADIOBUTTON_ON == 1) // MAYA
		{
			self.SCENE_STRING += 'select -ne :time1;' + '\n' +
			'    setAttr ".o" 1;' + '\n' +
			'select -ne :defaultResolution;' + '\n' +
			'    setAttr ".w" ' + self.WIDTH + ';' + '\n' +
			'    setAttr ".h" ' + self.HEIGHT + ';' + '\n' +
			'    setAttr ".dar" ' + frameAspect + ';' + '\n' +
			'' + '\n' +
			'createNode script -n "uiConfigurationScriptNode";' + '\n' +
			'    setAttr ".b" -type "string" ("grid -tgl true -sp 50 -d 50 -s 50");' + '\n' +
			'    setAttr ".st" 3;' + '\n' +
			'createNode script -n "sceneConfigurationScriptNode";' + '\n' +
			'    setAttr ".b" -type "string""playbackOptions -min 1.0 -max ' + (totalFrames+1) + ' -ast 1.0 -aet ' + (totalFrames+1) + '";'+ '\n' +
			'    setAttr ".st" 6;' + '\n' +
			'' + '\n' +
			'//End of ' + self.FILE_NAME;
		}
		else if (self.RADIOBUTTON_ON == 2) // MAX
		{
			self.SCENE_STRING += 'animationRange = (interval 0 ' + totalFrames + ')';
		}
		else if (self.RADIOBUTTON_ON == 3) // Lightwave
		{
			self.SCENE_STRING += '';
		}
	}
	function write3DFile() { // writes a ASCII file that the 3D softwave can read
		var file = File(self.FILE_PATH);
		if (!file)
		{
			return;
		}
		if (file.open('w', 'TEXT', '????'))
		{
			file.writeln(self.SCENE_STRING);
			file.close();
		}
	}
	function cookLayer(comp, layer) { // create a copy of the layer in After Effects and prepare the transformation data
		self.LAYER_NAME = layer.name;
		self.SHORT_LAYER_NAME = removeForbiddenCharacters (layer.name);
		// make a copy of the layer
		if (self.LAYER_TYPE == 'Camera') {
			var layerCopy = comp.layers.addCamera(self.SHORT_LAYER_NAME + '_copy',[0, 0]);
			layerCopy.startTime = 0;
			layerCopy.pointOfInterest.expression = 'position;';
			layerCopy.position.setValue([comp.width/2, comp.height/2, 0]);
		}
		else // light or layer
		{
			var layerCopy = comp.layers.addNull();
			layerCopy.name = self.SHORT_LAYER_NAME + '_copy';
			layerCopy.startTime = 0;
			layerCopy.threeDLayer = true;
			layerCopy.anchorPoint.setValue([50, 50, 0]);
			layerCopy.position.setValue([comp.width/2, comp.height/2, 0]);
		}
		// make a parent for the layer copy (used for position, for scaling if camera, for Z rotation if rotation is being reversed)
		var layerCopyParent = comp.layers.addNull();
		layerCopyParent.name = self.SHORT_LAYER_NAME + '_copy_parent';
		layerCopyParent.startTime = 0;
		layerCopyParent.threeDLayer = true;
		layerCopyParent.anchorPoint.setValue([50, 50, 0]);
		layerCopyParent.position.setValue([comp.width/2, comp.height/2, 0]);
		layerCopy.parent = layerCopyParent; // attach layer copy to parent
		// Expression blocks
		var layerRefExp = 'L = thisComp.layer("' + self.LAYER_NAME + '");' + '\n';
		var unitMatrixExp = 'c = L.toWorldVec([0, 0,0]);' + '\n' +
		'u = L.toWorldVec([unit[0],0, 0]);' + '\n' +
		'v = L.toWorldVec([0, unit[1],0]);' + '\n' +
		'w = L.toWorldVec([0, 0,unit[2]]);' + '\n';
		var posExp = 	'L.toWorld(A)';
		var scaleExp = '[1/length(c, u),1/length(c, v),1/length(c, w)]*100';
		var ZYXrotExp = 'hLock = clamp(u[2],-1, 1);' + '\n' +
		'h = Math.asin(-hLock);' + '\n' +
		'cosH = Math.cos(h);' + '\n' +
		'if (Math.abs(cosH) > 0.0005){' + '\n' +
		'  p = Math.atan2(v[2], w[2]);' + '\n' +
		'  b = Math.atan2(u[1],u[0]);' + '\n' +
		'}else{' + '\n' +
		'  b = Math.atan2(w[1], v[1]);' + '\n' +
		' p = 0;' + '\n' +
		'}' + '\n';
		var YXZrotExp = 'pLock = clamp(w[1],-1, 1);' + '\n' +
		'p = Math.asin(-pLock);' + '\n' +
		'cosP = Math.cos(p);' + '\n' +
		'if (Math.abs(cosP) > 0.0005){' + '\n' +
		'  h = Math.atan2(w[0], w[2]);' + '\n' +
		'  b = Math.atan2(u[1],v[1]);' + '\n' +
		'}else{' + '\n' +
		'  h = Math.atan2(u[2], w[2]);' + '\n' +
		'  b = 0;' + '\n' +
		'}' + '\n';
		var zoomExp = 'L.zoom';
		// write expressions into the layer copy and its parent
		if (self.RADIOBUTTON_ON==1 || self.RADIOBUTTON_ON==2) // for Maya or Max (ZYX rotation)
		{
			if (self.LAYER_TYPE == 'Camera')
			{
				layerCopyParent.position.expression = layerRefExp + 'A=[0, 0,0];' + '\n' + posExp;
				layerCopyParent.scale.expression = layerRefExp + 'unit=[1, 1,1];' + '\n' + unitMatrixExp + scaleExp;
				layerCopyParent.rotation.expression = layerRefExp + 'unit = scale/100;' + '\n' + unitMatrixExp + ZYXrotExp + 'radiansToDegrees(b)';
				layerCopy.orientation.expression = layerRefExp + 'unit = thisLayer.parent.scale/100;' + '\n' + unitMatrixExp + ZYXrotExp + '[ 0, radiansToDegrees(h), 0 ]';
				layerCopy.rotationX.expression = layerRefExp + 'unit = thisLayer.parent.scale/100;' + '\n' + unitMatrixExp + ZYXrotExp + 'radiansToDegrees(p)';
				layerCopy.zoom.expression = layerRefExp + zoomExp;
			}
			else if (self.LAYER_TYPE == 'Light')
			{
				layerCopyParent.position.expression = layerRefExp + 'A=[0, 0,0];' + '\n' + posExp;
				layerCopyParent.rotation.expression = layerRefExp + 'unit = thisComp.layer(thisLayer, 1).scale/100;' + '\n' + unitMatrixExp + ZYXrotExp + 'radiansToDegrees(b)';
				layerCopy.scale.expression = layerRefExp + 'unit=[1, 1,1];' + '\n' + unitMatrixExp + scaleExp;
				layerCopy.orientation.expression = layerRefExp + 'unit = scale/100;' + '\n' + unitMatrixExp + ZYXrotExp + '[ 0, radiansToDegrees(h), 0 ]';
				layerCopy.rotationX.expression = layerRefExp + 'unit = scale/100;' + '\n' + unitMatrixExp + ZYXrotExp + 'radiansToDegrees(p)';
			}
			else if (self.LAYER_TYPE == 'Layer')
			{
				layerCopyParent.position.expression = layerRefExp + 'A = L.anchorPoint;' + '\n' + posExp;
				layerCopyParent.rotation.expression = layerRefExp + 'unit = thisComp.layer(thisLayer, 1).scale/100;' + '\n' + unitMatrixExp + ZYXrotExp + 'radiansToDegrees(b)';
				layerCopy.scale.expression = layerRefExp + 'unit=[1, 1,1];' + '\n' + unitMatrixExp + scaleExp;
				layerCopy.orientation.expression = layerRefExp + 'unit = scale/100;' + '\n' + unitMatrixExp + ZYXrotExp + '[ 0, radiansToDegrees(h), 0 ]';
				layerCopy.rotationX.expression = layerRefExp + 'unit = scale/100;' + '\n' + unitMatrixExp + ZYXrotExp + 'radiansToDegrees(p)';
			}
		}
		else if (self.RADIOBUTTON_ON==3) // for Lightwave (YXZ rotation)
		{
			if (self.LAYER_TYPE == 'Camera')
			{
				layerCopyParent.position.expression = layerRefExp + 'A=[0, 0,0];' + '\n' + posExp;
				layerCopyParent.scale.expression = layerRefExp + 'unit=[1, 1,1];' + '\n' + unitMatrixExp + scaleExp;
				layerCopy.orientation.expression = layerRefExp + 'unit = thisLayer.parent.scale/100;' + '\n' + unitMatrixExp + YXZrotExp + '[ 0, radiansToDegrees(h), 0 ]';
				layerCopy.rotationX.expression = layerRefExp + 'unit = thisLayer.parent.scale/100;' + '\n' + unitMatrixExp + YXZrotExp + 'radiansToDegrees(p)';
				layerCopy.rotation.expression = layerRefExp + 'unit = thisLayer.parent.scale/100;' + '\n' + unitMatrixExp + YXZrotExp + 'radiansToDegrees(b)';
				layerCopy.zoom.expression = layerRefExp + zoomExp;
			}
			else if (self.LAYER_TYPE == 'Light')
			{
				layerCopyParent.position.expression = layerRefExp + 'A=[0, 0,0];' + '\n' + posExp;
				layerCopy.scale.expression = layerRefExp + 'unit=[1, 1,1];' + '\n' + unitMatrixExp + scaleExp;
				layerCopy.orientation.expression = layerRefExp + 'unit = scale/100;' + '\n' + unitMatrixExp + YXZrotExp + '[ 0, radiansToDegrees(h), 0 ]';
				layerCopy.rotationX.expression = layerRefExp + 'unit = scale/100;' + '\n' + unitMatrixExp + YXZrotExp + 'radiansToDegrees(p)';
				layerCopy.rotation.expression = layerRefExp + 'unit = scale/100;' + '\n' + unitMatrixExp + YXZrotExp + 'radiansToDegrees(b)';
			}
			else if (self.LAYER_TYPE == 'Layer')
			{
				layerCopyParent.position.expression = layerRefExp + 'A = L.anchorPoint;' + '\n' + posExp;
				layerCopy.scale.expression = layerRefExp + 'unit=[1, 1,1];' + '\n' + unitMatrixExp + scaleExp;
				layerCopy.orientation.expression = layerRefExp + 'unit = scale/100;' + '\n' + unitMatrixExp + YXZrotExp + '[ 0, radiansToDegrees(h), 0 ]';
				layerCopy.rotationX.expression = layerRefExp + 'unit = scale/100;' + '\n' + unitMatrixExp + YXZrotExp + 'radiansToDegrees(p)';
				layerCopy.rotation.expression = layerRefExp + 'unit = scale/100;' + '\n' + unitMatrixExp + YXZrotExp + 'radiansToDegrees(b)';
			}
		}
	}
	function doIt(){
		self.MAIN_WINDOW.progress.text='Checking...'; // initial error checks after pressing the export button
		var proj = app.project;
		if (!proj)
		{
			alert('Open a project first.');
			self.MAIN_WINDOW.progress.text='Ready.';
			return;
		}
		var comp = proj.activeItem;
		if (!comp || !(comp instanceof CompItem))
		{
			alert('A composition must be open and active');
			self.MAIN_WINDOW.progress.text='Ready.';
			return;
		}
		var selLayers = comp.selectedLayers;
		if (selLayers.length == 0)
		{
			alert('Please select the layers you want to export');
			self.MAIN_WINDOW.progress.text='Ready.';
			return;
		}
		var AllowAccess = app.preferences.getPrefAsLong('Main Pref Section', 'Pref_SCRIPTING_FILE_NETWORK_SECURITY');
		if (AllowAccess == 0)
		{
			alert('ALERT!'+'\n'+
			'You need to check "Allow Scripts to Write Files'+'\n'+
			'and Access Network" in the General Preferences'+'\n'+
			'in order to use this plug in.');
			self.MAIN_WINDOW.progress.text='Ready.';
			return;
		}
		storeOriginalLayerNames (selLayers); // the names of layers might need to be changed
		checkForBadLayerNames (selLayers); // repeated names and long layer names are not allowed
		self.ORIGINAL_ASPECT = getPreciseCompPAR(comp); // store original size (important for non square comps)
		self.WIDTH = comp.width;
		self.HEIGHT = comp.height;
		app.beginUndoGroup('AE3D Export');
		self.MAIN_WINDOW.progress.text='Processing...';
		nonSquareToSquare(comp); // if comp is non-square, pin all unparented layers to world center and make it square
		writeHeader(comp); // write header into scene string
		for (var k = 0; k < selLayers.length; k++) // go through selected layers one at a time
		{
			var layer = selLayers[k];
			checkLayerType(layer); // what type of layer is it?
			checkForAnimation (layer); // what channels are animated?
			cookLayer (comp, layer); // make a copy of the selected layer, with world space values
			var data = new DataContainer(); // temporary storage for the keyframe data
			getData(comp, data); // get data from cooked layer and store it
			self.MAIN_WINDOW.progress.text='Writing...';
			writeThisLayerIntoScene(comp, data); // write data for this layer into the scene string
			resetComposition (comp, layer); // restore original values, erase layer copies
		}
		writeFooter(comp); // write footer into scene string
		self.MAIN_WINDOW.progress.text='Exporting...';
		write3DFile(); // take the scene string and put it into an ASCII file for 3D packages
		restoreLayerNames (selLayers)	; // restores the layer names if they were changed
		squareToNonSquare(comp); // if it was non-square, return it to original size, and erase the center pin
		self.MAIN_WINDOW.progress.text='Done.';
		app.endUndoGroup();
	}
	// Methods
	self.createUI = (function(thisObj, self) {

		if (app.project.file != null)
		{
			fullProjectName = File.decode(app.project.file.name);
			projectName = fullProjectName.substring(0, fullProjectName.lastIndexOf('.'));

			self.FILE_NAME = projectName + '.ma';
			self.FILE_PATH = self.FILE_FOLDER + '/' + self.FILE_NAME;
		}

		UIunit = 10;
		UIwidth = 275;
		UIheight = UIunit*28;

		function updateUI(){
			// container.layout.layout(true);    //Update the container
			// self.MAIN_WINDOW.layout.layout(true);    //Then update the main UI layout
		}

		//MAIN_WINDOW
		this.window = (thisObj instanceof Panel) ? thisObj : new Window('palette', 'AE3D_EXPORT', [0, 0, UIwidth, UIheight]);


		// this.window.name = this.window.add('statictext', [UIunit, UIunit*1.5, UIwidth-(UIunit*17),UIunit*3], 'AE3D EXPORT');
		this.window.optionsButton = this.window.add('button', [UIwidth-(UIunit*16)-5, UIunit-2, UIwidth-(UIunit*9),UIunit*3+2], 'Options');
		this.window.aboutButton = this.window.add('button', [UIwidth-(UIunit*8),UIunit-2, UIwidth-UIunit, UIunit*3+2], 'About');
		this.window.add('panel', [UIunit, UIunit*4, UIwidth-UIunit, UIunit*4+4], '');
		//Export to
		this.window.add('statictext', [UIunit*2+2, UIunit*5+5, UIwidth-UIunit, UIunit*7], 'Export for:');
		this.window.MAYA = this.window.add('radiobutton', [UIunit*2, UIunit*7+5, UIwidth/3-UIunit, UIunit*10], 'Maya');
		this.window.MAX = this.window.add('radiobutton', [UIwidth/3-UIunit, UIunit*7+5, UIwidth*(2/3)-(UIunit*2),UIunit*10], '3ds Max');
		this.window.LW = this.window.add('radiobutton', [UIwidth*(2/3)-(UIunit*2),UIunit*7+5, UIwidth-(UIunit*2),UIunit*10], 'Lightwave');
		this.window.MAYA.value = true;
		//Save as
		this.window.add('statictext', [UIunit*2+2, UIunit*12, UIwidth-UIunit, UIunit*14-5], 'Save as:');
		this.window.fileName = this.window.add('edittext', [UIunit*2, UIunit*14+8, UIwidth-(UIunit*10),UIunit*16+8], self.FILE_NAME);
		this.window.browseButton = this.window.add('button', [UIwidth-(UIunit*9),UIunit*14+5, UIwidth-(UIunit*2),UIunit*17], 'Browse');
		this.window.add('panel', [UIunit, UIunit*11, UIwidth-UIunit, UIunit*11+1], '');
		this.window.add('panel', [UIunit, UIunit*11, UIunit+1, UIunit*18], '');
		this.window.add('panel', [UIunit, UIunit*18, UIwidth-UIunit, UIunit*18+1], '');
		this.window.add('panel', [UIwidth-UIunit, UIunit*11, UIwidth-UIunit+1, UIunit*18], '');
		//Export button
		this.window.exportButton = this.window.add('button', [UIunit, UIunit*19+5, UIwidth-UIunit, UIunit*22+5], 'Export');
		//progress
		this.window.progress = this.window.add('statictext', [UIunit*2+2, UIunit*25-2, UIwidth-(UIunit*3),UIunit*26+5], '');
		this.window.progress.text='Ready.';
		this.window.add('panel', [UIunit, UIunit*24, UIwidth-UIunit, UIunit*24+1], '');
		this.window.add('panel', [UIunit, UIunit*24, UIunit+1, UIunit*27], '');
		this.window.add('panel', [UIunit, UIunit*27, UIwidth-UIunit, UIunit*27+1], '');
		this.window.add('panel', [UIwidth-UIunit, UIunit*24, UIwidth-UIunit+1, UIunit*27], '');

		self.MAIN_WINDOW = this.window;


		//OPTIONS_WINDOW
		self.make_optionsWindow = function() {
			self.OPTIONS_WINDOW = (this instanceof Panel) ? this : new Window('dialog', 'AE3D Export Options', [0, 0, UIwidth, UIunit*23]);
			self.OPTIONS_WINDOW.name = self.OPTIONS_WINDOW.add('statictext', [UIunit, UIunit*1.5, UIwidth-(UIunit*8),UIunit*3], 'AE3D EXPORT : Options');
			//Shift Center
			self.OPTIONS_WINDOW.add('panel', [UIunit, UIunit*4, UIwidth-UIunit, UIunit*4+1], '');
			self.OPTIONS_WINDOW.add('panel', [UIunit, UIunit*4, UIunit+1, UIunit*7+5], '');
			self.OPTIONS_WINDOW.originShift = self.OPTIONS_WINDOW.add('checkbox', [UIunit*2, UIunit*5, UIwidth-(UIunit*3),UIunit*6+5], 'shift the comp center to 0, 0,0');
			self.OPTIONS_WINDOW.originShift.value = self.USER_OPTIONS['originShift'];
			self.OPTIONS_WINDOW.add('panel', [UIwidth-UIunit, UIunit*4, UIwidth-UIunit+1, UIunit*7+7], '');
			self.OPTIONS_WINDOW.add('panel', [UIunit, UIunit*7+5, UIwidth-UIunit, UIunit*7+6], '');
			//Scale scene
			self.OPTIONS_WINDOW.scaleSlider = self.OPTIONS_WINDOW.add('scrollbar', [UIunit, UIunit*12, UIwidth-UIunit, UIunit*13+5], 0, -4, 4);
			self.OPTIONS_WINDOW.scaleSlider.value = self.USER_OPTIONS['scaleSlider'];
			self.OPTIONS_WINDOW.sliderValDisplay = self.OPTIONS_WINDOW.add('statictext', [UIunit*2+2, UIunit*9, UIwidth-UIunit, UIunit*10+5], '');
			self.OPTIONS_WINDOW.sliderValDisplay.text = 'world scale set at 1 : ' + Math.pow(10, self.OPTIONS_WINDOW.scaleSlider.value);
			//Extra Maya cameras
			self.OPTIONS_WINDOW.add('panel', [UIunit, UIunit*15, UIwidth-UIunit, UIunit*15+1], '');
			self.OPTIONS_WINDOW.add('panel', [UIunit, UIunit*15, UIunit+1, UIunit*18+5], '');
			self.OPTIONS_WINDOW.extraMayaCams = self.OPTIONS_WINDOW.add('checkbox', [UIunit*2, UIunit*16, UIwidth-(UIunit*3),UIunit*17+5], 'add 4 views for new Maya scene');
			self.OPTIONS_WINDOW.extraMayaCams.value = self.USER_OPTIONS['extraMayaCams'];
			self.OPTIONS_WINDOW.add('panel', [UIwidth-UIunit, UIunit*15, UIwidth-UIunit+1, UIunit*18+7], '');
			self.OPTIONS_WINDOW.add('panel', [UIunit, UIunit*18+5, UIwidth-UIunit, UIunit*18+6], '');
			//Close button
			self.OPTIONS_WINDOW.closeButton = self.OPTIONS_WINDOW.add('button', [UIwidth-(UIunit*8),UIunit*19+5, UIwidth-UIunit, UIunit*22], 'Close');

			//Methods
			self.OPTIONS_WINDOW.onClose = function(){
				self.MAIN_WINDOW.visible = true;
			}
			self.OPTIONS_WINDOW.originShift.onClick = function (){
				self.USER_OPTIONS['originShift'] = self.OPTIONS_WINDOW.originShift.value;
			}
			self.OPTIONS_WINDOW.extraMayaCams.onClick = function (){
				self.USER_OPTIONS['extraMayaCams'] = self.OPTIONS_WINDOW.extraMayaCams.value;
			}
			self.OPTIONS_WINDOW.scaleSlider.onChange = function (){
				self.MAIN_WINDOW.progress.text='Ready.';
				self.OPTIONS_WINDOW.scaleSlider.value = Math.round(self.OPTIONS_WINDOW.scaleSlider.value);
				self.USER_OPTIONS['scaleSlider'] = self.OPTIONS_WINDOW.scaleSlider.value;
				self.OPTIONS_WINDOW.sliderValDisplay.text = 'world scale set at 1 : ' + Math.pow(10, self.OPTIONS_WINDOW.scaleSlider.value);
			}
			self.OPTIONS_WINDOW.closeButton.onClick = function (){
				self.OPTIONS_WINDOW.close(); // destroys window
			}
			return self.OPTIONS_WINDOW
		}

		// MAIN_WINDOW Functionality
		self.MAIN_WINDOW.aboutButton.onClick = function()
		{
			self.MAIN_WINDOW.progress.text='Ready.';
			alert(self.ABOUT);
		}
		self.MAIN_WINDOW.optionsButton.onClick = function()
		{
			self.OPTIONS_WINDOW = null;
			self.make_optionsWindow()
			self.OPTIONS_WINDOW.center();
			self.OPTIONS_WINDOW.show();
		}
		self.MAIN_WINDOW.MAYA.onClick = function ()
		{
			self.MAIN_WINDOW.progress.text='Ready.';
			self.FILE_NAME = self.FILE_NAME.substring(0, self.FILE_NAME.lastIndexOf('.')) + '.ma';
			self.MAIN_WINDOW.fileName.text = self.FILE_NAME;
			self.RADIOBUTTON_ON = 1;
			self.FILE_PATH = self.FILE_FOLDER + '/' + self.FILE_NAME;
		}
		self.MAIN_WINDOW.MAX.onClick = function ()
		{
			self.MAIN_WINDOW.progress.text='Ready.';
			self.FILE_NAME = self.FILE_NAME.substring(0, self.FILE_NAME.lastIndexOf('.')) + '.ms';
			self.MAIN_WINDOW.fileName.text = self.FILE_NAME;
			self.RADIOBUTTON_ON = 2;
			self.FILE_PATH = self.FILE_FOLDER + '/' + self.FILE_NAME;
		}
		self.MAIN_WINDOW.LW.onClick = function ()
		{
			self.MAIN_WINDOW.progress.text='Ready.';
			self.FILE_NAME = self.FILE_NAME.substring(0, self.FILE_NAME.lastIndexOf('.')) + '.lws';
			self.MAIN_WINDOW.fileName.text = self.FILE_NAME;
			self.RADIOBUTTON_ON = 3;
			self.FILE_PATH = self.FILE_FOLDER + '/' + self.FILE_NAME;
		}
		//Save As box
		self.MAIN_WINDOW.fileName.onChange = function ()
		{
			self.MAIN_WINDOW.progress.text='Ready.';
			self.FILE_NAME = self.MAIN_WINDOW.fileName.text
			self.FILE_NAME = addSuffixIfMissing(self.FILE_NAME);
			self.MAIN_WINDOW.fileName.text = self.FILE_NAME;
			self.FILE_PATH = self.FILE_FOLDER + '/' + self.FILE_NAME;
		}
		//'Browse' button for saving file
		self.MAIN_WINDOW.browseButton.onClick = function ()
		{
			self.MAIN_WINDOW.progress.text='Ready.';
			self.FILE_NAME = 'trackedCamera.ma';

			if (app.project.file != null) {
				parent = app.project.file.parent.absoluteURI;
				pickfile = new File(parent + '/' + self.FILE_NAME).openDlg('Save Maya Scene', "Maya:*.ma");
			} else {
				pickfile = new File (self.FILE_NAME);
			}

			self.FILE_PATH = pickfile

			if (self.FILE_PATH != null) // if user entered new info, update the path
			{
				self.FILE_FOLDER = self.FILE_PATH.path;
				self.FILE_NAME = self.FILE_PATH.name;
				self.FILE_NAME = addSuffixIfMissing(self.FILE_NAME);
				self.FILE_PATH = self.FILE_FOLDER + '/' + self.FILE_NAME;
				self.FILE_PATH_SET = true;
				self.MAIN_WINDOW.fileName.text = pickfile.fsName;
			} else {
				self.FILE_PATH = self.FILE_FOLDER + '/' + self.FILE_NAME;
			}
		}
		//Export button
		self.MAIN_WINDOW.exportButton.onClick = function (){
			self.MAIN_WINDOW.progress.text='Ready.';
			self.FILE_NAME = self.MAIN_WINDOW.fileName.text;
			if (File(self.FILE_PATH).exists == true && self.FILE_PATH_SET == false)
			{
				var overwrite = confirm('Overwrite item named "' + File(self.FILE_PATH).name + '" ?');
				if (overwrite==true)
				{
					self.MAIN_WINDOW.progress.text='Processing...';
					updateUI()
					doIt();
				} else { // user said no, don't overwrite
					return
				}
			} else {
				self.MAIN_WINDOW.progress.text='Processing...';
				self.FILE_PATH_SET = false;
				updateUI()
				doIt();
			}
		}
	})(thisObj, self)
	self.show = function(){
		if (thisObj instanceof Panel) {
			return thisObj
		} else {
			self.MAIN_WINDOW.show()
			self.MAIN_WINDOW.center()
		}
	}
}
try{
	var exporter = new AE3D_Export(this);
	exporter.show()
} catch(e){
	alert(e)
}
