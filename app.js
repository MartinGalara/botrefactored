const { createBot, createProvider, createFlow, addKeyword } = require('@bot-whatsapp/bot')

const QRPortalWeb = require('@bot-whatsapp/portal')
const BaileysProvider = require('@bot-whatsapp/provider/baileys')
const JsonFileAdapter = require('@bot-whatsapp/database/json')

const { respuestaConDelay } = require("./components/api/apiMensajes.js")
const { validateUser } = require("./components/api/apiUsuarios.js")
const { opMenuInicial } = require("./components/api/apiOpciones.js")

const flujoInstructivos = require("./components/flows/flujoInstructivos.js")
const flujoSoporte = require("./components/flows/flujoSoporte.js")
const flujoDespachosCio = require("./components/flows/flujoDespachosCio.js")

const flujoPrincipal = addKeyword("sigesbot")
    .addAnswer('Gracias por comunicarte con Sistema SIGES.',{}, async (ctx,{provider,endFlow}) => {

        const user = await validateUser(ctx.from)
        if(!user) return endFlow("Este numero de telefono no esta dado de alta, solicite que le den el alta para usar el bot")
        const opciones = opMenuInicial(ctx.from)
        respuestaConDelay(ctx.from,provider,opciones)
    })
    .addAnswer('Elija la opcion deseada',{capture:true},async (ctx,{endFlow,fallBack}) => {
        
        if(ctx.body === '3') return endFlow({body: `Escriba "sigesbot" para volver a comenzar`})

        if(ctx.body !== '1' && ctx.body !== '2') return fallBack("Opcion invalida - Ingrese una opcion valida");
        
    },[flujoDespachosCio])


const main = async () => {
    const adapterDB = new JsonFileAdapter()
    const adapterFlow = createFlow([flujoPrincipal])
    const adapterProvider = createProvider(BaileysProvider)

    createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })

    QRPortalWeb()
}

main()
