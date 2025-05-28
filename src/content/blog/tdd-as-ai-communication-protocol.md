---
title: 'TDD: The Missing Protocol for Effective AI Collaboration'
description: 'Learn how senior developers leverage Test Driven Development as a structured protocol for AI collaboration, transforming vague prompts into precise, testable requirements'
pubDate: 'May 09 2025'
heroImage: '/images/jackson-allan-M48wzb6VlEA-unsplash-16-9.jpg'
---

<!-- Photo by <a href="https://unsplash.com/@artbyjackson?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Jackson Allan</a> on <a href="https://unsplash.com/photos/brown-metal-electric-post-under-blue-sky-during-daytime-M48wzb6VlEA?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a>
       -->

Large language models (LLMs) have an inherent flaw: they seem deceptively easy to use.

That blinking cursor in the text input tempts you to interact with an LLM as if it were another human being - one that understands the context of your questions or commands, your intent, and the reasoning behind your requests. You type your prompt, hit send, and then... disappointment sets in. While it's exciting to watch it generate multiple files of code for your new project, when you actually try to run that code, it either doesn't do what you intended or doesn't run at all. As you continue prompting it to iterate on its previous response, it often goes in circles, changes direction entirely, or simply gets stuck.

The core issue is that we're asking LLMs to do too much while providing insufficient direction and context, effectively setting them up for failure. It's like the classic [PB&J experiment](https://youtu.be/FN2RM-CHkuI?t=44) where a father follows his children's instructions for making a sandwich literally. We think we're giving clear directions, but drastically underestimate how much implicit context AI lacks about the problem we're trying to solve.

What we need is a better communication protocol - one that structures our requests in a way AI tools can consistently understand and execute.

## Why AI Struggles with Large, Ambiguous Problems

Current LLMs, despite their impressive capabilities, predictably fail when faced with large, vague problems. This happens not primarily because of token limitations or technical constraints, but due to fundamental issues in how we communicate problems.

When developers ask AI to "build a complete authentication system" or "create an e-commerce checkout flow," they unknowingly set it up for failure by:

1. **Providing insufficient context**: LLMs lack the shared understanding human teams develop over time about architecture preferences, coding standards, and business requirements.

2. **Requesting solutions without boundaries**: Without clear constraints, the AI must make countless assumptions about everything from state management to error handling approaches.

3. **Omitting critical edge cases**: Complex problems contain numerous edge cases that aren't explicitly stated but would be obvious to an experienced developer familiar with the domain.

The primary challenge isn't that AI can't generate complex code — it's that humans struggle to communicate complex problems completely enough for AI to succeed. This is precisely why Test Driven Development (TDD) creates such a powerful framework: by breaking down problems into small, testable behaviors, we provide the structured context AI needs to generate useful, focused solutions rather than making broad assumptions.

## TDD: The Ideal AI Communication Protocol

[Test Driven Development](https://martinfowler.com/bliki/TestDrivenDevelopment.html) is a practice where you write tests before implementing production code. To be clear, I'm not suggesting you need to be dogmatic about this approach, nor will you need to write all tests yourself.

**TDD serves as an effective protocol for communicating your objective, constraints, and context to your AI tools.**

Writing tests first provides several key advantages:

1. **It ensures tests actually get written**: We've all promised ourselves we'd write tests after implementing features, only to skip them under deadline pressure or write vague tests that don't properly validate behavior.

2. **It breaks down problems into manageable pieces**: As you write tests, you naturally describe expected behavior and uncover edge cases. This process helps you architect better solutions, and implementing only enough code to satisfy one test at a time ensures comprehensive coverage.

3. **It documents intended behavior**: Other developers (including your future self) can understand what the code does by reading the tests. Unlike documentation that quickly becomes outdated, tests must be maintained to prevent failures in your test suite, and they live alongside your production code.

These benefits align perfectly with what AI needs to generate quality code: clear specifications, manageable scope, and explicit edge cases. By defining these through tests, we establish a language both humans and AI can understand.

## A Practical TDD Workflow with AI

Here's how this process typically unfolds:

1. **Define test descriptions**: Write descriptive test cases outlining all requirements and edge cases
2. **Implement a seed test**: Write one complete test to establish patterns and conventions
3. **Generate remaining tests**: Have AI complete the remaining test implementations
4. **Review and refine**: Verify the generated tests actually validate what matters
5. **Generate implementation code**: With clear requirements established, let AI generate the component / production code
6. **Test and iterate**: Run tests, fix failures, and refine both tests and implementation

This workflow creates a virtuous cycle where each step provides more context for the next, making the AI increasingly accurate with each iteration.

Here's an example of the first step, where I write _only_ the descriptions. It helps to think through how your code should work first.

```typescript
describe('PasswordStrengthMeter', () => {
    it.todo('allows a user to submit a password that meets all criteria')

    describe('when the password does not meet the required length', () => {
        it.todo('the Submit button is disabled')

        it.todo(
            'displays the error "Too weak: Password must be at least 8 characters" for passwords shorter than 8 characters'
        )
    })

    describe('when the password does not include special characters', () => {
        it.todo('the Submit button is disabled')

        it.todo(
            'displays the error "Password needs to include special characters (ex. !@#$%)" for passwords with at least 8 characters but no special chars'
        )
    })
})
```

At this stage, you're only writing test descriptions—no implementation code yet. Next, implement the first test to seed more information into the LLM's context:

```typescript
  it('allows a user to submit a password that meets all criteria', () => {
    render(<PasswordStrengthMeter />);
    const input = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: /submit/i });

    // Enter a valid password
    fireEvent.change(input, { target: { value: 'StrongP@ss123' } });

    // Submit button should be enabled
    expect(submitButton).not.toBeDisabled();
  });
```

You've now provided scaffolding and context, enabling the AI to fill in the remaining tests following your established pattern. For this part, I'm usually using something like [Cursor](https://www.cursor.com/) or [GitHub Copilot](https://github.com/features/copilot) to generate the new code in my files. The LLM can work effectively because you're being precise with your instructions and loading more information into its context.

Once the tests are complete, you can leverage AI to generate the React component implementation. At this point, the AI has explicit requirements, and you have automated verification that the code works correctly - eliminating guesswork and reducing manual testing.

## Benefits Beyond Better Code Generation

While improved code quality is an obvious benefit, this TDD-based approach offers additional advantages:

- **Reduced context switching**: By establishing a clear protocol, you spend less time explaining and re-explaining requirements to AI, and you can stay in your IDE if you're using tools like [Cursor](https://www.cursor.com/), [GitHub Copilot](https://github.com/features/copilot), or [Amazon Q](https://aws.amazon.com/q/)
- **Team alignment**: Tests provide a common language for both human and AI collaborators
- **Maintainable AI interactions**: The test suite serves as persistent documentation that can be reused across AI sessions

By adopting TDD as the framework for AI-assisted development, you're not only writing better code and getting all the benefits of having tests — you're establishing a powerful communication protocol between you and your AI tools. The tests you scaffold serve as clear specifications that you, product managers, and AI can all align on, dramatically reducing iterations and misunderstandings.

The goal isn't to automate away development work, but to offload mechanical aspects so you can focus on the creative and architectural decisions that truly require human expertise. When you begin your next feature by writing tests first, then leveraging AI to implement the solution, you'll experience a workflow that combines human creativity with AI efficiency—resulting in higher quality code delivered faster and with greater confidence.
