// MANIPULATIONS

    // the global object
    const global = globalThis || window || this;

    // presaved objects
    const $ = {
        Math: Math,
        console: console,
        document: document,
        setTimeout: setTimeout.bind(global),
        requestAnimationFrame: requestAnimationFrame,
        Promise: Promise,
        Date: Date,
        Array: Array,
        AudioContext: AudioContext,
        GainNode: GainNode,
        OscillatorNode: OscillatorNode,
        AudioBuffer: AudioBuffer,
        AudioBufferSourceNode: AudioBufferSourceNode,
        Object: Object,
    };

    // deletes all properties from an object
    const destroy = (obj, except = []) => Object
        .getOwnPropertyNames(obj)
        .forEach(prop => {
            if (!except.includes(prop))
                try { delete obj[prop]; }
                catch (e) {} });

    // forbid using standart library
    destroy(Object.prototype);
    destroy(String.prototype);
    destroy(Number.prototype);
    destroy(Promise.prototype);
    destroy(BigInt.prototype);
    destroy(Array.prototype, [ "includes", "forEach", "indexOf", "pop", "push", "reverse", "slice" ]);
    destroy(global, ["onload", "onkeydown", "onkeyup"]);

    // this can't be destroyed
    delete $.Array.prototype.includes;
    delete $.Array.prototype.forEach;


// PROTOTYPES

    /* array */ {
        $.Array.prototype.index = $.Array.prototype.indexOf;
        delete $.Array.prototype.indexOf;
    }


// CLASSES

    // math
    const math =
    {
        // constants
        pi: $.Math.PI,

        // trigonometric functions
        sin: deg => $.Math.sin(deg * math.pi / 180),
        cos: deg => $.Math.cos(deg * math.pi / 180),
        
        // other functions
        abs: $.Math.abs,
        max: $.Math.max,
        min: $.Math.min,
        sqrt: $.Math.sqrt,

        // rounding
        ceil: $.Math.ceil,
        floor: $.Math.floor,
        round: $.Math.round,

        // game math
        lerp: (a, b, t) => a + (b - a) * t,
        rand: (min, max) => $.Math.floor(min + $.Math.random() * (max - min)),
        wrap: (x, min, max) => (min + ((((x - min) % (max - min)) + (max - min)) % (max - min))),
        dist: (x1, y1, x2, y2) => $.Math.hypot(x2 - x1, y2 - y1),
        angle: (x1, y1, x2, y2) => 180 / math.pi *
            $.Math.atan2(y2 - y1, x2 - x1),
        collide: (x1, y1, w1, h1, x2, y2, w2, h2) =>
            !(x1 + w1 < x2 || x1 > x2 + w2 || y1 + h1 < y2 || y1 > y2 + h2),
    }

    // time related
    const time =
    {
        // vars
        frames: -1,
        delta: 0,

        // getters
        get now() { return $.Date.now() },
        
        // methods
        wait: async ms => await $.Promise(r => $.setTimeout(r, ms)),
        after: (ms, fn) => $.setTimeout(fn, ms),
    }

    // drawing etc
    const canvas =
    {
        // standart properties
        palette: null,
        fps: null,
        width: null,
        height: null,

        // drawing functions
        clear: color => ctx.fillRect(
            0, 0, canvas.width, canvas.height,
            ctx.fillStyle = canvas.palette[color ?? 0]),

        // setting pixel
        pixel: (x, y, color) => ctx.fillRect(
            math.wrap(x, 0, canvas.width), math.wrap(y, 0, canvas.height),
            1, 1, ctx.fillStyle = canvas.palette[color ?? 0]),

        // get pixel color
        rect: (x, y, w, h, color) => ctx.fillRect(
            x, y, w, h, ctx.fillStyle = canvas.palette[color ?? 0]),

        // draw 4x4 sprite
        spr4: (x, y, data) => {
            for (let i = 0; i < data.length; i++)
                if (+data[i] < 4)
                    canvas.pixel(x + i % 4, y + math.floor(i / 4), +data[i]);
        },
        
        // draw 8x8 sprite
        spr8: (x, y, data) => {
            for (let i = 0; i < data.length; i++)
                if (+data[i] < 4)
                    canvas.pixel(x + i % 8, y + math.floor(i / 8), +data[i]);
        },
    }

    // audio
    const audio =
    {
        // audio volume
        volume: 0.1,

        // convert note to frequency
        freq: note => 440 * 2 ** (note / 12),

        // play square wave
        square: (hz, ms) => {

            // get current time
            const time = actx.currentTime;

            // create oscillator
            const osc = new $.OscillatorNode(actx, {
                type: "square",
                frequency: hz });

            // create gain node and set up
            const env = new $.GainNode(actx);
            env.gain.setValueAtTime(audio.volume, time);
            env.gain.linearRampToValueAtTime(0, time + ms / 1000);

            // connect nodes
            osc.connect(env)
               .connect(actx.destination);

            // start oscillator
            osc.start(time);
            osc.stop(time + ms / 1000);
        },

        // playing noise sound
        noise: (rate, ms) => {

            // save from error
            if (rate > 300) return;

            // get current time
            const time = actx.currentTime;

            // buffer size
            const size = actx.sampleRate * ms / 1000;

            // create buffer
            const buffer = new $.AudioBuffer({ length: size,
                sampleRate: actx.sampleRate / (5 - rate / 64) });

            // channel data
            const data = buffer.getChannelData(0);

            // fill buffer
            for (let i = 0; i < size; i++)
                data[i] = $.Math.random() * 2 - 1;

            // create noise node
            const noise = new $.AudioBufferSourceNode(
                actx, { buffer: buffer }); 

            // create gain
            const env = new $.GainNode(actx);
            env.gain.setValueAtTime(audio.volume, time);
            env.gain.linearRampToValueAtTime(0, time + ms / 1000);

            // connect nodes
            noise.connect(env)
                 .connect(actx.destination);

            // start noise
            noise.start(time);
            noise.stop(time + ms / 1000);
        },
    }

    // handling events
    const key =
    {
        left: false,
        right: false,
        up: false,
        down: false,
        a: false,
        b: false,
        c: false,
        d: false,
        any: false
    };

// OTHER

    // from https://lospec.com/palette-list
    const palettes = [
        [ "#051f39", "#4a2480", "#c53a9d", "#ff8e80" ], /* LAVA-GB by Aero */
        [ "#2c2137", "#764462", "#edb4a1", "#a96868" ], /* RUSTIC GB by Kerrie Lake */
        [ "#1b0326", "#7a1c4b", "#ba5044", "#eff9d6" ], /* CRIMSON by WildLeoKnight */
        [ "#0f052d", "#203671", "#36868f", "#5fc75d" ]] /* MOONLIGHT GB by Tofu */


// PSEUDO KEYWORDS

    // match
    const match = (value, cases) =>
        cases[value]
            ? typeof cases[value] == "function"
                ? cases[value]() : cases[value]
            : typeof cases.default == "function"
                ? cases.default() : cases.default;

    // assert
    const assert = (value, message) =>
        (!value) ? $.console.error(message) : 0;

    const inherit = (obj, parent) =>
        $.Object.setPrototypeOf(obj, parent);


// EXPORTS

    // classes
    global.global = global;
    global.math = math;
    global.time = time;
    global.canvas = canvas;
    global.audio = audio;
    global.key = key;

    // keywords
    global.log = $.console.log;
    global.match = match;
    global.inherit = inherit;
    global.assert = assert;


// FRAMEWORKING

    // variables
    const actx = new $.AudioContext();
    let ctx = null;
    let previous = time.now;

    // when contents loaded
    global.onload = () =>
    {
        // check if game is defined
        if (!global.game)
            throw "<game> is not defined";

        // delete this function
        delete global.onload;
        
        // initialize canvas and context
        const element = $.document.createElement("canvas");
        ctx = element.getContext("2d");

        // apply style to canvas
        element.style.scale = game.scale ?? 6;
        element.style.inset = "0";
        element.style.margin = "auto";
        element.style.position = "absolute";
        element.style.imageRendering = "pixelated";

        // set some properties
        canvas.palette = palettes[game.palette ?? 0];
        canvas.fps = game.fps ?? 30;
        
        // set canvas size
        [element.width, element.height] =
            [canvas.width, canvas.height] =
                [[160, 144], [128, 128], [96, 80], [84, 48],
                [64, 64], [32, 28], [16, 16]]
                    [game.mode ?? 2];
                    
        // add to body
        $.document.body.appendChild(element);

        // call init function
        if (game.init)
            game.init();

        // start loop
        animate();
    }

    // global loop
    const animate = () =>
    {
        // calculate time
        time.delta = time.now - previous;
        previous = time.now;
        time.frames++;

        // call loop function
        if (game.loop)
            game.loop();

        // loop
        $.setTimeout($.requestAnimationFrame, 1000 / canvas.fps, animate);
    }

    // handling events
    onkeydown = onkeyup = e => key[match(e.code, {
        "ArrowLeft": "left",
        "ArrowRight": "right",
        "ArrowUp": "up",
        "ArrowDown": "down",
        "KeyZ": "a",
        "KeyX": "b",
        "KeyA": "c",
        "KeyS": "d"
    })] = key.any = e.type == "keydown";

    // deletes all events
    delete global.onkeydown;
    delete global.onkeyup;
    delete global.onload;