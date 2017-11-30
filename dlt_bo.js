/* StromDAO Business Object: EV Charger
 * =========================================
 * Connect to Business Object ( https://github.com/energychain/StromDAO-BusinessObject ) 
 * 
 * @author Thorsten Zoerner thorsten.zoerner@stromdao.com 
 * 
 * If used in StromDAO-BO's MAIN BRANCH this will be defaulted to the testnet environment.
 * 
 */
 
const vorpal = require('vorpal')();
var com = require("./keba.js");	
var StromDAOBO = require("stromdao-businessobject");   

module.exports = {
	
	update:function(args,callback) {
		args.num="3";
		com.report(args,function(report) {			
			var extid=report.Serial;
			var reading =Math.floor(report["E total"]/10);
			if(reading>0) {
				var node = new StromDAOBO.Node({external_id:extid,testMode:true,rpc:global.rpcprovider});
				vorpal.log("BC Twin",node.wallet.address);
				node.mpr().then(function(mpo) {					
						mpo.storeReading(reading).then(function(tx) {
								vorpal.log("Updated Serial",extid,reading);
								vorpal.log("Tx",tx);
								callback();
						});					
				});			
			} else {
				callback();
			}
		});
	},	
	lastReading:function(args,callback) {
		args.num="3";
		com.report(args,function(report) {	
			var extid=report.Serial;		
			var node = new StromDAOBO.Node({external_id:extid,testMode:true,rpc:global.rpcprovider});			
				node.mpr().then(function(mpo) {	
					mpo.readings(node.wallet.address).then(function(reading) {
						if(reading.power.toString()*1<Math.floor(report["E total"]/10)) {
							mpo.storeReading(Math.floor(report["E total"]/10)).then(function(tx) {
								vorpal.log("Updated Serial",extid,reading);
								vorpal.log("Tx",tx);
								vorpal.log("Reading",reading.time.toString(),reading.power.toString());
								callback(reading);	
							});		
							
						} else {
							vorpal.log("Reading",reading.time.toString(),reading.power.toString());
							callback(reading);							
						}
						
					});		
				});				
		});
	},
	start:function(args,callback) {			
		bo.lastReading(args,function(reading) {
			var extid=args.customerid;
			var node = new StromDAOBO.Node({external_id:extid+"_input",testMode:true,rpc:global.rpcprovider});
			node.mpr().then(function(mpo) {					
				mpo.storeReading(reading.power.toString()).then(function(tx) {
					vorpal.log("Updated Customer",extid,reading.power.toString());
					vorpal.log("Tx",tx);
					callback();
				});					
			});					
		});				
	},	
	stop:function(args,callback) {
		bo.lastReading(args,function(reading) {
			var extid=args.customerid;
			var node = new StromDAOBO.Node({external_id:extid+"_input",testMode:true,rpc:global.rpcprovider});
			var input = node.wallet.address;
			var node = new StromDAOBO.Node({external_id:extid,testMode:true,rpc:global.rpcprovider});
			node.mpr().then(function(mpo) {					
				mpo.readings(input).then(function(tx) {
					var delta = reading.power.toString()*1-tx.power.toString()*1;
					if(delta>0) {
						mpo.readings(node.wallet.address).then(function(rx) {
								delta+=rx.power.toString()*1;
								mpo.storeReading(delta).then(function(yx) {
										vorpal.log("Tx",yx);
										callback();
								});								
						});
					} else {
						vorpal.log("No Consumption");
						callback();
					}
				});					
			});					
		});		
	},	
	retrieve:function(args,callback) {		
		var extid=args.customerid;			
		var node = new StromDAOBO.Node({external_id:extid,testMode:true,rpc:global.rpcprovider});
		node.mpr().then(function(mpo) {					
			mpo.readings(node.wallet.address).then(function(tx) {
				vorpal.log("Last Charge",new Date(tx.time.toString()*1000).toLocaleString());
				vorpal.log("Total Energy",tx.power.toString());
			});					
		});							
	},			
};

var bo = module.exports;
