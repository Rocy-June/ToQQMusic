const { pause, pauseAndExit } = require("./src/application.js");
const config_funcs = require("./src/config.js");
const match_funcs = require("./src/match.js");
const qq_music = require("qq-music-api");
const inquirer = require("inquirer");
const fs = require("node:fs");

// 读取音乐列表文件 => [String]
const loadSongList = async () => {
  try {
    let answers = await inquirer.prompt([
      {
        type: "input",
        name: "current_file",
        message: "音乐列表文件路径: ",
      },
    ]);
    let current_file = answers.current_file.replace(/^"|"$/g, "");
    let file_contents = fs.readFileSync(current_file, "utf8");

    return file_contents.split("\n");
  } catch (error) {
    console.error("读取音乐列表文件时发生错误: ", error.stack);

    await pauseAndExit(1);
  }
};

// 搜索歌曲 => [{name: String, value: String}]
const getSongs = async (fullName) => {
  try {
    let songs = [];

    let result = await qq_music.api("search", { key: fullName, pageSize: 10 });

    let song_list = result.list;
    for (let i = 0; i < song_list.length; i++) {
      let song = song_list[i];

      let name = song.songname;
      let singers = song.singer.map((singer) => singer.name).join(" / ");
      let mid = song.songmid;
      let fullLine = `${name} - ${singers}`;

      songs.push({ name: fullLine, value: mid });
    }

    return songs;
  } catch (error) {
    console.log("搜索时发生错误: ", error.stack);

    return null;
  }
};

const auto_match_funcs = {
  first: match_funcs.firstMatch,
  word: match_funcs.wordMatch,
  word_rate: match_funcs.wordRateMatch,
  word_rate_ex: match_funcs.wordRateOrderOffsetMatch,
  rate: match_funcs.rateMatch,
};

const choicesConvert = (full_name, choices) => {
  let match_mid = -1;
  let max_weight = 0;
  if (config.auto_match_mode) {
    if (config.auto_match_mode == "first") {
      match_mid = choices[0].value;
    }

    let match_func = auto_match_funcs[config.auto_match_mode];
    for (let i = 0; i < choices.length; i++) {
      let calc_weight = match_func(full_name, choices[i].name);

      if (config.auto_match_mode == "word") {
        choices[i].name = `(${calc_weight.toString().padStart(3, " ")}) ${
          choices[i].name
        }`;
      } else if (
        config.auto_match_mode == "rate" ||
        config.auto_match_mode == "word_rate"
      ) {
        choices[i].name = `(${calc_weight.toFixed(1).padStart(5, " ")}%) ${
          choices[i].name
        }`;
      }

      if (calc_weight > max_weight) {
        max_weight = calc_weight;
        match_mid = choices[i].value;
      }
    }
  }

  return {
    match_mid: match_mid,
    max_weight: max_weight,
  };
};

const debugChoicesConvert = (full_name, choices, config) => {
  let match_mid = -1;
  let max_weight = { word: 0, word_rate: 0, word_rate_ex: 0, rate: 0 };
  let test_arr = ["word", "word_rate", "word_rate_ex", "rate"];
  let debug_arr = [];
  for (let i = 0; i < test_arr.length; i++) {
    let match_func = auto_match_funcs[test_arr[i]];

    for (let j = 0; j < choices.length; j++) {
      let calc_weight = match_func(full_name, choices[j].name, j);

      debug_arr[j] || (debug_arr[j] = { text: "" });
      debug_arr[j][test_arr[i]] = calc_weight;

      if (test_arr[i] == "first" || test_arr[i] == "word") {
        debug_arr[j].text += `(${test_arr[i]} ${calc_weight
          .toString()
          .padStart(3, " ")}) `;
      } else if (
        test_arr[i] == "rate" ||
        test_arr[i] == "word_rate" ||
        test_arr[i] == "word_rate_ex"
      ) {
        debug_arr[j].text += `(${test_arr[i]} ${calc_weight
          .toFixed(1)
          .padStart(5, " ")}%) `;
      }

      if (calc_weight > max_weight[test_arr[i]]) {
        max_weight[test_arr[i]] = calc_weight;
        match_mid = choices[j].value;
      }
    }
  }

  for (let i = 0; i < choices.length; i++) {
    choices[i].name = `${
      debug_arr[i][config.auto_match_mode] == max_weight[config.auto_match_mode]
        ? "o"
        : "x"
    } ${debug_arr[i].text}${choices[i].name}`;
  }

  return {
    match_mid: match_mid,
    max_weight: max_weight,
  };
};

// 选择歌曲 => String
const chooseSong = async (full_name, config) => {
  // 获取歌曲列表
  let choices = await getSongs(full_name);
  if (choices.length == 0) {
    await pause("未找到歌曲. 按 Enter 继续.");
    return 0;
  }

  // 自动匹配
  let match_mid = -1;
  let max_weight = 0;
  if (config.debug_mode) {
    ({ match_mid, max_weight } = debugChoicesConvert(
      full_name,
      choices,
      config
    ));
  } else {
    ({ match_mid, max_weight } = choicesConvert(full_name, choices));
  }

  // 当自动匹配结果大于设定阈值时, 直接返回匹配结果
  if (!config.debug_mode && max_weight > config.auto_match_weight) {
    return match_mid;
  }

  // 显示歌曲列表, 选择歌曲
  choices.push(new inquirer.Separator());
  choices.push({ name: "没有我想要的歌曲", value: 0 });

  let answers = await inquirer.prompt([
    {
      type: "list",
      message: `请指定: ${full_name}`,
      name: "ans",
      choices: choices,
      pageSize: 15,
    },
  ]);
  if (answers.ans == 0) {
    console.log("未找到此歌曲");

    return 0;
  }

  return answers.ans;
};

// 发送添加到歌单请求 => Boolean
const addSongToPlaylist = async (mid, dirid) => {
  try {
    res = await qq_music.api("songlist/add", {
      mid: mid,
      dirid: dirid,
    });
    if (res !== undefined) {
      console.log(res);
    }
  } catch (error) {
    console.error("发生错误: ", error.stack);
    pause();

    return false;
  }

  return true;
};

// 主函数
const main = async () => {
  // 读取配置
  let config = await config_funcs.loadConfig();

  // 获取本地歌曲列表
  let songList = await loadSongList();
  songList = songList.reverse();

  // 设置请求Cookie
  qq_music.setCookie(config.cookies);

  // 遍历处理歌曲列表
  for (let i = 0; i < songList.length; i++) {
    console.clear();

    // 选择匹配歌曲
    let mid = await chooseSong(songList[i], config);
    // 未找到匹配项, 记录歌曲名到 errorList.txt
    if (mid == 0) {
      let error_content = fs.readFileSync("errorList.txt", "utf8");

      let error_array = error_content.split("\n");
      error_array.push(songList[i]);

      // 去重
      error_array = [...new Set(error_array)];

      fs.writeFileSync("errorList.txt", error_array.join("\n"));
    }

    if (!config.debug_mode) {
      await addSongToPlaylist(mid, config.dirid);

      fs.writeFileSync("lastLeft.txt", songList.slice(i + 1).join("\n"));
    }
  }

  await pauseAndExit(0);
};

main();
