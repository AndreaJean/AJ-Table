# AJ-Table

基于js，jquery的table插件。

支持功能：

  1.表头：是否使用表头，固定表头，二级表头；

  2.列：固定首列，固定尾列，排序，合并同值单元格；

  3.行：多选，禁止某行选中，添加行，删除行；
  
  4.单元格：文字双击修改

  5.可调用方法

列数据格式类型：序号，文字，输入框，下拉框，图片，开关，按钮，自定义HTML片断，一级表头。


## 引用
```html
<link rel="stylesheet" type="text/css" href="css/table.css">
<script type="text/javascript" src="js/jquery.min.js"></script>
<script type="text/javascript" src="js/tree.js"></script>
<script type="text/javascript" src="js/select.js"></script>
<script type="text/javascript" src="js/table.js"></script>
```
- 无下拉框列时可不引用tree.js、select.js
- 下拉框选项为列表形式时可不引用tree.js

## 调用

```JavaScript
var myTable = new AjTable(opt) //创建对象
myTable.init(thData, tdData) //初始化
```

## opt的默认设置

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
    selectOver: null, // 下拉选值改变事件
    setData: null, // 表格赋值后
    deleteOver: null, // 删除某一行数据后
    addOver: null, // 添加一行数据后
    over: null // 表格加载完成
  }
}
```

## 列设置thData

结构为对象数组，一个对象为一列，示例：
```JavaScript
var thData = [
  { key: 'num', label: '序号', type: 'no', width: '100px', color: '', align: 'center' },
  { key: 'name', label: '姓名', type: 'text', width: '100px', color: 'red', align: 'left', sort: true, isBreak: false, preImg: '' },
  { key: 'age', label: '年龄', type: 'text', width: '100px', color: '', align: 'left', isEdit: true, sort: true },
  { key: 'nationality', label: '国籍', type: 'select', options: opts, selectWidth: '100px', preText: '选择', defaultVal: '', isMultiple: false, showClear: true, showTree: false, placeholder: '国籍' },
  { key: 'marriage', label: '婚否', type: 'switch', width: '100px', align: 'center', trueVal: '1', trueLabel: '已婚', falseVal: '2', falseLabel: '未婚' },
  { key: 'sex', label: '性别性别', type: 'text', width: '', color: '', align: 'center', mergeCell: true },
  { key: 'photo', label: '照片', type: 'img', width: '', align: 'center', imgW: '', imgH: '80px' },
  { key: 'count', label: '统计', type: 'input', inputType: 'text', inputWidth: '60px', defaultVal: '0', preText: '共', nextText: '条', placeholder: '请输入中文' },
  { label: '标签', type: 'html', width: '220px', align: 'left', htmlCode: '<h2>自定义HTML片断</h2>' },
  { label: '操作', type: 'button', width: '300px', align: 'center', btns: testBtn },
  {
    key: 'address',
    label: '住址',
    type: 'merge',
    width: '',
    color: '',
    align: 'center',
    children: [
      { key: 'province', label: '省', type: 'text', width: '', color: '', align: 'center' },
      { key: 'city', label: '市', type: 'text', width: '', color: '', align: 'center' },
      { key: 'area', label: '区', type: 'text', width: '', color: '', align: 'center' },
      { key: 'detail', label: '详细', type: 'text', width: '', color: '', align: 'center' }
    ]
  }
]
```

#### 所有列通用属性

- key：{String}，该列唯一标识，该列td的col-key属性值，会加入该列内容的class中
- label：{String}，表头文字
- type：{String}，内容数据格式，'no'序号，'text'文字，'input'输入框，'select'下拉框，'img'图片，'switch'开关，'button'按钮，'html'自定义HTML片断，'merge'多级表头的一级表头
- width：{String}，列宽，可输入"70px"或"20%"（**一级表头无效，表头宽度由子列总宽度决定**）
- align：{String}，内容对齐方式（**不包含表头文字的对齐方式**）

#### 一级表头属性 (type:'merge')

- children：{Array}，对象数组，一级表头的子列，子列数据格式与普通列格式无异

#### 文字列属性 (type:'text')

- color：{String}，设置该列内容文字颜色
- sort：{Boolean}，值为true设置该列可排序
- isBreak：{Boolean}，值为true设置该列文字内容自动折行
- mergeCell：{Boolean}，值为true设置该列合并相邻等值单元格
- isEdit：{Boolean}，值为true设置该列文字内容可双击修改（**仅当sort=false，mergeCell=false时有效**）
- preIcon, preImg：{String}，置于文字前的图标、图片

#### 输入框列属性 (type:'input')

```JavaScript
  { key: 'count', label: '统计', type: 'input', inputType: 'text', inputWidth: '60px', defaultVal: '0', preText: '共', nextText: '条', placeholder: '请输入中文' },
```
- inputType: {String}，输入值类型，可选类型同HTML标签input的type（可为空）
- inputWidth: {String}，输入框宽度（可为空）
- defaultVal: {String}，默认值（可为空）
- preText: {String}，前置文字，放置于输入框前的文字（可为空）
- nextText: {String}，后置文字，放置于输入框后的文字（可为空）
- placeholder: {String}，输入框框内的提示文字（可为空）

#### 下拉框列属性 (type:'select')

```JavaScript
  { key: 'nationality', label: '国籍', type: 'select', options: opts, selectWidth: '100px', preText: '选择', defaultVal: '', isMultiple: false, showClear: true, showTree: false, placeholder: '国籍' },
```
- inputWidth: {String}，下拉框宽度（可为空）
- preText: {String}，前置文字，放置于下拉框前的文字（可为空）
- defaultVal: {String}，默认值（可为空）
- placeholder: {String}，下拉框内的提示文字（可为空）
- isMultiple: {Boolean}, 是否多选，默认为false（可为空）
- showTree: {Boolean}, 选项是否为树结构，默认为false（可为空）
- showClear: {Boolean}, 是否显示清空按钮，默认为false（可为空）
- showSearch: {Boolean}, 是否开启选项过滤功能，默认为false（可为空）


#### 图片列属性 (type:'img')

- imgW，imgH：{String}，图片宽、高，格式为"数值+单位"，如"20px"

#### 开关列属性 (type:'switch')

- trueVal：{String}，开关的开启值
- trueLabel：{String}，开启文字
- falseVal：{String}，开关的关闭值
- falseLabel：{String}，关闭文字

#### 按钮列属性 (type:'button')

- btns：{Array}，按钮信息，对象数组，示例：

```JavaScript
var testBtn = [
  { key: 'donwload', type: 'link', label: '下载', iconClass: 'iconfont icon-download' },
  { key: 'edit', label: '编辑', iconClass: 'iconfont icon-xiugai1' },
  { key: 'delete', label: '删除', iconClass: 'iconfont icon-shanchu' }
]
```
- key: {String}，按钮唯一标识（不可为空）
- type: {String}，按钮类型（可为空），默认为 'btn'；设置为'link'，按钮显示为链接样式
- label: {String}，按钮文字（不可为空）
- iconClass: {String}，按钮文字前的icon的类名（可为空）


#### 按钮列属性 (type:'html')

- htmlCode：{String}，HTML片断

#### 按钮列属性 (type:'merge')

- children：{Array}，多级表头时存放二级表头


## 表格数据tdData

结构为对象数组，一个对象为表格中一行数据，示例：
```JavaScript
var tdData = [
  {name: '张三', age: '14', sex: '女', marriage: '1', forbidBtn: ['donwload']},
  {name: '李四', age: '',  sex: '男', marriage: '2', forbidSel : true},
]
```
- forbidSel：{Boolean}，值为true时禁止选中该行
- forbidBtn：{Array}，该行禁用的按钮的key数组

## 方法

| 方法名 | 说明 | 参数 | 返回值 |
| --- | --- | --- | --- |
|$_reset|重新调整列宽|---|---|
|$_setData|加载表格数据|data: {Array}，参见tdData|---|
|$_getData|获取当前表格数据(含输入框中值和下拉框选中值)|---|data: {Array}，参见tdData|
|$_reviewMultiSelect|设置行选中|indexList：{Array}，选中行的index（从0记数）数组|
|$_addBlankRow|显示/隐藏空白行|flag：{Boolean}，true显示，false隐藏；rowIndex：{Number}，目标行x（从0记数）；content：{String}，空白行内显示的内容，html片断|data: {Object}，成功或失败信息对象，成功信息包含插入html片断的div的id|
|$_addRow|添加行|dataObj：{Object}，格式参见tdData元素；rowIndex：{Number}，插入位置index（从0记数）|---|
|$_deleteRow|删除行|rowIndex：{Number}，目标行index（从0记数）|data: {Object}，成功或失败信息对象|
