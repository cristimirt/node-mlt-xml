var _ = require("underscore");
var uuid = require ("node-uuid");

var Frei0r = function (params) {
	this._attribs = {
		id: uuid(),
	};
}
Frei0r.prototype = _.extend(Frei0r.prototype, require("../interfaces/xml"), require("../interfaces/properties"));
Frei0r.prototype._node = "transition";
Frei0r.prototype.screen = function(params) {
	this._attribs.mlt_service = "frei0r.screen";
	if (params) {
		if (params.start !== undefined) {
			this._attribs.in = params.start;
		}
		if (params.length !== undefined) {
			this._attribs.out = (this._attribs.in || 0) + params.length - 1;
		}
		if (params.from !== undefined) {
			this._attribs.a_track = params.from;
		}
		if (params.to !== undefined) {
			this._attribs.b_track = params.to;
		}
	}
	return this;
};

var Luma = function (params) {
	this._attribs = {
		id: uuid(),
		mlt_service: "luma"
	};
	if (params) {
		if (params.start !== undefined) {
			this._attribs.in = params.start;
		}
		if (params.length !== undefined) {
			this._attribs.out = (this._attribs.in || 0) + params.length - 1;
		}
		if (params.from !== undefined) {
			this._attribs.a_track = params.from;
		}
		if (params.to !== undefined) {
			this._attribs.b_track = params.to;
		}
	}
}
Luma.prototype = _.extend(Luma.prototype, require("../interfaces/xml"), require("../interfaces/properties"));
Luma.prototype._node = "transition";

module.exports = {
	Frei0r: Frei0r,
	Luma: Luma
}