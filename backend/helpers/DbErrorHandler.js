const DbErrorHandler = {};

DbErrorHandler.translateError = (err) => {
  let errors = {};
  Object.entries(err).forEach(
    entry => {
      const [key, value] = entry;
      errors[key] = value["message"];
    }  
  );
  return errors;
}

module.exports = DbErrorHandler;
