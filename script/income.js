var data;
var type = -1;
var time = 1;
var datatime;

var img;
var title;
apiready = function() {
	data = api.pageParam;
	$('#allmoney').html(data.settleAccount);
	hui('#income').click(function() {
		hui.actionSheet(meuns, cancel, function(e) {
			if (e.index == 0) {
				$('.typeboxlist').show();
				$('.typeboxlist1').hide();
			} else {
				$('.typeboxlist').hide();
				$('.typeboxlist1').show();
			}
			//hui.toast(e.innerHTML);
		});
	});
		api.addEventListener({
		name : 'perform' 
	}, function(ret, err) {
		init();
	});
	init();
}
function init() {

	showLoading();
	var url = 'spread/selectSpreadShop';
	var bodyParam = {
		body : {
			type : type,
			time : datatime
		}
	};
	ajaxRequest(url, bodyParam, function(ret, err) {
		hideLoading();
		if (err) {
			_d(err);
		} else {
			if (ret.code == 1) {
				if (isNotNull(ret.spreadShop)) {
					var html = collectionHtml(ret.spreadShop);
					$("#incomes").html(html);
					for (var i = 0; i < ret.spreadShop.length; i++) {
						cacheImage('shopImg_' + ret.spreadShop[i].id, ret.spreadShop[i].imgUrl);
					}
				} else {
//					empty();
					if(!isNotNull(img)){
						img = '../img/empty.png';
					}
					if(!isNotNull(title)){
						title = '当前没有信息呦~！';
					}
					$('#preloader').remove();
					var html = '<div id="preloader" style="padding-top:20px" class="svger"><i><img src="'+img+'"  width=500 height=500 style="margin-top:50%;"/></i><p>'+title+'</p></div>';
				
					$('body').append(html);
					$('#contents').hide();
				}

			}
		}
	});
}

function withdrawal() {
if(data.settleAccount<=0){
 toast("当前没有可提现金额")
}else{
	var datas = {};
	datas.settleAccount = data.settleAccount;
	openWinNew('withdraw', '提现', {}, datas, true);
	}
}

function collectionHtml(data) {
	var html = '';
	for (var i = 0; i < data.length; i++) {
		html += '<div class="typeboxlist">';
		html += '<div class="typeboxlist-l"><img src="../img/mrt.png" id="shopImg_' + data[i].id + '"></div>';
		html += '<div class="typeboxlist-z">' + data[i].shopName + '</div>';
		html += '<div class="typeboxlist-r"><p>收入金额</p>';
		html += '<p>+￥' + data[i].account + '</p>';
		html += '</div>';
		html += '</div>';
	}
	return html;

}

