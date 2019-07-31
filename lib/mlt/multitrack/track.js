var _ = require('underscore');

var Track = function (producer,params) {
	this._attribs = {
		producer: producer.id()
	}
	if (params){
		for (let i in params){
			this._attribs[i] = params[i]
		}
	}
}

Track.prototype = _.extend(Track.prototype, require('../../interfaces/xml'));
Track.prototype._node = 'track';
Track.prototype.producer = function(new_producer,params){
	if (new_producer){
		this._attribs.producer = new_producer.id();
	}
	if (params){
		for (let i in params){
			this._attribs[i] = params[i]
		}
	}
	return this._attribs.producer;
}

module.exports = Track;