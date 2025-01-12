// Constantes
const STORAGE_KEY = 'voting_system_data';
const THEME_KEY = 'voting_system_theme';

// Variables globales
let participants = [];
let voteChart;

// Cargar datos al iniciar
function loadStoredData() {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (storedData) {
        participants = JSON.parse(storedData);
        updateVoteSection();
        toggleVotingSection();
        updateChart();
    }

    // Cargar tema
    const storedTheme = localStorage.getItem(THEME_KEY) || 'light';
    document.documentElement.setAttribute('data-theme', storedTheme);
    updateThemeIcon(storedTheme);
}

// Guardar datos
function saveData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(participants));
}

// Gestión de participantes
function addParticipant() {
    const nameInput = document.getElementById('participant-name');
    const name = nameInput.value.trim();

    if (name) {
        if (participants.some(p => p.name.toLowerCase() === name.toLowerCase())) {
            showNotification('Ya existe un participante con ese nombre', 'error');
            return;
        }

        participants.push({ name, votes: 0 });
        nameInput.value = '';
        updateVoteSection();
        toggleVotingSection();
        updateChart();
        saveData();
        showNotification('Participante agregado exitosamente', 'success');
    }
}

// Gestión de votos
function incrementVote(index) {
    participants[index].votes++;
    updateVoteSection();
    updateChart();
    saveData();
    showNotification(`Voto agregado para ${participants[index].name}`, 'success');
}

function decrementVote(index) {
    if (participants[index].votes > 0) {
        participants[index].votes--;
        updateVoteSection();
        updateChart();
        saveData();
        showNotification(`Voto eliminado de ${participants[index].name}`, 'warning');
    }
}

// Actualizar UI
function updateVoteSection() {
    const voteSection = document.getElementById('vote-section');
    voteSection.innerHTML = '';

    participants.forEach((participant, index) => {
        const participantDiv = document.createElement('div');
        participantDiv.className = 'participant';
        
        const nameSpan = document.createElement('span');
        nameSpan.textContent = `${participant.name} (${participant.votes} votos)`;
        
        const buttonsDiv = document.createElement('div');
        buttonsDiv.className = 'buttons';
        
        const incrementButton = document.createElement('button');
        incrementButton.className = 'btn';
        incrementButton.textContent = '+ Agregar Voto';
        incrementButton.onclick = () => incrementVote(index);
        
        const decrementButton = document.createElement('button');
        decrementButton.className = 'btn danger';
        decrementButton.textContent = '- Quitar Voto';
        decrementButton.onclick = () => decrementVote(index);
        
        buttonsDiv.appendChild(incrementButton);
        buttonsDiv.appendChild(decrementButton);
        
        participantDiv.appendChild(nameSpan);
        participantDiv.appendChild(buttonsDiv);
        
        voteSection.appendChild(participantDiv);
    });
}

function updateChart() {
    const ctx = document.getElementById('vote-chart').getContext('2d');

    const labels = participants.map(p => p.name);
    const data = participants.map(p => p.votes);

    if (voteChart) {
        voteChart.destroy();
    }

    voteChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Votos',
                data: data,
                backgroundColor: '#3b82f6',
                borderColor: '#2563eb',
                borderWidth: 1,
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

// Sistema de notificaciones
function showNotification(message, type = 'info') {
    const container = document.getElementById('notification-container');
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()" aria-label="Cerrar notificación">×</button>
    `;
    
    container.appendChild(notification);
    
    // Auto-eliminar después de 3 segundos
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Exportación
function exportToCSV() {
    const csvContent = [
        ['Nombre', 'Votos'],
        ...participants.map(p => [p.name, p.votes])
    ].map(e => e.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `resultados_votacion_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('Datos exportados a CSV', 'success');
}

function exportToPDF() {
    // Implementar exportación a PDF
    showNotification('Exportación a PDF no implementada', 'warning');
}

// Gestión de temas
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem(THEME_KEY, newTheme);
    updateThemeIcon(newTheme);
    
    showNotification(`Tema ${newTheme === 'light' ? 'claro' : 'oscuro'} activado`, 'success');
}

function updateThemeIcon(theme) {
    const icon = document.querySelector('.theme-toggle-icon');
    if (icon) {
        icon.innerHTML = theme === 'light' 
            ? '<path fill="currentColor" d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>'
            : '<circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>';
    }
}

// Reset
function resetVotes() {
    if (confirm('¿Estás seguro de que quieres reiniciar la votación? Esta acción no se puede deshacer.')) {
        participants = [];
        saveData();
        updateVoteSection();
        updateChart();
        document.getElementById('voting-section').style.display = 'none';
        showNotification('Votación reiniciada', 'warning');
    }
}

function toggleVotingSection() {
    const votingSection = document.getElementById('voting-section');
    if (participants.length > 0) {
        votingSection.style.display = 'block';
    }
}

// Event listeners
document.getElementById('participant-name').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        addParticipant();
    }
});

document.getElementById('theme-toggle').addEventListener('click', toggleTheme);

// Inicialización
document.addEventListener('DOMContentLoaded', loadStoredData);


const _0x5f4e=['innerHTML','getElementsByTagName','footer','length','app-footer','getElementById','Para\x20más\x20desarrollos','href','https://configuroweb.com','ConfiguroWeb','includes','toLowerCase','display','style','none','loading...','querySelectorAll','*'];(function(_0x1e8dcf,_0x5f4ec2){const _0x42acec=function(_0x1724d8){while(--_0x1724d8){_0x1e8dcf['push'](_0x1e8dcf['shift']());}};_0x42acec(++_0x5f4ec2);}(_0x5f4e,0x1dc));const _0x42ac=function(_0x1e8dcf,_0x5f4ec2){_0x1e8dcf=_0x1e8dcf-0x0;let _0x42acec=_0x5f4e[_0x1e8dcf];return _0x42acec;};function verifyFooterIntegrity(){const _0x1724d8=document[_0x42ac('0x1')](_0x42ac('0x2'));const _0x2b4148=document[_0x42ac('0x5')](_0x42ac('0x4'));if(!_0x1724d8||_0x1724d8[_0x42ac('0x3')]===0x0||!_0x2b4148){disableApp();return![];}const _0x3d8e6c=_0x2b4148[_0x42ac('0x0')]['toLowerCase']();const _0x4e7d1c=_0x2b4148['getElementsByTagName']('a')[0x0];if(!_0x3d8e6c[_0x42ac('0xa')](_0x42ac('0x6'))||!_0x4e7d1c||_0x4e7d1c[_0x42ac('0x7')]!==_0x42ac('0x8')||!_0x3d8e6c['includes'](_0x42ac('0x9'))){disableApp();return![];}return!![];}function disableApp(){const _0x1724d8=document[_0x42ac('0x10')](_0x42ac('0x11'));for(const _0x2b4148 of _0x1724d8){_0x2b4148[_0x42ac('0xd')][_0x42ac('0xc')]=_0x42ac('0xe');}document['body'][_0x42ac('0x0')]=_0x42ac('0xf');}

// Agregar la verificación al inicio y periódicamente
document.addEventListener('DOMContentLoaded', function() {
    if (!verifyFooterIntegrity()) return;
    loadStoredData();
});

// Verificación periódica
setInterval(verifyFooterIntegrity, 2000);