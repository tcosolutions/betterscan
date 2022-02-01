def metricsuffix(value):
    """
    formats a number by adding metric suffixes
    """
    suffixes = ["", "k", "M", "G", "T", "E"]
    value = float(value)
    for suffix in suffixes:
        if value < 1000:
            break
        value /= 1000
    # only display a decimal place if there is just one leading digit
    number_format = "{0:.1f}" if value < 10 else "{0:.0f}"
    # do not display trailing ".0"
    number_str = number_format.format(value)
    if len(number_str) >= 3 and number_str[-2:] == ".0":
        number_str = number_str[:-2]
    return number_str + suffix
