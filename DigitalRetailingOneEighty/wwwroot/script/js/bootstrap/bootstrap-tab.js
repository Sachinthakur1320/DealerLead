/* ========================================================
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
	  
	  $previousTarget = $(previousSelector);
	  
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

}(window.jQuery);