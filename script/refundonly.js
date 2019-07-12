var changeImgList = new Array();
var menu1 = ['拍照', '从相册中选择'];
var cancel = '取消';
var imgCount = 0;
var imgList = new Array();
var totalNumber = 3;
var user = getUser();
var data;

apiready = function() {

	data = api.pageParam;
	
	api.addEventListener({
		name : 'cheangeImgList'
	}, function(ret, err) {
		var UIMediaScanner = api.require('UIMediaScanner');
		var imgObj = ret.value.imgList;
		if (isNotNull(imgObj)) {
			if (isNotNull(imgObj.list)) {
				var html = '';
				for (var i = 0; i < imgObj.list.length; i++) {
					html += '<div class="div" id="img_' + imgCount + '">';
					html += '<i class="icon iconfont iconguanbi" onclick="delImg(\'' + imgCount + '\');"></i>';
					html += '<img src="' + imgObj.list[i]['path'] + '">';
					html += '</div>';

					var result = {};
					result.path = imgObj.list[i]['path'];
					result.index = imgCount;
					imgCount++;
					changeImgList.push(result);
					UIMediaScanner.transPath({
						path : imgObj.list[i]['path']
					}, function(ret2, err2) {
						imgList.push(ret2['path']);
					});
				}
			}
			$("#totalNumber").html(imgCount + '/' + totalNumber);
			$("#img_list").append(html);

		}
	});

	api.addEventListener({
		name : 'uploadComplete'
	}, function(ret, err) {
		//coding...
		submit(ret.value.pics);
	});

	var url = "cprefundreason/page.do";
	var bodyParam = {};
	bodyParam = {
		body : {}
	}
	ajaxRequest(url, bodyParam, function(ret, err) {
		if (err) {
			_d(err);
		} else {
			if (ret.code == 1) {
				if (isNotNull(ret.list)) {
					var html = '';
					for (var i = 0; i < ret.list.length; i++) {
						html += '<div class="refundonlyshow-list">';
						html += '<div class="hui-form-radios">';
						html += '<input type="radio" value="' + i + '" name="aihao2" id="c' + i + '" onchange="showSelectRes(this,3);" />';
						html += '<label for="c' + i + '">' + ret.list[i] + '</label>';
						html += '</div>';
						$("#myreson").html(html)
					}
				} 
			} 
		}

	})
	init();
}


function init(){
	_d(data);
	if(isNotNull(data.refundInfo)){
		if (data.serviceType == 1) {
			var label = $('#a1').parent().find('label').html();
			$('#a1').attr("checked", true);
		} else {
			var label = $('#a2').parent().find('label').html()
			$('#a2').attr("checked", true);
		}
		$("#type1").html(label);
		$("#totalNumber").html('0/' + totalNumber);
		$("#phone").val(data.phone);
		$("#userPrice").val(data.orderDetails[data.tui].refundMoney);
	}else{
		if (data.serviceType == 1) {
			var label = $('#a1').parent().find('label').html();
			$('#a1').attr("checked", true);
		} else {
			var label = $('#a2').parent().find('label').html()
			$('#a2').attr("checked", true);
		}
		$("#type1").html(label);
		$("#totalNumber").html('0/' + totalNumber);
		$("#phone").val(data.phone);
		$("#userPrice").val(data.orderDetails[data.tui].refundMoney);
	}
	
}
/***
 *上传多张图片
 */
function uploadPhoto() {
	if (imgCount == totalNumber)
		return;
	if (changeImgList.length > totalNumber) {
		toast('最多可上传' + totalNumber + '张图片...');
		return;
	}
	var count = totalNumber - parseInt(changeImgList.length);
	var html = '';
	api.actionSheet({
		cancelTitle : cancel,
		buttons : menu1
	}, function(ret, err) {

		var index = ret.buttonIndex;
		if (index == 1) {
			openCamera(function(ret, err) {

				if (isNotNull(ret) && isNotNull(ret.data)) {
					html += '<div class="div" id="img_' + changeImgList.length + '">';
					html += '<i class="icon iconfont iconguanbi" onclick="delImg(\'' + changeImgList.length + '\');"></i>';
					html += '<img src="' + ret.data + '">';
					html += '</div>';
					$("#img_list").append(html);
					var result = {};
					result.index = imgCount;
					result.path = ret.data;
					changeImgList.push(result);

					imgCount++;
					imgList.push(ret.data);
				}

				$("#totalNumber").html(imgCount + '/' + totalNumber);
			});
		} else if (index == 2) {
			selectImageList(count);
		}
	});

}

//图片删除
function delImg(val) {
	imgList = new Array();
	$("#img_" + val).remove();
	for (var i = 0; i < changeImgList.length; i++) {
		if (changeImgList[i]['index'] == val) {
			changeImgList.splice(i, 1);
		}
	}
	for (var i = 0; i < changeImgList.length; i++) {
		imgList.push(changeImgList[i]['path']);
	}
	imgCount--;
	$("#totalNumber").html(imgCount + '/' + totalNumber);
}

//退货申请验证
function setFeedback() {
	var applytype = $('input:radio[name=aihao0]:checked').val();
	var applystate = $('input:radio[name=aihao1]:checked').val();
	var applyreason = $('input:radio[name=aihao2]:checked').val();
	var userPrice = $("#userPrice").val();
	var content = $("#content").val();
	if (!isNotNull(applytype)) {
		toast('请选择申请类型');
		return;
	}
	if (!isNotNull(applystate)) {
		toast('请选择收货状态');
		return;
	}
	if (!isNotNull(applyreason)) {
		toast('请选择申请原因');
		return;
	}
	if (!isNotNull(userPrice)) {
		toast('请输入退款金额');
		return;
	}
	if (!isNotNull(content)) {
		toast("请填写申请说明");
		return;
	}
	api.showProgress({
		title : '正在提交...',
		modal : true
	});
	if (imgList.length > 0) {
		//上传图片到OSS
		uploadPicArray(imgList, null);
	} else {
		submit(null);
	}

}

//多张图片上传工具
function uploadPicArray(imgArray, callBack) {
	var html = '';
	api.showProgress({
		title : '正在上传',
		modal : true
	});
	uploadOssArray(imgArray, "momentPic");
}

//提交申请
function submit(pics) {
	var userId = data.id;

	var orderId = data.orderDetails[data.tui].id;
	//商品id

	var content = $("#content").val();
	//退款原因
	var userPrice = $("#userPrice").val();
	//退款金额
	var phone = $("#phone").val();
	//联系电话
	var applyreason = $("input:radio[name=aihao2]:checked").parent().find('label').html()
	//买家备注原因
	var applystate = $('input:radio[name=aihao1]:checked').val();
	//收货状态1-未收货2已收货
	var applytype = $('input:radio[name=aihao0]:checked').val();
	//退货类型，1仅退款2退款退货
	var shopId = data.shopId;
	//店铺id
	//	if (data.orderDetails[data.tui].refundNum == 1) {
	//
	//	} else {
	var url = "order/refund.do";

	var bodyParam = {};
	if (isNotNull(pics)) {
		bodyParam = {
			body : {
				userId : userId,
				orderId : orderId,
				buyerRemarks : content,
				refundPrice : userPrice,
				phone : phone,
				reason : applyreason,
				receiveStatus : applystate,
				serviceType : applytype,
				imgUrl : pics,
				type : 2,
				shopId : shopId
			}
		};
	} else {
		bodyParam = {
			body : {
				userId : userId,
				orderId : orderId,
				reason : applyreason,
				refundPrice : userPrice,
				phone : phone,
				buyerRemarks : content,
				receiveStatus : applystate,
				serviceType : applytype,
				imgUrl : '',
				type : 2,
				shopId : shopId
			}
		};
	}

	ajaxRequest2(url, bodyParam, function(ret, err) {
	
		api.hideProgress();
		if (err) {
			
			toast('数据通讯发生错误，请重试');
			return false;
		} else {

			if (ret.code == 1) {
				toast("提交成功");
				api.sendEvent({
					name : 'perform'
				});
				if(getWindow('refunddetail')){
					api.closeToWin({
		                name: 'refunddetail'
	                });
				}else{
					openWinNew("refunddetail", '申请退款', [], data);
				}
			} else {
				
				toast("提交失败");
				return false;
			}
		}
	})
}

