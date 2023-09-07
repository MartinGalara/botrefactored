const { addKeyword } = require('@bot-whatsapp/bot')

const flujo1 = addKeyword("1",{sensitive:true})
.addAnswer("Entraste al flujo 1")

module.exports = flujo1