const observerCheckHit = (/**@type {IntersectionObserverEntry}*/element )=>
{
    if (element.isIntersecting)
    {
        requestAnimationFrame( ()=>element.target.setAttribute("data-anim", "on") );
    }
};

const observer = new IntersectionObserver( (e)=>e.forEach(observerCheckHit), { root: null, rootMargin: '0px', threshold: 0.1 } );
document.querySelectorAll("[data-anim]").forEach(anim=>observer.observe(anim));