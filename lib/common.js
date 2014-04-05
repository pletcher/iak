exports.done = function(response, data, callback) {
  var statusCode = response.statusCode;

  if (statusCode === 404) {
    data = { statusCode: response.statusCode };

    return callback(null, data);
  }

  try {
    data = JSON.parse(data);
  } catch (error) {
    callback(error);
  }

  data.statusCode = statusCode;

  callback(null, data);
};
