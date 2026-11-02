"use strict";

const API_BASE_URL = "https://rickandmortyapi.com/api/character";
const FALLBACK_IMAGE = "assets/placeholder.svg";

const STATUS_META = {
    alive: { label: "Vivo", className: "alive" },
    dead: { label: "Muerto", className: "dead" },
    unknown: { label: "Desconocido", className: "unknown" }
};

const SPECIES_LABELS = {
    Human: "Humano",
    Alien: "Alienígena",
    Humanoid: "Humanoide",
    Robot: "Robot",
    Animal: "Animal",
    "Mythological Creature": "Criatura mitológica",
    Cronenberg: "Cronenberg",
    Disease: "Enfermedad",
    Poopybutthole: "Poopybutthole",
    unknown: "Desconocida"
};

const GENDER_LABELS = {
    Female: "Femenino",
    Male: "Masculino",
    Genderless: "Sin género",
    unknown: "Desconocido"
};

const VALID_FILTERS = {
    status: ["", "alive", "dead", "unknown"],
    species: ["", "Human", "Alien", "Humanoid", "Robot", "Animal", "Mythological Creature", "unknown"],
    gender: ["", "female", "male", "genderless", "unknown"]
};

const elements = {
    form: document.querySelector("#search-form"),
    nameInput: document.querySelector("#name"),
    statusSelect: document.querySelector("#status"),
    speciesSelect: document.querySelector("#species"),
    genderSelect: document.querySelector("#gender"),
    clearName: document.querySelector("#clear-name"),
    resetFilters: document.querySelector("#reset-filters"),
    emptyReset: document.querySelector("#empty-reset"),
    activeFilters: document.querySelector("#active-filters"),
    results: document.querySelector("#resultados"),
    cardsGrid: document.querySelector("#cards-grid"),
    resultsCount: document.querySelector("#results-count"),
    emptyState: document.querySelector("#empty-state"),
    errorState: document.querySelector("#error-state"),
    errorMessage: document.querySelector("#error-message"),
    retryButton: document.querySelector("#retry-button"),
    pagination: document.querySelector("#pagination"),
    prevPage: document.querySelector("#prev-page"),
    nextPage: document.querySelector("#next-page"),
    pageInfo: document.querySelector("#page-info"),
    statTotal: document.querySelector("#stat-total"),
    statPages: document.querySelector("#stat-pages"),
    dialog: document.querySelector("#character-dialog"),
    dialogContent: document.querySelector("#dialog-content"),
    closeDialog: document.querySelector("#close-dialog")
};

const state = {
    filters: {
        name: "",
        status: "",
        species: "",
        gender: ""
    },
    page: 1,
    pages: 0,
    requestId: 0,
    controller: null
};

const numberFormatter = new Intl.NumberFormat("es-MX");
const dateFormatter = new Intl.DateTimeFormat("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric"
});

function normalizeFilter(value, filterName) {
    const cleanValue = String(value ?? "").trim();
    return VALID_FILTERS[filterName].includes(cleanValue) ? cleanValue : "";
}

function readFiltersFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return {
        name: String(params.get("name") ?? "").trim(),
        status: normalizeFilter(params.get("status"), "status"),
        species: normalizeFilter(params.get("species"), "species"),
        gender: normalizeFilter(params.get("gender"), "gender")
    };
}

function readPageFromUrl() {
    const page = Number.parseInt(new URLSearchParams(window.location.search).get("page") ?? "1", 10);
    return Number.isFinite(page) && page > 0 ? page : 1;
}

function readFiltersFromForm() {
    return {
        name: elements.nameInput.value.trim(),
        status: normalizeFilter(elements.statusSelect.value, "status"),
        species: normalizeFilter(elements.speciesSelect.value, "species"),
        gender: normalizeFilter(elements.genderSelect.value, "gender")
    };
}

function syncFormWithState() {
    elements.nameInput.value = state.filters.name;
    elements.statusSelect.value = state.filters.status;
    elements.speciesSelect.value = state.filters.species;
    elements.genderSelect.value = state.filters.gender;
    updateClearNameButton();
    renderActiveFilters();
}

function hasActiveFilters() {
    return Object.values(state.filters).some(Boolean);
}

function buildApiUrl() {
    const params = new URLSearchParams();
    const { name, status, species, gender } = state.filters;

    if (name) params.set("name", name);
    if (status) params.set("status", status);
    if (species) params.set("species", species);
    if (gender) params.set("gender", gender);
    params.set("page", String(state.page));

    return `${API_BASE_URL}/?${params.toString()}`;
}

function updateUrl(mode = "push") {
    const params = new URLSearchParams();
    const { name, status, species, gender } = state.filters;

    if (name) params.set("name", name);
    if (status) params.set("status", status);
    if (species) params.set("species", species);
    if (gender) params.set("gender", gender);
    if (state.page > 1) params.set("page", String(state.page));

    try {
        const url = new URL(window.location.href);
        url.search = params.toString();
        window.history[mode === "replace" ? "replaceState" : "pushState"]({}, "", url);
    } catch (error) {
        console.warn("No fue posible actualizar la URL.", error);
    }
}

function getStatusMeta(status) {
    return STATUS_META[String(status).toLowerCase()] ?? STATUS_META.unknown;
}

function getSpeciesLabel(species) {
    return SPECIES_LABELS[species] ?? String(species || "Desconocida");
}

function getGenderLabel(gender) {
    return GENDER_LABELS[gender] ?? String(gender || "Desconocido");
}

function createElement(tagName, className, text) {
    const element = document.createElement(tagName);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
}

function createSvgIcon(pathData, viewBox = "0 0 20 20") {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", viewBox);
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", pathData);
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", "currentColor");
    path.setAttribute("stroke-width", "1.8");
    path.setAttribute("stroke-linecap", "round");
    path.setAttribute("stroke-linejoin", "round");
    svg.append(path);

    return svg;
}

function updateClearNameButton() {
    elements.clearName.hidden = elements.nameInput.value.length === 0;
}

function renderActiveFilters() {
    elements.activeFilters.replaceChildren();

    if (!hasActiveFilters()) {
        elements.activeFilters.textContent = "Mostrando todos los personajes.";
        return;
    }

    const label = createElement("span", "", "Filtros activos:");
    elements.activeFilters.append(label);

    const { name, status, species, gender } = state.filters;

    if (name) {
        elements.activeFilters.append(createElement("span", "filter-chip", `Nombre: “${name}”`));
    }
    if (status) {
        elements.activeFilters.append(createElement("span", "filter-chip", `Estado: ${getStatusMeta(status).label}`));
    }
    if (species) {
        elements.activeFilters.append(createElement("span", "filter-chip", `Especie: ${getSpeciesLabel(species)}`));
    }
    if (gender) {
        elements.activeFilters.append(createElement("span", "filter-chip", `Género: ${getGenderLabel(gender)}`));
    }
}

function setStats(total, pages) {
    elements.statTotal.textContent = total === null ? "—" : numberFormatter.format(total);
    elements.statPages.textContent = pages === null ? "—" : numberFormatter.format(pages);
}

function clearMessages() {
    elements.emptyState.hidden = true;
    elements.errorState.hidden = true;
}

function showLoading() {
    clearMessages();
    elements.cardsGrid.hidden = false;
    elements.cardsGrid.setAttribute("aria-busy", "true");
    elements.cardsGrid.replaceChildren();
    elements.resultsCount.textContent = "Consultando la API…";
    elements.pagination.hidden = true;

    const fragment = document.createDocumentFragment();
    for (let index = 0; index < 8; index += 1) {
        fragment.append(createSkeletonCard());
    }
    elements.cardsGrid.append(fragment);
}

function createSkeletonCard() {
    const card = createElement("div", "skeleton-card");
    card.setAttribute("aria-hidden", "true");
    card.innerHTML = `
        <div class="skeleton skeleton--media"></div>
        <div class="skeleton-card__body">
            <div class="skeleton skeleton--line skeleton--short"></div>
            <div class="skeleton skeleton--line skeleton--title"></div>
            <div class="skeleton skeleton--line"></div>
            <div class="skeleton skeleton--line skeleton--short"></div>
            <div class="skeleton skeleton--button"></div>
        </div>
    `;
    return card;
}

function createCharacterCard(character, index) {
    const card = createElement("article", "character-card");
    card.style.setProperty("--delay", `${Math.min(index, 8) * 45}ms`);

    const media = createElement("div", "character-card__media");
    const image = createElement("img");
    image.src = character.image || FALLBACK_IMAGE;
    image.alt = `Retrato de ${character.name}`;
    image.width = 300;
    image.height = 300;
    image.loading = index < 4 ? "eager" : "lazy";
    image.decoding = "async";
    image.referrerPolicy = "no-referrer";
    image.addEventListener("error", () => {
        if (!image.src.endsWith(FALLBACK_IMAGE)) {
            image.src = FALLBACK_IMAGE;
        }
    }, { once: true });

    const statusMeta = getStatusMeta(character.status);
    const statusPill = createElement("span", `status-pill status-pill--${statusMeta.className}`, statusMeta.label);
    statusPill.classList.add("character-card__status");
    media.append(image, statusPill);

    const body = createElement("div", "character-card__body");
    body.append(
        createElement("p", "character-card__species", getSpeciesLabel(character.species)),
        createElement("h3", "", character.name)
    );

    const meta = createElement("dl", "character-card__meta");
    meta.append(
        createMetaRow("Origen", character.origin?.name || "Desconocido"),
        createMetaRow("Ubicación", character.location?.name || "Desconocida"),
        createMetaRow("Episodios", numberFormatter.format(character.episode?.length ?? 0))
    );

    const action = createElement("button", "character-card__action");
    action.type = "button";
    action.setAttribute("aria-label", `Ver la ficha de ${character.name}`);
    action.append(
        createElement("span", "", "Ver ficha"),
        createSvgIcon("M4 10h11M11 5l5 5-5 5")
    );
    action.addEventListener("click", () => openCharacterDialog(character));

    body.append(meta, action);
    card.append(media, body);

    return card;
}

function createMetaRow(label, value) {
    const row = document.createElement("div");
    row.append(
        createElement("dt", "", label),
        createElement("dd", "", value)
    );
    row.lastElementChild.title = value;
    return row;
}

function renderCharacters(data) {
    const { results, info } = data;
    const fragment = document.createDocumentFragment();

    results.forEach((character, index) => {
        fragment.append(createCharacterCard(character, index));
    });

    elements.cardsGrid.replaceChildren(fragment);
    elements.cardsGrid.hidden = false;
    elements.cardsGrid.setAttribute("aria-busy", "false");
    clearMessages();

    const total = info.count ?? results.length;
    state.pages = info.pages ?? 1;

    elements.resultsCount.textContent = total === 1
        ? "1 personaje encontrado"
        : `${numberFormatter.format(total)} personajes encontrados`;

    setStats(total, state.pages);
    elements.pageInfo.textContent = `Página ${numberFormatter.format(state.page)} de ${numberFormatter.format(state.pages)}`;
    elements.prevPage.disabled = !info.prev;
    elements.nextPage.disabled = !info.next;
    elements.pagination.hidden = state.pages <= 1;
    renderActiveFilters();
}

function showEmptyState() {
    state.pages = 0;
    elements.cardsGrid.replaceChildren();
    elements.cardsGrid.hidden = true;
    elements.cardsGrid.setAttribute("aria-busy", "false");
    elements.pagination.hidden = true;
    elements.errorState.hidden = true;
    elements.emptyState.hidden = false;
    elements.resultsCount.textContent = "0 personajes encontrados";
    setStats(0, 0);
    renderActiveFilters();
}

function showErrorState(error) {
    state.pages = 0;
    elements.cardsGrid.replaceChildren();
    elements.cardsGrid.hidden = true;
    elements.cardsGrid.setAttribute("aria-busy", "false");
    elements.pagination.hidden = true;
    elements.emptyState.hidden = true;

    let message = "Ocurrió un problema inesperado. Intenta de nuevo en unos momentos.";

    if (error?.status === 429) {
        message = "Se alcanzó temporalmente el límite de consultas del servicio. Espera un momento y vuelve a intentarlo.";
    } else if (error?.status >= 500) {
        message = `El servicio externo respondió con un error (código ${error.status}). Intenta de nuevo en unos minutos.`;
    } else if (error instanceof TypeError) {
        message = "No se pudo conectar con el servicio. Revisa tu conexión a internet y vuelve a intentarlo.";
    } else if (error?.status) {
        message = `La consulta no pudo completarse (código ${error.status}). Ajusta los filtros e inténtalo de nuevo.`;
    }

    elements.errorMessage.textContent = message;
    elements.errorState.hidden = false;
    elements.resultsCount.textContent = "Información no disponible";
    setStats(null, null);
    renderActiveFilters();
}

async function loadCharacters({ updateHistory = false, scroll = false } = {}) {
    if (state.controller) state.controller.abort();

    const controller = new AbortController();
    const requestId = state.requestId + 1;
    state.requestId = requestId;
    state.controller = controller;

    if (updateHistory) updateUrl("push");
    showLoading();

    if (scroll) scrollToResults();

    try {
        const response = await fetch(buildApiUrl(), {
            signal: controller.signal,
            headers: { Accept: "application/json" }
        });

        if (requestId !== state.requestId) return;

        if (response.status === 404) {
            showEmptyState();
            return;
        }

        if (!response.ok) {
            const error = new Error(`Error HTTP ${response.status}`);
            error.status = response.status;
            throw error;
        }

        const data = await response.json();

        if (!Array.isArray(data.results) || !data.info) {
            throw new Error("La respuesta del servicio no tiene el formato esperado.");
        }

        if (requestId === state.requestId) {
            renderCharacters(data);
        }
    } catch (error) {
        if (error.name === "AbortError") return;
        if (requestId === state.requestId) {
            console.error("Error al consultar la API:", error);
            showErrorState(error);
        }
    } finally {
        if (requestId === state.requestId) {
            state.controller = null;
        }
    }
}

function scrollToResults() {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const top = elements.results.getBoundingClientRect().top + window.scrollY - 90;
    window.scrollTo({ top, behavior: reduceMotion ? "auto" : "smooth" });
}

function openCharacterDialog(character) {
    const { name, status, species, type, gender, origin, location, image, episode, created, url } = character;
    const statusMeta = getStatusMeta(status);

    const layout = createElement("div", "dialog__layout");

    const media = createElement("div", "dialog__media");
    const imageElement = createElement("img");
    imageElement.src = image || FALLBACK_IMAGE;
    imageElement.alt = `Retrato de ${name}`;
    imageElement.referrerPolicy = "no-referrer";
    imageElement.addEventListener("error", () => {
        if (!imageElement.src.endsWith(FALLBACK_IMAGE)) {
            imageElement.src = FALLBACK_IMAGE;
        }
    }, { once: true });
    media.append(imageElement);

    const body = createElement("div", "dialog__body");
    body.append(createElement("p", "dialog__eyebrow", "Ficha del personaje"));

    const title = createElement("h2", "dialog__title", name);
    title.id = "dialog-title";
    body.append(title);

    const tags = createElement("div", "dialog__tags");
    const statusTag = createElement("span", `status-pill status-pill--${statusMeta.className}`, statusMeta.label);
    tags.append(
        statusTag,
        createElement("span", "dialog__tag", getSpeciesLabel(species)),
        createElement("span", "dialog__tag", getGenderLabel(gender))
    );
    body.append(tags);

    const details = createElement("dl", "detail-grid");
    details.append(
        createDetailItem("Especie", getSpeciesLabel(species)),
        createDetailItem("Tipo", type || "No especificado"),
        createDetailItem("Género", getGenderLabel(gender)),
        createDetailItem("Origen", origin?.name || "Desconocido"),
        createDetailItem("Última ubicación", location?.name || "Desconocida"),
        createDetailItem("Episodios", numberFormatter.format(episode?.length ?? 0)),
        createDetailItem("Estado", statusMeta.label),
        createDetailItem("Registrado", formatDate(created))
    );
    body.append(details);

    const apiLink = createElement("a", "dialog__link", "Ver registro original en la API");
    apiLink.href = url;
    apiLink.target = "_blank";
    apiLink.rel = "noopener noreferrer";
    apiLink.append(createSvgIcon("M5 3h8v8M13 3 6.5 9.5M11 8v5H3V5h5", "0 0 16 16"));
    body.append(apiLink);

    layout.append(media, body);
    elements.dialogContent.replaceChildren(layout);
    document.body.classList.add("dialog-open");
    elements.dialog.showModal();
}

function createDetailItem(label, value) {
    const item = document.createElement("div");
    item.append(
        createElement("dt", "", label),
        createElement("dd", "", value)
    );
    return item;
}

function formatDate(value) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "Desconocida" : dateFormatter.format(date);
}

function resetFilters() {
    state.filters = { name: "", status: "", species: "", gender: "" };
    state.page = 1;
    elements.form.reset();
    syncFormWithState();
    loadCharacters({ updateHistory: true, scroll: true });
}

function changePage(page) {
    if (page < 1 || (state.pages > 0 && page > state.pages)) return;
    state.page = page;
    loadCharacters({ updateHistory: true, scroll: true });
}

function bindEvents() {
    elements.form.addEventListener("submit", (event) => {
        event.preventDefault();
        state.filters = readFiltersFromForm();
        state.page = 1;
        renderActiveFilters();
        loadCharacters({ updateHistory: true, scroll: true });
    });

    elements.nameInput.addEventListener("input", updateClearNameButton);

    elements.clearName.addEventListener("click", () => {
        elements.nameInput.value = "";
        updateClearNameButton();
        elements.nameInput.focus();
    });

    elements.resetFilters.addEventListener("click", resetFilters);
    elements.emptyReset.addEventListener("click", resetFilters);
    elements.retryButton.addEventListener("click", () => loadCharacters());

    elements.prevPage.addEventListener("click", () => changePage(state.page - 1));
    elements.nextPage.addEventListener("click", () => changePage(state.page + 1));

    elements.closeDialog.addEventListener("click", () => elements.dialog.close());

    elements.dialog.addEventListener("click", (event) => {
        if (event.target === elements.dialog) elements.dialog.close();
    });

    elements.dialog.addEventListener("close", () => {
        document.body.classList.remove("dialog-open");
        elements.dialogContent.replaceChildren();
    });

    window.addEventListener("popstate", () => {
        state.filters = readFiltersFromUrl();
        state.page = readPageFromUrl();
        syncFormWithState();
        loadCharacters();
    });
}

function init() {
    state.filters = readFiltersFromUrl();
    state.page = readPageFromUrl();
    syncFormWithState();
    bindEvents();
    loadCharacters({ updateHistory: false });
}

init();
