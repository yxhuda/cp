var data;

apiready = function() {

	data = api.pageParam;
	
}

//回寄申请验证
function setFeedback() {
	var expresstype = $('input:radio[name=aihao0]:checked').val();
	var couriernumber = $("#couriernumber").val();
	if (!isNotNull(expresstype)) {
		toast('请选择物流公司');
		return;
	}
	if (!isNotNull(couriernumber)) {
		toast('请输入快递单号');
		return;
	}
	if (!checkCouriernumber(couriernumber)) {
		toast('请输入正确快递单号');
		return;
	}
	showProgressNew("正在加载","请稍后....");
	var refundId = data.refund.id;
	//退款申请的id
	var transCode = $("#couriernumber").val();
	//物流单号
	var transCompany;
	if($('input:radio[name=aihao0]:checked').val()==1){
	
		transCompany = 'SFEXPRESS';
	}else if($('input:radio[name=aihao0]:checked').val()==2){
		transCompany = 'YTO';
	}else if($('input:radio[name=aihao0]:checked').val()==3){
		transCompany = 'STO';
	}else if($('input:radio[name=aihao0]:checked').val()==4){
		transCompany = 'YUNDA';
	}else if($('input:radio[name=aihao0]:checked').val()==5){
		transCompany = 'CHINAPOST';
	}else if($('input:radio[name=aihao0]:checked').val()==6){
		transCompany = 'ZTO';
	}
	else if($('input:radio[name=aihao0]:checked').val()==7){
		transCompany = 'EMS';
	}
	else if($('input:radio[name=aihao0]:checked').val()==8){
		transCompany = 'TTKDEX';
	}
	else if($('input:radio[name=aihao0]:checked').val()==9){
		transCompany = 'HTKY';
	}
	else if($('input:radio[name=aihao0]:checked').val()==10){
		transCompany = 'DEPPON';
	}
	else if($('input:radio[name=aihao0]:checked').val()==11){
		transCompany = 'ANE';
	}
	//快递公司
	var url = "order/refundLogistics.do";
	var bodyParam = {};
	if (isNotNull(pics)) {
		bodyParam = {
			body : {
				refundId : refundId,//退款申请的id
				transCode : transCode,//物流单号
				transCompany : transCompany//快递公司
			}
		};
	} else {
		bodyParam = {
			body : {
				refundId : refundId,//退款申请的id
				transCode : transCode,//物流单号
				transCompany : transCompany//快递公司
			}
		};
	}
	ajaxRequest2(url, bodyParam, function(ret, err) {
	api.hideProgress();
		if (ret.code == 1) {
			
			if(data.refund.isGroup==0){
				api.closeToWin({
	                name: 'waitreceive'
                });
				api.sendEvent({
					name : 'dischargePetition',
				});
			}else if(data.refund.isGroup==1){
					api.closeToWin({
	                name: 'waitshare'
                });
			
				api.sendEvent({
					name : 'perform',
				}); 
			}	
			toast("提交成功");
		} else {
			toast("提交失败");
			return false;
		}
	})
 	
}













