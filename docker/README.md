Setup

create folder data1, data2, postgres-data

Execute, as root - due to mounted volume for PosgreSQL - Feel free to change:

`docker-compose up`

Then exec into server_1

`docker exec -it containerID /bin/bash`

and run in this container:

`python manage.py setup`

Above is needed only once, when new checkers are added

Database will be persisted in postgres-data Volume (folder)

Go in the Bowser to:

`http://localhost:5000`

Signup up and login to use your local installation.

