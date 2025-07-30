import * as fs from 'fs';
import * as path from 'path';

// Configuración y utilidades
import { config } from './config';
import { FILE_PATHS } from './constants';
import { ensureDirectoryExists } from './utils';

// Tipos
import { Sprints, Hu, HistorialEntry, HistorialJSON } from './types';

// Servicios
import { fetchSprints } from './services/sprint.service';
import { fetchUserStoryHistory } from './services/userStory.service';

async function main() {
  try {
    // 1) Validar configuración
    config.validate();
    
    const projectTaiga = parseInt(config.env.PROYECT_TAIGA, 10);

    // 2) Obtenemos todos los sprints
    const allSprints: Sprints[] = await fetchSprints();

    // 3) Filtramos los sprints del proyecto
    const filteredSprints = allSprints.filter((sprint) => sprint.project === projectTaiga);

    // Arreglos auxiliares
    const logData: string[] = [];
    const userStoryIds: number[] = [];

    // Mapeo ID -> { ref, subject, modified_date }
    const userStoryMeta = new Map<number, { ref: number; subject: string; modified_date: Date }>();

    // 4) Recorrer los sprints filtrados
    filteredSprints.forEach((sprint) => {
      logData.push(`Sprint ID: ${sprint.id} - ${sprint.name}`);

      sprint.user_stories.forEach((us) => {
        logData.push(`  - User Story ref: ${us.ref} | subject: ${us.subject}`);
        userStoryIds.push(us.id);

        userStoryMeta.set(us.id, { 
          ref: us.ref, 
          subject: us.subject, 
          modified_date: us.modified_date 
        });
      });
    });

    // 5) Prepara carpetas de salida
    const outputDir = path.join(process.cwd(), FILE_PATHS.OUTPUTS);
    const jsonDir = path.join(process.cwd(), FILE_PATHS.JSON_OUTPUT);
    const txtDir = path.join(process.cwd(), FILE_PATHS.TXT_OUTPUT);
    
    ensureDirectoryExists(outputDir);
    ensureDirectoryExists(jsonDir);
    ensureDirectoryExists(txtDir);

    // 6) Guardar log de sprints
    fs.writeFileSync(path.join(txtDir, 'sprints_log.txt'), logData.join('\n'), 'utf-8');

    // 7) Guardar IDs de user stories
    fs.writeFileSync(path.join(txtDir, 'user_story_ids.txt'), userStoryIds.join('\n'), 'utf-8');

    console.log('Archivos generados en carpeta outputs:');
    console.log('  📁 txt/sprints_log.txt');
    console.log('  📁 txt/user_story_ids.txt');

    // 8) Consultar historial de cada User Story
    const historyLines: string[] = [];
    const historialJSON: HistorialJSON = [];

    for (const userStoryId of userStoryIds) {
      try {
        const history = await fetchUserStoryHistory(userStoryId);

        // if(userStoryId == 6311)console.log(history);
        // Rescatar metadatos (ref, subject, modified_date)
        const meta = userStoryMeta.get(userStoryId) || { ref: 0, subject: 'Desconocida', modified_date: new Date() };
        const { ref: storyRef, subject: storySubject, modified_date: storyModifiedDate } = meta;

        // Extraer fecha y estado
        history.forEach((hu: Hu) => {
          const date = hu.created_at;
          
          // Buscar cambios de estado en values_diff.status
          const statusDiff = hu.values_diff?.status;
          const statusObj = hu.values?.status;

          if (statusDiff && statusDiff.length >= 2) {
            // statusDiff[0] = estado anterior, statusDiff[1] = estado nuevo
            const statusName = statusDiff[1]; // Tomamos el estado nuevo
            historyLines.push(
              `Story ref: ${storyRef} - ${storySubject} | Date: ${date} | Status: ${statusName}`
            );

            // Agregar entrada al JSON
            const historialEntry: HistorialEntry = {
              created_date: new Date(date).toISOString().split('T')[0], // Formato YYYY-MM-DD
              modified_date: new Date(storyModifiedDate).toISOString().split('T')[0], // Formato YYYY-MM-DD
              name: `${storyRef} - ${storySubject}`,
              ref: storyRef,
              subject: storySubject,
              status: statusName
            };
            historialJSON.push(historialEntry);
          } else if (statusObj) {
            // Fallback: buscar en values.status si no hay diff
            const [statusId] = Object.keys(statusObj);
            const statusName = statusObj[statusId];
            historyLines.push(
              `Story ref: ${storyRef} - ${storySubject} | Date: ${date} | Status: ${statusName}`
            );

            // Agregar entrada al JSON
            const historialEntry: HistorialEntry = {
              created_date: new Date(date).toISOString().split('T')[0], // Formato YYYY-MM-DD
              modified_date: new Date(storyModifiedDate).toISOString().split('T')[0], // Formato YYYY-MM-DD
              name: `${storyRef} - ${storySubject}`,
              ref: storyRef,
              subject: storySubject,
              status: statusName
            };
            historialJSON.push(historialEntry);
          }
        });
      } catch (error) {
        console.error(`Error consultando historia de la User Story #${userStoryId}:`, error);
      }
    }

    // 9) Guardar historial en archivo de texto
    fs.writeFileSync(
      path.join(txtDir, 'historial_estados.txt'),
      historyLines.join('\n'),
      'utf-8'
    );

    // 10) Guardar historial en archivo JSON
    fs.writeFileSync(
      path.join(jsonDir, 'historial.json'),
      JSON.stringify(historialJSON, null, 2),
      'utf-8'
    );

    console.log('  📁 txt/historial_estados.txt');
    console.log('  📁 json/historial.json');

  } catch (error) {
    console.error('Error en main:', error);
    process.exit(1);
  }
}

// Ejecutar
main();
