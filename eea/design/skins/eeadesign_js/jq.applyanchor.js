/*global jQuery window anchors document*/

jQuery(document).ready(function($){
    /* Anchors */
    var $body = $("body");
    if (!$body.hasClass('body-print')) {
        anchors.options.visible = 'hover';
        anchors.options.placement = 'right';
        anchors.add('h1, h2, h3, h4');
    }
});
