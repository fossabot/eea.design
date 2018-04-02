## Script (Python) "subscriber_account"
##bind container=container
##bind context=context
##bind script=script
##bind subpath=traverse_subpath
##title=Condition for checking if the file is a pdf before loading the viewer
##
if hasattr(context, 'getFile'):
    file = context.getFile()
else:
    file = context.file
return file.getContentType() in ['application/pdf']
