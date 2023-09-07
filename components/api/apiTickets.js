let ticket = {}

const addProps = (from,props) => {
    if(ticket.hasOwnProperty(from)){
      Object.assign(ticket[from], props);
    }
    else{
      ticket[from] = {}
      Object.assign(ticket[from], props);
    }
    console.log(ticket)
}

const getProp = (from,prop) => {
    return ticket[from][prop]
}

const deleteTicketData = (from) => {
  ticket[from] = {}
}

const getInstructivo = (from, index) => {
  const instructivos = ticket[from].instructivos;

  // Convertir el índice a un número entero
  const numericIndex = parseInt(index);

  if(parseInt(index) === instructivos.length+1) return "Salir"

  // Verificar si el índice es un número entero válido
  if (!Number.isInteger(numericIndex) || numericIndex <= 0 || numericIndex > instructivos.length) {
    console.error('Índice inválido o fuera de rango.');
    return false;
  }

  const path = instructivos[numericIndex - 1].path;
  const filename = instructivos[numericIndex - 1].filename;
  return { path, filename };
};

module.exports = { addProps,getProp,deleteTicketData,getInstructivo }