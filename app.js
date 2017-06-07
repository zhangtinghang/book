//配置mongodb数据库相关的内容
var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var DB_CONN_STR = 'mongodb://localhost:27017/book';

//配置node服务器相关内容：
var express = require('express');
var app = express();
var path = require('path');
var bodyParder = require('body-parser');

//引入jade模块
app.set('views', './views/pages')
app.set('view engine', 'jade') //模块引擎

//配置https链接
var http = require('http');
var https = require('https');
var fs = require('fs');
var  privatekey  =  fs.readFileSync('https/privatekey.pem',  'utf8');  
var  certificate  =  fs.readFileSync('https/certificate.pem',  'utf8');  
app.use(bodyParder.urlencoded({
	extended: true
}));
var  options = {
	key: privatekey,
	 cert: certificate
}; 
var  server  =  https.createServer(options,  app);

//配置汉字转化为拼音
var pinyin = require("pinyin");

//配置表单上传图片
var multiparty = require('multiparty'); //文件上传模块
var util = require('util');
app.use(express.static(path.join(__dirname, 'bower_components'))) //设置静态文件路径

//配置ObjectId转化
ObjectId = require('mongodb').ObjectID;

//引入时间转换
var sd = require('silly-datetime');

//设置跨域访问
app.all('*', function(req, res, next) {  
	res.header("Access-Control-Allow-Origin", "*");  
	res.header("Access-Control-Allow-Headers", "X-Requested-With");  
	res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");  
	res.header("X-Powered-By", ' 3.2.1');  
	res.header("Content-Type", "application/json;charset=utf-8");  
	next();
});
//cheshi
app.post("/",function(){
	
});

//后台管理员扫描添加图书数据
app.post('/add', function(req, res) {
	var isbn = req.body.isbn;
	var count = '';
	var sort = '';
	var addOptions = {
		hostname: 'api.douban.com',
		path: '/v2/book/isbn/:' + isbn,
		method: 'GET'
	};
	//发送请求
	var req = https.request(addOptions, function(res) {
		//	console.log('状态码：', res.statusCode);
		//	console.log('请求头：', res.headers);
		res.setEncoding('utf8');
		res.on('data', function(chunk) {
			var chunk = JSON.parse(chunk);
			count = 1;
			sort = 'A';
			var author = chunk.author; //作者(数组)
			var pudate = chunk.pubdate; //上架日期
			var bookImage = chunk.image; //图片
			var id = chunk.id; //图书id
			var publisher = chunk.publisher; //出版社
			var isbn10 = chunk.isbn10; //isbn编码
			var isbn13 = chunk.isbn13;
			var bookpinyin = pinyin(chunk.title);
			var title = chunk.title; //名称   
			var summary = chunk.summary; //简介
			var price = chunk.price; //价格 	
			var page = chunk.pages; //页数
			var catalog = chunk.catalog; //目录
			var tags = [];
			var bookData = {
				count: count,
				sort: sort,
				author: author,
				pudate: pudate,
				img: bookImage,
				id: id,
				publisher: publisher,
				isbn10: isbn10,
				isbn13: isbn13,
				bookpinyin: bookpinyin,
				title: title,
				summary: summary,
				price: price,
				page: page,
				catalog: catalog,
				tags: tags
			}
			console.log("adda" + bookData);
			findCollection(bookData);
		});
	});
	//如果有错误会输出错误
	req.on('error', function(e) {
		console.log('错误：' + e.message);
	});
	req.end();
});

//web端添加图书数据
app.post('/adminAdd', function(req, res) {
	var form = new multiparty.Form(); //实例一个multiparty
	form.encoding = 'utf-8'; //设置编辑
	form.uploadDir = __dirname + "/bower_components/imgs/"; //设置文件储存路径
	//开始解析前台传过来的文件
	form.parse(req, function(err, fields, files) {
		if(err) {
			console.log('parse error: ' + err);
		} else {
			var bookImage = '';
			var inputFile = files.upfiles[0]; //获取第一个文件
			if(inputFile.size != 0) {
				var finalname = inputFile.originalFilename;
				var new_name = __dirname + "/bower_components/imgs/" + finalname; //获取文件名
				console.log('new_name' + new_name);
				var old_name = inputFile.path; //获取文件路径
				fs.renameSync(old_name, new_name);
				console.log(fields.count[0]);
				bookImage = new_name; //图片
			}
			//解析完成后存储到数据库
			var count = fields.count[0];
			var sort = fields.sort[0];
			var author = fields.author; //作者(数组)
			var pudate = fields.pubdate[0]; //上架日期
			var id = fields.id[0]; //图书id
			var publisher = fields.publisher[0]; //出版社
			var isbn10 = fields.isbn10[0]; //isbn编码
			var isbn13 = fields.isbn13[0];
			var bookpinyin = pinyin(fields.title[0]);
			var title = fields.title[0]; //名称   
			var summary = fields.summary[0]; //简介
			var price = fields.price[0]; //价格 	
			var page = fields.page[0]; //页数
			var catalog = fields.catalog[0]; //目录
			var tags = [];
			var bookData = {
				count: count,
				sort: sort,
				author: author,
				pudate: pudate,
				id: id,
				publisher: publisher,
				isbn10: isbn10,
				isbn13: isbn13,
				bookpinyin: bookpinyin,
				title: title,
				summary: summary,
				price: price,
				page: page,
				catalog: catalog,
				tags: tags
			}
			if(bookImage) {
				bookData.img = bookImage;
			}
			findCollection(bookData);
		}
	})
});

//查询是否有数据 如果有 则更新 无 则插入(函数)
function findCollection(bookData) {
	//首先得从库里拿到数据
	var selectData = function(db, callback) {
		//连接到数据文档
		var collection = db.collection('sites');
		//查询数据
		var title = bookData.title;
		var whereStr = {
			"title": title
		}; //我们要查询的信息是所有包含这个内容的数据。
		collection.find(whereStr).toArray(function(err, result) {
			if(err) {
				console.log('Error:' + err);
				return;
			}
			callback(result);
		})
	}
	MongoClient.connect(DB_CONN_STR, function(err, db) {
		selectData(db, function(result) {
			if(result.length == 0) {
				console.log("插入")
				addCollection(bookData);
			} else {
				console.log("更新");
				updataCollection(bookData);
			}
			db.close();
		})
	})
}
//插入图书数据到数据库中(函数)
function addCollection(bookData) {
	var insetData = function(db, callback) {
		//连接到表 sites
		var collection = db.collection('sites');
		collection.insert(bookData, function(err, result) {
			if(err) {
				console.log('Error:' + err);
				return;
			} else {
				console.log('存取成功')
			}
			callback(result);
		});
	}
	MongoClient.connect(DB_CONN_STR, function(err, db) {
		console.log("连接成功！");
		insetData(db, function(result) {
			db.close();
		});
	});
}

//更新图书到数据库中函数
function updataCollection(bookData) {
	var updatetData = function(db, callback) {
		//连接到表 sites
		var collection = db.collection('sites');
		var title = bookData.title;
		var count = bookData.count;
		collection.update({
			title: title
		}, {
			$inc: {
				count: 1
			}
		}, function(err, result) {
			if(err) {
				console.log('Error:' + err);
				return;
			} else {
				console.log('存取成功')
			}
			callback(result);
		});
	}
	MongoClient.connect(DB_CONN_STR, function(err, db) {
		console.log("连接成功！");
		updatetData(db, function(result) {
			db.close();
		});
	});
}

//查询图书数据(type=0 查询文档所有集合;type=1 仅支持关键字查询;type=2支持关键字 拼音 标题 作者 类型 isbn 简介查询;type=3 支持_id查找图书详细信息)
app.post('/find', function(req, res) {
	var keywords = req.body.keywords;
	var type = req.body.type;
	//首先得从库里拿到数据
	var selectData = function(db, callback) {
		//连接到数据文档
		var collection = db.collection('sites');
		if(type == 0) {
			//查询数据
			collection.find().toArray(function(err, result) {
				if(err) {
					console.log('Error:' + err);
					return;
				}
				callback(result);
			})
		} else if(type == 2) {
			//查询数据
			var whereStr = {
				$or: [{
						title: keywords
					},
					{
						sort: keywords
					},
					{
						author: keywords
					},
					{
						publisher: keywords
					},
					{
						isbn10: keywords
					},
					{
						isbn13: keywords
					},
					{
						bookpinyin: keywords
					},
					{
						summary: keywords
					}
				]
			};
			//查询数据
			collection.find(whereStr).toArray(function(err, result) {
				if(err) {
					console.log('Error:' + err);
					return;
				}
				callback(result);
			})
		} else if(type == 1) {
			var whereStr = {
				sort: keywords
			}
			collection.find(whereStr).toArray(function(err, result) {
				if(err) {
					console.log('Error:' + err);
					return;
				}
				callback(result);
			})
		}else if(type = 3){
			var _id = keywords;
			var _idObj = new ObjectId(_id);
			var whereStr = {
				"_id" : _idObj
			}
			collection.find(whereStr).toArray(function(err, result) {
				if(err) {
					console.log('Error:' + err);
					return;
				}
				callback(result);
			})
		}
	}
	MongoClient.connect(DB_CONN_STR, function(err, db) {
		console.log("连接成功");
		selectData(db, function(result) {
			console.log(result);
			//把数据返回给前端
			res.status(200),
				res.json(result)
			db.close();
		})
	})
});

//修改图书数据(仅支持关键字修改)
app.post('/modification', function(req, res) {
	var form = new multiparty.Form(); //实例一个multiparty
	form.encoding = 'utf-8'; //设置编辑
	form.uploadDir = __dirname + "/bower_components/imgs/"; //设置文件储存路径
	var response = res;
	//开始解析前台传过来的文件
	form.parse(req, function(err, fields, files) {
		if(err) {
			console.log('parse error: ' + err);
		} else {
			var bookImage = '';
			var inputFile = files.upfiles[0]; //获取第一个文件
			if(inputFile.size != 0) {
				var finalname = inputFile.originalFilename;
				var new_name = __dirname + "/bower_components/imgs/" + finalname; //获取文件名
				console.log('new_name' + new_name);
				var old_name = inputFile.path; //获取文件路径
				fs.renameSync(old_name, new_name);
				console.log(fields.count[0]);
				bookImage = new_name; //图片
			}

			//解析完成后存储到数据库
			var count = fields.count[0];
			var sort = fields.sort[0];
			var author = fields.author; //作者(数组)
			var pudate = fields.pubdate[0]; //上架日期
			var id = fields.id[0]; //图书id
			var publisher = fields.publisher[0]; //出版社
			var isbn10 = fields.isbn10[0]; //isbn编码
			var isbn13 = fields.isbn13[0];
			var bookpinyin = pinyin(fields.title[0]);
			var title = fields.title[0]; //名称   
			var summary = fields.summary[0]; //简介
			var price = fields.price[0]; //价格 	
			var page = fields.page[0]; //页数
			var catalog = fields.catalog[0]; //目录
			var tags = [];
			var bookData = {
				count: count,
				sort: sort,
				author: author,
				pudate: pudate,
				id: id,
				publisher: publisher,
				isbn10: isbn10,
				isbn13: isbn13,
				bookpinyin: bookpinyin,
				title: title,
				summary: summary,
				price: price,
				page: page,
				catalog: catalog,
				tags: tags
			}
			if(bookImage) {
				bookData.img = bookImage;
			}
			var modData = function(db, callback) {
				//连接到表 sites
				var collection = db.collection('sites');
				collection.update({
					title: title
				}, {
					$set: {
						bookData
					}
				}, function(err, result) {
					if(err) {
						console.log('Error:' + err);
						return;
					} else {
						console.log('存取成功')
					}
					callback(result);
				});
			}
			MongoClient.connect(DB_CONN_STR, function(err, db) {
				console.log("修改成功！");
				modData(db, function(result) {
					db.close();
				});
			});
		}
	})
})

//删除图书数据(web端)
app.post('/delete', function(req, res) {
	var _id = req.body._id;
	var _idObj = new ObjectId(_id);
	console.log("传递到的" + _idObj)
	//首先得从库里找到数据
	var delData = function(db, callback) {
		//连接到数据文档
		var collection = db.collection('sites');
		//查询数据
		var whereStr = {
			"_id": _idObj
		}; //我们要删除的目标信息是所有包含这个内容的数据。
		console.log(whereStr)
		collection.remove(whereStr, function(err, result) {
			if(err) {
				console.log('Error:' + err);
				return;
			}
			callback(result);
		});
	}

	MongoClient.connect(DB_CONN_STR, function(err, db) {
		console.log("连接成功");
		delData(db, function(result) {
			console.log("删除成功!")
			//console.log(result);
			//到这里数据库中对应的信息已经进行了修改，
			res.status(200);
			res.json({
				success: "true"
			})
			db.close();
		});
	});
})

//用户集合
//微信登录(存储到文档中 返回成功和token用于查询)
app.post('/loginWeixin',function(req,res){
	var code = req.body.code;
	var APPID = '';
	var SECRET = secret;
	var JSCODE = code;
	var addOptions = {
		hostname: 'api.weixin.qq.com',
		path: '/sns/jscode2session?appid='+APPID+'&secret='+SECRET+'&js_code='+JSCODE+'&grant_type=authorization_code',
		method: 'GET'
	};
	//发送请求
	var req = https.request(addOptions, function(res) {
		//	console.log('状态码：', res.statusCode);
		//	console.log('请求头：', res.headers);
		res.setEncoding('utf8');
		res.on('data', function(chunk) {
			var chunk = JSON.parse(chunk);
			var openid = chunk.openid;
			var session_key = chunk.session_key;
		});
	});
	//如果有错误会输出错误
	req.on('error', function(e) {
		console.log('错误：' + e.message);
	});
	req.end();
});

//前端添加用户信息(根据token找到用户 添加个人信息)
app.post('/addUserPhone', function(req, res) {
	var form = new multiparty.Form(); //实例一个multiparty
	form.encoding = 'utf-8'; //设置编辑
	//开始解析前台传过来的文件
	form.parse(req, function(err, fields, files) {
		if(err) {
			console.log('parse error: ' + err);
		} else {
			var username = fields.username[0];
			var phone = fields.phone[0];
			var weixinid = fields.weixinid[0];
			var avatar = fields.avatar[0];
			var IDcard = fields.IDcard[0];
			var payData = 0;
			var wait = [];
			var underway = [];
			var historical = [];
			var token = 123142151355;
			console.log(username);
		//	//构建underway对象
		//	var useObj =new Object();
		//	useObj.nowDay = sd.format(new Date(), 'YYYY-MM-DD HH:mm');
		//	useObj.returnDay = sd.format(new Date() + 2592000);
			var insertData = function(db, callback) {
				//连接到表 sitesUser
				var collection = db.collection('sitesUser');
				//查询数据
				var wheredata = {
					"token":token
				}
				//插入数据
				var updata = {
					$set:{
						user:{
							username:username,
							phone:phone,
							weixinid:weixinid,
							avatar:avatar,
							IDcard:IDcard
						},
						payData:payData,
						wait:wait,
						underway:underway,
						historical:historical
					}
				};
				collection.update(wheredata,updata,{upsert:true}, function(err, result) {
					if(err) {
						console.log('Error:' + err);
						return;
					} else {
						console.log('存取成功')
					}
					callback(result);
				});
			}
		
			MongoClient.connect(DB_CONN_STR, function(err, db) {
				console.log("连接成功！");
				insertData(db, function(result) {
					console.log('添加用户信息成功')
					db.close();
				});
			});			
		}
	})

})

//前端获取用户信息(token)
app.post('/findUser', function(req, res) {
//		var token = req.body.token;
		var token = 123142151355;
		//首先得从库里拿到数据
		var selectData = function(db, callback) {
			//连接到数据文档
			var collection = db.collection('sitesUser');
			//查询数据
			var whereStr = {
				"token": token
			}; //我们要查询的信息是所有包含这个内容的数据。
			collection.find(whereStr).toArray(function(err, result) {
				if(err) {
					console.log('Error:' + err);
					return callback(err);
				}
				callback(result);
			})
		}
		MongoClient.connect(DB_CONN_STR, function(err, db) {
			console.log("连接成功");
			selectData(db, function(result) {
				console.log(result);
				//把数据返回给前端
				res.status(200),
				res.json(result)
				db.close();
			})
		})
})

//后台查询用户信息(web端 可查询所有 和名字查找?空字符串是否返回所有?待解决)
app.post('/findUserPc',function(req,res){
	var username = req.body.username;
	//首先得从库里找到数据
	var findData = function(db, callback) {
		//连接到数据文档
		var collection = db.collection('sitesUser');
		//查询数据
		var whereStr = {
			"username": username
		}; //我们要修改的目标信息是所有包含这个内容的数据。

		collection.find(whereStr).toArray(function(err, result) {
			if(err) {
				console.log('Error:' + err);
				return;
			}
			callback(result);
		})
	}
	MongoClient.connect(DB_CONN_STR, function(err, db) {
		console.log("连接成功");
		findData(db, function(result) {
			console.log(result);		
			db.close();
		});
	}); 
})

//修改用户信息(web端)
app.post('/modificationUser', function(req, res) {
	var username = req.body.username;
	//首先得从库里找到数据
	var updateData = function(db, callback) {
		//连接到数据文档
		var collection = db.collection('sitesUser');
		//查询数据
		var whereStr = {
			"username": username
		}; //我们要修改的目标信息是所有包含这个内容的数据。
		var updataStr = {
			$set: {
				"password": password
			}
		}; //要修改的信息，使用不同的更新器结果不一样，昨天已经详细讲过。

		collection.update(whereStr, updataStr, function(err, result) {
			if(err) {
				console.log('Error:' + err);
				return;
			}
			callback(result);
		});
	}
	MongoClient.connect(DB_CONN_STR, function(err, db) {
		console.log("连接成功");
		updateData(db, function(result) {
			console.log(result);
			//到这里数据库中对应的信息已经进行了修改，
			db.close();
		});
	});
})

//删除用户信息(web端)
app.get('/deleteUser', function(req, res) {
	var insertData = function(db, callback) {
		var password = req.body.password;
		//首先得从库里找到数据
		var delData = function(db, callback) {
			//连接到数据文档
			var collection = db.collection('sitesUser');
			//查询数据
			var whereStr = {
				"username": "fanhu"
			}; //我们要删除的目标信息是所有包含这个内容的数据。

			collection.remove(whereStr, function(err, result) {
				if(err) {
					console.log('Error:' + err);
					return;
				}
				callback(result);
			});
		}
	}
	MongoClient.connect(DB_CONN_STR, function(err, db) {
		console.log("连接成功");
		delData(db, function(result) {
			//			console.log(result);
			//到这里数据库中对应的信息已经进行了修改，
			db.close();
		});
	});
})

//APP内逻辑操作接口
//1.用户扫描图书后添加图书
app.post('/getBook', function(req, res) {
//	var isbn = req.body.isbn;
//	var token = req.body.token;
	var isbn13 = "9787040463347";
	var token = 123142151355;
	//首先得从库里找到图书并返回_id
	var findBook = function(db, callback) {
		//连接到数据文档
		var collection = db.collection('sites');
		//查询数据
		var whereStr = {
			"isbn13": isbn13
		}; //我们要修改的目标信息是所有包含这个内容的数据。

		collection.find(whereStr).toArray(function(err, result) {
			if(err) {
				console.log('Error:' + err);
				return;
			}
			//找到用户后将图书信息引用到wait[]中
			callback(result);
		})
	}
	
	var addUser = function(db,_idStr,callback){
		//连接到数据文档
		var _id = new ObjectId(_idStr);
		var collection = db.collection('sitesUser');
		var whereStr = {
			"token" : token
		};
		var upStr = {
			$push:{
				"wait":{_id}
			}
		}
		collection.update(whereStr,upStr,function(err,result){
			if(err){
				console.log('Error:' + err);
				return;
			}
			callback(result);
		})
	}
	MongoClient.connect(DB_CONN_STR, function(err, db) {
		console.log("连接成功");
		findBook(db, function(result) {
			var resStr = JSON.stringify(result);
			var resultObj = JSON.parse(resStr);//将JSON转换为js对象
			var _idStr = resultObj[0]._id;
			addUser(db,_idStr,function(result){
				console.log("插入数组成功");
				//插入数组成功后返回
				res.status(200),
				res.json(result)
				db.close();
			})
		});
	}); 
})

//扫描二维码并获取数据 修改数组操作(修改用户图书信息 后台管理员端)
app.post('/borrowBook',function(req,res){
	var username = req.body.username;
	//首先得从库里找到数据
	var updateData = function(db, callback) {
		//连接到数据文档
		var collection = db.collection('sitesUser');
		//查询数据
		var whereStr = {
			username: username
		}; //我们要修改的目标信息是所有包含这个内容的数据。
		var updataStr = {
//			$pull: {
//				: 
//			}
		}; //要修改的信息，使用不同的更新器结果不一样，昨天已经详细讲过。

		collection.findAndModify(whereStr, updataStr, function(err, result) {
			if(err) {
				console.log('Error:' + err);
				return;
			}
			callback(result);
		});
	}
	MongoClient.connect(DB_CONN_STR, function(err, db) {
		console.log("连接成功");
		updateData(db, function(result) {
			console.log(result);
			//到这里数据库中对应的信息已经进行了修改，
			db.close();
		});
	});
})


//配置服务端口
server.listen(443, function() {
	var host = server.address().address;
	var port = server.address().port;  
	console.log('Example app listening at http://%s:%s', host, port);
});
// server = app.listen(80, function () {
//var host = server.address().address;
//var port = server.address().port;
//    console.log('Example app listening at http://%s:%s', host, port);
//})