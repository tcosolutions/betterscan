# Start from the official Ubuntu latest image
FROM ubuntu:latest

# Arguments for non-interactive installation and setting timezone
ARG DEBIAN_FRONTEND=noninteractive
ENV CONTAINER_TIMEZONE=UTC
ENV TZ=${CONTAINER_TIMEZONE}
ENV SHELL /bin/bash

ENV QC_SETTTINGS=/srv/betterscan-ce/quantifiedcode/settings/default.yml

# Install dependencies
RUN apt-get update && apt-get install -y \
    python3 python3-pip python3-setuptools python3-venv libcurl4-nss-dev libssl-dev git sudo ssh rubygems npm php default-jdk pipenv rsync jo libpq-dev curl ruby-sass && \
    ln -snf /usr/share/zoneinfo/$CONTAINER_TIMEZONE /etc/localtime && \
    echo $CONTAINER_TIMEZONE > /etc/timezone

# Clone the checkmate-ce repository and install checkmate
RUN git clone -b checkmate3 https://github.com/tcosolutions/checkmate-ce && \
    cd /checkmate-ce && \
    python3 setup.py install

# Clone the betterscan-ce repository and set up the project
RUN mkdir -p /srv && \
    git clone https://github.com/tcosolutions/betterscan-ce /srv/betterscan-ce && \
    cd /srv/betterscan-ce && \
    pip install --upgrade pip && \
    pip install pipenv && \
    pipenv install --system --deploy && \
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
    sudo -u user make

# Final working directory
WORKDIR /srv/betterscan-ce/quantifiedcode/frontend
