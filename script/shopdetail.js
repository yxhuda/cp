var page = 1;
var isLast = false;
var isLoading = false;
var jsonData;
var limit = 10;
var type = 0;
//关注
var favourite;
var favorStatus;
var datashop;
var td;
var user;
var sendId;
apiready = function() {
	//店铺搜索
	jsonData = api.pageParam;

	//店铺搜索
	api.addEventListener({
		name : 'navitembtn'
	}, function(ret, err) {
		var data = {};
		data.id = jsonData.shopId;
		openSearch('shopsearch', data);
	});
		api.refreshHeaderLoadDone();
			dropDownLoad(function(ret, err) {
				page = 0;
				isLast = false;
				isLoading = false;
				init();
			});
	init();
	newShopGood(0);
}
function init() {
	user = getUser();
	showLoading();
	
	var url = "shop/shopDetails.do";
	var bodyParam = {
		body : {
			id : jsonData.shopId
		}
	};

	//请求数据
	ajaxRequest2(url, bodyParam, function(ret, err) {
		datashop = ret.shop;
		var datagroup = ret.shopGroup;
		hideLoading();
		if (err) {
			toast('服务器开了个小差，在刷新尝试一下!!!');
		} else {
			if (ret.code == 1) {
				sendId = ret.shop.sendId;
				if (user) {
					if (user.id != sendId) {
						$("#shopchat").show();
					} else {
						$("#shopchat").hide();
					}
				} else {
					$("#shopchat").show();
				}
				if (isNotNull(ret.shop)) {

					favourite = ret.shop.isFavorite;

					//					var html = '';
					//					//把内容添加到.shopdetailbox中
					//					html += '<div class="shopdetailbox-img"><img src="../img/verify03.png"  /></div>';
					//					//判断关注状态
					//					switch(favourite) {
					//						case 0:
					//							favorStatus = '关注';
					//							html += '<div class="shopfavour"><span onclick="myFavorite()" class="colorred" id="favor">' + favorStatus + '</span></div>';
					//							break;
					//						case 1:
					//							favorStatus = '已关注';
					//							html += '<div class="shopfavour"><span onclick="myFavorite()" class="colorred" id="favor">' + favorStatus + '</span></div>';
					//					}
					//					html += '<div class="shopdetailbox-text">商品数量：<span>' + getNumber(datashop.productCount) + '</span></div>';
					//
					//					$(".shopdetailbox").html(html);
					if (favourite == 1) {
						favorStatus = '已关注';
						$("#favor").html('已关注');
					} else {
						favorStatus = '关注';
						$("#favor").html('关注');
					}
					if (isNotNull(datashop.shopImg)) {
						$("#shopLogo").attr("src", datashop.shopImg);
					}
					$("#shopNum").html(getNumber(datashop.productCount));
					var shoplist = '';
					if (datagroup.length > 0) {
						$("#showShopHtml").show();
						_d(datagroup)
						for (var i = 0; i < datagroup.length; i++) {
							shoplist += '<div class="swiper-slide" style="padding:auto 5px!important"  tapmode="" onclick="getGroupProductDetail(\'' + ret.shopGroup[i].productId + '\')">';
							shoplist += '<div class="shopdetail-imges"  ><img style="margin:auto 5px!important" src="../img/productListDefault.png" id="shopgood_' + datagroup[i].productId + '"/></div>';
							shoplist += '<div class="hot-imges-title" style="margin:auto 5px!important">';
							shoplist += '<div class="shopdetailtitle-imges-text" style="margin:auto 5px!important">' + datagroup[i].productName + '</div>';
							shoplist += '<div class="shopdetail-title"><div class="shopdetailtitle" >￥' + formatterNumber(datagroup[i].preferentialPrice) + '</div>';
//							shoplist += '<div class="shopdetailtitle-img"><img src="../img/mrt.png" id="shopLogo_' + ret.shopGroup[i].productId + '"/></div>';
							shoplist += '</div>';
							shoplist += '</div>';
							shoplist += '</div>';
							shoplist += '</div>';
						}
						$("#shoplistHtml").html(shoplist);
						api.parseTapmode();

//						for (var i = 0; i < ret.shopGroup.length; i++) {
//							cacheImage("shopLogo_" + ret.shopGroup[i].productId, ret.shopGroup[i].header);
//
//						}
						for (var i = 0; i < datagroup.length; i++) {
							cacheImage("shopgood_" + datagroup[i].productId, datagroup[i].productImg2);
						}
						//大家都在拼商品轮播
						var swiper = new Swiper('.swiper-container', {
							slidesPerView : 3.5,
						});
					} else {
						$("#showShopHtml").hide();
					}

					
				}
			}
		}
	});

}

//获取更多
function getMoreCollectList() {

	if (isLast)
		return;
	if (isLoading)
		return;
	page++;
	isLoading = true;

	var url = "shop/shopProducts.do";
	var bodyParam = {
		body : {
			id : jsonData.shopId,
			page : page,
			limit : limit,
			type : type,
		}
	};
	//再次请求数据
	ajaxRequest2(url, bodyParam, function(ret, err) {
		isLoading = false;
		// _d(err);
		if (err) {

			toast('服务器开了个小差，在刷新尝试一下!!!');
		} else {
			if (ret.code == 1) {
				if (isNotNull(ret.products)) {
					var tailhtml = "";
					for (var i = 0; i < ret.products.length; i++) {
						tailhtml += '<div class="activity-lists hui-water-items" style="width:48%;display:inline-block;margin:1%" tapmode="" onclick="getProductDetail(\'' + ret.products[i].productId + '\')">';
						tailhtml += '<div class="activity-imgs"><img src="../img/productListDefault.png" id="products' + ret.products[i].productId + '" /></div>';
						tailhtml += '<div class="activity-box"><div class="activity-title">' + ret.products[i].productName + '</div>';
						tailhtml += '<div class="activity-text"><div class="activity-left">￥' + ret.products[i].preferentialPrice + '</div>';
						tailhtml += '<div class="activity-right">' + '已售' + ret.products[i].saleNum + '件</div>';

						tailhtml += '</div>';
						tailhtml += '</div>';
						tailhtml += '</div>';
					}
					$("#activitys").append(tailhtml);
					for (var i = 0; i < ret.products.length; i++) {
						cacheImage('products' + ret.products[i].productId, ret.products[i].productImg2)
					}
					api.parseTapmode();

				} else {
					var html = '';
					html += '<div id="hui-load-more">-- 我们是有底线的！ --</div>';
					$("#activitys").append(html);

					isLast = true;
				}
			} else if (ret.code == 0) {

				var html = '';
				html += '<div id="hui-load-more">-- 我们是有底线的！ --</div>';
				$("#activitys").append(html);

				isLast = true;
			}
		}

	});
}

//进入查看全部拼单
$(".shop-text").click(function() {
	
	var data = {};
	data.shopId = jsonData.shopId;
	openWinNew("storedetails", '大家正在拼', {}, data);
});

//分页
var myType = 0;
var nowType = 1;

function newShopGood(val) {

	isLoading = 0;
	isLast = 0;
	page = 1;
	if (val == 3) {
		if (myType == 0) {
			$(".dup").addClass("dup1");
			$(".ddown").removeClass("ddown1");
			myType = 1;
			type = 4;
		} else {
			$(".dup").removeClass("dup1");
			$(".ddown").addClass("ddown1");
			myType = 0;
			type = 3;
		}
	} else {
		type = val
		$(".dup").removeClass("dup1");
		$(".ddown").removeClass("ddown1");
	}


	var url = "shop/shopProducts.do";
	var bodyParam = {
		body : {
			id : jsonData.shopId,
			page : 1,
			limit : limit,
			type : type,
		}
	};

	//店铺详情商品列表
	ajaxRequest2(url, bodyParam, function(ret, err) {

		if (err) {
			toast('服务器开了个小差，在刷新尝试一下!!!');
		} else {
			if (ret.code == 1) {
				
				if (isNotNull(ret.products)) {
					var tailhtml = '';
					for (var i = 0; i < ret.products.length; i++) {
						tailhtml += '<div class="activity-lists hui-water-items" style="width:48%;display:inline-block;margin:1%" tapmode="" onclick="getProductDetail(\'' + ret.products[i].productId + '\')">';
						tailhtml += '<div class="activity-imgs"><img src="../img/productListDefault.png" id="products' + ret.products[i].productId + '" /></div>';
						tailhtml += '<div class="activity-box"><div class="activity-title">' + ret.products[i].productName + '</div>';
						tailhtml += '<div class="activity-text"><div class="activity-left">￥' + ret.products[i].preferentialPrice + '</div>';
						tailhtml += '<div class="activity-right">' + '已售' + ret.products[i].saleNum + '件</div>';

						tailhtml += '</div>';
						tailhtml += '</div>';
						tailhtml += '</div>';
					}

					$("#activitys").html(tailhtml);
					for (var i = 0; i < ret.products.length; i++) {
						cacheImage('products' + ret.products[i].productId, ret.products[i].productImg2)
					}
					api.parseTapmode();
					api.addEventListener({
						name : 'scrolltobottom',
						extra : {
							threshold : 0 //设置距离底部多少距离时触发，默认值为0，数字类型
						}
					}, function(ret, err) {
						getMoreCollectList();
					});
				} else {
					
						var html = '<div class="svger"><i><img src="../img/empty.png"  width=500 height=500 /></i><p>当前没有信息呦~！</p></div>';
						$('#activitys').html(html);
				}
			} else {
				var html = '<div class="svger"><i><img src="../img/empty.png"  width=500 height=500 /></i><p>当前没有信息呦~！</p></div>';
						$('#activitys').html(html);
			}
		}

	});
}

//关注请求
function myFavorite() {

	if (!isNotNull(jsonData)) {
		return false;
	}
	var url = "favorite/dofavorite.do";
	var bodyParam = {
		body : {
			id : jsonData.shopId,
			type : 2,
		}
	};

	ajaxRequest2(url, bodyParam, function(ret, err) {

		if (err) {
			toast('服务器开了个小差，在刷新尝试一下!!!');
		} else {

			if (ret.code == 1) {
				switch(favourite) {
					case 0:
						favorStatus = '已关注';
						favourite = 1;

						toast('店铺关注成功');
						//$("#favor").removeClass("colorred");
						break;
					case 1:
						favorStatus = '关注';
						favourite = 0;
						toast('店铺取消关注成功');
					//$("#favor").addClass(" colorred");

				}
				api.sendEvent({
					name : 'favouriteshop'
				});

				$('#favor').text(favorStatus)
			}
		}
	})
}

/**
 * 跳转聊天
 * @param {Object} id       订单ID/用户ID
 * @param {Object} type		1时，id为订单ID；0时，id为用户ID；
 * @param {Object} shopId   店铺ID
 * @param {Object} shopName	 店铺名称
 * @param {Object} img		聊天对象头像
 */
function openChat() {
	
	if (!checkUser())
		return false;
	if (user.id != sendId) {
		$("#shopchat").show();
	} else {
		$("#shopchat").hide();
	}
	var data = {};
	data.sendId = datashop.shopId;
	//data.shopId = datashop.shopId;
	if (isNotNull(datashop.shopImg)){
		data.img = datashop.shopImg;
	} else {
		data.img = '../img/shop.png';
	}
	data.pushUserId = datashop.sendId;
	data.shopName = datashop.shopName;
	var fun = new Array({
		"text" : "进店"
	});
	openWinNew("chat", datashop.shopName, fun, data, true);
}