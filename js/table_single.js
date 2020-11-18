// 单行表头
let AjTable = function (options) {
  let newObj = {
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
    myTableInterval: {},
    init (th, td) {
      let errorMessage = this.checkData(th)
      if (errorMessage.length) {
        alert(errorMessage)
        return
      }
      this.option = this.utils.mergeObjectDeep(this.Opt, options)
      this.option.scrollBarWidth = this.utils.getScrollWidth()
      if (this.option.fixFirstCol || this.option.fixLastCol) {
        this.option.fixTh = true
        this.option.fixTableWidth = false
      }
      this.thData = this.utils.deepCopy(th)
      this.tdData = this.utils.deepCopy(td)
      this.addColKey()
      if (!this.tdData || !this.tdData.length) {
        this.noDataFlag = true
        this.option.fixTh = true
      }
      this.box = $('#' + this.option.id)
      this.box.find('table').remove()
      this.box.find('.xc-td-box').remove()
      this.colNum = this.thData.length
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
    // 为没有key的列设置key
    addColKey () {
      let num = 0
      this.thData.forEach(th => {
        if (!this.utils.checkNull(th.key)) {
          th.key = th.type === 'no' ? 'no' : 'col-class-' + num
          num++
        }
      })
    },
    // 生成html
    createHtml () {
      let htmlTh = '<thead class="xc-th-head"><tr>' + this.createTh() + '</tr></thead>'
      let htmlTd = '<tbody class="xc-th-body">' + this.createRow() + '</tbody>'
      let htmlThBox = '<div class="xc-th-box"><table class="xc-th" cellpadding="0" cellspacing="0" border="0">' + htmlTh + '</table></div>'
      let htmlTdBox = '<div class="xc-td-box"><table class="xc-td" cellpadding="0" cellspacing="0" border="0">' + htmlTd + '</table></div>'
      let htmlNoData = '<div class="xc-td-box"><span class="xc-td-no-data">' + this.option.noDataText + '</span></div>'
      let htmlThTd = '<div class="xc-td-box"><table class="xc-td" cellpadding="0" cellspacing="0" border="0">' + htmlTh + htmlTd + '</table></div>'
      let html = ''
      if (this.option.noTh) {
        html += this.noDataFlag ? htmlNoData : htmlTdBox
      } else if (this.option.fixTh || this.option.fixFirst || this.option.fixLast) {
        html += htmlThBox + (this.noDataFlag ? htmlNoData : htmlTdBox)
      } else {
        html += this.noDataFlag ? (htmlThBox + htmlNoData) : htmlThTd
      }
      this.box.append(html)
      this.thBox = this.box.find('.xc-th-box')
      this.tdBox = this.box.find('.xc-td-box')
      this.thTable = this.box.find('.xc-th')
      this.thHead = this.box.find('.xc-th-head')
      this.tdTable = this.tdBox.children('.xc-td')
      this.tdBody = this.tdTable.find('tbody')
    },
    // 生成表头
    createTh () {
      let opt = this.option.thStyle
      let thStyle = 'border-color:' + opt.borderColor + ';' +
                  'background-color:' + opt.bgColor + ';' +
                  'height:' + opt.height + ';'
      let cellStyle = 'color:' + opt.color + ';' +
                  // 'line-height:' + opt.height + ';' +
                  'font-size:' + opt.fontSize + ';' +
                  'font-weight:' + opt.fontBold + ';' +
                  'text-align:' + opt.align + ';'

      let html = ''
      this.thData.forEach((item, i) => {
        let sortIcon = ''
        let sortStle = ''
        let sortAttr = ''
        let sortClass = ''
        let title = ' title="' + item.label + '">'
        if (item.sort) {
          sortIcon = '<span class="xc-sort"><i class="xc-sort-icon asc"></i><i class="xc-sort-icon desc"></i></span>'
          sortStle = 'cursor:pointer;'
          sortAttr = 'sort-key="' + item.key + '"'
          sortClass = item.key === this.option.sortKey ? (this.option.sortType === 'asc' ? 'asc' : 'desc') : ''
        }
        if (item.label.includes('<') && item.label.includes('>')) {
          title = '>'
        }
        html += '<th style="' + thStyle + '" col-key="' + item.key + '"' + title +
                    '<div class="xc-th-cell ' + (item.sort ? 'xc-sort-th' : '') + ' ' + sortClass + '" style="' + cellStyle + sortStle + '" ' + sortAttr + '>' +
                    item.label + sortIcon +
                  '</div>'
        // 添加多选列
        if (this.option.multiSelect && i === 0) {
          html += this.addChkCell(true)
        }
        // 修补因出现滚动条产生的空白
        if (i === this.colNum - 1 && this.option.fixTh) {
          let st = 'width:' + this.option.scrollBarWidth + 'px;' +
          'right:-' + (this.option.scrollBarWidth + 1) + 'px;'
          html += '<div class="xc-th-cell-scrollbar" style="' + st + '""></div>'
        }
        html += '</th>'
      })
      return html
    },
    // 生成数据行
    createRow () {
      let html = ''
      this.tdData.forEach((row, index) => {
        let forbidSel = this.utils.checkNull(row.forbidSel) ? 'forbid-select' : ''
        html += '<tr row-data=\'' + JSON.stringify(row) + '\' row-index="' + index + '" class=\'xc-td-row ' + forbidSel + '\'>'
        this.thData.forEach((col, i) => {
          html += this.createTd(col, index, i)
        })
        html += '</tr>'
      })
      return html
    },
    // 生成单元格
    createTd (col, rowIndex, colIndex) {
      let style = rowIndex % 2 === 0 ? this.getTdStyle(this.option.oddStyle, col) : this.getTdStyle(this.option.evenStyle, col)
      let data = this.tdData[rowIndex]
      let editAttr = 'class="' + (col.isEdit ? 'xc-td-edit' : '') + '" ' +
                      'row-index="' + rowIndex + '" ' +
                      'col-key="' + (col.key || '') + '"'
      let html = '<td style="' + style.td + '" ' + editAttr + '>'
      if (this.option.multiSelect && colIndex === 0) {
        html += this.addChkCell(false, rowIndex)
      }
      html += '<div style="' + style.cell + '" class="xc-td-cell">'

      let inner = ''
      switch (col.type) {
      case 'no':
        inner = '<span class="xc-td-text ' + col.key + '">' + (rowIndex + 1) + '</span>'
        break
      case 'text':
        inner = this.addText(col, data, style)
        break
      case 'img':
        inner = this.addImg(col, data)
        break
      case 'switch':
        inner = this.addSwitch(col, data, rowIndex)
        break
      case 'button':
        inner = this.addBtns(col, rowIndex)
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
      style.td = 'background-color:' + opt.bgColor + ';' +
                  'width:' + width + 'px;' +
                  'border-color:' + opt.borderColor + ';' +
                  'text-align:' + (col.align || opt.align) + ';'
      style.cell = 'width:' + width + 'px;' +
                  // 'height:' + opt.height + ';' +
                  'line-height:' + opt.height + ';' +
                  'color:' + (col.color || opt.color) + ';' +
                  'font-size:' + opt.fontSize + ';' +
                  'font-weight:' + opt.fontBold + ';'
      style.text = 'line-height:' + opt.height + ';'
      return style
    },
    // 添加多选单元格
    addChkCell (isThChk, rowIndex) {
      console.log(isThChk, rowIndex)
      let style = 'left:' + (-this.option.multiSelColWidth) + 'px;' +
                  'width:' + this.option.multiSelColWidth + 'px;'
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
      let inner = '<span title="' + title + '" class="xc-td-text ' + col.key + '" style="' + style + '">' + img + icon + (data[col.key] || '---') + '</span>'
      if (col.isEdit) {
        inner += '<input class="xc-td-text-input ' + col.key + '" type="text" />'
      }
      return inner
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
    addBtns (col, rowIndex) {
      let inner = ''
      col.btns.forEach(btn => {
        let attr = 'btn-key="' + btn.key + '" row-index="' + rowIndex + '"'
        inner += '<button ' + attr + ' class="xc-td-btn ' + col.key + ' ' + btn.key + '">' +
                    '<i class="xc-td-btn-icon ' + btn.iconClass + '"></i>' +
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
        } else {
          return false
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
      // 表格总宽度是否固定
      if (this.option.fixTableWidth) {
        this.tdTable.css('width', this.getFixTableWidth())
      }

      // 使用多选时表格左侧位置调整
      this.setMultiSelLeft()

      // 固定表头时调整表身位置及表头列宽
      if (this.option.fixTh && !this.noDataFlag) {
        this.tdBox.css('top', this.thTable.outerHeight())
        this.ajustColWidth()
        // 重复一遍，防止表头列宽调整后，有某列表头文字从多行变为一行使表头高度发生变化
        this.tdBox.css('top', this.thTable.outerHeight())
        this.ajustColWidth()
      } else if (this.noDataFlag) {
        this.thTable.width(this.getFixTableWidth())
      }
      // 最右侧一列表头及单元格右边线处理
      this.ajustRightBorder()

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
        if (vm.option.callback.over && !resetFlag) {
          vm.option.callback.over()
          if (vm.utils.checkNull(window.tableOverFunc) && vm.utils.checkNull(window.tableOverFunc[vm.option.id])) {
            window.tableOverFunc[vm.option.id]()
          }
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
    // 最右侧一列表头及单元格右边线处理
    ajustRightBorder () {
      let ths = this.thHead.find('th')
      let tds = this.tdTable.find('td')
      // console.log(this.tdTable.height(), this.tdBox.height())
      if (this.tdTable.height() <= this.tdBox.height()) {
        for (let j = 1; j <= this.rowNum; j++) {
          tds.eq(j * this.colNum - 1).css('border-right', 'none')
        }
        ths.eq(this.colNum - 1).css('border-right', 'none')
        $('.xc-th-cell-scrollbar').css('display', 'none')
      } else {
        // debugger
        for (let j = 1; j <= this.rowNum; j++) {
          tds.eq(j * this.colNum - 1).css('border-right', '1px solid #ebeef5')
        }
        ths.eq(this.colNum - 1).css('border-right', '1px solid #ebeef5')
        $('.xc-th-cell-scrollbar').css('display', '')
      }
    },
    // 调整表头列宽
    ajustColWidth () {
      let ths = this.thHead.find('th')
      let tds = this.tdTable.find('td')
      let tableW = this.getFixTableWidth()

      if (this.noDataFlag) {
        this.thData.forEach((col, i) => {
          let width = col.width || ''
          if (width.indexOf('%') !== -1) {
            width = tableW * parseInt(col.width) / 100 + 'px'
          }
          ths.eq(i).find('.xc-th-cell').width(width)
        })
        if (this.thTable.outerWidth() < tableW) {
          this.thTable.width(tableW)
        }
      } else {
        for (let i = 0; i < this.colNum; i++) {
          let flag = this.emptyDataCol(i)
          if (flag) {
            let w1 = tds.eq(i).find('.xc-td-cell').outerWidth()
            let w2 = ths.eq(i).outerWidth()
            let w = w1
            if (!this.utils.checkNull(this.thData[i].width) && this.thData[i].type !== 'button') {
              w = w2 > w1 ? w2 : w1
              tds.eq(i).find('.xc-td-cell').css('width', w + 'px')
              tds.eq(i).css('width', w + 'px')
              this.thData[i].width = w + 'px'
            }
            ths.eq(i).find('.xc-th-cell').css('width', w + 'px')
          } else {
            let thw = ths.eq(i).outerWidth()
            tds.eq(i).find('.xc-td-cell').css('width', thw + 'px')
            tds.eq(i).css('width', thw + 'px')
            ths.eq(i).find('.xc-th-cell').css('width', thw + 'px')
            this.thData[i].width = thw + 'px'
          }
        }
        this.thTable.width(this.tdTable.width())
      }
    },
    // 判断列宽未设置且该列无数据
    emptyDataCol (index) {
      let th = this.thData[index]
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
        if (!this.thData[col].mergeCell) {
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
      let html = pos === 'left' ? this.thTable.find('th:first').html() : this.thTable.find('th:last').html()
      let style = pos === 'left' ? this.thTable.find('th:first').attr('style') : this.thTable.find('th:last').attr('style')
      let styleL = this.option.multiSelect ? (pos + ':' + (this.option.multiSelColWidth - 1) + 'px;') : (pos + ':-1px;')
      let styleR = this.thTable.find('.xc-th-cell-scrollbar').css('display') === 'none' ? (pos + ':0px;') : (pos + ':' + this.option.scrollBarWidth + 'px;')
      style += pos === 'left' ? styleL : styleR
      html = '<div class="xc-fix-th ' + (pos === 'left' ? 'first' : 'last') + '" style="' + style + '">' + html + '</div>'
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
      this.multiSelectEvent()
      this.sortEvent()
      this.btnClickEvent()
      this.editEvent()
      this.switchEvent()
      this.scrollListener()
    },
    // 多选
    multiSelectEvent () {
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
          vm.option.callback.multiSelect(vm.packData(tdChkFirst))
        } else {
          vm.option.callback.multiSelect(vm.packData(tdChk))
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
      this.option.callback.multiSelect(this.packData(chk))
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
    sortEvent () {
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
          btn.addClass('asc')
          obj.type = 'asc'
        }
        vm.option.callback.sort(obj)
      })
    },
    // 按钮点击事件
    btnClickEvent () {
      let vm = this
      let target = vm.tdBox.find('.xc-td-btn')
      target.unbind('click').click(function () {
        let btn = $(this)
        let index = btn.attr('row-index')
        let obj = {
          key: btn.attr('btn-key'),
          data: vm.tdData[index]
        }
        if (vm.option.callback.btnClick) {
          vm.option.callback.btnClick(obj)
        }
      })
    },
    // 编辑
    editEvent () {
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
            oldData: vm.thData[index],
            newValue: nv.val()
          }
          vm.option.callback.editOver(obj)
        })
      })
    },
    // 开关
    switchEvent () {
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
        vm.option.callback.switchOver(obj)
      })
    },
    // 开关滑块动作
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
    // 回显多选
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
    },
    // 重新调整列宽
    $_reset () {
      this.adjust(true)
    },
    // 添加行
    $_addRow (dataObj) {
      let obj = this.utils.deepCopy(dataObj)
      this.thData.forEach(th => {
        if (!['no', 'button', 'html'].includes(th.type)) {
          obj[th.key] = dataObj[th.key] || ''
        }
      })
      this.tdData.push(obj)
      if (this.tdData.length === 1) {
        this.init(this.thData, this.tdData)
      } else {
        let index = this.tdData.length - 1
        let html = '<tr row-data=\'' + JSON.stringify(obj) + '\' row-index="' + index + '" class=\'xc-td-row\'>'
        this.thData.forEach((col, i) => {
          html += this.createTd(col, index, i)
        })
        html += '</tr>'
        this.tdBody.append(html)
        this.rowNum++
      }
      this.adjust()
    },
    // 删除行
    $_deleteRow (index) {
      this.tdData.splice(index, 1)
      this.tdBody.find('tr').eq(index).remove()
      let trs = this.tdBody.find('tr')
      if (trs.size() === 0) {
        if (this.option.callback.deleteOver) {
          this.option.callback.deleteOver()
        }
      } else {
        for (let i = index; i < trs.size(); i++) {
          let tr = trs.eq(i)
          tr.attr('row-index', i)
          tr.find('td').attr('row-index', i)
          tr.find('.xc-td-btn').attr('row-index', i)
          tr.find('.xc-chk-box').attr('row-index', i)
          tr.find('.xc-switch').attr('row-index', i)
          tr.find('.xc-td-text.num').html(parseInt(i) + 1)
        }
        this.rowNum--
        this.adjust()
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
    fixFirstCol: false, // 固定首列
    fixLastCol: false, // 固定尾列
    multiSelect: false, // 可多选
    multiSelColWidth: 40, // 多选列宽
    sortKey: '',
    sortType: '',
    noDataText: '暂无数据',
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
  return newObj
}
