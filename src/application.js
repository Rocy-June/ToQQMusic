const { exit } = require("node:process");
const inquirer = require("inquirer");

const pause = async (message) => {
  message || (message = "按下 Enter 继续...");

  await inquirer.prompt([
    {
      type: "input",
      name: "ans",
      message: message,
    },
  ]);
};

const pauseAndExit = async (code) => {
  try {
    await pause("程序结束. 按下 Enter 退出.");
  } finally {
    exit(code);
  }
};

module.exports = { pause, pauseAndExit };
