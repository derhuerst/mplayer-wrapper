# mplayer-wrapper

**Let an [mplayer](http://www.mplayerhq.hu/) instance play media and control it.**

[![npm version](https://img.shields.io/npm/v/mplayer-wrapper.svg)](https://www.npmjs.com/package/mplayer-wrapper)
[![build status](https://api.travis-ci.org/derhuerst/mplayer-wrapper.svg?branch=master)](https://travis-ci.org/derhuerst/mplayer-wrapper)
![ISC-licensed](https://img.shields.io/github/license/derhuerst/mplayer-wrapper.svg)
[![chat with me on Gitter](https://img.shields.io/badge/chat%20with%20me-on%20gitter-512e92.svg)](https://gitter.im/derhuerst)
[![support me on Patreon](https://img.shields.io/badge/support%20me-on%20patreon-fa7664.svg)](https://patreon.com/derhuerst)


## Installing

```shell
npm install mplayer-wrapper
```


## Usage

```js
const createPlayer = require('mplayer-wrapper')

const player = createPlayer()
player.queue('path/to/audio-1.mp3')
player.queue('path/to/audio-2.ogg')
player.queue('http://example.org/audio-3.ogg')

player.on('time_pos', (val) => {
	console.log('track progress is', val)
})
setInterval(() => {
	player.getProps(['time_pos'])
}, 2 * 1000)

player.on('metadata', console.log)
player.on('track-change', () => player.getProps(['metadata']))
```


## API

### Methods

- `player.exec(command, args = [])`: Send a command to mplayer. See [the list](http://www.mplayerhq.hu/DOCS/tech/slave.txt).
- `player.getProps(props)`: Request values for one or more props. Run `mplayer -list-properties` for a list.
- `player.play(fileOrUrl)`: Discard the current queue, play this file.
- `player.queue(fileOrUrl)`: Add this file to the queue.
- `player.next()`: Jump to the next file in the queue.
- `player.previous()`: Jump to the previous file in the queue.
- `player.playPause()`: Toggle pause.
- `player.seek(pos)`: Seek to a position in seconds. Prepend `+`/`-` for relative seeking.
- `player.seekPercent(pos)`: Seek to a position in percent of the file. E.g. `30`.
- `player.setVolume(amount)`: Set the volume. `0` is silent, `100` is maximum.
- `player.stop`: Stop playing.
- `player.close`: Stop playing, close the mplayer instance.

### Events

- `prop(<name>, <value>)`: The value for a prop has been requested (e.g. using `getProps`), and we now know the value.
- `<propName>(<value>)`: A shorthand for the `prop` event.
- `track-change`: A new track/file is playing now.


## Contributing

If you have a question or have difficulties using `mplayer-wrapper`, please double-check your code and setup first. If you think you have found a bug or want to propose a feature, refer to [the issues page](https://github.com/derhuerst/mplayer-wrapper/issues).
