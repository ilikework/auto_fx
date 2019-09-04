//日本時間で月曜日の朝7：00～土曜日の朝7:00まで（米国が夏時間の時は朝6:00）
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

process.stdin.resume();//so the program will not close instantly
var funForExit = false;
process.on('unhandledRejection', (err, p) => {
	console.log('unhandledRejection: ' + err.stack);
	if(funForExit) {
		console.log('do exit clean.');
		funForExit();
	}
});

//process.on('uncaughtException', function (err) {
//	console.log('uncaughtException: ' + err.stack);
//	if(funForExit) {
//		funForExit();
//	}
//});

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
	//var m = require('module');
	//var res = vm.runInThisContext(m.wrap(fs.readFileSync(js)+''))(exports, require, module, __filename, __dirname);
	//var script = new vm.Script(fs.readFileSync(js)+'', { filename: js });
	var script = vm.createScript(fs.readFileSync(js)+'', js);
	script.runInThisContext();
}

_inc('./comm.js');

//argv
var optionsCmd = {};
//child process for logic
var processChild = false;

//获取配置信息
var srvPort = 9918;
var srvPortHttpHttps = 9919;
var srvFolder = './fx-web/';
var startTime = time();
var url_login1 = 'https://xxx.xxx.xxx.xxx/login.do';
var g_flagfile = './log/fxmp.flag';
//for global various
testarr = [];
g_save = {};
g_save['schunk'] = '';
//load from config file
g_user = '';
g_orderinfo = {};
logConfig({
	filepre:'fxmp-',
	debug: true,
	filecount: 5,
});

var serverfun = function (request, response) {
	console.log(request.url);
	var bufs = '';
	bufs.totalLength = 0;
	request.setEncoding('utf8');
	request.on('error', function(err) {
		console.error(err);
	});
	request.on('data', function(chunk) {
		bufs += chunk;
	});
	request.on('end', function() {
		console.log('data:', bufs);
		// At this point, we have the headers, method, url and body, and can now
		// do whatever we need to in order to respond to this request.
		var url_parts = nodeurl.parse(request.url, true);
		var query = url_parts.query;
		var realPath = url_parts.pathname;
		if(realPath == '/') {
			if(fExist(srvFolder+'index.jspage')) {
				realPath = 'index.jspage';
			}
			else {
				realPath = 'index.html';
			}
		}
		realPath = path.join(srvFolder, realPath);
		var ext = path.extname(realPath);
		ext = ext ? ext.slice(1) : 'unknown';
		console.log(realPath);
		var contentType = servermine[ext] || "text/plain";
		request._body = bufs;
		serverEchoFile(request, response, realPath, contentType);
		return;
	});
};
function startWebServer() {
	if(optionsCmd['-port']) {
		srvPort = optionsCmd['-port'];
	}
	if(optionsCmd['-porthttps']) {
		srvPortHttps = optionsCmd['-porthttps'];
	}
	//var server = http.createServer(serverfun);
	//server.listen(srvPort);
	//console.log("HttpServer runing at port: " + srvPort + ".");
	var httpsoptions = {};
	if(fExist('./crt_key/server.key')) {
		httpsoptions['key'] = fs.readFileSync('./crt_key/server.key');
		httpsoptions['cert'] = fs.readFileSync('./crt_key/server.crt');
	}
	var server_https = https.createServer(httpsoptions, serverfun);
	server_https.listen(srvPortHttps);
	console.log("HttpsServer runing at port: " + srvPortHttps + ".");
}

function ajust_range_up() {
	for(var i in g_orderinfo['pricerang']) {
		var item = g_orderinfo['pricerang'][i];
		g_orderinfo['pricerang'][i].min += 1;
		g_orderinfo['pricerang'][i].max += 1;
	}
	fs.writeFile("adjust_info.txt", JSON.stringify(g_orderinfo['pricerang']), function(err) {
		if(err) {
			return console.log(err);
		}
	});
}

function ajust_range_down() {
	for(var i in g_orderinfo['pricerang']) {
		var item = g_orderinfo['pricerang'][i];
		g_orderinfo['pricerang'][i].min -= 1;
		g_orderinfo['pricerang'][i].max -= 1;
	}
	fs.writeFile("adjust_info.txt", JSON.stringify(g_orderinfo['pricerang']), function(err) {
		if(err) {
			return console.log(err);
		}
	});
}

function ajust_price_up() {
	for(var i in g_orderinfo['pricerang']) {
		var item = g_orderinfo['pricerang'][i];
		var space = g_orderinfo['pricerang'][i].pspace ;
		space = Math.round(space*100);
		space += 1; 
		g_orderinfo['pricerang'][i].pspace = space /100;
		g_orderinfo['pricerang'][i].pspace_s = g_orderinfo['pricerang'][i].pspace;
	}
	fs.writeFile("adjust_info.txt", JSON.stringify(g_orderinfo['pricerang']), function(err) {
		if(err) {
			return console.log(err);
		}
	});
}

function ajust_price_down() {
	
	for(var i in g_orderinfo['pricerang']) {
		var item = g_orderinfo['pricerang'][i];
		var space = g_orderinfo['pricerang'][i].pspace ;
		space = Math.round(space*100);
		space -= 1; 
		if(space<3)
			space = 3;
		g_orderinfo['pricerang'][i].pspace = space /100;
		g_orderinfo['pricerang'][i].pspace_s = g_orderinfo['pricerang'][i].pspace;
		
	}
	fs.writeFile("adjust_info.txt", JSON.stringify(g_orderinfo['pricerang']), function(err) {
		if(err) {
			return console.log(err);
		}
	});
}

function ajust_gain_up() {
	for(var i in g_orderinfo['pricerang']) {
		var space = g_orderinfo['pricerang'][i].gspace ;
		space = Math.round(space*1000)*10;
		if(space<500)
			space = 501;
		else
			space += 501;
		g_orderinfo['pricerang'][i].gspace = space /10000;
	}
	fs.writeFile("adjust_info.txt", JSON.stringify(g_orderinfo['pricerang']), function(err) {
		if(err) {
			return console.log(err);
		}
	});
}

function ajust_gain_down() {
	var msell = g_orderinfo['now_sell'];
	for(var i in g_orderinfo['pricerang']) {
		
		var space = g_orderinfo['pricerang'][i].gspace ;
		space = Math.round(space*1000)*10;
		space -= 499;
		if(space<300)
			space = 301;
		g_orderinfo['pricerang'][i].gspace = space /10000;

	}
	fs.writeFile("adjust_info.txt", JSON.stringify(g_orderinfo['pricerang']), function(err) {
		if(err) {
			return console.log(err);
		}
	});
}

function loadadjust(){
	console.log('load adjust_info.txt');
	if(fExist('adjust_info.txt')) {
		fs.readFile('adjust_info.txt', function (err, data) {
			if (err) return console.log(err);
			var obj = JSON.parse(data);
			for(var i in obj) {
				g_orderinfo['pricerang'][i] = obj[i];
			}
		});
	}
}

$ajust_price_up = ajust_price_up;
$ajust_price_down = ajust_price_down;
$ajust_gain_up = ajust_gain_up;
$ajust_gain_down = ajust_gain_down;

function loadConfig() {
	console.log('load config: ./fxmp-config.js');
	_inc('./fxmp-config.js');
	g_user = cfg_user;
	for(var i in cfg_orderinfo) {
		g_orderinfo[i] = cfg_orderinfo[i];
	}
	testarr = cfg_testarr;
}
$loadConfig = loadConfig;

function postAjaxAuto2(fcallback, url, postbody, fcallback_param, opt){

	g_save['lasturl'] = url;
	//console.log('url:'+url);
	postAjax2(function(error, response, body, fcallback_param2) {
		if(error) {
			fcallback(error, response, body, fcallback_param2);
		}
		else {
			//console.log("postAjaxAuto response:", response);
			if(response.headers && response.headers['set-cookie']) {
				var cookie = response.headers['set-cookie'];
				g_save['cookie'] = cookie;
				log('url:'+url,false,true,true);
				log('cookie:'+cookie,false,true,true);
			}
			else
			{
				//log('cookie is null'，'debug',false,true);
			}
			
			if(response && response.statusCode == 302) {
				log('302 Moved Temporarily:'+response.headers.location,'debug',false,true);
				if(response.headers && response.headers.location) {
					var opt2 = {
						headers: {
							'Cookie': g_save['cookie'],
							'Origin': 'https://www.xxxxxxxxxx.co.jp',
                            //'Host': 'trade-nano1.xxxxxxxxxx.co.jp',
							//'Referer': url,
							'Referer': 'https://account.xxxxxxxxxxxx.co.jp/retail/xxxxxxxxx.do?serviceId=XXXXXXXXXXXXX&channelId=WEB&btnId=00',
						},
					};
					// !!! add for only got /quick/app/home from 20170925.
					var urlinfo = getUrlInfo(response.headers.location);
				    if (!urlinfo) {
					 response.headers.location = 'https://trade-nano1.xxxxxxxxxxxx.co.jp' + response.headers.location;
                                         opt2 = {
                                                headers: {
                                                        'Cookie': g_save['cookie'],
                                                        'Origin': 'https://www.xxxxxxxxxxxx.co.jp',
                                                        'Host': 'trade-nano1.xxxxxxxxxxxx.co.jp',
                                                        //'Referer': url,
                                                        'Referer': 'https://account.xxxxxxxxxxxx.co.jp/retail/xxxxxxxxxxxxx.do?serviceId=XXXXXXXXXXXXX&channelId=WEB&btnId=00',
                                                        'Upgrade-Insecure-Requests': '1',
                                                },
                                        };
				    }
					// add end.
					postAjaxAuto(function(error, response, body, fcallback_param2) {
						//log('response body:'+body, 'debug', false, true);
						fcallback(error, response, body, fcallback_param2);
					}, response.headers.location, false, false, opt2);
					return;
				}
			}
			//log('response body:'+body, 'debug', false, true);
			fcallback(error, response, body, fcallback_param2);
		}
	}, url, postbody, fcallback_param, opt);

}


function postAjaxAuto(fcallback, url, postbody, fcallback_param, opt){

	g_save['lasturl'] = url;
	log('postAjaxAuto url:'+url,'debug',false, true);
	postAjax(function(error, response, body, fcallback_param2) {
		if(error) {
			fcallback(error, response, body, fcallback_param2);
		}
		else {
			//console.log("postAjaxAuto response:", response);
			if(response.headers && response.headers['set-cookie']) {
				g_save['cookie'] = response.headers['set-cookie'];
				log('url after cookie:'+url,'debug',false, true);
				log('cookie:'+g_save['cookie'],'debug',false, true);
			}
			//console.log('response:'+response);
			//console.log('response body:'+body);
			if(response && response.statusCode == 302) {
				log('302 Moved Temporarily:'+response.headers.location,'debug',false,true);
				if(response.headers && response.headers.location) {
					var opt2 = {
						headers: {
							'Cookie': g_save['cookie'],
							'Origin': 'https://www.xxxxxxxxxxxx.co.jp',
                                                        //'Host': 'trade-nano1.xxxxxxxxxxxx.co.jp',
							//'Referer': url,
							'Referer': 'https://account.xxxxxxxxxxxx.co.jp/retail/xxxxxxxxxxx.do?serviceId=XXXXXXXXXXXXXX&channelId=WEB&btnId=00',
						},
					};
					// !!! add for only got /quick/app/home from 20170925.
					// add end.

					postAjaxAuto(function(error, response, body, fcallback_param2) {
						//console.log('response body:'+body);
						//log('response body:'+body, 'debug', false, true);
						fcallback(error, response, body, fcallback_param2);
					}, response.headers.location, false, false, opt2);
					return;
				}
			}
			//log('response body:'+body, 'debug', false, true);
			fcallback(error, response, body, fcallback_param2);
		}
	}, url, postbody, fcallback_param, opt);

}

function postpayload(resolve, reject, postbody, fcallback_param, noondata) {
	if(!fcallback_param) {
		fcallback_param = {};
	}
	if(postbody && postbody != '1::') {
		if(!g_save['payloadindex']) {
			g_save['payloadindex'] = 1;
		}
		else {
			g_save['payloadindex']++;
		}
		postbody = '5:'+g_save['payloadindex']+'+::' + postbody;
		console.log('post fx ' + g_save['payloadindex']);
	}
	else {
		console.log('get fx.');
	}
	//console.log('postbody:' + postbody);
	
	var url = 'https://trade-nano1.xxxxxxxxxxxx.co.jp/quick/socket.io/1/xhr-streaming/'+g_save['token']+'?clientType=pc&t='+(new Date()/1);
	var opt = {
		headers: {
			'Cookie': g_save['cookie'],
			'Referer': g_save['lasturl'],
			'Upgrade-Insecure-Requests': 1,
			'Connection': 'keep-alive',
			'Content-type': 'text/plain;charset=UTF-8',
			'Origin': 'https://trade-nano1.xxxxxxxxxxxx.co.jp',
			'Referer': 'https://trade-nano1.xxxxxxxxxxxx.co.jp/quick/app/home',
		},
	};
	if(fcallback_param && fcallback_param.timeout) {
		opt.timeout = fcallback_param.timeout;
	}
	if(!noondata) {
		opt.ondata = function(chunk, url, postbody, requestObj, fcallback_param) {
			payload_ondata(resolve, reject, chunk, url, postbody, requestObj, fcallback_param);
		};
		opt.onend = function(url, postbody, requestObj, fcallback_param) {
			payload_onend(resolve, reject, url, postbody, requestObj, fcallback_param);
		};
	}
	postAjaxAuto(function(error, response, body, fcallback_param2) {
		if (error) {
			log('postAjaxAuto error:'+error);
			if(reject) {
				reject(error);
			}
		}
		else {
			//console.log('postAjaxAuto body:'+body);
			if(resolve) {
				resolve({response:response, body:body});
			}
		}
	}, url, postbody, fcallback_param, opt);
}

function mainloop() {
	if(g_save['mainloop_run']) {
		return;
	}
	g_save['mainloop_run'] = true;

	var tnow = milliseconds();
	g_save['pricestream_t'] = tnow;
	g_save['send_zichan_t'] = tnow;
	g_save['send_orderlist_t'] = tnow;
	g_save['send_price_t'] = tnow;
	g_save['send_summary_t'] = tnow;
	//for save test result
	g_save['tgainsave_t'] = milliseconds();
	//for save real gain result
	g_save['rgainsave_t'] = milliseconds();
	
	g_save['workday2_t'] = milliseconds();
	g_save['workday3_t'] = milliseconds();
	//request一定时间没有相应，restart
	//g_save['send_zichan_t_res'] = milliseconds();
	//循环监视，当没有任务是添加任务
	var dispatch = function() {
		callback(dispatch, 3300);
		mainloop_send();
	}
	callback(dispatch, 100);
}

//for test
var gg1 = 0;
var gg2 = [
{s: 115.57, b:115.60},
{s: 115.61, b:115.64},
{s: 115.67, b:115.70},
{s: 115.77, b:115.80},
{s: 115.73, b:115.76},
{s: 115.68, b:115.71},
];
function mainloop_send() {
	//console.log('loop...'+g_save['important_f']+', '+g_save['loginok_f']+', '+g_save['reloadok_f']);
	g_save['mainloop_cnt'] = (g_save['mainloop_cnt'] || 0) + 1;
	if(g_save['mainloop_cnt'] > 3*20*5) {
		log('restart for mainloop_cnt:'+g_save['mainloop_cnt']);
		//notice parent restart me
		process.send({id:'restart'});
		return;
	}
	if(g_save['important_f']) {
		return;
	}
	if(!g_save['loginok_f']) {
		return;
	}
	if(!g_save['reloadok_f']) {
		return;
	}
	g_save['mainloop_cnt'] = 0;

	//for test
	//update_price_test(gg2[gg1%6].s, gg2[gg1%6].b);
	//gg1++;
	
	//統計
	var tnow = milliseconds();
	//workday?
	var workdatbase = 1;
	//console.log('now_sell:'+g_orderinfo['now_sell'] +', tj_todaygain：'+ g_orderinfo['tj_todaygain'] +', zc_zichan:'+ g_orderinfo['zc_zichan'] +', orderlist:'+ g_orderinfo['orderlist'] +', tj_sellamount:'+ g_orderinfo['tj_sellamount']+', tj_buyamount:'+g_orderinfo['tj_buyamount'] +', orderlist_amount:'+ g_save['orderlist_amount']);
	if(!g_orderinfo['now_sell'] && typeof(g_orderinfo['tj_sellamount']) !== 'undefined' && g_orderinfo['zc_zichan'] > 0 && g_orderinfo['orderlist'] && (g_orderinfo['tj_sellamount']+g_orderinfo['tj_buyamount']) === g_save['orderlist_amount']) {
		//!g_orderinfo['tj_todaygain']
		//没有任何价格情信息，可能还没有开始交易
		//update_act_flagfile();
		process.send({id:'idle'});
		if(milliseconds() - (g_save['workday_t'] || 0) > 60000) {
			g_save['workday_t'] = milliseconds();
			var sdate = dateFormat(false, 'yyyyMMdd hh:mm');
			console.log('maybe not workday now['+sdate+']...');
		}
		if(milliseconds() - (g_save['workday2_t'] || 0) > 60000*12) {
			g_save['workday2_t'] = milliseconds();
			log('maybe not workday now...reload');
			start_reload(function(error) {
				log('reload ok2:'+error);
				if(error) {
					log('reload ng...restart');
					//start_fx();
					//notice parent restart me
					process.send({id:'restart'});
				}
			}, true);
			return;
		}
		if(milliseconds() - (g_save['workday3_t'] || 0) > 60000*60*2) {
			g_save['workday3_t'] = milliseconds();
			log('maybe not workday now...restart');
			var cback = function() {
				//start_fx();
				//notice parent restart me
				process.send({id:'restart'});
			}
			if(g_orderinfo['now_sell']) {
				var postbody = '0::';
				postpayload(cback, cback, postbody);
			}
			else {
				cback();
			}
			return;
		}
		
		workdatbase = 10;
	}
	if(workdatbase == 1 && tnow - g_save['send_summary_t'] > 60000) {
		g_save['send_summary_t'] = milliseconds();
		//console.log('send_summary_t');
		var postbody = '{"name":"positionSummary","args":[{"meta":{},"body":{"currencyPair":"'+g_orderinfo['pair']+'"}}]}';
		postpayload(false, false, postbody);
		return;
	}
	//価格(streaming)
	if(workdatbase == 1 && tnow - g_save['pricestream_t'] > 15000) {
		console.log('restart autoprice time:'+g_save['pricestream_t']+', tnow:' + tnow + ', wait(-):' + (tnow - g_save['pricestream_t']));
		log('restart');
		var cback = function() {
			//start_fx();
			//notice parent restart me
			process.send({id:'restart'});
		}
		//console.log('now_sell:'+g_orderinfo['now_sell']);
		if(g_orderinfo['now_sell']) {
			var postbody = '0::';
			postpayload(cback, cback, postbody);
		}
		else {
			cback();
		}
		return;
	}

	//order情報
	if(workdatbase == 1 && (!g_save['orderlist_f'] || tnow - g_save['send_orderlist_t'] > 90000)) {
		g_save['orderlist_cnt'] = (g_save['orderlist_cnt'] || 0) + 1;
		if(g_save['orderlist_cnt'] > 15) {
			log('restart');
			var cback = function() {
				//start_fx();
				//notice parent restart me
				process.send({id:'restart'});
			}
			if(g_orderinfo['now_sell']) {
				var postbody = '0::';
				postpayload(cback, cback, postbody);
			}
			else {
				cback();
			}
			return;
		}
		//重新发送可能有问题，只发送一次或超过最大值后重启
		if(g_save['orderlist_cnt'] == 1) {
			//g_save['send_orderlist_t'] = milliseconds();
			//log('mainloop_send orderlist');
			g_save['orderlist_f'] = 0;
			var postbody = '{"name":"contractList","args":[{"meta":{},"body":{"productId":"SPOT_'+g_orderinfo['pair']+'","pageNumber":"0","inquriyPanelExpandFlg":"false"}}]}';
			var cback_cnt = 0;
			var cback_err = function() {
				cback_cnt++;
				console.log('list retry:' + cback_cnt);
				if(cback_cnt > 5) {
					//notice parent restart me
					process.send({id:'restart'});
				}
				else {
					postpayload(false, cback_err, postbody, {timeout:1000*10});
				}
			}
			postpayload(false, cback_err, postbody, {timeout:1000*10});
			return;
		}
	}

	//reload
	if(g_save['payloadindex'] > 300) {
		log('reload');
		start_reload(function(error) {
			log('reload ok2:'+error);
			if(error) {
				log('reload ng...restart');
				//start_fx();
				//notice parent restart me
				process.send({id:'restart'});
			}
		}, true);
		return;
	}
	
	//価格
	if(workdatbase == 1 && tnow - g_save['send_price_t'] > 45000) {
		g_save['send_price_t'] = milliseconds();
		//console.log('send_price_t');
		//priceFeed
		var postbody = '{"name":"priceFeed","args":[{"meta":{},"body":{"currencyPair":"'+g_orderinfo['pair']+'"}}]}';
		postpayload(false, false, postbody);
		return;
	}
	
	//資産
	if(tnow - g_save['send_zichan_t'] > 15000 * workdatbase) {
		g_save['send_zichan_t'] = milliseconds();
		var postbody = '{"name":"getRegularMarginStatus","args":[{"meta":{},"body":{"productId":"SPOT_'+g_orderinfo['pair']+'"}}]}';
		if(g_save['send_todaygain_f']) {
			//本日损益
			g_save['send_todaygain_f'] = 0;
			var postbody = '{"name":"getPlInfo","args":[{"meta":{},"body":{}}]}';
		}
		else {
			g_save['send_todaygain_f'] = 1;
		}
		postpayload(false, false, postbody);
		return;
	}
}

/////////////////////////////////////////////////////
function update_act_flagfile() {
	//更新文件，外部监视程序根据这个判断是否需要重新启动
	var tnow = milliseconds();
	if(tnow - (g_save['price_echo_t2'] || 0) > 45000) {
		g_save['price_echo_t2'] = tnow;
		fWrite(g_flagfile, ''+time(), false, true);
	}
}
function update_price(osell, obuy) {
	//["115.296","27ASVAQFN1DGB/STOP","115.29","6",false]
	if(osell[1].indexOf('/') > 0) {
		osell[1] = osell[1].substring(0, osell[1].indexOf('/'));
	}
	if(obuy[1].indexOf('/') > 0) {
		obuy[1] = obuy[1].substring(0, obuy[1].indexOf('/'));
	}
	var tnow = milliseconds();
	g_save['pricestream_t'] = tnow;
	g_orderinfo['now_sell'] = osell[0]/1;
	g_orderinfo['now_sellid'] = osell[1];
	g_orderinfo['now_buy'] = obuy[0]/1;
	g_orderinfo['now_buyid'] = obuy[1];
	
	if(tnow - (g_save['price_echo_t'] || 0) > 3000) {
		g_save['price_echo_t'] = tnow;
		var str = g_orderinfo['fxpause_f'] ? '[PAUSE !!] ' : '';
		console.log(str+'sell:' + g_orderinfo['now_sell'] + ', buy:' + g_orderinfo['now_buy']);
	}
	//update_act_flagfile();

	if(!g_orderinfo['now_sell'] || g_orderinfo['now_sell'] < 1 || !g_orderinfo['now_buy'] || g_orderinfo['now_buy'] < 1 || g_orderinfo['now_sell'] > g_orderinfo['now_buy']) {
		log('price or buy or sell error:' + JSON.stringify(json));
		return;
	}

	//g_save['MACD'].add(g_orderinfo['now_sell']);
	//setGlobalValue('test_macd', g_save['MACD'].saveCfg());
	//var dir = g_save['MACD'].dir();
	var dir = 0;
	
	if(!g_save['loginok_f'] || !g_save['reloadok_f'] || !g_save['orderlist_f'] || !g_save['orderzc'] || !g_orderinfo['orderlist']) {
		return;
	}
	/*
	if(tnow - g_save['send_zichan_t_res'] > 50000) {
		console.log('no response, restart.');
		log('restart');
		var cback = function() {
			start_fx();
		}
		if(g_orderinfo['now_sell']) {
			var postbody = '0::';
			postpayload(cback, cback, postbody);
		}
		else {
			cback();
		}
		return;
	}*/
	if(g_orderinfo['zc_yuli'] && g_orderinfo['zc_yuli'] < g_orderinfo['minremain']) {
		//有利润的决计也可能产生风险，直接停止交易
		if(tnow - (g_save['zc_yuli_echo_t'] || 0) > 10000) {
			console.log('取引余力不足('+g_orderinfo['zc_yuli']+') < 设定：'+g_orderinfo['minremain']);
			g_save['zc_yuli_echo_t'] = tnow;
		}
		return;
	}
	if((g_orderinfo['tj_sellamount']+g_orderinfo['tj_buyamount']) !== g_save['orderlist_amount']) {
		console.log('different tj_amount and orderlist amount, reload.');
		start_reload(function(error) {
			log('reload ok2:'+error);
			if(error) {
				log('reload ng...restart');
				//start_fx();
				//notice parent restart me
				process.send({id:'restart'});
			}
		}, true);
		return;
	}

	if(!g_save['cContractId']) {
		if(g_orderinfo['old_sell'] === g_orderinfo['now_sell'] && g_orderinfo['old_buy'] === g_orderinfo['now_buy']) {
			return;
		}
	}
	if(g_orderinfo['fxpause_f']) {
		return;
	}
	g_orderinfo['old_sell'] = g_orderinfo['now_sell'];
	g_orderinfo['old_buy'] = g_orderinfo['now_buy'];

	/*
	var tmp_t = Math.floor(milliseconds()/1000);
	if(!g_save['tmp_t']) {
		g_save['tmp_t'] = tmp_t;
	}
	var tCnt = tmp_t - g_save['tmp_t'];
	if(!g_save['tmp_p']) {
		g_save['tmp_p'] = {};
	}
	g_save['tmp_p']['s'+tCnt] = g_orderinfo['now_sell'];
	g_save['tmp_p']['b'+tCnt] = g_orderinfo['now_buy'];
	console.log('tmp save, time:'+tCnt+', sell:' + g_orderinfo['now_sell'] + ', buy:' + g_orderinfo['now_buy']);
	*/
	
	/*
	if(g_save['testtime_h']) {
		clearTimeout(g_save['testtime_h']);
	}
	g_save['testtime_h'] = setTimeout(function() {
		update_price_test(msell, mbuy);
	}, 30);*/
	
	//console.log('sell:' + g_orderinfo['now_sell'] + ', buy:' + g_orderinfo['now_buy']);
	//var sell = g_orderinfo['now_sell'];
	var msell = g_orderinfo['now_sell'];
	//var buy = g_orderinfo['now_buy'];
	var mbuy = g_orderinfo['now_buy'];
	var amount = 0;
	var priceact = '';
	var pricespace = 0;
	var amount_s = 0;
	var pricespace_s = 0;
	var gainspace = 0;
	for(var i in g_orderinfo['pricerang']) {
		var item = g_orderinfo['pricerang'][i];
		// && mbuy >= item.min && mbuy <= item.max
		if(msell >= item.min && msell <= item.max) {
			priceact = item.act;
			pricespace = item.pspace;
			gainspace = item.gspace;
			amount = item.amount;
			amount_s = item.amount_s || amount;
			pricespace_s = item.pspace_s || pricespace;
			break;
		}
	}
	if(pricespace <= 0.001 || pricespace_s <= 0.001 || gainspace <= 0 || amount < 100 || amount_s < 100) {
		log('stop for ng, pricespace:'+pricespace+', pricespace sell:'+pricespace_s +', amount:'+amount+', amount sell:'+amount_s  +', gainspace:'+gainspace+', sell:' + g_orderinfo['now_sell'] + ', buy:' + g_orderinfo['now_buy'], 'important');
	}
	//为了安全，这个地方设置了最大金额。如果实际需要，则需要修改。
	if(priceact != '' && amount <= 500  && amount_s <= 500 && gainspace > 0 && g_save['loginok_f'] && g_save['reloadok_f'] && g_save['orderlist_f'] && g_save['orderzc'] && g_orderinfo['orderlist']) {
		var cntAmountSell = 0;
		var cntAmountBuy = 0;
		var needSell = true;
		var needBuy = true;
		for(var i=0; i < g_orderinfo['orderlist'].length; i++) {
			var item = g_orderinfo['orderlist'][i];
			//console.log(JSON.stringify(item));
			if(item.type == 'sell') {
				cntAmountSell += item.initamount;
				//console.log('sell gain:'+(item.price-mbuy)+', org:'+item.spot);
				if(item.amount > 0 && item.amount == item.noSettledAmount && item.amount == item.initamount &&
					 (item.price - mbuy >= gainspace || ( item.price - mbuy >= 0 && item.cContractId==g_save['cContractId']))
				) {
					//从网页手动指定买卖
					g_save['cContractId'] = false;
					//now buy
					var postbody = '{"name":"closeStreamingOrder","args":[{"meta":{},"body":{"isCloseOrder":"true","isCancelStreaming":"false","orderAmount":"'+item.amount+'","productId":"SPOT_'+g_orderinfo['pair']+'","buySellType":"3","priceId":"'+g_orderinfo['now_buyid']+'","orderPrice":"'+g_orderinfo['now_buy']+'","targetList":[{"cContractId":"'+item.cContractId+'","cSubNo":"'+item.cSubNo+'","productId":"SPOT_'+g_orderinfo['pair']+'","currencyPair":"'+g_orderinfo['pair']+'","buySellType":"1","possibleOrderAmount":"'+item.amount+'","noSettledAmount":"'+item.noSettledAmount+'","executionPrice":"'+item.executionPrice+'","version":"0"}],"slippage":"0","inputXCoordinate":"852","inputYCoordinate":"437"}}]}';
					var gain = (item.price - mbuy)*item.amount;
					log('sell:' + g_orderinfo['now_sell'] + ', buy:' + g_orderinfo['now_buy']+', gain:'+gain+', dir:'+dir+', pricespace_s:'+pricespace_s+', gainspace:'+gainspace + ', buy info:' + postbody, 'important');
					g_save['orderlist_f'] = 0;
					g_save['orderlist_cnt'] = 0;
					g_save['important_f'] = 1;
					postpayload(false, false, postbody);
					callback(function() {
						g_save['important_f'] = 0;
						g_save['send_summary_t'] = milliseconds()-60000;
					}, 800);
					return;
				}
				if(Math.abs(item.price - msell) < pricespace_s) {
					needSell = false;
				}
			}
			else {
				cntAmountBuy += item.initamount;
				//console.log('buy gain:'+(msell-item.price)+', org:'+item.spot);
				if(item.amount > 0 && item.amount == item.noSettledAmount && item.amount == item.initamount && 
					(msell - item.price >= gainspace || (msell - item.price >= 0 && item.cContractId==g_save['cContractId']))
				) {
					//从网页手动指定买卖
					g_save['cContractId'] = false;
					//now sell
					var postbody = '{"name":"closeStreamingOrder","args":[{"meta":{},"body":{"isCloseOrder":"true","isCancelStreaming":"false","orderAmount":"'+item.amount+'","productId":"SPOT_'+g_orderinfo['pair']+'","buySellType":"1","priceId":"'+g_orderinfo['now_sellid']+'","orderPrice":"'+g_orderinfo['now_sell']+'","targetList":[{"cContractId":"'+item.cContractId+'","cSubNo":"'+item.cSubNo+'","productId":"SPOT_'+g_orderinfo['pair']+'","currencyPair":"'+g_orderinfo['pair']+'","buySellType":"3","possibleOrderAmount":"'+item.amount+'","noSettledAmount":"'+item.noSettledAmount+'","executionPrice":"'+item.executionPrice+'","version":"0"}],"slippage":"0","inputXCoordinate":"817","inputYCoordinate":"433"}}]}';
					var gain = (msell - item.price)*item.amount;
					log('sell:' + g_orderinfo['now_sell'] + ', buy:' + g_orderinfo['now_buy']+', gain:'+gain+', dir:'+dir+', pricespace:'+pricespace+', gainspace:'+gainspace + ', sell info:' + postbody, 'important');
					g_save['orderlist_f'] = 0;
					g_save['orderlist_cnt'] = 0;
					g_save['important_f'] = 1;
					postpayload(false, false, postbody);
					callback(function() {
						g_save['important_f'] = 0;
						g_save['send_summary_t'] = milliseconds()-60000;
					}, 800);
					return;
				}
				if(Math.abs(item.price - mbuy) < pricespace) {
					needBuy = false;
				}
			}
		}

		g_save['cContractId'] = false;

		if(priceact == 'auto') {
			priceact = (cntAmountSell >= cntAmountBuy) ? 'buy' : 'sell';
		}
		if(((priceact == 'sell' || priceact == 'sellbuy') && needSell) || ((priceact == 'buy' || priceact == 'sellbuy') && needBuy)) {
			if(cntAmountSell + cntAmountBuy > g_orderinfo['maxtotalamount']) {
				console.log('stop for now('+(cntAmountSell + cntAmountBuy)+') > maxtotalamount('+g_orderinfo['maxtotalamount']+')');
				needSell = false;
				needBuy = false;
			}
			else if(Math.abs(cntAmountSell - cntAmountBuy) > g_orderinfo['maxbalnceamount']) {
				console.log('stop for now('+Math.abs(cntAmountSell - cntAmountBuy)+') > maxbalnceamount('+g_orderinfo['maxbalnceamount']+')');
				needSell = false;
				needBuy = false;
			}
		}
		if(((priceact == 'sell' || priceact == 'sellbuy') && needSell) || ((priceact == 'buy' || priceact == 'sellbuy') && needBuy)) {
			var sellbuy = priceact;
			var actamount = amount_s;
			if(sellbuy == 'sellbuy') {
				sellbuy = needSell ? 'sell' : 'buy';
			}
			var buySellType = '1';
			var priceId = g_orderinfo['now_sellid'];
			var orderPrice = g_orderinfo['now_sell'];
			if(sellbuy == 'buy') {
				buySellType = '3';
				priceId = g_orderinfo['now_buyid'];
				orderPrice = g_orderinfo['now_buy'];
				actamount = amount;
			}
			var postbody = '{"name":"newStreamingOrder","args":[{"meta":{},"body":{"isCloseOrder":"false","productId":"SPOT_'+g_orderinfo['pair']+'","orderAmount":"'+actamount+'","buySellType":"'+buySellType+'","priceId":"'+priceId+'","orderPrice":"'+orderPrice+'","isNettingOrder":"false","nettingOrder":"profit","useOCOProfittakeOrder":"false","profittakePriceWide":"30","useOCOLosscutOrder":"false","losscutPriceWide":"30","expirationType":"0","slippage":"1","inputXCoordinate":"898","inputYCoordinate":"476"}}]}';
			g_save['important_f'] = 1;
			log('sell:' + g_orderinfo['now_sell'] + ', buy:' + g_orderinfo['now_buy']+', action:'+sellbuy+', dir:'+dir+', pricespace:'+pricespace+', pricespace_s:'+pricespace_s+', gainspace:'+gainspace+', post:' + postbody, 'important');
			g_save['orderlist_f'] = 0;
			g_save['orderlist_cnt'] = 0;
			postpayload(false, false, postbody);
			callback(function() {
				g_save['important_f'] = 0;
				g_save['send_summary_t'] = milliseconds()-60000;
			}, 800);
			return;
		}
	}

	var tnow1 = milliseconds();
	var nRet = update_price_test(msell, mbuy);
	var tnow2 = milliseconds() - tnow1;
	if(nRet > 0 || tnow2 > 100) {
		console.log('test:'+tnow2+', ret:'+nRet);
	}
}

function update_price_test(msell, mbuy) {
	if(g_save['update_test_f']) {
		return;
	}
	g_save['update_test_f'] = 1;
	var nRet = update_price_test2(msell, mbuy);
	g_save['update_test_f'] = 0;
	return nRet;
}
function update_price_test2(msell, mbuy) {
	//test
	var sdate = dateFormat(false, 'yyyyMMdd');
	var amountDef = 100;
	var actDef = 'sellbuy';
	if(g_save['test_s'].date != sdate) {
		if(g_save['test_s'].date) {
			fWrite('./log/fxmp-test-'+g_save['test_s'].date+'.save', JSON.stringify(g_save['test_s']), false, true);
		}
		g_save['test_s'].date = sdate;
		g_save['test_s'].gain = {};
	}
	var nRet = 0;
	for(var jj in testarr) {
		var pricespace = testarr[jj].pspace;
		var gainspace = testarr[jj].gspace;
		var amount = testarr[jj].amount || amountDef;
		var keyg = 'p:'+pricespace+', g:'+gainspace;
		if(!g_save['test_s'].list[keyg]) {
			g_save['test_s'].list[keyg] = [];
		}
		if(!g_save['test_s'].gain[keyg]) {
			g_save['test_s'].gain[keyg] = 0;
		}
		var priceact = testarr[jj].act || actDef;
		//console.log('pricespace:'+pricespace + ', gainspace:' + gainspace+', msell:'+msell+', mbuy:'+mbuy);

		var cntAmountSell = 0;
		var cntAmountBuy = 0;
		var needSell = true;
		var needBuy = true;
		for(var i=g_save['test_s'].list[keyg].length-1; i>=0; i--) {
			var item = g_save['test_s'].list[keyg][i];
			//console.log(JSON.stringify(item));
			if(item.t == 'sell') {
				cntAmountSell += item.a;
				if(item.a > 0 && item.p - mbuy >= gainspace) {
					var gain = (item.p - mbuy)*item.a;
					if(pricespace >= 0.01) {
						gain = Math.floor(gain);
					}
					g_save['test_s'].gain[keyg] += gain;
					//log(keyg+', gain:'+gain+', sell price:'+item.p+', now buy:'+mbuy+', gain all:'+g_save['test_s'].gain[keyg], false);
					g_save['test_s'].list[keyg].splice(i, 1);
					needSell = false;
					needBuy = false;
					g_save['tgainsave_f'] = 1;
					nRet++;
					break;
				}
				if(Math.abs(item.p - msell) < pricespace) {
					needSell = false;
				}
			}
			else {
				cntAmountBuy += item.a;
				if(item.a > 0 && msell - item.p >= gainspace) {
					var gain = (msell - item.p)*item.a;
					if(pricespace >= 0.01) {
						gain = Math.floor(gain);
					}
					g_save['test_s'].gain[keyg] += gain;
					//log(keyg+', gain:'+gain+', buy price:'+item.p+', now sell:'+msell+', gain all:'+g_save['test_s'].gain[keyg], false);
					g_save['test_s'].list[keyg].splice(i, 1);
					needSell = false;
					needBuy = false;
					g_save['tgainsave_f'] = 1;
					nRet++;
					break;
				}
				if(Math.abs(item.p - mbuy) < pricespace) {
					needBuy = false;
				}
			}
			//console.log('item.p:'+item.p+ ', pricespace:' + pricespace + ', mbuy:' + mbuy+', msell:'+msell+', needact:'+needact);
		}
		if(priceact == 'auto') {
			priceact = (cntAmountSell >= cntAmountBuy) ? 'buy' : 'sell';
		}
		if(((priceact == 'sell' || priceact == 'sellbuy') && needSell) || ((priceact == 'buy' || priceact == 'sellbuy') && needBuy)) {
			var sellbuy = priceact;
			var price = 0;
			if(needSell && (sellbuy == 'sell' || sellbuy == 'sellbuy')) {
				cntAmountSell += amount;
				price = msell;
				sellbuy = 'sell';
			}
			else {
				cntAmountBuy += amount;
				price = mbuy;
				sellbuy = 'buy';
			}
			//for with small file size
			var item2 = {
				//pa: g_orderinfo['pair'],
				t: sellbuy,
				a: amount,
				p: price,
				//spot: 0,
				//evalprice: 0,
				//time: getTimestamp(),
			};
			g_save['test_s'].list[keyg].push(item2);
			//log(keyg+', action:'+sellbuy+', sell:'+msell+', buy:'+mbuy+', all sell:'+cntAmountSell+', all buy:'+cntAmountBuy, false);
			g_save['tgainsave_f'] = 1;
		}
		g_save['test_s'].gain['l_'+keyg] = g_save['test_s'].list[keyg].length;
	}
	update_price_testsave(false);
	return nRet;
}
function update_price_testsave(force) {
	if(g_save['tgainsave_f']) {
		//if(force || milliseconds() - (g_save['tgainsave_t'] || 0) > 60000*30) {
			//console.log('save test result.');
			g_save['tgainsave_f'] = 0;
			g_save['tgainsave_t'] = milliseconds();
			//fWrite('./log/fxmp-test.save', JSON.stringify(g_save['test_s']), false, true);
			setGlobalValue('test_s', g_save['test_s']);
		//}
	}
}
function gain_save(force) {
	if(g_save['rgainsave_f']) {
		//if(force || milliseconds() - (g_save['rgainsave_t'] || 0) > 60000*10) {
			//console.log('save gain result.');
			g_save['rgainsave_f'] = 0;
			g_save['rgainsave_t'] = milliseconds();
			//fWrite('./log/fxmp-gain.save', JSON.stringify(g_orderinfo['tj_gain']), false, true);
			setGlobalValue('tj_gain', g_orderinfo['tj_gain']);
		//}
	}
}

function payload_ondata(resolve, reject, chunk, url, postbody, requestObj, fcallback_param) {
	var doEnd = function() {
		if(!fcallback_param['first']) {
			fcallback_param['first'] = 1;
			if(resolve) {
				resolve({});
			}
		}
	};

	var schunk = chunk.toString('utf8').trim();
	
	schunk = g_save['schunk'] + schunk;
	
	
	//log(schunk);

	//価格(streaming)
	//chunk:[5:::{"name":"price.USD/JPY","args":[{"meta":{"notificationType":"PRICE"},"body":["USD/JPY","2016/12/12 12:44:01",["115.247","27DU2OPCJCPHB","115.24","7",true],["115.250","27DU2OPCJCPHA","115.25","0",true],"115.613","115.168","-0.049","2016/12/12 07:00:00","2016/12/12 07:00:00","2016/12/01 07:00:00"]}]}]
	var ind = schunk.indexOf(':::{"name":"price.');
	if(ind > 0 && schunk.endsWith(']}]}')) {
        
		var schunk2 = schunk.substring(ind + 3);
		var json = false;
		try {
			json = JSON.parse(schunk2);
			//console.log(JSON.stringify(json));
			//console.log(print_object(json));
		}
		catch(err) {
			log(err);
		}
		if(json && json.name == 'price.' + g_orderinfo['pair'] && json.args.length > 0 && json.args[0].meta && json.args[0].meta.notificationType == 'PRICE' && json.args[0].body && json.args[0].body.length > 0 && json.args[0].body[0] == g_orderinfo['pair']) {
			var osell = json.args[0].body[2];
			var obuy = json.args[0].body[3];

			update_price(osell, obuy);

			g_save['schunk'] = '';
			doEnd();
			return;
		}
	}

	//决计的损益计算
	var ind = schunk.indexOf(':::{"name":"execution","args":[{"meta":{"destinationKey":"execution","accountId":');
	if(ind > 0 && schunk.indexOf('executionPrice') > 0 && schunk.indexOf('settlePl') > 0) {
		if(schunk == g_save['execution_last1'] || schunk == g_save['execution_last2']) {
			log('execution same:'+schunk, 'important');
			g_save['schunk'] = '';
			return;
		}
		g_save['execution_last1'] = g_save['execution_last2'] || '';
		g_save['execution_last2'] = schunk;
		log('execution gain:'+schunk, 'important');
		var schunk2 = schunk.substring(ind + 3);
		var json = false;
		try {
			json = JSON.parse(schunk2);
			//console.log(JSON.stringify(json));
			//console.log(print_object(json));
		}
		catch(err) {
			log(err);
		}
		if(json && json.name == 'execution' && json.args.length > 0 && json.args[0].meta && json.args[0].meta.destinationKey == 'execution' && json.args[0].body && json.args[0].body.FxCExecution && json.args[0].body.FxCExecution.settlePl && json.args[0].body.FxCExecution.swapPl) {
			var gain1 = json.args[0].body.FxCExecution.settlePl.value.replace(',', '')/1;
			var gain2 = json.args[0].body.FxCExecution.swapPl.value.replace(',', '')/1;
			var gain = gain1 + gain2;
			var sdate = dateFormat(false, 'yyyyMMdd');
			if(!g_orderinfo['tj_gain'][sdate]) {
				g_orderinfo['tj_gain'][sdate] = 0;
			}
			g_orderinfo['tj_gain'][sdate] += gain;
			g_save['rgainsave_f'] = 1;
			log('gain:'+gain+', all:'+g_orderinfo['tj_gain'][sdate], 'important');
			gain_save(false);
		}
		g_save['schunk'] = '';
		return;
	}
	var ind = schunk.indexOf('+[{"meta":{"status":"OK"},"body":[{"fxCOrder":{"COrderId":');
	if(ind > 0 && schunk.indexOf('executionPrice') > 0) {
		log('execution status:'+schunk, 'important');
		g_save['schunk'] = '';
		return;
	}

	var ind = schunk.indexOf('+[{"meta":');
	if(ind > 0 && schunk.endsWith('}]') && schunk.indexOf('{"status":"OK"}') > 0 && schunk.indexOf(',"body":') > 0) {
		var schunk2 = schunk.substring(ind + 2, schunk.length - 1);
		var json = false;
		try {
			json = JSON.parse(schunk2);
			//console.log(JSON.stringify(json));
			//console.log(print_object(json));
		}
		catch(err) {
			log(err);
		}

		//order情報
		//chunk:[6:::12+[{"meta":{"status":"OK"},"body":{"pageSize":10,"pageNumber":1,"totalSize":10,"totalNumOfPages":1,"list":[]}}]]
		if(json && json.body && json.body.pageSize > 0 && json.body.pageNumber >= 0 && json.body.totalNumOfPages >= 0 && json.body.list && json.body.list.length >= 0) {
			if(json.body.list.length == 0) {
				g_orderinfo['orderlist'] = [];
				g_save['orderlist_amount'] = 0;
				g_save['orderlist_f'] = 1;
				g_save['orderlist_cnt'] = 0;
				g_save['send_orderlist_t'] = milliseconds();
				g_save['schunk'] = '';
				doEnd();
				return;
			}
		}
		if(json && json.body && json.body.pageSize > 0 && json.body.list && json.body.list.length > 0 && json.body.list[0].cContractId && json.body.list[0].productId == 'SPOT_'+g_orderinfo['pair'] && json.body.list[0].currencyPair == g_orderinfo['pair'] && json.body.list[0].initialAmount && json.body.list[0].executionPrice && json.body.list[0].evaluationPrice && json.body.list[0].closeOrderStatus) {
			//console.log(print_object(json));
			console.log('order info:' + json.body.list.length);
			var arr = [];
			var orderlist_amount = 0;
			for(var i = 0; i < json.body.list.length; i++) {
				var item = json.body.list[i];
				var item2 = {
					pair: item['currencyPair'],
					type: item['buySellType']['attribute'],
					initamount: item['initialAmount'].replace(',', '')/1,
					amount: item['possibleOrderAmount'].replace(',', '')/1,
					price: item['executionPrice']/1,
					spot: item['spotPl']['value'].replace(',', '')/1,
					evalprice: item['evaluationPrice']/1,
					time: item['executionDatetime'],

					cContractId: item['cContractId'],
					//cannot get swap
					cSubNo: item['cSubNo'],
					noSettledAmount: item['noSettledAmount'],
					executionPrice: item['executionPrice'],
				};
				arr.push(item2);
				orderlist_amount += item2.initamount;

				console.log(item2.pair + ':' + item2.type + ', amount:' + item2.amount + ', price:' + item2.price + ', spot:' + item2.spot + ', time:' + item2.time);
				
			}
			if(json.body.pageNumber == 0) {
				g_orderinfo['orderlist'] = arr;
				g_save['orderlist_amount'] = orderlist_amount;
			}
			else {
				for(var i in arr) {
					g_orderinfo['orderlist'].push(arr[i]);
				}
				g_save['orderlist_amount'] += orderlist_amount;
			}
			if(json.body.totalNumOfPages <= json.body.pageNumber + 1) {
				g_save['orderlist_f'] = 1;
				g_save['orderlist_cnt'] = 0;
				g_save['send_orderlist_t'] = milliseconds();
				console.log('all orderlist:' + g_orderinfo['orderlist'].length);
				doEnd();
			}
			else {
				//get next page
				var postbody = '{"name":"contractList","args":[{"meta":{},"body":{"productId":"SPOT_'+g_orderinfo['pair']+'","pageNumber":"'+(json.body.pageNumber+1)+'","inquriyPanelExpandFlg":"false"}}]}';
				var cback_cnt = 0;
				var cback_err = function() {
					cback_cnt++;
					console.log('list retry:' + cback_cnt);
					if(cback_cnt > 5) {
						//notice parent restart me
						process.send({id:'restart'});
					}
					else {
						postpayload(resolve, cback_err, postbody, {timeout:1000*10});
					}
				}
				//reject?
				postpayload(resolve, cback_err, postbody, {timeout:1000*10});
			}
			g_save['schunk'] = '';
			return;
		}

		//価格
		//chunk:6:::2012+[{"meta":{"status":"OK"},"body":["USD/JPY","2016/12/10 06:49:59",["115.296","27ASVAQFN1DGB/STOP","115.29","6",false],["115.299","27ASVAQFN1DGA/STOP","115.29","9",false],"115.364","114.016","0.000","2016/12/09 07:00:00","2016/12/05 07:00:00","2016/12/01 07:00:00"]}]
		if(json && json.body && json.body.length > 3 && json.body[0] == g_orderinfo.pair && json.body[2].length > 0 && json.body[3].length > 0) {
			var sell = json.body[2];
			var buy = json.body[3];
			update_price(sell, buy);
			g_save['schunk'] = '';
			doEnd();
			return;
		}

		//資産
		if(json && json.body && json.body.length == 7 && typeof(json.body[0]) == 'string' && typeof(json.body[1]) == 'string' && typeof(json.body[5]) == 'string' && typeof(json.body[6]) == 'string' && json.body[5].indexOf(':') > 0) {
			//console.log('資産:' + JSON.stringify(json.body));
			//証拠金維持率
			g_orderinfo['zc_weichi'] = json.body[0]/1;
			//取引余力
			g_orderinfo['zc_yuli'] = json.body[2].replace(',', '')/1;
			//純資産
			g_orderinfo['zc_zichan'] = json.body[3].replace(',', '')/1;
			//差引損益
			g_orderinfo['zc_sunyi'] = json.body[4].replace(',', '')/1;
			console.log('維持率:' + g_orderinfo['zc_weichi'] + ', 余力:' + g_orderinfo['zc_yuli'] + ', zichan:' + g_orderinfo['zc_zichan'] + ', sunyi:' + g_orderinfo['zc_sunyi']);
			g_save['orderzc'] = 1;
			//request一定时间没有相应，restart
			//g_save['send_zichan_t_res'] = milliseconds();
			//notice parent I am active
			process.send({id:'idle'});
			g_save['schunk'] = '';
			doEnd();
			return;
		}

		//統計
		if(json && json.body && json.body['1'] && json.body['1']['currencyPair'] == g_orderinfo['pair'] && json.body['1']['buySellType'] == '1' && json.body['3'] && json.body['3']['currencyPair'] == g_orderinfo['pair'] && json.body['3']['buySellType'] == '3') {
			var sell = json.body['1'];
			var buy = json.body['3'];
			g_orderinfo['tj_sellamount'] = sell['totalAmount'] || 0;
			g_orderinfo['tj_sellgain'] = sell['balancePl'] || 0;
			g_orderinfo['tj_buyamount'] = buy['totalAmount'] || 0;
			g_orderinfo['tj_buygain'] = buy['balancePl'] || 0;
			console.log('summary, sell:' + g_orderinfo['tj_sellamount'] + ', gain:' + g_orderinfo['tj_sellgain'] + ', buy:' + g_orderinfo['tj_buyamount'] + ', gain:' + g_orderinfo['tj_buygain']);
			//notice parent I am active
			process.send({id:'idle'});
			g_save['schunk'] = '';
			doEnd();
			return;
		}

		//本日损益
		//[{"meta":{"status":"OK"},"body":{"entries":[{"currencyPair":"USD/JPY","currency":"JPY","pl":"172","swapPl":"-10"}]}}]
		if(json && json.body && json.body.entries && json.body.entries.length > 0 && json.body.entries[0].currencyPair && json.body.entries[0].currency) {
			var todaysy = 0;
			for(var i in json.body.entries) {
				var item = json.body.entries[i];
				todaysy += (item.pl.replace(',', '')/1 + item.swapPl.replace(',', '')/1);
			}
			g_orderinfo['tj_todaygain'] = todaysy;
			console.log('today sunyi:' + todaysy);
			//request一定时间没有相应，restart
			g_save['send_zichan_t_res'] = milliseconds();
			//notice parent I am active
			process.send({id:'idle'});
			g_save['schunk'] = '';
			doEnd();
			return; 
		}
	}

	if(schunk != '') {
		log('post:'+postbody+'\nchunk:['+schunk+']','debug',false,true);
        if(json && json.body==null){
            log('skip the body=null','debug',false,true);
        }
        else {
            g_save['schunk'] = schunk;
            log('save tschunk','debug',false,true);
        }
	}
	doEnd();
}
function payload_onend(resolve, reject, url, postbody, requestObj, fcallback_param) {
	//console.log('onend.');
}

function start_login(fcallback) {
	if(g_save['start_login_f']) {
		log('already start_login...');
		return;
	}
	g_save['start_login_f'] = 1;
	start_login2(function(error) {
		g_save['start_login_f'] = 0;
		fcallback(error);
	});
}
function start_login2(fcallback) {
	log('start_login');
	Promise.resolve()
	.then(function () {
	  return new Promise(function(resolve, reject) {
		var g_user2 = new Buffer(g_user, 'base64').toString('ascii');
		var opt = false;
		var postbody = g_user2+'&pageId=QUICK_TRADE_BOARD_NANO';
		//log(postbody);
		postAjaxAuto(function(error, response, body, fcallback_param2) {
			var k1 = '';
			var k2 = '';
			//log('login body:'+body, 'debug', false, true);
			if(body && body != '') {
                //<input name="k1" type="hidden" value="3xf">
                //<input name="k2" type="hidden" value="AxW">
				var k1 = getContOne(body, 'name="k1"', '">', 'value="');
				var k2 = getContOne(body, 'name="k2"', '">', 'value="');
			}
			if (error || !body || k1 == '' || k2 == '') {
				log('login error or body ng:'+error);
				//	log(body);
				var matain1 = '<title>メンテナンス画面';
				var matain2 = 'ただいまメンテナンス中のため、ログインできません。';
				if(body && body.indexOf(matain1) > 0 && body.indexOf(matain2) > 0) {
					var cntTemp = 0;
					var dispatchTemp = function() {
						console.log(matain2);
						cntTemp++;
						if(cntTemp > 2 * 15) {
							reject(error);
							return;
						}
						callback(dispatchTemp, 30000);
						process.send({id:'idle'});
					}
					callback(dispatchTemp, 100);
					return;
				}
				reject(error);
			}
			else {
				log('login ok, k1:' + k1 + ', k2:' + k2);
				resolve({response:response,body:body,k1:k1,k2:k2});
			}
		}, url_login1, postbody, false, opt);
	  });
	})

	.then(function(value) {
	  return new Promise(function(resolve, reject) {

		log('ssoLogin.');
		var url = 'https://trade-nano1.xxxxxxxxxxxx.co.jp/quick/ssoLogin';
		var opt = {
			headers: {
				//'Cookie': g_save['cookie'],
				//'Cookie' : 'sto-id=BFEADEAK; _ga=GA1.3.899689917.1509459452; _gid=GA1.3.167261745.1509459452; _bdck=BD.35Xb-d.lZOOSeh.3;_gat_UA-100843-1=1',
				//'Referer': g_save['lasturl'],
				'Referer': 'https://account.xxxxxxxxxxxx.co.jp/retail/quick_trade_board.do?serviceId=XXXXXXXXXXXXX&channelId=WEB&btnId=00',
				'Upgrade-Insecure-Requests': 1,
			},
		};
		var postbody = 'k1='+encodeURIComponent(value.k1)+'&k2='+encodeURIComponent(value.k2);
		//log('ssoLogin postbody:'+postbody，'debug', false, true);
		postAjaxAuto2(function(error, response, body, fcallback_param2) {
			//log('ssoLogin body:'+body, 'debug', false, true);
			if (body && body.indexOf('<title>システムエラー</title>') > 0) {
				log('system error:'+body);
			}
			else if (error || !body || body.indexOf('<title>クイック発注ボード</title>') < 0) {
                                log('ssoLogin error body:'+body);
				log('ssoLogin error or body ng:'+error);
				reject(error);
			}
			else {
				log('ssoLogin ok.');
				resolve({response:response,body:body});
			}
		}, url, postbody, false, opt);

	  });
	})

	.then(function(value) {
	  return new Promise(function(resolve, reject) {

		log('start_login over');
		start_reload(fcallback);

	  });
	})

	.catch(function (error) {
	  log(error);
	  fcallback(error);
	});
}

function start_reload(fcallback, isCloseStream) {
	if(isCloseStream) {
		var cback = function() {
			start_reload2(fcallback);
		}
		if(g_orderinfo['now_sell']) {
			var postbody = '0::';
			postpayload(cback, cback, postbody);
		}
		else {
			cback();
		}
	}
	else {
		start_reload2(fcallback);
	}
}
function start_reload2(fcallback) {
	log('start_reload');
	g_save['reloadok_f'] = 0;
	g_save['orderlist_f'] = 0;
	g_save['orderlist_cnt'] = 0;
	g_save['orderzc'] = 0;
	Promise.resolve()

	.then(function(value) {
	  return new Promise(function(resolve, reject) {

		log('get token.');
		var url = 'https://trade-nano1.xxxxxxxxxxxx.co.jp/quick/socket.io/1/?clientType=pc&t='+(new Date()/1);
		var opt = {
			headers: {
				'Cookie': g_save['cookie'],
				//'Cookie': 'sto-id=BFEADEAK; _ga=GA1.3.899689917.1509459452; _gid=GA1.3.167261745.1509459452; _bdck=BD.35Xb-d.lZOOSeh.3;_gat_UA-100843-1=1',
				'Referer': g_save['lasturl'],
				'Upgrade-Insecure-Requests': 1,
			},
		};
		postAjaxAuto(function(error, response, body, fcallback_param2) {
			//PYIsKre4qpSXYSRBUJf5:60:10:htmlfile,xhr-streaming,xhr-polling-nowait
			log('token body:'+body,'debug',false,true);
			//console.log("postAjaxAuto response:", response);
			if (error || !body || body.indexOf(':') < 0) {
				log('error:'+error,'debug',false,true);
				reject(error);
			}
			else {
				var ind = body.indexOf(':');
				g_save['token'] = body.substring(0, ind);
				resolve({response:response,body:body});
			}
		}, url, false, false, opt);

	  });
	})

	.then(function(value) {
	  return new Promise(function(resolve, reject) {

		g_save['payloadindex'] = 0;
		var postbody = false;
		postpayload(resolve, reject, postbody);

	  });
	})

	.then(function(value) {
	  return new Promise(function(resolve, reject) {

		var postbody = '{"name":"subscribe","args":[{"meta":{},"body":"reload"}]}';
		postpayload(resolve, reject, postbody);

	  });
	})

	.then(function(value) {
	  return new Promise(function(resolve, reject) {

		var postbody = '{"name":"workspaceInitialized","args":[{"meta":{}}]}';
		postpayload(resolve, reject, postbody);

	  });
	})

	.then(function(value) {
	  return new Promise(function(resolve, reject) {

		var postbody = '{"name":"getRegularMarginStatus","args":[{"meta":{},"body":{"productId":"SPOT_'+g_orderinfo['pair']+'"}}]}';
		postpayload(resolve, reject, postbody);

	  });
	})

	.then(function(value) {
	  return new Promise(function(resolve, reject) {

		var postbody = '{"name":"subscribe","args":[{"meta":{},"body":"execution"}]}';
		postpayload(resolve, reject, postbody);

	  });
	})

	.then(function(value) {
	  return new Promise(function(resolve, reject) {

		var postbody = '{"name":"subscribe","args":[{"meta":{},"body":"order"}]}';
		postpayload(resolve, reject, postbody);

	  });
	})

	.then(function(value) {
	  return new Promise(function(resolve, reject) {

		var postbody = '{"name":"subscribe","args":[{"meta":{},"body":"delivery"}]}';
		postpayload(resolve, reject, postbody);

	  });
	})

	/*
	.then(function(value) {
	  return new Promise(function(resolve, reject) {

		var postbody = '{"name":"subscribe","args":[{"meta":{},"body":"notification"}]}';
		postpayload(resolve, reject, postbody);

	  });
	})*/

	/*
	.then(function(value) {
	  return new Promise(function(resolve, reject) {

		var postbody = '{"name":"subscribe","args":[{"meta":{},"body":"bardata.SPOT_'+g_orderinfo['pair']+'.ASK.FIVE_MIN"}]}';
		postpayload(resolve, reject, postbody);

	  });
	})*/

	.then(function(value) {
	  return new Promise(function(resolve, reject) {

		var postbody = '{"name":"subscribe","args":[{"meta":{},"body":"price.'+g_orderinfo['pair']+'"}]}';
		postpayload(resolve, reject, postbody);

	  });
	})

	.then(function(value) {
	  return new Promise(function(resolve, reject) {

		var postbody = '{"name":"positionSummary","args":[{"meta":{},"body":{"currencyPair":"'+g_orderinfo['pair']+'"}}]}';
		postpayload(resolve, reject, postbody);

	  });
	})

	.then(function(value) {
	  return new Promise(function(resolve, reject) {

		var postbody = '{"name":"getPlInfo","args":[{"meta":{},"body":{}}]}';
		postpayload(resolve, reject, postbody);

	  });
	})

	/*
	.then(function(value) {
	  return new Promise(function(resolve, reject) {

		var postbody = '{"name":"contractList","args":[{"meta":{},"body":{"productId":"SPOT_'+g_orderinfo['pair']+'","pageNumber":"0","inquriyPanelExpandFlg":"false"}}]}';
		postpayload(resolve, reject, postbody);

	  });
	})*/

	/*
	.then(function(value) {
	  return new Promise(function(resolve, reject) {

		var postbody = '{"name":"chart","args":[{"meta":{},"body":{"fxProductId":"SPOT_'+g_orderinfo['pair']+'","chartIntervalType":"300","numOfBars":"325","bidAskType":"1"}}]}';
		postpayload(resolve, reject, postbody);

	  });
	})*/

	/*
	.then(function(value) {
	  return new Promise(function(resolve, reject) {

		var postbody = '{"name":"orderLineList","args":[{"meta":{},"body":{"currencyPair":"'+g_orderinfo['pair']+'","bidAskType":"ASK","orderLineDisplaySetting":"2","orderLineDisplayNum":"1","orderReservLineDisplaySetting":"2","orderReservLineDisplayNum":"1"}}]}';
		postpayload(resolve, reject, postbody);

	  });
	})*/

	/*
	.then(function(value) {
	  return new Promise(function(resolve, reject) {

		var postbody = '{"name":"getInfobarFlg","args":[{"meta":{},"body":""}]}';
		postpayload(resolve, reject, postbody);

	  });
	})*/

	.then(function(value) {
	  return new Promise(function(resolve, reject) {

		var postbody = '1::';
		postpayload(resolve, reject, postbody);

	  });
	})

	.then(function(value) {
	  return new Promise(function(resolve, reject) {

		  g_save['reloadok_f'] = 1;
		  log('start_reload ok.');
		  fcallback(false);

	  });
	})
	.catch(function (error) {
	  log(error);
	  fcallback(error);
	});
}

function start_fx() {
	funForExit = function() {
		update_price_testsave(true);
		gain_save(true);

		//fWrite('./log/fxmp-tmp.save', JSON.stringify(g_save['tmp_p']), false, true);
	}
	loadConfig();
	loadadjust();
	if(g_user == '' || !g_orderinfo['pricerang'] || !g_orderinfo['minremain']) {
		console.log('fxmp-config.js error.');
		//process.exit();
		process.send({id:'exit', msg:'fxmp-config.js error.'});
	}

	for(var i in g_orderinfo['pricerang']) {
		var item = g_orderinfo['pricerang'][i];
		if(!item.act || !item.pspace || !item.gspace || item.pspace <= 0 || item.gspace <= 0 || item.min >= item.max) {
			log('Error pricerang:' + JSON.stringify(item));
			//process.exit();
			process.send({id:'exit', msg:'price rang error.'});
		}
	}

	log('start_fx');
	g_save['loginok_f'] = 0;
	g_save['reloadok_f'] = 0;
	g_save['orderlist_f'] = 0;
	g_save['orderlist_cnt'] = 0;

	g_orderinfo['fxpause_f'] = 0;
	if(fExist('./log/fxmp-pause.flg')) {
		g_orderinfo['fxpause_f'] = 1;
	}

	//g_save['MACD'] = MACD(60*5, 60*15, 0.05);

	Promise.resolve()
	.then(function (value) {
	  return new Promise(function(resolve, reject) {
		//本日损益按日期保存
		getGlobalValue('tj_gain', function(ret) {
			g_orderinfo['tj_gain'] = ret.val;
			if(!g_orderinfo['tj_gain']) {
				g_orderinfo['tj_gain'] = {};
			}
			resolve();
		});
	  });
	})

	.then(function(value) {
	  return new Promise(function(resolve, reject) {
		getGlobalValue('test_s', function(ret) {
			g_save['test_s'] = ret.val;
			if(!g_save['test_s']) {
				g_save['test_s'] = {};
			}
			//列表
			if(!g_save['test_s'].list) {
				g_save['test_s'].list = {};
			}
			//损益
			if(!g_save['test_s'].gain) {
				g_save['test_s'].gain = {};
			}
			resolve();
		});
	  });
	})

	.then(function(value) {
	  return new Promise(function(resolve, reject) {
		getGlobalValue('test_macd', function(ret) {
			if(ret.val && typeof(ret.val) == 'object') {
				g_save['MACD'].loadCfg(ret.val);
			}
			resolve();
		});
	  });
	})

	.then(function(value) {
	  return new Promise(function(resolve, reject) {
		g_save['retry'] = 0;
		start_login(function(error) {
			process.send({id:'idle'});
			if(error) {
                /*
                var f_get_timeout = function(timeout) {
                    // not sure workday. 
                    // but, add sleep from Saturday 6:00 to next Monday 5:00
                    timeout2 = 60*60*1000;
                    var date = new Date () ;
                    var dayOfWeek = date.getDay() ;	                    
                    if(dayOfWeek==0) {
                        // Sunday
                        return timeout2; // only for every hour.
                    }
                    if(dayOfWeek==0) {
                        // Monday
                        if(date.getHours()<=5){
                            return timeout2; // only for every hour.
                        }
                    }                        
                    if(dayOfWeek==6) {
                        // Saturday
                        if(date.getHours()>6){
                            return timeout2; // only for every hour.
                        }
                    }
                    return timeout;
                }*/
				var f_retry = function() {
					process.send({id:'idle'});
					g_save['retry']++;
					if(g_save['retry'] < 6 * 3 && g_save['retry']%6 == 5) {
						//60 s
						log('retry:' + Math.floor(g_save['retry']/6));
						callback(start_fx, 10000);
                        //callback(start_fx, f_get_timeout(10000));
					}
					else if(g_save['retry'] < 18 * 5 && g_save['retry']%18 == 17) {
						log('retry:' + Math.floor(g_save['retry']/18));
						callback(start_fx, 10000);
                        //callback(start_fx, f_get_timeout(10000));
					}
					else if(g_save['retry'] > 18 * 5) {
						log('login error, give up retry:' + g_save['retry']);
						callback(f_retry, 60000);
					}
					else {
						callback(f_retry, 10000);
					}
				};
				callback(f_retry, 10000);
			}
			else {
				g_save['loginok_f'] = 1;
				g_save['retry'] = 0;
				mainloop();
			}
		});
	  });
	})

	.catch(function (error) {
	  log(error);
	});
}
$start_fx = function() {
	process.send({id:'restart'});
};
function pause_fx() {
	var old = g_orderinfo['fxpause_f'];
	g_orderinfo['fxpause_f'] = 1;
	fWrite('./log/fxmp-pause.flg', ''+time(), false, true);
	return old;
}
$pause_fx = pause_fx;
function resume_fx() {
	var old = g_orderinfo['fxpause_f'];
	g_orderinfo['fxpause_f'] = 0;
	fRemove('./log/fxmp-pause.flg');
	return old;
}
$resume_fx = resume_fx;

/* 子线程保存数据到主线程 */
var g_callback = {};
var g_callback_cnt = 0;
function setGlobalValue(key, val, fcallback) {
	//console.log('set:' + key);
	if(fcallback) {
		g_callback_cnt++;
		g_callback['fset_'+g_callback_cnt] = fcallback;
		process.send({id:'set', key:key, val:val, serical:g_callback_cnt});
	}
	else {
		process.send({id:'set', key:key, val:val});
	}
}
/* 子线程从主线程取得数据 */
function getGlobalValue(key, fcallback) {
	//console.log('get:' + key);
	if(fcallback) {
		g_callback_cnt++;
		g_callback['fget_'+g_callback_cnt] = fcallback;
		process.send({id:'get', key:key, serical:g_callback_cnt});
	}
	else {
		process.send({id:'get', key:key});
	}
}

function start_fx_child() {
	var isChild = !!(process.send);
	if(!isChild) {
		console.log('need start child with fork mode.');
		return;
	}
	console.log('child process start.');
	startWebServer();
	process.on("message", function (msg) {
		//console.log('child message:'+msg.id);
		if(msg.id == 'exit') {
			process.exit();
			return;
		}
		else if(msg.id == 'set' && msg.id2 == 'response') {
			/* 子线程送信后，主线程回馈的处理 */
			//console.log('set:' + msg.key);
			var fun = g_callback['fset_'+msg.serical];
			if(fun) {
				delete g_callback['fset_'+msg.serical];
				fun(msg);
			}
		}
		else if(msg.id == 'get' && msg.id2 == 'response') {
			/* 子线程送信后，主线程回馈的处理 */
			//console.log('get:' + msg.key);
			var fun = g_callback['fget_'+msg.serical];
			if(fun) {
				delete g_callback['fget_'+msg.serical];
				fun(msg);
			}
		}
	});
	//process.on('exit', function () {
	//	console.log("child exit");
	//});
	start_fx();
}
var g_various = {};
function start_fx_disp() {
	//console.log(`${__dirname}/sub.js`);
	//console.log(__filename);
	console.log('parent process start.');

	console.log('mainprocess restore data.');
	if(fExist('./log/fxmp-gain.save')) {
		var txt = ''+fRead('./log/fxmp-gain.save');
		g_various['tj_gain'] = JSON.parse(txt);
	}
	if(!g_various['tj_gain']) {
		g_various['tj_gain'] = {};
	}
	if(fExist('./log/fxmp-test.save')) {
		var txt = ''+fRead('./log/fxmp-test.save');
		g_various['test_s'] = {};
		var test_s = JSON.parse(txt);
		for(var jj in testarr) {
			var pricespace = testarr[jj].pspace;
			var gainspace = testarr[jj].gspace;
			var keyg = 'p:'+pricespace+', g:'+gainspace;
			if(test_s.list[keyg]) {
				g_save['test_s'].list[keyg] = test_s.list[keyg];
			}
		}
	}
	if(!g_various['test_s']) {
		g_various['test_s'] = {};
	}
	funForExit = function() {
		console.log('mainprocess save data.');
		fWrite('./log/fxmp-test.save', JSON.stringify(g_various['test_s']), false, true);
		fWrite('./log/fxmp-gain.save', JSON.stringify(g_various['tj_gain']), false, true);
		//fWrite('./log/fxmp-rete.save', JSON.stringify(g_save['tmp_p']), false, true);
	}

	var tSaveData = milliseconds();
	var disp_time = milliseconds();
	var child_process = require('child_process');

	processChild = false;
	var isStarting = false;
	var childRestart = function() {
		if(isStarting) {
			return;
		}
		isStarting = true;
		if(processChild) {
			processChild.send({id:'exit'});
			process.kill(processChild.pid, 'SIGINT');
			processChild.kill();
		}
		setTimeout(function() {
			disp_time = milliseconds();
			processChild = child_process.fork(__filename, ['-cmd', 'fxchild']);
			processChild.on('exit', function(exitCode, sigCode) {
				console.log('child process exit, exitCode:'+exitCode+', sigCode:'+sigCode);
			});
			processChild.on("message", function (msg) {
				if(msg.id == 'idle') {
					disp_time = milliseconds();
					//console.log('disp_time:'+disp_time);
				}
				else if(msg.id == 'restart') {
					log('child restart', 'important');
					childRestart();
				}
				else if(msg.id == 'exit') {
					log('child exit, msg:'+msg.msg, 'important');
					process.exit();
				}
				else if(msg.id == 'set') {
					/* 子线程保存数据到主线程 */
					g_various[msg.key] = msg.val;
					msg.id2 = 'response';
					processChild.send(msg);

					if(milliseconds() - tSaveData > 60000 * 15) {
						tSaveData = milliseconds();
						funForExit();
					}
				}
				else if(msg.id == 'get') {
					/* 子线程从主线程取得数据 */
					msg.val = g_various[msg.key];
					msg.id2 = 'response';
					processChild.send(msg);
				}
			});
			isStarting = false;
		}, 300);
	};
	childRestart();

	var dispatch = function() {
		update_act_flagfile();
		if(milliseconds() - disp_time > 60000 * 2) {
			//child may has some problem need restart
			log('childRestart', 'important');
			childRestart();
		}
		//console.log('dispatch, child idle:'+disp_time);
		callback(dispatch, 10000);
	}
	callback(dispatch, 100);
}

/////////////////////////////////////////////////////////////////entry
function start_entry() {
	var options = process.argv;
	for(var i = 0; i < options.length; i++) {
		if(options[i].substring(0, 1) == '-' && i + 1 < options.length) {
			optionsCmd[options[i]] = options[i+1];
		}
	}
	
	if(optionsCmd['-cmd']) {
		console.log('-cmd ' + optionsCmd['-cmd']);
		if(optionsCmd['-cmd'] == 'fxstart') {
			start_fx_disp(optionsCmd);
			return;
		}
		else if(optionsCmd['-cmd'] == 'fxchild') {
			start_fx_child();
			return;
		}
	}
	console.log('need -cmd fxstart.');
}
start_entry();
