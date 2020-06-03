(function() {
  var root = (typeof self == 'object' && self.self == self && self) ||
      (typeof global == 'object' && global.global == global && global) ||
      this || {};

  var ArrayProto = Array.prototype,  push = ArrayProto.push;

  var $yllt = function(obj) {
      if (obj instanceof $yllt) return obj;
      if (!(this instanceof $yllt)) return new $yllt(obj);
      this._wrapped = obj;
  };

  if (typeof exports != 'undefined' && !exports.nodeType) {
      if (typeof module != 'undefined' && !module.nodeType && module.exports) {
          exports = module.exports = $yllt;
      }
      exports.$yllt = $yllt;
  } else {
      root.$yllt = $yllt;
  }

  $yllt.VERSION = '1.0.0';
  
  // 小程序支付页面的路径  
  var MINI_PAY_PAGE = '/pages/outerpackpay/outerpackpay';
  var PADDING = "139px 42px 86px 252px";
  // sdk 核心接口 map
  var JS_SDK_MAP = {
    /** 
    * 调起小程序支付页面
    * pay_code  必填 支付code码
    * isUser    非必填   默认为false，为true 时，标识从个人中心-订单列表跳转过来，此时点击左上角返回按钮 不需要强制跳转home页面
    * success   成功回调
    * fail      失败回调
    */
    miniProgramPay: function (obj) {
        if (obj && $yllt.objToSearch(obj.data)) {
            if (root.wx && wx.miniProgram && wx.miniProgram.navigateTo) {
                wx.miniProgram.navigateTo({
                    url: MINI_PAY_PAGE + '?' + $yllt.objToSearch(obj.data)
                })
                obj.success && $yllt.isFunction(obj.success) && obj.success()
            } else {
                obj.fail && $yllt.isFunction(obj.fail) && obj.fail({code: 1001, msg: '当前环境不是微信小程序！'})
                console.error('当前环境不是微信小程序！');
                return false;
            }
        } else {
            obj && obj.fail && $yllt.isFunction(obj.fail) && obj.fail({code: 1000, msg: '请输入必填参数！'})
            console.error('请输入必填参数！');
            return false;
        }
    },
    /** 
    * 配置小程序支付分享
    * 
    */
    miniProgramShare: function(obj) {
        console.log('小程序支付分享');
        
    },
    /** 
    * 调起APP支付页面
    */
    appPay: function(obj) {
        console.log('调起APP支付页面');
        $yllt.appInteracte(obj, 'activePay');
    },
    /** 
    * 配置APP分享
    */
    appShare: function(obj) {
        console.log('配置APP分享');
        $yllt.appInteracte(obj, 'activeShare');
    },
    /**
    * 调起APP查看更多 TODO：iOS 和 安卓需要统一字段，现在还没统一
    */
    appShowAll: function(obj) {
        console.log('APP查看更多');
        $yllt.appInteracte(obj, 'showActiveList');
    },
    /** 
    * 通知后台要开启/关闭模态框了
    */
    msgModal: {
        show: function() {
            $yllt.addStyle();
            root.top && root.top.postMessage({ showModal: true }, root.top.location.href);
        },
        hide: function(){
            $yllt.removeStyle();
            root.top && root.top.postMessage({ showModal: false }, root.top.location.href);
        }
    }, 
    /** 
    * 通知后台统一的toast提示
    */
    msgToast: {
        success: function (obj) {
            if(obj && obj.msg) {
                obj.type = "success";
                root.top && root.top.postMessage(obj, root.top.location.href);
            } else {
                console.error('参数异常！');
            }
        },
        error: function (obj) {
            if(obj && obj.msg) {
                obj.type = "error";
                root.top && root.top.postMessage(obj, root.top.location.href);
            } else {
                console.error('参数异常！');
            }
        }
    }
  }
  // sdk 核心接口 list
  var JS_SDK_LIST = Object.keys(JS_SDK_MAP);

  var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;

  var isArrayLike = function(collection) {
      var length = collection.length;
      return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
  };

  $yllt.each = function(obj, callback) {
      var length, i = 0;
      if (isArrayLike(obj)) {
          length = obj.length;
          for (; i < length; i++) {
              if (callback.call(obj[i], obj[i], i) === false) {
                  break;
              }
          }
      } else {
          for (i in obj) {
              if (callback.call(obj[i], obj[i], i) === false) {
                  break;
              }
          }
      }
      return obj;
  }

  $yllt.isFunction = function(obj) {
      return typeof obj == 'function' || false;
  };

  $yllt.functions = function(obj) {
      var names = [];
      for (var key in obj) {
          if ($yllt.isFunction(obj[key])) names.push(key);
      }
      return names.sort();
  };

  // 判断机型
  $yllt.getDevice = function () {
    var ua = window.navigator.userAgent;
    if (ua.indexOf('Android') > -1 || ua.indexOf('Linux') > -1) {
      return 'android'
    } else if (ua.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)) {
      return 'ios'
    }
  };

  // 判断是否在微信小程序环境
  $yllt.isMiniProEnv = function () {
    var ua = root.navigator.userAgent.toLowerCase();
    if(ua.match(/MicroMessenger/i)=="micromessenger") {
        return true;
    } else {
        return false;
    }
  };

  // 判断是否在原生app里面
  $yllt.isAppEnv = function () {
    if ($yllt.getDevice() === 'android') {
        if (root.jsInterface && root.jsInterface.invokeMethod) {
            return true
        } else {
            return false;
        }
    } else if ($yllt.getDevice() === 'ios') {
        if (root.webkit && root.webkit.messageHandlers && root.webkit.messageHandlers['activePay'] && root.webkit.messageHandlers['activePay'].postMessage) {
            return true
        } else {
            return false;
        }
    } else {
        return false;
    }
  };

  // App交互统一封装  interacteType --交互类型 
  $yllt.appInteracte = function (obj, interacteType) {
    if (obj && ($yllt.getDevice() === 'android')) {
        obj.data && (obj.data.action = interacteType)
        if (root.jsInterface && root.jsInterface.invokeMethod) {
            root.jsInterface.invokeMethod('toAndroid', JSON.stringify(obj.data))
            obj.success && $yllt.isFunction(obj.success) && obj.success()
        } else {
            console.error('非标准Android移动设备！')
            obj.fail && $yllt.isFunction(obj.fail) && obj.fail({code: 1000, msg: '非标准Android移动设备！'})
        }
    } else if (obj && ($yllt.getDevice() === 'ios')) {
        if (root.webkit && root.webkit.messageHandlers && root.webkit.messageHandlers[interacteType] && root.webkit.messageHandlers[interacteType].postMessage) {
            root.webkit.messageHandlers[interacteType].postMessage(obj.data)
            obj.success && $yllt.isFunction(obj.success) && obj.success()
        } else {
            console.error('非标准iOS移动设备！')
            obj.fail && $yllt.isFunction(obj.fail) && obj.fail({code: 1000, msg: '非标准iOS移动设备！'})
        }
    } else {
        obj && obj.fail && $yllt.isFunction(obj.fail) && obj.fail({code: 1000, msg: '参数异常，或者非移动设备！'})
        console.error('参数异常！');
        return false;
    }
  }

  // 是否是一层对象，且无嵌套对象
  $yllt.isPrueObj = function (obj){
    if (Object.prototype.toString.call(obj) === '[object Object]') {
        var vals = Object.values(obj);
        var isPrueObj = vals.every(function(v){
            return (typeof v !== 'object') && (typeof v !== 'function') && (typeof v !== 'undefined')
        })
        return isPrueObj;
    } else {
        return false
    }
  }

  // 把obj 转为 search
  $yllt.objToSearch = function(obj) {
    if ($yllt.isPrueObj(obj)) {
        if (Object.keys(obj).length) {
            var arr1 = Object.entries(obj), res = [];
            arr1.forEach(function(v){
                res.push(v.join('='));
            })
            return res.join('&');
        } else {
            return '';
        }
    } else {
        return false
    }
  }

  // 当后台的模态打开的时候，给iframe添加样式
  $yllt.addStyle = function() {
    if (root.document && root.document.body && root.document.body.style) {
        root.document.body.style["padding"] = PADDING;
        root.document.body.style["box-sizing"] = "border-box";
        root.document.body.style["height"] = "100vh";
        root.document.body.style["overflow"] = "hidden";
    } else {
        console.error('错误的宿主环境！')
    }
  } 

  // 当后台的模态关闭的时候，给iframe移除样式
  $yllt.removeStyle = function() {
    if (root.document && root.document.body && root.document.body.removeAttribute) {
        root.document.body.removeAttribute("style");
    } else {
        console.error('错误的宿主环境！')
    }
  }

  /**  
   * 发布订阅模式
  */
  $yllt.event = {
      list: {},
      on(key, fn) {
          if (!this.list[key]) {
              this.list[key] = [];
          }
          this.list[key].push(fn);
      },
      emit() {
          let key = [].shift.call(arguments),
              fns = this.list[key];

          if (!fns || fns.length === 0) {
              return false;
          }
          fns.forEach(fn => {
              fn.apply(this, arguments);
          });
      },
      remove(key, fn) {
          // 这回我们加入了取消订阅的方法
          let fns = this.list[key];
          // 如果缓存列表中没有函数，返回false
          if (!fns) return false;
          // 如果没有传对应函数的话
          // 就会将key值对应缓存列表中的函数都清空掉
          if (!fn) {
              fns && (fns.length = 0);
          } else {
              // 遍历缓存列表，看看传入的fn与哪个函数相同
              // 如果相同就直接从缓存列表中删掉即可
              fns.forEach((cb, i) => {
                  if (cb === fn) {
                      fns.splice(i, 1);
                  }
              });
          }
      }
  }
  /**  
  * 基础ajax请求封装
  * e。g 如下
  * $yllt.ajax({
  *    url: 'http://test1.yalalat.com/vip2.0/branches/v1.2.2/admin/u/login',
  *    method: 'post',
  *    async: true,
  *    timeout: 30000,
  *    data: {
  *     type: 1
  *    }
  *  }).then(
  *    res => console.log('请求成功: ' + res),
  *    err => console.log('请求失败: ' + err)
  *  )
  */
  $yllt.ajax = function(options) {
      let url = options.url
      const method = options.method.toLocaleLowerCase() || 'get'
      const async = options.async != false // default is true
      const data = options.data
      const xhr = new XMLHttpRequest()
      if (options.timeout && options.timeout > 0) {
          xhr.timeout = options.timeout
      }
      return new Promise ( (resolve, reject) => {
          xhr.ontimeout = () => reject && reject('请求超时')
          xhr.onreadystatechange = () => {
              if (xhr.readyState == 4) {
                  if (xhr.status >= 200 && xhr.status < 300 || xhr.status == 304) {
                      resolve && resolve(xhr.responseText)
                  } else {
                      reject && reject()
                  }
              }
          }
          xhr.onerror = err => reject && reject(err)
          let paramArr = []
          let encodeData
          if (data instanceof Object) {
              for (let key in data) {
                  // 参数拼接需要通过 encodeURIComponent 进行编码
                  paramArr.push( encodeURIComponent(key) + '=' + encodeURIComponent(data[key]) )
              }
              encodeData = paramArr.join('&')
          }
          if (method === 'get') {
              // 检测 url 中是否已存在 ? 及其位置
              const index = url.indexOf('?')
              if (index === -1) url += '?'
              else if (index !== url.length -1) url += '&'
                // 拼接 url
              url += encodeData
          }
          xhr.open(method, url, async)
          if (method === 'get') xhr.send(null)
          else {
              // post 方式需要设置请求头
              xhr.setRequestHeader('Content-Type','application/x-www-form-urlencoded;charset=UTF-8')
              xhr.send(encodeData)
          }
      })
  }

  /** 
   * 打印信息封装
  */
  $yllt.logGrd = function (str, obj) {
    var date = new Date();
    console.group(date + ' ' + str);
    obj && console.log(obj);
    console.groupEnd();
  }

  /** 
   * sdk基础配置
   * 参数： object
   * debug: true, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
   * appKey: '', // 必填，企业号的唯一标识
   * timestamp: '', // 必填，生成签名的时间戳
   * nonceStr: '', // 必填，生成签名的随机串
   * signature: '', // 必填，签名
   * skdApiList: [] // 必填，需要使用的JS接口列表
   */
  $yllt.config = function(obj) {
    if (!obj || !obj.appKey || !obj.timestamp || !obj.nonceStr || !obj.signature || !obj.skdApiList.length) {
      console.error('请输入SDK的基础配置信息！');
      return
    }
    $yllt.logGrd('$yllt.config begin', obj);
    $yllt.checkConfig(obj)
  }

  /** 
  *  检测该商户有没有这些API的权限
  */
  $yllt.checkConfig = function (obj) {
    setTimeout(function(){
      // 后期会改成ajax的请求结果 
      if (0.5 > Math.random()) {
        $yllt.register(obj.skdApiList)
      } else {
        $yllt.register(obj.skdApiList)
      }
    }, 0)
  }
  
  /** 
  * SDK请求成功
  */
  $yllt.ready = function (callback) {
    if ($yllt.isFunction(callback)) {
      $yllt.event.on('ready', (res) => {
        $yllt.logGrd('$yllt.config end', res);
        callback()
      });
    } else {
      console.error('wx.ready()的参数应该是一个函数!');
    }
  }
  /** 
  * SDK权限注册
  */
  $yllt.register = function (arr) {
     var registerApi = [];
     JS_SDK_LIST.forEach(function (api) {
         if (arr.indexOf(api) !== -1) {
            ($yllt[api] = JS_SDK_MAP[api]) && registerApi.push(api)
         } else {
            $yllt[api] = function() {
                console.error('你没有调用$yllt.' + api + '的权限，请检查有没有注册此API！')
            }
         }
     });
     $yllt.event.emit('ready', {msg: 'OK', jsSdkList: registerApi})
     $yllt.logGrd('当前页面通过 $yllt.config 获取到的 JSSDK 权限如下', registerApi);
  }

  /** 
  * SDK请求失败
  */
  $yllt.error = function (callback) {
    if ($yllt.isFunction(callback)) {
      $yllt.event.on('error', (res) => {
        $yllt.logGrd('$yllt.config end', res);
        callback()
      });
    } else {
      console.error('wx.error()的参数应该是一个函数!');
    }
  }
  
  /**
   * 在 $yllt.mixin($yllt) 前添加自己定义的方法
   */
  $yllt.mixin = function(obj) {
    $yllt.each($yllt.functions(obj), function(name) {
          var func = $yllt[name] = obj[name];
          $yllt.prototype[name] = function() {
              var args = [this._wrapped];
              push.apply(args, arguments);
              return func.apply($yllt, args);
          };
      });
      return $yllt;
  };
  $yllt.mixin($yllt);
})()