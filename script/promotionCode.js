var user;
apiready = function() {
	init();
}
function init() {
	showLoading();
	user = getUser();
	if (isNotNull(user.header)) {
		cacheImage('headerPic', user.header);
	}
	if (isNotNull(user.realName)) {
		$('#username').html(user.realName);
	}
	var FNScanner = api.require('FNScanner');
	FNScanner.encodeImg({
		content : getCacheData('config').spreadUrl + user.id,
		saveToAlbum : false,
		saveImg : {
			path : 'fs://album.png',
			w : 300,
			h : 300
		}
	}, function(ret, err) {
		hideLoading();
		if (ret.status) {
			$('#qrimg').attr('src', ret.imgPath);
		}
	});
}

$('#tu').click(function() {
	var url;
	html2canvas(document.querySelector("#capture")).then(function(canvas) {
			// canvas宽度
          var canvasWidth = canvas.width;
	         // canvas高度
          var canvasHeight = canvas.height;
          var img = Canvas2Image.convertToImage(canvas,api.winWidth-10, api.winHeight-10);
		url = canvas.toDataURL();
		  //以下代码为下载此图片功能
  		var rand = parseInt(Math.random() * 9999 + 9999);  //随机数
      	var trans = api.require('trans');
      	url = url.substring(22);
		trans.saveImage({
		    base64Str:url,
			album:true,
			imgName:'chaopin'+rand+'.png',
			imgPath:'fs://img'
		}, function(ret, err) {
		    if (ret.status) {
		      	toast("您的二维码已经成功保存到相册");
		    } else {
		        toast("保存失败");
		    }
		});
		
	});
})





















//保存数据,把当前报表的数据保存为Png图片，在触发另存为...的同时，指定文件名和文件格式
//      $('#tu').click(function () {
//          //#proMain:要截图的DOM元素
//          //useCORS:true:解决跨域问题
//          html2canvas(document.querySelector('#proMain'),{useCORS:true}).then(function (canvas) {
//              //获取年月日作为文件名
//              var timers=new Date();
//              var fullYear=timers.getFullYear();
//              var month=timers.getMonth()+1;
//              var date=timers.getDate();
//              var randoms=Math.random()+'';
//              //年月日加上随机数
//              var numberFileName=fullYear+''+month+date+randoms.slice(3,10);
//              var imgData=canvas.toDataURL();
//              //保存图片
//              var saveFile = function(data, filename){
//                  var save_link = document.createElementNS('http://www.w3.org/1999/xhtml', 'a');
//                  save_link.href = data;
//                  save_link.download = filename;
//
//                  var event = document.createEvent('MouseEvents');
//                  event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
//                  save_link.dispatchEvent(event);
//              };
//              //最终文件名+文件格式
//              var filename = numberFileName + '.png';
//              saveFile(imgData,filename);
//              //document.body.appendChild(canvas);  把截的图显示在网页上
//          })
//      })

