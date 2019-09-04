//need be global for comm.js
http = require('http');
https = require('https');
socksv5 = require('socksv5');
request = require('request');
fs = require('fs');
readline = require('readline');
path = require('path');
vm = require('vm');
Promise = require('promise');
nodeurl = require('url');
//CP932, CP936, CP949, CP950, GB2313, GBK, GB18030, Big5, Shift_JIS, EUC-JP.
iconv = require('iconv-lite');

var g_flag_kdj = false;
var _global = {};
var g_orderinfo = {};
function loadConfig(infile) {
	console.log('load config: ' + infile);
	_inc(infile);
	for(var i in cfg_orderinfo) {
		g_orderinfo[i] = cfg_orderinfo[i];
	}
	testarr = cfg_testarr;
}
$loadConfig = loadConfig;

process.stdin.resume();//so the program will not close instantly
var stdin = process.openStdin();
stdin.addListener("data", function(chunk) {
    // note: chunk is an object, and when converted to a string it will
    // end with a linefeed.  so we (rather crudely) account for that  
    // with toString() and then trim()
	var s = chunk.toString().trim();
	if(s == 'q') {
		console.log("wait fot safety quit");
		_global['exit'] = true;
	}
	else {
		console.log('## q with enter for safety quit ## [' + s + ']');
	}
});

var funForExit = false;
process.on('unhandledRejection', (err, p) => {
	console.log('unhandledRejection: ' + err.stack);
	if(funForExit) {
		console.log('do exit clean.');
		funForExit();
	}
});

function exitHandler(options, err) {
	//if(options.cleanup) console.log('clean');
	if(err) console.log(err.stack);
	if(options.cleanup && funForExit) {
		console.log('do exit clean.');
		funForExit();
	}
	if(options.exit) process.exit();
}

//do something when app is closing
process.on('exit', exitHandler.bind(null,{cleanup:true}));
//catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, {exit:true}));
//catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, {exit:false}));

function _inc(js) {
	var script = vm.createScript(fs.readFileSync(js)+'', js);
	script.runInThisContext();
}

_inc('./comm.js');

//argv
var optionsCmd = {};
//child process for logic
var processChild = false;

//获取配置信息
var startTime = time();
//for global various
//load from config file
logConfig({
	filepre:'fxtest-',
	debug: true,
	filecount: 5,
});

g_save = {};
basePSpace = 2;
baseAmount = 100; //for pspace=0.01
baseAct = 'sellbuy';

const BUY = 1;
const SELL = 2;
const STEP =0.003;
var g_newest_trade_time = null;
var g_trade_create = [];
var g_trade_close = [];
var g_trade_res = {};
var g_total_money = 50000; // first gain money
g_trade_res['create_max'] = 0;
g_trade_res['Max_Price'] = 0;
g_trade_res['Min_Price'] = 999;

function get_trade_act(sPrice,act){
	for( var i in g_orderinfo['pricerang']){
		var range = g_orderinfo['pricerang'][i];
		//{min:110, max:118, act:'sellbuy', amount:200, pspace:0.06, gspace: 0.1501},
		var mAct = BUY | SELL;
		if(range['act']=='buy')
			mAct = BUY;
		else if(range['act']=='sell')
			mAct = SELL;
		
		if( act&mAct && range['min']<=sPrice && range['max']>=sPrice)
			return range;
	}
	return null;
}


function do_trade_open(sDate,sPrice,sAct){
	var trade_act = get_trade_act(sPrice,sAct);
	if(trade_act==null)
		return;

	var do_trade_flag = true;
	if (g_trade_create.length!=0){
		for(var i in g_trade_create) {
			var trade_res = g_trade_create[i];
			if(trade_res['Type']==sAct 
			&& trade_res['Price']+trade_act['pspace']>=sPrice 
			&& trade_res['Price']-trade_act['pspace']<=sPrice) {
				do_trade_flag = false;
				break;
			}
		}
	}
	if(do_trade_flag){
//		if(newest_trade_time==sDate)
//			return;
//		newest_trade_time= sDate;
		g_trade_create[g_trade_create.length] = {Date:sDate,Price:sPrice,Amount:trade_act['amount'],Type:sAct};
		if(g_trade_res['create']!=null)
			g_trade_res['create'] += trade_act['amount'];
		else
			g_trade_res['create'] = trade_act['amount'];

		console.log('Create:' + ' Date = ' + getTimestamp(sDate)
							  + ' Price = ' + sPrice 
							  + ' Amount = ' + trade_act['amount'] 
							  + ' Type = ' + (sAct==BUY ? 'Buy':'Sell'));
		if(g_trade_res['create']>g_trade_res['create_max']) {
			g_trade_res['create_max'] = g_trade_res['create'];
		}
		if(g_trade_res['Max_Price']<sPrice) {
			g_trade_res['Max_Price'] = sPrice;
		}
		if(g_trade_res['Min_Price'] >sPrice){
			g_trade_res['Min_Price'] = sPrice;
		}
	}
}

function do_trade_close(sDate,sPrice,sAct){
	var trade_act = get_trade_act(sPrice,sAct);
	if(trade_act==null)
		return;
	
	if (g_trade_create.length!=0){
		var i=0;
		var do_trade = [];
		for(i in g_trade_create){
			var trade_res = g_trade_create[i];
			if(trade_res['Type']==sAct 
					&& ( (sAct==BUY && trade_res['Price']+trade_act['gspace']<sPrice) 
							|| (sAct==SELL && trade_res['Price']-trade_act['gspace']>sPrice) )){
				do_trade[do_trade.length] = i;
				//console.log('sAct=='+sAct+' trade_res[\'Price\']='+trade_res['Price'] + ' trade_act[\'gspace\']='+ trade_act['gspace']+
				//			' sPrice='+ sPrice + ' trade_res[\'Type\']='+trade_res['Type'] + ' i=' +i);
			}
				
		}
		
		if(do_trade.length>0) {
			do_trade = do_trade.reverse();
			i = 0;
			for(i in do_trade) {
				var trade_res = g_trade_create[do_trade[i]];
				var gain = (sAct==BUY)  ? Math.floor((sPrice - trade_res['Price'])* trade_res['Amount']) 
										: Math.floor((trade_res['Price'] - sPrice)* trade_res['Amount']);
				g_trade_create.splice(do_trade[i],1);
				g_trade_close[g_trade_close.length] = {CreateDate:trade_res['Date'],
													   CreatePrice:trade_res['Price'],
													   Amount:trade_res['Amount'],
													   Type:trade_res['Type'],
													   CloseDate:sDate,
													   ClosePrice:sPrice,
													   Gain:gain};
				if(g_trade_res['gain']!=null)
					g_trade_res['gain'] += gain;
				else
					g_trade_res['gain'] = gain;
				g_trade_res['create'] -= trade_res['Amount'];
				console.log('Close:' + ' CloseDate: ' + getTimestamp(sDate)
									 + ' Gain: ' + gain
						             + ' ClosePrice: ' + sPrice
						             + ' CreateDate: ' + getTimestamp(trade_res['Date']) 
									 + ' CreatePrice: ' + trade_res['Price'] 
									 + ' Amount: ' + trade_res['Amount']
									 + ' Type: ' + (trade_res['Type'] ==BUY ? 'Buy':'Sell')
									  );
			}
		}
	}
}



function start_rate2(sLine) {
	//USDJPY,20010105,135200,116.24,116.24,116.23,116.23,4
	//20170101 220444.518,116.762,117.097,0.75,0.75
	var t = 0;
	var tDate;
	var msell;
	var mbuy;
	var arr = sLine.split(',');
	if(arr && arr.length == 8 && arr[0] == 'USDJPY') {
		var year = arr[1].substring(0, 4);
		var month = arr[1].substring(4, 6);
		var day = arr[1].substring(6, 8);
		var hh = arr[2].substring(0, 2);
		var mm = arr[2].substring(2, 4);
		tDate = getDateFromYMD(year, month, day, hh, mm, 0);
		msell = arr[3]/1;
		//fixed
		mbuy = arr[3]/1 + 0.003;
	}
	else if(arr && arr.length == 5 && (arr[0].length == 19 || arr[0].length == 13)) {
		var year = arr[0].substring(0, 4);
		var month = arr[0].substring(4, 6);
		var day = arr[0].substring(6, 8);
		var hh = arr[0].substring(9, 11);
		var mm = arr[0].substring(11, 13);
		var ss = 0;
		var sss = 0;
		if(arr[0].length == 19) {
			ss = arr[0].substring(13, 15);
			// sss = arr[0].substring(16, 19); delete for filter same second time.
		}
		tDate = getDateFromYMD(year, month, day, hh, mm, ss, sss);
		msell = arr[1]/1;
		//fixed
		mbuy = arr[1]/1 + 0.003;
	}
	else {
		console.log('skip['+sLine+']');
		return 0 ;
	}

	if(g_newest_trade_time==null)
		g_newest_trade_time = tDate;
	else if(g_newest_trade_time.getTime()!=tDate.getTime()) {
		g_newest_trade_time = tDate;
		if(g_flag_kdj)
		{
			cal_KDJ(tDate,mbuy);
			//do_trade_close_KDJ(tDate,msell,BUY);
			//do_trade_close_KDJ(tDate,mbuy,SELL);
			//do_trade_open_KDJ(tDate,mbuy,BUY);
			//do_trade_open_KDJ(tDate,msell,SELL);
		}
		else {
			do_trade_close(tDate,msell,BUY);
			do_trade_close(tDate,mbuy,SELL);
			do_trade_open(tDate,mbuy,BUY);
			do_trade_open(tDate,msell,SELL);
			t = check_total2(tDate,msell,mbuy);
		}	
	}
	else {
		// do nothing!
	}
	// add end.
	//t = check_total(tDate,msell,mbuy);
	return t;
}

// if gain over 10w, reset 
function check_total2(sDate,sSell,sBuy) {

	var t = 0;
	if (g_trade_create.length!=0){
		for(var i in g_trade_create) {
			var trade_res = g_trade_create[i];
			var gain = (trade_res['Type']==BUY)  ? Math.floor((sSell - trade_res['Price'])* trade_res['Amount']) 
					: Math.floor((trade_res['Price'] - sBuy)* trade_res['Amount']);
			t += gain;
		}
		t += g_trade_res['gain'];
		if ( t >= g_total_money) {
			//g_total_money = t + 100000;
			g_trade_create.splice(0,g_trade_create.length);
			
			console.log('Reset Total Money = ' + t
					　 + ' g_trade_create.Length = ' + g_trade_create.length
					  + ' Date = ' + getTimestamp(sDate)
					  + ' Price = ' + sSell
					  + ' Gain = ' + g_trade_res['gain']);
			g_trade_res['gain'] = 0;
		}
	}
	return t;
	
}

function check_total(sDate,sSell,sBuy) {

	var t = 0;
	if (g_trade_create.length!=0){
		for(var i in g_trade_create) {
			var trade_res = g_trade_create[i];
			var gain = (trade_res['Type']==BUY)  ? Math.floor((sSell - trade_res['Price'])* trade_res['Amount']) 
					: Math.floor((trade_res['Price'] - sBuy)* trade_res['Amount']);
			t += gain;
		}
		t += g_trade_res['gain'];
		if ( t <= -150000) {
			console.log('Total Money = ' + t
					  + ' Date = ' + getTimestamp(sDate)
					  + ' Price = ' + sSell
					  + ' Gain = ' + g_trade_res['gain']);
		}
		
		if ( t >= g_total_money) {
			g_total_money += 100000;
			console.log('Total Money = ' + t
					  + ' Date = ' + getTimestamp(sDate)
					  + ' Price = ' + sSell
					  + ' Gain = ' + g_trade_res['gain']);
		}
	}
	return t;
	
}

function do_trade_open_KDJ(sDate,sPrice,sAct){
	var do_trade_flag = (g_kdj.stat()>0 && sAct==BUY) || (g_kdj.stat()<0 && sAct==SELL);
	
	if(do_trade_flag && (g_trade_create==null || g_trade_create.length<100)){
		g_trade_create[g_trade_create.length] = {Date:sDate,Price:sPrice,Amount:1000,Type:sAct};
		if(g_trade_res['create']!=null)
			g_trade_res['create'] += 1000;
		else
			g_trade_res['create'] = 1000;

		console.log('Create:' + ' Date = ' + getTimestamp(sDate)
							  + ' Price = ' + sPrice 
							  + ' Amount = ' + 1000 
							  + ' Type = ' + (sAct==BUY ? 'Buy':'Sell'));
	}
}

function do_trade_close_KDJ(sDate,sPrice,sAct){
	//var do_trade_flag = (g_kdj.stat()<0 && sAct==BUY) || (g_kdj.stat()>0 && sAct==SELL);
	
	var do_trade_flag = true;
	
	if(do_trade_flag){
		if (g_trade_create.length!=0){
			var i=0;
			var do_trade = [];
			for(i in g_trade_create){
				var trade_res = g_trade_create[i];
				var gain = (sAct==BUY)  ? Math.floor((sPrice - trade_res['Price'])* trade_res['Amount']) 
						: Math.floor((trade_res['Price'] - sPrice)* trade_res['Amount']);				
				if(trade_res['Type']==sAct && gain>5000){
					do_trade[do_trade.length] = i;
				}
					
			}
			
			if(do_trade.length>0) {
				do_trade = do_trade.reverse();
				i = 0;
				for(i in do_trade) {
					var trade_res = g_trade_create[do_trade[i]];
					var gain = (sAct==BUY)  ? Math.floor((sPrice - trade_res['Price'])* trade_res['Amount']) 
											: Math.floor((trade_res['Price'] - sPrice)* trade_res['Amount']);
					g_trade_create.splice(do_trade[i],1);
					g_trade_close[g_trade_close.length] = {CreateDate:trade_res['Date'],
														   CreatePrice:trade_res['Price'],
														   Amount:trade_res['Amount'],
														   Type:trade_res['Type'],
														   CloseDate:sDate,
														   ClosePrice:sPrice,
														   Gain:gain};
					if(g_trade_res['gain']!=null)
						g_trade_res['gain'] += gain;
					else
						g_trade_res['gain'] = gain;
					g_trade_res['create'] -= trade_res['Amount'];
					console.log('Close:' + ' CreateDate: ' + getTimestamp(trade_res['Date']) 
										 + ' CreatePrice: ' + trade_res['Price'] 
										 + ' Amount: ' + trade_res['Amount']
										 + ' Type: ' + (trade_res['Type'] ==BUY ? 'Buy':'Sell')
										 + ' CloseDate: ' + sDate
										 + ' ClosePrice: ' + sPrice
										 + ' Gain: ' + gain );
				}
			}
		}
	}
}

//var g_kdj = KDJ(9,3,3); // KDJ minute lines.

var g_kdj = KDJ_Hour(9,3,3); // KDJ hour lines.

function cal_KDJ(inDate,inPrice){
	var kdj = g_kdj.add(inPrice,inDate);
	//	console.log(''+inDate + ' K:' +  kdj.K + ' D:' +  kdj.D + ' J:' +  kdj.J);
		
	//cfg_kdj.N *60
}

function RSV(N) {
	
	var nums  = [];
	var ret = function(){
	}
	
	ret.add = function (num) {
		nums.push(num);
        if(nums.length > N) {
            nums.splice(0,1);  // remove the first element of the array
		}
		var MIN = 999;
		var MAX = 1;
		for(var i in nums){
			MIN = Math.min(MIN,nums[i]); 
			MAX = Math.max(MAX,nums[i]); 
		}
		
		return (num - MIN) / (MAX - MIN)*100;
	}
	return ret;
}

function RSV_Hour(N) {
	
	var MIN = 999;
	var MAX = 1;
	var nums  = [];
	var ret = function(){
	}
	
	ret.add = function (num) {
		nums.push(num);
        if(nums.length > N*3600*24) {
			var first  = nums[0];
            nums.splice(0,1);  // remove the first element of the array
			if(first== MIN || first==MAX){
				MIN = 999;
				MAX = 1;
				for(var i in nums) {
					MIN = Math.min(MIN,nums[i]); 
					MAX = Math.max(MAX,nums[i]); 
				}
			}				
		}
		MIN =  Math.min(MIN,num); 
		MAX = Math.max(MAX,num); 
		return (num - MIN) / (MAX - MIN)*100;
	}
	return ret;
}

function KDJ_Hour(N, M1, M2) {
	if(!N || !M1 || !M2) {
		throw new Error('error for parameter KDJ');
	}
	//var N = time_range;
	//var M1 = m_range1;
	//var M2 = m_range2;
	var kdjs = [];
	var last = {};
	var ma1 = SMA(M1, 'wma');
	var ma2 = SMA(M2, 'wma');
	var rsv = RSV_Hour(N);
	var lasttime = null;
	var ret = function() {
	}
    ret.add = function(num,nowtime) {
		//RSV=(CLOSE-LLV(LOW,N))/(HHV(HIGH,N)-LLV(LOW,N))*100;		
		//a=SMA(RSV,M1,1);
		//b=SMA(a,M2,1);
		//K:a;
		//D:b;
		//J:e;
		if(lasttime==null)
			lasttime = nowtime;
		
		var r = rsv.add(num);
		if(lasttime.getDay()!=nowtime.getDay())
		{
			var a = ma1.add(r,nowtime);
			var b = ma2.add(a,nowtime);
			var e = 3*a-2*b;
			if(a<0) a=0;
			if(a>100) a=100;
			if(b<0) b=0;
			if(b>100) b=100;
			if(e<0) e=0;
			if(e>100) e=100;
			
			last = {P:num,K:a,D:b,J:e};
			kdjs.push(last);
			if(kdjs.length > N) {
				kdjs.splice(0,1);  // only save N datas.
			}
			console.log( ''+getTimestamp(nowtime)+ ',' +  a + ', ' +  b + ', ' +  e +', ' +  num );	
		}	
		lasttime = nowtime;
		return last;
	}
	ret.last = function() {
		return last;
	}
	ret.stat = function() {
		//console.log('kdjs.length=' +  kdjs.length );
		if(kdjs.length>=N) {
			var last = kdjs[kdjs.length-1];
			var pre = kdjs[kdjs.length-2];
			//console.log('last.K=' +  last.K + ', last.D=' +  last.D + ', pre.K=' +  pre.K +', pre.D=' +  pre.K );	
			if(last.K>0 && pre.K>0 && last.D>0 && pre.D>0){
				//console.log('last.K=' +  last.K + ', last.D=' +  last.D + ', pre.K=' +  pre.K +', pre.D=' +  pre.K );	
				if (last.K>=last.D && pre.K<pre.D && last.K > pre.K && last.D > pre.D)
					return 1; // golden fork.
				if(last.K<=last.D && pre.K<pre.D && last.K < pre.K && last.D < pre.D)
					return -1; // death fork.
			}
		}
		return 0;
	}
	ret.clear = function() {
		
		ma1.clear();
		ma2.clear();

	}

	return ret;

}

function KDJ(N, M1, M2) {
	if(!N || !M1 || !M2) {
		throw new Error('error for parameter KDJ');
	}
	//var N = time_range;
	//var M1 = m_range1;
	//var M2 = m_range2;
	var kdjs = [];
	var last = {};
	var ma1 = SMA(M1, 'wma');
	var ma2 = SMA(M2, 'wma');
	var rsv = RSV(N);
	var ret = function() {
	}
    ret.add = function(num,nowtime) {
		//RSV=(CLOSE-LLV(LOW,N))/(HHV(HIGH,N)-LLV(LOW,N))*100;		
		//a=SMA(RSV,M1,1);
		//b=SMA(a,M2,1);
		//K:a;
		//D:b;
		//J:e;
		var r = rsv.add(num);
		
		var a = ma1.add(r,nowtime);
		var b = ma2.add(a,nowtime);
		var e = 3*a-2*b;
		if(a<0) a=0;
		if(a>100) a=100;
		if(b<0) b=0;
		if(b>100) b=100;
		if(e<0) e=0;
		if(e>100) e=100;
		
		last = {P:num,K:a,D:b,J:e};
		kdjs.push(last);
        if(kdjs.length > N) {
            kdjs.splice(0,1);  // only save N datas.
		}
		//console.log( ''+getTimestamp(nowtime)+ ',' +  a + ', ' +  b + ', ' +  e +', ' +  num );		
		return last;
	}
	ret.last = function() {
		return last;
	}
	ret.stat = function() {
		//console.log('kdjs.length=' +  kdjs.length );
		if(kdjs.length>=N) {
			var last = kdjs[kdjs.length-1];
			var pre = kdjs[kdjs.length-2];
			//console.log('last.K=' +  last.K + ', last.D=' +  last.D + ', pre.K=' +  pre.K +', pre.D=' +  pre.K );	
			if(last.K>0 && pre.K>0 && last.D>0 && pre.D>0){
				//console.log('last.K=' +  last.K + ', last.D=' +  last.D + ', pre.K=' +  pre.K +', pre.D=' +  pre.K );	
				if (last.K>=last.D && pre.K<pre.D && last.K > pre.K && last.D > pre.D)
					return 1; // golden fork.
				if(last.K<=last.D && pre.K<pre.D && last.K < pre.K && last.D < pre.D)
					return -1; // death fork.
			}
		}
		return 0;
	}
	ret.clear = function() {
		
		ma1.clear();
		ma2.clear();

	}

	return ret;
}


function start_list(infile) {
	listfile = './testlog/filelist.txt';;
	//listfile = infile || './testlog/filelist.txt';
	//infile = infile || './testlog/USDJPY.txt';
	if(!dExist('./testlog/')) {
		dCreate('./testlog/');
	}

	console.log('start.');
	if(infile!='-kdj'){
		loadConfig(infile);
	}
	else {
		g_flag_kdj = true;
	}
	
	var lineByLine = require('./lineReader');
	var liner = new lineByLine(listfile);
	var t = 0;
	var line;
	var lineNumber = 0;
	while (line = liner.next()) {
	    //console.log('Line ' + lineNumber + ': ' + line.toString('ascii'));
	    t = start_rate(line.toString('ascii'));
	    lineNumber++;
	}
	
	console.log('remain-created: ' + g_trade_res['create']
	            + 'remain-count:' + g_trade_create.length
				+ ', TotalGain: ' + g_trade_res['gain'] 
				+ ', TotalMoney: ' + t
				+ ', Create_Max: ' + g_trade_res['create_max']
				+ ', Max_Price: ' + g_trade_res['Max_Price']
				+ ', Min_Price: ' + g_trade_res['Min_Price'] );

    console.log('end');
	//console.log(g_trade_create);
	//console.log(g_trade_close);
	process.exit();

}


function start_rate(infile) {
	//infile = infile || './testlog/USDJPY.txt';
	if(!dExist('./testlog/')) {
		dCreate('./testlog/');
	}
	
	//console.log('read start: ' + infile);

	var lineByLine = require('./lineReader');
	var liner = new lineByLine(infile);
	var t = 0;
	var line;
	var lineNumber = 0;
	while (line = liner.next()) {
	    //console.log('Line ' + lineNumber + ': ' + line.toString('ascii'));
	    t = start_rate2(line.toString('ascii'));
	    lineNumber++;
	}
	return t;
	//console.log('end sub');
	
}

function start_entry() {
	if(typeof(optionsCmd) === 'undefined') {
		optionsCmd = {};
	}
	var options = process.argv;
	for(var i = 0; i < options.length; i++) {
		if(options[i].substring(0, 1) == '-' && i + 1 < options.length) {
			optionsCmd[options[i]] = options[i+1];
		}
	}
	
	if(optionsCmd['-cmd']) {
		console.log('-cmd ' + optionsCmd['-cmd']);
		if(optionsCmd['-cmd'] == 'fxtest') {
			if(optionsCmd['-conf'])
			{
				var f = optionsCmd['-conf'];
				start_list(f);
				return;
			}
		}
		else if(optionsCmd['-cmd'] == 'kdj') {
			var f = '-kdj';
			start_list(f);
			return;
		}
		//else if(optionsCmd['-cmd'] == 'fxrate') {
		//	var f = optionsCmd['-file'];
		//	start_rate(f);
		//	return;
		//}
	}
	console.log('need -cmd fxtest -conf CONFIGFILE.');
}

start_entry();
