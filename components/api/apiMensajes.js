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
        zone = "Playa/Boxes"
        break;
  
      case "A":
        zone = "Administracion"
        break;
  
      case "T":
        zone = "Tienda"
        break;
    }

    const cliente = getProp(from,'selectedUser')
  
    if(cliente.vip){
        
      await respuesta(from,provider,`Tu ejecutivo de cuenta ya fue notificado del problema`)
  
      await respuesta(cliente.vip,provider,`El cliente ${cliente.info} genero un ticket pidiendo soporte para ${zone} - ${getProp(from,'problem')}. Nivel de urgencia: ${getProp(from,'priority')}`)
    }

    const managers = getProp(from,'sendMessage')
  
    for (let i = 0; i < managers.length; i++) {
      await respuesta(managers[i],provider,`Se genero un ticket pidiendo soporte para ${zone} - ${getProp(from,'problem')}. Nivel de urgencia: ${getProp(from,'priority')}`)
    }
  
    deleteTicketData(from)
  
  }

  const sendSOSMessages = async (from,provider) => {
  
    const cliente = getProp(from,'selectedUser')
  
    if(cliente.vip){
        
      await respuesta(from,provider,`Tu ejecutivo de cuenta ya fue notificado del problema`)
  
      await respuesta(cliente.vip,provider,`El cliente ${cliente.info} genero un ticket *SOS* - Opcion "0" del bot`)
    }

    const managers = getProp(from,'sendMessage')
  
    for (let i = 0; i < managers.length; i++) {
      await respuesta(managers[i],provider,`Se genero un ticket *SOS* - Nivel de urgencia: Muy Alto`)
    }
  
    deleteTicketData(from)
  
  }

module.exports = {respuesta,respuestaConDelay,sendMessages,sendSOSMessages}