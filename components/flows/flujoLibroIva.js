const { addKeyword } = require('@bot-whatsapp/bot')

const { addAudio,addProps,getProp,addImage,incPregunta,sendEmail } = require("../api/apiTickets")
const { respuesta,sendMessages } = require("../api/apiMensajes")

const flujoLibroIva = addKeyword('6',{sensitive:true})
.addAnswer('Elija donde se encuentra el inconveniente\n1. Libro IVA Compra\n2. Libro IVA Venta',{capture: true},async (ctx,{provider,fallBack}) => {

    const i = getProp(ctx.from,'pregunta')

    const inc = await funcionPregunta(i,provider,ctx)
 
    inc === true && incPregunta(ctx.from);

    const pregunta = sigPregunta(getProp(ctx.from,'pregunta'))

    if(pregunta) fallBack(pregunta)

})

const sigPregunta = (orden) => {

    switch (orden) {

        case 2: return "Indique el período en el cual hay un inconveniente"

        case 3: return 'Describa el problema por escrito o adjunte un AUDIO.'

        case 4: return 'Si desea aqui puede adjuntar fotos\nDe lo contrario envíe "0" para continuar'

        case 5: return 'Que nivel de urgencia le daria a este ticket\n1. Bajo\n2. Medio\n3. Alto'

        case 6: return 'Elija la opcion deseada\n1. Enviar ticket\n2. Cancelar ticket'

        case 7: return false
    
        default:
            break;
    }

}

const funcionPregunta = async (orden,provider,ctx) => {

    switch (orden) {
        case 1:
            switch (ctx.body) {
                case "1":
                    ctx.body = "Libro IVA Compra"
                    break;
                case "2":
                    ctx.body = "Libro IVA Venta"
                    break;
                }
            addProps(ctx.from,{type: ctx.body})

            return true

        case 2:

            addProps(ctx.from,{timeFrame: ctx.body})

            return true

        case 3:

            let flag1

            if(ctx.message.hasOwnProperty('audioMessage')){
              await addAudio(ctx.from,ctx)
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

        case 4:

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

        case 5:

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

        case 6:

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

module.exports = flujoLibroIva