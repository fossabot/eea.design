/*global jQuery window document */

jQuery(document).ready(function($) {
    // 5267 display form fields for translated items
    var edit_bar = $("#edit-bar");
    var $content = $("#content");

    // 91577 add tinymce on dexterity content types
    function initializeChartTinyMCE(form){
        var textarea = jQuery('.richTextWidget textarea', form);
        var name = textarea.attr('id');

        var action = form.length ? form.attr('action') : '';
        action = action.split('@@')[0] + '@@tinymce-jsonconfiguration';

        jQuery.getJSON(action, {field: name}, function(data){
            data.autoresize = true;
            data.resizing = false;
            function removeSave(buttons){
                return jQuery.map(buttons, function(button){
                    if(button === 'save'){
                        return;
                    }else{
                        return button;
                    }
                });
            }
            data.buttons = removeSave(data.buttons);
            var advanced_buttons = data.theme_advanced_buttons1.split(",");
            advanced_buttons = removeSave(advanced_buttons);
            data.theme_advanced_buttons1 = advanced_buttons.join(",");
            textarea.attr('data-mce-config', JSON.stringify(data));
            window.initTinyMCE(document);
        });
        return true;
    }
    var edit_translate = function() {
        var translating = $content.find('form').find('.hiddenStructure').text().indexOf('Translating');
        if (translating !== -1) {
            edit_bar.closest('#portal-column-content')[0].className = "cell width-full position-0";
        }
    };
    var $widgets_text = $("textarea").filter(function(idx, el) {
        return el.id === "form.widgets.text";
    });
    var add_tinymce = function() {
        if ($widgets_text.length > 0) {
            initializeChartTinyMCE($("#form"));
        }
    };
    if (edit_bar) {
        edit_translate();
        add_tinymce();
    }

    // #20389 - time counter to remind editors save their work
    // Delay can be overriten like this (value in miliseconds): $.timeoutDialog({delay: 900000});

    $(document).ajaxComplete(function(event, xhr, settings) {
        var url = settings.url.split('/');
        var method = url[url.length - 1];
        var reset_methods = ['@@googlechart.googledashboard.edit',
            '@@googlechart.googledashboards.edit',
            '@@googlechart.savepngchart',
            '@@googlechart.setthumb',
            '@@daviz.properties.edit'];
        if (reset_methods.indexOf(method) > -1) {
            $.timeoutDialog.reset();
        }
    });

    try {
        $.timeoutDialog({delay: 900000}); // set to be triggered after 15 minutes
    }
    catch (err) {
        // window.console.log(err);
    }

});
