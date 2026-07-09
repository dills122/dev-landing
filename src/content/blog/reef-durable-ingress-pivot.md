---
title: "The Reef Durable Ingress Pivot"
description: "Why Reef moved away from generic worker-driven command processing toward partitioned durable streams, direct engine consumption, venue event batches, and compact canonical materialization."
pubDate: 2026-07-08
draft: true
type: technical-review
tags:
  - reef
  - architecture
  - event-driven
  - performance
---

One of the bigger Reef architecture lessons so far is that performance problems are often shape problems.

You can tune a bad shape for a while. Add workers. Raise pool sizes. Increase batch sizes. Move a timeout. Change a broker setting. Some of that is useful, especially while you are still learning where the system bends.

Eventually, though, the evidence starts saying the current shape is not the one.

Reef hit that point with the earlier stream-ack and worker-driven command path.

## The Old Shape Preserved Too Much Work In The Wrong Place

The older design had the API accepting commands, durable stream acknowledgement, runtime workers draining commands, calls into the matching engine, database writes, projection work, and repair paths all competing for attention.

It was not wrong as a learning step. It preserved more correctness than a fake benchmark path. It gave us real counters. It exposed Postgres pressure, worker lag, projection lag, and the gap between API success and actual completion.

But it did not look like a credible base for the venue throughput target.

On one DigitalOcean soak, the configured load was `4000 rps`, but the actual accepted rate was about `1636/sec`, worker completion was about `1487/sec`, and projection throughput was about `820/sec`. Runtime and projection Postgres both showed write pressure. Projection lag grew. The system was doing a lot of work, just not in a shape that could scale cleanly toward the goal.

The conclusion was not "add more generic workers."

The conclusion was that command intake, ordered matching, durable event publication, and projection needed sharper boundaries.

## The New Shape Is More Venue-Native

The better direction is more venue-native:

1. Commands enter through a durable, partitioned ingress log.
2. Partition ownership preserves deterministic ordering for matching-sensitive commands.
3. The matching side consumes assigned partitions directly.
4. The engine processes ordered batches for its owned books.
5. It publishes durable venue event batches.
6. Command acknowledgement follows event publication.
7. Compact canonical outcomes are materialized from those event batches.
8. Read models and UI projections catch up asynchronously.

This shape fits Reef better because the domain already wants partitioned ownership. Submit, cancel, and modify commands for the same venue session and instrument need deterministic ordering. A generic pool of workers calling the engine one command at a time is less natural than assigning ordered command partitions to the matching side.

It also gives the benchmark harness clearer facts to compare:

- accepted commands
- broker-acknowledged command references
- direct-engine processed commands
- venue event batches published
- canonical outcomes materialized
- projection lag
- replay and checksum results

The system becomes easier to reason about because each stage has a narrower job.

## Compact Canonical Materialization Matters

Reef cannot simply skip persistence and call it a trading platform.

The point is not to persist every possible read-model shape on the hot path. The point is to persist the canonical facts needed for audit, replay, and reconstruction, while letting rebuildable views happen asynchronously.

That is why the materializer work mattered.

A local durable materializer checkpoint showed that compact canonical persistence could keep up without putting Postgres back in the matching-engine hot path:

- `5k rps`, `3m`: `899950` accepted, `0` failures, p95 about `14.88ms`
- `10k rps`, `3m`: `1799951` accepted, `0` failures, p95 about `48.65ms`
- materializer lag reached `0`
- failed, ack-failed, and unsupported counts stayed `0`
- canonical command outcomes matched accepted command count

That is the kind of result Reef needs more of. It does not just say the front door was fast. It says the accepted command count and compact canonical outcome count agreed after the run.

That agreement is more important than a vanity throughput number.

## The Matching Engine Should Own Ordered Matching Work

The matching-engine evidence changed the architecture conversation.

Engine-only stress showed the book itself had significant local headroom. Single hot-book runs were clean well above the near-term target, and multi-book partitionable runs went much higher. The book implementation moved toward ordered price levels, FIFO queues per price, and direct unlinking by order id, while preserving Reef-owned matching semantics and replay expectations.

That made one thing clear:

The matching engine was not the active limiter.

So the durable ingress design should not route every command through a generic runtime bottleneck before reaching the engine. It should let the matching side consume the ordered command stream it owns, process batches, publish venue events, and let the rest of the platform materialize and project from that event flow.

That is closer to the domain, and it is closer to the performance evidence.

## `202 Accepted` Still Has To Mean Durable Acceptance

The pivot did not relax the API contract.

One easy way to make Reef look faster would be to return `202` after a command lands in local memory. That would make the benchmark more flattering and the system less honest.

The rule stayed:

Do not return `202 Accepted` until the configured durable ingress mechanism has acknowledged acceptance.

That makes the publish path a real bottleneck. It also makes it meaningful.

No-database and no-op modes still exist because they are good diagnostics. They can isolate the API, matching engine, or load generator. But durable claims require durable acknowledgement, and end-to-end claims require downstream accounting to line up.

That constraint forced the work toward better architecture instead of benchmark theatre.

## The HTTP Boundary Became Part Of The Architecture

The durable direct path eventually exposed another shape issue: one HTTP request per command was adding enough front-door and publish-ack overhead to matter.

The direct no-database stream path was functionally clean, but it flattened below the target in some remote runs. Direct-engine drain was clean. Publish queues were not obviously full. The remaining hot area was durable publish acknowledgement plus API-side scheduling.

That led to an opt-in long-lived stream ingress prototype.

The prototype reused the existing submit validation and durable publish path, but removed a chunk of per-command HTTP request overhead. It did not fake acceptance. Each command still depended on broker acknowledgement.

Locally, that shape crossed the target:

- `10000 rps`, `30s`: about `9996/sec`, zero failures
- `10500 rps`, `30s`: about `10496/sec`, zero failures
- `10500 rps`, `5m`: about `10467/sec`, zero failures after event batch size correction

That does not mean the final product surface should become a line-based TCP protocol. It means the ingress protocol shape is part of the performance design, not just an implementation detail.

Future versions might use framed protobuf, tuned Netty paths, HTTP/2 streams, or another production-shaped transport. The lesson is that durable semantics and per-command request overhead have to be designed together.

## The Projection Layer Should Not Define Venue Capacity

Reef has UI and operational projections because users need to inspect the system. Those projections matter.

But they should not always define core venue capacity.

A projection-freshness mode is useful when testing the control room experience. If the UI falls behind, that is a real product problem. But a venue-core benchmark should report projection lag separately from canonical command acceptance and matching completion.

That split helped clarify the architecture:

- canonical command outcomes are part of the durable truth
- read models are rebuildable views over that truth
- projection lag is a freshness signal
- projection write amplification should not be smuggled back into the matching hot path

This is not an excuse to ignore projections. It is a way to avoid confusing two different bottlenecks.

## The Pivot In One Sentence

The system moved from "API accepts commands and generic workers push work through the platform" toward "durable partitioned command streams feed deterministic matching ownership, which publishes compact event batches for canonical materialization and asynchronous projection."

That is a mouthful, but it is a better fit.

It preserves the important constraints:

- deterministic command ordering
- durable acceptance
- engine-owned matching behavior
- compact canonical facts
- replay and auditability
- async projections
- measurable lag and failure boundaries

And it gives the next performance work a cleaner target.

## What Comes Next

The next useful gates are not just higher numbers. They are stronger proofs:

- longer DigitalOcean soaks in the durable direct-ingress shape
- replay and checksum validation after sustained runs
- materializer idempotency under restart and redelivery
- compact canonical storage growth measurements
- projection catch-up tests under aged state
- clearer ingress protocol decisions once the prototype evidence settles

That is the part I like about this phase of Reef.

The architecture is no longer chasing speed in the abstract. It is converging on a shape where the performance work and the domain model are finally pulling in the same direction.
