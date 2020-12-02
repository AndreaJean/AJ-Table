let AjSelect = function (options) {
  let newObj = {
    option: {}, // 插件配置项
    dataArr: [], // 下拉框的选项数据
    selectData: [], // 选中项的完整数据
    selectVal: [], // 选中项的值
    selectText: '', // 选中项在输入框中显示的文字
    searchkey: '', // 搜索关键字
    box: null, // 生成插件的容器div
    scrollBarWidth: 0, // 滚动条宽度
    // 初始化
    init (dataArr) {
      this.option = this.utils.mergeObjectDeep(this.Opt, options)
      this.dataArr = this.utils.deepCopy(dataArr)
      console.log('下拉菜单数据', this.option, this.dataArr)
      this.box = $('#' + this.option.id)
      this.box.html('')
      $('.vp-select-body').remove()
      this.initSelect()
      this.createHtml()
      if (this.option.callback.dataOver) {
        this.option.callback.dataOver(this.utils.deepCopy(this.selectData))
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
                      '<input value="' + this.selectText + '" title="' + this.selectText + '" placeholder="' + this.option.placeholder + '" autocomplete="off" readonly="readonly" class="vp-select-input" style="' + this.inputInnerStyle + '" />' +
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
        vm.onClear()
      })
    },
    // 恢复默认值 or 清空
    onClear () {
      this.box.html('')
      $('.vp-select-body').remove()
      this.initSelect()
      this.createHtml()
      if (this.option.callback.clearOver) {
        this.option.callback.clearOver(this.utils.deepCopy(this.selectData))
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
          vm.search = vm.body.find('.vp-select-search-input')
          vm.items = vm.body.find('.vp-select-item')
          vm.showBody(true)
          vm.bindBodyEvent()
        } else {
          vm.showBody(false)
        }
        $(document).unbind('click').click(function (ev) {
          ev.stopPropagation()
          vm.showBody(false)
        })
        vm.search.unbind('click').click(function (ev) {
          ev.stopPropagation()
        })
      })
    },
    // 生成选项面板
    createBody () {
      let style = this.getBodyStyle()
      let bodyClass = 'vp-select-body' + (this.option.isMultiple ? ' multiple' : '') + (this.option.showSearch ? ' search' : '')
      let html = '<div class="' + bodyClass + '" id="select-body-' + this.option.id + '" style="' + style.panel + '">' +
                    (this.option.showSearch ? '<div class="vp-select-search"><input placeholder="搜索" class="vp-select-search-input" /></div>' : '') +
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
      html += '</ul></div>'
      return html
    },
    // 获取选项面板样式
    getBodyStyle () {
      let opt = this.option.panelStyle
      let panelStyle = 'background-color:' + opt.bgColor + ';' +
                       'border-radius:' + opt.borderRadius + ';' +
                       'border-width:' + opt.borderwith + ';' +
                       'border-color:' + opt.borderColor + ';' +
                       'min-width:' + this.header.outerWidth() + 'px;' +
                       'top:' + (this.header.offset().top + this.header.outerHeight() + 2) + 'px;' +
                       'left:' + this.header.offset().left + 'px;' +
                       'z-index:99999;'

      let normalStyle = 'color:' + opt.color + ';' +
                        'font-size:' + opt.fontSize + ';'
      let selectedStyle = 'color:' + opt.colorSel + ';' +
                          'font-size:' + opt.fontSizeSel + ';' +
                          'background-color:' + opt.bgColorSel + ';'
      return {
        panel: panelStyle,
        normal: normalStyle,
        selected: selectedStyle
      }
    },
    // 显示/隐藏选项面板
    showBody (flag) {
      if (flag) {
        $('.vp-select-header').removeClass('open')
        this.header.addClass('open')
        this.body.css({'opacity': 1, 'transform-origin': 'center top 0px', 'transform': 'scaleY(1)'})
      } else {
        this.header.removeClass('open')
        this.body.css({'opacity': 0, 'transform-origin': 'center top 0px', 'transform': 'scaleY(0)'})
      }
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
            item.removeClass('select')
          } else {
            arr.push(val)
            item.addClass('select')
          }
        } else {
          arr = [item.attr('data-val')]
          vm.items.removeClass('select')
          item.addClass('select')
        }
        vm.getSelectData(arr)
        vm.setSelectText()
        if (vm.option.callback.selectOver) {
          vm.option.callback.selectOver(vm.utils.deepCopy(vm.selectData))
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
      this.input.attr('title', this.selectText)
    },
    // 外部调用方法==============================
    // 获取选中项数据
    $_getData () {
      return this.utils.deepCopy(this.selectData)
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
          this.option.callback.setData(this.utils.deepCopy(this.selectData))
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
    id: '',
    preText: '',
    preStyle: '',
    placeholder: '',
    isMultiple: false,
    showTree: false,
    showClear: false,
    showSearch: false,
    inputStyle: {
      width: '',
      height: '',
      bgColor: '',
      color: '',
      fontSize: '',
      borderRadius: '',
      borderwith: '',
      borderColor: '',
      arrowColor: ''
    },
    panelStyle: {
      bgColor: '',
      borderRadius: '',
      borderwith: '',
      borderColor: '',
      color: '',
      fontSize: '',
      colorSel: '',
      fontSizeSel: '',
      bgColorSel: ''
    },
    callback: {
      clearOver: null,
      selectOver: null, // 选中项改变
      dataOver: null,
      setData: null // 调用$_setData后
    }
  }
  return newObj
}

// 导出=======================================================================

window.AjSelect = AjSelect
