var userData;
var count = 60;
var st = "";
var istrue = false;
var td;
apiready = function() {
	
	userData = api.pageParam;
	api.addEventListener({
		name : 'navbackbtn'
	}, function(ret, err) {
		hui.confirm('登录授权还未完成，是否继续？', ['取消', '确定'], function() {
			return false;
		}, function() {
			closeWin();
		});
	});

	api.addEventListener({
		name : 'closeVerifymobile'
	}, function(ret, err) {

		closeWin();
	});
}
function nextStep() {
	var phone = $("#phone").val();
	var code = $("#code").val();
	if (!isNotNull(phone)) {
		toast('请输入手机号');
		return;
	}
	if (!checkPhone(phone)) {
		toast('请输入正确手机号');
		return;
	}
	if (!isNotNull(code)) {
		toast('请输入验证码');
		return;
	}
	var url = 'sys/verifyCode.do';
	var bodyParam = {
		body : {
			"phone" : phone,
			"code" : code,
			"type" : 3
		}
	};
	ajaxRequest2(url, bodyParam, function(ret, err) {
		if (ret.code == 1) {
			if (ret.status == 1) {
				bindingPhone();
			} else {
				
				userData.isWx = 1;
				userData.phone = phone;

				openWinNew('setpassword', '设置密码', {}, userData);
			}
		} else {
			toast("验证码不正确");
			return false;
		}
	});

}

function bindingPhone() {
	var phone = $("#phone").val();
	var url = "member/update.do";
	var bodyParam = {
		body : {
			wxId : userData.openid,
			phone : phone
		}
	}; 
	ajaxRequest2(url, bodyParam, function(ret, err) {
		if (err) {
			_d(err);
		} else {
			if (ret.code == 1) {
				setUser(ret.CpMemberDTO);
				api.sendEvent({
					name : 'loginsuccess'
				});
				api.sendEvent({
					name : 'goCenter',
					extra : {
						num : 0
					}
				});
				api.closeToWin({
					name : 'root'
				});
			} else {
				toast("绑定失败");
			}
		}
	});
}

function sendMsg() {
	if (istrue)
		return;
	var phone = $('#phone').val();
	if (phone == '') {
		toast("请输入手机号码");
		return;
	}
	if (!checkPhone(phone)) {
		toast("手机号码有误，请重填");
		return;
	}
	istrue = true;
	var url = 'sys/sendCode.do';
	var bodyParam = {
		body : {
			"phone" : phone,
			"type" : 3
		}
	};
	ajaxRequest2(url, bodyParam, function(ret, err) {
		if (err) {
			_d(err);
		} else {
		
			if (ret.code == 1) {
				st = setInterval('tiao()', 1000);
				toast("发送成功");
				istrue = true;
			} else {
				toast(ret.msg);
				istrue = false;
			}
		}
	});
}

function tiao() {
	var number = count--;
	$("#getCode").html(number + "S");
	if (number == 0) {
		clearInterval(st);
		$("#getCode").css("background-color", "");
		$("#getCode").css("border", "");
		$("#getCode").html("发送验证码");
		count = 60;
		istrue = false;
	}
}