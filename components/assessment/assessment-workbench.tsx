"use client";

import { useMemo, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

type Option = {
  value: string;
  label: string;
  note: string;
};

const stageOptions: Option[] = [
  {
    value: "early",
    label: "Early changes",
    note: "Hairline or crown changes are showing up, but the situation still feels reversible."
  },
  {
    value: "accelerating",
    label: "Accelerating loss",
    note: "You feel like things have clearly sped up and you do not want to wing it."
  },
  {
    value: "advanced",
    label: "Advanced loss",
    note: "You need practical choices, not fantasy, because the loss is already obvious."
  }
];

const goalOptions: Option[] = [
  {
    value: "stabilize",
    label: "Stabilize and stop panic",
    note: "Reduce uncertainty and figure out the least chaotic next move."
  },
  {
    value: "regrow",
    label: "Regrowth and treatment",
    note: "You want the strongest honest treatment path the budget can support."
  },
  {
    value: "appearance",
    label: "Look better fast",
    note: "You care most about confidence, style, grooming, and visible wins."
  }
];

const budgetOptions: Option[] = [
  {
    value: "lean",
    label: "Keep it lean",
    note: "Low-cost actions first. No luxury nonsense."
  },
  {
    value: "balanced",
    label: "Balanced",
    note: "You will spend if the move is justified and useful."
  },
  {
    value: "all-in",
    label: "All-in",
    note: "You are willing to pay for the strongest path and expert guidance."
  }
];

const urgencyOptions: Option[] = [
  {
    value: "low",
    label: "I want clarity",
    note: "You are not in crisis. You want a good plan before acting."
  },
  {
    value: "medium",
    label: "I should move soon",
    note: "You do not want to drift for another couple of months."
  },
  {
    value: "high",
    label: "Fix this now",
    note: "You want a near-term action path because confidence is taking a hit."
  }
];

function getLane({
  stage,
  goal,
  budget,
  urgency
}: {
  stage: string;
  goal: string;
  budget: string;
  urgency: string;
}) {
  if (goal === "appearance") {
    return {
      title: "Style and confidence lane",
      summary:
        "Start with the fastest visible wins. Improve the look now, then decide how much treatment work is still worth doing.",
      checklist: [
        "Pick a haircut and grooming strategy that matches your current density.",
        "Use the research hub only to cut through hype, not to stall action.",
        "Book expert help only if you want a second opinion on treatment."
      ],
      badge: "Fastest relief"
    };
  }

  if (goal === "regrow" && (urgency === "high" || budget === "all-in")) {
    return {
      title: "Treatment sprint lane",
      summary:
        "You need a direct treatment path with expert backup, tight expectations, and fewer random experiments.",
      checklist: [
        "Start with a practical treatment review and product mapping.",
        "Escalate into a consult instead of stitching advice together from internet fragments.",
        "Track progress deliberately so you know what is working."
      ],
      badge: "High support"
    };
  }

  if (stage === "advanced") {
    return {
      title: "Reality-based planning lane",
      summary:
        "The best outcome may be a mixed strategy: appearance improvements first, treatment only where it is still justified.",
      checklist: [
        "Clarify whether your goal is maintenance, presentation, or transplant exploration.",
        "Avoid vague miracle products and force every option to earn its cost.",
        "Use consult support for decisions with real downside."
      ],
      badge: "Most honest"
    };
  }

  return {
    title: "Stabilize and learn lane",
    summary:
      "You are still early enough to make calm, evidence-backed moves without turning this into a full-time hobby.",
    checklist: [
      "Learn the few levers that matter and ignore the rest.",
      "Build a simple starter plan you can actually follow.",
      "Use community stories as proof and context, not as medical advice."
    ],
    badge: "Best starting point"
  };
}

function OptionGroup({
  title,
  options,
  selected,
  onSelect
}: {
  title: string;
  options: Option[];
  selected: string;
  onSelect: (value: string) => void;
}) {
  return (
    <section className="assessment-group grain-card">
      <div>
        <p className="assessment-group-label">{title}</p>
      </div>
      <div className="assessment-option-grid">
        {options.map((option) => {
          const active = option.value === selected;

          return (
            <button
              key={option.value}
              type="button"
              className={`assessment-option${active ? " is-active" : ""}`}
              onClick={() => onSelect(option.value)}
            >
              <strong>{option.label}</strong>
              <span>{option.note}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export function AssessmentWorkbench() {
  const { isSignedIn } = useAuth();
  const [stage, setStage] = useState(stageOptions[1].value);
  const [goal, setGoal] = useState(goalOptions[0].value);
  const [budget, setBudget] = useState(budgetOptions[1].value);
  const [urgency, setUrgency] = useState(urgencyOptions[1].value);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  const lane = useMemo(
    () =>
      getLane({
        stage,
        goal,
        budget,
        urgency
      }),
    [budget, goal, stage, urgency]
  );

  async function handleSave() {
    if (!isSignedIn) {
      setSaveState("error");
      return;
    }

    setSaveState("saving");

    const response = await fetch("/api/assessment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        stage,
        goal,
        budget,
        urgency,
        laneTitle: lane.title,
        laneSummary: lane.summary,
        laneBadge: lane.badge,
        laneChecklist: lane.checklist
      })
    });

    setSaveState(response.ok ? "saved" : "error");
  }

  return (
    <div className="assessment-shell">
      <section className="assessment-hero">
        <div className="assessment-hero-copy">
          <span className="section-label">Assessment</span>
          <h1 className="assessment-title">Build a plan before you buy nonsense.</h1>
          <p className="assessment-copy">
            This is the first pass at the Ugly Manling decision engine. Tell us where you
            are, what you care about, and how hard you want to push. The screen responds
            with a recommended lane and a practical next-step shape.
          </p>
        </div>
        <aside className="assessment-hero-panel grain-card">
          <p className="assessment-panel-label">What this page should do</p>
          <ul className="assessment-panel-list">
            <li>Turn panic into a clear lane.</li>
            <li>Keep treatment, style, and expert access connected.</li>
            <li>Show enough structure to feel useful before full onboarding ships.</li>
          </ul>
        </aside>
      </section>

      <section className="assessment-layout">
        <div className="assessment-controls">
          <OptionGroup
            title="Where are you right now?"
            options={stageOptions}
            selected={stage}
            onSelect={setStage}
          />
          <OptionGroup
            title="What do you want most?"
            options={goalOptions}
            selected={goal}
            onSelect={setGoal}
          />
          <OptionGroup
            title="What kind of budget are we working with?"
            options={budgetOptions}
            selected={budget}
            onSelect={setBudget}
          />
          <OptionGroup
            title="How urgent does this feel?"
            options={urgencyOptions}
            selected={urgency}
            onSelect={setUrgency}
          />
        </div>

        <aside className="assessment-result grain-card">
          <div className="assessment-result-header">
            <span className="eyebrow">Suggested lane</span>
            <span className="assessment-badge">{lane.badge}</span>
          </div>
          <h2>{lane.title}</h2>
          <p>{lane.summary}</p>
          <div className="assessment-checklist">
            {lane.checklist.map((item) => (
              <div key={item} className="assessment-check">
                <span />
                <p>{item}</p>
              </div>
            ))}
          </div>
          <div className="assessment-actions">
            <button
              type="button"
              onClick={() => void handleSave()}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "3rem",
                padding: "0.8rem 1.15rem",
                border: "1px solid var(--primary-deep)",
                borderRadius: "var(--radius-pill)",
                background: "var(--primary)",
                color: "var(--ink-strong)",
                fontSize: "0.94rem",
                fontWeight: 800,
                letterSpacing: "-0.02em",
                cursor: "pointer"
              }}
            >
              {saveState === "saving"
                ? "Saving..."
                : isSignedIn
                  ? "Save assessment"
                  : "Sign in to save"}
            </button>
            <Button href="/consult" variant="secondary">
              Talk it through with an expert
            </Button>
            <Button href="/research" variant="ghost">
              Read the evidence first
            </Button>
            <Button href="/community" variant="ghost">
              See how other men handled it
            </Button>
          </div>
          <p style={{ marginTop: "0.75rem", fontSize: "0.9rem", opacity: 0.8 }}>
            {saveState === "saved" && "Saved to your profile."}
            {saveState === "error" &&
              (isSignedIn ? "Save failed. Recheck Supabase table setup." : "Please sign in first.")}
          </p>
        </aside>
      </section>

      <section className="assessment-notes">
        <div className="grain-card assessment-note-card">
          <span className="eyebrow">How we think</span>
          <h3>No miracle claims. No weird shame spiral.</h3>
          <p>
            The real product is decision quality. Treatments, experts, grooming, and shop
            recommendations should all feel like connected next steps instead of random sales
            surfaces.
          </p>
        </div>
        <div className="grain-card assessment-note-card warm">
          <span className="eyebrow">Next UI step</span>
          <h3>This should turn into saved onboarding.</h3>
          <p>
            The next iteration can persist answers to a profile, generate a proper plan page,
            and attach community proof or research modules to each recommendation.
          </p>
        </div>
      </section>
    </div>
  );
}
