'use strict'

const {EventEmitter} = require('events')
const shellEscape = require('shell-escape-tag').default.escape
const {spawn} = require('child_process')
const byLine = require('byline')

const parsers = require('./lib/parsers')

const validPropLine = /^ANS_([\w]+)\=/g

const createPlayer = () => {
	const out = new EventEmitter()

	const proc = spawn('mplayer', [
		'-slave', // 😔
		'-idle',
		'-quiet',
		'-msglevel', 'all=1:global=4:cplayer=4',
		'-playing-msg', 'ANS_NEW_TRACK\\n'
	], {
		env: process.env,
		stdio: ['pipe', 'pipe', 'ignore']
	})

	// wrapper -> mplayer
	const exec = (cmd, args) => {
		const str = shellEscape(cmd, args)
		proc.stdin.write(str + '\n')
	}
	const getProps = (props) => {
		for (let prop of props) exec('get_property', [prop])
	}

	// mplayer -> wrapper
	const onLine = (line) => {
		if (line === 'ANS_NEW_TRACK') return out.emit('track-change')

		const parts = validPropLine.exec(line)
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
	return out
}

module.exports = createPlayer
