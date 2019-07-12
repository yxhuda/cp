function pay(orderNo, money, payType, orderCode) {
	var bodyParam = {};
	var url = '';
	if (payType == 2) {
		url = 'pay/pay.do';
		bodyParam = {
			body : {
				outTradeNo : orderNo,
				totalAmount : money,
				orderCode : orderCode
			}
		};
		ajaxRequest4(url, bodyParam, function(ret, err) {
			if (err) {
				_d(err);
			} else {

				if (ret.code == 1) {

					zhifubao(ret.data);

				} else {

					toast("支付失败");
					return false;
				}
			}

		});
	} else {
		url = 'pay/wxpay.do';
		bodyParam = {
			body : {
				orderNo : orderNo,
				totalFee : money,
				orderCode : orderCode
			}
		};

		ajaxRequest(url, bodyParam, function(ret, err) {
		
			if (err) {
				_d(err);
			} else {

				if (ret.code == 1) {

					weixinPay(ret);

				} else {

					toast("支付失败");
					return false;
				}
			}

		});
	}

}

//微信支付
function weixinPay(signArr) {
	
	var wxPay = api.require('wxPay');
	wxPay.payOrder({
		apiKey : signArr.appid,
		orderId : signArr.prepayid,
		mchId : signArr.partnerid,
		nonceStr : signArr.noncestr,
		timeStamp : signArr.timestamp,
		package : signArr.package,
		sign : signArr.sign
	}, function(ret, err) {
		var r = {};
		if (ret.status) {
			r.code = 9000;
		} else {
			r.code = 6001;
		}
		successpay(r, err);
	});

}

//支付宝支付
function zhifubao(signArr) {

	var aliPayPlus = api.require('aliPayPlus');

	aliPayPlus.payOrder({
		orderInfo : signArr
	}, function(ret, err) {
		successpay(ret, err);
	});
}
