/*jslint browser: true,  */ /*global jQuery, SubCookieUtil */
// @flow
jQuery(document).ready(function($) {
    window.whatsnew = {};
    var eea_gal = window.whatsnew;

    (function() {
        // get the site url from the base-url link
        eea_gal.site_address = (jQuery('body').data('base-url') || jQuery("base").attr("href") || "") + '/';
        eea_gal.gallery = $("#whatsnew-gallery");
        eea_gal.gallery_page = eea_gal.gallery.attr("data-page");
    }());

    eea_gal.gallery_load = function(el, address, params, layout_selection) {

        el.load(address, params, function(html) {
            var album = el.find(".gallery-album");
            var listing = el.find(".gallery-listing");
            var layout = layout_selection || el.parent().find(".gallery-layout-selection li")[0];
            if (html.length > 1) {
                if (layout && layout.className === "list-layout active-list") {
                    el.find('.gallery-album').addClass("hiddenStructure");
                    listing.hide().fadeIn("slow");
                }
                else {
                    el.find('.gallery-listing').addClass("hiddenStructure");
                    album.hide().fadeIn("slow");
                }
            }

        });
    };

    eea_gal.whatsnew_func = function(cur_tab_val, sel_text, sel_value, index) {
        var gallery_macro = this.gallery_page === 'frontpage' ? "whatsnew_gallery_macro" : "datamaps_gallery_macro";
        var address = eea_gal.site_address + gallery_macro;
        eea_gal.current_tab_addr = address;
        var gal = eea_gal.gallery.find(".eea-tabs-panel");
        var news = index ? gal[index] : gal.filter(function() {
            return this.style.display !== "none";
        });
        // workaround: we need the first highlights because when we click on the
        // first tab gal[0] returns the second highlights instead of
        // the first so we redefine news to the first found match if
        // index is 0
        news = index === 0 ? gal.first() : news;
        news = news[0] !== undefined ? news[0] :news;

        var gallery_ajax = $(".gallery-ajax", news);
        var layout_selection = $('.gallery-layout-selection li', news)[0];
        var params = sel_value ? "topic" +  "=" + sel_value : undefined;
        params = params ? params + '&tabname=' + cur_tab_val : 'tabname=' + cur_tab_val;
        eea_gal.gallery_load(gallery_ajax, address, params, layout_selection);
    };
    var $whatsnew_gallery = $("#whatsnew-gallery");
    $whatsnew_gallery.find(".eea-tabs").tabs($whatsnew_gallery.find(".eea-tabs-panel"), function(event, index) {
        var cur_tab = this.getTabs()[index];
        if (!cur_tab) {
            return;
        }
        var cur_tab_val = cur_tab.id.substr(4);
        cur_tab.theme = cur_tab.theme || "";
        var opt_item,
            sel_value,
            sel_text;

        var highlight = $("#" + cur_tab_val + "-highlights");

        var ajax_loader_img = '<div style="text-align: center;"><img src="++resource++faceted_images/ajax-loader.gif" /></div>';

        opt_item = $("#topic-selector").find(":selected");
        if (opt_item.length) {
            sel_value = opt_item.val();
            sel_text = opt_item.text();
        }
        else {
            $(".filter-topic").hide();
        }

        var album = highlight.find(".gallery-album");
        var album_length = album.length !== 0 ? album.children().length : 0;
        var notopics = highlight.find(".portalMessage"),
            notopics_length = notopics.length !== 0 ? 1 : 0;
        if (cur_tab.theme === sel_value && notopics_length !== 0) {
            return;
        }
        // check if highlight doesn't contain a portalMessage since getting results
        // in other languages doesn't introduce gallery-album div and in that case
        // we don't want to reload the gallery macro
        if (sel_text && sel_text.indexOf("All") !== -1 ||
            album_length === 0 && !highlight.find(".portalMessage").length) {
            // #68663 avoid page reload if we have results and the topic
            // selector is hidden such as in the case of dc pages
            if (album_length && cur_tab.theme === sel_value) {
                return;
            }
            album.html(ajax_loader_img);
            cur_tab.theme = sel_value;
            eea_gal.whatsnew_func(cur_tab_val, sel_text, sel_value, index);
        }
        if (sel_value) {
            if (cur_tab.theme !== sel_value) {
                album.html(ajax_loader_img);
                cur_tab.theme = sel_value;
                eea_gal.whatsnew_func(cur_tab_val, sel_text, sel_value, index);
            }
        }
    });


    var $topic_selector = $("#topic-selector");
    $topic_selector.find('[value="default"]').remove();
    $topic_selector.change(
        function displayResult() {
            // hide filter by topic after we choose a topic to filter the
            // results
            $topic_selector[0][0].className = "hiddenStructure";

            var x = this.selectedIndex,
                y = this.options;
            var topic_value = y[x].value,
                topic_text = y[x].innerHTML;
            var $tab = $("#whatsnew-gallery").find(".eea-tabs a.current");
            var $has_tab = $tab.length;
            if ($has_tab) {
                $tab[0].theme = topic_value;
            }
            var tab_val = $has_tab ? $tab[0].id.substr(4) : 'allproducts';

            eea_gal.whatsnew_func(tab_val, topic_text, topic_value);
        });

    // selection of folder_summary_view or atct_album_view
    var layout_links = $(".gallery-layout-selection li");
    layout_links.click(function(e) {
        var $this = $(this);
        var $ajax = $this.closest("ul").next();
        var $hidden_gallery = $ajax.find(".hiddenStructure");
        var listing = $ajax.find('.gallery-listing');
        var album = $ajax.find('.gallery-album');
        var $next = $this.siblings();
        var link_class = $this[0].className;
        var highlight = $this.closest("div")[0].id;
        if (link_class === "list-layout active-list" || link_class === "album-layout active-album") {
            e.preventDefault();
            return;
        }
        var cookie_expires = new Date();
        cookie_expires.setMonth(cookie_expires.getMonth() + 1); // one month

        if (link_class.indexOf("list-layout") !== -1) {
            album.slideUp("slow");
            listing.slideDown("slow");
            $hidden_gallery.removeClass("hiddenStructure");
            $this.toggleClass("active-list");
            $next.toggleClass("active-album");
            SubCookieUtil.set(eea_gal.gallery_page, highlight, "active-list", cookie_expires);
        }
        else {
            listing.slideUp("slow");
            album.slideDown("slow");
            $hidden_gallery.removeClass("hiddenStructure");
            $this.toggleClass("active-album");
            $next.toggleClass("active-list");
            SubCookieUtil.set(eea_gal.gallery_page, highlight, "active-album", cookie_expires);
        }

        e.preventDefault();

    });

    // set layout depending on cookies
    if (eea_gal.gallery.length > 0) {
        var gallery_cookies = SubCookieUtil.getAll(eea_gal.gallery_page);
        if (gallery_cookies !== null) {
            eea_gal.gallery.find('.eea-tabs-panel').each(function() {
                var $this = $(this);
                var layouts = $this.find(".gallery-layout-selection li");
                var $hidden_gallery = $this.find(".hiddenStructure");
                var link_listing = layouts.first();
                var link_album = layouts.last();
                var listing = $this.find(".gallery-listing");
                var album = $this.find(".gallery-album");
                var gallery_cookie = gallery_cookies[this.id];
                if (gallery_cookie !== null) {
                    if (gallery_cookie === "active-album") {
                        listing.hide();
                        album.show();
                        $hidden_gallery.removeClass("hiddenStructure");
                        link_listing.removeClass("active-list");
                        link_album.addClass("active-album");
                    }
                    else if (gallery_cookie === "active-list") {
                        listing.show();
                        album.hide();
                        $hidden_gallery.removeClass("hiddenStructure");
                        link_listing.addClass("active-list");
                        link_album.removeClass("active-album");
                    }
                }
            });
        }
    }
});
