from flask import Flask, render_template, request, jsonify
import os
import zipfile
import shutil
import re

app = Flask(__name__)

UPLOAD_FOLDER = "uploads"
EXTRACT_FOLDER = "scanned_projects"

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(EXTRACT_FOLDER, exist_ok=True)

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
app.config["MAX_CONTENT_LENGTH"] = 50 * 1024 * 1024


# =========================================================
# IGNORED DIRECTORIES
# =========================================================

IGNORED_DIRS = {
    ".git",
    "__pycache__",
    "node_modules",
    ".venv",
    "venv",
    "uploads",
    "scanned_projects"
}


# =========================================================
# HOME
# =========================================================

@app.route("/")
def home():
    return render_template("index.html")


# =========================================================
# PROJECT TYPE DETECTION
# =========================================================

def detect_project_type(project_path):

    files = []

    for root, dirs, filenames in os.walk(project_path):

        dirs[:] = [
            d for d in dirs
            if d not in IGNORED_DIRS
        ]

        for filename in filenames:
            files.append(filename.lower())

    detected = []

    # Python
    if "requirements.txt" in files:
        detected.append("Python")

    # Node.js
    if "package.json" in files:
        detected.append("Node.js")

    # Django
    if "manage.py" in files:
        detected.append("Django")

    # Docker
    if "dockerfile" in files:
        detected.append("Docker")

    # Flask / FastAPI
    for root, dirs, filenames in os.walk(project_path):

        dirs[:] = [
            d for d in dirs
            if d not in IGNORED_DIRS
        ]

        for filename in filenames:

            if not filename.endswith(".py"):
                continue

            try:

                filepath = os.path.join(
                    root,
                    filename
                )

                with open(
                    filepath,
                    "r",
                    encoding="utf-8",
                    errors="ignore"
                ) as f:

                    content = f.read()

                if (
                    "from flask" in content
                    or "import flask" in content
                ):
                    detected.append("Flask")

                if (
                    "from fastapi" in content
                    or "import fastapi" in content
                ):
                    detected.append("FastAPI")

            except Exception:
                pass

    # Frontend frameworks
    package_path = find_file(
        project_path,
        "package.json"
    )

    if package_path:

        try:

            with open(
                package_path,
                "r",
                encoding="utf-8",
                errors="ignore"
            ) as f:

                content = f.read().lower()

            if '"react"' in content:
                detected.append("React")

            if '"vue"' in content:
                detected.append("Vue")

            if '"angular"' in content:
                detected.append("Angular")

            if '"next"' in content:
                detected.append("Next.js")

        except Exception:
            pass

    if not detected:
        return ["Unknown"]

    return list(
        dict.fromkeys(detected)
    )


# =========================================================
# FIND FILE
# =========================================================

def find_file(project_path, filename):

    for root, dirs, files in os.walk(project_path):

        dirs[:] = [
            d for d in dirs
            if d not in IGNORED_DIRS
        ]

        for file in files:

            if file.lower() == filename.lower():
                return os.path.join(
                    root,
                    file
                )

    return None


# =========================================================
# ADD FINDING
# =========================================================

def add_finding(
    findings,
    category,
    severity,
    title,
    impact,
    recommendation
):

    findings.append({
        "category": category,
        "severity": severity,
        "title": title,
        "impact": impact,
        "recommendation": recommendation
    })


# =========================================================
# README CHECK
# =========================================================

def check_readme(
    project_path,
    findings
):

    readme = find_file(
        project_path,
        "README.md"
    )

    if not readme:

        add_finding(
            findings,
            "Project Structure",
            "Medium",
            "README.md not found",
            "Developers may not have clear instructions for understanding or running the project.",
            "Add a README.md containing project description, installation steps, usage instructions, environment variables and deployment instructions."
        )

        return False

    try:

        with open(
            readme,
            "r",
            encoding="utf-8",
            errors="ignore"
        ) as f:

            content = f.read().strip()

        if len(content) < 50:

            add_finding(
                findings,
                "Project Structure",
                "Medium",
                "README.md is too short",
                "The project may lack important setup and usage documentation.",
                "Expand the README with project purpose, installation, configuration, usage and deployment information."
            )

            return False

        return True

    except Exception:

        return False


# =========================================================
# DEPENDENCY CHECK
# =========================================================

def check_dependencies(
    project_path,
    findings
):

    requirements = find_file(
        project_path,
        "requirements.txt"
    )

    package_json = find_file(
        project_path,
        "package.json"
    )

    if requirements or package_json:
        return True

    add_finding(
        findings,
        "Dependencies",
        "High",
        "Dependency file not detected",
        "The deployment platform may not know which dependencies need to be installed.",
        "Add requirements.txt for Python projects or package.json for Node.js projects."
    )

    return False


# =========================================================
# ENVIRONMENT CONFIGURATION
# =========================================================

def check_environment(
    project_path,
    findings
):

    env_file = find_file(
        project_path,
        ".env"
    )

    env_example = find_file(
        project_path,
        ".env.example"
    )

    if env_file and not env_example:

        add_finding(
            findings,
            "Configuration",
            "High",
            ".env file detected without .env.example",
            "Environment-specific values may be difficult to configure safely during deployment.",
            "Create a .env.example containing variable names only and keep real credentials outside source control."
        )

        return False

    if env_example:
        return True

    add_finding(
        findings,
        "Configuration",
        "Low",
        "Environment configuration template not detected",
        "Required environment variables may not be clearly documented.",
        "Consider adding a .env.example file containing required environment variable names."
    )

    return False


# =========================================================
# GITIGNORE CHECK
# =========================================================

def check_gitignore(
    project_path,
    findings
):

    gitignore_path = find_file(
        project_path,
        ".gitignore"
    )

    env_file = find_file(
        project_path,
        ".env"
    )

    if not gitignore_path:

        add_finding(
            findings,
            "Security",
            "High",
            ".gitignore not found",
            "Without a .gitignore, secrets, dependencies, and local build artifacts can be committed directly to version control.",
            "Add a .gitignore that excludes .env, node_modules/, __pycache__/, and other local-only files."
        )

        return False

    try:

        with open(
            gitignore_path,
            "r",
            encoding="utf-8",
            errors="ignore"
        ) as f:

            content = f.read()

    except Exception:

        content = ""

    ignores_env = bool(
        re.search(
            r"(?m)^\s*\.env\b",
            content
        )
    )

    if env_file and not ignores_env:

        add_finding(
            findings,
            "Security",
            "Critical",
            ".env file is not excluded by .gitignore",
            "A real .env file containing credentials can be committed to source control and exposed publicly.",
            "Add '.env' to .gitignore and remove any committed .env file from version control history."
        )

        return False

    return True


# =========================================================
# SECRET DETECTION
# =========================================================

def check_secrets(
    project_path,
    findings
):

    quoted_patterns = [

        (
            r"(?i)(api[_-]?key)\s*[:=]\s*['\"][A-Za-z0-9_\-]{12,}['\"]",
            "Possible API key"
        ),

        (
            r"(?i)(password)\s*[:=]\s*['\"][^'\"]{6,}['\"]",
            "Possible hardcoded password"
        ),

        (
            r"(?i)(secret[_-]?key)\s*[:=]\s*['\"][A-Za-z0-9_\-]{12,}['\"]",
            "Possible secret key"
        ),

        (
            r"(?i)(access[_-]?token)\s*[:=]\s*['\"][A-Za-z0-9_\-]{12,}['\"]",
            "Possible access token"
        ),

        (
            r"-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----",
            "Private key detected"
        )
    ]


    unquoted_patterns = [

        (
            r"(?im)^\s*(?:[\w.]*API[_-]?KEY)\s*=\s*\S{8,}\s*$",
            "Possible API key in env file"
        ),

        (
            r"(?im)^\s*(?:[\w.]*PASSWORD)\s*=\s*\S{4,}\s*$",
            "Possible hardcoded password in env file"
        ),

        (
            r"(?im)^\s*(?:[\w.]*SECRET[_-]?KEY)\s*=\s*\S{8,}\s*$",
            "Possible secret key in env file"
        ),

        (
            r"(?im)^\s*(?:[\w.]*ACCESS[_-]?TOKEN)\s*=\s*\S{8,}\s*$",
            "Possible access token in env file"
        ),

        (
            r"(?im)^\s*(?:[\w.]*JWT[_-]?SECRET)\s*=\s*\S{4,}\s*$",
            "Possible JWT secret in env file"
        )
    ]


    placeholder_values = {
        "changeme",
        "your_api_key_here",
        "example",
        "xxxx",
        "placeholder",
        "your_password_here",
        "changeit",
        "replace_me",
        "todo"
    }


    found = False


    for root, dirs, files in os.walk(
        project_path
    ):

        dirs[:] = [
            d for d in dirs
            if d not in IGNORED_DIRS
        ]


        for filename in files:

            lower_name = filename.lower()


            if lower_name == "readme.md":
                continue


            filepath = os.path.join(
                root,
                filename
            )


            is_example_file = (
                lower_name.endswith(".example")
                or ".example." in lower_name
            )


            try:

                if os.path.getsize(filepath) > (
                    2 * 1024 * 1024
                ):
                    continue


                with open(
                    filepath,
                    "r",
                    encoding="utf-8",
                    errors="ignore"
                ) as f:

                    content = f.read()


                matched_this_file = False


                for pattern, label in quoted_patterns:

                    if re.search(
                        pattern,
                        content
                    ):

                        add_finding(
                            findings,
                            "Security",
                            "Critical",
                            f"{label} detected",
                            "Hardcoded credentials can be exposed through source code or version control.",
                            "Move the value to an environment variable or secure secret-management system."
                        )

                        found = True
                        matched_this_file = True

                        break


                if matched_this_file:
                    continue


                if is_example_file:
                    continue


                if (
                    lower_name == ".env"
                    or lower_name.startswith(".env.")
                    or lower_name.endswith(".env")
                ):

                    for pattern, label in unquoted_patterns:

                        match = re.search(
                            pattern,
                            content
                        )

                        if match:

                            value = (
                                match.group(0)
                                .split("=", 1)[-1]
                                .strip()
                                .strip("'\"")
                            )


                            if (
                                value.lower()
                                in placeholder_values
                            ):
                                continue


                            add_finding(
                                findings,
                                "Security",
                                "Critical",
                                f"{label} detected",
                                "A committed .env file with real credentials can be exposed through version control or deployment artifacts.",
                                "Remove real credentials from committed .env files; use .env.example with placeholder values instead, and load real secrets from a secure secret manager."
                            )

                            found = True

                            break


            except Exception:

                continue


    return not found


# =========================================================
# DEBUG MODE CHECK
# =========================================================

def check_debug_mode(
    project_path,
    findings
):

    debug_found = False


    for root, dirs, files in os.walk(
        project_path
    ):

        dirs[:] = [
            d for d in dirs
            if d not in IGNORED_DIRS
        ]


        for filename in files:

            if not filename.endswith(
                (".py", ".js", ".ts")
            ):
                continue


            filepath = os.path.join(
                root,
                filename
            )


            try:

                with open(
                    filepath,
                    "r",
                    encoding="utf-8",
                    errors="ignore"
                ) as f:

                    content = f.read()


                patterns = [

                    r"debug\s*=\s*True",

                    r"debug\s*=\s*true",

                    r"app\.run\(.*debug\s*=\s*True",

                    r"app\.run\(.*debug\s*=\s*true"
                ]


                for pattern in patterns:

                    if re.search(
                        pattern,
                        content
                    ):

                        add_finding(
                            findings,
                            "Security",
                            "High",
                            "Debug mode appears to be enabled",
                            "Debug mode can expose application details and should not normally be enabled in production.",
                            "Disable debug mode before production deployment and use environment-based configuration."
                        )

                        debug_found = True

                        break


            except Exception:

                continue


    return not debug_found


# =========================================================
# ERROR HANDLING / CONSOLE LOG CHECK
# =========================================================

def check_error_handling(
    project_path,
    findings
):

    issues_found = False

    console_log_count = 0

    files_with_routes_no_try_catch = 0

    bare_except_count = 0


    for root, dirs, files in os.walk(
        project_path
    ):

        dirs[:] = [
            d for d in dirs
            if d not in IGNORED_DIRS
        ]


        for filename in files:

            filepath = os.path.join(
                root,
                filename
            )


            # JavaScript / TypeScript
            if filename.endswith(
                (".js", ".ts")
            ):

                try:

                    with open(
                        filepath,
                        "r",
                        encoding="utf-8",
                        errors="ignore"
                    ) as f:

                        content = f.read()

                except Exception:

                    continue


                console_log_count += len(
                    re.findall(
                        r"console\.log\(",
                        content
                    )
                )


                looks_like_route = bool(
                    re.search(
                        r"\.(get|post|put|delete|patch)\s*\(",
                        content
                    )
                )


                has_try_catch = (
                    "try" in content
                    and "catch" in content
                )


                has_error_middleware = bool(
                    re.search(
                        r"\(err,\s*req,\s*res",
                        content
                    )
                )


                if (
                    looks_like_route
                    and not has_try_catch
                    and not has_error_middleware
                ):

                    files_with_routes_no_try_catch += 1


            # Python
            elif filename.endswith(".py"):

                try:

                    with open(
                        filepath,
                        "r",
                        encoding="utf-8",
                        errors="ignore"
                    ) as f:

                        content = f.read()

                except Exception:

                    continue


                bare_except_count += len(
                    re.findall(
                        r"(?m)^\s*except\s*:\s*$",
                        content
                    )
                )


    if files_with_routes_no_try_catch > 0:

        add_finding(
            findings,
            "Security",
            "Medium",
            "Routes without visible error handling",
            "Unhandled errors in request handlers can crash the process or leak stack traces to clients in production.",
            "Wrap route logic in try/catch or use centralized error-handling middleware and return sanitized error responses."
        )

        issues_found = True


    if console_log_count >= 3:

        add_finding(
            findings,
            "Project Structure",
            "Low",
            "Frequent use of console.log for output",
            "console.log statements left in production code can leak internal data and clutter logs.",
            "Use a configurable logging library and remove or gate debug console.log statements before deployment."
        )

        issues_found = True


    if bare_except_count > 0:

        add_finding(
            findings,
            "Security",
            "Medium",
            "Bare except blocks detected",
            "Bare 'except:' clauses silently swallow all errors, including ones that should stop deployment or alert developers.",
            "Catch specific exceptions and log or handle them explicitly instead of using a bare except."
        )

        issues_found = True


    return not issues_found


# =========================================================
# TEST DETECTION
# =========================================================

def check_tests(
    project_path,
    findings
):

    test_found = False

    test_directories = {
        "test",
        "tests",
        "__tests__"
    }


    for root, dirs, files in os.walk(
        project_path
    ):

        dirs[:] = [
            d for d in dirs
            if d not in IGNORED_DIRS
        ]


        current_dirs = {
            d.lower()
            for d in dirs
        }


        if current_dirs.intersection(
            test_directories
        ):

            test_found = True

            break


        for file in files:

            filename = file.lower()


            if (
                filename.startswith("test_")
                or filename.endswith("_test.py")
                or filename.endswith(".test.js")
                or filename.endswith(".spec.js")
                or filename.endswith(".test.ts")
            ):

                test_found = True

                break


        if test_found:
            break


    if not test_found:

        add_finding(
            findings,
            "Testing",
            "Medium",
            "Automated tests not detected",
            "Deployment problems may not be identified before release.",
            "Add automated tests and run them before deploying the application."
        )


    return test_found


# =========================================================
# DOCKER CHECK
# =========================================================

def check_docker(
    project_path,
    findings
):

    dockerfile = find_file(
        project_path,
        "Dockerfile"
    )


    if dockerfile:
        return True


    add_finding(
        findings,
        "Deployment",
        "Low",
        "Dockerfile not detected",
        "Containerized deployment is not currently configured.",
        "A Dockerfile can be added if consistent container-based deployment is required."
    )


    return False


# =========================================================
# CATEGORY SCORE
# =========================================================

def calculate_category_scores(
    findings,
    checks
):

    categories = {

        "Security": 100,

        "Configuration": 100,

        "Dependencies": 100,

        "Project Structure": 100,

        "Testing": 100,

        "Deployment": 100
    }


    # Penalty for each severity
    penalties = {

        "Critical": 30,

        "High": 20,

        "Medium": 10,

        "Low": 5
    }


    for finding in findings:

        category = finding["category"]

        severity = finding["severity"]


        if category in categories:

            categories[category] -= penalties.get(
                severity,
                0
            )


    # Keep scores between 0 and 100
    for category in categories:

        categories[category] = max(
            0,
            min(
                100,
                categories[category]
            )
        )


    return categories


# =========================================================
# OVERALL SCORE
# =========================================================

def calculate_overall_score(
    category_scores
):

    # Security has the highest importance.
    weights = {

        "Security": 0.35,

        "Configuration": 0.15,

        "Dependencies": 0.10,

        "Project Structure": 0.10,

        "Testing": 0.15,

        "Deployment": 0.15
    }


    score = sum(

        category_scores[category] * weight

        for category, weight
        in weights.items()
    )


    return round(score)


# =========================================================
# READINESS STATUS
# =========================================================

def get_readiness_status(
    score
):

    if score >= 90:

        return "Excellent"

    elif score >= 75:

        return "Good"

    elif score >= 50:

        return "Needs Improvement"

    else:

        return "Not Deployment Ready"


# =========================================================
# SCAN PROJECT
# =========================================================

def scan_project(
    project_path
):

    findings = []


    # Run all checks

    readme = check_readme(
        project_path,
        findings
    )


    dependencies = check_dependencies(
        project_path,
        findings
    )


    environment = check_environment(
        project_path,
        findings
    )


    gitignore = check_gitignore(
        project_path,
        findings
    )


    secrets = check_secrets(
        project_path,
        findings
    )


    debug = check_debug_mode(
        project_path,
        findings
    )


    error_handling = check_error_handling(
        project_path,
        findings
    )


    tests = check_tests(
        project_path,
        findings
    )


    docker = check_docker(
        project_path,
        findings
    )


    # Detect project type

    project_types = detect_project_type(
        project_path
    )


    # Store check results

    checks = {

        "readme": readme,

        "dependencies": dependencies,

        "environment": environment,

        "gitignore": gitignore,

        "secrets": secrets,

        "debug": debug,

        "error_handling": error_handling,

        "tests": tests,

        "docker": docker
    }


    # Calculate category scores

    category_scores = calculate_category_scores(
        findings,
        checks
    )


    # Calculate overall score

    overall_score = calculate_overall_score(
        category_scores
    )


    # Calculate readiness

    readiness = get_readiness_status(
        overall_score
    )


    # Count findings

    critical = sum(
        1
        for f in findings
        if f["severity"] == "Critical"
    )


    high = sum(
        1
        for f in findings
        if f["severity"] == "High"
    )


    medium = sum(
        1
        for f in findings
        if f["severity"] == "Medium"
    )


    low = sum(
        1
        for f in findings
        if f["severity"] == "Low"
    )


    # Return complete result

    return {

        "score": overall_score,

        "readiness": readiness,

        "project_type": project_types,

        "categories": category_scores,

        "findings": findings,

        "summary": {

            "critical": critical,

            "high": high,

            "medium": medium,

            "low": low,

            "total": len(findings)
        }
    }


# =========================================================
# UPLOAD + SCAN
# =========================================================

@app.route(
    "/scan",
    methods=["POST"]
)
def scan():

    # Check uploaded file

    if "project" not in request.files:

        return jsonify({
            "success": False,
            "error": "No project file uploaded."
        }), 400


    file = request.files["project"]


    # Empty filename

    if file.filename == "":

        return jsonify({
            "success": False,
            "error": "Please select a ZIP file."
        }), 400


    # ZIP validation

    if not file.filename.lower().endswith(
        ".zip"
    ):

        return jsonify({
            "success": False,
            "error": "Only ZIP files are supported."
        }), 400


    # Clear previous extracted project

    shutil.rmtree(
        EXTRACT_FOLDER,
        ignore_errors=True
    )


    os.makedirs(
        EXTRACT_FOLDER,
        exist_ok=True
    )


    # Save uploaded ZIP

    upload_path = os.path.join(
        UPLOAD_FOLDER,
        file.filename
    )


    file.save(
        upload_path
    )


    # Extract ZIP

    try:

        with zipfile.ZipFile(
            upload_path,
            "r"
        ) as zip_ref:

            zip_ref.extractall(
                EXTRACT_FOLDER
            )


    except zipfile.BadZipFile:

        return jsonify({
            "success": False,
            "error": "Invalid ZIP file."
        }), 400


    except Exception as e:

        return jsonify({
            "success": False,
            "error": f"Unable to extract ZIP file: {str(e)}"
        }), 500


    # Determine project root

    scan_root = EXTRACT_FOLDER


    items = os.listdir(
        EXTRACT_FOLDER
    )


    if len(items) == 1:

        single_path = os.path.join(
            EXTRACT_FOLDER,
            items[0]
        )


        if os.path.isdir(
            single_path
        ):

            scan_root = single_path


    # Scan project

    try:

        result = scan_project(
            scan_root
        )


        return jsonify({

            "success": True,

            "result": result

        })


    except Exception as e:

        return jsonify({

            "success": False,

            "error": f"Project analysis failed: {str(e)}"

        }), 500


# =========================================================
# RUN
# =========================================================

if __name__ == "__main__":

    app.run(

        debug=True,

        host="0.0.0.0",

        port=int(
            os.environ.get(
                "PORT",
                5000
            )
        )
    )
