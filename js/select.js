let AjSelect = function (options) {
  let newObj = {
    option: {}, // 插件配置项
    dataArr: [], // 下拉框的选项数据
    selectData: [], // 选中项的完整数据
    selectVal: [], // 选中项的值
    selectText: '', // 选中项在输入框中显示的文字
    searchkey: '', // 搜索关键字
    box: null, // 生成插件的容器div
    bodyStyle: {}, // 选项面板的自定义样式
    scrollBarWidth: 0, // 滚动条宽度
    treeObj: {}, // 存放树对象
    // 初始化
    init (dataArr) {
      this.option = this.utils.mergeObjectDeep(this.Opt, options)
      this.dataArr = this.utils.deepCopy(dataArr)
      // console.log('下拉菜单数据', this.option, this.dataArr)
      this.box = $('#' + this.option.id)
      this.box.html('')
      this.initSelect()
      this.createHtml()
      if (this.option.callback.dataOver) {
        this.option.callback.dataOver(this.utils.deepCopy(this.selectData), this)
      }
    },
    // 初始化时的选中数据整理
    initSelect () {
      this.selectData = []
      this.selectVal = []
      let arr = []
      this.dataArr.forEach(item => {
        if (item.selected) {
          this.selectData.push(item)
          this.selectVal.push(item.value)
          arr.push(item.label)
        }
      })
      this.selectText = arr.join('，')
    },
    // 生成html
    createHtml () {
      let html = this.createHeader()
      this.box.append(html)
      this.content = this.box.find('.vp-select-content')
      this.container = this.box.find('.vp-select-container')
      this.header = this.box.find('.vp-select-header')
      this.input = this.box.find('.vp-select-input')
      this.arrow = this.box.find('.vp-select-arrow')
      this.clearBtn = this.box.find('.select-clear-icon')
      this.errorMsg = this.box.find('.vp-error-msg')
      this.getBodyStyle()
      this.bindHeaderEvent()
    },
    // 生成header
    createHeader () {
      let opt = this.option.inputStyle
      let inputStyle = 'width:' + opt.width + ';' +
                       'height:' + opt.height + ';' +
                       'background-color:' + opt.bgColor + ';' +
                       'color:' + opt.color + ';' +
                       'font-size:' + opt.fontSize + ';' +
                       'border-radius:' + opt.borderRadius + ';' +
                       'border-width:' + opt.borderwith + ';' +
                       'border-color:' + opt.borderColor + ';'
      let html = '<div class="vp-select-content">' +
                  (this.option.preText !== '' ? ('<label style="' + this.option.preStyle + '">' + this.option.preText + '</label>') : '') +
                  '<div class="vp-select-container">' +
                    '<div class="vp-select-header" style="' + inputStyle + '">' +
                      '<input value="' + this.selectText + '" title="已选：' + this.selectText + '" placeholder="' + this.option.placeholder + '" autocomplete="off" readonly="readonly" class="vp-select-input" style="' + this.inputInnerStyle + '" />' +
                      '<span class="vp-select-arrow">' +
                        '<i class="vp-select-icon" style="border-color:' + opt.arrowColor + '"></i> ' +
                      '</span>' +
                      '<span class="select-clear-icon"><i class=\'vp-select-clear-icon\' >x</i></span>' +
                    '</div>' +
                  '</div>' +
                  '<span class=\'vp-error-msg\'></span>' +
                '</div>'
      return html
    },
    // 获取选项面板样式
    getBodyStyle () {
      let opt = this.option.panelStyle
      let panelStyle = 'background-color:' + opt.bgColor + ';' +
                       'border-radius:' + opt.borderRadius + ';' +
                       'border-width:' + opt.borderwith + ';' +
                       'border-color:' + opt.borderColor + ';' +
                       'z-index:99999;'
      let normalStyle = 'color:' + opt.color + ';' +
                        'font-size:' + opt.fontSize + ';' +
                        'height:' + opt.lineHeight + ';' +
                        'line-height:' + opt.lineHeight + ';'
      let selectedStyle = 'color:' + opt.colorSel + ';' +
                          'font-size:' + opt.fontSizeSel + ';' +
                          'background-color:' + opt.bgColorSel + ';' +
                          'height:' + opt.lineHeight + ';' +
                          'line-height:' + opt.lineHeight + ';'
      this.bodyStyle = {
        panel: panelStyle,
        normal: normalStyle,
        selected: selectedStyle
      }
    },
    // 绑定header事件
    bindHeaderEvent () {
      if (this.option.showClear) {
        this.onOverHeader()
        this.onClickClear()
      }
      this.onClickHeader()
    },
    // Header鼠标滑入/滑出事件
    onOverHeader () {
      let vm = this
      this.header.unbind('mouseover').bind('mouseover ', function (e) {
        if (vm.input.val()) {
          vm.arrow.css('display', 'none')
          vm.clearBtn.css('display', 'inline-block')
        }
      })
      this.header.unbind('mouseout').bind('mouseout ', function (e) {
        if (vm.input.val()) {
          vm.arrow.css('display', 'inline-block')
          vm.clearBtn.css('display', 'none')
        }
      })
    },
    // 点击清空按钮
    onClickClear () {
      let vm = this
      this.clearBtn.unbind('click').bind('click ', function (e) {
        e.stopPropagation()
        vm.showBody(false)
        vm.onClear()
      })
    },
    // 恢复默认值 or 清空
    onClear () {
      this.box.html('')
      this.initSelect()
      this.createHtml()
      if (this.option.callback.clearOver) {
        this.option.callback.clearOver(this.utils.deepCopy(this.selectData), this)
      }
    },
    // Header点击事件
    onClickHeader () {
      let vm = this
      this.header.unbind('click').bind('click ', function (e) {
        e.stopPropagation()
        if (!vm.header.hasClass('open')) {
          $('.vp-select-body').remove()
          let html = vm.createBody()
          $('body').append(html)
          vm.body = $('#select-body-' + vm.option.id)
          if (vm.option.showTree) {
            vm.createTreeOpts()
          } else {
            vm.search = vm.body.find('.vp-select-search')
            vm.items = vm.body.find('.vp-select-item')
            vm.bindBodyEvent()
          }
          vm.showBody(true)
          vm.addListener()
        } else {
          vm.showBody(false)
        }
        $(document).unbind('click').click(function (ev) {
          ev.stopPropagation()
          vm.showBody(false)
        })
        if (!vm.option.showTree) {
          vm.search.unbind('click').click(function (ev) {
            ev.stopPropagation()
          })
        }
      })
    },
    // 生成选项面板
    createBody () {
      let style = this.bodyStyle
      let bodyClass = 'vp-select-body' + (this.option.isMultiple ? ' multiple' : '') + (this.option.showSearch ? ' search' : '')
      let position = 'left:' + this.header.offset().left + 'px;' +
                     'min-width:' + this.header.outerWidth() + 'px;'
      let html = '<div class="' + bodyClass + '" id="select-body-' + this.option.id + '" style="' + style.panel + position + '">'
      html += this.option.showTree ? '' : this.createNormalOpts()
      html += '</div>'
      return html
    },
    // 生成普通选项
    createNormalOpts () {
      let style = this.bodyStyle
      let html = (this.option.showSearch ? '<div class="vp-select-search"><input placeholder="搜索" class="vp-select-search-input" /></div>' : '') +
                '<ul class="vp-select-body-ul">'
      this.dataArr.forEach(item => {
        let selected = this.selectVal.includes(item.value)
        let itemStyle = ' style="' + (selected ? style.selected : style.normal) + '"'
        let classText = ' class="vp-select-item' + (selected ? ' select' : '') + (item.disable ? ' disable' : '') + '"'
        let title = item.label.toString().replace(/<\/?[^>]*>/g, ' ')
        html += '<li data-val="' + item.value + '" title="' + title + '"' + classText + itemStyle + '>' +
                  '<span>' + item.label + '</span>' +
                '</li>'
      })
      html += '</ul>'
      return html
    },
    // 生成选项树
    createTreeOpts () {
      let vm = this
      let setting = {
        id: 'select-body-' + this.option.id,
        preText: '',
        treeMultiSelect: this.option.isMultiple,
        callback: {
          itemClick: function (data) {
            data = JSON.parse(data)
            let arr = []
            let text = []
            if (vm.option.isMultiple) {
              data.forEach(item => {
                item.value = item.id
                arr.push(item)
                text.push(item.label)
              })
              vm.selectText = text.join('，')
            } else {
              arr = new Array(data)
              vm.selectText = data.label
              vm.showBody(false)
            }
            vm.setSelectText()
            if (vm.option.callback.selectOver) {
              vm.option.callback.selectOver(vm.utils.deepCopy(arr), vm)
            }
          }
        }
      }
      this.treeObj = new VpTree(setting, this.dataArr)
      this.treeObj.init()
    },
    // 显示/隐藏选项面板
    showBody (flag) {
      if (flag) {
        $('.vp-select-header').removeClass('open')
        this.header.addClass('open')
      } else {
        this.header.removeClass('open')
      }
      this.body.css(this.getBodyPosition(flag))
    },
    getBodyPosition (flag) {
      let h = this.body.outerHeight()
      let bottom = $(window).height() - this.header.offset().top - this.header.outerHeight() - 2
      let css = {}
      if (h <= bottom) {
        css = {
          'opacity': flag ? 1 : 0,
          'transform': flag ? 'scaleY(1)' : 'scaleY(0)',
          'transform-origin': 'center top 0px',
          'top': (this.header.offset().top + this.header.outerHeight() + 2) + 'px'
        }
      } else {
        css = {
          'opacity': flag ? 1 : 0,
          'transform': flag ? 'scaleY(1)' : 'scaleY(0)',
          'transform-origin': 'center bottom 0px',
          'top': (this.header.offset().top - h - 2) + 'px'
        }
      }
      return css
    },
    // 绑定选项面板事件
    bindBodyEvent () {
      this.onClickItem()
      if (this.option.showSearch) {
        this.onSearch()
      }
    },
    // 点击选项事件
    onClickItem () {
      let vm = this
      this.items.unbind('click').bind('click ', function (e) {
        let item = $(this)
        if (item.hasClass('disable')) {
          e.stopPropagation()
          return
        }

        let arr = [...vm.selectVal]
        if (vm.option.isMultiple) {
          e.stopPropagation()
          let val = item.attr('data-val')
          if (arr.includes(val)) {
            arr.splice(arr.indexOf(val), 1)
            item.removeClass('select').attr('style', vm.bodyStyle.normal)
          } else {
            arr.push(val)
            item.addClass('select').attr('style', vm.bodyStyle.selected)
          }
        } else {
          arr = [item.attr('data-val')]
          vm.items.removeClass('select').attr('style', vm.bodyStyle.normal)
          item.addClass('select').attr('style', vm.bodyStyle.selected)
        }
        vm.getSelectData(arr)
        vm.setSelectText()
        if (vm.option.callback.selectOver) {
          vm.option.callback.selectOver(vm.utils.deepCopy(vm.selectData), vm)
        }
      })
    },
    // 搜索框值改变查询
    onSearch () {
      let vm = this
      this.search.unbind('input propertychange').bind('input propertychange', function (e) {
        vm.searchkey = $(this).val()
        vm.items.each(function () {
          let dom = $(this)
          if (!dom.text().includes(vm.searchkey)) {
            dom.css('display', 'none')
          } else {
            dom.css('display', '')
          }
        })
      })
    },
    // 整理选中项数据
    getSelectData (selectedArr) {
      this.selectVal = [...selectedArr]

      this.selectData = new Array(this.selectVal.length)
      let arr = new Array(this.selectVal.length)
      this.dataArr.forEach(item => {
        let index = this.selectVal.indexOf(item.value)
        if (index !== -1) {
          this.selectData[index] = this.utils.deepCopy(item)
          arr[index] = item.label
        }
      })
      this.selectText = arr.join('，')
    },
    // 设置显示的选中项
    setSelectText () {
      this.input.val(this.selectText)
      this.input.attr('title', '已选：' + this.selectText)
    },
    // 添加页面滚动监听、resize监听
    addListener () {
      let vm = this
      $(window).unbind('resize').bind('resize ', function (e) {
        vm.showBody(false)
      })
      $(document).unbind('scroll').bind('scroll ', function (e) {
        vm.showBody(false)
      })
    },
    // 外部调用方法==============================
    // 获取选中项数据
    $_getData () {
      let data = this.option.isMultiple ? this.utils.deepCopy(this.selectData) : this.utils.deepCopy(this.selectData[0])
      return JSON.stringify(data)
    },
    // 设置选中项
    $_setData (selectedVal) {
      if (this.utils.checkNull(selectedVal)) {
        let arr = selectedVal.split(',')
        if (this.option.isMultiple) {
          this.getSelectData(arr)
        } else {
          this.getSelectData([arr[0]])
        }
        this.setSelectText()

        if (this.option.callback.setData) {
          this.option.callback.setData(this.utils.deepCopy(this.selectData), this)
        }
      }
    },
    // 显示/隐藏校验文字
    $_addCheck (flag, msg, type) {
      if (flag) {
        let top = ''
        let left = ''
        let h = ''
        if (type === 'right') {
          top = 0
          left = this.header.offset().left - this.content.offset().left + this.header.outerWidth() + 15
          h = this.header.outerHeight() + 'px'
        } else {
          top = this.header.outerHeight() + 8
          left = this.header.offset().left - this.content.offset().left
          h = '1em'
        }
        this.errorMsg.html(msg).css({
          'display': 'block',
          'height': h,
          'line-height': h,
          'top': top,
          'left': left
        })
        this.header.addClass('error')
      } else {
        this.errorMsg.css('display', 'none')
        this.header.removeClass('error')
      }
    },
    // 设置下拉框可用不可用
    $_disabled (flag) {
      if (flag) {
        this.container.addClass('disabled')
      } else {
        this.container.removeClass('disabled')
      }
    }
  }
  // 工具方法
  newObj.utils = {
    // 合并
    mergeObjectDeep: function (defaultObj, originalObj) {
      let newObj = this.deepCopy(defaultObj)
      for (let i in defaultObj) {
        let dv = defaultObj[i]
        let ov = originalObj[i]
        if (this.isObjectObject(dv) && this.checkNull(ov)) {
          newObj[i] = this.mergeObjectDeep(dv, ov)
        } else {
          if (this.checkNull(ov)) {
            newObj[i] = this.deepCopy(ov)
          }
        }
      }
      return newObj
    },
    // 深拷贝
    deepCopy: function (source) {
      let sourceCopy = null
      if (this.isObjectObject(source)) {
        sourceCopy = {}
        for (let item in source) {
          sourceCopy[item] = this.deepCopy(source[item])
        }
      } else if (this.isArray(source)) {
        sourceCopy = []
        source.forEach(item => {
          sourceCopy.push(this.deepCopy(item))
        })
      } else {
        return source
      }
      return sourceCopy
    },
    // 类型判断
    isArray: function (obj) {
      return Array.isArray(obj) || Object.prototype.toString.call(obj) === '[object Array]'
    },
    isObject: function (obj) {
      let type = typeof obj
      return (type === 'function' || type === 'object') && !!obj
    },
    isObjectObject: function (val) {
      return Object.prototype.toString.call(val) === '[object Object]'
    },
    isDate: function (val) {
      return Object.prototype.toString.call(val) === '[object Date]'
    },
    isString: function (val) {
      return Object.prototype.toString.call(val) === '[object String]'
    },
    isNumber: function (val) {
      return Object.prototype.toString.call(val) === '[object Number]'
    },
    // 空值校验
    checkNull: function (obj) {
      if (obj === null || obj === '' || obj === undefined) {
        return false
      } else if (JSON.stringify(obj) === '{}') {
        let a = false
        for (let i in obj) {
          a = true
        }
        return a
      } else if ((this.isString(obj) || this.isArray(obj)) && obj.length === 0) {
        return false
      } else {
        return true
      }
    }
  }
  // 默认设置
  newObj.Opt = {
    id: '', // 生成下拉框的父级DOM元素id
    preText: '', // 前置文字，放置于下拉框前的说明文字
    preStyle: '', // 前置文字样式
    placeholder: '', // 下拉框内的提示文字
    isMultiple: false, // 是否多选
    showTree: false, // 选项是否为树结构
    showClear: false, // 是否显示清空按钮
    showSearch: false, // 是否开启选项过滤功能
    // 下拉框的样式
    inputStyle: {
      width: '', // 宽度
      height: '', // 高度
      bgColor: '', // 背景色
      color: '', // 文字颜色
      fontSize: '', // 文字字号
      borderRadius: '', // 边框圆角
      borderwith: '', // 边框粗细
      borderColor: '', // 边框颜色
      arrowColor: ''// 下拉框右侧尖角图标颜色
    },
    // 选项面板样式
    panelStyle: {
      bgColor: '', // 背景色
      borderRadius: '', // 边框圆角
      borderwith: '', // 边框粗细
      borderColor: '', // 边框颜色
      color: '', // 选项文字颜色
      fontSize: '', // 选项文字字号
      lineHeight: '', // 选项文字行高
      colorSel: '', // 选中选项文字颜色
      fontSizeSel: '', // 选中选项文字字号
      bgColorSel: '' // 选中选项背景色
    },
    // 回调函数
    callback: {
      clearOver: null, // 清空事件
      selectOver: null, // 选中项改变
      dataOver: null, // 选项加载完毕
      setData: null // 调用$_setData后
    }
  }
  return newObj
}

// 导出=======================================================================

window.AjSelect = AjSelect
