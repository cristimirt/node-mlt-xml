var _ = require('underscore'),
	uuid = require('node-uuid'),
	Property = require('./property'),
	Track = require('./multitrack/track'),
	Multitrack = require('./multitrack'),
	Transition = require('./transition'),
	Filter = require('./filter')
var tractor_atts = ['id','out','in','title','global_feed','slide_nr','note']
var Tractor = function (params) {
	//Content
	this._inner = []
	this.track_count = 0
	//Multitrack
	let multitrack = new Multitrack()
	this.push(multitrack)
	//Extract other params (these are not to be included in the xml)
	this.other = {}
	if (params.hasOwnProperty('other')){
		this.other = params.other
		delete params.other
	}
	//Attributes
	this._attribs = {
		id: uuid()
	}
	if (params){
		for (let name in params){
			if (name == 'tracks'){
				this.addTrack(params.tracks)
				delete params.tracks
			} else if (tractor_atts.includes(name)){
				this._attribs[name] = params[name]
			} else {
				//Create Property
				let property = new Property(name,params[name])
				this.push(property);
			}
			
		}
	}
}

Tractor.prototype = _.extend(Tractor.prototype, require('../interfaces/xml'))
Tractor.prototype._node = 'tractor'
Tractor.prototype.push = function(mltObj) {
  this._inner.push(mltObj)
  return this
};
Tractor.prototype.id = function(new_id){
	if (new_id){
		this._attribs.id = new_id
	}
	return this._attribs.id
}
Tractor.prototype.addTrack = function(producer,params){
	if (Array.isArray(producer)){
		for (let p of producer){
			let track = new Track(p,params)
			this._inner[0].push(track)
			//this.push(track);
		}
	} else {
		let track = new Track(producer,params)
		this._inner[0].push(track)
		//this.push(track);
	}
	this.track_count++
	
}
Tractor.prototype.mix = function(){
	if (this.track_count<1) return
	for (let i = 0;i<this.track_count;i++){
		for (let j = i+1;j<this.track_count;j++){
			//Image mixing
			let cairoblend = new Transition.Frei0r.Cairoblend({
				a_track : i,
				b_track : j
			})
			this.push(cairoblend)
			//Audio mixing
			let audio_mix = new Transition.Mix({
				a_track : i,
				b_track : j
			})
			this.push(audio_mix)
			//Temporary
			/*let transition_data = {
				a_track : i,
				b_track : j,
				version : "0.9",
				mlt_service : "frei0r.cairoblend",
				disable : 0
			}
			let transition = new Transition.Transition(transition_data);
			this.push(transition);*/
		}
	}
}
Tractor.prototype.addFilter = function(params){
	let filter = null
	let original_id = params.atts.id
	switch (params.type.toLowerCase()){
		case "fade_in":
			//We have two filters here, brightness and volume
			params.atts.other['duration'] = this.other.duration
			params.atts.other.fade_in = params.atts.other.intro_transition_settings
			//Brightness
			params.atts.id = original_id + "_brigthness"
			brightness_filter = new Filter.Brightness(params.atts)
			this.push(brightness_filter)
			//Volume
			params.atts.id = original_id + "_volume"
			volume_filter = new Filter.Volume(params.atts)
			this.push(volume_filter)
			break
		case "fade_out":
			//We have two filters here, brightness and volume
			params.atts.other['duration'] = this.other.duration
			params.atts.other.fade_out = params.atts.other.outro_transition_settings
			params.atts.id = original_id + "_brigthness"
			//Brightness
			brightness_filter = new Filter.Brightness(params.atts)
			this.push(brightness_filter)
			//Volume
			params.atts.id = original_id + "_volume"
			volume_filter = new Filter.Volume(params.atts)
			this.push(volume_filter)
			break
		/*case 'affine':
			params.atts.other['duration'] = this.other.duration
			filter = new Filter.Affine(params.atts)
			this.push(filter)
			break
		case 'volume':
			params.atts.other['duration'] = this.other.duration
			filter = new Filter.Volume(params.atts)
			this.push(filter)
			break*/
		default :
			filter = new Filter(params.atts)
			this.push(filter)
	}
}

module.exports = Tractor;