# html-highlighter
HTML code highlighter develop with js 基于js的HTML在线代码高亮

如果你喜欢或是对你有帮助的话，给我打一颗星吧。

### introduce
The demo click [here](https://lanbomo.github.io/html-highlighter/examples/index.html). It has two themes, you can extend it with the `html-highlighter-analysis.less`.

It has two way to implement this, one way is use regular expression only, but it's have some problem. See the `html-highlighter-regex.js`

Another way is use the regular expression and very simple lexical analysis, it's better than the fisrt way. See the `html-highlighter-analysis.js`

在线演示请点击[这里](https://lanbomo.github.io/html-highlighter/examples/index.html)。目前可选两个主题配色，你可以根据自己的需要通过修改`html-highlighter-analysis.less`文件扩展主题配色。

我使用了两种方法来实现HTML代码的高亮，第一种是纯粹使用正则表达式匹配，这种方式实现的结果还存在一些问题，诸如属性值字面量内如果出现结束标签，则会有问题，后面再做改善。详细请看`html-highlighter-regex.js`

第二种方法是使用正则表达式和简单的词法分析，这种方式比第一种好很多，解决了第一种情况的不足，而且容错能力也大大增强。详细见`html-highlighter-analysis.js`。

在实现的过程中，我并没有按照传统编译原理的方法，进行词法分析、语法分析，然后解析成一个节点树，因为我只需要做高亮，所以简易的词法分析之后，我就生成了一个用于高亮着色的列表，列表中每个元素就是要着色的部分，包含了该部分在整个字符串文本中的位置和长度、着色类型。

### usage

#### step1

To link the `dist/html-highlighter-analysis-min.css` and `dist/html-highlighter-analysis-min.js` in your code. you can use `require` to load them with `webpack` or `require.js`

实现加载`dist/html-highlighter-analysis-min.css`和`dist/html-highlighter-analysis-min.js`文件，你也可以在`webpack`或者是`require.js`中用`require`方法引用他们。

#### step2

Use the `highlighter.highlight` to convert the HTML string to a HTML code with the color. 

You can use the `highlighter-theme-dark` and `highlighter-theme-light` theme.

使用`highlighter.highlight`方法来转换HTML字符串为新的HTML代码。有`highlighter-theme-dark`和`highlighter-theme-light`两种配色主题可选。

```html
<pre id="code" class="highlighter highlighter-theme-dark"></pre>
```

```javascript
code.innerHTML = highlighter.highlight('<!DOCTYPE html><html lang="zh-cn"><head><title>I am a title</title></head><body>hello</body></html>')
```

### develop

#### step1

Install the npm and nodejs, and clone this repository. And use `npm install` command to install the dependencies.

首先安装npm和nodejs，然后克隆本仓库，接着使用`npm install`命令安装依赖。

#### step2

Use `npm run dev` command to develop with a server and watcher by gulp. And use the `playground/index.html` to develop with display.

使用`npm run dev`命令开启开发服务器，并使用gulp监听文件改动自动刷新。建议使用`playground/index.html`文件作开发效果查看。

#### step3

Use `npm run build` command to build the `ES6` and `LESS` file and minifiy them to `dist` folder.

使用`npm run build`命令构建生产版本，该命令将编译ES6文件和LESS文件并且压缩他们至`dist`目录。



Made by lanbomo