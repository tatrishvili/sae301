document.addEventListener("DOMContentLoaded", () => {
    console.log("Formulaire script started");

    let currentStep = 1;
    const totalSteps = 4;
    let paymentValidated = false;

    const form = document.getElementById("reservationForm");
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");
    const calendarGrid = document.getElementById("calendarGrid");
    const currentMonthYear = document.getElementById("currentMonthYear");
    const dateReservationInput = document.getElementById("dateReservation");
    const payBtn = document.querySelector(".validate-btn");
    const paymentMessage = document.getElementById("paymentMessage");

    if (!form || !prevBtn || !nextBtn) {
        console.error("Critical elements not found!");
        return;
    }

    const servicePrices = {
        "manucure": 45,
        "pedicure": 40,
        "soin-visage": 60,
        "maquillage": 50,
        "soin-corps": 70,
        "epilation": 20
    };

    // ERROR MESSAGE DISPLAY FUNCTION
    function showError(message, element = null) {
        const existingErrors = document.querySelectorAll(".error-message");
        existingErrors.forEach(err => err.remove());

        const errorDiv = document.createElement("div");
        errorDiv.className = "error-message";
        errorDiv.textContent = message;
        errorDiv.style.cssText = `
            background: #ffebee;
            color: #c62828;
            padding: 15px 20px;
            border-radius: 10px;
            margin: 20px 0;
            font-size: 1.1em;
            font-weight: 600;
            border-left: 4px solid #c62828;
            animation: slideIn 0.3s ease;
        `;

        const currentStepElement = document.querySelector(`.form-step[data-step="${currentStep}"]`);
        if (currentStepElement) {
            currentStepElement.insertBefore(errorDiv, currentStepElement.firstChild);
        }

        if (element) {
            element.focus();
            element.style.border = "2px solid #c62828";
            setTimeout(() => {
                element.style.border = "";
            }, 3000);
        }

        errorDiv.scrollIntoView({ behavior: "smooth", block: "center" });

        setTimeout(() => {
            errorDiv.style.opacity = "0";
            errorDiv.style.transition = "opacity 0.3s";
            setTimeout(() => errorDiv.remove(), 300);
        }, 5000);
    }

    // Add animation to page
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateY(-10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    `;
    document.head.appendChild(style);

    // CALENDAR
    let month = 11;
    let year = 2025;
    const minDate = { month: 11, year: 2025 };
    const maxDate = { month: 10, year: 2026 };
    const monthNames = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];

    function renderCalendar(month, year) {
        if (!calendarGrid) return;

        calendarGrid.innerHTML = "";
        currentMonthYear.textContent = `${monthNames[month]} ${year}`;

        const weekDays = ["Dim","Lun","Mar","Mer","Jeu","Ven","Sam"];
        weekDays.forEach(d => {
            const dayHeader = document.createElement("div");
            dayHeader.textContent = d;
            dayHeader.classList.add("calendar-weekday");
            calendarGrid.appendChild(dayHeader);
        });

        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        for (let i = 0; i < firstDay; i++){
            const emptyDiv = document.createElement("div");
            emptyDiv.classList.add("calendar-empty");
            calendarGrid.appendChild(emptyDiv);
        }

        for (let day = 1; day <= daysInMonth; day++){
            const date = new Date(year, month, day);
            const dayOfWeek = date.getDay();
            const btn = document.createElement("button");
            btn.type = "button";
            btn.textContent = day;
            btn.classList.add("calendar-day");

            if(dayOfWeek === 0 || dayOfWeek === 6){
                btn.disabled = true;
                btn.classList.add("calendar-disabled");
            } else {
                btn.addEventListener("click", () => {
                    document.querySelectorAll(".calendar-day").forEach(d => d.classList.remove("selected"));
                    btn.classList.add("selected");
                    dateReservationInput.value = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                });
            }
            calendarGrid.appendChild(btn);
        }
    }

    if (calendarGrid) {
        renderCalendar(month, year);

        const prevMonthBtn = document.getElementById("prevMonth");
        const nextMonthBtn = document.getElementById("nextMonth");

        if (prevMonthBtn) {
            prevMonthBtn.addEventListener("click", () => {
                let newMonth = month - 1;
                let newYear = year;
                if(newMonth < 0){ newMonth = 11; newYear--; }
                if(newYear < minDate.year || (newYear === minDate.year && newMonth < minDate.month)) return;
                month = newMonth; year = newYear;
                renderCalendar(month, year);
            });
        }

        if (nextMonthBtn) {
            nextMonthBtn.addEventListener("click", () => {
                let newMonth = month + 1;
                let newYear = year;
                if(newMonth > 11){ newMonth = 0; newYear++; }
                if(newYear > maxDate.year || (newYear === maxDate.year && newMonth > maxDate.month)) return;
                month = newMonth; year = newYear;
                renderCalendar(month, year);
            });
        }
    }

    // SERVICES ADD/REMOVE
    document.addEventListener("click", e => {
        if(e.target.classList.contains("add-btn")){
            e.preventDefault();
            const container = document.getElementById("servicesContainer");
            const original = e.target.closest(".service-item");
            const clone = original.cloneNode(true);
            clone.querySelector(".prestation").value = "";
            clone.querySelector(".precision").value = "";
            container.appendChild(clone);
        }

        if(e.target.classList.contains("remove-btn")){
            e.preventDefault();
            const container = document.getElementById("servicesContainer");
            const item = e.target.closest(".service-item");
            if(container.children.length > 1) container.removeChild(item);
        }
    });

    // NAVIGATION
    prevBtn.addEventListener("click", (e) => {
        e.preventDefault();
        if(currentStep > 1){ currentStep--; updateStep(); }
    });

    nextBtn.addEventListener("click", (e) => {
        e.preventDefault();

        if(!validateCurrentStep()) return;

        if(currentStep === totalSteps){
            if(!paymentValidated){
                showError("Veuillez valider le paiement avant de confirmer la réservation.");
                return;
            }
            form.submit();
            return;
        }

        currentStep++;
        updateStep();
    });

    function updateStep(){
        document.querySelectorAll(".form-step").forEach(step => step.classList.remove("active"));

        const currentStepElement = document.querySelector(`.form-step[data-step="${currentStep}"]`);
        if (currentStepElement) currentStepElement.classList.add("active");

        document.querySelectorAll(".progress-step").forEach((step, index) => {
            if(index < currentStep) step.classList.add("active");
            else step.classList.remove("active");
        });

        prevBtn.disabled = currentStep === 1;
        nextBtn.textContent = currentStep === totalSteps ? "Confirmer" : "→";

        if(currentStep === 4) updateSummary();

        window.scrollTo({top: 0, behavior: "smooth"});
    }

    // VALIDATION
    function validateCurrentStep(){
        const step = document.querySelector(`.form-step[data-step="${currentStep}"]`);
        if (!step) return false;

        const requiredFields = step.querySelectorAll("input[required], select[required]");

        for(let input of requiredFields){
            if(!input.value || input.value.trim() === ""){
                const fieldName = input.placeholder || input.name || 'ce champ';
                showError(`Veuillez remplir ${fieldName}`, input);
                return false;
            }

            if(input.type === "email"){
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if(!emailRegex.test(input.value)){
                    showError("Veuillez entrer une adresse email valide (exemple: nom@domaine.com)", input);
                    return false;
                }
            }

            if(input.id === "telephone"){
                const cleanPhone = input.value.replace(/\s/g, '');
                const phoneRegex = /^[0-9]{9,10}$/;
                if(!phoneRegex.test(cleanPhone)){
                    showError("Veuillez entrer un numéro de téléphone valide (9-10 chiffres)", input);
                    return false;
                }
            }
        }

        if(currentStep === 2){
            if(!dateReservationInput || !dateReservationInput.value){
                showError("Veuillez sélectionner une date dans le calendrier");
                return false;
            }

            const horaireSelect = document.getElementById("horaire");
            if(!horaireSelect || !horaireSelect.value){
                showError("Veuillez sélectionner un horaire pour votre rendez-vous", horaireSelect);
                return false;
            }

            const firstService = document.querySelector(".service-item .prestation");
            if(!firstService || !firstService.value){
                showError("Veuillez sélectionner au moins une prestation", firstService);
                return false;
            }
        }

        return true;
    }

    // SUMMARY
    function updateSummary(){
        const nom = document.getElementById("nom")?.value || "-";
        const prenom = document.getElementById("prenom")?.value || "-";
        const tel = document.getElementById("telephone")?.value || "-";
        const email = document.getElementById("email")?.value || "-";
        const adresse = document.getElementById("adresse")?.value || "-";
        const complement = document.getElementById("complement")?.value || "";
        const cp = document.getElementById("codePostal")?.value || "-";
        const ville = document.getElementById("ville")?.value || "-";

        const fullAddress = `${adresse}${complement ? `, ${complement}` : ""}, ${cp} ${ville}`;

        const serviceItems = document.querySelectorAll(".service-item");
        let services = [], priceHTML = "", total = 0;

        serviceItems.forEach(item => {
            const key = item.querySelector(".prestation")?.value;
            const precision = item.querySelector(".precision")?.value;
            if(!key) return;

            const price = servicePrices[key] || 0;
            total += price;
            let label = key.replace(/-/g, " ").toUpperCase();
            if(precision) label += ` (${precision})`;
            services.push(label);
            priceHTML += `<div class="price-line"><span>${label}</span><span>${price}€</span></div>`;
        });

        const villeChoice = document.querySelector('input[name="ville"]:checked')?.value || "Troyes";
        const villeSupplement = (villeChoice === "Nogent sur Seine" || villeChoice === "Bar sur Aube") ? 5 : 0;
        total += villeSupplement;

        if(villeSupplement > 0){
            priceHTML += `<div class="price-line"><span>Supplément ${villeChoice}</span><span>${villeSupplement}€</span></div>`;
        }

        const day = document.querySelector(".calendar-day.selected")?.textContent || "?";
        const horaire = document.getElementById("horaire")?.value || "?";
        const bookingText = `${services.join(", ")} le ${day} ${currentMonthYear?.textContent || ""} à ${horaire}`;

        const summaryName = document.getElementById("summaryName");
        const summaryPhone = document.getElementById("summaryPhone");
        const summaryEmail = document.getElementById("summaryEmail");
        const summaryAddress = document.getElementById("summaryAddress");
        const summaryBooking = document.getElementById("summaryBooking");
        const pricesContainer = document.getElementById("pricesContainer");
        const totalPrice = document.getElementById("totalPrice");

        if(summaryName) summaryName.textContent = `${nom} ${prenom}`;
        if(summaryPhone) summaryPhone.textContent = tel;
        if(summaryEmail) summaryEmail.textContent = email;
        if(summaryAddress) summaryAddress.textContent = fullAddress;
        if(summaryBooking) summaryBooking.textContent = bookingText;
        if(pricesContainer) pricesContainer.innerHTML = priceHTML;
        if(totalPrice) totalPrice.textContent = `${total}€`;
    }

    // PAYMENT
    if (payBtn) {
        payBtn.addEventListener("click", (e) => {
            e.preventDefault();

            const cardNumber = document.getElementById("cardNumber");
            const cardExpiry = document.getElementById("cardExpiry");
            const cardCVC = document.getElementById("cardCVC");
            const titulaireCarte = document.getElementById("titulaire_carte");

            const inputs = [cardNumber, cardExpiry, cardCVC, titulaireCarte];

            for(let input of inputs){
                if(!input || !input.value || input.value.trim() === ""){
                    showError("Veuillez remplir tous les champs de paiement", input);
                    return;
                }
            }

            if(cardNumber && cardNumber.value.length !== 16){
                showError("Le numéro de carte doit contenir 16 chiffres", cardNumber);
                return;
            }

            if(cardCVC && cardCVC.value.length !== 3){
                showError("Le CVC doit contenir 3 chiffres", cardCVC);
                return;
            }

            paymentValidated = true;
            if(paymentMessage) {
                paymentMessage.textContent = "✓ Paiement validé - Vous pouvez confirmer la réservation";
                paymentMessage.style.color = "#8F1643";
            }
            payBtn.disabled = true;
            payBtn.textContent = "Paiement confirmé";
        });
    }

    // INPUT FORMATTING
    const cardNumber = document.getElementById("cardNumber");
    if (cardNumber) {
        cardNumber.addEventListener("input", () => {
            cardNumber.value = cardNumber.value.replace(/\D/g, "").slice(0, 16);
        });
    }

    const cardExpiry = document.getElementById("cardExpiry");
    if (cardExpiry) {
        cardExpiry.addEventListener("input", () => {
            let value = cardExpiry.value.replace(/\D/g, "");
            if(value.length >= 3) value = value.slice(0, 2) + "/" + value.slice(2, 4);
            cardExpiry.value = value;
        });
    }

    const cardCVC = document.getElementById("cardCVC");
    if (cardCVC) {
        cardCVC.addEventListener("input", () => {
            cardCVC.value = cardCVC.value.replace(/\D/g, "").slice(0, 3);
        });
    }

    updateStep();
    console.log("Formulaire initialized");
});
