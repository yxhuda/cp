var menu1 = ['拍照', '从相册中选择'];
//储存变量
var picFlag;
var isPic1;
var isPic2;
var idpic = ['', ''];
var shopName;
//店铺名称
var shopBusiness;
//经营范围
var shopContact;
//店铺联系人
var shopContactphone;
//联系电话
//var shopEmail;
//电子邮箱
var shopIdcard;
//身份证号
var shopPositive;
//身份证正面
var shopReverse;
//身份证反面
var status;
var user;
var datas;

apiready = function() {

	datastatus = 2;

	user = getUser();
	$("input[name='shopContactphone']").val(user.phone)
	api.addEventListener({
		name : 'uploadHeader'
	}, function(ret, err) {

		if (ret.value.header != '') {
			idpic[picFlag - 1] = ret.value.header;
			$('#idpic' + picFlag).attr('src', ret.value.header);
			if (picFlag == 1) {
				isPic1 = 1;
			} else {
				isPic2 = 1;
			}
		}
	
	});
	init();
}
function init() {

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
				if (ret.status == 2) {
					datas = ret.shop
					if (ret.shop.isPersonal == 1) {
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
//							//电子邮箱
							$("#shopIdcard").val(datas.idNumber);
							//身份证号
							//						$("#idpic1").attr("src",datas.idImg1);
							//						//身份证正面
							//						$("#idpic2").attr("src",datas.idImg2);
							//						//身份证反面
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
			shopName : $("#shopName").val(),
			phone : $("#shopContactphone").val()
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

function setFeedback() {
	shopName = $("#shopName").val();
	//店铺名称
	shopBusiness = $("#shopBusiness").val();
	//经营范围
	shopContact = $("#shopContact").val();
	//店铺联系人
	shopContactphone = $("#shopContactphone").val();
	//联系电话
//	shopEmail = $("#shopEmail").val();
	//电子邮箱
	shopIdcard = $("#shopIdcard").val();
	//身份证号
	shopPositive = $("#shopPositive").val();
	//身份证正面
	shopReverse = $("#shopReverse").val();
	//身份证反面
	if (!isNotNull(shopName)) {
		toast("请输入店铺名称");
		return;
	}

	if (!isNotNull(shopBusiness)) {
		toast("请输入经营范围");
		return;
	}
	if (!isNotNull(shopContact)) {
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
//	if (!isNotNull(shopEmail)) {
//		toast('请输入电子邮箱');
//		return;
//	}
//	if (!checkEmail(shopEmail)) {
//		toast('请输入正确电子邮箱');
//		return;
//	}
	if (!isNotNull(shopIdcard)) {
		toast('请输入身份证号');
		return;
	}
	if (shopIdcard.length!=18) {
		toast('请输入正确身份证号');
		return;
	}

	if (!isPic1) {
		toast('请上传身份证正面');
		return;
	}
	if (!isPic2) {
		toast('请上传身份证反面');
		return;
	}

	api.showProgress({
		title : '正在提交...',
		modal : true
	});

	submit()
}

function uploadPhoto(val) {
	picFlag = val;
	var orcidcard = api.require('orcidcard');
	if (picFlag == 1) {
		orcidcard.frontIdCard({
		}, function(ret, err) {
			if (ret.status) {
				$('#shopIdcard').val(ret.data.cardnum);
				$('#shopContact').val(ret.data.name);
				uploadPic(ret.data.imagePath);
			} else {
				toast('身份证不正确');
			}
		});
	} else {
		orcidcard.backIdCard({
		}, function(ret, err) {
			if (ret.status) {
				uploadPic(ret.data.imagePath);
			} else {
				toast('身份证不正确');
			}
		});
	}
}

function uploadPic(path) {
	api.showProgress({
		title : '正在上传',
		modal : true
	});

	uploadImg(path);
}

var isclick = true;
function submit() {
	if (isclick) {
		isclick = false;
		shopName = $("#shopName").val();
		//店铺名称
		shopBusiness = $("#shopBusiness").val();
		//经营范围
		shopContact = $("#shopContact").val();
		//店铺联系人
		shopContactphone = $("#shopContactphone").val();
		//联系电话
//		shopEmail = $("#shopEmail").val();
		//电子邮箱
		shopIdcard = $("#shopIdcard").val();
		//身份证号
		shopPositive = $("#shopPositive").attr("src");
		//身份证正面
		shopReverse = $("#shopReverse").attr("src");
		//身份证反面
		var url = "shop/shopSave.do";
		var bodyParam = {};
		bodyParam = {
			body : {
				isPersonal : 1,
				shopName : shopName,
				businessCategory : shopBusiness,
				contactPerson : shopContact,
				contactPhone : shopContactphone,
//				email : shopEmail,
				idNumber : shopIdcard,
				idImg1 : idpic[0],
				idImg2 : idpic[1],
			}
		};
		//	}else{
		//		bodyParam = {
		//			body:{
		//				shopName:shopName,
		//				businessCategory:shopBusiness,
		//				contactPerson:shopContact,
		//				contactPhone:shopContactphone,
		//				email:shopEmail,
		//				idNumber:shopIdcard,
		//				idImg1:shopPositive,
		//				idImg2:shopReverse,
		//			}
		//		};

		ajaxRequest2(url, bodyParam, function(ret, err) {
			api.hideProgress();
			if (err) {
				_d(err);
			} else {
				if (ret.code == 1) {
					
					toast(ret.msg);
					//返回首页

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