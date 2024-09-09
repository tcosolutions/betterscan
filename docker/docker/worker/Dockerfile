FROM python:3.9-slim

# Arguments for non-interactive installation and setting timezone
ARG DEBIAN_FRONTEND=noninteractive
ENV CONTAINER_TIMEZONE=UTC
ENV TZ=${CONTAINER_TIMEZONE}
ENV SHELL=/bin/bash
ENV PIPENV_IGNORE_VIRTUALENVS=1

# Install basic dependencies and set up environment in one RUN command
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    tar \
    libssl-dev \
    git \
    ssh \
    rubygems \
    python3-pip \
    npm \
    php \
    pipenv \
    unzip \
    jq \
    gcc  \
    build-essential && \
    ln -snf /usr/share/zoneinfo/$CONTAINER_TIMEZONE /etc/localtime && \
    echo $CONTAINER_TIMEZONE > /etc/timezone

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

# Clone the checkmate repository and install
RUN pip install --upgrade pip && pip install checkmate3

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


