const respuesta = async (from,provider,text) => {

    let prov = provider.getInstance()

    await prov.sendMessage(`${from}@s.whatsapp.net`,{text})
}

const respuestaConDelay = async (from,provider,text) => {

    setTimeout(async ()=> {
        let prov = provider.getInstance()

        await prov.sendMessage(`${from}@s.whatsapp.net`,{text})
    },500)

}

module.exports = {respuesta,respuestaConDelay}