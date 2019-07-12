
apiready = function(){
	init();
}

function init(){
	showLoading()
	var url = "page/problem.do";
	ajaxRequest(url,{},function(ret,err){
	hideLoading()
		if(err){
			netError('init');
		}else{
			if(ret.code==1){
				infoList = ret.page;
				var html = '';
				
				for(var i=0;i<ret.page.length;i++){
					if(i%2==0 && i>0){
						html += '<div class="height"></div>';
					}else{
						html += '<div class="borderlink"></div>';
					}
					html += '<div class="personinfor-list"  tapmode="" onclick="getInfo(\''+ret.page[i].id+'\');">';
					html += '<div class="personinfor-left">'+ret.page[i].title+'</div>';
					html += '<div class="personinfor-right"><i class="icon iconfont iconarrow-left"></i></div>';
					html += '</div>';
				}
				$("#infoHtml").html(html);
				api.parseTapmode();
			}
		}
	});
	

}

function getInfo(id){
	
	var data = {};
	for(var i=0;i<infoList.length;i++){
		if(infoList[i].id==id){
			data = infoList[i]
		}
	}
	openWinNew('agreement', data.title, {}, data,true);
}
