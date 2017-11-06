import os
from Products.Five import BrowserView

class SentryDSN(BrowserView):
    """ return sentry DSN env variable """

    def __call__(self):
        if self.request.HTTP_HOST in ['www.eea.europa.eu',
                                      'eea.europa.eu']:
            return os.environ.get('PROD_SENTRY_DSN')
        elif self.request.HTTP_HOST in ['staging.eea.europa.eu']:
            return os.environ.get('STAGING_SENTRY_DSN')
        else:
            return os.environ.get('DEVEL_SENTRY_DSN')
