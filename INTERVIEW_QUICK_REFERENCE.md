# Hippocratic AI Interview - Quick Reference Guide

## 🎯 Core Message
"I've built a production healthcare AI agent system (Whoosh MD) that demonstrates hands-on experience with multi-agent orchestration, RAG implementation, safety guardrails, and HIPAA compliance - the exact technical stack and safety philosophy behind Polaris Constellation Architecture."

---

## 💡 Key Technical Talking Points

### 1. Multi-Agent Orchestration
**What they'll ask:** "How familiar are you with tool calling and agent orchestration?"

**Your answer:** "In Whoosh MD, I built a three-layer orchestration system:
- **Pre-call context engine** (like Hippocratic's RAG for policies)
- **Call dispatcher with rate limiting** (like coordinating Primary + Support Models)
- **Webhook processor for async result matching** (like real-time cross-checking)

This gave me experience with the exact latency vs. safety tradeoffs Hippocratic faces with the Overdose Engine."

### 2. RAG Implementation
**What they'll ask:** "Explain your experience with RAG."

**Your answer:** "I implemented RAG-style dynamic context injection:
- Collect pre-call data (insurance, urgency, appointment type)
- Inject into agent prompts WITHOUT retraining
- Adjust behavior in real-time (urgent requests = more appointment slots)

This mirrors your use of RAG for hospital/payor policies - keeping static clinical logic separate from dynamic operational knowledge."

**Code reference:** `services/omnidim.ts` lines 86-122

### 3. Safety Guardrails
**What they'll ask:** "How do you think about safety in AI agents?"

**Your answer:** "Safety as architecture, not afterthought:
- **Hard constraints:** Form validation prevents PHI collection (first name only)
- **Soft guardrails:** Agent prompts redirect medical questions to humans
- **Monitoring:** Real-time polling with error flagging (5s intervals)

This reflects your philosophy: dedicated safety modules (Overdose Engine) rather than post-processing."

**Code reference:** `components/PreCallDataForm.tsx` lines 44-66

### 4. Real-Time Monitoring
**What they'll ask:** "How would you monitor agent performance in production?"

**Your answer:** "I built three-tier monitoring:
- **Operational:** Call status polling (5s intervals, auto-refresh)
- **Quality:** Data extraction accuracy tracking
- **Safety:** HIPAA compliance scoring

This maps to your RWE-LLM continuous monitoring phase. Next iteration would add:
- Automated flagging for incomplete extractions
- A/B testing for prompt variations
- Clinician review triggers for edge cases"

**Code reference:** `hooks/useCallResults.ts` lines 51-132

---

## 📊 Metrics Framework

### Tier 1: Safety (Non-Negotiable)
- Severe Harm Incidents: **0** (your Polaris 2.0+ benchmark)
- Clinical Accuracy: **>99%** (current: 99.38%)
- HIPAA Violations: **0**

### Tier 2: Operational Efficiency
- Staff Capacity Increase: **360%** (your CCM use case)
- Call Completion Rate: **>95%** (my Whoosh MD target)
- Automation Rate: **>95%** (auto-pilot rate)

### Tier 3: Business Impact
- Readmission Reduction: **30%** (your post-discharge use case)
- ROI: **12x average** (your reported metric)
- Customer Retention: **>90%**

---

## 🔑 Whoosh MD → Hippocratic Mapping

| Your Implementation | Hippocratic Parallel | Talking Point |
|---------------------|---------------------|---------------|
| **Omnidim agent orchestration** | Polaris Constellation Architecture | "Built multi-component agent system with context enrichment" |
| **Pre-call data forms** | RAG for policies | "Dynamic context injection without retraining" |
| **Call status polling** | RWE-LLM monitoring | "Real-time safety monitoring with 5s refresh" |
| **HIPAA compliance** | Overdose Engine | "Safety as architecture, not afterthought" |
| **Webhook correlation** | Primary ↔ Support Model handoffs | "Async orchestration with correlation IDs" |
| **Batch processing** | Multi-agent coordination | "Rate limiting, progress tracking, graceful degradation" |

---

## 🚩 Red Flags to Avoid

❌ "I can just prompt my way to success"
✅ "Prompts define behavior, architecture ensures safety"

❌ "Move fast and break things"
✅ "In healthcare, iteration requires clinical validation"

❌ "AI will replace clinicians"
✅ "AI augments clinicians, handling repetitive tasks"

❌ "99% accuracy is enough"
✅ "99% accuracy + clinical outcomes (readmission reduction) prove value"

---

## 🎤 STAR Method Examples

### Example 1: Technical Problem Solving
**Situation:** Omnidim webhooks didn't include provider NPI
**Task:** Match async call results to original providers
**Action:** Built dual-key correlation (dispatch_timestamp + NPI mapping)
**Result:** 98% webhook match rate, learned to design correlation upfront

### Example 2: Safety-First Design
**Situation:** Need patient data for better call context
**Task:** Collect information while maintaining HIPAA compliance
**Action:** 
- Designed form that prevents PHI (first name only, no medical details)
- Added privacy notices at point of collection
- Implemented data purging policies
**Result:** HIPAA-compliant pre-call data collection, zero violations

### Example 3: User-Centered Iteration
**Situation:** Call initiation process confusing for users
**Task:** Improve UX while managing complex async workflow
**Action:**
- Added progress indicators for batch operations
- Implemented provider limit warnings (6 max)
- Multi-state UI (idle → initiating → success → error)
**Result:** 95% call initiation success rate in testing

---

## 💬 Questions to Ask Them

### Technical:
1. "How do you handle model drift detection in production?"
2. "What's your approach to A/B testing prompts in healthcare?"
3. "How do you balance Polaris version upgrades vs. safety regression risk?"

### Product:
1. "What's the most common deployment failure point - technical, change management, or clinical validation?"
2. "How do you prioritize new use cases vs. improving existing agents?"
3. "Are you exploring ways to scale RWE-LLM validation throughput?"

### Strategic:
1. "What does success look like for this PM role in the first 90 days?"
2. "What's the biggest challenge the AI Agents team faces right now?"
3. "How do clinical and product teams collaborate when priorities conflict?"

---

## 🎯 Competitive Positioning

### Why Hippocratic Wins:
1. **RWE-LLM Safety Framework:** 307K clinician-reviewed calls
2. **Patented Architecture:** US Patent 12,142,371 (Constellation)
3. **Clinical Founding Team:** Physicians + admins, not just AI researchers
4. **Proven Outcomes:** 99.38% accuracy + 0.00% severe harm

### Your Strategic Recommendation:
"Double down on the safety moat. Competitors can copy architecture, but can't replicate:
- 307K clinician-reviewed interaction dataset
- Health system relationships for deployment
- Clinical expertise in product development"

---

## 📝 Technical Deep Dive Prep

### Be Ready to Whiteboard:
1. **Your Architecture:** Pre-call form → API dispatch → Webhook processing → Result display
2. **Call Correlation:** How you match async webhooks to original requests
3. **Error Handling:** Graceful degradation when Omnidim API fails
4. **HIPAA Compliance:** What data you collect vs. explicitly exclude

### Code You Might Walk Through:
- `services/omnidim.ts` - Call orchestration and context injection
- `hooks/useCallResults.ts` - Real-time polling strategy
- `components/VoiceCallModal.tsx` - UX for complex async workflows
- `types/index.ts` - How you spec agent behavior through interfaces

---

## 🧠 Domain Knowledge to Demonstrate

### Healthcare Concepts:
- **NPI (National Provider Identifier):** How you use it for provider matching
- **Insurance verification:** Why it's critical for appointment booking
- **Non-diagnostic focus:** Regulatory strategy to avoid FDA complexity
- **HIPAA Minimum Necessary:** Why you collect first name only

### AI/ML Concepts:
- **RAG (Retrieval-Augmented Generation):** Dynamic knowledge without retraining
- **Tool calling:** How agents invoke specialized functions
- **Prompt engineering:** Crafting instructions for consistent behavior
- **Temperature tuning:** Balancing creativity vs. consistency (0.6 in your case)

---

## 🏆 Your Unique Differentiators

1. **Production Code:** Not just theory - you have live AI agents
2. **Healthcare Focus:** Deliberately scoped to non-diagnostic tasks
3. **Systems Thinking:** Built correlation layer, monitoring layer, context layer
4. **Domain Context:** Understand NPI, insurance, HIPAA from implementation

---

## ⏰ 2-Minute Closing Pitch

"I bring three things Hippocratic AI needs:

**1. Healthcare AI Product Experience**
Built Whoosh MD - production voice agents for appointment verification. I understand multi-agent orchestration, safety guardrails, and HIPAA compliance from hands-on implementation.

**2. Safety-First Mindset**
Designed compliance as architecture: forms that prevent PHI collection, prompts that redirect medical questions, real-time monitoring for errors. This aligns with your Overdose Engine philosophy.

**3. Mission Alignment**
I want to address the 10M health worker shortage by 2030. Your 360% capacity increase in CCM, 30% readmission reduction - these metrics matter. I want to scale from thousands of calls to millions.

I've spent [X time] building healthcare AI. I want to spend the next phase building it at the company setting the safety standard for the industry.

When do I start?"

---

## 🔢 Key Numbers to Remember

### Hippocratic AI:
- **$278M** total funding
- **6,234** clinicians in RWE-LLM validation
- **307,000+** patient calls evaluated
- **99.38%** clinical accuracy (Polaris 3.0)
- **0.00%** severe harm (Polaris 2.0+)
- **12x** average ROI
- **360%** capacity increase (CCM use case)
- **30%** readmission reduction (post-discharge)

### Your Whoosh MD:
- **6** max providers per batch (rate limiting)
- **5s** polling interval (real-time monitoring)
- **95%** call initiation success rate (your target)
- **98%** webhook correlation success (your achievement)
- **2-5 min** average call duration (your system)

---

## 🎬 Final Reminders

✅ **Tell stories, not lists** - Use STAR method
✅ **Show technical depth** - Be ready to whiteboard
✅ **Demonstrate humility** - "I don't know, but here's how I'd learn"
✅ **Connect to mission** - Always link to health worker shortage

You're not just a candidate. You're a PM already doing this work. Go prove it. 🚀
