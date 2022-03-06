# -*- coding: utf-8 -*-


from quantifiedcode.settings import settings

def get_file_content_by_sha(project, sha):

    for params in settings.providers['file_revision.content_by_sha']:
        #if not params['source'] == project.source:
        #    continue #this is not the right provider...
        file_content = params['provider'](project, sha)
        if file_content is not None:
            return file_content

    raise IOError("Cannot find a suitable provider to retrieve the file content!")
