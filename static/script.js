document.addEventListener("DOMContentLoaded", () => {

    const projectFile =
        document.getElementById("projectFile");

    const selectButton =
        document.getElementById("selectButton");

    const scanButton =
        document.getElementById("scanButton");

    const dropZone =
        document.getElementById("dropZone");

    const fileName =
        document.getElementById("fileName");

    const loading =
        document.getElementById("loading");

    const results =
        document.getElementById("results");

    const errorBox =
        document.getElementById("errorBox");

    const themeToggle =
        document.getElementById("themeToggle");


    /* =====================================================
       FILE SELECTION
    ====================================================== */

    selectButton.addEventListener(
        "click",
        () => {
            projectFile.click();
        }
    );


    projectFile.addEventListener(
        "change",
        () => {

            if (
                projectFile.files.length === 0
            ) {
                return;
            }

            const file =
                projectFile.files[0];

            handleFile(file);
        }
    );


    /* =====================================================
       DRAG & DROP
    ====================================================== */

    [
        "dragenter",
        "dragover"
    ].forEach(eventName => {

        dropZone.addEventListener(
            eventName,
            event => {

                event.preventDefault();

                dropZone.classList.add(
                    "dragover"
                );
            }
        );

    });


    [
        "dragleave",
        "drop"
    ].forEach(eventName => {

        dropZone.addEventListener(
            eventName,
            event => {

                event.preventDefault();

                dropZone.classList.remove(
                    "dragover"
                );
            }
        );

    });


    dropZone.addEventListener(
        "drop",
        event => {

            const files =
                event.dataTransfer.files;

            if (!files.length) {
                return;
            }

            const file =
                files[0];

            if (
                !file.name
                    .toLowerCase()
                    .endsWith(".zip")
            ) {

                showError(
                    "Please upload a ZIP file."
                );

                return;
            }

            projectFile.files =
                files;

            handleFile(file);
        }
    );


    /* =====================================================
       HANDLE FILE
    ====================================================== */

    function handleFile(file) {

        errorBox.classList.add(
            "hidden"
        );

        results.classList.add(
            "hidden"
        );

        if (
            !file.name
                .toLowerCase()
                .endsWith(".zip")
        ) {

            showError(
                "Only ZIP files are supported."
            );

            scanButton.disabled = true;

            return;
        }

        fileName.textContent =
            "Selected: " + file.name;

        scanButton.disabled = false;
    }


    /* =====================================================
       SCAN
    ====================================================== */

    scanButton.addEventListener(
        "click",
        async () => {

            if (
                !projectFile.files.length
            ) {
                showError(
                    "Please select a ZIP file."
                );

                return;
            }

            const file =
                projectFile.files[0];

            const formData =
                new FormData();

            formData.append(
                "project",
                file
            );

            setLoading(true);

            errorBox.classList.add(
                "hidden"
            );

            results.classList.add(
                "hidden"
            );

            try {

                const response =
                    await fetch(
                        "/scan",
                        {
                            method: "POST",
                            body: formData
                        }
                    );

                const data =
                    await response.json();

                if (!response.ok ||
                    !data.success) {

                    throw new Error(
                        data.error ||
                        "Unable to analyze project."
                    );
                }

                displayResults(
                    data.result
                );

            }
            catch (error) {

                showError(
                    error.message
                );

            }
            finally {

                setLoading(false);
            }

        }
    );


    /* =====================================================
       DISPLAY RESULTS
    ====================================================== */

    function displayResults(data) {

        results.classList.remove(
            "hidden"
        );

        displayScore(
            data.score
        );

        displayProjectInfo(
            data
        );

        displayCategories(
            data.categories
        );

        displayFindings(
            data.findings
        );

        results.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }


    /* =====================================================
       SCORE
    ====================================================== */

    function displayScore(score) {

        const scoreElement =
            document.getElementById("score");

        const statusElement =
            document.getElementById("scoreStatus");

        scoreElement.textContent =
            score;

        if (score >= 85) {

            statusElement.textContent =
                "Ready for deployment";

        }
        else if (score >= 70) {

            statusElement.textContent =
                "Mostly ready";

        }
        else if (score >= 50) {

            statusElement.textContent =
                "Needs improvement";

        }
        else {

            statusElement.textContent =
                "High deployment risk";
        }
    }


    /* =====================================================
       PROJECT INFO
    ====================================================== */

    function displayProjectInfo(data) {

        const projectType =
            document.getElementById(
                "projectType"
            );

        const summary =
            document.getElementById(
                "findingSummary"
            );

        projectType.textContent =
            data.project_type.join(
                " • "
            );

        const s =
            data.summary;

        summary.innerHTML = `
            <span>
                Critical: <strong>${s.critical}</strong>
            </span>
            &nbsp; | &nbsp;
            <span>
                High: <strong>${s.high}</strong>
            </span>
            &nbsp; | &nbsp;
            <span>
                Medium: <strong>${s.medium}</strong>
            </span>
            &nbsp; | &nbsp;
            <span>
                Low: <strong>${s.low}</strong>
            </span>
        `;
    }


    /* =====================================================
       CATEGORY SCORES
    ====================================================== */

    function displayCategories(categories) {

        const grid =
            document.getElementById(
                "categoryGrid"
            );

        grid.innerHTML = "";

        Object.entries(categories)
            .forEach(
                ([category, score]) => {

                    const card =
                        document.createElement(
                            "div"
                        );

                    card.className =
                        "category-card";

                    card.innerHTML = `
                        <div class="category-top">
                            <span>
                                ${escapeHTML(category)}
                            </span>

                            <span class="category-score">
                                ${score}/100
                            </span>
                        </div>

                        <div class="progress">
                            <div
                                class="progress-bar"
                                style="width: ${score}%"
                            ></div>
                        </div>
                    `;

                    grid.appendChild(
                        card
                    );
                }
            );
    }


    /* =====================================================
       FINDINGS
    ====================================================== */

    function displayFindings(findings) {

        const container =
            document.getElementById(
                "findingsContainer"
            );

        container.innerHTML = "";

        if (!findings.length) {

            container.innerHTML = `
                <div class="finding">
                    <div class="finding-title">
                        All checks passed
                    </div>

                    <p>
                        No major deployment-readiness
                        issues were detected.
                    </p>
                </div>
            `;

            return;
        }

        findings.forEach(
            finding => {

                const element =
                    document.createElement(
                        "div"
                    );

                element.className =
                    `finding ${finding.severity}`;

                element.innerHTML = `
                    <div class="finding-header">

                        <div class="finding-title">
                            ${escapeHTML(
                                finding.title
                            )}
                        </div>

                        <span
                            class="severity ${finding.severity}"
                        >
                            ${escapeHTML(
                                finding.severity
                            )}
                        </span>

                    </div>

                    <div class="finding-category">
                        ${escapeHTML(
                            finding.category
                        )}
                    </div>

                    <p>
                        <strong>
                            Impact:
                        </strong>

                        ${escapeHTML(
                            finding.impact
                        )}
                    </p>

                    <p>
                        <strong>
                            Recommendation:
                        </strong>

                        ${escapeHTML(
                            finding.recommendation
                        )}
                    </p>
                `;

                container.appendChild(
                    element
                );
            }
        );
    }


    /* =====================================================
       LOADING
    ====================================================== */

    function setLoading(isLoading) {

        if (isLoading) {

            loading.classList.remove(
                "hidden"
            );

            scanButton.disabled =
                true;

            scanButton.textContent =
                "Analyzing...";

        }
        else {

            loading.classList.add(
                "hidden"
            );

            scanButton.disabled =
                !projectFile.files.length;

            scanButton.textContent =
                "Analyze Project";
        }
    }


    /* =====================================================
       ERROR
    ====================================================== */

    function showError(message) {

        errorBox.textContent =
            message;

        errorBox.classList.remove(
            "hidden"
        );
    }


    /* =====================================================
       ESCAPE HTML
    ====================================================== */

    function escapeHTML(value) {

        return String(value)
            .replace(
                /&/g,
                "&amp;"
            )
            .replace(
                /</g,
                "&lt;"
            )
            .replace(
                />/g,
                "&gt;"
            )
            .replace(
                /"/g,
                "&quot;"
            )
            .replace(
                /'/g,
                "&#039;"
            );
    }


    /* =====================================================
       THEME
    ====================================================== */

    themeToggle.addEventListener(
        "click",
        () => {

            document.body.classList.toggle(
                "dark"
            );

            const dark =
                document.body.classList.contains(
                    "dark"
                );

            themeToggle.textContent =
                dark
                    ? "Light Mode"
                    : "Dark Mode";
        }
    );

});
