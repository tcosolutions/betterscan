FROM python:3.12-slim AS builder

ARG DEBIAN_FRONTEND=noninteractive
ENV SHELL=/bin/bash



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

RUN python3 -m venv venv && pip install pip && pip install bandit && pip install checkmate5 && pip install aigraphcodescan

# Clone and install other repositories
RUN git clone https://github.com/tcosolutions/betterscan.git /srv/betterscan

# Set up additional tools
RUN curl https://raw.githubusercontent.com/aquasecurity/tfsec/master/scripts/install_linux.sh | bash && \
    curl https://raw.githubusercontent.com/armosec/kubescape/master/install.sh | bash


# --- Setup opengrep ---
# Docker's TARGETARCH is used to download the correct opengrep binary.
# The logic determines the correct suffix ('x86' for amd64, 'aarch64' for arm64)
# for opengrep's specific release asset naming convention.
ENV OPENGREP_ARCH_SUFFIX=""
RUN set -eux; \
    if [ "$TARGETARCH" = "amd64" ]; then \
        export OPENGREP_ARCH_SUFFIX="x86"; \
    elif [ "$TARGETARCH" = "arm64" ]; then \
        export OPENGREP_ARCH_SUFFIX="aarch64"; \
    else \
        echo "Unsupported architecture for pre-built opengrep binaries: $TARGETARCH. Only amd64 and arm64 Linux are supported."; \
        exit 1; \
    fi; \
    echo "Identified opengrep architecture suffix: $OPENGREP_ARCH_SUFFIX"; \
    \
    LATEST_RELEASE_URL="https://api.github.com/repos/opengrep/opengrep/releases/latest"; \
    # Remove problematic control characters and ensure single-line output from jq
    # The 'head -n 1' ensures that if multiple assets match, only the first is considered.
    ASSET_INFO=$(curl -sL "$LATEST_RELEASE_URL" | tr -d '\000-\031\177' | \
        jq -r --arg opengrep_arch_suffix "$OPENGREP_ARCH_SUFFIX" \
        '.assets[] | select(.name | test("opengrep_(manylinux|musllinux)_" + $opengrep_arch_suffix + "$")) | "\(.browser_download_url) \(.name)"' | head -n 1 \
    ); \
    \
    DOWNLOAD_URL=$(echo "$ASSET_INFO" | awk '{print $1}'); \
    DOWNLOADED_FILENAME=$(echo "$ASSET_INFO" | awk '{print $2}'); \
    \
    if [ -z "$DOWNLOAD_URL" ]; then \
        echo "Error: No matching opengrep binary found for architecture $TARGETARCH in the latest release."; \
        exit 1; \
    fi; \
    echo "Identified download URL for opengrep: $DOWNLOAD_URL"; \
    echo "Expected downloaded filename: $DOWNLOADED_FILENAME"; \
    \
    # Use 'curl -o' to explicitly specify the output filename, preventing issues with filename inference
    # and ensuring only one URL is processed.
    curl -L -o /usr/local/bin/opengrep "$DOWNLOAD_URL"; \
    chmod +x /usr/local/bin/opengrep; \
    echo "opengrep installed successfully."

# Clone opengrep-rules
RUN echo "Cloning opengrep-rules..." && \
    git clone --depth 1 https://github.com/opengrep/opengrep-rules.git /root/opengrep-rules





