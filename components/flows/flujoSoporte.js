const { addKeyword } = require('@bot-whatsapp/bot')

const flujo1 = require("./flujo1")
const flujo2 = require("./flujo2")

const flujoSoporte = addKeyword("2",{sensitive:true})
.addAnswer("Eleji",{capture:true},(ctx) => {
    console.log(ctx.body)
},[flujo1,flujo2])

module.exports = flujoSoporte