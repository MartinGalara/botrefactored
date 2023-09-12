const { getProp,deleteTicketData } = require("./apiTickets")

const respuesta = async (from,provider,text) => {

    let prov = provider.getInstance()

    await prov.sendMessage(`${from}@s.whatsapp.net`,{text})
}

const respuestaConDelay = async (from,provider,text) => {

    setTimeout(async ()=> {
        let prov = provider.getInstance()

        await prov.sendMessage(`${from}@s.whatsapp.net`,{text})
    },600)

}

const sendMessages = async (from,provider) => {
  
    let zone = ""

    const ticketZone = getProp(from,'zone')
  
    switch(ticketZone){
      case "P":
        zone = "Playa"
        break;
        
      case "B":
        zone = "Boxes"
        break;
  
      case "A":
        zone = "Administracion"
        break;
  
      case "T":
        zone = "Tienda"
        break;
    }

    console.log(zone)

    const ejecutivo = getProp(from,'vip')
  
    if(ejecutivo){
        
      await respuesta(from,provider,`Tu ejecutivo de cuenta ya fue notificado del problema`)
  
      await respuesta(ejecutivo,provider,`El cliente ${getProp(from,'info')} genero un ticket pidiendo soporte para ${zone} - ${getProp(from,'problem')}. Nivel de urgencia: ${getProp(from,'priority')}`)
    }

    const staff = getProp(from,'staff')
  
    for (let i = 0; i < staff.phones.length;   i++) {
      
      if(staff.phones[i]){
      await respuesta(staff.phones[i],provider,`Se genero un ticket pidiendo soporte para ${zone} - ${getProp(from,'problem')}. Nivel de urgencia: ${getProp(from,'priority')}`)
      }
  
    }
  
    deleteTicketData(from)
  
  }

module.exports = {respuesta,respuestaConDelay,sendMessages}