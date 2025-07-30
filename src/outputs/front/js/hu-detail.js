// HU Detail Page JavaScript - Versión simplificada
console.log('🔍 DEBUG: hu-detail.js cargado');

// Variables globales simples
let currentHUData = null;
let currentTimelineData = [];

// Función principal que se ejecuta al cargar la página
async function initializeHUDetail() {
    console.log('🚀 DEBUG: Inicializando página de detalle HU');
    
    // Obtener el parámetro ref de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const huRef = urlParams.get('ref');
    
    if (!huRef) {
        showError('No se especificó la referencia de la User Story');
        return;
    }
    
    console.log(`🔍 DEBUG: Cargando datos para HU ${huRef}`);
    
    try {
        // Cargar datos de la HU
        await loadHUData(huRef);
        
        // Cargar timeline detallado
        await loadTimelineData(huRef);
        
        // Renderizar todo
        renderPage();
        
    } catch (error) {
        console.error('❌ Error inicializando:', error);
        showError('Error cargando los datos de la User Story');
    }
}

// Función para cargar datos básicos de la HU
async function loadHUData(huRef) {
    console.log(`📋 DEBUG: Cargando datos básicos para HU ${huRef}`);
    
    const response = await fetch('user_stories_report.json');
    if (!response.ok) {
        throw new Error('No se pudo cargar el reporte de User Stories');
    }
    
    const data = await response.json();
    const hu = data.recent_user_stories.find(story => story.ref === parseInt(huRef));
    
    if (!hu) {
        throw new Error(`No se encontró la User Story con referencia ${huRef}`);
    }
    
    currentHUData = hu;
    console.log(`✅ DEBUG: Datos de HU cargados:`, currentHUData);
}

// Función para cargar timeline detallado
async function loadTimelineData(huRef) {
    console.log(`📅 DEBUG: Cargando timeline para HU ${huRef}`);
    
    try {
        const response = await fetch('complete_timeline.json');
        if (!response.ok) {
            throw new Error('No se pudo cargar el timeline completo');
        }
        
        const timelineData = await response.json();
        const huChanges = timelineData.changes_by_ref[huRef];
        
        console.log(`🔍 DEBUG: Cambios encontrados para HU ${huRef}:`, huChanges ? huChanges.length : 0);
        
        if (huChanges && huChanges.length > 0) {
            // Procesar los cambios del timeline
            currentTimelineData = huChanges.map(change => ({
                id: change.change_id,
                status: change.status,
                date: new Date(change.modified_date),
                isFirst: change.is_first,
                isLast: change.is_last
            }));
            
            console.log(`✅ DEBUG: Timeline cargado con ${currentTimelineData.length} elementos`);
        } else {
            // Crear timeline básico si no hay datos detallados
            createBasicTimeline();
        }
        
    } catch (error) {
        console.error('❌ Error cargando timeline:', error);
        createBasicTimeline();
    }
}

// Función para crear timeline básico
function createBasicTimeline() {
    console.log('⚠️ DEBUG: Creando timeline básico');
    
    if (!currentHUData) {
        console.error('❌ No hay datos de HU para crear timeline básico');
        return;
    }
    
    const createdDate = new Date(currentHUData.created_date);
    const modifiedDate = new Date(currentHUData.modified_date);
    
    currentTimelineData = [
        {
            id: 1,
            status: 'Open / Ready for sprint',
            date: createdDate,
            isFirst: true,
            isLast: false
        }
    ];
    
    // Agregar estado actual si es diferente
    if (currentHUData.status !== 'Open / Ready for sprint') {
        currentTimelineData.push({
            id: 2,
            status: currentHUData.status,
            date: modifiedDate,
            isFirst: false,
            isLast: true
        });
    } else {
        currentTimelineData[0].isLast = true;
    }
    
    console.log(`📅 DEBUG: Timeline básico creado con ${currentTimelineData.length} elementos`);
}

// Función para renderizar toda la página
function renderPage() {
    console.log('🎨 DEBUG: Renderizando página');
    
    if (!currentHUData) {
        showError('No hay datos de HU para renderizar');
        return;
    }
    
    // Ocultar loading
    hideLoading();
    
    // Renderizar información de la HU
    renderHUInfo();
    
    // Renderizar timeline
    renderTimeline();
    
    // Mostrar secciones
    showHUInfo();
    showTimeline();
    
    console.log('✅ DEBUG: Página renderizada completamente');
}

// Función para renderizar información de la HU
function renderHUInfo() {
    console.log('📋 DEBUG: Renderizando información de HU');
    
    const hu = currentHUData;
    
    // Calcular tiempo vivo
    const createdDate = new Date(hu.created_date);
    const modifiedDate = new Date(hu.modified_date);
    const ageInDays = Math.ceil((modifiedDate - createdDate) / (1000 * 60 * 60 * 24));
    
    // Actualizar elementos del DOM
    document.getElementById('huName').textContent = hu.subject;
    document.getElementById('huRef').textContent = hu.ref;
    document.getElementById('huStatusBadge').textContent = hu.status;
    document.getElementById('huStatusBadge').className = `status-badge ${getStatusClass(hu.status)}`;
    document.getElementById('huAge').textContent = `${ageInDays} días`;
    document.getElementById('huCreated').textContent = formatDate(createdDate);
    document.getElementById('huModified').textContent = formatDate(modifiedDate);
    document.getElementById('huChanges').textContent = currentTimelineData.length;
}

// Función para renderizar timeline
function renderTimeline() {
    console.log(`📅 DEBUG: Renderizando timeline con ${currentTimelineData.length} elementos`);
    
    const timelineContainer = document.getElementById('timeline');
    if (!timelineContainer) {
        console.error('❌ No se encontró el contenedor del timeline');
        return;
    }
    
    // Limpiar timeline
    timelineContainer.innerHTML = '';
    
    // Generar HTML para cada elemento del timeline
    currentTimelineData.forEach((item, index) => {
        const timelineItem = document.createElement('div');
        timelineItem.className = 'timeline-item';
        
        const statusClass = getStatusClass(item.status);
        const isLast = index === currentTimelineData.length - 1;
        
        timelineItem.innerHTML = `
            <div class="timeline-dot ${statusClass} ${isLast ? 'current' : ''}"></div>
            <div class="timeline-content">
                <div class="timeline-status">${item.status}</div>
                <div class="timeline-date">${formatDate(item.date)}</div>
                <div class="timeline-time">${formatTime(item.date)}</div>
            </div>
        `;
        
        timelineContainer.appendChild(timelineItem);
    });
    
    console.log('✅ DEBUG: Timeline renderizado');
}

// Funciones auxiliares
function getStatusClass(status) {
    const statusMap = {
        'Open / Ready for sprint': 'open-ready',
        'Develop in progress': 'develop-in-progress',
        'To be tested': 'to-be-tested',
        'Ready for smoke test': 'ready-smoke',
        'QA-tests failed': 'qa-failed',
        'Done': 'done'
    };
    return statusMap[status] || 'default';
}

function formatDate(date) {
    return date.toLocaleDateString('es-ES');
}

function formatTime(date) {
    return date.toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
}

function showError(message) {
    hideLoading();
    document.getElementById('errorMessage').textContent = message;
    document.getElementById('errorSection').style.display = 'block';
}

function hideLoading() {
    document.getElementById('loading').style.display = 'none';
}

function showHUInfo() {
    document.getElementById('huInfo').style.display = 'block';
}

function showTimeline() {
    document.getElementById('timelineSection').style.display = 'block';
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', initializeHUDetail);

// Hacer funciones disponibles globalmente para debugging
window.debugHUDetail = function() {
    console.log('🔍 DEBUG: Estado actual:');
    console.log('currentHUData:', currentHUData);
    console.log('currentTimelineData:', currentTimelineData);
}; 