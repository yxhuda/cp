var orderStatus = -1;
//分页用各参数
var page = 1;
var isLast = false;
var isLoading = false;
var limit = 6;
var myOrder;
var orderData = {};
var orderInfo;
var scrollFalse;
//当前支付的订单号
var config;
var wx, dialogBox;

var isSubmit = true;
var refundStatus;
var submitMsg = '';
//提示信息
apiready = function() {

	dialogBox = api.require('dialogBox');
	wx = api.require('wx');
	config = getCacheData('config');
	//配置文件
	api.addEventListener({
		name : 'orderSubmit'
	}, function(ret, err) {
		init();
		//初始化
	});
	api.addEventListener({
		name : 'viewappear'
	}, function(ret, err) {
		//coding...
	
		api.closeWin({
			'name' : 'confirmorder'
		});
	});
	//	api.addEventListener({
	//		name : 'viewappear'
	//	}, function(ret, err) {
	//		api.sendEvent({
	//			name : 'goCenter',
	//			extra : {
	//				num : 4
	//			}
	//		});
	//		api.closeToWin({
	//			name : 'root'
	//		});
	//	});
	api.addEventListener({
		name : 'navbackbtn'
	}, function(ret, err) {
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

	//支付选择地址
	api.addEventListener({
		name : 'selectAddress'
	}, function(ret, err) {
		orderData.province = ret.value.province;
		orderData.city = ret.value.city;
		orderData.area = ret.value.area;
		orderData.address = ret.value.address;
		orderData.phone = ret.value.phone;
		orderData.contactPerson = ret.value.person;
		getOrderFreight(orderData, function(ret) {
			isSubmit = true;
			submitMsg = '';
			if (ret.code == 1) {
				orderData.transPrice = ret.transPrice;
				if (ret.absPrice < 0) {
					isSubmit = false;
					submitMsg = '不支持配送该地区';
				} else {
					orderData.absPrice = ret.absPrice;
				}
			} else {
				orderData.transPrice = -2;
				isSubmit = false;
				submitMsg = '数据错误'
			}
			$("#absPrice").html('￥ ' + formatterNumber(orderData.absPrice));
		});
		$("#orderAddress").html(ret.value.province + '&nbsp;' + ret.value.city + '&nbsp;' + ret.value.area + '&nbsp;' + ret.value.address);
	});
	orderStatus = api.pageParam.status;
	init();
}
function init() {

	orderTab(orderStatus);
}

//订单点击按钮
function orderTab(status) {
	scrollFalse = 0;
	$(".myorder-list").removeClass("myorder-list-on");
	$("#tab_" + status).addClass("myorder-list-on");
	$("#orderListHtml").html('');
	page = 1;
	isLast = false;
	isLoading = false;
	showLoading();
	if (!isNotNull(status)) {
		status = -1;
	}
	orderStatus = status;
	//更新订单类型
	var url = "order/page.do";
	var bodyParam = {
		body : {
			status : status,
			page : page,
			limit : limit,
			orderType : 2
		}
	};

	ajaxRequest(url, bodyParam, function(ret, err) {
		hideLoading();
		$("#orderRecommend").hide();
		if (err) {
			netError("init");
		} else {

			dropDownLoad(function(ret, err) {
				page = 1;
				isLast = false;
				isLoading = false;
				init();
			});
			if (ret.code == 1) {
				if (isNotNull(ret.order)) {
					myOrder = ret.order;
					var html = orderHtml(ret.order);
					if (ret.orderCount > 6 && ret.orderCount <= limit) {
						html += '<div id="hui-load-more">-- 我们是有底线的！ --</div>';
						isLast = true;
					}

					$("#orderListHtml").html(html);
					api.refreshHeaderLoadDone();
					api.parseTapmode();
					for (var i = 0; i < ret.order.length; i++) {
						cacheImage("shopLogo" + ret.order[i].id, ret.order[i].imgUrl);
						for (var j = 0; j < ret.order[i].orderDetails.length; j++) {
							cacheImage("productImg_" + ret.order[i].id + "_" + ret.order[i].orderDetails[j].id, ret.order[i].orderDetails[j].productImg2);
						}
						//头像

						if (isNotNull(ret.order[i].MemberList)) {

							for (var j = 0; j < ret.order[i].MemberList.length; j++) {
								cacheImage("shopLogo" + ret.order[i].MemberList[j].id + "_" + ret.order[i].id, ret.order[i].MemberList[j].header);
							}
						}
					}
					if (ret.order.length < limit) {
						scrollFalse = 1;
					}
					api.addEventListener({
						name : 'scrolltobottom',
						extra : {
							threshold : 0 //设置距离底部多少距离时触发，默认值为0，数字类型
						}
					}, function(ret, err) {
						if (!scrollFalse)
							moreOrderList();
						//更多
					});

				} else {
					scrollFalse = 1;
					$("#orderRecommend").show();
					$("#orderListHtml").html('');
					$('.hui-water-items').remove();
					$("#activity").empty();
					api.refreshHeaderLoadDone();
					getRecommendProduct(5, 'activity', function(ret1, err1) {
						if (err1) {

						} else {
							api.refreshHeaderLoadDone();

							if (ret1.code == 1 && ret1.products.length > 0) {
								showRecommendProduct(ret1.products, 'activity');
								$('.shopdetail-commodity').show();
								$('#activity').show();

							} else {
								$('.shopdetail-commodity').hide();
							}
						}
					});
				}
			} else {
				$("#orderRecommend").show();
				$("#orderListHtml").html('');
				$('.hui-water-items').remove();
				$("#activity").empty();
				api.refreshHeaderLoadDone();
				getRecommendProduct(3, 'activity', function(ret1, err1) {
					if (err1) {

					} else {
						api.refreshHeaderLoadDone();

						if (ret1.code == 1 && ret1.products.length > 0) {
							showRecommendProduct(ret1.products, 'activity');

						} else {
							$('.shopdetail-commodity').hide();
						}
					}
				});
			}
		}
	});
}

//更多
function moreOrderList() {
	if (isLast)
		return;
	if (isLoading)
		return;
	page++;
	isLoading = true;
	var url = "order/page.do";
	var bodyParam = {
		body : {
			status : orderStatus,
			page : page,
			limit : limit,
			orderType : 2
		}
	};

	ajaxRequest(url, bodyParam, function(ret, err) {

		isLoading = false;
		if (err) {
			netError('init');
		} else {
			if (ret.code == 1) {
				if (isNotNull(ret.order)) {
					var html = orderHtml(ret.order);
					$("#orderListHtml").append(html);
					api.parseTapmode();
					for (var i = 0; i < ret.order.length; i++) {
						myOrder.push(ret.order[i]);
						cacheImage("shopLogo" + ret.order[i].id, ret.order[i].imgUrl);
						for (var j = 0; j < ret.order[i].orderDetails.length; j++) {
							cacheImage("productImg_" + ret.order[i].id + "_" + ret.order[i].orderDetails[j].id, ret.order[i].orderDetails[j].productImg2);
						}
						//头像
						if (isNotNull(ret.order[i].MemberList)) {
							for (var j = 0; j < ret.order[i].MemberList.length; j++) {
								cacheImage("shopLogo" + ret.order[i].MemberList[j].id + "_" + ret.order[i].id, ret.order[i].MemberList[j].header);
							}
						}
					}

				} else {
					var html = '';
					html += '<div id="hui-load-more">-- 我们是有底线的！ --</div>';
					$("#orderListHtml").append(html);
					isLast = true;
				}
			} else {
				var html = '';
				html += '<div id="hui-load-more">-- 我们是有底线的！ --</div>';
				$("#orderListHtml").append(html);
				isLast = true;
			}
		}
	});

}

function groupOrderHtml(data) {
	var html = '';
	html += '<div class="myorderDody">';
	html += '<div class="Shop-title">';
	html += '<div class="Shop-left">';
	if (data.shopId > 0) {
		html += '<div class="Shop-left" tapmode="" onclick="getShop(\'' + data.shopId + '\',\'' + data.shopName + '\');"><div class="Shop-img"><img src="../img/logo.png" id="shopLogo' + data.id + '"></div><span>' + data.shopName + '</span><i class="icon iconfont iconarrow-left"></i></div>';
	} else {
		html += '<div class="Shop-left"><div class="Shop-img"><img src="../img/logo.png" id="shopLogo' + data.id + '"></div><span>' + dat.shopName + '</span></div>';
	}
	html += '</div>';
	html += '<div class="myorder-text">';
	var title = '';
	switch(parseInt(data.status)){
		case 0:
			title = '待付款';
			break;
		case 1:
			if (parseInt(data.groupStatus) == 0) {
				title = '待分享';
			}
			else {
				if (parseInt(data.orderDetails[0].refundStatus) == 1) {
					title = '审核中';
				}
				else if (parseInt(data.orderDetails[0].refundStatus) == 5 || parseInt(data.orderDetails[0].refundStatus) == 7) {
					title = '退款中';
				}
				else if (parseInt(data.orderDetails[0].refundStatus) == 8) {
					title = '已退款';
				}
				else {
					title = '待发货';
				}
			}
			break;
		case 2:
			if (parseInt(data.orderDetails[0].refundStatus) == 1) {
				title = '审核中';
			}
			else if (parseInt(data.orderDetails[0].refundStatus) == 5 || parseInt(data.orderDetails[0].refundStatus) == 7) {
				title = '退款中';
			}
			else if (parseInt(data.orderDetails[0].refundStatus) == 8) {
				title = '已退款';
			}
			else {
				title = '待收货';
			}
			break;
		case 3:
			title = '待评价';
			break;
		case 4:
			title = '已完成';
			break;
		case -1:
		case -2:
			if (parseInt(data.groupStatus) == 2) {//未成团
				title = '拼单失败';
			} else if (parseInt(data.groupStatus) == 3) {//已退款
				title = '拼单失败';
			} else {
				title = '订单关闭';
			}
			break;		
	}
	html += title;
	html += '</div>';
	html += '</div>';
	html += '<div tapmode="" onclick="goOrderDetails(\'' + data.orderDetails[0].orderId + '\');">';
	html += '<div class="confirmorderBox">';
	html += '<div class="confirmorderBox-img"><img src="../img/goodsbanner.png" id="productImg_' + data.id + '_' + data.orderDetails[0].id + '"/></div>';
	html += '<div class="confirmorderBox-text">';
	html += '<div class="confirmorderBox-title">' + data.orderDetails[0].productName + '</div>';
	if (isNotNull(data.orderDetails[0].specDesc)) {
		html += '<div class="confirmorderBox-name">规格：' + data.orderDetails[0].specDesc + '</div>';
	} else {
		html += '<div class="confirmorderBox-name">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</div>';
	}
	html += '<div class="myorder-price"><span>￥ ' + formatterNumber(data.orderDetails[0].price) + '</span><span>x' + data.orderDetails[0].num + '</span></div>';
//	html += '<div  style="margin-bottom:0;height:30px;width:60px;position:relative;top:10px;left:76%;"><button style="border:none;background:#f9f9f9;color:#988312;font-size:13px;">'+title+'</button></div>';
	html += '</div>';
	html += '</div>';
	html += '</div>';
	html += '<div class="confirmorderBox-bottom1" style="margin-left:5px" >'
	//头像
	if (isNotNull(data.MemberList) && data.MemberList.length > 1) {
		for (var j = 0; j < data.MemberList.length; j++) {

			html += '<div  style="display:inline-block;text-align:left"><img style="border-radius:50%;;margin-top:10px;margin-left:-5px" src="../img/goodsdetailimg.png" id="shopLogo' + data.MemberList[j].id + "_" + data.id + '">'
			html += '</div>';
		}
	}
	html += '<span style="color:#ff000;float:right;margin-right:15px;">￥' + formatterNumber(data.absPrice) + '</span><span style="float:right;color:#000">实付:</span></div>';
	html += '<div class="borderlink"></div>';
	html += getButton(data,data.id,parseInt(data.status),true,parseInt(data.groupStatus),data.orderDetails);
	return html;
}

// 订单
function orderHtml(data) {
	
	var html = '';
	for (var i = 0; i < data.length; i++) {
		html += groupOrderHtml(data[i]);
	}
	return html;
}

//取消订单
function orderCancel(orderId) {
	hui.confirm('亲，确定要取消订单吗？', ['取消', '确认'], function() {
		// console.log('确认后执行...');
		cancelOrder(orderId);
	}, function() {
		return false;
	});
}

function cancelOrder(orderId) {
	url = "order/cancelOrder.do";
	bodyParam = {
		body : {
			id : orderId,
		}
	};
	ajaxRequest2(url, bodyParam, function(ret, err) {
		is_true = false;
		if (err) {
			_d(err);
		} else {
			if (ret.code == 1) {
				toast('取消订单成功')
				init()
			} else {
				toast('数据通讯发生错误，请重试');
				return false;
			}
		}
	})
}

//删除订单
function orderdel(orderId) {
	hui.confirm('亲，确定要删除该订单吗？', ['取消', '确认'], function() {
		url = "order/deleteOrder.do";
		bodyParam = {
			body : {
				id : orderId
			}
		};
		ajaxRequest(url, bodyParam, function(ret, err) {
			is_true = false;
			if (err) {
				toast(err);
			} else {
				if (ret.code == 1) {
					toast('删除订单成功');
					init();
				}
			}
		});
	});
}

//进入店铺
function getShop(shopId, shopName) {
	
	var data = {};
	data.shopId = shopId;
	data.shopName = shopName;
	var fun = new Array({
		"iconPath" : "../icon/search.png"
	});
	openWinNew("shopdetail", shopName, fun, data);
}

//订单详情
function goOrderDetails(orderId) {
	
	var data = {};
	data.orderId = orderId;

	openWinNew("waitshare", '订单详情', [], data); //拼团订单详情
}

//支付提交
function openpay(orderId) {
	$(".bottomPaymentBullet").toggleClass("bottomPaymentBullets", 1000);
	$(".CouponBulletinSix").toggleClass("CouponBulletin-on", 1000);
	$(".body").toggleClass("bodys", 1000);
	$('html,body').addClass('ovfHiden');
	$("#orderTime").val(0);
	orderData = {};
	for (var i = 0; i < myOrder.length; i++) {
		if (myOrder[i].id == orderId) {
			orderData = myOrder[i];
		}
	}
	$(":radio[name='payType'][value='" + orderData.payType + "']").prop("checked", "checked");
	$("#orderAddress").html(orderData.province + '&nbsp;' + orderData.city + '&nbsp;' + orderData.area + '&nbsp;' + orderData.address);
	var is_timeout = true;
	//是否超时
	var timestamp = Date.parse(new Date()) / 1000;
	//当天时间
	getOrderFreight(orderData, function(ret) {

		isSubmit = true;
		submitMsg = '';

		if (ret.code == 1) {
			orderData.transPrice = ret.transPrice;
			if (ret.absPrice < 0) {
				isSubmit = false;
				submitMsg = '不支持配送该地区';
			} else {
				orderData.absPrice = ret.absPrice;
			}
		} else {
			orderData.transPrice = -2;
			isSubmit = false;
			submitMsg = '数据错误'
		}
	});
	var order_time = conversion(orderData.orderTime) + parseFloat(config.paymentTime) * 3600;
	$("#absPrice").html("￥ " + formatterNumber(orderData.absPrice));
	var time;
	if (order_time >= timestamp) {
		$("#orderTime").val(order_time);
		time = window.setInterval("timeTick2()", 1000);
	} else {
		is_timeout = false;
		clearInterval(time);

		url = "order/cancelOrder.do";
		bodyParam = {
			body : {
				id : orderId,
			}
		};
		ajaxRequest2(url, bodyParam, function(ret, err) {
			is_true = false;
			if (err) {
				_d(err);
			} else {
				if (ret.code == 1) {
					$(".bottomPaymentBullet").toggleClass("bottomPaymentBullets", 1000);
					$(".CouponBulletin-on").toggleClass("CouponBulletin-on", 1000);
					$(".body").toggleClass("bodys", 1000);
					$('html,body').removeClass('ovfHiden');
					toast('该订单已过期');
					init()
				} else {
					toast('数据通讯发生错误，请重试');
					return false;
				}
			}
		})
	}
}

function closePay() {
	$(".bottomPaymentBullet").toggleClass("bottomPaymentBullets", 1000);
	$(".CouponBulletin-on").toggleClass("CouponBulletin-on", 1000);
	$(".body").toggleClass("bodys", 1000);
	$('html,body').removeClass('ovfHiden');
	return false;
}

//选择支付方式
//获取单选框的值
function showSelectRes(_selfBtn) {
	hui(_selfBtn).parent().find('input').each(function(cObj) {
		if (cObj.checked) {
			orderData.payType = cObj.value;
		}
	});
}

//去地址列表
function goAddress() {
	
	var data = {};
	data.source = 1;
	openWinNew('addresslist', '收货地址', [], data, true);
}

//支付
function payorder() {
	if (orderData.transPrice < 0) {
		toast(submitMsg);
		return;
	}
	var url = 'order/updateOrder.do';
	var bodyParam = {
		body : {
			id : orderData.id, //订单ID
			payType : orderData.payType, //订单支付方式
			province : orderData.province, //地址（省）
			city : orderData.city, //地址（市）
			area : orderData.area, //地址（区）
			address : orderData.address, //地址（详情）
			contactPerson : orderData.contactPerson, //地址（省）
			phone : orderData.phone,				//地址（省）
		}
	};
	ajaxRequest2(url, bodyParam, function(ret, err) {

		if (err) {
			toast('数据通讯发生错误，请重试');
			return false;
		} else {
			if (ret.code == 1) {
				pay(orderData.ordeNo, orderData.absPrice, orderData.payType, ret.orderCode);
			} else {
				toast('数据通讯发生错误，请重试');
				return false;
			}
		}

	});
}

//支付成功回调
function successpay(ret, err) {
	$(".bottomPaymentBullet").toggleClass("bottomPaymentBullets", 1000);
	$(".CouponBulletin-on").toggleClass("CouponBulletin-on", 1000);
	$(".body").toggleClass("bodys", 1000);
	$('html,body').removeClass('ovfHiden');

	if (ret.code == 9000) {
		getOrderDetails(orderData.id, function(ret, err) {
			if (err) {
				toast('数据通讯发生错误，请重试');
				return false;
			} else {
				var jsonData = {};
				if (ret.code == 1) {
					
					jsonData.order = ret.order;
					api.sendEvent({
						name : 'orderSubmit'
					});

					openWinNew('shareorder', '邀请好友', [], jsonData, true);

				} else {
					toast('数据通讯发生错误，请重试');
					return false;
				}
			}
		});
	} else {
		toast('支付失败');
	}
}

function toShare(orderId) {
	for (var i = 0; i < myOrder.length; i++) {
		if (myOrder[i].id == orderId) {
			orderInfo = myOrder[i];
		}
	}
	inviteFriends();
}

//延长收货
function orderExtended(orderId) {
	hui.confirm('亲，确认延长收货订单吗？（每笔订单只能延长一次哦~）', ['取消', '确认'], function() {
		url = "order/extendReceive.do";
		bodyParam = {
			body : {
				id : orderId
			}
		};
		ajaxRequest2(url, bodyParam, function(ret, err) {
			is_true = false;
			if (err) {
				_d(err);
			} else {
				if (ret.code == 1) {
					toast('延长成功');
					init();
				} else if (ret.code == 0) {
					toast(ret.msg);
				}
			}
		});
	})
}

//查看物流
function orderLogistics(orderId) {
	
	var data = {};
	data.orderId = orderId;
	openWinNew("logistic", '查看物流', [], data);
}

//确认收货

function orderConfirm(orderId) {
	hui.confirm('亲，确认收到货了吗？<br><span style="font-size:12px;color:#ccc;line-height:12px">为保障您的收货权益，请收到货确认无误后，再确认收货哦！<span>', ['取消', '确认'], function() {
		url = "order/receiveOrder.do";
		bodyParam = {
			body : {
				id : orderId
			}
		};
		ajaxRequest2(url, bodyParam, function(ret, err) {
			is_true = false;
			if (err) {
				_d(err);
			} else {
				if (ret.code == 1) {
					toast('收货成功');
					init();
				}
			}
		});
	});
}

function getOrderDetails(orderId, bankFun) {
	var url = "order/selectOrder.do";
	var bodyParam = {
		body : {
			orderId : orderId
		}
	}
	ajaxRequest(url, bodyParam, function(ret, err) {
		bankFun(ret, err);
	});
}

//跳转评价
function toEvaluate(data) {
	
	openWinNew("evaluate", "我的评价", {}, {
		params : data
	}, true);
}

//催处理
var cui = 0;
function cuiChuli() {
	if (cui > 3)
		return;
	toast("商家正在加急处理")
	cui++;
}