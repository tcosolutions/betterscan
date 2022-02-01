FROM python:2.7
WORKDIR /
RUN mkdir -p /srv
RUN git clone https://github.com/marcinguy/scanmycode-ce.git /srv/scanmycode
WORKDIR /srv/scanmycode
RUN git pull
RUN apt update && apt install -y libcurl4-nss-dev libssl-dev tree sudo git ssh rsync npm ruby-sass
RUN tree
RUN pip install -r requirements.txt
RUN pip install pylint===1.9.2
RUN pip install stripe
RUN git clone https://github.com/marcinguy/checkmate-ce /checkmate
WORKDIR /checkmate
RUN tree /checkmate
RUN python setup.py install
RUN ln -s /srv/scanmycode/quantifiedcode/settings/default.yml /srv/scanmycode/settings.yml
RUN pip install psycopg2 --upgrade
WORKDIR /srv/scanmycode/quantifiedcode/frontend
RUN npm install -g bower
RUN npm install --save-dev @babel/core @babel/cli
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
