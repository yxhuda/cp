var func;
var rightParam,rightParam1;
apiready = function() {

	var data = api.pageParam.data;
	if (isNotNull(data))
		if (data.frame == 'login') {
			api.addEventListener({
				name : 'keyback'
			}, function(ret, err) {
				api.sendEvent({
					name : 'closeIndex'
				});
			});
		}
	api.addEventListener({
		name : 'hideButton'
	}, function(ret, err) {
		if (ret.value.hide)
			$("#buttonOption").hide();
		else
			$("#buttonOption").show();
	});
	var header = $api.byId('header');
	$api.fixStatusBar(header);
	var headerH = $api.offset(header).h;
	$api.setStorage("headerWinH",headerH);
	var pageName = api.pageParam.pageName;
	var data = api.pageParam.data;
	rightParam = api.pageParam.rightParam;
	rightParam1 = api.pageParam.rightParam1;
	var newsId = api.pageParam.newsId;
	var subtitle = api.pageParam.subtitle;
	var newsType = api.pageParam.newsType;
	var subtitle2 = api.pageParam.subtitle2;
	var rect = api.pageParam.rect;

	if (!isNotNull(rect)) {
		rect = {
			x : 0,
			y : headerH,
			w : api.winWidth
		}
	}
	$('#title').html(subtitle);
	$('#subtitle').html(subtitle2);
	api.addEventListener({
		name : 'changeFollow'
	}, function(ret, err) {
		//coding...
		$('#focusTitle').html(ret.value.title);
	});
	var rightBut = api.pageParam.rightBut;
	if (isNotNull(rightBut)) {
		if (pageName == 'complete-material') {
			api.addEventListener({
				name : 'keyback'
			}, function(ret, err) {
				return;
			});
			api.setWinAttr({
				slidBackEnabled : false
			});
			$("#closeFrame").hide();
		}
		$(".header-i-right").html(rightBut);
	}
	
	api.addEventListener({
	    name:'clubStatus'
    },function(ret,err){
    	//coding...
    	if (ret.value.isShow == 1)
    		$("#club_add").show();	
    	else
    		$("#club_add").hide();	
    });
	func = api.pageParam.func;
	var url = '';
	
	api.openFrame({
		name : pageName,
		url : pageName + ".html",
		bounces : false,
		rect : rect,
		allowEdit : api.pageParam.allowEdit,
		progress : {
			type : "page", //加载进度效果类型，默认值为default，取值范围为default|page，default等同于showProgress参数效果；为page时，进度效果为仿浏览器类型，固定在页面的顶部
			title : "", //type为default时显示的加载框标题
			text : "", //type为default时显示的加载框内容
			color : "#FF" //type为page时进度条的颜色，默认值为#45C01A，支持#FFF，#FFFFFF，rgb(255,255,255)，rgba(255,255,255,1.0)等格式
		},
		pageParam : {
			headerH : headerH,
			newsId : newsId,
			newsType : newsType,
			data : data
		}
	});

}
function rightClick() {
	api.sendEvent({
		name : rightParam
	});
}


function rightClick1(){
	api.sendEvent({
		name : rightParam1
	});
}
function closeWin() {
	var pageName = api.pageParam.pageName;
	if (pageName == "time-release") {
		api.sendEvent({
			name : 'hidenOption'
		});
		api.closeWin();
	} else if (pageName == 'activityRanking') {
		api.sendEvent({
			name : 'closeGameFrame'
		});
		api.closeWin();
	} else if (pageName == 'create-success') {
		api.sendEvent({
			name : 'closeCreateGame'
		});
		api.closeToWin({
			name : 'root'
		});
	} else if(pageName == 'submit_orders'){
		api.sendEvent({
			name : 'closeSubmitOrders'
		});
		api.closeWin();
	}else{
		api.closeWin();
	}
}