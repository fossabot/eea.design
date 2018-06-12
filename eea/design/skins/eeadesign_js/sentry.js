$(function(){
    var sentry_dsn = $('body').data('sentry-dsn');
    var sentry_env = $('body').data('sentry-env');
    var sentry_ver = $('body').data('sentry-ver');
    if (sentry_dsn !== undefined){
        Raven.config(sentry_dsn, {
            logger: 'javascript',
            release: sentry_ver,
            environment: sentry_env,
            ignoreErrors: [
                'jQuery is not defined',
                 '$ is not defined',
                 'Can\'t find variable: jQuery',
                 'Socialite is not defined',
                 'Persistent storage maximum size reached'
            ]
        }).install();
    }
});
