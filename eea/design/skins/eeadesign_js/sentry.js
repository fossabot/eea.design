$(function(){
    var sentry_dsn = $('body').data('sentry-dsn');
    if (sentry_dsn != null){
        Raven.config(sentry_dsn).install();
    }
})
