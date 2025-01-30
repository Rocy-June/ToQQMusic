const fs = require("node:fs");

// 配置文件兼容性处理: 1.1.0 -> 1.2.0
const config_update_null_to_1_2_0 = async (config) => {
  /*
    差异记录:
      - 新增 auto_match_mode(自动匹配模式) 配置项, 默认值为 "", 用于控制使用什么样的自动匹配模式
      - 新增 title_match_weight(歌曲名称匹配权重) 配置项, 默认值为 0, 用于控制歌曲标题匹配的相似度阈值
      - 新增 config_version(配置文件版本号) 配置项, 用于记录配置文件版本号
      - 新增 debug_mode(调试模式) 配置项, 默认值为 false, 用于控制是否开启调试模式
  */

  config.auto_match_mode = "";
  config.title_match_weight = 0;
  config.config_version = "1.2.0";
  config.debug_mode = false;

  fs.writeFileSync("config.json", JSON.stringify(config, null, 4));

  console.log("配置文件已更新至 1.2.0");

  return config;
};

// 配置文件更新函数列表
const update_functions = {
  // 1.1.0 不存在版本号
  "": config_update_null_to_1_2_0,
  null: config_update_null_to_1_2_0,
  undefined: config_update_null_to_1_2_0,
};

module.exports = update_functions;
