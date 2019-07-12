var groupProductList = new Array();
var ProductList = new Array();
var classList = new Array();
var limit = 6;
var config;
//分页用各参数
var page = 0;
var isLast = false;
var isLoading = false;
var adType;
var adInfo;
var td;
var bannerPath = [];
var myAd;
var headlinesInfo;
var number;
apiready = function() {
	
	dataAnalysis();
	onPageStart('index','event1','eventLabel1');
	
	config = getCacheData('config');
	//配置文件
	//跳转拼团商品
	api.addEventListener({
		name : 'openGroupProducts'
	}, function(ret, err) {
		//coding...
		getGroupProductDetail(ret.value.id);
	});
	//跳转普通商品
	api.addEventListener({
		name : 'openProducts'
	}, function(ret, err) {
		//coding...
		getProductDetail(ret.value.id);
	});
	//跳转店铺
	api.addEventListener({
		name : 'openShop'
	}, function(ret, err) {
		//coding...
		goShop(ret.value.id, ret.value.name);
	});
	//领取代金券
	api.addEventListener({
		name : 'getVoucher'
	}, function(ret, err) {
		Receive(ret.value.coupon_id,ret.value.is_type);
	});
	
	api.addEventListener({
		name : 'swipstart'
	}, function(ret, err) {
		api.setFrameAttr({
			name : api.frameName,
			bounces : false
		});
	});
	api.addEventListener({
		name : 'swipend'
	}, function(ret, err) {
		api.setFrameAttr({
			name : api.frameName,
			bounces : true
		});
	});
	api.refreshHeaderLoadDone();
			dropDownLoad(function(ret, err) {
				page = 0;
				isLast = false;
				isLoading = false;
				init();
			});
	init();
}
function goShop(id, name) {

	var data = {};
	data.shopId = id;
	data.shopName = name;
	var fun = new Array({
		"iconPath" : "../icon/search.png"
	});
	onPageEnd('index','event1','eventLabel1');
	openWinNew("shopdetail", name, fun, data);
}

function init() {
	showLoading();
	var url = "index/getInfo.do";

	ajaxRequest(url, {}, function(ret, err) {
		
		if (err) {
			api.removeLaunchView();
		} else {
			
			if (ret.code == 1) {
				hideLoading();
				$("#classImgHtml").hide();
				//顶部导航分类
				if (ret.label.length > 0) {
					$api.setStorage('searchLabel', ret.label);
				}
				if (isNotNull(ret.class)) {
					classList = ret.class;
					var classHtml = '';
					var classArr = ret.class;
					classArr.unshift({
						"name" : "超拼精选"
					});

					for (var i = 0; i < ret.class.length; i++) {

						if (i > 0) {
							classHtml += '<div class="NavText" id="class_' + ret.class[i].id + '" tapmode="" onclick="getClass(\'' + ret.class[i].id + '\');">' + substring1(ret.class[i].name, 4) + '</div>';
						} else {
							classHtml += '<div class="NavText NavTextClick">' + substring1(ret.class[i].name, 4) + '</div>';

						}
					}
					$("#classHtml").html(classHtml);
					hui('#TopNavigation').scrollX(5, '.NavText');
					api.parseTapmode();
				}

				//广告轮播图
				
				if (isNotNull(ret.ad)) {
					myAd = ret.ad;
					for (var j = 0; j < ret.ad.length; j++) {
						bannerPath.push(ret.ad[j].imgUrl)
					}
					var y = 45;
					var topDom = $api.byId('TopNavigation');
					y = $api.offset(topDom).t+$api.offset(topDom).h;
//					_d($api.offset(topDom));
					number=220+$api.offset($api.byId('TopNavigation')).h-45;
					//设置轮播图父级的高度
					$('#wheelplanting').height(number);
					var scrollP = api.require('UZUIScrollPicture');
					scrollP.open({
						rect : {
							x : 0,
							y : y,
							w : api.winWidth,
							h : 180
						},
						data : {
							paths : bannerPath,
						},
						isShowSearch : true,
						searchImg : 'widget://img/searchInput.png',
						styles : {
							caption : {
								height : 35,
								color : '#E0FFFF',
								size : 13,
								bgColor : '#696969',
								position : 'bottom'
							},
							indicator : {
								dot : {
									w : 10,
									h : 5,
									r : 1,
									margin : 10
								},
								align : 'right',
								color : '#FFFFFF',
								activeColor : '#fff100'
							}
						},
						placeholderImg : 'widget://img/banner.png',
						contentMode : 'scaleToFill',
						interval : 3,
						fixedOn : api.frameName,
						loop : true,
						fixed : false
					}, function(ret, err) {
						if (ret) {

							if (ret.eventType == 'clickSearch') {
								openSearch('search');
							}
							if (ret.eventType == 'click') {
								if(isNotNull(myAd[ret.index].type)){
									if (myAd[ret.index].type == 4) {
										gettext(myAd[ret.index].id,myAd[ret.index].adName)
									} else if (myAd[ret.index].type == 5) {
									
										openActivity(myAd[ret.index].params ,myAd[ret.index].adName ,0);
									} else if (myAd[ret.index].type == 2) {
										getGood(myAd[ret.index].params)
									}
								}
							}
						} else {
							//alert(JSON.stringify(err));
						}
					});
				}
				//十个活动
				if (isNotNull(ret.activity)) {
					
					var activityHtml = '';
					activityHtml = '<div class="IndexIcon">';

					for (var i = 0; i < ret.activity.length; i++) {
						if ((i % 5) == 0 && ret.activity.length > 5) {
							activityHtml += '</div>';
							activityHtml += '<div class="IndexIcon">';
						}
						if (ret.activity[i].type) {
							activityHtml += '<div class="IndexIcon-list" tapmode="" onclick="tenants();">';
							activityHtml += '<div class="IndexIcon-img"><img src="../img/productListDefault.png" id="activitybanner_' + ret.activity[i].id + '"/></div>';
							activityHtml += '<p>' + ret.activity[i].name + '</p>';
							activityHtml += '</div>';
						} else {
						
							activityHtml += '<div class="IndexIcon-list" tapmode="" onclick="openActivity(\'' + ret.activity[i].url + '\',\'' + ret.activity[i].name + '\',\'' + ret.activity[i].isHeader + '\');">';
							activityHtml += '<div class="IndexIcon-img"><img src="../img/productListDefault.png" id="activitybanner_' + ret.activity[i].id + '"/></div>';
							activityHtml += '<p>' + ret.activity[i].name + '</p>';
							activityHtml += '</div>';
						}
					}
					activityHtml += '</div>';
					$("#activityHtml").html(activityHtml);
					for (var i = 0; i < ret.activity.length; i++) {
						cacheImage('activitybanner_' + ret.activity[i].id, ret.activity[i].img);
					}
				}

				//超频头条
				$("#newsAd").attr("src", "../img/news.png");
				if (isNotNull(ret.notice)) {
					var noticeHtml = '';
						headlinesInfo = ret.notice;
					
					for (var i = 0; i < ret.notice.length; i++) {
						noticeHtml += '<div class="hui-scroll-news-items" tapmode="" onclick="getNotice(\''+ret.notice[i].id+'\');">' + ret.notice[i].title + '</div>';
					}
					$("#scrollnew1").html(noticeHtml);
					if(ret.notice.length>1){
						hui.scrollNews('#scrollnew1');
					}
					
					api.parseTapmode();
				}
				//中部广告

				if (isNotNull(ret.soloAd)) {
					adInfo = ret.soloAd;
					var html = "";
					if (ret.soloAd[0].type == 4) {

						html += '<img class="soloAd" src="../img/ad.png" tapmode="" onclick="gettext(\'' + ret.soloAd[0].id + '\',\'' + ret.soloAd[0].adName + '\');" />';
					} else if (ret.soloAd[0].type == 5) {
						html += '<img class="soloAd" src="../img/ad.png" tapmode="" onclick="goAddress(\'' + ret.soloAd[0].params + '\',\'' + ret.soloAd[0].adName + '\');"/>';
					} else if (ret.soloAd[0].type == 2) {
						html += '<img class="soloAd" src="../img/ad.png" tapmode="" onclick="getGood(\'' + ret.soloAd[0].params + '\')" />';
					}

					$("#soloaddiv").html(html);
					cacheImageByClass("soloAd", ret.soloAd[0].imgUrl)

				}
				//商品列表
				if (isNotNull(ret.groupProduct)) {
					var html1 = '';
					var html2 = '';

					for (var i = 0; i < ret.hotProduct.length; i++) {
						html1 += hotProductHtml(ret.hotProduct[i]);
					}

					for (var i = 0; i < ret.groupProduct.length; i++) {
						groupProductList.push(ret.groupProduct[i]);

						html2 += getGroupProductHtml(ret.groupProduct[i]);
					}
					if (ret.totalCount <= 5) {
						html2 += '<div id="hui-load-more">-- 我们是有底线的！ --</div>';
						isLast = true;
					}
					$("#groupProduct1").html(html1);
					$("#groupProduct2").html(html2);
					for (var i = 0; i < ret.hotProduct.length; i++) {
						cacheImage('hotImg_' + ret.hotProduct[i].id, ret.hotProduct[i].productImg2);
					}
					for (var i = 0; i < ret.groupProduct.length; i++) {
						cacheImage('productImg_' + ret.groupProduct[i].id, ret.groupProduct[i].productImg2);
					}
					api.parseTapmode();

					api.addEventListener({
						name : 'scrolltobottom',
						extra : {
							threshold : 0 //设置距离底部多少距离时触发，默认值为0，数字类型
						}
					}, function(ret, err) {

						getProductlist();
					});
				}

				//热销推荐
				if (isNotNull(ret.hotProduct)) {
					$(".recommendName2").show();
					if(isNotNull(config.recommendLogo2)){
						$("#activityImg").attr('src',config.recommendLogo2);
					}else{
						$("#activityImg").attr('src','../img/activityicon1.png');
					}
					if(isNotNull(config.recommendLogo)){
						$("#hotImg").attr('src',config.recommendLogo);
					}else{
						$("#hotImg").attr('src','../img/hot.png');
					}
					if(isNotNull(config.recommendName2)){
						$("#recommendName2").html(config.recommendName2);
					}else{
						$("#recommendName2").html('热销推荐');
					}
					if(isNotNull(config.recommendName2)){
						$("#recommendName").html(config.recommendName);
					}else{
						$("#recommendName").html('爆款推荐');
					}
					
				}
				else {
					$(".recommendName2").hide();
					//alert('热门商品为空');
				}
				if (isNotNull(ret.product)) {
					$("#hotdiv").show();
					var html = '';
					for (var i = 0; i < ret.product.length; i++) {
						ProductList.push(ret.product[i]);
						html += getProductHtml(ret.product[i]);
					}
					$("#hotHtml").html(html);
					var swiper = new Swiper('.swiper-container', {
						slidesPerView : 3.5,
					});
					for (var i = 0; i < ret.product.length; i++) {
						cacheImage('productHotImg_' + ret.product[i].id, ret.product[i].productImg2);
					}
					api.parseTapmode();
				} else {
					//alert('热门推荐为空');
					$("#hotdiv").hide();
				}
				//发起拼团通知（推送）
				//				if(isNotNull(ret.product)){
				//				}
				//				$("#initiateGroup").html();

				api.removeLaunchView();

			}
		}
	});
}

//分页用各参数
var page = 0;
var isLast = false;
var isLoading = false;
function getProductlist() {
	if (isLast)
		return;
	if (isLoading)
		return;
	page++;
	isLoading = true;
	var url = "index/group.do";
	var bodyParam = {
		body : {
			page : page,
			limit : limit
		}
	};

	ajaxRequest(url, bodyParam, function(ret, err) {

		//hideLoading();
		isLoading = false;
		//		if(err){
		//			netError('getReleaseDynamic');
		//		}else{
		if (isNotNull(ret)) {

			if (ret.code == 1) {

				if (isNotNull(ret.group)) {
					var html = '';
					for (var i = 0; i < ret.group.length; i++) {
						groupProductList.push(ret.group[i]);
						html += getGroupProductHtml(ret.group[i]);
					}
					$("#groupProduct2").append(html);
					for (var i = 0; i < ret.group.length; i++) {
						cacheImage('productImg_' + ret.group[i].id, ret.group[i].productImg2);
					}
					api.parseTapmode();
				} else {

					var html = '';
					html += '<div id="hui-load-more">-- 我们是有底线的！ --</div>';
					$("#groupProduct2").append(html);
					isLast = true;
				}
			} else {
				var html = '';
				html += '<div id="hui-load-more">-- 我们是有底线的！ --</div>';
				$("#groupProduct2").append(html);

				isLast = true;
			}
		} else {
			var html = '';
			html += '<div id="hui-load-more">-- 我们是有底线的！ --</div>';
			$("#groupProduct2").append(html);

			isLast = true;
		}

		//}
	});
}

//热销更多
function hotMore() {

	openWinNew("hotproduct", config.recommendName2, {}, [], false);
	//	openWin()
}
//爆款更多
function recommendMore() {
	openWinNew("recommendMore", config.recommendName, {}, [], false);
	//	openWin()
}


//拼团商品列表
function getGroupProductHtml(data) {
	var html = '';

	html += '<div class="row-list" tapmode="" onclick="getGroupProductDetail(\'' + data.id + '\');">';
	html += '<div class="row-img">';
	html += '<img src="../img/productListDefault.png" id="productImg_' + data.id + '"/>';
	html += '</div>';
	html += '<div class="row-right">';
	html += '<div class="row-top">';
	if (isNotNull(config)) {

		html += '<div class="row-title"><em>' + config.ad + '</em>' + data.productName + '</div>';
	} else {
		html += '<div class="row-title"><em>特价优惠</em>' + data.productName + '</div>';
	}
	html += '<div class="row-text">' + data.shopName + '</div>';
	html += '</div>';
	html += '<div class="row-bottom">';
	html += '<div class="RowBottom-text">';
	html += '<span>￥</span><span>' + formatterNumber(data.groupbuyPrice) + '</span>';
	html += '</div>';
	html += '<div class="RowBottom-right">已拼' + getNumber(data.saleNum) + '件</div>';
	html += '</div>';
	html += '</div>';
	html += '</div>';
	return html;
}

//热销商品
function hotProductHtml(data) {
	
	var html = '';
	if (data.isGroupbuy) {
		html += '<div class="row-list" tapmode="" onclick="getGroupProductDetail(\'' + data.id + '\');">';
	} else {
		html += '<div class="row-list" tapmode="" onclick="getProductDetail(\'' + data.id + '\');">';

	}
	html += '<div class="row-img">';
	html += '<img src="../img/productListDefault.png" id="hotImg_' + data.id + '"/>';
	html += '</div>';
	html += '<div class="row-right">';
	html += '<div class="row-top">';

	html += '<div class="row-title">' + data.productName + '</div>';

	html += '<div class="row-text">' + data.shopName + '</div>';
	html += '</div>';
	html += '<div class="row-bottom">';
	html += '<div class="RowBottom-text">';
	if (data.isGroupbuy) {
		html += '<span>￥</span><span>' + formatterNumber(data.groupbuyPrice) + '</span>';
		html += '</div>';
		html += '<div class="RowBottom-right">已拼' + getNumber(data.saleNum) + '件</div>';
	} else {
		html += '<span>￥</span><span>' + formatterNumber(data.preferentialPrice) + '</span>';
		html += '</div>';
		html += '<div class="RowBottom-right">已售' + getNumber(data.saleNum) + '件</div>';
	}

	html += '</div>';
	html += '</div>';
	html += '</div>';
	return html;
}

//热销推荐

function getProductHtml(data) {

	var html = '';
	html += '<div class="swiper-slide"   tapmode="" onclick="getProductDetail(\'' + data.id + '\');">';
	html += '<div class="hot-imges" >';
	html += '<img src="../img/productListDefault.png" id="productHotImg_' + data.id + '"/>';
	html += '</div>';
	html += '<div class="hot-title" >';
	html += '<span>￥' + formatterNumber(data.preferentialPrice) + '</span><span>￥' + formatterNumber(data.price) + '</span>';
	html += '</div>';
	html += '</div>';
	return html;
}

function getClass(class_id) {
	//$(".NavText").removeClass("NavTextClick");
	//$("#class_"+class_id).addClass("NavTextClick");
	var data = {};
	var title = '';
	for (var i = 0; i < classList.length; i++) {
		if (classList[i].id == class_id) {
			data.classInfo = classList[i].secondClass;
			title = classList[i].name;
		}
	}
	data.class_two_id = 0;
	data.class_id = class_id;
	onPageEnd('index','event1','eventLabel1');
	openWinNew("classificationlist", title, {}, data);
}

//超拼头条

function getNotice(id) {
	var data = {};
	for(var i=0;i<headlinesInfo.length;i++){
		if(headlinesInfo[i].id==id){
			data.notice_id = headlinesInfo[i].id;
			data.notice_title = headlinesInfo[i].title;
			data.notice_context = headlinesInfo[i].context;
		}
	}

	onPageEnd('index','event1','eventLabel1');
	openWinNew("headlines", data.notice_title, {}, data);
}

//轮播跳文章资讯
function gettext(ad_id, ad_name) {

	var data = {};
	data.ad_id = ad_id;
	data.ad_name = ad_name;
	data.ad_params = adInfo[0].params;
	onPageEnd('index','event1','eventLabel1');
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
	onPageEnd('index','event1','eventLabel1');
	api.openWin({
		name : name,
		url : params + '/index.html',
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
			_d(err);
		} else {

			if (ret.code == 1) {
				if (ret.status == 0) {
					toast(ret.msg);
				} else if (ret.status == 1) {
					toast(ret.msg);
				} else if (ret.status == 2) {
					toast("审核失败:" + ret.msg);
					onPageEnd('index','event1','eventLabel1');
					openWinNew('shopopen', '商家入驻', {}, {}, true);
				} else {
					onPageEnd('index','event1','eventLabel1');
					openWinNew('shopopen', '商家入驻', {}, {}, true);
				}
			}
		}
	});

}

//优惠券领取
function Receive(coupon_id,is_type) {
	if (!checkUser())
		return false;
	url = "coupon/getCoupon.do";
	bodyParam = {
		body : {
			couponId : coupon_id,
		}
	};
	ajaxRequest2(url, bodyParam, function(ret, err) {
		if (err) {
			_d(err);
		} else {
			if (ret.code == 0) {
				toast(ret.msg)
			} else {
				if(is_type==1){
					toast(ret.msg);
					api.sendEvent({
						name : 'goCenter',
						extra : {
							num : 0
						}
					});
					api.closeToWin({
						name : 'root'
					});
				}else{
					toast(ret.msg);
				}
			}
		}
	})
}