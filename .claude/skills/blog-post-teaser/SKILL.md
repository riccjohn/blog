---
name: blog-post-teaser
description: >
    Writes social media teasers for blog posts in author's voice — one for LinkedIn
    (story-driven, slightly polished, "link in the comments") and one for Bluesky (dev-focused,
    casual, includes a direct link placeholder, fits the 300-character limit). Use this skill
    whenever the user wants to promote a blog post on social media, write a LinkedIn post, write
    a Bluesky post, create teasers, or drive traffic to arcanegrain.dev. Trigger on phrases like
    "write a teaser", "LinkedIn post for my blog", "Bluesky post", "social post", "promote my
    post", "help me share this", or any request to announce or cross-post a blog article.
---

# Blog Post Teaser — arcanegrain.dev

You're writing social media teasers for John's personal dev blog posts at arcanegrain.dev.
Your job is to write copy that sounds like him, not like a generic "check out my latest post!" template.

## Who John Is

- Lead Developer focused on frontend engineering, with a background in both design and art
- Writes from a "currently figuring this out" perspective — credibility comes from specificity
  and honesty, not credentials
- Dry, self-deprecating humor embedded in asides and metaphors, not setups and punchlines
- Talks to readers like a smart peer working through the same stuff
- Never positions himself as the authority. He figured out _something_, and here's where he is now.

## The Two Teasers

### LinkedIn

**Audience**: Developers, tech leads, consultants, and curious non-technical folks who follow him
professionally. Can include people outside his immediate tech niche, but the audience skews toward
people who care about craft.

**Tone**: Still personal and story-first — not buttoned-up corporate. But slightly more composed than
Bluesky. He's not dumbing it down; he's just not assuming everyone knows what a RAG pipeline is.
Still uses contractions, short paragraphs, em-dashes. No buzzword soup. No "I'm thrilled to share."

**Structure**:

1. Hook — one-sentence confession or situation that drops the reader into the problem
2. Complication — one or two short lines that name the frustration or wrong turn
3. The turn — one line that teases the resolution without giving it all away
4. CTA — end with a simple, unforced "link in the comments" or "I just wrote about it — link in the comments"

**Length**: 2-4 short paragraphs. Short lines with breathing room between them. No walls of text.
Think: punchy sentences, lots of whitespace.

**No**: Hashtags, emojis, numbered lists of "5 things I learned," humble-brag framing.

**Gold standard reference** (existing LinkedIn teaser John wrote):

```
I spent weeks "fixing" my RAG chatbot by asking it questions manually and tweaking things until it worked.

Then I'd come back a week later and something else was broken.

Fix one question's answer, break another. Classic.

I was basically playing whac-a-mole with my own codebase, with no idea which change actually helped and which one quietly broke something else.

Turns out there's a better way. I wrote up what I learned about retrieval evals — link in the comments.
```

---

### Bluesky

**Audience**: Developers. More casual, more technical, dev-Twitter energy. Can assume they know
what TypeScript/RAG/CI/whatever is without explaining.

**Tone**: Looser. Can be a little snarkier. More "just shipped something" energy. Punchy.
Still sounds like John — still self-deprecating and honest — just at a lower register.

**Hard limit**: Bluesky posts cap at 300 characters. The URL will use roughly 25–30 of those.
Write the post text to land under ~260 characters so there's comfortable room for a link.
Count characters mentally and trim if needed — this should feel tight, not padded.

**Structure**: One tight unit. Hook → quick context → link. No paragraph breaks needed.
The whole post is 1–3 sentences max.

**Include a link placeholder**: End with `[link]` so the user knows where to drop their URL.

**No**: Hashtags unless they're ironic. No emojis unless a single one would land perfectly.

**Grammar**: Use standard capitalization and full sentences — every sentence needs a subject. Don't drop it to sound casual ("Had Claude explain..." should be "Getting Claude to explain..." or restructure the sentence). At the same time, don't mechanically start every sentence with "I" — that reads as egotistical and robotic. Vary sentence structure naturally: lead with a clause ("When I rebuilt..."), use a gerund ("Getting Claude to..."), or find a subject that isn't "I" when it fits.

---

## Process

1. **Read the blog post** the user points to (file path or pasted content).
2. **Derive the post slug** from the filename (e.g. `stop-playing-whac-a-mole-with-your-rag-chatbot.mdx`
   → `stop-playing-whac-a-mole-with-your-rag-chatbot`).
3. **Extract the hook, not the answer**:

    - The core frustration or wrong turn (what made him want to write the post at all)
    - The specific pain that makes someone think "yes, I've been there"
    - The _existence_ of a resolution — not what it is

    The teaser's job is to earn the click, not deliver the payoff. Name the problem vividly.
    Signal that there's a better way. Stop there. If someone can read the teaser and feel like
    they already got the gist — it's too much. The technique, the insight, the code, the
    specific solution — all of that lives in the post. Keep it off the teaser.

4. **Write LinkedIn first** — story arc, short paragraphs, "link in the comments" CTA.
5. **Write Bluesky second** — tight, under 260 chars, direct voice, `[link]` placeholder.
6. **Save both files** to the project root:
    - `teaser-posts/[slug]/linkedInTeaser.md`
    - `teaser-posts/[slug]/blueskyTeaser.md`
7. **Output both clearly labeled** in the conversation — no preamble, just the posts.

After outputting, offer to try a different angle or adjust the tone if needed. If you revise,
overwrite the saved files with the updated versions. Don't ask clarifying questions before
writing unless the post content hasn't been shared — just read it and go.

## Output Format

```
## LinkedIn

[post text]

---

## Bluesky

[post text — with [link] placeholder]
(X characters)
```

Include the character count for the Bluesky post (excluding the placeholder) so the user knows
how much room they have for the URL.

## AI Writing Patterns to Avoid

These are tells that the copy was written by an AI, not a person. Avoid them:

- **Em-dash overuse**: One em-dash per post is fine. Using it as a default connector ("Not X — just Y", "I did this — and then that") is an AI tic. Use a period or rewrite the sentence instead.
- **"It's not X, it's Y" constructions**: "Not solve it — teach it. There's a difference." is a classic AI rhetorical move. Just say what it is without the contrast frame.
- **Sentence fragments used as punchy emphasis**: "Classic." / "There's a difference." / "Real ones know." — these read as AI mimicking punchy writing, not actual punchy writing.
- **The dramatic pause paragraph**: A one-word or one-clause paragraph for emphasis ("Then the Pi died." on its own line for drama) — used sparingly it's fine, but AI overuses it.
- **Over-telegraphed structure**: "Here's what I mean." / "Let me explain." / "Here's the thing:" — AI often signals transitions that a real writer would just make.

## Voice Calibration

**Generic LinkedIn (avoid)**:

> "Excited to share my latest blog post about RAG evaluation! In this post, I cover recall@k,
> fixture design, and CI integration. Lots of great takeaways for anyone building AI applications.
> Link in comments 👇 #AI #MachineLearning #RAG"

**On-brand LinkedIn**:

> I spent weeks "fixing" my RAG chatbot by asking it questions manually and tweaking things until it worked.
>
> Then I'd come back a week later and something else was broken.
>
> Fix one question's answer, break another. Classic.
>
> Turns out there's a better way. I just wrote about it — link in the comments.

---

**Generic Bluesky (avoid)**:

> "New blog post! Learn how to improve your RAG chatbot retrieval with recall@k evaluation. [link]"

**On-brand Bluesky**:

> "I fixed my RAG chatbot's retrieval by breaking everything trying to fix it manually. Wrote about recall@k evals and finally having a number to point at. [link]"
