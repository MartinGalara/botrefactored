const fs = require('fs');
const path = require('path');

const { addProps, getProp } = require("./apiTickets.js")

const opMenuInicial = (from) => {

    const credenciales = getProp(from,'vipuser')

    // aca va logica para renderizar distintas opciones en el menu inicial

    return "1. Descargar un instructivo\n2. Generar un ticket de soporte\n3. Salir"
}

const opMenuInstructivos = (from) => {

    const credenciales = getProp(from,'vipuser')

    // aca va logica para renderizar distintas opciones del menu de instructivos

    return "1. Operación Playa\n2. Operación Tienda\n3. Admin - Contable"
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
            pdfNamesArray.push(`${nextNumber}. Salir`);

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
            return ['Elija el numero del problema que tiene','1. Despachos CIO','2. Aplicaciones','3. Impresora Fiscal / Comandera','4. Impresora Común / Oficina','5. Sistema SIGES','6. Libro IVA','7. Servidor']
    
        case 'obj':
            return {
                1: "Despachos CIO",
                2: "Aplicaciones",
                3: "Impresora Fiscal / Comandera",
                4: "Impresora Común / Oficina",
                5: "Sistema SIGES",
                6: "Libro IVA",
                7: "Servidor"
            }
        
        case 'opciones':
            return ['Despachos CIO','Aplicaciones','Impresora Fiscal / Comandera','Impresora Común / Oficina','Sistema SIGES','Libro IVA','Servidor']
        
        default:
            break;
    }
}

module.exports = { opMenuInicial,opMenuInstructivos,opcionesInstructivos,computerOptions,opMenuProblemas }