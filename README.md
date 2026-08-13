# Deployment Readiness Checker

A Flask-based web application that checks whether a project is ready for deployment. Users can upload a project ZIP file, and the application scans its structure and files to identify common deployment-related issues.

## Features

* Upload a project as a ZIP file
* Extract and scan project files
* Check project structure
* Analyze `requirements.txt`
* Identify common deployment issues
* Provide deployment-readiness results
* Simple and user-friendly interface

## Technologies Used

* Python
* Flask
* HTML
* CSS
* JavaScript
* ZIP File Processing

## Project Structure

```text
Deployment-readiness-checker/
│
├── app.py
├── requirements.txt
├── .gitignore
│
├── templates/
│   └── index.html
│
└── static/
    ├── style.css
    └── script.js
```

## How It Works

1. Upload a project ZIP file.
2. The application extracts the project.
3. It scans the project files and folders.
4. It checks important deployment requirements.
5. It identifies potential issues.
6. The results are displayed on the web interface.

## Installation

Clone the repository:

```bash
git clone https://github.com/Haripriya075/Deployment-readiness-checker.git
```

Open the project folder:

```bash
cd Deployment-readiness-checker
```

Install the required dependencies:

```bash
pip install -r requirements.txt
```

Run the application:

```bash
python app.py
```

Open your browser and visit:

```text
http://127.0.0.1:5000
```

## Use Case

The Deployment Readiness Checker helps developers quickly identify missing or potentially problematic files and configurations before deploying a project to a hosting platform.

## Future Improvements

* GitHub repository scanning
* Dockerfile detection
* Environment variable checks
* API key and secret detection
* Support for additional programming languages
* Detailed deployment recommendations
* Downloadable deployment reports

## Author

**Haripriya075**

GitHub: https://github.com/Haripriya075/Deployment-readiness-checker
