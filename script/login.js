apiready = function() {
	api.addEventListener({
		name : 'closeLogin'
	}, function(ret, err) {
		api.closeWin({
			name : 'login'
		});
	});
	var wx = api.require('wx');
	wx.isInstalled(function(ret, err) {
		if (!ret.installed) {
			$("#wx").hide();
		}else{
			$("#wx").show();
		} 
	});
}


/***
 *登录提交操作
 */
function login() {
	var phone = $("#phone").val();
	var password = $("#password").val();
	if (!isNotNull(phone)) {
		toast('请输入手机号');
		return;
	}
	if (!checkPhone(phone)) {
		toast('请输入正确手机号');
		return;
	}
	if (!isNotNull(password)) {
		toast('请输入密码');
		return;
	}
	var url = 'sys/login.do';
	var bodyParam = {
		body : {
			"phone" : phone,
			"pwd" : password,
		}
	};
	showProgress();
	ajaxRequest2(url, bodyParam, function(ret, err) {
		hideProgress();
		if(err){
			_d(err);
		}else{
			if (ret.code == 1 ) {
				setUser(ret.member);
				api.sendEvent({
					name : 'loginsuccess'
				});
				toast("登录成功");
	
				api.sendEvent({
					name : 'goCenter',
					extra : {
						num : 0
					}
				});
				api.closeToWin({
					name : 'root'
				}); 
			}else{
				toast(ret.msg);
			}
		}
		
	});
}

/**
 *微信登录
 */

function loginByWx() {
	api.showProgress({
		title : '正在登录',
		modal : true
	});
	var wx = api.require('wx');
	wx.isInstalled(function(ret, err) {
		api.hideProgress();
			
		if (ret.installed) {
		
			wx.auth({
				apiKey : 'wx6f5ac7bf7832b6a2'

			}, function(auth_ret, auth_err) {
				if (auth_ret.status) {

					wx.getToken({
						apiKey : 'wx6f5ac7bf7832b6a2',
						apiSecret : '51d35016f16440c4d141aeaad30ad0e4',
						code : auth_ret.code

					}, function(token_ret, token_err) {
						if (token_ret.status) {
							loginByOther(token_ret.openId, function(ret2, err2) {
								if (ret2.code!=1) {
									wx.getUserInfo({
										accessToken : token_ret.accessToken,
										openId : token_ret.openId
									}, function(ret3, err3){
										if (token_ret.status) {
											openWinNew('verifymobile', '绑定手机号', {}, ret3);
										}
									});

								}
							});
						}
					});
				} else {
					toast('微信授权失败，请同意授权后使用');
					api.hideProgress();
				}
			});
		} else {
			api.alert({
		        msg:'抱歉，您尚未安装微信客户端'
		    });
			//toast('请先安装微信客户端');
		}
	});
}

function loginByOther(code, callBack) {
	var url = 'sys/login.do';
	var bodyParam = {
		body : {
			wxId : code
		}
	};

	ajaxRequest2(url, bodyParam, function(ret, err) {
		api.hideProgress();
		if (err) {
			_d(err);
		} else {
		
			if(ret.code==1){
				setUser(ret.member);
				api.sendEvent({
					name : 'loginsuccess'
				});
//				toast("登录成功");
				api.sendEvent({
					name : 'goCenter',
					extra : {
						num : 0
					}
				});
				api.closeToWin({
					name : 'root'
				}); 
			}else{
				callBack(ret, err);
			}
		}
	});
}
