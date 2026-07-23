function sendSuccess(res, data, statusCode) {
  return res.status(statusCode || 200).json({
    success: true,
    data: data,
    error: null
  });
}

function sendError(res, message, statusCode) {
  return res.status(statusCode || 500).json({
    success: false,
    data: null,
    error: message
  });
}

module.exports = {
  sendSuccess,
  sendError
};
