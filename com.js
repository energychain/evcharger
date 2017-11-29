const vorpal = require('vorpal')();
var dgram = require('dgram');
var server = null;
var communication_port = 7090;


module.exports = {
  listen: function (args, callback,recv) {
		if(server==null) {
			server = dgram.createSocket('udp4');		
		}
		var device_port = 7090;
		var device_ip='0.0.0.0';
		if(typeof args.options.i != "undefined") device_ip=args.options.i;
		if(typeof args.options.p != "undefined") device_port=args.options.p;		

		server.on('listening', function () {
			var address = server.address();
			vorpal.log('UDP Server listening on ' + address.address + ":" + address.port);			
			callback();
		});

		server.on('message', function (message, remote) {						
			if(typeof recv != "undefined") {
				recv(message,remote);
			} else {
				vorpal.log(remote.address + ':' + remote.port +' - ' +message);	
				callback();
			}
		});

		server.bind(device_port,device_ip);		
		
  },

   send: function (args, callback,recv) {
		let message = args.msg.join(' ');		
		var device_port=7090;
		var device_ip=null;
		if(typeof args.options.i != "undefined") device_ip=args.options.i;
		
		if(typeof recv=="undefined") {
			recv = function(message,remote) {
				vorpal.log("Rx",remote.address + ':' + remote.port +' - ' +message);
				server.close(function() {
					server = null;  // Cleanup				
					callback();				
				});			
			}
		}
		
		if(server == null) {
				com.listen({options:[]},function() {
					com.send(args,callback);
				},recv);
		} else {		
			server.send(message, 0, message.length, device_port,device_ip, function(err, bytes) {
				if (err) throw err;
				vorpal.log('UDP message sent to ' + device_ip +':'+ device_port);						
			});		
		}
  }
};
com = module.exports;
