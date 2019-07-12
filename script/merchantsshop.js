var menu1 = ['拍照', '从相册中选择'];
var idpic;
var isPic = 0;
var status;
var user;
var datas;
var classInfo;
var arr;
var jsonClassData;
//选择器数据
var UIMultiSelector;
var selectparentId = 0;
//默认选择的一级分类
apiready = function() {

	datastatus = 2;
	user = getUser();
	$("input[name='shopContactphone']").val(user.phone)

	api.addEventListener({
		name : 'uploadHeader'
	}, function(ret, err) {

		if (ret.value.header != '') {
			if (ret.value.type != 'idpic1') {
				$('#contentimg' + ret.value.type).val(ret.value.header);
			} else {
				idpic = ret.value.header
			}

		}
	});
	init();

}
function init() {
	UIMultiSelector = api.require('UIMultiSelector');
	showLoading();
	var url = 'shop/checkShop.do';
	var bodyParam = {
		body : {}
	};
	ajaxRequest(url, bodyParam, function(ret, err) {
		hideLoading();
		if (err) {
			_d(err);
		} else {
			if (ret.code == 1) {
				getShopClass();
				if (ret.status == 2) {
					datas = ret.shop

					if (ret.shop.isPersonal == 2) {
						if (datastatus == 2) {
							$("#shopName").val(datas.shopName);
							//店铺名称
							$("#shopBusiness").val(datas.businessCategory);
							//经营范围
							$("#shopContact").val(datas.contactPerson);
							//店铺联系人
							$("#shopContactphone").val(datas.contactPhone);
							//联系电话
							//							$("#shopEmail").val(datas.email);
							//电子邮箱
							$("#shopIdcard").val(datas.idNumber);
							//身份证号
							$("#idpic1").attr("src", datas.businessLicense);
							//						//营业执照
							if (isNotNull(datas.type)) {
								selectparentId = datas.type;
								idpic = datas.businessLicense;
								isPic = 1;
							}
						}
					}

				}

			}
		}
	});
}

//判断店铺名是否被占用
function message() {
	var url = 'shop/checkShop.do';
	var bodyParam = {
		body : {
			shopName : $("#shopName").val()
		}
	};
	ajaxRequest(url, bodyParam, function(ret, err) {
		if (err) {
			_d(err);
		} else {
			if (ret.code == 1) {
				status = ret.status;
				if (status == 5) {
					alert("店铺名称已占用,请重新输入店铺名")
				} else if (status == 7) {
					alert("电话号码已占用,请重新输入电话号码")
				}
			}
		}
	});

}

function getShopClass() {
	var url = 'cpshopclass/list.do';
	var bodyParam = {
		body : {}
	};
	ajaxRequest(url, bodyParam, function(ret, err) {

		hideLoading();
		if (err) {
			_d(err);
		} else {
			
			if (ret.code == 1) {
				arr = Array();
				classInfo = ret.data;
				
				if (isNotNull(datas) && isNotNull(datas.type)) {
					getHtml(datas.type);
				}
			
				for (var i = 0; i < ret.data.length; i++) {
					
					if (ret.data[i].id == selectparentId) {
						$("#shopClass").val(ret.data[i].className);
					}
					if(ret.data[i].isShow==1){
						var jsonData = {};
						jsonData.text = ret.data[i].className;
						jsonData.textid = ret.data[i].id;
						if (ret.data[i].id == selectparentId) {
							jsonData.status = 'selected';
						} else {
							jsonData.status = 'normal';
						}
						arr.push(jsonData);
					}
				}
			}

		}
	});

}

function show() {

	UIMultiSelector.open({
		rect : {
			h : 244
		},
		text : {
			leftBtn : '取消',
			rightBtn : '确定'

		},
		max : 1,
		singleSelection : true,
		maskClose : true,
		styles : {
			mask : 'rgba(100,100,100,0.4)',
			title : {
				bg : '#f5f5f5',
				color : 'rgb(0,0,0)',
				size : 16,
				h : 44
			},
			leftButton : {
				w : 80,
				h : 35,
				marginT : 5,
				marginL : 8,
				color : 'rgb(0,0,0)',
				bg : 'rgb(200,200,200)',
				size : 14,
			},
			rightButton : {
				w : 80,
				h : 35,
				marginT : 5,
				marginR : 8,
				color : 'rgb(0,0,0)',
				bg : '#ffd40d',
				size : 14,
			},
			item : {
				h : 44,
				bg : '#fff',
				bgActive : '#ffd40d',
				bgHighlight : '#ffd40d',
				color : 'rgb(0,0,0)',
				active : 'rgb(255,255,255)',
				highlight : 'rgb(255,255,255)',
				size : 14,
				lineColor : 'rgb(200,200,200)',
				textAlign : 'center',
			}
		},
		animation : true,
		items : arr
	}, function(ret, err) {
		if (ret.eventType == 'clickLeft' || ret.eventType == 'clickRight') {
			UIMultiSelector.hide();
		}
		if (ret.eventType == 'clickRight') {
			value = ret.items[0];
			$("#shopClass").val(value.text);

			getHtml(value.textid);
		}
	});
}

function getHtml(classId) {
	var html = '';
	selectparentId = '';
	jsonClassData = '';
	for (var i = 0; i < classInfo.length; i++) {
		if (classInfo[i].id == classId) {
			selectparentId = classId;
			jsonClassData = classInfo[i].cpClassLabelList;
		}
	}

	for (var j = 0; j < jsonClassData.length; j++) {
		if (jsonClassData[j].type == 1) {
			html += '<div class="personalshop-list">';
			html += '<div class="personalshop-title">' + jsonClassData[j].content + '</div>';
			html += '<div class="personalshop-content">';
			html += '<input style="width:80%" type="text" name="content' + jsonClassData[j].id + '" id="content' + jsonClassData[j].id + '"  value="" placeholder="请输入' + jsonClassData[j].content + '"/>';
			html += '</div>';
			html += '</div>';
		} else if (jsonClassData[j].type == 2) {
			html += '<div class="personalshop-listnew">';
			html += '<div class="listnew-title">' + jsonClassData[j].content + '</div>';
			html += '<div class="listnew-content">';
			html += '<input type="hidden" name ="contentimg' + jsonClassData[j].id + '" id="contentimg' + jsonClassData[j].id + '" >';
			html += '<div class="card-positive" tapmode="" onclick="uploadPhoto(\'' + jsonClassData[j].id + '\')">';
			html += '<img src="../img/enterprise.png" id="content' + jsonClassData[j].id + '" style="width: 90%;height: 350px;"/>';
			html += '</div>';
			html += '<p>上传' + jsonClassData[j].content + '</p>';
			html += '</div>';
			html += '</div>';
		}
	}
	$("#classHtml").html(html);
	api.parseTapmode();
	
	if (isNotNull(datas) && isNotNull(datas.type) && classId == datas.type) {
		
		for (var k = 0; k < jsonClassData.length; k++) {
			if(isNotNull(datas["label" + (k + 1)])){
				var classArr = datas["label" + (k + 1)].split(',');
				if (classArr[1] == '1') {
					if (isNotNull(classArr[3])) {
						$("#content" + classArr[0]).val(classArr[3]);
					}
				} else {
					if (isNotNull(classArr[3])) {
						$("#contentimg" + classArr[0]).val(classArr[3]);
						$("#content" + classArr[0]).attr("src", classArr[3]);
					}
				}
			}
		}
	}
}

function setFeedback() {
	var shopName = $("#shopName").val();
	//店铺名称
	var shopBusiness = $("#shopBusiness").val();
	//经营范围
	var shopContact = $("#shopContact").val();
	//店铺联系人
	var shopContactphone = $("#shopContactphone").val();
	//联系电话
	//	var shopEmail = $("#shopEmail").val();
	//电子邮箱
	var shopIdcard = $("#shopIdcard").val();
	//身份证号
	//var shopBusinesslicense = $("#shopBusinesslicense").val();
	//营业执照
	if (!isNotNull(shopName) && !isNotNull(shopName)) {
		toast("请输入店铺名称");
		return;
	}
	if (!isNotNull(shopBusiness) && !isNotNull(shopBusiness)) {
		toast("请输入经营范围");
		return;
	}
	if (!isNotNull(shopContact) && !isNotNull(shopContact)) {
		toast("请输入店铺联系人");
		return;
	}

	if (!isNotNull(shopContactphone)) {
		toast('请输入手机号');
		return;
	}
	if (!checkPhone(shopContactphone)) {
		toast('请输入正确手机号');
		return;
	}

	if (!isNotNull(shopIdcard)) {
		toast('请输入身份证号');
		return;
	}
	if (shopIdcard.length!=18) {
		toast('请输入正确身份证号');
		return;
	}
	if (selectparentId < 1) {
		toast("请选择商家分类");
		return false;
	}
	if (isPic == 0) {
		toast('请上传营业执照');
		return;
	}

	for (var i = 0; i < jsonClassData.length; i++) {
		var val = '';
		if (jsonClassData[i].type == '1') {
			val = $("#content" + jsonClassData[i].id).val();
			if (!isNotNull(val)) {
				toast('请输入' + jsonClassData[i].content);
				return false;
			}
		} else if (jsonClassData[i].type == '2') {
			val = $("#contentimg" + jsonClassData[i].id).val();
			if (!isNotNull(val)) {
				toast('请上传' + jsonClassData[i].content);
				return false;
			}
		}
	}

	api.showProgress({
		title : '正在提交...',
		modal : true
	});
	submit();
}

function uploadPhoto(name) {
	api.actionSheet({
		cancelTitle : '取消',
		buttons : menu1
	}, function(ret, err) {
		var index = ret.buttonIndex;
		if (index == 1) {
			openCamera(function(ret, err) {
				if (isNotNull(ret)) {
					if (isNotNull(ret.data))
						if (name != 'idpic1') {
							$('#content' + name).attr('src', ret.data);
						} else {
							$('#' + name).attr('src', ret.data);
						}
					isPic = 1;
					//openImageClipFrame(ret.data);
					uploadPic(ret.data, name)
				}
			});
		} else if (index == 2) {
			openAlbum(function(ret, err) {
				if (isNotNull(ret)) {
					if (isNotNull(ret.data)) {
						if (name != 'idpic1') {
							$('#content' + name).attr('src', ret.data);
						} else {
							$('#' + name).attr('src', ret.data);
						}
						isPic = 1;
						uploadPic(ret.data, name)
					}
				}

			});
		}
	});
}

function uploadPic(path, name) {
	api.showProgress({
		title : '正在上传',
		modal : true
	});
	uploadImg(path, name);
}

var isclick = true;
function submit() {

	if (isclick) {
		//		isclick = false;
		var shopName = $("#shopName").val();
		//店铺名称
		var shopBusiness = $("#shopBusiness").val();
		//经营范围
		var shopContact = $("#shopContact").val();
		//店铺联系人
		var shopContactphone = $("#shopContactphone").val();
		//联系电话
		//		var shopEmail = $("#shopEmail").val();
		//		//电子邮箱
		var shopIdcard = $("#shopIdcard").val();

		//身份证号
		var shopBusinesslicense = idpic;
		//营业执照
		if (isNotNull(jsonClassData)) {
			var classArr = Array();
			for (var i = 0; i < jsonClassData.length; i++) {
				var str = '';
				if (jsonClassData[i].type == 1) {
					str = jsonClassData[i].id + ',' + jsonClassData[i].type + ',' + jsonClassData[i].content + ',' + $("#content" + jsonClassData[i].id).val();
				} else if (jsonClassData[i].type == 2) {
					str = jsonClassData[i].id + ',' + jsonClassData[i].type + ',' + jsonClassData[i].content + ',' + $("#contentimg" + jsonClassData[i].id).val();
				}
				classArr.push(str);
			}
		}
		var url = "shop/shopSave.do";
		var bodyParam = {};
		//	if(isNotNull(pics)){
		bodyParam = {
			body : {
				isPersonal : 2,
				shopName : shopName,
				businessCategory : shopBusiness,
				contactPerson : shopContact,
				contactPhone : shopContactphone,
				//				email : shopEmail,
				idNumber : shopIdcard,
				businessLicense : shopBusinesslicense,
				labelList : classArr,
				version : "0.0.1",
				type : selectparentId
			}
		};
		_d(bodyParam);
		ajaxRequest2(url, bodyParam, function(ret, err) {
			api.hideProgress();
			if (err) {
				_d(err);
			} else {
		
				if (ret.code == 1) {

					toast("提交成功");

					api.closeToWin({
						name : 'root'
					});

				} else {
					isclick = true;
					toast("提交失败");
					return false;
				}
			}
		})
	}
}

