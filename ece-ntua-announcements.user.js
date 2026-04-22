// ==UserScript==
// @name          ece.ntua.gr announcements fix
// @version       0.5
// @description   Highlight new posts using 3 colors and sort them based on date instead of this weird order they are in
// @author        liuminex
// @match         https://www.ece.ntua.gr/el/announcements
// @run-at        document-end
// @grant         none
// ==/UserScript==

const LEGACY_BADGE_CLASS = 'ece-recent-announcement-badge';
const ANNOUNCEMENT_INDICATOR_COLORS = {
    today: 'rgb(152, 251, 152)',
    yesterday: 'rgb(255, 218, 185)',
    twoDaysAgo: 'rgb(255, 255, 153)',
    default: 'rgb(25, 118, 210)'
};

function normalizeGreekMonth(monthText) {
    return monthText
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
}

function resolveMonthNumber(monthText) {
    const normalizedMonth = normalizeGreekMonth(monthText);

    if (normalizedMonth.startsWith('ιαν')) return '01';
    if (normalizedMonth.startsWith('φεβ')) return '02';
    if (normalizedMonth.startsWith('μαρ')) return '03';
    if (normalizedMonth.startsWith('απρ')) return '04';
    if (normalizedMonth.startsWith('μαι')) return '05';
    if (normalizedMonth.startsWith('ιουν')) return '06';
    if (normalizedMonth.startsWith('ιουλ') || normalizedMonth === 'ιου') return '07';
    if (normalizedMonth.startsWith('αυγ')) return '08';
    if (normalizedMonth.startsWith('σεπ')) return '09';
    if (normalizedMonth.startsWith('οκτ')) return '10';
    if (normalizedMonth.startsWith('νοε')) return '11';
    if (normalizedMonth.startsWith('δεκ')) return '12';

    return null;
}

function removeLegacyBadge(titleElement) {
    const existingBadge = titleElement.querySelector(`.${LEGACY_BADGE_CLASS}`);
    if (existingBadge) {
        existingBadge.remove();
    }
}

function resolveAnnouncementIndicatorColor(formattedDate, todayStr, yesterdayStr, yesterday2Str) {
    if (formattedDate === todayStr) {
        return ANNOUNCEMENT_INDICATOR_COLORS.today;
    }

    if (formattedDate === yesterdayStr) {
        return ANNOUNCEMENT_INDICATOR_COLORS.yesterday;
    }

    if (formattedDate === yesterday2Str) {
        return ANNOUNCEMENT_INDICATOR_COLORS.twoDaysAgo;
    }

    return ANNOUNCEMENT_INDICATOR_COLORS.default;
}

function applyAnnouncementIndicatorColor(pinElement, pinStatus, indicatorColor) {
    if (pinStatus === -1) {
        return;
    }

    pinElement.style.setProperty('color', indicatorColor, 'important');
    pinElement.style.setProperty('background', indicatorColor, 'important');
    pinElement.style.setProperty('background-color', indicatorColor, 'important');
    pinElement.style.setProperty('border-color', indicatorColor, 'important');
    pinElement.style.setProperty('fill', indicatorColor, 'important');

    const iconElement = pinElement.querySelector('svg');
    if (iconElement) {
        iconElement.style.setProperty('color', indicatorColor, 'important');
        iconElement.style.setProperty('fill', indicatorColor, 'important');
    }

    const pathElements = pinElement.querySelectorAll('path');
    for (const pathElement of pathElements) {
        pathElement.style.setProperty('fill', indicatorColor, 'important');
    }
}

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

            removeLegacyBadge(titleElement);

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

            let [day, monthGreek, year] = dateText.split(" ");
            let month = resolveMonthNumber(monthGreek);
            day = String(day).padStart(2, '0');

            if (!month || !year) {
                console.error("Error 9: Unable to parse announcement date", dateText);
                continue;
            }

            const formattedDate = `${year}-${month}-${day}`;
            const indicatorColor = resolveAnnouncementIndicatorColor(formattedDate, todayStr, yesterdayStr, yesterday2Str);

            console.log(`Parsed date: ${formattedDate} from "${dateText}"`);

            announcements.push({
                date: formattedDate,
                text: TEXT,
                pinned: pin_status,
                element: r,
                pinElement: pinElement,
                indicatorColor: indicatorColor
            });
        }

        announcements.sort((a, b) => {
            return new Date(b.date) - new Date(a.date);
        });

        for (const ann of announcements) {
            applyAnnouncementIndicatorColor(ann.pinElement, ann.pinned, ann.indicatorColor);
            container.appendChild(ann.element);
        }

    }, 2000);
}

window.addEventListener('load', fixthem);

