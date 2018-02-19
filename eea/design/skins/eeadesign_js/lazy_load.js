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
                    });

                    if (loaded_once) {
                        jQuery(lazy_elements).parent().css('width', '20%');
                        jQuery(lazy_elements).lazy({
                            scrollDirection: 'both',
                            effect: 'fadeIn',
                            effectTime: 1000,
                            threshold: 100,
                            combined: true,
                            delay: 3000,
                            visibleOnly: true,
                            onError: function(element) {
                                console.log('error loading ' + element.data('src'));
                            }
                        });
                    }
                }
            });
        }
    }
};

function cleanupFacetedLazy() {
    if (Faceted.Events.LAZY_LOAD && jQuery('#faceted-results').length === 0) {
        jQuery(Faceted.Events).unbind(Faceted.Events.LAZY_LOAD);
    }
}

jQuery(document).ready(function($) {
    // Check if the faceted event needs to be cleaned up
    cleanupFacetedLazy();

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

    $('.lazy').lazy({
        scrollDirection: 'both',
        effect: 'fadeIn',
        effectTime: 1000,
        threshold: 100,
        combined: true,
        delay: 3000,
        visibleOnly: false,
        onError: function(element) {
            console.log('error loading ' + element.data('src'));
        }
    });
    
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
    };

    var forceImageLoad = function (images) {
        $(images).each(function (){
            var image = $(this);

            if(!$(this).attr('data-src')) {
                var image_src = $(this).attr('src');
                $(this).attr('data-src', image_src);
            }

            var image_source = image.attr('data-src');
            image.attr('src', image_source);
            // setTimeout(function(){}, 100);
        });
    };

    var forceDavizLoad = function () {
        jQuery.each(jQuery('.embedded-dashboard:visible'), function(idx, elem){
            if ((elem)){
                if (jQuery(elem).hasClass('not_visible')){
                    jQuery(elem).removeClass('not_visible');
                    if (jQuery(elem).hasClass('isChart')){
                        var $elem = jQuery(elem);
                        var vhash = elem.id.split('_')[2];
                        eval('gl_charts[\'googlechart_view_' + vhash + '\'] = window.drawChart(jQuery(elem).data(\'settings\'), jQuery(elem).data(\'other_options\')).chart;');
                    }
                    else{
                        window.drawDashboardEmbed(jQuery(elem).data('settings'));
                    }
                    jQuery(elem).trigger('eea.embed.loaded');
                }
            }
            setTimeout(function(){}, 1000);
        });
    };

    var beforePrintCaller = function (lazyElements) {
        forceDavizLoad();
        forceImageLoad(lazyElements);
    };


    if (isIe()) {
        window.onbeforeprint = beforePrintCaller(lazyElements); // Internet Explorer
    }

    $(document).keydown(function(allBrowsers) { // Track printing using Ctrl/Cmd+P.
        if (allBrowsers.keyCode === 80 && (allBrowsers.ctrlKey || allBrowsers.metaKey)) {
            beforePrintCaller(lazyElements);
        }
    });

    if (window.matchMedia) { // Track printing from browsers using the Webkit engine
        var mediaQueryList = window.matchMedia('print');
        mediaQueryList.addListener(function(mql) {
            if (mql.matches) {
                beforePrintCaller(lazyElements);
            }
        });
    }
});