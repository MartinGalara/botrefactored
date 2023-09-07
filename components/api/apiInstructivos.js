const { getInstructivo } = require("./apiTickets")

const sendFile = async (from, body, provider) => {

    const instructivo = getInstructivo(from, body);

    let prov = provider.getInstance();

    if(instructivo === "Salir"){
      await prov.sendMessage(`${from}@s.whatsapp.net`,{text:`Gracias por comunicarse con nosotros.`})
      return false
    }

    if(!instructivo) {
      await prov.sendMessage(`${from}@s.whatsapp.net`,{text:`Opción incorrecta. Envie "sigesbot" para volver a comenzar.`})
      return false
    }
  
    const filenameWithoutNumber = instructivo.filename.replace(/^\d+\.\s*/, '');
  
    const filenameWithoutExtension = filenameWithoutNumber.replace(/\.pdf$/, '');
  
    await prov.sendMessage(`${from}@s.whatsapp.net`, {
      document: { url: instructivo.path },
      fileName: filenameWithoutExtension,
    });

    await prov.sendMessage(`${from}@s.whatsapp.net`,{text:`Gracias por comunicarse con nosotros.`})

  };

  module.exports = {sendFile}