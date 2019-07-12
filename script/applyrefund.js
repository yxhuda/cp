var orderInfo;
apiready = function() {
	orderInfo = api.pageParam;
	
}
function refund(val) {
	var data = orderInfo;
	
	data.serviceType = val;
	openWinNew('refundonly', '申请退款', {}, data, true);
}
