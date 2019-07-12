var user;

apiready = function(){
	user = getUser();
	api.addEventListener({
	    name:'navitembtn'
    },function(ret,err){
    	setAutograph();
    });
	init();
}

function init(){
	
	if(isNotNull(user.autograph)){
		$("#autograph").val(user.autograph);
	}
}

function setAutograph(){
	var autograph = $("#autograph").val();

	if(!isNotNull(autograph)){
		toast("请输入签名");
		return false;
	}
//	if (autograph.length > 20)
//	{
//		toast('签名过长');
//		return;
//	}
	var url = "member/update.do";
	var bodyParam = {
		body:{
			autograph:autograph
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
				    	autograph:autograph
				    }
                });
				api.sendEvent({
				    name:'saveAutograph',
				    extra:{
				    	autograph:autograph
				    }
			    });
			}else{
				toast("修改失败");
			}
		}
	});
}