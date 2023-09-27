const { addKeyword } = require('@bot-whatsapp/bot')

const { addProps,getProp,incPregunta,sendSosTicket,getUsers,newUserProps,newUserInfo } = require("../api/apiTickets")
const { respuesta,respuestaConDelay,sendSOSMessages } = require("../api/apiMensajes")
const { altaBotuser } = require("../api/apiUsuarios")

const flujoAltaBotuser = addKeyword('3',{sensitive:true})
.addAnswer('Ingrese el nombre de la persona que va a ser dada de alta para usar el chatbot',{capture:true}, async (ctx,{fallBack,provider,endFlow}) => {

    const i = getProp(ctx.from,'pregunta')

    const inc = await funcionPregunta(i,provider,ctx,endFlow)
 
    inc === true && incPregunta(ctx.from);

    const pregunta = sigPregunta(getProp(ctx.from,'pregunta'))

    if(pregunta) fallBack(pregunta)

})
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


const sigPregunta = (orden) => {

    switch (orden) {

        case 1: return 'Ingrese el nombre de la persona que va a ser dada de alta para usar el chatbot'

        case 2: return "Ingrese el numero de telefono sin 0 y sin 15"

        case 3: return "Indique para que estación quiere dar de alta este usuario"

        case 4: return "Este usuario podra dar de alta a nuevos usuarios ?\n1. SI\n2. NO"

        case 5: return "Este usuario podra ver los instructivos Admin / Contables ?\n1. SI\n2. NO"

        case 6: return "Este usuario podra enviar tickets *SOS* ?\n1. SI\n2. NO"

        case 7: return "Este usuario es encargado de algun area y recibira copia de los tickets de dicha area ?\n1. SI\n2. NO"

        case 8: return "Indique el area\n1. Playa/Boxes\n2. Tienda\n3. Administracion\n4. Gerente / Dueño"

        case 9: return "Ingrese el correo electronico del encargado"

        case 10: return "Verifique que los datos sean correctos"
    
        default:

            return false

    }

}

const funcionPregunta = async (orden,provider,ctx,endFlow) => {

    switch (orden) {
        
        case 1:

            addProps(ctx.from,{newBotuser:{}})

            newUserProps(ctx.from,{name:ctx.body})
            newUserProps(ctx.from,{createdBy:ctx.from})
            
            return true

        case 2:
            const telefono = ctx.body;

            if (/^\d{10}$/.test(telefono)) {

              const telefonoConPrefijo = "549" + telefono;
              newUserProps(ctx.from, { phone: telefonoConPrefijo });
          
              const opciones = getUsers(ctx.from);
              if (!opciones) {
                addProps(ctx.from, { pregunta: 3 });
                return true;
              } else {
                respuestaConDelay(ctx.from, provider, opciones);
                return true;
              }
            } else {

                await respuesta(ctx.from,provider,"Numero de telefono invalido")
                return false;
            }

        case 3:
            
            const cantidad = getProp(ctx.from,'users')

            if(ctx.body > 0 && ctx.body <= cantidad.length){
                newUserProps(ctx.from,{userId:cantidad[ctx.body-1].id})
                return true
            }
            else{
                const opciones = getUsers(ctx.from)
                respuestaConDelay(ctx.from,provider,opciones)
                return false
            }

        case 4:

            switch (ctx.body) {
                case "1":
                    newUserProps(ctx.from,{createUser:true})
                    return true

                case "2":
                    newUserProps(ctx.from,{createUser:false})
                    return true
            
                default:
                    return false
            }

        case 5:

            switch (ctx.body) {
                case "1":
                    newUserProps(ctx.from,{adminPdf:true})
                    return true

                case "2":
                    newUserProps(ctx.from,{adminPdf:false})
                    return true
        
                default:
                    return false
            }

        case 6:

            switch (ctx.body) {
                case "1":
                    newUserProps(ctx.from,{canSOS:true})
                    return true

                case "2":
                    newUserProps(ctx.from,{canSOS:false})
                    return true
    
                default:
                    return false
            }

        case 7:
            
            switch (ctx.body) {
                case "1":
                    newUserProps(ctx.from,{manager:true})
                    return true

                case "2":
                    newUserProps(ctx.from,{manager:false})
                    addProps(ctx.from,{pregunta: 9})

                    const newUser = newUserInfo(ctx.from)

                    await respuestaConDelay(ctx.from,provider,newUser)

                    return true
            }

        case 8:

            switch (ctx.body) {
                case "1": 
                    newUserProps(ctx.from,{area:"P"})
                    return true;
                case "2": 
                    newUserProps(ctx.from,{area:"T"})
                    return true;
                case "3": 
                    newUserProps(ctx.from,{area:"A"})
                    return true;
                case "4": 
                    newUserProps(ctx.from,{area:"G"})
                    return true;
    
                default:
                    return false;
            }

            case 9:
                const email = ctx.body;
              
                if (/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(email)) {
                  newUserProps(ctx.from, { email });
              
                  const newUser = newUserInfo(ctx.from);
                  await respuestaConDelay(ctx.from, provider, newUser);
                  return true;
                } else {
                  await respuesta(ctx.from,provider,"Correo electronico invalido")
                  return false;
                }
              
        case 10:

            switch (ctx.body) {
                case "1":
                    await altaBotuser(ctx.from)
                    await respuesta(ctx.from,provider,"Usuario creado exitosamente\nEscriba *sigesbot* para volver a comenzar")
                    return true

                case "2":

                    addProps(ctx.from,{pregunta: 0})
                    return true

                case "3":
                    await altaBotuser(ctx.from)
                    await respuesta(ctx.from,provider,"Usuario creado exitosamente\nA continuación daremos de alta a un nuevo usuario")
                    addProps(ctx.from,{pregunta: 0})
                    return true

                case "4":

                    addProps(ctx.from,{pregunta: 100})
                    await respuesta(ctx.from,provider,"Escriba *sigesbot* para volver a comenzar")
                    return true
            
                default:
                    await respuesta(ctx.from,provider,"Elija una opcion valida")
                    return false
            }
        }

        
}

module.exports = flujoAltaBotuser