# 浏览器

## 在控制台中选择本地文件
```js
input = document.createElement('input')
input.style = 'position:fixed;left:0;top:0;z-index:99999;'
input.type = 'file'
document.body.appendChild(input)
// Chrome 可直接调用 input.click() 触发
// Firefox 会提示“由于用户并未触发，已禁用 <input> 选择器”，需要手动在网页中点击按钮触发
input.click()

// 获取文件信息
file = input.files[0]
console.log(`Name: ${file.name}`)
console.log(`Size: ${file.size/1024} KiB`)

// 读取文件内容
const readAsTextAsync = (fi) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = (err) => reject(err)
    reader.readAsText(fi)
  })
}
console.log(await readAsTextAsync(file))
```

参考来源：
* [Stack Overflow: How to open select file dialog via js?](https://stackoverflow.com/questions/16215771/how-to-open-select-file-dialog-via-js)
* [MDN Web APIs: FileReader](https://developer.mozilla.org/en-US/docs/Web/API/FileReader)

## Chrome 控制台工具函数
* 获取控制台上一次求值结果 `$_`
* 复制字符串到系统剪贴板 `copy(content)`
* 获取所有 WebSocket 实例 `queryObjects(WebSocket)`
* 监听窗口中所有按键事件 `monitorEvents(window, ['key'])`

附：
* 在 DevTools 的 Memory 栏创建 Heap snapshot，也可以找到 WebSocket 实例并 Store as global variable
* monitorEvents 支持的事件类型：
  * mouse: mousedown, mouseup, click, dblclick, mousemove, mouseover, mouseout, mousewheel
  * key: keydown, keyup, keypress, textInput
  * touch: touchstart, touchmove, touchend, touchcancel
  * control: resize, scroll, zoom, focus, blur, select, change, submit, reset

参考来源：
* [Chrome DevTools: Console Utilities API reference](https://developer.chrome.com/docs/devtools/console/utilities)
* [Firefox Source Docs: Web Console Helpers](https://firefox-source-docs.mozilla.org/devtools-user/web_console/helpers/index.html)

## Chrome 本地替换网页内容
从 Chrome 65 开始，浏览器开发者工具就支持了 Local Overrides 功能，可以在 Sources 栏右键选择 `Override content` 修改 html/js/css 文件内容，也可以在 Network 栏右键选择 `Override content` 或 `Override headers` 修改网络响应。  
浏览器会将修改后的文件内容保存到指定的本地文件夹，在重新加载网页时使用修改后的本地文件替代原始内容。

参考来源：
* [Chrome DevTools: Override web content and HTTP response headers locally](https://developer.chrome.com/docs/devtools/overrides)
* [Chrome Blog: What's New In DevTools (Chrome 65)](https://developer.chrome.com/blog/new-in-devtools-65/#overrides)

## Chrome 修改网页默认语言
部分网页会根据浏览器的 Locale 自动选择展示语言，如果只是为了调试页面，不想修改浏览器全局语言设置的话，可以在开发者工具中临时进行修改。  
先在开发者工具右上角的折叠菜单中找到 `More tools`，打开 Sensors 工具，然后切换不同的 Location 就可以实现不同的 Locale。

参考来源：
* [Stack Overflow: How to change the locale in the Chrome browser](https://stackoverflow.com/questions/37221494/how-to-change-the-locale-in-the-chrome-browser)
* [Chrome DevTools: Sensors: Emulate device sensors](https://developer.chrome.com/docs/devtools/sensors#geolocation)
* [Chrome DevTools: Locations](https://developer.chrome.com/docs/devtools/settings/locations)

## 浏览器安全上下文
部分浏览器 API 只能在安全上下文中调用，例如 Clipboard，Service Worker，Notifications，Web Crypto 等
* Chrome 对 secure origin 的判断方法是看 `(scheme, host, port)` 三项是否符合以下情况：
  ```
  (https, *, *)
  (wss, *, *)
  (*, localhost, *)
  (*, 127/8, *)
  (*, ::1/128, *)
  (file, *, —)
  (chrome-extension, *, —)
  ```
* Firefox 对 secure context 的判断依据则来自 [W3C Secure Contexts Specification](https://w3c.github.io/webappsec-secure-contexts/#is-origin-trustworthy)
  ```
  local:
    http://127.0.0.1
    http://localhost
    http://*.localhost
    file://
  remote:
    https://
    wss://
  ```

参考来源：
* [MDN Secure contexts: Features restricted to secure contexts](https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/Secure_Contexts/features_restricted_to_secure_contexts)
* [The Chromium Projects: Prefer Secure Origins For Powerful New Features](https://www.chromium.org/Home/chromium-security/prefer-secure-origins-for-powerful-new-features/)
* [MDN Secure contexts: Potentially trustworthy origins](https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/Secure_Contexts#potentially_trustworthy_origins)

## 浏览器截图
* Firefox 的截图功能较为开放，直接在网页空白处右键即可看到截图按钮，可以单击选择 DOM 节点，可以拖拽选择矩形区域，也可以在右上角选择截取可见范围或整个页面。
* Chrome 的截图功能隐藏较深，需要先打开浏览器开发者工具，然后在右上角的折叠菜单中点击 `Run command` 打开命令输入框，搜索 screenshot 可以找到四个选项：
  * 截取矩形区域: `Capture area screenshot`
  * 截取整个页面: `Capture full size screenshot`
  * 截取 DOM 节点: `Capture node screenshot`
  * 截取可见范围: `Capture screenshot`
* Firefox 和 Chrome 都支持在浏览器开发者工具中的 Inspector 或 Elements 栏先选择 DOM 节点，再右键对节点截图。

参考来源：
* [Firefox Help: Take screenshots in Firefox](https://support.mozilla.org/en-US/kb/take-screenshots-firefox)
* [Stack Overflow: How to take a screenshot of lengthy website on Google Chrome?](https://stackoverflow.com/questions/67656570/how-to-take-a-screenshot-of-lengthy-website-on-google-chrome)
* [Chrome Blog: 4 ways to capture screenshots with DevTools](https://developer.chrome.com/blog/devtools-tips-33)
