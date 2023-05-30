//rough check for desktop devices
document.body.setAttribute("data-desktop", (window?.ontouchstart || navigator.maxTouchPoints) ? "false" : "true");

//intersection observer for animatin text at certain page points
const observerCheckHit = (/**@type {IntersectionObserverEntry}*/element )=>
{
    if (element.isIntersecting)
    {
        requestAnimationFrame( ()=>element.target.setAttribute("data-anim", "on") );
    }
};

const observer = new IntersectionObserver( (e)=>e.forEach(observerCheckHit), { root: null, rootMargin: '0px', threshold: 0.1 } );
document.querySelectorAll("[data-anim]").forEach(anim=>observer.observe(anim));

//Form manipulation (prevent default redirect)
const form = document.getElementById("contactForm");
form?.addEventListener("submit", e=>
{
    e.preventDefault();

    //Get form data
    var data= new FormData(form);
    //Init fetch post
    fetch(form.getAttribute("action"), {
        method: "POST",
        body: data
    })
    //Server Response
    .then(()=>document.body.setAttribute("class", "done"))
});
