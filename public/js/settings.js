// Hover style
const buttonHover = (() => {
    const buttons = Array.from(document.querySelectorAll(".button"));

    buttons.forEach( (button) => {
        button.addEventListener("mouseenter", () => {
            button.children[0].src = "./img/main-menu-selected.png";
        });

        button.addEventListener("mouseleave", (e) => {
            button.children[0].src = "./img/main-menu-not-selected.png";
        });

        button.addEventListener("click", (e) => {
            e.preventDefault();
        });
    });
})();

// Fetch settings from API
async function fetchSettings() {
    try {
        // Fetch both settings and categories in parallel
        const [settingsResponse, categoryResponse] = await Promise.all([
            fetch('/api/settings'),
            fetch('/api/categories')
        ]);

        // Check for errors in the fetch responses
        if (!settingsResponse.ok || !categoryResponse.ok) {
            throw new Error('Failed to fetch settings or categories');
        }

        // Parse both responses
        const [settingsData, categoryData] = await Promise.all([
            settingsResponse.json(),
            categoryResponse.json()
        ]);

        // Store and render data
        Settings.setSettings(settingsData);
        renderCategories(categoryData);
        SettingsDisplay.setAll(
            settingsData.brojPitanja,
            settingsData.vremeSekunde,
            settingsData.kategorije,
            settingsData.poeni
        );
    } catch (error) {
        console.error('Error:', error.message);
    }
}

fetchSettings();

function renderCategories(categories) {
    const categoriesContainer = document.getElementById('categories-container');

    categories.forEach(category => {
        const row = document.createElement('div');
        row.classList.add('input-row');

        // Background image for input
        const img = document.createElement('img');
        img.src = "/img/input-row.png";
        img.alt = "";
        img.classList.add('input-row__image');
        row.appendChild(img);

        // Text container
        const container = document.createElement('div');
        container.classList.add('input-row__container');

        // Label text
        const label = document.createElement('label');
        label.classList.add('input-row__label');
        label.htmlFor = category.naziv.toLowerCase();
        label.textContent = category.naziv;
        container.appendChild(label);

        // Checkbox
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.classList.add('input--checkbox');
        input.id = category.naziv.toLowerCase();
        input.name = 'kategorija';
        input.value = category.naziv;
        container.appendChild(input);

        row.appendChild(container);
        categoriesContainer.appendChild(row);
    });
}

function validatePoints(points) {
    const values = [points.prvi, points.drugi, points.treci, points.cetvrti].map(value => Number(value));;
    for (let i = 1; i < values.length; i++) {
        if (values[i] >= values[i - 1]) {
            return false;
        }
    }
    return points.netacan <= 0;
}

function validateCategories(categories) {
    return categories.length > 0;
}

// Store settings
const Settings = (() => {
    let settings = "";

    return {
        getSettings: () => settings,
        setSettings: (data) => { settings = data }
    };
})();

// Setting elements and handling settings
const SettingsDisplay = (() => {
    const totalQuestions = document.getElementById("broj-pitanja");
    const time = document.getElementById("vreme-sekunde");
    let categories = []; // Initialize categories as an empty array
    const pointsFirst = document.getElementById("poeni-prvi");
    const pointsSecond = document.getElementById("poeni-drugi");
    const pointsThird = document.getElementById("poeni-treci");
    const pointsFourth = document.getElementById("poeni-cetvrti");
    const pointsWrong = document.getElementById("poeni-netacan");

    // Set field values
    function setTotalQuestions(number) {
        totalQuestions.value = number;
    }

    function setTime(number) {
        time.value = number;
    }

    function setCategories(checked) {
        const categoryCheckboxes = Array.from(document.getElementsByName("kategorija"));
        categories = checked; // Update categories
        
        categoryCheckboxes.forEach(categoryInput => {
            categoryInput.checked = categories.includes(categoryInput.value);
        });
    }

    function setPoints(first, second, third, fourth, wrong) {
        pointsFirst.value = first;
        pointsSecond.value = second;
        pointsThird.value = third;
        pointsFourth.value = fourth;
        pointsWrong.value = wrong;
    }

    function setAll(number, time, checked, points) {
        setTotalQuestions(number);
        setTime(time);
        setCategories(checked);
        setPoints(points.prvi, points.drugi, points.treci, points.cetvrti, points.netacan);
    }

    // Get field values
    function getTotalQuestions() {
        return totalQuestions.value;
    }

    function getTime() {
        return time.value;
    }

    function getCategories() {
        const categoryInputs = Array.from(document.getElementsByName("kategorija"));
        const checkedCategories = categoryInputs.filter(input => input.checked).map(input => input.value);
        return checkedCategories;
    }

    function getPoints() {
        return {
            prvi: pointsFirst.value,
            drugi: pointsSecond.value,
            treci: pointsThird.value,
            cetvrti: pointsFourth.value,
            netacan: pointsWrong.value,
        };
    }

    function getAll() {
        const allSettings = {
            "brojPitanja": getTotalQuestions(),
            "vremeSekunde": getTime(),
            "poeni": {
                "prvi": getPoints().prvi,
                "drugi": getPoints().drugi,
                "treci": getPoints().treci,
                "cetvrti": getPoints().cetvrti,
                "netacan": getPoints().netacan
            },
            "kategorije": getCategories()
        };

        return allSettings;
    }

    return { setAll, getAll, setCategories };
})();

// Save settings functionality
const saveSettings = (() => {
    const saveButton = document.getElementById('save-settings');
    const backButton = document.getElementById('return-button');

    function submitSettings() {
        removeClickEvent();
        saveButton.style.filter = 'grayscale(100%)';
        saveButton.style.cursor = 'default';
        backButton.style.visibility = 'hidden';

        // Validate points
        const settingsToSave = SettingsDisplay.getAll();
        if (!validatePoints(settingsToSave.poeni)) {
            console.error('Error: Points for wrong answer must be less or equal to zero, each next answer point should be less than the previous one');
            alert('Vrednost poena za netacan odgovor mora biti manja ili jednaka nuli, i poeni za svaki sledeci odgovor moraju biti manji od prethodnog.');
            restoreButtonStyle();
            addClickEvent();
            return;
        }

        // Validate categories
        if (!validateCategories(settingsToSave.kategorije)) {
            console.error('Error: At least one category must be checked');
            alert('Morate izabrati barem jednu kategoriju.');
            restoreButtonStyle();
            addClickEvent();
            return;
        }

        // Validate minimal number of questions based on checked categories
        if (settingsToSave.brojPitanja < settingsToSave.kategorije.length) {
            console.error('Error: Minimal number of questions must be equal to the number of checked categories');
            alert('Minimalan broj pitanja mora biti jednak broju izabranih kategorija.');
            restoreButtonStyle();
            addClickEvent();
            return;
        }

        // Save settings via API
        fetch('/api/settings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(settingsToSave)
        })
        .then(response => response.json())
        .then(data => {
            console.log('Settings saved successfully:', data);
        })
        .catch((error) => {
            console.error('Error saving settings:', error);
        })
        .finally(() => {
            restoreButtonStyle();
            addClickEvent();
        });
    }

    function addClickEvent() {
        saveButton.addEventListener("click", submitSettings);
    }

    function removeClickEvent() {
        saveButton.removeEventListener("click", submitSettings);
    }

    function restoreButtonStyle() {
        saveButton.style.filter = 'none';
        saveButton.style.cursor = 'pointer';
        backButton.style.visibility = 'visible';
    }

    // Initial add event listener
    addClickEvent();
})();