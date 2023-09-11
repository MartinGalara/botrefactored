const { addKeyword } = require('@bot-whatsapp/bot')

const { addAudio,addProps,getProp,addImage,incPregunta,sendEmail } = require("../api/apiTickets")
const { respuesta,sendMessages } = require("../api/apiMensajes")

const flujoServidor = addKeyword('7')
.addAnswer('Describa el problema por escrito o adjunte un AUDIO',{capture:true}, async (ctx,{fallBack,provider}) => {

    const i = getProp(ctx.from,'pregunta')

    const inc = await funcionPregunta(i,provider,ctx,fallBack)
 
    inc === true && incPregunta(ctx.from);

    const pregunta = sigPregunta(getProp(ctx.from,'pregunta'))

    if(pregunta) fallBack(pregunta)

})
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


const sigPregunta = (orden) => {

    switch (orden) {
        case 2: return 'Si desea aqui puede adjuntar fotos\nDe lo contrario envíe "0" para continuar'

        case 3: return 'Que nivel de urgencia le daria a este ticket\n1. Bajo\n2. Medio\n3. Alto'

        case 4: return 'Elija la opcion deseada\n1. Enviar ticket\n2. Cancelar ticket'

        case 5: return false
    
        default:
            break;
    }

}

const funcionPregunta = async (orden,provider,ctx,endFlow) => {

    switch (orden) {
        case 1:

            let flag1

            if(ctx.message.hasOwnProperty('audioMessage')){
                console.log("entre aca")
              addAudio(ctx.from,ctx)
              addProps(ctx.from,{description: "Audio adjuntado"}) 
              flag1 = true;
            }else if(ctx.message.hasOwnProperty('extendedTextMessage') || ctx.message.hasOwnProperty('conversation')){
                addProps(ctx.from,{description: ctx.body})
                flag1 = true;
            }
            else{
                await respuesta(ctx.from,provider,"Este campo admite solo audio o texto")
                flag1 = false;
            }
    
            const tv = getProp(ctx.from,'tv')
    
            tv === "Consultar al cliente tv e indentificador de PC y reportarlo" && await respuesta(ctx.from,provider,`Si es posible, en esta sección adjunte una foto con la ID y contraseña de Team Viewer`)

            return flag1

        case 2:

            let flag2

            if(ctx.message.hasOwnProperty('imageMessage')){
                await addImage(ctx.from,ctx)
                await respuesta(ctx.from,provider,"Imagen adjuntada")
                flag2 = false
            }else if (ctx.message.hasOwnProperty('extendedTextMessage') || ctx.message.hasOwnProperty('conversation')){
                if(ctx.body === "0")
                flag2 = true
            }else{
                await respuesta(ctx.from,provider,"Este campo admite solo imagen o texto")
                flag2 = false
            }

            return flag2

        case 3:

            switch (ctx.body) {
                case "1":
                    ctx.body = "Bajo"
                break;

                case "2":
                    ctx.body = "Medio"
                break;

                case "3":
                    ctx.body = "Alto"
                break;

                default:
                break;
            }
            addProps(ctx.from,{priority: ctx.body})
            return true

        case 4:

            if(ctx.body === '1') {
                const ticket = await sendEmail(ctx.from)
    
                ticket ? await respuesta(ctx.from,provider,`Tu numero de ticket es ${ticket}.`) : await respuesta(ctx.from,provider,`Ticket generado exitosamente.`)

                await sendMessages(ctx.from,provider)
           
                await respuesta(ctx.from,provider,`Gracias por comunicarse con nosotros.`)

                return true
            }
            else{
                await respuesta(ctx.from,provider,'Se cancelo el envio del ticket. Escriba "sigesbot" para volver a comenzar')

                return true
            }
        
        default:
            break;
    }

}

module.exports = flujoServidor