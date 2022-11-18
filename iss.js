// iss.js 

const request = require('request');

const fetchMyIP = function(callback) {
  // use request to fetch IP address from JSON API
  request("https://api.ipify.org/?format=json", (error, response, body) => {
    // error can be set if invalid domain, user is offline, etc.
    if (error) {
      callback(error, null);
      return;
    }

    // if non-200 status, assume server error
    if (response.statusCode !== 200) {
      const msg = `Status Code ${response.statusCode} when fetching IP. Response: ${body}`;
      callback(Error(msg), null);
      return;
    }
    
    // if we get here, all's well and we got the data
    const data = JSON.parse(body);
    callback(null, data.ip);
    
  });
};

const fetchCoordsByIP = function(ip, callback) {
  // use request to fetch IP address from JSON API
  request(`http://ipwho.is/${ip}`, (error, response, body) => {
    // error can be set if invalid domain, user is offline, etc.
    if (error) {
      callback(error, null);
      return;
    }

    const data = JSON.parse(body);

    // if status = false
    if (data.success === false) {
      const msg = `Error: Success status was false. Server message says: ${data.message} for IP ${ip}`;
      callback(Error(msg), null);
      return;
    }
    
    // if we get here, all's well and we got the data
    const location = {
      latitude: data.latitude,
      longitude: data.longitude
    };
    callback(null, location);
    
  });
};

const fetchISSFlyOverTimes = function(coords, callback) {
  // use request to fetch IP address from JSON API
  request(`https://iss-flyover.herokuapp.com/json/?lat=${coords.latitude}&lon=${coords.longitude}`, (error, response, body) => {
    // error can be set if invalid domain, user is offline, etc.
    if (error) {
      callback(error, null);
      return;
    }

    // if non-200 status, assume server error
    if (response.statusCode !== 200) {
      const msg = `Status Code ${response.statusCode} when fetching SS pass times: ${body}`;
      callback(Error(msg), null);
      return;
    }
    
    // if we get here, all's well and we got the data
    const data = JSON.parse(body);
    callback(null, data.response);
    
  });
};

/**
 * Orchestrates multiple API requests in order to determine the next 5 upcoming ISS fly overs for the user's current location.
 * Input:
 *   - A callback with an error or results. 
 * Returns (via Callback):
 *   - An error, if any (nullable)
 *   - The fly-over times as an array (null if error):
 *     [ { risetime: <number>, duration: <number> }, ... ]
 */ 
const nextISSTimesForMyLocation = function(callback) {
  fetchMyIP((error, ip) => {
    if (error) {
      return callback(error, null);
    }

    fetchCoordsByIP(ip, (error, coordinates) => {
      if (error) {
        return callback(error.message, null);
      }
      
      fetchISSFlyOverTimes(coordinates, (error, times) => {
        if (error) {
          return callback(error.message, null);
        }

        callback(null, times);
      });
    });
  });
};


module.exports = { nextISSTimesForMyLocation };
