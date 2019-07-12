var user;
var isLast,isLoading;
var page = 1;
apiready = function() {
	init();
}
function init() {
	user = getUser();
	var url = "spread/userInfobySoreadId";
	var bodyParam = {
		body : {
			limit : 6,
			page:page
		}
	};
	showLoading();
	isLoading = true;
	ajaxRequest(url,bodyParam, function(ret, err) {
		isLoading = false;
		hideLoading();
		if (err) {
			empty();
		}
		else {
			if (ret.code == 1 && ret.memberList.length > 0) {
				html = genHtml(ret.memberList);
				$('#teamContent').html(html);
				for (var i = 0;i<ret.memberList.length;i++) {
					cacheImage('header'+ret.memberList[i].id,ret.memberList[i].header);
				}
				api.parseTapmode();
				api.addEventListener({
					name : 'scrolltobottom',
					extra : {
						threshold : 0 //设置距离底部多少距离时触发，默认值为0，数字类型
					}
				}, function(ret, err) {
					moreTeamList();
					//更多
				});
			}
			else {
				$('#promotionbody').removeClass('promotionbody')
				empty();
			}
		}
	});
}

function moreTeamList() {
	if (isLast)
		return;
	if (isLoading)
		return;
	page++;
	var url = "spread/userInfobySoreadId";
	var bodyParam = {
		body : {
			limit : 6,
			page:page
		}
	};
	isLoading = true;
	ajaxRequest(url,bodyParam, function(ret, err) {
		isLoading = false;
		hideLoading();
		if (err) {
			isLast = true;
		}
		else {
			if (ret.code == 1 && ret.memberList.length > 0) {
				html = genHtml(ret.memberList);
				$('#teamContent').append(html);
				for (var i = 0;i<ret.memberList.length;i++) {
					cacheImage('header'+
					ret.memberList[i].id,ret.memberList[i].header);
				}
				api.parseTapmode();
				api.addEventListener({
					name : 'scrolltobottom',
					extra : {
						threshold : 0 //设置距离底部多少距离时触发，默认值为0，数字类型
					}
				}, function(ret, err) {
					moreTeamList();
					//更多
				});
			}
			else {
				isLast = true;
			}
		}
	});
}
function genHtml(data) {
	var html = '';
	for (var i = 0;i<data.length;i++) {
		html += '<div class="teamlist">';
		html += '				<div class="teamimg">';
		html += '					<img src="../img/verify03.png" id="header'+data[i].id+'"/>';
		html += '				</div>';
		html += '				<div class="team-content">';
		html += '					<div class="team-title">';
		html += '						<div class="team-name">';
		if (isNotNull(data[i].realName)) {
			html += data[i].realName;
		}
		else {
			html += '未设置昵称';
		}
		html += '						</div>';
		html += '						<div class="team-time">';
		html += '							<span>注册：</span><span>'+data[i].registerTime+'</span>';
		html += '						</div>';
		html += '					</div>';
		html += '					<div class="tame-text">';
		html += '						<span>手机号：</span><span>'+data[i].phone+'</span>';
		html += '					</div>';
		html += '				</div>';
		html += '			</div>';
	}
	return html;
}
