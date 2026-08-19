# DeployCheck — Deployment Readiness Analyzer

A Flask-based web application that analyzes a project before deployment and identifies common **security, configuration, dependency, testing, project-structure, and deployment-readiness issues**.

DeployCheck provides a readiness score, category-wise analysis, severity levels, and actionable recommendations to help developers identify potential problems before deploying an application.

<img width="1303" height="406" alt="image" src="https://github.com/user-attachments/assets/6324dd1b-86d2-41fe-8537-6c09b87054c9" />



---

## Live Demo

DeployCheck is deployed as a web application and can be accessed through the Render deployment URL.

**Live Application:** 



---

## Features

* Upload a project as a ZIP file
* Extract and scan project files
* Detect project type and frameworks
* Generate a **Deployment Readiness Score /100**
* Provide category-wise readiness scores
* Check project documentation
* Check dependency configuration
* Check environment configuration
* Detect potential hardcoded secrets
* Detect debug mode configuration
* Check for automated tests
* Detect Dockerfile configuration
* Assign severity levels to findings
* Provide impact and recommendations
* Support light and dark mode
* Display an interactive deployment-readiness report

---

## Deployment Readiness Analysis

After scanning a project, DeployCheck generates an overall readiness score.

Example:

```text
Deployment Readiness: 90/100

Security             80/100
Configuration        95/100
Dependencies         100/100
Project Structure    90/100
Testing              90/100
Deployment           95/100
```

<img width="1327" height="549" alt="image" src="https://github.com/user-attachments/assets/4c38e529-bcb2-4c63-9353-69bc0c1f0add" />


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

Example finding:

```text
HIGH — Debug mode appears to be enabled

Impact:
Debug mode can expose application details in production.

Recommendation:
Disable debug mode before production deployment.
```

<img width="1280" height="595" alt="image" src="https://github.com/user-attachments/assets/bd70a74c-3426-416b-b67b-cad363a5b96d" />

<img width="1248" height="546" alt="image" src="https://github.com/user-attachments/assets/cfa5d554-3cde-473c-b870-21760e972ade" />

---

## How It Works

### 1. Upload Project

The user uploads the application as a ZIP file.

<img width="1334" height="615" alt="image" src="https://github.com/user-attachments/assets/d7128f04-cd9e-4489-a2dc-c6c2c91c394f" />


### 2. Extract Project

DeployCheck extracts the ZIP file and identifies the project structure.

### 3. Analyze Project

The scanner examines files and configurations for common deployment-readiness issues.

### 4. Calculate Readiness Score

The application evaluates different categories and generates an overall score out of 100.

### 5. Display Findings

Detected issues are presented with:

* Severity
* Category
* Impact
* Recommendation

### 6. Review Recommendations

Developers can use the recommendations to fix potential problems before attempting deployment.

---

## Checks Performed

### Project Structure

DeployCheck checks for important project files such as:

* `README.md`
* Project configuration files
* Dependency files
* Test files
* Dockerfile

### Dependency Configuration

The application checks whether dependency manifests such as:

```text
requirements.txt
package.json
```

are present.

### Environment Configuration

DeployCheck checks for environment configuration and identifies situations where an `.env` file may be present without a corresponding `.env.example`.

### Security

The scanner looks for potential hardcoded sensitive information, including patterns resembling:

* API keys
* Passwords
* Secret keys
* Access tokens
* Private keys

Detected values should be moved to environment variables or a secure secret-management system.

### Debug Configuration

The application checks source files for configurations such as:

```python
debug=True
```

Debug mode should normally be disabled for production deployments.

### Testing

DeployCheck checks whether common automated test files or test directories are present.

### Deployment

The application checks for deployment-related configuration such as a `Dockerfile`.

---

## Project Type Detection

DeployCheck can identify common technologies and frameworks, including:

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

## Technology Stack

| Technology     | Purpose                         |
| -------------- | ------------------------------- |
| Python         | Backend programming             |
| Flask          | Web application framework       |
| HTML           | Application structure           |
| CSS            | User interface styling          |
| JavaScript     | Frontend interaction            |
| ZIP Processing | Project extraction and scanning |
| Gunicorn       | Production application server   |
| Render         | Cloud deployment                |

---

## Project Structure

```text
DeployCheck/
│
├── app.py
├── requirements.txt
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

### 1. Clone the repository

```bash
git clone https://github.com/Haripriya075/Deployment-readiness-checker.git
```

### 2. Open the project directory

```bash
cd Deployment-readiness-checker
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Run the application

```bash
python app.py
```

### 5. Open the application

```text
http://127.0.0.1:5000
```

---

## Deployment

DeployCheck is configured for deployment as a Flask web service.

Production startup command:

```bash
gunicorn app:app
```

The application can be deployed using platforms such as Render.


---

## Use Case

DeployCheck is designed as a **pre-deployment validation tool**.

It helps developers identify common issues before attempting to deploy an application by analyzing:

```text
Project
   ↓
Configuration
   ↓
Dependencies
   ↓
Security
   ↓
Testing
   ↓
Deployment Configuration
   ↓
Readiness Score
   ↓
Recommendations
```

The tool does **not guarantee successful deployment**. It identifies potential issues that should be reviewed before deployment.

---

## Future Improvements

Planned enhancements include:

* GitHub repository scanning
* Dependency vulnerability checking
* CVE/OSV-based vulnerability analysis
* Platform-specific checks for Render, Vercel, AWS and Azure
* Advanced Dockerfile analysis
* CI/CD integration
* Downloadable PDF reports
* Historical deployment-readiness reports
* Automated remediation suggestions
* Additional programming-language support

---

## Author

**Haripriya075**

GitHub:

https://github.com/Haripriya075/Deployment-readiness-checker
