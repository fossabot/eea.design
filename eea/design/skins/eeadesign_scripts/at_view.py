## Script (Python) "subscriber_account"
##bind container=container
##bind context=context
##bind script=script
##bind subpath=traverse_subpath
##title=View pdf in browser, used in pdf viewer
##

file = context.getFile()
filename = context.getFilename()

req = context.REQUEST
resp = req.RESPONSE

resp.setHeader('Filename', filename)
resp.setHeader('Content-Disposition', 'inline; filename="%s"' % filename)

if 'isFirstRequest' in req.form.keys():
    return resp

resp.setHeader('Content-Type', 'application/pdf')
return file