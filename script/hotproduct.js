var page = 1;
var isLast = false;
var isLoading = false;

var limit = 6;

apiready = function() {

	init();

}
function init() {

	showLoading();

	var url = "product/hotProduct.do";
	var bodyParam = {
		body : {
			page : page,
			limit : limit,
		}
	};

	//请求数据
	ajaxRequest(url, bodyParam, function(ret, err) {

		hideLoading();
		if (err) {
			toast('服务器开了个小差，在刷新尝试一下!!!');
		} else {
		
			if (ret.code == 1) {
				if (isNotNull(ret.list)) {

					var tailhtml = '';
					if (ret.list.length > 0) {

						for (var i = 0; i < ret.list.length; i++) {
							if (ret.list[i].isGroup==1) {
								tailhtml += '<div class="activity-lists hui-water-items" style="width:48%;display:inline-block;margin:1%" tapmode="" onclick="getGroupProductDetail(\'' + ret.list[i].id + '\')">';
								tailhtml += '<div class="activity-imgs"><img src="../img/productListDefault.png" id="products' + ret.list[i].id + '" /></div>';
								tailhtml += '<div class="activity-box"><div class="activity-title">' + ret.list[i].productName + '</div>';
								tailhtml += '<div class="activity-text"><div class="activity-left">￥' + ret.list[i].groupbuyPrice + '</div>';
								tailhtml += '<div class="activity-right">' + '已拼' + ret.list[i].saleNum + '件</div>';
							} else {
								tailhtml += '<div class="activity-lists hui-water-items" style="width:48%;display:inline-block;margin:1%" tapmode="" onclick="getProductDetail(\'' + ret.list[i].id + '\')">';
								tailhtml += '<div class="activity-imgs"><img src="../img/productListDefault.png" id="products' + ret.list[i].id + '" /></div>';
								tailhtml += '<div class="activity-box"><div class="activity-title">' + ret.list[i].productName + '</div>';
								tailhtml += '<div class="activity-text"><div class="activity-left">￥' + ret.list[i].preferentialPrice + '</div>';
								tailhtml += '<div class="activity-right">' + '已售' + ret.list[i].saleNum + '件</div>';
							}

							tailhtml += '</div>';
							tailhtml += '</div>';
							tailhtml += '</div>';

						}
						$("#activitys").html(tailhtml);

						api.parseTapmode();

						for (var i = 0; i < ret.list.length; i++) {
							cacheImage("products" + ret.list[i].id, ret.list[i].productImg2);

						}

					}
					api.parseTapmode();
					api.addEventListener({
						name : 'scrolltobottom',
						extra : {
							threshold : 0 //设置距离底部多少距离时触发，默认值为0，数字类型
						}
					}, function(ret, err) {
//					alert(123)
						getMoreCollectList();
					});
				}

			}
		}

	});

}



function getMoreCollectList() {
	if (isLast)
		return;
	if (isLoading)
		return;
	page++;
	isLoading = true;
	var url = "product/hotProduct.do";
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

				if (isNotNull(ret.list)) {
					var tailhtml = '';
					for (var i = 0; i < ret.list.length; i++) {
							if (ret.list[i].isGroup==1) {
								tailhtml += '<div class="activity-lists hui-water-items" style="width:48%;display:inline-block;margin:1%" tapmode="" onclick="getGroupProductDetail(\'' + ret.list[i].id + '\')">';
								tailhtml += '<div class="activity-imgs"><img src="../img/productListDefault.png" id="products' + ret.list[i].id + '" /></div>';
								tailhtml += '<div class="activity-box"><div class="activity-title">' + ret.list[i].productName + '</div>';
								tailhtml += '<div class="activity-text"><div class="activity-left">￥' + ret.list[i].groupbuyPrice + '</div>';
								tailhtml += '<div class="activity-right">' + '已拼' + ret.list[i].saleNum + '件</div>';
							} else {
								tailhtml += '<div class="activity-lists hui-water-items" style="width:48%;display:inline-block;margin:1%" tapmode="" onclick="getProductDetail(\'' + ret.list[i].id + '\')">';
								tailhtml += '<div class="activity-imgs"><img src="../img/productListDefault.png" id="products' + ret.list[i].id + '" /></div>';
								tailhtml += '<div class="activity-box"><div class="activity-title">' + ret.list[i].productName + '</div>';
								tailhtml += '<div class="activity-text"><div class="activity-left">￥' + ret.list[i].preferentialPrice + '</div>';
								tailhtml += '<div class="activity-right">' + '已售' + ret.list[i].saleNum + '件</div>';
							}

							tailhtml += '</div>';
							tailhtml += '</div>';
							tailhtml += '</div>';

						}
					$("#activitys").append(tailhtml);
					for (var i = 0; i < ret.list.length; i++) {
						cacheImage('products' + ret.list[i].id, ret.list[i].productImg2);
					}
					api.parseTapmode();
				} else {

					var html = '';
					html += '<div id="hui-load-more">-- 我们是有底线的！ --</div>';
					$("#activitys").append(html);
					isLast = true;
				}
			} else {
				var html = '';
				html += '<div id="hui-load-more">-- 我们是有底线的！ --</div>';
				$("#activitys").append(html);

				isLast = true;
			}
		} else {
			var html = '';
			html += '<div id="hui-load-more">-- 我们是有底线的！ --</div>';
			$("#activitys").append(html);

			isLast = true;
		}

		//}
	});
}