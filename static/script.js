document.addEventListener("DOMContentLoaded", function () {

    /* =====================================================
       GET ELEMENTS
    ===================================================== */

    var fileInput = document.getElementById("projectFile");
    var fileName = document.getElementById("fileName");
    var scanBtn = document.getElementById("scanBtn");
    var message = document.getElementById("message");
    var uploadZone = document.getElementById("uploadZone");
    var reportSection = document.getElementById("reportSection");
    var report = document.getElementById("report");


    /* =====================================================
       CHECK ELEMENTS
    ===================================================== */

    if (!fileInput || !fileName || !scanBtn || !message) {
        console.error("DeployCheck: Required HTML elements are missing.");
        return;
    }


    /* =====================================================
       FILE SELECTION
    ===================================================== */

    fileInput.addEventListener("change", function () {

        if (fileInput.files.length === 0) {
            fileName.textContent = "No project selected";
            return;
        }

        var file = fileInput.files[0];

        if (!file.name.toLowerCase().endsWith(".zip")) {

            fileName.textContent = "No project selected";

            message.textContent = "Please upload a ZIP file.";
            message.style.color = "#d64545";

            fileInput.value = "";

            return;
        }

        fileName.textContent = file.name;

        message.textContent = "";
        message.className = "message";
    });


    /* =====================================================
       DRAG AND DROP
    ===================================================== */

    if (uploadZone) {

        uploadZone.addEventListener("dragover", function (event) {

            event.preventDefault();

            uploadZone.classList.add("dragging");

        });


        uploadZone.addEventListener("dragleave", function () {

            uploadZone.classList.remove("dragging");

        });


        uploadZone.addEventListener("drop", function (event) {

            event.preventDefault();

            uploadZone.classList.remove("dragging");

            var files = event.dataTransfer.files;

            if (!files || files.length === 0) {
                return;
            }

            var droppedFile = files[0];

            if (!droppedFile.name.toLowerCase().endsWith(".zip")) {

                message.textContent =
                    "Please upload a ZIP file.";

                message.style.color = "#d64545";

                return;
            }

            try {

                var dataTransfer = new DataTransfer();

                dataTransfer.items.add(droppedFile);

                fileInput.files = dataTransfer.files;

                fileName.textContent = droppedFile.name;

                message.textContent = "";
                message.className = "message";

            } catch (error) {

                console.error(
                    "Could not process dropped file:",
                    error
                );

                message.textContent =
                    "Please select the ZIP file using the button.";

                message.style.color = "#d64545";
            }

        });

    }


    /* =====================================================
       SCAN BUTTON
    ===================================================== */

    scanBtn.addEventListener("click", function () {

        if (fileInput.files.length === 0) {

            message.textContent =
                "Please select a ZIP file first.";

            message.style.color = "#d64545";

            return;
        }


        var selectedFile = fileInput.files[0];


        /* -------------------------------------------------
           FILE TYPE CHECK
        ------------------------------------------------- */

        if (
            !selectedFile.name
                .toLowerCase()
                .endsWith(".zip")
        ) {

            message.textContent =
                "Only ZIP files are supported.";

            message.style.color = "#d64545";

            return;
        }


        /* -------------------------------------------------
           UI: SCANNING
        ------------------------------------------------- */

        scanBtn.disabled = true;

        scanBtn.innerHTML =
            '<span class="scan-icon">◌</span> Analyzing Project...';

        message.textContent =
            "Scanning project files...";

        message.style.color = "#536dfe";


        /* -------------------------------------------------
           FORM DATA
        ------------------------------------------------- */

        var formData = new FormData();

        formData.append(
            "file",
            selectedFile
        );


        /* =================================================
           SEND TO FLASK
           IMPORTANT: Flask route is /upload
        ================================================= */

        fetch("/upload", {
            method: "POST",
            body: formData
        })

        .then(function (response) {

            console.log(
                "Flask response status:",
                response.status
            );

            if (!response.ok) {

                return response.text().then(function (text) {

                    throw new Error(
                        "Server returned " +
                        response.status +
                        ": " +
                        text
                    );

                });

            }

            return response.text();

        })

        .then(function (text) {

            console.log(
                "Flask raw response:",
                text
            );

            var data;

            try {

                data = JSON.parse(text);

            } catch (error) {

                throw new Error(
                    "Flask did not return valid JSON. " +
                    "Response: " +
                    text.substring(0, 500)
                );

            }

            return data;

        })

        .then(function (data) {

            console.log(
                "DeployCheck response:",
                data
            );

            displayReport(data);

        })

        .catch(function (error) {

            console.error(
                "DeployCheck error:",
                error
            );

            message.textContent =
                "Unable to analyze the project: " +
                error.message;

            message.style.color = "#d64545";

        })

        .finally(function () {

            scanBtn.disabled = false;

            scanBtn.innerHTML =
                '<span class="scan-icon">◉</span> Analyze Project';

        });

    });


    /* =====================================================
       DISPLAY REPORT
    ===================================================== */

    function displayReport(data) {

        if (!reportSection || !report) {

            console.error(
                "Report elements are missing."
            );

            return;
        }


        reportSection.classList.remove("hidden");


        /* -------------------------------------------------
           SCORE
        ------------------------------------------------- */

        var score =
            data.score !== undefined
                ? data.score
                : data.readiness_score !== undefined
                    ? data.readiness_score
                    : data.deployment_score !== undefined
                        ? data.deployment_score
                        : 0;


        /* -------------------------------------------------
           PROJECT TYPE
        ------------------------------------------------- */

        var projectType =
            data.project_type ||
            data.projectType ||
            "Project";


        /* -------------------------------------------------
           SCORE NUMBER
        ------------------------------------------------- */

        score = Number(score);

        if (isNaN(score)) {
            score = 0;
        }


        score = Math.max(
            0,
            Math.min(
                100,
                score
            )
        );


        /* -------------------------------------------------
           SCORE MESSAGE
        ------------------------------------------------- */

        var scoreMessage;

        if (score >= 80) {

            scoreMessage =
                "Ready for deployment";

        } else if (score >= 60) {

            scoreMessage =
                "Needs some improvements";

        } else {

            scoreMessage =
                "Deployment risks detected";
        }


        /* -------------------------------------------------
           RESULT HTML
        ------------------------------------------------- */

        var html = "";


        html +=
            '<div class="report-score">' +
            score +
            '%' +
            '</div>';


        html +=
            '<div class="report-title">' +
            escapeHtml(scoreMessage) +
            '</div>';


        html +=
            '<div class="report-item">' +
            '<span>Project Type</span>' +
            '<span class="report-status">' +
            escapeHtml(projectType) +
            '</span>' +
            '</div>';


        /* -------------------------------------------------
           COMMON CHECKS
        ------------------------------------------------- */

        addResultItem(
            "README",
            data.readme
        );


        addResultItem(
            "Dependencies",
            data.dependencies
        );


        addResultItem(
            "Environment Configuration",
            data.environment
        );


        addResultItem(
            "Security",
            data.secrets
        );


        addResultItem(
            "Debug Mode",
            data.debug
        );


        addResultItem(
            "Tests",
            data.tests
        );


        /* -------------------------------------------------
           CHECKS OBJECT
        ------------------------------------------------- */

        if (
            data.checks &&
            typeof data.checks === "object" &&
            !Array.isArray(data.checks)
        ) {

            Object.keys(data.checks).forEach(
                function (key) {

                    var value = data.checks[key];

                    if (
                        value !== undefined &&
                        value !== null
                    ) {

                        addResultItem(
                            formatLabel(key),
                            value
                        );

                    }

                }
            );
        }


        /* -------------------------------------------------
           ISSUES
        ------------------------------------------------- */

        if (
            data.issues &&
            Array.isArray(data.issues) &&
            data.issues.length > 0
        ) {

            html +=
                '<div class="report-item">' +
                '<span>Issues</span>' +
                '<span class="report-status">' +
                escapeHtml(data.issues.join(", ")) +
                '</span>' +
                '</div>';

        }


        /* -------------------------------------------------
           RECOMMENDATIONS
        ------------------------------------------------- */

        if (
            data.recommendations &&
            Array.isArray(data.recommendations) &&
            data.recommendations.length > 0
        ) {

            html +=
                '<div class="report-item">' +
                '<span>Recommendations</span>' +
                '<span class="report-status">' +
                escapeHtml(
                    data.recommendations.join(", ")
                ) +
                '</span>' +
                '</div>';

        }


        /* -------------------------------------------------
           SHOW REPORT
        ------------------------------------------------- */

        report.innerHTML = html;


        setTimeout(function () {

            reportSection.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        }, 100);


        message.textContent =
            "Analysis completed successfully.";

        message.style.color = "#1b9c62";


        /* =================================================
           ADD RESULT ITEM
        ================================================= */

        function addResultItem(label, value) {

            if (
                value === undefined ||
                value === null
            ) {

                return;
            }


            var displayValue;


            if (typeof value === "boolean") {

                displayValue =
                    value ? "Yes" : "No";

            } else if (typeof value === "object") {

                displayValue =
                    JSON.stringify(value);

            } else {

                displayValue =
                    String(value);

            }


            html +=
                '<div class="report-item">' +
                '<span>' +
                escapeHtml(label) +
                '</span>' +
                '<span class="report-status">' +
                escapeHtml(displayValue) +
                '</span>' +
                '</div>';

        }

    }


    /* =====================================================
       FORMAT LABEL
    ===================================================== */

    function formatLabel(value) {

        return String(value)
            .replace(/_/g, " ")
            .replace(/\b\w/g, function (letter) {

                return letter.toUpperCase();

            });

    }


    /* =====================================================
       ESCAPE HTML
    ===================================================== */

    function escapeHtml(value) {

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }

});
