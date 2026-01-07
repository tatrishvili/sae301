/********************
 * MODAL & RESERVATIONS
 ********************/
function getStatusLabel(status){
    const labels = { en_attente:'En attente', confirmee:'Confirmée', annulee:'Annulée' };
    return labels[status] || status;
}

function formatDate(dateStr){
    if(!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('fr-FR');
}

function displayTodayReservations(){
    const today = new Date().toISOString().split('T')[0];
    const todayResa = reservations.filter(r => r.date===today);
    document.getElementById('todayCount').textContent = todayResa.length;

    const todayList = document.getElementById('todayList');
    if(!todayResa.length){
        todayList.innerHTML = '<div class="no-results">Aucune réservation aujourd\'hui</div>';
        return;
    }

    todayList.innerHTML = todayResa.map(r => `
        <div class="today-item">
            <div class="today-item-info">
                <div class="today-item-time">${r.horaire}</div>
                <div class="today-item-client">${r.prenom} ${r.nom}</div>
                <div class="today-item-service">${r.prestations.map((p,i)=>p+(r.precisions[i]?` (${r.precisions[i]})`:'' )).join(', ')}</div>
            </div>
            <span class="status-badge status-${r.statut.replace('_','-')}">${getStatusLabel(r.statut)}</span>
        </div>
    `).join('');
}

function displayReservations(data = reservations){
    const tbody = document.getElementById('reservationsTable');
    if(!data.length){
        tbody.innerHTML = '<tr><td colspan="8" class="no-results">Aucune réservation trouvée</td></tr>';
        return;
    }

    tbody.innerHTML = data.map(r => `
        <tr data-id="${r.id}">
            <td>${formatDate(r.date)}</td>
            <td>${r.horaire}</td>
            <td>${r.prenom} ${r.nom}</td>
            <td>${r.email}</td>
            <td>${r.prestations.map((p, i) => p + (r.precisions[i]?` (${r.precisions[i]})`:'' )).join('<br>')}</td>
            <td>${r.prix? r.prix+'€' : '-'}</td>
            <td><span class="status-badge status-${r.statut.replace('_','-')}">${getStatusLabel(r.statut)}</span></td>
            <td>
                <div class="action-buttons">
                    ${r.statut==='en_attente'?`<button class="btn-validate" onclick="validateReservation(${r.id})">✓</button>`:''}
                    ${r.statut!=='annulee'?`<button class="btn-cancel" onclick="cancelReservation(${r.id})">✗</button>`:''}
                    <button class="btn-details" onclick="showDetails(${r.id})">Voir</button>
                </div>
            </td>
        </tr>
    `).join('');
}

function searchReservations(){
    const name = document.getElementById('searchName').value.toLowerCase();
    const email = document.getElementById('searchEmail').value.toLowerCase();
    const filtered = reservations.filter(r =>
        (!name || r.nom.toLowerCase().includes(name) || r.prenom.toLowerCase().includes(name)) &&
        (!email || r.email.toLowerCase().includes(email))
    );
    displayReservations(filtered);
}

function showDetails(id){
    const r = reservations.find(x=>x.id===id);
    const modal = document.getElementById('detailsModal');
    const content = document.getElementById('modalDetails');
    content.innerHTML = `
        <h3>Détails de la réservation #${r.id}</h3>
        <div class="detail-row"><div class="detail-label">Client</div><div class="detail-value">${r.prenom} ${r.nom}</div></div>
        <div class="detail-row"><div class="detail-label">Email</div><div class="detail-value">${r.email}</div></div>
        <div class="detail-row"><div class="detail-label">Téléphone</div><div class="detail-value">${r.telephone}</div></div>
        <div class="detail-row"><div class="detail-label">Date & Heure</div><div class="detail-value">${formatDate(r.date)} - ${r.horaire}</div></div>
        <div class="detail-row"><div class="detail-label">Prestations</div><div class="detail-value">${r.prestations.map((p,i)=>p+(r.precisions[i]?` (${r.precisions[i]})`:'' )).join('<br>')}</div></div>
        <div class="detail-row"><div class="detail-label">Adresse</div><div class="detail-value">${r.adresse}, ${r.codePostal} ${r.ville}</div></div>
        <div class="detail-row"><div class="detail-label">Prix total</div><div class="detail-value">${r.prix}€</div></div>
        <div class="detail-row"><div class="detail-label">Statut</div><div class="detail-value"><span class="status-badge status-${r.statut.replace('_','-')}">${getStatusLabel(r.statut)}</span></div></div>
        <button class="btn-close" onclick="closeModalBtn()">Fermer</button>
    `;
    modal.classList.add('active');
    document.body.style.overflow='hidden';
}

function closeModalBtn(){
    document.getElementById('detailsModal').classList.remove('active');
    document.body.style.overflow='';
}

function validateReservation(id){
    if(!confirm('Confirmer cette réservation ?')) return;
    fetch(`/backoffice/reservation/${id}/validate`, {method:'POST', headers:{'Content-Type':'application/json'}})
        .then(res=>res.json()).then(data=>data.success?location.reload():alert('Erreur validation'))
        .catch(()=>alert('Erreur validation'));
}

function cancelReservation(id){
    if(!confirm('Annuler cette réservation ?')) return;
    fetch(`/backoffice/reservation/${id}/cancel`, {method:'POST', headers:{'Content-Type':'application/json'}})
        .then(res=>res.json()).then(data=>data.success?location.reload():alert('Erreur annulation'))
        .catch(()=>alert('Erreur annulation'));
}

/********************
 * PLANNING CALENDAR
 ********************/
let currentDate = new Date();
const planningGrid = document.getElementById('planningGrid');
const monthYearLabel = document.getElementById('currentMonthYear');

function renderCalendar(){
    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();
    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month+1, 0).getDate();

    monthYearLabel.textContent = currentDate.toLocaleString('fr-FR',{month:'long', year:'numeric'});

    let html = '';
    const dayNames = ['Dim','Lun','Mar','Mer','Jeu','Ven','Sam'];
    html += '<div class="calendar-week">';
    dayNames.forEach(d=>html+=`<div class="calendar-day-name">${d}</div>`);
    html += '</div>';

    html += '<div class="calendar-week">';
    for(let i=0;i<firstDay;i++) html+=`<div class="calendar-cell empty"></div>`;

    for(let day=1;day<=lastDate;day++){
        const dateStr = `${year}-${(month+1).toString().padStart(2,'0')}-${day.toString().padStart(2,'0')}`;
        const isBooked = reservations.some(r=>r.date===dateStr);
        const classes = isBooked?'booked':'';
        html+=`<div class="calendar-cell ${classes}">${day}</div>`;
        if((day+firstDay)%7===0) html+='</div><div class="calendar-week">';
    }
    html+='</div>';
    planningGrid.innerHTML=html;
}

document.getElementById('prevMonth').addEventListener('click', ()=>{
    currentDate.setMonth(currentDate.getMonth()-1);
    renderCalendar();
});
document.getElementById('nextMonth').addEventListener('click', ()=>{
    currentDate.setMonth(currentDate.getMonth()+1);
    renderCalendar();
});

/********************
 * LEAFLET MAP
 ********************/
const map = L.map('clientsMap').setView([48.8566,2.3522],6);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
    attribution:'&copy; OpenStreetMap contributors'
}).addTo(map);

reservations.forEach(r=>{
    if(r.adresse && r.codePostal && r.ville){
        const fullAddress = `${r.adresse}, ${r.codePostal} ${r.ville}`;
        fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}`)
            .then(res=>res.json())
            .then(data=>{
                if(data.length){
                    const lat=data[0].lat;
                    const lon=data[0].lon;
                    L.marker([lat,lon]).addTo(map)
                        .bindPopup(`${r.prenom} ${r.nom}<br>${fullAddress}`);
                }
            });
    }
});

/********************
 * INIT
 ********************/
document.addEventListener('DOMContentLoaded',()=>{
    displayTodayReservations();
    displayReservations();
    renderCalendar();
    document.getElementById('searchName')?.addEventListener('input', searchReservations);
    document.getElementById('searchEmail')?.addEventListener('input', searchReservations);
    document.addEventListener('keydown',(e)=>{if(e.key==='Escape') closeModalBtn();});
});
