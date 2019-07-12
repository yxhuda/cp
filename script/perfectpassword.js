var jsonData;
apiready = function(){
	jsonData = api.pageParam;
	init();
}

function init(){
var url = 'sys/sendCode.do';
	var bodyParam = {
		body:{
			"phone" : jsonData.phone,
			"type":1
		}
	};
	ajaxRequest2(url,bodyParam, function(ret, err) {
		if(err){
			_d(err);
		}else{
			if (ret.code==1) {
				toast("发送成功");
			} else {
				toast(ret.msg);
			}
		}
	});
}

function submit(){
	var code = $("#code").val();
	if (!isNotNull(code)) {
		toast('请输入验证码');
		return;
	}
	var url = 'sys/verifyCode.do';
	var bodyParam = {
		body:{
			"phone" : jsonData.phone,
			"code" : code,
			"type" : 1
		}
	};
	ajaxRequest2(url, bodyParam, function(ret, err) {
		if (ret.code == 1) {
			bindingSubmit();
		} else {
			toast(ret.msg);
		}
	});
}

function bindingSubmit(){
	var code = $("#code").val();
	var password = $("#password").val();
	var repassword = $("#repassword").val();
	if (!isNotNull(password)) {
		toast('请输入密码');
		return;
	}
	if (!isNotNull(repassword)) {
		toast('请确认密码');
		return;
	}
	if (repassword != password) {
		toast('密码确认不正确');
		return;
	}
	
	
}