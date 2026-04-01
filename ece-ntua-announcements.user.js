// ==UserScript==
// @name          ece.ntua.gr announcements fix
// @version       0.4
// @description   Highlight new posts using 3 colors and sort them based on date instead of this weird order they are in
// @author        liuminex
// @match         https://www.ece.ntua.gr/el/announcements
// @run-at        document-end
// @grant         none
// ==/UserScript==

function fixthem() {
    'use strict';

    setTimeout(() => {

        // find all elements with tag a and href /el/announcementDetails/*
        const a_els = document.querySelectorAll('a[href^="/el/announcementDetails/"]');

        if (a_els.length === 0) {
            console.log("No announcement links found.");
            return;
        }

        console.log(`Found ${a_els.length} announcement links.`);

        const container = a_els[0].parentElement;

        const today = new Date();
        const yesterday = new Date();
        const yesterday2 = new Date();
        yesterday.setDate(today.getDate() - 1);
        yesterday2.setDate(today.getDate() - 2);

        const formatDate = (dateObj) => {
            const year = dateObj.getFullYear();
            const month = String(dateObj.getMonth() + 1).padStart(2, '0');
            const day = String(dateObj.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        const todayStr = formatDate(today);
        const yesterdayStr = formatDate(yesterday);
        const yesterday2Str = formatDate(yesterday2);

        let announcements = [];

        for (const r of a_els) {

            console.log(r);

            const mainElement = r.children[0];
            if (!mainElement) {
                console.error("Error 1: No main element found");
                alert("Error in userscript");
                return;
            }
            
            const contentElement = mainElement.children[0];
            if (!contentElement) {
                console.error("Error 2: No content element found");
                alert("Error in userscript");
                return;
            }

            console.log("found child of child:", contentElement)

            const pinElement = contentElement.children[0];
            if (!pinElement) {
                console.error("Error 3: No pin element found");
                alert("Error in userscript");
                return;
            }

            const dataElement = contentElement.children[1];
            if (!dataElement) {
                console.error("Error 4: No data element found");
                alert("Error in userscript");
                return;
            }




            // if class of pin element is MuiBox-root css-d72itw there is no pin, if
            // it is MuiBox-root css-apdht there is pin, else is is error

            let pin_status = -1; // error

            if (pinElement.className.includes("css-d72itw")) {
                pin_status = 0; // no pin
            } else if (pinElement.className.includes("css-apdht")) {
                pin_status = 1; // pin
            }


            const titleElement = dataElement.children[1];
            if (!titleElement) {
                console.error("Error 5: No title element found");
                alert("Error in userscript");
                return;
            }

            const dateElement = dataElement.children[0];
            if (!dateElement) {
                console.error("Error 6: No date element found");
                alert("Error in userscript");
                return;
            }

            const TEXT = titleElement.innerText;

            // date in inner text of last child of dataElement, but childs are either 1 or 2
            if (dateElement.children.length === 0) {
                console.error("Error 6.1: No children in date element", dataElement);
                alert("Error in userscript");
                return;
            }

            let lastChild = null;
            if (dateElement.children.length === 1) {
                lastChild = dateElement.children[0];
            }
            else if (dateElement.children.length === 2) {
                lastChild = dateElement.children[1];
            } else {
                console.error("Error 6.2: More than 2 children in date element", dataElement);
                alert("Error in userscript");
                return;
            }

            console.log("found last child of date element:", lastChild);

            const dateText = lastChild.innerText;
            if (!dateText) {
                console.error("Error 8: No date greek element found");
                alert("Error in userscript");
                return;
            }

            console.log("found date element:", dateText);


            const monthsMap = {
                "Ιαν": "01",
                "Φεβ": "02",
                "Μαρ": "03",
                "Απρ": "04",
                "Μαΐ": "05",
                "Ιου": "06",
                "Ιου": "07",
                "Αυγ": "08",
                "Σεπ": "09",
                "Οκτ": "10",
                "Νοε": "11",
                "Δεκ": "12"
            };

            let [day, monthGreek, year] = dateText.split(" ");
            let month = monthsMap[monthGreek];
            day = String(day).padStart(2, '0');

            const formattedDate = `${year}-${month}-${day}`;

            console.log(`Parsed date: ${formattedDate} from "${dateText}"`);

            let color = "white";
            if (formattedDate.startsWith(todayStr)) {
                color = "rgb(152, 251, 152)";
            } else if (formattedDate.startsWith(yesterdayStr)) {
                color = "rgb(255, 218, 185)";
            } else if (formattedDate.startsWith(yesterday2Str)) {
                color = "rgb(255, 255, 153)";
            }

            announcements.push({
                date: formattedDate,
                text: TEXT,
                pinned: pin_status,
                color: color,
                href: r.href
            });
        }

        announcements.sort((a, b) => {
            return new Date(b.date) - new Date(a.date);
        });

        container.innerHTML = "";

        for (const ann of announcements){
            let pintext = ""
            if (ann.pinned === -1){
                pintext = "font-weight: bold; color: red;";
            }
            else if (ann.pinned === 1){
                pintext = "font-weight: bold;";
            }

            const new_html_a = `<a href="${ann.href}"
                style="display: block; padding: 10px; border-bottom: 1px solid #ccc; text-decoration: none; color: inherit;
                    background: ${ann.color}; ${pintext}
                    font-family: Times New Roman, serif;
                    "
                >
            
            <span style="font-size: 0.8em; color: gray; margin-bottom: 5px;">${ann.date}</span>
            <span style="font-size: 1em;">${ann.text}</span>
            
            
            
            </a>`;
            container.innerHTML += new_html_a;
        }

    }, 2000);
}

window.addEventListener('load', fixthem);

