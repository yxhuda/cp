var data = {};
apiready = function() {
	
	init()

}
function init() {
	if (api.pageParam.company && api.pageParam.transCode) {
		data.company = api.pageParam.company;
		data.transCode = api.pageParam.transCode;
		data.transCompany = api.pageParam.transCompany;
		transHead();
		trans();
	} else {
		var url = "order/selectOrder.do";
		var bodyParam = {
			body : {
				orderId : api.pageParam.orderId
			}
		}
		ajaxRequest(url, bodyParam, function(ret, err) {
			if (err) {
				toast('数据通讯发生错误，请重试');
				return false;
			} else {
				if (ret.code == 1) {

					data = ret.order;
					
					transHead();
					trans();
				}
			}
		})
	}

}

//获取头部参数
function transHead() {
	
	var html = '';
	html += '<div class="logistic-list">';
	html += '<span>物流公司：</span><span class="colorhui">' + data.company + '</span>';
	html += '</div>';
	html += '<div class="logistic-list">';
	html += '<span>物流单号：</span><span class="colorhui">' + data.transCode + '</span><em tapmode="" onclick="setClipboard(\'' + data.transCode + '\')">复制</em>';
	html += '</div>';
	$('#logistichead').html(html);
}

//获取物流状态
function trans() {
	showLoading();

	var url = "order/selectOrderLogistics.do";
	var bodyParam = {
		body : {
			transCode : data.transCode,
			transCompany : data.transCompany,
		}
	};
	
	ajaxRequest(url, bodyParam, function(ret, err) {
		hideLoading()
		if (err) {
			toast('数据通讯发生错误，请重试');
			_d(err)
		} else {
			
			if (ret.code == 1) {
				
				if (isNotNull(ret.list)) {
					var html = "";
					for (var i = 0; i < ret.list.length; i++) {
					
						
						if (i != 0&&i!=ret.list.length-1) {
							html += '<div class="logisticbox-list marginTop-44px">';
							html += '<div class="logistic-left">';
							html += '<div class="logistic-link">';
							html += '<div class="logisticPositioning"></div>';
							html += '</div>';
							html += '</div>';
							html += '<div class="logistic-right">';
							html += '<div class="logisticRight">';
							html += '<div class="logistic-text">';
							html += '<span>' + ret.list[i].status + '</span>'
							html += '</div>';
							html += '<div class="logistic-time">';
							html += '<span>' + ret.list[i].time + '</span>';
							html += '</div>';
							html += '</div>';
							html += '</div>';
							html += '</div>';
						}else if(i ==ret.list.length-1 ){
						
							html += '<div class="logisticbox-list marginTop-44px">';
							html += '<div class="logistic-left">';
//							html += '<div class="logistic-link">';
							html += '<div class="logisticPositioning" style="margin-left:9px"></div>';
//							html += '</div>';
							html += '</div>';
							html += '<div class="logistic-right">';
							html += '<div class="logisticRight">';
							html += '<div class="logistic-text">';
							
							html += '<span>' + ret.list[i].status + '</span>'
							html += '</div>';
							html += '<div class="logistic-time">';
							html += '<span>' + ret.list[i].time + '</span>';
							html += '</div>';
							html += '</div>';
							html += '</div>';
							html += '</div>';
						
						}else {
							html += '<div class="logisticbox-list">';
							html += '<div class="logistic-left">';
							html += '<div class="logistic-link">';
							html += '<div class="logisticPositioning-on"></div>';
							html += '</div>';
							html += '</div>';
							html += '<div class="logistic-right">';
							html += '<div class="logisticRight">';
							html += '<div class="logistic-text">';
							html += '<span>' + ret.list[i].status + '</span>'
							html += '</div>';
							html += '<div class="logistic-time">';
							html += '<span>' + ret.list[i].time + '</span>';
							html += '</div>';
							html += '</div>';
							html += '</div>';
							html += '</div>';
						}
					}
					$("#logisticbox").html(html)
				}else{
					$("#logisticbox").html("暂无物流信息")
				}
			}
		}
	})
}