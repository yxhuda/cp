//立即购买获取运费
function getBuyNowFreight(data,bankfun){
	addressInfo = getCacheData("addressData");
	var url = "coupon/selectOrderCoupon";
	var bodyParam = {
		body : {
			productId : data.productId,
			totalPrice : data.totalPrice,
			 num: data.num,
			 shopId:data.shopId,
			 province:addressInfo.province,
			 city:addressInfo.city
		}
	};
	
	ajaxRequest(url, bodyParam, function(ret, err) {
		var transPrice = 0;
		if(ret.code==1){
			if(isNotNull(ret.list.transPrice)){
				transPrice = ret.list.transPrice;
			}
		}else{
			transPrice = -2;  //数据获取异常
		}
		bankfun(transPrice);
	});
}


//购物车下单获取运费
function getCartFreight(addressInfo,bankfun){
	var url = 'cart/submitCart.do';
	var bodyParam = {
		body : {
			 province:addressInfo.province,
			 city:addressInfo.city
		}
	};
	ajaxRequest(url, bodyParam, function(ret, err) {
		if (err) {
			toast('数据通讯发生错误');
		} else {
			if(ret.code==1){
				var freight = Array();
				for(var i=0;i<ret.cartList.length;i++){
					var freightinfo = {};
					freightinfo['transPrice'] = ret.cartList[i].transPrice;
					freightinfo['shopId'] = ret.cartList[i].shopId;
					freight.push(freightinfo);
				}
				bankfun(freight);
			}else{
				bankfun(0);
			}
			
		}
	});

}


//修改订单地址获取运费
function getOrderFreight(data,bankfun){
	var url = 'order/updateOrder.do';
	var bodyParam = {
		body : {
			id : data.id, //订单ID
			payType : data.payType, //订单支付方式
			province : data.province, //地址（省）
			city : data.city, //地址（市）
			area : data.area, //地址（区）
			address : data.address, //地址（详情）
			contactPerson : data.contactPerson, //地址（省）
			phone : data.phone,				//地址（省）
		}
	};

	ajaxRequest2(url, bodyParam, function(ret, err) {
		if (err) {
			toast('数据通讯发生错误，请重试');
			return false;
		} else {

			bankfun(ret);
		}

	});
}