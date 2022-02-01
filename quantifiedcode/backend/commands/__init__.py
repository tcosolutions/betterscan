from .project import project
from .data_model import migrate_db
from .checkmate import checkmate
from .setup import setup
from .celery import runworker
from .server import runserver

#all commands in this variable will be included in manage.py
commands = [project, migrate_db, checkmate, setup, runworker, runserver]
