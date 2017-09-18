/*global $ jQuery window document */
if(window.EEA === undefined){
    var EEA = {
        who: 'eea.miniheader',
        version: '1.0'
    };
}

EEA.MiniHeader = function(context, options){
    var self = this;
    self.$context = $(context);
    self.settings = {
        transition: 'slideToggle',
        transition_for: 500,
        minimize_elem: '.eea-miniheader-element',
        auto_hide: true,
        auto_hide_after: 3000,
        expander_btn_class: 'mini-header-expander'
    };

    if(options){
        jQuery.extend(self.settings, options);
    }

    self.initialize();
};

EEA.MiniHeader.prototype = {
    initialize: function(){
        var self = this;
        self.$el = $(self.settings.minimize_elem);
        self.$btn = $('.' + self.settings.expander_btn_class);

        self.bindEvents();
    },
    bindEvents: function() {
        var self = this;
        self.$btn.click(function(evt){
            evt.preventDefault();
            self.triggerTransition();
        });

        window.setTimeout(function(){
            "use strict";
            self.triggerTransition('eea-miniheader-hide');
        }, self.settings.auto_hide_after);

    },
    triggerTransition: function(ev_name) {
        var self = this;
        var event_name = ev_name || 'eea-miniheader-toggled';
        var count = 0;
        self.$el[self.settings.transition](self.settings.transition_for, function() {
            count += 1;
            if (count === 1) {
                self.$context.trigger(event_name, self);
            }
        });

    }

};

jQuery.fn.EEAMiniHeader = function(options){
    return this.each(function(){
        if (!$.data(this, "EEAMiniHeader")) {
            $.data(this, "EEAMiniHeader",
                new EEA.MiniHeader(this, options));
        }
    });
};

jQuery(document).ready(function(){
    var plugin_settings = window.EEA.EEAMiniHeader_settings;
    var items = jQuery("body");
    items.EEAMiniHeader(plugin_settings);
});
