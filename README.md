<div align="center">
  <a href="https://github.com/marcinguy/betterscan-ce">
    <img alt="Betterscan" src="https://uploads-ssl.webflow.com/6339e3b81867539b5fe2498d/633a1643dcb06d3029867161_g4.svg">
  </a>
</div>

<h2 align="center">
  Open DevSecOps Orchestration Toolchain
</h2>

[<img src="https://img.shields.io/discord/953265912302141460?label=Discord%20Chat">](https://discord.gg/3pvz7Tx9Zz) ![GitHub stars](https://badgen.net/github/stars/marcinguy/scanmycode-ce)
![Release](https://img.shields.io/github/v/release/marcinguy/betterscan-ce?sort=semver)
![GitHub forks](https://badgen.net/github/forks/marcinguy/scanmycode-ce)
![GitHub watchers](https://badgen.net/github/watchers/marcinguy/scanmycode-ce)
![GitHub issues](https://badgen.net/github/issues/marcinguy/scanmycode-ce)
![Docker Pulls](https://badgen.net/docker/pulls/scanmycode/scanmycode3-ce?icon=docker&label=pulls)
[![OpenSSF Best Practices](https://bestpractices.coreinfrastructure.org/projects/6958/badge)](https://bestpractices.coreinfrastructure.org/projects/6958)




Betterscan uses many tools for Code, Cloud, secrets, dependencies - SCA (software composition analysis) and Supply Chain Risks, and also precise Graph-based SAST analysis for Code and AI/OpenAI GPT. Please be patient with your analyses. **For commercial use PRO version is recommended (all features available)**

<p align="center">
  <img width="600" src="https://uploads-ssl.webflow.com/6339e3b81867539b5fe2498d/659fdb0bc81d97288ac27868_betterscan.svg">
</p>

Above is sample engine run powering everything (CLI, Web Platform, CI/CD Actions, GitHub App, DefectDojo, Reviewdog)

OpenAI GPT plugin is available only in PRO version and requires paid OpenAI plan (billed per usage)

If you want to scan your Code and Infrastructure (including Secrets, SBOMs, and dependencies)

Below setup is for Linux (Ubuntu), you can also run it on MacOS/Docker and Windows via WSL/Docker setup (see [here](https://github.com/marcinguy/betterscan-ce#platforms--oses))


![linux-win-mac-small-trans3](https://user-images.githubusercontent.com/20355405/228216738-b0551f1b-c99a-410e-b645-df796f0e3f59.png)





Install  Docker Engine ([Instructions for Ubuntu](https://docs.docker.com/engine/install/ubuntu/) or on Ubuntu via one command via snap `sudo snap install docker`), if you don't already have it, and run this in your Git code directory




# Quickstart



## **2 options** are available:

### CLI output

Run in command prompt in your Git repository folder:

`sh <(curl https://dl.betterscan.io/cli.sh)`

### HTML, JSON, SARIF output

The result will be in the current directory in "report.html", "report.json" and "report.sarif" file

Run in command prompt in your Git repository folder:
  
`sh <(curl https://dl.betterscan.io/cli-html.sh)`
    

If you need CI/CD and Web Interface, you need Docker-Compose [(Instructions for Ubuntu)](https://docs.docker.com/compose/install/) installed as well, if you don't already have it.

Run in command prompt (or ```docker-compose up``` or ```docker compose up``` ):

```
git clone https://github.com/marcinguy/betterscan-ce.git
cd betterscan-ce/dockerhub
./start.sh
```


Open up the Browser to:

`http://localhost:5000`

Sign up locally (and login in when needed)


That's it.

Read more in the **[Wiki](https://github.com/marcinguy/betterscan-ce/wiki)**, also for GitHub/GitLab/Azure DevOps Server integration, PR scanning, GitHub Action, GitHub App, DefectDojo, Reviewdog

Sample integrations for BitBucket Pipelines, GitLab CI, Google CloudBuild, CircleCI, Jenkins, TravisCI are also provided.
