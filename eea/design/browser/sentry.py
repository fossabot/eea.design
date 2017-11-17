import os
from Products.Five import BrowserView
import logging

log = logging.getLogger('SENTRY_DEBUG')


class SentryDSN(BrowserView):
    """ return sentry DSN env variable """

    def __call__(self):
        host = self.request._orig_env.get('HTTP_X_FORWARDED_HOST')
        if not host:
            # not behind varnish or no real request yet
            if '.eea.europa.eu' in self.request._orig_env.get('HTTP_HOST'):
                return os.environ.get('DEVEL_SENTRY_DSN')
            else:
                return None
        if host in ['www.eea.europa.eu',
                    'eea.europa.eu']:
            return os.environ.get('PROD_SENTRY_DSN')
        elif host in ['staging.eea.europa.eu']:
            return os.environ.get('STAGING_SENTRY_DSN')
        else:
            # This should not happen, but if it does, we want to catch it
            # so return the devel DSN
            log.info('Unexpected hostname, default devel DSN used')
            return os.environ.get('DEVEL_SENTRY_DSN')
