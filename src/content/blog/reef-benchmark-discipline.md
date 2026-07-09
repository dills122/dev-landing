---
title: "Benchmark Discipline From Building Reef"
description: "Notes from making Reef's performance tests more honest: separating diagnostic modes from durable claims, tracking the right counters, and treating lag as evidence instead of noise."
pubDate: 2026-07-08
draft: true
type: overview
tags:
  - reef
  - benchmarking
  - performance
  - systems
---

Most bad benchmark conversations start with a number that has wandered away from its context.

`10k/sec` sounds useful. So does `p95=20ms`, `100% success`, or `0 failures`.

But a benchmark number only matters if everyone understands what was counted, what was excluded, and what the system was allowed to defer. Reef made that painfully obvious.

Reef is a simulated institutional trading venue and post-trade platform. It has order intake, matching, executions, durable event flow, projections, replay goals, and audit requirements. That means a benchmark cannot just ask whether the API server returned a response quickly. It has to ask whether the platform can still explain itself after the run.

The most useful performance work so far has been turning "how fast did it go?" into a better question:

What exactly stayed true while it went fast?

## Throughput Has More Than One Counter

The first improvement was separating counters that were too easy to blur together.

For Reef, these are different:

- requests attempted by the load generator
- responses completed by the client
- HTTP `202` responses
- accepted business commands
- rejected business commands
- infrastructure failures
- commands acknowledged by durable ingress
- commands completed by the matching path
- canonical outcomes materialized
- projection rows caught up

Any one of those can be the headline number. Most of them should not be.

If a load generator attempts `7500/sec` but the system only accepts `1281/sec`, the run is not a `7500/sec` success story. If the API returns `202` but workers fail later, the API result is not enough. If the core venue path is healthy but read-model projections lag, that matters, but it is a different problem than command acceptance.

The reports got better once they stopped trying to compress all of that into one success percentage.

## Business Rejections Are Not Infrastructure Failures

Trading-style lifecycle tests create legitimate rejections. That sounds obvious, but it is surprisingly easy to lose in a report.

A cancel can arrive after an order is already gone. A modify can target an order that no longer has the right state. A command can be rejected because the business lifecycle says no.

Those outcomes should be counted and persisted. They should not be mixed into transport failures, broker failures, database failures, or crashes.

This mattered because lifecycle-heavy tests can look worse than submit-only tests if the report only counts happy acceptances. But a platform that correctly rejects invalid lifecycle transitions is doing real work.

The benchmark needed to answer two separate questions:

1. Did the platform handle the command and produce a durable outcome?
2. Was that outcome a business acceptance or a business rejection?

That distinction made the lifecycle tests more valuable.

## Diagnostic Modes Need Labels

Reef uses several benchmark modes on purpose, and each one has to wear a clear label.

Some remove persistence to isolate the API and matching engine. Some use no-op publishers to test intake shape without broker cost. Some stress strict lifecycle behavior. Some run durable stream ingress and materialization. Some care about projection freshness. Some deliberately ignore projection lag so venue-core capacity can be measured separately.

Those modes are useful only when the report is honest about what they prove.

A no-database accepted-async run can prove the local API and matching path have headroom. It cannot prove durable venue acceptance. A no-op publisher can reveal front-door overhead. It cannot prove crash recovery. A projection-freshness mode can protect the UI experience. It should not always define the core matching venue's capacity.

The rule became simple:

Use diagnostic shortcuts, but never let their results masquerade as production-shaped throughput.

## Reset State And Aged State Are Different Tests

Short clean-reset runs are useful because they reduce variables. They are good for comparing one code change to another.

They are not enough.

Reef hit cases where a short run looked healthy, then a longer or aged-state run exposed the real pressure. Tables grew quickly. WAL and checkpoint behavior became the story. Projection lag accumulated. Memory retention showed up only after enough commands had passed through the system.

That changed how I think about performance evidence:

- short runs are good for local iteration
- longer soaks are good for stability
- aged-state runs are good for lifecycle pressure
- reset runs are good controls, not final proof

If the system only looks fast when the database is empty and the process has just started, the benchmark is not telling the whole truth.

## Backpressure Is A Result, Not An Embarrassment

Some Reef runs returned a lot of `429` responses.

At first glance, that looks like failure. Sometimes it is. But backpressure can also be the system preserving itself honestly instead of accepting work into an unbounded mess.

The important question is why backpressure happened:

- worker stream lag
- projector lag
- command intake queue pressure
- publish pipeline saturation
- database reserve pressure
- direct-engine drain pressure

Those causes imply different fixes.

A `429` caused by projection lag should not send you rewriting the matching engine. A `429` caused by publish-pipeline saturation should not send you adding database indexes. A cleanly rejected overload run can be more useful than a "successful" run that accepted everything into memory and died later.

Backpressure is part of the evidence. It should be classified, not hand-waved away.

## Lag Has To Be Measured Where It Happens

One of the better changes was making lag specific instead of treating it as a single vague symptom.

Projection lag is not the same as command-stream lag. Command-stream lag is not the same as publish queue depth. Publish queue depth is not the same as broker acknowledgement latency. Worker completion gaps are not the same as materializer gaps.

That specificity helped avoid false conclusions.

For example, a run could have:

- low publish queue depth
- clean direct-engine acknowledgement
- no broker NAKs
- high durable publish acknowledgement latency

That points toward the API publish path or broker ack pattern, not matching-engine compute.

Another run could have:

- successful API responses
- worker failures after acceptance
- projection lag growing
- Postgres WAL pressure

That points toward async drain and persistence shape, not the HTTP handler alone.

The more specific the lag metric, the less likely the next fix is random.

## Benchmark Reports Should Fail Loudly

The benchmark harness became more valuable as it became more willing to fail a run.

A run should fail when:

- accepted count and durable ack count disagree
- materialized canonical outcomes do not match accepted commands
- async worker failures occur after API success
- broker publish failures or NAKs occur
- direct-engine completion does not catch up
- replay or checksum checks fail
- in-memory diagnostic stores grow without bounds
- actual attempted rate misses the configured target badly

This is annoying in the moment. It also prevents false confidence.

The worst performance report is the one that says "success" while quietly showing the system is unrecoverable, inconsistent, or falling behind.

## The Useful Template

The shape I want for Reef benchmark evidence now is fairly consistent:

1. State the mode and what it proves.
2. State the exact command, duration, target rate, and worker count.
3. Report attempted, completed, accepted, rejected, and failed counts separately.
4. Report `p50`, `p95`, and `p99`, but do not let latency replace correctness.
5. Report durable ingress acknowledgement counts.
6. Report matching completion or direct-engine acknowledgement counts.
7. Report canonical materialization counts.
8. Report projection lag separately.
9. Include top reject reasons and top infrastructure errors.
10. Say what the run does not prove.

That last part is the easiest to skip and probably the most important.

## The Broader Lesson

Benchmark discipline can sound like process for its own sake. In practice, it is how performance work stays connected to reality.

Reef's throughput work improved when the reports stopped trying to be flattering. The best runs were not always the fastest ones. They were the ones that made the next bottleneck obvious without weakening the platform's core promises.

That is the standard I want to keep:

Fast is good.

Fast while still durable, bounded, replayable, and honestly measured is the part worth keeping.
