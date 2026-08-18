# Deployment Readiness Checker

A Flask-based web application that checks whether a project is ready for deployment. Users can upload a project ZIP file, and the application scans its structure and files to identify common deployment-related issues.

<img width="1346" height="630" alt="image" src="https://github.com/user-attachments/assets/76e5355e-0364-4e64-acdf-1d1501665fc3" />


## Features

* Upload a project as a ZIP file
* Extract and scan project files
* Check project structure
* Analyze `requirements.txt`
* Identify common deployment issues
* Provide deployment-readiness results
* Simple and user-friendly interface

<img width="1321" height="611" alt="image" src="https://github.com/user-attachments/assets/f71b1e48-307c-42a7-83bf-75820a3b18a7" />


<img width="1316" height="552" alt="image" src="https://github.com/user-attachments/assets/5695676c-78e0-4212-83ea-559a7f7f7ee9" />

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
