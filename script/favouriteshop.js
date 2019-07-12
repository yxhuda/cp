var page = 1;
var isLast = false;
var isLoading = false;
var shop;
var limit = 6;
apiready = function() {

	api.addEventListener({
		name : 'scrolltobottom',
		extra : {
			threshold : 0 //设置距离底部多少距离时触发，默认值为0，数字类型
		}
	}, function(ret, err) {
		getMoreCollectList();
	});
	api.addEventListener({
		name : 'favouriteshop'
	}, function(ret, err) {
		init();
	});
	init();
}
//初始化
function init() {

	showLoading();
	var url = "favorite/favorite.do";
	var bodyParam = {
		body : {
			type : 2,
			page : page,
			limit : limit
		}
	};

	//请求数据
	ajaxRequest(url, bodyParam, function(ret, err) {
		hideLoading();
		
		if (err) {
			netError("init");
		} else {
			if (ret.code == 1) {
			$("#shopHtml").html('');
				if (isNotNull(ret.shop)) {
					shop = ret.shop;
				
					var html = '';
					for (var i = 0; i < ret.shop.length; i++) {
						html += shopHtml(ret.shop[i]);
					}
					if (ret.totalCount <= limit && ret.totalCount > 6) {
						var html = '';
						html += '<div id="hui-load-more">-- 我们是有底线的！ --</div>';
						isLast = true;
					}
					$("#shopHtml").html(html);
					for (var i = 0; i < ret.shop.length; i++) {
						cacheImage("shopLogo_" + ret.shop[i].id, ret.shop[i].imgUrl);
						for (var j = 0; j < ret.shop[i].products.length; j++) {
							cacheImage("productImg2_" + ret.shop[i].id + "_" + ret.shop[i].products[j].id, ret.shop[i].products[j].productImg2);
						}
					}
					api.parseTapmode();
				} else {
					empty();
				}
			} else if (ret.code == 0) {
				toast('没有更多内容了');
				isLast = true;
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
	//再次请求数据
	var url = "favorite/favorite.do";
	ajaxRequest(url, {}, function(ret, err) {
		hideLoading();
		
		if (err) {
			netError("getMoreCollectList");
		} else {
			if (ret.code == 1) {
				if (isNotNull(ret.shop)) {
					var html = '';
					for (var i = 0; i < ret.shop.length; i++) {
						html = shopHtml(ret.shop[i]);
					}
					//用append方法添加到HTML中
					$("#shopHtml").append(html);
					for (var i = 0; i < ret.shop.length; i++) {
						cacheImage("shopLogo_" + ret.shop[i].id, ret.shop[i].imgUrl);
						for (var j = 0; j < ret.shop[i].products.length; j++) {
							cacheImage("productImg2_" + ret.shop[i].id + "_" + ret.shop[i].products[j].id, ret.shop[i].products[j].productImg2);
						}
					}
					api.parseTapmode();
				}
			} else if (ret.code == 0) {
				var html = '';
				html += '<div id="hui-load-more">-- 我们是有底线的！ --</div>';
				$("#shopHtml").append(html);
				isLast = true;
			}
		}
	});
}

//进入店铺
function goShop(shopName, id) {
	var data = {};
	data.shopId = id;
	data.shopName = shopName;
	var fun = new Array({
		"iconPath" : "../icon/search.png"
	});
	openWinNew("shopdetail", shopName, fun, data);
}

// 店铺收藏列表
function shopHtml(data) {
	//给html添加内容
	var html = '';
	html += '<div class="Shop">';
	html += '<div class="Shop-title">';
	html += '<div class="Shop-left">';
	html += '<div class="Shop-img"><img src="../img/logo.png" id="shopLogo_' + data.id + '" onclick="goShop(\'' + data.shopName + '\',\'' + data.shopId + '\');"></div>';
	html += '<div class="Shop-text"><p>' + data.shopName + '</p><p>商品数量：' + getNumber(data.productCount) + '件</p></div>';
	html += '</div>';
	html += '<div class="Shop-right">';
	html += '<button class="favouriteshop-button" tapmode="" onclick="cancelfavourite(\'' + data.shopId + '\');">取消收藏</button><button tapmode="" onclick="goShop(\'' + data.shopName + '\',\'' + data.shopId + '\');">进店</button>';
	html += '</div>';
	html += '</div>';
	html += '<div class="Shop-list">';
	for (var i = 0; i < data.products.length; i++) {
		html += '<div class="shopList" onclick="getProductDetail(\'' + data.products[i].id + '\')">';
		html += '<div class="shopList-img" style="z-index:1;"><img src="../img/mrt.png" id="productImg2_' + data.id + '_' + data.products[i].id + '"/></div>';
		html += '<div class="shopListImg" style="z-index:2;">￥' + formatterNumber(data.products[i].preferentialPrice) + '</div>';
		html += '</div>';
	}
	html += '</div>';
	html += '</div>';
	return html;
}

//取消收藏
function cancelfavourite(id) {

	
	hui.confirm('亲，确定要取消收藏吗？', ['取消', '确认'], function() {
		var url = "favorite/dofavorite.do";
		var bodyParam = {
			body : {
				id : id,
				type : 2
			}
		};

		ajaxRequest2(url, bodyParam, function(ret, err) {

			if (err) {
				toast('服务器开了个小差，在刷新尝试一下!!!');
			} else {
				if (ret.code == 1) {
					for (var i = 0; i < shop.length; i++) {
						shop.splice(i, 1);
					}
					
					var html = '';
					for (var i = 0; i < shop.length; i++) {
						html = shopHtml(shop[i], true);
					}
					$("#shopHtml").html(html);

					toast("取消收藏成功");
					if (shop.length < 1) {
						empty();
					}
					init();
				} else {
					toast("取消收藏失败");
				}
			}
		});

	})
}
