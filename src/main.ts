/* eslint-disable no-useless-constructor */
import { Terminal } from 'xterm'

import './style.css'
import '../node_modules/xterm/css/xterm.css'

/* eslint-disable no-unused-vars */
enum LogOp {
    OPEN = 1,
    CLOSE = 2,
    WRITE = 3,
    EXEC = 4
}

enum LogType {
    INPUT = 1,
    OUTPUT = 2,
    INTERACT = 3,
}
/* eslint-enable no-unused-vars */

class TTYLog {
    // current position of parsed data
    private pos: number = 0;

    // timestamp of previous packet kept here to calculate delay
    private prevstamp: number | null = null;

    constructor(private data: Uint8Array) {
    }

    // read a number with the size of "size" bytes
    readNumber(size: number) {
        const wb: number[] = [];
        for (let i = 0; i < size; i++) {
            wb.push(this.data[this.pos]);
            this.pos += 1;
        }

        let retval: number;
        for (let i = size - 1; i >= 0; i--) {
            if (i !== size) {
                retval = (retval << 8) | wb[i];
            } else {
                retval = wb[i];
            }
        }

        return retval;
    }

    read() {
        // see core/ttylog.py in kippo
        const op = this.readNumber(4);
        const tty = this.readNumber(4);
        const length = this.readNumber(4);
        const dir = this.readNumber(4);
        const sec = this.readNumber(4);
        const usec = this.readNumber(4);
        const stamp = parseFloat(sec + '.' + usec);
        return {
            op: op,
            tty: tty,
            length: length,
            dir: dir,
            sec: sec,
            usec: usec,
            stamp: stamp,
        };
    }

    readString(length: number) {
        const ascii: number[] = [];
        for (let i = 0; i < length; i++) {
            ascii.push(this.data[this.pos + i]);
        }
        this.pos += length;
        return String.fromCharCode.apply(null, ascii);
    }

    // parse one event from the log data
    // return values:
    //   string:        data to be displayed on terminal
    //   empty string:  packet with no text data
    //   null:          eof was reached, don't call anymore
    async tick(): Promise<string | null> {
        const delayval = <T>(val: any, ms: number): Promise<T> =>
            new Promise(resolve => setTimeout(() => resolve(val), ms));

        if (this.pos >= this.data.length - 1) {
            // null == eof, caller should stop calling
            return Promise.resolve(null);
        }

        // read packet (metadata)
        const packet = this.read();

        // figure out delay between this and previous packet
        let tdiff = this.prevstamp !== null ?
            (packet.stamp - this.prevstamp) * 1000 :
            0;

        // shorten long delays for more enjoyable viewing experience
        if (tdiff > 3000.0) {
            tdiff = 3000.0;
        }

        // store this timestamp for use by the next tick
        this.prevstamp = packet.stamp

        // no text data in this packet
        if (packet.length === 0) {
            // return empty string,
            // caller should know not to bother printing this
            return delayval<string | null>('', tdiff);
        }

        // read text data that follows the previously read packet
        const s = this.readString(packet.length);

        // don't return user input
        if (packet.dir !== LogType.OUTPUT) {
            return delayval<string | null>('', tdiff);
        }

        return delayval<string | null>(s, tdiff);
    }
}

async function startup() {
    // read logfile from query parameter
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const filename = urlParams.get('l')
    if (filename === null) {
        console.error('no logfile specified');
        return;
    }

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

async function binread(filename: string): Promise<any> {
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
