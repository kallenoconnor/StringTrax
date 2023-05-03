const videoThumbnails = document.querySelectorAll(".thumbnail");
const videoPlayer = document.querySelector("iframe");
const videoTitle = document.querySelector(".video-title");

const showVideo = (videoId, title) => {
    let videoUrl = `https://www.youtube.com/embed/${videoId}?rel=0`;
    videoPlayer.setAttribute("src", videoUrl);
    videoTitle.innerHTML = title;
};
videoThumbnails.forEach(v => {
    v.addEventListener("click", () => {
        showVideo(v.dataset.id, v.dataset.title);
    });
});