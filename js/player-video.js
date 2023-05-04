const videoThumbnails = document.querySelectorAll(".thumbnail");
const videoPlayer = document.querySelector("iframe");
const videoTitle = document.querySelector(".video-title");

videoThumbnails.forEach(v =>
{
    v.addEventListener("click", ()=>
    {
        videoPlayer.setAttribute("src", `https://www.youtube.com/embed/${v.dataset.id}?rel=0&autoplay=1`);
        videoTitle.innerHTML = v.dataset.title;
    });
});