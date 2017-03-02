""" Redirect to glossary.eea.europa.eu
"""
from Products.Five.browser import BrowserView

GLOSSARY = u"http://glossary.{lang}.eea.europa.eu/terminology/sitesearch?term="


class Glossary(BrowserView):
    """ Glossary searcb
    """
    def __call__(self, *args, **kwargs):
        if not self.request.method.lower() == u"post":
            return self.request.response.redirect(self.context.absolute_url())

        lang = self.request.get(u'LANGUAGE', u'en')
        if len(lang) > 2:
            lang = u'en'

        term = self.request.get(u"term", u"")
        if not term:
            return self.request.response.redirect(self.context.absolute_url())

        if isinstance(term, str):
            term = term.decode('utf-8')

        url = GLOSSARY.format(lang=lang) + term
        self.request.response.redirect(url)
