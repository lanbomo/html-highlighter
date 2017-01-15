;(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(factory)
    } else if (typeof exports === 'object') {
        module.exports = factory()
    } else {
        root.highlighter = factory()
    }
})(this, function () {
    return {
        htmlEncode: function (str) {
            var s = ""
            if (str.length === 0) return ""
            s = str.replace(/&/g, "&amp;")
            s = s.replace(/</g, "&lt;")
            s = s.replace(/>/g, "&gt;")
            // s = s.replace(/ /g,"&nbsp;")
            s = s.replace(/\'/g, "&#39;")
            s = s.replace(/\"/g, "&quot;")
            //s = s.replace(/\n/g, "<br>")
            return s
        },
        htmlDecode: function (str) {
            var s=""
            if(str.length === 0) return ""
            s = str.replace(/&amp;/g, "&")
            s = s.replace(/&lt;/g, "<")
            s = s.replace(/&gt;/g, ">")
            // s = s.replace(/&nbsp;/g, " ")
            s = s.replace(/&#39;/g, "\'")
            s = s.replace(/&quot;/g, "\"")
            // s = s.replace(/<br>/g, "\n")
            return s
        },
        lexer: function (str) {
            // 1 doctype, 2 punct 符号, 3 word 单词, 4 literal 字面量, 5 space 空白符
            let regexPat = /(&lt;!doctype)|(&lt;!--|--&gt;|&lt;\/?|\/?&gt;|=)|([\:\@\#]+|[\w][\w\-\:\@]*|[\u4E00-\u9FA5\-\:]+)|(&quot;[\s\S]*?&quot;|&#39;[\s\S]*?&#39;)|(\s+)/gi
            let tokens = []
            let token = function (type, value, index) {
                // 省略非标签内容
                if (/^(--&gt;|\/?&gt;)$/i.test(value)) {
                    findStartPunct()
                } else if (/^&lt;!--$/i.test(value)) {
                    findEndComment()
                } else if (/^(&lt;!doctype)$/i.test(value)) {
                    findEndDoctype()
                }
                return {
                    type: type, value: value, index: index
                }
            }
            function findStartPunct() {
                let index = str.substr(regexPat.lastIndex).search(/&lt;!doctype|&lt;!--|&lt;\/?/i)
                if (index !== -1)
                    regexPat.lastIndex = regexPat.lastIndex + index
            }
            function findEndComment() {
                let index = str.substr(regexPat.lastIndex).search(/--&gt;/i)
                if (index !== -1)
                    regexPat.lastIndex = regexPat.lastIndex + index
            }
            function findEndDoctype() {
                let index = str.substr(regexPat.lastIndex).search(/&gt;/i)
                if (index !== -1)
                    regexPat.lastIndex = regexPat.lastIndex + index
            }
            let result
            while ((result = regexPat.exec(str)) != null) {
                if (undefined != result[1]) { // doctype
                    tokens.push(token('punct', result[1], result.index))
                    // tokens.push(token('punct', '&lt;!', result.index)) //&lt;!
                    // tokens.push(token('word', result[1].substr(2), result.index + 2)) //doctype
                } else if (undefined != result[2]) { // punct
                    tokens.push(token('punct', result[2], result.index))
                } else if (undefined != result[3]) { // word
                    tokens.push(token('word', result[3], result.index))
                } else if (undefined != result[4]) { // literal
                    tokens.push(token('literal', result[4], result.index))
                } else if (undefined != result[5]) { // space
                    tokens.push(token('space', result[5], result.index))
                }
            }
            return tokens
        },
        // 进行简单的语法分析，生成便于高亮的词法序列
        preParser: function (str) {
            // punct < </ > /> <!, tag 标签名, attr 属性名, value 属性值, attr-eq =, attr-punct " ', comment <!-- -->, space 空白符
            let tokens = this.lexer(str)
            let preAST = []
            function para(index, value, type, length) {
                return {
                    index: index,length: (length || value.length),type: type,value: (value || '')
                }
            }
            function findNext(value, type) {
                let returnToken = null
                while (tokens.length > 0) {
                    let t = tokens.shift()
                    if (t.value === value && t.type === type) {
                        returnToken = t
                        break
                    }
                }
                return returnToken
            }
            let nextExpected
            let tagOpen = null
            let tagName = null
            while (tokens.length > 0) {
                let token = tokens.shift()
                if (token.type === "punct") {
                    // doctype
                    if (/&lt;!doctype/i.test(token.value)) {
                        preAST.push(para(token.index, "&lt;!", "punct"))
                        let next = findNext("&gt;", "punct")
                        if (next) {
                            preAST.push(para(next.index, next.value, "punct"))
                            tagOpen = null
                        } else {
                            tagOpen = "&lt;!"
                        }
                        // comment 注释
                    } else if (/&lt;!--/i.test(token.value)) {
                        let next = findNext("--&gt;", "punct")
                        if (next) {
                            preAST.push(para(token.index, "", "comment", next.index - token.index + next.value.length))
                            tagOpen = null
                        } else {
                            preAST.push(para(token.index, "", "comment", -1))
                        }
                        // tag 标签开
                    } else if (/&lt;\/?/i.test(token.value)) {
                        if (!tagOpen && !tagName) {
                            preAST.push(para(token.index, token.value, "punct"))
                            tagOpen = token.value
                            tagName = null
                        }
                        // tag 标签闭
                    } else if (/\/?&gt;/i.test(token.value)) {
                        if (tagOpen === "&lt;") {
                            preAST.push(para(token.index, token.value, "punct"))
                            tagOpen = null
                            tagName = null
                        } else if (tagOpen === "&lt;/" && token.value === "&gt;") {
                            preAST.push(para(token.index, token.value, "punct"))
                            tagOpen = null
                            tagName = null
                        } else if (tagOpen === "&lt;/" && token.value === "/&gt;") {
                            preAST.push(para(token.index + 1, "&gt;", "punct"))
                            tagOpen = null
                            tagName = null
                        }
                        // = 等号
                    } else if (/=/i.test(token.value)) {
                        if (tagOpen) {
                            preAST.push(para(token.index, token.value.substr(0, 1), "attr-eq"))
                        }
                    }
                } else if (token.type === "word") {
                    if (tagOpen && /^&lt;\/?$/i.test(preAST.slice(-1)[0].value)) {// 标签名
                        preAST.push(para(token.index, token.value, "tag"))
                        tagName = token.value
                    } else if (tagOpen && preAST.slice(-1)[0].type === "space") {// 属性名
                        preAST.push(para(token.index, token.value, "attr"))
                    } else if (tagOpen && /^[\:\@]$/i.test(preAST.slice(-1)[0].value)) {// 属性名
                        preAST.slice(-1)[0].type = "value"
                        preAST.push(para(token.index, token.value, "attr"))
                    } else if (tagOpen && preAST.slice(-1)[0].value === "=") {// 属性值
                        preAST.push(para(token.index, token.value, "value"))
                    }
                } else if (token.type === "literal") {// 引号值
                    if (tagOpen) {
                        // s = s.replace(/\'/g, "&#39;")
                        // s = s.replace(/\"/g, "&quot;")
                        let quotLength = token.value.search(/^&#39;/i) != -1 ? "&#39;".length : "&quot;".length
                        preAST.push(para(token.index, token.value.substr(0, quotLength), "attr-punct"))// 左引号
                        let valueLength = token.value.length - quotLength - quotLength
                        preAST.push(para(token.index+quotLength, token.value.substr(quotLength, valueLength), "value"))// 属性值
                        preAST.push(para(token.index+quotLength+valueLength, token.value.substr(token.value.length - quotLength, quotLength), "attr-punct"))// 右引号
                        // preAST.push(para(token.index, token.value, "value"))
                    }
                } else if (token.type === "space") {// 空白符
                    if (tagOpen && tagName) {
                        preAST.push(para(token.index, token.value, "space"))// 左引号
                    }else if(tagOpen && !tagName){
                        preAST.pop()
                        tagOpen = null
                    }
                }
            }
            return preAST
        },
        highlightCode: function (str) {
            let preAST = this.preParser(str)
            for (let i = preAST.length-1; i >= 0; i--) {
                let frag = preAST[i]
                if(frag.type === "space")continue
                let fragStr = str.substr(frag.index,frag.length).split(/\r\n|\n/).map(function(s){
                    return s.replace(/^(\s*)(.*?)(\s*)$/,`$1<span class="html ${frag.type}">$2</span>$3`)
                }).join("\n")
                str = str.substr(0,frag.index).concat(
                    `<span class="html ${frag.type}">${fragStr}</span>`
                    ,str.substr(frag.index+frag.length))
            }
            // 对每一行做行首空格符数量判断
            str = str.split(/\r\n|\n/i).map(function(s){
                let space = s.match(/^\s*/i)[0].length
                return `<li style="padding-left: ${space*0.5}em;text-indent: -${space*0.5}em;">${s}</li>`
            }).join('')
            // str = `<ol class="highlighter-ol"><li>${str.replace(/\r\n|\n/gi, '</li><li>')}</li></ol>`
            str = `<ol class="highlighter-ol">${str}</ol>`
            return str
        },
        highlight: function (codeStr) {
            return this.highlightCode(this.htmlEncode(codeStr))
        }
    }
})
