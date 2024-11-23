// Función para evaluar las condiciones de una feature
const evaluateConditions = (conditions, context) => {
  let isEnabled = true;

  for (const condition of conditions) {
    const { field, operator, value } = condition;

    switch (operator) {
      case "equals":
        isEnabled = isEnabled && context[field] === value;
        break;
      case "different":
        isEnabled = isEnabled && context[field] !== value;
        break;
      case "greater":
        isEnabled = isEnabled && parseFloat(context[field]) > parseFloat(value);
        break;
      case "lower":
        isEnabled = isEnabled && parseFloat(context[field]) < parseFloat(value);
        break;
      case "in":
        if (Array.isArray(value)) {
          isEnabled = isEnabled && value.includes(context[field]);
        } else {
          console.error("El valor debe ser un array para el operador 'in'");
          isEnabled = false;
        }
        break;
      default:
        console.error("Operador no reconocido:", operator);
        isEnabled = false;
    }

    if (!isEnabled) break;
  }

  return isEnabled;
};

module.exports = { evaluateConditions };
