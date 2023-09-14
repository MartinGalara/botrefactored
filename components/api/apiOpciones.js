const fs = require('fs');
const path = require('path');

const { addProps, getProp } = require("./apiTickets.js")

const opMenuInicial = (from) => {
    const creds = getProp(from, 'creds');
    let options = "";

    if (creds.canSOS) {
        options += "0. Generar un ticket *SOS*\n";
    }

    options += "1. Descargar un instructivo\n";

    options += "2. Generar un ticket de soporte\n";

    if (creds.createUser) {
        options += "3. Dar de alta nuevo usuario\n";
    }

    options += "O envie *salir* para finalizar la conversacion\n";

    return options.trim(); // Eliminar espacios en blanco adicionales al final
}


const opMenuInstructivos = (from) => {

    const creds = getProp(from,'creds')

    let options = "";

    options += "1. Operación Playa\n";

    options += "2. Operación Tienda\n";

    if (creds.adminPdf) {
        options += "3. Admin - Contable";
    }

    return options.trim(); // Eliminar espacios en blanco adicionales al final
}

const opcionesInstructivos = (from) => {
    const categoria = getProp(from, "categoria");
    const mediaFolderPath = path.join(__dirname, `../media/${categoria}`);

    return new Promise((resolve, reject) => {
        // Leer el contenido de la carpeta "media"
        fs.readdir(mediaFolderPath, (err, files) => {
            if (err) {
                console.error('Error al leer la carpeta media:', err);
                reject(err);
                return;
            }

            // Filtrar los archivos PDF
            const pdfFiles = files.filter((file) => path.extname(file).toLowerCase() === '.pdf');

            // Construir el array de objetos con filename y path de los archivos PDF
            const pdfObjects = pdfFiles.map((file) => ({
                filename: file,
                path: path.join(mediaFolderPath, file),
            }));

            // Ordenar el array de objetos en base al número del nombre de archivo
            pdfObjects.sort((a, b) => {
                const numberA = parseInt(a.filename.match(/^\d+/)[0]);
                const numberB = parseInt(b.filename.match(/^\d+/)[0]);
                return numberA - numberB;
            });

            // Aquí tienes el array de objetos con filename y path de los archivos PDF ordenado
            addProps(from, { instructivos: pdfObjects });

            // Copiar los nombres de los PDFs a un array
            const pdfNamesArray = pdfObjects.map((pdfObject) => {
                const filenameWithoutExtension = pdfObject.filename.slice(0, -4);
                return filenameWithoutExtension;
            });

            // Calcular el número para el nuevo elemento
            const nextNumber = pdfNamesArray.length + 1;

            // Agregar el elemento con el formato deseado al array
            pdfNamesArray.push(`${nextNumber}. Volver`);
            pdfNamesArray.push(`${nextNumber+1}. Salir`);

            // Combina los elementos del array en un solo string con saltos de línea
            const resultString = pdfNamesArray.join('\n');

            resolve(resultString);
        });
    });
};

const computerOptions = (from) => {

    const computers = getProp(from,'computers')
  
    if(computers.length === 0) return 'No se encontraron puestos de trabajo registrados en esta zona\nEnvie "0" para continuar'
  
    const array = ['Elija el número del puesto de trabajo donde necesita soporte','Si no lo sabe o ninguno es correcto, envíe "0"']
  
    let i = 1;
    
    computers.map(e => {

    array.push(
        `${i} - ${e.alias}`
    )
    i++;
        
    })

    const opciones = array.join('\n');
    
    return opciones;
  
}

const opMenuProblemas = (string) => {

    switch (string) {
        case 'array':
            return ['Elija el numero del problema que tiene','1. Despachos CIO','2. Apps de Pago y Fidelización','3. Impresora Fiscal / Comandera','4. Impresora Común / Oficina','5. Sistema SIGES','6. Libro IVA','7. Servidor']
    
        case 'obj':
            return {
                1: "Despachos CIO",
                2: "Apps de Pago y Fidelización",
                3: "Impresora Fiscal / Comandera",
                4: "Impresora Común / Oficina",
                5: "Sistema SIGES",
                6: "Libro IVA",
                7: "Servidor"
            }
        
        case 'opciones':
            return ['Despachos CIO','Apps de Pago y Fidelización','Impresora Fiscal / Comandera','Impresora Común / Oficina','Sistema SIGES','Libro IVA','Servidor']
        
        default:
            break;
    }
}

module.exports = { opMenuInicial,opMenuInstructivos,opcionesInstructivos,computerOptions,opMenuProblemas }