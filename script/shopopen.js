var myUrl;
var user = getUser();
var status;
var msg;
apiready = function() {
	init();
	getShopagreement();
}
function init() {
	var url = 'shop/checkShop.do';
	var bodyParam = {
		body : {
			userId : user.id
		}
	};
	ajaxRequest(url, bodyParam, function(ret, err) {
		if (err) {
			_d(err);
		} else {
			if (ret.code == 1) {
				
				status = ret.status;
				msg = ret.msg
			}
		}
	});

}

function getShopagreement() {
	var url = 'page/getPage.do';
	var bodyParam = {
		body : {
			type : 9
		}
	};

	ajaxRequest(url, bodyParam, function(ret, err) {
		if (err) {
			//			_d(err);
		} else {
			if (ret.code == 1) {
				$("#title").html(ret.page[0].title);
				$("#context").html(ret.page[0].context);
			}
		}
	});
}

function shopagreement1() {
	$(".protocol").show();
	myUrl = 1;
}

function shopagreement2() {
	$(".protocol").show();
	myUrl = 2;
}


$('#hui-dialog-btn-line').click(function() {
	if ($('#c1').prop('checked')) {
		if (status == 0) {
			toast(msg)
		} else if (status == 1) {
			toast(msg)
		} else {
			if (myUrl == 1) {
				var data={};
				data.status=status;
				data.myUrl=myUrl;
				openWinNew('personalshop', '个人入驻', {}, data);
			} else {
				var data={};
				data.status=status;
				data.myUrl=myUrl;
				openWinNew('merchantsshop', '企业入驻', {}, data);
			}
		}
		$(".protocol").hide();
	} else {
		toast("请先阅读入驻协议")
	}
})
