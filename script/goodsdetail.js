var productInfo = '';
//商品
var selectedSpec = new Array();
//选中规格数组
var buyType = '';
//good 立即购买 ，cart 加入购物车
var goodprice = 0;
//普通商品
var goodnum = 1;
//购买普通商品数
var remain_number = 100;
var goodsSkuId, goodsSkuName;
var historyRecord = new Array();
var myCoupon;
var loadSuccess = false;
//优惠劵
var wx;
var shareContent = {};
var product_id;
var type;
var td;
var videoPlayer;
var videoPath;
var productName;
var productId;
//未加载完
//过快点击
var ctrl = 1;
//放模态框出错
var modelCtrl = 1;
apiready = function() {
	product_id = api.pageParam.data.product_id;
	productId = String(product_id)
	selectedSpec = new Array();
	$(".top").hide();
	//检测屏幕高度
	var height = $(window).height();
	//scroll() 方法为滚动事件
	$(window).scroll(function() {
		if ($(window).scrollTop() > height) {
			$(".top").fadeIn(500);
		} else {
			$(".top").fadeOut(500);
		}
	});
	wx = api.require('wx');
	wx.isInstalled(function(ret, err) {
		if (!ret.installed) {
			$('#wxshare').hide();
		}
	});
	api.addEventListener({
		name : 'loginsuccess'
	}, function(ret, err) {
		init();
	});
	api.addEventListener({
		name : 'goodsdetail'
	}, function(ret, err) {
		init();
	});
	api.addEventListener({
		name : 'paySuccess'
	}, function(ret, err) {
		closeSeparateBuy();
	});
	init();
}
//初始化
function init() {
	//	$(".noswipe").hide();
	ctrl = 1;
	var user = $api.getStorage('user');
	showLoading();
	shareContent.product_id = product_id;
	shareContent.isGroup = 0;
	var url = "product/details.do";
	var bodyParam = {
		body : {
			id : product_id
		}
	};
	//	netError("init");
	ajaxRequest(url, bodyParam, function(ret, err) {
		hideLoading();
		if (err) {
			$(".zhezhao").hide();
			netError("init");
		} else {
			$('html,body').removeClass('ovfHiden');

			if (ret.code == 1) {
				if (isNotNull(ret.detail.videoUrl)) {
					$('#myvideo').show();
					videoPath = ret.detail.videoUrl;

					$('#myvideo').show();
					var html = '';
					html += '<video playsinline="" webkit-playsinline=""   width="100%" height="375px" id="player" poster="' + ret.detail.imgs[0].imgUrl + '">';
					html += '<source src="' + videoPath + '">';
					html += '</video>';
					$('.vid').html(html)
					var player = new MediaElementPlayer('video', {
						alwaysShowControls : true,
						videoVolume : 'horizontal',
						features : ['playpause', 'volume', 'fullscreen']
					});
					showvideo()
				} else {
					$('#myvideo').hide();
				}
				loadSuccess = true;
				productInfo = ret.detail;
				var historyData = getCacheData("historyRecord");
				//历史记录缓存
				var ache = {};
				ache.type = ret.detail.isGroup;
				//普通商品
				ache.id = ret.detail.id;
				//商品ID
				ache.price = ret.detail.price;
				//商品价格
				ache.productName = ret.detail.productName;
				productName = ret.detail.productName;
				//商品名称
				ache.groupbuyPrice = ret.detail.preferentialPrice;
				//拼团价格
				ache.productImg2 = ret.detail.productImg2;
				//商品详情图
				ache.shopId = ret.detail.shopId;
				//商品所属店铺ID
				ache.shopName = ret.detail.shopName;
				//商品所属店铺名称
				ache.saleNum = ret.detail.saleNum;
				//已拼团数量
				shareContent.productName = ret.detail.productName;
				shareContent.productImg = ret.detail.productImg2;
				shareContent.price = ret.detail.preferentialPrice;
				if (isNotNull(historyData)) {
					historyRecord = historyData;
				}
				var is_true = true;
				if (isNotNull(historyRecord)) {
					for (var i = 0; i < historyRecord.length; i++) {
						if (historyRecord[i].id == ret.detail.id) {
							historyRecord[i] = ache;
							is_true = false;
						}
					}
				}
				if (isNotNull(user)) {
					if (productInfo.sendId != user.id) {
						$("#kefu").show();
					}
				} else {
					$("#kefu").show();
				}
				if (is_true) {
					historyRecord.push(ache);
				}
				setCacheData("historyRecord", historyRecord);
				//顶部轮播
				if (isNotNull(ret.detail.imgs)) {
					var html = '';
					for (var i = 0; i < ret.detail.imgs.length; i++) {
						if (i == (ret.detail.imgs.length - 1)) {
							cacheImage2('topbanner_' + ret.detail.imgs[i].id, ret.detail.imgs[i].imgUrl, true);
						} else {
							cacheImage2('topbanner_' + ret.detail.imgs[i].id, ret.detail.imgs[i].imgUrl);
						}
						html += '<div class="swiper-slide groups-height"><img src="' + ret.detail.imgs[i].imgUrl + '"  id="topbanner_' + ret.detail.imgs[i].id + '"/></div>';
					}

					$("#groupgoodsdetailHmtl").html(html);

					//------------------隐藏进度

					$(".zhezhao").hide();
					onEventWithAttributes("goodsdetail", "event2", "商品详情", {
						"商品类型" : "普通商品",
						"商品名及id" : productName + "," + productId,
					})

				} else {
					//------------------隐藏进度
					$(".zhezhao").hide();
				}
				//公告
				url = "shop/selectShopById.do";
				bodyParam = {
					body : {
						id : ret.detail.shopId
					}
				};
				ajaxRequest(url, bodyParam, function(ret, err) {

					if (err) {
						_d(err);
					} else {
						if (isNotNull(ret)) {
							if (isNotNull(ret.shop)) {
								if (isNotNull(ret.shop.notice) && ret.shop.notice.length > 0) {
									$("#notice").html(ret.shop.notice)
									$("#trapezoid").css("display", "block")
								} else {
									$("#affiches").css("display", "none");
								}
							} else {
								$("#affiches").css("display", "none");
							}
						}
					}
				})
				//价格
				$("#groupbuyPrice").html("￥" + formatterNumber(ret.detail.preferentialPrice));
				$("#price").html("￥" + formatterNumber(ret.detail.price));
				//已售
				$("#saleNum").html(ret.detail.saleNum);
				//商品名称
				$("#productName").html(ret.detail.productName);
				//优惠券
				if (isNotNull(ret.detail.coupon)) {
					$("#showCoupon").show();
					var html = '<div class="Coupon-left">';
					html += '<div class="Coupon-title">领劵：</div>';
					for (var i = 0; i < ret.detail.coupon.length; i++) {
						if (i < 3) {
							html += '<div class="Coupon-button">' + getCouponName(ret.detail.coupon[i].account, ret.detail.coupon[i].condition, ret.detail.coupon[i].couponType) + '</div>';
						}
					}
					html += '</div>';
					$("#Coupon").html(html);
				} else {
					$("#showCoupon").hide();
				}
				//售后服务
				if (isNotNull(ret.detail.page)) {
					$("#after_sales").html(ret.detail.page[0].title);
				} else {
					$("#description").hide()
				}
				//商品评价
				$("#evalCount").html("(" + getNumber(ret.detail.evalCount) + ")");
				//评价总条数

				if (ret.detail.evalCount > 0) {
					$("#noinfo").hide();
					$("#evaluationList").show();
					if (ret.detail.evalCount > 0) {
						$("#noinfo").show();
						$("#noinfo").html("全部(" + getNumber(ret.detail.evalCount) + ")");
						$("#noinfo").click(function() {
							moreEvaluation("all")
						})
						//总条数
					} else {
						$("#noinfo").hide();
					}
					if (ret.detail.praiseCount > 0) {
						$("#praiseCount").show();
						$("#praiseCount").html("好评(" + getNumber(ret.detail.praiseCount) + ")");
						$("#praiseCount").click(function() {
							moreEvaluation("praise")
						})
						//好评总条数
					} else {
						$("#praiseCount").hide();
					}
					if (ret.detail.figureCount > 0) {
						$("#figureCount").show();
						$("#figureCount").html("有图(" + getNumber(ret.detail.figureCount) + ")");
						$("#figureCount").click(function() {
							moreEvaluation("figure")
						})
						//有图总条数
					} else {
						$("#figureCount").hide();
					}
				} else {
					$("#noinfo").show();
					$(".Evaluation").hide();
					$("#noinfo").html("暂无信息");
				}

				if (isNotNull(ret.detail.evals)) {
					var evaluationHtml = '';
					evaluationHtml = productEvaluationHtml(ret.detail.evals);
					$("#productEvaluation").html(evaluationHtml);
					for (var i = 0; i < ret.detail.evals.length; i++) {
						cacheImage2("header_" + ret.detail.evals[i].id, ret.detail.evals[i].header);
					}
				}

				//所属店铺

				$("#shopName").html(ret.detail.shopName);
				//店铺logo
				$("#productNum").html("商品数量:" + ret.detail.productNum);
				//店铺logo
				if (ret.detail.shopId > 0) {
					if (isNotNull(ret.detail.logo)) {
						$("#shopImg").attr("src", ret.detail.logo);
						//店铺logo
					} else {
						$("#shopImg").attr("src", '../img/logo.png');
						//店铺logo
					}
					$("#shop").show();
				} else {
					$("#shopImg").attr("src", '../img/logo.png');
					//店铺logo
					$("#productNum").html("商品数量:" + ret.detail.productNum);
					//店铺logo
					$("#shop").hide();
				}
				if (ret.detail.details) {
					$("#productDetails").html(ret.detail.details);
				} else {
					emptyById('productDetails');
					$("#productDetails").css("padding-bottom", "20px")
				}
				//
				$("#shopDiv").show();
				$("#showShopimgs").hide();
				$("#PriceDiv").show();
				$("#showPrice").hide();
				$("#cartingPrice").html("￥" + formatterNumber(ret.detail.preferentialPrice));
				$("#initiatePrice").html("￥" + formatterNumber(ret.detail.preferentialPrice));

				//是否收藏

				if (isNotNull(ret.detail.isFavourite)) {
					if (ret.detail.isFavourite == 1) {
						$("#iconshoucang").addClass("iconxinheart118 colorred");
						$("#iconshoucang").removeClass("iconshoucang");
					} else {
						$("#iconshoucang").addClass("iconshoucang");
						$("#iconshoucang").removeClass("iconxinheart118 colorred");
					}
				}
			} else if (ret.code == 0) {
				toast(ret.msg);
				closeWin(name);
			} else {
				netError("init");

			}
		}
	});

}

//商品分享
function goodsShare() {
	if (!checkUser()) {
		return false;
	}
	var user = $api.getStorage('user');
	if (!isNotNull(user.realName)) {
		shareContent.realName = '超拼用户' + user.id.substring(user.id.length - 4);
	} else {
		shareContent.realName = user.realName;
	}
	if (isNotNull(user.header)) {
		shareContent.header = user.header;
	} else {
		shareContent.header = '';
	}

	var url = "product/saveShare.do";
	var bodyParam = {
		body : {
			data : JSON.stringify(shareContent)
		}
	};
	ajaxRequest2(url, bodyParam, function(ret, err) {

		var str = '【' + shareContent.productName + '】，复制这段代码，打开超拼网App，即可查看详情.#' + ret.key + '#';
		wx.shareText({
			apiKey : 'wx6f5ac7bf7832b6a2',
			scene : 'session',
			text : str
		}, function(ret3, err3) {
			if (ret3.status) {
				toast('分享成功');
			}
		});
	});
}

//优惠券tab卡打开

//延迟领取 防部分手机进入直接领取 
var waitCoupon=1;
function openCouponTab() {
			setTimeout(function() {
			   waitCoupon=0;
				_d('wait')
			  }, 100);
	$(".Coupon-bulletin").toggleClass("Coupon-bulletins", 1000);
	$(".CouponBulletin").toggleClass("CouponBulletin-on", 1000);
	$(".body").toggleClass("bodys", 1000);
	$('html,body').addClass('ovfHiden');
	if (productInfo.coupon.length > 0) {
		var html = '';
		myCoupon = productInfo;
		for (var i = 0; i < productInfo.coupon.length; i++) {
			html += '<div class="Couponbox">';
			html += '<div class="Couponbox-left">';
			html += '<span>￥</span><span>' + productInfo.coupon[i].condition + '</span>';
			html += '</div>';
			html += '<div class="Couponbox-zhong">';
			if (productInfo.coupon[i].couponType == 1) {
				html += '<p>' + getCouponName(productInfo.coupon[i].account, productInfo.coupon[i].condition, productInfo.coupon[i].couponType) + '</p>';
			}
			html += '<div class="CouponboxZhong">' + productInfo.coupon[i].startTime + '~' + productInfo.coupon[i].endTime + '</div>';

			html += '</div>';
			if (productInfo.coupon[i].isCollection == 0) {
				html += '<div class="Couponbox-rights" id="myCoupon_' + i + '">已领取</div>';
			} else {
		
				html += '<div class="Couponbox-right" tapmode="" onclick="Receive(\'' + productInfo.coupon[i].id + '\');" id="myCoupon_' + i + '">立即领取</div>';
			}
			html += '</div>';
		}
		$("#CouponList").html(html);

	} else {
		tabEmpty('CouponList');
	}

	return false;
}

//优惠券tab卡关闭
function closeCouponTab() {
	waitCoupon=1;
	$(".Coupon-bulletin").toggleClass("Coupon-bulletins", 1000);
	$(".CouponBulletin-on").toggleClass("CouponBulletin-on", 1000);
	$(".body").toggleClass("bodys", 1000);
	$('html,body').removeClass('ovfHiden');
	return false;
}

//优惠券领取
function Receive(coupon_id) {
	
	if (waitCoupon)
		return false;
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
				toast(ret.msg);
			}
		}
	})
}

//服务说明tab卡打开
function openDescriptionTab() {
	$(".description").toggleClass("descriptions", 1000);
	$(".CouponBulletinOne").toggleClass("CouponBulletin-on", 1000);
	$(".body").toggleClass("bodys", 1000);
	$('html,body').addClass('ovfHiden');
	var html = '';
	for (var i = 0; i < productInfo.page.length; i++) {
		html += '<div class="description-text"><p>' + productInfo.page[i].title + '</p><p>' + productInfo.page[i].context + '</p></div>';
	}
	$("#after_sales_list").html(html);
	return false;
}

//服务说明tab卡关闭
function closeDescriptionTab() {
	$(".description").toggleClass("descriptions", 1000);
	$(".CouponBulletin-on").toggleClass("CouponBulletin-on", 1000);
	$(".body").toggleClass("bodys", 1000);
	$('html,body').removeClass('ovfHiden');
	return false;
}

//回到顶部
function getTop() {
	$('body,html').animate({
		scrollTop : 0
	}, 500);
	return false;
}

function productEvaluationHtml(data) {
	var html = '';
	for (var i = 0; i < data.length; i++) {
		if (i > 0) {
			html += '<div class="borderlink"></div>';
		}
		html += '<div class="Evaluation-title">';
		html += '<div class="EvaluationTop">';
		html += '<div class="Evaluationimg"><img src="../img/verify03.png" id="header_' + data[i].id + '"/></div>';
		if (!isNotNull(data[i].name)) {
			html += '<div class="Evaluationname">暂无昵称</div>';
		} else {
			html += '<div class="Evaluationname">' + data[i].name + '</div>';
		}
		html += '</div>';
		html += '<div class="Evaluation-text">' + data[i].contents + '</div>';
		html += '</div>';
	}

	return html;
}

//评价列表
function moreEvaluation(val) {

	var data = {};
	data.id = productInfo.id;
	data.evalCount = productInfo.evalCount;
	data.praiseCount = productInfo.praiseCount;
	data.figureCount = productInfo.figureCount;
	data.val = val;
	onEventEndWithAttributes("goodsdetail", "event2", "商品详情", {
		"商品类型" : "普通商品",
		"商品名及id" : productName + "," + productId,
	})
	openWinNew("evaluatelist", "评价列表", {}, data);
}

//进入店铺
function goShop() {

	var data = {};
	data.shopId = productInfo.shopId;
	data.shopName = productInfo.shopName;
	var fun = new Array({
		"iconPath" : "../icon/search.png"
	});
	onEventEndWithAttributes("goodsdetail", "event2", "商品详情", {
		"商品类型" : "普通商品",
		"商品名及id" : productName + "," + productId,
	})
	openWinNew("shopdetail", productInfo.shopName, fun, data);
}




//单独购买tab卡打开
function separateBuy(type) {
	if (!ctrl)
		return;
	ctrl = 0
	if (!loadSuccess)
		return;
	if ($(".carting").hasClass("cartings"))
		return;
	$(".carting").addClass("cartings", 1000);
	$(".CouponBulletinsTwo").addClass("CouponBulletins-on", 1000);
	$(".body").addClass("bodys", 1000);
	$('html,body').addClass('ovfHiden', 1000);
	goodprice = 0;
	//商品单价初始化
	goodnum = 1;
	//商品数量初始化
	buyType = type;

	goodsSkuSkuId = 0;
	goodsSkuName = '';
	selectedSpec = new Array();
	if (isNotNull(productInfo.specList)) {
		var html = '';
		html = specHtml(productInfo.specList);
		$("#SpecListHtml").html(html);
		api.parseTapmode();
	} else {
		if (isNotNull(productInfo.productImg2)) {
			getCompressImg(productInfo.productImg2, function(ret, err) {
				$("#goods_img").attr("src", ret.savePath);
			})
		}
		$("#goods_name").html(productInfo.productName);
		$("#goods_price").html("￥" + formatterNumber(productInfo.preferentialPrice));
		goodprice = formatterNumber(productInfo.preferentialPrice);
		//选中普通商品规格价格
	}
	modelCtrl = 0;
	return false;

}

//单独购买tab卡关闭
function closeSeparateBuy() {
	if (modelCtrl)
		return;
	buyType = '';
	$(".carting").removeClass("cartings");
	$(".CouponBulletins-on").removeClass("CouponBulletins-on");
	$(".body").removeClass("bodys");
	$('html,body').removeClass('ovfHiden');
	$("#good_number_text").val(1);
	$("#SpecListHtml").html("");
	modelCtrl = 1;
	ctrl = 1;
	return false;
}

//更多tab卡关闭
function footerBottom() {
	$(".showBottom").toggleClass("showBottoms", 1000);
	return false;
}

//收藏/取消收藏-
function getCollection() {
	if (!checkUser())
		return false;
	var url = "favorite/dofavorite.do";
	var bodyParam = {
		body : {
			type : 1,
			id : productInfo.id
		}
	};
	ajaxRequest2(url, bodyParam, function(ret, err) {
		if (err) {
			_d(err);

		} else {
			if (ret.code == 1) {
				if (productInfo.isFavourite == 1) {
					productInfo.isFavourite = 0;
					$("#iconshoucang").addClass("iconshoucang");
					$("#iconshoucang").removeClass("iconxinheart118 colorred");
					toast("取消收藏成功");
				} else {
					productInfo.isFavourite = 1;
					$("#iconshoucang").addClass("iconxinheart118 colorred");
					$("#iconshoucang").removeClass("iconshoucang");
					toast("收藏成功");
				}
			} else {
				if (productInfo.isFavourite == 1) {
					toast("取消收藏失败");
				} else {
					toast("收藏失败");
				}
			}
		}
	});

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

//历史浏览
function history() {

	var fun = new Array({
		"text" : "清除"
	});
	onEventEndWithAttributes("goodsdetail", "event2", "商品详情", {
		"商品类型" : "普通商品",
		"商品名及id" : productName + "," + productId,
	})

	openWinNew("history", "历史记录", fun, {}, true);
}

function specHtml(data) {
	var html = "";
	for (var i = 0; i < data.length; i++) {
		html += '<div class="specification">';
		html += '<div class="specification-title">' + data[i].specName + '</div>';
		html += '<div class="">';
		for (var j = 0; j < data[i].items.length; j++) {
			if (j > 0) {
				html += '<div class="specification-list spec_' + i + '" id="spec_' + i + '_' + data[i].items[j].id + '" tapmode="" onclick="selectSpec(' + i + ',\'' + data[i].items[j].id + '\');">' + data[i].items[j].name + '</div>';
			} else {
				html += '<div class="specification-list spec_' + i + ' specification-lists" id="spec_' + i + '_' + data[i].items[j].id + '" tapmode="" onclick="selectSpec(' + i + ',\'' + data[i].items[j].id + '\');">' + data[i].items[j].name + '</div>';
			}
		}
		selectedSpec.push(data[i].items[0].id);
		//初始化规格
		goodspecContrast(selectedSpec);
		html += '</div>';
		html += '</div>';
	}
	return html;
}

function selectSpec(num, id) {
	$(".spec_" + num).removeClass("specification-lists");
	$("#spec_" + num + "_" + id).addClass("specification-lists");
	selectedSpec.splice(num, 1, id);
	goodspecContrast(selectedSpec);
}

//普通商品规格对照表
function goodspecContrast(specArr) {
	var specVal = '';
	for (var i = 0; i < specArr.length; i++) {
		if (i > 0) {
			specVal += "_" + specArr[i];
		} else {
			specVal = specArr[i];
		}
	}
	for (var j = 0; j < productInfo.specValue.length; j++) {
		if (specVal == productInfo.specValue[j].specKey) {
			goodsSkuId = productInfo.specValue[j].id;
			goodsSkuName = productInfo.specValue[j].specDesc;
			if (isNotNull(productInfo.specValue[j].skuImg)) {
				$("#goods_img").attr("src", "../img/goodsdetailimg.png");
				$("#goods_img").attr("src", productInfo.specValue[j].skuImg);
			}
			$("#goods_price").html("￥" + formatterNumber(productInfo.specValue[j].preferentialPrice));
			$('#goods_name').html(productInfo.specValue[j].specDesc);
			goodprice = formatterNumber(productInfo.specValue[j].preferentialPrice);
			//选中普通商品规格价格
		}
	}
}

//数量加减按钮事件
function addNum() {
	var number = parseInt($("#good_number_text").val());
	if (remain_number < (number + 1)) {
		number = number - 1;
		$("#good_number_text").val(remain_number);
		toast("购买数量不能大于库存数量");
		return false;
	} else {
		number = number + 1;
	}
	goodnum = number;
	$("#good_number_text").val(number);
}

function reduceNum() {
	var number = parseInt($("#good_number_text").val());
	if ((number - 1) < 1) {
		toast("购买数量不能小于1");
		return false;
	} else {
		number--
	}
	goodnum = number;
	$("#good_number_text").val(number);
}

//普通商品提交
function buyGood() {

	if (!checkUser())
		return false;

	if (buyType == 'good') {//立即购买
		buyGoodSubmit();
	} else if (buyType == 'cart') {//加入购物车
		addShopCart();
	}

}

//普通商品提交
function buyGoodSubmit() {
	orderType = 1;
	if (!checkUser())
		return false;
	var data = {};

	data.productId = productInfo.id;
	//商品ID
	data.productName = productInfo.productName;
	//商品名称
	data.productImg2 = productInfo.productImg2;
	//商品图片
	data.price = goodprice;
	//商品购买价格
	if (goodsSkuId > 0) {//商品选中的规格ID
		data.skuId = goodsSkuId;
		data.skuName = goodsSkuName;
	}

	data.shopId = productInfo.shopId;
	//商品所属店铺ID
	data.shopName = productInfo.shopName;
	//商品所属店铺名称
	data.logo = productInfo.logo;
	//商品所属店铺logo
	data.num = goodnum;

	//购买数量
	var totalPrice = formatterNumber(goodprice * goodnum);

	data.totalPrice = totalPrice;
	//购买总金额
	data.type = orderType;

	//购买类型
	getOrderCoupon(data, function(ret, err) {

		if (err) {
			toast('数据通讯发生错误，请重试');
		} else {

			if (ret.code == 1) {

				data.enableCoupon = ret.list;
			}
			closeSeparateBuy()
			$("#good_number_text").val(1);
			$("#SpecListHtml").html("");
			onEventEndWithAttributes("goodsdetail", "event2", "商品详情", {
				"商品类型" : "普通商品",
				"商品名及id" : productName + "," + productId,
			})
			openWinNew("confirmorder", "确认订单", [], data, true);
			setTimeout(function() {
				ctrl = 1;
			}, 300);
		}

	});
}

//加入购物车
function addShopCart() {
	if (!checkUser())
		return false;

	var url = 'cart/saveCart.do';
	var bodyParam = {
		body : {
			shopId : productInfo.shopId,
			productId : productInfo.id,
			number : goodnum,
			sku : goodsSkuId
		}
	};
	ajaxRequest2(url, bodyParam, function(ret, err) {
		if (err) {
			toast('数据通讯发生错误，请重试');
		} else {
			if (ret.code == 1) {
				closeSeparateBuy();
				api.sendEvent({
					name : 'reloadCart'
				});
				toast('加入购物车成功');

				setTimeout(function() {
					ctrl = 1;
				}, 300);

			} else {
				toast('数据通讯发生错误，请重试');
			}
		}
	});
	closeSeparateBuy();
}

function getOrderCoupon(data, backfun) {
	addressInfo = getCacheData("addressData");
	if (isNotNull(addressInfo)) {
		var url = "coupon/selectOrderCoupon";
		var bodyParam = {
			body : {
				productId : data.productId,
				totalPrice : data.totalPrice,
				num : data.num,
				shopId : data.shopId,
				province : addressInfo.province,
				city : addressInfo.city
			}
		};
		ajaxRequest(url, bodyParam, function(ret, err) {
			backfun(ret, err);
		});
	} else {

		var data = {};
		data.source = 1;
		openWinNew('addresslist', '收货地址', {}, data, true);
	}

}

/**
 * 跳转聊天
 * @param {Object} id       订单ID/用户ID
 * @param {Object} type		1时，id为订单ID；0时，id为用户ID；
 * @param {Object} shopId   店铺ID
 * @param {Object} id       商品ID
 * @param {Object} shopName	 店铺名称
 * @param {Object} img		聊天对象头像
 */
function openChat() {
	if (!checkUser())
		return false;
	var data = {};
	data.sendId = productInfo.shopId;
	//data.shopId = productInfo.shopId;
	if (isNotNull(productInfo)) {

		var info = {};
		info.id = productInfo.id;
		info.productImg2 = productInfo.productImg2;
		info.productName = productInfo.productName;
		info.page = productInfo.page;
		if (productInfo.isGroup == true) {
			info.goodTyle = 'group';
		} else {
			info.goodTyle = 'good';
		}

		info.preferentialPrice = productInfo.preferentialPrice;
		info.groupbuyPrice = productInfo.groupbuyPrice;
		data.product = info;
	}
	data.pushUserId = productInfo.sendId;
	data.img = productInfo.logo;
	data.shopName = productInfo.shopName;
	onEventEndWithAttributes("goodsdetail", "event2", "商品详情", {
		"商品类型" : "普通商品",
		"商品名及id" : productName + "," + productId,
	})
	var fun = new Array({
		"text" : "进店"
	});
	openWinNew("chat", productInfo.shopName, fun, data, true);
}

function changeNum() {
	var number = parseInt($("#good_number_text").val());
	if (remain_number < number) {
		number = remain_number;
		$("#good_number_text").val(remain_number);
		toast("购买数量不能大于库存数量");
	} else if (number < 1) {
		number = 1;
		$("#good_number_text").val(remain_number);
		toast('购买数量不能小于1')
	}
	goodnum = number;
}

function showvideo() {
	
	$(".vid").show();
	$("#video").addClass("button2")
	$("#img").removeClass("button2")
	$('.swiper-container').addClass('hide')
}

//

function showImg() {

	player.pause();

	$(".vid").hide();
	$("#video").removeClass("button2")
	$("#img").addClass("button2")
		$('.swiper-container').removeClass('hide')
}