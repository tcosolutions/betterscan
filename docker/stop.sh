#!/bin/bash
if ! command -v docker-compose &> /dev/null
then
    docker compose down
else
    docker-compose down
fi
~
