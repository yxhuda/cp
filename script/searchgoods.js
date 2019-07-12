var key;
var isLabel;
var porderType = 0;
var sorderType = 0;
var ppage = 1;
var pisLast = false;
var spage = 1;
var sisLast = false;
var pisLoading = false;
var sisLoading = false;
var Waterfall;
var showPanel = 'product';
var limit = 6;

apiready = function() {
	key = api.pageParam.key;
	isLabel = api.pageParam.isLabel;
	api.addEventListener({
	    name:'viewappear'
    },function(ret,err){
    	//coding...
    	api.closeWin({'name':'search'});
    });
	init();
}
//初始化
function init() {

	searchGoods(1);
}

//搜索商品
var myflag=0;
function searchGoods(flag) {

	//	if(pisLast){
	//		return;
	//	}
	//	if (pisLoading){
	//		return;
	//	}
	//	if (porderType == flag) {
	//		return;
	//	}


if(flag==3){
		if(myflag==0){
			$(".dup").addClass("dup1");
			$(".ddown").removeClass("ddown1");
				myflag=1;
				flag=3;
			}else{
				$(".dup").removeClass("dup1");
				$(".ddown").addClass("ddown1");
			myflag=0;
			flag=4;
			}
		}else{
		$(".dup").removeClass("dup1");
		$(".ddown").removeClass("ddown1");
		}
	sorderType = 0;
	ppage = 1;
	porderType = flag;
	pisLast = false;
	$('.activityNav-title').removeClass('activity-navshow');
	$('#pfilter'+flag).addClass('activity-navshow');
	var url = 'product/search.do';
	var bodyParam = {
		body:{
			isLable:isLabel,
			key:key,
			type:1,
			orderType:porderType,
			page:ppage,
			limit:limit
		}
	};
	pisLoading = true;
	showLoading();
	$('#activitys').html('');
	Waterfall = new huiWaterfall('#activitys');
	ajaxRequest(url,bodyParam,function(ret,err){
		hideLoading();
		pisLoading = false;
		if (err){
			tabEmpty('activitys');
		}
		else{
			if (ret.code == 1 && ret.list.length > 0)
			{
				showSearchProduct(ret.list);
				if(ret.totalCount<limit){
					pisLast = true;
				}
				api.addEventListener({
			        name: 'scrolltobottom',
			        extra: {
			            threshold: 0 //设置距离底部多少距离时触发，默认值为0，数字类型
			        }
			    }, function(ret, err) {
			        getMoreProduct();
			    });
			}
			else
			{
				tabEmpty('activitys');
			}
		}
	});
}

//切换标签
function clickPanelTab(id){
	if (showPanel == id){
		return;
	}
	showPanel = id;
	$('.searchgoods-list').removeClass('searchgoods-list-on');
	$('#'+showPanel).addClass('searchgoods-list-on');
	
	$('.body-table').removeClass('body-table-on');
	$('#'+showPanel+'Panel').addClass('body-table-on');
	if (id == 'product') {
		searchGoods(1);
	}
	else {
		searchShop(1);
	}
}
//商品翻页
function getMoreProduct() {
	if(pisLast){
		return;
	}
	if (pisLoading){
		return;
	}
	ppage++;
	var url = 'product/search.do';
	var bodyParam = {
		body:{
			isLable:isLabel,
			key:key,
			type:1,
			orderType:porderType,
			page:ppage,
			limit:limit
		}
	};
	pisLoading = true;
	ajaxRequest(url,bodyParam,function(ret,err){
		pisLoading = false;
		if (err){
			var html = '';
			html += '<div id="hui-load-more">-- 我们是有底线的！ --</div>';
			$("#activitys").append(html);
		}
		else{
			if (ret.code == 1 && ret.list.length > 0)
			{
			
				showSearchProduct(ret.list);
			}
			else
			{
				var html = '';
				html += '<div id="hui-load-more">-- 我们是有底线的！ --</div>';
				$("#activitys").append(html);
				pisLast = true;
			}
		}
	});
}


//搜索店铺
function searchShop(flag) {
//	if(sisLast){
//		return;
//	}
//	if (sisLoading){
//		return;
//	}
//	if (sorderType == flag) {
//		return;
//	}
	sLast = false;
	porderType = 0;
	spage = 1;
	sorderType = flag;
	$('.shopfilter').removeClass('activity-navshow');
	$('#sfilter'+flag).addClass('activity-navshow');
	var url = 'product/search.do';
	var bodyParam = {
		body:{
			isLable:isLabel,
			key:key,
			type:2,
			orderType:sorderType,
			page:spage,
			limit:6
		}
	};
	sisLoading = true;
	showLoading();
	$('#shops').html('');
	ajaxRequest(url,bodyParam,function(ret,err){
		hideLoading();
		
		sisLoading = false;
		if (err){
			tabEmpty('shops');
		}
		else{
			if (ret.code == 1 && ret.list.length > 0)
			{
				var html = '';
                for (var i = 0; i < ret.list.length; i++) {
                    html += shopHtml(ret.list[i]);
                }
                if(ret.totalCount<limit){
					sisLast = true;
				}
                $("#shops").html(html);
                for (var i = 0; i < ret.list.length; i++) {
                    cacheImage("shopLogo_" + ret.list[i].id, ret.list[i].logo);
                    for (var j = 0; j < ret.list[i].products.length; j++) {
                        cacheImage("productImg2_" + ret.list[i].id + "_" + ret.list[i].products[j].id, ret.list[i].products[j].productImg2);
                    }
                }
                api.parseTapmode();
				api.addEventListener({
			        name: 'scrolltobottom',
			        extra: {
			            threshold: 0 //设置距离底部多少距离时触发，默认值为0，数字类型
			        }
			    }, function(ret, err) {
			        getMoreShop();
			    });
			}
			else
			{
				tabEmpty('shops');
			}
		}
	});
}

//店铺翻页
function getMoreShop() {
	if(sisLast){
		return;
	}
	if (sisLoading){
		return;
	}
	spage++;
	var url = 'product/search.do';
	var bodyParam = {
		body:{
			isLable:isLabel,
			key:key,
			type:2,
			orderType:sorderType,
			page:spage,
			limit:6
		}
	};
	sisLoading = true;
	ajaxRequest(url,bodyParam,function(ret,err){
		sisLoading = false;
		if (err){
			var html = '';
			html += '<div id="hui-load-more">-- 我们是有底线的！ --</div>';
			$("#shops").append(html);
		}
		else{
			if (ret.code == 1 && ret.list.length > 0)
			{
				var html = '';
                for (var i = 0; i < ret.list.length; i++) {
                    html += shopHtml(ret.list[i]);
                }
				$("#shops").append(html);
                for (var i = 0; i < ret.list.length; i++) {
                    cacheImage("shopLogo_" + ret.list[i].id, ret.list[i].logo);
                    for (var j = 0; j < ret.list[i].products.length; j++) {
                        cacheImage("productImg2_" + ret.list[i].id + "_" + ret.list[i].products[j].id, ret.list[i].products[j].productImg2);
                    }
                }
                api.parseTapmode();
			}
			else
			{
				var html = '';
				html += '<div id="hui-load-more">-- 我们是有底线的！ --</div>';
				$("#shops").append(html);
				sisLast = true;
			}
		}
	});
}

function shopHtml(data) {
	//给html添加内容
	var html = '';
	html += '<div class="Shop">';
	html += '<div class="Shop-title">';
	html += '<div class="Shop-left">';
	html += '<div class="Shop-img"><img src="../img/logo.png" id="shopLogo_' + data.id + '" onclick="goShop(\'' + data.shopName + '\',\'' + data.id + '\');"></div>';
	html += '<div class="Shop-text"><p>' + data.shopName + '</p><p>商品数量：' + getNumber(data.productCount) + '件</p></div>';

	html += '</div>';
	html += '<div class="Shop-right">';
	html += '<button tapmode="" onclick="goShop(\'' + data.shopName + '\',\'' + data.id + '\');">进店</button>';
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
