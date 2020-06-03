# 概述

亚拉拉特JS-SDK是亚拉拉特应用平台面向网页开发者提供的基于亚拉拉特小程序和APP内的网页开发工具包。

通过使用亚拉拉特JS-SDK，网页开发者可借助亚拉拉特小程序和APP高效地使用支付、分享等手机系统的能力，为用户提供更优质的网页体验。

此文档面向网页开发者介绍亚拉拉特JS-SDK如何使用及相关注意事项。

## 使用说明

在使用亚拉拉特JS-SDK对应的JS接口前，需确保已获得使用对应JS接口的权限，可在下表中根据自己的开发者帐号类型查看。 具体详见下方表格：

|功能|接口|
|:-|:-|
|基础接口|权限验证配置，接口处理成功和失败的验证|
|工具接口|判断当前页面所在的环境（app、小程序）等工具方法|
|支付接口|调用亚拉拉特平台的集成支付功能|
|分享接口|调用亚拉拉特平台的分享接口|

### 步骤一：引入JS文件

在需要调用JS接口的页面引入此JS文件文件，

### 步骤二：通过config接口注入权限验证配置

所有需要使用JS-SDK的页面必须先注入配置信息，否则将无法调用

```js
$yllt.config({
  appKey: '', // 必填，
  timestamp: , // 必填，生成签名的时间戳
  nonceStr: '', // 必填，生成签名的随机串
  signature: '',// 必填
  skdApiList: ['miniProgramPay', 'miniProgramShare', 'appPay', 'appShare'] // 必填，需要使用的JS接口列表
});
```
 目前因为后台未做校验，**随便填些**`字符串`即可，后期会加后台校验 

### 步骤三：通过ready接口处理成功验证

```js
$yllt.ready(function(){
    // config信息验证后会执行ready方法，所有接口调用都必须在config接口获得结果之后，config是一个客户端的异步操作，所以如果需要在页面加载时就调用相关接口，则须把相关接口放在ready函数中调用来确保正确执行。对于用户触发时才调用的接口，则可以直接调用，不需要放在ready函数中。
});
```

### 步骤四：通过error接口处理失败验证

```js
$yllt.error(function(res){
    // config信息验证失败会执行error函数 
});
```
## 接口调用说明

所有接口通过$yllt对象来调用，参数是一个对象，除了每个接口本身需要传的参数之外，还有以下通用参数：

1. success：接口调用成功时执行的回调函数。
2. fail：接口调用失败时执行的回调函数。

> 注意：此处的`success`和`fail`回调函数只是表明成功调起了 `APP`或者 `小程序`的某个功能，并不代表后续的功能操作成功。


### 工具接口

```js
$yllt.isMiniProEnv(); // 判断是否在微信小程序环境。 返回值为 true 或 false

$yllt.isAppEnv(); // 判断是否在判断是否在原生app环境。 返回值为 true 或 false
```

### 支付接口

支付接口必须放在ready函数中调用。

```js
  $yllt.config({
    appKey: '', // 必填，
    timestamp: '', // 必填
    nonceStr: '', // 必填，
    signature: '', // 必填
    skdApiList: ['miniProgramPay', 'miniProgramShare', 'appPay', 'appShare'] // 必填
  })  
  $yllt.ready(function(){
    // 调起亚拉拉特小程序的集成支付组件
    $yllt.miniProgramPay({
      data: {},  // 参数为一个对象 具体的键值对约定 待定
      success: function (res) {
         console.log('miniProgramPay success', res);
      },
      fail: function (res) {
        console.log('miniProgramPay fail', res);
      }
    })

    // 调起亚拉拉特APP的集成支付组件
    $yllt.appPay({
      data: {},  // 参数为一个对象 具体的键值对约定 待定
      success: function (res) {
         console.log('appPay success', res);
      },
      fail: function (res) {
        console.log('appPay fail', res);
      }
    })
  })

```

### 分享接口

分享接口必须放在ready函数中调用。

```js
  // 同样是放在ready的函数里面，同上

  // 调起亚拉拉特小程序的分享功能
  $yllt.miniProgramShare({
    data: {},  // 参数为一个对象 具体的键值对约定 待定
    success: function (res) {
        console.log('miniProgramShare success', res);
    },
    fail: function (res) {
      console.log('miniProgramShare fail', res);
    }
  })

  // 调起亚拉拉特APP的分享功能
  $yllt.appShare({
    data: {},  // 参数为一个对象 具体的键值对约定 待定
    success: function (res) {
        console.log('appShare success', res);
    },
    fail: function (res) {
      console.log('appShare fail', res);
    }
  })
```
