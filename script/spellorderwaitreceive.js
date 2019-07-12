var jsonData;
apiready = function(){
	jsonData = api.pageParam;
	init();
}
function init(){
var orderData;
var config;
var dialogBox;
var wx;
var config;

apiready = function() {
	config = getCacheData('config');
	wx = api.require('wx');
	//配置文件
	dialogBox = api.require('dialogBox');
	api.addEventListener({
		name : 'navbackbtn'
	}, function(ret, err) {
		hui.confirm('确定离开吗？邀请好友拼单才能大大提高拼单率哦~', ['离开', '去邀请好友'], function() {
			inviteFriends();
		}, function() {
			var orderData = {};
			orderData.status = 5;
			openWinNew('spellorder', '拼团订单', [], orderData, true);
			api.sendEvent({
				name : 'goCenter',
				extra : {
					num : 4
				}
			});
			api.closeToWin({
				name : 'root'
			});
		});
	});
	orderData = api.pageParam;
	init();
	getad();
		$('.hui-water-items').remove();
	$("#activity").empty();
	getRecommendProduct(3, 'activity',function(ret1,err1){
							if (err1){
									
								}
								else {
									api.refreshHeaderLoadDone();
									
									if (ret1.code == 1 && ret1.products.length > 0)
									{
										showRecommendProduct(ret1.products,'activity');
						
									}
//									else{
//										$('.shopdetail-commodity').hide();
//									}
								}
					});
}
function init() {

	var url = "order/selectOrder.do";
	var bodyParam = {
		body : {
			orderId : orderData.orderId
		}
	}
	
	ajaxRequest(url, bodyParam, function(ret, err) {
	
		if (err) {
			toast('数据通讯发生错误，请重试');
			return false;
		} else {
		
			if (ret.code == 1) {
	
				orderInfo = ret.order;
				var html = '';
				html += '<div class="shareorder">';
				html += '<div class="shareorder-title">还差<span>' + ret.order.groupNum + '</span>人，邀请好友拼单</div>';
				html += '<div class="shareorder-time"><div id="countdown3" class=" hui-countdown"><span>0</span><span>0</span>:<span>0</span><span>0</span>:<span>0</span><span>0</span></div></div>';
				html += '<div class="shareorder-button" tapmode="" onclick="inviteFriends();">邀请好友拼单</div>';
				html += '<div class="shareorder-buttons" tapmode="" onclick="goOrderDetails(\'' + ret.order.id + '\');">回到订单详情页</div>';
				html += '</div>';
				html += '<div class="host">';
				html += '<div class="host-content">';
				for (var i = 0; i < ret.order.MemberList.length; i++) {
				
					html += '<div class="hostBox">';
					html += '<div class="host-img"><img src="../img/verify03.png" id="groupBullet_' + ret.order.MemberList[i].id + '"/></div>';
					if (ret.order.MemberList[i].isHeader == 1) {
						html += '<div class="host-position">拼主</div>';
					}
					html += '</div>';
				}
				for (var i = 0; i < ret.order.groupNum; i++) {
					html += '<div class="host-i"><i class="icon iconfont iconwenhao"></i></div>';
				}
				html += '</div>';
				html += '</div>';
				html += '<div class="Coupon-list" tapmode="" onclick="goOrderDetails(\'' + ret.order.id + '\');"><div class="Coupon-left"><div class="Coupon-title">订单详情</div></div><div class="Coupon-right"><i class="icon iconfont iconarrow-left"></i></div></div>';
				html += '<div class="Coupon-list"><div class="Coupon-left"><div class="Coupon-title">拼单规则</div></div><div class="Coupon-left">	好友拼单 · 人满发货 · 人不满退款</div>';
				html += '</div>';
				var time = date('Y-m-d H:i:s', (conversion(ret.order.payTime) + parseFloat(config.cancelOrderTime) * 3600));
				var timestamp = Date.parse(new Date()) / 1000;
				if ((conversion(ret.order.payTime) + parseFloat(config.cancelOrderTime) * 3600) >= timestamp) {
					hui.countdown(time, '#countdown3', 3, function() {
						
					});
					//弹出分享
					if (isNotNull(orderData.type) && orderData.type == 'sendShare') {
						inviteFriends();
					}
				}
				$("#groupOrderHtml").html(html);
				if (isNotNull(ret.order.MemberList)) {
					for (var i = 0; i < ret.order.MemberList.length; i++) {
						cacheImage("groupBullet_" + ret.order.MemberList[i].id, ret.order.MemberList[i].header);
					}
				}
			} else {
				toast('数据通讯发生错误，请重试');
				return false;
			}
		}
	});
}

function goOrderDetails(orderId) {
	
	var data = {};
	data.orderId = orderId;
	data.status = 5;
	openWinNew('waitshare', '订单详情', [], data);   //拼团订单详情
}

function getad() {
	var url = "ad/list.do";
	var bodyParam = {
		body : {
			type : 3
		}
	};
	ajaxRequest(url, bodyParam, function(ret, err) {
		if (err) {
			_d(err);
		} else {
			if (ret.code == 1) {
				if (isNotNull(ret.ad)) {
					$("#adImg").attr("src", ret.ad[0].imgUrl);
				}
			}
		}
	});
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
					wx.shareWebpage({
						scene : 'session',
						title : title,
						description : orderInfo.orderDetails[0].productName,
						thumb : ret.savePath,
						contentUrl : config.shareUrl + '?orderId=' + orderInfo.id
					}, function(ret, err) {
						if (ret.status) {
//							alert('分享成功');
							dialogBox.close({
								dialogName : 'actionMenu'
							});
						} else {
							dialogBox.close({
								dialogName : 'actionMenu'
							});
						}
					});
				})
			} else if (ret.index == 1) {
				var title = ' 【仅剩' + orderInfo.groupNum + '个名额】  我' + formatterNumber(orderInfo.orderDetails[0].price) + '元 【' + orderInfo.orderDetails[0].productName + '】';
				getCompressImg(orderInfo.orderDetails[0].productImg2, function(ret, err) {
					wx.shareWebpage({
						scene : 'timeline',
						title : title,
						description : orderInfo.orderDetails[0].productName,
						thumb : ret.savePath,
						contentUrl : config.shareUrl + '?orderId=' + orderInfo.id
					}, function(ret, err) {
						if (ret.status) {
//							alert('分享成功');
							dialogBox.close({
								dialogName : 'actionMenu'
							});
						} else {
							dialogBox.close({
								dialogName : 'actionMenu'
							});
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


}