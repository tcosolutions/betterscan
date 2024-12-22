



<div align="center">
  <a href="https://github.com/tcosolutions/betterscan">
    <img alt="Betterscan" src="https://cdn.prod.website-files.com/6339e3b81867539b5fe2498d/6662b3cba2059f268d0ada99_cloud%20(Website).svg">
  </a>
</div>
<h2 align="center">
  Open DevSecOps Orchestration Toolchain
</h2>

## License

Released under [AGPL-3.0](/LICENSE) by [@tcosolutions](https://github.com/tcosolutions).

Scan your source code and infra IaC against top **security** risks

## Overview

**Betterscan** is a state-of-the-art orchestration toolchain designed to scan your source code and Infrastructure as Code (IaC) for **security** and **compliance** risks. 

### Key Features


- **Language Support**: Java, Python, PERL, Ruby, C, C++, JavaScript, TypeScript, Go.
- **IaC Security**: Scans Docker, Kubernetes, Terraform (AWS, GCP, Azure) for misconfigurations.
- **Cloud Provider Checks**: AWS, Azure, GCP, Kubernetes, OpenStack, DigitalOcean, Oracle, and more.
- **Advanced Security Analysis**: 
  - Secret scanning
  - Trojan source detection
  - AI-powered analysis using OpenAI GPT
  - Graph-based scanning
- **Output Formats**: HTML, JSON, SARIF.
- **Developer-Friendly**: Unified results from top tools with additional custom checks.


 See https://github.com/tcosolutions/aigraphcodescan

## Open and Developer friendly DevSecOps toolchain

Betterscan uses many tools for Code, Cloud, secrets. All the best Tools, researched, setup, ran together, unifed and de-duplicated results, **so you don't have to do it**. Added our own checkers also. Continuous Security. Fit for purpose and results.


More info in **[Wiki](https://github.com/tcosolutions/betterscan/wiki)**

## License Information

## Debian Base Image

Docker images includes software from the Debian GNU/Linux distribution. Debian is made available under various open-source licenses. See below for details:

The full text of the licenses for software included in Debian can be found in /usr/share/common-licenses/ within the Debian system.

## Additional Software Licenses

Docker images includes software licensed under various licenses. The full license texts can be found in the image at `/srv/betterscan/LICENSE`.

If you want to scan your Code and Infrastructure (including Secrets, SBOMs, and dependencies)

Below setup is for Linux (Ubuntu), you can also run it on MacOS/Docker and Windows via WSL/Docker.



# Quickstart



## **2 options** are available:

### 1. Binary runtime

Scripts used checkmate CLI binary (python based)

Below are the checkmate current parameters:

Explanation of Parameters

```--backend:```

Specifies the backend type.

Choices: "sql" (default), "sqlite".

Example: --backend sql

```--backend-opts:```

Provides backend-specific options, such as the connection string for an SQL database or file path for SQLite.

Example for SQL: --backend-opts "postgresql://user:password@localhost/mydatabase"

Example for SQLite: --backend-opts "sqlite:///path/to/database.db"

defaults to memory store if not set for SQLite

```--path:```

Specifies the path to create the new project. Defaults to the current working directory if not specified.

Example: --path "/path/to/project"

```--pk:```

Sets the primary key for the project. If not provided, a UUID is generated.

Example: --pk "my_custom_primary_key"

Example Usage

To create a project with a SQL backend and a specific connection string:

```checkmate --backend sql --backend-opts "postgresql://user:password@localhost/mydatabase" --path "/path/to/project" --pk "custom_pk"```



#### CLI output

Run in command prompt in your Git repository folder:

`sh <(curl https://raw.githubusercontent.com/tcosolutions/betterscan/main/cli.sh)`

### HTML, JSON, SARIF output

The result will be in the current directory in "report.html", "report.json" and "report.sarif" file

Run in command prompt in your Git repository folder:
  
`sh <(curl https://raw.githubusercontent.com/tcosolutions/betterscan/main/cli-html.sh)`

### 2. Platform with Webinterface and workers

#### Docker

If you need CI/CD and Web Interface, you need Docker-Compose installed as well, if you don't already have it.

Run in command prompt:

```
git clone git@github.com:tcosolutions/betterscan.git
cd betterscan/dockerhub
docker compose up
```

#### Kubernetest / Minikube

Installable via helm chart.


Helm Chart for Betterscan.io DevSecOps Toolchain platform

Please install under name betterscan
```
helm repo add betterscan-repo https://marcinguy.github.io/betterscan-chart
helm repo update
helm install betterscan betterscan-repo/betterscan
```

Open up the Browser to:

`http://localhost:5000`

Sign up locally (and login in when needed)


## Installation Options

- **Linux (Ubuntu)**: Follow the default instructions provided in the Quickstart section.  
- **MacOS/Windows**: Use Docker or Windows Subsystem for Linux (WSL) for seamless compatibility.

That's it.

For more information, please visit the **[Wiki](https://github.com/tcosolutions/betterscan/wiki)**.
