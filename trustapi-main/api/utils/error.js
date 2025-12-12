export const errorHandler = (status, message) => {
  const error = new Error(message);
  error.status = status;
  error.statusCode = status;
  return error;
};
