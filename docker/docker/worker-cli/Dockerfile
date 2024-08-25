# Use the latest Alpine image as the base image
FROM alpine:latest AS builder

# Set non-interactive frontend for apk and other environment variables
ENV SHELL=/bin/ash
ENV PIPENV_IGNORE_VIRTUALENVS=1
ENV PIP_ROOT_USER_ACTION=ignore
ENV GO_VERSION=1.23.0

# Install dependencies
RUN apk update && \
    apk add --no-cache \
    ca-certificates \
    curl \
    tar \
    git \
    openssh-client \
    ruby \
    ruby-dev \
    python3 \
    py3-pip \
    py3-virtualenv \
    gcc \
    musl-dev \
    libffi-dev \
    make \
    jq \
    bash \
    unzip \
    go

# Detect architecture and set GO_ARCH accordingly
RUN ARCH=$(uname -m) && \
    if [ "$ARCH" = "x86_64" ]; then \
        GO_ARCH="amd64"; \
    elif [ "$ARCH" = "aarch64" ]; then \
        GO_ARCH="arm64"; \
    elif [ "$ARCH" = "armv7l" ]; then \
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

# Clone and install checkmate-ce
RUN git clone https://github.com/tcosolutions/checkmate-ce.git /checkmate-ce && \
    cd /checkmate-ce && \
    pip3 install --upgrade pip && \
    pip3 install poetry && \
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

# Final image with only the necessary tools and dependencies
FROM alpine:latest AS final

# Install Python in the final image
RUN apk update && \
    apk add --no-cache python3 py3-pip

# Copy necessary tools and dependencies from the builder stage
COPY --from=builder /usr/local/go/bin /usr/local/go/bin
COPY --from=builder /usr/local/bin/staticcheck /usr/local/bin/staticcheck
COPY --from=builder /usr/local/bin/find_unicode_control2.py /usr/local/bin/find_unicode_control2.py
COPY --from=builder /srv/betterscan /srv/betterscan
COPY --from=builder /root/graudit /root/graudit
COPY --from=builder /root/text4shell-ce /root/text4shell-ce

WORKDIR /root
