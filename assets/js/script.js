document.addEventListener("DOMContentLoaded", () => {
    let currentStep = 1;
    const totalSteps = 4;
    let paymentValidated = false;

    // Elements
    const nextBtn = document.getElementById("nextBtn");
    const prevBtn = document.getElementById("prevBtn");
    const form = document.getElementById("reservationForm");
    const calendarGrid = document.getElementById("calendarGrid");
    const currentMonthYear = document.getElementById("currentMonthYear");

    /* --- 1. CALENDAR LOGIC (Restored & Safe) --- */
    let month = 11; // Décembre
    let year = 2025;
    const monthNames = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];

    function renderCalendar(m, y) {
        if(!calendarGrid) return;
        calendarGrid.innerHTML = "";
        currentMonthYear.textContent = `${monthNames[m]} ${y}`;

        const firstDay = new Date(y, m, 1).getDay();
        const daysInMonth = new Date(y, m + 1, 0).getDate();

        // Fill empty slots
        for (let i = 0; i < (firstDay === 0 ? 6 : firstDay - 1); i++) {
            calendarGrid.appendChild(document.createElement("div"));
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const btn = document.createElement("button");
            btn.type = "button";
            btn.textContent = day;
            btn.classList.add("calendar-day");
            btn.onclick = () => {
                document.querySelectorAll(".calendar-day").forEach(d => d.classList.remove("selected"));
                btn.classList.add("selected");
            };
            calendarGrid.appendChild(btn);
        }
    }
    renderCalendar(month, year);

    /* --- 2. NAVIGATION LOGIC (The most important part) --- */
    function updateStep() {
        // 1. Handle Step Visibility
        document.querySelectorAll(".form-step").forEach(step => {
            step.classList.remove("active");
            step.style.display = "none"; // Hard reset to ensure no overlaps
        });

        const activeStep = document.querySelector(`.form-step[data-step="${currentStep}"]`);
        if (activeStep) {
            activeStep.classList.add("active");
            activeStep.style.display = "block"; // Force display
        }

        // 2. Update Progress Bar
        document.querySelectorAll(".progress-step").forEach((ps, i) => {
            if (i < currentStep) {
                ps.classList.add("active");
            } else {
                ps.classList.remove("active");
            }
        });

        // 3. Button States
        prevBtn.disabled = (currentStep === 1);

        if (currentStep === totalSteps) {
            nextBtn.innerHTML = 'Confirmer <span class="arrow">✓</span>';
        } else {
            nextBtn.innerHTML = 'Suivant <span class="arrow">→</span>';
        }

        // 4. Update Summary if on last step
        if (currentStep === 4) updateSummary();

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    nextBtn.addEventListener("click", () => {
        // Validation Check
        if (!validateCurrentStep()) {
            alert("Veuillez remplir les informations obligatoires avant de continuer.");
            return;
        }

        if (currentStep < totalSteps) {
            currentStep++;
            updateStep();
        } else {
            // Final Confirm Button Logic
            if (!paymentValidated) {
                alert("Veuillez cliquer sur 'Valider le paiement' avant de confirmer.");
                return;
            }
            form.innerHTML = `
                <div style="text-align:center; padding: 50px; color: white;">
                    <h2>Merci pour votre réservation !</h2>
                    <p>Un mail récapitulatif vous a été envoyé.</p>
                </div>`;
        }
    });

    prevBtn.addEventListener("click", () => {
        if (currentStep > 1) {
            currentStep--;
            updateStep();
        }
    });

    /* --- 3. VALIDATION (Smart & Not Blocking) --- */
    function validateCurrentStep() {
        const step = document.querySelector(`.form-step[data-step="${currentStep}"]`);
        const inputs = step.querySelectorAll("input[required], select[required]");
        let isValid = true;

        inputs.forEach(input => {
            if (!input.value.trim()) {
                input.style.border = "2px solid #8F1643"; // Highlight error
                isValid = false;
            } else {
                input.style.border = "none";
            }
        });

        // Step 2 specific check (Calendar)
        if (currentStep === 2) {
            if (!document.querySelector(".calendar-day.selected")) {
                isValid = false;
            }
        }
        return isValid;
    }

    /* --- 4. SUMMARY & PAYMENT --- */
    function updateSummary() {
        const getVal = (id) => document.getElementById(id)?.value || "-";

        document.getElementById("summaryName").textContent = `${getVal("nom")} ${getVal("prenom")}`;
        document.getElementById("summaryPhone").textContent = getVal("telephone");
        document.getElementById("summaryEmail").textContent = getVal("email");

        const day = document.querySelector(".calendar-day.selected")?.textContent || "?";
        document.getElementById("summaryBooking").textContent = `RDV le ${day} Décembre à ${getVal("horaire")}`;

        document.getElementById("summaryAddress").textContent = `${getVal("adresse")}, ${getVal("codePostal")} ${getVal("ville")}`;
    }

    const payBtn = document.querySelector(".validate-btn");
    if (payBtn) {
        payBtn.addEventListener("click", function() {
            paymentValidated = true;
            this.textContent = "Paiement validé ✓";
            this.style.background = "#4CAF50";
            this.disabled = true;
        });
    }

    // Initialize the first step view
    updateStep();
});
