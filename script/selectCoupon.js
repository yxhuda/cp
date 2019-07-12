var coupon;
var shopId;

apiready = function(){
	init();
}

function init(){

	coupon = api.pageParam.coupon;
	shopId = api.pageParam.shopId;
	if(isNotNull(coupon)){
			var html = '';
		for(var i=0;i<coupon.length;i++){
			if(coupon[i].selected!=1){
			html += '<div class="nunse-list"  tapmode="" onclick="getSelectCoupon(\''+coupon[i].id+'\');">';
			if(coupon[i].couponType==1){
				html += '<div class="nunse-title">'+getCouponName(coupon[i].account,coupon[i].condition,coupon[i].couponType)+'</div>';
			}else{
			
			}	
			html += '<div class="nunse-text"><span>￥</span><span>'+coupon[i].condition+'</span><span>优惠券</span></div>';
			html += '<div class="nunse-bottom"><div class="nunse-time">使用期限：'+coupon[i].startTime+' ~ '+coupon[i].endTime+'</div>';
			html += '<div class="nunse-status">未使用</div></div>';
			html += '</div>';
			}
		}
		$("#couponHtml").html(html);
	}else{
		$("#couponHtml").html('');
		empty();
	}
}

function getSelectCoupon(id){
	
	var selData = {};
	for(var i=0;i<coupon.length;i++){
		if(coupon[i].id==id){
			selData = coupon[i];
		}
	}
	api.sendEvent({
	    name:'selectCoupon',
	    extra:{
	    	coupon:selData,
	    	shopId:shopId
	    	
	    }
    });
    closeWin();
}