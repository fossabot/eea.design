/*global $ jQuery window document */
/* This JS integrates the jQuery Tools Tooltips with the EEA site.
 * aka ++resource++plone.app.jquerytools.tooltip.js */
/*
* eg: http://www.eea.europa.eu/code/design-elements#toc-35
* */
jQuery(document).ready(function($) {
    if ($.fn.tooltip !== undefined) {
        // Inflexible tooltips
        $(".eea-tooltip-top").each(function(i) {
            var title = $(this).attr("title");
            $(this).tooltip({
                effect: 'fade',
                tipClass: 'eea-tooltip-markup-top'
            });
        });
        $(".eea-tooltip-bottom").each(function(i) {
            var title = $(this).attr("title");
            $(this).tooltip({
                effect: 'fade',
                position: 'bottom center',
                tipClass: 'eea-tooltip-markup-bottom'
            });
        });
        $(".eea-tooltip-left").each(function(i) {
            var title = $(this).attr("title");
            $(this).tooltip({
                effect: 'fade',
                position: 'center left',
                tipClass: 'eea-tooltip-markup-left'
            });
        });
        $(".eea-tooltip-right").each(function(i) {
            var title = $(this).attr("title");
            $(this).tooltip({
                effect: 'fade',
                position: 'center right',
                tipClass: 'eea-tooltip-markup-right'
            });
        });

        // Flexible tooltips
        //
        var removeExtraText = function() {
            this.getTip()[0].lastChild.nodeValue = '';
        };
        window.eea_flexible_tooltip = function flexible_tooltip(el, position, content_class, offset) {
            "use strict";
            var $el = $(el);
            var pos = position || 'center right';
            var cont_class = content_class || 'tooltip-box-rcontent';
            var coordinates = offset || [20, 20];
            var title = $el.attr("title");
            var container = $('<div>').addClass('eea-tooltip-markup');
            var bottomright = $('<div>').addClass('tooltip-box-br');
            var topleft = $('<div>').addClass('tooltip-box-tl');
            var content = $('<div>').addClass(cont_class);
            content.text(title);

            topleft.append(content);
            bottomright.append(topleft);
            container.append(bottomright);

            $el.tooltip({
                effect: 'fade',
                position: pos,
                offset: coordinates,
                tipClass: 'eea-tooltip-markup',
                layout : container,
                onBeforeShow: removeExtraText
            });

        };

        $(".eea-flexible-tooltip-right").each(function(idx, el) {
            window.eea_flexible_tooltip(el);
        });

        $(".eea-flexible-tooltip-left").each(function(idx, el) {
            window.eea_flexible_tooltip(el, 'center left', 'tooltip-box-lcontent', [20, -10]);
        });

        $(".eea-flexible-tooltip-top").each(function(idx, el) {
            window.eea_flexible_tooltip(el, 'top center', 'tooltip-box-tcontent', [10, 0]);
        });

        $(".eea-flexible-tooltip-bottom").each(function(idx, el) {
            window.eea_flexible_tooltip(el, 'bottom center', 'tooltip-box-bcontent', [30, 0]);
        });

    }
});

