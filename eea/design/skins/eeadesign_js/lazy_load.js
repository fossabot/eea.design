// /* jslint:disable */
// /*global jQuery, window, document */

// const elementIsVisibleInViewport = (el, partiallyVisible = true) => {
//   const { top, left, bottom, right } = el.getBoundingClientRect();
//   return partiallyVisible
//     ? ((top > 0 && top < window.innerHeight) || (bottom > 0 && bottom < window.innerHeight)) &&
//       ((left > 0 && left < window.innerWidth) || (right > 0 && right < window.innerWidth))
//     : top >= 0 && left >= 0 && bottom <= window.innerHeight && right <= window.innerWidth;
// };

// function enableLazy(element) {
//     var source = element.attr('src');
//     var classes = element.attr('class') ? element.attr('class') + ' ' : '';
//     element.attr('data-src', source);
//     element.attr('class', classes + 'lazy');
//     element.attr('src', '/www/lazyload_loader.gif');
// }

// function setImageDimension(element) {
//     // element.parent().css('height', '0');
//     // element.parent().css('padding-bottom', '66.66%');
//     // debugger;
//     // element.parent().css('max-width', '100%');
//     // element.parent().css('max-height', '100%');

// }

// jQuery(document).ready(function($) {
//     var lazyElements = [];

//     $('#content img').each(function(){
//         if (elementIsVisibleInViewport(this) === false) {
//             setImageDimension($(this));
//             enableLazy($(this));
//             lazyElements.push($(this));
//         }
//     });

//     $('#portal-column-two img').each(function(){
//         if (elementIsVisibleInViewport(this) === false) {
//             setImageDimension($(this));
//             enableLazy($(this));
//             lazyElements.push($(this));
//         }
//     });

//     $('#content iframe').each(function(){
//         if (elementIsVisibleInViewport(this) === false) {
//             enableLazy($(this));
//             lazyElements.push($(this));
//         }
//     });

//     $('.lazy').lazy({
//         scrollDirection: 'both',
//         effect: 'fadeIn',
//         effectTime: 1000,
//         threshold: 0,
//         combined: true,
//         delay: 2500000,
//         // delay: 5000,
//         visibleOnly: false,
//         onError: function(element) {
//             console.log('error loading ' + element.data('src'));
//         }
//     });
    
//     var isIe = function detectIE() {
//         var ua = window.navigator.userAgent;
//         var msie = ua.indexOf('MSIE ');
//         if (msie > 0) {
//           // IE 10 or older => return true
//           return true;
//         }

//         var trident = ua.indexOf('Trident/');
//         if (trident > 0) {
//           // IE 11 => return true
//           return true;
//         }

//         var edge = ua.indexOf('Edge/');
//         if (edge > 0) {
//           // Edge (IE 12+) => return true
//           return true;
//         }

//         // other browser
//         return false;
//     }

//     var forceImageLoad = function (images) {
//         $(images).each(function (){
//             var image = $(this);
//             var image_source = image.attr('data-src');
//             image.attr('src', image_source);
//             $(this).lazy(
//             {
//                 event: "lazyload",
//                 effect: "show",
//                 effectspeed: 0
//             }).trigger("lazyload");
//         });
//         setTimeout(function(){}, 1000);
//     }

//     // var beforePrintCaller = function () {
//         // if (typeof(window.forceDavizLoad) !== "undefined") {
//         //     window.forceDavizLoad();
//         // }
//         // window.forceDavizLoad();
//     //     window.forceImageLoad
//     // }


//     if (isIe()) {
//         window.onbeforeprint = forceImageLoad(lazyElements); // Internet Explorer
//     }

//     $(document).keydown(function(allBrowsers) { // Track printing using Ctrl/Cmd+P.
//         if (allBrowsers.keyCode === 80 && (allBrowsers.ctrlKey || allBrowsers.metaKey)) {
//             forceImageLoad(lazyElements);
//         }
//     });

//     if (window.matchMedia) { // Track printing from browsers using the Webkit engine
//         var mediaQueryList = window.matchMedia('print');
//         mediaQueryList.addListener(function(mql) {
//             if (mql.matches) {
//                 forceImageLoad(lazyElements);
//             }
//         });
//     }
// });