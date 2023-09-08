const axios = require('axios')
const dotenv = require("dotenv");

dotenv.config();

const { addProps,getProp,deleteTicketData } = require("./apiTickets.js")

const validateUser = async (from) => {

    const config = {
        method: 'get',
        url: `${process.env.SERVER_URL}/vipusers?phone=${from}`,
    }
    
    const vipuser = await axios(config)

    let resultado
    
    vipuser.data.length ? resultado = true : resultado = false

    vipuser.data.length && deleteTicketData(from)
    vipuser.data.length && addProps(from,{vipuser: vipuser.data[0]})
    
    return resultado

}

const validateUserID = async (from,id) => {

    const bandera = getProp(from,'bandera')

    const fullId = bandera + id
    
    addProps(from,{userId: fullId})
    
      const config = {
        method: 'get',
        url: `${process.env.SERVER_URL}/users?id=${fullId}`,
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

    const userId = getProp(from,'userId')
    const zone = getProp(from,'zone')
  
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

module.exports = { validateUser,validateUserID,computers }