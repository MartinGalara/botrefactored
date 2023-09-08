const { downloadMediaMessage } = require('@adiwajshing/baileys')

let ticket = {}

const addProps = (from,props) => {
    if(ticket.hasOwnProperty(from)){
      Object.assign(ticket[from], props);
    }
    else{
      ticket[from] = {}
      Object.assign(ticket[from], props);
    }
}

const getProp = (from,prop) => {
    return ticket[from][prop]
}

const deleteTicketData = (from) => {
  ticket[from] = {}
}

const getInstructivo = (from, index) => {
  const instructivos = ticket[from].instructivos;

  // Convertir el índice a un número entero
  const numericIndex = parseInt(index);

  if(parseInt(index) === instructivos.length+1) return "Salir"

  // Verificar si el índice es un número entero válido
  if (!Number.isInteger(numericIndex) || numericIndex <= 0 || numericIndex > instructivos.length) {
    console.error('Índice inválido o fuera de rango.');
    return false;
  }

  const path = instructivos[numericIndex - 1].path;
  const filename = instructivos[numericIndex - 1].filename;
  return { path, filename };
};

const getBandera = (from) => {

  switch (ticket[from].bandera){

        case "YP": 
            return "Ingrese su numero de APIES"

        case "SH": 
            return "Ingrese su numero de identificacion SHELL"

        case "AX": 
            return "Ingrese su numero de identificacion AXION"

        case "PU": 
            return "Ingrese su numero de identificacion PUMA"

        case "GU": 
           return "Ingrese su numero de identificacion GULF"

        case "RE": 
            return "Ingrese su numero de identificacion REFINOR"

        case "BL": 
            return "Ingrese su numero de identificacion"

        case "OT": 
            return "Ingrese su numero de identificacion"

        default:
          return

  }

}

const computerInfo = (from,option) => {

  if(ticket[from].computers[option-1] && option !== "0"){
    ticket[from].pf = ticket[from].computers[option-1].alias
    ticket[from].tv = ticket[from].computers[option-1].teamviewer_id
  }

}

const addAudio = async (from,ctx) => {

  if(!ticket[from].hasOwnProperty("mailAttachments")){
    ticket[from].mailAttachments = []
  }

  const buffer = await downloadMediaMessage(ctx,'buffer')

  const audio = {
    filename: 'adjunto.mp3',
    content: Buffer.from(buffer, 'base64')
  }
  ticket[from].mailAttachments.push(audio)

}

const addImage = async (from,ctx) => {

  if(!ticket[from].hasOwnProperty("mailAttachments")){
    ticket[from].mailAttachments = []
  }

  const buffer = await downloadMediaMessage(ctx,'buffer')

    const image = {
      filename: 'adjunto.jpg',
      content: Buffer.from(buffer, 'base64')
    }
    ticket[from].mailAttachments.push(image)

}

module.exports = { addProps,getProp,deleteTicketData,getInstructivo,getBandera,computerInfo,addAudio,addImage }