## Script (Python) "subscriber_account"
##bind container=container
##bind context=context
##bind script=script
##bind subpath=traverse_subpath
##title=View pdf in browser, used in pdf viewer
##
if traverse_subpath:
    field = context.getWrappedField(traverse_subpath[0])
else:
    field = context.getPrimaryField()

req = context.REQUEST
resp = req.RESPONSE

checkPermission = getattr(field, 'checkPermission', lambda r, c: True)
if not checkPermission('r', context):
    from AccessControl import Unauthorized
    raise Unauthorized(field)

if getattr(field, 'getAccessor', None):
    filename = context.getId()
    resp.setHeader('Filename', filename)
    resp.setHeader('Content-Type', 'application/pdf')
    resp.setHeader('Content-Disposition', 'inline; filename="%s"' % filename)
    return field.getAccessor(context)()

return ""
