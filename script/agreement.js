apiready = function(){
	init();
}

function init(){
	var infoDetails = api.pageParam;
	$("#infoDetailsHtml").html(infoDetails.context);
}