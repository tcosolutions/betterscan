# -*- coding: utf-8 -*-

"""

    Contains form used to create or update projects.

"""

from __future__ import unicode_literals
from __future__ import print_function

from wtforms import Form, BooleanField, SelectField, TextAreaField, StringField, IntegerField, FieldList, validators, ValidationError
from .validators import validate_tags

class IssueClassForm(Form):

    def __init__(self, languages, analyzers, categories, *args, **kwargs):
        super(IssueClassForm, self).__init__(*args, **kwargs)
        self.languages = languages
        self.analyzers = analyzers
        self.categories = categories

    query = StringField(u"Query", [validators.Optional()])
    project_id = StringField(u"Project ID",[validators.Optional()])
    severity = StringField(u"Severity",[])
    categories = StringField(u"Categories",[validators.Optional()])
    language = StringField(u"Language",[validators.Optional()])
    analyzer = StringField(u"Analyzer",[validators.Optional()])
    sort = SelectField(u"Sort Field", choices=[("title","title"),("created_at","creation date"),("updated_at","update date"),("severity","severity")],validators=[validators.Optional()], default="title")
    direction = SelectField(u"Sort Direction", choices=[("desc","descending"),("asc","ascending"),],validators=[validators.Optional()], default="asc")
    type = SelectField(u"Type", choices=[("enabled","enabled"),("disabled","disabled"),("all","all")],validators=[validators.Optional()], default="all")
    limit = IntegerField(u"Limit", validators=[validators.NumberRange(min=1,max=100),validators.Optional()],default=20)
    offset = IntegerField(u"Offset", validators=[validators.NumberRange(min=0), validators.Optional()],default=0)

    def validate_severity(self, field):
        values = set()
        for value in field.raw_data:
            try:
                ivalue = int(value)
                if not 0 <= ivalue <= 4:
                    raise ValidationError("Severity must be between 0-4!")
                values.add(ivalue)
            except ValueError:
                raise ValidationError("Invalid integer!")
        field.data = list(values)

    def validate_categories(self, field):
        field.data = [l.lower() for l in set(field.raw_data)]
        for entry in field.data:
            if not entry in self.categories:
                raise ValidationError(u"Invalid category: {}".formt(entry))

    def validate_language(self, field):
        field.data = [l.lower() for l in set(field.raw_data)]
        for entry in field.data:
            if not entry in self.languages:
                raise ValidationError(u"Invalid language: {}".formt(entry))


    def validate_analyzer(self, field):
        field.data = [l.lower() for l in set(field.raw_data)]
        for entry in field.data:
            if not entry in self.analyzers:
                raise ValidationError(u"Invalid analyzer: {}".formt(entry))

    def validate_query(self, field):

        search_query = field.data

        if search_query:

            title_queries = []
            tag_queries = []

            for word in search_query.split():
                if word.startswith('tag:'):
                    tags = word[4:].split(';')
                    for tag in tags:
                        tag_queries.append({'$ilike': '%{}%'.format(tag)})
                else:
                    title_queries.append({'$ilike': '%{}%'.format(word)})

            search_dict = {
                'tag_queries' : tag_queries,
                'title_queries' : title_queries
            }

            field.data = search_dict
        else:
            field.data = {}
