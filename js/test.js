var headerH, footerH, frameH, frameH2;
	function changeFrame(index) {
		var header = $api.byId('header');
			
			$api.fixStatusBar(header);
			headerH = $api.offset(header).h;
			footerH = 44;
			api.setGlobalData({key:'winHeader',value:headerH});
			api.setGlobalData({key:'footerH',value:footerH});
			//frame的高度为当前window高度减去header和footer的高度
			frameH = api.winHeight - headerH - footerH;
			frameH2 = api.winHeight - footerH;
			iconsize = 20.0;
			$("#header").removeClass("cartempty-back");   //移除class
			if (!isNotNull(index)) {
				index = 0;
			}
			var NVTabBar = api.require('NVTabBar');
			NVTabBar.setSelect({
				index : index,
				selected : true
			});
			
			if (index == 0 || !isNotNull(index)) {
			
				$('#title').hide();
				$('#editCart').hide();
				api.setFrameGroupAttr({
					name : 'chaopin',
					rect : {
						x : 0,
						y : 20,
						w : 'auto',
						h : frameH2
					}
				});
			} else if (index == 1) {
				$('#title').html("商品分类");
				$('#title').show();
				$('#editCart').hide();
				api.setFrameGroupAttr({
					name : 'chaopin',
					rect : {
						x : 0,
						y : headerH,
						w : 'auto',
						h : frameH
					}
				});
			} else if (index == 2) {
				$('#title').html("购物车");
				$("#header").addClass("cartempty-back"); //添加class
				$('#title').show();
				var showCart = api.getGlobalData({key:'showCart'});
				if (showCart == 1)
				{
					$('#editCart').show();
				}
				api.setFrameGroupAttr({
					name : 'chaopin',
					rect : {
						x : 0,
						y : headerH,
						w : 'auto',
						h : frameH
					}
				});
			} else if (index == 3) {
				//$('#title').html("我的");
				$('#title').hide();
				$('#editCart').hide();
				api.setFrameGroupAttr({
					name : 'chaopin',
					rect : {
						x : 0,
						y : 0,
						w : 'auto',
						h : frameH2
					}
				});
			}
			api.setFrameGroupIndex({
				name : 'chaopin',
				index : index
			});
		}