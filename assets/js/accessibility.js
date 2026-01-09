document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;

    const actions = [
        { id: 'toggle-dark-mode', class: 'dark-mode' },
        { id: 'toggle-dyslexia', class: 'dyslexia-mode' },
        { id: 'increase-text', class: 'text-large' }
    ];

    actions.forEach(action => {
        const btn = document.getElementById(action.id);
        if (btn) {
            btn.addEventListener('click', () => {
                body.classList.toggle(action.class);
                console.log("Action sur : " + action.id);
            });
        } else {
            console.error("Bouton introuvable : " + action.id);
        }
    });

    const reset = document.getElementById('reset-a11y');
    if (reset) {
        reset.addEventListener('click', () => {
            body.classList.remove('dark-mode', 'dyslexia-mode', 'text-large');
            console.log("Reset cliqué");
        });
    }
});
