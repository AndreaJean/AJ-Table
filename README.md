# AJ-Table

基于js，jquery的table插件。

支持设置：是否使用表头，表头固定，固定首列，固定尾列，是否允许多选行，排序列。

列数据支持格式：序号，文字，图片，开关，按钮，自定义片断。

文字内容单元格支持功能：双击修改内容，同列合并相邻等值单元格。

## 调用

```
var myTable = new AjTable(opt) //定义表格对象
```
```
myTable.init(thData, tdData) //生成表格
```

## 参数

#### opt的默认设置

```
{
    id: '',
    fixTableWidth: true, // 表格总宽度，自适应或者等于显示区域
    noTh: false, // 不使用表头
    fixTh: true, // 表头固定
    fixFirstCol: false, // 固定首列
    fixLastCol: false, // 固定尾列
    multiSelect: false, // 可多选
    multiSelColWidth: 40, // 多选列宽
    sortKey: '',
    sortType: '',
    switchSet: {
      padding: 4,
      speed: 300,
      easing: 'swing'
    },
    thStyle: {
      bgColor: '',
      height: '',
      color: '',
      fontSize: '',
      fontBold: '',
      align: '',
      borderColor: ''
    },
    oddStyle: {
      bgColor: '',
      height: '',
      color: '',
      fontSize: '',
      fontBold: '',
      borderColor: ''
    },
    evenStyle: {
      bgColor: '',
      height: '',
      color: '',
      fontSize: '',
      fontBold: '',
      borderColor: ''
    },
    callback: {
      sort: null,
      multiSelect: null,
      editOver: null,
      btnClick: null,
      switchOver: null,
      over: null
    }
  }
```
