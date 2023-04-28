// @ts-check
/** Implementation of the presentation of the audio player */
import lottieWeb from 'https://cdn.skypack.dev/lottie-web';

/** @typedef {()=>void} AnimationAction */
/** @typedef {{ShowInit:AnimationAction, ShowPlay:AnimationAction, ShowStop:AnimationAction}} AnimationControls */
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
        ShowInit: ()=> Animation.goToAndStop(14, true),
        ShowPlay: ()=> Animation.playSegments([14, 27], true),
        ShowStop: ()=> Animation.playSegments([0, 14], true)
    };
}

/** @typedef {{Loop:()=>void, Stop:()=>void }} CyclerControls */
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
    const Loop =()=>
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

    return { Loop, Stop }; 
};

const calculateTime = (secs) => {
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes}:${seconds<10?"0":""}${seconds}`;
};


function initPlayer(rootElement) {

    const playIconContainer = rootElement.querySelector('.play-icon');
    const audioPlayerContainer = rootElement;
    const seekSlider = rootElement.querySelector('.seek-slider');
    /** @type {HTMLAudioElement} */
    const audio = rootElement.querySelector('audio');
    const durationContainer = rootElement.querySelector('.duration');
    const currentTimeContainer = rootElement.querySelector('.current-time');

    const anim = Animation(playIconContainer);

    const cycle = Cycle(()=>
    {
        seekSlider.value = Math.floor(audio.currentTime);
        currentTimeContainer.textContent = calculateTime(seekSlider.value);
        audioPlayerContainer.style.setProperty('--seek-before-width', `${seekSlider.value / seekSlider.max * 100}%`);
    });

    const updateFileSize =()=>
    {
        if(audio.buffered.length)
        {
            const bufferedAmount = Math.floor(audio.buffered.end(audio.buffered.length - 1));
            audioPlayerContainer.style.setProperty('--buffered-width', `${(bufferedAmount / seekSlider.max) * 100}%`);
        }
        durationContainer.textContent = calculateTime(audio.duration);
        seekSlider.max = Math.floor(audio.duration);
    };

    let Playing = false;
    const Play =()=>
    {
        audio.play();
        anim.ShowPlay();
        cycle.Loop();
        Playing = true;
    };
    const Stop =()=>
    {
        audio.pause();
        anim.ShowStop();
        cycle.Stop();
        Playing = false;
    };
    const Toggle =()=>
    {
        Playing ? Stop() : Play();
    };

    anim.ShowInit();
    playIconContainer.addEventListener('click', Toggle);
    updateFileSize();
    audio.addEventListener('loadedmetadata', updateFileSize);
    audio.addEventListener('progress', updateFileSize);
    
    // while the slide moves
    seekSlider.addEventListener('input', (e) => {
        audioPlayerContainer.style.setProperty('--seek-before-width', e.target.value / e.target.max * 100 + '%');
        currentTimeContainer.textContent = calculateTime(seekSlider.value);
        Playing && Stop();
    });

    // when slider interaction has stopped
    seekSlider.addEventListener('change', () => {
        audio.currentTime = seekSlider.value;
        Play();
    });

}


initPlayer(document.querySelector('.audio-player-container'));