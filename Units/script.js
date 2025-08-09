function navigateToUnit(unitNumber) {
    // Add click animation
    event.currentTarget.style.transform = 'scale(0.95)';
    setTimeout(() => {
        event.currentTarget.style.transform = 'translateY(-5px)';
    }, 100);

    // Simulate navigation
    setTimeout(() => {
        alert(`Navigating to Unit ${unitNumber}...`);
        // Example redirect:
        // window.location.href = `/unit/${unitNumber}`;
    }, 150);
}

// Add keyboard navigation
document.addEventListener('keydown', function(e) {
    if (e.key >= '1' && e.key <= '6') {
        const unitNumber = parseInt(e.key);
        const unitCard = document.querySelector(`.unit-card:nth-child(${unitNumber})`);
        if (unitCard) {
            unitCard.click();
        }
    }
});

// Add focus states for accessibility
document.querySelectorAll('.unit-card').forEach((card, index) => {
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', `Navigate to Unit ${index + 1}`);

    card.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            card.click();
        }
    });
});
