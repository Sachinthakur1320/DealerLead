/* ===================================================
 * bootstrap-transition.js v2.2.1
 * http://twitter.github.com/bootstrap/javascript.html#transitions
 * ===================================================
 * Copyright 2012 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ========================================================== */


!function ($) {

  "use strict"; // jshint ;_;


  /* CSS TRANSITION SUPPORT (http://www.modernizr.com/)
   * ======================================================= */

  $(function () {

    $.support.transition = (function () {

      var transitionEnd = (function () {

        var el = document.createElement('bootstrap')
          , transEndEventNames = {
               'WebkitTransition' : 'webkitTransitionEnd'
            ,  'MozTransition'    : 'transitionend'
            ,  'OTransition'      : 'oTransitionEnd otransitionend'
            ,  'transition'       : 'transitionend'
            }
          , name

        for (name in transEndEventNames){
          if (el.style[name] !== undefined) {
            return transEndEventNames[name]
          }
        }

      }())

      return transitionEnd && {
        end: transitionEnd
      }

    })()

  })

}(window.jQuery);/* ==========================================================
 * bootstrap-alert.js v2.2.1
 * http://twitter.github.com/bootstrap/javascript.html#alerts
 * ==========================================================
 * Copyright 2012 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ========================================================== */


!function ($) {

  "use strict"; // jshint ;_;


 /* ALERT CLASS DEFINITION
  * ====================== */

  var dismiss = '[data-dismiss="alert"]'
    , Alert = function (el) {
        $(el).on('click', dismiss, this.close)
      }

  Alert.prototype.close = function (e) {
    var $this = $(this)
      , selector = $this.attr('data-target')
      , $parent

    if (!selector) {
      selector = $this.attr('href')
      selector = selector && selector.replace(/.*(?=#[^\s]*$)/, '') //strip for ie7
    }

    $parent = $(selector)

    e && e.preventDefault()

    $parent.length || ($parent = $this.hasClass('alert') ? $this : $this.parent())

    $parent.triggerHandler(e = $.Event('close'))

    if (e.isDefaultPrevented()) return

    $parent.removeClass('in')

    function removeElement() {
      $parent.triggerHandler('closed')
      $parent.remove()
    }

    $.support.transition && $parent.hasClass('fade') ?
      $parent.on($.support.transition.end, removeElement) :
      removeElement()
  }


 /* ALERT PLUGIN DEFINITION
  * ======================= */

  $.fn.alert = function (option) {
    return this.each(function () {
      var $this = $(this)
        , data = $this.data('alert')
      if (!data) $this.data('alert', (data = new Alert(this)))
      if (typeof option == 'string') data[option].call($this)
    })
  }

  $.fn.alert.Constructor = Alert


 /* ALERT DATA-API
  * ============== */

  $(document).on('click.alert.data-api', dismiss, Alert.prototype.close)

}(window.jQuery);/* ============================================================
 * bootstrap-button.js v2.2.1
 * http://twitter.github.com/bootstrap/javascript.html#buttons
 * ============================================================
 * Copyright 2012 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ============================================================ */


!function ($) {

  "use strict"; // jshint ;_;


 /* BUTTON PUBLIC CLASS DEFINITION
  * ============================== */

  var Button = function (element, options) {
    this.$element = $(element)
    this.options = $.extend({}, $.fn.button.defaults, options)
  }

  Button.prototype.setState = function (state) {
    var d = 'disabled'
      , $el = this.$element
      , data = $el.data()
      , val = $el.is('input') ? 'val' : 'html'

    state = state + 'Text'
    data.resetText || $el.data('resetText', $el[val]())

    $el[val](data[state] || this.options[state])

    // push to event loop to allow forms to submit
    setTimeout(function () {
      state == 'loadingText' ?
        $el.addClass(d).attr(d, d) :
        $el.removeClass(d).removeAttr(d)
    }, 0)
  }

  Button.prototype.toggle = function () {
    var $parent = this.$element.closest('[data-toggle="buttons-radio"]')

    $parent && $parent
      .find('.active')
      .removeClass('active')

    this.$element.toggleClass('active')
  }


 /* BUTTON PLUGIN DEFINITION
  * ======================== */

  $.fn.button = function (option) {
    return this.each(function () {
      var $this = $(this)
        , data = $this.data('button')
        , options = typeof option == 'object' && option
      if (!data) $this.data('button', (data = new Button(this, options)))
      if (option == 'toggle') data.toggle()
      else if (option) data.setState(option)
    })
  }

  $.fn.button.defaults = {
    loadingText: 'loading...'
  }

  $.fn.button.Constructor = Button


 /* BUTTON DATA-API
  * =============== */

  $(document).on('click.button.data-api', '[data-toggle^=button]', function (e) {
    var $btn = $(e.target)
    if (!$btn.hasClass('btn')) $btn = $btn.closest('.btn')
    $btn.button('toggle')
  })

}(window.jQuery);/* ==========================================================
 * bootstrap-carousel.js v2.2.1
 * http://twitter.github.com/bootstrap/javascript.html#carousel
 * ==========================================================
 * Copyright 2012 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ========================================================== */


!function ($) {

  "use strict"; // jshint ;_;


 /* CAROUSEL CLASS DEFINITION
  * ========================= */

  var Carousel = function (element, options) {
    this.$element = $(element)
    this.options = options
    this.options.slide && this.slide(this.options.slide)
    this.options.pause == 'hover' && this.$element
      .on('mouseenter', $.proxy(this.pause, this))
      .on('mouseleave', $.proxy(this.cycle, this))
  }

  Carousel.prototype = {

    cycle: function (e) {
      if (!e) this.paused = false
      this.options.interval
        && !this.paused
        && (this.interval = setInterval($.proxy(this.next, this), this.options.interval))
      return this
    }

  , to: function (pos) {
      var $active = this.$element.find('.item.active')
        , children = $active.parent().children()
        , activePos = children.index($active)
        , that = this

      if (pos > (children.length - 1) || pos < 0) return

      if (this.sliding) {
        return this.$element.one('slid', function () {
          that.to(pos)
        })
      }

      if (activePos == pos) {
        return this.pause().cycle()
      }

      return this.slide(pos > activePos ? 'next' : 'prev', $(children[pos]))
    }

  , pause: function (e) {
      if (!e) this.paused = true
      if (this.$element.find('.next, .prev').length && $.support.transition.end) {
        this.$element.trigger($.support.transition.end)
        this.cycle()
      }
      clearInterval(this.interval)
      this.interval = null
      return this
    }

  , next: function () {
      if (this.sliding) return
      return this.slide('next')
    }

  , prev: function () {
      if (this.sliding) return
      return this.slide('prev')
    }

  , slide: function (type, next) {
      var $active = this.$element.find('.item.active')
        , $next = next || $active[type]()
        , isCycling = this.interval
        , direction = type == 'next' ? 'left' : 'right'
        , fallback  = type == 'next' ? 'first' : 'last'
        , that = this
        , e

      this.sliding = true

      isCycling && this.pause()

      $next = $next.length ? $next : this.$element.find('.item')[fallback]()

      e = $.Event('slide', {
        relatedTarget: $next[0]
      })

      if ($next.hasClass('active')) return

      if ($.support.transition && this.$element.hasClass('slide')) {
        this.$element.trigger(e)
        if (e.isDefaultPrevented()) return
        $next.addClass(type)
        $next[0].offsetWidth // force reflow
        $active.addClass(direction)
        $next.addClass(direction)
        this.$element.one($.support.transition.end, function () {
          $next.removeClass([type, direction].join(' ')).addClass('active')
          $active.removeClass(['active', direction].join(' '))
          that.sliding = false
          setTimeout(function () { that.$element.trigger('slid') }, 0)
        })
      } else {
        this.$element.trigger(e)
        if (e.isDefaultPrevented()) return
        $active.removeClass('active')
        $next.addClass('active')
        this.sliding = false
        this.$element.trigger('slid')
      }

      isCycling && this.cycle()

      return this
    }

  }


 /* CAROUSEL PLUGIN DEFINITION
  * ========================== */

  $.fn.carousel = function (option) {
    return this.each(function () {
      var $this = $(this)
        , data = $this.data('carousel')
        , options = $.extend({}, $.fn.carousel.defaults, typeof option == 'object' && option)
        , action = typeof option == 'string' ? option : options.slide
      if (!data) $this.data('carousel', (data = new Carousel(this, options)))
      if (typeof option == 'number') data.to(option)
      else if (action) data[action]()
      else if (options.interval) data.cycle()
    })
  }

  $.fn.carousel.defaults = {
    interval: 5000
  , pause: 'hover'
  }

  $.fn.carousel.Constructor = Carousel


 /* CAROUSEL DATA-API
  * ================= */

  $(document).on('click.carousel.data-api', '[data-slide]', function (e) {
    var $this = $(this), href
      , $target = $($this.attr('data-target') || (href = $this.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '')) //strip for ie7
      , options = $.extend({}, $target.data(), $this.data())
    $target.carousel(options)
    e.preventDefault()
  })

}(window.jQuery);/* =============================================================
 * bootstrap-collapse.js v2.2.1
 * http://twitter.github.com/bootstrap/javascript.html#collapse
 * =============================================================
 * Copyright 2012 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ============================================================ */


!function ($) {

  "use strict"; // jshint ;_;


 /* COLLAPSE PUBLIC CLASS DEFINITION
  * ================================ */

  var Collapse = function (element, options) {
    this.$element = $(element)
    this.options = $.extend({}, $.fn.collapse.defaults, options)

    if (this.options.parent) {
      this.$parent = $(this.options.parent)
    }

    this.options.toggle && this.toggle()
  }

  Collapse.prototype = {

    constructor: Collapse

  , dimension: function () {
      var hasWidth = this.$element.hasClass('width')
      return hasWidth ? 'width' : 'height'
    }

  , show: function () {
      var dimension
        , scroll
        , actives
        , hasData

      if (this.transitioning) return

      dimension = this.dimension()
      scroll = $.camelCase(['scroll', dimension].join('-'))
      actives = this.$parent && this.$parent.find('> .accordion-group > .in')

      if (actives && actives.length) {
        hasData = actives.data('collapse')
        if (hasData && hasData.transitioning) return
        actives.collapse('hide')
        hasData || actives.data('collapse', null)
      }

      this.$element[dimension](0)
      this.transition('addClass', $.Event('show'), 'shown')
      $.support.transition && this.$element[dimension](this.$element[0][scroll])
    }

  , hide: function () {
      var dimension
      if (this.transitioning) return
      dimension = this.dimension()
      this.reset(this.$element[dimension]())
      this.transition('removeClass', $.Event('hide'), 'hidden')
      this.$element[dimension](0)
    }

  , reset: function (size) {
      var dimension = this.dimension()

      this.$element
        .removeClass('collapse')
        [dimension](size || 'auto')
        [0].offsetWidth

      this.$element[size !== null ? 'addClass' : 'removeClass']('collapse')

      return this
    }

  , transition: function (method, startEvent, completeEvent) {
      var that = this
        , $handler = this.$element.find('.accordion-inner')
        , complete = function () {
            if (startEvent.type == 'show') that.reset()
            if (startEvent.type == 'show') that.$element.addClass('open')
            that.transitioning = 0
            $handler.triggerHandler(completeEvent)
          }

      $handler.triggerHandler(startEvent)

      if (startEvent.isDefaultPrevented()) return

      this.transitioning = 1

      if (startEvent.type == 'hide') this.$element.removeClass('open')
      this.$element[method]('in')

      $.support.transition && this.$element.hasClass('collapse') ?
        this.$element.one($.support.transition.end, complete) :
        complete()
    }

  , toggle: function () {
      this[this.$element.hasClass('in') ? 'hide' : 'show']()
    }

  }


 /* COLLAPSIBLE PLUGIN DEFINITION
  * ============================== */

  $.fn.collapse = function (option) {
    return this.each(function () {
      var $this = $(this)
        , data = $this.data('collapse')
        , options = typeof option == 'object' && option
      if (!data) $this.data('collapse', (data = new Collapse(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  $.fn.collapse.defaults = {
    toggle: true
  }

  $.fn.collapse.Constructor = Collapse


 /* COLLAPSIBLE DATA-API
  * ==================== */

  $(document).on('click.collapse.data-api', '[data-toggle=collapse]', function (e) {
    var $this = $(this), href
      , target = $this.data('target')
        || e.preventDefault()
        || (href = $this.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '') //strip for ie7
      , option = $(target).data('collapse') ? 'toggle' : $this.data()
    $this[$(target).hasClass('in') ? 'addClass' : 'removeClass']('collapsed')
    $(target).collapse(option)
  })

}(window.jQuery);/* ============================================================
 * bootstrap-dropdown.js v2.2.1
 * http://twitter.github.com/bootstrap/javascript.html#dropdowns
 * ============================================================
 * Copyright 2012 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ============================================================ */


!function ($) {

  "use strict"; // jshint ;_;


 /* DROPDOWN CLASS DEFINITION
  * ========================= */

  var toggle = '[data-toggle=dropdown]'
    , Dropdown = function (element) {
        var $el = $(element).on('click.dropdown.data-api', this.toggle)
        $('html').on('click.dropdown.data-api', function () {
          $el.parent().removeClass('open')
        })
      }

  Dropdown.prototype = {

    constructor: Dropdown

  , toggle: function (e) {
      var $this = $(this)
        , $parent
        , isActive

      if ($this.is('.disabled, :disabled')) return

      $parent = getParent($this)

      isActive = $parent.hasClass('open')

      clearMenus()

      if (!isActive) {
        $parent.toggleClass('open')
        $this.focus()
      }

      return false
    }

  , keydown: function (e) {
      var $this
        , $items
        , $active
        , $parent
        , isActive
        , index

      if (!/(38|40|27)/.test(e.keyCode)) return

      $this = $(this)

      e.preventDefault()
      e.stopPropagation()

      if ($this.is('.disabled, :disabled')) return

      $parent = getParent($this)

      isActive = $parent.hasClass('open')

      if (!isActive || (isActive && e.keyCode == 27)) return $this.click()

      $items = $('[role=menu] li:not(.divider) a', $parent)

      if (!$items.length) return

      index = $items.index($items.filter(':focus'))

      if (e.keyCode == 38 && index > 0) index--                                        // up
      if (e.keyCode == 40 && index < $items.length - 1) index++                        // down
      if (!~index) index = 0

      $items
        .eq(index)
        .focus()
    }

  }

  function clearMenus(e) {
    $(toggle).each(function () {
      getParent($(this)).removeClass('open')
    })
  }

  function getParent($this) {
    var selector = $this.attr('data-target')
      , $parent

    if (!selector) {
      selector = $this.attr('href')
      selector = selector && /#/.test(selector) && selector.replace(/.*(?=#[^\s]*$)/, '') //strip for ie7
    }

    $parent = $(selector)
    $parent.length || ($parent = $this.parent())

    return $parent
  }


  /* DROPDOWN PLUGIN DEFINITION
   * ========================== */

  $.fn.dropdown = function (option) {
    return this.each(function () {
      var $this = $(this)
        , data = $this.data('dropdown')
      if (!data) $this.data('dropdown', (data = new Dropdown(this)))
      if (typeof option == 'string') data[option].call($this)
    })
  }

  $.fn.dropdown.Constructor = Dropdown


  /* APPLY TO STANDARD DROPDOWN ELEMENTS
   * =================================== */

  $(document)
    .on('click.dropdown.data-api', clearMenus)
    .on('click.dropdown.data-api', '.dropdown form, .dropdown-submenu > a, .nav-header', function (e) { e.stopPropagation() })
    .on('click.dropdown.data-api'  , toggle, Dropdown.prototype.toggle)
    .on('keydown.dropdown.data-api', toggle + ', [role=menu]' , Dropdown.prototype.keydown)

}(window.jQuery);/* ===========================================================
 * bootstrap-tooltip.js v2.1.1
 * http://twitter.github.com/bootstrap/javascript.html#tooltips
 * Inspired by the original jQuery.tipsy by Jason Frame
 * ===========================================================
 * Copyright 2012 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ========================================================== */


!function ($) {

  "use strict"; // jshint ;_;


 /* TOOLTIP PUBLIC CLASS DEFINITION
  * =============================== */

  var Tooltip = function (element, options) {
    this.init('tooltip', element, options)
  }

  Tooltip.prototype = {

    constructor: Tooltip

  , init: function (type, element, options) {
      var eventIn
        , eventOut

      this.type = type
      this.$element = $(element)
      this.options = this.getOptions(options)
      this.enabled = true

      if (this.options.trigger == 'click') {
        this.$element.on('click.' + this.type, this.options.selector, $.proxy(this.toggle, this))
      } else if (this.options.trigger != 'manual') {
        eventIn = this.options.trigger == 'hover' ? 'mouseenter' : 'focus'
        eventOut = this.options.trigger == 'hover' ? 'mouseleave' : 'blur'
        this.$element.on(eventIn + '.' + this.type, this.options.selector, $.proxy(this.enter, this))
        this.$element.on(eventOut + '.' + this.type, this.options.selector, $.proxy(this.leave, this))
      }

      this.$container = this.options.container ? $(this.options.container) : $('body');
      this.$container.on('hidden', $.proxy(this.hide, this));

      this.options.selector ?
        (this._options = $.extend({}, this.options, { trigger: 'manual', selector: '' })) :
        this.fixTitle()
    }

  , getOptions: function (options) {
      options = $.extend({}, $.fn[this.type].defaults, options, this.$element.data())

      if (options.delay && typeof options.delay == 'number') {
        options.delay = {
          show: options.delay
        , hide: options.delay
        }
      }

      return options
    }

  , enter: function (e) {
      var self = $(e.currentTarget)[this.type](this._options).data(this.type)

      if (!self.options.delay || !self.options.delay.show) return self.show()

      clearTimeout(this.timeout)
      self.hoverState = 'in'
      this.timeout = setTimeout(function() {
        if (self.hoverState == 'in') self.show()
      }, self.options.delay.show)
    }

  , leave: function (e) {
      var self = $(e.currentTarget)[this.type](this._options).data(this.type)

      if (this.timeout) clearTimeout(this.timeout)
      if (!self.options.delay || !self.options.delay.hide) return self.hide()

      self.hoverState = 'out'
      this.timeout = setTimeout(function() {
        if (self.hoverState == 'out') self.hide()
      }, self.options.delay.hide)
    }

  , show: function () {
      var $tip
        , inside
        , pos
        , actualWidth
        , actualHeight
        , placement
        , tp

      if (this.hasContent() && this.enabled) {
        $tip = this.tip()
        this.setContent()

        if (this.options.animation) {
          $tip.addClass('fade')
        }

        placement = typeof this.options.placement == 'function' ?
          this.options.placement.call(this, $tip[0], this.$element[0]) :
          this.options.placement

        inside = /in/.test(placement)

        $tip
          .detach()
          .css({ top: 0, left: 0, display: 'block' })
          .appendTo(inside ? this.$element : this.$container)

        pos = this.getPosition(inside)

        actualWidth = $tip[0].offsetWidth
        actualHeight = $tip[0].offsetHeight

        switch (inside ? placement.split(' ')[1] : placement) {
          case 'bottom':
            tp = {top: pos.top + pos.height, left: pos.left + pos.width / 2 - actualWidth / 2}
            break
          case 'top':
            tp = {top: pos.top - actualHeight, left: pos.left + pos.width / 2 - actualWidth / 2}
            break
          case 'left':
            tp = {top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left - actualWidth}
            break
          case 'right':
            tp = {top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left + pos.width}
            break
        }

        $tip
          .css(tp)
          .addClass(placement)
          .addClass('in')
      }
    }

  , setContent: function () {
      var $tip = this.tip()
        , title = this.getTitle()

      $tip.find('.tooltip-inner')[this.options.html ? 'html' : 'text'](title)
      $tip.removeClass('fade in top bottom left right')
    }

  , hide: function () {
      var that = this
        , $tip = this.tip()

      $tip.removeClass('in')

      function removeWithAnimation() {
        var timeout = setTimeout(function () {
          $tip.off($.support.transition.end).detach()
        }, 500)

        $tip.one($.support.transition.end, function () {
          clearTimeout(timeout)
          $tip.detach()
        })
      }

      $.support.transition && this.$tip.hasClass('fade') ?
        removeWithAnimation() :
        $tip.detach()

      return this
    }

  , fixTitle: function () {
      var $e = this.$element
      if ($e.attr('title') || typeof($e.attr('data-original-title')) != 'string') {
        $e.attr('data-original-title', $e.attr('title') || '').removeAttr('title')
      }
    }

  , hasContent: function () {
      return this.getTitle()
    }

  , getPosition: function (inside) {
	  var position = this.options.container ? 'position' : 'offset';
      return $.extend({}, (inside ? {top: 0, left: 0} : this.$element[position]()), {
        width: this.$element[0].offsetWidth
      , height: this.$element[0].offsetHeight
      })
    }

  , getTitle: function () {
      var title
        , $e = this.$element
        , o = this.options

      title = $e.attr('data-original-title')
        || (typeof o.title == 'function' ? o.title.call($e[0]) :  o.title)

      return title
    }

  , tip: function () {
      return this.$tip = this.$tip || $(this.options.template)
    }

  , validate: function () {
      if (!this.$element[0].parentNode) {
        this.hide()
        this.$element = null
        this.options = null
      }
    }

  , enable: function () {
      this.enabled = true
    }

  , disable: function () {
      this.enabled = false
    }

  , toggleEnabled: function () {
      this.enabled = !this.enabled
    }

  , toggle: function (e) {
      var self = $(e.currentTarget)[this.type](this._options).data(this.type)
      self[self.tip().hasClass('in') ? 'hide' : 'show']()
    }

  , destroy: function () {
      this.hide().$element.off('.' + this.type).removeData(this.type)
    }

  }


 /* TOOLTIP PLUGIN DEFINITION
  * ========================= */

  $.fn.tooltip = function ( option ) {
    return this.each(function () {
      var $this = $(this)
        , data = $this.data('tooltip')
        , options = typeof option == 'object' && option
      if (!data) $this.data('tooltip', (data = new Tooltip(this, options)))
      if (typeof option == 'string') data[option](option)
    })
  }

  $.fn.tooltip.Constructor = Tooltip

  $.fn.tooltip.defaults = {
    animation: true
  , placement: 'top'
  , selector: false
  , template: '<div class="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>'
  , trigger: 'hover'
  , title: ''
  , delay: 0
  , html: false
  }

}(window.jQuery);
/* ===========================================================
 * bootstrap-popover.js v2.2.1
 * http://twitter.github.com/bootstrap/javascript.html#popovers
 * ===========================================================
 * Copyright 2012 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =========================================================== */


!function ($) {

  "use strict"; // jshint ;_;


 /* POPOVER PUBLIC CLASS DEFINITION
  * =============================== */

  var Popover = function (element, options) {
    this.init('popover', element, options)
  }


  /* NOTE: POPOVER EXTENDS BOOTSTRAP-TOOLTIP.js
     ========================================== */

  Popover.prototype = $.extend({}, $.fn.tooltip.Constructor.prototype, {

    constructor: Popover

  , setContent: function () {
      var $tip = this.tip()
        , title = this.getTitle()
        , content = this.getContent()

      $tip.find('.popover-title')[this.options.html ? 'html' : 'text'](title)
      $tip.find('.popover-content > *')[this.options.html ? 'html' : 'text'](content)

      $tip.removeClass('fade top bottom left right in')
    }

  , hasContent: function () {
      return this.getTitle() || this.getContent()
    }

  , getContent: function () {
      var content
        , $e = this.$element
        , o = this.options

      content = $e.attr('data-content')
        || (typeof o.content == 'function' ? o.content.call($e[0]) :  o.content)

      return content
    }

  , tip: function () {
      if (!this.$tip) {
        this.$tip = $(this.options.template)
      }
      return this.$tip
    }

  , destroy: function () {
      this.hide().$element.off('.' + this.type).removeData(this.type)
    }

  })


 /* POPOVER PLUGIN DEFINITION
  * ======================= */

  $.fn.popover = function (option) {
    return this.each(function () {
      var $this = $(this)
        , data = $this.data('popover')
        , options = typeof option == 'object' && option
      if (!data) $this.data('popover', (data = new Popover(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  $.fn.popover.Constructor = Popover

  $.fn.popover.defaults = $.extend({} , $.fn.tooltip.defaults, {
    placement: 'right'
  , trigger: 'click'
  , content: ''
  , template: '<div class="popover"><div class="arrow"></div><div class="popover-inner"><h3 class="popover-title"></h3><div class="popover-content"><p></p></div></div></div>'
  })

}(window.jQuery);/* =============================================================
 * bootstrap-scrollspy.js v2.2.1
 * http://twitter.github.com/bootstrap/javascript.html#scrollspy
 * =============================================================
 * Copyright 2012 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ============================================================== */


!function ($) {

  "use strict"; // jshint ;_;


 /* SCROLLSPY CLASS DEFINITION
  * ========================== */

  function ScrollSpy(element, options) {
    var process = $.proxy(this.process, this)
      , $element = $(element).is('body') ? $(window) : $(element)
      , href
    this.options = $.extend({}, $.fn.scrollspy.defaults, options)
    this.$scrollElement = $element.on('scroll.scroll-spy.data-api', process)
    this.selector = (this.options.target
      || ((href = $(element).attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '')) //strip for ie7
      || '') + ' .nav li > a'
    this.$body = $('body')
    this.refresh()
    this.process()
  }

  ScrollSpy.prototype = {

      constructor: ScrollSpy

    , refresh: function () {
        var self = this
          , $targets

        this.offsets = $([])
        this.targets = $([])

        $targets = this.$body
          .find(this.selector)
          .map(function () {
            var $el = $(this)
              , href = $el.data('target') || $el.attr('href')
              , $href = /^#\w/.test(href) && $(href)
            return ( $href
              && $href.length
              && [[ $href.position().top, href ]] ) || null
          })
          .sort(function (a, b) { return a[0] - b[0] })
          .each(function () {
            self.offsets.push(this[0])
            self.targets.push(this[1])
          })
      }

    , process: function () {
        var scrollTop = this.$scrollElement.scrollTop() + this.options.offset
          , scrollHeight = this.$scrollElement[0].scrollHeight || this.$body[0].scrollHeight
          , maxScroll = scrollHeight - this.$scrollElement.height()
          , offsets = this.offsets
          , targets = this.targets
          , activeTarget = this.activeTarget
          , i

        if (scrollTop >= maxScroll) {
          return activeTarget != (i = targets.last()[0])
            && this.activate ( i )
        }

        for (i = offsets.length; i--;) {
          activeTarget != targets[i]
            && scrollTop >= offsets[i]
            && (!offsets[i + 1] || scrollTop <= offsets[i + 1])
            && this.activate( targets[i] )
        }
      }

    , activate: function (target) {
        var active
          , selector

        this.activeTarget = target

        $(this.selector)
          .parent('.active')
          .removeClass('active')

        selector = this.selector
          + '[data-target="' + target + '"],'
          + this.selector + '[href="' + target + '"]'

        active = $(selector)
          .parent('li')
          .addClass('active')

        if (active.parent('.dropdown-menu').length)  {
          active = active.closest('li.dropdown').addClass('active')
        }

        active.trigger('activate')
      }

  }


 /* SCROLLSPY PLUGIN DEFINITION
  * =========================== */

  $.fn.scrollspy = function (option) {
    return this.each(function () {
      var $this = $(this)
        , data = $this.data('scrollspy')
        , options = typeof option == 'object' && option
      if (!data) $this.data('scrollspy', (data = new ScrollSpy(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  $.fn.scrollspy.Constructor = ScrollSpy

  $.fn.scrollspy.defaults = {
    offset: 10
  }


 /* SCROLLSPY DATA-API
  * ================== */

  $(window).on('load', function () {
    $('[data-spy="scroll"]').each(function () {
      var $spy = $(this)
      $spy.scrollspy($spy.data())
    })
  })

}(window.jQuery);/* ========================================================
 * bootstrap-tab.js v2.1.1
 * http://twitter.github.com/bootstrap/javascript.html#tabs
 * ========================================================
 * Copyright 2012 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ======================================================== */


!function ($) {

  "use strict"; // jshint ;_;


 /* TAB CLASS DEFINITION
  * ==================== */

  var Tab = function (element, options) {
    this.element = $(element)
    this.options = options;
  }

  Tab.prototype = {

    constructor: Tab

  , show: function () {
      var $this = this.element
        , $ul = $this.closest('ul:not(.dropdown-menu)')
        , selector = this.options.target
        , $previous
        , $target
        , $previousTarget
        , previousSelector
        , e

      if (!selector) {
        selector = $this.attr('href')
        selector = selector && selector.replace(/.*(?=#[^\s]*$)/, '') //strip for ie7
      }

      if ( $this.parent('li').hasClass('active') ) return

      $previous = $ul.find('.active a').last()

      e = $.Event('show', {
        relatedTarget: $previous[0]
      })

      $this.triggerHandler(e)

      if (e.isDefaultPrevented()) return

      $target = $(selector)

      previousSelector = $previous.data('tab') ?
      $previous.data('tab').options.target :
      $previous.data('target');

      if (!previousSelector) {
        previousSelector = $previous.attr('href')
        previousSelector = previousSelector && previousSelector.replace(/.*(?=#[^\s]*$)/, '') //strip for ie7
      }

      $previousTarget = $(previousSelector)

      this.activate($this.parent('li'), $ul)
      this.activate($target, $target.parent(), function () {
        $this.triggerHandler({
          type: 'shown'
        , relatedTarget: $previous[0]
        })

        $previousTarget.triggerHandler('hidden');
        $target.triggerHandler('shown');
      })
    }

  , activate: function ( element, container, callback) {
      var $active = container.find('> .active')
        , transition = callback
            && $.support.transition
            && $active.hasClass('fade')

      function next() {
        $active
          .removeClass('active')
          .find('> .dropdown-menu > .active')
          .removeClass('active')

        element.addClass('active')

        if (transition) {
          element[0].offsetWidth // reflow for transition
          element.addClass('in')
        } else {
          element.removeClass('fade')
        }

        if ( element.parent('.dropdown-menu') ) {
          element.closest('li.dropdown').addClass('active')
        }

        callback && callback()
      }

      transition ?
        $active.one($.support.transition.end, next) :
        next()

      $active.removeClass('in')
    }
  }


 /* TAB PLUGIN DEFINITION
  * ===================== */

  $.fn.tab = function ( option ) {
    return this.each(function () {
      var $this = $(this)
        , data = $this.data('tab')
        , options = $.extend({}, $.fn.modal.defaults, $this.data(), typeof option == 'object' && option)

      if (!data) $this.data('tab', (data = new Tab(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  $.fn.tab.defaults = {}

  $.fn.tab.Constructor = Tab


 /* TAB DATA-API
  * ============ */

  $(document).on('click.tab.data-api', '[data-toggle="tab"], [data-toggle="pill"]', function (e) {
    e.preventDefault()
    $(this).tab('show')
  })

}(window.jQuery);/* =============================================================
 * bootstrap-typeahead.js v2.2.1
 * http://twitter.github.com/bootstrap/javascript.html#typeahead
 * =============================================================
 * Copyright 2012 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ============================================================ */


!function($){

  "use strict"; // jshint ;_;


 /* TYPEAHEAD PUBLIC CLASS DEFINITION
  * ================================= */

  var Typeahead = function (element, options) {
    this.$element = $(element)
    this.options = $.extend({}, $.fn.typeahead.defaults, options)
    this.matcher = this.options.matcher || this.matcher
    this.sorter = this.options.sorter || this.sorter
    this.highlighter = this.options.highlighter || this.highlighter
    this.updater = this.options.updater || this.updater
    this.$menu = $(this.options.menu).appendTo(this.options.container || 'body')
    this.source = this.options.source
    this.shown = false
    this.listen()
  }

  Typeahead.prototype = {

    constructor: Typeahead

  , select: function () {
      var val = this.$menu.find('.active').attr('data-value')
      this.$element
        .val(this.updater(val))
        .change()
      return this.hide()
    }

  , updater: function (item) {
      return item
    }

  , show: function () {
      var pos = $.extend({}, this.$element.position(), {
        height: this.$element[0].offsetHeight
      })

      this.$menu.css({
        top: pos.top + pos.height
      , left: pos.left
      })

      this.$menu.show()
      this.shown = true
      return this
    }

  , hide: function () {
      this.$menu.hide()
      this.shown = false
      return this
    }

  , lookup: function (event) {
      var items

      this.query = this.$element.val()

      if (!this.query || this.query.length < this.options.minLength) {
        return this.shown ? this.hide() : this
      }

      items = $.isFunction(this.source) ? this.source(this.query, $.proxy(this.process, this)) : this.source

      return items ? this.process(items) : this
    }

  , process: function (items) {
      var that = this

      items = $.grep(items, function (item) {
        return that.matcher(item)
      })

      items = this.sorter(items)

      if (!items.length) {
        return this.shown ? this.hide() : this
      }

      return this.render(items.slice(0, this.options.items)).show()
    }

  , matcher: function (item) {
      return ~item.toLowerCase().indexOf(this.query.toLowerCase())
    }

  , sorter: function (items) {
      var beginswith = []
        , caseSensitive = []
        , caseInsensitive = []
        , item

      while (item = items.shift()) {
        if (!item.toLowerCase().indexOf(this.query.toLowerCase())) beginswith.push(item)
        else if (~item.indexOf(this.query)) caseSensitive.push(item)
        else caseInsensitive.push(item)
      }

      return beginswith.concat(caseSensitive, caseInsensitive)
    }

  , highlighter: function (item) {
      var query = this.query.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&')
      return item.replace(new RegExp('(' + query + ')', 'ig'), function ($1, match) {
        return '<strong>' + match + '</strong>'
      })
    }

  , render: function (items) {
      var that = this

      items = $(items).map(function (i, item) {
        i = $(that.options.item).attr('data-value', item)
        i.find('a').html(that.highlighter(item))
        return i[0]
      })

      items.first().addClass('active')
      this.$menu.html(items)
      return this
    }

  , next: function (event) {
      var active = this.$menu.find('.active').removeClass('active')
        , next = active.next()

      if (!next.length) {
        next = $(this.$menu.find('li')[0])
      }

      next.addClass('active')
    }

  , prev: function (event) {
      var active = this.$menu.find('.active').removeClass('active')
        , prev = active.prev()

      if (!prev.length) {
        prev = this.$menu.find('li').last()
      }

      prev.addClass('active')
    }

  , listen: function () {
      this.$element
        .on('blur',     $.proxy(this.blur, this))
        .on('keypress', $.proxy(this.keypress, this))
        .on('keyup',    $.proxy(this.keyup, this))

      if (this.eventSupported('keydown')) {
        this.$element.on('keydown', $.proxy(this.keydown, this))
      }

      this.$menu
        .on('click', $.proxy(this.click, this))
        .on('mouseenter', 'li', $.proxy(this.mouseenter, this))
    }

  , eventSupported: function(eventName) {
      var isSupported = eventName in this.$element
      if (!isSupported) {
        this.$element.setAttribute(eventName, 'return;')
        isSupported = typeof this.$element[eventName] === 'function'
      }
      return isSupported
    }

  , move: function (e) {
      if (!this.shown) return

      switch(e.keyCode) {
        case 9: // tab
        case 13: // enter
        case 27: // escape
          e.preventDefault()
          break

        case 38: // up arrow
          e.preventDefault()
          this.prev()
          break

        case 40: // down arrow
          e.preventDefault()
          this.next()
          break
      }

      e.stopPropagation()
    }

  , keydown: function (e) {
      this.suppressKeyPressRepeat = !~$.inArray(e.keyCode, [40,38,9,13,27])
      this.move(e)
    }

  , keypress: function (e) {
      if (this.suppressKeyPressRepeat) return
      this.move(e)
    }

  , keyup: function (e) {
      switch(e.keyCode) {
        case 40: // down arrow
        case 38: // up arrow
        case 16: // shift
        case 17: // ctrl
        case 18: // alt
          break

        case 9: // tab
        case 13: // enter
          if (!this.shown) return
          this.select()
          break

        case 27: // escape
          if (!this.shown) return
          this.hide()
          break

        default:
          this.lookup()
      }

      e.stopPropagation()
      e.preventDefault()
  }

  , blur: function (e) {
      var that = this
      setTimeout(function () { that.hide() }, 150)
    }

  , click: function (e) {
      e.stopPropagation()
      e.preventDefault()
      this.select()
    }

  , mouseenter: function (e) {
      this.$menu.find('.active').removeClass('active')
      $(e.currentTarget).addClass('active')
    }

  }


  /* TYPEAHEAD PLUGIN DEFINITION
   * =========================== */

  $.fn.typeahead = function (option) {
    return this.each(function () {
      var $this = $(this)
        , data = $this.data('typeahead')
        , options = typeof option == 'object' && option
      if (!data) $this.data('typeahead', (data = new Typeahead(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  $.fn.typeahead.defaults = {
    source: []
  , items: 8
  , menu: '<ul class="typeahead dropdown-menu"></ul>'
  , item: '<li><a href="#"></a></li>'
  , minLength: 1
  }

  $.fn.typeahead.Constructor = Typeahead


 /*   TYPEAHEAD DATA-API
  * ================== */

  $(document).on('focus.typeahead.data-api', '[data-provide="typeahead"]', function (e) {
    var $this = $(this)
    if ($this.data('typeahead')) return
    e.preventDefault()
    $this.typeahead($this.data())
  })

}(window.jQuery);
/* ==========================================================
 * bootstrap-affix.js v2.2.1
 * http://twitter.github.com/bootstrap/javascript.html#affix
 * ==========================================================
 * Copyright 2012 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ========================================================== */


!function ($) {

  "use strict"; // jshint ;_;


 /* AFFIX CLASS DEFINITION
  * ====================== */

  var Affix = function (element, options) {
    this.options = $.extend({}, $.fn.affix.defaults, options)
    this.$window = $(window)
      .on('scroll.affix.data-api', $.proxy(this.checkPosition, this))
      .on('click.affix.data-api',  $.proxy(function () { setTimeout($.proxy(this.checkPosition, this), 1) }, this))
    this.$element = $(element)
    this.checkPosition()
  }

  Affix.prototype.checkPosition = function () {
    if (!this.$element.is(':visible')) return

    var scrollHeight = $(document).height()
      , scrollTop = this.$window.scrollTop()
      , position = this.$element.offset()
      , offset = this.options.offset
      , offsetBottom = offset.bottom
      , offsetTop = offset.top
      , reset = 'affix affix-top affix-bottom'
      , affix

    if (typeof offset != 'object') offsetBottom = offsetTop = offset
    if (typeof offsetTop == 'function') offsetTop = offset.top()
    if (typeof offsetBottom == 'function') offsetBottom = offset.bottom()

    affix = this.unpin != null && (scrollTop + this.unpin <= position.top) ?
      false    : offsetBottom != null && (position.top + this.$element.height() >= scrollHeight - offsetBottom) ?
      'bottom' : offsetTop != null && scrollTop <= offsetTop ?
      'top'    : false

    if (this.affixed === affix) return

    this.affixed = affix
    this.unpin = affix == 'bottom' ? position.top - scrollTop : null

    this.$element.removeClass(reset).addClass('affix' + (affix ? '-' + affix : ''))
  }


 /* AFFIX PLUGIN DEFINITION
  * ======================= */

  $.fn.affix = function (option) {
    return this.each(function () {
      var $this = $(this)
        , data = $this.data('affix')
        , options = typeof option == 'object' && option
      if (!data) $this.data('affix', (data = new Affix(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  $.fn.affix.Constructor = Affix

  $.fn.affix.defaults = {
    offset: 0
  }


 /* AFFIX DATA-API
  * ============== */

  $(window).on('load', function () {
    $('[data-spy="affix"]').each(function () {
      var $spy = $(this)
        , data = $spy.data()

      data.offset = data.offset || {}

      data.offsetBottom && (data.offset.bottom = data.offsetBottom)
      data.offsetTop && (data.offset.top = data.offsetTop)

      $spy.affix(data)
    })
  })


}(window.jQuery);/* ===========================================================
 * bootstrap-modalmanager.js v2.1
 * ===========================================================
 * Copyright 2012 Jordan Schroter.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ========================================================== */

!function ($) {

	"use strict"; // jshint ;_;

	/* MODAL MANAGER CLASS DEFINITION
	* ====================== */

	var ModalManager = function (element, options) {
		this.init(element, options);
	};

	ModalManager.prototype = {

		constructor: ModalManager,

		init: function (element, options) {
			this.$element = $(element);
			this.options = $.extend({}, $.fn.modalmanager.defaults, this.$element.data(), typeof options == 'object' && options);
			this.stack = [];
			this.backdropCount = 0;

			if (this.options.resize) {
				var resizeTimeout,
					that = this;

				$(window).on('resize.modal', function(){
					resizeTimeout && clearTimeout(resizeTimeout);
					resizeTimeout = setTimeout(function(){
						for (var i = 0; i < that.stack.length; i++){
							that.stack[i].isShown && that.stack[i].layout();
						}
					}, 10);
				});
			}
		},

		createModal: function (element, options) {
			$(element).modal($.extend({ manager: this }, options));
		},

		appendModal: function (modal) {
			this.stack.push(modal);

			var that = this;

			modal.$element.on('show.modalmanager', targetIsSelf(function (e) {

				var showModal = function(){
					modal.isShown = true;

					var transition = $.support.transition && modal.$element.hasClass('fade');

					that.$element
						.toggleClass('modal-open', that.hasOpenModal())
						.toggleClass('page-overflow', $(window).height() < that.$element.height());

					modal.$parent = modal.$element.parent();

					modal.$container = that.createContainer(modal);

					modal.$element.appendTo(modal.$container);

					that.backdrop(modal, function () {

						modal.$element.show();

						if (transition) {       
							//modal.$element[0].style.display = 'run-in';       
							modal.$element[0].offsetWidth;
							//modal.$element.one($.support.transition.end, function () { modal.$element[0].style.display = 'block' });  
						}
						
						modal.layout();

						modal.$element
							.addClass('in')
							.attr('aria-hidden', false);

						var complete = function () {
							that.setFocus();
							modal.$element.trigger('shown');
						};

						transition ?
							modal.$element.one($.support.transition.end, complete) :
							complete();
					});
				};

				modal.options.replace ?
					that.replace(showModal) :
					showModal();
			}));

			modal.$element.on('hidden.modalmanager', targetIsSelf(function (e) {

				that.backdrop(modal);

				if (modal.$backdrop){
					$.support.transition && modal.$element.hasClass('fade') ?
						modal.$backdrop.one($.support.transition.end, function () { that.destroyModal(modal) }) :
						that.destroyModal(modal);
				} else {
					that.destroyModal(modal);
				}

			}));

			modal.$element.on('destroy.modalmanager', targetIsSelf(function (e) {
				that.removeModal(modal);
			}));

		},

		destroyModal: function (modal) {

			modal.destroy();

			var hasOpenModal = this.hasOpenModal();

			this.$element.toggleClass('modal-open', hasOpenModal);

			if (!hasOpenModal){
				this.$element.removeClass('page-overflow');
			}

			this.removeContainer(modal);

			this.setFocus();
		},

		hasOpenModal: function () {
			for (var i = 0; i < this.stack.length; i++){
				if (this.stack[i].isShown) return true;
			}

			return false;
		},

		setFocus: function () {
			var topModal;

			for (var i = 0; i < this.stack.length; i++){
				if (this.stack[i].isShown) topModal = this.stack[i];
			}

			if (!topModal) return;

			topModal.focus();

		},

		removeModal: function (modal) {
			modal.$element.off('.modalmanager');
			if (modal.$backdrop) this.removeBackdrop.call(modal);
			this.stack.splice(this.getIndexOfModal(modal), 1);
		},

		getModalAt: function (index) {
			return this.stack[index];
		},

		getIndexOfModal: function (modal) {
			for (var i = 0; i < this.stack.length; i++){
				if (modal === this.stack[i]) return i;
			}
		},

		replace: function (callback) {
			var topModal;

			for (var i = 0; i < this.stack.length; i++){
				if (this.stack[i].isShown) topModal = this.stack[i];
			}

			if (topModal) {
				this.$backdropHandle = topModal.$backdrop;
				topModal.$backdrop = null;

				callback && topModal.$element.one('hidden',
					targetIsSelf( $.proxy(callback, this) ));

				topModal.hide();
			} else if (callback) {
				callback();
			}
		},

		removeBackdrop: function (modal) {
			modal.$backdrop.remove();
			modal.$backdrop = null;
		},

		createBackdrop: function (animate) {
			var $backdrop;

			if (!this.$backdropHandle) {
				$backdrop = $('<div class="modal-backdrop ' + animate + '" />')
					.appendTo(this.$element);
			} else {
				$backdrop = this.$backdropHandle;
				$backdrop.off('.modalmanager');
				this.$backdropHandle = null;
				this.isLoading && this.removeSpinner();
			}

			return $backdrop
		},

		removeContainer: function (modal) {
			modal.$container.remove();
			modal.$container = null;
		},

		createContainer: function (modal) {
			var $container;

			$container = $('<div class="modal-scrollable">')
				.css('z-index', getzIndex( 'modal',
					modal ? this.getIndexOfModal(modal) : this.stack.length ))
				.appendTo(this.$element);

			if (modal && modal.options.backdrop != 'static') {
				$container.on('click.modal', targetIsSelf(function (e) {
					modal.hide();
				}));
			} else if (modal) {
				$container.on('click.modal', targetIsSelf(function (e) {
					modal.attention();
				}));
			}

			return $container;

		},

		backdrop: function (modal, callback) {
			var animate = modal.$element.hasClass('fade') ? 'fade' : '',
				showBackdrop = modal.options.backdrop &&
					this.backdropCount < this.options.backdropLimit;

			if (modal.isShown && showBackdrop) {
				var doAnimate = $.support.transition && animate && !this.$backdropHandle;

				modal.$backdrop = this.createBackdrop(animate);

				modal.$backdrop.css('z-index', getzIndex( 'backdrop', this.getIndexOfModal(modal) ));

				if (doAnimate) modal.$backdrop[0].offsetWidth; // force reflow

				modal.$backdrop.addClass('in');

				this.backdropCount += 1;

				doAnimate ?
					modal.$backdrop.one($.support.transition.end, callback) :
					callback();

			} else if (!modal.isShown && modal.$backdrop) {
				modal.$backdrop.removeClass('in');

				this.backdropCount -= 1;

				var that = this;

				$.support.transition && modal.$element.hasClass('fade')?
					modal.$backdrop.one($.support.transition.end, function () { that.removeBackdrop(modal) }) :
					that.removeBackdrop(modal);

			} else if (callback) {
				callback();
			}
		},

		removeSpinner: function(){
			this.$spinner && this.$spinner.remove();
			this.$spinner = null;
			this.isLoading = false;
		},

		removeLoading: function () {
			this.$backdropHandle && this.$backdropHandle.remove();
			this.$backdropHandle = null;
			this.removeSpinner();
		},

		loading: function (callback) {
			callback = callback || function () { };

			this.$element
				.toggleClass('modal-open', !this.isLoading || this.hasOpenModal())
				.toggleClass('page-overflow', $(window).height() < this.$element.height());

			if (!this.isLoading) {

				this.$backdropHandle = this.createBackdrop('fade');

				this.$backdropHandle[0].offsetWidth; // force reflow

				this.$backdropHandle
					.css('z-index', getzIndex('backdrop', this.stack.length))
					.addClass('in');

				var $spinner = $(this.options.spinner)
					.css('z-index', getzIndex('modal', this.stack.length))
					.appendTo(this.$element)
					.addClass('in');

				this.$spinner = $(this.createContainer())
					.append($spinner)
					.on('click.modalmanager', $.proxy(this.loading, this));

				this.isLoading = true;

				$.support.transition ?
					this.$backdropHandle.one($.support.transition.end, callback) :
					callback();

			} else if (this.isLoading && this.$backdropHandle) {
				this.$backdropHandle.removeClass('in');

				var that = this;
				$.support.transition ?
					this.$backdropHandle.one($.support.transition.end, function () { that.removeLoading() }) :
					that.removeLoading();

			} else if (callback) {
				callback(this.isLoading);
			}
		}
	};

	/* PRIVATE METHODS
	* ======================= */

	// computes and caches the zindexes
	var getzIndex = (function () {
		var zIndexFactor,
			baseIndex = {};

		return function (type, pos) {

			if (typeof zIndexFactor === 'undefined'){
				var $baseModal = $('<div class="modal hide" />').appendTo('body'),
					$baseBackdrop = $('<div class="modal-backdrop hide" />').appendTo('body');

				baseIndex['modal'] = +$baseModal.css('z-index');
				baseIndex['backdrop'] = +$baseBackdrop.css('z-index');
				zIndexFactor = baseIndex['modal'] - baseIndex['backdrop'];

				$baseModal.remove();
				$baseBackdrop.remove();
				$baseBackdrop = $baseModal = null;
			}

			return baseIndex[type] + (zIndexFactor * pos);

		}
	}());

	// make sure the event target is the modal itself in order to prevent
	// other components such as tabsfrom triggering the modal manager.
	// if Boostsrap namespaced events, this would not be needed.
	function targetIsSelf(callback){
		return function (e) {
			if (this === e.target){
				return callback.apply(this, arguments);
			}
		}
	}


	/* MODAL MANAGER PLUGIN DEFINITION
	* ======================= */

	$.fn.modalmanager = function (option, args) {
		return this.each(function () {
			var $this = $(this),
				data = $this.data('modalmanager');

			if (!data) $this.data('modalmanager', (data = new ModalManager(this, option)));
			if (typeof option === 'string') data[option].apply(data, [].concat(args))
		})
	};

	$.fn.modalmanager.defaults = {
		backdropLimit: 999,
		resize: true,
		spinner: '<div class="loading-spinner fade" style="width: 200px; margin-left: -100px;"><div class="progress progress-striped active"><div class="bar" style="width: 100%;"></div></div></div>'
	};

	$.fn.modalmanager.Constructor = ModalManager

}(jQuery);
/* ===========================================================
 * bootstrap-modal.js v2.1
 * ===========================================================
 * Copyright 2012 Jordan Schroter
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ========================================================== */


!function ($) {

	"use strict"; // jshint ;_;

	/* MODAL CLASS DEFINITION
	* ====================== */

	var Modal = function (element, options) {
		this.init(element, options);
	};

	Modal.prototype = {

		constructor: Modal,

		init: function (element, options) {
			this.options = options;

			this.$element = $(element)
				.delegate('[data-dismiss="modal"]', 'click.dismiss.modal', $.proxy(this.hide, this));

			this.options.remote && this.$element.find('.modal-body').load(this.options.remote);

			var manager = typeof this.options.manager === 'function' ?
				this.options.manager.call(this) : this.options.manager;

			manager = manager.appendModal ?
				manager : $(manager).modalmanager().data('modalmanager');

			manager.appendModal(this);
		},

		toggle: function () {
			return this[!this.isShown ? 'show' : 'hide']();
		},

		show: function () {
			var e = $.Event('show');

			if (this.isShown) return;

			this.$element.trigger(e);

			if (e.isDefaultPrevented()) return;

			this.escape();

			this.tab();

			this.options.loading && this.loading();
		},

		hide: function (e) {
			e && e.preventDefault();

			e = $.Event('hide');

			this.$element.trigger(e);

			if (!this.isShown || e.isDefaultPrevented()) return (this.isShown = false);

			this.isShown = false;

			this.escape();

			this.tab();

			this.isLoading && this.loading();

			$(document).off('focusin.modal');

			this.$element
				.removeClass('in')
				.removeClass('animated')
				.removeClass(this.options.attentionAnimation)
				.removeClass('modal-overflow')
				.attr('aria-hidden', true);

			$.support.transition && this.$element.hasClass('fade') ?
				this.hideWithTransition() :
				this.hideModal();
		},

		layout: function () {
			var prop = this.options.height ? 'height' : 'max-height',
				value = this.options.height || this.options.maxHeight;

			if (this.options.width){
				this.$element.css('width', this.options.width);

				var that = this;
				this.$element.css('margin-left', function () {
					if (/%/ig.test(that.options.width)){
						return -(parseInt(that.options.width) / 2) + '%';
					} else {
						return -($(this).width() / 2) + 'px';
					}
				});
			} else {
				this.$element.css('width', '');
				this.$element.css('margin-left', '');
			}

			this.$element.find('.modal-body')
				.css('overflow', '')
				.css(prop, '');

			if (value){
				this.$element.find('.modal-body')
					.css('overflow', 'auto')
					.css(prop, value);
			}

			var modalOverflow = $(window).height() - 10 < this.$element.height();

			if (modalOverflow || this.options.modalOverflow) {
				this.$element
					.css('margin-top', 0)
					.addClass('modal-overflow');
			} else {
				this.$element
					.css('margin-top', 0 - this.$element.height() / 2)
					.removeClass('modal-overflow');
			}
		},

		tab: function () {
			var that = this;

			if (this.isShown && this.options.consumeTab) {
				this.$element.on('keydown.tabindex.modal', '[data-tabindex]', function (e) {
			    	if (e.keyCode && e.keyCode == 9){
						var $next = $(this),
							$rollover = $(this);

						that.$element.find('[data-tabindex]:enabled:not([readonly])').each(function (e) {
							if (!e.shiftKey){
						 		$next = $next.data('tabindex') < $(this).data('tabindex') ?
									$next = $(this) :
									$rollover = $(this);
							} else {
								$next = $next.data('tabindex') > $(this).data('tabindex') ?
									$next = $(this) :
									$rollover = $(this);
							}
						});

						$next[0] !== $(this)[0] ?
							$next.focus() : $rollover.focus();

						e.preventDefault();
					}
				});
			} else if (!this.isShown) {
				this.$element.off('keydown.tabindex.modal');
			}
		},

		escape: function () {
			var that = this;
			if (this.isShown && this.options.keyboard) {
				if (!this.$element.attr('tabindex')) this.$element.attr('tabindex', -1);

				this.$element.on('keyup.dismiss.modal', function (e) {
					e.which == 27 && that.hide();
				});
			} else if (!this.isShown) {
				this.$element.off('keyup.dismiss.modal')
			}
		},

		hideWithTransition: function () {
			var that = this
				, timeout = setTimeout(function () {
					that.$element.off($.support.transition.end);
					that.hideModal();
				}, 500);

			this.$element.one($.support.transition.end, function () {
				clearTimeout(timeout);
				that.hideModal();
			});
		},

		hideModal: function () {
			var prop = this.options.height ? 'height' : 'max-height';
			var value = this.options.height || this.options.maxHeight;

			if (value){
				this.$element.find('.modal-body')
					.css('overflow', '')
					.css(prop, '');
			}

			this.$element
				.hide()
				.trigger('hidden');
		},

		removeLoading: function () {
			this.$loading.remove();
			this.$loading = null;
			this.isLoading = false;
		},

		loading: function (callback) {
			callback = callback || function () {};

			var animate = this.$element.hasClass('fade') ? 'fade' : '';

			if (!this.isLoading) {
				var doAnimate = $.support.transition && animate;

				this.$loading = $('<div class="loading-mask ' + animate + '">')
					.append(this.options.spinner)
					.appendTo(this.$element);

				if (doAnimate) this.$loading[0].offsetWidth; // force reflow

				this.$loading.addClass('in');

				this.isLoading = true;

				doAnimate ?
					this.$loading.one($.support.transition.end, callback) :
					callback();

			} else if (this.isLoading && this.$loading) {
				this.$loading.removeClass('in');

				var that = this;
				$.support.transition && this.$element.hasClass('fade')?
					this.$loading.one($.support.transition.end, function () { that.removeLoading() }) :
					that.removeLoading();

			} else if (callback) {
				callback(this.isLoading);
			}
		},

		focus: function () {
			var $focusElem = this.$element.find(this.options.focusOn);

			$focusElem = $focusElem.length ? $focusElem : this.$element;

			$focusElem.focus();
		},

		attention: function (){
			// NOTE: transitionEnd with keyframes causes odd behaviour

			if (this.options.attentionAnimation){
				this.$element
					.removeClass('animated')
					.removeClass(this.options.attentionAnimation);

				var that = this;

				setTimeout(function () {
					that.$element
						.addClass('animated')
						.addClass(that.options.attentionAnimation);
				}, 0);
			}


			this.focus();
		},


		destroy: function () {
			var e = $.Event('destroy');
			this.$element.trigger(e);
			if (e.isDefaultPrevented()) return;

			this.teardown();
		},

		teardown: function () {
			if (!this.$parent.length){
				this.$element.remove();
				this.$element = null;
				return;
			}

			if (this.$parent !== this.$element.parent()){
				this.$element.appendTo(this.$parent);
			}

			this.$element.off('.modal');
			this.$element.removeData('modal');
			this.$element
				.removeClass('in')
				.attr('aria-hidden', true);
		}
	};


	/* MODAL PLUGIN DEFINITION
	* ======================= */

	$.fn.modal = function (option, args) {
		return this.each(function () {
			var $this = $(this),
				data = $this.data('modal'),
				options = $.extend({}, $.fn.modal.defaults, $this.data(), typeof option == 'object' && option);

			if (!data) $this.data('modal', (data = new Modal(this, options)));
			if (typeof option == 'string') data[option].apply(data, [].concat(args));
			else if (options.show) data.show()
		})
	};

	$.fn.modal.defaults = {
		keyboard: true,
		backdrop: true,
		loading: false,
		show: true,
		width: null,
		height: null,
		maxHeight: null,
		modalOverflow: false,
		consumeTab: true,
		focusOn: null,
		replace: false,
		resize: false,
		attentionAnimation: 'shake',
		manager: 'body',
		spinner: '<div class="loading-spinner" style="width: 200px; margin-left: -100px;"><div class="progress progress-striped active"><div class="bar" style="width: 100%;"></div></div></div>'
	};

	$.fn.modal.Constructor = Modal;


	/* MODAL DATA-API
	* ============== */

	$(function () {
		$(document).off('click.modal').on('click.modal.data-api', '[data-toggle="modal"]', function ( e ) {
			var $this = $(this),
				href = $this.attr('href'),
				$target = $($this.attr('data-target') || (href && href.replace(/.*(?=#[^\s]+$)/, ''))), //strip for ie7
				option = $target.data('modal') ? 'toggle' : $.extend({ remote: !/#/.test(href) && href }, $target.data(), $this.data());

			e.preventDefault();
			$target
				.modal(option)
				.one('hide', function () {
					$this.focus();
				})
		});
	});

}(window.jQuery);

!function ($) {

	"use strict"; // jshint ;_;

	var DataGrid = function (element, options) {
		this.init(element, options);
	}

	// expose to global scope
	window.DataGrid = DataGrid;

	/* DATAGRID CLASS DEFINITION
	* =========================== */

	DataGrid.prototype = {

		constructor: DataGrid,

		init: function(element, options){
			var $element = this.$element = $(element);
			this.options = $.extend(true, {}, $.fn.datagrid.defaults, $element.data(), options);

			$element.html($(this.options.template));

			var $dataGridContainer = $element.find('.datagrid-container');

			this.$table = $('<table>');
			$dataGridContainer.html(this.$table);

			var that = this;

			this.fixedHeight = unwrapFunction.call(this, this.options.fixedHeight);
			if (this.fixedHeight) {
				var $scrollPane = $('<div class="datagrid-scrollpane">').addClass('fixed');
				var $shadowTop = $('<div class="scroll-shadow top">');
				var $shadowBottom = $('<div class="scroll-shadow bottom">');

				$dataGridContainer.wrap($scrollPane);
				$shadowTop.insertAfter($dataGridContainer);
				$shadowBottom.insertAfter($dataGridContainer);
				$dataGridContainer.addClass('fixed').css({ height: this.fixedHeight });

				var resizeTimeout;
				if (this.options.resize){
					$(window).bind('resize.datagrid', function(){
						if (resizeTimeout) clearTimeout(resizeTimeout);
						resizeTimeout = setTimeout(function(){
							that.calculateFixedWidth();
						}, that.options.resizeTimeout);
					});
				}

				var $scrollpane = that.$element.find('.datagrid-scrollpane');
				$dataGridContainer.bind('scroll.datagrid', function(){
					var $this = $(this);

					$scrollpane.toggleClass('shadowTop', $this.scrollTop() > 0 && that.options.shadowTop);
					$scrollpane.toggleClass('shadowBottom', $this.scrollTop() < $this.height() && that.options.shadowBottom);
					$scrollpane.find('.fixed-header').css({ 'left': -$this.scrollLeft() });

				});

				$element.on('rendered', function(){
					that.renderFixedComponents();
				});
			}

			// structure for storing which headers were rendered
			this.cachedHeaders = {};
			if (this.options.cacheHeaders){
				$element.on('rendered', function(){
					var cachedHeaders = that.cachedHeaders;
					for (var groupkey in cachedHeaders){
						that.$table.find('tbody tr.header[data-groupkey="' + groupkey + '"]').click();
					}
				});
			}

			if (this.options.showSearch){
				var $searchContainer = $element.find('.datagrid-controls'),
					$search = this.$search = $(this.options.searchTemplate);

				$searchContainer.html($search);
				var options = this.options.searchOptions;
				options.datagrid = this;

				// to avoid browser rendering issues
				//$search.hide();
				//setTimeout(function(){
					//$search.show().searchfield(options);
					$search.searchfield(options);
					$search.parents('.input-append').addClass('pull-left');
					$search.parents('form').addClass('pull-left');
				//}, 0);

				this.process = function(response){
					$search.searchfield('process', response);
				}
			}

			// default schema
			if (!this.options.schema){
				var schema = [];
				for (var field in this.options.data[0]){
					schema.push($.extend({}, this.options.field, { index: field }))
				}

				this.options.schema = schema;
			} else if (this.options.schema && typeof this.options.schema[0] === 'string') {
				for (var i = 0; i < this.options.schema.length; i++){
					this.options.schema[i] = $.extend({}, this.options.field, { index: this.options.schema[i] });
				}
			} else {
				for (var i = 0; i < this.options.schema.length; i++){
					this.options.schema[i] = $.extend({}, this.options.field, this.options.schema[i]);
				}
			}

			// datagrid controls
			this.$controls = $element.find('.datagrid-controls');
			if (unwrapFunction.call(this, this.options.showControls)){

				if (unwrapFunction.call(this, this.options.fluidLayout)) {
					$element.find('.datagrid-controls-container > .row')
						.removeClass('row')
						.addClass('row-fluid');
				}

				//wait for first datagrid render before drawing controls
				$element.one('rendered', function(){
					that.renderControls();
				});

				$element.delegate('.showHide', 'click.datagrid', function(){
					that.renderShowHideList();
				});

				$element.delegate('.showHide ul li', 'click.datagrid', function(){
					that.toggleField($(this).data('fieldid'));
				});

				$element.delegate('.groupBy', 'click.datagrid', function(){
					that.renderGroupByList();
				});

				$element.delegate('.groupBy ul li', 'click.datagrid', function(){
					that.groupByField($(this).data('fieldid'));
				});

				$element.delegate('.expandAll', 'click.datagrid', function(){
					that.expandAll();
				});

				$element.delegate('.collapseAll', 'click.datagrid', function(){
					that.collapseAll();
				});
			} else {
				this.$controls.hide();
			}

			// events


			$element.delegate('.sortable', 'click.datagrid', function(){
				var schema = that.options.schema,
					$target = $(this),
					field = schema[$target.data('fieldid')];

				if (!field || typeof field.sort !== 'function') return;

				for (var i = 0; i < schema.length; i++){
					if (schema[i] == field) continue;
					delete schema[i].sortDirection;
				}

				if (field.sortDirection == DataGrid.sortAsc){
					field.sortDirection = DataGrid.sortDesc;
				} else {
					field.sortDirection = DataGrid.sortAsc;
				}

				var sortFn = field.sort;
				if (sortFn === DataGrid.sortBy){
					sortFn = field.sort(field.index);
				}

				that.sortBy(sortFn, field.sortDirection);
			});

			$element.delegate('tbody tr:not(.header) td', 'click.datagrid', function(e){
				var $target = $(this),
					field = that.options.schema[$target.data('fieldid')];

				if (!field || typeof field.action !== 'function') return;

				var args = that.dataFor($target);
				args.push(e);
				field.action.apply(that, args);
			});

			if (this.options.responsive && window.matchMedia){
				var mediaQueries = this.options.mediaQueries,
					responsiveTimeout;

				var phoneCheck = window.matchMedia(mediaQueries.phone);
				if (phoneCheck.matches) widthChanged.call(that, 'phone');
				phoneCheck.addListener(function(mq){
					if (!mq.matches) return;
					if (responsiveTimeout) clearTimeout(responsiveTimeout);
					responsiveTimeout = setTimeout(function(){
						widthChanged.call(that, 'phone');
					}, that.options.mediaQueryTimeout);
				});

				var tabletCheck = window.matchMedia(mediaQueries.tablet);
				if (tabletCheck.matches) widthChanged.call(that, 'tablet');
				tabletCheck.addListener(function(mq){
					if (!mq.matches) return;
					if (responsiveTimeout) clearTimeout(responsiveTimeout);
					responsiveTimeout = setTimeout(function(){
						widthChanged.call(that, 'tablet');
					}, that.options.mediaQueryTimeout);
				});

				var desktopCheck = window.matchMedia(mediaQueries.desktop);
				if (desktopCheck.matches) widthChanged.call(that, 'desktop');
				desktopCheck.addListener(function(mq){
					if (!mq.matches) return;
					if (responsiveTimeout) clearTimeout(responsiveTimeout);
					responsiveTimeout = setTimeout(function(){
						widthChanged.call(that, 'desktop');
					}, that.options.mediaQueryTimeout);
				});
			}

			// publish events
			$element.triggerHandler('initialized');

			if (this.options.renderAfterInit && !(this.options.responsive && window.matchMedia)){
				this.render();
			}
		},

		setData: function(data){
			this.options.data = data;
		},

		getData: function(data){
			return this.options.data;
		},

		setOptions: function(options){
			this.options = $.extend(true, {}, this.options, options);
		},

		getOptions: function(){
			return this.options;
		},

		renderControls: function(){
			var $controls = $(this.options.controlsTemplate);
			if (!unwrapFunction.call(this, this.options.showGroupBy)){
				$controls.find('.groupBy, .expandAll, .collapseAll').remove();
			}
			this.$controls.append($controls);
		},

		renderShowHideList: function(){
			var $showHideList = this.$controls.find('.showHide ul'),
				schema = this.options.schema,
				r = [];

			r.push('<li class="nav-header">' + this.options.showHideTitle + '</li>');
			for (var i = 0; i < schema.length; i++){
				if (typeof schema[i].hidden !== 'function' && schema[i].allowHidden){
					r.push('<li data-fieldid="' + i + '"><a href="javascript:;">')
					if (!schema[i].hidden){
						r.push('<i class="glyphicon-ok" style="margin: 2px 4px 0 -14px; font-size: 10px"></i>');
					}
					r.push(unwrapFunction(schema[i].header, schema[i].index))
					r.push('</a></li>');
				}
			}

			$showHideList.html(r.join(''));
		},

		renderGroupByList: function(){
			var $groupByList = this.$controls.find('.groupBy ul'),
				schema = this.options.schema,
				r = [];

			r.push('<li class="nav-header">' + this.options.groupByTitle + '</li>');
			for (var i = 0; i < schema.length; i++){
				if (unwrapFunction(schema[i].allowGroupBy)){
					r.push('<li data-fieldid="' + i + '"><a href="javascript:;">')
					if (this.options.mutators.groupBy == schema[i].index){
						r.push('<i class="glyphicon-ok" style="margin: 2px 4px 0 -14px; font-size: 10px"></i>');
					}
					r.push(unwrapFunction(schema[i].header, schema[i].index))
					r.push('</a></li>');
				}
			}

			$groupByList.html(r.join(''));
		},

		calculateFixedWidth: function(){
			var $table = this.$element.find('.datagrid'),
				$fixedHeader = this.$element.find('.fixed-header'),
				$shadowTop = this.$element.find('.scroll-shadow.top'),
				$shadowBottom = this.$element.find('.scroll-shadow.bottom');

			$fixedHeader.width($table.width());

			$table.find('thead tr th').each(function(i){
				$fixedHeader.find('thead tr th:nth-child(' + (i + 1) + ')').width($(this).width());
			});

			$shadowTop.css({ top: $fixedHeader.height() });
			$shadowTop.width($fixedHeader.width());

			if (this.options.fixedFooter){
				var $fixedFooter = this.$element.find('.fixed-footer');

				$fixedFooter.width($table.width());

				$table.find('tfoot tr td').each(function(i){
					$fixedFooter.find('tfoot tr td:nth-child(' + (i + 1) + ')').width($(this).width());
				});

				$shadowBottom.css({ bottom: $fixedFooter.height() });
				$shadowBottom.width($fixedFooter.width());
			}
		},

		renderFixedComponents: function(){
			this.$element.find('.fixed-header, .fixed-footer').remove();

			var $fixedHeader = $('<table>'),
				$thead = this.$table.find('thead');

			$fixedHeader
				.attr('class', this.$table.attr('class'))
				.removeClass('datagrid')
				.addClass('fixed-header')
				.css({ margin: 0 });

			//this.$table.css({ position: 'absolute', 'margin-top': -$thead.height() });
			$fixedHeader.html($thead.clone());
			$fixedHeader.prependTo(this.$element.find('.datagrid-scrollpane'));
			$thead.removeClass('empty');

			if (this.options.fixedFooter){
				var $fixedFooter = $('<table>'),
					$tfoot = this.$table.find('tfoot');

				$fixedFooter
					.attr('class', this.$table.attr('class'))
					.removeClass('datagrid')
					.addClass('fixed-footer')
					.css({ margin: 0 });

				$fixedFooter.html($tfoot.clone());
				$tfoot.css({ visibility: 'hidden', 'border-color': 'transparent' });
				$tfoot.find('td').css({ visibility: 'hidden', 'border-color': 'transparent' });
				$fixedFooter.appendTo(this.$element.find('.datagrid-scrollpane'));
			}

			this.calculateFixedWidth();
		},

		renderHeader: function(){
			var schema = this.options.schema,
				r = [];

			r.push('<tr>');
			for (var i = 0; i < schema.length; i++) {
				if (unwrapFunction(schema[i].hidden)) continue;

				r.push('<th');

				var classNames = [];
				if (schema[i].sort) {
					classNames.push('sortable');
					if (schema[i].sortDirection == DataGrid.sortAsc){
						classNames.push('sortAsc');
					} else if (schema[i].sortDirection == DataGrid.sortDesc){
						classNames.push('sortDesc');
					}
				}

				if (schema[i].className) classNames.push(unwrapFunction(schema[i].className));
				r.push(' class="' + classNames.join(' ') + '"');
				if (schema[i].width) r.push(' style="width: ' + unwrapFunction(schema[i].width) + '"')
				r.push(' data-fieldid="' + i + '"');
				r.push('>');
				var header = unwrapFunction(schema[i].header, schema[i].index);
				if (!header && header !== 0) header = '&nbsp;'; //fix for quirks mode tables
				r.push(header);
				r.push('</th>');
			}
			r.push('</tr>');

			return r.join('');
		},

		renderBody: function(data, groupId){
			var schema = this.options.schema,
				r = [];

			for (var i = 0; i < data.length; i++) {
				r.push('<tr data-index="' + i + '"');

				if (typeof groupId !== 'undefined') r.push(' data-group="' + groupId + '"');

				var classNames = [];
				if (this.options.pianoKey) classNames.push(i % 2 ? 'even' : 'odd');
				if (this.options.rowClassName) classNames.push(unwrapFunction.call(this, this.options.rowClassName, [ i, data[i] ]));
				if (classNames.length) r.push(' class="' + classNames.join(' ') + '"');

				r.push('>');

				for (var j = 0; j < schema.length; j++) {
					if (unwrapFunction(schema[j].hidden)) continue;

					var classNames = [];

					r.push('<td');
					if (schema[j].className) classNames.push(unwrapFunction(schema[j].className, [ data[i][schema[j].index], data[i] ]))
					r.push(' class="' + classNames.join(' ') + '"');
					if (schema[j].width) r.push(' style="width: ' + unwrapFunction(schema[j].width) + '"')
					r.push(' data-fieldid="' + j + '"');
					r.push('>');
					var cell = unwrapFunction(schema[j].view, [ data[i][schema[j].index], data[i] ]);
					if (!cell && cell !== 0) cell = '&nbsp;'; //fix for quirks mode tables
					r.push(cell)
					r.push('</td>');
				}

				r.push('</tr>');
			}

			return r.join('');
		},

		renderFooter: function(data){
			var schema = this.options.schema,
				r = [],
				colspan = 0,
				renderedText = false;

			r.push('<tr>');
			for (var j = 0; j < schema.length; j++){
				if (!unwrapFunction(schema[j].hidden)) {
					if (!schema[j].aggregate){
						colspan++;
					}
				}

				if (schema[j].aggregate || j == schema.length - 1){
					r.push('<td colspan="' + colspan + '">');
					if (!renderedText){
						r.push('<span>' + unwrapFunction(this.options.footerText, JsLinq(data)) + '</span>');
						renderedText = true;
					} else {
						r.push('&nbsp;');
					}
					r.push('</td>');
					colspan = 0;

					if (schema[j].aggregate){
						r.push('<td>' + unwrapFunction(schema[j].aggregate, [ schema[j].index, JsLinq(data) ]) + '</td>');
					}
				}
			}
			r.push('</tr>');
			return r.join('');
		},

		render: function(){
			var schema = this.options.schema,
				data = this.options.data;

			var $table = $('<table class="datagrid table">');

			if (this.options.striped){
				$table.addClass('table-striped');
			}

			var dataMutated = this.dataMutated = applyMutators.call(this);

			var $header = $('<thead>'),
				$body  = $('<tbody>'),
				$footer = $('<tfoot>');

			$header.html(this.renderHeader());
			if (dataMutated.length){
				if (this.options.mutators.groupBy){
					// grouped data
					var rows;
					for (var i = 0; i < dataMutated.length; i++) {
						//Generate group header

						var $tr = $('<tr class="header collapsed" data-group="' + i + '" data-groupkey="' + dataMutated[i].key + '">'),
							colspan = 0,
							renderedText = false;


						for (var j = 0; j < schema.length; j++){
							if (unwrapFunction(schema[j].hidden) && j !== schema.length - 1) continue;

							if (!schema[j].aggregate){
								colspan++;
							}

							if (schema[j].aggregate || j == schema.length - 1){
								var r = ['<td colspan="' + colspan + '">'];
								if (!renderedText){
									renderedText = true;
									r.push('<span>' + unwrapFunction(this.options.groupByText, [ dataMutated[i].key, this.options.mutators.groupBy, dataMutated[i] ]) + '</span>');
								} else {
									r.push('&nbsp;');
								}
								r.push('</td>');

								colspan = 0;
								$tr.append(r.join(''));

								if (schema[j].aggregate){
									$tr.append('<td>' + unwrapFunction(schema[j].aggregate, [ schema[j].index, dataMutated[i] ]) + '</td>');
								}
							}
						}

						if (this.options.chevronPosition === 'right'){
							$tr.find('td:last').append(' <i class="glyphicon-chevron-down pull-right"></i>');
						} else if (this.options.chevronPosition === 'left'){
							$tr.find('td:first').prepend('<i class="glyphicon-chevron-down"></i> ');
						}

						$body.append($tr);

						//Generate group data view and link to header
						var that = this;
						(function (index, $headerRow) {
							rows = function () {
								var dataRows = $(that.renderBody(dataMutated[index], index));
								dataRows.insertAfter($headerRow);
								return dataRows;
							};
						})(i, $tr);

						(function (rows, $tr) {
							$tr.click(function () {
								var collapsed = $tr.hasClass("collapsed");
								if (typeof rows === 'function') {
									rows = rows();
								}

								if (collapsed) { rows.removeClass('hidden'); }
								else { rows.addClass('hidden'); }

								$tr.toggleClass("collapsed", !collapsed);

								if (collapsed){
									// icon-delcartion needs to be first for icon fonts ???
									var $icon = $tr.find('i.glyphicon-chevron-down').removeClass('glyphicon-chevron-down');
									$icon.attr('class', 'glyphicon-chevron-up ' + $icon.attr('class'));
									that.cachedHeaders[$tr.data('groupkey')] = true;
								} else {
									var $icon = $tr.find('i.glyphicon-chevron-up').removeClass('glyphicon-chevron-up');
									$icon.attr('class', 'glyphicon-chevron-down ' + $icon.attr('class'));
									delete that.cachedHeaders[$tr.data('groupkey')];
								}

								if (that.fixedHeight){
									that.calculateFixedWidth();
								}

							});//.css('cursor', 'pointer');
						})(rows, $tr);
					}
				} else {
					$body.html(this.renderBody(dataMutated));
				}
			} else {
				$header.addClass('empty');
			}


			$table.html($header);
			$table.append($body);

			if (this.options.showFooter){
				$footer.html(this.renderFooter(dataMutated));
				$table.append($footer);
			}

			this.$table.replaceWith($table);
			this.$table = $table;

			// publish events
			this.$element.triggerHandler('rendered');
		},

		displayError: function(error){
			this.options.data = [];
			this.process([]);
			var errorRow = '<tr><td colspan="' + this.$table.find('thead th').length + '"><div class="text-error">' + error + '<div></td></tr>';
			this.$element.find('thead').removeClass('empty');
			this.$table.find('tbody').html(errorRow);
		},

		toggleField: function(fieldId){
			var field = this.options.schema[fieldId];
			field.hidden = !field.hidden;
			this.render();
		},

		sortBy: function(sortFn, sortDir){
			var sorter = function(fn, dir){
				return function(){
					return dir * fn.apply(this, arguments);
				}
			}

			this.orderBy(sorter(sortFn, sortDir));
			this.render();
		},

		groupByField: function(fieldId){
			var field = this.options.schema[fieldId];
			if (this.options.mutators.groupBy == field.index){
				this.groupBy(null);
			} else {
				this.groupBy(field.index);
			}

			this.cachedHeaders = {};
			this.render();
		},

		collapseAll: function () {
			this.$table.find('tr.header:not(.collapsed)').click();
		},

		expandAll: function () {
			this.$table.find('tr.header.collapsed').click();
		},

		select: function(prop){
			this.options.mutators.select = prop;
			return this;
		},

		where: function(prop){
			this.options.mutators.where = prop;
			return this;
		},

		groupBy: function(prop){
			this.options.mutators.groupBy = prop;
			return this;
		},

		orderBy: function(prop){
			this.options.mutators.orderBy = prop;
			return this;
		},

		destroy: function(){
			this.$search && this.$search.searchfield('destroy');

			this.$element.unbind('.datagrid');
			this.$element.empty();

			this.$element.removeData('datagrid');

			// publish events
			this.$element.triggerHandler('destroyed');
		},

		dataFor: function(elem){
			var $elem = $(elem),
				field = this.options.schema[$elem.closest('td').data('fieldid')],
				$tr = $elem.closest('tr'),
				groupId = $tr.data('group'),
				index = $tr.data('index');

			var data = [];

			if (typeof index === 'undefined') return [];

			if (typeof groupId !== 'undefined') {
				data[0] = this.dataMutated[groupId][index][field.index];
				data[1] = this.dataMutated[groupId][index];
			} else {
				data[0] = this.dataMutated[index][field.index];
				data[1] = this.dataMutated[index];
			}

			return data;
		},

		// function to construct a where clause based on a given filter and render new data
		filterData: function(filter, cb){
			var isMatch = function(value, field, type){
				var regexp, match = false,

				value = (''+value).toUpperCase();
				field = (''+field).toUpperCase();

				var values = value.split(','), match = false;
				for (var i = 0, j = values.length; i < j; i++){
					if (type === 'begins') {
						regexp = new RegExp('^' + values[i]);
						match = match || regexp.test(field);
					} else if (type === 'ends') {
						regexp = new RegExp(values[i] + '$');
						match = match || regexp.test(field);
					} else if (type === 'exact') {
						regexp = new RegExp('^' + values[i] + '$');
						match = match || regexp.test(field);
					} else if (type === 'not') {
						regexp = new RegExp('^((?!' + values[i] + ').)*$');
						match = match || regexp.test(field);
					} else if (type === 'exists') {
						match = match || !!field;
					} else if (type === 'range') {
						var bounds = value.split('..');

						if (!isNaN(bounds[0]) && !isNaN(bounds[1]) && !isNaN(field)){
							bounds[0] = +bounds[0];
							bounds[1] = +bounds[1]
							field = +field;
						}
						match = match || (field >= bounds[0] && field <= bounds[1]);
					} else {
						regexp = new RegExp(values[i]);
						match = match || regexp.test(field);
					}
				}
				return match;
			};

			this.where(function(row){
				var rowMatch = true;
				for (var i = 0, j = filter.length; i < j; i++){
					var f = filter[i];
					if (f.field){
						var match = isMatch(f.value, row[f.field], f.type);
						rowMatch = rowMatch && match;
					} else {
						var inRow = false;
						for (var field in row){
							var match = isMatch(f.value, row[field], f.type);
							if (match){
								inRow = true;
							}
						}
						rowMatch = rowMatch && inRow;
					}
				}
				return rowMatch;
			}).render();

			if (typeof cb === 'function') cb();
		}
	}



	/* DATAGRID PRIVATE METHODS
	* =========================== */


	function unwrapFunction(f, args){
		if (!(args instanceof Array)){
			args = [args];
		}
		return typeof f === 'function' ? f.apply(this, args) : f;
	}

	function applyMutators(){
		var dataMutated = JsLinq(this.options.data),
			mutators = this.options.mutators;

		if (mutators.select){
			dataMutated = dataMutated.select(mutators.select);
		}

		if (mutators.where){
			dataMutated = dataMutated.where(mutators.where);
		}

		if (mutators.orderBy){
			dataMutated = dataMutated.orderBy(mutators.orderBy);
		}

		if (mutators.groupBy){
			dataMutated = dataMutated.groupBy(mutators.groupBy);
		}

		if (typeof this.options.mutator === 'function'){
			dataMutated = this.options.mutator.call(this, dataMutated, this.options.schema);
		}

		return dataMutated;
	}

	function widthChanged(mediaType){

		var schema = this.options.schema,
			mediaQueries = this.options.mediaQueries;

		for (var i = 0; i < schema.length; i++){

			// reset any columns
			for (var media in mediaQueries){
				if (schema[i][media + 'Hidden']){
					schema[i].hidden = false;
				}

				if (schema[i][media + 'Visible']){
					schema[i].hidden = true;
				}
			}

			var isMediaHidden = unwrapFunction(schema[i][mediaType + 'Hidden']),
				isMediaVisible = unwrapFunction(schema[i][mediaType + 'Visible']);

			if (typeof isMediaHidden === 'boolean' && isMediaHidden){
				schema[i].hidden = true;
			}

			if (typeof isMediaVisible === 'boolean' && isMediaVisible){
				schema[i].hidden = false;
			}
		}

		this.render();
	}

	/* DATAGRID HELPERS
	* =========================== */

	DataGrid.sortAsc = 1;
	DataGrid.sortDesc = -1;
	DataGrid.sortBy = function(properties, primers) {
		var primers = primers || {}; // primers are optional

		properties = [].concat(properties);

		var comparator = function(x, y) {
			if (x === null || typeof x === 'undefined') x = '';
			if (y === null || typeof y === 'undefined') y = '';

			if (typeof x === 'string') x = $.trim(x.toLowerCase());
			if (typeof y === 'string') y = $.trim(y.toLowerCase());

			return x > y ? 1 : x < y ? -1 : 0;
		}

		return function(a, b) {
			for (var i = 0, j = properties.length; i < j; i++){
				var prop = properties[i],
					aValue = a[prop],
					bValue = b[prop];

				if( typeof primers[prop] !== 'undefined' ) {
					aValue = primers[prop](aValue);
					bValue = primers[prop](bValue);
				}

				var cmp = comparator(aValue, bValue);

				if (cmp !== 0) return cmp;
			}
			return 0;
		}
	}

	DataGrid.aggregateFunctions = {
		Sum: function(i, data){
			if (!data.length) return '';
			return data.select(function (x) {
				if (x.length !== undefined){
					// footer in grouped by format
					return x.select(function(y){ return y[i] }).sum();
				} else {
					return x[i];
				}
			}).sum();
		}
	}

	/* DATAGRID PLUGIN DEFINITION
	* =========================== */

	$.fn.datagrid = function (option) {
		var options = typeof option == 'object' && option;

		if (options){
			return this.each(function () {
				var $this = $(this),
					data = $this.data('datagrid');

				if (!data) $this.data('datagrid', new DataGrid(this, options));
			})
		} else if (typeof option == 'string') {
			var $this = $(this),
				data = $this.data('datagrid');

			if (data) return data[option].apply(data, Array.prototype.slice.call(arguments, 1));
		}
	}

	$.fn.datagrid.defaults = {
		field: { index: '', header: function(i){ return i }, view: function(i){ return i }, sort: DataGrid.sortBy, allowHidden: true, allowGroupBy: true, visibleDesktop: true },
		renderAfterInit: true,
		striped: true,
		pianoKey: false,
		data: [],
		showControls: false,
		showGroupBy: true,
		groupByTitle: 'Group By',
		showHideTitle: 'View',
		fluidLayout: true,
		mutators: {},
		groupByText: function(key, i, data){
			return key + ' <span class="muted">(' + data.length + ')</span>';
		},
		footerText: function(data){
			return '<strong>Total:</strong> ' + (data.total || data.select(function (x) { return (x.length !== undefined) ? x.length : 1; }).sum());
		},
		cacheHeaders: true,
		showFooter: true,
		chevronPosition: 'right',
		responsive: true,
		mediaQueries: {
			phone: '(max-width: 767px)',
			tablet: '(min-width: 768px) and (max-width: 979px)',
			desktop: '(min-width: 980px)'
		},
		fixedHeight: 0,
		fixedFooter: true,
		resize: true,
		shadowTop: true,
		shadowBottom: false,
		resizeTimeout: 10,
		mediaQueryTimeout: 50,
		showSearch: false,
		searchOptions: {},
		rowClassName: null,
		template: [
			'<div class="datagrid-controls-container">',
				'<div class="row">',
					'<div class="span12 datagrid-controls"></div>',
				'</div>',
			'</div>',
			'<div class="datagrid-container"></div>'
		].join(''),
		controlsTemplate: [
			'<div class="btn-group pull-right hidden-phone">',
				'<div class="btn-group showHide">',
					'<button class="btn dropdown-toggle" data-toggle="dropdown"><i class="glyphicon-eye-close"></i></button>',
					'<ul class="dropdown-menu pull-right"></ul>',
				'</div>',
				'<div class="btn-group groupBy">',
					'<button class="btn dropdown-toggle" data-toggle="dropdown"><i class="glyphicon-th-list"></i></button>',
					'<ul class="dropdown-menu pull-right"></ul>',
				'</div>',
				'<div class="btn-group expandAll">',
					'<button class="btn"><i class="glyphicon-resize-full"></i></button>',
				'</div>',
				'<div class="btn-group collapseAll">',
					'<button class="btn"><i class="glyphicon-resize-small"></i></button>',
				'</div>',
			'</div>'
		].join(''),
		searchTemplate: '<input type="search" class="input-search" />'
	}

	$.fn.datagrid.Constructor = DataGrid

}(window.jQuery);
!function ($) {

	"use strict"; // jshint ;_;

	var SearchField = function (element, options) {
		this.init(element, options);
	}

	// expose to global scope
	window.SearchField = SearchField;

	/* SEARCHFIELD CLASS DEFINITION
	* =========================== */

	SearchField.prototype = {

		constructor: SearchField,

		init: function(element, options){
			var $element = this.$element = $(element);
			this.options = $.extend(true, {}, $.fn.searchfield.defaults, $element.data(), options);

			var that = this;
			if (this.options.datagrid){
				if (this.options.datagrid instanceof DataGrid) {
					this.datagrid = this.options.datagrid;
					this.options.schema = this.datagrid.options.schema;
					this.options.data = this.datagrid.options.data;
					this.options.executeClientSearch = function(){ that.datagrid.filterData.apply(that.datagrid, arguments) };
				} else if ($(this.options.datagrid).data('datagrid') instanceof DataGrid){
					this.datagrid = $(this.options.datagrid).data('datagrid');
					this.options.schema = this.datagrid.options.schema;
					this.options.data = this.datagrid.options.data;
					this.options.executeClientSearch = function(){ that.datagrid.filterData.apply(that.datagrid, arguments) };
				} else {
					throw new Error('SearchField: provided datagrid is not of type DataGrid');
				}
			}

			this.searchParams = [];
			this.serverParams = [];

			var $searchField = this.$searchField = $(supplant(this.options.template, $.fn.searchfield.i18n[this.options.i18n]));
			$element.replaceWith($searchField);
			$element.appendTo($searchField.find('.input-holder'));

			if (this.options.placeholder){
				$element.attr('placeholder', this.options.placeholder);
			}

			if (this.options.showAdvancedSearch){
				var $advanced = this.$advanced = $searchField.find('.advanced');
				$advanced.show();

				$advanced.delegate('.value input', 'keydown.searchfield', function(e){
					if (e.which == 13){
						e.preventDefault();
						that.addNewKey();
					}
				});

				$advanced.delegate('.type', 'change.searchfield', function(e){
					var $target = $(this),
						$key = $target.closest('.key'),
						$value = $key.find('.value');

					var value;
					if ($value.find('.between').length){
						value = $value.find('.start').val() + '..' + $value.find('.end').val();
					} else {
						value = $value.find('input').val();
					}
					$key.find('.value').html(that.generateValueInput(value, $target.val()));
				});

				// fix to stop dropdown dismiss when inside is clicked
				var $clickable = $advanced.find('.dropdown-content');

				$clickable.delegate('.remove', 'click.searchfield', function(e){
					var $target = $(this),
						$key = $target.closest('.key');

					$key.remove();
					if ($key.hasClass('newKey')){
						that.addNewKey();
					}
				});

				$clickable.delegate('.search', 'click.searchfield', function(e){
					e.preventDefault();
					that.buildSearchAndApply();
					$advanced.click(); //dismiss popup
				});

				$clickable.click(function(e){
					e.stopPropagation();
				});
			}

			// events

			$searchField.bind('submit.searchfield', function(e){
				e.preventDefault();
				return false;
			});

			$searchField.delegate('.input-holder input', 'keydown.searchfield', function(e){
				if (e.which == 13){
					e.preventDefault();
					that.search();
				}
			});

			if (this.options.searchOnBlur){
				$searchField.delegate('.input-holder input', 'blur.searchfield', function(){
					if ($.trim($(this).val())){
						that.search();
					}
				});
			}

			$searchField.delegate('.input-append .search', 'click.searchfield', function(e){
				e.preventDefault();
				that.search(true);
			});

			$searchField.delegate('.advanced', 'click.searchfield', function(e){
				e.preventDefault();
				that.renderAdvanced();
			});

			$searchField.find('.hidden-absolute').on('keydown', function(e){
				e.stopPropagation();
				if (that.$element.is(':visible')){
					that.$element.focus();
				}
			});

			if (this.options.consumeDocumentKeypress){
				$(document).on('keydown',function(e){
					var element = document.activeElement;
					if((element && element.nodeName.toLowerCase() != 'input' && element.nodeName.toLowerCase() != 'textarea' && element.contentEditable !== 'true'
						&& !$('body').hasClass('modal-open')))
					{
						if (typeof e.which == "number" && e.which > 0 && !e.ctrlKey && !e.metaKey && !e.altKey){
							if (that.$element.is(':visible')){
								that.$element.focus();
							}
						}
					}
				});
			}

			// publish events
			$element.triggerHandler('initialized');
		},

		buildSearchAndApply: function(){
			var $createSearch = this.$advanced.find('.create-search'),
				$advancedOptions = this.$advanced.find('.advanced-options'),
				advancedOptions = this.options.advancedOptions,
				searchParams = this.options.searchParams;

			var that = this;

			searchParams = [];
			$createSearch.find('.key').each(function(){
				var $target = $(this),
					field = $target.find('.field').val() || '',
					type = $target.find('.type').val() || '',
					value = $target.find('.value input')
								.map(function(){ return $(this).val() })
								.toArray().join('..') || '';

				if (type === 'exists') value = '';
				if (value || field || type !== 'contains'){
					searchParams.push({ field: field, type: type, value: value});
				}
			});
			this.syncInput(searchParams);
			this.search(true, searchParams);
		},

		addNewKey: function(){
			var $createSearch = this.$advanced.find('.create-search'),
				hasEmptyInput = false;

			$createSearch.find('input').each(function(){
				if (!$.trim($(this).val())){
					hasEmptyInput = true;
					$(this).focus();
				}
			});
			if (!hasEmptyInput){
				//$createSearch.find('.newKey .remove').removeClass('disabled');
				$createSearch.append(this.generateKey());
				$createSearch.find('.newKey select').trigger('change');
				setTimeout(function(){
					$createSearch.find('.newKey input').focus();
				}, 0);
			}
		},

		getHeader: function(index){
			var field, mapping = this.options.mapping;
			if (mapping[index]){
				field = mapping[index];
			} else {
				field = this.getKeyFromSchema(index) || {};
			}

			return unwrapFunction.call(this, field.header, index) || index;
		},

		generateFieldSelect: function(selected){
			var r = [], schema = this.options.schema;

			r.push('<select class="field">');
			r.push('<option value="">' + $.fn.searchfield.i18n[this.options.i18n].anyCategory + '</option>');

			var newList = JsLinq(schema).groupBy(function(o){return o.grouping || 'xxx'}).orderBy(function(a,b){return a.key =='xxx'?-1:0}).select(function(o){return o.toArray()}).toArray();
			for (var j=0; j<newList.length; j++){
				if (newList[j][0].grouping){ r.push('<optgroup label="--------"></optgroup>'); }
				schema = newList[j];
				for (var i = 0; i < schema.length; i++){
					if (schema[i].index){
						r.push('<option value="' + schema[i].index + '"');
						if (schema[i].index == selected){
							r.push(' selected="selected"');
						}
						r.push('>');
						r.push(this.getHeader(schema[i].index));
						r.push('</option>');
					}
				}
			}
			r.push('</select> ');

			return r.join('');
		},

		generateTypeSelect: function(selected){
			var r = [], searchTypes = this.options.searchTypes;
			
			r.push('<select class="type">');
			for (var type in searchTypes){
				if (searchTypes[type]) {
					r.push('<option value="' + type + '"');
					if (type == selected){
						r.push(' selected="selected"');
					}
					r.push('>');
					r.push($.fn.searchfield.i18n[this.options.i18n][type]);
					r.push('</option>');
				}
			}
			r.push('</select> ');

			return r.join('');
		},

		generateValueInput: function(value, type){
			var r = [];

			r.push('<span class="value">');
			var between = (value || '').split('..');

			if (type === 'between' || type === 'notBetween'){
				r.push('<input class="between start" type="text" value="' + (between[0] || '') + '" /><span class="syntax">..</span>');
				r.push('<input class="between end" type="text" value="' + (between[1] || '') + '" />');
			} else if (type === 'exists' || type === 'notExists'){
				r.push('<input type="text" value="" class="disabled" disabled="disabled"/>');
			} else {
				r.push('<input type="text" value="' +  (between[0] || '') + '" />');
			}
			r.push('</span>');

			return r.join('');
		},

		generateKey: function(key){
			var k = key || {};
			var r = [],
				field = k.field || '',
				type = k.type || '',
				value = k.value || '';

			r.push('<div class="key' + (!key ? ' newKey' : '') + '">');
			r.push(this.generateFieldSelect(field));
			r.push(this.generateTypeSelect(type));
			r.push(this.generateValueInput(value, type));
			r.push(' <button class="btn remove" type="button" tabindex="-1"><i class="glyphicon-remove"></i></button>');
			r.push('</div>');

			return r.join('');
		},

		renderCreateSearch: function(){
			var searchParams = this.options.searchParams,
				r = [];

			for (var i = 0; i < searchParams.length; i++ ){
				r.push(this.generateKey(searchParams[i]));
			}
			r.push(this.generateKey());

			return r.join('');
		},

		renderAdvancedOptions: function(){
			var r = [], advancedOptions = this.options.advancedOptions;

			for (var i = 0; i < advancedOptions.length; i++){
				r.push('<div class="option">');
				r.push(unwrapFunction.call(advancedOptions[i], advancedOptions[i].view));
				r.push('</div>');
			}

			return r.join('');
		},

		renderAdvanced: function(){
			var	advancedOptions = this.options.advancedOptions,
				$advancedOptions = this.$advanced.find('.advanced-options'),
				$createSearch = this.$advanced.find('.create-search');

			$createSearch.html(this.renderCreateSearch());

			if (advancedOptions.length){
				this.$advanced.find('.advanced-options-container').show();

				var $options = $(this.renderAdvancedOptions());
				$advancedOptions.html($options);
				for (var i = 0; i < advancedOptions.length; i++){
					unwrapFunction.call(advancedOptions[i], advancedOptions[i].init, [ $advancedOptions.find('.option:nth-child(' + (i + 1) + ')'), this.options ]);
				}

			} else {
				this.$advanced.find('.advanced-options-container').hide();
			}


			this.$advanced.find('.dropdown-menu').css({ 'left': -this.$element.width() - 1 });
		},

		syncInput: function(searchParams){
			var searchParams = searchParams || this.options.searchParams,
				text = [];

			this.options.searchParams = searchParams;

			for (var i = 0; i < searchParams.length; i++){
				text.push($.trim(searchParams[i].value));
			}

			this.$element.val(text.join(' ')).change();
		},

		parseInput: function(){
			var keys = [];
			var text = $.trim(this.$element.val());

			text.replace(/[A-Za-z0-9-_,.]+([A-Za-z0-9-_,.])*|"[A-Za-z0-9-_,.\s]+"/g, function($0) {
				$0 = $0.replace(/_/g, '[_]');
				keys.push($0.replace(/"/g, ''));
			});

			return keys;
		},

		getKeyIndex: function(value) {
			var searchParams = this.options.searchParams,
				idx = -1;

			for (var i = 0; i < searchParams.length; i++) {
				if (searchParams[i].value == value) {
					idx = i;
					break;
				}
			}

			return idx;
		},

		getKeyFromSchema: function(index){
			for (var i = 0; i < this.options.schema.length; i++){
				var field = this.options.schema[i];
				if (field.index === index){
					return field;
				}
			}
		},

		getSearchParams: function(){
			var searchParams = this.options.searchParams,
				keys = this.parseInput(), keysChanged = 0,
				keysChangedIndex = -1, mappedKeys = '',
				search = [];

			for (var i = 0; i < keys.length; i++) {
				if (keys[i]) {
					var value = keys[i], field = '', type = 'contains', typeOverride;
					var keyIndex = this.getKeyIndex(value);

					if (value.length === 4 && +value === +value && Math.abs(+value - (new Date()).getFullYear()) <= 10) {
					    type = 'exact';
					    field = 'ModelYear';
					}

					if (value.match(/\w\.\./)) {
						typeOverride = 'between';
					} else if (value === '*') {
						typeOverride = 'exists';
					}
					
					if (keyIndex >= 0) {
						mappedKeys += keyIndex + '|';
						var key = searchParams[keyIndex];

						if (key.field.length && !this.getKeyFromSchema(key.field)) {
							key.field = '', type = key.type = 'contains';
						}

						if (!typeOverride && key.type == 'between') key.type = 'contains';

						key.type = typeOverride || key.type;
						value = key.value, field = key.field, type = key.type;
					} else {
						keysChanged++;
						if (keysChangedIndex) keysChangedIndex = i;
					}

					search.push({ value: value, field: field, type: typeOverride || type });
				}
			}

			//map changed key in input to unmapped key in stucture
			if (keysChanged == 1 && search.length == searchParams.length) {
				for (var i = 0; i < mappedKeys.length; i++) {
					if (mappedKeys.indexOf(i + '|') < 0) {
						var typeOverride = '', key = searchParams[i],
							value = search[keysChangedIndex].value;

						if (value.match(/\w\.\./)) typeOverride = 'between';
						if (!typeOverride && key.type == 'between') typeOverride = 'contains';

						key.type = typeOverride || key.type;
						search[keysChangedIndex].field = key.field;
						search[keysChangedIndex].type = key.type;

						break;
					}
				}
			}

			return search;
		},

		isAppendedFilter: function(filter1, filter2){
			var hasAllKeys = true, hasExpandedBinding = false, hasExpandedType = false;
			for (var i = 0; i < filter1.length; i++){
				var hasKey = false;
				for (var j = 0; j < filter2.length; j++){
					if (filter1[i].value == filter2[j].value){
						hasKey = true;
						if (filter1[i].field !== '' && filter2[j].field !== filter1[i].field){
							hasExpandedBinding = true;
						}
						if (filter1[i].type !== 'contains' && (filter2[j].type === 'beings' || filter2[j].type === 'ends' || filter2[j].type === 'exact')){
							hasExpandedType = true;
						}
					}
				}
				hasAllKeys = hasAllKeys && hasKey;
			}

			return filter1.length && filter2.length && hasAllKeys && !hasExpandedBinding && !hasExpandedType;
		},

		deepEquals: function(obj1, obj2){
			return JSON.stringify(obj1) === JSON.stringify(obj2);
		},

		search: function(forceSearch, params){
			var searchParams = this.options.searchParams = params || this.getSearchParams(),
				data = this.options.data;

			//append hidden filters;
			var finalSearch = [];

			finalSearch.push.apply(finalSearch, searchParams);
			for (var field in this.options.appendSearch){
				finalSearch.push(this.options.appendSearch[field]);
			}

			if (!forceSearch && this.deepEquals(this.searchParams, searchParams)) return;

			// map to serverside/clientside serach interface
			var mappedSearch = $.extend(true, [], finalSearch);
			for (var i = 0; i < mappedSearch.length; i++) {
				if (mappedSearch[i].value) {
					mappedSearch[i].value = mappedSearch[i].value.split(/\.\.|\,/);
				}
			}

			var that = this;
			if (typeof this.options.fetchData !== 'function'){
				that.options.executeClientSearch(mappedSearch, function(){
					that.$searchField.removeClass('searching');
					that.$searchField.find('.hidden').focus();
				})
			} else {
				// ALWAYS DO SERVER SEARCH
				// if (!forceSearch && data.length && searchParams && this.isAppendedFilter(this.serverParams, searchParams)){
				// 	this.$searchField.addClass('searching');
				// 	setTimeout(function(){
				// 		that.options.executeClientSearch(mappedSearch, function(){
				// 			that.$searchField.removeClass('searching');
				// 			that.$searchField.find('.hidden-absolute').focus();
				// 		});
				// 	}, 0);
				// } else {
					//deep copy array in order to compare previous serverside search
					this.serverParams = $.extend(true, [], finalSearch);
					this.$searchField.addClass('searching');
					setTimeout(function(){ that.options.fetchData(mappedSearch); }, 0);
				// }
			}
			this.searchParams = $.extend(true, [], searchParams);
		},

		process: function(result){
			var data = result || [];

			this.$searchField.removeClass('searching');
			this.$searchField.find('.hidden-absolute').focus();

			this.options.data = data;

			if (this.datagrid){
				// clear where clause
				this.options.executeClientSearch([]);
				this.datagrid.setData(data);
				this.datagrid.render();
			}
		},

		destroy: function(){
			this.$element.unbind('.searchfield');
			this.$element.empty();

			this.$element.removeData('searchfield');

			// publish events
			this.$element.triggerHandler('destroyed');
		}
	}


	/* SEARCHFIELD PRIVATE METHODS
	* =========================== */

	function unwrapFunction(f, args){
		if (!(args instanceof Array)){
			args = [args];
		}
		return typeof f === 'function' ? f.apply(this, args) : f;
	}
	
	function supplant(str, o) {
		var replacer = (typeof o === 'function')
			? function (a, b) { return o(b); }
			: function (a, b) {
				var r = o[b];
				return (typeof r === 'string' || typeof r === 'number') ? r : a;
			};
		return str.replace(/{([^{}]*)}/g, replacer);
	}

	/* SEARCHFIELD PLUGIN DEFINITION
	* =========================== */

	$.fn.searchfield = function (option) {
		var options = typeof option == 'object' && option;

		if (options){
			return this.each(function () {
				var $this = $(this),
					data = $this.data('searchfield');

				if (!data) $this.data('searchfield', new SearchField(this, options));
			})
		} else if (typeof option == 'string') {
			var $this = $(this),
				data = $this.data('searchfield');

			if (data) return data[option].apply(data, Array.prototype.slice.call(arguments, 1));
		}
	}

	$.fn.searchfield.defaults = {
		data: [],
		schema: [],
		searchParams: [],
		appendSearch: {},
		consumeDocumentKeypress: false,
		placeholder: 'Search...',
		showAdvancedSearch: true,
		searchOnBlur: true,
		searchTypes: {
			contains: true, 
			begins: true,
			exact: true, 
			between: true, 
			exists: true,
			notContains: true, 
			notBegins: true,
			notExact: true, 
			notBetween: true, 
			notExists: true
		},
		mapping: {},
		advancedOptions: [],
		template: [
			'<form class="searchfield" style="margin: 0; position: relative;">',
				'<div class="input-append">',
					'<span class="input-holder"></span>',
					'<button type="button" class="btn search"><i class="glyphicon-search"></i></button>',
				'</div>',
				'<div class="advanced" style="display: none">',
					'<a href="javascript:;" data-toggle="dropdown">',
						'<span class="caret"></span>',
					'</a>',
					'<div class="dropdown-menu">',
						//'<button type="button" class="close" style="padding: 3px 6px">&times;</button>',
						'<div class="dropdown-content">',
							'<div class="modal-body">',
								'<div class="advanced-options-container">',
									'<h6 style="margin-top: 0">{searchOptions}</h6>',
									'<p class="advanced-options"></p>',
								'</div>',
								'<div class="create-search-container">',
									'<h6>{createSearch}</h6>',
									'<p class="create-search form-inline"></p>',
								'</div>',
							'</div>',
							'<div class="modal-footer">',
								'<button type="button" class="btn btn-primary search">{search}</button>',
							'</div>',
						'</div>',
					'</div>',
				'</div>',
				'<div class="indicator"><img src="/webasp/images/oespinner-small.gif" /></div>',
				'<input type="checkbox" style="position: absolute; left: -9999px" class="hidden-absolute" tabindex="-1" />', //used to focus on instead of blur after search (checkbox is used so the keyboard will not show)
			'</form>'
		].join(''),
		i18n: 'fr'
	};
	
	$.fn.searchfield.i18n = {
		en: {
			advancedSearch: 'Advanced Search',
			anyCategory: 'Any Category',
			begins: 'starts with',
			between: 'between',
			collapseAll: 'Collapse All',
			contains: 'contains', 
			createSearch: 'Create Search',
			displayColumn: 'Display Column',
			ends:'ends with',
			exact:'equals', 
			exists: 'exists',
			expandAll: 'Expand All',
			groupBy: 'Group By',
			not: 'doesn\'t exist',
			notBegins: 'doesn\'t start with',
			notBetween: 'isn\'t between', 
			notContains:'doesn\'t contain', 
			notExact: 'doesn\'t equal',
			notExists: 'doesn\'t exist',
			pressEnterToSearch: 'Press Enter to Search...',
			range:'between', 
			search: 'Seach',
			searchOptions: 'Seach Options',
			showHide: 'Show/Hide'
		},
		fr: {
			advancedSearch: 'Recherche avancée',
			anyCategory: 'Toute catégorie',
			begins:'commence par',
			between: 'entre',
			collapseAll: 'Créduire tout',
			contains: 'contient', 
			createSearch: 'Créer une recherche',
			displayColumn: 'Display Column',
			ends:'finit par',
			exact:'égal à', 
			exists: 'existe',
			expandAll: 'Tout afficher',
			groupBy: 'Grouper par',
			not: 'n\'existe pas',
			notBegins: 'ne commence pas par',
			notBetween: 'n\'est pas entre', 
			notContains: 'ne contient pas', 
			notExact: 'n\'est pas égal à',
			notExists: 'n\'existe pas', 
			pressEnterToSearch: 'Appuyer sur la touche "Entrée" pour rechercher',
			range: 'entre', 
			search: 'Recherche',
			searchOptions: 'Recherche d\'options',
			showHide: 'Afficher/Masquer'
		}
	};

	$.fn.searchfield.Constructor = SearchField

}(window.jQuery);!function($) {

    "use strict"; // jshint ;_;


    /* LOADING PUBLIC CLASS DEFINITION
    * ============================== */

    var Loading = function(element, options) {
        this.init(element, options);
    }

    Loading.prototype = {

        constructor: Loading,

        init: function(element, options) {
            this.$element = $(element);
            this.options = $.extend({}, $.fn.loading.defaults, options);
            this.initialPos = this.$element.prop('style').position;
        },

        toggle: function() {
            return this[!this.isShown ? 'show' : 'hide']();
        },

        show: function() {
            if (this.isShown) return;

            this.isShown = true;

            this.position();

            this.$mask = this.$mask || $('<div class="loading-mask fade" />')
				.toggleClass('loading-trans', this.options.transparent)
				.appendTo(this.$element)
                .show();

            this.$spinner = (this.$spinner || $(this.options.spinner))
				.appendTo(this.$element);

            this.$mask[0].offsetWidth
            this.$spinner[0].offsetWidth

            this.$mask[0].offsetWidth;

            this.$mask.addClass('in');
            this.$spinner.addClass('in');

            var done = function() {
                that.$element.triggerHandler('loading');
            }

            var that = this;

            $.support.transition ?
				this.$mask.one($.support.transition.end, done) :
				done();
        },

        hide: function() {
            if (!this.isShown) return;

            this.isShown = false;

            if (!this.$mask) return;

            this.$mask[0].offsetWidth;

            this.$mask.removeClass('in');
            this.$spinner.removeClass('in');

            $.support.transition ?
				this.hideWithTransition(this.$mask, $.proxy(this.removeMask, this)) :
				this.removeMask();

            $.support.transition ?
				this.hideWithTransition(this.$mask, $.proxy(this.removeSpinner, this)) :
				this.removeSpinner();

            var done = function() {
                that.$element.triggerHandler('loaded');
                that.position();
            }

            var that = this;

            $.support.transition ?
				this.$mask.one($.support.transition.end, done) :
				done();
        },

        position: function() {
            var boundingPositions = ['absolute', 'relative', 'fixed'];

            if ($.inArray(this.initialPos, boundingPositions) == -1) {
                if (this.isShown) {
                    this.$element.css('position', 'relative');
                } else {
                    this.$element.css('position', this.initialPos);
                }
            }
        },

        hideWithTransition: function($element, callback) {
            var that = this
				, timeout = setTimeout(function() {
				    $element.off($.support.transition.end)
				    callback()
				}, 500);

            $element.one($.support.transition.end, function() {
                clearTimeout(timeout)
                callback()
            });
        },

        removeMask: function() {
            if (this.$mask) {
                this.$mask.remove();
                this.$mask = null;
            }

        },

        removeSpinner: function() {
            if (this.$spinner) {
                this.$spinner.remove();
                this.$spinner = null;
            }
        },

        destroy: function() {
            var e = $.Event('destroy');
            this.$element.triggerHandler(e);
            if (e.isDefaultPrevented()) return;

            this.$element.off('.loading');
            this.$element.removeData('loading');
        }

    }


    /* LOADING PLUGIN DEFINITION
    * ======================== */

    $.fn.loading = function(option) {
        var args = arguments;
        return this.each(function() {
            var $this = $(this),
				data = $this.data('loading'),
				options = $.extend({}, $.fn.loading.defaults, $this.data(), typeof option == 'object' && option);

            if (!data) $this.data('loading', (data = new Loading(this, options)));
            if (typeof option == 'string') data[option].apply(data, Array.prototype.slice.call(args, 1));
            else if (options.show) data.show()
        })
    }

    $.fn.loading.defaults = {
        spinner: '<img class="loading-spinner fade" src="/webasp/images/oespinner-trans.gif" />',
        show: true,
        transparent: false
    }

    $.fn.loading.Constructor = Loading


    /* LOADING DATA-API
    * =============== */

    $(function() {
        $(document).on('click.loading.data-api', '[data-toggle^=loading]', function(e) {
            var $this = $(this),
				href = $this.attr('href'),
				$target = $($this.attr('data-target') || (href && href.replace(/.*(?=#[^\s]+$)/, ''))), //strip for ie7
				option = $target.data('loading') ? 'toggle' : undefined;

            e.preventDefault();
            $target.loading(option);
        })
    })

} (window.jQuery);/* =========================================================
 * bootstrap-datepicker.js
 * http://www.eyecon.ro/bootstrap-datepicker
 * =========================================================
 * Copyright 2012 Stefan Petre
 * Improvements by Andrew Rowls
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ========================================================= */

!function($) {

    function UTCDate() {
        return new Date(Date.UTC.apply(Date, arguments));
    }
    function UTCToday() {
        var today = new Date();
        return UTCDate(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
    }

    // Picker object

    var Datepicker = function(element, options) {
        var that = this;

        this.element = $(element);
        this.options = options;
        this.language = options.language || this.element.data('date-language') || "en";
        this.language = this.language in dates ? this.language : this.language.split('-')[0]; //Check if "de-DE" style date is available, if not language should fallback to 2 letter code eg "de"
        this.language = this.language in dates ? this.language : "en";
        this.isRTL = dates[this.language].rtl || false;
        this.format = DPGlobal.parseFormat(options.format || this.element.data('date-format') || dates[this.language].format || 'mm/dd/yyyy');
        this.isInline = false;
        this.isInput = this.element.is('input');
        this.component = this.element.is('.date') ? this.element.find('.add-on') : false;
        this.hasInput = this.component && this.element.find('input').length;
        if (this.component && this.component.length === 0)
            this.component = false;

        this._attachEvents();

        this.forceParse = true;
        if ('forceParse' in options) {
            this.forceParse = options.forceParse;
        } else if ('dateForceParse' in this.element.data()) {
            this.forceParse = this.element.data('date-force-parse');
        }


        this.picker = $(DPGlobal.template)
							.appendTo(this.isInline ? this.element : 'body')
							.on({
							    click: $.proxy(this.click, this),
							    mousedown: $.proxy(this.mousedown, this)
							});

        if (this.isInline) {
            this.picker.addClass('datepicker-inline');
        } else {
            this.picker.addClass('datepicker-dropdown dropdown-menu');
        }
        if (this.isRTL) {
            this.picker.addClass('datepicker-rtl');
            this.picker.find('.prev i, .next i')
						.toggleClass('glyphicon-arrow-left glyphicon-arrow-right');
        }
        $(document).on('mousedown', function(e) {
            // Clicked outside the datepicker, hide it
            if ($(e.target).closest('.datepicker.datepicker-inline, .datepicker.datepicker-dropdown').length === 0) {
                that.hide();
            }
        });

        this.autoclose = false;
        if ('autoclose' in options) {
            this.autoclose = options.autoclose;
        } else if ('dateAutoclose' in this.element.data()) {
            this.autoclose = this.element.data('date-autoclose');
        }

        this.keyboardNavigation = true;
        if ('keyboardNavigation' in options) {
            this.keyboardNavigation = options.keyboardNavigation;
        } else if ('dateKeyboardNavigation' in this.element.data()) {
            this.keyboardNavigation = this.element.data('date-keyboard-navigation');
        }

        this.viewMode = this.startViewMode = 0;
        switch (options.startView || this.element.data('date-start-view')) {
            case 2:
            case 'decade':
                this.viewMode = this.startViewMode = 2;
                break;
            case 1:
            case 'year':
                this.viewMode = this.startViewMode = 1;
                break;
        }

        this.todayBtn = (options.todayBtn || this.element.data('date-today-btn') || false);
        this.todayHighlight = (options.todayHighlight || this.element.data('date-today-highlight') || false);

        this.calendarWeeks = false;
        if ('calendarWeeks' in options) {
            this.calendarWeeks = options.calendarWeeks;
        } else if ('dateCalendarWeeks' in this.element.data()) {
            this.calendarWeeks = this.element.data('date-calendar-weeks');
        }
        if (this.calendarWeeks)
            this.picker.find('tfoot th.today')
						.attr('colspan', function(i, val) {
						    return parseInt(val) + 1;
						});

        this.weekStart = ((options.weekStart || this.element.data('date-weekstart') || dates[this.language].weekStart || 0) % 7);
        this.weekEnd = ((this.weekStart + 6) % 7);
        this.startDate = -Infinity;
        this.endDate = Infinity;
        this.daysOfWeekDisabled = [];
        this.setStartDate(options.startDate || this.element.data('date-startdate'));
        this.setEndDate(options.endDate || this.element.data('date-enddate'));
        this.setDaysOfWeekDisabled(options.daysOfWeekDisabled || this.element.data('date-days-of-week-disabled'));
        this.fillDow();
        this.fillMonths();
        this.update();
        this.showMode();

        if (this.isInline) {
            this.show();
        }
    };

    Datepicker.prototype = {
        constructor: Datepicker,

        _events: [],
        _attachEvents: function() {
            this._detachEvents();
            if (this.isInput) { // single input
                this._events = [
					[this.element, {
					    focus: $.proxy(this.show, this),
					    keyup: $.proxy(this.update, this),
					    keydown: $.proxy(this.keydown, this)
}]
				];
            }
            else if (this.component && this.hasInput) { // component: input + button
                this._events = [
                // For components that are not readonly, allow keyboard nav
					[this.element.find('input'), {
					    focus: $.proxy(this.show, this),
					    keyup: $.proxy(this.update, this),
					    keydown: $.proxy(this.keydown, this)
}],
					[this.component, {
					    click: $.proxy(this.show, this)
}]
				];
            }
            else if (this.element.is('div')) {  // inline datepicker
                this.isInline = true;
            }
            else {
                this._events = [
					[this.element, {
					    click: $.proxy(this.show, this)
}]
				];
            }
            for (var i = 0, el, ev; i < this._events.length; i++) {
                el = this._events[i][0];
                ev = this._events[i][1];
                el.on(ev);
            }
        },
        _detachEvents: function() {
            for (var i = 0, el, ev; i < this._events.length; i++) {
                el = this._events[i][0];
                ev = this._events[i][1];
                el.off(ev);
            }
            this._events = [];
        },

        show: function(e) {
            this.picker.show();
            this.height = this.component ? this.component.outerHeight() : this.element.outerHeight();
            this.update();
            this.place();
            $(window).on('resize', $.proxy(this.place, this));
            if (e) {
                e.stopPropagation();
                e.preventDefault();
            }
            this.element.trigger({
                type: 'show',
                date: this.date
            });
        },

        hide: function(e) {
            if (this.isInline) return;
            if (!this.picker.is(':visible')) return;
            this.picker.hide();
            $(window).off('resize', this.place);
            this.viewMode = this.startViewMode;
            this.showMode();
            if (!this.isInput) {
                $(document).off('mousedown', this.hide);
            }

            if (
				this.forceParse &&
				(
					this.isInput && this.element.val() ||
					this.hasInput && this.element.find('input').val()
				)
			)
                this.setValue();
            this.element.trigger({
                type: 'hide',
                date: this.date
            });
        },

        remove: function() {
            this._detachEvents();
            this.picker.remove();
            delete this.element.data().datepicker;
        },

        getDate: function() {
            var d = this.getUTCDate();
            return new Date(d.getTime() + (d.getTimezoneOffset() * 60000));
        },

        getUTCDate: function() {
            return this.date;
        },

        setDate: function(d) {
            this.setUTCDate(new Date(d.getTime() - (d.getTimezoneOffset() * 60000)));
        },

        setUTCDate: function(d) {
            this.date = d;
            this.setValue();
        },

        setValue: function() {
            var formatted = this.getFormattedDate();
            if (!this.isInput) {
                if (this.component) {
                    this.element.find('input').val(formatted);
                }
                this.element.data('date', formatted);
            } else {
                this.element.val(formatted);
            }
        },

        getFormattedDate: function(format) {
            if (format === undefined)
                format = this.format;
            return DPGlobal.formatDate(this.date, format, this.language);
        },

        setStartDate: function(startDate) {
            this.startDate = startDate || -Infinity;
            if (this.startDate !== -Infinity) {
                this.startDate = DPGlobal.parseDate(this.startDate, this.format, this.language);
            }
            this.update();
            this.updateNavArrows();
        },

        setEndDate: function(endDate) {
            this.endDate = endDate || Infinity;
            if (this.endDate !== Infinity) {
                this.endDate = DPGlobal.parseDate(this.endDate, this.format, this.language);
            }
            this.update();
            this.updateNavArrows();
        },

        setDaysOfWeekDisabled: function(daysOfWeekDisabled) {
            this.daysOfWeekDisabled = daysOfWeekDisabled || [];
            if (!$.isArray(this.daysOfWeekDisabled)) {
                this.daysOfWeekDisabled = this.daysOfWeekDisabled.split(/,\s*/);
            }
            this.daysOfWeekDisabled = $.map(this.daysOfWeekDisabled, function(d) {
                return parseInt(d, 10);
            });
            this.update();
            this.updateNavArrows();
        },

        place: function() {
            if (this.isInline) return;
            var zIndex = parseInt(this.element.parents().filter(function() {
                return $(this).css('z-index') != 'auto';
            }).first().css('z-index')) + 10;
            var offset = this.component ? this.component.offset() : this.element.offset();
            var height = this.component ? this.component.outerHeight(true) : this.element.outerHeight(true);

            var leftOffset = offset.left;
            this.picker.removeClass('datepicker-right');
           
            if (this.options.placement === 'right') {
                leftOffset = offset.left + this.element.outerWidth() - this.picker.outerWidth();
                this.picker.addClass('datepicker-right');
            }

            this.picker.css({
                top: offset.top + height,
                left: leftOffset,
                zIndex: zIndex
            });
        },

        update: function() {
            var date, fromArgs = false;
            if (arguments && arguments.length && (typeof arguments[0] === 'string' || arguments[0] instanceof Date)) {
                date = arguments[0];
                fromArgs = true;
            } else {
                date = this.isInput ? this.element.val() : this.element.data('date') || this.element.find('input').val();
            }

            this.date = DPGlobal.parseDate(date, this.format, this.language);

            if (fromArgs) this.setValue();

            if (this.date < this.startDate) {
                this.viewDate = new Date(this.startDate);
            } else if (this.date > this.endDate) {
                this.viewDate = new Date(this.endDate);
            } else {
                this.viewDate = new Date(this.date);
            }
            this.fill();
        },

        fillDow: function() {
            var dowCnt = this.weekStart,
			html = '<tr>';
            if (this.calendarWeeks) {
                var cell = '<th class="cw">&nbsp;</th>';
                html += cell;
                this.picker.find('.datepicker-days thead tr:first-child').prepend(cell);
            }
            while (dowCnt < this.weekStart + 7) {
                html += '<th class="dow">' + dates[this.language].daysMin[(dowCnt++) % 7] + '</th>';
            }
            html += '</tr>';
            this.picker.find('.datepicker-days thead').append(html);
        },

        fillMonths: function() {
            var html = '',
			i = 0;
            while (i < 12) {
                html += '<span class="month">' + dates[this.language].monthsShort[i++] + '</span>';
            }
            this.picker.find('.datepicker-months td').html(html);
        },

        fill: function() {
            var d = new Date(this.viewDate),
				year = d.getUTCFullYear(),
				month = d.getUTCMonth(),
				startYear = this.startDate !== -Infinity ? this.startDate.getUTCFullYear() : -Infinity,
				startMonth = this.startDate !== -Infinity ? this.startDate.getUTCMonth() : -Infinity,
				endYear = this.endDate !== Infinity ? this.endDate.getUTCFullYear() : Infinity,
				endMonth = this.endDate !== Infinity ? this.endDate.getUTCMonth() : Infinity,
				currentDate = this.date && this.date.valueOf(),
				today = new Date();
            this.picker.find('.datepicker-days thead th.switch')
						.text(dates[this.language].months[month] + ' ' + year);
            this.picker.find('tfoot th.today')
						.text(dates[this.language].today)
						.toggle(this.todayBtn !== false);
            this.updateNavArrows();
            this.fillMonths();
            var prevMonth = UTCDate(year, month - 1, 28, 0, 0, 0, 0),
				day = DPGlobal.getDaysInMonth(prevMonth.getUTCFullYear(), prevMonth.getUTCMonth());
            prevMonth.setUTCDate(day);
            prevMonth.setUTCDate(day - (prevMonth.getUTCDay() - this.weekStart + 7) % 7);
            var nextMonth = new Date(prevMonth);
            nextMonth.setUTCDate(nextMonth.getUTCDate() + 42);
            nextMonth = nextMonth.valueOf();
            var html = [];
            var clsName;
            while (prevMonth.valueOf() < nextMonth) {
                if (prevMonth.getUTCDay() == this.weekStart) {
                    html.push('<tr>');
                    if (this.calendarWeeks) {
                        // ISO 8601: First week contains first thursday.
                        // ISO also states week starts on Monday, but we can be more abstract here.
                        var 
                        // Start of current week: based on weekstart/current date
							ws = new Date(+prevMonth + (this.weekStart - prevMonth.getUTCDay() - 7) % 7 * 864e5),
                        // Thursday of this week
							th = new Date(+ws + (7 + 4 - ws.getUTCDay()) % 7 * 864e5),
                        // First Thursday of year, year from thursday
							yth = new Date(+(yth = UTCDate(th.getUTCFullYear(), 0, 1)) + (7 + 4 - yth.getUTCDay()) % 7 * 864e5),
                        // Calendar week: ms between thursdays, div ms per day, div 7 days
							calWeek = (th - yth) / 864e5 / 7 + 1;
                        html.push('<td class="cw">' + calWeek + '</td>');

                    }
                }
                clsName = '';
                if (prevMonth.getUTCFullYear() < year || (prevMonth.getUTCFullYear() == year && prevMonth.getUTCMonth() < month)) {
                    clsName += ' old';
                } else if (prevMonth.getUTCFullYear() > year || (prevMonth.getUTCFullYear() == year && prevMonth.getUTCMonth() > month)) {
                    clsName += ' new';
                }
                // Compare internal UTC date with local today, not UTC today
                if (this.todayHighlight &&
					prevMonth.getUTCFullYear() == today.getFullYear() &&
					prevMonth.getUTCMonth() == today.getMonth() &&
					prevMonth.getUTCDate() == today.getDate()) {
                    clsName += ' today';
                }
                if (currentDate && prevMonth.valueOf() == currentDate) {
                    clsName += ' active';
                }
                if (prevMonth.valueOf() < this.startDate || prevMonth.valueOf() > this.endDate ||
					$.inArray(prevMonth.getUTCDay(), this.daysOfWeekDisabled) !== -1) {
                    clsName += ' disabled';
                }
                html.push('<td class="day' + clsName + '">' + prevMonth.getUTCDate() + '</td>');
                if (prevMonth.getUTCDay() == this.weekEnd) {
                    html.push('</tr>');
                }
                prevMonth.setUTCDate(prevMonth.getUTCDate() + 1);
            }
            this.picker.find('.datepicker-days tbody').empty().append(html.join(''));
            var currentYear = this.date && this.date.getUTCFullYear();

            var months = this.picker.find('.datepicker-months')
						.find('th:eq(1)')
							.text(year)
							.end()
						.find('span').removeClass('active');
            if (currentYear && currentYear == year) {
                months.eq(this.date.getUTCMonth()).addClass('active');
            }
            if (year < startYear || year > endYear) {
                months.addClass('disabled');
            }
            if (year == startYear) {
                months.slice(0, startMonth).addClass('disabled');
            }
            if (year == endYear) {
                months.slice(endMonth + 1).addClass('disabled');
            }

            html = '';
            year = parseInt(year / 10, 10) * 10;
            var yearCont = this.picker.find('.datepicker-years')
								.find('th:eq(1)')
									.text(year + '-' + (year + 9))
									.end()
								.find('td');
            year -= 1;
            for (var i = -1; i < 11; i++) {
                html += '<span class="year' + (i == -1 || i == 10 ? ' old' : '') + (currentYear == year ? ' active' : '') + (year < startYear || year > endYear ? ' disabled' : '') + '">' + year + '</span>';
                year += 1;
            }
            yearCont.html(html);
        },

        updateNavArrows: function() {
            var d = new Date(this.viewDate),
				year = d.getUTCFullYear(),
				month = d.getUTCMonth();
            switch (this.viewMode) {
                case 0:
                    if (this.startDate !== -Infinity && year <= this.startDate.getUTCFullYear() && month <= this.startDate.getUTCMonth()) {
                        this.picker.find('.prev').css({ visibility: 'hidden' });
                    } else {
                        this.picker.find('.prev').css({ visibility: 'visible' });
                    }
                    if (this.endDate !== Infinity && year >= this.endDate.getUTCFullYear() && month >= this.endDate.getUTCMonth()) {
                        this.picker.find('.next').css({ visibility: 'hidden' });
                    } else {
                        this.picker.find('.next').css({ visibility: 'visible' });
                    }
                    break;
                case 1:
                case 2:
                    if (this.startDate !== -Infinity && year <= this.startDate.getUTCFullYear()) {
                        this.picker.find('.prev').css({ visibility: 'hidden' });
                    } else {
                        this.picker.find('.prev').css({ visibility: 'visible' });
                    }
                    if (this.endDate !== Infinity && year >= this.endDate.getUTCFullYear()) {
                        this.picker.find('.next').css({ visibility: 'hidden' });
                    } else {
                        this.picker.find('.next').css({ visibility: 'visible' });
                    }
                    break;
            }
        },

        click: function(e) {
            e.stopPropagation();
            e.preventDefault();
            var target = $(e.target).closest('span, td, th');
            if (target.length == 1) {
                switch (target[0].nodeName.toLowerCase()) {
                    case 'th':
                        switch (target[0].className) {
                            case 'switch':
                                this.showMode(1);
                                break;
                            case 'prev':
                            case 'next':
                                var dir = DPGlobal.modes[this.viewMode].navStep * (target[0].className == 'prev' ? -1 : 1);
                                switch (this.viewMode) {
                                    case 0:
                                        this.viewDate = this.moveMonth(this.viewDate, dir);
                                        break;
                                    case 1:
                                    case 2:
                                        this.viewDate = this.moveYear(this.viewDate, dir);
                                        break;
                                }
                                this.fill();
                                break;
                            case 'today':
                                var date = new Date();
                                date = UTCDate(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);

                                this.showMode(-2);
                                var which = this.todayBtn == 'linked' ? null : 'view';
                                this._setDate(date, which);
                                break;
                        }
                        break;
                    case 'span':
                        if (!target.is('.disabled')) {
                            this.viewDate.setUTCDate(1);
                            if (target.is('.month')) {
                                var month = target.parent().find('span').index(target);
                                this.viewDate.setUTCMonth(month);
                                var e = $.Event('changeMonth', { date: this.viewDate });
                                this.element.trigger(e);
                                if (e.isDefaultPrevented()) return;
                            } else {
                                var year = parseInt(target.text(), 10) || 0;
                                this.viewDate.setUTCFullYear(year);
                                var e = $.Event('changeYear', { date: this.viewDate });
                                this.element.trigger(e);
                                if (e.isDefaultPrevented()) return;
                            }
                            this.showMode(-1);
                            this.fill();
                        }
                        break;
                    case 'td':
                        if (target.is('.day') && !target.is('.disabled')) {
                            var day = parseInt(target.text(), 10) || 1;
                            var year = this.viewDate.getUTCFullYear(),
								month = this.viewDate.getUTCMonth();
                            if (target.is('.old')) {
                                if (month === 0) {
                                    month = 11;
                                    year -= 1;
                                } else {
                                    month -= 1;
                                }
                            } else if (target.is('.new')) {
                                if (month == 11) {
                                    month = 0;
                                    year += 1;
                                } else {
                                    month += 1;
                                }
                            }
                            this._setDate(UTCDate(year, month, day, 0, 0, 0, 0));
                        }
                        break;
                }
            }
        },

        _setDate: function(date, which) {
            if (!which || which == 'date')
                this.date = date;
            if (!which || which == 'view')
                this.viewDate = date;

            var e = $.Event('changeDate', { date: this.date });
            this.element.trigger(e);
            if (e.isDefaultPrevented()) return;

            this.fill();
            this.setValue();
            var element;
            if (this.isInput) {
                element = this.element;
            } else if (this.component) {
                element = this.element.find('input');
            }
            if (element) {
                element.change();
                if (this.autoclose && (!which || which == 'date')) {
                    this.hide();
                }
            }
        },

        moveMonth: function(date, dir) {
            if (!dir) return date;
            var new_date = new Date(date.valueOf()),
				day = new_date.getUTCDate(),
				month = new_date.getUTCMonth(),
				mag = Math.abs(dir),
				new_month, test;
            dir = dir > 0 ? 1 : -1;
            if (mag == 1) {
                test = dir == -1
                // If going back one month, make sure month is not current month
                // (eg, Mar 31 -> Feb 31 == Feb 28, not Mar 02)
					? function() { return new_date.getUTCMonth() == month; }
                // If going forward one month, make sure month is as expected
                // (eg, Jan 31 -> Feb 31 == Feb 28, not Mar 02)
					: function() { return new_date.getUTCMonth() != new_month; };
                new_month = month + dir;
                new_date.setUTCMonth(new_month);
                // Dec -> Jan (12) or Jan -> Dec (-1) -- limit expected date to 0-11
                if (new_month < 0 || new_month > 11)
                    new_month = (new_month + 12) % 12;
            } else {
                // For magnitudes >1, move one month at a time...
                for (var i = 0; i < mag; i++)
                // ...which might decrease the day (eg, Jan 31 to Feb 28, etc)...
                    new_date = this.moveMonth(new_date, dir);
                // ...then reset the day, keeping it in the new month
                new_month = new_date.getUTCMonth();
                new_date.setUTCDate(day);
                test = function() { return new_month != new_date.getUTCMonth(); };
            }
            // Common date-resetting loop -- if date is beyond end of month, make it
            // end of month
            while (test()) {
                new_date.setUTCDate(--day);
                new_date.setUTCMonth(new_month);
            }
            return new_date;
        },

        moveYear: function(date, dir) {
            return this.moveMonth(date, dir * 12);
        },

        dateWithinRange: function(date) {
            return date >= this.startDate && date <= this.endDate;
        },

        keydown: function(e) {
            if (this.picker.is(':not(:visible)')) {
                if (e.keyCode == 27) // allow escape to hide and re-show picker
                    this.show();
                return;
            }
            var dateChanged = false,
				dir, day, month,
				newDate, newViewDate;
            switch (e.keyCode) {
                case 27: // escape
                    this.hide();
                    e.preventDefault();
                    break;
                case 37: // left
                case 39: // right
                    if (!this.keyboardNavigation) break;
                    dir = e.keyCode == 37 ? -1 : 1;
                    if (e.ctrlKey) {
                        newDate = this.moveYear(this.date, dir);
                        newViewDate = this.moveYear(this.viewDate, dir);
                    } else if (e.shiftKey) {
                        newDate = this.moveMonth(this.date, dir);
                        newViewDate = this.moveMonth(this.viewDate, dir);
                    } else {
                        newDate = new Date(this.date);
                        newDate.setUTCDate(this.date.getUTCDate() + dir);
                        newViewDate = new Date(this.viewDate);
                        newViewDate.setUTCDate(this.viewDate.getUTCDate() + dir);
                    }
                    if (this.dateWithinRange(newDate)) {
                        this.date = newDate;
                        this.viewDate = newViewDate;
                        this.setValue();
                        this.update();
                        e.preventDefault();
                        dateChanged = true;
                    }
                    break;
                case 38: // up
                case 40: // down
                    if (!this.keyboardNavigation) break;
                    dir = e.keyCode == 38 ? -1 : 1;
                    if (e.ctrlKey) {
                        newDate = this.moveYear(this.date, dir);
                        newViewDate = this.moveYear(this.viewDate, dir);
                    } else if (e.shiftKey) {
                        newDate = this.moveMonth(this.date, dir);
                        newViewDate = this.moveMonth(this.viewDate, dir);
                    } else {
                        newDate = new Date(this.date);
                        newDate.setUTCDate(this.date.getUTCDate() + dir * 7);
                        newViewDate = new Date(this.viewDate);
                        newViewDate.setUTCDate(this.viewDate.getUTCDate() + dir * 7);
                    }
                    if (this.dateWithinRange(newDate)) {
                        this.date = newDate;
                        this.viewDate = newViewDate;
                        this.setValue();
                        this.update();
                        e.preventDefault();
                        dateChanged = true;
                    }
                    break;
                case 13: // enter
                    this.hide();
                    e.preventDefault();
                    break;
                case 9: // tab
                    this.hide();
                    break;
            }
            if (dateChanged) {
                var e = $.Event('changeDate', { date: this.date });
                this.element.trigger(e);
                if (e.isDefaultPrevented()) return;
                var element;
                if (this.isInput) {
                    element = this.element;
                } else if (this.component) {
                    element = this.element.find('input');
                }
                if (element) {
                    element.change();
                }
            }
        },

        showMode: function(dir) {
            if (dir) {
                this.viewMode = Math.max(0, Math.min(2, this.viewMode + dir));
            }
            /*
            vitalets: fixing bug of very special conditions:
            jquery 1.7.1 + webkit + show inline datepicker in bootstrap popover.
            Method show() does not set display css correctly and datepicker is not shown.
            Changed to .css('display', 'block') solve the problem.
            See https://github.com/vitalets/x-editable/issues/37

				In jquery 1.7.2+ everything works fine.
            */
            //this.picker.find('>div').hide().filter('.datepicker-'+DPGlobal.modes[this.viewMode].clsName).show();
            this.picker.find('>div').hide().filter('.datepicker-' + DPGlobal.modes[this.viewMode].clsName).css('display', 'block');
            this.updateNavArrows();
        }
    };

    $.fn.datepicker = function(option) {
        var args = Array.apply(null, arguments);
        args.shift();
        return this.each(function() {
            var $this = $(this),
				data = $this.data('datepicker'),
				options = typeof option == 'object' && option;
            if (!data) {
                $this.data('datepicker', (data = new Datepicker(this, $.extend({}, $.fn.datepicker.defaults, options))));
            }
            if (typeof option == 'string' && typeof data[option] == 'function') {
                data[option].apply(data, args);
            }
        });
    };

    $.fn.datepicker.defaults = {
        placement: 'left'
    };
    $.fn.datepicker.Constructor = Datepicker;
    var dates = $.fn.datepicker.dates = {
        en: {
            days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
            daysShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            daysMin: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],
            months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
            monthsShort: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
            today: "Today"
        },
		fr: {
			days: ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"],
			daysShort: ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"],
			daysMin: ["D", "L", "Ma", "Me", "J", "V", "S", "D"],
			months: ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"],
			monthsShort: ["Jan", "Fév", "Mar", "Avr", "Mai", "Jui", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"],
			today: "Aujourd'hui"
		}
    };

    var DPGlobal = {
        modes: [
			{
			    clsName: 'days',
			    navFnc: 'Month',
			    navStep: 1
			},
			{
			    clsName: 'months',
			    navFnc: 'FullYear',
			    navStep: 1
			},
			{
			    clsName: 'years',
			    navFnc: 'FullYear',
			    navStep: 10
}],
        isLeapYear: function(year) {
            return (((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0));
        },
        getDaysInMonth: function(year, month) {
            return [31, (DPGlobal.isLeapYear(year) ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
        },
        validParts: /dd?|DD?|mm?|MM?|yy(?:yy)?/g,
        nonpunctuation: /[^ -\/:-@\[\u3400-\u9fff-`{-~\t\n\r]+/g,
        parseFormat: function(format) {
            // IE treats \0 as a string end in inputs (truncating the value),
            // so it's a bad format delimiter, anyway
            var separators = format.replace(this.validParts, '\0').split('\0'),
				parts = format.match(this.validParts);
            if (!separators || !separators.length || !parts || parts.length === 0) {
                throw new Error("Invalid date format.");
            }
            return { separators: separators, parts: parts };
        },
        parseDate: function(date, format, language) {
            if (date instanceof Date) return date;
            if (/^[\-+]\d+[dmwy]([\s,]+[\-+]\d+[dmwy])*$/.test(date)) {
                var part_re = /([\-+]\d+)([dmwy])/,
					parts = date.match(/([\-+]\d+)([dmwy])/g),
					part, dir;
                date = new Date();
                for (var i = 0; i < parts.length; i++) {
                    part = part_re.exec(parts[i]);
                    dir = parseInt(part[1]);
                    switch (part[2]) {
                        case 'd':
                            date.setUTCDate(date.getUTCDate() + dir);
                            break;
                        case 'm':
                            date = Datepicker.prototype.moveMonth.call(Datepicker.prototype, date, dir);
                            break;
                        case 'w':
                            date.setUTCDate(date.getUTCDate() + dir * 7);
                            break;
                        case 'y':
                            date = Datepicker.prototype.moveYear.call(Datepicker.prototype, date, dir);
                            break;
                    }
                }
                return UTCDate(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0);
            }
            var parts = date && date.match(this.nonpunctuation) || [],
				date = new Date(),
				parsed = {},
				setters_order = ['yyyy', 'yy', 'M', 'MM', 'm', 'mm', 'd', 'dd'],
				setters_map = {
				    yyyy: function(d, v) { return d.setUTCFullYear(v); },
				    yy: function(d, v) { return d.setUTCFullYear(2000 + v); },
				    m: function(d, v) {
				        v -= 1;
				        while (v < 0) v += 12;
				        v %= 12;
				        d.setUTCMonth(v);
				        while (d.getUTCMonth() != v)
				            d.setUTCDate(d.getUTCDate() - 1);
				        return d;
				    },
				    d: function(d, v) { return d.setUTCDate(v); }
				},
				val, filtered, part;
            setters_map['M'] = setters_map['MM'] = setters_map['mm'] = setters_map['m'];
            setters_map['dd'] = setters_map['d'];
            date = UTCDate(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
            var fparts = format.parts.slice();
            // Remove noop parts
            if (parts.length != fparts.length) {
                fparts = $(fparts).filter(function(i, p) {
                    return $.inArray(p, setters_order) !== -1;
                }).toArray();
            }
            // Process remainder
            if (parts.length == fparts.length) {
                for (var i = 0, cnt = fparts.length; i < cnt; i++) {
                    val = parseInt(parts[i], 10);
                    part = fparts[i];
                    if (isNaN(val)) {
                        switch (part) {
                            case 'MM':
                                filtered = $(dates[language].months).filter(function() {
                                    var m = this.slice(0, parts[i].length),
										p = parts[i].slice(0, m.length);
                                    return m == p;
                                });
                                val = $.inArray(filtered[0], dates[language].months) + 1;
                                break;
                            case 'M':
                                filtered = $(dates[language].monthsShort).filter(function() {
                                    var m = this.slice(0, parts[i].length),
										p = parts[i].slice(0, m.length);
                                    return m == p;
                                });
                                val = $.inArray(filtered[0], dates[language].monthsShort) + 1;
                                break;
                        }
                    }
                    parsed[part] = val;
                }
                for (var i = 0, s; i < setters_order.length; i++) {
                    s = setters_order[i];
                    if (s in parsed && !isNaN(parsed[s]))
                        setters_map[s](date, parsed[s]);
                }
            }
            return date;
        },
        formatDate: function(date, format, language) {
            var val = {
                d: date.getUTCDate(),
                D: dates[language].daysShort[date.getUTCDay()],
                DD: dates[language].days[date.getUTCDay()],
                m: date.getUTCMonth() + 1,
                M: dates[language].monthsShort[date.getUTCMonth()],
                MM: dates[language].months[date.getUTCMonth()],
                yy: date.getUTCFullYear().toString().substring(2),
                yyyy: date.getUTCFullYear()
            };
            val.dd = (val.d < 10 ? '0' : '') + val.d;
            val.mm = (val.m < 10 ? '0' : '') + val.m;
            var date = [],
				seps = $.extend([], format.separators);
            for (var i = 0, cnt = format.parts.length; i < cnt; i++) {
                if (seps.length)
                    date.push(seps.shift());
                date.push(val[format.parts[i]]);
            }
            return date.join('');
        },
        headTemplate: '<thead>' +
							'<tr>' +
								'<th class="prev"><i class="glyphicon-arrow-left"/></th>' +
								'<th colspan="5" class="switch"></th>' +
								'<th class="next"><i class="glyphicon-arrow-right"/></th>' +
							'</tr>' +
						'</thead>',
        contTemplate: '<tbody><tr><td colspan="7"></td></tr></tbody>',
        footTemplate: '<tfoot><tr><th colspan="7" class="today"></th></tr></tfoot>'
    };
    DPGlobal.template = '<div class="datepicker">' +
							'<div class="datepicker-days">' +
								'<table class=" table-condensed">' +
									DPGlobal.headTemplate +
									'<tbody></tbody>' +
									DPGlobal.footTemplate +
								'</table>' +
							'</div>' +
							'<div class="datepicker-months">' +
								'<table class="table-condensed">' +
									DPGlobal.headTemplate +
									DPGlobal.contTemplate +
									DPGlobal.footTemplate +
								'</table>' +
							'</div>' +
							'<div class="datepicker-years">' +
								'<table class="table-condensed">' +
									DPGlobal.headTemplate +
									DPGlobal.contTemplate +
									DPGlobal.footTemplate +
								'</table>' +
							'</div>' +
						'</div>';

    $.fn.datepicker.DPGlobal = DPGlobal;

} (window.jQuery);/*!
 * Timepicker Component for Twitter Bootstrap
 *
 * Copyright 2013 Joris de Wit
 *
 * Contributors https://github.com/jdewit/bootstrap-timepicker/graphs/contributors
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
;(function($, window, document, undefined) {

  'use strict'; // jshint ;_;

  // TIMEPICKER PUBLIC CLASS DEFINITION
  var Timepicker = function(element, options) {
    this.widget = '';
    this.$element = $(element);
    this.defaultTime = options.defaultTime;
    this.disableFocus = options.disableFocus;
    this.isOpen = options.isOpen;
    this.minuteStep = options.minuteStep;
    this.modalBackdrop = options.modalBackdrop;
    this.secondStep = options.secondStep;
    this.showInputs = options.showInputs;
    this.showMeridian = options.showMeridian;
    this.showSeconds = options.showSeconds;
    this.template = options.template;

    this._init();
  };

  Timepicker.prototype = {

    constructor: Timepicker,

    _init: function() {
      var self = this;
/*
      if (this.$element.parent().hasClass('input-append')) {
          this.$element.parent('.input-append').find('.add-on').on({
            'click.timepicker': $.proxy(this.showWidget, this)
          });
          this.$element.on({
            'focus.timepicker': $.proxy(this.highlightUnit, this),
            'click.timepicker': $.proxy(this.highlightUnit, this),
            'keydown.timepicker': $.proxy(this.elementKeydown, this),
            'blur.timepicker': $.proxy(this.blurElement, this)
          });
      } else {
*/
        if (this.template) {
          this.$element.on({
            'focus.timepicker': $.proxy(this.showWidget, this),
            'click.timepicker': $.proxy(this.showWidget, this),
            'blur.timepicker': $.proxy(this.blurElement, this)
          });
        } else {
          this.$element.on({
            'focus.timepicker': $.proxy(this.highlightUnit, this),
            'click.timepicker': $.proxy(this.highlightUnit, this),
            'keydown.timepicker': $.proxy(this.elementKeydown, this),
            'blur.timepicker': $.proxy(this.blurElement, this)
          });
        }
      //}

      if (this.template !== false) {
        this.$widget = $(this.getTemplate()).appendTo(this.$element.parents('.bootstrap-timepicker')).on('click', $.proxy(this.widgetClick, this));
      } else {
        this.$widget = false;
      }

      if (this.showInputs && this.$widget !== false) {
          this.$widget.find('input').each(function() {
            $(this).on({
              'click.timepicker': function() { $(this).select(); },
              'keydown.timepicker': $.proxy(self.widgetKeydown, self)
            });
          });
      }

      this.setDefaultTime(this.defaultTime);
    },

    blurElement: function() {
      this.highlightedUnit = undefined;
      this.updateFromElementVal();
    },

    decrementHour: function() {
      if (this.showMeridian) {
        if (this.hour === 1) {
          this.hour = 12;
        } else if (this.hour === 12) {
          this.hour--;

          return this.toggleMeridian();
        } else if (this.hour === 0) {
          this.hour = 11;

          return this.toggleMeridian();
        } else {
          this.hour--;
        }
      } else {
        if (this.hour === 0) {
          this.hour = 23;
        } else {
          this.hour--;
        }
      }
      this.update();
    },

    decrementMinute: function(step) {
      var newVal;

      if (step) {
        newVal = this.minute - step;
      } else {
        newVal = this.minute - this.minuteStep;
      }

      if (newVal < 0) {
        this.decrementHour();
        this.minute = newVal + 60;
      } else {
        this.minute = newVal;
      }
      this.update();
    },

    decrementSecond: function() {
      var newVal = this.second - this.secondStep;

      if (newVal < 0) {
        this.decrementMinute(true);
        this.second = newVal + 60;
      } else {
        this.second = newVal;
      }
      this.update();
    },

    elementKeydown: function(e) {
      switch (e.keyCode) {
        case 9: //tab
          this.updateFromElementVal();

          switch (this.highlightedUnit) {
            case 'hour':
              e.preventDefault();
              this.highlightNextUnit();
            break;
            case 'minute':
              if (this.showMeridian || this.showSeconds) {
                e.preventDefault();
                this.highlightNextUnit();
              }
            break;
            case 'second':
              if (this.showMeridian) {
                e.preventDefault();
                this.highlightNextUnit();
              }
            break;
          }
        break;
        case 27: // escape
          this.updateFromElementVal();
        break;
        case 37: // left arrow
          e.preventDefault();
          this.highlightPrevUnit();
          this.updateFromElementVal();
        break;
        case 38: // up arrow
          e.preventDefault();
          switch (this.highlightedUnit) {
            case 'hour':
              this.incrementHour();
              this.highlightHour();
            break;
            case 'minute':
              this.incrementMinute();
              this.highlightMinute();
            break;
            case 'second':
              this.incrementSecond();
              this.highlightSecond();
            break;
            case 'meridian':
              this.toggleMeridian();
              this.highlightMeridian();
            break;
          }
        break;
        case 39: // right arrow
          e.preventDefault();
          this.updateFromElementVal();
          this.highlightNextUnit();
        break;
        case 40: // down arrow
          e.preventDefault();
          switch (this.highlightedUnit) {
            case 'hour':
              this.decrementHour();
              this.highlightHour();
            break;
            case 'minute':
              this.decrementMinute();
              this.highlightMinute();
            break;
            case 'second':
              this.decrementSecond();
              this.highlightSecond();
            break;
            case 'meridian':
              this.toggleMeridian();
              this.highlightMeridian();
            break;
          }
        break;
      }
    },

    formatTime: function(hour, minute, second, meridian) {
      hour = hour < 10 ? '0' + hour : hour;
      minute = minute < 10 ? '0' + minute : minute;
      second = second < 10 ? '0' + second : second;

      return hour + ':' + minute + (this.showSeconds ? ':' + second : '') + (this.showMeridian ? ' ' + meridian : '');
    },

    getCursorPosition: function() {
      var input = this.$element.get(0);

      if ('selectionStart' in input) {// Standard-compliant browsers

        return input.selectionStart;
      } else if (document.selection) {// IE fix
        input.focus();
        var sel = document.selection.createRange(),
          selLen = document.selection.createRange().text.length;

        sel.moveStart('character', - input.value.length);

        return sel.text.length - selLen;
      }
    },

    getTemplate: function() {
      var template,
        hourTemplate,
        minuteTemplate,
        secondTemplate,
        meridianTemplate,
        templateContent;

      if (this.showInputs) {
        hourTemplate = '<input type="text" name="hour" class="bootstrap-timepicker-hour" maxlength="2"/>';
        minuteTemplate = '<input type="text" name="minute" class="bootstrap-timepicker-minute" maxlength="2"/>';
        secondTemplate = '<input type="text" name="second" class="bootstrap-timepicker-second" maxlength="2"/>';
        meridianTemplate = '<input type="text" name="meridian" class="bootstrap-timepicker-meridian" maxlength="2"/>';
      } else {
        hourTemplate = '<span class="bootstrap-timepicker-hour"></span>';
        minuteTemplate = '<span class="bootstrap-timepicker-minute"></span>';
        secondTemplate = '<span class="bootstrap-timepicker-second"></span>';
        meridianTemplate = '<span class="bootstrap-timepicker-meridian"></span>';
      }

      templateContent = '<table>'+
         '<tr>'+
           '<td><a href="#" data-action="incrementHour"><i class="glyphicon-chevron-up"></i></a></td>'+
           '<td class="separator">&nbsp;</td>'+
           '<td><a href="#" data-action="incrementMinute"><i class="glyphicon-chevron-up"></i></a></td>'+
           (this.showSeconds ?
             '<td class="separator">&nbsp;</td>'+
             '<td><a href="#" data-action="incrementSecond"><i class="glyphicon-chevron-up"></i></a></td>'
           : '') +
           (this.showMeridian ?
             '<td class="separator">&nbsp;</td>'+
             '<td class="meridian-column"><a href="#" data-action="toggleMeridian"><i class="glyphicon-chevron-up"></i></a></td>'
           : '') +
         '</tr>'+
         '<tr>'+
           '<td>'+ hourTemplate +'</td> '+
           '<td class="separator">:</td>'+
           '<td>'+ minuteTemplate +'</td> '+
           (this.showSeconds ?
            '<td class="separator">:</td>'+
            '<td>'+ secondTemplate +'</td>'
           : '') +
           (this.showMeridian ?
            '<td class="separator">&nbsp;</td>'+
            '<td>'+ meridianTemplate +'</td>'
           : '') +
         '</tr>'+
         '<tr>'+
           '<td><a href="#" data-action="decrementHour"><i class="glyphicon-chevron-down"></i></a></td>'+
           '<td class="separator"></td>'+
           '<td><a href="#" data-action="decrementMinute"><i class="glyphicon-chevron-down"></i></a></td>'+
           (this.showSeconds ?
            '<td class="separator">&nbsp;</td>'+
            '<td><a href="#" data-action="decrementSecond"><i class="glyphicon-chevron-down"></i></a></td>'
           : '') +
           (this.showMeridian ?
            '<td class="separator">&nbsp;</td>'+
            '<td><a href="#" data-action="toggleMeridian"><i class="glyphicon-chevron-down"></i></a></td>'
           : '') +
         '</tr>'+
       '</table>';

      switch(this.template) {
        case 'modal':
          template = '<div class="bootstrap-timepicker-widget modal hide fade in" data-backdrop="'+ (this.modalBackdrop ? 'true' : 'false') +'">'+
            '<div class="modal-header">'+
              '<a href="#" class="close" data-dismiss="modal">×</a>'+
              '<h3>Pick a Time</h3>'+
            '</div>'+
            '<div class="modal-content">'+
              templateContent +
            '</div>'+
            '<div class="modal-footer">'+
              '<a href="#" class="btn btn-primary" data-dismiss="modal">OK</a>'+
            '</div>'+
          '</div>';
        break;
        case 'dropdown':
          template = '<div class="bootstrap-timepicker-widget dropdown-menu">'+ templateContent +'</div>';
        break;
      }

      return template;
    },

    getTime: function() {
      return this.formatTime(this.hour, this.minute, this.second, this.meridian);
    },

    hideWidget: function() {
      if (this.isOpen === false) {
        return;
      }

      this.updateFromWidgetInputs();

      this.$element.triggerHandler({
        'type': 'hide.timepicker',
        'time': {
            'value': this.getTime(),
            'hours': this.hour,
            'minutes': this.minute,
            'seconds': this.second,
            'meridian': this.meridian
         }
      });

      if (this.template === 'modal') {
        this.$widget.modal('hide');
      } else {
        this.$widget.removeClass('open');
      }

      $(document).off('mousedown.timepicker');

      this.isOpen = false;
    },

    highlightUnit: function() {
      this.position = this.getCursorPosition();
      if (this.position >= 0 && this.position <= 2) {
        this.highlightHour();
      } else if (this.position >= 3 && this.position <= 5) {
        this.highlightMinute();
      } else if (this.position >= 6 && this.position <= 8) {
        if (this.showSeconds) {
          this.highlightSecond();
        } else {
          this.highlightMeridian();
        }
      } else if (this.position >= 9 && this.position <= 11) {
        this.highlightMeridian();
      }
    },

    highlightNextUnit: function() {
      switch (this.highlightedUnit) {
        case 'hour':
          this.highlightMinute();
        break;
        case 'minute':
          if (this.showSeconds) {
            this.highlightSecond();
          } else if (this.showMeridian){
            this.highlightMeridian();
          } else {
            this.highlightHour();
          }
        break;
        case 'second':
          if (this.showMeridian) {
            this.highlightMeridian();
          } else {
            this.highlightHour();
          }
        break;
        case 'meridian':
          this.highlightHour();
        break;
      }
    },

    highlightPrevUnit: function() {
      switch (this.highlightedUnit) {
        case 'hour':
          this.highlightMeridian();
        break;
        case 'minute':
          this.highlightHour();
        break;
        case 'second':
          this.highlightMinute();
        break;
        case 'meridian':
          if (this.showSeconds) {
            this.highlightSecond();
          } else {
            this.highlightMinute();
          }
        break;
      }
    },

    highlightHour: function() {
      var $element = this.$element;

      this.highlightedUnit = 'hour';

      setTimeout(function() {
        $element.get(0).setSelectionRange(0,2);
      }, 0);
    },

    highlightMinute: function() {
      var $element = this.$element;

      this.highlightedUnit = 'minute';

      setTimeout(function() {
        $element.get(0).setSelectionRange(3,5);
      }, 0);
    },

    highlightSecond: function() {
      var $element = this.$element;

      this.highlightedUnit = 'second';

      setTimeout(function() {
        $element.get(0).setSelectionRange(6,8);
      }, 0);
    },

    highlightMeridian: function() {
      var $element = this.$element;

      this.highlightedUnit = 'meridian';

      if (this.showSeconds) {
        setTimeout(function() {
          $element.get(0).setSelectionRange(9,11);
        }, 0);
      } else {
        setTimeout(function() {
          $element.get(0).setSelectionRange(6,8);
        }, 0);
      }
    },

    incrementHour: function() {
      if (this.showMeridian) {
        if (this.hour === 11) {
          this.hour++;
          return this.toggleMeridian();
        } else if (this.hour === 12) {
          this.hour = 0;
        }
      }
      if (this.hour === 23) {
        this.hour = 0;
      }
      this.hour++;
      this.update();
    },

    incrementMinute: function(step) {
      var newVal;

      if (step) {
        newVal = this.minute + step;
      } else {
        newVal = this.minute + this.minuteStep - (this.minute % this.minuteStep);
      }

      if (newVal > 59) {
        this.incrementHour();
        this.minute = newVal - 60;
      } else {
        this.minute = newVal;
      }
      this.update();
    },

    incrementSecond: function() {
      var newVal = this.second + this.secondStep - (this.second % this.secondStep);

      if (newVal > 59) {
        this.incrementMinute(true);
        this.second = newVal - 60;
      } else {
        this.second = newVal;
      }
      this.update();
    },

    remove: function() {
      $('document').off('.timepicker');
      if (this.$widget) {
        this.$widget.remove();
      }
      delete this.$element.data().timepicker;
    },

    setDefaultTime: function(defaultTime){
      if (!this.$element.val()) {
        if (defaultTime === 'current') {
          var dTime = new Date(),
            hours = dTime.getHours(),
            minutes = Math.floor(dTime.getMinutes() / this.minuteStep) * this.minuteStep,
            seconds = Math.floor(dTime.getSeconds() / this.secondStep) * this.secondStep,
            meridian = 'AM';

          if (this.showMeridian) {
            if (hours === 0) {
              hours = 12;
            } else if (hours >= 12) {
              if (hours > 12) {
                hours = hours - 12;
              }
              meridian = 'PM';
            } else {
              meridian = 'AM';
            }
          }

          this.hour = hours;
          this.minute = minutes;
          this.second = seconds;
          this.meridian = meridian;

          this.update();

        } else if (defaultTime === false) {
          this.hour = 0;
          this.minute = 0;
          this.second = 0;
          this.meridian = 'AM';
        } else {
          this.setTime(defaultTime);
        }
      } else {
        this.updateFromElementVal();
      }
    },

    setTime: function(time) {
      var arr,
        timeArray;

      if (this.showMeridian) {
        arr = time.split(' ');
        timeArray = arr[0].split(':');
        this.meridian = arr[1];
      } else {
        timeArray = time.split(':');
      }

      this.hour = parseInt(timeArray[0], 10);
      this.minute = parseInt(timeArray[1], 10);
      this.second = parseInt(timeArray[2], 10);

      if (isNaN(this.hour)) {
        this.hour = 0;
      }
      if (isNaN(this.minute)) {
        this.minute = 0;
      }

      if (this.showMeridian) {
        if (this.hour > 12) {
          this.hour = 12;
        } else if (this.hour < 1) {
          this.hour = 12;
        }

        if (this.meridian === 'am' || this.meridian === 'a') {
          this.meridian = 'AM';
        } else if (this.meridian === 'pm' || this.meridian === 'p') {
          this.meridian = 'PM';
        }

        if (this.meridian !== 'AM' && this.meridian !== 'PM') {
          this.meridian = 'AM';
        }
      } else {
         if (this.hour >= 24) {
          this.hour = 23;
        } else if (this.hour < 0) {
          this.hour = 0;
        }
      }

      if (this.minute < 0) {
        this.minute = 0;
      } else if (this.minute >= 60) {
        this.minute = 59;
      }

      if (this.showSeconds) {
        if (isNaN(this.second)) {
          this.second = 0;
        } else if (this.second < 0) {
          this.second = 0;
        } else if (this.second >= 60) {
          this.second = 59;
        }
      }

      this.update();
    },

    showWidget: function() {
      if (this.isOpen) {
        return;
      }

      var self = this;
      $(document).on('mousedown.timepicker', function (e) {
        // Clicked outside the timepicker, hide it
        if ($(e.target).closest('.bootstrap-timepicker-widget').length === 0) {
          self.hideWidget();
        }
      });

      this.$element.triggerHandler({
        'type': 'show.timepicker',
        'time': {
            'value': this.getTime(),
            'hours': this.hour,
            'minutes': this.minute,
            'seconds': this.second,
            'meridian': this.meridian
         }
      });

      if (this.disableFocus) {
        this.$element.blur();
      }

      this.updateFromElementVal();

      if (this.template === 'modal') {
        this.$widget.modal('show').on('hidden', $.proxy(this.hideWidget, this));
      } else {
        if (this.isOpen === false) {
          this.$widget.addClass('open');
        }
      }

      this.isOpen = true;
    },

    toggleMeridian: function() {
      this.meridian = this.meridian === 'AM' ? 'PM' : 'AM';
      this.update();
    },

    update: function() {
      this.$element.triggerHandler({
        'type': 'changeTime.timepicker',
        'time': {
            'value': this.getTime(),
            'hours': this.hour,
            'minutes': this.minute,
            'seconds': this.second,
            'meridian': this.meridian
         }
      });

      this.updateElement();
      this.updateWidget();
    },

    updateElement: function() {
      this.$element.val(this.getTime());
    },

    updateFromElementVal: function() {
      this.setTime(this.$element.val());
    },

    updateWidget: function() {
      if (this.$widget === false) {
        return;
      }

      var hour = this.hour < 10 ? '0' + this.hour : this.hour,
          minute = this.minute < 10 ? '0' + this.minute : this.minute,
          second = this.second < 10 ? '0' + this.second : this.second;

      if (this.showInputs) {
        this.$widget.find('input.bootstrap-timepicker-hour').val(hour);
        this.$widget.find('input.bootstrap-timepicker-minute').val(minute);

        if (this.showSeconds) {
          this.$widget.find('input.bootstrap-timepicker-second').val(second);
        }
        if (this.showMeridian) {
          this.$widget.find('input.bootstrap-timepicker-meridian').val(this.meridian);
        }
      } else {
        this.$widget.find('span.bootstrap-timepicker-hour').text(hour);
        this.$widget.find('span.bootstrap-timepicker-minute').text(minute);

        if (this.showSeconds) {
          this.$widget.find('span.bootstrap-timepicker-second').text(second);
        }
        if (this.showMeridian) {
          this.$widget.find('span.bootstrap-timepicker-meridian').text(this.meridian);
        }
      }
    },

    updateFromWidgetInputs: function() {
      if (this.$widget === false) {
        return;
      }
      var time = $('input.bootstrap-timepicker-hour', this.$widget).val() + ':' +
        $('input.bootstrap-timepicker-minute', this.$widget).val() +
        (this.showSeconds ? ':' + $('input.bootstrap-timepicker-second', this.$widget).val() : '') +
        (this.showMeridian ? ' ' + $('input.bootstrap-timepicker-meridian', this.$widget).val() : '');

      this.setTime(time);
    },

    widgetClick: function(e) {
      e.stopPropagation();
      e.preventDefault();

      var action = $(e.target).closest('a').data('action');
      if (action) {
        this[action]();
      }
    },

    widgetKeydown: function(e) {
      var $input = $(e.target).closest('input'),
          name = $input.attr('name');

      switch (e.keyCode) {
        case 9: //tab
          if (this.showMeridian) {
            if (name === 'meridian') {
              return this.hideWidget();
            }
          } else {
            if (this.showSeconds) {
              if (name === 'second') {
                return this.hideWidget();
              }
            } else {
              if (name === 'minute') {
                return this.hideWidget();
              }
            }
          }

          this.updateFromWidgetInputs();
        break;
        case 27: // escape
          this.hideWidget();
        break;
        case 38: // up arrow
          e.preventDefault();
          switch (name) {
            case 'hour':
              this.incrementHour();
            break;
            case 'minute':
              this.incrementMinute();
            break;
            case 'second':
              this.incrementSecond();
            break;
            case 'meridian':
              this.toggleMeridian();
            break;
          }
        break;
        case 40: // down arrow
          e.preventDefault();
          switch (name) {
            case 'hour':
              this.decrementHour();
            break;
            case 'minute':
              this.decrementMinute();
            break;
            case 'second':
              this.decrementSecond();
            break;
            case 'meridian':
              this.toggleMeridian();
            break;
          }
        break;
      }
    }
  };


  //TIMEPICKER PLUGIN DEFINITION
  $.fn.timepicker = function(option) {
    var args = Array.apply(null, arguments);
    args.shift();
    return this.each(function() {
      var $this = $(this),
        data = $this.data('timepicker'),
        options = typeof option === 'object' && option;

      if (!data) {
        $this.data('timepicker', (data = new Timepicker(this, $.extend({}, $.fn.timepicker.defaults, options, $(this).data()))));
      }

      if (typeof option === 'string') {
        data[option].apply(data, args);
      }
    });
  };

  $.fn.timepicker.defaults = {
    defaultTime: 'current',
    disableFocus: false,
    isOpen: false,
    minuteStep: 15,
    modalBackdrop: false,
    secondStep: 15,
    showSeconds: false,
    showInputs: true,
    showMeridian: true,
    template: 'dropdown'
  };

  $.fn.timepicker.Constructor = Timepicker;

})(jQuery, window, document);!function ($) {

	"use strict"; // jshint ;_;

	/* PANE MANAGER CLASS DEFINITION
	* ====================== */

	var PaneManager = function (element, options) {
		this.init(element, options);
	};

	PaneManager.prototype = {

		constructor: PaneManager,

		init: function (element, options) {
			this.$element = $(element);
			this.options = $.extend({}, $.fn.panemanager.defaults, this.$element.data(), typeof options == 'object' && options);
			this.stack = [];

			if (this.options.defaultPane) {
				this.stack.push(this.createDefaultPane());
			}
		},

		addPane: function (pane) {
			var that = this,
				outPane = that.getCurrentPane();

			this.stack.push(pane);


			this.$element.addClass('pane-transition')
				.css('min-height', this.$element.height());

			if (outPane) {
				// if (this.options.preserveScroll) {
				// 	outPane.scrollTop = $(this.options.preserveScroll)[0].scrollTop;
				// }
				outPane.hide('forwards');
			}

			if (pane.$element.parent()[0] !== this.$element[0]){
				pane.$element.appendTo(this.$element);
			}

			pane.$element.on('shown.panemanager', targetIsSelf(function (e) {
				that.$element
					.removeClass('pane-transition')
					.css('min-height', '');
			}));
		},

		removePane: function (pane) {
			var that = this,
				inPane = that.getPreviousPane(pane);

			// if (this.options.preserveScroll) {
			// 	setTimeout(function () {
			// 		$(that.options.preserveScroll)[0].scrollTop = inPane.scrollTop;
			// 	}, 0);
			// }

			this.$element.addClass('pane-transition')
				.css('min-height', this.$element.height());

			inPane.show('backwards');

			pane.$element.on('hidden.panemanager', targetIsSelf(function (e) {
				that.$element
					.removeClass('pane-transition')
					.css('min-height', '');

				that.stack.splice(that.getIndexOfPane(pane), 1);

				pane.$element.off('.panemanager');
				pane.destroy();

				if (inPane.isDefault) {
					that.destroy();
					// inPane.$element.off('.panemanager');
					// inPane.destroy();
				}
			}));
		},

		getCurrentPane: function () {
			// get most recent pane
			for (var i = this.stack.length - 1; i >= 0; i--) {
				if (this.stack[i].isShown) {
					return this.stack[i];
				}
			}
		},

		getPreviousPane: function (pane) {
			var currentIndex = this.getIndexOfPane(pane);

			for (var i = currentIndex; i >= 0; i--) {
				if (!this.stack[i].isShown) {
					return this.stack[i];
				}
			}
		},

		getPreviousPaneForContainer: function ($container) {
			var currentPane = this.getCurrentPaneForContainer($container),
				currentIndex = this.getIndexOfPane(currentPane);

			for (var i = currentIndex + 1; i >= 0; i--) {
				if (!this.stack[i].isShown && this.stack[i].$container[0] === $container[0]) {
					return this.stack[i];
				}
			}
		},

		getIndexOfPane: function (pane) {
			for (var i = 0; i < this.stack.length; i++) {
				if (this.stack[i] === pane) return i;
			}

			return -1;
		},

		createDefaultPane: function () {
			var pane, 
				wrapperCreated,
				options = {},
				$pane = this.$element.children();

			if ($pane.length > 1 || !$pane.hasClass('pane')) {
				wrapperCreated = true;

				$pane = $('<div class="pane">')
					.append($pane)
					.appendTo(this.$element);

				// set all breakpoints to pane manager
				for (var bp in $.fn.pane.defaults.breakpoints) {
					options[bp + 'Container'] = this.$element;
				}
			}

			options.show = false;

			pane = $pane.pane(options).data('pane');

			pane.isDefault = true;
			pane.isShown = true;
			pane.wrapperCreated = wrapperCreated;
			pane.$parent = this.$element;
			// pane.$container = basePane.$container;

			// manually add pane before the pane were trying to show
			// this.addPane(pane, 0);

			return pane;
		},

		destroy: function () {
			var e = $.Event('destroy');
			this.$element.trigger(e);
			if (e.isDefaultPrevented()) return;

			for (var i = 0; i < this.stack.length; i++) {
				var pane = this.stack[i];
				if (pane.wrapperCreated) {
					pane.$element.children().appendTo(pane.$parent);
					pane.$parent = null;
				}	
				pane.$element.off('.panemanager');
				pane.destroy();
			}

			this.$element.off('.panemanager');
			this.$element.removeData('panemanager');
		}
	};

	
	// make sure the event target is the modal itself in order to prevent
	// other components such as tabs from triggering the modal manager.
	// if Boostsrap namespaced events, this would not be needed.
	function targetIsSelf (callback) {
		return function (e) {
			if (this === e.target){
				return callback.apply(this, arguments);
			}
		}
	}


	/* PANE MANAGER PLUGIN DEFINITION
	* ======================= */

	$.fn.panemanager = function (option, args) {
		return this.each(function () {
			var $this = $(this),
				data = $this.data('panemanager');

			if (!data) $this.data('panemanager', (data = new PaneManager(this, option)));
			if (typeof option === 'string') data[option].apply(data, [].concat(args));
		})
	};

	$.fn.panemanager.defaults = {
		preserveScroll: 'body',
		defaultPane: true
	};

	$.fn.panemanager.Constructor = PaneManager

}(jQuery);
!function ($) {

	"use strict"; // jshint ;_;

	/* ANIMATION SUPPORT 
	* ====================== */

	$(function () {

		$.support.animation = (function () {

			var animationEnd = (function () {

				var el = document.createElement('bootstrap'), 
					animsEndEventNames = {
				   		'WebkitAnimation'  : 'webkitAnimationEnd',
						'MozAnimation'     : 'animationend',
						'OAnimation'       : 'oAnimationEnd',
						'msAnimation'       : 'MSAnimationEnd',
						'animation'         : 'animationend'
					},
				  	name;

				for (name in animsEndEventNames){
					if (el.style[name] !== undefined) {
						return animsEndEventNames[name];
					}
				}

			}());

			return animationEnd && {
				end: animationEnd
			}

		})();

	});


	/* PANE CLASS DEFINITION
	* ====================== */

	var Pane = function (element, options) {
		this.init(element, options);
	};

	Pane.prototype = {

		constructor: Pane,

		init: function (element, options) {
			var that = this;
			
			this.options = options;

			this.$element = $(element)
				.on('click.dismiss.pane', '[data-dismiss="pane"]', function (e) {
					e.preventDefault();
					that.hide('backwards');
				});
		},

		toggle: function () {
			return this.isShown ? this.hide('backwards') : this.show('forwards');
		},

		show: function (direction) {
			var e = $.Event('show', { direction: direction }),
				direction = direction || 'forwards',
				that = this,
				animation,
				manager;

			if (this.isShown) return;

			this.$element.trigger(e);

			if (e.isDefaultPrevented()) return;

			if (direction === 'forwards') {
				// save off original parent
				this.$parent = this.$parent || this.$element.parent();

				manager = this.getManager();
				manager.addPane(this);
			}

			this.isShown = true;

			this.escape();

			if (this.options.loading) this.loading();

			if (this.options.remote && direction === 'forwards') {
				this.loading();

				$.ajax(this.options.remote, this.options.ajaxSettings)
					.done(function (data) {
						that.loading();
						// empty all but loading mask
						that.$element.children().not('.loading-mask').remove();
						that.$element.append(data);
					});
			}

			if ($.support.animation) this.$element[0].offsetWidth;

			animation = this.getAnimation(direction, false);

			this.$element.show()
				.addClass(animation);

			$.support.animation && animation ?
				this.withTransition('showPane', direction) :
				this.showPane(direction);
		},

		showPane: function (direction) {
			var that = this;

			this.$element
				.focus()
				.removeClass(this.options[direction + 'In'])
				.trigger('shown', { direction: direction });

		},

		hide: function (direction) {
			var e = $.Event('hide', { direction: direction }),
				animation, 
				manager;

			if (!this.isShown) return;

			this.$element.trigger(e);

			if (e.isDefaultPrevented()) return (this.isShown = false);

			if (direction === 'backwards') {
				manager = this.getManager();
				manager.removePane(this);
			}

			this.isShown = false;

			this.focused = $(document.activeElement);

			this.escape();

			if ($.support.animation) this.$element[0].offsetWidth; 

			animation = this.getAnimation(direction, true);

			this.$element
				.addClass('pane-out')
				.addClass(animation);

			$.support.animation && animation ?
				this.withTransition('hidePane', direction) :
				this.hidePane(direction);
		},

		hidePane: function (direction) {
			var e = $.Event('hidden', { direction: direction });

			this.$element
				.hide()
				.removeClass('pane-out')
				.removeClass(this.options[direction + 'Out'])
				.trigger(e);
		},

		withTransition: function (method, direction) {
			var that = this, 
				timeout = setTimeout(function () {
					that.$element.off($.support.animation.end);
					that[method](direction);
				}, 500);

			this.$element.one($.support.animation.end, function () {
				clearTimeout(timeout);
				that[method](direction);
			});
		},

		escape: function () {
			var that = this;
			if (this.isShown && this.options.keyboard) {
				if (!this.$element.attr('tabindex')) this.$element.attr('tabindex', -1);

				this.$element.on('keyup.dismiss.pane', function (e) {
					e.which == 27 && that.hide('backwards');
				});
			} else if (!this.isShown) {
				this.$element.off('keyup.dismiss.pane');
			}
		},

		loading: function (cb) {
			cb = cb || function () {};

			if (!this.isLoading) {
				this.$element
					.css('height', this.options.loadingHeight)
					.addClass('pane-loading');

				this.$loading = $('<div class="loading-mask fade">')
					.append(this.options.spinner)
					.appendTo(this.$element);

				if ($.support.transition) this.$loading[0].offsetWidth; // force reflow

				this.$loading.addClass('in');

				this.isLoading = true;

				$.support.transition ?
					this.$loading.one($.support.transition.end, cb) :
					cb();
			} else if (this.isLoading && this.$loading) {
				this.$loading.removeClass('in');

				var that = this;
				$.support.transition ? 
					this.$loading.one($.support.transition.end, function () { that.removeLoading() }) :
					that.removeLoading();

			} else if (cb) {
				cb(this.isLoading);
			}
		},

		removeLoading: function () {
			this.$element
				.css('height', '')
				.removeClass('pane-loading');

			this.$loading.remove();
			this.$loading = null;
			this.isLoading = false;
		},

		getAnimation: function (dir, out) {
			var bp = this.getBreakpoint(),
				dirCap = dir.charAt(0).toUpperCase() + dir.slice(1),
				suffix =  (out ? 'Out' : 'In'),
				animation;

			// check for breakpoint animations first (i.e mobileForwardsIn)
			animation = this.options[bp + dirCap + suffix];
			// fallback to default animation
			animation = animation || this.options[dir + suffix];

			return animation;
		},

		getManager: function () {
			var container;

			// reuse already assigned manager
			if (this.manager) return this.manager;
			// check for breakpoint container first
			container = this.options[this.getBreakpoint() + 'Container'];
			// fallback to provided container
			container = container || this.options.container;
			// fallback to parent as container
			container = container || this.$element.parent();

			return $(container).panemanager().data('panemanager');
		},

		getBreakpoint: function () {
			var bp = this.options.defaultBreakpoint;

			if (window.matchMedia) {
				for (bp in this.options.breakpoints) {
					var query = this.options.breakpoints[bp];
					if (window.matchMedia(query).matches) return bp;
				}
			}

			return bp;
		},

		destroy: function () {
			var e = $.Event('destroy');
			this.$element.trigger(e);
			if (e.isDefaultPrevented()) return;

			if (!this.$parent || !this.$parent.length){
				this.$element.remove();
				this.$element = null;
				return;
			}

			if (this.$parent !== this.$element.parent()){
				this.$element.appendTo(this.$parent);
			}

			this.$element.off('.pane');
			this.$element.removeData('pane');
		}
	};


	/* PANE PLUGIN DEFINITION
	* ======================= */

	$.fn.pane = function (option, args) {
		return this.each(function () {
			var $this = $(this),
				data = $this.data('pane'),
				options = $.extend({}, $.fn.pane.defaults, $this.data(), typeof option == 'object' && option);

			if (!data) $this.data('pane', (data = new Pane(this, options)));
			if (typeof option == 'string') data[option].apply(data, [].concat(args));
			else if (options.show) data.show('forwards');
		});
	};

	$.fn.pane.defaults = {
		show: true,
		keyboard: true,
		loading: false,
		loadingHeight: '200px',
		ajaxSettings: {
			cache: true
		},
		spinner: 
			'<div class="loading-spinner" style="width: 200px; margin-left: -100px;">' +  
				'<div class="progress progress-striped active">' +
					'<div class="bar" style="width: 100%;"></div>' +
				'</div>' +
			'</div>',
		breakpoints: {
			phone: '(max-width: 767px)',
			tablet: '(min-width: 768px) and (max-width: 979px)',
			desktop: '(min-width: 980px)'
		},
		defaultBreakpoint: 'desktop',
		forwardsIn: 'slideInLeft animated',
		forwardsOut: 'slideOutLeft animated',
		backwardsIn: 'slideInRight animated',
		backwardsOut: 'slideOutRight animated'
	};

	$.fn.pane.Constructor = Pane;


	/* PANE DATA-API
	* ============== */

	$(function () {
		$(document).on('click.pane.data-api', '[data-toggle="pane"]', function (e) {
			var $this = $(this),
				href = $this.attr('href'),
				$target = $($this.attr('data-target') || (href && href.replace(/.*(?=#[^\s]+$)/, ''))), //strip for ie7
				option = $target.data('pane') ? 'toggle' : $.extend({ remote: !/#/.test(href) && href }, $target.data(), $this.data());

			e.preventDefault();

			$target.pane(option);
		});
	});

}(window.jQuery);
