var _ = require("underscore"),
	uuid = require("node-uuid"),
	Property = require("./property"),
	Filter = require("./filter"),
	Utility = require("./utility")
var producer_atts = ['id','title','in','out','slide_nr','note'];

var Producer = function (params) {
	//Content
	this._inner = []
	//Attribs
	this._attribs = {}
	let defaults = {
		id : uuid(),
		in : Utility.secondsToDuration(0),  //'00:00:00.000',
		//out : Utility.secondsToDuration(0), //'00:00:00.000',
		//length : 0,
		filters : []
	}
	delete params.type
	//Merge params with defaults
	params = {...defaults, ...params}
	//Extract other params (these are not to be included in the xml)
	let other = {}
	if (params.hasOwnProperty('other')){
		other = params.other
		delete params.other
	}
	let filters = null
	//This 'other' contains properties that we might need to generate correct xml, but are not to be included in the xml
	this.other = {
		in : 0,
		out : null,
		duration : null
	}
	if (other.hasOwnProperty('duration')){
		this.other.duration = parseFloat(other.duration)
		this._attribs.out = Utility.secondsToDuration(other.duration)
	}
	let has_length = false;
	if (params){
		//console.log(params)
		for (let name in params){
			if (name == "filters"){
				filters = [...params.filters];
				delete params.filters;
			} else if (producer_atts.includes(name)){
				if (name == 'in'){
					//We're getting the value as float, but we need it as formatted string
					this._attribs.in = Utility.secondsToDuration(params.in)
					this.other.in = params.in
					//Update the out timestamp
					if (this._attribs.hasOwnProperty('out')){
						this._attribs.out = Utility.secondsToDuration(parseFloat(this.other.duration)+parseFloat(params.in))
					}
				} else if (name == 'out'){
					//We're getting the value as float, but we need it as formatted string
					this._attribs.out = Utility.secondsToDuration(params.out)
					this.other.out = params.out
					this.other.duration = this.other.out - this.other.in
				} else {
					this._attribs[name] = params[name];
				}
			} else {
				//Create Property
				let property = new Property(name,params[name]);
				this.push(property);
				if (name === 'length') has_length = true;
			}
		}
	}
	//Add length if it wasn't added already
	if (!has_length){
		let property = new Property('length',Utility.secondsToFrames(this.other.duration))
		this.push(property)
	}
	if (filters){
		//Add Filters
		for (let f of filters){
			this.addFilter(f)
		}
	}
	
}

Producer.prototype = _.extend(Producer.prototype, require("../interfaces/xml"), require("../interfaces/properties"));
Producer.prototype._node = "producer";
Producer.prototype.id = function (new_id) {
	if (new_id){
		this._attribs.id = new_id
	}
	return this._attribs.id
}
Producer.prototype.push = function(obj) {
  this._inner.push(obj)
  return this
}
//Add Filter
Producer.prototype.addFilter = function(params){
	let filter = null
	let original_id = params.atts.id
	switch (params.type.toLowerCase()){
		case "fade_in":
			//We have two filters here, brightness and volume
			params.atts.other['duration'] = this.other.duration
			params.atts.other.fade_in = params.atts.other.intro_transition_settings
			//Brightness
			params.atts.id = original_id + "_brigthness"
			params.atts.alpha = -1
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
			//Brightness
			params.atts.id = original_id + "_brigthness"
			params.atts.alpha = -1
			brightness_filter = new Filter.Brightness(params.atts)
			this.push(brightness_filter)
			//Volume
			params.atts.id = original_id + "_volume"
			volume_filter = new Filter.Volume(params.atts)
			this.push(volume_filter)
			break
		case 'affine':
			params.atts.other['duration'] = this.other.duration
			filter = new Filter.Affine(params.atts)
			this.push(filter)
			break
		case 'volume':
			params.atts.other['duration'] = this.other.duration
			filter = new Filter.Volume(params.atts)
			this.push(filter)
			break
		default :
			filter = new Filter(params.atts)
			this.push(filter)
	}
	
}

//================
// Audio
//=================
Producer.Audio = function(params){
	let defaults = {
		eof : 'pause',
		video_index : -1,
		audio_index : 0,
		seekable : 1,
		global_feed : 1,
	}
	let other = {}
	if (params.hasOwnProperty('other')){
		other = params.other
		//delete params.other
	}
	if (other.hasOwnProperty('volume')){
		if (!params.hasOwnProperty('filters')){
			params.filters = []
		}
		params.filters.push({
			type : 'volume',
			atts : {
				id : params.id + "_volume",
				other : {
					volume : other.volume
				}
			}
		})
	}
	params = {...defaults,...params}
	let producer = new Producer(params)
	return producer
}
//================
// Color
//=================
Producer.Color = function(params){
	let defaults = {
		aspect_ratio : 1,
		mlt_service : 'color',
		mlt_image_format : 'rgb24',
		'set.test_audio' : 0
	}
	let other = {}
	if (params.hasOwnProperty('other')){
		other = params.other
		//delete params.other
	}
	params = {...defaults,...params}
	let producer = new Producer(params)
	return producer
}
//================
// Image
//=================
Producer.Image = function(params){
	let defaults = {
		aspect_ratio : 1,
		eof : 'pause',
		ttl : 1,
		progressive : 1,
		seekable : 1,
		mlt_service : 'qimage',
		//mlt_service : 'pixbuf',
		global_feed : 1,
	}
	let other = {}
	if (params.hasOwnProperty('other')){
		other = params.other
		//delete params.other
	}
	params = {...defaults,...params}
	let producer = new Producer(params)
	return producer
}
//================
// Text
//=================
Producer.Text = function(params){
	let defaults = {
		mlt_service : 'qtext',
		resource : '+.txt',
		family : 'Ubuntu',
		size : 72,
		align : 1,
		fgcolour : "#ff000000",
		bgcolour : "#00000000",
		olcolour : "#00000000",
		outline : 0,
		pad : 8,
		text : "Demo Text",
	}
	let other = {}
	if (params.hasOwnProperty('other')){
		other = params.other
		//delete params.other
	}
	params = {...defaults,...params}
	let producer = new Producer(params)
	return producer
}
//================
// Video
//=================
Producer.Video = function(params){
	let defaults = {
		aspect_ratio : 1,
		eof : 'pause',
		audio_index : 1,
		video_index : 0,
		mute_on_pause : 0,
		//mlt_service : 'avformat-novalidate',
		//mlt_service : 'avformat',
		seekable : 1,
		ignore_points : 1,
		global_feed : 1,
	}
	let other = {}
	if (params.hasOwnProperty('other')){
		other = params.other
		//delete params.other
	}
	params = {...defaults,...params}
	let producer = new Producer(params)
	return producer
}

//Return
module.exports = Producer
