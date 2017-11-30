/* StromDAO Business Object: EV Charger
 * =========================================
 * Protocol implementation: https://www.keba.com/web/downloads/e-mobility/KeContact_P20_P30_UDP_ProgrGuide_en.pdf
 * 
 * @author Thorsten Zoerner thorsten.zoerner@stromdao.com 
 * 
 * If used in StromDAO-BO's MAIN BRANCH this will be defaulted to the testnet environment.
 * 
 */
const vorpal = require('vorpal')();
var com = require("./com.js");	

module.exports = {
	report:function(args,callback) {
		args.msg = ["report "+args.num];
		
		com.send(args,callback,function (message, remote) {						
				callback(JSON.parse(message));
		});	
	},
	
	info:function(args,callback) {
		args.msg = ["i"];
		
		com.send(args,callback,function (message, remote) {						
				callback(""+message);
		});	
	},
	
	ena:function(args,callback) {
		args.msg = ["ena "+args.num];
		
		com.send(args,callback,function (message, remote) {						
				callback(""+message);
		});	
	},
	curr:function(args,callback) {
		args.msg = ["curr "+args.num];
		
		com.send(args,callback,function (message, remote) {						
				callback(""+message);
		});	
	},
	currtime:function(args,callback) {
		args.msg = ["currtime "+args.num+" "+args.delay];
		
		com.send(args,callback,function (message, remote) {						
				callback(""+message);
		});	
	},
	setenergy:function(args,callback) {
		args.msg = ["setenergy "+args.num];
		
		com.send(args,callback,function (message, remote) {						
				callback(""+message);
		});	
	},	
	start_ev:function(args,callback) {
		var tag="e3f76b8d00000000";
		var tag_class="01010400000000000000";		
		if(typeof args.options.a != "undefined") {
				tag=args.options.a.substring(2,18);
		}
		vorpal.log("Start ",tag);
		args.msg = ["start "+tag+" "+tag_class];
		
		com.send(args,callback,function (message, remote) {						
				callback(""+message);
		});	
	},	
	stop_ev:function(args,callback) {
		var tag="e3f76b8d00000000";
		var tag_class="01010400000000000000";
		if(typeof args.options.a != "undefined") {
				tag=args.options.a.substring(2,18);
		}
		args.msg = ["stop "+tag+" "+tag_class];
		
		com.send(args,callback,function (message, remote) {						
				callback(""+message);
		});	
	},		
};

var keba = module.exports;



