""" Browser controllers
"""

from eea.design.browser.frontpage import Frontpage
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
        self.effectiveDateMonthsAgo = self.fp.getProperty(
            'effectiveDateDataMonthsAgo', 18)

    def getLatestIndicators(self):
        """ Backward compatibility method for themecentre """
        return self.getLatest('indicators')

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
        cPromos.extend(self.getAllProducts())
        return list(set(cPromos))
