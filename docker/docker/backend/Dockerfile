ARG DEBIAN_FRONTEND=noninteractive
FROM python:3.8
RUN ln -snf /usr/share/zoneinfo/$CONTAINER_TIMEZONE /etc/localtime && echo $CONTAINER_TIMEZONE > /etc/timezone
RUN apt update && apt install -y libcurl4-nss-dev libssl-dev tree git sudo ssh rubygems python3-pip npm php default-jdk pipenv rsync jo libpq-dev curl
WORKDIR /
RUN mkdir -p /srv
RUN rm /usr/bin/python3
RUN ln -s /usr/local/bin/python3.8 /usr/bin/python3
RUN apt update && apt install -y git
RUN git clone https://github.com/topcodersonline-solutions/betterscan-ce /srv/betterscan
WORKDIR /srv/betterscan
RUN git pull
RUN apt update && apt install -y libcurl4-nss-dev libssl-dev tree sudo git ssh rsync npm ruby-sass pipenv
RUN tree
RUN pip install pipenv
RUN python3.8 -m pipenv install --python=/usr/local/bin/python3.8 --system
RUN python3.8 -m pip install pylint===1.9.2
RUN python3.8 -m pip install stripe
WORKDIR /
RUN git clone -b checkmate3  https://github.com/topcodersonline-solutions/checkmate-ce /checkmate
WORKDIR /checkmate
RUN tree /checkmate
RUN python3.8 setup.py install
WORKDIR /
WORKDIR /
RUN ln -s /srv/betterscan/quantifiedcode/settings/default.yml /srv/betterscan/settings.yml
RUN python3.8 -m pip install psycopg2 --upgrade
WORKDIR /srv/betterscan/quantifiedcode/frontend
RUN ln -s /usr/local/bin/python3.8 /usr/bin/python
RUN sudo ln -s /usr/share/pyshared/lsb_release.py /usr/local/lib/python3.8/site-packages/lsb_release.py
RUN curl -sL https://deb.nodesource.com/setup_14.x | sudo bash -
RUN apt -y install nodejs
RUN npm install
RUN chmod -R ugo+rw /srv/betterscan/quantifiedcode/frontend
WORKDIR /srv/betterscan/quantifiedcode/frontend
RUN useradd user
RUN mkdir /home/user
RUN chmod -R oug+rwx /home/user
RUN sudo -u user make
WORKDIR /srv/betterscan/quantifiedcode/plugins/git
RUN chmod -R ugo+rw /srv/betterscan/quantifiedcode/plugins/git 
WORKDIR /srv/betterscan/quantifiedcode/plugins/git/frontend
RUN sudo -u user make
RUN python3.8 -m pip install email_validator
RUN python3.8 -m pip install sqlalchemy===1.4.46
RUN python3.8 -m pip install importlib_resources
RUN python3.8 -m pip install importlib_metadata
