const { createBot, createProvider, createFlow, addKeyword } = require('@bot-whatsapp/bot')

const QRPortalWeb = require('@bot-whatsapp/portal')
const BaileysProvider = require('@bot-whatsapp/provider/baileys')
const JsonFileAdapter = require('@bot-whatsapp/database/json')

const { respuestaConDelay } = require("./components/api/apiMensajes.js")
const { validateUser } = require("./components/api/apiUsuarios.js")
const { opMenuInicial } = require("./components/api/apiOpciones.js")
const { getProp,addProps,getUsers } = require("./components/api/apiTickets.js")

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
    .addAnswer('Elija la opcion deseada',{capture:true},async (ctx,{endFlow,provider}) => {

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

        if(ctx.body === "0" || ctx.body === "3" || ctx.body === "1") addProps(ctx.from,{pregunta: 1})
        if(ctx.body === "2") {
            addProps(ctx.from,{flagUsers: 1})
            const users = getProp(ctx.from,'users')
            if(users.length > 1){
                const opciones = getUsers(ctx.from)
                let pregunta = "Indique para que estación necesita soporte\n"
                pregunta = pregunta + opciones
                await respuestaConDelay(ctx.from,provider,pregunta)
            }
            else{
                addProps(ctx.from,{flagUsers: 2})
                await respuestaConDelay(ctx.from,provider,"Elija en que area se encuentra el puesto de trabajo donde necesita soporte\n1. Playa\n2. Tienda\n3. Boxes\n4. Administracion")
                
            }
        }
        
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
