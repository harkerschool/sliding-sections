/* Sliding Sections for The Harker School | Joe Banks */
(function ( $, window, document, undefined ) {

    var pluginName = "slidingSections",
        defaults = {
            cover: false, // fit height of screen
            offset: 0, // offset height
            slidingExclude: '', // exclude panel from sliding
            coverExclude: '', // exclude panel from cover sizing
            duration: 500,
            mousewheelSelector: 'body',
            init: function(){},
            beforeSlide: function(){}
        },
        isAnimating = false,
        $window = $(window);

    // The actual plugin constructor
    function Plugin ( element, options ) {
        this.element = element;
        this.$sections = element;
        this.$active = $();
        this.settings = $.extend( {}, defaults, options );
        this._defaults = defaults;
        this._name = pluginName;
        this.init();
    }

    Plugin.prototype = {
        init: function () {
            var plugin = this;

            plugin.$sections = $(this.element).add('html');

            // go to active section
            var $active = plugin.$sections.filter(location.hash);
            if ( $active.length ) {
                $active.addClass('ss-active');
            } else {
                plugin.$sections.first().addClass('ss-active');
            }

            if ( Modernizr && ! Modernizr.touch ) {
                // resize panels
                if ( plugin.settings.cover ) {
                    plugin.resize();

                    $window.resize( function() {
                        plugin.resize();
                    });
                }

                // mousewheel behavior
                $(plugin.settings.mousewheelSelector).on('mousewheel', function(e) {
                    if ( e.deltaY === 0 ) {
                        return;
                    }

                    if ( isAnimating ) {
                        e.preventDefault();
                        return;
                    }

                    var $active = $('.ss-active'),
                        windowTop = $window.scrollTop(),
                        activeTop = $active.offset().top,
                        windowBottom = windowTop + $window.height(), 
                        activeBottom = activeTop + $active.outerHeight();
                    
                    if ( e.deltaY < 0 ) {
                        if (windowBottom < activeBottom) {
                            return;
                        }
                        e.preventDefault();
                        plugin.slideTo('next');
                    } else if ( e.deltaY > 0 ) {
                        if (windowTop > activeTop) {
                            return;
                        }
                        e.preventDefault();
                        plugin.slideTo('prev');
                    }
                });
            }

            // keyboard behavior
            $(document).on('keydown', function(e) {
                if ( !(e.which === 40 || e.which === 38) ) {
                    return;
                }
                
                e.preventDefault();
                if ( $('html,body').is(':animated') ) {
                    return;   
                }
                
                if ( e.which === 40 ) {
                    plugin.slideTo('next');
                } else if ( e.which === 38 ) {
                    plugin.slideTo('prev');
                }
            });

            // links
            $(document).on('click', 'a', function(e) {
                var anchor = $(this).attr('href');

                if ( undefined === anchor || '#' === anchor || '#top' === anchor ) {
                    e.preventDefault();
                    plugin.slideTo('html');
                }

                var $target = plugin.$sections.filter(anchor);

                if ( $target.length ) {
                    e.preventDefault();
                    plugin.slideTo(anchor);
                }
            });

            // custom code
            plugin.settings.init();
        },

        slideTo: function( target ) {
            var plugin = this,
                $sections = plugin.$sections,
                $active = $('.ss-active'),
                activeIndex = 0,
                targetIndex = 0,
                delay = 600;

            if ( plugin.settings.slidingExclude && ! $active.is(plugin.settings.slidingExclude) ) {
                $active.not(plugin.settings.slidingExclude);
            }
            
            if ( target === 'next' ) {
                if ( plugin.settings.slidingNextExclude && ! $active.is(plugin.settings.slidingNextExclude) ) {
                    $sections = $sections.not(plugin.settings.slidingNextExclude);
                }
                
                activeIndex = $sections.index( $active );
                
                targetIndex = ( activeIndex + 1 < $sections.length ) ? activeIndex + 1 : $sections.length - 1;
                $target = $sections.eq( targetIndex ); // next panel
            } else if ( target === 'prev' ) {
                if ( plugin.settings.slidingPrevExclude && ! $active.is(plugin.settings.slidingPrevExclude) ) {
                    $sections = $sections.not(plugin.settings.slidingPrevExclude);
                }

                activeIndex = $sections.index( $active );
                
                targetIndex = ( activeIndex - 1 >= 0 ) ? activeIndex - 1 : 0;
                $target = $sections.eq( targetIndex ); // previous panel
            } else {
                $target = $sections.filter(target);
                targetIndex = $sections.index( $target );
            }

            if ( ! $target.length ) {
                return;
            }

            // custom code
            plugin.settings.beforeSlide( $target );

            isAnimating = true;
            setTimeout( function() {
                isAnimating = false;
            }, plugin.settings.duration + delay );
            
            // tage active section
            $active.removeClass('ss-active');
            $target.addClass('ss-active');

            // tag active link
            $('.ss-active-link').removeClass('ss-active-link');
            $( 'a[href="#' + $target.attr('id') + '"]' ).addClass('ss-active-link');

            $('html,body').animate({
                scrollTop: $target.offset().top + plugin.settings.offset
            }, plugin.settings.duration, function() {
                if ( $target.attr('id') === undefined ) {
                    location.hash = 'top';
                } else {
                    location.hash = $target.attr('id');
                }
            });
        },

        resize: function() {
            var plugin = this,
                windowHeight = $window.height(),
                newHeight = windowHeight + plugin.settings.offset,
                originalHeight;

            $(plugin.element).not(plugin.settings.coverExclude + ', html').each( function() {
                var $section = $(this);

                // get original height
                $section.height('');
                originalHeight = $section.outerHeight();

                if ( originalHeight < windowHeight ) {
                    $section.height(newHeight);
                } 
            });
            $('html,body').scrollTop( $('.ss-active').offset().top + plugin.settings.offset );
        }
    };

    // A really lightweight plugin wrapper around the constructor,
    // preventing against multiple instantiations
    $.fn[ pluginName ] = function ( options ) {
        if ( !$.data( this, "plugin_" + pluginName ) ) {
            $.data( this, "plugin_" + pluginName, new Plugin( this, options ) );
        }
        return this;
    };

})( jQuery, window, document );