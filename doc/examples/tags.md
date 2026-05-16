# 自定义标签示例

Almagest 主题提供了一系列自定义标签，用于在文章中插入特殊内容。

## 1. 提示框 (note)

在文章中添加醒目的提示框：

```html
{% note default %} 默认提示框 {% endnote %} {% note primary %} 主要提示框 {% endnote %} {% note
success %} 成功提示框 {% endnote %} {% note warning %} 警告提示框 {% endnote %} {% note danger %}
危险提示框 {% endnote %} {% note info %} 信息提示框 {% endnote %} {% note light %} 浅色提示框 {%
endnote %}
```

**效果：**

- default: 灰色边框
- primary: 蓝色边框
- success: 绿色边框
- warning: 黄色边框
- danger: 红色边框
- info: 浅蓝色边框
- light: 浅灰色边框

## 2. 时间线 (timeline)

创建时间线展示：

```html
{% timeline %}
<!-- 按时间顺序排列 -->
{% timenode 2024-01-01 %} 第一件大事的描述 {% endtimenode %} {% timenode 2024-06-01 %}
第二件大事的描述 {% endtimenode %} {% timenode 2024-12-01 %} 第三件大事的描述 {% endtimenode %} {%
endtimeline %}
```

## 3. 折叠块 (folding)

可折叠的内容区域：

```html
{% folding 点击查看更多 %} 这里是折叠的内容 可以放很多文字 包括代码块、图片等 {% endfolding %} {%
folding 折叠标题 %} 自定义折叠标题 {% endfolding %}
```

## 4. 链接卡片 (link)

显示链接预览卡片：

```html
{% link https://example.com 示例网站 一个描述 %}
```

## 5. 选项卡 (tabs)

创建选项卡切换：

```html
{% tabs Tab1 %}
<!-- tab -->
第一个标签页的内容
<!-- endtab -->
<!-- tab -->
第二个标签页的内容
<!-- endtab -->
<!-- tab -->
第三个标签页的内容
<!-- endtab -->
{% endtabs %}
```

### 带标题的选项卡

```html
{% tabs 选项卡, 2 %}
<!-- tab -->
第二个标签页会默认选中
<!-- endtab -->
... {% endtabs %}
```

## 6. 标签徽章 (label)

显示彩色标签：

```html
{% label 这是默认标签 %} {% label 主要标签 primary %} {% label 成功标签 success %} {% label 警告标签
warning %} {% label 危险标签 danger %} {% label 信息标签 info %}
```

## 7. 视频 (video)

嵌入视频：

```html
{% video https://example.com/video.mp4 %}
```

### 多个视频

```html
{% videos %} {% video https://example.com/video1.mp4 %} {% video https://example.com/video2.mp4 %}
{% endvideos %}
```

## 8. 音频 (audio)

嵌入音频：

```html
{% audio https://example.com/audio.mp3 %}
```

## 9. 图片画廊 (gallery)

创建图片画廊：

```html
{% gallery %} ![](https://example.com/image1.jpg) ![](https://example.com/image2.jpg)
![](https://example.com/image3.jpg) {% endgallery %}
```

## 10. 代码块增强

### 带标题的代码块

````markdown
```javascript title="example.js"
const hello = 'world';
console.log(hello);
```
````

### 带行号

````markdown
```javascript linenums
const x = 1;
const y = 2;
```
````

### 高亮特定行

````markdown
```javascript
// [!code highlight]
const x = 1; // 这行会高亮
const y = 2;
```
````

### 折叠代码块

超过 30 行的代码块会自动显示折叠按钮。

## 11. 脚注

在文章中添加脚注：

```markdown
这是一个有脚注的句子[^1]。

[^1]: 这是脚注的内容。
```

## 12. 表格

```markdown
| 表头1   | 表头2   | 表头3   |
| ------- | ------- | ------- |
| 单元格1 | 单元格2 | 单元格3 |
| 单元格4 | 单元格5 | 单元格6 |
```

## 13. 数学公式

### 行内公式

```markdown
这是行内公式 $E = mc^2$
```

### 块级公式

```markdown
$$
\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}
$$
```

## 14. Mermaid 图表

````markdown
```mermaid
graph TD
    A[开始] --> B{判断}
    B -->|是| C[执行1]
    B -->|否| D[执行2]
    C --> E[结束]
    D --> E
```
````

### 流程图

```mermaid
graph LR
    A[Input] --> B[Process]
    B --> C[Output]
```

### 时序图

```mermaid
sequenceDiagram
    Alice->>Bob: Hello Bob
    Bob->>Alice: Hi Alice
```

### 饼图

```mermaid
pie "Dogs" : 386 "Cats" : 85 "Rats" : 15
```

## 完整示例

````markdown
---
title: 自定义标签示例
date: 2024-01-01
---

# 常用标签示例

## 提示框

{% note success %}
这是一个成功提示！
{% endnote %}

## 时间线

{% timeline %}
{% timenode 2024-01 完成基础功能 %}
{% endtimenode %}
{% timenode 2024-06 完成高级功能 %}
{% endtimenode %}
{% endtimeline %}

## 代码块

```javascript title="hello.js"
// [!code highlight]
const greeting = 'Hello, World!';
console.log(greeting);
```
````

## 数学公式

$$f(x) = \sum_{i=0}^{n} \frac{a_i}{1+x}$$

```

```
