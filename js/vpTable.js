function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var AjTable = function AjTable(options) {
  var newObj = {
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
    thColData: [],
    // 不含一级表头的列数据
    selectCols: [],
    selectData: {},
    // 存储下拉选列的下拉框对象
    myTableInterval: {},
    init: function init(th, td) {
      var userAgent = navigator.userAgent;

      if (userAgent.indexOf('Trident') > -1 && userAgent.indexOf('rv:11.0') > -1) {
        this.isIE11 = true;
      }

      var errorMessage = this.checkData(th);

      if (errorMessage.length) {
        alert(errorMessage);
        return;
      }

      this.selectData = {};
      this.option = this.utils.mergeObjectDeep(this.Opt, options);
      this.option.scrollBarWidth = this.utils.getScrollWidth();

      if (this.option.fixFirstCol || this.option.fixLastCol) {
        this.option.fixTh = true;
        this.option.fixTableWidth = false;
      }

      this.thData = this.utils.deepCopy(th);
      this.tdData = this.utils.deepCopy(td);
      this.modifyThData();
      this.modifyTdData();

      if (!this.tdData || !this.tdData.length) {
        this.noDataFlag = true;
        this.option.fixTh = true;
      }

      this.box = $('#' + this.option.id);
      (Array.isArray(this.box) ? this.box.filter('.xc-td-box')[0] : this.box.find('.xc-td-box')).remove();
      (Array.isArray(this.box) ? this.box.filter('.xc-th-box')[0] : this.box.find('.xc-th-box')).remove();
      this.colNum = this.thColData.length;
      this.rowNum = this.tdData.length;
      this.createHtml();
      this.displayListener();
    },
    // 数据格式校验
    checkData: function checkData(thSet) {
      var str = '';
      thSet.forEach(function (item) {
        if (item.isEdit && item.mergeCell) {
          str = '“' + item.label + '”列属性设置错误！可编辑内容列不可合并单元格！';
          return false;
        }

        if (item.type !== 'text' && item.mergeCell) {
          str = '“' + item.label + '”列属性设置错误！非文字内容列不可合并单元格（mergeCell不可设置为true）！';
          return false;
        }
      });
      return str;
    },
    // 为没有key的列设置key，为重复key设置bakKey
    modifyThData: function modifyThData() {
      var _this = this;

      var num = 0;
      var keys = [];
      this.secondThData = [];
      this.thColData = [];
      this.thData.forEach(function (th, index) {
        if (th.isShow === false) {
          return;
        }

        if (!_this.utils.checkNull(th.key)) {
          th.key = th.type === 'no' ? 'aj-table-no' : 'col-class-' + num;
          num++;
        } else {
          if (keys.indexOf(th.key) !== -1) {
            th.bakKey = th.key + '-' + index;
          } else {
            keys.push(th.key);
          }
        }

        if (_this.utils.checkNull(th.children)) {
          var invisibleChildrenNum = 0;
          th.children.forEach(function (e) {
            if (e.isShow === false) {
              invisibleChildrenNum++;
              return;
            }

            e.key = e.key ? e.key : 'col-class-' + num;
            num++;

            _this.secondThData.push(e);

            _this.thColData.push(e);
          });

          if (invisibleChildrenNum === th.children.length) {
            th.isShow = false;
          } // this.secondThData.push(...th.children)
          // this.thColData.push(...th.children)

        } else {
          _this.thColData.push(th);
        }

        if (th.type === 'select') {
          _this.selectCols.push(th);
        }
      }); // console.log(this.secondThData)
    },
    // 整理真实数据，将下拉选和输入框的默认值赋予空值行
    modifyTdData: function modifyTdData() {
      var _this2 = this;

      this.tdData.forEach(function (item, index) {
        item['vp-row-index'] = index;

        _this2.thData.forEach(function (col) {
          if (['select', 'input'].indexOf(col.type) !== -1 && !_this2.utils.checkNull(item[col.key]) && _this2.utils.checkNull(col.defaultVal)) {
            item[col.key] = col.defaultVal;

            if (col.type === 'select') {
              var arr = [];
              col.options.forEach(function (opt) {
                if (opt.value === col.defaultVal) {
                  arr.push(opt);
                }
              });
              item[col.key + '_info'] = arr;
            }
          }
        });
      });
    },
    // 生成html
    createHtml: function createHtml() {
      var _this3 = this;

      var htmlTh = "<thead class=\"xc-th-head\">".concat(this.createThead(), "</thead>");
      var htmlTd = "<tbody class=\"xc-th-body\">".concat(this.createRow(), "</tbody>");
      var htmlThBox = "<div class=\"xc-th-box\"><table class=\"xc-th\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\">".concat(htmlTh, "</table></div>");
      var htmlTdBox = "<div class=\"xc-td-box\"><table class=\"xc-td\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\">".concat(htmlTd, "</table></div>");
      var htmlNoData = "<div class=\"xc-td-box\"><span class=\"xc-td-no-data\">".concat(this.option.noDataText, "</span></div>");
      var htmlThTd = "<div class=\"xc-td-box\"><table class=\"xc-td\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\">".concat(htmlTh + htmlTd, "</table></div>");
      var html = '';

      if (this.option.noTh) {
        html += this.noDataFlag ? htmlNoData : htmlTdBox;
      } else if (this.option.fixTh || this.option.fixFirst || this.option.fixLast) {
        html += htmlThBox + (this.noDataFlag ? htmlNoData : htmlTdBox);
      } else {
        html += this.noDataFlag ? htmlThBox + htmlNoData : htmlThTd;
      }

      if (this.option.stripe) {
        this.box.addClass('stripe');
      }

      if (this.option.highlightHover) {
        this.box.addClass('highlight-hover');
      }

      if (this.option.border.horizontal) {
        this.box.addClass('horizontal-border');
      }

      if (this.option.border.vertical) {
        this.box.addClass('vertical-border');
      }

      this.box.append(html);
      this.thBox = Array.isArray(this.box) ? this.box.filter('.xc-th-box')[0] : this.box.find('.xc-th-box');
      this.tdBox = Array.isArray(this.box) ? this.box.filter('.xc-td-box')[0] : this.box.find('.xc-td-box');
      this.thTable = Array.isArray(this.box) ? this.box.filter('.xc-th')[0] : this.box.find('.xc-th');
      this.thHead = Array.isArray(this.box) ? this.box.filter('.xc-th-head')[0] : this.box.find('.xc-th-head');
      this.tdTable = this.tdBox.children('.xc-td');
      this.tdBody = Array.isArray(this.tdTable) ? this.tdTable.filter('tbody')[0] : this.tdTable.find('tbody');
      this.tdRows = Array.isArray(this.tdBox) ? this.tdBox.filter('.xc-td-row')[0] : this.tdBox.find('.xc-td-row');
      this.tdData.forEach(function (row, rowIndex) {
        _this3.selectCols.forEach(function (col) {
          _this3.addSelect(col, row, rowIndex);
        });
      });
    },
    // 生成表头
    createThead: function createThead() {
      var _this4 = this;

      var opt = this.option.thStyle;
      var thStyle = "border-color:".concat(opt.borderColor, ";\n                     background-color:").concat(opt.bgColor, ";\n                     height:").concat(opt.height, ";").trim();
      var cellStyle = "color:".concat(opt.color, "; \n                       font-size:").concat(opt.fontSize, ";\n                       font-weight:").concat(opt.fontBold, ";\n                       text-align:").concat(opt.align, ";").trim();
      var html = '';
      this.thData.forEach(function (item, i) {
        if (item.isShow === false) {
          return;
        }

        html += _this4.createTh(item, i, thStyle, cellStyle, true);
      });

      if (this.secondThData.length) {
        html += '</tr><tr>';
        this.secondThData.forEach(function (item, i) {
          html += _this4.createTh(item, i, thStyle, cellStyle, false);
        });
      }

      return "<tr>".concat(html, "</tr>");
    },
    // 生成表头单元格
    createTh: function createTh(item, index, thStyle, cellStyle, isFirst) {
      var sortIcon = '';
      var sortStle = '';
      var sortAttr = '';
      var sortClass = '';
      var title = " title=\"".concat(item.label, "\">");

      if (item.sort) {
        sortIcon = '<span class="xc-sort"><i class="xc-sort-icon asc"></i><i class="xc-sort-icon desc"></i></span>';
        sortStle = 'cursor:pointer;';
        sortAttr = "sort-key=\"".concat(item.key, "\"");
        sortClass = item.key === this.option.sortKey ? this.option.sortType === 'asc' ? 'asc' : 'desc' : '';
      }

      if (item.label.indexOf('<') !== -1 && item.label.indexOf('>') !== -1) {
        title = '>';
      }

      var mergeType = '';

      if (this.secondThData.length && isFirst) {
        mergeType = this.utils.checkNull(item.children) ? " colspan=\"".concat(item.children.length, "\"") : ' rowspan="2"';
      }

      var html = '';
      var thClass = "xc-th-th ".concat(item.key + (item.bakKey ? ' ' + item.bakKey : ''));
      var thCellClass = 'xc-th-cell ' + item.key + (item.bakKey ? ' ' + item.bakKey : '') + (item.sort ? ' xc-sort-th ' + sortClass : '');
      html += "<th".concat(mergeType, " class=\"").concat(thClass, "\" style=\"").concat(thStyle, "\" col-key=\"").concat(item.key, "\"").concat(title, "\n                  <div class=\"").concat(thCellClass, "\" style=\"").concat(cellStyle + sortStle, "\" ").concat(sortAttr, ">\n                  ").concat(item.label + sortIcon, "\n                </div>").trim(); // 添加多选列

      if (this.option.multiSelect && index === 0 && isFirst) {
        html += this.addChkCell(true);
      } // 修补因出现滚动条产生的空白


      if (index === this.thData.length - 1 && this.option.fixTh) {
        var st = "width:".concat(this.option.scrollBarWidth, "px;\n                 right:-").concat(this.option.scrollBarWidth + (this.option.border.vertical ? 1 : 0), "px;");
        html += "<div class=\"xc-th-cell-scrollbar\" style=\"".concat(st, "\"></div>");
      }

      html += '</th>';
      return html;
    },
    // 生成数据行
    createRow: function createRow() {
      var _this5 = this;

      var html = '';
      this.tdData.forEach(function (row, index) {
        var forbidSel = row.forbidSel ? 'forbid-select' : '';
        html += "<tr row-data='".concat(JSON.stringify(row), "' row-index=\"").concat(index, "\" class='xc-td-row ").concat(forbidSel, "'>");
        var i = 0;

        _this5.thColData.forEach(function (col) {
          html += _this5.createTd(col, index, i);
          i++;
        });

        html += '</tr>';
      });
      return html;
    },
    // 生成单元格
    createTd: function createTd(col, rowIndex, colIndex) {
      var style = rowIndex % 2 === 0 ? this.getTdStyle(this.option.oddStyle, col) : this.getTdStyle(this.option.evenStyle, col);
      var data = this.tdData[rowIndex];
      var editAttr = "class=\"".concat(col.isEdit ? 'xc-td-edit' : '', "\" \n                      row-index=\"").concat(rowIndex, "\" \n                      col-key=\"").concat(col.key || '', "\" ") + (col.bakKey ? 'col-key-bak="' + col.bakKey + '"' : '');
      var html = "<td style=\"".concat(style.td, "\" ").concat(editAttr, ">");

      if (this.option.multiSelect && colIndex === 0) {
        html += this.addChkCell(false, rowIndex);
      }

      var divId = ' id="' + this.option.id + '_' + col.key + (col.bakKey ? '_' + col.bakKey : '') + '_' + rowIndex + '"'; // select列添加id

      var tdCellClass = 'xc-td-cell ' + col.key + (col.bakKey ? ' ' + col.bakKey : '');
      html += '<div style="' + style.cell + '" class="' + tdCellClass + '"' + (col.type === 'select' ? divId : '') + '>';
      var inner = '';

      switch (col.type) {
        case 'no':
          inner = "<span class=\"xc-td-text ".concat(col.key, "\">").concat(rowIndex + 1, "</span>");
          break;

        case 'text':
          inner = this.addText(col, data, style);
          break;

        case 'input':
          inner = this.addInput(col, data, rowIndex);
          break;

        case 'img':
          inner = this.addImg(col, data);
          break;

        case 'switch':
          inner = this.addSwitch(col, data, rowIndex);
          break;

        case 'button':
          inner = this.addBtns(col, rowIndex, data);
          break;

        case 'html':
          inner = data.htmlCode || col.htmlCode;
          break;
      }

      html += inner + '</div></td>';
      return html;
    },
    // 获取单元格样式
    getTdStyle: function getTdStyle(opt, col) {
      var width = col.width || '';

      if (width.indexOf('%') !== -1) {
        var tableW = this.box.width() - this.option.scrollBarWidth - (this.option.multiSelect ? this.option.multiSelColWidth : 0);
        width = Math.floor(tableW * parseInt(width) / 100) - 1;
      } else {
        width = parseInt(width) - 1;
      }

      var style = [];
      style.td = "background-color:".concat(opt.bgColor, ";\n                  width:").concat(width, "px;\n                  border-color:").concat(opt.borderColor, ";\n                  text-align:").concat(col.align || opt.align, ";");
      style.cell = "width:".concat(width, "px;\n                    line-height:").concat(opt.height, ";\n                    color:").concat(col.color || opt.color, ";\n                    font-size:").concat(opt.fontSize, ";\n                    font-weight:").concat(opt.fontBold, ";");
      style.text = "line-height:".concat(opt.height, ";");
      return style;
    },
    // 添加多选单元格
    addChkCell: function addChkCell(isThChk, rowIndex) {
      // console.log(isThChk, rowIndex)
      var style = "left:".concat(-this.option.multiSelColWidth, "px;width:").concat(this.option.multiSelColWidth, "px;");
      var html = '<div style="' + style + '" class="xc-chk-cell">' + '<span class="xc-chk-box ' + (isThChk ? 'xc-th-chk' : 'xc-td-chk') + '" row-index="' + (isThChk ? '' : rowIndex) + '"></span>' + '</div>';
      return html;
    },
    // 添加文字内容
    addText: function addText(col, data, styleObj) {
      var style = styleObj.text;
      var icon = '';
      var img = '';

      if (col.isBreak) {
        style += 'word-wrap:break-word;white-space:pre-line;';
      }

      if (col.preIcon) {
        icon = '<i class="icon iconfont ' + col.preIcon + '"></i>';
      }

      if (col.preImg) {
        img = '<img class="xc-td-text-img ' + col.key + '" src="' + col.preImg + '" />';
      }

      var title = (data[col.key] || '---').toString().replace(/<\/?[^>]*>/g, ' '); // 去除dom标签

      var className = 'xc-td-text ' + col.key + (col.bakKey ? ' ' + col.bakKey : '');
      var inner = '<span title="' + title + '" class="' + className + '" style="' + style + '">' + img + icon + (this.utils.checkNull(data[col.key]) ? data[col.key] : '---') + '</span>';

      if (col.isEdit) {
        inner += '<input class="xc-td-text-input ' + col.key + '" type="text" />';
      }

      return inner;
    },
    // 添加输入框
    addInput: function addInput(col, data, rowIndex) {
      var style = this.utils.checkNull(col.inputWidth) ? 'style="width:' + col.inputWidth + ';" ' : '';
      var value = 'value="' + (data[col.key] || col.defaultVal || '') + '" ';
      var title = 'title="' + (data[col.key] || col.defaultVal || '') + '" ';
      var dataVal = 'row-index="' + rowIndex + '" col-key="' + col.key + '" ';
      var html = '<input type="' + col.inputType + '" ' + value + dataVal + title + style + 'placeholder="' + (col.placeholder || '') + '" class="xc-td-input" />';
      html = (col.preText || '') + html + (col.nextText || '');
      return html;
    },
    // 添加图片内容
    addImg: function addImg(col, data) {
      var src = data[col.key];
      var css = 'width:' + (col.imgW || '') + ';height:' + (col.imgH || '') + ';';
      var attr = 'class="xc-td-img ' + col.key + '"' + 'src="' + src + '"' + 'alt="' + col.label + '"' + 'style="' + css + '"';
      return '<img ' + attr + ' />';
    },
    // 添加开关
    addSwitch: function addSwitch(col, data, rowIndex) {
      var inner = '';
      var attr = 'col-key="' + col.key + '" row-data=\'' + JSON.stringify(data) + '\' row-index=\'' + rowIndex + '\' true-val="' + col.trueVal + '" false-val="' + col.falseVal + '" name="' + col.name + '"';
      var isOpen = data[col.key].toString() === col.trueVal;
      inner += '<div ' + attr + ' class="xc-switch ' + col.key + ' ' + (isOpen ? 'open' : '') + '">' + '<span class="xc-switch-true"> ' + col.trueLabel + '</span>' + '<i class="xc-switch-icon"></i>' + '<span class="xc-switch-false"> ' + col.falseLabel + '</span>' + '</div>';
      return inner;
    },
    // 添加按钮
    addBtns: function addBtns(col, rowIndex, data) {
      var _this6 = this;

      var inner = '';
      col.btns.forEach(function (btn) {
        var attr = 'btn-key="' + btn.key + '" row-index="' + rowIndex + '"';
        var className = 'class="xc-td-btn ' + (data.forbidBtn && data.forbidBtn.indexOf(btn.key) !== -1 ? ' forbid ' : '') + (btn.type === 'link' ? ' link-style ' : '') + col.key + ' ' + btn.key + '"';
        inner += '<button ' + attr + className + '>' + (_this6.utils.checkNull(btn.iconClass) ? '<i class="xc-td-btn-icon ' + btn.iconClass + '"></i>' : '') + btn.label + '</button>';
      });
      return inner;
    },
    // 开关初始化
    switchInit: function switchInit() {
      var vm = this;
      var target = Array.isArray(this.tdTable) ? this.tdTable.filter('.xc-switch.open')[0] : this.tdTable.find('.xc-switch.open');
      target.each(function () {
        vm.switchAction($(this), true);
      });
    },
    //
    // 排版调整=======================================================================
    //
    // 表格或者父级模块由隐藏变为显示时调整表格显示效果
    displayListener: function displayListener() {
      var vm = this;
      var boxs = vm.box.parents();
      var panel = {};
      boxs.each(function () {
        if ($(this).css('display') === 'none' && !vm.utils.checkNull(panel)) {
          panel = $(this);
        } else {
          return false;
        }
      });

      if (vm.box.css('display') === 'none') {
        vm.myTableInterval[vm.option.id + '2'] = setInterval(function () {
          if (vm.box.css('display') !== 'none') {
            vm.adjust();
            clearInterval(vm.myTableInterval[vm.option.id + '2']);
          }
        }, 1);
      } else if (vm.utils.checkNull(panel)) {
        vm.myTableInterval[vm.option.id + '1'] = setInterval(function () {
          if (panel.css('display') !== 'none') {
            vm.adjust();
            clearInterval(vm.myTableInterval[vm.option.id + '1']);
          }
        }, 1);
      } else {
        vm.adjust();
      }

      window.onresize = function () {
        vm.$_reset();
      };
    },
    // 位置和列宽
    adjust: function adjust(resetFlag) {
      if (this.option.heightAuto) {
        this.box.height(this.thTable.outerHeight() + this.tdTable.outerHeight());
      } // 表格总宽度是否固定


      if (this.option.fixTableWidth) {
        this.tdTable.css('width', this.getFixTableWidth());
      } // 使用多选时表格左侧位置调整


      this.setMultiSelLeft(); // 固定表头时调整表身位置及表头列宽

      if (this.option.fixTh && !this.noDataFlag) {
        this.tdBox.css('top', this.thTable.outerHeight());
        this.secondThData.length ? this.ajustColWidthD() : this.ajustColWidthS(); // 重复一遍，防止表头列宽调整后，有某列表头文字从多行变为一行使表头高度发生变化

        if (this.option.heightAuto) {
          this.box.height(this.thTable.outerHeight() + this.tdTable.outerHeight() + (this.isIE11 ? 1 : 0));
        }

        if (this.option.fixTableWidth) {
          this.tdTable.css('width', this.getFixTableWidth());
        }

        this.tdBox.css('top', this.thTable.outerHeight());
        this.secondThData.length ? this.ajustColWidthD() : this.ajustColWidthS();
      } else if (this.noDataFlag) {
        if (this.option.heightAuto) {
          this.box.height(this.thTable.outerHeight() + 100);
        }

        this.tdBox.css('top', this.thTable.outerHeight());
        this.thTable.width(this.getFixTableWidth());
      } // 最右侧一列表头及单元格右边线处理


      this.ajustRightBorder(); // 处理双表头时最左侧一列表头及单元格右边线

      this.ajustLeftBorder(); // 合并单元格

      if (!resetFlag) {
        this.mergeCell();
      } // 开关初始化


      this.switchInit();

      if (resetFlag) {
        (Array.isArray(this.thBox) ? this.thBox.filter('.xc-fix-th')[0] : this.thBox.find('.xc-fix-th')).remove();
        (Array.isArray(this.tdBox) ? this.tdBox.filter('.xc-fix-td')[0] : this.tdBox.find('.xc-fix-td')).remove();
      } // 固定列和绑定事件


      var vm = this;
      setTimeout(function () {
        if (vm.option.fixFirstCol && vm.tdTable.outerWidth() > vm.box.width()) {
          vm.fixCol('left');
        }

        if (vm.option.fixLastCol && vm.tdTable.outerWidth() > vm.box.width()) {
          vm.fixCol('right');
        }

        vm.bindEvent();

        if (vm.isIE11) {
          $('.xc-chk-cell').each(function () {
            $(this).height($(this).parent().outerHeight());
          });
          $('.xc-td>tbody>tr>td').css('border-bottom', 'none');
        }

        if (vm.option.callback.over && !resetFlag) {
          vm.option.callback.over(vm);
        }
      }, 20);
    },
    // 表格宽度固定时计算表格实际宽度
    getFixTableWidth: function getFixTableWidth() {
      var tableW = this.tdBox.width(); // 减去滚动条宽

      if (this.tdTable.height() > this.tdBox.height()) {
        tableW -= this.option.scrollBarWidth;
      } // 减去多选列宽


      if (this.option.multiSelect) {
        tableW -= this.option.multiSelColWidth;
      }

      return tableW;
    },
    // 使用多选时表格左侧位置调整
    setMultiSelLeft: function setMultiSelLeft() {
      if (this.option.multiSelect) {
        this.tdTable.css('margin-left', this.option.multiSelColWidth);
        this.thTable.css('left', this.option.multiSelColWidth);
        this.thTableLeft = this.option.multiSelColWidth;
      }
    },
    // 双表头调整表头列宽
    ajustColWidthD: function ajustColWidthD() {
      var _this7 = this;

      var tds = Array.isArray(this.tdTable) ? this.tdTable.filter('td')[0] : this.tdTable.find('td');
      var tableW = this.getFixTableWidth();

      if (this.noDataFlag) {
        this.thColData.forEach(function (col, i) {
          var width = col.width || '';

          if (width.indexOf('%') !== -1) {
            width = tableW * parseInt(col.width) / 100 + 'px';
          }

          var thClassName = col.key + (col.bakKey ? '.' + col.bakKey : '');
          (Array.isArray(_this7.thHead) ? _this7.thHead.filter('.xc-th-cell.' + thClassName)[0] : _this7.thHead.find('.xc-th-cell.' + thClassName)).width(width);
        });

        if (this.thTable.outerWidth() < tableW) {
          this.thTable.width(tableW);
        }
      } else {
        this.thColData.forEach(function (col, i) {
          var flag = _this7.emptyDataCol(i);

          var thClassName = col.key + (col.bakKey ? '.' + col.bakKey : '');

          if (flag) {
            var w1 = (Array.isArray(tds.eq(i)) ? tds.eq(i).filter('.xc-td-cell')[0] : tds.eq(i).find('.xc-td-cell')).outerWidth();
            var w2 = (Array.isArray(_this7.thHead) ? _this7.thHead.filter('.xc-th-th.' + thClassName)[0] : _this7.thHead.find('.xc-th-th.' + thClassName)).outerWidth();
            var w = w1;

            if (!_this7.utils.checkNull(col.width) && col.type !== 'button') {
              w = w2 > w1 ? w2 : w1;
              col.width = w;
            }

            (Array.isArray(_this7.thHead) ? _this7.thHead.filter('.xc-th-cell.' + thClassName)[0] : _this7.thHead.find('.xc-th-cell.' + thClassName)).css('width', w + 'px');
          } else {
            var thw = (Array.isArray(_this7.thHead) ? _this7.thHead.filter('.xc-th-th.' + thClassName)[0] : _this7.thHead.find('.xc-th-th.' + thClassName)).width();
            thw = thw > 72 ? thw : 72;
            (Array.isArray(tds.eq(i)) ? tds.eq(i).filter('.xc-td-cell')[0] : tds.eq(i).find('.xc-td-cell')).css('width', thw + 'px');
            tds.eq(i).css('width', thw + 'px');
            (Array.isArray(_this7.thHead) ? _this7.thHead.filter('.xc-th-cell.' + thClassName)[0] : _this7.thHead.find('.xc-th-cell.' + thClassName)).css('width', thw + 'px');
            (Array.isArray(_this7.thHead) ? _this7.thHead.filter('.xc-th-th.' + thClassName)[0] : _this7.thHead.find('.xc-th-th.' + thClassName)).css('width', thw + 'px');
          }
        });
        this.thTable.width(this.tdTable.width());
      }
    },
    // 单表头调整表头列宽
    ajustColWidthS: function ajustColWidthS() {
      var _this8 = this;

      var tds = Array.isArray(this.tdTable) ? this.tdTable.filter('td')[0] : this.tdTable.find('td');
      var tableW = this.getFixTableWidth();

      if (this.noDataFlag) {
        this.thColData.forEach(function (col, i) {
          var width = col.width || '';

          if (width.indexOf('%') !== -1) {
            width = tableW * parseInt(col.width) / 100 + 'px';
          }

          var thClassName = col.key + (col.bakKey ? '.' + col.bakKey : '');
          (Array.isArray(_this8.thHead) ? _this8.thHead.filter('.xc-th-cell.' + thClassName)[0] : _this8.thHead.find('.xc-th-cell.' + thClassName)).width(width);
        });

        if (this.thTable.outerWidth() < tableW) {
          this.thTable.width(tableW);
        }
      } else {
        this.thColData.forEach(function (col, i) {
          var flag = _this8.emptyDataCol(i);

          var thClassName = col.key + (col.bakKey ? '.' + col.bakKey : '');

          if (flag) {
            var w1 = (Array.isArray(tds.eq(i)) ? tds.eq(i).filter('.xc-td-cell')[0] : tds.eq(i).find('.xc-td-cell')).outerWidth();
            var w2 = (Array.isArray(_this8.thHead) ? _this8.thHead.filter('.xc-th-th.' + thClassName)[0] : _this8.thHead.find('.xc-th-th.' + thClassName)).outerWidth();
            var w = w1;

            if (!_this8.utils.checkNull(col.width) && col.type !== 'button') {
              w = w2 > w1 ? w2 : w1;
              (Array.isArray(tds.eq(i)) ? tds.eq(i).filter('.xc-td-cell')[0] : tds.eq(i).find('.xc-td-cell')).css('width', w + 'px');
              tds.eq(i).css('width', w + 'px');
              col.width = w + 'px';
            }

            (Array.isArray(_this8.thHead) ? _this8.thHead.filter('.xc-th-th.' + thClassName)[0] : _this8.thHead.find('.xc-th-th.' + thClassName)).css('width', w + 'px');
            (Array.isArray(_this8.thHead) ? _this8.thHead.filter('.xc-th-cell.' + thClassName)[0] : _this8.thHead.find('.xc-th-cell.' + thClassName)).css('width', w + 'px');
          } else {
            var thw = (Array.isArray(_this8.thHead) ? _this8.thHead.filter('.xc-th-th.' + thClassName)[0] : _this8.thHead.find('.xc-th-th.' + thClassName)).outerWidth();
            (Array.isArray(tds.eq(i)) ? tds.eq(i).filter('.xc-td-cell')[0] : tds.eq(i).find('.xc-td-cell')).css('width', thw + 'px');
            tds.eq(i).css('width', thw + 'px');
            (Array.isArray(_this8.thHead) ? _this8.thHead.filter('.xc-th-cell.' + thClassName)[0] : _this8.thHead.find('.xc-th-cell.' + thClassName)).css('width', thw + 'px');
            col.width = thw + 'px';
          }
        });
        this.thTable.width(this.tdTable.width());
      }
    },
    // 最右侧一列表头及单元格右边线处理
    ajustRightBorder: function ajustRightBorder() {
      var tds = Array.isArray(this.tdTable) ? this.tdTable.filter('td')[0] : this.tdTable.find('td');

      if (this.tdTable.height() <= this.tdBox.height()) {
        for (var j = 1; j <= this.rowNum; j++) {
          tds.eq(j * this.colNum - 1).css('border-right', 'none');
        }

        (Array.isArray(this.thHead) ? this.thHead.filter('.xc-th-th.' + this.thData[this.thData.length - 1].key)[0] : this.thHead.find('.xc-th-th.' + this.thData[this.thData.length - 1].key)).css('border-right', 'none');
        (Array.isArray(this.thHead) ? this.thHead.filter('.xc-th-th.' + this.thColData[this.colNum - 1].key)[0] : this.thHead.find('.xc-th-th.' + this.thColData[this.colNum - 1].key)).css('border-right', 'none');
        $('.xc-th-cell-scrollbar').css('display', 'none');
      } else {
        // for (let j = 1; j <= this.rowNum; j++) {
        //   tds.eq(j * this.colNum - 1).css('border-right', '1px solid #ebeef5')
        // }
        // this.thHead.find('.xc-th-th.' + this.thData[this.thData.length - 1].key).css('border-right', '1px solid #ebeef5')
        // this.thHead.find('.xc-th-th.' + this.thColData[this.colNum - 1].key).css('border-right', '1px solid #ebeef5')
        $('.xc-th-cell-scrollbar').height(this.thHead.height());
      }
    },
    // 处理双表头时最左侧一列表头及单元格右边线
    ajustLeftBorder: function ajustLeftBorder() {
      if (this.secondThData.length) {
        $('.xc-th-th .xc-chk-cell').height(this.thHead.height()); // this.thHead.find('.xc-th-th.' + this.secondThData[0].key).css('border-left', '1px solid #ebeef5')
      }
    },
    // 判断列宽未设置且该列无数据
    emptyDataCol: function emptyDataCol(index) {
      var _this9 = this;

      var th = this.thColData[index];
      var colStr = th.key;
      var type = th.type;

      if (type !== 'text') {
        return true;
      }

      var flag1 = this.utils.checkNull(th.width);
      var flag2 = false;
      this.tdData.forEach(function (td) {
        if (_this9.utils.checkNull(td[colStr])) {
          flag2 = true;
        }
      });
      return flag1 || flag2;
    },
    // 合并单元格
    mergeCell: function mergeCell() {
      for (var col = 0; col < this.colNum; col++) {
        if (!this.thColData[col].mergeCell) {
          continue;
        }

        var rowSpanRow = 0;

        for (var row = 1; row < this.rowNum; row++) {
          var rowSpanTd = (Array.isArray((Array.isArray(this.tdTable) ? this.tdTable.filter('tr')[0] : this.tdTable.find('tr')).eq(rowSpanRow)) ? (Array.isArray(this.tdTable) ? this.tdTable.filter('tr')[0] : this.tdTable.find('tr')).eq(rowSpanRow).filter('td')[0] : (Array.isArray(this.tdTable) ? this.tdTable.filter('tr')[0] : this.tdTable.find('tr')).eq(rowSpanRow).find('td')).eq(col);
          var targetTd = (Array.isArray((Array.isArray(this.tdTable) ? this.tdTable.filter('tr')[0] : this.tdTable.find('tr')).eq(row)) ? (Array.isArray(this.tdTable) ? this.tdTable.filter('tr')[0] : this.tdTable.find('tr')).eq(row).filter('td')[0] : (Array.isArray(this.tdTable) ? this.tdTable.filter('tr')[0] : this.tdTable.find('tr')).eq(row).find('td')).eq(col);
          var rowSpanCell = Array.isArray(rowSpanTd) ? rowSpanTd.filter('.xc-td-cell')[0] : rowSpanTd.find('.xc-td-cell');
          var targetCell = Array.isArray(targetTd) ? targetTd.filter('.xc-td-cell')[0] : targetTd.find('.xc-td-cell');
          var rowSpanText = (Array.isArray(rowSpanTd) ? rowSpanTd.filter('.xc-td-text')[0] : rowSpanTd.find('.xc-td-text')).html();
          var targetText = (Array.isArray(targetTd) ? targetTd.filter('.xc-td-text')[0] : targetTd.find('.xc-td-text')).html();
          var rowSpanHeight = rowSpanTd.outerHeight();
          var targetHeight = targetTd.outerHeight();

          if (targetText === rowSpanText) {
            targetTd.css({
              'border-bottom-color': 'transparent',
              'background': 'none'
            });
            targetCell.css('display', 'none');
            var h = 0;
            var mergeDiv = null;

            if ((Array.isArray(rowSpanTd) ? rowSpanTd.filter('.xc-td-merge')[0] : rowSpanTd.find('.xc-td-merge')).length) {
              mergeDiv = Array.isArray(rowSpanTd) ? rowSpanTd.filter('.xc-td-merge')[0] : rowSpanTd.find('.xc-td-merge');
              h = mergeDiv.outerHeight() + targetHeight + 'px';
            } else {
              var html = '<div class="xc-td-merge">' + rowSpanCell.html() + '</div>';
              rowSpanTd.append(html).css({
                'border-bottom-color': 'transparent',
                'background': 'none'
              });
              rowSpanCell.css('display', 'none');
              mergeDiv = Array.isArray(rowSpanTd) ? rowSpanTd.filter('.xc-td-merge')[0] : rowSpanTd.find('.xc-td-merge');
              h = rowSpanHeight + targetHeight + 'px';
            }

            mergeDiv.css({
              'height': h,
              'line-height': h
            });
          } else {
            rowSpanRow = row;
          }
        }
      }
    },
    // 固定列
    fixCol: function fixCol(pos) {
      if (this.option.fixTh) {
        this.copyTh(pos);
      }

      this.copyTd(pos);
    },
    // 复制固定表头
    copyTh: function copyTh(pos) {
      var tartget = pos === 'left' ? Array.isArray(this.thTable) ? this.thTable.filter('th:first')[0] : this.thTable.find('th:first') : Array.isArray(this.thTable) ? this.thTable.filter('th:last')[0] : this.thTable.find('th:last');
      var html = tartget.html();
      var style = tartget.attr('style') + "height:".concat(tartget.outerHeight(), "px;");
      var styleL = this.option.multiSelect ? "".concat(pos, ":").concat(this.option.multiSelColWidth - 1, "px;") : "".concat(pos, ":-1px;");
      var styleR = (Array.isArray(this.thTable) ? this.thTable.filter('.xc-th-cell-scrollbar')[0] : this.thTable.find('.xc-th-cell-scrollbar')).css('display') === 'none' ? "".concat(pos, ":0px;") : "".concat(pos, ":").concat(this.option.scrollBarWidth, "px;");
      style += pos === 'left' ? styleL : styleR;
      html = "<div class=\"xc-fix-th ".concat(pos === 'left' ? 'first' : 'last', "\" style=\"").concat(style, "\">").concat(html, "</div>");
      this.thBox.append(html);
    },
    // 复制固定单元格
    copyTd: function copyTd(pos) {
      var tableHtml = this.tdTable.prop('outerHTML');
      var firstW = (Array.isArray(this.tdTable) ? this.tdTable.filter('td')[0] : this.tdTable.find('td')).eq(0).width();
      var lastW = (Array.isArray(this.box) ? this.box.filter('.xc-fix-th.last')[0] : this.box.find('.xc-fix-th.last')).outerWidth();
      var styleL = 'width:' + (this.option.multiSelect ? firstW + this.option.multiSelColWidth + 2 + 'px;' : firstW + 2 + 'px;');
      var styleR = 'width:' + lastW + 'px;';
      var style = pos + ':0px;' + 'height:' + this.tdTable.outerHeight() + 'px;' + (pos === 'left' ? styleL : styleR); // console.log(style)

      var html = '<div class="xc-fix-td ' + (pos === 'left' ? 'first' : 'last') + '" style="' + style + '">' + tableHtml + '</div>';
      this.tdBox.append(html);
      this.fixFirst = Array.isArray(this.box) ? this.box.filter('.xc-fix-td.first')[0] : this.box.find('.xc-fix-td.first');
      this.fixLast = Array.isArray(this.box) ? this.box.filter('.xc-fix-td.last')[0] : this.box.find('.xc-fix-td.last');
    },
    //
    // 绑定事件=======================================================================
    //
    bindEvent: function bindEvent() {
      this.onSelTableData();
      this.onSort();
      this.onClickTableBtn();
      this.onEditText();
      this.onSwitch();
      this.onInputBlur();
      this.scrollListener();
    },
    // 添加下拉框
    addSelect: function addSelect(col, data, rowIndex) {
      var _this10 = this;

      var vm = this;
      var opt = this.utils.checkNull(col.selectWidth) ? {
        inputStyle: {
          width: col.selectWidth
        }
      } : {};
      var id = this.option.id + '_' + col.key + (col.bakKey ? '_' + col.bakKey : '') + '_' + rowIndex;
      opt.id = id;
      opt.isMultiple = col.isMultiple;
      opt.showClear = col.showClear;
      opt.showTree = col.showTree;
      opt.showSearch = col.showSearch;
      opt.preText = col.preText;
      opt.placeholder = col.placeholder;
      opt.callback = {
        selectOver: function selectOver(data, selectObj) {
          var nv = vm.utils.deepCopy(vm.tdData[rowIndex]);
          var arr = [];
          data.forEach(function (a) {
            arr.push(a.value);
          });
          nv[col.key] = arr.join(',');
          nv[col.key + '_info'] = vm.utils.deepCopy(data);
          vm.tdData[rowIndex] = vm.utils.deepCopy(nv);
          var param = {
            key: col.key,
            data: vm.tdData[rowIndex],
            rowIndex: rowIndex
          };

          if (vm.option.callback.selectOver) {
            vm.option.callback.selectOver(param, vm, selectObj);
          }
        }
      };
      var arr = (data[col.key] || col.defaultVal || '').split(',');
      var opts = [];

      if (arr.length) {
        col.options.forEach(function (item) {
          var obj = _this10.utils.deepCopy(item);

          obj.selected = arr.indexOf(item.value) !== -1;
          opts.push(obj);
        });
      }

      this.selectData[id] = new AjSelect(opt);
      this.selectData[id].init(opts);
    },
    // 多选
    onSelTableData: function onSelTableData() {
      var vm = this;
      var thChk = Array.isArray(vm.box) ? vm.box.filter('.xc-chk-box.xc-th-chk')[0] : vm.box.find('.xc-chk-box.xc-th-chk');
      var tdChkAll = Array.isArray(vm.box) ? vm.box.filter('.xc-td-chk')[0] : vm.box.find('.xc-td-chk');
      var tdChk = (Array.isArray(vm.tdTable) ? vm.tdTable.filter('tr .xc-td-chk')[0] : vm.tdTable.find('tr .xc-td-chk')).not('tr.forbid-select .xc-td-chk');
      var tdChkFirst = (Array.isArray(vm.box) ? vm.box.filter('.xc-fix-td.first tr .xc-td-chk')[0] : vm.box.find('.xc-fix-td.first tr .xc-td-chk')).not('tr.forbid-select .xc-td-chk');
      var dataRow = Array.isArray(vm.tdTable) ? vm.tdTable.filter('.xc-td-row')[0] : vm.tdTable.find('.xc-td-row');
      var dataRowFix = Array.isArray(vm.box) ? vm.box.filter('.xc-fix-td .xc-td-row')[0] : vm.box.find('.xc-fix-td .xc-td-row');
      tdChkAll.unbind('click');
      thChk.unbind('click').click(function () {
        if (thChk.hasClass('checked')) {
          thChk.removeClass('checked');
          dataRow.removeClass('checked-row');
          dataRowFix.removeClass('checked-row');

          if (tdChkFirst.size()) {
            tdChkFirst.removeClass('checked');
          } else {
            tdChk.removeClass('checked');
          }
        } else {
          thChk.removeClass('indeterminate').addClass('checked');
          dataRow.addClass('checked-row');
          dataRowFix.addClass('checked-row');

          if (tdChkFirst.size()) {
            tdChkFirst.addClass('checked');
          } else {
            tdChk.addClass('checked');
          }
        }

        if (tdChkFirst.size()) {
          if (vm.option.callback.multiSelect) {
            vm.option.callback.multiSelect(vm.packData(tdChkFirst), vm);
          }
        } else {
          if (vm.option.callback.multiSelect) {
            vm.option.callback.multiSelect(vm.packData(tdChk), vm);
          }
        }
      });
      tdChk.unbind('click').click(function () {
        vm.tdChkClick($(this), vm.tdTable, thChk, tdChk);
      });
      tdChkFirst.unbind('click').click(function () {
        vm.tdChkClick($(this), vm.fixFirst, thChk, tdChkFirst);
      });
    },
    tdChkClick: function tdChkClick(target, box, thChk, chk) {
      target.toggleClass('checked');
      var index = target.attr('row-index');
      var tr = (Array.isArray(this.tdTable) ? this.tdTable.filter('.xc-td-row')[0] : this.tdTable.find('.xc-td-row')).eq(index);
      var trFix = (Array.isArray(this.box) ? this.box.filter('.xc-fix-td .xc-td-row')[0] : this.box.find('.xc-fix-td .xc-td-row')).eq(index);
      tr.toggleClass('checked-row');
      trFix.toggleClass('checked-row');
      var num = (Array.isArray(box) ? box.filter('.xc-td-chk.checked')[0] : box.find('.xc-td-chk.checked')).size();

      if (num === 0) {
        thChk.removeClass('checked').removeClass('indeterminate');
      } else if (num === this.rowNum) {
        thChk.addClass('checked').removeClass('indeterminate');
      } else {
        thChk.addClass('indeterminate').removeClass('checked');
      }

      if (this.option.callback.multiSelect) {
        this.option.callback.multiSelect(this.packData(chk), this);
      }
    },
    packData: function packData(chk) {
      var data = [];

      for (var i = 0; i < chk.size(); i++) {
        if (chk.eq(i).hasClass('checked')) {
          var index = chk.eq(i).attr('row-index');
          data.push(this.tdData[index]);
        }
      }

      return data;
    },
    // 排序
    onSort: function onSort() {
      var vm = this;
      var target = Array.isArray(vm.box) ? vm.box.filter('.xc-sort-th')[0] : vm.box.find('.xc-sort-th');
      target.unbind('click').click(function () {
        var btn = $(this);
        var obj = {};
        obj.key = btn.attr('sort-key');

        if (btn.hasClass('asc')) {
          btn.removeClass('asc').addClass('desc');
          obj.type = 'desc';
        } else if (btn.hasClass('desc')) {
          btn.removeClass('desc').addClass('asc');
          obj.type = 'asc';
        } else {
          target.removeClass('asc').removeClass('desc');
          btn.addClass('desc');
          obj.type = 'desc';
        }

        if (vm.option.callback.sort) {
          vm.option.callback.sort(obj, vm);
        }
      });
    },
    // 按钮点击事件
    onClickTableBtn: function onClickTableBtn() {
      var vm = this;
      var target = (Array.isArray(vm.tdBox) ? vm.tdBox.filter('.xc-td-btn')[0] : vm.tdBox.find('.xc-td-btn')).not('.xc-td-btn.forbid');
      target.unbind('click').click(function () {
        var btn = $(this);
        var index = btn.attr('row-index');
        var obj = {
          key: btn.attr('btn-key'),
          data: vm.tdData[index],
          rowIndex: index
        };

        if (vm.option.callback.btnClick) {
          vm.option.callback.btnClick(obj, vm, btn);
        }
      });
    },
    // 编辑文字结束
    onEditText: function onEditText() {
      var vm = this;
      var target = Array.isArray(vm.tdBox) ? vm.tdBox.filter('.xc-td-edit')[0] : vm.tdBox.find('.xc-td-edit');
      target.unbind('dblclick').dblclick(function () {
        var cell = $(this);
        var index = cell.attr('row-index');
        var ov = Array.isArray(cell) ? cell.filter('.xc-td-text')[0] : cell.find('.xc-td-text');
        var nv = Array.isArray(cell) ? cell.filter('.xc-td-text-input')[0] : cell.find('.xc-td-text-input');
        ov.css('display', 'none');
        nv.val(ov.html()).css('display', 'block').focus();
        nv.unbind('blur').blur(function () {
          ov.html(nv.val()).css('display', '');
          nv.css('display', 'none');
          var obj = {
            editKey: cell.attr('col-key'),
            oldData: vm.thColData[index],
            newValue: nv.val()
          };

          if (vm.option.callback.editOver) {
            vm.option.callback.editOver(obj, vm);
          }
        });
      });
    },
    // 开关
    onSwitch: function onSwitch() {
      var vm = this;
      var target = Array.isArray(vm.tdTable) ? vm.tdTable.filter('.xc-switch')[0] : vm.tdTable.find('.xc-switch');
      target.unbind('click').click(function () {
        var btn = $(this);
        var obj = {
          name: btn.attr('name'),
          editKey: btn.attr('col-key'),
          oldData: btn.attr('row-data'),
          rowIndex: btn.attr('row-index')
        };
        btn.toggleClass('open');

        if (btn.hasClass('open')) {
          vm.switchAction(btn, true);
          obj.newValue = btn.attr('true-val');
        } else {
          vm.switchAction(btn, false);
          obj.newValue = btn.attr('false-val');
        }

        var nv = JSON.parse(btn.attr('row-data'));
        nv[btn.attr('col-key')] = obj.newValue;
        vm.tdData[btn.attr('row-index')] = this.utils.deepCopy(nv);

        if (vm.option.callback.switchOver) {
          vm.option.callback.switchOver(obj, vm);
        }
      });
    },
    // 开关滑块动画
    switchAction: function switchAction(target, flag) {
      var gap = this.option.switchSet.padding;
      var speed = this.option.switchSet.speed;
      var easing = this.option.switchSet.easing;
      var ball = Array.isArray(target) ? target.filter('.xc-switch-icon')[0] : target.find('.xc-switch-icon');

      if (flag) {
        var s = target.outerWidth() - ball.outerWidth() - gap;
        ball.animate({
          left: s + 'px'
        }, speed, easing);
      } else {
        ball.animate({
          left: gap + 'px'
        }, speed, easing);
      }
    },
    // 输入框失去焦点事件
    onInputBlur: function onInputBlur() {
      var vm = this;
      var target = Array.isArray(vm.tdTable) ? vm.tdTable.filter('.xc-td-input')[0] : vm.tdTable.find('.xc-td-input');
      target.unbind('blur').blur(function () {
        var val = $(this).val();
        var rowIndex = $(this).attr('row-index');
        var key = $(this).attr('col-key');
        vm.tdData[rowIndex][key] = val;

        if (vm.option.callback.inputBlur) {
          var param = {
            key: key,
            data: vm.tdData[rowIndex],
            rowIndex: rowIndex
          };
          vm.option.callback.inputBlur(param, vm);
        }
      });
    },
    // 表身横向滚动监听
    scrollListener: function scrollListener() {
      var vm = this;
      vm.tdBox.scroll(function () {
        vm.thTable.css('left', vm.thTableLeft - vm.tdBox.scrollLeft());

        if (vm.fixFirst.length) {
          vm.fixFirst.css('left', vm.tdBox.scrollLeft());

          if (vm.tdBox.scrollLeft()) {
            vm.fixFirst.css('box-shadow', '0 0 10px rgba(0,0,0,.12)');
            (Array.isArray(vm.box) ? vm.box.filter('.xc-fix-th.first')[0] : vm.box.find('.xc-fix-th.first')).css('box-shadow', '0 0 10px rgba(0,0,0,.12)');
          } else {
            vm.fixFirst.css('box-shadow', 'none');
            (Array.isArray(vm.box) ? vm.box.filter('.xc-fix-th.first')[0] : vm.box.find('.xc-fix-th.first')).css('box-shadow', 'none');
          }
        }

        if (vm.fixLast.length) {
          vm.fixLast.css('right', -vm.tdBox.scrollLeft());
          var overflow = vm.tdTable.outerWidth() - vm.tdBox.innerWidth();
          overflow += vm.option.multiSelect ? vm.option.multiSelColWidth : 0;
          overflow += (Array.isArray(vm.thTable) ? vm.thTable.filter('.xc-th-cell-scrollbar')[0] : vm.thTable.find('.xc-th-cell-scrollbar')).css('display') === 'none' ? 0 : vm.option.scrollBarWidth;

          if (vm.tdBox.scrollLeft() !== overflow) {
            vm.fixLast.css('box-shadow', '0 0 10px rgba(0,0,0,.12)');
            (Array.isArray(vm.box) ? vm.box.filter('.xc-fix-th.last')[0] : vm.box.find('.xc-fix-th.last')).css('box-shadow', '0 0 10px rgba(0,0,0,.12)');
          } else {
            vm.fixLast.css('box-shadow', 'none');
            (Array.isArray(vm.box) ? vm.box.filter('.xc-fix-th.last')[0] : vm.box.find('.xc-fix-th.last')).css('box-shadow', 'none');
          }
        }
      });
    },
    //
    // 外部调用方法=======================================================================
    //
    // 设置行选中
    $_reviewMultiSelect: function $_reviewMultiSelect(indexList) {
      var thChk = Array.isArray(this.box) ? this.box.filter('.xc-chk-box.xc-th-chk')[0] : this.box.find('.xc-chk-box.xc-th-chk');
      var tdChk = Array.isArray(this.tdTable) ? this.tdTable.filter('.xc-td-chk')[0] : this.tdTable.find('.xc-td-chk');
      var tdChkFirst = Array.isArray(this.box) ? this.box.filter('.xc-fix-td.first .xc-td-chk')[0] : this.box.find('.xc-fix-td.first .xc-td-chk');
      indexList.forEach(function (index) {
        tdChk.eq(index).addClass('checked');

        if (tdChkFirst.length) {
          tdChkFirst.eq(index).addClass('checked');
        }
      });

      if (tdChkFirst.length) {
        var num2 = (Array.isArray(this.fixFirst) ? this.fixFirst.filter('.xc-td-chk.checked')[0] : this.fixFirst.find('.xc-td-chk.checked')).size();

        if (num2 === 0) {
          thChk.removeClass('checked').removeClass('indeterminate');
        } else if (num2 === this.rowNum) {
          thChk.addClass('checked').removeClass('indeterminate');
        } else {
          thChk.addClass('indeterminate').removeClass('checked');
        }
      } else {
        var num1 = (Array.isArray(this.tdTable) ? this.tdTable.filter('.xc-td-chk.checked')[0] : this.tdTable.find('.xc-td-chk.checked')).size();

        if (num1 === 0) {
          thChk.removeClass('checked').removeClass('indeterminate');
        } else if (num1 === this.rowNum) {
          thChk.addClass('checked').removeClass('indeterminate');
        } else {
          thChk.addClass('indeterminate').removeClass('checked');
        }
      }
    },
    // 重新加载数据
    $_setData: function $_setData(tdData) {
      this.init(this.thData, tdData);

      if (this.option.callback.setData) {
        this.option.callback.setData(this);
      }
    },
    // 获取当前表格数据
    $_getData: function $_getData() {
      return this.utils.deepCopy(this.tdData);
    },
    // 重新调整列宽
    $_reset: function $_reset() {
      this.adjust(true);
    },
    // 添加空白行
    $_addBlankRow: function $_addBlankRow(flag, rowIndex, content) {
      if (rowIndex >= this.tdData.length) {
        return {
          status: 'error',
          msg: '传入行数不可大于表格显示行数'
        };
      }

      if (rowIndex < 0) {
        return {
          status: 'error',
          msg: '传入行数不可小于0'
        };
      }

      var trId = this.option.id + 'BlankTr_' + rowIndex;

      if (!flag) {
        $('#' + trId).remove();
        return {
          status: 'success',
          msg: '删除空白行成功'
        };
      }

      var vm = this;
      var targetId = false;
      this.tdRows.each(function () {
        var row = $(this);

        if (row.attr('row-index').toString() === rowIndex.toString()) {
          var style = '';

          if (vm.option.multiSelect) {
            style = 'margin-left:-' + vm.option.multiSelColWidth + 'px;' + 'width:' + (vm.tdBody.width() + vm.option.multiSelColWidth) + 'px;';
          }

          targetId = vm.option.id + 'BlankDiv_' + rowIndex;
          var html = '<tr id="' + trId + '" class="xc-tr-blank">' + '<td colspan="' + vm.colNum + '" class="xc-tr-blank-td">' + '<div id="' + targetId + '" class="xc-tr-blank-div" style="' + style + '">' + (content || '') + '</div>' + '</td>' + '</tr>';
          row.after(html);
        }
      });
      return {
        status: 'success',
        msg: '添加空白行成功',
        targetId: targetId
      };
    },
    // 添加行
    $_addRow: function $_addRow(dataObj, rowIndex) {
      var obj = this.utils.deepCopy(dataObj);
      var index = this.utils.checkNull(rowIndex) && rowIndex >= 0 && rowIndex < this.tdData.length ? rowIndex : this.tdData.length;
      this.tdData.splice(index, 0, obj);
      this.init(this.thData, this.tdData);

      if (this.option.callback.addOver) {
        this.option.callback.addOver(this);
      }
    },
    // 删除行
    $_deleteRow: function $_deleteRow(rowIndex) {
      if (rowIndex >= this.tdData.length) {
        return {
          status: 'error',
          msg: '传入行数不可大于表格显示行数'
        };
      }

      if (rowIndex < 0) {
        return {
          status: 'error',
          msg: '传入行数不可小于0'
        };
      }

      this.tdData.splice(rowIndex, 1);
      this.init(this.thData, this.tdData);

      if (this.option.callback.deleteOver) {
        this.option.callback.deleteOver(this);
      }
    }
  }; // 工具方法

  newObj.utils = {
    // 获取滚动条宽度
    getScrollWidth: function getScrollWidth() {
      var oDiv = document.createElement('DIV');
      oDiv.style.cssText = 'position:absolute; top:-1000px; width:100px; height:100px; overflow:hidden;';
      var noScroll = document.body.appendChild(oDiv).clientWidth;
      oDiv.style.overflowY = 'scroll';
      var scroll = oDiv.clientWidth;
      document.body.removeChild(oDiv);
      return noScroll - scroll;
    },
    // 合并
    mergeObjectDeep: function mergeObjectDeep(defaultObj, originalObj) {
      var newObj = this.deepCopy(defaultObj);

      for (var i in defaultObj) {
        var dv = defaultObj[i];
        var ov = originalObj[i];

        if (this.isObjectObject(dv) && this.checkNull(ov)) {
          newObj[i] = this.mergeObjectDeep(dv, ov);
        } else {
          if (this.checkNull(ov)) {
            newObj[i] = this.deepCopy(ov);
          }
        }
      }

      return newObj;
    },
    // 深拷贝
    deepCopy: function deepCopy(source) {
      var _this11 = this;

      var sourceCopy = null;

      if (this.isObjectObject(source)) {
        sourceCopy = {};

        for (var item in source) {
          sourceCopy[item] = this.deepCopy(source[item]);
        }
      } else if (this.isArray(source)) {
        sourceCopy = [];
        source.forEach(function (item) {
          sourceCopy.push(_this11.deepCopy(item));
        });
      } else {
        return source;
      }

      return sourceCopy;
    },
    // 类型判断
    isArray: function isArray(obj) {
      return Array.isArray(obj) || Object.prototype.toString.call(obj) === '[object Array]';
    },
    isObject: function isObject(obj) {
      var type = _typeof(obj);

      return (type === 'function' || type === 'object') && !!obj;
    },
    isObjectObject: function isObjectObject(val) {
      return Object.prototype.toString.call(val) === '[object Object]';
    },
    isDate: function isDate(val) {
      return Object.prototype.toString.call(val) === '[object Date]';
    },
    isFunction: function isFunction(val) {
      return Object.prototype.toString.call(val) === '[object Function]';
    },
    isString: function isString(val) {
      return Object.prototype.toString.call(val) === '[object String]';
    },
    isNumber: function isNumber(val) {
      return Object.prototype.toString.call(val) === '[object Number]';
    },
    // 空值校验
    checkNull: function checkNull(obj) {
      if (obj === null || obj === '' || obj === undefined) {
        return false;
      } else if (JSON.stringify(obj) === '{}') {
        var a = false;

        for (var i in obj) {
          a = true;
        }

        return a;
      } else if ((this.isString(obj) || this.isArray(obj)) && obj.length === 0) {
        return false;
      } else {
        return true;
      }
    }
  }; // 默认设置

  newObj.Opt = {
    id: '',
    fixTableWidth: true,
    // 表格总宽度，自适应或者等于显示区域
    noTh: false,
    // 不使用表头
    fixTh: true,
    // 表头固定
    heightAuto: false,
    // 表格高度自适应
    fixFirstCol: false,
    // 固定首列
    fixLastCol: false,
    // 固定尾列
    multiSelect: false,
    // 可多选
    multiSelColWidth: 40,
    // 多选列宽
    sortKey: '',
    // 排序字段名称
    sortType: '',
    // 排序方式，asc为升序，desc为降序
    noDataText: '暂无数据',
    // 无数据时表身区域的显示内容，支持自定义html片断
    stripe: true,
    // 是否隔行变色
    highlightHover: true,
    // 行是否滑上变色
    border: {
      horizontal: true,
      // 是否带有横向边框
      vertical: true // 是否带有纵向边框

    },
    // 开关样式及效果
    switchSet: {
      padding: 4,
      // 滑块距边框距离
      speed: 300,
      // 滑块滑动速度
      easing: 'swing' // 滑块滑动方式

    },
    // 表头样式
    thStyle: {
      bgColor: '',
      // 背景色
      height: '',
      // 高度
      color: '',
      // 文字颜色
      fontSize: '',
      // 文字字号
      fontBold: '',
      // 文字粗细
      align: '',
      // 文字对齐方式
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
      sort: null,
      // 点击排序
      multiSelect: null,
      // 多选行
      editOver: null,
      // 文字单元格双击修改内容后，输入框失去焦点事件
      btnClick: null,
      // 按钮点击事件
      switchOver: null,
      // 开关点击事件
      inputBlur: null,
      // 输入框失去焦点事件
      selectOver: null,
      // 下拉选值改变事件
      setData: null,
      // 表格赋值后
      deleteOver: null,
      // 删除某一行数据后
      addOver: null,
      // 添加一行数据后
      over: null // 表格加载完成

    }
  };
  return newObj;
}; //
// 导出=======================================================================
//


window.AjTable = AjTable;