# Start from the official Python slim image
FROM python:3.8-slim

# Arguments for non-interactive installation and setting timezone
ARG DEBIAN_FRONTEND=noninteractive
ENV SHELL /bin/bash

ENV QC_SETTTINGS=/srv/betterscan-ce/quantifiedcode/settings/default.yml


# Install dependencies and set up Python environment
RUN apt-get update && apt-get install -y \
    libssl-dev git sudo ssh rubygems python3-pip \
    npm php default-jdk pipenv rsync jo libpq-dev curl ruby-sass && \

RUN git clone -b checkmate3 https://github.com/tcosolutions/checkmate-ce && \
    cd checkmate-ce && \
    pip install --upgrade pip && \
    pip install virtualenv && \
    virtualenv venv && \
    . venv/bin/activate && \
    pipenv install

# Clone repositories and set up projects
RUN mkdir -p /srv && \
    git clone https://github.com/tcosolutions/betterscan-ce && \
    cd /srv/betterscan-ce && \
    pip install virtualenv && \
    virtualenv venv && \
    . venv/bin/activate && \
    pipenv install
    curl -sL https://deb.nodesource.com/setup_14.x | sudo -E bash - && \
    apt-get install -y nodejs && \
    npm install && \
    chmod -R ugo+rw /srv/betterscan-ce/quantifiedcode/frontend && \
    useradd -m user && \
    cd /srv/betterscan-ce/quantifiedcode/frontend && \
    sudo -u user make && \
    cd /srv/betterscan-ce/quantifiedcode/plugins/git/frontend && \
    sudo -u user make && \


# Final working directory
WORKDIR /srv/betterscan-ce/quantifiedcode/frontend
