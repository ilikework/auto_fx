//need be global for comm.js
http = require('http');
https = require('https');
socksv5 = require('socksv5');
request = require('request');
fs = require('fs');
path = require('path');
vm = require('vm');
Promise = require('promise');
nodeurl = require('url');
//CP932, CP936, CP949, CP950, GB2313, GBK, GB18030, Big5, Shift_JIS, EUC-JP.
iconv = require('iconv-lite');

var _global = {};
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
testarr = [
	{pspace:1, gspace:0.03001, amount:3000},
	{pspace:1, gspace:0.06001, amount:3000},
	{pspace:1, gspace:0.1001, amount:3000},
	{pspace:1, gspace:0.15001, log:true, amount:3000},
	{pspace:1, gspace:0.3001, amount:3000},
	{pspace:0.03, gspace:0.03001, amount:100},
	{pspace:0.03, gspace:0.06001, amount:100},
	{pspace:0.03, gspace:0.1001, amount:100},
	{pspace:0.03, gspace:0.15001, log:true, amount:100, log2:true},
	{pspace:0.03, gspace:0.3001, amount:100},
	{pspace:0.06, gspace:0.03001, amount:200},
	{pspace:0.06, gspace:0.06001, amount:200},
	{pspace:0.06, gspace:0.1001, amount:200},
	{pspace:0.06, gspace:0.15001, log:true, amount:200},
	{pspace:0.06, gspace:0.3001, amount:200},
	{pspace:0.3, gspace:0.03001, amount:1000},
	{pspace:0.3, gspace:0.06001, amount:1000},
	{pspace:0.3, gspace:0.1001, amount:1000},
	{pspace:0.3, gspace:0.15001, log:true, amount:1000},
	{pspace:0.3, gspace:0.3001, amount:1000},
];

function update_price_prn_lastmm() {
	for(var jj in testarr) {
		var id = testarr[jj].id;
		var g_save = g_saveall[id];

		//print list
		sTxt = '\r\n\r\n';
		for(var i=0; i<g_save.list.length; i++) {
			var item = g_save.list[i];
			sTxt += '{t}, {a}/{p}\r\n'.format(item);
		}

		fWrite('./testlog/fxtest-gain-'+id+'-y.save', sTxt+g_save.cfg.lastym+' gain:'+g_save.gain[g_save.cfg.lastym]+'\r\n', true, true);
		fWrite('./testlog/fxtest-gain-'+id+'-y.save', g_save.cfg.lasty+' gain:'+g_save.gain[g_save.cfg.lasty]+'\r\n', true, true);
	}
}
function update_price_prn_yy() {
	fWrite('./testlog/fxtest-yyyy.save', '', false, true);
	for(var yyyy in g_saveall.yyyy) {
		for(var yyyymm in g_saveall.yyyymm) {
			if(!yyyymm.startsWith(yyyy)) {
				continue;
			}
			var gainArr = [];
			for(var jj in testarr) {
				var gArr = g_saveall[testarr[jj].id];
				if(!gArr) {
					continue;
				}
				var item = {
					k:testarr[jj].id + ' gain('+gArr.cfg.amount+')',
					g:gArr.gain[yyyymm],
					l:gArr.len[yyyymm],
				};
				gainArr.push(item);
			}
			ObjArraySort(gainArr, 'g', 'desc');
			for(var ii=0; ii<10 && ii<gainArr.length; ii++) {
				console.log(yyyymm+'('+ii+') '+gainArr[ii].k + ':'+gainArr[ii].g +', len:'+gainArr[ii].l);
				fWrite('./testlog/fxtest-yyyy.save', yyyymm+'('+ii+') '+gainArr[ii].k + ':'+gainArr[ii].g +', len:'+gainArr[ii].l+'\r\n', true, true);
			}
		}
		
		var gainArr = [];
		for(var jj in testarr) {
			var gArr = g_saveall[testarr[jj].id];
			if(!gArr) {
				continue;
			}
			var item = {
				k:testarr[jj].id + ' gain('+gArr.cfg.amount+')',
				g:gArr.gain[yyyy],
				l:gArr.len[yyyy],
			};
			gainArr.push(item);
		}
		ObjArraySort(gainArr, 'g', 'desc');
		for(var ii=0; ii<10 && ii<gainArr.length; ii++) {
			console.log(yyyy+'('+ii+') '+gainArr[ii].k + ':'+gainArr[ii].g +', len:'+gainArr[ii].l);
			fWrite('./testlog/fxtest-yyyy.save', yyyy+'('+ii+') '+gainArr[ii].k + ':'+gainArr[ii].g +', len:'+gainArr[ii].l+'\r\n', true, true);
		}
	}
}

//test
function update_price(g_save, tDate, msell, mbuy) {
	var id = g_save.cfg.id;
	var pricespace = g_save.cfg.pricespace;
	var gainspace = g_save.cfg.gainspace;
	var amount = g_save.cfg.amount;
	var priceact = g_save.cfg.act;
	if(!tDate) {
		tDate = new Date();
	}
	if(!g_save.list) {
		//列表
		g_save.list = [];
		g_save.len = {};
		//损益
		g_save.gain = {};
	}

	var sdateyy = dateFormat(tDate, 'yyyy');
	var sdatemm = dateFormat(tDate, 'yyyyMM');
	var sdate = dateFormat(tDate, 'yyyyMMdd');
	if(!g_saveall.yyyy[sdateyy]) {
		g_saveall.yyyy[sdateyy] = sdateyy;
	}
	if(!g_saveall.yyyymm[sdatemm]) {
		g_saveall.yyyymm[sdatemm] = sdatemm;
	}
	if(!g_save.gain['all']) {
		g_save.len['all'] = 0;
	}
	if(!g_save.gain[sdateyy]) {
		g_save.gain[sdateyy] = 0;
		g_save.len[sdateyy] = 0;
	}
	if(!g_save.gain[sdatemm]) {
		g_save.gain[sdatemm] = 0;
		g_save.len[sdatemm] = 0;
	}
	if(!g_save.gain[sdate]) {
		g_save.gain[sdate] = 0;
		g_save.len[sdate] = 0;
	}

	if(!g_save.cfg.lasty) {
		g_save.cfg.lasty = sdateyy;
	}
	if(!g_save.cfg.lastym) {
		g_save.cfg.lastym = sdatemm;
		fWrite('./testlog/fxtest-gain-'+id+'-y.save', 'amount:'+amount+', pricespace:'+pricespace+', gainspace:'+gainspace+', act:'+priceact+'\r\n', false, true);
	}
	if(g_save.cfg.lastym != sdatemm) {
		//print list
		sTxt = '\r\n\r\n';
		for(var i=0; i<g_save.list.length; i++) {
			var item = g_save.list[i];
			sTxt += '{t}, {a}/{p}\r\n'.format(item);
		}

		fWrite('./testlog/fxtest-gain-'+id+'-y.save', sTxt+g_save.cfg.lastym+' gain:'+g_save.gain[g_save.cfg.lastym]+'\r\n', true, true);
		g_save.cfg.lastym = sdatemm;
	}
	if(g_save.cfg.lasty != sdateyy) {
		fWrite('./testlog/fxtest-gain-'+id+'-y.save', g_save.cfg.lasty+' gain:'+g_save.gain[g_save.cfg.lasty]+'\r\n', true, true);
		g_save.cfg.lasty = sdateyy;
	}

	var macd = g_saverate.macd;
	var dir = macd.dir();
	var last = macd.last();
	if(!g_save.cfg.macd) {
		macd = false;
		dir = 0;
	}
	if(typeof(g_save.dir1) == 'undefined') {
		g_save.dir1 = dir;
	}
	var nRet = 0;
	var sdatehhmm = dateFormat(tDate, 'yyyyMMdd hh:mm');
	//console.log('pricespace:'+pricespace + ', gainspace:' + gainspace+', msell:'+msell+', mbuy:'+mbuy+', amount:'+amount);

	var cntAmountSell = 0;
	var cntAmountBuy = 0;
	var needSell = true;
	var needBuy = true;
	for(var i=g_save.list.length-1; i>=0; i--) {
		var item = g_save.list[i];
		if(item.t == 'sell') {
			cntAmountSell += item.a;
			var gainone = item.p - mbuy;
			// || (macd && dir >= 2 && gainone > 0)
			if(item.a > 0 && (gainone >= gainspace)) {
				if(macd && dir <= 0 && gainone < gainspace*5) {
					gainone = 0;
				}
			}
			if(item.a > 0 && (gainone >= gainspace)) {
				var gain = gainone*item.a;
				//moneypartners直接舍位取整
				gain = Math.floor(gain);
				g_save.gain[sdate] += gain;
				g_save.gain[sdatemm] += gain;
				g_save.gain[sdateyy] += gain;
				g_save.gain['all'] += gain;
				var gainall = ', all(d):'+g_save.gain[sdate]+', m:'+g_save.gain[sdatemm]+', y:'+g_save.gain[sdateyy];
				//log(id+', gain:'+gain+', sell:'+item.p+', now buy:'+mbuy+', a:'+item.a+gainall, false);
				if(g_save.cfg.log) {
					var sdate0 = dateFormat(tDate, 'MMdd hh:mm:ss');
					fWrite('./testlog/fxtest-gain-'+id+'.save', sdate0+' dir:'+dir+', gain:'+gain+', sell:'+item.p+', now buy:'+mbuy+', a:'+item.a+gainall+'\r\n', true, true);
					if(g_save.cfg.macd && g_save.cfg.log2)
					fWrite('./fx-macd-1.log', sdate0+'-'+dir+'S2b,'+msell + "," + last.ma1 + "," + last.ma2 + "," + last.ma2_b+','+dir+'\r\n', true, true);
				}
				g_save.list.splice(i, 1);
				needSell = false;
				needBuy = false;
				nRet++;
				//break;
			}
			if(Math.abs(item.p - msell) < pricespace) {
				needSell = false;
			}
		}
		else {
			cntAmountBuy += item.a;
			var gainone = msell - item.p;
			// || (macd && dir <= -2 && gainone > 0)
			if(item.a > 0 && (gainone >= gainspace)) {
				if(macd && dir >= 0 && gainone < gainspace*5) {
					gainone = 0;
				}
			}
			if(item.a > 0 && (gainone >= gainspace)) {
				var gain = gainone*item.a;
				gain = Math.floor(gain);
				g_save.gain[sdate] += gain;
				g_save.gain[sdatemm] += gain;
				g_save.gain[sdateyy] += gain;
				g_save.gain['all'] += gain;
				var gainall = ', all(d):'+g_save.gain[sdate]+', m:'+g_save.gain[sdatemm]+', y:'+g_save.gain[sdateyy];
				//log(id+', gain:'+gain+', buy price:'+item.p+', now sell:'+msell+gainall, false);
				if(g_save.cfg.log) {
					var sdate0 = dateFormat(tDate, 'MMdd hh:mm:ss');
					fWrite('./testlog/fxtest-gain-'+id+'.save', sdate0+' dir:'+dir+', gain:'+gain+', buy:'+item.p+', now sell:'+msell+', a:'+item.a+gainall+'\r\n', true, true);
					if(g_save.cfg.macd && g_save.cfg.log2)
					fWrite('./fx-macd-1.log', sdate0+'-'+dir+'B2s,'+msell + "," + last.ma1 + "," + last.ma2 + "," + last.ma2_b+','+dir+'\r\n', true, true);
				}
				g_save.list.splice(i, 1);
				needSell = false;
				needBuy = false;
				nRet++;
				//break;
			}
			if(Math.abs(item.p - mbuy) < pricespace) {
				needBuy = false;
			}
		}
		//if(macd && (dir >= 2 || dir <= -2))
		//console.log('item.p:'+item.p+ ', pricespace:' + pricespace + ', mbuy:' + mbuy+', msell:'+msell+', a:'+item.a+', needSell:'+needSell+', needBuy:'+needBuy);
	}
	if(priceact == 'auto') {
		priceact = (cntAmountSell >= cntAmountBuy) ? 'buy' : 'sell';
	}
	if(((priceact == 'sell' || priceact == 'sellbuy') && needSell) || ((priceact == 'buy' || priceact == 'sellbuy') && needBuy)) {
		var sellbuy = priceact;
		var price = 0;
		
		//macd = false;
		
		if(needSell && (sellbuy == 'sell' || sellbuy == 'sellbuy') && (!macd || dir < 0)) {
			cntAmountSell += amount;
			price = msell;
			sellbuy = 'sell';
		}
		else if(needBuy && (sellbuy == 'buy' || sellbuy == 'sellbuy') && (!macd || dir > 0)) {
			cntAmountBuy += amount;
			price = mbuy;
			sellbuy = 'buy';
		}
		else {
			sellbuy = '';
		}
		if(sellbuy != '') {
			//for with small file size
			var item2 = {
				t: sellbuy,
				a: amount,
				p: price,
			};
			g_save.list.push(item2);
			//if(macd && (dir >= 1 || dir <= -1))
			//log(id+' dir:'+dir+', action:'+sellbuy+', sell:'+msell+', buy:'+mbuy+', all sell:'+cntAmountSell+', all buy:'+cntAmountBuy, false);
			if(g_save.cfg.log) {
				var sdate0 = dateFormat(tDate, 'MMdd hh:mm:ss');
				fWrite('./testlog/fxtest-gain-'+id+'.save', sdate0+' dir:'+dir+', action:'+sellbuy+', sell:'+msell+', buy:'+mbuy+', all sell:'+cntAmountSell+', all buy:'+cntAmountBuy+'\r\n', true, true);
				if(g_save.cfg.macd && g_save.cfg.log2)
				fWrite('./fx-macd-1.log', sdate0+'-'+dir+sellbuy+','+msell + "," + last.ma1 + "," + last.ma2 + "," + last.ma2_b+','+dir+'\r\n', true, true);
			}
		}
	}
	g_save.len[sdate] = g_save.list.length;
	g_save.len[sdatemm] = g_save.list.length;
	g_save.len[sdateyy] = g_save.list.length;
	g_save.len['all'] = g_save.list.length;
	return nRet;
}

g_saveall = {};
g_saverate = {};
function start_rate2(sLine) {
	//USDJPY,20010105,135200,116.24,116.24,116.23,116.23,4
	//20170101 220444.518,116.762,117.097,0.75,0.75
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
			sss = arr[0].substring(16, 19);
		}
		tDate = getDateFromYMD(year, month, day, hh, mm, ss, sss);
		msell = arr[1]/1;
		//fixed
		mbuy = arr[1]/1 + 0.003;
	}
	else {
		console.log('skip['+sLine+']');
		return;
	}

	//console.log('tDate:'+tDate);
	var tsec = Math.floor(tDate.getTime()/1000);
	if(!g_saverate.last || tsec - g_saverate.last.sec > 60*15) {
		g_saverate.macd = MACD(60*3.5, 60*10, 0.02);
		g_saverate.macd2 = MACD(60*5, 60*15, 0.01);
		g_saverate.macd3 = MACD(60*2, 60*8, 0.01);
		g_saverate.last = {};
		g_saverate.last.sec = tsec;
		g_saverate.last.min = msell;
		g_saverate.last.max = msell;
	}
	if(g_saverate.last.sec == tsec) {
		if(g_saverate.last.min > msell) {
			g_saverate.last.min = msell;
		}
		if(g_saverate.last.max < msell) {
			g_saverate.last.max = msell;
		}
		//var sdate = dateFormat(tDate, 'yyyyMMdd hh:mm:ss');
		//console.log(sdate+' '+msell);
		return;
	}
	g_saverate.last.sec = tsec;
	var cur = false;
	if(g_saverate.last.min >= msell && g_saverate.last.max >= msell) {
		cur = g_saverate.last.max;
	}
	else if(g_saverate.last.min <= msell && g_saverate.last.max <= msell) {
		cur = g_saverate.last.min;
	}
	else {
		cur = msell;
	}
	g_saverate.last.min = cur;
	g_saverate.last.max = cur;

	var sdate = dateFormat(tDate, 'MMdd hh:mm:ss');

	var last = g_saverate.macd2.add(cur);
	var dir = g_saverate.macd2.dir();
    fWrite('./fx-macd-2.log', sdate+'-'+dir+','+cur + "," + last.ma1 + "," + last.ma2 + "," + last.ma2_b+','+dir+'\r\n', true, true);

	var last = g_saverate.macd3.add(cur);
	var dir = g_saverate.macd3.dir();
    fWrite('./fx-macd-3.log', sdate+'-'+dir+','+cur + "," + last.ma1 + "," + last.ma2 + "," + last.ma2_b+','+dir+'\r\n', true, true);


	var last = g_saverate.macd.add(cur);
	var dir = g_saverate.macd.dir();
    fWrite('./fx-macd-1.log', sdate+'-'+dir+','+cur + "," + last.ma1 + "," + last.ma2 + "," + last.ma2_b+','+dir+'\r\n', true, true);

	var sdatemm = dateFormat(tDate, 'yyyyMM');
	if(!g_saveall.lastym) {
		g_saveall.lastym = sdatemm;
	}
	if(g_saveall.lastym != sdatemm) {
		update_price_prn_yy();
		g_saveall.lastym = sdatemm;
	}

	//console.log('Date['+tDate+'], msell:' + msell);
	//update_price_test2(tDate, msell, mbuy);
	for(var jj in testarr) {
		var keyg = testarr[jj].id;
		if(!g_saveall[keyg]) {
			var pricespace = testarr[jj].pspace;
			var gainspace = testarr[jj].gspace;
			var amount = Math.floor((pricespace/0.01)*baseAmount);
			g_saveall[keyg] = {};
			g_saveall[keyg].cfg = {};
			g_saveall[keyg].cfg.id = keyg;
			g_saveall[keyg].cfg.pricespace = pricespace;
			g_saveall[keyg].cfg.gainspace = gainspace;
			g_saveall[keyg].cfg.amount = testarr[jj].amount || amount;
			g_saveall[keyg].cfg.act = testarr[jj].act || baseAct;
			g_saveall[keyg].cfg.log = testarr[jj].log;
			g_saveall[keyg].cfg.log2 = testarr[jj].log2;
			g_saveall[keyg].cfg.macd = testarr[jj].macd;
			//g_saveall[keyg].cfg.log = 1;

			//console.log('id:'+keyg+', macd:'+g_saveall[keyg].cfg.macd);
			fRemove('./testlog/fxtest-gain-'+keyg+'.save', '');			
		}
		//console.log('id:'+keyg);
		update_price(g_saveall[keyg], tDate, msell, mbuy);
	}
	//process.exit();
}

function start_rate(infile) {
	infile = infile || './USDJPY.txt';
	fWrite('./fx-macd-1.log', '', false, true);
	fWrite('./fx-macd-2.log', '', false, true);
	fWrite('./fx-macd-3.log', '', false, true);
	//fWrite('./fx-sma.log', '', false, true);
	g_saveall.yyyy = {};
	g_saveall.yyyymm = {};
	if(!dExist('./testlog/')) {
		dCreate('./testlog/');
	}

	var testarr2 = testarr;
	testarr = [];
	for(var jj in testarr2) {
		if(!testarr2[jj].id) {
			var pricespace = testarr2[jj].pspace;
			var gainspace = testarr2[jj].gspace;
			testarr2[jj].id = pricespace+'-'+gainspace;
		}
		testarr.push(testarr2[jj]);
		var copy = Object.assign({}, testarr2[jj]);
		copy.macd = 1;
		copy.id += '-macd';
		testarr.push(copy);
	}
	//console.log(testarr);

	console.log('start.');
	var lastTxt = '';
	var rStream = fs.createReadStream(infile, {encoding: 'utf-8', bufferSize: 1024});
	rStream.on('data', function(data) {
		rStream.pause();
		//console.log(data);
		data = data.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
		lastTxt = lastTxt + data;
		var pos1 = lastTxt.indexOf('\n');
		var isFirst = true;
		while(pos1 >= 0) {
			if(_global['exit']) {
				console.log('exit for break');
				process.exit();
				return;
			}
			if(pos1 == 0) {
				lastTxt = lastTxt.substring(1);
				pos1 = lastTxt.indexOf('\n');
				continue;
			}
			var sLine = lastTxt.substring(0, pos1);
			start_rate2(sLine);
			lastTxt = lastTxt.substring(pos1 + 1);
			pos1 = lastTxt.indexOf('\n');
			if(isFirst) {
				isFirst = false;
				console.log(sLine);
			}
		}
		setTimeout(function() {
			rStream.resume();
			//process.exit();
		}, 100);
	});
	rStream.on('end', function() {
		console.log('end');
		update_price_prn_lastmm();
		update_price_prn_yy();
	});
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
			g_saveall['.test'] = 1;
			var f = optionsCmd['-file'];
			start_rate(f);
			return;
		}
		else if(optionsCmd['-cmd'] == 'fxrate') {
			g_saveall['.rate'] = 1;
			var f = optionsCmd['-file'];
			start_rate(f);
			return;
		}
	}
	console.log('need -cmd fxtest.');
}
start_entry();
