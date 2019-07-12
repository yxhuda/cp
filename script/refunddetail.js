var orderInfo;
var orderId;
var orderType;
var config;
var endTime;
var jsonData;
apiready = function() {
	config = getCacheData('config');
	api.addEventListener({
	    name:'viewappear'
    },function(ret,err){
    	//coding...
    	api.closeWin({
		    name: 'refundonly'
		});
		api.closeWin({
		    name: 'applyrefund'
		});
    });
	api.addEventListener({
		name : 'perform' 
	}, function(ret, err) {
		init();
	});
	jsonData=api.pageParam

	init()
}
function init() {
	showLoading();
	url = "order/selectRefund.do";
	var bodyParam = {
		body : {
			orderId : jsonData.orderDetails[jsonData.tui].id
		}
	};

	ajaxRequest(url, bodyParam, function(ret, err) {
	
		hideLoading();
		if (err) {
			toast('服务器开了个小差，在刷新尝试一下');
		} else {
			if (ret.code == 1) {
			var dateTime = conversion(ret.refund.createDate)*1000;  
    		var time=dateTime+config.refundTime*60*60*1000;
    		// 比如需要这样的格式 yyyy-MM-dd hh:mm:ss
			endTime = new Date(time);
				
				jsonData.refundInfo = ret.refund;
				if(ret.refund.num>=2){
					$("#removeRefund").hide();
					$("#openChat").show();
				}if(ret.refund.num==0){
					$("#removeRefund").hide();
						$("#disPetition").show();
					
				}
					
					if(isNotNull(ret.refund.applyRefuseReason)){
					$("#title").html('审核失败原因:'+ret.refund.applyRefuseReason)
					}
				if (ret.refund.product_name) {

					$("#text1").html(ret.refund.shopName);
					if (ret.refund.type == 1) {
						$("#text2").html("退款退货");
					

					} else if (ret.refund.type == 2) {
						$("#text2").html("仅退款");
					}
					if (ret.refund.receiveStatus == 1) {
						$("#text3").html("未收货");
					} else if (ret.refund.receiveStatus == 2) {
						$("#text3").html("已收货");
					}
					$("#text4").html('￥' + ret.refund.refundPrice);
					$("#text5").html(ret.refund.reason);
					$("#text6").html(ret.refund.product_name);
					$("#text7").html(ret.refund.orderCode);
					$("#text8").html(ret.refund.createDate);
				} else {

					$("#text1").html(ret.refund.shopName);
					if (ret.refund.applytype == 1) {
						$("#text2").html("仅退款");

					} else if (ret.refund.applytype == 2) {
						$("#text2").html("退款退货");
					}
					if (ret.refund.applystate == 1) {
						$("#text3").html("未收货");
					} else if (ret.refund.applystate == 2) {
						$("#text3").html("已收货");
					}
					$("#text4").html('￥' + ret.refund.userPrice);
					$("#text5").html(ret.refund.content);
					$("#text6").html(ret.refund.productName);
					$("#text7").html(ret.refund.orderCode);
					$("#text8").html(ret.refund.payTime);
				
				}

			} else {
				toast('服务器开了个小差，在刷新尝试一下');
			}
		}
	});
	
}


 function GetRTime() {
     var EndTime = new Date(endTime);
     var NowTime = new Date();
     var t = EndTime.getTime() - NowTime.getTime();
     var d = 0;
     var h = 0;
     var m = 0;
     var s = 0;
     if (t >= 0) {
         d = Math.floor(t / 1000 / 60 / 60 / 24);
         h = Math.floor(t / 1000 / 60 / 60 % 24);
         m = Math.floor(t / 1000 / 60 % 60);
         s = Math.floor(t / 1000 % 60);
     }
     function toDouble(n) {
         return n < 10 ? '0' + n : n;
     }
     document.getElementById('t_d').innerHTML = d + '天';
     document.getElementById('t_h').innerHTML = toDouble(h) + '时';
     document.getElementById('t_m').innerHTML = toDouble(m) + '分';
     document.getElementById('t_s').innerHTML = toDouble(s) + '秒';

 }
 setInterval(GetRTime, 0)

function dischargePetition() {
	
	openWinNew("applyrefund", '申请退款', [], jsonData);
	api.closeWin();
}


//客服聊天
function openChat() {

	if (!checkUser())
		return false;
	var data = {};
	//退第i个 先传
	data.order = jsonData;
	data.sendId = '1000000000000000001';
	data.img = '../img/kefu.png';
	data.pushUserId = '0';
	openWinNew("service_chat", '客服', {}, data, true);
}

function disPetition() {

	hui.confirm('你将撤销本次申请，如果问题未解决，还可以再次发起。确定继续吗？', ['取消', '确认'], function() {

		//	if(orderInfo.orderId)
		//		orderInfo.orderId=orderInfo.id;
		if (jsonData.refundInfo.reason)
			jsonData.refundInfo.content = jsonData.refundInfo.reason;
		if (jsonData.refundInfo.refundPrice)
			jsonData.refundInfo.userPrice = jsonData.refundInfo.refundPrice;
		if (jsonData.refundInfo.phone)
			jsonData.refundInfo.phone = jsonData.refundInfo.phone;
		if (jsonData.refundInfo.applyRefuseReason)
			jsonData.refundInfo.applyreason = jsonData.refundInfo.applyRefuseReason;
		if (jsonData.refundInfo.receiveStatus)
			jsonData.refundInfo.applystate = jsonData.refundInfo.receiveStatus;
		if (jsonData.refundInfo.serviceType)
			jsonData.refundInfo.applytype = jsonData.refundInfo.serviceType;
		if (jsonData.refundInfo.shopId)
			jsonData.refundInfo.shopId = jsonData.refundInfo.shopId
		if (jsonData.refundInfo.type)
			jsonData.refundInfo.type = jsonData.refundInfo.type
		if (jsonData.refundInfo.id)
			jsonData.refundInfo.refundId = jsonData.refundInfo.id
		var url = "order/refund.do";
		var bodyParam = {};
		bodyParam = {
			body : {
				orderId : jsonData.refundInfo.orderId,
				reason : jsonData.refundInfo.content,
				refundPrice : jsonData.refundInfo.userPrice,
				phone : jsonData.refundInfo.phone,
				buyerRemarks : jsonData.refundInfo.applyreason,
				receiveStatus : jsonData.refundInfo.applystate,
				serviceType : jsonData.refundInfo.applytype,
				imgUrl : '',
				type : jsonData.refundInfo.type,
				shopId : jsonData.refundInfo.shopId,
				status : 6,
				refundId : jsonData.refundInfo.refundId
			}
		};

		ajaxRequest2(url, bodyParam, function(ret, err) {
		_d(ret)
		_d(err)
			if (ret.code == 1) {
			
				api.sendEvent({
					name : 'perform'
				});
				toast("撤销成功")
				api.closeWin();
			} else {
				toast("撤销失败")
			}
		})

	});
}
