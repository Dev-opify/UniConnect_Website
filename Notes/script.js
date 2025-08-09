// Example: Add click events for each card to navigate
document.querySelectorAll(".card").forEach((card, index) => {
    card.addEventListener("click", () => {
        switch (index) {
            case 0: window.location.href = "notes.html"; break;
            case 1: window.location.href = "tutorials.html"; break;
            case 2: window.location.href = "resources.html"; break;
            case 3: window.location.href = "study.html"; break;
            case 4: window.location.href = "references.html"; break;
            case 5: window.location.href = "pyq.html"; break;
        }
    });
});
