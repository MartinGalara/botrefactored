const { createBot, createProvider, createFlow, addKeyword } = require('@bot-whatsapp/bot')

const QRPortalWeb = require('@bot-whatsapp/portal')
const BaileysProvider = require('@bot-whatsapp/provider/baileys')
const JsonFileAdapter = require('@bot-whatsapp/database/json')

const { respuestaConDelay } = require("./components/api/apiMensajes.js")
const { validateUser } = require("./components/api/apiUsuarios.js")
const { opMenuInicial } = require("./components/api/apiOpciones.js")
const { getProp,addProps } = require("./components/api/apiTickets.js")

const flujoInstructivos = require("./components/flows/flujoInstructivos.js")
const flujoSoporte = require("./components/flows/flujoSoporte.js")
const flujoSOS = require("./components/flows/flujoSOS.js")
const flujoAltaBotuser = require("./components/flows/flujoAltaBotuser.js")

const flujoPrincipal = addKeyword("sigesbot")
    .addAnswer('Gracias por comunicarte con Sistema SIGES.',{}, async (ctx,{provider,endFlow}) => {

        const user = await validateUser(ctx.from)
        if(!user) return endFlow("Este numero de telefono no esta dado de alta, solicite que le den el alta para usar el bot")
        const opciones = opMenuInicial(ctx.from)
        await respuestaConDelay(ctx.from,provider,opciones)
    })
    .addAnswer('Elija la opcion deseada',{capture:true},async (ctx,{endFlow,fallBack}) => {

        if (ctx.body === 'salir') return endFlow({ body: `Escriba *sigesbot* para volver a comenzar` });

        const creds = getProp(ctx.from, 'creds');
        
        const validOptions = {
            '1': true,
            '2': true,
            '3': creds.createUser,
            '0': creds.canSOS,
        };

        if (!validOptions[ctx.body]) {
        return endFlow({ body: "Opcion invalida - Escriba *sigesbot* para volver a comenzar" });
        }

        if(ctx.body === "0" || ctx.body === "3") addProps(ctx.from,{pregunta: 1})
        if(ctx.body === "2") addProps(ctx.from,{flagUsers: 1})
        
    },[flujoInstructivos,flujoSoporte,flujoSOS,flujoAltaBotuser])


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

module.exports = flujoPrincipal
