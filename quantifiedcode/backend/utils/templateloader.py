# -*- coding: utf-8 -*-

"""
    Template loader for jinja templates.
"""

from os.path import join, getmtime, exists
from jinja2 import BaseLoader, TemplateNotFound

class TemplateLoader(BaseLoader):

    def __init__(self, paths):
        """
        :param paths: Should be a dictionary containing string keys (names) and string values (directories).
                      When searching for a template, the directories will be checked in the order of their key.
        """
        self.paths = paths

    def get_source(self, environment, template):
        for key, path in sorted(self.paths.items(), key=lambda x:x[0]):
            template_path = join(path, template)
            if not exists(template_path):
                continue
            mtime = getmtime(template_path)
            with open(template_path) as f:
                source = f.read().decode("utf-8")
            return source, template_path, lambda: mtime == getmtime(path)

        raise TemplateNotFound(template)
