var changeImgList = new Array();
var menu1 = ['拍照', '从相册中选择'];
var cancel = '取消';
var imgCount = 0;
var imgList = new Array();
var totalNumber = 3;
var user = getUser();
var data;
apiready = function(){
	data = api.pageParam;
	$("#totalNumber").html('0/'+totalNumber);
	api.addEventListener({
		name : 'cheangeImgList'
	}, function(ret, err) {
		var UIMediaScanner = api.require('UIMediaScanner');
		var imgObj = ret.value.imgList;
	
		if (isNotNull(imgObj)) {
			if (isNotNull(imgObj.list)){
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
			$("#totalNumber").html(imgCount+'/'+totalNumber);
			$("#img_list").append(html);
		}
	});
	
	api.addEventListener({
		name : 'uploadComplete'
	}, function(ret, err) {
		//coding...
		submit(ret.value.pics);
	});
}

/***
 *上传多张图片
 */
function uploadPhoto() {
if(imgCount==totalNumber)return ;
	if (changeImgList.length > totalNumber) {
		toast('最多可上传'+totalNumber+'张图片...');
		return;
	}
	var count = totalNumber - parseInt(changeImgList.length);
	var html = '';
	
	api.actionSheet({
	    cancelTitle: cancel,
	    buttons: menu1
	}, function(ret, err) {
			
	    var index = ret.buttonIndex;
	    if(index==1){
	    	openCamera(function(ret, err) {
	    	
				if(isNotNull(ret) && isNotNull(ret.data)){
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
				
				$("#totalNumber").html(imgCount+'/'+totalNumber);
			});
	    }else if(index==2){
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
	$("#totalNumber").html(imgCount+'/'+totalNumber);
}
//反馈提交验证
function setFeedback(){
	var content = $("#content").val();
	var phone = $("#phone").val();
	if (!isNotNull(content) && !isNotNull(content)) {
		toast("请输入反馈意见");
		return;
	}
	if (!isNotNull(phone)) {
		toast('请输入手机号');
		return;
	}
	if (!checkPhone(phone)) {
		toast('请输入正确手机号');
		return;
	}
	api.showProgress({
		title : '正在发布...',
		modal : true
	});
	if (imgList.length > 0) {
		//上传图片到OSS
		uploadPicArray(imgList,null);
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

/**
 * 反馈提交 
 * @param {Object} pics 用逗号隔开的图片链接字符串
 */
function submit(pics){
	var content = $("#content").val();
	var phone = $("#phone").val();
	var url = "feedback/feedback.do";
	var bodyParam = {};
	if(isNotNull(pics)){
		bodyParam = {
			body:{
				name:user.realName,
				content:content,
				phone:phone,
				imgUrl:pics,
				type:data.type
			}
		};
	}else{
		bodyParam = {
			body:{
				name:user.realName,
				content:content,
				phone:phone,
				imgUrl:'',
				type:data.type
			}
		};
	}
	ajaxRequest2(url,bodyParam,function(ret,err){
		api.hideProgress();
		if(err){
			_d(err);
		}else{
			if(ret.code==1){
				toast("反馈成功");
				api.closeWin();
			}else{
				toast("反馈失败");
				return false;
			}
		}
	})
}