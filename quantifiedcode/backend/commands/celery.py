import click

#we import the tasks module
import quantifiedcode.backend.tasks.all
from quantifiedcode.backend.worker import celery

@click.command("runworker")
def runworker():
    argv = [
        'worker',
        '--loglevel=INFO',
        '-B',
    ]
    celery.worker_main(argv)