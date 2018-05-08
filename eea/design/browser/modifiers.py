""" Rdfmarshaller Modifiers module
"""
import surf
from Products.CMFCore.interfaces import IContentish
from eea.rdfmarshaller.interfaces import ISurfResourceModifier, \
    ILinkedDataHomepage
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
        """ run """
        context = self.context
        if not ILinkedDataHomepage.providedBy(context):
            return
        fview = context.restrictedTraverse('@@frontpage_highlights')
        ItemList = session.get_class(surf.ns.SCHEMA['ItemList'])
        ListElement = session.get_class(surf.ns.SCHEMA['ListItem'])
        ilist = ItemList("#itemList2")
        products = fview.getAllProducts()
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
