var jsonData;
var user;
var showPanel = 'user';
var td;
var myJsonData;
var connectionType;
apiready = function() {
	api.addEventListener({
		name : 'loginsuccess'
	}, function(ret, err) {
		init();
	});
	api.addEventListener({
		name : 'chat'
	}, function(ret, err) {

		init();
	});
	api.addEventListener({
		name : 'shopchat'
	}, function(ret, err) {

		getShopuserchatList();
	});
	api.refreshHeaderLoadDone();
	dropDownLoad(function(ret, err) {
		init();
	});

	init();
}
function init() {
	showLoading();
	connectionType = api.connectionType;  //比如： wifi
	if(connectionType!='none' && connectionType!='unknown'){
		myJsonData = '';
		user = getUser();
		if (user == null || user == 'undefined') {
			hideLoading();
			$("#isShop").hide();
			$("#outlogin").show();
			$("#login").hide();
			return false;
		} else {
			if (user.isShop == 1) {
				$("#isShop").show();
				$("#login").show();
				$("#chatbody").addClass("shopsearchgoods-body");
				$("#outlogin").hide();
				getNotice();
			} else {
				$("#isShop").hide();
				$("#login").show();
				$("#outlogin").hide();
				$("#chatbody").removeClass("shopsearchgoods-body");
				getNotice();
				return true;
			}
		}
		//通知中心
	}else{
		netError("init");
	}
	
}

function getNotice() {
	var url = 'push/page';
	ajaxRequest(url, {}, function(ret, err) {
		hideLoading();
		if (err) {
			api.removeLaunchView();
			netError("init");
		} else {
			if (ret.code == 1) {
				
				if (isNotNull(ret.data)) {
					myJsonData = ret.data;
					getUserList();
				} else {
					myJsonData = [];
					getUserList();
				}
				
			}
			api.removeLaunchView();
		}
	})
}

function getUserList() {
	hideLoading();
	getuserchatList();
	getOrder();
//	if (user == null || user == 'undefined') {
//
//		$("#isShop").hide();
//		$("#outlogin").show();
//		$("#login").hide();
//		return false;
//	} else {
//		if (user.isShop == 1) {
//			$("#isShop").show();
//			$("#login").show();
//			$("#chatbody").addClass("shopsearchgoods-body");
//			$("#outlogin").hide();
//			getuserchatList();
//			getOrder();
//		} else {
//			$("#isShop").hide();
//			$("#login").show();
//			$("#outlogin").hide();
//			$("#chatbody").removeClass("shopsearchgoods-body");
//			getuserchatList();
//			getOrder();
//			return true;
//		}
//	}
}

//切换标签
function clickChatTab(id) {
	if (showPanel == id) {
		return;
	}
	showPanel = id;
	$('.searchgoods-list').removeClass('searchgoods-list-on');
	$('#' + showPanel).addClass('searchgoods-list-on');

	$('.body-table').removeClass('body-table-on');
	$('#' + showPanel + 'Panel').addClass('body-table-on');
	if (id == 'user') {
		getuserchatList();
		getOrder();
	} else {
		getShopuserchatList();
	}
}

function getOrder() {
	var url = 'order/selectChatOrder.do';
	ajaxRequest(url, {}, function(ret, err) {
		var html = '';
		if (err) {
			_d(err);
		} else {
			api.refreshHeaderLoadDone();
			dropDownLoad(function(ret, err) {
				init();
			});
			if (ret.code == 1 && ret.order.length > 0) {
				jsonData = ret.order;
				$("#orderlist").show();
				for (var i = 0; i < ret.order.length; i++) {
					if (ret.order[i].userId != user.id) {
				
						html += '<div class="order-list"  tapmode="" onclick="openChat(\'' + ret.order[i].id + '\',1);">';
						html += '<div style="width:58px!important" class="orderlist-left"><img  src="../img/logo.png" id="shopLogo_' + ret.order[i].id + '"/>';
						if (ret.order[i].status == 1) {
							if (ret.order[i].orderType == 2) {
								if (ret.order[i].groupStatus == 0) {
									html += '<p>待分享</p>';
								} else if (ret.order[i].groupStatus == 1) {
									html += '<p>待发货</p>';
								} else {
									html += '<p>拼团失败</p>';
								}
							} else {
								html += '<p>待发货</p>';
							}
						} else if (ret.order[i].status == 2) {
							html += '<p>待收货</p>';
						} else if (ret.order[i].status == 3) {
							html += '<p>待评价</p>';
						} else if (ret.order[i].status == 4) {
							html += '<p>待收货</p>';
						} else {
							html += '<p>已取消</p>';
						}
						html += '</div>';
						html += '<div class="orderlist-right"><img src="../img/goodsbanner.png" id="ordergood_' + ret.order[i].id + '"/></div>';
						html += '</div>';
					}
				}
				$("#orderList").html(html);
				for (var i = 0; i < ret.order.length; i++) {
					cacheImage("shopLogo_" + ret.order[i].id, ret.order[i].imgUrl);
					cacheImage("ordergood_" + ret.order[i].id, ret.order[i].productImg2);
				}
				api.parseTapmode();
			}
		}
	});
}

//用户聊天
function getuserchatList() {
	var url = 'member/getUserChatPage';
	ajaxRequest(url, {}, function(ret, err) {
		$("#userchatList").html('');

		if (err) {
			_d(err);
		} else {
			var html = '';
			if ((ret.code == 1 && ret.chatPage.length > 0) || isNotNull(myJsonData)) {

				if (isNotNull(myJsonData)) {
					var html = '';
					//html += '<div class="mui-table-view">';
					html += '<li class="mui-table-view-cell listStyle">';
					html += '<div class="mui-slider-right mui-disabled">';
					html += '<a class="mui-btn mui-btn-red" style="margin-bottom:5px" tapmode="" onclick="cancelfavourite(1);">删除</a>';
					html += '</div>';
					html += '<div class="mui-slider-handle">';

					html += '<div class="confirmorder rightFont" tapmode="" onclick="openNotice();">';
					html += '<div class="confirmorder-Positioning alignitems paddingNo"><img src="../img/notic.png" ></div>';
					html += '<div class="confirmorder-address center padding5">';
					html += '<div class="confirmorder-top flex">';

					html += '<div class=""><span class="chatcenter">通知中心</span></div>';
					html += '<div class="width20"><p class="fonts12">' + formatChatTime(parseInt(conversion(myJsonData[0].addTime)) * 1000) + '</p></div>';
					html += '</div>';
					html += '<div class="confirmorder-bottom chatright">';
					if (isNotNull(myJsonData[0].title)) {
						html += '<div class="width80" style="display: -webkit-box;-webkit-box-orient: vertical;-webkit-line-clamp: 1;overflow: hidden;width:65%;">' + myJsonData[0].title + '</div>';
					}
					html += '<div class="confirmorder-right">';
					html += '</div>';
					html += '</div>';
					html += '</div>';
					html += '</div>';
					html += '</div>';
					html += '</div>';
					html += '</div>';
					html += '</li>';
					//html += '</div>';
				}
				var img = new Array();
				for (var i = 0; i < ret.chatPage.length; i++) {
				
					//html += '<div  class="mui-table-view" id="OA_task_1" name="product_' + ret.chatPage[i].id + '" >';
					html += '<li class="mui-table-view-cell listStyle">';
					html += '<div class="mui-slider-right mui-disabled" >';
					html += '<a class="mui-btn mui-btn-red" tapmode="" style="margin-bottom:5px"onclick="cancelfavourite(2,\''+ret.chatPage[i].id+'\');">删除</a>';
					html += '</div>';
					html += '<div class="mui-slider-handle">';

					html += '<div class="confirmorder rightFont" tapmode="" onclick="openChat(\'' + ret.chatPage[i].shopId + '\',0,\'' + ret.chatPage[i].shopId + '\',\'' + ret.chatPage[i].shopName + '\',\'' + ret.chatPage[i].imgUrl + '\',\'' + ret.chatPage[i].userId + '\');">';
					html += '<div class="confirmorder-Positioning alignitems paddingNo"><img style="width:55px!important" src="../img/logo.png" id="shopLogo_' + ret.chatPage[i].id + '"/></div>';
					html += '<div class="confirmorder-address center padding5">';
					html += '<div class="confirmorder-top flex">';
					html += '<div class=""><span class="chatcenter">' + ret.chatPage[i].shopName + '</span></div>';
					html += '<div class="width20"><p class="fonts12">' + formatChatTime(parseInt(ret.chatPage[i].updateTime) * 1000) + '</p></div>';
					html += '</div>';
					html += '<div class="confirmorder-bottom chatright">';
					if (isNotNull(ret.chatPage[i].msg)) {
						html += '<div class="width80">' + transEmo(ret.chatPage[i].msg) + '</div>';
					}
					html += '<div class="confirmorder-right">';
					if (ret.chatPage[i].user1 == user.id) {
						if (getChatNum(ret.chatPage[i].hasNew1) > 0) {
							html += '<div id="cite" >' + getChatNum(ret.chatPage[i].hasNew1) + '</div>';
						}
					}
					html += '</div>';
					html += '</div>';
					html += '</div>';
					html += '</div>';

					html += '</div>';
					html += '</div>';
					html += '</li>';
					//html += '</div>';

					img.push(ret.chatPage[i].imgUrl);
				}

				$("#userchatList").html(html);
				for (var i = 0; i < img.length; i++) {
					cacheImage("shopLogo_" + ret.chatPage[i].id, img[i]);
				}
				api.parseTapmode();
			} else {
				tabEmpty('userchatList');
			}
		}
	});
}

//商家聊天
function getShopuserchatList() {

	var url = 'member/getShopChatPage';
	var bodyParam = {
		body : {
			shopId : user.shopId
		}
	};
	ajaxRequest(url, bodyParam, function(ret, err) {

		$("#shopchatList").html('');
		var html = '';
		if (err) {
			_d(err);
		} else {
			if (ret.code == 1 && ret.chatPage.length > 0) {
				var img = new Array();
				for (var i = 0; i < ret.chatPage.length; i++) {
				
					html += '<div class="mui-table-view-cell listStyle">';
					html += '<div class="mui-slider-right mui-disabled">';
					html += '<a class="mui-btn mui-btn-red"style="margin-bottom:5px"  tapmode="" onclick="cancelfavourite(3,\''+ret.chatPage[i].id+'\');">删除</a>';
					html += '</div>';
					html += '<div class="mui-slider-handle">';
					html += '<div class="confirmorder rightFont" tapmode="" onclick="openShopChat(\'' + ret.chatPage[i].user1 + '\',\'' + ret.chatPage[i].shopId + '\',\'' + ret.chatPage[i].reaName + '\',\'' + ret.chatPage[i].header + '\');">';
					html += '<div class="confirmorder-Positioning alignitems paddingNo"><img src="../img/verify03.png" id="shopLogo_' + ret.chatPage[i].id + '"/></div>';
					html += '<div class="confirmorder-address center padding5">';
					html += '<div class="confirmorder-top flex">';
					html += '<div class=""><span class="chatcenter">' + ret.chatPage[i].reaName + '</span></div>';
					html += '<div class="width20"><p class="fonts12">' + formatChatTime(parseInt(ret.chatPage[i].updateTime) * 1000) + '</p></div>';
					html += '</div>';
					html += '<div class="confirmorder-bottom chatright">';
					if (isNotNull(ret.chatPage[i].msg)) {
						html += '<div class="width80">' + transEmo(ret.chatPage[i].msg) + '</div>';
					}
					html += '<div class="confirmorder-right">';
					if (getChatNum(ret.chatPage[i].hasNew2) > 0) {
						html += '<div id="cite" >' + getChatNum(ret.chatPage[i].hasNew2) + '</div>';
					}
					html += '</div>';
					html += '</div>';
					html += '</div>';
					html += '</div>';

					html += '</div>';
					html += '</div>';
					html += '</div>';
					
					img.push(ret.chatPage[i].header);
				}
				$("#shopchatList").html(html);
				for (var i = 0; i < img.length; i++) {
					cacheImage("shopLogo_" + ret.chatPage[i].id, img[i]);
				}
				api.parseTapmode();
			} else {
				tabEmpty('shopchatList');
			}
		}
	});
}

/**
 * 跳转聊天
 * @param {Object} id       订单ID/用户ID
 * @param {Object} type		1时，id为订单ID；0时，id为用户ID；
 */
function openChat(id, type, shopId, shopName, img, pushUserId) {

	var data = {};

	if (type == 1) {

		for (var i = 0; i < jsonData.length; i++) {
			if (jsonData[i].id == id) {
				data.info = jsonData[i];
				data.sendId = jsonData[i].shopId;
				data.img = jsonData[i].imgUrl;
				data.shopName = jsonData[i].shopName;
				shopName = jsonData[i].shopName;
				data.shopId = jsonData[i].shopId;
				data.pushUserId = jsonData[i].userId;
			}
		}
	} else {
		data.sendId = id;
		data.shopId = shopId;
		data.shopName = shopName;
		data.img = img;
		data.pushUserId = pushUserId;
	}

	var fun = new Array({
		"text" : "进店"
	});
	openWinNew("chat", shopName, fun, data, true);
}

function openShopChat(id, shopId, sendName, img) {

	var data = {};
	data.sendId = id;
	data.shopId = shopId;
	data.img = img;
	openWinNew("shopchat", sendName, {}, data, true);
}

function formatChatTime(time) {
	var timestamp = time / 1000;
	var morning = new Date(new Date().setHours(0, 0, 0, 0)) / 1000;
	// 获取当天 0 点的时间戳

	var a = new Array("日", "一", "二", "三", "四", "五", "六");
	var week = new Date(time).getDay();
	var str = "星期" + a[week];
	var html = '';
	var mydate = new Date();

	if (((mydate.getTime() - time) / 1000) > 604800) {// 消息大于1周，显示手机收发时间的日期
		html = formatDate3(new Date(time));
	} else if (((mydate.getTime() - time) / 1000) > ((mydate.getTime() - (morning) * 1000) / 1000) && ((mydate.getTime() - time) / 1000) < ((mydate.getTime() - (morning - 86400) * 1000) / 1000)) {//小于2天，显示昨天；
		html = "昨天";
	} else if (((mydate.getTime() - time) / 1000) > 86400 && ((mydate.getTime() - time) / 1000) < 604800) {// 消息大于2天、小于1周，显示星期+收发消息的时间；
		html = str;
	} else {
		if (new Date(time).toDateString() === new Date().toDateString()) {
			html = formatDate4(new Date(time));
		} else if (new Date(time) < new Date()) {
			html = formatDate4(new Date(time));
		}
	}
	return html;
}

function formatDate3(now) {
	var date = new Date(now);
	var y = date.getFullYear();
	var m = date.getMonth() + 1;
	m = m < 10 ? ('0' + m) : m;
	var d = date.getDate();
	d = d < 10 ? ('0' + d) : d;
	return y + '/' + m + '/' + d;
}

function formatDate4(now) {
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

function openNotice() {
	openWinNew("openNotice", "通知中心", {}, myJsonData, true);
	
	//	openWin("")
}

function cancelfavourite(val,id) {
//1:通知2:聊天3:商家聊天

	if (val == 1) {
		var url = 'push/deleteInfo';
		var bodyParam = {
			body : {
			}
		};
		ajaxRequest(url, bodyParam, function(ret, err) {
			if (err) {
				_d(err)
			} else {
				if (ret.code == 1) {
					init()
				}

			}
		})
	}else if(val == 2){
		var url = 'member/deleteChat';
		var bodyParam = {
			body : {
			type :1,
			chatId :id
			}
		};
		ajaxRequest2(url, bodyParam, function(ret, err) {
			if (err) {
				_d(err)
			} else {
				if (ret.code == 1) {
					init()
				}

			}
		})
	}else if(val==3){
	var url = 'member/deleteChat';
		var bodyParam = {
			body : {
			type :2,
			chatId :id
			}
		};
		ajaxRequest2(url, bodyParam, function(ret, err) {
			if (err) {
				_d(err)
			} else {
				if (ret.code == 1) {
					init()
				}

			}
		})
	}
	
	
}