const { addProps } = require("./apiTickets.js")

const banderaElegida = (from,body) => {

    switch (body) {
        case "1": 
            addProps(from,{bandera: "YP"})
            return true
        case "2": 
            addProps(from,{bandera: "SH"})
            return true
        case "3": 
            addProps(from,{bandera: "AX"})
            return true
        case "4": 
            addProps(from,{bandera: "PU"})
            return true
        case "5": 
            addProps(from,{bandera: "GU"})
            return true
        case "6": 
            addProps(from,{bandera: "RE"})
            return true   
        case "7": 
            addProps(from,{bandera: "BL"})
            return true
        case "8": 
            addProps(from,{bandera: "OT"})
            return true
       
        default:
            return false
       }

}

const zonaElegida = (from,body) => {
    switch (body) {
        case "1": 
            addProps(from,{zone: "P"})
            return true;
        case "2": 
            addProps(from,{zone: "T"})
            return true;
        case "3": 
            addProps(from,{zone: "B"})
            return true;
        case "4": 
            addProps(from,{zone: "A"})
            return true;

        default:
            return false;
       }
}

module.exports = { banderaElegida,zonaElegida }