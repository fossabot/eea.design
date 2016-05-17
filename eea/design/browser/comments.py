""" Override comments viewlet
"""
from Acquisition import aq_inner
from Products.CMFCore.utils import getToolByName
from Products.Five.browser.pagetemplatefile import ViewPageTemplateFile
from plone.app.discussion.interfaces import IConversation
from plone.app.discussion.browser.comments import CommentsViewlet
from plone.app.layout.viewlets.common import ViewletBase


class EEACommentsViewlet(CommentsViewlet):
    """EEA specific comments viewlet"""
    index = ViewPageTemplateFile('templates/comments.pt')

    def get_replies(self, workflow_actions=False):
        """Returns all replies to a content object.

        If workflow_actions is false, comments are returned without workflow
        actions.

        If workflow actions is true, comments are returned with workflow
        actions.
        """
        context = aq_inner(self.context)
        conversation = IConversation(context, None)

        if conversation is None:
            return iter([])

        wf = getToolByName(context, 'portal_workflow')
        pm = getToolByName(context, 'portal_membership')

        # workflow_actions is only true when user
        # has 'Manage portal' permission

        def replies_with_workflow_actions():
            # Generator that returns replies dict with workflow actions
            for r in conversation.getThreads():
                comment_obj = r['comment']
                # list all possible workflow actions
                actions = [
                    a for a in wf.listActionInfos(object=comment_obj)
                    if a['category'] == 'workflow' and a['allowed']
                ]
                r = r.copy()
                r['actions'] = actions
                yield r

        def published_replies():
            # Generator that returns replies dict with workflow status.
            for r in conversation.getThreads():
                comment_obj = r['comment']
                workflow_status = wf.getInfoFor(comment_obj, 'review_state')
                if pm.checkPermission('View', comment_obj):
                    r = r.copy()
                    r['workflow_status'] = workflow_status
                    yield r

        # Return all direct replies
        if len(conversation.objectIds()):
            if workflow_actions:
                return replies_with_workflow_actions()
            else:
                return published_replies()


class EEAGoToCommentsViewlet(CommentsViewlet):
    """Viewlet with comments section link"""
    index = ViewPageTemplateFile('templates/goto_comments.pt')

    def update(self):
        """override to disable form processing
        """
        return ViewletBase.update(self)
