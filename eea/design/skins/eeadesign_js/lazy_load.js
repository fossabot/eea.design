/* jslint:disable */
/*global jQuery, window, document, Faceted */

const elementIsVisibleInViewport = (el, partiallyVisible = true) => {
  const { top, left, bottom, right } = el.getBoundingClientRect();
  return partiallyVisible
    ? ((top > 0 && top < window.innerHeight) || (bottom > 0 && bottom < window.innerHeight)) &&
      ((left > 0 && left < window.innerWidth) || (right > 0 && right < window.innerWidth))
    : top >= 0 && left >= 0 && bottom <= window.innerHeight && right <= window.innerWidth;
};

function enableLazy(element) {
    var source = element.attr('src');
    var classes = element.attr('class') ? element.attr('class') + ' ' : '';
    element.attr('data-src', source);
    element.attr('class', classes + 'lazy');
    element.attr('src', '/www/lazyload_loader.gif');
}



// Faceted Lazy Load
Faceted.Events.LAZY_LOAD = 'FACETED-LAZY-LOAD';
Faceted.LoadLazy = {
    initialize: function () {
        if(jQuery('#faceted-results').length) {
            var loaded_once = false;
            jQuery(Faceted.Events).bind(Faceted.Events.LAZY_LOAD, function(evt, data){
                var children = jQuery('#faceted-results').children();
                if (children.length > 1) {
                    var lazy_elements = children.find('.lazy');

                    jQuery(lazy_elements).each(function(){
                        if (elementIsVisibleInViewport(this) === false) {
                            var element = jQuery(this);
                            var source = element.attr('src');

                            if (source.indexOf('lazyload_loader') === -1) {
                                element.attr('data-src', source);
                                element.attr('src', '/www/lazyload_loader.gif');
                                loaded_once = true;
                            }
                            else {
                                loaded_once = false;
                            }
                        }
                    });

                    if (loaded_once) {
                        jQuery(lazy_elements).lazy({
                            scrollDirection: 'both',
                            effect: 'fadeIn',
                            effectTime: 1000,
                            threshold: 200,
                            combined: true,
                            delay: 5000,
                            visibleOnly: false,
                            onError: function(element) {
                                console.log('error loading ' + element.data('src'));
                            }
                        });
                    }
                }
            });
        }
        else {
            // Clean-up event
            jQuery(Faceted.Events).unbind(Faceted.Events.LAZY_LOAD);
        }
    }
}


jQuery(document).ready(function($) {
    var lazyElements = [];

    $('#content img').each(function(){
        if (elementIsVisibleInViewport(this) === false) {
            enableLazy($(this));
            lazyElements.push($(this));
        }
    });

    $('#portal-column-two img').each(function(){
        if (elementIsVisibleInViewport(this) === false) {
            enableLazy($(this));
            lazyElements.push($(this));
        }
    });

    $('#content iframe').each(function(){
        if (elementIsVisibleInViewport(this) === false) {
            enableLazy($(this));
            lazyElements.push($(this));
        }
    });

    if(jQuery('#faceted-results').length) {
        jQuery('#faceted-results').bind('DOMSubtreeModified',function(event) {
    	   Faceted.LoadLazy.initialize();
        });
    }

    // $('.lazy').lazy({
    //     scrollDirection: 'both',
    //     effect: 'fadeIn',
    //     effectTime: 1000,
    //     threshold: 0,
    //     combined: true,
    //     delay: 2500000,
    //     // delay: 5000,
    //     visibleOnly: false,
    //     onError: function(element) {
    //         console.log('error loading ' + element.data('src'));
    //     }
    // });
    
    var isIe = function detectIE() {
        var ua = window.navigator.userAgent;
        var msie = ua.indexOf('MSIE ');
        if (msie > 0) {
          // IE 10 or older => return true
          return true;
        }

        var trident = ua.indexOf('Trident/');
        if (trident > 0) {
          // IE 11 => return true
          return true;
        }

        var edge = ua.indexOf('Edge/');
        if (edge > 0) {
          // Edge (IE 12+) => return true
          return true;
        }

        // other browser
        return false;
    }

    var forceImageLoad = function (images) {
        $(images).each(function (){
            var image = $(this);
            var image_source = image.attr('data-src');
            image.attr('src', image_source);
            $(this).lazy(
            {
                event: "lazyload",
                effect: "show",
                effectspeed: 0
            }).trigger("lazyload");
        });
        setTimeout(function(){}, 1000);
    }

    // var beforePrintCaller = function () {
    //     if (typeof(window.forceDavizLoad) !== "undefined") {
    //         window.forceDavizLoad();
    //     }
    //     window.forceDavizLoad();
    //     window.forceImageLoad
    // }


    if (isIe()) {
        window.onbeforeprint = forceImageLoad(lazyElements); // Internet Explorer
    }

    $(document).keydown(function(allBrowsers) { // Track printing using Ctrl/Cmd+P.
        if (allBrowsers.keyCode === 80 && (allBrowsers.ctrlKey || allBrowsers.metaKey)) {
            forceImageLoad(lazyElements);
        }
    });

    if (window.matchMedia) { // Track printing from browsers using the Webkit engine
        var mediaQueryList = window.matchMedia('print');
        mediaQueryList.addListener(function(mql) {
            if (mql.matches) {
                forceImageLoad(lazyElements);
            }
        });
    }
});