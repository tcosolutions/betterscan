# Use the latest Red Hat Universal Base Image (UBI) as the base image
FROM registry.access.redhat.com/ubi8/ubi:latest AS builder

# Set non-interactive frontend for yum and other environment variables
ENV SHELL=/bin/bash
ENV PIPENV_IGNORE_VIRTUALENVS=1
ENV PIP_ROOT_USER_ACTION=ignore
ENV GO_VERSION=1.23.0
ENV RUBY_VERSION=3.1

# Update and install dependencies
RUN yum update -y && \
    yum install -y \
    ca-certificates \
    curl \
    tar \
    openssl-devel \
    git \
    openssh-clients \
    gcc \
    gcc-c++ \
    make \
    jq \
    bash \
    unzip \
    go-toolset \
    yum-utils && \
    yum clean all

# Enable the SCL repository and install Ruby 3.x
RUN yum install -y \
    @ruby:$RUBY_VERSION && \
    yum clean all

# Enable Ruby 3.x
ENV PATH="/opt/rh/rh-ruby${RUBY_VERSION}/root/usr/bin:${PATH}"
ENV LD_LIBRARY_PATH="/opt/rh/rh-ruby${RUBY_VERSION}/root/usr/lib64:${LD_LIBRARY_PATH}"

# Verify Ruby installation
RUN ruby -v

# Detect architecture and set GO_ARCH accordingly
RUN ARCH=$(uname -m) && \
    if [ "$ARCH" = "x86_64" ]; then \
        GO_ARCH="amd64"; \
    elif [ "$ARCH" = "aarch64" ]; then \
        GO_ARCH="arm64"; \
    else \
        echo "Unsupported architecture: $ARCH"; exit 1; \
    fi && \
    curl -fsSL "https://dl.google.com/go/go${GO_VERSION}.linux-${GO_ARCH}.tar.gz" -o go.tar.gz && \
    tar -C /usr/local -xzf go.tar.gz && \
    rm go.tar.gz

# Set up Go environment variables
ENV PATH=$PATH:/usr/local/go/bin

# Install Ruby gems (with the correct Ruby version)
RUN gem install brakeman

# Clone and install checkmate-ce in a virtual environment
RUN git clone https://github.com/***/checkmate-ce.git /checkmate-ce && \
    cd /checkmate-ce && \
    python3 -m venv venv && \
    . venv/bin/activate && \
    pip install --upgrade pip && \
    pip install poetry && \
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
FROM registry.access.redhat.com/ubi8/ubi:latest AS final

# Install Python in the final image
RUN yum update -y && \
    yum install -y python3 python3-pip && \
    yum clean all

# Copy necessary tools and dependencies from the builder stage
COPY --from=builder /usr/local/go/bin /usr/local/go/bin
COPY --from=builder /usr/local/bin/staticcheck /usr/local/bin/staticcheck
COPY --from=builder /usr/local/bin/find_unicode_control2.py /usr/local/bin/find_unicode_control2.py
COPY --from=builder /srv/betterscan /srv/betterscan
COPY --from=builder /root/graudit /root/graudit
COPY --from=builder /root/text4shell-ce /root/text4shell-ce

WORKDIR /root
