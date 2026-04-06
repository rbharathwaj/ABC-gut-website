import { useState, useRef, useCallback } from 'react'
import { Link, useParams, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getReport } from '../data/db'
import ChatBot from '../components/ChatBot'
import TooltipHeading from '../components/TooltipHeading'
import styles from './ReportViewerPage.module.css'

// ── Section definitions for tooltips ────────────────────────
const DEFINITIONS = {
  gutWellness: {
    title: 'Gut Wellness Score',
    definition: 'A composite score (0–100) that integrates four equally-weighted pillars: probiotic bacteria abundance, commensal balance, pathobiont control, and functional capacity (SCFAs and neurotransmitter pathways). It gives you a single number to track your gut health over time.',
    gutlyPrompt: 'Can you explain my Gut Wellness Score of 78 and what it means for my health?',
  },
  phylumProfile: {
    title: 'Phylum & Genera Profile',
    definition: 'Phyla are the broadest categories of bacteria — like Firmicutes and Bacteroidetes. Genera are more specific groups within each phylum — like Lactobacillus or Bifidobacterium. This section shows the relative abundance of each bacterial group in your gut microbiome.',
    gutlyPrompt: 'What does my Phylum & Genera Profile tell me about my gut health, and what should I focus on?',
  },
  probioticGenera: {
    title: 'Key Probiotic Genera',
    definition: 'Probiotic genera are beneficial bacterial groups that play specific roles in your health — from producing butyrate and protecting your gut lining, to supporting your immune system and mood. Their relative abundance indicates how robust your microbial defenses are.',
    gutlyPrompt: 'Can you explain my probiotic bacteria levels, particularly my Bifidobacterium being below target?',
  },
  scfa: {
    title: 'Short-Chain Fatty Acids (SCFAs)',
    definition: 'SCFAs — butyrate, propionate, and acetate — are compounds produced when your gut bacteria ferment dietary fiber. Butyrate is the primary fuel for your colon cells and is critical for gut barrier integrity, inflammation control, and immune regulation. Low butyrate is a major risk factor for gut disease.',
    gutlyPrompt: 'My butyrate is critically low at 1.1 μmol/g. What can I do to raise it, and what are the risks?',
  },
  functionalMarkers: {
    title: 'Additional Functional Markers',
    definition: 'Beyond SCFAs, your gut produces neurotransmitters and enzymes that affect your whole body. The serotonin pathway influences mood (90% of serotonin is made in the gut). GABA affects anxiety and sleep. β-Glucuronidase controls estrogen recirculation. Bile acid ratios affect fat digestion.',
    gutlyPrompt: 'What do my serotonin and GABA pathway levels mean for my mood and mental health?',
  },
  diseaseRisk: {
    title: 'Disease Risk Associations',
    definition: 'These panels use your microbiome composition to estimate relative risk across six health domains. They are based on population-level research linking specific microbial patterns to disease outcomes — not personal diagnoses. Always discuss findings with a qualified clinician.',
    gutlyPrompt: 'Can you walk me through my disease risk panels and what I should pay attention to?',
  },
  recommendations: {
    title: 'Personalized Recommendations',
    definition: 'Your action plan is generated from your specific microbiome profile. Each recommendation targets a measurable deficit — ranked by clinical priority. The goal is to give you specific, actionable steps (foods, supplements, doses) rather than generic advice.',
    gutlyPrompt: 'What is the most important recommendation for me to start with, and why?',
  },
}

// ── Mini bar component ───────────────────────────────────────
function Bar({ label, pct, color, refText, warn }) {
  return (
    <div className={styles.barRow}>
      <div className={styles.barTop}>
        <span className={styles.barName}>{label}</span>
        <span className={`${styles.barPct} ${warn ? styles.barWarn : ''}`}>
          {pct}% <span className={styles.barRef}>{refText}</span>
        </span>
      </div>
      <div className={styles.barTrack}>
        <div className={styles.barFill} style={{ width: `${Math.min(pct * 2, 100)}%`, background: color }} />
      </div>
    </div>
  )
}

// ── Score ring ───────────────────────────────────────────────
function ScoreRing({ score }) {
  const r = 52
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - score / 100)
  return (
    <div className={styles.ring}>
      <svg width="130" height="130" viewBox="0 0 130 130">
        <circle cx="65" cy="65" r={r} fill="none" stroke="#e8f2e4" strokeWidth="8" />
        <circle cx="65" cy="65" r={r} fill="none" stroke="#4a9e3f" strokeWidth="8"
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round" transform="rotate(-90 65 65)" />
      </svg>
      <div className={styles.ringInner}>
        <span className={styles.ringNum}>{score}</span>
        <span className={styles.ringDenom}>/ 100</span>
      </div>
    </div>
  )
}

// ── Main page ────────────────────────────────────────────────
export default function ReportViewerPage() {
  const { reportId } = useParams()
  const { user } = useAuth()
  const report = getReport(reportId)
  const gutlyPanelRef = useRef(null)

  // triggerMessage: { text, id } — id changes each time to force re-send
  const [triggerMessage, setTriggerMessage] = useState(null)
  const triggerCounter = useRef(0)

  const handleAskGutly = useCallback((question) => {
    triggerCounter.current += 1
    setTriggerMessage({ text: question, id: triggerCounter.current })
    gutlyPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  if (!report) return <Navigate to="/dashboard" replace />

  function handleDownload() {
    const a = document.createElement('a')
    a.href = report.file
    a.download = `ABC-Gut-Report-${report.sampleId}.html`
    a.click()
  }

  return (
    <div className={styles.page}>

      {/* ── Top bar ── */}
      <div className={styles.topBar}>
        <div className={styles.topBarLeft}>
          <Link to="/dashboard" className={styles.back}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Dashboard
          </Link>
          <div className={styles.topBarTitle}>
            <span className={styles.topBarName}>{report.title}</span>
            <span className={styles.topBarMeta}>
              Sample {report.sampleId} · Collected {report.collectionDate} · Issued {report.reportDate}
            </span>
          </div>
        </div>
        <button className={styles.downloadBtn} onClick={handleDownload}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Download Report
        </button>
      </div>

      <div className={styles.body}>

        {/* ── Report content ── */}
        <div className={styles.reportContent}>

          {/* Section 01 — Gut Wellness Score */}
          <div className={styles.section}>
            <div className={styles.sectionLabel}>01 · Overall Health</div>
            <TooltipHeading
              as="h2"
              title={DEFINITIONS.gutWellness.title}
              definition={DEFINITIONS.gutWellness.definition}
              gutlyPrompt={DEFINITIONS.gutWellness.gutlyPrompt}
              onAskGutly={handleAskGutly}
              className={styles.sectionTitle}
            />
            <div className={styles.scoreHero}>
              <ScoreRing score={report.score} />
              <div className={styles.scoreDesc}>
                <div className={styles.scoreStatus}>Good — Room for Optimization</div>
                <p className={styles.scoreNote}>
                  Your gut microbiome shows strong diversity and resilient ecosystem markers.
                  Three targeted interventions can bring you to an optimal profile within 8–12 weeks.
                </p>
              </div>
            </div>
            <div className={styles.metricsGrid}>
              {[
                { label: 'Shannon Diversity', value: '6.12', badge: 'Optimal', ref: 'Ref: 5.62–6.42' },
                { label: 'Bacterial Richness', value: '243 spp', badge: 'Normal', ref: 'Ref: 202–320 spp' },
                { label: 'F/B Ratio', value: '1.3', badge: 'Optimal', ref: 'Ref: 0.9–2.0' },
              ].map(m => (
                <div key={m.label} className={styles.metricCard}>
                  <div className={styles.metricLabel}>{m.label}</div>
                  <div className={styles.metricValue}>{m.value}</div>
                  <span className={styles.badge}>{m.badge}</span>
                  <div className={styles.metricRef}>{m.ref}</div>
                </div>
              ))}
            </div>
            <div className={styles.findingsGrid}>
              <div className={`${styles.findingsCard} ${styles.positive}`}>
                <div className={styles.findingsTitle}>Strengths</div>
                {['High Shannon diversity (6.12) — robust, resilient ecosystem',
                  'Akkermansia muciniphila at excellent levels (25.5%)',
                  'Faecalibacterium prausnitzii within healthy range (11.8%)',
                  'Balanced Firmicutes/Bacteroidetes ratio (1.3)',
                ].map(f => (
                  <div key={f} className={styles.findingItem}>
                    <div className={`${styles.findingDot} ${styles.dotGreen}`} />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
              <div className={`${styles.findingsCard} ${styles.improve}`}>
                <div className={styles.findingsTitle}>Areas to Address</div>
                {['Elevated Proteobacteria 6.1% (target <5%) — mild inflammation signal',
                  'Low Bifidobacterium 6.1% (target >10%) — immune support gap',
                  'Critically low butyrate 1.1 μmol/g (target >5.1) — colonocyte fuel deficiency',
                  'Desulfovibrio at 21.4% (target <20%) — elevated H₂S producer',
                ].map(f => (
                  <div key={f} className={styles.findingItem}>
                    <div className={`${styles.findingDot} ${styles.dotWarn}`} />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section 02 — Microbiome Composition */}
          <div className={styles.section}>
            <div className={styles.sectionLabel}>02 · Microbiome Composition</div>
            <TooltipHeading
              as="h2"
              title={DEFINITIONS.phylumProfile.title}
              definition={DEFINITIONS.phylumProfile.definition}
              gutlyPrompt={DEFINITIONS.phylumProfile.gutlyPrompt}
              onAskGutly={handleAskGutly}
              className={styles.sectionTitle}
            />
            <div className={styles.barRows}>
              <Bar label="Firmicutes"      pct={48.5} color="#4a9e3f" refText="Ref 40–60%" />
              <Bar label="Bacteroidetes"   pct={36.7} color="#62b558" refText="Ref 20–40%" />
              <Bar label="Actinobacteria"  pct={4.8}  color="#7eca73" refText="Ref 3–10%" />
              <Bar label="Proteobacteria"  pct={6.1}  color="#d4a020" refText="Target <5% ↑" warn />
              <Bar label="Verrucomicrobia" pct={2.3}  color="#9ed897" refText="Ref 1–5%" />
            </div>

            <TooltipHeading
              as="h3"
              title={DEFINITIONS.probioticGenera.title}
              definition={DEFINITIONS.probioticGenera.definition}
              gutlyPrompt={DEFINITIONS.probioticGenera.gutlyPrompt}
              onAskGutly={handleAskGutly}
              className={styles.subsectionTitle}
            />
            <div className={styles.barRows}>
              <Bar label="Akkermansia muciniphila"   pct={25.5} color="#4a9e3f" refText="Excellent (Ref 0.02–3%)" />
              <Bar label="Roseburia"                 pct={23.0} color="#62b558" refText="Excellent (Ref >10%)" />
              <Bar label="Faecalibacterium prausnitzii" pct={11.8} color="#7eca73" refText="Normal (Ref 10–15%)" />
              <Bar label="Lactobacillus"             pct={11.5} color="#7eca73" refText="Normal (Ref >10%)" />
              <Bar label="Bifidobacterium"           pct={6.1}  color="#d4a020" refText="Below target (Ref >10%) ↑" warn />
            </div>

            <div className={styles.alertBox}>
              <div className={styles.alertTitle}>Pathogen Screen — All Clear</div>
              <div className={styles.alertBody}>
                Clostridium difficile · Salmonella spp. · Campylobacter spp. — all not detected.
                Comprehensive multiplex screening completed for bacterial, parasitic, fungal, and viral targets.
              </div>
            </div>
          </div>

          {/* Section 03 — SCFAs */}
          <div className={styles.section}>
            <div className={styles.sectionLabel}>03 · Functional Analysis</div>
            <TooltipHeading
              as="h2"
              title={DEFINITIONS.scfa.title}
              definition={DEFINITIONS.scfa.definition}
              gutlyPrompt={DEFINITIONS.scfa.gutlyPrompt}
              onAskGutly={handleAskGutly}
              className={styles.sectionTitle}
            />
            <div className={styles.scfaGrid}>
              <div className={`${styles.scfaCard} ${styles.scfaCritical}`}>
                <div className={styles.scfaName}>Butyrate</div>
                <div className={styles.scfaNum}>1.1</div>
                <div className={styles.scfaUnit}>μmol/g</div>
                <div className={styles.scfaTarget}>Target &gt;5.1 μmol/g</div>
                <div className={styles.scfaAlert}>Critical — far below target</div>
              </div>
              <div className={`${styles.scfaCard} ${styles.scfaGood}`}>
                <div className={styles.scfaName}>Propionate</div>
                <div className={styles.scfaNum}>24.4</div>
                <div className={styles.scfaUnit}>%</div>
                <div className={styles.scfaTarget}>Target &gt;12%</div>
                <div className={styles.scfaOk}>Above target</div>
              </div>
              <div className={`${styles.scfaCard} ${styles.scfaGood}`}>
                <div className={styles.scfaName}>Acetate</div>
                <div className={styles.scfaNum}>71.7</div>
                <div className={styles.scfaUnit}>%</div>
                <div className={styles.scfaTarget}>Target &gt;25%</div>
                <div className={styles.scfaOk}>Above target</div>
              </div>
            </div>
            <div className={`${styles.alertBox} ${styles.alertDanger}`}>
              <div className={styles.alertTitle}>Critical Finding: Butyrate</div>
              <div className={styles.alertBody}>
                Butyrate at 1.1 μmol/g is significantly below the 5.1 μmol/g threshold. Low butyrate
                is linked with increased intestinal permeability, inflammatory bowel disease risk, and
                impaired insulin sensitivity. Raising this level is the #1 priority action.
              </div>
            </div>

            <TooltipHeading
              as="h3"
              title={DEFINITIONS.functionalMarkers.title}
              definition={DEFINITIONS.functionalMarkers.definition}
              gutlyPrompt={DEFINITIONS.functionalMarkers.gutlyPrompt}
              onAskGutly={handleAskGutly}
              className={styles.subsectionTitle}
            />
            <div className={styles.metricsGrid}>
              {[
                { label: 'Serotonin Pathway', value: '96.11 μg/g', badge: 'Normal', ref: '~90% of body\'s serotonin made in gut' },
                { label: 'GABA Pathway', value: '213.01 μg/g', badge: 'Normal', ref: 'Adequate for mood regulation' },
                { label: 'β-Glucuronidase', value: '281 U/mL', badge: 'Normal', ref: 'Target <2300 — estrogen controlled' },
                { label: 'Bile Acid Ratio', value: '0.79', badge: 'Balanced', ref: 'Supports fat digestion & cholesterol' },
              ].map(m => (
                <div key={m.label} className={styles.metricCard}>
                  <div className={styles.metricLabel}>{m.label}</div>
                  <div className={styles.metricValue} style={{ fontSize: 20 }}>{m.value}</div>
                  <span className={styles.badge}>{m.badge}</span>
                  <div className={styles.metricRef}>{m.ref}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 04 — Disease Risk */}
          <div className={styles.section}>
            <div className={styles.sectionLabel}>04 · Systems Panels</div>
            <TooltipHeading
              as="h2"
              title={DEFINITIONS.diseaseRisk.title}
              definition={DEFINITIONS.diseaseRisk.definition}
              gutlyPrompt={DEFINITIONS.diseaseRisk.gutlyPrompt}
              onAskGutly={handleAskGutly}
              className={styles.sectionTitle}
            />
            <p className={styles.disclaimer}>
              These panels represent microbiome-based risk associations, not diagnoses.
              Discuss all findings with a qualified clinician before making health decisions.
            </p>
            <div className={styles.panelsGrid}>
              {[
                { icon: '◆', name: 'Metabolic Health', risk: 'Low Risk', note: 'High Akkermansia (25.5%) strongly protective against metabolic dysfunction' },
                { icon: '◆', name: 'Neurological & Mood', risk: 'Low Risk', note: 'Normal serotonin (96.11 μg/g) and GABA (213.01 μg/g). High diversity supports neuroimmune resilience' },
                { icon: '◆', name: 'Respiratory Health', risk: 'Low–Moderate', note: 'Low butyrate may reduce Treg immune function; overall diversity supportive', warn: true },
                { icon: '◆', name: 'Immune & Autoimmune', risk: 'Low Risk', note: 'Good diversity + balanced SCFAs. Elevated Proteobacteria (6.1%) warrants monitoring' },
                { icon: '◆', name: 'Digestive Health', risk: 'Low–Moderate', note: 'Intestinal permeability moderate — driven by low butyrate and elevated Proteobacteria', warn: true },
                { icon: '◆', name: 'Hormonal Balance', risk: 'Low Risk', note: 'β-glucuronidase 281 U/mL — estrogen metabolism controlled. Low PCOS/T2D risk' },
              ].map(p => (
                <div key={p.name} className={styles.panelCard}>
                  <div className={styles.panelName}>{p.name}</div>
                  <span className={`${styles.panelBadge} ${p.warn ? styles.panelBadgeWarn : styles.panelBadgeGood}`}>{p.risk}</span>
                  <div className={styles.panelNote}>{p.note}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 05 — Recommendations */}
          <div className={styles.section}>
            <div className={styles.sectionLabel}>05 · Action Plan</div>
            <TooltipHeading
              as="h2"
              title={DEFINITIONS.recommendations.title}
              definition={DEFINITIONS.recommendations.definition}
              gutlyPrompt={DEFINITIONS.recommendations.gutlyPrompt}
              onAskGutly={handleAskGutly}
              className={styles.sectionTitle}
            />
            <div className={styles.recoList}>
              {[
                {
                  num: '1',
                  title: 'Increase Butyrate Production — Critical Priority',
                  body: 'Goal: Raise butyrate from 1.1 to 5.1+ μmol/g within 8–12 weeks. Prioritize resistant starch as the primary dietary lever. Add tributyrin supplement and increase intact whole grains and cruciferous vegetables daily.',
                  tags: ['Resistant starch 15–30g/day', 'Tributyrin 300mg/day', 'Broccoli · Brussels sprouts', 'Chicory root · garlic · asparagus'],
                },
                {
                  num: '2',
                  title: 'Restore Bifidobacterium Levels',
                  body: 'Goal: Increase from 6.1% to >10% for optimal immune function. A multi-strain Bifidobacterium probiotic combined with GOS prebiotic. Eliminate artificial sweeteners — they directly reduce Bifidobacterium abundance.',
                  tags: ['B. longum · B. breve · B. infantis (10B+ CFU)', 'GOS prebiotic 5g/day', 'Kefir · yogurt daily', 'Eliminate artificial sweeteners'],
                },
                {
                  num: '3',
                  title: 'Reduce Proteobacteria & Inflammation',
                  body: 'Goal: Lower Proteobacteria from 6.1% to <4%. Omega-3 fatty acids and daily polyphenols are the frontline approach. Temporarily reduce animal fats (promotes sulfate-reducing bacteria).',
                  tags: ['Omega-3 2–3g EPA/DHA/day', 'Green tea · berries · pomegranate', 'Reduce animal fat & red meat'],
                },
              ].map(r => (
                <div key={r.num} className={styles.recoItem}>
                  <div className={styles.recoNum}>{r.num}</div>
                  <div className={styles.recoBody}>
                    <div className={styles.recoTitle}>{r.title}</div>
                    <div className={styles.recoDesc}>{r.body}</div>
                    <div className={styles.recoTags}>
                      {r.tags.map(t => <span key={t} className={styles.recoTag}>{t}</span>)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>{/* /reportContent */}

        {/* ── Gutly sidebar ── */}
        <div className={styles.gutlySidebar} ref={gutlyPanelRef}>
          <div className={styles.gutlyHeader}>
            <div className={styles.gutlyHeaderLeft}>
              <div className={styles.gutlyDot} />
              <span className={styles.gutlyTitle}>Gutly</span>
            </div>
            <span className={styles.gutlySub}>Ask about your report</span>
          </div>
          <div className={styles.gutlyChat}>
            <ChatBot triggerMessage={triggerMessage} />
          </div>
        </div>

      </div>{/* /body */}
    </div>
  )
}
