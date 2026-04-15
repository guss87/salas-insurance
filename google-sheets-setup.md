# Conectar formulario → Google Sheets
## Instrucciones (5 minutos, sin código)

---

### Paso 1 — Crea la Google Sheet

1. Ve a [sheets.google.com](https://sheets.google.com) con la cuenta de Fernando
2. Crea una hoja nueva y ponle nombre: **Leads — Salas Insurance**
3. En la fila 1 agrega estos encabezados exactos (una columna por celda):

```
Fecha/Hora | Nombre | Teléfono | Email | Estado | Tipo de Seguro | Personas | Mensaje | Idioma | Fuente
```

---

### Paso 2 — Crea el Apps Script

1. Desde la misma Sheet, ve al menú: **Extensiones → Apps Script**
2. Borra todo el código que aparece y pega esto:

```javascript
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    sheet.appendRow([
      data.timestamp  || '',
      data.nombre     || '',
      data.telefono   || '',
      data.email      || '',
      data.estado     || '',
      data.seguro     || '',
      data.personas   || '',
      data.mensaje    || '',
      data.idioma     || '',
      data.fuente     || ''
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ result: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch(err) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'error', error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

3. Haz clic en **Guardar** (ícono de disquete)

---

### Paso 3 — Despliega como Web App

1. Clic en **Implementar → Nueva implementación**
2. Tipo: **Aplicación web**
3. Configuración:
   - **Ejecutar como:** Yo (tu cuenta de Google)
   - **Quién tiene acceso:** Cualquier persona (Anyone)
4. Clic en **Implementar**
5. Acepta los permisos que pide Google
6. **Copia la URL** que aparece — se ve así:
   ```
   https://script.google.com/macros/s/XXXXXXXXXXXXXXXXXX/exec
   ```

---

### Paso 4 — Pega la URL en el sitio

1. Abre el archivo `main.js` del proyecto
2. Busca esta línea (al principio del archivo):
   ```javascript
   const SHEETS_WEBHOOK_URL = 'PASTE_YOUR_APPS_SCRIPT_URL_HERE';
   ```
3. Reemplaza `PASTE_YOUR_APPS_SCRIPT_URL_HERE` con la URL que copiaste
4. Guarda el archivo y haz `git push` para actualizar el sitio

---

### Resultado

Cada vez que alguien llene el formulario del sitio, aparecerá una nueva fila en la Google Sheet con:
- Fecha y hora exacta (zona horaria ET)
- Nombre, teléfono, email
- Estado, tipo de seguro, personas
- Idioma preferido (Español / English)
- Fuente: "Sitio Web"

El lead también llega por WhatsApp como antes — **doble captura**.
