var _ = require('underscore');

var Entry = function (params) {
  this._attribs = {};

  if (params) {
    if (params.producer) {
      this._attribs.producer = params.producer.id();
	  delete params.producer;
    }
	if (params.startFrame){
		this._attribs.in = params.startFrame;
		delete params.startFrame;
	}
    if (params.length) {
      this._attribs.out = (params.startFrame || 0) + params.length - 1
	  delete params.length
    }
	for (let i in params){
		this._attribs[i] = params[i];
	}
  }
}

Entry.prototype = _.extend(Entry.prototype, require('../../interfaces/xml.js'))
Entry.prototype._node = 'entry'

module.exports = Entry