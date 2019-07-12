var data;
apiready = function(){
	data = api.pageParam.data;

	if (data){
	if(isNotNull(data.header)){
	$('#headerImg').attr("src",data.header);
	}else{
	$('#headerImg').attr("src",'../img/verify03.png');
	}
		$('#realName').html(data.realName);
		$('#productName').html(data.productName);
		$('#price').html('￥'+data.price);
		cacheImage('productImg',data.productImg);
	}
}

function showProduct(){
	if (data.isGroup == 0) {
		getProductDetail(data.product_id);
		api.closeFrame({name:'shareFrame'});
	}
	else {
		getGroupProductDetail(data.product_id);
		api.closeFrame({name:'shareFrame'});
	}
}
	