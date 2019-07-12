var blank;
var pix = 1;
var isConnect = false;
var connecting = false;
var reconnectTime = 1;
var disconnect = false;
var webSocket;
var chatId = 0;
var sendId = 0;
//发送人ID
var chatImg;
var user;
var jsonData;
var old_sendTime = 0;
var old_play_id = null;
var photoBrowser;
var imgArr = new Array();
var shopId;
var pushUserId;
var systemType;
var tag = false;
var historyNum = 0;
var config;
//手机图片浏览器,
//聊天列表传入的数据
apiready = function() {
	config = getCacheData('config');
	systemType = api.systemType;
	//获取设备系统类型
	jsonData = api.pageParam;
	sendId = api.pageParam.sendId;
	chatImg = api.pageParam.img;
	shopId = api.pageParam.shopId;
	pushUserId = api.pageParam.pushUserId;
	blank = $api.byId('blank')
	user = getUser();
	pix = api.screenHeight / api.winHeight - 1;
	initChatInput();
	webSocket = api.require('webSocket2018');
	photoBrowser = api.require('photoBrowser');
	openSocket();
	//进入店铺
	api.addEventListener({
		name : 'navitembtn'
	}, function(ret, err) {
		var data = {};
		data.shopId = api.pageParam.sendId;
		data.shopName = api.pageParam.shopName;
		var fun = new Array({
			"iconPath" : "../icon/search.png"
		});
		openWinNew("shopdetail", api.pageParam.shopName, fun, data);
	});
	api.addEventListener({
		name : 'viewdisappear'
	}, function(ret, err) {
		if (tag) {
			tag = false;
		} else {
			api.sendEvent({
				name : 'chat'
			});
			webSocket.close();
		}
	});
	api.addEventListener({
		name : 'keyback'
	}, function(ret, err) {
		api.sendEvent({
			name : 'chat'
		});
		webSocket.close();
		api.closeWin();
	});
	//返回按钮监听
	api.addEventListener({
		name : 'navbackbtn'
	}, function(ret, err) {
		api.sendEvent({
			name : 'chat'
		});
		webSocket.close();
		api.closeWin();
	});
	api.addEventListener({
		name : 'uploadHeader'
	}, function(ret, err) {
		sendMsg(ret.value.type, ret.value.header, ret.value.dur_time);
	});
	api.addEventListener({
		name : 'cheangeImgList'
	}, function(ret, err) {
		if (isNotNull(ret)) {
			if (ret.value.imgList.eventType == 'confirm') {
				for (var i = 0; i < ret.value.imgList.list.length; i++) {
					uploadPic(ret.value.imgList.list[i].path, 2);
				}
			}
		}
	});
};

function openSocket() {

	showProgressNew('正在连接', '请稍后...');
	if (isConnect == 1 || connecting)
		return;
	connecting = true;
	webSocket.addEventListener(function(ret, err) {

		if (isNotNull(ret)) {
			if (ret.code == 2) {

				var json = JSON.parse(ret.msg);
				onMessage(json);
				//				api.sendEvent({
				//					name : 'chat'
				//				});
			} else if (ret.code == 1) {

				isConnect = 1;
				reconnectTime = 0;
				//toast('连接服务器成功');
				if (isNotNull(user)) {
					var result = {};
					result.cmd = 'connect';
					result.id = user.id;
					result.realName = user.realName;
					result.header = user.header;
					result.sendId = sendId;
					result.chatId = chatId;
					sendSocket(result);
				}
			} else if (ret.code == 3) {
				connectSocket();
			} else if (ret.code == 4 || ret.code == 5) {
				connectSocket();
			}
		} else {
			connectSocket();
		}
	});
	connectSocket();
}

function connectSocket() {
	connecting = false;
	if (isConnect == 1)
		isConnect = 0;
	if (reconnectTime < 30) {
		reconnectTime++;
	} else {
		disconnect = true;
		hideProgress();
		toast('服务器连接发生错误');
	}
	if (reconnectTime > 0) {
		window.setTimeout(function() {
			webSocket.open({
				"url" : "ws://47.111.10.16:8282/"
			}, function(ret) {
				showProgressNew('正在连接', '请稍后...');
			});
		}, 2000);
	} else {
		webSocket.open({
			"url" : "ws://47.111.10.16:8282/"
		}, function(ret) {
			showProgressNew('正在连接', '请稍后...');
		});
	}
}

function onMessage(json) {

	switch(json.cmd) {
		case 'userSend':
			appendSelfMsg(json);
			break;
		case 'sendMsg':
			appendUserMsg(json);
			break;
		case 'connect':
			appendHistoryMsg(json);
			break;
		case 'close':
			bolt();
			break;
	}
}

function bolt() {

	api.alert({
		title : '提示',
		msg : '本次聊天被强制结束！',
	}, function(ret, err) {

		api.closeWin();
	});

}

function appendSelfMsg(json) {

	var html = '';
	html += '<div class="content-box" id="content_' + json.time + '">';
	html += '<div class="with-time">' + formatChatTime(parseInt(json.time) * 1000) + '</div>';
	if (json.type == 1) {
		html += '<div class="with-right">';
		html += '<div class="with-img-right">';
		if (!isNotNull(user.header)) {
			html += '<img src="../img/verify03.png" />';
		} else {
			html += '<img src="' + user.header + '"/>';
		}
		html += '</div>';
		html += '<div class="with-text-right" id="selfMsg' + json.time + '" tapmode=""  onclick="setClipboardChat(\'' + json.msg + '\')">';
		html += transEmo(json.msg);
		html += '</div>';
		html += '</div>';
	} else if (json.type == 2) {
		imgArr.push(json.msg);
		html += '<div class="with-right">';
		html += '<div class="with-img-right">';
		if (!isNotNull(user.header)) {
			html += '<img src="../img/verify03.png" />';
		} else {
			html += '<img src="' + user.header + '"/>';
		}
		html += '</div>';
		html += '<div class="with-text-right divcss5" style="width:125px;background:#fff">';
		html += '<img src="' + json.msg + '" style="width: 125px;height: 100px;"  tapmode="" onclick="browsePictures(\'' + json.msg + '\');"/>';
		html += '</div>';
		html += '</div>';
	} else if (json.type == 3) {

		html += '<div class="vo-right">';
		html += '<div class="vo-text-right"  tapmode="" style="width:' + getDuration(json.dur_time) * 2.5 + 'px !important" onclick="play(\'' + json.msg + '\',\'right_b_' + json.time + '\')"><img src="../img/right_b.png" id="right_b_' + json.time + '"  data-icon="../img/right_b.png" data-iconGif="../img/right_b1.gif"/> &nbsp;' + json.dur_time + '"</div>';
		if (!isNotNull(user.header)) {
			html += '<div class="with-img-right"><img src="../img/verify03.png"/></div>';
		} else {
			html += '<div class="with-img-right"><img src="' + user.header + '" /></div>';
		}
		html += '</div>';
	} else if (json.type == 4) {
		html += '<div class="consulting">';
		html += '<div class="consultingbox" tapmode="" onclick="getGoods(\'' + json.product[0].id + '\',\'' + json.product[0].is_groupbuy + '\',\'' + json.product[0].status + '\');">';
		html += '<div class="consultingbox-img"><img src="../img/productListDefault.png" id="product_chat_' + json.time + '_' + json.product[0].id + '"/></div>';
		html += '<div class="consulting-title">' + json.product[0].product_name + '</div>';
		html += '<div class="consulting-text">';

		if (json.product[0].is_groupbuy == 1) {
			html += '<div class="consultingText"><span>￥</span><span>' + formatterNumber(json.product[0].groupbuy_price) + '</span></div>';
			html += '<div class="consultingText-color">已拼' + getNumber(json.product[0].sale_num) + '件</div>';
		} else {
			html += '<div class="consultingText"><span>￥</span><span>' + formatterNumber(json.product[0].preferential_price) + '</span></div>';

			html += '<div class="consultingText-color">已售' + getNumber(json.product[0].sale_num) + '件</div>';
		}

		html += '</div>';
		html += '</div>';
		html += '<div class="with-img-right">';
		if (!isNotNull(user.header)) {
			html += '<img src="../img/verify03.png" />';
		} else {
			html += '<img src="' + user.header + '" />';
		}
		html += '</div>';
		html += '</div>';
	} else if (json.type == 5) {
		html += '<div class="vo-right">';
		html += '<div class="new" tapmode="" onclick="getOrder(\'' + json.order[0].id + '\',\'' + json.order[0].order_type + '\');">';
		html += '<div class="new-top">';
		html += '<div class="newimg"><img src="../img/productListDefault.png"  id="order_chat_' + json.order[0].id + '_' + json.time + '"/></div>';
		html += '<div class="new-titme">';
		html += '<div class="new-title">' + json.order[0].product_name + '</div>';
		html += '<div class="new-red">';
		if (json.order[0].status == 1) {
			html += '待发货';
		} else if (json.order[0].status == 2) {
			html += '待收货';
		} else if (json.order[0].status == 3) {
			html += '待评价';
		} else if (json.order[0].status == 4) {
			html += '已完成';
		} else if (json.order[0].status == 5) {
			html += '售后服务';
		}
		html += '</div>';
		html += '</div>';
		html += '</div>';
		html += '<div class="numberNew">订单编号：<span>' + json.order[0].order_code + '</span></div>';
		html += '</div>';
		html += '<div class="with-img-right">';
		if (!isNotNull(user.header)) {
			html += '<img src="../img/verify03.png" />';
		} else {
			html += '<img src="' + user.header + '" />';
		}
		html += '</div>';
		html += '</div>';
	}
	html += '</div>';
	$('#chatcontent').append(html);
	api.parseTapmode();
	if (json.type == 4) {
		cacheImage('product_chat_' + json.time + '_' + json.product[0].id, json.product[0].product_img2);
	} else if (json.type == 5) {
		cacheImage('order_chat_' + json.order[0].id + '_' + json.time, json.order[0].product_img2);
	}
	if (systemType == "android") {
		if ($('#chatcontent').height() > api.winHeight) {
			document.body.scrollTop += $("#content_" + json.time).height();

		}
	} else {
		document.body.scrollTop = document.body.scrollHeight;
	}
}

function appendUserMsg(json) {
	var html = '';
	html += '<div class="content-box" id="content_send_' + json.time + '">';
	html += ' <div class="with-time">' + formatChatTime(parseInt(json.time) * 1000) + '</div>';
	if (json.type == 1) {
		html += '<div class="with-left">';
		html += '<div class="with-img">';
		if (!isNotNull(chatImg)) {
			html += '<img src="../img/shop.png" />';
		} else {
			html += '<img src="' + chatImg + '"/>';
		}
		html += '</div>';
		html += '<div class="with-text" id="UserMsg' + json.time + '" tapmode=""  onclick="setClipboardChat(\'' + json.msg + '\')">';
		html += transEmo(json.msg);
		html += '</div>';
		html += '</div>';
	} else if (json.type == 2) {
		imgArr.push(json.msg);
		html += '<div class="with-left">';
		html += '<div class="with-img">';
		if (!isNotNull(chatImg)) {
			html += '<img src="../img/shop.png" />';
		} else {
			html += '<img src="' + chatImg + '"/>';
		}
		html += '</div>';
		html += '<div class="with-text divcss5" style="width:125px;">';
		html += '<img src="' + json.msg + '" style="width: 125px;height: 100px;" tapmode="" onclick="browsePictures(\'' + json.msg + '\');"/>';
		html += '</div>';
		html += '</div>';
	} else if (json.type == 3) {

		html += '<div class="vo-left">';
		if (!isNotNull(chatImg)) {
			html += '<div class="with-img"><img src="../img/shop.png" /></div>';
		} else {
			html += '<div class="with-img"><img src="' + chatImg + '"/></div>';
		}
		html += '<div class="vo-text-left"  style="width:' + getDuration(json.dur_time) * 2.5 + 'px !important" tapmode=""  onclick="play(\'' + json.msg + '\',\'left_b_m_' + json.time + '\')"><img src="../img/left_b.png" id="left_b_m_' + json.time + '" data-icon="../img/left_b.png" data-iconGif="../img/left_b1.gif"/> &nbsp;' + json.dur_time + '"</div>';
		html += '</div>';
	} else if (json.type == 4) {
		html += '<div class="consultings">';
		html += '<div class="with-img-right">';
		if (!isNotNull(chatImg)) {
			html += '<img src="../img/shop.png" />';
		} else {
			html += '<img src="' + chatImg + '"/>';
		}
		html += '</div>';
		html += '<div class="consultingbox"  tapmode="" onclick="getGoods(\'' + json.product[0].id + '\',\'' + json.product[0].is_groupbuy + '\',\'' + json.product[0].status + '\');">';
		html += '<div class="consultingbox-img"><img src="../img/productListDefault.png" id="product_chat_' + json.time + '_' + json.product[0].id + '" /></div>';
		html += '<div class="consulting-title">' + json.product[0].product_name + '</div>';
		html += '<div class="consulting-text">';
		if (json.product[0].is_groupbuy == 1) {
			html += '<div class="consultingText"><span>￥</span><span>' + formatterNumber(json.product[0].groupbuy_price) + '</span></div>';
			html += '<div class="consultingText-color">已拼' + getNumber(json.product[0].sale_num) + '件</div>';
		} else {
			html += '<div class="consultingText"><span>￥</span><span>' + formatterNumber(json.product[0].preferential_price) + '</span></div>';
			html += '<div class="consultingText-color">已售' + getNumber(json.product[0].sale_num) + '件</div>';
		}
		html += '</div>';
		html += '</div>';
		html += '</div>';

	} else if (json.type == 5) {

		html += '<div class="vo-left">';
		html += '<div class="with-img">';
		if (!isNotNull(chatImg)) {
			html += '<img src="../img/shop.png" />';
		} else {
			html += '<img src="' + chatImg + '"/>';
		}
		html += '</div>';
		html += '<div class="new" tapmode="" onclick="getOrder(\'' + json.order[0].id + '\',\'' + json.order[0].order_type + '\');">';
		html += '<div class="new-top">';
		html += '<div class="newimg"><img src="../img/productListDefault.png" id="order_chat_' + json.order[0].id + '_' + json.time + '"/></div>';
		html += '<div class="new-titme">';
		html += '<div class="new-title">' + json.order[0].product_name + '</div>';
		html += '<div class="new-red">';
		if (json.order[0].status == 1) {
			html += '待发货';
		} else if (json.order[0].status == 2) {
			html += '待收货';
		} else if (json.order[0].status == 3) {
			html += '待评价';
		} else if (json.order[0].status == 4) {
			html += '已完成';
		} else if (json.order[0].status == 5) {
			html += '售后服务';
		}
		html += '</div>';
		html += '</div>';
		html += '</div>';
		html += '<div class="numberNew">订单编号：<span>' + json.order[0].order_code + '</span></div>';
		html += '</div>';
		html += '</div>';
	}

	html += '</div>';
	$('#chatcontent').append(html);
	api.parseTapmode();
	if (json.type == 4) {
		cacheImage('product_chat_' + json.time + '_' + json.product[0].id, json.product[0].product_img2);
	} else if (json.type == 5) {
		cacheImage('order_chat_' + json.order[0].id + '_' + json.time, json.order[0].product_img2);
	}
	if (systemType == "android") {
		if ($('#chatcontent').height() > api.winHeight) {
			document.body.scrollTop += $("#content_send_" + json.time).height() + 10;
		}
	} else {
		document.body.scrollTop = document.body.scrollHeight;
	}

}

//历史记录
function appendHistoryMsg(json) {
	$('#chatcontent').html('');
	if (json.chat_id > 0) {
		chatId = json.chat_id;
	}
	if (json.status == 1 && isNotNull(json.chatHistory)) {
		var html = '';
		historyNum = json.chatHistory.length;
		for (var i = 0; i < json.chatHistory.length; i++) {

			if (json.chatHistory[i].send_user == user.id) {//发送人是登录用户

				html += '<div class="content-box">';
				html += ' <div class="with-time">' + formatChatTime(parseInt(json.chatHistory[i].send_time) * 1000) + '</div>';

				if (json.chatHistory[i].msg_type == 1) {
					html += '<div class="with-right">';
					html += '<div class="with-img-right">';
					if (!isNotNull(user.header)) {
						html += '<img src="../img/verify03.png" />';
					} else {
						html += '<img src="' + user.header + '" />';
					}
					html += '</div>';
					html += '<div class="with-text-right" id="selfMsg' + json.chatHistory[i].send_time + '" tapmode=""  onclick="setClipboardChat(\'' + json.chatHistory[i].contents + '\')">';
					html += transEmo(json.chatHistory[i].contents);
					html += '</div>';
					html += '</div>';
				} else if (json.chatHistory[i].msg_type == 2) {
					imgArr.push(json.chatHistory[i].contents);
					html += '<div class="with-right">';
					html += '<div class="with-img-right">';
					if (!isNotNull(user.header)) {
						html += '<img src="../img/verify03.png" />';
					} else {
						html += '<img src="' + user.header + '"/>';
					}
					html += '</div>';
					html += '<div class="with-text-right divcss5" style="width:125px;">';
					html += '<img src="' + json.chatHistory[i].contents + '" style="width: 125px;height:100px;"  tapmode="" onclick="browsePictures(\'' + json.chatHistory[i].contents + '\');"/>';
					html += '</div>';
					html += '</div>';
				} else if (json.chatHistory[i].msg_type == 3) {

					html += '<div class="vo-right">';
					html += '<div class="vo-text-right"  tapmode="" style="width:' + getDuration(json.chatHistory[i].dur_time) * 2.5 + 'px !important" onclick="play(\'' + json.chatHistory[i].contents + '\',\'right_b_' + json.chatHistory[i].send_time + '\')"><img src="../img/right_b.png" id="right_b_' + json.chatHistory[i].send_time + '"  data-icon="../img/right_b.png" data-iconGif="../img/right_b1.gif"/> &nbsp;' + json.chatHistory[i].dur_time + '"</div>';
					if (!isNotNull(user.header)) {
						html += '<div class="with-img-right"><img src="../img/verify03.png" /></div>';
					} else {
						html += '<div class="with-img-right"><img src="' + user.header + '" /></div>';
					}
					html += '</div>';
				} else if (json.chatHistory[i].msg_type == 4) {
					html += '<div class="consulting">';
					html += '<div class="consultingbox" tapmode="" onclick="getGoods(\'' + json.chatHistory[i].product[0].id + '\',\'' + json.chatHistory[i].product[0].is_groupbuy + '\',\'' + json.chatHistory[i].product[0].status + '\');">';
					html += '<div class="consultingbox-img"><img src="../img/productListDefault.png" id="product_ls_' + json.chatHistory[i].id + '"/></div>';
					html += '<div class="consulting-title">' + json.chatHistory[i].product[0].product_name + '</div>';
					html += '<div class="consulting-text">';

					if (json.chatHistory[i].product[0].is_groupbuy == 1) {
						html += '<div class="consultingText"><span>￥</span><span>' + formatterNumber(json.chatHistory[i].product[0].groupbuy_price) + '</span></div>';
						html += '<div class="consultingText-color">已拼' + getNumber(json.chatHistory[i].product[0].sale_num) + '件</div>';
					} else {
						html += '<div class="consultingText"><span>￥</span><span>' + formatterNumber(json.chatHistory[i].product[0].preferential_price) + '</span></div>';

						html += '<div class="consultingText-color">已售' + getNumber(json.chatHistory[i].product[0].sale_num) + '件</div>';
					}

					html += '</div>';
					html += '</div>';
					html += '<div class="with-img-right">';
					if (!isNotNull(user.header)) {
						html += '<img src="../img/verify03.png" />';
					} else {
						html += '<img src="' + user.header + '" />';
					}
					html += '</div>';
					html += '</div>';
				} else if (json.chatHistory[i].msg_type == 5) {

					html += '<div class="vo-right">';
					html += '<div class="new" tapmode="" onclick="getOrder(\'' + json.chatHistory[i].order[0].id + '\',\'' + json.chatHistory[i].order[0].order_type + '\');">';
					html += '<div class="new-top">';
					html += '<div class="newimg"><img src="../img/productListDefault.png"  id="order_ls_' + json.chatHistory[i].id + '"/></div>';
					html += '<div class="new-titme">';
					html += '<div class="new-title">' + json.chatHistory[i].order[0].product_name + '</div>';
					html += '<div class="new-red">';
					if (json.chatHistory[i].order[0].status == 1) {
						html += '待发货';
					} else if (json.chatHistory[i].order[0].status == 2) {
						html += '待收货';
					} else if (json.chatHistory[i].order[0].status == 3) {
						html += '待评价';
					} else if (json.chatHistory[i].order[0].status == 4) {
						html += '已完成';
					} else if (json.chatHistory[i].order[0].status == 5) {
						html += '售后服务';
					}
					html += '</div>';
					html += '</div>';
					html += '</div>';
					html += '<div class="numberNew">订单编号：<span>' + json.chatHistory[i].order[0].order_code + '</span></div>';
					html += '</div>';
					html += '<div class="with-img">';
					if (!isNotNull(user.header)) {
						html += '<img src="../img/verify03.png" />';
					} else {
						html += '<img src="' + user.header + '" />';
					}
					html += '</div>';
					html += '</div>';

				}
				html += '</div>';

			} else {//接收人是登录用户

				html += '<div class="content-box">';
				html += ' <div class="with-time">' + formatChatTime(parseInt(json.chatHistory[i].send_time) * 1000) + '</div>';

				if (json.chatHistory[i].msg_type == 1) {
					html += '<div class="with-left">';
					html += '<div class="with-img">';
					if (!isNotNull(chatImg)) {
						html += '<img src="../img/shop.png" />';
					} else {
						html += '<img src="' + chatImg + '" />';
					}
					html += '</div>';
					html += '<div class="with-text" id="UserMsg' + json.chatHistory[i].send_time + '" tapmode=""  onclick="setClipboardChat(\'' + json.chatHistory[i].contents + '\')">';
					html += transEmo(json.chatHistory[i].contents);
					html += '</div>';
					html += '</div>';
				} else if (json.chatHistory[i].msg_type == 2) {
					imgArr.push(json.chatHistory[i].contents);
					html += '<div class="with-left">';
					html += '<div class="with-img">';
					if (!isNotNull(chatImg)) {
						html += '<img src="../img/shop.png" />';
					} else {
						html += '<img src="' + chatImg + '"/>';
					}
					html += '</div>';
					html += '<div class="with-text divcss5" style="width:125px;">';
					html += '<img src="' + json.chatHistory[i].contents + '" style="width: 125px;height: 100px;"  tapmode="" onclick="browsePictures(\'' + json.chatHistory[i].contents + '\');"/>';
					html += '</div>';
					html += '</div>';
				} else if (json.chatHistory[i].msg_type == 3) {

					html += '<div class="vo-left">';
					if (!isNotNull(chatImg)) {
						html += '<div class="with-img"><img src="../img/shop.png" /></div>';
					} else {
						html += '<div class="with-img"><img src="' + chatImg + '" /></div>';
					}
					html += '<div class="vo-text-left"  tapmode="" style="width:' + getDuration(json.chatHistory[i].dur_time) * 2.5 + 'px !important" onclick="play(\'' + json.chatHistory[i].contents + '\',\'left_b_m_' + json.chatHistory[i].send_time + '\')"><img src="../img/left_b.png" id="left_b_m_' + json.chatHistory[i].send_time + '" data-icon="../img/left_b.png" data-iconGif="../img/left_b1.gif"/> &nbsp;' + json.chatHistory[i].dur_time + '"</div>';
					html += '</div>';
				} else if (json.chatHistory[i].msg_type == 4) {
					html += '<div class="consultings">';
					html += '<div class="with-img-right">';
					if (!isNotNull(chatImg)) {
						html += '<img src="../img/shop.png" />';
					} else {
						html += '<img src="' + chatImg + '"/>';
					}
					html += '</div>';
					html += '<div class="consultingbox"  tapmode="" onclick="getGoods(\'' + json.chatHistory[i].product[0].id + '\',\'' + json.chatHistory[i].product[0].is_groupbuy + '\',\'' + json.chatHistory[i].product[0].status + '\');">';
					html += '<div class="consultingbox-img"><img src="../img/productListDefault.png" id="product_ls_' + json.chatHistory[i].id + '" /></div>';
					html += '<div class="consulting-title">' + json.chatHistory[i].product[0].product_name + '</div>';
					html += '<div class="consulting-text">';
					if (json.chatHistory[i].product[0].is_groupbuy == 1) {
						html += '<div class="consultingText"><span>￥</span><span>' + formatterNumber(json.chatHistory[i].product[0].groupbuy_price) + '</span></div>';
						html += '<div class="consultingText-color">已拼' + getNumber(json.chatHistory[i].product[0].sale_num) + '件</div>';
					} else {
						html += '<div class="consultingText"><span>￥</span><span>' + formatterNumber(json.chatHistory[i].product[0].preferential_price) + '</span></div>';
						html += '<div class="consultingText-color">已售' + getNumber(json.chatHistory[i].product[0].sale_num) + '件</div>';
					}
					html += '</div>';
					html += '</div>';
					html += '</div>';
				} else if (json.chatHistory[i].msg_type == 5) {
					html += '<div class="vo-left">';
					html += '<div class="with-img">';
					if (!isNotNull(chatImg)) {
						html += '<img src="../img/shop.png" />';
					} else {
						html += '<img src="' + chatImg + '"/>';
					}
					html += '</div>';
					html += '<div class="new newes" tapmode="" onclick="getOrder(\'' + json.chatHistory[i].order[0].id + '\',\'' + json.chatHistory[i].order[0].order_type + '\');">';
					html += '<div class="new-top">';
					html += '<div class="newimg"><img src="../img/productListDefault.png" id="order_ls_' + json.chatHistory[i].id + '"/></div>';
					html += '<div class="new-titme">';
					html += '<div class="new-title">' + json.chatHistory[i].order[0].product_name + '</div>';
					html += '<div class="new-red">';
					if (json.chatHistory[i].order[0].status == 1) {
						html += '待发货';
					} else if (json.chatHistory[i].order[0].status == 2) {
						html += '待收货';
					} else if (json.chatHistory[i].order[0].status == 3) {
						html += '待评价';
					} else if (json.chatHistory[i].order[0].status == 4) {
						html += '已完成';
					} else if (json.chatHistory[i].order[0].status == 5) {
						html += '售后服务';
					}
					html += '</div>';
					html += '</div>';
					html += '</div>';
					html += '<div class="numberNew">订单编号：<span>' + json.chatHistory[i].order[0].order_code + '</span></div>';
					html += '</div>';
					html += '</div>';

				}
				html += '</div>';
			}
		}
		
		$('#chatcontent').append(html);
		api.parseTapmode();
		for (var i = 0; i < json.chatHistory.length; i++) {
			if (json.chatHistory[i].msg_type == 4) {//商品
				cacheImage("product_ls_" + json.chatHistory[i].id, json.chatHistory[i].product[0].product_img2);
			} else if (json.chatHistory[i].msg_type == 5) {//订单
				cacheImage("order_ls_" + json.chatHistory[i].id, json.chatHistory[i].order[0].product_img2);
			}
		}
	}

	//-------------------------------
	
	var html2 = '';
	if(isNotNull(json.service_default)){
		html2 += '<div class="content-box">';
		html2 += '<div class="with-left">';
		html2 += '<div class="with-img">';
		if (!isNotNull(chatImg)) {
			html2 += '<img src="../img/shop.png" />';
		} else {
			html2 += '<img src="' + chatImg + '" />';
		}
		html2 += '</div>';
		html2 += '<div class="with-text" tapmode="">';
		html2 += transEmo(json.service_default);
		html2 += '</div>';
		html2 += '</div>';
		html2 += '</div>';
	}
	if (isNotNull(json.problemConfig)) {

		html2 += '<div class="content-box">';
		html2 += '<div class="with-left">';
		html2 += '<div class="with-img">';
		if (!isNotNull(chatImg)) {
			html2 += '<img src="../img/shop.png" />';
		} else {
			html2 += '<img src="' + chatImg + '" />';
		}
		html2 += '</div>';
		html2 += '<div class="newlioatian">';
		html2 += '<div calss="newliaotianTitle">亲，' + getHour() + '好，有什么可以帮助你的吗？</div>';
		html2 += '<div class="newliaotianText">';
		html2 += '<ul>';
		for (var i = 0; i < json.problemConfig.length; i++) {
			html2 += '<li tapmode="" onclick="automaticSendMsg(\'' + json.problemConfig[i].answer + '\',1)">' + json.problemConfig[i].question + '</li>';
		}
		html2 += '</ul>';
		html2 += '</div>';
		html2 += '</div>';
		html2 += '</div>';
		html2 += '</div>';
	}
	if (isNotNull(jsonData.product)) {

		html2 += '<div class="dingnewnew">';
		html2 += '<div class="dingnewnew-top">';
		html2 += '<div class="dingnewnewimg"><img src="../img/groupBullet.png" class="img" id="product_yl_' + jsonData.product.id + '"/></div>';
		html2 += '<div class="dingnewnew-title-box">';
		html2 += '<div class="dingnewnew-title">' + jsonData.product.productName + '</div>';
		html2 += '<div class="dingls">';
		if (jsonData.product.goodTyle == 'good') {
			html2 += '<div class="dingl-left"><span>￥</span><span>' + formatterNumber(jsonData.product.preferentialPrice) + '</span><span>零售价</span></div>';
		} else {
			html2 += '<div class="dingl-left"><span>￥</span><span>' + formatterNumber(jsonData.product.groupbuyPrice) + '</span><span>拼单价</span></div>';
		}
		html2 += '<div class="ding-buttons"><button tapmode="" id="button" onclick="consultationGoods(\'' + jsonData.product.id + '\');">咨询该商品</button></div>';
		html2 += '</div>';
		html2 += '</div>';
		html2 += '</div>';
		if (jsonData.product.page == []) {
			html2 += '<div class="dingtext" style="border-top: 1px solid #f5f5f5">';

			for (var i = 0; i < jsonData.product.page.length; i++) {
				if (i < 4) {
					html2 += '<div class="dingtext-test">' + jsonData.product.page[i].title + '</div>';
				}
			}
			html2 += '</div>';
		} else {
			html2 += '';
		}

		html2 += '</div>';

	}
	$('#chatcontent').append(html2);
	api.parseTapmode();
	if (isNotNull(jsonData.product)) {
		cacheImage("product_yl_" + jsonData.product.id, jsonData.product.productImg2);
	}
	hideProgress();
	if (systemType == "android") {
		document.body.scrollTop += $("#chatcontent").height();
	} else {
		document.body.scrollTop = document.body.scrollHeight;
	}
	//document.body.scrollTop = document.body.scrollHeight;
}

function sendSocket(params) {
	params.pushUserId = pushUserId;

	//推送对象用户ID
	webSocket.send({
		"msg" : JSON.stringify(params)
	});
}

function sendMsg(type, msg, dur_time) {
	var result = {};
	result.cmd = 'sendMsg';
	result.sendId = sendId;
	result.type = type;
	result.chatId = chatId;
	if (type == 1) {
		var face = new RegExp(/\[([^\s\[\]]+?)\]/g);
		if (face.test(msg)) {
			var transMsg;
			transMsg = msg.replace(/\[(.*?)\]/gm, function(match) {
				match = 'face' + match;
				return match;
			});
			result.msg = transMsg;
		} else {
			result.msg = msg;
		}

	} else if (type == 3) {
		result.dur_time = dur_time;
		result.msg = msg;
	} else if (type == 4 || type == 5) {
		result.otherId = msg;
	} else {
		result.msg = msg;
	}

	sendSocket(result);
}

function initChatInput() {
	UIChatBox = api.require('UIChatBox');
	var buttonHtml = [{
		title : '图片',
		normalImg : 'widget://res/img/chatBox_album1.png',
		activeImg : 'widget://res/img/chatBox_album2.png'
	}, {
		title : '拍照',
		normalImg : 'widget://res/img/chatBox_cam1.png',
		activeImg : 'widget://res/img/chatBox_cam2.png'
	}, {
		title : '订单',
		normalImg : 'widget://res/img/chatBox_order1.png',
		activeImg : 'widget://res/img/chatBox_order2.png'
	}];

	UIChatBox.open({
		placeholder : '请输入内容',
		maxRows : 7,
		emotionPath : 'widget://res/img/emotion',
		texts : {
			recordBtn : {
				normalTitle : '按住说话',
				activeTitle : '松开结束'
			},
			sendBtn : {
				title : '发送'
			}
		},
		styles : {
			inputBar : {
				borderColor : '#d9d9d9',
				bgColor : '#f2f2f2'
			},
			inputBox : {
				borderColor : '#B3B3B3',
				bgColor : '#FFFFFF'
			},
			emotionBtn : {
				normalImg : 'widget://res/img/chatBox_face1.png'
			},
			extrasBtn : {
				normalImg : 'widget://res/img/chatBox_add1.png'
			},
			keyboardBtn : {
				normalImg : 'widget://res/img/chatBox_key1.png'
			},
			speechBtn : {
				normalImg : 'widget://res/img/vioce_icon_key2.png'
			},
			recordBtn : {
				normalBg : '#FFFFFF',
				activeBg : '#999999',
				color : '#000',
				size : 15
			},
			recordPanelBtn : {
				height : 200
			},
			indicator : {
				target : 'both',
				color : '#c4c4c4',
				activeColor : '#9e9e9e'
			},
			sendBtn : {
				titleColor : '#FFFFFF',
				bg : '#2cc9ff',
				activeBg : '#46a91e',
				titleSize : 14,

			}
		},
		extras : {
			titleSize : 10,
			titleColor : '#a3a3a3',
			btns : buttonHtml
		}
	}, function(ret, err) {

		if (ret) {
			if (ret.eventType == 'send') {
				if (ret.msg.length > 0) {

					sendMsg(1, ret.msg);
				}
			}
			if (ret.eventType == 'clickExtras') {

				if (ret.index == 0) {
					tag = true;
					selectImageList(3);
				} else if (ret.index == 1) {
					tag = true;
					openCamera(function(ret, err) {
						if (isNotNull(ret)) {
							if (isNotNull(ret.data)) {
								uploadPic(ret.data, 2);
							}
						}
					});
				} else if (ret.index == 2) {
					getChatOrder();
				}
			}
			if (ret.eventType == 'show') {
				$api.css(blank, 'height:' + ret.inputBarHeight * pix + 'px;');
				document.body.scrollTop = document.body.scrollHeight;
			}

		}
	});
	UIChatBox.addEventListener({
		target : 'recordBtn',
		name : 'press'
	}, function(ret, err) {
		$("#gif").show();
		if (ret) {
			$("#" + old_play_id).attr('src', $('#' + old_play_id).attr("data-icon"));
			api.stopPlay();
			api.startRecord({
				path : 'fs:///voice/voice.amr'
			});

			setTimeout(function() {
				$("#gif").hide();
				api.stopRecord({
					path : 'fs://a.amr'
				}, function(ret, err) {
					if (ret) {
						var path = ret.path;
						//d(path);
						var dur_time = ret.duration;

						uploadPic(path, 3, dur_time);
						//sendMsg(3, path, dur_time);
						setTimeout("scorllContent()", 50);

					}
				});
				toast('录音时间最多只能录60秒哦')
			}, 60000);

		}
	});

	UIChatBox.addEventListener({
		target : 'recordBtn',
		name : 'press_cancel'
	}, function(ret, err) {
		$("#gif").hide();
		if (ret) {
			api.stopRecord({
				path : 'fs://a.amr'
			}, function(ret, err) {
				if (ret) {
					var path = ret.path;
					//d(path);
					var dur_time = ret.duration;

					if (dur_time == 0) {
						toast('录音时间要超过1秒哦');
					} else if (dur_time > 60) {
						toast('录音时间最多只能录60秒哦');
					} else {
						//sendMsg(3, path, dur_time);
						uploadPic(path, 3, dur_time);
					}

				}
			});
		} else {

		}
	});

	UIChatBox.addEventListener({
		target : 'recordBtn',
		name : 'move_out_cancel'
	}, function(ret, err) {
		$("#gif").hide();
		if (ret) {
			api.stopRecord({
				path : 'fs://a.amr'
			}, function(ret, err) {
				if (ret) {
					var path = ret.path;
					//d(path);
					var dur_time = ret.duration;
					if (dur_time == 0) {
						toast('录音时间要超过1秒哦');
					} else if (dur_time > 60) {
						toast('录音时间最多只能录60秒哦')
					} else {
						uploadPic(path, 3, dur_time);
						//sendMsg(3, path, dur_time);
						setTimeout("scorllContent()", 50);
					}
				}
			});
		} else {

		}
	});

	//监听 inputBar
	UIChatBox.addEventListener({
		target : 'inputBar',
		name : 'move'
	}, function(ret, err) {

		if (ret.panelHeight > 0) {
			$api.css(blank, 'height:' + (ret.panelHeight - ret.inputBarHeight) * pix + 'px;');
		} else {
			$api.css(blank, 'height:0px;');
		}
		document.body.scrollTop = document.body.scrollHeight;
	});
}

function uploadPic(path, type, dur_time) {

	api.showProgress({
		title : '正在上传',
		modal : true
	});
	uploadImg(path, type, dur_time);
}

function scorllContent() {
	if (api.systemType != 'ios') {
		$("#bar").css("height", '30px');
	}
	document.getElementById('bar').scrollIntoView();
	$("body,html").animate({
		scrollTop : $(window).scrollTop()
	});
}

//播放语音
function play(path, e) {

	if (old_play_id != e) {// 正在播放再次点击停止播放上一个
		$("#" + old_play_id).attr('src', $('#' + old_play_id).attr("data-icon"));
		api.stopPlay();
	} else if (old_play_id == e) {
		$("#" + old_play_id).attr('src', $('#' + old_play_id).attr("data-icon"));
		api.stopPlay();
		old_play_id = null;
		return;
	}
	old_play_id = e;
	$("#" + e).attr('src', $('#' + e).attr("data-iconGif"));
	getCompressImg(path, function(ret, err) {

		api.startPlay({
			path : ret.savePath
		}, function(ret1, err1) {
			if (ret1) {
				$("#" + e).attr('src', $('#' + e).attr("data-icon"));
			} else {
				api.stopPlay();
			}
		});
	});

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
		if (time / 1000 - old_sendTime > 120) {
			html = formatDate3(new Date(time));
			old_sendTime = time / 1000;
		}
	} else if (((mydate.getTime() - time) / 1000) > ((mydate.getTime() - (morning) * 1000) / 1000) && ((mydate.getTime() - time) / 1000) < ((mydate.getTime() - (morning - 86400) * 1000) / 1000)) {//小于2天，显示昨天；
		if (time / 1000 - old_sendTime > 120) {
			html = "昨天" + " " + formatDate4(new Date(time));
			old_sendTime = time / 1000;
		}
	} else if (((mydate.getTime() - time) / 1000) > 86400 && ((mydate.getTime() - time) / 1000) < 604800) {// 消息大于2天、小于1周，显示星期+收发消息的时间；
		if (time / 1000 - old_sendTime > 120) {
			html = str + " " + formatDate4(new Date(time));
			old_sendTime = time / 1000;
		}
	} else {

		if (new Date(time).toDateString() === new Date().toDateString()) {

			//今天
			if (time / 1000 - old_sendTime > 120) {// 当天的消息，以每2分钟为一个跨度的显示时间；
				html = formatDate4(new Date(time));

				old_sendTime = time / 1000;
			}
		} else if (new Date(time) < new Date()) {
			//之前
			if (time / 1000 - old_sendTime > 120) {
				html = str + " " + formatDate4(new Date(time));
				old_sendTime = time / 1000;
			}
		}
	}

	return html;
}

function formatDate(inputTime) {
	var date = new Date(inputTime);
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
	return y + '年' + m + '月' + d + '日 ' + h + ':' + minute;
}

function formatDate2(now, time) {
	var year = now.getFullYear();
	month = now.getMonth() + 1;
	date = now.getDate();
	hour = now.getHours();
	minute = now.getMinutes();
	second = now.getSeconds();
	return year + "" + month + "" + date + "" + now.getHours() + "" + (now.getMinutes() + time) + "" + now.getSeconds();
}

function formatDate3(now) {
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

//图片浏览器
function browsePictures(imgUrl) {
	UIChatBox.closeKeyboard();
	//关闭键盘
	var number = 0;
	for (var i = 0; i < imgArr.length; i++) {
		if (imgArr[i] == imgUrl) {
			number = i;
		}
	}
	photoBrowser.open({
		images : imgArr,
		activeIndex : number,
		placeholderImg : '../img/chatmrt.png',
		bgColor : '#000'
	}, function(ret, err) {
		if (ret.eventType == 'click') {//单点关闭
			photoBrowser.close();
		}
	});
}

function getChatOrder() {
	var url = "shop/selectOrderByShopId.do";
	var bodyParam = {
		body : {
			shopId : shopId
		}
	};
	showProgress();

	ajaxRequest(url, bodyParam, function(ret, err) {

		hideProgress();
		if (err) {
			UIChatBox.show();
			toast('服务器开了个小差，在刷新尝试一下');
		} else {

			if (ret.code == 1) {

				if (isNotNull(ret.orderList)) {
					UIChatBox.hide();
					$(".single").toggleClass("singles", 1000);
					$(".CouponBulletin").toggleClass("CouponBulletin-on", 1000);
					$(".body").toggleClass("bodys", 1000);
					$('html,body').addClass('ovfHiden');
					var html = '';
					for (var i = 0; i < ret.orderList.length; i++) {
						html += '<div class="dingnewnew">';
						html += '<div class="dingnewnew-top">';
						html += '<div class="dingnewnewimgs"><img src="../img/goodsdetailimg.png" id="orderImg_' + ret.orderList[i].id + '"/></div>';
						html += '<div class="dingnewnew-title-box">';
						html += '<div class="dingnewnew-title">' + ret.orderList[i].orderDetails[0].productName + '</div>';

						html += '<div class="dingltextbox">￥' + formatterNumber(ret.orderList[i].orderDetails[0].price) + '</div>';
						html += '<div class="dingls">';
						html += '<div class="dingl-left"><span>';
						if (ret.orderList[i].status == 1) {
							if (ret.orderList[i].groupStatus == 0) {//待分享
								html += '待分享';
							} else {
								html += '待发货';
							}
						} else if (ret.orderList[i].status == 2) {
							html += '待收货';
						} else if (ret.orderList[i].status == 3) {
							html += '待评价';
						} else if (ret.orderList[i].status == 4) {
							html += '已完成';
						} else if (ret.orderList[i].status == 1 && ret.orderList[i].groupStatus == 0) {

						} else if (ret.orderList[i].status == -1) {
							if (ret.orderList[i].groupStatus == 2) {//未成团
								html += '拼单失败';
							} else if (ret.orderList[i].groupStatus == 3) {//已退款

								html += '拼单失败';
							} else {
								html += '订单关闭';
							}

						} else {
							html += '待付款';
						}
						html += '</span></div>';
						html += '<div class="ding-buttons"><button tapmode="" onclick="sendOrder(\'' + ret.orderList[i].id + '\');">发送</button></div>';
						html += '</div>';
						html += '</div>';
						html += '</div>';
						html += '</div>';
					}
					$("#chatOrderList").html(html);
					for (var i = 0; i < ret.orderList.length; i++) {
						cacheImage("orderImg_" + ret.orderList[i].id, ret.orderList[i].orderDetails[0].productImg2);
					}
				} else {
					UIChatBox.show();
					toast('该店铺内暂无订单');
				}

			} else {
				UIChatBox.show();
				toast('该店铺内暂无订单');
			}
		}
	});
	return false;
}

//拼单tab卡关闭
function closeSingle() {
	$(".single").toggleClass("singles", 1000);
	$(".CouponBulletin-on").toggleClass("CouponBulletin-on", 1000);
	$(".body").toggleClass("bodys", 1000);
	$('html,body').removeClass('ovfHiden');
	UIChatBox.show();
	return false;
}

function sendOrder(orderId) {
	sendMsg(5, orderId);
	$(".single").toggleClass("singles", 1000);
	$(".CouponBulletin-on").toggleClass("CouponBulletin-on", 1000);
	$(".body").toggleClass("bodys", 1000);
	$('html,body').removeClass('ovfHiden');
	UIChatBox.show();
	return false;
}

/**
 *咨询商品
 * @param {Object} id  //商品ID
 */
function consultationGoods(id) {
	sendMsg(4, id);
}

//跳转商品详情
function getGoods(id, is_groupbuy, status) {
	if (status != 0) {
		tag = true;
		if (is_groupbuy == 1) {
			getGroupProductDetail(id);
		} else {
			getProductDetail(id);
		}
	} else {
		toast("该商品已下架");
		return false;
	}
}

//跳转订单详情
function getOrder(id, order_type) {

	tag = true;
	var data = {};
	data.orderId = id;
	if (order_type == 1) {
		openWinNew("waitreceive", '订单详情', [], data);
	} else {
		openWinNew("waitshare", '订单详情', [], data);  //拼团订单详情
	}
}

function getDuration(val) {
	if (val > 50) {
		return 90;
	} else if ((parseFloat(val / 60) * 100 + 10) > 90) {
		return parseFloat(val / 60) * 100;
	} else {
		return parseFloat(val / 60) * 100 + 10;
	}
}

//根据上条内容自动发送信息

function automaticSendMsg(msg, type) {
	isSingle = false;
	var result = {};
	result.cmd = 'automaticSendMsg';
	result.sendId = sendId;
	result.type = type;
	result.chatId = chatId;
	var face = new RegExp(/\[([^\s\[\]]+?)\]/g);
	if (face.test(msg)) {
		var transMsg;
		transMsg = msg.replace(/\[(.*?)\]/gm, function(match) {
			match = 'face' + match;
			return match;
		});
		result.msg = transMsg;
	} else {
		result.msg = msg;
	}

	sendSocket(result);

}

//进入店铺
function goShop(shopName, id) {
	var data = {};
	data.shopId = id;
	data.shopName = shopName;
	var fun = new Array({
		"iconPath" : "../icon/search.png"
	});
	openWinNew("shopdetail", shopName, fun, data);
}