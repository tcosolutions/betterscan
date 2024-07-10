ARG DEBIAN_FRONTEND=noninteractive
FROM python:3.8-slim

ENV QC_SETTTINGS=/srv/betterscan-ce/quantifiedcode/settings/default.yml

# Set timezone and environment variables
ENV CONTAINER_TIMEZONE=UTC
ENV TZ=${CONTAINER_TIMEZONE}

# Install dependencies and set up Python environment
RUN apt-get update && apt-get install -y \
    libcurl4-nss-dev libssl-dev git sudo ssh rubygems python3-pip \
    npm php default-jdk pipenv rsync jo libpq-dev curl ruby-sass && \
    ln -snf /usr/share/zoneinfo/$CONTAINER_TIMEZONE /etc/localtime && \
    echo $CONTAINER_TIMEZONE > /etc/timezone && \

# Clone repositories and set up projects
RUN mkdir -p /srv && \
    git clone https://github.com/tcosolutions/betterscan-ce && \
    cd /srv/betterscan-ce && \
    pip install --upgrade pip && \
    pip install pipenv && \
    pipenv install --system --deploy
    git clone -b checkmate3 https://github.com/tcosolutions/checkmate-ce && \
    cd /checkmate-ce && \
    python setup.py install && \
    cd /srv/betterscan-ce/quantifiedcode/frontend && \
    curl -sL https://deb.nodesource.com/setup_14.x | sudo -E bash - && \
    apt-get install -y nodejs && \
    npm install && \
    chmod -R ugo+rw /srv/betterscan-ce/quantifiedcode/frontend && \
    useradd -m user && \
    sudo -u user make && \
    cd /srv/betterscan-ce/quantifiedcode/plugins/git && \
    chmod -R ugo+rw /srv/betterscan-ce/quantifiedcode/plugins/git && \
    cd /srv/betterscan-ce/quantifiedcode/plugins/git/frontend && \
    sudo -u user make && \


# Final working directory
WORKDIR /srv/betterscan-ce/quantifiedcode/frontend
