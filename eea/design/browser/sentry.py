""" Sentry
"""
import os
import logging
from eventlet.green import urllib2
from contextlib import closing
from Products.Five import BrowserView
from eea.cache import cache

logger = logging.getLogger("eea.design")

RANCHER_METADATA = 'http://rancher-metadata/latest'
TIMEOUT = 15

class SentryDSN(BrowserView):
    """ return sentry DSN env variable
    """
    _environment = None

    @cache(lambda *args: "environment", lifetime=86400)
    def environment(self):
        """ Sentry environment
        """
        if not self._environment:
            self._environment = os.environ.get('ENVIRONMENT',
                                os.environ.get('SENTRY_ENVIRONMENT', ''))
            if not self._environment:
                url = RANCHER_METADATA + '/self/stack/environment_name'
                try:
                    with closing(urllib2.urlopen(url, timeout=TIMEOUT)) as con:
                        self._environment = con.read()
                except Exception as err:
                    logger.exception(err)
                    self._environment = 'devel'
        return self._environment

    def version(self):
        """ KGS version
        """
        return os.environ.get("EEA_KGS_VERSION", "")

    def __call__(self):
        return os.environ.get("SENTRY_DSN", "")
