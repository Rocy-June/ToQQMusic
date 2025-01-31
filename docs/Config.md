# 配置文件说明

## 版本

- 版本号：1.1.0

  ```json
  {
    "cookies": "pgv_pvid=xxx; RK=xxx; ptcz=xxx; qq_domain_video_guid_verify=xxx",
    "dirid": "201"
  }
  ```

  - `cookies`：用于登录的 `QQ音乐` 的 `cookies` 字符串
  - `dirid`：导入目标歌单的 `id`

- 版本号：1.2.0

  ```json
  {
    "cookies": "pgv_pvid=xxx; RK=xxx; ptcz=xxx; qq_domain_video_guid_verify=xxx",
    "dirid": 201,
    "auto_match_mode": "word_rate_ex",
    "title_match_weight": 85,
    "config_version": "1.2.0",
    "debug_mode": true
  }
  ```

  - `cookies`：用于登录的 `QQ音乐` 的 `cookies` 字符串
  - `dirid`：导入目标歌单的 `id`
  - `auto_match_mode`：自动匹配模式，可选值：
  
    - `first`（根据QQ音乐给出的排序首项）
    - `word`（歌名字数差异量）
    - `word_rate`（歌名字数差异比例）
    - `wordrate_ex`（歌名字数差异比例 + 搜索排序加权）
    - `rate`（歌名字数差异比例，使用相似度算法）
  
    > - 英语歌单下推荐 `rate` > `wordrate_ex` > `first` > `word_rate` > `word`
    > - 国语歌单下推荐 `wordrate_ex` > `first` > `word_rate` > `rate` > `word`
    > - 日韩歌单下推荐 `wordrate_ex` > `first` > `rate` > `word_rate` > `word`
    > - 混杂歌单下推荐 `first` > `rate` > `wordrate_ex` > `word_rate` > `word`
    > > 但个别情况下 `word` 或 `word_rate` 有奇效...  
    > > 本推荐未经过严格测试，请根据实际情况调整匹配模式
  
  - `title_match_weight`：匹配权重，范围根据 `auto_match_mode` 而定：
  
    - `first`：无效
    - `word`：n < 0
    - `word_rate`：0 < n < 100
    - `wordrate_ex`：0 < n
    - `rate`：0 < n < 100

    > 在有多个匹配项时，会优先选择权重值最高的匹配项
  
  - `config_version`：配置文件版本号，请勿手动修改
  - `debug_mode`：调试模式，默认关闭，开启后可用于调试适合自己歌单的匹配模式，此模式下以下功能会发生改变：

    - 自动匹配模式不会跳过选择，而是为每个选项前加上每个匹配模式的匹配度，如：

      ```cmd
      ? 请指定: 夜曲 - 周杰伦 (Use arrow keys)
      > x > (word -53) (word_rate  14.0%) (word_rate_ex  68.2%) (rate 100.0%) 夜曲 - 周杰伦
        x > (word -58) (word_rate  14.3%) (word_rate_ex  62.9%) (rate  50.0%) 夜曲 (Live) - 周杰伦
        x > (word -61) (word_rate  16.7%) (word_rate_ex  61.2%) (rate  42.1%) 夜曲 + 窃爱 (Live) - 周杰伦
        x > (word -53) (word_rate  14.0%) (word_rate_ex  53.2%) (rate 100.0%) 夜曲 - 周杰伦
        x > (word -57) (word_rate  14.6%) (word_rate_ex  48.5%) (rate 100.0%) 夜曲 (伴奏) - 周杰伦
        x > (word -60) (word_rate  13.7%) (word_rate_ex  41.7%) (rate 100.0%) 夜曲 (升调版伴奏) - 周杰伦
        x > (word -53) (word_rate  14.0%) (word_rate_ex  38.2%) (rate 100.0%) 夜曲 - 周杰伦
        x > (word -58) (word_rate  14.3%) (word_rate_ex  32.9%) (rate 100.0%) 夜曲 (纯音乐) - 周杰伦
        x > (word -71) (word_rate  20.3%) (word_rate_ex  35.0%) (rate  34.5%) 夜曲 - dj - dato.pan - dj - dat - 周杰伦 
        x > (word -57) (word_rate  18.0%) (word_rate_ex  29.1%) (rate 100.0%) 夜 曲&迷 迭 香 - 周杰伦
      ```

    - 选择歌曲后不会向 `QQ音乐` 服务器发送加入歌单的请求
    - 不会自动修改 `lastLeft.txt` 的内容

    > 你可以在 `debug_mode` 开启的情况下，随意选择查询到的歌曲，用以对比每种匹配模式的匹配度，并选择最适合自己的匹配模式
