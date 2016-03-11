""" Controllers
"""

from Acquisition import aq_inner
from DateTime import DateTime
from Products.CMFCore.utils import getToolByName
from Products.Five import BrowserView
from eea.promotion.interfaces import IPromotion
from eea.themecentre.themecentre import getTheme
from plone.app.blob.interfaces import IBlobWrapper
from zope.component import queryMultiAdapter
from eea.versions.interfaces import IGetVersions
import logging
from itertools import chain


logger = logging.getLogger("eea.design.browser.frontpage")


class Frontpage(BrowserView):
    """ Front page
    """

    def __init__(self, context, request):
        BrowserView.__init__(self, context, request)

        self.catalog = getToolByName(context, 'portal_catalog')
        portal_properties = getToolByName(context, 'portal_properties')
        frontpage_properties = getattr(portal_properties,
                                                'frontpage_properties')

        self.promotions = []
        self.portal_url = getToolByName(aq_inner(context), 'portal_url')()

        self.noOfHigh = frontpage_properties.getProperty('noOfHigh', 3)
        self.noOfMedium = frontpage_properties.getProperty('noOfMedium', 4)
        self.noOfLow = frontpage_properties.getProperty('noOfLow', 10)
        self.noOfArticles = frontpage_properties.getProperty('noOfArticles', 6)
        self.noOfNews = frontpage_properties.getProperty('noOfNews', 6)
        self.noOfMultimedia = frontpage_properties.getProperty(
                                                           'noOfMultimedia', 6)
        self.noOfAnimations = frontpage_properties.getProperty(
                                                           'noOfAnimations', 6)
        self.noOfPublications = frontpage_properties.getProperty(
                                                         'noOfPublications', 6)
        self.noOfPromotions = frontpage_properties.getProperty(
                                                           'noOfPromotions', 7)
        self.noOfEachProduct = frontpage_properties.getProperty(
                                                          'noOfEachProduct', 3)
        self.noOfLatestDefault = frontpage_properties.getProperty(
                                                        'noOfLatestDefault', 6)
        self.effectiveDateMonthsAgo = frontpage_properties.getProperty(
                                                'effectiveDateMonthsAgo', 18)
        self.now = DateTime()


    def getNews(self, language=None):
        """ retrieves latest news by date and by topic """
        visibilityLevel = ['top', 'middle', 'low', '']
        items = _getItems(self, visibilityLevel=visibilityLevel,
                portaltypes=('Highlight', 'PressRelease'),
                noOfItems=self.noOfNews, language=language)
        return items

    def getArticles(self, portaltypes="Article", language=None):
        """ retrieves latest articles by date and by topic """
        return _getItems(self,
                portaltypes=portaltypes, noOfItems=self.noOfArticles,
                language=language)

    def getNewsAndArticles(self, language=None):
        """ retrieves latest news and articles by date and by topic """
        news = self.getNews(language=language)
        articles = self.getArticles(language=None)
        news.extend(articles)
        sorted_news = sorted(news, key=lambda obj: (obj.effective, obj.Title),
                             reverse=True)
        return sorted_news

    def getPublications(self, portaltypes="Report", language=None):
        """ retrieves latest publications by date and by topic """
        return _getItems(self, portaltypes=portaltypes,
                               noOfItems=self.noOfPublications,
                               language=language)

    def getInfographics(self, portaltypes="Infographic", language=None):
        """ retrieves latest Infographics by date and by topic """
        return _getItems(self,
                         portaltypes=portaltypes, noOfItems=self.noOfMedium,
                         language=language)

    def getAllProducts(self, no_sort=False, language=None):
        """ retrieves all latest published products for frontpage """
        if language and language != 'en':
            return self.getAllProductsForTranslations(no_sort=no_sort,
                                                      language=language)
        else:
            portaltypes = ('Report', 'Article', 'Highlight', 'PressRelease',
                                        'Assessment', 'Data', 'EEAFigure')
            result = []
            for mytype in portaltypes:
                res1 = _getItems(self, portaltypes=mytype,
                                 noOfItems=self.noOfEachProduct,
                                 language=language)
                result.extend(res1)
            multimedia = self.getMultimedia(language=language)
            result.extend(multimedia[:self.noOfEachProduct])

            # resort based on effective date
            if not no_sort:
                result.sort(key=lambda x: x.effective)
                result.reverse()

            return result

    def getAllProductsForTranslations(self, no_sort=False, language=None):
        """ retrieves all latest published products for frontpage of
            translations
        """
        datamaps_view = self.context.restrictedTraverse('data_and_maps_logic')
        news = self.getNews(language=language)[:self.noOfMedium]
        articles = self.getArticles(language=language)[:self.noOfMedium]
        publications = self.getPublications(
            language=language)[:self.noOfMedium]
        multimedia = self.getMultimedia(
            language=language)[:self.noOfMedium]
        datamaps = datamaps_view.getAllProducts(
            language=language)
        infographics = self.getInfographics(language=language)[:self.noOfMedium]
        result = []
        result.extend(chain(news, articles, publications, multimedia, datamaps,
                            infographics))
        # resort based on effective date
        if not no_sort:
            result.sort(key=lambda x: x.effective)
            result.reverse()

        return result



    def getHighArticles(self):
        """ return a defined number of high visibility articles items """
        return _getHighArticles(self, noOfItems=self.noOfHigh)

    def getSpotlight(self):
        """ retrieves promoted item that has the spotlight promotion
        assigned
        """
        query = {
            'object_provides': {
              'query': [
              'eea.promotion.interfaces.IPromoted',
              'Products.EEAContentTypes.content.interfaces.IExternalPromotion',
              ],
              'operator': 'or',
            },
            'review_state': 'published',
            'sort_on': 'effective',
            'sort_order': 'reverse'
        }

        result = self.catalog(query)
        spotlight = []
        for brain in result:
            obj = brain.getObject()
            promo = IPromotion(obj)
            if not promo.display_in_spotlight:
                continue
            if not promo.active:
                continue
            spotlight.append(brain)
            break
        return spotlight

    def getPromotions(self):
        """ Promotions
        """
        result = _getPromotions(self, noOfItems=self.noOfPromotions)
        return result

    def getMultimedia(self, language=None):
        """ retrieves multimedia objects (videos/animations etc..)
        filtered by date and by topic """
        interface = 'eea.mediacentre.interfaces.IVideo'
        result = _getItems(self,
                    interfaces=interface,
                    noOfItems=self.noOfMultimedia,
                    language=language)

        return result

    def getImageUrl(self, brain):
        """ public method for frontpage calling _getImageUrl """
        return _getImageUrl(brain)

    def _getTeaserMedia(self, high, scale):
        """ teaser media utility method """
        obj = high.getObject()
        media = obj.getMedia()
        media_url = media_type = media_title = media_copy = media_note = ''
        if media:
            if IBlobWrapper.providedBy(media):
                media_url = obj.absolute_url() + '/image'
            else:
                media_url = media.absolute_url()

            if obj.absolute_url() in media_url:
                # image in image field
                media_type = 'Image'
                media_title = obj.getImageCaption()
                media_copy = obj.getImageCopyright()
                media_note = obj.getImageNote()
            else:
                # reference to an Image or FlashFile
                media_type = media.portal_type
                media_title = media.Title()
                media_copy = media.Rights()
                media_note = media.Description()

        adapter = queryMultiAdapter((obj, self.request), name=u'themes-object',
                                                                default=None)
        themes = []
        if adapter is not None:
            themes = adapter.short_items()
        result = {
            'id': high['id'],
            'getUrl': high.get('getUrl', high.getURL()),
            'getNewsTitle': high['getNewsTitle'],
            'getTeaser': high['getTeaser'],
            'effective': high['effective'],
            'expires': high['expires'],
            'getVisibilityLevel': high['getVisibilityLevel'],
            'themes': themes,
        }

        if media is not None:
            result['media'] = {
                    'absolute_url' : media_url,
                    'portal_type'  : media_type,
                    'Title'        : media_title,
                    'Rights'       : media_copy,
                    'Description'  : media_note,
                    'getScale'     : ''
                }
            if IBlobWrapper.providedBy(media):
                result['media']['getScale'] = obj.getField('image').tag(
                                                            obj, scale=scale)

        return result

## Utility functions

def _getPromotions(self, noOfItems=6):
    """ utility function to retrieve external and internal promotions """
    query = {
        'object_provides': {
            'query': [
              'eea.promotion.interfaces.IPromoted',
              'Products.EEAContentTypes.content.interfaces.IExternalPromotion',
            ],
            'operator': 'or',
        },
        'review_state': 'published',
        'sort_on': 'effective',
        'sort_order' : 'reverse'
    }

    context = self.context.aq_inner
    themes = getTheme(context)
    if themes:
        query['getThemes'] = themes
    result = self.catalog(query)
    cPromos = []
    for brain in result:
        obj = brain.getObject()
        promo = IPromotion(obj)

        if themes:
            if not promo.display_on_themepage:
                continue
        if hasattr(context, 'layout') and \
                                    context.layout == 'frontpage_view':
            if not promo.display_on_frontpage:
                continue
        if not promo.active:
            continue

        promo_versionIds = [b.getVersionId for b in cPromos]
        # Add to promo list if we do not already have a newer version of this
        # versionId in the promo list
        if not brain.getVersionId in promo_versionIds:
            cPromos.append(brain)
        if len(cPromos) == noOfItems:
            break
    return cPromos

def _getHighArticles(self, noOfItems=1):
    """ utility function to return a defined number of high visibility
    articles items
    """
    visibilityLevel = ['top']
    return _getItems(self, visibilityLevel=visibilityLevel,
                        portaltypes='Article', noOfItems=noOfItems)


def queryEffectiveRange(self, query):
    """ Modify query in order to list items no longer than 1 year ago
    """
    date_range = {
        'query': (
            self.now - (self.effectiveDateMonthsAgo * 30),
            self.now,
        ),
        'range': 'min:max',
    }
    query['effective'] = date_range
    return query

def _getItemsWithVisibility(self, visibilityLevel=None, portaltypes=None,
                            interfaces=None, topic=None, noOfItems=None,
                            language=None):
    """ retrieves items of certain content types and/or interface
    and certain visibility level.
    """
    # for tests we need to give an int value if noOfItems remains none
    noOfItems = noOfItems or 6
    query = {
            'review_state'       : 'published',
            'sort_on'            : 'effective',
            'sort_order'         : 'reverse',
            }

    if getattr(self.context, 'getLanguage', None):
        query['Language'] = self.context.getLanguage()
    if language:
        query['Language'] = language
    if portaltypes:
        query['portal_type'] = portaltypes
    if visibilityLevel:
        query['getVisibilityLevel'] = visibilityLevel
    if interfaces:
        query['object_provides'] = interfaces
    if topic:
        query['getThemes'] = topic
    query = queryEffectiveRange(self, query)
    res = self.catalog.searchResults(query)
    filtered_res = filterLatestVersion(self, brains=res,
                                                noOfItems=noOfItems)
    return filtered_res

def _getTopics(self, topic=None, portaltypes=None, object_provides=None,
               tags=None, noOfItems=None, language=None):
    """ retrieves items of certain content types and/or interface and
    certain visibility level, with the addition of topic filtering """
    noOfItems = noOfItems or 8
    query = {
        'review_state'   : 'published',
        'sort_on'        : 'effective',
        'sort_order'     : 'reverse',
        }
    if getattr(self.context, 'getLanguage', None):
        query['Language'] = self.context.getLanguage()
    if language:
        query['Language'] = language
    if portaltypes:
        query['portal_type'] = portaltypes
    if object_provides:
        query['object_provides'] = object_provides
    if topic:
        query['getThemes'] = topic
    if tags:
        query['Subject'] = tags
    query = queryEffectiveRange(self, query)
    res = self.catalog(query)
    filtered_res = filterLatestVersion(self, brains=res,
                                                     noOfItems=noOfItems)
    return filtered_res


def _getItems(self, visibilityLevel=None, portaltypes=None, interfaces=None,
                                        noOfItems=6, language=None):
    """ generic internal method for getting items from catalog
    (via portaltypes or via interfaces) filtered by topic or not.
    """
    visibilityLevel = visibilityLevel or ''
    result = []
    #if topic is not passed in the REQUEST variable
    #then we try to get it from the context object
    topic = getattr(self.context.REQUEST, 'topic', None)
    tags = getattr(self.context.REQUEST, 'tags', None)
    topic_request = getTheme(self.context.aq_inner)
    if topic or topic_request:
        topic = topic if topic else topic_request

    if portaltypes:
        #if there is a topic/theme tag then get items filtered
        if topic:
            result = _getTopics(self, portaltypes=portaltypes,
                                      topic=topic,
                                      noOfItems=noOfItems,
                                      language=language)
        elif tags:
            result = _getTopics(self, portaltypes=portaltypes,
                                            tags=tags,
                                            noOfItems=noOfItems,
                                            language=language)
        else:
            result = _getItemsWithVisibility(self,
                                            visibilityLevel=visibilityLevel,
                                            portaltypes=portaltypes,
                                            noOfItems=noOfItems,
                                            language=language)
    elif interfaces:
        #if there is a topic/theme tag then get items filtered
        if topic:
            result = _getTopics(self, object_provides=interfaces,
                                      topic=topic,
                                      noOfItems=noOfItems,
                                      language=language)
        elif tags:
            result = _getTopics(self, object_provides=interfaces,
                                      tags=tags,
                                      noOfItems=noOfItems,
                                      language=language)
        else:
            result = _getItemsWithVisibility(self,
                                            visibilityLevel=visibilityLevel,
                                            interfaces=interfaces,
                                            noOfItems=noOfItems,
                                            language=language)
    return result


def _getImageUrl(brain):
    """ #5247 use url of parent image if promoted item doesn't have an image
    and the parent has one
    """
    obj = brain.getObject()
    url = ""
    if brain.is_default_page and \
        'Products.ATContentTypes.interfaces.image.IImageContent' \
        not in brain.object_provides:
        parent = obj.aq_parent

        here = '/'.join(parent.getPhysicalPath())
        res = obj.portal_catalog.queryCatalog(
                {
                    'portal_type':'Image',
                    'path': {
                        'query':here,
                        'depth':1,
                        },
                    'sort_on': 'getObjPositionInParent'
                    }
                )
        if res:
            url = parent.absolute_url()
    return url


def filterLatestVersion(self, brains, noOfItems=6):
    """ Take a list of catalog brains
    and return only the first noOfItems
    which are either latest versions or not versioned.
    """
    cat = getToolByName(self.context, 'portal_catalog')
    res = []
    res_urls_set = set()
    for brain in brains:
        # if object implements our versioning
        if 'eea.versions.interfaces.IVersionEnhanced' in brain.object_provides:
            obj = brain.getObject()
            versionsObj = IGetVersions(obj)
            brain_url = brain.getURL()
            try:
                is_latest = versionsObj.isLatest()
            except Exception:
                logger.warning("Couldn't check if object at %s is latest obj",
                               brain_url)
                continue
            if is_latest:
                # keep it, this is latest object, first checking if the current
                # brain url is not already added within our results url set
                if brain_url not in res_urls_set:
                    res_urls_set.add(brain_url)
                    res.append(brain)
            else:
                # attempt to retrieve the latest versions of the given brain
                # if this brains doesn't contain the latest version of the
                # object
                latest = versionsObj.latest_version()
                uid = latest.UID()
                results = cat.searchResults(UID=uid)
                if not results:
                    logger.warning("Couldn't find catalog entry for UID %s",
                                    uid)
                else:
                    brain = cat.searchResults(UID=uid)[0]
                    brain_url = brain.getURL()
                    if brain_url not in res_urls_set:
                        res_urls_set.add(brain_url)
                        res.append(brain)
        else:
            #this object is not versioned, so keep it
            brain_url = brain.getURL()
            if brain_url not in res_urls_set:
                res_urls_set.add(brain_url)
                res.append(brain)

        if len(res) == noOfItems:
            break  #we got enough items
    # because of performance optimization ticket and #14008
    # resort based on effective date since getting the latest version could
    # mess up the sorting that came from the catalog search
    res.sort(key=lambda x: x.effective)
    res.reverse()
    return res
