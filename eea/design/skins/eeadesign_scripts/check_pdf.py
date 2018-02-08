## Script (Python) "subscriber_account"
##bind container=container
##bind context=context
##bind script=script
##bind subpath=traverse_subpath
##title=Condition for checking if the file is a pdf before loading the viewer
##
file = context.getFile()

if file.getContentType() not in ['application/pdf']:
    return 0
return 1