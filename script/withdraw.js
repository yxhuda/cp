var arr1;
var jsonData = [];
var cancel = '取消';
var data;
var tag = 0;
var payType = 1;
var account;
var ncashOut;
var config;
//支付方式
var user = getUser();
apiready = function() {
	config = getCacheData('config');
	
	data = api.pageParam;
	//	$('#number').val(config.account)
	$('#number').text(data.settleAccount)
	//	$("#money").text(data.totalAccount)
}
function cashWithdrawal() {
	$('#number').text($("#money").text())
}

//提交
var sub=0;
function withdrawal() {
if(sub==1)return ;
sub==1;
//	if ($('#g1').is(':checked')) {
//		$('#weiXin').val(user.weChat);
//		account = $('#weiXin').val();
//		if (!isNotNull($('#weiXin').val())) {
//			toast("请输入微信账号");
//			return;
//		}
//		cashOut = 2;
//	} else if ($('#g2').is(':checked')) {

//		$('#zhiFuBao').val(user.alipay);
		account = $('#zhiFuBao').val();
		if (!isNotNull($('#zhiFuBao').val())) {
			toast("请输入支付宝账号");
			return;
		}
		cashOut = 1;
//	}
	if (data.settleAccount < config.account) {
		toast("当前提现金额不足");
			api.closeWin();
	} else {
		var url = 'spread/topay';
		var bodyParam = {
			body : {
				account : data.settleAccount,
				no : account,
				cashOut : cashOut ,
			}
		};
		ajaxRequest(url, bodyParam, function(ret, err) {
			if (err) {
			_d(err)
			} else {
				if (ret.code == 1) {
				
					toast("提现成功");
					api.sendEvent({
					name : 'perform'
				});
					api.closeWin();
				}
			}
		});
	}
}

//获取单选框的值
function showSelectRes(_selfBtn) {
	hui(_selfBtn).parent().find('input').each(function(cObj) {
		if (cObj.checked) {
			payType = cObj.value;
			if (payType == 1) {
				$("#showPay_1").show();
				$("#showPay_2").hide();
			} else {
				$("#showPay_2").show();
				$("#showPay_1").hide();
			}
		}
	});
}

