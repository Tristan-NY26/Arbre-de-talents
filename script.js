document.addEventListener("DOMContentLoaded", () => {
    const pointsInputElement = document.getElementById("points-input");

    function getAvailablePoints() {
        return Math.max(0, parseInt(pointsInputElement.value.trim(), 10) || 0);
    }

    function setAvailablePoints(value) {
        value = Math.max(0, value);
        pointsInputElement.value = value;
        localStorage.setItem("availablePoints", value);
    }

    function updateProgressBar(talentNode, points) {
        const maxPoints = parseInt(talentNode.querySelector("input").getAttribute("max"), 10);
        const progressElement = talentNode.querySelector(".progress");
        progressElement.style.width = (points / maxPoints) * 100 + "%";
    }

    function unlockNextTalent(currentTalent, nextTalent) {
        const points = parseInt(currentTalent.querySelector("input").value, 10) || 0;
        const maxPoints = parseInt(currentTalent.querySelector("input").getAttribute("max"), 10);

        if (points >= maxPoints) {
            nextTalent.classList.remove("locked", "grayed-out");
            nextTalent.querySelector("input").disabled = false;
        } else {
            nextTalent.classList.add("locked", "grayed-out");
            nextTalent.querySelector("input").disabled = true;
        }
    }

    function lockLowerTalentsIfHigherHasPoints() {
        const talents = [
            { lower: "talent1", higher: "talent1.1" },
            { lower: "talent1.1", higher: "talent1.2" },
            { lower: "talent1.2", higher: "talent1.3" },
            { lower: "talent1.3", higher: "talent1.4" },
            { lower: "talent2", higher: "talent2.1" },
            { lower: "talent2.1", higher: "talent2.2" },
            { lower: "talent2.2", higher: "talent2.3" },
            { lower: "talent2.3", higher: "talent2.4" },
            { lower: "talent3", higher: "talent3.1" },
            { lower: "talent3.1", higher: "talent3.2" },
            { lower: "talent3.2", higher: "talent3.3" },
            { lower: "talent3.3", higher: "talent3.4" },
        
        ];

        talents.forEach(({ lower, higher }) => {
            const higherInput = document.getElementById(higher).querySelector("input");
            const lowerInput = document.getElementById(lower).querySelector("input");

            if (parseInt(higherInput.value) > 0) {
                lowerInput.disabled = true;
                lowerInput.classList.add("grayed-out");
            } else {
                lowerInput.disabled = false;
                lowerInput.classList.remove("grayed-out");
            }
        });
    }

    function saveProgress() {
        const talentData = {};
        document.querySelectorAll(".point-input").forEach(input => {
            talentData[input.closest(".talent-node").id] = input.value;
        });
        localStorage.setItem("talentData", JSON.stringify(talentData));
    }

    function loadProgress() {
        const savedPoints = localStorage.getItem("availablePoints");
        if (savedPoints !== null) {
            setAvailablePoints(parseInt(savedPoints, 10));
        }

        const savedData = localStorage.getItem("talentData");
        if (savedData) {
            const talentData = JSON.parse(savedData);
            document.querySelectorAll(".point-input").forEach(input => {
                const talentId = input.closest(".talent-node").id;
                if (talentData[talentId] !== undefined) {
                    input.value = Math.max(0, parseInt(talentData[talentId], 10) || 0);
                    updateProgressBar(input.closest(".talent-node"), parseInt(input.value, 10) || 0);
                    input.setAttribute("data-previous-value", input.value);
                }
            });
        }

        unlockNextTalent(document.getElementById("talent1"), document.getElementById("talent1.1"));
        unlockNextTalent(document.getElementById("talent1.1"), document.getElementById("talent1.2"));
        unlockNextTalent(document.getElementById("talent1.2"), document.getElementById("talent1.3"));
        unlockNextTalent(document.getElementById("talent1.3"), document.getElementById("talent1.4"));
        unlockNextTalent(document.getElementById("talent2"), document.getElementById("talent2.1"));
        unlockNextTalent(document.getElementById("talent2.1"), document.getElementById("talent2.2"));
        unlockNextTalent(document.getElementById("talent2.2"), document.getElementById("talent2.3"));
        unlockNextTalent(document.getElementById("talent2.3"), document.getElementById("talent2.4"));
        unlockNextTalent(document.getElementById("talent3"), document.getElementById("talent3.1"));
        unlockNextTalent(document.getElementById("talent3.1"), document.getElementById("talent3.2"));
        unlockNextTalent(document.getElementById("talent3.2"), document.getElementById("talent3.3"));
        unlockNextTalent(document.getElementById("talent3.3"), document.getElementById("talent3.4"));
        lockLowerTalentsIfHigherHasPoints();
    }

    document.querySelectorAll(".point-input").forEach((inputElement) => {
        inputElement.addEventListener("input", (event) => {
            let pointsInvested = parseInt(event.target.value.trim(), 10) || 0;
            let maxPoints = parseInt(event.target.getAttribute("max"), 10);
            let previousValue = parseInt(event.target.getAttribute("data-previous-value")) || 0;
            let availablePoints = getAvailablePoints();

            // Vérifie si la valeur dépasse le maximum autorisé pour ce talent
            if (pointsInvested > maxPoints) {
                pointsInvested = maxPoints;
                event.target.value = maxPoints;
            }

            // Empêcher les valeurs négatives
            if (pointsInvested < 0) {
                pointsInvested = 0;
                event.target.value = pointsInvested;
            }

            let difference = pointsInvested - previousValue;

            if (difference > 0) { 
                // Ajout de points
                if (availablePoints - difference < 0) {
                    event.target.value = previousValue; 
                    return;
                }
                setAvailablePoints(availablePoints - difference);
            } else if (difference < 0) { 
                // Retrait de points
                const talentId = event.target.closest(".talent-node").id;
                const lockedTalents = {
                    "talent1": "talent1.1",
                    "talent1.1": "talent1.2",
                    "talent1.2": "talent1.3",
                    "talent1.3": "talent1.4",
                    "talent2": "talent2.1",
                    "talent2.1": "talent2.2",
                    "talent2.2": "talent2.3",
                    "talent2.3": "talent2.4",
                    "talent3": "talent3.1",
                    "talent3.1": "talent3.2",
                    "talent3.2": "talent3.3",
                    "talent3.3": "talent3.4",
                };

                if (lockedTalents[talentId]) {
                    const nextTalent = document.getElementById(lockedTalents[talentId]).querySelector("input");
                    if (parseInt(nextTalent.value) > 0) {
                        event.target.value = previousValue; 
                        return;
                    }
                }
                setAvailablePoints(availablePoints - difference);
            }

            updateProgressBar(event.target.closest(".talent-node"), pointsInvested);
            saveProgress();

            unlockNextTalent(document.getElementById("talent1"), document.getElementById("talent1.1"));
            unlockNextTalent(document.getElementById("talent1.1"), document.getElementById("talent1.2"));
            unlockNextTalent(document.getElementById("talent1.2"), document.getElementById("talent1.3"));
            unlockNextTalent(document.getElementById("talent1.3"), document.getElementById("talent1.4"));
            unlockNextTalent(document.getElementById("talent2"), document.getElementById("talent2.1"));
            unlockNextTalent(document.getElementById("talent2.1"), document.getElementById("talent2.2"));
            unlockNextTalent(document.getElementById("talent2.2"), document.getElementById("talent2.3"));
            unlockNextTalent(document.getElementById("talent2.3"), document.getElementById("talent2.4"));
            unlockNextTalent(document.getElementById("talent3"), document.getElementById("talent3.1"));
            unlockNextTalent(document.getElementById("talent3.1"), document.getElementById("talent3.2"));
            unlockNextTalent(document.getElementById("talent3.2"), document.getElementById("talent3.3"));
            unlockNextTalent(document.getElementById("talent3.3"), document.getElementById("talent3.4"));
            lockLowerTalentsIfHigherHasPoints();

            event.target.setAttribute("data-previous-value", pointsInvested);
        });

        inputElement.setAttribute("data-previous-value", inputElement.value);
    });

    pointsInputElement.addEventListener("change", () => {
        setAvailablePoints(getAvailablePoints());
    });

    loadProgress();
});
