'use strict'

const path = require('path')

const createPlayer = require('..')

const player = createPlayer()
player.setVolume(100)

player.queue(path.join(__dirname, 'c-major.ogg'))
player.queue(path.join(__dirname, 'g-major.ogg'))
player.queue(path.join(__dirname, `'f-major.ogg`))
player.queue(path.join(__dirname, 'c-major.ogg'))

player.on('prop', (prop, val) => {
	console.log(prop, 'is', val)
})

const timePosInterval = setInterval(() => {
	player.getProps(['time_pos'])
}, 5 * 1000)

player.on('track-change', () => {
	player.getProps([
		'metadata',
		'length',
		'time_pos',
	])
})

player.once('playlist-finish', () => {
	clearInterval(timePosInterval)
	player.close()
})
