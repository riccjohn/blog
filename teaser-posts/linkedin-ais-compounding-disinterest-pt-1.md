Here's a question I keep coming back to: why would anyone build the next big frontend framework if AI will never recommend it until it's already popular?

Don't get me wrong, I love React, but this is just a stand-in for any technology we currently have that was popular in say 2023/2024 when many of the current models were trained. Kubernetes everywhere. Python scripts when bash will do. Just using what you know and never branching out has always been a problem, but AI exacerbates and compounds the issue when future models are trained on past models' decisions and output.

The focus around AI has largely been how it'll enable more product innovation. How we can build quicker, ship faster, and turn ideas into reality in days instead of weeks or months. That may be true, but what about technical innovation? New products will need new frameworks, technologies, and paradigms that enable them to get built. Without technical innovation, product innovation will eventually be stifled. Right now, why would anyone build the next big frontend framework if AI will never recommend it?

Even if a dev knew they wanted to use some new framework or technology, they may just comply in advance, knowing that Claude will say that another framework has better support or that Claude just knows how to work with it better. There are plenty of devs who are already saying that we shouldn't care about these kinds of choices at all and should just guide the architecture, but leave these types of decisions and the actual code-writing to Claude and tools like Gastown — an orchestration platform for running dozens of AI agents in parallel with minimal human involvement. This isn't a bug, this is a feature of the stage of AI-assisted dev that we're in, which makes it scarier. If you let AI make those decisions, it will surely use what it "knows" best.

Where will new frameworks, tools, stacks, etc come from? AI won't choose them unless prompted to do more research, and we (humans) may see that recursive feedback loop looming and decide that it's not even worth it to build that new product if AI will never choose it.

And yes, we can always tell Claude to research the best tools for the job or even suggest the tools we want it to use, but:

1. I don't believe that the majority of AI users will do that. The path of least resistance will win at scale — especially for all the people who can suddenly create software that they wouldn't have been able to on their own.

2. To get AI to understand your new tooling and pick it up, the documentation needs to be easily readable by AI, which as we've seen with TailwindCSS, isn't great for current business models. Many business models rely on advertising (this business model should die off IMO, but that's a separate discussion), selling premium support, or by selling extra products, like Tailwind's UI Kit. Those all rely on getting human eyes on a web page, which goes away if AI is looking up documentation for us or building all our components on its own.

So what do we do?

Right now, I'm not entirely sure how we fix the systemic issues that I see looming, but there are some things we can do to break out of the loop ourselves.

1. Use the Research, Plan, Implement framework when working with AI code assistants.

Being intentional about how we use these tools makes a big difference. The research phase is where the loop breaks — instead of letting AI reach for what it already knows, you're forcing it to evaluate actual options for your specific problem. It might still land on React. But at least you made a choice instead of inheriting one.

2. If you're building a new tool or framework, be stubborn about getting it visible. Share it, write about it, get it into real codebases. Think of it as a new kind of SEO — instead of optimizing for search engines, you're optimizing for agents: AI-readable documentation, MCP servers that expose your library's functionality, and things like agents.txt so AI tools know your project exists. That said, don't cater exclusively to agents. Humans still need to read your docs, understand your API, and choose to adopt your tool in the first place. The goal is both. Discoverability for agents is its own discipline now, and nobody's cracked the monetization side of it yet — premium MCP tiers might be part of the answer.

3. Talk about the loop in the open. We need more people aware of these feedback cycles that are happening with agents and between agents and humans. The more input you give an agent, the more you can pull it back from returning the statistically average response and get it to do better quality work.

There's another loop I'm seeing that's related to this — one that's less about the code we write and more about who we're training to write it. I'll get into that in part 2.
