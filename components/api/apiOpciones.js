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

module.exports = { opMenuInicial,opMenuInstructivos,opcionesInstructivos }