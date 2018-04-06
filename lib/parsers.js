'use strict'

const id = val => val

const parseFlag = str => str.toLowerCase().trim() === 'yes'

const knownMetaProps = [
	'Title', 'Artist', 'Album', 'Year', 'Comment', 'Genre'
]

const parseStringList = (str) => {
	const res = Object.create(null)
	const parts = str.split(',')
	let metaProp = null
	for (let i = 0; i < parts.length; i++) {
		const part = parts[i]
		if (knownMetaProps.includes(part)) {
			metaProp = part
		} else if (metaProp) {
			if (!res[metaProp]) res[metaProp] = part
			else res[metaProp] += ',' + part
		}
	}
	return res
}

module.exports = {
	osdlevel: parseInt,
	loop: parseInt,
	speed: parseFloat,
	filename: id,
	path: id,
	demuxer: id,
	stream_pos: parseFloat,
	stream_start: parseFloat,
	stream_end: parseFloat,
	stream_length: parseFloat,
	stream_time_pos: parseFloat,
	length: parseFloat,
	percent_pos: parseInt,
	time_pos: parseFloat,
	chapter: parseInt,
	titles: parseInt,
	chapters: parseInt,
	angle: parseInt,
	metadata: parseStringList,
	pause: parseFlag,
	capturing: parseFlag,
	volume: parseFloat,
	mute: parseFlag,
	audio_delay: parseFloat,
	audio_format: parseInt,
	audio_codec: id,
	audio_bitrate: parseInt,
	samplerate: parseInt,
	channels: parseInt,
	switch_audio: parseInt,
	balance: parseFloat,
	fullscreen: parseFlag,
	deinterlace: parseFlag,
	ontop: parseFlag,
	rootwin: parseFlag,
	border: parseFlag,
	framedropping: parseInt,
	gamma: parseInt,
	brightness: parseInt,
	contrast: parseInt,
	saturation: parseInt,
	hue: parseInt,
	panscan: parseFloat,
	vsync: parseFlag,
	video_format: parseInt,
	video_codec: id,
	video_bitrate: parseInt,
	width: parseInt,
	height: parseInt,
	fps: parseFloat,
	aspect: parseFloat,
	switch_video: parseInt,
	switch_program: parseInt,
	sub: parseInt,
	sub_source: parseInt,
	sub_vob: parseInt,
	sub_demux: parseInt,
	sub_file: parseInt,
	sub_delay: parseFloat,
	sub_pos: parseInt,
	sub_alignment: parseInt,
	sub_visibility: parseFlag,
	sub_forced_only: parseFlag,
	tv_brightness: parseInt,
	tv_contrast: parseInt,
	tv_saturation: parseInt,
	tv_hue: parseInt,
	teletext_page: parseInt,
	teletext_subpage: parseInt,
	teletext_mode: parseFlag,
	teletext_format: parseInt,
	teletext_half_page: parseInt
}
