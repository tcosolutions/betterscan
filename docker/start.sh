#!/bin/bash
if ! command -v docker-compose &> /dev/null
then
    docker compose up
else
    docker-compose up
fi
