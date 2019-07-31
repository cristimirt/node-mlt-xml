var Utility = require("./mlt/utility")
var MLT = function (json) {
  this._inner = []
  this.counters = {
	  producer : 0,
	  filter : 0,
	  transition : 0,
	  tractor : 0,
	  track : 0,
	  playlist : 0,
	  other : 0
  }
  this.parseJSON(json)
}

MLT.Producer = require('./mlt/producer')
MLT.Playlist = require('./mlt/playlist')
MLT.Multitrack = require('./mlt/multitrack')
MLT.Tractor = require('./mlt/tractor')
MLT.Track = require('./mlt/multitrack/track');
MLT.Filter = require('./mlt/filter')
MLT.Transition = require('./mlt/transition')
MLT.Option = require('./mlt/option')
MLT.Profile = require('./mlt/profile')


MLT.prototype._node = 'mlt'
MLT.prototype._doctype = '<?xml version="1.0" encoding="utf-8"?>'
MLT.prototype._attribs = {}
MLT.prototype._toString = require('./interfaces/xml').toString
MLT.prototype.toString = function(builderArgs) {
 var doctype = this._doctype + ((builderArgs && builderArgs.pretty) ? "\n"  : '')
 return doctype + this._toString(builderArgs);
}
MLT.prototype.push = function(obj) {
  this._inner.push(obj)
  return this
}
MLT.prototype.getUID = function(type){
	if (!this.counters.hasOwnProperty(type)){
		type = 'other'
	}
	return type + "_" + this.counters[type]++
}
MLT.prototype.parseJSON = function(json){
	//Make sure we have a json
	if (!json) return null
	let obj = {...json}
	//If string, make object
	if (typeof obj == 'string'){
		obj = JSON.parse(obj)
	}
	//Profile
	if (obj.hasOwnProperty('profile')){
		let profile = new MLT.Profile(obj.profile)
		this.push(profile)
	}
	//Prepare the main tractor
	let main_tractor = new MLT.Tractor({
		id : 'main_tractor'
	})
	//Prepare the main playlist
	let main_playlist = new MLT.Playlist({
		id : 'main_playlist'
	})
	let total_duration_s = 0
	//Parse tracks in main tractor
	//Each track represents a slide
	let slide_count = 0
	for (let track of obj.main_tractor.tracks){
		slide_count++
		let slide_duration_s = track.hasOwnProperty('duration') ? track.duration : (track.hasOwnProperty('length') ? track['length'] : 5)
		total_duration_s += slide_duration_s
		//console.log(track)
		let slide_tractor = new MLT.Tractor({
			id 			: this.getUID('tractor'),
			slide_nr	: slide_count,
			note		: "slide-tractor",
			other 		: {
				duration : slide_duration_s
			}
		})
		
		//Slide background
		let background_producer = null
		switch (track.background.type.toLowerCase()){
			case 'color':
				background_producer = new MLT.Producer.Color({
					id 			: this.getUID('producer'),
					resource 	: track.background.resource,
					slide_nr 	: slide_count,
					note 		: 'background',
					other 		: {
						duration : slide_duration_s
					}
				})
				break;
			case 'image':
				background_producer = new MLT.Producer.Image({
					id 			: this.getUID('producer'),
					resource 	: track.background.resource,
					other 		: {
						duration : slide_duration_s
					},
					slide_nr 	: slide_count,
					note 		: 'background',
					filters		: [
						{
							type : 'affine',
							atts : {
								id  : this.getUID('filter'),
								other : {
									pos : {
										x : 0,
										y : 0,
										w : 1920,
										h : 1080,
										t : 100
									}
								}
							}
						}
					]
				})
				break;
		}
		this.push(background_producer)
		//Playlist
		let background_playlist = new MLT.Playlist({
			id 			: this.getUID('playlist'),
			slide_nr 	: slide_count,
			note		: 'background-playlist'
		})
		background_playlist.entry({
			producer : background_producer,
			in : Utility.secondsToDuration(0),
			out : Utility.secondsToDuration(slide_duration_s)
		})
		this.push(background_playlist)
		slide_tractor.addTrack(background_playlist,{
			note : "background"
		})
		//Components
		for (let comp of track.components){
			let comp_start_time_s = parseFloat(comp.properties.start_time)
			let comp_duration_s = parseFloat(comp.properties.duration)
			let comp_end_time_s = comp_start_time_s + comp_duration_s
			let component_producer = null
			switch (comp.type.toLowerCase()){
				case "audio":
					break
				case "image":
					component_producer = new MLT.Producer.Image({
						id 			: this.getUID('producer'),
						resource 	: comp.resource,
						title 		: comp.title,
						other 		: {
							start_time	: comp_start_time_s,
							duration 	: comp_duration_s
						},
						slide_nr 	: slide_count,
						note 		: 'image',
						filters 	: [
							{
								type : 'affine',
								atts : {
									id 		: this.getUID('filter'),
									other 	: {
										pos : comp.pos
									},
								}
							}
						]
					})
					break
				case "text":
					break
				case "video":
					component_producer = new MLT.Producer.Video({
						id 			: this.getUID('producer'),
						resource 	: comp.resource,
						title 		: comp.title,
						video_index : parseInt(comp.video_index),
						eof			: comp.eof,
						other 		: {
							start_time			: comp_start_time_s,
							duration 			: comp_duration_s,
							starting_position 	: parseFloat(comp.starting_position),
							ending_position		: parseFloat(comp.ending_position),
						},
						slide_nr 	: slide_count,
						note 		: 'video',
						filters 	: [
							{
								type : 'affine',
								atts : {
									id 		: this.getUID('filter'),
									other 	: {
										pos : comp.pos
									},
								}
							}
						]
					})
					break
				default:
					continue
			}
			//Skip if we don't have a producer
			if (component_producer === null) continue
			//Add intro/outro transitions
			if (comp.transitions){
				//Intro
				if (comp.transitions.intro){
					component_producer.addFilter({
						type : comp.transitions.intro.type,
						atts : {
							id : this.getUID('filter'),
							note : "intro_transition",
							other : {
								intro_transition_settings : comp.transitions.intro.settings
							}
						}
					})
				}
				//Outro
				if (comp.transitions.outro){
					component_producer.addFilter({
						type : comp.transitions.outro.type,
						atts : {
							id : this.getUID('filter'),
							note : "outro_transition",
							other : {
								outro_transition_settings : comp.transitions.outro.settings
							}
						}
					})
				}
			}
			//Add producer to mlt
			this.push(component_producer)
			let component_playlist = new MLT.Playlist({
				id 			: this.getUID('playlist'),
				slide_nr 	: slide_count,
				note		: comp.type.toLowerCase() + "-playlist"
			})
			//Add blank if needed
			if (comp_start_time_s > 0){
				component_playlist.push({
					type : "blank",
					length : Utility.secondsToDuration(comp_start_time_s)
				})
			}
			//Add Component to playlist
			component_playlist.entry({
				producer : component_producer,
				in : Utility.secondsToDuration(comp_start_time_s),
				out : Utility.secondsToDuration(comp_end_time_s),
			})
			//Add playlist to mlt
			this.push(component_playlist)
			//Add playlist to tractor
			slide_tractor.addTrack(component_playlist,{
				note : "comp-" + comp.type.toLowerCase()
			})
		}
		//Slide Audio
		if (track.hasOwnProperty('audio') && track.audio){
			let audio_producer = new MLT.Producer.Audio({
				id : this.getUID('producer'),
				resource : track.audio.resource,
				slide_nr : slide_count,
				note : 'slide_audio-producer',
				other : {
					volume : track.audio.hasOwnProperty('volume') ? parseFloat(track.audio.volume) : 1,
					duration : slide_duration_s,
				}
			})
			this.push(audio_producer)
			let audio_playlist = new MLT.Playlist({
				id : this.getUID('playlist'),
				slide_nr : slide_count,
				note : 'slide_audio-playlist',
			})
			audio_playlist.entry({
				producer : audio_producer
			})
			this.push(audio_playlist)
			slide_tractor.addTrack(audio_playlist,{
				note : 'slide_audio'
			})
		}
		//Add necessary mix transitions to tracks
		slide_tractor.mix()
		//Add intro/outro transitions
		if (track.transitions){
			//Intro
			if (track.transitions.intro){
				slide_tractor.addFilter({
					type : track.transitions.intro.type,
					atts : {
						id : this.getUID('filter'),
						note : "intro_transition",
						other : {
							intro_transition_settings : track.transitions.intro.settings
						}
					}
				})
			}
			//Outro
			if (track.transitions.outro){
				slide_tractor.addFilter({
					type : track.transitions.outro.type,
					atts : {
						id : this.getUID('filter'),
						note : "outro_transition",
						other : {
							outro_transition_settings : track.transitions.outro.settings
						}
					}
				})
			}
		}
		//Add tractor to mlt
		this.push(slide_tractor)
		//Add tractor to main playlist
		main_playlist.entry({
			producer 	: slide_tractor,
			note 		: 'slide-' + slide_count
		})
		//main_tractor.addTrack(slide_tractor,{
			//note : "slide-" + slide_count
		//})
	}
	this.push(main_playlist)
	
	main_tractor.addTrack(main_playlist,{
		note : 'main-playlist'
	})
	//Master Audio
	if (obj.main_tractor.hasOwnProperty('audio') && obj.main_tractor.audio){
		let audio_producer = new MLT.Producer.Audio({
			id : this.getUID('producer'),
			resource : obj.main_tractor.audio.resource,
			note : 'master_audio-producer',
			other : {
				volume : obj.main_tractor.audio.hasOwnProperty('volume') ? parseFloat(obj.main_tractor.audio.volume) : 1,
				duration : total_duration_s,
			}
		})
		this.push(audio_producer)
		let audio_playlist = new MLT.Playlist({
			id : this.getUID('playlist'),
			note : 'master_audio-playlist',
		})
		audio_playlist.entry({
			producer : audio_producer
		})
		this.push(audio_playlist)
		main_tractor.addTrack(audio_playlist,{
			note : 'master_audio'
		})
	}
	//Add necessary mix transitions to tracks
	main_tractor.mix()
	this.push(main_tractor)
	
}
MLT.prototype.parseJSONOld = function(json){
	if (json){
		//construct xml objects based on json
		let obj = json;
		if (typeof obj == 'string'){
			obj = JSON.parse(obj);
		}
		if (obj.hasOwnProperty('profile')){
			let profile = new MLT.Profile(obj.profile);
			this.push(profile);
		}
		if (obj.hasOwnProperty('tracks')){
			let tractor = new MLT.Tractor();
			let producers = {};
			let playlists = {};
			for (let track_id in obj.tracks){
				for (let p in obj.tracks[track_id].producers){
					let producer_data = obj.tracks[track_id].producers[p];
					let producer = null;
					switch (producer_data.type){
						case "color":
							producer = new MLT.Producer.Color(producer_data);
							break;
						case "image":
							producer = new MLT.Producer.Image(producer_data);
							break;
						case "video":
							producer = new MLT.Producer.Video(producer_data);
							break;
						case "audio":
							producer = new MLT.Producer.Audio(producer_data);
							break;
						case "text":
							producer = new MLT.Producer.Text(producer_data);
							break;
						default :
							producer = new MLT.Producer.Producer(producer_data);
							break;
					}
					if (producer){
						producers[producer.id()] = producer;
						this.push(producer);
						//let track = new MLT.Track(producer);
						//tractor.push(track);
					} 
				}
				let playlist = new MLT.Playlist({id:track_id});
				for (let entry_id in obj.tracks[track_id].playlist){
					let type = obj.tracks[track_id].playlist[entry_id].type;
					switch (type){
						case "blank" :
							playlist.blank(obj.tracks[track_id].playlist[entry_id].length);
							break;
						case "entry":
							let entry_data = obj.tracks[track_id].playlist[entry_id];
							entry_data.producer = producers[entry_data.producer_id];
							delete entry_data.type;
							delete entry_data.producer_id;
							playlist.entry(entry_data);
							break;
					}
				}
				playlists[playlist.id()] = playlist;
				this.push(playlist);
				tractor.addTrack(playlist);
				//let track = new MLT.Track(playlist);
				//tractor.push(track);
			}
			for (let transition_id in obj.transitions){
				let transition = new MLT.Transition.Transition(obj.transitions[transition_id]);
				tractor.push(transition);
			}
			this.push(tractor);
		}
	}
}
module.exports = MLT;