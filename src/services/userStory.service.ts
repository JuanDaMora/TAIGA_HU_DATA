import * as https from 'https';
import 'dotenv/config';
import { Hu } from '../interfaces/consulta_status.interface';

/**
 * Obtiene el historial (actividad) de una User Story específica.
 */
export function fetchUserStoryHistory(userStoryId: number): Promise<Hu[]> {
  return new Promise((resolve, reject) => {
    const HOST_NAME = process.env.HOST_NAME || '';
    const TOKEN = process.env.TOKEN || '';

    const page = 1;
    const type = 'activity';
    const requestPath = `/api/v1/history/userstory/${userStoryId}?page=${page}&type=${type}`;
    const fullUrl = `https://${HOST_NAME}${requestPath}`;

    const options: https.RequestOptions = {
      hostname: HOST_NAME,
      path: requestPath,
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
          console.error(`❌ [USER STORY SERVICE] Error HTTP para HU #${userStoryId}: ${res.statusCode}`);
          reject(new Error(`HTTP Error ${res.statusCode}: ${data}`));
          return;
        }

        try {
          const json = JSON.parse(data) as Hu[];
          console.log(`✅ [USER STORY SERVICE] Historial obtenido para HU #${userStoryId}: ${Array.isArray(json) ? json.length : 0} entradas`);
          resolve(json);
        } catch (error) {
          console.error(`❌ [USER STORY SERVICE] Error al parsear JSON para HU #${userStoryId}:`, error);
          reject(new Error('Error al parsear JSON en fetchUserStoryHistory: ' + (error as Error).message));
        }
      });
    });

    req.on('error', (error) => {
      console.error(`❌ [USER STORY SERVICE] Error de conexión para HU #${userStoryId}:`, error);
      reject(error);
    });

    req.on('timeout', () => {
      console.error(`⏰ [USER STORY SERVICE] Timeout de la petición para HU #${userStoryId}`);
      req.destroy();
      reject(new Error('Timeout de la petición HTTP'));
    });

    // Configurar timeout
    req.setTimeout(30000); // 30 segundos

    req.end();
  });
}
