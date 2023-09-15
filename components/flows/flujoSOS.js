const { addKeyword } = require('@bot-whatsapp/bot')

const { addProps,getProp,incPregunta,sendSosTicket,getUsers } = require("../api/apiTickets")
const { respuesta,respuestaConDelay,sendSOSMessages } = require("../api/apiMensajes")

const flujoSOS = addKeyword('0',{sensitive:true})
.addAnswer('Esta opcion esta disponible para casos donde mas de la mitad de los puntos de venta no pueden facturar\nSi esto es asi envie *si*\nDe lo contrario envie *no*',{capture:true}, async (ctx,{fallBack,provider,endFlow}) => {

    const i = getProp(ctx.from,'pregunta')

    const inc = await funcionPregunta(i,provider,ctx,endFlow)
 
    inc === true && incPregunta(ctx.from);

    const pregunta = sigPregunta(getProp(ctx.from,'pregunta'))

    if(pregunta) fallBack(pregunta)

})
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


const sigPregunta = (orden) => {

    switch (orden) {

        case 1: return "Esta pregunta solo admite *si* o *no* como respuesta"

        case 2: return "Indique en que estación ocurre el incidente"
    
        default:

            return false

    }

}

const funcionPregunta = async (orden,provider,ctx,endFlow) => {

    switch (orden) {
        
        case 1:

            if(ctx.body.toLowerCase() === "no") {

                addProps(ctx.from,{pregunta: 100})
                return endFlow({body: "Envie *sigesbot* para volver a comenzar y genere un ticket en la opcion *2*"})
            
            }

            if(ctx.body.toLowerCase() === "si") {

                const opciones = getUsers(ctx.from)
                if(!opciones){

                    addProps(ctx.from,{pregunta: 2})

                    const ticket = await sendSosTicket(ctx.from)

                    ticket ? await respuesta(ctx.from,provider,`Tu numero de ticket es ${ticket}.`) : await respuesta(ctx.from,provider,`Ticket generado exitosamente.`)

                    await sendSOSMessages(ctx.from,provider)
           
                    await respuesta(ctx.from,provider,`Gracias por comunicarse con nosotros.`)
                    
                    return true
                }
                else{
                    respuestaConDelay(ctx.from,provider,opciones)
                    return true
                }
            }
            else return false

        case 2:

            const cantidad = getProp(ctx.from,'users')

            if(ctx.body > 0 && ctx.body <= cantidad.length){

                addProps(ctx.from,{selectedUser: cantidad[ctx.body-1]})

                const ticket = await sendSosTicket(ctx.from)

                ticket ? await respuesta(ctx.from,provider,`Tu numero de ticket es ${ticket}.`) : await respuesta(ctx.from,provider,`Ticket generado exitosamente.`)

                await sendSOSMessages(ctx.from,provider)
           
                await respuesta(ctx.from,provider,`Gracias por comunicarse con nosotros.`)

                return true
            }
            else{
                const opciones = getUsers(ctx.from)
                respuestaConDelay(ctx.from,provider,opciones)
                return false
            }
        }
}

module.exports = flujoSOS