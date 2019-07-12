var user;
var adInfo;
apiready = function() {

	api.addEventListener({
		name : 'loginsuccess'
	}, function(ret, err) {
		inits();
	});
	api.addEventListener({
		name : 'viewappear'
	}, function(ret, err) {
		inits();
	});
	api.addEventListener({
		name : 'updateUser'
	}, function(ret, err) {
		if (isNotNull(ret.value.header)) {
			$("#header_pic").attr("src", ret.value.header);
		}
		if (isNotNull(ret.value.realName)) {
			$("#realName").html(ret.value.realName);
		}
		if (isNotNull(ret.value.autograph)) {
			$("#autograph").html(ret.value.autograph);
		}
	});
	dropDownLoad(function(ret, err) {
		getUserUpdate();
		inits();
		getByRecommendProduct();
	});
	inits();
	getByRecommendProduct();
}
function inits() {
	user = getUser();
	if (isNotNull(user)) {
		noRead();
		if (isNotNull(user.header)) {
			$("#header_pic").attr("src", user.header);
		}
		if (isNotNull(user.realName)) {
			$("#realName").html(user.realName);
		} else {
			$("#realName").html('未设置昵称');
		}
		if (isNotNull(user.autograph)) {
			$("#autograph").html(user.autograph);
		} else {
			$("#autograph").html('未设置签名');
		}
		if (isNotNull(user.wxId)) {
			$("#wxLogin").show();
		} else {
			$("#wxLogin").hide();
		}

		if (user.isSpread == 1) {
			$('#spread').show();
			//			$('.center-icon').prop("class","center-icons");
		} else {
			$('#spread').hide();
		}
		noRead();
	} else {
		$("#header_pic").attr("src", '../img/verify03.png');
		$("#realName").html('未登录');
		$("#autograph").html('暂无信息');
		$("#wxLogin").hide();
		$("#spread").hide();
		for(var i=0;i<5;i++){
				$('.orderCount'+i).hide();
				$('.clusterOrderCount'+i).hide();
			}
	}
	getad();
}


function getByRecommendProduct(){
	$('.hui-water-items').remove();
	$("#activity").empty();
	getRecommendProduct(4, 'activity', function(ret1, err1) {
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

//未读数量
function noRead(){
	var url = "order/selectOrderCount";
	var bodyParam = {
		body : {}
	};
	ajaxRequest(url, bodyParam, function(ret, err) {
		if(isNotNull(ret)){
			for(var i=0;i<5;i++){
				$('.orderCount'+i).hide();
				$('.clusterOrderCount'+i).hide();
			}
			for(var i=0;i<5;i++){
				if(ret.data['orderCount'+i]>0){
					$('.orderCount'+i).show();
					$('.orderCount'+i).text(ret.data['orderCount'+i])
				}
				if(ret.data['clusterOrderCount'+i]>0){
					$('.clusterOrderCount'+i).show();
					$('.clusterOrderCount'+i).text(ret.data['clusterOrderCount'+i])
				}
			}
		}else{
			_d(err)
		}
	
	})


}
//我的订单
function myorder(status) {
	var data = {};
	data.status = status;
	openWinNew("myorder", "我的订单", {}, data, true);
}

//超拼订单
function SpellOrder(type) {

	var data = {};
	data.status = type;
	openWinNew("spellorder", "拼团订单", {}, data, true);
}

//历史记录
function history() {

	var fun = new Array({
		"text" : "清除"
	});
	var historyList = getCacheData("historyRecord");
	if (isNotNull(historyList) && historyList.length > 0) {
		openWinNew("history", "历史记录", fun, {}, true);
	} else {
		openWinNew("history", "历史记录", new Array(), {}, true);
	}
}

function getad() {
	var url = "ad/list.do";
	var bodyParam = {
		body : {
			type : 2
		}
	};
	ajaxRequest(url, bodyParam, function(ret, err) {
		if (err) {
			toast('服务器开了个小差，在刷新尝试一下!!!');
		} else {
			if (ret.code == 1) {
				
				if (isNotNull(ret.ad)) {
					var html = "";
					adInfo = ret.ad;
					if (ret.ad[0].type == 4) {
						html += '<img src="../img/ad.png"  id="adImg"  tapmode="" onclick="gettext(\'' + ret.ad[0].id + '\',\'' + ret.ad[0].adName + '\');"/>';
					} else if (ret.ad[0].type == 5) {
						html += '<img src="../img/ad.png"  id="adImg" tapmode="" onclick="goAddress(\'' + ret.ad[0].params + '\',\'' + ret.ad[0].adName + '\');"/>';
					} else if (ret.ad[0].type == 2) {

						html += '<img src="../img/ad.png"  id="adImg" tapmode="" onclick="getGood(\'' + ret.ad[0].params + '\');"/>';
					}

					$(".activity-ad").html(html);
					api.parseTapmode();
					cacheImage("adImg", ret.ad[0].imgUrl);
				}
			}
		}
	});
}

function goAddress(params, name) {

	api.openWin({
		name : name,
		url : 'http://' + params,
	})
}

//商家入驻
function tenants() {
	var url = 'shop/checkShop.do';
	var bodyParam = {
		body : {}
	};
	ajaxRequest(url, bodyParam, function(ret, err) {
		if (err) {
			toast('服务器开了个小差，在刷新尝试一下!!!');
		} else {
			if (ret.code == 1) {
				if (ret.status == 0) {
					toast(ret.msg)
				} else if (ret.status == 1) {
					toast(ret.msg)
				} else if (ret.status == 2) {
					toast("审核失败:" + ret.msg);

					openWinNew('shopopen', '商家入驻', {}, {}, true)
				} else {

					openWinNew('shopopen', '商家入驻', {}, {}, true)
				}
			}
		}
	});

}

//客服聊天
function openChat() {
	if (!checkUser())
		return false;
	var data = {};
	data.sendId = '1000000000000000001';
	data.img = '../img/kefu.png';
	data.pushUserId = '0';
	openWinNew("service_chat", '客服', {}, data, true);
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
