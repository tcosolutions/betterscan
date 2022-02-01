from wtforms import Form, IntegerField, validators

class TaskLogForm(Form):

    from_chr = IntegerField(u"From character", default=0, validators=[validators.NumberRange(min=0)])
