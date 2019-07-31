var uuid = require('node-uuid'),
	_ = require('underscore'),
	Property = require('./property'),
	Utility = require('./utility')
var filter_atts = ['id','out','in']

var Filter = function(params){
	this._inner = []
	this._attribs = {
		id : uuid()
	}
	let defaults = {
		
	}
	//Extract other params (these are not to be included in the xml)
	let other = {}
	if (params.hasOwnProperty('other')){
		other = params.other
		delete params.other
	}
	params = {...defaults,...params}
	//In
	if (other.hasOwnProperty('in')){
		params.in = Utility.secondsToDuration(other.in)
	}
	//Duration
	if (other.hasOwnProperty('duration')){
		params.out = Utility.secondsToDuration(other.duration,params.in)
	}
	//Out
	if (other.hasOwnProperty('out')){
		params.out = Utility.secondsToDuration(other.out)
	}
	for (let name in params){
		if (filter_atts.includes(name)){
			this._attribs[name] = params[name]
		} else {
			let property = new Property(name,params[name])
			this.push(property)
		}
	}
}
Filter.prototype = _.extend(Filter.prototype, require("../interfaces/properties.js"), require("../interfaces/xml"))
Filter.prototype._node = "filter"
Filter.prototype.id = function(new_id){
	if (new_id){
		this._attribs.id = new_id
	}
	return this._attribs.id
}
Filter.prototype.push = function(obj) {
  this._inner.push(obj)
  return this
}

//=====================================
// Affine (position)
//=====================================

Filter.Affine = function(params){
	let defaults = {
		in : Utility.secondsToDuration(0),
		background : 'colour:0',
		mlt_service : 'affine',
		'transition.fill' : 1,
		'transition.distort' : 0,
		'transition.valign' : 'top',
		'transition.halign' : 'left',
		'transition.threads' : 0,
		'transition.scale' : 1,
		'transition.geometry' : "0/0:1920x1080:100"
	}
	//Extract other params (these are not to be included in the xml)
	let other = {}
	if (params.hasOwnProperty('other')){
		other = params.other
		//delete params.other
	}
	params = {...defaults,...params}
	//Position
	if (other.hasOwnProperty('pos')){
		let pos = {
			x : 0,     //X Pos
			y : 0,     //Y Pos
			w : 1920,  //Width
			h : 1080,  //Height
			t : 100    //Transparency (100-solid, 0-transparent)
		}
		for (let i in pos){
			if (other.pos.hasOwnProperty(i)){
				pos[i] = parseFloat(other.pos[i])
			}
		}
		params['transition.geometry'] = [pos.x,'/',pos.y,':',Math.floor(pos.w),'x',Math.floor(pos.h),':',pos.t].join('')
	}
	
	let filter = new Filter(params)
	return filter
}
//====================
// Brightness
//====================
Filter.Brightness = function(params){
	//secondsToDuration(0)+"=0;"+secondsToDuration(slide_intro_transition_settings.fade_in_duration)+"=1",
	let defaults = {
		start : 1,
		level : 1,
		mlt_service : "brightness",
		alpha : 1,
		//"transition.rect" : secondsToDuration(0)+"=0 0 0 0 1;" + secondsToDuration(slide_intro_transition_settings.fade_in_duration)+"=0 0 0 0 1"
		"transition.rect" : "0 0 0 0 1"
	}
	//Extract other params (these are not to be included in the xml)
	let other = {}
	if (params.hasOwnProperty('other')){
		other = params.other
		//delete params.other
	}
	if (other.hasOwnProperty('fade_in') && other.fade_in !== null){
		let fade_in_defaults = {
			duration : 0.5,
			min_level : 0,
			max_level : 1,
		}
		for (let i in fade_in_defaults){
			if (other.fade_in.hasOwnProperty(i)) fade_in_defaults[i] = other.fade_in[i]
		}
		//calculate level
		params.level = Utility.secondsToDuration(0)+"="+fade_in_defaults.min_level+";"+Utility.secondsToDuration(fade_in_defaults.duration)+"="+fade_in_defaults.max_level
	}
	if (other.hasOwnProperty('fade_out') && other.fade_out !== null){
		let fade_out_defaults = {
			duration : 0.5,
			min_level : 0,
			max_level : 1,
		}
		for (let i in fade_out_defaults){
			if (other.fade_out.hasOwnProperty(i)) fade_out_defaults[i] = other.fade_out[i]
		}
		//calculate level
		params.level = Utility.secondsToDuration(other.duration - fade_out_defaults.duration)+"="+fade_out_defaults.max_level+";"+Utility.secondsToDuration(other.duration-0.1)+"="+fade_out_defaults.min_level
	}
	params = {...defaults,...params}
	let filter = new Filter(params)
	return filter
}
//==============
// Volume
//==============
Filter.Volume = function(params){
	let max_audio_gain = 20
	let volume = 0
	let defaults = {
		window 		: 15,
		max_gain 	: max_audio_gain + "dB",
		level 		: volume,
		mlt_service : "volume",
	}
	//Extract other params (these are not to be included in the xml)
	let other = {}
	if (params.hasOwnProperty('other')){
		other = params.other
		//delete params.other
	}
	params = {...defaults,...params}
	if (other.hasOwnProperty('volume')){
		volume = -1 * (1-other.volume) * max_audio_gain
		params.level = volume
	}
	if (other.hasOwnProperty('fade_in') && other.fade_in !== null){
		let fade_in_params = {
			volume_max 			: 1,
			volume_min 			: 0,
			fade_in_duration 	: 0.5
		}
		for (let i in fade_in_params){
			if (other.fade_in.hasOwnProperty(i)) fade_in_params[i] = other.fade_in[i]
		}
		//calculate level
		fade_in_params.volume_max = -1 * (1-fade_in_params.volume_max) * max_audio_gain
		fade_in_params.volume_min = -1 * (1-fade_in_params.volume_min) * max_audio_gain
		params.level = Utility.secondsToDuration(0)+"="+fade_in_params.volume_min+";"+Utility.secondsToDuration(fade_in_params.fade_in_duration)+"="+fade_in_params.volume_max
	}
	if (other.hasOwnProperty('fade_out') && other.fade_out !== null){
		let fade_out_params = {
			volume_max 			: 1,
			volume_min 			: 0,
			fade_out_duration 	: 0.5
		}
		for (let i in fade_out_params){
			if (other.fade_out.hasOwnProperty(i)) fade_out_params[i] = other.fade_out[i]
		}
		//calculate level
		fade_out_params.volume_max = -1 * (1-fade_out_params.volume_max) * max_audio_gain
		fade_out_params.volume_min = -1 * (1-fade_out_params.volume_min) * max_audio_gain
		params.level = Utility.secondsToDuration(other.duration - fade_out_params.fade_out_duration)+"="+fade_out_params.volume_max+";"+Utility.secondsToDuration(other.duration-0.1)+"="+fade_out_params.volume_min
	}
	let filter = new Filter(params)
	return filter
}


//Return
module.exports = Filter