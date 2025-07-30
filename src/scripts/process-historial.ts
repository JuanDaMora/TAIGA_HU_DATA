import * as fs from 'fs';
import * as path from 'path';
import { HistorialEntry } from '../interfaces/historial-json.interface';

interface ProcessedUserStory {
  ref: number;
  subject: string;
  name: string;
  created_date: string;
  modified_date: string;
  status?: string;
  age_in_months: number;
  is_old: boolean; // Más de 5 meses
}

interface ProcessedHistorial {
  current_year: number;
  total_user_stories: number;
  old_user_stories: ProcessedUserStory[]; // Más de 5 meses
  recent_user_stories: ProcessedUserStory[]; // Menos de 5 meses
  ignored_previous_year: number;
}

interface StateChange {
  ref: number;
  subject: string;
  status: string;
  modified_date: string;
  created_date: string;
  change_id: number;
  is_first: boolean;
  is_last: boolean;
}

interface CompleteTimeline {
  total_changes: number;
  total_user_stories: number;
  changes_by_ref: { [ref: number]: StateChange[] };
  all_changes: StateChange[];
}

interface MonthGroup {
  month: string;
  year: number;
  stories: ProcessedUserStory[];
}

/**
 * Calcula la diferencia en meses entre dos fechas
 */
function getMonthsDifference(date1: Date, date2: Date): number {
  const yearDiff = date2.getFullYear() - date1.getFullYear();
  const monthDiff = date2.getMonth() - date1.getMonth();
  return yearDiff * 12 + monthDiff;
}

/**
 * Obtiene el nombre del mes en español
 */
function getMonthName(month: number): string {
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  return months[month];
}

/**
 * Agrupa las user stories por mes de creación
 */
function groupByMonth(userStories: ProcessedUserStory[]): MonthGroup[] {
  const monthGroups = new Map<string, MonthGroup>();
  
  userStories.forEach(story => {
    const date = new Date(story.created_date);
    const month = date.getMonth();
    const year = date.getFullYear();
    const key = `${year}-${month}`;
    
    if (!monthGroups.has(key)) {
      monthGroups.set(key, {
        month: getMonthName(month),
        year: year,
        stories: []
      });
    }
    
    monthGroups.get(key)!.stories.push(story);
  });
  
  // Convertir a array y ordenar por fecha (más antiguo primero)
  return Array.from(monthGroups.values()).sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    const monthA = new Date(a.stories[0].created_date).getMonth();
    const monthB = new Date(b.stories[0].created_date).getMonth();
    return monthA - monthB;
  });
}

/**
 * Procesa el historial JSON según los criterios especificados
 */
function processHistorial(historialData: HistorialEntry[]): ProcessedHistorial {
  const currentYear = new Date().getFullYear();
  const currentDate = new Date();
  const fiveMonthsAgo = new Date();
  fiveMonthsAgo.setMonth(fiveMonthsAgo.getMonth() - 5);

  console.log(`📅 [PROCESS] Año actual: ${currentYear}`);
  console.log(`📅 [PROCESS] Fecha de corte (5 meses atrás): ${fiveMonthsAgo.toISOString().split('T')[0]}`);

  // Mapa para evitar duplicados (usar ref como clave)
  const uniqueUserStories = new Map<number, ProcessedUserStory>();
  let ignoredPreviousYear = 0;

  historialData.forEach((entry) => {
    const entryDate = new Date(entry.created_date);
    
    // Ignorar entradas del año anterior
    if (entryDate.getFullYear() < currentYear) {
      ignoredPreviousYear++;
      return;
    }

    // Calcular edad en meses
    const ageInMonths = getMonthsDifference(entryDate, currentDate);
    const isOld = ageInMonths > 5;

    // Crear objeto procesado
    const processedEntry: ProcessedUserStory = {
      ref: entry.ref,
      subject: entry.subject,
      name: entry.name,
      created_date: entry.created_date,
      modified_date: entry.modified_date,
      status: entry.status,
      age_in_months: ageInMonths,
      is_old: isOld
    };

    // Solo mantener la entrada más reciente para cada user story (por ref)
    if (!uniqueUserStories.has(entry.ref) || 
        new Date(entry.created_date) > new Date(uniqueUserStories.get(entry.ref)!.created_date)) {
      uniqueUserStories.set(entry.ref, processedEntry);
    }
  });

  // Convertir a arrays y ordenar por fecha (más antiguas primero)
  const allUserStories = Array.from(uniqueUserStories.values());
  allUserStories.sort((a, b) => new Date(a.created_date).getTime() - new Date(b.created_date).getTime());

  // Separar por edad
  const oldUserStories = allUserStories.filter(us => us.is_old);
  const recentUserStories = allUserStories.filter(us => !us.is_old);

  return {
    current_year: currentYear,
    total_user_stories: allUserStories.length,
    old_user_stories: oldUserStories,
    recent_user_stories: recentUserStories,
    ignored_previous_year: ignoredPreviousYear
  };
}

/**
 * Genera el timeline completo con todos los cambios de estado
 */
function generateCompleteTimeline(historialData: HistorialEntry[]): CompleteTimeline {
  console.log('🔍 [TIMELINE] Generando timeline completo...');
  
  // Agrupar cambios por referencia de HU
  const changesByRef = new Map<number, HistorialEntry[]>();
  
  historialData.forEach(entry => {
    if (!changesByRef.has(entry.ref)) {
      changesByRef.set(entry.ref, []);
    }
    changesByRef.get(entry.ref)!.push(entry);
  });
  
  console.log(`📊 [TIMELINE] HUs únicas encontradas: ${changesByRef.size}`);
  
  const allChanges: StateChange[] = [];
  const changesByRefObj: { [ref: number]: StateChange[] } = {};
  
  // Procesar cada HU
  changesByRef.forEach((entries, ref) => {
    // Ordenar entradas por fecha (más antiguo primero)
    const sortedEntries = entries.sort((a, b) => 
      new Date(a.modified_date).getTime() - new Date(b.modified_date).getTime()
    );
    
    const stateChanges: StateChange[] = sortedEntries.map((entry, index) => ({
      ref: entry.ref,
      subject: entry.subject,
      status: entry.status || 'Sin Estado',
      modified_date: entry.modified_date,
      created_date: entry.created_date,
      change_id: index + 1,
      is_first: index === 0,
      is_last: index === sortedEntries.length - 1
    }));
    
    changesByRefObj[ref] = stateChanges;
    allChanges.push(...stateChanges);
  });
  
  const completeTimeline: CompleteTimeline = {
    total_changes: allChanges.length,
    total_user_stories: changesByRef.size,
    changes_by_ref: changesByRefObj,
    all_changes: allChanges
  };
  
  console.log(`✅ [TIMELINE] Timeline generado: ${completeTimeline.total_changes} cambios en ${completeTimeline.total_user_stories} HUs`);
  
  return completeTimeline;
}

/**
 * Genera reportes en diferentes formatos
 */
function generateReports(processedData: ProcessedHistorial, jsonDir: string, txtDir: string) {
  console.log('\n📊 [REPORT] Generando reportes...');

  // 1. Reporte general en JSON
  const reportPath = path.join(jsonDir, 'user_stories_report.json');
  fs.writeFileSync(reportPath, JSON.stringify(processedData, null, 2), 'utf-8');
  console.log(`✅ [REPORT] Reporte general: ${reportPath}`);

  // 2. User Stories antiguas (> 5 meses)
  const oldStoriesPath = path.join(jsonDir, 'old_user_stories.json');
  fs.writeFileSync(oldStoriesPath, JSON.stringify(processedData.old_user_stories, null, 2), 'utf-8');
  console.log(`✅ [REPORT] User Stories antiguas: ${oldStoriesPath}`);

  // 3. User Stories recientes (≤ 5 meses)
  const recentStoriesPath = path.join(jsonDir, 'recent_user_stories.json');
  fs.writeFileSync(recentStoriesPath, JSON.stringify(processedData.recent_user_stories, null, 2), 'utf-8');
  console.log(`✅ [REPORT] User Stories recientes: ${recentStoriesPath}`);

  // 4. Reporte en texto plano
  const textReportPath = path.join(txtDir, 'user_stories_summary.txt');
  
  // Clasificar user stories recientes por estado
  const recentByStatus = new Map<string, ProcessedUserStory[]>();
  processedData.recent_user_stories.forEach(us => {
    const status = us.status || 'Sin Estado';
    if (!recentByStatus.has(status)) {
      recentByStatus.set(status, []);
    }
    recentByStatus.get(status)!.push(us);
  });

  // Generar secciones por estado con agrupación por meses
  const recentSections: string[] = [];
  const allStatuses = Array.from(recentByStatus.keys());
  
  // Separar estados "Done" de los demás
  const doneStatuses = allStatuses.filter(status => status.toLowerCase().includes('done'));
  const otherStatuses = allStatuses.filter(status => !status.toLowerCase().includes('done'));
  
  // Ordenar estados: primero los que no son "Done", luego los "Done"
  const sortedStatuses = [...otherStatuses.sort(), ...doneStatuses.sort()];
  
  sortedStatuses.forEach((status, index) => {
    const stories = recentByStatus.get(status)!;
    const storiesByMonth = groupByMonth(stories);
    
    // Agregar separador antes de los estados "Done"
    if (doneStatuses.includes(status) && index === sortedStatuses.indexOf(doneStatuses[0])) {
      recentSections.push('');
      recentSections.push('  🏁 === USER STORIES COMPLETADAS ===');
      recentSections.push('');
    }
    
    recentSections.push(`  📌 ${status} (${stories.length}):`);
    
    storiesByMonth.forEach(monthGroup => {
      recentSections.push(`    📅 ${monthGroup.month} ${monthGroup.year} (${monthGroup.stories.length}):`);
      monthGroup.stories.forEach(us => {
        recentSections.push(
          `      - Ref: ${us.ref} | ${us.subject} | Creada: ${us.created_date} | Edad: ${us.age_in_months} meses`
        );
      });
      recentSections.push(''); // Línea en blanco entre meses
    });
  });

  const textReport = [
    `=== REPORTE DE USER STORIES ===`,
    `Fecha de procesamiento: ${new Date().toISOString()}`,
    `Año actual: ${processedData.current_year}`,
    ``,
    `📈 ESTADÍSTICAS GENERALES:`,
    `- Total User Stories únicas: ${processedData.total_user_stories}`,
    `- User Stories antiguas (>5 meses): ${processedData.old_user_stories.length}`,
    `- User Stories recientes (≤5 meses): ${processedData.recent_user_stories.length}`,
    `- Entradas ignoradas (año anterior): ${processedData.ignored_previous_year}`,
    ``,
    `📋 USER STORIES ANTIGUAS (>5 meses):`,
    ...processedData.old_user_stories.map(us => 
      `- Ref: ${us.ref} | ${us.subject} | Creada: ${us.created_date} | Edad: ${us.age_in_months} meses | Estado: ${us.status || 'N/A'}`
    ),
    ``,
    `📋 USER STORIES RECIENTES (≤5 meses) - CLASIFICADAS POR ESTADO:`,
    ...recentSections
  ].join('\n');

  fs.writeFileSync(textReportPath, textReport, 'utf-8');
  console.log(`✅ [REPORT] Resumen en texto: ${textReportPath}`);

  // 5. Reporte de historial cronológico de user stories recientes
  const historyReportPath = path.join(txtDir, 'user_stories_history.txt');
  
  // Ordenar user stories recientes: primero las que no están "Done", luego las "Done"
  const doneStories = processedData.recent_user_stories.filter(us => 
    us.status && us.status.toLowerCase().includes('done')
  );
  const otherStories = processedData.recent_user_stories.filter(us => 
    !us.status || !us.status.toLowerCase().includes('done')
  );
  
  // Ordenar cada grupo por fecha de creación (más antigua primero)
  const sortedOtherStories = otherStories.sort((a, b) => 
    new Date(a.created_date).getTime() - new Date(b.created_date).getTime()
  );
  const sortedDoneStories = doneStories.sort((a, b) => 
    new Date(a.created_date).getTime() - new Date(b.created_date).getTime()
  );
  
  // Combinar: primero las que no están "Done", luego las "Done"
  const sortedRecentStories = [...sortedOtherStories, ...sortedDoneStories];

  const historyReport = [
    `=== HISTORIAL CRONOLÓGICO DE USER STORIES RECIENTES ===`,
    `Fecha de procesamiento: ${new Date().toISOString()}`,
    `Año actual: ${processedData.current_year}`,
    `Total User Stories recientes: ${processedData.recent_user_stories.length}`,
    ``,
    `📋 HISTORIAL ORDENADO POR FECHA DE CREACIÓN (MÁS ANTIGUA → MÁS RECIENTE):`,
    ...sortedRecentStories.map((us, index) => {
      const sections = [
        `${index + 1}. Ref: ${us.ref} | ${us.subject}`,
        `   📅 Creada: ${us.created_date}`,
        `   📊 Estado actual: ${us.status || 'Sin Estado'}`,
        `   ⏰ Edad: ${us.age_in_months} meses`,
        `   📝 Última modificación: ${us.modified_date}`,
        ``
      ];
      
      // Agregar separador antes de la primera user story "Done"
      if (us.status && us.status.toLowerCase().includes('done') && 
          index === sortedRecentStories.findIndex(story => story.status && story.status.toLowerCase().includes('done'))) {
        sections.unshift('', '🏁 === USER STORIES COMPLETADAS ===', '');
      }
      
      return sections.join('\n');
    })
  ].join('\n');

  fs.writeFileSync(historyReportPath, historyReport, 'utf-8');
  console.log(`✅ [REPORT] Historial cronológico: ${historyReportPath}`);

  // 6. Reporte detallado de cambios de estado de user stories recientes
  const detailedHistoryReportPath = path.join(txtDir, 'user_stories_detailed_history.txt');
  
  try {
    // Leer el archivo historial.json original
    const historialPath = path.join(process.cwd(), 'src', 'outputs', 'json', 'historial.json');
    if (fs.existsSync(historialPath)) {
      const historialContent = fs.readFileSync(historialPath, 'utf-8');
      const historialData: HistorialEntry[] = JSON.parse(historialContent);
      
      // Crear mapa de historial por ref
      const historialByRef = new Map<number, HistorialEntry[]>();
      historialData.forEach(entry => {
        if (!historialByRef.has(entry.ref)) {
          historialByRef.set(entry.ref, []);
        }
        historialByRef.get(entry.ref)!.push(entry);
      });

      const detailedHistoryReport = [
        `=== HISTORIAL DETALLADO DE CAMBIOS DE ESTADO - USER STORIES RECIENTES ===`,
        `Fecha de procesamiento: ${new Date().toISOString()}`,
        `Año actual: ${processedData.current_year}`,
        `Total User Stories recientes: ${processedData.recent_user_stories.length}`,
        ``,
        `📋 CAMBIOS DE ESTADO ORDENADOS POR FECHA DE CREACIÓN (MÁS ANTIGUA → MÁS RECIENTE):`,
        ...sortedRecentStories.map((us, index) => {
          const historial = historialByRef.get(us.ref) || [];
          const sortedHistorial = historial.sort((a, b) => 
            new Date(a.created_date).getTime() - new Date(b.created_date).getTime()
          );
          
          const sections = [
            `${index + 1}. Ref: ${us.ref} | ${us.subject}`,
            `   📅 Creada: ${us.created_date}`,
            `   📊 Estado actual: ${us.status || 'Sin Estado'}`,
            `   ⏰ Edad: ${us.age_in_months} meses`,
            `   📝 Última modificación: ${us.modified_date}`,
            `   🔄 Cambios de estado (${sortedHistorial.length}):`,
            ...sortedHistorial.map((entry, histIndex) => 
              `      ${histIndex + 1}. ${entry.created_date} → ${entry.status || 'Sin Estado'}`
            ),
            ``
          ];
          
          // Agregar separador antes de la primera user story "Done"
          if (us.status && us.status.toLowerCase().includes('done') && 
              index === sortedRecentStories.findIndex(story => story.status && story.status.toLowerCase().includes('done'))) {
            sections.unshift('', '🏁 === USER STORIES COMPLETADAS ===', '');
          }
          
          return sections.join('\n');
        })
      ].join('\n');

      fs.writeFileSync(detailedHistoryReportPath, detailedHistoryReport, 'utf-8');
      console.log(`✅ [REPORT] Historial detallado: ${detailedHistoryReportPath}`);
    } else {
      console.log(`⚠️ [REPORT] No se encontró el archivo historial.json para generar el reporte detallado`);
    }
  } catch (error) {
    console.error(`❌ [REPORT] Error al generar reporte detallado:`, error);
  }
}

/**
 * Función principal del script
 */
async function main() {
  try {
    console.log('🔍 [PROCESS] Iniciando procesamiento del historial...');

    // Verificar que existe el archivo de historial
    const historialPath = path.join(process.cwd(), 'src', 'outputs', 'json', 'historial.json');
    
    if (!fs.existsSync(historialPath)) {
      throw new Error(`No se encontró el archivo historial.json en ${historialPath}`);
    }

    // Leer el archivo de historial
    console.log(`📖 [PROCESS] Leyendo archivo: ${historialPath}`);
    const historialContent = fs.readFileSync(historialPath, 'utf-8');
    const historialData: HistorialEntry[] = JSON.parse(historialContent);

    console.log(`📊 [PROCESS] Entradas encontradas en historial: ${historialData.length}`);

    // Procesar el historial
    const processedData = processHistorial(historialData);

    // Generar timeline completo
    const completeTimeline = generateCompleteTimeline(historialData);

    // Mostrar estadísticas
    console.log('\n📈 [PROCESS] Estadísticas del procesamiento:');
    console.log(`- Total User Stories únicas: ${processedData.total_user_stories}`);
    console.log(`- User Stories antiguas (>5 meses): ${processedData.old_user_stories.length}`);
    console.log(`- User Stories recientes (≤5 meses): ${processedData.recent_user_stories.length}`);
    console.log(`- Entradas ignoradas (año anterior): ${processedData.ignored_previous_year}`);
    console.log(`- Total cambios de estado: ${completeTimeline.total_changes}`);

    // Generar reportes
    const outputDir = path.join(process.cwd(), 'src', 'outputs');
    const jsonDir = path.join(outputDir, 'json');
    const txtDir = path.join(outputDir, 'txt');
    
    // Crear carpetas si no existen
    if (!fs.existsSync(jsonDir)) {
      fs.mkdirSync(jsonDir, { recursive: true });
    }
    if (!fs.existsSync(txtDir)) {
      fs.mkdirSync(txtDir, { recursive: true });
    }
    
    generateReports(processedData, jsonDir, txtDir);
    
    // Generar archivo JSON del timeline completo
    const timelinePath = path.join(jsonDir, 'complete_timeline.json');
    fs.writeFileSync(timelinePath, JSON.stringify(completeTimeline, null, 2), 'utf-8');
    console.log(`✅ [TIMELINE] Timeline completo guardado: ${timelinePath}`);

    console.log('\n✅ [PROCESS] Procesamiento completado exitosamente!');

  } catch (error) {
    console.error('❌ [PROCESS] Error en el procesamiento:', error);
    process.exit(1);
  }
}

// Ejecutar si es el archivo principal
if (require.main === module) {
  main().catch(console.error);
}

export { processHistorial, generateReports, ProcessedUserStory, ProcessedHistorial }; 