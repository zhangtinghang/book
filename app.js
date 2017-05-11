//配置mongodb数据库相关的内容
var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var DB_CONN_STR = 'mongodb://39.108.53.121:27017/book';
//配置node服务器相关内容：
var express = require('express');
var app = express();
var bodyParder = require('body-parser');
var http = require('http');
app.use(bodyParder.urlencoded({extended:true}));

//设置跨域访问
app.all('*', function(req, res, next) {
   res.header("Access-Control-Allow-Origin", "*");
   res.header("Access-Control-Allow-Headers", "X-Requested-With");
   res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
   res.header("X-Powered-By",' 3.2.1');
   res.header("Content-Type", "application/json;charset=utf-8");
   next();
});

//添加数据
app.post('/add',function(req,res){
var insertData = function(db, callback) {
    //连接到表 sites
    var collection = db.collection('sites');
    //插入数据
 var data = [{"rating":{"max":10,"numRaters":0,"average":"0.0","min":0},"subtitle":"基于WeX5可视化开发平台","author":[],"pubdate":"2016-9-1","tags":[],"origin_title":"马科","image":"https://img3.doubanio.com\/mpic\/s29290145.jpg","binding":"平装","translator":[],"catalog":"第1章 HTML5核心技术\n1．1 了解HTML5的概念及发展趋势\n1．1．1 什么是HTML\n1．1．2 什么是HTML5\n1．1．3 H5的主要特性\n1．1．4 H5的发展趋势\n1．2 H5的基本原理\n1．3 H5新增的结构元素\n1．3．1 H5新增元素\n1．3．2 H5标签语义化\n1．3．3 H5元素类型\n1．4 H5App页面\n1．4．1 实现案例：一个基本的H5页面\n1．4．2 实现案例：HenoH5\n1．4．3 实现案例：HS新元素分栏设计\n1．5 CSS3技术\n1．5．1 CSS概念\n1．5．2 CSS引入方法\n1．5．3 CSS基本语法\n1．5．4 CSS选择器\n1．5．5 CSS盒模型\n1．5．6 实现案例：CSSBoxModel布局\n1．5．7 CSS3动画\n1．5．8 实现案例：CSS3动画泡沫按钮\n1．6 CSS布局\n1．6．1 CSS定位\n1．6．2 float详解\n1．6．3 实现案例：圣杯布局\n1．7 H5的浏览器支持情况\n1．8 H5表单\n1．8．1 应用场景\n1．8．2 实现案例：验证邮件地址是否合法\n1．8．3 实现案例：自动弹出日期和时间输入框\n1．8．4 实现案例：获取光标的位置\n1．8．5 实现案例：在输入框中显示提示信息\n1．8．6 实现案例：验证表单内容是否为空\n1．8．7 实现案例：在输入框中自动提示文本\n1．8 ，8实现案例：上传文件\n1．8．9 实现案例：验证表单数据是否合法\n1．9 H5App多媒体的应用\n1．9．1 应用场景\n1．9．2 实现案例：在H5中控制播放的视频\n1．9．3 实现案例：在H5中控制播放的音频\n第2章 Java Script基础\n2．1 Java Script入门\n2．1．1 什么是Java Script\n2．1．2 变量\n2．1．3 语句\n2．1．4 实现案例：直接写入HTML输出流\n2．1．5 实现案例：查找HTML元素\n2．1．6 实现案例：操作HTML元素\n2．2 Java Script基础\n2．2．Java Script函数\n2．2．2 Java Script事件\n2．2．3 实现案例：H5App捕鱼达人\n2．3 利用H5绘制图形\n2．3．1 利用H5Canvas能做什么？\n2．3．2 实现案例：为视频播放器设置截图功能\n2．4 H5数据存储\n2．4．1 应用场景\n2．4．2 实现案例：保存并读取临时数据\n2．4．3 实现案例：保存并读取登录用户名和密码\n2．4．4 实现案例：在H5中保存、清空数据记录\n2．4．5 实现案例：本地存储\n第3章 初识WeX5\n3．1 WeX5简介\n3．1．1 安装及启动\n3．1．2 开发工具介绍\n……\n第4章 页面组件\n第5章 页面代码\n第6章 页面样式\n第7章 App开发\n第8章 项目实战\n附录 仿微店App页面介绍\n参考文献","pages":"256","images":{"small":"https://img3.doubanio.com\/spic\/s29290145.jpg","large":"https://img3.doubanio.com\/lpic\/s29290145.jpg","medium":"https://img3.doubanio.com\/mpic\/s29290145.jpg"},"alt":"https:\/\/book.douban.com\/subject\/26957485\/","id":"26957485","publisher":"高等教育出版社","isbn10":"7040463342","isbn13":"9787040463347","title":"HTML5 App商业开发实战教程","url":"https:\/\/api.douban.com\/v2\/book\/26957485","alt_title":"马科","author_intro":"《HTML5 App商业开发实战教程：基于WeX5可视化开发平台》主要围绕HTML5相关技术讲解基于WeX5可视化开发平台的移动WebApp应用程序开发。首先讲述Web技术的发展及HTML5标准在移动Web技术中的应用，然后结合WeX5移动框架开发工具讲解HTML5App构建，循序渐进地引领读者进入跨平台HTML5App程序开发领域，帮助读者将HTML5技术运用于计算机、平板电脑或手机App程序的实际开发之中。\n《HTML5 App商业开发实战教程：基于WeX5可视化开发平台》共8章，主要内容包括HTML5核心技术，JavaScript基础，初识WeX5，页面组件，页面代码，页面样式，App开发以及项目实战。另外，附录为仿微信App页面介绍。\n《HTML5 App商业开发实战教程：基于WeX5可视化开发平台》优选了9个来自于真实HTML5App商业实战典型教学案例和26个基本的实现案例，采用“任务驱动、精讲多练、理论实战一体化”的教学方法，同时提供丰富的配套教学资源，您可以登录“智慧职教”网站进行在线学习，具体说明见郑重声明页。\n《HTML5 App商业开发实战教程：基于WeX5可视化开发平台》适用于应用型本科、高职高专院校移动互联应用技术课程的教学，也适用于计算机科学与技术、软件开发、信息工程、物联网、电子商务类专业的基础课或主干课，尤其适合使用HTML5App跨平台移动应用开发的课程教学。对于培训机构和移动应用开发者，也是一本不可多得的参考书。","summary":"《HTML5 App商业开发实战教程：基于WeX5可视化开发平台》特点：\n设计精美、版式突出，自学中享受过程-一学生；\n素材丰富、资源立体，备课中不断创造——教师；\n线上线下、平台支撑，教学中实现翻转——教学模式。","price":"35.00"}];
    collection.insert(data, function(err, result) { 
        if(err)
        {
            console.log('Error:'+ err);
            return;
        }else{
        	console.log('存取成功')
        }
        callback(result);
    });
}

MongoClient.connect(DB_CONN_STR, function(err, db) {
    console.log("连接成功！");
    insertData(db, function(result) {
        console.log(result);
        db.close();
    });
});
})

//查询数据
app.post('/find',function(req,res){
	var password = req.body.password;
	//首先得从库里拿到数据
	var selectData=function(db,callback){
		//连接到数据文档
		var collection=db.collection('sites');
		//查询数据
		var whereStr={"title":"剑桥国际英语教程"};  //我们要查询的信息是所有包含这个内容的数据。
		collection.find(whereStr).toArray(function(err,result){
			if(err){
				console.log('Error:'+err);
				return;
			}
			callback(result);
		})
	}
	
	MongoClient.connect(DB_CONN_STR,function(err,db){
		console.log("连接成功");
		selectData(db,function(result){
			console.log(result);
			//把数据返回给前端
			res.status(200),
			res.json(result)	
			db.close();
		})
	})
})

//修改数据
app.post('/modification',function(req,res){
	var password = req.body.password;
	//首先得从库里找到数据
	var updateData = function(db,callback){
		//连接到数据文档
		var collection = db.collection('sites');
		//查询数据
		var whereStr = {"username":"fanhu"};  //我们要修改的目标信息是所有包含这个内容的数据。
		var updataStr = {$set: {"password":password}}; //要修改的信息，使用不同的更新器结果不一样，昨天已经详细讲过。
		
		collection.update(whereStr,updataStr, function(err, result){
			if(err){
				console.log('Error:'+err);
				return;
			}
			callback(result);
		});
	}
	
	MongoClient.connect(DB_CONN_STR,function(err,db){
		console.log("连接成功");
		updateData(db,function(result){
			console.log(result);
			//到这里数据库中对应的信息已经进行了修改，
			db.close();
		});
	});
})

//删除数据
app.post('/delete',function(req,res){
	var password = req.body.password;
	//首先得从库里找到数据
	var delData = function(db,callback){
		//连接到数据文档
		var collection = db.collection('sites');
		//查询数据
		var whereStr = {"username":"fanhu"};  //我们要删除的目标信息是所有包含这个内容的数据。
		
		collection.remove(whereStr, function(err, result){
			if(err){
				console.log('Error:'+err);
				return;
			}
			callback(result);
		});
	}
	
	MongoClient.connect(DB_CONN_STR,function(err,db){
		console.log("连接成功");
		delData(db,function(result){
//			console.log(result);
			//到这里数据库中对应的信息已经进行了修改，
			db.close();
		});
	});
})

//添加用户信息
app.post('/addUser',function(req,res){
var insertData = function(db, callback) {  
    //连接到表 sites
    var collection = db.collection('sitesUser');
    //插入数据
 var data = [{"rating":{"max":10,"numRaters":1,"average":"0.0","min":0},"subtitle":"","author":["理查兹"],"pubdate":"2007-3","tags":[{"count":1,"name":"英语","title":"英语"},{"count":1,"name":"藏书","title":"藏书"},{"count":1,"name":"语言·写作","title":"语言·写作"}],"origin_title":"","image":"https://img1.doubanio.com\/mpic\/s5811478.jpg","binding":"","translator":[],"catalog":"","pages":"113","images":{"small":"https://img1.doubanio.com\/spic\/s5811478.jpg","large":"https://img1.doubanio.com\/lpic\/s5811478.jpg","medium":"https://img1.doubanio.com\/mpic\/s5811478.jpg"},"alt":"https:\/\/book.douban.com\/subject\/2056914\/","id":"2056914","publisher":"外语教学与研究","isbn10":"7560062415","isbn13":"9787560062419","title":"剑桥国际英语教程","url":"https:\/\/api.douban.com\/v2\/book\/2056914","alt_title":"","author_intro":"","summary":"《剑桥国际英语教程》（第3版）这套教材的主要产品包括学生用书（附赠词汇手册）、教师用书。练习册、录音带或CD、录像教材、DVD和CD-ROM等。另外，学生用书和练习册分两个版本——全一册和A、B分册，便于广大师生根据需要选择。录像教材可以作为视听说培训教材单独使用。主要特色：综合培养听说读写技能，兼顾准备和流利度，在交际语境中学习语法，在任务型活动中训练听力，富有时代气息的话题，生动自然的对话语言，全新的语音学习大纲，活泼有趣的口语活动，完善的复习和测试系统，独特的单元自学听力练习，寓教于乐的视听说配套产品，科学的教师培训服务体系。\n\n 剑桥国际英语教程","price":"49.90元"}];
    collection.insert(data, function(err, result) { 
        if(err)
        {
            console.log('Error:'+ err);
            return;
        }else{
        	console.log('存取成功')
        }
        callback(result);
    });
}

MongoClient.connect(DB_CONN_STR, function(err, db) {
    console.log("连接成功！");
    insertData(db, function(result) {
        console.log(result);
        db.close();
    });
});
})

//查询用户信息
app.post('/findUser',function(req,res){
var insertData = function(db, callback) {  
	var password = req.body.password;
	//首先得从库里拿到数据
	var selectData=function(db,callback){
		//连接到数据文档
		var collection=db.collection('sitesUser');
		//查询数据
		var whereStr={"title":"剑桥国际英语教程"};  //我们要查询的信息是所有包含这个内容的数据。
		collection.find(whereStr).toArray(function(err,result){
			if(err){
				console.log('Error:'+err);
				return;
			}
			callback(result);
		})
	}	
	MongoClient.connect(DB_CONN_STR,function(err,db){
		console.log("连接成功");
		selectData(db,function(result){
			console.log(result);
			//把数据返回给前端
			res.status(200),
			res.json(result)	
			db.close();
		})
	})
}
})

//修改用户信息
app.get('/modificationUser',function(req,res){
	var password = req.body.password;
	//首先得从库里找到数据
	var updateData = function(db,callback){
		//连接到数据文档
		var collection = db.collection('sitesUser');
		//查询数据
		var whereStr = {"username":"fanhu"};  //我们要修改的目标信息是所有包含这个内容的数据。
		var updataStr = {$set: {"password":password}}; //要修改的信息，使用不同的更新器结果不一样，昨天已经详细讲过。
		
		collection.update(whereStr,updataStr, function(err, result){
			if(err){
				console.log('Error:'+err);
				return;
			}
			callback(result);
		});
	}
	MongoClient.connect(DB_CONN_STR,function(err,db){
		console.log("连接成功");
		updateData(db,function(result){
			console.log(result);
			//到这里数据库中对应的信息已经进行了修改，
			db.close();
		});
	});
})

//删除用户信息
app.get('/deleteUser',function(req,res){
	var insertData = function(db, callback) {  
		var password = req.body.password;
		//首先得从库里找到数据
		var delData = function(db,callback){
			//连接到数据文档
			var collection = db.collection('sitesUser');
			//查询数据
			var whereStr = {"username":"fanhu"};  //我们要删除的目标信息是所有包含这个内容的数据。
			
			collection.remove(whereStr, function(err, result){
				if(err){
					console.log('Error:'+err);
					return;
				}
				callback(result);
			});
		}
	}
	MongoClient.connect(DB_CONN_STR,function(err,db){
		console.log("连接成功");
		delData(db,function(result){
//			console.log(result);
			//到这里数据库中对应的信息已经进行了修改，
			db.close();
		});
	});
})

//配置服务端口
http.createServer(app).listen('80','39.108.53.121');
var server = app.listen(80, function () {
var host = server.address().address;
 var port = server.address().port;
    console.log('Example app listening at http://%s:%s', host, port);
})