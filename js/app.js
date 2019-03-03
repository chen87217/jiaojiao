//本地
// var server = 'http://192.168.5.100:9092'; // 本地服务器地址
var server = 'http://47.105.113.58:9092'; // 在线服务器地址

var time_out = 3000;

var g_mui;  //mui全局变量
var uuid;  //设备id
var token;  // token
var mb;     //手机号
var lmobile;  //登录手机号
var zmobile;  //注册手机号
var step;

(function(){
	window.project = window.app = {
		/*
		 * 初始化
		 * @param  mui 初始化参数 {}
		 * @param  is_root 是否入口
		 * @param  is_auth 是否需要权限
		 * @param  is_311 是否跳转
		*/
		isMoblie: function(){
			var ua = navigator.userAgent.toLowerCase();
			if(!(/iphone|ipad|ipod/.test(ua) || /android/.test(ua))){
				return 0;
			}else{
				if(/iphone|ipad|ipod/.test(ua))
					return 1;
				else
					return 2;
			}
		},
		
		init: function(mui_args,is_root, is_auth, is_311){
			
			//禁止非移动端访问
			
			if(project.isMoblie() == 0){
				//console.log('非移动端');
				//return;
			}
			
			
	  		mb = window.localStorage.getItem('mb')?window.localStorage.getItem('mb'):'';  
	  		lmobile = window.localStorage.getItem('lmobile')?window.localStorage.getItem('lmobile'):'';  
	  		zmobile = window.localStorage.getItem('zmobile')?window.localStorage.getItem('zmobile'):'';  
			step = window.localStorage.getItem('step')?window.localStorage.getItem('step'):'';  
			
			g_mui = mui;
			
			if(mui_args){
				mui.init(mui_args);
			}
			
			g_mui.plusReady(function(){
				
				if(is_root){
					//手动关闭启动页
					plus.navigator.closeSplashscreen();
				}
				
				//禁止横屏
           		plus.screen.lockOrientation("portrait-primary"); 
           		
           		uuid = plus.device.uuid;
           		
           		//判断是否登录
           		var status = 0;  //0:未登录   1:完成注册信息   2:登录   3:进入主页
           		if(is_311){
           			if(mb == ''){
	           			msg = '请登录'
	           			project.auth(is_root, is_auth, msg, status);	
	           			
	           		}else{
	           			var url = '/Api/Member/GetMember';
	           			project.ajax(url, {mobile:mb}, function(data){
	           				member_info = data.data;
	           				msg = '';  //显示消息
	           				switch(member_info.step){
	           					case 1:
	           						status = 1;
	           						msg = '请完善注册信息';
	           						break;
	           					case 2:
	           						msg = '请重新登录';
	           						if(member_info.is_expire == 0){
	           							if(member_info.token == token && token != ''){
	           								status = 3;
	           							}else{
	           								status = 2;
	           							}
	           						}else{
	           							status = 2;
	           						}
	           						break;
	           					default:
	           						msg = '请登录';
	           						status = 0;
	           						break;
	           				}
	           				project.auth(is_root, is_auth, msg, status);
	           			});
	           		}
           		}
			});
			
		},

		/*
		 * 保存 localStorage
		 * @param  args  localStorage参数 {key:value,key:value}
		 * */
		saveSession:function(args){
			for(var idx in args){
				window.localStorage.setItem(idx, args[idx]);
			}
		},
		
		/*
		 * 弹出层
		 * @param  msg  提示消息
		 * @param  options  样式参数  icon,duration, align,verticalAlign
		 * */
		toast:function(msg, options){  
			g_mui.plusReady(function(){
				plus.nativeUI.toast(msg,options);
			});
		},
		
		/*
		 * 权限
		 */
		auth: function(is_root, is_auth, msg, status){
			url = '';
			id = '';
			if(is_auth && !is_root){
				var options = {};
       			options.duration = 100;
       			options.align = 'center';
       			options.verticalAlign = 'center';
       			project.toast(msg,options);
       			
       			switch(status){
       				case 0:
       					url = '../../index.html';
       					id = 'index';
       					break;
       				case 1:
       					url = '../member/regtag.html';
       					id = 'regtag';
       					break;
       				case 2:
       					url = '../member/login.html';
       					id = 'login';
       					break;
       			}
			}else{
				switch(status){
					case 0:
						url = './index.html';
       					id = 'index';
       					break;
       				case 1:
       					url = './html/member/regtag.html';
       					id = 'regtag';
       					break;
       				case 2:
       					url = './html/member/login.html';
       					id = 'login';
       					break;
       				case 3:
       					url = './html/chat/chat.html';
       					id = 'chat';
       					break;
       			}
			}
			if(status == 0 && is_auth == false){
				return;
			}
			args = {};
			args.url = url;
			args.id = id;
			project.open(args); 
		},
		
		/*
		 * 检验手机号正确
		 * @param  tel  手机号
		 * */
		chk:function chk(tel){
			if(tel == '')
				return false;
			var s = /^(13[0-9]|14[5-9]|15[012356789]|166|17[0-8]|18[0-9]|19[8-9])[0-9]{8}$/;  // 验证手机号
			return s.test(tel);
		},
		 
		//打开页面
		open: function(args){
			if(args.styles == undefined){
				var styles = {};
				styles.top = '0px';
				styles.bottom = '0px';
				styles.width = '100%';	
				styles.height = '100%';
				args.styles = styles;
			}else{
				if(args.styles.top == undefined){
					args.styles.top = "0px";
				}
				if(args.styles.bottom == undefined){
					args.styles.bottom = "0px";
				}else{
					args.styles.height = this.getScreenInfo('height') - parseInt(args.styles.bottom) + 'px';
				}
				if(args.styles.width == undefined){
					args.styles.width = "100%";
				}
				if(args.styles.height == undefined){
					args.styles.height = "100%";
				}
			}
			if(args.show == undefined){
				args.show = true;
			}
			if(args.showType == undefined){
				args.showType = 'pop-in';
			}
			if(args.showTime == undefined){
				args.showTime = 200;
			}
			if(args.waiting == undefined){
				args.waiting = false;
			}
			if(args.extras == undefined){
				args.extras = {};
			}
			
			g_mui.openWindow({ 
	            url:args.url, 
	            id:args.id,  
	            styles:{ 
	                top: args.styles.top,
	                bottom: args.styles.bottom,
	                width: args.styles.width, 
	                height: args.styles.height,
	            },show:{
	                autoShow:args.show,
	                aniShow:args.showType,
	                duration:args.showTime
	            },waiting:{ 
	                autoShow:args.waiting,
	            },
	            extras:args.extras
	        });
		},
		
		//子页面
		subpages:function(pages, subpage_style, currpage, index){
			g_mui.plusReady(function(){
				aniShow = {}; 
				self = plus.webview.currentWebview();   
				for (var i = 0; i < pages.length; i++) {
			        var temp = {};
			        var sub = plus.webview.create(pages[i],pages[i],subpage_style,{});
			        if (i != index) {
			            sub.hide();
			        }else{
			            temp[pages[i]] = "true";
			            g_mui.extend(aniShow,temp);
			        }
			        self.append(sub);
			    }
			    //当前激活选项
			    activeTab = currpage;
			    
			    plus.webview.show(activeTab,"slide-in-right",plus.os.ios ? 200 : 100); 
			    
			});
		},
		
		/*
		 * 监听事件
		 * @param  element 元素
		 * @param  e 事件
		 * @param  callback 回调
		 * */
		listen: function(element, e, callback){
			element.addEventListener( e, function(){
				callback(this);
			});
		},
		
		/*
		 * 绑定事件
		 * @param  pnode 父元素
		 * @param  cnode 子元素
		 * @param  e 事件
		 * @param  callback 回调
		 * */
		bind: function(pnode, cnode, e, callback){
			g_mui(pnode).on(e, cnode, function(){
				callback(this);
			});
		},
		
		/*
		 * 触发
		 * @param  targetId view id
		 * @param  fnName 函数名称
		 * @param  jsonData json格式数据
		 * */
		tigger: function(targetId,fnName,jsonData){
			g_mui.plusReady(function(){
				var preView = plus.webview.getWebviewById(targetId);
				g_mui.fire(preView,fnName,jsonData); 
			});
		},
		
		/*
		 * 自定义事件
		 * @param  fnName 函数名称
		 * @param  callback 回调
		 */
		event: function(fnName, callback){
			window.addEventListener( fnName, function(e){
				callback(e);
			});
		},
		
		/*
		 * 滚动
		 * @param  isClass 是否是 class 元素
		 * @param  ename 元素 名称
		 */
		scroll: function(isClass,ename){
			var elem = null;
			if(isClass == true){
				elem = g_mui('.'+ename);
			}
			else{
				elem = g_mui('#'+ename);
			}
			elem.scroll({
				bounce: false,//滚动条是否有弹力默认是true
				indicators: false, //是否显示滚动条,默认是true
				deceleration: 0.0005 //flick 减速系数，系数越大，滚动速度越慢，滚动距离越小，默认值0.0006 
			});
		},
		
		/*
		 * get or post ajax请求
		 * @param  url 请求地址
		 * @param  args 请求参数 {}
		 * @param  mode 请求方式  get  post
		 * @param  callback 回调函数
		 * @param  dataType 返回数据类型  默认 json
		 */
		request: function(url, args, mode, callback, dataType){
			url = server + url;
			if(dataType == undefined){
				dataType = 'json';
			}
			switch(mode.toLowerCase()){
				case 'get':
					g_mui.get(url, args, function(data){
						callback(data);
					}, dataType);
					break;
				case 'post':
					g_mui.post(url, args, function(data){
						callback(data);
					}, dataType);
					break;
			}
			return;
		},
		
		/*
		 * ajax请求  处理超时  异常情况
		 * @param  url 请求地址
		 * @param  args 请求参数  {}
		 * @param  mode 请求方式  get  post
		 * @param  callback 回调函数
		 * @param  async  默认异步  true
		 * @param  headers   {'Content-Type':'application/json'}
		 * @param  dataType 返回数据类型  默认 json
		 */
		ajax:function(url, args, callback, mode, timeout, async, headers, dataType){
			url = server + url;
			if(mode == undefined){
				mode = 'get';
			}
			if(timeout == undefined){
				timeout = time_out;
			}
			if(async == undefined){
				async = true;	
			}
			if(headers == undefined){
				headers = {'Content-Type':'application/json'};	
			}
			if(dataType == undefined){
				dataType = 'json';
			}
			
			g_mui.ajax(url, {
				data: args,
				dataType: dataType,
				async:async,
				type: mode,
				timeout: timeout,
				headers: headers,  
				success: function(data){
					callback(data);
				},
				error:function(xhr,type,errorThrown){
					//callback({ code: 0,  data:{step:1, mobile:'18671402429', is_expire:0} , msg: '' });   //test
					callback({ code: -200,  data:{} , msg: '' });  
				}
			});
		},
		
		/*
		 * 获取屏幕高度或宽度
		 */
		getScreenInfo:function(WH){
			if(WH == 'width'){
				return document.documentElement.clientWidth || document.body.clientWidth;
			}else{
				return document.documentElement.clientHeight || document.body.clientHeigth;
			}
		},
		
		/**
		 * 原生actionSheet 
		 * @param jsonData 按钮参数
		 * @param callback  回调
		 */
		actionSheet:function(jsonData, callback){
			var args = {};
			if(jsonData.title){
				args.title = jsonData.title;
			}
			args.buttons = jsonData.buttons;
			args.cancel = '取消';
			
			g_mui.plusReady(function(){
				plus.nativeUI.actionSheet(args, function(e){
					callback(e);
				});
			});
		},
			
		/**	
		 * 照相机 
		 * @param succFn 成功回调函数
		 * @param errFn  失败回调函数
		 */
		camera:function(succFn, errFn){
			g_mui.plusReady(function(){
				var cmr = plus.camera.getCamera();
				cmr.captureImage( function ( p ) {
				        plus.io.resolveLocalFileSystemURL( p, function ( entry ) {
				            var img_name = entry.name;
				            var img_path = entry.toLocalURL();
				         	succFn && succFn(img_path,img_name);
				        }, function ( e ) {
				            errFn && errFn(e.message);
				        } );
				    }, function ( e ) {
				        errFn && errFn(e.message);
				}, {filename:'_doc/camera/',index:1} );
			});
		},
		
		/**
		 * 相册
		 * @param succFn 成功回调函数
		 * @param errFn  失败回调函数
		 * @param isMultiple 是否为选
		 */
		album:function(succFn, errFn,isMultiple, number){
			if(!isMultiple){
				var args = {filter:"image",multiple:false,system:false};
			}else{
				var args = {filter:"image",multiple:true, maximum: number, system:false, onmaxed: function(){plus.nativeUI.alert('最多只能选择'+number+'张图片')}}
			}
			g_mui.plusReady(function(){
				plus.gallery.pick( function(path){
	     			succFn && succFn(path);
				}, function ( e ) {
					errFn && errFn(e.message);
				}, args);
			});
		},  
		
		/**
	 	* 相册多选
	 	* @param succFn 成功回调函数
		* @param errFn  失败回调函数
		 */
		galleryImgs:function(succFn, errFn, maximum){
			project.album(function(jsonData){
					data = jsonData.files;
					var imgs = [];
					for(var a in data){
						imgs.push(data[a]);
					}
					succFn && succFn(imgs);
				},function(error){
					errFn && errFn(error);
				},true, maximum);
		},
		
		/**
		 * 图片上传
		 * @param {Object} uploadUrl 上传地址
		 * @param {Object} filePath  文件路径
		 * @param {Object} succFn 	   成功回调
		 * @param {Object} errFn     失败回调
		 */
		uploadFiles:function(uploadUrl,filePath,succFn,errFn){
			var files=[];
			var n=filePath.substr(filePath.lastIndexOf('/')+1);
			files.push({name:"uploadkey",path:filePath});       
			if(files.length<=0){
			    this.prompt("没有添加上传文件");
			    return;
			}
			g_mui.showWaiting('上传中...');      
			var task = g_mui.uploader.createUpload(uploadUrl,
			    {method:"POST"},
		        function(t,status){ 
		  
		            if(status==200){
		                var responseText = t.responseText;
		                var json = eval('(' + responseText + ')');
		                var files = json.files;
		                var img_url = files.uploadkey.url;   
		                succFn(img_url);
		                project.closeWait();
		            }else{
		            	errFn && errFn(status);
		                project.closeWait();
		            }
		        }
		    );
		    task.addData("client","");
		    task.addData("uid",Math.floor(Math.random()*100000000+10000000).toString());
		    for(var i=0;i<files.length;i++){
		        var f=files[i];
		        task.addFile(f.path,{key:f.name});
		    }
		    task.start();
		},
		
		showWait: function(){
			g_mui.plusReady(function(){
				plus.nativeUI.showWaiting();	
			});
		},
		
		closeWait:function(){
			g_mui.plusReady(function(){
				plus.nativeUI.closeWaiting();	
			});
		},
		
		/**
		 * 拨打电话
		 * @param {Object} phone
		 */
		callPhone:function(targetPhone){
			plus.device.dial(targetPhone,false);
		},
		
		//休眠方法
		sleep:function(numberMillis) {
		    var now = new Date();
		    var exitTime = now.getTime() + numberMillis;
		    while (true) {
		        now = new Date();
		        if (now.getTime() > exitTime)
		            return;
		    }
		},
		
	}
})()

