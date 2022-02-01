import os

from blitzdb.fields import (ForeignKeyField,
                            CharField,
                            BooleanField,
                            IntegerField,
                            ManyToManyField,
                            DateTimeField,
                            TextField)

from checkmate.lib.models import Project as BaseProject
from .issue_class import IssueClass
from .user import UserRole

class Project(BaseProject):

    class AnalysisPriority:
        low = 0
        medium = 1
        high = 2
        do_it_now_i_say_exclamation_mark = 3

    class AnalysisStatus:
        succeeded = 'succeeded'
        in_progress = 'in_progress'
        failed = 'failed'

    IssueClass = IssueClass

    delete = BooleanField(indexed=True, default=False)
    deleted = BooleanField(indexed=True, default=False)

    name = CharField(indexed=True, length=100)
    description = CharField(indexed=True, length=2000)
    public = BooleanField(indexed=True, default=False)
    permalink = CharField(indexed=True, unique=True, nullable=False, length=100)
    source = CharField(indexed=True, length=100, nullable=False)

    analyze = BooleanField(indexed=True, default=False)
    analysis_priority = IntegerField(default=AnalysisPriority.low, indexed=True)
    analysis_requested_at = DateTimeField(indexed=True)
    analysis_status = CharField(indexed=True, length=50)
    analyzed_at = DateTimeField(indexed=True)

    reset = BooleanField(indexed=True, default=False)
    reset_requested_at = DateTimeField(indexed=True)
    
    fetched_at = DateTimeField(indexed=True, nullable=True)
    fetch_status = CharField(indexed=True, nullable=True)
    fetch_error = TextField(default='')

    tags = ManyToManyField('Tag')
    

    def get_analysis_queue_position(self, backend=None):

        if backend is None:
            backend = self.backend

        analysis_priority_query = [{'analysis_priority': self.analysis_priority}]
        if self.analysis_requested_at is not None:
            analysis_priority_query += [{'analysis_requested_at': {'$lte': self.analysis_requested_at}}]
        # if the project is flagged for analysis we calculate its position in the analysis queue...
        if self.get('analyze', False) and self.get('analysis_priority', None) is not None:
            return len(backend.filter(
                self.__class__,
                {'$and': [
                    {'analyze': True},
                    {'pk': {'$ne': self.pk}},
                    {'$or': [{'deleted': {'$exists': False}}, {'deleted': False}]},
                    {'$or': [
                        {'analysis_priority': {'$gt': self.analysis_priority}},
                        {'$and': analysis_priority_query}
                    ]}
                ]})) + 1
            return None

    def is_authorized(self, user, roles=None, public_ok=False, backend=None):
        """
        Checks if a user is allowed to access a project.
        Returns True or False
        """
        if backend is None:
            backend = self.backend

        if roles is None:
            roles = ['admin', 'collaborator','owner']

        # super users can see everything
        if user.is_superuser():
            return True

        if public_ok and self.get("public"):
            return True

        # check if the user is authorized via a role
        user_roles = backend.filter(UserRole, {'project': self,
                                               'user': user,
                                               'role': {'$in': list(roles)}})

        if user_roles:
            return True

        return False
