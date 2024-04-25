// @ts-check


/**
 * @typedef {import("./player-manager.js").PlayerManager} PlayerManager
 */

/** Implementation of the presentation of the audio player */
import lottieWeb from 'https://cdn.skypack.dev/lottie-web';

/** @typedef {()=>void} AnimationAction */

/** @type {(inElement:HTMLElement)=>{Init:AnimationAction, Play:AnimationAction, Stop:AnimationAction}} */
function Animation(inElement)
{
    const Animation = lottieWeb.loadAnimation({
        container: inElement,
        renderer: 'svg',
        autoplay: false,
        loop: false,
        name: "Play Animation",
        path: 'https://maxst.icons8.com/vue-static/landings/animated-icons/icons/pause/pause.json'
    });
    
    return {
        Init: ()=> Animation.goToAndStop(14, true),
        Play: ()=> Animation.playSegments([14, 27], true),
        Stop: ()=> Animation.playSegments([0, 14], true)
    };
}

const Util =
{
    /** @type {(inSeconds:number|string)=>string} */
    FormatTime(inSeconds)
    {
        inSeconds = typeof inSeconds == "number" ? inSeconds : parseFloat(inSeconds);
        const minutes = Math.floor(inSeconds / 60);
        const seconds = Math.floor(inSeconds % 60);
        return `${minutes}:${seconds<10?"0":""}${seconds}`;
    },
    /** @type {(inPart:number|string, inWhole:number|string)=>string} */
    FormatPercent(inPart, inWhole)
    {
        inPart  = typeof inPart  == "number" ? inPart  : parseFloat(inPart);
        inWhole = typeof inWhole == "number" ? inWhole : parseFloat(inWhole);
        return `${(inPart/inWhole) * 100}%`;
    },
    /** @type {(inHandler:()=>void)=>{Play:AnimationAction, Stop:AnimationAction }} Repeatedly call a function. Returns controls to "play" and "stop" to polling */
    Cycle(inHandler) {
        /** @type {false|number} */
        let Live = false;
        const _run= ()=>
        {
            inHandler();
            Live = requestAnimationFrame(_run);
        };
        const Play =()=>
        {
            if(Live){ return; }
            Live = requestAnimationFrame(_run);
        };
        const Stop =()=>
        {
            if(Live === false){ return; }
            cancelAnimationFrame(Live);
            Live = false;
        };

        return { Play, Stop }; 
    }
    
}

/** @typedef {(rootElement:HTMLElement, playerManager:PlayerManager)=>void} AudioPlayer */

/** @type {AudioPlayer} */
export default function CreateAudioPlayer(rootElement, playerManager) {

    /** @type {null|HTMLAudioElement} */ const domSong = rootElement.querySelector('audio');
    /** @type {null|HTMLInputElement} */ const domSeek = rootElement.querySelector('.seek-slider');
    /** @type {null|HTMLElement}      */ const domPlay = rootElement.querySelector('.play-icon');
    /** @type {null|HTMLElement}      */ const domTime = rootElement.querySelector('.current-time');
    /** @type {null|HTMLElement}      */ const domSize = rootElement.querySelector('.duration');
    
    if(!domSong || !domPlay || !domSeek || !domTime || !domSize ){ console.warn("missing audio player elements"); return; }

    const pollProgressBar = Util.Cycle(()=>
    {
        const time = Math.floor(domSong.currentTime);
        domSeek.value = time.toString();
        domTime.textContent = Util.FormatTime(time);
        rootElement.style.setProperty('--seek-before-width', Util.FormatPercent(time, domSeek.max));
    });

    const updateFileSize =()=>
    {
        if(domSong.buffered.length)
        {
            const bufferedAmount = Math.floor(domSong.buffered.end(domSong.buffered.length - 1));
            rootElement.style.setProperty('--buffered-width', Util.FormatPercent(bufferedAmount, domSeek.max));
        }
        domSize.textContent = Util.FormatTime(domSong.duration);
        domSeek.max = Math.floor(domSong.duration).toString();
    };

    // state stuff
    let Playing = false;
    const Stop =()=>
    {
        domSong.pause();
        Playing && anim.Stop();
        pollProgressBar.Stop();
        Playing = false;
    };
    const Play =()=>
    {
        playerManager.StopAll(Stop);
        domSong.play();
        anim.Play();
        pollProgressBar.Play();
        Playing = true;
    };

    // while the slide moves
    domSeek.addEventListener('input', (e) =>
    {
        const target = /** @type {HTMLInputElement} */(e.target);
        rootElement.style.setProperty('--seek-before-width', Util.FormatPercent(target.value, target.max));
        domTime.textContent = Util.FormatTime(domSeek.value);
        Playing && Stop();
    });

    // when slider interaction has stopped
    domSeek.addEventListener('change', () =>
    {
        domSong.currentTime = parseInt(domSeek.value);
        !Playing && Play();
    });

    // when the play/pause button is pressed
    domPlay.addEventListener('click', ()=> Playing ? Stop() : Play());

    // periodically update loaded/duration numbers
    domSong.addEventListener('loadedmetadata', updateFileSize);
    domSong.addEventListener('progress', updateFileSize);
    updateFileSize();
    
    // setup the play button animation
    const anim = Animation(domPlay);
    anim.Init();

    playerManager.Register(Stop);
}