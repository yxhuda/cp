//分页用各参数
var page = 1;
var isLoading = false;
var isLast = false;

var nowType;
apiready = function() {
    listCoupon(0);
}

//第二次渲染
function getCouponList() {
	if (isLoading)
		return;
    if (isLast) {
    	toast('没有更多内容了');
        return;
    }
    page++;
    var url = "coupon/coupons.do";
    var bodyParam = {
        body: {
            type: nowType,
            page: page,
            limit: 6
        }
    }
    isLoading = true;
    ajaxRequest(url, bodyParam, function(ret, err) {
    	isLoading = false;
        if (err) {
        	api.removeEventListener({
        		name:'scrolltobottom'
			});
			toast('没有更多内容了');
        } else {
    
            if (ret.code == 1 && ret.coupon.length > 0) {
                var html = htmlSplit(ret, nowType);
                $("#contentHtml").append(html);
            } else {
            	toast('没有更多内容了');
            	api.removeEventListener({
				    name:'scrolltobottom'
			    });
                isLast = true;
            }
        }
    })
}
//首次加载
function listCoupon(type) {
	page = 1;
	isLast = false;
    $("#contentHtml").html('');
    nowType = type;
    $('.unuse').removeClass('unuse-on');
    $('#coupon'+type).addClass('unuse-on');
    var url = "coupon/coupons.do";
    var bodyParam = {
        body: {
            type: type,
            page: page,
            limit: 6
        }
    }
    api.removeEventListener({
	    name:'scrolltobottom'
    });
    showLoading();
    isLoading = true;
    ajaxRequest(url, bodyParam, function(ret, err) {
    	isLoading = false;
        hideLoading();
       
        if (err) {
           netError("listCoupon",0);
        } else {
        	api.refreshHeaderLoadDone();
        	dropDownLoad(function(ret,err){	
        		page = 1;
        		isLast = false;
        		isLoading = false;
				listCoupon(nowType);
			});
            if (ret.code == 1 && ret.coupon.length > 0) {
                var html = htmlSplit(ret, type);
                $("#contentHtml").html(html);
                api.addEventListener({
			        name: 'scrolltobottom',
			        extra: {
			            threshold: 0 //设置距离底部多少距离时触发，默认值为0，数字类型
			        }
			    }, function(ret, err) {
			        getCouponList();
			    });
                  api.addEventListener({
			        name: 'scrolltobottom',
			        extra: {
			            threshold: 0 //设置距离底部多少距离时触发，默认值为0，数字类型
			        }
			    }, function(ret, err) {
			        getCouponList();
			    });
            } else {
                emptyById('contentHtml');
                isLast = true;
            }
        }
    })
}
//拼接渲染
function htmlSplit(ret, type) {
	var html="";
    switch (type) {
        case 0:
           
            for (var i = 0; i < ret.coupon.length; i++) {
          	    html += '<div class="body-table body-table-on">';
                html += '<div class="nunse-list">';
                html +='<div class="nunse-title">'+getCouponName(ret.coupon[i].account,ret.coupon[i].condition,ret.coupon[i].couponType)+'</div>';
                html +='<div class="nunse-text"><span>￥</span><span>' +ret.coupon[i].condition + '</span><span>优惠券</span></div>';
                html +='<div class="nunse-bottom"><div class="nunse-time">使用期限：'+ret.coupon[i].startTime+' ∽  '+ret.coupon[i].endTime+'</div>';
                html+='<div class="nunse-status">未使用</div></div>';
                html+='</div>';
                 html+='</div>';
            }
            break;
        case 1:
           
            for (var i = 0; i < ret.coupon.length; i++) {
              html += '<div class="body-table body-table-on">';
				html += '<div class="body-table body-table-on"><div class="nunse-list nunse-po">';
                html +='<div class="nunse-title">'+getCouponName(ret.coupon[i].account,ret.coupon[i].condition,ret.coupon[i].couponType)+'</div>';
                html +='<div class="nunse-text"><span>￥</span><span>' +ret.coupon[i].condition + '</span><span>优惠券</span></div>';
                html +='<div class="nunse-bottom "><div class="nunse-time">使用期限：'+ret.coupon[i].startTime+' ∽  '+ret.coupon[i].endTime+'</div>';
                html+='<div class="nunse-status">已使用</div><div class="nunseBox"></div></div>';
               html+='</div>';
                 html+='</div>';
            }
            break;
          
        case 2:
          
            for (var i = 0; i < ret.coupon.length; i++) {
              html += '<div class="body-table body-table-on">';
				html += '<div class="body-table body-table-on"><div class="nunse-list nunse-po">';
                html +='<div class="nunse-title">'+getCouponName(ret.coupon[i].account,ret.coupon[i].condition,ret.coupon[i].couponType)+'</div>';
                html +='<div class="nunse-text"><span>￥</span><span>' +ret.coupon[i].condition + '</span><span>优惠券</span></div>';
                html +='<div class=" nunse-bottom"><div class="nunse-time">使用期限：'+ret.coupon[i].startTime+' ∽  '+ret.coupon[i].endTime+'</div>';
                html+='<div class="nunse-status">已过期</div><div class="nunseBoxs"></div></div>';
                    html+='</div>';
                 html+='</div>';
            }
            break;

    }
    return html;
}

function getLocalTime(nS) {   
   return Math.ceil(nS/(3600*24)); 
}
