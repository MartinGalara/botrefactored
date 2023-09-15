const { addKeyword } = require('@bot-whatsapp/bot')

const { opMenuInstructivos,opcionesInstructivos } = require('../api/apiOpciones')
const { respuestaConDelay, respuesta } = require('../api/apiMensajes')
const { addProps, incPregunta,getProp } = require('../api/apiTickets')
const { sendFile } = require('../api/apiInstructivos')

const flujoInstructivos = addKeyword('1',{sensitive:true})
.addAction( (ctx,{provider}) => {
    const opciones = opMenuInstructivos(ctx.from)
    respuestaConDelay(ctx.from,provider,opciones)
})
.addAnswer("Elija una categoria",{capture:true},async (ctx,{provider,fallBack,endFlow}) => {

    const i = getProp(ctx.from,'pregunta')

    const inc = await funcionPregunta(i,provider,ctx,endFlow)
 
    inc === true && incPregunta(ctx.from);

    const pregunta = sigPregunta(getProp(ctx.from,'pregunta'))

    if(pregunta) fallBack(pregunta)

})

const sigPregunta = (orden) => {

    switch (orden) {

        case 1: return "Elija una categoria"

        case 2: return "Elija el instructivo que desea descargar"
    
        default:

            return false

    }

}

const funcionPregunta = async (orden,provider,ctx,endFlow) => {

    switch (orden) {
        
        case 1:

        switch (ctx.body) {
            case "1":
                addProps(ctx.from,{categoria: "Operación Playa"})
                break;
    
            case "2":
                addProps(ctx.from,{categoria: "Operación Tienda"})
                break;
    
            case "3":
                addProps(ctx.from,{categoria: "Admin - Contable"})
                break;
        
            default:
                await respuesta(ctx.from,provider,"Opcion invalida - Elija una opcion valida")
                const opciones = opMenuInstructivos(ctx.from)
                respuestaConDelay(ctx.from,provider,opciones)
                return false
        }
    
        const instructivos = await opcionesInstructivos(ctx.from);
        respuestaConDelay(ctx.from,provider,instructivos)
        return true

        case 2:
            if(ctx.body === "0"){
                addProps(ctx.from,{pregunta:0})
                const opciones = opMenuInstructivos(ctx.from)
                respuestaConDelay(ctx.from,provider,opciones)
                return true
            }

            if(ctx.body.toLowerCase() === "salir"){
                await respuesta(ctx.from,provider,`Envie *sigesbot* para volver a comenzar`)
                return true
            }

            const flag = await sendFile(ctx.from,ctx.body,provider)
            if(!flag){
                const instructivos = await opcionesInstructivos(ctx.from);
                respuestaConDelay(ctx.from,provider,instructivos)
            }
            return flag
        }
}

module.exports = flujoInstructivos