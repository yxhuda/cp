apiready = function() {
	jsonData = api.pageParam;
	init();
}
function init() {
	
	var html = "";
	
	for (var i = 0; i < jsonData.length; i++) {
		html += '<div class="with-time" style="text-align: center;margin: 10px auto;color:#999"> ' + jsonData[i].addTime+ '</div>';
		html += '<div class="confirmorder1 rightFont" style="margin:0 10px;position:relative">';
		switch(parseInt(jsonData[i].type)){
		case 1:
		case 2:
		case 3:
		case 4:
		case 7:
	
		html += '<span style="position: absolute;right:20px;top:19px;margin-top:0px;font-size: 14px;color: #827f7f;" onclick="openDetail(' + i + ')">立即查看<i class="icon iconfont iconarrow-left" style="font-size: 14px;color: #827f7f;"></i></span>'
		html += '<div class="body-table body-table-on" style="background: white" onclick="openDetail(' + i + ')">';
		break;
		case 5:
		html += '<span style="position: absolute;right:20px;top:19px;margin-top:0px;font-size: 14px;color: #827f7f;" ><i class="icon iconfont iconarrow-left" style="font-size: 14px;color: #827f7f;"></i></span>'
		html += '<div class="body-table body-table-on" style="background: white">';
		break;
		case 6:
		html += '<span style="position: absolute;right:20px;top:19px;margin-top:0px;font-size: 14px;color: #827f7f;"  onclick="openShop()">重新入驻<i class="icon iconfont iconarrow-left" style="font-size: 14px;color: #827f7f;"></i></span>'
		html += '<div class="body-table body-table-on" style="background: white"  onclick="openShop()">';
		break;

		}
		
		html += '<h1 style="padding: 5px;font-size: 16px;border-bottom: 1px solid #f2f2f2;">' + jsonData[i].title + '<span style="position: absolute;right:10px;margin-top:3px;font-size: 14px;color: #827f7f;" ><i class="icon iconfont iconarrow-left" style="font-size: 14px;color: #827f7f;"></i></span></h1>';
		html += '<p class="noticeFont" style="padding: 10px">' + jsonData[i].value + '</p>';

		html += '</div>';
		html += '</div>';
	}

	
	$(".content-notice").html(html)

}

function openDetail(i) {
//alert(i)
	var url = "order/selectOrder.do";

	var bodyParam = {
		body : {
			orderId : jsonData[i].choiceId
		}
	}
	ajaxRequest(url, bodyParam, function(ret, err) {
		if (err) {
			_d(err)
		} else {
			
			if (ret.code == 1) {
				if (ret.order.orderType == 1) {
					var data = {};
				data.orderId = jsonData[i].choiceId;
				openWinNew('waitreceive', '订单详情', [], data);
				}else{
					var data = {};
				data.orderId = jsonData[i].choiceId;
				openWinNew('waitshare', '拼团详情', [], data);
				
				}
			}
		}
	})
}

function openShop(){
openWinNew('shopopen', '商家入驻', [], {});
}