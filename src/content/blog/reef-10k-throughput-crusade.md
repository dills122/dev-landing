---
title: "Reef And The 10k Throughput Crusade"
description: "A practical write-up on chasing 10k commands per second in Reef, and why the interesting work was less about raw speed than about preserving durable, auditable behavior under load."
pubDate: 2026-07-08
draft: true
type: rambling
tags:
  - reef
  - performance
  - trading-systems
  - architecture
---

Reef started with a clean-sounding performance goal: get the simulated venue to handle `10k/sec`.

That is the kind of number that looks tidy on a roadmap and immediately gets messy in the real system.

The number was never the hard part by itself. You can make a benchmark print `10k/sec` if you are willing to cheat the parts that matter: return early, skip persistence, ignore downstream lag, count requests instead of accepted commands, treat valid lifecycle rejections as failures, or let in-memory state grow forever.

That would have made the graph look better and Reef worse.

Reef is meant to be a simulation-first institutional trading venue and post-trade platform. It needs to be inspectable, replayable, and auditable. Commands should cross realistic boundaries. Matching should be deterministic. Projections can lag, but the canonical facts have to line up.

So the goal turned into a better question:

Can Reef sustain `10k/sec` while still telling the truth about what was accepted, what was durably recorded, what matched, what was projected, and what can be replayed later?

That is where the work got interesting.

## First, Count The Right Thing

The first trap in performance work is measuring the fastest number you can get out of the load generator and calling it throughput.

For Reef, that was not enough. The benchmark had to separate:

- attempted requests
- HTTP success responses
- accepted business commands
- legitimate business rejections
- durable ingress acknowledgements
- matching-engine completions
- canonical materialization
- projection freshness
- actual infrastructure failures

Those are not the same number.

That matters in a trading-style system. A modify or cancel can be rejected because the order is already filled, cancelled, unknown, or in the wrong lifecycle state. That is a real business outcome, not the same thing as the API failing, the broker dropping a message, a worker crashing, or the materializer falling behind.

Once the reports separated those categories, the results got more honest. Some runs looked worse at first because they stopped hiding the gap between "the API responded" and "the platform finished the work."

That was a good thing.

## Postgres Was The First Wall

The first real wall was Postgres write pressure.

The older path asked the database to do too much during the hot command lifecycle. Short runs could look promising. Longer runs told a different story. A 30-minute fixed-load soak around `2500 rps` stayed up, but the database was clearly carrying too much of the system:

- frequent WAL-triggered checkpoints
- heavy backend buffer writes
- allocation pressure
- rapid growth in runtime tables for events, executions, trades, submit results, and orders

The platform was not falling over, but it was teaching the wrong lesson. If every hot command fans out into too many synchronous or near-synchronous writes, the benchmark stops being a venue benchmark and turns into a database write-amplification test.

That pushed one of the recurring Reef rules into focus:

Hot paths should be append-friendly, narrow, and canonical. Expensive projections should happen asynchronously and should be rebuildable.

That is easy to say. The hard part is cutting write amplification without quietly weakening the audit and replay story.

## The Matching Engine Was Not The Villain

At a few points, the matching engine looked like the obvious suspect. Matching systems sound like they should be the hot part.

Once the engine was isolated, though, the evidence pointed somewhere else.

Engine-only and no-database runs showed that matching itself had plenty of headroom for the near-term target. A single hot book passed `10k/sec` one-minute gates, then went much higher in focused local stress runs. The shard-ready in-memory book direction, with ordered price levels and FIFO queues per price, gave us a cleaner path than constantly tuning around a weaker structure.

The useful lesson was not just "the engine is fast." It was that subsystem isolation keeps you from optimizing the part that happens to sound important.

If the end-to-end benchmark is slow, but the engine-only benchmark is clean, rewriting the matching engine is probably not the next best move. The bottleneck was elsewhere: API intake, durable publish acknowledgement, worker drain, projection writes, or the shape of the ingress protocol.

That saved a lot of wasted effort.

## `202 Accepted` Had To Mean Something

One of the most important constraints was that `202 Accepted` could not mean "the server put something in memory and hopes it works out."

For Reef, `202` has to mean the configured durable ingress mechanism acknowledged acceptance. Otherwise the API can claim success for commands that are not recoverable after a crash.

That made some benchmark shortcuts off-limits.

No-op publishers and no-database modes were still useful, but only as diagnostics. They could prove API front-door headroom or matching-engine capacity. They could not prove durable venue throughput.

This distinction kept showing up:

- no-DB accepted-async proved the API and engine could move fast locally
- direct stream paths proved ordered matching consumption could stay clean
- materializer checks proved canonical command outcomes matched accepted commands
- replay and checksum checks proved the data could be reconstructed

Each profile had a purpose. None of them was allowed to pretend to prove more than it actually proved.

## The Architecture Had To Pivot

The older stream-ack shape was a real step forward. It preserved more correctness than the earliest approaches and gave the benchmark better counters.

It still was not the right foundation for the target.

On a DigitalOcean run, a `4000 rps` configured test only accepted about `1636/sec`, completed about `1487/sec`, and projected about `820/sec`. Projection lag grew, Postgres write pressure was high, and the stack was spending too much effort in the wrong places.

That was the stop point.

The next direction moved toward durable command streams, partition-owned engine consumption, venue event batches, and compact canonical materialization. Instead of generic runtime workers calling the engine one command at a time and producing too much database churn, the better shape was:

1. accept commands through a durable partitioned ingress path
2. consume ordered partitions directly by the matching side
3. publish venue event batches
4. acknowledge after durable event publication
5. materialize compact canonical outcomes
6. let projections catch up asynchronously

That is a much more natural shape for the problem Reef is trying to model. It moves the system away from generic workers pushing one command at a time through a crowded path and toward ownership, ordering, and compact facts.

It also made the benchmark reports easier to reason about. Accepted commands, direct acknowledgements, venue event batches, materialized outcomes, projection lag, and replay checks each had a clearer place in the pipeline.

## Then The HTTP Shape Got Weird

One of the more interesting turns was the long-lived stream ingress prototype.

Before that, the direct no-database stream path was functionally clean but flattened below the target on remote runs. The matching engine was not failing. The publish queue was not the obvious limiter. Durable publish acknowledgement and API-side request scheduling were dominating the run.

Local raw broker checks suggested the broker itself had much more room than Reef was getting through the normal per-command API shape.

So the prototype removed a chunk of per-command HTTP overhead. It added an opt-in long-lived TCP line ingress that reused the existing validation and durable publish path. The important part is that the semantics stayed real: acceptance still waited on broker acknowledgement.

That path finally got the local Redpanda direct-engine no-DB profile over the floor:

- `10000 rps`, `30s`: about `9996/sec`, zero failures
- `10500 rps`, `30s`: about `10496/sec`, zero failures
- `10500 rps`, `5m`: about `10467/sec`, zero failures after capping direct-engine event batches at `500`

That last correction mattered. The first five-minute run failed a direct-engine guardrail because event batches exceeded the producer message-size limit. The fix was not to declare victory anyway. The fix was to cap the batch size, rerun, and prove the guardrails stayed clean.

## Most Of The Win Was Better Accounting

The satisfying part of this work was not one heroic optimization. It was the steady accumulation of better accounting.

The benchmark harness had to learn to fail runs when the system was quietly unhealthy:

- accepted commands did not match direct acknowledgements
- worker completion lagged too far behind acceptance
- materialized canonical outcomes did not match accepted commands
- async worker failures happened after the API had already responded
- broker NAKs or publish failures appeared
- projection lag was being confused with venue-core capacity
- no-op diagnostic modes were being mistaken for durable evidence
- in-memory retention was unbounded and the test was really measuring heap growth

Every one of those distinctions made the next optimization more grounded.

## What I Would Keep From This

The main lesson is that throughput goals are only useful when the success definition is precise.

For Reef, `10k/sec` became meaningful only after it was tied to:

- durable acceptance
- deterministic partition ownership
- direct matching-engine drain
- canonical outcome counts
- replay and checksum behavior
- bounded memory
- explicit diagnostic modes
- projection lag reported separately from core venue throughput

The number was a forcing function. It made weak contracts visible. It exposed accidental synchronous work. It turned vague "the system is slow" conversations into concrete subsystem evidence.

That is the real value of the crusade so far. Not that Reef can print a big number in a benchmark report, but that the platform is getting much better at knowing what that number means.
