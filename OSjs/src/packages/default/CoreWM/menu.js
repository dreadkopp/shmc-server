/*!
 * OS.js - JavaScript Cloud/Web Desktop Platform
 *
 * Copyright (c) 2011-2017, Anders Evenrud <andersevenrud@gmail.com>
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
 * ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @licence Simplified BSD License
 */

/*eslint valid-jsdoc: "off"*/
(function(WindowManager, Window, GUI, Utils, API, VFS) {
  'use strict';

  function _createIcon(aiter, aname, arg) {
    return API.getIcon(aiter.icon, arg, aiter.className);
  }

  /**
   * Create default application menu with categories (sub-menus)
   */
  function doBuildCategoryMenu(ev) {
    var apps = OSjs.Core.getPackageManager().getPackages();
    var wm = OSjs.Core.getWindowManager();
    var cfgCategories = wm.getDefaultSetting('menu');

    function createEvent(iter) {
      return function(el) {
        OSjs.GUI.Helpers.createDraggable(el, {
          type: 'application',
          data: {
            launch: iter.name
          }
        });
      };
    }

    function clickEvent(iter) {
      return function() {
        API.launch(iter.name);
      };
    }

    var cats = {};

    Object.keys(cfgCategories).forEach(function(c) {
      cats[c] = [];
    });

    Object.keys(apps).forEach(function(a) {
      var iter = apps[a];
      if ( iter.type === 'application' && iter.visible !== false ) {
        var cat = iter.category && cats[iter.category] ? iter.category : 'unknown';
        cats[cat].push({name: a, data: iter});
      }
    });

    var list = [];
    Object.keys(cats).forEach(function(c) {
      var submenu = [];
      for ( var a = 0; a < cats[c].length; a++ ) {
        var iter = cats[c][a];
        submenu.push({
          title: iter.data.name,
          icon: _createIcon(iter.data, iter.name),
          tooltip: iter.data.description,
          onCreated: createEvent(iter),
          onClick: clickEvent(iter)
        });
      }

      if ( submenu.length ) {
        list.push({
          title: OSjs.Applications.CoreWM._(cfgCategories[c].title),
          icon: API.getIcon(cfgCategories[c].icon, '16x16'),
          menu: submenu
        });
      }
    });

    return list;
  }

  /////////////////////////////////////////////////////////////////////////////
  // NEW MENU
  /////////////////////////////////////////////////////////////////////////////

  function ApplicationMenu() {
    var root = this.$element = document.createElement('gui-menu');
    this.$element.id = 'CoreWMApplicationMenu';
    
    var apps = OSjs.Core.getPackageManager().getPackages();

    function createEntry(a, iter) {
      var entry = document.createElement('gui-menu-entry');

      var img = document.createElement('img');
      img.src = _createIcon(iter, a, '32x32');

      var txt = document.createElement('div');
      txt.appendChild(document.createTextNode(iter.name)); //.replace(/([^\s-]{8})([^\s-]{8})/, '$1-$2')));

      Utils.$bind(entry, 'click', function(ev) {
        ev.stopPropagation();
        API.launch(a);
        API.blurMenu();
      });

      entry.appendChild(img);
      entry.appendChild(txt);
      root.appendChild(entry);
    }

    
    //circular menu startdot//

var entry = document.createElement('gui-menu-entry');

      var img = document.createElement('img');
      img.src = '/themes/icons/default/16x16/osjs-white.png';

      var txt = document.createElement('div');
      txt.appendChild(document.createTextNode('Start'));

      entry.appendChild(img);
      entry.appendChild(txt);
      root.appendChild(entry);

//circular menu startdot end//


    Object.keys(apps).forEach(function(a) {
      var iter = apps[a];
      if ( iter.type === 'application' && iter.visible !== false ) {
        createEntry(a, iter);
      }
    });
  }

  ApplicationMenu.prototype.destroy = function() {

    if ( this.$element ) {
      this.$element.querySelectorAll('gui-menu-entry').forEach(function(el) {
        Utils.$unbind(el, 'click');
      });
      Utils.$remove(this.$element);
    }
    this.$element = null;
  };

  ApplicationMenu.prototype.show = function(pos) {
    if ( !this.$element ) {
      return;
    }

    if ( !this.$element.parentNode ) {
      document.body.appendChild(this.$element);
    }

    // FIXME: This is a very hackish way of doing it and does not work when button is moved!
    Utils.$removeClass(this.$element, 'AtBottom');
    Utils.$removeClass(this.$element, 'AtTop');
    if ( pos.y > (window.innerHeight / 2) ) {
      Utils.$addClass(this.$element, 'AtBottom');

      this.$element.style.top = 'auto';
      this.$element.style.bottom = '30px';
    } else {
      Utils.$addClass(this.$element, 'AtTop');

      this.$element.style.bottom = 'auto';
      this.$element.style.top = '30px';
    }

    this.$element.style.left = pos.x + 'px';
  };

  ApplicationMenu.prototype.getRoot = function() {
    return this.$element;
  };

  /////////////////////////////////////////////////////////////////////////////
  // MENU
  /////////////////////////////////////////////////////////////////////////////

  function doShowMenu(ev) {
    var wm = OSjs.Core.getWindowManager();

    if ( (wm && wm.getSetting('useTouchMenu') === true) ) {
      var inst = new ApplicationMenu();
      var pos = {x: ev.clientX, y: ev.clientY};

      if ( ev.target ) {
        var rect = Utils.$position(ev.target, document.body);
        if ( rect.left && rect.top && rect.width && rect.height ) {
          pos.x = rect.left - (rect.width / 2);

          if ( pos.x <= 16 ) {
            pos.x = 0; // Snap to left
          }

          var panel = Utils.$parent(ev.target, function(node) {
            return node.tagName.toLowerCase() === 'corewm-panel';
          });

          if ( panel ) {
            var prect = Utils.$position(panel);
            pos.y = prect.top + prect.height;
          } else {
            pos.y = rect.top + rect.height;
          }
        }
      }
      API.createMenu(null, pos, inst);
    } else {
      var list = doBuildCategoryMenu(ev);
      var m = API.createMenu(list, ev);
      if ( m && m.$element ) {
        Utils.$addClass(m.$element, 'CoreWMDefaultApplicationMenu');
      }
    }


//convert to circular menu


jQuery('gui-menu').circleMenu({
        item_diameter: 64,
        circle_radius: 400,
        direction: 'bottom-right',
	trigger:'hover'
});

  }

  /////////////////////////////////////////////////////////////////////////////
  // EXPORTS
  /////////////////////////////////////////////////////////////////////////////

  OSjs.Applications                          = OSjs.Applications || {};
  OSjs.Applications.CoreWM                   = OSjs.Applications.CoreWM || {};
  OSjs.Applications.CoreWM.showMenu          = doShowMenu;

})(OSjs.Core.WindowManager, OSjs.Core.Window, OSjs.GUI, OSjs.Utils, OSjs.API, OSjs.VFS);





/// CIRCULAR MENU ///

;(function($, window, document, undefined){
    var pluginName = 'circleMenu',
        defaults = {
            depth: 0,
            item_diameter: 30,
            circle_radius: 80,
            angle:{
                start: 0,
                end: 90
            },
            speed: 500,
            delay: 1000,
            step_out: 20,
            step_in: -20,
            trigger: 'hover',
            transition_function: 'ease'
        };

    function vendorPrefixes(items,prop,value){
        ['-webkit-','-moz-','-o-','-ms-',''].forEach(function(prefix){
            items.css(prefix+prop,value);
        });
    }

    function CircleMenu(element, options){
        this._timeouts = [];
        this.element = $(element);
        this.options = $.extend({}, defaults, options);
        this._defaults = defaults;
        this._name = pluginName;
        this.init();
        this.hook();
    }

    CircleMenu.prototype.init = function(){
        var self = this,
            directions = {
                'bottom-left':[180,90],
                'bottom':[135,45],
                'right':[-45,45],
                'left':[225,135],
                'top':[225,315],
                'bottom-half':[180,0],
                'right-half':[-90,90],
                'left-half':[270,90],
                'top-half':[180,360],
                'top-left':[270,180],
                'top-right':[270,360],
                'full':[-90,270-Math.floor(360/(self.element.children('gui-menu-entry').length - 1))],
                'bottom-right':[0,90]
            },
            dir;

        self._state = 'closed';
        self.element.addClass(pluginName+'-closed');

        if(typeof self.options.direction === 'string'){
            dir = directions[self.options.direction.toLowerCase()];
            if(dir){
                self.options.angle.start = dir[0];
                self.options.angle.end = dir[1];
            }
        }

        self.menu_items = self.element.children('gui-menu-entry:not(:first-child)');
        self.initCss();
        self.item_count = self.menu_items.length;
        self._step = (self.options.angle.end - self.options.angle.start) / (self.item_count-1);
        self.menu_items.each(function(index){
            var $item = $(this),
                angle = (self.options.angle.start + (self._step * index)) * (Math.PI/180),
                x = Math.round(self.options.circle_radius * Math.cos(angle)),
                y = Math.round(self.options.circle_radius * Math.sin(angle));

            $item.data('plugin_'+pluginName+'-pos-x', x);
            $item.data('plugin_'+pluginName+'-pos-y', y);
            $item.on('click', function(){
                self.select(index+2);
            });
        });

        // Initialize event hooks from options
        ['open','close','init','select'].forEach(function(evt){
            var fn;

            if(self.options[evt]){
                fn = self.options[evt];
                self.element.on(pluginName+'-'+evt, function(){
                    return fn.apply(self,arguments);
                });
                delete self.options[evt];
            }
        });

        self.submenus = self.menu_items.children('gui-menu');
        self.submenus.circleMenu($.extend({},self.options,{depth:self.options.depth+1}));

        self.trigger('init');
    };
    CircleMenu.prototype.trigger = function(){
        var args = [],
            i, len;

        for(i = 0, len = arguments.length; i < len; i++){
            args.push(arguments[i]);
        }
        this.element.trigger(pluginName+'-'+args.shift(), args);
    };
    CircleMenu.prototype.hook = function(){
        var self = this;

        if(self.options.trigger === 'hover'){
            self.element.on('mouseenter',function(evt){
                self.open();
            }).on('mouseleave',function(evt){
                self.close();
            });
        }else if(self.options.trigger === 'click'){
            self.element.children('gui-menu-entry:first-child').on('click',function(evt){
                evt.preventDefault();
                if(self._state === 'closed' || self._state === 'closing'){
                    self.open();
                }else{
                    self.close(true);
                }
                return false;
            });
        }else if(self.options.trigger === 'none'){
            // Do nothing
        }
    };
    CircleMenu.prototype.open = function(){
        var self = this,
            $self = this.element,
            start = 0,
            set;

        self.clearTimeouts();
        if(self._state === 'open') return self;
        $self.addClass(pluginName+'-open');
        $self.removeClass(pluginName+'-closed');
        if(self.options.step_out >= 0){
            set = self.menu_items;
        }else{
            set = $(self.menu_items.get().reverse());
        }
        set.each(function(index){
            var $item = $(this);

            self._timeouts.push(setTimeout(function(){
                $item.css({
                    left: $item.data('plugin_'+pluginName+'-pos-x')+'px',
                    top: $item.data('plugin_'+pluginName+'-pos-y')+'px'
                });
                vendorPrefixes($item,'transform','scale(1)');
            }, start + Math.abs(self.options.step_out) * index));
        });
        self._timeouts.push(setTimeout(function(){
            if(self._state === 'opening') self.trigger('open');
            self._state = 'open';
        },start+Math.abs(self.options.step_out) * set.length));
        self._state = 'opening';
        return self;
    };
    CircleMenu.prototype.close = function(immediate){
        var self = this,
            $self = this.element,
            do_animation = function do_animation(){
            var start = 0,
                set;

            self.submenus.circleMenu('close');
            self.clearTimeouts();
            if(self._state === 'closed') return self;
            if(self.options.step_in >= 0){
                set = self.menu_items;
            }else{
                set = $(self.menu_items.get().reverse());
            }
            set.each(function(index){
                var $item = $(this);

                self._timeouts.push(setTimeout(function(){
                    $item.css({top:0,left:0});
                    vendorPrefixes($item,'transform','scale(.5)');
                }, start + Math.abs(self.options.step_in) * index));
            });
            self._timeouts.push(setTimeout(function(){
                if(self._state === 'closing') self.trigger('close');
                self._state = 'closed';
            },start+Math.abs(self.options.step_in) * set.length));
            $self.removeClass(pluginName+'-open');
            $self.addClass(pluginName+'-closed');
            self._state = 'closing';
            return self;
        };
        if(immediate){
            do_animation();
        }else{
            self._timeouts.push(setTimeout(do_animation,self.options.delay));
        }
        return this;
    };
    CircleMenu.prototype.select = function(index){
        var self = this,
            selected, set_other;

        if(self._state === 'open' || self._state === 'opening'){
            self.clearTimeouts();
            set_other = self.element.children('gui-menu-entry:not(:nth-child('+index+'),:first-child)');
            selected = self.element.children('gui-menu-entry:nth-child('+index+')');
            self.trigger('select',selected);
            vendorPrefixes(selected.add(set_other), 'transition', 'all 500ms ease-out');
            vendorPrefixes(selected, 'transform', 'scale(2)');
            vendorPrefixes(set_other, 'transform', 'scale(0)');
            selected.css('opacity','0');
            set_other.css('opacity','0');
            self.element.removeClass(pluginName+'-open');
            setTimeout(function(){self.initCss();},500);
        }
    };
    CircleMenu.prototype.clearTimeouts = function(){
        var timeout;

        while(timeout = this._timeouts.shift()){
            clearTimeout(timeout);
        }
    };
    CircleMenu.prototype.initCss = function(){
        var self = this,
            $items;

        self._state = 'closed';
        self.element.removeClass(pluginName+'-open');
        self.element.css({
            'list-style': 'none',
            'margin': 0,
            'padding': 0,
            'width': self.options.item_diameter+'px'
        });
        $items = self.element.children('gui-menu-entry');
        $items.attr('style','');
        $items.css({
            'display': 'block',
            'width': self.options.item_diameter+'px',
            'height': self.options.item_diameter+'px',
            'text-align': 'center',
            'line-height': self.options.item_diameter+'px',
            'position': 'absolute',
            'z-index': 1,
            'opacity': ''
        });
        self.element.children('gui-menu-entry:first-child').css({'z-index': 1000-self.options.depth});
        self.menu_items.css({
            top:0,
            left:0
        });
        vendorPrefixes($items, 'border-radius', self.options.item_diameter+'px');
        vendorPrefixes(self.menu_items, 'transform', 'scale(.5)');
        setTimeout(function(){
            vendorPrefixes($items, 'transition', 'all '+self.options.speed+'ms '+self.options.transition_function);
        },0);
    };

    $.fn[pluginName] = function(options){
        return this.each(function(){
            var obj = $.data(this, 'plugin_'+pluginName),
                commands = {
                'init':function(){obj.init();},
                'open':function(){obj.open();},
                'close':function(){obj.close(true);}
            };
            if(typeof options === 'string' && obj && commands[options]){
                commands[options]();
            }
            if(!obj){
                $.data(this, 'plugin_' + pluginName, new CircleMenu(this, options));
            }
        });
    };
})(jQuery, window, document);



