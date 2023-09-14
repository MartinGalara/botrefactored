const axios = require('axios')
const dotenv = require("dotenv");

dotenv.config();

const { addProps,getProp,deleteTicketData } = require("./apiTickets.js");

const validateUser = async (from) => {

    const config = {
        method: 'get',
        url: `${process.env.SERVER_URL}/botusers?phone=${from}`,
    }
    
    const botuser = await axios(config)

    let resultado
    
    botuser.data.length ? resultado = true : resultado = false

    if(resultado){

    deleteTicketData(from)
    addProps(from,{creds: {
        createUser: botuser.data[0].createUser,
        canSOS: botuser.data[0].canSOS,
        adminPdf: botuser.data[0].adminPdf,
        id: botuser.data[0].id
    }})
    addProps(from,{users:botuser.data[0].clients})
    addProps(from,{phone: from})

    }

    return resultado

}

const validateUserID = async (from,fullId) => {
    
    addProps(from,{id: fullId})
    
      const config = {
        method: 'get',
        url: `${process.env.SERVER_URL}/clients?id=${fullId}`,
    }
    
      const user = await axios(config)
    
      if(user.data.length !== 0){
        addProps(from,{info: user.data[0].info})
        addProps(from,{vip: user.data[0].vip})
        addProps(from,{vipmail: user.data[0].vipmail})
        addProps(from,{testing: user.data[0].testing})
        return user.data[0]
      }
      else{
        return false
      }
    }

const computers = async (from) => {

    const userId = getProp(from,'selectedUser').id
    const zone = getProp(from,'zone')

    console.log(userId)
  
    const config = {
        method: 'get',
        url: `${process.env.SERVER_URL}/computers?userId=${userId}&zone=${zone}`,
    }
      
    const computers = await axios(config).then((i) => i.data)
      
    const hasOrder = computers.some((computer) => computer.order !== null);
      
    if(hasOrder){
        computers.sort((a, b) => a.order - b.order);
    }else{
        computers.sort((a, b) => {
        if (a.alias < b.alias) return -1;
        if (a.alias > b.alias) return 1;
        return 0;
        });
    }

    const computersArray = []
      
    computers.map( e=> {
        computersArray.push(e)
    })

    addProps(from,{computers: computersArray})
      
}

const altaBotuser = async (from) => {

    const newBotuser = getProp(from,'newBotuser')
  
    const config = {
        method: 'post',
        url: `${process.env.SERVER_URL}/botusers`,
        data:newBotuser
      }
      
    const result = await axios(config).then((i) => i.data)

    console.log(result)

}

module.exports = { altaBotuser,validateUser,validateUserID,computers }