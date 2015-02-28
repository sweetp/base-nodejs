var net, _;

net = require('net');
_ = require('lodash');
jayson = require('jayson');

/**
 * Sweet service base class.
 *
 * @public
 * @param {String} name of service
 * @param {Object} methodsObject with service methods in it
 * @param {Integer} port of Sweetp server, leave empty to get this from environment
 * @param {String} host of Sweetp server, leave empty for localhost
 */
function SweetpService(name, methodsObject, port, host) {
	this.host = host;
	this.methods = methodsObject;

	this.log = _.partial(console.log, "[" + name + " service]");

	if (port === null || port === undefined) {
		this.port = process.env.PORT;
	} else {
		this.port = port;
	}
}

function bench(client, counter) {
	counter = counter || 0;
var start = Date.now();
client.request('echo', ["1"], function(err, error, response) {
  if(err) console.log("err", err);
  console.log("reps 1:", response, Date.now() - start); // 2!

  if (counter < 10) {
	  bench(client, ++counter);
  }
});
}

SweetpService.prototype.listen = function() {
	/*
	 *this.socket = net.createConnection(this.port, this.host, this.onConnect.bind(this));
	 *this.socket.on('data', this.onData.bind(this));
	 */

/*
 *var client = jayson.client.tcp({
 *  port: 8855,
 *  hostname: '127.0.0.1'
 *});
 */

var client = jayson.client.http("http://localhost:8800/serviceBroker");

// invoke "add"
client.request('echo', ["0"], function(err, error, response) {
  if(err) console.log("err", err);
  console.log("reps 0:", response); // 2!
});

client.request('echo', ["1"], function(err, error, response) {
  if(err) console.log("err", err);
  console.log("reps 1:", response); // 2!
});

// benchmark
//bench(client);



};

SweetpService.prototype.sendResponse = function(response) {
	var message = JSON.stringify(response);
	this.log("send: " + message);
	this.socket.write(message + "\n");
	this.log("done");
};

SweetpService.prototype.onConnect = function() {
	this.log('Connection with sweetp server established.');
};

SweetpService.prototype.onData = function(data) {
	this.log("Data recieved from server");

	try {
		return this.parseMessage(null, data, this.respond.bind(this));
	} catch (e) {
		return this.respond(e);
	}

};

SweetpService.prototype.parseMessage = function(err, data, callback) {
	var json;
	if (err) return callback(err);
	json = JSON.parse(data.toString());

	if (json.method === null || json.method === undefined ||
		typeof this.methods[json.method] !== 'function') {
		return callback(new Error("Missing method: " + json.method));
	}

	// future save, treat the method as an error first callback. This way
	// errors could be passed to the service and it react better on it than the
	// standard message. For now it is always `null`, because there can't be
	// any errors beside JSON parsing and a not matched method name.
	return this.methods[json.method].call(this.methods, null, json.params, callback);
};

SweetpService.prototype.respond = function(err, data) {
	var response;

	if (err && err.match && err.match(/^Missing method/)) {
		response = {
			status: 404,
			data: err
		};
	} else if (err) {
		console.error(err.message, err.stack);
		response = {
			status: 500,
			data: err.message
		};
	} else {
		response = {
			status: 200,
			data: data
		};
	}

	return this.sendResponse(response);
};

/**
 * Closes and destroys saved socket.
 *
 * @public
 */
SweetpService.prototype.closeSocket = function() {
	this.socket.destroy();
};

module.exports = SweetpService;
