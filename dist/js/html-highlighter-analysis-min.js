var _typeof="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e};!function(e,t){"function"==typeof define&&define.amd?define(t):"object"===("undefined"==typeof exports?"undefined":_typeof(exports))?module.exports=t():e.highlighter=t()}(this,function(){return{htmlEncode:function(e){var t="";return 0===e.length?"":(t=e.replace(/&/g,"&amp;"),t=t.replace(/</g,"&lt;"),t=t.replace(/>/g,"&gt;"),t=t.replace(/\'/g,"&#39;"),t=t.replace(/\"/g,"&quot;"))},htmlDecode:function(e){var t="";return 0===e.length?"":(t=e.replace(/&amp;/g,"&"),t=t.replace(/&lt;/g,"<"),t=t.replace(/&gt;/g,">"),t=t.replace(/&#39;/g,"'"),t=t.replace(/&quot;/g,'"'))},lexer:function(e){function t(){var t=e.substr(u.lastIndex).search(/&lt;!doctype|&lt;!--|&lt;\/?/i);t!==-1&&(u.lastIndex=u.lastIndex+t)}function n(){var t=e.substr(u.lastIndex).search(/--&gt;/i);t!==-1&&(u.lastIndex=u.lastIndex+t)}function l(){var t=e.substr(u.lastIndex).search(/&gt;/i);t!==-1&&(u.lastIndex=u.lastIndex+t)}for(var u=/(&lt;!doctype)|(&lt;!--|--&gt;|&lt;\/?|\/?&gt;|=)|([\w][\w\-\:]*|[\u4E00-\u9FA5\-\:]+)|(&quot;[\s\S]*?&quot;|&#39;[\s\S]*?&#39;)|(\s+)/gi,i=[],s=function(e,u,i){return/^(--&gt;|\/?&gt;)$/i.test(u)?t():/^&lt;!--$/i.test(u)?n():/^(&lt;!doctype)$/i.test(u)&&l(),{type:e,value:u,index:i}},r=void 0;null!=(r=u.exec(e));)void 0!=r[1]?i.push(s("punct",r[1],r.index)):void 0!=r[2]?i.push(s("punct",r[2],r.index)):void 0!=r[3]?i.push(s("word",r[3],r.index)):void 0!=r[4]?i.push(s("literal",r[4],r.index)):void 0!=r[5]&&i.push(s("space",r[5],r.index));return i},preParser:function(e){function t(e,t,n,l){return{index:e,length:l||t.length,type:n,value:t||""}}function n(e,t){for(var n=null;l.length>0;){var u=l.shift();if(u.value===e&&u.type===t){n=u;break}}return n}for(var l=this.lexer(e),u=[],i=null,s=null;l.length>0;){var r=l.shift();if("punct"===r.type)if(/&lt;!doctype/i.test(r.value)){u.push(t(r.index,"&lt;!","punct"));var a=n("&gt;","punct");a?(u.push(t(a.index,a.value,"punct")),i=null):i="&lt;!"}else if(/&lt;!--/i.test(r.value)){var p=n("--&gt;","punct");p?(u.push(t(r.index,"","comment",p.index-r.index+p.value.length)),i=null):u.push(t(r.index,"","comment",-1))}else/&lt;\/?/i.test(r.value)?i||s||(u.push(t(r.index,r.value,"punct")),i=r.value,s=null):/\/?&gt;/i.test(r.value)?"&lt;"===i?(u.push(t(r.index,r.value,"punct")),i=null,s=null):"&lt;/"===i&&"&gt;"===r.value?(u.push(t(r.index,r.value,"punct")),i=null,s=null):"&lt;/"===i&&"/&gt;"===r.value&&(u.push(t(r.index+1,"&gt;","punct")),i=null,s=null):/=/i.test(r.value)&&i&&u.push(t(r.index,r.value.substr(0,1),"attr-eq"));else if("word"===r.type)i&&/^&lt;\/?$/i.test(u.slice(-1)[0].value)?(u.push(t(r.index,r.value,"tag")),s=r.value):i&&"space"===u.slice(-1)[0].type?u.push(t(r.index,r.value,"attr")):i&&"="===u.slice(-1)[0].value&&u.push(t(r.index,r.value,"value"));else if("literal"===r.type){if(i){var o=r.value.search(/^&#39;/i)!=-1?"&#39;".length:"&quot;".length;u.push(t(r.index,r.value.substr(0,o),"attr-punct"));var c=r.value.length-o-o;u.push(t(r.index+o,r.value.substr(o,c),"value")),u.push(t(r.index+o+c,r.value.substr(r.value.length-o,o),"attr-punct"))}}else"space"===r.type&&(i&&s?u.push(t(r.index,r.value,"space")):i&&!s&&(u.pop(),i=null))}return u},highlightCode:function(e){for(var t=this.preParser(e),n=function(n){var l=t[n];if("space"===l.type)return"continue";var u=e.substr(l.index,l.length).split(/\r\n|\n/).map(function(e){return e.replace(/^(\s*)(.*?)(\s*)$/,'$1<span class="html '+l.type+'">$2</span>$3')}).join("\n");e=e.substr(0,l.index).concat('<span class="html '+l.type+'">'+u+"</span>",e.substr(l.index+l.length))},l=t.length-1;l>=0;l--){n(l)}return e=e.split(/\r\n|\n/i).map(function(e){var t=e.match(/^\s*/i)[0].length;return'<li style="padding-left: '+.5*t+"em;text-indent: -"+.5*t+'em;">'+e+"</li>"}).join(""),e='<ol class="highlighter-ol">'+e+"</ol>"},highlight:function(e){return this.highlightCode(this.htmlEncode(e))}}});