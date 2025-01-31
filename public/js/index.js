const buttonHover = (() => {
    const buttons = Array.from(document.querySelectorAll(".button"));
    
    buttons.forEach(button => {
        button.addEventListener("mouseenter", () => {
            button.children[0].src = "./img/main-menu-selected.png"
        });

        button.addEventListener("mouseleave", () => {
            button.children[0].src = "./img/main-menu-not-selected.png"
        })
    });
})();