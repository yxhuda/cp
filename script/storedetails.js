var page = 1;
var isLast = false;
//最后一次
var isLoading = false;
//等速加载
var shopid;
//接受上个页面返回的参数
var type = 3;
var groupList;
var limit = 6;
var config;
//接口数据中的ret.groups
apiready = function() {

	config = getCacheData('config');  //配置文件
	shopid = api.pageParam.shopId;
	init();
		showLoading1()
}
//初始化
function init() {

	var url = "shop/shopGroups.do";
	var bodyParam = {
		body : {
			id : shopid,
			page : page,
			limit : limit,
			type : type,
		}
	};
	//请求数据
	ajaxRequest2(url, bodyParam, function(ret, err) {
		groupList = ret.groups;
//		hideLoading();
		if (err) {
			toast('服务器开了个小差，在刷新尝试一下!!!');
		} else {
			if (ret.code == 1) {
			hideLoading1()
				if (isNotNull(ret.groups)) {
					//给#storeDetails_Box内添加商品列表
					var Html = '';
					
					for (var i = 0; i < ret.groups.length; i++) {
							Html += '<div class="activity-lists hui-water-items" style="width:48%;display:inline-block;margin:1%" tapmode="" onclick="getGroupProductDetail(\'' + ret.groups[i].productId + '\')">';
							Html += '<div class="activity-imgs"><img src="../img/productListDefault.png" id="products' + ret.groups[i].productId + '" /></div>';
							Html += '<div class="activity-box"><div class="activity-title">' + ret.groups[i].productName + '</div>';
							Html += '<div class="activity-text"><div class="activity-left">￥' + ret.groups[i].preferentialPrice + '</div>';
							Html += '<div class="activity-right">' + '已拼' + ret.groups[i].saleNum + '件</div>';
							Html += '</div>';
							Html += '</div>';
							Html += '</div>';

						}
					if (ret.groupCount > 5 && ret.groupCount <= limit) {
						Html += '<div id="hui-load-more">-- 我们是有底线的！ --</div>';
						isLast = true;
					}
					$("#storeDetails_Box").html(Html);				
					for (var i = 0; i < groupList.length; i++) {
						cacheImage("products" + groupList[i].productId, groupList[i].productImg2);
						
					}
				}

				api.addEventListener({
					name : 'scrolltobottom',
					extra : {
						threshold : 0 //设置距离底部多少距离时触发，默认值为0，数字类型
					}
				}, function(ret, err) {
					getMoreCollectList();
					//调用
				});
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
	var url = "shop/shopGroups.do";
	var bodyParam = {
		body : {
			id : shopid,
			page : page,
			limit : limit,
			type : type,
		}
	};
	ajaxRequest2(url, bodyParam, function(ret, err) {
	isLoading=false;
		hideLoading();
		if (err) {
			toast('服务器开了个小差，在刷新尝试一下!!!');
		} else {
			if (ret.code == 1) {
				if (isNotNull(ret.groups)) {
	
					//给#storeDetails_Box店铺内商品列表
					var Html = '';
				for (var i = 0; i < ret.groups.length; i++) {
							Html += '<div class="activity-lists hui-water-items" style="width:48%;display:inline-block;margin:1%" tapmode="" onclick="getGroupProductDetail(\'' + ret.groups[i].productId + '\')">';
							Html += '<div class="activity-imgs"><img src="../img/productListDefault.png" id="products' + ret.groups[i].productId + '" /></div>';
							Html += '<div class="activity-box"><div class="activity-title">' + ret.groups[i].productName + '</div>';
							Html += '<div class="activity-text"><div class="activity-left">￥' + ret.groups[i].preferentialPrice + '</div>';
							Html += '<div class="activity-right">' + '已拼' + ret.groups[i].saleNum + '件</div>';
							Html += '</div>';
							Html += '</div>';
							Html += '</div>';
						}
					$("#storeDetails_Box").append(Html);
						for (var i = 0; i < ret.groups.length; i++) {
						cacheImage("products" + ret.groups[i].productId, ret.groups[i].productImg2);
						
					}		
		
				
		api.parseTapmode();
				}else {

					var html = '';
					html += '<div id="hui-load-more">-- 我们是有底线的！ --</div>';
					$("#storeDetails_Box").append(html);
					isLast = true;
				}
			} else {
				var html = '';
				html += '<div id="hui-load-more">-- 我们是有底线的！ --</div>';
				$("#storeDetails_Box").append(html);

				isLast = true;
			}
		} 
	});
}
