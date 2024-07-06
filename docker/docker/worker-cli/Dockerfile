FROM python:3.8-slim

ARG DEBIAN_FRONTEND=noninteractive
ENV CONTAINER_TIMEZONE=UTC
ENV TZ=${CONTAINER_TIMEZONE}
ENV SHELL /bin/bash

# Install basic dependencies and set up environment in one RUN command
RUN apt-get update && apt-get install -y \
    libcurl4-nss-dev libssl-dev tree git sudo ssh rubygems python3-pip \
    npm php default-jdk pipenv rsync jo libpq-dev curl wget unzip && \
    ln -snf /usr/share/zoneinfo/$CONTAINER_TIMEZONE /etc/localtime && \
    echo $CONTAINER_TIMEZONE > /etc/timezone && \
    ssh-keyscan github.com >> /etc/ssh/ssh_known_hosts && \
    echo "StrictHostKeyChecking no" >> /etc/ssh/ssh_config

# Set up Go environment
RUN wget https://golang.org/dl/go1.22.4.linux-amd64.tar.gz && \
    sudo tar -C /usr/local -xzf go1.22.4.linux-amd64.tar.gz && \
    rm go1.22.4.linux-amd64.tar.gz && \
    mkdir /root/bin

# Install Ruby gem, Python, and Node.js packages
RUN gem install brakeman && \
    python3 -m pip install --use-feature=fast-deps pipenv bandit semgrep psycopg2 markupsafe==2.0.1 \
    email_validator testresources yara-scanner sqlalchemy===1.4.46 Rich && \
    npm install -g jshint

# Clone repositories and set up projects
RUN mkdir -p /srv /root && \
    --mount=type=ssh git clone git@github.com:topcodersonline-solutions/betterscan-ce /srv/betterscan && \
    cd /srv/betterscan && \
    pipenv install --system --use-feature=fast-deps && \
    ln -s /srv/betterscan/quantifiedcode/settings/default.yml /srv/betterscan/settings.yml && \
    --mount=type=ssh git clone -b checkmate3-cli git@github.com:topcodersonline-solutions/checkmate-ce /checkmate && \
    cd /checkmate && \
    git checkout checkmate3-cli && \
    python3 setup.py install && \
    --mount=type=ssh git clone git@github.com:topcodersonline-solutions/trufflehog3-oss.git /root/trufflehog3-oss && \
    cd /root/trufflehog3-oss && \
    python3 setup.py install && \
    --mount=type=ssh git clone git@github.com:topcodersonline-solutions/graudit-ce /root/graudit && \
    --mount=type=ssh git clone git@github.com:topcodersonline-solutions/text4shell-ce /root/text4shell-ce && \
    --mount=type=ssh git clone git@github.com:topcodersonline-solutions/ptpt /root/ptpt && \
    cd /root/ptpt && \
    /usr/local/go/bin/go build && \
    cp /root/ptpt/ptpt /root/bin/ptpt

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
    /usr/local/go/bin/go install honnef.co/go/tools/cmd/staticcheck@latest && \
    cp /root/go/bin/staticcheck /root/bin/staticcheck && \
    curl -s https://raw.githubusercontent.com/aquasecurity/tfsec/master/scripts/install_linux.sh | bash && \
    curl -s https://raw.githubusercontent.com/armosec/kubescape/master/install.sh | bash

# Display tree structure of /srv/betterscan
WORKDIR /srv/betterscan
RUN tree

# Clean up
RUN apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Final working directory
WORKDIR /root
