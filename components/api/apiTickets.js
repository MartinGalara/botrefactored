const { downloadMediaMessage } = require('@adiwajshing/baileys')

const axios = require('axios')
const nodemailer = require("nodemailer")
const dotenv = require("dotenv");

dotenv.config();

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

  if(parseInt(index) === instructivos.length+1) return "Volver"
  if(parseInt(index) === instructivos.length+2) return "Salir"

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

const incFlagUsers = (from) => {

  ticket[from].flagUsers = ticket[from].flagUsers + 1

}

const sendEmail = async (from) => {

  const selectedUser = ticket[from].selectedUser

  const newTicket = await createTicket(selectedUser.id)

  await getManagers(from,selectedUser.id)

  let reciever = ""

  selectedUser.testing === true ? reciever = process.env.TESTINGMAIL : reciever = process.env.RECIEVER

  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: process.env.SENDER, // generated ethereal user
      pass: process.env.GMAIL_PASS, // generated ethereal password
    },
  });

  const allEmails = []

  ticket[from].selectedUser.email.map( e => allEmails.push(e))

  ticket[from].sendEmail.map( e => allEmails.push(e))

  if(selectedUser.vipmail) allEmails.push(selectedUser.vipmail)

  const replyTo = allEmails.join(', ')

  let data = {
    from: `"WT ${newTicket.id}" <${process.env.SENDER}>`, // sender address
    to: reciever, // list of receivers
    cc: replyTo,
    subject: `WT ${newTicket.id} | ${selectedUser.info} | Soporte para ${ticket[from].problem} | ${ticket[from].pf}`, // Subject line
    text: `WT ${newTicket.id} | ${selectedUser.info} | Soporte para ${ticket[from].problem} | ${ticket[from].pf}`, // plain text body
    replyTo: replyTo
  }

  if(ticket[from].mailAttachments && ticket[from].mailAttachments.length !== 0){
    data.attachments = ticket[from].mailAttachments;
  }

  const commonHtml = `
<div>
  <p>Datos del ticket</p>
  <p>Soporte para: ${ticket[from].problem}</p>
  <p>ID Cliente: ${selectedUser.id}</p>
  <p>Info Cliente: ${selectedUser.info}</p>
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

const getManagers = async (from,id) => {

  const config = {
    method: 'get',
    url: `${process.env.SERVER_URL}/clients?id=${id}`,
  }

  const managers = await axios(config).then((i) => i.data)

  ticket[from].sendEmail = []
  ticket[from].sendMessage = []

  managers.botusers.forEach((botuser) => {
    if (botuser.manager === true) {
      if ((botuser.email && botuser.area === ticket[from].zone) || botuser.area === "G") {
        ticket[from].sendEmail.push(botuser.email);
      }
      if (botuser.area === ticket[from].zone || botuser.area === "G") {
        ticket[from].sendMessage.push(botuser.phone);
      }
    }
  });
}

const sendSosTicket = async (from) => {

  const selectedUser = ticket[from].selectedUser

  const newTicket = await createTicket(selectedUser.id)

  await getManagers(from,selectedUser.id)

  let reciever = ""

  selectedUser.testing === true ? reciever = process.env.TESTINGMAIL : reciever = process.env.RECIEVER

  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: process.env.SENDER, // generated ethereal user
      pass: process.env.GMAIL_PASS, // generated ethereal password
    },
  });

  const allEmails = []

  ticket[from].selectedUser.email.map( e => allEmails.push(e))

  ticket[from].sendEmail.map( e => allEmails.push(e))

  if(selectedUser.vipmail) allEmails.push(selectedUser.vipmail)

  const replyTo = allEmails.join(', ')
  let data = {
    from: `"WT ${newTicket.id}" <${process.env.SENDER}>`, // sender address
    to: reciever, // list of receivers
    cc: replyTo,
    subject: `WT ${newTicket.id} | *TICKET SOS* | ${selectedUser.info}`, // Subject line
    text: `WT ${newTicket.id} | *TICKET SOS* | ${selectedUser.info}`, // plain text body
    replyTo: replyTo
  }

  data.html = `
  <div>
  <p>Datos del ticket</p>
  <p>ID Cliente: ${selectedUser.id}</p>
  <p>Info Cliente: ${selectedUser.info}</p>
  <p>Teléfono que generó el ticket: ${ticket[from].phone}</p>
  <p>Urgencia indicada por el cliente: SOS - URGENTE</p>
  </div>
  `;

  if(ticket[from].mailAttachments && ticket[from].mailAttachments.length !== 0){
    data.attachments = ticket[from].mailAttachments;
  }

  const mail = await transporter.sendMail(data);

  return newTicket.id

}

const getUsers = (from) => {

  if(ticket[from].users.length === 1) {
    addProps(from,{selectedUser: ticket[from].users[0]})
    return false
  }
  else{
    const usersString = ticket[from].users.map((user, index) => `${index + 1}. ${user.info}`).join('\n');
    return usersString;
  }
  
}

const newUserProps = (from,props) => {

    Object.assign(ticket[from].newBotuser, props);
  
}

const newUserInfo = (from) => {
  const newUser = ticket[from].newBotuser;

  // Mapear el valor de 'area' a la palabra completa correspondiente
  const areaMapping = {
    'P': 'Playa',
    'T': 'Tienda',
    'B': 'Boxes',
    'A': 'Administracion',
    'G': 'Gerente / Dueño',
  };

  // Crear un objeto con los datos formateados
  const formattedData = {
    Nombre: newUser.name,
    Telefono: newUser.phone,
    'Alta de Usuarios': newUser.createUser ? 'SI' : 'NO',
    'Ver Instructivos Admin/Contable': newUser.adminPdf ? 'SI' : 'NO',
    'Generar Ticket SOS': newUser.canSOS ? 'SI' : 'NO',
    Encargado: newUser.manager ? 'SI' : 'NO',
    Area: newUser.manager ? areaMapping[newUser.area] : undefined,
    Correo: newUser.manager ? newUser.email : undefined,
  };

  // Crear el string formateado
  let result = 'Datos Nuevo Usuario\n';
  for (const [key, value] of Object.entries(formattedData)) {
    if (value !== undefined) {
      result += `${key}: ${value}\n`;
    }
  }

  result += `\nIndique la opcion correcta\n1. Confirmar datos\n2. Modificar Datos\n3. Confirmar y dar de alta nuevo usuario\n4. Cancelar y no grabar`;

  return result;
};


module.exports = { newUserInfo,newUserProps,addProps,getProp,deleteTicketData,getInstructivo,getBandera,computerInfo,addAudio,addImage,incPregunta,sendEmail,sendSosTicket,incFlagUsers,getUsers }