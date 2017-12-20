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
if not field.checkPermission('r', context):
    from zExceptions import Unauthorized
    raise Unauthorized('Field %s requires %s permission' % (field, field.read_permission))

file = context.getFile()
filename = context.getFilename()

req = context.REQUEST
resp = req.RESPONSE

resp.headers['content-type'] = 'application/pdf'
resp.headers['content-disposition'] = 'inline; filename="%s"' % filename

return file
