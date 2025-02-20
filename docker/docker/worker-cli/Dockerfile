FROM python:3.12-slim AS builder

ARG DEBIAN_FRONTEND=noninteractive
ENV SHELL=/bin/bash
ENV PIPENV_IGNORE_VIRTUALENVS=1
ENV PIP_ROOT_USER_ACTION=ignore


RUN apt-get update && apt-get install -y ca-certificates curl tar libssl-dev git ssh rubygems python3-pip pipenv unzip jq gcc build-essential


# Install Go
RUN GO_JSON=$(curl -s https://go.dev/dl/?mode=json) && \
    GO_LATEST=$(echo "$GO_JSON" | jq -r '.[0].version') && \
    ARCH=$(uname -m) && \
    case $ARCH in \
        x86_64) GO_ARCH="amd64" ;; \
        aarch64) GO_ARCH="arm64" ;; \
        armv7l) GO_ARCH="armv6l" ;; \
        *) echo "Unsupported architecture: $ARCH"; exit 1 ;; \
    esac && \
    GO_URL="https://dl.google.com/go/${GO_LATEST}.linux-${GO_ARCH}.tar.gz" && \
    curl -O $GO_URL && \
    tar -C /usr/local -xzf ${GO_LATEST}.linux-${GO_ARCH}.tar.gz && \
    rm ${GO_LATEST}.linux-${GO_ARCH}.tar.gz
    
# Set up Go environment variables
ENV PATH=$PATH:/usr/local/go/bin

# Install Ruby and npm packages
RUN gem install brakeman 

RUN pip install pip && pip install bandit && pip install checkmate5 && pip install git+https://github.com/tcosolutions/aigraphcodescan

# Clone and install other repositories
RUN git clone https://github.com/tcosolutions/betterscan.git /srv/betterscan

# Set up additional tools
RUN curl https://raw.githubusercontent.com/aquasecurity/tfsec/master/scripts/install_linux.sh | bash && \
    curl https://raw.githubusercontent.com/armosec/kubescape/master/install.sh | bash




