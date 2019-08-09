let testBtn = [
  {key: 'donwload', label: '下载', iconClass: 'iconfont icon-download'},
  {key: 'edit', label: '编辑', iconClass: 'iconfont icon-xiugai1'},
  {key: 'delete', label: '删除', iconClass: 'iconfont icon-shanchu'}
]
let thData = [
  {key: 'num', label: '序号', type: 'no', width: '20%', color: '', align: 'center'},
  {key: 'name', label: '姓名', type: 'text', width: '10%', color: 'red', align: 'left', sort: true, isBreak: false, preImg: 'https://wwc.alicdn.com/avatar/getAvatar.do?userNick=&width=50&height=50&type=sns&_input_charset=UTF-8'},
  {key: 'age', label: '年龄', type: 'text', width: '20%', color: '', align: 'left', isEdit: true, sort: true},
  {key: 'nationality', label: '国籍', type: 'text', width: '20%', color: '', align: 'left', preIcon: 'icon-new-xinwen-copy'},
  {key: 'marriage', label: '婚否', type: 'switch', width: '10%', align: 'center', trueVal: '1', trueLabel: '已婚', falseVal: '2', falseLabel: '未婚'},
  {key: 'sex', label: '性别性别', type: 'text', width: '10%', color: '', align: 'center', mergeCell: true},
  {key: 'photo', label: '照片', type: 'img', width: '10%', align: 'center', imgW: '', imgH: '80px'},
  {label: '标签', type: 'html', width: '', align: 'left', htmlCode: '<h2>自定义HTML片断</h2>'},
  {label: '操作', type: 'button', width: '30%', align: 'center', btns: testBtn}
]
let tdData = [
  {name: '唐僧', age: '14', nationality: '大唐', sex: '女', marriage: '1', photo: 'https://pic.xiami.net/images/artistlogo/60/13751627012360.jpg?x-oss-process=image/resize,s_370,m_fill/quality,q_80'},
  {name: '孙悟空孙悟空孙悟空孙悟空', age: '', nationality: '花果山', sex: '男', marriage: '2', photo: 'https://pic.xiami.net/images/artistpic/24/23424/1247039605_405E.jpg?x-oss-process=image/resize,s_370,m_fill/quality,q_80'},
  {name: '观音', age: '54', nationality: '西天', sex: '女', marriage: '1', photo: 'https://pic.xiami.net/images/artistpic/24/23424/1247039645_Qy82.jpg?x-oss-process=image/resize,s_370,m_fill/quality,q_80'},
  {name: '钢铁侠', age: '51', nationality: '美国', sex: '女', marriage: '2', photo: 'https://pic.xiami.net/images/artistlogo/60/13751627012360.jpg?x-oss-process=image/resize,s_370,m_fill/quality,q_80'},
  {name: '超人', age: '42', nationality: '美国', sex: '男', marriage: '2', photo: 'https://pic.xiami.net/images/artistpic/24/23424/1247039605_405E.jpg?x-oss-process=image/resize,s_370,m_fill/quality,q_80'},
  {name: '成吉思汗', age: '95', nationality: '蒙古', sex: '男', marriage: '1', photo: 'https://pic.xiami.net/images/artistpic/24/23424/1247039645_Qy82.jpg?x-oss-process=image/resize,s_370,m_fill/quality,q_80'},
  {name: '张三', age: '', nationality: '', sex: '男', marriage: '1', photo: 'https://pic.xiami.net/images/artistlogo/60/13751627012360.jpg?x-oss-process=image/resize,s_370,m_fill/quality,q_80'},
  {name: '李四', age: '', nationality: '', sex: '男', marriage: '1', photo: 'https://pic.xiami.net/images/artistpic/24/23424/1247039605_405E.jpg?x-oss-process=image/resize,s_370,m_fill/quality,q_80'},
  {name: '王五', age: '', nationality: '', sex: '女', marriage: '2', photo: 'https://pic.xiami.net/images/artistpic/24/23424/1247039645_Qy82.jpg?x-oss-process=image/resize,s_370,m_fill/quality,q_80'}
]
let opt = {
  id: 'tableDemo',
  fixTableWidth: true,
  noTh: false,
  fixTh: true,
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
    btnClick: function (data) {
      console.log(data)
    },
    switchOver: function (data) {
      console.log(data)
    },
    over: function (data) {
      console.log('表格加载完毕')
    }
  }

}
