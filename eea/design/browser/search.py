""" Redirect to glossary.eea.europa.eu
"""
from Products.Five.browser import BrowserView

GLOSSARY = "http://glossary.{lang}.eea.europa.eu"
SEARCH = "/terminology/sitesearch?term="


class Glossary(BrowserView):
    """ Glossary searcb
    """
    def __call__(self, *args, **kwargs):
        lang = self.request.get("LANGUAGE", "en")
        if len(lang) > 2:
            lang = "en"

        url = GLOSSARY.format(lang=lang)
        term = self.request.get("term", "")
        if not term:
            return self.request.response.redirect(url)

        url += SEARCH
        if isinstance(term, unicode):
            term = term.encode('utf-8')

        url += term
        self.request.response.redirect(url)
