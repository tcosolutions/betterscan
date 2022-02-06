# Star it

If you like it, please give it a GitHub star/fork/contribute. This will ensure continous development :star:

# TLDR;

To install it. Install `docker` and `docker-compose` and then:

```
git clone git@github.com:marcinguy/scanmycode-ce.git
cd scanmycode-ce/docker
./start.sh
```

Go in the Browser to:

`http://localhost:5000`

Sign up locally (and login in when needed)

# Under the hood

Progpilot, PMD, Bandit, Brakeman, Gosec, confused, semgrep, trufflehog3, jshint, log4shell via custom semgrep rule and other(s). Some were modified. 

# Recorded DEMO

Community Edition does not have GitHub support and other plugins. But rest is the same.

![scanmycode-demo](https://user-images.githubusercontent.com/20355405/152678316-04fdcd54-73e8-42f8-9bf2-fb9a69618ff9.gif)


# Welcome to Scanmycode CE (Community Edition)!

Scanmycode is based on QuantifedCode. QuantifiedCode is a code analysis \& automation platform. It helps you to keep track of issues and
metrics in your software projects, and can be easily extended to support new types of analyses.
The application consists of several parts:

* A frontend, realized as a React.js app
* A backend, realized as a Flask app, that exposes a REST API consumed by the frontend
* A background worker, realized using Celery, that performs the code analysis

Currently supports: PHP, Java, Scala, Python, Ruby, Javascript, GO, Secret Scanning, Dependency Confusion, Trojan Source, Open Source and Proprietary Checks (total ca. 1000 checks) 

Advantages:
* Many tools, one report (unification) 
* Dismiss, collaborate on findings. Mark false-positives
* Enable/disable each individual check in Checkers
* ca. 1000 checks now (Linters, Static Code Analysis/Code Scanning) 
* any tool outputting JSON can be added
* fast (checks only new code on recheck)
* Git support (HTTPS/TLS and SSH). For private repositories only SSH. 
* all REST API callable (CI/CD integrateable)
* Swiss army knife tool/SIEM for Code Scanning
* 100% Code transparency & full control of your code


Cloud version and more at https://www.scanmycode.today

Cloud version has also many other plugins, also other plugins are commercially available for licensing (GitHub, GitHub organizations, Slack)

# Contribute

Looking for contributing individuals and organizations. Feel free to contact me at marcinguy@gmail.com

TODO

* update Dependencies (Backend & Frontend)
* update to latest React
* update to Python3
* update/add new Checkers (if you wish)

# Licensing

Scanmycode's QuantifiedCode parts remain released under BSD-3 Clause License. However, modifications are released under LGPL-2.1 with Commonsclause.

You can use this software, but cannot sell it, also base services on it (SaaS - Software as a Service setups). This is the Commonsclause. If you would like to do it, please contact me first for the permission at marcinguy@gmail.com

# Installation

We provide several options for installing Scanmycode. Which one is the right one for you
depends on your use case.

* The **manual installation** is best if you want to modify or change Scanmycode 
* The **Docker-based installation** is probably the easiest way to try Scanmycode without much work
* The **Ansible-based installation** is the most suitable way if you want to run Scanmycode in a professional infrastructure (possibly with multiple servers)

The following section will only discuss the manual installation process, for the other options please
check their corresponding repositories.

## Manual Installation

The installation consists of three parts:

* Install the dependencies required to run Scanmycode 
* Download the required source code
* Set up the configuration

### Installing Dependencies

Scanmycode requires the following external dependencies:

* A message broker (required for the background tasks message queue). We recommend either RabbitMQ or Redis.
* A database (required for the core application). We recommend PostgreSQL, but SQLite is supported as well. Other database systems might work too (e.g. MySQL), but are currently not officially supported. If you need to run Scanmycode on a non-supported database, please get in touch with us and we'll be happy to provide you some guidance.

### Download the Scanmycode CE source code

Now with the dependencies installed, we can go ahead and download Scanmycode:

    `git clone git@github.com:marcinguy/scanmycode-ce.git`

### Set up a virtual environment (optional)

In addition, it is advised to create a (Python 2.7) virtual environment to run Scanmycode in:

````
    virtualenv venv

    #activate the virtual environment
    source venv/bin/activate
````

### Install the required Python packages

Scanmycode CE manages dependencies via the Python package manager, pip. To install them, simply run

    `pip install -r requirements.txt`

### Edit Settings

Scanmycode gets configured via YAML settings files. When starting up the application, it incrementally loads settings from several files, recursively updating the settings object. First, it will load default settings from `quantifiedcode/settings/default.yml`. Then, it will check if a `QC_SETTINGS` environment variable is defined and points to a valid file, and if so it will load settings from it (possibly overwriting default settings). If not, it will look for a `settings.yml` file in the current working
directory and load settings from there. Additionally, it will check if a `QC_SECRETS` environment variable is defined and points to a valid file, and also load settings from there (this is useful for sensitive settings that should be kept separate from the rest [e.g. to not check them into version control]).

There is a sample `settings.yml` file in the root of the repository that you can start from.

### Running the Setup

After editing your settings, run the setup command via
````
    #run from the root directory of the repository
    python manage.py setup
````
The setup assistant will iteratively walk you through the setup, and when finished you should have a
working instance of Scanmycode!

### Running the web application

To run the web application, simply run

    `python manage.py runserver`

### Running the background worker

To run the background worker, simply run

    `python manage.py runworker`

## Docker-Based Installation

See docker folder. You can spin up everything using one command.

## Ansible-Based Installation

Coming Soon!
