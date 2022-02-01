from flask import Flask
from flask.helpers import send_from_directory
from werkzeug.exceptions import NotFound

class StaticFilesFlask(Flask):

    """
    Helper class to send static files from multiple directories (required for plugins)
    """

    def __init__(self, *args, **kwargs):
        super(StaticFilesFlask, self).__init__(*args, **kwargs)
        self.static_folders = []

    @property
    def all_static_folders(self):
        return [self.static_folder]+self.static_folders[:]

    def add_static_folder(self, folder):
        if not folder in self.static_folders:
            self.static_folders.append(folder)

    def send_static_file(self, filename):

        if not self.has_static_folder:
            raise RuntimeError('No static folder defined')

        cache_timeout = self.get_send_file_max_age(filename)
        folders = [self.static_folder]+self.static_folders

        for folder in folders:
            try:
                return send_from_directory(
                    folder, filename, cache_timeout=cache_timeout)
            except NotFound:
                pass

        raise NotFound()
