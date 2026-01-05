document.addEventListener('DOMContentLoaded', function() {
    // Floating animation for map
    const mapLink = document.getElementById('interactiveMapLink');

    if (mapLink) {
        let floatY = 0;
        let floatDirection = 1;

        setInterval(() => {
            if (!mapLink.matches(':hover')) {
                floatY += 0.3 * floatDirection;

                if (floatY >= 5) floatDirection = -1;
                if (floatY <= 0) floatDirection = 1;

                mapLink.style.transform = `translateY(${floatY}px)`;
            }
        }, 50);
    }
    // Step animation on scroll
    const steps = document.querySelectorAll('.rdv-step');

    const observerOptions = {
        threshold: 0.2,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'slideInRight 0.6s ease forwards';
            }
        });
    }, observerOptions);

    steps.forEach(step => {
        observer.observe(step);
    });

    // Add click sound effect (optional)
    steps.forEach(step => {
        step.addEventListener('click', () => {
            step.style.transform = 'translateX(8px) scale(0.98)';
            setTimeout(() => {
                step.style.transform = '';
            }, 200);
        });
    });
});
