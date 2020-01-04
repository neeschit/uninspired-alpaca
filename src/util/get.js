export const get = url => {
  return new Promise((resolve, reject) => {
    https.get(url, response => {
      if (response.statusCode === 404) {
        return resolve(null);
      }
      if (response.statusCode < 200 || response.statusCode >= 300) {
        return reject(new Error("statusCode=" + response.statusCode));
      }
      var body = [];
      response.on("data", function(chunk) {
        body.push(chunk);
      });

      response.on("end", function() {
        try {
          body = JSON.parse(Buffer.concat(body).toString());
        } catch (e) {
          reject(e);
        }
        resolve(body);
      });
    });
  });
};
