var addressList;
var selAddressId = 0;
var is_true = false;
var addressView;
var source = 0;
//1购买流程进入，0为正常进入
var td;
apiready = function() {
	source = api.pageParam.source;
	addressView = api.require('addressView');
	api.addEventListener({
		name : 'viewdisappear'
	}, function(ret, err) {
		
		api.sendEvent({
			name : 'orderSubmit'
			
		});
		api.sendEvent({
			name : 'goodsdetail'
		});
		api.sendEvent({
			name : 'groupgoodsdetail'
			
		});
		api.closeWin();
	});
	api.addEventListener({
		name : 'navbackbtn'
	}, function(ret, err) {
		
		api.sendEvent({
			name : 'orderSubmit'
		});
		api.sendEvent({
			name : 'goodsdetail'
		});
		api.sendEvent({
			name : 'groupgoodsdetail'
		});
		api.closeWin();
	});
	inits();
}
function inits() {
	showLoading();
	$('#preloader').remove();
	var url = "address/list.do";
	ajaxRequest(url, {}, function(ret, err) {
		hideLoading();
		if (err) {
			netError("inits");
		} else {
			if (ret.code == 1) {

				if (isNotNull(ret.address)) {

					addressList = ret.address;

					var html = '';
					html += '<div class="borderlink"></div>';
					for (var i = 0; i < addressList.length; i++) {
						if (addressList[i].isDefault == 1) {
							setCacheData("addressData", addressList[i]);
						}
						html += addressHtml(addressList[i]);
					}

					$("#addressListHtml").html(html);
					api.parseTapmode();
				} else {
					$("#addressListHtml").html('');
					empty('../img/no_address.png', '当前没有地址！');
				}
			} else {
				$("#addressListHtml").html('')
				empty('../img/no_address.png', '当前没有地址！');
			}
		}
	});
}

//打开添加/修改tab卡
function openAddAddress() {
	
	var defaultAdress = Array();
	 getDefaultAddress(function(ret){
	 	if(!isNotNull(ret)){
			defaultAdress = [110000,110100,110101];
		}else{
			defaultAdress = ret;
		}
		selAddressId = 0;
		$("#person").val('');
		$("#phone").val('');
		$("#Addr").val('');
		$("#address").val('');
		$(".addresslist-Bullet").attr("class", "addresslist-Bullets");
	
		addressView.open({
			file_addr : 'widget://res/addr.txt', //数据源地址
			selected_color : '#ff0000', //颜色
			pro_id : defaultAdress[0], //省id
			city_id : defaultAdress[1], //市id
			dir_id : defaultAdress[2] //区id
		});
	 });
	
	
}

//关闭添加/修改tab卡
function closeAddAddress() {
	$(".addresslist-Bullets").attr("class", "addresslist-Bullet");
	selAddressId = 0;

}

//编辑地址按钮
function editorAddress(id) {
	$(".addresslist-Bullet").attr("class", "addresslist-Bullets");
	selAddressId = id;
	for (var i = 0; i < addressList.length; i++) {
		if (addressList[i].id == id) {

			$("#provinceId").val(addressList[i].provinceId);
			$("#cityId").val(addressList[i].cityId);
			$("#areaId").val(addressList[i].areaId);
			$("#provance").val(addressList[i].province);
			$("#city").val(addressList[i].city);
			$("#area").val(addressList[i].area);
			$("#person").val(addressList[i].person);
			$("#phone").val(addressList[i].phone);
			$("#Addr").val(addressList[i].province + ' ' + addressList[i].city + ' ' + addressList[i].area);
			$("#address").val(addressList[i].address);

			addressView.open({
				file_addr : 'widget://res/addr.txt', //数据源地址
				selected_color : '#ff0000', //颜色
				pro_id : addressList[i].provinceId, //省id
				city_id : addressList[i].cityId, //市id
				dir_id : addressList[i].areaId //区id
			});
		}
	}

}

//添加地址按钮
function addressHtml(data) {
	var html = '';
	html += '<div class="addresslist-list" id="del_' + data.id + '">';
	if (source == 1) {
		html += '<div class="confirmorder" tapmode="" onclick="buySelectAddress(\'' + data.id + '\');">';
	} else {
		html += '<div class="confirmorder">';
	}
	html += '<div class="confirmorder-Positioning"><i class="icon iconfont iconlocation"></i></div>';
	html += '<div class="confirmorder-address center ">';
	html += '<div class="confirmorder-top"><span id="selperson_' + data.id + '">' + data.person + '</span><span id="selphone_' + data.id + '">' + data.phone + '</span>';
	html += '</div>';
	html += '<div class="confirmorder-bottom" id="selAddress_' + data.id + '">' + data.province + '&nbsp;' + data.city + '&nbsp;' + data.area + '&nbsp;' + data.address + '</div>';
	html += '</div>';
	html += '</div>';
	html += '<div class="addresslist-bottom">';
	html += '<div class="addresslistBottom-left">';
	if (data.isDefault == 1) {
		html += '<div class="isDefault zp-radios" tapmode="" id="isDefault_show' + data.id + '" onclick="setDefault();">';
		html += '<input type="checkbox" name="isDefault" id="" value="" checked="checked">';
		html += '<label for="z2"></label>设为默认';
		html += '</div>';
	} else {
		html += '<div class="zp-radioss" id="isDefault_show' + data.id + '" tapmode="" onclick="setDefault(\'' + data.id + '\');">';
		html += '<input type="checkbox" name="isDefault" id="isDefault_' + data.id + '" value="">';
		html += '<label for="z2"></label>设为默认';
		html += '</div>';
	}
	html += '</div>';
	html += '<div class="addresslistBottom-right">';
	html += '<div class="addresslistBottom-text" tapmode="" onclick="editorAddress(\'' + data.id + '\');"><i class="icon iconfont iconedit"></i>编辑</div>';
	html += '<div class="addresslistBottom-text" tapmode="" onclick="delAddress(\'' + data.id + '\');"><i class="icon iconfont iconshanchu"></i>删除</div>';
	html += '</div>';
	html += '</div>';
	html += '</div>';
	return html;
}

//删除地址按钮
function delAddress(id) {
	for (var i = 0; i < addressList.length; i++) {
		if (addressList[i].id == id) {
			if (addressList[i].isDefault == 1) {
				toast("默认地址不可删除");
				return;
			} else {
		
				var url = "address/delete.do";
				var bodyParam = {
					body : {
						id : id
					}
				};
				ajaxRequest(url, bodyParam, function(ret, err) {
					if (err) {
						_d(err);
						toast("删除失败");
					} else {
						if (ret.code == 1) {
							//$("#del_"+id).remove();
							inits();
							toast("删除成功");
						} else {
							toast("删除失败");
							return false;
						}
					}
				});

			}
		}
	}

}

//设为默认地址按钮
function setDefault(id) {

	for (var i = 0; i < addressList.length; i++) {
	if (addressList[i].id == id) {
			if (addressList[i].isDefault != 1) {
			
			var url = "address/default.do";
	var bodyParam = {
		body : {
			id : id
		}
	};
	ajaxRequest(url, bodyParam, function(ret, err) {
		if (err) {
			_d(err);
		} else {
			if (ret.code == 1) {
				$(".isDefault").removeClass("zp-radioss");
				$("#del_" + id).addClass("zp-radios");
				inits();
			} else {
				toast("默认设置失败");
				return false;
			}
		}
	});
		}
		}
	}
	

}

//添加提交
function submit() {
	if (is_true) {
		return;
	}
	var person = $("#person").val();
	var phone = $("#phone").val();
	var provance = $("#provance").val();
	var city = $("#city").val();
	var area = $("#area").val();
	var provinceId = $("#provinceId").val();
	var cityId = $("#cityId").val();
	var areaId = $("#areaId").val();
	var address = $("#address").val();
	if (!isNotNull(person)) {
		toast("请输入收货人姓名");
		return false;
	}
	if (!isNotNull(phone)) {
		toast("请输入收货人手机号");
		return false;
	}
	if (!checkPhone(phone)) {
		toast("手机号格式不正确");
		return false;
	}
	if (!isNotNull(provance)) {
		toast("请选择地址");
		return false;
	}
	if (!isNotNull(address)) {
		toast("请输入详细地址");
		return false;
	}
	is_true = true;
	var url = "";
	var bodyParam = {};
	if (selAddressId > 0) {
		url = "address/update.do";
		bodyParam = {
			body : {
				id : selAddressId,
				person : person,
				phone : phone,
				province : provance,
				city : city,
				area : area,
				provinceId : provinceId,
				cityId : cityId,
				areaId : areaId,
				address : address
			}
		};
	} else {
		url = "address/add.do";
		bodyParam = {
			body : {
				person : person,
				phone : phone,
				province : provance,
				city : city,
				area : area,
				provinceId : provinceId,
				cityId : cityId,
				areaId : areaId,
				address : address
			}
		};
	}

	ajaxRequest2(url, bodyParam, function(ret, err) {

		is_true = false;
		if (err) {
			_d(err);
		} else {
			if (ret.code == 1) {
				$(".addresslist-Bullets").attr("class", "addresslist-Bullet");

				inits();

			} else {
				if (selAddressId > 0) {
					toast("编辑失败");
					return false;
				} else {
					toast("添加失败");
					return false;
				}
			}
		}
	});
}

function selectAddress() {
	addressView.show({}, function(ret, err) {
		if (ret.status) {
			$("#provinceId").val(ret.data[0].id);
			$("#cityId").val(ret.data[1].id);
			$("#areaId").val(ret.data[2].id);
			$("#provance").val(ret.data[0].name);
			$("#city").val(ret.data[1].name);
			$("#area").val(ret.data[2].name);
			$("#Addr").val(ret.data[0].name + ' ' + ret.data[1].name + ' ' + ret.data[2].name);
		}
	});
}

function buySelectAddress(id) {
	var data = {};
	for (var i = 0; i < addressList.length; i++) {
		if (addressList[i].id == id) {
			data = addressList[i];
		}
	}
	api.sendEvent({
		name : 'selectAddress',
		extra : data
	});
	api.sendEvent({
			name : 'orderSubmit'
			
		});
		api.sendEvent({
			name : 'goodsdetail'
		});
		api.sendEvent({
			name : 'groupgoodsdetail'
			
		});
	closeWin();
}