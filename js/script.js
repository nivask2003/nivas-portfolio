/* Nivas Kumar S — Portfolio interactions (vanilla JS) */
(function () {
  "use strict";

  function init() {
    if (window.__portfolioInit) return;
    window.__portfolioInit = true;

    /* AOS */
    if (window.AOS) {
      window.AOS.init({ duration: 800, easing: "ease-out-cubic", once: true, offset: 60 });
    }

    /* Scroll progress + sticky navbar + back to top */
    var navbar = document.querySelector(".navbar-x");
    var progress = document.querySelector(".progress-bar-top");
    var toTop = document.querySelector(".to-top");

    function onScroll() {
      var y = window.scrollY || document.documentElement.scrollTop;
      var h = document.documentElement.scrollHeight - window.innerHeight;
      if (progress) progress.style.width = (h > 0 ? (y / h) * 100 : 0) + "%";
      if (navbar) navbar.classList.toggle("scrolled", y > 30);
      if (toTop) toTop.classList.toggle("show", y > 500);
      highlight(y);
    }

    /* Active nav highlighting */
    var sections = Array.prototype.slice.call(document.querySelectorAll("section[id]"));
    var links = Array.prototype.slice.call(document.querySelectorAll("[data-nav]"));
    function highlight(y) {
      var current = "";
      sections.forEach(function (s) {
        if (y >= s.offsetTop - 140) current = s.id;
      });
      links.forEach(function (a) {
        a.classList.toggle("active", a.getAttribute("href") === "#" + current);
      });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    if (toTop) {
      toTop.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }

    /* Mobile menu */
    var burger = document.querySelector(".hamburger");
    var menu = document.querySelector(".mobile-menu");
    var backdrop = document.querySelector(".menu-backdrop");
    function setMenu(open) {
      if (!burger || !menu) return;
      burger.setAttribute("aria-expanded", String(open));
      menu.classList.toggle("open", open);
      if (backdrop) backdrop.classList.toggle("show", open);
      document.body.style.overflow = open ? "hidden" : "";
    }
    if (burger) burger.addEventListener("click", function () {
      setMenu(burger.getAttribute("aria-expanded") !== "true");
    });
    if (backdrop) backdrop.addEventListener("click", function () { setMenu(false); });
    if (menu) menu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { setMenu(false); });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setMenu(false);
    });

    /* Typing animation */
    var typeEl = document.querySelector("[data-typing]");
    if (typeEl) {
      var words = (typeEl.getAttribute("data-typing") || "").split("|");
      var w = 0, c = 0, deleting = false;
      (function tick() {
        var word = words[w % words.length];
        c += deleting ? -1 : 1;
        typeEl.textContent = word.slice(0, c);
        var delay = deleting ? 45 : 85;
        if (!deleting && c === word.length) { deleting = true; delay = 1700; }
        else if (deleting && c === 0) { deleting = false; w++; delay = 320; }
        setTimeout(tick, delay);
      })();
    }

    /* Animated counters + skill meters via IntersectionObserver */
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        if (el.hasAttribute("data-count")) {
          var target = parseFloat(el.getAttribute("data-count"));
          var suffix = el.getAttribute("data-suffix") || "";
          var start = performance.now();
          (function step(now) {
            var p = Math.min((now - start) / 1400, 1);
            var eased = 1 - Math.pow(1 - p, 3);
            el.textContent = Math.round(target * eased) + suffix;
            if (p < 1) requestAnimationFrame(step);
          })(start);
        }
        if (el.classList.contains("meter-fill")) {
          el.style.width = (el.getAttribute("data-level") || "0") + "%";
        }
        io.unobserve(el);
      });
    }, { threshold: 0.4 });

    document.querySelectorAll("[data-count], .meter-fill").forEach(function (el) { io.observe(el); });

    /* Contact form (EmailJS integration) */
    var EMAILJS_PUBLIC_KEY = "6WcPGlS_8Nq4luIWG";  // Replace with your EmailJS Public Key
    var EMAILJS_SERVICE_ID = "service_rgw8dnb";  // Replace with your EmailJS Service ID
    var EMAILJS_TEMPLATE_ID = "template_a2smxyg";// Replace with your EmailJS Template ID

    if (window.emailjs && EMAILJS_PUBLIC_KEY && EMAILJS_PUBLIC_KEY !== "YOUR_PUBLIC_KEY") {
      try { emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY }); } catch (err) { console.warn(err); }
    }

    var form = document.querySelector(".form-x");
    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var note = form.querySelector(".form-note");
        var name = form.querySelector("#cf-name");
        var email = form.querySelector("#cf-email");
        var subjInput = form.querySelector("#cf-subject");
        var message = form.querySelector("#cf-message");
        var submitBtn = form.querySelector("button[type='submit']");
        var originalBtnText = submitBtn ? submitBtn.innerHTML : "Send message";

        var valid = name.value.trim() && /^\S+@\S+\.\S+$/.test(email.value.trim()) && message.value.trim().length > 4;
        if (!valid) {
          note.textContent = "Please add your name, a valid email and a message.";
          note.className = "form-note err";
          return;
        }

        var nameVal = name.value.trim();
        var emailVal = email.value.trim();
        var subjectVal = (subjInput && subjInput.value.trim()) || ("Portfolio enquiry from " + nameVal);
        var messageVal = message.value.trim();

        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = 'Sending... <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>';
        }
        note.textContent = "Sending your message...";
        note.className = "form-note";

        function fallbackMailto() {
          var subjectEnc = encodeURIComponent(subjectVal);
          var bodyEnc = encodeURIComponent(messageVal + "\n\n— " + nameVal + " (" + emailVal + ")");
          window.location.href = "mailto:nivask457@gmail.com?subject=" + subjectEnc + "&body=" + bodyEnc;
          note.textContent = "Opening your mail app to send to nivask457@gmail.com...";
          note.className = "form-note ok";
          form.reset();
        }

        var isConfigured = window.emailjs && 
          EMAILJS_PUBLIC_KEY !== "YOUR_PUBLIC_KEY" && 
          EMAILJS_SERVICE_ID !== "YOUR_SERVICE_ID" && 
          EMAILJS_TEMPLATE_ID !== "YOUR_TEMPLATE_ID";

        if (isConfigured) {
          var templateParams = {
            from_name: nameVal,
            from_email: emailVal,
            reply_to: emailVal,
            subject: subjectVal,
            message: messageVal,
            to_name: "Nivas Kumar S"
          };

          emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams, EMAILJS_PUBLIC_KEY)
            .then(function () {
              note.textContent = "✓ Thank you! Your message has been sent successfully.";
              note.className = "form-note ok";
              form.reset();
            })
            .catch(function (error) {
              console.error("EmailJS dispatch failed:", error);
              fallbackMailto();
            })
            .finally(function () {
              if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
              }
            });
        } else {
          // If keys are pending configuration in script.js, simulate delay & fallback to mailto: link
          setTimeout(function () {
            fallbackMailto();
            if (submitBtn) {
              submitBtn.disabled = false;
              submitBtn.innerHTML = originalBtnText;
            }
          }, 400);
        }
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
