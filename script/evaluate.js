var vm;
var productNum=0;
apiready = function() {
    init();
		api.addEventListener({
			name : 'uploadComplete'
		}, function(ret, err) {
			//coding...
      vm.products[productNum].imgs=ret.value.pics;
      if(productNum==vm.products.length-1){
				vm.submit();
			}else {
				productNum++;
				uploadOssArray(vm.products[productNum].imgList, "momentPic");
			}
		});
		api.addEventListener({
			name : 'cheangeImgList'
		}, function(ret, err) {
			// var UIMediaScanner = api.require('UIMediaScanner');
			var imgObj = ret.value.imgList;
			if (isNotNull(imgObj)) {
				if (isNotNull(imgObj.list)){
					for (var i = 0; i < imgObj.list.length; i++) {
						vm.products[ret.value.index].imgList.push(imgObj.list[i]['path'])
					}
				}
			}
		});
}

function init() {
let data = JSON.parse(api.pageParam.params);

    vm= new Vue({
        el: '#vue-example',
        data: {
            data: data,
            products: data.orderDetails,
						rate:{},
						totalNumber:3,
						imgCount:0,
						imgList:[],
						resultImgs:[]
        },
        mounted: function() {
            //初始化评分
						let that=this;
            ajaxRequest("eval/getEvalLable.do",{body:{orderId:data.id}},function(ret,err){
								if(err){
									_d(err);
								}else{
									if(ret.code==1){
										for (var i = 0; i < ret.list.length; i++) {
											for (var z = 0; z < ret.list[i].lable.length; z++) {
											  ret.list[i].lable[z].isShow=false;
											}
											ret.list[i]['imgList']=[];
										}

										that.products=ret.list;
									}else{
										toast("网络通信异常,请重试");
										return false;
									}
								}
							})
            for (var i = 0; i < this.products.length; i++) {

                //默认0星
								that.rate['score1'+i]="3";
								that.rate['score2'+i]="3";
								that.rate['score3'+i]="3";

								that.rate['star1'+i] = new huiStar('#star1'+i);
                that.rate['star1'+i].draw();
                
                hui('#star1'+i).find('.hui-icons-star').eq(2).trigger('click');
								let tmp1='score1'+i;
                that.rate['star1'+i].change = function(starVal) {
                    that.rate[tmp1]=starVal;
                }

								that.rate['star2'+i] = new huiStar('#star2'+i);
                that.rate['star2'+i].draw();
                hui('#star2'+i).find('.hui-icons-star').eq(2).trigger('click');
								let tmp2='score2'+i;
                that.rate['star2'+i].change = function(starVal) {
                    that.rate[tmp2]=starVal;
                }

								that.rate['star3'+i] = new huiStar('#star3'+i);
                that.rate['star3'+i].draw();
                hui('#star3'+i).find('.hui-icons-star').eq(2).trigger('click');
								let tmp3='score3'+i;
                that.rate['star3'+i].change = function(starVal) {
                
                    that.rate[tmp3]=starVal;
                }
              
            }
        },
				methods:{
					//选择标签
					selectLable(id,i,index){
						 Vue.set(this.products[index].lable[i],'isShow',!this.products[index].lable[i].isShow);
					},
					//删除图片
					delImg(i,index){
						 this.products[i].imgList.splice(index,1);
					},
					/***
					 *上传多张图片
					 */
					uploadPhoto(tmpIndex) {
						let that=this;
						if (that.products[tmpIndex].imgList.length>2) {
							toast('最多可上传'+3+'张图片...');
							return;
						}
						// var count = this.totalNumber - parseInt(changeImgList.length);
						// var html = '';
						api.actionSheet({
						    cancelTitle: '取消',
						    buttons: ['拍照', '从相册中选择']
						}, function(ret, err) {
						    var index = ret.buttonIndex;
						    if(index==1){
						    	openCamera(function(ret, err) {
										  that.products[tmpIndex].imgList.push(ret.data)
									})
						    }else if(index==2){
						    	selectImageList(3-that.products[tmpIndex].imgList.length,tmpIndex);
						    }
						});
					},
					//反馈提交验证
					setFeedback(){
						if (!isNotNull($("#textarea").val())) {
							toast("请输入评价内容");
							return;
						}
						let imgLength=0;
						for (var i = 0; i < this.products.length; i++) {
							imgLength+=this.products[i].imgList.length;
						}
						if (imgLength > 0) {
							//上传图片到OSS
							api.showProgress({
								title : '正在上传',
								modal : true
							});
								uploadOssArray(this.products[0].imgList, "momentPic");
						} else {
							this.submit();
						}
					},
					submit(){
               let data=[];
							 for (var i = 0; i < this.products.length; i++) {
							 	      data.push({
												productId:this.products[i].productId,
												orderId:this.products[i].orderId,
												describe:this.rate['score1'+i],
												logistics:this.rate['score2'+i],
												attitude:this.rate['score3'+i],
												content:this.products[i].content,
												labelContent:arrToString(this.products[i].lable.filter(obj=>obj.isShow==true),"name"),
												img:this.products[i].imgs,
												specDesc:this.products[i].specDesc
											})
							 }
							var bodyParam = {
					 			body:{
									data:JSON.stringify(data)
								}
					 		};
							 ajaxRequest2("eval/saveEval.do",bodyParam,function(ret,err){
								 if(err){
									_d(err);
								}else{
									if(ret.code==1){
										toast("评价成功");
										api.sendEvent({
											name : 'orderSubmit'
											});
											api.sendEvent({
											name : 'perform'
											});
										api.closeWin();
										
									}else{
										toast("评价失败");
										return false;
									}
								}
						 	})
					}
				}
    })
      
}
