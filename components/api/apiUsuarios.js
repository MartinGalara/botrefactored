const axios = require('axios')
const dotenv = require("dotenv");

dotenv.config();

const { addProps,deleteTicketData } = require("./apiTickets.js")

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

module.exports = { validateUser }