var payType = 1;
//支付方式
var data;
var addressInfo;
//选中的地址信息
var remain_number = 100;
//已选中的代金券id

var absPrice = 0;
//订单使用代金券后的总金额
var is_order = false;
//订单是否已生成(用户点击支付后，取消支付，返回 订单列表)
var orderId = 0;
var orderNo = 0;
//生成订单后订单编号
var orderMoney = 0;
//生成订单后订单支付金额
var isSubmit = true;
var submitMsg = '';
//提示信息

var orderCode;
var trans = 0;
apiready = function() {
	addressInfo = getCacheData("addressData");

	api.addEventListener({
		name : 'selectAddress'
	}, function(ret, err) {
		addressInfo = ret.value;
		getaddress();
	});
	api.addEventListener({
		name : 'selectCoupon'
	}, function(ret, err) {
		if (isNotNull(ret.value.coupon)) {

			data.couponId = ret.value.coupon.id;
			data.couponMoney = ret.value.coupon.condition;
			$("#selectCouponText").html('省' + ret.value.coupon.condition + '元,' + getCouponName(ret.value.coupon.account, ret.value.coupon.condition, ret.value.coupon.couponType));
			data.absPrice = data.totalPrice - ret.value.coupon.condition;

			if (data.absPrice < 0)
				data.absPrice = 0;

			if (isNotNull(trans)) {
				
				$("#totalPrice").html('￥ ' + formatterNumber(Number(data.absPrice) + Number(trans)));
				data.absPrice=Number(data.absPrice) + Number(trans)
			} else {
				$("#totalPrice").html("￥ " + formatterNumber(Number(data.absPrice)))
				data.absPrice=Number(data.absPrice) 
			}
			//减去代金券的总金额
		}
	});
	api.addEventListener({
		name : 'navbackbtn'
	}, function(ret, err) {
		api.sendEvent({
			name : 'goodsdetail'
		});
		api.sendEvent({
			name : 'groupgoodsdetail'
		});
		api.sendEvent({
			name : 'orderSubmit'
		});
		if (is_order) {
			var orderData = {};
			orderData.status = 0;

			if (data.type == 3 || data.type == 4) {

				openWinNew('spellorder', '拼团订单', [], orderData, true);
				api.closeWin();
			} else {
				openWinNew('myorder', '我的订单', [], orderData, true);
				api.closeWin();
			}
		} else {
			hui.confirm('亲，确定要离开吗？', ['取消', '确认'], function() {

				closeWin();
			}, function() {

			});
		}
	});

	init();
	getaddress();
}
function init() {
	
	data = api.pageParam;

	if (isNotNull(data)) {
		var html = '';
		html += '<div class="Shop-title" >';
		if (data.shopId > 0) {
			html += '<div class="Shop-left" tapmode="" onclick="goShop();">';
		} else {
			html += '<div class="Shop-left">';
		}
		html += '<div class="Shop-img">';
		html += '<img src="../img/logo.png" id="shoplogo"/>';
		html += '</div>';
		html += '<div class="Shop-text">';
		html += '<span>' + data.shopName + '</span>';
		if (data.shopId > 0) {
			html += '<i class="icon iconfont iconarrow-left"></i>';
		}
		html += '</div>';
		html += '</div>';
		html += '</div>';
		html += '<div class="confirmorderBox">';
		html += '<div class="confirmorderBox-img">';
		html += '<img src="../img/goodsbanner.png" id="good_img"/>';
		html += '</div>';
		html += '<div class="confirmorderBox-text">';
		html += '<div class="confirmorderBox-title">' + data.productName + '</div>';
		if (data.skuId > 0) {
			html += '<div class="confirmorderBox-name">规格：' + data.skuName + '</div>';
		} else {
			html += '<div class="confirmorderBox-name"></div>';
		}
		html += '<div class="confirmorderBox-price">￥ ' + formatterNumber(data.price) + '</div>';
		html += '</div>';
		html += '</div>';

		$("#confirmOrderHtml").html(html);
		cacheImage("shoplogo", data.logo);
		cacheImage("good_img", data.productImg2);
		//购买数量
		$("#number").val(data.num);
		//初始商品总金额
		data.totalPrice = formatterNumber(data.num * data.price);
		data.absPrice = data.totalPrice;
		//		if(isNotNull(addressInfo)){
		//			var TexttotalPrice = formatterNumber(parseFloat(data.totalPrice)+parseFloat(data.enableCoupon.transPrice));
		//			$("#freight").html("￥ " + formatterNumber(data.enableCoupon.transPrice));
		//			$("#totalPrice").html("￥ " + TexttotalPrice);
		//		}else{
		//
		//		}
		data.payType = payType;
		//订单信息（支付方式）
	}

	if (isNotNull(data.enableCoupon.enableCoupon)) {
		$("#showCoupon").show();
	} else {
		$("#showCoupon").hide();
	}
}

function getaddress() {

	if (isNotNull(addressInfo)) {
		$("#Address2").hide();
		$("#Address1").show();
		$("#buyName").html(addressInfo.person);
		$("#buyPhone").html(addressInfo.phone);
		$("#buyaddress").html(addressInfo.province + " " + addressInfo.city + " " + addressInfo.area + " " + addressInfo.address);
		data.province = addressInfo.province;
		//收货地址（省份）
		data.city = addressInfo.city;
		//收货地址（市）
		data.area = addressInfo.area;
		//收货地址（区）
		data.address = addressInfo.address;
		//收货地址（详细地址）
		data.phone = addressInfo.phone;
		//收货地址（手机号）
		data.contactPerson = addressInfo.person;
		//收货地址（收货人姓名）
		//订单是否金额加运费
		getBuyNowFreight(data, function(ret) {
			data.enableCoupon.transPrice = ret;
			submitMsg = '';
			isSubmit = true;
			if (ret < 0) {
				$("#freight").html("该地区不支持配送 ");
				submitMsg = data.shopName + '不支持配送该地区';
				var TexttotalPrice = formatterNumber(parseFloat(data.totalPrice));
				data.absPrice = TexttotalPrice;
				isSubmit = false;
			} else if (ret == 0) {
				$("#freight").html("免运费 ");
				var TexttotalPrice = formatterNumber(parseFloat(data.totalPrice));
				data.absPrice = TexttotalPrice;
			} else if (ret == -2) {//数据异常

			} else {
				$("#freight").html("￥ " + formatterNumber(ret));
				var TexttotalPrice = formatterNumber(parseFloat(data.totalPrice) + parseFloat(data.enableCoupon.transPrice));
				data.absPrice = TexttotalPrice;
			}

			$("#totalPrice").html('￥ ' + formatterNumber(data.absPrice));
		})
	} else {
		$("#Address2").show();
		$("#Address1").hide();
		$("#totalPrice").html("￥ " + formatterNumber(data.totalPrice));
	}
}

//去地址列表
function goAddress() {
	
	var data = {};
	data.source = 1;
	openWinNew('addresslist', '收货地址', [], data, true);
}

//获取单选框的值
function showSelectRes(_selfBtn) {
	hui(_selfBtn).parent().find('input').each(function(cObj) {
		if (cObj.checked) {
			payType = cObj.value;
		}
	});

}

//在已有的代金券中选择
function selectCoupon(shopId) {
	if (is_order) {
		return;
	}
	if (cantClick) {
		return;
	}

	if (myVal) {

		var couponData = {};

		couponData.coupon = newCoup.enableCoupon;
		couponData.shopId = data.shopId;
		openWinNew('selectCoupon', '代金券', [], couponData, true);
	} else {

		var couponData = {};
		couponData.coupon = data.enableCoupon.enableCoupon;
		couponData.shopId = data.shopId;
		openWinNew('selectCoupon', '代金券', [], couponData, true);
	}
}

function goShop() {
	
	var datas = {};
	datas.shopId = data.shopId;
	datas.shopName = data.shopName;
	var fun = new Array({
		"iconPath" : "../icon/search.png"
	});
	openWinNew("shopdetail", data.shopName, fun, datas);
}

var newCoup = {};
var myVal = 0;
var cantClick = 0;
function getOrderCoupon(data, trans) {

	cantClick = 0;
	showLoading()
	addressInfo = getCacheData("addressData");
	if (isNotNull(addressInfo)) {
		var url = "coupon/selectOrderCoupon";
		var bodyParam = {
			body : {
				productId : data.productId,
				totalPrice : data.totalPrice,
				num : data.num,
				shopId : data.shopId,
				province : addressInfo.province,
				city : addressInfo.city
			}
		};

		ajaxRequest(url, bodyParam, function(ret, err) {

			if (ret.code == 1) {

				if (isNotNull(ret.list.enableCoupon)) {

					$("#selectCouponText").html('<span  id="selectCouponText">有可用代金券</span><i class="icon iconfont iconarrow-left"></i>');
				} else {
					$("#selectCouponText").html("暂无优惠劵");
					cantClick = 1;

				}
				newCoup = ret.list
				myVal = 1;
				val = 0

				data.absPrice = data.totalPrice;

			
		

				if (isNotNull(trans)) {
					$("#totalPrice").html("￥ " + formatterNumber(Number(data.absPrice) + Number(trans)));
					data.absPrice=Number(data.absPrice) + Number(trans)
				} else {
					$("#totalPrice").html("￥ " + formatterNumber(Number(data.absPrice)))
					data.absPrice=Number(data.absPrice)
				}

				hideLoading()
			} else {
				_d(err)
			}

		});
	} else {

	}

}

//数量加减按钮事件
var val = 0;
function addNum() {
	showLoading();
	if (is_order) {
		return;
	}
	var number = parseInt($("#number").val());
	if (remain_number < (number + 1)) {

		number = number - 1;
		$("#number").val(remain_number);
		toast("购买数量不能大于库存数量");
		return false;
	} else {
		number = number + 1;
		val = 1
	}
	data.num = number;

	//购买数量更新
	$("#number").val(number);

	//初始商品总金额
	data.totalPrice = formatterNumber(data.num * data.price);

	//订单是否金额加运费
	getBuyNowFreight(data, function(ret) {

		data.enableCoupon.transPrice = ret;

		if (data.couponId > 0) {
			if (ret < 0) {
				$("#freight").html("该地区不支持配送 ");
				data.absPrice = formatterNumber(parseFloat(data.num * data.price) - data.couponMoney);
				isSubmit = false;
			} else if (ret == 0) {
				$("#freight").html("免运费 ");
				data.absPrice = formatterNumber(parseFloat(data.num * data.price) - data.couponMoney);
			} else if (ret == -2) {//数据异常

			} else {
				$("#freight").html("￥ " + formatterNumber(ret));
				data.absPrice = formatterNumber(parseFloat(data.num * data.price) - data.couponMoney + parseFloat(ret));
			}
			if (data.absPrice < 0) {
				data.absPrice = 0;
			}
			$("#totalPrice").html('￥ ' + formatterNumber(data.absPrice));
			//减去代金券的总金额
		} else {
			if (ret < 0) {
				$("#freight").html("该地区不支持配送 ");
				data.absPrice = formatterNumber(parseFloat(data.num * data.price));
				isSubmit = false;
			} else if (ret == 0) {
				$("#freight").html("免运费 ");
				data.absPrice = formatterNumber(parseFloat(data.num * data.price));
			} else if (ret == -2) {//数据异常

			} else {
				$("#freight").html("￥ " + formatterNumber(ret));
				data.absPrice = formatterNumber(parseFloat(data.num * data.price) + parseFloat(ret));
			}

			if (data.absPrice < 0) {
				data.absPrice = 0;
			}
			$("#totalPrice").html("￥ " + formatterNumber(data.absPrice));
		}

		if (val == 1) {
			 trans = parseFloat(ret);
			getOrderCoupon(data, trans)
		}
		hideLoading();
	})
}

function reduceNum() {
	showLoading();
	if (is_order) {
		return;
	}
	var number = parseInt($("#number").val());
	if ((number - 1) < 1) {
		hideLoading();
		toast("购买数量不能小于1");
		return false;
	} else {
		number = number - 1;
		val = 1;
	}

	data.num = number;

	//购买数量更新
	$("#number").val(number);
	//初始商品总金额
	data.totalPrice = formatterNumber(data.num * data.price);

	getBuyNowFreight(data, function(ret) {
		data.enableCoupon.transPrice = ret;

		if (data.couponId > 0) {
			if (ret < 0) {
				$("#freight").html("该地区不支持配送 ");
				data.absPrice = formatterNumber(parseFloat(data.num * data.price) - data.couponMoney);
				isSubmit = false;
			} else if (ret == 0) {
				$("#freight").html("免运费 ");
				data.absPrice = formatterNumber(parseFloat(data.num * data.price) - data.couponMoney);
			} else if (ret == -2) {//数据异常

			} else {
				$("#freight").html("￥ " + formatterNumber(ret));
				data.absPrice = formatterNumber(parseFloat(data.num * data.price) - data.couponMoney + parseFloat(ret));
			}
			if (data.absPrice < 0) {
				data.absPrice = 0;
			}
			$("#totalPrice").html('￥ ' + formatterNumber(data.absPrice));
			//减去代金券的总金额
		} else {
			if (ret < 0) {
				$("#freight").html("该地区不支持配送 ");
				data.absPrice = formatterNumber(parseFloat(data.num * data.price));
				isSubmit = false;
			} else if (ret == 0) {
				$("#freight").html("免运费 ");
				data.absPrice = formatterNumber(parseFloat(data.num * data.price));
			} else if (ret == -2) {//数据异常

			} else {
				$("#freight").html("￥ " + formatterNumber(ret));
				data.absPrice = formatterNumber(parseFloat(data.num * data.price) + parseFloat(ret));
			}

			if (data.absPrice < 0) {
				data.absPrice = 0;
			}
			$("#totalPrice").html("￥ " + formatterNumber(data.absPrice));
		}
		if (val == 1) {
			 trans = parseFloat(ret)
			getOrderCoupon(data, trans)
		}
		hideLoading();
	})
}

//订单提交
function paySubmit() {
	if (is_order) {
		//toast("订单已提交，请勿重复提交");
	
		pay(orderNo, orderMoney, payType, orderCode);
		return false;
	} else {
		var notes = $("#notes").val();
		if (!isNotNull(addressInfo)) {
			toast("请选择发货地址");
			return false;
		}
		if (!isSubmit) {
			toast(submitMsg);
			return false;
		}
		if (!isNotNull(payType)) {
			toast("请选择支付方式");
			return false;
		}
		//订单备注
		if (isNotNull(notes)) {
			data.notes = notes;
		}
		var orderJson = {};
		showProgressNew("正在提交", "请稍后....");
		
		$.each(data, function(n, value) {
			if (n != "enableCoupon") {
				orderJson[n] = value;
			}
		});
		//good.totalPrice = data.cartList[i].orderPrice+data.cartList[i].transPrice;			 //该订单的总金额
		if (parseFloat(data.enableCoupon.transPrice) > 0) {
			orderJson.totalPrice = parseFloat(orderJson.totalPrice) + parseFloat(data.enableCoupon.transPrice);
			//该订单的总金额
		} else {
			orderJson.totalPrice = parseFloat(orderJson.totalPrice);
			//该订单的总金额
		}
		orderJson.productPrice = parseFloat(data.num * data.price);
		//该订单的商品总金额


		orderJson.absPrice = orderJson.absPrice;
		//该订单的商品总金额
		orderJson.transPrice = data.enableCoupon.transPrice;
		//该订单的运费金额
		orderJson.payType = payType;
		//支付状态

		var url = "order/addOrder.do";
		var bodyParam = {
			body : orderJson
		};

		ajaxRequest2(url, bodyParam, function(ret, err) {
			if (err) {
				hideProgress();
				toast('数据通讯发生错误，请重试');
			} else {
				if (ret.code == 1) {
					is_order = true;
					api.sendEvent({
						name : 'orderSubmit'
					});
					api.sendEvent({
						name : 'paySuccess'
					});
					hideProgress();
					orderId = ret.orderId;
					orderNo = ret.orderNo;
					//生成订单后订单编号
					orderMoney = ret.money;
					orderCode = ret.orderCode;
					//生成订单后订单支付金额

					pay(orderNo, orderMoney, payType, orderCode);

				} else {
					hideProgress();
					toast(ret.msg);
				}
			}
		});
	}
}

//支付成功回调
function successpay(ret, err) {

	if (ret.code == 9000) {
		api.sendEvent({
			name : 'paySuccess'
		});
		var jsonData = {};
		jsonData.orderId = orderId;

		if (data.type == 3 || data.type == 4) {
			getOrderDetails(orderId, function(ret, err) {
				if (err) {
					toast('数据通讯发生错误，请重试');
					return false;
				} else {
					jsonData = {};
					if (ret.code == 1) {

						jsonData.order = ret.order;

						if (ret.order.groupStatus == 1) {
							jsonData.zhifu = 1;
							openWinNew('waitshare', '拼团成功', [], jsonData, true);
							//							api.closeWin({
							//								'name' : 'confirmorder'
							//							});
						} else {
							openWinNew('shareorder', '支付完成', [], jsonData, true);
							//							api.closeWin({
							//								'name' : 'confirmorder'
							//							});
						}
					} else {
						toast('数据通讯发生错误，请重试');
						return false;
					}
				}
			});
		} else {
			openWinNew('successpay', '支付完成', [], jsonData, true);
		}
	} else {
		is_order = true;
		if (data.type == 3 || data.type == 4) {

			hui.confirm('亲，确定要取消支付吗？', ['取消', '确认'], function() {
				var orderData = {};
				orderData.status = 0;
				openWinNew('spellorder', '拼团订单', [], orderData, true);
			}, function() {
				var orderData = {};
				orderData.status = 0;
				openWinNew('spellorder', '拼团订单', [], orderData, true);
			});
		} else {
			hui.confirm('亲，确定要取消支付吗？', ['取消', '确认'], function() {
				var orderData = {};
				orderData.status = 0;

				openWinNew('myorder', '我的订单', [], orderData, true);
			}, function() {
				var orderData = {};
				orderData.status = 0;
				openWinNew('myorder', '我的订单', [], orderData, true);
			});
		}

	}
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
