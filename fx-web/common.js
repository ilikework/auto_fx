/**
 * Shared JavaScript
 */
var NODATASENDOPTION = "#NODATASEND";
var ONSUBMITOPTION = "#ONSUBMIT";
var noConfirm = false;
var locked = false;
var locktimeout = 1000;
var winHeight_ = 600;
var winWidth_ = 840;

String.prototype.trim = function() {
	return this.replace(/^\s+|\s+$/g, '');
}
String.prototype.leftTrim = function() {
	return this.replace(/^\s+/, '');
}
String.prototype.rightTrim = function() {
	return this.replace(/\s+$/, '');
}
String.prototype.startsWith = function(str)
{
  return (this.match('^'+str) == str);
}
String.prototype.endsWith = function(str)
{
  return (this.match(str+'$') == str);
}
/*
  var str = "{0} : {1} + {2} = {3}".format("plus", 8, 0.5, 8+0.5);
  str = "name：{name}, age：{age}".format( { "name":"山田", "age":128 } );
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

function trim(str) {
	if(str === undefined || str === null) return '';
	return str.replace(/^\s+|\s+$/g, '');
}
function leftTrim(str) {
	if(str === undefined || str === null) return '';
	return str.replace(/^\s+/, '');
}
function rightTrim(str) {
	if(str === undefined || str === null) return '';
	return str.replace(/\s+$/, '');
}

function roundDecimal(val, precision) {
  return Math.round(Math.round(val * Math.pow(10, (precision || 0) + 1)) / 10) / Math.pow(10, (precision || 0));
}

//if open new window,then need restore this items that be rewrited.
var g_formsaved = null;

/*
like:
	var obj = find('#id1 div.class1 .class2'); -> <xxx id="id1"><div class="class1"><span class="class2"...
	var obj = find('#id1 .class1.class2'); -> <xxx id="id1"><div class="class1 class2"...
	var obj = find('div.class1'); -> <div class="class1">...
	var obj = find('div .class1'); -> <div><span class="class1"...
	var obj = find('input[type="text"]'); -> <input type="text"...
	var obj = find('input [type="text"]'); -> <input type="text"><input type="text"...
	
	.css('color', 'red');
*/
var find = function(any, doc) {
	var self = {};
	self._name = 'find';
	self._obj = [];
	self._obj.push(doc || window.document);

	self.getObj = function(ind) {
		if(!self._obj || self._obj.length == 0) return null;
		if(typeof ind == 'number' && ind >= 0 && ind < self._obj.length) return self._obj[ind];
		return self._obj[0];
	}
	self.getObjAll = function() {
		return self._obj;
	}
	self.getAttr = function(attr) {
		if(!self._obj || self._obj.length == 0) return null;
		return self._obj[0].getAttribute(attr);
	}
	self.setAttr = function(attr, val) {
		if(self._obj && self._obj.length > 0) {
			if(val === false || val === null) {
				self._obj[0].removeAttribute(attr);
			}
			else {
				self._obj[0].setAttribute(attr, val);
			}
		}
		return self;
	}
	self.html = function(s) {
		if(typeof s == 'undefined') {
			if(!self._obj || self._obj.length == 0) return null;
			return self._obj[0].innerHTML;
		}
		if(self._obj && self._obj.length > 0) {
			self._obj[0].innerHTML = s;
		}
		return self;
	}
	self.text = function(s) {
		if(typeof s == 'undefined') {
			if(!self._obj || self._obj.length == 0) return null;
			return self._obj[0].innerText;
		}
		if(self._obj && self._obj.length > 0) {
			self._obj[0].innerText = s;
		}
		return self;
	}
	self.val = function(s) {
		if(typeof s == 'undefined') {
			if(!self._obj || self._obj.length == 0) return null;
			if(self._obj[0].type == 'checkbox' || self._obj[0].type == 'radio') {
				return (self._obj[0].checked ? 1 : 0);
			}
			return self._obj[0].value;
		}
		if(self._obj && self._obj.length > 0) {
			if(self._obj[0].type == 'checkbox' || self._obj[0].type == 'radio') {
				self._obj[0].checked = (s == 1);
			}
			else {
				self._obj[0].value = s;
			}
		}
		return self;
	}
	self.value = self.val;

	self.css = function(name, value) {
		if(typeof name == 'undefined' || typeof value == 'undefined') {
			if(!self._obj || self._obj.length == 0) return null;
			if(typeof name == 'undefined') {
				return self._obj[0].style.cssText;
			}
			return self._obj[0].style[name];
		}
		if(self._obj && self._obj.length > 0) {
			if(value != null) {
				try {
					self._obj[0].style[name] = value;
				} catch(e) {}
			}
		}
		return self;
	}
	self.foreach = function(callback) {
		for(var l = 0; l < self._obj.length; l++) {
			var context = self._obj[l];
			callback(context);
		}
		return self;
	}

	self.find = function(any) {
		if(!self._obj || self._obj.length == 0 || any == null) {
			self._obj = [];
			return self;
		}
		if(typeof any == 'object') {
			if(any._obj && any.find && any._name == 'find') {
				self._obj = any._obj;
			}
			else {
				self._obj = [];
				self._obj.push(any);
			}
			return self;
		}
		if(typeof any != 'string') {
			self._obj = [];
			return self;
		}

		var anylist = any.split(" ");
		for(var i = 0; i < anylist.length; i++) {
			var any1 = anylist[i];
			curobj = self._obj;
			self._obj = [];
			for(var l = 0; l < curobj.length; l++) {
				var context = curobj[l];
				var ind;
				if((ind = any1.indexOf('#')) >= 0) {
					if(ind == 0) {
						var fobj = context.getElementById(any1.substring(1));
						if(fobj) self._obj.push(fobj);
					}
					else {
						var tag = any1.substring(0, ind);
						var tid = any1.substring(ind + 1);
						var el = context.getElementsByTagName(tag);
						for(var b = 0; b < el.length; b++) {
							var fobj = el[b].getElementById(tid);
							if(fobj) self._obj.push(fobj);
						}
					}
				}
				else if((ind = any1.indexOf('.')) >= 0) {
					var tag = (ind == 0) ? '*' : any1.substring(0, ind);
					var cls = any1.substring(ind + 1);
					var el = context.getElementsByTagName(tag);
					var cls2 = cls;
					while(cls2 != '') {
						if((ind = cls2.indexOf('.')) > 0) {
							cls = cls2.substring(0, ind);
							cls2 = cls2.substring(ind + 1);
						}
						else {
							cls = cls2;
							cls2 = '';
						}
						for(var b = 0; b < el.length; b++) {
		 					if(el[b].className && el[b].className.match(new RegExp('(^|\s)'+cls+'(\s|$)'))) self._obj.push(el[b]);
						}
					}
				}
				else if((ind = any1.indexOf('[')) >= 0) {
					if (any1.match(/^(\w*)\[(\w+)([=~\|\^\$\*]?)=?['"]?([^\]'"]*)['"]?\]$/)) {
						var tag = RegExp.$1;
						if(tag == '') tag = '*';
						var attr = RegExp.$2;
						var operator = RegExp.$3;
						var value = RegExp.$4;

						var el = context.getElementsByTagName(tag);
						for(var b = 0; b < el.length; b++) {
							var fAttr = el[b].getAttribute(attr);
		 					if(operator == '=' && fAttr != value) continue;
							if(operator == '~' && !fAttr.match(new RegExp('(^|\\s)'+value+'(\\s|$)'))) continue;
							if(operator == '|' && !fAttr.match(new RegExp('^'+value+'-?'))) continue;
							if(operator == '^' && fAttr.indexOf(value)!=0) continue;
							if(operator == '$' && fAttr.lastIndexOf(value)!=(fAttr.length-value.length)) continue;
							if(operator == '*' && !(fAttr.indexOf(value)+1)) continue;
							else if(!fAttr) continue;
							self._obj.push(el[b]);
						}
					}
					else {
						if(console) console.log('Error style:' + any1);
					}
				}
				else {
					var el = context.getElementsByTagName(any1);
					for(var b = 0; b < el.length; b++) self._obj.push(el[b]);
				}
			}
		}
		return self;
	}
	self.parent = function() {
		var p = null;
		if(self._obj && self._obj.length > 0 && self._obj[0].parentNode) p = self._obj[0].parentNode;
		return find(p);
	}

	return self.find(any);
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
			ret += (pre + 'key:'+k+', val:<br>');
			if(!nestmax || nestmax < nextind) {
				ret += print_object(obj[k], pre + '&nbsp;&nbsp;', nestmax, nextind + 1);
			}
		}
		else if(obj[k] && typeof obj[k] == 'function') {
			ret += (pre + 'key:'+k+', val:[function]<br>');
		}
		else {
			ret += (pre + 'key:'+k+', val:' + obj[k]+'<br>');
		}
	}
	return ret;
}

/**
 * Function for Prev/Next of pages
 */
function doPageIndex(ind) {
  var frm = document.forms[0];
  addInputField(frm,'hidden','pg_ind','pg_ind',ind);
  for(var i = 0; i < frm.elements.length; i++) {
    if (frm.elements[i].type == 'submit') {
      frm.elements[i].click();
      return false;
    }
  }
  frm.submit();
  return false;
}
function jumpPageIndex(obj) {
  var ind = 0;
  try{
    if(obj.parentNode.firstChild.value!='') ind = obj.parentNode.firstChild.value/1 + 1;
  }
  catch(e){}
  doPageIndex(ind);
}
function doPageCancel() {
  btn = document.getElementById('pg_prev');
  if(btn){btn.disabled='true';btn.style.display='none';}
  btn = document.getElementById('pg_next');
  if(btn){btn.disabled='true';btn.style.display='none';}
  btn = document.getElementById('pg_panel');
  if(btn){btn.disabled='true';btn.style.display='none';}
}
/* call at onload */
function doPageSetCancel() {
  if(document.forms.length < 1) return;
  var _elements = document.forms[0].elements;
  for(i = 0; i < _elements.length; ++i){
    var obj = _elements[i];
    if((obj.tagName=='INPUT'&&(obj.type=='text'||obj.type=='hidden'||obj.type=='password'))||obj.tagName=='SELECT'||obj.tagName=='TEXTAREA'){
      if(obj.id == obj.name && !obj.onchange && obj.id.indexOf('#')<0)obj.onchange=doPageCancel;
    }
  }
}
function lastMenuSubmit(formobj, params) {
  if(!formobj) {
    if(document.forms.length > 0) {
      formobj = document.forms[0];
    }
    else {
      alert('no form for submit.');
      return false;
    }
  }

  //default search button
  var obtn = byId('st_refresh');
  if(!obtn) {
    obtn = byId('st_Refresh');
  }
  if(obtn && obtn.type == 'submit') {
    obtn.click();
    return true;
  }
  
  var st_link = '';
  var paramsLink = new Array();
  if(byId('st_link') != null && byId('st_link').value != '') {
    st_link = byId('st_link').value;
    var url = AP_URL_INDEX + '?';
    paramsLink = splitUrl(st_link);
    for(var k in paramsLink) {
      if(byId(k) == null) {
        url += k+'='+paramsLink[k]+'&';
      }
    }
    formobj.action = url;
  }
  if(byId('task') != null) {
    //task can used only once
    byId('task').value = '';
  }
  if(byId('st_prn') != null) {
    //st_prn can used only once
    byId('st_prn').value = '';
  }
  if(byId('st_pdf') != null) {
    //st_pdf can used only once
    byId('st_pdf').value = '';
  }
  if(paramsLink != null && paramsLink['st_p1'] && byId('st_p1') != null && byId('st_p1').value == '') {
    byId('st_p1').value = paramsLink['st_p1'];
  }
  if(paramsLink != null && paramsLink['st_p2'] && byId('st_p2') != null && byId('st_p2').value == '') {
    byId('st_p2').value = paramsLink['st_p2'];
  }
  if(paramsLink) {
    for(var k in paramsLink) {
      //if not exist,then not set
      if(byId(k) != null && byId(k).value == '') {
        byId(k).value = paramsLink[k];
      }
    }
  }
  if(params) {
    var paramsLink2 = splitUrl(params);
    for(var k in paramsLink2) {
      //if not exist,create it
      setField(k, paramsLink2[k], formobj);
      if(k != 'task' && !paramsLink[k]) {
        st_link += '&' + k + '=' + paramsLink2[k];
      }
    }
    if(byId('st_link') != null) {
      byId('st_link').value = st_link;
    }
  }

  formobj.target = '_self';
  formobj.submit();
  return true;
}

/**
 * Submit from button to server's script
 * doSubmitRunServerScript(document.forms[0],'','','contact_EN','module');
 *
 * @param formobj            Event from this form
 * @param confirmtype        Message for 1:New record, 2:Update record, 3:Delete record.
 * @param pageId             Target page(content)
 * @param pageIdOuter        Target page(frame)
 * @param target             target
 * @param optionParams       Params with format "&p1=a&p2=b"
 * @param ownerPageId        Event from this page
 * @param ownerPageType      Page or Module
 * @param ownerButton        Event from this button
 */
function doSubmitRunServerScript(formobj, confirmtype, pageId, pageIdOuter, target, optionParams, ownerPageId, ownerPageType, ownerButton){
	var processId = '';
	var processMode = '';
	var nextProcessId = '';
	var nextProcessMode = '';
	var errorPageId = '';
	doProcess(formobj, processId, processMode, pageId,
						nextProcessId, nextProcessMode,
						confirmtype, errorPageId, target, optionParams, ownerPageId, ownerPageType, ownerButton, 'onclick', pageIdOuter, '');
}

/**
 * run server SetGlobals/SetSession before process
 */
function doProcessSetParams(formobj, processId, processMode, pageId, pageIdOuter,
						nextProcessId, nextProcessMode,
						confirmtype, errorPageId, errorPageIdOuter, target, optionParams, ownerPageId, ownerPageType, ownerButton){
	doProcess(formobj, processId, processMode, pageId,
						nextProcessId, nextProcessMode,
						confirmtype, errorPageId, target, optionParams, ownerPageId, ownerPageType, ownerButton, 'onclick', pageIdOuter, errorPageIdOuter)
}


/**
////////////////////////////////////////////////////////////////////////////////
 * openWindow
 * if call openWindow with callbackfun, then this param will be saved to openWindowCallbackFun.
 * after a new window is opend, the new window can get from openWindowCallbackFun,
 * and save it to destOpenWindowCallbackFun.
 * notice that destOpenWindowCallbackFun is only alive at the opend window.
////////////////////////////////////////////////////////////////////////////////
 */
/** 呼び元画面の戻り値設定用ファクション */
var openWindowCallbackFun = null;
/** 呼び出された画面の戻り値設定用ファクション */
var destOpenWindowCallbackFun = null;
try {
	if (window.opener && !window.opener.closed && window.opener.getOpenWindowCallbackFun){
		destOpenWindowCallbackFun = window.opener.getOpenWindowCallbackFun();
	}
}
catch(e) {}
function getOpenWindowCallbackFun() {
	return openWindowCallbackFun;
}

/**
 * Open window
 * @param  urlstr          the url of new window
 * @param  windowOptions   option for new window
 *                           like:"name=value,name=value,･･･"
 * @param  windowname      the name of new window
 * @return the window object
 */
function openWindow(urlstr, windowOptions, windowname, callbackfun) {
	openWindowCallbackFun = callbackfun;
	var option = "";
	var winname = "";
	var i=0;
	if (!isEmpty(windowname)){
		winname = windowname;
	}
	var defaultoptionsname = new Array("status","scrollbars",
			"resizable","copyhistory",
			"width","height",
			"screenX","screenY",
			"left","top");
	var defaultoptionsvalue=new Array("yes","yes",
			"yes","yes",
			winWidth_,winHeight_,
			"","",
			"","");

	var strval = "";
	var paraname = "";
	var paravalue = "";
	var j=0;
	var addpara = "";
	var existdefault = false;

	if (!isEmpty(windowOptions)){
		var r = windowOptions.split(",");
		for(i=0; i<r.length; i++){
			//splite params
			strval = trim(r[i]);
			paraname = getFrontString(strval,"=");
			paravalue = getBackString(strval,"=");
			existdefault = false;
			if (paraname == "left" || paraname == "screenX"){
				defaultoptionsvalue[6] = paravalue;
				defaultoptionsvalue[8] = paravalue;
				existdefault = true;
			}else if(paraname == "top" || paraname == "screenY"){
				defaultoptionsvalue[7] = paravalue;
				defaultoptionsvalue[9] = paravalue;
				existdefault = true;
			}else if((paraname == "name" || paraname == "target") && winname == ''){
				winname = paravalue;
			}else{
				//replace default params if exist
				for(j=0;j<defaultoptionsname.length;j++){
					if(defaultoptionsname[j] == paraname){
						defaultoptionsvalue[j] = paravalue;
						existdefault = true;
						break;
					}
				}
			}
			//others add
			if (!existdefault){
				addpara += ("," + strval);
			}
		}
	}

	//center of window
	var def_x=0;
	var def_y=0;
	def_x = parseInt((window.screen.width - parseInt(defaultoptionsvalue[4]))/2);
	def_y = parseInt((window.screen.height - parseInt(defaultoptionsvalue[5]))/2);
	if (defaultoptionsvalue[6] == "" || defaultoptionsvalue[8] == "") {
		defaultoptionsvalue[6] = def_x;
		defaultoptionsvalue[8] = def_x;
	}
	if (defaultoptionsvalue[7] == "" || defaultoptionsvalue[9] == "") {
		defaultoptionsvalue[7] = def_y;
		defaultoptionsvalue[9] = def_y;
	}

	//create params
	option += (defaultoptionsname[0] + "=" + defaultoptionsvalue[0]);
	for(j=1;j<defaultoptionsname.length;j++){
		option += ("," + defaultoptionsname[j] 
				+ "=" + defaultoptionsvalue[j]);
	}

	if (!isEmpty(addpara)){
		option += addpara;
	}

	//option = "toolbar=no,location=no,directories=no";
	//option = option + ",status=yes,menubar=no,scrollbars=yes,resizable=yes";
	//option = option + ",copyhistory=yes,width=800,height=600";
	//option = option + ",screenX=100,screenY=50,left=100,top=50";
	var path = "";
	var paramstr = "";
	//encode params
	if(urlstr.indexOf('?')!=-1){
		path = urlstr.substring(0,urlstr.indexOf('?'))
		paramstr = urlstr.substring(urlstr.indexOf('?')+1, urlstr.length);
		if(paramstr.length>0){
			var paramsary = paramstr.split('&');
			paramstr = "";
			var key = "";
			var val = "";
			if(paramsary[0].indexOf('=')!=-1){
				key=getFrontString(paramsary[0],"=");
				val = getBackString(paramsary[0],"=");
				paramstr = key+"="+encodeUrl(unescape(val));
			}else{
				paramstr = paramsary[0];
			}
			for(i=1; i<paramsary.length; i++){
				if(paramsary[i].indexOf('=')!=-1){
					key = getFrontString(paramsary[i],"=");
					val = getBackString(paramsary[i],"=");
					paramstr += "&"+key+"="+encodeUrl(unescape(val));
				}else{
					paramstr += "&"+paramsary[i];
				}
			}
		}
		urlstr = path+"?"+paramstr;
	}
		
	if(document.forms[0]){
		if(document.forms[0].elements["THREADID"]){

			var threadId = "";
			threadId = document.forms[0].elements["THREADID"].value;
			var threadIdstr = "";
			if(urlstr.indexOf('appcontroller?')!=-1){
				path = urlstr.substring(0, urlstr.indexOf('appcontroller?')+'appcontroller?'.length)
				paramstr = urlstr.substring(urlstr.indexOf('appcontroller?')+'appcontroller?'.length, urlstr.length);

				if (paramstr==""){
					urlstr = path + "THREADID=" + threadId;
				}else{
					urlstr = path + "THREADID=" + threadId + "&" + paramstr;
				}
			}else if(urlstr.charAt(0)=='?'){
				if(urlstr.charAt(0)=='?' && urlstr.length>1){
					paramstr = urlstr.substring(1, urlstr.length);
					urlstr = '?' + "THREADID=" + threadId + "&" + paramstr;
				} else {
					urlstr = "?THREADID="+threadId;
				}
			}
		}
	}

	winname = winname.replace(/[\/|.|# ]/g, '_');
	var win = window.open(urlstr, winname, option);

	win.focus();
	return win;
}

/**
 * set value to form element, create it if not exist.
 * @param form    element's form
 * @param type    element's type, hidden or text
 * @param id      element's id
 * @param name    element's name
 * @param value   element's value
 * @return        the element
 */
function addInputField(form, type, id, name, value) {
  return setField(id, value, form, name, type);
}

/**
 * create input string
 * @param type
 * @param id
 * @param name
 * @param value
 */
function makeInputTagString(type, id, name, value){
	var str = "";
	str += '<input type="'+type+'"';
	if(id != ""){
		str += ' id="'+ id + '"';
	}
	str += ' name="'+ name + '"';
	str += ' value="'+ value + '"';
	str += '>\n';
	return  str;
}

/**
 *  add Params into formobj as hidden
 *  @param formobj Form
 *  @param optionParams       Params with format "&p1=a&p2=b"
 */
function appendParams(formobj, optionParams){
	//if exist the same id,then the last is valid
	var	strval = "";
	var paraname = "";
	var paravalue = "";
	
	if (!isEmpty(optionParams)){
		var r = optionParams.split("&");
		for(i=0; i<r.length; i++){
			strval = r[i];
			if(isEmpty(strval) || strval==ONSUBMITOPTION || strval==NODATASENDOPTION){
				continue;
			}
			
			paraname = getFrontString(strval,"=");
			paravalue = getBackString(strval,"=");
			//paraname = paraname.toUpperCase();
			if(g_formsaved) {
				if(document.getElementById(paraname)) {
					g_formsaved[paraname] = document.getElementById(paraname).value;
				}
				else {
					g_formsaved[paraname] = '';
				}
			}
			addInputField(formobj, "hidden", paraname, paraname, unescape(paravalue));
		}
	}
}
function restoreParams(){
	if(!g_formsaved) {
		return;
	}
	for(var id in g_formsaved) {
		if(document.getElementById(id)) {
			document.getElementById(id).value = g_formsaved[id];
		}
	}
	g_formsaved = null;
}

/**
 * run process with mode 3
 */
function doSubmitProcess(formobj, processId, pageId, pageIdOuter,
						nextProcessId, nextProcessMode,
						confirmtype, errorPageId, errorPageIdOuter, target, optionParams){
	doProcess(formobj, processId, "3", pageId,
						nextProcessId, nextProcessMode,
						confirmtype, errorPageId, target, optionParams, '', '', '', 'submit', pageIdOuter, errorPageIdOuter)

}

/**
 * run process with mode 2
 */
function doConfirmProcess(formobj, processId, pageId, pageIdOuter, 
						nextProcessId, nextProcessMode,
						confirmtype, errorPageId, errorPageIdOuter, target, optionParams){

	doProcess(formobj, processId, "2", pageId,
						nextProcessId, nextProcessMode,
						confirmtype, errorPageId, target, optionParams, '', '', '', 'submit', pageIdOuter, errorPageIdOuter)
}

/**
 * run process with mode 1
 */
function doInitializeProcess(formobj, processId, pageId, pageIdOuter,
						nextProcessId, nextProcessMode,
						errorPageId, errorPageIdOuter, target, optionParams){
	doProcess(formobj, processId, "1", pageId,
						nextProcessId, nextProcessMode,
						'', errorPageId, target, optionParams, '', '', '', 'submit', pageIdOuter, errorPageIdOuter)
}

/**
 * while locked, do nothing for links
 */
function doProcessLocked() {
  return false;
}
/**
 * while locked,messsage
 */
function doProcessAbort() {
  alert(getLanguage('W0002'));
  return false;
}
/**
 * cancel the lock after timeout
 */
function doProcessTimeout() {
  if(document.readyState=='loading'){
    setTimeout('doProcessTimeout()',locktimeout);
    return;
  }
  locked = false;
  document.body.style.cursor='';
  var _elements = document.getElementsByTagName('A');
  for(i = 0; i < _elements.length; ++i){
    var obj = _elements[i];
    obj.onclick=doProcessAbort;
    obj.style.cursor='';
  };
  _elements = document.getElementsByTagName('INPUT');
  for(i = 0; i < _elements.length; ++i){
    var obj = _elements[i];
    obj.onclick=doProcessAbort;
    obj.style.cursor='';
  };
}
/**
 * lock form
 */
function doFormLock() {
  locked = true;
  document.body.style.cursor='progress';
  var _elements = document.getElementsByTagName('A');
  for(i = 0; i < _elements.length; ++i){
    var obj = _elements[i];
    obj.onclick=doProcessLocked;
    obj.style.cursor='progress';
  };
  _elements = document.getElementsByTagName('INPUT');
  for(i = 0; i < _elements.length; ++i){
    var obj = _elements[i];
    obj.onclick=doProcessLocked;
    obj.style.cursor='progress';
  };
  setTimeout('doProcessTimeout()',locktimeout);
}

/**
 * Run process
 *
 * @param formobj            Event from this form
 * @param processId          Process to run
 * @param processMode        mode for run process, 1:init, 2:confirm, 3:insert or update
 * @param pageId             Target page(content)
 * @param nextProcessId      next Process to run
 * @param nextProcessMode    mode for run next process, 1:init, 2:confirm, 3:insert or update
 * @param confirmtype        Message for 1:New record, 2:Update record, 3:Delete record.
 * @param errorPageId        Target page for while run process with error result
 * @param target             target
 * @param optionParams       Params with format "&p1=a&p2=b"
 * @param ownerPageId        Event from this page
 * @param ownerPageType      Page or Module
 * @param ownerButton        Event from this button
 * @param task               normal is "submit"
 * @param pageIdOuter        Target page(frame)
 * @param errorPageIdOuter   Target page(frame) for error
 */
function doProcess(formobj, processId, processMode, pageId,
						nextProcessId, nextProcessMode,
						confirmtype, errorPageId, target, optionParams, ownerPageId, ownerPageType, ownerButton, task, pageIdOuter, errorPageIdOuter){
	if(locked){
		return;
	}
	sysonsubmit();

	var messagestr = "";
	if (!isEmpty(confirmtype)){
		if(confirmtype == "1")
			if(byId('PAGEMODE') && byId('PAGEMODE').value == 'M') {
				messagestr = getLanguage('M0002');
			}
			else {
				messagestr = getLanguage('M0001');
			}
		else if(confirmtype == "2")
			messagestr = getLanguage('M0002');
		else if(confirmtype == "3")
			messagestr = getLanguage('M0003');
    else
      messagestr = confirmtype;
	}

	if (!isEmpty(messagestr) && !noConfirm){
		if(!confirm(messagestr)){
			return false;
		}
	}

	var bNodadatasend = false;
	var bOnsubmit = false;
	var paramarray = new Array();
	//alert(optionParams);
	if(!isEmpty(optionParams)){
		//if or not has params
		if(optionParams.charAt(0) == '&'){
			optionParams = optionParams.substring(1, optionParams.length);
		}
		paramarray = optionParams.split('&');
		for(var i=0; i<paramarray.length; i++){
			var aParam = paramarray[i];
			if(aParam==NODATASENDOPTION){
				bNodadatasend = true;
			}else if(aParam==ONSUBMITOPTION){
				bOnsubmit = true;
			}
		}
	}

	//for do submit in a single page
	//if(!isEmpty(pageId) && isEmpty(pageIdOuter)) {
	//	if(byId('st_p1').value != '' && (byId('st_p2').value == '' || byId('st_p2').value == pageId)) {
	//		pageIdOuter = pageId;
	//		pageId = '';
	//		byId('st_p1').value = '';
	//		byId('st_p2').value = '';
	//		if(!isEmpty(errorPageId) && isEmpty(errorPageIdOuter)) {
	//			errorPageIdOuter = errorPageId;
	//		}
	//	}
	//}
	
	if(bNodadatasend){
		var str = "";
		if (!isEmpty(processId) || !isEmpty(pageId)){
			str += makeInputTagString("hidden", "", "PROCESSID", processId);
			str += makeInputTagString("hidden", "", "PROCESSMODE", processMode);
			str += makeInputTagString("hidden", "", "PAGEID", pageId);

			if (!isEmpty(nextProcessId)){
				str += makeInputTagString("hidden", "", "NEXTPROCESSID", nextProcessId);
			}
			if (!isEmpty(nextProcessMode)){
				str += makeInputTagString("hidden", "", "NEXTPROCESSMODE", nextProcessMode);
			}

			if (!isEmpty(pageIdOuter)){
				str += makeInputTagString("hidden", "", "PAGEIDOUTER", pageIdOuter);
			}
			if (!isEmpty(errorPageIdOuter)){
				str += makeInputTagString("hidden", "", "ERRORPAGEIDOUTER", errorPageIdOuter);
			}
		}

		if (!isEmpty(errorPageId)){
		 str += makeInputTagString("hidden", "", "ERRORPAGEID", errorPageId);
		}

		//OWNERPAGE
		if (ownerPageId && !isEmpty(ownerPageId)){
		 str += makeInputTagString("hidden", "", "OWNERPAGEID", ownerPageId);
		}
		if (ownerPageType && !isEmpty(ownerPageType)){
		 str += makeInputTagString("hidden", "", "OWNERPAGETYPE", ownerPageType);
		}
		if (ownerButton && !isEmpty(ownerButton)){
		 str += makeInputTagString("hidden", "", "OWNERBUTTON", ownerButton);
		}
		if (task && !isEmpty(task)){
		 str += makeInputTagString("hidden", "", "task", task);
		}

		for(var i=0; i<paramarray.length; i++){
			//split params
			var strval = paramarray[i];
			if(strval == NODATASENDOPTION || strval == ONSUBMITOPTION){
				continue;
			}
			var paraname = getFrontString(strval, "=");
			var paravalue = getBackString(strval, "=");
			str += makeInputTagString("hidden", "", paraname, unescape(paravalue));
		}
		
		//hide body
		document.body.style.visibility='hidden';
		formobj.innerHTML = str;

	}else{
		if (!isEmpty(processId) || !isEmpty(pageId)){
			addInputField(formobj, "hidden", "PROCESSID", "PROCESSID", processId);
			addInputField(formobj, "hidden", "PAGEID", "PAGEID", pageId);
			addInputField(formobj, "hidden", "PROCESSMODE", "PROCESSMODE", processMode);
			if (isEmpty(nextProcessId)){
			  nextProcessId = "";
			}
			addInputField(formobj, "hidden", "NEXTPROCESSID", "NEXTPROCESSID", nextProcessId);
			if (isEmpty(nextProcessMode)){
				nextProcessMode = "";
			}
			addInputField(formobj, "hidden", "NEXTPROCESSMODE", "NEXTPROCESSMODE", nextProcessMode);

			if (isEmpty(pageIdOuter)){
				pageIdOuter = "";
			}
			addInputField(formobj, "hidden", "PAGEIDOUTER", "PAGEIDOUTER", pageIdOuter);
			if (isEmpty(errorPageIdOuter)){
				errorPageIdOuter = "";
			}
			addInputField(formobj, "hidden", "ERRORPAGEIDOUTER", "ERRORPAGEIDOUTER", errorPageIdOuter);
		}

		if (isEmpty(errorPageId)){
			errorPageId = "";
		}
		addInputField(formobj, "hidden", "ERRORPAGEID", "ERRORPAGEID", errorPageId);

		if (!ownerPageId || isEmpty(ownerPageId)){
			ownerPageId = "";
		}
		addInputField(formobj, "hidden", "OWNERPAGEID", "OWNERPAGEID", ownerPageId);
		if (!ownerPageType || isEmpty(ownerPageType)){
			ownerPageType = "";
		}
		addInputField(formobj, "hidden", "OWNERPAGETYPE", "OWNERPAGETYPE", ownerPageType);
		if (!ownerButton || isEmpty(ownerButton)){
			ownerButton = "";
		}
		addInputField(formobj, "hidden", "ownerButton", "OWNERBUTTON", ownerButton);
		if (!task || isEmpty(task)){
			task = "";
		}
		addInputField(formobj, "hidden", "task", "task", task);
		//addInputField(formobj, "hidden", "PHPID", "PHPID", "");

		//if open new window,then need restore this items that be rewrited.
		if(target=='_self' || target==''){
			g_formsaved = null;
		}
		else {
			g_formsaved = {};
		}
		//if has same, the last is valid
		appendParams(formobj, optionParams);
		if(g_formsaved) {
			//need restore this after sometime
			setTimeout('restoreParams()', 500);
		}
	}
							
	if (!isEmpty(target)){
		formobj.target = target;
	}else{
		formobj.target = '_self';
	}

	if(!bOnsubmit){
		if((formobj.target=='_self' || formobj.target=='')){
			doFormLock();
		}
		if(isEmpty(formobj.action)) {
			formobj.action = AP_URL_INDEX;
		}
		formobj.submit();
	}
}

function openEditHtml(fieldname, uploadkey, exturl){
	//make params
	var arg = new Object();
	arg.isOk = false;
	if(!byId(fieldname)) {
		alert('Not found element:'+fieldname);
		return;
	}
	arg.propertyValue = byId(fieldname).value;
	arg.returnOk = onReturnOk;

	var url = '?st_p1=static::s_edithtml';
	if(uploadkey) {
		url += '&uploadkey='+uploadkey;
	}
	if(exturl) {
		if(exturl.substring(0, 1) != '&') {
			exturl = '&' + exturl;
		}
		url += exturl;
	}
	openWindow(AP_URL_INDEX + url, 'width=700,height=460,scrollbars=yes,resizable=yes', 'eh_'+fieldname, arg);
	function onReturnOk(rtn){
		if(rtn.isOk){
			byId(fieldname).value = rtn.propertyValue;
		}
	}
}

function openEditText(fieldname, multiline){
	//make params
	var arg = new Object();
	arg.isOk = false;
	if(!byId(fieldname)) {
		alert('Not found element:'+fieldname);
		return;
	}
	arg.propertyValue = byId(fieldname).value;
	arg.returnOk = onReturnOk;
	arg.multiLine = (multiline != '0');

	openWindow(AP_URL_INDEX + '?st_p1=static::s_edittext', 'width=700,height=460,scrollbars=yes,resizable=yes', 'eh_'+fieldname, arg);
	function onReturnOk(rtn){
		if(rtn.isOk){
			byId(fieldname).value = rtn.propertyValue;
		}
	}
}

var g_imageListListmode = 'preview';
function openSelectImg(fieldname){
	//make params
	var arg = new Object();
	arg.isOk = false;
	arg.listmode = g_imageListListmode;
	if(!byId(fieldname)) {
		alert('Not found element:'+fieldname);
		return;
	}
	arg.propertyValue = byId(fieldname).value;
	arg.elementId = fieldname;
	arg.returnOk = onReturnOk;

	openWindow(AP_URL_INDEX + '?st_p1=static::s_imagelist', 'width=600,height=500,scrollbars=yes,resizable=yes', 'si_'+fieldname, arg);
	function onReturnOk(rtn){
		if(rtn.isOk){
			g_imageListListmode = rtn.listmode;
			byId(fieldname).value = rtn.propertyValue;
			if(byId(fieldname).onchange) byId(fieldname).onchange();
		}
	}
}

function openUploadFile(fieldname, uploadkey){
	//make params
	var arg = new Object();
	arg.isOk = false;
	if(!byId(fieldname)) {
		alert('Not found element:'+fieldname);
		return;
	}
	if(isEmpty(uploadkey)) {
		alert('Empty for uploadkey.');
		return;
	}
	arg.propertyValue = byId(fieldname).value;
	arg.elementId = fieldname;
	arg.uploadKey = uploadkey;
	arg.returnOk = onReturnOk;

	openWindow(AP_URL_INDEX + '?st_p1=static::s_upload&uploadkey='+uploadkey, 'width=600,height=500,scrollbars=yes,resizable=yes', 'sf_'+fieldname, arg);
	function onReturnOk(rtn){
		if(rtn.isOk){
			byId(fieldname).value = rtn.propertyValue;
		}
	}
}

function closeWindow(){
	self.close();
}

/**
 * check off or on for a element of a list
 * @param formobj Form
 * @param fieldname Checkbox's name
 * @param checked true or false
 */
function checkAllCheckbox(formobj, fieldname, checked){
	var obj = formobj.getElementsByTagName('input');
	for(var i=0;i<obj.length;i++){
		//<INPUT id="C_SEL/CHECK#0" name="C_SEL/CHECK" class="vw-check" onclick="..." type="checkbox" value="1">
		if(obj[i].type=='checkbox' && obj[i].id.indexOf('C_'+fieldname + '#') == 0) {
			obj[i].checked = checked;
			if(obj[i].onclick) obj[i].onclick();
		}
	}
}

/**
 * element of list is or not checked
 * 
 * @param fieldname Checkbox's name
 * @return boolean true or false
 */
function lineChecked(formobj, fieldname) {
	var hasline = false;
	var haschk = false;
	var obj = formobj.getElementsByTagName('input');
	for(var i=0;i<obj.length;i++){
		if(obj[i].type=='checkbox' && obj[i].id.indexOf(fieldname + '_check#') == 0) {
			hasline = true;
			if(obj[i].checked) {
				haschk = true;
				break;
			}
		}
	}

	if(!hasline) {
		alert(getLanguage('M0004'));
		return false;
	}
	if(!haschk) {
		alert(getLanguage('M0005'));
		return false;
	}
	return true;
}

function winclick(e) {
  if(typeof(menupop_hide) == 'function') {
    e = e || window.event;
    var tg = e.srcElement || e.target;
    if(tg && tg.nodeName.toUpperCase() == 'LI') {
      tg = tg.parentNode;
      if(tg && tg.nodeName.toUpperCase() == 'DIV') {
        tg = tg.parentNode;
        if(tg && tg.st_menuflag && tg.st_menuflag == '1') {
          return;
        }
      }
    }
    menupop_hide(-1, -1);
  }
}
/* while click on body then hide popup menus */
//if(window.captureEvents){
//  //window.captureEvents(Event.KEYDOWN);
//  //window.onkeydown=doKeyDown;
//  window.captureEvents(Event.CLICK);
//  window.onclick=winclick;
//}
//else {
//  //document.onkeydown=doKeyDown;
//  document.onclick=winclick;
//}
//(window.addEventListener) ? window.addEventListener('click', winclick, false ) : window.attachEvent('onclick', winclick);
(document.addEventListener) ? document.addEventListener('click', winclick, false ) : document.attachEvent('onclick', winclick);

/*
 * 指定されたヘルプ画面を開く.
 * need openWindow().
 * @param applicationId    アプリケーションID
 * @param idFieldIds        IDテキストボックスのID配列
 *            引数の指定は以下のように行う。
 *            new Array(propertyId, propertyId, ･･･ , valueId, valueId･･･)
 *            配列の前半に設定先プロパティIDを入れる。
 *            後半に設定元となるヘルプ画面上のプロパティIDを入れる。
 *            プロパティIDと値プロパティIDの個数は同じになっていることを前提とする。
 * @param nameFieldIds       名称テキストボックスのID配列
 *            引数はidFieldIdsと同様に、
 *            配列の前半に設定先名称プロパティIDを入れる。
 *            後半に設定元となるヘルプ画面上の名称プロパティIDを入れる。
 * @param date             適用日
 * @param optionParameters 追加のパラメータ  
 *                           &パラメータ名=値&パラメータ名=値･･･で指定する
 * @param windowOptions    画面追加変更パラメータ 
 *                           パラメータ名=値,パラメータ名=値･･･で指定する
 */
function openHelpWin(processId, processMode, pageId, idFieldIds, nameFieldIds, optionParameters, windowOptions, returnFunction) {
  var urlstr = AP_URL_INDEX + '?task=submit';
  if(!isEmpty(processId)){
    urlstr += '&PROCESSID=' + processId;
    if(isEmpty(processMode)){
      processMode = '3';
    }
    urlstr += '&PROCESSMODE=' + processMode;
  }
  urlstr += '&PAGEIDOUTER=' + pageId;

  //if has optionParameters,add to url
  if(!isEmpty(optionParameters)){
    if(optionParameters.charAt(0)!='&'){
      optionParameters = '&'+optionParameters;
    }
    urlstr += optionParameters;
  }

  if(isEmpty(idFieldIds)) {
    idFieldIds = "";
  }

  if(isEmpty(nameFieldIds)) {
    nameFieldIds = "";
  }

  if(typeof(returnFunction) != 'function') {
    returnFunction = null;
  }

  //make params
  var arg = new Object();
  arg.isOk = false;
  arg.idFieldIds = idFieldIds;
  arg.nameFieldIds = nameFieldIds;
  arg.returnFunction = returnFunction;
  arg.returnOk = onReturnOk;

  //var win = openWindow(urlstr, windowOptions, "");  
  //may open multi help window for diferent fields
  openWindow(urlstr, windowOptions, "", arg);
  function onReturnOk(rtn){
    if(rtn.isOk && rtn.filedId && typeof(rtn.fieldValue) == 'string'){
      setValueById(rtn.filedId, rtn.fieldValue, rtn.returnFunction);
    }
  }
}

/*
 * エレメントに値を設定する.
 * @param _id    エレメントのID
 * @param _value      設定する値
 */
function setValueById(_id, _value, _fun, valueShouldBeQuoted) {
	if(_fun && typeof(_fun) == 'function') {
		_fun(_id, _value);
		return;
	}
	var element = document.getElementById(_id);
	if (!element) {
		alert('Not found element:'+_id+' for setValueById.');
		return;
	}

	//判断は簡略化している
	var browsertype = -1;
	var uName = navigator.userAgent;
	if (uName.indexOf("Safari") > -1) {
		browsertype = 6;
	} else if (uName.indexOf("MSIE") > -1) {
		browsertype = 1;
	} else if (uName.indexOf("Opera") > -1) {
		browsertype = 5;
	} else if (uName.indexOf("Mozilla") > -1) {
		browsertype = 2;
	} else if (uName.indexOf("Netscape") > -1) {
		browsertype = 3;
	}

	if(element.nodeName == 'SPAN' || element.nodeName == 'DIV'){
		if(browsertype==1){
			element.innerText = _value;
			if(element.onchange)element.onchange();
		}else if(browsertype==2 || browsertype==3){
			//本当はhtml escapeをしないといけない
			element.innerHTML = _value;
			if(element.onchange)element.onchange();
		}
	} else {
		element.value = _value;
		if(element.onchange)element.onchange();
	}
}

/**
 * 特殊文字をJavaScript用にエスケープする
 * @param value
 * @return String
 */
function escapeJavaScript(value){
  if(!value) {
    return '';
  }
  var sb = '';
  for(var i = 0; i < value.length; i++) {
    var c = value.charAt(i);
    switch(c){
    case  '\\':
      sb += '\\\\';
      break;
    case '\'':
      sb += '\\\'';
      break;
    default:
      sb += c;
    }
  }
  return sb;
}

/*
 * functions used by help window.
 * notice that this is called from help window.
 */
/* 
 * 呼び元の画面の該当箇所にデータ（IDと名称）をセットする
 * 採用する名称プロパティIDが無い場合は名称のセットはしない。
 * @param マスタのID配列
 *            引数の指定は以下のように行う。
 *            new Array(propatyid, propatyid,propatyid･･･ , value, value･･･)
 *            配列の前半に名称のプロパティIDを入れる。後半に具体的な値を入れる。
 *            プロパティIDと値の個数は同じになっていることを前提とする。
 * @param マスタの名称配列 
 *            引数の指定は以下のように行う。
 *            new Array(propatyid, propatyid,propatyid･･･ , namevalue, namevalue･･･)
 *            配列の前半に名称のプロパティIDを入れる。後半に具体的な名称値を入れる。
 *            プロパティIDと名称値の個数は同じになっていることを前提とする。
 */
function setDataToOpenerLink(fieldIds, nameIds){
	if(!destOpenWindowCallbackFun || !destOpenWindowCallbackFun.returnOk
		|| typeof(destOpenWindowCallbackFun.idFieldIds) == 'undefine'
		|| typeof(destOpenWindowCallbackFun.nameFieldIds) == 'undefine') {
		alert('No callback function from opener.');
		return;
	}
	if(!window.opener || window.opener.closed) {
		//既にopenerが閉じられていると思われる場合
		window.close();
		return;
	}

	var delim = ',';
	if(!isEmpty(destOpenWindowCallbackFun._delimiter)){
		delim = destOpenWindowCallbackFun._delimiter;
	}

	var isStop = (typeof(destOpenWindowCallbackFun._returnStop) == 'boolean' && destOpenWindowCallbackFun._returnStop);
	if(destOpenWindowCallbackFun._returnIds && (!isStop || destOpenWindowCallbackFun._returnIds.length > 0)) {
		var len = fieldIds.length / 2; //必ず割り切れるはず
		for (i=0; i < fieldIds.length; i++) {
			if(i >= len && destOpenWindowCallbackFun._returnIds.length == fieldIds.length) {
				destOpenWindowCallbackFun._returnIds[i] += delim+fieldIds[i];
			}
			else {
				destOpenWindowCallbackFun._returnIds[i] = fieldIds[i];
			}
		}
		len = nameIds.length / 2; //必ず割り切れるはず
		for (i=0; i < nameIds.length; i++) {
			if(i >= len && destOpenWindowCallbackFun._returnNames.length == nameIds.length) {
				destOpenWindowCallbackFun._returnNames[i] += delim+nameIds[i];
			}
			else {
				destOpenWindowCallbackFun._returnNames[i] = nameIds[i];
			}
		}
		if(isStop) {
			for (i=0; i < fieldIds.length; i++) {
				fieldIds[i] = destOpenWindowCallbackFun._returnIds[i];
			}
			for (i=0; i < nameIds.length; i++) {
				nameIds[i] = destOpenWindowCallbackFun._returnNames[i];
			}
			destOpenWindowCallbackFun._returnIds = null;
			destOpenWindowCallbackFun._returnNames = null;
		}
		else {
			return;
		}
	}

	var ret = new Object();
	ret.returnFunction = destOpenWindowCallbackFun.returnFunction;
	var destIdfields = destOpenWindowCallbackFun.idFieldIds;
	var destNamefields = destOpenWindowCallbackFun.nameFieldIds;
	if (!isEmpty(fieldIds) && !isEmpty(destIdfields)) {
		var idLength = fieldIds.length / 2; //必ず割り切れるはず
		var i=0;
		var j=0;
		var len = destIdfields.length / 2; //必ず割り切れるはず
		for (i=0; i < len; i++) {
			for (j=0; j < idLength; j++) {
				if (destIdfields[len+i] == fieldIds[j]) {
					ret.filedId = destIdfields[i];
					ret.fieldValue = fieldIds[idLength+j];
					ret.isOk = true;
					destOpenWindowCallbackFun.returnOk(ret);
					j = fieldIds.length - 1;

				}
			}
			if (j != fieldIds.length) {
				alert("Can not find requested idProperty(" +
				destIdfields[len+i] +
				").\nThis error may be caused by setDataToOpenerLink() for id definition.");
				return false;
			}
		}
	}
	
	var i=0;
	var j=0;
	var len = 0;
	if (!isEmpty(nameIds) && !isEmpty(destNamefields)){ 
		len = destNamefields.length / 2; //必ず割り切れるはず
		var nameLength = nameIds.length / 2; //必ず割り切れるはず

		// 呼び元で指定されたプロパティIDを探して、
		// あればそれに該当する名称を呼び元にセットする
		for (i=0; i < len; i++) {
			for (j=0; j < nameLength; j++) {
				if (destNamefields[len+i] == nameIds[j]) {
					ret.filedId = destNamefields[i];
					ret.fieldValue = nameIds[nameLength+j];
					ret.isOk = true;
					destOpenWindowCallbackFun.returnOk(ret);
					j = nameIds.length - 1;
				}
			}
			if (j != nameIds.length) {
				alert("Can not find requested nameProperty(" +
				destNamefields[len+i] +
				").\nThis error may be caused by setDataToOpenerLink() for name definition.");
				return false;
			}
		}
	}

	window.close();
}

/* 
 * formobj上の一覧テーブルで、チェックボックスにチェックした行のデータ（IDと名称）を
 * それぞれ区切り文字列にして、呼び元の画面の該当箇所にセットする
 * 採用する名称プロパティIDが無い場合は名称のセットはしない。
 * @param formobj フォームオブジェクト
 * @param checkboxName チェックボックスのname
 * @param fieldIds マスタのID配列
 *            引数の指定は以下のように行う。
 *            new Array(propatyid, propatyid,propatyid･･･ , value, value･･･)
 *            配列の前半に名称のプロパティIDを入れる。後半に具体的な値を入れる。
 *            プロパティIDと値の個数は同じになっていることを前提とする。
 * @param nameIds マスタの名称配列 
 *            引数の指定は以下のように行う。
 *            new Array(propatyid, propatyid,propatyid･･･ , namevalue, namevalue･･･)
 *            配列の前半に名称のプロパティIDを入れる。後半に具体的な名称値を入れる。
 *            プロパティIDと名称値の個数は同じになっていることを前提とする。
 * @param delimiter 区切りに使用する文字
 */
function setDataToOpenerButton(formobj, checkboxName, radioName, linkName, delimiter){
	if(!destOpenWindowCallbackFun || !destOpenWindowCallbackFun.returnOk
		|| typeof(destOpenWindowCallbackFun.idFieldIds) == 'undefine'
		|| typeof(destOpenWindowCallbackFun.nameFieldIds) == 'undefine') {
		alert('No callback function from opener.');
		return;
	}
	if(!window.opener || window.opener.closed) {
		//既にopenerが閉じられていると思われる場合
		window.close();
		return;
	}
	var ret = new Object();
	ret.returnFunction = destOpenWindowCallbackFun.returnFunction;
	var destIdfields = destOpenWindowCallbackFun.idFieldIds;
	var destNamefields = destOpenWindowCallbackFun.nameFieldIds;

	linkName = 'SEL/LINK';
	if(isEmpty(linkName)){
		linkName = 'SEL/LINK';
	}
	var delim = ',';
	if(!isEmpty(delimiter)){
		delim = delimiter;
	}

	//if checked multi checkbox,then collect to next and set to parent at last item
	destOpenWindowCallbackFun._returnIds = new Array();
	destOpenWindowCallbackFun._returnNames = new Array();
	destOpenWindowCallbackFun._delimiter = delim;

	var lastindex = -1;
	var hasstoped = false;
	var links = document.getElementsByName('a_'+linkName);
	if(links && links.length > 0) {
		//search last item
		for(i = 0; i < links.length; ++i){
			id = links[i].id;
			ind = id.lastIndexOf('#');
			if(ind > 0) {
				id = id.substring(ind+1);
			}
			var obj = document.getElementById('C_'+checkboxName+'#'+id);
			if(!obj) {
				obj = document.getElementById('R_'+radioName+'_0#'+id);
			}
			if(obj && obj.checked) {
				lastindex = i;
			}
		}
		for(i = 0; lastindex >= 0 && i < links.length; ++i){
			id = links[i].id;
			ind = id.lastIndexOf('#');
			if(ind > 0) {
				id = id.substring(ind+1);
			}
			var obj = document.getElementById('C_'+checkboxName+'#'+id);
			if(!obj) {
				obj = document.getElementById('R_'+radioName+'_0#'+id);
				if(obj && obj.checked) {
					destOpenWindowCallbackFun._returnStop = true;
					links[i].onclick();
					break;
				}
			}
			if(obj && obj.checked) {
				if(lastindex == i) {
					destOpenWindowCallbackFun._returnStop = true;
				}
				var ret = links[i].onclick();
				//if canceled for some reason, stop
				if(typeof(ret) == 'boolean' && !ret) {
					hasstoped = true;
					break;
				}
			}
		}
	}
	if(lastindex < 0) {
		alert(getLanguage('M0005'));
		return;
	}
	if(!hasstoped) {
		window.close();
	}
	destOpenWindowCallbackFun._returnIds = null;
	destOpenWindowCallbackFun._returnNames = null;
	destOpenWindowCallbackFun._delimiter = null;
}

//event by SupTemp
function radio_clk(obj, hiddenname) {
	var v=document.getElementById(hiddenname);
	v.value=obj.value;
	if(v.onchange) {
		v.related=obj;
		v.onchange();
	}
}
function check_clk(obj, hiddenname) {
	var v=document.getElementById(hiddenname);
	v.checked=obj.checked;
	//if not checked,then ""
	v.value=(obj.checked?obj.value:'');
}
function list_chg(obj, hiddenname) {
	var val=new Array();
	for(var i=0; i<obj.length; i++) {
		if(obj.options[i].selected) {
			val.push(obj.options[i].value);
		}
	}
	document.getElementById(hiddenname).value=val.join(',');
}





var _g_sitemsg_waittime = 60;
/* call at onload */
function siteMsgStart(waittime) {
  if(waittime) _g_sitemsg_waittime = waittime;
  postAjax(msg_callback_fun, AP_URL_INDEX+'?st_ajax=getchatinvite');
}
function getMsgDiv() {
  var o = byId('_g_SiteMsg');
  if(!o) {
    o = document.createElement('div');
    o.id = '_g_SiteMsg';
    o.innerHTML = '';
    o.style.cssText = 'position:absolute;z-index:9999998;left:1px;top:1px;background-color:#EEE;cursor:pointer;';
    o.onclick = function(){
      o.innerHTML = '';
      o.title = '';
      window.open(AP_URL_INDEX + '?st_p1=&st_p2=static::s_chatroom', 'st_ChatRoom_SYS');
    };
    document.body.appendChild(o);
  }
  return o;
}
function msg_callback_fun(xml, objxml) {
  var o = getMsgDiv();
  if(!objxml || objxml.childNodes.length < 1 || objxml.childNodes[0] == null || objxml.childNodes[0].tagName != 'methodResponse') {
    //o.innerHTML = '<img src="images/icon_warning.gif" />';
    //o.title = 'cannot get site message:'+xml;
    o.innerHTML = '';
    o.title = '';
    setTimeout('siteMsgStart()', 1000 * _g_sitemsg_waittime);
    return;
  }

  if(xml.indexOf('<status>OK</status>') >= 0) {
    var tags = objxml.getElementsByTagName('recordcount');
    if(tags && tags.length == 1 && tags[0].childNodes.length == 1) {
      var cnt = tags[0].childNodes[0].nodeValue/1;
      if(cnt > 0) {
        //o.innerHTML = '<img src="images/newmsg.gif" />';
        //o.title = 'You have message:'+cnt;
        o.innerHTML = '<img src="images/newmsg.gif" />';
        o.title = 'You Have a Chat Invite.';
      }
      else {
        o.innerHTML = '';
        o.title = '';
      }
    }
  }
  else {
    o.innerHTML = '';
    o.title = '';
  }
  setTimeout('siteMsgStart()', 1000 * _g_sitemsg_waittime);
}


//20130528 for float embedpage
var _last_scroll_embedpage_tl = ['','','',''];
function scroll_embedpage(e) {
  var dh = document.documentElement.clientHeight ? document.documentElement.clientHeight : document.body.clientHeight;
  var dw = document.documentElement.clientWidth ? document.documentElement.clientWidth : document.body.clientWidth;
  var r = new Array('_g_EMBEDPAGE1', '_g_EMBEDPAGE2', '_g_EMBEDPAGE3', '_g_EMBEDPAGE4'); //top,right,bottom,left
  var need_scroll = false;
  for(tt in r){
    var o = document.getElementById(r[tt]);
    if(!o) continue;
    var left;
    var top;
    var align = o.getAttribute('palign');
    var pspeed = o.getAttribute('pspeed')/1;
    if(align == '' || align == '0') {
      align = 'Center';
    }
    if(r[tt] == '_g_EMBEDPAGE2' || r[tt] == '_g_EMBEDPAGE4') { //right,left
      //left or right
      if(r[tt] == '_g_EMBEDPAGE4') {
        left = 1;
      }
      else {
        left = dw - o.clientWidth - 1;
      }
      if(align == 'Top') {
        top = 1;
      }
      else if(align == 'Center') {
        top = dh/2 - o.clientHeight/2 - 1;
      }
      else if(align == 'Bottom') {
        top = dh - o.clientHeight - 1;
      }
    }

    else if(r[tt] == '_g_EMBEDPAGE1' || r[tt] == '_g_EMBEDPAGE3') { //top,bottom
      //left or right
      if(r[tt] == '_g_EMBEDPAGE1') {
        top = 1;
      }
      else {
        top = dh - o.clientHeight - 1;
        if(top < 0) {
          top = 0;
        }
      }
      if(align == 'Left') {
        left = 1;
      }
      else if(align == 'Center') {
        left = (dw - o.clientWidth)/2;
      }
      else if(align == 'Right') {
        left = dw - o.clientWidth - 1;
      }
    }
    if(top < 0) {
      top = 0;
    }
    if(left < 0) {
      left = 0;
      }

    var ol = o.style.left.replace('px', '')/1;
    var ot = o.style.top.replace('px', '')/1;
    if(ot != top || ol != left) {
      if(o.style.display == 'none') {
        o.style.left = left + 'px';
        o.style.top = top + 'px';
        o.style.display = 'block';
      }
      else {
        var step = parseInt(Math.abs(left - ol)/pspeed);
        if(step == 0 || Math.abs(left - ol) < step) step = Math.abs(left - ol);
        if(ol > left) step =  -1 * step;
        o.style.left = (ol + step) + 'px';

        step = parseInt(Math.abs(top - ot)/pspeed);
        if(step == 0 || Math.abs(top - ot) < step) step = Math.abs(top - ot);
        if(ot > top) step =  -1 * step;
        o.style.top = (ot + step) + 'px';
      }
      if(_last_scroll_embedpage_tl[tt] != o.style.left + '/' + o.style.top) {
        need_scroll = true;
        _last_scroll_embedpage_tl[tt] = o.style.left + '/' + o.style.top;
      }
    }
  }
  if(need_scroll) {
    clearTimeout(g_scroll_timer);
    g_scroll_timer = setTimeout('scroll_embedpage()', 50);
  }
}
function scroll_embedpage_ext(id) {
  var op = byId('_g_EMBEDPAGE'+id+'SUB');
  if(op) {
    var save = 0;
    if(op.style.cssText == '') {
      save = 1;
      if(id == 1 || id == 3) {
        op.style.cssText = "width:100%;height:0px;overflow-y:hidden;";
      }
      else {
        op.style.cssText = "width:0px;height:100%;overflow-x:hidden;";
      }
      var oi = byId('_g_EMBEDPAGE'+id+'I');
      if(id == 1 || id == 2) {
        oi.src = oi.src.replace('icon_minus4', 'icon_plus4').replace('icon_right4', 'icon_left4');
      }
      else {
        oi.src = oi.src.replace('icon_plus4', 'icon_minus4').replace('icon_left4', 'icon_right4');
      }
    }
    else {
      save = 0;
      op.style.cssText = "";
      var oi = byId('_g_EMBEDPAGE'+id+'I');
      if(id == 1 || id == 2) {
        oi.src = oi.src.replace('icon_plus4', 'icon_minus4').replace('icon_left4', 'icon_right4');
      }
      else {
        oi.src = oi.src.replace('icon_minus4', 'icon_plus4').replace('icon_right4', 'icon_left4');
      }
    }
    var pcookie = op.getAttribute('pcookie');
    if(pcookie) {
      setcookie(pcookie+id, save, 24*365, AP_URL_ROOT);
      setcookie(pcookie+id, save, 24*365, '/');
      setcookie(pcookie+id, save, 24*365, false);
    }
    g_scroll_timer = setTimeout('scroll_embedpage()', 50);
  }
}

/*
 * for panel(menu module with follower=yesscroll) to auto scroll top-bottom
 */
function scroll_topbottom() {
  var st = 0 + ( document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop );
  var dh = document.documentElement.clientHeight ? document.documentElement.clientHeight : document.body.clientHeight;

  if(!window._gscrolltb) {
    window._gscrolltb = new Array();
    var odiv = document.getElementsByTagName('div');
    for(var i=0; i<odiv.length; i++) {
      if(odiv[i].getAttribute('st_scrolltb')) {
        window._gscrolltb[window._gscrolltb.length] = odiv[i];
      }
    }
    for(var i=0; i<window._gscrolltb.length; i++) {
      var obj0 = window._gscrolltb[i];
      obj0._scroll_chg = document.createElement('div');
      obj0._scroll_chg.style.cssText = 'height:0px;';
      obj0.parentNode.insertBefore(obj0._scroll_chg, obj0);
    }
  }
  for(var i=0; i<window._gscrolltb.length; i++) {
    var obj0 = window._gscrolltb[i];
    var obj = obj0._scroll_chg;
    var oh = obj0.clientHeight;
    var pt = calPos(obj.parentNode)[1];
    var ph = obj.parentNode.clientHeight;
    if(oh >= ph) {
      continue;
    }
    if(st <= pt) {
      if(obj.style.height != '0px') {
        obj.style.height = '0px';
      }
      continue;
    }
    ot = 0;
    if(oh > dh) {
      if(st + dh > pt + oh) {
        ot = st + dh - pt - oh;
        if(ot > ph - oh) {
          ot = ph - oh;
        }
      }
      else {
        ot = 0;
      }
    }
    else {
      if(st - pt + oh < ph) {
        ot = st - pt;
      }
      else {
        ot = ph - oh;
      }
    }
    if(ot + oh > ph - 1) {
      ot = ph - oh - 1;
    }
    obj.style.height = ot + 'px';
  }
}

function stOnloadSelMenu(id) {
    var ok = 0;
    var obj = byId(id);
    if(obj && obj.className) {
      obj.className = obj.className.replace(/(m_nor_mof)/g, 'm_sel_mof').replace(/(m_nor_mon)/g, 'm_sel_mon');
      ok = 1;
      if(obj.className.indexOf(' tree_') != -1) {
        while(obj.getAttribute('_pid')) {
          id = obj.getAttribute('_pid');
          obj = byId(id);
          obj2 = byId(id+'sub');
          if(obj && obj2 && obj2.style.display == 'none') {
            obj.className = obj.className.replace(/(m_nor_mof)/g, 'm_sel_mof').replace(/(m_nor_mon)/g, 'm_sel_mon');
          }
        }
      }
      else {
        while(obj.getAttribute('_pid')) {
          id = obj.getAttribute('_pid');
          obj = byId(id);
          if(obj && obj.className) {
            obj.className = obj.className.replace(/(m_nor_mof)/g, 'm_sel_mof').replace(/(m_nor_mon)/g, 'm_sel_mon');
          }
        }
      }
    }
    return ok;
}

/* called while page loaded */
function stOnload() {
  if(typeof(UUHEdts) == 'object') {
    var UUHEdtUpload = {
      name : 'UUHEdtUpload',
      buttons : {
        'upload' : {iconx : 9, icony : 6, name : 'Upload'}
      },
      onButtonClick : function(editor, pluginname, btnid, btnobj) {
        var btn = this.buttons[btnid];
        var s = '<div title="'+btn.name+'" style="display:none;width:600px;"><div title="">'
              + '<iframe id="'+editor.id+'_upload" style="height:100%;width:100%;scroll:auto;" frameborder="0"></iframe></div></div>';
        editor.openWin(btnobj, btn.name, s, 600, 320, '', true);
        var o = document.getElementById(editor.id+'_upload');
        var url = '?st_p1=static::s_upload';
        if(editor.UploadKey) {
          url += '&uploadkey='+editor.UploadKey;
        }
        o.contentWindow.document.location.href = url;
        g_last_editor = editor;
      }
    };
    UUHEdts.addPlugin(UUHEdtUpload.name, UUHEdtUpload);
  }

  //for printSidePanel changed width while show/hide, replace this
  var spanspanel = document.getElementsByTagName("span");
  for(var ind in spanspanel) {
    if(spanspanel[ind] && spanspanel[ind].className == 'expand_down' && spanspanel[ind].click) {
      spanspanel[ind].click();
      spanspanel[ind].click();
    }
  }

  try{doPageSetCancel();}catch(e){}

  /* make selected menu */
  var ok = 0;
  var obj = byId('st_m');
  if(obj && obj.value != '') {
    var id = 'm'+obj.value;
    ok = stOnloadSelMenu(id);
  }

  if(ok == 0) {
    var p1obj = byId('st_p1');
    var p2obj = byId('st_p2');
    var p1 = (p1obj && p1obj.value) ? p1obj.value : '';
    var p2 = (p2obj && p2obj.value) ? p2obj.value : '';
    if(p1 != '' || p2 != '') {
      var els = document.getElementsByTagName('a');
      for(i = 0; i < els.length; ++i){
        var obj = els[i];
        if(obj && obj.href && obj.onclick) {
          var href = (obj.href + '&').replace('.html', '').replace(/[\?]/, '&').replace(/[\.]/g, '=').replace(/[\/]/g, '&');
          var ind1 = (p1=='' ? 0 : href.indexOf('&st_p1='+p1+'&'));
          var ind2 = (p2=='' ? -1 : href.indexOf('&st_p2='+p2+'&'));
          //http:&&localhost:9907&st_l=en&st_p1=st_news_index&&st_p2=&st_m=13-3&
          if(ind1 >= 0 && (ind2 >= 0 || (p2 == '' && (href.indexOf('&st_p2=') < 0 || href.indexOf('&st_p2=&') >= 0)))) {
            while(obj.parentNode) {
              obj = obj.parentNode;
              if((obj.tagName == 'TR' || obj.tagName == 'TABLE') && obj.id && obj.className) {
                break;
              }
            }
            if(obj.className && obj.id) {
              stOnloadSelMenu(obj.id);
              break;
            }
          }
        }
      }
    }
  }
}

function getNode(tagname, elehtml, eleclass, att1, att1txt, att2, att2txt, att3, att3txt) {
  var g_Arr = new Array();
  var divs = document.getElementsByTagName(tagname);
  for(i = 0; i < divs.length; i++) {
    if( (!att1 || divs[i].getAttribute(att1) == att1txt)
        && (!att2 || divs[i].getAttribute(att2) == att2txt)
        && (!att3 || divs[i].getAttribute(att3) == att3txt)
        && (!eleclass || divs[i].getAttribute('class') == eleclass)
        && (!elehtml || divs[i].innerHTML.indexOf(elehtml) >= 0)) {
      g_Arr[g_Arr.length] = divs[i];
    }
  }
  return g_Arr;
}

function getHtmlTag(s, sStart1, sEnd1, sStart2, sEnd2) {
  var ind1 = s.indexOf(sStart1);
  var ind2 = s.indexOf(sEnd1, ind1 + sStart1.length);
  if(ind1 > 0 && ind2 > ind1) {
    s = s.substring(ind1 + sStart1.length, ind2);
    if(sStart2) {
      ind1 = s.indexOf(sStart2);
      if(ind1 < 0) {
        return false;
      }
      s = s.substring(ind1 + sStart2.length);
    }
    if(sEnd2) {
      ind1 = s.indexOf(sEnd2);
      if(ind1 < 0) {
        return false;
      }
      s = s.substring(0, ind1);
    }
    return s;
  }
  return false;
}

function getContOne(s, sStart1, sEnd1, hasCont1, sStart2, sEnd2, hasCont2, sStart3, sEnd3, hasCont3) {
	if(!sStart1) sStart1 = '';
	if(!sEnd1) sEnd1 = '';
	var ind1 = (!sStart1 || sStart1 == '') ? 0 : s.indexOf(sStart1);
	if(ind1 < 0) {
		return false;
	}
	var ind2 = (!sEnd1 || sEnd1 == '') ? s.length : s.indexOf(sEnd1, ind1 + sStart1.length);
	if(ind2 < 0) {
		return false;
	}

	var s = s.substring(ind1 + sStart1.length, ind2);
	if(hasCont1 && hasCont1 != '' && s.indexOf(hasCont1) < 0) {
		return false;
	}

	if(sStart2 && sStart2 != '') {
		ind1 = s.indexOf(sStart2);
		if(ind1 < 0) {
			return false;
		}
		s = s.substring(ind1 + sStart2.length);
	}
	if(sEnd2 && sEnd2 != '') {
		ind1 = s.indexOf(sEnd2);
		if(ind1 < 0) {
			return false;
		}
		s = s.substring(0, ind1);
	}
	if(hasCont2 && hasCont2 != '' && s.indexOf(hasCont2) < 0) {
		return false;
	}
	if(sStart3 && sStart3 != '') {
		ind1 = s.indexOf(sStart3);
		if(ind1 < 0) {
			return false;
		}
		s = s.substring(ind1 + sStart3.length);
	}
	if(sEnd3 && sEnd3 != '') {
		ind1 = s.indexOf(sEnd3);
		if(ind1 < 0) {
			return false;
		}
		s = s.substring(0, ind1);
	}
	if(hasCont3 && hasCont3 != '' && s.indexOf(hasCont3) < 0) {
		return false;
	}
	return s;
}
function getContArr(s, sAllStart, sAllEnd, sStart1, sEnd1, hasCont1, sStart2, sEnd2, hasCont2, sStart3, sEnd3, hasCont3) {
	var ret = [];
	if(sAllStart && sAllStart != '') {
		var ind1 = s.indexOf(sAllStart);
		if(ind1 < 0) {
			return ret;
		}
		s = s.substring(ind1 + sAllStart.length);
	}
	if(sAllEnd && sAllEnd != '') {
		var ind1 = s.indexOf(sAllEnd);
		if(ind1 < 0) {
			return ret;
		}
		s = s.substring(0, ind1);
	}
	var ind0 = 0;
	while(true) {
		var ind1 = s.indexOf(sStart1, ind0);
		var ind2 = s.indexOf(sEnd1, ind1 + sStart1.length);
		if(ind1 > 0 && ind2 > ind1) {
			ind0 = ind2 + sEnd1.length;
			var s2 = s.substring(ind1 + sStart1.length, ind2);
			if(!hasCont1 || hasCont1 == '' || s2.indexOf(hasCont1) >= 0) {
				s2 = getContOne(s2, sStart2, sEnd2, hasCont2, sStart3, sEnd3, hasCont3);
				if(s2 !== false) {
					ret.push(s2);
				}
			}
		}
		else {
			break;
		}
	}
	return ret;
}

function callback(callback, time) {
  if(!time) time = 10;
  setTimeout(callback, time);
}
