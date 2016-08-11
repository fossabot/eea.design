(function($) {
    // These regexps are stolen from match_special_links.js
    // http://domain/LL/....
    var langregex1 = new RegExp("(http://[a-z0-9.:]*)/(aa|ab|af|am|ar|as|ay|az|ba|be|bg|bh|bi|bn|bo|bs|br|ca|ch|co|cs|cy|da|de|dz|el|en|eo|es|et|eu|fa|fi|fj|fo|fr|fy|ga|gd|gl|gn|gu|gv|ha|he|hi|hr|hu|hy|ia|id|ie|ik|is|it|iu|ja|jbo|jw|ka|kk|kl|km|kn|ko|ks|ku|kw|ky|la|lb|li|ln|lo|lt|lv|mg|mi|mk|ml|mn|mo|mr|ms|mt|my|na|ne|nl|no|nn|oc|om|or|pa|pl|ps|pt|qu|rm|rn|ro|ru|rw|sa|sd|se|sg|sh|si|sk|sl|sm|sn|so|sq|sr|ss|st|su|sv|sw|ta|te|tg|th|ti|tk|tl|tn|to|tr|ts|tt|tw|ug|uk|ur|uz|vi|vo|wa|wo|xh|yi|yo|za|zh|zu)/.*");
    // http://domain/LL
    var langregex2 = new RegExp("(http://[a-z0-9.:]*/)(aa|ab|af|am|ar|as|ay|az|ba|be|bg|bh|bi|bn|bo|bs|br|ca|ch|co|cs|cy|da|de|dz|el|en|eo|es|et|eu|fa|fi|fj|fo|fr|fy|ga|gd|gl|gn|gu|gv|ha|he|hi|hr|hu|hy|ia|id|ie|ik|is|it|iu|ja|jbo|jw|ka|kk|kl|km|kn|ko|ks|ku|kw|ky|la|lb|li|ln|lo|lt|lv|mg|mi|mk|ml|mn|mo|mr|ms|mt|my|na|ne|nl|no|nn|oc|om|or|pa|pl|ps|pt|qu|rm|rn|ro|ru|rw|sa|sd|se|sg|sh|si|sk|sl|sm|sn|so|sq|sr|ss|st|su|sv|sw|ta|te|tg|th|ti|tk|tl|tn|to|tr|ts|tt|tw|ug|uk|ur|uz|vi|vo|wa|wo|xh|yi|yo|za|zh|zu)$");
    function isCurrentPageTranslated() {
        var link = document.location.href.toLowerCase();
        return langregex1.test(link) || langregex2.test(link);
    }

    $(document).ready(function() {
        var $mini_header = $('body').hasClass('mini-header');
        function panel() {
            var a = $(this);
            var buttonID = a.parent().attr('id');
            if (!buttonID) {
                return;
            }
            var $tooltip = $('#tip-' + buttonID);

            // 'Contact us' link should go to old translated page because the
            // pop up is hardcoded in english. #2954
            if (buttonID === "siteaction-contactus" && isCurrentPageTranslated()) {
                return;
            }
            var article_lang = buttonID === "article-language";
            var networks_panel = buttonID === "externalsites-networks";

            var fordef;
            if ($tooltip.length > 0) {
                // if we don't remove title from links the title will be used for tooltip
                // content instead of the constructed panels
                a.attr("title", "").attr("href", "#");
                fordef = 'click, blur';
                a.tooltip({
                    tip: $tooltip[0],
                    position:'bottom center',
                    offset: [0, 0],
                    delay: 10000000,
                    events: {
                        def: fordef
                    }
                });

                a.click(function(ev) {
                    
                    ev.preventDefault();
                    var $this = $(this), tooltip = $tooltip[0];
                    var $panels = $('.panel');
                    $panels.each(function() {
                        var $this = $(this);
                        var $id = $this.attr('id');
                        if ($id !== "" && $id !== $tooltip.attr('id')) {
                            $this.fadeOut('fast');
                        }
                    });

                    if (article_lang) {
                        $("#tip-article-language").css({
                            position: 'absolute',
                            top: '48px',
                            display: 'block',
                            right: '0px',
                            left: ''
                        });
                    }

                    if (networks_panel) {
                        $("#tip-externalsites-networks").css('margin-left', '2em');
                    }
                    // attempt to position the tooltip bottom right from target on mini_header
                    if ($mini_header) {
                        var pos = $this.offset();
                        var eWidth = $this.outerWidth();
                        var mWidth = $tooltip.outerWidth();
                        var left = window.Math.floor((pos.left + eWidth - mWidth)) + "px";
                        if (tooltip.style.left !== left) {
                            tooltip.style.left = left;
                        }
                    }
                    $tooltip.fadeIn('fast');
                });
            }
        }


        var $panels = $('.panel').filter(function(){ return this.id !== ""; });

        $("#portal-columns, #portal-header").click(function() {
            if ($panels.is(':visible')) {
                $panels.fadeOut('fast');
                $(".eea-navsiteactions-active").removeClass("eea-navsiteactions-active");
            }
        });

        $("#portal-siteactions").addClass('eea-slide-tooltips');
        $("#portal-externalsites").addClass('eea-slide-tooltips');
        $("#article-language").addClass('eea-slide-tooltips');
        $(".externalsites").addClass('eea-slide-tooltips');
        $("#tip-externalsites-networks").addClass('eea-slide-tooltips');
        $(".eea-slide-tooltips").find('a').each(panel);
    });
}(jQuery));
