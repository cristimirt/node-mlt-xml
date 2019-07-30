var _ = require("underscore"),
	uuid = require("node-uuid"),
	Property = require("./property"),
	Filter = require("./filter");
var producer_atts = ['id','title','in','out'];
var defaults = {
		id : uuid(),
		in : '00:00:00.000',
		out : '00:00:00.000',
		length : 0,
		filters : []
	},
	image_defaults = {
		aspect_ratio : 1,
		eof : 'pause',
		ttl : 1,
		progressive : 1,
		seekable : 1,
		mlt_service : 'qimage',
		//mlt_service : 'pixbuf',
		global_feed : 1,
	},
	video_defaults = {
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
	},
	audio_defaults = {
		eof : 'pause',
		video_index : -1,
		audio_index : 0,
		seekable : 1,
		global_feed : 1,
	},
	color_defaults = {
		aspect_ratio : 1,
		mlt_service : 'color',
		mlt_image_format : 'rgb24',
		'set.test_audio' : 0
	},
	text_defaults = {
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
	};

var Producer = function (params) {
	delete params.type;
	//Merge params with defaults
	params = {...defaults, ...params};
	//Content
	this._inner = [];
	//Attribs
	this._attribs = {};
	let filters = null;
	if (params){
		for (let name in params){
			if (name == "filters"){
				filters = [...params.filters];
				delete params.filters;
			} else if (producer_atts.includes(name)){
				this._attribs[name] = params[name];
			} else {
				//Create Property
				let property = new Property(name,params[name]);
				this.push(property);
			}
			
		}
	}
	if (filters){
		//Add Filters
		for (let f in filters){
			let filter = new Filter.Filter(filters[f]);
			this._inner.push(filter);
		}
	}
	
}

Producer.prototype = _.extend(Producer.prototype, require("../interfaces/xml"), require("../interfaces/properties"));
Producer.prototype._node = "producer";
Producer.prototype.id = function (new_id) {
	if (new_id){
		this._attribs.id = new_id;
	}
	return this._attribs.id;
}
Producer.prototype.push = function(obj) {
  this._inner.push(obj);
  return this;
};

module.exports = {
	Producer : Producer,
	Color : function(params){
		params = {...color_defaults,...params};
		let producer = new Producer(params);
		return producer;
	},
	Image: function(params) {
		params = {...image_defaults,...params};
		let  producer = new Producer(params);
		/*producer._attribs.mlt_service = "pixbuf";
		if (params) { 
			if (params.length) {
				producer._attribs.out = params.length - 1;
			}
			if (params.source) {
				producer._attribs.resource = params.source;
			}
		}*/
		return producer;
	},
	Audio: function(params) {
		params = {...audio_defaults, ...params};
		let producer = new Producer(params);
		/*producer._attribs.mlt_service = "avformat";
		producer._attribs.video_index = -1;
		if (params) {
			if (params.startFrame) {
				producer._attribs.in = params.startFrame;
			}
			if (params.length) {
				producer._attribs.out = (params.startFrame || 0) + params.length - 1;
			}
			if (params.source) {
				producer._attribs.resource = params.source;
			}
			if (params.in){
				producer._attribs.in = params.in;
			}
			if (params.out){
				producer._attribs.out = params.out;
			}
			if (params.eof){
				producer._attribs.eof = params.eof;
			}
			if (params.no_audio){
				producer._attribs.audio_index = "-1";
			}
			if (params.audio_index){
				producer._attribs.audio_index = params.audio_index;
			}
		}*/
		return producer
	},
	Video: function(params) {
		params = {...video_defaults,...params};
		let producer = new Producer(params);
		/*producer._attribs.mlt_service = "avformat";
		if (params) {
			if (params.startFrame) {
				producer._attribs.in = params.startFrame;
			}
			if (params.length) {
				producer._attribs.out = (params.startFrame || 0) + params.length - 1;
			}
			if (params.source) {
				producer._attribs.resource = params.source;
			}
			if (params.forceAspectRatio) {
				producer._attribs.force_aspect_ratio = params.forceAspectRatio;
			}
		}*/
		return producer
	},
	Text : function(params){
		params = {...text_defaults,...params};
		let producer = new Producer(params);
		return producer;
	}
}