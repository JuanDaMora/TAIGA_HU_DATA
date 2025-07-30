import * as https from 'https';
import 'dotenv/config';

/**
 * Archivo de debug para probar peticiones HTTP de forma aislada
 * Uso: yarn build && node dist/debug-requests.js
 */

interface DebugOptions {
  hostname: string;
  path: string;
  method: string;
  headers: Record<string, string>;
  rejectUnauthorized?: boolean;
}

function makeDebugRequest(options: DebugOptions): Promise<any> {
  return new Promise((resolve, reject) => {
    console.log('🔍 [DEBUG] Iniciando petición de prueba...');
    console.log(`📍 Host: ${options.hostname}`);
    console.log(`🛣️  Path: ${options.path}`);
    console.log(`📋 Headers: ${JSON.stringify(options.headers, null, 2)}`);
    console.log(`🔒 SSL Reject Unauthorized: ${options.rejectUnauthorized}`);

    const httpsOptions: https.RequestOptions = {
      hostname: options.hostname,
      path: options.path,
      method: options.method,
      headers: options.headers,
      rejectUnauthorized: options.rejectUnauthorized || false,
    };

    const req = https.request(httpsOptions, (res) => {
      console.log(`📥 [DEBUG] Respuesta recibida:`);
      console.log(`   Status: ${res.statusCode} ${res.statusMessage}`);
      console.log(`   Headers: ${JSON.stringify(res.headers, null, 2)}`);
      
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
        console.log(`📦 [DEBUG] Chunk recibido: ${chunk.length} bytes`);
      });

      res.on('end', () => {
        console.log(`✅ [DEBUG] Respuesta completa: ${data.length} bytes total`);
        
        if (res.statusCode !== 200) {
          console.error(`❌ [DEBUG] Error HTTP: ${res.statusCode}`);
          console.error(`📄 [DEBUG] Respuesta de error: ${data}`);
          reject(new Error(`HTTP Error ${res.statusCode}: ${data}`));
          return;
        }

        try {
          const json = JSON.parse(data);
          console.log(`🎯 [DEBUG] JSON parseado exitosamente`);
          console.log(`📊 [DEBUG] Tipo de respuesta: ${Array.isArray(json) ? 'Array' : typeof json}`);
          console.log(`📊 [DEBUG] Tamaño: ${Array.isArray(json) ? json.length : 'N/A'}`);
          
          if (Array.isArray(json) && json.length > 0) {
            console.log(`📋 [DEBUG] Primer elemento: ${JSON.stringify(json[0], null, 2)}`);
          } else if (typeof json === 'object') {
            console.log(`📋 [DEBUG] Respuesta: ${JSON.stringify(json, null, 2)}`);
          }
          
          resolve(json);
        } catch (error) {
          console.error(`❌ [DEBUG] Error al parsear JSON:`, error);
          console.error(`📄 [DEBUG] Datos recibidos: ${data.substring(0, 500)}...`);
          reject(new Error('Error al parsear JSON: ' + (error as Error).message));
        }
      });
    });

    req.on('error', (error) => {
      console.error(`❌ [DEBUG] Error de conexión:`, error);
      console.error(`🔍 [DEBUG] Detalles del error:`, {
        code: (error as any).code,
        message: error.message,
        stack: error.stack
      });
      reject(error);
    });

    req.on('timeout', () => {
      console.error(`⏰ [DEBUG] Timeout de la petición`);
      req.destroy();
      reject(new Error('Timeout de la petición HTTP'));
    });

    req.setTimeout(30000);
    req.end();
  });
}

async function testSprintRequest() {
  console.log('\n🚀 === PRUEBA DE PETICIÓN DE SPRINTS ===\n');
  
  const HOST_NAME = process.env.HOST_NAME || '';
  const TOKEN = process.env.TOKEN || '';
  const PROYECT_TAIGA = process.env.PROYECT_TAIGA || '';

  if (!HOST_NAME || !TOKEN || !PROYECT_TAIGA) {
    console.error('❌ Variables de entorno faltantes');
    console.log('HOST_NAME:', HOST_NAME ? '✅' : '❌');
    console.log('TOKEN:', TOKEN ? '✅' : '❌');
    console.log('PROYECT_TAIGA:', PROYECT_TAIGA ? '✅' : '❌');
    return;
  }

  const params = {
    closed: 'false',
    project: PROYECT_TAIGA,
  };

  const queryString = new URLSearchParams(params).toString();
  const path = `/api/v1/milestones?${queryString}`;

  try {
    const result = await makeDebugRequest({
      hostname: HOST_NAME,
      path: path,
      method: 'GET',
      headers: {
        Authorization: TOKEN,
        'Content-Type': 'application/json',
        'User-Agent': 'Taiga-HU-States-Debug/1.0.0',
      },
      rejectUnauthorized: false,
    });

    console.log('\n✅ [DEBUG] Petición de sprints exitosa');
    console.log(`📊 [DEBUG] Sprints encontrados: ${Array.isArray(result) ? result.length : 'N/A'}`);
    
  } catch (error) {
    console.error('\n❌ [DEBUG] Error en petición de sprints:', error);
  }
}

async function testUserStoryRequest() {
  console.log('\n🚀 === PRUEBA DE PETICIÓN DE USER STORY ===\n');
  
  const HOST_NAME = process.env.HOST_NAME || '';
  const TOKEN = process.env.TOKEN || '';

  if (!HOST_NAME || !TOKEN) {
    console.error('❌ Variables de entorno faltantes para User Story');
    return;
  }

  // Usar un ID de ejemplo (deberías reemplazar con un ID real)
  const userStoryId = 123; // Cambia este ID por uno real de tu proyecto
  const path = `/api/v1/history/userstory/${userStoryId}?page=1&type=activity`;

  try {
    const result = await makeDebugRequest({
      hostname: HOST_NAME,
      path: path,
      method: 'GET',
      headers: {
        Authorization: TOKEN,
        'Content-Type': 'application/json',
        'User-Agent': 'Taiga-HU-States-Debug/1.0.0',
      },
      rejectUnauthorized: false,
    });

    console.log('\n✅ [DEBUG] Petición de User Story exitosa');
    console.log(`📊 [DEBUG] Entradas de historial: ${Array.isArray(result) ? result.length : 'N/A'}`);
    
  } catch (error) {
    console.error('\n❌ [DEBUG] Error en petición de User Story:', error);
  }
}

async function testConnection() {
  console.log('\n🚀 === PRUEBA DE CONEXIÓN BÁSICA ===\n');
  
  const HOST_NAME = process.env.HOST_NAME || '';

  if (!HOST_NAME) {
    console.error('❌ HOST_NAME no definido');
    return;
  }

  try {
    const result = await makeDebugRequest({
      hostname: HOST_NAME,
      path: '/api/v1/projects',
      method: 'GET',
      headers: {
        'User-Agent': 'Taiga-HU-States-Debug/1.0.0',
      },
      rejectUnauthorized: false,
    });

    console.log('\n✅ [DEBUG] Conexión básica exitosa');
    console.log(`📊 [DEBUG] Proyectos disponibles: ${Array.isArray(result) ? result.length : 'N/A'}`);
    
  } catch (error) {
    console.error('\n❌ [DEBUG] Error en conexión básica:', error);
  }
}

async function main() {
  console.log('🔧 === HERRAMIENTA DE DEBUG DE PETICIONES ===\n');
  
  // Verificar variables de entorno
  console.log('📋 Variables de entorno:');
  console.log('HOST_NAME:', process.env.HOST_NAME || '❌ No definido');
  console.log('TOKEN:', process.env.TOKEN ? '✅ Definido' : '❌ No definido');
  console.log('PROYECT_TAIGA:', process.env.PROYECT_TAIGA || '❌ No definido');
  
  // Ejecutar pruebas
  await testConnection();
  await testSprintRequest();
  await testUserStoryRequest();
  
  console.log('\n🏁 === FIN DE PRUEBAS ===');
}

// Ejecutar si es el archivo principal
if (require.main === module) {
  main().catch(console.error);
}

export { makeDebugRequest, testSprintRequest, testUserStoryRequest, testConnection }; 