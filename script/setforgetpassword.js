apiready = function() {	
	api.addEventListener({
		name : 'closeSetforgetpassword'
	}, function(ret, err) {
		api.closeWin({
			name : 'setforgetpassword'
		});
	});
}

//设置密码
function setForget() {
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
	var url = 'sys/forgetPassword.do';
	var data = api.pageParam;
	var bodyParam = {
			body : {
				"phone" : data.phone,
				"pwd" : password,
				"confirmPassword":repassword,
			}
		};
		
	ajaxRequest2(url, bodyParam, function(ret, err) {
	
		if(err){
			_d(err);
		}else{
			if (ret.code == 1) {
				toast("修改成功");
				setUser(null);
				api.closeWin({
                	name:"forgetpassword"
                });
               	api.closeWin();
			}else{
				toast(ret.msg);
			}
		}
	});
}

