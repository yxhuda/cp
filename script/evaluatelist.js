var page = 1;
var isLast = false;
var isLoading = false;
var type;
var data;
var limit = 10;
var photoBrowser;
var imgArr = new Array();

apiready = function() {
	photoBrowser = api.require('photoBrowser');
	data = api.pageParam;
	
	api.addEventListener({
		name : 'scrolltobottom',
		extra : {
			threshold : 0 //设置距离底部多少距离时触发，默认值为0，数字类型
		}
	}, function(ret, err) {
		getMoreEvaluationList();
	});
	$("#evaluation_all").hide()
	$("#evaluation_praise").hide()
	$("#evaluation_figure").hide()
	if(getNumber(data.evalCount)>0){
	$("#evaluation_all").html("全部(" + getNumber(data.evalCount) + ")");
	$("#evaluation_all").show()
	}
		if(getNumber(data.praiseCount)>0){
	$("#evaluation_praise").html("好评(" + getNumber(data.praiseCount) + ")");
	$("#evaluation_praise").show()
	}
		if(getNumber(data.figureCount)>0){
	$("#evaluation_figure").html("有图(" + getNumber(data.figureCount) + ")");
	$("#evaluation_figure").show()
	}
	if (isNotNull(data.val)) {
		evaluationList(data.val);
	} else {
		evaluationList("all");
	}

}
function evaluationList(val) {
		isLoading = false;
		isLast=false;
	page = 1;
	//页码初始化
	type = val;
	showLoading();
	var url = "eval/page.do";
	var bodyParam = {
		body : {
			id : data.id,
			page : page,
			limit : limit,
			type : type
		}
	};

	ajaxRequest(url, bodyParam, function(ret, err) {

		if (err) {
			netError('getReleaseDynamic');
		} else {
			if (ret.code == 1) {
				var html = ''
				for (var j = 0; j < ret.labelContents.length; j++) {

					for (var i in ret.labelContents[j]) {
//					_d(ret.labelContents[j][i])
						html += '<div class="EvaluationButton colors" id="evaluation_' + i + '" tapmode="" onclick="evaluationList(\'' + i + '\')">' + i + '(' + ret.labelContents[j][i] + ')</div>'
					}

				}
				$('#evaluation_data').replaceWith(html)
				hideLoading();

				$(".EvaluationButton").addClass("colors");
				$("#evaluation_" + val).removeClass("colors");
				if (isNotNull(ret.evals)) {
					var html = '';
					html = evaluationHtml(ret.evals);
					if (ret.totalCount <= 10) {
						isLast = true;
					}
					$("#evaluationListHtml").html(html);
					for (var i = 0; i < ret.evals.length; i++) {

						cacheImage('header_' + ret.evals[i].id, ret.evals[i].header);
						if (isNotNull(ret.evals[i].evalImgs)) {
							for (var j = 0; j < ret.evals[i].evalImgs.length; j++) {
								cacheImage('eval_' + ret.evals[i].evalImgs[j].id, ret.evals[i].evalImgs[j].imgUrl);
							}
						}
					}
					api.addEventListener({
					name : 'scrolltobottom',
					extra : {
						threshold : 0 //设置距离底部多少距离时触发，默认值为0，数字类型
					}
				}, function(ret, err) {
			
					getMoreEvaluationList();
					//调用
				});
				} else {
			
					var html = '';
					html += '<div id="hui-load-more">-- 我们是有底线的！ --</div>';
					$("#evaluationListHtml").append(html);
					isLast = true;
				
				}
			} else {
					var html = '';
					html += '<div id="hui-load-more">-- 我们是有底线的！ --</div>';
					$("#evaluationListHtml").append(html);
					isLast = true;
			}
		}
	});
}

function getMoreEvaluationList() {

	if (isLast)
		return;
	if (isLoading)
		return;
	page++;
	isLoading = true;
	var url = "eval/page.do";
	var bodyParam = {
		body : {
			id : data.id,
			page : page,
			limit : limit,
			type : type
		}
	};
	ajaxRequest(url, bodyParam, function(ret, err) {

		isLoading = false;
		if (err) {
			_d(err);
		} else {
			if (ret.code == 1) {
				if (isNotNull(ret.evals)) {
					var html = '';
					html = evaluationHtml(ret.evals);
					$("#evaluationListHtml").append(html);
					for (var i = 0; i < ret.evals.length; i++) {
						cacheImage('header_' + ret.evals[i].id, ret.evals[i].header);
						for (var j = 0; j < ret.evals[i].evalImgs.length; j++) {
							cacheImage('eval_' + ret.evals[i].evalImgs[j].id, ret.evals[i].evalImgs[j].imgUrl);
						}
					}
					
				} else {
					var html = '';
					html += '<div id="hui-load-more">-- 我们是有底线的！ --</div>';
					$("#evaluationListHtml").append(html);
					isLast = true;
				}
			} else {
				var html = '';
				html += '<div id="hui-load-more">-- 我们是有底线的！ --</div>';
				$("#evaluationListHtml").append(html);
				isLast = true;
			}
		}
	});
}

function evaluationHtml(data) {
	var html = '';

	for (var i = 0; i < data.length; i++) {
		html += '<div class="Evaluation-title">';
		html += '<div class="EvaluationTop">';
		html += '<div class="Evaluationimg"><img src="../img/verify03.png" id="header_' + data[i].id + '"></div>';


		if (!isNotNull(data[i].name)) {
			html += '<div class="Evaluationname">暂无昵称</div>';
		} else {
			html += '<div class="Evaluationname">' + data[i].name + '</div>';
		}
		html += '</div>';
		html += '<div class="invite-content" id="invite-content' + data[i].id + '">' + data[i].contents + '</div>';
		if (textlength(data[i].contents) > 60) {//大于60个字符时，显示‘展开’按钮
			html += '<div id="content' + data[i].id + '" style="color: #24CAFF;font-size: 14px;" tapmode="" onclick="expansion(\'' + data[i].id + '\');">展开</div>';
		}
		html += '<input type="hidden" id="flag' + data[i].id + '" value="0">';
		html += '<div class="evaluatelist-img">';
		if (isNotNull(data[i].evalImgs)) {

			for (var j = 0; j < data[i].evalImgs.length; j++) {
			
				imgArr.push(data[i].evalImgs[j].imgUrl)
				html += '<div class="evaluatelistbox"><img src="../img/productListDefault.png" onclick="browsePictures(\'' + data[i].evalImgs[j].imgUrl + '\')" id="eval_' + data[i].evalImgs[j].id + '" /></div>';
			}
		}
		html += '</div>';
		html += '<div class="evaluatelist-text"><span  style="font-size: 14px;color: #928e8e;">' + data[i].createDate + '</span> ';
		if (data[i].specDesc != null) {
			html += '&nbsp;&nbsp;<span style="font-size: 13px;color: #928e8e;">规格：' + data[i].specDesc + '</span>';
		} else {
			html += '<span></span>';
		}

		html += '</div>';
		html += '<div class="borderlink"></div>';
		html += '</div>';
	}

	return html;
}

function expansion(id) {

	var flag = $("#flag" + id).val();
	if (flag == 0) {
		$("#invite-content" + id).addClass("on");
		$("#invite-content" + id).removeClass("invite-content");
		$("#content" + id).html("收起");
		$("#flag" + id).val(1);
		flag = 1;
	} else {
		flag = 0;
		$("#invite-content" + id).addClass("invite-content");
		$("#invite-content" + id).removeClass("on");
		$("#content" + id).html("展开");
		$("#flag" + id).val(0);
	}
}

function browsePictures(imgUrl) {

	var number = 0;
	for (var i = 0; i < imgArr.length; i++) {
		if (imgArr[i] == imgUrl) {
			number = i;
		}
	}
	photoBrowser.open({
		images : imgArr,
		activeIndex : number,
		placeholderImg : '../img/擦汗atmrt.png',
		bgColor : '#000'
	}, function(ret, err) {
		if (ret.eventType == 'click') {//单点关闭
			photoBrowser.close();
		}
	});
}