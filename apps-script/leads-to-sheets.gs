/**
 * SALAS INSURANCE GROUP — Google Apps Script
 * Recibe leads del sitio web y los guarda en Google Sheets
 *
 * INSTRUCCIONES DE DEPLOY:
 * 1. Ve a script.google.com → Nuevo proyecto
 * 2. Pega este código completo
 * 3. Implementar → Nueva implementación → Aplicación web
 *    - Ejecutar como: Yo (tu cuenta)
 *    - Acceso: Cualquier persona (Anyone)
 * 4. Copia la URL del endpoint y pégala en main.js → SHEETS_WEBHOOK_URL
 *
 * COLUMNAS DE LA SHEET (fila 1):
 * Fecha/Hora | Nombre | Teléfono | Email | Estado | Tipo de Seguro | Personas | Mensaje | Idioma | Fuente
 */

// ID de tu Google Sheet — cámbialo por el tuyo
// Lo encuentras en la URL: docs.google.com/spreadsheets/d/[ESTE_ID]/edit
var SPREADSHEET_ID = 'PASTE_YOUR_SPREADSHEET_ID_HERE';
var SHEET_NAME = 'Leads';

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName(SHEET_NAME) || ss.getActiveSheet();

    // Si la hoja está vacía, agrega encabezados automáticamente
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'Fecha/Hora', 'Nombre', 'Teléfono', 'Email',
        'Estado', 'Tipo de Seguro', 'Personas',
        'Mensaje', 'Idioma', 'Fuente'
      ]);
      // Formato de encabezados
      var headerRange = sheet.getRange(1, 1, 1, 10);
      headerRange.setBackground('#1B2A4A');
      headerRange.setFontColor('#FFFFFF');
      headerRange.setFontWeight('bold');
    }

    // Agrega el lead como nueva fila
    sheet.appendRow([
      data.timestamp  || new Date().toLocaleString(),
      data.nombre     || '',
      data.telefono   || '',
      data.email      || '—',
      data.estado     || '',
      data.seguro     || '',
      data.personas   || '',
      data.mensaje    || '—',
      data.idioma     || 'Español',
      data.fuente     || 'Sitio Web'
    ]);

    // Resaltar fila nueva para visibilidad
    var lastRow = sheet.getLastRow();
    if (lastRow % 2 === 0) {
      sheet.getRange(lastRow, 1, 1, 10).setBackground('#f0f4f8');
    }

    return ContentService
      .createTextOutput(JSON.stringify({ result: 'success', row: lastRow }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch(err) {
    // Log del error para debugging
    Logger.log('Error: ' + err.toString());
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Función de prueba — ejecuta manualmente desde el editor para verificar
function testDoPost() {
  var fakeEvent = {
    postData: {
      contents: JSON.stringify({
        timestamp: new Date().toLocaleString('es-US', { timeZone: 'America/New_York' }),
        nombre:    'Test Lead',
        telefono:  '(305) 555-0000',
        email:     'test@example.com',
        estado:    'Florida',
        seguro:    'Seguro de Salud (ACA/Obamacare)',
        personas:  'Familia con hijos',
        mensaje:   'Lead de prueba desde el script',
        idioma:    'Español',
        fuente:    'Sitio Web'
      })
    }
  };
  var result = doPost(fakeEvent);
  Logger.log(result.getContent());
}
