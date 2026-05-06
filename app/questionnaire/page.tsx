'use client';

import Link from 'next/link';
import { useState } from 'react';
import MarketingShell from '@/components/marketing/MarketingShell';

interface Step {
  key: string;
  question: string;
  options: string[];
}

const STEPS: Step[] = [
  {
    key: 'type_chantier',
    question: 'Quel type de chantier voulez-vous lancer ?',
    options: [
      'Rénovation intérieure',
      'Rénovation complète',
      'Extension',
      'Aménagement extérieur',
      'Simple rafraîchissement',
    ],
  },
  {
    key: 'realisation',
    question: 'Comment seront réalisés les travaux ?',
    options: [
      'Je fais tout moi-même',
      'Je fais une partie moi-même',
      'Je fais intervenir un ou plusieurs artisans',
      'Je ne sais pas encore',
    ],
  },
  {
    key: 'pieces',
    question: 'Combien de pièces sont concernées ?',
    options: [
      '1 pièce',
      '2 à 3 pièces',
      '4 à 5 pièces',
      'Toute la maison',
    ],
  },
  {
    key: 'travaux',
    question: 'Quels types de travaux prévoyez-vous ?',
    options: [
      'Électricité',
      'Plomberie',
      'Placo / cloisons',
      'Isolation',
      'Sols',
      'Peinture',
      'Menuiseries',
      'Toiture',
      'Extérieurs',
      'Plusieurs corps de métier',
    ],
  },
  {
    key: 'niveau',
    question: 'Quel est votre niveau ?',
    options: [
      'Débutant total',
      'Bricoleur occasionnel',
      'Bon bricoleur',
      'Je veux surtout contrôler les artisans',
    ],
  },
];

const STEP_LABELS = ['Projet', 'Réalisation', 'Surface', 'Métiers', 'Niveau', 'Recommandation'];

function isComplexProject(answers: Record<string, string>) {
  const isMultiplePieces = ['4 à 5 pièces', 'Toute la maison'].includes(answers.pieces);
  const isMultipleTrades = answers.travaux === 'Plusieurs corps de métier';
  const usesArtisans = ['Je fais intervenir un ou plusieurs artisans', 'Je veux surtout contrôler les artisans'].includes(
    answers.realisation,
  );
  const isFullProject = ['Rénovation complète', 'Extension'].includes(answers.type_chantier);

  return isMultiplePieces || isMultipleTrades || usesArtisans || isFullProject;
}

export default function QuestionnairePage() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const totalSteps = STEPS.length;
  const isResult = step === totalSteps;
  const progress = ((step + (isResult ? 1 : 0)) / (totalSteps + 1)) * 100;

  const current = STEPS[step];
  const currentAnswer = current ? answers[current.key] : null;

  function selectOption(opt: string) {
    if (!current) return;
    setAnswers((a) => ({ ...a, [current.key]: opt }));
  }

  function next() {
    if (step < totalSteps) setStep(step + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function back() {
    if (step > 0) setStep(step - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <MarketingShell>
      <div className="mk-quiz-wrap">
        {/* Progress */}
        <div className="mk-quiz-progress">
          <div className="mk-quiz-progress-bar">
            <div className="mk-quiz-progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <div className="mk-quiz-progress-info">
            <span>
              Étape {Math.min(step + 1, totalSteps + 1)} / {totalSteps + 1}
            </span>
            <span>{STEP_LABELS[Math.min(step, totalSteps)]}</span>
          </div>
        </div>

        {/* Steps 1 to 5 */}
        {!isResult && current && (
          <div className="mk-quiz-step">
            <h1 className="mk-quiz-question">{current.question}</h1>

            <div className="mk-quiz-options" role="radiogroup">
              {current.options.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  role="radio"
                  aria-checked={currentAnswer === opt}
                  className={`mk-quiz-option${currentAnswer === opt ? ' is-selected' : ''}`}
                  onClick={() => selectOption(opt)}
                >
                  <span className="mk-quiz-option-circle" />
                  <span>{opt}</span>
                </button>
              ))}
            </div>

            <div className="mk-quiz-actions">
              <button type="button" className="mk-quiz-back" onClick={back} disabled={step === 0}>
                ← Retour
              </button>
              <button
                type="button"
                className="mk-quiz-next"
                onClick={next}
                disabled={!currentAnswer}
              >
                {step === totalSteps - 1 ? 'Voir ma recommandation →' : 'Suivant →'}
              </button>
            </div>
          </div>
        )}

        {/* Step 6 — Result screen */}
        {isResult && <ResultScreen answers={answers} onBack={back} />}
      </div>
    </MarketingShell>
  );
}

function ResultScreen({ answers, onBack }: { answers: Record<string, string>; onBack: () => void }) {
  const complex = isComplexProject(answers);

  return (
    <div className="mk-quiz-step">
      <div className="mk-quiz-success">
        <div className="mk-quiz-success-icon">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
      </div>

      <h1 className="mk-quiz-question" style={{ textAlign: 'center', marginBottom: 8 }}>
        {complex ? 'L’offre Pro chantier est recommandée' : 'L’offre Gratuit limité peut suffire'}
      </h1>

      <p style={{ textAlign: 'center', color: 'var(--fg-2)', fontSize: 15, lineHeight: 1.6, margin: '0 0 24px', maxWidth: 540, marginInline: 'auto' }}>
        {complex
          ? 'Votre chantier implique plusieurs corps de métier ou artisans. L’offre Pro vous donnera la visibilité nécessaire pour ne rien rater.'
          : 'Votre projet semble accessible. Commencez gratuitement et passez à Pro si vos besoins évoluent.'}
      </p>

      <div className="mk-quiz-recap-card">
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--fg-muted)', marginBottom: 12, fontWeight: 700 }}>
          Récapitulatif de votre projet
        </div>
        {STEPS.map((s, i) => (
          <div key={s.key} className="mk-quiz-recap-row">
            <span className="mk-quiz-recap-q">{STEP_LABELS[i]}</span>
            <span className="mk-quiz-recap-a">{answers[s.key] ?? '—'}</span>
          </div>
        ))}

        <div className="mk-quiz-recap-row" style={{ borderTop: '2px solid var(--border)', marginTop: 8, paddingTop: 16 }}>
          <span className="mk-quiz-recap-q" style={{ color: 'var(--fg)', fontWeight: 700 }}>
            Tarif recommandé
          </span>
          <span className="mk-quiz-recap-a" style={{ color: complex ? 'var(--accent-dark)' : 'var(--fg)' }}>
            {complex ? '39 € — paiement unique, par chantier' : 'Gratuit — sans carte bancaire'}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, marginTop: 24, flexWrap: 'wrap' }}>
        <Link href="/inscription" className="mk-btn mk-btn-outline" style={{ flex: 1, minWidth: 220, padding: '13px 20px', fontSize: 14, justifyContent: 'center' }}>
          Continuer gratuitement
        </Link>
        <Link href="/inscription" className="mk-btn mk-btn-accent" style={{ flex: 1, minWidth: 220, padding: '13px 20px', fontSize: 14, justifyContent: 'center' }}>
          Choisir l&apos;offre Pro — 39 €
        </Link>
      </div>

      <p style={{ textAlign: 'center', color: 'var(--fg-muted)', fontSize: 12, marginTop: 16 }}>
        Vous pouvez toujours changer d&apos;offre après l&apos;inscription.
      </p>

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 12 }}>
        <button type="button" className="mk-quiz-back" onClick={onBack}>
          ← Modifier mes réponses
        </button>
      </div>
    </div>
  );
}
