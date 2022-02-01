import re

def get_file_content_by_sha(project, sha, error_handling="ignore"):
    try:
        binary_content = project.git.repository.get_file_content_by_sha(sha)
        #file_coding_regex = re.compile(b"^[^\n]*\n?[^\n]*coding[:=]\s*([-\w.]+)")
        file_coding = "utf-8"  # per PEP 3120
        #file_coding_match = file_coding_regex.match(binary_content)
        #if file_coding_match:
         #   file_coding = file_coding_match.group(1).decode("ascii")
        return binary_content.decode(file_coding, error_handling)
    except BaseException as be:
        raise IOError(str(be))
