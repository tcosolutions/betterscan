FROM python:3.7
WORKDIR /
RUN mkdir -p /srv
RUN git clone https://github.com/marcinguy/scanmycode-ce.git /srv/scanmycode
WORKDIR /srv/scanmycode
RUN git pull
RUN apt update && apt install -y libcurl4-nss-dev libssl-dev tree sudo git ssh rsync npm ruby-sass pipenv
RUN tree
#RUN pip install -r requirements.txt
RUN pipenv install --system
RUN pip3 install pylint===1.9.2
RUN pip3 install stripe
WORKDIR /
RUN git clone -b checkmate3  https://github.com/marcinguy/checkmate-ce /checkmate
WORKDIR /checkmate
RUN tree /checkmate
RUN python3 setup.py install
WORKDIR /
RUN pip uninstall -y blitzdb3
RUN git clone https://github.com/marcinguy/blitzdb3-ce.git /blitzdb3-ce
WORKDIR /blitzdb3-ce
RUN git pull
RUN python3 setup.py install
WORKDIR /
RUN ln -s /srv/scanmycode/quantifiedcode/settings/default.yml /srv/scanmycode/settings.yml
RUN pip3 install psycopg2 --upgrade
#WORKDIR /
#RUN wget https://nodejs.org/dist/v16.14.0/node-v16.14.0-linux-x64.tar.xz
#RUN mkdir -p /usr/local/lib/nodejs
#RUN tar -xJvf node-v16.14.0-linux-x64.tar.xz -C /usr/local/lib/nodejs 
#ENV PATH "/usr/local/lib/nodejs/node-v16.14.0-linux-x64/bin:${PATH}"
WORKDIR /srv/scanmycode/quantifiedcode/frontend
RUN npm install
RUN chmod -R ugo+rw /srv/scanmycode/quantifiedcode/frontend
WORKDIR /srv/scanmycode/quantifiedcode/frontend
RUN useradd user
RUN mkdir /home/user
RUN chmod -R oug+rwx /home/user
RUN sudo -u user make
WORKDIR /srv/scanmycode/quantifiedcode/plugins/git
RUN chmod -R ugo+rw /srv/scanmycode/quantifiedcode/plugins/git 
WORKDIR /srv/scanmycode/quantifiedcode/plugins/git/frontend
RUN sudo -u user make
RUN pip3 install email_validator
RUN pip3 install celery==4.4.6
