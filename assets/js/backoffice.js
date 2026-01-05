// reservations variable is already defined by the template inline script

function getStatusLabel(status) {
    const labels = {
        'en_attente': 'En attente',
        'confirmee': 'Confirmée',
        'annulee': 'Annulée'
    };
    return labels[status] || status;
}

// Display today's reservations
function displayTodayReservations() {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const todayResa = reservations.filter(r => r.date === todayStr);

    const todayList = document.getElementById('todayList');
    const todayCount = document.getElementById('todayCount');

    if (todayCount) {
        todayCount.textContent = todayResa.length;
    }

    if (!todayList) return;

    if (!todayResa.length) {
        todayList.innerHTML = '<div class="no-results">Aucune réservation aujourd\'hui</div>';
        return;
    }

    todayList.innerHTML = todayResa.map(r => `
        <div class="today-item">
            <div class="today-item-info">
                <div class="today-item-time">${r.horaire}</div>
                <div class="today-item-client">${r.prenom} ${r.nom}</div>
                <div class="today-item-service">
                    ${r.prestations.map((p, i) => p + (r.precisions[i] ? ` (${r.precisions[i]})` : '')).join(', ')}
                </div>
            </div>
            <span class="status-badge status-${r.statut.replace('_', '-')}">${getStatusLabel(r.statut)}</span>
        </div>
    `).join('');
}

// Display all reservations table
function displayReservations(data = reservations) {
    const tbody = document.getElementById('reservationsTable');
    if (!tbody) return;

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
            <td>${r.prestations.map((p, i) => p + (r.precisions[i] ? ` (${r.precisions[i]})` : '')).join(', ')}</td>
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

// Format date helper
function formatDate(dateStr) {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR');
}

// Search function
function searchReservations() {
    const nameSearch = document.getElementById('searchName').value.toLowerCase();
    const emailSearch = document.getElementById('searchEmail').value.toLowerCase();

    const filtered = reservations.filter(r => {
        const matchName = !nameSearch ||
            r.nom.toLowerCase().includes(nameSearch) ||
            r.prenom.toLowerCase().includes(nameSearch);
        const matchEmail = !emailSearch || r.email.toLowerCase().includes(emailSearch);
        return matchName && matchEmail;
    });

    displayReservations(filtered);
}

// Modal functions
function showDetails(id) {
    const r = reservations.find(x => x.id === id);
    if (!r) return;

    const modal = document.getElementById('detailsModal');
    const modalContent = document.getElementById('modalDetails');

    if (!modal || !modalContent) return;

    modalContent.innerHTML = `
        <h3>Détails de la réservation #${r.id}</h3>
        <div class="detail-row">
            <div class="detail-label">Client</div>
            <div class="detail-value">${r.prenom} ${r.nom}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Email</div>
            <div class="detail-value">${r.email}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Téléphone</div>
            <div class="detail-value">${r.telephone}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Date & Heure</div>
            <div class="detail-value">${formatDate(r.date)} - ${r.horaire}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Prestations</div>
            <div class="detail-value">
                ${r.prestations.map((p, i) => p + (r.precisions[i] ? ` (${r.precisions[i]})` : '')).join('<br>')}
            </div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Adresse</div>
            <div class="detail-value">${r.adresse}, ${r.codePostal} ${r.ville}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Prix total</div>
            <div class="detail-value" style="font-size: 1.2em; font-weight: bold;">${r.prix}€</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Statut</div>
            <div class="detail-value">
                <span class="status-badge status-${r.statut.replace('_', '-')}">${getStatusLabel(r.statut)}</span>
            </div>
        </div>
        <button class="btn-close" onclick="closeModalBtn()">Fermer</button>
    `;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal(event) {
    if (event.target.id === 'detailsModal') {
        closeModalBtn();
    }
}

function closeModalBtn() {
    const modal = document.getElementById('detailsModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Actions
function validateReservation(id) {
    if (!confirm('Confirmer cette réservation ?')) return;

    fetch(`/backoffice/reservation/${id}/validate`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                location.reload();
            } else {
                alert('Erreur lors de la validation');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Erreur lors de la validation');
        });
}

function cancelReservation(id) {
    if (!confirm('Êtes-vous sûr de vouloir annuler cette réservation ?')) return;

    fetch(`/backoffice/reservation/${id}/cancel`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                location.reload();
            } else {
                alert('Erreur lors de l\'annulation');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Erreur lors de l\'annulation');
        });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('Backoffice loaded with', reservations.length, 'reservations');
    displayTodayReservations();
    displayReservations();

    // Add event listeners for search inputs
    const searchName = document.getElementById('searchName');
    const searchEmail = document.getElementById('searchEmail');

    if (searchName) {
        searchName.addEventListener('input', searchReservations);
    }

    if (searchEmail) {
        searchEmail.addEventListener('input', searchReservations);
    }

    // Close modal on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModalBtn();
        }
    });
});
