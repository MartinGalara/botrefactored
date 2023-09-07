const { addKeyword } = require('@bot-whatsapp/bot')

const flujo2 = addKeyword("2",{sensitive:true})
.addAnswer("Entraste al flujo 2")

module.exports = flujo2