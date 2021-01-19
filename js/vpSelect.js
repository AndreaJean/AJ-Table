function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

var AjSelect = function AjSelect(options) {
  var newObj = {
    option: {},
    // 插件配置项
    dataArr: [],
    // 下拉框的选项数据
    selectData: [],
    // 选中项的完整数据
    selectVal: [],
    // 选中项的值
    selectText: '',
    // 选中项在输入框中显示的文字
    searchkey: '',
    // 搜索关键字
    box: null,
    // 生成插件的容器div
    bodyStyle: {},
    // 选项面板的自定义样式
    scrollBarWidth: 0,
    // 滚动条宽度
    treeObj: {},
    // 存放树对象
    // 初始化
    init: function init(dataArr) {
      this.option = this.utils.mergeObjectDeep(this.Opt, options);
      this.dataArr = this.utils.deepCopy(dataArr); // console.log('下拉菜单数据', this.option, this.dataArr)

      this.box = $('#' + this.option.id);
      this.box.html('');
      this.initSelect();
      this.createHtml();

      if (this.option.callback.dataOver) {
        this.option.callback.dataOver(this.utils.deepCopy(this.selectData), this);
      }
    },
    // 初始化时的选中数据整理
    initSelect: function initSelect() {
      var _this = this;

      this.selectData = [];
      this.selectVal = [];
      var arr = [];
      this.dataArr.forEach(function (item) {
        if (item.selected) {
          _this.selectData.push(item);

          _this.selectVal.push(item.value);

          arr.push(item.label);
        }
      });
      this.selectText = arr.join('，');
    },
    // 生成html
    createHtml: function createHtml() {
      var html = this.createHeader();
      this.box.append(html);
      this.content = Array.isArray(this.box) ? this.box.filter('.vp-select-content')[0] : this.box.find('.vp-select-content');
      this.container = Array.isArray(this.box) ? this.box.filter('.vp-select-container')[0] : this.box.find('.vp-select-container');
      this.header = Array.isArray(this.box) ? this.box.filter('.vp-select-header')[0] : this.box.find('.vp-select-header');
      this.input = Array.isArray(this.box) ? this.box.filter('.vp-select-input')[0] : this.box.find('.vp-select-input');
      this.arrow = Array.isArray(this.box) ? this.box.filter('.vp-select-arrow')[0] : this.box.find('.vp-select-arrow');
      this.clearBtn = Array.isArray(this.box) ? this.box.filter('.select-clear-icon')[0] : this.box.find('.select-clear-icon');
      this.errorMsg = Array.isArray(this.box) ? this.box.filter('.vp-error-msg')[0] : this.box.find('.vp-error-msg');
      this.getBodyStyle();
      this.bindHeaderEvent();
    },
    // 生成header
    createHeader: function createHeader() {
      var opt = this.option.inputStyle;
      var inputStyle = 'width:' + opt.width + ';' + 'height:' + opt.height + ';' + 'background-color:' + opt.bgColor + ';' + 'color:' + opt.color + ';' + 'font-size:' + opt.fontSize + ';' + 'border-radius:' + opt.borderRadius + ';' + 'border-width:' + opt.borderwith + ';' + 'border-color:' + opt.borderColor + ';';
      var html = '<div class="vp-select-content">' + (this.option.preText !== '' ? '<label style="' + this.option.preStyle + '">' + this.option.preText + '</label>' : '') + '<div class="vp-select-container">' + '<div class="vp-select-header" style="' + inputStyle + '">' + '<input value="' + this.selectText + '" title="已选：' + this.selectText + '" placeholder="' + this.option.placeholder + '" autocomplete="off" readonly="readonly" class="vp-select-input" style="' + this.inputInnerStyle + '" />' + '<span class="vp-select-arrow">' + '<i class="vp-select-icon" style="border-color:' + opt.arrowColor + '"></i> ' + '</span>' + '<span class="select-clear-icon"><i class=\'vp-select-clear-icon\' >x</i></span>' + '</div>' + '</div>' + '<span class=\'vp-error-msg\'></span>' + '</div>';
      return html;
    },
    // 获取选项面板样式
    getBodyStyle: function getBodyStyle() {
      var opt = this.option.panelStyle;
      var panelStyle = 'background-color:' + opt.bgColor + ';' + 'border-radius:' + opt.borderRadius + ';' + 'border-width:' + opt.borderwith + ';' + 'border-color:' + opt.borderColor + ';' + 'z-index:99999;';
      var normalStyle = 'color:' + opt.color + ';' + 'font-size:' + opt.fontSize + ';' + 'height:' + opt.lineHeight + ';' + 'line-height:' + opt.lineHeight + ';';
      var selectedStyle = 'color:' + opt.colorSel + ';' + 'font-size:' + opt.fontSizeSel + ';' + 'background-color:' + opt.bgColorSel + ';' + 'height:' + opt.lineHeight + ';' + 'line-height:' + opt.lineHeight + ';';
      this.bodyStyle = {
        panel: panelStyle,
        normal: normalStyle,
        selected: selectedStyle
      };
    },
    // 绑定header事件
    bindHeaderEvent: function bindHeaderEvent() {
      if (this.option.showClear) {
        this.onOverHeader();
        this.onClickClear();
      }

      this.onClickHeader();
    },
    // Header鼠标滑入/滑出事件
    onOverHeader: function onOverHeader() {
      var vm = this;
      this.header.unbind('mouseover').bind('mouseover ', function (e) {
        if (vm.input.val()) {
          vm.arrow.css('display', 'none');
          vm.clearBtn.css('display', 'inline-block');
        }
      });
      this.header.unbind('mouseout').bind('mouseout ', function (e) {
        if (vm.input.val()) {
          vm.arrow.css('display', 'inline-block');
          vm.clearBtn.css('display', 'none');
        }
      });
    },
    // 点击清空按钮
    onClickClear: function onClickClear() {
      var vm = this;
      this.clearBtn.unbind('click').bind('click ', function (e) {
        e.stopPropagation();
        vm.showBody(false);
        vm.onClear();
      });
    },
    // 恢复默认值 or 清空
    onClear: function onClear() {
      this.box.html('');
      this.initSelect();
      this.createHtml();

      if (this.option.callback.clearOver) {
        this.option.callback.clearOver(this.utils.deepCopy(this.selectData), this);
      }
    },
    // Header点击事件
    onClickHeader: function onClickHeader() {
      var vm = this;
      this.header.unbind('click').bind('click ', function (e) {
        e.stopPropagation();

        if (!vm.header.hasClass('open')) {
          $('.vp-select-body').remove();
          var html = vm.createBody();
          $('body').append(html);
          vm.body = $('#select-body-' + vm.option.id);

          if (vm.option.showTree) {
            vm.createTreeOpts();
            vm.treeObj.$_setData(vm.selectVal.join(','));
          } else {
            vm.search = Array.isArray(vm.body) ? vm.body.filter('.vp-select-search')[0] : vm.body.find('.vp-select-search');
            vm.items = Array.isArray(vm.body) ? vm.body.filter('.vp-select-item')[0] : vm.body.find('.vp-select-item');
            vm.bindBodyEvent();
          }

          vm.showBody(true);
          vm.addListener();
        } else {
          vm.showBody(false);
        }

        $(document).unbind('click').click(function (ev) {
          ev.stopPropagation();
          vm.showBody(false);
        });

        if (!vm.option.showTree) {
          vm.search.unbind('click').click(function (ev) {
            ev.stopPropagation();
          });
        }
      });
    },
    // 生成选项面板
    createBody: function createBody() {
      var style = this.bodyStyle;
      var bodyClass = 'vp-select-body' + (this.option.isMultiple ? ' multiple' : '') + (this.option.showSearch ? ' search' : '');
      var position = 'left:' + this.header.offset().left + 'px;' + 'min-width:' + this.header.outerWidth() + 'px;';
      var html = '<div class="' + bodyClass + '" id="select-body-' + this.option.id + '" style="' + style.panel + position + '">';
      html += this.option.showTree ? '' : this.createNormalOpts();
      html += '</div>';
      return html;
    },
    // 生成普通选项
    createNormalOpts: function createNormalOpts() {
      var _this2 = this;

      var style = this.bodyStyle;
      var html = (this.option.showSearch ? '<div class="vp-select-search"><input placeholder="搜索" class="vp-select-search-input" /></div>' : '') + '<ul class="vp-select-body-ul">';
      this.dataArr.forEach(function (item) {
        var selected = _this2.selectVal.indexOf(item.value) !== -1;
        var itemStyle = ' style="' + (selected ? style.selected : style.normal) + '"';
        var classText = ' class="vp-select-item' + (selected ? ' select' : '') + (item.disable ? ' disable' : '') + '"';
        var title = item.label.toString().replace(/<\/?[^>]*>/g, ' ');
        html += '<li data-val="' + item.value + '" title="' + title + '"' + classText + itemStyle + '>' + '<span>' + item.label + '</span>' + '</li>';
      });
      html += '</ul>';
      return html;
    },
    // 生成选项树
    createTreeOpts: function createTreeOpts() {
      var vm = this;
      var setting = {
        id: 'select-body-' + this.option.id,
        preText: '',
        treeMultiSelect: this.option.isMultiple,
        callback: {
          itemClick: function itemClick(data) {
            data = JSON.parse(data);
            var text = [];
            vm.selectVal = [];
            vm.selectData = [];

            if (vm.option.isMultiple) {
              data.forEach(function (item) {
                item.value = item.id;
                vm.selectData.push(item);
                text.push(item.label);
                vm.selectVal.push(item.value);
              });
              vm.selectText = text.join('，');
            } else {
              vm.selectData = new Array(data);
              vm.selectText = data.label;
              vm.selectVal = new Array(data.id);
              vm.showBody(false);
            }

            vm.setSelectText();

            if (vm.option.callback.selectOver) {
              vm.option.callback.selectOver(vm.utils.deepCopy(vm.selectData), vm);
            }
          }
        }
      };
      this.treeObj = new VpTree(setting, this.dataArr);
      this.treeObj.init();
    },
    // 显示/隐藏选项面板
    showBody: function showBody(flag) {
      if (flag) {
        $('.vp-select-header').removeClass('open');
        this.header.addClass('open');
      } else {
        this.header.removeClass('open');
      }

      this.body.css(this.getBodyPosition(flag));
    },
    // 获取选项面板出现位置信息
    getBodyPosition: function getBodyPosition(flag) {
      var h = this.body.outerHeight();
      var scrollH = $(document).scrollTop();
      var bottom = $(window).height() - (this.header.offset().top - scrollH) - this.header.outerHeight() - 2;
      var css = {};

      if (h <= bottom) {
        css = {
          'opacity': flag ? 1 : 0,
          'transform': flag ? 'scaleY(1)' : 'scaleY(0)',
          'transform-origin': 'center top 0px',
          'top': this.header.offset().top + this.header.outerHeight() + 2 + 'px'
        };
      } else {
        css = {
          'opacity': flag ? 1 : 0,
          'transform': flag ? 'scaleY(1)' : 'scaleY(0)',
          'transform-origin': 'center bottom 0px',
          'top': this.header.offset().top - h - 2 + 'px'
        };
      }

      return css;
    },
    // 绑定选项面板事件
    bindBodyEvent: function bindBodyEvent() {
      this.onClickItem();

      if (this.option.showSearch) {
        this.onSearch();
      }
    },
    // 点击选项事件
    onClickItem: function onClickItem() {
      var vm = this;
      this.items.unbind('click').bind('click ', function (e) {
        var item = $(this);

        if (item.hasClass('disable')) {
          e.stopPropagation();
          return;
        }

        var arr = _toConsumableArray(vm.selectVal);

        if (vm.option.isMultiple) {
          e.stopPropagation();
          var val = item.attr('data-val');

          if (arr.indexOf(val) !== -1) {
            arr.splice(arr.indexOf(val), 1);
            item.removeClass('select').attr('style', vm.bodyStyle.normal);
          } else {
            arr.push(val);
            item.addClass('select').attr('style', vm.bodyStyle.selected);
          }
        } else {
          arr = [item.attr('data-val')];
          vm.items.removeClass('select').attr('style', vm.bodyStyle.normal);
          item.addClass('select').attr('style', vm.bodyStyle.selected);
        }

        vm.getSelectData(arr);
        vm.setSelectText();

        if (vm.option.callback.selectOver) {
          vm.option.callback.selectOver(vm.utils.deepCopy(vm.selectData), vm);
        }
      });
    },
    // 搜索框值改变查询
    onSearch: function onSearch() {
      var vm = this;
      this.search.unbind('input propertychange').bind('input propertychange', function (e) {
        vm.searchkey = $(this).val();
        vm.items.each(function () {
          var dom = $(this);

          if (!(dom.text().indexOf(vm.searchkey) !== -1)) {
            dom.css('display', 'none');
          } else {
            dom.css('display', '');
          }
        });
      });
    },
    // 整理选中项数据
    getSelectData: function getSelectData(selectedArr) {
      var _this3 = this;

      this.selectVal = _toConsumableArray(selectedArr);
      this.selectData = new Array(this.selectVal.length);
      var arr = new Array(this.selectVal.length);
      this.dataArr.forEach(function (item) {
        var index = _this3.selectVal.indexOf(item.value);

        if (index !== -1) {
          _this3.selectData[index] = _this3.utils.deepCopy(item);
          arr[index] = item.label;
        }
      });
      this.selectText = arr.join('，');
    },
    // 设置显示的选中项
    setSelectText: function setSelectText() {
      this.input.val(this.selectText);
      this.input.attr('title', '已选：' + this.selectText);
    },
    // 添加页面滚动监听、resize监听
    addListener: function addListener() {
      var vm = this;
      $(window).unbind('resize').bind('resize ', function (e) {
        vm.showBody(false);
      });
      $(document).unbind('scroll').bind('scroll ', function (e) {
        vm.showBody(false);
      });
    },
    // 外部调用方法==============================
    // 获取选中项数据
    $_getData: function $_getData() {
      var data = this.option.isMultiple ? this.utils.deepCopy(this.selectData) : this.utils.deepCopy(this.selectData[0]);
      return JSON.stringify(data);
    },
    // 设置选中项
    $_setData: function $_setData(selectedVal) {
      if (this.utils.checkNull(selectedVal)) {
        var arr = selectedVal.split(',');

        if (this.option.isMultiple) {
          this.getSelectData(arr);
        } else {
          this.getSelectData([arr[0]]);
        }

        this.setSelectText();

        if (this.option.callback.setData) {
          this.option.callback.setData(this.utils.deepCopy(this.selectData), this);
        }
      }
    },
    // 显示/隐藏校验文字
    $_addCheck: function $_addCheck(flag, msg, type) {
      if (flag) {
        var top = '';
        var left = '';
        var h = '';

        if (type === 'right') {
          top = 0;
          left = this.header.offset().left - this.content.offset().left + this.header.outerWidth() + 15;
          h = this.header.outerHeight() + 'px';
        } else {
          top = this.header.outerHeight() + 8;
          left = this.header.offset().left - this.content.offset().left;
          h = '1em';
        }

        this.errorMsg.html(msg).css({
          'display': 'block',
          'height': h,
          'line-height': h,
          'top': top,
          'left': left
        });
        this.header.addClass('error');
      } else {
        this.errorMsg.css('display', 'none');
        this.header.removeClass('error');
      }
    },
    // 设置下拉框可用不可用
    $_disabled: function $_disabled(flag) {
      if (flag) {
        this.container.addClass('disabled');
      } else {
        this.container.removeClass('disabled');
      }
    }
  }; // 工具方法

  newObj.utils = {
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
      var _this4 = this;

      var sourceCopy = null;

      if (this.isObjectObject(source)) {
        sourceCopy = {};

        for (var item in source) {
          sourceCopy[item] = this.deepCopy(source[item]);
        }
      } else if (this.isArray(source)) {
        sourceCopy = [];
        source.forEach(function (item) {
          sourceCopy.push(_this4.deepCopy(item));
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
    // 生成下拉框的父级DOM元素id
    preText: '',
    // 前置文字，放置于下拉框前的说明文字
    preStyle: '',
    // 前置文字样式
    placeholder: '',
    // 下拉框内的提示文字
    isMultiple: false,
    // 是否多选
    showTree: false,
    // 选项是否为树结构
    showClear: false,
    // 是否显示清空按钮
    showSearch: false,
    // 是否开启选项过滤功能
    // 下拉框的样式
    inputStyle: {
      width: '',
      // 宽度
      height: '',
      // 高度
      bgColor: '',
      // 背景色
      color: '',
      // 文字颜色
      fontSize: '',
      // 文字字号
      borderRadius: '',
      // 边框圆角
      borderwith: '',
      // 边框粗细
      borderColor: '',
      // 边框颜色
      arrowColor: '' // 下拉框右侧尖角图标颜色

    },
    // 选项面板样式
    panelStyle: {
      bgColor: '',
      // 背景色
      borderRadius: '',
      // 边框圆角
      borderwith: '',
      // 边框粗细
      borderColor: '',
      // 边框颜色
      color: '',
      // 选项文字颜色
      fontSize: '',
      // 选项文字字号
      lineHeight: '',
      // 选项文字行高
      colorSel: '',
      // 选中选项文字颜色
      fontSizeSel: '',
      // 选中选项文字字号
      bgColorSel: '' // 选中选项背景色

    },
    // 回调函数
    callback: {
      clearOver: null,
      // 清空事件
      selectOver: null,
      // 选中项改变
      dataOver: null,
      // 选项加载完毕
      setData: null // 调用$_setData后

    }
  };
  return newObj;
}; // 导出=======================================================================


window.AjSelect = AjSelect;