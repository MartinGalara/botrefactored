const { downloadMediaMessage } = require('@adiwajshing/baileys')

const axios = require('axios')
const nodemailer = require("nodemailer")
const dotenv = require("dotenv");

dotenv.config();

//const { validateUserID } = require("./apiUsuarios")

let ticket = {}

const addProps = (from,props) => {
    if(ticket.hasOwnProperty(from)){
      Object.assign(ticket[from], props);
    }
    else{
      ticket[from] = {}
      Object.assign(ticket[from], props);
    }

    console.log(ticket)
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

const incPregunta = (from) => {

  ticket[from].pregunta = ticket[from].pregunta + 1

}

const sendEmail = async (from) => {

  const newTicket = await createTicket(ticket[from].userId)

  await getStaff(from)

  let reciever = ""

  ticket[from].testing === true ? reciever = process.env.TESTINGMAIL : reciever = process.env.RECIEVER

  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: process.env.SENDER, // generated ethereal user
      pass: process.env.GMAIL_PASS, // generated ethereal password
    },
  });

  let replyTo = ticket[from].staff.mails.join(', ')

  if(ticket[from].vipmail){
    if(replyTo === ''){
      replyTo = ticket[from].vipmail
    }else{
      replyTo = replyTo + ', ' + ticket[from].vipmail
    }
  }

  let data = {
    from: `"WT ${newTicket.id}" <${process.env.SENDER}>`, // sender address
    to: reciever, // list of receivers
    cc: replyTo,
    subject: `WT ${newTicket.id} | ${ticket[from].info} | Soporte para ${ticket[from].problem} | ${ticket[from].pf}`, // Subject line
    text: `WT ${newTicket.id} | ${ticket[from].info} | Soporte para ${ticket[from].problem} | ${ticket[from].pf}`, // plain text body
    replyTo: replyTo
  }

  if(ticket[from].mailAttachments && ticket[from].mailAttachments.length !== 0){
    data.attachments = ticket[from].mailAttachments;
  }

  const commonHtml = `
<div>
  <p>Datos del ticket</p>
  <p>Soporte para: ${ticket[from].problem}</p>
  <p>ID Cliente: ${ticket[from].userId}</p>
  <p>Info Cliente: ${ticket[from].info}</p>
  <p>Teléfono que generó el ticket: ${ticket[from].phone}</p>
  <p>Punto de facturación / PC: ${ticket[from].pf}</p>
  <p>ID TeamViewer: ${ticket[from].tv}</p>
  <p>Urgencia indicada por el cliente: ${ticket[from].priority}</p>
`;

let specificHtml = '';

switch (ticket[from].problem) {
  case "Despachos CIO":
  case "Servidor":
    specificHtml = '';
    break;

  case "Sistema SIGES":
  case "Aplicaciones":
    specificHtml = `
    <p>Origen del problema: ${ticket[from].type}</p>
    <p>Descripción del problema: ${ticket[from].description}</p>`;
    break;

  case "Libro IVA":
    specificHtml = `
    <p>Solicitud: ${ticket[from].type}</p>
    <p>Período: ${ticket[from].timeFrame}</p>
    <p>Descripción / Info adicional: ${ticket[from].description}</p>`;
    break;

  default:
    specificHtml = `
    <p>Solicitud: ${ticket[from].type}</p>
    <p>Descripción / Info adicional: ${ticket[from].description}</p>`;
    break;
}

data.html = `${commonHtml}${specificHtml}</div>`;

  const mail = await transporter.sendMail(data);

  console.log(ticket)

  return newTicket.id

}

const createTicket = async (userId) => {

  const config = {
    method: 'post',
    url: `${process.env.SERVER_URL}/tickets`,
    data:{
      userId: userId
    }
  }

  const ticket = await axios(config)

  return ticket.data 

}

const getStaff = async (from) => {

  const config = {
    method: 'get',
    url: `${process.env.SERVER_URL}/staffs?userId=${ticket[from].userId}`,
  }

  const staff = await axios(config).then((i) => i.data)

  ticket[from].staff = {}
  ticket[from].staff.mails = []
  ticket[from].staff.phones = []

  const mails = []
  const phones = []

  staff.map( e => {
    if(e.zone === null || e.zone === ticket[from].zone) {
      mails.push(e.email)
      phones.push(e.phone)
    }
  })

  ticket[from].staff.mails = mails
  ticket[from].staff.phones = phones
  
}

const sendSosTicket = async (from) => {

  const userId = ticket[from].creds.userId

  const newTicket = await createTicket(userId)

  await validateUserID(from,userId)

}

module.exports = { addProps,getProp,deleteTicketData,getInstructivo,getBandera,computerInfo,addAudio,addImage,incPregunta,sendEmail,sendSosTicket }