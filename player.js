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

/** @type {(inSeconds:number)=>string} */
const calculateTime = (inSeconds) => {
    const minutes = Math.floor(inSeconds / 60);
    const seconds = Math.floor(inSeconds % 60);
    return `${minutes}:${seconds<10?"0":""}${seconds}`;
};

/** @type {(rootElement:HTMLElement)=>void} */
function initPlayer(rootElement) {

    /** @type {HTMLAudioElement|null} */ const domAudio = rootElement.querySelector('audio');
    /** @type {HTMLElement|null}      */ const domPlay = rootElement.querySelector('.play-icon');
    /** @type {HTMLInputElement|null}      */ const domSeek = rootElement.querySelector('.seek-slider');
    /** @type {HTMLElement|null}      */ const domTime = rootElement.querySelector('.current-time');
    /** @type {HTMLElement|null}      */ const domLeng = rootElement.querySelector('.duration');
    
    if(!domAudio || !domPlay || !domSeek || !domTime || !domLeng )
    {
        return;
    }

    const anim = Animation(domPlay);

    const cycle = Cycle(()=>
    {
        const time = Math.floor(domAudio.currentTime);
        domSeek.value = time.toString();
        domTime.textContent = calculateTime(time);
        rootElement.style.setProperty('--seek-before-width', `${time / parseInt(domSeek.max) * 100}%`);
    });

    const updateFileSize =()=>
    {
        if(domAudio.buffered.length)
        {
            const bufferedAmount = Math.floor(domAudio.buffered.end(domAudio.buffered.length - 1));
            rootElement.style.setProperty('--buffered-width', `${(bufferedAmount / parseInt(domSeek.max)) * 100}%`);
        }
        domLeng.textContent = calculateTime(domAudio.duration);
        domSeek.max = Math.floor(domAudio.duration).toString();
    };

    let Playing = false;
    const Play =()=>
    {
        domAudio.play();
        anim.Play();
        cycle.Play();
        Playing = true;
    };
    const Stop =()=>
    {
        domAudio.pause();
        anim.Stop();
        cycle.Stop();
        Playing = false;
    };
    const Toggle =()=>
    {
        Playing ? Stop() : Play();
    };

    anim.Init();
    domPlay.addEventListener('click', Toggle);
    updateFileSize();
    domAudio.addEventListener('loadedmetadata', updateFileSize);
    domAudio.addEventListener('progress', updateFileSize);
    
    // while the slide moves
    domSeek.addEventListener('input', (e) =>
    {
        const target = /** @type {HTMLInputElement} */(e.target);
        rootElement.style.setProperty('--seek-before-width', parseInt(target.value) / parseInt(target.max) * 100 + '%');
        domTime.textContent = calculateTime(parseInt(domSeek.value));
        Playing && Stop();
    });

    // when slider interaction has stopped
    domSeek.addEventListener('change', () => {
        domAudio.currentTime = parseInt(domSeek.value);
        Play();
    });

}

document.querySelectorAll('.audio-player-container').forEach((player)=>
{
    initPlayer( /** @type {HTMLElement}*/(player) );
})