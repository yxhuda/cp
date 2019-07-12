var page = 1;
var isLast = false;
var isLoading = false;
//var btnArray = ['确认', '取消'];
var slipList;
var dataList;

apiready = function() {

	//	mui.init();
	init();

}
function init() {

	showLoading();
	var url = "favorite/favorite.do";
	var bodyParam = {
		body : {
			type : 1,
			page : page,
			limit : 6
		}
	};
	ajaxRequest(url, bodyParam, function(ret, err) {
		$("#collectionHtml").html('');
		hideLoading();
		if (err) {
			netError("init");
		} else {
			
			if (ret.code == 1) {

				if (isNotNull(ret.products)) {
			
					var html = '';
					for (var i = 0; i < ret.products.length; i++) {
						html += collectionHtml(ret.products[i]);
					}
					$("#collectionHtml").html(html);
					for (var i = 0; i < ret.products.length; i++) {
						cacheImage('goodImg_' + ret.products[i].id, ret.products[i].poductImg2);
					}
					api.parseTapmode();
					api.addEventListener({
						name : 'scrolltobottom',
						extra : {
							threshold : 0 //设置距离底部多少距离时触发，默认值为0，数字类型
						}
					}, function(ret, err) {
						getMoreCollectList();
					});
				} else {
					empty();
				}
			} else {
				empty();
			}
		}
	});
}

function getMoreCollectList() {
	if (isLast)
		return;
	if (isLoading)
		return;
	page++;
	isLoading = true;
	var url = "favorite/favorite.do";
	var bodyParam = {
		body : {
			type : 1,
			page : page,
			limit : 6
		}
	};
	ajaxRequest(url, bodyParam, function(ret, err) {
		//hideLoading();
		isLoading = false;

		if (err) {
			netError('getReleaseDynamic');
		} else {
			if (ret.code == 1) {
				if (isNotNull(ret.products)) {
					var html = '';
					for (var i = 0; i < ret.products.length; i++) {
						html += collectionHtml(ret.products[i]);
					}
					$("#collectionHtml").append(html);
					for (var i = 0; i < ret.products.length; i++) {
						cacheImage('goodImg_' + ret.products[i].id, ret.products[i].poductImg2);
					}
					api.parseTapmode();
				} else {
					toast('没有更多内容了');
					isLast = true;
				}
			} else {
				toast('没有更多内容了');
				isLast = true;
			}
		}
	});
}

//function collectionHtml(data){
//	if(data.isGroup==0){
//		var html = '';
//		html += '<div class="row-list"  tapmode="" onclick="getProductDetail(\''+data.productId+'\');">';
//		html += '<div class="row-img"><img src="../img/mrt.png" id="goodImg_'+data.id+'"></div>';
//		html += '<div class="row-right">';
//		html += '<div class="row-top">';
//		if(isNotNull(data.productName)){
//			html += '<div class="row-title"><em>特价优惠</em>'+data.productName+'</div>';
//		}else{
//			html += '<div class="row-title"><em>特价优惠</em></div>';
//		}
//		if(data.shopName!=null){
//			html += '<div class="row-text">'+data.shopName+'</div>';
//		}else{
//			html += '<div class="row-text"></div>';
//		}
//		html += '</div>';
//		html += '<div class="row-bottom">';
//		html += '<div class="RowBottom-text"><span>￥</span><span>'+formatterNumber(data.preferentialPrice)+'</span></div>';
//		html += '<div class="RowBottom-right">已拼'+getNumber(data.saleNum)+'件</div>';
//		html += '</div>';
//		html += '</div>';
//		html += '</div>';
//	}else if(data.isGroup==1){
//		var html = '';
//		html += '<div class="row-list"  tapmode="" onclick="getGroupProductDetail(\''+data.productId+'\');">';
//		html += '<div class="row-img"><img src="../img/mrt.png" id="goodImg_'+data.id+'"></div>';
//		html += '<div class="row-right">';
//		html += '<div class="row-top">';
//		if(isNotNull(data.productName)){
//			html += '<div class="row-title"><em>特价优惠</em>'+data.productName+'</div>';
//		}else{
//			html += '<div class="row-title"><em>特价优惠</em></div>';
//		}
//		if(data.shopName!=null){
//			html += '<div class="row-text">'+data.shopName+'</div>';
//		}else{
//			html += '<div class="row-text"></div>';
//		}
//		html += '</div>';
//		html += '<div class="row-bottom">';
//		html += '<div class="RowBottom-text"><span>￥</span><span>'+formatterNumber(data.groupbuyPrice)+'</span></div>';
//		html += '<div class="RowBottom-right">已拼'+getNumber(data.saleNum)+'件</div>';
//		html += '</div>';
//		html += '</div>';
//		html += '</div>';
//	}
//
//		return html;
//}

//function openslipList(){
//		_d(dataList);
//		slipList = api.require('slipList');
//		slipList.open({
//		x:0,
//		y:5,
//		w:360,
//		h:200,
//		rightBtn:[
//		{
//		    bg: '#ff0000',          //按钮背景色，支持 rgb，rgba，#，默认#388e8e，可为空
//		    title:'删除',    //按钮名字，字符串类型，默认‘按钮’，可为空
//		    titleColor: '#fff',   //按钮标题颜色，支持 rgb，rgba，#，默认#ffffff，可为空
//		    selectedColor:'#fff',//按钮选中时候的颜色值,支持 rgb，rgba，#，可为空,为空则无选中变化
//		},
//		{
//		    bg: '#FFD700',          //按钮背景色，支持 rgb，rgba，#，默认#388e8e，可为空
//		    title:'取消',    //按钮名字，字符串类型，默认‘按钮’，可为空
//		    titleColor: '#fff',   //按钮标题颜色，支持 rgb，rgba，#，默认#ffffff，可为空
//		    selectedColor:'#fff',//按钮选中时候的颜色值,支持 rgb，rgba，#，可为空,为空则无选中变化
//		}],
//		rightBg:'#ff0000',
//		itemStyle:{
//		    borderColor:'',  //item间分割线颜色，支持 rgb，rgba，#，默认#696969，可为空
//		    bgColor: '#fff',    //item背景色，支持 rgb，rgba，#，默认#AFEEEE，可为空
//		    selectedColor:'#fff',//item背景选中色,支持 rgb，rgba，#，默认#f5f5f5可为空
//		    height: 120,      //一条item的高度，数字类型，默认55，可为空
//		    avatarH:20,//头像（上下居中）的高(不可超过height)，数字类型，默认45，可为空
//		    avatarW:  0,   //头像（距左边框距离和上下相等）的宽，数字类型，默认45，可为空
//		    placeholderImg:'',//头像为网络资源时的占位图,仅支持本地路径协议,有默认图标，可为空
//		    titleSize:16,//标题字体大小，数字类型，默认10，可为空
//		    titleColor :'#000',    //标题字体颜色，支持 rgb,rgba,#，默认：#696969,可为空
//		    headlineSize:15,//大标题字体大小，数字类型，默认15，可为空
//		    headlineColor:'#a9a9a9', //大标题字体颜色，支持 rgb,rgba,#，默认：#388e8e,可为空
//		    subTitleSize:13,  //子标题字体大小，数字类型，默认13，可为空
//		    subTitleColor:'#ff0000',  //子标题字体颜色，支持 rgb,rgba,#，默认：#000000,可为空
//		    remarkSize: 15,  //备注字体的大学，数字类型，默认15，可为空
//		    remarkColor: '#000', //备注字体的颜色，支持 rgb,rgba,#,默认#696969，可为空
//		    remarkMargin:10, //备注距离右边的边距，数字类型，默认10，可为空
//		},
//	    datas: [{
//      img: 'widget://res/img/chatBox_add1.png',
//      title: dataList[0].productName,
//      headline: dataList[0].shopName,
//      subTitle: '￥'+dataList[0].preferentialPrice,
//      titleIcon: 'widget://res/img/ic/slipList_watch.png',
//      subTitleIcon: 'widget://res/img/ic/slipList_star.png',
////      remark: '完成'
//  }
//
//  ]
//	}, function(ret, err) {
//		_d(ret);
//		_d(err);
//	    if (ret) {
//	    _d("qqq");
//	        alert(JSON.stringify(ret));
//	    } else {
//	    _d("fff");
//	        alert(JSON.stringify(err));
//	    }
//	});
//}

function collectionHtml(data) {
	
	var html = '';
	//html += '<div name="product_' + data.productId + '" class="mui-table-view">';
	html += '<li class="mui-table-view-cell">';
	html += '<div class="mui-slider-right mui-disabled" style="margin-top:5px">';
	html += '<a class="mui-btn mui-btn-red" tapmode="" onclick="cancelfavourite(\'' + data.productId + '\');">删除</a>';
	html += '</div>';
	html += '<div class="mui-slider-handle">';
	if (data.isGroup == 0) {
		html += '<div class="row-list"  tapmode="" onclick="getProductDetail(\'' + data.productId + '\');" >';
		html += '<div class="row-img" ><img src="../img/mrt.png" id="goodImg_' + data.id + '"></div>';
		html += '<div class="row-right">';
		html += '<div class="row-top">';
		if (isNotNull(data.productName)) {
			html += '<div class="row-title">' + data.productName + '</div>';
		} else {
			html += '<div class="row-title"></div>';
		}
		if (data.shopName != null) {
			html += '<div class="row-text">' + data.shopName + '</div>';
		} else {
			html += '<div class="row-text"></div>';
		}

		html += '</div>';
		html += '<div class="row-bottom">';
		html += '<div class="RowBottom-text"><span>￥</span><span>' + formatterNumber(data.preferentialPrice) + '</span></div>';
		html += '<div class="RowBottom-right">已售' + getNumber(data.saleNum) + '件</div>';
		html += '</div>';
		html += '</div>';
		html += '</div>';
		html += '</li>';
		html += '</div>';
	} else {
		html += '<div class="row-list"  tapmode="" onclick="getGroupProductDetail(\'' + data.productId + '\');">';
		html += '<div class="row-img"><img src="../img/mrt.png" id="goodImg_' + data.id + '"></div>';
		html += '<div class="row-right">';
		html += '<div class="row-top">';
		if (isNotNull(data.productName)) {
			html += '<div class="row-title">' + data.productName + '</div>';
		} else {
			html += '<div class="row-title"></div>';
		}
		if (data.shopName != null) {
			html += '<div class="row-text">' + data.shopName + '</div>';
		} else {
			html += '<div class="row-text"></div>';
		}

		html += '</div>';
		html += '<div class="row-bottom" >';
		html += '<div class="RowBottom-text" ><span>￥</span><span>' + formatterNumber(data.groupbuyPrice) + '</span></div>';
		html += '<div class="RowBottom-right" >已拼' + getNumber(data.saleNum) + '件</div>';
		html += '</div>';
		html += '</div>';
		html += '</div>';
		html += '</div>';
		//html += '</div>';
	}

	return html;
}

function cancelfavourite(id) {
				

			

	var url = "favorite/dofavorite.do";
	var bodyParam = {
		body : {
			id : id,
			type : 1
		}
	};
	ajaxRequest2(url, bodyParam, function(ret, err) {
		if (err) {
			toast('服务器开了个小差，在刷新尝试一下!!!');
		} else {
			
			if (ret.code == 1) {
				toast("取消收藏成功");
				page = 1;
				isLast = false;
				isLoading = false;
				init();
			} else {

				if (ret.code == 1) {
						toast("取消收藏成功");
						page = 1;
						isLast = false;
						isLoading = false;
						init();
				} else {
					toast("取消收藏失败");
				}

			}
		}
	});
}

