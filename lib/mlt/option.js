var _ = require("underscore");
var uuid = require("node-uuid");

var Option = function () {
	this._attribs = {
		id: uuid()
	};
	this._inner = {};
}

Option.prototype = _.extend(Option.prototype, require("../interfaces/xml"), require("../interfaces/properties"));
Option.prototype.id = function () {
	return this._attribs.id;
}
//The node name depends on the option
//Producer.prototype._node = "option";

module.exports = {
	AttachClip: function(params) {
		var option = new Option;
		attachClip._node = "attach-clip";
		if (params){
			for (let i in params){
				option._attribs[i] = params[i];
			}
		}
		return option;
	}
}