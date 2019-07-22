# AJ-Table

基于js，jquery的table插件。

支持设置：是否使用表头，表头固定，固定首列，固定尾列，是否允许多选行，排序列。

列数据支持格式：序号，文字，图片，开关，按钮，自定义片断。

文字内容单元格支持功能：双击修改内容，同列合并相邻等值单元格。

## 引用
```html
<link rel="stylesheet" type="text/css" href="css/table.css">
<script type="text/javascript" src="js/jquery.min.js"></script>
<script type="text/javascript" src="js/table.js"></script>
```

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
    noDataText: '暂无数据', // 无数据时表身区域的显示内容，支持自定义html片断
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

#### 列设置thData

结构为对象数组，示例：
```JavaScript
var thData = [
  {key: 'no', label: '序号', type: 'no', width: '10%', color: '', align: 'center'},
  {key: 'name', label: '姓名', type: 'text', width: '10%', color: 'red', align: 'left', sort: true, break: true},
]
```
- key：{String}，该列唯一标识，该列td的col-key属性值，会加入该列内容的class中
- label：{String}，表头文字
- type：{String}，内容数据格式，'no'序号，'text'文字，'img'图片，'switch'开关，'button'按钮，'html'自定义HTML片断
- width：{String}，列宽，可输入"70px"或"20%"
- align：{String}，内容对齐方式（不包含表头文字的对齐方式）
- color：{String}，设置该列内容文字颜色（仅当type为'text'时有效）
- sort：{Boolean}，值为true设置该列可排序（仅当type为'text'时有效）
- isBreak：{Boolean}，值为true设置该列文字内容自动折行
- mergeCell：{Boolean}，值为true设置该列合并相邻等值单元格
- isEdit{Boolean}，值为true设置该列文字内容可双击修改（仅当type='text'，sort=false，mergeCell=false时有效）
- imgW，imgH：{String}，图片宽、高，格式为"数值+单位"，如"20px"（仅当type为'img'时有效）
- trueVal, trueLabel, falseVal, falseLabel：{String}，开关的开启值、开启文字、关闭值、关闭文字（仅当type为'switch'时有效）
- btns：{Array}，按钮设置（仅当type为'button'时有效），示例"[{key: '按钮唯一标识（不可为空）', label: '按钮文字', iconClass: '按钮文字前的icon的类名（可为空）'}]"
- htmlCode：{String}，HTML片断（仅当type为'html'时有效）

#### 表格数据tdData

结构为对象数组，示例：
```JavaScript
var tdData = [
  {name: '张三', age: '14', sex: '女', marriage: '1'},
  {name: '李四', age: '',  sex: '男', marriage: '2'},
]
```
