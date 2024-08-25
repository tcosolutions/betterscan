# Start from the official Python slim image
FROM python:3.8-slim


ARG DEBIAN_FRONTEND=noninteractiv
ENV SHELL=/bin/bash
ENV PIPENV_IGNORE_VIRTUALENVS=1
ENV PIP_ROOT_USER_ACTION=ignore
# Install basic dependencies and set up environment in one RUN command

# Install basic dependencies and set up environment in one RUN command
RUN apt-get update && apt-get install -y \
    ca-certificates \
    curl \
    tar \
    libssl-dev \
    git \
    ssh \
    rubygems \
    python3-pip \
    npm \
    pipenv \
    unzip \
    jq \
    gcc \
    rsync \
    sudo \
    build-essential 


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
    curl -O $GO_URL && \
    tar -C /usr/local -xzf ${GO_LATEST}.linux-${GO_ARCH}.tar.gz
    
# Set up Go environment variables
ENV PATH=$PATH:/usr/local/go/bin

# Install Ruby and npm packages
RUN gem install brakeman && \
    npm install -g jshint

# Clone the checkmate repository and install
RUN git clone -b checkmate3-cli https://github.com/tcosolutions/checkmate-ce.git /checkmate-ce && \
    cd /checkmate-ce && \
    pip install pip && \ 
    pip install virtualenv && \
    virtualenv venv && \
    . venv/bin/activate && \ 
    pip install poetry && \
    pip --no-cache-dir install pyyaml && \
    pip install pyyaml && \
    poetry install

# Clone and install other repositories
RUN git clone https://github.com/tcosolutions/betterscan.git /srv/betterscan && \
    git clone https://github.com/tcosolutions/graudit-ce.git /root/graudit && \
    git clone https://github.com/tcosolutions/text4shell-ce.git /root/text4shell-ce

# Set up additional tools
RUN cp /srv/betterscan/analyzers/find_unicode_control2.py /usr/local/bin/ && \
    go install honnef.co/go/tools/cmd/staticcheck@latest && \
    cp /root/go/bin/staticcheck /usr/local/bin/staticcheck && \
    curl -s https://raw.githubusercontent.com/aquasecurity/tfsec/master/scripts/install_linux.sh | bash && \
    curl -s https://raw.githubusercontent.com/armosec/kubescape/master/install.sh | bash

# Final working directory
WORKDIR /root
