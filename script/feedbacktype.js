apiready = function(){
	
}

function feedback(type){
	var data = {};
		data.type=type;
		openWinNew('feedback', '意见反馈',{}, data,true);
}