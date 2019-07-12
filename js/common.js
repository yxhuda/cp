﻿﻿var aliyunOSS;
var imageFilter;
function OnInput(event,startLength, endlength, id) {
    if(event.srcElement.value.length >= startLength && event.srcElement.value.length <= endlength) {
        $("#" + id).html(event.srcElement.value.length);
    } else {
    	if(event.srcElement.value.length>endlength){
       		toast("内容过长，最多" + endlength + "字", 'warning');
       	} else if(event.srcElement.value.length<startLength){
       		toast("内容最少" + startLength + "字", 'warning');
       	}
        /*超出规定长度后禁止继续输入*/
        var value = event.srcElement.value.substring(0, endlength);
        $("#" + id).val(value);
    }
}

function loadAddress(){
	var url = "address/list.do";
	ajaxRequest(url,{},function(ret,err){
		if(ret.code==1){
			if(isNotNull(ret.address)){
				var addressList = ret.address;
				for(var i=0;i<addressList.length;i++){
					if(addressList[i].isDefault==1){
						setCacheData("addressData",addressList[i]);
					}
				}
			}
		}
	});
}
function isNotNull(tmp) {

	if ($.trim(tmp) != null && $.trim(tmp) != undefined && $.trim(tmp) != "null" && $.trim(tmp) != "undefined" && $.trim(tmp) != "" && $.trim(tmp) != '')
		return true;
	else
		return false;
}

function changeOSSImg(path,w,h){
	if(!isNotNull(w)){
		if(api.systemType == 'ios'){
			w = 40;
		}else{
			w = 80;
		}
	}
	if(!isNotNull(h)){
		if(api.systemType == 'ios'){
			h = 40;
		}else{
			h = 80;
		}
	}
	return path+'?x-oss-process=image/resize,limit_0,m_fill,w_'+w+',h_'+h;
}


function notification(message) {
	api.notification({
		notify : {
			content : message
		},
		vibrate : [100]
	}, function(ret, err) {
	});
}
function formatTime(shijianchuo)
{
	//shijianchuo是整数，否则要parseInt转换
	var time = new Date(shijianchuo);
	var y = time.getFullYear();
	var m = time.getMonth()+1;
	var d = time.getDate();
	var h = time.getHours();
	var mm = time.getMinutes();
	var s = time.getSeconds();
	return y+'-'+add0(m)+'-'+add0(d)+' '+add0(h)+':'+add0(mm)+':'+add0(s);
}

function add0(m){return m<10?'0'+m:m }



function hideMoreLine(data)
{
	for (var i = 0; i < data.length; i++) {
		var divH = $("#invite-content_" + data[i]['id']).height();
		var tmpH = $("#hinvite-content_" + data[i]['id']).height();
		if (divH > (tmpH*2)) {
			$("#content_" + data[i]['id']).show();
			$("#invite-content_" + data[i]['id']).addClass('invite-content');
			$("#invite-content_" + data[i]['id']).removeClass('on');
		} else {
			$("#content_" + data[i]['id']).hide();
		}
	}
}

function textlength(res) {
    var len = 0;
    for (var i=0; i<res.length; i++) {
        var c = res.charCodeAt(i);
        //单字节加1
        if ((c >= 0x0001 && c <= 0x007e) || (0xff60<=c && c<=0xff9f)) {
            len++;
        }
        else {
            len+=2;
        }
    }
   return len;
};

function changeImg(src,w,h){
	if(!isNotNull(w))
		w = 300;
	if(!isNotNull(h))
		h = 300;
	return src+'?x-oss-process=image/resize,limit_0,m_fill,w_'+w+',h_'+h+'/quality,q_100';
}

function substring(str,length) {
	var len = str.length;
	if(!isNotNull(length))
	 length = 3
	//当前HTML对象text的长度
	if (len > length) {
		str = str.substring(0, length) + "..";
		//使用字符串截取，获取前3个字符，多余的字符使用“......”代替
	}
	return str;
}

function substring1(str,length) {
	var len = str.length;
	if(!isNotNull(length))
	 length = 3
	//当前HTML对象text的长度
	if (len > length) {
		str = str.substring(0, length);
		//使用字符串截取，获取前3个字符，多余的字符使用“......”代替
	}
	return str;
}

function selectImageList(number,index) {
	if(!isNotNull(number)){
		number = 3;
	}

	var UIMediaScanner = api.require('UIMediaScanner');
	UIMediaScanner.open({
		type : 'picture',
		column : 4,
		classify : true,
		max :number,
		sort : {
			key : 'time',
			order : 'desc'
		},
		texts : {
			stateText : '已选择*项',
			cancelText : '取消',
			finishText : '完成'
		},
		styles : {
			bg : '#fff',
			mark : {
				icon : '',
				position : 'bottom_left',
				size : 20
			},
			nav : {
				bg : '#eee',
				stateColor : '#000',
				stateSize : 18,
				cancelBg : 'rgba(0,0,0,0)',
				cancelColor : '#000',
				cancelSize : 18,
				finishBg : 'rgba(0,0,0,0)',
				finishColor : '#000',
				finishSize : 18
			}
		},
		scrollToBottom : {
			intervalTime : 3,
			anim : true
		},
		exchange : true,
		rotation : true
	}, function(ret) {

		if (ret) {
			if(ret.eventType == 'albumError'){
				toast('暂未开启相册权限，请手动开启');
			}

			api.sendEvent({
				name : 'cheangeImgList',
				extra : {
					imgList : ret,
					index:index
				}
			});
		}
	});
}

function biaoqing() {
	var emoData = [{
		"name" : "Expression_1",
		"text" : "[微笑]"
	}, {
		"name" : "Expression_2",
		"text" : "[撇嘴]"
	}, {
		"name" : "Expression_3",
		"text" : "[色]"
	}, {
		"name" : "Expression_4",
		"text" : "[发呆]"
	}, {
		"name" : "Expression_5",
		"text" : "[得意]"
	}, {
		"name" : "Expression_6",
		"text" : "[流泪]"
	}, {
		"name" : "Expression_7",
		"text" : "[害羞]"
	}, {
		"name" : "Expression_8",
		"text" : "[闭嘴]"
	}, {
		"name" : "Expression_9",
		"text" : "[睡]"
	}, {
		"name" : "Expression_10",
		"text" : "[大哭]"
	}, {
		"name" : "Expression_11",
		"text" : "[尴尬]"
	}, {
		"name" : "Expression_12",
		"text" : "[发怒]"
	}, {
		"name" : "Expression_13",
		"text" : "[调皮]"
	}, {
		"name" : "Expression_14",
		"text" : "[呲牙]"
	}, {
		"name" : "Expression_15",
		"text" : "[惊讶]"
	}, {
		"name" : "Expression_16",
		"text" : "[难过]"
	}, {
		"name" : "Expression_17",
		"text" : "[酷]"
	}, {
		"name" : "Expression_18",
		"text" : "[冷汗]"
	}, {
		"name" : "Expression_19",
		"text" : "[抓狂]"
	}, {
		"name" : "Expression_20",
		"text" : "[吐]"
	}, {
		"name" : "Expression_21",
		"text" : "[偷笑]"
	}, {
		"name" : "Expression_22",
		"text" : "[愉快]"
	}, {
		"name" : "Expression_23",
		"text" : "[白眼]"
	}, {
		"name" : "Expression_24",
		"text" : "[傲慢]"
	}, {
		"name" : "Expression_25",
		"text" : "[饥饿]"
	}, {
		"name" : "Expression_26",
		"text" : "[困]"
	}, {
		"name" : "Expression_27",
		"text" : "[恐惧]"
	}, {
		"name" : "Expression_28",
		"text" : "[流汗]"
	}, {
		"name" : "Expression_29",
		"text" : "[憨笑]"
	}, {
		"name" : "Expression_30",
		"text" : "[悠闲]"
	}, {
		"name" : "Expression_31",
		"text" : "[奋斗]"
	}, {
		"name" : "Expression_32",
		"text" : "[咒骂]"
	}, {
		"name" : "Expression_33",
		"text" : "[疑问]"
	}, {
		"name" : "Expression_34",
		"text" : "[嘘]"
	}, {
		"name" : "Expression_35",
		"text" : "[晕]"
	}, {
		"name" : "Expression_36",
		"text" : "[疯了]"
	}, {
		"name" : "Expression_37",
		"text" : "[衰]"
	}, {
		"name" : "Expression_38",
		"text" : "[骷髅]"
	}, {
		"name" : "Expression_39",
		"text" : "[敲打]"
	}, {
		"name" : "Expression_40",
		"text" : "[再见]"
	}, {
		"name" : "Expression_41",
		"text" : "[擦汗]"
	}, {
		"name" : "Expression_42",
		"text" : "[抠鼻]"
	}, {
		"name" : "Expression_43",
		"text" : "[鼓掌]"
	}, {
		"name" : "Expression_44",
		"text" : "[糗大了]"
	}, {
		"name" : "Expression_45",
		"text" : "[坏笑]"
	}, {
		"name" : "Expression_46",
		"text" : "[左哼哼]"
	}, {
		"name" : "Expression_47",
		"text" : "[右哼哼]"
	}, {
		"name" : "Expression_48",
		"text" : "[哈欠]"
	}, {
		"name" : "Expression_49",
		"text" : "[鄙视]"
	}, {
		"name" : "Expression_50",
		"text" : "[委屈]"
	}, {
		"name" : "Expression_51",
		"text" : "[快哭了]"
	}, {
		"name" : "Expression_52",
		"text" : "[阴险]"
	}, {
		"name" : "Expression_53",
		"text" : "[亲亲]"
	}, {
		"name" : "Expression_54",
		"text" : "[吓]"
	}, {
		"name" : "Expression_55",
		"text" : "[可怜]"
	}, {
		"name" : "Expression_56",
		"text" : "[菜刀]"
	}, {
		"name" : "Expression_57",
		"text" : "[西瓜]"
	}, {
		"name" : "Expression_58",
		"text" : "[啤酒]"
	}, {
		"name" : "Expression_59",
		"text" : "[篮球]"
	}, {
		"name" : "Expression_60",
		"text" : "[乒乓]"
	}, {
		"name" : "Expression_61",
		"text" : "[咖啡]"
	}, {
		"name" : "Expression_62",
		"text" : "[饭]"
	}, {
		"name" : "Expression_63",
		"text" : "[猪头]"
	}, {
		"name" : "Expression_64",
		"text" : "[玫瑰]"
	}, {
		"name" : "Expression_65",
		"text" : "[凋谢]"
	}, {
		"name" : "Expression_66",
		"text" : "[嘴唇]"
	}, {
		"name" : "Expression_67",
		"text" : "[爱心]"
	}, {
		"name" : "Expression_68",
		"text" : "[心碎]"
	}, {
		"name" : "Expression_69",
		"text" : "[蛋糕]"
	}, {
		"name" : "Expression_70",
		"text" : "[闪电]"
	}, {
		"name" : "Expression_71",
		"text" : "[炸弹]"
	}, {
		"name" : "Expression_72",
		"text" : "[刀]"
	}, {
		"name" : "Expression_73",
		"text" : "[足球]"
	}, {
		"name" : "Expression_74",
		"text" : "[瓢虫]"
	}, {
		"name" : "Expression_75",
		"text" : "[便便]"
	}, {
		"name" : "Expression_76",
		"text" : "[月亮]"
	}, {
		"name" : "Expression_77",
		"text" : "[太阳]"
	}, {
		"name" : "Expression_78",
		"text" : "[礼物]"
	}, {
		"name" : "Expression_79",
		"text" : "[拥抱]"
	}, {
		"name" : "Expression_80",
		"text" : "[强]"
	}, {
		"name" : "Expression_81",
		"text" : "[弱]"
	}, {
		"name" : "Expression_82",
		"text" : "[握手]"
	}, {
		"name" : "Expression_83",
		"text" : "[胜利]"
	}, {
		"name" : "Expression_84",
		"text" : "[抱拳]"
	}, {
		"name" : "Expression_85",
		"text" : "[勾引]"
	}, {
		"name" : "Expression_86",
		"text" : "[拳头]"
	}, {
		"name" : "Expression_87",
		"text" : "[差劲]"
	}, {
		"name" : "Expression_88",
		"text" : "[爱你]"
	}, {
		"name" : "Expression_89",
		"text" : "[NO]"
	}, {
		"name" : "Expression_90",
		"text" : "[OK]"
	}, {
		"name" : "Expression_91",
		"text" : "[爱情]"
	}, {
		"name" : "Expression_92",
		"text" : "[飞吻]"
	}, {
		"name" : "Expression_93",
		"text" : "[跳跳]"
	}, {
		"name" : "Expression_94",
		"text" : "[发抖]"
	}, {
		"name" : "Expression_95",
		"text" : "[怄火]"
	}, {
		"name" : "Expression_96",
		"text" : "[转圈]"
	}, {
		"name" : "Expression_97",
		"text" : "[磕头]"
	}, {
		"name" : "Expression_98",
		"text" : "[回头]"
	}, {
		"name" : "Expression_99",
		"text" : "[跳绳]"
	}, {
		"name" : "Expression_100",
		"text" : "[投降]"
	}, {
		"name" : "Expression_101",
		"text" : "[激动]"
	}, {
		"name" : "Expression_102",
		"text" : "[街舞]"
	}, {
		"name" : "Expression_103",
		"text" : "[献吻]"
	}, {
		"name" : "Expression_104",
		"text" : "[左太极]"
	}, {
		"name" : "Expression_105",
		"text" : "[右太极]"
	}];

	return emoData;
}

function formatDate1(now) {
	var date = new Date(now);
	var y = date.getFullYear();
	var m = date.getMonth() + 1;
	m = m < 10 ? ('0' + m) : m;
	var d = date.getDate();
	d = d < 10 ? ('0' + d) : d;
	var h = date.getHours();
	h = h < 10 ? ('0' + h) : h;
	var minute = date.getMinutes();
	var second = date.getSeconds();
	minute = minute < 10 ? ('0' + minute) : minute;
	second = second < 10 ? ('0' + second) : second;
	var zone = date.getHours() / 12 > 1 ? '下午' : '上午';
	return y + '年' + m + '月' + d + ' 日  ' + zone + ' ' + h + ':' + minute;
}

function formatDate2(now) {
	var date = new Date(now);
	var y = date.getFullYear();
	var m = date.getMonth() + 1;
	m = m < 10 ? ('0' + m) : m;
	var d = date.getDate();
	d = d < 10 ? ('0' + d) : d;
	var h = date.getHours();
	h = h < 10 ? ('0' + h) : h;
	var minute = date.getMinutes();
	var second = date.getSeconds();
	minute = minute < 10 ? ('0' + minute) : minute;
	second = second < 10 ? ('0' + second) : second;
	var zone = date.getHours() / 12 > 1 ? '下午' : '上午';
	return zone + ' ' + h + ':' + minute;
}

//文字表情转换
function transEmo(emoMsg) {
	var emoData = biaoqing();
	var emoPath, transMsg;
	var reg = /face\[(.*?)\]/gm;
	transMsg = emoMsg.replace(reg, function(match) {
		for (var i = 0, len = emoData.length; i < len; i++) {
			if (emoData[i].text === match.substring(4)) {
				emoPath = emoData[i].name + '.png';
				return '<img style="width:18px" class="biaoqing" src="../res/img/emotion/' + emoPath + '" />'
			}
		}
		return match;
	});
	return transMsg;
}

/***
 *手机号验证
 */
function checkPhone(telephone) {
	if (!(/^1[1234567890]\d{9}$/.test(telephone)))
		return false;
	else
		return true;
}
//电子邮箱验证
function checkEmail(email){
	if(!(/^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/.test(email)))
		return false;
	else
		return true;
}

//快递单号验证
function checkCouriernumber(Couriernumber){
	if(!(/^\w+$/.test(Couriernumber)))
		return false;
	else
		return true;
}



//返回上一页
function closeWin(name){
	if(isNotNull(name)){
		api.closeWin({
			name : name
		});
	}else{
		api.closeWin();
	}
}

//打开窗口
function openWin(name) {
	api.openWin({
		name : name,
		url : name + '.html',
		opaque : false,
		vScrollBarEnabled : false,
		//		slidBackEnabled:false
	});
}

function openWinWithoutHeader(name, title, rightParam, data,is_user){
	if(is_user){
		if (!checkUser())
			return false;
	}
	api.openWin({
		name : name,
		url : name + '.html',
		opaque : false,
		bgColor: '#f4f2f2',
		vScrollBarEnabled : false,
		reload:true,
		pageParam : {
			pageName : name,
			rightParam : isNotNull(rightParam) && isNotNull(rightParam['option']) ? rightParam['option'] : null,
			subtitle : title,
			data : data,
			rightBut : isNotNull(rightParam) && isNotNull(rightParam['option_style']) ? rightParam['option_style'] : null
		}
	});
}

//不禁止左滑
function openWinNew(name,title,rightParam,data,is_user,is_home) {
	if(is_user){
		if (!checkUser())
			return false;
	}
	var url = '';
	if(is_home){
		url = "html/";
	}
	var param = {
        name: name,
        url: name+'.html',
        bgColor: '#f4f2f2',
        title: title,
        navigationBar: {
        	leftButtons:[],
            rightButtons: rightParam
        },
        pageParam:data
    }
    api.openTabLayout(param);
}
//禁止左滑
function openWinNew1(name,title,rightParam,data,is_user,is_home) {
	if(is_user){
		if (!checkUser())
			return false;
	}
	var url = '';
	if(is_home){
		url = "html/";
	}
	var param = {
        name: name,
        url: name+'.html',
        bgColor: '#f4f2f2',
        slidBackEnabled:false,
        title: title,
        navigationBar: {
        	leftButtons:[],
            rightButtons: rightParam
        },
        pageParam:data
    }
    api.openTabLayout(param);
}
/********************检查用户信息************/
function checkUser() {
	var user = $api.getStorage('user');
	if (user == null || user == 'undefined') {
		openWin("login");
		return false;
	} else {
		return true;
	}
}


function getTimes(start) {
	var stopTime = new Date();
	start = parseInt(start);
	var lasttime = parseInt(start - stopTime.getTime() / 1000);
	if (lasttime < 0)
		return "00:00:00";
	else {
		var hour = parseInt(lasttime / 3600);
		if (parseInt(hour) < 10)
			hour = '0' + parseInt(hour);
		var min = parseInt(lasttime % 3600 / 60);
		if (parseInt(min) < 10)
			min = '0' + parseInt(min);
		var sec = parseInt((lasttime % 3600) % 60);
		if (parseInt(sec) < 10)
			sec = '0' + parseInt(sec);
		var times = hour + ':' + min + ':' + sec;
		return times;
	}
}


function isEmail(str) {
	var reg = /^[\w\-\.]+@[\w\-\.]+(\.\w+)+$/;
	return reg.test($.trim(str));
}

function isPhone(str) {
	var reg = /^[0-9]+$/;
	if (reg.test($.trim(str))) {
		return true;
	} else
		return false;
}

//推送注册
function openpush(uid, tags) {
	
	var systemType = api.systemType;
	if (systemType != 'ios') {
		jpush.init(function(ret) {
			if (ret && ret.status) {

			}
		});
	}
	var param = {
		alias : uid,
		tags : tags
	};
	jpush.bindAliasAndTags(param, function(ret, err) {
		jpush.setListener(function(ret2) {
			
		});
	});
}

//推送注册按产品
function setPushTag(uid,tag) {
	var tags = new Array();
	tags.push(tag);
	var param = {
		alias : uid,
		tags : tags
	};
	jpush.bindAliasAndTags(param, function(ret, err) {
		jpush.setListener(function(ret2) {
			try {
				var content = JSON.parse(ret2.content);
				if (isNotNull(content.productId)){
					api.sendEvent({
		                name:'hasOrder',
		                extra:{
		                	header:content.header,
		                	realName:content.realName,
		                	orderTime:content.orderTime
		                }
	                });
				}
			}
			catch(err){
			}
		});
	});
}

//修改推送tag
function changePushTag(tag){
	api.sendEvent({
	    name:'setPushTag',
	    extra:{
	    	tag:tag
	    }
    });
}

//get方法请求
function ajaxRequest(url,data, callBack, web_site) {

	var common_url = "";
	if (isNotNull(web_site)) {
		common_url = web_site + common_folder;
	} else {
		common_url = common_site + common_folder;
	}
	var uid = '';
	var urls = common_url + url;
	var user = $api.getStorage("user");
	var param = '';

	if (isNotNull(user)) {
		if (user.id != null && user.id != undefined) {
			if (urls.indexOf('?') >= 0) {
				param = "&userId=" + user.id;
			}
			else {
				param = "?userId=" + user.id;
			}
		}
		if(isNotNull(data) && isNotNull(data.body)){
			$.each(data.body, function(key, val) {
				param += "&"+key+"=" + val;
			});
		}
		urls += param;
	}else{
		if(isNotNull(data) && isNotNull(data.body)){
			$.each(data.body, function(key, val) {
				if(!isNotNull(param)){
					param = "?"+key+"=" + val;
				}else{
					param += "&"+key+"=" + val;
				}
			});
			urls += param;
		}
	}

	api.ajax({
		url : urls,
		method : 'get',
		cache : false,
		timeout : 30
	}, function(ret, err) {
		callBack(ret, err);
	});
}

//post方法请求
function ajaxRequest2(url, data, callBack, web_site) {
	if (isNotNull(data.body)) {
		$.each(data.body, function(key, val) {
			if((typeof val=='string')&&val.constructor==String){
				data.body[key] = $.trim(val);
			}else{
				data.body[key] = val;
			}
		});
		var user = $api.getStorage("user");

		if (isNotNull(user)) {
			if (user.id != null && user.id != undefined) {
				data.body.userId = user.id;
			}
		}
	}
	var common_url = '';
	if (isNotNull(web_site)) {
		common_url = web_site + common_folder;
	} else {
		common_url = common_site + common_folder;
	}

	api.ajax({
		url : common_url + url,
		 headers : {
             "Content-Type" : "application/json;charset=utf-8"
        },
		method : 'post',
		cache : false,
		timeout : 30,
		dataType : 'json',
		data : data
	}, function(ret, err) {
		callBack(ret, err);
	});
}

//post方法请求
function ajaxRequest3(url, data, callBack, web_site) {
	var common_url = '';

	if (isNotNull(web_site)) {
		common_url = web_site + common_folder;
	} else {
		common_url = common_site + common_folder;
	}

	api.ajax({
		url : common_url + url,
		method : 'post',
		cache : false,
		timeout : 30,
		dataType : 'json',
		data : data
	}, function(ret, err) {
		callBack(ret, err);
	});
}

//post方法请求(测试支付接口)
function ajaxRequest4(url, data, callBack, web_site) {
	if (isNotNull(data.body)) {
		$.each(data.body, function(key, val) {
			if((typeof val=='string')&&val.constructor==String){
				data.body[key] = $.trim(val);
			}else{
				data.body[key] = val;
			}
		});
		var user = $api.getStorage("user");

		if (isNotNull(user)) {
			if (user.id != null && user.id != undefined) {
				data.body.userId = user.id;
			}
		}
	}
	var common_url = '';
	if (isNotNull(web_site)) {
		common_url = pay_site + common_folder;
	} else {
		common_url = pay_site + common_folder;
	}

	api.ajax({
		url : common_url + url,
		 headers : {
             "Content-Type" : "application/json;charset=utf-8"
        },
		method : 'post',
		cache : false,
		timeout : 30,
		dataType : 'json',
		data : data
	}, function(ret, err) {
		callBack(ret, err);
	});
}

//打开相机
function openCamera(callback) {
	var resultList = api.hasPermission({
		list : ['camera']
	});
	var granted = granted = resultList[0].granted;
	if (isNotNull(resultList) && !granted) {
		if (api.systemType == 'ios') {
			api.confirm({
				msg : '"超拼网"想访问您的相机权限',
				buttons : ['不允许', '好']
			}, function(ret2, err) {
				if (ret2.buttonIndex == 2) {
					api.requestPermission({
						list : ['camera'],
						code : 1
					}, function(ret, err) {
						if (ret.list[0].granted)
						{
							api.getPicture({
								sourceType : 'camera',
								mediaValue : 'pic',
								encodingType:'png',
								destinationType : 'url',
								allowEdit : false,
								quality : 100,
								saveToPhotoAlbum : false
							}, function(ret2, err2) {
								callback(ret2, err2);
							});
						}
					});
				}
			});
		} else {
			api.requestPermission({
				list : ['camera'],
				code : 1
			}, function(ret, err) {
				if (ret.list[0].granted)
				{
					api.getPicture({
						sourceType : 'camera',
						mediaValue : 'pic',
						encodingType:'png',
						destinationType : 'url',
						allowEdit : false,
						quality : 100,
						saveToPhotoAlbum : false
					}, function(ret2, err2) {
						callback(ret2, err2);
					});
				}
			});
		}
	}else{
		api.getPicture({
			sourceType : 'camera',
			mediaValue : 'pic',
			encodingType:'png',
			destinationType : 'url',
			allowEdit : false,
			quality : 100,
			saveToPhotoAlbum : false
		}, function(ret, err) {
			callback(ret, err);
		});
	}
}

//打开相册
function openAlbum(callback) {
	var resultList = api.hasPermission({
		list : ['photos']
	});
	var granted = granted = resultList[0].granted;
	if (isNotNull(resultList) && !granted) {
		if (api.systemType == 'ios') {
			api.confirm({
				msg : '"超拼网"想访问您的相册权限',
				buttons : ['不允许', '好']
			}, function(ret2, err) {
				if (ret2.buttonIndex == 2) {
					api.requestPermission({
						list : ['photos'],
						code : 1
					}, function(ret, err) {
						if (ret.list[0].granted)
						{
							var trans = api.require('trans');
							api.getPicture({
								sourceType : 'album',
								mediaValue : 'pic',
								encodingType:'png',
								destinationType : 'url',
								allowEdit : false,
								quality : 100,
								saveToPhotoAlbum : false
							}, function(ret, err) {
								_d(ret);
								callback(ret, err);
							});
						}
					});
				}
			});
		} else {
			api.requestPermission({
				list : ['photos'],
				code : 1
			}, function(ret, err) {
				if (ret.list[0].granted)
				{
					var trans = api.require('trans');
					api.getPicture({
						sourceType : 'album',
						mediaValue : 'pic',
						encodingType:'png',
						destinationType : 'url',
						allowEdit : false,
						quality : 100,
						saveToPhotoAlbum : false
					}, function(ret, err) {
						_d(ret);
						callback(ret, err);
					});
				}
			});
		}
	}else{
		api.getPicture({
			sourceType : 'album',
			mediaValue : 'pic',
			encodingType:'png',
			destinationType : 'url',
			allowEdit : false,
			quality : 100,
			saveToPhotoAlbum : false
		}, function(ret, err) {
			_d(ret);
			callback(ret, err);
		});
	}
}

function setUser(data) {
	$api.setStorage('user', data);
}
//其他缓存数据
function setCacheData(name,data) {
	$api.setStorage(name, data);
}
//通过接口更新个人信息
function getUserUpdate(){
	var user = getUser();
	if(isNotNull(user)){
		var url = "member/getMemberInfoById";
		var bodyParam = {
			body:{
				userId:user.id
			}
		};
		ajaxRequest(url,bodyParam,function(ret,err){
			if(err){
				_d(err);
			}else{
				if(ret.code==1){
					setUser(ret.CpMemberDTO);
//					api.sendEvent({
//	                    name:'loginsuccess'
//                  });
				}
			}
		});
	}
}

function getUser(){
	return $api.getStorage('user');
}

function getCacheData(name){
	return $api.getStorage(name);
}


function getDate(times) {
	var start = new Date(times * 1000);
	var syear = start.getYear() + 1900;
	var smonth = start.getMonth() + 1;
	if (smonth < 10)
		smonth = '0' + smonth;
	var sday = start.getDate();
	if (sday < 10)
		sday = '0' + sday;
	return syear + '.' + smonth + '.' + sday;
}

function getFullDate(times) {
	var start = new Date(times * 1000);
	var syear = start.getFullYear();
	var smonth = start.getMonth() + 1;
	if (smonth < 10)
		smonth = '0' + smonth;
	var sday = start.getDate();
	if (sday < 10)
		sday = '0' + sday;
	var shour = start.getHours();
	var smin = start.getMinutes()+1;
	var ssec = start.getSeconds()+1;
	if (shour < 10)
		shour = '0' + shour;
	if (smin < 10)
		smin = '0' + smin;
	if (ssec < 10)
		ssec = '0' + ssec;
	return syear + '-' + smonth + '-' + sday + ' ' + shour + ':' + smin + ':' + ssec;
}

//保留两位小数
function formatterNumber(val,num){
    if(val !=0 && isNotNull(val)){
    	if(val<0){
    		return '0.00';
    	}
        return parseFloat(val).toFixed(2);
    }else{
    	 return '0.00';
    }
}

//数字转换单位
function getNumber(val){

	var number = parseInt(val);
	if(number<9999){
		return number;
	}else if(9999<number<100000){
		return formatterNumber(number/10000)+"万+";
	}else{
		return parseInt(number/10000)+"万+";
	}

}
/***
 *代金券
 * @param {Object} account   满足金额
 * @param {Object} condition 减去金额
 * @param {Object} couponType	类型
 */
function getCouponName(account,condition,couponType){
	if(parseFloat(account)>0){
		return "满"+account+"减"+condition;
		
	}else{
		return condition+"元无门槛券";
	}
}


function gettime(num){
	var date = Date.parse();
	return date.setDate(date.getDate() + num);
}
function _d(ret) {
	console.log(JSON.stringify(ret));
}





function showLoading1(){
	api.showProgress({
	    title: '努力加载中...',
	    text: '',
	    modal: true
	});
}

function hideLoading1(){
	api.hideProgress();
}


function showMore(name) {
	$('#morediv').remove();
	var html = '<div id="morediv" class="loading"><img src="../img/loading.svg" alt="svg not supported!" width=50 height=50 /></div>';
	$('#' + name).append(html);
}

function hideMore() {
	$('#morediv').remove();
}

function netError(callback,param) {
	$('#preloader').remove();
	$('#loading').remove();
	$('html,body').addClass('ovfHiden');
	var html = '<div class="disconnect" id="preloader"><div class="disconnectBox"><div class="disconnectimg"><img src="../img/logo.png" /></div><div class="disconnecttitle">网络竟然崩溃啦</div><div class="disconnecttext">别紧张，试试看刷新页面</div><div class="disconnecbutton"><button onclick="'+callback+'('+param+')">刷新</button></div></div></div>';
	$('.body').append(html);
	$('#contents').hide();
}

function showLoading() {
	$('#preloader').remove();
	$('html,body').addClass('ovfHiden');
	var html = '<div id="preloader" style="position:fixed;width:100%; height:100%; background-color:#000; filter:alpha(opacity=50);-moz-opacity:0.5; opacity:0; position:absolute; left:0px; top:0px;z-index:1000; ">';
	 	html += '</div>';	
	  	html += '<div id="loading" style="position:fixed;left:33%;top:38%;z-index:99999999"><svg style="padding: 48px 50px;border-radius: 50%;background: rgba(	0,0,0,.2);" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="24px" height="30px" viewBox="0 0 24 30" style="enable-background:new 0 0 50 50;" xml:space="preserve">';
		html += '<rect x="0" y="9.45185" width="4" height="12.0963" fill="yellow">';
		html += '<animate attributeName="height" attributeType="XML" values="5;21;5" begin="0s" dur="0.6s" repeatCount="indefinite"></animate>';
      	html += '<animate attributeName="y" attributeType="XML" values="13; 5; 13" begin="0s" dur="0.6s" repeatCount="indefinite"></animate>';
		html += '</rect>';
		html += ' <rect x="10" y="12.5482" width="4" height="5.9037" fill="yellow">';
		html += '<animate attributeName="height" attributeType="XML" values="5;21;5" begin="0.15s" dur="0.6s" repeatCount="indefinite"></animate>';
		html += ' <animate attributeName="y" attributeType="XML" values="13; 5; 13" begin="0.15s" dur="0.6s" repeatCount="indefinite"></animate>';
		html += '</rect>';
		html += '<rect x="20" y="8.54815" width="4" height="13.9037" fill="yellow">';
		html += '<animate attributeName="height" attributeType="XML" values="5;21;5" begin="0.3s" dur="0.6s" repeatCount="indefinite"></animate><animate attributeName="y" attributeType="XML" values="13; 5; 13" begin="0.3s" dur="0.6s" repeatCount="indefinite"></animate>';
		html += '</rect>';
		html += '</svg></div>';
	$('.body').append(html);
	$('#contents').hide();
}
function hideLoading() {
	$('html,body').removeClass('ovfHiden');
	$('#loading').remove();
	$('#preloader').remove();
	$('#contents').show();
}

/**
 *内容为空时调用
 * img 图片
 * title 文字
 */
function empty(img,title) {
	if(!isNotNull(img)){
		img = '../img/empty.png';
	}
	if(!isNotNull(title)){
		title = '当前没有信息呦~！';
	}

	$('#preloader').remove();
	var html = '<div id="preloader" class="svger"><i><img src="'+img+'"  width=500 height=500 /></i><p>'+title+'</p></div>';
	$('.body').append(html);
	$('#contents').show();
}


function tabEmpty(divId) {
	$('#preloader').remove();
	var html = '<div id="preloader" class="svger"><i><img src="../img/empty.png"  width=500 height=500 /></i><p>当前没有信息呦~！</p></div>';
	$('#'+divId).html(html);
	$('#contents').show();
}

function arrToString(array,p){
    if(!isNotNull(array)){
    return "";
  }
  let str="";
  for (var i = 0; i < array.length; i++) {
     str+=array[i][p]+",";
  }
  str=str.substring(0,str.length-1);
  return str;
}
function emptyById(divId) {
	var html = '<div id="preloader" class="svger"><i><img src="../img/empty.png"  width=500 height=500 /></i><p>当前没有信息呦~！</p></div>';
	$("#" + divId).append(html);
}

function hideProgress() {
	api.hideProgress();
}

function showProgress(){
	api.showProgress({
		title : "正在加载",
		text : "请稍后....",
		modal : true
	});
}

function showProgressNew(title,text) {
	api.showProgress({
		title : title,
		text : text,
		modal : true
	});
}


function toast(val) {
	var systemType = api.systemType;
	if(systemType=="ios"){
		api.toast({
			duration : "6000",
			msg : val,
			global : false
		});
	}else{
		api.toast({
			duration : "6000",
			msg : val,
			global : true
		});
	}
	
}

function closeWindow() {
	//绑定安卓的后退按钮事件 两秒内后退按钮点击两次 退到后台运行
	var open_detail;
	var backSecond = 0;
	api.addEventListener({
		name : 'keyback'
	}, function(ret, err) {
		var curSecond = new Date().getSeconds();
		if (Math.abs(curSecond - backSecond) > 2) {
			backSecond = curSecond;
			api.toast({
				msg : '再按一次关闭',
				duration : 2000,
				location : 'bottom'
			});
		} else {
			api.closeWidget({
				silent : true
			});
		}
	});
}

/*天倒计时**/
function timeTick() {

    var stopTime = new Date();
    var len = $('.timetick').length;
    var tt = $('.timetick');
    var th = $('.timehide');

    for (var i = 0; i < len; i++) {
        var stop_time = $('.timehide:eq(' + i + ')').val();
        var lasttime = parseInt(stop_time - stopTime.getTime() / 1000);
        if (lasttime < 0) {
            $('.guessConts:eq(' + i + ')').hide();
        }
        var day = parseInt(lasttime / 86400);
        if (day < 10)
            day = '0' +day;

        var hour = parseInt(lasttime%86400 / 3600);
        if (hour < 10)
            hour = '0' + hour;
        var min = parseInt((lasttime%86400) % 3600 / 60);
        if (min < 10)
            min = '0' + min;
        var sec = parseInt(((lasttime%86400) % 3600) % 60);
        if (sec < 10)
            sec = '0' + sec;

        var times = day+"天 "+hour + ':' + min + ':' + sec;

        if (lasttime > 0) {
            $('.timetick:eq(' + i + ')').html('剩余'+times);
        }
    }
}

/*小时倒计时**/
function timeTick1() {
    var stopTime = new Date();
    var len = $('.timetick').length;
    var tt = $('.timetick');
    var th = $('.timehide');

    for (var i = 0; i < len; i++) {
        var stop_time = $('.timehide:eq(' + i + ')').val();
        var lasttime = parseInt(stop_time - stopTime.getTime() / 1000);
     	if(lasttime==0){
     		api.sendEvent({
	             name:'perform'
             });
     	}
        if (lasttime < 0) {
            $('.guessConts:eq(' + i + ')').hide();
        }
        var hour = parseInt(lasttime / 3600);

        if (hour < 10)
            hour = '0' + hour;
        var min = parseInt((lasttime%86400) % 3600 / 60);
        if (min < 10)
            min = '0' + min;
        var sec = parseInt(((lasttime%86400) % 3600) % 60);
        if (sec < 10)
            sec = '0' + sec;
        var times = hour + ':' + min + ':' + sec;
        if (lasttime > 0) {
            $('.timetick:eq(' + i + ')').html(times);
        }
    }
}

/*单个数据（小时倒计时）**/
function timeTick2(stop_time) {
    var stopTime = new Date();
    var stop_time = $("#orderTime").val();

        var lasttime = parseInt(stop_time - stopTime.getTime() / 1000);

        var hour = parseInt(lasttime%86400 / 3600);
        if (hour < 10)
            hour = '0' + hour;
        var min = parseInt((lasttime%86400) % 3600 / 60);
        if (min < 10)
            min = '0' + min;
        var sec = parseInt(((lasttime%86400) % 3600) % 60);
        if (sec < 10)
            sec = '0' + sec;
        var times = hour + ':' + min + ':' + sec;

        if (lasttime > 0) {

            $('.timetick').html(times);
        }
}


function conversion(string) {
	
   var f = string.split(' ', 2);
   var d = (f[0] ? f[0] : '').split('-', 3);
   var t = (f[1] ? f[1] : '').split(':', 3);
   return (new Date(parseInt(d[0], 10) || null,(parseInt(d[1], 10) || 1) - 1,parseInt(d[2], 10) || null,parseInt(t[0], 10) || null,parseInt(t[1], 10) || null,parseInt(t[2], 10) || null)).getTime() / 1000;
}
function getStringLength(str, len) {
	if (str.length > len) {
		str = str.substring(0, len) + "...";
	}
	return str;
}

function randomString(len) {
　　len = len || 32;
　　var $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
　　var maxPos = $chars.length;
　　var pwd = '';
　　for (i = 0; i < len; i++) {
　　　　pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
　　}
　　return pwd;
}

function uploadImg(path,type,dur_time) {
		var file = '{"file":"'+ path + '"}';
		var url ="upload/uploadImg.do";
		var bodyParam = {
			values:{
				'upload':1
			},
			files : {
				file:path
			}
		};

		ajaxRequest3(url,bodyParam,function(ret,err){
			api.hideProgress();
			var jsonData = {};
			if (ret.code == 1) {
				if(isNotNull(type)){
					jsonData.type = type;
				}
				if(isNotNull(dur_time)){
					jsonData.dur_time = dur_time;
				}
				jsonData.header = common_image + ret.url;
				api.sendEvent({
		            name:'uploadHeader',
		            extra:jsonData
	            });
			}else{
				if(isNotNull(type)){
					jsonData.type = type;
				}
				if(isNotNull(dur_time)){
					jsonData.dur_time = dur_time;
				}
				jsonData.header = null;
				api.sendEvent({
		            name:'uploadHeader',
		            extra:jsonData
	            });
			}
		});
}
var uploadPicList;
var nowUploadNum = 0;
var aliyunOSS;
var pics = '';
function uploadOssArray(imgArray,fileName) {
	uploadPicList = new Array();
	pics='';
	var flag = false;
	nowUploadNum = 0;
		for (var i = 0;i<imgArray.length;i++)
		{
			var str = changeNameImg(imgArray[i],fileName);
			var tmp = {};
			tmp.str = str;
			tmp.path = imgArray[i];
			uploadPicList.push(tmp);
		}
		ossUpload(uploadPicList[0]);
}

function ossUpload(tmp){
	if(isNotNull(tmp)){
		var file = '{"file":"'+ tmp.path + '"}';
			var url ="upload/uploadImg.do";
			var bodyParam = {
				values:{
					'upload':1
				},
				files : {
					file:tmp.path
				}
			};
			ajaxRequest3(url,bodyParam,function(ret,err){
				api.hideProgress();
				if (ret.code == 1) {
					nowUploadNum++;
					if (nowUploadNum >= uploadPicList.length)
					{
						if(!isNotNull(pics)){
							pics += common_image + ret.url;
						}else{
							pics += ','+common_image + ret.url;
						}
						api.sendEvent({
							name:'uploadComplete',
							extra:{
								pics:pics,
							}
						});
					}
					else
					{
						if(!isNotNull(pics)){
							pics += common_image + ret.url;
						}else{
							pics += ','+common_image + ret.url;
						}
						ossUpload(uploadPicList[nowUploadNum]);
					}
				}
			});
	  }else{
		api.sendEvent({
				  name:'uploadComplete',
				  extra:{
					pics:[],
				  }
				});
	  }
}


function changeNameImg(path,fileName){
	var ext = path.split('.');
	var newFileName = new Date().getTime()+randomString(20);
	if (ext.length == 0)
	{
		if(fileName!='momentVideo'){
			newFileName += ".jpg";
		}else{
			newFileName += ".mp4";
		}
	}
	else
	{
		newFileName += "."+ext[ext.length-1];
	}
	return newFileName;
}

//缓存图片
function cacheImage(domName, src, flag,flag2) {
	if(isNotNull(src)){
		api.imageCache({
			url : src,
			thumbnail:false
		}, function(ret, err) {

			if (isNotNull(ret.status)) {
				$('#' + domName).attr('src', ret.url);

		        if (isNotNull(flag)) {
					var swipe = new huiSwpie('#swipe');
					swipe.autoPlay = false;
					//自动轮播
					swipe.delay = 3000;
					//间隔时间
					swipe.speed=100
					swipe.run();
					//对象

				}
			}
		});
	}
}

//缓存图片2
function cacheImage2(domName, src, flag,flag2) {
	if(isNotNull(src)){
			api.imageCache({
			url : src,
			thumbnail:false
		}, function(ret, err) {
			
			if (isNotNull(ret.status)) {
				
				$('#' + domName).attr('src', ret.url);

		        if (isNotNull(flag)) {
					var mySwiper = new Swiper('.swiper-container', {
						loop : true,
						pagination : '.pagination',
						autoplay:3000
						//其他设置
					});


				}
			}
		});
	}
}

//缓存图片
function cacheImageByClass(domName, src) {
	if(isNotNull(src)){
		api.imageCache({
			url : src,
			thumbnail:false
		}, function(ret, err) {
			//coding...
			if (isNotNull(ret.status)) {
				$('.' + domName).attr('src', ret.url);
			}
		});
	}
}

//判断图片地址是否可用
function isImgShow(src,fun){
	if(isNotNull(src)){
			api.imageCache({
			url : src,
			thumbnail:false
		}, function(ret, err) {
		    if (ret.status) {
		    	fun(ret.url);
		    }else{
		    	fun(src);
		    }
		});
	}else{
		return false;
	}
}

var UISearchBar;
function openSearch(name,data) {
	var param = {
        name: 'search',
        url: ''+name+'.html',
        bgColor: '#fff',
        title: '',
        animation:{
        	type:'none',
    		subType:"from_bottom",
    		duration:300
        },
        pageParam:data
    }
    api.openTabLayout(param);
}



//热销推荐详情
function getProductDetail(product_id){
	var data = {};
	data.product_id = product_id;
	openWinWithoutHeader("goodsdetail", '商品详情', {}, data);
}

//拼团详情
function getGroupProductDetail(product_id){
	var data = {};
	data.product_id = product_id;
	openWinWithoutHeader("groupgoodsdetail", '拼团详情', {}, data);
}

//获取推荐商品
function getRecommendProduct(type,id,bankfun) {
	var url2 = 'member/hotProduct.do?type='+type;
	ajaxRequest(url2,{},function(ret,err){
		bankfun(ret,err);
//		if (err){
//			
//		}
//		else {
//			api.refreshHeaderLoadDone();
//			
//			if (ret.code == 1 && ret.products.length > 0)
//			{
//				showRecommendProduct(ret.products,id);
//
//			}else{
//				
//			}
//		}
//		if (err){
//			
//		}
//		else {
//			api.refreshHeaderLoadDone();
//			
////			if (ret.code == 1 && ret.products.length > 0)
////			{
////				showRecommendProduct(ret.products,id);
////
////			}else{
////				
////			}
//		}
	});
}

/**
 * 生成推荐商品列表
 */
function showRecommendProduct(data,id){
	
	
	var Waterfall = new huiWaterfall('#'+id);
	var html = '';
	var ids = new Array();
	var src = new Array();
	var length = data.length;
	
	if (data.length % 2 > 0 && length>6)
	{
		length -= 1;
	}
	for (var i = 0;i<length;i++) {
		html += '<div class="activity-lists hui-water-items"   tapmode="" onclick="getProductDetail(\''+data[i].id+'\')"><div class="activity-imgs">';
		html += '<img id="productimg'+data[i].id+'"  src="../img/productListDefault.png" />';
		html += '</div><div class="activity-box"><div class="activity-title">'+data[i].productName+'</div>';
		html += '<div class="activity-text"><div class="activity-left">￥'+formatterNumber(data[i].preferentialPrice)+'</div>';
		html += '<div class="activity-right">已售'+getNumber(data[i].saleNum)+'件</div></div></div></div>';
		src.push(data[i].productImg2);
		ids.push(data[i].id);
	}

	Waterfall.addItems(html);
	//hui.endLoadMore();
	if(data.length>6){
	html = '<div id="hui-load-more">-- 我们是有底线的！ --</div>';
	$('#'+id).append(html);
	}
	api.parseTapmode();
	for (var i = 0;i<ids.length;i++){
		cacheImage("productimg"+ids[i],src[i]);
	}
}

/**
 * 生成推荐商品列表
 新加入type为1是已售 否则已拼
 * */
function showSearchProduct(data,totalNumber,type){


	var html = '';
	var ids = new Array();
	var src = new Array();
	var length = data.length;
	if (data.length % 2 > 0 && totalNumber>6)
	{
		length -= 1;
	}
	for (var i = 0;i<length;i++) {
		if(data[i].isGroup==1){
			html += '<div class="activity-lists hui-water-items" tapmode="" onclick="getGroupProductDetail(\''+data[i].id+'\')"><div class="activity-imgs">';
		}else{
			html += '<div class="activity-lists hui-water-items" tapmode="" onclick="getProductDetail(\''+data[i].id+'\')"><div class="activity-imgs">';
		}

		html += '<img id="productimg'+data[i].id+'"  src="../img/productListDefault.png" />';
		html += '</div><div class="activity-box"><div class="activity-title">'+data[i].productName+'</div>';
		html += '<div class="activity-text"><div class="activity-left">￥'+formatterNumber(data[i].preferentialPrice)+'</div>';
		if(type=1){
		html += '<div class="activity-right">已售'+getNumber(data[i].saleNum)+'件</div></div></div></div>';
		}else{
		html += '<div class="activity-right">已拼'+getNumber(data[i].saleNum)+'件</div></div></div></div>';
		}
		

		src.push(data[i].productImg2);
		ids.push(data[i].id);
	}

	Waterfall.addItems(html);
	api.parseTapmode();
	for (var i = 0;i<ids.length;i++){
		cacheImage("productimg"+ids[i],src[i]);
	}
	
}

//计算件数
function getChatNum(num) {
	var number = parseInt(num);

	if(number<99){
		return number;
	}else{
		return '99+';
	}
}


// 店铺收藏列表
function shopHtml(data,isFav) {
    var html = '';
    html += '<div class="Shop">';
    html += '<div class="Shop-title">';
    html += '<div class="Shop-left">';
    html += '<div class="Shop-img"><img src="../img/logo.png" id="shopLogo_' + data.id + '"/></div>';
    html += '<div class="Shop-text"><p>' + data.shopName + '</p><p>商品数量：' + getNumber(data.productCount) + '件</p></div>';
    html += '</div>';
    html += '<div class="Shop-right">';
    if (isFav) {
    	html += '<button class="favouriteshop-button" tapmode="" onclick="cancelfavourite(\'' + data.id + '\');">取消收藏</button><button tapmode="" onclick="goShop(\'' + data.shopName + '\',\'' + data.shopId + '\');">进店</button>';
    }
    html += '</div>';
    html += '</div>';
    html += '<div class="Shop-list">';
    for (var i = 0; i < data.products.length; i++) {
        html += '<div class="shopList" onclick="getProductDetail(\''+data.products[i].id+'\')">';
        html += '<div class="shopList-img"><img src="../img/productListDefault.png" id="productImg2_' + data.id + '_' + data.products[i].id + '"/></div>';
        html += '<div class="shopListImg">￥' + formatterNumber(data.products[i].preferentialPrice) + '</div>';
        html += '</div>';
    }
    html += '</div>';
    html += '</div>';
    return html;
}

	function setClipboard(str){
		if(!isNotNull(str)){
			str = str;
		}
		var clipBoard = api.require('clipBoard');
		clipBoard.set({
		    value: str
		}, function(ret, err) {
		    if (ret) {

		        toast("复制成功");
		    } else {
		        toast("复制失败");
		    }
		});
	}
	
	function setClipboardChat(str){
		if(!isNotNull(str)){
			str = str;
		}
		var reg = /face\[(.*?)\]/g;
		var transMsg = str.replace(/face/,"");
		var clipBoard = api.require('clipBoard');
		clipBoard.set({
		    value: transMsg
		}, function(ret, err) {
		    if (ret) {

		        toast("复制成功");
		    } else {
		        toast("复制失败");
		    }
		});
	}
//获取配置文件
function getConfig(){
	var url = "install/info.do";
	ajaxRequest(url,{},function(ret,err){
		if(err){
			_d(err);
		}else{
			if(ret.code==1){
				setCacheData('config',ret.info);
			}else{
				getConfig();
			}
		}
	});
}

function getCompressImg(url,backFunc){
	var resultList = api.hasPermission({
		list : ['photos']
	});
	var granted = granted = resultList[0].granted;
	if (isNotNull(resultList) && !granted) {
		if (api.systemType != 'ios'){
			api.requestPermission({
				list : ['photos'],
				code : 1
			}, function(ret, err) {
				if (ret.list[0].granted)
				{
					api.download({
					    url: url,
					    report: true,
					    savePath: 'fs://share',
					    cache: false,
					    allowResume: false
					}, function(ret, err) {
						if(ret.state==1){
							 backFunc(ret, err);
						}
					});
				}
			});
		}else{
			api.download({
					    url: url,
					    report: true,
					    savePath: 'fs://share',
					    cache: false,
					    allowResume: false
					}, function(ret, err) {
						if(ret.state==1){
							 backFunc(ret, err);
						}
					});
		}
	}else{
		api.download({
		    url: url,
		    report: true,
		    savePath: 'fs://share',
		    cache: false,
		    allowResume: false
		}, function(ret, err) {
			if(ret.state==1){
				 backFunc(ret, err);
			}
		});
	}
	
}

//邀请好友(拼团)
function inviteFriends() {
	dialogBox.actionMenu({
		rect : {
			h : 150
		},
		texts : {
			cancel : '取消'
		},
		items : [{
			text : '微信',
			icon : '../img/wx.png'
		}, {
			text : '朋友圈',
			icon : '../img/friend.png'
		}],
		styles : {
			bg : '#FFF',
			column : 4,
			itemText : {
				color : '#000',
				size : 12,
				marginT : 8
			},
			itemIcon : {
				size : 40
			},
			cancel : {
				bg : 'fs://icon.png',
				color : '#000',
				h : 44,
				size : 14
			}
		}
	}, function(ret) {
		
		if (ret.eventType == 'click') {
		
			if (ret.index == 0) {//微信分享
				var title = ' 【仅剩' + orderInfo.groupNum + '个名额】  我' + formatterNumber(orderInfo.orderDetails[0].price) + '元 【' + orderInfo.orderDetails[0].productName + '】';
				getCompressImg(orderInfo.orderDetails[0].productImg2, function(ret, err) {
					wx.isInstalled(function(ret, err) {
					    if (ret.installed) {
					       wx.shareWebpage({
								scene : 'session',
								title : title,
								description : orderInfo.orderDetails[0].productName,
								thumb : ret.savePath,
								contentUrl : config.shareUrl + orderInfo.id
							}, function(ret, err) {
							
								if (ret.status) {
									dialogBox.close({
										dialogName : 'actionMenu'
									});
								} else {
									dialogBox.close({
										dialogName : 'actionMenu'
									});
								}
							});
					    } else {
					        toast('当前设备未安装微信客户端');
					    }
					});
					
				})
			} else if (ret.index == 1) {
				var title = ' 【仅剩' + orderInfo.groupNum + '个名额】  我' + formatterNumber(orderInfo.orderDetails[0].price) + '元 【' + orderInfo.orderDetails[0].productName + '】';
				getCompressImg(orderInfo.orderDetails[0].productImg2, function(ret, err) {
					wx.isInstalled(function(ret, err) {
					    if (ret.installed) {
					       	wx.shareWebpage({
								scene : 'timeline',
								title : title,
								description : orderInfo.orderDetails[0].productName,
								thumb : ret.savePath,
								contentUrl : config.shareUrl+ orderInfo.id
							}, function(ret, err) {
								if (ret.status) {
									dialogBox.close({
										dialogName : 'actionMenu'
									});
								} else {
									dialogBox.close({
										dialogName : 'actionMenu'
									});
								}
							});
					    } else {
					        toast('当前设备未安装微信客户端');
					    }
					});
				
				})
			}
		} else {
			dialogBox.close({
				dialogName : 'actionMenu'
			});
		}

	});
}






function dropDownLoad(bankFun){
	api.setCustomRefreshHeaderInfo({
		    bgColor: '#fff',                             //（可选项）字符串类型；下拉刷新的背景设置，支持 rgb、rgba、#，该背景大小同当前 window 或 frame 的宽高；默认：#C0C0C0
		    image: {
	        pull:'../img/loadlogo/loadlogo (1).png',

	        transform: [
	             '../img/loadlogo/loadlogo (1).png',
		 		 '../img/loadlogo/loadlogo (2).png',
		    	 '../img/loadlogo/loadlogo (3).png',
		      	 '../img/loadlogo/loadlogo (4).png',
		         '../img/loadlogo/loadlogo (5).png',
		         '../img/loadlogo/loadlogo (6).png',
		         '../img/loadlogo/loadlogo (7).png',
		         '../img/loadlogo/loadlogo (8).png',
		         '../img/loadlogo/loadlogo (9).png',
		         '../img/loadlogo/loadlogo (10).png',
		         '../img/loadlogo/loadlogo (11).png',
		         '../img/loadlogo/loadlogo (12).png',
		         '../img/loadlogo/loadlogo (13).png',
		         '../img/loadlogo/loadlogo (14).png',
		         '../img/loadlogo/loadlogo (15).png',
		         '../img/loadlogo/loadlogo (16).png',
		         '../img/loadlogo/loadlogo (17).png',
	        ],
	        load: [
	             '../img/loadlogo/loadlogo (1).png',
	             '../img/loadlogo/loadlogo (2).png',
		    	 '../img/loadlogo/loadlogo (3).png',
		         '../img/loadlogo/loadlogo (4).png',
		         '../img/loadlogo/loadlogo (5).png',
		         '../img/loadlogo/loadlogo (6).png',
		         '../img/loadlogo/loadlogo (7).png',
		         '../img/loadlogo/loadlogo (8).png',
		         '../img/loadlogo/loadlogo (9).png',
		         '../img/loadlogo/loadlogo (10).png',
		         '../img/loadlogo/loadlogo (11).png',
		         '../img/loadlogo/loadlogo (12).png',
		         '../img/loadlogo/loadlogo (13).png',
		         '../img/loadlogo/loadlogo (14).png',
		         '../img/loadlogo/loadlogo (15).png',
		         '../img/loadlogo/loadlogo (16).png',
		         '../img/loadlogo/loadlogo (17).png',
	        ]
    	}
	}, function(ret, err) {
		//api.refreshHeaderLoading();
	    //在这里从服务器加载数据，加载完成后调用api.refreshHeaderLoadDone()方法恢复组件到默认状态
	    api.refreshHeaderLoadDone();
		bankFun(ret, err);
	});
}




//function openActivity(url,title,isHead) {
//
//		$.ajax({
//	        url: url,
//	        type: 'GET',
//	        complete: function(response) {
//		        if(response.status == 200) {
////		            alert('正常');
//		            var hideNav = false;
//					if (isHead == 0) {
//						hideNav = true;
//					}
//					if (hideNav) {
//						var param = {
//					        name: 'activity',
//					        hideNavigationBar:true,
//					        url: url,
//					        bgColor: '#fff',
//					        title: title,
//					        navigationBar: {
//					        	hideBackButton:false,
//					        	leftButtons:[],
//					        },
//					    }
//					    api.openTabLayout(param);
//					}
//					else
//					{
//						if(api.systemType == 'ios') {
//							var param = {
//						        name: 'activity',
//						        hideNavigationBar:true,
//						        url: url,
//						        bgColor: '#fff',
//						        title: title,
//						        navigationBar: {
//						        	hideBackButton:false,
//						        	leftButtons:[],
//						        },
//						    }
//						    api.openTabLayout(param);
//						} else {
//							var param = {
//						        name: 'activity',
//						        hideNavigationBar:true,
//						        url: url,
//						        bgColor: '#fff',
//						        title: title,
//						        navigationBar: {
//						        	hideBackButton:false,
//						        	leftButtons:[],
//						        },
//						    }
//						    api.openTabLayout(param);
//						}
//					}
//		        } else {
////		            alert('不正常');
//		            openWinNew("invalidlink", title, {}, []);
//		        }
//	        }
//      });
//
//
//
//
//	
//}

function openActivity(url,title,isHead) {
	var connectionType = api.connectionType;
	if(connectionType!='none' && connectionType!='unknown'){
			var hideNav = false;
		if (isHead == 0) {
			hideNav = true;
		}
		if (hideNav) {
			var param = {
		        name: 'activity',
		        hideNavigationBar:true,
		        url: url,
		        bgColor: '#fff',
		        title: title,
		        navigationBar: {
		        	hideBackButton:false,
		        	leftButtons:[],
		        },
		    }
		    api.openTabLayout(param);
		}
		else
		{
			if(api.systemType == 'ios') {
				var param = {
			        name: 'activity',
			        hideNavigationBar:false,
			        url: url,
			        bgColor: '#fff',
			        title: title,
			        navigationBar: {
			        	hideBackButton:false,
			        	leftButtons:[],
			        },
			    }
			    api.openTabLayout(param);
			} else {
				var param = {
			        name: 'activity',
			        hideNavigationBar:false,
			        url: url,
			        bgColor: '#fff',
			        title: title,
			        navigationBar: {
			        	hideBackButton:false,
			        	leftButtons:[],
			        },
			    }
			    api.openTabLayout(param);
			}
		}
	}else{
		openWinNew("invalidlink", title, {}, []);
	}
}

//获取当前定位地址（省，市，区，详情地址）
function getDefaultAddress(bankfun){
	var aMap = api.require('aMap');

	if (api.systemType == 'ios') {
		
		aMap.open({
		    rect: {
		        x: 0,
		        y: 0,
		        w: 0,
		        h: 0
		    },
		    showUserLocation: true,
		    zoomLevel: 11,
		    center: {
		        lon: 116.4021310000,
		        lat: 39.9994480000
		    },
		    fixedOn: api.frameName,
		    fixed: true
		}, function(ret, err) {
		   
		});
	}
	aMap.getLocation({
		autoStop : true
	}, function(ret, err) {
	    if (ret.status) {
	        aMap.getNameFromCoords({
			    lon: ret.lon,
			    lat: ret.lat
			}, function(ret1, err1) {
				if (api.systemType == 'ios') {
					aMap.close();
				}
			    if (ret1.status) {
			      		getsss(ret1.state,ret1.city,ret1.district,function(ret2){
			      		bankfun(ret2);
			      });
			    } else {
			       	bankfun('');
			    }
			});
	    } else {
	     	 bankfun('');
	    }
	});
}


function getsss(str1,str2,str3,bankfun){
	 var data = api.readFile({
			sync: true,
			path: 'widget://res/addr.txt'
		});
		
		var arr = Array();
		var data = JSON.parse(data);
		for(var i=0;i<data.length;i++){
			if(data[i].name==str1){
				arr.push(data[i].id);
				if(isNotNull(data[i].sub)){
					for(var j=0;j<data[i].sub.length;j++){
						if(data[i].sub[j].name==str2){
							arr.push(data[i].sub[j].id);
							for(var k=0;k<data[i].sub[j].sub.length;k++){
								if(data[i].sub[j].sub[k].name==str3){
										arr.push(data[i].sub[j].sub[k].id);
								}
							}
						}	
					}
				}
			}
		}
		bankfun(arr);
		
}

//判断当前时间是上午还是下午
function getHour(){
	var date = new Date();
	var zone = date.getHours() / 12 > 1 ? '下午' : '上午';
	return zone;
}





function dataAnalysis(){
	var systemType = api.systemType;
	// 此处platform需要自行获取并做判断
if (systemType == "android") {
    // android平台的初始化
    var demo = api.require('modulebaidumtj');
    demo.startWithAppkey({
        appkey: '984990dead',
        appVersion: api.appVersion,
        channelId: api.channel,
        enableExceptionLog: 'true',
        enableDebugOn: 'true'
    });
} else {
    // iOS平台的初始化
    var demo = api.require('modulebaidumtj');
    demo.startWithAppkey({
        appkey: 'a463ba8971',
        appVersion: api.appVersion,
        channelId: api.channel,
        enableExceptionLog: 'true',
        enableDebugOn: 'true'
    });
}
}
//页面统计，页面开始时调用
function onPageStart(pagename,eventId,eventLabel) {
    var demo = api.require('modulebaidumtj');
    demo.onPageStart({
        pageName: pagename//页面名称(字符串)
    });
    demo.onEventStart({
        eventId: eventId,//事件Id(字符串)
        eventLabel: eventLabel//事件标签(字符串)
    });
}
//页面统计，页面结束时调用
function onPageEnd(pagename,eventId,eventLabel) {
    var demo = api.require('modulebaidumtj');
    demo.onPageEnd({
        pageName: pagename//页面名称(字符串)
    });
    demo.onEventEnd({
        eventId: eventId,//事件Id(字符串)
        eventLabel: eventLabel//事件标签(字符串)
    });
}
//无时长事件统计，带附加自定义参数
function onEventWithAttributes(pagename,eventId,eventLabel,attributes) {
    var demo = api.require('modulebaidumtj');
     demo.onPageStart({
        pageName: pagename//页面名称(字符串)
    });
    demo.onEventWithAttributes({
        eventId: eventId,//事件Id(字符串)
        eventLabel: eventLabel,//事件标签(字符串)
        attributes: attributes//事件附加参数(字典)
    });
}


//自定义时长事件，结束统计，带附加自定义参数
function onEventEndWithAttributes(pagename,eventId,eventLabel,attributes) {
    var demo = api.require('modulebaidumtj');
     demo.onPageEnd({
        pageName: pagename//页面名称(字符串)
    });
    demo.onEventEndWithAttributes({
        eventId: eventId,//事件Id(字符串)
        eventLabel: eventLabel,//事件标签(字符串)
        attributes: attributes//事件附加参数(字典)
    });
}

//进入通知中心
		function getNoticeInfo() {
			var url = 'push/page';
			ajaxRequest(url, {}, function(ret, err) {
				if (err) {
					_d(err);
				} else {
					if (ret.code == 1) {
						if (isNotNull(ret.data)) {
							
							openWinNew("html/openNotice", "通知中心", {}, ret.data, true);
						}
					};
				}
			})
		}
		
	//商家入驻
function tenants() {
	var url = 'shop/checkShop.do';
	var bodyParam = {
		body : {}
	};
	ajaxRequest(url, bodyParam, function(ret, err) {
		if (err) {
			toast('服务器开了个小差，在刷新尝试一下!!!');
		} else {
			if (ret.code == 1) {
				if (ret.status == 0) {
					toast(ret.msg)
				} else if (ret.status == 1) {
					toast(ret.msg)
				} else if (ret.status == 2) {
					toast("审核失败:" + ret.msg);

					openWinNew('html/shopopen', '商家入驻', {}, {}, true)
				} else {

					openWinNew('html/shopopen', '商家入驻', {}, {}, true)
				}
			}
		}
	});

}	

function getButton(order,id,status,isGroup,groupStatus,orderDetails) {
	var html = '';
	html += '<div class="myorder-button">';
	switch(status) {
		case -1:
		case -2:
			html += '<div class="border-bitton"><button tapmode="" onclick="orderdel(\'' + id + '\')">删除订单</button></div>';
			if (isGroup) {
				html += '<div class="border-bitton"><button tapmode="" onclick="getGroupProductDetail(\'' + orderDetails[0].productId + '\')">再次购买</button></div>';
			}
			break;
		case 0:
			html += '<div class="border-bitton"><button tapmode="" onclick="orderCancel(\'' + id + '\')">取消订单</button></div>';
			html += '<div class="border-bitton-red" tapmode="" onclick="openpay(\'' + id + '\');"><button>去支付</button></div></div>';
			break;
		case 1:
			if (!isGroup) {
				var a = 0;
				for (var j = 0; j < orderDetails.length; j++) {
					if (parseInt(orderDetails[j].refundStatus) == 8) {
						a++
					}
				}
				if (a == orderDetails.length) {
					html += '<div class="border-bitton"><button tapmode="" onclick="orderdel(\'' + id + '\')">删除订单</button></div>';
				} else {
//					html += '<div class="border-bitton"><button tapmode="" onclick="cuiChuli()">催发货</button></div>';
				}
			}
			else {
				if (groupStatus == 0) {//待分享
					html += '<div class="border-bitton-red"><button class="spellwidth" tapmode="" onclick="toShare(\'' + id + '\')">邀请好友拼单</button></div>';
				} else {
					if (parseInt(orderDetails[0].refundStatus) == 8) {
						html += '<div class="border-bitton"><button tapmode="" onclick="orderdel(\'' + id + '\')">删除订单</button></div>';
					} else {
//						html += '<div class="border-bitton"><button tapmode="" onclick="cuiChuli()">催发货</button></div>';
					}
				}
			}
			break;
		case 2:
			var a = 0;
			for (var j = 0; j < orderDetails.length; j++) {
				if (parseInt(orderDetails[j].refundStatus) == 8 ) {
					a++
				}
			}
			if (a == orderDetails.length) {
				html += '<div class="border-bitton"><button tapmode="" onclick="orderdel(\'' + id + '\')">删除订单</button></div>';
			} else {
				html += '<div class="border-bitton"><button tapmode="" onclick="orderLogistics(\'' + id + '\')">查看物流</button></div>';
				html += '<div class="border-bitton"id="myborder-extend"><button tapmode="" onclick="orderExtended(\'' + id + '\')">延长收货</button></div>';
				html += '<div class="border-bitton"id="myborder-confirm"><button tapmode="" onclick="orderConfirm(\'' + id + '\')">确认收货</button></div>';
			}
			break;
		case 3:
			if (isGroup) {
				html += '<div class="border-bitton"><button tapmode="" onclick="getGroupProductDetail(\'' + orderDetails[0].productId + '\')">再次购买</button></div>';
			}
			var a = 0;
				for (var j = 0; j < orderDetails.length; j++) {
					if (parseInt(orderDetails[j].refundStatus) == 8) {
						a++
					}
				}
			if (a == orderDetails.length) {
				html += '<div class="border-bitton"><button tapmode="" onclick="orderdel(\'' + id + '\')">删除订单</button></div>';
			}else{
				html += '<div class="border-bitton"><button onclick="toEvaluate(\'' + JSON.stringify(order).replace(/"/g, '&quot;') + '\')">立即评价</button></div>';
			}
			break;
		case 4:
			if (isGroup) {
				html += '<div class="border-bitton"><button tapmode="" onclick="getGroupProductDetail(\'' + orderDetails[0].productId + '\')">再次购买</button></div>';
			}
			html += '<div class="border-bitton"><button tapmode="" onclick="orderdel(\'' + id + '\')">删除订单</button></div>';
			break;
	}
	html += '</div>';
	return html;
}

//function testVersion(){
//	mam.checkUpdate(function(ret, err){
//	    if (ret) {
//	        alert(JSON.stringify(ret));
//	    } else {
//	        alert(JSON.stringify(err));
//	    }
//	});
//}


function getWindow(name){
	var windows = api.windows();
	var status = false;
	for(var i=0;i<windows.length;i++){
		if(windows[i].name==name){
			status = true;
		}
	}
	return status;
}
var common_site = 'https://admin.chaopin100.com/cp-api/';
var common_image = 'https://admin.chaopin100.com';
var pay_site = 'https://admin.chaopin100.com/cp-api/';
var common_folder = '';
//var common_site = 'http://192.168.1.5:8081/cp-api/';
//var common_image = 'https://admin.chaopin100.com';
//var pay_site = 'https://admin.chaopin100.com/cp-api/';
//var common_folder = '';
