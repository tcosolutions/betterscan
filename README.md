<div align="center">
  <a href="https://github.com/topcodersonline-solutions/betterscan-ce">
    <img alt="Betterscan" src="https://cdn.prod.website-files.com/6339e3b81867539b5fe2498d/6662b3cba2059f268d0ada99_cloud%20(Website).svg">
  </a>
</div>

<h2 align="center">
  Open DevSecOps Orchestration Toolchain
</h2>

![GitHub stars](https://badgen.net/github/stars/topcodersonline-solutions/betterscan-ce)
![Release](https://img.shields.io/github/v/release/topcodersonline-solutions/betterscan-ce?sort=semver)
![GitHub forks](https://badgen.net/github/forks/topcodersonline-solutions/betterscan-ce)
![GitHub watchers](https://badgen.net/github/watchers/topcodersonline-solutions/betterscan-ce)
![GitHub issues](https://badgen.net/github/issues/topcodersonline-solutions/betterscan-ce)
![Docker Pulls](https://badgen.net/docker/pulls/tcosolutions/betterscan-ce?icon=docker&label=pulls)
[![OpenSSF Best Practices](https://bestpractices.coreinfrastructure.org/projects/6958/badge)](https://bestpractices.coreinfrastructure.org/projects/6958)

Scan your source code and infra IaC against top **security** risks

Betterscan is a orchestration toolchain that uses state of the art tools to scan your source code and infrastructure IaC and analyzes your security and compliance risks.

Currently supports: **PHP**, **Java**, **Scala**, **Python**, **PERL**, **Ruby**, **.NET Full Framework**, **C#**, **C**, **C++**, **Swift**, **Kotlin**, **Apex (Salesforce)**, **Javascript**, **Typescript**, **GO**, Infrastructure as a Code (IaC) Security and Best Practices (**Docker**, **Kubernetes (k8s)**, **Terraform AWS, GCP, Azure**), Secret Scanning (**166+ secret types**), Dependency Confusion, Trojan Source, 

Open Source and Proprietary Checks (total ca. **6,000+ checks**). 

Checks for misconfigurations across all major (and some minor) cloud providers (AWS Checks, Azure Checks, GCP Checks, CloudStack Checks, DigitalOcean Checks, GitHub Checks, Kubernetes Checks, OpenStack Checks, Oracle Checks)


## Open and Developer friendly DevSecOps toolchain

Betterscan uses many tools for Code, Cloud, secrets, dependencies - SCA (software composition analysis) and Supply Chain Risks, and also precise Graph-based SAST analysis for Code and AI/OpenAI GPT. All the best Tools, researched, setup, ran together, unifed and de-duplicated results, **so you don't have to do it**. Added our own checkers also. Continuous Security. Fit for purpose and results.

<p align="center">
  <img width="600" src="https://uploads-ssl.webflow.com/6339e3b81867539b5fe2498d/659fdb0bc81d97288ac27868_betterscan.svg">
</p>

Above is sample engine (Binary runtime) run powering everything (CLI, Web Platform, CI/CD Actions, GitHub App, DefectDojo, Reviewdog)


<p align="center">
  <img width="600" src="https://assets-global.website-files.com/6339e3b81867539b5fe2498d/6339e4ff689e383aa9acb1f9_mainscreen-p-800.png">
</p>

Above is Web Interface.

Even more screenshots and integrations in **[Wiki](https://github.com/topcodersonline-solutions/betterscan-ce/wiki)**

## License Information

## Debian Base Image

Docker images includes software from the Debian GNU/Linux distribution. Debian is made available under various open-source licenses. See below for details:

The full text of the licenses for software included in Debian can be found in /usr/share/common-licenses/ within the Debian system.

## Additional Software Licenses

Docker images includes software licensed under various licenses. The full license texts can be found in the image at `/srv/betterscan/LICENSE`.

If you want to scan your Code and Infrastructure (including Secrets, SBOMs, and dependencies)

Below setup is for Linux (Ubuntu), you can also run it on MacOS/Docker and Windows via WSL/Docker setup (see [here](https://github.com/topcodersonline-solutions/betterscan-ce#platforms--oses))



Install  Docker Engine ([Instructions for Ubuntu](https://docs.docker.com/engine/install/ubuntu/) or on Ubuntu via one command via snap `sudo snap install docker`), if you don't already have it, and run this in your Git code directory




# Quickstart

Sigstore cosign images are available.


## **2 options** are available:

### 1. Binary runtime

#### CLI output

Run in command prompt in your Git repository folder:

`sh <(curl https://dl.betterscan.io/cli.sh)`

### HTML, JSON, SARIF output

The result will be in the current directory in "report.html", "report.json" and "report.sarif" file

Run in command prompt in your Git repository folder:
  
`sh <(curl https://dl.betterscan.io/cli-html.sh)`

### 2. Platform with Webinterface and workers

#### Docker

If you need CI/CD and Web Interface, you need Docker-Compose [(Instructions for Ubuntu)](https://docs.docker.com/compose/install/) installed as well, if you don't already have it.

Run in command prompt (or ```docker-compose up``` or ```docker compose up``` ):

```
git clone git@github.com:topcodersonline-solutions/betterscan-ce.git
cd betterscan-ce/dockerhub
docker compose up
```


Open up the Browser to:

`http://localhost:5000`

Sign up locally (and login in when needed)


That's it.

Read more in the **[Wiki](https://github.com/topcodersonline-solutions/betterscan-ce/wiki)**, also for GitHub/GitLab/Azure DevOps Server integration, PR scanning, GitHub Action, GitHub App, DefectDojo, Reviewdog

Sample integrations for BitBucket Pipelines, GitLab CI, Google CloudBuild, CircleCI, Jenkins, TravisCI are also provided.
