# Start from the official Ubuntu 22.04 image
FROM ubuntu:22.04

# Arguments for non-interactive installation
ARG DEBIAN_FRONTEND=noninteractive
ENV SHELL=/bin/bash
ENV PIPENV_IGNORE_VIRTUALENVS=1
ENV PIP_ROOT_USER_ACTION=ignore

# Install basic dependencies and set up environment
RUN apt-get update && \
    apt-get install -y \
    ca-certificates \
    curl \
    tar \
    libssl-dev \
    git \
    ssh \
    rubygems \
    gnupg \
    software-properties-common \
    python3 \
    python3-pip \
    npm \
    pipenv \
    unzip \
    jq \
    gcc \
    rsync \
    sudo \
    build-essential \
    make

# Add deadsnakes PPA manually
RUN mkdir -p /etc/apt/keyrings && \
    curl -fsSL https://packages.sury.org/php/apt.gpg | tee /etc/apt/keyrings/php-archive.gpg && \
    echo "deb [signed-by=/etc/apt/keyrings/php-archive.gpg] http://ppa.launchpad.net/deadsnakes/ppa/ubuntu focal main" | tee /etc/apt/sources.list.d/deadsnakes-ubuntu-ppa.list && \
    apt-get update && \
    apt-get install -y python3.8 python3.8-distutils python3-pip

# Set Python 3.8 as default
RUN update-alternatives --install /usr/bin/python3 python3 /usr/bin/python3.8 1 && \
    update-alternatives --install /usr/bin/python python /usr/bin/python3.8 1 && \
    update-alternatives --install /usr/bin/pip pip /usr/bin/pip3 1

# Install Go
RUN GO=$(curl -s https://go.dev/dl/?mode=json) && \
    GO_LATEST=$(echo "$GO" | jq -r '.[0].version') && \
    ARCH=$(uname -m) && \
    case $ARCH in \
        x86_64) GO_ARCH="amd64" ;; \
        aarch64) GO_ARCH="arm64" ;; \
        armv7l) GO_ARCH="armv6l" ;; \
        *) echo "Unsupported architecture: $ARCH"; exit 1 ;; \
    esac && \
    GO_URL="https://dl.google.com/go/${GO_LATEST}.linux-${GO_ARCH}.tar.gz" && \
    curl -fsSL $GO_URL -o go.tar.gz && \
    tar -C /usr/local -xzf go.tar.gz && \
    rm go.tar.gz

# Set up Go environment variables
ENV PATH=$PATH:/usr/local/go/bin

# Install Ruby and npm packages
RUN gem install brakeman && \
    npm install -g jshint

# Clone the checkmate repository and install
RUN git clone -b checkmate3-cli https://github.com/tcosolutions/checkmate-ce.git /checkmate-ce && \
    cd /checkmate-ce && \
    pip install --upgrade pip && \
    pip install virtualenv && \
    virtualenv venv && \
    . venv/bin/activate && \
    pip install poetry && \
    pip install --no-cache-dir pyyaml && \
    poetry install

# Clone and install other repositories
RUN git clone https://github.com/tcosolutions/betterscan.git /srv/betterscan && \
    git clone https://github.com/tcosolutions/graudit-ce.git /root/graudit && \
    git clone https://github.com/tcosolutions/text4shell-ce.git /root/text4shell-ce

# Set up additional tools
RUN cp /srv/betterscan/analyzers/find_unicode_control2.py /usr/local/bin/ && \
    go install honnef.co/go/tools/cmd/staticcheck@latest && \
    cp /root/go/bin/staticcheck /usr/local/bin/staticcheck && \
    curl -fsSL https://raw.githubusercontent.com/aquasecurity/tfsec/master/scripts/install_linux.sh | bash && \
    curl -fsSL https://raw.githubusercontent.com/armosec/kubescape/master/install.sh | bash

# Final working directory
WORKDIR /root
