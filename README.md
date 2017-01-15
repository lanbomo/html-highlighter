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