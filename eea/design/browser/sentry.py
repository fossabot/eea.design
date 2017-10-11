import os
from Products.Five import BrowserView

class SentryDSN(BrowserView):
    """ return sentry DSN env variable """

    def __call__(self):
        return os.environ.get('SENTRY_DSN')
