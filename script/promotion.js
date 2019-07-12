var user;
var datas;

var allmoney;
var pay=0;
apiready = function() {
	api.addEventListener({
		name : 'perform' 
	}, function(ret, err) {
		init();
	});
	init();
}
function init() {

	showLoading();
	user = getUser();
	var url = "spread/spreadInfo";
	ajaxRequest(url, {}, function(ret, err) {
		hideLoading();
		if (err) {
			netError("init");
		} else {
			if (ret.code == 1) {
				allmoney = ret.spreadInfo.settleAccount;
				datas = formatterNumber(ret.spreadInfo.totalAccount)
				$('#waitPay').html('￥' + formatterNumber(ret.spreadInfo.settleAccount) );
				$('#paied').html('￥' + formatterNumber(ret.spreadInfo.useAccount) );
				pay=formatterNumber(ret.spreadInfo.useAccount);
				$('#teamcount').html(ret.spreadInfo.shopCount + '人');
				$('#totalMoney').html('￥' + formatterNumber(ret.spreadInfo.totalAccount) );
			}
		}
	});
}

function profit() {
	
	var data = {};
	data.settleAccount = allmoney;
	openWinNew("income", '可提现', {}, data, true);
}
function incomelist() {
	if(pay>0){
openWinNew('incomelist','已提现', {}, {},true)
}else{
	toast("当前没有已提现的金额")
}
}
