import * as fs from 'fs';
import * as path from 'path';
import { FILE_PATHS } from '../constants';
import { ensureDirectoryExists } from '../utils';

interface UserStory {
    ref: number;
    subject: string;
    name: string;
    created_date: string;
    modified_date: string;
    status?: string;
    age_in_months: number;
    is_old: boolean;
}

interface UserStoriesReport {
    current_year: number;
    total_user_stories: number;
    old_user_stories: UserStory[];
    recent_user_stories: UserStory[];
}

function insertDataIntoHTML(htmlContent: string, data: UserStoriesReport): string {
    const stories = data.recent_user_stories;
    
    // Calcular estadísticas
    const statusCounts: { [key: string]: number } = {};
    const ageCounts: { [key: number]: number } = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 };
    const monthCounts: { [key: number]: number } = {};
    
    stories.forEach(story => {
        // Contar por estado
        if (story.status) {
            statusCounts[story.status] = (statusCounts[story.status] || 0) + 1;
        }
        
        // Contar por edad
        const age = Math.min(story.age_in_months, 4);
        ageCounts[age] = (ageCounts[age] || 0) + 1;
        
        // Contar por mes
        const month = new Date(story.created_date).getMonth() + 1;
        monthCounts[month] = (monthCounts[month] || 0) + 1;
    });

    const completedCount = statusCounts['Done'] || 0;
    const completionRate = ((completedCount / data.total_user_stories) * 100).toFixed(1);
    const avgAge = (stories.reduce((sum, story) => sum + story.age_in_months, 0) / stories.length).toFixed(1);
    
    const inProgressCount = (statusCounts['Develop in progress'] || 0) + 
                           (statusCounts['To be tested'] || 0) + 
                           (statusCounts['In QA / UX Test'] || 0) + 
                           (statusCounts['Ready for smoke test'] || 0);

    // Generar datos JSON para el dashboard
    const dashboardData = {
        stats: {
            total: data.total_user_stories,
            completed: completedCount,
            inProgress: inProgressCount,
            completionRate: completionRate,
            avgAge: avgAge
        },
        statusCounts,
        ageCounts,
        monthCounts,
        stories: stories.map(story => ({
            ref: story.ref,
            subject: story.subject,
            status: story.status,
            created_date: story.created_date,
            modified_date: story.modified_date,
            age_in_months: story.age_in_months
        }))
    };

    // Reemplazar placeholders en el HTML
    let updatedHTML = htmlContent
        .replace('{{TOTAL_STORIES}}', data.total_user_stories.toString())
        .replace('{{CURRENT_YEAR}}', data.current_year.toString())
        .replace('{{COMPLETED_STORIES}}', completedCount.toString())
        .replace('{{COMPLETION_RATE}}', `${completionRate}% completadas`)
        .replace('{{IN_PROGRESS_STORIES}}', inProgressCount.toString())
        .replace('{{AVG_AGE}}', avgAge)
        .replace('{{DONE_COUNT}}', (statusCounts['Done'] || 0).toString())
        .replace('{{IN_PROGRESS_COUNT}}', (statusCounts['Develop in progress'] || 0).toString())
        .replace('{{TO_TEST_COUNT}}', (statusCounts['To be tested'] || 0).toString())
        .replace('{{QA_COUNT}}', (statusCounts['In QA / UX Test'] || 0).toString())
        .replace('{{READY_COUNT}}', (statusCounts['Ready for smoke test'] || 0).toString())
        .replace('{{AGE_0}}', ageCounts[0].toString())
        .replace('{{AGE_1}}', ageCounts[1].toString())
        .replace('{{AGE_2}}', ageCounts[2].toString())
        .replace('{{AGE_3}}', ageCounts[3].toString())
        .replace('{{AGE_4}}', ageCounts[4].toString())
        .replace('{{DASHBOARD_DATA}}', JSON.stringify(dashboardData, null, 2))
        .replace('{{CURRENT_TIMESTAMP}}', new Date().toLocaleString('es-ES'))
        .replace('{{LAST_UPDATE}}', new Date().toLocaleString('es-ES'));

    return updatedHTML;
}

function main() {
    try {
        // Leer el archivo JSON de user stories
        const jsonPath = path.join(process.cwd(), FILE_PATHS.JSON_OUTPUT, 'user_stories_report.json');
        
        if (!fs.existsSync(jsonPath)) {
            console.error('❌ Error: No se encontró el archivo user_stories_report.json');
            console.log('💡 Ejecuta primero: yarn process');
            process.exit(1);
        }

        const jsonData = fs.readFileSync(jsonPath, 'utf8');
        const data: UserStoriesReport = JSON.parse(jsonData);

        // Crear directorio front si no existe
        const frontDir = path.join(process.cwd(), FILE_PATHS.FRONT_OUTPUT);
        ensureDirectoryExists(frontDir);

        // Crear subdirectorios
        const cssDir = path.join(frontDir, 'css');
        const jsDir = path.join(frontDir, 'js');
        
        ensureDirectoryExists(cssDir);
        ensureDirectoryExists(jsDir);

        // Leer archivos CSS y JS
        const cssPath = path.join(frontDir, 'css', 'dashboard.css');
        const jsPath = path.join(frontDir, 'js', 'dashboard.js');
        const htmlPath = path.join(frontDir, 'dashboard.html');

        // Verificar si existen los archivos CSS y JS
        if (!fs.existsSync(cssPath)) {
            console.error('❌ Error: No se encontró el archivo CSS');
            console.log('💡 Asegúrate de que existe: src/outputs/front/css/dashboard.css');
            process.exit(1);
        }

        if (!fs.existsSync(jsPath)) {
            console.error('❌ Error: No se encontró el archivo JavaScript');
            console.log('💡 Asegúrate de que existe: src/outputs/front/js/dashboard.js');
            process.exit(1);
        }

        // Leer el HTML base
        const htmlBasePath = path.join(frontDir, 'dashboard.html');
        if (!fs.existsSync(htmlBasePath)) {
            console.error('❌ Error: No se encontró el archivo HTML base');
            console.log('💡 Asegúrate de que existe: src/outputs/front/dashboard.html');
            process.exit(1);
        }

        let htmlContent = fs.readFileSync(htmlBasePath, 'utf8');

        // Insertar los datos en el HTML
        htmlContent = insertDataIntoHTML(htmlContent, data);

        // Escribir el archivo HTML final
        fs.writeFileSync(htmlPath, htmlContent, 'utf8');

        // Crear una copia del JSON en la carpeta front para acceso directo
        const jsonCopyPath = path.join(frontDir, 'user_stories_report.json');
        fs.writeFileSync(jsonCopyPath, JSON.stringify(data, null, 2), 'utf8');

        // Verificar que complete_timeline.json existe (pero no copiarlo)
        const timelineSourcePath = path.join(process.cwd(), FILE_PATHS.JSON_OUTPUT, 'complete_timeline.json');
        if (fs.existsSync(timelineSourcePath)) {
            console.log(`📁 Timeline completo disponible en: ${timelineSourcePath}`);
        } else {
            console.log('⚠️ Timeline completo no encontrado, se usará timeline básico');
        }

        console.log('✅ Dashboard HTML generado exitosamente');
        console.log(`📁 Archivo: ${htmlPath}`);
        console.log(`📁 JSON copiado: ${jsonCopyPath}`);
        console.log(`📊 Total User Stories: ${data.total_user_stories}`);
        console.log(`📈 User Stories recientes: ${data.recent_user_stories.length}`);
        console.log(`🔗 Página de detalle: hu-detail.html`);
        console.log(`📉 User Stories antiguas: ${data.old_user_stories.length}`);
        
        // Mostrar estadísticas rápidas
        const completedCount = data.recent_user_stories.filter(s => s.status === 'Done').length;
        const completionRate = ((completedCount / data.total_user_stories) * 100).toFixed(1);
        console.log(`✅ Completadas: ${completedCount} (${completionRate}%)`);

    } catch (error) {
        console.error('❌ Error al generar el dashboard:', error);
        process.exit(1);
    }
}

// Ejecutar si es el archivo principal
if (require.main === module) {
    main();
}

export { insertDataIntoHTML }; 