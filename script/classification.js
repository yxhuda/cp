var classInfo;

apiready = function() {
//	api.refreshHeaderLoadDone();
//	dropDownLoad(function(ret, err) {
//		init();
//	});
	init();
}
function init() {


	showLoading();
	var url = "productClass/getFirstClass.do";
	var bodyParam = {};
	ajaxRequest(url, bodyParam, function(ret, err) {
		hideLoading();
		if (err) {
			_d(err);
			api.removeLaunchView();
			netError("init");
		} else {

			if (ret.code == 1) {
				if (isNotNull(ret.firstClass)) {
					classInfo = ret.firstClass;
					var html = '';
					for (var i = 0; i < ret.firstClass.length; i++) {
						if (i > 0) {
							html += ' <a class="scrolltab-item" ><div class="scrolltab-title">' + ret.firstClass[i].name + '</div></a>';

						} else {
							html += ' <a class="scrolltab-item crt" ><div class="scrolltab-title">' + ret.firstClass[i].name + '</div></a>';
						}
					}
					//getTwoClass(ret.firstClass[0].id);

					var html1 = '';
					for (var i = 0; i < ret.firstClass.length; i++) {
						if (isNotNull(ret.firstClass[i].secondClass)) {
							html1 += ' <div class="scrolltab-content-item">';
							html1 += ' <a class="aui-flex-box" href="javascript:;">';
							html1 += ' <div class="aui-flex-box-bd">' + ret.firstClass[i].name + '</div>';
							html1 += '<div class="aui-flex-box-fr" tapmode="" onclick="getMoreTwoClass(\'' + ret.firstClass[i].id + '\');"><span>查看全部</span><i class="icon iconfont iconarrow-left"></i></div>';
							html1 += '</a>';
							html1 += '<div>';

							html1 += '<div class="aui-flex-links">';
							for (var j = 0; j < ret.firstClass[i].secondClass.length; j++) {
							if(j<12){
								html1 += '<a href="javascript:;" class="aui-flex-links-item" tapmode="" onclick="getgoodList(\'' + ret.firstClass[i].id + '\',\'' + ret.firstClass[i].secondClass[j].id + '\');">';
								html1 += '<div class="aui-flex-links-img">';
								html1 += '<img src="../img/class.png" id="class_' + ret.firstClass[i].id + '_' + ret.firstClass[i].secondClass[j].id + '" alt="">';
								html1 += '</div>';
								html1 += ' <div class="aui-flex-links-text">' + ret.firstClass[i].secondClass[j].name + '</div>';
								html1 += '</a>';
}
							}
							html1 += '</div>';

							html1 += ' </div>';
							html1 += ' </div>';
							
						} else {
							$('.scrolltab-content-item').hide();
						}

					}
			
					$("#classOneHtml").html(html);
					$("#classTwoHtml").html(html1);
					for (var i = 0; i < ret.firstClass.length; i++) {
						for (var j = 0; j < ret.firstClass[i].secondClass.length; j++) {
							cacheImage('class_' + ret.firstClass[i].id + '_' + ret.firstClass[i].secondClass[j].id, ret.firstClass[i].secondClass[j].icons);
						}
					}
					scrollTab();
					api.parseTapmode();
				} else {
					empty();
				}
			} else {
				empty();
			}
			api.removeLaunchView();
		}
	});
}

//获取二级更多分类
function getMoreTwoClass(class_id) {
	
	var data = {};
	var title = '';
	for (var i = 0; i < classInfo.length; i++) {
		if (classInfo[i].id == class_id) {
			data.classInfo = classInfo[i].secondClass;
			title = classInfo[i].name;
		}
	}
	data.class_two_id = 0;
	data.class_id = class_id;
	openWinNew("classificationlist", title, {}, data);
}

function getgoodList(class_id, class_two_id) {
	
	var data = {};
	var title = '';
	for (var i = 0; i < classInfo.length; i++) {
		if (classInfo[i].id == class_id) {
			data.classInfo = classInfo[i].secondClass;
			title = classInfo[i].name;
		}
	}
	data.class_two_id = class_two_id;
	data.class_id = class_id;
	openWinNew("classificationlist", title, {}, data);
}

function scrollTab() {
	$('[data-ydui-scrolltab]').each(function() {
		var $this = $(this);
		$this.scrollTab(window.YDUI.util.parseOptions($this.data('ydui-scrolltab')));
	});
}