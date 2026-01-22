# grep

## 正则表达式语法
* **Basic Regular Expressions (BRE)**  
  `grep` 默认使用的基本正则表达式语法，`?`、`+`、`{`、`|`、`(`、`)` 默认匹配原始字符，需要使用反斜杠转义后才表示特殊含义，除 POSIX 标准外还支持 `\b`、`\<`、`\>`、`\w`、`\s` 等简写形式。
* **Extended Regular Expressions (ERE)**  
  `grep -E` 使用的扩展正则表达式语法，与 BRE 的主要区别是 `?`、`+`、`{`、`|`、`(`、`)` 默认表示特殊含义，不需要反斜杠转义。在 `man 1 grep` 中有提到，GNU grep 里的 BRE 和 ERE 只是相同模式匹配功能的两种不同表示法。
* **Perl-compatible Regular Expressions (PCRE)**  
  `grep -P` 使用的 Perl 兼容正则表达式语法，支持反向引用、正向/反向肯定/否定预查、递归模式等高级特性，但与 Perl 正则表达式并不完全相同，不同的编程语言在实现上也会有差异。

参考来源：
* [Wikipedia: Regular expression](https://en.wikipedia.org/wiki/Regular_expression)
* [GNU grep manual: Regular Expressions](https://www.gnu.org/software/grep/manual/grep.html#Regular-Expressions)
* [Baeldung: The Differences Between BRE, ERE, and PCRE Syntax in Linux](https://www.baeldung.com/linux/bre-ere-pcre-syntax)
* [regex101: build, test, and debug regex](https://regex101.com)

附：Go 语言标准库里的 regexp 接受的是 [RE2](https://golang.org/s/re2syntax) 语法，具体格式可参考 [regexp/syntax](https://pkg.go.dev/regexp/syntax)，因不支持正向否定预查 `(?!pattern)` 曾引发过一次不小的事故，来自 [VPS信号旗播报](https://t.me/vps_xhq/776) 的事故描述如下：
> 2025.12.15 22:38 源头仓库 [v2fly/domain-list-community](https://github.com/v2fly/domain-list-community) 合并了编号为 [PR #2695](https://github.com/v2fly/domain-list-community/pull/2695) 的提交。该提交包含了一个错误的正则表达式。  
> 2025.12.16 06:15 著名的规则整合仓库 [Loyalsoldier/v2ray-rules-dat](https://github.com/Loyalsoldier/v2ray-rules-dat) 自动执行了上游同步脚本，将该错误规则吸纳并发布。  
> 2025.12.16 上午 “灾难”开始爆发。开启了“自动更新 Geosite”功能的客户端在拉取最新规则后，立即遭遇解析错误，导致服务崩溃或网络中断。  

## 已知格式 JSON 简单取值
```json
{
  "k1": "string",
  "k2": true,
  "k3": 12345
}
```
* k1: `echo '{"k1":"string","k2":true,"k3":12345}' | grep -Po '(?<=k1":")[^"]*'`
* k2: `echo '{"k1":"string","k2":true,"k3":12345}' | grep -Po '(?<=k2":)[^,]*'`
* k3: `echo '{"k1":"string","k2":true,"k3":12345}' | grep -Po '(?<=k3":)\d*'`
