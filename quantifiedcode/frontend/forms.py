from flask_wtf import Form
from wtforms import StringField, TextAreaField
from wtforms.validators import DataRequired, optional, Email, length

class ContactForm(Form):
    name = StringField('name', validators=[optional(),length(max=32)])
    email = StringField('email', validators=[DataRequired(),Email()])
    message = TextAreaField('message', validators=[DataRequired(),length(max=500)])

class IssueClassSearchForm(Form):
    search = StringField('search', validators=[optional(),length(max=64)])
