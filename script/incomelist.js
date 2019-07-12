var datatime;
apiready = function() {
	var date = new Date();
	//时间戳为10位需*1000，时间戳为13位的话不需乘1000
	Y = date.getFullYear();
	M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1);
	$('#dateSelect').val(Y + '-' + M);
	datatime = Y + '-' + M + '-01';
	$(function() {
		$("#dateSelect").click(function() {
			var dtPicker = new mui.DtPicker({
				type : 'month'
			});
			/*参数：'datetime'-完整日期视图(年月日时分)
			 'date'--年视图(年月日)
			 'time' --时间视图(时分)
			 'month'--月视图(年月)
			 'hour'--时视图(年月日时)
			 */
			dtPicker.show(function(selectItems) {
				var y = selectItems.y.text;
				//获取选择的年
				var m = selectItems.m.text;
				//获取选择的月
				var date = y + "-" + m;
				$("#dateSelect").val(date);
				datatime = $("#dateSelect").val() + '-01';

				if (isNotNull($("#dateSelect").val())) {
					init();
				}
			})
		});

	})
	init();
}
function init() {
	$(".income-typebox").html('');
    showLoading();
	var url = 'spread/spreadLogInfo';
	var bodyParam = {
		body : {
			time : datatime
		}
	};
	ajaxRequest(url, bodyParam, function(ret, err) {
		hideLoading();
		if (err) {
			toast('服务器开了个小差，在刷新尝试一下!!!');
		} else {
			if (ret.code == 1) {
				var html='';
				if (isNotNull(ret.spreadLogInfo)) {
					var html = collectionHtml(ret.spreadLogInfo);
					$(".income-typebox").html(html);
				} else {
					empty();
				}

			}

		}
	});

}

function collectionHtml(data) {
	var html = '';
	for (var i = 0; i < data.length; i++) {
		html += '<div class="typeboxlist">';
		html += '<div class="typeboxlist-left">' + data[i].creatDate + '</div>';
		html += '<div class="typeboxlist-r"><p>提现金额</p>';
		html += '<p>-￥' + data[i].account + '	</p>';
		html += '</div>';
		html += '</div>';
	}
	return html;

}

