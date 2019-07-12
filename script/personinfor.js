var user;
var menu1 = ['拍照', '从相册中选择'];
var menu2 = ['男', '女'];
var cancel = '';
var src;

apiready = function(){
	user = getUser();
	api.addEventListener({
		name : 'saveName'
	}, function(ret, err) {
		$("#realName").html(ret.value.realName);
		api.closeWin({
			name : 'name'
		});
	});
	api.addEventListener({
		name : 'saveAutograph'
	}, function(ret, err) {
		$("#autograph").html(ret.value.autograph);
		api.closeWin({
			name : 'autograph'
		});
	});
	api.addEventListener({
	    name:'uploadHeader'
    },function(ret,err){
    	
    	if(isNotNull(ret.value.header)){
    		setHeader(ret.value.header);
    	}else{
    		toast("修改失败");
    		return false;
    	}
    });
	init();
}

function init(){

	if(isNotNull(user.phone)){
		$("#phone").html(user.phone);
	}
	if(isNotNull(user.header)){
		$("#header").attr("src",user.header);
	}
	if(isNotNull(user.realName)){
		$("#realName").html(user.realName);
	}
	if(user.sex==1){
		$("#sex_text").html("男");
	}else if(user.sex==2){
		$("#sex_text").html("女");
	}else{
		$("#sex_text").html("请选择");
	}
	if(isNotNull(user.autograph)){
		$("#autograph").html(user.autograph);
	}
}

function setName(){
	
	var fun = new Array({"text":"保存"});
	openWinNew("name", '设置昵称', fun, {});
}

function setAutograph(){
	
	var fun = new Array({"text":"保存"});
	openWinNew("autograph", '设置签名', fun, {});
}	

function uploadPhoto() {
	api.actionSheet({
	    cancelTitle: '取消',
	    buttons: menu1
	}, function(ret, err) {
	    var index = ret.buttonIndex;
	    if(index==1){
	    	openCamera(function(ret, err) {
	    		
	    		if (isNotNull(ret)){
	    			if (isNotNull(ret.data)){
						uploadPic(ret.data)
					}
	    		}		
			});
	    }else if(index==2){
	    	openAlbum(function(ret, err) {
	    			
				if (isNotNull(ret)){
					if (isNotNull(ret.data)) {
						uploadPic(ret.data)
					}
				}		
			});
	    }
	});

}

function openImageClipFrame(img_src) {
	
	api.openFrame({
		name : 'clipImage',
		scrollToTop : true,
		allowEdit : true,
		url : 'clipImage.html',
		rect : {
			x : 0,
			y : 0,
			w : api.winWidth,
			h : api.winHeight,
		},
		animation : {
			type : "reveal", //动画类型（详见动画类型常量）
			subType : "from_right", //动画子类型（详见动画子类型常量）
			duration : 300
		},
		pageParam : {
			img_src : img_src,
			winName : api.winName,
			frameName : api.frameName
		},
		vScrollBarEnabled : false,
		hScrollBarEnabled : false,
		//页面是否弹动 为了下拉刷新使用
		bounces : false
	});
}

function uploadPic(path) {
	
	api.showProgress({
		title : '正在上传',
		modal : true
	});
	uploadImg(path);
}

function chooseSex() {
	api.actionSheet({
	    cancelTitle: '取消',
	    buttons: menu2
	}, function(ret, err) {
	    var index = ret.buttonIndex;
	    if(index<=menu2.length){
	    	setSex(index);
	    }
	});
}


function setSex(sex){
	var url = "member/update.do";
	var bodyParam = {
		body:{
			sex:sex
		}
	};
	ajaxRequest2(url,bodyParam,function(ret,err){
		
		if(err){
			_d(err);
		}else{
			if(ret.code==1){
				getUserUpdate();
				api.sendEvent({
	                name:'updateUser'
                });
				if(sex==1){
					$("#sex_text").html("男");
				}else if(sex==2){
					$("#sex_text").html("女");
				}else{
					$("#sex_text").html("请选择");
				}
			}else{
				toast("修改失败");
			}
		}
	});
}

//修改头像
function setHeader(header){
	var url = "member/update.do";
	var bodyParam = {
		body:{
			header:header
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
				    	header:header
				    }
                });
//              var url = isImgShow(header,function(ret){
//              	var src = ret.url;
//              
//              });
					$("#header").attr("src",header);
					toast("修改成功");
              	
			}else{
			
				toast("修改失败");
				return false;
			}
		}
	});
}