var user;
apiready = function(){
	user = getUser();
	api.addEventListener({
	    name:'navitembtn'
    },function(ret,err){
    	setName();
    });
	init();
}

function init(){
	if(isNotNull(user.realName)){
		$("#realName").val(user.realName);
	}
}

function setName(){
	var realName = $("#realName").val();
	if(!isNotNull(realName)){
		toast("请输入昵称");
		return false;
	}
	if (realName.length > 10)
	{
		toast('昵称过长');
		return;
	}
	var url = "member/update.do";
	var bodyParam = {
		body:{
			realName:realName
		}
	};
	ajaxRequest2(url,bodyParam,function(ret,err){
		if(err){
			_d(err);
		}else{
		
			if(ret.code==1){
				getUserUpdate();
				api.sendEvent({
	                name:'updateUser',
	                extra:{
				    	realName:realName
				    }
                });
				api.sendEvent({
				    name:'saveName',
				    extra:{
				    	realName:realName
				    }
			    });
			}else{
				toast("修改失败");
			}
		}
	});
}