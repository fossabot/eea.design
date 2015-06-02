/*jslint browser: true,  */ /*global jQuery window */
(function($, window, document, undef) {
    "use strict";
    var notSupportedBrowsers = [
        {browser : 'MSIE', version : 8, os: 'Any' },
        {browser: 'Chrome', version: 12, os: 'Any' },
        {browser: 'Firefox', version: 4, os: 'Any' }
    ];

    function displayMessage(obj) {
        $.get(obj.template, function(data) {
            var trimmed_data = data.trim();
            if (!trimmed_data) {
                return;
            }
            var message_wrap = $(data), outdated_transition, timeout = obj.message_timer || 10000;

            message_wrap.prependTo('body')[obj.transition](1000);
            outdated_transition = function() {
                    message_wrap[obj.transition](1000, function(){
                    window.createCookie(obj.template, obj.cookie_message, obj.cookie_days);
                    });
            };
            if (obj.hover_fade) {
                timeout = window.setTimeout(outdated_transition, timeout);
                message_wrap.hover(function() {
                    window.clearTimeout(timeout);
                }, function() {
                    outdated_transition();
                });
            }
            $(document).trigger('messageDisplayed');
        });
    }

    var BrowserDetection = {
        init: function() {
            var i;
            this.detectBrowser();
            this.detectOS();

            if(this.browser === '' || this.browser === 'Unknown' || this.os === '' ||
            this.os === 'Unknown' || this.browserVersion === '' || this.browserVersion === 0)
            {
                return;
            }

            // Check if this is an outdated browser
            var outdatedBrowser = false;
            for(i = 0; i < notSupportedBrowsers.length; i+= 1){
                if(notSupportedBrowsers[i].os === 'Any' || notSupportedBrowsers[i].os === this.os){
                    if(notSupportedBrowsers[i].browser === 'Any' || notSupportedBrowsers[i].browser === this.browser){
                        if(notSupportedBrowsers[i].version === "Any" || this.browserVersion <= parseFloat(notSupportedBrowsers[i].version)){
                            outdatedBrowser = true;
                            break;
                        }
                    }
                }
            }

            if(outdatedBrowser){
                displayMessage({ template: 'outdated_browsers', cookie_message: 'seen',
                            cookie_days: 2, transition: 'fadeToggle', hover_fade: true});
            }

            window.createCookie('outdated_browsers', 'seen', 2);

        },

        detectBrowser: function() {
            this.browser = '';
            this.browserVersion = 0;
            var userAgent = window.navigator.userAgent;

            if(/MSIE (\d+\.\d+);/.test(userAgent)){
                this.browser = 'MSIE';
            } else if(/Firefox[\/\s](\d+\.\d+)/.test(userAgent)){
                this.browser = 'Firefox';
            } else if(/Chrome[\/\s](\d+\.\d+)/.test(userAgent)){
                this.browser = 'Chrome';
            } else if(/Safari[\/\s](\d+\.\d+)/.test(userAgent)){
                this.browser = 'Safari';
                /Version[\/\s](\d+\.\d+)/.test(userAgent);
                this.browserVersion = Number(RegExp.$1);
            } else if(/Opera[\/\s](\d+\.\d+)/.test(userAgent)){
                this.browser = 'Opera';
            }

            if(this.browser === ''){
                this.browser = 'Unknown';
            } else if(this.browserVersion === 0) {
                this.browserVersion = parseFloat(Number(RegExp.$1));
            }
        },

         // Detect operation system
        detectOS: function() {
            var i, op_length = this.operatingSystems.length, cur_op;
            for(i = 0; i < op_length; i+= 1){
                if(this.operatingSystems[i].searchString.indexOf(this.operatingSystems[i].subStr) !== -1){
                    this.os = this.operatingSystems[i].name;
                    return;
                }
            }
            this.os = "Unknown";
        },

        // Variables
        browser: '',
        os: '',
        browserVersion: '',
        operatingSystems: [
            { 'searchString': navigator.platform, 'name': 'Windows', 'subStr': 'Win' },
            { 'searchString': navigator.platform, 'name': 'Mac', 'subStr': 'Mac' },
            { 'searchString': navigator.platform, 'name': 'Linux', 'subStr': 'Linux' }
        ]
    };

    $(function() {
        if(!window.readCookie('outdated_browsers') || window.readCookie('outdated_browsers') !== 'seen') {
            BrowserDetection.init();
        }
        else {
            $(document).bind('messageDisplayed', function() {
                var $message_wrap = $(".message_wrap");
                $("#repeat_survey").click(function(e) {
                    window.createCookie('survey_message', 'seen', 1);
                    $message_wrap.slideUp(1000);
                    e.preventDefault();
                });

                $("#no_survey").click(function(e) {
                    window.createCookie('survey_message', 'never', 365);
                    $message_wrap.slideUp(1000);
                    e.preventDefault();
                });
                $("#take_survey").click(function(e) {
                    window.createCookie('survey_message', 'seen', 1);
                    $message_wrap.slideUp(1000);
                });
            });
            if(window.readCookie('survey_message') !== 'never') {
                if (window.readCookie('survey_message') !== 'seen') {
                    displayMessage({template: 'survey_message',
                        transition: 'slideToggle' });
                }
            }

        }
    });

}(jQuery, window, document));
