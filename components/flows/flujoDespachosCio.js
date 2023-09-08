const { addKeyword } = require('@bot-whatsapp/bot')

const { addAudio,addProps,getProp,addImage } = require("../api/apiTickets")
const { respuesta } = require("../api/apiMensajes")

let i = 1;

const flujoDespachosCio = addKeyword('1',{sensitive:true})
.addAnswer('Describa el problema por escrito o adjunte un AUDIO',{capture:true}, async (ctx,{fallBack,flowDynamic,provider}) => {

    const inc = await funcionPregunta(i,provider,ctx,fallBack)
 
    inc === true && i++;

    const pregunta = sigPregunta(i)

    fallBack(pregunta)

})
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


const sigPregunta = (orden) => {

    switch (orden) {
        case 2: return 'Si desea aqui puede adjuntar fotos\nDe lo contrario envíe "0" para continuar'

        case 3: return 'Que nivel de urgencia le daria a este ticket\n1. Bajo\n2. Medio\n3. Alto'

        case 4: return 'Elija la opcion deseada\n1. Enviar ticket\n2. Cancelar ticket'
    
        default:
            break;
    }

}

const funcionPregunta = async (orden,provider,ctx,fallBack) => {

    switch (orden) {
        case 1:

            let flag1

            if(ctx.message.hasOwnProperty('audioMessage')){
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
        
    
        default:
            break;
    }

}

module.exports = flujoDespachosCio