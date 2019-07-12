//普通
var orderId;
var orderInfo;
var config;

var refundnum = 0;
var isSubmit = true;
var submitMsg = '';
//提示信息
apiready = function() {
	orderId = api.pageParam.orderId;
	config = getCacheData('config');
	//配置文件
	api.addEventListener({
		name : 'perform'
	}, function(ret, err) {
		init();
	});
	api.addEventListener({
		name : 'dischargePetition'
	}, function(ret, err) {

		init();

	});
	//返回按钮监听
	api.addEventListener({
		name : 'navbackbtn'
	}, function(ret, err) {
		api.sendEvent({
			name : 'orderSubmit'
		});

		api.closeWin();
	});
	api.addEventListener({
		name : 'selectAddress'
	}, function(ret, err) {
		orderInfo.province = ret.value.province;
		orderInfo.city = ret.value.city;
		orderInfo.area = ret.value.area;
		orderInfo.address = ret.value.address;
		orderInfo.phone = ret.value.phone;
		orderInfo.contact_person = ret.value.person;
		$("#orderAddress").html(ret.value.province + '&nbsp;' + ret.value.city + '&nbsp;' + ret.value.area + '&nbsp;' + ret.value.address);
		$("#orderContactPerson").html(ret.value.person);
		$("#orderPhone").html(ret.value.phone);
		updateAddress();
	});
	init();
}
function init() {

	showLoading()
	var url = "order/selectOrder.do";
	var bodyParam = {
		body : {
			orderId : orderId
		}
	}
	ajaxRequest(url, bodyParam, function(ret, err) {
		if (err) {
			toast('数据通讯发生错误，请重试');
			return false;
		} else {
			if (ret.code == 1) {
				if (isNotNull(ret.order)) {

					hideLoading()
					orderInfo = ret.order;
					var html = '';
					if (ret.order.status == 1) {//待发货
						//退款说明
						var a = 0;
						var title;
						for (var j = 0; j < ret.order.orderDetails.length; j++) {
							if (parseInt(ret.order.orderDetails[j].refundStatus) == 8) {
								a++
							}
						}
						if (a == ret.order.orderDetails.length) {
							title = '<div class="waitreceive"><p>交易关闭</div>';
						} else {
							title = '<div class="waitreceive"><p>付款成功</p><p>预计付款成功后2天内发货</p></div>';
						}
						html += title;
					} else if (ret.order.status == 2) {//待确认

						var a = 0;
						var title;
						for (var j = 0; j < ret.order.orderDetails.length; j++) {
							if (parseInt(ret.order.orderDetails[j].refundStatus) == 8) {
								a++
							}
						}
						if (a == ret.order.orderDetails.length) {
							title = '<div class="waitreceive"><p>交易关闭</div>';
						} else {
							title = '<div class="waitreceive"><input type="hidden" class="timehide" id="orderTime" value=""><p>卖家已发货</p><p id="confirmOrderTime">还<span class="timetick">剩余00：00：00</span>自动确认</p></div>';
						}
						html += title;

					} else if (ret.order.status == 3) {//待评价
						html += '<div class="waitreceive"><p>交易成功</p></div>';
					} else if (ret.order.status == 4) {//已完成
						html += '<div class="waitreceive"><p>交易成功</p></div>';
					} else if (ret.order.status == -1) {//已取消
						html += '<div class="waitreceive"><p>订单关闭</p></div>';
					} else if (ret.order.status == -2) {//已超时
						html += '<div class="waitreceive"><p>订单超时，自动取消</p></div>';
					} else {//待付款

						getOrderFreight(ret.order, function(ret1) {
							isSubmit = true;
							submitMsg = '';
							if (ret1.code == 1) {

								if (isNotNull(ret1.transPrice)) {
									ret.order.transPrice = ret1.transPrice;
								}
								if (ret.absPrice < 0) {
									isSubmit = false;
									submitMsg = '不支持配送该地区';
								} else {
									ret.order.absPrice = ret1.absPrice;
								}
							} else {
								ret.order.transPrice = -2;
								isSubmit = false;
								submitMsg = '数据错误'
							}
						});
						html += '<div class="waitreceive"><p>等待买家付款</p><p>逾期未付款，订单将自动取消！</p></div>';
					}

					html += '<div class="waitreceive-top">';
					if (ret.order.status > 1) {
						if (isNotNull(ret.order.transList)) {
							html += '<div class="waitreceivebox" tapmode="" onclick="orderLogistics()">';
							html += '<div class="waitreceivebox-i"><i class="icon iconfont iconkuaidi colorblue"></i></div>';
							html += '<div class="confirmorder-address center ">';

							html += '<div class="confirmorder-top" id="clamp-3">' + ret.order.company + '：' + ret.order.transList[0].status + '</div>';
							html += '<div class="waitreceivebox-bottom">' + ret.order.transList[0].time + '</div></div>';
							html += '<div class="confirmorder-right"><i class="icon iconfont iconarrow-left"></i></div>';
							html += '</div>';
							html += '<div class="borderlink"></div>';
						}
					}
					//退款说明
					for (var i = 0; i < ret.order.orderDetails.length; i++) {

						if (ret.order.orderDetails[i].refundStatus == 2 && ret.order.orderDetails[i].serviceType == 2) {
							url = "shop/selectShopById.do";
							bodyParam = {
								body : {
									id : ret.order.shopId
								}
							};
							ajaxRequest(url, bodyParam, function(ret, err) {

								if (err) {
									_d(err);
								} else {
									if (ret.code == 1) {
										var html = '';
										html += '<div class="waitreceivebox"><h1 style="margin-left:26px">商品回寄地址</h1></div>';
										html += '<div class="waitreceivebox">';

										html += '<div class="waitreceivebox-i"><i class="icon iconfont iconlocation"></i></div>';
										html += '<div class="confirmorder-address center ">';
										html += '<div class="confirmorder-top"><span id="orderContactPerson">' + ret.shop.contactPerson + '</span><span id="orderPhone">' + ret.shop.contactPhone + '</span></div>';
										html += '<div class="confirmorder-bottom" id="orderAddress">' + ret.shop.address + '</div>';
										html += '</div>';

										$(".waitreceive-top").html(html)
									}
								}
							})
						}
					}
					if (ret.order.status == 0) {

						html += '<div class="waitreceivebox" tapmode="" onclick="goAddress();">';
						html += '<div class="waitreceivebox-i"><i class="icon iconfont iconlocation"></i></div>';
						html += '<div class="confirmorder-address center ">';
						html += '<div class="confirmorder-top"><span id="orderContactPerson">' + ret.order.contactPerson + '</span><span id="orderPhone">' + ret.order.phone + '</span></div>';
						html += '<div class="confirmorder-bottom" id="orderAddress">' + ret.order.province + '&nbsp;' + ret.order.city + '&nbsp;' + ret.order.area + '&nbsp;' + ret.order.address + '</div>';
						html += '</div>';
						html += '<div class="confirmorder-right">修改<i class="icon iconfont iconarrow-left"></i></div>';

					} else {
						html += '<div class="waitreceivebox">';
						html += '<div class="waitreceivebox-i"><i class="icon iconfont iconlocation"></i></div>';
						html += '<div class="confirmorder-address center ">';
						html += '<div class="confirmorder-top"><span id="orderContactPerson">' + ret.order.contactPerson + '</span><span id="orderPhone">' + ret.order.phone + '</span></div>';
						html += '<div class="confirmorder-bottom" id="orderAddress">' + ret.order.province + '&nbsp;' + ret.order.city + '&nbsp;' + ret.order.area + '&nbsp;' + ret.order.address + '</div>';
						html += '</div>';
					}

					html += '</div>';
					html += '</div>';
					html += '<div class="borderlink"></div>';

					if (ret.order.status == 0) {
						html += '<div class="paymentMethod">';
						html += '<div class="hui-form-radios">';
						html += '<div class="payment-method">';
						html += '<div class="weixin"></div>';
						html += '<div class="payment-method-text center">微信支付</div>';
						html += '<input type="radio" id="g1" value="1" name="payType" checked="checked" onchange="showSelectRes(this);" />';
						html += '<label for="g1"></label>';
						html += '</div>';
						html += '<div class="payment-method">';
						html += '<div class="zhifubao"></div>';
						html += '<div class="payment-method-text center">支付宝支付	</div>';
						html += '<input type="radio" value="2" name="payType" id="g2" onchange="showSelectRes(this);" />';
						html += '<label for="g2"></label>';
						html += '</div>';
						html += '</div>';
						html += '</div>';
					}
					html += '<div class="confirmorder-list">';
					if (ret.order.shopId > 0) {
						html += '<div class="Shop-title" tapmode="" onclick="getShop(\'' + ret.order.shopId + '\',\'' + ret.order.shopName + '\');"><div class="Shop-left"><div class="Shop-img"><img src="../img/logo.png"  id="shopLogo"></div><div class="Shop-text"><p>' + ret.order.shopName + '</p><p></p></div></div></div>';
					} else {
						html += '<div class="Shop-title"><div class="Shop-left"><div class="Shop-img"><img src="../img/logo.png" id="shopLogo"></div><div class="Shop-text"><p>' + ret.order.shopName + '</p><p></p></div></div></div>';
					}
					for (var i = 0; i < ret.order.orderDetails.length; i++) {
						html += '<div class="confirmorderBox" tapmode="" onclick="getProductDetail(\'' + ret.order.orderDetails[i].productId + '\')">';
						html += '<div class="confirmorderBox-img"><img src="../img/goodsbanner.png" id="productImg_' + ret.order.orderDetails[i].productId + '"></div>';
						html += '<div class="confirmorderBox-text">';
						html += '<div class="confirmorderBox-title">' + ret.order.orderDetails[i].productName + '</div>';
						if (isNotNull(ret.order.orderDetails[i].spec_desc)) {
							html += '<div class="confirmorderBox-name">规格：' + ret.order.orderDetails[i].spec_desc + '</div>';
						} else {
							html += '<div class="confirmorderBox-name">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</div>';
						}
						html += '<div class="myorder-price"><span>￥' + formatterNumber(ret.order.orderDetails[i].price) + '</span><span>x' + ret.order.orderDetails[i].num + '</span></div>';
						html += '</div>';
						html += '</div>';
						if (ret.order.status > 0) {
							html += '<div class="myorder-button">';
							//html += '<div class="border-bitton-red"><button tapmode="" onclick="drawback('+i+')">申请退款</button></div>';
							switch(ret.order.orderDetails[i].refundStatus) {
								case "0":
									if (ret.order.status < 3) {
										html += '<div class="border-bitton-red"><button tapmode="" onclick="drawing(\'' + ret.order.orderDetails[i].id + '\', ' + i + ',1)">申请退款</button></div>';
									}
									break;
								case "1":
									html += '<div class="border-bitton-red"><button tapmode="" onclick="drawing(\'' + ret.order.orderDetails[i].id + '\',' + i + ',2)">审核中</button></div>';
									break;
								case "2":
									if (ret.order.orderDetails[i].serviceType == 2) {
										html += '<div class="border-bitton-red"><button tapmode="" onclick="sendMail(\'' + ret.order.orderDetails[i].id + '\')">请寄件</button></div>';
									} else {
										html += '<div class="border-bitton-red"><button tapmode="">申请成功</button></div>';
									}
									break;
								case "3":
									html += '<div class="border-bitton-red"><button tapmode="" onclick="drawing(\'' + ret.order.orderDetails[i].id + '\', ' + i + ',2)">退款详情</button></div>';

									break;
								case "4":
									html += '<div class="border-bitton-red"><button tapmode="" >等待卖家收货</button></div>';
									break;
								case "5":
									html += '<div class="border-bitton-red"><button tapmode="">退款中</button></div>';
									break;
								case "6":
									html += '<div class="border-bitton-red"><button tapmode="" onclick="drawing(\'' + ret.order.orderDetails[i].id + '\', ' + i + ',1)">申请退款</button></div>';
									break;
								case "7":
									html += '<div class="border-bitton-red"><button tapmode="">退款中</button></div>';
									break;
								case "8":
									html += '<div class="border-bitton-red"><button tapmode="">已退款</button></div>';
									break;
							}
							html += '</div>';
						}
						html += '<div class="borderlink"></div>';
					}
					if (ret.order.transPrice > 0) {
						html += '<div class="confirmorderBox-bottom textalign borderTop" style="display: flex;justify-content: space-between;"><span style="color:#000">运费</span> <span id="transPrice"> ￥ ' + formatterNumber(ret.order.transPrice) + '</span></div>';
					} else if (ret.order.transPrice == 0) {
						html += '<div class="confirmorderBox-bottom textalign borderTop" style="display: flex;justify-content: space-between;"><span style="color:#000">运费</span> <span id="transPrice">免运费</span></div>';
					} else {
						html += '<div class="confirmorderBox-bottom textalign borderTop" style="display: flex;justify-content: space-between;"><span style="color:#000">运费</span> <span id="transPrice">该地区不支持配送</span></div>';
					}
					html += '<div class="confirmorderBox-bottom textalign borderTop" style="display: flex;justify-content: space-between;"><span style="color:#000">实付</span> <span> ￥ ' + formatterNumber(ret.order.absPrice) + '</span></div>';
					html += '<div class="borderlink"></div>';
					html += '<div class="waitreceivetext">';
					html += '<div class="waitreceivetext-list"><span>订单编号：</span><span class="colorhui" id="orderNo">' + ret.order.orderCode + '</span><em tapmode="" onclick="setClipboard(\'' + ret.order.orderCode + '\')">复制</em></div>';
					if (ret.order.status > 0) {
						if (ret.order.payType == 2) {
							html += '<div class="waitreceivetext-list"><span>支付方式：</span><span class="colorhui">支付宝</span></div>';
						} else {
							html += '<div class="waitreceivetext-list"><span>支付方式：</span><span class="colorhui">微信</span></div>';
						}
					}
					html += '<div class="waitreceivetext-list"><span>下单时间：</span><span class="colorhui">' + ret.order.orderTime + '</span></div>';
					if (ret.order.status == 1) {
						html += '<div class="waitreceivetext-list"><span>付款时间：</span><span class="colorhui">' + ret.order.payTime + '</span></div>';
					}
					if (ret.order.status == 2) {
						html += '<div class="waitreceivetext-list"><span>发货时间：</span><span class="colorhui">' + ret.order.sendTime + '</span></div>';
					}

					if (ret.order.status > 1) {

						html += '<div class="waitreceivetext-list"><span>快递方式：</span><span class="colorhui">' + ret.order.company + '</span></div>';
						html += '<div class="waitreceivetext-list"><span>快递单号：</span><span class="colorhui">' + ret.order.transCode + '</span></div>';
					}
					html += '</div>';
					html += '<div class="borderlink"></div>';
					_d(ret.order.status+"订单状态");
					if (ret.order.status == -1) {//已取消
						html += '<div class="myorder-button">';
						html += '<div class="border-bitton"><button tapmode="" onclick="orderdel(\'' + ret.order.id + '\')">删除订单</button></div>';
						html += '<div class="border-bitton"><button tapmode="" onclick="getProductDetail(\'' + ret.order.orderDetails[0].productId + '\')">再次购买</button></div>';
						html += '</div>';
					} else if (ret.order.status == 1) {//待发货
						//html += '<div class="myorder-text">待发货</div>';
						var a = 0;
						for (var j = 0; j < ret.order.orderDetails.length; j++) {
							if (parseInt(ret.order.orderDetails[j].refundStatus) == 8) {
								a++
							}
						}
						html += '<div class="myorder-button">';
						if (a == ret.order.orderDetails.length) {
							html += '<div class="border-bitton"><button tapmode="" onclick="orderdel(\'' + ret.order.id + '\')">删除订单</button></div>';
						} 
						html += '</div>';
					} else if (ret.order.status == 2) {//待收货
						html += '<div class="myorder-button">';
						var a = 0;
						for (var i = 0; i < ret.order.orderDetails.length; i++) {
							if ( ret.order.orderDetails[i].refundStatus == 8) {
								a++
							}
						}
						if (a == ret.order.orderDetails.length) {
							html += '<div class="border-bitton"><button tapmode="" onclick="orderdel(\'' + ret.order.id + '\')">删除订单</button></div>';
						} else {
							html += '<div class="border-bitton"><button tapmode="" onclick="orderLogistics(\'' + ret.order.id + '\')">查看物流</button></div>';
							html += '<div class="border-bitton"id="myborder-extend"><button tapmode="" onclick="orderExtended(\'' + ret.order.id + '\')">延长收货</button></div>';
							html += '<div class="border-bitton"id="myborder-confirm"><button tapmode="" onclick="orderConfirm(\'' + ret.order.id + '\')">确认收货</button></div>';
						}

						html += '</div>';
					} else if (ret.order.status == 3) {//待评价
						
						var a = 0;
						for (var j = 0; j < ret.order.orderDetails.length; j++) {
							if (parseInt(ret.order.orderDetails[j].refundStatus) == 8) {
								a++
							}
						}
						html += '<div class="myorder-button">';
						if (a == ret.order.orderDetails.length) {
							html += '<div class="border-bitton"><button tapmode="" onclick="orderdel(\'' + ret.order.id + '\')">删除订单</button></div>';
						} else {
							html += '<div class="border-bitton"><button onclick="toEvaluate(\'' + JSON.stringify(ret.order).replace(/"/g, '&quot;') + '\')">立即评价</button></div>';
						}
						html += '</div>';
						
					} else if (ret.order.status == 4) {//已完成
						html += '<div class="myorder-button">';
						html += '<div class="border-bitton"><button tapmode="" onclick="orderdel(\'' + ret.order.id + '\')">删除订单</button></div>';
						html += '</div>';
					} else if (ret.order.status == -2) {//交易关闭
						html += '<div class="myorder-button">';
						html += '<div class="border-bitton"><button tapmode="" onclick="orderdel(\'' + ret.order.id + '\')">删除订单</button></div>';
						html += '</div>';
					} else {//未支付
						html += '<div class="myorder-button">';
						html += '<div class="border-bitton"><button tapmode="" onclick="orderCancel(\'' + ret.order.id + '\')">取消订单</button></div>';
						html += '<div class="border-bitton-red" tapmode="" onclick="payorder();"><button>去支付</button></div></div>';
						html += '</div>';
					}
					html += '</div>';
					$("#orderDetailsHtml").html(html);
					$(":radio[name='payType'][value='" + ret.order.payType + "']").prop("checked", "checked");
					for (var i = 0; i < ret.order.orderDetails.length; i++) {
						cacheImage("productImg_" + ret.order.orderDetails[i].productId, ret.order.orderDetails[i].productImg2);
					}
					if (isNotNull(ret.order.imgUrl)) {
						$("#shopLogo").attr("src", ret.order.imgUrl);
					}

					if (isNotNull(ret.order.sendTime) && ret.order.status == 2) {
						var timestamp = Date.parse(new Date()) / 1000;
						//当天时间
						//					var order_time = conversion(ret.order.sendTime) + parseFloat(config.goodsTime) * 3600;
						var order_time = 0;
						if (ret.order.isExtended == 1) {
							order_time = conversion(ret.order.sendTime) + parseFloat(config.goodsTime) * 3600 + parseFloat(config.delayTime) * 3600;
						} else {
							order_time = conversion(ret.order.sendTime) + parseFloat(config.goodsTime) * 3600;
						}
						var time;
						if (order_time > timestamp) {
							$("#orderTime").val(order_time);
							time = window.setInterval("timeTick()", 1000);
						} else {
							clearInterval(time);
							orderConfirmSubmit(ret.order.id);
						}
					} else if (!isNotNull(ret.order.sendTime) && ret.order.status == 2) {
						clearInterval(time);
						orderConfirmSubmit(ret.order.id);
					}
				} else {
					toast('数据通讯发生错误，请重试');
					return false;
				}
			}
		}

	});
}

//跳转评价
function toEvaluate(data) {

	openWinNew("evaluate", "我的评价", {}, {
		params : data
	}, true);
}

//取消订单
function orderCancel(orderId) {
	hui.confirm('亲，确定要取消订单吗？', ['取消', '确认'], function() {
		orderCancelSubmit(orderId);
	}, function() {
		init();
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

//选择支付方式
//获取单选框的值
function showSelectRes(_selfBtn) {
	hui(_selfBtn).parent().find('input').each(function(cObj) {
		if (cObj.checked) {
			orderInfo.payType = cObj.value;
		}
	});
}

//去地址列表
function goAddress() {

	var data = {};
	data.source = 1;
	openWinNew('addresslist', '收货地址', [], data, true);
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
				_d(err);
			} else {
				if (ret.code == 1) {
					toast('删除订单成功');
					api.sendEvent({
						name : 'orderSubmit'
					});
					api.closeWin();

				}
			}
		});
	});
}

//收货
function orderConfirm(orderId) {
	hui.confirm('亲，确认收到货了吗？<br><span style="font-size:12px;color:#ccc;line-height:12px">为保障您的收货权益，请收到货确认无误后，再确认收货哦！<span>', ['取消', '确认'], function() {
		orderConfirmSubmit(orderId);
	}, function() {
		toast('收货失败');
	});
}

//收货提交
function orderConfirmSubmit(orderId) {
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

//支付提交
function payorder() {
	if (orderInfo.transPrice < 0) {
		toast(submitMsg);
		return;
	}
	var url = 'order/updateOrder.do';
	var bodyParam = {
		body : {
			id : orderInfo.id, //订单ID
			payType : orderInfo.payType,				//订单支付方式
		}
	};

	ajaxRequest2(url, bodyParam, function(ret, err) {

		if (err) {
			toast('数据通讯发生错误，请重试');
			return false;
		} else {

			if (ret.code == 1) {
				pay(orderInfo.orderNo, orderInfo.absPrice, orderInfo.payType, ret.orderCode);
			} else {
				toast('数据通讯发生错误，请重试');
				return false;
			}
		}

	});
}

//支付成功回调
function successpay(ret, err) {
	if (ret.code == 9000) {
		var jsonData = {};
		jsonData.orderId = orderInfo.id;
		//		api.closeWin();
		openWinNew('successpay', '支付完成', [], jsonData, true);

	} else {
		toast('支付失败');
	}
}

function orderLogistics() {

	var jsonData = {};
	jsonData = orderInfo;
	openWinNew("logistic", '查看物流', [], jsonData);

}

//更新地址
function updateAddress() {
	var url = 'order/updateOrder.do';

	var bodyParam = {
		body : {
			id : orderInfo.id, //订单ID
			province : orderInfo.province, //地址（省）
			city : orderInfo.city, //地址（市）
			area : orderInfo.area, //地址（区）
			address : orderInfo.address, //地址（详情）
			contactPerson : orderInfo.contact_person, //地址（省）
			phone : orderInfo.phone,				//地址（省）
		}
	};
	ajaxRequest2(url, bodyParam, function(ret, err) {
		isSubmit = true;
		submitMsg = '';
		if (ret.code == 1) {
			orderInfo.transPrice = ret.transPrice;
			if (ret.transPrice < 0) {
				isSubmit = false;
				submitMsg = '不支持配送该地区';
				$("#transPrice").html("该地区不支持配送 ");
			} else if (ret.transPrice == 0) {

				$("#transPrice").html("免运费 ");
			} else {
				orderInfo.absPrice = ret.absPrice;
				$("#transPrice").html('￥ ' + formatterNumber(orderInfo.transPrice) + '');
			}
		} else {
			orderInfo.transPrice = -2;
			isSubmit = false;
			submitMsg = '数据错误'
		}

	});
}

//申请退款
function drawback(i) {

	var jsonData = {};
	jsonData = orderInfo;
	jsonData.orderType = 1;

	//退第i个 先传
	jsonData.tui = i;
	openWinNew("applyrefund", '申请退款', [], jsonData);
}

//填写快递单号
function sendMail(id) {

	url = "order/selectRefund.do";
	bodyParam = {
		body : {
			orderId : id
		}
	};
	ajaxRequest(url, bodyParam, function(ret, err) {
		if (err) {
			_d(err);
		} else {

			var jsonData = ret;
			jsonData.refund.isGroup = 0;
			openWinNew("refundlogistics", '填写单号', [], jsonData);
		}
	});
}

//申请中
function drawing(id, nums, status) {
	_d(status);
	var jsonData = {};
	jsonData = {};
	jsonData = orderInfo;
	jsonData.tui = nums

	if (status == 1) {
		openWinNew("applyrefund", '申请退款', [], jsonData);
	} else {
		openWinNew("refunddetail", '退款详情', [], jsonData);
	}

}

//催处理
var cui = 0;
function cuiChuli() {
	if (cui > 3)
		return;
	toast("商家正在加急处理")
	cui++;
}

//取消订单提交
function orderCancelSubmit(orderId) {
	url = "order/cancelOrder.do";
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
				toast('取消订单成功')
				init();
			}
		}
	})
}

//客服聊天
function openChat(i) {

	if (!checkUser())
		return false;
	var data = {};
	//退第i个 先传
	data.order = orderInfo;
	data.order.tui = i;
	data.sendId = '1000000000000000001';
	data.img = '../img/kefu.png';
	data.pushUserId = '0';
	openWinNew("service_chat", '客服', {}, data, true);
}