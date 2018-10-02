## Script (Python) "eea-custom-search"
##bind container=container
##bind context=context
##bind namespace=
##bind script=script
##bind subpath=traverse_subpath
##parameters=REQUEST=None
##title=
##
if not REQUEST:
    REQUEST = context.REQUEST

source = REQUEST.form.get("source", "")
if source:
    return REQUEST.RESPONSE.redirect("http://search.apps.eea.europa.eu?source=%s" % source)

q = REQUEST.form.get("q", "")
return REQUEST.RESPONSE.redirect("http://search.apps.eea.europa.eu?q=%s" % q)
