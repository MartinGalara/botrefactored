const { addKeyword } = require('@bot-whatsapp/bot')

const { opMenuInstructivos,opcionesInstructivos } = require('../api/apiOpciones')
const { respuestaConDelay } = require('../api/apiMensajes')
const { addProps } = require('../api/apiTickets')
const { sendFile } = require('../api/apiInstructivos')

const flujoAplicaciones = addKeyword('1',{sensitive:true})
.addAction( (ctx,{provider}) => {
    const opciones = opMenuInstructivos(ctx.from)
    respuestaConDelay(ctx.from,provider,opciones)
})
.addAnswer("Elija una categoria",{capture:true},async (ctx,{provider,fallBack}) => {
    switch (ctx.body) {
        case "1":
            addProps(ctx.from,{categoria: "Operación Playa"})
            break;

        case "2":
            addProps(from,{categoria: "Operación Tienda"})
            break;

        case "3":
            addProps(from,{categoria: "Admin - Contable"})
            break;
    
        default:
            fallBack("Opcion invalida - Elija una opcion valida")
            break;
    }

    const instructivos = await opcionesInstructivos(ctx.from);
    respuestaConDelay(ctx.from,provider,instructivos)
})
.addAnswer("Elija el instructivo que desea descargar",{capture:true},(ctx,{provider}) => {
    sendFile(ctx.from,ctx.body,provider)
})

module.exports = flujoAplicaciones