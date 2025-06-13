# Stage 1: builder - Used for installing build tools, downloading binaries, and cloning repositories.
# This stage contains all dependencies needed for building/downloading.
FROM python:3.13-slim AS builder

ARG DEBIAN_FRONTEND=noninteractive
ENV SHELL=/bin/bash
ENV PIPENV_IGNORE_VIRTUALENVS=1
ENV PIP_ROOT_USER_ACTION=ignore

# Install core build dependencies and common tools in a single RUN command.
# This reduces the number of Docker layers and cleans up apt cache immediately.
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    ca-certificates curl tar libssl-dev git ssh rubygems unzip jq gcc build-essential && \
    rm -rf /var/lib/apt/lists/*

# --- Install Go ---
# Dynamically downloads the latest Go version for the correct architecture.
# Uses Docker's TARGETARCH to select the appropriate Go binary.
ARG TARGETARCH
RUN set -eux; \
    GO_VERSION=$(curl -s "https://go.dev/dl/?mode=json" | jq -r '.[0].version'); \
    GO_ARCH=""; \
    case "$TARGETARCH" in \
        "amd64") GO_ARCH="amd64" ;; \
        "arm64") GO_ARCH="arm64" ;; \
        "armv7l") GO_ARCH="armv6l" ;; \
        *) echo "Unsupported architecture: $TARGETARCH for Go build." >&2; exit 1 ;; \
    esac; \
    echo "Downloading Go $GO_VERSION for $TARGETARCH ($GO_ARCH)..."; \
    GO_TAR_URL="https://dl.google.com/go/${GO_VERSION}.linux-${GO_ARCH}.tar.gz"; \
    curl -LO "$GO_TAR_URL"; \
    tar -C /usr/local -xzf "${GO_VERSION}.linux-${GO_ARCH}.tar.gz"; \
    rm "${GO_VERSION}.linux-${GO_ARCH}.tar.gz"; \
    echo "Go installed successfully."

# Set up Go environment variables for the builder stage.
ENV PATH="/usr/local/go/bin:${PATH}"

# --- Install Ruby and Python packages ---
# Combined into a single RUN command for efficiency.
# Ruby gems (Brakeman)
# Python virtual environment setup, pip upgrades, and package installations.
# --no-cache-dir for pip reduces image size.
# Clean up pip cache.
RUN echo "Installing Ruby gems and Python packages..." && \
    gem install brakeman --no-document && \
    python3 -m venv /opt/venv && \
    /opt/venv/bin/pip install --upgrade pip && \
    /opt/venv/bin/pip install --no-cache-dir bandit checkmate5 aigraphcodescan && \
    rm -rf /root/.cache/pip

# Set PATH to include Python venv binaries.
ENV PATH="/opt/venv/bin:${PATH}"

# --- Clone and install other repositories/tools ---
# Using --depth 1 for shallow clones to save space if full history isn't needed.
RUN echo "Cloning repositories and installing additional tools..." && \
    git clone --depth 1 https://github.com/tcosolutions/betterscan.git /srv/betterscan && \
    curl -sL https://raw.githubusercontent.com/aquasecurity/tfsec/master/scripts/install_linux.sh | bash && \
    curl -sL https://raw.githubusercontent.com/armosec/kubescape/master/install.sh | bash

# --- Setup opengrep ---
# Docker's TARGETARCH is used to download the correct opengrep binary.
# The logic determines the correct suffix ('x86' for amd64, 'aarch64' for arm64)
# for opengrep's specific release asset naming convention.
RUN set -eux; \
    OPENGREP_ARCH_SUFFIX=$( \
        if [ "$TARGETARCH" = "amd64" ]; then \
            echo "x86"; \
        elif [ "$TARGETARCH" = "arm64" ]; then \
            echo "aarch64"; \
        elif [ "$TARGETARCH" = "armv7l" ]; then \
            echo "armv6l"; \
        else \
            echo "Unsupported architecture for pre-built opengrep binaries: $TARGETARCH. Only amd64, arm64, armv7l Linux are supported." >&2; \
            exit 1; \
        fi \
    ); \
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
        echo "Error: No matching opengrep binary found for architecture $TARGETARCH in the latest release." >&2; \
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

# Stage 2: final - The minimal runtime image
# This stage only copies the necessary files from the builder stage for a smaller final image.
FROM python:3.12-slim

# Set environment variables for the final image
ARG DEBIAN_FRONTEND=noninteractive
ENV SHELL=/bin/bash

# Install runtime dependencies for Ruby/Brakeman in the final stage
# This keeps the builder clean and the final image small.
RUN apt-get update && apt-get install -y --no-install-recommends \
    ruby && \
    gem install brakeman --no-document && \
    rm -rf /var/lib/apt/lists/*

# Copy the Python virtual environment and set PATH
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:${PATH}"

# Copy Go runtime (important if Go applications are run directly)
COPY --from=builder /usr/local/go /usr/local/go
ENV PATH="/usr/local/go/bin:${PATH}"

# Copy binaries and repositories
COPY --from=builder /usr/local/bin/opengrep /usr/local/bin/opengrep
COPY --from=builder /srv/betterscan /srv/betterscan
COPY --from=builder /usr/local/bin/tfsec /usr/local/bin/tfsec
COPY --from=builder /usr/local/bin/kubescape /usr/local/bin/kubescape
COPY --from=builder /root/opengrep-rules /root/opengrep-rules
