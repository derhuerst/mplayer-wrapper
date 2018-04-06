'use strict'

const {EventEmitter} = require('events')
const shellEscape = require('shell-escape-tag').default.escape
const {spawn} = require('child_process')
const byLine = require('byline')

const parsers = require('./lib/parsers')

const createPlayer = () => {
	const out = new EventEmitter()

	const proc = spawn('mplayer', [
		'-slave', // 😔
		'-idle',
		'-quiet',
		'-msglevel', 'all=1:global=4:cplayer=4'
	], {
		env: process.env,
		stdio: ['pipe', 'pipe', 'ignore']
	})

	// wrapper -> mplayer
	const exec = (cmd, args = []) => {
		const str = shellEscape(cmd, args)
		proc.stdin.write(str + '\n')
	}
	const getProps = (props) => {
		for (let prop of props) exec('get_property', [prop])
	}

	const play = (fileOrUrl) => exec('loadfile', [fileOrUrl])
	const queue = (fileOrUrl) => exec('loadfile', [fileOrUrl, '1'])
	const next = () => exec('pt_step', ['1'])
	const previous = () => exec('pt_step', ['-1'])
	const playPause = () => exec('pause')
	const seek = (pos) => exec('seek', [pos, '0'])
	const seekPercent = (pos) => exec('seek', [pos, '1'])
	const setVolume = (amount) => exec('volume', [amount, '1'])
	const stop = () => exec('stop')

	let closed = false
	proc.on('close', (code) => {
		closed = true
		out.emit('close', code)
		if (code > 0) {
			// todo: emit err from proc.stderr
		}
	})
	const close = () => {
		if (!closed) exec('quit')
	}

	// mplayer -> wrapper
	const onLine = (line) => {
		if (line === 'Starting playback...') return out.emit('track-change')

		const parts = /^ANS_([\w]+)\=/g.exec(line)
		if (!parts || !parts[1]) return null
		const prop = parts[1]

		const parser = parsers[prop]
		if (!parser) return null
		const val = parser(line.slice(parts[0].length))
		out.emit('prop', prop, val)
		out.emit(prop, val)
	}

	proc.stdout
	.pipe(byLine.createStream())
	.on('data', (line) => {
		onLine(Buffer.isBuffer(line) ? line.toString() : line)
	})

	out.exec = exec
	out.getProps = getProps
	out.seek = seek
	out.play = play
	out.queue = queue
	out.next = next
	out.previous = previous
	out.seekPercent = seekPercent
	out.playPause = playPause
	out.setVolume = setVolume
	out.stop = stop
	out.close = close
	return out
}

module.exports = createPlayer
