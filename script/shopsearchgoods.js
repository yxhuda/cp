var productName;
var id;
var type = 0;
var page = 1;
var pisLast = false;
var pisLoading = false;
var Waterfall;
var limit = 6;
apiready = function() {
	productName = api.pageParam.key;
	id = api.pageParam.id;
	api.addEventListener({
	    name:'viewappear'
    },function(ret,err){
//  	 alert('window显示');
    	closeWin("shopsearch");
    });
	init();
}
//初始化
function init() {
	
	searchGoods(1);
}

//搜索商品
var myType=0;
var nowType = 1;
function searchGoods(flag) {
	if(flag==3){
		if(myType==0){
			$(".dup").addClass("dup1");
			$(".ddown").removeClass("ddown1");
			myType=1;
			flag=4;
		}else{
			$(".dup").removeClass("dup1");
			$(".ddown").addClass("ddown1");
			myType=0;
			flag=3;
		}
	}else{
		$(".dup").removeClass("dup1");
		$(".ddown").removeClass("ddown1");
	}
	
	if (type == flag) {
		return;
	}

	page = 1;
	type = flag;
	pisLast = false;
	$('.activityNav-title').removeClass('activity-navshow');
	$('#pfilter'+flag).addClass('activity-navshow');
	if(flag==4)
	$('#pfilter3').addClass('activity-navshow');
	var url = 'shop/selectShopProducts.do';
	var bodyParam = {
		body:{
			id:id,                           //店铺id
			productName:productName,		//商品名称
			type:type,			//综合排行，销量优先，价格
			page:page,						//页面
			limit:limit						//每页条数
		}
	};
	pisLoading = true;
	showLoading();
	$('#activitys').html('');
	Waterfall = new huiWaterfall('#activitys');
	ajaxRequest(url,bodyParam,function(ret,err){
		hideLoading();
		pisLoading = false;
		if (err){
			tabEmpty('activitys');
		}
		else{
			if (ret.code == 1 && ret.products.length > 0)
			{
		
				for(var i=0;i<ret.products.length;i++){
					ret.products[i].id = ret.products[i].productId; 
				}
				showSearchProduct(ret.products);
				if(ret.productCount<limit){
					pisLast = true;
				}
				api.addEventListener({
			        name: 'scrolltobottom',
			        extra: {
			            threshold: 0 //设置距离底部多少距离时触发，默认值为0，数字类型
			        }
			    }, function(ret, err) {
			        getMoreProduct();
			    });
			}
			else
			{
				tabEmpty('activitys');
			}
		}
	});
}


//商品翻页
function getMoreProduct() {
	if(pisLast){
		return;
	}
	if (pisLoading){
		return;
	}
	page++;
	var url = 'shop/selectShopProducts.do';
	var bodyParam = {
		body:{
			id:id,                           //店铺id
			productName:productName,		//商品名称
			type:type,			//综合排行，销量优先，价格
			page:page,						//页面
			limit:limit						//每页条数
		}
	};
	pisLoading = true;
	ajaxRequest(url,bodyParam,function(ret,err){
		pisLoading = false;
		if (err){
			var html = '';
			html += '<div id="hui-load-more">-- 我们是有底线的！ --</div>';
			$("#activitys").append(html);
		}
		else{
			if (ret.code == 1 && ret.products.length > 0)
			{
				for(var i=0;i<ret.products.length;i++){
					ret.products[i].id = ret.products[i].productId; 
				}
				showSearchProduct(ret.products);
			}
			else
			{
				var html = '';
				html += '<div id="hui-load-more">-- 我们是有底线的！ --</div>';
				$("#activitys").append(html);
				pisLast = true;
			}
		}
	});
}

