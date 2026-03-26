import * as XLSX from "xlsx";

/**
 * Lee y parsea un archivo Excel, devolviendo un array de objetos según el mapeo de columnas.
 * @param {File} file - Archivo Excel (.xlsx, .xls)
 * @param {Object} options - Opciones de mapeo y validación
 * @param {Array<string>} options.requiredHeaders - Encabezados requeridos (ej: ["CODIGO", "CANTIDAD"])
 * @param {function(Array<string>, Array<any>): any} options.rowMapper - Función que recibe (headers, row) y retorna el objeto a agregar
 * @returns {Promise<Array<any>>}
 */
export async function importExcelFile(file, { requiredHeaders, rowMapper }) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        const headers = rows[0] || [];
        // Validar encabezados requeridos
        const missing = requiredHeaders.filter(h => !headers.some(col => col && col.toString().toLowerCase().includes(h.toLowerCase())));
        if (missing.length > 0) {
          reject(new Error(`Faltan columnas requeridas: ${missing.join(", ")}`));
          return;
        }
        const dataRows = rows.slice(1).filter(r => r.length && r.some(cell => cell !== undefined && cell !== null && cell !== ""));
        const result = dataRows.map(row => rowMapper(headers, row)).filter(Boolean);
        resolve(result);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Genera un archivo Excel de ejemplo para importar movimientos.
 * @param {Array<string>} headers - Encabezados (ej: ["CODIGO", "CANTIDAD"])
 * @param {Array<any>} exampleRow - Ejemplo de fila (ej: ["P0001", 10])
 * @param {string} filename - Nombre del archivo a descargar
 */
export function downloadExcelTemplate(headers, exampleRow, filename) {
  const ws = XLSX.utils.aoa_to_sheet([headers, exampleRow]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Modelo");
  XLSX.writeFile(wb, filename);
}
