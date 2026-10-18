/************************
 *
 *WCM模板网页中常用的工具方法
 *@addTime		:2014年5月28日9:06:55
 *@updateTime	:2014年9月5日10:50:39
 *@author		:hc
 *
 *
 *@function	函数功能说明
 *wcmUtil.$time()--------------------------------获取系统当前时间
 *wcmUtil.$random(min,max)-----------------------获取一个min~max间的随机数
 *wcmUtil.getObject(objId)-----------------------获取id为objId的DOM对象(兼容性更好)
 *wcmUtil.createPageHTML(_nPageCount, _nCurrIndex, _sPageName, _sPageExt)---------TRS分页置标 显示10个分页标签
 *wcmUtil.createPageHTML5(_nPageCount, _nCurrIndex, _sPageName, _sPageExt)---------TRS分页置标 显示5个分页标签
 *wcmUtil.createPageHTML(_nPageCount, _nCurrIndex, _sPageName, _sPageExt)---------TRS分页置标 仅显示首页、上一页、下一页、尾页。
 *wcmUtil.JSAddFavorite(thisURL,URLname)---------添加到收藏夹方法，兼容火狐、IE等主流浏览器
 *wcmUtil.setTheHomePage(thisURL)----------------设为首页方法，需在页面添加homepageId的DOM元素ID
 *wcmUtil.setCurDateForElement(elementId,isShowTime,isRefresh)----------------设置系统当前时间
 *************************/

var wcmUtil = new Object();
wcmUtil = {
	version:'1.2',
	author:'hc',
	createTime:'2014年5月28日9:06:55',
	isIE : !!window.ActiveXObject,  
	isIE6 : wcmUtil.isIE && !window.XMLHttpRequest, 
	isIE8 : wcmUtil.isIE && !!document.documentMode,
	isIE7 : wcmUtil.isIE && !wcmUtil.isIE6 && !wcmUtil.isIE8,
	$time : Date.now || function(){
		return +new Date;
	},
	$random:function(min, max){
		return Math.floor(Math.random() * (max - min + 1) + min);
	},
	getObject : function(objectId) {
		if(document.getElementById && document.getElementById(objectId)) {
		// W3C DOM
		return document.getElementById(objectId);
		} else if (document.all && document.all(objectId)) {
		// MSIE 4 DOM
		return document.all(objectId);
		} else if (document.layers && document.layers[objectId]) {
		// NN 4 DOM
		return document.layers[objectId];
		} else {
		return false;
		}
	},
	createPageHTML : function(_nPageCount, _nCurrIndex, _sPageName, _sPageExt){
		if(_nPageCount == null || _nPageCount<=1){//如果总页数小于1页则不输出分页项
			return;
		}
		var startNum =1;//记录显示的第一页位置
		var endNum = _nPageCount<9?_nPageCount:9;//记录显示的最后一页位置
		var nCurrIndex = _nCurrIndex || 0;//这句基本的点多余
		//document.write("<div class='kf_listPage'>");
		if(_nPageCount>=2&&nCurrIndex>=1){//判断输出上一页
			document.write("<a class='kf_pageNext'  href=\""+_sPageName+ "."+_sPageExt+"\">首页</a>&nbsp;");
			if(nCurrIndex==1){
				document.write("<a class='kf_pageNext'  href=\""+_sPageName+ "."+_sPageExt+"\">上一页</a>&nbsp;");
			}else{
				document.write("<a class='kf_pageNext'  href=\""+_sPageName+"_" + (nCurrIndex-1) + "."+_sPageExt+"\">上一页</a>&nbsp;");
			}
		}
		
		if(nCurrIndex == 0)
			document.write("<a class='on' href='javascript:;' >1</a>&nbsp;");
		else if(nCurrIndex<5)
			document.write("<a href=\""+_sPageName+"."+_sPageExt+"\">1</a>&nbsp;");
		
		if(_nPageCount>=9&&nCurrIndex>=5){//如果总分页数大于11页，则仅显示当前页前后5条数据
			endNum = nCurrIndex-0+5>_nPageCount?_nPageCount:nCurrIndex-0+5;
		}
		if(nCurrIndex>4){
			startNum = nCurrIndex-4;
		}
		for(var i=startNum;i<endNum; i++){//循环输出页码数
			if(nCurrIndex == i)
				document.write("<a  class='on' href='javascript:;' >"+(i-0+1) + "</a>&nbsp;");
			else
				document.write("<a  href=\""+_sPageName+"_" + i + "."+_sPageExt+"\" >"+(i-0+1)+"</a>&nbsp;");
		}
		if(_nPageCount>=2&&_nCurrIndex!=_nPageCount-1){//判断输出下一页标识
		//alert("nCurrIndex:"+nCurrIndex);
			document.write("<a class='kf_pageNext'  href='"+_sPageName+"_"+ (_nCurrIndex-0+1) +"."+_sPageExt+"'>下一页</a>&nbsp;");
			document.write("<a class='kf_pageNext'  href=\""+_sPageName+"_" + (_nPageCount-1) + "."+_sPageExt+"\">尾页</a>&nbsp;");
			
		}
		document.write("<div class='clear'></div></div>");
	},
	createPageHTML5 : function(_nPageCount, _nCurrIndex, _sPageName, _sPageExt){
		if(_nPageCount == null || _nPageCount<=1){//如果总页数小于1页则不输出分页项
			return;
		}
		var startNum =1;//记录显示的第一页位置
		var endNum = _nPageCount<5?_nPageCount:5;//记录显示的最后一页位置
		var nCurrIndex = _nCurrIndex || 0;//这句基本的点多余
		//document.write("<div class='kf_listPage'>");
		if(_nPageCount>=2&&nCurrIndex>=1){//判断输出上一页
			document.write("<a class='kf_pageNext'  href=\""+_sPageName+ "."+_sPageExt+"\">首页</a>&nbsp;");
			if(nCurrIndex==1){
				document.write("<a class='kf_pageNext'  href=\""+_sPageName+ "."+_sPageExt+"\">上一页</a>&nbsp;");
			}else{
				document.write("<a class='kf_pageNext'  href=\""+_sPageName+"_" + (nCurrIndex-1) + "."+_sPageExt+"\">上一页</a>&nbsp;");
			}
		}
		
		if(nCurrIndex == 0)
			document.write("<a class='on' href='javascript:;' >1</a>&nbsp;");
			
		if(nCurrIndex == 1 || nCurrIndex == 2)
			document.write("<a  href=\""+_sPageName+"."+_sPageExt+"\">1</a>&nbsp;");
			
		if(_nPageCount>=5&&nCurrIndex>=3){
			endNum = nCurrIndex-0+3>_nPageCount?_nPageCount:nCurrIndex-0+3;
		}
		if(nCurrIndex>2){
			startNum = nCurrIndex-2;
		}
		for(var i=startNum;i<endNum; i++){//循环输出页码数
			if(nCurrIndex == i)
				document.write("<a  class='on' href='javascript:;' >"+(i-0+1) + "</a>&nbsp;");
			else
				document.write("<a  href=\""+_sPageName+"_" + i + "."+_sPageExt+"\" >"+(i-0+1)+"</a>&nbsp;");
		}
		if(_nPageCount>=2&&_nCurrIndex!=_nPageCount-1){//判断输出下一页标识
		//alert("nCurrIndex:"+nCurrIndex);
			document.write("<a  href='"+_sPageName+"_"+ (_nCurrIndex-0+1) +"."+_sPageExt+"'>下一页</a>&nbsp;");
			document.write("<a  href=\""+_sPageName+"_" + (_nPageCount-1) + "."+_sPageExt+"\">尾页</a>&nbsp;");
			
		}
		document.write("<div class='clear'></div></div>");
	},
	createPage: function(_nPageCount, _nCurrIndex, _sPageName, _sPageExt){
		if(_nPageCount == null || _nPageCount<=1){//如果总页数小于1页则不输出分页项
			return;
		}
		var nCurrIndex = _nCurrIndex || 0;//这句基本的点多余
		var totalcount = $("#datacount").val();
		document.write("<div class='pagebreak'><span class='fl'>共<font>"+totalcount+"</font>条记录 &nbsp;&nbsp;<font>"+parseInt(nCurrIndex*1+1)+"</font>/<font>"+_nPageCount+"</font>页 &nbsp;&nbsp;");
		if(_nPageCount>=2&&nCurrIndex>=1){//判断输出上一页
			document.write("<a  href=\""+_sPageName+ "."+_sPageExt+"\">首页</a>&nbsp;");
			if(nCurrIndex==1){
				document.write("<a class='kf_pageNext'  href=\""+_sPageName+ "."+_sPageExt+"\">上一页</a>&nbsp;");
			}else{
				document.write("<a class='kf_pageNext'  href=\""+_sPageName+"_" + (nCurrIndex-1) + "."+_sPageExt+"\">上一页</a>&nbsp;");
			}
		}else{
			//document.write("<a class='kf_pageNext'  href='javascript:void(0)'>首页</a>&nbsp;");
			document.write("<a class='kf_pageNext'  href='javascript:void(0)'>上一页</a>&nbsp;");
		}
		if(_nPageCount>=2&&_nCurrIndex!=_nPageCount-1){//判断输出下一页标识
		//alert("nCurrIndex:"+nCurrIndex);
			document.write("<a class='kf_pageNext'  href='"+_sPageName+"_"+ (_nCurrIndex-0+1) +"."+_sPageExt+"'>下一页</a>&nbsp;");
			document.write("<a class='kf_pageNext'  href=\""+_sPageName+"_" + (_nPageCount-1) + "."+_sPageExt+"\">尾页</a>&nbsp;");
		}else{
			document.write("<a class='kf_pageNext'  href='javascript:void(0)'>下一页</a>&nbsp;");
			document.write("<a class='kf_pageNext'  href='javascript:void(0)'>尾页</a>&nbsp;");
		}
		document.write("<div class='clear'></div></div>");
	},
	JSAddFavorite : function(thisURL,URLname){
		if ( window.sidebar && "object" == typeof( window.sidebar ) && "function" == typeof( window.sidebar.addPanel ) )
		{
				//  firefox
				window.sidebar.addPanel(URLname,thisURL,'');
		}
		else if ( document.all && "object" == typeof( window.external ) )
		{
				//  ie                
				window.external.addfavorite(thisURL,URLname);
		}
	},
	setTheHomePage : function(thisURL)
	{
		if(wcmUtil.isIE){
			var ele = wcmUtil.getObject('homepageId');
			var strHref=window.location.href;
			ele.style.behavior='url(#default#homepage)';
			ele.setHomePage(thisURL);	
		}else{
			try {  
			  netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");  
			}  
			catch (e)  
			{  
			  alert("this operation is refused!'");  
			}
			var prefs = Components.classes['@mozilla.org/preferences-service;1'].getService(Components.interfaces.nsIPrefBranch);
			prefs.setCharPref('browser.startup.homepage',thisURL);	
		}
	},
	/****
	 *@param elementId:日期显示的ID
	 *@param isShowTime:是否显示时间否则显示格式为：yyyy年MM月dd日 星期*
	 *@param isRefresh:显示时间的时候是否自动间隔一秒钟刷新当前时间
	***/
	setCurDateForElement :  function(elementId,isShowTime,isRefresh){
		//设置当前系统时间。
		var now = new Date();
		var year = now.getYear();
		year = (year<1900?(1900+year):year);
		var month = now.getMonth();
		var date = now.getDate();
		var day = now.getDay();
		var week;
		month = month+1;
		if(month<10)month="0"+month;
		if(date<10)date="0"+date;
		var arr_week = new Array("星期日","星期一","星期二","星期三","星期四","星期五","星期六");
		week = arr_week[day];
		var time = "";
		time = year+"年"+month+"月"+date+"日 "+week;
		if(isShowTime==true){
			var hour = now.getHours();
			var minu = now.getMinutes();
			var sec = now.getSeconds();
			if(hour<10)hour="0"+hour;
			if(minu<10)minu="0"+minu;
			if(sec<10)sec="0"+sec;
			time += " "+hour+"："+minu+"："+sec;
		}
		if(document.all){
			wcmUtil.getObject(elementId).innerHTML=time;
		}
		if(isRefresh==true &&isShowTime){
			var timer = setTimeout("wcmUtil.setCurDateForElement('"+elementId+"',"+isShowTime+","+isRefresh+")",1000);
		}
	}
}

//去除字符串的前后空白
String.prototype.trim = function(){
      return this.replace(/(^\s*)|(\s*$)/g,"");
}
//判断字符串是否全为数字
String.prototype.IsNum = function(){
    var reg = /^\d+$/g;
    return reg.test(this);
}
$(function(){
	$(".doctitle").each(function(){
		var doclink = $(this).attr("doclink");
		if(doclink!=""){
			$(this).attr("href",doclink);
			$(this).attr("target","_blank");
		}
	});
})
