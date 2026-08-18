function displayReport(data) {

    if (!reportSection || !report) {
        console.error("Report elements are missing.");
        return;
    }

    if (!data.success) {
        message.textContent =
            data.message || "Project analysis failed.";

        message.style.color = "#d64545";
        return;
    }

    var reportData = data.report || {};

    reportSection.classList.remove("hidden");


    /* =================================================
       SCORE
    ================================================= */

    var score = Number(reportData.score);

    if (isNaN(score)) {
        score = 0;
    }

    score = Math.max(
        0,
        Math.min(100, score)
    );


    /* =================================================
       PROJECT TYPE
    ================================================= */

    var projectType = "Unknown";

    var results = Array.isArray(reportData.results)
        ? reportData.results
        : [];

    var projectTypeResult = results.find(function (item) {
        return item.name === "Project Type";
    });

    if (projectTypeResult) {

        var match =
            projectTypeResult.message.match(
                /Detected project type:\s*(.+)/i
            );

        if (match) {
            projectType = match[1];
        }
    }


    /* =================================================
       SCORE MESSAGE
    ================================================= */

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


    /* =================================================
       BUILD REPORT
    ================================================= */

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


    /* =================================================
       BACKEND RESULTS
    ================================================= */

    results.forEach(function (result) {

        var statusClass =
            result.status || "pass";

        var detailsHtml = "";


        if (
            result.details &&
            Array.isArray(result.details) &&
            result.details.length > 0
        ) {

            detailsHtml =
                '<div class="result-details">';

            result.details.forEach(function (detail) {

                detailsHtml +=
                    '<div>' +
                    escapeHtml(
                        detail.file || ""
                    );

                if (detail.line) {

                    detailsHtml +=
                        ' — Line ' +
                        escapeHtml(detail.line);

                }

                detailsHtml +=
                    '</div>';

            });

            detailsHtml +=
                '</div>';
        }


        html +=
            '<div class="report-item">' +

            '<span>' +
            escapeHtml(result.name) +
            '</span>' +

            '<span class="report-status ' +
            escapeHtml(statusClass) +
            '">' +

            escapeHtml(result.message) +

            '</span>' +

            detailsHtml +

            '</div>';

    });


    /* =================================================
       TECHNOLOGY STACK
    ================================================= */

    if (
        reportData.technologies &&
        Array.isArray(reportData.technologies)
    ) {

        html +=
            '<div class="report-item">' +

            '<span>Technology Stack</span>' +

            '<span class="report-status">' +

            escapeHtml(
                reportData.technologies.join(", ")
            ) +

            '</span>' +

            '</div>';
    }


    /* =================================================
       FILE COUNT
    ================================================= */

    if (
        reportData.files_scanned !== undefined
    ) {

        html +=
            '<div class="report-item">' +

            '<span>Files Scanned</span>' +

            '<span class="report-status">' +

            escapeHtml(
                reportData.files_scanned
            ) +

            '</span>' +

            '</div>';
    }


    /* =================================================
       DISPLAY
    ================================================= */

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
}
