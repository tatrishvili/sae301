/********************
 * TAB NAVIGATION
 ********************/
document.addEventListener('DOMContentLoaded', () => {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');

            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // Add active class to clicked button and corresponding content
            button.classList.add('active');
            document.getElementById(`tab-${targetTab}`).classList.add('active');

            // Initialize map when map tab is opened (only once)
            if (targetTab === 'map' && !window.mapInitialized) {
                initMap();
                window.mapInitialized = true;
            }
        });
    });

    // Initialize other components
    displayTodayReservations();
    displayReservations();
    renderCalendar();

    document.getElementById('searchName')?.addEventListener('input', searchReservations);
    document.getElementById('searchEmail')?.addEventListener('input', searchReservations);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModalBtn(); });
});

/********************
 * MODAL & RESERVATIONS
 ********************/
function getStatusLabel(status) {
    const labels = { en_attente: 'En attente', confirmee: 'Confirmée', annulee: 'Annulée' };
    return labels[status] || status;
}

function formatDate(dateStr) {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('fr-FR');
}

function displayTodayReservations() {
    const today = new Date().toISOString().split('T')[0];
    const todayResa = reservations.filter(r => r.date === today);
    document.getElementById('todayCount').textContent = todayResa.length;

    const todayList = document.getElementById('todayList');
    if (!todayResa.length) {
        todayList.innerHTML = '<div class="no-results">Aucune réservation aujourd\'hui</div>';
        return;
    }

    todayList.innerHTML = todayResa.map(r => `
        <div class="today-item">
            <div class="today-item-info">
                <div class="today-item-time">${r.horaire}</div>
                <div class="today-item-client">${r.prenom} ${r.nom}</div>
                <div class="today-item-service">${r.prestations.map((p, i) => p + (r.precisions[i] ? ` (${r.precisions[i]})` : '')).join(', ')}</div>
            </div>
            <span class="status-badge status-${r.statut.replace('_', '-')}">${getStatusLabel(r.statut)}</span>
        </div>
    `).join('');
}

function displayReservations(data = reservations) {
    const tbody = document.getElementById('reservationsTable');
    if (!data.length) {
        tbody.innerHTML = '<tr><td colspan="8" class="no-results">Aucune réservation trouvée</td></tr>';
        return;
    }

    tbody.innerHTML = data.map(r => `
        <tr data-id="${r.id}">
            <td>${formatDate(r.date)}</td>
            <td>${r.horaire}</td>
            <td>${r.prenom} ${r.nom}</td>
            <td>${r.email}</td>
            <td>${r.prestations.map((p, i) => p + (r.precisions[i] ? ` (${r.precisions[i]})` : '')).join('<br>')}</td>
            <td>${r.prix ? r.prix + '€' : '-'}</td>
            <td><span class="status-badge status-${r.statut.replace('_', '-')}">${getStatusLabel(r.statut)}</span></td>
            <td>
                <div class="action-buttons">
                    ${r.statut === 'en_attente' ? `<button class="btn-validate" onclick="validateReservation(${r.id})">✓</button>` : ''}
                    ${r.statut !== 'annulee' ? `<button class="btn-cancel" onclick="cancelReservation(${r.id})">✗</button>` : ''}
                    <button class="btn-details" onclick="showDetails(${r.id})">Voir</button>
                </div>
            </td>
        </tr>
    `).join('');
}

function searchReservations() {
    const name = document.getElementById('searchName').value.toLowerCase();
    const email = document.getElementById('searchEmail').value.toLowerCase();
    const filtered = reservations.filter(r =>
        (!name || r.nom.toLowerCase().includes(name) || r.prenom.toLowerCase().includes(name)) &&
        (!email || r.email.toLowerCase().includes(email))
    );
    displayReservations(filtered);
}

function showDetails(id) {
    const r = reservations.find(x => x.id === id);
    const modal = document.getElementById('detailsModal');
    const content = document.getElementById('modalDetails');
    content.innerHTML = `
        <h3>Détails de la réservation #${r.id}</h3>
        <div class="detail-row"><div class="detail-label">Client</div><div class="detail-value">${r.prenom} ${r.nom}</div></div>
        <div class="detail-row"><div class="detail-label">Email</div><div class="detail-value">${r.email}</div></div>
        <div class="detail-row"><div class="detail-label">Téléphone</div><div class="detail-value">${r.telephone}</div></div>
        <div class="detail-row"><div class="detail-label">Date & Heure</div><div class="detail-value">${formatDate(r.date)} - ${r.horaire}</div></div>
        <div class="detail-row"><div class="detail-label">Prestations</div><div class="detail-value">${r.prestations.map((p, i) => p + (r.precisions[i] ? ` (${r.precisions[i]})` : '')).join('<br>')}</div></div>
        <div class="detail-row"><div class="detail-label">Adresse</div><div class="detail-value">${r.adresse}, ${r.codePostal} ${r.ville}</div></div>
        <div class="detail-row"><div class="detail-label">Prix total</div><div class="detail-value">${r.prix}€</div></div>
        <div class="detail-row"><div class="detail-label">Statut</div><div class="detail-value"><span class="status-badge status-${r.statut.replace('_', '-')}">${getStatusLabel(r.statut)}</span></div></div>
        <button class="btn-close" onclick="closeModalBtn()">Fermer</button>
    `;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModalBtn() {
    document.getElementById('detailsModal').classList.remove('active');
    document.body.style.overflow = '';
}

function closeModal(event) {
    if (event.target.classList.contains('modal')) {
        closeModalBtn();
    }
}

function validateReservation(id) {
    if (!confirm('Confirmer cette réservation ?')) return;
    fetch(`/backoffice/reservation/${id}/validate`, { method: 'POST', headers: { 'Content-Type': 'application/json' } })
        .then(res => res.json()).then(data => data.success ? location.reload() : alert('Erreur validation'))
        .catch(() => alert('Erreur validation'));
}

function cancelReservation(id) {
    if (!confirm('Annuler cette réservation ?')) return;
    fetch(`/backoffice/reservation/${id}/cancel`, { method: 'POST', headers: { 'Content-Type': 'application/json' } })
        .then(res => res.json()).then(data => data.success ? location.reload() : alert('Erreur annulation'))
        .catch(() => alert('Erreur annulation'));
}

/********************
 * PLANNING CALENDAR
 ********************/
let currentDate = new Date();
const planningGrid = document.getElementById('planningGrid');
const monthYearLabel = document.getElementById('currentMonthYear');

function renderCalendar() {
    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();
    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();

    monthYearLabel.textContent = currentDate.toLocaleString('fr-FR', { month: 'long', year: 'numeric' });

    let html = '';

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
        html += `<div class="calendar-cell empty"></div>`;
    }

    // Add cells for each day of the month
    for (let day = 1; day <= lastDate; day++) {
        const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        const isBooked = reservations.some(r => r.date === dateStr);
        const classes = isBooked ? 'booked' : '';
        html += `<div class="calendar-cell ${classes}">${day}</div>`;
    }

    planningGrid.innerHTML = html;
}

document.getElementById('prevMonth')?.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
});

document.getElementById('nextMonth')?.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
});

/********************
 * LEAFLET MAP WITH CONTROLS & CLIENT LIST
 ********************/
let mapInstance = null;
let mapMarkers = [];

function initMap() {
    // Initialize map
    mapInstance = L.map('clientsMap').setView([46.603354, 1.888334], 6); // Center of France

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 18
    }).addTo(mapInstance);

    // Store initial view
    const initialView = { center: [46.603354, 1.888334], zoom: 6 };

    // Map controls
    document.getElementById('mapZoomIn')?.addEventListener('click', () => {
        mapInstance.zoomIn();
    });

    document.getElementById('mapZoomOut')?.addEventListener('click', () => {
        mapInstance.zoomOut();
    });

    document.getElementById('mapReset')?.addEventListener('click', () => {
        mapInstance.setView(initialView.center, initialView.zoom);
    });

    // Build client list
    const clientsList = document.getElementById('clientsList');
    let clientsHTML = '<h3>Liste des clients</h3>';

    // Filter reservations with addresses
    const clientsWithAddress = reservations.filter(r => r.adresse && r.codePostal && r.ville);

    if (clientsWithAddress.length === 0) {
        clientsHTML += '<div class="no-results">Aucune adresse disponible</div>';
        clientsList.innerHTML = clientsHTML;
        return;
    }

    // Process each client
    clientsWithAddress.forEach((r, index) => {
        const fullAddress = `${r.adresse}, ${r.codePostal} ${r.ville}`;

        clientsHTML += `
            <div class="client-item" data-index="${index}">
                <div class="client-name">${r.prenom} ${r.nom}</div>
                <div class="client-address">${fullAddress}</div>
                <div class="client-date">RDV: ${formatDate(r.date)} - ${r.horaire}</div>
            </div>
        `;

        // Geocode and add marker
        fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}`)
            .then(res => res.json())
            .then(data => {
                if (data.length) {
                    const lat = parseFloat(data[0].lat);
                    const lon = parseFloat(data[0].lon);

                    const marker = L.marker([lat, lon]).addTo(mapInstance)
                        .bindPopup(`
                            <strong>${r.prenom} ${r.nom}</strong><br>
                            ${fullAddress}<br>
                            <em>RDV: ${formatDate(r.date)} - ${r.horaire}</em>
                        `);

                    mapMarkers.push({ marker, lat, lon, index });
                }
            })
            .catch(err => console.error('Geocoding error:', err));
    });

    clientsList.innerHTML = clientsHTML;

    // Add click handlers to client items
    setTimeout(() => {
        document.querySelectorAll('.client-item').forEach(item => {
            item.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                const markerData = mapMarkers.find(m => m.index === index);

                if (markerData) {
                    // Remove active class from all items
                    document.querySelectorAll('.client-item').forEach(i => i.classList.remove('active'));
                    // Add active class to clicked item
                    this.classList.add('active');

                    // Center map on marker and zoom in
                    mapInstance.setView([markerData.lat, markerData.lon], 14);
                    markerData.marker.openPopup();
                }
            });
        });
    }, 2000); // Wait for geocoding to complete
}
