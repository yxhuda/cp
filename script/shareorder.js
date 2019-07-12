var orderInfo;
var config;
var dialogBox;
var wx;
var config;
var orderShare;

var adInfo;
apiready = function() {
	
	orderInfo = api.pageParam.order;
	orderShare = api.pageParam.type;
	config = getCacheData('config');
	wx = api.require('wx');
	//配置文件
	dialogBox = api.require('dialogBox');
	
	
	api.addEventListener({
		name : 'navbackbtn'
	}, function(ret, err) {
		if (orderInfo.groupStatus == 1) {
			var data = {};
			data.status = 1;
			closeWin();
			closeWin('confirmorder')
		} else if (orderInfo.groupStatus == 0) {
			hui.confirm('确定离开吗？邀请好友拼单才能大大提高拼单率哦~', ['离开', '去邀请好友'], function() {
				inviteFriends();
			}, function() {
				closeWin();
				closeWin('confirmorder')
			});
		}
	});
	api.addEventListener({
	    name:'viewappear'
    },function(ret,err){
    	//coding...
    	api.closeWin({'name':'confirmorder'});
    });

	init();
	getad();
	if(!api.pageParam.myorder)
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

	if (isNotNull(orderInfo)) {
		var html = '';
		html += '<div class="shareorder">';
		html += '<div class="shareorder-title">还差<span>' + orderInfo.groupNum + '</span>人，邀请好友拼单</div>';
		html += '<div class="shareorder-time"><div id="countdown3" class=" hui-countdown"><span>0</span><span>0</span>:<span>0</span><span>0</span>:<span>0</span><span>0</span></div></div>';
		html += '<div class="shareorder-button" tapmode="" onclick="inviteFriends();">邀请好友拼单</div>';
		html += '<div class="shareorder-buttons" tapmode="" onclick="goOrderDetails(\'' + orderInfo.id + '\');">回到订单详情页</div>';
		html += '</div>';
		html += '<div class="host">';
		html += '<div class="host-content">';
		_d(123123123123)
			_d(orderInfo)
		for (var i = 0; i < orderInfo.MemberList.length; i++) {
			html += '<div class="hostBox">';
			html += '<div class="host-img"><img src="../img/verify03.png" id="groupBullet_' + orderInfo.MemberList[i].id + '"/></div>';
			if (orderInfo.MemberList[i].isHeader == 1) {
				html += '<div class="host-position">拼主</div>';
			}
			html += '</div>';
		}
		for (var i = 0; i < orderInfo.groupNum; i++) {
			html += '<div class="host-i"><i class="icon iconfont iconwenhao"></i></div>';
		}
		html += '</div>';
		html += '</div>';
		html += '<div class="Coupon-list" tapmode="" onclick="goOrderDetails(\'' + orderInfo.id + '\');"><div class="Coupon-left"><div class="Coupon-title">订单详情</div></div><div class="Coupon-right"><i class="icon iconfont iconarrow-left"></i></div></div>';
		html += '<div class="Coupon-list"><div class="Coupon-left"><div class="Coupon-title">拼单规则</div></div><div class="Coupon-left">	好友拼单 · 人满发货 · 人不满退款</div>';
		html += '</div>';
		var time = date('Y-m-d H:i:s', (conversion(orderInfo.payTime) + parseFloat(config.cancelOrderTime) * 3600));
		var timestamp = Date.parse(new Date()) / 1000;
		if ((conversion(orderInfo.payTime) + parseFloat(config.cancelOrderTime) * 3600) >= timestamp) {
			hui.countdown(time, '#countdown3', 3, function() {
				
			});
//			//弹出分享
//			if (isNotNull(orderShare) && orderShare== 'sendShare'&&!api.pageParam.myorder) {
//				inviteFriends();
//			}
		}
		$("#groupOrderHtml").html(html);
		if (isNotNull(orderInfo.MemberList)) {
			for (var i = 0; i < orderInfo.MemberList.length; i++) {
				cacheImage("groupBullet_" + orderInfo.MemberList[i].id, orderInfo.MemberList[i].header);
			}
		}
	}else{
		toast("数据通讯发生错误，请重试");
	}

}

function goOrderDetails(orderId) {
	
	var data = {};
	data.orderId = orderId;
	data.status = 5;
	openWinNew('waitshare', '订单详情', [], data);  //拼团订单详情
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
					adInfo = ret.ad;
					$("#adImg").attr("src", ret.ad[0].imgUrl);
				}
			}
		}
	});
}

function adurl(){
	if (adInfo[0].type == 4) {
		gettext(adInfo[0].id,adInfo[0].adName);
	} else if (adInfo.type == 5) {
		goAddress(adInfo[0].params,adInfo[0].adName);
	} else if (adInfo[0].type == 2) {
		getGood(adInfo[0].params);
	}
}


//轮播跳文章资讯
function gettext(ad_id, ad_name) {

	var data = {};
	data.ad_id = ad_id;
	data.ad_name = ad_name;
	data.ad_params = adInfo.params;

	openWinNew("headtext", data.ad_name, {}, data);
}

//判断商品类型
function getGood(goodId) {

	var url = "product/checkIsGroup.do";
	var bodyParam = {
		body : {
			id : goodId
		}
	};
	ajaxRequest(url, bodyParam, function(ret, err) {

		if (err) {
			toast('服务器开了个小差，在刷新尝试一下!!!');
		} else {
			if (ret.code == 1) {
				if (isNotNull(ret.isGroup)) {

					if (ret.isGroup == 0) {
				getProductDetail(goodId);
						
					} else if (ret.isGroup == 1) {
					getGroupProductDetail(goodId);
					}
				}

			}
		}

	});

}

function goAddress(params, name) {

	api.openWin({
		name : name,
		url : params + '/index.html',
	})
}
