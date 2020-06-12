const routerApi = require('./router');
const path = require('path');
const bodyParser = require('body-parser'); // post 数据是需要
const express = require('express');
const app = express();
// const cors = require('cors');

// app.use(cors());s
app.use(express.static('public'));
// app.use(express.static(path.join(__dirname, 'public')));
// console.log(express.static('public'));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../dist')));
// 后端api路由
app.use('/api', routerApi);

app.all('*', function(req, res, next) {
	res.header('Access-Control-Allow-Origin', 'http://101.132.66.50');
	//服务器支持的所有头信息字段，多个字段用逗号分隔
	res.header('Access-Control-Allow-Headers', 'Content-type, userId, authToken');
	res.header('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS,PATCH');
	res.header('Access-Control-Max-Age', 1728000); //预请求缓存20天
	next();
});
// 监听端口
app.listen(8000);
console.log('success listen at port:8000......');
