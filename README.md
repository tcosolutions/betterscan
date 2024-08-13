

<div align="center">
  <a href="https://github.com/tcosolutions/betterscan">
    <img alt="Betterscan" src="https://cdn.prod.website-files.com/6339e3b81867539b5fe2498d/6662b3cba2059f268d0ada99_cloud%20(Website).svg">
  </a>
</div>

<h2 align="center">
  Open DevSecOps Orchestration Toolchain
</h2>


Scan your source code and infra IaC against top **security** risks

Betterscan is a orchestration toolchain that uses state of the art tools to scan your source code and infrastructure IaC and analyzes your security and compliance risks.

Currently supports: **Java**, **Python**, **PERL**, **Ruby**, **C**, **C++**, **Javascript**, **Typescript**, **GO**, Infrastructure as a Code (IaC) Security and Best Practices (**Docker**, **Kubernetes (k8s)**, **Terraform AWS, GCP, Azure**), Secret Scanning, Trojan Source, 

Open Source and Proprietary Checks

Checks for misconfigurations across all major (and some minor) cloud providers (AWS Checks, Azure Checks, GCP Checks, CloudStack Checks, DigitalOcean Checks, GitHub Checks, Kubernetes Checks, OpenStack Checks, Oracle Checks)


## Open and Developer friendly DevSecOps toolchain

Betterscan uses many tools for Code, Cloud, secrets. All the best Tools, researched, setup, ran together, unifed and de-duplicated results, **so you don't have to do it**. Added our own checkers also. Continuous Security. Fit for purpose and results.

<p align="center">
  <img width="600" src="https://uploads-ssl.webflow.com/6339e3b81867539b5fe2498d/659fdb0bc81d97288ac27868_betterscan.svg">
</p>

Above is sample engine (Binary runtime) run powering everything.




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

#### CLI output

Run in command prompt in your Git repository folder:

`sh <(curl https://raw.githubusercontent.com/tcosolutions/betterscan/main/cli.sh)`

### HTML, JSON, SARIF output

The result will be in the current directory in "report.html", "report.json" and "report.sarif" file

Run in command prompt in your Git repository folder:
  
`sh <(curl https://raw.githubusercontent.com/tcosolutions/betterscan/main/cli-html.sh)`



That's it.

Read more in the **[Wiki](https://github.com/tcosolutions/betterscan/wiki)**


