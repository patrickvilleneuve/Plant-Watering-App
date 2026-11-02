(function () {
  "use strict";

  const storage = {
    get: function (key, fallback) {
      try {
        const saved = localStorage.getItem(key);
        return saved === null ? fallback : JSON.parse(saved);
      } catch (error) {
        return fallback;
      }
    },
    set: function (key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
      }
    }
  };

  let plants = storage.get("frondPlants", STARTER_PLANTS);
  if (!Array.isArray(plants)) plants = STARTER_PLANTS;
  document.title = STARTUP.name;
  document.getElementById("tagline").textContent = STARTUP.tagline;
  document.getElementById("pitch").textContent = STARTUP.pitch;

  const plantList = document.getElementById("plant-list");
  const emptyPlants = document.getElementById("empty-plants");
  const plantFormPanel = document.getElementById("plant-form-panel");
  const plantForm = document.getElementById("plant-form");
  const plantFormDate = plantForm.elements.lastWatered;
  const careSummary = document.getElementById("care-summary");

  function localDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return year + "-" + month + "-" + day;
  }

  function dayDifference(dateString) {
    const today = Date.parse(localDate(new Date()) + "T00:00:00");
    const date = Date.parse(dateString + "T00:00:00");
    return Math.round((today - date) / 86400000);
  }

  function daysUntilWater(plant) {
    return Number(plant.interval) - dayDifference(plant.lastWatered);
  }

  function dueLabel(daysUntil) {
    if (daysUntil < 0) return "Overdue by " + Math.abs(daysUntil) + (Math.abs(daysUntil) === 1 ? " day" : " days");
    if (daysUntil === 0) return "Due today";
    if (daysUntil === 1) return "Due tomorrow";
    return "Due in " + daysUntil + " days";
  }

  function savePlants() {
    storage.set("frondPlants", plants);
  }

  function makePlantCard(plant) {
    const daysUntil = daysUntilWater(plant);
    const urgency = daysUntil <= 0 ? "urgent" : daysUntil <= 2 ? "soon" : "upcoming";
    const card = document.createElement("article");
    card.className = "plant-card";

    const icon = document.createElement("div");
    icon.className = "plant-icon";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = plant.icon || "🌿";

    const details = document.createElement("div");
    details.className = "plant-details";
    const name = document.createElement("h3");
    name.textContent = plant.name;
    const species = document.createElement("p");
    species.className = "plant-species";
    species.textContent = plant.species || "Plant";
    const routine = document.createElement("p");
    routine.className = "plant-routine";
    routine.textContent = "Every " + plant.interval + " days · " + (plant.priority === 3 ? "High need" : plant.priority === 1 ? "Low need" : "Regular need");
    details.append(name, species, routine);

    const status = document.createElement("p");
    status.className = "due-status " + urgency;
    status.textContent = dueLabel(daysUntil);

    const actions = document.createElement("div");
    actions.className = "plant-actions";
    const waterButton = document.createElement("button");
    waterButton.type = "button";
    waterButton.className = "button water-button";
    waterButton.textContent = "Watered";
    waterButton.setAttribute("aria-label", "Mark " + plant.name + " as watered today");
    waterButton.addEventListener("click", function () {
      plant.lastWatered = localDate(new Date());
      savePlants();
      renderPlants();
    });
    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "icon-button remove-button";
    removeButton.textContent = "×";
    removeButton.title = "Remove " + plant.name;
    removeButton.setAttribute("aria-label", "Remove " + plant.name);
    removeButton.addEventListener("click", function () {
      plants = plants.filter(function (item) { return item.id !== plant.id; });
      savePlants();
      renderPlants();
    });
    actions.append(waterButton, removeButton);
    card.append(icon, details, status, actions);
    return card;
  }

  function renderPlants() {
    const orderedPlants = plants.slice().sort(function (first, second) {
      const firstDue = daysUntilWater(first);
      const secondDue = daysUntilWater(second);
      const firstScore = Math.max(0, -firstDue) * 100 + Number(first.priority || 2) * 12 - Math.max(firstDue, 0) * 5;
      const secondScore = Math.max(0, -secondDue) * 100 + Number(second.priority || 2) * 12 - Math.max(secondDue, 0) * 5;
      return secondScore - firstScore;
    });
    plantList.replaceChildren.apply(plantList, orderedPlants.map(makePlantCard));
    emptyPlants.hidden = plants.length > 0;
    const dueCount = plants.filter(function (plant) { return daysUntilWater(plant) <= 0; }).length;
    careSummary.textContent = plants.length === 0
      ? "No plants yet. Add one to start your care list."
      : dueCount === 0
        ? plants.length + (plants.length === 1 ? " plant in your collection. All caught up for now." : " plants in your collection. All caught up for now.")
        : dueCount + (dueCount === 1 ? " plant needs water today." : " plants need water today.") + " Sorted by urgency and watering need.";
  }

  function togglePlantForm(show) {
    plantFormPanel.hidden = !show;
    if (show) plantForm.elements.name.focus();
  }

  document.getElementById("show-plant-form").addEventListener("click", function () { togglePlantForm(true); });
  document.getElementById("empty-add-plant").addEventListener("click", function () { togglePlantForm(true); });
  document.getElementById("hide-plant-form").addEventListener("click", function () { togglePlantForm(false); });
  document.getElementById("cancel-plant-form").addEventListener("click", function () { togglePlantForm(false); });

  plantFormDate.value = localDate(new Date());
  plantForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const formData = new FormData(plantForm);
    plants.push({
      id: "plant-" + Date.now(),
      name: formData.get("name").trim(),
      species: formData.get("species").trim(),
      icon: "🌿",
      interval: Number(formData.get("interval")),
      lastWatered: formData.get("lastWatered"),
      priority: Number(formData.get("priority"))
    });
    savePlants();
    renderPlants();
    plantForm.reset();
    plantForm.elements.interval.value = "7";
    plantFormDate.value = localDate(new Date());
    togglePlantForm(false);
  });

  function showView() {
    const requested = (window.location.hash || "#home").slice(1);
    const views = document.querySelectorAll("[data-view]");
    const exists = Array.prototype.some.call(views, function (view) { return view.id === requested; });
    const current = exists ? requested : "home";
    views.forEach(function (view) { view.hidden = view.id !== current; });
    document.querySelectorAll("nav a").forEach(function (link) {
      if (link.getAttribute("href") === "#" + current) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
    window.scrollTo(0, 0);
  }

  function makeSitterCard(sitter) {
    const card = document.createElement("article");
    card.className = "sitter-card";
    const avatar = document.createElement("div");
    avatar.className = "sitter-avatar";
    avatar.setAttribute("aria-hidden", "true");
    avatar.textContent = sitter.initials;
    const details = document.createElement("div");
    details.className = "sitter-details";
    const name = document.createElement("h3");
    name.textContent = sitter.name;
    const specialty = document.createElement("p");
    specialty.textContent = sitter.specialty;
    const rating = document.createElement("p");
    rating.className = "sitter-rating";
    rating.textContent = sitter.rating + " / 5 · " + sitter.visits + " visits";
    details.append(name, specialty, rating);
    const offer = document.createElement("div");
    offer.className = "sitter-offer";
    const price = document.createElement("strong");
    price.textContent = sitter.price;
    const choose = document.createElement("button");
    choose.type = "button";
    choose.className = "text-button";
    choose.textContent = "Choose sitter";
    choose.addEventListener("click", function () {
      document.getElementById("sitter-choice").value = sitter.id;
      document.getElementById("request-heading").scrollIntoView({ behavior: "smooth", block: "center" });
      document.getElementById("visit-start").focus();
    });
    offer.append(price, choose);
    card.append(avatar, details, offer);
    return card;
  }

  const sitterList = document.getElementById("sitter-list");
  const sitterChoice = document.getElementById("sitter-choice");
  PLANT_SITTERS.forEach(function (sitter) {
    const option = document.createElement("option");
    option.value = sitter.id;
    option.textContent = sitter.name + " · " + sitter.price;
    sitterChoice.append(option);
  });
  sitterList.replaceChildren.apply(sitterList, PLANT_SITTERS.map(makeSitterCard));

  const startDate = document.getElementById("visit-start");
  const endDate = document.getElementById("visit-end");
  const today = localDate(new Date());
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  startDate.min = today;
  endDate.min = today;
  startDate.value = today;
  endDate.value = localDate(tomorrow);
  startDate.addEventListener("change", function () { endDate.min = startDate.value || today; });
  endDate.addEventListener("change", function () { endDate.setCustomValidity(""); });
  document.getElementById("sitter-form").addEventListener("submit", function (event) {
    event.preventDefault();
    const confirmation = document.getElementById("sitter-confirmation");
    if (endDate.value < startDate.value) {
      endDate.setCustomValidity("Choose a last visit on or after the first visit.");
      endDate.reportValidity();
      return;
    }
    endDate.setCustomValidity("");
    const sitter = PLANT_SITTERS.find(function (item) { return item.id === sitterChoice.value; });
    confirmation.textContent = "Demo request prepared for " + sitter.name + " from " + startDate.value + " to " + endDate.value + ". No booking was sent.";
    confirmation.hidden = false;
  });

  window.addEventListener("hashchange", showView);
  renderPlants();
  showView();
})();
