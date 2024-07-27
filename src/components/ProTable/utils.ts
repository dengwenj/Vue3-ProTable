export function formatNumber(num: any, cent: number, isThousand: boolean = true) {
  num = num.toString().replace(/\$|\,/g, '')

  // 检查传入数值为数值类型
  if (isNaN(num)) {
    num = '0'
  }

  // 获取符号(正/负数)
  const sign = (num === Math.abs(num).toString())
  num = Math.abs(num).toString()

  num = Math.floor(num * Math.pow(10, cent) + 0.50000000001) // 把指定的小数位先转换成整数.多余的小数位四舍五入
  let cents = num % Math.pow(10, cent) as any // 求出小数位数值
  num = Math.floor(num / Math.pow(10, cent)).toString() // 求出整数位数值
  cents = cents.toString() // 把小数位转换成字符串,以便求小数位长度

  // 补足小数位到指定的位数
  while (cents.length < cent) {
    cents = '0' + cents
  }

  if (isThousand) {
    // 对整数部分进行千分位格式化.
    for (var i = 0; i < Math.floor((num.length - (1 + i)) / 3); i++) {
      num = num.substring(0, num.length - (4 * i + 3)) + ',' + num.substring(num.length - (4 * i + 3))
    }
  }

  if (!sign) {
    num = '-' + num
  }
  if (cent > 0) {
    return num + '.' + cents
  } else {
    return num
  }
}

/**
 * 日期格式化 20200918 格式化为：2020-09-18
 * @param {日期} data
 * isHorizontal 是否带横杠
 */
export function stringDateFormat(data: string, isHorizontal: boolean = true) {
  // 变成不带横杠的
  if (!isHorizontal) {
    const stringData = `${data.slice(0, 4)}${data.slice(5, 7)}${data.slice(8, 10)}`
    return stringData
  }

  // 带横杠
  if(data !== null && data !== '' && typeof (data) !== 'undefined'){
    var stringData = data.substring(0,4) + "-" +data.substring(4,6) + "-" + data.substring(6,8)
    return stringData
 }
}

/**
 * copy 文本
 * @param copyText 
 */
export function fnCopy(copyText: string) {
  // 在 https 和 localhost 生效
  if (navigator.clipboard) {
    navigator.clipboard
      .writeText(copyText)
      .then(() => {
        // console.log('复制成功')
      })
      .catch(() => {
        const input = document.createElement('input')
        document.body.appendChild(input)
        input.setAttribute('value', copyText)
        input.select()
        if (document.execCommand('copy')) {
          document.execCommand('copy')
        }
        document.body.removeChild(input)
      })
  } else {
    // 创建text area
    const textArea = document.createElement("textarea");
    textArea.value = copyText
    // 使text area不在viewport，同时设置不可见
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()
    new Promise((resolve, reject) => {
      // 执行复制命令并移除文本框
      document.execCommand("copy") ? resolve('') : reject(new Error("出错了"))
      textArea.remove()
    })
  }
}

export class Constants {
  public static current: number = 1;
  public static pageSize: number = 10;
}