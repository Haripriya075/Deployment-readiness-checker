from flask import Flask, render_template, request, jsonify
import os
import zipfile
import shutil
import re
import json

app = Flask(__name__)

UPLOAD_FOLDER = "uploads"
EXTRACT_FOLDER = "scanned_projects"

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(EXTRACT_FOLDER, exist_ok=True)

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER


# ============================================================
# HOME
# ============================================================

@app.route("/")
def home():
    return render_template("index.html")


# ============================================================
# TECHNOLOGY DETECTION
# ============================================================

def detect_technology(project_path):

    all_files = []

    for root, dirs, filenames in os.walk(project_path):

        # Ignore unnecessary folders
        dirs[:] = [
            d for d in dirs
            if d not in {
                "node_modules",
                ".git",
                "__pycache__",
                "venv",
                ".venv"
            }
        ]

        for filename in filenames:
            relative_path = os.path.relpath(
                os.path.join(root, filename),
                project_path
            )

            all_files.append(relative_path)

    file_names = {
        os.path.basename(file).lower()
        for file in all_files
    }

    extensions = {
        os.path.splitext(file)[1].lower()
        for file in all_files
    }

    technologies = []

    # --------------------------------------------------------
    # PYTHON
    # --------------------------------------------------------

    requirements = any(
        os.path.basename(file).lower() == "requirements.txt"
        for file in all_files
    )

    pyproject = any(
        os.path.basename(file).lower() == "pyproject.toml"
        for file in all_files
    )

    python_files = ".py" in extensions

    if requirements or pyproject or python_files:

        # Django
        manage_py = "manage.py" in file_names

        if manage_py:
            technologies.append("Django")

        else:

            flask_found = False

            for relative_file in all_files:

                if not relative_file.endswith(".py"):
                    continue

                full_path = os.path.join(
                    project_path,
                    relative_file
                )

                try:

                    with open(
                        full_path,
                        "r",
                        encoding="utf-8",
                        errors="ignore"
                    ) as f:

                        content = f.read().lower()

                    if (
                        "from flask import" in content
                        or "import flask" in content
                        or "flask(" in content
                    ):

                        flask_found = True
                        break

                except Exception:
                    continue

            if flask_found:
                technologies.append("Python / Flask")

            else:
                technologies.append("Python")


    # --------------------------------------------------------
    # NODE.JS / JAVASCRIPT
    # --------------------------------------------------------

    package_files = [
        file
        for file in all_files
        if os.path.basename(file).lower() == "package.json"
    ]

    if package_files:

        technologies.append("Node.js")

        package_path = os.path.join(
            project_path,
            package_files[0]
        )

        try:

            with open(
                package_path,
                "r",
                encoding="utf-8"
            ) as f:

                package_data = json.load(f)

            dependencies = {}

            dependencies.update(
                package_data.get(
                    "dependencies",
                    {}
                )
            )

            dependencies.update(
                package_data.get(
                    "devDependencies",
                    {}
                )
            )

            dependency_names = {
                name.lower()
                for name in dependencies.keys()
            }

            if "react" in dependency_names:
                technologies.append("React")

            if "next" in dependency_names:
                technologies.append("Next.js")

            if "vue" in dependency_names:
                technologies.append("Vue.js")

            if "@angular/core" in dependency_names:
                technologies.append("Angular")

            if "express" in dependency_names:
                technologies.append("Express.js")

            if "vite" in dependency_names:
                technologies.append("Vite")

            if "typescript" in dependency_names:
                technologies.append("TypeScript")

        except Exception:
            pass


    # --------------------------------------------------------
    # JAVA
    # --------------------------------------------------------

    if "pom.xml" in file_names:
        technologies.append("Java / Maven")

    elif "build.gradle" in file_names:
        technologies.append("Java / Gradle")

    elif ".java" in extensions:
        technologies.append("Java")


    # --------------------------------------------------------
    # DOCKER
    # --------------------------------------------------------

    if "dockerfile" in file_names:
        technologies.append("Docker")


    # --------------------------------------------------------
    # HTML
    # --------------------------------------------------------

    if ".html" in extensions:
        technologies.append("HTML")


    # --------------------------------------------------------
    # CSS
    # --------------------------------------------------------

    if ".css" in extensions:
        technologies.append("CSS")


    # --------------------------------------------------------
    # JAVASCRIPT
    # --------------------------------------------------------

    if ".js" in extensions and "Node.js" not in technologies:
        technologies.append("JavaScript")


    # --------------------------------------------------------
    # TYPESCRIPT
    # --------------------------------------------------------

    if ".ts" in extensions and "TypeScript" not in technologies:
        technologies.append("TypeScript")


    # --------------------------------------------------------
    # GIT
    # --------------------------------------------------------

    if ".gitignore" in file_names:
        technologies.append("Git")


    # --------------------------------------------------------
    # UNKNOWN
    # --------------------------------------------------------

    if not technologies:
        technologies.append("Unknown")


    # Remove duplicates while preserving order

    return list(
        dict.fromkeys(technologies)
    )


# ============================================================
# PROJECT SCANNER
# ============================================================

def scan_project(project_path):

    results = []

    score = 100

    all_files = []


    # ========================================================
    # GET ALL FILES
    # ========================================================

    for root, dirs, files in os.walk(project_path):

        dirs[:] = [
            d for d in dirs
            if d not in {
                "node_modules",
                ".git",
                "__pycache__",
                "venv",
                ".venv"
            }
        ]

        for file in files:

            full_path = os.path.join(
                root,
                file
            )

            relative_path = os.path.relpath(
                full_path,
                project_path
            )

            all_files.append(relative_path)


    lower_files = [
        file.lower()
        for file in all_files
    ]


    # ========================================================
    # 1. README
    # ========================================================

    readme_found = any(
        os.path.basename(file).lower()
        in {
            "readme",
            "readme.md",
            "readme.txt"
        }
        for file in all_files
    )


    if readme_found:

        results.append({
            "name": "README Documentation",
            "status": "pass",
            "message": "README documentation was found.",
            "details": []
        })

    else:

        score -= 10

        results.append({
            "name": "README Documentation",
            "status": "warning",
            "message": "No README file was found.",
            "details": []
        })


    # ========================================================
    # 2. DEPENDENCIES
    # ========================================================

    dependency_files = {
        "requirements.txt",
        "package.json",
        "pom.xml",
        "build.gradle",
        "pyproject.toml"
    }


    dependency_found = any(
        os.path.basename(file).lower()
        in dependency_files
        for file in all_files
    )


    if dependency_found:

        results.append({
            "name": "Dependencies",
            "status": "pass",
            "message": "A dependency configuration file was found.",
            "details": []
        })

    else:

        score -= 15

        results.append({
            "name": "Dependencies",
            "status": "warning",
            "message": "No common dependency file was detected.",
            "details": []
        })


    # ========================================================
    # 3. ENVIRONMENT CONFIGURATION
    # ========================================================

    env_example_found = any(
        os.path.basename(file).lower()
        == ".env.example"
        for file in all_files
    )


    env_found = any(
        os.path.basename(file).lower()
        == ".env"
        for file in all_files
    )


    if env_example_found:

        results.append({
            "name": "Environment Configuration",
            "status": "pass",
            "message": ".env.example was found.",
            "details": []
        })

    elif env_found:

        score -= 5

        results.append({
            "name": "Environment Configuration",
            "status": "warning",
            "message": ".env file exists. Make sure it is not committed publicly.",
            "details": []
        })

    else:

        results.append({
            "name": "Environment Configuration",
            "status": "pass",
            "message": "No environment file is required or detected.",
            "details": []
        })


    # ========================================================
    # 4. SECRET DETECTION
    # ========================================================

    secret_found = False

    secret_details = []


    secret_patterns = [

        r"api[_-]?key\s*[:=]\s*['\"][^'\"]{8,}['\"]",

        r"password\s*[:=]\s*['\"][^'\"]{4,}['\"]",

        r"secret[_-]?key\s*[:=]\s*['\"][^'\"]{8,}['\"]",

        r"access[_-]?token\s*[:=]\s*['\"][^'\"]{8,}['\"]",

        r"aws_access_key_id\s*[:=]\s*['\"][^'\"]+['\"]",

        r"private[_-]?key\s*[:=]\s*['\"][^'\"]+['\"]"

    ]


    files_to_scan = [
        file
        for file in all_files
        if file.lower().endswith(
            (
                ".py",
                ".js",
                ".ts",
                ".java",
                ".json",
                ".env",
                ".txt"
            )
        )
    ]


    ignored_words = {
        "your_api_key",
        "your-api-key",
        "your_password",
        "your_secret",
        "example",
        "placeholder",
        "changeme"
    }


    for relative_file in files_to_scan:

        full_path = os.path.join(
            project_path,
            relative_file
        )


        try:

            with open(
                full_path,
                "r",
                encoding="utf-8",
                errors="ignore"
            ) as f:

                lines = f.readlines()


            for line_number, line in enumerate(
                lines,
                start=1
            ):

                line_lower = line.lower()


                # Ignore comments
                if line.strip().startswith(
                    ("#", "//")
                ):
                    continue


                for pattern in secret_patterns:

                    match = re.search(
                        pattern,
                        line,
                        re.IGNORECASE
                    )


                    if match:

                        matched_text = match.group(0).lower()

                        if any(
                            word in matched_text
                            for word in ignored_words
                        ):
                            continue


                        secret_found = True


                        secret_details.append({
                            "file": relative_file,
                            "line": line_number,
                            "code": line.strip(),
                            "fix": "Move credentials to environment variables or a secure secret manager."
                        })


                        break


        except Exception:

            continue


    if secret_found:

        score -= 25

        results.append({
            "name": "Security",
            "status": "critical",
            "message": "Possible hardcoded secret or credential detected.",
            "details": secret_details
        })

    else:

        results.append({
            "name": "Security",
            "status": "pass",
            "message": "No obvious hardcoded secrets were detected.",
            "details": []
        })


    # ========================================================
    # 5. DEBUG MODE
    # ========================================================

    debug_found = False

    debug_details = []


    for relative_file in all_files:

        if not relative_file.lower().endswith(
            (".py", ".js", ".ts")
        ):
            continue


        full_path = os.path.join(
            project_path,
            relative_file
        )


        try:

            with open(
                full_path,
                "r",
                encoding="utf-8",
                errors="ignore"
            ) as f:

                lines = f.readlines()


            for line_number, line in enumerate(
                lines,
                start=1
            ):

                if re.search(
                    r"\bdebug\s*=\s*true\b",
                    line,
                    re.IGNORECASE
                ):

                    debug_found = True

                    debug_details.append({
                        "file": relative_file,
                        "line": line_number,
                        "code": line.strip(),
                        "fix": "Disable debug mode before production deployment."
                    })


        except Exception:

            continue


    if debug_found:

        score -= 10

        results.append({
            "name": "Debug Configuration",
            "status": "warning",
            "message": "Debug mode appears to be enabled.",
            "details": debug_details
        })

    else:

        results.append({
            "name": "Debug Configuration",
            "status": "pass",
            "message": "No obvious debug mode configuration was detected.",
            "details": []
        })


    # ========================================================
    # 6. TESTING
    # ========================================================

    test_found = any(
        (
            "/test/" in file.lower()
            or "\\test\\" in file.lower()
            or "/tests/" in file.lower()
            or "\\tests\\" in file.lower()
            or os.path.basename(file).lower().startswith("test_")
            or os.path.basename(file).lower().endswith("_test.py")
        )
        for file in all_files
    )


    if test_found:

        results.append({
            "name": "Testing",
            "status": "pass",
            "message": "Test files or test directories were detected.",
            "details": []
        })

    else:

        score -= 10

        results.append({
            "name": "Testing",
            "status": "warning",
            "message": "No obvious test files were detected.",
            "details": []
        })


    # ========================================================
    # 7. PROJECT TYPE
    # ========================================================

    project_type = "Unknown"


    if any(
        file.endswith(".py")
        for file in lower_files
    ):

        project_type = "Python"


    elif any(
        os.path.basename(file) == "package.json"
        for file in lower_files
    ):

        project_type = "Node.js / JavaScript"


    elif any(
        file.endswith(".java")
        for file in lower_files
    ):

        project_type = "Java"


    elif any(
        file.endswith(".html")
        for file in lower_files
    ):

        project_type = "Web Project"


    results.append({
        "name": "Project Type",
        "status": "pass",
        "message": f"Detected project type: {project_type}",
        "details": []
    })


    # ========================================================
    # 8. TECHNOLOGY STACK
    # ========================================================

    technologies = detect_technology(
        project_path
    )


    results.append({
        "name": "Technology Stack",
        "status": "pass",
        "message": "Detected technologies: "
                   + ", ".join(technologies),
        "details": []
    })


    # ========================================================
    # SCORE
    # ========================================================

    score = max(
        0,
        min(100, score)
    )


    if score >= 80:

        overall = "Ready"

    elif score >= 60:

        overall = "Needs Attention"

    else:

        overall = "High Risk"


    # ========================================================
    # FINAL REPORT
    # ========================================================

    return {

        "score": score,

        "overall": overall,

        "files_scanned": len(all_files),

        "technologies": technologies,

        "results": results

    }


# ============================================================
# UPLOAD + SCAN
# ============================================================

@app.route(
    "/upload",
    methods=["POST"]
)
def upload_project():

    if "project" not in request.files:

        return jsonify({
            "success": False,
            "message": "No project file selected."
        })


    file = request.files["project"]


    if file.filename == "":

        return jsonify({
            "success": False,
            "message": "Please select a ZIP file."
        })


    if not file.filename.lower().endswith(".zip"):

        return jsonify({
            "success": False,
            "message": "Only ZIP files are supported."
        })


    # --------------------------------------------------------
    # SAFE FILENAME
    # --------------------------------------------------------

    safe_filename = os.path.basename(
        file.filename
    )


    zip_path = os.path.join(
        UPLOAD_FOLDER,
        safe_filename
    )


    file.save(zip_path)


    project_name = os.path.splitext(
        safe_filename
    )[0]


    extract_path = os.path.join(
        EXTRACT_FOLDER,
        project_name
    )


    # --------------------------------------------------------
    # REMOVE PREVIOUS SCAN
    # --------------------------------------------------------

    if os.path.exists(extract_path):

        shutil.rmtree(
            extract_path
        )


    os.makedirs(
        extract_path,
        exist_ok=True
    )


    # --------------------------------------------------------
    # SAFE ZIP EXTRACTION
    # --------------------------------------------------------

    try:

        with zipfile.ZipFile(
            zip_path,
            "r"
        ) as zip_ref:

            base_path = os.path.abspath(
                extract_path
            )

            for member in zip_ref.infolist():

                target_path = os.path.abspath(
                    os.path.join(
                        extract_path,
                        member.filename
                    )
                )


                if not (
                    target_path == base_path
                    or target_path.startswith(
                        base_path + os.sep
                    )
                ):

                    return jsonify({
                        "success": False,
                        "message": "Unsafe ZIP file detected."
                    })


            zip_ref.extractall(
                extract_path
            )


    except zipfile.BadZipFile:

        return jsonify({
            "success": False,
            "message": "The uploaded file is not a valid ZIP archive."
        })


    except Exception as error:

        return jsonify({
            "success": False,
            "message": f"Could not extract ZIP file: {error}"
        })


    # ========================================================
    # SCAN PROJECT
    # ========================================================

    try:

        report = scan_project(
            extract_path
        )

    except Exception as error:

        return jsonify({
            "success": False,
            "message": f"Project scanning failed: {error}"
        })


    # ========================================================
    # RESPONSE
    # ========================================================

    return jsonify({

        "success": True,

        "message": "Project scanned successfully.",

        "report": report

    })


# ============================================================
# RUN APPLICATION
# ============================================================

if __name__ == "__main__":

    app.run(
        debug=True
    )