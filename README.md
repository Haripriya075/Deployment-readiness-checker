# DeployCheck — Deployment Readiness Analyzer

A Flask-based web application that analyzes a project before deployment and identifies common **security, configuration, dependency, testing, project-structure, and deployment-readiness issues**.

DeployCheck provides a **Deployment Readiness Score**, category-wise analysis, severity levels, detected issues, impact descriptions, and actionable recommendations to help developers identify potential problems before deploying an application.

---

## Demo Video



https://github.com/user-attachments/assets/f2d4a526-27ac-4c1c-a7a1-d774d8f31333



> The demo video demonstrates the complete workflow of uploading a project, scanning the project, detecting deployment-readiness issues, calculating the readiness score, and displaying recommendations.

---

## Live Demo

DeployCheck is deployed as a web application using **Render**.

**Live Application:**
https://deploycheck-5ro6.onrender.com

---

## Screenshots

The following section is reserved for screenshots of the DeployCheck application.

### 1. Home Page

<img width="1314" height="622" alt="image" src="https://github.com/user-attachments/assets/cec4c5c4-6e4d-48f0-8f74-dd3ff9d6dac7" />


<br>

The home page allows users to upload a project ZIP file and begin the deployment-readiness analysis.

---

### 2. Project Upload and Scanning

<img width="1268" height="486" alt="image" src="https://github.com/user-attachments/assets/a18287e0-f02f-4e52-b680-303825ec9594" />


<br>

The uploaded ZIP project is extracted and analyzed against multiple deployment-readiness checks.

---

### 3. Deployment Readiness Report

<img width="1317" height="572" alt="image" src="https://github.com/user-attachments/assets/7f0bc36f-3e33-473d-8ef6-e339fec933ee" />


The generated report displays the overall readiness score, detected technologies, category results, severity levels, impacts, and recommendations.

---


## Features

* Upload a project as a ZIP file
* Extract and scan project files
* Detect project type and frameworks
* Generate a **Deployment Readiness Score /100**
* Provide category-wise readiness analysis
* Check project documentation
* Check dependency configuration
* Check environment configuration
* Detect potential hardcoded secrets
* Detect debug mode configuration
* Check for automated tests
* Detect Dockerfile configuration
* Analyze deployment-related configuration
* Assign severity levels to findings
* Display issue impact
* Provide actionable recommendations
* Display detected technologies
* Support light and dark mode
* Display an interactive deployment-readiness report

---

## Deployment Readiness Analysis

After scanning a project, DeployCheck generates an overall readiness score out of **100**.

### Example

```text
Deployment Readiness: 70/100

Security             30/100
Configuration        80/100
Dependencies         100/100
Project Structure    100/100
Testing              90/100
Deployment           95/100
```

The category-wise analysis helps developers identify which areas of a project require attention before deployment.

---

## Severity Levels

DeployCheck categorizes detected issues according to their potential impact.

| Severity | Meaning                                   |
| -------- | ----------------------------------------- |
| Critical | Immediate security or deployment concern  |
| High     | Important issue that should be addressed  |
| Medium   | Recommended improvement before deployment |
| Low      | Minor improvement or optional enhancement |
| Passed   | Check completed successfully              |

### Example Finding

---<img width="1303" height="613" alt="image" src="https://github.com/user-attachments/assets/adf62cd8-2f74-4ad1-84e3-5fe42e759190" />


## How It Works

### 1. Upload Project

The user uploads the application as a ZIP archive through the DeployCheck interface.

### 2. Extract Project

DeployCheck extracts the ZIP file and identifies the project structure.

### 3. Detect Project Type

The application examines project files and configuration files to identify commonly used technologies and frameworks.

### 4. Analyze Project

The scanner examines the project for common deployment-readiness issues related to:

* Project structure
* Documentation
* Dependencies
* Environment configuration
* Security
* Debug configuration
* Testing
* Deployment configuration

### 4. Calculate Readiness Score

The application evaluates the results of the implemented checks and generates an overall score out of 100.

### 5. Display Findings

Detected issues are presented with:

* Category
* Severity
* Issue description
* Impact
* Recommendation

### 6. Review Recommendations

Developers can use the recommendations to identify and fix potential problems before attempting deployment.

---

## Checks Performed

### Project Structure

DeployCheck checks for important project files and configurations, including:

* `README.md`
* Project configuration files
* Dependency files
* Test files
* `Dockerfile`

This helps determine whether the project contains important files required for development and deployment.

---

### Dependency Configuration

The application checks whether dependency manifests are available.

Examples include:

```text
requirements.txt
package.json
```

Proper dependency configuration helps ensure that required packages can be installed in the deployment environment.

---

### Environment Configuration

DeployCheck checks environment-related configuration.

It can identify situations where an `.env` file may exist without an appropriate `.env.example` template.

Environment variables should generally be managed separately from source code so that sensitive configuration is not directly exposed.

---

### Security

DeployCheck performs rule-based scanning for potential hardcoded sensitive information.

Examples include patterns resembling:

* API keys
* Passwords
* Secret keys
* Access tokens
* Private keys
* Credential-like values

Detected sensitive values should be moved to environment variables or an appropriate secure secret-management system.

> DeployCheck provides an initial rule-based security check and is not intended to replace dedicated security scanners or professional security testing.

---

### Debug Configuration

The application checks source files for development/debug configurations such as:

```python
debug=True
```

Debug mode should normally be disabled for production deployments because it can expose application information and debugging details.

---

### Testing

DeployCheck checks whether common automated test files or test directories are present.

The presence of tests can provide an indication that the project has automated validation before deployment.

---

### Deployment

The application checks for deployment-related configuration such as:

```text
Dockerfile
```

Deployment configuration can vary depending on the hosting platform and project type.

---

## Project Type Detection

DeployCheck can identify common technologies and frameworks based on project files and configuration.

Supported examples include:

* Python
* Flask
* Django
* FastAPI
* Node.js
* React
* Vue
* Angular
* Next.js
* Docker

Framework-specific checks can be expanded in future versions.

---

## Deployment Readiness Report

After scanning a project, DeployCheck generates an interactive report containing:

* Overall readiness score
* Overall deployment status
* Number of files scanned
* Detected technologies
* Category-wise findings
* Severity levels
* Issue descriptions
* Impact information
* Recommended fixes

The report allows developers to quickly identify potential deployment problems.

---

## Application Workflow

```text
        Upload ZIP Project
                │
                ▼
        Extract Project
                │
                ▼
       Detect Project Type
                │
                ▼
         Scan Project Files
                │
                ▼
      Run Deployment Checks
                │
                ▼
       Calculate Score /100
                │
                ▼
      Classify Findings
                │
                ▼
    Generate Recommendations
                │
                ▼
    Deployment Readiness Report
```

---

## Technology Stack

| Technology          | Purpose                                   |
| ------------------- | ----------------------------------------- |
| Python              | Backend programming and scanning logic    |
| Flask               | Web application framework                 |
| HTML                | Application structure                     |
| CSS                 | User interface styling                    |
| JavaScript          | Frontend interaction and report rendering |
| Regular Expressions | Rule-based secret detection               |
| ZIP Processing      | Project extraction and scanning           |
| Gunicorn            | Production application server             |
| Render              | Cloud deployment                          |

---

## Project Structure

```text
DeployCheck/
│
├── app.py
├── requirements.txt
├── README.md
├── .gitignore
│
├── templates/
│   └── index.html
│
├── static/
│   ├── style.css
│   └── script.js
│
├── uploads/
│
└── scanned_projects/
```

---

## Installation

### Prerequisites

Make sure Python is installed on your system.

### 1. Clone the Repository

```bash
git clone https://github.com/Haripriya075/Deployment-readiness-checker.git
```

### 2. Open the Project Directory

```bash
cd Deployment-readiness-checker
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Run the Application

```bash
python app.py
```

### 5. Open the Application

Open the following URL in your browser:

```text
http://127.0.0.1:5000
```

---

## Deployment

DeployCheck is configured as a Flask web application and can be deployed as a Python web service.

### Production Server

Gunicorn is used as the production WSGI server.

```bash
gunicorn app:app
```

### Deployment Platform

The application is deployed using **Render**.

**Live Application:**

https://deploycheck-5ro6.onrender.com

---

## Use Case

DeployCheck is designed as a **pre-deployment validation tool**.

It helps developers identify common issues before attempting to deploy an application by analyzing:

```text
Project
   ↓
Project Structure
   ↓
Dependencies
   ↓
Environment Configuration
   ↓
Security
   ↓
Debug Configuration
   ↓
Testing
   ↓
Deployment Configuration
   ↓
Readiness Score
   ↓
Recommendations
```

The tool provides an automated assessment of common deployment-readiness factors.

> DeployCheck does not guarantee successful deployment. It identifies potential issues that should be reviewed and resolved before deployment.

---

## Security Considerations

DeployCheck includes rule-based checks for potential security and configuration problems.

These checks are intended to provide an initial assessment before deployment.

Developers should perform additional security reviews and testing before deploying an application to production.

DeployCheck should not be considered a replacement for:

* Dedicated vulnerability scanners
* Secret-scanning tools
* Penetration testing
* Code security reviews
* Platform-specific security checks

---

## Limitations

* The readiness analysis is based on predefined rule-based checks.
* Secret detection may produce false positives or false negatives.
* The readiness score represents the implemented checks and does not guarantee production readiness.
* Different frameworks and deployment platforms may have different requirements.
* The tool does not perform complete application vulnerability analysis.
* The tool does not guarantee successful deployment.
* Additional manual testing may be required before production deployment.

---

## Future Improvements

Potential future improvements include:

* GitHub repository scanning
* Dependency vulnerability checking
* CVE/OSV-based vulnerability analysis
* Platform-specific checks for Render, Vercel, AWS, and Azure
* Advanced Dockerfile analysis
* CI/CD configuration analysis
* CI/CD pipeline integration
* Downloadable PDF reports
* Historical deployment-readiness reports
* Automated remediation suggestions
* Additional programming-language support
* More framework-specific deployment checks

---

## Live Application

**DeployCheck:**
https://deploycheck-5ro6.onrender.com

<br>

---

## Repository

**GitHub Repository:**
https://github.com/Haripriya075/Deployment-readiness-checker

---

## Author

**Haripriya**

GitHub:
https://github.com/Haripriya075/

---

## License

This project is intended for educational, demonstration, and portfolio purposes.
