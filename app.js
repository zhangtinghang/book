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
app.post("/", function(req, res) {})

//扫描添加数据
app.post('/add', function(req, res) {
	var isbn = 9787040463347;
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
			var count = 1;
			var sort = 'A';
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
			console.log(author)
			console.log(pudate)
			console.log(bookImage)
			console.log(id)
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

//后台添加数据
app.post('/adminAdd', function(req, res) {
	var form = new multiparty.Form(); //实例一个multiparty
	form.encoding = 'utf-8'; //设置编辑
	form.uploadDir = __dirname + "/bower_components/imgs/"; //设置文件储存路径
	//开始解析前台传过来的文件
	form.parse(req, function(err, fields, files) {
		console.log("这是第一个哟" + fields);
		console.log("这是文件" + files);
		console.log("这是错误" + err);
		var filesTmp = JSON.stringify(files);
		var inputData = JSON.stringify(fields);
		console.log('这是解析inputData' + inputData);
		console.log('这是解析files后的 ' + filesTmp);
		if(err) {
			console.log('parse error: ' + err);
			[0]
		} else {
			var inputFile = files.upfiles[0]; //获取第一个文件
			var finalname = inputFile.originalFilename;
			var new_name = __dirname + "/bower_components/imgs/" + finalname; //获取文件名
			console.log('new_name' + new_name);
			var old_name = inputFile.path; //获取文件路径
			fs.renameSync(old_name, new_name);
			console.log(fields.count[0]);
			//解析完成后存储到数据库
			var count = fields.count[0];
			var sort = fields.sort[0];
			var author = fields.author; //作者(数组)
			var pudate = fields.pubdate[0]; //上架日期
			var bookImage = new_name; //图片
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
			findCollection(bookData);
		}
	})
});

//查询是否有数据 如果有 则更新 无 则插入
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
//插入数据到数据库中
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

//更新数据到数据库中
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

//查询数据
app.get('/find', function(req, res) {
	var password = req.body.password;
	//首先得从库里拿到数据
	var selectData = function(db, callback) {
		//连接到数据文档
		var collection = db.collection('sites');
		//查询数据
		var whereStr = {
			"title": "行为科学统计"
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

//修改数据
app.post('/modification', function(req, res) {
	var password = req.body.password;
	//首先得从库里找到数据
	var updateData = function(db, callback) {
		//连接到数据文档
		var collection = db.collection('sites');
		//查询数据
		var whereStr = {
			"username": "fanhu"
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

//删除数据
app.post('/delete', function(req, res) {
	var password = req.body.password;
	//首先得从库里找到数据
	var delData = function(db, callback) {
		//连接到数据文档
		var collection = db.collection('sites');
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

	MongoClient.connect(DB_CONN_STR, function(err, db) {
		console.log("连接成功");
		delData(db, function(result) {
			//			console.log(result);
			//到这里数据库中对应的信息已经进行了修改，
			db.close();
		});
	});
})

//添加用户信息
app.post('/addUser', function(req, res) {
	var insertData = function(db, callback) {
		//连接到表 sites
		var collection = db.collection('sitesUser');
		//插入数据
		var data = [{
			"rating": {
				"max": 10,
				"numRaters": 1,
				"average": "0.0",
				"min": 0
			},
			"subtitle": "",
			"author": ["理查兹"],
			"pubdate": "2007-3",
			"tags": [{
				"count": 1,
				"name": "英语",
				"title": "英语"
			}, {
				"count": 1,
				"name": "藏书",
				"title": "藏书"
			}, {
				"count": 1,
				"name": "语言·写作",
				"title": "语言·写作"
			}],
			"origin_title": "",
			"image": "https://img1.doubanio.com\/mpic\/s5811478.jpg",
			"binding": "",
			"translator": [],
			"catalog": "",
			"pages": "113",
			"images": {
				"small": "https://img1.doubanio.com\/spic\/s5811478.jpg",
				"large": "https://img1.doubanio.com\/lpic\/s5811478.jpg",
				"medium": "https://img1.doubanio.com\/mpic\/s5811478.jpg"
			},
			"alt": "https:\/\/book.douban.com\/subject\/2056914\/",
			"id": "2056914",
			"publisher": "外语教学与研究",
			"isbn10": "7560062415",
			"isbn13": "9787560062419",
			"title": "剑桥国际英语教程",
			"url": "https:\/\/api.douban.com\/v2\/book\/2056914",
			"alt_title": "",
			"author_intro": "",
			"summary": "《剑桥国际英语教程》（第3版）这套教材的主要产品包括学生用书（附赠词汇手册）、教师用书。练习册、录音带或CD、录像教材、DVD和CD-ROM等。另外，学生用书和练习册分两个版本——全一册和A、B分册，便于广大师生根据需要选择。录像教材可以作为视听说培训教材单独使用。主要特色：综合培养听说读写技能，兼顾准备和流利度，在交际语境中学习语法，在任务型活动中训练听力，富有时代气息的话题，生动自然的对话语言，全新的语音学习大纲，活泼有趣的口语活动，完善的复习和测试系统，独特的单元自学听力练习，寓教于乐的视听说配套产品，科学的教师培训服务体系。\n\n 剑桥国际英语教程",
			"price": "49.90元"
		}];
		collection.insert(data, function(err, result) {
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
			console.log(result);
			db.close();
		});
	});
})

//查询用户信息
app.post('/findUser', function(req, res) {
	var insertData = function(db, callback) {
		var password = req.body.password;
		//首先得从库里拿到数据
		var selectData = function(db, callback) {
			//连接到数据文档
			var collection = db.collection('sitesUser');
			//查询数据
			var whereStr = {
				"title": "剑桥国际英语教程"
			}; //我们要查询的信息是所有包含这个内容的数据。
			collection.find().toArray(function(err, result) {
				if(err) {
					console.log('Error:' + err);
					return;
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
	}
})

//修改用户信息
app.get('/modificationUser', function(req, res) {
	var password = req.body.password;
	//首先得从库里找到数据
	var updateData = function(db, callback) {
		//连接到数据文档
		var collection = db.collection('sitesUser');
		//查询数据
		var whereStr = {
			"username": "fanhu"
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

//删除用户信息
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