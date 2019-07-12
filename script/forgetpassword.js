var count = 60;
var st = "";
var istrue = false;
apiready = function() {
	api.addEventListener({
		name : 'closeForgetpassword'
	}, function(ret, err) {
		api.closeWin({
			name : 'forgetpassword'
		});
	});
	
}

//下一步操作
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
		body:{
			"phone" : phone,
			"code" : code,
			"type" : 2
		}
	};
	ajaxRequest2(url, bodyParam, function(ret, err) {
		if (ret.code == 1) {
			var data = {};
			data.phone = phone;
			data.isWx = 0;
			openWinNew('setforgetpassword', '设置密码', {}, data);
		} else {
			toast(ret.msg);
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
		body:{
			"phone" : phone,
			"type":2
		}
	};
	ajaxRequest2(url,bodyParam, function(ret, err) {
		if(err){
			_d(err);
		}else{
			
			if (ret.code==1) {
				st = setInterval('tiao()', 1000);
				toast("发送成功");
				istrue = true;
			} else {
				toast("发送失败");
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