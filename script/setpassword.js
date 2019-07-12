apiready = function() {	
	api.addEventListener({
		name : 'closeSetpassword'
	}, function(ret, err) {
		api.closeWin({
			name : 'setpassword'
		});
	});
	 
}

//注册提交
function regist() {
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
	showProgressNew('正在提交','请稍后....');
	var url = 'sys/register.do';
	var data = api.pageParam;
	var bodyParam = {};
	if(data.isWx == 1){
		bodyParam = {
			body : {
				"phone" : data.phone,
				"pwd" : password,
				"confirmPassword":repassword,
				"wxId" : data.openid,
				isWx:data.isWx,
				realName:data.nickname,
				header:data.headimgurl,
				sex:data.sex,
			}
		};
	}else{
		bodyParam = {
			body : {
				"phone" : data.phone,
				"pwd" : password,
				"confirmPassword":repassword,
				isWx:data.isWx
			}
		};
	}

	ajaxRequest2(url, bodyParam, function(ret, err) {
		
	     hideProgress();
		if(err){
			_d(err);
		}else{
			
			if (ret.code == 1) {
//				toast(ret.msg);
				setUser(ret.member);
				
//				api.closeWin({
//              	name:"login"
//              });
//              api.closeWin({
//              	name:"register"
//              });
             
//             	if(data.isWx==1){
//            		api.closeWin({
//	                	name:"verifymobile"
//	                });
//			     }
			     api.sendEvent({
	               name:'loginsuccess'
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
//			     api.closeWin();
			} else if(ret.code == 2){
//				toast(ret.msg);
				setUser(ret.member);
//				api.closeWin({
//              	name:"login"
//              });
//				api.closeWin({
//              	name:"register"
//              });
//              if(data.isWx==1){
//            		api.closeWin({
//	                	name:"verifymobile"
//	                });
//			     }
//             api.closeWin();
			
			
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

