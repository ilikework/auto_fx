/**
 *  Normal Utility
 */
/**
 * retrieves a named value from cookie
 *
 * @param   string  name    name of the value to retrieve
 * @return  string  value   value for the given name from cookie
 */
function readcookie(name) {
  var c = document.cookie;
  var p0 = c.indexOf(name + "=");
  if (p0 != -1) {
    var p1 = c.indexOf(";", p0);
    if (p1 == -1) p1 = c.length;
    return unescape(c.substring(p0 + name.length + 1, p1));
  }
  return null;
}
function clearcookie(name, path, domain, secure) {
  document.cookie = name + "=;expires=Fri, 02-Jan-1970 00:00:00 GMT" +
    ( (path)    ? ";path=" + path : "") +
    ( (domain)  ? ";domain=" + domain : "") +
    ( (secure)  ? ";secure" : "");
}

/**
 * stores a named value into cookie
 *
 * @param   string  name    name of value
 * @param   string  value   value to be stored
 * @param   number  expiredays expire days
 * @param   string  path
 * @param   string  domain
 * @param   boolean secure
 */
function setcookie(name, value, expiredays, path, domain, secure) {
  var expires;
  if(typeof expiredays == "number") {
    expires = new Date((new Date()).getTime() + expiredays * 24 * 3600000);
  }
  else {
    expires = new Date((new Date()).getTime() + 365 * 24 * 3600000);
  }
  document.cookie = name + "=" + escape(value) +
    ( (expires) ? ";expires=" + expires.toGMTString() : "") +
    ( (path)    ? ";path=" + path : "") +
    ( (domain)  ? ";domain=" + domain : "") +
    ( (secure)  ? ";secure" : "");
}

/**
 * Format Date
 * Month(M),Day(d),12Hour(h),24Hour(H),Minute(m),Second(s),Week(E),ãGìx(q), can use as ? or ??
 * Year(y) can be yy or yyyy, Milliseconds(S) can only be S.
 * eg:
 * (new Date()).pattern("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423
 * (new Date()).pattern("yyyy-MM-dd E HH:mm:ss") ==> 2009-03-10 ìÒ 20:09:04
 * (new Date()).pattern("yyyy-MM-dd EE hh:mm:ss") ==> 2009-03-10 é¸ìÒ 08:09:04
 * (new Date()).pattern("yyyy-MM-dd EEE hh:mm:ss") ==> 2009-03-10 êØä˙ìÒ 08:09:04
 * (new Date()).pattern("yyyy-M-d h:m:s.S") ==> 2006-7-2 8:9:4.18
 */
Date.prototype.format = function(fmt) {
  var o = {
    "M+" : this.getMonth()+1, //Month
    "d+" : this.getDate(), //Day
    "h+" : this.getHours()%12 == 0 ? 12 : this.getHours()%12, //Hour
    "H+" : this.getHours(), //Hour
    "m+" : this.getMinutes(), //Minute
    "s+" : this.getSeconds(), //Second
    "q+" : Math.floor((this.getMonth()+3)/3), //ãGìx
    "S" : this.getMilliseconds() //Milliseconds
  };
  var week = {
    "0" : "\u65e5",
    "1" : "\u4e00",
    "2" : "\u4e8c",
    "3" : "\u4e09",
    "4" : "\u56db",
    "5" : "\u4e94",
    "6" : "\u516d"
  };
  if(/(y+)/.test(fmt)) {
    fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
  }
  if(/(E+)/.test(fmt)) {
    fmt=fmt.replace(RegExp.$1, ((RegExp.$1.length>1) ? (RegExp.$1.length>2 ? "\u661f\u671f" : "\u5468") : "")+week[this.getDay()+""]);
  }
  for(var k in o) {
    if(new RegExp("("+ k +")").test(fmt)) {
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
    }
  }
  return fmt;
}

function getToday(format, addD, addM, addY) {
  if(!format || format == '') {
    format = 'yyyy-MM-d';
  }
  var now = new Date();
  if(addD) {
    now.setDate(now.getDate()+addD);
  }
  if(addM) {
    now.setMonth(now.getMonth()+addM);
  }
  if(addY) {
    now.setYear(now.getYear()+addY);
  }
  return now.format(format);
}

function isAlpha(val) {
  var re = /^([a-zA-Z])+$/;
  return (re.test(val));
}
function isDigit(c) {
  return ((c >= "0") && (c <= "9"));
}
function IsNumeric(num) {
  return (num >=0 || num < 0);
}
function isInt(num) {
  var re = new RegExp("^[\d]+$");
  return (re.test(num));
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

function parentObjectFromTagname(o, tname) {
  while(o && o.parentNode && o.tagName != tname && o.tagName != 'BODY') {
    o = o.parentNode;
  }
  if(o && o.tagName == tname) {
    return o;
  }
  return null;
}

function stopEvent(e) {
  e = e || window.event;
  e.returnValue = false;
  e.cancelBubble = true;
  return false;
}
function stopEventLink(e) {
  e = e || window.event;
  e.cancelBubble = true;
  return true;
}

function byId(id, doc) {
  doc = doc || window.document;
  if (doc.getElementById) {
    return doc.getElementById(id);
  } else if (doc.all) {
    return doc.all.item(id);
  }
  return null;
}

function hasClass(o, n) {
  return (o.className.match(new RegExp('(\\s|^)'+n+'(\\s|$)')) != null);
}
function addClass(o, n) {
  if(!hasClass(o, n)) {
    o.className+=' '+n;
  }
}
function removeClass(o, n) {
  if(hasClass(o, n)) {
    o.className = o.className.replace(new RegExp('(\\s|^)'+n+'(\\s|$)'), ' ').trim();
  }
}

function setField(id, value, formobj, name, type) {
  if(!formobj) formobj = document.forms[0];
  if(formobj.elements[id]) {
    formobj.elements[id].value = value;
  }
  else{
    if(!name) name = id;
    if(!type) type = 'hidden';
    var input = formobj.ownerDocument.createElement('input');
    if (document.all) {
      input.id = id;
      input.type = type;
      input.name = name;
      input.value = value;
    } else {
      input.setAttribute('id', id);
      input.setAttribute('type', type);
      input.setAttribute('name', name);
      input.setAttribute('value', value);
    }
    formobj.appendChild(input);
  }
}
var base64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
function encode64(input) {
    input = escape(input);
    var output = "";
    var chr1, chr2, chr3 = "";
    var enc1, enc2, enc3, enc4 = "";
    var i = 0;
    
    do{
        chr1 = input.charCodeAt(i++);
        chr2 = input.charCodeAt(i++);
        chr3 = input.charCodeAt(i++);
        
        enc1 = chr1 >> 2;
        enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
        enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
        enc4 = chr3 & 63;
        
        if(isNaN(chr2)) {
            enc3 = enc4 = 64;
        }
        else if(isNaN(chr3)) {
            enc4 = 64;
        }
        
        output = output + base64.charAt(enc1) + base64.charAt(enc2) + base64.charAt(enc3) + base64.charAt(enc4);
        chr1 = chr2 = chr3 = "";
        enc1 = enc2 = enc3 = enc4 = "";
    }while (i < input.length);
    
    return output;
}
function decode64(input) {
    var output = "";
    var chr1, chr2, chr3 = "";
    var enc1, enc2, enc3, enc4 = "";
    var i = 0;
    
    var base64test = /[^A-Za-z0-9\+\/\=]/g;
    if(base64test.exec(input)) {
        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
    }
    
    do{
        enc1 = base64.indexOf(input.charAt(i++));
        enc2 = base64.indexOf(input.charAt(i++));
        enc3 = base64.indexOf(input.charAt(i++));
        enc4 = base64.indexOf(input.charAt(i++));
        
        chr1 = (enc1 << 2) | (enc2 >> 4);
        chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
        chr3 = ((enc3 & 3) << 6) | enc4;
        
        output = output + String.fromCharCode(chr1);
        
        if(enc3 != 64) {
            output = output + String.fromCharCode(chr2);
        }
        if(enc4 != 64) {
            output = output + String.fromCharCode(chr3);
        }
        
        chr1 = chr2 = chr3 = "";
        enc1 = enc2 = enc3 = enc4 = "";
    }while (i < input.length);
    
    return unescape(output);
};
function _pathencode(str) {
	return encode64(str).replace(/[/]/g, '-');
}
function _pathdecode(str) {
	return decode64(str.replace(/[-]/g, '/'));
}

//pic viewer
function img_change(obj, imgid, allowext, msg) {
	if(!allowext || allowext == '') {
		allowext = '.png;.jpg;';
	}
	var fn = obj.value;
	var ext = fn.toLowerCase().substring(fn.length - 4);
	if(allowext.indexOf(ext+';') < 0) {
		if(msg) alert(msg);
		else alert("Upload "+allowext+" file only.");
		return false;
	}
	var objUrl = getObjectURL(obj.files[0]);
	if (objUrl) {
		byId(imgid).src = objUrl;
	}
}

//pic file url
function getObjectURL(file) {
	var url = null ; 
	if (window.createObjectURL!=undefined) { // basic
		url = window.createObjectURL(file) ;
	} else if (window.URL!=undefined) { // mozilla(firefox)
		url = window.URL.createObjectURL(file) ;
	} else if (window.webkitURL!=undefined) { // webkit or chrome
		url = window.webkitURL.createObjectURL(file) ;
	}
	return url ;
}

// Get XML document
function getXMLDoc(str) {
  var i = document.implementation;
  if (!i || !i.createDocument) {
    // Try IE objects
    var xdoc = null;
    try {
      xdoc = new ActiveXObject('MSXML2.DOMDocument');
    } catch (ex) {
      try {
        xdoc = new ActiveXObject('Microsoft.XmlDom');
      } catch (ex) {}
    }
    if(xdoc) xdoc.loadXML(str);
    return xdoc;
  }
  //firefox
  var domparser = new DOMParser();
  try {
    var xdoc = domparser.parseFromString(str, 'text/xml');
    return xdoc;
  } catch (ex) {}
  return null;
}

// Returns XmlHttpRequest or null
function getXMLHttp() {
  if(window.XMLHttpRequest) return new XMLHttpRequest();
  if(window.ActiveXObject) {
    if(window._XmlHttpActiveX) return new ActiveXObject(window._XmlHttpActiveX);
    var o = ["Msxml2.XMLHTTP.6.0", "Msxml2.XMLHTTP.3.0", "Msxml3.XMLHTTP", "Msxml2.XMLHTTP", "Microsoft.XMLHTTP"];
    for(var i=0;i<o.length;i++) {
      try {
         var Req = new ActiveXObject(o[i]);
         window._XmlHttpActiveX = o[i];
         return Req;
      }
      catch(e){}
    }
  }
  return null;
}

//while xml:var items = xmlDoc.childNodes[1];items.childNodes.length;
//get string from xml:var s = objxml.xml || new XMLSerializer().serializeToString(objxml);
//noEncodeURI for php use of file_get_contents("php://input");
function postAjax(callback_fun, url, body, noEncodeURI, noPost, oxmlhttp) {
  var xmlhttp = oxmlhttp;
  if(!xmlhttp) {
    xmlhttp = getXMLHttp();
  }
  if(!noPost && !body) {
    xmlhttp.open('GET', encodeURI(url), true);
  }
  else {
    xmlhttp.open('POST', encodeURI(url), true);
  }
  xmlhttp.setRequestHeader('Content-Type' , 'application/x-www-form-urlencoded');

  xmlhttp.setRequestHeader('Pragma', 'no-cache');
  xmlhttp.setRequestHeader('Cache-Control', 'no-cache');
  xmlhttp.setRequestHeader('If-Modified-Since', 'Thu, 01 Jun 1970 00:00:00 GMT');

  if(callback_fun) {
    xmlhttp.onreadystatechange = function()
    {
      if (xmlhttp.readyState == 4) {
        if (xmlhttp.status == 200) {
          var s = xmlhttp.responseText;
          //s = s.replace(/<\?[^?]+\?>|<!DOCTYPE[^>]+>/g, '');
          //s = s.replace(/ ?\/>/g, ' />');
          //var objxml = getXMLDoc(s); //will error:óvëfÇ™å©Ç¬Ç©ÇËÇ‹ÇπÇÒÅB
          var objxml = xmlhttp.responseXML;
          if(!objxml) {
            objxml = getXMLDoc(s);
          }
          callback_fun(s, objxml);
        }
        else if (xmlhttp.status == 404) {
          callback_fun(url + '\n404 Not Found', null);
        }
        xmlhttp = null;
      }
      return false;
    };
  }
  if(typeof body === 'object') {
    var b1 = '';
    for(key in body) {
        if(body[key] !== undefined) {
          b1 += key + '=' + encodeURI(body[key])+'&';
        }
    }
    body = b1;
  }
  if(!body) body = null;
  //encodeURIComponent
  if(!noEncodeURI && body) body = encodeURI(body);
  xmlhttp.send(body);
  return true;
}

function getXmlText(objxml, key) {
  var karr0 = key.split('/');
  var karr = new Array();
  for(var i in karr0) {
    if(karr0[i] != '') {
      karr[karr.length] = karr0[i];
    }
  }
  var o = objxml;
  try {
    for(var i = 0; i < karr.length; i++) {
      var n = o.getElementsByTagName(karr[i]);
      if(!n || n.length < 1) break;
      if(i == karr.length - 1) {
        if(typeof(n[0].textContent) != 'undefined')
          return n[0].textContent;
        else
          return n[0].childNodes[0].nodeValue;
      }
      o = n[0];
    }
  }
  catch(e) {
  }
  return null;
}
function getXmlAttribute(objxml, key, attribName) {
  var karr0 = key.split('/');
  var karr = new Array();
  for(var i in karr0) {
    if(karr0[i] != '') {
      karr[karr.length] = karr0[i];
    }
  }
  var o = objxml;
  try {
    for(var i = 0; i < karr.length; i++) {
      var n = o.getElementsByTagName(karr[i]);
      if(!n || n.length < 1) break;
      if(i == karr.length - 1) {
        return n[0].childNodes[0].getAttribute(attribName);
      }
      o = n[0];
    }
  }
  catch(e) {
  }
  return null;
}
function getXmlTextArray(objxml, key) {
  var karr0 = key.split('/');
  var karr = new Array();
  for(var i in karr0) {
    if(karr0[i] != '') {
      karr[karr.length] = karr0[i];
    }
  }
  var o = objxml;
  try {
    for(var i = 0; i < karr.length; i++) {
      var n = o.getElementsByTagName(karr[i]);
      if(!n || n.length < 1) break;
      if(i == karr.length - 1) {
        var ret = new Array();
        for(var i = 0; i < n.length; i++) {
          if(typeof(n[i].textContent) != 'undefined')
            ret[ret.length] = n[i].textContent;
          else
            ret[ret.length] = n[i].childNodes[0].nodeValue;
        }
        return ret;
      }
      o = n[0];
    }
  }
  catch(e) {
  }
  return null;
}
function getXmlAttributeArray(objxml, key, attribName) {
  var karr0 = key.split('/');
  var karr = new Array();
  for(var i in karr0) {
    if(karr0[i] != '') {
      karr[karr.length] = karr0[i];
    }
  }
  var o = objxml;
  try {
    for(var i = 0; i < karr.length; i++) {
      var n = o.getElementsByTagName(karr[i]);
      if(!n || n.length < 1) break;
      if(i == karr.length - 1) {
        var ret = new Array();
        for(var i = 0; i < n.length; i++) {
          ret[ret.length] = n[i].childNodes[0].getAttribute(attribName);
        }
        return ret;
      }
      o = n[0];
    }
  }
  catch(e) {
  }
  return null;
}

/* ruleName like:'.className', '#idName' */
function getCSSRule(ruleName) {
   ruleName=ruleName.toLowerCase();
   if (document.styleSheets) {
      for (var i=0; i<document.styleSheets.length; i++) {
         var styleSheet=document.styleSheets[i];
         var ii=0;
         var cssRule=false;
         do {
            if (styleSheet.cssRules) {
               cssRule = styleSheet.cssRules[ii];
            }
            else {
               cssRule = styleSheet.rules[ii];
            }
            if (cssRule && cssRule.selectorText.toLowerCase()==ruleName) {
               return cssRule;
            }
            ii++;
         } while (cssRule)
      }
   }
   return false;
}
function getCSSText(ruleName) {
  var css = getCSSRule(ruleName);
  return (css && css.style ? css.style.cssText : '');
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

//wrap word for firefox
function jswordwrap(elem) {
  if(navigator.userAgent.search("Firefox") < 0) {
    return;
  }
  var txt = elem.innerHTML;
  if(txt == '') {
    return;
  }
  elem.innerHTML = txt.split('').join('<wbr>');
}

function checkLength(str, maxlength) {
	return (!str || str.length <= maxlength);
}

function isDateYMD(year, month, day) {
	month = month - 1;
	try {
		var tempDate = new Date(year, month, day);
		if ( (year == tempDate.getFullYear()) && (month == tempDate.getMonth()) && (day == tempDate.getDate()) ) {
			return true;
		}
		else {
			return false;
		}
	}
	catch(e) {
	}
	return false;
}

/**
 * null for error
 */
function getDateFromYMD(year, month, day) {
	month = month - 1;
	try {
		var tempDate = new Date(year, month, day);
		if ( (year == tempDate.getFullYear()) && (month == tempDate.getMonth()) && (day == tempDate.getDate()) ) {
			return tempDate;
		}
		else {
			return null;
		}
	}
	catch(e) {
	}
	return null;
}

/**
 * Date for yyyy/mm/dd or mm-dd-yyyy or yyyy.mm.dd or yyyymmdd
 */
function isDate(str) {
	if (isEmpty(str))
		return false;

	if(str.length == 8) {
		return isDateYMD(str.substr(0,4), str.substr(4,2), str.substr(6,2));
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
				return isDateYMD(arr[0], arr[1], arr[2]);
			}
			if(arr[2].length == 4) {
				return isDateYMD(arr[2], arr[0], arr[1]);
			}
		}
	}
	return false;
}

/**
 * Date for yyyy/mm/dd or mm-dd-yyyy or yyyy.mm.dd or yyyymmdd
 * null for error
 */
function getDateFromString(str) {
	if (isEmpty(str))
		return null;
	
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
			return null;
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
	return null;
}

/**
 * Date with format YYYYMM
 */
function isYYYYMM(str) {
	if(str.length == 6) {
		return isDateYMD(str.substr(0,4), str.substr(4,2), 1);
	}
	return false;
}

/**
 * encode URL
 */
function encodeUrl(str) {
	var urlStr = '';
	var chr;
	var uni;

	for(var i = 0; i < str.length; i++) {
		chr = str.charAt(i);
		uni = str.charCodeAt(i);

		if(chr == ' ') {
			urlStr += '+';
		}
		else if(uni == 0x2a || uni == 0x2d || uni == 0x2e || uni == 0x5f || 
			((uni >= 0x30) && (uni <= 0x39)) || 
			((uni >= 0x41) && (uni <= 0x5a)) || 
			((uni >= 0x61) && (uni <= 0x7a))) {
			urlStr = urlStr + chr;
		}
		else if((uni >= 0x0) && (uni <= 0x7f)) {
			var tmp = '0' + uni.toString(16);
			urlStr += '%'+ tmp.substr(tmp.length - 2);
		}
		else if(uni > 0x1fffff) {
			urlStr += '%' + (oxf0 + ((uni & 0x1c0000) >> 18)).toString(16);
			urlStr += '%' + (0x80 + ((uni & 0x3f000) >> 12)).toString(16);
			urlStr += '%' + (0x80 + ((uni & 0xfc0) >> 6)).toString(16);
			urlStr += '%' + (0x80 + (uni & 0x3f)).toString(16);
		}
		else if(uni > 0x7ff) {
			urlStr += '%' + (0xe0 + ((uni & 0xf000) >> 12)).toString(16);
			urlStr += '%' + (0x80 + ((uni & 0xfc0) >> 6)).toString(16);
			urlStr += '%' + (0x80 + (uni & 0x3f)).toString(16);
		}
		else {
			urlStr += '%' + (0xc0 + ((uni & 0x7c0) >> 6)).toString(16);
			urlStr += '%' + (0x80 + (uni & 0x3f)).toString(16);
		}
	}
	return urlStr;
}

function splitUrl(urlStr) {
	var ind = urlStr.indexOf('?');
	if(ind >= 0) {
		urlStr = urlStr.substring(ind + 1, urlStr.length);
	}

	var ret = new Array();
	var paramsary = urlStr.split('&');
	for(i=0; i<paramsary.length; i++) {
		ind = paramsary[i].indexOf('=');
		if(ind == 0) {
		}
		else if(ind > 0) {
			var key = paramsary[i].substring(0, ind);
			ret[key] = paramsary[i].substring(ind + 1, paramsary[i].length);
		}
		else if(paramsary[i].length > 0) {
			ret[paramsary[i]] = '';
		}
	}
	return ret;
}

function getWindowWH() {
  var myWidth = 0, myHeight = 0;
  if( typeof( window.innerWidth ) == 'number' ) {
    //Non-IE
    myWidth = window.innerWidth;
    myHeight = window.innerHeight;
  } else if( document.documentElement && ( document.documentElement.clientWidth || document.documentElement.clientHeight ) ) {
    //IE 6+ in 'standards compliant mode'
    myWidth = document.documentElement.clientWidth;
    myHeight = document.documentElement.clientHeight;
  } else if( document.body && ( document.body.clientWidth || document.body.clientHeight ) ) {
    //IE 4 compatible
    myWidth = document.body.clientWidth;
    myHeight = document.body.clientHeight;
  }
  return [ myWidth, myHeight ];
}

function getScrollXY() {
  var scrOfX = 0, scrOfY = 0;
  if( typeof( window.pageYOffset ) == 'number' ) {
    //Netscape compliant
    scrOfY = window.pageYOffset;
    scrOfX = window.pageXOffset;
  } else if( document.body && ( document.body.scrollLeft || document.body.scrollTop ) ) {
    //DOM compliant
    scrOfY = document.body.scrollTop;
    scrOfX = document.body.scrollLeft;
  } else if( document.documentElement && ( document.documentElement.scrollLeft || document.documentElement.scrollTop ) ) {
    //IE6 standards compliant mode
    scrOfY = document.documentElement.scrollTop;
    scrOfX = document.documentElement.scrollLeft;
  }
  return [ scrOfX, scrOfY ];
}

/*
for pop menu
*/
var _g_listmenupop = new Array();
var _g_menupoptimer = null;
var _g_menupoptimershow = null;
var _g_menupoptimerhideall = null;
function menupop_show(id, isVertical, l, t, level) {
  if(_g_menupoptimer) _g_menupoptimer = clearTimeout(_g_menupoptimer);
  if(_g_menupoptimershow) _g_menupoptimershow = clearTimeout(_g_menupoptimershow);
  menupop_hide(id, level);
  var xpsm = document.getElementById(id);
  if(!xpsm) return;

  xpsm.style.display = '';
  xpsm.style.zIndex = 10 + level;
  xpsm.style.visibility = 'visible';
  xpsm.style.left = l+'px';
  xpsm.st_menuflag = '1';
  xpsm.style.top  = t+'px';
  if(!_g_listmenupop) _g_listmenupop = new Array();
  _g_listmenupop[id] = xpsm;
  _g_listmenupop[id].level = level;
  _g_listmenupop[id].id = id;
  if(isIE6 && !xpsm._i_frm && navigator.userAgent.indexOf('MSIE') >= 0) {
    var iframe = document.createElement('<IFRAME id="' + id + '_i_frm" scrolling="no" frameborder="0" src="about:blank" style="position:absolute;padding:1px;top:-2px;left:-2px;z-index:-3;">');
    xpsm.appendChild(iframe);
    iframe.style.width = (xpsm.clientWidth+4) + 'px';
    iframe.style.height = (xpsm.clientHeight+4) + 'px';
    xpsm._i_frm = iframe;
    var o = document.getElementById(id+'_i_frm');
    var fd = o.contentWindow.document;
    fd.open();
    var css = getCSSText('.ie6_popmenuifrm');
    if(css == '') {
      css = 'background-color:#fff;border:1px solid #888;';
    }
    fd.write('<html><head></head><body style="'+css+'"></body></html>');
    fd.close();
  }
}
function menupop_hide(id, level) {
  for(var i in _g_listmenupop) {
    obj = _g_listmenupop[i];
    if(obj && (level < 0 || (obj.id != id && obj.level >= level))) {
      obj.st_menuflag = '1';
      obj.style.display = 'none';
      //obj.style.visibility = 'hidden';
      obj.style.visibility = '';
      //if(obj._i_frm) {
      //  obj._i_frm.style.display = 'none';
      //  obj._i_frm.style.visibility = '';
      //}
      _g_listmenupop[i] = null;
    }
  }
  if (_g_menupoptimer) clearTimeout(_g_menupoptimer);
  //cannot need next
  //if(_g_menupoptimerhideall) _g_menupoptimerhideall = clearTimeout(_g_menupoptimerhideall);
}
function menupop_mover() {
  if (_g_menupoptimer) _g_menupoptimer = clearTimeout(_g_menupoptimer);
  if(_g_menupoptimerhideall) _g_menupoptimerhideall = clearTimeout(_g_menupoptimerhideall);
}
function menupop_pos(o) {
  return calPos(o);
}

function calPos(elem)
{
  var html = document.documentElement;
  var body = document.body;
  var scrollLeft = (body.scrollLeft || html.scrollLeft);
  var scrollTop  = (body.scrollTop || html.scrollTop);

  var rect = elem.getBoundingClientRect();

  var left = rect.left - html.clientLeft + scrollLeft;
  var top  = rect.top - html.clientTop + scrollTop;
  return [left, top];
}

/*
function calPosXX(o) {
  var l=0, t=0;
  while (o)
  {
    l += o.offsetLeft;
    t += o.offsetTop;
    if(o.style.position=='absolute') {
      break;
    }
    o = o.offsetParent;
  }
  return [l, t];
}
*/

function calPos2(e) {
  e = e || window.event;
  if (e.pageX || e.pageY) {
    return [e.pageX, e.pageY];
  }
  return [ e.clientX + (document.documentElement.scrollLeft || document.body.scrollLeft)
     - document.documentElement.clientLeft,
    e.clientY + (document.documentElement.scrollTop || document.body.scrollTop)
     - document.documentElement.clientTop];
}

//for mouseover
function switchImg(obj, onimg) {
  if(obj && !obj.onmouseout) {
    var s = obj.src;
    obj.onmouseout = function(){this.src=s;};
  }
  obj.src = onimg;
}

//for mouseover
function switchClass(obj, isVertical, level) {
  var id = obj.id;
  if(!obj.onmouseout) {
    obj.onmouseout = function() {
      this.className = this.className.replace(/(m_nor_mon)/g, 'm_nor_mof').replace(/(m_sel_mon)/g, 'm_sel_mof');
      if(_g_menupoptimerhideall) _g_menupoptimerhideall = clearTimeout(_g_menupoptimerhideall);
      _g_menupoptimerhideall = setTimeout("menupop_hide(-1, -1)", 400);

      pobj = this;
      while(pobj.getAttribute('_pid') || pobj.parentNode.getAttribute('_pid') || pobj.parentNode.parentNode.getAttribute('_pid')) {
        pid = pobj.getAttribute('_pid');
        if(!pid) pid = pobj.parentNode.getAttribute('_pid');
        if(!pid) pid = pobj.parentNode.parentNode.getAttribute('_pid');
        pobj = byId(pid);
        if(pobj && pobj.className) {
          pobj.className = pobj.className.replace(/(m_nor_mon)/g, 'm_nor_mof').replace(/(m_sel_mon)/g, 'm_sel_mof');
        }
      }

      if(_g_menupoptimer) _g_menupoptimer = clearTimeout(_g_menupoptimer);
      if(_g_menupoptimershow) _g_menupoptimershow = clearTimeout(_g_menupoptimershow);
    };
  }
  obj.className = obj.className.replace(/(m_nor_mof)/g, 'm_nor_mon').replace(/(m_sel_mof)/g, 'm_sel_mon');

  pobj = obj;
  while(pobj.getAttribute('_pid') || pobj.parentNode.getAttribute('_pid') || pobj.parentNode.parentNode.getAttribute('_pid')) {
    pid = pobj.getAttribute('_pid');
    if(!pid) pid = pobj.parentNode.getAttribute('_pid');
    if(!pid) pid = pobj.parentNode.parentNode.getAttribute('_pid');
    pobj = byId(pid);
    if(pobj && pobj.className) {
      pobj.className = pobj.className.replace(/(m_nor_mof)/g, 'm_nor_mon').replace(/(m_sel_mof)/g, 'm_sel_mon');
    }
  }

  if(_g_menupoptimer) _g_menupoptimer = clearTimeout(_g_menupoptimer);
  if(_g_menupoptimershow) _g_menupoptimershow = clearTimeout(_g_menupoptimershow);

  menupop_hide(id+'sub', level);
  var xpsm = document.getElementById(id+'sub');
  if(!xpsm) {
    //no sub menu
    menupop_mover();
    return;
  }
  if(!obj.onclick) {
    obj.onclick = function(){switchClass(obj, isVertical, level);};
  }

  var l;
  var t;
  var pos = menupop_pos(obj);
  var sxy = getScrollXY();
  var wwh = getWindowWH();
  var ww = xpsm.offsetWidth;
  var hh = xpsm.offsetHeight;
  var scrollw = (document.body.style.overflowY == 'hidden' ? 0 : 20);
  var scrollh = (document.body.style.overflowX == 'hidden' ? 0 : 20);
  if(xpsm.style.display == 'none') {
    xpsm.style.display = '';
    ww = xpsm.offsetWidth;
    hh = xpsm.offsetHeight;
    xpsm.style.display = 'none';
  }
  if(isVertical) {
    //line menu
    l = pos[0];
    t = pos[1] + obj.offsetHeight - 2;
    if(l + ww - sxy[0] > wwh[0] - scrollw) {
      l = wwh[0] + sxy[0] - ww - scrollw - 2;
    }
    else {
      if(l < sxy[0] + 2) {
        l = sxy[0] + 2;
      }
    }
    if(t + hh - sxy[1] > wwh[1] - scrollh) {
      if(pos[1] -  sxy[1] > hh + 2 ) {
        t = pos[1] - hh + 2 +  sxy[1];
      }
      else {
        t = wwh[1] - scrollh + sxy[1] - hh;
      }
    }
  }
  else {
    //list menu
    l = pos[0] + obj.offsetWidth;
    t = pos[1] - 2;
    if(l + ww - sxy[0] > wwh[0] - scrollw) {
      if(pos[0] - sxy[0] > ww) {
        l = pos[0] - ww;
      }
      else {
        l = wwh[0] - scrollw + sxy[0] - ww;
      }
    }
    else {
      if(l < sxy[0] + 2) {
        l = sxy[0] + 2;
      }
    }
    if(t + hh - sxy[1] > wwh[1] - scrollh) {
      if(pos[1] -  sxy[1] > hh + 2 ) {
        t = pos[1] - hh + 2 +  sxy[1];
      }
      else {
        t = wwh[1] - scrollh + sxy[1] - hh;
      }
    }
  }
  _g_menupoptimershow = setTimeout("menupop_show('"+id+"sub', '"+isVertical+"', '"+l+"', '"+t+"', '"+level+"')", 200);
  menupop_mover();
}

//menupanel mouseover
function overPanel(obj) {
  if(!obj.onmouseout) {
    obj.onmouseout = function() {
      if(_g_menupoptimerhideall) _g_menupoptimerhideall = clearTimeout(_g_menupoptimerhideall);
      _g_menupoptimerhideall = setTimeout("menupop_hide(-1, -1)", 400);
    };
  }

  if(_g_menupoptimer) _g_menupoptimer = clearTimeout(_g_menupoptimer);
  if(_g_menupoptimershow) _g_menupoptimershow = clearTimeout(_g_menupoptimershow);
  menupop_mover();
}

function switchTreeClass(obj) {
  if(!obj.onmouseout) {
    obj.onmouseout = function() {
      obj.className = obj.className.replace(/(m_nor_mon)/g, 'm_nor_mof').replace(/(m_sel_mon)/g, 'm_sel_mof');
    };
  }
  obj.className = obj.className.replace(/(m_nor_mof)/g, 'm_nor_mon').replace(/(m_sel_mof)/g, 'm_sel_mon');
}

function switchTree(obj) {
  var id = obj.id;
  var objc = obj.nextSibling;
  if(objc && objc.tagName != 'TR') {
    objc = objc.nextSibling;
  }
  if(objc.id != id+'sub') {
    objc = byId(id+'sub');
  }
  if(objc.style.display == '') {
    objc.style.display = 'none';
    obj.className = obj.className.replace(/(_opend)/g, '_closed');

    //has sub selected
    var els = objc.getElementsByTagName('tr');
    for(i = 0; i < els.length; ++i){
      var obj2 = els[i];
      if(obj2 && obj2.className && obj2.className.indexOf('m_sel_mof') != -1) {
        obj.className = obj.className.replace(/(m_nor_mon)/g, 'm_sel_mon').replace(/(m_nor_mof)/g, 'm_sel_mof');
        break;
      }
    }

    //setcookie(id+'_p_t', '0', 24*365, AP_URL_ROOT);
    setcookie(id+'_p_t', '0', 24*365, '/');
    //setcookie(id+'_p_t', '0', 24*365, false);
  }
  else{
    objc.style.display = '';
    obj.className = obj.className.replace(/(_closed)/g, '_opend');
    obj.className = obj.className.replace(/(m_sel_mon)/g, 'm_nor_mon').replace(/(m_sel_mof)/g, 'm_nor_mof');
    //setcookie(id+'_p_t', '1', 24*365, AP_URL_ROOT);
    setcookie(id+'_p_t', '1', 24*365, '/');
    //setcookie(id+'_p_t', '1', 24*365, false);
  }
}

//for menu
function switchPanel(obj, id, idorg, cid) {
  var o = byId(id);
  var o2 = byId(id+'2');
  var o3 = byId(id+'3');
  if(o.style.display == '') {
    ot = obj;
    while(ot && ot.parentNode && ot.tagName != 'TABLE') {
      ot = ot.parentNode;
    }
    ot.style.width = ot.clientWidth+'px';
    o.style.display = 'none';
    if(o2) o2.style.display = 'none';
    if(o3) o3.style.display = 'none';
    obj.className = obj.className.replace(/(expand_up)/g, 'expand_down');
    //removeClass(obj, 'expand_up');
    //addClass(obj, 'expand_down');
  }
  else{
    o.style.display = '';
    if(o2) o2.style.display = '';
    if(o3) o3.style.display = '';
    obj.className = obj.className.replace(/(expand_down)/g, 'expand_up');
    //removeClass(obj, 'expand_down');
    //addClass(obj, 'expand_up');
  }
  setcookie(cid, o.style.display, 24*365, '/'); //cannot with path:AP_URL_ROOT
  //setcookie(idorg+'_p_t', o.style.display, 24*365, AP_URL_ROOT); //cannot with path:AP_URL_ROOT
  //setcookie(idorg+'_p_t', o.style.display, 24*365, false); //cannot with path:AP_URL_ROOT
  var m = byId('m_'+idorg);
  if(m && m.start) {
    m.start();
  }
}

//for imagelist
function autoSwitchImg(id, ind, mictime) {
  var p = byId(id+'_pp');
  if(!p) {
    return;
  }
  if(!p.onmouseout) {
    p._mouseover = 0;
    p.onmouseover = function() {
      p._mouseover = 1;
    };
    p.onmouseout = function() {
      p._mouseover = 0;
    };
  }
  if(p._mouseover == 1) {
    setTimeout('autoSwitchImg("'+id+'", '+ind+', '+mictime+')', mictime/2);
    return;
  }
  if(!mictime || mictime < 100) {
    mictime = 100;
  }
  if(p._curind) {
    ind = p._curind;
  }

  var i = 0;
  while(true) {
    i++;
    var o = byId(id+i);
    if(!o) {
      break;
    }
    var oo = byId(id+'_t'+i);
    if(i == ind) {
      o.style.display = '';
      if(oo) oo.style.backgroundColor = '#19c8f9';
      if(oo) oo.style.border = '1px solid #ff0000';
    }
    else {
      o.style.display = 'none';
      if(oo) oo.style.backgroundColor = '#e2ebed';
      if(oo) oo.style.border = '1px solid #ffffff';
    }
  }
  ind++;
  if(ind >= i) {
    ind = 1;
  }
  setTimeout('autoSwitchImg("'+id+'", '+ind+', '+mictime+')', mictime);
  p._curind = ind;
}

function overSwitchImg(id, ind) {
  var p = byId(id+'_pp');
  if(!p) {
    return;
  }
  p._curind = ind;
  var i = 0;
  while(true) {
    i++;
    var o = byId(id+i);
    if(!o) {
      break;
    }
    var oo = byId(id+'_t'+i);
    if(i == ind) {
      o.style.display = '';
      if(oo) oo.style.backgroundColor = '#19c8f9';
      if(oo) oo.style.border = '1px solid #ff0000';
    }
    else {
      o.style.display = 'none';
      if(oo) oo.style.backgroundColor = '#e2ebed';
      if(oo) oo.style.border = '1px solid #ffffff';
    }
  }
}

/**
 * Get language's message with params.
 * @param  :_id   String,Message ID,
 *          _prms Array,Params
 * @return :String,Message
 */
function getLanguage(_id, _prms, def) {
  
  var messages = Language.instance;
  if(!messages) {
    messages = Language.instance = new Language();
  }

  var msg = '';
  if(messages[_id]) {
    if(_prms) {
      return replacePrms(messages[_id], _prms);
    } else {
      return messages[_id];
    }

  }
  else {
    // if not exist id, then out as id (prm1, prm2, ...)
    if(typeof(def) != 'undefine') {
      return def;
    }
    var retPrm = '';
    if(_prms) {
      for(var i in _prms) {
        retPrm += ', $prm' + i;
      }
    }
    if(retPrm != '') {
      return replacePrms(_id + ' (' + retPrm.substring(2) + ')' , _prms);
    }
    return _id;
  }

  // replace {%0}-{%N} with params
  function replacePrms(_msg, _prms) {
    var retMsg = _msg;
    for(var i in _prms) {
      if(retMsg.indexOf('{%' + 0 + '}') >= 0) {
        for(var chkMsg = '';chkMsg != retMsg;) {
          chkMsg = retMsg;
          retMsg = retMsg.replace('{%' + 0 + '}', _prms[i]);
        }
      }
    }
    return retMsg;
  }
}


//Direction:0,1,2,3,"top","bottom","left","right"
function Marquee(ID, Direction, Step, Width, Height, Timer, DelayTime, WaitTime, ScrollStep, AutoStop) {
	this.obj = document.getElementById(ID);
	if(!this.obj) {
		alert("Not exist for Marquee:"+ID);
		this.obj = -1;
		return;
	}
	this.Direction = this.Width = this.Height = this.DelayTime = this.WaitTime = this.CTL = this.StartID = this.Stop = this.MouseOver = 0;
	this.Step = 1;
	this.Timer = 30;
	this.DirectionArray = {"top":0 , "up":0 , "bottom":1 , "down":1 , "left":2 , "right":3};
	if(typeof Direction == "number" || typeof Direction == "string")this.Direction = Direction;
	if(typeof Step == "number")this.Step = Step;
	if(typeof Width == "number")this.Width = Width;
	if(typeof Height == "number")this.Height = Height;
	if(typeof Timer == "number")this.Timer = Timer;
	if(typeof DelayTime == "number")this.DelayTime = DelayTime;
	if(typeof WaitTime == "number")this.WaitTime = WaitTime;
	if(typeof ScrollStep == "number")this.ScrollStep = ScrollStep;
	this.obj.style.overflow = this.obj.style.overflowX = this.obj.style.overflowY = "hidden";
	this.obj.noWrap = true;
	this.IsNotOpera = (navigator.userAgent.toLowerCase().indexOf("opera") == -1);
	this.Init = 0;
	if(typeof AutoStop == 'undefined' || !AutoStop)this.Start();
	var msobj = this;
	msobj.obj.start = function() {
		msobj.Start();
	}
}

Marquee.prototype.Start = function() {
	if(this.obj == -1)return;
	if(this.obj.clientWidth <= 0 || this.obj.clientHeight <= 0)return;
	if(this.Init != 0) {
		return;
	}
	this.Init = 1;
	if(this.WaitTime < 200)this.WaitTime = 200;
	if(this.Timer < 20)this.Timer = 20;
	if(this.Width == 0) {
			this.Width = parseInt(this.obj.clientWidth);
	}
	if(this.Height == 0) {
			this.Height = parseInt(this.obj.clientHeight);
	}
	if(typeof this.Direction == "string")this.Direction = this.DirectionArray[this.Direction.toString().toLowerCase()];
	this.HalfWidth = Math.round(this.Width / 2);
	this.HalfHeight = Math.round(this.Height / 2);
	this.BakStep = this.Step;
	this.obj.style.width = this.Width + "px";
	this.obj.style.height = this.Height + "px";
	if(typeof this.ScrollStep != "number")this.ScrollStep = this.Direction > 1 ? this.Width : this.Height;
	var msobj = this;
	msobj.tempHTML = msobj.obj.innerHTML;
	if(msobj.Direction <= 1) {
		var templateTop = "<table cellspacing='0' cellpadding='0' style='border-collapse:collapse;'><tr><td>MSCLASS_TEMP_HTML</td></tr><tr><td>MSCLASS_TEMP_HTML</td></tr></table>";
		msobj.obj.innerHTML = templateTop.replace(/MSCLASS_TEMP_HTML/g,msobj.obj.innerHTML);
	}
	else {
		if(msobj.ScrollStep == 0 && msobj.DelayTime == 0) {
			msobj.obj.innerHTML += msobj.obj.innerHTML;
		}
		else {
			var templateLeft = "<table cellspacing='0' cellpadding='0' style='border-collapse:collapse;display:inline;'><tr><td noWrap=true style='white-space: nowrap;word-break:keep-all;'>MSCLASS_TEMP_HTML</td><td noWrap=true style='white-space: nowrap;word-break:keep-all;'>MSCLASS_TEMP_HTML</td></tr></table>";
			msobj.obj.innerHTML = templateLeft.replace(/MSCLASS_TEMP_HTML/g,msobj.obj.innerHTML);
		}
	}
	var timer = this.Timer;
	var delaytime = this.DelayTime;
	var waittime = this.WaitTime;
	msobj.StartID = function(){msobj.Scroll()}
	msobj.Continue = function() {
		if(msobj.MouseOver == 1)
		{
			setTimeout(msobj.Continue,delaytime);
		}
		else
		{	clearInterval(msobj.TimerID);
			msobj.CTL = msobj.Stop = 0;
			msobj.TimerID = setInterval(msobj.StartID,timer);
		}
	}

	msobj.Pause = function() {
		msobj.Stop = 1;
		clearInterval(msobj.TimerID);
		setTimeout(msobj.Continue,delaytime);
	}

	msobj.Begin = function() {
		msobj.ClientScroll = msobj.Direction > 1 ? msobj.obj.scrollWidth / 2 : msobj.obj.scrollHeight / 2;
		if((msobj.Direction <= 1 && msobj.ClientScroll <= msobj.Height + msobj.Step) || (msobj.Direction > 1 && msobj.ClientScroll <= msobj.Width + msobj.Step))
		{
			msobj.obj.innerHTML = msobj.tempHTML;
			delete(msobj.tempHTML);
			return;
		}
		delete(msobj.tempHTML);
		msobj.TimerID = setInterval(msobj.StartID,timer);
		if(msobj.ScrollStep < 0)return;
		msobj.obj.onmouseover = function()
		{
			if(msobj.ScrollStep == 0)return;
			msobj.MouseOver = 1;
			clearInterval(msobj.TimerID);
		}
		msobj.obj.onmouseout = function()
		{
			if(msobj.ScrollStep == 0)
			{
				if(msobj.Step == 0)msobj.Step = 1;
				return;
			}
			msobj.MouseOver = 0;
			if(msobj.Stop == 0)
			{
				clearInterval(msobj.TimerID);
				msobj.TimerID = setInterval(msobj.StartID,timer);
			}
		}
	}
	setTimeout(msobj.Begin,waittime);
}

Marquee.prototype.Scroll = function() {
	switch(this.Direction)
	{
		case 0:
			if(this.obj.scrollTop >= this.ClientScroll)
			{
				this.obj.scrollTop -= this.ClientScroll;
			}
			this.obj.scrollTop += this.Step;
		break;

		case 1:
			if(this.obj.scrollTop <= 0)
			{
				this.obj.scrollTop += this.ClientScroll;
			}
			this.obj.scrollTop -= this.Step;
		break;

		case 2:
			if(this.obj.scrollLeft >= this.ClientScroll)
			{
				this.obj.scrollLeft -= this.ClientScroll;
			}
			this.obj.scrollLeft += this.Step;
		break;

		case 3:
			if(this.obj.scrollLeft <= 0)
			{
				this.obj.scrollLeft += this.ClientScroll;
			}
			this.obj.scrollLeft -= this.Step;
		break;
	}
}

//for tips
var _g_tipstimershow = null;
function sttip(e, obj, thecolor, thewidth) {
  e = e || window.event;
  var pos = calPos2(e);
  var otips = byId('_st_tips_c_');
  if(!otips) {
    otips = document.createElement("div");
    otips.id = '_st_tips_c_';
    document.body.appendChild(otips);
    otips.style.cssText = "font-size:9pt;color:#000000;line-height:140%;position:absolute;margin-left:10px;width:150px;border:1px solid #3f80d0;padding:6px;background-color:#d6eafd;display:none;z-index:100;";
    otips.onmousemove = function(){showsttip();};
    otips.onmouseout = function(){hidesttip();};
  }
  if(otips.innerHTML == '') {
    otips.innerHTML = obj.getAttribute('tiptext');
    if(typeof thecolor == 'undefined') thecolor = '#ccc';
    if(typeof thewidth == 'undefined') thewidth = '150';
    otips.style.backgroundColor = thecolor;
    otips.style.width = thewidth+"px";
  }

  otips.style.display = '';
  var wh = getWindowWH();
  var sl = wh[0] + (document.documentElement.scrollLeft ? document.documentElement.scrollLeft : document.body.scrollLeft);
  var st = wh[1] + (document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop);
  if(pos[0] + otips.offsetWidth + 10 > sl) {
    pos[0] = sl - otips.offsetWidth - 10;
  }
  if(pos[1] + otips.offsetHeight + 1 > st) {
    pos[1] = st - otips.offsetHeight - 1;
  }
  otips.style.left = pos[0]+'px';
  otips.style.top = pos[1]+'px';
  return false
}
function showsttip() {
  if(_g_tipstimershow) _g_tipstimershow = clearTimeout(_g_tipstimershow);
}
function hidesttip() {
  if(_g_tipstimershow) _g_tipstimershow = clearTimeout(_g_tipstimershow);
  _g_tipstimershow = setTimeout("hidesttip2()", 200);
}
function hidesttip2() {
  var otips = byId('_st_tips_c_');
  if(otips) {
    otips.style.display = 'none';
    otips.innerHTML = '';
  }
}

function showtab(id, ind) {
  var o = byId(id+ind+'_b');
  if(!o || o.style.display == '') {
    return;
  }
  for(i=1;;i++) {
    //title
    o = byId(id+i+'_t');
    if(o) {
      if(i == ind) {
        if(o.className) o.className = o.className.replace(/(_nor)/g, '_sel');
      }
      else {
        if(o.className) o.className = o.className.replace(/(_sel)/g, '_nor');
      }
    }

    //body
    o = byId(id+i+'_b');
    if(!o) {
      break;
    }
    if(i == ind) {
      o.style.display = '';
    }
    else {
      o.style.display = 'none';
    }
  }
}
