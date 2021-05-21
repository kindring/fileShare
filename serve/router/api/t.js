const { split } = require("core-js/fn/symbol")

// 罗马进制转换
const table = {
    'I': 1,
    'V': 5,
    'X': 10,
    'L': 50,
    'C': 100,
    'D': 500,
    'M': 1000
}

function toNumber(array) {
    return array.reduce((a, c, i, s) => {
        a += (c < s[i + 1] ? -c : c)
    }, 0)
}

// 阿拉伯数字转罗马数字
function fn(n) {
    n = parseInt(n, 10);
    if (n < 1 || n > 4999) {
        return
    }
    for (let key in table) {
        if (Math.floor(n / table[key])) {

        };
    }

}