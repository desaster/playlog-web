# playlog-web

playlog-web is a completely browser based implementation of
[playlog.py](https://github.com/desaster/kippo/blob/master/utils/playlog.py),
which is an utility for playing [kippo](https://github.com/desaster/kippo/) logfiles with real timings.

## Kippo? What is that?

Kippo is an SSH honeypot written in Python. Head over to the
[project github page](https://github.com/desaster/kippo/) for more details.

Kippo is no longer in active development, but there are one or more active forks.

## Motivation

While I haven't actually maintained kippo in a long time, it has always
bothered me that I haven't maintained working links to the demo logfiles.

The logfiles, and their ability to show what the attackers were doing (or
attempting to) were entertaining, and one of the main reasons I created the
project.

## Demo

Here are some interesting demos from back in the day:

* [2009-11-22](http://kippo.rpg.fi/playlog/?l=20091122-075013-5055.log)
* [2009-11-23](http://kippo.rpg.fi/playlog/?l=20091123-003854-3359.log)
* [2009-11-23](http://kippo.rpg.fi/playlog/?l=20091123-012814-626.log)                                                                 
* [2010-03-16](http://kippo.rpg.fi/playlog/?l=20100316-233121-1847.log)                                                               

## Building

Simply run: `npm run build`, and some files should appear in `dist/`.

## How to use?

Point your browser to `playlog.html`, and supply it a log file with the
parameter `l=logfile.log`. The logfiles should be placed in the same directory
as the `playlog.html` and `playlog.js`.

For example, you would have these files in a directory on your web server:

* playlog.html
* playlog.js
* example.log

In which case the proper URL might be
`http://localhost/playlog.html?l=example.log`

## Credits

This software is quite simple, and relies heavily on
[xterm.js](https://xtermjs.org/) to provide a browser-based terminal emulator.

## License

[MIT](LICENSE)
