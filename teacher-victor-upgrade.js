/*
 * Teacher Victor guided-learning add-on.
 * Load this AFTER the existing main inline application script.
 * Uses existing api(), profile, addMessage(), notice(), and tab controls.
 */
(() => {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const subjects = [
    "Mathematics","English Language","Shona","Biology","Physics","Chemistry",
    "Geography","History","Combined Science","Accounting","Computer Science",
    "Economics","Business Studies","Agriculture","Pure Mathematics",
    "Applied Mathematics","Statistics","Literature in English"
  ];
  let selectedSubject = "";

  function addSplash() {
    if ($("tvSplash")) return;
    const el = document.createElement("div");
    el.id = "tvSplash";
    el.className = "tv-splash";
    el.setAttribute("role","status");
    el.innerHTML = '<div class="tv-splash-inner"><div class="tv-splash-mark">V</div><div class="tv-splash-title">TEACHER VICTOR</div><div class="tv-splash-sub">Your personal ZIMSEC learning teacher</div><div class="tv-splash-loader"><i></i></div></div>';
    document.body.appendChild(el);
    const hide = () => setTimeout(() => el.classList.add("hide"), 850);
    if (document.readyState === "complete") hide();
    else window.addEventListener("load", hide, {once:true});
    setTimeout(hide, 2200); // fail-safe for slow WebViews
  }

  function addGuidedLesson() {
    const form = $("chatForm");
    if (!form || $("tvGuidedLesson")) return;
    const card = document.createElement("section");
    card.id = "tvGuidedLesson";
    card.className = "tv-lesson-box";
    card.innerHTML = `
      <div class="section-title"><h3>What would you like to learn today?</h3><span class="pill">Guided lesson</span></div>
      <p class="muted tiny">Choose a subject, then tell Teacher Victor the exact topic. Your lesson will include a simple explanation, an example and a quick understanding check.</p>
      <div class="tv-subjects" id="tvSubjectButtons"></div>
      <label for="tvTopic">What topic do you want to learn?</label>
      <input id="tvTopic" maxlength="140" placeholder="For example: Newton's laws of motion">
      <div class="actions"><button id="tvStartLesson" type="button" class="primary">Start my lesson</button></div>
      <div id="tvLessonStatus" class="tiny muted" aria-live="polite"></div>`;
    form.parentNode.insertBefore(card, form);
    const buttons = $("tvSubjectButtons");
    subjects.forEach(subject => {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = subject;
      b.addEventListener("click", () => {
        selectedSubject = subject;
        buttons.querySelectorAll("button").forEach(x => x.classList.toggle("selected", x === b));
        $("tvTopic").focus();
      });
      buttons.appendChild(b);
    });
    $("tvStartLesson").addEventListener("click", startLesson);
  }

  async function startLesson() {
    const status = $("tvLessonStatus");
    const btn = $("tvStartLesson");
    const topic = $("tvTopic").value.trim();
    if (!window.profile?.profile?.level) {
      status.textContent = "Please choose and save your level first.";
      return;
    }
    if (!selectedSubject) {
      status.textContent = "Choose a subject first.";
      return;
    }
    if (!topic) {
      status.textContent = "Enter the topic you want to learn.";
      $("tvTopic").focus();
      return;
    }
    btn.disabled = true;
    btn.textContent = "Preparing your lesson…";
    status.textContent = "Teacher Victor is preparing a step-by-step lesson.";
    try {
      if (typeof window.addMessage === "function") {
        window.addMessage("user", `Please teach me ${topic} in ${selectedSubject}.`);
      }
      const result = await window.api("lesson", {subject:selectedSubject, topic});
      if (result.paywall) {
        window.addMessage("assistant", result.message);
        document.querySelector('[data-tab="billing"]')?.click();
      } else {
        window.addMessage("assistant", result.answer + (result.note ? "\n\n" + result.note : ""));
        status.textContent = "Lesson saved. Your homework and review test are in your study plan.";
        await window.loadProgress();
      }
    } catch (err) {
      status.textContent = err?.message || "The lesson could not be loaded. Please try again.";
    } finally {
      btn.disabled = false;
      btn.textContent = "Start my lesson";
    }
  }

  function addStudyPlan() {
    const progressTab = $("tab-progress");
    if (!progressTab || $("tvStudyPlan")) return;
    const section = document.createElement("div");
    section.id = "tvStudyPlan";
    section.className = "tv-lesson-box";
    section.innerHTML = `<div class="section-title"><h3>Your study plan</h3><span class="pill">Learn · Practise · Review</span></div><p class="tiny muted">After a lesson, homework is scheduled for the next day and a review test four days later.</p><div id="tvPlanItems" class="tv-plan"><p class="muted tiny">Complete your first guided lesson to create your plan.</p></div>`;
    const list = $("progressList");
    progressTab.insertBefore(section, list || progressTab.firstChild);
  }

  function renderStudyPlan(activities) {
    const host = $("tvPlanItems");
    if (!host) return;
    const lessons = activities.filter(x => x.kind === "lesson").sort((a,b) => new Date(b.at)-new Date(a.at));
    if (!lessons.length) {
      host.innerHTML = '<p class="muted tiny">Complete your first guided lesson to create your plan.</p>';
      return;
    }
    const lesson = lessons[0];
    const started = new Date(lesson.at);
    const homeworkDue = new Date(started.getTime() + 24*60*60*1000);
    const testDue = new Date(started.getTime() + 4*24*60*60*1000);
    const now = new Date();
    const completed = kind => activities.some(x =>
      x.kind === kind && x.subject === lesson.subject && new Date(x.at) > started
    );
    const subjectText = String(lesson.subject || "Your lesson");
    const safe = s => String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
    const dateText = d => d.toLocaleDateString(undefined,{weekday:"short",day:"numeric",month:"short"});
    const plan = [
      {kind:"assignment", title:"Homework", due:homeworkDue, done:completed("assignment"), description:"Practise the topic you learned."},
      {kind:"mock", title:"Review test", due:testDue, done:completed("mock"), description:"Check what you remember after a few days."}
    ];
    host.innerHTML = plan.map(p => {
      const ready = now >= p.due;
      const state = p.done ? "Completed" : ready ? "Ready to start" : "Available " + dateText(p.due);
      return `<div class="tv-plan-item"><div><strong>${p.title} · ${safe(subjectText)}</strong><p>${state} — ${p.description}</p></div><button class="primary small" data-tv-plan="${p.kind}" ${p.done || !ready ? "disabled" : ""}>${p.done ? "Completed" : ready ? "Start now" : "Not due yet"}</button></div>`;
    }).join("");
    host.querySelectorAll("[data-tv-plan]").forEach(button => {
      button.addEventListener("click", () => launchPlannedWork(button.dataset.tvPlan, lesson));
    });
  }

  function launchPlannedWork(kind, lesson) {
    const split = String(lesson.subject || "").split(" — ");
    const subject = split[0] || "General";
    const topic = split.slice(1).join(" — ") || lesson.topic || "Recent lesson";
    if (kind === "assignment") {
      $("assignmentSubject").value = subject;
      $("assignmentTopic").value = topic;
      document.querySelector('[data-tab="practice"]')?.click();
      $("makeAssignment")?.click();
    } else {
      $("mockSubject").value = subject;
      $("mockTopic").value = topic;
      document.querySelector('[data-tab="mock"]')?.click();
      $("makeMock")?.click();
    }
  }

  function wrapProgressLoader() {
    if (typeof window.loadProgress !== "function" || window.loadProgress.__tvWrapped) return;
    const original = window.loadProgress;
    const wrapped = async function(...args) {
      await original.apply(this,args);
      try {
        const result = await window.api("progress");
        renderStudyPlan(result.activities || []);
      } catch (e) {
        const host = $("tvPlanItems");
        if (host) host.textContent = e?.message || "Could not load your study plan.";
      }
    };
    wrapped.__tvWrapped = true;
    window.loadProgress = wrapped;
  }

  function init() {
    addSplash();
    addGuidedLesson();
    addStudyPlan();
    wrapProgressLoader();
    if (typeof window.loadProgress === "function" && window.profile) window.loadProgress();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded",init,{once:true});
  else init();
})();
