import { Terminal } from 'xterm'
import { TTYLog } from './ttylog';

import './style.css'
import '../node_modules/xterm/css/xterm.css'

async function startup() {
    // read logfile from query parameter
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const filename = urlParams.get('l')
    if (filename === null) {
        console.error('no logfile specified');
        return;
    }

    // update h1 tag with logfile
    const h = document.querySelector('h1#playlog-title');
    h.innerHTML = filename;

    // initialize xterm.js
    const term = new Terminal({ convertEol: true });
    const elem = document.getElementById('terminal');
    if (elem === null) {
        console.error('terminal element not found in dom');
        return;
    }
    term.open(elem);

    // read log data from binary file
    const data = await binread(filename);

    // parse the data and iterate events
    const ttylog = new TTYLog(data);
    while (1) {
        const s = await ttylog.tick();
        if (s === null) {
            term.write('\x1b[31m\x1b[47mEOF!\x1b[0m');
            break; // null = eof, bail out
        }
        if (s !== '') {
            term.write(s);
        }
    };
}

async function binread(filename: string): Promise<Uint8Array> {
    return new Promise(function(resolve, reject) {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', filename, true);
        xhr.responseType = 'arraybuffer';
        xhr.onload = function(e) {
            if (this.status !== 200) {
                console.error('file request returned != 200');
                reject(new Error('file request returned status ' + this.status));
                return;
            }
            const arrayBuffer = xhr.response; // Note: not xhr.responseText
            if (arrayBuffer) {
                const byteArray = new Uint8Array(arrayBuffer);
                resolve(byteArray);
            }
        }
        xhr.send();
    });
}

document.addEventListener('DOMContentLoaded', (event) => {
    startup();
});
