var uuid = require("node-uuid");
var _ = require("underscore");

//====================================================================================================
// Affine
//====================================================================================================

var Affine = function(params) {
	this._attribs = {
		mlt_service: "affine",
		id: uuid()
	}
	if (params) {
		if (params.start > 0) {
			this._attribs.in = params.start;
		}
		if (params.length !== undefined) {
			this._attribs.out = (params.start || 0) + params.length - 1;
		}
		if (params.track !== undefined) {
			this._attribs.track = params.track;
		}
	}
}
Affine.prototype = _.extend(Affine.prototype, require("../interfaces/properties.js"), require("../interfaces/xml"));
Affine.prototype._node = "filter";
Affine.prototype.geometry = function(geometries) {
	if (geometries === undefined) {
		return this._geometries;
	}
	this._geometries = geometries;
	_.each(geometries, function(geometry) {
		var geometries = this._attribs["transition.geometry"] || "";
		geometries += geometry.frame + "=" + geometry.x + "/" + geometry.y + ":";
		geometries += geometry.w + "x" + geometry.h + ":" + geometry.sat + ";";
		this._attribs["transition.geometry"] = geometries;
	}, this);
	this._attribs["transition.geometry"] = this._attribs["transition.geometry"].replace(/;$/, "");
	return this;
};
Affine.prototype.id = function() {
	return this._attribs.id
};

//====================================================================================================
// AudioFade
//====================================================================================================

var AudioFade = function(params) {
	this._attribs = {
		mlt_service: "volume",
		id: uuid()
	}
	if (params) {
		if (params.start > 0) {
			this._attribs.in = params.start;
		}
		if (params.length !== undefined) {
			this._attribs.out = (params.start || 0) + params.length - 1;
		}
		if (params.track !== undefined) {
			this._attribs.track = params.track;
		}
		if (params.startVol !== undefined) {
			this._attribs.gain = params.startVol;
		}
		if (params.endVol != undefined) {
			this._attribs.end = params.endVol;
		}
	}
}
AudioFade.prototype = _.extend(AudioFade.prototype, require("../interfaces/properties.js"), require("../interfaces/xml"));
AudioFade.prototype._node = "filter";
AudioFade.prototype.id = function() {
	return this._attribs.id;
};

//====================================================================================================
// Frei0r
//====================================================================================================

var Frei0r = function(params) {
	this._attribs = {
		id: uuid()
	}
}
Frei0r.prototype = _.extend(Frei0r.prototype, require("../interfaces/properties.js"), require("../interfaces/xml"));
Frei0r.prototype._node = "filter";
Frei0r.prototype.squareblur = function(kernelSizes) {
	this._attribs.mlt_service = "frei0r.squareblur";
	this._inner = {};
	var kernelSizesString = "";
	_.each(kernelSizes, function(kernel) {
		kernelSizesString += kernel.frame + "=" + kernel.size + ";";
	});
	kernelSizesString = kernelSizesString.replace(/;$/, "");
	this._props("Kernel size", kernelSizesString);
	return this;
};
Frei0r.prototype.id = function() {
	return this._attribs.id;
}

//====================================================================================================
// Frei0r
//====================================================================================================

var Watermark = function(params) {
	this._attribs = {
		mlt_service: "watermark",
		id: uuid()
	}
	if (params) {
		if (params.resource != undefined) {
			this._attribs.resource = params.resource;
		}
	}
}
Watermark.prototype = _.extend(Watermark.prototype, require("../interfaces/properties.js"), require("../interfaces/xml"));
Watermark.prototype._node = "filter";
Watermark.prototype.id = function() {
	return this._attribs.id;
}

//====================================================================================================
// WebVFX
//====================================================================================================

var WebVFX = function(params) {
	this._attribs = {
		mlt_service: "webvfx",
		id: uuid()
	}
	if (params) {
		if (params.resource != undefined) {
			this._attribs.resource = params.resource;
			if (params.out != undefined) {
				this._attribs.out = params.out;
			}
		}
	}
}
WebVFX.prototype = _.extend(WebVFX.prototype, require("../interfaces/properties.js"), require("../interfaces/xml"));
WebVFX.prototype._node = "filter";
WebVFX.prototype.id = function() {
	return this._attribs.id;
}

//====================================================================================================
// Exports
//====================================================================================================

module.exports = {
	Affine: Affine,
	AudioFade: AudioFade,
	Frei0r: Frei0r,
	Watermark: Watermark,
	WebVFX: WebVFX
}