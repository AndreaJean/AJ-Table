
let VpTree = function (option, data) {
  let newObj = {
    treeData: [],
    msString: '',
    srcdiv: '',
    dragEl: '',
    columns: '',
    init () {
      this.treeData = this.utils.deepCopy(data)
      var domContainer = $('#' + option.id)
      console.info('ddddd=', option, this.treeData)
      domContainer.empty()
      if (this.treeData == undefined) {
        vpnodata(option.id)
      }
      if (option.preText != undefined && option.preText != 'undefined' && option.preText != '') {
        domContainer.append('<span class="vp-tree-preText">' + option.preText + ':</span>')
      }
      // domContainer.append('<div class="vp-tree-container"></div>');
      // treeContainer=$('#'+option.id+' .vp-tree-container');
      // option.treeMultiSelect=true;
      if (option.treeMultiSelect) {
        this.msString = '<span class=\'vp-tree-checkbox-item empty\'><span class=\'vp-tree-checkbox-icon\'><span class=\'vp-tree-checkbox-fill\'></span><span class=\'vp-tree-checkbox-content\'></span> </span> </span> '
      }
      this.create(this.treeData)
    },
    create (treeData) {
      var domContainer = $('#' + option.id)
      domContainer.empty()
      var instyle = domContainer.attr('instyle') != undefined ? JSON.parse(domContainer.attr('instyle')) : {}
      for (var i = 0; i < treeData.length; i++) {
        var nodeData = treeData[i]
        this.createNode(nodeData, null)
      }
      domContainer.find('.icon-triangle-right').unbind('click').bind('click', function (e) {
        e.stopPropagation()
        var target = $(e.target)
        var childrenContainer = target.parent().siblings()
        if (childrenContainer.length > 0) {
          if (childrenContainer.css('display') != 'none') {
            childrenContainer.hide()
            target.parent().parent().removeClass('expand')
          } else {
            childrenContainer.show()
            target.parent().parent().addClass('expand')
          }
        }
      })
      let that = this
      domContainer.find('.vp-tree-node-content').unbind('click').bind('click', function (e) {
        e.stopPropagation()
        var target = $(e.currentTarget)

        // 单选树
        if (!option.treeMultiSelect) {
          domContainer.find('.vp-tree-node-content').removeClass('select')
          target.toggleClass('select')
          if (option.callback.itemClick) {
            option.callback.itemClick(target.attr('val'))
          }
        } else {
          target.toggleClass('select')
          var checkboxItem = target.children('.vp-tree-checkbox-item')
          var childrenContainer = target.siblings('.vp-tree-children-container')
          var slibingsItem = target.parent().parent().children('.vp-tree-node-container').children('.vp-tree-node-content').children('.vp-tree-checkbox-item')
          var itemParent = target.parent().parent()
          if (checkboxItem.hasClass('empty')) {
            checkboxItem.removeClass('empty')
            checkboxItem.addClass('full')
            childrenContainer.find('.vp-tree-checkbox-item').removeClass('half').removeClass('empty').addClass('full')
          } else if (checkboxItem.hasClass('half')) {
            checkboxItem.removeClass('half')
            checkboxItem.addClass('full')
            childrenContainer.find('.vp-tree-checkbox-item').removeClass('half').removeClass('empty').addClass('full')
          } else {
            checkboxItem.removeClass('full')
            checkboxItem.addClass('empty')
            childrenContainer.find('.vp-tree-checkbox-item').removeClass('full').removeClass('half').addClass('empty')
          }
          if (itemParent.length > 0 && itemParent.hasClass('vp-tree-children-container')) {
            that.findParent(itemParent.parent())
          }
          var selectList = domContainer.find('.full')
          var selectArr = new Array()

          for (var i = 0; i < selectList.length; i++) {
            var selectVal = selectList.eq(i).parent().attr('val')
            selectArr.push(JSON.parse(selectVal))
          }
          if (option.callback.itemClick) {
            option.callback.itemClick(JSON.stringify(selectArr))
          }
        }

        target.css({'font-size': instyle.currSize, 'color': instyle.currColor, 'background-color': instyle.currBg})
      })
      this.draggableEvent()
    },
    findParent (item) {
      var resultClass = ''
      var childrenList = item.children('.vp-tree-children-container').children('.vp-tree-node-container').children('.vp-tree-node-content').children('.vp-tree-checkbox-item')
      for (var i = 0; i < childrenList.length; i++) {
        var childrenItem = childrenList.eq(i)
        if (childrenItem.hasClass('half')) {
          resultClass = 'half'
          break
        } else if (childrenItem.hasClass('full')) {
          if (resultClass == '') { resultClass = 'full' } else if (resultClass == 'empty') {
            resultClass = 'half'
            break
          }
        } else if (childrenItem.hasClass('empty')) {
          if (resultClass == '') { resultClass = 'empty' } else if (resultClass == 'full') {
            resultClass = 'half'
            break
          }
        }
      }
      var currentItem = item.children('.vp-tree-node-content').children('.vp-tree-checkbox-item')
      currentItem.removeClass('full').removeClass('empty').removeClass('half').addClass(resultClass)
      var itemParent = item.parent()
      if (itemParent.length > 0 && itemParent.hasClass('vp-tree-children-container')) {
        this.findParent(itemParent.parent())
      }
      /* if(type=="full"){
                if(slibingsItem.hasClass("empty") || slibingsItem.hasClass("half")){
                    returnStr='half';
                }
                else{
                    returnStr='full';
                }
            }
            else if(type=="half"){
                returnStr='half';
            }
            else if(type=="empty"){
                if(slibingsItem.hasClass("full") || slibingsItem.hasClass("half")){
                    returnStr='half';
                }
                else{
                    returnStr='empty';
                }
            }
           itemParent.removeClass("full").removeClass("half").removeClass("empty").addClass(returnStr); */
    },
    createNode (node, parent) {
      var domContainer = $('#' + option.id)
      var currentParent = null
      var nextParent
      // console.info("ttttttt=",JSON.stringify(node));
      var valObj = {}
      for (var key in node) {
        if (key != 'children') { valObj[key] = node[key] }
      }
      var html = '<div class=\'vp-tree-node-container\'  >' +
                '<div class="vp-tree-node-content"  val=\'' + JSON.stringify(valObj) + '\'>' +
                '<span class=\'vp-tree-node-icon iconfont icon-triangle-right is-leaf\'></span>' +
                this.msString +
                '<span class="custom-tree-node"><span title="' + node.label + '"  class="vp-tree-node-lable">' + node.label + '</span> <span class="custom-tree-node-icon"><span><i class="icon iconfont icon-tubiao_jia editcon"></i><i class="icon iconfont icon-tubiao_jian  editcon"></i><i class="icon iconfont icon-tubiao_bianji-small  editcon"></i> </span></span></span> </div>' +
                '</div>'
      if (node.children != undefined && node.children != null && node.children.length > 0) {
        html = '<div class=\'vp-tree-node-container\'>' +
                        '<div class=\'vp-tree-node-content\'   val=\'' + JSON.stringify(valObj) + '\'>' +
                           '<span class=\'vp-tree-node-icon iconfont icon-triangle-right\'></span>' +
                           this.msString +
                              '<span class="custom-tree-node"><span class="vp-tree-node-lable" title="' + node.label + '" >' + node.label + '</span> <span class="custom-tree-node-icon"><i class="icon iconfont icon-tubiao_jia editcon"></i><i class="icon iconfont icon-tubiao_jian  editcon"></i><i class="icon iconfont icon-tubiao_bianji-small  editcon"></i></span></span></span> </div>' +
                        '<div class=\'vp-tree-children-container\'  style=\'display: none;\'></div>' +
                    '</div>'
      }
      if (parent == null) {
        domContainer.append(html)
        nextParent = domContainer
      } else {
        parent.append(html)
        nextParent = parent
      }
      if (node.children != undefined && node.children != null && node.children.length > 0) {
        currentParent = nextParent.children('.vp-tree-node-container').last().children('.vp-tree-children-container')
        for (var i = 0; i < node.children.length; i++) {
          this.createNode(node.children[i], currentParent)
        }
      }

      if (option.edit) {
        $('#' + option.id).find('.custom-tree-node-icon').css('display', 'inline-block')
      }

      this.clickedit()
    },
    draggableEvent () {
      this.columns = document.querySelectorAll('.vp-tree-node-container')

      this.dragEl = null
      var that = this;
      [].forEach.call(that.columns, function (column) {
        column.addEventListener('dragstart', function (event) {
          that.dragEl = event.target
          event.dataTransfer.effectAllowed = 'move'
          event.dataTransfer.setData('text/html', event.target.innerHTML)
        })

        column.addEventListener('dragenter', function (event) {
          event.target.classList.add('over')
        })

        column.addEventListener('dragover', function (event) {
          if (event.preventDefault) {
            event.preventDefault()
          }
          event.dataTransfer.dropEffect = 'move'
          return false
        })

        column.addEventListener('dragleave', function (event) {
          event.target.classList.remove('over')
        })

        column.addEventListener('drop', function (event) {
          if (event.stopPropagation) {
            event.stopPropagation()
          }

          // 位置互换
          if (that.dragEl !== event.target) {
            that.dragEl.innerHTML = event.target.innerHTML
            event.target = that.dragEl
          }
          return false
        })

        column.addEventListener('dragend', function (event) {
          [].forEach.call(that.columns, function (column) {
            column.classList.remove('over')
            column.style.opacity = '1'
          })
        })
      })
    },
    clickedit () {
      var target = $('#' + option.id)
      var that = this
      target.find('.editcon').unbind('click').bind('click ', function (e) {
        e.stopPropagation()
        let key = ''
        let data = JSON.parse($(this).parents('.vp-tree-node-content').attr('val'))
        if ($(this).hasClass('icon-tubiao_jia')) {
          key = 'add'
        } else if ($(this).hasClass('icon-tubiao_jian')) {
          key = 'delete'
        } else {
          key = 'edit'
        }
        if (option.callback.editBtn) {
          option.callback.editBtn(data, key)
        }
      })
    },
    $_setOption (data) {
      this.create(data)
    },
    $_setData (data) {
      var that = this
      $('#' + option.id).attr('val', '')
      $('#' + option.id + ' .vp-tree-node-content').removeClass('select')
      $('#' + option.id + ' .vp-tree-checkbox-item').removeClass('full')
      $('#' + option.id + ' .vp-tree-checkbox-item').removeClass('half')
      let selectArr = []
      let defaultValue = data.split(',')
      $('#' + option.id).find('.vp-tree-node-content').each(function (index, dom) {
        defaultValue.forEach((item, i) => {
          if (JSON.parse($(this).attr('val')).id == item) {
            $(this).addClass('select')
            $(this).find('.vp-tree-checkbox-item').addClass('full')
            $(this).find('.vp-tree-checkbox-item').removeClass('half')
            $(this).find('.vp-tree-checkbox-item').removeClass('empty')
            var itemParent = $(this).parent().parent()
            // $(this).siblings('.vp-tree-children-container').find('.vp-tree-checkbox-item').addClass('half')
            // var checkboxItem = $(this).children('.vp-tree-checkbox-item')
            // var childrenContainer = $(this).siblings('.vp-tree-children-container')
            // var slibingsItem = $(this).parent().parent().children('.vp-tree-node-container').children('.vp-tree-node-content').children('.vp-tree-checkbox-item')
            // var itemParent = $(this).parent().parent()
            // if (checkboxItem.hasClass('empty')) {
            //   checkboxItem.removeClass('empty')
            //   checkboxItem.addClass('full')
            //   // childrenContainer.find('.vp-tree-checkbox-item').removeClass('half').removeClass('empty').addClass('full')
            // } else if (checkboxItem.hasClass('half')) {
            //   checkboxItem.removeClass('half')
            //   checkboxItem.addClass('full')
            //   // childrenContainer.find('.vp-tree-checkbox-item').removeClass('half').removeClass('empty').addClass('full')
            // } else {
            //   checkboxItem.removeClass('full')
            //   checkboxItem.addClass('empty')
            //   // childrenContainer.find('.vp-tree-checkbox-item').removeClass('full').removeClass('half').addClass('empty')
            // }
            if (itemParent.length > 0 && itemParent.hasClass('vp-tree-children-container')) {
              that.findParent(itemParent.parent())
            }
            selectArr.push(JSON.parse($(this).attr('val')))
          }
        })
      })
      $('#' + option.id).attr('val', JSON.stringify(selectArr))
    },
    $_getData () {
      return $('#' + option.id).attr('val')
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
    uncheckTabStyle: {
      tabBg: '',
      tabLeftTop: '',
      tabRightTop: '',
      tabRightBottom: '',
      tabLeftBottom: '',
      tabWidth: '',
      tabHeight: ''
    },
    // 选中样式
    tabTedStyle: {
      tabtedBg: '',
      tabtedSize: '',
      tabtedColor: '',
      tabLeftTop: '',
      tabRightTop: '',
      tabRightBottom: '',
      tabLeftBottom: '',
      tabWidth: '',
      tabHeight: '',
      tabFontWeight: ''
    },
    callback: {
      editBtn: null,
      itemClick: null
    }
  }
  return newObj
}

// 导出=======================================================================

window.VpTree = VpTree
