/* - ++resource++eea.jquery.screentimeanalytics.js - */
// http://localhost:7988/www/portal_javascripts/++resource++eea.jquery.screentimeanalytics.js?original=1
;(function () {
    window.visibly = {
        q: document,
        p: undefined,
        prefixes: ['webkit', 'ms', 'o', 'moz', 'khtml'],
        props: ['VisibilityState', 'visibilitychange', 'Hidden'],
        m: ['focus', 'blur'],
        visibleCallbacks: [],
        hiddenCallbacks: [],
        genericCallbacks: [],
        _callbacks: [],
        cachedPrefix: "",
        fn: null,
        onVisible: function (_callback) {
            if (typeof _callback == 'function') {
                this.visibleCallbacks.push(_callback)
            }
        },
        onHidden: function (_callback) {
            if (typeof _callback == 'function') {
                this.hiddenCallbacks.push(_callback)
            }
        },
        getPrefix: function () {
            if (!this.cachedPrefix) {
                for (var l = 0, b; b = this.prefixes[l++];) {
                    if (b + this.props[2] in this.q) {
                        this.cachedPrefix = b;
                        return this.cachedPrefix
                    }
                }
            }
        },
        visibilityState: function () {
            return this._getProp(0)
        },
        hidden: function () {
            return this._getProp(2)
        },
        visibilitychange: function (fn) {
            if (typeof fn == 'function') {
                this.genericCallbacks.push(fn)
            }
            var n = this.genericCallbacks.length;
            if (n) {
                if (this.cachedPrefix) {
                    while (n--) {
                        this.genericCallbacks[n].call(this, this.visibilityState())
                    }
                } else {
                    while (n--) {
                        this.genericCallbacks[n].call(this, arguments[0])
                    }
                }
            }
        },
        isSupported: function (index) {
            return ((this._getPropName(2)) in this.q)
        },
        _getPropName: function (index) {
            return (this.cachedPrefix == "" ? this.props[index].substring(0, 1).toLowerCase() + this.props[index].substring(1) : this.cachedPrefix + this.props[index])
        },
        _getProp: function (index) {
            return this.q[this._getPropName(index)]
        },
        _execute: function (index) {
            if (index) {
                this._callbacks = (index == 1) ? this.visibleCallbacks : this.hiddenCallbacks;
                var n = this._callbacks.length;
                while (n--) {
                    this._callbacks[n]()
                }
            }
        },
        _visible: function () {
            window.visibly._execute(1);
            window.visibly.visibilitychange.call(window.visibly, 'visible')
        },
        _hidden: function () {
            window.visibly._execute(2);
            window.visibly.visibilitychange.call(window.visibly, 'hidden')
        },
        _nativeSwitch: function () {
            this[this._getProp(2) ? '_hidden' : '_visible']()
        },
        _listen: function () {
            try {
                if (!(this.isSupported())) {
                    if (this.q.addEventListener) {
                        window.addEventListener(this.m[0], this._visible, 1);
                        window.addEventListener(this.m[1], this._hidden, 1)
                    } else {
                        if (this.q.attachEvent) {
                            this.q.attachEvent('onfocusin', this._visible);
                            this.q.attachEvent('onfocusout', this._hidden)
                        }
                    }
                } else {
                    this.q.addEventListener(this._getPropName(1), function () {
                        window.visibly._nativeSwitch.apply(window.visibly, arguments)
                    }, 1)
                }
            } catch (e) {
            }
        },
        init: function () {
            this.getPrefix();
            this._listen()
        }
    };
    this.visibly.init()
})();
(function (glob) {
    function cleanText(text) {
        var fullStopTags = ['li', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'dd'];
        fullStopTags.forEach(function (tag) {
            text = text.replace("</" + tag + ">", ".")
        });
        text = text.replace(/<[^>]+>/g, "") // Strip tags.replace(/[,:;()\/&+]|\-\-/g, " ") // Replace commas,hyphens etc(count them as spaces).replace(/[\.!?]/g, ".") // Unify terminators.replace(/^\s+/, "") // Strip leading whitespace.replace(/[\.]?(\w+)[\.]?(\w+)@(\w+)[\.](\w+)[\.]?/g, "$1$2@$3$4") // strip periods in email addresses(so they remain counted as one word).replace(/[ ]*(\n|\r\n|\r)[ ]*/g, ".") // Replace new lines with periods.replace(/([\.])[\.]+/g, ".") // Check for duplicated terminators.replace(/[ ]*([\.])/g, ". ") // Pad sentence terminators.replace(/\s+/g, " ") // Remove multiple spaces.replace(/\s+$/, ""); // Strip trailing whitespace
        if (text.slice(-1) != '.') {
            text += "."
        }
        return text
    }

    var TextStatistics = function TextStatistics(text) {
        this.text = text ? cleanText(text) : ""
    };
    TextStatistics.prototype.fleschKincaidReadingEase = function (text) {
        text = text ? cleanText(text) : this.text;
        return Math.round((206.835 - (1.015 * this.averageWordsPerSentence(text)) - (84.6 * this.averageSyllablesPerWord(text))) * 10) / 10
    };
    TextStatistics.prototype.fleschKincaidGradeLevel = function (text) {
        text = text ? cleanText(text) : this.text;
        return Math.round(((0.39 * this.averageWordsPerSentence(text)) + (11.8 * this.averageSyllablesPerWord(text)) - 15.59) * 10) / 10
    };
    TextStatistics.prototype.gunningFogScore = function (text) {
        text = text ? cleanText(text) : this.text;
        return Math.round(((this.averageWordsPerSentence(text) + this.percentageWordsWithThreeSyllables(text, false)) * 0.4) * 10) / 10
    };
    TextStatistics.prototype.colemanLiauIndex = function (text) {
        text = text ? cleanText(text) : this.text;
        return Math.round(((5.89 * (this.letterCount(text) / this.wordCount(text))) - (0.3 * (this.sentenceCount(text) / this.wordCount(text))) - 15.8) * 10) / 10
    };
    TextStatistics.prototype.smogIndex = function (text) {
        text = text ? cleanText(text) : this.text;
        return Math.round(1.043 * Math.sqrt((this.wordsWithThreeSyllables(text) * (30 / this.sentenceCount(text))) + 3.1291) * 10) / 10
    };
    TextStatistics.prototype.automatedReadabilityIndex = function (text) {
        text = text ? cleanText(text) : this.text;
        return Math.round(((4.71 * (this.letterCount(text) / this.wordCount(text))) + (0.5 * (this.wordCount(text) / this.sentenceCount(text))) - 21.43) * 10) / 10
    };
    TextStatistics.prototype.textLength = function (text) {
        text = text ? cleanText(text) : this.text;
        return text.length
    };
    TextStatistics.prototype.letterCount = function (text) {
        text = text ? cleanText(text) : this.text;
        text = text.replace(/[^a-z]+/ig, "");
        return text.length
    };
    TextStatistics.prototype.sentenceCount = function (text) {
        text = text ? cleanText(text) : this.text;
        return text.replace(/[^\.!?]/g, '').length || 1
    };
    TextStatistics.prototype.wordCount = function (text) {
        text = text ? cleanText(text) : this.text;
        return text.split(/[^a-z0-9\'@\.\-]+/i).length || 1
    };
    TextStatistics.prototype.averageWordsPerSentence = function (text) {
        text = text ? cleanText(text) : this.text;
        return this.wordCount(text) / this.sentenceCount(text)
    };
    TextStatistics.prototype.averageCharactersPerWord = function (text) {
        var txt = text ? cleanText(text) : this.text;
        return this.letterCount(txt) / this.wordCount(txt)
    };
    TextStatistics.prototype.averageSyllablesPerWord = function (text) {
        text = text ? cleanText(text) : this.text;
        var syllableCount = 0, wordCount = this.wordCount(text), self = this;
        text.split(/\s+/).forEach(function (word) {
            syllableCount += self.syllableCount(word)
        });
        return (syllableCount || 1) / (wordCount || 1)
    };
    TextStatistics.prototype.wordsWithThreeSyllables = function (text, countProperNouns) {
        text = text ? cleanText(text) : this.text;
        var longWordCount = 0, self = this;
        countProperNouns = countProperNouns === false ? false : true;
        text.split(/\s+/).forEach(function (word) {
            if (!word.match(/^[A-Z]/) || countProperNouns) {
                if (self.syllableCount(word) > 2) longWordCount++
            }
        });
        return longWordCount
    };
    TextStatistics.prototype.percentageWordsWithThreeSyllables = function (text, countProperNouns) {
        text = text ? cleanText(text) : this.text;
        return (this.wordsWithThreeSyllables(text, countProperNouns) / this.wordCount(text)) * 100
    };
    TextStatistics.prototype.syllableCount = function (word) {
        var syllableCount = 0, prefixSuffixCount = 0, wordPartCount = 0;
        word = word.toLowerCase().replace(/[^a-z]/g, "");
        var problemWords = {"simile": 3, "forever": 3, "shoreline": 2};
        if (problemWords.hasOwnProperty(word)) return problemWords[word];
        var subSyllables = [/cial/, /tia/, /cius/, /cious/, /giu/, /ion/, /iou/, /sia$/, /[^aeiuoyt]{2,}ed$/, /.ely$/, /[cg]h?e[rsd]?$/, /rved?$/, /[aeiouy][dt]es?$/, /[aeiouy][^aeiouydt]e[rsd]?$/, /^[dr]e[aeiou][^aeiou]+$/, // Sorts out deal, deign etc/[aeiouy]rse$/ // Purse,hearse];var addSyllables=[/ia/,/riet/,/dien/,/iu/,/io/,/ii/,/[aeiouym]bl$/,/[aeiou]{3}/,/^mc/,/ism$/,/([^aeiouy])\1l$/,/[^l]lien/,/^coa[dglx]./,/[^gq]ua[^auieo]/,/dnt$/,/uity$/,/ie(r|st)$/];var prefixSuffix=[/^un/,/^fore/,/ly$/,/less$/,/ful$/,/ers?$/,/ings?$/];prefixSuffix.forEach(function(regex){if(word.match(regex)){word=word.replace(regex,"");prefixSuffixCount++}});wordPartCount=word.split(/[^aeiouy]+/ig).filter(function(wordPart){return!!wordPart.replace(/\s+/ig,"").length}).length;syllableCount=wordPartCount+prefixSuffixCount;subSyllables.forEach(function(syllable){if(word.match(syllable)) syllableCount--});addSyllables.forEach(function(syllable){if(word.match(syllable)) syllableCount++});return syllableCount||1};
            function textStatistics(text) {
                return new TextStatistics(text)
            }
            glob.textstatistics = textStatistics
    }
    )(this);
(function ($, window, document, undefined) {
    "use strict";
    var throttle = window.underscore ? window.underscore.throttle : function (t, e) {
        var n;
        return function () {
            var i, o = this, r = arguments;
            n || (i = function () {
                n = null, t.apply(o, r)
            }, n = window.setTimeout(i, e))
        }
    };
    var capitalize = function capitalize(string) {
        return string.charAt(0).toUpperCase() + string.slice(1)
    };
    $.fn.screentimeAnalytics = function (options) {
        var opts = $.extend({}, $.fn.screentimeAnalytics.defaults, options);
        var looker, content_looker;
        var started;
        var timers = {beginning: 0, content_bottom: 0, page_bottom: 0};
        var counter = {content: 0};
        var content_core = this[0];
        var minReadTime = window.parseInt(Math.round(window.textstatistics(content_core.innerText).wordCount() / opts.avgWPM), 10) * 60;
        var start_obj_metrics = {}, content_obj_metrics = {}, page_obj_metrics = {};
        var reached_content_bottom = opts.metrics['reached_content_bottom'];
        var content_bottom = opts.metrics['content_bottom'];
        var reached_page_bottom = opts.metrics['reached_page_bottom'];
        var page_bottom = opts.metrics['page_bottom'];
        var timer;
        var scroller;
        var endContent;
        var didComplete;
        var ptype;
        var sentPageTrack;
        if (!opts.ptype) {
            ptype = $('body').attr('class').match('portaltype-[a-z-]*');
            var ptype_length;
            if (ptype) {
                ptype = ptype[0].split('-');
                ptype_length = ptype.length;
                ptype = ptype_length === 2 ? capitalize(ptype[1]) : capitalize(ptype[1]) + ' ' + capitalize(ptype[2])
            }
            else {
                ptype = 'Article'
            }
        }
        var incrementTimeSpent = function incrementTimeSpent() {
            $.each(timers, function (key, val) {
                timers[key] = val + 1
            })
        };
        var startTimers = function startTimers() {
            if (!started) {
                incrementTimeSpent();
                started = true
            }
            looker = window.setInterval(function () {
                incrementTimeSpent()
            }, 1000)
        };

        function Viewport() {
            this.top = $window.scrollTop();
            this.height = $window.height();
            this.bottom = this.top + this.height;
            this.width = $window.width()
        }

        function Field(elem) {
            var $elem = $(elem);
            this.top = $elem.offset().top;
            this.height = $elem.height();
            this.bottom = this.top + this.height;
            this.width = $elem.width()
        }

        function onScreen(viewport, field) {
            var cond, buffered, partialView;
            if ((field.bottom <= viewport.bottom) && (field.top >= viewport.top)) {
                return true
            }
            if (field.height > viewport.height) {
                cond = (viewport.bottom - field.top) > (viewport.height / 2) && (field.bottom - viewport.top) > (viewport.height / 2);
                if (cond) {
                    return true
                }
            }
            buffered = (field.height * (opts.percentOnScreen / 100));
            partialView = ((viewport.bottom - buffered) >= field.top && (field.bottom - buffered) > viewport.top);
            return partialView
        }

        function checkViewport() {
            var viewport = new Viewport();
            var field = new Field(content_core);
            if (onScreen(viewport, field)) {
                counter['content'] += 1
            }
        }

        var startContentReading = function startTimers() {
            if (!started) {
                checkViewport();
                started = true
            }
            content_looker = window.setInterval(function () {
                checkViewport()
            }, 1000)
        };
        var stopTimers = function stopTimers() {
            window.clearInterval(looker);
            looker = null
        };
        var stopContentReading = function startTimers() {
            window.clearInterval(content_looker);
            content_looker = null
        };
        var $window = $(window);
        var $document = $(document);
        $window.one("scroll", function () {
            if (!started) {
                startTimers();
                startContentReading()
            }
            if (!opts.debug) {
                ga('send', 'event', 'Reading', '1 Page Loaded', ptype, {'nonInteraction': 1})
            } else {
                window.console.log('The page has loaded.')
            }
            var timeToScroll, totalTime, timeToContentEnd;

            function trackLocation() {
                var scrollTop = $window.scrollTop();
                var bottom = Math.round($window.height() + scrollTop);
                var height = $document.height();
                if (scrollTop > opts.readerLocation && !scroller) {
                    timeToScroll = timers['beginning'];
                    if (!opts.debug) {
                        start_obj_metrics[opts.metrics['started_reading']] = timeToScroll;
                        start_obj_metrics[opts.metrics['start_reading']] = 1;
                        ga('set', start_obj_metrics);
                        ga('send', 'event', 'Reading', '2 Started Content Reading', ptype, timeToScroll)
                    } else {
                        window.console.log('Reached content start in ' + timeToScroll)
                    }
                    scroller = true
                }
                if (window.innerHeight >= (content_core.getBoundingClientRect().bottom + opts.bottomThreshold) && !endContent) {
                    timeToContentEnd = timers['content_bottom'];
                    if (!opts.debug) {
                        if (timeToContentEnd < (minReadTime - opts.readTimeThreshold)) {
                            ga('set', 'dimension1', 'Scanner');
                            ga('send', 'event', 'Reading', '5 Content Scanned', ptype, timeToContentEnd)
                        } else {
                            ga('set', 'dimension1', 'Reader');
                            if (!sentPageTrack) {
                                sentPageTrack = true;
                                ga('send', 'pageview', window.location.pathname)
                            }
                            ga('send', 'event', 'Reading', '6 Content Read', ptype, timeToContentEnd)
                        }
                        if (reached_content_bottom) {
                            ga('set', reached_content_bottom, timeToContentEnd)
                        }
                        if (content_bottom) {
                            ga('set', content_bottom, 1)
                        }
                        ga('send', 'event', 'Reading', '3 Reached Content Bottom', ptype, timeToContentEnd)
                    } else {
                        window.console.log('Reached content section bottom in ' + timeToContentEnd)
                    }
                    endContent = true
                }
                if (bottom >= height - opts.bottomThreshold && !didComplete) {
                    totalTime = timers['page_bottom'];
                    if (!opts.debug) {
                        if (reached_page_bottom) {
                            page_obj_metrics[reached_page_bottom] = totalTime
                        }
                        if (page_bottom) {
                            page_obj_metrics[page_bottom] = 1
                        }
                        ga('set', page_obj_metrics);
                        ga('send', 'event', 'Reading', '4 Reached Page Bottom', ptype, totalTime)
                    } else {
                        window.console.log('Reached page bottom in ' + totalTime)
                    }
                    didComplete = true;
                    stopTimers('onvisible')
                }
            }

            var lazyNavScroll = throttle(function () {
                if (timer) {
                    window.clearTimeout(timer)
                }
                if (!didComplete) {
                    timer = setTimeout(trackLocation, opts.callBackTime)
                }
                else {
                    timer = null
                }
            }, opts.throttleTime);
            $window.scroll(lazyNavScroll)
        });
        if (document.hasFocus && document.hasFocus()) {
            $window.trigger('scroll')
        }
        if (window.visibly) {
            window.visibly.onHidden(function () {
                if (!didComplete) {
                    stopTimers()
                }
                stopContentReading()
            });
            window.visibly.onVisible(function () {
                if (!didComplete) {
                    stopTimers();
                    startTimers()
                }
                stopContentReading();
                startContentReading()
            })
        }
        window.onbeforeunload = function () {
            var content_time = counter['content'];
            ga('send', 'event', 'Reading', '7 Content area time spent', ptype, content_time);
            var timeToread = minReadTime - opts.readTimeThreshold;
            if (content_time > timeToread && endContent) {
                ga('set', 'dimension1', 'Reader');
                ga('send', 'event', 'Reading', '9 Content Area Reader', ptype, content_time)
            } else {
                ga('set', 'dimension1', 'Scanner');
                ga('send', 'event', 'Reading', '8 Content Area Scanner', ptype, content_time)
            }
        }
    };
    $.fn.screentimeAnalytics.defaults = {
        debug: false,
        callBackTime: 100,
        readerLocation: 100,
        throttleTime: 100,
        avgWPM: 228,
        readTimeThreshold: 30,
        bottomThreshold: 50,
        percentOnScreen: 7,
        ptype: null,
        metrics: {
            'started_reading': 'metric1',
            'reached_content_bottom': 'metric2',
            'reached_page_bottom': 'metric3',
            'start_reading': 'metric4',
            'content_bottom': 'metric5',
            'page_bottom': 'metric6'
        }
    }
})(jQuery, window, document);

/* - design.js - */
// http://localhost:7988/www/portal_javascripts/design.js?original=1
jQuery(document).ready(function ($) {
    'use strict';
    var $viewlet_below_content = $("#viewlet-below-content");
    var $content = $("#content");
    var $column_area = $(".column-area");
    var $body = $("body");
    var is_anon = $body.hasClass('userrole-anonymous');
    var $center_bottom_area = $("#center-bottom-area");
    var $related_items = $("#relatedItems");
    var $socialmedia = $("#socialmedia-viewlet");
    $related_items.appendTo($column_area);
    $socialmedia.appendTo($column_area);
    var underscore = window._;
    var appendTo = function (context, target) {
        if (context.length) {
            context.appendTo(target)
        }
    };
    appendTo($related_items, $column_area);
    appendTo($socialmedia, $column_area);
    if ($column_area.length) {
        appendTo($viewlet_below_content, $column_area)
    }
    else {
        appendTo($viewlet_below_content, $content)
    }
    appendTo($related_items, $center_bottom_area);
    appendTo($socialmedia, $center_bottom_area);
    var hide_empty_container = function ($el, child_count, $checked_el) {
        var count = child_count || 0;
        var $elem = $checked_el || $el;
        var $children = $elem.children();
        if ($children.length <= count) {
            $el.hide()
        }
    };
    hide_empty_container($("#plone-document-byline"), 1);
    hide_empty_container($viewlet_below_content, 0);
    var $whatsnew_listing = $(".whatsnew-listing");
    var $body_content = $(".body-content");
    hide_empty_container($whatsnew_listing, 0, $whatsnew_listing.find('.eea-tabs-panels'));
    hide_empty_container($body_content, 1, $body_content.find('p'));
    var url_path_name = window.location.pathname;
    var $code_diff = $("#diffstylecode");
    if ($body.hasClass("portaltype-sparql") && $code_diff) {
        $code_diff.click()
    }
    var $popup_login = $("#popup_login_form").click(function (e) {
        e.stopPropagation()
    });
    var $mini_header = $(".mini-header");
    if ($mini_header.length) {
        (function () {
            var $portal_header = $("#portal-header");
            var $cross_site_top = $("#cross-site-top");
            var $ptools = $("#portal-personaltools-wrapper");
            var $search = $("#portal-searchbox");
            var $parent = $("#secondary-globanav-tips");
            $body.on('eea-miniheader-toggled', function () {
                $(".eea-nav-current").toggleClass('eea-nav-inactive')
            });
            var make_siteaction_panel = function ($content, $parent, panel_id, use_only_children) {
                var $panel = $("<div class='panel' id='" + panel_id + "'>" + "<div class='panel-top'></div>" + "<div class='panel-content shadow'>" + "</div>");
                var $clone = $content.clone();
                if (use_only_children) {
                    $clone = $clone.children()
                }
                $clone.appendTo($panel.find('.panel-content'));
                $panel.appendTo($parent)
            };
            make_siteaction_panel($search, $parent, 'tip-siteaction-search-menu');
            make_siteaction_panel($popup_login, $parent, 'tip-siteaction-login-menu', true);
            make_siteaction_panel($("#portal-personaltools"), $parent, 'tip-siteaction-user-menu', true);
            $portal_header.addClass("eea-miniheader-element");
            $ptools.addClass("eea-miniheader-element");
            $("#portaltab-europe").css('display', 'none');
            $("#secondary-portaltabs").find('> li > a').click(function (ev) {
                $('.eea-navsiteactions-active').removeClass('eea-navsiteactions-active');
                $(ev.target).closest('li').addClass('eea-navsiteactions-active');
                ev.preventDefault()
            });
            $body.on('eea-miniheader-hide', function () {
                $cross_site_top.hide();
                $(".portal-logo").hide();
                $search.hide();
                $ptools.hide();
                if (!$portal_header.find('.networkSites').length) {
                    $(".networkSites").eq(0).clone().prependTo($portal_header)
                }
            });
            $("#siteaction-networks-menu").find("a").addClass("mini-header-expander")
        }())
    }
    var air_fiches = $(".portaltype-fiche.section-airs");
    if (air_fiches.length) {
        (function () {
            var $fiche_body = $(".fiche-body");
            var $table = $fiche_body.find('table').eq(0);
            var $fiche_summary = $(".fiche-summary");
            if (!$body.hasClass('section-airs subsection-2016')) {
                if (!$fiche_summary.find('.keyFact').find('div').text().trim()) {
                    $fiche_summary.addClass('hidden')
                }
                return
            }
            if ($table.length) {
                $table.insertBefore($fiche_summary)
            }
        }())
    }
    var collection_air_fiches = $(".template-collection-pdf-body.section-airs");
    if (collection_air_fiches.length) {
        (function () {
            var $fiche_bodies = $(".fiche-body");
            $fiche_bodies.each(function (idx, el) {
                var $el = $(el);
                var $table = $el.find('table').eq(0);
                var $fiche_summary = $el.find(".fiche-summary");
                if ($table.length) {
                    $table.insertBefore($fiche_summary)
                }
            })
        }())
    }
    var $charts_buttons = $(".google_buttons_bar").find('a');
    var $document_actions = $(".documentExportActions");
    var $document_actions_ul = $document_actions.find('ul');
    if ($document_actions_ul.length) {
        $charts_buttons.each(function (idx, el) {
            var $el = $(el);
            var $wrapped = $el.addClass('pull-left').wrap('<li />').parent();
            $wrapped.prependTo($document_actions_ul)
        })
    }
    $("[for=__ac_name]").click(function (evt) {
        evt.preventDefault();
        var input = $(this).parent().find("#__ac_name");
        input.focus()
    });
    $("[for=__ac_password]").click(function (evt) {
        evt.preventDefault();
        var input = $(this).parent().find("#__ac_password");
        input.focus()
    });
    $body.click(function () {
        $('#popup_login_form').slideUp()
    });
    $(".policy_question").each(function (idx, el) {
        var $el = $(el);
        var $next_el = $el.next();
        if ($next_el.hasClass('indicator-figure-plus-container')) {
            $el.addClass("page-break-before");
            $next_el.find('.figure-title').addClass('no-page-break-before')
        }
    });
    var $video_iframe = $("iframe").filter('[src*="video"]'), $video_iframe_src;
    if ($video_iframe) {
        $video_iframe_src = $video_iframe.attr('src');
        $("<a />", {
            'class': 'video_iframe_for_print visible-print',
            href: $video_iframe_src,
            html: "Video link: [" + $video_iframe_src + "]"
        }).insertBefore($video_iframe)
    }
    $('.eea-tabs').find('li:last-child').addClass('last-child');
    $("#anon-personalbar, #siteaction-login").click(function (e) {
        $popup_login.slideToggle("slow", function () {
            $('#__ac_name').focus()
        });
        e.preventDefault();
        e.stopPropagation()
    });
    var $navigation_submenus = $(".portletSubMenuHeader");
    if ($navigation_submenus && $navigation_submenus.length < 2) {
        $navigation_submenus.hide()
    }
    $('.js-adoptHeight').each(function () {
        var $el = $(arguments[1]);
        var $target_el = $($el.data('target-element'));
        $el.css('height', $target_el.outerHeight())
    });
    $(".attention, .caution, .danger, .error, .hint, .important, .note, .tip, .warning").addClass('eea-icon');
    $(document).ajaxComplete(function (event, xhr, settings) {
        var url = settings.url.split('/');
        var method = url[url.length - 1];
        var reset_methods = ['@@googlechart.googledashboard.edit', '@@googlechart.googledashboards.edit', '@@googlechart.savepngchart', '@@googlechart.setthumb', '@@daviz.properties.edit'];
        if (reset_methods.indexOf(method) > -1) {
            $.timeoutDialog.reset()
        }
    });
    try {
        $.timeoutDialog({delay: 900000})
    }
    catch (err) {
    }
    $(".required:contains('■')").addClass('no-bg');
    if ($("#portlet-prefs").length) {
        $("#portal-column-two").remove();
        $("#portal-column-content").removeClass('width-3:4').addClass('width-full')
    }
    var r = /data-and-maps\/(figures|data)\/?$/;
    if (r.test(url_path_name)) {
        $body.addClass('fullscreen');
        $('#icon-full_screen').parent().remove()
    }
    var edit_bar = $("#edit-bar");
    var edit_translate = function () {
        var translating = $content.find('form').find('.hiddenStructure').text().indexOf('Translating');
        if (translating !== -1) {
            edit_bar.closest('#portal-column-content')[0].className = "cell width-full position-0"
        }
    };
    if (edit_bar) {
        edit_translate()
    }
    var $auto_related = $("#auto-related"), $prev = $auto_related.prev(), $dls = $auto_related.find('dl');
    if ($dls.length) {
        $auto_related.detach();
        $dls.each(function (idx, item) {
            var $item = $(item), $dt = $item.find('dt');
            $item.find('.portletItem').each(function (idx, item) {
                if (item.className.indexOf('embedded') === -1) {
                    $(item).insertAfter($dt)
                }
            })
        });
        $auto_related.insertAfter($prev)
    }
    function themePromotionPortlets(top_news) {
        var top_news_width = top_news.width();
        var margin = top_news_width * 0.012, w = Math.floor((top_news_width - 5 * margin) / 5);
        var promotions = top_news.find('.portlet-promotions');
        promotions.width(w);
        var last = promotions.last();
        promotions.not(last).css('marginRight', (Math.floor(margin) + 3) + 'px');
        last.css({'marginRight': '0px'})
    }

    var top_news = $('#top-news-area');
    if (top_news.length) {
        themePromotionPortlets(top_news)
    }
    jQuery.fn.avoidMultipleClicks = function (options) {
        var settings = {timeout: 3000, linkSelector: 'a', linkCSS: 'downloading', lockCSS: 'downloading-lock'};
        if (options) {
            jQuery.extend(settings, options)
        }
        var self = this;
        return this.each(function () {
            self.find(settings.linkSelector).click(function () {
                var context = $(this);
                var oldCSS = context.attr('class');
                settings.linkCSS = oldCSS.split(' ').slice(0, 2).join(' ') + settings.linkCSS;
                context.removeClass();
                context.addClass(settings.linkCSS);
                self.addClass(settings.lockCSS);
                setTimeout(function () {
                    self.removeClass(settings.lockCSS);
                    context.removeClass(settings.linkCSS);
                    context.addClass(oldCSS)
                }, settings.timeout)
            })
        })
    };
    $('.documentActions .action-items').avoidMultipleClicks();
    $document_actions.avoidMultipleClicks({
        linkSelector: '.eea-icon',
        linkCSS: ' eea-icon-download eea-icon-anim-burst animated'
    });
    var file_types = ['pdf', 'gif', 'tif', 'png', 'zip', 'xls', 'eps', 'csv', 'tsv', 'exhibit', 'txt', 'doc', 'docx', 'xlsx', 'table'];

    function check_file_type(tokens) {
        var tokens_length = tokens.length;
        var rought_ext = tokens[tokens_length - 1];
        var guess = rought_ext.split('/')[0];
        return file_types.indexOf(guess) === -1 ? 'file' : guess
    }

    function extract_file_type(url, txt_contents) {
        var url_tokens = url.split('.');
        var txt_tokens = txt_contents.trim().toLowerCase().split('.');
        var txt_tokes_outcome = check_file_type(txt_tokens);
        if (txt_tokes_outcome === 'file') {
            return check_file_type(url_tokens)
        }
        return txt_tokes_outcome
    }

    var links = document.getElementsByTagName('a');

    function match_download_links(links) {
        var list = [];
        var links_length = links.length;
        var link, link_href;
        for (var i = 0; i < links_length; i++) {
            link = links[i];
            link_href = link.href;
            if (!link_href.match('eea.europa')) {
                continue
            }
            if (link_href.match("/download[.a-zA-Z]*") || link_href.match("at_download") || link_href.match("/download$") || link_href.match("ftp.eea.europa")) {
                list.push(link)
            }
        }
        return list
    }

    var downloads_list = match_download_links(links);

    function add_downloads_tracking_code(idx, el) {
        el.onclick = function () {
            var text = el.textContent || el.innerText;
            var ftype = extract_file_type(el.href, text);
            var link = el.href;
            if (ga) {
                ga('send', 'event', 'Downloads', link, ftype)
            }
        };
        return el
    }

    $.each(downloads_list, add_downloads_tracking_code);
    if (window.readCookie && !window.readCookie('survey_message')) {
        window.createCookie('survey_message', 'never', 365)
    }
    var $right_section_container = $(".eea-right-section");
    if ($right_section_container.length) {
        (function insert_section() {
            $right_section_container.each(function (idx, el) {
                var $el = $(el), $right_section_slider = $el.prev();
                if (!$right_section_slider.hasClass('eea-right-section-slider')) {
                    $right_section_slider = $('<div class="eea-section eea-right-section-slider eea-scrolling-toggle-visibility"><span class="eea-icon eea-icon-5x eea-icon-caret-left eea-icon-anim-horizontal animated"></span></div>');
                    $right_section_slider.insertBefore($el)
                }
                $right_section_slider.click(function () {
                    var $this = $(this);
                    $this.toggleClass("eea-right-section-slider-active").next().toggleClass("eea-right-section-active eea-scrolling-keep-visible");
                    $this.removeClass("is-eea-hidden");
                    if ($this.hasClass("eea-right-section-slider-active")) {
                        document.body.style.overflow = 'hidden';
                        document.body.style.position = 'fixed'
                    }
                    else {
                        if (document.body.style.overflow === "hidden") {
                            document.body.style.overflow = 'auto';
                            document.body.style.position = 'relative'
                        }
                    }
                })
            })
        })()
    }
    if ($('#eea-above-columns').find('#portal-breadcrumbs').length) {
        $('#header-holder').find('.navbar').addClass('hideShadow')
    }
    var scroll_analytics_enabled = $body.hasClass("scroll-analytics");
    if (is_anon) {
        (function () {
            var runOnce;
            var afterPrint = function () {
                if (!runOnce) {
                    runOnce = true;
                    if (window.ga) {
                        window.ga('send', 'event', 'Print Action', window.location.host, window.location.href)
                    }
                }
            };
            window.onafterprint = afterPrint;
            $(document).keydown(function (allBrowsers) {
                if (allBrowsers.keyCode === 80 && (allBrowsers.ctrlKey || allBrowsers.metaKey)) {
                    afterPrint()
                }
            });
            if (window.matchMedia) {
                var mediaQueryList = window.matchMedia('print');
                mediaQueryList.addListener(function (mql) {
                    if (mql.matches) {
                        afterPrint()
                    }
                })
            }
        }())
    }
    if (scroll_analytics_enabled) {
        $("#content-core").screentimeAnalytics()
    }
});

/* - eea-miniheader.js - */
if (window.EEA === undefined) {
    var EEA = {
        who: 'eea.miniheader',
        version: '1.0'
    };
}

EEA.MiniHeader = function (context, options) {
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

    if (options) {
        jQuery.extend(self.settings, options);
    }

    self.initialize();
};

EEA.MiniHeader.prototype = {
    initialize: function () {
        var self = this;
        self.$el = $(self.settings.minimize_elem);
        self.$btn = $('.' + self.settings.expander_btn_class);

        self.bindEvents();
    },
    bindEvents: function () {
        var self = this;
        self.$btn.click(function (evt) {
            evt.preventDefault();
            self.triggerTransition();
        });

        window.setTimeout(function () {
            "use strict";
            self.triggerTransition('eea-miniheader-hide');
        }, self.settings.auto_hide_after);

    },
    triggerTransition: function (ev_name) {
        var self = this;
        var event_name = ev_name || 'eea-miniheader-toggled';
        var count = 0;
        self.$el[self.settings.transition](self.settings.transition_for, function () {
            count += 1;
            if (count === 1) {
                self.$context.trigger(event_name, self);
            }
        });

    }

};

jQuery.fn.EEAMiniHeader = function (options) {
    return this.each(function () {
        if (!$.data(this, "EEAMiniHeader")) {
            $.data(this, "EEAMiniHeader",
                new EEA.MiniHeader(this, options));
        }
    });
};

jQuery(document).ready(function () {
    var plugin_settings = window.EEA.EEAMiniHeader_settings;
    var items = jQuery("body");
    items.EEAMiniHeader(plugin_settings);
});


/* - eea-accordion.js - */
// http://localhost:7988/www/portal_javascripts/eea-accordion.js?original=1
jQuery(document).ready(function ($) {
    var portlet = jQuery('.portletNavigationTree');
    if (portlet.length) {
        var tabs = jQuery('.portletItem', portlet);
        var index = 0;
        tabs.each(function (idx, obj) {
            var here = jQuery(this);
            if (jQuery('.navTreeCurrentNode', here).length > 0) {
                index = idx;
                return false
            }
        });
        portlet.tabs(".portletNavigationTree .portletItem", {
            tabs: ".portletSubMenuHeader",
            effect: "slide",
            initialIndex: index
        });
        portlet.delegate('.current, .collapsed', 'click', function () {
            var tabs = portlet.data('tabs');
            var $this = $(this);
            if (index === tabs.getIndex()) {
                if (tabs.getCurrentTab().hasClass('current')) {
                    tabs.getCurrentPane().dequeue().stop().slideUp(function () {
                        portlet.trigger('eea.accordion.navigation.hidden', this)
                    });
                    tabs.getCurrentTab().removeClass('current').addClass('collapsed')
                }
                else {
                    $this.addClass('current').removeClass('collapsed').next().slideDown(function () {
                        portlet.trigger('eea.accordion.navigation.visible', this)
                    })
                }
            }
            index = tabs.getIndex()
        });
        var $content = $("#content");
        portlet.on('eea.accordion.navigation.visible', function (el) {
            equalize_columns()
        });
        var $right_column_area = $(".right-column-area");
        var equalize_columns = function () {
            if ($right_column_area.length) {
                if ($content.height() < $right_column_area.height()) {
                    $content.css('height', $right_column_area.height())
                }
            }
        };
        equalize_columns()
    }
    $.tools.tabs.addEffect("collapsed", function (i, done) {
    });
    var eea_accordion = function ($folder_panels) {
        if (!$folder_panels) {
            $folder_panels = $('.eea-accordion-panels')
        }
        if ($folder_panels.length) {
            $folder_panels.each(function (idx, el) {
                var $el = $(el);
                if ($el.hasClass("eea-accordion-initialized")) {
                    return
                }
                var effect = 'slide';
                var current_class = "current";
                var initial_index = 0;
                var initial_indexes = [];
                var $pane = $el.find('.pane');
                $el.find('.eea-accordion-title, .eea-accordion-title-manual-icons, h2').each(function (idx) {
                    var $title = $(this);
                    if ($title.hasClass('current')) {
                        $title.removeClass('current');
                        initial_index = idx;
                        initial_indexes.push(idx);
                        $el.removeClass('collapsed-by-default')
                    }
                });
                if ($el.hasClass('collapsed-by-default')) {
                    effect = 'slide';
                    initial_index = null;
                    $pane.hide()
                }
                if ($el.hasClass('non-exclusive')) {
                    if (!$el.hasClass('collapsed-by-default')) {
                        $pane.not(':nth-child(' + (initial_index + 1) + ')').hide();
                        $pane.eq(initial_index).prev().addClass('current')
                    }
                    effect = 'collapsed';
                    current_class = "default";
                    $el.find('.eea-accordion-title, .eea-accordion-title-manual-icons, h2').click(function (ev) {
                        var $el = $(this);
                        if (!$el.hasClass('current')) {
                            $el.addClass('current').next().slideDown()
                        }
                        else {
                            $el.removeClass('current').next().slideUp()
                        }
                    })
                }
                $el.tabs($pane, {
                    tabs: $pane.prev(),
                    effect: effect,
                    initialIndex: initial_index,
                    current: current_class,
                    onBeforeClick: function (ev, idx) {
                        $(ev.target).trigger("onBeforeClick", {event: ev, index: idx})
                    },
                    onClick: function (ev, idx) {
                        $(ev.target).trigger("eea-accordion-on-click", {event: ev, index: idx})
                    }
                });
                if (initial_indexes.length && $el.hasClass('non-exclusive')) {
                    $el.find('.eea-accordion-title, .eea-accordion-title-manual-icons, h2').each(function (idx) {
                        var $title = $(this);
                        if ($title.hasClass('current')) {
                            return
                        }
                        if (initial_indexes.indexOf(idx) === -1) {
                            return
                        }
                        $title.click()
                    })
                }
                $el.addClass("eea-accordion-initialized")
            })
        }
    };
    eea_accordion();
    window.EEA = window.EEA || {};
    window.EEA.eea_accordion = eea_accordion
});

/* - eea-autoscroll.js - */
// http://localhost:7988/www/portal_javascripts/eea-autoscroll.js?original=1
jQuery(document).ready(function ($) {
    if ($('.autoscroll-to-here').length) {
        var top = $('.autoscroll-to-here').offset().top;
        $('html,body').animate({scrollTop: top}, 1000)
    }
});

/* - eea-fancybox.js - */
// http://localhost:7988/www/portal_javascripts/eea-fancybox.js?original=1
jQuery(document).ready(function ($) {
    if ($.fn.fancybox !== undefined) {
        $('.fancybox').fancybox();
        $('.gallery-fancybox').each(function () {
            var href = $(this).attr('href') + "/gallery_fancybox_view";
            $(this).attr('href', href);
            $(this).fancybox({
                type: 'iframe',
                padding: 0,
                margin: 0,
                width: 650,
                height: 500,
                scrolling: 'no',
                autoScale: false,
                autoDimensions: false
            })
        })
    }
});

/* - eea-fitcontainer.js - */
// http://localhost:7988/www/portal_javascripts/eea-fitcontainer.js?original=1
(function ($) {
    $.fn.fitContainer = function ($container, options) {
        this.$container = $container;
        var settings = $.extend({
            'method': 'grow',
            'incrementBy': 5,
            'affectSingleWords': false,
            'maxWidth': 250
        }, options), self = this;
        return this.each(function () {
            if (!settings.affectSingleWords && this.innerHTML.split(/\s/).length === 1) {
                return
            }
            var $this = $(this), $container = self.$container || $this.parent(),
                initial_container_height = $container.height(), initial_width = $this.width();
            switch (settings.method) {
                case 'grow':
                    while (initial_container_height < $this.height()) {
                        initial_width += settings.incrementBy;
                        $this.css('max-width', initial_width);
                        if (this.offsetWidth > settings.maxWidth || initial_width > settings.maxWidth) {
                            break
                        }
                    }
                    break;
                case 'shrink':
                    while (initial_container_height < $this.height()) {
                        initial_width -= settings.incrementBy;
                        $this.css('max-width', initial_width);
                        if (this.offsetWidth > settings.maxWidth || initial_width > settings.maxWidth) {
                            break
                        }
                    }
                    break
            }
        })
    };
    $(function () {
        var $eea_tabs = $('.eea-tabs');
        if ($eea_tabs.length) {
            $eea_tabs.find('a').fitContainer($eea_tabs)
        }
    })
}(jQuery));

/* - eea-galleryview.js - */
// http://localhost:7988/www/portal_javascripts/eea-galleryview.js?original=1
(function ($) {
    $(document).ready(function () {
        if ($.fn.galleryView !== undefined) {
            $.fn.eeaGalleryView = function (opts) {
                return this.each(function () {
                    if ($.data(this, 'visited')) {
                        return
                    }
                    var $this = $(this);
                    var $gallery_parent = $this.parent(), $gallery_class = $gallery_parent[0].className, parent_width,
                        parent_height, gallery_width, gallery_height;
                    parent_width = $gallery_parent.width() - 10;
                    parent_height = Math.round((parent_width / 4) * 3);
                    gallery_width = $gallery_class === 'gallery_fancybox_view' ? 640 : parent_width;
                    gallery_height = $gallery_class === 'gallery_fancybox_view' ? 433 : parent_height;
                    var defaults = {
                        panel_width: gallery_width,
                        panel_height: gallery_height,
                        frame_width: 50,
                        frame_height: 50,
                        transition_speed: 350,
                        transition_interval: 10000
                    };
                    var options = $.extend(defaults, opts);
                    $this.galleryView(options);
                    $.data(this, 'visited', 'true')
                })
            };
            $("#galleryView, .galleryView").eeaGalleryView()
        }
    })
}(jQuery));

/* - eea-icons.js - */
// http://localhost:7988/www/portal_javascripts/eea-icons.js?original=1
jQuery(document).ready(function ($) {
    $(".eea-icon-left-container").each(function (i, el) {
        var $el = $(el);
        if ($el.find(".eea-icon-left").length) {
            return
        }
        var $i_tag = $("<span class='eea-icon eea-icon-left'></span>");
        $el.prepend($i_tag)
    });
    $(".eea-icon-right-container").each(function (i, el) {
        var $el = $(el);
        if ($el.find(".eea-icon-right").length) {
            return
        }
        var $i_tag = $("<span class='eea-icon eea-icon-right'></span>");
        $el.append($i_tag)
    })
});

/* - eea-tabs.js - */
// http://localhost:7988/www/portal_javascripts/eea-tabs.js?original=1
jQuery(document).ready(function ($) {
    $(window).bind('eea.tags.loaded', function (evt, tab) {
        var $tab = $(tab);
        $tab.find('a').bind('click', function (ev) {
            window.location.hash = this.id
        })
    });
    var eea_tabs = function () {
        var $eea_tabs = $(".eea-tabs"), eea_tabs_length = $eea_tabs.length, $eea_tabs_panels = $(".eea-tabs-panels"),
            i = 0;
        var $eea_tab, $eea_tab_parent, $eea_tabs_panel, $eea_panels, $eea_tab_children;
        if (eea_tabs_length) {
            for (i; i < eea_tabs_length; i += 1) {
                $eea_tab = $eea_tabs.eq(i);
                $eea_tab_parent = $eea_tab.parent();
                if ($eea_tab_parent.attr('id') === 'whatsnew-gallery') {
                    continue
                }
                if ($eea_tab.data('tabs')) {
                    $(window).trigger('eea.tags.loaded', $eea_tab);
                    continue
                }
                $eea_tab.hide();
                $eea_tabs_panel = $eea_tabs_panels.eq(i);
                if (!$eea_tabs_panel.length) {
                    $eea_tabs_panel = $eea_tabs_panels.eq(i - 1)
                }
                $eea_panels = $eea_tabs_panel.children();
                $eea_panels.find('.eea-tabs-title').detach().appendTo($eea_tab);
                $eea_tab_children = $eea_tab.children();
                var j = 0, tabs_length = $eea_tab_children.length, $tab_title, tab_title_text, tab_title_id, tab_id;
                for (j; j < tabs_length; j += 1) {
                    $tab_title = $($eea_tab_children[j]);
                    if ($tab_title[0].tagName === "P") {
                        $tab_title.replaceWith("<li>" + $tab_title.html() + "</li>")
                    }
                    if (!$tab_title.find('a').length) {
                        tab_title_text = $tab_title.text();
                        tab_title_id = tab_title_text.toLowerCase().replace(/\s/g, '-');
                        $tab_title.text("");
                        if ($('#tab-' + tab_title_id).length) {
                            tab_id = 'tab-' + tab_title_id + '-' + 1
                        }
                        else {
                            tab_id = 'tab-' + tab_title_id
                        }
                        $('<a />').attr({
                            'href': '#tab-' + tab_title_id,
                            'id': tab_id
                        }).html(tab_title_text).appendTo($tab_title)
                    }
                }
                $eea_tab_children = $eea_tab.children();
                if ($eea_tab.hasClass('eea-tabs-ajax')) {
                    $eea_tab.tabs($eea_panels, {effect: 'ajax', history: true})
                }
                else {
                    $eea_tab.tabs($eea_panels)
                }
                $eea_tab.show();
                $(window).trigger('eea.tags.loaded', $eea_tab)
            }
        }
    };
    window.EEA = window.EEA || {};
    window.EEA.eea_tabs = eea_tabs;
    eea_tabs();
    $(window).bind('hashchange', function (evt) {
        var $tab_target;
        if (window.location.hash.indexOf('tab') !== -1) {
            try {
                $tab_target = $("#content").find(window.location.hash);
                if ($tab_target.length && !$tab_target.hasClass("current")) {
                    $tab_target.click()
                }
            } catch (e) {
            }
        }
    });
    $(window).trigger('eea.tags.loaded', $('#whatsnew-gallery').find('.eea-tabs'));
    if (window.location.hash) {
        $(window).trigger('hashchange')
    }
});

/* - eea-pagination.js - */
// http://localhost:7988/www/portal_javascripts/eea-pagination.js?original=1
jQuery(document).ready(function ($) {
    if (window.EEA.isPrintPdf) {
        return
    }
    var $related_items = $("#relatedItems"),
        has_related_items = $related_items.length && $related_items[0].tagName !== 'SELECT', $eea_tabs = $("#eea-tabs"),
        $paginate = $(".paginate"), $eea_tabs_panels = $("#eea-tabs-panels"), pagination_count = 12;
    $.merge($paginate, $related_items.find('.visualNoMarker')).each(function () {
        var $self = $(this), $children = $self.children(), count = 0, isPaginate = $self.hasClass('paginate');
        pagination_count = window.parseInt($self.attr('data-paginate-count'), 10) || pagination_count;
        $children = isPaginate && $children[0].tagName !== "H3" ? $self : $children;
        $children.each(function () {
            var items;
            var orig_entries;
            var num_entries;
            var $childes;
            var $this = $(this);
            var keepData = true;
            var scripts = $this.find('script');
            if (this.tagName === "H3") {
                $eea_tabs = !$eea_tabs.length ? $("<ul class='eea-tabs two-rows' />").insertBefore($self) : $eea_tabs;
                $eea_tabs_panels = !$eea_tabs_panels.length ? $("<div class='eea-tabs-panels' />").insertAfter($eea_tabs) : $eea_tabs_panels;
                var tab_id = this.innerHTML.toLowerCase().replace(/\s/g, '-'), tab_href = "#tab-" + tab_id;
                $('<li />').append($('<a />').attr({
                    'href': tab_href,
                    'id': 'tab-' + tab_id
                }).html($this.detach().html())).appendTo($eea_tabs)
            }
            else {
                $this.data($self.data());
                if (scripts.length) {
                    scripts.remove(undefined, keepData)
                }
                $childes = $this.children();
                num_entries = $childes.length;
                orig_entries = num_entries;
                while (num_entries > 0) {
                    count += 1;
                    items = $childes.slice(0, num_entries > pagination_count ? pagination_count : num_entries);
                    $('<div />', {
                        'class': "page",
                        'data-count': num_entries > pagination_count ? pagination_count : num_entries
                    }).append(items).appendTo($this);
                    $childes = $childes.not(items);
                    num_entries = $childes.length
                }
                $this.addClass('eea-tabs-panel').appendTo($eea_tabs_panels);
                if (orig_entries > pagination_count) {
                    $("<div class='paginator listingBar' />").prependTo($this).pagination(orig_entries, {
                        items_per_page: pagination_count,
                        next_text: $("#eeaPaginationNext").text(),
                        prev_text: $("#eeaPaginationPrev").text(),
                        item_text: $("#eeaPaginationItems").text(),
                        callback: function (idx, el) {
                            var $parent = el.parent(), $page = $parent.find('.page').hide().eq(idx),
                                page_count = $page.next().data('count'), next_item = $parent.find('.next')[0],
                                $pagination = el.find('.pagination'), $pagination_children = $pagination.children();
                            if ($pagination_children[0].tagName === 'SPAN') {
                                $('<a href="#" class="listingPrevious"> </a>').prependTo($pagination)
                            }
                            if ($pagination_children[$pagination_children.length - 1].tagName === 'SPAN') {
                                $('<a href="#" class="next"> </a>').appendTo($pagination)
                            }
                            if (next_item) {
                                next_item.innerHTML = next_item.innerHTML.replace(pagination_count, page_count)
                            }
                            $page.show();
                            return false
                        }
                    })
                }
            }
        });
        if (isPaginate) {
            $eea_tabs = "";
            $eea_tabs_panels = ""
        }
    });
    if (has_related_items || $paginate.length) {
        window.EEA.eea_tabs()
    }
});

/* - eea-toc.js - */
// http://localhost:7988/www/portal_javascripts/eea-toc.js?original=1
function build_toc(toc) {
    if (!toc.hasClass('collapsable-portlet')) {
        toc.addClass('collapsable-portlet')
    }
    var currentList = toc.find('.portletItem');
    var hLevel = null;
    var lists = {'root': currentList};
    lists.root.detach();
    var queryString = $('#queryString').html();
    queryString = queryString || "h2, h3, h4";
    var tocExclude = $("#exclude-toc").data("exclude");
    if (tocExclude) {
        try {
            tocExclude = tocExclude.trim();
            $("#content").find(tocExclude).addClass("notoc")
        } catch (err) {
            if (window.console) {
                window.console.log(err)
            }
        }
    }
    $('#content').find(queryString).each(function (i, el) {
        var newLevel = parseInt(el.tagName.charAt(1), 10);
        hLevel = hLevel || newLevel;
        if (el.className.indexOf("notoc") !== -1) {
            return
        }
        if (newLevel > hLevel) {
            hLevel = newLevel;
            var newList = $('<ol></ol>');
            lists[newLevel] = newList;
            currentList.append(newList);
            currentList = newList
        } else if (newLevel < hLevel) {
            hLevel = newLevel;
            currentList = lists[newLevel] || lists.root
        }
        var h = $(el);
        var hText = $.trim(h.find('a').text()) || h.text();
        var li = $('<li><a>' + hText + '</a></li>');
        var hId = h.attr('id') || 'toc-' + i;
        var urlWithoutHash = location.protocol + '//' + location.host + location.pathname;
        li.find('a').attr('href', urlWithoutHash + '#' + hId);
        currentList.append(li);
        h.attr('id', hId)
    });
    var $toc_children = lists.root.children();
    var $first_child = $toc_children.eq(0);
    if ($first_child.is('ol') && !$first_child.children().length) {
        $toc_children = $toc_children.slice(1, $toc_children.length);
        $toc_children.appendTo($first_child);
        lists.root.empty();
        $first_child.appendTo(lists.root)
    }
    if (!$first_child.is('ol')) {
        $toc_children.wrapAll('<ol />')
    }
    lists.root.appendTo(toc);
    toc.show()
}
jQuery(document).ready(function ($) {
    var $document_toc = $('#document-toc');
    if ($document_toc.length) {
        build_toc($document_toc);
        var $portlet_header = $document_toc.find('.portletHeader');
        $portlet_header.click(function () {
            $document_toc.toggleClass('collapsed')
        })
    }
});

/* - eea-tooltips.js - */
// http://localhost:7988/www/portal_javascripts/eea-tooltips.js?original=1
jQuery(document).ready(function ($) {
    if ($.fn.tooltip !== undefined) {
        $(".eea-tooltip-top").each(function (i) {
            var title = $(this).attr("title");
            $(this).tooltip({effect: 'fade', tipClass: 'eea-tooltip-markup-top'})
        });
        $(".eea-tooltip-bottom").each(function (i) {
            var title = $(this).attr("title");
            $(this).tooltip({effect: 'fade', position: 'bottom center', tipClass: 'eea-tooltip-markup-bottom'})
        });
        $(".eea-tooltip-left").each(function (i) {
            var title = $(this).attr("title");
            $(this).tooltip({effect: 'fade', position: 'center left', tipClass: 'eea-tooltip-markup-left'})
        });
        $(".eea-tooltip-right").each(function (i) {
            var title = $(this).attr("title");
            $(this).tooltip({effect: 'fade', position: 'center right', tipClass: 'eea-tooltip-markup-right'})
        });
        var removeExtraText = function () {
            this.getTip()[0].lastChild.nodeValue = ''
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
                layout: container,
                onBeforeShow: removeExtraText
            })
        };
        $(".eea-flexible-tooltip-right").each(function (idx, el) {
            window.eea_flexible_tooltip(el)
        });
        $(".eea-flexible-tooltip-left").each(function (idx, el) {
            window.eea_flexible_tooltip(el, 'center left', 'tooltip-box-lcontent', [20, -10])
        });
        $(".eea-flexible-tooltip-top").each(function (idx, el) {
            window.eea_flexible_tooltip(el, 'top center', 'tooltip-box-tcontent', [10, 0])
        });
        $(".eea-flexible-tooltip-bottom").each(function (idx, el) {
            window.eea_flexible_tooltip(el, 'bottom center', 'tooltip-box-bcontent', [30, 0])
        })
    }
});

/* - eea_relations.js - */
// http://localhost:7988/www/portal_javascripts/eea_relations.js?original=1
jQuery(function ($) {
    var $relations_parent = $('#relatedItems');
    var $relations = $relations_parent.find('.visualNoMarker > div');
    var $tab_panels = $relations_parent.find(".eea-tabs-panel");
    var $sort_parent = $(".sorter_ctl");
    var $sort_select = $sort_parent.find('select');
    if ($relations.children().length > 10) {
        $sort_parent.show()
    }
    $(window).bind('relations.showSortingWidget', function () {
        if ($tab_panels.length) {
            $tab_panels.each(function () {
                var $this = $(this);
                var data_attr = $this.find('.page').eq(0).data();
                if (data_attr && data_attr.count > 10) {
                    $sort_parent.show();
                    return false
                }
            })
        }
    });
    $(window).trigger('relations.showSortingWidget');
    $sort_select.change(function (e) {
        var sort_parameter = e.currentTarget.value;
        $relations.each(function () {
            var $this = $(this);
            var $children = $this.children().detach();
            $children.sort(function (a, b) {
                return $(a).data(sort_parameter) > $(b).data(sort_parameter) ? 1 : -1
            });
            $this.append($children)
        });
        $(window).trigger('relations.sort', sort_parameter)
    });
    $(window).bind('relations.sort', function (ev, sort_parameter) {
        $tab_panels.each(function () {
            var $this = $(this);
            var $listing_entries = $this.find('.photoAlbumEntry, .tileItem').detach();
            $listing_entries.sort(function (a, b) {
                return $(a).data(sort_parameter) > $(b).data(sort_parameter) ? 1 : -1
            });
            var slice_index = 0;
            $('.page', $this).each(function (i, el) {
                var $el = $(el);
                var count = $el.data('count');
                var current_index = slice_index;
                slice_index = slice_index + count;
                $el.append($listing_entries.slice(current_index, slice_index))
            })
        })
    })
});

/* - eea-mediacentre.js - */
// http://localhost:7988/www/portal_javascripts/eea-mediacentre.js?original=1
(function ($) {
    $(document).ready(function () {
        if (window.innerHeight < 800 && window.innerWidth < 680) {
            return
        }
        var $region_content = $("#region-content"), $objmeta = $region_content.find('#objmetadata_pbwidgets_wrapper');
        if ($objmeta.length) {
            $region_content.find("dd:contains('video')").closest('dl').hide()
        }
        window.EEA = window.EEA || {};
        var EEA = window.EEA;
        var playVideo = function (link) {
            var $link = $(link);
            if (!$link.data('multimedia')) {
                var coverflow = $("#multimedia-coverflow"), video_page = coverflow.length > 0 ? 1 : 0;
                var parent = link;
                var href = link.href;
                var isInsidePopUp = $('body').hasClass('video_popup_view');
                var options = {
                    type: 'iframe',
                    padding: 0,
                    margin: 0,
                    width: 640,
                    height: 564,
                    scrolling: 'no',
                    autoScale: false,
                    autoDimensions: false,
                    centerOnScroll: false,
                    titleShow: false
                };
                if (video_page === 0) {
                    if (href.indexOf('video_popup_view') === -1) {
                        link.href = href.replace(/view$/, 'video_popup_view')
                    }
                }
                if (video_page) {
                    if (href.indexOf('multimedia_popup_view') === -1) {
                        var regex = /view$|video_popup_view|multimedia_popup_view/;
                        var clean_href = href.replace(regex, '');
                        if (href.indexOf('youtube') === -1 && href.indexOf('vimeo') === -1) {
                            link.href = clean_href + "multimedia_popup_view";
                            $("#fancybox-title").remove()
                        }
                        else {
                            options.titlePosition = 'inside';
                            options.titleShow = true
                        }
                    }
                    var mult = coverflow.offset(), bg = window.whatsnew.multimedia.bg,
                        bg2 = window.whatsnew.multimedia.bg2, $parent = $(parent), src = $parent.find('img');
                    var thumb_url = src.length !== 0 ? src[0].src : $parent.closest('div').prev().children()[0].src;
                    options.height = 387;
                    options.overlayShow = false;
                    options.onStart = function () {
                        var media_player = $("#media-player");
                        if (media_player.is(":visible")) {
                            media_player.fadeOut('fast', function () {
                                $("#contentFlow").fadeIn('slow')
                            });
                            $("#media-flowplayer").children().remove()
                        }
                        $.fancybox.center = function () {
                            return false
                        };
                        $('html, body').animate({scrollTop: 0}, 200, 'linear');
                        $("#fancybox-wrap").hide().css({position: 'absolute'}).animate({
                            left: mult.left - 20,
                            top: mult.top - 20
                        }, 200);
                        window.setTimeout(function () {
                            if (href.indexOf('youtube') !== -1 || href.indexOf('vimeo') !== -1) {
                                $("#fancybox-title").remove().prependTo('#fancybox-content')
                            }
                        }, 200)
                    };
                    var info_area = function (iframe, iframe_src, $parent) {
                        var frame, tab_desc, video_title, iframe_eea = iframe_src.indexOf('eea');
                        if (iframe_eea !== -1) {
                            frame = iframe.contents();
                            tab_desc = frame.find("#tab-desc");
                            video_title = frame.find("#video-title").text()
                        }
                        if (!tab_desc) {
                            tab_desc = $($parent).find('p').html()
                        }
                        video_title = video_title || $("#fancybox-title").text();
                        var featured_item = $("#featured-items");
                        var featured_item_title = featured_item.find("h3");
                        featured_item_title.text(video_title);
                        var featured_description = featured_item.find(".featured-description");
                        $("#featured-films").fadeOut();
                        tab_desc = tab_desc || $('.photoAlbumEntryDescription', $parent).text();
                        featured_description.html(tab_desc).end().fadeIn();
                        var title_height = featured_item_title.height();
                        var desc_height;
                        if (title_height === 21) {
                            desc_height = "184px"
                        }
                        else if (title_height === 42) {
                            desc_height = "163px"
                        }
                        else {
                            desc_height = "142px"
                        }
                        featured_description.css({height: desc_height});
                        var orig_href = iframe_eea !== -1 ? href.replace(/multimedia_popup_view/, 'view') : href.replace('embed/', 'watch?v=');
                        featured_item.find(".bookmark-link").attr("href", orig_href)
                    };
                    options.onComplete = function ($parent) {
                        var iframe = $("#fancybox-frame"), iframe_src = iframe.attr('src');
                        if (iframe_src.indexOf('youtube') !== -1 || iframe_src.indexOf('vimeo') !== -1) {
                            iframe.attr({width: 640, height: 360}).css('height', '360px')
                        }
                        else {
                            iframe.attr({width: 640, height: 387})
                        }
                        iframe.one("load", function () {
                            info_area(iframe, iframe_src, $parent)
                        })
                    };
                    options.href = link.href
                }
                if (!isInsidePopUp) {
                    $(link).fancybox(options)
                }
                $link.data('multimedia', true);
                $link.click()
            }
        };
        EEA.playVideo = playVideo;
        function prepareVideoLinkURLs() {
            var isInsidePopUp = $('body').hasClass('video_popup_view');
            $('.video-fancybox').each(function () {
                var regex = /(\/$|\/view\/?$|\/video_popup_view\/?$)/;
                var href = $(this).attr('href');
                href = href.replace(regex, '');
                href = href + "/video_popup_view";
                this.href = href
            });
            $("body").delegate(".video-fancybox", "click", function (evt) {
                playVideo(this);
                if (!isInsidePopUp) {
                    evt.preventDefault()
                }
            })
        }

        prepareVideoLinkURLs();
        if ($.fn.fancybox === undefined) {
            return
        }
        if (window.Faceted) {
            jQuery(window.Faceted.Events).bind(window.Faceted.Events.AJAX_QUERY_SUCCESS, function (evt) {
                prepareVideoLinkURLs()
            })
        }
    })
}(jQuery));

/* - print_warning.js - */
// http://localhost:7988/www/portal_javascripts/print_warning.js?original=1
var warning_displayed = false;
window.onbeforeprint = function () {
    var warning_text = jQuery.trim(jQuery("#print-warning p").html());
    if (warning_displayed === false) {
        alert(warning_text)
    }
};
jQuery(document).ready(function ($) {
    $('#icon-print').parent().attr('href', '#').click(function () {
        var warning_text = $.trim($("#print-warning p").html());
        if (confirm(warning_text)) {
            warning_displayed = true;
            window.print()
        }
    })
});

/* - slide.js - */
// http://localhost:7988/www/portal_javascripts/slide.js?original=1
(function ($) {
    var langregex1 = new RegExp("(http://[a-z0-9.:]*)/(aa|ab|af|am|ar|as|ay|az|ba|be|bg|bh|bi|bn|bo|bs|br|ca|ch|co|cs|cy|da|de|dz|el|en|eo|es|et|eu|fa|fi|fj|fo|fr|fy|ga|gd|gl|gn|gu|gv|ha|he|hi|hr|hu|hy|ia|id|ie|ik|is|it|iu|ja|jbo|jw|ka|kk|kl|km|kn|ko|ks|ku|kw|ky|la|lb|li|ln|lo|lt|lv|mg|mi|mk|ml|mn|mo|mr|ms|mt|my|na|ne|nl|no|nn|oc|om|or|pa|pl|ps|pt|qu|rm|rn|ro|ru|rw|sa|sd|se|sg|sh|si|sk|sl|sm|sn|so|sq|sr|ss|st|su|sv|sw|ta|te|tg|th|ti|tk|tl|tn|to|tr|ts|tt|tw|ug|uk|ur|uz|vi|vo|wa|wo|xh|yi|yo|za|zh|zu)/.*");
    var langregex2 = new RegExp("(http://[a-z0-9.:]*/)(aa|ab|af|am|ar|as|ay|az|ba|be|bg|bh|bi|bn|bo|bs|br|ca|ch|co|cs|cy|da|de|dz|el|en|eo|es|et|eu|fa|fi|fj|fo|fr|fy|ga|gd|gl|gn|gu|gv|ha|he|hi|hr|hu|hy|ia|id|ie|ik|is|it|iu|ja|jbo|jw|ka|kk|kl|km|kn|ko|ks|ku|kw|ky|la|lb|li|ln|lo|lt|lv|mg|mi|mk|ml|mn|mo|mr|ms|mt|my|na|ne|nl|no|nn|oc|om|or|pa|pl|ps|pt|qu|rm|rn|ro|ru|rw|sa|sd|se|sg|sh|si|sk|sl|sm|sn|so|sq|sr|ss|st|su|sv|sw|ta|te|tg|th|ti|tk|tl|tn|to|tr|ts|tt|tw|ug|uk|ur|uz|vi|vo|wa|wo|xh|yi|yo|za|zh|zu)$");

    function isCurrentPageTranslated() {
        var link = document.location.href.toLowerCase();
        return langregex1.test(link) || langregex2.test(link)
    }

    $(document).ready(function () {
        var $mini_header = $('body').hasClass('mini-header');

        function panel() {
            var a = $(this);
            var buttonID = a.parent().attr('id');
            if (!buttonID) {
                return
            }
            var $tooltip = $('#tip-' + buttonID);
            if (buttonID === "siteaction-contactus" && isCurrentPageTranslated()) {
                return
            }
            var article_lang = buttonID === "article-language";
            var networks_panel = buttonID === "externalsites-networks";
            var fordef;
            if ($tooltip.length > 0) {
                var initial_title = a.attr("title");
                a.attr("title", "").attr("href", "#");
                fordef = 'click, blur';
                a.tooltip({
                    tip: $tooltip[0],
                    position: 'bottom center',
                    offset: [0, 0],
                    delay: 10000000,
                    events: {def: fordef}
                });
                a.attr('title', initial_title);
                a.click(function (ev) {
                    ev.preventDefault();
                    var $this = $(this), tooltip = $tooltip[0];
                    var $panels = $('.panel');
                    $panels.each(function () {
                        var $this = $(this);
                        var $id = $this.attr('id');
                        if ($id !== "" && $id !== $tooltip.attr('id')) {
                            $this.fadeOut('fast')
                        }
                    });
                    if (article_lang) {
                        $("#tip-article-language").css({
                            position: 'absolute',
                            top: '48px',
                            display: 'block',
                            right: '0px',
                            left: ''
                        })
                    }
                    if (networks_panel) {
                        $("#tip-externalsites-networks").css('margin-left', '2em')
                    }
                    if ($mini_header) {
                        var gnav_pos_left = window.Math.floor($("#portal-globalnav").offset().left);
                        var pos_left = window.Math.floor($this.offset().left);
                        var eWidth = $this.outerWidth();
                        var tWidth = $tooltip.outerWidth();
                        var left = pos_left + eWidth - gnav_pos_left - tWidth + "px";
                        if (tooltip.style.left !== left) {
                            tooltip.style.left = left
                        }
                    }
                    $tooltip.fadeIn('fast')
                })
            }
        }

        $("#portal-columns, #portal-header").click(function (e) {
            var target = $(e.target);
            var parents = $('.navbar-header, #content'), panels = parents.find('.panel');
            if (!target.is('#cross-site-top a,  #cross-site-top .panel, #article-language a') && !target.parents('.panel').length) {
                panels.fadeOut('fast');
                $(".eea-navsiteactions-active").removeClass("eea-navsiteactions-active")
            }
        });
        $("#portal-siteactions").addClass('eea-slide-tooltips');
        $("#portal-externalsites").addClass('eea-slide-tooltips');
        $("#article-language").addClass('eea-slide-tooltips');
        $(".externalsites").addClass('eea-slide-tooltips');
        $("#tip-externalsites-networks").addClass('eea-slide-tooltips');
        $(".eea-slide-tooltips").find('a').each(panel)
    })
}(jQuery));

/* - whatsnew_gallery.js - */
// http://localhost:7988/www/portal_javascripts/whatsnew_gallery.js?original=1
jQuery(document).ready(function ($) {
    window.whatsnew = {};
    var eea_gal = window.whatsnew;
    (function () {
        eea_gal.site_address = $("base").attr("href") + '/';
        eea_gal.gallery = $("#whatsnew-gallery");
        eea_gal.gallery_page = eea_gal.gallery.attr("data-page")
    }());
    eea_gal.gallery_load = function (el, address, params, layout_selection) {
        el.load(address, params, function (html) {
            var album = el.find(".gallery-album");
            var listing = el.find(".gallery-listing");
            var layout = layout_selection || el.parent().find(".gallery-layout-selection li a")[0];
            if (html.length > 1) {
                if (layout && layout.className === "list-layout active-list") {
                    el.find('.gallery-album').addClass("hiddenStructure");
                    listing.hide().fadeIn("slow")
                }
                else {
                    el.find('.gallery-listing').addClass("hiddenStructure");
                    album.hide().fadeIn("slow")
                }
            }
        })
    };
    eea_gal.whatsnew_func = function (cur_tab_val, sel_text, sel_value, index) {
        var gallery_macro = this.gallery_page === 'frontpage' ? "whatsnew_gallery_macro" : "datamaps_gallery_macro";
        var address = eea_gal.site_address + gallery_macro;
        eea_gal.current_tab_addr = address;
        var gal = eea_gal.gallery.find(".eea-tabs-panel");
        var news = index ? gal[index] : gal.filter(function () {
            return this.style.display !== "none"
        });
        news = index === 0 ? gal.first() : news;
        news = news[0] !== undefined ? news[0] : news;
        var gallery_ajax = $(".gallery-ajax", news);
        var layout_selection = $('.gallery-layout-selection li a', news)[0];
        var params = sel_value ? "topic" + "=" + sel_value : undefined;
        params = params ? params + '&tabname=' + cur_tab_val : 'tabname=' + cur_tab_val;
        eea_gal.gallery_load(gallery_ajax, address, params, layout_selection)
    };
    var $whatsnew_gallery = $("#whatsnew-gallery");
    $whatsnew_gallery.find(".eea-tabs").tabs($whatsnew_gallery.find(".eea-tabs-panel"), function (event, index) {
        var cur_tab = this.getTabs()[index];
        if (!cur_tab) {
            return
        }
        var cur_tab_val = cur_tab.id.substr(4);
        cur_tab.theme = cur_tab.theme || "";
        var opt_item, sel_value, sel_text;
        var highlight = $("#" + cur_tab_val + "-highlights");
        var ajax_loader_img = '<div style="text-align: center;"><img src="++resource++faceted_images/ajax-loader.gif" /></div>';
        opt_item = $("#topic-selector").find(":selected");
        if (opt_item.length) {
            sel_value = opt_item.val();
            sel_text = opt_item.text()
        }
        else {
            $(".filter-topic").hide()
        }
        var album = highlight.find(".gallery-album");
        var album_length = album.length !== 0 ? album.children().length : 0;
        var notopics = highlight.find(".portalMessage"), notopics_length = notopics.length !== 0 ? 1 : 0;
        if (cur_tab.theme === sel_value && notopics_length !== 0) {
            return
        }
        if (sel_text && sel_text.indexOf("All") !== -1 || album_length === 0 && !highlight.find(".portalMessage").length) {
            if (album_length && cur_tab.theme === sel_value) {
                return
            }
            album.html(ajax_loader_img);
            cur_tab.theme = sel_value;
            eea_gal.whatsnew_func(cur_tab_val, sel_text, sel_value, index)
        }
        if (sel_value) {
            if (cur_tab.theme !== sel_value) {
                album.html(ajax_loader_img);
                cur_tab.theme = sel_value;
                eea_gal.whatsnew_func(cur_tab_val, sel_text, sel_value, index)
            }
        }
    });
    var $topic_selector = $("#topic-selector");
    $topic_selector.find('[value="default"]').remove();
    $topic_selector.change(
        function displayResult() {
            $topic_selector[0][0].className = "hiddenStructure";
            var x = this.selectedIndex, y = this.options;
            var topic_value = y[x].value, topic_text = y[x].innerHTML;
            var $tab = $("#whatsnew-gallery").find(".eea-tabs a.current");
            var $has_tab = $tab.length;
            if ($has_tab) {
                $tab[0].theme = topic_value
            }
            var tab_val = $has_tab ? $tab[0].id.substr(4) : 'allproducts';
            eea_gal.whatsnew_func(tab_val, topic_text, topic_value)
        });
    var layout_links = $(".gallery-layout-selection li a");
    layout_links.click(function (e) {
        var $this = $(this);
        var $parent = $this.parent();
        var $ajax = $this.closest("ul").next();
        var $hidden_gallery = $ajax.find(".hiddenStructure");
        var listing = $ajax.find('.gallery-listing');
        var album = $ajax.find('.gallery-album');
        var next = $parent.siblings().find("a");
        var link_class = $this[0].className;
        var highlight = $this.closest("div")[0].id;
        if (link_class === "list-layout active-list" || link_class === "album-layout active-album") {
            e.preventDefault();
            return
        }
        var cookie_expires = new Date();
        cookie_expires.setMonth(cookie_expires.getMonth() + 1);
        if (link_class.indexOf("list-layout") !== -1) {
            album.slideUp("slow");
            listing.slideDown("slow");
            $hidden_gallery.removeClass("hiddenStructure");
            $this.toggleClass("active-list");
            next.toggleClass("active-album");
            SubCookieUtil.set(eea_gal.gallery_page, highlight, "active-list", cookie_expires)
        }
        else {
            listing.slideUp("slow");
            album.slideDown("slow");
            $hidden_gallery.removeClass("hiddenStructure");
            $this.toggleClass("active-album");
            next.toggleClass("active-list");
            SubCookieUtil.set(eea_gal.gallery_page, highlight, "active-album", cookie_expires)
        }
        e.preventDefault()
    });
    if (eea_gal.gallery.length > 0) {
        var gallery_cookies = SubCookieUtil.getAll(eea_gal.gallery_page);
        if (gallery_cookies !== null) {
            eea_gal.gallery.find('.eea-tabs-panel').each(function () {
                var $this = $(this);
                var layouts = $this.find(".gallery-layout-selection li a");
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
                        link_album.addClass("active-album")
                    }
                    else if (gallery_cookie === "active-list") {
                        listing.show();
                        album.hide();
                        $hidden_gallery.removeClass("hiddenStructure");
                        link_listing.addClass("active-list");
                        link_album.removeClass("active-album")
                    }
                }
            })
        }
    }
});

/* - ++resource++eea.dataservice.view.js - */
// http://localhost:7988/www/portal_javascripts/++resource++eea.dataservice.view.js?original=1
var Figures = {version: '1.1.0'};
Figures.fancybox = null;
Figures.PhotoAlbum = function (context) {
    this.context = context;
    this.photos = jQuery('.photoAlbumEntry', this.context);
    this.photos.removeClass('photoAlbumFolder');
    this.photos.each(function () {
        var photo = jQuery(this);
        var link = jQuery('a', photo);
        if (!link.length || link[0].href.indexOf("data-and-maps/figures") === -1) {
            return
        }
        var href = link.attr('href') + '/fancybox.html';
        link.attr({'href': href, 'rel': 'fancybox'});
        link.fancybox({
            type: 'ajax',
            hideOnContentClick: false,
            width: 870,
            height: 680,
            autoDimensions: false,
            padding: 0,
            margin: 0,
            centerOnScroll: false
        })
    })
};
Figures.Load = function () {
    var context = jQuery('#region-content');
    Figures.fancybox = new Figures.PhotoAlbum(context)
};

/* - customPatch.js - */
// http://localhost:7988/www/portal_javascripts/customPatch.js?original=1
function figuresNumber() {
    var figures = jQuery(".indicator-figure-plus").find('.figure-title');
    var count = 1;
    jQuery.each(figures, function (i, figure) {
        var figure_title = figure.innerHTML;
        figure.innerHTML = 'Fig. ' + count + ': ' + figure_title;
        count += 1
    })
}
function fix_image_icon_url(context) {
    var form = jQuery('img[src$="image_icon.gif"]', context);
    if (form.length) {
        jQuery(form).eearewrite({attr: 'src', oldVal: 'image_icon.gif', newVal: 'www/image_icon.gif'})
    }
}
$(document).ready(function () {
    $('.portletError').remove();
    (function ($el) {
        if (!$el.length) {
            return
        }
        var $previous_versions = $el.next();
        $previous_versions.css('display', 'none');
        $el.click(function (e) {
            $previous_versions.slideToggle();
            e.preventDefault()
        })
    }($(".showOlderVersions")))
});

/* - soer_frontpage.js - */
// http://localhost:7988/www/portal_javascripts/soer_frontpage.js?original=1
(function ($) {
    $(document).ready(function () {
        var slide_portlet = $('.slidePortlet');
        if (slide_portlet.length === 0) {
            return
        }
        var body = $('body'), body_class = body.attr('class').match(/\bsoer/);
        slide_portlet.each(function () {
            var portlet = $(this);
            var b1 = $('<span class="slideButton next"></span>');
            var b2 = $('<span class="slideButton prev"></span>');
            portlet.append(b1);
            portlet.append(b2);
            var play = $('<div class="slideButton play"></div>');
            portlet.append(play);
            var items = portlet.find('.portletItem');
            var items_length = items.length;
            if (items_length < 2) {
                $(".slideButton").css('display', 'none')
            }
            var randomnumber = Math.floor(Math.random() * items_length);
            var elem = items[randomnumber];
            $(elem).addClass('selected');
            $(elem).css('left', 0);
            b1.click(function () {
                var current = portlet.find('.portletItem.selected');
                var next = current.next('.portletItem');
                var currentIndex = portlet.find('.portletItem').index(current);
                if (currentIndex + 1 === portlet.find('.portletItem').length) {
                    return
                }
                current.removeClass('selected');
                next.addClass('selected');
                current.animate({'left': -(portlet.width() + 300)});
                next.animate({'left': 0})
            });
            b2.click(function () {
                var current = portlet.find('.portletItem.selected');
                var next = current.prev('.portletItem');
                var currentIndex = portlet.find('.portletItem').index(current);
                if (currentIndex === 0) {
                    return
                }
                current.removeClass('selected');
                next.addClass('selected');
                var p = portlet.width() + 300;
                current.animate({'left': p});
                next.animate({'left': 0})
            });
            var playID;
            play.click(function () {
                var $this = $(this);
                if ($this.hasClass('pause')) {
                    $this.removeClass('pause');
                    window.clearInterval(playID)
                }
                else {
                    $this.toggleClass('pause');
                    b1.click();
                    playID = window.setInterval(function () {
                        b1.click()
                    }, 10000)
                }
            });
            if (body_class) {
                play.addClass('pause');
                playID = window.setInterval(function () {
                    b1.click()
                }, 10000)
            }
        })
    })
})(jQuery);

/* - jquery.highlightsearchterms.js - */
// http://localhost:7988/www/portal_javascripts/jquery.highlightsearchterms.js?original=1
(function ($) {
    var Highlighter, makeSearchKey, makeAddress, defaults;
    Highlighter = function (options) {
        $.extend(this, options);
        this.terms = this.cleanTerms(this.terms.length ? this.terms : this.getSearchTerms())
    };
    Highlighter.prototype = {
        highlight: function (startnode) {
            if (!this.terms.length || !startnode.length) {
                return
            }
            var self = this;
            $.each(this.terms, function (i, term) {
                startnode.find('*:not(textarea)').andSelf().contents().each(function () {
                    if (this.nodeType === 3) {
                        self.highlightTermInNode(this, term)
                    }
                })
            })
        }, highlightTermInNode: function (node, word) {
            var c = node.nodeValue, self = this, highlight, ci, index, next;
            if ($(node).parent().hasClass(self.highlightClass)) {
                return
            }
            highlight = function (content) {
                return $('<span class="' + self.highlightClass + '">&nbsp;</span>').text(content)
            };
            ci = self.caseInsensitive;
            while (c && (index = (ci ? c.toLowerCase() : c).indexOf(word)) > -1) {
                $(node).before(document.createTextNode(c.substr(0, index))).before(highlight(c.substr(index, word.length))).before(document.createTextNode(c.substr(index + word.length)));
                next = node.previousSibling;
                $(node).remove();
                node = next;
                c = node.nodeValue
            }
        }, queryStringValue: function (uri, regexp) {
            var match, pair;
            if (uri.indexOf('?') < 0) {
                return ''
            }
            uri = uri.substr(uri.indexOf('?') + 1);
            while (uri.indexOf('=') >= 0) {
                uri = uri.replace(/^\&*/, '');
                pair = uri.split('&', 1)[0];
                uri = uri.substr(pair.length);
                match = pair.match(regexp);
                if (match) {
                    return decodeURIComponent(match[match.length - 1].replace(/\+/g, ' '))
                }
            }
            return ''
        }, termsFromReferrer: function () {
            var ref, i, se;
            ref = $.fn.highlightSearchTerms._test_referrer !== null ? $.fn.highlightSearchTerms._test_referrer : document.referrer;
            if (!ref) {
                return ''
            }
            for (i = 0; i < this.referrers.length; i += 1) {
                se = this.referrers[i];
                if (ref.match(se.address)) {
                    return this.queryStringValue(ref, se.key)
                }
            }
            return ''
        }, cleanTerms: function (terms) {
            var self = this;
            return $.unique($.map(terms, function (term) {
                term = $.trim(self.caseInsensitive ? term.toLowerCase() : term);
                return (!term || self.filterTerms.test(term)) ? null : term
            }))
        }, getSearchTerms: function () {
            var terms = [],
                uri = $.fn.highlightSearchTerms._test_location !== null ? $.fn.highlightSearchTerms._test_location : location.href;
            if (this.useReferrer) {
                $.merge(terms, this.termsFromReferrer().split(/\s+/))
            }
            if (this.useLocation) {
                $.merge(terms, this.queryStringValue(uri, this.searchKey).split(/\s+/))
            }
            return terms
        }
    };
    makeSearchKey = function (key) {
        return (typeof key === 'string') ? new RegExp('^' + key + '=(.*)$', 'i') : key
    };
    makeAddress = function (addr) {
        return (typeof addr === 'string') ? new RegExp('^https?://(www\\.)?' + addr, 'i') : addr
    };
    $.fn.highlightSearchTerms = function (options) {
        options = $.extend({}, defaults, options);
        options = $.extend(options, {
            searchKey: makeSearchKey(options.searchKey),
            referrers: $.map(options.referrers, function (se) {
                return {address: makeAddress(se.address), key: makeSearchKey(se.key)}
            })
        });
        if (options.includeOwnDomain) {
            var hostname = $.fn.highlightSearchTerms._test_location !== null ? $.fn.highlightSearchTerms._test_location : location.hostname;
            options.referrers.push({address: makeAddress(hostname.replace(/\./g, '\\.')), key: options.searchKey})
        }
        new Highlighter(options).highlight(this);
        return this
    };
    $.fn.highlightSearchTerms.referrers = [{address: 'google\\.', key: 'q'}, {
        address: 'search\\.yahoo\\.',
        key: 'p'
    }, {address: 'search\\.msn\\.', key: 'q'}, {address: 'search\\.live\\.', key: 'query'}, {
        address: 'search\\.aol\\.',
        key: 'userQuery'
    }, {address: 'ask\\.com', key: 'q'}, {address: 'altavista\\.', key: 'q'}, {address: 'feedster\\.', key: 'q'}];
    defaults = {
        terms: [],
        useLocation: true,
        searchKey: '(searchterm|SearchableText)',
        useReferrer: true,
        referrers: $.fn.highlightSearchTerms.referrers,
        includeOwnDomain: true,
        caseInsensitive: true,
        filterTerms: /\b(not|and|or)\b/i,
        highlightClass: 'highlightedSearchTerm'
    };
    $.fn.highlightSearchTerms._test_location = null;
    $.fn.highlightSearchTerms._test_referrer = null;
    $.fn.highlightSearchTerms._highlighter = Highlighter
}(jQuery));
jQuery(function ($) {
    $('#region-content,#content').highlightSearchTerms({includeOwnDomain: $('dl.searchResults').length === 0})
});

/* - ++resource++search.js - */
// http://localhost:7988/www/portal_javascripts/++resource++search.js?original=1
jQuery(function ($) {
    var query, pushState, popped, initialURL, $default_res_container = $('#search-results'),
        $search_filter = $('#search-filter'), $search_field = $('#search-field'), $search_gadget = $('#searchGadget'),
        $form_search_page = $("form.searchPage"),
        navigation_root_url = $('link[rel="home"]').attr('href') || window.navigation_root_url || window.portal_url;
    $.fn.pullSearchResults = function (query) {
        return this.each(function () {
            var $container = $(this);
            $.get('@@updated_search', query,
                function (data) {
                    $container.hide();
                    var $ajax_search_res = $('<div id="ajax-search-res"></div>').html(data),
                        $search_term = $('#search-term');
                    var $data_res = $ajax_search_res.find('#search-results').children(),
                        data_search_term = $ajax_search_res.find('#updated-search-term').text(),
                        data_res_number = $ajax_search_res.find('#updated-search-results-number').text(),
                        data_sorting_opt = $ajax_search_res.find('#updated-sorting-options').html();
                    $container.html($data_res);
                    $container.fadeIn();
                    if (!$search_term.length) {
                        $search_term = $('<strong id="search-term" />').appendTo('h1.documentFirstHeading')
                    }
                    $search_term.text(data_search_term);
                    $('#search-results-number').text(data_res_number);
                    $('#search-results-bar').find('#sorting-options').html(data_sorting_opt);
                    $('#rss-subscription').find('a.link-feed').attr('href', function () {
                        return navigation_root_url + '/search_rss?' + query
                    })
                })
        })
    };
    pushState = function (query) {
        if (Modernizr.history) {
            var url = navigation_root_url + '/@@search?' + query;
            history.pushState(null, null, url)
        }
    };
    popped = (window.history && 'state' in window.history);
    initialURL = location.href;
    $(window).bind('popstate', function (event) {
        var initialPop, str;
        initialPop = !popped && location.href === initialURL;
        popped = true;
        if (initialPop) {
            return
        }
        if (!location.search) {
            return
        }
        query = location.search.split('?')[1];
        var results = query.match(/SearchableText=[^&]*/);
        if (results) {
            str = results[0];
            str = decodeURIComponent(str.replace(/\+/g, ' ')); // we remove '+' used between words
            $.merge($search_field.find('input[name="SearchableText"]'), $search_gadget).val(str.substr(15, str.length));
            $default_res_container.pullSearchResults(query)
        }
    });
    $search_filter.find('input.searchPage[type="submit"]').hide();
    $search_field.find('input.searchButton').click(function (e) {
        var st, queryString = location.search.substring(1), re = /([^&=]+)=([^&]*)/g, m, queryParameters = [], key;
        st = $search_field.find('input[name="SearchableText"]').val();
        queryParameters.push({"name": "SearchableText", "value": st});
        while (m = re.exec(queryString)) {
            key = decodeURIComponent(m[1]);
            if (key !== 'SearchableText') {
                queryParameters.push({"name": key, "value": decodeURIComponent(m[2].replace(/\+/g, ' '))})
            }
        }
        queryString = $.param(queryParameters);
        $default_res_container.pullSearchResults(queryString);
        pushState(queryString);
        e.preventDefault()
    });
    $form_search_page.submit(function (e) {
        query = $(this).serialize();
        $default_res_container.pullSearchResults(query);
        pushState(query);
        e.preventDefault()
    });
    $search_field.find('input[name="SearchableText"]').keyup(function () {
        $search_gadget.val($(this).val())
    });
    $('#search-results-bar').find('dl.actionMenu > dd.actionMenuContent').click(function (e) {
        e.stopImmediatePropagation()
    });
    $search_filter.delegate('input, select', 'change',
        function (e) {
            query = '';
            if ($search_filter.find('input:checked').length > 1) {
                query = $form_search_page.serialize()
            }
            $default_res_container.pullSearchResults(query);
            pushState(query)
        });
    $('#sorting-options').delegate('a', 'click', function (e) {
        if ($(this).attr('data-sort')) {
            $form_search_page.find("input[name='sort_on']").val($(this).attr('data-sort'))
        }
        else {
            $form_search_page.find("input[name='sort_on']").val('')
        }
        query = this.search.split('?')[1];
        $default_res_container.pullSearchResults(query);
        pushState(query);
        e.preventDefault()
    });
    $default_res_container.delegate('.listingBar a', 'click', function (e) {
        query = this.search.split('?')[1];
        $default_res_container.pullSearchResults(query);
        pushState(query);
        e.preventDefault()
    })
});

/* - global_searchbox.js - */
// http://localhost:7988/www/portal_javascripts/global_searchbox.js?original=1
(function ($) {
    $(function () {
        var search_forms = $("#portal-searchbox, #visual-column-wrapper").find(".searchforms");
        var text_inputs = search_forms.find("input:text");
        text_inputs.each(function () {
            var search_label = this.title + "...";
            this.onfocus = function () {
                if (this.value == search_label) {
                    this.value = ""
                }
            };
            this.onblur = function () {
                if (this.value === "") {
                    this.value = search_label
                }
            };
            this.value = search_label
        })
    })
})(jQuery);

