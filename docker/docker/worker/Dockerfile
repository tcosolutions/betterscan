ARG DEBIAN_FRONTEND=noninteractive
FROM python:3.8
RUN ln -snf /usr/share/zoneinfo/$CONTAINER_TIMEZONE /etc/localtime && echo $CONTAINER_TIMEZONE > /etc/timezone
RUN apt update && apt install -y libcurl4-nss-dev libssl-dev tree git sudo ssh rubygems python3-pip npm php default-jdk pipenv rsync jo libpq-dev curl
WORKDIR /
RUN mkdir -p /srv
RUN rm /usr/bin/python3
RUN ln -s /usr/local/bin/python3.8 /usr/bin/python3
RUN git clone https://github.com/marcinguy/scanmycode-ce.git /srv/scanmycode
WORKDIR /srv/scanmycode
RUN git pull
WORKDIR /srv/scanmycode
RUN pip install pipenv
RUN python3 -m pipenv install --python=/usr/local/bin/python3.8 --system
WORKDIR /
RUN git clone -b checkmate3 https://github.com/marcinguy/checkmate-ce /checkmate
WORKDIR /checkmate
RUN git checkout checkmate3
RUN git pull
RUN python3.8 setup.py install
WORKDIR /
WORKDIR /
RUN python3.8 -m pip install psycopg2 --upgrade
RUN ln -s /srv/scanmycode/quantifiedcode/settings/default.yml /srv/scanmycode/settings.yml
WORKDIR /root
RUN apt install -y wget
RUN wget https://golang.org/dl/go1.21.5.linux-amd64.tar.gz
RUN sudo tar -C /usr/local -xzf go1.21.5.linux-amd64.tar.gz
RUN /usr/local/go/bin/go install github.com/securego/gosec/v2/cmd/gosec@latest
RUN mkdir /root/bin
RUN cp /root/go/bin/gosec /root/bin/gosec
RUN /usr/local/go/bin/go install github.com/google/osv-scanner/cmd/osv-scanner@v1
RUN cp /root/go/bin/osv-scanner /root/bin/osv-scanner
RUN gem install brakeman
RUN python3.8 -m pip install bandit
RUN python3.8 -m pip install semgrep
RUN npm install -g jshint
WORKDIR /root
RUN git clone https://gitlab.com/marcinguy/trufflehog3-oss.git
RUN cd trufflehog3-oss && python3.8 setup.py install
RUN python3.8 -m pip install markupsafe==2.0.1
WORKDIR /srv/scanmycode
RUN mkdir /root/confused/
RUN git clone https://gitlab.com/marcinguy/confused-oss.git /root/confused
RUN tree
WORKDIR /root/confused
RUN /usr/local/go/bin/go mod init confused
RUN /usr/local/go/bin/go build confused
RUN tree
WORKDIR /root
RUN git clone https://github.com/Raz0r/semgrep-smart-contracts.git
RUN git clone https://github.com/marcinguy/smc-semgrep-js.git semgrepjs
RUN git clone https://github.com/marcinguy/semgrep-csharp-dotnet.git semgrepcsharpdotnet
RUN wget https://github.com/pmd/pmd/releases/download/pmd_releases%2F6.41.0/pmd-bin-6.41.0.zip
RUN unzip pmd-bin-6.41.0.zip
RUN mkdir /root/phpscan/
RUN cp /srv/scanmycode/analyzers/progpilot.phar /root/phpscan/
RUN cp /srv/scanmycode/analyzers/find_unicode_control2.py /usr/local/bin/
RUN cp -pr /srv/scanmycode/analyzers/custom-semgrep /root
RUN cp /srv/scanmycode/analyzers/*.yml /root/
RUN cp /srv/scanmycode/sshfeature/ssh /usr/local/lib/python3.8/site-packages/checkmate3-0.2.0-py3.8.egg/checkmate/contrib/plugins/git/lib
RUN mkdir -p /usr/local/lib/python3.8/site-packages/checkmate3-0.2.0-py3.8.egg/checkmate/contrib/plugins/javascript/jshint/js
RUN cp /srv/scanmycode/analyzers/json_reporter.js /usr/local/lib/python3.8/site-packages/checkmate3-0.2.0-py3.8.egg/checkmate/contrib/plugins/javascript/jshint/js/
RUN python3.8 -m pip install email_validator
#RUN pip3 install celery==4.4.6
RUN python3.8 -m pip install testresources
RUN python3.8 -m pip install checkov
RUN curl -s https://raw.githubusercontent.com/armosec/kubescape/master/install.sh | /bin/bash
RUN wget https://github.com/insidersec/insider/releases/download/3.0.0/insider_3.0.0_linux_x86_64.tar.gz
RUN tar -xzf insider_3.0.0_linux_x86_64.tar.gz
WORKDIR /root
RUN git clone https://github.com/marcinguy/graudit-ce graudit
RUN git clone https://github.com/marcinguy/text4shell-ce text4shell-ce
RUN python3.8 -m pip install yara-scanner
RUN mkdir /root/yara
RUN cp -pr /srv/scanmycode/analyzers/yara/* /root/yara
ADD https://nixos.org/nix/install /tmp
RUN bash -c "bash /tmp/install --daemon"
RUN bash -c "/root/.nix-profile/bin/nix-env -if https://github.com/fluidattacks/makes/archive/22.11.tar.gz"
RUN bash -c "/root/.nix-profile/bin/m gitlab:fluidattacks/universe@2061c6097d66adf4e2f9feb1e4df43447ee51984 /skims"
RUN /usr/local/go/bin/go install honnef.co/go/tools/cmd/staticcheck@latest
RUN cp /root/go/bin/staticcheck /root/bin/staticcheck
RUN python3.8 -m pip install sqlalchemy===1.4.46
RUN npm install snyk@latest -g
RUN git clone https://github.com/marcinguy/ptpt.git ptpt
WORKDIR /root/ptpt
RUN /usr/local/go/bin/go build
RUN cp /root/ptpt/ptpt /root/bin/ptpt
RUN curl -s https://raw.githubusercontent.com/aquasecurity/tfsec/master/scripts/install_linux.sh | bash
RUN curl --silent --output /dev/null https://dl.betterscan.io/docker-build-worker.html  
