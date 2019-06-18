var _ = require("underscore"),
	uuid = require ("node-uuid"),
	Property = require('./property');
var transition_atts = ['id'];
var defaults = {
		id : uuid(),
		a_track : 0,
		b_track : 1
	};
var frei0r_defaults = {
		cairoblend : {
			mlt_service : 'frei0r.cairoblend',
			version : '0.9',
			disable : 0,
		}
	},
	mix = {
		mlt_service : 'mix',
		always_active : 1,
		sum : 1
	};


var Transition = function(params){
	params = {...defaults,...params};
	//Content
	this._inner = [];
	//Attributes
	this._attribs = {};
	if (params){
		for (let name in params){
			if (transition_atts.includes(name)){
				this._attribs[name] = params[name];
			} else {
				//Create Property
				let property = new Property(name,params[name]);
				this.push(property);
			}
		}
	}
}
Transition.prototype = _.extend(Transition.prototype, require('../interfaces/xml'), require('../interfaces/properties'));
Transition.prototype._node = 'transition';
Transition.prototype.push = function(obj) {
  this._inner.push(obj);
  return this;
};
Transition.prototype.id = function(new_id){
	if (new_id){
		this._attribs.id = new_id;
	}
	return this._attribs.id;
}

module.exports = {
	Transition : Transition,
	Frei0r : function(params){
		let type = params.subtype;
		delete params.subtype;
		switch (type){
			case "cairoblend":
				params = {...frei0r_defaults.cairoblend,...params};
				break;
		}
		let transition = new Transition(params);
		return transition;
	},
	Mix : function(params){
		params = {...mix_defaults,...params};
		let transition = new Transition(params);
		return transition;
	}
}