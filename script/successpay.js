
var adInfo;
apiready = function() {

	api.addEventListener({
	    name:'viewappear'
    },function(ret,err){
    	//coding...
    	api.closeWin({'name':'confirmorder'});
    });
	api.sendEvent({
		name : 'refreshSpellorder'
	});
	api.addEventListener({
		name : 'navbackbtn'
	}, function(ret, err) {
		api.sendEvent({
			name : 'paySuccess'
		});
		api.sendEvent({
			name : 'perform'
		});
		
	api.closeWin({'name':'confirmorder'});
	api.closeWin()
	
	});
	
	$('.hui-water-items').remove();
	$("#activity").empty();
	getRecommendProduct(4, 'activity',function(ret1,err1){
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
	getad();
}
//返回首页
function goHome() {	
	
	api.sendEvent({
		name : 'goCenter',
		extra : {
			num : 0
		}
	});
	api.closeToWin({
		name : 'root'
	});
}

//跳转订单详情
function goOrderDetails() {
	var jsonData = api.pageParam;
	var url = "order/selectOrder.do";
	var bodyParam = {
		body : {
			orderId : jsonData.orderId
		}
	}
	ajaxRequest(url, bodyParam, function(ret, err) {
		if (err) {
			toast('数据通讯发生错误，请重试');
			return false;
		} else {
			if (ret.code == 1) {
			
				var data = {};
				data.orderId = jsonData.orderId;
					api.sendEvent({
					name : 'perform'
				});
				openWinNew('waitreceive', '订单详情', [], data);
			} else {
				toast('数据通讯发生错误，请重试');
				return false;
			}
		}
	});

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