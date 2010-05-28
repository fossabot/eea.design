$(document).ready(function() {

    function markSelectedButton() {
        var smartTemplate = $.bbq.getState('smartTemplate');
        $('#smart-view-switch .selected').removeClass('selected');
        $('#smart-view-switch li').each(function(e) {
            var templateID = $.trim($(this).text());
            if (templateID == smartTemplate) {
                $(this).addClass('selected');
            }
        });
    }

    function loadContent() {
        $('#smart-view-content').html('<img src="++resource++faceted_images/ajax-loader.gif" />');
        var url = $.param.querystring($.bbq.getState('smartTemplate'), $.param.querystring());
        $.get(url, function(data) {
            $('#smart-view-content').html(data);
            $('.listingBar a').each(function(i) {
                var batchQueryString = $.param.querystring($(this).attr('href'));
                var newUrl = $.param.querystring(location.href, batchQueryString)
                $(this).attr('href', newUrl);
            });
        }, 'html');
    }

    $('#smart-view-switch li').live('click', function(e) {
        var url = $(this).find('.template-id').text();
        $.bbq.pushState({
            'smartTemplate': url
        });
    });

    $(window).bind('hashchange', function(e) {
        // If faceted navigation is enabled, we don't have to make our own
        // AJAX request.
        if (!Faceted.Window.width && ($.bbq.getState('smartTemplate') !== undefined)) {
            markSelectedButton();
            loadContent();
        }
    }).trigger('hashchange');

});
