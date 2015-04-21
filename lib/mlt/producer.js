var _ = require("underscore");
var uuid = require("node-uuid");

var Producer = function () {
	this._attribs = {
		id: uuid()
	};
	this._inner = {};
}

Producer.prototype = _.extend(Producer.prototype, require("../interfaces/xml"), require("../interfaces/properties"));
Producer.prototype._node = "producer";
Producer.prototype.id = function () {
	return this._attribs.id;
}

module.exports = {
	Image: function(params) {
		var producer = new Producer;
		producer._attribs.mlt_service = "pixbuf";
		if (params) { 
			if (params.length) {
				producer._attribs.out = params.length - 1;
			}
			if (params.source) {
				producer._attribs.resource = params.source;
			}
		}
		return producer;
	},
	Audio: function(params) {
		var producer = new Producer;
		producer._attribs.mlt_service = "avformat";
		producer._attribs.video_index = -1;
		if (params) {
			if (params.startFrame) {
				producer._attribs.in = params.startFrame;
			}
			if (params.length) {
				producer._attribs.out = (params.startFrame || 0) + params.length - 1;
			}
			if (params.source) {
				producer._attribs.resource = params.source;
			}
		}
		return producer
	},
	Video: function(params) {
		var producer = new Producer;
		producer._attribs.mlt_service = "avformat";
		if (params) {
			if (params.startFrame) {
				producer._attribs.in = params.startFrame;
			}
			if (params.length) {
				producer._attribs.out = (params.startFrame || 0) + params.length - 1;
			}
			if (params.source) {
				producer._attribs.resource = params.source;
			}
			if (params.forceAspectRatio) {
				producer._attribs.force_aspect_ratio = params.forceAspectRatio;
			}
		}
		return producer
	}
}