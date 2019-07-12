var data;
var addressInfo;
//选中的地址信息
var payType = 1;
//支付方式
var couponArrId = new Array();
//已选中的代金券id
var allMoney = 0;
//订单总金额
var absPrice = 0;
//订单使用代金券后的总金额
var sourceType = 0;
//订单提交来源（type-1普通下单 2购物车下单 3发起拼团 4参加拼团）
var is_order = false;
//订单是否已生成(用户点击支付后，取消支付，返回 订单列表)
var jsonCoupon = {};
var orderId = 0;
//生成订单后订单ID
var orderNo = 0;
//生成订单后订单编号
var orderMoney = 0;
//生成订单后订单支付金额
var couponId = [];
var myClick = 0;

var orderCode;
//
//var newArr=[];
var isSubmit = true;
var submitMsg = '';  //提示信息
var noCoupon;
apiready = function() {
	api.addEventListener({
		name : 'selectAddress'
	}, function(ret, err) {
		getCartFreight(ret.value,function(ret){
			if(isNotNull(ret)){
				var Money = 0;
				var coupon_input_price = 0;
				isSubmit = true;
				submitMsg = '';
				for(var i=0;i<ret.length;i++){
					if(ret[i].transPrice<0){
						
						$("#transPrice_"+ret[i].shopId).html("该地区不支持配送 ");
						isSubmit = false;
						
					}else if(ret[i].transPrice==0){
						$("#transPrice_"+ret[i].shopId).html("免运费 ");
					}else{
						$("#transPrice_"+ret[i].shopId).html("￥ "+ formatterNumber(ret[i].transPrice));		
					}
					
					for(var j=0;j<data.cartList.length;j++){
						if(ret[i].shopId==data.cartList[j].shopId){
							coupon_input_price = $("#coupon_input_price"+data.cartList[j].shopId).val();
							if(data.cartList[j].transPrice<0){
								var total = formatterNumber(parseFloat(data.cartList[j].orderPrice)-parseFloat(coupon_input_price));
								submitMsg = data.cartList[j].shopName+'不支持配送该地区';
							}else if(data.cartList[j].transPrice==0){
								var total = formatterNumber(parseFloat(data.cartList[j].orderPrice)-parseFloat(coupon_input_price));
							}else{
								var total = formatterNumber(parseFloat(data.cartList[j].orderPrice)+parseFloat(ret[i].transPrice)-parseFloat(coupon_input_price));
							}
							$("#totalMoneyText_"+ret[i].shopId).html("￥  "+total);
							$("#total_shop_price"+ret[i].shopId).val(total);
							Money =formatterNumber(parseFloat(Money)+parseFloat(total));
						}
					}
				}
			
				$('#totalPrice').html(formatterNumber(Money));
			}
		});
		addressInfo = ret.value;
		getaddress();
	});
	api.addEventListener({
		name : 'selectCoupon'
	}, function(ret, err) {
		var couponTotalAmount = 0;
		for (var i = 0; i < couponArrId.length; i++) {
			if (couponArrId[i].shopId == ret.value.shopId) {
				couponArrId[i].coupon_id = ret.value.coupon.id;
				couponId.push(couponArrId[i].coupon_id);
				couponArrId[i].coupon_price = ret.value.coupon.condition;
			}
			couponTotalAmount += parseFloat(couponArrId[i].coupon_price);
		}
		$("#coupon_input_" + ret.value.shopId).val(ret.value.coupon.id);
		$("#selectCouponText_" + ret.value.shopId).html('省' + ret.value.coupon.condition + '元,' + getCouponName(ret.value.coupon.account, ret.value.coupon.condition, ret.value.coupon.couponType) + '<i class="icon iconfont iconarrow-left"></i>');
		if (isNotNull(couponArrId)) {
			for (var i = 0; i < couponArrId.length; i++) {
				couponArrId[i].zanwu = 0;
			}
		}
		useCoupon();
		if (isNotNull(couponArrId)) {

			for (var i = 0; i < couponArrId.length; i++) {
			
				if (couponArrId[i].zanwu == 1) {
					
					$("#selectCouponText_" + couponArrId[i].shopId).html('暂无优惠劵')
					
				}else{
				if(couponArrId[i].zanwu==0&&$("#coupon_input_" + couponArrId[i].shopId).val()==0)
				
				$("#selectCouponText_" + couponArrId[i].shopId).html('有可用优惠劵')
				}
			}
		}
		var total_shop_price = $("#total_shop_price" + ret.value.shopId).val();
		$("#coupon_input_price"+ ret.value.shopId).val(ret.value.coupon.condition);
		$("#totalMoneyText_" + ret.value.shopId).html('￥ ' + formatterNumber(total_shop_price - formatterNumber(ret.value.coupon.condition)));
		absPrice = formatterNumber(allMoney - couponTotalAmount);
		if (absPrice < 0)
			absPrice = 0;
		$('#totalPrice').html(formatterNumber(absPrice));

	});

	//返回按钮监听
	api.addEventListener({
		name : 'navbackbtn'
	}, function(ret, err) {
		if (is_order) {
			
			var orderData = {};
			orderData.status = 0;
			openWinNew('myorder', '我的订单', [], orderData, true);
		} else {
			hui.confirm('亲，确定要离开吗？', ['取消', '确认'], function() {
				closeWin();
			}, function() {

			});

		}
	});

	userAddress()
	//getaddress();
	data = api.pageParam.info;
	sourceType = api.pageParam.sourceType;
	init();
}
function getaddress() {
	if (isNotNull(addressInfo)) {
		$("#Address2").hide();
		$("#Address1").show();
		$("#buyName").html(addressInfo.person);
		$("#buyPhone").html(addressInfo.phone);
		$("#buyaddress").html(addressInfo.province + " " + addressInfo.city + " " + addressInfo.area + " " + addressInfo.address);
	} else {
		$("#Address2").show();
		$("#Address1").hide();
	}
}

function init() {

	var result = createHtml(data.cartList);
	
	$('#orderList').html(result.html);
	for (var i = 0; i < result.src.length; i++) {
		cacheImage("img" + result.src[i].id, result.src[i].src);
	}
	

}

function createHtml(data) {
	
	var html = '';
	var idImg = new Array();
	var flag = true;

	for (var i = 0; i < data.length; i++) {

		var number = 0;
		var totalMoney = 0;
		html += '<div class="Shop-title" onclick="goShop(\'' + data[i].shopId + '\',\'' + data[i].shopName + '\');">';
		html += '			<div class="Shop-left">';
		html += '				<i class="icon iconfont icondianpu"></i>';
		html += '				<span>' + data[i].shopName + '</span>';
		html += '				<i class="icon iconfont iconarrow-left"></i>';
		html += '			</div>';
		html += '		</div>';
		for (var z = 0; z < data[i].list.length; z++) {
			var tmp = {};
			tmp.id = data[i].list[z].cartDescId;
			tmp.src = data[i].list[z].img;
			idImg.push(tmp);
			number += parseInt(data[i].list[z].number);
			html += '<div class="confirmorderBox">';
			html += '		<div class="confirmorderBox-img">';
			html += '			<img src="../img/productListDefault.png" id="img' + data[i].list[z].cartDescId + '"/>';
			html += '		</div>';
			html += '		<div class="confirmorderBox-text">';
			html += '			<div class="confirmorderBox-title">';
			html += data[i].list[z].productName;
			html += '			</div>';

			if (data[i].list[z].specDesc == null) {
				html += '			<div class="confirmorderBox-name">';
				html += '			</div>';
			} else if (data[i].list[z].specDesc != null) {
				html += '			<div class="confirmorderBox-name">';
				html += '				规格：' + data[i].list[z].specDesc;
				html += '			</div>';
			}
//			if(isNotNull(data[i].list[z].number)){
//			html += '			<div class="confirmorderBox-name">';
//				html += '				数量：' + data[i].list[z].number;
//				html += '			</div>';
//			
//			}

			html += '			<div class="confirmorderBox-price">';
			html += '￥' + formatterNumber(data[i].list[z].preferentialPrice);
			totalMoney += parseFloat(data[i].list[z].preferentialPrice) * parseInt(data[i].list[z].number);
			allMoney += parseFloat(data[i].list[z].preferentialPrice) * parseInt(data[i].list[z].number);
		
			html += '			</div>';
			
			html += '		</div>';
				html += '		<div style="text-align:right;margin:40px 10px 0 0">x' + data[i].list[z].number+ '</div>'
			html += '	</div>';
		}
		data[i].orderPrice = formatterNumber(totalMoney);
		//单店铺商品总金额
		data[i].number = formatterNumber(number);
		//单店铺商品总数量
		html += '<div class="borderlink"></div>';

		if (isNotNull(data[i].coupon)) {
			
			html += '<div class="quantity" tapmode="" onclick="selectCoupon(\'' + data[i].shopId + '\');">';
			html += '<div class="quantity-title">优惠券</div>';
			html += '<input type="hidden" id="coupon_input_price' + data[i].shopId + '" value="0">';
			html += '<div class="quantity-right" id="selectCouponText_' + data[i].shopId + '">有可用代金券<i class="icon iconfont iconarrow-left"></i></div>';

			html += '<input type="hidden" id="coupon_input_' + data[i].shopId + '">';
			html += '</div>';
			html += '<div class="borderlink"></div>';
		}else{
			html += '<input type="hidden" id="coupon_input_price' + data[i].shopId + '" value="0">';
		}
		//运费
		if (isNotNull(addressInfo)) {
			html += '<div class="quantity">';
			html += '<div class="quantity-title">运费</div>';

			html += '<div class="quantity-right"><span id="transPrice_'+data[i].shopId+'">￥ 0.00</span></div>';
			html += '</div>';
			html += '<div class="borderlink"></div>';
		}else{
			html += '<div class="quantity">';
			html += '<div class="quantity-title">运费</div>';
		
			if(data[i].transPrice<0){
		
				html += '<div class="quantity-right"><span id="transPrice_'+data[i].shopId+'">该地区不支持配送</span></div>';
				isSubmit = false;
				submitMsg = data[i].shopName+'不支持配送该地区';
			}else if(data[i].transPrice==0){
			
				html += '<div class="quantity-right"><span id="transPrice_'+data[i].shopId+'">免运费</span></div>';
			}else{
				html += '<div class="quantity-right"><span id="transPrice_'+data[i].shopId+'">￥ '+ formatterNumber(data[i].transPrice)+'</span></div>';
				allMoney += parseFloat(data[i].transPrice);
				totalMoney += parseFloat(data[i].transPrice);
			}
			
			html += '</div>';
			html += '<div class="borderlink"></div>';
			
			
		}	
		html += '			<div class="confirmorderBox-bottom confirmorder-list">';
		html += '<input type="hidden" id="total_shop_price' + data[i].shopId + '" value="' + formatterNumber(totalMoney) + '">';
		
		html += '				共<span>' + number + '</span>件商品，小计<span id="totalMoneyText_' + data[i].shopId + '">￥ ' + formatterNumber(totalMoney) + '</span>';
		html += '			</div>';
		//初始化店铺已选代金券占位
		var couponjson = {};
		couponjson.shopId = data[i].shopId;
		//店铺ID
		couponjson.coupon_id = 0;
		//代金券ID
		couponjson.coupon_price = 0;
		//代金券金额
		couponArrId.push(couponjson);
		jsonCoupon[data[i].shopId] = data[i].coupon;
	}
	var result = {};
	result.html = html;
	result.src = idImg;
	//初始化
	$('#totalPrice').html(formatterNumber(allMoney));
	return result;
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

//订单提交
function paySubmit() {
	
	if (is_order) {
		orderCode = '';
		
		pay(orderNo, orderMoney, payType,orderCode);
		return false;
	} else {
		if (!isNotNull(addressInfo)) {
			toast("请选择发货地址");
			return false;
		}
		if(!isSubmit){
			toast(submitMsg);
			return false;
		}
		if (!isNotNull(payType)) {
			toast("请选择支付方式");
			return false;
		}
		showProgressNew("正在提交", "请稍后....");
		var url = "order/addOrder.do";
		var bodyParam = {};
		if (sourceType) {
			bodyParam = {
				body : orderDataDispose(sourceType)
			};
		}
		
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
					//生成订单后订单支付金额
					orderCode = '';
					pay(orderNo, orderMoney, payType,orderCode);
				} else {
					hideProgress();
					toast(ret.msg);
				}
			}
		});
	}
}

//判断代金券可否使用
function useCoupon() {

	for (var i = 0; i < couponArrId.length; i++) {
		couponArrId[i].zanwu = 0;
		if (!couponArrId[i].coupon_id) {
			var coupon;
			coupon = selectCoupon(couponArrId[i].shopId, 1)

			var num = 0
			for (var j = 0; j < coupon.length; j++) {
				if (coupon[j].selected == 1) {
					num++
				}
			}
			if (num == coupon.length) {
				couponArrId[i].zanwu = 1;
			}
			
		}
	}
}
	

//在已有的代金券中选择
function selectCoupon(shopId, zanwu) {
	var couponData = {};
	$.each(jsonCoupon, function(i, val) {
		for (var j = 0; j < val.length; j++) {
			if (couponId.length > 0) {
				for (var k = 0; k < couponId.length; k++) {
					if (val[j].id == couponId[k]) {

						val[j].selected = 1;

					} else {
						val[j].selected = 0;
					}
				}
			} else {
				for (var j = 0; j < val.length; j++) {
					val[j].selected = 0;
				}
			}

		}
		for (var j = 0; j < jsonCoupon[i].length; j++) {
			for (var k = 0; k < data.cartList.length; k++) {
				if (jsonCoupon[i][j].id == $("#coupon_input_" + data.cartList[k].shopId).val()) {
					jsonCoupon[i][j].selected = 1;
				}
			}
		}
		if (i == shopId) {
			couponData.coupon = val;
		}
	});
	if (!zanwu) {
	
		couponData.shopId = shopId;
		var myNum=0;
		for(var i=0;i<couponData.coupon.length;i++){
			if(couponData.coupon[i].selected==1){
				myNum++;
			}
		}
		if(myNum!=couponData.coupon.length){
		openWinNew('selectCoupon', '代金券', [], couponData, true);
		}else{
			toast("暂无优惠劵")
		}
	} else {
		return couponData.coupon
	}
}

function orderDataDispose(type) {
	var notes = $("#notes").val();
	var body = {};
	if (type == 2) {
		body.province = addressInfo.province;
		//收货地址（省份）
		body.city = addressInfo.city;
		//收货地址（市）
		body.area = addressInfo.area;
		//收货地址（区）
		body.address = addressInfo.address;
		//收货地址（详细地址）
		body.phone = addressInfo.phone;
		//收货地址（手机号）
		body.contactPerson = addressInfo.person;
		//收货地址（收货人姓名）
		body.payType = payType;
		//订单信息（支付方式）

		if (isNotNull(notes)) {
			body.notes = notes;
		}
		//商品信息
		var goodinfo = new Array();
		
		for (var i = 0; i < couponArrId.length; i++) {

			var good = {};
			good.cartId = data.cartList[i].cartId;
			good.shopName = data.cartList[i].shopName;
			good.logo = data.cartList[i].logo;
			good.shopId = data.cartList[i].shopId;
			good.list = data.cartList[i].list;
			if(parseFloat(data.cartList[i].transPrice)>0){
				good.totalPrice = parseFloat(data.cartList[i].orderPrice)+parseFloat(data.cartList[i].transPrice);			 //该订单的总金额
			}else{
				good.totalPrice = parseFloat(data.cartList[i].orderPrice);			 //该订单的总金额
			}
			good.productPrice = data.cartList[i].orderPrice;     //该订单的商品总金额
			good.transPrice = data.cartList[i].transPrice;     //该订单的运费金额
			//订单信息（订单总价）
			if (couponArrId[i].coupon_id > 0) {
			_d( couponArrId[i])
				good.couponId = couponArrId[i].coupon_id;
				good.coupon_price = couponArrId[i].coupon_price;
				if(parseFloat(data.cartList[i].transPrice)>0){
					good.absPrice = formatterNumber(parseFloat(data.cartList[i].orderPrice)+parseFloat(data.cartList[i].transPrice) - couponArrId[i].coupon_price);
				}else{
					good.absPrice = formatterNumber(parseFloat(data.cartList[i].orderPrice) - couponArrId[i].coupon_price);
				}
				
				//订单信息（实付金额：代金券抵扣过后金额）
			} else {
				if(parseFloat(data.cartList[i].transPrice)>0){
					good.absPrice = formatterNumber(parseFloat(data.cartList[i].orderPrice)+parseFloat(data.cartList[i].transPrice));
				}else{
					good.absPrice = formatterNumber(parseFloat(data.cartList[i].orderPrice));
				}
				//订单信息（实付金额：代金券抵扣过后金额）
			}
			goodinfo.push(good);
			_d(good)
		}
		body.type = type;
		body.cartList = JSON.stringify(goodinfo);
	}
	
	return body;
}

function successpay(ret, err) {
	
	if (ret.code == 9000) {
		//closeWin();
		api.sendEvent({
			name : 'paySuccess'
		});
		var jsonData = {};
		jsonData.orderId = orderId;
		openWinNew('successpay', '支付完成', [], jsonData, true);
	} else {
		is_order = true;
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

function goShop(shopId, shopName) {
	
	var data = {};
	data.shopId = shopId;
	data.shopName = shopName;
	var fun = new Array({
		"iconPath" : "../icon/search.png"
	});
	openWinNew("shopdetail", shopName, fun, data);
}

//获取用户收货地址
function userAddress() {
	var url = "address/list.do";
	ajaxRequest(url, {}, function(ret, err) {
		if (err) {
			_d(err);
		} else {

			if (ret.code == 1) {
				if (isNotNull(ret.address)) {
					for (var i = 0; i < ret.address.length; i++) {
						if (ret.address[i].isDefault == 1) {
							addressInfo = ret.address[i];
						}
					}
				}
				getaddress();
			}
		}
	})
}

