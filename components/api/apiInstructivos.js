const { getInstructivo,addProps } = require("./apiTickets")
const { respuesta,respuestaConDelay } = require("./apiMensajes")
const { opMenuInstructivos } = require("./apiOpciones")

const sendFile = async (from, body, provider) => {

    const instructivo = getInstructivo(from, body);

    let prov = provider.getInstance();

    if(!instructivo) {
      await prov.sendMessage(`${from}@s.whatsapp.net`,{text:`Opción incorrecta. Envie "sigesbot" para volver a comenzar.`})
      return false
    }

    await respuesta(from,provider,"Adjuntando el instructivo solicitado")
  
    const filenameWithoutNumber = instructivo.filename.replace(/^\d+\.\s*/, '');
  
    const filenameWithoutExtension = filenameWithoutNumber.replace(/\.pdf$/, '');
  
    await prov.sendMessage(`${from}@s.whatsapp.net`, {
      document: { url: instructivo.path },
      fileName: filenameWithoutExtension,
    });

    return false

  };

  module.exports = {sendFile}