# Start from the official Python slim image
FROM python:3.8-slim

# Arguments for non-interactive installation and setting timezone
ARG DEBIAN_FRONTEND=noninteractive
ENV SHELL /bin/bash

ENV QC_SETTTINGS=/srv/betterscan-ce/quantifiedcode/settings/default.yml

# Install dependencies and set up Python environment
RUN apt-get update && apt-get install -y libssl-dev git sudo ssh python3-pip npm curl ruby-sass pipenv

RUN git clone -b checkmate3 https://github.com/tcosolutions/checkmate-ce && \
    cd checkmate-ce && \
    pip install --upgrade pip && \
    pip install poetry && \
    poetry install

# Clone repositories and set up projects
RUN mkdir -p /srv && \
    git clone https://github.com/tcosolutions/betterscan-ce /srv/betterscan-ce && \
    cd /srv/betterscan-ce && \
    pip install virtualenv && \
    virtualenv venv && \
    . venv/bin/activate && \
    pipenv install && \
    curl -fsSL https://deb.nodesource.com/setup_22.x -o nodesource_setup.sh | sudo -E bash - && \
    apt-get install -y nodejs && \
    cd  /srv/betterscan-ce/quantifiedcode/frontend   && \
    npm install && \
    cd /srv/betterscan-ce/quantifiedcode/frontend && \
    chmod -R ugo+rw /srv/betterscan-ce/quantifiedcode/frontend && \
    make && \
    cd /srv/betterscan-ce/quantifiedcode/plugins/git/frontend && \
    make && \

# Final working directory
WORKDIR /srv/betterscan-ce/quantifiedcode/frontend
