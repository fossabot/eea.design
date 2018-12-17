/* jslint:disable */

/*
* Count DNT-signals
* https://www.quantable.com/analytics/how-many-do-not-track/
*/
var DNT = 'no';
if (navigator.doNotTrack == "yes" || navigator.doNotTrack == "1" || navigator.msDoNotTrack == "1" || window.doNotTrack == "yes" || window.doNotTrack == "1" || window.msDoNotTrack == "1"){
 DNT = 'yes';
}


/* GA */
if(navigator.userAgent.indexOf("Speed Insights") == -1) {
    (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
    (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
    m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
    })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

    ga('create', 'UA-184389-1', 'auto', {'legacyCookieDomain': 'eea.europa.eu'});
    ga('set', 'dimension2', DNT);
    ga('set', 'anonymizeIp', true);
    ga('send', 'pageview');
}


/* Matomo Analytics */
var _paq = _paq || [];
/* tracker methods like "setCustomDimension" should be called before "trackPageView" */
_paq.push(["setDocumentTitle", document.domain + "/" + document.title]);
_paq.push(["setCookieDomain", "*.eea.europa.eu"]);
_paq.push(['setCustomDimension', 2, DNT]);
_paq.push(['trackPageView']);
_paq.push(['enableLinkTracking']);
(function() {
  var u="https://matomo.eea.europa.eu/";
  var hn=window.location.host;
  var sids={"www.eea.europa.eu":"3",
            "semantic.eea.europa.eu":"34",
            "eunis.eea.europa.eu":"35",
            "community.eea.europa.eu":"36",
            "search.apps.eea.europa.eu":"37"};
  var d=document, sid=d.getElementsByTagName('html')[0].getAttribute('data-siteid') || sids[hn] || '3';
  _paq.push(['setTrackerUrl', u+'piwik.php']);
  _paq.push(['setSiteId', sid]);
  var g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
  g.type='text/javascript'; g.async=true; g.defer=true; g.src=u+'piwik.js'; s.parentNode.insertBefore(g,s);
})();
