# To QQMusic

~~优雅地~~将网易云音乐（或其他音乐平台）的歌单转换到 QQ 音乐。

![动画](https://github.com/alex3236/ToQQMusic/assets/45303195/003b527f-258a-4c92-8e15-2f0c4467f272)

## 背景

虽然各大音乐平台都有歌单导入功能，但都有两个我无法接受的地方：

- 识别错误：部分歌曲在曲库中存在，但匹配不到或者匹配错误；

- 顺序错误：导入歌单后的顺序与原平台歌单的顺序不同。

刚好因为一些原因，我打算放弃网易云音乐，顺便就做了这个项目。

## 特点
- 保留原始歌单顺序
- 自由选择每首歌的匹配结果

## 缺陷
- 即使有完全匹配的结果，也必须手动选择

## 注意

此项目与官方无关，接口并非官方公开提供。此项目仅使用 QQ 音乐接口，私以为没有侵犯相关公司权益。

此项目仅供学习参考，请勿用于非法用途，不保证稳定性。

## 使用方式

1. [获取歌曲列表](docs/NeteaseExport.md)，并按照如下格式使用 UTF-8 编码导出为 JSON 文件：

```json5
[
    {
        "t": "歌曲名称",
        "s": "歌手1/歌手2"
    },
    {
        // ...
    }
]
```

2. 运行此脚本，生成默认配置文件

3. 编辑配置文件，填入 [Cookies 和 QQ音乐歌单ID](docs/QQProps.md)

4. 再次运行，输入歌单列表，开始导入

## 源码启动
```shell
$ yarn
$ yarn run start
```

## 构建二进制文件（已过时）
```shell
$ pnpm i -g pkg
$ pkg -t node16-win-x64 -C GZip index.js -o dist/to-qqmusic.exe
```
