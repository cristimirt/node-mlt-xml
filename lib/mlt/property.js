var _ = require('underscore');

var Property = function (name, value) {
  this._attribs = {
    name: name
  }
  this._inner = value.toString().trim();
}

Property.prototype = _.extend(Property.prototype, require('../interfaces/xml'));
Property.prototype._node = 'property';
Property.prototype.val = function(new_value) {
	if (new_value){
		this._inner = new_value.toString().trim();
	}
  return this._inner;
};
Property.prototype.name = function(new_name){
	if (new_name){
		this._attribs.name = new_name;
	}
	return this._attribs.name;
}


module.exports = Property;
