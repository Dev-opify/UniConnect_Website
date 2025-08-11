// Header scroll effect
window.addEventListener('scroll', () => {
    const header = document.getElementById('header');
    if (window.scrollY > 100) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// Intersection Observer for feature cards animation
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate');
        }
    });
}, observerOptions);

document.querySelectorAll('.feature-card').forEach(card => {
    observer.observe(card);
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Counter animation for stats
const animateCounter = (element, target) => {
    let current = 0;
    const increment = target / 100;
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        
        if (element.textContent.includes('K')) {
            element.textContent = Math.floor(current / 1000) + 'K+';
        } else if (element.textContent.includes('%')) {
            element.textContent = Math.floor(current) + '%';
        } else if (element.textContent.includes('★')) {
            element.textContent = (current / 10).toFixed(1) + '★';
        } else {
            element.textContent = Math.floor(current);
        }
    }, 20);
};

// Trigger counter animation when stats section is visible
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const counters = entry.target.querySelectorAll('.count');
            counters.forEach(counter => {
                let target = parseFloat(counter.textContent); // Get number only
                counter.textContent = '0'; // Start animation from 0
                animateCounter(counter, target);
            });
            statsObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

// function animateCounter(element, target) {
//     let count = 0;
//     let increment = target / 100; // Speed control

//     let timer = setInterval(() => {
//         count += increment;

//         if (count >= target) {
//             element.textContent = target % 1 === 0 ? target : target.toFixed(1);
//             clearInterval(timer);
//         } else {
//             element.textContent = target % 1 === 0
//                 ? Math.round(count)
//                 : count.toFixed(1);
//         }
//     }, 20);
// }


const statsSection = document.querySelector('.stats');
if (statsSection) {
    statsObserver.observe(statsSection);
}