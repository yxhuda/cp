apiready = function(){
    api.addEventListener({
	    name:'navitembtn'
    },function(ret,err){
    	setCacheData("historyRecord",null); 
    	init();
    });
    
    init();
}

function init(){
	var historyList = getCacheData("historyRecord");
	if(isNotNull(historyList)){
		var html = '';
		var historyList=historyList.reverse();
		for(var i=0;i<historyList.length;i++){
			if(historyList[i].type==false){
				html+='<div class="row-list" tapmode="" onclick="getProductDetail(\''+historyList[i].id+'\')">';
				html+='<div class="row-img"><img src="../img/productListDefault.png" id="history_'+historyList[i].id+'"></div>';
				html+='<div class="row-right">';
				html+='<div class="row-top">';
				html+='<div class="row-title">'+historyList[i].productName+'</div>';
				html+='<div class="row-text">'+historyList[i].shopName+'</div>';
				html+='</div>';
				html+='<div class="row-bottom">';
				html+='<div class="RowBottom-text"><span>￥</span><span>'+formatterNumber(historyList[i].groupbuyPrice)+'</span></div>';
				html+='<div class="RowBottom-right">已拼'+getNumber(historyList[i].saleNum)+'件</div>';
				html+='</div>';
				html+='</div>';
				html+='</div>';
			}else{
				html+='<div class="row-list" tapmode="" onclick="getGroupProductDetail(\''+historyList[i].id+'\')">';
				html+='<div class="row-img"><img src="../img/productListDefault.png" id="history_'+historyList[i].id+'"></div>';
				html+='<div class="row-right">';
				html+='<div class="row-top">';
				html+='<div class="row-title">'+historyList[i].productName+'</div>';
				html+='<div class="row-text">'+historyList[i].shopName+'</div>';
				html+='</div>';
				html+='<div class="row-bottom">';
				html+='<div class="RowBottom-text"><span>￥</span><span>'+formatterNumber(historyList[i].groupbuyPrice)+'</span></div>';
				html+='<div class="RowBottom-right">已拼'+getNumber(historyList[i].saleNum)+'件</div>';
				html+='</div>';
				html+='</div>';
				html+='</div>';
			}
			
		}
		$("#historyHtml").html(html);
		for(var i=0;i<historyList.length;i++){
			cacheImage('history_' +historyList[i].id, historyList[i].productImg2);
		}
	}else{
		$("#historyHtml").html('');
		empty('','当前没有历史信息！');
	}
}