const { pause, pauseAndExit } = require("./application.js");
const update_functions = require("./config/update.js");
const fs = require("node:fs");

/*
 * 修改配置文件请修改此版本号, 并在 config/update.js 中添加升级函数来保证兼容性
 * 否则会因为判断版本号不一致而触发配置文件升级导致报错
 */
// 当前配置文件版本
const current_config_ver = "1.2.0";

// 默认配置文件
const default_config = {
  cookies: "",
  dirid: 201,
  auto_match_mode: "",
  auto_match_weight: 0,
  config_version: "1.2.0",
  debug_mode: true,
};

// 读取配置文件
const loadConfig = async () => {
  try {
    // 如果配置文件不存在, 则创建默认配置文件
    if (!fs.existsSync("config.json")) {
      fs.writeFileSync("config.json", JSON.stringify(default_config, null, 4));

      console.log("配置文件不存在, 已创建默认配置文件");

      await pauseAndExit(0);
      return;
    }

    // 读取配置文件
    let config = JSON.parse(fs.readFileSync("config.json", "utf8"));

    // 检查配置文件版本
    config = await config_version_check_and_update(config);

    // 检查配置文件基础内容
    await config_content_check(config);

    return config;
  } catch (error) {
    console.error("处理配置文件时发生错误: ", error.stack);

    await pauseAndExit(1);
  }
};

// 配置文件版本检查和更新
const config_version_check_and_update = async (config) => {
  // 在这里会依次升级配置文件, 直到版本号与当前版本号一致
  while (config.config_version != current_config_ver) {
    let update_function = update_functions[config.config_version];
    if (!update_function) {
      console.error(
        `配置文件版本 ${config.config_version} 不存在更新函数, 请联系作者更新`
      );

      await pauseAndExit(1);
      return null;
    }

    config = await update_functions[config.config_version](config);
  }

  return config;
};

const auto_match_modes = ["word", "word_rate", "word_rate_ex", "rate", "first"];

const config_content_check = async (config) => {
  let pause_flag = false;

  if (!config.cookies || !config.dirid) {
    console.error("配置文件未填写或内容缺失, 请检查后重试");

    await pauseAndExit(1);
    return;
  }
  if (config.auto_match_mode) {
    if (!auto_match_modes.includes(config.auto_match_mode)) {
      console.error(
        "配置项 auto_match_mode 指定了一个不支持的值, 请检查后重试"
      );

      await pauseAndExit(1);
      return;
    }
    if (config.auto_match_mode == "first") {
      console.warn(
        "配置项 auto_match_mode 已指定为 first, 这会使脚本永远自动匹配第一个结果, 可能导致匹配结果不准确"
      );

      pause_flag = true;
    } else if (config.auto_match_mode == "word") {
      if (config.auto_match_weight > 0) {
        console.error(
          "配置项 auto_match_weight 指定的值不在合法接受的范围内(n <= 0), 请检查后重试"
        );

        await pauseAndExit(1);
        return;
      }
    } else if (
      config.auto_match_mode == "word_rate" ||
      config.auto_match_mode == "rate"
    ) {
      if (config.auto_match_weight < 0 || config.auto_match_weight > 100) {
        console.error(
          "配置项 auto_match_weight 指定的值不在合法接受的范围内(0-100), 请检查后重试"
        );

        await pauseAndExit(1);
        return;
      }
      if (config.auto_match_weight < 50) {
        console.warn(
          "配置项 auto_match_weight 指定的值较低, 可能导致匹配结果不准确(推荐75以上)"
        );

        pause_flag = true;
      }
    } else if (config.auto_match_mode == "word_rate_ex") {
      if (config.auto_match_weight < 0) {
        console.error(
          "配置项 auto_match_weight 指定的值不在合法接受的范围内(n >= 0), 请检查后重试"
        );

        await pauseAndExit(1);
        return;
      }
      if (config.auto_match_weight < 50) {
        console.warn(
          "配置项 auto_match_weight 指定的值较低, 可能导致匹配结果不准确(推荐75以上)"
        );

        pause_flag = true;
      }
    }

    if (pause_flag) {
      await pause();
    }
  }
};

module.exports = { loadConfig };
