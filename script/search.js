var label;
var historyCache = new Array();

apiready = function() {
	var header = $api.byId('header');
	$api.fixStatusBar(header);
	label = $api.getStorage('searchLabel');
	if ($api.getStorage('searchKey') != undefined) {
		
		historyCache = $api.getStorage('searchKey');
	}
	$('#search').focus();
	init();
}
//初始化
function init() {

	if (isNotNull(label)) {
		var html = '';
		for (var i = 0;i<label.length;i++) {
			html += '<a tapmode="" onclick="searchContent(\''+label[i].name+'\',1)">'+label[i].name+'</a>';
		}
		$('#hotsearch').html(html);
		api.parseTapmode();
	}
	if (historyCache.length > 0) {
		var html = '';
		
			for (var i = historyCache.length-1;i >= 0;i--) {
				html += '<a tapmode="" onclick="searchContent(\''+historyCache[i]+'\',0)">'+historyCache[i]+'</a>';
			}
		

		$('#history').html(html);
		api.parseTapmode();
	}
	else {
		$('#historyPanel').hide();	
	}
}

//关闭窗口
function closeWin(){
	api.closeWin({
	    name: 'search',
	    animation:{
        	type:'none',
    		subType:"from_bottom",
    		duration:300
        },
	});
}

//开始搜索
function searchContent(key,isLabel){
	
	var data = {};
	data.key = key;
	data.isLabel = isLabel;
	openWinNew('searchgoods', '搜索结果', {}, data,true);
}



function clearHistory(){
	$api.rmStorage('searchKey');
	$('#history').html('');
	$('#historyPanel').remove();
}


function searchList() {
	if ($('#search').val() == '') {
		toast('请输入搜索关键字');
		return;
	}
	if ($.inArray($('#search').val(),historyCache) < 0)
	{
		historyCache.push($('#search').val());
	}
	if (historyCache.length > 10)
	{
		historyCache = historyCache.slice(historyCache.length-10);
	}
	$api.setStorage('searchKey',historyCache);
	searchContent($('#search').val(),0);
}

