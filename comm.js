if(typeof String.prototype.startsWith != 'function') {
	String.prototype.startsWith = function(str) {
		return this.substring(0, str.length) === str;
	}
};
if(typeof String.prototype.endsWith != 'function') {
	String.prototype.endsWith = function(str) {
		return this.substring(this.length - str.length, this.length) === str;
	}
};
if(typeof String.prototype.trim != 'function') {
	String.prototype.trim = function() {
		return this.replace(/(^\s*|\s*$)/g, '');
	}
};
if(typeof String.prototype.toInt != 'function') {
	String.prototype.toInt = function() {
		return /^\s*-?0x/i.test(this) ? parseInt(this, 16) : parseInt(this, 10);
	}
};
/*
  sample:
  var str = "{0} : {1} + {2} = {3}".format("plus", 8, 0.5, 8+0.5);
  or:
  var str = "name：{name}, age：{age}".format( { "name":"my name", "age":128 } );
*/
if(String.prototype.format == undefined) {
  String.prototype.format = function(arg)
  {
    var rep_fn = undefined;

    if (typeof arg == "object") {
      rep_fn = function(m, k) {
		  var karr = k.split('.');
		  var arg0 = arg;
		  for(var i=0; karr && i<karr.length;i++) {
			  if(arg0[karr[i]]) {
				  arg0 = arg0[karr[i]];
			  }
			  else {
				  arg0 = false;
				  break;
			  }
		  }
		  if(arg0) {
			  return arg0;
		  }
		  return arg[k];
	  }
    }
    else {
      var args = arguments;
      rep_fn = function(m, k) {
		  return args[parseInt(k)];
	  }
    }

    return this.replace(/\{([\w.]+)\}/g, rep_fn);
  }
};

var roundDecimal = function (val, precision) {
  return Math.round(Math.round(val * Math.pow(10, (precision || 0) + 1)) / 10) / Math.pow(10, (precision || 0));
}

function isAlpha(val) {
  var re = /^([a-zA-Z])+$/;
  return (re.test(val));
}
function isNumeric(num) {
  return (num >=0 || num < 0);
}
function isInt(value) {
    var er = /^-?[0-9]+$/;
    return er.test(value);
}
function isEmpty(str) {
	if (!str || str == null || str == '' || (typeof(str) == 'string' && str.trim() == '')) {
		return true;
	}
	return false;
}

function arrayIndexOf(arr, item) {
  for(var i=arr.length-1;i>=0;i--) {
    if(arr[i] == item) {
      return i;
    }
  }
  return -1;
}
function arrayRemove(arr, ind) {
  if(ind<0 || arr.length<=ind) return;
  if(ind!=arr.length-1) {
    for(var i=ind;i<arr.length-1;i++) {
      arr[i] = arr[i+1];
    }
  }
  arr.length--;
}
function arrayKeyExist(arr) {
  return (key in arr);
}

function ObjArraySort(ary, key, order) {
    var reverse = 1;
    if(order && order.toLowerCase() == "desc") 
        reverse = -1;
    ary.sort(function(a, b) {
        if(a[key] < b[key])
            return -1 * reverse;
        else if(a[key] == b[key])
            return 0;
        else
            return 1 * reverse;
    });
}

function countChar(str, chr) {
  var cnt = 0;
  for (var i=0; i<str.length; i++) {
    if (str.charAt(i) == chr)
      cnt++;
  }
  return cnt;
}

function leftPadding(str, length, filstr) {
	if (isEmpty(filstr))
		filstr = " ";

	var strtemp = str;
	if (str.length >= length) {
		return str;
	}

	for (var i = 1; i <= (length - str.length); i++) {
		strtemp = filstr + strtemp;
	}

	return strtemp;
}

function getFrontString(str, searchStr) {
	var targetIndex = 0;
	
	targetIndex = str.indexOf(searchStr);
	if (targetIndex == -1) 
		return null;

	return str.substring(0,targetIndex);
}
function getBackString(str, searchStr) {
	var targetIndex = 0;
	targetIndex = str.indexOf(searchStr);
	if (targetIndex == -1)
		return null;
	return str.substring(targetIndex + searchStr.length,str.length);
}


function getpinyin(txt) {
	txt = txt.replace(/ /gi, '');
	txt = txt.replace(/&nbsp;/gi, '');
	txt = txt.replace(/&lt;/gi, '');
	txt = txt.replace(/&gt;/gi, '');
	txt = txt.replace(/&amp;/gi, '');
	txt = pinyin.jian(txt);
	var x1 = '１２３４５６７８９０ａｂｃｄｅｆｇｈｉｊｋｌｍｎｏｐｑｒｓｔｕｖｗｘｙｚＡＢＣＤＥＦＧＨＩＪＫＬＭＮＯＰＱＲＳＴＵＶＷＸＹＺ';
	var x2 = '1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
	var str = '';
	for(var i = 0; i < txt.length; i++) {
		var c = txt.charAt(i);
		var ind = x1.indexOf(c);
		if(ind != -1) {
			str += x2.charAt(ind);
		}
		else {
			str += c;
		}
	}
	if(str == '佚名') {
		return 'yiming';
	}
	txt = str;
	txt = pinyin.getFullChars(txt);
	txt = txt.toLowerCase();
	var x3 = '1234567890abcdefghijklmnopqrstuvwxyz';
	str = '';
	for(var i=0;i<txt.length;i++) {
		var c = txt.charAt(i);
		if(x3.indexOf(c) >= 0) {
			str+=c;
		}
	}
	return str;
}

function print_object(obj, pre, nestmax, nextind) {
	var ret = '';
	if(!nextind) {
		nextind = 0;
	}
	if(!pre) {
		pre = '';
	}
	for(k in obj) {
		if(obj[k] && (typeof obj[k] == 'object' || typeof obj[k] == 'array')) {
			ret += (pre + 'key:'+k+', val:');
			if(!nestmax || nestmax < nextind) {
				ret += print_object(obj[k], pre + '  ', nestmax, nextind + 1);
			}
		}
		else if(obj[k] && typeof obj[k] == 'function') {
			ret += (pre + 'key:'+k+', val:[function]');
		}
		else {
			ret += (pre + 'key:'+k+', val:' + obj[k]);
		}
	}
	return ret;
}

/*
if hasCont2 or hasCont3 ===true, then use of lastIndexOf
*/
function getContOne(txt, sAllStart, sAllEnd, sStart1, sEnd1, hasCont1, sStart2, sEnd2, hasCont2, sStart3, sEnd3, hasCont3) {
	var txti = '';
	var ignoreCase = true;
	if(typeof(txt) == 'object') {
		var obj = txt;
		txt = obj.txt;
		txti = ignoreCase ? txt.toLowerCase() : txt;
		sAllStart = obj.sAllStart;
		sAllEnd = obj.sAllEnd;
		sStart1 = obj.sStart1;
		sEnd1 = obj.sEnd1;
		hasCont1 = obj.hasCont1;
		sStart2 = obj.sStart2;
		sEnd2 = obj.sEnd2;
		hasCont2 = obj.hasCont2;
		sStart3 = obj.sStart3;
		sEnd3 = obj.sEnd3;
		hasCont3 = obj.hasCont3;
		innerFilter = obj.innerFilter;
		if(obj.ignoreCase === false) {
			ignoreCase = false;
		}
	}
	else {
		txti = ignoreCase ? txt.toLowerCase() : txt;
	}
	if(ignoreCase) {
		sAllStart = (sAllStart || '').toLowerCase();
		sAllEnd = (sAllEnd || '').toLowerCase();
		sStart1 = (sStart1 || '').toLowerCase();
		sEnd1 = (sEnd1 || '').toLowerCase();
		hasCont1 = (hasCont1 || '').toLowerCase();
		sStart2 = (sStart2 || '').toLowerCase();
		sEnd2 = (sEnd2 || '').toLowerCase();
		if(hasCont2 !== true) {
			hasCont2 = (hasCont2 || '').toLowerCase();
		}
		sStart3 = (sStart3 || '').toLowerCase();
		sEnd3 = (sEnd3 || '').toLowerCase();
		if(hasCont3 !== true) {
			hasCont3 = (hasCont3 || '').toLowerCase();
		}
	}

	if(sAllStart && sAllStart != '') {
		var ind1 = txti.indexOf(sAllStart);
		if(ind1 < 0) {
			return false;
		}
		txt = txt.substring(ind1 + sAllStart.length);
		txti = ignoreCase ? txt.toLowerCase() : txt;
	}
	if(sAllEnd && sAllEnd != '') {
		var ind1 = txti.indexOf(sAllEnd);
		if(ind1 < 0) {
			return false;
		}
		txt = txt.substring(0, ind1);
		txti = ignoreCase ? txt.toLowerCase() : txt;
	}
	if(!sStart1) sStart1 = '';
	if(!sEnd1) sEnd1 = '';
	if(!sStart2) sStart2 = '';
	if(!sEnd2) sEnd2 = '';
	if(!sStart3) sStart3 = '';
	if(!sEnd3) sEnd3 = '';
	if(sStart1 == '' && sEnd1 == '') {
		return false;
	}

	var ind0 = 0;
	while(true) {
		var ind1 = (sStart1 == '') ? ind0 : txti.indexOf(sStart1, ind0);
		if(ind1 < 0) {
			return false;
		}
		var ind2 = (sEnd1 == '') ? txt.length : txti.indexOf(sEnd1, ind1 + sStart1.length);
		if(ind2 < 0) {
			return false;
		}

		//console.log('ind0:'+ind0 + ', ind1:'+ind1 + ', ind2:'+ind2);
		ind0 = ind2 + sEnd1.length;
		var s2 = txt.substring(ind1 + sStart1.length, ind2);
		var s2txti = ignoreCase ? s2.toLowerCase() : s2;
		if(hasCont1 && hasCont1 != '' && s2txti.indexOf(hasCont1) < 0) {
			continue;
		}

		if(hasCont2 === true) {
			ind1 = (sStart2 == '') ? s2.length : s2txti.lastIndexOf(sStart2);
			if(ind1 < 0) {
				continue;
			}
			var ind2 = (sEnd2 == '') ? 0 : s2txti.lastIndexOf(sEnd2, ind1);
			if(ind2 < 0) {
				continue;
			}
			ind2 += sEnd2.length;
			if(ind2 != 0 || ind1 != s2.length) {
				s2 = s2.substring(ind2, ind1);
				s2txti = ignoreCase ? s2.toLowerCase() : s2;
			}
		}
		else {
			ind1 = (sStart2 == '') ? 0 : s2txti.indexOf(sStart2);
			if(ind1 < 0) {
				continue;
			}
			ind1 += sStart2.length;
			ind2 = (sEnd2 == '') ? s2.length : s2txti.indexOf(sEnd2, ind1);
			if(ind2 < 0) {
				continue;
			}
			if(ind1 != 0 || ind2 != s2.length) {
				s2 = s2.substring(ind1, ind2);
				s2txti = ignoreCase ? s2.toLowerCase() : s2;
				if(hasCont2 && hasCont2 != '' && s2txti.indexOf(hasCont2) < 0) {
					continue;
				}
			}
		}

		if(hasCont3 === true) {
			ind1 = (sStart3 == '') ? s2.length : s2txti.lastIndexOf(sStart3);
			if(ind1 < 0) {
				continue;
			}
			var ind2 = (sEnd3 == '') ? ind0 : s2txti.lastIndexOf(sEnd3, ind1);
			if(ind2 < 0) {
				continue;
			}
			ind2 += sEnd3.length;
			if(ind2 != 0 || ind1 != s2.length) {
				s2 = s2.substring(ind2, ind1);
				s2txti = ignoreCase ? s2.toLowerCase() : s2;
			}
		}
		else {
			ind1 = (sStart3 == '') ? 0 : s2txti.indexOf(sStart3);
			if(ind1 < 0) {
				continue;
			}
			ind1 += sStart3.length;
			ind2 = (sEnd3 == '') ? s2.length : s2txti.indexOf(sEnd3, ind1);
			if(ind2 < 0) {
				continue;
			}
			if(ind1 != 0 || ind2 != s2.length) {
				s2 = s2.substring(ind1, ind2);
				s2txti = ignoreCase ? s2.toLowerCase() : s2;
				if(hasCont3 && hasCont3 != '' && s2txti.indexOf(hasCont3) < 0) {
					continue;
				}
			}
		}

		return s2;
	}
	return false;
}

function getContArr(txt, sAllStart, sAllEnd, sStart1, sEnd1, hasCont1, sStart2, sEnd2, hasCont2, sStart3, sEnd3, hasCont3, innerFilter) {
	var txti = '';
	var ignoreCase = true;
	if(typeof(txt) == 'object') {
		var obj = txt;
		txt = obj.txt;
		txti = ignoreCase ? txt.toLowerCase() : txt;
		sAllStart = obj.sAllStart;
		sAllEnd = obj.sAllEnd;
		sStart1 = obj.sStart1;
		sEnd1 = obj.sEnd1;
		hasCont1 = obj.hasCont1;
		sStart2 = obj.sStart2;
		sEnd2 = obj.sEnd2;
		hasCont2 = obj.hasCont2;
		sStart3 = obj.sStart3;
		sEnd3 = obj.sEnd3;
		hasCont3 = obj.hasCont3;
		innerFilter = obj.innerFilter;
		if(obj.ignoreCase === false) {
			ignoreCase = false;
		}
	}
	else {
		txti = ignoreCase ? txt.toLowerCase() : txt;
	}
	if(ignoreCase) {
		sAllStart = (sAllStart || '').toLowerCase();
		sAllEnd = (sAllEnd || '').toLowerCase();
		sStart1 = (sStart1 || '').toLowerCase();
		sEnd1 = (sEnd1 || '').toLowerCase();
		hasCont1 = (hasCont1 || '').toLowerCase();
		sStart2 = (sStart2 || '').toLowerCase();
		sEnd2 = (sEnd2 || '').toLowerCase();
		if(hasCont2 !== true) {
			hasCont2 = (hasCont2 || '').toLowerCase();
		}
		sStart3 = (sStart3 || '').toLowerCase();
		sEnd3 = (sEnd3 || '').toLowerCase();
		if(hasCont3 !== true) {
			hasCont3 = (hasCont3 || '').toLowerCase();
		}
	}
	
	var ret = [];
	if(!sStart1) sStart1 = '';
	if(!sEnd1) sEnd1 = '';
	if(sStart1 == '' && sEnd1 == '') {
		return false;
	}
	if(sAllStart && sAllStart != '') {
		var ind1 = txti.indexOf(sAllStart);
		if(ind1 < 0) {
			return ret;
		}
		txt = txt.substring(ind1 + sAllStart.length);
		txti = ignoreCase ? txt.toLowerCase() : txt;
	}
	if(sAllEnd && sAllEnd != '') {
		var ind1 = txti.indexOf(sAllEnd);
		if(ind1 < 0) {
			return ret;
		}
		txt = txt.substring(0, ind1);
		txti = ignoreCase ? txt.toLowerCase() : txt;
	}
	var ind0 = 0;
	while(true) {
		var ind1 = ind0;
		if(sStart1 != '') {
			ind1 = txti.indexOf(sStart1, ind0);
		}
		var ind2 = 0;
		if(sEnd1 != '') {
			ind2 = txti.indexOf(sEnd1, ind1 + sStart1.length);
		}
		else {
			ind2 = txti.indexOf(sStart1, ind1 + sStart1.length);
			if(ind2 < 0) {
				ind2 = txt.length;
			}
		}
		if(ind1 >= 0 && ind2 > ind1) {
			ind0 = ind2 + sEnd1.length;
			var s2 = txt.substring(ind1 + sStart1.length, ind2);
			var s2txti = ignoreCase ? s2.toLowerCase() : s2;
			if(!hasCont1 || hasCont1 == '' || s2txti.indexOf(hasCont1) >= 0) {
				if((!sStart2 || sStart2 == '') && (!sEnd2 || sEnd2 == '')) {
					ret.push(s2);
				}
				else {
					s2 = getContOne(s2, '', '', sStart2, sEnd2, hasCont2, sStart3, sEnd3, hasCont3);
					if(s2 !== false) {
						ret.push(s2);
					}
				}
			}
		}
		else {
			break;
		}
	}
	if(innerFilter && ret && ret.length > 0) {
		var ret2 = [];
		for(var i = 0; i < ret.length; i++) {
			var sline = ret[i];
			var one2 = {};
			var hasone = false;
			for(var i2 in innerFilter) {
				var filter = innerFilter[i2];
				var onef = getContOne(sline, filter.sAllStart, filter.sAllEnd, filter.sStart1, filter.sEnd1, filter.hasCont1, filter.sStart2, filter.sEnd2, filter.hasCont2, filter.sStart3, filter.sEnd3, filter.hasCont3);
				if(onef !== false) {
					one2[i2] = onef;
					hasone = true;
				}
			}
			if(hasone) {
				ret2.push(one2);
			}
		}
		return ret2;
	}
	return ret;
}

function callback(funCallback, time) {
  if(!time) time = 10;
  return setTimeout(funCallback, time);
}
//not good, but valid for wait I/O process
//var sleep = require('sleep');
function sleep(seconds) {
	var waitTill = new Date(new Date().getTime() + seconds * 1000);
	while(waitTill > new Date()){}
}
/*
//need async
function sleep(seconds) {
	var async = require('async');
	var repeating = 0;
	async.forever(function(callback) {
	    async.series([
	        function(callback) {
	            setTimeout(callback, 1000);
	        },
	        function(callback) {
	            setTimeout(callback, 1000);
	        },
	        function(callback) {
	            if (++repeating < seconds) {
	                callback();
	            } else {
	                console.log("end");
	            }
	        }
	    ], callback);
	}, function(err) {
	    console.log(err);
	});
}*/

function splitUrl(urlStr, decode) {
	var ret = {};
	var ind = urlStr.indexOf('?');
	if(ind < 0) {
		return ret;
	}

	urlStr = urlStr.substring(ind + 1, urlStr.length);
	var paramsary = urlStr.split('&');
	for(var i=0; i<paramsary.length; i++) {
		ind = paramsary[i].indexOf('=');
		if(ind == 0) {
		}
		else if(ind > 0) {
			var key = paramsary[i].substring(0, ind);
			ret[key] = paramsary[i].substring(ind + 1, paramsary[i].length);
			if(decode) {
				ret[key] = decodeURIComponent(ret[key]);
			}
		}
		else if(paramsary[i].length > 0) {
			ret[paramsary[i]] = '';
		}
	}
	return ret;
}

function getParentPath(url) {
	if(url.substring(url.length-1) == '/') {
		url = url.substring(0, url.length-1);
	}
	var pos = url.lastIndexOf('/');
	if(pos > 0) {
		return url.substring(0, pos + 1);
	}
	return url;
}
function getFilename(url) {
	var pos = url.lastIndexOf('/');
	if(pos >= 0) {
		return url.substring(pos + 1);
	}
	return url;
}
function getHost(url, noEnd) {
    //get domain and protocol
	var arr = url.split("/");
	if(noEnd) {
		return arr[0] + "//" + arr[2];
	}
    return arr[0] + "//" + arr[2] + '/';
}
function getHostOnly(url) {
    var domain;
    //find & remove protocol (http, ftp, etc.) and get domain
    if (url.indexOf("://") >= 0) {
        domain = url.split('/')[2];
    }
    else {
        domain = url.split('/')[0];
    }

    //find & remove port number
    domain = domain.split(':')[0];
    return domain;
}
function getUrlInfo(url) {
	var ind = url.indexOf("://");
	if(ind < 0) {
		return false;
	}
	var oRetu = {port:80};
	oRetu.protocol = url.substring(0, ind + 3);
	if(oRetu.protocol == 'https://') {
		oRetu.port = 443;
	}
	var ind2 = url.indexOf("/", ind + 4);
    if (ind2 < 0) {
		url += '/';
		ind2 = url.length - 1;
    }
	var ind3 = url.indexOf(":", ind + 4);
    if (ind3 > 0 && ind3 < ind2) {
		oRetu.port = url.substring(ind3 + 1, ind2);
    }
	oRetu.host = url.substring(ind + 3, ind2); //www.xxx.com
	oRetu.host2 = url.substring(0, ind2 + 1); //http://www.xxx.com
	oRetu.path = url.substring(ind2);
	if(oRetu.path == '') {
		oRetu.path = '/';
	}
	//console.log(oRetu);
	return oRetu;
}


/**
 * 获取日期格式字符串
 * dateFormat(false, 'yyyy-MM-dd');
 * dateFormat(false, 'yyyy-MM-dd hh:mm:ss.S');
 * @param date
 *           日期对象
 * @param fmt
 *           格式的字符串
 * @author li.feng@zhuhuakeji.com
 */
function dateFormat(date, fmt) {
	var weekArr = new Array('Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat');
	var monthArr = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
	var monthArr2 = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];
	if(!date) {
		date = new Date();
	}
	var o = {
		"M+" : date.getMonth()+1,                 //月份
		"d+" : date.getDate(),                    //日
		"h+" : date.getHours(),                   //小时
		"m+" : date.getMinutes(),                 //分
		"s+" : date.getSeconds(),                 //秒
		"q+" : Math.floor((date.getMonth()+3)/3), //季度
		"S"  : date.getMilliseconds(),            //毫秒
		"W"  : weekArr[date.getDay()],            //Week
		"X"  : monthArr[date.getMonth()],         //Month
		"Z"  : monthArr2[date.getMonth()]         //Month.
	};
	o['S'] = ('000'+o['S']).substr(-3);
	if(/(y+)/.test(fmt)) {
		fmt = fmt.replace(RegExp.$1, (date.getFullYear()+"").substr(4 - RegExp.$1.length));   
	}
	for(var k in o) {
		if(new RegExp("("+ k +")").test(fmt)) {
			fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));   
		}
	}
	return fmt;   
}

//Seconds from 1970/01/01 00:00:00
function seconds() {
	return parseInt(new Date().getTime()/1000);
}
//1Second/1000 from 1970/01/01 00:00:00
function milliseconds() {
	return parseInt(new Date().getTime()/1);
}
//Seconds from 1970/01/01 00:00:00
function time() {
	return parseInt(new Date().getTime()/1000);
}
function getTimestamp(date, isMic) {
	if(isMic) {
		return dateFormat(date, 'yyyy-MM-dd hh:mm:ss.S');
	}
	return dateFormat(date, 'yyyy-MM-dd hh:mm:ss');
}

/**
 * 加日期
 * 
 * @param number
 *             天数
 * @author li.feng@zhuhuakeji.com
 */
function addDate(number, date) {
	if(!date) {
		date = new Date();
	}
	date.setDate(date.getDate() + number);
	
	return date;
}

/**
 * false for error
 */
function getDateFromYMD(year, month, day, hh, mm, ss, sss) {
	month = month/1 - 1;
	if(!hh) {
		hh = 0;
	}
	if(!mm) {
		mm = 0;
	}
	if(!ss) {
		ss = 0;
	}
	if(!sss) {
		sss = 0;
	}
	try {
		var tempDate = new Date(year, month, day, hh, mm, ss);
		if ( (year == tempDate.getFullYear()) && (month == tempDate.getMonth()) && (day == tempDate.getDate()) ) {
			if(sss) {
				tempDate.setMilliseconds(sss);
			}
			return tempDate;
		}
		else {
			console.log('y:'+year+', m:'+month+', d:'+day+', tempDate:'+tempDate);
			return false;
		}
	}
	catch(e) {
	}
	return false;
}

function getDateFromSeconds(secs) {
	var t = new Date(1970, 0, 1); // Epoch
	t.setTime(secs * 1000);
	return t;
}

/**
 * Date for yyyy/mm/dd or mm-dd-yyyy or yyyy.mm.dd or yyyymmdd
 * false for error
 */
function getDateFromString(str) {
	if(!str || str == '') {
		return false;
	}
	
	if(str.length == 8) {
		return getDateFromYMD(str.substr(0,4), str.substr(4,2), str.substr(6,2));
	}
	else {
		var arr = new Array();
		if(str.indexOf("-") > 0) {
			arr = str.toString().split("-");
		}
		else if(str.indexOf("/") > 0) {
			arr = str.toString().split("/");
		}
		else if(str.indexOf(".") > 0) {
			arr = str.toString().split(".");
		}
		else {
			return false;
		}

		if(arr.length == 3) {
			if(arr[0].length == 4) {
				return getDateFromYMD(arr[0], arr[1], arr[2]);
			}
			if(arr[2].length == 4) {
				return getDateFromYMD(arr[2], arr[0], arr[1]);
			}
		}
	}
	return false;
}

function stringReplace(str, from, to, opt){
	if(!opt) {
		opt = 'gi';
	}
	from = from.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
	var re = new RegExp(from, opt);
	return str.replace(re, to);
}

function createFile(fpath, data){
	var options = { flag : 'w+', encoding:'utf8', mode : 0777 };
	fs.writeFile(fpath, data, function(err){
	    if(err) throw err;
	});
}

function fSize(fpath){
	//var fs = require("fs");
	try {
		if(typeof(fpath) == 'number') {
			var stats = fs.fstatSync(fpath);
			return stats["size"];
		}
		else {
			var stats = fs.statSync(fpath);
			return stats["size"];
		}
	}
	catch (e) {
		if(e && e.code == 'ENOENT') {
			// file does not exist
			return -1;
		}
		else if(e && e.code == 'EACCES') {
			// No Permission
			return -2;
		}
		console.log('fSize:'+e.stack);
	}
	return -3;
}

/*
{ dev: 2049
, ino: 305352
, mode: 16877
, nlink: 12
, uid: 1000
, gid: 1000
, rdev: 0
, size: 4096
, blksize: 4096
, blocks: 8
, atime: '2009-06-29T11:11:55Z'
, mtime: '2009-06-29T11:11:40Z'(last modified time.)
, ctime: '2009-06-29T11:11:40Z' 
}
*/
function fStat(fpath){
	try {
		if(typeof(fpath) == 'number') {
			var stats = fs.fstatSync(fpath);
			return stats;
		}
		else {
			var stats = fs.statSync(fpath);
			return stats;
		}
	}
	catch (e) {
		console.log('fStat:'+e.stack);
	}
	return false;
}

function fWrite(fpath, data, isAppend, isSync){
	var options = { flag : isAppend ? 'a+' : 'w+', encoding:'utf8', mode : 0777 };
	if(isSync) {
		try {
			fs.writeFileSync(fpath, data, options);
		}
		catch(e) {
			console.log('[NG]fwrite:' + fpath + ', e:' + e, 'error');
			return false;
		}
	}
	else {
		fs.writeFile(fpath, data, options, function(e){
		    if(e) {
				console.log('[NG]fwrite:' + fpath + ', e:' + e, 'error');
				throw e;
			}
		});
	}
	return true;
	//fs.chmodSync(fpath, 0777);
}

function fRead(fpath) {
	try {
		return fs.readFileSync(fpath);
	}
	catch(e) {
		console.log('[NG]fRead:' + fpath + ', e:' + e, 'error');
	}
	return false;
}

function fExist(fpath) {
	try {
		fs.statSync(fpath);
		return true;
	} catch(e) {
	}
	return false;
}
function fRemove(fpath) {
	try {
		fs.unlinkSync(fpath);
		return true;
	} catch(e) {
		console.log('[NG]fRemove:' + fpath + ', e:' + e, 'error');
	}
	return false;
}
function fRename(fpathfrom, fpathto) {
	try {
		fs.renameSync(fpathfrom, fpathto);
		return true;
	} catch(e) {
		console.log('[NG]fRename:' + fpathfrom + ', e:' + e, 'error');
	}
	return false;
}
function fList(fpath, isFile, isFolder) {
	if(fpath.substr(-1) != '/') {
		fpath += '/';
	}
	var ret = [];
	var files = fs.readdirSync(fpath);
	for (var i in files) {
		var name = fpath + files[i];
		var fstat = fs.statSync(name)
		if((isFile && fstat && fstat.isFile()) || (isFolder && fstat && fstat.isDirectory())){
			ret.push(files[i]);
		}
	}
	return ret;
}
function fSafeName(filename) {
	filename = filename.replace(/[:"'\\\/\*\?\|]/g, '_');
	return filename.trim();
}

function dCreate(dpath) {
	try {
		if(!fs.existsSync(dpath)) {
			fs.mkdirSync(dpath, 0777, function(err) {
				if(err){
					console.log(err);
					return false;
				}
			});
		}
		return true;
	} catch(err) {
		console.log('[NG]dCreate:' + dpath + ', e:' + err, 'error');
	}
	return false;
}

function dExist(dpath) {
	try {
		if(fs.existsSync(dpath)){
			return true;
		}
	} catch(err) {
	}
	return false;
}

var logconfig = {
	debug: true,
	folder:'./log/',
	filepre:'log-',
	fileext:'.log',
	filesize: 1024*1024,
	filecount: 5,
	console: true,
};
function logConfig(cfg) {
	for(var i in cfg) {
		logconfig[i] = cfg[i];
	}
}
var lastlog1 = '';
var lastlog2 = '';
var lastlog3 = '';
function log(msg, level, notFile, notConsole) {
	lastlog3 = lastlog2;
	lastlog2 = lastlog1;
	lastlog1 = msg;
	if(level === false) {
		if(logconfig.console !== false) {
			//only console
			console.log(getTimestamp() + ' ' + msg);
		}
		return;
	}
	if(!level) {
		level = 'debug';
	}
	var msg2 = getTimestamp() + '[' + level + '] ' + msg;
	if(!notConsole) {
		if(logconfig.console !== false) {
			console.log(msg2);
		}
	}
	if(notFile || logconfig[level] === false) {
		return;
	}
	msg2 += '\r\n';
	if(logconfig.ng == 1) {
		if(logconfig.console !== false) {
			console.log(logconfig.ngmsg);
			console.log(msg2);
		}
		return;
	}
	if(!logconfig.initfolder) {
		logconfig.initfolder = 1;
		if(!dExist(logconfig.folder)) {
			dCreate(logconfig.folder);
		}
		if(!dExist(logconfig.folder)) {
			logconfig.ng = 1;
			logconfig.ngmsg = 'create log folder error:'.logconfig.folder;
			console.log(logconfig.ngmsg);
			console.log(msg2);
			return;
		}
	}
	var sdate = dateFormat(false, 'yyyyMMdd');
	var fname = logconfig.folder + logconfig.filepre + sdate + '-' + level + logconfig.fileext;
	if(!logconfig._oldfname) {
		logconfig._oldfname = fname;
		logconfig._fd = fs.openSync(fname, 'a+');
	}
	if(logconfig._oldfname != fname) {
		fs.closeSync(logconfig._fd);
		logconfig._oldfname = fname;
		logconfig._fd = fs.openSync(fname, 'a+');
	}
	if(fSize(logconfig._fd) > logconfig.filesize) {
		fs.closeSync(logconfig._fd);
		for(var i = logconfig.filecount-1;i>=1;i--) {
			if(fExist(fname+'.'+i)) {
				fRename(fname+'.'+i, fname+'.'+(i+1));
			}
		}
		fRename(fname, fname+'.1');
		logconfig._fd = fs.openSync(fname, 'a+');
	}
	fWrite(fname, msg2, true, true);
	//fWrite(logconfig._fd, msg2, true, true);
}
function getLastLog() {
	var ret = lastlog3;
	if(ret != '') {
		ret += '<br>';
	}
	ret += lastlog2;
	if(ret != '') {
		ret += '<br>';
	}
	ret += lastlog1;
	return ret;
}

var g_s_cancel = '';
/*
//var g_retry_fun = null;
//var g_retry_start = new Date();
function retry_getweb2() {
	var retry_now = new Date();
	if(retry_now - g_retry_start > 1000 * 60 * 10 && g_retry_fun) {
		callback(g_retry_fun, 1000);
	}
	callback(retry_getweb2, 1000 * 60 * 3);
}
//callback(retry_getweb2, 1000 * 60 * 3);

	//包括第一次，一共执行的次数
	var opt = {trycount:2, timeout:1000*30};
	getweb2(cb, url, type, param, postbody, opt);

*/
function getweb2(cb, url, type, param, postbody, opt) {
	var binary = param && param.binary;
	var htmlend = param.htmlend;
	if(!url || url == '') {
		log('[NG] getweb2, no url:' + url);
		return;
	}
	if(g_s_cancel != 'running') {
		g_s_cancel = 'stopped';
		log('Canceled type:' + type + ', url:' + url);
		return;
	}

	var trycount = 6;
	if(opt && opt.trycount && opt.trycount > 0) {
		trycount = opt.trycount;
	}
	var fparam = {retrycnt:0, trycount:trycount, url:url, lenlast:-1, lencount:0};
	var fcallback = function(error, response, body) {
		//fWrite('./t1.txt', body);
		//console.log('callback url:'+url);
		if(!error) {
			if(!body || body == '') {
				error = 'no any body.';
			}
			else {
				var cType = response.headers['content-type'] || response.headers['Content-Type'] || '';
				if(cType.indexOf('image/') < 0 && !binary && body.search(/(<\/body>|<\/html>)/i) < 0) {
					if(!htmlend || htmlend == '' || body.indexOf(htmlend) < 0) {
						error = 'no </body> or </html>.';
					}
				}
			}
		}

		///*response.statusCode == 200 &&*/ 
		if(!error && body && body != '') {
		}
		else {
			if(body && fparam.lenlast == -1) {
				fparam.lenlast = body.length;
			}
			if(body && fparam.lenlast != body.length) {
				fparam.lenlast = body.length;
				fparam.lencount++;
			}
			log('getweb error:' + error + ', code:'+error.code+', url:' + url);
			if(error.code == 'HPE_INVALID_CONTENT_LENGTH') {
				//内容长度不对，重新取得
				callback(function(){
					log('get web retry:'+fparam.retrycnt+', url:'+url, 'debug', true);
					postAjax(fcallback, url, postbody, param, opt);
				}, 1000);
				return;
			}
			fparam.retrycnt++;
			if(fparam.retrycnt < fparam.trycount) {
				var stime = 2000;
				if((fparam.retrycnt+1) % 5 == 0) {
					stime = 5000;
				}
				callback(function(){
					log('get web retry:'+fparam.retrycnt+', url:'+url, 'debug', true);
					postAjax(fcallback, url, postbody, param, opt);
				}, stime);
				return;
			}
			/*
			else {
				if(fparam.lencount == 0 && fparam.lenlast > 0 && fparam.retrycnt > 1) {
					if(!param.binary && body) {
						body = body.replace(/\r\n/g, '\n');
						body = body.replace(/\r/g, '\n');
					}

					log('!!!get web no </html>, url:'+url, 'error');
					if(!body || typeof(body) != 'string') {
						body = '';
					}
					cb(body, url, type, param);
					return;
				}
				fparam.retrycnt = 0;
				callback(function(){
					log('get web retry over, error:'+fparam.retrycnt+', url:'+url, 'debug', true);
					postAjax(fcallback, url, postbody, param, opt);
				}, 1000 * 300);
			}
			return;
			*/
		}

		fparam.retrycnt = 0;
		if(!body) {
			body = '';
		}
		if(!param.binary && body) {
			if(typeof(body) != 'string') {
				body = '';
			}
			body = body.replace(/\r\n/g, '\n');
			body = body.replace(/\r/g, '\n');
		}
		cb(body, url, type, param);
	};
	log('get web:'+url, 'debug', true);
	postAjax(fcallback, url, postbody, param, opt);
}

function postAjax2(fcallback, url, postbody, fcallback_param, opt){
	//var urlinfo = getUrlInfo(url);
    //if (!urlinfo) {
    //		console.log('url error:' + url);
    //		return false;
    //}
	var headers = {
		'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.99 Safari/537.36',
		'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
		'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
		//'Connection': 'close',
		'Connection': 'Keep-Alive',
		'Proxy-Connection': 'close',
	};
	if(opt && opt.headers) {
		for(var i in opt.headers) {
			headers[i] = opt.headers[i];
		}
		//
		log('headers:'+JSON.stringify(headers),'debug',false, true);
	}
	var options = {
		url: url,
		encoding : null,
		method: 'GET',
		headers: headers,
		//rejectUnauthorized: true,
		followAllRedirects: true,
		gzip: false,
		timeout: 1000 * 60,
		//proxy: 'http://xxxxxxxxx.com:8080',
	};
	if(opt && opt.timeout) {
		options.timeout = opt.timeout;
	}
	
	if(opt && opt.proxy) {
		options.proxy = opt.proxy;
		console.log('proxy:'+ opt.proxy);
	}
	if(postbody && postbody != '') {
		options['form'] = postbody;
		options['method'] = 'POST';
	}
	if(opt && opt.proxyip && opt.proxyport && opt.proxytype) {
		if(opt.proxytype == 'socks4' || opt.proxytype == 'socks5') {
			var socksConfig = {
			  proxyHost: opt.proxyip,
			  proxyPort: opt.proxyport,
			  auths: [ socksv5.auth.None() ]
			};
			if((urlinfo.protocol == 'https://')) {
				options['agent'] = new socksv5.HttpsAgent(socksConfig);
			}
			else {
				options['agent'] = new socksv5.HttpAgent(socksConfig);
			}
		}
		else {
			options['proxy'] = 'http://' + opt.proxyip + ':' + opt.proxyport;
		}
	}

	//log('ajax url:' + url);
	var hTimeout = callback(function() {
		//log('hTimeout1:'+hTimeout+', url:' + url);
		if(hTimeout) {
			fcallback('timeout', false, '', fcallback_param);
		}
		hTimeout = false
	}, options.timeout + 333);
	try {
	if(opt && opt.options) {
		for(var i in opt.options) {
			options[i] = opt.options[i];
		}
		//console.log('headers:'+JSON.stringify(headers));
	}
	var requestObj = request(options, function(error, response, body) {
		if(!hTimeout) {
			return;
		}
		clearTimeout(hTimeout);
		hTimeout = false;
		if(response) response._orgbody = body;
		if(body && body != '') {
			var cs = '';
			var cType = response.headers['content-type'] || response.headers['Content-Type'] || '';
			if(cType.indexOf('image/') < 0 && (!fcallback_param || !fcallback_param.binary)) {
				if(cType != '') {
					var CHARTSET_RE = /(?:charset|encoding)\s*=\s*['"]? *([\w\-]+)/i;
					matchs = CHARTSET_RE.exec(cType);
					if(matchs) {
						cs = matchs[1].toLowerCase();
						//console.log('head charset:'+ cs);
					}
				}
				if(cs == '') {
					var bodyhead = body.toString('ascii', 0, 1024);
					var CHARTSET_RE = /<meta.*?(?:charset|encoding)\s*=\s*['"]? *([\w\-]+)/i;
					matchs = CHARTSET_RE.exec(bodyhead);
					if(matchs) {
						cs = matchs[1].toLowerCase();
						console.log('html charset:'+ cs);
					}
				}
			}
			if(cs == '' || cs === 'utf-8') {
				cs = 'utf8';
			}
			body =  iconv.decode(body, cs);
		}
		//log('hTimeout2:'+hTimeout+', url:' + url);
		if(!body || typeof(body) != 'string') {
			body = '';
		}
		fcallback(error, response, body, fcallback_param);
	}).on('redirect', function() {
        log('requestObj.response.headers["set-cookie"][0]:' + requestObj.response.headers['set-cookie'][0],'debug',false, true);
        log('requestObj.response.headers["set-cookie"][1]:' + requestObj.response.headers['set-cookie'][1],'debug',false, true);
        log('requestObj.getHeader("Cookie"):' + requestObj.getHeader('Cookie'),'debug',false, true);
        var cookie1s = requestObj.response.headers['set-cookie'][0].split(";");
        var cookie2s = requestObj.response.headers['set-cookie'][1].split(";");
        var cookie = cookie1s[0] + ';' + cookie2s[0];
        //var cookie = cookies[0] + '; sto-id=BFEADEAK; i18next=ja; _ga=GA1.3.1287865222.1509348142; _gid=GA1.3.1455045533.1509520396; _gat_UA-100843-1=1; _bdck=BD.2ViK6x.lZIaePI.3';
        requestObj.setHeader('Cookie',cookie);
        requestObj.setHeader('Cache-Control','max-age=0');
        g_save['cookie'] = cookie;
        
	}).on('error', function(err) {
		if(err.code != 'ECONNREFUSED' && err.code != 'ESOCKETTIMEDOUT' && err.code != 'EHOSTUNREACH' && err.code != 'ETIMEDOUT') {
			console.log(err);
		}
	})/*.on('socket', function(socket) { 
		socket.setTimeout(options.timeout, function () {
			//msg.abort();    // kill socket
			console.log('socket timeout');
		});
		socket.on('error', function (err) {
			console.log(err);
			//msg.abort();    // kill socket
		});
	})*/;
	} catch (err) {
		if(!hTimeout) {
			return;
		}
		clearTimeout(hTimeout);
		hTimeout = false;
		log('postAjax:' + err);
		error = err;
		//log('hTimeout3:'+hTimeout+', url:' + url);
		fcallback(error, false, '', fcallback_param);
	}
	if(opt && typeof(opt.ondata) == 'function') {
		requestObj.on('data', function(chunk) {
			opt.ondata(chunk, url, postbody, requestObj, fcallback_param);
		});
	}
	if(opt && typeof(opt.onend) == 'function') {
		requestObj.on('end', function() {
			opt.onend(url, postbody, requestObj, fcallback_param);
		});
	}
}


//url = 'http://' + username + ':' + password + '@some.server.com';
function postAjax(fcallback, url, postbody, fcallback_param, opt){
	
	var urlinfo = getUrlInfo(url);
    if (!urlinfo) {
    		console.log('url error:' + url);
    		return false;
    }
	var headers = {
		'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.99 Safari/537.36',
		'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
		'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
		'Connection': 'close',
		'Proxy-Connection': 'close',
	};
	if(opt && opt.headers) {
		for(var i in opt.headers) {
			headers[i] = opt.headers[i];
		}
		//
		log('headers:'+JSON.stringify(headers),'debug',false, true);
	}
	var options = {
		url: url,
		encoding : null,
		method: 'GET',
		headers: headers,
		//rejectUnauthorized: true,
		//followAllRedirects: true,
		gzip: false,
		timeout: 1000 * 60,
		//proxy: 'http://xxxx.xxxxx.com:8080',
	};
	if(opt && opt.timeout) {
		options.timeout = opt.timeout;
	}
	
	if(opt && opt.proxy) {
		options.proxy = opt.proxy;
		console.log('proxy:'+ opt.proxy);
	}
	if(postbody && postbody != '') {
		options['form'] = postbody;
		options['method'] = 'POST';
	}
	if(opt && opt.proxyip && opt.proxyport && opt.proxytype) {
		if(opt.proxytype == 'socks4' || opt.proxytype == 'socks5') {
			var socksConfig = {
			  proxyHost: opt.proxyip,
			  proxyPort: opt.proxyport,
			  auths: [ socksv5.auth.None() ]
			};
			if((urlinfo.protocol == 'https://')) {
				options['agent'] = new socksv5.HttpsAgent(socksConfig);
			}
			else {
				options['agent'] = new socksv5.HttpAgent(socksConfig);
			}
		}
		else {
			options['proxy'] = 'http://' + opt.proxyip + ':' + opt.proxyport;
		}
	}

	//log('ajax url:' + url);
	var hTimeout = callback(function() {
		//log('hTimeout1:'+hTimeout+', url:' + url);
		if(hTimeout) {
			fcallback('timeout', false, '', fcallback_param);
		}
		hTimeout = false
	}, options.timeout + 333);
	try {
	if(opt && opt.options) {
		for(var i in opt.options) {
			options[i] = opt.options[i];
		}
		//console.log('headers:'+JSON.stringify(headers));
	}
	var requestObj = request(options, function(error, response, body) {
		if(!hTimeout) {
			return;
		}
		clearTimeout(hTimeout);
		hTimeout = false;
		if(response) response._orgbody = body;
		if(body && body != '') {
			var cs = '';
			var cType = response.headers['content-type'] || response.headers['Content-Type'] || '';
			if(cType.indexOf('image/') < 0 && (!fcallback_param || !fcallback_param.binary)) {
				if(cType != '') {
					var CHARTSET_RE = /(?:charset|encoding)\s*=\s*['"]? *([\w\-]+)/i;
					matchs = CHARTSET_RE.exec(cType);
					if(matchs) {
						cs = matchs[1].toLowerCase();
						//console.log('head charset:'+ cs);
					}
				}
				if(cs == '') {
					var bodyhead = body.toString('ascii', 0, 1024);
					var CHARTSET_RE = /<meta.*?(?:charset|encoding)\s*=\s*['"]? *([\w\-]+)/i;
					matchs = CHARTSET_RE.exec(bodyhead);
					if(matchs) {
						cs = matchs[1].toLowerCase();
						console.log('html charset:'+ cs);
					}
				}
			}
			if(cs == '' || cs === 'utf-8') {
				cs = 'utf8';
			}
			body =  iconv.decode(body, cs);
		}
		//log('hTimeout2:'+hTimeout+', url:' + url);
		if(!body || typeof(body) != 'string') {
			body = '';
		}
		fcallback(error, response, body, fcallback_param);
	}).on('error', function(err) {
		if(err.code != 'ECONNREFUSED' && err.code != 'ESOCKETTIMEDOUT' && err.code != 'EHOSTUNREACH' && err.code != 'ETIMEDOUT') {
			console.log(err);
		}
	})/*.on('socket', function(socket) { 
		socket.setTimeout(options.timeout, function () {
			//msg.abort();    // kill socket
			console.log('socket timeout');
		});
		socket.on('error', function (err) {
			console.log(err);
			//msg.abort();    // kill socket
		});
	})*/;
	} catch (err) {
		if(!hTimeout) {
			return;
		}
		clearTimeout(hTimeout);
		hTimeout = false;
		log('postAjax:' + err);
		error = err;
		//log('hTimeout3:'+hTimeout+', url:' + url);
		fcallback(error, false, '', fcallback_param);
	}
	if(opt && typeof(opt.ondata) == 'function') {
		requestObj.on('data', function(chunk) {
			opt.ondata(chunk, url, postbody, requestObj, fcallback_param);
		});
	}
	if(opt && typeof(opt.onend) == 'function') {
		requestObj.on('end', function() {
			opt.onend(url, postbody, requestObj, fcallback_param);
		});
	}
}

var servermine = {
  "css": "text/css",
  "gif": "image/gif",
  "html": "text/html",
  "jspage": "text/html",
  "ico": "image/x-icon",
  "jpeg": "image/jpeg",
  "jpg": "image/jpeg",
  "js": "text/javascript",
  "json": "application/json",
  "pdf": "application/pdf",
  "png": "image/png",
  "svg": "image/svg+xml",
  "swf": "application/x-shockwave-flash",
  "tiff": "image/tiff",
  "txt": "text/plain",
  "wav": "audio/x-wav",
  "wma": "audio/x-ms-wma",
  "wmv": "video/x-ms-wmv",
  "xml": "text/xml"
};

function doSJP(request, response, cType, realPath, text) {
	var indLast = 0;
	var ind1 = text.indexOf("<?js", indLast);
	var ind2 = text.indexOf("?>", indLast);
	if(ind1 >= 0 && ind2 < 0) {
		ind2 = text.length;
	}
	if (ind1 >= 0 && ind2 > ind1) {
		var sb = '';
		while (ind1 >= 0 && ind2 > ind1) {
			var s1 = text.substring(indLast, ind1);
			var s2 = text.substring(ind1 + 4, ind2);
			s1 = s1.replace(/(\r\n|\r)/g, '\n').replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/'/g, '\\\'');
			sb += 'out.write(\'' + s1 + '\');';

			sb += s2;

			indLast = ind2 + 2;
			ind1 = text.indexOf("<?js", indLast);
			ind2 = text.indexOf("?>", indLast);
			if(ind1 >= 0 && ind2 < 0) {
				ind2 = text.length;
			}
		}
		if (indLast != text.length) {
			s1 = text.substring(indLast);
			s1 = s1.replace(/(\r\n|\r)/g, '\n').replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/'/g, '\\\'');
			sb += 'out.write(\'' + s1 + '\');';
		}

		//response.write(sb, "binary");
		//return true;

		var param = {};
		try {
			var out = function() {
				this.autoEnd = true;
				this.text = '';
				this.responseCode = 200;
				this.headers = {};
				this.first = true;
				this.write = function(text) {
					//console.log(text);
					this.text += text;
				};
				this.writeHead = function(responseCode, headers) {
					this.responseCode = responseCode;
					this.headers = headers;
				};
				this.setAutoEnd = function(autoEnd) {
					this.autoEnd = autoEnd;
				};
				this.end = function() {
					var hkeys = Object.keys(this.headers);
					if(hkeys.length == 0 || !'Content-Type' in hkeys) {
						console.log('response:' + cType);
						this.headers = {"Content-Type": cType + "; charset=UTF-8"};
					}
					response.writeHead(this.responseCode, this.headers);
					response.write(out.text, 'utf-8');
					response.end();
				};
				return this;
			}();
			//fWrite(realPath + '.cjs', sb, false, true);
			var result = new Function('out, request, response, param', sb);
			result(out, request, response, param);
			if(out.autoEnd) {
				out.end();
			}
		} catch (err) {
			console.log(err.stack);
			response.writeHead(503, {"Content-Type": "text/html; charset=UTF-8"});
			response.write(''+err);
			response.end();
		}
		return true;
	}
	response.write(text, "utf-8");
	response.end();
	return false;
}
function serverEchoFile(request, response, realPath, cType) {
	fs.stat(realPath, function (err, stats) {
		if (!stats || !stats.isFile()) {
			console.log('not found:' + realPath);
			serverEcho(response, 404, 'not found:' + realPath);
		}
		else {
			var ty = realPath.substr(-7) == '.jspage' ? 'utf-8' : 'binary';
			fs.readFile(realPath, ty, function (err, text) {
				if (err) {
					serverEcho(response, 500, err);
				} else {
					//response.writeHead(200, {"Content-Type": "text/plain; charset=UTF-8"});
					if(realPath.substr(-7) == '.jspage') {
						doSJP(request, response, cType, realPath, text);
					}
					else {
						response.writeHead(200, {
							'Content-Type': cType + '; charset=UTF-8'
						});
						response.write(text, ty);
						response.end();
					}
				}
			});
		}
	});
}

function serverEcho(response, code, body) {
	response.writeHead(code, {
		'Content-Type': 'text/plain'
	});
	response.write(body);
	response.end();
}



function proxySetver(HTTP_PORT, PROXY_URL) {
  'use strict';
  var http = require('http'), url = require('url'), net  = require('net');
  //var HTTP_PORT = process.argv[2] || 8080;  // internal proxy server port
  //var PROXY_URL = process.argv[3] || null;  // external proxy server URL
  var PROXY_HOST = PROXY_URL ?  url.parse(PROXY_URL).hostname    : null;
  var PROXY_PORT = PROXY_URL ? (url.parse(PROXY_URL).port || 80) : null;

  function printError(err, msg, url) {
    console.log('%s %s: %s', new Date().toLocaleTimeString(), msg, url, err);
  }

  var server = http.createServer(function onCliReq(cliReq, cliRes) {
    var cliSoc = cliReq.socket || cliReq.connection;
    var x = url.parse(cliReq.url);
    var svrReq = http.request({host: PROXY_HOST || x.hostname,
        port: PROXY_PORT || x.port || 80,
        path: PROXY_URL ? cliReq.url : x.path,
        method: cliReq.method, headers: cliReq.headers,
        agent: cliSoc.$agent}, function onSvrRes(svrRes) {
      cliRes.writeHead(svrRes.statusCode, svrRes.headers);
      svrRes.pipe(cliRes);
    });
    cliReq.pipe(svrReq);
    svrReq.on('error', function onSvrReqErr(err) {
      cliRes.writeHead(400, err.message, {'content-type': 'text/html'});
      cliRes.end('<h1>' + err.message + '<br/>' + cliReq.url + '</h1>');
      printError(err, 'svrReq', x.hostname + ':' + (x.port || 80));
    });
  }).listen(HTTP_PORT);

  server.on('clientError', function onCliErr(err, cliSoc) {
    cliSoc.end();
    printError(err, 'cliErr', '');
  });

  server.on('connect', function onCliConn(cliReq, cliSoc, cliHead) {
    var svrSoc, x = url.parse('https://' + cliReq.url);
    if (PROXY_URL) {
      var svrReq = http.request({host: PROXY_HOST, port: PROXY_PORT,
          path: cliReq.url, method: cliReq.method, headers: cliReq.headers,
          agent: cliSoc.$agent});
      svrReq.end();
      svrReq.on('connect', function onSvrConn(svrRes, svrSoc2, svrHead) {
        svrSoc = svrSoc2;
        cliSoc.write('HTTP/1.0 200 Connection established\r\n\r\n');
        if (cliHead && cliHead.length) svrSoc.write(cliHead);
        if (svrHead && svrHead.length) cliSoc.write(svrHead);
        svrSoc.pipe(cliSoc);
        cliSoc.pipe(svrSoc);
        svrSoc.on('error', funcOnSocErr(cliSoc, 'svrSoc', cliReq.url));
      });
      svrReq.on('error', funcOnSocErr(cliSoc, 'svrRq2', cliReq.url));
    }
    else {
      svrSoc = net.connect(x.port || 443, x.hostname, function onSvrConn() {
        cliSoc.write('HTTP/1.0 200 Connection established\r\n\r\n');
        if (cliHead && cliHead.length) svrSoc.write(cliHead);
        cliSoc.pipe(svrSoc);
      });
      svrSoc.pipe(cliSoc);
      svrSoc.on('error', funcOnSocErr(cliSoc, 'svrSoc', cliReq.url));
    }
    cliSoc.on('error', function onCliSocErr(err) {
      if (svrSoc) svrSoc.end();
      printError(err, 'cliSoc', cliReq.url);
    });
    function funcOnSocErr(soc, msg, url) {
      return err => (soc.end(), printError(err, msg, url));
    }
  });

  server.on('connection', function onConn(cliSoc) {
    cliSoc.$agent = new http.Agent({keepAlive: true});
    cliSoc.$agent.on('error', err => console.log('agent:', err));
  });

  console.log('http proxy server started on port ' + HTTP_PORT +
      (PROXY_URL ? ' -> ' + PROXY_HOST + ':' + PROXY_PORT : ''));
};

///////////////////////////////////////////////////////////
function getnumber(str) {
	str = '' + str;
	var ret = '';
	var okstr = '0123456789';
	for(var i = 0; i < str.length; i++) {
		var c = str.substring(i, i + 1);
		if(okstr.indexOf(c) >= 0) {
			ret += c;
		}
		else {
			if(ret != '' && ret.substr(-1) != ';') {
				ret += ';';
			}
		}
	}
	if(ret != '' && ret.substr(-1) == ';') {
		ret = ret.substring(0, ret.length - 1);
	}
	if(ret == '') {
		return [];
	}
	return ret.split(';');
}
function getnumberlast(str) {
	var arr = getnumber(str);
	if(arr && arr.length > 0) {
		return arr[arr.length-1];
	}
	return false;
}
function getbookid(sAuthor, sBookname) {
	var authorid = getpinyin(sAuthor);
	var booid = getpinyin(sBookname);
	if(authorid.length > 20) {
		authorid = authorid.substring(0, 20);
	}
	if(authorid != '') {
		authorid += '.';
	}
	authorid += booid;
	if(authorid.length > 45) {
		authorid = authorid.substring(0, 45);
	}
	return authorid;
}
function clearTitle(title) {
	//title = title.replace(/ /gi, '');
	title = title.replace(/&nbsp;/gi, ' ');
	title = title.replace(/&lt;/gi, '<');
	title = title.replace(/&gt;/gi, '>');
	title = title.replace(/&amp;/gi, '&');
	title = title.replace(/[\r\n]/g, '');
	title = title.replace(/<("[^"]*"|'[^']*'|[^'">])*>/g, '');
	//title = pinyin.jian(title);
	return pageinfo_cut(title);
}
function clearCont(sCont) {
	sCont = sCont.replace(/&nbsp;/gi, ' ');
	sCont = sCont.replace(/&lt;/gi, '<');
	sCont = sCont.replace(/&gt;/gi, '>');
	sCont = sCont.replace(/&amp;/gi, '&');
	sCont = sCont.replace(/(<br>|<br \/>)/gi, '\n');
	sCont = sCont.replace(/<("[^"]*"|'[^']*'|[^'">])*>/g, '');
	//sCont = pinyin.jian(sCont);
	return sCont;
}

function pageinfo_cut(txt) {
	if(!txt) {
		return txt;
	}
	txt = txt.substring(0, 500);
	txt = txt.replace(/(\r\n|\r|\n|\t|　|＊||＿)/g, '');
	while(txt.indexOf('??') >= 0) {
		txt = txt.replace('??', '?');
	}
	while(txt.indexOf('………') >= 0) {
		txt = txt.replace('………', '……');
	}
	while(txt.indexOf('**') >= 0) {
		txt = txt.replace('**', '*');
	}
	while(txt.indexOf('  ') >= 0) {
		txt = txt.replace('  ', ' ');
	}
	while(txt.indexOf('--') >= 0) {
		txt = txt.replace('--', '-');
	}
	while(txt.indexOf('__') >= 0) {
		txt = txt.replace('__', '_');
	}
	while(txt.indexOf('==') >= 0) {
		txt = txt.replace('==', '=');
	}
	txt = txt.substring(0, 200);
	var pos = txt.lastIndexOf('。');
	if(pos < 100) {
		pos = txt.lastIndexOf('.');
	}
	if(pos < 100) {
		pos = txt.lastIndexOf('，');
	}
	if(pos < 100) {
		pos = txt.lastIndexOf(',');
	}
	if(pos < 100) {
		pos = txt.lastIndexOf('”');
	}
	if(pos < 100) {
		pos = txt.lastIndexOf('！');
	}
	if(pos < 100) {
		pos = txt.lastIndexOf('？');
	}
	if(pos > 90) {
		txt = txt.substring(0, pos+1);
	}
	return txt;
}


/*
置换文章中特殊的文字

标题:
&amp;nbsp;&amp;nbsp;

�@�@

好看好玩尽在66.96.246.117/?fromuid=1813100
好看好玩尽在www.damuniu.com/?fromuid=270081
www.mzxzx.com/?fromuid=441279
www.hklhc66.com/bbs/?fromuid=645
    好看好玩尽在
    bbs.h5gal.net/?fromuid=718248
    70.36.100.200/?fromuid=1688045
    bbs.h5gal.net/?fromuid=718248
    www.omsuu.com/?fromuid=692711
http://64.120.178.247/?fromuid=1701594http://64.120.178.247/?fromuid=1701594
http://64.120.178.247/?fromuid=1701594

hentai8.us/u-harrypotterandp
di4se1.com
http://66.96.246.117/forum-viewthread-tid-961778-fromuid-1709330.html

WebHosting|FreeWebHosting|SchoolWebsites|TeacherWebsites|VChocolates|FileTransfer
Chocolates|Toffee|Caramels|Truffles|FTPApplet|Mortgages|HeavyEquipment|Fitness|Freeze-driedFood
GetYourFreeMoneyMakingKitToday!

　　——    ╒═══════════════════════════╕
　　│【小说】【免费外汇送5美金赚钱简单成就梦想】
　　├───────────────────────────┤
　　│全集小说下载:http://hi.baidu.com/seemarke
　　│免费开户送5美金http://www.15876353775.8.sunbo.net
　　├───────────────────────────┤——
　　附：【本作品来自互联网,本人不做任何负责】内容版权归作者所有

*/
function pageclearword_remove_one(sline, pos) {
	var okstr = '0123456789abcdefghijklmnopqrstuvwxyz.:/?-_+=&|';
	if(pos >= 0) {
		sline = ' ' + sline + ' ';
		pos++;
		var n1 = -1;
		var n2 = -1;
		for(var i = pos; i >= 0; i--) {
			//str.charCodeAt(i)
			var c = sline.substring(i, i + 1).toLowerCase();
			if(okstr.indexOf(c) < 0) {
				break;
			}
			n1 = i;
		}
		for(var i = pos; i < sline.length; i++) {
			var c = sline.substring(i, i + 1).toLowerCase();
			if(okstr.indexOf(c) < 0) {
				break;
			}
			n2 = i;
		}
		if(n1 > 0 && n2 > 0) {
			sline = sline.substring(0, n1).trim() + sline.substring(n2+1).trim();
		}
	}
	if(sline.length > 15) {
		var okstr0 = okstr + ' ';
		var hashz = false;
		for(var i = 0; i < sline.length; i++) {
			var c = sline.substring(i, i + 1).toLowerCase();
			if(okstr0.indexOf(c) < 0) {
				hashz = true;
				break;
			}
		}
		if(!hashz) {
			console.log(sline);
			//sline = '';
		}
	}
	return sline;
}
function pageclearword_remove(sline, removearr) {
	for(var i in removearr) {
		var pos = sline.indexOf(removearr[i]);
		if(pos >= 0) {
			sline = pageclearword_remove_one(sline, pos);
		}
	}
	return sline;
}
function pageclearword(txt, sremove, need2space) {
	if(!txt) {
		return txt;
	}
	txt = txt.replace(/�@�@/g, '');
	txt = txt.replace(/　/g, '');
	//txt = txt.replace(/好看好玩尽在/g, '');
	txt = txt.replace(/\r\n/g, '\n');
	txt = txt.replace(/\r/g, '\n');
	var txtarr = txt.split('\n');
	var txtok = '';
	for (var j = 0; j < txtarr.length; j++){
		var sline = txtarr[j].trim();
		sline = pageclearword_remove(sline, sremove).trim();
		if(sline != '') {
			if(need2space) {
				sline = '　　' + sline;
			}
			txtok += sline + '\r\n';
		}
	}

	return txtok;
}

/////////////////////////////////////////////

/*
■移動平均線
移動平均線には、以下のような種類があります。(例：5日間)
【例】1日目：100、2日目：200、3日目：300、4日目：400、5日目：500
【単純移動平均線（Simple MA）】日々の価格を平等に加重(1/5＝0.20)
5日間単純移動平均線（Simple MA）は、5日間の終値に1/5をかけて算出します。
＝(100+200+300+400+500)÷5日間＝100x1/5+200x1/5+300x1/5+400x1/5+500x1/5＝300円
【指数平滑平均線（Exponential MA）】直近の価格を最重視して加重2÷(5日+1)＝0.33
【加重移動平均線（Weighted MA）】直近の価格を重視し徐々に減らす(1・2・3・4・5)
＝（100x1+200x2+300x3+400x4+500x5）÷(1+2+3+4+5)＝366
【三角移動平均線(Triangle MA)】中央の価格を加重(1・2・3・2・1)
5日間三角移動平均線(Triangle MA)は、中央の日に大きなウェイト(整数)をかけて算出します。
＝（100x1+200x2+300x3+400x2+500x1）÷(1+2+3+2+1)＝300
【正弦加重移動平均線(Sine-Weighted MA)】中央の価格を加重
5日間正弦加重移動平均線(Sine-WeightedMA)は、中央の日に大きなウェイト(正弦の値)をかけて算出します。

var sma3 = simple_moving_averager(3);
var sma5 = simple_moving_averager(5);
var data = [1,2,3,4,5,5,4,3,2,1];
for (var i in data) {
    var n = data[i];
    // using WSH
    WScript.Echo("Next number = " + n + ", SMA_3 = " + sma3(n) + ", SMA_5 = " + sma5(n));
}
*/
//simple_moving_averager
//countAll:false for per second, true then add all
function SMA(period, type, countAll) {
	countAll=true;
    var nums = [];
	var last = false;
	var lastreal = false;
	var dir = 0;
	var lastSec = {};
	//加重移動平均線（Weighted MA）:wma, 指数平滑平均線（Exponential MA）:ema, sma
	if(!type) {
		type = 'sma';
	}
	var ret = function() {
	}
    ret.add = function(num, tNow) {
		if(!countAll) {
			if(!tNow) {
				tNow = new Date();
			}
			var tsec = Math.floor(tNow.getTime()/1000);
			if(tsec != lastSec.sec) {
				lastSec.min = num;
				lastSec.max = num;
				lastSec.sec = tsec;
			}
			if(tsec == lastSec.sec) {
				if(lastSec.min > num) {
					lastSec.min = num;
				}
				if(lastSec.max < num) {
					lastSec.max = num;
				}
				return (last===false?num:last);
			}
			lastSec.sec = tsec;
			var cur = false;
			if(lastSec.min >= num && lastSec.max >= num) {
				cur = lastSec.max;
			}
			else if(lastSec.min <= num && lastSec.max <= num) {
				cur = lastSec.min;
			}
			else {
				//不好判断小数点，不取平均值
				cur = num;
			}
			lastSec.min = cur;
			lastSec.max = cur;
			num = cur;
		}
        nums.push(num);
        if(nums.length > period) {
            nums.splice(0,1);  // remove the first element of the array
		}
        var len = nums.length;
		var last0 = 0;
		if(type == 'wma') {
			//＝（100x1+200x2+300x3+400x4+500x5）÷(1+2+3+4+5)＝366
			var sum = 0;
			for(var i = 0; i < nums.length; i++) {
				sum += nums[i] * (i+1);
			}
			last0 = sum / ((len*(len+1))/2);
		}
		else if(type == 'ema') {
			var sum = nums.reduce(function (prev, cur) {
				return (prev+cur);
			});
			last0 = (sum+num)/(len+1);
		}
		else {
			// reduce VS loop => reduce
			var sum = nums.reduce(function (prev, cur) {
				return (prev+cur);
			});
			last0 = (sum/len);
		}
		if(last !== false && lastreal != num) {
			if(last0 > last) {
				if(dir < 0) {
					dir = 0;
				}
				else {
					if(lastreal < num) {
						dir++;
					}
				}
			}
			else if(last0 < last) {
				if(dir > 0) {
					dir = 0;
				}
				else {
					if(lastreal > num) {
						dir--;
					}
				}
			}
		}
		last = last0;
		lastreal = num;
		//console.log('add:'+num+', last:'+last+', len:'+nums.length+'/'+period+', dir:'+dir);
		return last0;
    }
	ret.last = function() {
		return last;
	}
	ret.clear = function() {
		nums = [];
		last = '';
	}
	ret.period = function() {
		return period;
	}
	ret.dir = function() {
		return dir;
	}
	ret.len = function() {
		return nums.length;
	}
	ret.saveCfg = function() {
		return {period:period, dir:dir, nums:nums, lastreal:lastreal, last:last};
	}
	ret.loadCfg = function(cfg) {
		period = cfg.period;
		dir = cfg.dir;
		nums = cfg.nums;
		lastreal = cfg.lastreal;
		last = cfg.last;
	}
	return ret;
}
function MACD(period1, period2, pricespace0) {
	if(!period1 || !period2 || period1 >= period2) {
		throw new Error('error for period of MACD');
	}
	var pricespace = pricespace0;
	var dir = 0;
	var last = {};
	var ma1 = SMA(period1, 'wma');
	var ma2 = SMA(period2, 'wma');
	var ma2_b = SMA(Math.floor(period2*1.5), 'wma');
	var ma_dif = SMA(period1 + Math.floor((period2-period1)/2), 'wma');
	var ret = function() {
	}
    ret.add = function(num) {
		var ret1 = ma1.add(num);
		var ret2 = ma2.add(num);
		var ret2_b = ma2_b.add(num);
		var ret_dif = ma_dif.add(ret1-ret2);
		//var bar = 2*((ret1-ret2) - ret_dif);
		last = {ma1:ret1, ma2:ret2, ma2_b:ret2_b, dif:ret1-ret2, dem:ret_dif};
		return last;
	}
	ret.last = function() {
		return last;
	}
	ret.clear = function() {
		ma1.clear();
		ma2.clear();
		ma2_b.clear();
		ma_dif.clear();
	}
	ret.period = function() {
		return [ma1.period(), ma2.period()];
	}
	ret.dir = function() {
		if(last && ma1.dir() > 0 && ma2.dir() > 0 && ma2_b.dir() > 0) {
			dir = 1;
			if(last.ma1 > last.ma2 && last.ma2 > last.ma2_b) {
				dir++;
				if(pricespace && last.ma1 - last.ma2 > pricespace) {
					dir++;
				}
			}
		}
		else if(last && ma1.dir() < 0 && ma2.dir() < 0 && ma2_b.dir() < 0) {
			dir = -1;
			if(last.ma1 < last.ma2 && last.ma2 < last.ma2_b) {
				dir--;
				if(pricespace && last.ma2 - last.ma1 > pricespace) {
					dir--;
				}
			}
		}
		else {
			dir = 0;
		}
		return dir;
	}
	ret.ma1 = function() {
		return ma1;
	}
	ret.ma2 = function() {
		return ma2;
	}
	ret.ma2_b = function() {
		return ma2_b;
	}
	ret.ma_dif = function() {
		return ma_dif;
	}
	ret.saveCfg = function() {
		return {ma1:ma1.saveCfg(), ma2:ma2.saveCfg(), ma2_b:ma2_b.saveCfg(), ma_dif:ma_dif.saveCfg(), dir:dir, pricespace:pricespace, last:last};
	}
	ret.loadCfg = function(cfg) {
		ma1.loadCfg(cfg.ma1);
		ma2.loadCfg(cfg.ma2);
		ma2_b.loadCfg(cfg.ma2_b);
		ma_dif.loadCfg(cfg.ma_dif);
		dir = cfg.dir;
		pricespace = cfg.pricespace;
		last = cfg.last;
	}
	return ret;
}
