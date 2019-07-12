var fenlei = 0;
var data;
//分页用各参数
var pages = 1;
var isLast = false;
var isLoading = false;
var limit = 6;
var scrollFalse;
var fenlei = 0;
apiready = function() {

	data = api.pageParam;
	data.fenlei = fenlei

	//	api.addEventListener({
	//		name : 'scrolltobottom',
	//		extra : {
	//			threshold : 0 //设置距离底部多少距离时触发，默认值为0，数字类型
	//		}
	//	}, function(ret, err) {
	//
	//		if(!scrollFalse)
	//			getMoreGoodList();
	//	});
	//
	init();

}
function init() {

	var html = '';
	if (data.class_two_id == 0) {
		html += '<div class="NavText NavTextClick" id="class_0" tapmode="" onclick="getTwoClass(0);">全部</div>';
	} else {
		html += '<div class="NavText" tapmode="" id="class_0" onclick="getTwoClass(0);">全部</div>';
	}

	for (var i = 0; i < data.classInfo.length; i++) {
		//超过3个不显示下展上拉箭头
		if (data.classInfo.length < 3) {
			$(".arrow").remove();
		} else {
			//			if(i==2 && textlength(data.classInfo[i].name)<8){
			//				//单字符小于8个时，用空格补充
			//				var str ='';
			//				for(var j=0;j<(8-textlength(data.classInfo[i].name));j++){
			//					 str+= "&nbsp;&nbsp;&nbsp;";
			//				}
			//				data.classInfo[i].name = str+data.classInfo[i].name;
			//			}

		}
		if (data.classInfo[i].id != data.class_two_id) {
			html += '<div class="NavText" id="class_' + data.classInfo[i].id + '" tapmode="" onclick="getTwoClass(\'' + data.classInfo[i].id + '\');">' + data.classInfo[i].name + '</div>';
		} else {
			html += '<div class="NavText NavTextClick" id="class_' + data.classInfo[i].id + '" tapmode="" onclick="getTwoClass(\'' + data.classInfo[i].id + '\');">' + data.classInfo[i].name + '</div>';
		}

	}

	html += '<div class="NavText">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</div>';
	$("#classHtml").html(html);
	hui('#TopNavigations').scrollX(5, '.NavText');
	api.parseTapmode();
	//
	if (data.class_two_id) {
		fenlei = 1
		getTwoClass(data.class_two_id);
	} else {
		
		getGoodList();
	}
}

//点击分类
function getTwoClass(class_id) {

	$(".NavText").removeClass("NavTextClick");
	$("#class_" + class_id).addClass("NavTextClick");
	if (class_id > 0) {
		data.class_two_id = class_id;
	} else {
		data.class_two_id = 0;
	}
	//点击分类数据初始化
	pages = 1;
	isLast = false;
	isLoading = false;
	scrollFalse = 0;

	$("#classHtml").addClass("Navs");
	$('.arrow').removeClass("arrow-on");
	$("#classHtml").removeClass("Navs-on");
	if (fenlei == 1) {
		$("#TopNavigations").scrollLeft($("#class_" + class_id).offset().left - 100);
		fenlei = 0;
	}
	
	getGoodList();
}

//商品列表
function getGoodList() {
	api.removeEventListener({
		name : 'scrolltobottom',
	});
	//$("#goodsList").html('');
	showLoading();
	
	var url = "productClass/getProductList.do";
	var bodyParam;
	if (data.class_two_id > 0) {
		bodyParam = {
			body : {
				pid : data.class_two_id,
				page : pages,
				limit : limit
			}
		};
	} else {
		bodyParam = {
			body : {
				fristId : data.class_id,
				page : pages,
				limit : limit
			}
		};
	}
	ajaxRequest(url, bodyParam, function(ret, err) {
		hideLoading();
		$("#goodsList").html('');
		if (err) {
			_d(err);
		} else {
			
			if (ret.code == 1) {
				if (isNotNull(ret.productList)) {					
						var tailhtml = '';
						for (var i = 0; i < ret.productList.length; i++) {
						
							if (ret.productList[i].isGroupBuy == 1) {
								tailhtml += '<div class="activity-lists hui-water-items" style="width:48%;display:inline-block;margin:1%" tapmode="" onclick="getGroupProductDetail(\'' + ret.productList[i].id + '\')">';
								tailhtml += '<div class="activity-imgs"><img src="../img/productListDefault.png" id="products' + ret.productList[i].id + '" /></div>';
								tailhtml += '<div class="activity-box"><div class="activity-title">' + ret.productList[i].productName + '</div>';
								tailhtml += '<div class="activity-text"><div class="activity-left">￥' + ret.productList[i].groupbuyPrice + '</div>';
								tailhtml += '<div class="activity-right">' + '已拼' + ret.productList[i].saleNum + '件</div>';
							} else {
								tailhtml += '<div class="activity-lists hui-water-items" style="width:48%;display:inline-block;margin:1%" tapmode="" onclick="getProductDetail(\'' + ret.productList[i].id + '\')">';
								tailhtml += '<div class="activity-imgs"><img src="../img/productListDefault.png" id="products' + ret.productList[i].id + '" /></div>';
								tailhtml += '<div class="activity-box"><div class="activity-title">' + ret.productList[i].productName + '</div>';
								tailhtml += '<div class="activity-text"><div class="activity-left">￥' + ret.productList[i].preferentialPrice + '</div>';
								tailhtml += '<div class="activity-right">' + '已售' + ret.productList[i].saleNum + '件</div>';
							}

							tailhtml += '</div>';
							tailhtml += '</div>';
							tailhtml += '</div>';

						}
						$("#goodsList").html(tailhtml);
						api.parseTapmode();
						for (var i = 0; i < ret.productList.length; i++) {
							cacheImage("products" + ret.productList[i].id, ret.productList[i].productImg2);
	
						}
						if(ret.productList.length>5){
							api.addEventListener({
								name : 'scrolltobottom',
								extra : {
									threshold : 0 //设置距离底部多少距离时触发，默认值为0，数字类型
								}
							}, function(ret, err) {
								getMoreGoodList();
							});
						}
						
				} else {
					
					scrollFalse = 1;
					tabEmpty("goodsList");
					isLast = true;
				}
			} else {
				scrollFalse = 1;
				tabEmpty("goodsList");
				isLast = true;
			}
		}
	});
}

//更多商品列表
function getMoreGoodList() {
	
	if (isLast)
		return;
	if (isLoading)
		return;
	pages++;
	isLoading = true;
	var url = "productClass/getProductList.do";
	var bodyParam;

	if (data.class_two_id > 0) {
		bodyParam = {
			body : {
				pid : data.class_two_id,
				page : pages,
				limit : limit
			}
		};
	} else {
		bodyParam = {
			body : {
				fristId : data.class_id,
				page : pages,
				limit : limit
			}
		};
	}
	ajaxRequest(url, bodyParam, function(ret, err) {
		isLoading = false;
		if (err) {
			_d(err);
		} else {
			if (ret.code == 1) {

				var productListData = new Array();

				if (isNotNull(ret.productList)) {
					for (var i = 0; i < ret.productList.length; i++) {
						productListData.push({
							id : ret.productList[i].id,
							img : ret.productList[i].productImg2,
							productName : ret.productList[i].productName,
							price : ret.productList[i].preferentialPrice,
							saleNum : ret.productList[i].saleNum
						});
					}
					var tailhtml = '';
					for (var i = 0; i < ret.productList.length; i++) {
						if (ret.productList[i].isGroupBuy == 1) {
							tailhtml += '<div class="activity-lists hui-water-items" style="width:48%;display:inline-block;margin:1%" tapmode="" onclick="getGroupProductDetail(\'' + ret.productList[i].id + '\')">';
							tailhtml += '<div class="activity-imgs"><img src="../img/productListDefault.png" id="products' + ret.productList[i].id + '" /></div>';
							tailhtml += '<div class="activity-box"><div class="activity-title">' + ret.productList[i].productName + '</div>';
							tailhtml += '<div class="activity-text"><div class="activity-left">￥' + ret.productList[i].groupbuyPrice + '</div>';
							tailhtml += '<div class="activity-right">' + '已拼' + ret.productList[i].saleNum + '件</div>';
						} else {
							tailhtml += '<div class="activity-lists hui-water-items" style="width:48%;display:inline-block;margin:1%" tapmode="" onclick="getProductDetail(\'' + ret.productList[i].id + '\')">';
							tailhtml += '<div class="activity-imgs"><img src="../img/productListDefault.png" id="products' + ret.productList[i].id + '" /></div>';
							tailhtml += '<div class="activity-box"><div class="activity-title">' + ret.productList[i].productName + '</div>';
							tailhtml += '<div class="activity-text"><div class="activity-left">￥' + ret.productList[i].preferentialPrice + '</div>';
							tailhtml += '<div class="activity-right">' + '已售' + ret.productList[i].saleNum + '件</div>';
						}

						tailhtml += '</div>';
						tailhtml += '</div>';
						tailhtml += '</div>';

					}
					$("#goodsList").append(tailhtml);
					api.parseTapmode();
					for (var i = 0; i < ret.productList.length; i++) {
						cacheImage("products" + ret.productList[i].id, ret.productList[i].productImg2);

					}
				} else {
					api.removeEventListener({
						name : 'scrolltobottom',
					});
					isLast = true;
					var html = '';
					html += '<div id="hui-load-more">-- 我们是有底线的！ --</div>';
					$("#goodsList").append(html);

				}
			} else {
				api.removeEventListener({
					name : 'scrolltobottom',
				});
				isLast = true;
				var html = '';
				html += '<div id="hui-load-more">-- 我们是有底线的！ --</div>';
				$("#goodsList").append(html);

			}
		}
	});
}

//分类展开/收缩
function arrow() {
	if ($("#classHtml").attr("class") == "Navs") {
		$("#classHtml").removeClass("Navs");
		$("#classHtml").addClass("Navs-on");
		$('.arrow').addClass("arrow-on");
		fenlei = 1
	} else {
		$("#classHtml").removeClass("Navs-on");
		$("#classHtml").addClass("Navs");
		$('.arrow').removeClass("arrow-on");
		fenlei = 0
	}

}
//
