let AjTable = function (options) {
  let newObj = {
    isIE11: false,
    thData: [],
    tdData: [],
    box: null,
    thBox: {},
    thTable: {},
    thTableLeft: 0,
    tdBox: null,
    tdTable: null,
    fixFirst: {},
    fixLast: {},
    colNum: 0,
    rowNum: 0,
    noDataFlag: false,
    option: {},
    secondThData: [],
    thColData: [], // 不含一级表头的列数据
    selectCols: [],
    selectData: {}, // 存储下拉选列的下拉框对象
    myTableInterval: {},
    init (th, td) {
      let userAgent = navigator.userAgent
      if (userAgent.indexOf('Trident') > -1 && userAgent.indexOf('rv:11.0') > -1) {
        this.isIE11 = true
      }
      let errorMessage = this.checkData(th)
      if (errorMessage.length) {
        alert(errorMessage)
        return
      }
      this.selectData = {}
      this.option = this.utils.mergeObjectDeep(this.Opt, options)
      this.option.scrollBarWidth = this.utils.getScrollWidth()
      if (this.option.fixFirstCol || this.option.fixLastCol) {
        this.option.fixTh = true
        this.option.fixTableWidth = false
      }
      this.thData = this.utils.deepCopy(th)
      this.tdData = this.utils.deepCopy(td)
      this.modifyThData()
      this.modifyTdData()
      if (!this.tdData || !this.tdData.length) {
        this.noDataFlag = true
        this.option.fixTh = true
      }
      this.box = $('#' + this.option.id)
      this.box.find('.xc-td-box').remove()
      this.box.find('.xc-th-box').remove()
      this.colNum = this.thColData.length
      this.rowNum = this.tdData.length
      this.createHtml()
      this.displayListener()
    },
    // 数据格式校验
    checkData (thSet) {
      let str = ''
      thSet.forEach(item => {
        if (item.isEdit && item.mergeCell) {
          str = '“' + item.label + '”列属性设置错误！可编辑内容列不可合并单元格！'
          return false
        }
        if (item.type !== 'text' && item.mergeCell) {
          str = '“' + item.label + '”列属性设置错误！非文字内容列不可合并单元格（mergeCell不可设置为true）！'
          return false
        }
      })
      return str
    },
    // 为没有key的列设置key，为重复key设置bakKey
    modifyThData () {
      let num = 0
      let keys = []
      this.secondThData = []
      this.thColData = []
      this.thData.forEach((th, index) => {
        if (th.isShow === false) {
          return
        }
        if (!this.utils.checkNull(th.key)) {
          th.key = th.type === 'no' ? 'aj-table-no' : 'col-class-' + num
          num++
        } else {
          if (keys.includes(th.key)) {
            th.bakKey = th.key + '-' + index
          } else {
            keys.push(th.key)
          }
        }
        if (this.utils.checkNull(th.children)) {
          let invisibleChildrenNum = 0
          th.children.forEach(e => {
            if (e.isShow === false) {
              invisibleChildrenNum++
              return
            }
            e.key = e.key ? e.key : ('col-class-' + num)
            num++
            this.secondThData.push(e)
            this.thColData.push(e)
          })
          if (invisibleChildrenNum === th.children.length) {
            th.isShow = false
          }
          // this.secondThData.push(...th.children)
          // this.thColData.push(...th.children)
        } else {
          this.thColData.push(th)
        }
        if (th.type === 'select') {
          this.selectCols.push(th)
        }
      })
      // console.log(this.secondThData)
    },
    // 整理真实数据，将下拉选和输入框的默认值赋予空值行
    modifyTdData () {
      this.tdData.forEach((item, index) => {
        item['vp-row-index'] = index
        this.thData.forEach(col => {
          if (['select', 'input'].includes(col.type) && !this.utils.checkNull(item[col.key]) && this.utils.checkNull(col.defaultVal)) {
            item[col.key] = col.defaultVal
            if (col.type === 'select') {
              let arr = []
              col.options.forEach(opt => {
                if (opt.value === col.defaultVal) {
                  arr.push(opt)
                }
              })
              item[col.key + '_info'] = arr
            }
          }
        })
      })
    },
    // 生成html
    createHtml () {
      let htmlTh = `<thead class="xc-th-head">${this.createThead()}</thead>`
      let htmlTd = `<tbody class="xc-th-body">${this.createRow()}</tbody>`
      let htmlThBox = `<div class="xc-th-box"><table class="xc-th" cellpadding="0" cellspacing="0" border="0">${htmlTh}</table></div>`
      let htmlTdBox = `<div class="xc-td-box"><table class="xc-td" cellpadding="0" cellspacing="0" border="0">${htmlTd}</table></div>`
      let htmlNoData = `<div class="xc-td-box"><span class="xc-td-no-data">${this.option.noDataText}</span></div>`
      let htmlThTd = `<div class="xc-td-box"><table class="xc-td" cellpadding="0" cellspacing="0" border="0">${htmlTh + htmlTd}</table></div>`
      let html = ''
      if (this.option.noTh) {
        html += this.noDataFlag ? htmlNoData : htmlTdBox
      } else if (this.option.fixTh || this.option.fixFirst || this.option.fixLast) {
        html += htmlThBox + (this.noDataFlag ? htmlNoData : htmlTdBox)
      } else {
        html += this.noDataFlag ? (htmlThBox + htmlNoData) : htmlThTd
      }

      if (this.option.stripe) {
        this.box.addClass('stripe')
      }
      if (this.option.highlightHover) {
        this.box.addClass('highlight-hover')
      }
      if (this.option.border.horizontal) {
        this.box.addClass('horizontal-border')
      }
      if (this.option.border.vertical) {
        this.box.addClass('vertical-border')
      }

      this.box.append(html)
      this.thBox = this.box.find('.xc-th-box')
      this.tdBox = this.box.find('.xc-td-box')
      this.thTable = this.box.find('.xc-th')
      this.thHead = this.box.find('.xc-th-head')
      this.tdTable = this.tdBox.children('.xc-td')
      this.tdBody = this.tdTable.find('tbody')
      this.tdRows = this.tdBox.find('.xc-td-row')
      this.tdData.forEach((row, rowIndex) => {
        this.selectCols.forEach(col => {
          this.addSelect(col, row, rowIndex)
        })
      })
    },
    // 生成表头
    createThead () {
      let opt = this.option.thStyle
      let thStyle = `border-color:${opt.borderColor};
                     background-color:${opt.bgColor};
                     height:${opt.height};`.trim()
      let cellStyle = `color:${opt.color}; 
                       font-size:${opt.fontSize};
                       font-weight:${opt.fontBold};
                       text-align:${opt.align};`.trim()

      let html = ''
      this.thData.forEach((item, i) => {
        if (item.isShow === false) {
          return
        }
        html += this.createTh(item, i, thStyle, cellStyle, true)
      })
      if (this.secondThData.length) {
        html += '</tr><tr>'
        this.secondThData.forEach((item, i) => {
          html += this.createTh(item, i, thStyle, cellStyle, false)
        })
      }
      return `<tr>${html}</tr>`
    },
    // 生成表头单元格
    createTh (item, index, thStyle, cellStyle, isFirst) {
      let sortIcon = ''
      let sortStle = ''
      let sortAttr = ''
      let sortClass = ''
      let title = ` title="${item.label}">`
      if (item.sort) {
        sortIcon = '<span class="xc-sort"><i class="xc-sort-icon asc"></i><i class="xc-sort-icon desc"></i></span>'
        sortStle = 'cursor:pointer;'
        sortAttr = `sort-key="${item.key}"`
        sortClass = item.key === this.option.sortKey ? (this.option.sortType === 'asc' ? 'asc' : 'desc') : ''
      }
      if (item.label.includes('<') && item.label.includes('>')) {
        title = '>'
      }

      let mergeType = ''
      if (this.secondThData.length && isFirst) {
        mergeType = this.utils.checkNull(item.children) ? (` colspan="${item.children.length}"`) : (' rowspan="2"')
      }
      let html = ''
      let thClass = `xc-th-th ${item.key + (item.bakKey ? (' ' + item.bakKey) : '')}`
      let thCellClass = 'xc-th-cell ' + item.key + (item.bakKey ? (' ' + item.bakKey) : '') + (item.sort ? (' xc-sort-th ' + sortClass) : '')
      html += `<th${mergeType} class="${thClass}" style="${thStyle}" col-key="${item.key}"${title}
                  <div class="${thCellClass}" style="${cellStyle + sortStle}" ${sortAttr}>
                  ${item.label + sortIcon}
                </div>`.trim()
      // 添加多选列
      if (this.option.multiSelect && index === 0 && isFirst) {
        html += this.addChkCell(true)
      }
      // 修补因出现滚动条产生的空白
      if (index === this.thData.length - 1 && this.option.fixTh) {
        let st = `width:${this.option.scrollBarWidth}px;
                 right:-${this.option.scrollBarWidth + (this.option.border.vertical ? 1 : 0)}px;`
        html += `<div class="xc-th-cell-scrollbar" style="${st}"></div>`
      }
      html += '</th>'
      return html
    },
    // 生成数据行
    createRow () {
      let html = ''
      this.tdData.forEach((row, index) => {
        let forbidSel = row.forbidSel ? 'forbid-select' : ''
        html += `<tr row-data='${JSON.stringify(row)}' row-index="${index}" class='xc-td-row ${forbidSel}'>`
        let i = 0
        this.thColData.forEach(col => {
          html += this.createTd(col, index, i)
          i++
        })
        html += '</tr>'
      })
      return html
    },
    // 生成单元格
    createTd (col, rowIndex, colIndex) {
      let style = rowIndex % 2 === 0 ? this.getTdStyle(this.option.oddStyle, col) : this.getTdStyle(this.option.evenStyle, col)
      let data = this.tdData[rowIndex]
      let editAttr = `class="${col.isEdit ? 'xc-td-edit' : ''}" 
                      row-index="${rowIndex}" 
                      col-key="${col.key || ''}" ` +
                      (col.bakKey ? ('col-key-bak="' + col.bakKey + '"') : '')

      let html = `<td style="${style.td}" ${editAttr}>`
      if (this.option.multiSelect && colIndex === 0) {
        html += this.addChkCell(false, rowIndex)
      }
      let divId = ' id="' + this.option.id + '_' + col.key + (col.bakKey ? ('_' + col.bakKey) : '') + '_' + rowIndex + '"' // select列添加id
      let tdCellClass = 'xc-td-cell ' + col.key + (col.bakKey ? (' ' + col.bakKey) : '')
      html += '<div style="' + style.cell + '" class="' + tdCellClass + '"' + (col.type === 'select' ? divId : '') + '>'

      let inner = ''
      switch (col.type) {
      case 'no':
        inner = `<span class="xc-td-text ${col.key}">${rowIndex + 1}</span>`
        break
      case 'text':
        inner = this.addText(col, data, style)
        break
      case 'input':
        inner = this.addInput(col, data, rowIndex)
        break
      case 'img':
        inner = this.addImg(col, data)
        break
      case 'switch':
        inner = this.addSwitch(col, data, rowIndex)
        break
      case 'button':
        inner = this.addBtns(col, rowIndex, data)
        break
      case 'html':
        inner = data.htmlCode || col.htmlCode
        break
      }
      html += inner + '</div></td>'

      return html
    },
    // 获取单元格样式
    getTdStyle (opt, col) {
      let width = col.width || ''
      if (width.indexOf('%') !== -1) {
        let tableW = this.box.width() - this.option.scrollBarWidth - (this.option.multiSelect ? this.option.multiSelColWidth : 0)
        width = Math.floor(tableW * parseInt(width) / 100) - 1
      } else {
        width = parseInt(width) - 1
      }
      let style = []
      style.td = `background-color:${opt.bgColor};
                  width:${width}px;
                  border-color:${opt.borderColor};
                  text-align:${col.align || opt.align};`
      style.cell = `width:${width}px;
                    line-height:${opt.height};
                    color:${col.color || opt.color};
                    font-size:${opt.fontSize};
                    font-weight:${opt.fontBold};`
      style.text = `line-height:${opt.height};`
      return style
    },
    // 添加多选单元格
    addChkCell (isThChk, rowIndex) {
      // console.log(isThChk, rowIndex)
      let style = `left:${-this.option.multiSelColWidth}px;width:${this.option.multiSelColWidth}px;`
      let html = '<div style="' + style + '" class="xc-chk-cell">' +
                    '<span class="xc-chk-box ' + (isThChk ? 'xc-th-chk' : 'xc-td-chk') + '" row-index="' + (isThChk ? '' : rowIndex) + '"></span>' +
                  '</div>'
      return html
    },
    // 添加文字内容
    addText (col, data, styleObj) {
      let style = styleObj.text
      let icon = ''
      let img = ''
      if (col.isBreak) {
        style += 'word-wrap:break-word;white-space:pre-line;'
      }
      if (col.preIcon) {
        icon = '<i class="icon iconfont ' + col.preIcon + '"></i>'
      }
      if (col.preImg) {
        img = '<img class="xc-td-text-img ' + col.key + '" src="' + col.preImg + '" />'
      }
      let title = (data[col.key] || '---').toString().replace(/<\/?[^>]*>/g, ' ') // 去除dom标签
      let className = 'xc-td-text ' + col.key + (col.bakKey ? (' ' + col.bakKey) : '')
      let inner = '<span title="' + title + '" class="' + className + '" style="' + style + '">' + img + icon + (this.utils.checkNull(data[col.key]) ? data[col.key] : '---') + '</span>'
      if (col.isEdit) {
        inner += '<input class="xc-td-text-input ' + col.key + '" type="text" />'
      }
      return inner
    },
    // 添加输入框
    addInput (col, data, rowIndex) {
      let style = this.utils.checkNull(col.inputWidth) ? ('style="width:' + col.inputWidth + ';" ') : ''
      let value = 'value="' + (data[col.key] || col.defaultVal || '') + '" '
      let title = 'title="' + (data[col.key] || col.defaultVal || '') + '" '
      let dataVal = 'row-index="' + rowIndex + '" col-key="' + col.key + '" '
      let html = '<input type="' + col.inputType + '" ' + value + dataVal + title + style + 'placeholder="' + (col.placeholder || '') + '" class="xc-td-input" />'
      html = (col.preText || '') + html + (col.nextText || '')
      return html
    },
    // 添加图片内容
    addImg (col, data) {
      let src = data[col.key]
      let css = 'width:' + (col.imgW || '') + ';height:' + (col.imgH || '') + ';'
      let attr = 'class="xc-td-img ' + col.key + '"' +
                'src="' + src + '"' +
                'alt="' + col.label + '"' +
                'style="' + css + '"'
      return '<img ' + attr + ' />'
    },
    // 添加开关
    addSwitch (col, data, rowIndex) {
      let inner = ''
      let attr = 'col-key="' + col.key + '" row-data=\'' + JSON.stringify(data) + '\' row-index=\'' + rowIndex + '\' true-val="' + col.trueVal + '" false-val="' + col.falseVal + '" name="' + col.name + '"'
      let isOpen = data[col.key].toString() === col.trueVal
      inner += '<div ' + attr + ' class="xc-switch ' + col.key + ' ' + (isOpen ? 'open' : '') + '">' +
                '<span class="xc-switch-true"> ' + col.trueLabel + '</span>' +
                '<i class="xc-switch-icon"></i>' +
                '<span class="xc-switch-false"> ' + col.falseLabel + '</span>' +
              '</div>'
      return inner
    },
    // 添加按钮
    addBtns (col, rowIndex, data) {
      let inner = ''
      col.btns.forEach(btn => {
        let attr = 'btn-key="' + btn.key + '" row-index="' + rowIndex + '"'
        let className = 'class="xc-td-btn ' +
                        (data.forbidBtn && data.forbidBtn.includes(btn.key) ? ' forbid ' : '') +
                        (btn.type === 'link' ? ' link-style ' : '') +
                        col.key + ' ' +
                        btn.key + '"'
        inner += '<button ' + attr + className + '>' +
                   (this.utils.checkNull(btn.iconClass) ? ('<i class="xc-td-btn-icon ' + btn.iconClass + '"></i>') : '') +
                    btn.label +
                  '</button>'
      })
      return inner
    },
    // 开关初始化
    switchInit () {
      let vm = this
      let target = this.tdTable.find('.xc-switch.open')
      target.each(function () {
        vm.switchAction($(this), true)
      })
    },
    //
    // 排版调整=======================================================================
    //
    // 表格或者父级模块由隐藏变为显示时调整表格显示效果
    displayListener () {
      let vm = this
      let boxs = vm.box.parents()
      let panel = {}
      boxs.each(function () {
        if ($(this).css('display') === 'none' && !vm.utils.checkNull(panel)) {
          panel = $(this)
        }
      })
      if (vm.box.css('display') === 'none') {
        vm.myTableInterval[vm.option.id + '2'] = setInterval(function () {
          if (vm.box.css('display') !== 'none') {
            vm.adjust()
            clearInterval(vm.myTableInterval[vm.option.id + '2'])
          }
        }, 1)
      } else if (vm.utils.checkNull(panel)) {
        vm.myTableInterval[vm.option.id + '1'] = setInterval(function () {
          if (panel.css('display') !== 'none') {
            vm.adjust()
            clearInterval(vm.myTableInterval[vm.option.id + '1'])
          }
        }, 1)
      } else {
        vm.adjust()
      }
      window.onresize = function () {
        vm.$_reset()
      }
    },
    // 位置和列宽
    adjust (resetFlag) {
      if (this.option.heightAuto) {
        this.box.height(this.thTable.outerHeight() + this.tdTable.outerHeight())
        if (this.isIE11) {
          this.tdBox.css('overflow-y', 'hidden')
        }
      }
      // 表格总宽度是否固定
      if (this.option.fixTableWidth) {
        this.tdTable.css('width', this.getFixTableWidth())
      }

      // 使用多选时表格左侧位置调整
      this.setMultiSelLeft()

      // 固定表头时调整表身位置及表头列宽
      if (this.option.fixTh && !this.noDataFlag) {
        this.tdBox.css('top', this.thTable.outerHeight())
        this.secondThData.length ? this.ajustColWidthD() : this.ajustColWidthS()
        // 重复一遍，防止表头列宽调整后，有某列表头文字从多行变为一行使表头高度发生变化
        if (this.option.heightAuto) {
          this.box.height(this.thTable.outerHeight() + this.tdTable.outerHeight() + (this.isIE11 ? 1 : 0))
        }
        if (this.option.fixTableWidth) {
          this.tdTable.css('width', this.getFixTableWidth())
        }
        this.tdBox.css('top', this.thTable.outerHeight())
        this.secondThData.length ? this.ajustColWidthD() : this.ajustColWidthS()
      } else if (this.noDataFlag) {
        if (this.option.heightAuto) {
          this.box.height(this.thTable.outerHeight() + 100)
        }
        this.tdBox.css('top', this.thTable.outerHeight())
        this.thTable.width(this.getFixTableWidth())
      }
      // 最右侧一列表头及单元格右边线处理
      this.ajustRightBorder()
      // 处理双表头时最左侧一列表头及单元格右边线
      this.ajustLeftBorder()

      // 合并单元格
      if (!resetFlag) {
        this.mergeCell()
      }
      // 开关初始化
      this.switchInit()

      if (resetFlag) {
        this.thBox.find('.xc-fix-th').remove()
        this.tdBox.find('.xc-fix-td').remove()
      }
      // 固定列和绑定事件
      let vm = this
      setTimeout(function () {
        if (vm.option.fixFirstCol && vm.tdTable.outerWidth() > vm.box.width()) {
          vm.fixCol('left')
        }
        if (vm.option.fixLastCol && vm.tdTable.outerWidth() > vm.box.width()) {
          vm.fixCol('right')
        }
        vm.bindEvent()

        if (vm.isIE11) {
          vm.box.find('.xc-chk-cell').each(function () {
            $(this).height($(this).parent().outerHeight())
          })
          vm.box.find('.xc-td>tbody>tr>td').css('border-bottom', 'none')
        }

        if (vm.option.callback.over && !resetFlag) {
          vm.option.callback.over(vm)
        }
      }, 20)
    },
    // 表格宽度固定时计算表格实际宽度
    getFixTableWidth () {
      let tableW = this.tdBox.width()
      // 减去滚动条宽
      if (this.tdTable.height() > this.tdBox.height()) {
        tableW -= this.option.scrollBarWidth
      }
      // 减去多选列宽
      if (this.option.multiSelect) {
        tableW -= this.option.multiSelColWidth
      }
      return tableW
    },
    // 使用多选时表格左侧位置调整
    setMultiSelLeft () {
      if (this.option.multiSelect) {
        this.tdTable.css('margin-left', this.option.multiSelColWidth)
        this.thTable.css('left', this.option.multiSelColWidth)
        this.thTableLeft = this.option.multiSelColWidth
      }
    },
    // 双表头调整表头列宽
    ajustColWidthD () {
      let tds = this.tdTable.find('td')
      let tableW = this.getFixTableWidth()

      if (this.noDataFlag) {
        this.thColData.forEach((col, i) => {
          let width = col.width || ''
          if (width.indexOf('%') !== -1) {
            width = tableW * parseInt(col.width) / 100 + 'px'
          }
          let thClassName = col.key + (col.bakKey ? ('.' + col.bakKey) : '')
          this.thHead.find('.xc-th-cell.' + thClassName).width(width)
        })
        if (this.thTable.outerWidth() < tableW) {
          this.thTable.width(tableW)
        }
      } else {
        this.thColData.forEach((col, i) => {
          let flag = this.emptyDataCol(i)
          let thClassName = col.key + (col.bakKey ? ('.' + col.bakKey) : '')
          if (flag) {
            let w1 = tds.eq(i).find('.xc-td-cell').outerWidth()
            let w2 = this.thHead.find('.xc-th-th.' + thClassName).outerWidth()
            let w = w1
            if (!this.utils.checkNull(col.width) && col.type !== 'button') {
              w = w2 > w1 ? w2 : w1
              col.width = w
            }
            this.thHead.find('.xc-th-cell.' + thClassName).css('width', w + 'px')
          } else {
            let thw = this.thHead.find('.xc-th-th.' + thClassName).width()
            thw = thw > 72 ? thw : 72
            tds.eq(i).find('.xc-td-cell').css('width', thw + 'px')
            tds.eq(i).css('width', thw + 'px')
            this.thHead.find('.xc-th-cell.' + thClassName).css('width', thw + 'px')
            this.thHead.find('.xc-th-th.' + thClassName).css('width', thw + 'px')
          }
        })
        this.thTable.width(this.tdTable.width())
      }
    },
    // 单表头调整表头列宽
    ajustColWidthS () {
      let tds = this.tdTable.find('td')
      let tableW = this.getFixTableWidth()

      if (this.noDataFlag) {
        this.thColData.forEach((col, i) => {
          let width = col.width || ''
          if (width.indexOf('%') !== -1) {
            width = tableW * parseInt(col.width) / 100 + 'px'
          }
          let thClassName = col.key + (col.bakKey ? ('.' + col.bakKey) : '')
          this.thHead.find('.xc-th-cell.' + thClassName).width(width)
        })
        if (this.thTable.outerWidth() < tableW) {
          this.thTable.width(tableW)
        }
      } else {
        this.thColData.forEach((col, i) => {
          let flag = this.emptyDataCol(i)
          let thClassName = col.key + (col.bakKey ? ('.' + col.bakKey) : '')
          if (flag) {
            let w1 = tds.eq(i).find('.xc-td-cell').outerWidth()
            let w2 = this.thHead.find('.xc-th-th.' + thClassName).outerWidth()
            let w = w1
            if (!this.utils.checkNull(col.width) && col.type !== 'button') {
              w = w2 > w1 ? w2 : w1
              tds.eq(i).find('.xc-td-cell').css('width', w + 'px')
              tds.eq(i).css('width', w + 'px')
              col.width = w + 'px'
            }
            this.thHead.find('.xc-th-th.' + thClassName).css('width', w + 'px')
            this.thHead.find('.xc-th-cell.' + thClassName).css('width', w + 'px')
          } else {
            let thw = this.thHead.find('.xc-th-th.' + thClassName).outerWidth()
            tds.eq(i).find('.xc-td-cell').css('width', thw + 'px')
            tds.eq(i).css('width', thw + 'px')
            this.thHead.find('.xc-th-cell.' + thClassName).css('width', thw + 'px')
            col.width = thw + 'px'
          }
        })
        this.thTable.width(this.tdTable.width())
      }
    },
    // 最右侧一列表头及单元格右边线处理
    ajustRightBorder () {
      let tds = this.tdTable.find('td')
      if (this.tdTable.height() <= this.tdBox.height()) {
        for (let j = 1; j <= this.rowNum; j++) {
          tds.eq(j * this.colNum - 1).css('border-right', 'none')
        }
        this.thHead.find('.xc-th-th.' + this.thData[this.thData.length - 1].key).css('border-right', 'none')
        this.thHead.find('.xc-th-th.' + this.thColData[this.colNum - 1].key).css('border-right', 'none')
        $('.xc-th-cell-scrollbar').css('display', 'none')
      } else {
        // for (let j = 1; j <= this.rowNum; j++) {
        //   tds.eq(j * this.colNum - 1).css('border-right', '1px solid #ebeef5')
        // }
        // this.thHead.find('.xc-th-th.' + this.thData[this.thData.length - 1].key).css('border-right', '1px solid #ebeef5')
        // this.thHead.find('.xc-th-th.' + this.thColData[this.colNum - 1].key).css('border-right', '1px solid #ebeef5')
        $('.xc-th-cell-scrollbar').height(this.thHead.height())
      }
    },
    // 处理双表头时最左侧一列表头及单元格右边线
    ajustLeftBorder () {
      if (this.secondThData.length) {
        $('.xc-th-th .xc-chk-cell').height(this.thHead.height())
        // this.thHead.find('.xc-th-th.' + this.secondThData[0].key).css('border-left', '1px solid #ebeef5')
      }
    },
    // 判断列宽未设置且该列无数据
    emptyDataCol (index) {
      let th = this.thColData[index]
      let colStr = th.key
      let type = th.type
      if (type !== 'text') {
        return true
      }
      let flag1 = this.utils.checkNull(th.width)
      let flag2 = false
      this.tdData.forEach(td => {
        if (this.utils.checkNull(td[colStr])) {
          flag2 = true
        }
      })
      return flag1 || flag2
    },
    // 合并单元格
    mergeCell () {
      for (let col = 0; col < this.colNum; col++) {
        if (!this.thColData[col].mergeCell) {
          continue
        }
        let rowSpanRow = 0
        for (let row = 1; row < this.rowNum; row++) {
          let rowSpanTd = this.tdTable.find('tr').eq(rowSpanRow).find('td').eq(col)
          let targetTd = this.tdTable.find('tr').eq(row).find('td').eq(col)
          let rowSpanCell = rowSpanTd.find('.xc-td-cell')
          let targetCell = targetTd.find('.xc-td-cell')
          let rowSpanText = rowSpanTd.find('.xc-td-text').html()
          let targetText = targetTd.find('.xc-td-text').html()
          let rowSpanHeight = rowSpanTd.outerHeight()
          let targetHeight = targetTd.outerHeight()
          if (targetText === rowSpanText) {
            targetTd.css({ 'border-bottom-color': 'transparent', 'background': 'none' })
            targetCell.css('display', 'none')
            let h = 0
            let mergeDiv = null
            if (rowSpanTd.find('.xc-td-merge').length) {
              mergeDiv = rowSpanTd.find('.xc-td-merge')
              h = (mergeDiv.outerHeight() + targetHeight) + 'px'
            } else {
              let html = '<div class="xc-td-merge">' + rowSpanCell.html() + '</div>'
              rowSpanTd.append(html).css({ 'border-bottom-color': 'transparent', 'background': 'none' })
              rowSpanCell.css('display', 'none')
              mergeDiv = rowSpanTd.find('.xc-td-merge')
              h = (rowSpanHeight + targetHeight) + 'px'
            }
            mergeDiv.css({ 'height': h, 'line-height': h })
          } else {
            rowSpanRow = row
          }
        }
      }
    },
    // 固定列
    fixCol (pos) {
      if (this.option.fixTh) {
        this.copyTh(pos)
      }
      this.copyTd(pos)
    },
    // 复制固定表头
    copyTh (pos) {
      let tartget = pos === 'left' ? this.thTable.find('th:first') : this.thTable.find('th:last')
      let html = tartget.html()
      let style = tartget.attr('style') + `height:${tartget.outerHeight()}px;`
      let styleL = this.option.multiSelect ? `${pos}:${this.option.multiSelColWidth - 1}px;` : `${pos}:-1px;`
      let styleR = this.thTable.find('.xc-th-cell-scrollbar').css('display') === 'none' ? `${pos}:0px;` : `${pos}:${this.option.scrollBarWidth}px;`
      style += pos === 'left' ? styleL : styleR
      html = `<div class="xc-fix-th ${pos === 'left' ? 'first' : 'last'}" style="${style}">${html}</div>`
      this.thBox.append(html)
    },
    // 复制固定单元格
    copyTd (pos) {
      let tableHtml = this.tdTable.prop('outerHTML')
      let firstW = this.tdTable.find('td').eq(0).width()
      let lastW = this.box.find('.xc-fix-th.last').outerWidth()
      let styleL = 'width:' + (this.option.multiSelect ? (firstW + this.option.multiSelColWidth + 2 + 'px;') : (firstW + 2 + 'px;'))
      let styleR = 'width:' + lastW + 'px;'
      let style = pos + ':0px;' +
                  'height:' + this.tdTable.outerHeight() + 'px;' +
                  (pos === 'left' ? styleL : styleR)
      // console.log(style)
      let html = '<div class="xc-fix-td ' + (pos === 'left' ? 'first' : 'last') + '" style="' + style + '">' + tableHtml + '</div>'
      this.tdBox.append(html)
      this.fixFirst = this.box.find('.xc-fix-td.first')
      this.fixLast = this.box.find('.xc-fix-td.last')
    },
    //
    // 绑定事件=======================================================================
    //
    bindEvent () {
      this.onSelTableData()
      this.onSort()
      this.onClickTableBtn()
      this.onEditText()
      this.onSwitch()
      this.onInputBlur()
      this.scrollListener()
    },
    // 添加下拉框
    addSelect (col, data, rowIndex) {
      let vm = this
      let opt = this.utils.checkNull(col.selectWidth) ? {inputStyle: {width: col.selectWidth}} : {}
      let id = this.option.id + '_' + col.key + (col.bakKey ? ('_' + col.bakKey) : '') + '_' + rowIndex
      opt.id = id
      opt.isMultiple = col.isMultiple
      opt.showClear = col.showClear
      opt.showTree = col.showTree
      opt.showSearch = col.showSearch
      opt.preText = col.preText
      opt.placeholder = col.placeholder
      opt.callback = {
        selectOver: function (data, selectObj) {
          let nv = vm.utils.deepCopy(vm.tdData[rowIndex])
          var arr = []
          data.forEach(a => {
            arr.push(a.value)
          })
          nv[col.key] = arr.join(',')
          nv[col.key + '_info'] = vm.utils.deepCopy(data)
          vm.tdData[rowIndex] = vm.utils.deepCopy(nv)

          let param = {key: col.key, data: vm.tdData[rowIndex], rowIndex: rowIndex}
          if (vm.option.callback.selectOver) {
            vm.option.callback.selectOver(param, vm, selectObj)
          }
        }
      }

      let arr = (data[col.key] || col.defaultVal || '').split(',')
      let opts = []
      if (arr.length) {
        col.options.forEach(item => {
          let obj = this.utils.deepCopy(item)
          obj.selected = arr.includes(item.value)
          opts.push(obj)
        })
      }
      this.selectData[id] = new AjSelect(opt)
      this.selectData[id].init(opts)
    },
    // 多选
    onSelTableData () {
      let vm = this
      let thChk = vm.box.find('.xc-chk-box.xc-th-chk')
      let tdChkAll = vm.box.find('.xc-td-chk')
      let tdChk = vm.tdTable.find('tr .xc-td-chk').not('tr.forbid-select .xc-td-chk')
      let tdChkFirst = vm.box.find('.xc-fix-td.first tr .xc-td-chk').not('tr.forbid-select .xc-td-chk')
      let dataRow = vm.tdTable.find('.xc-td-row')
      let dataRowFix = vm.box.find('.xc-fix-td .xc-td-row')
      tdChkAll.unbind('click')
      thChk.unbind('click').click(function () {
        if (thChk.hasClass('checked')) {
          thChk.removeClass('checked')
          dataRow.removeClass('checked-row')
          dataRowFix.removeClass('checked-row')
          if (tdChkFirst.size()) {
            tdChkFirst.removeClass('checked')
          } else {
            tdChk.removeClass('checked')
          }
        } else {
          thChk.removeClass('indeterminate').addClass('checked')
          dataRow.addClass('checked-row')
          dataRowFix.addClass('checked-row')
          if (tdChkFirst.size()) {
            tdChkFirst.addClass('checked')
          } else {
            tdChk.addClass('checked')
          }
        }
        if (tdChkFirst.size()) {
          if (vm.option.callback.multiSelect) {
            vm.option.callback.multiSelect(vm.packData(tdChkFirst), vm)
          }
        } else {
          if (vm.option.callback.multiSelect) {
            vm.option.callback.multiSelect(vm.packData(tdChk), vm)
          }
        }
      })
      tdChk.unbind('click').click(function () {
        vm.tdChkClick($(this), vm.tdTable, thChk, tdChk)
      })
      tdChkFirst.unbind('click').click(function () {
        vm.tdChkClick($(this), vm.fixFirst, thChk, tdChkFirst)
      })
    },
    tdChkClick (target, box, thChk, chk) {
      target.toggleClass('checked')
      let index = target.attr('row-index')
      let tr = this.tdTable.find('.xc-td-row').eq(index)
      let trFix = this.box.find('.xc-fix-td .xc-td-row').eq(index)
      tr.toggleClass('checked-row')
      trFix.toggleClass('checked-row')

      let num = box.find('.xc-td-chk.checked').size()
      if (num === 0) {
        thChk.removeClass('checked').removeClass('indeterminate')
      } else if (num === this.rowNum) {
        thChk.addClass('checked').removeClass('indeterminate')
      } else {
        thChk.addClass('indeterminate').removeClass('checked')
      }
      if (this.option.callback.multiSelect) {
        this.option.callback.multiSelect(this.packData(chk), this)
      }
    },
    packData (chk) {
      let data = []
      for (let i = 0; i < chk.size(); i++) {
        if (chk.eq(i).hasClass('checked')) {
          let index = chk.eq(i).attr('row-index')
          data.push(this.tdData[index])
        }
      }
      return data
    },
    // 排序
    onSort () {
      let vm = this
      let target = vm.box.find('.xc-sort-th')
      target.unbind('click').click(function () {
        let btn = $(this)
        let obj = {}
        obj.key = btn.attr('sort-key')

        if (btn.hasClass('asc')) {
          btn.removeClass('asc').addClass('desc')
          obj.type = 'desc'
        } else if (btn.hasClass('desc')) {
          btn.removeClass('desc').addClass('asc')
          obj.type = 'asc'
        } else {
          target.removeClass('asc').removeClass('desc')
          btn.addClass('desc')
          obj.type = 'desc'
        }
        if (vm.option.callback.sort) {
          vm.option.callback.sort(obj, vm)
        }
      })
    },
    // 按钮点击事件
    onClickTableBtn () {
      let vm = this
      let target = vm.tdBox.find('.xc-td-btn').not('.xc-td-btn.forbid')
      target.unbind('click').click(function () {
        let btn = $(this)
        let index = btn.attr('row-index')
        let obj = {
          key: btn.attr('btn-key'),
          data: vm.tdData[index],
          rowIndex: index
        }
        if (vm.option.callback.btnClick) {
          vm.option.callback.btnClick(obj, vm, btn)
        }
      })
    },
    // 编辑文字结束
    onEditText () {
      let vm = this
      let target = vm.tdBox.find('.xc-td-edit')
      target.unbind('dblclick').dblclick(function () {
        let cell = $(this)
        let index = cell.attr('row-index')
        let ov = cell.find('.xc-td-text')
        let nv = cell.find('.xc-td-text-input')
        ov.css('display', 'none')
        nv.val(ov.html()).css('display', 'block').focus()

        nv.unbind('blur').blur(function () {
          ov.html(nv.val()).css('display', '')
          nv.css('display', 'none')
          let obj = {
            editKey: cell.attr('col-key'),
            oldData: vm.thColData[index],
            newValue: nv.val()
          }
          if (vm.option.callback.editOver) {
            vm.option.callback.editOver(obj, vm)
          }
        })
      })
    },
    // 开关
    onSwitch () {
      let vm = this
      let target = vm.tdTable.find('.xc-switch')
      target.unbind('click').click(function () {
        let btn = $(this)
        let obj = {
          name: btn.attr('name'),
          editKey: btn.attr('col-key'),
          oldData: btn.attr('row-data'),
          rowIndex: btn.attr('row-index')
        }

        btn.toggleClass('open')
        if (btn.hasClass('open')) {
          vm.switchAction(btn, true)
          obj.newValue = btn.attr('true-val')
        } else {
          vm.switchAction(btn, false)
          obj.newValue = btn.attr('false-val')
        }

        let nv = JSON.parse(btn.attr('row-data'))
        nv[btn.attr('col-key')] = obj.newValue
        vm.tdData[btn.attr('row-index')] = this.utils.deepCopy(nv)

        if (vm.option.callback.switchOver) {
          vm.option.callback.switchOver(obj, vm)
        }
      })
    },
    // 开关滑块动画
    switchAction (target, flag) {
      let gap = this.option.switchSet.padding
      let speed = this.option.switchSet.speed
      let easing = this.option.switchSet.easing
      let ball = target.find('.xc-switch-icon')
      if (flag) {
        let s = target.outerWidth() - ball.outerWidth() - gap
        ball.animate({ left: s + 'px' }, speed, easing)
      } else {
        ball.animate({ left: gap + 'px' }, speed, easing)
      }
    },
    // 输入框失去焦点事件
    onInputBlur () {
      let vm = this
      let target = vm.tdTable.find('.xc-td-input')
      target.unbind('blur').blur(function () {
        let val = $(this).val()
        let rowIndex = $(this).attr('row-index')
        let key = $(this).attr('col-key')
        vm.tdData[rowIndex][key] = val
        if (vm.option.callback.inputBlur) {
          let param = {key: key, data: vm.tdData[rowIndex], rowIndex: rowIndex}
          vm.option.callback.inputBlur(param, vm)
        }
      })
    },
    // 表身横向滚动监听
    scrollListener () {
      let vm = this
      vm.tdBox.scroll(function () {
        vm.thTable.css('left', vm.thTableLeft - vm.tdBox.scrollLeft())
        if (vm.fixFirst.length) {
          vm.fixFirst.css('left', vm.tdBox.scrollLeft())
          if (vm.tdBox.scrollLeft()) {
            vm.fixFirst.css('box-shadow', '0 0 10px rgba(0,0,0,.12)')
            vm.box.find('.xc-fix-th.first').css('box-shadow', '0 0 10px rgba(0,0,0,.12)')
          } else {
            vm.fixFirst.css('box-shadow', 'none')
            vm.box.find('.xc-fix-th.first').css('box-shadow', 'none')
          }
        }
        if (vm.fixLast.length) {
          vm.fixLast.css('right', -vm.tdBox.scrollLeft())
          let overflow = vm.tdTable.outerWidth() - vm.tdBox.innerWidth()
          overflow += vm.option.multiSelect ? vm.option.multiSelColWidth : 0
          overflow += vm.thTable.find('.xc-th-cell-scrollbar').css('display') === 'none' ? 0 : vm.option.scrollBarWidth
          if (vm.tdBox.scrollLeft() !== overflow) {
            vm.fixLast.css('box-shadow', '0 0 10px rgba(0,0,0,.12)')
            vm.box.find('.xc-fix-th.last').css('box-shadow', '0 0 10px rgba(0,0,0,.12)')
          } else {
            vm.fixLast.css('box-shadow', 'none')
            vm.box.find('.xc-fix-th.last').css('box-shadow', 'none')
          }
        }
      })
    },
    //
    // 外部调用方法=======================================================================
    //
    // 设置行选中
    $_reviewMultiSelect (indexList) {
      let thChk = this.box.find('.xc-chk-box.xc-th-chk')
      let tdChk = this.tdTable.find('.xc-td-chk')
      let tdChkFirst = this.box.find('.xc-fix-td.first .xc-td-chk')
      indexList.forEach(index => {
        tdChk.eq(index).addClass('checked')
        if (tdChkFirst.length) {
          tdChkFirst.eq(index).addClass('checked')
        }
      })
      if (tdChkFirst.length) {
        let num2 = this.fixFirst.find('.xc-td-chk.checked').size()
        if (num2 === 0) {
          thChk.removeClass('checked').removeClass('indeterminate')
        } else if (num2 === this.rowNum) {
          thChk.addClass('checked').removeClass('indeterminate')
        } else {
          thChk.addClass('indeterminate').removeClass('checked')
        }
      } else {
        let num1 = this.tdTable.find('.xc-td-chk.checked').size()
        if (num1 === 0) {
          thChk.removeClass('checked').removeClass('indeterminate')
        } else if (num1 === this.rowNum) {
          thChk.addClass('checked').removeClass('indeterminate')
        } else {
          thChk.addClass('indeterminate').removeClass('checked')
        }
      }
    },
    // 重新加载数据
    $_setData (tdData) {
      this.init(this.thData, tdData)
      if (this.option.callback.setData) {
        this.option.callback.setData(this)
      }
    },
    // 获取当前表格数据
    $_getData () {
      return this.utils.deepCopy(this.tdData)
    },
    // 重新调整列宽
    $_reset () {
      this.adjust(true)
    },
    // 添加空白行
    $_addBlankRow (flag, rowIndex, content) {
      if (rowIndex >= this.tdData.length) {
        return {
          status: 'error',
          msg: '传入行数不可大于表格显示行数'
        }
      }
      if (rowIndex < 0) {
        return {
          status: 'error',
          msg: '传入行数不可小于0'
        }
      }

      let trId = this.option.id + 'BlankTr_' + rowIndex
      if (!flag) {
        $('#' + trId).remove()
        return {
          status: 'success',
          msg: '删除空白行成功'
        }
      }

      let vm = this
      let targetId = false
      this.tdRows.each(function () {
        let row = $(this)
        if (row.attr('row-index').toString() === rowIndex.toString()) {
          let style = ''
          if (vm.option.multiSelect) {
            style = 'margin-left:-' + vm.option.multiSelColWidth + 'px;' +
                    'width:' + (vm.tdBody.width() + vm.option.multiSelColWidth) + 'px;'
          }
          targetId = vm.option.id + 'BlankDiv_' + rowIndex
          let html = '<tr id="' + trId + '" class="xc-tr-blank">' +
                        '<td colspan="' + vm.colNum + '" class="xc-tr-blank-td">' +
                          '<div id="' + targetId + '" class="xc-tr-blank-div" style="' + style + '">' +
                            (content || '') +
                          '</div>' +
                        '</td>' +
                      '</tr>'
          row.after(html)
        }
      })
      return {
        status: 'success',
        msg: '添加空白行成功',
        targetId: targetId
      }
    },
    // 添加行
    $_addRow (dataObj, rowIndex) {
      let obj = this.utils.deepCopy(dataObj)
      let index = (this.utils.checkNull(rowIndex) && rowIndex >= 0 && rowIndex < this.tdData.length) ? rowIndex : this.tdData.length
      this.tdData.splice(index, 0, obj)
      this.init(this.thData, this.tdData)
      if (this.option.callback.addOver) {
        this.option.callback.addOver(this)
      }
    },
    // 删除行
    $_deleteRow (rowIndex) {
      if (rowIndex >= this.tdData.length) {
        return {
          status: 'error',
          msg: '传入行数不可大于表格显示行数'
        }
      }
      if (rowIndex < 0) {
        return {
          status: 'error',
          msg: '传入行数不可小于0'
        }
      }

      this.tdData.splice(rowIndex, 1)
      this.init(this.thData, this.tdData)
      if (this.option.callback.deleteOver) {
        this.option.callback.deleteOver(this)
      }
    }
  }
  // 工具方法
  newObj.utils = {
    // 获取滚动条宽度
    getScrollWidth () {
      let oDiv = document.createElement('DIV')
      oDiv.style.cssText = 'position:absolute; top:-1000px; width:100px; height:100px; overflow:hidden;'
      let noScroll = document.body.appendChild(oDiv).clientWidth
      oDiv.style.overflowY = 'scroll'
      let scroll = oDiv.clientWidth
      document.body.removeChild(oDiv)
      return noScroll - scroll
    },
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
    isFunction: function (val) {
      return Object.prototype.toString.call(val) === '[object Function]'
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
    fixTableWidth: true, // 表格总宽度，自适应或者等于显示区域
    noTh: false, // 不使用表头
    fixTh: true, // 表头固定
    heightAuto: false, // 表格高度自适应
    fixFirstCol: false, // 固定首列
    fixLastCol: false, // 固定尾列
    multiSelect: false, // 可多选
    multiSelColWidth: 40, // 多选列宽
    sortKey: '', // 排序字段名称
    sortType: '', // 排序方式，asc为升序，desc为降序
    noDataText: '暂无数据', // 无数据时表身区域的显示内容，支持自定义html片断
    stripe: true, // 是否隔行变色
    highlightHover: true, // 行是否滑上变色
    border: {
      horizontal: true, // 是否带有横向边框
      vertical: true // 是否带有纵向边框
    },
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
      inputBlur: null, // 输入框失去焦点事件
      selectOver: null, // 下拉选值改变事件
      setData: null, // 表格赋值后
      deleteOver: null, // 删除某一行数据后
      addOver: null, // 添加一行数据后
      over: null // 表格加载完成
    }
  }
  return newObj
}
