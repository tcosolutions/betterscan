FROM python:3.9-slim AS builder

ARG DEBIAN_FRONTEND=noninteractive
ENV SHELL=/bin/bash
ENV PIPENV_IGNORE_VIRTUALENVS=1
ENV PIP_ROOT_USER_ACTION=ignore

# Install dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    tar \
    libssl-dev \
    git \
    ssh \
    && rm -rf /var/lib/apt/lists/*

RUN apt-get update && apt-get install -y --no-install-recommends \
    rubygems \
    python3-pip \
    pipenv \
    unzip \
    jq \
    gcc \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install Go
RUN --mount=type=cache,target=/var/cache/apk \
    apk add --no-cache curl tar && \
    curl -fsSL "https://dl.google.com/go/go$(curl -fsSL https://golang.org/VERSION?m=text | sed -n 's/.*<h1>go\(.*\)<.*/\1/p').linux-amd64.tar.gz" | tar -C /usr/local -xzf -

# Set up Go environment variables
ENV PATH=$PATH:/usr/local/go/bin

# Install Ruby gem
RUN gem install brakeman

# Clone and install repositories
RUN git clone --depth 1 -b main https://github.com/tcosolutions/checkmate-ce.git /checkmate-ce && \
    cd /checkmate-ce && \
    pip install --upgrade pip && \
    pip install poetry && \
    poetry install

# Clone other repositories
RUN git clone --depth 1 -b main https://github.com/tcosolutions/betterscan.git /srv/betterscan && \
    git clone --depth 1 -b main https://github.com/tcosolutions/graudit-ce.git /root/graudit && \
    git clone --depth 1 -b main https://github.com/tcosolutions/text4shell-ce.git /root/text4shell-ce

# Set up additional tools
RUN cp /srv/betterscan/analyzers/find_unicode_control2.py /usr/local/bin/ && \
    go install honnef.co/go/tools/cmd/staticcheck@latest && \
    curl -s https://raw.githubusercontent.com/aquasecurity/tfsec/master/scripts/install_linux.sh | bash && \
    curl -s https://raw.githubusercontent.com/armosec/kubescape/master/install.sh | bash

# Final stage for runtime
FROM python:3.9-slim
COPY --from=builder /usr/local/go /usr/local/go
COPY --from=builder /usr/local/bin /usr/local/bin
COPY --from=builder /checkmate-ce /checkmate-ce
# Add more COPY commands for necessary files/directories from the builder stage

# Set working directory
WORKDIR /app
