const projectFile = document.getElementById("projectFile");
const fileName = document.getElementById("fileName");
const scanBtn = document.getElementById("scanBtn");
const message = document.getElementById("message");


/* =========================================================
   FILE SELECTION
========================================================= */

projectFile.addEventListener("change", function () {

    if (projectFile.files.length === 0) {

        fileName.textContent = "No file selected";

        return;
    }

    const file = projectFile.files[0];

    fileName.textContent = file.name;

});


/* =========================================================
   SCAN PROJECT
========================================================= */

scanBtn.addEventListener("click", async function () {

    if (projectFile.files.length === 0) {

        message.textContent = "Please select a ZIP file first.";

        return;
    }


    const file = projectFile.files[0];


    if (!file.name.toLowerCase().endsWith(".zip")) {

        message.textContent = "Please upload a ZIP file.";

        return;
    }


    const formData = new FormData();

    formData.append("project", file);


    scanBtn.disabled = true;

    scanBtn.textContent = "Scanning...";

    message.textContent = "Analyzing your project...";


    try {

        const response = await fetch("/upload", {
            method: "POST",
            body: formData
        });


        const data = await response.json();


        if (!data.success) {

            message.textContent = data.message;

            scanBtn.disabled = false;

            scanBtn.textContent = "Scan Project";

            return;
        }


        message.textContent = data.message;


        displayReport(data.report);


        scanBtn.textContent = "Scan Complete ✓";


    } catch (error) {

        console.error(error);

        message.textContent =
            "Something went wrong while scanning the project.";

        scanBtn.textContent = "Scan Project";

    }


    scanBtn.disabled = false;

});


/* =========================================================
   DISPLAY REPORT
========================================================= */

function displayReport(report) {

    const existingReport =
        document.getElementById("reportSection");


    if (existingReport) {

        existingReport.remove();

    }


    const section = document.createElement("section");

    section.id = "reportSection";

    section.className = "report-section";


    /* -----------------------------------------------------
       RESULT CARDS
    ----------------------------------------------------- */

    let resultHTML = "";


    report.results.forEach(function (result) {

        let icon = "✓";


        if (result.status === "warning") {

            icon = "⚠";

        }


        if (result.status === "critical") {

            icon = "✕";

        }


        if (result.status === "pass") {

            icon = "✓";

        }


        let detailsHTML = "";


        /* -------------------------------------------------
           DETAILS
        ------------------------------------------------- */

        if (
            result.details &&
            result.details.length > 0
        ) {

            detailsHTML += `
                <div class="issue-details">
            `;


            result.details.forEach(function (detail) {

                detailsHTML += `
                    <div class="issue-detail">

                        <div class="detail-row">
                            <strong>File:</strong>
                            <span>${escapeHTML(detail.file || "")}</span>
                        </div>

                        <div class="detail-row">
                            <strong>Line:</strong>
                            <span>${detail.line || ""}</span>
                        </div>

                        ${
                            detail.code
                                ? `
                                    <div class="code-box">
                                        <code>${escapeHTML(detail.code)}</code>
                                    </div>
                                  `
                                : ""
                        }

                    </div>
                `;

            });


            detailsHTML += `
                </div>
            `;

        }


        /* -------------------------------------------------
           RECOMMENDED FIX
        ------------------------------------------------- */

        let fixHTML = "";


        if (result.status === "critical") {

            fixHTML = `
                <div class="fix-box">

                    <strong>Recommended Fix</strong>

                    <p>
                        Move API keys, passwords and other
                        secrets to environment variables or
                        secure secret management.
                        Do not store real credentials directly
                        inside source code.
                    </p>

                </div>
            `;

        }


        if (
            result.name === "README Documentation" &&
            result.status === "warning"
        ) {

            fixHTML = `
                <div class="fix-box">

                    <strong>Recommended Fix</strong>

                    <p>
                        Add a README.md file explaining the
                        project, setup instructions,
                        dependencies and deployment steps.
                    </p>

                </div>
            `;

        }


        if (
            result.name === "Dependencies" &&
            result.status === "warning"
        ) {

            fixHTML = `
                <div class="fix-box">

                    <strong>Recommended Fix</strong>

                    <p>
                        Add the appropriate dependency file,
                        such as requirements.txt for Python
                        or package.json for Node.js.
                    </p>

                </div>
            `;

        }


        if (
            result.name === "Environment Configuration" &&
            result.status === "warning"
        ) {

            fixHTML = `
                <div class="fix-box">

                    <strong>Recommended Fix</strong>

                    <p>
                        Use environment variables for
                        deployment configuration and keep
                        sensitive values outside your source code.
                    </p>

                </div>
            `;

        }


        if (
            result.name === "Debug Configuration" &&
            result.status === "warning"
        ) {

            fixHTML = `
                <div class="fix-box">

                    <strong>Recommended Fix</strong>

                    <p>
                        Disable debug mode before deploying
                        the application to production.
                    </p>

                </div>
            `;

        }


        if (
            result.name === "Testing" &&
            result.status === "warning"
        ) {

            fixHTML = `
                <div class="fix-box">

                    <strong>Recommended Fix</strong>

                    <p>
                        Add basic tests for important project
                        functionality before deployment.
                    </p>

                </div>
            `;

        }


        resultHTML += `

            <div class="result-card ${result.status}">

                <div class="result-icon">
                    ${icon}
                </div>


                <div class="result-content">

                    <h3>
                        ${escapeHTML(result.name)}
                    </h3>


                    <p>
                        ${escapeHTML(result.message)}
                    </p>


                    ${detailsHTML}


                    ${fixHTML}

                </div>

            </div>

        `;

    });


    /* =====================================================
       TECHNOLOGY DETECTION
    ===================================================== */

    let technologyHTML = "";


    if (
        report.technologies &&
        report.technologies.length > 0
    ) {

        let technologyItems = "";


        report.technologies.forEach(function (technology) {

            technologyItems += `
                <span class="technology-tag">
                    ${escapeHTML(technology)}
                </span>
            `;

        });


        technologyHTML = `

            <div class="technology-section">

                <div class="technology-title">
                    Detected Technology
                </div>


                <div class="technology-list">

                    ${technologyItems}

                </div>

            </div>

        `;

    }


    /* =====================================================
       OVERALL REPORT
    ===================================================== */

    section.innerHTML = `

        <div class="report-header">

            <div>

                <span class="badge">
                    SCAN COMPLETE
                </span>


                <h2>
                    Deployment Readiness Report
                </h2>


                <p>
                    ${report.files_scanned}
                    files scanned
                </p>


                ${technologyHTML}

            </div>


            <div class="score-box">

                <div class="score">
                    ${report.score}
                </div>


                <div>
                    / 100
                </div>


                <strong>
                    ${escapeHTML(report.overall)}
                </strong>

            </div>

        </div>


        <div class="results">

            ${resultHTML}

        </div>

    `;


    document
        .querySelector(".container")
        .appendChild(section);


    section.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}


/* =========================================================
   HTML ESCAPE
   Prevents project code from being interpreted as HTML
========================================================= */

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}