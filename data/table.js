// 双表头示例
let thDataDouble = [
  { key: 'num', label: '序号', type: 'no', color: '', align: 'center' },
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
  },
  { key: 'name', label: '姓名', type: 'text', color: 'red', align: 'left', sort: true, isBreak: true, preImg: 'https://wwc.alicdn.com/avatar/getAvatar.do?userNick=&width=50&height=50&type=sns&_input_charset=UTF-8' },
  { key: 'age', label: '年龄', type: 'text', color: '', align: 'left', isEdit: true, sort: true },
  { key: 'nationality', label: '国籍', type: 'text', color: '', align: 'left', preIcon: 'icon-new-xinwen-copy' },
  { key: 'marriage', label: '婚否', type: 'switch', align: 'center', trueVal: '1', trueLabel: '已婚', falseVal: '2', falseLabel: '未婚' },
  { key: 'sex', label: '性别', type: 'text', width: '', color: '', align: 'center', mergeCell: true }
]
let tdDataDouble = [
  { forbidSel: true, name: '唐僧', age: '14', nationality: '大唐', sex: '女', marriage: '1' },
  { name: '孙悟空孙悟空孙悟空孙悟空', age: '', nationality: '花果山', sex: '男', marriage: '2' },
  { forbidSel: true, name: '观音', age: '54', nationality: '西天', sex: '女', marriage: '1', province: '北京市', city: '北京市', area: '朝阳区' },
  { name: '钢铁侠', age: '51', nationality: '美国', sex: '女', marriage: '2' },
  { name: '超人', age: '42', nationality: '美国', sex: '男', marriage: '2' },
  { name: '成吉思汗', age: '95', nationality: '蒙古', sex: '男', marriage: '1' },
  { forbidSel: true, name: '张三', age: '', nationality: '', sex: '男', marriage: '1' },
  { name: '李四', age: '', nationality: '', sex: '男', marriage: '1' },
  { name: '王五', age: '', nationality: '', sex: '女', marriage: '2' }
]

// 普通示例
const testBtn = [
  { key: 'donwload', type: 'link', label: '下载', iconClass: 'iconfont icon-download' },
  { key: 'edit', label: '编辑', iconClass: 'iconfont icon-xiugai1' },
  { key: 'delete', label: '删除', iconClass: 'iconfont icon-shanchu' }
]
const opts = [
  {label: '中国', value: '中国', selected: true},
  {label: '美国', value: '美国', selected: false, disable: true},
  {label: '阿根廷', value: '阿根廷', selected: false},
  {label: '英国', value: '英国', selected: false, disable: true},
  {label: '意大利', value: '意大利', selected: false},
  {label: '法国', value: '法国', selected: false},
  {label: '西班牙', value: '西班牙', selected: false},
  {label: '巴西', value: '巴西', selected: false},
  {label: '葡萄牙', value: '葡萄牙', selected: false},
  {label: '巴西', value: '巴西', selected: false},
  {label: '德国', value: '德国', selected: false}
]
const trees = [
  {
    id: '010',
    label: '北京',
    level: 1,
    children: [
      {
        id: '010-CY',
        label: '朝阳区',
        level: 2,
        children: [
          { id: '010-CY-AYC', label: '奥运村街道', level: 3, children: [] },
          { id: '010-CY-YYC', label: '亚运村街道', level: 3, children: [] }
        ]
      },
      {
        id: '010-CP',
        label: '昌平区',
        level: 2,
        children: [
          {
            id: '010-CP-TTYB',
            label: '天通苑北街道',
            level: 3,
            children: []
          }
        ]
      }
    ]
  },
  { id: '020', label: '上海', level: 1, children: [] },
  { id: '0371', label: '郑州', level: 1, children: [] },
  { id: '0391', label: '焦作', level: 1, children: [] }
]

let thData = [
  { key: 'num', label: '序号', type: 'no', width: '100px', color: '', align: 'center' },
  { key: 'name', label: '姓名', type: 'text', width: '100px', color: 'red', align: 'left', sort: true, isBreak: false, preImg: 'https://wwc.alicdn.com/avatar/getAvatar.do?userNick=&width=50&height=50&type=sns&_input_charset=UTF-8' },
  { key: 'age', label: '年龄', type: 'text', width: '100px', color: '', align: 'left', preIcon: 'icon-new-xinwen-copy', isEdit: true, sort: true },
  { key: 'nationality', label: '国籍', type: 'select', options: opts, selectWidth: '100px', preText: '选择', defaultVal: '', isMultiple: false, showClear: true, showTree: false, placeholder: '国籍' },
  // { key: 'region', label: '区域', type: 'select', options: trees, selectWidth: '100px', preText: '选择', defaultVal: '', isMultiple: false, showClear: true, showTree: true, placeholder: '区域' },
  { key: 'marriage', label: '婚否', type: 'switch', width: '100px', align: 'center', trueVal: '1', trueLabel: '已婚', falseVal: '2', falseLabel: '未婚' },
  { key: 'sex', label: '性别性别', type: 'text', width: '', color: '', align: 'center', mergeCell: true },
  { key: 'photo', isShow: false, label: '照片', type: 'img', width: '', align: 'center', imgW: '', imgH: '80px' },
  { key: 'count', label: '统计', type: 'input', inputType: 'text', inputWidth: '60px', defaultVal: '0', preText: '共', nextText: '条', placeholder: '请输入中文' },
  // { label: '标签', type: 'html', width: '220px', align: 'left', htmlCode: '<h2>自定义HTML片断</h2>' },
  { label: '操作', type: 'button', width: '300px', align: 'center', btns: testBtn }
]
let tdData = [
  { forbidSel: true, name: '刘翔', age: '', nationality: '中国', sex: '女', count: '3', marriage: '1', forbidBtn: ['donwload', 'edit'], photo: 'https://pic.xiami.net/images/artistlogo/60/13751627012360.jpg?x-oss-process=image/resize,s_370,m_fill/quality,q_80' },
  { name: '李娜李娜李娜李娜李娜李娜李娜', age: '', nationality: '中国', sex: '男', count: '35', marriage: '2', photo: 'https://pic.xiami.net/images/artistpic/24/23424/1247039605_405E.jpg?x-oss-process=image/resize,s_370,m_fill/quality,q_80' },
  { forbidSel: true, name: '卡卡', age: '39', nationality: '巴西', sex: '男', marriage: '1', photo: 'https://pic.xiami.net/images/artistlogo/60/13751627012360.jpg?x-oss-process=image/resize,s_370,m_fill/quality,q_80' },
  { forbidSel: true, name: '贝克汉姆', age: '54', nationality: '英国', sex: '女', count: '22', marriage: '1', photo: 'https://pic.xiami.net/images/artistpic/24/23424/1247039645_Qy82.jpg?x-oss-process=image/resize,s_370,m_fill/quality,q_80' },
  { name: '厄齐尔', age: '51', nationality: '德国', sex: '女', count: '14', marriage: '2', photo: 'https://pic.xiami.net/images/artistlogo/60/13751627012360.jpg?x-oss-process=image/resize,s_370,m_fill/quality,q_80' },
  { name: '本泽马', age: '42', nationality: '法国', sex: '男', count: '17', marriage: '2', photo: 'https://pic.xiami.net/images/artistpic/24/23424/1247039605_405E.jpg?x-oss-process=image/resize,s_370,m_fill/quality,q_80' },
  { name: '雷东多', age: '95', nationality: '', sex: '男', marriage: '1', photo: 'https://pic.xiami.net/images/artistpic/24/23424/1247039645_Qy82.jpg?x-oss-process=image/resize,s_370,m_fill/quality,q_80' },
  { name: '因扎吉', age: '', nationality: '意大利', sex: '男', marriage: '1', photo: 'https://pic.xiami.net/images/artistpic/24/23424/1247039605_405E.jpg?x-oss-process=image/resize,s_370,m_fill/quality,q_80' },
  { name: '劳尔', age: '', nationality: '西班牙', sex: '女', marriage: '2', forbidBtn: ['donwload'], photo: 'https://pic.xiami.net/images/artistpic/24/23424/1247039645_Qy82.jpg?x-oss-process=image/resize,s_370,m_fill/quality,q_80' }
]

// 可输入示例
let thData1 = [
  {key: 'num', label: '序号', type: 'no', width: '', color: '', align: 'center'},
  {key: 'name', label: 'aaa', type: 'text', width: '', color: '', align: 'center'},
  {label: 'aaa', type: 'html', width: '', align: 'left', htmlCode: '<input type=\'text\' />'},
  {label: 'bbb', type: 'html', width: '', align: 'left', htmlCode: '<input type=\'text\' />'},
  {label: 'ccc', type: 'html', width: '', align: 'left', htmlCode: '<input type=\'text\' />'},
  {label: '<span class="ddd">+</span>', type: 'button', width: '', align: 'left', btns: [{key: 'delete', label: '删除', iconClass: 'iconfont icon-shanchu'}]}
]
let tdData1 = [{name: '唐僧'}, {name: '观音'}, {name: '超人'}]

let innerTable = []
let opt = {
  id: 'tableDemo',
  fixTableWidth: true,
  noTh: false,
  fixTh: true,
  heightAuto: true, // 表格高度自适应
  fixFirstCol: false,
  fixLastCol: false,
  multiSelect: true,
  multiSelColWidth: 40,
  sortKey: 'name',
  sortType: 'asc',
  noDataText: '好像没有数据呢~~',
  switchSet: {
    padding: 4,
    speed: 300,
    easing: 'swing'
  },
  thStyle: {
    bgColor: '',
    height: '',
    color: '',
    fontSize: '14px',
    fontBold: '',
    align: 'center',
    borderColor: ''
  },
  oddStyle: {
    bgColor: '',
    height: '50px',
    color: 'blue',
    fontSize: '',
    fontBold: '',
    borderColor: ''
  },
  evenStyle: {
    bgColor: '',
    height: '50px',
    color: '',
    fontSize: '',
    fontBold: '',
    borderColor: ''
  },
  callback: {
    sort: function (data) {
      console.log(data)
    },
    multiSelect: function (data) {
      console.log(data)
    },
    editOver: function (data) {
      console.log(data)
    },
    btnClick: function (data, tableObj, btn) {
      console.log(data)
      if (data.key === 'edit') {
        if (btn.hasClass('open')) {
          tableObj.$_addBlankRow(false, data.rowIndex)
          btn.removeClass('open')
          innerTable[data.rowIndex] = null
        } else {
          let html = '<div id="aaa' + data.rowIndex + '" style="position:relative;border:2px solid #333;width:98%;height:200px;margin:15px auto;"></div>'
          tableObj.$_addBlankRow(true, data.rowIndex, html)
          btn.addClass('open')
          let set = {
            id: 'aaa' + data.rowIndex,
            fixTableWidth: true,
            noTh: false,
            fixTh: true,
            fixFirstCol: false,
            fixLastCol: false,
            multiSelect: true
          }
          innerTable[data.rowIndex] = new AjTable(set)
          innerTable[data.rowIndex].init(thData, tdData)
        }
      }
      if (data.key === 'delete') {
        tableObj.$_deleteRow(data.rowIndex)
      }
    },
    switchOver: function (data) {
      console.log(data)
    },
    selectOver: function (data, tableObj, selectObj) {
      console.log('selectOver', data)
    },
    over: function (data) {
      console.log('表格加载完毕')
    },
    deleteOver: function (data) {
      console.log('deleteOver')
      // myTable.init(thData, tdData)
    }
  }

}
