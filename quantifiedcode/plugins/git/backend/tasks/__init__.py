# -*- coding: utf-8 -*-
"""
    Git Tasks and related files
"""

from .fetch import fetch_remote
from .analyze import analyze, update_project_statistics
from .auto_tag import auto_tag

hooks = [
    ("project.analyze.fetch", fetch_remote),
    ("project.analyze.analyze", auto_tag),#todo: move this to another plugin
    ("project.analyze.analyze", analyze),
    ("project.analyze.analyze", update_project_statistics),
]
