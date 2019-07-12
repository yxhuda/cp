var cartList;
var delArray;
var td;
apiready = function() {

	api.addEventListener({
		name : 'loginsuccess'
	}, function(ret, err) {
		init();
	});
	api.addEventListener({
		name : 'reloadCart'
	}, function(ret, err) {
		//coding...
		reloadCart();
	});
	api.addEventListener({
		name : 'orderSubmit'
	}, function(ret, err) {
		init();
	});

	api.addEventListener({
		name : 'editCart'
	}, function(ret, err) {
		//coding...
		switchPanel(1);
	});
	api.addEventListener({
		name : 'completeCart'
	}, function(ret, err) {
		//coding...
		switchPanel(2);
	});
	$('#calPanel').hide();
	api.refreshHeaderLoadDone();
			dropDownLoad(function(ret, err) {
				init();
			});
	init();
}
/**
 * 初始化
 */
function init() {
	reloadCart();
	$('.hui-water-items').remove();
	$("#activity").empty();
	getRecommendProduct(2, 'activity', function(ret1, err1) {
		if (err1) {
			api.removeLaunchView();
			//netError("init");
			
		} else {
			api.refreshHeaderLoadDone();

			if (ret1.code == 1 && ret1.products.length > 0) {

				showRecommendProduct(ret1.products, 'activity');

			} else {
				$('.shopdetail-commodity').hide();
			}
		}
		api.removeLaunchView();
	});
}

//刷新购物车
function reloadCart() {
	var user = getUser();
	if (isNotNull(user)) {
		$('#calPanel').show();
		$('#opPanel').hide();
		$('.buycheckBox').show();
		$('.editcheckBox').hide();
		var url = 'cart/cartList.do';
		ajaxRequest(url, {}, function(ret, err) {
			$('#cartList').html('');
			if (err) {
				$('#cartEmpty').show();
				$('#calPanel').hide();
			} else {

				dropDownLoad(function(ret, err) {
					init();
				});
				if (ret.code == 1) {
					$('#cartEmpty').hide();
					var result = createCartHtml(ret.cartList);
					cartList = ret.cartList;
				
					$('#cartList').html(result.html);
					for (var i = 0; i < result.src.length; i++) {
						cacheImage("img" + result.src[i].id, result.src[i].src);
					}
					api.parseTapmode();

					$('#calPanel').show();
					api.setGlobalData({
						key : 'showCart',
						value : 1
					});
					api.sendEvent({
						name : 'refOp'
					});
				} else {
					api.sendEvent({
						name : 'showEditCart',
						extra : {
							show : 0
						}
					});
					api.setGlobalData({
						key : 'showCart',
						value : 0
					});
					$('#cartEmpty').show();
					$('#calPanel').hide();
				}
			}
		});
	} else {
		$('#cartEmpty').show();
		$('#calPanel').hide();
		api.sendEvent({
			name : 'showEditCart',
			extra : {
				show : 0
			}
		});
	}
}

/**
 * 生成购物车列表
 */
var flag = true;
function createCartHtml(data) {
	var html = '';
	var idImg = new Array();

	var allMoney = 0;
	for (var i = 0; i < data.length; i++) {

		html += '	<div class="confirmorder-list" >';
		html += '			<div class="cartempty-title">';
		html += '				<div class="cartemptyTitle-left">';
		html += '					<div class="zp-radios buycheckBox" >';
		var num = 0;
		for (var z = 0; z < data[i].list.length; z++) {
			if (data[i].list[z].type == 0) {
				num++
			}

		}
		if (num == data[i].list.length) {
			html += '<input type="checkbox" disabled  /><label onclick="outGood(1)" tapmode="" ></label>';

		} else {
			html += '<input type="checkbox" disabled id="cartShop' + data[i].shopId + '"checkEditProduct class="cartShop" /><label onclick="checkProduct(1,\'' + data[i].shopId + '\',\'' + data[i].shopId + '\')" tapmode="" ></label>';

		}
		html += '</div>';
		html += '<div class="zp-radios editcheckBox" style="display:none">';
		html += '<input type="checkbox" disabled id="editcartShop' + data[i].shopId + '" class="editcartShop editCheckList" /><label onclick="checkEditProduct(1,\'' + data[i].shopId + '\',\'' + data[i].shopId + '\')" tapmode="" ></label>';
		html += '</div>';
		html += '</div>';
		if (data[i].shopId > 0) {
			html += '<div class="cartemptyTitle-right"  onclick="goShop(\'' + data[i].shopId + '\',\'' + data[i].shopName + '\')" tapmode="">';
			if (isNotNull(data[i].logo)) {
				html += '<img style="width:27px;margin-right:5px;" src="' + data[i].logo + '"><span style="position:relative;top:-7px">' + data[i].shopName + '</span><i class="icon iconfont iconarrow-left" style="position:relative;top:-7px"></i>';
			} else {
				html += '<img style="width:27px;margin-right:5px;" src="../img/logo.png"><span style="position:relative;top:-7px">' + data[i].shopName + '</span><i class="icon iconfont iconarrow-left" style="position:relative;top:-7px"></i>';

			}
			html += '</div>';
		} else {
			html += '<div class="cartemptyTitle-right" >';
			html += '<i class="icon iconfont icondianpu"></i><span>' + data[i].shopName + '</span><i class="icon iconfont iconarrow-left"></i>';
			html += '</div>';
		}

		html += '</div>';
		var totalMoney = 0;
		var childFlag = true;
		for (var z = 0; z < data[i].list.length; z++) {
			var tmp = {};
			tmp.id = data[i].list[z].cartDescId;
			tmp.src = data[i].list[z].img;
			idImg.push(tmp);

			if (data[i].list[z].type == 1) {
				html += '			<div class="cartemptyBox" >';
				html += '				<div class="cartemptyBox-left">';
				html += '					<div class="zp-radios buycheckBox" >';
				html += '						<input type="checkbox" disabled id="cartProduct' + data[i].list[z].cartDescId + '" class="cartShop' + data[i].shopId + ' checkBox" ';
				if (data[i].list[z].isCheck == 1) {
					html += 'checked="checked"';
					totalMoney += parseFloat(data[i].list[z].preferentialPrice) * parseInt(data[i].list[z].number);
					allMoney += parseFloat(data[i].list[z].preferentialPrice) * parseInt(data[i].list[z].number);
				} else {
					flag = false;
					childFlag = false;
				}
				html += ' />';
				html += '				<label tapmode="" onclick="checkProduct(2,\'' + data[i].list[z].cartDescId + '\',\'' + data[i].shopId + '\')" ></label>';
				html += '					</div>';

				html += '					<div class="zp-radios editcheckBox" style="display:none">';
				html += '<input type="checkbox" disabled id="editcartProduct' + data[i].list[z].cartDescId + '" class="editShop' + data[i].shopId + ' editCheckList">';
				html += '				<label tapmode="" onclick="checkEditProduct(2,\'' + data[i].list[z].cartDescId + '\',\'' + data[i].shopId + '\')" ></label>';
				html += '					</div>';

				html += '				</div>';
				html += '				<div class="cartemptyBox-right" >';
				if (data[i].list[z].isGroup == 1) {
					html += '					<div class="confirmorderBox-img" tapmode="" onclick="getGroupProductDetail(\'' + data[i].list[z].productId + '\');">';
					html += '						<img src="../img/productListDefault.png" id="img' + data[i].list[z].cartDescId + '"/>';
					html += '					</div>';
					html += '					<div class="confirmorderBox-text" >';
					html += '						<div class="confirmorderBox-title" tapmode="" onclick="getGroupProductDetail(\'' + data[i].list[z].productId + '\');">';
					html += data[i].list[z].productName;
					html += '						</div>';
					html += '						<div class="confirmorderBox-name" tapmode="" onclick="getGroupProductDetail(\'' + data[i].list[z].productId + '\');">';
					if (isNotNull(data[i].list[z].specDesc)) {
						html += '							规格：' + data[i].list[z].specDesc;
					}
					html += '						</div>';
					html += '						<div class="cartempty-p">';
					html += '							<div class="confirmorderBox-price" tapmode="" onclick="getGroupProductDetail(\'' + data[i].list[z].productId + '\');">';
					html += '￥' + formatterNumber(data[i].list[z].preferentialPrice);
				} else if (data[i].list[z].isGroup == 0) {

					html += '					<div class="confirmorderBox-img" tapmode="" onclick="getProductDetail(\'' + data[i].list[z].productId + '\');">';
					html += '						<img src="../img/productListDefault.png" id="img' + data[i].list[z].cartDescId + '"/>';
					html += '					</div>';
					html += '					<div class="confirmorderBox-text" >';
					html += '						<div class="confirmorderBox-title" tapmode="" onclick="getProductDetail(\'' + data[i].list[z].productId + '\');">';
					html += data[i].list[z].productName;
					html += '						</div>';
					html += '						<div class="confirmorderBox-name" tapmode="" onclick="getProductDetail(\'' + data[i].list[z].productId + '\');">';
					if (isNotNull(data[i].list[z].specDesc)) {
						html += '							规格：' + data[i].list[z].specDesc;
					}
					html += '						</div>';
					html += '						<div class="cartempty-p">';
					html += '							<div class="confirmorderBox-price" tapmode="" onclick="getProductDetail(\'' + data[i].list[z].productId + '\');">';
					html += '￥' + formatterNumber(data[i].list[z].preferentialPrice);
				}
				html += '							</div>';
				html += '							<div class="hui-wrap price">';
				html += '								<div class="hui-number-box" min="1" max="3">';
				html += '									<div class="reduce" tapmode="" onclick="reduceNum(\'' + data[i].list[z].cartDescId + '\')">-</div>';
				html += '									<input type="number"  readonly="readonly"  id="numProduct' + data[i].list[z].cartDescId + '" value="' + data[i].list[z].number + '"></input>';
				html += '									<div class="add" tapmode="" onclick="addNum(\'' + data[i].list[z].cartDescId + '\')">+</div>';
				html += '								</div>';
				html += '							</div>';
				html += '						</div>';
				html += '					</div>';
				html += '				</div>';
				html += '			</div>';
			} else {
				html += '			<div class="cartemptyBox" >';
				html += '				<div class="cartemptyBox-left">';
				html += '					<div class="zp-radios buycheckBox" >';
				html += '						<input type="checkbox" disabled ';
				//			if (data[i].list[z].isCheck == 1) {
				//				html += 'checked="checked"';
				//				totalMoney += parseFloat(data[i].list[z].preferentialPrice) * parseInt(data[i].list[z].number);
				//				allMoney += parseFloat(data[i].list[z].preferentialPrice) * parseInt(data[i].list[z].number);
				//			} else {
				//				flag = false;
				//				childFlag = false;
				//			}
				html += ' />';
				html += '				<label tapmode="" onclick="checkProduct(2,\'' + data[i].list[z].cartDescId + '\',\'' + data[i].shopId + '\')" ></label>';
				html += '					</div>';

				html += '					<div class="zp-radios editcheckBox" style="display:none">';
				html += '<input type="checkbox" disabled id="editcartProduct' + data[i].list[z].cartDescId + '" class="editShop' + data[i].shopId + ' editCheckList">';
				html += '				<label tapmode="" onclick="checkEditProduct(2,\'' + data[i].list[z].cartDescId + '\',\'' + data[i].shopId + '\')" ></label>';
				html += '					</div>';

				html += '				</div>';
				html += '				<div class="cartemptyBox-right" >';
				html += '					<div class="confirmorderBox-img" tapmode="" onclick="outGood();">';
				html += '						<img src="../img/productListDefault.png" id="img' + data[i].list[z].cartDescId + '"/>';
				html += '					</div>';
				html += '					<div class="confirmorderBox-text" >';
				html += '						<div class="confirmorderBox-title" tapmode="" onclick="outGood();">';
				html += data[i].list[z].productName;
				html += '						</div>';
				html += '						<div class="confirmorderBox-name" tapmode="" onclick="outGood();">';
				if (isNotNull(data[i].list[z].specDesc)) {
					html += '规格：' + data[i].list[z].specDesc;
				}
				html += '						</div>';
				html += '						<div class="cartempty-p">';
				html += '							<div class="confirmorderBox-price1" tapmode="" onclick="outGood();">';
				html += '商品库存不足';
				html += '							</div>';

				html += '						</div>';
				html += '					</div>';
				html += '				</div>';
				html += '			</div>';
			}

		}
		if (childFlag) {
			html += '<script>$("#cartShop' + data[i].shopId + '").prop("checked",true);</script>';
		}
		html += '		<div class="cartempty-total">';
		html += '			<span>本店合计：</span><span id="shopMoney' + data[i].shopId + '"> ￥' + formatterNumber(totalMoney) + '</span>';
		html += '		</div>';
		html += '	</div>';
	}
	var result = {};
	result.html = html;
	result.src = idImg;
//	if (flag) {
	
		$('#checkAll').prop('checked', false);
//	}else{
//	$('#checkAll').prop('checked', false);
//	}
	$('#totalPrice').html('￥' + formatterNumber(allMoney));
	return result;
}

//数量加减按钮事件
function addNum(id) {
	var number = parseInt($("#numProduct" + id).val());
	number++;
	updateNum(id, number);
}

function reduceNum(id) {
	var number = parseInt($("#numProduct" + id).val());
	if ((number - 1) < 1) {
		toast("购买数量不能小于1");
		return false;
	} else {
		number = number - 1;
	}
	updateNum(id, number);
}

function switchPanel(flag) {
	if (flag == 1) {
		delArray = new Array();
		$('.editCheckList').each(function() {
			$(this).prop('checked', false);
		});
		$('#opPanel').show();
		$('#calPanel').hide();
		$('.buycheckBox').hide();
		$('.editcheckBox').show();
	} else {
		$('#calPanel').show();
		$('#opPanel').hide();
		$('.buycheckBox').show();
		$('.editcheckBox').hide();
	}
}

//监听数量变化
function changeNumber(id) {
	var num = $("#numProduct" + id).val();
	if (isNotNull(num) && isNotNull(parseInt(num))) {
		if (parseInt(num) < 1) {
			toast("购买数量不能小于1");
			for (var i = 0; i < cartList.length; i++) {
				for (var z = 0; z < cartList[i].list.length; z++) {
					if (cartList[i].list[z].cartDescId == id) {
						$("#numProduct" + id).val(cartList[i].list[z].number);
					}
				}
			}
		} else if (parseInt(num) > 999) {
			toast('购买数量不能大于999');
			for (var i = 0; i < cartList.length; i++) {
				for (var z = 0; z < cartList[i].list.length; z++) {
					if (cartList[i].list[z].cartDescId == id) {
						$("#numProduct" + id).val(cartList[i].list[z].number);
					}
				}
			}
		} else {
			for (var i = 0; i < cartList.length; i++) {
				for (var z = 0; z < cartList[i].list.length; z++) {
					if (cartList[i].list[z].cartDescId == id) {
						updateNum(id, parseInt(num));
					}
				}
			}
		}
	} else {
		for (var i = 0; i < cartList.length; i++) {
			for (var z = 0; z < cartList[i].list.length; z++) {
				if (cartList[i].list[z].cartDescId == id) {
					$("#numProduct" + id).val(cartList[i].list[z].number);
				}
			}
		}
	}
}

//修改购物车数量
function updateNum(id, number) {
	var url = 'cart/updateCart.do';
	var bodyParam = {
		body : {
			cartDescId : id,
			number : number
		}
	};
	ajaxRequest2(url, bodyParam, function(ret, err) {

		if (err) {
			toast('数据通讯发生错误');
		} else {
			if (ret.code == 1) {
				$("#numProduct" + id).val(number)
				for (var i = 0; i < cartList.length; i++) {
					for (var z = 0; z < cartList[i].list.length; z++) {
						if (cartList[i].list[z].cartDescId == id) {
							if (cartList[i].list[z].type)
								cartList[i].list[z].number = number;
						}
					}
				}
				refCart();
			} else {
				toast('数据通讯发生错误');
			}
		}
	});
}

function checkProduct(type, id, shopId) {
	var isCheck = false;
	switch(type) {
		case 0:
			if ($('#checkAll').prop('checked')) {
				isCheck = 0;
			} else {
				isCheck = 1;
			}
			break;
		case 1:
			if ($('#cartShop' + id).prop('checked')) {
				isCheck = 0;
			} else {
				isCheck = 1;
			}
			break;
		case 2:
			if ($('#cartProduct' + id).prop('checked')) {
				isCheck = 0;
			} else {
				isCheck = 1;
			}
			break;
	}
	var newType = type + 1;
	var url = 'cart/checkCart.do';
	var bodyParam = {
		body : {
			type : newType,
			id : id,
			isCheck : isCheck
		}
	};
	ajaxRequest2(url, bodyParam, function(ret, err) {

		if (err) {
			toast('数据通讯发生错误');
		} else {
			if (ret.code == 1) {
			
				switch(type) {
					case 0:
						if ($('#checkAll').prop('checked')) {
							$('#checkAll').prop('checked', false);
							$('.checkBox' + id).prop('checked', false);
							$('.cartShop').prop('checked', false);
							for (var i = 0; i < cartList.length; i++) {
								for (var z = 0; z < cartList[i].list.length; z++) {

									cartList[i].list[z].isCheck = 0;

								}
							}
						} else {
							$('#checkAll').prop('checked', true);
							$('.checkBox' + id).prop('checked', true);
							$('.cartShop').prop('checked', true);
							for (var i = 0; i < cartList.length; i++) {
								for (var z = 0; z < cartList[i].list.length; z++) {
									cartList[i].list[z].isCheck = 1;

								}
							}
						}
						break;
					case 1:
						if ($('#cartShop' + id).prop('checked')) {
							if ($('#checkAll').prop('checked')) {
								$('#checkAll').prop('checked', false);
							}
							$('#cartShop' + id).prop('checked', false);
							$('.cartShop' + id).prop('checked', false);
							for (var i = 0; i < cartList.length; i++) {
								if (cartList[i].shopId == shopId) {
									for (var z = 0; z < cartList[i].list.length; z++) {
										cartList[i].list[z].isCheck = 0;
									}
								}
							}
						} else {
							$('#cartShop' + id).prop('checked', true);
							$('.cartShop' + id).prop('checked', true);
							for (var i = 0; i < cartList.length; i++) {
								if (cartList[i].shopId == shopId) {
									for (var z = 0; z < cartList[i].list.length; z++) {
										cartList[i].list[z].isCheck = 1;
									}
								}
							}
							var allFlag = true;
							$(".checkBox").each(function() {
								if (!$(this).prop('checked')) {
									allFlag = false;
								}
							});
							if (allFlag) {
								$('#checkAll').prop('checked', true);
							}
						}
						break;
					case 2:
						if ($('#cartProduct' + id).prop('checked')) {
							$('#cartProduct' + id).prop('checked', false);
							if ($('#checkAll').prop('checked')) {
								$('#checkAll').prop('checked', false);
							}
							if ($('#cartShop' + shopId).prop('checked')) {
								$('#cartShop' + shopId).prop('checked', false);
							}
							for (var i = 0; i < cartList.length; i++) {
								for (var z = 0; z < cartList[i].list.length; z++) {
									if (cartList[i].list[z].cartDescId == id) {
										cartList[i].list[z].isCheck = 0;
									}
								}
							}
						} else {
							$('#cartProduct' + id).prop('checked', true);
							for (var i = 0; i < cartList.length; i++) {
								for (var z = 0; z < cartList[i].list.length; z++) {
									if (cartList[i].list[z].cartDescId == id) {
										cartList[i].list[z].isCheck = 1;
									}
								}
							}
							var flag = true;
							var allFlag = true;
							$(".cartShop" + shopId).each(function() {
								if (!$(this).prop('checked')) {
									flag = false;
								}
							});
							$(".checkBox").each(function() {
								if (!$(this).prop('checked')) {
									allFlag = false;
								}
							});
							if (flag) {
								$('#cartShop' + shopId).prop('checked', true);
							}
							if (allFlag) {
								$('#checkAll').prop('checked', true);
							}
						}
						break;
				}
				refCart();
			} else {
				toast('数据通讯发生错误');
			}
		}
	});
}

//刷新购物车
function refCart() {
	var allMoney = 0;
	for (var i = 0; i < cartList.length; i++) {
		var shopMoney = 0;
		for (var z = 0; z < cartList[i].list.length; z++) {
			if (cartList[i].list[z].isCheck == 1 && cartList[i].list[z].type == 1) {
				allMoney += cartList[i].list[z].number * cartList[i].list[z].preferentialPrice;
				shopMoney += cartList[i].list[z].number * cartList[i].list[z].preferentialPrice;
			}
		}
		$('#shopMoney' + cartList[i].shopId).html('￥' + formatterNumber(shopMoney));
	}
	$('#totalPrice').html('￥' + formatterNumber(allMoney));
}

//提交购物车
function submitCart() {
	addressInfo = getCacheData("addressData");

	if (isNotNull(addressInfo)) {
		var url = 'cart/submitCart.do';
		var bodyParam = {
			body : {
				province : addressInfo.province,
				city : addressInfo.city
			}
		};

		ajaxRequest(url, bodyParam, function(ret, err) {

			if (err) {
				toast('数据通讯发生错误');
			} else {

				if (ret.code == 1 && ret.cartList.length > 0) {

					var jsonData = {};
					jsonData.sourceType = 2;

					for (var i = 0; i < ret.cartList[0].list.length; i++) {
				
						if (ret.cartList[0].list[i].type == 0) {
							ret.cartList[0].list.splice(i, 1)

						}

					}

					jsonData.info = ret;

					openWinNew('cartorder', '确认订单', {}, jsonData, true);
				} else if (ret.code == 1 && ret.cartList.length < 1) {
					toast('购物车内商品数量为空');
				} else {
					toast('数据通讯发生错误');
				}
			}
		});
	} else {

		var data = {};
		data.source = 1;
		openWinNew('addresslist', '收货地址', {}, data, true);
	}
}

//进入店铺
function goShop(shopId, shopName) {

	var data = {};
	data.shopId = shopId;
	data.shopName = shopName;
	var fun = new Array({
		"iconPath" : "../icon/search.png"
	});
	openWinNew("shopdetail", shopName, fun, data);
}

//选择被删除
function checkEditProduct(type, id, shopId) {
	switch(type) {
		case 0:
			if ($('#editcheckAll').prop('checked')) {
				delArray = new Array();
				$('.editCheckList').prop('checked', false);
				$('#editcheckAll').prop('checked', false)
			} else {
				delArray = new Array();
				$('.editCheckList').prop('checked', true);
				$('#editcheckAll').prop('checked', true)
				for (var i = 0; i < cartList.length; i++) {
					for (var z = 0; z < cartList[i].list.length; z++) {
						delArray.push(cartList[i].list[z].cartDescId);
					}
				}
			}
			break;
		case 1:
			if ($('#editcartShop' + id).prop('checked')) {
				for (var i = 0; i < cartList.length; i++) {
					if (cartList[i].shopId == id) {
						for (var z = 0; z < cartList[i].list.length; z++) {
							if ($.inArray(cartList[i].list[z].cartDescId, delArray) >= 0) {
								delArray.splice($.inArray(cartList[i].list[z].cartDescId, delArray), 1);
								$('#editcartProduct' + cartList[i].list[z].cartDescId).prop('checked', false);
							}
						}
					}
				}
				$('#editcartShop' + id).prop('checked', false)
			} else {
				for (var i = 0; i < cartList.length; i++) {
					if (cartList[i].shopId == id) {
						for (var z = 0; z < cartList[i].list.length; z++) {
							if ($.inArray(cartList[i].list[z].cartDescId, delArray) < 0) {
								delArray.push(cartList[i].list[z].cartDescId);
								$('#editcartProduct' + cartList[i].list[z].cartDescId).prop('checked', true);
							}
						}
					}
				}
				var flag = true;
				for (var i = 0; i < cartList.length; i++) {
					for (var z = 0; z < cartList[i].list.length; z++) {
						if ($.inArray(cartList[i].list[z].cartDescId, delArray) < 0) {
							flag = false;
							shopFlag = false;
						}
					}
				}
				if (flag) {
					$('#editcheckAll').prop('checked', true)
				}
				$('#editcartShop' + id).prop('checked', true)
			}
			break;
		case 2:
			if ($('#editcartProduct' + id).prop('checked')) {
				$('#editcartProduct' + id).prop('checked', false)
				var index = $.inArray(id, delArray);
				if (index >= 0) {
					delArray.splice(index, 1);
				}
				if ($('#editcheckAll').prop('checked')) {
					$('#editcheckAll').prop('checked', false)
				}
				if ($('#editcartShop' + shopId).prop('checked')) {
					$('#editcartShop' + shopId).prop('checked', false)
				}
			} else {
				$('#editcartProduct' + id).prop('checked', true)
				var index = $.inArray(id, delArray);
				if (index < 0) {
					delArray.push(id);
				}
				var flag = true;
				for (var i = 0; i < cartList.length; i++) {
					var shopFlag = true;
					for (var z = 0; z < cartList[i].list.length; z++) {
						if ($.inArray(cartList[i].list[z].cartDescId, delArray) < 0) {
							flag = false;
							shopFlag = false;
						}
					}
					if (shopFlag) {
						$('#editcartShop' + cartList[i].shopId).prop('checked', true)
					}
				}
				if (flag) {
					$('#editcheckAll').prop('checked', true)
				}
			}
			
			break;
	}
}

function delCart() {
	
	var str = delArray.join(',');
	if (delArray.length == 0) {
		toast('请选择您要删除的商品');
		return;
	}
	hui.confirm('亲，确定要删除该商品吗？', ['取消', '确认'], function() {
		var url = 'cart/deleteCart.do';
		var bodyParam = {
			body : {
				ids : str
			}
		}
		ajaxRequest2(url, bodyParam, function(ret, err) {

			if (err) {
				toast('服务器发生异常');
			} else {
				if (ret.code == 1) {
					toast('删除成功');
					reloadCart();
					if (cartList.length == 0) {
						$('#calPanel').hide();
					}
				} else {
					toast('服务器发生异常');
				}
			}
		});
	})
}

function outGood(val) {
	if (val) {
		toast("店铺商品库存不足");
	} else {
		toast("商品库存不足");
	}
}