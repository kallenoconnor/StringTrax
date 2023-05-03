let observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(e => {
        console.log(e.isIntersecting, e.target);
        if (e.isIntersecting) {
            requestAnimationFrame( () => {
                e.target.setAttribute("data-anim", "on");
            })
        }

    });
}
    , {
        root: null,
        rootMargin: '0px',
        threshold: 0.1,
    });
document.querySelectorAll("[data-anim]").forEach(t => observer.observe(t));

