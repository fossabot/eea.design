## Script (Python) "subscriber_account"
##bind container=container
##bind context=context
##bind script=script
##bind subpath=traverse_subpath
##title=Condition for checking if the file is a pdf before loading the viewer
##
file = context.getFile()

return file.getContentType() in ['application/pdf']
