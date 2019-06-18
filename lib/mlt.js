var MLT = function (json) {
  this._inner = []
  this.parseJSON(json);
}

MLT.Producer = require('./mlt/producer')
MLT.Playlist = require('./mlt/playlist')
MLT.Multitrack = require('./mlt/multitrack')
MLT.Tractor = require('./mlt/tractor')
MLT.Track = require('./mlt/multitrack/track');
MLT.Filter = require('./mlt/filter')
MLT.Transition = require('./mlt/transition')
MLT.Option = require('./mlt/option');
MLT.Profile = require('./mlt/profile');


MLT.prototype._node = 'mlt'
MLT.prototype._doctype = '<?xml version="1.0" encoding="utf-8"?>'
MLT.prototype._attribs = {}
MLT.prototype._toString = require('./interfaces/xml').toString
MLT.prototype.toString = function(builderArgs) {
 var doctype = this._doctype + ((builderArgs && builderArgs.pretty) ? "\n\n"  : '');
 return doctype + this._toString(builderArgs);
}
MLT.prototype.push = function(obj) {
  this._inner.push(obj)
  return this
};
MLT.prototype.parseJSON = function(json){
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