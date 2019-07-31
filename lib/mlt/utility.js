var Utility = {
	secondsToFrames : function(seconds, frame_rate = 25){
		return seconds * frame_rate
	},
	addDurations : function(duration, duration_in = '00:00:00.000'){
		let exploded_d = duration.split(":")
		let duration_h = parseInt(exploded_d[0],10)
		let duration_m = parseInt(exploded_d[1],10)
		let duration_s = parseFloat(exploded_d[2])
		let exploded_in = duration_in.split(":")
		let in_h = parseInt(exploded_in[0],10)
		let in_m = parseInt(exploded_in[1],10)
		let in_s = parseFloat(exploded_in[2])
		let total_h = duration_h + in_h
		let total_m = duration_m + in_m
		let total_s = duration_s + in_s
		total_m = total_m + Math.floor(total_s/60)
		total_s = total_s - (Math.floor(total_s/60)*60)
		total_s = total_s.toFixed(3)
		total_h = total_h + Math.floor(total_m/60)
		total_m = total_m - (Math.floor(total_m/60)*60)
		if (total_h < 10) total_h = "0" + total_h
		if (total_m < 10) total_m = "0" + total_m
		if (total_s < 10) total_s = "0" + total_s
		let final_duration = [total_h,total_m ,total_s].join(':')
		return final_duration;
	},
	secondsToDuration : function(seconds, duration_in = '00:00:00.000'){
		seconds = parseFloat(seconds)
		let hours = Math.floor(seconds/3600)
		let minutes = Math.floor((seconds - (hours * 3600))/60)
		seconds = seconds - (hours * 3600) - (minutes * 60)
		seconds = seconds.toFixed(3)
		if (hours   < 10) hours   = "0" + hours
		if (minutes < 10) minutes = "0" + minutes
		if (seconds < 10) seconds = "0" + seconds
		let duration = [hours,minutes,seconds].join(':')
		return this.addDurations(duration,duration_in)
	},
}

module.exports = Utility