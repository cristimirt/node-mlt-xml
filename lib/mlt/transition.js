var uuid = require('node-uuid'),
	_ = require('underscore'),
	Property = require('./property'),
	Utility = require('./utility')
var transition_atts = ['id','out','in']

var Transition = function(params){
	let defaults = {
		a_track : 0,
		b_track : 1
	}
	//Extract other params (these are not to be included in the xml)
	let other = {}
	if (params.hasOwnProperty('other')){
		other = params.other
		delete params.other
	}
	this._inner = []
	this._attribs = {
		id : uuid()
	}
	for (let name in params){
		if (transition_atts.includes(name)){
			this._attribs[name] = params[name]
		} else {
			let property = new Property(name,params[name])
			this.push(property)
		}
	}
}
Transition.prototype = _.extend(Transition.prototype, require("../interfaces/properties.js"), require("../interfaces/xml"))
Transition.prototype._node = "transition"
Transition.prototype.id = function(new_id){
	if (new_id){
		this._attribs.id = new_id
	}
	return this._attribs.id
}
Transition.prototype.push = function(obj) {
  this._inner.push(obj)
  return this
}

//================================
// frei0r
//================================
Transition.Frei0r = function(params){
	let defaults = {
		a_track 	: 0,
		b_track 	: 1,
		mlt_service	: 'frei0r',
	}
	//Extract other params (these are not to be included in the xml)
	let other = {}
	if (params.hasOwnProperty('other')){
		other = params.other
		//delete params.other
	}
	let transition = new Transition(params)
	return transition
}
//================================
// frei0r.cairoblend
//================================
Transition.Frei0r.Cairoblend = function(params){
	let defaults = {
		a_track 	: 0,
		b_track 	: 1,
		mlt_service	: 'frei0r.cairoblend',
		version 	: '0.9',
		disable 	: 0,
	}
	//Extract other params (these are not to be included in the xml)
	let other = {}
	if (params.hasOwnProperty('other')){
		other = params.other
		//delete params.other
	}
	params = {...defaults,...params}
	let frei0r = new Transition.Frei0r(params)
	return frei0r
}
//===============================
// Mix
//===============================
Transition.Mix = function(params){
	let defaults = {
		mlt_service : 'mix',
		always_active : 1,
		sum : 1
	}
	//Extract other params (these are not to be included in the xml)
	let other = {}
	if (params.hasOwnProperty('other')){
		other = params.other
		//delete params.other
	}
	params = {...defaults,...params}
	let transition = new Transition(params)
	return transition
}

//Return
module.exports = Transition