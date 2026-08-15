## The Problem

ClauseAI analyzes rental and lease agreements for people who have to sign them but aren't lawyers — tenants, small landlords, anyone handed a dense PDF full of clauses they don't have time to fully parse. It extracts the key terms, flags clauses that are risky or one-sided, and lets the person ask plain questions about their own agreement and get answers grounded in the actual document.

## The Hard Part

- The hard part isn't calling an LLM, it's coordinating a multi-step agent pipeline (parse → summarize → embed → assess risk) without losing state or duplicating expensive LLM calls when something fails partway through.
- A simple approach was to have one long function that calls each agent in sequence — falls apart the moment a worker crashes or a step times out: retrying from scratch means re-running steps that already succeeded, burning API quota and money on work that was already done, and risking inconsistent state if a later step partially wrote to the database before failing.

## The Slice

- The one end-to-end path shipped: a user uploads a single rental agreement PDF, the full pipeline runs (parse, summarize, embed, assess risk), and the user can then chat with the agreement — asking about clauses or risks and getting answers grounded in the document.

- The one failure case explicitly handled within that slice: a worker or process crashing mid-pipeline. On retry, the workflow's state hydration means already-completed steps (and their LLM calls) are not re-run — processing resumes from where it left off instead of starting over and re-paying for work already done.

---

## 1. Postgres + pgvector instead of a dedicated vector DB

**Decision:** Store both relational data (agreements, parties, payments) and section embeddings in a single PostgreSQL database using pgvector.

**Alternatives considered:** MongoDB Atlas (with vector search)

**Reasoning:** Only one table (agreement sections) actually needs embeddings — everything else (metadata, parties, payments, risks) is static relational data. Running a separate vector DB alongside a relational DB just for that one table wasn't worth the operational overhead for this build. MongoDB Atlas was considered early on, but it had been a while since working with Postgres, so Postgres was picked to stay closer to familiar ground while still meeting the requirement with pgvector.

---

## 2. Mastra for agent orchestration instead of LangGraph

**Decision:** Use Mastra to define and run the multi-agent workflow.

**Alternatives considered:** LangGraph (the original plan), building orchestration by hand.

**Reasoning:** The project started on LangGraph, but state management across the multi-step agent pipeline became a persistent pain point. Mastra was picked after hearing it has strong first-class TypeScript support. There was a learning curve adjusting to its paradigm, but it turned out to be reliable and developer-friendly once past that.

**Tradeoff accepted:** Time spent mid-build switching frameworks instead of building features — a real cost, but one that paid off in fewer state-management bugs afterward.

---

## 3. BullMQ + Redis for background processing instead of direct async calls

**Decision:** Queue agreement processing jobs through BullMQ (Redis-backed) rather than running the AI pipeline directly in the request handler.

**Alternatives considered:** Plain async function calls with no queue, a cron-based poller.

**Reasoning:** The main goal was decoupling the API process from the AI processing process. If multiple agreements are uploaded at once, running everything inline risks hitting model rate limits when several workflows compete for the same AI provider at the same time. A queue absorbs that burst and processes jobs in a controlled way instead of failing under load.

---

## 4. Cloudflare R2 instead of AWS S3 for file storage

**Decision:** Store uploaded agreement files in Cloudflare R2.

**Alternatives considered:** AWS S3, local disk storage.

**Reasoning:** R2 is simple to manage manually from the Cloudflare dashboard. AWS's console and IAM setup felt like unnecessary overhead ("sitting in a cockpit") for a project of this size and timeline. R2 is also S3-compatible, so migrating to S3 later would be straightforward if needed.

---

## 5. Token-budgeted section retrieval instead of fixed top-K

**Decision:** The Sections Tool caps retrieved agreement sections by a maximum token budget, not a fixed count of results.

**Alternatives considered:** Always returning a fixed top-K number of sections regardless of length.

**Reasoning:** The Query Agent already holds recent conversation history and agreement metadata in its context window. Dumping too many retrieved sections on top of that degrades response quality rather than improving it. A token cap keeps the total context manageable regardless of how long individual sections are.

**Tradeoff accepted:** The cap is currently hard-bounded to fit within the free tier of Google AI Studio's model limits. In production, this would scale up with a more capable (paid) model rather than staying fixed.

---

## 6. Google Gemini instead of OpenAI/Anthropic for agent models

**Decision:** Use Google Gemini models for all agents (Parser, Summary, Risk, Query) and for embeddings.

**Reasoning:** Cost — Gemini's free tier made it possible to build and iterate without incurring API costs during development.

**Tradeoff accepted:** Free-tier rate limits directly shaped other decisions in this project (sequential agent pipeline, token-capped retrieval). A production deployment would likely move to a paid tier or a more capable model.

---

## 7. LlamaIndex LiteParse instead of a custom OCR pipeline

**Decision:** Use LlamaIndex LiteParse Library for PDF/document text extraction.

**Alternatives considered:** Tesseract OCR (converting PDF pages to images first).

**Reasoning:** The Tesseract approach was tried first — converting pages to images and running OCR — but it was slow and the output quality wasn't good enough. LiteParse handles parsing internally, reducing the amount of custom processing logic needed. For non-native PDF documents it can't cleanly parse to text (e.g. complex layouts or embedded images with text), the file is instead downloaded and handed directly to the Parser Agent for extraction, rather than relying on unreliable raw text output.

---

## 8. Express.js

**Decision:** Build the API on Express.

**Alternatives considered:** None seriously — Fastify and NestJS exist but weren't evaluated in depth.

**Reasoning:** Direct familiarity from recent past projects. For a time-boxed build, using a framework already known well was more valuable than evaluating alternatives with potentially better performance or structure.

**Tradeoff accepted:** Express provides less built-in structure (no DI, no schema validation out of the box) compared to NestJS — acceptable since the project's routing needs are straightforward.

---

## 9. Sequential agent pipeline instead of parallel

**Decision:** Run the Parser → Summary → Embedding → Risk pipeline sequentially, not in parallel.

**Reasoning:** Running on the free tier of Google AI Studio means parallel calls significantly increase the chance of hitting rate limits. Sequential execution trades speed for reliability while on a constrained quota.

**Tradeoff accepted:** Slower end-to-end processing time per agreement. Mastra's workflow model supports parallel execution without major rework, so this is a configuration change for production rather than a redesign — the code doesn't need to change, just the execution strategy.

---

## What Was Deliberately Cut

- **Streaming responses** — Chat answers are returned as a complete message once generation finishes, not streamed token-by-token. Cut to save build time; the async + polling flow already keeps the UI responsive without it.
- **Automated tests** — No test suite was built given the 5-day timeline. The tradeoff was consciously made to prioritize a working end-to-end pipeline over test coverage, with the understanding that tests would be a first addition post-submission.

---

## Testing Guidelines

- Free tier is slow, so query response or agreement processing can take some time.
- In case, processing fails, you can re-trigger the process from dashboard after 5 minutes.
