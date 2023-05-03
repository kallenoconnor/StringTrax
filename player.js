// @ts-check
/** Implementation of the presentation of the audio player */
import lottieWeb from 'https://cdn.skypack.dev/lottie-web';

/** @typedef {()=>void} AnimationAction */
/** @typedef {{Init:AnimationAction, Play:AnimationAction, Stop:AnimationAction}} AnimationControls */
/** @typedef {(inElement:HTMLElement)=>AnimationControls} AnimationConstructor */

/** @type {AnimationConstructor} */
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

/** @typedef {{Play:()=>void, Stop:()=>void }} CyclerControls */
/** @typedef {(inHandler:()=>void)=>CyclerControls} CycleConstructor */
/** @type {CycleConstructor} */
function Cycle(inHandler) {

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
};

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
    }   
}

/** @type {(rootElement:HTMLElement)=>void} */
function initPlayer(rootElement) {

    /** @type {null|HTMLAudioElement} */ const domSong = rootElement.querySelector('audio');
    /** @type {null|HTMLInputElement} */ const domSeek = rootElement.querySelector('.seek-slider');
    /** @type {null|HTMLElement}      */ const domPlay = rootElement.querySelector('.play-icon');
    /** @type {null|HTMLElement}      */ const domTime = rootElement.querySelector('.current-time');
    /** @type {null|HTMLElement}      */ const domSize = rootElement.querySelector('.duration');
    
    if(!domSong || !domPlay || !domSeek || !domTime || !domSize ){ return; }

    const loop = Cycle(()=>
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
    const Play =()=>
    {
        domSong.play();
        anim.Play();
        loop.Play();
        Playing = true;
    };
    const Stop =()=>
    {
        domSong.pause();
        anim.Stop();
        loop.Stop();
        Playing = false;
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
}

document.querySelectorAll('.audio-player-container').forEach((player)=>
{
    initPlayer( /** @type {HTMLElement}*/(player) );
})