var pushCount = 0;
var jpushbadge = 1;
//推送注册
function openpush(uid, tags) {
	jpush = api.require('ajpush');
	var systemType = api.systemType;
	if (systemType != 'ios') {
		jpush.init(function(ret) {

		});
	}
	var param = {
		alias : uid,
		tags : tags
	};

	jpush.bindAliasAndTags(param, function(ret, err) {
	});
	var old_msgid = '';
	jpush.setListener(function(ret2) {
	});
}
