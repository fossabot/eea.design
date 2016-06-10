""" Browser controllers
"""
from Acquisition import aq_inner
from DateTime import DateTime
from Products.CMFCore.utils import getToolByName

from Products.Five import BrowserView

from eea.design.browser.frontpage import _getItems, _getImageUrl, Frontpage
from eea.promotion.interfaces import IPromotion

class DataMaps(Frontpage):
    """
    This browser view class has methods to get all the latest data and maps
    items globally or related to a specific topic.
    """

    def __init__(self, context, request):
        Frontpage.__init__(self, context, request)

        # noOfEachProduct is used when all latest products are merged together
        # we show equal number of each, so that none
        # products overshadow the others.
        self.getProducts = self.fp.getProperty('getDataProducts', [])
        self.noOfEachProduct = self.fp.getProperty(
            'noOfEachProduct', 3)
        self.effectiveDateMonthsAgo = self.fp.getProperty(
            'effectiveDateDataMonthsAgo', 18)

    def getLatestDatasets(self, language=None):
        """ Get latest published datasets. Number configurable via
        ZMI frontpage_properties.
        """
        if language == 'en':
            self.effectiveDateMonthsAgo = self.fp.getProperty(
                'getDatasetsAgo') or self.effectiveDateMonthsAgo
        else:
            self.effectiveDateMonthsAgo = self.fp.getProperty(
                'getDatasetsAgo-tr') or self.effectiveDateMonthsAgo
        interfaces = ('eea.dataservice.interfaces.IDataset')
        return _getItems(self,
                         interfaces=interfaces,
                         noOfItems=self.noOfLatestDefault,
                         language=language)

    def getLatestIndicators(self, language=None):
        """ Get latest published indicators. """
        if language == 'en':
            self.effectiveDateMonthsAgo = self.fp.getProperty(
                'getDatasetsAgo') or self.effectiveDateMonthsAgo
        else:
            self.effectiveDateMonthsAgo = self.fp.getProperty(
                'getDatasetsAgo-tr') or self.effectiveDateMonthsAgo
        interfaces = ('eea.indicators.content.interfaces.IIndicatorAssessment')
        return _getItems(self,
                         interfaces=interfaces,
                         noOfItems=self.noOfLatestDefault,
                         language=language)

    def getLatestMaps(self, language=None):
        """ Get latest published static maps. """
        if language == 'en':
            self.effectiveDateMonthsAgo = self.fp.getProperty(
                'getMapsAgo') or self.effectiveDateMonthsAgo
        else:
            self.effectiveDateMonthsAgo = self.fp.getProperty(
                'getMapsAgo-tr') or self.effectiveDateMonthsAgo
        interfaces = ('eea.dataservice.interfaces.IEEAFigureMap')
        return _getItems(self,
                         interfaces=interfaces,
                         noOfItems=self.noOfLatestDefault,
                         language=language)

    def getLatestGraphs(self, language=None):
        """ Get latest published static graphs/charts."""
        if language == 'en':
            self.effectiveDateMonthsAgo = self.fp.getProperty(
                'getGraphsAgo') or self.effectiveDateMonthsAgo
        else:
            self.effectiveDateMonthsAgo = self.fp.getProperty(
                'getGraphsAgo-tr') or self.effectiveDateMonthsAgo
        interfaces = ('eea.dataservice.interfaces.IEEAFigureGraph')
        return _getItems(self,
                         interfaces=interfaces,
                         noOfItems=self.noOfLatestDefault,
                         language=language)

    def getLatestInteractiveMaps(self, language=None):
        """ Get latest published interactive maps."""
        if language == 'en':
            self.effectiveDateMonthsAgo = self.fp.getProperty(
                'getInteractiveAgo') or self.effectiveDateMonthsAgo
        else:
            self.effectiveDateMonthsAgo = self.fp.getProperty(
                'getInteractiveAgo-tr') or self.effectiveDateMonthsAgo
        interfaces = (
            'Products.EEAContentTypes.content.interfaces.IInteractiveMap')
        return _getItems(self,
                         interfaces=interfaces,
                         noOfItems=self.noOfLatestDefault,
                         language=language)

    def getLatestInteractiveData(self, language=None):
        """ Get latest published interactive data charts."""
        if language == 'en':
            self.effectiveDateMonthsAgo = self.fp.getProperty(
                'getDataAgo') or self.effectiveDateMonthsAgo
        else:
            self.effectiveDateMonthsAgo = self.fp.getProperty(
                'getDataAgo-tr') or self.effectiveDateMonthsAgo
        interfaces = (
            'Products.EEAContentTypes.content.interfaces.IInteractiveData')
        return _getItems(self,
                         interfaces=interfaces,
                         noOfItems=self.noOfLatestDefault,
                         language=language)

    def getPromotions(self):
        """ Retrieves external and internal promotions for data and maps
            section
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

        noOfItems = 18
        result = self.catalog(query)
        datasets_interfaces = [
            'Products.EEAContentTypes.content.interfaces.IInteractiveMap',
            'Products.EEAContentTypes.content.interfaces.IInteractiveData',
            'eea.dataservice.interfaces.IEEAFigureGraph',
            'eea.dataservice.interfaces.IDataset',
            'eea.dataservice.interfaces.IEEAFigureMap',
            'eea.indicators.content.interfaces.IIndicatorAssessment']
        cPromos = []
        for brain in result:
            obj = brain.getObject()
            promo = IPromotion(obj)
            obj_interfaces = obj.restrictedTraverse('@@get_interfaces')()
            for i in datasets_interfaces:
                if i in obj_interfaces:
                    if not promo.display_on_datacentre:
                        continue
                    cPromos.append(brain)
                    if len(cPromos) == noOfItems:
                        break

        promotions = len(cPromos)
        if promotions >= 6:
            return cPromos
        else:
            cPromos.extend(self.getAllProducts())
            return list(set(cPromos))

