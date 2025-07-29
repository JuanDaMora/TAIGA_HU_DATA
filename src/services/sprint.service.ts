import * as https from 'https';
import 'dotenv/config';
import { Sprints } from '../interfaces/consulta_sprint.interface';

/**
 * Obtiene todos los sprints para un proyecto dado.
 */
export function fetchSprints(): Promise<Sprints[]> {
  return new Promise((resolve, reject) => {
    const HOST_NAME = process.env.HOST_NAME || '';
    const TOKEN = process.env.TOKEN || '';
    const PROYECT_TAIGA = process.env.PROYECT_TAIGA || '';

    // Ejemplo de filtrado para no traer sprints cerrados
    const params = {
      closed: 'false',
      project: PROYECT_TAIGA,
    };

    const queryString = new URLSearchParams(params).toString();
    const fullUrl = `https://${HOST_NAME}/api/v1/milestones?${queryString}`;

    const options: https.RequestOptions = {
      hostname: HOST_NAME,
      path: `/api/v1/milestones?${queryString}`,
      method: 'GET',
      headers: {
        Authorization: TOKEN,
        'Content-Type': 'application/json',
        'User-Agent': 'Taiga-HU-States/1.0.0',
      },
      // Configuración para manejar certificados SSL
      rejectUnauthorized: false, // Permite certificados autofirmados/expirados
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
                  if (res.statusCode !== 200) {
            console.error(`❌ [SPRINT SERVICE] Error HTTP: ${res.statusCode}`);
            reject(new Error(`HTTP Error ${res.statusCode}: ${data}`));
            return;
          }

        try {
          const json = JSON.parse(data);
          console.log(`✅ [SPRINT SERVICE] Sprints obtenidos exitosamente: ${Array.isArray(json) ? json.length : 0} sprints`);
          resolve(json as Sprints[]);
        } catch (error) {
          console.error(`❌ [SPRINT SERVICE] Error al parsear JSON:`, error);
          reject(new Error('Error al parsear JSON en fetchSprints: ' + (error as Error).message));
        }
      });
    });

    req.on('error', (error) => {
      console.error(`❌ [SPRINT SERVICE] Error de conexión:`, error);
      reject(error);
    });

    req.on('timeout', () => {
      console.error(`⏰ [SPRINT SERVICE] Timeout de la petición`);
      req.destroy();
      reject(new Error('Timeout de la petición HTTP'));
    });

    // Configurar timeout
    req.setTimeout(30000); // 30 segundos

    req.end();
  });
}
