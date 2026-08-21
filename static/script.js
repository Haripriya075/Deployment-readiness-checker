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

            if (!projectFile.files.length) {
                return;
            }

            handleFile(
                projectFile.files[0]
            );
        }
    );


    /* =====================================================
       DRAG & DROP
    ====================================================== */

    ["dragenter", "dragover"].forEach(
        eventName => {

            dropZone.addEventListener(
                eventName,
                event => {

                    event.preventDefault();

                    dropZone.classList.add(
                        "dragover"
                    );
                }
            );
        }
    );


    ["dragleave", "drop"].forEach(
        eventName => {

            dropZone.addEventListener(
                eventName,
                event => {

                    event.preventDefault();

                    dropZone.classList.remove(
                        "dragover"
                    );
                }
            );
        }
    );


    dropZone.addEventListener(
        "drop",
        event => {

            const files =
                event.dataTransfer.files;

            if (!files.length) {
                return;
            }

            const file = files[0];

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

            try {

                projectFile.files = files;

            } catch (error) {

                console.warn(
                    "Could not assign dropped file:",
                    error
                );
            }

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

        if (!file) {

            showError(
                "Please select a ZIP file."
            );

            scanButton.disabled = true;

            return;
        }

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

        /* 50 MB client-side validation */

        const maxSize =
            50 * 1024 * 1024;

        if (file.size > maxSize) {

            showError(
                "ZIP file must be smaller than 50 MB."
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

            if (!projectFile.files.length) {

                showError(
                    "Please select a ZIP file."
                );

                return;
            }

            const file =
                projectFile.files[0];

            if (
                !file.name
                    .toLowerCase()
                    .endsWith(".zip")
            ) {

                showError(
                    "Only ZIP files are supported."
                );

                return;
            }

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


                /* =========================================
                   SAFELY READ SERVER RESPONSE
                ========================================== */

                const contentType =
                    response.headers.get(
                        "content-type"
                    ) || "";


                let data;


                if (
                    contentType.includes(
                        "application/json"
                    )
                ) {

                    data =
                        await response.json();

                }
                else {

                    /*
                     Flask returned HTML or
                     another non-JSON response.
                    */

                    const text =
                        await response.text();

                    console.error(
                        "Server returned non-JSON response:",
                        text
                    );

                    throw new Error(
                        "Server returned an unexpected response. Please check the Flask terminal for the error."
                    );
                }


                /* =========================================
                   CHECK SERVER RESULT
                ========================================== */

                if (
                    !response.ok ||
                    !data.success
                ) {

                    throw new Error(
                        data.error ||
                        "Unable to analyze project."
                    );
                }


                /* =========================================
                   CHECK RESULT OBJECT
                ========================================== */

                if (
                    !data.result
                ) {

                    throw new Error(
                        "The server returned no scan results."
                    );
                }


                displayResults(
                    data.result
                );

            }

            catch (error) {

                console.error(
                    "Scan error:",
                    error
                );

                showError(
                    error.message ||
                    "Unable to analyze the project."
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
            data.score,
            data.readiness
        );


        displayProjectInfo(
            data
        );


        displayCategories(
            data.categories || {}
        );


        displayFindings(
            data.findings || []
        );


        results.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }


    /* =====================================================
       SCORE
    ====================================================== */

    function displayScore(
        score,
        readiness
    ) {

        const scoreElement =
            document.getElementById(
                "score"
            );

        const statusElement =
            document.getElementById(
                "scoreStatus"
            );


        const numericScore =
            Number(score) || 0;


        scoreElement.textContent =
            numericScore;


        /*
         * If the updated Flask backend
         * sends readiness, use it.
         */

        if (readiness) {

            statusElement.textContent =
                readiness;

            return;
        }


        /*
         * Fallback for old backend.
         */

        if (numericScore >= 90) {

            statusElement.textContent =
                "Excellent";

        }

        else if (numericScore >= 75) {

            statusElement.textContent =
                "Good";

        }

        else if (numericScore >= 50) {

            statusElement.textContent =
                "Needs Improvement";

        }

        else {

            statusElement.textContent =
                "Not Deployment Ready";
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


        const types =
            Array.isArray(
                data.project_type
            )
                ? data.project_type
                : ["Unknown"];


        projectType.textContent =
            types.join(" • ");


        const s =
            data.summary || {};


        const critical =
            Number(s.critical) || 0;

        const high =
            Number(s.high) || 0;

        const medium =
            Number(s.medium) || 0;

        const low =
            Number(s.low) || 0;


        summary.innerHTML = `
            <span>
                Critical:
                <strong>${critical}</strong>
            </span>

            &nbsp; | &nbsp;

            <span>
                High:
                <strong>${high}</strong>
            </span>

            &nbsp; | &nbsp;

            <span>
                Medium:
                <strong>${medium}</strong>
            </span>

            &nbsp; | &nbsp;

            <span>
                Low:
                <strong>${low}</strong>
            </span>
        `;
    }


    /* =====================================================
       CATEGORY SCORES
    ====================================================== */

    function displayCategories(
        categories
    ) {

        const grid =
            document.getElementById(
                "categoryGrid"
            );


        grid.innerHTML = "";


        Object.entries(categories)
            .forEach(
                ([category, score]) => {

                    const numericScore =
                        Math.max(
                            0,
                            Math.min(
                                100,
                                Number(score) || 0
                            )
                        );


                    const card =
                        document.createElement(
                            "div"
                        );


                    card.className =
                        "category-card";


                    card.innerHTML = `
                        <div class="category-top">

                            <span>
                                ${escapeHTML(
                                    category
                                )}
                            </span>

                            <span class="category-score">
                                ${numericScore}/100
                            </span>

                        </div>

                        <div class="progress">

                            <div
                                class="progress-bar"
                                style="width: ${numericScore}%"
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

    function displayFindings(
        findings
    ) {

        const container =
            document.getElementById(
                "findingsContainer"
            );


        container.innerHTML = "";


        if (
            !Array.isArray(findings) ||
            findings.length === 0
        ) {

            container.innerHTML = `
                <div class="finding">

                    <div class="finding-title">
                        All checks passed
                    </div>

                    <p>
                        No deployment-readiness
                        issues were detected.
                    </p>

                </div>
            `;

            return;
        }


        /*
         * Display Critical first,
         * then High, Medium and Low.
         */

        const severityOrder = {
            "Critical": 1,
            "High": 2,
            "Medium": 3,
            "Low": 4
        };


        const sortedFindings =
            [...findings].sort(
                (a, b) => {

                    return (
                        (severityOrder[a.severity] || 99)
                        -
                        (severityOrder[b.severity] || 99)
                    );
                }
            );


        sortedFindings.forEach(
            finding => {

                const element =
                    document.createElement(
                        "div"
                    );


                const severity =
                    finding.severity || "Low";


                element.className =
                    `finding ${severity}`;


                element.innerHTML = `
                    <div class="finding-header">

                        <div class="finding-title">
                            ${escapeHTML(
                                finding.title ||
                                "Issue detected"
                            )}
                        </div>

                        <span
                            class="severity ${escapeHTML(
                                severity
                            )}"
                        >
                            ${escapeHTML(
                                severity
                            )}
                        </span>

                    </div>


                    <div class="finding-category">
                        ${escapeHTML(
                            finding.category ||
                            "General"
                        )}
                    </div>


                    <p>

                        <strong>
                            Impact:
                        </strong>

                        ${escapeHTML(
                            finding.impact ||
                            "No impact description available."
                        )}

                    </p>


                    <p>

                        <strong>
                            Recommendation:
                        </strong>

                        ${escapeHTML(
                            finding.recommendation ||
                            "Review this issue before deployment."
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

    function setLoading(
        isLoading
    ) {

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

    function showError(
        message
    ) {

        errorBox.textContent =
            message;


        errorBox.classList.remove(
            "hidden"
        );


        errorBox.scrollIntoView({
            behavior: "smooth",
            block: "nearest"
        });
    }


    /* =====================================================
       ESCAPE HTML
    ====================================================== */

    function escapeHTML(
        value
    ) {

        return String(
            value ?? ""
        )
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


});
    
