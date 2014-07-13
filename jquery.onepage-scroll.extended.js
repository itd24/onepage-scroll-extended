// the semi-colon before function invocation is a safety net against concatenated
// scripts and/or other plugins which may not be closed properly.
;(function ( $, window, document, undefined ) {

    // undefined is used here as the undefined global variable in ECMAScript 3 is
    // mutable (ie. it can be changed by someone else). undefined isn't really being
    // passed in so we can ensure the value of it is truly undefined. In ES5, undefined
    // can no longer be modified.

    // window and document are passed through as local variable rather than global
    // as this (slightly) quickens the resolution process and can be more efficiently
    // minified (especially when both are regularly referenced in your plugin).

    //***************************************************************************************
    /*------------------------------------------------*/
    /*  Credit: Eike Send for the awesome swipe event */
    /*------------------------------------------------*/

    $.fn.swipeEvents = function () {
        return this.each(function () {

            var startX, startY, $this = $(this);

            function touchstart(event) {
                var touches = event.originalEvent.touches;
                if (touches && touches.length) {
                    startX = touches[0].pageX;
                    startY = touches[0].pageY;
                    $this.bind('touchmove', touchmove);
                }
                event.preventDefault();
            }

            function touchmove(event) {
                var touches = event.originalEvent.touches;
                if (touches && touches.length) {
                    var deltaX = startX - touches[0].pageX;
                    var deltaY = startY - touches[0].pageY;
                    var triggerOffset = 50;

                    if (deltaX >= triggerOffset) {
                        $this.trigger("swipeLeft");
                    }
                    if (deltaX <= -triggerOffset) {
                        $this.trigger("swipeRight");
                    }
                    if (deltaY >= triggerOffset) {
                        $this.trigger("swipeUp");
                    }
                    if (deltaY <= -triggerOffset) {
                        $this.trigger("swipeDown");
                    }
                    if (Math.abs(deltaX) >= triggerOffset || Math.abs(deltaY) >= triggerOffset) {
                        $this.unbind('touchmove', touchmove);
                    }
                }
                event.preventDefault();
            }

            $this.bind('touchstart', touchstart);

        });
    };
    //***************************************************************************************

    var utilities = {
        isArray:function(obj){
            return Object.prototype.toString.call(obj) === '[object Array]'; //I do not trust the default jQuery way of checking for an array.
        },
        isObject : function(obj) {
            return (!this.isFunction(obj) && !this.isArray(obj) && obj === Object(obj));
        },
        isFunction : function(obj) {
            return typeof obj === 'function';
        },
        isString : function(obj){
            return typeof obj == 'string' || obj instanceof String;
        }
    };

    // Create the defaults once
    var pluginName = "onepage_scroll_extended",
        defaults = {
            sectionContainer: "section",
            easing: "ease",
            animationTime: 1000,
            pagination: true,
            paginationContainer: "body", //extended
            updateURL: false,
            touchEnabled: true,
            mousewheelEnabled: true,
            keyboard: true,
            beforeMove: null,
            afterMove: null,
            loop: false,
            useCssTransitions:true,
            bodyElement:'body', //extended
            pagesEvents:{} //extended
        },
    //************pages_events defaults******************************
        pagesEventDefaults={
            selector:undefined,
            scrollDown:null,
            scrollUp:null,
            onlyOnScroll:false, //if true, scrollUp and scrollDown will occur only on actual scroll, not on page reload or pagination click
            isGlobal:false  //if true, the app will search for the selector globally, the container of all pages that is.
        };

    // The actual plugin constructor
    function Plugin ( element, options ) {
        this.el = element;
        this.$el = $(element);

        this.settings = $.extend( {}, defaults, options );

        //user can access the defaults but since we already initialised the settings, he can't change the defaults
        this._defaults = defaults;
        this._name = pluginName;
        this.sections = this.$el.find(this.settings.sectionContainer);
        this.bodyElement = $(this.settings.bodyElement);
        this.paginationLinks = undefined;
        this.total = this.sections.length;
        this.topPos = 0;
        this.lastAnimation = 0;
        this.quietPeriod = 100;
        this.paginationList = "";
        this.checkPagesForEvents = false;

        this.init();
    }

    Plugin.prototype = {
        init: function () {
            this.checkAndParseEvents();
            this.bindEvents();
            this.initTransformPage();
            this.initMovement();
            this.initSections();
            this.initPagination();
            this.displayCorrectPage();
            this.initTouchSupport();
            this.initMouseWheel();
            this.initKeyboard();
        },

        //********************************************************************************************************************
        //                              initialisation functions                                                     *********
        //********************************************************************************************************************
        checkAndParseEvents:function(){
            if(this.settings.pagesEvents){
                this.checkPagesForEvents = true;
                this.parseEvents(this.settings.pagesEvents);
            }
        },
        bindEvents:function(){
            var that = this;
            this.$el.bind('beforeMove', function(event, index, nextIndex) {
                //beforemove takes care of pagination and hash and, if beforeMove event is set, calls beforeMove.
                if (that.settings.pagination === true) {
                    that.updatePagination(nextIndex);
                }

                that.updateBodyClass(nextIndex);
                that.updateHash(nextIndex);
                if (utilities.isFunction(that.settings.beforeMove)) {
                    that.settings.beforeMove(index, nextIndex);
                }
            });

            this.$el.bind('afterMove', function(event, index, nextIndex) {
                if (utilities.isFunction(that.settings.afterMove)) {
                    that.settings.afterMove(index, nextIndex);
                }
            });
        },

        initTransformPage:function(){
            var that = this;
            $.fn.transformPage = function (pos, currentIndex, nextIndex) {
                that.$el.trigger('beforeMove', [currentIndex, nextIndex]);
                if (!Modernizr.csstransitions || !that.settings.useCssTransitions) { //currently needs Modernizr
                    that.$el.animate({top: pos +'%'}, that.settings.animationTime, 'swing', function() {
                        that.$el.trigger('afterMove', [currentIndex, nextIndex]);
                    });
                } else {
                    that.$el.css({
                        "-webkit-transform": "translate3d(0, " + pos + "%, 0)",
                        "-webkit-transition": "all " + that.settings.animationTime + "ms " + that.settings.easing,
                        "-moz-transform": "translate3d(0, " + pos + "%, 0)",
                        "-moz-transition": "all " + that.settings.animationTime + "ms " + that.settings.easing,
                        "-ms-transform": "translate3d(0, " + pos + "%, 0)",
                        "-ms-transition": "all " + that.settings.animationTime + "ms " + that.settings.easing,
                        "transform": "translate3d(0, " + pos + "%, 0)",
                        "transition": "all " + that.settings.animationTime + "ms " + that.settings.easing
                    }).one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function () {
                            that.$el.trigger('afterMove', [currentIndex, nextIndex]);
                        });
                }
            };
        },
        initMovement:function(){
            var that = this;
            $.fn.moveTo = function (nextIndex) {
                var index, current, next, pos;
                index = that.getCurrentIndex();
                if(isNaN(index))
                    index = 1;

                // if index equals nextIndex then no need to do anything !
                if(index === nextIndex) {
                    return;
                }

                if (that.settings.loop === true) {
                    nextIndex = ((nextIndex - 1 + that.total) % that.total) + 1;
                }

                next = that.getSection(nextIndex);

                if (!next.length) {
                    return;
                }

                pos = (1 - nextIndex) * 100;

                current = that.getCurrent();
                current.removeClass("active");
                next.addClass("active");

                that.$el.transformPage(pos, index, nextIndex);
            };

            $.fn.move = function (direction) {
                var index = that.sections.filter(".active").data("index");

                if(direction === 'up') {
                    index = index - 1;
                } else {
                    index = index + 1;
                }

                that.$el.moveTo(index);
            };

            $.fn.moveDown = function () {
                var current = that.getCurrent();
                if(!that.checkPagesForEvents || current.length == 0 || !current.data('OnePageScrollEvents'))
                {
                    that.$el.move('down');
                    return;
                }
                var events = current.data('OnePageScrollEvents');
                var index = current.data('OnePageScrollIndex');
                index = (index < 0)?0:index;
                if(index >= events.length)
                {
                    that.$el.move('down');
                    return;
                }
                that.parseAndExecuteDown(current,events[index]);
                index++;
                current.data('OnePageScrollIndex',index);
            };

            $.fn.moveUp = function () {
                var current = that.getCurrent();
                if(!that.checkPagesForEvents || current.length == 0 || !current.data('OnePageScrollEvents'))
                {
                    that.$el.move('up');
                    return;
                }
                var events = current.data('OnePageScrollEvents');
                var index = current.data('OnePageScrollIndex');
                index--;
                if(index < 0)
                {
                    that.$el.move('up');
                    return;
                }
                that.parseAndExecuteUp(current,events[index]);
                current.data('OnePageScrollIndex',index);
            };
        },
        initSections:function(){
            this.$el.addClass("onepage-wrapper").css("position", "relative");
            var that = this;
            $.each(this.sections, function (i) {
                $(this).css({
                    position: "absolute",
                    top: that.topPos + "%"
                }).addClass("section").attr("data-index", i + 1);
                that.topPos = that.topPos + 100;
                if (that.settings.pagination === true) {
                    paginationText = $(this).data("pagination-text"); //extended
                    if(!paginationText)
                        paginationText = "";
                    that.paginationList += "<li><a data-index='" + (i + 1) + "' href='#" + (i + 1) + "'>"+paginationText+"</a></li>";
                }
            });
        },
        initPagination:function(){
            if (this.settings.pagination === true) {
                $("<ul class='onepage-pagination'>" + this.paginationList + "</ul>").prependTo(this.settings.paginationContainer);
                var posTop = (this.$el.find(".onepage-pagination").height() / 2) * -1;
                this.$el.find(".onepage-pagination").css("margin-top", posTop);
                this.paginationLinks = $('.onepage-pagination li a');

                var that = this;
                this.paginationLinks.click(function (event) {
                    var page_index = $(this).data("index");
                    if (!$(this).hasClass("active")) {
                        that.$el.moveTo(page_index);
                        that.updatePagesEvents(page_index);
                    }
                    if (that.settings.updateURL === false) {
                        event.preventDefault();
                    }
                });
            }
        },
        displayCorrectPage:function(){
            if (window.location.hash !== "" && window.location.hash !== "#1") {
                var init_index = window.location.hash.replace("#", "");
                if(isNaN(init_index))
                    init_index = 1; //this should be enough to prevent XSS attacks when jQuery < 1.8.3 is used

                var next = this.sections.filter("[data-index='" + (init_index) + "']");
                if (next) {
                    this.updateHash(init_index);
                }

                this.$el.moveTo(init_index);
                this.updatePagesEvents(init_index);
            } else {
                this.getSection(1).addClass("active");
                this.updateBodyClass(1);
                if (this.settings.pagination === true) {
                    this.updatePagination(1);
                }
            }
        },
        initTouchSupport:function(){
            if(this.settings.touchEnabled === true) {
                var that = this;
                this.$el.swipeEvents().bind("swipeDown", function () {
                    that.$el.moveUp();
                }).bind("swipeUp", function () {
                        that.$el.moveDown();
                    });
            }
        },
        initMouseWheel:function(){
            if (this.settings.mousewheelEnabled === true) {
                var that = this;
                this.$el.bind('mousewheel DOMMouseScroll', function (event) {

                    if(event.target.tagName === 'SELECT') {
                        return;
                    }

                    event.preventDefault();
                    var delta = event.originalEvent.wheelDelta || -event.originalEvent.detail;
                    that.init_scroll(event, delta);

                });
            }
        },
        initKeyboard:function(){
            if (this.settings.keyboard === true) {
                var that = this;
                $(window.document).keydown(function (e) {
                    var tag = e.target.tagName.toLowerCase();
                    switch (e.which) {
                        case 38:
                            if (tag !== 'input' && tag !== 'textarea') {
                                that.$el.moveUp();
                            }
                            break;
                        case 40:
                            if (tag !== 'input' && tag !== 'textarea') {
                                that.$el.moveDown();
                            }
                            break;
                        default:
                            return;
                    }
                    e.preventDefault();
                });
            }
        },


        //********************************************************************************************************************
        //                              helper functions                                                             *********
        //********************************************************************************************************************

        init_scroll:function(event, delta) {
            var deltaOfInterest = delta;
            var timeNow = new Date().getTime();
            // Cancel scroll if currently animating or within quiet period
            if (timeNow - this.lastAnimation < this.quietPeriod + this.settings.animationTime) {
                event.preventDefault();
                return;
            }

            if (deltaOfInterest < 0) {
                this.$el.moveDown();
            } else {
                this.$el.moveUp();
            }
            this.lastAnimation = timeNow;
        },

        updatePagination:function(index) {
            this.paginationLinks
                .removeClass("active")
                .filter("[data-index='" + index + "']")
                .addClass("active");
        },
        updateBodyClass:function(index) {
            this.bodyElement[0].className = this.bodyElement[0].className.replace(/\bviewing-page-\d.*?\b/g, '');
            this.bodyElement.addClass("viewing-page-" + index);
        },
        updateHash:function(index) {
            if (window.history.replaceState && this.settings.updateURL === true) {
                var href = window.location.href.substr(0, window.location.href.indexOf('#')) + "#" + index;
                window.history.pushState({}, window.document.title, href);
            }
        },
        getCurrentIndex:function() {
            return this.sections.filter(".active").data("index");
        },

        getCurrent:function() {
            return this.sections.filter(".active");
        },

        getSection:function(index) {
            return this.sections.filter("[data-index='" + index + "']");
        },

        parseEvents:function(pagesEvents){
            if(!utilities.isObject(pagesEvents))
            {
                this.checkPagesForEvents = false;
                return;
            }
            var that = this;
            $.each(pagesEvents,function(key,value){
                if(that.$el.find(key).length == 0)
                    return;
                var page = that.$el.find(key);
                if(utilities.isObject(value))
                    that.addObjectToPage(page,value);
                else if(utilities.isArray(value)){
                    $.each(value,function(index,val){
                        that.addObjectToPage(page,val);
                    });
                }
            });
        },
        addObjectToPage:function(page,obj){
            if(!utilities.isObject(obj))
                return;
            obj = $.extend({},pagesEventDefaults,obj);
            var effectsArray = [];
            if(page.data('OnePageScrollEvents'))
                effectsArray = page.data('OnePageScrollEvents');
            effectsArray.push(obj);
            page.data('OnePageScrollEvents',effectsArray);
            page.data('OnePageScrollIndex',-1); //slide to next page and then scroll up, event at position 0 must not execute. That's why -1
        },
        updatePagesEvents:function(index){
            this.executeAllDownTo(index);
            this.executeAllUpTo(index);
        },
        executeAllDownTo:function(index){
            if(!this.checkPagesForEvents || isNaN(index))
                return;
            var that = this;
            for(var i = 1;i<index;i++){
                var section = this.getSection(i);
                var events = section.data('OnePageScrollEvents');
                if(!events)
                    continue;

                var pageIndex = section.data('OnePageScrollIndex');
                pageIndex = (typeof(pageIndex)==undefined || pageIndex<0)?0:pageIndex;

                for(var j=pageIndex;j<events.length;j++)
                {
                    if(!events[j].onlyOnScroll)
                      that.parseAndExecuteDown(section,events[j]);
                    pageIndex++;
                }
                section.data('OnePageScrollIndex',pageIndex);
            }
        },
        executeAllUpTo:function(index){
            if(!this.checkPagesForEvents || isNaN(index))
                return;
            var that = this;
            var sectionIndex = this.total;
            for(var i = sectionIndex;i > index;i--) //we will have to revert all events, even the ones on the current page
            {
                var section = this.getSection(i);
                var events = section.data('OnePageScrollEvents');
                if(!events)
                    continue;

                var pageIndex = section.data('OnePageScrollIndex');
                pageIndex = (typeof(pageIndex)==undefined || pageIndex >= events.length)?(events.length-1):pageIndex;
                if(!events)
                    continue;
                for(var j = pageIndex;j >= 0;j--)
                {
                    if(!events[j].onlyOnScroll)
                        that.parseAndExecuteUp(section,events[j]);
                    pageIndex--;
                }
                section.data('OnePageScrollIndex',pageIndex);
            }
        },
        //*/
        parseAndExecuteDown:function(page,event){
            var target = null;
            if(!event.scrollDown)
                return false;
            if(event.selector){
                if(event.isGlobal)
                    target = this.$el.find(event.selector);
                else
                    target = page.find(event.selector);
            }
            this.parseAndExecute(target,event.scrollDown,page);
            return true;
        },
        parseAndExecuteUp:function(page,event){
            var target = null;
            if(!event.scrollUp)
                return false;
            if(event.selector){
                if(event.isGlobal)
                    target = this.$el.find(event.selector);
                else
                    target = page.find(event.selector);
            }
            this.parseAndExecute(target,event.scrollUp,page);
            return true;
        },
        parseAndExecute:function(element,action,page){
            var context = element;
            var elementFound = true;
            if(!element){
                context = page;
                elementFound = false;
            }
            if(utilities.isString(action)){
                if(!elementFound)
                    return;
                if(utilities.isFunction(context[action]))
                    context[action]();
            }
            else if(utilities.isObject(action))
            {
                if(!elementFound)
                    return;
                if(action.action){
                    var args = [];
                    if(action.args)
                        args = action.args;
                    if(utilities.isFunction(context[action.action]))
                        context[action.action].apply(context,args);
                }
            }
            else if(utilities.isFunction(action))
            {
                action.call(context);
            }
        }

    };

    // A really lightweight plugin wrapper around the constructor,
    // preventing against multiple instantiations
    $.fn[ pluginName ] = function ( options ) {
        return this.each(function() {
            if ( !$.data( this, "plugin_" + pluginName ) ) {
                $.data( this, "plugin_" + pluginName, new Plugin( this, options ));
            }
        });
    };

})( jQuery, window, document );