# Start from the official Python slim image
FROM python:3.8-slim

# Arguments for non-interactive installation and setting timezone
ARG DEBIAN_FRONTEND=noninteractive
ENV CONTAINER_TIMEZONE=UTC
ENV TZ=${CONTAINER_TIMEZONE}
ENV SHELL /bin/bash

# Install basic dependencies and set up environment in one RUN command
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    tar \
    gnupg \
    dirmngr \
    libcurl4-nss-dev \
    libssl-dev \
    git \
    sudo \
    ssh \
    rubygems \
    python3-pip \
    npm \
    php \
    default-jdk \
    pipenv \
    rsync \
    jo \
    libpq-dev \
    wget \
    unzip \
    jq \
    gcc && \
    ln -snf /usr/share/zoneinfo/$CONTAINER_TIMEZONE /etc/localtime && \
    echo $CONTAINER_TIMEZONE > /etc/timezone && \
    ssh-keyscan github.com >> /etc/ssh/ssh_known_hosts && \
    echo "StrictHostKeyChecking no" >> /etc/ssh/ssh_config && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

RUN GO_JSON=$(curl -s https://go.dev/dl/?mode=json) && \
    echo "GO_JSON: $GO_JSON" && \
    echo "$GO_JSON" | jq -e . > /dev/null 2>&1 || { echo "Failed to parse JSON"; exit 1; } && \
    GO_LATEST=$(echo "$GO_JSON" | jq -r '.[0].version') && \
    echo "GO_LATEST: $GO_LATEST" && \
    ARCH=$(uname -m) && \
    echo "ARCH: $ARCH" && \
    case $ARCH in \
        x86_64) GO_ARCH="amd64" ;; \
        aarch64) GO_ARCH="arm64" ;; \
        armv7l) GO_ARCH="armv6l" ;; \
        *) echo "Unsupported architecture: $ARCH"; exit 1 ;; \
    esac && \
    GO_URL="https://dl.google.com/go/${GO_LATEST}.linux-${GO_ARCH}.tar.gz" && \
    echo "Downloading Go from $GO_URL" && \
    curl -O $GO_URL && \
    tar -C /usr/local -xzf ${GO_LATEST}.linux-${GO_ARCH}.tar.gz && \
    rm ${GO_LATEST}.linux-${GO_ARCH}.tar.gz



# Set up Go environment variables
ENV PATH=$PATH:/usr/local/go/bin
# Set up Go environment variables
ENV PATH="/usr/local/go/bin:${PATH}"

# Verify Go installation
RUN go version

# Install Ruby gem, Python, and Node.js packages
RUN gem install brakeman && \
    python3 -m pip install --use-feature=fast-deps pipenv bandit semgrep psycopg2 markupsafe==2.0.1 \
    email_validator testresources yara-scanner sqlalchemy===1.4.46 Rich && \
    npm install -g jshint

# Clone repositories and set up projects

RUN --mount=type=ssh git clone -b checkmate3-cli git@github.com:topcodersonline-solutions/checkmate-ce /checkmate && --mount=type=ssh git clone git@github.com:topcodersonline-solutions/betterscan-ce /srv/betterscan \
    cd /checkmate && \
    python3 setup.py install && \
    --mount=type=ssh git clone git@github.com:topcodersonline-solutions/trufflehog3-oss.git /root/trufflehog3-oss && \
    cd /root/trufflehog3-oss && \
    python3 setup.py install && \
    --mount=type=ssh git clone git@github.com:topcodersonline-solutions/graudit-ce /root/graudit && \
    --mount=type=ssh git clone git@github.com:topcodersonline-solutions/text4shell-ce /root/text4shell-ce && \
    --mount=type=ssh git clone git@github.com:topcodersonline-solutions/ptpt /root/ptpt && \
    cd /root/ptpt && \
    go build && \
    cp /root/ptpt/ptpt /usr/local/bin/ptpt

# Set up additional tools
RUN wget https://github.com/pmd/pmd/releases/download/pmd_releases%2F6.41.0/pmd-bin-6.41.0.zip && \
    unzip pmd-bin-6.41.0.zip && \
    rm pmd-bin-6.41.0.zip && \
    mkdir /root/phpscan/ && \
    cp /srv/betterscan/analyzers/progpilot.phar /root/phpscan/ && \
    cp /srv/betterscan/analyzers/find_unicode_control2.py /usr/local/bin/ && \
    cp -pr /srv/betterscan/analyzers/custom-semgrep /root && \
    cp /srv/betterscan/analyzers/*.yml /root/ && \
    mkdir -p /usr/lib/python3.8/site-packages/checkmate-0.2.0-py3.8.egg/checkmate/contrib/plugins/javascript/jshint/js && \
    cp /srv/betterscan/analyzers/json_reporter.js /usr/lib/python3.8/site-packages/checkmate-0.2.0-py3.8.egg/checkmate/contrib/plugins/javascript/jshint/js/ && \
    mkdir /root/yara && \
    cp -pr /srv/betterscan/analyzers/yara/* /root/yara && \
    go install honnef.co/go/tools/cmd/staticcheck@latest && \
    cp /root/go/bin/staticcheck /usr/local/bin/staticcheck && \
    curl -s https://raw.githubusercontent.com/aquasecurity/tfsec/master/scripts/install_linux.sh | bash && \
    curl -s https://raw.githubusercontent.com/armosec/kubescape/master/install.sh | bash

# Clean up
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Final working directory
WORKDIR /root

