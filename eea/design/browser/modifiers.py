""" Rdfmarshaller Modifiers module
"""
import surf
from Products.CMFCore.interfaces import IContentish
from Products.CMFCore.utils import getToolByName
from eea.rdfmarshaller.interfaces import ISurfResourceModifier
try:
    from eea.rdfmarshaller.interfaces import ILinkedDataHomepage
    has_linked_data = True
except ImportError:
    has_linked_data = False
from plone.app.layout.navigation.interfaces import INavigationRoot
from zope.component import adapts
from zope.interface import implements


class HomeLatestNewsModifier(object):
    """ Adds information about list of news as a carousel
    """
    implements(ISurfResourceModifier)
    adapts(IContentish)

    def __init__(self, context):
        self.context = context

    def run(self, resource, adapter, session, *args, **kwds):
        """ JSON-LD export of latest news within our homepage """
        context = self.context
        if not has_linked_data:
            return
        if not INavigationRoot.providedBy(context) and \
                not ILinkedDataHomepage.providedBy(context.aq_parent):
            return
        fview = context.restrictedTraverse('@@frontpage_highlights')
        ItemList = session.get_class(surf.ns.SCHEMA['ItemList'])
        ListElement = session.get_class(surf.ns.SCHEMA['ListItem'])
        ilist = ItemList("#itemList2")

        portal_properties = getToolByName(context, 'portal_properties')
        fp = getattr(portal_properties, 'frontpage_properties')
        # use news as latest news while keeping it flexible in case we want
        # other products promoted as latest news
        latest_category = fp.getProperty('getLatestNewsCategory', 'news')
        products = fview.getLatest(latest_category)
        position = 0
        for brain in products:
            url = brain.getURL()
            position += 1
            list_item = ListElement("LatestNewsListItem" + str(position))
            list_item.schema_position = position
            list_item.schema_url = url
            list_item.update()
            ilist.schema_itemListElement.append(list_item)
        ilist.update()
