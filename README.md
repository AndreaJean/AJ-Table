# AJ-Table

基于js，jquery的table插件。

支持设置：是否使用表头，表头固定，固定首列，固定尾列，是否允许多选行，排序列。

列数据支持格式：序号，文字，图片，开关，按钮，自定义片断。

文字内容单元格支持功能：双击修改内容，同列合并相邻等值单元格。

## 调用

```JavaScript
var myTable = new AjTable(opt) //定义表格对象
```
```JavaScript
myTable.init(thData, tdData) //生成表格
```

## 参数

#### opt的默认设置

```JavaScript
{
    id: '', // 生成表格的父级DOM元素id
    fixTableWidth: true, // 表格总宽度，true为等于父级元素宽度，false为自适应
    noTh: false, // 不使用表头
    fixTh: true, // 表头固定
    fixFirstCol: false, // 固定首列
    fixLastCol: false, // 固定尾列
    multiSelect: false, // 可多选
    multiSelColWidth: 40, // 多选列宽
    sortKey: '', // 排序字段名称
    sortType: '', // 排序方式，asc为升序，desc为降序
    // 开关样式及效果
    switchSet: {
      padding: 4, // 滑块距边框距离
      speed: 300, // 滑块滑动速度
      easing: 'swing' // 滑块滑动方式
    },
    // 表头样式
    thStyle: {
      bgColor: '', // 背景色
      height: '', // 高度
      color: '', // 文字颜色
      fontSize: '', // 文字字号
      fontBold: '', // 文字粗细
      align: '', // 文字对齐方式
      borderColor: '' // 边框颜色
    },
    // 奇数行样式
    oddStyle: {
      bgColor: '',
      height: '',
      color: '',
      fontSize: '',
      fontBold: '',
      borderColor: ''
    },
    // 偶数行样式
    evenStyle: {
      bgColor: '',
      height: '',
      color: '',
      fontSize: '',
      fontBold: '',
      borderColor: ''
    },
    // 回调函数
    callback: {
      sort: null, // 点击排序
      multiSelect: null, // 多选行
      editOver: null, // 文字单元格双击修改内容后，输入框失去焦点事件
      btnClick: null, // 按钮点击事件
      switchOver: null, // 开关点击事件
      over: null // 表格加载完成
    }
  }
```
