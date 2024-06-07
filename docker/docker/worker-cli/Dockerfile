FROM python:3.8
ARG DEBIAN_FRONTEND=noninteractive
RUN ln -snf /usr/share/zoneinfo/$CONTAINER_TIMEZONE /etc/localtime && echo $CONTAINER_TIMEZONE > /etc/timezone
RUN apt update && apt install -y libcurl4-nss-dev libssl-dev tree git sudo ssh rubygems python3-pip npm php default-jdk pipenv rsync jo libpq-dev curl wget
WORKDIR /
RUN mkdir -p /srv
RUN rm /usr/bin/python3
RUN ln -s /usr/local/bin/python3.8 /usr/bin/python3
RUN git clone https://github.com/topcodersonline-solutions/betterscan-ce /srv/betterscan
WORKDIR /srv/betterscan
RUN git pull
WORKDIR /srv/betterscan
RUN pip install pipenv
RUN python3 -m pipenv install --python=/usr/local/bin/python3.8 --system
RUN python3 -m pip install Rich
WORKDIR /
RUN git clone -b checkmate3-cli https://github.com/topcodersonline-solutions/checkmate-ce /checkmate
WORKDIR /checkmate
RUN git checkout checkmate3-cli
RUN git pull
RUN python3 setup.py install
WORKDIR /
WORKDIR /
RUN python3 -m pip install psycopg2 --upgrade
RUN ln -s /srv/betterscan/quantifiedcode/settings/default.yml /srv/betterscan/settings.yml
WORKDIR /root
RUN wget https://golang.org/dl/go1.22.4.linux-amd64.tar.gz
RUN sudo tar -C /usr/local -xzf go1.22.4.linux-amd64.tar.gz
ENV SHELL /bin/bash
RUN /usr/local/go/bin/go install github.com/securego/gosec/v2/cmd/gosec@latest
RUN mkdir /root/bin
RUN cp /root/go/bin/gosec /root/bin/gosec
RUN /usr/local/go/bin/go  install github.com/google/osv-scanner/cmd/osv-scanner@v1
RUN cp /root/go/bin/osv-scanner /root/bin/osv-scanner
RUN gem install brakeman
RUN python3 -m pip install bandit
RUN python3 -m pip install semgrep
RUN npm install -g jshint
WORKDIR /root
RUN git clone https://gitlab.com/marcinguy/trufflehog3-oss.git
RUN cd trufflehog3-oss && python3 setup.py install
RUN python3 -m pip install markupsafe==2.0.1
WORKDIR /srv/betterscan
RUN mkdir /root/confused/
RUN git clone https://gitlab.com/marcinguy/confused-oss.git /root/confused
RUN tree
WORKDIR /root/confused
RUN /usr/local/go/bin/go mod init confused
RUN /usr/local/go/bin/go build confused
RUN tree
WORKDIR /root
RUN wget https://github.com/pmd/pmd/releases/download/pmd_releases%2F6.41.0/pmd-bin-6.41.0.zip
RUN unzip pmd-bin-6.41.0.zip
RUN mkdir /root/phpscan/
RUN cp /srv/betterscan/analyzers/progpilot.phar /root/phpscan/
RUN cp /srv/betterscan/analyzers/find_unicode_control2.py /usr/local/bin/
RUN cp -pr /srv/betterscan/analyzers/custom-semgrep /root
RUN cp /srv/betterscan/analyzers/*.yml /root/
RUN cp /srv/betterscan/sshfeature/ssh /usr/local/lib/python3.8/site-packages/checkmate-0.2.0-py3.8.egg/checkmate/contrib/plugins/git/lib
RUN mkdir -p /usr/local/lib/python3.8/site-packages/checkmate-0.2.0-py3.8.egg/checkmate/contrib/plugins/javascript/jshint/js
RUN cp /srv/betterscan/analyzers/json_reporter.js /usr/local/lib/python3.8/site-packages/checkmate-0.2.0-py3.8.egg/checkmate/contrib/plugins/javascript/jshint/js/
RUN python3 -m pip install email_validator
RUN python3 -m pip  install testresources
RUN python3 -m pip install checkov
RUN curl -s https://raw.githubusercontent.com/armosec/kubescape/master/install.sh | /bin/bash
RUN wget https://github.com/insidersec/insider/releases/download/3.0.0/insider_3.0.0_linux_x86_64.tar.gz
RUN tar -xzf insider_3.0.0_linux_x86_64.tar.gz
WORKDIR /root
RUN git clone https://github.com/topcodersonline-solutions/graudit-ce graudit
RUN git clone https://github.com/marcinguy/text4shell-ce text4shell-ce
RUN python3 -m pip install yara-scanner
RUN mkdir /root/yara
RUN cp -pr /srv/betterscan/analyzers/yara/* /root/yara
ADD https://nixos.org/nix/install /tmp
RUN bash -c "bash /tmp/install --daemon"
RUN bash -c "/root/.nix-profile/bin/nix-env -if https://github.com/fluidattacks/makes/archive/24.01.tar.gz"
RUN bash -c "/root/.nix-profile/bin/m gitlab:fluidattacks/universe@trunk /skims"
RUN /usr/local/go/bin/go install honnef.co/go/tools/cmd/staticcheck@latest
RUN cp /root/go/bin/staticcheck /root/bin/staticcheck
RUN python3 -m pip install sqlalchemy===1.4.46
RUN python3 -m pip install rich
RUN git clone https://github.com/marcinguy/ptpt.git ptpt
WORKDIR /root/ptpt
RUN /usr/local/go/bin/go build
RUN cp /root/ptpt/ptpt /root/bin/ptpt
RUN curl -s https://raw.githubusercontent.com/aquasecurity/tfsec/master/scripts/install_linux.sh | bash
