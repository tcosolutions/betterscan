# Start from the official Python slim image
FROM python:3.8-slim

# Arguments for non-interactive installation and setting timezone
ARG DEBIAN_FRONTEND=noninteractive
ENV SHELL=/bin/bash

ENV QC_SETTTINGS=/srv/betterscan/quantifiedcode/settings/default.yml

# Install dependencies and set up Python environment
RUN apt-get update && apt-get install -y libssl-dev git python3-pip npm curl ruby-sass rsync sudo pipenv

RUN pip install checkmate3

# Clone repositories and set up projects
RUN mkdir -p /srv && \
    git clone https://github.com/tcosolutions/betterscan /srv/betterscan && \
    cd /srv/betterscan && \
    pip install pip && \
    pip install virtualenv && \
    virtualenv venv && \
    . venv/bin/activate && \
    pipenv install && \
    pipenv install pyyaml && \
    curl -fsSL https://deb.nodesource.com/setup_22.x -o nodesource_setup.sh | bash - && \
    apt-get install -y nodejs && \
    cd  /srv/betterscan/quantifiedcode/frontend   && \
    sudo npm install -g bower \ 
    npm install --save-dev @babel/core @babel/cli @babel/preset-env @babel/plugin-transform-parameters @babel/plugin-proposal-object-rest-spread @babel/plugin-transform-react-jsx @babel/plugin-transform-modules-amd babel-plugin-transform-remove-console \
    npm install \
    cd /srv/betterscan/quantifiedcode/frontend && \
    chmod -R ugo+rw /srv/betterscan/quantifiedcode/frontend && \
    make && \
    cd /srv/betterscan/quantifiedcode/plugins/git/frontend && \
    make
