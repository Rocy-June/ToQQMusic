// 仅匹配字符相等性 => Number(相差数量, 非正整数)
const wordMatch = (name1, name2, index) => {
  console.log("before", name1, name2);
  name1 = name1.replace(/\s/g, "").toLowerCase();
  name2 = name2.replace(/\s/g, "").toLowerCase();
  console.log("after", name1, name2);

  let count = Math.abs(name1.length - name2.length);
  console.log("count", count);
  console.log("lengths", name1.length, name2.length);
  let min_length = Math.min(name1.length, name2.length);
  for (let i = 0; i < min_length; i++) {
    if (name1[i] != name2[i]) {
      count++;
    }
  }

  return count * -1;
};

// 基于字符数量差异匹配相似度 => Number(相似度, 0-100, 浮点数)
const wordRateMatch = (name1, name2, index) => {
  let count = Math.abs(wordMatch(name1, name2));
  let rate = (count / Math.max(name1.length, name2.length)) * 100;

  return 100 - rate;
};

// 基于字符数量差异匹配相似度 + 顺序偏移量 => Number(相似度, 0-100, 浮点数)
const wordRateOrderOffsetMatch = (name1, name2, index) => {
  let rate = wordRateMatch(name1, name2, index);
  rate += (10 - index) * 3;

  return rate;
}

// 基于字符串相似度算法匹配相似度 => Number(相似度, 0-100, 浮点数)
const rateMatch = (name1, name2, index) => {
  name1 = name1.replace(/\s/g, "").toLowerCase();
  name2 = name2.replace(/\s/g, "").toLowerCase();

  if (name1 === name2) return 100;

  // 分割字符串为分段 (按非字母数字字符分割)
  const splitSegments = (s) =>
    s.split(/[^a-z0-9]/g).filter((seg) => seg.length > 0);

  // 计算最长公共子序列长度 (用于顺序敏感的分段比较)
  const longestCommonSubsequence = (arr1, arr2) => {
    const m = arr1.length,
      n = arr2.length;
    const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        dp[i][j] =
          arr1[i - 1] === arr2[j - 1]
            ? dp[i - 1][j - 1] + 1
            : Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
    return dp[m][n];
  };

  // 计算Jaccard相似度 (用于分段集合比较)
  const jaccardSimilarity = (a, b) => {
    const set_a = new Set(a),
      set_b = new Set(b);
    const intersection = new Set([...set_a].filter((x) => set_b.has(x)));
    const union_size = set_a.size + set_b.size - intersection.size;
    return union_size === 0 ? 1 : intersection.size / union_size;
  };

  // 计算Dice系数 (用于整体字符串的bigram比较)
  const diceCoefficient = (s, t) => {
    if (s === t) return 1;
    if (s.length < 2 || t.length < 2) return 0;

    const bigrams = new Map();
    for (let i = 0; i < s.length - 1; i++) {
      const bigram = s.substr(i, 2);
      bigrams.set(bigram, (bigrams.get(bigram) || 0) + 1);
    }

    let overlap = 0;
    for (let i = 0; i < t.length - 1; i++) {
      const bigram = t.substr(i, 2);
      if (bigrams.get(bigram) > 0) {
        overlap++;
        bigrams.set(bigram, bigrams.get(bigram) - 1);
      }
    }

    return (2 * overlap) / (s.length - 1 + t.length - 1);
  };

  // 分割成分段数组
  const seg1 = splitSegments(name1);
  const seg2 = splitSegments(name2);

  // 计算三种相似度指标
  const order_sim =
    seg1.length + seg2.length === 0
      ? 1
      : longestCommonSubsequence(seg1, seg2) /
        Math.max(seg1.length, seg2.length);
  const jaccard = jaccardSimilarity(seg1, seg2);
  const dice = diceCoefficient(name1, name2);

  // 取最大值作为最终相似度
  const similarity = Math.max(order_sim, jaccard, dice);

  return similarity * 100;
};

const firstMatch = (name1, name2, index) => {
  return Number.MAX_SAFE_INTEGER - index;
};

module.exports = {
  wordMatch,
  wordRateMatch,
  wordRateOrderOffsetMatch,
  rateMatch,
  firstMatch
};
