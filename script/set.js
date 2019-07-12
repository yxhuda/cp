apiready = function() {
	
	var size = api.getCacheSize({
		sync : true
	});
	size = size / 1024 / 1024;
	
	$('#cachesize').html(size.toFixed(2) + "M");
	$("#currentVersion").html("当前版本" + api.appVersion);
	
	
	//如有新版本加‘发现新版本’
	var mam = api.require('mam');
	mam.checkUpdate(function(ret, err){
	    if (ret) {
	        _d(ret.result.update);
	        if(ret.result.update==true){
	        	$("#banben").html("发现新版本");
	        }else{
	        	$("#banben").html("");
	        }
	    } else {
	        _d(JSON.stringify(err));
	    }
	});

}
//退出登录
function loginOut() {
	
	setUser(null);
	setCacheData("addressData", null);
	//默认地址清除
	setCacheData("historyRecord", null);
	//历史记录清除
	//setCacheData("config", null);
	//配置
	api.sendEvent({
		name : 'loginsuccess'
	});
	openWin('login');
}

//清除缓存
function clearCache() {
	api.clearCache(function() {
		var size = api.getCacheSize({
			sync : true
		});
		size = size / 1024 / 1024;
		size = 0;
		$('#cachesize').html(size.toFixed(2) + "M");
	});

}

//商家入驻
function tenants() {
	var url = 'shop/checkShop.do';
	var bodyParam = {
		body : {}
	};
	ajaxRequest(url, bodyParam, function(ret, err) {
		if (err) {
			toast('服务器开了个小差，在刷新尝试一下!!!');
		} else {
			if (ret.code == 1) {
				if (ret.status == 0) {
					toast(ret.msg)
				} else if (ret.status == 1) {
					toast(ret.msg)
				} else if (ret.status == 2) {
					
					toast("审核失败:"+ret.msg);
					openWinNew('shopopen', '商家入驻', {}, {}, true)
				}else {
					
					openWinNew('shopopen', '商家入驻', {}, {}, true)
				}
			}
		}
	});

}


//新版本
function version(){
	var mam = api.require('mam');
	mam.checkUpdate(function(ret, err){
	    if (ret) {
	        _d(ret.result.update);
	        if(ret.result.update==true){
	        	$('.maskshow').show();
	        	$('.maskbox').show();
	        }else{
	        	toast("当前已是最新版本");
	        }
	    } else {
	        _d(JSON.stringify(err));
	    }
	});
}
//关闭升级新版本模态框
function cancel(){
	$('.maskshow').hide();
	$('.maskbox').hide();
}

