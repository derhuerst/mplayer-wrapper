'use strict'

const {EventEmitter} = require('events')
const escape = require('js-string-escape')
const {spawn} = require('child_process')
const byLine = require('byline')
const debug = require('debug')('mplayer-wrapper')

const parsers = require('./lib/parsers')

const AUDIO_OUTPUT_DRIVER = process.env.MPLAYER_AUDIO_OUTPUT_DRIVER || null

const createPlayer = () => {
	const out = new EventEmitter()

	const args = [
		'-slave', // 😔
		...(AUDIO_OUTPUT_DRIVER ? ['-ao', AUDIO_OUTPUT_DRIVER] : []),
		'-idle',
		'-quiet',
		'-msglevel', 'all=1:global=4:cplayer=4'
	]
	debug('spawning mplayer with', args)
	const proc = spawn('mplayer', args, {
		env: process.env,
		stdio: ['pipe', 'pipe', 'ignore']
	})

	// wrapper -> mplayer
	const exec = (cmd, args = []) => {
		let str = cmd
		for (let arg of args) {
			str += ' '
			if ('string' === typeof arg) {
				if (arg.includes(' ')) str += `'`
				str += escape(arg)
				if (arg.includes(' ')) str += `'`
			} else str += arg
		}
		debug('exec: ' + str)
		proc.stdin.write(str + '\n')
	}
	const getProps = (props) => {
		for (let prop of props) exec('pausing_keep_force get_property', [prop])
	}

	const play = (fileOrUrl) => exec('loadfile', [fileOrUrl])
	const queue = (fileOrUrl) => exec('loadfile', [fileOrUrl, '1'])
	const next = () => exec('pt_step', ['1'])
	const previous = () => exec('pt_step', ['-1'])
	const playPause = () => exec('pause')
	const seek = (pos) => exec('pausing_keep seek', [pos, '0'])
	const seekPercent = (pos) => exec('pausing_keep seek', [pos, '1'])
	const setVolume = (amount) => exec('pausing_keep volume', [amount, '1'])
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
		debug('line: ' + line)
		if (line === 'Starting playback...') return out.emit('track-change')
		
		//Callback when playlist finishes
		if (line === "ANS_ERROR=PROPERTY_UNAVAILABLE") return out.emit('playlist-finish')
		// todo: `ANS_ERROR=PROPERTY_UNAVAILABLE`

		const parts = /^ANS_([\w]+)=/g.exec(line)
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
