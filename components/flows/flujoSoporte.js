const { addKeyword } = require('@bot-whatsapp/bot')

const { banderaElegida,zonaElegida } = require('../api/apiSoporte')
const { respuesta,respuestaConDelay } = require('../api/apiMensajes')
const { addProps,getProp,getBandera,computerInfo } = require('../api/apiTickets')
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
.addAnswer(["Elija desde donde necesita soporte","1. YPF","2. SHELL","3. AXION","4. PUMA","5. GULF","6. REFINOR","7. EST. BLANCA","8. OTRO"],{capture:true},(ctx,{fallBack}) => {
    
    const flag = banderaElegida(ctx.from,ctx.body)

    flag === false && fallBack()

})
.addAnswer(["Elija en que area se encuentra el puesto de trabajo donde necesita soporte","1. Playa","2. Tienda","3. Boxes","4. Administracion"],{capture:true},async (ctx,{provider}) => {

    const flag = zonaElegida(ctx.from,ctx.body)

    flag === false && fallBack()

    await respuesta(ctx.from,provider,getBandera(ctx.from))

})
.addAnswer('Si no lo conoce, solicitarlo a un operador de SIGES',{capture:true},async (ctx,{fallBack,endFlow,provider}) => {

    if(ctx.body.toLowerCase() === "salir") return endFlow('Escriba *sigesbot* para volver a comenzar')

    const bandera = getProp(ctx.from,'bandera')

    const fullId = bandera + ctx.body

    const user = await validateUserID(ctx.from,fullId)

    if(user){

        addProps(ctx.from,{id: ctx.body})
        addProps(ctx.from,{phone: ctx.from})

        await computers(ctx.from)

        const pcs = computerOptions(ctx.from);

        respuestaConDelay(ctx.from,provider,pcs)

    }else{
        fallBack("Ingrese una ID valida - Para salir envie la palabra *salir*")
    }

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

module.exports = flujoSoporte