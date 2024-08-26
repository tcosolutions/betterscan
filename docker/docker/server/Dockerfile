# Start from the official Ubuntu 20.04 image
FROM ubuntu:20.04

# Arguments for non-interactive installation
ARG DEBIAN_FRONTEND=noninteractive
ENV SHELL=/bin/bash

ENV QC_SETTTINGS=/srv/betterscan/quantifiedcode/settings/default.yml

# Install dependencies and set up Python environment
RUN apt-get update && \
    apt-get install -y \
    libssl-dev \
    git \
    python3 \
    python3-pip \
    npm \
    curl \
    ruby \
    sass \
    rsync \
    sudo \
    pipenv \
    make \
    build-essential

# Clone and set up Checkmate CE
RUN git clone -b checkmate3-cli https://github.com/tcosolutions/checkmate-ce && \
    cd checkmate-ce && \
    pip install --upgrade pip && \
    pip install poetry && \
    poetry install

# Clone repositories and set up projects
RUN mkdir -p /srv && \
    git clone https://github.com/tcosolutions/betterscan /srv/betterscan && \
    cd /srv/betterscan && \
    pip install --upgrade pip && \
    pip install virtualenv && \
    virtualenv venv && \
    . venv/bin/activate && \
    pipenv install && \
    pipenv --clear && \
    pipenv install pyyaml && \
    curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && \
    apt-get install -y nodejs && \
    cd /srv/betterscan/quantifiedcode/frontend && \
    sudo npm install -g bower && \
    npm install --save-dev @babel/core @babel/cli @babel/preset-env @babel/plugin-transform-parameters @babel/plugin-proposal-object-rest-spread @babel/plugin-transform-react-jsx @babel/plugin-transform-modules-amd babel-plugin-transform-remove-console && \
    npm install && \
    cd /srv/betterscan/quantifiedcode/frontend && \
    chmod -R ugo+rw /srv/betterscan/quantifiedcode/frontend && \
    make && \
    cd /srv/betterscan/quantifiedcode/plugins/git/frontend && \
    make
