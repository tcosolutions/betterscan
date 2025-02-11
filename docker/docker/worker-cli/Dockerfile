FROM python:3.12-slim-bullseye AS builder

ARG DEBIAN_FRONTEND=noninteractive
ENV SHELL=/bin/bash
ENV PIPENV_IGNORE_VIRTUALENVS=1
ENV PIP_ROOT_USER_ACTION=ignore

# Install system dependencies.  Combine commands for smaller layers.
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates curl tar libssl-dev git ssh rubygems python3-pip pipenv unzip jq gcc build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install Go.  Alpine doesn't have the same architecture names, so simplify. Use a specific version.
ARG GO_VERSION=1.21.4 # Update to latest as needed
RUN wget -q "https://go.dev/dl/go${GO_VERSION}.linux-amd64.tar.gz" && \
    tar -C /usr/local -xzf "go${GO_VERSION}.linux-amd64.tar.gz" && \
    rm "go${GO_VERSION}.linux-amd64.tar.gz"

ENV PATH=$PATH:/usr/local/go/bin

# Install Ruby and npm packages (npm is not needed, so remove it)
RUN gem install brakeman

# Install Python packages - use latest versions
RUN pip install --no-cache-dir --upgrade pip bandit checkmate5 git+https://github.com/tcosolutions/aigraphcodescan

# Clone and install other repositories
RUN git clone https://github.com/tcosolutions/betterscan.git /srv/betterscan

# Set up additional tools. Use wget for smaller image size if possible.
RUN wget -qO - https://raw.githubusercontent.com/aquasecurity/tfsec/master/scripts/install_linux.sh | bash && \
    wget -qO - https://raw.githubusercontent.com/armosec/kubescape/master/install.sh | bash


# Create a smaller final image
FROM alpine:latest AS final

# Copy only the necessary artifacts from the builder stage
COPY --from=builder /usr/local/go /usr/local/go
COPY --from=builder /usr/local/bin/tfsec /usr/local/bin/tfsec
COPY --from=builder /usr/local/bin/kubescape /usr/local/bin/kubescape
COPY --from=builder /usr/local/bin/brakeman /usr/local/bin/brakeman
COPY --from=builder /usr/local/bin/bandit /usr/local/bin/bandit
COPY --from=builder /usr/local/bin/checkmate5 /usr/local/bin/checkmate5
COPY --from=builder /usr/local/bin/aigraphcodescan /usr/local/bin/aigraphcodescan
COPY --from=builder /srv/betterscan /srv/betterscan

# Set up Go environment variables in the final image
ENV PATH=$PATH:/usr/local/go/bin

# Set the working directory (optional)
WORKDIR /app

