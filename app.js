//配置mongodb数据库相关的内容
var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var DB_CONN_STR = 'mongodb://localhost:27017/book';
//配置node服务器相关内容：
var express = require('express');
var app = express();
var bodyParder = require('body-parser');
var http = require('http');
var https = require('https');
var fs = require('fs');
var privatekey = fs.readFileSync('https/privatekey.pem', 'utf8');  
var certificate = fs.readFileSync('https/certificate.pem', 'utf8');  
app.use(bodyParder.urlencoded({extended:true}));
var options={key:privatekey, cert:certificate}; 
var server = https.createServer(options, app);

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
 var data = [{
	        "rating": {
	            "max": 10,
	            "numRaters": 1,
	            "average": "0.0",
	            "min": 0
	        },
	        "subtitle": "",
	        "author": [
	            "理查兹"
	        ],
	        "pubdate": "2007-3",
	        "tags": [
	            {
	                "count": 1,
	                "name": "英语",
	                "title": "英语"
	            },
	            {
	                "count": 1,
	                "name": "藏书",
	                "title": "藏书"
	            },
	            {
	                "count": 1,
	                "name": "语言·写作",
	                "title": "语言·写作"
	            }
	        ],
	        "origin_title": "",
	        "image": "https://img1.doubanio.com\/mpic\/s5811478.jpg",
	        "binding": "",
	        "translator": [
	            
	        ],
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

//cheshi
app.get('/',function(req,res){
	var password = req.body.password;
	//首先得从库里拿到数据
	var selectData=function(db,callback){
		//连接到数据文档
		var collection=db.collection('sites');
		//查询数据
		var whereStr={"title":"HTML5 App商业开发实战教程"};  //我们要查询的信息是所有包含这个内容的数据。
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
//	var response ='<html><head><title>Simple Send</title></head>'+
//				  '<body><h1>Hello form Express</h1></body></html>';
//	res.status(200);
//	res.set({
//		'Content-Type':'text/html',
//		'Content-Length':response.length
//	});
//	res.send(response);
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
server.listen(443,function(){
	var host = server.address().address;
	var port = server.address().port;
	    console.log('Example app listening at http://%s:%s', host, port);
});
// server = app.listen(80, function () {
//var host = server.address().address;
//var port = server.address().port;
//    console.log('Example app listening at http://%s:%s', host, port);
//})