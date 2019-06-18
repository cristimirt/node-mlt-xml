var _ = require('underscore');

var Track = function (producer) {
  this._attribs = {
    producer: producer.id()
  }
}

Track.prototype = _.extend(Track.prototype, require('../../interfaces/xml'));
Track.prototype._node = 'track';
Track.prototype.producer = function(new_producer){
	if (new_producer){
		this._attribs.producer = new_producer.id();
	}
	return this._attribs.producer;
}

module.exports = Track;