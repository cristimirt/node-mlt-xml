var _ = require("underscore");
var default_profiles = {
	default : {
		description : "default",
		width : "1920",
		height : "1080",
		progressive : "1",
		sample_aspect_num : "1",
		sample_aspect_den : "1",
		display_aspect_num : "1920",
		display_aspect_den : "1080",
		frame_rate_num : "25",
		frame_rate_den : "1",
		colorspace : "709"
	}
};

var Profile = function (params) {
	this._attribs = {};
	if (params){
		if (typeof params == 'string'){
			if (default_profiles.hasOwnProperty(params)){
				for (let name in default_profiles[params]){
					this._attribs[name] = default_profiles[params][name];
				}
			}
		} else {
			for (let name in params){
				this._attribs[name] = params[name];
			}
		}
	}
}

Profile.prototype = _.extend(Profile.prototype, require('../interfaces/xml'));
Profile.prototype._node = 'profile';
Profile.prototype.att = function(name,value){
	if (value){
		this._attribs.name = value;
	}
	return this._attribs.name;
}

module.exports = Profile;
