import smtplib
import logging

from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.utils import COMMASPACE, formatdate

from quantifiedcode.settings import settings

logger = logging.getLogger(__name__)

def send_email(message):

    """
    :param message: A dictionary with the following items: from_email, from_name, reply_to, subject, html, text, to, attachments
    """

    send_from = message['from_email']
    send_to = message['to']

    msg = MIMEMultipart()
    msg['From'] = '{} <{}>'.format(message['from_name'], send_from)
    msg['Reply-To'] = message['reply_to']
    msg['To'] = COMMASPACE.join(send_to)
    msg['Date'] = formatdate(localtime=True)
    msg['Subject'] = message['subject']

    if message['html']:
        msg.attach(MIMEText(message['html'],'html'))
    if message['text']:
        msg.attach(MIMEText(message['text'],'text'))

    #the caller is responsible for creating suitable attachments
    for attachment in message['attachments']:
        message.attach(attachment)

    host = settings.get('email.host')
    port = settings.get('email.port')
    tls = settings.get('email.tls')
    username = settings.get('email.username')
    password = settings.get('email.password')

    if not host or not port:
        raise ValueError("E-Mail host/port not defined!")

    smtp = smtplib.SMTP(host, port)

    #if TLS is enabled, we start the process
    if tls:
        smtp.starttls()

    #if credentials were provided, we use them to log in
    if username and password:
        smtp.login(username, password)

    #we send the e-mail
    smtp.sendmail(send_from, send_to, msg.as_string())
    smtp.close()

    logger.info("Successfully sent e-mail to {} from {}".format(", ".join(send_to), send_from))