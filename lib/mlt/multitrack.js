var _ = require('underscore'),
	uuid = require('node-uuid'),
	Property = require('./property'),
	Track = require('./multitrack/track');
var multitrack_atts = ['id','out','in','global_feed'];
var Multitrack = function (params) {
	//Content
	this._inner = [];
	//Attributes
	this._attribs = {
		id: uuid()
	}
	if (params){
		for (let name in params){
			if (name == 'tracks'){
				this.addTrack(params.tracks);
				delete params.tracks;
			} else if (tractor_atts.includes(name)){
				this._attribs[name] = params[name];
			} else {
				//Create Property
				let property = new Property(name,params[name]);
				this.push(property);
			}
		}
	}
}

Multitrack.prototype = _.extend(Multitrack.prototype, require('../interfaces/xml'));
Multitrack.prototype._node = 'multitrack';
Multitrack.prototype.push = function(mltObj) {
  this._inner.push(mltObj);
  return this;
};
Multitrack.prototype.id = function(new_id){
	if (new_id){
		this._attribs.id = new_id;
	}
	return this._attribs.id;
}
Multitrack.prototype.addTrack = function(producer){
	if (Array.isArray(producer)){
		for (let p of producer){
			let track = new Track(p);
			this.push(track);
		}
	} else {
		let track = new Track(producer);
		this.push(track);
	}
	
}

module.exports = Multitrack;