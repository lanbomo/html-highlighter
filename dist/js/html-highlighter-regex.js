var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

;(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(factory);
    } else if ((typeof exports === 'undefined' ? 'undefined' : _typeof(exports)) === 'object') {
        module.exports = factory();
    } else {
        root.highlighter = factory();
    }
})(this, function () {
    'use strict';

    return {
        htmlEncode: function htmlEncode(str) {
            var s = "";
            if (str.length == 0) return "";
            s = str.replace(/&/g, "&gt;");
            s = s.replace(/</g, "&lt;");
            s = s.replace(/>/g, "&gt;");
            // s = s.replace(/ /g, "&nbsp;");
            s = s.replace(/\'/g, "&#39;");
            s = s.replace(/\"/g, "&quot;");
            // s = s.replace(/(\r\n|\n)/g, "<br>");
            return s;
        },
        htmlDecode: function htmlDecode(str) {
            var s = "";
            if (str.length == 0) return "";
            s = str.replace(/&gt;/g, "&");
            s = s.replace(/&lt;/g, "<");
            s = s.replace(/&gt;/g, ">");
            s = s.replace(/&nbsp;/g, " ");
            s = s.replace(/&#39;/g, "\'");
            s = s.replace(/&quot;/g, "\"");
            s = s.replace(/<br>/g, "\n");
            return s;
        },
        highlight: function highlight(codeStr) {
            var doctypeString = /(<!)(doctype.*?)(>)/;
            var tagString = /(<\/?)(\w+)(?:.)*(\/?>)/;

            var annotateString = '';
            var hlregexp = new RegExp(this.htmlEncode(doctypeString.source + '|' + tagString.source), "gi");
            var tokens = [
            // 0,1,2
            "doctype start", "doctype content", "doctype end",
            // 3,4,5,6,7,8,9
            "tag start", "tag name", "tag end", "tag attribute-name", "tag brackets", "tag attribute-value", "tag attribute-value-quote",
            // 10,11,12
            "annotate start", "annotate content", "annotate end"];
            function token(content, tokenIndex) {
                var str = '';
                if (content) {
                    str = content.split(/\r\n|\n/).map(function (s) {
                        return s.replace(/^(\s*)(.*?)(\s*)$/, '$1<span class="html ' + tokens[tokenIndex] + '">$2</span>$3');
                        // return `<span class="html ${tokens[tokenIndex]}">${s}</span>`
                    }).join("\n");
                }
                return str;
            }
            var html = this.htmlEncode(codeStr)
            // 匹配doctype
            .replace(/(&lt;!)(doctype.*?)(&gt;)/gi, '<span class="html ' + tokens[0] + '">$1</span><span class="html ' + tokens[1] + '">$2</span><span class="html ' + tokens[2] + '">$3</span>')
            // 匹配标签及其属性
            .replace(/(&lt;\/?)([\w-]+)([\s\S]*?)(\s*)(\/?&gt;)/gi, function () {
                var para = arguments;
                // para[3] = para[3].replace(/(\s+)([a-zA-z\-]+)(=)((?:&quot;)|(?:&#39;))(.*?)(\4)/gi,function(){
                // 属性
                para[3] = para[3]
                // 没有值的属性名
                .replace(/(\s+)([^\s=]+)(\s+|$)/gi, '$1<span class="html ' + tokens[6] + '">$2</span>$3')
                // 有值却没有引号的属性
                .replace(/(\s+)([a-zA-z\-]+)(=)((?!(?:&quot;|&#39;|\s|\'|\")))([^\s=]+)(\s+|$)/gi, function () {
                    var para = arguments;
                    return para[1] + token(para[2], 6) + token(para[3], 7) + token(para[4], 9) + token(para[5], 8) + para[6];
                })
                // 有值且有引号的属性
                .replace(/(\s+)([a-zA-z\-]+)(=)((?:&quot;)|(?:&#39;))([\s\S]*?)(\4)/gi, function () {
                    var para = arguments;
                    // console.dir(para)
                    return para[1] + token(para[2], 6) + token(para[3], 7) + token(para[4], 9) + token(para[5], 8) + token(para[6], 9);
                });

                // 标签左侧
                para[1] = token(para[1], 3);
                // 标签名
                para[2] = token(para[2], 4);
                // 右侧
                para[5] = token(para[5], 5);
                return para[1] + para[2] + para[3] + para[4] + para[5];
            })
            // 注释
            .replace(/(&lt;!--)([\S\s]+?)(--&gt;)/gi, function () {
                var para = arguments;
                var paraArr = para[2].split(/\r\n|\n/);
                para[2] = '<span class="html ' + tokens[11] + '">' + paraArr.join('</span>\r\n<span class="html ' + tokens[11] + '">') + '</span>';
                // para[2] = para[2].replace(/\r\n|\n/gi,)
                return token(para[1], 10) + para[2] + token(para[3], 12);
            });

            html = '<ol class="highlighter-ol"><li>' + html.replace(/\r\n|\n/gi, '</li><li>') + '</li></ol>';
            return html;
        }
    };
});