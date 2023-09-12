const { addKeyword } = require('@bot-whatsapp/bot')

const { banderaElegida,zonaElegida } = require('../api/apiSoporte')
const { respuesta,respuestaConDelay } = require('../api/apiMensajes')
const { addProps,getProp,getBandera,computerInfo,incFlagUsers,getUsers } = require('../api/apiTickets')
const { validateUserID,computers } = require('../api/apiUsuarios')
const { computerOptions,opMenuProblemas } = require('../api/apiOpciones')

const opcionesIncidentes = opMenuProblemas('array').join('\n');

const flujoDespachosCio = require("./flujoDespachosCio")
const flujoAplicaciones = require("./flujoAplicaciones")
const flujoImpresoraFiscal = require("./flujoImpresoraFiscal")
const flujoImpresoraComun = require("./flujoImpresoraComun")
const flujoSiges = require("./flujoSiges")
const flujoLibroIva = require("./flujoLibroIva")
const flujoServidor = require("./flujoServidor")

const flujoSoporte = addKeyword("2",{sensitive:true})
.addAnswer("Elija en que area se encuentra el puesto de trabajo donde necesita soporte\n1. Playa\n2. Tienda\n3. Boxes\n4. Administracion",{capture:true},async (ctx,{provider,fallBack}) => {

    const i = getProp(ctx.from,'flagUsers')

    const inc = await funcionPregunta(i,provider,ctx)
 
    inc === true && incFlagUsers(ctx.from);

    const pregunta = sigPregunta(getProp(ctx.from,'flagUsers'))

    if(pregunta) fallBack(pregunta)

})
.addAnswer("Verificando",{capture:true},(ctx,{fallBack}) => {

    const pcs = getProp(ctx.from,'computers');
    
    if(ctx.body > 0 && ctx.body <= pcs.length){
        computerInfo(ctx.from,ctx.body)
    }
    else{
        if(ctx.body === "0") {
        addProps(ctx.from,{pf: "PC no esta en nuestra base de datos"})
        addProps(ctx.from,{tv: "Consultar al cliente tv e indentificador de PC y reportarlo"})
        }
        else fallBack('Elija una opcion valida')
    }

})
.addAnswer(opcionesIncidentes,
{capture:true},(ctx,{fallBack}) => {

    const selected = ctx.body
    const objOpciones = opMenuProblemas('obj')
    ctx.body = objOpciones[selected]

    const opciones = opMenuProblemas('opciones')

    if(!opciones.includes(ctx.body)) return fallBack()

    addProps(ctx.from,{problem: ctx.body}) 
    addProps(ctx.from,{pregunta: 1}) 

},[flujoDespachosCio,flujoAplicaciones,flujoImpresoraFiscal,flujoImpresoraComun,flujoSiges,flujoLibroIva,flujoServidor])


const sigPregunta = (orden) => {

    switch (orden) {

        case 1: return "Elija en que area se encuentra el puesto de trabajo donde necesita soporte\n1. Playa\n2. Tienda\n3. Boxes\n4. Administracion"

        case 2: return "Indique para que estación necesita soporte"
    
        default:

            return false

    }

}

const funcionPregunta = async (orden,provider,ctx,endFlow) => {

    switch (orden) {
        
        case 1:

            const flag = zonaElegida(ctx.from,ctx.body)

            if(!flag) return false
            else{
                const opciones = getUsers(ctx.from)
                if(!opciones){

                    addProps(ctx.from,{flagUsers: 100})

                    await computers(ctx.from)

                    const pcs = computerOptions(ctx.from);

                    respuestaConDelay(ctx.from,provider,pcs)

                    return true
                }
                else{
                    respuestaConDelay(ctx.from,provider,opciones)
                    return true
                }
            }

        case 2:

            const cantidad = getProp(ctx.from,'users')

            if(ctx.body > 0 && ctx.body <= cantidad.length){

                addProps(ctx.from,{selectedUser: cantidad[ctx.body-1]})

                await computers(ctx.from)

                const pcs = computerOptions(ctx.from);

                respuestaConDelay(ctx.from,provider,pcs)

                return true
            }
            else{
                const opciones = getUsers(ctx.from)
                respuestaConDelay(ctx.from,provider,opciones)
                return false
            }
    
    }
}

module.exports = flujoSoporte