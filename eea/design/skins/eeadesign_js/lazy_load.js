/* jslint:disable */
/*global jQuery, window, _, document */

jQuery(document).ready(function($) {
    $('#content img').each(function(){
        var source = $(this).attr('src');
        var classes = $(this).attr('class') ? $(this).attr('class') + ' ' : '';
        $(this).attr('data-src', source);
        $(this).attr('class', classes + 'lazy');
        $(this).attr('src', '/www/spinner.gif');
    });

    $('#portal-column-two img').each(function(){
        var source = $(this).attr('src');
        var classes = $(this).attr('class') ? $(this).attr('class') + ' ' : '';
        $(this).attr('data-src', source);
        $(this).attr('class', classes + 'lazy');
        $(this).attr('src', '/www/spinner.gif');
    });

    $('#content iframe').each(function(){
        var source = $(this).attr('src');
        var classes = $(this).attr('class') ? $(this).attr('class') + ' ' : '';
        $(this).attr('data-src', source);
        $(this).attr('class', classes + 'lazy');
        $(this).attr('src', '/www/spinner.gif');
    });

    $('.lazy').lazy({
        scrollDirection: 'both',
        effect: 'fadeIn',
        effectTime: 1000,
        threshold: 0,
        combined: true,
        delay: 5000,
        visibleOnly: false,
        onError: function(element) {
            console.log('error loading ' + element.data('src'));
        }
    });
});