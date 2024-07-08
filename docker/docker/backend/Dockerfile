ARG DEBIAN_FRONTEND=noninteractive
FROM python:3.8-slim

# Set timezone and environment variables
ENV CONTAINER_TIMEZONE=UTC
ENV TZ=${CONTAINER_TIMEZONE}

# Install dependencies and set up Python environment
RUN apt-get update && apt-get install -y \
    libcurl4-nss-dev libssl-dev git sudo ssh rubygems python3-pip \
    npm php default-jdk pipenv rsync jo libpq-dev curl ruby-sass && \
    ln -snf /usr/share/zoneinfo/$CONTAINER_TIMEZONE /etc/localtime && \
    echo $CONTAINER_TIMEZONE > /etc/timezone && \
    rm /usr/bin/python3 && \
    ln -s /usr/local/bin/python3.8 /usr/bin/python3 && \
    ln -s /usr/local/bin/python3.8 /usr/bin/python && \
    sudo ln -s /usr/share/pyshared/lsb_release.py /usr/local/lib/python3.8/site-packages/lsb_release.py

# Clone repositories and set up projects
RUN mkdir -p /srv && \
    git clone https://github.com/tcosolutions/betterscan-ce /srv/betterscan && \
    cd /srv/betterscan && \
    pip install pipenv && \
    pipenv install --python=/usr/local/bin/python3.8 --system && \
    python3.8 -m pip install pylint===1.9.2 stripe psycopg2 --upgrade && \
    ln -s /srv/betterscan/quantifiedcode/settings/default.yml /srv/betterscan/settings.yml && \
    git clone -b checkmate3 https://github.com/tcosolutions/checkmate-ce /checkmate && \
    cd /checkmate && \
    python3.8 setup.py install && \
    cd /srv/betterscan/quantifiedcode/frontend && \
    curl -sL https://deb.nodesource.com/setup_14.x | sudo -E bash - && \
    apt-get install -y nodejs && \
    npm install && \
    chmod -R ugo+rw /srv/betterscan/quantifiedcode/frontend && \
    useradd -m user && \
    sudo -u user make && \
    cd /srv/betterscan/quantifiedcode/plugins/git && \
    chmod -R ugo+rw /srv/betterscan/quantifiedcode/plugins/git && \
    cd /srv/betterscan/quantifiedcode/plugins/git/frontend && \
    sudo -u user make && \
    python3.8 -m pip install email_validator sqlalchemy===1.4.46 importlib_resources importlib_metadata


# Final working directory
WORKDIR /srv/betterscan/quantifiedcode/frontend
