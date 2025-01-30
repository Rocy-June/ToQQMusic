# 获取 QQ 音乐 `Cookies` 和 `歌单ID`

## Cookies

1. 前往 [QQ音乐官网](https://y.qq.com/) 并登录

2. 打开控制台(`F12` 或 `Ctrl + Shift + I`)，切换到 `Network(网络)` 标签，然后刷新页面

3. 找到名称为 `y.qq.com` 的请求并选中它，在 `标头(Headers)` 标签中复制全部 `Cookie`

   ![复制Cookie示例图](https://github.com/alex3236/ToQQMusic/assets/45303195/274866e4-d2e0-4e02-90fa-226f6c513c5a)

4. 将 `Cookie` 的内容复制到 `config.json` 文件的 `cookies` 字段中，并保存

## 歌单ID

- 如果你想导入到 `我喜欢`，那么 `歌单ID` 为 `201`

1. 在 `首页 >我的音乐 > 我创建的歌单` 中进入要导入到的目标歌单页面

2. 此时浏览器地址为 `https://y.qq.com/n/ryqq/playlist/<歌单ID>`，将 `<歌单ID>` 复制出来即可

   ![歌单ID示例图](https://github.com/alex3236/ToQQMusic/assets/45303195/059acda1-53c2-4990-9e19-ec15c48e4087)

3. 将 `<歌单ID>` 复制到 `config.json` 文件的 `dirid` 字段中，并保存
