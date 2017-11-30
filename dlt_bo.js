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
const vm = require('vm');

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
	clearing:function(args,callback) {
		var node = new StromDAOBO.Node({external_id:"stromdao-mp",rpc:global.rpcprovider,testMode:true})
		global.blk_address=node.wallet.address;
		node.roleLookup().then(function(rl) {
		rl.relations(node.wallet.address,42).then(function(tx) {
					if(tx=="0x0000000000000000000000000000000000000000") {
						vorpal.log("ERROR: Consensus failed - no Meter Point Operation in place");
						callback();
					} else {
						global.smart_contract_stromkonto=tx;
						var extid=args.customerid;	
						var report=args.reportid;				
						args.num=report;
						bo._ensureAllowedTx(extid).then(function(d) {				
							com.report(args,function(rep) {
									var node = new StromDAOBO.Node({external_id:extid,testMode:true,rpc:global.rpcprovider});						
									global.settlement={};
									global.node=node;
									settlement.account=node.wallet.address;
									var node = new StromDAOBO.Node({external_id:"stromdao-mp",testMode:true,rpc:global.rpcprovider});		
									settlement.node_account=global.blk_address;  // Require Retrieve!
									settlement.node_wallet=node.nodeWallet.address;
									
									settlement.base = Math.floor(rep["E pres"]/10);
									
									var to=settlement.node_account;
									var from=settlement.account;
									settlement.cost=0;
									
									if(typeof args.options.workprice != "undefined") {					
										if(args.options.workprice<0)  { from=settlement.node_account; to=settlement.account; } 					
										settlement.cost=Math.abs(Math.round(args.options.workprice*(settlement.base/1000)));
									}
									if(typeof args.options.sessionprice != "undefined") {					
										settlement.cost+=args.options.sessionprice*1;
									}
									var settlement_js="global.promise = new Promise(function(resolve2,reject2) { node.stromkontoproxy(global.smart_contract_stromkonto).then(function(sko) { sko.addTx(settlement.from,settlement.to,settlement.cost,settlement.base).then(function(tx) {	console.log('AddTx',settlement.from,settlement.to,settlement.cost,settlement.base,tx); resolve2(tx);});});});";																						
									
									settlement.from=from;
									settlement.to=to;
									
									var script = new vm.Script(settlement_js);
									var result=script.runInThisContext();	
									
									if(typeof global.promise!="undefined") { 
											global.promise.then(function(tx) {																								
												callback();		
											});
									} else {											
											callback();
									}											
							});
						});
					}
			});
		});
	},		
	_ensureAllowedTx:function(extid) {	
		var p1 = new Promise(function(resolve, reject) {
			var node = new StromDAOBO.Node({external_id:extid,testMode:true,rpc:global.rpcprovider});
			var sender=node.wallet.address;
			
			var node = new StromDAOBO.Node({external_id:"stromdao-mp",testMode:true,rpc:global.rpcprovider});	  
			var managed_meters= node.storage.getItemSync("managed_meters");
			
			if(managed_meters==null) managed_meters=[]; else managed_meters=JSON.parse(managed_meters);
			
			if(node.storage.getItemSync("managed_"+extid)==null) {
					managed_meters.push(extid);
					node.storage.setItemSync("managed_meters",JSON.stringify(managed_meters));	
					node.storage.setItemSync("managed_"+extid,sender);	
					node.stromkontoproxy().then(function(skop) {
							skop.modifySender(sender,true).then(function(tx) {
									vorpal.log("Mandated ",extid,tx);	
									resolve("mandated");						
							});
					});			
			} else {
				resolve("mandated");	
			}
		});
		return p1;
	},
	storage:function() {
		var node = new StromDAOBO.Node({external_id:"stromdao-mp",testMode:true,rpc:global.rpcprovider});
		return node.storage;
	}
};

var bo = module.exports;
