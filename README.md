🛍 AffinityGraph – Shopper Behavior Intelligence Platform
📌 Overview


AffinityGraph is a probabilistic consumer analytics platform that analyzes raw e-commerce telemetry to uncover behavioral segments, product affinities, and actionable merchandising insights.

Unlike traditional analytics systems that rely on static demographics, AffinityGraph reconstructs behavior-driven shopper patterns using a combination of deterministic mathematical modeling, machine learning, and generative AI.
The system focuses on explaining why customers behave the way they do, not just predicting outcomes.


🎯 Problem Statement


Online shoppers exhibit complex behavior influenced by preferences, values, timing, pricing, and experience friction.
Merchandising and marketing teams struggle to:

Identify meaningful behavioral segments

Understand cross-category product attraction

Interpret unstructured textual feedback (reviews, sentiment)

Convert analytics into real, explainable business actions


💡 Solution Approach


AffinityGraph addresses this problem through a three-layer intelligence pipeline:


1️⃣ Deterministic Behavioral Mapping (Ground Truth Layer)

This layer ensures mathematical accuracy and stability.

Vector-based representation of shopper behavior

Euclidean distance (L2 Norm) to measure deviation from global averages

Dot-product similarity to identify segment proximity

Adaptive 2D projections for visual interpretation

PII-safe telemetry parsing from CSV/JSON inputs



2️⃣ Probabilistic Intelligence & ML Inference

This layer extracts latent structure from behavior data.

Behavioral clustering (unsupervised segmentation)

Affinity discovery across product categories

Pattern stability scoring instead of raw accuracy

Lifecycle tracking of segments (Discovery → Validation → Active)

The model learns patterns from the provided dataset, not from pre-trained consumer labels.


3️⃣ GenAI-Driven Interpretation & Strategy Layer

Powered by Gemini, this layer converts signals into insight.

Natural-language explanations of segments

Probabilistic behavioral backstories (non-deterministic, non-psychological claims)

Review & sentiment synthesis to detect experience friction

Actionable merchandising and marketing strategies

Impact forecasting expressed as probability ranges, not guarantees


🧠 Architecture Overview
Raw Dataset (CSV / JSON)

        ↓
        
Telemetry Parser + PII Scrubber

        ↓
        
Deterministic Feature Engineering

        ↓

ML-based Behavioral Clustering

        ↓

Affinity & Similarity Computation

        ↓
        
GenAI Insight Synthesis (Gemini)


        ↓
        
Interactive Dashboard (Vite + React)


🔍 Key Features


Behavioral (not demographic) shopper segmentation

Product-category affinity heatmaps

Cross-segment similarity discovery

NLP-based review and sentiment analysis

Explainable AI outputs with confidence indicators

Merchandising, Marketing & Leadership perspectives


🤖 ML + GenAI Integration
Machine Learning

Unsupervised clustering for segment discovery

Vector similarity and distance-based affinity modeling

Pattern stability scoring for confidence assessment

Generative AI

Interpretation of latent behavioral patterns

Synthesis of qualitative insights from numeric signals

Review and feedback analysis

Strategy and playbook generation

📌 GenAI does not generate raw predictions — it explains and contextualizes ML outputs.


⚙️ Assumptions

Input data is anonymized or PII-safe

Behavioral patterns are inferred probabilistically, not psychologically

Dataset size is sufficient to infer stable clusters

Insights are advisory, not deterministic business guarantees


⚠️ Limitations & Ethical Considerations

Insights are probabilistic and depend on data quality

Small datasets may produce low-confidence hypotheses

No demographic inference is performed

The system avoids psychological or sensitive attribute labeling

Generated narratives are framed explicitly as hypotheses


🚀 Running the Project Locally
npm install
npm run dev

Environment Variables

Create a .env file (not committed to GitHub):

VITE_GEMINI_API_KEY=your_api_key_here


🌍 Deployment

The application is fully deployable on free platforms such as Vercel or Netlify.
API keys are configured via environment variables on the hosting platform.


📈 Business Feasibility

AffinityGraph is designed as:

A decision-support tool for merchandising and marketing teams

A plug-and-play analytics layer for mid-scale e-commerce platforms

A foundation for future real-time behavioral intelligence systems

🏁 Conclusion

AffinityGraph demonstrates how ML + GenAI, when combined with deterministic analytics, can move beyond dashboards and deliver explainable, actionable consumer intelligence aligned with real-world merchandising needs.
