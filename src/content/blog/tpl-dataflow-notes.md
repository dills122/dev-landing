---
title: "TPL Dataflow Library Introduction"
description: "Introduction to Microsoft's TPL Dataflow library."
pubDate: 2019-01-09
type: tutorial
tags:
  - dotnet
  - concurrency
  - tutorial
  - tpl
  - dills122
---

## Introduction

Processing data concurrently is hard, especially when data integrity is key and when isn't that priority number one. Well good news for all .NET developers out there, Microsoft has a library called TPL Dataflow for just this type of workflow. TPL gains its robustness from the design, which focuses on building "pipelines" by connecting different types of blocks in a flow then processing the data through the finished pipeline. This design allows the underlying library to handle the overhead of managing threads and processing order and allow the developer to focus on their job. Throughout this introduction we will discuss the fundamentals of TPL and give some examples of it.

## How It Works

TPL functions in a producer and consumer model where most blocks function as both, except for Action Blocks, since they function as a pass through along with their other specific tasks.

> TPL functions in the producer consumer model.

Think of TPL as an assembly line with many different stations for processing. The product is constantly moving and only interrupted for processing when a worker must interact with it. Same with TPL, except the product is data and the worker is a block.

Another good analogy for TPL is building with Legos, each TPL block is like a Lego block and all you need to do is connect them together to accomplish your task. Well it's not that simple, but kind of.

**Well how does the data flow between blocks?**

When data is passed to the head block, transporting is blocked until the block is marked as complete, which kicks off the processing. This same flow continues throughout each block until all data has been processed. In TPL this is called `CompletionPropagation` and this option signals that each block must ensure completion before sending the data to the next block. However, there are a few exceptions to this rule when working with certain block types.

For a more detailed explanation, [this Channel 9 video](https://channel9.msdn.com/Shows/Going+Deep/Stephen-Toub-Inside-TPL-Dataflow) has one of the major architects of TPL going over the inner workings of the library.

## Block Types

TPL has a variety of different block types, but we'll only go over the most commonly used blocks. For a full list and description checkout the [Microsoft documentation](https://docs.microsoft.com/en-us/dotnet/standard/parallel-programming/dataflow-task-parallel-library#predefined-dataflow-block-types). Blocks can be split up into two different categories, processing and transporting blocks with one exception: the Action Block, which is more of a dead-end block since it only accepts input.

> Block I/O accepts tuples.

### Processing Blocks

Processing blocks are used for the processing and/or transformations of data.

#### Action Block

An Action block is used as a fire-and-forget processor block, since it only takes input. Because of this, Action blocks are used often as the end of the pipeline.

#### Transform Block

```csharp
var block = new TransformBlock<int, int>();
```

#### Transform Many Block

The Transform Many block is similar to the Transform block. The only exception is the many block will always return an `IEnumerable` of the defined return type.

```csharp
var block = new TransformManyBlock<int, int>();
```

### Transporting Blocks

Transportation blocks are used to help move and arrange data to the correct block.

#### Buffer Block

The Buffer block is just as it sounds: a place to buffer data until it is ready to be processed.

```csharp
var block = new BufferBlock<int>();
```

#### Broadcast Block

The Broadcast block is used for passing the same message to up to three different blocks.

```csharp
var block = new BroadcastBlock<int>();
```

## Building a Pipeline

Now that we have discussed the fundamental parts of TPL, let's put it to use and build a pipeline. Building a pipeline is as simple as connecting the existing blocks together in a flow and ensuring a start and end point.

> Note: if an Action Block is not at the end, the flow will not complete.

This is an example of linking the blocks together into a complete flow.

```csharp
var buffer = new BufferBlock<int>();

var multiplyTransform = new TransformBlock<int, int>();

var printBlock = new ActionBlock<int>();

var option = new DataflowLinkOptions() { PropagateCompletion = true };

// Linking the blocks together
buffer.LinkTo(multiplyTransform, option);
multiplyTransform.LinkTo(printBlock, option);
```

So as you can see from the example above, to build a pipeline you simply need to link each block together into the desired flow order and direction. What allows the data to keep being passed from one block to another is the `PropagateCompletion`, which is passed along with the data. This event ensures that a block doesn't continue without ensuring it is finished and ensures that the completion event is propagated through to the end of the pipeline. Once the flow has been defined and configured then the last piece is to fill the pipeline and wait for the results.

```csharp
// Continued from previous example

buffer.Post(value);
buffer.Complete();

printBlock.Completion.Wait();

// This example would print the values to the console instead of returning them
```

## Wrapping Up

TPL is a great choice for anyone trying to accomplish concurrent data processing, while not having to worry about managing all the stuff behind the scenes. When starting to build your own pipelines remember all you're really doing is connecting small pieces into a larger flow.

**This is the first of a series of tutorials.**
