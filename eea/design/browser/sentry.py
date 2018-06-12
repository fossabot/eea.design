""" Sentry
"""
import os
from Products.Five import BrowserView
import logging

logger = logging.getLogger("eea.design")


class SentryDSN(BrowserView):
    """ return sentry DSN env variable
    """
    def environment(self):
        """ Sentry environment
        """
        host = self.request._orig_env.get("HTTP_X_FORWARDED_HOST")
        if not host:
            return "devel"
        if host in ("www.eea.europa.eu", "eea.europa.eu"):
            return "production"
        elif host in ("staging.eea.europa.eu"):
            return "staging"
        else:
            logger.info("Unexpected hostname, default sentry env: devel")
            return "devel"

    def version(self):
        """ KGS version
        """
        return os.environ.get("EEA_KGS_VERSION", "")

    def __call__(self):
        return os.environ.get("SENTRY_DSN", "")
