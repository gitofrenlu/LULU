// importScripts("https://storage.googleapis.com/workbox-cdn/releases/3.1.0/workbox-sw.js");
var cacheStorageKey = 'minimal-pwa-3'
var cacheList=[
  '/',
  '/index.html',
  '/main.css',
  '/avatar.png'
]

self.addEventListener('install',e =>{
  console.log("service worker is install");
  e.waitUntil(
    caches.open(cacheStorageKey)
    .then(cache => 
      {cache.addAll(cacheList)}
      )
    .then(() => {
      self.skipWaiting();
      console.log('install end')
    })
  )

  // 执行安装步骤
  // ExtendableEvent.waitUntil()方法延长了安装过程，直到其传回的Promise被resolve之后才会安装成功
  // e.waitUntil(
  //   caches.open(cacheStorageKey)
  //     .then(function(cache) {
  //       // console.log('Opened cache');
  //       return cache.addAll(cacheList);
  //     })
  // );

})

//捕获网络请求，制定缓存策略
self.addEventListener('fetch', function (event) {
  event.respondWith(
      caches.match(event.request)
      .then(response => {
          // Cache hit - return response
          if (response) {
              return response;
          }
          // 克隆请求。因为请求是一个“stream”，只能用一次。但我们需要用两次，一次用来缓存，一次给浏览器抓取内容，所以需要克隆
          var fetchRequest = event.request.clone();
          // 返回请求的内容
          return fetch(fetchRequest).then(
              response => {
                  // 检查是否为有效的响应。basic表示同源响应，也就是说，这意味着，对第三方资产的请求不会添加到缓存。
                  if (!response || response.status !== 200 || response.type !== 'basic') {
                      return response;
                  }
                  // 同request，response是一个“stream”，只能用一次，但我们需要用两次，一次用来缓存一个返回给浏览器，所以需要克隆。
                  var responseToCache = response.clone();
                  // 缓存新请求
                  caches.open(cacheStorageKey)
                      .then(cache => cache.put(event.request, responseToCache));
                  return response;
              }
          );
      })
  );
});

//sw安装成功并激活   =》 用来删除过期的缓存
self.addEventListener('activate',function(e){
    console.log("service worker is active");
    e.waitUntil(
      //获取所有cache名称
      caches.keys().then(cacheNames => {
        return Promise.all(
          // 获取所有不同于当前版本名称cache下的内容
          cacheNames.filter(cacheNames => {
            return cacheNames !== cacheStorageKey
          }).map(cacheNames => {
            return caches.delete(cacheNames)
          })
        )
      }).then(() => {
        return self.clients.claim()
      })
    )
  })