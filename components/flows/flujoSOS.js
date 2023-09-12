const { addKeyword } = require('@bot-whatsapp/bot')

const { addProps,getProp,incPregunta,sendSosTicket } = require("../api/apiTickets")
const { respuesta,sendMessages } = require("../api/apiMensajes")

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

                await sendSosTicket(ctx.from)
                return true
            }
            else return false
        }
}

module.exports = flujoSOS