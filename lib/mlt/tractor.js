var _ = require('underscore'),
	uuid = require('node-uuid'),
	Property = require('./property'),
	Track = require('./multitrack/track'),
	Multitrack = require('./multitrack');
var tractor_atts = ['id','out','in','title','global_feed'];
var Tractor = function (params) {
	//Content
	this._inner = [];
	//Multitrack
	let multitrack = new Multitrack();
	this.push(multitrack);
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

Tractor.prototype = _.extend(Tractor.prototype, require('../interfaces/xml'));
Tractor.prototype._node = 'tractor';
Tractor.prototype.push = function(mltObj) {
  this._inner.push(mltObj);
  return this;
};
Tractor.prototype.id = function(new_id){
	if (new_id){
		this._attribs.id = new_id;
	}
	return this._attribs.id;
}
Tractor.prototype.addTrack = function(producer){
	if (Array.isArray(producer)){
		for (let p of producer){
			let track = new Track(p);
			this._inner[0].push(track);
			//this.push(track);
		}
	} else {
		let track = new Track(producer);
		this._inner[0].push(track);
		//this.push(track);
	}
	
}

module.exports = Tractor;