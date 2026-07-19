(() => {
  const header = document.getElementById("header");
  const burger = document.getElementById("burger");
  const mobileNav = document.getElementById("mobileNav");
  const form = document.getElementById("requestForm");
  const formSuccess = document.getElementById("formSuccess");
  const yearEl = document.getElementById("year");

  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* Header: transparent over hero, solid when scrolled */
  function updateHeader() {
    if (!header) return;
    const scrolled = window.scrollY > 24;
    header.classList.toggle("is-scrolled", scrolled);

    if (mobileNav && !mobileNav.hidden) {
      header.classList.add("is-scrolled");
    }
  }

  window.addEventListener("scroll", updateHeader, { passive: true });
  updateHeader();

  /* Mobile menu */
  function closeMobile() {
    if (!mobileNav || !burger) return;
    mobileNav.hidden = true;
    burger.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }

  function openMobile() {
    if (!mobileNav || !burger) return;
    mobileNav.hidden = false;
    burger.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
    header?.classList.add("is-scrolled");
  }

  burger?.addEventListener("click", () => {
    if (!mobileNav) return;
    if (mobileNav.hidden) openMobile();
    else closeMobile();
  });

  mobileNav?.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", closeMobile);
  });

  /* Scroll spy */
  const sections = ["hero", "services", "process", "quiz", "about", "request"]
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  const navLinks = document.querySelectorAll(".nav__link");

  function onScrollSpy() {
    if (!header) return;
    const y = window.scrollY + header.offsetHeight + 40;
    let current = "hero";
    for (const sec of sections) {
      if (sec.offsetTop <= y) current = sec.id;
    }
    navLinks.forEach((link) => {
      const href = link.getAttribute("href") || "";
      link.classList.toggle("is-active", href === `#${current}`);
    });
  }

  window.addEventListener("scroll", onScrollSpy, { passive: true });

  /* Form validation */
  function setError(name, message) {
    const el = form?.querySelector(`[data-error="${name}"]`);
    if (el) el.textContent = message || "";
  }

  function validatePhone(value) {
    return /[\d]{10,}/.test(value.replace(/\D/g, ""));
  }

  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!form) return;

    const data = new FormData(form);
    const name = String(data.get("name") || "").trim();
    const phone = String(data.get("phone") || "").trim();
    const agree = form.querySelector("#agree")?.checked;

    let ok = true;
    setError("name", "");
    setError("phone", "");
    setError("agree", "");

    if (name.length < 2) {
      setError("name", "Укажите имя");
      ok = false;
    }
    if (!validatePhone(phone)) {
      setError("phone", "Введите корректный телефон");
      ok = false;
    }
    if (!agree) {
      setError("agree", "Нужно согласие на обработку данных");
      ok = false;
    }

    if (!ok) return;

    console.info("[PoStroy lead]", Object.fromEntries(data.entries()));

    form.hidden = true;
    const grid = form.closest(".request__grid");
    if (grid) grid.hidden = true;
    if (formSuccess) formSuccess.hidden = false;
  });

  /* ========== Quiz ========== */
  const quizQuestions = [
    {
      id: "goal",
      question: "Что для вас сейчас актуально?",
      options: [
        { value: "buy", label: "Хочу купить недвижимость" },
        { value: "sell", label: "Планирую продать объект" },
        { value: "select", label: "Нужен подбор под мои критерии" },
        { value: "invest", label: "Смотрю на инвестицию" },
      ],
    },
    {
      id: "type",
      question: "Какой формат ближе?",
      options: [
        { value: "apartment", label: "Квартира в городе" },
        { value: "house", label: "Дом / коттедж" },
        { value: "land", label: "Участок под строительство" },
        { value: "country", label: "Загородный дом у природы" },
      ],
    },
    {
      id: "budget",
      question: "Ориентир по бюджету?",
      options: [
        { value: "up10", label: "До 10 млн ₽" },
        { value: "10-25", label: "10–25 млн ₽" },
        { value: "25-50", label: "25–50 млн ₽" },
        { value: "50plus", label: "От 50 млн ₽" },
      ],
    },
    {
      id: "when",
      question: "Когда хотите выйти на сделку?",
      options: [
        { value: "asap", label: "Как можно скорее" },
        { value: "3m", label: "В ближайшие 1–3 месяца" },
        { value: "6m", label: "В течение полугода" },
        { value: "look", label: "Пока только присматриваюсь" },
      ],
    },
  ];

  const budgetLabels = {
    up10: "до 10 млн ₽",
    "10-25": "10–25 млн ₽",
    "25-50": "25–50 млн ₽",
    "50plus": "от 50 млн ₽",
  };

  const typeLabels = {
    apartment: "квартира",
    house: "дом / коттедж",
    land: "участок",
    country: "загородный дом",
  };

  const whenLabels = {
    asap: "срочно",
    "3m": "1–3 месяца",
    "6m": "до 6 месяцев",
    look: "изучаю рынок",
  };

  function buildResult(answers) {
    const goal = answers.goal;
    const type = answers.type;
    const budget = answers.budget;
    const when = answers.when;

    const tags = [
      typeLabels[type] || type,
      budgetLabels[budget] || budget,
      whenLabels[when] || when,
    ];

    if (goal === "sell") {
      return {
        title: "Вам подойдёт продажа с сопровождением",
        text: "Подготовим объект к рынку, оценим стоимость, организуем показы и проведём сделку безопасно — вы контролируете каждый шаг.",
        tags: ["продажа", ...tags.slice(1)],
        interest: "sell",
        message: `Квиз: продажа. Формат: ${typeLabels[type]}. Бюджет/ориентир: ${budgetLabels[budget]}. Срок: ${whenLabels[when]}.`,
      };
    }

    if (goal === "invest") {
      return {
        title: "Профиль: инвестиционный объект",
        text: "Соберём подборку с потенциалом роста и понятной ликвидностью. Учтём локацию, срок окупаемости и риски.",
        tags: ["инвестиции", ...tags],
        interest: "select",
        message: `Квиз: инвестиция. Формат: ${typeLabels[type]}. Бюджет: ${budgetLabels[budget]}. Срок: ${whenLabels[when]}.`,
      };
    }

    if (type === "country" || type === "house") {
      return {
        title: "Вам близки дома с горизонтом",
        text: "Сфокусируемся на домах и коттеджах с видом, воздухом и спокойной локацией — покажем только объекты, которые реально стоят вашего времени.",
        tags,
        interest: goal === "select" ? "select" : "buy",
        message: `Квиз: покупка/подбор. Формат: ${typeLabels[type]}. Бюджет: ${budgetLabels[budget]}. Срок: ${whenLabels[when]}.`,
      };
    }

    if (type === "land") {
      return {
        title: "Участки под ваш сценарий",
        text: "Подберём землю с учётом коммуникаций, подъезда и перспектив застройки. Проверим юридическую чистоту до задатка.",
        tags,
        interest: "select",
        message: `Квиз: участок. Бюджет: ${budgetLabels[budget]}. Срок: ${whenLabels[when]}.`,
      };
    }

    return {
      title: "Городская квартира под ваши критерии",
      text: "Составим shortlist по району, метражу и бюджету. На показах разберём плюсы, минусы и реальную рыночную цену.",
      tags,
      interest: goal === "select" ? "select" : "buy",
      message: `Квиз: квартира. Бюджет: ${budgetLabels[budget]}. Срок: ${whenLabels[when]}.`,
    };
  }

  const quizPanel = document.getElementById("quizPanel");
  const quizProgress = document.getElementById("quizProgress");
  const quizStepLabel = document.getElementById("quizStepLabel");
  const quizBack = document.getElementById("quizBack");
  const quizNext = document.getElementById("quizNext");
  const quizNav = document.getElementById("quizNav");
  const quizResult = document.getElementById("quizResult");
  const quizResultTitle = document.getElementById("quizResultTitle");
  const quizResultText = document.getElementById("quizResultText");
  const quizResultTags = document.getElementById("quizResultTags");
  const quizToForm = document.getElementById("quizToForm");
  const quizRestart = document.getElementById("quizRestart");

  let quizIndex = 0;
  const answers = {};
  let lastResult = null;

  function renderQuestion() {
    if (!quizPanel) return;
    const q = quizQuestions[quizIndex];
    const total = quizQuestions.length;
    const selected = answers[q.id];

    if (quizStepLabel) {
      quizStepLabel.textContent = `Вопрос ${quizIndex + 1} из ${total}`;
      quizStepLabel.hidden = false;
    }
    if (quizProgress) {
      quizProgress.style.width = `${((quizIndex + 1) / total) * 100}%`;
    }
    if (quizBack) quizBack.hidden = quizIndex === 0;
    if (quizNext) {
      quizNext.disabled = !selected;
      quizNext.textContent = quizIndex === total - 1 ? "Узнать результат" : "Далее";
      quizNext.hidden = false;
    }
    if (quizNav) quizNav.hidden = false;
    if (quizResult) quizResult.hidden = true;
    quizPanel.hidden = false;

    quizPanel.innerHTML = `
      <h3 class="quiz__question">${q.question}</h3>
      <div class="quiz__options" role="radiogroup" aria-label="${q.question}">
        ${q.options
          .map(
            (opt) => `
          <button type="button" class="quiz__option${selected === opt.value ? " is-selected" : ""}" data-value="${opt.value}" role="radio" aria-checked="${selected === opt.value}">
            <span class="quiz__option-radio" aria-hidden="true"></span>
            <span>${opt.label}</span>
          </button>`
          )
          .join("")}
      </div>
    `;

    quizPanel.querySelectorAll(".quiz__option").forEach((btn) => {
      btn.addEventListener("click", () => {
        answers[q.id] = btn.getAttribute("data-value");
        renderQuestion();
      });
    });
  }

  function showResult() {
    lastResult = buildResult(answers);
    if (quizPanel) quizPanel.hidden = true;
    if (quizNav) quizNav.hidden = true;
    if (quizStepLabel) quizStepLabel.hidden = true;
    if (quizProgress) quizProgress.style.width = "100%";
    if (quizResult) quizResult.hidden = false;
    if (quizResultTitle) quizResultTitle.textContent = lastResult.title;
    if (quizResultText) quizResultText.textContent = lastResult.text;
    if (quizResultTags) {
      quizResultTags.innerHTML = lastResult.tags.map((t) => `<li>${t}</li>`).join("");
    }
  }

  quizNext?.addEventListener("click", () => {
    const q = quizQuestions[quizIndex];
    if (!answers[q.id]) return;
    if (quizIndex < quizQuestions.length - 1) {
      quizIndex += 1;
      renderQuestion();
    } else {
      showResult();
    }
  });

  quizBack?.addEventListener("click", () => {
    if (quizIndex > 0) {
      quizIndex -= 1;
      renderQuestion();
    }
  });

  quizRestart?.addEventListener("click", () => {
    quizIndex = 0;
    Object.keys(answers).forEach((k) => delete answers[k]);
    lastResult = null;
    renderQuestion();
  });

  quizToForm?.addEventListener("click", () => {
    if (!lastResult) return;
    const interest = document.getElementById("interest");
    const message = document.getElementById("message");
    if (interest) interest.value = lastResult.interest;
    if (message && !message.value.trim()) {
      message.value = lastResult.message;
    } else if (message && lastResult.message) {
      message.value = `${lastResult.message}\n${message.value}`.trim();
    }
  });

  if (quizPanel) renderQuestion();

  /* ========== Scroll reveal ========== */
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function initReveal() {
    if (reduceMotion) return;

    const targets = [];

    document.querySelectorAll(".section__head").forEach((el) => {
      el.classList.add("reveal");
      targets.push(el);
    });

    document.querySelectorAll(".card").forEach((el, i) => {
      el.classList.add("reveal", "reveal--scale", `reveal-d${(i % 4) + 1}`);
      targets.push(el);
    });

    document.querySelectorAll(".step").forEach((el, i) => {
      el.classList.add("reveal", `reveal-d${(i % 4) + 1}`);
      targets.push(el);
    });

    document.querySelectorAll(".quiz").forEach((el) => {
      el.classList.add("reveal", "reveal--scale");
      targets.push(el);
    });

    document.querySelectorAll(".about__text").forEach((el) => {
      el.classList.add("reveal", "reveal--left");
      targets.push(el);
    });

    document.querySelectorAll(".about__panel").forEach((el) => {
      el.classList.add("reveal", "reveal--right", "reveal-d2");
      targets.push(el);
    });

    document.querySelectorAll(".form").forEach((el) => {
      el.classList.add("reveal", "reveal--left");
      targets.push(el);
    });

    document.querySelectorAll(".request__info").forEach((el) => {
      el.classList.add("reveal", "reveal--right", "reveal-d2");
      targets.push(el);
    });

    if (!targets.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        });
      },
      {
        root: null,
        rootMargin: "0px 0px -8% 0px",
        threshold: 0.12,
      }
    );

    targets.forEach((el) => io.observe(el));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initReveal);
  } else {
    initReveal();
  }
})();
