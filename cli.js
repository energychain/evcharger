#!/usr/bin/env node

/* StromDAO Business Object: EV Charger
 * =========================================
 * Payment and Clearing for eMobility in Energy Blockchain.
 * 
 * @author Thorsten Zoerner thorsten.zoerner@stromdao.com 
 * 
 * If used in StromDAO-BO's MAIN BRANCH this will be defaulted to the testnet environment.
 * 
 */
 
const vorpal = require('vorpal')();
var com = require("./com.js");	
var keba = require("./keba.js");	
var bo = require("./dlt_bo.js");
						
vorpal
  .command('listen')  
  .option('-i <IP>','IP Address to listen on')
  .option('-p <PORT>','Port to listen on (default 7090)')
  .action(com.listen);

vorpal
  .command('send [msg...]')  
  .option('-i <IP>','IP Address of KEBA KeContact UDP Protocol enabled Wallbox')
  .action(com.send);

vorpal
  .command('report <num>','Requests a report with id (1=Device,2=Overview, 3=Stats,1xx=History)')  
  .option('-i <IP>','IP Address of KEBA KeContact UDP Protocol enabled Wallbox')
  .action(function(args,callback) { 	    vorpal.log("Report ",args.num); keba.report(args,function(report) {  vorpal.log(report); callback(); }) });		
  
vorpal
  .command('info')  
  .option('-i <IP>','IP Address of KEBA KeContact UDP Protocol enabled Wallbox')
  .action(function(args,callback) { 
	    vorpal.log("Info");
		keba.info(args,function(report) { 
			vorpal.log(report); callback(); 
		})
	});  
	
vorpal
  .command('ena <num>','Issue ENA command. (0=disable,1=enable)')  
  .option('-i <IP>','IP Address of KEBA KeContact UDP Protocol enabled Wallbox')
  .action(function(args,callback) { vorpal.log("ENA ",args.num); keba.ena(args,function(responds) {  vorpal.log(responds); callback(); }) });		
  
vorpal
  .command('curr <num>','Issue CURR command. (Is the maximum allowed loading current in milliampere)')  
  .option('-i <IP>','IP Address of KEBA KeContact UDP Protocol enabled Wallbox')
  .action(function(args,callback) {  vorpal.log("CURR ",args.num); keba.curr(args,function(responds) {  vorpal.log(responds); callback(); }) });		

vorpal
  .command('currtime <num> <delay>','With the command “currtime” it is possible to set a time delayed “curr” and / or “ena” command. This command will be disabled automatically after unplugging your vehicle.')  
  .option('-i <IP>','IP Address of KEBA KeContact UDP Protocol enabled Wallbox')
  .action(function(args,callback) { vorpal.log("CURRTIME ",args.num,args.delay); keba.currtime(args,function(responds) {  vorpal.log(responds); callback(); }) });		

vorpal
  .command('setenergy <num>','With the command “setenergy” it is possible to charge until the Value “E pres” shown with “report 3” reaches the energy limit. This command will be disabled automatically after unplugging your vehicle.')  
  .option('-i <IP>','IP Address of KEBA KeContact UDP Protocol enabled Wallbox')
  .action(function(args,callback) { vorpal.log("SETENERGY ",args.num); keba.setenergy(args,function(responds) {  vorpal.log(responds); callback(); }) });		

vorpal
  .command('startEV','Start charging session for')  
  .option('-i <IP>','IP Address of KEBA KeContact UDP Protocol enabled Wallbox')
  .option('-a <address>','Address to charge on')
  .types({
    string: ['a']
  })
  .action(function(args,callback) { vorpal.log("start"); keba.start_ev(args,function(responds) {  vorpal.log(responds); callback(); }) });		
    
vorpal
  .command('stopEV','Stop charging session for')  
  .option('-i <IP>','IP Address of KEBA KeContact UDP Protocol enabled Wallbox')
  .option('-a <address>','Address to charge on')
  .types({
    string: ['a']
  })
  .action(function(args,callback) { vorpal.log("stop"); keba.stop_ev(args,function(responds) {  vorpal.log(responds); callback(); }) });		
              
vorpal
  .command('update','Update meter reading')  
  .option('-i <IP>','IP Address of KEBA KeContact UDP Protocol enabled Wallbox')    
  .action(function(args,callback) { vorpal.log("update"); bo.update(args,function() {  callback(); }) });

vorpal
  .command('lastReading','Get last commited Reading')  
  .option('-i <IP>','IP Address of KEBA KeContact UDP Protocol enabled Wallbox')    
  .action(function(args,callback) { vorpal.log("lastReading"); bo.lastReading(args,function() {  callback(); }) });  

vorpal
  .command('start <customerid>','Start Charging Customer ID')  
  .option('-i <IP>','IP Address of KEBA KeContact UDP Protocol enabled Wallbox')    
  .action(function(args,callback) { vorpal.log("start"); bo.start(args,function() {  callback(); }) });  
  

vorpal
  .command('stop <customerid>','Stop Charging Customer ID')  
  .option('-i <IP>','IP Address of KEBA KeContact UDP Protocol enabled Wallbox')    
  .action(function(args,callback) { vorpal.log("stop"); bo.stop(args,function() {  callback(); }) });    

vorpal
  .command('retrieve <customerid>','Retrieve Customer ID')  
  .option('-i <IP>','IP Address of KEBA KeContact UDP Protocol enabled Wallbox')    
  .action(function(args,callback) { vorpal.log("retrieve"); bo.retrieve(args,function() {  callback(); }) });          	
  
var interactive = vorpal.parse(process.argv, {use: 'minimist'})._ === undefined;

if (interactive) {
	vorpal
		.delimiter('stromdao.ev $')
		.show();
} else {
	// argv is mutated by the first call to parse.
	process.argv.unshift('');
	process.argv.unshift('');
	vorpal.parent=this;
	vorpal
		.delimiter('')
		.parse(process.argv);
}
	
