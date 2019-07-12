var historyCache = new Array();
var id;

apiready = function() {
	id = api.pageParam.id
	var header = $api.byId('header');
	$api.fixStatusBar(header);
	if ($api.getStorage('shopsearchKey') != undefined) {
		historyCache = $api.getStorage('shopsearchKey');
	}
	$('#search').focus();
	init();
}
//初始化
function init() {

	if (historyCache.length > 0) {
		var html = '';
		for (var i = historyCache.length-1;i >= 0;i--) {
			html += '<a tapmode="" onclick="searchContent(\''+historyCache[i]+'\')">'+historyCache[i]+'</a>';
		}

		$('#history').html(html);
		api.parseTapmode();
	}
	else {
		$('#historyPanel').hide();	
	}
}


//开始搜索
function searchContent(key){
	
	var data = {};
	data.key = key;
	data.id = id;
	openWinNew('shopsearchgoods', '搜索结果', {}, data,true);
}



function clearHistory(){
	$api.rmStorage('shopsearchKey');
	$('#history').html('');
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
	$api.setStorage('shopsearchKey',historyCache);
	searchContent($('#search').val());
}

