FROM python:3.8-slim AS builder

ARG DEBIAN_FRONTEND=noninteractive
ENV SHELL=/bin/bash
ENV PIPENV_IGNORE_VIRTUALENVS=1
ENV PIP_ROOT_USER_ACTION=ignore
ENV GO_VERSION=1.23.0

RUN apt-get update && apt-get install -y ca-certificates curl tar libssl-dev git ssh rubygems python3-pip pipenv unzip jq gcc build-essential


# Detect architecture and set GO_ARCH accordingly
RUN ARCH=$(dpkg --print-architecture) && \
    if [ "$ARCH" = "amd64" ]; then \
        GO_ARCH="amd64"; \
    elif [ "$ARCH" = "arm64" ]; then \
        GO_ARCH="arm64"; \
    elif [ "$ARCH" = "armhf" ]; then \
        GO_ARCH="armv6l"; \
    else \
        echo "Unsupported architecture: $ARCH"; exit 1; \
    fi && \
    curl -fsSL "https://dl.google.com/go/go${GO_VERSION}.linux-${GO_ARCH}.tar.gz" -o go.tar.gz && \
    tar -C /usr/local -xzf go.tar.gz && \
    rm go.tar.gz

# Set up Go environment variables
ENV PATH=$PATH:/usr/local/go/bin

# Install Ruby and npm packages
RUN gem install brakeman 

RUN pip install --upgrade pip && pip install checkmate2

# Clone and install other repositories
RUN git clone https://github.com/tcosolutions/betterscan.git /srv/betterscan && \
    git clone https://github.com/tcosolutions/graudit-ce.git /root/graudit && \
    git clone https://github.com/tcosolutions/text4shell-ce.git /root/text4shell-ce

# Set up additional tools
RUN cp /srv/betterscan/analyzers/find_unicode_control2.py /usr/local/bin/ && \
    go install honnef.co/go/tools/cmd/staticcheck@latest && \
    go install github.com/tcosolutions/ptpt@latest && \
    cp /root/go/bin/staticcheck /usr/local/bin/staticcheck && \
    curl https://raw.githubusercontent.com/aquasecurity/tfsec/master/scripts/install_linux.sh | bash && \
    curl https://raw.githubusercontent.com/armosec/kubescape/master/install.sh | bash



