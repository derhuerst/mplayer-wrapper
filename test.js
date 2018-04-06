'use strict'

const path = require('path')
const test = require('tape')

const createPlayer = require('.')

const sampleC = path.join(__dirname, 'example', 'c-major.ogg')
const sampleG = path.join(__dirname, 'example', 'g-major.ogg')
const sampleF = path.join(__dirname, 'example', `'f-major.ogg`)

const isObj = o => o !== null && 'object' === typeof o && !Array.isArray(o)

test('works', (t) => {
	const player = createPlayer()
	player.queue(sampleC)
	player.queue(sampleG)
	player.queue(sampleF)
	player.queue(sampleC)

	let metadataEvents = 0, filenameEvents = 0, trackChangeEvents = 0
	player.on('metadata', (meta) => {
		metadataEvents++
		t.ok(metadataEvents <= 4)
		t.ok(isObj(meta))
		// todo: use sample files with metadata, assert
	})
	player.on('filename', (filename) => {
		filenameEvents++
		t.ok(filenameEvents <= 4)
		t.equal(typeof filename, 'string')
		t.equal(filename.slice(-10), '-major.ogg')
	})
	player.on('track-change', () => {
		trackChangeEvents++
		t.ok(trackChangeEvents <= 4)
		player.getProps(['filename', 'metadata'])
	})

	player.on('time_pos', (pos) => {
		t.equal(typeof pos, 'number')
		t.ok(pos >= 0)
		t.ok(pos <= 100)
	})
	const int = setInterval(() => {
		player.getProps(['time_pos']) // todo: more props
	}, 2 * 1000)

	setTimeout(() => player.close(), 15 * 1000)
	player.once('close', () => {
		clearInterval(int)
		t.end()
	})
})
