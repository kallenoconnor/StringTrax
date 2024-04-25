//@ts-check
/**
 * @typedef {import("./player-manager.js").PlayerManager} PlayerManager
 */

/**
 * Controls the playback of a YT video. If an id is passed, will play the video with that id. With no arguments, will pause the video.
 * @typedef {(inYTID?:string)=>void} Controls */

/**
 * @callback VideoPlayer
 * @param {string} inDOMID The DOM id of the element to become the player
 * @param {string} inYTID The id of the YouTube video to start with
 * @param {string} inAttr Elements with this attribute are assumed to have YouTube video id for the attribute value; clicking on them will play the video with this id.
 * @param {(element:HTMLElement, on:boolean)=>void} inChangeHandler When the video changes, this handler will be called for each thumbnail element; with the 2nd argument being if the element is now active.
 * @param {PlayerManager} inPlayerManager
 * @returns {Controls}
 */

/** @type {VideoPlayer} */
export default function CreateVideoPlayer(inDOMID, inYTID, inAttr, inChangeHandler, inPlayerManager)
{
    /** @type {playVideo:()=>void, loadVideoById:(id:string)=>void, playerInfo:{playerState:number, videoData:{video_id:string}}} */
    let _player;

    const redrawThumbnails =(inID)=> document.querySelectorAll(`[${inAttr}]`).forEach((/** @type {HTMLElement}*/e)=>inChangeHandler(e, e.getAttribute(inAttr)==inID));

    /** @type {Controls} */
    const toggle =(inYTID)=>
    {
        if(!inYTID)
        {
            _player.pauseVideo();
        }
        else if(inYTID != _player.playerInfo.videoData.video_id)
        {
            inPlayerManager.StopAll();
            _player.loadVideoById(inYTID); redrawThumbnails(inYTID);
        }
        else if(_player.playerInfo.playerState == 2 || _player.playerInfo.playerState == 5)
        {
            inPlayerManager.StopAll();
            _player.playVideo();
        }
    }

    const handleStateChange =(inEvent)=>
    {
        if(inEvent.data === 1)
        {
            inPlayerManager.StopAll(toggle);
        } 
    }

    inPlayerManager.Register(toggle);
    globalThis.onYouTubeIframeAPIReady =()=>
    {
        _player = new YT.Player( inDOMID, {videoId: inYTID, playerVars: { modestbranding: true, rel: 0 }, events:{onStateChange:handleStateChange}});
        globalThis.Player = _player;
    }
    globalThis?.YT?.loaded && globalThis.onYouTubeIframeAPIReady();

    redrawThumbnails(inYTID);
    document.body.addEventListener("click", (event)=>{
        const path = event.composedPath();
        for(let i=0; i<path.length; i++)
        {
            const step = path[i];
            const video = step.getAttribute?.(inAttr);
            if(video)
            {
                toggle(video);
                return;
            }
        }
    });
    return toggle;
};