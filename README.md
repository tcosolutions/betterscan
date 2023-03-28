<div align="center">
  <a href="https://github.com/marcinguy/betterscan-ce">
    <img alt="Betterscan" src="https://uploads-ssl.webflow.com/6339e3b81867539b5fe2498d/633a1643dcb06d3029867161_g4.svg">
  </a>
</div>

<h2 align="center">
  Betterscan - Secure Code and Cloud
</h2>

[<img src="https://img.shields.io/discord/953265912302141460?label=Discord%20Chat">](https://discord.gg/3pvz7Tx9Zz) ![GitHub stars](https://badgen.net/github/stars/marcinguy/scanmycode-ce)
![GitHub forks](https://badgen.net/github/forks/marcinguy/scanmycode-ce)
![GitHub watchers](https://badgen.net/github/watchers/marcinguy/scanmycode-ce)
![GitHub issues](https://badgen.net/github/issues/marcinguy/scanmycode-ce)
![Docker Pulls](https://badgen.net/docker/pulls/scanmycode/scanmycode3-ce?icon=docker&label=pulls)
[![OpenSSF Best Practices](https://bestpractices.coreinfrastructure.org/projects/6958/badge)](https://bestpractices.coreinfrastructure.org/projects/6958)


Betterscan uses many tools for Code, Cloud, secrets, dependencies - SCA (software composition analysis) and Supply Chain Risks, and also precise Graph-based SAST analysis for Code. Please be patient with your analyses. **For commercial use PRO version is recommended (all features available)**

If you want to scan your Code and Infrastructure (including Secrets, SBOMs, and dependencies)

Below setup if for Linux (Ubuntu), you can also run it on MacOS/Docker and Windows via WSL/Docker setup (see [here](https://github.com/marcinguy/betterscan-ce#platforms--oses))


Install  Docker Engine ([Instructions for Ubuntu](https://docs.docker.com/engine/install/ubuntu/) or on Ubuntu via one command via snap `sudo snap install docker`), if you don't already have it, and run this in your Git code directory

**2 options** are available:

1. CLI output

Run in command prompt:

`sh <(curl https://dl.betterscan.io/cli.sh)`

2. HTML, JSON, SARIF output (the result will be in the current directory in "report.html", "report.json" and "report.sarif" file)

Run in command prompt:

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

Read more below for GitHub/GitLab/Azure DevOps Server integration, PR scanning, GitHub Action, GitHub App, DefectDojo, Reviewdog

Sample integrations for BitBucket Pipelines, GitLab CI, Google CloudBuild, CircleCI, Jenkins, TravisCI are also provided.

# What it does

Scanmycode is now called Betterscan (both references will work)

It is a Code and Infrastructure (IaC) and Cloud-native Scanning/SAST/Static Analysis/Linting solution using many tools/Scanners with One Report. You can also add any tool to it. Currently, it supports many languages and tech stacks. Similar to SonarQube, but it is different.


![betterscan-concept](https://user-images.githubusercontent.com/20355405/201513479-fda1db4d-ce99-4063-9f55-329885c6f809.png)


*Fig. 1 Betterscan concept diagram*

[How is Betterscan different than SonarQube?](#how-is-betterscan-different-than-sonarqube)

If you like it, please give it a GitHub star/fork/watch/contribute. This will ensure continuous development :star:

## Sponsors

This project would not be possible without the generous support of our sponsors.

<table>
  <tr>
    <td>Your Logo Here</td>
    <td>Your Logo Here</td>
    <td>Your Logo Here</td>
    <td>Your Logo Here</td>
  </tr>
</table>

If you also want to support this project, head over to our [Github sponsors page](https://github.com/sponsors/marcinguy) or [Patreon](https://www.patreon.com/marcinguy) (preferred due to better Tax handling)

# TL;DR


Run this command in your code directory (checkout from Git - .git folder needs to be there, if you work with the normal directory, make the Git repo out of it `git init && git add . && git commit` etc):

`sh <(curl https://dl.betterscan.io/cli.sh)`

or for an HTML report:

`sh <(curl https://dl.betterscan.io/cli-html.sh)`

That's it. You just checked your code for 2,300+ Checks (Defects, Vulnerabilities, Best Practices, Secrets - 166+ secret types - including GitLeaks, SBOM, and dependencies vulnerabilities - SCA (software composition analysis) and Supply Chain Risks) and 4,000+ YARA rules for Antidebug, Antivm, Crypto, CVE, Exploits Kits, Malware, Web shells, and APTs.

Sample CLI report

![image](https://user-images.githubusercontent.com/20355405/213869272-b360c1d1-6696-4adc-9ab2-c36c0230ef7a.png)

*Fig. 2 Sample Report using CLI output*

Sample HTML report

![image](https://user-images.githubusercontent.com/20355405/213869590-89034c1b-ffe1-474e-b7f5-66abb86b9745.png)

*Fig 3. Sample Report using CLI HTML output*

FYI Above will maintain state via (.checkmate folder). Only new commits will be checked.

If you want to use the Platform, follow below:

# Installation

## Local

<h4>To install it, first:</h4>

Install `docker` and `docker-compose`  
 
<h5>then:</h5>

<strong>2 options:</strong>

1) Fastest method (use DockerHub built images). If unsure, use this.

```
git clone https://github.com/marcinguy/betterscan-ce.git
cd betterscan-ce/dockerhub
./start.sh
```

or 

Run in command prompt ```docker-compose up``` or ```docker compose up```

2) Slower method (build everything)

```
git clone https://github.com/marcinguy/betterscan-ce.git
cd betterscan-ce/docker
./start.sh
```

or 

Run in command prompt ```docker-compose up``` or ```docker compose up```


Open up the Browser to:

`http://localhost:5000`

Sign up locally (and login in when needed)

## Cloud

Cloud and Kubernetes (scaling) installation:

If your connection is not fast and/or you have no server.

Installation time: ca. 1 minute

Check installation on Kubernetes (Free) thanks to Okteto.com

https://github.com/marcinguy/betterscan-ce/blob/master/okteto/README.md

## GitHub Action

WIP (Work in Progress)

Add this to your workflow (in your GitHub repo under .github/workflows/betterscan.yml) with this content:


```
env:
  LIC: ${{secrets.LIC}}
  SNYK_TOKEN: ${{secrets.SNYK_TOKEN}}
  

name: Betterscan Scan
on: [push]
jobs:
  Betterscan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0
      - name: Betterscan Scan
        uses: topcodersonline/betterscan@v3
      - name: Upload the SARIF file
        uses: github/codeql-action/upload-sarif@v2
        with:
          sarif_file: report.sarif
```

Results will be printed in Job/Action output. Plan to add SARIF output to integrate it in GitHub Code Scanning Interface/tab (possibly in PRO version only) 

See sample integration below:

![image](https://user-images.githubusercontent.com/20355405/180461548-8fbb6c47-0314-4f37-90f1-4292f788caf3.png)

*Fig 4. Sample integration with GitHub Action in Code Scanning tab*

Make sure in your GitHub Repository under Settings->Actions->General the "Workflow permissions" are set to "Read and write permissions"

If you want to scan on PR to main, use this:

```
env:
  LIC: ${{secrets.LIC}}
  SNYK_TOKEN: ${{secrets.SNYK_TOKEN}}
  

name: Betterscan Scan
on: 
 pull_request:
   types: [opened, edited, reopened, review_requested, synchronize]
   branches:
      - 'main'
jobs:
  Betterscan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0
      - name: Betterscan Scan
        uses: topcodersonline/betterscancustom@v1
        with:
         branch: ${{ github.head_ref || github.ref_name }}
      - name: Upload the SARIF file
        uses: github/codeql-action/upload-sarif@v2
        with:
          sarif_file: report.sarif
          
```

Action source:
https://github.com/topcodersonline/betterscancustom

Feel free to adjust.

Flow:
1) Make PR
2) It will scan
3) make git pull to get state (.checkmate folder) on your PR
4) make changes, commits, push to PR
5) repeat 2)

If you cannot afford GitHub Enterprise with Code Scanning, use GitHub Teams with CLI output.

It is also possible to use Database Server (i.e PostgreSQL, MySql, MariaDB, Oracle, MS SQL Server) to store state (no need to commit .checkmate folder to code).

## GitHub App

You can also install it as a GitHub App

https://github.com/apps/betterscan-code-scan

![image](https://user-images.githubusercontent.com/20355405/201154860-4eac4a2b-8fea-4ba3-b38b-728a5bac5588.png)


Results will be integrated in GitHub interface (Security->Code Scanning alerts). GitHub Enterprise Cloud and a license for GitHub Advanced Security are required for private repositories, not public repositories.

Scanning is triggered on Push/PR merge to main branch (master or main etc). Results could be there within minutes or hours, depending on project size.

Scan state will be preserved between scans. With new scan only changes will be rescanned.

## Reviewdog Integration

Supports: GitHub, GitHub Actions,  GitLab, BitBucket, Circle CI, Travis, Common (Jenkins, local, etc) 


Please follow instructions at Reviewdog (https://github.com/haya14busa/reviewdog)

Sample run it like this:

```
cat report.json| jq -f to-rdjson.jq | $HOME/bin/reviewdog -f=rdjson -reporter=github-check
```


to-rdjson.jq file:
```
{
  source: {
    name: "betterscan",
    url: "https://github.com/marcinguy/betterscan-ce"
  },
  diagnostics: . | map({
    message: .description,
    code: {
      value: .hash,
      url: "https://github.com/marcinguy/betterscan-ce",
    } ,
    location: {
      path: .file,
      range: {
        start: {
          line: .line,
          column: 1
        }
      }
    },
    severity: ((.severity|ascii_upcase|select(match("ERROR|WARNING|INFO")))//null)
  })
}
```

If you wish to run Reviewdog as GitHub Action.

Make sure in your GitHub Repository under Settings->Actions->General the "Workflow permissions" are set to "Read and write permissions"

If you want to scan on PR to main, use this. This will scan commit or PR.

Create file under .github/worlflows/reviewdog.yml

```
env:
  LIC: ${{secrets.LIC}}
  SNYK_TOKEN: ${{secrets.SNYK_TOKEN}}

name: Reviewdog
on: 
 pull_request:
   types: [opened, edited, reopened, review_requested, synchronize]
   branches:
      - 'main'
jobs:
  Betterscan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0
      - name: Betterscan Scan
        uses: topcodersonline/betterscancustom@v1
        with:
         branch: ${{ github.head_ref || github.ref_name }}   
      - uses: "finnp/create-file-action@master"
        env:
          FILE_NAME: "to-rdjson.jq"
          FILE_BASE64: "ewogIHNvdXJjZTogewogICAgbmFtZTogImJldHRlcnNjYW4iLAogICAgdXJsOiAiaHR0cHM6Ly9naXRodWIuY29tL21hcmNpbmd1eS9iZXR0ZXJzY2FuLWNlIgogIH0sCiAgZGlhZ25vc3RpY3M6IC4gfCBtYXAoewogICAgbWVzc2FnZTogLmRlc2NyaXB0aW9uLAogICAgY29kZTogewogICAgICB2YWx1ZTogLmhhc2gsCiAgICAgIHVybDogImh0dHBzOi8vZ2l0aHViLmNvbS9tYXJjaW5ndXkvYmV0dGVyc2Nhbi1jZSIsCiAgICB9ICwKICAgIGxvY2F0aW9uOiB7CiAgICAgIHBhdGg6IC5maWxlLAogICAgICByYW5nZTogewogICAgICAgIHN0YXJ0OiB7CiAgICAgICAgICBsaW5lOiAubGluZSwKICAgICAgICAgIGNvbHVtbjogMQogICAgICAgIH0KICAgICAgfQogICAgfSwKICAgIHNldmVyaXR5OiAoKC5zZXZlcml0eXxhc2NpaV91cGNhc2V8c2VsZWN0KG1hdGNoKCJFUlJPUnxXQVJOSU5HfElORk8iKSkpLy9udWxsKQogIH0pCn0="
      - uses: reviewdog/action-setup@v1
        with:
          reviewdog_version: latest # Optional. [latest,nightly,v.X.Y.Z]
      - name: Run reviewdog
        env:
          REVIEWDOG_GITHUB_API_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          cat report.json| jq -f to-rdjson.jq | reviewdog -f=rdjson -reporter=github-check
```

Sample screenshot:

![image](https://user-images.githubusercontent.com/20355405/224292458-a8bd5d24-cdc8-4877-8812-0e648de9bb8d.png)



If you want a PR review with comments, use this:

```
env:
  LIC: ${{secrets.LIC}}
  SNYK_TOKEN: ${{secrets.SNYK_TOKEN}}
  REVIEWDOG_GITHUB_API_TOKEN: ${{secrets.REVIEWDOG_GITHUB_API_TOKEN}}

name: Review
on: 
 pull_request:
   types: [opened, edited, reopened, review_requested, synchronize]
   branches:
      - 'main'
jobs:
  Betterscan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0
      - name: Betterscan Scan
        uses: topcodersonline/betterscancustom@v1
        with:
         branch: ${{ github.head_ref || github.ref_name }}   
      - uses: "finnp/create-file-action@master"
        env:
          FILE_NAME: "to-rdjson.jq"
          FILE_BASE64: "ewogIHNvdXJjZTogewogICAgbmFtZTogImJldHRlcnNjYW4iLAogICAgdXJsOiAiaHR0cHM6Ly9naXRodWIuY29tL21hcmNpbmd1eS9iZXR0ZXJzY2FuLWNlIgogIH0sCiAgZGlhZ25vc3RpY3M6IC4gfCBtYXAoewogICAgbWVzc2FnZTogLmRlc2NyaXB0aW9uLAogICAgY29kZTogewogICAgICB2YWx1ZTogLmhhc2gsCiAgICAgIHVybDogImh0dHBzOi8vZ2l0aHViLmNvbS9tYXJjaW5ndXkvYmV0dGVyc2Nhbi1jZSIsCiAgICB9ICwKICAgIGxvY2F0aW9uOiB7CiAgICAgIHBhdGg6IC5maWxlLAogICAgICByYW5nZTogewogICAgICAgIHN0YXJ0OiB7CiAgICAgICAgICBsaW5lOiAubGluZSwKICAgICAgICAgIGNvbHVtbjogMQogICAgICAgIH0KICAgICAgfQogICAgfSwKICAgIHNldmVyaXR5OiAoKC5zZXZlcml0eXxhc2NpaV91cGNhc2V8c2VsZWN0KG1hdGNoKCJFUlJPUnxXQVJOSU5HfElORk8iKSkpLy9udWxsKQogIH0pCn0="
      - uses: reviewdog/action-setup@v1
        with:
          reviewdog_version: latest # Optional. [latest,nightly,v.X.Y.Z]
      - name: Run reviewdog
        run: |
          cat report.json| jq -f to-rdjson.jq | reviewdog -f=rdjson -reporter=github-pr-review -filter-mode=nofilter -level=error -tee
```

Sample screenshot:

![image](https://user-images.githubusercontent.com/20355405/224292328-d7238b6c-5867-45f3-b76d-0de2c24eadc1.png)

Flow:
1) Make PR
2) It will scan
3) make git pull to get state (.checkmate folder) on your PR
4) make changes, commits, push to PR
5) repeat 2)



## GitLab Integration

It is possible to integrate results also in GitLab's Security & Compliance Dashboad. We can convert SARIF to GitLab format. GitLab Ultimate is required. 

## Backstage Integration (BETA)

You can see the Security posture of scanned repositories by installing Betterscan platform and below in Backstage:

https://github.com/marcinguy/backstage-plugin-betterscan

## DefectDojo Integration

You can import via SARIF vulnerabilities and setup a pipeline in DefectDojo to manage vulnerabilities.

![image](https://user-images.githubusercontent.com/20355405/210390155-f5602cf4-1095-4552-b14a-2c26dcf7869b.png)


## Azure DevOps Integration

To integrate BetterScan with Azure DevOps, you can do the following:
1. Install the Azure DevOps [SARIF SAST Scans Tab](https://marketplace.visualstudio.com/items?itemName=sariftools.scans) extension.
2. Add this job to your azure-pipelines.yml:
```yml
  - job: SAST
    displayName: Static Application Security Test (SAST)
    condition: eq(variables['Build.SourceBranch'], 'refs/heads/main')
    pool:
      vmImage: 'ubuntu-latest'
    container: 'scanmycode/scanmycode3-ce:worker-cli'
    steps:
    - script: |
        sudo apt-get update
        sudo apt-get install git-lfs
      displayName: Install git LFS
      
    - checkout: self
      persistCredentials: true

    - script: |
        set -e
        git config --global --add safe.directory $(Build.SourcesDirectory)
        git config --global user.email "azuredevops@microsoft.com"
        git config --global user.name "Azure DevOps" 
        git checkout -b $(Build.SourceBranchName)
        sudo CODE_DIR=$(Build.SourcesDirectory) checkmate init
        sudo CODE_DIR=$(Build.SourcesDirectory) checkmate git init
        sudo CODE_DIR=$(Build.SourcesDirectory) checkmate git analyze --branch $(Build.SourceBranchName)
        sudo CODE_DIR=$(Build.SourcesDirectory) checkmate issues html
      displayName: Static Application Security Test (SAST)
      env:
        CODE_DIR: '$(Build.SourcesDirectory)'

    - task: PublishBuildArtifacts@1
      displayName: Publish SAST report
      inputs:
        PathtoPublish: $(Build.SourcesDirectory)
        ArtifactName: CodeAnalysisLogs

    - script: |
        git add .checkmate/db.sqlite
        git add report.html
        git commit -m '[ci skip] update checkmate db'
        git push origin $(Build.SourceBranchName):$(Build.SourceBranch)
      displayName: Commit and Push checkmate db
```
> Warning: 

## Sample integrations for BitBucket Pipelines, GitLab CI, Google CloudBuild, CircleCI, Jenkins, TravisCI

## BitBucket Pipelines


bitbucket-pipelines.yml


Docker based step
```
image: scanmycode/scanmycode3-ce:worker-cli

pipelines:
  default:
    - step:
        script:
         - sh <(curl https://dl.betterscan.io/cli.sh)
```          

AppImage based step
```
pipelines:
  default:
    - step:
        script:
          - sh <(curl https://dl.betterscan.io/cli.sh)
```          
## GitLab CI


.gitlab-ci.yml

```
variables:
  GITHUB_TOKEN: $GITHUB_TOKEN
scan:
  stage: test
  image:
    name: scanmycode/scanmycode3-ce:worker-cli
  script:
    - sh <(curl https://dl.betterscan.io/cli.sh)
  rules:
    - when: always
  artifacts:
    name: "$CI_JOB_NAME-$CI_COMMIT_REF_NAME"
    paths:
      - $CI_PROJECT_DIR/reports/
    when: always
```

## Google CloudBuild

```
steps:
  - name: scanmycode/scanmycode3-ce:worker-cli
    entrypoint: sh <(curl https://dl.betterscan.io/cli.sh)
    env:
      - "WORKSPACE=https://github.com/$REPO_NAME/blob/$COMMIT_SHA"
      - "GITHUB_TOKEN=${_GITHUB_TOKEN}"

substitutions:
  _GITHUB_TOKEN: Token with read:packages scope
```

## CircleCI
```
version: 2.1

jobs:
  build:
    docker:
      - image: scanmycode/scanmycode3-ce:worker-cli
        environment:
          GITHUB_TOKEN: $GITHUB_TOKEN
          WORKSPACE: ${CIRCLE_REPOSITORY_URL}/blob/${CIRCLE_SHA1}
    working_directory: ~/repo
    steps:
      - checkout
      - run:
          name: Perform Scan
          command: |
            sh <(curl https://dl.betterscan.io/cli.sh)
      - store_artifacts:
          path: reports
          destination: sast-scan-reports
```

## Jenkins

Jenkinsfile
```
stages {
    stage('Scan') {
        agent {
            docker { image 'scanmycode/scanmycode3-ce:worker-cli' }
        }
        steps {
            sh 'sh <(curl https://dl.betterscan.io/cli.sh)'
        }
    }
}
```

## TravisCI

```
services:
  - docker

script:
  - docker run -v $PWD:/app scanmycode/scanmycode3-ce:worker-cli sh <(curl https://dl.betterscan.io/cli.sh)
```


## Platforms & OS'es

It is platform independent (Python). Checkers are also primarily available on different platforms. The "Master" branch is for Linux x86_64

### Linux (amd64)

Yes, by default 

### MacOS

Yes, by default 

### Windows (amd64)

#### Docker Desktop

Install Windows 10, version 1903 or higher or Windows 11.

https://docs.docker.com/desktop/windows/wsl/

Linux images should work.

#### WSL Docker

If you want to use WSL Docker, follow this:

```wsl --update```

Check if you are running the Microsoft Store version of WSL version 0.67.6 and higher from the command prompt or the Powershell.

```wsl --version```

Install Ubuntu, i.e:


```wsl --install Ubutnu-22.04```

Steps


Here are the steps to install Docker and run Docker in WSL distro.


1) Enable systemd

From the WSL distro (e.g., Ubuntu 22.04.1 LTS) terminal, edit /etc/wsl.conf file.

```sudo nano /etc/wsl.conf```

and add

```
[boot]
systemd=true
```

And close out of the nano editor using CTRL+O to save and CTRL+X to exit. Exit the WSL distro (e.g., Ubuntu 22.04.1 LTS) terminal.

2) Install docker

From the WSL distro (e.g., Ubuntu 22.04.1 LTS) terminal, update the local repository.
```
sudo apt update
```
Install Docker.

```
sudo apt install docker.io -y
```

Add the user to the docker group.

```
sudo usermod -aG docker $USER
```

Check Docker installation.

```
docker --version
```


4. Validate Docker installation

Exit out of the terminal.

```
exit
```

From either the command prompt or PowerShell, shutdown WSL.

```
wsl --shutdown
```

Enter the WSL distro (e.g., Ubuntu 22.04.1 LTS) via Windows terminal and validate the docker installation.

```
docker run hello-world
```

It should display Hellow from Docker message.


You have completed the installation of Docker! You are able to run docker in WSL without Docker Desktop.


Run this in Powershell

cli.ps1

```
env:CODE_DIR = $PWD.Path
cd $env:CODE_DIR
docker run -e $env:CODE_DIR -e $env:LIC -e $env:SNYK_TOKEN -v $PWD.Path:$PWD.Path -ti  scanmycode/scanmycode3-ce:worker-cli /bin/sh -c 'cd $CODE_DIR  && git config --global --add safe.directory $CODE_DIR && checkmate init'
docker run -e $env:CODE_DIR -e $env:LIC -e $env:SNYK_TOKEN -v $PWD.Path:$PWD.Path -ti  scanmycode/scanmycode3-ce:worker-cli /bin/sh -c 'cd $CODE_DIR && git config --global --add safe.directory $CODE_DIR && checkmate git init'
docker run -e $env:CODE_DIR -e $env:LIC -e $env:SNYK_TOKEN -v $PWD.Path:$PWD.Path -ti  scanmycode/scanmycode3-ce:worker-cli /bin/sh -c 'cd $CODE_DIR && git config --global --add safe.directory $CODE_DIR && checkmate git analyze --branch `git rev-parse --abbrev-ref HEAD`'
docker run -e $env:CODE_DIR -e $env:LIC -e $env:SNYK_TOKEN -v $PWD.Path:$PWD.Path -ti  scanmycode/scanmycode3-ce:worker-cli /bin/sh -c 'cd $CODE_DIR && git config --global --add safe.directory $CODE_DIR && checkmate issues'
```

or this in WSL Bash (like you would do with typical Linux)

```
export CODE_DIR=${PWD}
cd $CODE_DIR
docker run -e CODE_DIR -e LIC -e SNYK_TOKEN -v ${PWD}:${PWD}  -ti  scanmycode/scanmycode3-ce:worker-cli /bin/sh -c 'cd $CODE_DIR && git config --global --add safe.directory $CODE_DIR && checkmate init'
docker run -e CODE_DIR -e LIC -e SNYK_TOKEN -v ${PWD}:${PWD}  -ti  scanmycode/scanmycode3-ce:worker-cli /bin/sh -c 'cd $CODE_DIR && git config --global --add safe.directory $CODE_DIR && checkmate git init'
docker run -e CODE_DIR -e LIC -e SNYK_TOKEN -v ${PWD}:${PWD}  -ti  scanmycode/scanmycode3-ce:worker-cli /bin/sh -c 'cd $CODE_DIR && git config --global --add safe.directory $CODE_DIR && checkmate git analyze --branch `git rev-parse --abbrev-ref HEAD`'
docker run -e CODE_DIR -e LIC -e SNYK_TOKEN -v ${PWD}:${PWD}  -ti  scanmycode/scanmycode3-ce:worker-cli /bin/sh -c 'cd $CODE_DIR && git config --global --add safe.directory $CODE_DIR && checkmate issues'
```

## Local IDE 

### Visual Studio Code plugin (BETA/WIP)

[Betterscan Visual Studio Code plugin](https://marketplace.visualstudio.com/items?itemName=Betterscan.Betterscan)

Extension source repo: [extension source](https://github.com/marcinguy/betterscan-vscode)

Usage: Ctrl-P and then `> Betterscan scan` will trigger the scan in your opened Workfolder. 

You will see a message in IDE:

`Betterscan Scan init` on start
`Betterscan Scan complete` on the finish

After the scan is complete, you can view `report.sarif` in a directory using VS Code [SARIF Viewer plugin](https://marketplace.visualstudio.com/items?itemName=MS-SarifVSCode.sarif-viewer).


![image](https://user-images.githubusercontent.com/20355405/212480081-7a0279de-a9ca-43b2-b7eb-9c25583cad4a.png)


## Usage

More info in the Wiki:

https://github.com/marcinguy/betterscan-ce/wiki

## Advanced Usage (CLI Mode only)

You can plug it anywhere on your CI/CD pipeline as a command.

With Betterscan one command, you add 6,300+ checks using different scanners (Betterscan is a "Meta" scanner in that sense, with supporting smart snapshots and other goodies. It is not just running tools always on full code) 

Betterscan supports also CLI only mode, no Web Interface, worker etc. Run a binary in Docker in your own CI/CD pipeline (whatever it is) in Quality Gates that will output line by line (scanner and findings) on checkout code from Git (folder) 


### Quick Install


#### Plain CLI output

Just run this command (it will take care of everything):


`sh <(curl https://dl.betterscan.io/cli.sh)`

Corresponds to running these:

```
export CODE_DIR=${PWD}
cd $CODE_DIR
docker run -e CODE_DIR -e LIC -e SNYK_TOKEN -v ${PWD}:${PWD}  -ti  scanmycode/scanmycode3-ce:worker-cli /bin/sh -c 'cd $CODE_DIR && checkmate init'
docker run -e CODE_DIR -e LIC -e SNYK_TOKEN -v ${PWD}:${PWD}  -ti  scanmycode/scanmycode3-ce:worker-cli /bin/sh -c 'cd $CODE_DIR && checkmate git init'
docker run -e CODE_DIR -e LIC -e SNYK_TOKEN -v ${PWD}:${PWD}  -ti  scanmycode/scanmycode3-ce:worker-cli /bin/sh -c 'cd $CODE_DIR && checkmate git analyze --branch `git rev-parse --abbrev-ref HEAD`'
docker run -e CODE_DIR -e LIC -e SNYK_TOKEN -v ${PWD}:${PWD}  -ti  scanmycode/scanmycode3-ce:worker-cli /bin/sh -c 'cd $CODE_DIR && checkmate issues'
```

#### HTML CLI output

Just run this command (it will take care of everything):

`sh <(curl https://dl.betterscan.io/cli-html.sh)`

report will be in the directory under `report.html`


Corresponds to running these:

```
export CODE_DIR=${PWD}
cd $CODE_DIR
docker run -e CODE_DIR -e LIC -e SNYK_TOKEN -v ${PWD}:${PWD}  -ti  scanmycode/scanmycode3-ce:worker-cli /bin/sh -c 'cd $CODE_DIR && checkmate init'
docker run -e CODE_DIR -e LIC -e SNYK_TOKEN -v ${PWD}:${PWD}  -ti  scanmycode/scanmycode3-ce:worker-cli /bin/sh -c 'cd $CODE_DIR && checkmate git init'
docker run -e CODE_DIR -e LIC -e SNYK_TOKEN -v ${PWD}:${PWD}  -ti  scanmycode/scanmycode3-ce:worker-cli /bin/sh -c 'cd $CODE_DIR && checkmate git analyze --branch `git rev-parse --abbrev-ref HEAD`'
docker run -e CODE_DIR -e LIC -e SNYK_TOKEN -v ${PWD}:${PWD}  -ti  scanmycode/scanmycode3-ce:worker-cli /bin/sh -c 'cd $CODE_DIR && checkmate issues html'
```

### Detailed explanation


Build Docker image Worker-CLI and run `checkmate` from there. Below is a sample flow:


CLI Mode only

1) Clone the repo i.e into `/tmp/test`
2) set env var CODE_DIR i.e `export CODE_DIR=/tmp/test`. This env var should point to your Git cloned repo dir. Set LIC env and optionally SNYK_TOKEN var. 
3) Cd into it (this is important!)
4) Run `checkmate init`
5) Run `checkmate git init`
6) Run `checkmate git analyze`


Run `checkmate issues`

This will be shown
```
Loading plugin: git
Loading plugin: trufflehog3
Loading plugin: trojansource
Loading plugin: metrics
Loading plugin: bandit
Loading plugin: brakeman
Loading plugin: phpanalyzer
Loading plugin: gosec
Loading plugin: confused
Loading plugin: snyk
Loading plugin: pmd
Loading plugin: semgrep
Loading plugin: semgrepdefi
Loading plugin: semgrepjs
Loading plugin: checkov
Loading plugin: kubescape
Loading plugin: insidersecswift
Loading plugin: insiderseckotlin
Loading plugin: insiderseccsharp
Loading plugin: pmdapex
Loading plugin: semgrepccpp
Loading plugin: semgrepjava
Loading plugin: semgrepeslint
Loading plugin: graudit
Loading plugin: text4shell
Loading plugin: yara
Loading plugin: osvscanner
Loading plugin: fluidattacksscanner
Loading plugin: gostaticcheck

```

There is a DockerHub image also for it ready.

`docker pull scanmycode/scanmycode3-ce:worker-cli`

You can run the Commands with docker as below:

```
$ docker run -ti  scanmycode/scanmycode3-ce:worker-cli checkmate
Loading plugin: git
Loading plugin: trufflehog3
Loading plugin: trojansource
Loading plugin: metrics
Loading plugin: bandit
Loading plugin: brakeman
Loading plugin: phpanalyzer
Loading plugin: gosec
Loading plugin: confused
Loading plugin: snyk
Loading plugin: pmd
Loading plugin: semgrep
Loading plugin: semgrepdefi
Loading plugin: semgrepjs
Loading plugin: checkov
Loading plugin: kubescape
Loading plugin: insidersecswift
Loading plugin: insiderseckotlin
Loading plugin: insiderseccsharp
Loading plugin: pmdapex
Loading plugin: semgrepccpp
Loading plugin: semgrepjava
Loading plugin: semgrepeslint
Loading plugin: graudit
Loading plugin: text4shell
Loading plugin: yara
Loading plugin: osvscanner
Loading plugin: fluidattacksscanner
Loading plugin: gostaticcheck
Usage: checkmate [command] [command] [...] [args]

Type "checkmate help" for help
```

Same workflow as above, but using Docker binary:

```
export CODE_DIR=/tmp/test
cd /tmp/test
docker run -e CODE_DIR -e LIC -e SNYK_TOKEN -v /tmp/test:/tmp/test  -ti  scanmycode/scanmycode3-ce:worker-cli /bin/sh -c 'cd /tmp/test && checkmate init'
docker run -e CODE_DIR -e LIC -e SNYK_TOKEN -v /tmp/test:/tmp/test  -ti  scanmycode/scanmycode3-ce:worker-cli /bin/sh -c 'cd /tmp/test && checkmate git init'
docker run -e CODE_DIR -e LIC -e SNYK_TOKEN -v /tmp/test:/tmp/test  -ti  scanmycode/scanmycode3-ce:worker-cli /bin/sh -c 'cd /tmp/test && checkmate git analyze'
docker run -e CODE_DIR -e LIC -e SNYK_TOKEN -v /tmp/test:/tmp/test  -ti  scanmycode/scanmycode3-ce:worker-cli /bin/sh -c 'cd /tmp/test && checkmate issues'
```


# Under the hood

Progpilot, PMD, Bandit, Brakeman, Gosec, gostaticcheck, confused, snyk, semgrep, trufflehog3, jshint, njsscan, log4shell via custom semgrep rule, checkov, kubescape, graudit, insidersec, flawfinder, find sec bugs, eslint, YARA, [osv-scanner](https://github.com/google/osv-scanner#readme), fluidattacks scanner and other(s). Some were modified. 

# Recorded DEMO

Community Edition does not have GitHub support and other plugins. But rest is the same.

![betterscan-demo](https://user-images.githubusercontent.com/20355405/152678316-04fdcd54-73e8-42f8-9bf2-fb9a69618ff9.gif)

or Check the:

[Live Demo](https://app.betterscan.io/explore)

### How is Betterscan different than SonarQube?

Both use static analysis to find bugs and defects, but there are a few differences. 

- Betterscan supports Cloud-native and Infrastructure Scanning
- Betterscan supports secrets Scanning (166+ secret types - including GitLeaks) 
- Betterscan scans for 4,000 rules for  Antidebug, Antivm, Crypto, CVE, Exploits Kits, Malware and Web shells, APTs
- Betterscan scans SBOM and Dependencies vulnerabilities
- Betterscan can be extended with any tool producing JSON output (any binary, in any technology/language/product)

Above are the biggest differences. 

- Betterscan is open Source, SonarQube also offers an open-source version, but it is missing features (For example, 12 of the supported languages are not available in the open-source offering, and more powerful dataflow features are only available in the paid versions) 
- Betterscan supports scanning only changed files (differential analysis), SonarQube does not. You can store state in Database (PostgreSQL, MySQL/MariaDB, Oracle, Microsoft SQL Server) or in you Git repo. 
- Outputs in CLI, HTML, SARIF, JSON. This works nicely with GitHub Codescanning, GitLab Security and Compliance and Azure DevOps Server
- Betterscan uses many tools adding up to 6,300+ checks which also semgrep as one of the tools (without semgrep community rules, only Betterscan's custom rules) 



# Even more screenshots from scanning real projects

![image](https://user-images.githubusercontent.com/20355405/154044790-a07ef065-9881-4ab6-ba05-ddf5be84e19a.png)
![image](https://user-images.githubusercontent.com/20355405/154044817-92d3ebde-45b6-4b63-a0ee-414001effbe0.png)
![image](https://user-images.githubusercontent.com/20355405/154044857-f53f1922-7e0c-4ede-ad96-b1d21075dad3.png)
![image](https://user-images.githubusercontent.com/20355405/154044887-4d69d551-9cb3-4892-85e0-1383eeab8332.png)
![image](https://user-images.githubusercontent.com/20355405/154044929-74ea5e0f-550e-4833-bd33-8d285e2195dd.png)
![image](https://user-images.githubusercontent.com/20355405/154044957-3ace283a-bb76-4f15-9f49-520d6f21e7d3.png)
![smc-defi-sample](https://user-images.githubusercontent.com/20355405/169240036-1d6652fa-0724-42cf-ac41-2bbcf7398def.png)
![smc-iac](https://user-images.githubusercontent.com/20355405/169240091-2171b1c6-9931-46be-ae97-a9f827c0120c.png)
![terra](https://user-images.githubusercontent.com/20355405/169240143-3d590a0a-bd39-4652-9556-12ccdd4563d7.png)
![image](https://user-images.githubusercontent.com/20355405/169540378-22deb07c-1665-4614-915c-511f24689438.png)



# Welcome to Betterscan CE (Community Edition)!


Betterscan is based on QuantifedCode. QuantifiedCode is a code analysis \& automation platform. It helps you to keep track of issues and
metrics in your software projects, and can be easily extended to support new types of analyses.
The application consists of several parts:

* A frontend, realized as a React.js app
* A backend, realized as a Flask app, that exposes a REST API consumed by the frontend
* A background worker, realized using Celery, that performs the code analysis

Currently supports: PHP, Java, Scala, Python, PERL, Ruby, .NET Full Framework, C#, C, C++, Swift, Kotlin, Apex (Salesforce), Javascript, Typescript, GO, Solidity, DeFi Security (DeFi exploits), Infrastructure as a Code (IaC) Security and Best Practices (Docker, Kubernetes (k8s), Terraform AWS, GCP, Azure), Secret Scanning (166+ secret types), Dependency Confusion, Trojan Source, Open Source and Proprietary Checks (total ca. 6,000+ checks) 

Advantages:
* Many tools, one report (unification) 
* Dismiss, and collaborate on findings. Mark false-positives
* Enable/disable each individual check in Checkers
* ca. 6,300+ checks now (Linters, Static Code Analysis/Code Scanning, YARA Ca. 4000 YARA binary matching/textual matching rules for Antidebug, Antivm, Crypto, CVE, Exploits Kits, Malware and Webshells, APTs ) 
* any tool outputting JSON can be added
* SBOM and Dependencies vulnerabilities
* fast (checks only new code on recheck) 
* you can store state in Database (PostgreSQL, MySQL/MariaDB, Oracle, Microsoft SQL Server) or in you Git repo.
* Outputs in CLI, HTML, SARIF, JSON. This works nicely with GitHub Codescanning, GitLab Security and Compliance and Azure DevOps Server
* Git support (HTTPS/TLS and SSH). For private repositories only SSH. 
* all REST API callable (CI/CD integrateable)
* Swiss army knife tool/SIEM for Code Scanning
* 100% Code transparency & full control of your code


Cloud version and more at https://www.betterscan.io

Cloud version also has many other plugins. Also other plugins are commercially available for licensing (GitHub, GitHub organizations, Slack)

# Contribute

## **Contributing**

Feel free to use, recommend improvements, or contribute to new implementations.

Check out our [**contributing guide**](CONTRIBUTING.md) to learn about our development process, how to suggest bugfixes and improvements. 

## **Developer Certificate of Origin - DCO**

 This is a security layer for the project and for the developers. It is mandatory.
 
Follow one of these two methods to add DCO to your commits:
 
**1. Command line**

Follow the steps: 
 
**Step 1:** Configure your local git environment adding the same name and e-mail configured at your GitHub account. It helps to sign commits manually during reviews and suggestions.

 ```
git config --global user.name “Name”
git config --global user.email “email@domain.com”
```

**Step 2:** Add the Signed-off-by line with the `'-s'` flag in the git commit command:

```
$ git commit -s -m "This is my commit message"
```
**2. GitHub website**

You can also manually sign your commits during GitHub reviews and suggestions, follow the steps below: 

**Step 1:** When the commit changes box opens, manually type or paste your signature in the comment box, see the example:

```
Signed-off-by: Name < e-mail address >
```

For this method, your name and e-mail must be the same registered on your GitHub account.

Looking for contributing individuals and organizations. Feel free to contact me at marcinguy@gmail.com


# Licensing

Betterscan's QuantifiedCode parts remain released under BSD-3 Clause License. However, modifications are released under LGPL-2.1 with Commonsclause.

You can use this software, but cannot sell it, also base services on it (SaaS - Software as a Service setups). This is the Commonsclause. If you would like to do it, please contact me first for the permission at marcinguy@gmail.com

# Installation

We provide several options for installing Betterscan. Which one is the right one for you
depends on your use case.

* The **manual installation** is best if you want to modify or change Betterscan 
* The **Docker-based installation** is probably the easiest way to try Betterscan without much work
* The **Ansible-based installation** is the most suitable way if you want to run Betterscan in a professional infrastructure (possibly with multiple servers)

The following section will only discuss the manual installation process. for the other options, please check their corresponding repositories.

## Manual Installation

The installation consists of three parts:

* Install the dependencies required to run Betterscan 
* Download the required source code
* Set up the configuration

### Installing Dependencies

Betterscan requires the following external dependencies:

* A message broker (required for the background tasks message queue). We recommend either RabbitMQ or Redis.
* A database (required for the core application). We recommend PostgreSQL, but SQLite is supported as well. Other database systems might work too (e.g. MySQL), but are currently not officially supported. If you need to run Betterscan on a non-supported database, please get in touch with us and we'll be happy to provide you some guidance.

### Download the Betterscan CE source code

Now with the dependencies installed, we can go ahead and download Betterscan:

    `git clone https://github.com/marcinguy/betterscan-ce.git`


### Install the required Python packages

Betterscan CE manages dependencies via the Python package manager, pip.


### Edit Settings

Betterscan gets configured via YAML settings files. When starting up the application, it incrementally loads settings from several files, recursively updating the settings object. First, it will load default settings from `quantifiedcode/settings/default.yml`. Then, it will check if a `QC_SETTINGS` environment variable is defined and points to a valid file, and if so it will load settings from it (possibly overwriting default settings). If not, it will look for a `settings.yml` file in the current working
directory and load settings from there. Additionally, it will check if a `QC_SECRETS` environment variable is defined and points to a valid file, and also load settings from there (this is useful for sensitive settings that should be kept separate from the rest [e.g. to not check them into version control]).

There is a sample `settings.yml` file in the root of the repository that you can start from.

### Running the Setup

After editing your settings, run the setup command via
````
    #run from the root directory of the repository
    python manage.py setup
````
The setup assistant will iteratively walk you through the setup, and when finished you should have a
working instance of Betterscan!

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
