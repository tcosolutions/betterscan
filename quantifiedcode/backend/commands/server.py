from quantifiedcode.settings import settings
from quantifiedcode.app import get_app
import click

@click.command("runserver")
def runserver():

    app = get_app(settings)
    app.run(debug=settings.get('debug', False), host="0.0.0.0", threaded=False)

